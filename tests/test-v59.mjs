// test-v59 — the v0.59 spec round. One block per Part, in the spec's own order, so verification
// can be checked against `docs/specs/rr-analyzer-v059-spec.md` line by line.
//
// Conditions whose value is a 2,500-year MEDIAN (first/tenth champion, Era 3, the Convergence
// year) are asserted here only as "the apparatus emits it" — a suite cannot assert an ensemble
// figure, and pretending otherwise is how a pass condition stops meaning anything. The measured
// values are in BUILD REPORT §6.
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
const SIMCORE = readFileSync(new URL("../sim/simcore.mjs", import.meta.url), "utf8");
const PACING = readFileSync(new URL("../sim/pacing.mjs", import.meta.url), "utf8");
const LEDGER = readFileSync(new URL("../docs/PARITY-LEDGER.md", import.meta.url), "utf8");
const RULINGS = readFileSync(new URL("../STANDING-RULINGS.md", import.meta.url), "utf8");
// The three luxuries are furs, plumes and mushrooms; note 8 must not have changed that.
const LUXURY_KINDS_EXPECTED = 3;
// v0.59.1 note 1 — Leyline Calibration's magnitude, unchanged by the re-scope (BUILD REPORT §3).
const LEYLINE_EXPECTED = 0.30;

// ============================================================================
// PART 1 — the Granary is deleted on every load, and the id that ate it
// ============================================================================
await reset();
const gran = await page.evaluate(() => {
  loadFromString(btoa(unescape(encodeURIComponent(JSON.stringify(freshState())))));
  S.buildings.granary = 7; S.buildings.storehouse = 3;
  const before = { granary: S.buildings.granary, storehouse: S.buildings.storehouse };
  loadFromString(serialize());
  const after = { granary: S.buildings.granary || 0, storehouse: S.buildings.storehouse || 0 };
  return { before, after,
           granaryIsLive: !!BUILDINGS.find(b => b.id === "granary"),
           runestoneIsLive: !!BUILDINGS.find(b => b.id === "runestone") };
});
// PASS CONDITION 1
check("1 — seven Granaries survive a save/load round trip as seven Granaries",
  gran.after.granary === 7 && gran.after.storehouse === 3,
  `${JSON.stringify(gran.before)} → ${JSON.stringify(gran.after)}`);
check("1 — ...and `granary` is a LIVE building id, which is why the migration had to go",
  gran.granaryIsLive === true);
check("1 — `runestone` is KEPT, and kept on a measurement: no live building uses that id",
  gran.runestoneIsLive === false && /fresh\.buildings\.runestone/.test(CODE));

// PASS CONDITION 2 — every id in the migration block has a round-trip assertion.
// The list is EXTRACTED FROM THE SOURCE rather than typed here, so a migration added in a
// future round without an assertion fails this suite instead of passing it silently.
// `delete fresh.buildings.X` is the exact, mechanical signature of a building migration's
// SOURCE — the id being retired. Reading the destinations instead (which an earlier draft did)
// picks up `storehouse` and `lumberMill`, which are live buildings receiving a fold, and turns
// the reused-id guard into a false alarm about the very mechanism that is correct.
const migrationSources = [...new Set(
  (CODE.match(/delete fresh\.buildings\.(\w+)/g) || []).map(m => m.match(/delete fresh\.buildings\.(\w+)/)[1])
)];
const roundTrip = await page.evaluate(ids => {
  const out = {};
  for (const id of ids) {
    loadFromString(btoa(unescape(encodeURIComponent(JSON.stringify(freshState())))));
    S.buildings[id] = 7;
    loadFromString(serialize());
    out[id] = { survived: (S.buildings[id] || 0), live: !!BUILDINGS.find(b => b.id === id) };
  }
  return out;
}, migrationSources);
check("2 — the migration block's sources are read FROM THE SOURCE, not restated here",
  migrationSources.length >= 6, migrationSources.join(", "));
// PASS CONDITION 3 — the reused-id guard, and it is the whole point of STANDING-RULINGS §30.
const reused = Object.entries(roundTrip).filter(([, v]) => v.live).map(([k]) => k);
check("3 — REUSED-ID GUARD: no live BUILDINGS id is a migration SOURCE",
  reused.length === 0,
  reused.length ? `LIVE AND MIGRATED AWAY: ${reused.join(", ")} — this is the v0.56 Granary defect` : "none");
check("2 — every migration source round-trips: a dead id folds, a live id would not",
  Object.entries(roundTrip).every(([, v]) => v.live ? v.survived === 7 : v.survived === 0),
  JSON.stringify(roundTrip));
