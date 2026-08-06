import { openGame, runSim } from "./simcore.mjs";
const years = +(process.argv[process.argv.indexOf("--years") + 1] ?? 120);
const fileArg = process.argv[process.argv.indexOf("--file") + 1];
const { browser, page, errors } = await openGame(process.argv.includes("--file") ? fileArg : undefined);
console.log(`objectives: simulating ${years} game-years...`);
const r = await runSim(page, years, 1);
const violations = r.samples.filter(s => s.year > 1 && s.total < 2);
console.log("\n year | buyable | visible | total");
r.samples.filter((_, i) => i % 8 === 0).forEach(s =>
  console.log(String(s.year).padStart(5) + " |" + String(s.buyable).padStart(8) + " |" + String(s.visible).padStart(8) + " |" + String(s.total).padStart(6)));
const minAfterY1 = Math.min(...r.samples.filter(s => s.year > 1).map(s => s.total));
console.log(`\nminimum objectives after year 1: ${minAfterY1}`);
console.log(violations.length ? `VIOLATION at ${violations.length} sample(s): ${violations.map(v => "y" + v.year).join(", ")}` : "no violation past year 1");
if (errors.length) console.log("CONSOLE ERRORS:", errors.slice(0, 5));
await browser.close();
process.exit(violations.length ? 1 : 0);
