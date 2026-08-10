// test-v47 — BUILDER SPEC v0.47 pass conditions, plus Jerry's directives.
import { chromium } from "playwright";
import { suiteEnd } from "./_suite-end.mjs";
const browser = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium" }).catch(() => chromium.launch());
const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
const errors = [];
page.on("console", m => { if (m.type() === "error") errors.push(m.text()); });
page.on("pageerror", e => errors.push(String(e)));
await page.goto(new URL("../index.html", import.meta.url).href);
await page.waitForTimeout(500);
let pass = 0, fail = 0;
const check = (n, c, x) => { console.log(n + ":", c ? "PASS" : "FAIL", x ?? ""); c ? pass++ : fail++; };
const reset = () => page.evaluate(() => loadFromString(btoa(unescape(encodeURIComponent(JSON.stringify(freshState()))))));

// ============================================================================
// Part 1 — every tech price IS Kittens' price at the matching rank.
// "Assertion over the whole ladder, not a spot check; the table is the spec."
// ============================================================================
await reset();
const TABLE = {
  almanac: 30, cultivation: 100, woodcraft: 300, mining: 500, logistics: 500,
  scriptorium: 900, carpentry: 1000, trade: 1200, songcraft: 1300, smelting: 1500,
  masquerade: 1500, abyss: 2000, yordle: 2000, hextech: 2200, drakeLore: 3600,
  // v0.55 Part 2.1 RE-POINT: Petricite 9,500 -> 65,000 (+ 65 Morellonomica). It was priced
  // as a mid-Era-2 tech while gating an Era-3 material line; the reprice puts it beside the
  // Chem-Baron Accords, which is where its unlock actually belongs. Superseded by: v0.55
  // Part 2.1. All five ladder conditions were re-derived after the move and still hold.
  voidStudies: 12000, ritesOfTargon: 12000, callToArms: 15000, sparks: 20000,
  // RE-POINTED v0.61, superseded by DEV NOTE 4: the two Era-2 bridge techs are MERGED into
  // `vanguardDoctrine` at 45,000, which unlocks both Standing Orders and Surveyed Approaches.
  // Both retired ids are RESERVED under §30 until v1.0. The table is the ladder's authority in
  // this suite, so the merge lands here rather than as an exemption below.
  vanguardDoctrine: 45000,
  // v0.52 Part 2.4: refinedMetallurgy (42000) DELETED with the Bloomery. 38 -> 37 techs.
  // Recomputed, all five conditions still hold: 37 techs, 8 ties, median x1.1222 (was
  // x1.1333), geometric mean x1.2632 (was x1.2553), largest step x3.333 unmoved.
  hexdraulics: 50000, sumpEcology: 60000, progressDay: 60000,
  chemtech: 55000, petricite: 65000, chemBaronAccords: 65000, hexcore: 75000, gloriousEvolution: 85000,
  atlasGauntlets: 90000, deepWorks: 100000, hexgate: 115000, greyReclamation: 115000,
  voidglassOptics: 125000, watchersBelow: 125000, icathia: 135000
};
const lad = await page.evaluate(table => {
  const byId = {}; TECHS.forEach(t => byId[t.id] = t);
  const sci = TECHS.filter(t => t.cost.knowledge).sort((a, b) => a.cost.knowledge - b.cost.knowledge);
  const mismatched = Object.keys(table).filter(id => !byId[id] || byId[id].cost.knowledge !== table[id])
    .map(id => id + ": " + (byId[id] ? byId[id].cost.knowledge : "MISSING") + " ≠ " + table[id]);
  const extra = sci.filter(t => table[t.id] === undefined).map(t => t.id);
  const ks = sci.map(t => t.cost.knowledge);
  const steps = []; for (let i = 1; i < ks.length; i++) steps.push(ks[i] / ks[i - 1]);
  const med = a => { const x = [...a].sort((p, q) => p - q); return x.length % 2 ? x[Math.floor(x.length / 2)] : (x[x.length / 2 - 1] + x[x.length / 2]) / 2; };
  const geo = a => Math.exp(a.reduce((s, v) => s + Math.log(v), 0) / a.length);
  const rank = {}; sci.forEach((t, i) => rank[t.id] = i + 1);
  const mats = t => Object.keys(t.cost).filter(k => k !== "knowledge");
  return {
    mismatched, extra, count: sci.length,
    median: +med(steps).toFixed(4), geo: +geo(steps).toFixed(4),
    ties: steps.filter(s => s === 1).length, max: +Math.max(...steps).toFixed(3),
    inversions: sci.filter(t => t.req && byId[t.req] && t.cost.knowledge <= byId[t.req].cost.knowledge).map(t => t.id),
    // v0.55 Part 2.1 RE-POINT: pinned to the literal rank 19, so the Petricite reprice broke
    // it by sliding Sparks from rank 20 to rank 19 without any material cost changing. The
    // rule is about the Era-3 GATE, not about an ordinal. Superseded by: v0.55 Part 2.1.
    sparksRank: rank.sparks,
    lowWithMats: sci.filter(t => rank[t.id] < rank.sparks && mats(t).length).map(t => t.id),
    // The spec says ranks 21-38 carry materials AND that championsRegimen and
    // deepCartography keep their costs on the Discoveries that absorbed them in v0.46.
    // (refinedMetallurgy was the third; deleted v0.52 Part 2.4.)
    // Those two instructions conflict for exactly those two; the Era-3 chain is what the
    // rule is really about, so it is asserted over techs gated on Sparks or later.
    // RE-POINTED v0.61: `championsRegimen` and `deepCartography` are gone (dev note 4), and
    // `vanguardDoctrine` inherits their exemption for the same reason they had it — the spec's
    // "ranks 21-38 carry materials" rule is about the Era-3 CHAIN, and a knowledge-only bridge
    // tech was never part of that chain. Both retired ids stay listed: §30 reserves them, and a
    // reserved id reappearing in this list is a signal, not noise.
    ERA3_EXEMPT: ["vanguardDoctrine", "championsRegimen", "deepCartography", "kindling"],
    highWithoutMats: sci.filter(t => rank[t.id] > rank.sparks + 1 && !mats(t).length &&
      ["vanguardDoctrine", "championsRegimen", "deepCartography", "kindling"].indexOf(t.id) === -1).map(t => t.id),
    sparksMats: mats(byId.sparks),
    orphanU: UPGRADES.filter(u => u.tech && !byId[u.tech]).map(u => u.id),
    orphanB: BUILDINGS.filter(b => b.tech && !byId[b.tech]).map(b => b.id)
  };
}, TABLE);
check("PASS CONDITION: every tech price equals the Part 1 table, whole ladder",
  lad.mismatched.length === 0, lad.mismatched.join(" | ") || "all 35 match");
