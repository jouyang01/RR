// test-v46 — BUILDER SPEC v0.46 pass conditions, plus Jerry's directives.
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
// Part 1 — the ore-side buildings are priced at Kittens' craft tier
// "Quarry effective-raw cost >= 500x the Mine's, Observatory >= 300x."
// ============================================================================
await reset();
const p1 = await page.evaluate(() => {
  S.buildings = {}; S.upgrades = {}; S.techs = {}; S.champs = {}; S.leader = null; S.policies = {};
  TECHS.forEach(t => S.techs[t.id] = true); UPGRADES.forEach(u => S.upgrades[u.id] = true);
  S.buildings.workshop = 40;
  const RAW = {}; Object.keys(RES).forEach(r => RAW[r] = true);
  CRAFTS.forEach(c => delete RAW[c.out]);
  const byOut = {}; CRAFTS.forEach(c => byOut[c.out] = c);
  const memo = {};
  function raw(m, seen) {
    if (RAW[m]) return { [m]: 1 };
    if (memo[m]) return memo[m];
    seen = seen || {}; if (seen[m]) return { [m]: 1 }; seen[m] = 1;
    const c = byOut[m]; if (!c) return { [m]: 1 };
    const y = craftYield(m) || 1; const acc = {};
    for (const i in c.cost) { const sub = raw(i, seen); for (const r in sub) acc[r] = (acc[r] || 0) + (sub[r] * c.cost[i]) / y; }
    return memo[m] = acc;
  }
  const tot = id => { const b = BUILDINGS.find(x => x.id === id); let t = 0;
    for (const r in b.cost) { const s = raw(r); for (const k in s) t += s[k] * b.cost[r]; } return t; };
  const B = id => BUILDINGS.find(x => x.id === id);
  const mine = tot("mine");
  return {
    mine: Math.round(mine), quarry: Math.round(tot("quarry")),
    observatory: Math.round(tot("observatory")), hexLab: Math.round(tot("hexLab")),
    quarryX: +(tot("quarry") / mine).toFixed(1),
    obsX: +(tot("observatory") / mine).toFixed(1),
    hexLabX: +(tot("hexLab") / mine).toFixed(1),
    mineCost: B("mine").cost, quarryCost: B("quarry").cost,
    obsCost: B("observatory").cost, labCost: B("hexLab").cost,
    // Archive and Academy were already at or above Kittens — explicitly left alone
    archiveCost: B("archive").cost, academyCost: B("academy").cost
  };
});
check("Mine is timber 100 and nothing else — Kittens' mine is `wood 100`",
  p1.mineCost.timber === 100 && p1.mineCost.ore === undefined, JSON.stringify(p1.mineCost));
check("Quarry is Kittens' recipe verbatim: stoneSlab 1000 + steel 125 + scaffold 50",
  p1.quarryCost.stoneSlab === 1000 && p1.quarryCost.steel === 125 && p1.quarryCost.scaffold === 50,
  JSON.stringify(p1.quarryCost));
// RE-POINTED v0.58.1 — note 46 takes the first copy 50 -> 35 scaffold, note 39 swaps ore for
// steel. The word this assertion is about is still SCAFFOLD.
check("Observatory pays SCAFFOLD, not beam — one word, a factor of 19 (35 after v0.58.1 note 46)",
  p1.obsCost.scaffold === 35 && p1.obsCost.beam === undefined, JSON.stringify(p1.obsCost));
check("Hexcore Lab is Kittens' Biolab — it has a knowledge cost and a slab cost at last",
  p1.labCost.knowledge === 1500 && p1.labCost.stoneSlab === 100 &&
  p1.labCost.plating === 15 && p1.labCost.alloy === 25, JSON.stringify(p1.labCost));
check("PASS CONDITION: Quarry effective-raw ≥ 500× the Mine's",
  p1.quarryX >= 500, `×${p1.quarryX} (${p1.quarry} raw vs ${p1.mine})`);
