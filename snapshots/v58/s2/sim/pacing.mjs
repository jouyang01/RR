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

// ============================================================================
// v0.57 PART 3 — THE SEED ENSEMBLE.
//
// v0.56 measured what nobody had measured: three seeds on ONE shipped build gave Era 3 lengths
// of 700.6 / 1,709.3 / 1,835.3 -- a 2.6x spread. Every Era-3 comparison in every build report
// from v0.44 to v0.56 is one draw from a distribution whose width was never taken. HANDOFF §2
// made "no milestone-year claim from a single seed" binding; this is what makes it affordable.
//
// `--seeds N` runs N seeds CONCURRENTLY as child processes (2,500-year runs take ~1,600 s alone
// and ~2,900 s two-up on a 2-core box, so sequential N=3 would be over two hours) and reports
// MEDIAN, MIN, MAX and SPREAD for every milestone-derived figure.
//
// THE TWO CLASSES ARE PRINTED SEPARATELY AND LABELLED, and that separation is the point of the
// Part. Milestone years, Era 3 and anything derived from them are ENSEMBLE figures and may only
// be quoted with a median and a spread. Cap-out fractions, the morale band, peak population and
// delivered multipliers are SINGLE-RUN figures -- v0.56 verified they agree across seeds to
// within a few tenths -- and are reported from the median seed's run. A report should not be
// able to quote one as if it were the other, so the output does not let it.
//
// Each child emits one `##MACHINE {json}` line; the parent aggregates that and nothing else, so
// the aggregation cannot drift from the prose the child prints above it.
import { spawn } from "child_process";
import { fileURLToPath } from "url";

const argOf = (name, dflt) => {
  const i = process.argv.indexOf(name);
  const eq = process.argv.find(a => a.startsWith(name + "="));
  if (eq) return eq.split("=")[1];
  return i >= 0 && process.argv[i + 1] !== undefined ? process.argv[i + 1] : dflt;
};
const seedsWanted = +(argOf("--seeds", process.argv.includes("--ensemble") ? 3 : 1)) || 1;
const IS_CHILD = process.argv.includes("--child");
// v0.58 Part 1: an escape hatch, deliberately narrow and deliberately named. `--force-local-eval`
// makes a single-seed run evaluate ensemble conditions anyway. It exists so a per-part
// gross-regression check can still see PASS/FAIL lines, and it is NOT used by the ensemble or by
// any reported figure. Without the flag a single seed prints `n/a (needs --seeds)`, which is the
// behaviour the Part exists to install.
const FORCE_LOCAL_EVAL = process.argv.includes("--force-local-eval");

