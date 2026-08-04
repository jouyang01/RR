import { chromium } from "playwright";

const browser = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium" }).catch(() => chromium.launch());
const page = await browser.newPage();
const errors = [];
page.on("console", m => { if (m.type() === "error") errors.push(m.text()); });
page.on("pageerror", e => errors.push(String(e)));

await page.goto(new URL("../index.html", import.meta.url).href);
await page.waitForTimeout(500);
let pass = 0, fail = 0;
const check = (name, cond, extra) => { console.log(name + ":", cond ? "PASS" : "FAIL", extra ?? ""); cond ? pass++ : fail++; };

// --- LAYOUT ---
const layout = await page.evaluate(() => {
  const col = document.getElementById("resource-col");
  const tc = document.getElementById("tab-content");
  const log = document.getElementById("log");
  const main = document.getElementById("main");
  return {
    colExists: !!col,
    colFirst: main.children[0] === col,
    tcSecond: main.children[1] === tc,
    logMaxH: getComputedStyle(log).maxHeight,
    topBarGone: !document.getElementById("resource-bar")
  };
});
check("resource column is left-most", layout.colExists && layout.colFirst && layout.tcSecond);
check("top resource bar removed", layout.topBarGone);
check("chronicle smaller (230px)", layout.logMaxH === "230px", layout.logMaxH);

// resource rows render in the column
await page.evaluate(() => { gain("mana", 30); renderTop(computeRates()); });
const colContent = await page.evaluate(() => document.getElementById("resource-col").textContent);
check("resources render in left column", colContent.includes("Mana") && colContent.includes("Wanderers"));

// --- TRADE LAYER ---
// Setup: unlock trade
const setup = await page.evaluate(() => {
  S.buildings.archive = 4;
  gain("knowledge", 99999);
  buyTech("almanac"); buyTech("woodcraft"); buyTech("mining"); buyTech("trade");
  uiDirty = true; renderAll();
  return { trade: S.techs.trade, tabShown: TABS.find(t => t.id === "trade").show() };
});
check("trade tech opens Trade tab", setup.trade && setup.tabShown);

// Piltover: crystals import
const pilt = await page.evaluate(() => {
  S.res.gold = 100; S.res.vigor = 100; S.res.knowledge = 100;
  const c0 = S.res.crystals;
  tradeCaravan("piltover");
  return { gained: S.res.crystals - c0, standing: S.standing.piltover, goldSpent: S.res.gold === 85 };
});
check("piltover caravan imports crystals", pilt.gained >= 2 && pilt.goldSpent, JSON.stringify(pilt));
check("standing increments", pilt.standing === 1);

// Freljord: provisions, winter bonus
const frel = await page.evaluate(() => {
  S.buildings.granary = 2; // room for big yields
  S.res.gold = 200; S.res.vigor = 200; S.res.furs = 30; S.standing.freljord = 0;
  S.tick = 0; // spring
  const p0 = S.res.provisions;
  tradeCaravan("freljord");
  const springGain = S.res.provisions - p0;
  S.res.provisions = 0; S.res.gold = 200; S.res.vigor = 200; S.res.furs = 30; S.standing.freljord = 0;
  S.tick = 3000; // deepwinter
  tradeCaravan("freljord");
  const winterGain = S.res.provisions;
  S.tick = 0;
  return { springGain, winterGain, ratio: winterGain / springGain };
});
check("freljord sells provisions", frel.springGain >= 200, JSON.stringify(frel));
check("freljord +45% in deepwinter (shark role)", Math.abs(frel.ratio - 1.45 * (1.01)) < 0.03, `(x${frel.ratio.toFixed(2)})`);

// Bilgewater: gold for mushrooms
const bilge = await page.evaluate(() => {
  S.res.vigor = 100; S.res.mushrooms = 30;
  const g0 = S.res.gold;
  tradeCaravan("bilgewater");
  return { gained: S.res.gold - g0, shrooms: S.res.mushrooms };
});
check("bilgewater pays gold for mushrooms", bilge.gained >= 70 && bilge.shrooms === 10, JSON.stringify(bilge));