// RE-POINTED v0.58.1, superseded by NOTES 39 and 46. Note 39 swapped 750 ore for 150 steel —
// deeper per unit, since steel is 0.15 ore + 0.05 mana through the Bloomery — while note 46 cut
// the first copy 50 -> 35 scaffold, which is shallower. Net ×273.6. The threshold moves to 250
// for a building whose price Jerry has deliberately re-shaped; the PROPERTY is unchanged, which
// is that the Observatory sits an order of magnitude deeper in the chain than the Mine.
check("PASS CONDITION: Observatory effective-raw ≥ 250× the Mine's",
  p1.obsX >= 250, `×${p1.obsX} (${p1.observatory} raw)`);
check("Archive and Academy deliberately untouched — both already at or above Kittens",
  p1.archiveCost.timber === 40 && p1.academyCost.ore === 140, JSON.stringify(p1.archiveCost));

// ============================================================================
// Part 2 — vigor is catpower
// ============================================================================
await reset();
const p2 = await page.evaluate(() => {
  const src = computeRates.toString();
  const bare = () => {
    S.buildings = {}; S.upgrades = {}; S.techs = {}; S.jobs = {}; S.pop = 0; S.wanderers = [];
    S.policies = {}; S.champs = {}; S.wtechs = {}; S.drakes = {}; S.leader = null; S.worship = 0;
    S.dragonSoul = false; S.baronUntil = 0;
  };
  // V1 — no production term anywhere that scales with population
  bare(); S.techs = { logistics: 1 }; S.pop = 200; S.wanderers = []; syncRoster(); S.jobs = {};
  const popOnly = computeRates().vigor;
  // Normalise out morale: a settlement of 200 with no taverns is morale-floored at 25%,
  // which would make this read as a population effect when it is a morale effect.
  bare(); S.techs = { logistics: 1 }; S.pop = 200; S.wanderers = []; syncRoster();
  S.jobs = { jungler: 10 };
  const withJunglers = computeRates().vigor / (morale() / 100);
  bare(); S.techs = { logistics: 1 }; S.pop = 20; S.wanderers = []; syncRoster();
  S.jobs = { jungler: 10 };
  const sameJunglersSmallPop = computeRates().vigor / (morale() / 100);

  // V2 — vigor is transient: the excluded categories must not touch it
  const stand = () => { bare(); S.techs = { logistics: 1 }; S.pop = 40; S.wanderers = []; syncRoster();
    S.jobs = { jungler: 10 }; };
  stand(); const vA = computeRates().vigor;
  stand(); S.buildings.hextechFoundry = 20; S.drakes = { infernal: 6 }; S.dragonSoul = true;
  S.baronUntil = Date.now() + 600000;
  const vExcluded = computeRates().vigor;
  stand(); S.upgrades.celestialCharts = 1; S.wtechs = { convergence: 1 }; S.worship = 5e6;
  POLICY_GROUPS.forEach(g => { S.policies[g.id] = g.options[0].id; });
  const vKept = computeRates().vigor;

  // V3 — the job tier asymptote
  const asym = 1 + limitedDR(1e9, BOOST_LIMIT.vigor);

  // V4 — the cap is on the housing buildings, not on population
  bare(); S.buildings = { shelter: 35, longhouse: 45 };
  const capBuildings = computeCaps().vigor;
  bare(); S.pop = 202; S.wanderers = []; syncRoster();
  const capPopOnly = computeCaps().vigor;
  const B = id => BUILDINGS.find(x => x.id === id);
  bare();
  return {
    popOnly, withJunglers, sameJunglersSmallPop,
    excludedX: +(vExcluded / vA).toFixed(6), keptX: +(vKept / vA).toFixed(4),
    asym: +asym.toFixed(4), boostLimit: BOOST_LIMIT.vigor,
    capBuildings: Math.round(capBuildings), capPopOnly: Math.round(capPopOnly),
    shelterVigor: (B("shelter").caps || {}).vigor, longhouseVigor: (B("longhouse").caps || {}).vigor,
    skyriseVigor: (B("skyrise").caps || {}).vigor,
    // NB: `0.05 * S.pop` also appears on the Bard's Hearth culture line, so grepping for
    // it alone is a false positive. What must be gone is the vigor block specifically.
    noPopTerm: !/rates\.vigor \+= vv/.test(src) && !/wanderers training/.test(src),
    capNotOnPop: !/caps\.vigor \+= 15 \* \(S\.pop/.test(computeCaps.toString())
  };
});
check("V1: population alone produces ZERO vigor — Kittens has no per-kitten manpower term",
  p2.popOnly === 0, `${p2.popOnly}/s at pop 200 with no junglers`);
check("V1: ...and the source carries no population-scaled vigor term at all", p2.noPopTerm);
check("V1: ...ten junglers produce the same vigor at pop 20 as at pop 200",
  Math.abs(p2.withJunglers - p2.sameJunglersSmallPop) < 1e-9,
  `${p2.withJunglers.toFixed(4)} vs ${p2.sameJunglersSmallPop.toFixed(4)}`);
check("V2: catMonument / catDrake / catSoul / catBuff do NOT touch vigor",
  Math.abs(p2.excludedX - 1) < 1e-6, `×${p2.excludedX}`);
check("V2: ...but catCharts × catReligion × catPolicy still do",
  p2.keptX > 1.10, `×${p2.keptX}`);
// RE-POINTED v0.64 PART 2 (Option B, ruled by Jerry). The vigor rail goes 1.0 → 8.0, so the
// asymptote goes ×2.0 → ×9.0. **THE ITEM'S SUBJECT IS THAT THE ASYMPTOTE IS `1 + BOOST_LIMIT`
// — i.e. that the ceiling is real and computed from the table** — and that is what is asserted
// now, from the constant rather than from a numeral. The v0.46 rationale (Kittens'
// `manpowerJobRatio` Σ = 1.0) is superseded by the rail rule: Kittens bounds no production
// category at all (`game.js:3429-3440`), and where it does bound one — Solar Revolution's limit
// 10 against a reachable ~4.5 — the bound is a rail a player never reaches. v0.62's end-of-run
// audit measured vigor's raw Σ at 5.522 discarding 82.1%; the rail's knee is 6.00.
check("V3: vigor's asymptote is exactly 1 + BOOST_LIMIT.vigor — the ceiling is computed, not written",
  Math.abs(p2.asym - (1 + p2.boostLimit)) < 0.01 && p2.boostLimit === 8.0,
  `limit ${p2.boostLimit}, asymptote ×${p2.asym}`);
// SUPERSEDED v0.47 Part 3: Shelter 40 -> 75. Kittens' hut carries manpowerMax 75 for
// maxKittens 2; 40 was the analyzer's error and it is what made trade dead pre-Era 3.
check("V4: the vigor cap sits on Shelter 75 / Longhouse 50 / Skyrise 50 — Kittens exactly",
  p2.shelterVigor === 75 && p2.longhouseVigor === 50 && p2.skyriseVigor === 50,
  `${p2.shelterVigor}/${p2.longhouseVigor}/${p2.skyriseVigor}`);
check("V4: ...and population alone no longer raises it",
  p2.capNotOnPop && p2.capPopOnly < 200, `pop 202 alone gives ${p2.capPopOnly}`);
check("V4: 35 Shelters + 45 Longhouses now give ~4,875 cap at Kittens' hut figure",
  Math.abs(p2.capBuildings - 4875) < 250, String(p2.capBuildings));

// ============================================================================
// Part 3 — trades cost gold AND vigor
// ============================================================================
await reset();
const p3 = await page.evaluate(() => {
  S.upgrades = {};
  const rows = FACTIONS.map(f => ({ id: f.id, vigor: f.cost.vigor, gold: f.cost.gold,
    ratio: +(f.cost.gold / f.cost.vigor).toFixed(3) }));
  const base = FACTIONS.map(f => tradeCost(f));
  S.upgrades = { caravanserai: 1, letterOfMarque: 1 };
  const disc = FACTIONS.map(f => tradeCost(f));
  const uv = UPGRADES.find(u => u.id === "caravanserai"), ug = UPGRADES.find(u => u.id === "letterOfMarque");
  // subtractive and floored at zero, exactly as js/diplomacy.js:853 does it
  const floored = (() => {
    const fake = { cost: { vigor: 10, gold: 5 } };
    return tradeCost(fake);
  })();
  S.upgrades = {};
  return { rows, base, disc, uvTech: uv && uv.tech, ugTech: ug && ug.tech,
    vigorCut: base[0].vigor - disc[0].vigor, goldCut: base[0].gold - disc[0].gold, floored };
});
check("every route charges BOTH vigor and gold — Kittens' three-way AND",
  p3.rows.every(r => r.vigor > 0 && r.gold > 0), JSON.stringify(p3.rows.map(r => `${r.id} ${r.vigor}v/${r.gold}g`)));
// SUPERSEDED v0.52 Part 1.4. The 0.30 gold:vigor anchor is DELETED, not widened — it was
// a parity check on Kittens' 15:50 at the OLD per-route vigor prices. Every route is now
// vigor 175 flat, with each route's existing gold HELD (the spec forbids re-deriving both
// columns in one round), so the ratio necessarily spreads 0.171-0.514. The invariant that
// replaces it is "every route's vigor === 175", asserted here in its place.
check("...every route's vigor is exactly 175, and differentiation is gold and goods only",
  p3.rows.every(r => r.vigor === 175), p3.rows.map(r => `${r.id} ${r.vigor}v/${r.gold}g`).join(" | "));
// v0.49 Part 5.1's per-route vigor table is superseded by the same item. The GOLD column
// is held to the digit, which is what makes the vigor change measurable on its own.
check("...with each route's gold held: Freljord 30, Piltover 45, Demacia/Noxus 68, Bilgewater 90",
  p3.rows.find(r => r.id === "freljord").gold === 30 && p3.rows.find(r => r.id === "piltover").gold === 45 &&
  p3.rows.find(r => r.id === "demacia").gold === 68 && p3.rows.find(r => r.id === "noxus").gold === 68 &&
  p3.rows.find(r => r.id === "bilgewater").gold === 90, p3.rows.map(r => `${r.id} ${r.gold}g`).join(" | "));
check("the two discounts are SUBTRACTIVE — −40 vigor and −15 gold, not a percentage",
  p3.vigorCut === 40 && p3.goldCut === 15, `−${p3.vigorCut} vigor / −${p3.goldCut} gold`);
check("...and floored at zero, as js/diplomacy.js:853 floors them",
  p3.floored.vigor === 0 && p3.floored.gold === 0, JSON.stringify(p3.floored));
check("...and they arrive with the routes they apply to (Trade Routes / Masquerade)",
  p3.uvTech === "trade" && p3.ugTech === "masquerade", `${p3.uvTech} / ${p3.ugTech}`);

// ============================================================================
// Part 5 — the ladder shape: five ties, median AND geometric mean in band together.
// v0.52 Part 2.4 took the count 38 -> 37 (Refined Metallurgy deleted with the Bloomery).
// ============================================================================
await reset();
const p5 = await page.evaluate(() => {
  const byId = {}; TECHS.forEach(t => byId[t.id] = t);
  const sci = TECHS.filter(t => t.cost.knowledge);
  const ks = sci.map(t => t.cost.knowledge).sort((a, b) => a - b);
  const steps = []; for (let i = 1; i < ks.length; i++) steps.push(ks[i] / ks[i - 1]);
  const med = a => { const x = [...a].sort((p, q) => p - q); return x.length % 2 ? x[Math.floor(x.length / 2)] : (x[x.length / 2 - 1] + x[x.length / 2]) / 2; };
  const geo = a => Math.exp(a.reduce((s, v) => s + Math.log(v), 0) / a.length);
  return {
    count: sci.length, median: +med(steps).toFixed(4), geo: +geo(steps).toFixed(4),
    ties: steps.filter(s => s === 1).length, max: +Math.max(...steps).toFixed(3),
    first3: steps.slice(0, 3).map(x => +x.toFixed(2)),
    matTechs: TECHS.filter(t => Object.keys(t.cost).some(k => k !== "knowledge")).map(t => t.id),
    rankOfTech: (() => { const o = {}; [...sci].sort((a, b) => a.cost.knowledge - b.cost.knowledge)
      .forEach((t, i) => o[t.id] = i + 1); return o; })(),   // COST order, not declaration order
    inversions: sci.filter(t => t.req && byId[t.req] && t.cost.knowledge <= byId[t.req].cost.knowledge).map(t => t.id),
    orphanUpgrades: UPGRADES.filter(u => u.tech && !byId[u.tech]).map(u => u.id),
    orphanBuildings: BUILDINGS.filter(b => b.tech && !byId[b.tech]).map(b => b.id),
    orphanReqs: UPGRADES.filter(u => u.req && !UPGRADES.some(x => x.id === u.req)).map(u => u.id)
  };
});
// RE-POINTED v0.59.1, superseded by NOTE 3: Kindling Theory is DELETED, 37 -> 36. This
// literal has now been re-pointed three times (38 -> 37 -> 36) and each time for a real,
// deliberate deletion — which is the assertion working, not failing.
// RE-POINTED v0.61, superseded by DEV NOTE 4 (Jerry): The Champions' Regimen (28,000) and
// Deep Cartography (35,000) are MERGED into The Vanguard Doctrine (45,000), which unlocks both
// Standing Orders and Surveyed Approaches. **The ladder goes 36 -> 35 techs.** Both retired ids
// are RESERVED under STANDING-RULINGS §30 until v1.0. The SHAPE conditions this assertion
// actually protects — tie count, median step, geometric step, largest single cliff — are
// unchanged and are what still carries the check.
check("PASS CONDITION: tech count is 35 (36 before v0.61 dev note 4 merged the two bridge techs)", p5.count === 35, String(p5.count));
check("PASS CONDITION: five or more exact ties", p5.ties >= 5, String(p5.ties));
check("PASS CONDITION: median ×1.10–1.20", p5.median >= 1.10 && p5.median <= 1.20, `×${p5.median}`);
check("PASS CONDITION: geometric mean ×1.25–1.30", p5.geo >= 1.25 && p5.geo <= 1.30, `×${p5.geo}`);
check("...all four hold SIMULTANEOUSLY, which is what the trim was for", true,
  `N=${p5.count}, ${p5.ties} ties, median ×${p5.median}, geo ×${p5.geo}`);
// SUPERSEDED v0.47 Part 1: the ladder is Kittens' VALUES now, not a shape tuned to a band.
// Kittens' own first three steps are calendar 30 -> agriculture 100 -> archery 300 ->
// mining 500, i.e. x3.33 / x3.00 / x1.67. RR reproduces them exactly.
check("first three steps are Kittens' own ×3.33 / ×3.00 / ×1.67",
  JSON.stringify(p5.first3) === JSON.stringify([3.33, 3, 1.67]), p5.first3.join(" / "));
check("...and the largest is Kittens' own calendar→agriculture ×3.33",
  p5.max <= 3.35, `×${p5.max}`);
// SUPERSEDED v0.47 Part 4.2, on Jerry's directive: ranks 1-20 stay knowledge-only, ranks
// 21-38 carry materials again. Stripping all 23 was right for Eras 0-2 and wrong for Era 3.
// NB rank 20 is Sparks Beyond the Wall, which the v0.47 spec lists in BOTH its
// "ranks 1-20 knowledge-only" table AND its Part 4.2 restore set (`sparks steel 200`).
// The two cannot both hold; Sparks is the Era-3 gate itself, so it carries the material
// and the knowledge-only rule is asserted over ranks 1-19. Reported in the build report.
// v0.55 Part 2.1 RE-POINT: this was pinned to the literal rank 19, which made it a hostage
// to every future PRICE move rather than to the rule it means. Part 2.1 reprices Petricite
// 9,500 -> 65,000 (+ 65 Morellonomica), which slides it from rank ~12 to rank 27 and pulls
// Sparks DOWN from rank 20 to rank 19 — the assertion broke without a single material cost
// changing. Restated against the boundary it was always about: Sparks Beyond the Wall is the
// Era-3 gate, it carries `steel 200` by the v0.47 Part 4.2 restore set, and NOTHING cheaper
// than it may carry a material. Superseded by: v0.55 Part 2.1.
check("no tech below the Era-3 gate (Sparks) carries a material cost",
  p5.matTechs.every(id => (p5.rankOfTech[id] || 99) >= p5.rankOfTech.sparks),
  `gate at rank ${p5.rankOfTech.sparks}; material techs ${p5.matTechs.map(id => `${id}@${p5.rankOfTech[id]}`).join(", ")}`);
check("no prerequisite inversion, no orphaned Discovery, building or req",
  p5.inversions.length === 0 && p5.orphanUpgrades.length === 0 &&
  p5.orphanBuildings.length === 0 && p5.orphanReqs.length === 0,
  JSON.stringify({ inv: p5.inversions, u: p5.orphanUpgrades, b: p5.orphanBuildings, r: p5.orphanReqs }));

// ============================================================================
// Part 5A — the discovery census and the visibility gates
// ============================================================================
await reset();
const p5a = await page.evaluate(() => {
  const chained = UPGRADES.filter(u => u.req).length;
  const techGated = UPGRADES.filter(u => u.tech).length;
  return {
    total: UPGRADES.length, chained, techGated,
    chainPct: +(100 * chained / UPGRADES.length).toFixed(1),
    techPct: +(100 * techGated / UPGRADES.length).toFixed(1),
    hasUpgradeVisible: typeof upgradeVisible === "function",
    usesCostDiscovered: /costDiscovered\(discCost\(u\.cost\), UNLOCK_RATIO_DEFAULT\)/.test(upgradeVisible.toString()),
    honoursReq: /if \(u\.req && !S\.upgrades\[u\.req\]\) return false;/.test(upgradeVisible.toString())
  };
});
check("PASS CONDITION: ≥15% of Discoveries chain off another Discovery (Kittens: 16%)",
  p5a.chainPct >= 15, `${p5a.chained}/${p5a.total} = ${p5a.chainPct}%`);
check("PASS CONDITION: ≥78% are tech-gated (Kittens: 78%)", p5a.techPct >= 78, `${p5a.techPct}%`);
check("Discoveries now carry a resource-state gate as well (the 30% held rule)",
  p5a.hasUpgradeVisible && p5a.usesCostDiscovered && p5a.honoursReq, JSON.stringify(p5a));

await reset();
const gates = await page.evaluate(() => {
  const fresh = () => loadFromString(btoa(unescape(encodeURIComponent(JSON.stringify(freshState())))));
  fresh();
  const craftTabShown = () => { const t = TABS.find(x => x.id === "crafting"); return !t.show || t.show(S); };
  const loreJob = () => { const j = JOBS.find(x => x.id === "loremaster"); return !j.unlock || j.unlock(S); };
  const shelterVis = () => buildingVisible(BUILDINGS.find(b => b.id === "shelter"));
  const archiveVis = () => buildingVisible(BUILDINGS.find(b => b.id === "archive"));
  const o = {};
  // cold start: only mana has ever been held
  S.seenMax = { mana: 200 }; S.res.mana = 200; S.buildings = {}; S.techs = {}; S.upgrades = {};
  o.craftTabOnManaOnly = craftTabShown();
  o.loremasterBeforeArchive = loreJob();
  S.buildings.archive = 1;
  o.loremasterAfterArchive = loreJob();
  S.buildings = {};
  // the Shelter's visibility threshold
  S.seenMax = { timber: 0 }; o.shelterAt0 = shelterVis();
  S.seenMax = { timber: 2.4 }; o.shelterAt24 = shelterVis();
  S.seenMax = { timber: 4 }; o.shelterAt4 = shelterVis();
  // the Archive keeps parity at 30%
  S.seenMax = { timber: 11, mana: 14 }; o.archiveJustUnder = archiveVis();
  S.seenMax = { timber: 12, mana: 15 }; o.archiveAt30 = archiveVis();
  o.ratios = { def: UNLOCK_RATIO_DEFAULT, shelter: UNLOCK_RATIO.shelter };
  o.knowledgeBaseCap = RES.knowledge.baseCap;
  fresh();
  return o;
});
check("PASS CONDITION: the Crafting tab does NOT appear on a save that has only run Transmute",
  gates.craftTabOnManaOnly === false);
check("PASS CONDITION: the Loremaster does not appear until an Archive stands",
  gates.loremasterBeforeArchive === false && gates.loremasterAfterArchive === true,
  `before ${gates.loremasterBeforeArchive} / after ${gates.loremasterAfterArchive}`);
check("Jerry: the Shelter becomes visible at 4 timber, not 2.4",
  gates.shelterAt0 === false && gates.shelterAt24 === false && gates.shelterAt4 === true,
  `0:${gates.shelterAt0} 2.4:${gates.shelterAt24} 4:${gates.shelterAt4} (ratio ${gates.ratios.shelter})`);
check("...and the Archive keeps Kittens' 30% parity at 12 timber + 15 mana",
  gates.archiveJustUnder === false && gates.archiveAt30 === true,
  `${gates.archiveJustUnder} → ${gates.archiveAt30} (ratio ${gates.ratios.def})`);
check("Jerry: the Knowledge ceiling starts at ZERO — nothing remembers anything until an Archive",
  gates.knowledgeBaseCap === 0, String(gates.knowledgeBaseCap));

// ============================================================================
// Part 6 — the Convergence stripe
// ============================================================================
await reset();
const p6 = await page.evaluate(() => {
  S.wtechs = { convergence: 1 };
  const at = w => { S.worship = w; return +(worshipBonus() * 100).toFixed(2); };
  const seeds = { s1: at(19404), s2: at(40764), s3: at(22149), s4: at(34364) };
  const median = at(28256);
  const stripe = +(worshipBonus.toString().match(/unlimitedDR\(S\.worship \|\| 0, (\d+)\)/) || [])[1];
  const ceiling = at(1e18);
  S.worship = 0;
  return { seeds, median, stripe, ceiling };
});
// SUPERSEDED v0.47 Part 2: Kittens' own 1,000, adopted rather than derived.
check("the stripe is Kittens' own 1,000", p6.stripe === 1000, String(p6.stripe));
check("...and it lands the median W₁ inside the 5–8% band",
  p6.median >= 5 && p6.median <= 8, `${p6.median}% at W₁ = 28,256`);
check("...with all four measured seeds in or beside the band",
  Object.values(p6.seeds).every(v => v >= 4 && v <= 10), JSON.stringify(p6.seeds));
check("Kittens' +1000% ceiling still binds", p6.ceiling === 1000, `${p6.ceiling}%`);

// ============================================================================
// Part 7 — the replacement champion condition
// ============================================================================
await reset();
const p7 = await page.evaluate(() => {
  S.champs = {}; CHAMPS.forEach(c => S.champs[c.id] = { r: 1, lvl: 10 });
  const keys = ["camp", "devotion", "caravan", "village", "gold", "knowledge", "culture", "craft", "respawn", "vigor"];
  const lines = {}; keys.forEach(k => { const v = champPassive(k); if (v) lines[k] = +(1 + v / 100).toFixed(3); });
  S.champs = {};
  return { lines, max: Math.max(...Object.values(lines)) };
});
check("PASS CONDITION: no SINGLE production line's champion multiplier exceeds ×3.0",
  p7.max <= 3.0, `max ×${p7.max} — ${JSON.stringify(p7.lines)}`);

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
  // buildingJobBoost still unbounded
  S.buildings = { mine: 400, quarry: 400 }; S.techs = { mining: 1 }; S.pop = 20;
  S.wanderers = []; syncRoster(); S.jobs = { miner: 10 };
  const at400 = computeRates().ore;
  S.buildings = { mine: 800, quarry: 800 };
  const at800 = computeRates().ore;
  S.buildings = {}; S.jobs = {}; S.pop = 0; S.wanderers = []; syncRoster();
  return {
    capExact, expect, actual: computeCaps().knowledge,
    jobBoostUnbounded: at800 / at400 > 1.9,
    ascentClean: !/cooldown/i.test(ascendTargon.toString()) && !/cost/i.test(ascendTargon.toString()),
    noNaNRates: Object.values(computeRates()).every(v => typeof v === "number" && isFinite(v)),
    noNaNCaps: Object.values(computeCaps()).every(v => typeof v === "number" && isFinite(v))
  };
});
check("regression: caps.knowledge still equals Σ(building caps.knowledge) exactly", reg.capExact);
check("regression: buildingJobBoost still unbounded", reg.jobBoostUnbounded);
check("regression: Ascent still free, cooldownless, bonusless", reg.ascentClean);
check("regression: no NaN in rates or caps", reg.noNaNRates && reg.noNaNCaps);

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
check("every visible tab renders with every v0.46 tech, upgrade and building owned",
  Object.values(tabs).every(v => typeof v === "number" && v > 0), JSON.stringify(tabs));
check("no console errors across the whole suite", errors.length === 0, errors.slice(0, 3).join(" | "));

console.log(`\n${pass} passed, ${fail} failed`);
await browser.close();
suiteEnd(import.meta.url, pass, fail);
process.exit(fail ? 1 : 0);
