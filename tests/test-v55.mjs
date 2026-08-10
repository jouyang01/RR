// test-v55 — BUILDER SPEC v0.55 pass conditions, plus Jerry's directive on seasonal farmers.
//
// The round's twenty pass conditions are asserted here in spec order. Where a condition says
// "reported", the value is printed alongside the assertion so the build report can be read
// against a run of this file rather than against prose.
import { chromium } from "playwright";
import { readFileSync } from "fs";
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

// Source greps run against a COMMENT-STRIPPED copy. Every suite since v0.53 does this: this
// round adds long rationale comments that quote the very literals being asserted absent, and
// a naive grep would read the explanation as the code.
const RAW = readFileSync(new URL("../index.html", import.meta.url), "utf8");
const strip = s => s.replace(/\/\*[\s\S]*?\*\//g, "").split("\n")
  .map(l => l.replace(/(^|[^:])\/\/.*$/, "$1")).join("\n");
const CODE = strip(RAW);

// ============================================================================
// PASS CONDITION 1 — the parity ledger covers everything, by enumeration
// ============================================================================
const LEDGER = readFileSync(new URL("../docs/PARITY-LEDGER.md", import.meta.url), "utf8");
const led = await page.evaluate(() => ({
  techs: TECHS.map(t => t.id), buildings: BUILDINGS.map(b => b.id),
  upgrades: UPGRADES.map(u => u.id), jobs: JOBS.map(j => j.id),
  crafts: CRAFTS.map(c => c.id)
}));
const rows = LEDGER.split("\n").filter(l => /^\|\s*`/.test(l));
const rowId = l => (l.match(/^\|\s*`([^`]+)`/) || [])[1];
// Enumeration is SECTION-SCOPED, not global. `hexcore` is legitimately both a tech id and a
// craft id, so a global "appears exactly once" would flag it as a duplicate when in fact it
// is two different things correctly listed under two different headings.
const SECTION = { techs: "TECHS", buildings: "BUILDINGS", upgrades: "UPGRADES", jobs: "JOBS", crafts: "CRAFTS" };
const sectionRows = name => {
  const lines = LEDGER.split("\n");
  const start = lines.findIndex(l => new RegExp("^## " + name + "\\b").test(l));
  if (start < 0) return [];
  const rest = lines.slice(start + 1);
  const end = rest.findIndex(l => /^## /.test(l));
  return (end < 0 ? rest : rest.slice(0, end)).filter(l => /^\|\s*`/.test(l));
};
const everyOnce = kind => {
  const sIds = sectionRows(SECTION[kind]).map(rowId).filter(Boolean);
  return led[kind].filter(id => sIds.filter(x => x === id).length !== 1);
};
const missTech = everyOnce("techs"), missBld = everyOnce("buildings"),
      missUpg = everyOnce("upgrades"), missJob = everyOnce("jobs"), missCraft = everyOnce("crafts");
check("1 — every TECH appears in the ledger exactly once", missTech.length === 0, missTech.join(", ") || `${led.techs.length} techs`);
check("1 — every BUILDING appears exactly once", missBld.length === 0, missBld.join(", ") || `${led.buildings.length} buildings`);
check("1 — every UPGRADE appears exactly once", missUpg.length === 0, missUpg.join(", ") || `${led.upgrades.length} upgrades`);
check("1 — every JOB appears exactly once", missJob.length === 0, missJob.join(", ") || `${led.jobs.length} jobs`);
check("1 — every CRAFT appears exactly once", missCraft.length === 0, missCraft.join(", ") || `${led.crafts.length} crafts`);
// no blank rows: every row carries a verdict in {PARITY, EASIER, HARDER, UNVERIFIED}
const VERDICTS = ["PARITY", "EASIER", "HARDER", "UNVERIFIED"];
const blank = rows.filter(l => !VERDICTS.some(v => new RegExp("\\b" + v + "\\b").test(l)));
check("1 — no blank rows: every row carries one of the four verdicts",
  blank.length === 0, blank.slice(0, 3).map(rowId).join(", ") || `${rows.length} rows`);
const counts = {}; VERDICTS.forEach(v => counts[v] = rows.filter(l => new RegExp("\\b" + v + "\\b").test(l)).length);
check("1 — verdict counts are reported, and HARDER is no longer empty",
  counts.HARDER > 0 && counts.PARITY > 0 && counts.EASIER > 0, JSON.stringify(counts));
check("1 — the ledger states the standing divergences that are not rows",
  /seasonal farmer/i.test(LEDGER) && /undo/i.test(LEDGER) && /drake/i.test(LEDGER));

// ============================================================================
// PASS CONDITION 2 — Directive 5's source question, resolved and recorded
// ============================================================================
// The spec left Part 0.1 open: are Kittens' farmers affected by seasonality? They are NOT.
// `js/village.js updateResourceProduction()` applies skill, rank, leader and happiness and
// nothing else; `getWeatherMod()` lives in `js/calendar.js` and is never called from the job
// path; the wiki's Game Mechanics page states outright that seasons affect catnip FIELDS and
// not farmers. Jerry's premise is wrong about the source — and the directive ships anyway,
// because directives override. What must not happen is it shipping as PARITY.
check("2 — the seasonal farmer is labelled RR-ORIGINAL and HARDER, not PARITY",
  /RR-ORIGINAL/.test(LEDGER) && /HARDER/.test(LEDGER) &&
  /farmer/i.test(LEDGER.split("\n").filter(l => /HARDER/.test(l)).join(" ")),
  LEDGER.split("\n").filter(l => /HARDER/.test(l) && /farmer/i.test(l))[0] || "");
check("2 — the resolution is recorded in the source, at the line that implements it",
  /Kittens' farmers are NOT seasonal/i.test(RAW) || /js\/village\.js/.test(RAW));

// ============================================================================
// PASS CONDITIONS 3, 4, 5 — the two unlock rungs
// ============================================================================
await reset();
const rungs = await page.evaluate(() => {
  const T = id => TECHS.find(t => t.id === id), B = id => BUILDINGS.find(b => b.id === id);
  const sci = TECHS.filter(t => t.cost.knowledge).sort((a, b) => a.cost.knowledge - b.cost.knowledge);
  const ks = sci.map(t => t.cost.knowledge);
  const steps = []; for (let i = 1; i < ks.length; i++) steps.push(ks[i] / ks[i - 1]);
  const sorted = [...steps].sort((a, b) => a - b);
  const med = sorted.length % 2 ? sorted[(sorted.length - 1) / 2] : (sorted[sorted.length / 2 - 1] + sorted[sorted.length / 2]) / 2;
  const geo = Math.exp(steps.reduce((s, v) => s + Math.log(v), 0) / steps.length);
  // fan-out: how many techs name any one tech as their prerequisite
  const fan = {}; TECHS.forEach(t => { if (t.req) fan[t.req] = (fan[t.req] || 0) + 1; });
  return {
    petriciteCost: T("petricite").cost,
    quarryCost: B("quarry") ? B("quarry").cost : null,
    quarryTech: B("quarry") ? B("quarry").tech : null,
    irrTech: B("irrigation").tech, irrCost: B("irrigation").cost,
    irrRatio: B("irrigation").ratio, irrBoost: B("irrigation").boost,
    rungOfIrrTech: T(B("irrigation").tech).cost.knowledge,
    n: sci.length, ties: steps.filter(v => v === 1).length,
    med: +med.toFixed(4), geo: +geo.toFixed(4), max: +Math.max(...steps).toFixed(3),
    maxFan: Math.max(...Object.values(fan)),
    raw: auditRawGraph(), cost: auditCostGraph(),
    inversions: sci.filter(t => t.req && TECHS.find(x => x.id === t.req) &&
      t.cost.knowledge <= TECHS.find(x => x.id === t.req).cost.knowledge).map(t => t.id)
  };
});
check("3 — petricite is knowledge 65,000 + morellonomicon 65, exactly Kittens' `archeology`",
  rungs.petriciteCost.knowledge === 65000 && rungs.petriciteCost.morellonomicon === 65 &&
  Object.keys(rungs.petriciteCost).length === 2, JSON.stringify(rungs.petriciteCost));
check("3 — the Quarry's own cost and id are UNTOUCHED (§5: one lever a round)",
  rungs.quarryTech === "petricite" && rungs.quarryCost !== null,
  `${rungs.quarryTech} — ${JSON.stringify(rungs.quarryCost)}`);
// RE-POINTED v0.59.1 note 3 — 36 techs. The four SHAPE conditions are untouched and are what
// this assertion is actually for; only the count moved, and it moved because a tech was
// deliberately deleted.
// RE-POINTED v0.61, superseded by DEV NOTE 4 (Jerry): The Champions' Regimen (28,000) and
// Deep Cartography (35,000) are MERGED into The Vanguard Doctrine (45,000), which unlocks both
// Standing Orders and Surveyed Approaches. **The ladder goes 36 -> 35 techs.** Both retired ids
// are RESERVED under STANDING-RULINGS §30 until v1.0. The SHAPE conditions this assertion
// actually protects — tie count, median step, geometric step, largest single cliff — are
// unchanged and are what still carries the check.
check("4 — ladder recomputed: 35 techs, ties ≥ 5, median ×1.10–1.20, geo ×1.25–1.30, max ≤ ×3.4",
  rungs.n === 35 && rungs.ties >= 5 && rungs.med >= 1.10 && rungs.med <= 1.20 &&
  rungs.geo >= 1.25 && rungs.geo <= 1.30 && rungs.max <= 3.4,
  `N=${rungs.n}, ${rungs.ties} ties, median ×${rungs.med}, geo ×${rungs.geo}, max ×${rungs.max}`);
check("4 — prerequisite fan-out is still ≤ 3 (v0.53 directive 1)", rungs.maxFan <= 3, `max fan-out ${rungs.maxFan}`);
check("4 — no prerequisite inversion after the reprice", rungs.inversions.length === 0, rungs.inversions.join(", ") || "clean");
check("5 — the Irrigation Channel is on the 1,500 rung, cost/ratio/figure unmoved",
  rungs.rungOfIrrTech === 1500 && rungs.irrCost.ore === 75 &&
  rungs.irrRatio === 1.12 && rungs.irrBoost.provisions === 0.03,
  `${rungs.irrTech} (${rungs.rungOfIrrTech}) — ${JSON.stringify(rungs.irrCost)}`);
check("5 — auditRawGraph() is ZERO after the move", rungs.raw.length === 0, rungs.raw.join(" | ") || "[]");

// ============================================================================
// PASS CONDITIONS 6, 7, 8 — the food economy
// ============================================================================
await reset();
const food = await page.evaluate(() => {
  const J = id => JOBS.find(j => j.id === id), B = id => BUILDINGS.find(b => b.id === id);
  return {
    farmer: J("farmer").prod.provisions, farmerDesc: J("farmer").desc,
    farmstead: B("farmstead").prod.provisions, farmsteadSeasonal: B("farmstead").seasonal === true,
    consumption: CONSUMPTION, scale: typeof PROVISIONS_SCALE !== "undefined" ? PROVISIONS_SCALE : null,
    ratio: +(CONSUMPTION / J("farmer").prod.provisions).toFixed(5),
    // enumerate EVERY provisions quantity in the game, so the sweep can be asserted whole
    baseCap: (function () { const s = freshState(); return null; })(),
    buildingCaps: BUILDINGS.filter(b => b.caps && b.caps.provisions).map(b => [b.id, b.caps.provisions]),
    buildingCosts: BUILDINGS.filter(b => b.cost && b.cost.provisions).map(b => [b.id, b.cost.provisions]),
    expCosts: EXPEDITIONS.filter(e => e.cost && e.cost.provisions).map(e => [e.id, e.cost.provisions]),
    factionCosts: FACTIONS.filter(f => f.cost && f.cost.provisions).map(f => [f.id, f.cost.provisions]),
    champCosts: (typeof CHAMPS !== "undefined" ? CHAMPS : []).filter(c => c.cost && c.cost.provisions).map(c => [c.id, c.cost.provisions])
  };
});
check("6 — the farmer is Kittens' own 5.000 provisions/s",
  food.farmer === 5 && /5 provisions\/s/.test(food.farmerDesc), String(food.farmer));
check("6 — the Farmstead is Kittens' `field` at 0.625/s (catnipPerTickBase 0.125 × 5)",
  food.farmstead === 0.625 && food.farmsteadSeasonal, String(food.farmstead));
// v0.55 asked for 4.25, Jerry's v0.55 directive said 4, directives override, and 4 shipped
// with the 6.2% relaxation recorded. v0.56 Part 2 CLOSES that disagreement on Jerry's
// directive 2 ("Consumption should follow kitten's line") and the value returns to source.
// This is the one v0.55 assertion that was written expecting to be re-pointed.
// Superseded by: v0.56 Part 2.
check("6 — CONSUMPTION is Kittens' own 4.25, and the ratio is 0.850 — exact parity",
  food.consumption === 4.25 && Math.abs(food.ratio - 0.85) < 1e-9,
  `${food.consumption}/${food.farmer} = ${food.ratio}; farmers per eater ${(1 / food.ratio).toFixed(5)} vs source 1.17647`);
check("7 — the sweep is a declared constant, not scattered literals", food.scale === 10, `PROVISIONS_SCALE ${food.scale}`);
// Every provisions quantity in the shipped file, enumerated. The sweep is asserted by the
// SHAPE of the enumeration — nothing is left on the old scale — rather than by a spot check.
// v0.56 RE-POINT: the two entries that are CAPS on food STORES — storehouse and harbor — are
// no longer at 10x their v0.54 value, because Jerry's v0.56 provisions-cap directive repriced
// them onto Kittens' own barn (catnipMax 5,000) and harbour (2,500) figures. The v0.55 x10
// sweep is not undone: it is what made those two source figures transplantable in the first
// place, by putting RR's food on Kittens' unit. What this assertion guards — that nothing was
// LEFT BEHIND on the old tenth-scale — is unchanged and still holds for every other site.
// Superseded by: v0.56 Part 5 + Jerry's provisions-cap directive.
const OLD_SCALE_SITES = [
  ["longhouse", 120], ["bardsHearth", 40], ["trainingGround", 50],
  ["caravanserai", 300], ["pastureRotation", 800]
];
const REPRICED_v56 = { storehouse: 5000, harbor: 2500 };
const capsMap = Object.fromEntries(food.buildingCaps);
check("7 — the two food stores are at Kittens' own barn/harbour figures, not the ×10 carry",
  capsMap.storehouse === REPRICED_v56.storehouse && capsMap.harbor === REPRICED_v56.harbor,
  `storehouse ${capsMap.storehouse}/5000, harbor ${capsMap.harbor}/2500`);
check("7 — every provisions CAP moved ×10; not one is left on the old scale",
  OLD_SCALE_SITES.every(([id, old]) => capsMap[id] === undefined || capsMap[id] === old * 10),
  OLD_SCALE_SITES.map(([id, old]) => `${id} ${old}→${capsMap[id]}`).join(", "));
const swept = await page.evaluate(() => ({
  baseCap: (function () {
    S.buildings = {}; S.upgrades = {}; S.techs = {}; S.policies = {}; S.champs = {}; S.pop = 0;
    return computeCaps().provisions;
  })(),
  festivalAtTen: (function () { S.pop = 10; return festivalCost().provisions; })(),
  // v0.62 PART 4.3 — the per-head terms, which still take the sweep the provisions term left.
  festivalCultureAtTen: (function () { S.pop = 10; return festivalCost().culture; })(),
  festivalVigorAtTen: (function () { S.pop = 10; return festivalCost().vigor; })(),
  arrivalThresholdInSource: null
}));
check("7 — the bare storage floor is 2,000 (200 × 10)", swept.baseCap === 2000, String(swept.baseCap));
// RE-POINTED v0.62, superseded by PART 4.3 / DEV NOTE 3 (Jerry): "the Festival's provisions cost
// should be higher." **The cost is no longer denominated in population.** It had the same defect
// v0.61 Part 6.3 found in the trade provisions cost — population plateaus near 200 while the
// provisions CEILING grows x11.3 from Sparks to Icathia, so the festival cost 15% of the ceiling
// at Sparks and 1.3% at Icathia. It is `FESTIVAL_PROVISION_PCT x computeCaps().provisions` now.
// **What this line guarded — that the sweep's x10 reached the festival — is asserted against the
// CULTURE and VIGOR terms, which are still per-head and did take the sweep.**
check("7 — the festival's per-head terms took the sweep (30 × pop culture, 10 × pop vigor)",
  swept.festivalCultureAtTen === 300 && swept.festivalVigorAtTen === 100,
  `culture ${swept.festivalCultureAtTen}, vigor ${swept.festivalVigorAtTen}`);
check("7 — ...and the PROVISIONS term is a fraction of the ceiling, not of population",
  /FESTIVAL_PROVISION_PCT \* \(computeCaps\(\)\.provisions/.test(CODE) &&
  !/provisions: Math\.round\(60 \* Math\.max\(1, S\.pop\)\)/.test(CODE));
check("7 — the arrival threshold moved with the sweep, at BOTH sites",
  (CODE.match(/S\.res\.provisions > 80/g) || []).length === 2 &&
  !/S\.res\.provisions > 8\b/.test(CODE),
  `${(CODE.match(/S\.res\.provisions > 80/g) || []).length} sites at 80`);

// Directive 5 / condition 8 — farmers take farmMult, asserted at all four seasons.
await reset();
const seasons = await page.evaluate(() => {
  S.buildings = {}; S.upgrades = {}; S.policies = {}; S.champs = {}; S.drakes = {}; S.wtechs = {};
  S.techs = { almanac: 1, cultivation: 1 };
  S.pop = 10; S.wanderers = []; syncRoster(); S.jobs = { farmer: 10 };
  S.weather = "clear"; S.leader = null;
  const out = {};
  SEASONS.forEach((s, i) => {
    S.tick = i * TICKS_PER_DAY * DAYS_PER_SEASON;
    if (typeof invalidateCensus === "function") invalidateCensus();
    const bd = computeRates("provisions");
    let farmers = 0;
    (bd._bd || []).forEach(e => { if (/Farmer/.test(e.label)) farmers += e.amt; });
    out[s.id] = { mult: s.farmMult, farmerAmt: +farmers.toFixed(4) };
  });
  return out;
});
const springAmt = seasons.spring.farmerAmt, summerAmt = seasons.summer.farmerAmt,
      winterAmt = seasons.winter.farmerAmt;
// v0.57 Part 2 RE-POINT, and this one is a REVERSAL rather than a re-point of a magnitude.
// v0.55 shipped seasonal farmers on a directive whose stated premise -- that Kittens' farmers
// are seasonal -- this suite's own round then DISPROVED from source, and it shipped labelled
// RR-ORIGINAL / HARDER precisely so it could be revisited on the label. Jerry's v0.57 directive
// 2 revisits it: "Farmers provision production should not be impacted by winter." The reversal
// moves RR TOWARD the source (js/village.js updateResourceProduction() carries no season term),
// so the ledger row goes HARDER -> PARITY.
//
// The assertion is INVERTED rather than deleted, which is this project's rule for a retired
// behaviour: a future round that re-seasons the farmer has to come back here and say so.
// Superseded by: v0.57 Part 2.
check("8 — farmer output is IDENTICAL in all four seasons — the season term is gone from the job",
  Math.abs(springAmt - summerAmt) < 1e-9 && Math.abs(seasons.autumn.farmerAmt - summerAmt) < 1e-9 &&
  Math.abs(winterAmt - summerAmt) < 1e-9,
  Object.entries(seasons).map(([k, v]) => `${k} ${v.farmerAmt}`).join(" | "));
check("8 — winter costs the farmer nothing at all",
  Math.abs(winterAmt / summerAmt - 1) < 1e-9, `${winterAmt} vs ${summerAmt}`);
check("8 — and no season term survives on the job path, on stripped source",
  !/if \(r === "provisions"\) jv \*= farmMult;/.test(CODE) &&
  !/season\.name\.toLowerCase\(\)/.test(CODE.slice(CODE.indexOf("JOBS.forEach"))));

// ============================================================================
// PASS CONDITIONS 9, 10 — the Granary and the shared bound
// ============================================================================
await reset();
const gran = await page.evaluate(() => {
  const g = BUILDINGS.find(b => b.id === "granary"), p = BUILDINGS.find(b => b.id === "poroPasture");
  const T = id => TECHS.find(t => t.id === id);
  const at = (nG, nP) => { S.buildings = { granary: nG, poroPasture: nP }; S.upgrades = {};
                           return { sum: +eatCutSum().toFixed(5), delivered: +eatCutDelivered().toFixed(5) }; };
  const o = {
    g: g && { tech: g.tech, cost: g.cost, ratio: g.ratio, eatCut: g.eatCut, eatCutLimit: g.eatCutLimit },
    rung: g && T(g.tech).cost.knowledge,
    pastureCut: p.eatCut, limit: EAT_CUT_LIMIT,
    m40x30: at(40, 30), m60x40: at(60, 40), m500x500: at(500, 500), bare: at(0, 0)
  };
  S.buildings = {};
  return o;
});
check("9 — the Granary ships at provisions 100 + timber 10, ratio 1.15, eatCut 0.005",
  gran.g && gran.g.cost.provisions === 100 && gran.g.cost.timber === 10 &&
  gran.g.ratio === 1.15 && gran.g.eatCut === 0.005, JSON.stringify(gran.g && gran.g.cost));
check("9 — ...on RR's 500 rung, which is where Kittens' `animal` sits",
  gran.rung === 500, `${gran.g && gran.g.tech} (${gran.rung})`);
// Condition 10: the bound is RE-RULED FROM A MEASUREMENT, and the measurement is printed.
// 40 granaries + 30 pastures -> Σ 0.29 delivered 29.000% (still linear: the free band is
// 0.75 × 0.5 = 0.375). 60 + 40 -> Σ 0.42 delivered 40.810%. 500 + 500 -> Σ 4.00 delivered
// 49.583%. RULING: KEEP 0.5. It is a tail-cap and not a tax — at every count a player will
// actually reach it is linear, and it only bends where the stack would otherwise run away.
// What changed is that it went from DECORATIVE (one member needed 125 pastures to reach the
// free band at all) to real, because two members now share it.
check("10 — the bound is linear at realistic counts and bends only in the tail",
  Math.abs(gran.m40x30.delivered - gran.m40x30.sum) < 1e-9 &&
  gran.m60x40.delivered < gran.m60x40.sum &&
  gran.m500x500.delivered < 0.5 && gran.m500x500.delivered > 0.49,
  `40+30 Σ${gran.m40x30.sum}→${(gran.m40x30.delivered * 100).toFixed(3)}% | ` +
  `60+40 Σ${gran.m60x40.sum}→${(gran.m60x40.delivered * 100).toFixed(3)}% | ` +
  `500+500 Σ${gran.m500x500.sum}→${(gran.m500x500.delivered * 100).toFixed(3)}%`);
check("10 — EAT_CUT_LIMIT stays 0.5, and BOTH buildings read the same constant",
  gran.limit === 0.5 && gran.g.eatCutLimit === 0.5,
  `granary ${gran.g.eatCutLimit}, EAT_CUT_LIMIT ${gran.limit}`);
check("10 — eat is cut through the shared sum, not through a per-building read",
  /eat \*= 1 - eatCutDelivered\(\);/.test(CODE) && !/count\("poroPasture"\)\s*\*\s*0\.003/.test(CODE));

// ============================================================================
// PASS CONDITIONS 11, 12 — the Hunter's Lodge is gone; the chain is the source's
// ============================================================================
check("11 — `hunterLodge` is absent at grep level, outside the save migration",
  (CODE.match(/hunterLodge/g) || []).length ===
  (strip(RAW).split("\n").filter(l => /hunterLodge/.test(l) && /loadFromString|refund|migrat/i.test(l)).length ||
   (CODE.match(/hunterLodge/g) || []).length),
  `${(CODE.match(/hunterLodge/g) || []).length} live references`);
const lodge = await page.evaluate(() => ({
  inBuildings: BUILDINGS.some(b => b.id === "hunterLodge"),
  migrationRefunds: (function () {
    // a v0.54 save that owns 10 Lodges must load, lose the building, and be paid back 50% of
    // the ratio-1.15 geometric sum it spent
    const s = freshState();
    s.buildings = { hunterLodge: 10 };
    s.res = Object.assign({}, s.res, { timber: 0, ore: 0, furs: 0 });
    loadFromString(btoa(unescape(encodeURIComponent(JSON.stringify(s)))));
    return { owned: count("hunterLodge"), timber: Math.round(S.res.timber),
             ore: Math.round(S.res.ore), furs: Math.round(S.res.furs) };
  })()
}));
const geo10 = (base, r, n) => base * (Math.pow(r, n) - 1) / (r - 1);
const want = k => Math.round(0.5 * geo10(k, 1.15, 10));
check("11 — the building is gone from BUILDINGS", !lodge.inBuildings);
check("11 — a v0.54 save owning 10 Lodges loads, drops them, and is refunded 50%",
  lodge.migrationRefunds.owned === 0 &&
  lodge.migrationRefunds.timber === want(200) &&
  lodge.migrationRefunds.ore === want(220) &&
  lodge.migrationRefunds.furs === want(20),
  `owned ${lodge.migrationRefunds.owned}; refunded timber ${lodge.migrationRefunds.timber}/${want(200)} ` +
  `ore ${lodge.migrationRefunds.ore}/${want(220)} furs ${lodge.migrationRefunds.furs}/${want(20)}`);

await reset();
const camp = await page.evaluate(() => {
  S.buildings = {}; S.jobs = {}; S.policies = {}; S.champs = {}; S.upgrades = {};
  S.wanderers = []; _traitCounts = null;
  const o = { bare: +campYieldMult().toFixed(4) };
  // The SEVEN source-mapped members, and nothing else. Kittens' seven workshop upgrades are
  // bolas 1.0 + huntingArmor 2.0 + steelArmor 0.5 + alloyArmor 0.5 + nanosuits 0.5 +
  // griffinRelationsScouts 0.5 + rationing 0.1 = Σ 5.10 → ×6.10 unbounded. RR maps five
  // Discoveries onto the first six (1.0 + 2.0 + 1.0 + 0.5 + 0.5 = 5.0) and the Open Range
  // policy onto `rationing` (0.1). That is the parity stack, and it is Σ 5.10 exactly.
  S.upgrades = { trappersCraft: 1, beastLore: 1, masterOfTheHunt: 1, atlasGauntletsUp: 1, jessedHawks: 1 };
  S.policies = { openRange: 1 };
  o.sigmaSeven = +(1.0 + 2.0 + 1.0 + 0.5 + 0.5 + 0.1).toFixed(4);
  o.sevenRaw = campYieldMult();
  o.seven = +o.sevenRaw.toFixed(4);
  o.sevenLux = +campYieldMult(true).toFixed(4);
  // The Trailblazer TRAIT is an EIGHTH member and it is RR-ORIGINAL — Kittens has no
  // wanderer traits at all. It is small and hard-bounded: 0.005 per Trailblazer through
  // limitedDR(_, TRAIT_LIMIT = 0.15), so it can never add more than 0.15 to Σ no matter how
  // many arrive. Asserted as bounded rather than removed; the ledger carries the label.
  for (let i = 0; i < 20; i++) S.wanderers.push({ t: "trailblazer" });
  _traitCounts = null;
  o.traitAt20 = +traitBonus("trailblazer").toFixed(4);
  o.eight = +campYieldMult().toFixed(4);
  S.wanderers = []; for (let i = 0; i < 100000; i++) S.wanderers.push({ t: "trailblazer" });
  _traitCounts = null;
  o.traitCeiling = +traitBonus("trailblazer").toFixed(4);
  S.wanderers = []; _traitCounts = null;
  // the two RR-original terms that Part 4 removes: no job count, no building count.
  // Compared against the UNROUNDED reference — rounding the reference first would make any
  // comparison fail on the last digit and read as a false positive for "it moved".
  S.jobs = { jungler: 200 }; o.junglerMoves = campYieldMult() !== o.sevenRaw;
  S.jobs = {};
  S.buildings = { hunterLodge: 200 }; o.buildingMoves = campYieldMult() !== o.sevenRaw;
  S.buildings = {}; S.upgrades = {}; S.policies = {};
  return o;
});
check("12 — campYieldMult() has no term keyed to a JOB count", !camp.junglerMoves);
check("12 — ...and none keyed to a BUILDING count", !camp.buildingMoves);
check("12 — the parity stack is Kittens' own Σ 5.10 across seven mapped members",
  Math.abs(camp.sigmaSeven - 5.10) < 1e-9, `Σ ${camp.sigmaSeven}`);
check("12 — a fully invested settlement delivers ×5.7–6.1 on materials",
  camp.seven >= 5.7 && camp.seven <= 6.1,
  `×${camp.seven} at Σ 5.10 (Kittens unbounded gives ×6.10; the 6.0 bound costs 2.8%)`);
check("12 — and the comfort ceiling still holds comforts under ×2",
  camp.sevenLux < 2 && camp.sevenLux > 1.9, `×${camp.sevenLux}`);
// The eighth member is RR-original and it is the one thing in this stack with no source
// counterpart. It is reported, not hidden: at 20 Trailblazers it adds 0.100 and cannot ever
// add more than TRAIT_LIMIT = 0.150, which moves the delivered multiplier ×5.93 → ×5.98.
check("12 — the RR-original Trailblazer trait is hard-bounded by TRAIT_LIMIT",
  Math.abs(camp.traitAt20 - 0.1) < 1e-9 && camp.traitCeiling <= 0.15,
  `20 Trailblazers +${camp.traitAt20} (×${camp.seven} → ×${camp.eight}); ceiling +${camp.traitCeiling}`);
check("12 — the source names the seven members explicitly",
  /champPassive\("camp"\)/.test(CODE) && /trappersCraft/.test(CODE) && /beastLore/.test(CODE) &&
  /masterOfTheHunt/.test(CODE) && /atlasGauntletsUp/.test(CODE) && /jessedHawks/.test(CODE) &&
  /hasPolicy\("openRange"\)/.test(CODE) && /traitBonus\("trailblazer"\)/.test(CODE));

// ============================================================================
// PASS CONDITION 13 — the Poro Pasture's price ratio
// ============================================================================
const pasture = await page.evaluate(() => {
  const p = BUILDINGS.find(b => b.id === "poroPasture");
  const priceAt = n => { S.buildings = { poroPasture: n }; const c = buildingCost(p);
                         return c.poros || c.provisions || c.timber || Object.values(c)[0]; };
  const o = { ratio: p.ratio, cut: p.eatCut, at0: priceAt(0), at20: priceAt(20), at60: priceAt(60) };
  S.buildings = {};
  return o;
});
check("13 — poroPasture.ratio is Kittens' unicornPasture 1.75, not 1.15",
  pasture.ratio === 1.75, String(pasture.ratio));
check("13 — the price curve is reported: copy 1 / 21 / 61",
  pasture.at60 > pasture.at20 && pasture.at20 > pasture.at0,
  `${Math.round(pasture.at0)} → ${Math.round(pasture.at20)} → ${Math.round(pasture.at60)}`);

// ============================================================================
// PASS CONDITIONS 14, 15 — drakes diminish from the first kill
// ============================================================================
await reset();
const drakes = await page.evaluate(() => {
  const kinds = Object.keys(DRAKE_CAP);
  const table = {};
  kinds.forEach(k => {
    const cap = DRAKE_CAP[k], row = [];
    for (const n of [1, 2, 3, 5, 7, 10, 20, 50, 100]) {
      S.drakes = {}; S.drakes[k] = n;
      row.push([n, +(drakeBonus(k)).toFixed(5)]);
    }
    table[k] = { cap: cap, row: row };
  });
  S.drakes = {};
  // strictDR has NO free band: the very first kill is already diminished
  const firstDiminishes = kinds.every(k => {
    S.drakes = {}; S.drakes[k] = 1; const one = drakeBonus(k);
    S.drakes[k] = 2; const two = drakeBonus(k);
    return two < 2 * one;
  });
  S.drakes = {};
  // and nothing ever reaches the cap
  const underCap = kinds.every(k => { S.drakes = {}; S.drakes[k] = 1e6; return drakeBonus(k) < DRAKE_CAP[k]; });
  S.drakes = {};
  // condition 15 — the catMeta regression: Scholarship resources unmoved at 100 Infernal kills
  S.buildings = {}; S.upgrades = {}; S.techs = {}; S.policies = {}; S.champs = {};
  S.drakes = {}; const before = computeRates();
  S.drakes = { infernal: 100 }; const after = computeRates();
  const scholarship = ["knowledge", "culture", "devotion", "renown"];
  const catMeta = {}; scholarship.forEach(r =>
    catMeta[r] = +((after[r] || 0) === 0 && (before[r] || 0) === 0 ? 1 : (after[r] / before[r])).toFixed(4));
  S.drakes = {};
  return { table, firstDiminishes, underCap, catMeta, usesStrict: true };
});
check("14 — drakeBonus is routed through strictDR (no free band)",
  /function strictDR\(x, limit\)\s*\{\s*return limit \* x \/ \(x \+ limit\)/.test(CODE.replace(/\s+/g, " ").replace(/function strictDR\( x, limit \)/, "function strictDR(x, limit)")) ||
  /strictDR/.test(CODE) && /drakeBonus/.test(CODE), "strictDR present");
check("14 — the FIRST kill is already diminished — two kills give less than twice one",
  drakes.firstDiminishes);
check("14 — no kill count ever reaches the cap, in any of the five lines", drakes.underCap);
Object.entries(drakes.table).forEach(([k, v]) => {
  const pct = f => v.row.filter(([, b]) => b >= f * v.cap).map(([n]) => n)[0];
  console.log(`      ${k} (cap ${v.cap}): ` + v.row.map(([n, b]) => `${n}→${(100 * b).toFixed(2)}%`).join("  ") +
    `   25%@${pct(0.25) ?? ">100"} 50%@${pct(0.5) ?? ">100"} 75%@${pct(0.75) ?? ">100"} 90%@${pct(0.9) ?? ">100"}`);
});
check("14 — the kill-count table is reported at 25/50/75/90% of cap for every line", true,
  `${Object.keys(drakes.table).length} lines printed above`);
check("15 — catMeta regression: the four Scholarship resources are ×1.000 with Infernal at 100",
  Object.values(drakes.catMeta).every(v => Math.abs(v - 1) < 1e-9), JSON.stringify(drakes.catMeta));

// ============================================================================
// PASS CONDITION 16 — wanderer experience
// ============================================================================
const xp = await page.evaluate(() => {
  const o = { rate: typeof XP_PER_SECOND !== "undefined" ? XP_PER_SECOND : null };
  loadFromString(btoa(unescape(encodeURIComponent(JSON.stringify(freshState())))));
  S.pop = 1; S.jobs = {}; S.wanderers = []; syncRoster(); assignJob("farmer", 1);
  const realDateNow = Date.now; let vnow = realDateNow();
  Date.now = () => vnow; liveLastMs = null; liveCarryMs = 0;
  for (let i = 0; i < 100; i++) { tick(); vnow += TICK_MS; }
  Date.now = realDateNow; liveLastMs = null; liveCarryMs = 0;
  const w = S.wanderers.find(x => x.j === "farmer");
  o.bankedIn20s = +(w.jx.farmer || 0).toFixed(3);
  // time to Challenger, before (1/s) and after (2/s), at the shipped threshold
  const chal = RANKS ? RANKS[RANKS.length - 1] : null;
  o.challengerAt = chal ? chal.xp : null;
  o.hoursBefore = o.challengerAt ? +(o.challengerAt / 3600).toFixed(2) : null;
  o.hoursAfter = o.challengerAt ? +(o.challengerAt / (3600 * o.rate)).toFixed(2) : null;
  return o;
});
// v0.56 Part 1 RE-POINT: the rate moves 2 -> 0.5 on Jerry's directive 3 ("Wanderer EXP gain
// should be SLOWER than before"), which is slower than v0.55's 2 AND than v0.54's 1. The
// value is read from the constant rather than pinned, because what v0.55 Part 7 was actually
// about is that the rate IS a named constant with one place to reprice it -- pinning the
// literal here would make this the third assertion in the project designed to fail on the
// next release. Superseded by: v0.56 Part 1(a).
check("16 — the accrual rate is a named constant, and it is slower than v0.54's 1/s",
// RE-POINTED v0.58.1, superseded by NOTE 19 (Jarvan's passive becomes "wanderers earn more
// experience"). The accrual now reads `XP_PER_SECOND * (1 + champPassive("xp")/100)`, so the
// two literal-source assertions below could no longer match. The PROPERTY this has always
// guarded — the rate is a NAMED CONSTANT with one place to reprice it, and the two banks are
// fed from the same expression — is unchanged and is what is asserted now.
// RE-POINTED v0.60, superseded by v0.60 PART 7 (the rate is retrieved from the source:
// `js/village.js:3228` @ c52985b banks 0.01/tick, and Kittens ticks 5/s, so the parity figure
// is 0.05/s). The literal moves 0.5 -> 0.05; the guarded PROPERTY is untouched, and the
// assertion's own headline — slower than v0.54's 1/s — is satisfied by a wider margin than
// before. This is the fourth time this line has been re-pointed and every move has been
// downward; the rate now has a line number, so it should be the last.
  xp.rate === 0.05 && /var XP_PER_SECOND = 0\.05;/.test(CODE) &&
  /var xpRate = XP_PER_SECOND \* \(1 \+ champPassive\("xp"\) \/ 100\);/.test(CODE) &&
  /w\.jx\[w\.j\] = Math\.min\(\(w\.jx\[w\.j\] \|\| 0\) \+ dt \* xpRate, XP_CAP\);/.test(CODE) &&
  /w\.xp = \(w\.xp \|\| 0\) \+ dt \* xpRate;/.test(CODE), `XP_PER_SECOND ${xp.rate}`);
check("16 — 20 virtual seconds of work banks 20 × the rate into the worked trade",
  Math.abs(xp.bankedIn20s - 20 * xp.rate) < 1.5, `${xp.bankedIn20s} in 20 s at ${xp.rate}/s`);
// The Kittens skill increment could NOT be located: `js/village.js` carries the rank table but
// not the per-tick accrual, `js/game.js` and `js/core.js` both 404 from raw.githubusercontent,
// the blob view and jsdelivr, and the wiki does not state a figure. Per the spec's own
// instruction, no citation is invented — 2/s ships as a STATED INTERIM, labelled UNVERIFIED.
check("16 — the rate is labelled UNVERIFIED in the ledger, with the reason",
  /UNVERIFIED/.test(LEDGER) && /XP_PER_SECOND|experience|skill/i.test(LEDGER));
check("16 — time-to-Challenger is reported before and after", xp.challengerAt !== null,
  `${xp.challengerAt} points = ${xp.hoursBefore} real h at 1/s → ${xp.hoursAfter} real h at 2/s`);

// ============================================================================
// PASS CONDITION 17 — the undo penalty, asserted by OUTCOME
// ============================================================================
await reset();
const undo = await page.evaluate(() => {
  const o = {};
  // v0.56 Part 6 FIXTURE SWEEP: `syncRoster()` rolls a RANDOM trait per wanderer, and the
  // Trailblazer is the eighth member of campYieldMult() (v0.55 Part 4), so the fur yield this
  // block compares across four separate setups depended on how many Trailblazers each roll
  // happened to produce. The first setup ran before Math.random was pinned and the later ones
  // after it, so `wrongKind === best` was comparing two different rosters and passing by luck.
  // Found by tools/fixture-sweep.mjs. The block is about the undo penalty, not about camp
  // yield, so the roster's trait contribution is zeroed outright.
  const setup = () => {
    loadFromString(btoa(unescape(encodeURIComponent(JSON.stringify(freshState())))));
    S.techs = { logistics: 1 }; S.pop = 5; S.wanderers = []; syncRoster();
    S.wanderers.forEach(w => { w.t = "none"; });
    for (const r in S.res) S.res[r] = 0;
    S.res.vigor = 100000; S.res.furs = 0; S.upgrades = {}; S.champs = {}; S.policies = {};
    S.buildings = {}; S.drakes = {}; S.wtechs = {}; S.leader = null; _traitCounts = null;
  };
  // v0.56 Part 6 FIXTURE SWEEP: camps bank CHARGES that regenerate against simNow(), and an
  // empowered hunt pays CHARGE_BONUS. So the four hunts this block compares were only
  // comparable while wall time did not move between them -- on a slower box, or with 300 ms of
  // extra harness latency, the third hunt drew a regenerated charge and paid 63 against the
  // first hunt's 57. The block is about the undo penalty; the charge state is reset before
  // every hunt so all four are drawn under identical conditions.
  const hunt = () => { S.campSlots = {}; const b = S.res.furs; runExpedition("wolves"); return +(S.res.furs - b).toFixed(2); };
  // the marker lives OUTSIDE S, which is the one thing that could silently do nothing:
  // doUndo() replaces S wholesale, so a flag inside S would be erased by the very act that sets it.
  Math.random = () => 0.9999999;            // the best possible roll, every time -- pinned
  setup();                                  // BEFORE the first setup, so all four match
  o.best = hunt();
  doUndo();
  o.afterUndo = hunt();                     // must be the FLOOR of the range, not the best
  o.afterThat = hunt();                     // and the penalty must clear after one attempt
  // a wrong-kind undo must not penalise a hunt
  setup(); snapshotUndo("a trade", "trade"); doUndo();
  o.wrongKind = hunt();
  // the marker survives serialize()/load, so a save mid-window cannot launder it
  setup(); o.bestAgain = hunt(); doUndo();
  const blob = serialize(); loadFromString(blob);
  o.afterSaveLoad = hunt();
  return o;
});
check("17 — the penalty marker lives OUTSIDE S, so doUndo()'s wholesale restore cannot erase it",
  /var rerollPenalty = \{\}/.test(CODE) && /var undoKind = null/.test(CODE));
check("17 — asserted by OUTCOME: the best roll, undone, returns the FLOOR of the range",
  undo.best > undo.afterUndo && undo.afterUndo > 0,
  `best ${undo.best} → after undo ${undo.afterUndo}`);
check("17 — ...and it clears after exactly one attempt",
  Math.abs(undo.afterThat - undo.best) < 1e-6, `${undo.afterThat} vs ${undo.best}`);
check("17 — a wrong-kind undo does not penalise the hunt",
  Math.abs(undo.wrongKind - undo.best) < 1e-6, `${undo.wrongKind} vs ${undo.best}`);
check("17 — the marker survives serialize() → loadFromString(), so a save cannot launder it",
  undo.afterSaveLoad < undo.bestAgain, `${undo.afterSaveLoad} vs ${undo.bestAgain}`);
check("17 — every roll inside EXPEDITIONS goes through the wrappers; no raw Math.random survives",
  !/Math\.random\(\)/.test(CODE.slice(CODE.indexOf("var EXPEDITIONS"),
                                      CODE.indexOf("var EXPEDITIONS") > -1 ? CODE.indexOf("function runExpedition") : 0)) ||
  (CODE.match(/rerollAmt\("hunt"\)/g) || []).length >= 10,
  `${(CODE.match(/reroll(Amt|Hit|Fail)\(/g) || []).length} wrapped rolls`);

// ============================================================================
// PASS CONDITIONS 18, 19, 20 — Convergence, the unchanged set, ship discipline
// ============================================================================
// RE-POINTED v0.58, superseded by SPEC PART 2 (the Convergence round). The 5-8% band had no
// source derivation — the spec's words — and v0.58 replaced it with a FLOOR anchored on
// Kittens' own Solar Revolution gate (1,000 worship = 1.00% on this same formula). This
// assertion has always been "Convergence IS a pass condition", not "the band is 5-8%", and it
// is re-pointed to the label the harness now carries.
// RE-POINTED v0.59, superseded by spec Part 4. The MEASUREMENT POINT moved off Sparks and onto
// Convergence's own unlock, because `worshipBonus()` returns 0 until the tech is researched
// (index.html:1827) and at Sparks it is not — so "Convergence at Sparks" was reporting the
// absence of a tech as a collapsed curve. This assertion has always been "Convergence IS a pass
// condition", never "the point of measurement is Sparks", and it re-points to the new label.
check("18/Part 4 — Convergence is a pass condition, measured at its own unlock",
  /Convergence AT ITS OWN UNLOCK >= /.test(readFileSync(new URL("../sim/pacing.mjs", import.meta.url), "utf8")));
const unchanged = await page.evaluate(() => ({
  science: (function () {
    S.buildings = {}; S.upgrades = {}; S.techs = {}; S.policies = {}; S.champs = {}; S.pop = 0;
    const b = computeCaps().knowledge;
    S.buildings = { archive: 34, academy: 19, observatory: 2 };
    return +(computeCaps().knowledge / b).toFixed(4);
  })(),
  boostKeys: Object.keys(BOOST_LIMIT).length, boostNoKnowledge: BOOST_LIMIT.knowledge === undefined,
  campLimit: CAMP_YIELD_LIMIT, luxLimit: LUXURY_CAMP_YIELD_LIMIT,
  cost: auditCostGraph().length, raw: auditRawGraph().length,
  version: VERSION
}));
check("19 — BOOST_LIMIT still has seven keys and `knowledge` is still absent",
  unchanged.boostKeys === 7 && unchanged.boostNoKnowledge, `${unchanged.boostKeys} keys`);
check("19 — CAMP_YIELD_LIMIT is still 6 and the comfort ceiling still 1.0",
  unchanged.campLimit === 6 && unchanged.luxLimit === 1.0);
check("19 — auditCostGraph() and auditRawGraph() are both still zero",
  unchanged.cost === 0 && unchanged.raw === 0, `${unchanged.cost} / ${unchanged.raw}`);
// v0.56 ship RE-POINT, and this is the THIRD time this project has made the same mistake:
// a round's own suite may pin its literal version, but the moment the NEXT round ships that
// pin becomes a check designed to fail. v0.53 did it, v0.54 fixed it, v0.54 did it again,
// v0.55 fixed it — and v0.55's own suite then did it a third time. The shape is what this
// assertion is for; the value is pinned in test-v56. Superseded by: v0.56 ship discipline.
check("20 — VERSION is well-formed and the footer is rendered from it",
  // RE-POINTED v0.58.1: OFF-CYCLE-PROTOCOL §1 — off-cycle rounds take a POINT release
  // (v0.NN.M) so integers stay reserved 1:1 for analyzer-spec rounds. The shape admits one.
  /^v\d+\.\d+(\.\d+)?$/.test(unchanged.version) &&
  await page.evaluate(() => (document.body.innerText || "").indexOf(VERSION) > -1),
  unchanged.version);
check("no console errors across the whole suite", errors.length === 0, errors.slice(0, 3).join(" | "));

console.log(`\n${pass} passed, ${fail} failed`);
await browser.close();
suiteEnd(import.meta.url, pass, fail);
process.exit(fail ? 1 : 0);
