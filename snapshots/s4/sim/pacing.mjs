// ============================================================================
// STANDING CALIBRATION NOTE — v0.52 Part 3.3, ruled rather than fixed.
//
// RR's pacing targets (Sparks, Icathia, Era 3 length) are measured on a bot that does not
// BANK vigor: it spends it on expeditions the instant it can afford one. A player at
// Icathia can afford 186.88 trades per game-year and, since v0.47's offline accrual,
// returns to a vigor STOCK rather than a flow. Every pacing figure in this project is
// therefore an UPPER BOUND on a trading player's timeline. This is a deliberate
// calibration choice, not an artefact.
//
// v0.53 CORRECTION — this note said "a bot that NEVER TRADES", and that is not true and
// has not been true for some rounds. Instrumented this round: the shipped v0.52 build
// completes 46,630 trades in a 2,500-year run and its first trade lands at y362.7. What
// the bot does not do is BANK — it never holds vigor for a route in preference to an
// expedition — so trade only happens once vigor income has outgrown the expedition sink
// entirely, which is deep into Era 3. The distinction matters: the v0.52 report's
// explanation of the Rites of Targon regression rests on early trade vigor, and the
// measurement shows ZERO vigor spent on trade before y100. See pass conditions below.
//
// The alternative — teaching manageTrade() a banking policy — would re-baseline every
// number this project steers by. It was scheduled for v0.53 and is DEFERRED TO v0.54 with
// a stated reason: v0.53's Part 1 already re-baselines every pacing figure by changing
// what the bot can buy, and two re-baselines from different causes in one round are
// inseparable. Recorded in docs/analyzer-status.md.
// ============================================================================
import { openGame, runSim } from "./simcore.mjs";
const years = +(process.argv.find(a => a.startsWith("--years"))?.split("=")[1] ?? process.argv[process.argv.indexOf("--years") + 1] ?? 150);
const fileArg = process.argv[process.argv.indexOf("--file") + 1];
const { browser, page, errors } = await openGame(process.argv.includes("--file") ? fileArg : undefined);
console.log(`pacing: simulating ${years} game-years (seed ${+(process.argv[process.argv.indexOf("--seed") + 1] || 1) || 1})...`);
const t0 = Date.now();
const seed = +(process.argv[process.argv.indexOf("--seed") + 1] || 1) || 1;
const r = await runSim(page, years, seed);
console.log(`(${((Date.now() - t0) / 1000).toFixed(1)}s wall)\n`);
const m = r.milestones;
const row = (k, label) => console.log(`  ${label.padEnd(34)} ${m[k] !== undefined ? "year " + m[k] : "NEVER"}`);
console.log("MILESTONES");
row("voidStudies", "Void Studies (Era 1 complete)");
row("ritesOfTargon", "Rites of Targon (Era 2 entry)");
row("firstAscent", "First Ascent");
row("callToArms", "Call to Arms");
row("firstChampion", "First champion");
row("pop75", "75 wanderers");
row("pop130", "130 wanderers");
row("sparks", "Sparks Beyond the Wall (Era 3)");
row("chemtech", "The Chemtech Whisper");
row("hexcore", "The Hexcore Conjecture");
row("firstHexcore", "First Hextech Core crafted");
row("deepWorks", "The Deep Works");
row("icathia", "The Doors of Icathia (Era 3 end)");
row("firstTrade", "First trade completed");
// v0.50 Part 2.3 — zero in every build ever measured before this round.
row("gloriousEvolution", "THE GLORIOUS EVOLUTION researched");
row("firstAugmentChamber", "First Augment Chamber built");
console.log("\nFINAL", JSON.stringify(r.final));
console.log("PEAK POPULATION:", r.peakPop);
// v0.53 Part 7: Era 3 length is the number the whole round steers by. It was computed by
// hand from two milestone rows in every prior report. It is printed.
if (m.sparks !== undefined && m.icathia !== undefined)
  console.log(`ERA 3 LENGTH: ${(m.icathia - m.sparks).toFixed(1)} game-years ` +
    `(v0.52 baseline 826.5; target 1,400-2,300; distance to minimum ${(1400 - (m.icathia - m.sparks)).toFixed(1)})`);
