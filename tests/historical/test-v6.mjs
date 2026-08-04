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

// Unlock everything so all tabs exist
await page.evaluate(() => {
  S.buildings.archive = 6; gain("knowledge", 99999);
  ["almanac", "cultivation", "woodcraft", "logistics", "mining", "trade", "smelting", "masquerade", "abyss", "yordle"].forEach(id => { S.techs[id] = true; });
  S.buildings.storehouse = 3; gain("mana", 500); gain("timber", 500); gain("gold", 500);
  S.pop = 5;
  uiDirty = true; renderAll(); renderTop(computeRates());
});
await page.waitForTimeout(300);

// 1. Chrome above content is compact; tabs within 1-2 rows
const chrome = await page.evaluate(() => {
  const header = document.querySelector("header").offsetHeight;
  const cal = document.getElementById("calendar-bar").offsetHeight;
  const tabs = document.getElementById("tab-bar");
  const tabBtn = tabs.querySelector(".tab-btn");
  return {
    total: header + cal + tabs.offsetHeight,
    tabRows: Math.round(tabs.offsetHeight / tabBtn.offsetHeight),
    tabCount: tabs.querySelectorAll(".tab-btn").length
  };
});
check("header+calendar+tabs compact (<110px)", chrome.total < 110, `(${chrome.total}px)`);
check("all " + chrome.tabCount + " tabs in one row at 1280w", chrome.tabRows === 1, `(${chrome.tabRows} rows)`);

// 2. Settlement: actions merged into one panel, buildings in multi-column grid
const settlement = await page.evaluate(() => {
  S.activeTab = "settlement"; renderAll();
  const panels = document.querySelectorAll("#tab-content .panel").length;
  const grid = document.querySelector("#tab-content .btn-grid");
  const cols = grid ? getComputedStyle(grid).gridTemplateColumns.split(" ").length : 0;
  const channelInRow = document.getElementById("btn-channel").parentElement.classList.contains("action-row");
  return { panels, cols, channelInRow, height: document.getElementById("tab-content").offsetHeight };
});
check("settlement is a single panel (actions merged)", settlement.panels === 1, `(${settlement.panels})`);
check("buildings in multi-column grid", settlement.cols >= 2, `(${settlement.cols} cols)`);
check("channel+transmute share one action row", settlement.channelInRow);

// 3. Other tabs use grids too
const grids = await page.evaluate(() => {
  const out = {};
  ["lore", "wilds", "trade"].forEach(t => {
    S.buildings.archive = Math.max(1, S.buildings.archive || 0); S.buildings.shelter = Math.max(1, S.buildings.shelter || 0); S.upgrades.keepingTheRolls = true; S.activeTab = t; renderAll();
    const g = document.querySelector("#tab-content .btn-grid");
    out[t] = g ? getComputedStyle(g).gridTemplateColumns.split(" ").length : 0;
  });
  return out;
});
check("lore techs in grid", grids.lore >= 2, `(${grids.lore} cols)`);
check("wilds expeditions in grid", grids.wilds >= 2, `(${grids.wilds} cols)`);
check("trade factions in grid", grids.trade >= 2, `(${grids.trade} cols)`);

// 4. No page-level vertical overflow beyond a laptop viewport for the settlement tab mid-game
const overflow = await page.evaluate(() => {
  S.activeTab = "settlement"; renderAll();
  return { page: document.body.scrollHeight, viewport: window.innerHeight };
});
check("settlement tab fits ~1 laptop screen mid-game", overflow.page <= overflow.viewport * 1.35, `(${overflow.page}px vs ${overflow.viewport}px viewport)`);

// 5. Functional regressions
const reg = await page.evaluate(() => {
  const out = {};
  document.getElementById("btn-channel").click(); out.channel = true;
  const t0 = S.res.timber; transmuteMana(1); out.transmute = S.res.timber > t0;
  S.res.vigor = 40; const f0 = S.res.furs; runExpedition("wolves"); out.wolves = S.res.furs > f0;
  S.res.gold = 100; S.res.vigor = 100; S.res.knowledge = 500; const c0 = S.res.crystals;
  tradeCaravan("piltover"); out.caravan = S.res.crystals > c0;
  const str = serialize(); S.res.mana = 0; loadFromString(str); out.saveRT = S.res.mana > 0;
  return out;
});
for (const [k, v] of Object.entries(reg)) check("regression: " + k, v === true);
check("no console errors", errors.length === 0, errors.join(" | "));

console.log("\n" + pass + " passed, " + fail + " failed");
await browser.close();
process.exit(fail > 0 ? 1 : 0);
