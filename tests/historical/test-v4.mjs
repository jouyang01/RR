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

// 1. Transmute row: all three buttons render inline, x50 works
await page.evaluate(() => { gain("mana", 600); S.buildings.runestone = 3; gain("mana", 600); uiDirty = true; renderAll(); });
await page.waitForTimeout(300);
const btns = await page.evaluate(() => ({
  b1: !!document.getElementById("btn-transmute"),
  b10: !!document.getElementById("btn-transmute10"),
  b50: !!document.getElementById("btn-transmute50"),
  sameRow: document.getElementById("btn-transmute")?.parentElement?.classList.contains("action-row")
    && document.getElementById("btn-transmute50")?.parentElement?.classList.contains("action-row")
}));
check("transmute x1/x10/x50 in one action-row", btns.b1 && btns.b10 && btns.b50 && btns.sameRow, JSON.stringify(btns));
const t50 = await page.evaluate(() => {
  const m0 = S.res.mana, t0 = S.res.timber;
  transmuteMana(50);
  return { dm: m0 - S.res.mana, dt: S.res.timber - t0 };
});
check("x50 transmutes 500 mana -> 50 timber", Math.abs(t50.dm - 500) < 0.01 && Math.abs(t50.dt - 50) < 0.01, JSON.stringify(t50));

// 2. Camp identities
const camps = await page.evaluate(() => {
  buyTech("almanac"); S.techs.logistics = true;
  const out = {};
  S.res.vigor = 40; const f0 = S.res.furs; runExpedition("wolves");
  out.wolvesFurs = S.res.furs > f0 && S.res.vigor < 1;
  // Gromp: mushrooms only, never furs/gold (run many times)
  let leaked = false;
  for (let i = 0; i < 30; i++) {
    S.res.vigor = 60; const fb = S.res.furs, gb = S.res.gold, mb = S.res.mushrooms;
    S.techs.abyss = false;
    runExpedition("gromp");
    if (S.res.furs !== fb || S.res.gold !== gb) leaked = true;
    if (S.res.mushrooms <= mb) leaked = true;
  }
  out.grompPure = !leaked;
  S.res.vigor = 100; const p0 = S.res.plumes; runExpedition("raptors");
  out.raptorPlumes = S.res.plumes > p0;
  S.res.vigor = 150; const o0 = S.res.ore, g0 = S.res.gold; runExpedition("krugs");
  out.krugsOreGold = S.res.ore > o0 && S.res.gold > g0;
  return out;
});
check("wolves yield furs", camps.wolvesFurs);
check("gromp yields only mushrooms (30 runs)", camps.grompPure);
check("raptors yield plumes", camps.raptorPlumes);
check("krugs yield ore + gold", camps.krugsOreGold);

// 3. Raptors can spot the scuttler (30% chance -> force via loop)
const raptorScout = await page.evaluate(() => {
  S.scuttlerActive = false;
  document.getElementById("scuttler-banner").style.display = "none";
  let tries = 0;
  while (!S.scuttlerActive && tries < 60) { S.res.vigor = 100; runExpedition("raptors"); tries++; }
  return { active: S.scuttlerActive, tries };
});
check("raptors spot scuttler early", raptorScout.active, `(after ${raptorScout.tries} hunts)`);

// 4. Crest of Insight: +50% knowledge & mana
const insight = await page.evaluate(() => {
  S.insightUntil = 0; S.pop = 4; S.jobs.loremaster = 2; S.buildings.manaWell = 4;
  const base = computeRates();
  S.res.vigor = 175; runExpedition("blueSentinel");
  const buffed = computeRates();
  const r = { k: buffed.knowledge / base.knowledge, m: buffed.mana / base.mana, until: S.insightUntil > Date.now() };
  S.insightUntil = 0; S.jobs.loremaster = 0; S.pop = 0;
  return r;
});
check("crest of insight x1.5 knowledge & mana", Math.abs(insight.k - 1.5) < 0.01 && Math.abs(insight.m - 1.5) < 0.01 && insight.until, JSON.stringify(insight));