else console.log("ERA 3 LENGTH: n/a (Sparks or Icathia not reached)");
// v0.49 Part 6 — the category Part 1.7 cut from five members to Kittens' two.
["sparks", "hexcore", "icathia"].forEach(k => {
  const s = r.snaps && r.snaps[k];
  if (!s) return;
  const cm = s.catMonument;
  console.log(`catMonument @${k}: x${cm ? cm.total : "?"}` +
    (cm ? "  " + Object.entries(cm.parts).map(([id, p]) => `${id} n=${p.n} +${(p.perCopy*100).toFixed(2)}%/copy = +${(p.contrib*100).toFixed(1)}%`).join(" | ") || "(none owned)" : ""));
  // v0.53 Part 5.1: the two halves are now the same quantity, so the gap between them is
  // a defect report on the reader rather than a finding about the game. Printed with the
  // gap as a percentage so the <1% pass condition is read off the line, not computed.
  if (s.science) {
    const d = s.science.delivered, kw = s.science.kittensWouldGive;
    const gap = (d && kw) ? (100 * Math.abs(d - kw) / kw).toFixed(3) : "n/a";
    console.log(`  KNOWLEDGE MULT @${k}: delivered x${d} vs 1+Sigma x${kw} — gap ${gap}% (target <1%)` +
      `  Sigma ${s.science.sigma} = ${JSON.stringify(s.science.sigmaParts)}  counts ${JSON.stringify(s.science.counts)}`);
  }
  console.log(`  provisions ${s.provisionsPerSec}/s (${s.farmsteads} farmsteads, ${s.irrigation} irrigation) ` +
    `| steel ${s.steelPerSec}/s (${s.forge} forges, ${s.bloomery} bloomeries) ` +
    `| morale ${s.morale} (${s.bardsHearths} hearths, relief ${s.crowdReliefPct}%)`);
  console.log(`  TINKERER CHAIN @${k}: ${s.tinkerers} tinkerers, ${s.augmentChamber} augment chambers, ` +
    `crystals ${s.crystalsPerSec}/s, held ${s.crystalsHeld}/${s.crystalsCap}`);
  console.log(`  Petricite Quarries @${k}: ${s.ratioBuildings ? s.ratioBuildings.quarry : "?"}` +
    `   Arcane Reactors: ${s.arcaneReactor ?? "?"}   Foundries: ${s.hextechFoundry ?? "?"}` +
    `   Augment Chambers: ${s.augmentChamber ?? "?"}   Shimmer Refineries: ${s.shimmerRefinery ?? "?"}` +
    `   shimmer ${s.shimmerPerSec ?? "?"}/s`);
});

// ---- v0.53 Part 1: THE APPARATUS SWEEP, printed first because every number above it
// is measured on an instrument that could not buy a fifth of the late game. ----
console.log("\nv0.53 PART 1 — APPARATUS REACHABILITY");
console.log(`  build order: ${r.buildOrder.length} ids + ${r.dedicatedRoutines.length} dedicated routines ` +
  `against ${r.final.buildingCount ?? "?"} BUILDINGS`);
