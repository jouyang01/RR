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

// 1. Vigor cap scales with population
const vigor = await page.evaluate(() => {
  S.techs.logistics = true;
  S.pop = 0; const c0 = computeCaps().vigor;
  S.pop = 10; const c10 = computeCaps().vigor;
  S.buildings.trainingGround = 2; const cTG = computeCaps().vigor;
  S.buildings.trainingGround = 0; S.pop = 0;
  return { c0, c10, cTG };
});
check("vigor cap +25 per wanderer", vigor.c10 - vigor.c0 === 250, JSON.stringify(vigor));
check("training grounds stack on top", vigor.cTG - vigor.c10 === 300);

// 2. Luxuries are consumed over time; poros are not
const lux = await page.evaluate(() => {
  S.pop = 10;
  S.res.mushrooms = 50; S.res.furs = 50; S.res.plumes = 50; S.res.poros = 5; S.res.parchment = 20;
  const r = computeRates();
  const out = { mush: r.mushrooms, furs: r.furs, plumes: r.plumes, poros: r.poros, parchment: r.parchment };
  // zero-stock luxury doesn't go negative
  S.res.furs = 0;
  out.fursAtZero = computeRates().furs;
  // no pop -> no drain
  S.pop = 0;
  out.noPop = computeRates().mushrooms;
  S.pop = 0; S.res.mushrooms = 0; S.res.plumes = 0; S.res.poros = 0; S.res.parchment = 0;
  return out;
});
check("mushrooms/furs/plumes drain at 0.003/pop/s", lux.mush === -0.03 && lux.furs === -0.03 && lux.plumes === -0.03, JSON.stringify(lux));
check("poros & parchment not consumed", lux.poros === 0 && lux.parchment === 0);
check("no drain at zero stock / zero pop", lux.fursAtZero === 0 && lux.noPop === 0);

// 3. Broad categories: exactly Village / Storage / Industry
const cats = await page.evaluate(() => {
  S.buildings.archive = 6; gain("knowledge", 99999);
  ["almanac", "cultivation", "woodcraft", "logistics", "mining", "trade", "smelting", "yordle"].forEach(id => { S.techs[id] = true; });
  S.buildings.storehouse = 3; gain("mana", 2000); gain("timber", 800); gain("gold", 400); gain("provisions", 300);
  S.activeTab = "settlement"; uiDirty = true; renderAll();
  return [...document.querySelectorAll("#tab-content .section-label")].map(e => e.textContent);
});
check("categories broadened to Village/Storage/Industry(+Crafting)", JSON.stringify(cats.filter(c => c !== "Crafting")) === '["Village","Storage","Industry"]', JSON.stringify(cats));

// 4. Buttons show lore only — no cost, no effect
const btnContent = await page.evaluate(() => {
  const btn = document.querySelector('[data-bld="shelter"]');
  const t = btn.textContent;
  return { hasLore: t.includes("A roof against the wind"), noCost: !t.includes("Timber:") && !/\d+ Timber/.test(t), noEffect: !t.includes("+2 max wanderers") };
});
check("building button = name + lore only", btnContent.hasLore && btnContent.noCost && btnContent.noEffect, JSON.stringify(btnContent));

// 5. Tooltip on hover: cost with current/required, red when short, plus effect
await page.hover('[data-bld="shelter"]');
await page.waitForTimeout(100);
const tip = await page.evaluate(() => {
  const tt = document.getElementById("tooltip");
  return { visible: tt.style.display === "block", text: tt.textContent, hasEffect: tt.textContent.includes("+2 max wanderers"), hasSlash: / \/ /.test(tt.textContent) };
});
check("tooltip shows on hover with cost + effect", tip.visible && tip.hasEffect && tip.hasSlash, tip.text.slice(0, 80));

// red when unaffordable
const redTest = await page.evaluate(() => {
  S.res.timber = 0; renderAll();
  return true;
});
await page.hover('[data-bld="longhouse"]');
await page.waitForTimeout(100);
const red = await page.evaluate(() => {
  const tt = document.getElementById("tooltip");
  const shortEl = tt.querySelector(".short");
  return { visible: tt.style.display === "block", hasRed: !!shortEl, redText: shortEl ? shortEl.textContent : "" };
});
check("unaffordable cost renders red", red.visible && red.hasRed && red.redText.includes("Timber"), red.redText);

// tooltip hides on mouseleave
await page.hover("#btn-channel");
await page.waitForTimeout(100);
const hidden = await page.evaluate(() => document.getElementById("tooltip").style.display);
check("tooltip hides on mouseleave", hidden === "none");

// 6. Regressions
const reg = await page.evaluate(() => {
  const out = {};
  gain("timber", 500);
  renderAll();
  const btn = document.querySelector('[data-bld="manaWell"]');
  const n0 = S.buildings.manaWell; btn.click(); out.buyBuilding = S.buildings.manaWell === n0 + 1;
  S.res.vigor = 40; const f0 = S.res.furs; runExpedition("wolves"); out.wolves = S.res.furs > f0;
  const str = serialize(); S.res.mana = 0; loadFromString(str); out.saveRT = S.res.mana > 0;
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
