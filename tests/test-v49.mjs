// test-v49 — BUILDER SPEC "v0.48" (shipped as v0.49) Part 6 pass conditions,
// plus Jerry's five UI directives.
import { chromium } from "playwright";
const browser = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium" }).catch(() => chromium.launch());
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
const errors = [];
page.on("console", m => { if (m.type() === "error") errors.push(m.text()); });
page.on("pageerror", e => errors.push(String(e)));
await page.goto(new URL("../index.html", import.meta.url).href);
await page.waitForTimeout(500);
let pass = 0, fail = 0;
const check = (n, c, x) => { console.log(n + ":", c ? "PASS" : "FAIL", x ?? ""); c ? pass++ : fail++; };
const reset = () => page.evaluate(() => loadFromString(btoa(unescape(encodeURIComponent(JSON.stringify(freshState()))))));

// ============================================================================
// Part 1.7 — the global-production category is Kittens' two members, no more.
// ============================================================================
await reset();
const cat = await page.evaluate(() => ({
  members: BUILDINGS.filter(b => b.globalBoost).map(b => ({ id: b.id, gb: b.globalBoost, ratio: b.ratio, tech: b.tech })),
  reactor: BUILDINGS.find(b => b.id === "arcaneReactor"),
  foundry: BUILDINGS.find(b => b.id === "hextechFoundry"),
  ward: BUILDINGS.find(b => b.id === "wardOfWatchers"),
  watcher: BUILDINGS.find(b => b.id === "frozenWatcher"),
  monumentGone: !BUILDINGS.some(b => b.id === "petricite"),
  nameGone: !document.documentElement.innerHTML.includes("Petricite Monument")
}));
check("EXACTLY two buildings carry globalBoost — Kittens' Magneto and Reactor",
  cat.members.length === 2 &&
  cat.members.some(m => m.id === "hextechFoundry") && cat.members.some(m => m.id === "arcaneReactor"),
  cat.members.map(m => `${m.id} ${m.gb}@${m.ratio}`).join(" | "));
check("the Arcane Reactor is Kittens' Reactor exactly — productionRatio 0.05 at priceRatio 1.15",
  cat.reactor.globalBoost === 0.05 && cat.reactor.ratio === 1.15 && cat.reactor.tech === "greyReclamation",
  `${cat.reactor.globalBoost} @ ${cat.reactor.ratio}`);
check("the Hextech Foundry is untouched — Magneto parity, 0.06 at 1.25 on the 75,000 rung",
  cat.foundry.globalBoost === 0.06 && cat.foundry.ratio === 1.25 && cat.foundry.tech === "hexcore");
check("the Ward of the Watchers keeps every non-globalBoost effect and carries no global multiplier",
  cat.ward.globalBoost === undefined && cat.ward.prod.trueice === 0.01 && cat.ward.caps.voidessence === 150,
  JSON.stringify({ gb: cat.ward.globalBoost, prod: cat.ward.prod, caps: cat.ward.caps }));
check("The Frozen Watcher keeps every non-globalBoost effect and carries no global multiplier",
  cat.watcher.globalBoost === undefined && cat.watcher.poroRatio === 0.60 && cat.watcher.prod.trueice === 0.004,
  JSON.stringify({ gb: cat.watcher.globalBoost, poro: cat.watcher.poroRatio, prod: cat.watcher.prod }));
check("the separate monument building is deleted, and its name appears nowhere in the build",
  cat.monumentGone && cat.nameGone, `building gone: ${cat.monumentGone}, string gone: ${cat.nameGone}`);

// The merge, item by item against the spec's pass condition.
const q = await page.evaluate(() => {
  const b = BUILDINGS.find(x => x.id === "quarry");
  return { id: b.id, name: b.name, group: b.group, tech: b.tech, cost: b.cost, ratio: b.ratio,
           jobBoost: b.jobBoost, gb: b.globalBoost,
           mineralsResolves: MINERALS_LINE.quarry && MINERALS_LINE.quarry[0] === "sumpVentilation",
           consumers: BUILDINGS.filter(x => x.cost && x.cost.petriciteBlock).map(x => x.id)
             .concat(CRAFTS.filter(c => c.cost && c.cost.petriciteBlock).map(c => "craft:" + c.id)) };
});
check("the merged Quarry keeps the id, the name changes to Petricite Quarry",
  q.id === "quarry" && q.name === "Petricite Quarry", q.name);