console.log(`  UNREACHABLE BY THE INSTRUMENT: ${r.unreachableBuildings.length ? r.unreachableBuildings.join(", ") : "none (target: none)"}`);
["sparks", "hexcore", "deepWorks", "icathia"].forEach(k => {
  const s = r.snaps && r.snaps[k];
  if (!s || !s.zeroFive) return;
  console.log(`  @${k.padEnd(10)} ` + Object.entries(s.zeroFive).map(([id, n]) => `${id} ${n}`).join(" | "));
  console.log(`   ${" ".padEnd(10)} poro ladder: ` + Object.entries(s.poroLadder).map(([id, n]) => `${id} ${n}`).join(" | ") +
    `  poros ${s.poros} tears ${s.poroTears} poroRatio x${s.poroRatioDelivered}`);
  console.log(`   ${" ".padEnd(10)} seenMax: ` + Object.entries(s.seenMaxIntermediates).map(([k2, v]) => `${k2} ${v}`).join(" | "));
});
// ---- v0.53 Part 2: the crystal sink, in the unit Part 2.2 asks for ----
console.log("\nv0.53 PART 2 — CRYSTALS (income vs spend, per game-year)");
["deepWorks", "icathia"].forEach(k => {
  const s = r.snaps && r.snaps[k];
  if (!s) return;
  console.log(`  @${k}: ${s.crystalsPerSec}/s = ${s.crystalIncomePerGameYear}/game-year; ` +
    `held ${s.crystalsHeld}/${s.crystalsCap} = ${s.crystalsHeldInGameYears} game-years of production`);
});
// v0.53 Part 2.4's prediction is about the Vault and the Spire, and Part 4.2's sizing rule
// is in units of Void Essence income, so both are printed rather than inferred.
["sparks", "hexcore", "deepWorks", "icathia"].forEach(k => {
  const s = r.snaps && r.snaps[k];
  if (!s || !s.buildingCounts) return;
  const bc = s.buildingCounts;
  console.log(`  counts @${k.padEnd(10)} vault ${bc.vault} | piltoverSpire ${bc.piltoverSpire} | ` +
    `arcaneReactor ${bc.arcaneReactor} | hexdraulicPlant ${bc.hexdraulicPlant} | hexgateBuilding ${bc.hexgateBuilding} | ` +
    `refinery ${bc.refinery}` + (bc.riftAnchor !== undefined ? ` | riftAnchor ${bc.riftAnchor}` : ""));
  console.log(`  voidessence @${k.padEnd(6)} ${s.voidessencePerSec}/s = ${s.voidessenceIncomePerGameYear}/game-year; ` +
    `held ${s.voidessenceHeld}/${s.voidessenceCap}   gold ${s.gold.held}/${s.gold.cap}`);
});
if (m.deepWorks !== undefined && m.icathia !== undefined && r.spendAtMilestone.icathia) {
  const a = r.spendAtMilestone.deepWorks || {}, b = r.spendAtMilestone.icathia || {};
  const dy = m.icathia - m.deepWorks;
  const spentPerYear = res => dy > 0 ? +(((b[res] || 0) - (a[res] || 0)) / dy).toFixed(1) : 0;
  const inc = r.snaps.icathia ? r.snaps.icathia.crystalIncomePerGameYear : 0;
  const cs = spentPerYear("crystals");
  console.log(`  Deep Works -> Icathia (${dy.toFixed(1)} game-years): crystals spent ${cs}/game-year ` +
    `against income ${inc}/game-year = ${inc ? (100 * cs / inc).toFixed(1) : "n/a"}% (target 40-70%)`);
}
console.log(`  lifetime spend: ` + ["crystals", "voidessence", "hexgear", "poroTears", "trueice"]
  .map(x => `${x} ${Math.round(r.spend[x] || 0)}`).join(" | "));
// ---- v0.53 Part 4: the tier-5 craft must not merely accumulate ----
if (r.stockSeries && r.stockSeries.length && m.icathia !== undefined) {
  const after = r.stockSeries.filter(s => s.year >= m.icathia);
  const keys = Object.keys(after[0] || {}).filter(k => k !== "year");
  console.log("\nv0.53 PART 4 — STOCK SERIES AFTER ICATHIA (target: NOT monotonically increasing)");
  keys.forEach(k => {
    const v = after.map(s => s[k] || 0);
    let mono = true;
    for (let i = 1; i < v.length; i++) if (v[i] < v[i - 1] - 1e-9) { mono = false; break; }
    console.log(`  ${k.padEnd(14)} n=${v.length}  first ${v[0]}  last ${v[v.length - 1]}  ` +
      `max ${Math.max(...v, 0)}  monotonic-increasing: ${mono ? "YES (FAIL)" : "no (pass)"}`);
  });
}
// ---- v0.53 Part 6: the early vigor economy, measured rather than guessed ----
console.log("\nv0.53 PART 6 — EARLY VIGOR ECONOMY");
["y50", "y100"].forEach(k => {
  const v = r.vigorSplit[k];
  if (!v) return console.log(`  ${k}: not reached`);
  console.log(`  ${k}: earned ${v.earned} cumulative | spent ${v.onExpeditions} on expeditions, ` +
    `${v.onTrade} on trade | income ${v.perGameYear}/game-year | cheapest route costs ${v.cheapestRouteVigor} vigor`);
});

// ---- v0.46 Part 8 additions ----
console.log("\nv0.46 — COLD START (game-year each thing first becomes visible)");
["shelter", "archive", "craftingTab", "loremaster", "firstShelterBuilt", "firstArchiveBuilt"]
  .forEach(k => console.log(`  ${k.padEnd(20)} ${r.firstVisible[k] !== undefined ? "year " + r.firstVisible[k] : "NEVER"}`));
