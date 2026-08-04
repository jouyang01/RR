import { chromium } from "playwright";

const browser = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium" }).catch(() => chromium.launch());
const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
const errors = [];
page.on("console", m => { if (m.type() === "error") errors.push(m.text()); });
page.on("pageerror", e => errors.push(String(e)));

await page.goto(new URL("../index.html", import.meta.url).href);
await page.waitForTimeout(500);
let pass = 0, fail = 0;
const check = (name, cond, extra) => { console.log(name + ":", cond ? "PASS" : "FAIL", extra ?? ""); cond ? pass++ : fail++; };

// CHANGE 1: camp yields scale with junglers
const scale = await page.evaluate(() => {
  S.techs.logistics = true;
  S.jobs.jungler = 0;
  const base = campYieldMult();
  S.jobs.jungler = 10;
  const ten = campYieldMult();
  // actual loot scales: run wolves with high jungler count, min roll 3 -> >= round(3*2.5)=8
  S.campReady = {}; S.res.vigor = 100;
  const f0 = S.res.furs;
  runExpedition("wolves");
  const gained = S.res.furs - f0;
  S.jobs.jungler = 0;
  return { base, ten, gained };
});
check("campYieldMult: 1.0 base, 2.5 at 10 junglers", scale.base === 1 && scale.ten === 2.5);
check("wolves loot actually scales (>=8 at x2.5)", scale.gained >= 8, `(+${scale.gained})`);

// Poro morale: sqrt curve, cap 30
const poro = await page.evaluate(() => {
  const out = {};
  S.res.poros = 25; out.at25 = poroMoraleBonus();
  S.res.poros = 100; out.at100 = poroMoraleBonus();
  S.res.poros = 2026; out.at2026 = poroMoraleBonus();
  S.res.poros = 0;
  return out;
});
check("poro morale: sqrt curve (25->10, 100->20, 2026->30 cap)", poro.at25 === 10 && poro.at100 === 20 && poro.at2026 === 30, JSON.stringify(poro));

// CHANGE 2: fatigue floor 0.15; freljord true ice
const trade = await page.evaluate(() => {
  S.tradeFatigue = { noxus: { n: 20, t: Date.now() } };
  const floor = fatigueMult("noxus");
  // freljord true ice: force until it drops
  S.techs.trade = true; S.tradeReady = {}; S.tradeFatigue = {};
  S.buildings.storehouse = 3;
  let ice = 0, tries = 0;
  while (ice === 0 && tries < 60) {
    S.res.gold = 80; S.res.vigor = 300; S.res.furs = 20;
    S.tradeReady = {};
    const i0 = S.res.trueice;
    tradeCaravan("freljord");
    ice = S.res.trueice - i0; tries++;
  }
  const luxWithIce = (() => { S.res.trueice = 2; return luxuryTypes().includes("trueice"); })();
  return { floor, ice, tries, luxWithIce };
});
check("fatigue floor now 0.15", Math.abs(trade.floor - 0.15) < 0.001, trade.floor);
check("freljord sometimes yields true ice", trade.ice >= 1, `(after ${trade.tries} caravans)`);
check("true ice counts as a luxury type", trade.luxWithIce);

// True ice is NOT drained
const iceDrain = await page.evaluate(() => {
  S.pop = 10; S.res.trueice = 5;
  const r = computeRates().trueice;
  S.pop = 0;
  return r;
});
check("true ice never melts (no drain)", iceDrain === 0);

// CHANGE 3: vigor tuning
const vigor = await page.evaluate(() => {
  const j = JOBS.find(x => x.id === "jungler");
  S.pop = 0; const c0 = computeCaps().vigor;
  S.pop = 10; const c10 = computeCaps().vigor;
  S.pop = 0;
  return { rate: j.prod.vigor, perPop: (c10 - c0) / 10 };
});
check("jungler nerfed to 0.15/s", vigor.rate === 0.15);
check("vigor cap +15 per wanderer", vigor.perPop === 15);

// USER: craft luxury floor
const craftFloor = await page.evaluate(() => {
  const out = {};
  S.res.furs = 7; // 7 - 4 = 3 < 5 -> blocked
  const f0 = S.res.furs;
  craftItem("parchment", 1);
  out.blocked = S.res.furs === f0;
  out.logWarns = S.log[0].text.includes("crafters refuse");
  S.res.furs = 12; // 12 - 4 = 8 >= 5 -> ok
  craftItem("parchment", 1);
  out.allowed = S.res.furs === 8;
  // x10 stops at floor instead of zeroing
  S.res.furs = 20; S.res.parchment = 0;
  craftItem("parchment", 10);
  out.stopsAtFloor = S.res.furs >= 5 && S.res.parchment >= 3;
  return out;
});
check("craft blocked below luxury floor", craftFloor.blocked && craftFloor.logWarns);
check("craft allowed above floor", craftFloor.allowed);
check("batch craft stops at floor, doesn't zero stock", craftFloor.stopsAtFloor, JSON.stringify(craftFloor));

// USER: poro pasture costs poros only
const pasture = await page.evaluate(() => {
  const b = BUILDINGS.find(x => x.id === "poroPasture");
  return { cost: b.cost, keys: Object.keys(b.cost) };
});
check("poro pasture costs only poros", pasture.keys.length === 1 && pasture.cost.poros === 5, JSON.stringify(pasture.cost));

// USER: resource row spacing increased
const spacing = await page.evaluate(() => {
  renderTop(computeRates());
  const row = document.querySelector(".rrow");
  return getComputedStyle(row).paddingTop;
});
check("resource rows have 3px padding (was 1px)", spacing === "3px", spacing);

// Regressions
const reg = await page.evaluate(() => {
  const out = {};
  gain("mana", 60); const t0 = S.res.timber; transmuteMana(1); out.transmute = S.res.timber > t0;
  const str = serialize(); loadFromString(str); out.saveRT = isFinite(S.res.mana) && "trueice" in S.res;
  return out;
});
for (const [k, v] of Object.entries(reg)) check("regression: " + k, v === true);

for (const tab of ["village", "lore", "wilds", "trade", "settlement"]) {
  await page.evaluate(t => { S.buildings.archive = Math.max(1, S.buildings.archive || 0); S.buildings.shelter = Math.max(1, S.buildings.shelter || 0); S.upgrades.keepingTheRolls = true; S.activeTab = t; renderAll(); }, tab);
}
check("all tabs render, no console errors", errors.length === 0, errors.join(" | "));

console.log("\n" + pass + " passed, " + fail + " failed");
await browser.close();
process.exit(fail > 0 ? 1 : 0);