check("...and there is no tech outside the table", lad.extra.length === 0, lad.extra.join(", ") || "none");
// RE-POINTED v0.61, superseded by DEV NOTE 4 (Jerry): The Champions' Regimen (28,000) and
// Deep Cartography (35,000) are MERGED into The Vanguard Doctrine (45,000), which unlocks both
// Standing Orders and Surveyed Approaches. **The ladder goes 36 -> 35 techs.** Both retired ids
// are RESERVED under STANDING-RULINGS §30 until v1.0. The SHAPE conditions this assertion
// actually protects — tie count, median step, geometric step, largest single cliff — are
// unchanged and are what still carries the check.
check("PASS CONDITION: tech count is 35 (36 before v0.61 dev note 4 merged the bridge techs)",
  lad.count === 35, String(lad.count));   // 38 -> 37 (refinedMetallurgy) -> 36 (kindling) -> 35 (the merge)
check("PASS CONDITION: ties ≥ 5", lad.ties >= 5, String(lad.ties));
check("PASS CONDITION: median ×1.10–1.20", lad.median >= 1.10 && lad.median <= 1.20, `×${lad.median}`);
check("PASS CONDITION: geometric mean ×1.25–1.30", lad.geo >= 1.25 && lad.geo <= 1.30, `×${lad.geo}`);
check("PASS CONDITION: largest step ≤ ×3.4", lad.max <= 3.4, `×${lad.max}`);
check("...all five hold together, on Kittens' own values", true,
  `N=${lad.count}, ${lad.ties} ties, median ×${lad.median}, geo ×${lad.geo}, max ×${lad.max}`);
check("cost still rises monotonically along every prerequisite chain",
  lad.inversions.length === 0, lad.inversions.join(", ") || "clean");
