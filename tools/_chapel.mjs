import { chromium } from "playwright";
const b = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium" }).catch(()=>chromium.launch());
const p = await b.newPage(); p.on("pageerror",e=>console.log("ERR",String(e)));
await p.goto("file:///home/claude/RR58/index.html"); await p.waitForTimeout(500);
console.log(JSON.stringify(await p.evaluate(() => {
  loadFromString(btoa(unescape(encodeURIComponent(JSON.stringify(freshState())))));
  S.techs = { almanac:1, cultivation:1, woodcraft:1, mining:1, logistics:1, carpentry:1, trade:1,
              songcraft:1, smelting:1, scriptorium:1, ritesOfTargon:1, masquerade:1 };
  S.buildings = { shrine: 12 };
  S.seenMax = Object.assign({}, S.seenMax, { ore: 5000, culture: 2000, parchment: 0 });
  const ch = BUILDINGS.find(x=>x.id==="chapel");
  return { visible: buildingVisible(ch), cost: buildingCost(ch),
           unlockOk: ch.unlock ? ch.unlock(S) : true,
           parchmentKind: RES.parchment ? RES.parchment.kind : "MISSING",
           oreKind: RES.ore.kind, cultureKind: RES.culture.kind,
           sanctumCost: buildingCost(BUILDINGS.find(x=>x.id==="sanctum")),
           per: (function(){ var o={}; var c=buildingCost(ch); var caps=computeCaps();
             for (var r in c) o[r] = { need: c[r]*0.3, seen: S.seenMax[r]||0,
               recipeShows: CRAFTS.some(function(x){return x.id!=="transmute"&&x.out===r&&x.show(S);}),
               cap: caps[r], baseCap: RES[r]?RES[r].baseCap:undefined }; return o; })(),
           parchmentCraft: (function(){ var c=CRAFTS.find(x=>x.out==="parchment"); return c? {id:c.id, shows:c.show(S), cost:c.cost}:null; })() };
}), null, 1));
await b.close();
