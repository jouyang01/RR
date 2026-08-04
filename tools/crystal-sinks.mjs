// Part 3.1 support: every crystal SINK in the game, and the total a player can ever spend.
import { chromium } from "playwright";
const b = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium" }).catch(() => chromium.launch());
const p = await b.newPage(); await p.goto(new URL("../index.html", import.meta.url).href); await p.waitForTimeout(400);
const o = await p.evaluate(() => {
  const rows = [];
  BUILDINGS.forEach(x => { if (x.cost.crystals) rows.push({ kind: "building", id: x.id, amt: x.cost.crystals, ratio: x.ratio }); });
  UPGRADES.forEach(x => { if (x.cost.crystals) rows.push({ kind: "discovery", id: x.id, amt: x.cost.crystals }); });
  TECHS.forEach(x => { if (x.cost.crystals) rows.push({ kind: "tech", id: x.id, amt: x.cost.crystals }); });
  CRAFTS.forEach(x => { if (x.cost.crystals) rows.push({ kind: "craft", id: x.id, amt: x.cost.crystals }); });
  (typeof WTECHS !== "undefined" ? WTECHS : []).forEach(x => { if (x.cost && x.cost.crystals) rows.push({ kind: "worship", id: x.id, amt: x.cost.crystals }); });
  const oneOff = rows.filter(r => r.kind !== "building" && r.kind !== "craft").reduce((t, r) => t + r.amt, 0);
  return { rows, oneOff, cap: computeCaps().crystals };
});
for (const r of o.rows) console.log(String(r.amt).padStart(5), r.kind.padEnd(10), r.id, r.ratio ? "(ratio " + r.ratio + ", repeatable)" : "");
console.log("\nTOTAL one-off crystal spend across the whole game:", o.oneOff);
await b.close();