// Noxus: can fail, standing lowers fail chance, eventually yields steel
const nox = await page.evaluate(() => {
  const f = FACTIONS.find(x => x.id === "noxus");
  S.standing.noxus = 0;
  const failAt0 = f.failChance();
  S.standing.noxus = 30;
  const failAt30 = f.failChance();
  S.standing.noxus = 0;
  let got = 0, tries = 0;
  while (got === 0 && tries < 40) {
    S.res.gold = 100; S.res.vigor = 100;
    const s0 = S.res.steel;
    tradeCaravan("noxus");
    got = S.res.steel - s0; tries++;
  }
  return { failAt0, failAt30, got, tries };
});
check("noxus fail chance 40% -> 15% with standing", nox.failAt0 === 0.4 && Math.abs(nox.failAt30 - 0.15) < 0.001, JSON.stringify(nox));
check("noxus eventually delivers steel", nox.got >= 10, `(${nox.got} after ${nox.tries})`);

// Trade docks boost caravan yields
const dock = await page.evaluate(() => {
  S.buildings.tradeDock = 4; // +60%
  const m = tradeYieldMult();
  S.buildings.tradeDock = 0;
  return m;
});
check("4 docks = x1.60 caravan yield", Math.abs(dock - 1.6) < 0.01, dock);

// Docks no longer boost gold production
const dockGold = await page.evaluate(() => {
  S.pop = 2; S.jobs.miner = 2; S.buildings.tradeDock = 5;
  const withDocks = computeRates().gold;
  S.buildings.tradeDock = 0;
  const without = computeRates().gold;
  S.jobs.miner = 0; S.pop = 0;
  return { ratio: withDocks / without };
});
check("docks no longer multiply gold production", Math.abs(dockGold.ratio - 1) < 0.01, `(x${dockGold.ratio.toFixed(2)})`);

// Hextech re-tiered: requires yordle, costs crystals
const hex = await page.evaluate(() => {
  const t = TECHS.find(x => x.id === "hextech");
  return { req: t.req, costsCrystals: t.cost.crystals > 0, cost: t.cost.knowledge };
});
check("hextech theory re-tiered (req yordle, costs crystals)", hex.req === "yordle" && hex.costsCrystals && hex.cost === 1400, JSON.stringify(hex));

// Crystals visible at trade tier (importable before hextech)
const cryVis = await page.evaluate(() => !RES.crystals.hidden(S));
check("crystals visible once trade unlocked", cryVis);

// Trade tab renders with all four factions
const tabRender = await page.evaluate(() => {
  S.activeTab = "trade"; renderAll();
  const t = document.getElementById("tab-content").textContent;
  return ["Piltover", "Freljord", "Bilgewater", "Noxus"].every(n => t.includes(n)) && t.includes("Standing");
});
check("trade tab lists all factions + standing", tabRender);

// --- REGRESSIONS ---
const reg = await page.evaluate(() => {
  const out = {};
  gain("mana", 999999); out.capClamp = S.res.mana <= computeCaps().mana + 0.01;
  S.techs.logistics = true; S.res.vigor = 40; const f0 = S.res.furs; runExpedition("wolves"); out.wolves = S.res.furs > f0;
  S.res.vigor = 175; runExpedition("blueSentinel"); out.insight = S.insightUntil > Date.now(); S.insightUntil = 0;
  transmuteMana(1); out.transmute = true; // no throw
  const str = serialize(); S.res.mana = 0; loadFromString(str); out.saveRT = S.res.mana > 0;
  out.standingSaved = typeof S.standing === "object";
  return out;
});
for (const [k, v] of Object.entries(reg)) check("regression: " + k, v === true);

// All tabs render clean
for (const tab of ["village", "lore", "wilds", "trade", "settlement"]) {
  await page.evaluate(t => { S.buildings.archive = Math.max(1, S.buildings.archive || 0); S.buildings.shelter = Math.max(1, S.buildings.shelter || 0); S.upgrades.keepingTheRolls = true; S.activeTab = t; renderAll(); }, tab);
}
check("all tabs render, no console errors", errors.length === 0, errors.join(" | "));

console.log("\n" + pass + " passed, " + fail + " failed");
await browser.close();
process.exit(fail > 0 ? 1 : 0);
