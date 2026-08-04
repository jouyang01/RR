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

// 1. Parchment craft: 10 furs -> 1 parchment
const parch = await page.evaluate(() => {
  gain("furs", 100);
  const f0 = S.res.furs;
  craftItem("parchment", 1);
  return { df: f0 - S.res.furs, parchment: S.res.parchment };
});
check("scribe parchment (10 furs -> 1)", Math.abs(parch.df - 10) < 0.01 && Math.abs(parch.parchment - 1) < 0.01, JSON.stringify(parch));

// 2. Tome craft: 5 parchment + 50 mana -> 1 tome; +10 knowledge cap each
const tome = await page.evaluate(() => {
  gain("furs", 500); craftItem("parchment", 10);
  gain("mana", 120); S.buildings.runestone = 2; gain("mana", 120);
  const capBefore = computeCaps().knowledge;
  craftItem("tome", 2);
  const capAfter = computeCaps().knowledge;
  return { tomes: S.res.tome, capDelta: capAfter - capBefore, first: S.firstTome };
});
check("bind tome (5 parchment + 50 mana)", Math.abs(tome.tomes - 2) < 0.01, JSON.stringify(tome));
check("each tome +10 knowledge cap", Math.abs(tome.capDelta - 20) < 0.01, `(+${tome.capDelta})`);
check("first-tome flavor fired", tome.first === true);

// 3. Gears: 8 steel -> 1
const gears = await page.evaluate(() => {
  S.techs.smelting = true;
  S.buildings.storehouse = 2; gain("steel", 100);
  const s0 = S.res.steel;
  craftItem("gear", 3);
  return { ds: s0 - S.res.steel, gears: S.res.gear };
});
check("cut gears (8 steel -> 1)", Math.abs(gears.ds - 24) < 0.01 && Math.abs(gears.gears - 3) < 0.01, JSON.stringify(gears));

// 4. Workshop craft ratio applies to all crafts
const ratio = await page.evaluate(() => {
  S.buildings.workshop = 5; // +30%
  gain("furs", 20);
  const p0 = S.res.parchment;
  craftItem("parchment", 1);
  const y = S.res.parchment - p0;
  S.buildings.workshop = 0;
  return y;
});
check("workshops boost craft yield (+6% each)", Math.abs(ratio - 1.3) < 0.001, `(${ratio})`);

// 5. Gear-consuming upgrades work
const upg = await page.evaluate(() => {
  gain("gold", 500); gain("steel", 50); gain("gear", 30);
  buyUpgrade("clockworkBellows"); buyUpgrade("masterworkTools");
  const out = { bellows: !!S.upgrades.clockworkBellows, tools: !!S.upgrades.masterworkTools };
  // bellows: converter x1.25
  S.buildings.forge = 2; S.buildingsOff = {}; S.res.ore = 50; S.res.mana = 50; S.cinderUntil = 0;
  const withB = computeRates().steel;
  S.upgrades.clockworkBellows = false;
  out.bellowsRatio = withB / computeRates().steel;
  S.upgrades.clockworkBellows = true;
  // tools: farmer/woodcutter/miner x1.25, loremaster unaffected
  S.pop = 4; S.jobs.woodcutter = 2; S.jobs.loremaster = 2;
  S.upgrades.sharpenedAxes = false;
  const t = computeRates().timber, k = computeRates().knowledge;
  S.upgrades.masterworkTools = false;
  out.toolsRatio = t / computeRates().timber;
  out.loreUnaffected = Math.abs(k - computeRates().knowledge) < 0.001;
  S.upgrades.masterworkTools = true; S.jobs.woodcutter = 0; S.jobs.loremaster = 0; S.pop = 0; S.buildings.forge = 0;
  return out;
});
check("bellows purchased with gears", upg.bellows && upg.tools);
check("bellows: converters x1.25", Math.abs(upg.bellowsRatio - 1.25) < 0.01, `(x${upg.bellowsRatio.toFixed(2)})`);
check("masterwork tools: physical jobs x1.25", Math.abs(upg.toolsRatio - 1.25) < 0.01, `(x${upg.toolsRatio.toFixed(2)})`);
check("masterwork tools: loremasters unaffected", upg.loreUnaffected);

// 6. Craft UI: buttons in Crafting section with chips, no double-fire
await page.evaluate(() => { S.activeTab = "settlement"; uiDirty = true; renderAll(); });
await page.waitForTimeout(250);
const ui = await page.evaluate(async () => {
  const labels = [...document.querySelectorAll("#tab-content .section-label")].map(e => e.textContent);
  const btn = document.querySelector('[data-craft="parchment"]');
  const chip = btn ? btn.querySelector('[data-craftx="parchment:10"]') : null;
  gain("furs", 200);
  await new Promise(r => setTimeout(r, 250));
  const f0 = S.res.furs;
  document.querySelector('[data-craftx="parchment:10"]').click();
  return { hasCrafting: labels.includes("Crafting"), chipInButton: !!chip, delta: f0 - S.res.furs };
});
check("crafting section renders with chips inside buttons", ui.hasCrafting && ui.chipInButton);
check("x10 chip crafts exactly 10 (no double-fire)", Math.abs(ui.delta - 100) < 0.01, `(${ui.delta} furs)`);

// 7. Crafted section in resource column
const col = await page.evaluate(() => {
  renderTop(computeRates());
  return document.getElementById("resource-col").textContent;
});
check("resource column shows Crafted section", col.includes("Crafted") && col.includes("Tomes") && col.includes("k-cap"));

// 8. Regressions
const reg = await page.evaluate(() => {
  const out = {};
  const m0 = S.res.mana; transmuteMana(1); out.transmute = m0 - S.res.mana === 10;
  gain("knowledge", 99999); out.capGate = S.res.knowledge <= computeCaps().knowledge + 0.01;
  S.techs.logistics = true; S.res.vigor = 40; const f0 = S.res.furs; runExpedition("wolves"); out.wolves = S.res.furs > f0;
  const str = serialize(); S.res.tome = 0; loadFromString(str); out.tomesSaved = S.res.tome >= 2;
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
