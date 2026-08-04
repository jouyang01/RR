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

// ===== ERA 2 GATE =====
const gate = await page.evaluate(() => {
  const t = TECHS.find(x => x.id === "callToArms");
  S.buildings.archive = 10; S.buildings.bardsHearth = 4; S.techs.almanac = true; S.techs.songcraft = true; S.techs.ritesOfTargon = true;
  gain("knowledge", 99999); gain("culture", 999);
  S.pop = 20; S.wtechs = {};
  const hiddenEarly = !techVisible(t);
  S.wtechs.convergence = true; S.pop = 25;
  const shownLate = techVisible(t);
  buyTech("callToArms");
  return { hiddenEarly, shownLate, bought: S.techs.callToArms, tabShown: TABS.find(x => x.id === "champions").show() };
});
check("era 2 gated on convergence + 25 pop", gate.hiddenEarly && gate.shownLate);
check("call to arms opens Champions tab", gate.bought && gate.tabShown);

// ===== RENOWN =====
const renown = await page.evaluate(() => {
  const out = {};
  S.res.renown = 0;
  S.techs.logistics = true; S.campReady = {}; S.res.vigor = 100;
  runExpedition("wolves");
  out.campRenown = S.res.renown;
  S.res.devotion = 100;
  ascendTargon();
  out.afterAscend = S.res.renown;
  out.passive = computeRates().renown;
  return out;
});
check("camp clears grant renown (+2)", renown.campRenown === 2, renown.campRenown);
check("ascend grants +25 renown", renown.afterAscend >= 27, renown.afterAscend);
check("passive trickle scales with pop (25 pop -> 0.125/s)", Math.abs(renown.passive - 0.125) < 0.001, renown.passive);

// ===== RECRUITMENT =====
const recruit = await page.evaluate(() => {
  const out = {};
  out.rosterSize = CHAMPS.length;
  // differentiated bundles: all cost renown + exactly one secondary
  out.bundlesOk = CHAMPS.every(c => c.cost.renown > 0 && Object.keys(c.cost).length === 2);
  // no worship costs (worship is permanent)
  out.noWorshipCost = CHAMPS.every(c => !("worship" in c.cost));
  // recruit shaco
  S.res.renown = 100; S.res.plumes = 30;
  recruitChamp("shaco");
  out.recruited = S.champs.shaco && S.champs.shaco.r;
  out.autoPost = S.champs.shaco.post === "vanguard";
  // can't afford leona (devotion 300)
  S.res.devotion = 10; S.res.renown = 100;
  recruitChamp("leona");
  out.gated = !(S.champs.leona && S.champs.leona.r);
  return out;
});
check("10 champions, renown + one themed secondary each", recruit.rosterSize === 10 && recruit.bundlesOk);
check("no champion costs worship (kept permanent)", recruit.noWorshipCost);
check("recruit works + auto-assigns suggested post", recruit.recruited && recruit.autoPost);
check("unaffordable champion stays locked", recruit.gated);

// ===== POSTS & CONTRIBUTIONS =====
const posts = await page.evaluate(() => {
  const out = {};
  // shaco at vanguard (fit): contribution = 4 * 1.25 = 5%
  out.contribFit = champContribution("shaco");
  out.vanguardBonus = postBonus("vanguard");
  // camp yield includes vanguard
  S.jobs.jungler = 0; S.buildings.hunterLodge = 0;
  out.campMult = campYieldMult();
  // cycle shaco off-post: contribution drops to 4
  cycleChampPost("shaco"); // vanguard -> warden
  out.offPost = S.champs.shaco.post;
  out.contribOffFit = champContribution("shaco");
  out.wardenBonus = postBonus("warden");
  // back to vanguard for later tests
  cycleChampPost("shaco"); // warden -> null
  cycleChampPost("shaco"); // null -> steward
  cycleChampPost("shaco"); // steward -> solari
  cycleChampPost("shaco"); // solari -> vanguard
  return out;
});
check("fit contribution 5% (4% x1.25)", Math.abs(posts.contribFit - 5) < 0.01 && Math.abs(posts.vanguardBonus - 5) < 0.01);
check("camp yield mult includes vanguard champion", Math.abs(posts.campMult - 1.05) < 0.001, posts.campMult);
check("post cycling works, off-fit loses x1.25", posts.offPost === "warden" && Math.abs(posts.contribOffFit - 4) < 0.01);