check("...and Kittens' quarry recipe survives the merge, plus petriciteBlock 2",
  q.cost.stoneSlab === 1000 && q.cost.steel === 125 && q.cost.scaffold === 50 && q.cost.petriciteBlock === 2,
  JSON.stringify(q.cost));
check("...at ratio 1.15 with jobBoost { miner: 0.35 }, in the Village group, on petricite",
  q.ratio === 1.15 && q.jobBoost.miner === 0.35 && q.group === "Village" && q.tech === "petricite");
check("...and it carries NO globalBoost — the whole point of the merge", q.gb === undefined);
check("MINERALS_LINE.quarry still resolves off the unchanged id", q.mineralsResolves);
check("petriciteBlock has at least one consumer — the craft is not orphaned",
  q.consumers.length >= 1, q.consumers.join(", "));

// The ore category must be visible only as the loss of globalBoost.
const ore = await page.evaluate(() => {
  S.buildings = {}; S.upgrades = {}; S.jobs = {}; S.pop = 0; S.wanderers = [];
  S.champs = {}; S.policies = {}; S.wtechs = {}; S.drakes = {}; S.leader = null;
  S.upgrades.zauniteDrills = true; S.upgrades.sumpVentilation = true;
  const M = 12, Q = 7;
  S.buildings = { mine: M, quarry: Q };
  const measured = jobBoostTotal("miner");
  const closed = 0.25 * M + 0.40 * Q;                 // the v0.46 formula, verbatim
  S.buildings = {}; S.upgrades = {};
  return { measured: +measured.toFixed(10), closed: +closed.toFixed(10), M, Q };
});
check("the ore category still measures 1 + 0.25M + 0.40Q exactly — the merge moved no ore income",
  Math.abs(ore.measured - ore.closed) < 1e-9,
  `${ore.M} mines + ${ore.Q} quarries → +${(ore.measured * 100).toFixed(0)}% (closed form +${(ore.closed * 100).toFixed(0)}%)`);

// ============================================================================
// The cost graph, including a direct assertion that the reverted Storehouse fails it.
// ============================================================================
const graph = await page.evaluate(() => {
  const clean = auditCostGraph();
  const raw = auditRawGraph();
  const st = BUILDINGS.find(b => b.id === "storehouse");
  const before = st.cost;
  st.cost = { timber: 50, ore: 75 };                   // the v0.46 price, deliberately
  const withOre = auditRawGraph();
  st.cost = before;
  return { clean, raw, withOre, storeCost: before,
           quarryFlagged: clean.some(v => /quarry/i.test(v)),
           rawDelta: withOre.length - raw.length };
});
check("auditCostGraph is green on the whole graph, including the Quarry's new petriciteBlock 2",
  graph.clean.length === 0 && !graph.quarryFlagged, graph.clean.join(" | ") || "[]");
check("the Storehouse still costs timber alone", JSON.stringify(graph.storeCost) === '{"timber":50}',
  JSON.stringify(graph.storeCost));
check("...and a Storehouse priced in ore FAILS the RAW audit — the check that would have caught it",
  graph.withOre.some(v => /storehouse/i.test(v)) && graph.rawDelta === 1,
  graph.withOre.filter(v => /storehouse/i.test(v)).join(" | ") || "audit stayed green (BAD)");
// v0.49 pinned this at seven and reported them without fixing them, so the isolation runs
// would keep measuring the economy v0.47 measured. v0.50 Part 2 fixes all seven, and the
// spec requires the pin to move 7 -> 0 in the SAME commit as the fix — not before it.
check("auditRawGraph returns ZERO — v0.50 Part 2 cleared all seven",
  graph.raw.length === 0, graph.raw.join(" | ") || "[]");
check("...and the Glorious Evolution, unresearchable in every build ever measured, is clear",
  !graph.raw.some(v => /gloriousEvolution/.test(v)));

// ============================================================================
// Part 5.1 — the route table. v0.52 Part 1.4 flattens vigor to 175 and holds gold.
// ============================================================================
const trade = await page.evaluate(() => ({
  rows: FACTIONS.map(f => ({ id: f.id, vigor: f.cost.vigor, gold: f.cost.gold,
                             ratio: +(f.cost.gold / f.cost.vigor).toFixed(4) }))
}));
// SUPERSEDED v0.52 Part 1.4, both of them. Per-route vigor differentiation is retired:
// every route is 175 vigor flat and the gold column is held, so neither "the cheapest
// route is 100" nor the 0.30 ratio can survive by construction. Listed in the build
// report's §7 with Part 1.4 as the superseding cause, as that item requires.
check("every route is exactly 175 vigor — differentiation is gold and goods only",
  trade.rows.every(r => r.vigor === 175),
  trade.rows.map(r => `${r.id} ${r.vigor}v/${r.gold}g`).join(" | "));
