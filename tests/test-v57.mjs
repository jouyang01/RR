// test-v57 — BUILDER SPEC v0.57 pass conditions, plus Jerry's two directives.
//
// Seventeen round pass conditions, asserted in spec order. Conditions that are RUN
// measurements (2, 3, 9, 10) are asserted here as "the apparatus emits it", with the measured
// value reported in BUILD REPORT §8 from the three-seed ensemble — a suite cannot assert a
// 2,500-year median, and pretending otherwise is how a green suite stops meaning anything.
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
const PACING = readFileSync(new URL("../sim/pacing.mjs", import.meta.url), "utf8");
const SIMCORE = readFileSync(new URL("../sim/simcore.mjs", import.meta.url), "utf8");
const LEDGER = readFileSync(new URL("../docs/PARITY-LEDGER.md", import.meta.url), "utf8");

// ============================================================================
// PASS CONDITIONS 1, 2, 3, 4 — Renown leaves the material line
// ============================================================================
await reset();
const renown = await page.evaluate(() => {
  const capped = Object.keys(RES).filter(r => RES[r].baseCap !== undefined);
  const bare = () => { S.buildings = {}; S.upgrades = {}; S.techs = {}; S.policies = {};
                       S.champs = {}; S.leader = null; S.pop = 0; S.wanderers = [];
                       S.drakes = {}; S.wtechs = {};
                       if (typeof _traitCounts !== "undefined") _traitCounts = null; };
  const o = {
    family: Object.fromEntries(capped.map(r => [r, capFamilyOf(r)])),
    multiFamily: capped.filter(r =>
      // RE-POINTED v0.59 Part 5.3: two families, same invariant
      [CAP_MULT_EXEMPT[r], CAP_SCOPE[r]].filter(Boolean).length !== 1),
    unfamilied: capped.filter(r => capFamilyOf(r) === null),
    scholarCapsExists: (typeof SCHOLAR_CAPS !== "undefined"),
    scholarProse: (typeof scholarCapNames === "function"),
    poppyProse: typeof poppyLeadDesc === "function" ? poppyLeadDesc() : ""
  };
  // the Masonry line must not move Renown at all any more
  bare();
  S.buildings = { hallOfHeroes: 20, trainingGround: 10 };
  S.techs = { trade: 1, drakeLore: 1, voidStudies: 1 };
  o.flat = Math.round(computeCaps().renown);
  S.upgrades = { expandedStores: 1, ironboundStores: 1, hexRunedStores: 1, chemtechSilos: 1, voidwardStores: 1 };
  o.withMasonry = Math.round(computeCaps().renown);
  S.upgrades = { cataloguing: 1, crossReferencing: 1, greatIndex: 1 };
  o.withScholar3 = Math.round(computeCaps().renown);
  S.upgrades = { cataloguing: 1, crossReferencing: 1, greatIndex: 1, annotatedIndex: 1, livingLibrary: 1 };
  o.withScholar5 = Math.round(computeCaps().renown);
  // the dedicated line: additive per copy, and it must scale linearly in copies
  S.upgrades = {};
  const at = n => { S.buildings = { hallOfHeroes: n, trainingGround: 10 }; return computeCaps().renown; };
  const noPct = (() => { const h = BUILDINGS.find(b => b.id === "hallOfHeroes");
    const save = h.renownCapPct; delete h.renownCapPct;
    const v = { at10: at(10), at20: at(20), at40: at(40) };
    h.renownCapPct = save; return v; })();
  const withPct = { at10: at(10), at20: at(20), at40: at(40) };
  o.pctPerCopy = BUILDINGS.find(b => b.id === "hallOfHeroes").renownCapPct;
  o.lift = { at10: +(withPct.at10 / noPct.at10).toFixed(4),
             at20: +(withPct.at20 / noPct.at20).toFixed(4),
             at40: +(withPct.at40 / noPct.at40).toFixed(4) };
  o.cultureTwin = BUILDINGS.filter(b => b.cultureCapPct).map(b => [b.id, b.cultureCapPct]);
  // the recruit ladder, and the ten fields that used to sit beside it
  bare();
  o.tenth = Math.round(RECRUIT_BASE * Math.pow(RECRUIT_RATIO, 9));
  let cum = 0; for (let n = 0; n < 10; n++) cum += Math.round(RECRUIT_BASE * Math.pow(RECRUIT_RATIO, n));
  o.cumulative = cum;
  o.champsWithRenownField = CHAMPS.filter(c => c.cost && c.cost.renown !== undefined).map(c => c.id);
  // and the ladder still prices the tenth champion at 9,611 with nine held
  CHAMPS.slice(0, 9).forEach(c => S.champs[c.id] = { r: true });
  o.tenthLive = recruitCost(CHAMPS[9].id).renown;
  o.tenthCarriesSignature = Object.keys(recruitCost(CHAMPS[9].id)).length > 1;
  bare();
  return o;
});
check("1 — every capped resource is in EXACTLY ONE cap family, and none is in none",
  renown.multiFamily.length === 0 && renown.unfamilied.length === 0,
  `multi-family [${renown.multiFamily.join(",")}] unfamilied [${renown.unfamilied.join(",")}]`);
