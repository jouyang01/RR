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

// Unlock a mid-game state
await page.evaluate(() => {
  S.buildings.archive = 6; gain("knowledge", 99999);
  ["almanac", "cultivation", "woodcraft", "logistics", "mining", "trade", "smelting", "masquerade", "abyss", "yordle"].forEach(id => { S.techs[id] = true; });
  S.buildings.storehouse = 3; S.buildings.runestone = 4;
  gain("mana", 2000); gain("timber", 500); gain("gold", 500);
  S.pop = 5;
  uiDirty = true; renderAll(); renderTop(computeRates());
});
await page.waitForTimeout(300);

// 1. No category labels; one grid; exactly 3 columns
const grid = await page.evaluate(() => {
  S.activeTab = "settlement"; renderAll();
  const labels = document.querySelectorAll("#tab-content .section-label").length;
  const grids = document.querySelectorAll("#tab-content .btn-grid").length;
  const g = document.querySelector("#tab-content .btn-grid.cols3");
  const cols = g ? getComputedStyle(g).gridTemplateColumns.split(" ").length : 0;
  const buttons = g ? g.querySelectorAll("[data-bld]").length : 0;
  return { labels, grids, cols, buttons, height: document.body.scrollHeight, vh: window.innerHeight };
});
check("category labels removed", grid.labels === 0, `(${grid.labels})`);
check("single building grid", grid.grids === 1, `(${grid.grids})`);
check("exactly 3 columns", grid.cols === 3, `(${grid.cols})`);
check("all visible buildings in the one grid", grid.buttons >= 10, `(${grid.buttons} buildings)`);
check("settlement fits viewport", grid.height <= grid.vh * 1.15, `(${grid.height}px vs ${grid.vh}px)`);

// 2. Transmute: one button with embedded x10/x50 minis
const tstruct = await page.evaluate(() => {
  const main = document.getElementById("btn-transmute");
  const m10 = document.getElementById("btn-transmute10");
  const m50 = document.getElementById("btn-transmute50");
  return {
    minisInside: main.contains(m10) && main.contains(m50),
    miniClass: m10.classList.contains("mini-btn") && m50.classList.contains("mini-btn"),
    standaloneButtons: document.querySelectorAll(".action-row > button").length // channel + transmute only
  };
});
check("x10/x50 embedded inside the Transmute button", tstruct.minisInside && tstruct.miniClass);
check("action row has only Channel + Transmute", tstruct.standaloneButtons === 2, `(${tstruct.standaloneButtons})`);

// 3. Click behavior: main = x1; minis = exactly 10/50, no double-fire
const clicks = await page.evaluate(async () => {
  const out = {};
  let m0 = S.res.mana;
  document.getElementById("btn-transmute").click();
  out.x1 = m0 - S.res.mana;
  await new Promise(r => setTimeout(r, 250)); // allow re-render
  m0 = S.res.mana;
  document.getElementById("btn-transmute10").click();
  out.x10 = m0 - S.res.mana;
  await new Promise(r => setTimeout(r, 250));
  m0 = S.res.mana;
  document.getElementById("btn-transmute50").click();
  out.x50 = m0 - S.res.mana;
  return out;
});
check("main button transmutes x1 (10 mana)", Math.abs(clicks.x1 - 10) < 0.01, JSON.stringify(clicks));
check("x10 mini spends exactly 100 mana (no double-fire)", Math.abs(clicks.x10 - 100) < 0.01);
check("x50 mini spends exactly 500 mana (no double-fire)", Math.abs(clicks.x50 - 500) < 0.01);

// 4. Regressions
const reg = await page.evaluate(() => {
  const out = {};
  const bld = document.querySelector('[data-bld="manaWell"]');
  const n0 = S.buildings.manaWell; bld.click(); out.buyBuilding = S.buildings.manaWell === n0 + 1;
  S.res.vigor = 40; const f0 = S.res.furs; runExpedition("wolves"); out.wolves = S.res.furs > f0;
  S.res.gold = 100; S.res.vigor = 100; const c0 = S.res.crystals; tradeCaravan("piltover"); out.caravan = S.res.crystals > c0;
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