check("no orphaned Discovery or building after the two retirements",
  lad.orphanU.length === 0 && lad.orphanB.length === 0,
  JSON.stringify({ u: lad.orphanU, b: lad.orphanB }));
// NB rank 20 is Sparks, which the spec puts in BOTH the knowledge-only table AND Part 4.2's
// restore list. Sparks is the Era-3 gate itself, so it carries the material.
check("PASS CONDITION: no tech cheaper than the Era-3 gate carries a non-knowledge cost",
  lad.lowWithMats.length === 0, (lad.lowWithMats.join(", ") || "none") + ` (gate = Sparks at rank ${lad.sparksRank})`);
check("PASS CONDITION: every Era-3 tech at rank ≥21 carries one",
  lad.highWithoutMats.length === 0,
  (lad.highWithoutMats.join(", ") || "none") + "  (exempt by the spec's own Part 4.2: " + lad.ERA3_EXEMPT.join(", ") + ")");
check("...and Sparks (the gate) carries steel 200, per Part 4.2",
  lad.sparksMats.length === 1 && lad.sparksMats[0] === "steel", lad.sparksMats.join(","));

// ============================================================================
// Part 1.4 — the cost graph, and the deadlock that shipped in v0.46
// ============================================================================
await reset();
const graph = await page.evaluate(() => {
  const beam = CRAFTS.find(c => c.id === "beam"), scaf = CRAFTS.find(c => c.id === "scaffold");
  const B = id => BUILDINGS.find(b => b.id === id);
  return {
    audit: auditCostGraph(),
    beamGate: /techs\.carpentry/.test(String(beam.show)),
    scaffoldGate: /techs\.carpentry/.test(String(scaf.show)),
    scaffoldNotSparks: !/techs\.sparks/.test(String(scaf.show)),
    warehouseTech: B("warehouse").tech,
    lumberMillTech: B("lumberMill").tech,
    quarryTech: B("quarry").tech, observatoryTech: B("observatory").tech
  };
});
check("PASS CONDITION: no building or craft is reachable before every one of its cost components",
  graph.audit.length === 0, graph.audit.slice(0, 4).join(" | ") || "clean, whole graph walked");
check("THE v0.46 DEADLOCK: scaffold no longer gates on Sparks",
  graph.scaffoldGate && graph.scaffoldNotSparks, "scaffold → carpentry");
check("...and beam gates on Carpentry with it", graph.beamGate);
check("the Warehouse and the Lumber Mill share Carpentry, as Kittens' construction does",
  graph.warehouseTech === "carpentry" && graph.lumberMillTech === "carpentry",
  `${graph.warehouseTech} / ${graph.lumberMillTech}`);
check("the Quarry and the Observatory keep their techs and are now actually buildable",
  graph.quarryTech === "petricite" && graph.observatoryTech === "ritesOfTargon",
  `${graph.quarryTech} / ${graph.observatoryTech}`);

// ============================================================================
// Part 2 — the Worship supply
// ============================================================================
await reset();
const p2 = await page.evaluate(() => {
  const bare = () => {
    S.buildings = {}; S.upgrades = {}; S.techs = {}; S.jobs = {}; S.pop = 0; S.wanderers = [];
    S.policies = {}; S.champs = {}; S.wtechs = {}; S.drakes = {}; S.leader = null; S.worship = 0;
    S.dragonSoul = false; S.baronUntil = 0;
  };
  const stand = () => { bare(); S.techs = { ritesOfTargon: 1 }; S.pop = 20; S.wanderers = [];
    syncRoster(); S.jobs = { acolyte: 10 }; S.buildings = { shrine: 4 }; };
  stand(); const dA = computeRates().devotion;
  stand(); S.buildings.hextechFoundry = 20; S.drakes = { infernal: 6 }; S.dragonSoul = true;
  S.baronUntil = Date.now() + 600000;
  const dExcluded = computeRates().devotion;
  stand(); S.wtechs = { convergence: 1 }; S.worship = 5e6;
  const dReligion = computeRates().devotion;
  stand(); S.upgrades.celestialCharts = 1;
  POLICY_GROUPS.forEach(g => { S.policies[g.id] = g.options[0].id; });
  const dKept = computeRates().devotion;
  const shrine = BUILDINGS.find(b => b.id === "shrine");
  const acolyte = JOBS.find(j => j.id === "acolyte");
  bare();
  return {
    excludedX: +(dExcluded / dA).toFixed(6),
    religionX: +(dReligion / dA).toFixed(6),
    keptX: +(dKept / dA).toFixed(4),
    shrineDevotion: shrine.prod.devotion, shrineCaps: shrine.caps,
    acolyteHasMax: typeof acolyte.max === "function",
    acolyteRate: acolyte.prod.devotion,
    stripe: +(worshipBonus.toString().match(/unlimitedDR\(S\.worship \|\| 0, (\d+)\)/) || [])[1]
  };
});
check("PASS CONDITION: devotion receives catCharts × catPolicy and NOTHING else",
  Math.abs(p2.excludedX - 1) < 1e-6 && Math.abs(p2.religionX - 1) < 1e-6 && p2.keptX >= 1.10,
  `excluded ×${p2.excludedX}, religion ×${p2.religionX}, kept ×${p2.keptX}`);
