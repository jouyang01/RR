import { chromium } from "playwright";
const b = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium" }).catch(() => chromium.launch());
const p = await b.newPage();
p.on("pageerror", e => console.log("PAGEERROR", e.message));
await p.goto(new URL("../index.html", import.meta.url).href);
const r = await p.evaluate(() => ({
  audit: auditCostGraph(), raw: auditRawGraph(),
  globalBoosters: BUILDINGS.filter(x => x.globalBoost).map(x => x.id + " " + x.globalBoost + " @ratio " + x.ratio + " tech " + x.tech),
  quarry: BUILDINGS.find(x => x.id === "quarry"),
  petriciteConsumers: BUILDINGS.filter(x => x.cost && x.cost.petriciteBlock).map(x => x.id)
    .concat(CRAFTS.filter(c => c.cost && c.cost.petriciteBlock).map(c => "craft:" + c.id)),
  minerals: MINERALS_LINE
}));
console.log("auditCostGraph:", JSON.stringify(r.audit));
console.log("auditRawGraph ("+r.raw.length+"):"); r.raw.forEach(v=>console.log("   "+v));
console.log("globalBoost members:", r.globalBoosters);
console.log("quarry:", JSON.stringify({name:r.quarry.name, cost:r.quarry.cost, ratio:r.quarry.ratio, jobBoost:r.quarry.jobBoost, group:r.quarry.group, tech:r.quarry.tech}));
console.log("petriciteBlock consumers:", r.petriciteConsumers);
console.log("MINERALS_LINE:", JSON.stringify(r.minerals));
await b.close();
