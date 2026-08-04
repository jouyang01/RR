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

// ============ CRAFTING TAB ============
const craftTab = await page.evaluate(() => {
  const out = {};
  out.hiddenAtStart = !TABS.find(t => t.id === "crafting").show();
  gain("mana", 50);
  out.shownAfterMana = TABS.find(t => t.id === "crafting").show();
  S.activeTab = "crafting"; uiDirty = true; renderAll();
  out.hasTransmute = !!document.getElementById("btn-transmute");
  out.settlementClean = (() => { S.activeTab = "settlement"; renderAll(); return !document.getElementById("btn-transmute") && !!document.getElementById("btn-channel"); })();
  return out;
});
check("crafting tab appears once mana seen", craftTab.hiddenAtStart === false || craftTab.shownAfterMana, "");
check("transmute lives in Crafting tab", craftTab.hasTransmute);
check("settlement keeps Channel Mana, loses crafts", craftTab.settlementClean);

// Workshop is now pure craft building
const ws = await page.evaluate(() => {
  const b = BUILDINGS.find(x => x.id === "workshop");
  S.buildings.workshop = 5;
  const y = craftYield();
  S.buildings.manaWell = 3;
  const manaRate = computeRates().mana;
  S.buildings.workshop = 0;
  const manaRateNoWs = computeRates().mana;
  S.buildings.manaWell = 0;
  return { noGlobal: !b.globalBoost, yield: y, sameProduction: Math.abs(manaRate - manaRateNoWs) < 1e-9 };
});
check("workshop: +6% craft yield, no global production boost", ws.noGlobal && Math.abs(ws.yield - 1.3) < 0.001 && ws.sameProduction);

// Quick-craft links in resource column
const qc = await page.evaluate(() => {
  gain("timber", 20); gain("furs", 30);
  renderTop(computeRates());
  const timberRow = document.querySelector('[data-res="timber"]');
  return { links: timberRow.querySelectorAll(".qc").length, labels: [...timberRow.querySelectorAll(".qc")].map(e => e.textContent) };
});
check("timber row has +1/+10/all links", qc.links === 3 && qc.labels.join(",") === "+1,+10,all", JSON.stringify(qc.labels));

const qcClick = await page.evaluate(() => {
  S.res.mana = 200; S.res.timber = 0;
  renderTop(computeRates());
  const t0 = S.res.timber;
  document.querySelector('[data-qcraft="transmute:10"]').click();
  const after10 = S.res.timber - t0;
  S.res.mana = 500; S.res.timber = 0;
  renderTop(computeRates());
  document.querySelector('[data-qcraft="transmute:all"]').click();
  const afterAll = S.res.timber;
  const capRespected = S.res.timber <= computeCaps().timber + 0.01 && S.res.mana >= 0;
  return { after10, afterAll, capRespected };
});
check("quick-craft +10 works from resource bar", Math.abs(qcClick.after10 - 10) < 0.01, qcClick.after10);
check("quick-craft 'all' fills to cap without waste", qcClick.afterAll > 0 && qcClick.capRespected, JSON.stringify(qcClick));

// Parchment quick-links respect luxury floor
const qcParch = await page.evaluate(() => {
  S.res.furs = 30; S.res.parchment = 0; S.seenMax.parchment = 1;
  renderTop(computeRates());
  document.querySelector('[data-qcraft="parchment:all"]').click();
  return { furs: S.res.furs, parchment: S.res.parchment };
});
check("parchment 'all' stops at fur floor", qcParch.furs >= 5 && qcParch.parchment >= 5, JSON.stringify(qcParch));

// Rename
const rename = await page.evaluate(() => RES.plumes.name);
check("plumes renamed to Raptor Plumes", rename === "Raptor Plumes");

// ============ ERA 1: TARGON ============
// Gate: rites of targon needs 2 tomes held
const gate = await page.evaluate(() => {
  const t = TECHS.find(x => x.id === "ritesOfTargon");
  S.buildings.archive = 8; gain("knowledge", 99999);
  S.techs.almanac = true;
  S.res.tome = 0;
  const hiddenNoTomes = !techVisible(t);
  S.res.tome = 2;
  const shownWithTomes = techVisible(t);
  gain("knowledge", 99999); // tomes raised the cap; refill to afford the 2200 cost
  gain("crystals", 50); S.seenMax.crystals = 50;
  buyTech("ritesOfTargon");
  return { hiddenNoTomes, shownWithTomes, bought: S.techs.ritesOfTargon, tabShown: TABS.find(x => x.id === "targon").show() };
});
check("rites of targon gated behind 2 held tomes", gate.hiddenNoTomes && gate.shownWithTomes);
check("era unlocks + Mount Targon tab appears", gate.bought && gate.tabShown);

// Shrine, acolyte capacity, devotion production
const shrine = await page.evaluate(() => {
  gain("timber", 2000); gain("mana", 2000);
  S.buildings.shrine = 2;
  const caps = computeCaps();
  S.pop = 10;
  S.jobs.acolyte = 0;
  assignJob("acolyte", 1); assignJob("acolyte", 1); assignJob("acolyte", 1); assignJob("acolyte", 1);
  const atCap = S.jobs.acolyte;
  assignJob("acolyte", 1); // should refuse (max 4)
  const refused = S.jobs.acolyte === 4;
  const r = computeRates("devotion");
  return { devCap: caps.devotion, atCap, refused, rate: r.devotion, bd: r._bd.map(e => e.label) };
});
check("2 shrines: +150 devotion cap (base 100 -> 250)", shrine.devCap === 250, shrine.devCap);
check("acolytes capped at 2 per shrine", shrine.atCap === 4 && shrine.refused);
check("devotion flows from shrines + acolytes", shrine.rate > 0.4 && shrine.bd.some(l => l.includes("Acolyte")) && shrine.bd.some(l => l.includes("Shrine")), JSON.stringify(shrine.bd));