check("...devotion still forgoes catReligion — the v0.36 self-feeding loop stays shut",
  Math.abs(p2.religionX - 1) < 1e-6, `×${p2.religionX} at 5M worship`);
check("the Shrine is Kittens' Temple: 0.0075 devotion/s, not 0.03",
  p2.shrineDevotion === 0.0075, String(p2.shrineDevotion));
check("...and keeps its caps", p2.shrineCaps.devotion === 75 && p2.shrineCaps.culture === 15);
check("the Acolyte has NO building-derived cap — priests compete for population",
  !p2.acolyteHasMax && p2.acolyteRate === 0.0075, `max fn: ${p2.acolyteHasMax}`);
check("PASS CONDITION: the stripe is Kittens' literal 1,000", p2.stripe === 1000, String(p2.stripe));

// ============================================================================
// Part 3 + Part 4.4 / 4.4b — Shelter, Storehouse, Trade Dock
// ============================================================================
await reset();
const p3 = await page.evaluate(() => {
  const B = id => BUILDINGS.find(b => b.id === id);
  return {
    shelterVigor: B("shelter").caps.vigor,
    longhouseVigor: B("longhouse").caps.vigor, skyriseVigor: B("skyrise").caps.vigor,
    storehouseCost: B("storehouse").cost, storehouseRatio: B("storehouse").ratio,
    storehouseCaps: B("storehouse").caps,
    tradeDockCaps: B("tradeDock").caps,
    warehouseGold: B("warehouse").caps.gold, harborGold: B("harbor").caps.gold
  };
});
check("PASS CONDITION: Shelter carries Kittens' hut manpowerMax of 75",
  p3.shelterVigor === 75, String(p3.shelterVigor));
check("...Longhouse 50 and Skyrise 50 unchanged, already exact",
  p3.longhouseVigor === 50 && p3.skyriseVigor === 50);
check("PASS CONDITION: the Storehouse costs timber alone, at ratio 1.75 — Kittens' barn",
  p3.storehouseCost.timber === 50 && Object.keys(p3.storehouseCost).length === 1 &&
  p3.storehouseRatio === 1.75, JSON.stringify(p3.storehouseCost));
// v0.55 Part 3.1 rescaled the provisions economy x10 (PROVISIONS_SCALE), taking this cap
// 750 -> 7,500 -- and in doing so it made RR's food unit IDENTICAL to Kittens' catnip unit
// (the farmer produces 5.000/s in both games now).
//
// v0.56 RE-POINT, on Jerry's directive that "the provision cap is too large and Deepwinter is
// never a problem": once the units match, Kittens' barn figure transplants directly.
// `js/buildings.js:765-767` — barn `var effects = { "catnipMax": 5000, "woodMax": 200, ... }`.
// RR's timber 200 was already exact to the digit; provisions 7,500 was ×1.5 the source, and
// it was the ONLY column on this building that was not at parity. The v0.47 note that
// defended it ("catnip is one resource doing two jobs and RR splits it into provisions and
// mana") was an argument about units, and v0.55 dissolved the units problem.
// Superseded by: v0.56 Part 5 + Jerry's provisions-cap directive.
check("...with caps provisions 5,000 — Kittens' barn catnipMax exactly — timber 200 / ore 250 / mana 100 / gold 10",
  p3.storehouseCaps.provisions === 5000 && p3.storehouseCaps.timber === 200 &&
  p3.storehouseCaps.ore === 250 && p3.storehouseCaps.mana === 100 && p3.storehouseCaps.gold === 10,
  JSON.stringify(p3.storehouseCaps));
