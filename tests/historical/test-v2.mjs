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

// 1. Click channel, buy well
for (let i = 0; i < 12; i++) await page.click("#btn-channel");
check("mana clicks", await page.evaluate(() => S.res.mana >= 12));
await page.click('[data-bld="manaWell"]');
check("buy mana well", await page.evaluate(() => S.buildings.manaWell === 1));

// 2. CAPS: resources clamp at cap
const capTest = await page.evaluate(() => {
  gain("mana", 999999);
  const caps = computeCaps();
  return { mana: S.res.mana, cap: caps.mana };
});
check("mana clamps to cap", Math.abs(capTest.mana - capTest.cap) < 0.01, `(${capTest.mana}/${capTest.cap})`);

// 3. Storage raises cap
const capBefore = await page.evaluate(() => computeCaps().mana);
await page.evaluate(() => { gain("timber", 200); S.buildings.runestone = 1; });
const capAfter = await page.evaluate(() => computeCaps().mana);
check("runestone raises mana cap", capAfter === capBefore + 250, `(${capBefore} -> ${capAfter})`);

// 4. Seasons: winter multiplier applies to farmsteads
const seasonTest = await page.evaluate(() => {
  S.buildings.farmstead = 5; S.pop = 0;
  S.tick = 0; // spring
  const spring = computeRates().provisions;
  S.tick = 3 * 1000; // winter (3 seasons * 100 days * 10 ticks)
  const winter = computeRates().provisions;
  S.tick = 0;
  return { spring, winter };
});
check("seasons multiply farms (spring 1.5x vs winter 0.25x)", Math.abs(seasonTest.spring / seasonTest.winter - 6) < 0.01, JSON.stringify(seasonTest));

// 5. Farmers ignore seasons
const farmerTest = await page.evaluate(() => {
  S.buildings.farmstead = 0; S.pop = 5; S.jobs.farmer = 5;
  S.tick = 3 * 1000; // winter
  const winterRate = computeRates().provisions + 5 * 0.35; // add back consumption
  S.tick = 0;
  const springRate = computeRates().provisions + 5 * 0.35;
  S.jobs.farmer = 0; S.pop = 0;
  return { winterRate, springRate };
});
check("farmers season-immune", Math.abs(farmerTest.winterRate - farmerTest.springRate) < 0.01, JSON.stringify(farmerTest));

// 6. Tech gating: mining needs woodcraft; buying tech unlocks building
const techTest = await page.evaluate(() => {
  gain("knowledge", 5000); // exceeds base cap...
  const kBefore = S.res.knowledge; // should be clamped to 150
  S.buildings.archive = 4; // +1000 cap
  gain("knowledge", 5000);
  const kAfter = S.res.knowledge;
  buyTech("almanac"); buyTech("woodcraft");
  const miningVisibleBefore = !!S.techs.mining;
  buyTech("mining");
  return { kBefore, kAfter, mined: S.techs.mining, mineVisible: BUILDINGS.find(b => b.id === "mine"), visible: buildingVisible(BUILDINGS.find(b => b.id === "mine")) };
});
check("knowledge cap-gates tech (150 base < 300 mining cost)", techTest.kBefore <= 150 && techTest.kAfter > 300, `(before=${techTest.kBefore}, after=${techTest.kAfter})`);
check("tech purchase works", techTest.mined === true);

// 7. Morale math
const moraleTest = await page.evaluate(() => {
  S.pop = 10; S.res.mushrooms = 0; S.res.furs = 0; S.res.poros = 0; S.jackboxes = 0;
  const base = morale(); // 100 - 10 = 90
  S.res.mushrooms = 5; S.res.furs = 2;
  const withLux = morale(); // 90 + 20 = 110
  S.res.poros = 3;
  const withPoros = morale(); // 110 + 10 + 3 = 123
  S.jackboxes = 2;
  const withBoxes = morale(); // 123 + 10 + 4 = 137
  return { base, withLux, withPoros, withBoxes };
});
check("morale: crowding penalty", moraleTest.base === 90, moraleTest.base);
check("morale: luxury types", moraleTest.withLux === 110, moraleTest.withLux);
check("morale: poros stack", moraleTest.withPoros === 123, moraleTest.withPoros);
check("morale: jackboxes stack", moraleTest.withBoxes === 137, moraleTest.withBoxes);

// 8. Morale multiplies worker output
const morMult = await page.evaluate(() => {
  S.pop = 5; S.jobs.woodcutter = 5; S.res.mushrooms = 0; S.res.furs = 0; S.res.poros = 0; S.jackboxes = 0;
  const at100 = computeRates().timber;
  S.res.mushrooms = 5; // +10% morale
  const at110 = computeRates().timber;
  S.jobs.woodcutter = 0; S.pop = 0; S.res.mushrooms = 0;
  return { at100, at110 };
});
check("morale multiplies workers", Math.abs(morMult.at110 / morMult.at100 - 1.1) < 0.01, JSON.stringify(morMult));

// 9. Expeditions: gromp costs vigor, grants mushrooms
const grompTest = await page.evaluate(() => {
  buyTech("logistics");
  S.res.vigor = 100;
  const mBefore = S.res.mushrooms;
  runExpedition("gromp");
  return { vigor: S.res.vigor, gained: S.res.mushrooms - mBefore };
});
check("gromp hunt spends vigor + grants mushrooms", Math.abs(grompTest.vigor - 40) < 0.01 && grompTest.gained >= 5, JSON.stringify(grompTest));