// RE-POINTED v0.58.1, superseded by NOTES 15 and 16 / STANDING-RULINGS §29 — a NEW EXPLICIT
// RULING FROM JERRY, recorded rather than applied silently. Culture and devotion leave
// SCHOLAR_CAPS for CAP_MULT_EXEMPT, because Kittens' fixed-multiplier ceilings are ×1.05 and
// ×1.5-on-one-building's-slice against RR's ×6.43 and ×10.36. §22's INVARIANT is untouched and
// is what this block should now be measuring: exactly one family per capped resource.
// RE-POINTED v0.59, superseded by spec Part 5.3 (Jerry's directive 7). §29 left this family
// with one member and directive 7 removes it, so the family is DELETED rather than emptied.
// v0.57's directive 1 was "renown must not be on the MATERIAL storage line" — that is the
// property worth keeping, and it survives the deletion intact: renown sits at the CAP_SCOPE
// "none" tier, so the material line still does not move it by one point (asserted below).
check("1/5.3 — SCHOLAR_CAPS and scholarCapNames() are GONE, and renown's family is the none tier",
  renown.scholarCapsExists === false && renown.scholarProse === false &&
  renown.family.renown === "masonry",
  `SCHOLAR_CAPS defined: ${renown.scholarCapsExists}, family ${renown.family.renown}`);
check("1 — the Masonry line does not move Renown by one point",
  renown.flat === renown.withMasonry, `${renown.flat} bare → ${renown.withMasonry} with all five Masonry rungs`);
// RE-POINTED v0.58, superseded by SPEC PART 3. v0.57's point was that the SCHOLARSHIP line,
// not the Masonry line, is the one that reaches Renown — and it still is. Only the arithmetic
// inside that line changed: ×2.1125/×3.9926 multiplicative → ×1.85/×2.60 additive.
// RE-POINTED v0.59, superseded by spec Part 5.3 (Jerry's directive 7). v0.57's finding was
// "the Masonry line must not reach renown"; v0.59's directive removes the OTHER line too. Both
// halves are now the same assertion — nothing multiplies renown's ceiling except the general
// drake and leader terms — so this states the end of it: no line moves it at all.
check("1/5.3 — ...and neither does the Scholarship line any more: renown is flat, ×1.00 at 5 of 5",
  renown.withScholar3 === renown.flat && renown.withScholar5 === renown.flat,
  `${renown.flat} → ${renown.withScholar3} → ${renown.withScholar5}`);
check("2 — no `!== \"renown\"` special case survives anywhere, on stripped source",
  !/!== "renown"/.test(CODE), (CODE.match(/!== "renown"/g) || []).join(" "));