// ===== LEVELS & SKILLS =====
const levels = await page.evaluate(() => {
  const out = {};
  S.champs.shaco.xp = 120 * 25; // level 5
  out.lv5 = champLevel("shaco");
  out.contribL5 = champContribution("shaco"); // (4 + 2*sqrt(5)) * 1.25
  S.champs.shaco.xp = 120 * 100; // level 10 -> skill x1.5
  out.lv10 = champLevel("shaco");
  out.contribL10 = champContribution("shaco"); // (4 + 2*sqrt(10)) * 1.25 * 1.5
  return out;
});
check("level curve sqrt(xp/120)", levels.lv5 === 5 && levels.lv10 === 10);
check("contribution grows with level, x1.5 at skill", Math.abs(levels.contribL5 - (4 + 2 * Math.sqrt(5)) * 1.25) < 0.01 && Math.abs(levels.contribL10 - (4 + 2 * Math.sqrt(10)) * 1.25 * 1.5) < 0.01);

// XP accrues in tick while assigned
const xp = await page.evaluate(async () => {
  S.champs.shaco.xp = 0;
  await new Promise(r => setTimeout(r, 1100));
  const assigned = S.champs.shaco.xp;
  S.champs.shaco.post = null;
  const x0 = S.champs.shaco.xp;
  await new Promise(r => setTimeout(r, 800));
  const idle = S.champs.shaco.xp - x0;
  S.champs.shaco.post = "vanguard";
  return { assigned, idle };
});
check("xp accrues while assigned, not idle", xp.assigned > 0.8 && xp.idle === 0, JSON.stringify(xp));

// ===== LEADER =====
const leader = await page.evaluate(() => {
  const out = {};
  makeLeader("shaco");
  out.set = S.leader === "shaco";
  out.campWithShaco = campYieldMult(); // x1.2, and shaco no longer counts as vanguard post
  makeLeader("shaco"); // toggle off
  out.unset = S.leader === null;
  makeLeader("shaco");
  // leader swap free & instant
  S.res.renown = 200; S.res.steel = 50; S.buildings.warehouse = 2; gain("steel", 50);
  recruitChamp("jarvan");
  makeLeader("jarvan");
  out.swapped = S.leader === "jarvan";
  // jarvan leader: village jobs x1.10 (park him off-post so the baseline is clean)
  S.pop = 25; S.jobs.woodcutter = 2; S.upgrades = {};
  S.champs.jarvan.post = null;
  const withJ = computeRates().timber;
  S.leader = null;
  const without = computeRates().timber;
  out.jarvanMult = withJ / without;
  S.leader = "jarvan"; S.champs.jarvan.post = "steward";
  return out;
});
check("leader set/unset/swap free and instant", leader.set && leader.unset && leader.swapped);
check("leader excluded from post bonus, trait applies (x1.2 camps)", Math.abs(leader.campWithShaco - 1.2) < 0.01, leader.campWithShaco);
check("jarvan leader: village jobs x1.10", Math.abs(leader.jarvanMult - 1.1) < 0.01, leader.jarvanMult);

// ===== CHAMPIONS TAB UI =====
const ui = await page.evaluate(() => {
  S.activeTab = "champions"; uiDirty = true; renderAll();
  const t = document.getElementById("tab-content").textContent;
  return {
    hasRenown: t.includes("Renown"),
    hasLeader: t.includes("Jarvan IV") && t.includes("Demacian Command"),
    recruitedCards: document.querySelectorAll("[data-champ]").length,
    lockedCards: document.querySelectorAll("[data-recruit]").length
  };
});
check("champions tab: renown, leader strip, 2 recruited + 8 locked cards", ui.hasRenown && ui.hasLeader && ui.recruitedCards === 2 && ui.lockedCards === 8, JSON.stringify(ui));