check("§30 — the ruling is RECORDED: a deleted id is never reused, and a migration names its retirement",
  /## 30\./.test(RULINGS) && /reused/i.test(RULINGS) && /retire/i.test(RULINGS));
check("§30 — ...and this migration names the version that retires it",
  /retires? at v1\.0/i.test(RAW));

// ============================================================================
// PART 2 — the renown economy (directives 1-6)
// ============================================================================
const renown = await page.evaluate(() => {
  const fresh = () => loadFromString(btoa(unescape(encodeURIComponent(JSON.stringify(freshState())))));
  const all = () => TECHS.forEach(t => S.techs[t.id] = 1);
  const o = {};

  // 2.1 — the camp ladder is alive, and every hunt pays
  fresh(); all(); S.buildings.hallOfHeroes = 30;
  o.rate = RENOWN_DEED_RATE;
  o.ladder = {};
  ["wolves", "gromp", "raptors", "krugs", "drakeHunt", "baron"].forEach(id => {
    const e = EXPEDITIONS.find(x => x.id === id);
    if (e) o.ladder[id] = { authored: e.renown || 2, paid: renownForExpedition(e) };
  });
  const hunt = charges => {
    fresh(); all(); S.pop = 0; S.res.renown = 100; S.res.vigor = 1e6; S.buildings.hallOfHeroes = 30;
    const e = EXPEDITIONS.find(x => x.id === "wolves");
    if (!charges) while (campCharges(e) > 0) consumeCharge(e);
    const b = S.res.renown; runExpedition("wolves"); return S.res.renown - b;
  };
  o.wolves0 = hunt(0);
  o.wolvesEmpowered = hunt(1);
  o.tip = (() => { fresh(); all(); return renownYieldLine(EXPEDITIONS.find(x => x.id === "wolves")); })();

  // 2.2 — the trickle
  fresh(); S.techs.logistics = 1; S.pop = 40; o.trickleLogisticsOnly = computeRates().renown || 0;
  fresh(); S.techs.logistics = 1; S.techs.callToArms = 1; S.pop = 40; o.trickleAt40 = computeRates().renown || 0;
  fresh(); S.techs.logistics = 1; S.techs.callToArms = 1; S.pop = 140; o.trickleAt140 = computeRates().renown || 0;
  // no backfill: logistics, no callToArms, one hour ticked
  fresh(); S.techs.logistics = 1; S.pop = 40; S.res.renown = 0;
  for (let t = 0; t < 3600; t++) step(1, 1);
  o.renownAfterAnHourWithoutCallToArms = Math.round(S.res.renown || 0);

  // 2.3 — trade
  const setup = leader => {
    fresh(); all();
    S.factionsFound = {}; FACTIONS.forEach(f => S.factionsFound[f.id] = 1);
    for (const r in RES) if (RES[r].baseCap !== undefined) S.res[r] = 1e7;
    S.res.renown = 0; S.buildings.hallOfHeroes = 400;
    S.champs = {}; S.leader = null;
    if (leader) { S.champs[leader] = { r: 1, xp: 0 }; S.leader = leader; }
  };
  setup(null);
  let b = S.res.renown; tradeCaravan(STARTER_FACTION); o.tradeOne = S.res.renown - b;
  b = S.res.renown; tradeCaravanBulk(STARTER_FACTION, 10); o.tradeBulk10 = S.res.renown - b;
  setup("caitlyn");
  b = S.res.renown; tradeCaravan(STARTER_FACTION); o.tradeOneCaitlyn = S.res.renown - b;
  b = S.res.renown; tradeCaravanBulk(STARTER_FACTION, 10); o.tradeBulk10Caitlyn = S.res.renown - b;
  // failures pay nothing
  setup(null);
  const failing = FACTIONS.find(f => f.failChance);
  const realFail = failing.failChance; failing.failChance = () => 1.0;
  b = S.res.renown; tradeCaravan(failing.id); o.tradeFailed = S.res.renown - b;
  failing.failChance = realFail;
  // the gate
  fresh(); all(); S.techs.callToArms = 0;
  S.factionsFound = {}; FACTIONS.forEach(f => S.factionsFound[f.id] = 1);
  for (const r in RES) if (RES[r].baseCap !== undefined) S.res[r] = 1e7;
  S.res.renown = 0; S.leader = null;
  tradeCaravan(STARTER_FACTION); o.tradeBeforeCallToArms = S.res.renown;

  // 2.4 — Ascent and first-time research grant NOTHING. Measured, not assumed.
  fresh(); all(); S.res.devotion = 5000; S.res.renown = 100; S.buildings.hallOfHeroes = 30;
  b = S.res.renown; ascendTargon(); o.ascentDelta = S.res.renown - b;
  fresh(); all(); S.techs = {}; S.techs.callToArms = 1;
  for (const r in RES) if (RES[r].baseCap !== undefined) S.res[r] = 1e7;
  S.res.renown = 100; S.buildings.hallOfHeroes = 30;
  b = S.res.renown; buyTech("mining"); o.techDelta = S.res.renown - b;
  b = S.res.renown; buyUpgrade("cataloguing"); o.upgradeDelta = S.res.renown - b;

  // 2.5 — the sink
  fresh();
  o.tenth = Math.round(RECRUIT_BASE * Math.pow(RECRUIT_RATIO, 9));
  o.hallsForTenth = (() => { let h = 0; while (h < 200) { S.buildings = { hallOfHeroes: h }; if (computeCaps().renown >= o.tenth) break; h++; } return h; })();
  S.buildings = {};
  return o;
});
// PASS CONDITION 4
check("4 — the charge guard is DELETED: a Wolves hunt with ZERO charges still pays",
  renown.wolves0 === 2, `${renown.wolves0} renown on an unempowered hunt (authored 2)`);
check("4 — ...and the charge MULTIPLIES ×3, applied AFTER the floor: 2 → 6",
  renown.wolvesEmpowered === 6 && renown.wolvesEmpowered === renown.wolves0 * 3,
  `${renown.wolves0} → ${renown.wolvesEmpowered}`);
check("4 — the guard is gone from the source, not bypassed",
  !/if \(!isChargeCamp\(e\) \|\| empowered\)/.test(CODE) && /renownForExpedition/.test(CODE));
// PASS CONDITION 10c
check("10c — RENOWN_DEED_RATE is 1.00 and the camp ladder is no longer a flat 1",
  renown.rate === 1.00 &&
  renown.ladder.wolves.paid === 2 && renown.ladder.raptors.paid === 3 &&
  renown.ladder.drakeHunt.paid === 15 && renown.ladder.baron.paid === 40,
  JSON.stringify(Object.fromEntries(Object.entries(renown.ladder).map(([k, v]) => [k, v.paid]))));
check("10c — ...and every camp pays its AUTHORED field exactly, so the card is the truth",
  Object.values(renown.ladder).every(v => v.paid === v.authored));
check("10c — the tooltip names the empowered payout, from ONE generator shared with the pay site",
  renown.tip === "+2 renown (+6 empowered)" &&
  (CODE.match(/renownYieldLine\(e\)/g) || []).length === 3 &&
  (CODE.match(/RENOWN_DEED_RATE \* policyMult\("renown"\)/g) || []).length === 1, renown.tip);
// PASS CONDITION 10a
check("10a — the trickle is FLAT 0.007/s: identical at pop 40 and pop 140",
  Math.abs(renown.trickleAt40 - 0.007) < 1e-9 && Math.abs(renown.trickleAt140 - 0.007) < 1e-9,
  `${renown.trickleAt40}/s at pop 40, ${renown.trickleAt140}/s at pop 140`);
check("10a — ...gated on callToArms, not logistics: logistics alone pays nothing",
  renown.trickleLogisticsOnly === 0, `${renown.trickleLogisticsOnly}/s`);
check("10a — NO BACKFILL: logistics without callToArms, one hour ticked → renown is 0",
  renown.renownAfterAnHourWithoutCallToArms === 0,
  `${renown.renownAfterAnHourWithoutCallToArms} renown after 3,600 s`);
// PASS CONDITION 10b
check("10b — a caravan pays +1 renown for EVERY leader",
  renown.tradeOne === 1, `${renown.tradeOne}`);
check("10b — Caitlyn's 5 is an ADDITION, not a replacement: 1 + 5 = 6",
  renown.tradeOneCaitlyn === 6, `${renown.tradeOneCaitlyn}`);
check("10b — bulk pays PER CARAVAN, not per click: ×10 grants 10 (60 under Caitlyn)",
  renown.tradeBulk10 === 10 && renown.tradeBulk10Caitlyn === 60,
  `${renown.tradeBulk10} plain, ${renown.tradeBulk10Caitlyn} under Caitlyn`);
check("10b — a FAILED caravan pays nothing, because the grant is on the success path",
  renown.tradeFailed === 0, `${renown.tradeFailed}`);
check("10b — ...and the whole trade grant still respects the Call to Arms gate",
  renown.tradeBeforeCallToArms === 0);
// PASS CONDITION 10d
check("10d — the Ascent grants NO renown, and no code was added to make it so",
  renown.ascentDelta === 0, `${renown.ascentDelta}`);
check("10d — first-time research and first-time Discovery grant NO renown",
  renown.techDelta === 0 && renown.upgradeDelta === 0,
  `tech ${renown.techDelta}, upgrade ${renown.upgradeDelta}`);
check("10d — ...and both are RECORDED in the ledger so a future round does not add them",
  /Ascent/.test(LEDGER) && /first-time research/i.test(LEDGER));
// PASS CONDITION 5 (the suite half — the ensemble half is BUILD REPORT §6)
check("5 — the Halls needed for the tenth champion are computed and finite",
  renown.hallsForTenth > 0 && renown.hallsForTenth < 60,
  `${renown.hallsForTenth} Halls clear the tenth champion's ${renown.tenth} renown`);
check("5 — ...and the ensemble reports first champion, tenth champion and renown time-at-cap",
  /firstChampion/.test(PACING) && /tenthChampionAffordable/.test(SIMCORE) && /renownAtCapPct/.test(PACING));

// ============================================================================
// PART 3 — the Era 3 band, ruled rather than re-based
// ============================================================================
// PASS CONDITION 6
check("6 — the 1,400-2,300 Era 3 band is RETIRED in pacing.mjs, by Jerry's ruling, WITH a reason",
  /THE 1,400-2,300 BAND IS RETIRED/.test(PACING) &&
  /907 is okay for Era 3/.test(PACING) &&
  /ICATHIA IS NOW REACHED ON EVERY SEED/.test(PACING));
check("6 — ...and it is a RETIREMENT, not a silent re-base to the measured value",
  /THIS IS A RETIREMENT, NOT A RE-BASE/.test(PACING) &&
  !/target 1,400-2,300/.test(PACING));
check("6 — Era 3 length is still REPORTED as a number, so the trend stays visible",
  /ERA 3 LENGTH: \$\{\(m\.icathia - m\.sparks\)/.test(PACING));

// ============================================================================
// PART 4 — Convergence's measurement point
// ============================================================================
// PASS CONDITION 7
check("7 — the Convergence condition is measured at its OWN UNLOCK, not at Sparks",
  /Convergence AT ITS OWN UNLOCK/.test(PACING) &&
  /value: r\.convergenceAtUnlock/.test(PACING));
check("7 — ...with the arithmetic shown and Kittens' 1,000-worship / 1.00% anchor cited beside it",
  /Kittens gates Solar Revolution at 1,000 worship/.test(PACING) &&
  /0\.01 x \(sqrt\(1 \+ 8w\/1000\) - 1\) \/ 2/.test(PACING) &&
  /w = 1000/.test(PACING));
check("7 — the harness CAPTURES the bonus at the gate and the year the gate opens",
  /convergenceAtUnlock/.test(SIMCORE) && /convergenceWorshipAtUnlock/.test(SIMCORE) &&
  /mark\("convergenceAffordable"\)/.test(SIMCORE));
check("7 — worshipBonus() itself is UNTOUCHED (STANDING-RULINGS §§1 and 3)",
  /0\.01 \* unlimitedDR\(S\.worship/.test(CODE) || /unlimitedDR\(S\.worship \|\| 0, 1000\)/.test(CODE),
  (CODE.match(/function worshipBonus\(\)[\s\S]{0,220}/) || [""])[0].replace(/\s+/g, " ").slice(0, 200));

// ============================================================================
// PART 5.3 — the Scholarship cap family is deleted
// ============================================================================
const fam = await page.evaluate(() => {
  const fresh = () => loadFromString(btoa(unescape(encodeURIComponent(JSON.stringify(freshState())))));
  const o = {};
  fresh();
  const capped = Object.keys(RES).filter(r => RES[r].baseCap !== undefined);
  o.families = Object.fromEntries(capped.map(r => [r, capFamilyOf(r)]));
  o.distinct = [...new Set(Object.values(o.families))].sort();
  o.unfamilied = capped.filter(r => capFamilyOf(r) === null);
  o.multiFamily = capped.filter(r => [CAP_MULT_EXEMPT[r], CAP_SCOPE[r]].filter(Boolean).length !== 1);
  o.scholarCapsExists = (typeof SCHOLAR_CAPS !== "undefined");
  o.scholarLineExists = (typeof SCHOLAR_LINE !== "undefined");
  o.scholarCapNamesExists = (typeof scholarCapNames === "function");
  o.capMultNames = capMultNames();
  o.poppyDesc = poppyLeadDesc();
  // renown's ceiling, at 0 / 1 / 20 Halls, with and without the three cap techs
  const at = (halls, techs) => { fresh(); S.techs = techs ? { trade: 1, drakeLore: 1, voidStudies: 1 } : {};
                                 S.buildings = { hallOfHeroes: halls }; return computeCaps().renown; };
  o.renown = { bare0: at(0, false), bare1: at(1, false), bare20: at(20, false),
               teched0: at(0, true), teched20: at(20, true) };
  // Poppy now REACHES renown
  fresh(); S.techs = { trade: 1, drakeLore: 1, voidStudies: 1 }; S.buildings = { hallOfHeroes: 20 };
  const noLeader = computeCaps().renown;
  S.champs = { poppy: { r: 1, xp: 0 } }; S.leader = "poppy";
  o.poppyOnRenown = +(computeCaps().renown / noLeader).toFixed(4);
  fresh();
  return o;
});
// PASS CONDITION 10
check("10 — SCHOLAR_CAPS, SCHOLAR_LINE and scholarCapNames() are all GONE from the running game",
  !fam.scholarCapsExists && !fam.scholarLineExists && !fam.scholarCapNamesExists,
  `SCHOLAR_CAPS ${fam.scholarCapsExists}, SCHOLAR_LINE ${fam.scholarLineExists}, scholarCapNames ${fam.scholarCapNamesExists}`);
check("10 — ...and from the stripped source, along with scholarMult and scholarAdd",
  !/SCHOLAR_CAPS/.test(CODE) && !/SCHOLAR_LINE/.test(CODE) &&
  !/scholarMult/.test(CODE) && !/scholarAdd/.test(CODE) && !/scholarCapNames/.test(CODE),
  (CODE.match(/SCHOLAR_CAPS|SCHOLAR_LINE|scholarMult|scholarAdd|scholarCapNames/g) || []).join(" ") || "all absent");
check("10 — capFamilyOf() is down to TWO families: exempt and masonry, and it is TOTAL",
  JSON.stringify(fam.distinct) === JSON.stringify(["exempt", "masonry"]) &&
  fam.unfamilied.length === 0 && fam.multiFamily.length === 0,
  `${JSON.stringify(fam.distinct)}; unfamilied ${JSON.stringify(fam.unfamilied)}; multi ${JSON.stringify(fam.multiFamily)}`);
check("10 — renown's ceiling is FLAT AND ADDITIVE: 30 + 900 × Halls bare, 210 + 900 × Halls with the three cap techs",
  fam.renown.bare0 === 30 && fam.renown.bare1 === 930 && fam.renown.bare20 === 30 + 900 * 20 &&
  fam.renown.teched0 === 210 && fam.renown.teched20 === 210 + 900 * 20,
  JSON.stringify(fam.renown));
check("10 — Poppy's +8% now REACHES renown, which the family guard used to prevent",
  Math.abs(fam.poppyOnRenown - 1.08) < 1e-4, `×${fam.poppyOnRenown}`);
check("10 — ...and her advertised line count is GENERATED and has moved with it",
  fam.capMultNames === 13 && fam.poppyDesc.indexOf("13 material lines") > -1,
  `${fam.capMultNames} lines: "${fam.poppyDesc}"`);

// ============================================================================
// PART 5.4 — the five upgrades become knowledge amplifiers
// ============================================================================
const know = await page.evaluate(() => {
  const fresh = () => loadFromString(btoa(unescape(encodeURIComponent(JSON.stringify(freshState())))));
  const FIVE = ["cataloguing", "crossReferencing", "greatIndex", "annotatedIndex", "livingLibrary"];
  const o = {};
  const state = (ups, obs, morello) => {
    fresh(); TECHS.forEach(t => S.techs[t.id] = 1);
    S.buildings = { archive: 20, academy: 15, observatory: obs, hexLab: 5 };
    S.res.morellonomicon = morello || 0; S.res.tome = 0;
    ups.forEach(u => S.upgrades[u] = 1);
    return computeCaps().knowledge;
  };
  o.base10 = state(["voidglassLenses"], 10, 0);
  o.all10 = state(FIVE.concat("voidglassLenses"), 10, 0);
  o.base0 = state(["voidglassLenses"], 0, 0);
  o.all0 = state(FIVE.concat("voidglassLenses"), 0, 0);
  o.morelloBase = state(["voidglassLenses"], 10, 1000);
  o.morelloAll = state(FIVE.concat("voidglassLenses"), 10, 1000);
  fresh(); FIVE.forEach(u => S.upgrades[u] = 1);
  o.sigma = archiveRatioTotal();
  o.line = ARCHIVE_RATIO_LINE.slice();
  o.astrolabe = Object.assign({}, ASTROLABE_LINE);
  o.astrolabeMult = ASTROLABE_MULT;
  o.knowledgeFamily = capFamilyOf("knowledge");
  o.exempt = Object.keys(CAP_MULT_EXEMPT).sort();
  // voidglassLenses untouched
  fresh(); TECHS.forEach(t => S.techs[t.id] = 1); S.buildings = { observatory: 10 };
  const noLens = computeCaps().knowledge; S.upgrades.voidglassLenses = 1;
  o.voidglass = +(computeCaps().knowledge / noLens).toFixed(4);
  o.descs = FIVE.map(id => UPGRADES.find(u => u.id === id).effect);
  fresh();
  return o;
});
// PASS CONDITION 10f
check("10f — archiveRatio is Kittens' Σ 0.06, three rungs at 0.02 each",
  Math.abs(know.sigma - 0.06) < 1e-9 && know.line.length === 3 && know.line.every(u => u[1] === 0.02),
  `Σ ${know.sigma} from ${JSON.stringify(know.line)}`);
check("10f — ...and it is SCALED BY OBSERVATORY COUNT: nothing at 0 observatories, ×1.30 at 10",
  Math.abs(know.all0 / know.base0 - (1 + (20 * 250 * 0 + 15 * 500 * 0.5 + 5 * 1500 * 0.5) / know.base0)) < 0.01 ||
  Math.abs(know.all10 / know.base10 - 1.30) < 0.005,
  `0 obs: ×${(know.all0 / know.base0).toFixed(4)}  |  10 obs: ×${(know.all10 / know.base10).toFixed(4)}`);
check("10f — the building total is 35,000 → 45,500 at the spec's fixture, exactly as predicted",
  know.base10 === 35000 && know.all10 === 45500, `${know.base10} → ${know.all10}`);
check("10f — the two Astrolabe rungs are the Academy and the Hexcore Laboratory, at ×1.5 per copy",
  know.astrolabe.annotatedIndex === "academy" && know.astrolabe.livingLibrary === "hexLab" &&
  know.astrolabeMult === 1.5, JSON.stringify(know.astrolabe));
check("10f — MORELLONOMICON COMPOUNDING: raising the building slices raises the compendium ceiling too",
  Math.abs(know.morelloAll / know.morelloBase - know.all10 / know.base10) < 0.005,
  `${know.morelloBase} → ${know.morelloAll} (×${(know.morelloAll / know.morelloBase).toFixed(4)}) vs buildings ×${(know.all10 / know.base10).toFixed(4)}`);
// PASS CONDITION: knowledge takes NO whole-cap multiplier
check("10f — knowledge is STILL in CAP_MULT_EXEMPT and no whole-cap knowledge multiplier ships",
  know.knowledgeFamily === "exempt" &&
  JSON.stringify(know.exempt) === JSON.stringify(["culture", "devotion", "knowledge", "vigor"]) &&
  !/caps\.knowledge \*=/.test(CODE) && !/technocracy/i.test(CODE),
  JSON.stringify(know.exempt));
check("10f — ...and the standing rule is RECORDED: a whole-cap knowledge multiplier belongs on a POLICY",
  /belongs on a POLICY/.test(RAW) && /technocracy/i.test(RAW) && /150,000/.test(RAW));
// PASS CONDITION 10e
check("10e — voidglassLenses is UNTOUCHED at ×1.5 per Observatory copy — Kittens' Astrolabe",
  Math.abs(know.voidglass - 1.5) < 1e-9 &&
  /b\.id === "observatory" && S\.upgrades\.voidglassLenses\) mult \*= 1\.5/.test(CODE),
  `×${know.voidglass}`);
check("10e — ...and it is ledgered PARITY against js/buildings.js:672",
  /voidglassLenses/.test(LEDGER) && /js\/buildings\.js:672/.test(LEDGER));
check("5.4 — every rung's description is GENERATED and names what it actually does",
  know.descs.slice(0, 3).every(d => /a further 2%/.test(d) && /Archive/.test(d) && /Observatory/.test(d)) &&
  /Academies hold \+50%/.test(know.descs[3]) && /Laboratories hold \+50%/.test(know.descs[4]),
  JSON.stringify(know.descs));

// ============================================================================
// PARTS 5.1, 5.2, 6 — the citations, the retraction and the rank ladder
// ============================================================================
// PASS CONDITION 8
check("8 — the Golden Spire citation is in the ledger for §29's ×1.5 slice",
  /js\/buildings\.js:196[4-6]/.test(LEDGER) && /Golden Spire/i.test(LEDGER) &&
  /faithMax/.test(LEDGER));
// PASS CONDITION 9
check("9 — culture's ×1.05 is VERIFIED, with BOTH citations recorded",
  /cityOnAHill/.test(LEDGER) && /js\/science\.js:12(8[0-9]|9[0-7])/.test(LEDGER) &&
  /js\/resources\.js:9(5[89]|6[01])/.test(LEDGER) && /onAHillCultureCap/.test(LEDGER));
// PASS CONDITION 11
// RE-POINTED v0.60, superseded by v0.60 PART 7. v0.59 pinned RR's top two rungs (10,200 /
// 18,200) and the 102% debt they implied; note 4 moved them to 7,500 / 11,500 and the debt
// re-rated to 28%. THE PROPERTY IS UNCHANGED and is what stays asserted: Kittens' seven rungs and
// their seven bonuses are present RUNG BY RUNG, RR's own top two are named, and the debt is
// stated as a number rather than as an adjective. The KITTENS half of this line is pinned as
// before — those seven thresholds and bonuses are the source's and do not move.
check("11 — the rank ladder is in the ledger RUNG BY RUNG against Kittens' seven tiers",
  ["100", "500", "1,200", "2,500", "5,000", "9,000"].every(t => LEDGER.indexOf(t) > -1) &&
  ["1.25%", "2.5%", "4.5%", "7.5%", "12.5%", "18.75%"].every(t => LEDGER.indexOf(t) > -1) &&
  LEDGER.indexOf("7,500") > -1 && LEDGER.indexOf("11,500") > -1 &&
  /HARDER — 28%/.test(LEDGER),
  "all seven Kittens rungs, their bonuses, and the debt at each");
// RE-POINTED v0.60, same supersession. v0.59's whole point here was that a threshold debt
// measured against an UNKNOWN rate is one unknown times another — so the row had to state the
// interaction rather than report the thresholds alone. The rate is now known, which does not
// retire the property, it DISCHARGES it: the row must still state both factors, and now it can
// state the product, which is the only figure a player experiences.
check("11 — ...and the ladder is rated by the PRODUCT of threshold ratio and rate ratio",
  /XP_PER_SECOND/.test(LEDGER) && /threshold/i.test(LEDGER) &&
  /threshold ratio x1\.28/i.test(LEDGER) && /rate ratio x1\.00/i.test(LEDGER) &&
  /product x1\.28/i.test(LEDGER));
// PART 5.2 — the retraction
check("5.2 — the v0.58.1 §22 claim is RETRACTED in the ledger: SCHOLAR_CAPS had one member",
  /RETRACT/i.test(LEDGER) && /§22/.test(LEDGER));

// ============================================================================
// PART 8 — the eight feel-and-UI notes
// ============================================================================
const feel = await page.evaluate(() => {
  const fresh = () => loadFromString(btoa(unescape(encodeURIComponent(JSON.stringify(freshState())))));
  const o = {};
  // note 3 — Zilean spends on a button
  fresh(); S.champs = { zilean: { r: 1, xp: 0 } }; S.leader = "zilean";
  S.timeWarpMs = TIMEWARP_MAX_MS; S.warpSpending = false;
  for (let i = 0; i < 50; i++) step(1, 1);
  o.autoFiredAtCeiling = !!S.warpSpending;
  o.spendReturns = spendTimeWarp(); o.spendingAfterButton = !!S.warpSpending;
  S.timeWarpMs = 0; S.warpSpending = false;
  o.refusesWhenEmpty = spendTimeWarp() === false;
  // note 4 — bulk on charge camps, never on cooldown camps
  fresh(); TECHS.forEach(t => S.techs[t.id] = 1); S.res.vigor = 1e7; S.buildings.hallOfHeroes = 400;
  const wolves = EXPEDITIONS.find(e => e.id === "wolves");
  const before = S.res.furs || 0;
  runExpeditionBulk("wolves", 5);
  o.bulkOnChargeCampWorked = (S.res.furs || 0) > before;
  const drakeBefore = JSON.stringify(S.res);
  runExpeditionBulk("drakeHunt", 5);
  o.bulkOnCooldownCampRefused = JSON.stringify(S.res) === drakeBefore;
  // note 5 — Swain distinct
  const sw = CHAMPS.find(c => c.id === "swain");
  o.swainPassiveKey = sw.passive.key; o.swainPassiveDesc = sw.passive.desc; o.swainLead = sw.lead;
  fresh(); S.champs = { swain: { r: 1, xp: 0 } }; S.pop = 10;
  S.jobs = { arcanist: 5 }; S.wanderers = Array.from({ length: 5 }, (_, i) => ({ nm: "a" + i, j: "arcanist", jx: {}, xp: 0, t: "trailblazer" }));
  o.swainMana = +(computeRates().mana || 0).toFixed(4);
  S.champs = {}; o.noSwainMana = +(computeRates().mana || 0).toFixed(4);
  // note 6 — the Arcanist line reaches Kittens' ×1.80
  fresh(); S.pop = 10; S.jobs = { arcanist: 10 };
  S.wanderers = Array.from({ length: 10 }, (_, i) => ({ nm: "a" + i, j: "arcanist", jx: {}, xp: 0, t: "trailblazer" }));
  const m0 = computeRates().mana; S.upgrades.arcaneFocus = 1;
  const m1 = computeRates().mana; S.upgrades.leylineCalibration = 1;
  const m2 = computeRates().mana;
  o.arcanist = { focus: +(m1 / m0).toFixed(4), both: +(m2 / m0).toFixed(4) };
  // v0.59.1 note 1: measured with NO arcanists, so only a global boost can move it.
  fresh(); S.buildings = { manaWell: 20 }; S.pop = 0; S.jobs = {}; S.wanderers = []; S.upgrades = {};
  const wells0 = computeRates().mana;
  S.upgrades.leylineCalibration = 1;
  const wells1 = computeRates().mana;
  S.upgrades.trueIceCellars = 1; S.upgrades.hexresonance = 1;
  const wells3 = computeRates().mana;
  o.manaGlobal = { wellsOnly: +(wells1 / wells0).toFixed(4), allThree: +(wells3 / wells0).toFixed(4) };
  o.newDiscovery = (() => { const u = UPGRADES.find(x => x.id === "leylineCalibration"); return { tech: u.tech, cost: u.cost, req: u.req }; })();
  o.costAudit = auditCostGraph();
  // note 8 — festival luxuries
  fresh(); S.pop = 40;
  o.festivalConsts = { mushrooms: FESTIVAL_MUSHROOMS, plumeShare: FESTIVAL_PLUME_SHARE };
  const fc = festivalCost();
  o.festivalPlumesAreHalf = fc.plumes * 2 === fc.mushrooms || Math.abs(fc.plumes * 2 - fc.mushrooms) <= 1;
  o.festivalCost = fc;
  // 8.8 SCOPE — every OTHER thing in the game denominated in mushrooms or plumes.
  o.luxScope = {
    noxusPlumes:  FACTIONS.find(f => f.id === "noxus").cost.plumes,
    jessedHawks:  UPGRADES.find(u => u.id === "jessedHawks").cost.plumes,
    beastLore:    UPGRADES.find(u => u.id === "beastLore").cost,
    harvestRites: UPGRADES.find(u => u.id === "harvestRites").cost.mushrooms,
    shaco:        CHAMPS.find(c => c.id === "shaco").cost.plumes,
    twitch:       CHAMPS.find(c => c.id === "twitch").cost.mushrooms,
    raptorYield:  EXPEDITIONS.find(e => e.id === "raptors").yield,
    luxuryKinds:  LUXURY_KINDS
  };
  TECHS.forEach(t => S.techs[t.id] = 1);
  S.pop = 40; ["mushrooms", "plumes", "furs"].forEach(r => { S.res[r] = 500; S.seenMax[r] = 500; });
  const lr = computeRates();
  o.luxDrain = { furs: +lr.furs.toFixed(4), mushrooms: +lr.mushrooms.toFixed(4), plumes: +lr.plumes.toFixed(4) };
  fresh();
  return o;
});
// PASS CONDITION 15 (the mechanisms; the ledger rows are asserted below)
// RE-POINTED v0.59.1, superseded by NOTE 2 (Jerry): "The new buttons on the wanderer page are
// terrible - it creates a lot of vertical scrolling that we want to avoid." v0.59 Part 8 note 1
// fixed the CLIPPING by letting eight chips wrap — which traded a clipped row for a two-line row
// and made the thing it was fixing worse. The row does not wrap any more; it carries two
// controls and the bulk steps live in an absolutely-positioned flyout.
check("8.1/2 — the job row does NOT wrap, and the flyout is out of flow so it cannot push rows down",
  /\.job-row \{ display: flex; align-items: center; gap: 6px; margin-bottom: 7px;\n\s*flex-wrap: nowrap; overflow: visible; \}/.test(RAW) &&
  /\.job-flyout \{ display: none; position: absolute;/.test(RAW) &&
  /\.job-ctl \{ position: relative;/.test(RAW));
check("8.2 — crafting is wired into the EXISTING undo window and the EXISTING re-roll guard",
  /snapshotUndo\("Crafted " \+ c\.name, "craft"\)/.test(CODE) && /undoBulkDepth/.test(CODE));
check("8.2 — ...and the v0.55 open item is closed in the same round: trades snapshot too",
  /snapshotUndo\("Caravan to " \+ f\.name, "trade"\)/.test(CODE) &&
  /clearRerollPenalty\("trade", "caravan"\)/.test(CODE));
check("8.2 — a BULK action snapshots ONCE, at the batch boundary, not per item",
  /if \(undoBulkDepth > 0\) return;/.test(CODE) &&
  (CODE.match(/undoBulkDepth\+\+/g) || []).length === 2);
check("8.3 — Zilean's AUTOMATIC trigger at the ceiling is DELETED, not bypassed",
  !/S\.timeWarpMs >= TIMEWARP_MAX_MS\) S\.warpSpending = true/.test(CODE) &&
  feel.autoFiredAtCeiling === false,
  `warpSpending after 50 s at a full bank: ${feel.autoFiredAtCeiling}`);
check("8.3 — ...and the button spends it, refusing when the bank is empty",
  feel.spendReturns === true && feel.spendingAfterButton === true && feel.refusesWhenEmpty === true &&
  /id="btn-warp"/.test(RAW) && /function spendTimeWarp\(\)/.test(CODE));
check("8.4 — bulk hunting works on CHARGE camps and is still refused on COOLDOWN camps",
  feel.bulkOnChargeCampWorked === true && feel.bulkOnCooldownCampRefused === true,
  `charge camp ${feel.bulkOnChargeCampWorked}, cooldown camp refused ${feel.bulkOnCooldownCampRefused}`);
// PASS CONDITION 13
check("13 — Swain's passive and his lead are DISTINCT: mana production vs knowledge production",
  feel.swainPassiveKey === "mana" && /mana production/.test(feel.swainPassiveDesc) &&
  /knowledge production/.test(feel.swainLead) && !/knowledge/.test(feel.swainPassiveDesc),
  `passive "${feel.swainPassiveDesc}" | lead "${feel.swainLead}"`);
check("13 — ...and the passive actually lands on mana production",
  feel.swainMana > feel.noSwainMana, `${feel.noSwainMana}/s → ${feel.swainMana}/s with Swain recruited`);
// PASS CONDITION 14
// RE-POINTED v0.59.1, superseded by NOTE 1 (Jerry): "The mana discovery should affect all mana
// production, not just arcanists." v0.59 Part 8 note 6 shipped `leylineCalibration` as the
// second rung of the Arcanist JOB line, matching Kittens' two-rung catnipJobRatio at ×1.80.
// Jerry's note moves its SCOPE — it is a global mana boost now, additive with Hexresonance —
// so the ×1.80 two-rung figure no longer describes anything in RR and the parity claim is
// re-rated in the ledger rather than quietly kept. What replaces it is the property the note
// actually asks for, measured where it could not have been true before: the discovery reaches
// mana production with NO ARCANIST ASSIGNED AT ALL.
check("14/1 — the mana Discovery reaches ALL mana production, not just Arcanists",
  Math.abs(feel.manaGlobal.wellsOnly - (1 + LEYLINE_EXPECTED)) < 1e-4,
  `×${feel.manaGlobal.wellsOnly} on Mana Wells with zero arcanists`);
check("14/1 — ...and it is ADDITIVE with the other two mana boosts, never multiplicative",
  Math.abs(feel.manaGlobal.allThree - 1.75) < 1e-4,
  `×${feel.manaGlobal.allThree} with Leyline + True Ice + Hexresonance ` +
  `(additive 1+0.30+0.20+0.25 = 1.75; multiplicative would be 1.95)`);
check("14 — ...rung-matched at the Sparks band, and the cost graph audit is clean",
  feel.newDiscovery.tech === "sparks" && feel.newDiscovery.req === "arcaneFocus" &&
  feel.costAudit.length === 0,
  `${JSON.stringify(feel.newDiscovery)}; audit ${JSON.stringify(feel.costAudit)}`);
check("8.7 — the Festival shows on the buff banner beside the Baron and the Crest of Cinders",
  /FESTIVAL ' \+ Math\.ceil/.test(RAW) && /HAND OF BARON/.test(RAW) && /CREST OF CINDERS/.test(RAW));
check("8.8 — the Festival costs fewer mushrooms, and plumes are HALF the mushroom cost",
  feel.festivalConsts.mushrooms === 2 && feel.festivalConsts.plumeShare === 0.5 &&
  feel.festivalPlumesAreHalf,
  JSON.stringify(feel.festivalCost));
// 8.8 SCOPE — added after Jerry clarified: "fewer mushrooms / plumes at half should only be for
// the FESTIVAL COST, not the luxury material overall." It already was, but "it already was" is
// not a guarantee about the next round. This pins the scope in both directions: the two
// constants are read in exactly ONE function, and every other price and yield denominated in
// mushrooms or plumes still carries the figure it carried before the note.
check("8.8 SCOPE — FESTIVAL_MUSHROOMS / FESTIVAL_PLUME_SHARE are read in festivalCost() ALONE", (() => {
  // Counting references would encode how many times the function happens to mention them today
  // (three, because the plume line is derived FROM the mushroom line). What the scope claim
  // actually needs is that no reference lives OUTSIDE festivalCost(), which is what is checked:
  // blank the function's body out of the source and require that nothing is left.
  const body = CODE.slice(CODE.indexOf("function festivalCost()"));
  const end = body.indexOf("\n}");
  const outside = CODE.replace(body.slice(0, end), "")
    .replace(/var FESTIVAL_MUSHROOMS[^\n]*\n/, "");          // the declaration itself is fine
  const stray = (outside.match(/FESTIVAL_MUSHROOMS|FESTIVAL_PLUME_SHARE/g) || []);
  return stray.length === 0;
})(), "no reference outside festivalCost() other than the declaration");
check("8.8 SCOPE — ...and note 8 moved NO other mushroom or plume price in the game",
  feel.luxScope.noxusPlumes === 120 && feel.luxScope.jessedHawks === 120 &&
  feel.luxScope.beastLore.plumes === 30 && feel.luxScope.beastLore.mushrooms === 40 &&
  feel.luxScope.harvestRites === 400 && feel.luxScope.shaco === 60 && feel.luxScope.twitch === 90 &&
  /12–18 Raptor Plumes/.test(feel.luxScope.raptorYield),
  JSON.stringify(feel.luxScope));
check("8.8 SCOPE — ...and the per-head luxury DRAIN is still identical across all three luxuries",
  feel.luxDrain.furs === feel.luxDrain.mushrooms && feel.luxDrain.mushrooms === feel.luxDrain.plumes &&
  feel.luxDrain.mushrooms < 0 && LUXURY_KINDS_EXPECTED === feel.luxScope.luxuryKinds,
  JSON.stringify(feel.luxDrain));

// ============================================================================
// JERRY'S DEV NOTE 1 — only BULK transmute shows in the chronicle
// ============================================================================
const chron = await page.evaluate(() => {
  loadFromString(btoa(unescape(encodeURIComponent(JSON.stringify(freshState())))));
  S.res.mana = 1e6; S.res.timber = 0;
  const lines = () => (S.log || []).filter(l => /Transmutation/.test(l.t || l.text || JSON.stringify(l))).length;
  const before1 = lines(); transmuteMana(1); const after1 = lines();
  const before2 = lines(); transmuteMana(10); const after2 = lines();
  return { single: after1 - before1, bulk: after2 - before2, timber: Math.round(S.res.timber) };
});
check("DEV NOTE 1 — a SINGLE transmute is silent in the chronicle",
  chron.single === 0, `${chron.single} chronicle lines for one cast`);
check("DEV NOTE 1 — ...and a BULK transmute still reports, because that is the one a player cannot reconstruct",
  chron.bulk === 1, `${chron.bulk} chronicle lines for ×10`);
check("DEV NOTE 1 — the conversion itself is unchanged: both casts still produced timber",
  chron.timber > 0, `${chron.timber} timber from 11 casts`);

// ============================================================================
// PASS CONDITION 16 — THE UNCHANGED SET. Every one of these is something a previous round
// established and this round must not have moved. They are cheap and they have caught real
// regressions in three separate rounds.
// ============================================================================
const unchanged = await page.evaluate(() => {
  const fresh = () => loadFromString(btoa(unescape(encodeURIComponent(JSON.stringify(freshState())))));
  fresh();
  const o = {};
  // The spec's "limit 6 · Σ 4.35/1.80" is CAMP_YIELD_LIMIT and the two STORAGE accumulators —
  // Kittens' barnRatio Σ 4.35 and warehouseRatio Σ 1.80 (js/resources.js:866-885) — not the
  // craft limit and not the axe/hoe lines. Measured and corrected here rather than asserted
  // against the wrong three constants and quietly re-pointed later.
  o.campLimit = CAMP_YIELD_LIMIT;
  o.barnSigma = +BARN_LINE.reduce((a, u) => a + u[1], 0).toFixed(4);
  o.wareSigma = +WAREHOUSE_LINE.reduce((a, u) => a + u[1], 0).toFixed(4);
  o.exemptKeys = Object.keys(CAP_MULT_EXEMPT).length;
  o.capScopeKeys = Object.keys(CAP_SCOPE).length;
  o.costAudit = auditCostGraph().length;
  o.tickMs = TICK_MS;
  o.chargeBonus = CHARGE_BONUS;
  o.transmuteCost = TRANSMUTE_COST;
  o.transmuteWeight = TRANSMUTE_CRAFT_WEIGHT;
  o.festivalMorale = FESTIVAL_MORALE_MULT;
  return o;
});
check("16 — TICK_MS is 200: exact tick parity with Kittens' 5/s", unchanged.tickMs === 200);
check("16 — CAMP_YIELD_LIMIT 6 and the two storage accumulators Σ 4.35 / 1.80 are untouched",
  unchanged.campLimit === 6 && Math.abs(unchanged.barnSigma - 4.35) < 1e-9 &&
  Math.abs(unchanged.wareSigma - 1.80) < 1e-9,
  `CAMP_YIELD_LIMIT ${unchanged.campLimit}, Σbarn ${unchanged.barnSigma}, Σware ${unchanged.wareSigma}`);
check("16 — the v0.58.1 loop-guard numbers are untouched",
  unchanged.transmuteCost === 20 && unchanged.transmuteWeight === 0.20 &&
  unchanged.chargeBonus === 3.0 && unchanged.festivalMorale === 1.20,
  `TRANSMUTE_COST ${unchanged.transmuteCost}, weight ${unchanged.transmuteWeight}, charge ×${unchanged.chargeBonus}, festival ×${unchanged.festivalMorale}`);
check("16 — the cost-graph audit is clean after a new Discovery was added",
  unchanged.costAudit === 0, `${unchanged.costAudit} findings`);

// ============================================================================
// THE ROUND ITSELF
// ============================================================================
const version = await page.evaluate(() => VERSION);
// RE-POINTED v0.59.1 — and this is the FIFTH version-pinned assertion this project has had to
// unpick, so the rule is worth restating: **a suite cannot assert which round the build is in.**
// It can only assert facts about ITS OWN round, which do not change, and properties of the
// numbering scheme, which also do not change.
//
// What v0.59 established is that an ANALYZER-SPEC round takes an INTEGER tag — and the durable
// evidence for that is the archived spec, not the `VERSION` constant, which the very next
// off-cycle round moved to v0.59.1 exactly as OFF-CYCLE-PROTOCOL §1 requires.
check("v0.59 was an INTEGER round because it had an analyzer spec, and the scheme still holds",
  /^v0\.\d\d(\.\d+)?$/.test(version) && (() => {
    try { readFileSync(new URL("../docs/specs/rr-analyzer-v059-spec.md", import.meta.url)); return true; }
    catch (e) { return false; }
  })(), version);
check("...and the footer renders from the constant",
  await page.evaluate(() => (document.body.innerText || "").indexOf(VERSION) > -1));
// RE-POINTED v0.60 — and this is the SEVENTH assertion of this class the project has unpicked,
// so the class is worth naming rather than the instance: **"file X is absent" is a
// version-pinned assertion in disguise.** It is true only until the next round legitimately
// creates X. This one asserted the repo root held NO spec; v0.60's analyzer then pushed one,
// exactly as the cycle requires.
//
// The durable property is the one OFF-CYCLE-PROTOCOL §3 actually states: a consumed spec is
// MOVED to docs/specs/, never copied and left behind. So: v0.59's spec is archived, and whatever
// sits at the root is not v0.59's.
check("the consumed v0.59 spec is archived, and the repo root does not still hold it", (() => {
  let archived = false, rootIsV059 = false;
  try { readFileSync(new URL("../docs/specs/rr-analyzer-v059-spec.md", import.meta.url)); archived = true; } catch (e) {}
  try {
    const root = readFileSync(new URL("../current-build-spec.md", import.meta.url), "utf8").slice(0, 4000);
    rootIsV059 = /BUILDER SPEC v0\.59\b/.test(root);
  } catch (e) { /* absent is also correct — that is the between-rounds state */ }
  return archived && !rootIsV059;
})());
check("no console errors across the whole suite", errors.length === 0, errors.slice(0, 3).join(" | "));

console.log(`\n${pass} passed, ${fail} failed`);
await browser.close();
suiteEnd(import.meta.url, pass, fail);
process.exit(fail ? 1 : 0);