// 5. Crest of Cinders: converter output +50%, inputs unchanged
const cinders = await page.evaluate(() => {
  S.techs.smelting = true; S.buildings.forge = 2; S.buildingsOff = {};
  S.res.ore = 50; S.res.mana = 50; S.cinderUntil = 0;
  const base = computeRates();
  S.res.vigor = 175; runExpedition("redBrambleback");
  const buffed = computeRates();
  const r = { steel: buffed.steel / base.steel, oreIn: buffed.ore - base.ore, until: S.cinderUntil > Date.now() };
  S.cinderUntil = 0; S.buildings.forge = 0;
  return r;
});
check("crest of cinders x1.5 converter output", Math.abs(cinders.steel - 1.5) < 0.01 && cinders.until, JSON.stringify(cinders));
check("cinders leave converter inputs unchanged", Math.abs(cinders.oreIn) < 0.001);

// 6. Red requires smelting, Blue only logistics
const gating = await page.evaluate(() => {
  const red = EXPEDITIONS.find(e => e.id === "redBrambleback");
  const blue = EXPEDITIONS.find(e => e.id === "blueSentinel");
  return { red: red.tech, blue: blue.tech };
});
check("red gated on smelting, blue on logistics", gating.red === "smelting" && gating.blue === "logistics", JSON.stringify(gating));

// 7. Honeyfruit: click grants provisions + consumption buff
const honey = await page.evaluate(() => {
  S.pop = 10; S.upgrades = {};
  const eatBase = -computeRates().provisions; // no farms/farmers -> pure consumption
  S.honeyActive = true;
  const p0 = S.res.provisions;
  clickHoney();
  const eatBuffed = -computeRates().provisions;
  const r = { gained: S.res.provisions - p0, ratio: eatBuffed / eatBase, until: S.honeyUntil > Date.now() };
  S.honeyUntil = 0; S.pop = 0;
  return r;
});
check("honeyfruit grants provisions", honey.gained >= 30, `(+${honey.gained.toFixed(0)})`);
check("honeyfruit -20% consumption", Math.abs(honey.ratio - 0.8) < 0.01 && honey.until, `(x${honey.ratio.toFixed(2)})`);

// 8. Plumes are a luxury type
const plumeLux = await page.evaluate(() => {
  S.pop = 5; S.res.mushrooms = 0; S.res.furs = 0; S.res.poros = 0; S.jackboxes = 0; S.res.plumes = 0;
  const base = morale();
  S.res.plumes = 3;
  const withPlumes = morale();
  return { base, withPlumes };
});
check("plumes +10% morale type", plumeLux.withPlumes === plumeLux.base + 10, JSON.stringify(plumeLux));

// 9. Buff readout renders in calendar bar
const readout = await page.evaluate(() => {
  S.insightUntil = Date.now() + 300000; S.cinderUntil = Date.now() + 300000; S.honeyUntil = Date.now() + 100000;
  renderTop(computeRates());
  const t = document.getElementById("calendar-bar").textContent;
  S.insightUntil = 0; S.cinderUntil = 0; S.honeyUntil = 0;
  return t;
});
check("calendar shows crests + honeyfruit", readout.includes("CREST OF INSIGHT") && readout.includes("CREST OF CINDERS") && readout.includes("HONEYFRUIT"));

// 10. Regressions
const reg = await page.evaluate(() => {
  const out = {};
  gain("mana", 999999); out.capClamp = S.res.mana <= computeCaps().mana + 0.01;
  S.techs.mining = true; S.pop = 2; S.jobs.miner = 2; S.buildings.mine = 3;
  const b = computeRates().ore; S.buildings.mine = 0;
  out.mineBoost = Math.abs(b / computeRates().ore - 1.6) < 0.01;
  S.jobs.miner = 0; S.pop = 0;
  const str = serialize(); S.res.mana = 0; loadFromString(str); out.saveRT = S.res.mana > 0;
  out.plumesSaved = "plumes" in S.res;
  return out;
});
for (const [k, v] of Object.entries(reg)) check("regression: " + k, v === true);

// 11. All tabs render clean
for (const tab of ["village", "lore", "wilds", "settlement"]) {
  await page.evaluate(t => { S.buildings.archive = Math.max(1, S.buildings.archive || 0); S.buildings.shelter = Math.max(1, S.buildings.shelter || 0); S.upgrades.keepingTheRolls = true; S.activeTab = t; renderAll(); }, tab);
}
check("all tabs render, no console errors", errors.length === 0, errors.join(" | "));

console.log("\n" + pass + " passed, " + fail + " failed");
await browser.close();
process.exit(fail > 0 ? 1 : 0);
