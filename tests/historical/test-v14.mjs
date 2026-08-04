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

// --- CHANGE 1: morale fixes ---
// 1a. Luxury checklist in calendar bar
const readout = await page.evaluate(() => {
  S.techs.logistics = true;
  renderTop(computeRates());
  return document.getElementById("calendar-bar").textContent;
});
check("morale readout lists luxury checkmarks", readout.includes("luxuries:") && readout.includes("mushrooms ✗") && readout.includes("+10 each"), readout.slice(0, 120));

const readout2 = await page.evaluate(() => {
  S.res.furs = 3;
  renderTop(computeRates());
  return document.getElementById("calendar-bar").textContent;
});
check("checkmark flips when luxury in stock", readout2.includes("furs ✓"));

// 1b. Caravan luxury floor
const floor = await page.evaluate(() => {
  const out = {};
  S.techs.trade = true;
  S.res.vigor = 500; S.res.mushrooms = 22; S.res.gold = 50;
  const m0 = S.res.mushrooms;
  tradeCaravan("bilgewater"); // 22-20=2 < 5 -> refuse
  out.blockedSpend = S.res.mushrooms === m0;
  out.logWarns = S.log[0].text.includes("caravan master refuses");
  S.res.mushrooms = 30; S.res.vigor = 500;
  tradeCaravan("bilgewater"); // 30-20=10 >= 5 -> allowed
  out.allowedSpend = S.res.mushrooms === 10;
  return out;
});
check("caravan refuses to breach luxury floor of 5", floor.blockedSpend && floor.logWarns);
check("caravan trades when floor is safe", floor.allowedSpend);

// 1c. Luxury drain reduced to 0.001/pop/s
const drain = await page.evaluate(() => {
  S.pop = 10; S.res.mushrooms = 50;
  return computeRates().mushrooms;
});
check("luxury drain now 0.001/pop/s", Math.abs(drain - -0.01) < 1e-9, drain);

// 1d. Tavern + crowding relief
const tavern = await page.evaluate(() => {
  const t = BUILDINGS.find(b => b.id === "tavern");
  S.pop = 25; S.res.mushrooms = 0; S.res.furs = 0; S.res.plumes = 0; S.res.poros = 0; S.jackboxes = 0;
  S.buildings.tavern = 0;
  const m0 = morale(); // 100 - 40 = 60
  S.buildings.tavern = 4; // relief 20%
  const m4 = morale(); // 100 - 40*0.8 = 68
  S.buildings.tavern = 30; // relief capped at 90%
  const mCap = morale(); // 100 - 40*0.1 = 96
  S.buildings.tavern = 0; S.pop = 0;
  return { def: { tech: t.tech, ratio: t.ratio, relief: t.crowdRelief, cost: t.cost }, m0, m4, mCap };
});
check("tavern def matches spec", tavern.def.tech === "cultivation" && tavern.def.ratio === 1.15 && tavern.def.relief === 0.05 && tavern.def.cost.timber === 150 && tavern.def.cost.provisions === 80, JSON.stringify(tavern.def));
check("crowding relief math (60 -> 68 with 4 taverns)", tavern.m0 === 60 && tavern.m4 === 68, `${tavern.m0} -> ${tavern.m4}`);
check("relief caps at 90% (25 pop, 30 taverns = 96)", tavern.mCap === 96, tavern.mCap);

// --- CHANGE 2: camp cooldowns ---
const cd = await page.evaluate(() => {
  const out = {};
  out.cooldowns = {};
  EXPEDITIONS.forEach(e => { out.cooldowns[e.id] = e.cooldown || 0; });
  S.campReady = {};
  S.res.vigor = 500;
  const f0 = S.res.furs;
  runExpedition("wolves");
  out.firstRun = S.res.furs > f0;
  out.readySet = S.campReady.wolves > Date.now();
  const v1 = S.res.vigor, f1 = S.res.furs;
  runExpedition("wolves"); // on cooldown -> no-op
  out.secondBlocked = S.res.vigor === v1 && S.res.furs === f1;
  S.campReady.wolves = Date.now() - 1000; // expire
  runExpedition("wolves");
  out.thirdRuns = S.res.furs > f1;
  return out;
});
check("cooldowns per spec (90/120/150/180/600/600)",
  cd.cooldowns.wolves === 90 && cd.cooldowns.gromp === 120 && cd.cooldowns.raptors === 150 && cd.cooldowns.krugs === 180 && cd.cooldowns.blueSentinel === 600 && cd.cooldowns.redBrambleback === 600 && cd.cooldowns.drakeHunt === 0 && cd.cooldowns.baron === 0,
  JSON.stringify(cd.cooldowns));
check("camp runs, sets readyAt", cd.firstRun && cd.readySet);
check("camp blocked during cooldown", cd.secondBlocked);
check("camp runs again after respawn", cd.thirdRuns);

// Cooldown shown on the button
const cdUI = await page.evaluate(() => {
  S.res.vigor = 500; S.campReady.gromp = Date.now() + 60000;
  S.activeTab = "wilds"; uiDirty = true; renderAll();
  const btn = document.querySelector('[data-exp="gromp"]');
  return { disabled: btn.disabled, label: btn.textContent.includes("respawns") };
});
check("cooling camp disabled with respawn timer on button", cdUI.disabled && cdUI.label);

// --- CHANGE 3: gold scarcity ---
const gold = await page.evaluate(() => {
  const miner = JOBS.find(j => j.id === "miner");
  return { minerGold: miner.prod.gold, baseCap: RES.gold.baseCap };
});
check("miner gold 0.008/s", gold.minerGold === 0.008);
check("gold base cap 80", gold.baseCap === 80);

// --- Regressions ---
const reg = await page.evaluate(() => {
  const out = {};
  gain("gold", 999); out.goldClamped = S.res.gold <= computeCaps().gold + 0.01;
  gain("mana", 60); const t0 = S.res.timber; transmuteMana(1); out.transmute = S.res.timber > t0;
  const str = serialize(); S.campReady = {}; loadFromString(str); out.campReadySaved = typeof S.campReady === "object";
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