// 10. Drake hunt grants a stack (force success via loop)
const drakeTest = await page.evaluate(() => {
  S.techs.drakeLore = true;
  let tries = 0;
  while (Object.keys(S.drakes).filter(k => S.drakes[k] > 0).length === 0 && tries < 50) {
    S.res.vigor = 400; S.res.steel = 30; S.res.gold = 200;
    runExpedition("drakeHunt"); tries++;
  }
  return Object.values(S.drakes).reduce((a, b) => a + b, 0);
});
check("drake hunt grants essence stacks", drakeTest >= 1, `(${drakeTest} stacks)`);

// 11. Drake buff applies (infernal → production multiplier)
const infernalTest = await page.evaluate(() => {
  S.drakes = { infernal: 2 };
  S.buildings.manaWell = 4; S.upgrades = {};
  const withDrakes = computeRates().mana;
  S.drakes = {};
  const without = computeRates().mana;
  return { ratio: withDrakes / without };
});
check("infernal drakes +5% each", Math.abs(infernalTest.ratio - 1.1) < 0.01, `(x${infernalTest.ratio.toFixed(3)})`);

// 12. Baron buff doubles production
const baronTest = await page.evaluate(() => {
  const before = computeRates().mana;
  S.baronUntil = Date.now() + 60000;
  const during = computeRates().mana;
  S.baronUntil = 0;
  return { ratio: during / before };
});
check("hand of baron x2", Math.abs(baronTest.ratio - 2) < 0.01, `(x${baronTest.ratio.toFixed(2)})`);

// 13. Jack in the Box purchase + mischief
const boxTest = await page.evaluate(() => {
  S.techs.masquerade = true;
  S.res.gold = 500; S.jackboxes = 0;
  buyJackbox();
  const bought = S.jackboxes === 1 && Math.abs(S.res.gold - 350) < 1;
  S.res.provisions = 100; S.res.timber = 0; S.res.gold = 0; S.res.mana = 0;
  fireMischief();
  return { bought, stolen: S.res.provisions < 100 };
});
check("jack in the box purchase", boxTest.bought);
check("mischief steals resources", boxTest.stolen);

// 14. Scuttler click grants knowledge + vigor
const scuttlerTest = await page.evaluate(() => {
  S.scuttlerActive = true;
  S.res.knowledge = 0; S.res.vigor = 0;
  clickScuttler();
  return { k: S.res.knowledge, v: S.res.vigor };
});
check("scuttler grants rewards", scuttlerTest.k === 50 && scuttlerTest.v === 15, JSON.stringify(scuttlerTest));

// 15. Converter: forge eats ore+mana, makes steel; toggle stops it
const forgeTest = await page.evaluate(() => {
  S.techs.smelting = true;
  S.buildings.forge = 2; S.buildingsOff = {};
  S.res.ore = 50; S.res.mana = 50;
  const on = computeRates().steel;
  S.buildingsOff.forge = true;
  const off = computeRates().steel;
  S.buildingsOff = {};
  const noInput = (() => { S.res.ore = 0; const r = computeRates().steel; S.res.ore = 50; return r; })();
  return { on, off, noInput };
});
check("forge converts when on", forgeTest.on > 0.05, JSON.stringify(forgeTest));
check("forge toggle stops it", forgeTest.off === 0);
check("forge halts without inputs", forgeTest.noInput === 0);

// 16. 30% reveal rule
const revealTest = await page.evaluate(() => {
  const lumber = BUILDINGS.find(b => b.id === "lumberCamp"); // cost 40 mana → reveal at 12
  const s1 = (() => { S.seenMax.mana = 5; return buildingVisible(lumber); })();
  const s2 = (() => { S.seenMax.mana = 15; return buildingVisible(lumber); })();
  S.seenMax.mana = 99999;
  return { hidden: s1, shown: s2 };
});
check("30% reveal rule", revealTest.hidden === false && revealTest.shown === true);

// 17. Save round-trip
const rt = await page.evaluate(() => {
  S.res.mana = 123; S.pop = 7; S.jackboxes = 3; S.drakes = { ocean: 2 };
  const str = serialize();
  S.res.mana = 0; S.pop = 0;
  loadFromString(str);
  return { mana: S.res.mana, pop: S.pop, boxes: S.jackboxes, ocean: S.drakes.ocean };
});
check("save round-trip", Math.abs(rt.mana - 123) < 5 && rt.pop === 7 && rt.boxes === 3 && rt.ocean === 2, JSON.stringify(rt));

// 18. Offline progress respects caps
const offline = await page.evaluate(() => {
  S.buildings.manaWell = 4; S.res.mana = 0; S.pop = 0;
  S.lastSaved = Date.now() - 10 * 3600 * 1000; // 10h ago, cap 4h
  applyOfflineProgress();
  const caps = computeCaps();
  return { mana: S.res.mana, cap: caps.mana };
});
check("offline progress capped by storage", offline.mana <= offline.cap + 0.01, JSON.stringify(offline));

// 19. Tab switching renders without error
await page.evaluate(() => { S.techs.logistics = true; uiDirty = true; renderAll(); });
for (const tab of ["village", "lore", "wilds", "settlement"]) {
  await page.evaluate(t => { S.buildings.archive = Math.max(1, S.buildings.archive || 0); S.buildings.shelter = Math.max(1, S.buildings.shelter || 0); S.upgrades.keepingTheRolls = true; S.activeTab = t; renderAll(); }, tab);
}
check("all tabs render", errors.length === 0);

console.log("\n" + pass + " passed, " + fail + " failed");
console.log("console errors:", errors.length ? errors : "none");
await browser.close();
process.exit(fail > 0 ? 1 : 0);