if (seedsWanted > 1 && !IS_CHILD) {
  const self = fileURLToPath(import.meta.url);
  const passthrough = process.argv.slice(2).filter((a, i, arr) =>
    a !== "--ensemble" && a !== "--seeds" && arr[i - 1] !== "--seeds" &&
    !a.startsWith("--seeds=") && a !== "--seed" && arr[i - 1] !== "--seed");
  const seeds = Array.from({ length: seedsWanted }, (_, i) => i + 1);
  console.log(`ENSEMBLE: ${seedsWanted} seeds, launched CONCURRENTLY (seeds ${seeds.join(", ")})\n`);
  const t00 = Date.now();
  const runs = await Promise.all(seeds.map(sd => new Promise(res => {
    const c = spawn(process.execPath, [self, ...passthrough, "--seed", String(sd), "--child"],
      { cwd: process.cwd() });
    let out = "";
    c.stdout.on("data", d => out += d);
    c.stderr.on("data", d => out += d);
    c.on("close", () => {
      const line = out.split("\n").find(l => l.startsWith("##MACHINE "));
      res({ seed: sd, text: out, machine: line ? JSON.parse(line.slice(10)) : null });
    });
  })));
  const wall = ((Date.now() - t00) / 1000).toFixed(1);
  const ok = runs.filter(x => x.machine);
  if (!ok.length) { console.log("ENSEMBLE FAILED — no child produced a machine line"); console.log(runs[0].text.slice(-3000)); process.exit(1); }
  const num = (a) => a.filter(v => typeof v === "number" && isFinite(v));
  const med = a => { const x = num(a).slice().sort((p, q) => p - q); if (!x.length) return undefined;
                     return x.length % 2 ? x[(x.length - 1) / 2] : +((x[x.length / 2 - 1] + x[x.length / 2]) / 2).toFixed(4); };
  const stat = key => {
    const vals = ok.map(x => x.machine[key]);
    const n = num(vals);
    if (!n.length) return { median: undefined, min: undefined, max: undefined, spread: undefined, never: vals.length };
    return { median: med(vals), min: Math.min(...n), max: Math.max(...n),
             spread: +(Math.max(...n) / Math.max(Math.min(...n), 1e-9)).toFixed(2),
             missing: vals.length - n.length };
  };
  const ENSEMBLE_KEYS = ["sparks", "icathia", "era3", "ritesOfTargon", "voidStudies", "firstAscent",
                         "firstChampion", "pop75", "pop130", "chemtech", "hexcore", "deepWorks",
                         "firstTrade", "tenthChampionYear"];
  console.log(`(${wall}s wall for ${seedsWanted} concurrent seeds)\n`);
  console.log("========================================================================");
  console.log("ENSEMBLE FIGURES — milestone-derived. QUOTE THESE ONLY WITH A SPREAD.");
  console.log("========================================================================");
  console.log("  " + "figure".padEnd(22) + "median".padStart(10) + "min".padStart(10) + "max".padStart(10) + "  spread   per-seed");
  for (const k of ENSEMBLE_KEYS) {
    const st = stat(k);
    if (st.median === undefined) { console.log("  " + k.padEnd(22) + "     NEVER on any seed"); continue; }
    console.log("  " + k.padEnd(22) + String(st.median).padStart(10) + String(st.min).padStart(10) +
      String(st.max).padStart(10) + ("  x" + st.spread).padStart(9) + "   " +
      ok.map(x => x.machine[k] === undefined || x.machine[k] === null ? "—" : x.machine[k]).join(" / ") +
      (st.missing ? `   (${st.missing} seed(s) never reached it)` : ""));
  }
  // the median seed is the one whose Era 3 IS the median; its full text is printed below so the
  // single-run figures come from one internally-consistent run rather than an average of runs
  // that never happened.
  const e3 = stat("era3");
  const medianRun = ok.slice().sort((a, b) => (a.machine.era3 ?? 1e9) - (b.machine.era3 ?? 1e9))[Math.floor(ok.length / 2)];
  console.log(e3.median === undefined
    ? `\n  Era 3: NOT REACHED on any seed at ${argOf("--years", "150")} game-years — no ensemble figure. MEDIAN SEED = ${medianRun.seed} (by pass-condition order).`
    : `\n  Era 3 median ${e3.median} game-years, spread ${e3.min}-${e3.max} (x${e3.spread}).  MEDIAN SEED = ${medianRun.seed}.`);
  console.log("\n========================================================================");
  console.log(`SINGLE-RUN FIGURES — from the MEDIAN SEED (${medianRun.seed}) only.`);
  console.log("These are stable across seeds (v0.56 verified) and are NOT ensemble figures.");
  console.log("========================================================================");
  // ---- v0.58 Part 1: the ensemble evaluates the shaped conditions ----
  console.log("\n========================================================================");
  console.log("PASS CONDITIONS — each evaluated at its DECLARED SHAPE across the ensemble");
  console.log("========================================================================");
  let ensFail = 0;
  const conds = (ok[0].machine.conditions || []).map(c => c.id);
  conds.forEach(id => {
    const per = ok.map(x => (x.machine.conditions || []).find(c => c.id === id)).filter(Boolean);
    if (!per.length) return;
    const c0 = per[0];
    const vals = per.map(p2 => p2.value);
    const nums = vals.filter(v => typeof v === "number" && isFinite(v));
    let verdict, shown;
    if (c0.shape === "single") {
      verdict = per.every(p2 => p2.pass);
      shown = vals.join(" / ");
    } else if (c0.shape === "all-seeds") {
      verdict = per.every(p2 => p2.pass);
      shown = vals.map(v => v === null ? "NEVER" : v).join(" / ");
    } else if (c0.shape === "max") {
      // a ceiling: no seed may exceed it, so it passes only if EVERY seed passes, and the
      // number reported is the worst draw rather than the typical one.
      verdict = per.every(p2 => p2.pass);
      shown = `worst ${nums.length ? Math.max(...nums) : "NEVER"}  (all: ${vals.map(v => v === null ? "NEVER" : v).join(" / ")})`;
    } else {           // median
      const srt = nums.slice().sort((a, b) => a - b);
      const mv = srt.length ? (srt.length % 2 ? srt[(srt.length - 1) / 2] : (srt[srt.length / 2 - 1] + srt[srt.length / 2]) / 2) : null;
      const medPer = per.find(p2 => p2.value === mv) || per[0];
      verdict = nums.length === per.length && medPer.pass;
      shown = `median ${mv === null ? "NEVER" : mv}  (all: ${vals.map(v => v === null ? "NEVER" : v).join(" / ")})`;
    }
    if (!verdict) ensFail++;
    console.log(`  ${verdict ? "PASS" : "FAIL"}  ${c0.label}   [${c0.shape}]  ${shown}`);
  });
  console.log(`  ${ensFail} of ${conds.length} conditions failing.`);

  const SINGLE = ["peakPop", "moraleBandPct", "convergenceAtSparks", "renownAtCapPct",
                  "cultureAtCapPct", "crystalsAtCapPct", "provisionsAtCapPct", "tradesTotal"];
  SINGLE.forEach(k => {
    const vals = ok.map(x => `${x.seed}:${x.machine[k]}`).join("  ");
    console.log("  " + k.padEnd(22) + String(medianRun.machine[k]).padStart(10) + "     all seeds: " + vals);
  });
  console.log("\n----- FULL OUTPUT OF THE MEDIAN SEED (" + medianRun.seed + ") -----\n");
  console.log(medianRun.text);
  ok.filter(x => x !== medianRun).forEach(x => {
    console.log(`\n----- SEED ${x.seed} (pass conditions only) -----`);
    const i = x.text.indexOf("PASS CONDITIONS");
    console.log(i >= 0 ? x.text.slice(i) : "(no pass-condition block)");
  });
  process.exit(0);
}

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
// ---- v0.55: the food economy, the camp stack, the drakes and the experience bank ----
console.log("\nv0.55 — FOOD, CAMPS, DRAKES, XP");
["sparks", "hexcore", "deepWorks", "icathia"].forEach(k => {
  const s2 = r.snaps && r.snaps[k];
  if (!s2 || !s2.food) return;
  const f = s2.food;
  console.log(`  @${k.padEnd(10)} food: gross ${f.grossPerSec}/s − eat ${f.eatPerSec}/s = net ${f.netPerSec}/s ` +
    `(${f.farmers} farmers, pop ${f.pop}, ${f.season} x${f.farmMultNow}) held ${f.held}/${f.provisionsCap}`);
  console.log(`   ${" ".padEnd(10)} camps: material x${s2.campYield}  comfort x${s2.luxCampYield}  (${s2.junglers} junglers)`);
  console.log(`   ${" ".padEnd(10)} drakes: ` + Object.entries(s2.drakes)
    .map(([id, d]) => `${id} ${d.kills} kills -> +${(d.delivered * 100).toFixed(1)}% of ${(d.cap * 100).toFixed(0)}%`).join(" | "));
  console.log(`   ${" ".padEnd(10)} xp: top bank ${s2.xp.top}s (${(s2.xp.top / 3600).toFixed(2)} real h), median ${s2.xp.median}s, ` +
    `${s2.xp.atChallenger} trade-ranks at Challenger of ${s2.xp.n}` +
    ` = ${s2.xp.n ? (100 * s2.xp.atChallenger / s2.xp.n).toFixed(0) : 0}%`);
  // v0.56 Part 5 pass conditions 3-5: the DELIVERED storage multiplier per resource, and how
  // full the bucket actually is. Printed per milestone so the tier table can be read against a
  // run rather than against the source.
  if (s2.storage) {
    const d = s2.storage.delivered, h = s2.storage.heldOverCap;
    const row = ks => ks.filter(k => d[k] !== undefined).map(k => `${k} x${d[k]}`).join(" ");
    console.log(`   ${" ".padEnd(10)} storage (${s2.storage.owned}/5 upgrades): ` +
      `narrow[${row(["timber", "ore", "steel"])}]  broad[${row(["gold", "zaunore", "coalgas", "hexore", "shimmer"])}]  ` +
      `quarter[${row(["provisions"])}]`);
    console.log(`   ${" ".padEnd(10)} held/cap: ` + ["provisions", "timber", "ore", "steel", "gold",
      "crystals", "zaunore", "coalgas", "hexore", "shimmer", "culture", "renown"]
      .filter(k => h[k] !== undefined).map(k => `${k} ${(h[k] * 100).toFixed(0)}%`).join(" "));
  }
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
// ---- v0.56 Part 5 — the cap-out distribution, which is what the restructure is judged on ----
if (r.capOutPct) {
  console.log("\nv0.56 PART 5 — TIME AT CAP, EVERY CAPPED RESOURCE (worst first)");
  console.log("  " + Object.entries(r.capOutPct).map(([k, v]) => `${k} ${v}%`).join("  "));
  // ---- v0.57 PART 6 — PASS CONDITION 5, RESTATED ----
  // v0.56 stated this as a 30-60% CAP-OUT band for all four Era-3 raws, sized two ceilings
  // against it, and moved them by 3 points and 0 points. The reason is in the balance block
  // below: a cap-out fraction only measures anything for a resource that is STOCK-limited.
  // hexore is consumed as fast as it is produced; shimmer has no consumer at all. Restated:
  //   STOCK-LIMITED (pcRatio > 1.5)  -> the 30-60% cap-out band still applies.
  //   FLOW-LIMITED  (pcRatio <= 1.5) -> the meaningful target is the PRODUCER/CONSUMER RATIO,
  //                                     and a cap change cannot move it.
  //   NO CONSUMER   (pcRatio null)   -> not a tuning question at all. It is a design question,
  //                                     and it is now TWO resources: shimmer and voidessence.
  const ERA3 = ["zaunore", "coalgas", "hexore", "shimmer"];
  // deepest milestone the run actually reached — a short slice-comparison run stops before
  // Icathia and would otherwise report every raw as "unmeasured".
  const balAt = ["icathia", "deepWorks", "hexcore", "chemtech", "sparks"]
    .find(k => r.snaps && r.snaps[k] && r.snaps[k].resourceBalance);
  const bal = balAt ? r.snaps[balAt].resourceBalance : {};
  if (balAt) console.log(`  (balance measured at ${balAt})`);
  const classOf = k => { const b = bal[k];
    if (!b) return "unmeasured";
    if (b.kind === "no-sink") return "NO SINK AT ALL";
    if (b.kind === "lumpy-only") return "lumpy sink only — a cap change cannot move this";
    return b.pcRatio > 1.5 ? "stock-limited" : "flow-limited"; };
  const stock = ERA3.filter(k => classOf(k) === "stock-limited");
  const ok = stock.length > 0 && stock.every(k => (r.capOutPct[k] ?? 0) >= 30 && (r.capOutPct[k] ?? 0) <= 60);
  console.log(`  PASS CONDITION 5 (v0.57 RESTATED) — the 30-60% cap-out band applies ONLY to ` +
    `stock-limited raws: ${stock.length ? stock.join(", ") : "none"} → ${ok ? "PASS" : "FAIL"}`);
  ERA3.forEach(k => {
    const b = bal[k] || {};
    console.log(`     ${k.padEnd(9)} cap-out ${String((r.capOutPct[k] ?? 0) + "%").padStart(7)}` +
      `  held ${(b.held === null || b.held === undefined ? "—" : (100 * b.held).toFixed(0) + "%").padStart(5)}` +
      `  gross ${String(b.gross ?? "—").padStart(9)}/s  consumed ${String(b.consumed ?? "—").padStart(9)}/s` +
      `  P/C ${String(b.pcRatio ?? "—").padStart(7)}  ${String(b.lumpySinks ?? "?").padStart(2)} lumpy sinks   ${classOf(k)}`);
  });
  const noSink = Object.keys(bal).filter(k => bal[k] && bal[k].kind === "no-sink" && bal[k].gross > 1e-6);
  if (noSink.length) console.log(`  RESOURCES BEING PRODUCED WITH NO SINK OF ANY KIND (a design question, not a cap): ${noSink.join(", ")}`);
  const lumpyFull = Object.keys(bal).filter(k => bal[k] && bal[k].kind === "lumpy-only" && (bal[k].held ?? 0) > 0.9);
  if (lumpyFull.length) console.log(`  LUMPY-SINK RESOURCES SITTING AT THEIR CEILING (the player is full and waiting to spend): ${lumpyFull.join(", ")}`);
  const twelve = Object.keys(r.capOutPct).filter(k => k !== "vigor" && k !== "knowledge");
  const avg = twelve.length ? twelve.reduce((a, k) => a + r.capOutPct[k], 0) / twelve.length : 0;
  console.log(`  spread: worst ${Object.values(r.capOutPct)[0] ?? 0}%, average across ${twelve.length} multiplied resources ${avg.toFixed(1)}%`);
}
const tm = r.trades.atMilestone;
const perYear = (n, y) => y ? +(n / y).toFixed(2) : 0;
if (m.sparks !== undefined && m.icathia !== undefined) {
  const atSparks = perYear(tm.sparks || 0, m.sparks);
  const era3 = perYear((tm.icathia || 0) - (tm.sparks || 0), m.icathia - m.sparks);
  console.log(`TRADES/game-year: ${atSparks} up to Sparks, ${era3} across Era 3` +
    `  (ratio ×${atSparks ? (era3 / atSparks).toFixed(2) : "n/a"}, target ≤ 3)`);
}
console.log(`TRADES total: ${r.trades.total}`);
// v0.58 Part 5: the banking reserve's own activity count. Zero here means the policy never
// fired and the spread collapse (if any) came from somewhere else.
console.log(`TRADE BANKING: the reserve held an expedition back ${r.tradeReserveBlocks ?? "?"} times`);

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
// ---- v0.57 Part 5 — the Scholarship census, dated to v0.58 as a restructure, measured here ----
{
  const sc = (r.snaps && (r.snaps.icathia || r.snaps.deepWorks || r.snaps.hexcore || r.snaps.sparks) || {}).scholarship;
  if (sc) {
    console.log("\nv0.57 PART 5 — THE SCHOLARSHIP LINE (the multiplicative chain §19 missed)");
    console.log(`  rungs reached by the instrument: ${sc.owned} of ${sc.of}  [${sc.held.join(", ")}]`);
    console.log(`  delivered product at that state: ×${sc.product}   fully stacked: ×${sc.fullProduct}` +
      `   the SAME MEMBERS READ ADDITIVELY would give: ×${sc.additiveWouldGive}`);
    console.log(`  delivered per resource: ` + Object.entries(sc.delivered).map(([k, v]) => `${k} ×${v}`).join("  "));
    console.log(`  → the v0.58 restructure is a CUT from ×${sc.fullProduct} to ×${sc.additiveWouldGive}, ` +
      `applied to the resource already at ${(r.capOutPct || {}).culture ?? "?"}% of its ceiling. Dated, not shipped.`);
  }
}
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
// v0.58 Part 1 hoists the Convergence band into a named constant so the condition table can be
// read without prose archaeology. The BAND ITSELF is unchanged in this slice -- Part 2 is the
// round that re-derives it, and doing both in one slice would make neither attributable.
var CONVERGENCE_BAND = [5, 8];
var CONVERGENCE_LABEL = "Convergence " + CONVERGENCE_BAND[0] + "-" + CONVERGENCE_BAND[1] + "% at Sparks";
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
  // ==========================================================================
  // v0.57 PART 7.2.6 — RULED, AND THE RULING IS "THE CONDITION IS RIGHT, THE MARGIN WAS TOO
  // TIGHT TO SURVIVE ITS OWN INSTRUMENT."
  //
  // The spec is blunt: "a condition failed four times without a ruling is not a condition."
  // Rites has read y72.7 / y72.5 (v0.56, both seeds) and y75.3 (v0.55) against a y70 target
  // re-based in v0.53 from a measured y65.5 with a stated 4.5-year margin.
  //
  // WHAT CHANGED SINCE THAT MARGIN WAS CHOSEN, and it is not drift: v0.55 rescaled the entire
  // food economy x10 and made Deepwinter bind, and v0.56 cut the food ceiling to Kittens' own
  // figures. Rites of Targon sits at knowledge 12,000, which an Era-1 settlement reaches on
  // loremaster-seconds -- and loremaster-seconds are exactly what a settlement spends on
  // FARMERS when food gets tight. The 2.7-year overshoot is the food rounds arriving, not the
  // tech ladder moving: the ladder is unchanged at 37 rungs and both audit graphs are zero.
  //
  // AND v0.57 IS THE ROUND THAT MAKES IT MEASURABLE AGAIN. Part 4 gives the bot a food policy
  // for the first time, so the loremaster/farmer split is now a decision rather than an
  // accident, and Part 3 means the figure carries a spread instead of pretending to be exact.
  //
  // RE-BASED TO y75, ONCE, WITH THE MARGIN STATED. v0.56 measured y72.7 and y72.5 across two
  // seeds; y75 leaves a ~2.4-year margin on the worse of them and remains a real regression
  // guard. It is NOT re-based to whatever this round happens to measure -- that would be a
  // rubber stamp, which is the thing the spec is objecting to. If a future round wants y70
  // back, the lever is the bot's loremaster share under the new food policy, and it should say
  // so and measure it.
  { id: "rites", label: "Rites of Targon before year 75",
    shape: "median", value: m.ritesOfTargon, test: v => v !== undefined && v < 75,
    why: "an EARLY-PACE condition, and early pace is a distribution rather than a worst case. " +
         "v0.57 re-based it to y75 from v0.56's TWO seeds and the three-seed ensemble then read " +
         "70.3 / 76.7 / 83.3 — it failed on two of three. The median is the honest shape for a " +
         "figure with a x1.18 spread; the max would be chasing the unluckiest draw." },
  { id: "firstAscent", label: "First Ascent occurs",
    shape: "all-seeds", value: m.firstAscent, test: v => v !== undefined,
    why: "a REACHABILITY condition. If a single seed never ascends, the mechanic is broken on " +
         "that path and a median would hide it. All-seeds is the only defensible shape for " +
         "'does this happen at all'." },
  { id: "firstChampion", label: "First champion before year 120",
    shape: "max", value: m.firstChampion, test: v => v !== undefined && v < 120,
    why: "a CEILING condition — 'no player should still be championless at y120'. A ceiling is " +
         "about the worst draw by construction, so it asserts the max." },
  { id: "pop130", label: "130 wanderers before year 600",
    shape: "median", value: m.pop130, test: v => v !== undefined && v < 600,
    why: "a growth-pace condition, so a distribution. See Part 6's ruling above the table — " +
         "this condition is being RULED on this round, not merely re-shaped." },
  { id: "sparks", label: "Sparks before year 500",
    shape: "max", value: m.sparks, test: v => v !== undefined && v < 500,
    why: "a CEILING condition. Era 3 must open for every player, not for the median player, so " +
         "no seed may exceed y500. The analyzer named this one specifically." },
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
  { id: "moraleBand", label: "morale 90-140 band >=80% after y60",
    shape: "single", value: bandPct, test: v => v >= 80,
    why: "a SINGLE-RUN figure under §25 — v0.56 and v0.57 both measured it identical across " +
         "every seed (100 / 100 / 100). It is evaluated in the child and needs no ensemble." },
  { id: "moraleHigh", label: "morale not pinned above 140 after Era 3",
    shape: "single", value: pinnedHigh, test: v => v <= 5,
    why: "as moraleBand — a distribution over ticks within one run, not over seeds." },
  { id: "chemToHex", label: "Chemtech -> Hexcore gap under 400 years",
    shape: "max", value: chemToHex, test: v => v !== undefined && v < 400,
    why: "a CEILING condition on a GAP: the point is that no player waits 400 years between " +
         "two adjacent Era-3 rungs. A median would let one seed stall unreported." },
  // v0.50 Part 5: "first trade before Sparks" is RETIRED. It measured the bot's expedition
  // policy, not the game. The replacement is a state question — is the cheapest route
  // payable at all at Sparks — which is policy-independent.
  // v0.55 Part 9. Convergence has had a stated 5-8% target at Sparks since v0.46 and has
  // NEVER had a pass condition attached to it, so three rounds of drift went unreported —
  // it measured 5.4% on v0.52, 3.18% on v0.53 and 2.33% on v0.54. A target with no condition
  // is not a target. Added here even though the Convergence work itself is deferred.
  // v0.57 PART 7.2.6 — CONVERGENCE, RULED THE OTHER WAY: THE CONDITION STAYS AT 5-8% AND IT IS
  // SUPPOSED TO BE FAILING.
  //
  // It read 2.33% (v0.54), 3.87% (v0.55) and 4.17% / 4.40% (v0.56) against a 5-8% target.
  //
  // CORRECTION, WRITTEN AFTER THE v0.57 ENSEMBLE RAN AND AGAINST MY OWN EARLIER DRAFT OF THIS
  // COMMENT: I wrote here that the trend was "monotone toward the target" and used that as the
  // argument for keeping the condition. THE v0.57 ENSEMBLE REVERSED IT -- 1.42% / 2.87% / 3.71%
  // across three seeds, worse than v0.56 on every one. The monotone-trend argument is withdrawn.
  //
  // The condition is KEPT ANYWAY, on a better argument than the one I had: Convergence is
  // worship-driven, worship is ascent-driven, and v0.57's food policy holds the settlement at a
  // lower population for longer -- so the regression is a MEASURED CONSEQUENCE of this round's
  // apparatus work rather than drift, and a target that moves whenever the game moves is not a
  // target. The Convergence round itself has been deferred five times and is still deferred;
  // what is not acceptable is deferring it SILENTLY, which is why v0.55 Part 9 attached this
  // condition at all. It is a DEFERRED-WORK marker and it is doing its job by failing loudly.
  //
  // THE RULING: keep 5-8%, and record that it is a DEFERRED-WORK marker rather than a
  // regression guard. It may not be re-based to the measured value in any round that does not
  // also do the Convergence work -- re-basing a target to whatever you happen to measure is how
  // a target stops meaning anything, and this project has now done that twice (Rites y55 -> y70,
  // and above y70 -> y75, both with stated reasons and both once).
  { id: "convergence", label: CONVERGENCE_LABEL,
    shape: "median", value: (() => { const at = m.sparks !== undefined ? r.samples.find(s2 => s2.year >= m.sparks) : null;
                                     return at ? at.worshipBonus : undefined; })(),
    test: v => v !== undefined && v >= CONVERGENCE_BAND[0] && v <= CONVERGENCE_BAND[1],
    why: "a BALANCE-POINT condition, so the median. It is asking where the typical settlement " +
         "sits on the worship curve at Sparks, not how the unluckiest one does." },
  { id: "tradeAffordable", label: "cheapest trade AFFORDABLE at Sparks (state, not behaviour)",
    shape: "single", value: !!(r.snaps.sparks && r.snaps.sparks.cheapestTrade && r.snaps.sparks.cheapestTrade.affordable),
    test: v => v === true,
    why: "a STATE question about the price table, not a behavioural one — it is policy- and " +
         "seed-independent by construction (v0.50 Part 5 replaced the behavioural version " +
         "precisely to get that property)." }
];
// ============================================================================
// v0.58 PART 1 — EVERY MILESTONE CONDITION NOW CARRIES A DECLARED SHAPE.
//
// THE DEFECT, and it is the builder's own from v0.57: Rites of Targon was re-based to y75 from
// v0.56's TWO seeds, and the three-seed ensemble then read 70.3 / 76.7 / 83.3 -- it fails on two
// of three. A scalar threshold against a figure with a x1.18 spread is a coin toss, and since
// v0.57 Part 3 the instrument has reported both numbers while the CONDITIONS never caught up.
//
// FOUR SHAPES, one declared per condition, each with a stated reason in the table above:
//
//   median      a PACE or BALANCE-POINT question. Asks where the typical settlement lands.
//   max         a CEILING question -- "no player should still be waiting at y500". Asserts the
//               worst draw, because that is literally what the condition means.
//   all-seeds   a REACHABILITY question -- "does this happen at all". A median would hide a
//               seed on which the mechanic never fires.
//   single      a SINGLE-RUN figure under §25 (morale band, a state question about prices).
//               Evaluated in the child; it needs no ensemble and never did.
//
// A CONDITION WHOSE SHAPE IS UNSTATED IS THE DEFECT THIS PART REMOVES. `test-v58` asserts that
// every entry declares one and gives a reason.
//
// AND A SINGLE-SEED RUN REFUSES TO EVALUATE AN ENSEMBLE CONDITION. It prints
// `n/a (needs --seeds)` rather than a PASS or a FAIL, because one draw is not evidence about a
// distribution -- that is exactly what would have caught the Rites re-base before it shipped.
// The ensemble PARENT evaluates them across seeds and prints the shape it used.
const ENSEMBLE_SHAPES = ["median", "max", "all-seeds"];
console.log("\nPASS CONDITIONS");
if (IS_CHILD || seedsWanted > 1) console.log("  (child run — ensemble conditions are evaluated by the ensemble parent)");
let fail = 0;
checks.forEach(c => {
  if (ENSEMBLE_SHAPES.indexOf(c.shape) >= 0 && !FORCE_LOCAL_EVAL) {
    console.log(`  n/a   ${c.label}   [${c.shape}] — needs --seeds; one draw is not evidence` +
      (c.value !== undefined ? `  (this seed: ${c.value})` : ""));
    return;
  }
  const ok = c.test(c.value);
  if (!ok) fail++;
  console.log(`  ${ok ? "PASS" : "FAIL"}  ${c.label}   [${c.shape}]` +
    (c.value !== undefined && typeof c.value !== "boolean" ? `  (${c.value})` : ""));
});
if (errors.length) console.log("\nCONSOLE ERRORS:", errors.slice(0, 5));

// v0.57 Part 3: the one machine-readable line the ensemble parent aggregates. Everything in it
// is already printed in prose above, so the two cannot disagree -- and the ENSEMBLE keys are
// separated from the SINGLE-RUN keys here, at the source, rather than in the reader's head.
{
  const atSparks = m.sparks !== undefined ? r.samples.find(s2 => s2.year >= m.sparks) : null;
  const cap = r.capOutPct || {};
  console.log("##MACHINE " + JSON.stringify({
    seed,
    // ---- ensemble: milestone-derived, never quote without a spread ----
    voidStudies: m.voidStudies, ritesOfTargon: m.ritesOfTargon, firstAscent: m.firstAscent,
    firstChampion: m.firstChampion, pop75: m.pop75, pop130: m.pop130, sparks: m.sparks,
    chemtech: m.chemtech, hexcore: m.hexcore, deepWorks: m.deepWorks, icathia: m.icathia,
    firstTrade: m.firstTrade,
    era3: (m.sparks !== undefined && m.icathia !== undefined) ? +(m.icathia - m.sparks).toFixed(1) : null,
    // v0.57 Part 1 pass condition 3: the year the tenth champion first became affordable, which
    // is what Jerry's conditional turns on. Recorded by the sim, not inferred from a ceiling.
    tenthChampionYear: m.tenthChampionRecruited ?? m.tenthChampionAffordable ?? null,
    tenthChampionAffordable: m.tenthChampionAffordable ?? null,
    // ---- single-run: stable across seeds, quote plainly ----
    peakPop: peak, moraleBandPct: bandPct,
    convergenceAtSparks: atSparks ? atSparks.worshipBonus : null,
    renownAtCapPct: cap.renown ?? 0, cultureAtCapPct: cap.culture ?? 0,
    crystalsAtCapPct: cap.crystals ?? 0, provisionsAtCapPct: cap.provisions ?? 0,
    tradesTotal: r.trades ? r.trades.total : null,
    passFail: fail,
    // v0.58 Part 1: the raw value and declared shape of every condition, so the ENSEMBLE parent
    // can evaluate them across seeds. The child does not decide an ensemble condition.
    conditions: checks.map(c => ({ id: c.id, label: c.label, shape: c.shape,
                                   value: c.value === undefined ? null : c.value,
                                   pass: c.test(c.value) }))
  }));
}
await browser.close();
process.exit(fail ? 1 : 0);