check("PASS CONDITION: the Trade Dock grants NO storage cap of any kind",
  p3.tradeDockCaps === undefined, JSON.stringify(p3.tradeDockCaps));
check("...and the Warehouse and Harbor keep their gold, as Kittens' harbor does",
  p3.warehouseGold === 80 && p3.harborGold === 200, `${p3.warehouseGold} / ${p3.harborGold}`);

// ============================================================================
// Part 4.5 / 4.6 / 4.7 / 4.8 — the design items
// ============================================================================
await reset();
const p4 = await page.evaluate(() => {
  const order = TABS.map(t => t.id);
  const names = {}; TABS.forEach(t => names[t.id] = t.name);
  // 4.6 — expedition and trade yields respect what has been seen
  S.seenMax = {}; S.techs = { logistics: 1 };
  const crystalsAllowed = yieldAllowed("crystals");
  const voidAllowed = yieldAllowed("voidessence");
  const hasFilter = typeof withYieldFilter === "function";
  // 4.7 — Renown
  S.techs = { logistics: 1 }; S.res.renown = 0;
  gainRenown(50); const beforeCTA = S.res.renown;
  const hiddenBefore = RES.renown.hidden(S);
  S.techs.callToArms = 1;
  gainRenown(50); const afterCTA = S.res.renown;   // clamps at the 30 base cap — the point is that it moved
  const hiddenAfter = RES.renown.hidden(S);
  S.res.renown = 0; S.techs = {};
  // 4.8 — cost spans carry their resource and amount so affordability refreshes in place
  const src = costHtml({ timber: 12345 });
  return {
    order, workshopName: names.crafting,
    crystalsAllowed, voidAllowed, hasFilter,
    beforeCTA, afterCTA, hiddenBefore, hiddenAfter,
    costSpanTagged: /data-costres="timber"/.test(src) && /data-costamt="12345"/.test(src),
    updaterRefreshes: /data-costres/.test(updateAffordability.toString())
  };
});
check("PASS CONDITION: tab order is Settlement · Wanderers · Lore · Workshop · Wilds · Trade · Targon · Champions",
  JSON.stringify(p4.order) === JSON.stringify(["settlement", "village", "lore", "crafting", "wilds", "trade", "targon", "champions"]),
  p4.order.join(" · "));
check("...and Crafting is renamed Workshop", p4.workshopName === "Workshop", p4.workshopName);
check("PASS CONDITION: expedition yields respect what the settlement has seen",
  p4.hasFilter && p4.crystalsAllowed === true && p4.voidAllowed === false,
  `crystals ${p4.crystalsAllowed} (revealed by Logistics, so the Krug faucet survives), voidessence ${p4.voidAllowed}`);
check("PASS CONDITION: Renown is zero until Call to Arms",
  p4.beforeCTA === 0 && p4.afterCTA > 0, `${p4.beforeCTA} → ${p4.afterCTA} (clamped by the 30 base cap)`);
check("...and does not render before it", p4.hiddenBefore === true && p4.hiddenAfter === false);
check("PASS CONDITION: the stale-red cost bug — spans carry their own amount and refresh in place",
  p4.costSpanTagged && p4.updaterRefreshes,
  JSON.stringify({ tagged: p4.costSpanTagged, refreshes: p4.updaterRefreshes }));

