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

// 1. Transmute: 10 mana -> 1 timber, button appears, works, respects insufficient mana
await page.evaluate(() => { gain("mana", 55); uiDirty = true; renderAll(); });
await page.waitForTimeout(300);
const hasBtn = await page.$("#btn-transmute");
check("transmute button appears", !!hasBtn);
const t1 = await page.evaluate(() => {
  const m0 = S.res.mana, t0 = S.res.timber;
  transmuteMana(1);
  return { dm: m0 - S.res.mana, dt: S.res.timber - t0 };
});
check("transmute 10 mana -> 1 timber", Math.abs(t1.dm - 10) < 0.01 && Math.abs(t1.dt - 1) < 0.01, JSON.stringify(t1));
const t10 = await page.evaluate(() => {
  const m0 = S.res.mana, t0 = S.res.timber;
  transmuteMana(10); // only ~45 mana left -> should do 4
  return { dm: m0 - S.res.mana, dt: S.res.timber - t0 };
});
check("transmute stops when mana runs out", Math.abs(t10.dm - 40) < 0.01 && Math.abs(t10.dt - 4) < 0.01, JSON.stringify(t10));

// 2. Workshop boosts transmute yield
const wy = await page.evaluate(() => {
  S.buildings.workshop = 3;
  const y = transmuteYield();
  S.buildings.workshop = 0;
  return y;
});
check("workshop +6% transmute yield each", Math.abs(wy - 1.18) < 0.001, wy);

// 3. Buildings amplify jobs by % — mine no longer produces ore itself
const mineTest = await page.evaluate(() => {
  S.techs.mining = true;
  S.pop = 5; S.jobs.miner = 0; S.buildings.mine = 3;
  const noWorkers = computeRates().ore;
  S.jobs.miner = 2;
  const boosted = computeRates().ore;
  S.buildings.mine = 0;
  const unboosted = computeRates().ore;
  S.jobs.miner = 0; S.pop = 0;
  return { noWorkers, boosted, unboosted, ratio: boosted / unboosted };
});
check("mine alone produces nothing", mineTest.noWorkers === 0);
check("3 mines boost miners +60%", Math.abs(mineTest.ratio - 1.6) < 0.01, `(x${mineTest.ratio.toFixed(2)})`);

// 4. Lumber mill boosts woodcutters
const millTest = await page.evaluate(() => {
  S.pop = 4; S.jobs.woodcutter = 2; S.buildings.lumberMill = 0;
  const base = computeRates().timber;
  S.buildings.lumberMill = 5;
  const boosted = computeRates().timber;
  S.buildings.lumberMill = 0; S.jobs.woodcutter = 0; S.pop = 0;
  return { ratio: boosted / base };
});
check("5 lumber mills boost woodcutters +50%", Math.abs(millTest.ratio - 1.5) < 0.01, `(x${millTest.ratio.toFixed(2)})`);

// 5. Trade dock has no flat production, only % boost
const dockTest = await page.evaluate(() => {
  S.techs.trade = true; S.techs.mining = true;
  S.pop = 0; S.jobs.miner = 0; S.buildings.tradeDock = 4;
  const noSource = computeRates().gold;
  S.pop = 2; S.jobs.miner = 2;
  const withMiners = computeRates().gold;
  S.buildings.tradeDock = 0;
  const unboosted = computeRates().gold;
  S.pop = 0; S.jobs.miner = 0;
  return { noSource, ratio: withMiners / unboosted };
});
check("trade dock produces nothing alone", dockTest.noSource === 0);
check("4 docks boost gold +100%", Math.abs(dockTest.ratio - 2) < 0.01, `(x${dockTest.ratio.toFixed(2)})`);

// 6. Zaunite drills boost miners (stacks with mines)
const drillTest = await page.evaluate(() => {
  S.pop = 2; S.jobs.miner = 2; S.buildings.mine = 2; S.upgrades = {};
  const base = computeRates().ore;
  S.upgrades.zauniteDrills = true;
  const withDrills = computeRates().ore;
  S.upgrades = {}; S.jobs.miner = 0; S.pop = 0; S.buildings.mine = 0;
  return { ratio: withDrills / base };
});
check("zaunite drills +50% miners", Math.abs(drillTest.ratio - 1.5) < 0.01, `(x${drillTest.ratio.toFixed(2)})`);

// 7. Save migration: v0.2 lumberCamp -> lumberMill
const migTest = await page.evaluate(() => {
  const fake = JSON.parse(JSON.stringify(S));
  fake.buildings = Object.assign({}, S.buildings, { lumberCamp: 4 });
  delete fake.buildings.lumberMill;
  fake.lastSaved = Date.now();
  const str = btoa(unescape(encodeURIComponent(JSON.stringify(fake))));
  loadFromString(str);
  return { mills: S.buildings.lumberMill, camps: S.buildings.lumberCamp };
});
check("v0.2 save migrates lumberCamp -> lumberMill", migTest.mills === 4 && migTest.camps === undefined, JSON.stringify(migTest));

// 8. Regression sweep: core systems still intact
const reg = await page.evaluate(() => {
  const out = {};
  gain("mana", 999999); out.capClamp = S.res.mana <= computeCaps().mana + 0.01;
  S.buildings.farmstead = 4; S.tick = 3000; const w = computeRates(); S.tick = 0; const sp = computeRates();
  out.seasons = Math.abs((sp.provisions - w.provisions) - 4 * 0.4 * 1.25) < 0.01;
  S.pop = 10; S.res.mushrooms = 2; out.morale = morale() === 100 - 10 + 10;
  S.res.mushrooms = 0; S.pop = 0; S.buildings.farmstead = 0;
  S.techs.logistics = true; S.res.vigor = 100; const m0 = S.res.mushrooms; runExpedition("gromp");
  out.gromp = S.res.mushrooms > m0 && S.res.vigor < 100;
  S.techs.masquerade = true; S.res.gold = 200; S.jackboxes = 0; buyJackbox(); out.jackbox = S.jackboxes === 1;
  const str = serialize(); S.res.mana = 0; loadFromString(str); out.saveRT = S.res.mana > 0;
  return out;
});
for (const [k, v] of Object.entries(reg)) check("regression: " + k, v === true);

// 9. All tabs render clean
await page.evaluate(() => { uiDirty = true; renderAll(); });
for (const tab of ["village", "lore", "wilds", "settlement"]) {
  await page.evaluate(t => { S.buildings.archive = Math.max(1, S.buildings.archive || 0); S.buildings.shelter = Math.max(1, S.buildings.shelter || 0); S.upgrades.keepingTheRolls = true; S.activeTab = t; renderAll(); }, tab);
}
check("all tabs render, no console errors", errors.length === 0, errors.join(" | "));

console.log("\n" + pass + " passed, " + fail + " failed");
await browser.close();
process.exit(fail > 0 ? 1 : 0);
