// effcost.mjs — v0.45 Part 7, the standing requirement.
// "Every Era-3 building cost must be reported in effective-raw terms — nominal divided
//  by the craft multiplier at its chain depth — alongside the nominal figure."
//
// craftYield() at CRAFT_YIELD_LIMIT 2.2 reaches x3.08 and COMPOUNDS per chain tier, so a
// two-tier craft is ~x9.5 against its raw inputs. Five rounds of this project tuned
// nominal numbers while the game ran on numbers up to 88x smaller. This ends that.
//
//   node effcost.mjs            # at the full craft line (the ceiling)
//   node effcost.mjs --bare     # with no craft upgrades owned (the floor)
import { chromium } from "playwright";

const bare = process.argv.includes("--bare");
const browser = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium" }).catch(() => chromium.launch());
const page = await browser.newPage();
await page.goto(new URL("../index.html", import.meta.url).href);
await page.waitForTimeout(300);

const out = await page.evaluate((bare) => {
  S.buildings = {}; S.upgrades = {}; S.techs = {}; S.champs = {}; S.leader = null; S.policies = {};
  TECHS.forEach(t => S.techs[t.id] = true);
  if (!bare) {
    UPGRADES.forEach(u => S.upgrades[u.id] = true);
    // craftYield() is fed by workshop count, so the "ceiling" needs a developed workshop.
    S.buildings.workshop = 40; S.buildings.watchersEye = 5;
  }

  // Depth 0 = a raw resource. Depth n = a craft whose inputs are at most depth n-1.
  const RAW = {};
  Object.keys(RES).forEach(r => RAW[r] = true);
  CRAFTS.forEach(c => delete RAW[c.out]);

  const craftById = {};
  CRAFTS.forEach(c => craftById[c.out] = c);

  // Effective raw cost of ONE unit of a material, following the craft chain down.
  // One craft ACTION spends the recipe and yields craftYield() UNITS, so the yield
  // DIVIDES the cost — this is handoff error #4, the single most consequential
  // misunderstanding in the project's history. Never quote a nominal recipe cost.
  const memoCost = {}, memoDepth = {};
  function rawCost(mat, seen) {
    if (RAW[mat]) return { [mat]: 1 };
    if (memoCost[mat]) return memoCost[mat];
    seen = seen || {};
    if (seen[mat]) return { [mat]: 1 };      // cycle guard
    seen[mat] = 1;
    const c = craftById[mat];
    if (!c) return { [mat]: 1 };
    const y = craftYield(mat) || 1;
    const acc = {};
    for (const i in c.cost) {
      const sub = rawCost(i, seen);
      for (const r in sub) acc[r] = (acc[r] || 0) + (sub[r] * c.cost[i]) / y;
    }
    return memoCost[mat] = acc;
  }
  function depth(mat, seen) {
    if (RAW[mat]) return 0;
    if (memoDepth[mat] !== undefined) return memoDepth[mat];
    seen = seen || {};
    if (seen[mat]) return 0;
    seen[mat] = 1;
    const c = craftById[mat];
    if (!c) return 0;
    let d = 0;
    for (const i in c.cost) d = Math.max(d, depth(i, seen) + 1);
    return memoDepth[mat] = d;
  }

  // Era 3 = anything gated on sparks or later.
  const ERA3 = new Set(["sparks", "chemtech", "hexcore", "deepWorks", "icathia", "hexdraulics",
    "sumpEcology", "progressDay", "chemBaronAccords", "gloriousEvolution", "atlasGauntlets",
    "hexgate", "greyReclamation", "voidglassOptics", "watchersBelow", "shimmerworks", "chronometry"]);

  const rows = BUILDINGS.filter(b => ERA3.has(b.tech)).map(b => {
    const nominal = {}, effective = {};
    let nomTotal = 0, effTotal = 0, maxDepth = 0;
    for (const r in b.cost) {
      nominal[r] = b.cost[r];
      nomTotal += b.cost[r];
      maxDepth = Math.max(maxDepth, depth(r));
      const sub = rawCost(r);
      for (const raw in sub) {
        effective[raw] = +((effective[raw] || 0) + sub[raw] * b.cost[r]).toFixed(2);
        effTotal += sub[raw] * b.cost[r];
      }
    }
    return {
      id: b.id, name: b.name, ratio: b.ratio, chainDepth: maxDepth,
      nominal, nominalUnits: +nomTotal.toFixed(1),
      effective, effectiveRawUnits: +effTotal.toFixed(1),
      discount: +(nomTotal / (effTotal || 1)).toFixed(3)
    };
  });

  const yields = {};
  CRAFTS.forEach(c => yields[c.out] = { yield: +craftYield(c.out).toFixed(4), depth: depth(c.out) });
  return { rows, yields, craftLimit: CRAFT_YIELD_LIMIT };
}, bare);

const pad = (s, n) => String(s).padEnd(n);
console.log(`\nv0.45 Part 7 — Era-3 building costs, nominal vs EFFECTIVE RAW`);
console.log(`(craft upgrades: ${bare ? "NONE owned — the floor" : "ALL owned — the ceiling"}; CRAFT_YIELD_LIMIT ${out.craftLimit})\n`);
console.log(pad("Building", 22) + pad("depth", 7) + pad("nominal units", 15) + pad("effective raw", 15) + "nominal/effective");
console.log("-".repeat(76));
out.rows.sort((a, b) => b.effectiveRawUnits - a.effectiveRawUnits).forEach(r => {
  console.log(pad(r.name, 22) + pad(r.chainDepth, 7) + pad(r.nominalUnits, 15) +
    pad(r.effectiveRawUnits, 15) + "×" + r.discount);
});
console.log("\nThe two the spec named:");
["hexdraulicPlant", "arcaneReactor", "hextechFoundry"].forEach(id => {
  const r = out.rows.find(x => x.id === id);
  if (!r) return console.log(`  ${id}: not an Era-3 building`);
  console.log(`  ${r.name}: nominal ${JSON.stringify(r.nominal)}`);
  console.log(`    -> effective raw ${JSON.stringify(r.effective)}  (${r.effectiveRawUnits} units, ×${r.discount} cheaper than nominal, chain depth ${r.chainDepth})`);
});
console.log("\nCraft yields and chain depths:");
Object.entries(out.yields).sort((a, b) => a[1].depth - b[1].depth)
  .forEach(([k, v]) => console.log(`  ${pad(k, 18)} depth ${v.depth}  yield ×${v.yield}`));
await browser.close();