// ===== QoL: hide completed research =====
const hide = await page.evaluate(() => {
  S.buildings.archive = Math.max(1, S.buildings.archive || 0); S.activeTab = "lore"; renderAll();
  const before = document.querySelectorAll("#tab-content .owned").length;
  document.getElementById("btn-hidedone").click();
  const after = document.querySelectorAll("#tab-content .owned").length;
  const persisted = S.hideDone === true;
  document.getElementById("btn-hidedone").click();
  return { before, after, persisted, restored: document.querySelectorAll("#tab-content .owned").length === before };
});
check("hide completed research toggle", hide.before > 0 && hide.after === 0 && hide.persisted && hide.restored, JSON.stringify(hide));

// ===== Hunter's Lodge + jungler nerf =====
const lodge = await page.evaluate(() => {
  S.leader = null; S.champs.shaco.post = null;
  S.jobs.jungler = 1; S.buildings.hunterLodge = 0;
  const oneJungler = campYieldMult();
  S.jobs.jungler = 10;
  const tenJunglers = campYieldMult();
  S.jobs.jungler = 0; S.buildings.hunterLodge = 3;
  const threeLodges = campYieldMult();
  S.buildings.hunterLodge = 0;
  S.champs.shaco.post = "vanguard";
  return { oneJungler, tenJunglers, threeLodges, def: BUILDINGS.find(b => b.id === "hunterLodge").cost };
});
check("1 jungler barely matters (+5%), 10 matter (+50%)", Math.abs(lodge.oneJungler - 1.05) < 0.001 && Math.abs(lodge.tenJunglers - 1.5) < 0.001);
check("hunter's lodge +15% each", Math.abs(lodge.threeLodges - 1.45) < 0.001, lodge.threeLodges);

// ===== Trade: demacia, no cooldown, deduped buttons =====
const trade = await page.evaluate(() => {
  const out = {};
  S.techs.trade = true;
  out.demacia = !!FACTIONS.find(f => f.id === "demacia");
  // no cooldown: two immediate trades both fire
  S.tradeFatigue = {}; S.standing = {};
  S.buildings.warehouse = 3;
  S.res.gold = 200; S.res.vigor = 500; S.res.provisions = 500;
  const s0 = S.res.steel;
  tradeCaravan("demacia");
  const afterOne = S.res.steel - s0;
  tradeCaravan("demacia");
  out.noCooldown = S.res.steel - s0 > afterOne;
  out.steelGained = afterOne >= 8;
  // dedupe: button shows standing only; motto/yields/cost only in tooltip
  S.activeTab = "trade"; uiDirty = true; renderAll();
  const btn = document.querySelector('[data-fac="piltover"]');
  out.buttonLean = btn.textContent.includes("Standing") && !btn.textContent.includes("hextech crystals") && !btn.textContent.includes("Gold:");
  return out;
});
check("demacia faction exists and sells steel", trade.demacia && trade.steelGained);
check("caravan cooldown removed (back-to-back trades)", trade.noCooldown);
check("trade buttons deduped (details in tooltip only)", trade.buttonLean);

// tooltip carries the moved info
await page.hover('[data-fac="piltover"]');
await page.waitForTimeout(150);
const tradeTip = await page.evaluate(() => document.getElementById("tooltip").textContent);
check("trade tooltip has cost + motto + yields", tradeTip.includes("Gold:") && tradeTip.includes("Progress") && tradeTip.includes("Yields"), tradeTip.slice(0, 70));

// ===== Regressions =====
const reg = await page.evaluate(() => {
  const out = {};
  const str = serialize(); loadFromString(str);
  out.saveRT = isFinite(S.res.mana) && S.champs.shaco.r === true && typeof S.leader !== "undefined";
  gain("mana", 60); const t0 = S.res.timber; transmuteMana(1); out.transmute = S.res.timber > t0;
  return out;
});
for (const [k, v] of Object.entries(reg)) check("regression: " + k, v === true);

for (const tab of ["settlement", "crafting", "village", "lore", "wilds", "trade", "targon", "champions"]) {
  await page.evaluate(t => { S.buildings.archive = Math.max(1, S.buildings.archive || 0); S.buildings.shelter = Math.max(1, S.buildings.shelter || 0); S.upgrades.keepingTheRolls = true; S.activeTab = t; renderAll(); }, tab);
}
check("all 8 tabs render, no console errors", errors.length === 0, errors.join(" | "));

console.log("\n" + pass + " passed, " + fail + " failed");
await browser.close();
process.exit(fail > 0 ? 1 : 0);