check("...and the gold column is HELD to the digit, so the vigor change is measurable alone",
  trade.rows.find(r => r.id === "freljord").gold === 30 &&
  trade.rows.find(r => r.id === "bilgewater").gold === 90,
  trade.rows.map(r => r.id + " " + r.gold + "g").join(" | "));

// ============================================================================
// Nothing in the religion layer moved.
// ============================================================================
const rel = await page.evaluate(() => ({
  stripe: (worshipBonus.toString().match(/unlimitedDR\(S\.worship \|\| 0, (\d+)\)/) || [])[1],
  coefficient: /0\.01 \* unlimitedDR/.test(worshipBonus.toString()),
  ceiling: /Math\.min\(10\.0/.test(worshipBonus.toString()),
  shrine: BUILDINGS.find(b => b.id === "shrine").prod,
  acolyte: JOBS.find(j => j.id === "acolyte").prod.devotion,
  acolyteNoMax: JOBS.find(j => j.id === "acolyte").max === undefined,
  wtechs: WTECHS.map(w => w.id + ":" + w.threshold).join(","),
  ascentFree: (() => { S.res.devotion = 80; S.worship = 0; const a = S.ascends || 0; ascendTargon();
    const ok = S.worship === 80 && S.res.devotion === 0 && S.ascends === a + 1; S.worship = 0; return ok; })()
}));
check("no change to Worship, Ascent, the stripe, the Shrine, the Acolyte or any WTECH",
  rel.stripe === "1000" && rel.coefficient && rel.ceiling &&
  rel.shrine.devotion === 0.0075 && rel.acolyte === 0.0075 && rel.acolyteNoMax &&
  rel.wtechs === "solariHymn:50,ritesOfInsight:200,sunAltar:400,solariAltar:600,convergence:1500" &&
  rel.ascentFree,
  `stripe ${rel.stripe}, shrine ${rel.shrine.devotion}, acolyte ${rel.acolyte}, ${rel.wtechs}`);

// ============================================================================
// No regression: the ladder, the caps, the unbounded category.
// ============================================================================
await reset();
const TABLE = {
  almanac: 30, cultivation: 100, woodcraft: 300, mining: 500, logistics: 500,
  scriptorium: 900, carpentry: 1000, trade: 1200, songcraft: 1300, smelting: 1500,
  masquerade: 1500, abyss: 2000, yordle: 2000, hextech: 2200, drakeLore: 3600,
  // v0.55 Part 2.1 RE-POINT: Petricite 9,500 -> 65,000 (+ 65 Morellonomica) — repriced
  // beside the Chem-Baron Accords, where the material line it gates actually opens.
  // This table is a no-regression mirror of test-v47's, and moves with it.
  // Superseded by: v0.55 Part 2.1.
  petricite: 65000, voidStudies: 12000, ritesOfTargon: 12000, callToArms: 15000, sparks: 20000,
  championsRegimen: 28000, deepCartography: 35000,
  // v0.52 Part 2.4: refinedMetallurgy (42000) deleted with the Bloomery; ladder is 37.
  kindling: 50000, hexdraulics: 50000, sumpEcology: 55000, progressDay: 60000,
  chemtech: 60000, chemBaronAccords: 65000, hexcore: 75000, gloriousEvolution: 85000,
  atlasGauntlets: 90000, deepWorks: 100000, hexgate: 115000, greyReclamation: 115000,
  voidglassOptics: 125000, watchersBelow: 125000, icathia: 135000
};
const lad = await page.evaluate(table => {
  const byId = {}; TECHS.forEach(t => byId[t.id] = t);
  const wrong = Object.keys(table).filter(id => !byId[id] || byId[id].cost.knowledge !== table[id]);
  const ks = TECHS.filter(t => t.cost.knowledge).map(t => t.cost.knowledge).sort((a, b) => a - b);
  const steps = []; for (let i = 1; i < ks.length; i++) steps.push(ks[i] / ks[i - 1]);
  const sorted = [...steps].sort((a, b) => a - b);
  const med = sorted.length % 2 ? sorted[(sorted.length - 1) / 2] : (sorted[sorted.length / 2 - 1] + sorted[sorted.length / 2]) / 2;
  const geo = Math.exp(steps.reduce((s, v) => s + Math.log(v), 0) / steps.length);
  return { wrong, n: ks.length, ties: steps.filter(v => v === 1).length,
           med: +med.toFixed(4), geo: +geo.toFixed(4), max: +Math.max(...steps).toFixed(3) };
}, TABLE);
check("all 37 tech prices unchanged, to the digit", lad.wrong.length === 0 && lad.n === 37,
  lad.wrong.join(", ") || `37 techs`);
check("the five ladder conditions still hold together",
  lad.n === 37 && lad.ties >= 5 && lad.med >= 1.10 && lad.med <= 1.25 &&
  lad.geo >= 1.20 && lad.geo <= 1.30 && lad.max <= 3.5,
  `n=${lad.n} ties=${lad.ties} median=×${lad.med} geo=×${lad.geo} max=×${lad.max}`);

const caps = await page.evaluate(() => {
  S.buildings = {}; S.upgrades = {}; S.res.tome = 0; S.res.morellonomicon = 0;
  S.jobs = {}; S.pop = 0; S.wanderers = []; S.policies = {}; S.champs = {}; S.wtechs = {}; S.drakes = {}; S.leader = null;
  const base = computeCaps().knowledge;
  S.buildings = { archive: 10 };
  const withArchive = computeCaps().knowledge;
  // buildingJobBoost must still be UNBOUNDED — no limitedDR anywhere on the miner sum
  S.upgrades = {}; S.buildings = { mine: 400 };
  const huge = jobBoostTotal("miner");
  S.buildings = {};
  return { base, withArchive, archiveCaps: BUILDINGS.find(b => b.id === "archive").caps.knowledge,
           unbounded: Math.abs(huge - 0.20 * 400) < 1e-9, huge: +huge.toFixed(4) };
});
check("the knowledge cap is still buildings alone, starting at 0",
  caps.base === 0 && caps.withArchive === 10 * caps.archiveCaps,
  `base ${caps.base}, 10 archives ${caps.withArchive}`);
check("buildingJobBoost is still unbounded — 400 mines is +8,000%, no primitive on it",
  caps.unbounded, `+${(caps.huge * 100).toFixed(0)}%`);

// ============================================================================
// Jerry's UI directives.
// ============================================================================
await reset();
const ui = await page.evaluate(async () => {
  const out = {};
  const tt = document.getElementById("tooltip");

  // --- tooltip edit 1: the open tooltip is live ---
  S.res.timber = 10;
  showTooltip(document.getElementById("tab-bar"), { cost: { timber: 100 } });
  const first = tt.innerHTML;
  S.res.timber = 55;
  updateLive();                              // exactly what tick() calls
  const second = tt.innerHTML;
  out.liveChanged = first !== second && /55/.test(second) && !/(^|[^\d])10\.0 \//.test(second);
  out.liveHasLoop = /updateLive\(\)/.test(tick.toString()) || /updateLive\(\)/.test(step.toString());
  hideTooltip();
  out.clearedOnHide = (() => { showTooltip(document.getElementById("tab-bar"), { cost: { timber: 1 } });
    hideTooltip(); const before = tt.innerHTML; S.res.timber = 999; updateLive();
    return tt.innerHTML === before && tt.style.display === "none"; })();

  // --- tooltip edit 2: Wilds yields, one per line ---
  TECHS.forEach(t => S.techs[t.id] = true);
  const e = EXPEDITIONS.find(x => x.id === "krugs");           // yield has two " · " parts
  showTooltip(document.getElementById("tab-bar"), {
    title: e.name, cost: expCost(e),
    yield: (e.yield ? e.yield.split(" · ") : []).concat(S.techs.callToArms ? ["+" + (e.renown || 2) + " renown"] : []),
    flavor: e.desc });
  out.wildsYieldLines = tt.querySelectorAll(".tt-yield").length;
  out.wildsExpected = e.yield.split(" · ").length + 1;
  hideTooltip();

  // --- tooltip edit 3: trade flavour under the civilisation name ---
  const f = FACTIONS.find(x => x.id === "demacia");
  out.split = { amt: f.yieldAmt, note: f.yieldNote, derived: f.yieldDesc };
  S.caravans = { demacia: 20 };
  S.activeTab = "trade"; uiDirty = true; renderAll();
  const fb = document.querySelector("[data-fac='demacia']");
  if (fb && fb.onmouseenter) fb.onmouseenter({ stopPropagation() {} });
  out.tradeZones = [...tt.children].map(d => d.className.replace(" tt-sec", ""));
  out.tradeDescIsFlavour = /burn your timber for charcoal/.test(tt.querySelector(".tt-desc") ? tt.querySelector(".tt-desc").textContent : "");
  out.tradeYieldLines = tt.querySelectorAll(".tt-yield").length;
  hideTooltip();

  // --- tooltip edit 3.1: caravan yields, one per line ---
  const cv = document.querySelector("[data-bcv]");
  if (cv && cv.onmouseenter) cv.onmouseenter({ stopPropagation() {} });
  out.caravanYieldLines = tt.querySelectorAll(".tt-yield").length;
  hideTooltip();

  // --- champion edits ---
  CHAMPS.forEach(c => { S.champs[c.id] = { r: 1, lvl: 2, xp: 300 }; });
  delete S.champs[CHAMPS[CHAMPS.length - 1].id];              // leave one unrecruited
  S.leader = CHAMPS[0].id;
  S.activeTab = "champions"; uiDirty = true; renderAll();
  const h = document.getElementById("tab-content").innerHTML;
  out.noRung = !/champion #/.test(h);
  out.noClass = !CHAMPS.some(c => new RegExp("<span class=\"b-count\">" + c.cls + "\\b").test(h));
  out.noRate = !/\+[\d.]+\/s \(leading\)|\(benched\)/.test(h);
  out.xpInName = /<span class="b-name champ-name"><span>[^<]*<\/span><span class="champ-xp" data-champxp=/.test(h);
  // and it ticks: mutate XP, call the live layer, read the node
  const cid = CHAMPS[0].id;
  const spanBefore = document.querySelector("[data-champxp='" + cid + "']").textContent;
  S.champs[cid].xp = 900;
  updateLive();
  out.xpTicks = document.querySelector("[data-champxp='" + cid + "']").textContent !== spanBefore;
  return out;
});
check("tooltip edit 1 — an OPEN tooltip's material counts move with the game",
  ui.liveChanged && ui.liveHasLoop, `changed: ${ui.liveChanged}, wired into tick: ${ui.liveHasLoop}`);
check("...and a hidden tooltip is not re-rendered (the descriptor is cleared)", ui.clearedOnHide);
check("tooltip edit 2 — Wilds yields render one per line, not as a paragraph",
  ui.wildsYieldLines === ui.wildsExpected && ui.wildsYieldLines >= 3,
  `${ui.wildsYieldLines} lines (expected ${ui.wildsExpected})`);
check("tooltip edit 3 — the route's flavour is split in the DATA, and yieldDesc still derives",
  ui.split.amt === "28-38 steel" && /burn your timber/.test(ui.split.note) &&
  ui.split.derived === ui.split.amt + " — " + ui.split.note, JSON.stringify(ui.split));
check("...and it renders directly under the civilisation's name, in ZONE 1",
  ui.tradeZones[0] === "tt-title" && ui.tradeZones[1] === "tt-desc" && ui.tradeDescIsFlavour,
  JSON.stringify(ui.tradeZones));
check("...with the haul and every opened cargo slot on their own lines",
  ui.tradeYieldLines >= 2, `${ui.tradeYieldLines} yield lines at 20 caravans`);
check("tooltip edit 3.1 — the caravan tooltip lists what it buys one line at a time",
  ui.caravanYieldLines >= 4, `${ui.caravanYieldLines} lines`);
check("champion edit 1 — the recruit card lists neither the class nor the rung",
  ui.noRung && ui.noClass, `rung gone: ${ui.noRung}, class gone: ${ui.noClass}`);
check("champion edit 2 — XP sits beside the name and the xp/second line is gone",
  ui.xpInName && ui.noRate, `in name: ${ui.xpInName}, rate gone: ${ui.noRate}`);
check("...and it updates in real time, off the same live layer as the tooltip", ui.xpTicks);

// ============================================================================
// The save migration, and no console errors.
// ============================================================================
const mig = await page.evaluate(() => {
  const st = JSON.parse(JSON.stringify(freshState()));
  st.buildings.petricite = 7;
  st.res.petriciteBlock = 1;
  loadFromString(btoa(unescape(encodeURIComponent(JSON.stringify(st)))));
  return { gone: S.buildings.petricite === undefined, blocks: S.res.petriciteBlock };
});
check("an old save's monument count is dropped and refunded as blocks, not converted to Quarries",
  mig.gone && mig.blocks === 15, `blocks ${mig.blocks} (1 held + 2×7 refunded)`);

check("no console errors across the whole suite", errors.length === 0, errors.slice(0, 3).join(" | "));

console.log(`\n${pass} passed, ${fail} failed`);
await browser.close();
process.exit(fail ? 1 : 0);