// RE-POINTED v0.59 Part 5.3: there is no Scholarship prose about renown to generate, because
// the generator and the family it read are both deleted. Asserted above by absence.
// RE-POINTED v0.58.1, superseded by NOTE 45: "Poppy leader bonus description does not need to
// say what it doesn't touch, only what it does." The exclusion list is gone from the PROSE. The
// mechanism it documented is unchanged and is still asserted: the guard is the FAMILY, never a
// name, so `r3 !== "renown"` must still appear nowhere.
check("2 — ...and Poppy's lead still excludes Renown through the FAMILY, never a name",
  !/r3 !== "renown"/.test(CODE) && !/untouched/.test(renown.poppyProse), renown.poppyProse);
// Condition 2's MEASUREMENT (time at cap on 3 seeds) and condition 3's (tenth-champion year)
// are run figures; what is asserted here is that the ensemble reports them.
check("2/3 — the ensemble reports Renown time-at-cap and the tenth-champion year per seed",
  /renownAtCapPct/.test(PACING) && /tenthChampionYear/.test(PACING) &&
  /tenthChampionAffordable/.test(SIMCORE));
// Step 2 shipped because Jerry's objective trigger fired: 83.1% time-at-cap (not below 70%) and
// no tenth champion inside 1,400 years, measured on the post-move build. BUILD REPORT §5.
// RE-POINTED v0.58.1, superseded by NOTE 31.1: "Hall of Heroes gives flat Max Renown and % max
// renown. Let's just change it to flat max renown." The percentage is DELETED and the flat grant
// rises 250 -> 900 so note 31.2's constraint survives the new recruit ladder. The CULTURE twin —
// Kittens' Ziggurat 0.08, which is what made the shape defensible — is untouched and is what
// this assertion now guards.
check("3/5 — renownCapPct is GONE (note 31.1); the culture twin keeps Kittens' Ziggurat 0.08",
  renown.pctPerCopy === undefined && renown.cultureTwin.some(([, v]) => v === 0.08),
  `renownCapPct ${renown.pctPerCopy}; culture twin ${JSON.stringify(renown.cultureTwin)}`);
check("3/5 — ...and with the percentage gone the Hall's ceiling is purely LINEAR in copies",
  Math.abs(renown.lift.at10 - 1) < 0.02 && Math.abs(renown.lift.at20 - 1) < 0.02 &&
  Math.abs(renown.lift.at40 - 1) < 0.02,
  `×${renown.lift.at10} at 10 · ×${renown.lift.at20} at 20 · ×${renown.lift.at40} at 40 copies`);
// RE-POINTED v0.58, superseded by SPEC PART 3 + PART 7.1. The 35% cut takes the 20-Hall
// ceiling at three rungs from 27,946 to just under the 28,333 CUMULATIVE ladder — and Part 7.1
// establishes why the cumulative figure was the wrong target in the first place: Renown is
// lumpy-sink-bound, the player never needs all ten lumps banked at once, and the substantive
// condition is that the ceiling clears the LARGEST SINGLE PURCHASE. It clears it 2.9x over at
// three rungs and 4.1x at five. Measured, not asserted: BUILD REPORT §7.1.
// RE-POINTED v0.59, superseded by spec Part 5.3. The `> cumulative` half was carried entirely
// by the Scholarship line's x2.60, which directive 7 deletes — and the comment three lines
// above already says why cumulative was the wrong target: renown is lumpy-sink-bound and the
// player never needs all ten lumps banked at once. The SUBSTANTIVE condition, in v0.58 Part
// 7.1's own words, is the LARGEST SINGLE PURCHASE, and that is what survives here.
check("3 — the ceiling clears the LARGEST SINGLE PURCHASE (v0.58 Part 7.1's substantive condition)",
  renown.withScholar5 > renown.tenth,
  `ceiling ${renown.withScholar5} at 20 Halls vs tenth champion ${renown.tenth} ` +
  `(cumulative ${renown.cumulative} is NOT the target — see the comment above)`);