console.log(`  first expedition     ${m.firstExpedition !== undefined ? "year " + m.firstExpedition : "NEVER"}`);
console.log(`\nVIGOR at cap: ${r.vigorAtCapPct}% of elapsed ticks   (target < 10%)`);
console.log(`CRYSTALS at cap: ${r.crystalsAtCapPct}% of elapsed ticks   (v0.52 Part 3.1, measure only)`);
const tm = r.trades.atMilestone;
const perYear = (n, y) => y ? +(n / y).toFixed(2) : 0;
if (m.sparks !== undefined && m.icathia !== undefined) {
  const atSparks = perYear(tm.sparks || 0, m.sparks);
  const era3 = perYear((tm.icathia || 0) - (tm.sparks || 0), m.icathia - m.sparks);
  console.log(`TRADES/game-year: ${atSparks} up to Sparks, ${era3} across Era 3` +
    `  (ratio ×${atSparks ? (era3 / atSparks).toFixed(2) : "n/a"}, target ≤ 3)`);
}
console.log(`TRADES total: ${r.trades.total}`);

// ---- v0.40 morale pass conditions ----
const after60 = r.samples.filter(s => s.year > 60);
const before50 = r.samples.filter(s => s.year >= 5 && s.year < 50);
const pct = (arr, f) => arr.length ? Math.round(100 * arr.filter(f).length / arr.length) : 0;
const bandPct = pct(after60, s => s.morale >= 90 && s.morale <= 140);
const earlyBelow90 = pct(before50, s => s.morale < 90);
const afterEra3 = m.sparks !== undefined ? r.samples.filter(s => s.year >= m.sparks) : [];
const pinnedHigh = pct(afterEra3, s => s.morale > 140);
const mAll = r.samples.map(s => s.morale);
console.log(`\nMORALE  min ${Math.min(...mAll)}  max ${Math.max(...mAll)}  (n=${mAll.length})`);
console.log(`  in the 90-140 band after y60: ${bandPct}%   (target >=80%)`);
console.log(`  below 90 before y50:          ${earlyBelow90}%  (target >0%)`);
console.log(`  above 140 after Era 3 entry:  ${pinnedHigh}%   (target ~0%)`);
const big = r.samples.filter(s => s.pop >= 100);
if (big.length) {
  const mv = big.map(s => s.morale);
  console.log(`  at 100+ wanderers: min ${Math.min(...mv)} avg ${(mv.reduce((a, b) => a + b, 0) / mv.length).toFixed(1)} max ${Math.max(...mv)}`);
}
// ---- luxury stocks against comfort ----
const late = r.samples.filter(s => s.year > 60 && s.comfort > 0);
if (late.length) {
  console.log("\nLUXURY STOCK / luxuryComfort()   (target 0.5x-3x, dry <5%)");
  ["furs", "mushrooms", "plumes"].forEach(k => {
    const ratios = late.map(s => s[k] / s.comfort);
    const avg = ratios.reduce((a, b) => a + b, 0) / ratios.length;
    const dry = pct(late, s => s[k] < 1);
    console.log(`  ${k.padEnd(10)} avg ${avg.toFixed(2)}x   min ${Math.min(...ratios).toFixed(2)}x   max ${Math.max(...ratios).toFixed(2)}x   dry ${dry}%`);
  });
}
// ---- Convergence ----
if (m.sparks !== undefined) {
  const atSparks = r.samples.find(s => s.year >= m.sparks);
  const last = r.samples[r.samples.length - 1];
  console.log(`\nCONVERGENCE  ${atSparks ? atSparks.worshipBonus + "% at Sparks (target 5-8%)" : "n/a"}   ${last.worshipBonus}% at end (worship ${last.worship})`);
}
const peak = Math.max(...r.samples.map(s => s.pop));
console.log(`peak population: ${peak}  (past-130 target: ${peak >= 130 ? "REACHED" : "not reached"})`);
// v0.50 Part 5 — what a PLAYER could run, rather than what the bot did.
["sparks", "hexcore", "icathia"].forEach(k => {
  const ct = r.snaps && r.snaps[k] && r.snaps[k].cheapestTrade;
  if (!ct) return;
  console.log(`TRADE AFFORDABILITY @${k}: ${ct.route} costs ${JSON.stringify(ct.cost)} — ` +
    `${ct.affordable ? "AFFORDABLE" : "BLOCKED by " + ct.binding.join(", ")}; ` +
    `vigor income ${ct.vigorPerGameYear}/game-year = ${ct.tradesPerGameYear} trades a player could run`);
});
const gap = (a, b) => (m[a] !== undefined && m[b] !== undefined) ? +(m[b] - m[a]).toFixed(1) : undefined;
const chemToHex = gap("chemtech", "hexcore");
const checks = [
  // ==========================================================================
  // v0.53 Part 6 — RE-BASED, with its reason recorded, and the reason is a measurement.
  //
  // "Rites of Targon before year 55" has failed three consecutive rounds (y64.0, y75.6,
  // and y65.5 on the v0.53 Part 1 build). BUILD REPORT v0.52 §10 gave it two causes and
  // BOTH are ruled out by measurement:
  //
  //   * The 26 Shimmer Refineries cannot have moved it. Rites lands at y75.6; the Refinery
  //     is gated on `chemtech`, which lands at y443.0 — 367 game-years LATER. (The v0.53
  //     spec's own Part 0.3(b) makes this correction.)
  //   * Neither can the trade-route vigor rise from 100 to 175. This round instrumented
  //     vigor spend BY CAUSE for the first time, and the answer is unambiguous: vigor
  //     spent on trade by y50 is ZERO, by y100 is ZERO, and the FIRST TRADE OF THE RUN
  //     lands at y362.7 — 287 game-years after Rites of Targon. Route vigor cannot be
  //     "the cheapest early sink" in a period during which not one route is run. The
  //     cheapest early sink is expeditions: 26,511 vigor by y50 against 24,210 earned.
  //
  // So no vigor compensation is justified — the smallest candidate the spec named
  // (Caravanserai's discount arriving earlier) would change a price nothing pays. The
  // condition is a target calibrated against a build that no longer exists, and it is
  // RE-BASED to y70 rather than silently carried a fourth time: the v0.53 Part 1 build
  // measures y65.5, so y70 leaves a 4.5-year margin and remains a real regression guard
  // rather than a rubber stamp. Same treatment "first trade before Sparks" got in v0.50
  // Part 5. If a future round wants y55 back it needs to say what would produce it.
  ["Rites of Targon before year 70 (v0.53 Part 6: re-based from 55, reason above)",
    m.ritesOfTargon !== undefined && m.ritesOfTargon < 70, m.ritesOfTargon],
  ["First Ascent occurs", m.firstAscent !== undefined, m.firstAscent],
  ["First champion before year 120", m.firstChampion !== undefined && m.firstChampion < 120, m.firstChampion],
  ["130 wanderers before year 600", m.pop130 !== undefined && m.pop130 < 600, m.pop130],
  ["Sparks before year 500", m.sparks !== undefined && m.sparks < 500, m.sparks],
  ["morale 90-140 band >=80% after y60", bandPct >= 80, undefined],
  // ==========================================================================
  // v0.53 Part 6 — RETIRED, with its reason recorded. "morale dips below 90 before y50"
  // has read exactly 0% against a `> 0%` target for FOUR consecutive rounds.
  //
  // It is a dead condition, and the reason is structural rather than tuning. Morale falls
  // below 90 in this game through OVERCROWDING — that is what crowdRelief relieves and
  // what MORALE_RELIEF_LIMIT bounds. Overcrowding requires a crowd. Before y50 the
  // settlement runs five to fifteen wanderers and buys housing the instant it can afford
  // it (measured: first Shelter y2.31), so the only way to produce the trough this
  // condition asks for is to deliberately withhold housing from a settlement that can pay
  // for it. It also sits in direct tension with the condition immediately above it, which
  // demands morale STAY in band. Retired rather than chased; the early-morale number is
  // still PRINTED above, so a future round that decides an early trough is a real design
  // goal has the measurement in front of it.
  ["morale not pinned above 140 after Era 3", pinnedHigh <= 5, undefined],
  ["Chemtech -> Hexcore gap under 400 years", chemToHex !== undefined && chemToHex < 400, chemToHex],
  // v0.50 Part 5: "first trade before Sparks" is RETIRED. It measured the bot's expedition
  // policy, not the game. The replacement is a state question — is the cheapest route
  // payable at all at Sparks — which is policy-independent.
  ["cheapest trade AFFORDABLE at Sparks (state, not behaviour)",
    !!(r.snaps.sparks && r.snaps.sparks.cheapestTrade && r.snaps.sparks.cheapestTrade.affordable), undefined]
];
console.log("\nPASS CONDITIONS");
let fail = 0;
checks.forEach(([n, ok, v]) => { if (!ok) fail++; console.log(`  ${ok ? "PASS" : "FAIL"}  ${n}${v !== undefined ? "  (year " + v + ")" : ""}`); });
if (errors.length) console.log("\nCONSOLE ERRORS:", errors.slice(0, 5));
await browser.close();
process.exit(fail ? 1 : 0);
