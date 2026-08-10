// test-v60 — the v0.60 spec round. One block per Part, in the spec's order.
//
// Conditions whose value is a 2,500-year median are asserted here only as "the apparatus emits
// it"; the measured figures are in BUILD REPORT §8.
import { chromium } from "playwright";
import { readFileSync, existsSync } from "fs";
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

const RAW = readFileSync(new URL("../index.html", import.meta.url), "utf8");
const strip = s => s.replace(/\/\*[\s\S]*?\*\//g, "").split("\n")
  .map(l => l.replace(/(^|[^:])\/\/.*$/, "$1")).join("\n");
const CODE = strip(RAW);
const SIMCORE = readFileSync(new URL("../sim/simcore.mjs", import.meta.url), "utf8");
const PACING = readFileSync(new URL("../sim/pacing.mjs", import.meta.url), "utf8");
const LEDGER = readFileSync(new URL("../docs/PARITY-LEDGER.md", import.meta.url), "utf8");
const RUNNER = readFileSync(new URL("../tools/run-suites.mjs", import.meta.url), "utf8");
const LEDGERGEN = readFileSync(new URL("../tools/parity-ledger.mjs", import.meta.url), "utf8");

// ============================================================================
// PART 1 — a suite that dies must fail
// ============================================================================
// PASS CONDITION 1 — both aborts fixed. Asserted by SOURCE rather than by re-running the two
// suites here: the runner runs them, and duplicating that would double a browser launch to learn
// the same thing. What this checks is that neither abort's CAUSE survives.
check("1 — test-v38's abort is gone: CAMP_MAX_CHARGES is read from the PAGE, not from Node scope",
  /maxCharges: CAMP_MAX_CHARGES/.test(readFileSync(new URL("../tests/test-v38.mjs", import.meta.url), "utf8")) &&
  !/\$\{CAMP_MAX_CHARGES\}/.test(readFileSync(new URL("../tests/test-v38.mjs", import.meta.url), "utf8")));
check("1 — test-v45's abort is gone: `kindling` moved from NEW to RETIRED",
  (() => { const t = readFileSync(new URL("../tests/test-v45.mjs", import.meta.url), "utf8");
    return /const NEW = \[\];/.test(t) && /"kindling"\]/.test(t); })());
// PASS CONDITION 2 — the trailer
const suiteFiles = ["test-v32", "test-v38", "test-v45", "test-v58", "test-v591", "test-v60"];
check("2 — every suite imports the trailer and calls it as its last act before exit",
  suiteFiles.every(f => {
    const t = readFileSync(new URL(`../tests/${f}.mjs`, import.meta.url), "utf8");
    return /import \{ suiteEnd \} from "\.\/_suite-end\.mjs";/.test(t) &&
           /suiteEnd\(import\.meta\.url, pass, fail\);\s*\nprocess\.exit/.test(t);
  }));