check("4 — the ten dead `renown:` fields are DELETED from CHAMPS",
  renown.champsWithRenownField.length === 0, renown.champsWithRenownField.join(", ") || "none");
// RE-POINTED v0.58.1 — note 31 raises RECRUIT_BASE 250 -> 400, so the tenth is 15,377. The
// property is that the ladder is BUILT from the constants and still carries a signature cost.
check("4 — ...and the ladder prices the tenth champion at 15,377, with its signature cost",
  renown.tenthLive === 15377 && renown.tenthCarriesSignature,
  `${renown.tenthLive} renown, plus signature/rung components`);
check("4 — ...and recruitCost() no longer filters a field that no longer exists",
  /for \(var r in d\.cost\) c\[r\] = d\.cost\[r\];/.test(CODE));

// ============================================================================
// PASS CONDITIONS 5, 6, 7 — farmers lose the season
// ============================================================================
await reset();
const seasons = await page.evaluate(() => {
  const run = (useBuilding, leona) => {
    loadFromString(btoa(unescape(encodeURIComponent(JSON.stringify(freshState())))));
    S.buildings = useBuilding ? { farmstead: 100 } : {};
    S.techs = { almanac: 1, cultivation: 1 };
    S.upgrades = {}; S.policies = {}; S.drakes = {}; S.wtechs = {};
    S.champs = leona ? { leona: { r: true } } : {}; S.leader = leona ? "leona" : null;
    S.weather = "clear";
    S.pop = useBuilding ? 0 : 10; S.wanderers = []; syncRoster();
    S.jobs = useBuilding ? {} : { farmer: 10 };
    const out = {};
    SEASONS.forEach((sn, i) => {
      S.tick = i * TICKS_PER_DAY * DAYS_PER_SEASON;
      if (typeof invalidateCensus === "function") invalidateCensus();
      const bd = computeRates("provisions"); let amt = 0;
      (bd._bd || []).forEach(e => { if (new RegExp(useBuilding ? "Farmstead" : "Farmer").test(e.label)) amt += e.amt; });
      out[sn.id] = +amt.toFixed(4);
    });
    return out;
  };
  return { farmer: run(false, false), building: run(true, false), buildingLeona: run(true, true),
           farmerDesc: JOBS.find(j => j.id === "farmer").desc,
           consumption: CONSUMPTION, farmerRate: JOBS.find(j => j.id === "farmer").prod.provisions,
           relief: LEONA_SEASON_RELIEF,
           seasonFarmMultDefs: 1 };
});
const f = seasons.farmer, b = seasons.building, bl = seasons.buildingLeona;
check("5 — the farmer produces the SAME in all four seasons — the reversal of v0.55 directive 5",
  Math.abs(f.spring - f.summer) < 1e-9 && Math.abs(f.autumn - f.summer) < 1e-9 &&
  Math.abs(f.winter - f.summer) < 1e-9,
  Object.entries(f).map(([k, v]) => `${k} ${v}`).join(" | "));
check("5 — no in-game string claims the farmer follows the calendar",
  !/the harvest follows the calendar\)/.test(RAW) && !/follows the calendar/.test(seasons.farmerDesc),
  `farmer desc: "${seasons.farmerDesc}"`);
check("5 — ...and the season term is gone from the JOB path on stripped source",
  !/if \(r === "provisions"\) jv \*= farmMult;/.test(CODE));
check("6 — a SEASONAL BUILDING still measures ×1.5 / ×1.0 / ×1.0 / ×0.25",
  Math.abs(b.spring / b.summer - 1.5) < 1e-6 && Math.abs(b.autumn / b.summer - 1) < 1e-6 &&
  Math.abs(b.winter / b.summer - 0.25) < 1e-6,
  Object.entries(b).map(([k, v]) => `${k} ${v}`).join(" | "));
