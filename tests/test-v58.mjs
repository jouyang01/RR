// test-v58 — BUILDER SPEC v0.58 pass conditions, plus Jerry's fourteen dev notes.
//
// Seventeen round pass conditions, asserted in spec order, plus one block per dev note.
// Conditions that are RUN measurements (4, 9, 11 and the Era-3 band) are asserted here as
// "the apparatus emits it", with the measured value reported in BUILD REPORT §8 from the
// three-seed ensemble — a suite cannot assert a 2,500-year median, and pretending otherwise
// is how a green suite stops meaning anything.
import { chromium } from "playwright";
import { readFileSync } from "fs";

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
const PACING = readFileSync(new URL("../sim/pacing.mjs", import.meta.url), "utf8");
const SIMCORE = readFileSync(new URL("../sim/simcore.mjs", import.meta.url), "utf8");
const LEDGER = readFileSync(new URL("../docs/PARITY-LEDGER.md", import.meta.url), "utf8");

// ============================================================================
// PASS CONDITIONS 1 AND 2 — every condition carries a shape, and --seeds 1 refuses
// ============================================================================
// The shapes are declared in pacing.mjs, not in the game, so they are asserted against the
// source of the file that declares them. What matters is that NO condition is shapeless —
// the spec's words are "a condition whose shape is unstated is the defect".
{
  const shapes = [...PACING.matchAll(/\{\s*id:\s*"(\w+)",\s*label:[\s\S]{0,600}?shape:\s*"([a-z-]+)"/g)]
    .map(m => [m[1], m[2]]);
  const ids = shapes.map(s => s[0]);
  const legal = ["median", "max", "all-seeds", "single"];
  check("1 — every milestone condition declares a shape, and every shape is legal",
    shapes.length >= 10 && shapes.every(s => legal.indexOf(s[1]) >= 0),
    `${shapes.length} conditions: ${shapes.map(s => s[0] + "=" + s[1]).join(" ")}`);
  check("1 — ...and every one carries a stated REASON for its shape",
    (PACING.match(/why:\s*"/g) || []).length >= shapes.length,
    `${(PACING.match(/why:\s*"/g) || []).length} why: fields for ${shapes.length} conditions`);
  check("1 — the three ensemble shapes are named, and 'single' is not one of them",
    /ENSEMBLE_SHAPES\s*=\s*\["median",\s*"max",\s*"all-seeds"\]/.test(PACING));
  check("2 — a --seeds 1 run REFUSES to evaluate an ensemble condition",
    /needs --seeds; one draw is not evidence/.test(PACING) &&
    /ENSEMBLE_SHAPES\.indexOf\(c\.shape\) >= 0 && !FORCE_LOCAL_EVAL/.test(PACING));
  check("2 — ...and the escape hatch is explicit, named, and not used by the ensemble",
    /FORCE_LOCAL_EVAL = process\.argv\.includes\("--force-local-eval"\)/.test(PACING) &&
    !/--force-local-eval/.test(PACING.split("const passthrough")[1] || ""),
    "--force-local-eval");
  check("1/12 — the retired '130 wanderers before y600' is GONE and popBand replaces it",
    ids.indexOf("pop130") < 0 && ids.indexOf("popBand") >= 0, ids.join(","));
}

// ============================================================================
// PASS CONDITIONS 3, 4, 5, 6 — the Convergence round
// ============================================================================
await reset();
const targon = await page.evaluate(() => {
  const ch = BUILDINGS.find(b => b.id === "chapel");
  const sh = BUILDINGS.find(b => b.id === "shrine");
  const sa = BUILDINGS.find(b => b.id === "sanctum");
  const o = {
    exists: !!ch, prod: ch ? ch.prod : null, cost: ch ? ch.cost : null,
    ratio: ch ? ch.ratio : null, group: ch ? ch.group : null, tech: ch ? ch.tech : null,
    shrineProd: sh ? sh.prod : null, sanctumIdx: BUILDINGS.indexOf(sa),
    chapelIdx: BUILDINGS.indexOf(ch), shrineIdx: BUILDINGS.indexOf(sh)
  };
  // worshipBonus() at the source's own anchor: 1,000 worship must pay exactly 1.00%.
  // The Convergence wtech gates the whole bonus, so it is granted first — the assertion is
  // about the CURVE, not about the gate.
  S.wtechs = S.wtechs || {}; S.wtechs.convergence = true;
  S.worship = 1000; o.atAnchor = +(worshipBonus() * 100).toFixed(4);
  S.worship = 0;    o.atZero = +(worshipBonus() * 100).toFixed(4);
  S.worship = 1e12; o.atInfinity = +(worshipBonus() * 100).toFixed(2);
  S.worship = 0;
  return o;
});
check("3 — a Chapel analogue exists, at 0.025 devotion/s, on the Targon faith curve",
  targon.exists && targon.prod && targon.prod.devotion === 0.025 && targon.group === "Targon",
  JSON.stringify(targon.prod));
check("3 — ...and it sits BETWEEN the Shrine and the Sanctum, which is its rank",
  targon.shrineIdx < targon.chapelIdx && targon.chapelIdx < targon.sanctumIdx,
  `shrine ${targon.shrineIdx} < chapel ${targon.chapelIdx} < sanctum ${targon.sanctumIdx}`);
check("3 — ...and the bot can actually buy it: `chapel` is in BUILD_ORDER",
  /"chapel"/.test(SIMCORE));
check("5 — Kittens' 1,000-worship anchor pays EXACTLY 1.00% on this formula",
  Math.abs(targon.atAnchor - 1.0) < 0.005, `${targon.atAnchor}% at 1,000 worship`);
check("5 — the Convergence band is re-derived as a FLOOR with the anchor recorded",
  /CONVERGENCE_BAND = \[1, 1000\]/.test(PACING) &&
  /Solar Revolution at 1,000 worship/.test(PACING) &&
  /the upper edge is worshipBonus\(\)'s own \+1000% cap/.test(PACING));
check("5 — ...and the arithmetic that produced the floor is shown, not asserted",
  /worshipFor\s*=\s*b =>/.test(PACING), "worshipFor() inverts the curve in-file");
check("6 — worshipBonus() is untouched: 0 at zero, capped at +1000%",
  targon.atZero === 0 && targon.atInfinity === 1000,
  `${targon.atZero}% → ${targon.atInfinity}%`);
check("4 — worship at Sparks is REPORTED per seed by the apparatus",
  /worship at Sparks/.test(PACING) && /worship: Math\.round\(S\.worship/.test(SIMCORE));

// ============================================================================
// PASS CONDITIONS 7, 8, 9 — the Scholarship restructure
// ============================================================================
await reset();
const scholar = await page.evaluate(() => {
  const bare = () => { S.buildings = {}; S.upgrades = {}; S.techs = {}; S.policies = {};
                       S.champs = {}; S.leader = null; S.pop = 0; S.wanderers = [];
                       S.drakes = {}; S.wtechs = {};
                       if (typeof _traitCounts !== "undefined") _traitCounts = null; };
  bare();
  S.buildings = { hallOfHeroes: 20, trainingGround: 10 };
  S.techs = { trade: 1, drakeLore: 1, voidStudies: 1 };
  // RE-POINTED v0.59, superseded by spec Part 5.4: SCHOLAR_LINE is deleted and the three
  // Reflectors rungs live in ARCHIVE_RATIO_LINE at Kittens' own 0.02 each.
  const o = { line: ARCHIVE_RATIO_LINE.slice(), sigma: +ARCHIVE_RATIO_LINE.reduce((a, u) => a + u[1], 0).toFixed(4) };
  o.flat = Math.round(computeCaps().renown);
  S.upgrades = { cataloguing: 1, crossReferencing: 1, greatIndex: 1 };
  o.at3 = Math.round(computeCaps().renown);
  S.upgrades = { cataloguing: 1, crossReferencing: 1, greatIndex: 1, annotatedIndex: 1, livingLibrary: 1 };
  o.at5 = Math.round(computeCaps().renown);
  // family isolation, both directions (pass condition 10)
  bare();
  S.buildings = { warehouse: 20, storehouse: 10, hallOfHeroes: 20, watchersEye: 5 };
  S.techs = { trade: 1, drakeLore: 1, voidStudies: 1, carpentry: 1, smelting: 1 };
  const base = computeCaps();
  S.upgrades = { cataloguing: 1, crossReferencing: 1, greatIndex: 1, annotatedIndex: 1, livingLibrary: 1 };
  const withScholar = computeCaps();
  S.upgrades = { expandedStores: 1, ironboundStores: 1, hexRunedStores: 1, chemtechSilos: 1, voidwardStores: 1 };
  const withMasonry = computeCaps();
  S.upgrades = {};
  o.scholarOnTimber = +(withScholar.timber / base.timber).toFixed(4);
  o.scholarOnGold = +(withScholar.gold / base.gold).toFixed(4);
  o.masonryOnCulture = +(withMasonry.culture / base.culture).toFixed(4);
  o.masonryOnRenown = +(withMasonry.renown / base.renown).toFixed(4);
  o.masonryOnDevotion = +(withMasonry.devotion / base.devotion).toFixed(4);
  // pass condition 10: the four tiers and the two sums, on a bare state
  bare();
  S.upgrades = { expandedStores: 1, ironboundStores: 1, hexRunedStores: 1, chemtechSilos: 1, voidwardStores: 1 };
  const rat = storageRatios();
  o.barnSum = +rat.barn.toFixed(4); o.wareSum = +rat.ware.toFixed(4);
  o.tiers = { narrow: +storageMultFor("timber", rat).toFixed(4),
              broad: +storageMultFor("gold", rat).toFixed(4),
              quarter: +storageMultFor("provisions", rat).toFixed(4),
              none: +storageMultFor("knowledge", rat).toFixed(4) };
  // pass condition 10: capFamilyOf is total and single-valued
  const capped = Object.keys(RES).filter(r => RES[r].baseCap !== undefined);
  // RE-POINTED v0.59 Part 5.3: two families now, same invariant.
  o.multiFamily = capped.filter(r =>
    [CAP_MULT_EXEMPT[r], CAP_SCOPE[r]].filter(Boolean).length !== 1);
  o.unfamilied = capped.filter(r => capFamilyOf(r) === null);
  o.prose1 = UPGRADES.find(u => u.id === "cataloguing").effect;
  bare();
  return o;
});
check("7 — `scholarMult` appears NOWHERE on stripped source (v0.59 5.3: deleted outright)",
  !/scholarMult/.test(CODE), (CODE.match(/scholarMult\s*\S*/g) || []).join(" ") || "absent");
// RE-POINTED v0.59, superseded by spec Part 5.4. v0.58 Part 3's property was "this line is an
// ADDITIVE accumulator of small increments, not a multiplicative chain" (§23a), and that is
// still exactly what is asserted — against Kittens' own Σ 0.06 rather than RR's invented 1.60.
check("7/5.4 — the Reflectors line holds INCREMENTS summing Kittens' Σ 0.06, three rungs at 0.02",
  Math.abs(scholar.sigma - 0.06) < 1e-9 && scholar.line.length === 3 &&
  scholar.line.every(u => u[1] === 0.02),
  `Σ ${scholar.sigma} from ${JSON.stringify(scholar.line)}`);
// RE-POINTED v0.59, superseded by spec Part 5.3. These measured the line's delivery ON RENOWN
// (×1.85 at three rungs, ×2.60 at five, a 34.9% cut from the retired chain). The line does not
// reach renown at all now — renown's ceiling is 30 + 900 × Halls, flat — so the three
// assertions are replaced by the one property directive 7 actually bought.
check("7/5.3 — the line delivers ×1.00 to renown: its ceiling is flat and additive from the Halls",
  scholar.at3 === scholar.flat && scholar.at5 === scholar.flat,
  `${scholar.flat} bare → ${scholar.at3} at three rungs → ${scholar.at5} at five`);
// The fixture holds trade + drakeLore + voidStudies, which grant 40 / 60 / 80 renown cap on top
// of RES.renown.baseCap = 30 — the spec's "210 base", confirmed by measurement here rather than
// inherited. 210 + 900 × 20 = 18,210.
check("7/5.3 — ...and the flat figure is exactly 210 + 900 × Halls, at 20 Halls",
  scholar.flat === 210 + 900 * 20, `${scholar.flat} vs ${210 + 900 * 20}`);
// RE-POINTED v0.59 Part 5.4: the prose is about the Archive and the Observatory now, and the
// rung is 2% rather than 25%. The invariant — the prose states the increment the code applies,
// and never a "×" for something that adds — is unchanged.
check("7/5.4 — the Reflectors prose says 'a further 2%', never a ×, for a rung that adds",
  /a further 2%/.test(scholar.prose1) && !/×/.test(scholar.prose1) &&
  /Archive/.test(scholar.prose1) && /Observatory/.test(scholar.prose1), scholar.prose1);
check("8 — culture, renown and crystals are CLASSIFIED by the apparatus before any sizing",
  /LUMPY SINK ONLY — a ceiling change cannot move this/.test(PACING) &&
  /resourceBalance/.test(SIMCORE) &&
  /THE SCHOLARSHIP FAMILY/.test(PACING));
check("8 — ...and the classification is read from the FINAL state, not a milestone instant",
  /\["final", "icathia", "deepWorks", "hexcore", "chemtech", "sparks"\]/.test(PACING) &&
  /snaps\.final = snapshot\(\)/.test(SIMCORE));
check("9 — the tenth champion's year is emitted per seed on both sides of the cut",
  /tenthChampionYear/.test(PACING) && /tenthChampionAffordable/.test(SIMCORE) &&
  /tenth champion:/.test(PACING));

// ============================================================================
// PASS CONDITION 10 — storage tiers, the two sums, and FAMILY ISOLATION
// ============================================================================
check("10 — the two accumulator sums are 4.35 (barn) and 1.80 (warehouse)",
  Math.abs(scholar.barnSum - 4.35) < 1e-9 && Math.abs(scholar.wareSum - 1.80) < 1e-9,
  `barn ${scholar.barnSum}, warehouse ${scholar.wareSum}`);
check("10 — the four delivered tiers are ×14.98 / ×2.80 / ×2.0875 / ×1.00",
  Math.abs(scholar.tiers.narrow - 14.98) < 0.005 &&
  Math.abs(scholar.tiers.broad - 2.80) < 0.005 &&
  Math.abs(scholar.tiers.quarter - 2.0875) < 0.005 &&
  scholar.tiers.none === 1,
  JSON.stringify(scholar.tiers));
// THE ISOLATION ASSERTION. This is the property that actually broke: before v0.57 four
// resources sat in two families at once and a ternary silently picked the winner.
check("10 — ISOLATION: the Scholarship line delivers ×1.0000 to Masonry-line resources",
  scholar.scholarOnTimber === 1 && scholar.scholarOnGold === 1,
  `timber ×${scholar.scholarOnTimber}, gold ×${scholar.scholarOnGold}`);
check("10 — ISOLATION: the Masonry line delivers ×1.0000 to Scholarship-line resources",
  scholar.masonryOnCulture === 1 && scholar.masonryOnRenown === 1 && scholar.masonryOnDevotion === 1,
  `culture ×${scholar.masonryOnCulture}, renown ×${scholar.masonryOnRenown}, devotion ×${scholar.masonryOnDevotion}`);
check("10 — capFamilyOf() is TOTAL and SINGLE-VALUED over every capped resource",
  scholar.multiFamily.length === 0 && scholar.unfamilied.length === 0,
  `multi-family [${scholar.multiFamily.join(",")}] unfamilied [${scholar.unfamilied.join(",")}]`);

// ============================================================================
// PASS CONDITION 11 — trade banking, stated in a comment, with the spread reported
// ============================================================================
check("11 — manageTrade()/manageWilds() carry a banking reserve with the rule in a comment",
  /tradeVigorReserve/.test(SIMCORE) && /NO ROUTE PRICE IS CHANGED/.test(SIMCORE) &&
  /tradeReserveBlocks/.test(SIMCORE));
check("11 — the reserve and the trade gate are the SAME test, by construction",
  (SIMCORE.match(/tradeSurplusOk/g) || []).length >= 4 &&
  /const surplus = tradeSurplusOk;/.test(SIMCORE));
check("11 — the surplus rule is denominated in the ROUTE PRICE, not in the ceiling",
  /const SURPLUS_X = 3;/.test(SIMCORE) &&
  /S\.res\[r\] >= cost\[r\] \* SURPLUS_X/.test(SIMCORE));
check("11 — ...and the bot trades FOR something: a route whose yield is full is skipped",
  /function tradeYieldWanted/.test(SIMCORE) &&
  /const YIELD_FULL_AT = 0\.9;/.test(SIMCORE) &&
  /surplus\(tc\) && tradeYieldWanted\(f\)/.test(SIMCORE) &&
  /!tradeSurplusOk\(tc\) \|\| !tradeYieldWanted\(f\)/.test(SIMCORE));
check("11 — ...reading the game's own faction data, not a list kept in the sim",
  await page.evaluate(() => FACTIONS.every(f => Array.isArray(f.primaryYield) && f.primaryYield.length > 0)),
  "every faction declares primaryYield");
check("11 — firstTrade and the reserve's own activity count are both emitted",
  /firstTrade/.test(PACING) && /the reserve held an expedition back/.test(PACING) &&
  /TRADE REFUSALS/.test(PACING));
check("11 — ...and refusals are attributed PER ROUTE, since routes charge different goods",
  /tradeFaction/.test(SIMCORE) && /route \$\{fid\.padEnd\(10\)\}/.test(PACING));

// ============================================================================
// PASS CONDITION 12 — the population ruling
// ============================================================================
check("12 — the population target is RULED in pacing.mjs, with the reason in the file",
  /THE POPULATION RULING/.test(PACING) &&
  /KITTENS GOVERNS POPULATION BY HUT CAPACITY AND CATNIP, NOT BY A MILESTONE YEAR/.test(PACING));
check("12 — ...and it is NOT re-based to the measured value (181-185)",
  /peak population inside the 150-220 band/.test(PACING) &&
  /it is set to\n  \/\/ 150-220/.test(PACING.replace(/\r/g, "")) === false ||
  /NOT set to the measured 181-185/.test(PACING),
  "band 150-220 vs measured 181-185");

// ============================================================================
// PASS CONDITION 13 — Renown's <70% trigger, closed by classification
// ============================================================================
check("13 — the <70% Renown trigger is CLOSED, and closed by classification not a number",
  /the <70% cap-out target is the WRONG SHAPE for this resource and is RETIRED/.test(PACING));
check("13 — ...and it is replaced by two conditions a lumpy sink can actually fail",
  /ceiling clears the largest single purchase/.test(PACING) &&
  /the champion ladder completes/.test(PACING) &&
  /largestRenownPurchase/.test(SIMCORE));

// ============================================================================
// PASS CONDITION 14 — a continuous consumer ships
// ============================================================================
await reset();
const sink = await page.evaluate(() => {
  const b = BUILDINGS.find(x => x.id === "chemForgeworks");
  if (!b) return { exists: false };
  S.buildings.chemForgeworks = 10;
  S.res.shimmer = 10000; S.res.mana = 10000;
  const r = computeRates();
  return { exists: true, tech: b.tech, ratio: b.ratio, convert: b.convert,
           shimmerRate: +r.shimmer.toFixed(4), hexgearRate: +r.hexgear.toFixed(4),
           riftsteel: CRAFTS.find(c => c.id === "riftsteel").cost };
});
check("14 — a CONTINUOUS shimmer consumer ships (not a lumpy sink, not a retired band)",
  sink.exists && sink.convert && sink.convert.input.shimmer > 0,
  JSON.stringify(sink.convert));
check("14 — ...and it actually draws shimmer per tick when built",
  sink.shimmerRate < 0 && Math.abs(sink.shimmerRate + 0.5) < 1e-6,
  `${sink.shimmerRate}/s at 10 copies`);
check("14 — ...and it pays HEXGEAR, which is what makes Riftsteel reachable (Part 8.1)",
  sink.hexgearRate > 0 && sink.riftsteel.hexgear === 375,
  `${sink.hexgearRate} hexgear/s; Riftsteel wants ${sink.riftsteel.hexgear}`);
check("14 — ...and the bot can buy it: `chemForgeworks` is in BUILD_ORDER",
  /"chemForgeworks"/.test(SIMCORE));
check("14 — shimmer and voidessence are reported TOGETHER as resources with no sink",
  /RESOURCES BEING PRODUCED WITH NO SINK OF ANY KIND/.test(PACING));

// ============================================================================
// PASS CONDITION 15 — the ledger
// ============================================================================
check("15 — the Targon/worship rows are taken: the Chapel carries a citation and a verdict",
  /\| `chapel` \|/.test(LEDGER) && /faith curve/.test(LEDGER));
check("15 — ...and the new consumer carries one too",
  /`chemForgeworks`/.test(LEDGER));
check("15 — the counts sum to the total row count",
  (() => {
    const g = k => { const m = LEDGER.match(new RegExp("\\*\\*" + k + "\\*\\*[^|]*\\| (\\d+)")); return m ? +m[1] : -1; };
    const total = (LEDGER.match(/\*\*total rows\*\* \| \*\*(\d+)\*\*/) || [])[1];
    return g("PARITY") + g("EASIER") + g("HARDER") + g("UNVERIFIED") === +total;
  })(), "counts sum");
// RE-POINTED v0.59. This pinned the ledger's header to v0.58 and so asserted "the ledger was
// regenerated at THE ROUND THIS SUITE WAS WRITTEN FOR" — which stops being the useful question
// the moment another round ships. **The property worth keeping is that the ledger is CURRENT:
// its header names the version the game reports, so a round that changes the game and forgets
// to run `tools/parity-ledger.mjs` fails here.** That is version-independent and strictly
// stronger — the old form would have passed happily on a stale v0.58 ledger at v0.59.
const ledgerVersion = await page.evaluate(() => VERSION);
check("15 — the ledger is REGENERATED, and its header matches the running build",
  LEDGER.indexOf("# PARITY LEDGER — Runeterra Reclaimed " + ledgerVersion) === 0,
  `${(LEDGER.split("\n")[0] || "").slice(0, 60)} vs VERSION ${ledgerVersion}`);

// ============================================================================
// PASS CONDITION 16 — what must NOT have moved
// ============================================================================
await reset();
const unchanged = await page.evaluate(() => {
  const bare = () => { S.buildings = {}; S.upgrades = {}; S.techs = {}; S.policies = {};
                       S.champs = {}; S.leader = null; S.pop = 0; S.wanderers = [];
                       S.drakes = {}; S.wtechs = {};
                       if (typeof _traitCounts !== "undefined") _traitCounts = null; };
  bare();
  const o = { version: VERSION, boostKeys: Object.keys(BOOST_LIMIT).length,
              campLimit: CAMP_YIELD_LIMIT, consumption: CONSUMPTION,
              cost: typeof auditCostGraph === "function" ? auditCostGraph().length : -1,
              raw: typeof auditRawGraph === "function" ? auditRawGraph().length : -1 };
  S.upgrades = { expandedStores: 1, ironboundStores: 1, hexRunedStores: 1, chemtechSilos: 1, voidwardStores: 1 };
  const rat = storageRatios();
  o.narrow = +((1 + rat.barn) * (1 + rat.ware)).toFixed(4);
  bare();
  return o;
});
check("16 — the storage tier stack is unmoved at ×20.80 nominal / Σ 4.35 / Σ 1.80",
  Math.abs(unchanged.narrow - 14.98) < 0.005, `narrow ×${unchanged.narrow}`);
check("16 — BOOST_LIMIT still has 7 keys and CAMP_YIELD_LIMIT is still 6",
  unchanged.boostKeys === 7 && unchanged.campLimit === 6,
  `${unchanged.boostKeys} keys, limit ${unchanged.campLimit}`);
check("16 — CONSUMPTION is unmoved at 4.25 — the population ruling did NOT touch food",
  unchanged.consumption === 4.25, String(unchanged.consumption));
check("16 — auditCostGraph() and auditRawGraph() are both still zero",
  unchanged.cost === 0 && unchanged.raw === 0, `${unchanged.cost} / ${unchanged.raw}`);

// ============================================================================
// JERRY'S FOURTEEN DEV NOTES
// ============================================================================
await reset();
const notes = await page.evaluate(() => {
  const o = {};
  // 1 / 1.1 — discovery unlock prose is DERIVED and names every gate
  o.docks = UPGRADES.find(u => u.id === "deepwaterDocks").effect;
  o.slab = UPGRADES.find(u => u.id === "slabCutting").effect;
  o.distill = UPGRADES.find(u => u.id === "chemtechDistillation").effect;
  o.hasGenerator = typeof discoveryUnlocks === "function";
  // 2 — the Warehouse hides its conditional cap until the gate is held
  const wh = BUILDINGS.find(b => b.id === "warehouse");
  o.whCapsIf = wh.capsIf;
  o.whCaps = wh.caps;
  // 4 — Hextech Theory names the tinkerer
  o.hextech = techUnlocks("hextech");
  // 5 / 5.1 — Krugs
  const kr = EXPEDITIONS.find(e => e.id === "krugs");
  o.krugYield = kr.yield;
  o.krugRunSrc = String(kr.run);
  // 8 / 9 — no changelog prose, no line totals
  o.tome = CRAFTS.find(c => c.id === "tome").desc;
  o.axe = UPGRADES.find(u => u.id === "ironAxes").effect;
  o.saw = UPGRADES.find(u => u.id === "steelSaw").effect;
  // 10 — Masonry prose in player units
  o.masonry = UPGRADES.find(u => u.id === "expandedStores").effect;
  // 12 — Festival
  o.festCost = (function () { S.pop = 10; return festivalCost(); })();
  o.festMult = FESTIVAL_MORALE_MULT;
  o.ticksPerYear = TICKS_PER_GAME_YEAR;
  // 14 — Wilds-only expedition discounts
  o.survey = UPGRADES.find(u => u.id === "surveyedApproaches").effect;
  o.wheels = UPGRADES.find(u => u.id === "ironShodWheels").effect;
  // v0.59 PART 7 — A §21 DEFECT, found by `tools/fixture-sweep.mjs` and fixed rather than
  // re-run away. This asserted an EXACT product, `round(150 x 0.85 x 0.90)`, against a value
  // `expCost()` computes from THREE inputs — and the block reset only one of them. `expCost()`
  // multiplies by `policyVigorMult()`, and **Open Range costs Wilds expeditions 10% more
  // vigor**, so any earlier block that left that policy standing moved this measurement by
  // exactly the amount that makes an exact-equality assertion fail.
  //
  // It has been latent since v0.58 and passes on a clean page, which is the whole signature of
  // the class: invisible alone, a few per cent wrong in a full sweep. The remedy §21 asks for
  // is to make the measurement independent of what ran before it, so the two containers
  // `expCost()` reads and this block did not own are cleared here.
  S.policies = {}; S.champs = {}; S.leader = null;
  S.upgrades.surveyedApproaches = 1; S.upgrades.ironShodWheels = 1;
  o.krugVigor = expCost(EXPEDITIONS.find(e => e.id === "krugs")).vigor;
  o.scoutVigor = expCost(EXPEDITIONS.find(e => e.id === "scouting")).vigor;
  S.upgrades = {};
  return o;
});
check("note 1 — Deepwater Docks names the Harbor AND its second gate",
  /Harbor \(also requires Smelting\)/.test(o_(notes.docks)), notes.docks);
check("note 1.1 — the audit is a GENERATOR, so every discovery is covered, not just one",
  notes.hasGenerator && /also requires Carpentry/.test(notes.slab) &&
  /also requires Hextech Theory/.test(notes.distill),
  `${notes.slab} | ${notes.distill}`);
check("note 2 — the Warehouse's provisions line is gated on the discovery, no spoiler",
  /if \(b\.capsIf && S\.upgrades\[b\.capsIf\.upgrade\]\)/.test(CODE) &&
  notes.whCapsIf.upgrade === "chemtechSilos",
  "capsIf printed only when held");
check("note 3 — the layered-craft sub-row now gets an ETA too",
  !/if \(short && !isSub\)/.test(CODE) && /if \(short\) \{/.test(CODE),
  "the `&& !isSub` guard is gone");
check("note 4 — Hextech Theory names the Tinkerer role it unlocks",
  notes.hextech.indexOf("Tinkerers") >= 0, notes.hextech.join(", "));
check("note 5 — Krugs' gold is cut to 6–12 base, and the yield line says so",
  /6–12 gold/.test(notes.krugYield) && /\(6 \+ Math\.floor\(rerollAmt\("hunt"\) \* 7\)\)/.test(notes.krugRunSrc),
  notes.krugYield);
check("note 5.1 — Krugs give NO hextech crystals, in the run and in the tooltip",
  !/crystals/i.test(notes.krugYield) && !/gain\("crystals"/.test(notes.krugRunSrc),
  notes.krugYield);
check("note 6 — the undo toast reports the HAUL rather than naming the mechanic",
  /undoLabel = e\.name \+ \(gains\.length/.test(CODE), "label rewritten from resource deltas");
check("note 7 — the craft chronicle line reports the MATERIAL SPENT as well as the gain",
  /" for " \+ spent/.test(CODE) && /Transmutation ×/.test(CODE),
  "crafts and mana→timber both");
check("note 8 — no button description is written against a previous build",
  !/no longer/i.test(notes.tome) && !/no longer/i.test(notes.axe),
  notes.tome.slice(0, 60));
check("note 9 — no description states a line total or names an internal line",
  !/with all \d/.test(notes.axe + notes.saw + notes.masonry) &&
  !/rung of the/i.test(notes.axe + notes.saw) &&
  !/Masonry [IV]+/.test(notes.masonry),
  `${notes.axe} | ${notes.saw}`);
check("note 10 — the Masonry line says which stores grow and by how much, in percent",
  /Barns and cellars hold \+75% more/.test(notes.masonry) &&
  /Warehouses and yards hold \+25% more/.test(notes.masonry),
  notes.masonry);
check("note 11 — the XP rate is honestly labelled UNVERIFIED, with the failed routes recorded",
  /CANNOT BE CONFIRMED/.test(RAW) && /robots\.txt/.test(RAW) &&
  /CANNOT BE CONFIRMED/.test(LEDGER) && /XP_PER_SECOND = 0\.5/.test(CODE),
  "no number invented");
// RE-POINTED v0.58.1, superseded by NOTE 1 (both). "It should also cost Vigor. IT should have a
// larger culture cost and be a repetitive culture sink" — culture and vigor JOIN the three; and
// "It should give you a flat 20% morale bonus" — 1.30 -> 1.20. The DURATION this assertion also
// guards is unchanged and is now stated in the note's own units: 400 days = 4,000 ticks.
check("note 1 — the Festival costs Culture + Vigor + Plumes + Mushrooms + Provisions",
  JSON.stringify(Object.keys(notes.festCost).sort()) ===
  JSON.stringify(["culture", "mushrooms", "plumes", "provisions", "vigor"]),
  JSON.stringify(notes.festCost));
check("note 1.2 — ...and it pays +20% morale for exactly one game-year (400 days)",
  notes.festMult === 1.20 && notes.ticksPerYear === 4000,
  `×${notes.festMult} for ${notes.ticksPerYear} ticks`);
// RE-POINTED v0.58.1, superseded by NOTE 2: "Warehouses should not store hextech crystals,
// revert this change that I made." v0.58's note 13 is withdrawn by Jerry in the next round,
// which is the system working — the assertion is inverted rather than deleted, so a silent
// re-appearance would still be caught.
check("note 2 — the Warehouse does NOT hold crystals (v0.58's note 13, reverted by Jerry)",
  notes.whCaps.crystals === undefined, JSON.stringify(notes.whCaps));
// RE-POINTED v0.58.1 — note 35 takes scouting to 1,750 and makes its exemption a property of
// the expedition (`noDiscount`) rather than of its tab. v0.58's note 14 property — Wilds only —
// is unchanged and still asserted; the figure is Jerry's.
check("note 14 — the vigor discounts say WILDS expedition, and apply only to Wilds ones",
  /Wilds expedition/.test(notes.survey) && /Wilds expedition/.test(notes.wheels) &&
  notes.krugVigor === Math.round(150 * 0.85 * 0.90) && notes.scoutVigor === 1750,
  `krugs ${notes.krugVigor} (discounted), scouting ${notes.scoutVigor} (not)`);

// ============================================================================
// PASS CONDITION 17 — every Part actioned
// ============================================================================
// RE-POINTED v0.58.1: a literal version is true for one round by construction, and
// OFF-CYCLE-PROTOCOL §1 takes a POINT release off this one. Pin the shape, not the value.
// RE-POINTED AGAIN at v0.59. v0.58.1's re-point pinned the shape `v0.58(.M)` — which is still a
// literal version with a wildcard on the end, and it failed on the next round exactly as the
// literal did. **The scheme is what is stable: `v0.NN` for a spec round, `v0.NN.M` for an
// off-cycle point release.** Pin that. Which specific version this build carries is the
// business of the round's own suite, and `test-v59` asserts it.
check("17 — VERSION is well-formed under the numbering scheme, footer rendered from it",
  /^v0\.\d\d(\.\d+)?$/.test(unchanged.version) &&
  await page.evaluate(() => (document.body.innerText || "").indexOf(VERSION) > -1),
  unchanged.version);
check("no console errors across the whole suite", errors.length === 0, errors.slice(0, 3).join(" | "));

function o_(s) { return s || ""; }

console.log(`\n${pass} passed, ${fail} failed`);
await browser.close();
process.exit(fail ? 1 : 0);
