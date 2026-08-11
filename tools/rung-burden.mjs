// v0.63 Part 1 support: the per-rung discovery-knowledge burden, read from the MUTATED
// UPGRADES array (after applyDiscoveryKnowledge() has run) — a literal grep does not see it.
import { chromium } from "playwright";
const b = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium" }).catch(() => chromium.launch());
const p = await b.newPage(); await p.goto(new URL("../index.html", import.meta.url).href); await p.waitForTimeout(400);
const o = await p.evaluate(() => {
  const techK = {};
  TECHS.forEach(t => { techK[t.id] = (t.cost && t.cost.knowledge) || 0; });
  const perRung = {};
  let totalDisc = 0, carrying = 0;
  UPGRADES.forEach(u => {
    const k = u.cost && u.cost.knowledge;
    if (!k) return;
    carrying++; totalDisc += k;
    (perRung[u.tech] = perRung[u.tech] || { K: techK[u.tech] || 0, sum: 0, members: [] });
    perRung[u.tech].sum += k;
    perRung[u.tech].members.push({ id: u.id, k });
  });
  const totalTech = TECHS.reduce((t, x) => t + ((x.cost && x.cost.knowledge) || 0), 0);
  const rows = Object.keys(perRung).map(t => ({
    tech: t, K: perRung[t].K, sum: perRung[t].sum,
    ratio: perRung[t].K ? perRung[t].sum / perRung[t].K : null,
    members: perRung[t].members
  })).sort((a, b) => (b.ratio || 0) - (a.ratio || 0));
  const perUpgrade = [];
  UPGRADES.forEach(u => {
    const k = u.cost && u.cost.knowledge; if (!k) return;
    const K = techK[u.tech] || 0; if (K) perUpgrade.push(k / K);
  });
  perUpgrade.sort((a, b) => a - b);
  const med = a => a.length ? (a.length % 2 ? a[(a.length - 1) / 2] : (a[a.length / 2 - 1] + a[a.length / 2]) / 2) : 0;
  const ratios = rows.filter(r => r.ratio !== null).map(r => r.ratio).sort((a, b) => a - b);
  return {
    carrying, totalUpgrades: UPGRADES.length, totalDisc, totalTech,
    wholeGame: totalDisc / totalTech,
    perUpgradeMedian: med(perUpgrade), perRungMedian: med(ratios), rows
  };
});
console.log("discoveries carrying knowledge:", o.carrying, "of", o.totalUpgrades);
console.log("total discovery knowledge:", o.totalDisc, " total tech knowledge:", o.totalTech);
console.log("whole-game ratio:", o.wholeGame.toFixed(4), "(Kittens: 0.50)");
console.log("per-upgrade ratio median:", o.perUpgradeMedian.toFixed(3), "(Kittens: 0.90)");
console.log("per-rung ratio median:", o.perRungMedian.toFixed(3), "(Kittens: 2.43)");
console.log("\ntech".padEnd(24), "rung".padStart(8), "discK".padStart(9), "xrung".padStart(7));
for (const r of o.rows) {
  console.log(r.tech.padEnd(24), String(r.K).padStart(8), String(r.sum).padStart(9),
    (r.ratio === null ? "--" : r.ratio.toFixed(2) + "x").padStart(7),
    r.ratio > 2.43 ? "  <-- OVER 2.43" : "");
  if (process.argv.includes("--members")) for (const m of r.members) console.log("     ", m.id.padEnd(24), m.k);
}
const over = o.rows.filter(r => r.ratio > 2.43);
console.log("\nrungs over 2.43x:", over.length, "carrying", over.reduce((t, r) => t + r.sum, 0), "knowledge");
await b.close();
