// test-v56 — BUILDER SPEC v0.56 pass conditions, plus Jerry's provisions-cap directive.
//
// Sixteen round pass conditions, asserted in spec order. Where a condition says "reported",
// the value is printed beside the assertion so the build report can be read against a run of
// this file rather than against prose.
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

const RAW = readFileSync(new URL("../index.html", import.meta.url), "utf8");
const strip = s => s.replace(/\/\*[\s\S]*?\*\//g, "").split("\n")
  .map(l => l.replace(/(^|[^:])\/\/.*$/, "$1")).join("\n");
const CODE = strip(RAW);

// ============================================================================
// PASS CONDITIONS 1, 2 — the fixture, and a suite total the analyzer can reproduce
// ============================================================================
// Condition 1 is about test-v32, which cannot assert itself, so what is asserted here is the
// FIX — that the block resets every container feeding the function it baselines. The 10/10
// run is reported in BUILD REPORT §4 and is reproducible with `for i in $(seq 10); do node
// tests/test-v32.mjs; done`.
const V32 = readFileSync(new URL("./test-v32.mjs", import.meta.url), "utf8");
check("1 — test-v32's camp block resets the ROSTER it baselines, not just upgrades/jobs/buildings",
  /S\.wanderers = \[\]; S\.champs = \{\}; S\.policies = \{\};/.test(V32) &&
  /_traitCounts = null;[\s\S]{0,80}const base = campYieldMult\(\);/.test(V32));
check("1 — ...and the baseline is asserted to BE 1.000, so a future leak fails loudly",
  /the camp-yield baseline is a clean 1\.000/.test(V32));
// The generalisation the spec asks to be written down: a test that captures a baseline from
// live state must reset the state it is baselining. tools/fixture-sweep.mjs is the detector.
const SWEEP = readFileSync(new URL("../tools/fixture-sweep.mjs", import.meta.url), "utf8");
check("2 — the fixture sweep exists as a re-runnable tool, not as a one-off inspection",
  /dirty/i.test(SWEEP) && /ARTEFACT/.test(SWEEP));
check("2 — ...and it names its own known artefact rather than reporting it as a defect",
  /merges a save OVER freshState\(\)/.test(SWEEP) && /not a defect/.test(SWEEP));

// ============================================================================
// PASS CONDITIONS 3, 4, 5 — the storage-scope restructure
// ============================================================================
await reset();
const store = await page.evaluate(() => {
  const STORE = ["expandedStores", "ironboundStores", "hexRunedStores", "chemtechSilos", "voidwardStores"];
  const capped = Object.keys(RES).filter(r => RES[r].baseCap !== undefined);
  const bare = () => { S.buildings = {}; S.upgrades = {}; S.techs = {}; S.policies = {};
                       S.champs = {}; S.leader = null; S.pop = 0; S.wanderers = [];
                       S.drakes = {}; S.wtechs = {}; if (typeof _traitCounts !== "undefined") _traitCounts = null; };
  bare(); const before = computeCaps();
  S.upgrades = {}; STORE.forEach(u => S.upgrades[u] = 1);
  const after = computeCaps();
  const delivered = {}; capped.forEach(r => { if (before[r] > 0) delivered[r] = +(after[r] / before[r]).toFixed(4); });
  // the quarter tier must be GATED, exactly as the source gates catnip on silos
  S.upgrades = { expandedStores: 1, ironboundStores: 1, hexRunedStores: 1, voidwardStores: 1 };
  const noSilos = computeCaps().provisions / before.provisions;
  S.upgrades = {}; STORE.forEach(u => S.upgrades[u] = 1);
  const withSilos = computeCaps().provisions / before.provisions;
  bare();
  return {
    delivered,
    scope: Object.fromEntries(capped.map(r => [r, CAP_SCOPE[r] || "MISSING"])),
    // v0.57 Part 1: the invariant strengthens from "CAP_SCOPE is total" to "every capped
    // resource is in EXACTLY ONE family". Until v0.57, culture/devotion/knowledge/vigor were in
    // CAP_SCOPE as "none" AND in SCHOLAR_CAPS or CAP_MULT_EXEMPT — two families each, with the
    // storage loop's ternary silently deciding which one won. Renown joining SCHOLAR_CAPS while
    // still reading `broad` in CAP_SCOPE would have made that table state a figure the code did
    // not deliver.
    family: Object.fromEntries(capped.map(r => [r, capFamilyOf(r)])),
    uncovered: capped.filter(r => capFamilyOf(r) === null),
    multiFamily: capped.filter(r =>
      // RE-POINTED v0.59 Part 5.3: two families, same invariant
      [CAP_MULT_EXEMPT[r], CAP_SCOPE[r]].filter(Boolean).length !== 1),
    stray: Object.keys(CAP_SCOPE).filter(r => RES[r] === undefined || RES[r].baseCap === undefined),
    barnSum: +BARN_LINE.reduce((a, u) => a + u[1], 0).toFixed(4),
    wareSum: +WAREHOUSE_LINE.reduce((a, u) => a + u[1], 0).toFixed(4),
    tiers: [...new Set(capped.map(r => CAP_SCOPE[r]))].sort(),
    noSilos: +noSilos.toFixed(4), withSilos: +withSilos.toFixed(4),
    gate: QUARTER_GATE
  };
});
check("3 — `masonryMult` is gone from the source; nothing multiplies a chain of five literals",
  !/var masonryMult/.test(CODE) && !/masonryMult \*= /.test(CODE) &&
  !/\["expandedStores", 1\.75\]/.test(CODE));
check("3 — two ADDITIVE accumulators, at the source's own sums (barn 4.35, warehouse 1.80)",
  store.barnSum === 4.35 && store.wareSum === 1.8, `barn Σ ${store.barnSum}, warehouse Σ ${store.wareSum}`);
check("3 — every capped resource lands in EXACTLY ONE cap FAMILY, and no tier names a non-resource",
  store.uncovered.length === 0 && store.stray.length === 0 && store.multiFamily.length === 0,
  `${Object.keys(store.family).length} capped resources; ` +
  `uncovered [${store.uncovered.join(",")}] multi-family [${store.multiFamily.join(",")}] stray [${store.stray.join(",")}]`);
// PASS CONDITION 4. The spec's own table states ×14.84 and ×2.075, which imply a barn sum of
// 4.30 — the source's 4.35 minus `strenghtenBuild`'s 0.05, which the SAME SPEC's prose counts,
// and which its warehouse sum of 1.80 also counts. The spec disagrees with itself by one
// upgrade in one direction only. Under STANDING-RULINGS §16 the source is the balance
// authority, so the sourced 4.35 ships. Reported in BUILD REPORT §5.
check("4 — fully stacked: narrow ×14.98 · broad ×2.80 · quarter ×2.0875 · none ×1.00",
  Math.abs(store.delivered.timber - 14.98) < 1e-3 &&
  Math.abs(store.delivered.gold - 2.80) < 1e-3 &&
  Math.abs(store.delivered.provisions - 2.0875) < 1e-3 &&
  Math.abs(store.delivered.voidessence - 1.00) < 1e-9,
  `timber ×${store.delivered.timber}, gold ×${store.delivered.gold}, provisions ×${store.delivered.provisions}, voidessence ×${store.delivered.voidessence}`);
check("4 — ...and every MASONRY resource's delivered multiplier matches its declared tier",
  Object.keys(store.family).filter(r => store.family[r] === "masonry").every(r => {
    const want = { narrow: 14.98, broad: 2.80, quarter: 2.0875, none: 1.00 }[store.scope[r]];
    return store.delivered[r] === undefined || Math.abs(store.delivered[r] - want) < 1e-3;
  }),
  Object.entries(store.family).map(([r, f]) =>
    `${r}:${f === "masonry" ? store.scope[r] : f}=${store.delivered[r] ?? "—"}`).join(" "));
check("4 — ...and NO scholar- or exempt-family resource is moved by the Masonry line at all",
  Object.keys(store.family).filter(r => store.family[r] !== "masonry")
    .every(r => store.delivered[r] === undefined || Math.abs(store.delivered[r] - 1) < 1e-9),
  Object.keys(store.family).filter(r => store.family[r] !== "masonry")
    .map(r => `${r} ×${store.delivered[r] ?? "—"}`).join(" "));
check("4 — the quarter tier is GATED on Silos, exactly as `js/resources.js` gates catnip",
  store.gate === "chemtechSilos" && store.noSilos === 1 && store.withSilos === 2.0875,
  `without ${store.gate}: ×${store.noSilos}; with: ×${store.withSilos}`);
// Condition 5 (Era-3 cap-out 30–60%) is a RUN measurement, not a state measurement. It is
// asserted by sim/pacing.mjs, which prints it as a pass/fail line; what is asserted here is
// that the harness measures every capped resource rather than the two it used to.
const SIMCORE = readFileSync(new URL("../sim/simcore.mjs", import.meta.url), "utf8");
const PACING = readFileSync(new URL("../sim/pacing.mjs", import.meta.url), "utf8");
// v0.57 Part 6 RE-POINT: the printed condition string changed when pass condition 5 was
// RESTATED — the 30–60% cap-out band now applies only to stock-limited raws, because three of
// its four resources turned out to be lumpy-sink-only and a ceiling cannot move them. What this
// assertion is about is the INSTRUMENTATION, which is unchanged and now richer.
// Superseded by: v0.57 Part 6.
check("5 — the harness records time-at-cap for EVERY capped resource, not just vigor and crystals",
  /const capTicks = \{\}/.test(SIMCORE) && /capOutPct:/.test(SIMCORE) &&
  /30-60% cap-out band/.test(PACING));

// ============================================================================
// JERRY'S DIRECTIVE — the provisions cap, and Deepwinter
// ============================================================================
await reset();
const food = await page.evaluate(() => {
  const B = id => BUILDINGS.find(b => b.id === id);
  const w = B("warehouse");
  S.buildings = {}; S.upgrades = {}; S.techs = {}; S.pop = 0; S.wanderers = [];
  S.champs = {}; S.leader = null; S.drakes = {}; S.policies = {}; S.wtechs = {};
  S.buildings = { warehouse: 10 };
  const noSilos = computeCaps().provisions;
  S.upgrades = { chemtechSilos: 1 };
  const withSilos = computeCaps().provisions;
  S.buildings = {}; S.upgrades = {};
  return {
    storehouse: B("storehouse").caps.provisions,
    harbor: B("harbor").caps.provisions,
    warehouseBase: (w.caps || {}).provisions,
    warehouseIf: w.capsIf && w.capsIf.caps.provisions, warehouseGate: w.capsIf && w.capsIf.upgrade,
    tenWarehousesNoSilos: Math.round(noSilos), tenWarehousesWithSilos: Math.round(withSilos),
    consumption: CONSUMPTION, farmer: JOBS.find(j => j.id === "farmer").prod.provisions
  };
});
check("Jerry — the Storehouse holds Kittens' barn figure exactly: 5,000 (was 7,500, ×1.5 the source)",
  food.storehouse === 5000, String(food.storehouse));
check("Jerry — the Harbor holds Kittens' harbour figure exactly: 2,500 (was 10,000, ×4 the source)",
  food.harbor === 2500, String(food.harbor));
check("Jerry — the Warehouse holds 750, and ONLY once Silos is researched, as the source does",
  food.warehouseBase === undefined && food.warehouseIf === 750 && food.warehouseGate === "chemtechSilos" &&
  food.tenWarehousesWithSilos - food.tenWarehousesNoSilos > 0,
  `${food.tenWarehousesNoSilos} → ${food.tenWarehousesWithSilos} with ten Warehouses`);
// Counting occurrences was the wrong proxy — a legitimate field is referenced wherever it is
// read. What "declared field, not a special case" actually means is: DECLARED on exactly one
// building, and READ in exactly the two places every other cap field is read (the cap maths
// and the tooltip generator). That is what is asserted.
check("Jerry — a conditional cap is a declared field: one declaration, read by the maths and the tooltip",
  /capsIf: \{ upgrade: "chemtechSilos", caps: \{ provisions: 750 \} \}/.test(CODE) &&
  (CODE.match(/capsIf: \{/g) || []).length === 1 &&
  // RE-POINTED v0.58, superseded by JERRY'S DEV NOTE 2 ("Warehouses should not say +provisions
  // until the discovery is actually unlocked. No spoilers!"). The tooltip used to read the
  // field UNGATED so it could advertise the payoff early; it now reads it through the same
  // gate the maths uses. So both read sites are the gated form, and there are two of them.
  (CODE.match(/if \(b\.capsIf && S\.upgrades\[b\.capsIf\.upgrade\]\)/g) || []).length === 2,
  `${(CODE.match(/capsIf: \{/g) || []).length} declaration(s)`);

// ============================================================================
// PASS CONDITIONS 6, 7, 8 — wanderer experience
// ============================================================================
await reset();
const xp = await page.evaluate(() => {
  const o = { rate: XP_PER_SECOND, cap: XP_CAP, top: RANKS[RANKS.length - 1].xp };
  o.hoursToChallenger = +(o.top / (3600 * o.rate)).toFixed(2);
  o.hoursBefore = +(o.top / (3600 * 2)).toFixed(2);
  // the clamp is real, measured by driving the loop past the cap on a virtual clock
  loadFromString(btoa(unescape(encodeURIComponent(JSON.stringify(freshState())))));
  S.pop = 1; S.jobs = {}; S.wanderers = []; syncRoster(); assignJob("farmer", 1);
  const w0 = S.wanderers.find(x => x.j === "farmer");
  w0.jx.farmer = XP_CAP - 1;
  const realDateNow = Date.now; let vnow = realDateNow();
  Date.now = () => vnow; liveLastMs = null; liveCarryMs = 0;
  for (let i = 0; i < 200; i++) { tick(); vnow += TICK_MS; }
  Date.now = realDateNow; liveLastMs = null; liveCarryMs = 0;
  const w = S.wanderers.find(x => x.j === "farmer");
  o.bankedAfterCap = +(w.jx.farmer || 0).toFixed(3);
  // the lifetime total keeps climbing past the per-trade ceiling: the bank is pinned at
  // XP_CAP while `w.xp` continues to accrue, which is the whole distinction.
  o.lifetimeAtStart = 0;
  o.lifetimeUncapped = !/w\.xp = Math\.min/.test(tick.toString()) && w.xp > 0 && w.jx.farmer === XP_CAP;
  // and a v0.55 save with a million-point bank is clamped on load
  const s = freshState();
  s.wanderers = [{ nm: "Old", j: "farmer", jx: { farmer: 1335491 }, xp: 1335491, t: "none" }];
  s.pop = 1; s.jobs = { farmer: 1 };
  loadFromString(btoa(unescape(encodeURIComponent(JSON.stringify(s)))));
  const mig = S.wanderers[0];
  o.migrated = mig.jx.farmer;
  o.rankUnchanged = rankOf(mig, "farmer").id;
  return o;
});
// RE-POINTED v0.60, superseded by v0.60 PART 7. Directive 3's PROPERTY was "slower than v0.55's
// 2 and than v0.54's 1"; the rate is now the source's own `js/village.js:3228` figure — 0.01 per
// tick at 5 ticks/s = 0.05/s — which satisfies the directive by a wider margin. Asserted as the
// ORDERING the directive actually stated, plus the retrieved literal, so the next reprice fails
// only if it breaks the directive rather than merely because a number moved.
check("6 — XP_PER_SECOND is 0.05 — the source's rate, still slower than v0.55's 2 AND v0.54's 1",
  xp.rate === 0.05 && xp.rate < 1 && xp.rate < 2, `${xp.rate}/s`);
check("6 — time-to-Challenger is reported in real hours, before and after",
  xp.hoursToChallenger > xp.hoursBefore,
  `${xp.top} points = ${xp.hoursBefore} real h at 2/s → ${xp.hoursToChallenger} real h at ${xp.rate}/s`);
check("7 — XP_CAP is 25,556 — Kittens' 20,001 rank-matched against its 9,000 top tier",
  xp.cap === 25556 && /Math\.floor\(11500 \* 20001 \/ 9000\)/.test(CODE),
  `${xp.cap} (the exact ratio is 25,556.833; the spec states the floor)`);
check("7 — the bank is clamped like the source's Math.min(..., skillsCap), by outcome not by grep",
  xp.bankedAfterCap === xp.cap, `${xp.bankedAfterCap} against a cap of ${xp.cap}`);
check("7 — ...and the LIFETIME total is deliberately NOT capped — Kittens' cap is per-skill",
  xp.lifetimeUncapped);
check("7 — a v0.55 save holding 1,335,491 is clamped on load, and its rank does not move",
  xp.migrated === xp.cap && xp.rankUnchanged === "challenger",
  `1335491 → ${xp.migrated}, still ${xp.rankUnchanged}`);
// Condition 8 (Challenger share at Sparks below 62%) is a RUN measurement. What is asserted
// here is that the harness reports the share, which it did not before this round.
check("8 — the harness reports the Challenger SHARE, not just the count",
  /trade-ranks at Challenger of .*\}%/.test(PACING) || /100 \* s2\.xp\.atChallenger \/ s2\.xp\.n/.test(PACING));

// ============================================================================
// PASS CONDITION 9 — consumption returns to the source's line
// ============================================================================
check("9 — CONSUMPTION is Kittens' own 4.25/s (`catnipPerKitten: -0.85` × 5 ticks/s)",
  food.consumption === 4.25, String(food.consumption));
check("9 — the farmer:eater ratio is 1.17647 to 1e-5 — exact parity, and the v0.55 disagreement closes",
  Math.abs(food.farmer / food.consumption - 1.17647) < 1e-5,
  `${food.farmer} / ${food.consumption} = ${(food.farmer / food.consumption).toFixed(5)}`);

// ============================================================================
// PASS CONDITIONS 10, 11 — Leona softens the season
// ============================================================================
await reset();
const leona = await page.evaluate(() => {
  const o = { relief: LEONA_SEASON_RELIEF, without: {}, with_: {} };
  S.weather = "clear"; S.champs = {}; S.leader = null;
  SEASONS.forEach(s => o.without[s.id] = +seasonFarmMult(s, 1).toFixed(6));
  S.champs = { leona: { r: true } }; S.leader = "leona";
  SEASONS.forEach(s => o.with_[s.id] = +seasonFarmMult(s, 1).toFixed(6));
  o.chillyWithout = (function () { S.champs = {}; S.leader = null;
    return +seasonFarmMult(SEASONS.find(s => s.id === "summer"), 0.5).toFixed(6); })();
  o.chillyWith = (function () { S.champs = { leona: { r: true } }; S.leader = "leona";
    return +seasonFarmMult(SEASONS.find(s => s.id === "summer"), 0.5).toFixed(6); })();
  o.lead = champDef("leona").lead;
  S.champs = {}; S.leader = null;
  return o;
});
check("10 — with Leona leading, Deepwinter measures ×0.625 — softened, not deleted",
  leona.with_.winter === 0.625, `×${leona.with_.winter}`);
check("10 — ...and Firstbloom measures ×1.5, UNCHANGED — the clause only lifts values below 1",
  leona.with_.spring === 1.5, `×${leona.with_.spring}`);
check("10 — a cold snap is halved too: ×0.5 → ×0.75", leona.chillyWith === 0.75,
  `×${leona.chillyWithout} → ×${leona.chillyWith}`);
check("10 — the old `Math.max(1, season.farmMult)` flooring is GONE from live source",
  !/Math\.max\(1, season\.farmMult\)/.test(CODE) && !/Math\.max\(1, currentSeason\(\)\.farmMult\)/.test(CODE));
check("10 — the forecast UI DERIVES from seasonFarmMult() rather than hard-coding a winter figure",
  !/winterFarm = leaderIs\("leona"\) \? 1 : 0\.25/.test(CODE) &&
  /var winterFarm = seasonFarmMult\(SEASONS\.find/.test(CODE) &&
  (CODE.match(/seasonFarmMult\(/g) || []).length >= 4);
check("10 — ...and the lead PROSE is generated from the constant, so it cannot promise the old behaviour",
  /lose half their bite/.test(leona.lead) && /0\.25/.test(leona.lead) && /0\.625/.test(leona.lead) &&
  !/never touch the harvest/.test(leona.lead), leona.lead);
check("11 — with no leader, all four seasons are bit-identical to v0.55: 1.5 / 1.0 / 1.0 / 0.25",
  leona.without.spring === 1.5 && leona.without.summer === 1 &&
  leona.without.autumn === 1 && leona.without.winter === 0.25,
  JSON.stringify(leona.without));
// v0.57 Part 2 RE-POINT: §17 is AMENDED by Jerry's v0.57 directive 2, which is the mechanism
// §17's own preamble provides for. The farmer's season term is removed; what this assertion was
// really guarding -- that Part 3's Leona work did not disturb the seasonal path -- now belongs
// to the BUILDING line, which is the one the source actually makes seasonal.
// Superseded by: v0.57 Part 2.
check("11 — ...and the SEASONAL BUILDING line is untouched — that is the one the source makes seasonal",
  /if \(b\.seasonal && r === "provisions"\) amt \*= farmMult;/.test(CODE) &&
  !/if \(r === "provisions"\) jv \*= farmMult;/.test(CODE));

// ============================================================================
// PASS CONDITIONS 12, 13, 14 — reporting requirements
// ============================================================================
check("12 — farmer count, gross/eat/net and provisions held ÷ cap are all in the snapshot",
  /farmers: S\.jobs\.farmer \|\| 0/.test(SIMCORE) && /eatPerSec:/.test(SIMCORE) &&
  /provisionsCap:/.test(SIMCORE) && /heldOverCap/.test(SIMCORE));
check("13 — drake kills per type are recorded at every milestone",
  /kills: S\.drakes\[d\.id\] \|\| 0/.test(SIMCORE) && /drakes: /.test(PACING));
const LEDGER = readFileSync(new URL("../docs/PARITY-LEDGER.md", import.meta.url), "utf8");
const led = await page.evaluate(() => ({
  techs: TECHS.map(t => t.id), buildings: BUILDINGS.map(b => b.id), upgrades: UPGRADES.map(u => u.id),
  jobs: JOBS.map(j => j.id), crafts: CRAFTS.map(c => c.id),
  champions: CHAMPS.map(c => c.id), leads: CHAMPS.map(c => c.id + "-lead")
}));
const rowId = l => (l.match(/^\|\s*`([^`]+)`/) || [])[1];
const sectionRows = name => {
  const lines = LEDGER.split("\n");
  const start = lines.findIndex(l => new RegExp("^## " + name + "\\b").test(l));
  if (start < 0) return [];
  const rest = lines.slice(start + 1);
  const end = rest.findIndex(l => /^## /.test(l));
  return (end < 0 ? rest : rest.slice(0, end)).filter(l => /^\|\s*`/.test(l));
};
const SECTION = { techs: "TECHS", buildings: "BUILDINGS", upgrades: "UPGRADES", jobs: "JOBS",
                  crafts: "CRAFTS", champions: "CHAMPIONS", leads: "LEADS" };
const missing = k => {
  const ids = sectionRows(SECTION[k]).map(rowId).filter(Boolean);
  return led[k].filter(id => ids.filter(x => x === id).length !== 1);
};
check("14 — the ledger still covers every tech, building, upgrade, job and craft exactly once",
  ["techs", "buildings", "upgrades", "jobs", "crafts"].every(k => missing(k).length === 0),
  ["techs", "buildings", "upgrades", "jobs", "crafts"].map(k => `${k}:${missing(k).length}`).join(" "));
check("14 — Part 7.6: every CHAMPION and every LEAD is now a labelled row of its own",
  missing("champions").length === 0 && missing("leads").length === 0,
  `${led.champions.length} champions, ${led.leads.length} leads`);
const VERDICTS = ["PARITY", "EASIER", "HARDER", "UNVERIFIED"];
const rows = LEDGER.split("\n").filter(l => /^\|\s*`/.test(l));
const counts = {}; VERDICTS.forEach(v => counts[v] = rows.filter(l => new RegExp("\\b" + v + "\\b").test(l)).length);
check("14 — no blank rows, and the UNVERIFIED count is reported",
  rows.every(l => VERDICTS.some(v => new RegExp("\\b" + v + "\\b").test(l))), JSON.stringify(counts));
// RE-POINTED v0.60, superseded by v0.60 PART 7. The point of this line in v0.56 was that the two
// retrieved facts were labelled PARITY while the ONE unretrieved fact was labelled honestly
// rather than assumed — not that the XP rate was permanently unverifiable. It is now retrieved
// (`js/village.js:3228` @ c52985b) and labelled PARITY like its neighbours. Re-pointed to the
// property that survives: each of the three is labelled to the state of its OWN retrieval, and
// the row that changed carries the citation that changed it.
check("14 — the storage restructure, the skill cap AND the now-retrieved XP rate are all PARITY",
  /addBarnWarehouseRatio[\s\S]{0,400}\*\*PARITY\*\*/.test(LEDGER) &&
  /skillsCap = 20001[\s\S]{0,400}\*\*PARITY\*\*/.test(LEDGER) &&
  /XP_PER_SECOND = 0\.05[\s\S]{0,600}\*\*PARITY\*\*/.test(LEDGER) &&
  /XP_PER_SECOND = 0\.05[\s\S]{0,400}js\/village\.js:3228/.test(LEDGER));

// ============================================================================
// PASS CONDITION 15 — the unchanged set
// ============================================================================
const unchanged = await page.evaluate(() => {
  S.buildings = {}; S.upgrades = {}; S.techs = {}; S.policies = {}; S.champs = {};
  S.leader = null; S.pop = 0; S.wanderers = []; S.drakes = {}; S.wtechs = {};
  // Kittens' own end-of-tree counts: library 30, academy 30, observatory 25, biolab 13,
  // js/buildings.js scienceRatio 0.1/0.2/0.25/0.35 -> Sigma 19.80 -> x20.80. Read through
  // computeRates() with workers, exactly as test-v52 Part 0 reads it -- computeCaps() is the
  // wrong instrument here, because knowledge's baseCap is 0 and the quotient is Infinity.
  S.jobs = { loremaster: 20 }; S.pop = 20;
  S.buildings = { archive: 30, academy: 30, observatory: 25, hexLab: 13 };
  const withAll = computeRates().knowledge;
  S.buildings = {};
  const science = +(withAll / computeRates().knowledge).toFixed(4);
  S.jobs = {}; S.pop = 0;
  const sci = TECHS.filter(t => t.cost.knowledge).sort((a, b2) => a.cost.knowledge - b2.cost.knowledge);
  const ks = sci.map(t => t.cost.knowledge);
  const steps = []; for (let i = 1; i < ks.length; i++) steps.push(ks[i] / ks[i - 1]);
  const sorted = [...steps].sort((a, b2) => a - b2);
  const med = sorted.length % 2 ? sorted[(sorted.length - 1) / 2] : (sorted[sorted.length / 2 - 1] + sorted[sorted.length / 2]) / 2;
  const geo = Math.exp(steps.reduce((a, v) => a + Math.log(v), 0) / steps.length);
  return { science, boostKeys: Object.keys(BOOST_LIMIT).length,
           noKnowledge: BOOST_LIMIT.knowledge === undefined, campLimit: CAMP_YIELD_LIMIT,
           n: sci.length, ties: steps.filter(v => v === 1).length,
           med: +med.toFixed(4), geo: +geo.toFixed(4), max: +Math.max(...steps).toFixed(3),
           cost: auditCostGraph().length, raw: auditRawGraph().length, version: VERSION };
});
check("15 — science parity is still ×20.8000", Math.abs(unchanged.science - 20.8) < 1e-3, `×${unchanged.science}`);
check("15 — BOOST_LIMIT still has seven keys and `knowledge` is still absent",
  unchanged.boostKeys === 7 && unchanged.noKnowledge, `${unchanged.boostKeys} keys`);
check("15 — CAMP_YIELD_LIMIT is still 6", unchanged.campLimit === 6);
// RE-POINTED v0.59.1 — notes 3 and 4.2. Deleting Kindling Theory takes the ladder 37 -> 36,
// which changes the count, drops one tie and moves the geometric mean; swapping Sump
// Ecology and The Chemtech Whisper reorders two adjacent rungs. All five figures are
// RE-MEASURED here rather than nudged: 36 techs, 8 ties, median ×1.1111 (unmoved), geo
// ×1.2717, max ×3.333 (unmoved). The BANDS the ladder is judged against are untouched.
// RE-POINTED v0.61, superseded by DEV NOTE 4 (the merge of The Champions' Regimen and Deep
// Cartography into The Vanguard Doctrine at 45,000). The ladder is 35 techs; both retired ids
// are RESERVED under §30 until v1.0. The SHAPE conditions are unchanged.
check("15 — the ladder is unmoved apart from the merge: 35 techs, 8 ties, median ×1.1111, max ×3.333",
  unchanged.n === 35 && unchanged.ties === 8 && unchanged.med === 1.1111 &&
  unchanged.max === 3.333,
  `N=${unchanged.n}, ${unchanged.ties} ties, ×${unchanged.med}, ×${unchanged.geo}, ×${unchanged.max}`);
check("15 — auditCostGraph() and auditRawGraph() are both still zero — the new Warehouse cap is clean",
  unchanged.cost === 0 && unchanged.raw === 0, `${unchanged.cost} / ${unchanged.raw}`);

// ============================================================================
// PASS CONDITION 16 — every Part actioned, including the ones actioned as reports
// ============================================================================
// Parts 0.3, 4 and 7 are REPORTING requirements, not code. What is asserted is that the
// apparatus emits what they ask for, so the build report cannot claim them without a run.
check("16 — Part 0.3: drake kills per type are emitted at all four milestones (the rework is unmeasured, and says so)",
  /drakes: /.test(PACING) && /of \$\{\(d\.cap \* 100\)/.test(PACING));
check("16 — Part 4: farmer count and net food are emitted at all four milestones",
  /\$\{f\.farmers\} farmers/.test(PACING) && /net \$\{f\.netPerSec\}/.test(PACING));
check("16 — Part 5's storage table is emitted per milestone, so the tiers are read off a run",
  /narrow\[/.test(PACING) && /quarter\[/.test(PACING) && /held\/cap:/.test(PACING));
// v0.57 ship RE-POINT — THE FOURTH CONSECUTIVE OCCURRENCE of the same mistake, and the v0.57
// spec §0.1 called it before it happened: "the literal-pin mistake has now recurred in four
// consecutive rounds." v0.53 pinned it, v0.54 fixed v0.53 and pinned its own, v0.55 fixed v0.54
// and pinned its own, v0.56 fixed v0.55 and pinned its own. A round's suite may pin its own
// literal; the moment the next round ships, that pin is a check designed to fail.
// Superseded by: v0.57 ship discipline.
check("16 — VERSION is well-formed and the footer is rendered from it",
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