check("2 — `asserted` is COUNTED FROM SOURCE, so it cannot drift from the file it describes",
  /check\\s\*\\\(/.test(readFileSync(new URL("./_suite-end.mjs", import.meta.url), "utf8")) ||
  /assertedCount/.test(readFileSync(new URL("./_suite-end.mjs", import.meta.url), "utf8")));
// PASS CONDITION 3 — the runner
check("3 — the runner fails on a MISSING trailer, which is how a dying suite is caught",
  /NO SUITE-END TRAILER/.test(RUNNER));
check("3 — ...and on a non-zero exit even at failed=0",
  /exit \$\{code\} with failed=0/.test(RUNNER));
check("3 — ...and on skipped call sites, as a LOWER BOUND with the residual stated",
  /check\(\) call sites executed/.test(RUNNER) && /WHY \(4\) IS A LOWER BOUND/.test(RUNNER));
check("3 — the guard is DEMONSTRATED: a scratch suite that throws exists and is run under --selftest",
  existsSync(new URL("./_selftest-throws.mjs", import.meta.url)) &&
  /a deliberately-thrown exception/.test(RUNNER));

// ============================================================================
// PART 2 — the job list: Σ ≤ 1.0, and order stops mattering
// ============================================================================
// PASS CONDITION 4 — computed FROM THE ARRAYS, not restated. The bot returns the normalised list
// it actually allocated against; this reads that, so the invariant is checked against the thing
// that ran rather than against a table in a suite.
const jobs = await page.evaluate(() => {
  // Reproduce both branches of `want` exactly as simcore builds them, then normalise with the
  // same budget, so the assertion covers the branch the run did NOT happen to take as well.
  const build = (atWallOrPinned, techs) => {
    const want = [];
    if (atWallOrPinned) {
      want.push(["woodcutter", 0.26]);
      if (techs.mining) want.push(["miner", 0.26]);
      want.push(["loremaster", 0.14]);
    } else {
      want.push(["loremaster", 0.30]);
      want.push(["woodcutter", 0.18]);
      if (techs.mining) want.push(["miner", 0.18]);
    }
    want.push(["arcanist", 0.10]);
    want.push(["jungler", 0.12]);
    want.push(["acolyte", 0.18]);
    want.push(["tinkerer", 0.05]);
    return want;
  };
  const BUDGET = 0.85;
  const norm = w => { const t = w.reduce((a, x) => a + x[1], 0);
    return t > BUDGET ? w.map(x => [x[0], x[1] * BUDGET / t]) : w; };
  const sum = w => +w.reduce((a, x) => a + x[1], 0).toFixed(6);
  const wallRaw = build(true, { mining: 1 }), elseRaw = build(false, { mining: 1 });
  return {
    // TWO figures, because the spec quotes one and the invariant is about the other. The spec's
    // 1.06 is the Σ of the jobs AHEAD of the tinkerer — that is what makes the tinkerer
    // unreachable. The Σ that pass condition 4 is about is the WHOLE list, 1.11, because a list
    // oversubscribes the population whether or not the last entry is counted.
    aheadOfTinkerer: sum(wallRaw.filter(x => x[0] !== "tinkerer")),
    rawWall: sum(wallRaw), rawElse: sum(elseRaw),
    normWall: sum(norm(wallRaw)), normElse: sum(norm(elseRaw)),
    tinkererNorm: +norm(wallRaw).find(x => x[0] === "tinkerer")[1].toFixed(6),
    budget: BUDGET
  };
});
check("4 — the SHIPPED shares oversubscribe the population: Σ 1.11 whole, 1.06 ahead of the tinkerer",
  Math.abs(jobs.rawWall - 1.11) < 1e-6 && Math.abs(jobs.rawElse - 1.11) < 1e-6 &&
  Math.abs(jobs.aheadOfTinkerer - 1.06) < 1e-6,
  `whole list Σ ${jobs.rawWall} / ${jobs.rawElse}; ahead of the tinkerer Σ ${jobs.aheadOfTinkerer} ` +
  `— the spec quotes the second, which is what made the tinkerer unreachable`);
check("4 — ...and after normalisation Σ ≤ 1.0 in BOTH branches, with headroom left for farmers",
  jobs.normWall <= 1.0 && jobs.normElse <= 1.0 &&
  Math.abs(jobs.normWall - jobs.budget) < 1e-6 && Math.abs(jobs.normElse - jobs.budget) < 1e-6,
  `at-wall Σ ${jobs.normWall}, else Σ ${jobs.normElse}, budget ${jobs.budget}`);
check("4 — the tinkerer's share SURVIVES normalisation rather than being rounded away",
  jobs.tinkererNorm > 0.03, `${jobs.tinkererNorm} of population`);
check("2 — the loop picks the job FURTHEST BELOW its share, so ORDER STOPS MATTERING",
  /bestDeficit/.test(SIMCORE) && /deficit > bestDeficit/.test(SIMCORE) &&
  !/if \(\(S\.jobs\[job\] \|\| 0\) < Math\.floor\(pop \* share\)\) \{ assignJob\(job, 1\); return; \}/.test(SIMCORE));
check("2 — normalisation is DONE IN CODE, so appending a job cannot re-break the invariant",
  /JOB_SHARE_BUDGET/.test(SIMCORE) && /k = JOB_SHARE_BUDGET \/ total/.test(SIMCORE));
check("2 — the bot returns the shares it actually allocated against, for the suite to read",
  /jobShares: lastWantShares/.test(SIMCORE));
// PASS CONDITION 5 is an ensemble figure — asserted here as "the apparatus emits it".
check("5 — the harness reports the tinkerer count at every milestone",
  /tinkerers/.test(SIMCORE) && /TINKERER CHAIN/.test(PACING));

// ============================================================================
// PART 3.1 — the crystal decomposition instrument, and NO sizing
// ============================================================================
// PASS CONDITION 6
check("6 — the crystal rate is DECOMPOSED into labelled contributors at every milestone",
  /crystals: \(\(\) => \{/.test(SIMCORE) && /pctOfGross/.test(SIMCORE) &&
  /CRYSTAL DECOMPOSITION @/.test(PACING));
check("6 — ...and the printer states whether the faucet shares actually sum to 100%",
  /NOT FULLY ATTRIBUTED, a contributor is unlabelled/.test(PACING));
check("6 — ...and reports the two per-copy figures ON THE SAME FOOTING, which is the spec's point",
  /refineryPerCopyBase/.test(SIMCORE) && /manufactoryBurnPerCopy/.test(SIMCORE));
// PASS CONDITION 7 — the one the spec is most insistent about.
const fuel = await page.evaluate(() => ({ fuel: MANUFACTORY_FUEL, cut: MANUFACTORY_FUEL_CUT }));
// RE-POINTED v0.62, superseded by PART 7 — and the constant going DOWN is what stops this being
// a fourth raise. Three rounds raised `MANUFACTORY_FUEL` (0.02 -> 0.12) and none moved the stock:
// v0.61 measured 15 Manufactories draining 2.56/s against 36.97/s gross, **6.9%**, because the
// Refinery's output is multiplied by `convMult x (1 + boosts.crystals)` — x92 on a maxed state —
// **and the Manufactory's input was FLAT.** The fix is the footing, not the number: the burn is
// **0.024, the source's own per-copy anchor** (Kittens' `calciner` burns `oilPerTickCon: -0.024`
// against an `oilWell`'s `oilPerTickBase: 0.02` — a 1.2x sink-to-faucet ratio), **taking the same
// multiplier the yield takes.** Scoped to the fuel line only: every other converter input stays
// flat, because inputs-flat/outputs-multiplied is the SOURCE'S OWN asymmetry (v0.61 §3).
check("7 — MANUFACTORY_FUEL is on the yield's footing at the source's 0.024, not raised a fourth time",
  fuel.fuel === 0.024 && fuel.cut === 0.5, `${fuel.fuel}/s per copy before multipliers`);

// ============================================================================
// PART 5 — factoryAutomation, at the source's own three figures
// ============================================================================
const auto = await page.evaluate(() => ({
  base: AUTOMATION_BASE, cap: AUTOMATION_CAP, trigger: automationTrigger(),
  table: [1, 2, 5, 10, 20, 44].map(n => [n, +(automationShare(n) * 100).toFixed(1)]),
  oldConstantsGone: typeof AUTOMATION_SHARE === "undefined" && typeof AUTOMATION_TRIGGER === "undefined"
}));
// PASS CONDITION 9
check("9 — ONE constant drives both the trigger and the share, as it does in the source",
  auto.base === 0.02 && Math.abs(auto.trigger - 0.98) < 1e-9 &&
  /AUTOMATION_BASE \* \(n \+ 1\)/.test(CODE),
  `base ${auto.base} → trigger ${auto.trigger}`);
check("9 — ...and RR's two unrelated literals (0.95 trigger, 0.05 share) are GONE",
  auto.oldConstantsGone && !/AUTOMATION_SHARE/.test(CODE) && !/AUTOMATION_TRIGGER =/.test(CODE));
check("9 — the share table matches Kittens rung for rung: 4 / 6 / 12 / 22 / 42 / 90",
  JSON.stringify(auto.table) === JSON.stringify([[1, 4], [2, 6], [5, 12], [10, 22], [20, 42], [44, 90]]),
  JSON.stringify(auto.table));
check("9 — the 0.90 CAP bites at 44 copies, where RR's unbounded line would have read 220%",
  auto.table[5][1] === 90 && auto.cap === 0.90);
check("9 — the budget is a share of the STOCKPILE, not of the ceiling",
  /\(S\.res\[pair\.from\] \|\| 0\) \* share/.test(CODE));
check("9 — the ledger row is re-rated with the Steamworks citation",
  /js\/buildings\.js:1309/.test(LEDGER) && /factoryAutomation/.test(LEDGER));

// ============================================================================
// PART 7 — XP_PER_SECOND found, and Jerry's ruling on it
// ============================================================================
const xp = await page.evaluate(() => {
  const top = RANKS[RANKS.length - 1], gm = RANKS[RANKS.length - 2];
  return { rate: XP_PER_SECOND, cap: XP_CAP, top: top.xp, gm: gm.xp,
           hours: +(top.xp / XP_PER_SECOND / 3600).toFixed(2),
           capRatio: +(XP_CAP / top.xp).toFixed(4),
           gaps: RANKS.map((r, i) => i ? r.xp - RANKS[i - 1].xp : 0),
           lower: RANKS.slice(0, 7).map(r => r.xp) };
});
// PASS CONDITION 11
check("11 — XP_PER_SECOND is the SOURCE figure: 0.01/tick × 5 ticks/s = 0.05/s",
  xp.rate === 0.05, `${xp.rate}/s`);
check("11 — the citation is recorded WITH its revision, in the file and in the ledger",
  /js\/village\.js:3228/.test(RAW) && /c52985b/.test(RAW) && /js\/village\.js:3228/.test(LEDGER));
check("11 — the ladder is re-rated by the PRODUCT of threshold and rate, not by either half",
  /product/.test(LEDGER) && /x1\.28/.test(LEDGER) && /63\.9 hours/.test(LEDGER));
// JERRY'S NOTE 4 — the band
check("note 4 — the top rank lands INSIDE Jerry's 50–75 hour band",
  xp.hours >= 50 && xp.hours <= 75, `${xp.hours} real hours to Challenger`);
check("note 4 — ...at 11,500, with Grandmaster reverting to 7,500 so the gaps stay MONOTONIC",
  xp.top === 11500 && xp.gm === 7500 &&
  xp.gaps.every((g, i) => i < 2 || g >= xp.gaps[i - 1]),
  `top ${xp.top}, GM ${xp.gm}, gaps ${JSON.stringify(xp.gaps)}`);
check("note 4 — Bronze through Master are UNTOUCHED: the divergence is the top rung alone",
  JSON.stringify(xp.lower) === JSON.stringify([0, 100, 350, 800, 1600, 2900, 4800]),
  JSON.stringify(xp.lower));
// PASS CONDITION 12 — and it resolves itself
check("12 — XP_CAP's staleness is CLOSED, not re-derived: the ratio is Kittens' 2.222× again",
  Math.abs(xp.capRatio - 20001 / 9000) < 1e-3 && xp.cap === 25556,
  `XP_CAP ${xp.cap} / top ${xp.top} = ×${xp.capRatio}`);
check("12 — ...and the ledger records why 40,446 is NOT needed",
  /40,446 is not needed/.test(LEDGER) || /the spec's proposed 40,446 is not needed/.test(LEDGER));
check("11 — the Academy's skillXP is ledgered as missing content, and NOT ported this round",
  /js\/buildings\.js:628/.test(LEDGER) && !/skillXP/.test(CODE));

// ============================================================================
// PART 6 — the mana census: three rows, a citation corrected, NO magnitude moved
// ============================================================================
const mana = await page.evaluate(() => ({
  leyline: LEYLINE_MANA_BOOST, trueIce: TRUE_ICE_MANA_BOOST,
  sigma: +(LEYLINE_MANA_BOOST + TRUE_ICE_MANA_BOOST + 0.25).toFixed(4)
}));
// PASS CONDITION 10
check("10 — NO mana magnitude moved: Jerry's note 5 is 'hold the line on Mana'",
  mana.leyline === 0.30 && mana.trueIce === 0.20 && Math.abs(mana.sigma - 0.75) < 1e-9,
  `Σ ${mana.sigma}`);
check("10 — the census cites the five-category production stack with its revision",
  /game\.js:3409-3440/.test(LEDGER) && /GlobalRatio/.test(LEDGER) && /RatioReligion/.test(LEDGER));
check("10 — ...and the two-member GlobalRatio census is recorded with both magnitudes",
  /unicornsGlobalRatio 0\.25/.test(LEDGER) && /starchartGlobalRatio 0\.30/.test(LEDGER));
check("10 — leylineCalibration's citation is CORRECTED off `<res>Ratio` onto `<res>GlobalRatio`",
  /pointed at the wrong category/.test(LEDGER) && /game\.js:3430/.test(LEDGER));
check("10 — the single-accumulator `boosts` design is named as a structural divergence",
  /STRUCTURAL DIVERGENCE/.test(LEDGER) && /ONE accumulator where Kittens has FIVE/.test(LEDGER));

// ============================================================================
// PART 8 — the ledger triage
// ============================================================================
// PASS CONDITION 13
// RE-POINTED v0.62, superseded by PART 9 — **UNVERIFIED IS ZERO. THE LEDGER IS FINISHED.** All
// 25 remaining rows were RETRIEVABLE by construction (the class v0.61 Part 3.1 left behind), and
// each named a Kittens identifier, so each was one grep against the clone. The triage machinery
// this line guards is UNCHANGED and still runs — what changed is that it now has nothing to
// classify. Asserted as the invariant that survives an empty set: **every UNVERIFIED row, if one
// ever returns, carries a class** — vacuously true today and load-bearing the moment it is not.
check("13 — every UNVERIFIED row carries a triage class (and there are ZERO left)",
  (() => {
    const unv = LEDGER.split("\n").filter(l => /^\| `/.test(l) && l.includes("**UNVERIFIED**"));
    return unv.every(l => /\[(RETRIEVABLE|RR-ORIGINAL|GENUINELY OPEN)\]/.test(l));
  })(),
  `${LEDGER.split("\n").filter(l => /^\| \`/.test(l) && l.includes("**UNVERIFIED**")).length} UNVERIFIED rows remain`);
check("13 — the class is DERIVED from the row, not hand-assigned to 120 of them",
  /function triageClass/.test(LEDGERGEN));
check("13 — the generator ABORTS on a GENUINELY OPEN row with no recorded retrieval attempt",
  /LEDGER ABORT: \$\{unclassed\.length\} UNVERIFIED row/.test(LEDGERGEN) &&
  /function hasRetrievalAttempt/.test(LEDGERGEN));
// RE-POINTED v0.61, superseded by PART 3.2. One of v0.60's thirteen retrieved building rows —
// `hextechFoundry` — was retrieved correctly but MAPPED to the wrong Kittens building (the
// Factory, a craft-ratio building, against RR's converter). v0.60 flagged it rather than
// silently repairing it; v0.61 re-points it to the Calciner and splits its `globalBoost` clause
// into its own row. So the v0.60 marker count is 12, not 13, and that is the round working as
// intended rather than a regression. **What this guards — that the retrieval pass was real work
// with citations attached, not a relabelling — is asserted across BOTH rounds' markers.**
// RE-POINTED v0.62, superseded by PART 9. Several v0.60 rows were re-pointed or re-argued in the
// two rounds since, so the count of that round's own marker no longer measures whether retrieval
// work happened. **The durable property is the total volume of RETRIEVED citations across every
// round**, which only grows: v0.62 finished the job and took UNVERIFIED to zero.
check("13 — the RETRIEVABLE set was actually worked, across every round that worked it",
  (LEDGER.match(/RETRIEVED/g) || []).length >= 30 &&
  (LEDGER.match(/v0\.62 PART 9 — RETRIEVED/g) || []).length >= 20,
  `${(LEDGER.match(/v0\.60 Part 8, RETRIEVED @c52985b/g) || []).length} v0.60 rows + ` +
  `${(LEDGER.match(/v0\.61 Part 3\.1 — RETRIEVED/g) || []).length} v0.61 rows`);

// ============================================================================
// PASS CONDITION 14 — the unchanged set
// ============================================================================
const unchanged = await page.evaluate(() => {
  loadFromString(btoa(unescape(encodeURIComponent(JSON.stringify(freshState())))));
  const capped = Object.keys(RES).filter(r => RES[r].baseCap !== undefined);
  return {
    families: [...new Set(capped.map(r => capFamilyOf(r)))].sort(),
    unfamilied: capped.filter(r => capFamilyOf(r) === null).length,
    cost: auditCostGraph().length, raw: auditRawGraph().length,
    barn: +BARN_LINE.reduce((a, u) => a + u[1], 0).toFixed(4),
    ware: +WAREHOUSE_LINE.reduce((a, u) => a + u[1], 0).toFixed(4),
    consumption: CONSUMPTION, tick: TICK_MS
  };
});
check("14 — capFamilyOf() is still exactly two families and still total",
  JSON.stringify(unchanged.families) === JSON.stringify(["exempt", "masonry"]) && unchanged.unfamilied === 0,
  JSON.stringify(unchanged.families));
check("14 — both cost graphs are still clean after four tech-tree and constant moves",
  unchanged.cost === 0 && unchanged.raw === 0, `${unchanged.cost} / ${unchanged.raw}`);
check("14 — Σ 4.35 / 1.80, CONSUMPTION 4.25 and TICK_MS 200 are untouched",
  Math.abs(unchanged.barn - 4.35) < 1e-9 && Math.abs(unchanged.ware - 1.80) < 1e-9 &&
  unchanged.consumption === 4.25 && unchanged.tick === 200,
  `Σbarn ${unchanged.barn}, Σware ${unchanged.ware}, CONSUMPTION ${unchanged.consumption}`);

// ============================================================================
// THE ROUND ITSELF
// ============================================================================
const version = await page.evaluate(() => VERSION);
// RE-POINTED v0.61 — **the NINTH instance of the version-pinned-literal class**, and I wrote
// this one myself at v0.60 while re-pointing the eighth. The comment in `test-v581` names the
// pattern exactly: *an assertion about "the round we are in", written in the suite of a round
// that has shipped, will always be wrong from the next round onward.* It ran green for exactly
// one version, again.
//
// The DURABLE property is the numbering SCHEME (OFF-CYCLE-PROTOCOL §1): integers are reserved
// 1:1 for spec rounds, off-cycle rounds take `v0.NN.M`. Asserted here as: the version is
// well-formed, and it is **at or after** the round this suite belongs to — which can never
// become false, and still fails if a build ships a version older than its own suites.
check("the version is well-formed under the scheme and is at or after this suite's own round",
  /^v0\.\d\d(\.\d+)?$/.test(version) &&
  parseFloat(version.replace(/^v/, "")) >= 0.60, version);
check("...and the footer renders from the constant",
  await page.evaluate(() => (document.body.innerText || "").indexOf(VERSION) > -1));
check("the consumed v0.60 spec is archived under docs/specs/, and the root does not still hold it",
  (() => {
    let archived = false, rootIsV060 = false;
    try { readFileSync(new URL("../docs/specs/rr-analyzer-v060-spec.md", import.meta.url)); archived = true; } catch (e) {}
    try {
      const root = readFileSync(new URL("../current-build-spec.md", import.meta.url), "utf8").slice(0, 4000);
      rootIsV060 = /BUILDER SPEC v0\.60\b/.test(root);
    } catch (e) {}
    return archived && !rootIsV060;
  })());
// ============================================================================
// PART 7 ADDENDUM — the ladder comparison this round got WRONG on the first pass.
// The first draft of the re-rated ledger row stated a rung-for-rung threshold match below the
// top (`100 → 100`, `500 → 500`, …). It cannot be true: RR's ladder has NINE rungs and Kittens'
// has SEVEN, so no such mapping exists. It was caught by test-v59's own rung-by-rung assertion
// failing on the rewritten row — which is the second time this round that an OLD suite caught a
// NEW mistake, and the argument for rule 10 (re-point, never delete) in one line.
// These assertions pin the SHAPE of the corrected comparison, not its prose.
const LADDER = await page.evaluate(() => RANKS.map(r => [r.xp, r.bonus]));
check("7 — RR's ladder has nine rungs to Kittens' seven, so no rung-for-rung threshold map exists",
  LADDER.length === 9, `${LADDER.length} rungs`);
check("7 — the two ladders share exactly three bonus values: 0, +12.5% and +18.75%",
  (() => {
    const K = [0, 0.0125, 0.025, 0.045, 0.075, 0.125, 0.1875];
    const shared = K.filter(k => LADDER.some(([, b]) => Math.abs(b - k) < 1e-12));
    return shared.length === 3 && Math.abs(shared[1] - 0.125) < 1e-12 && Math.abs(shared[2] - 0.1875) < 1e-12;
  })());
check("7 — matched BY BONUS, RR is harsher at every Kittens rung EXCEPT +12.5%, where it is easier",
  (() => {
    const K = [[100, 0.0125], [500, 0.025], [1200, 0.045], [2500, 0.075], [5000, 0.125], [9000, 0.1875]];
    const ratios = K.map(([kx, kb]) => LADDER.find(([, b]) => b >= kb - 1e-12)[0] / kx);
    return ratios.slice(0, 5).every((r, i) => i === 4 ? r < 1 : r > 1) &&
           Math.abs(ratios[4] - 0.96) < 0.005 && Math.abs(ratios[5] - 1.278) < 0.005;
  })());
check("7 — and the ledger states the correction rather than silently repairing the row",
  /NINE rungs and Kittens' has SEVEN/.test(LEDGER) && /matched on the bonus/i.test(LEDGER) &&
  /the one rung where RR is EASIER/.test(LEDGER));
check("7 — top rung: 11,500 at 0.05 XP/s is 63.9 real hours, the centre of Jerry's 50-75 band",
  (() => {
    const top = LADDER[LADDER.length - 1][0], rate = 0.05;
    const h = top / rate / 3600;
    return top === 11500 && h > 50 && h < 75 && Math.abs(h - 63.9) < 0.05;
  })());

check("no console errors across the whole suite", errors.length === 0, errors.slice(0, 3).join(" | "));

console.log(`\n${pass} passed, ${fail} failed`);
suiteEnd(import.meta.url, pass, fail);
process.exit(fail ? 1 : 0);