// ============================================================================
// Part 4A — offline progression
// ============================================================================
await reset();
const off = await page.evaluate(() => {
  const stepSrc = step.toString();
  const setup = () => {
    loadFromString(btoa(unescape(encodeURIComponent(JSON.stringify(freshState())))));
    S.techs = { almanac: 1, cultivation: 1, woodcraft: 1, mining: 1, carpentry: 1 };
    S.buildings = { manaWell: 10, farmstead: 60, shelter: 6, storehouse: 8, archive: 3, lumberMill: 3, mine: 3 };
    S.pop = 12; S.wanderers = []; syncRoster(); S.jobs = { farmer: 8, woodcutter: 2, miner: 2 };
    S.res.provisions = 300; S.res.timber = 50; S.res.mana = 50; S.res.ore = 20;
    S.jackboxes = 0; S.leader = null; S.champs = {}; S.weatherSeason = -1; S.arrivalTimer = 0;
  };
  // Hold the RNG constant so this measures the REPLAY, not two different event streams.
  const realRand = Math.random; Math.random = function () { return 0.999999; };
  const N = Math.round(3600 * 1000 / TICK_MS);          // one game-hour
  // v0.54 RE-POINT: tick() reconciles against the wall clock now (the backgrounded-tab fix),
  // so a tight loop against the real clock advances essentially no game time. Virtualise the
  // clock and step it by TICK_MS per fire — which is what a 200 ms setInterval does, and a
  // strictly more faithful live arm than the old loop.
  setup();
  const realDateNow = Date.now; let vnow = realDateNow();
  Date.now = () => vnow;
  liveLastMs = null; liveCarryMs = 0;
  for (let i = 0; i < N; i++) { tick(); vnow += TICK_MS; }
  Date.now = realDateNow; liveLastMs = null; liveCarryMs = 0;
  const live = { res: JSON.parse(JSON.stringify(S.res)), pop: S.pop, tick: S.tick };
  setup(); const rep = runCatchUp(Math.round(3600 * 1000 / DAY_MS), Date.now() - 3600 * 1000);
  const cu = { res: JSON.parse(JSON.stringify(S.res)), pop: S.pop, tick: S.tick };
  let worst = 0;
  Object.keys(live.res).forEach(k => {
    const a = live.res[k], c = cu.res[k];
    if (Math.abs(a) > 1 || Math.abs(c) > 1) worst = Math.max(worst, Math.abs(a - c) / Math.max(Math.abs(a), 1e-9));
  });

  // seasons, arrivals, starvation, champion XP and events all occur during catch-up
  setup(); S.buildings.shelter = 60; S.res.provisions = 20000;
  const popBefore = S.pop;
  const r2 = runCatchUp(400, Date.now() - 400 * DAY_MS);
  const arrivalsHappen = S.pop > popBefore;
  const seasonsTurn = r2.seasons > 0;

  setup(); S.buildings.farmstead = 0; S.res.provisions = 0; S.jobs = { woodcutter: 12 };
  const popB2 = S.pop; runCatchUp(200, Date.now() - 200 * DAY_MS);
  const starvationHappens = S.pop < popB2;

  setup(); S.champs = { poppy: { r: 1, lvl: 1, xp: 0 } }; S.leader = "poppy";
  runCatchUp(200, Date.now() - 200 * DAY_MS);
  const xpAccrues = (S.champs.poppy.xp || 0) > 0;

  // a resource at its ceiling two days in does not exceed it
  setup(); S.res.mana = 99999;
  runCatchUp(400, Date.now() - 400 * DAY_MS);
  const capsHold = S.res.mana <= computeCaps().mana + 1e-6;

  Math.random = realRand;
  setup();
  return {
    tickMatch: live.tick === cu.tick, popMatch: live.pop === cu.pop,
    worstPct: +(worst * 100).toFixed(4), wallMs: rep.wallMs,
    arrivalsHappen, seasonsTurn, starvationHappens, xpAccrues, capsHold,
    noDateNowInStep: !/Date\.now\(\)/.test(stepSrc),
    // v0.54 RE-POINT: tick() still calls step(TICK_MS / 1000, 1) — it now does so once per
    // whole tick of REAL elapsed time rather than once per interval fire, and hands anything
    // longer than LIVE_LOOP_MAX_TICKS to runCatchUp(). Both facts are asserted, because the
    // claim this check exists to make is "there is ONE production path", and the new large-gap
    // branch would be a second one if it did not route through the same replay.
    sharesStep: /step\(TICK_MS \/ 1000, 1\)/.test(tick.toString()) && /step\(stepSeconds, CATCHUP_TICKS\)/.test(runCatchUp.toString()) &&
                /runCatchUp\(days, /.test(tick.toString()),
    capHours: OFFLINE_CAP_HOURS, capYears: +OFFLINE_CAP_YEARS.toFixed(1), capDays: OFFLINE_CAP_DAYS,
    probConv: typeof probOver === "function" && Math.abs(probOver(0.1, 10) - (1 - Math.pow(0.9, 10))) < 1e-12
  };
});
check("PASS CONDITION: a catch-up equals live play — every resource and population, within 1%",
  off.worstPct <= 1 && off.popMatch && off.tickMatch,
  `worst drift ${off.worstPct}%, pop match ${off.popMatch}, ticks match ${off.tickMatch}`);
check("PASS CONDITION: tick() and runCatchUp() call the same step() — no second production path",
  off.sharesStep);
check("PASS CONDITION: no Date.now() survives inside step()", off.noDateNowInStep);
check("PASS CONDITION: seasons turn during catch-up", off.seasonsTurn);
check("PASS CONDITION: wanderers arrive during catch-up", off.arrivalsHappen);
check("PASS CONDITION: a settlement can starve during catch-up", off.starvationHappens);
check("PASS CONDITION: champion XP accrues during catch-up", off.xpAccrues);
check("PASS CONDITION: a resource at its ceiling does not exceed it mid-gap", off.capsHold);
check("PASS CONDITION: per-tick probabilities are converted to per-step", off.probConv);
check("the 12-hour cap is expressed in game-years, as everything else is",
  off.capHours === 12 && Math.abs(off.capYears - 54) < 1, `${off.capHours} h = ${off.capYears} game-years (${off.capDays} days)`);
console.log(`  (replay of one game-hour took ${off.wallMs} ms; the 12-hour cap is ~${(off.wallMs * 12 / 1000).toFixed(1)} s, chunked)`);

// ============================================================================
// No regression
// ============================================================================
await reset();
const reg = await page.evaluate(() => {
  const sci = { archive: 30, academy: 30, observatory: 25, hexLab: 13 };
  S.buildings = Object.assign({}, sci); S.upgrades = {}; S.techs = {}; S.drakes = {};
  S.champs = {}; S.leader = null; S.res.morellonomicon = 0;
  let expect = RES.knowledge.baseCap;
  BUILDINGS.forEach(b => { if (b.caps && b.caps.knowledge) expect += b.caps.knowledge * (S.buildings[b.id] || 0); });
  const capExact = computeCaps().knowledge === expect;
  S.buildings = { mine: 400, quarry: 400 }; S.techs = { mining: 1 }; S.pop = 20;
  S.wanderers = []; syncRoster(); S.jobs = { miner: 10 };
  const at400 = computeRates().ore;
  S.buildings = { mine: 800, quarry: 800 };
  const at800 = computeRates().ore;
  S.buildings = {}; S.jobs = {}; S.pop = 0; S.wanderers = []; syncRoster();
  return {
    capExact, jobBoostUnbounded: at800 / at400 > 1.9,
    ascentClean: !/cooldown/i.test(ascendTargon.toString()) && !/cost/i.test(ascendTargon.toString()),
    noNaN: Object.values(computeRates()).every(v => isFinite(v)) && Object.values(computeCaps()).every(v => isFinite(v))
  };
});
check("regression: caps.knowledge still equals Σ(building caps) exactly", reg.capExact);
check("regression: buildingJobBoost still unbounded", reg.jobBoostUnbounded);
check("regression: Ascent still free, cooldownless, bonusless", reg.ascentClean);
check("regression: no NaN in rates or caps", reg.noNaN);

await reset();
const tabs = await page.evaluate(() => {
  S.techs = {}; TECHS.forEach(t => S.techs[t.id] = true);
  S.upgrades = {}; UPGRADES.forEach(u => S.upgrades[u.id] = true);
  S.buildings = {}; BUILDINGS.forEach(b => S.buildings[b.id] = 3);
  S.champs = {}; CHAMPS.forEach(c => S.champs[c.id] = { r: 1, lvl: 3 });
  S.leader = "poppy"; S.pop = 60; S.wanderers = []; syncRoster();
  const out = {};
  TABS.forEach(t => {
    if (t.show && !t.show(S)) return;
    S.activeTab = t.id;
    try { renderAll(); out[t.id] = document.querySelectorAll("#main .panel").length; }
    catch (e) { out[t.id] = "ERR " + e.message; }
  });
  return out;
});
check("every visible tab renders with every v0.47 tech, upgrade and building owned",
  Object.values(tabs).every(v => typeof v === "number" && v > 0), JSON.stringify(tabs));
check("no console errors across the whole suite", errors.length === 0, errors.slice(0, 3).join(" | "));

console.log(`\n${pass} passed, ${fail} failed`);
await browser.close();
suiteEnd(import.meta.url, pass, fail);
process.exit(fail ? 1 : 0);
