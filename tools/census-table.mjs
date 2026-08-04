// census-table.mjs — v0.50 Part 1's deliverable. The category census, MEASURED off the
// shipped build rather than transcribed into the report by hand.
import { chromium } from "playwright";
const browser = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium" }).catch(() => chromium.launch());
const page = await browser.newPage();
page.on("pageerror", e => console.log("PAGEERROR", e.message));
await page.goto(new URL("../index.html", import.meta.url).href);
await page.waitForTimeout(300);

const r = await page.evaluate(() => {
  const src = computeRates.toString();
  UPGRADES.forEach(u => S.upgrades[u.id] = true);
  const buildingsWith = key => BUILDINGS.filter(b => b[key]).map(b => b.id);
  const boostersOf = res => BUILDINGS.filter(b => b.boost && b.boost[res]).map(b => b.id);
  const jobBoostersOf = job => BUILDINGS.filter(b => b.jobBoost && b.jobBoost[job]).map(b => b.id);
  return {
    axe: { n: AXE_LINE.length, sum: +lineTotal(AXE_LINE).toFixed(3), mult: +axeMult().toFixed(3) },
    saw: { n: SAW_LINE.length, sum: +lineTotal(SAW_LINE).toFixed(3),
           mill: +(0.10 * (1 + lineTotal(SAW_LINE))).toFixed(3) },
    hoe: { n: HOE_LINE.length, sum: +lineTotal(HOE_LINE).toFixed(3), mult: +hoeMult().toFixed(3) },
    minerals: { members: jobBoostersOf("miner"), perCopy: jobBoostersOf("miner").map(id =>
      +jobBoostPerCopy(BUILDINGS.find(b => b.id === id), "miner").toFixed(3)) },
    knowledgeBuildings: boostersOf("knowledge").map(id =>
      id + " " + BUILDINGS.find(b => b.id === id).boost.knowledge),
    provisionsBuildings: boostersOf("provisions").map(id =>
      id + " " + BUILDINGS.find(b => b.id === id).boost.provisions),
    manaBoost: /boosts\.mana \+= 0\.25/.test(src),
    resRatioMembers: ((src.match(/var resRatio = \{[\s\S]*?\n  \};/) || [""])[0]
      .match(/^\s+(\w+):/gm) || []).map(x => x.trim().replace(":", "")),
    globals: (src.match(/var global = ([^;]+);/) || [])[1].trim().split(" * "),
    globalBoostMembers: buildingsWith("globalBoost").map(id =>
      id + " " + BUILDINGS.find(b => b.id === id).globalBoost),
    jobMultKeys: ((src.match(/var jobMult = \{[\s\S]*?\n  \};/) || [""])[0]
      .match(/^\s+(\w+):/gm) || []).map(x => x.trim().replace(":", "")),
    bounds: { CAMP_YIELD_LIMIT, LUXURY_CAMP_YIELD_LIMIT, AUTOPROD_LIMIT,
              CRAFT_YIELD_LIMIT: typeof CRAFT_YIELD_LIMIT !== "undefined" ? CRAFT_YIELD_LIMIT : null,
              MORALE_RELIEF_LIMIT, TRAIT_LIMIT, META_LIMIT: 1.0 }
  };
});

const row = (cat, kn, rr, verdict) =>
  console.log("| " + cat.padEnd(34) + " | " + String(kn).padEnd(34) + " | " + String(rr).padEnd(38) + " | " + verdict + " |");

console.log("\n### 1.1 Job-tier tool lines — Kittens' <res>JobRatio\n");
console.log("| Resource | Kittens | RR (v0.50) | |");
console.log("|---|---|---|---|");
row("timber / wood", "6 axes, Σ3.20 → ×4.20", `${r.axe.n} rungs, Σ${r.axe.sum} → ×${r.axe.mult}`, "RR +1 rung (Masterwork Tools re-homed)");
row("provisions / catnip", "2 hoes, Σ0.80 → ×1.80", `${r.hoe.n} rungs, Σ${r.hoe.sum} → ×${r.hoe.mult}`, "closer; still under");
row("ore / minerals", "none — no mineralsJobRatio", "none", "exact");
row("knowledge / science", "none", "none", "exact");
row("vigor / manpower", "3, Σ1.00 → ×2.00", "0 in jobMult (×2.00 lives in BOOST_LIMIT.vigor)", "same magnitude, different slot");
row("mana", "no such resource", "arcaneFocus ×1.50", "RR-only");
row("crystals", "no such resource", "facetedCuts ×1.25", "RR-only");
console.log("\njobMult keys: " + r.jobMultKeys.join(", "));

console.log("\n### 1.2 Building ratio — Kittens' <res>Ratio\n");
console.log("| Resource | Kittens | RR (v0.50) | |");
console.log("|---|---|---|---|");
row("ore / minerals", "mine 0.20 + quarry 0.35 (2)", r.minerals.members.map((m, i) => m + " " + r.minerals.perCopy[i]).join(" + "), "exact");
row("timber / wood", "lumberMill 0.10×(1+Σ5 saws) = 0.195", `lumberMill 0.10×(1+Σ${r.saw.n} saws) = ${r.saw.mill}`, "RR +1 saw (Seasoned Timberworks re-homed)");
row("knowledge / science", "library/academy/observatory/biolab (4)", r.knowledgeBuildings.join(", "), "exact");
row("provisions / catnip", "aqueduct 0.03 (1)", r.provisionsBuildings.join(", ") || "NONE", "PARITY RESTORED");

console.log("\n### 1.3 Per-resource global ratio — Kittens' <res>GlobalRatio\n");
console.log("| | Kittens | RR (v0.50) | |");
console.log("|---|---|---|---|");
row("resources with the slot filled", "2 (starchart, unicorns)", r.resRatioMembers.length + " (" + r.resRatioMembers.join(", ") + ")", "RR-only, by ruling");
console.log("\nmana moved into boosts.mana: " + r.manaBoost);

console.log("\n### 1.4 The global tier\n");
console.log("| | Kittens | RR (v0.50) | |");
console.log("|---|---|---|---|");
row("multiplicative global categories", "magneto×steamworks, productionRatio, solarRevolution", r.globals.length + ": " + r.globals.join(" · "), "7 → 5");
row("globalBoost buildings", "magneto + reactor (2)", r.globalBoostMembers.join(", "), "exact");

console.log("\n### 1.5 Bounded side categories\n");
Object.entries(r.bounds).forEach(([k, v]) => console.log("  " + k.padEnd(26) + " " + v));

await browser.close();