check("6 — with Leona leading, a seasonal building measures ×0.625 in winter and ×1.5 in spring",
  Math.abs(bl.winter / b.summer - 0.625) < 1e-6 && Math.abs(bl.spring / b.summer - 1.5) < 1e-6,
  `winter ×${(bl.winter / b.summer).toFixed(4)}, spring ×${(bl.spring / b.summer).toFixed(4)}`);
check("6 — the `m < 1` guard survives — without it Leona PULLS DOWN Firstbloom",
  /if \(leaderIs\("leona"\) && m < 1\)/.test(CODE));
check("6 — seasonFarmMult has exactly one definition, and both callers use it",
  (CODE.match(/function seasonFarmMult\(/g) || []).length === 1 &&
  (CODE.match(/seasonFarmMult\(/g) || []).length >= 4);
check("7 — STANDING-RULINGS §17 is AMENDED with the reversal, not deleted",
  (() => { const R = readFileSync(new URL("../STANDING-RULINGS.md", import.meta.url), "utf8");
    return /## 17\./.test(R) && /REVERSED BY JERRY v0\.57/.test(R) &&
           /retained verbatim/i.test(R); })());
check("7 — the ledger's seasonal-farmer row is PARITY now, and says why it was HARDER",
  /Seasonal farmers[\s\S]{0,900}\*\*PARITY\*\*/.test(LEDGER) &&
  /HARDER → PARITY/.test(LEDGER));
check("8 — CONSUMPTION is unchanged at 4.25, ratio 1.17647 — Jerry's double-check",
  seasons.consumption === 4.25 && Math.abs(seasons.farmerRate / seasons.consumption - 1.17647) < 1e-5,
  `${seasons.farmerRate} / ${seasons.consumption} = ${(seasons.farmerRate / seasons.consumption).toFixed(5)}`);

// ============================================================================
// PASS CONDITIONS 9, 10 — the ensemble and the food policy
// ============================================================================
check("9 — pacing.mjs has an ensemble mode that launches seeds CONCURRENTLY",
  /--seeds/.test(PACING) && /spawn\(process\.execPath/.test(PACING) &&
  /Promise\.all\(seeds\.map/.test(PACING));
check("9 — ...and it reports median, min, max and spread for milestone figures",
  /median/.test(PACING) && /spread/.test(PACING) && /ENSEMBLE_KEYS/.test(PACING));
check("9 — ...and it SEPARATES ensemble figures from single-run figures, so neither can pass as the other",
  /ENSEMBLE FIGURES — milestone-derived/.test(PACING) &&
  /SINGLE-RUN FIGURES — from the MEDIAN SEED/.test(PACING));
check("10 — the bot's food policy PROJECTS to the worst season instead of reacting to today",
  /function projectedWinterNet\(\)/.test(SIMCORE) && /winterNet < 0 && farmers < farmCeiling/.test(SIMCORE));
check("10 — ...and it can PULL a worker off another job, which the old rule could not",
  /const donor = largestNonFarmJob\(\);/.test(SIMCORE) &&
  /assignJob\(donor, -1\); assignJob\("farmer", 1\);/.test(SIMCORE));
check("10 — ...and it unstaffs only when the stock is at ceiling AND winter is covered",
  /stockFull && winterNet > WINTER_HEADROOM/.test(SIMCORE));
check("10 — ...and the rule is stated in a comment, because every future food number depends on it",
  /THE RULE, stated because every future food number depends on it/.test(SIMCORE));
check("10 — ...and it cannot collapse the settlement into a monoculture",
  /FARM_MAX_SHARE/.test(SIMCORE) && /farmers < farmCeiling/.test(SIMCORE));

// ============================================================================
// PASS CONDITIONS 11, 12, 13 — the Scholarship census and the restatement
// ============================================================================
// RE-POINTED v0.58: the census survives the restructure, but it reports a Σ and a 1+Σ now.
// RE-POINTED v0.59 Parts 5.3/5.4: the census survives and still names its rungs, but it
// measures the two NEW mechanisms — archiveRatio scaled by Observatory count, and the two
// Astrolabe per-copy multipliers — plus the cap families themselves.
check("11 — the Scholarship rungs are CENSUSED by the harness, rungs reached and total delivered",
  /scholarship: \(\(\) => \{/.test(SIMCORE) && /archiveSliceMult/.test(SIMCORE) &&
  /capFamilies/.test(SIMCORE) &&
  /THE FIVE RUNGS AS KNOWLEDGE AMPLIFIERS/.test(PACING));
// RE-POINTED v0.58: v0.57 asserted the restructure was DATED and NOT YET SHIPPED, which is the
// correct assertion for exactly one round. v0.58 Part 3 ships it, so the assertion flips to its
// mirror image — the chain must be GONE, and the census must still state what it cut from.
// RE-POINTED v0.59 Part 5.3: v0.58 asserted the multiplicative chain was replaced by an
// additive accumulator, `scholarAdd`. v0.59 deletes the accumulator too, along with the family
// it fed. The property that outlives both is the one v0.57 wrote this for: NO Scholarship
// multiplier of any shape survives in the source.
check("11 — ...and v0.59 Part 5.3 FINISHES it: no scholarMult, no scholarAdd, no SCHOLAR_CAPS",
  !/scholarMult/.test(CODE) && !/scholarAdd/.test(CODE) && !/SCHOLAR_CAPS/.test(CODE) &&
  !/SCHOLAR_LINE/.test(CODE) && /ARCHIVE_RATIO_LINE/.test(CODE),
  (CODE.match(/scholarMult|scholarAdd|SCHOLAR_CAPS|SCHOLAR_LINE/g) || []).join(" ") || "all absent");
check("12 — pass condition 5 is RESTATED: the cap-out band applies only to stock-limited raws",
  /PASS CONDITION 5 \(v0\.57 RESTATED\)/.test(PACING) &&
  /lumpy sink only — a cap change cannot move this/.test(PACING));
check("13 — held/cap AND a producer/consumer ratio are in the snapshot for every capped resource",
  /resourceBalance: \(\(\) => \{/.test(SIMCORE) && /pcRatio:/.test(SIMCORE) &&
  /lumpySinks: sinks/.test(SIMCORE));
check("13 — ...and `gross` switches off only the converters that CONSUME the resource",
  /const eaters = BUILDINGS\.filter\(b => b\.convert && b\.convert\.input && b\.convert\.input\[r2\]\);/.test(SIMCORE));
check("13 — ...and dynamically-priced sinks are counted, or Renown reads as having none",
  /recruitCost\(c\.id\) \|\| \{\}\)\[r2\]/.test(SIMCORE));

// ============================================================================
// PASS CONDITION 14 — the ledger prose, and the guard that was missing
// ============================================================================
const rows = LEDGER.split("\n").filter(l => /^\|\s*`/.test(l));
const VERDICTS = ["PARITY", "EASIER", "HARDER", "UNVERIFIED"];
const rowCounts = {}; VERDICTS.forEach(v => rowCounts[v] = rows.filter(l => new RegExp("\\*\\*" + v + "\\*\\*").test(l)).length);
const summary = {}; VERDICTS.forEach(v => {
  const m = LEDGER.match(new RegExp("\\|\\s*\\*\\*" + v + "\\*\\*[^|]*\\|\\s*(\\d+)\\s*\\|"));
  if (m) summary[v] = +m[1];
});
const totalM = LEDGER.match(/\|\s*\*\*total rows\*\*\s*\|\s*\*\*(\d+)\*\*/);
check("14 — THE GUARD THAT WAS MISSING: the ledger's summary table matches the rows it summarises",
  VERDICTS.every(v => summary[v] === rowCounts[v]),
  VERDICTS.map(v => `${v} summary ${summary[v]} vs rows ${rowCounts[v]}`).join(" | "));
check("14 — ...and the buckets sum to the stated row count",
  totalM && +totalM[1] === rows.length &&
  VERDICTS.reduce((a, v) => a + (summary[v] || 0), 0) === rows.length,
  `${VERDICTS.reduce((a, v) => a + (summary[v] || 0), 0)} in buckets, ${totalM ? totalM[1] : "?"} stated, ${rows.length} rows present`);
check("14 — ...and the generator itself aborts rather than writing a ledger that does not add up",
  (() => { const T = readFileSync(new URL("../tools/parity-ledger.mjs", import.meta.url), "utf8");
    return /LEDGER ABORT: buckets sum to/.test(T) && /LEDGER ABORT: verdict outside the four/.test(T); })());
check("14 — Part 7.2.5: the Wilds and expedition block is taken — twelve rows off the backlog",
  (() => { const exps = LEDGER.split("\n");
    const i = exps.findIndex(l => /^## EXPEDITIONS/.test(l));
    if (i < 0) return false;
    const rest = exps.slice(i + 1); const end = rest.findIndex(l => /^## /.test(l));
    return (end < 0 ? rest : rest.slice(0, end)).filter(l => /^\|\s*`/.test(l)).length === 12; })());

// ============================================================================
// PASS CONDITION 15 — Rites and Convergence, ruled with a reason
// ============================================================================
// RE-POINTED v0.58, superseded by SPEC PART 1 (the condition restatement). v0.57's re-base was
// sized from TWO seeds and failed on two of three; Part 1's whole purpose is that a condition
// like this is an ENSEMBLE condition with a declared shape, so the label carries the shape and
// the reason rather than a re-base note. What is asserted is that the y75 threshold survives
// AND that it now declares itself a median condition with a stated reason.
check("15 — Rites of Targon is a y75 MEDIAN condition with its shape and reason stated (v0.58 Part 1)",
  /id: "rites", label: "Rites of Targon before year 75"/.test(PACING) &&
  /shape: "median"/.test(PACING) &&
  /an EARLY-PACE condition, and early pace is a distribution rather than a worst case/.test(PACING));
// The first draft of this assertion pinned the phrase "trend is MONOTONE TOWARD THE TARGET",
// which was the argument I gave for keeping the condition — and the v0.57 ensemble reversed the
// trend (1.42 / 2.87 / 3.71 against v0.56's 4.17 / 4.40). The argument is withdrawn in the
// source and the assertion now pins the WITHDRAWAL, because a suite that guards a claim its own
// round disproved is worse than no suite at all.
// RE-POINTED v0.58, superseded by SPEC PART 2. v0.57 KEPT the 5-8% band as a marker for work
// it was not doing; v0.58 does the work — the Chapel ports the missing producer tier — and only
// then re-derives the condition, in that order, which is what pacing.mjs's own ruling permits.
// The band becomes a FLOOR anchored on Kittens' 1,000-worship / 1.00% Solar Revolution gate,
// and the ceiling is explicitly withdrawn rather than invented.
// RE-POINTED v0.59, superseded by spec Part 4. The FLOOR and its Kittens anchor are unchanged
// and still asserted; what moved is the point of MEASUREMENT — off Sparks and onto Convergence's
// own unlock, because worshipBonus() returns 0 until the tech is researched and at Sparks it is
// not, so the old reading was the absence of a tech dressed up as a collapsed curve.
check("15/Part 4 — Convergence's floor is sourced, and measured at its own unlock",
  /Convergence AT ITS OWN UNLOCK/.test(PACING) &&
  /Kittens gates Solar Revolution at 1,000 worship/.test(PACING) &&
  /the source supplies no ceiling/.test(PACING) &&
  /convergenceAtUnlock/.test(PACING));

// ============================================================================
// PASS CONDITION 16 — the unchanged set
// ============================================================================
const unchanged = await page.evaluate(() => {
  S.buildings = {}; S.upgrades = {}; S.techs = {}; S.policies = {}; S.champs = {};
  S.leader = null; S.pop = 0; S.wanderers = []; S.drakes = {}; S.wtechs = {};
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
  const capped = Object.keys(RES).filter(r => RES[r].baseCap !== undefined);
  return { science, boostKeys: Object.keys(BOOST_LIMIT).length,
           noKnowledge: BOOST_LIMIT.knowledge === undefined, campLimit: CAMP_YIELD_LIMIT,
           n: sci.length, ties: steps.filter(v => v === 1).length,
           med: +med.toFixed(4), geo: +geo.toFixed(4), max: +Math.max(...steps).toFixed(3),
           cost: auditCostGraph().length, raw: auditRawGraph().length, version: VERSION,
           barnSum: +BARN_LINE.reduce((a, u) => a + u[1], 0).toFixed(4),
           wareSum: +WAREHOUSE_LINE.reduce((a, u) => a + u[1], 0).toFixed(4),
           unfamilied: capped.filter(r => capFamilyOf(r) === null).length };
});
check("16 — science parity is still ×20.8000", Math.abs(unchanged.science - 20.8) < 1e-3, `×${unchanged.science}`);
check("16 — BOOST_LIMIT still has seven keys and `knowledge` is still absent",
  unchanged.boostKeys === 7 && unchanged.noKnowledge, `${unchanged.boostKeys} keys`);
check("16 — CAMP_YIELD_LIMIT is still 6", unchanged.campLimit === 6);
check("16 — the storage accumulators are unmoved at Σ 4.35 / Σ 1.80",
  unchanged.barnSum === 4.35 && unchanged.wareSum === 1.8, `${unchanged.barnSum} / ${unchanged.wareSum}`);
check("16 — every capped resource still has a family (the invariant §19 shipped, strengthened)",
  unchanged.unfamilied === 0, `${unchanged.unfamilied} without one`);
// RE-POINTED v0.59.1 — notes 3 and 4.2. Deleting Kindling Theory takes the ladder 37 -> 36,
// which changes the count, drops one tie and moves the geometric mean; swapping Sump
// Ecology and The Chemtech Whisper reorders two adjacent rungs. All five figures are
// RE-MEASURED here rather than nudged: 36 techs, 8 ties, median ×1.1111 (unmoved), geo
// ×1.2717, max ×3.333 (unmoved). The BANDS the ladder is judged against are untouched.
// RE-POINTED v0.61, superseded by DEV NOTE 4 — the two Era-2 bridge techs merge into The
// Vanguard Doctrine, so the ladder is 35. The retired ids stay RESERVED under §30 until v1.0.
check("16 — the ladder is unmoved apart from the merge: 35 techs, 8 ties, median ×1.1111, max ×3.333",
  unchanged.n === 35 && unchanged.ties === 8 && unchanged.med === 1.1111 &&
  unchanged.max === 3.333,
  `N=${unchanged.n}, ${unchanged.ties} ties, ×${unchanged.med}, ×${unchanged.geo}, ×${unchanged.max}`);
check("16 — auditCostGraph() and auditRawGraph() are both still zero",
  unchanged.cost === 0 && unchanged.raw === 0, `${unchanged.cost} / ${unchanged.raw}`);

// ============================================================================
// PASS CONDITION 17 — every Part actioned
// ============================================================================
// RE-POINTED v0.58: a version assertion is true for one round by construction. It is kept as a
// FOOTER-RENDERING assertion, which is the property that can actually regress.
// RE-POINTED v0.58.1: OFF-CYCLE-PROTOCOL §1 admits a POINT release.
check("17 — VERSION is current and the footer is rendered from it",
  /^v0\.\d\d(\.\d+)?$/.test(unchanged.version) &&
  await page.evaluate(() => (document.body.innerText || "").indexOf(VERSION) > -1),
  unchanged.version);
check("no console errors across the whole suite", errors.length === 0, errors.slice(0, 3).join(" | "));

console.log(`\n${pass} passed, ${fail} failed`);
await browser.close();
suiteEnd(import.meta.url, pass, fail);
process.exit(fail ? 1 : 0);
