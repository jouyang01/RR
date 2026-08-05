import { openGame, runSim } from "./simcore.mjs";
const years = +(process.argv[process.argv.indexOf("--years") + 1] ?? 150);
const fileArg = process.argv[process.argv.indexOf("--file") + 1];
const { browser, page, errors } = await openGame(process.argv.includes("--file") ? fileArg : undefined);
console.log(`luxdiag: simulating ${years} game-years...`);
const r = await runSim(page, years, 1);
const post = r.samples.filter(s => s.year >= 10);
const stat = k => {
  const v = post.map(s => s[k]);
  return { avg: +(v.reduce((a, b) => a + b, 0) / v.length).toFixed(1), min: Math.min(...v), max: Math.max(...v),
           dryPct: +(100 * v.filter(x => x < 1).length / v.length).toFixed(1) };
};
console.log("\n(samples from year 10 on)");
["furs", "mushrooms", "plumes"].forEach(k => {
  const s = stat(k);
  console.log(`  ${k.padEnd(11)} avg ${String(s.avg).padStart(8)}   min ${String(s.min).padStart(7)}   max ${String(s.max).padStart(8)}   dry ${s.dryPct}%`);
});
const peakPop = Math.max(...r.samples.map(s => s.pop));
console.log(`\npeak population: ${peakPop}`);
// when does dryness actually happen? early bootstrap vs steady state
console.log("\ndry samples by era:");
[[10,30],[30,60],[60,999]].forEach(([a,b]) => {
  const w = r.samples.filter(s => s.year >= a && s.year < b);
  const d = k => (100 * w.filter(s => s[k] < 1).length / w.length).toFixed(1) + "%";
  console.log(`  years ${a}-${b === 999 ? "end" : b}:  furs ${d("furs")}  mushrooms ${d("mushrooms")}  plumes ${d("plumes")}`);
});
const steady = r.samples.filter(s => s.year >= 30);
const st = k => {
  const v = steady.map(s => s[k]);
  return { avg: v.reduce((a,b)=>a+b,0)/v.length, dry: 100 * v.filter(x=>x<1).length/v.length };
};
const all = ["furs","mushrooms","plumes"].map(st);
const ok = all.every(s => s.avg > 5 && s.dry < 2);
console.log("\nsteady state (year 30+): " + ["furs","mushrooms","plumes"].map((k,i)=>`${k} avg ${all[i].avg.toFixed(1)} dry ${all[i].dry.toFixed(1)}%`).join(" | "));
// real net flow = change in stock between samples (camp hauls are instant gains,
// so they never appear in computeRates)
const YEAR_S = 800;                       // 4000 ticks x 0.2s
const deltas = [];
for (let i = 1; i < steady.length; i++) deltas.push((steady[i].furs - steady[i - 1].furs) / (YEAR_S / 2));
const avgFlow = deltas.reduce((a, b) => a + b, 0) / deltas.length;
console.log(`furs net flow (year 30+): avg ${avgFlow >= 0 ? "+" : ""}${avgFlow.toFixed(4)}/s  (${deltas.filter(f => f >= 0).length}/${deltas.length} intervals non-negative)`);
console.log(`vigor: ${r.vigor.onLuxuryCamps} of ${r.vigor.earned} earned went to the four resource camps = ${Math.round(100 * r.vigor.onLuxuryCamps / r.vigor.earned)}% (spec target ~49%)`);

console.log("\ncamp rotation:");
const camps = ["wolves", "gromp", "raptors", "krugs"];
camps.forEach(c => console.log(`  ${c.padEnd(9)} ${r.campRuns[c] || 0} hunts`));
const allUsed = camps.every(c => (r.campRuns[c] || 0) > 0);
const spread = Math.max(...camps.map(c => r.campRuns[c] || 0)) / Math.max(1, Math.min(...camps.map(c => r.campRuns[c] || 0)));
console.log(`  all four used: ${allUsed}   busiest/quietest ratio: ${spread.toFixed(1)}x`);

const ok2 = ok && allUsed && avgFlow > -0.001;
console.log(ok2 ? "\nPASS: stocks healthy, net flow non-negative, all four camps in rotation" : "\nFAIL: see above");
if (errors.length) console.log("CONSOLE ERRORS:", errors.slice(0, 5));
await browser.close();
process.exit(ok ? 0 : 1);