// Sanctum boost + unlock gating
const sanctum = await page.evaluate(() => {
  const b = BUILDINGS.find(x => x.id === "sanctum");
  S.buildings.shrine = 2;
  const hidden = !buildingVisible(b);
  S.buildings.shrine = 4;
  gain("gold", 80); gain("crystals", 10); S.seenMax.gold = 200; S.seenMax.crystals = 20; S.seenMax.timber = 2000;
  const shown = buildingVisible(b);
  const r0 = computeRates().devotion;
  S.buildings.sanctum = 3;
  const r3 = computeRates().devotion;
  return { hidden, shown, ratio: r3 / r0 };
});
check("sanctum hidden until 4 shrines", sanctum.hidden && sanctum.shown);
check("3 sanctums: devotion +30%", Math.abs(sanctum.ratio - 1.3) < 0.01, `(x${sanctum.ratio.toFixed(2)})`);

// Ascend: devotion -> worship, resets to zero
const ascend = await page.evaluate(() => {
  S.res.devotion = 120; S.res.worship = 0;
  ascendTargon();
  return { worship: S.res.worship, devotion: S.res.devotion, ascends: S.ascends };
});
check("ascend converts all devotion to permanent worship", ascend.worship === 120 && ascend.devotion === 0 && ascend.ascends === 1);

// Worship techs: threshold gates, purchase, effects
const wt = await page.evaluate(() => {
  const out = {};
  S.res.worship = 40; S.res.devotion = 200;
  buyWtech("solariHymn");
  out.gatedByThreshold = !S.wtechs.solariHymn;
  S.res.worship = 60;
  buyWtech("solariHymn");
  out.bought = S.wtechs.solariHymn === true && S.res.devotion === 100;
  // hymn boosts devotion production
  S.jobs.acolyte = 4;
  const withHymn = computeRates().devotion;
  S.wtechs.solariHymn = false;
  const without = computeRates().devotion;
  S.wtechs.solariHymn = true;
  out.hymnBoost = withHymn / without; // additive with 3 sanctums: 1.55/1.30

  // altar doubles devotion caps
  const c0 = computeCaps().devotion;
  S.wtechs.solariAltar = true;
  out.altarDoubles = computeCaps().devotion === c0 * 2;
  S.wtechs.solariAltar = false;
  // convergence: global bonus scales with worship
  S.wtechs.convergence = true;
  S.res.worship = 1000;
  out.convAt1000 = worshipBonus();
  S.res.worship = 4000;
  out.convAt4000 = worshipBonus();
  S.res.worship = 999999999;
  out.convCapped = worshipBonus();
  S.buildings.manaWell = 3; // need live mana production to measure the multiplier
  const g0 = (() => { S.wtechs.convergence = false; return computeRates().mana; })();
  S.wtechs.convergence = true; S.res.worship = 4000;
  const g1 = computeRates().mana;
  out.convApplies = g1 / g0;
  return out;
});
check("worship threshold gates techs", wt.gatedByThreshold && wt.bought);
check("solari hymn +25% devotion (additive w/ sanctums: 1.55/1.30)", Math.abs(wt.hymnBoost - 1.55 / 1.30) < 0.01, `(x${wt.hymnBoost.toFixed(2)})`);
check("solari altar doubles devotion caps", wt.altarDoubles);
check("convergence: +5%@1k, +10%@4k worship, capped 50%", Math.abs(wt.convAt1000 - 0.05) < 0.001 && Math.abs(wt.convAt4000 - 0.1) < 0.001 && wt.convCapped === 0.5);
check("convergence multiplies actual production", Math.abs(wt.convApplies - 1.1) < 0.01, `(x${wt.convApplies.toFixed(2)})`);

// Targon tab renders
const tabRender = await page.evaluate(() => {
  S.activeTab = "targon"; renderAll();
  const t = document.getElementById("tab-content").textContent;
  return { ascendBtn: !!document.getElementById("btn-ascend"), text: ["Mount Targon", "Shrine of the Solari", "Convergence of the Aspects", "Worship"].every(n => t.includes(n)) };
});
check("targon tab renders fully", tabRender.ascendBtn && tabRender.text);

// ============ Regressions ============
const reg = await page.evaluate(() => {
  const out = {};
  const str = serialize(); loadFromString(str);
  out.saveRT = isFinite(S.res.mana) && typeof S.wtechs === "object" && S.ascends >= 1;
  S.techs.logistics = true; S.campReady = {}; S.res.vigor = 40;
  const f0 = S.res.furs; runExpedition("wolves"); out.wolves = S.res.furs > f0;
  return out;
});
for (const [k, v] of Object.entries(reg)) check("regression: " + k, v === true);

for (const tab of ["settlement", "crafting", "village", "lore", "wilds", "trade", "targon"]) {
  await page.evaluate(t => { S.buildings.archive = Math.max(1, S.buildings.archive || 0); S.buildings.shelter = Math.max(1, S.buildings.shelter || 0); S.upgrades.keepingTheRolls = true; S.activeTab = t; renderAll(); }, tab);
}
check("all 7 tabs render, no console errors", errors.length === 0, errors.join(" | "));

console.log("\n" + pass + " passed, " + fail + " failed");
await browser.close();
process.exit(fail > 0 ? 1 : 0);
