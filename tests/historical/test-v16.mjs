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

// --- CHANGE 1: tome chain ---
const tome = await page.evaluate(() => {
  const parch = CRAFTS.find(c => c.id === "parchment");
  const cap0 = computeCaps().knowledge;
  S.res.tome = 2;
  const cap2 = computeCaps().knowledge;
  S.res.tome = 0;
  return { parchFurs: parch.cost.furs, tomeCap: cap2 - cap0, archiveRatio: BUILDINGS.find(b => b.id === "archive").ratio };
});
check("parchment costs 4 furs", tome.parchFurs === 4);
check("tome +150 knowledge cap", tome.tomeCap === 300, `(+${tome.tomeCap} for 2)`);
check("archive ratio 1.22", tome.archiveRatio === 1.22);

// --- CHANGE 2: trade ---
const trade = await page.evaluate(() => {
  const out = {};
  out.freljordFurs = FACTIONS.find(f => f.id === "freljord").cost.furs;
  S.techs.trade = true;
  S.res.gold = 80; S.res.vigor = 300; S.res.knowledge = 100;
  S.tradeReady = {}; S.tradeFatigue = {};
  const c0 = S.res.crystals;
  tradeCaravan("piltover");
  out.firstTrade = S.res.crystals > c0;
  out.cooldownSet = S.tradeReady.piltover > Date.now();
  out.fatigueSet = S.tradeFatigue.piltover.n === 1;
  const g1 = S.res.gold;
  tradeCaravan("piltover"); // on cooldown
  out.blockedOnCooldown = S.res.gold === g1;
  // fatigue math: 3 recent trades -> mult
  S.tradeFatigue.piltover = { n: 3, t: Date.now() };
  out.fatMult3 = fatigueMult("piltover"); // 1 - 0.24 = 0.76
  S.tradeFatigue.piltover = { n: 3, t: Date.now() - 90 * 1000 }; // one recovery period
  out.fatDecayed = Math.abs(tradeFatigue("piltover") - 2) < 0.02;
  S.tradeFatigue.piltover = { n: 20, t: Date.now() };
  out.fatFloor = fatigueMult("piltover"); // floor 0.4
  return out;
});
check("freljord costs 4 furs", trade.freljordFurs === 4);
check("caravan trades then sets 60s cooldown + fatigue", trade.firstTrade && trade.cooldownSet && trade.fatigueSet);
check("caravan blocked during cooldown", trade.blockedOnCooldown);
check("fatigue -8% per recent trade (3 -> x0.76)", Math.abs(trade.fatMult3 - 0.76) < 0.001, trade.fatMult3);
check("fatigue recovers 1 per 90s", trade.fatDecayed);
check("fatigue floor at x0.40", Math.abs(trade.fatFloor - 0.4) < 0.001);

// Fatigue actually reduces yield
const fatYield = await page.evaluate(() => {
  S.buildings.granary = 0; S.buildings.storehouse = 3;
  S.tradeReady = {}; S.tradeFatigue = {}; S.standing.freljord = 0;
  S.res.gold = 80; S.res.vigor = 300; S.res.furs = 20; S.res.provisions = 0;
  S.tick = 0;
  tradeCaravan("freljord");
  const fresh = S.res.provisions;
  S.res.provisions = 0; S.tradeReady = {}; S.standing.freljord = 0;
  S.tradeFatigue.freljord = { n: 5, t: Date.now() };
  S.res.gold = 80; S.res.vigor = 300; S.res.furs = 20;
  tradeCaravan("freljord");
  return { fresh, tired: S.res.provisions, ratio: S.res.provisions / fresh };
});
check("weary merchants pay less (5 fatigue -> x0.60)", Math.abs(fatYield.ratio - 0.6) < 0.01, `(x${fatYield.ratio.toFixed(2)})`);

// --- CHANGE 3: drake/baron gold ---
const wilds = await page.evaluate(() => ({
  drake: EXPEDITIONS.find(e => e.id === "drakeHunt").cost.gold,
  baron: EXPEDITIONS.find(e => e.id === "baron").cost.gold
}));
check("drake hunt gold 40", wilds.drake === 40);
check("baron gold 250", wilds.baron === 250);

// --- USER CHANGES ---
// Luxury drain 0.002
const drain = await page.evaluate(() => {
  S.pop = 10; S.res.mushrooms = 50;
  const r = computeRates().mushrooms;
  S.pop = 0; S.res.mushrooms = 0;
  return r;
});
check("luxury drain now 0.002/pop/s", Math.abs(drain - -0.02) < 1e-9, drain);

// Luxury checklist removed from calendar bar
const cal = await page.evaluate(() => {
  S.techs.logistics = true;
  renderTop(computeRates());
  return document.getElementById("calendar-bar").textContent;
});
check("luxury checklist removed from top bar", !cal.includes("luxuries:"), cal.slice(0, 60));
check("morale stays in top bar", cal.includes("Morale"));

// Season line above chronicle with weather %
const season = await page.evaluate(() => {
  S.techs.almanac = true;
  S.weather = "warm";
  renderTop(computeRates());
  const sl = document.getElementById("season-line");
  const sideCol = document.getElementById("side-col");
  return { visible: sl.style.display === "block", text: sl.textContent, inSideCol: sideCol.contains(sl), aboveChronicle: sideCol.children[0] === sl, calHasSeason: document.getElementById("calendar-bar").textContent.includes("Year") };
});
check("season line lives above the chronicle", season.visible && season.inSideCol && season.aboveChronicle);
check("weather modifier shown in parentheses", season.text.includes("(warm +15%)"), season.text);
check("season removed from top bar", !season.calHasSeason);

const chilly = await page.evaluate(() => {
  S.weather = "chilly"; renderTop(computeRates());
  const t = document.getElementById("season-line").textContent;
  S.weather = "clear"; renderTop(computeRates());
  return { chillyText: t, clearText: document.getElementById("season-line").textContent };
});
check("chilly shows −15%, clear shows nothing", chilly.chillyText.includes("(chilly −15%)") && !chilly.clearText.includes("("), chilly.chillyText);

// --- Regressions ---
const reg = await page.evaluate(() => {
  const out = {};
  gain("mana", 60); const t0 = S.res.timber; transmuteMana(1); out.transmute = S.res.timber > t0;
  S.res.vigor = 40; S.campReady = {}; const f0 = S.res.furs; runExpedition("wolves"); out.wolves = S.res.furs > f0;
  const str = serialize(); S.tradeReady = null; loadFromString(str); out.tradeStateSaved = typeof S.tradeReady === "object" && typeof S.tradeFatigue === "object";
  out.saveRT = S.res.mana >= 0;
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
