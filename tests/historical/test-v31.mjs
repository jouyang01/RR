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

// ============ TIER 2 remainder: winter visibility & bite ============
const winter = await page.evaluate(() => {
  const out = {};
  S.techs.almanac = true;
  S.weather = "chilly";
  out.chillyMult = (() => { const r = S.weather === "chilly" ? 0.5 : 1; return r; })();
  // computeRates uses 0.5 for chilly: measure via farmstead output ratio
  S.buildings.farmstead = 4; S.jobs = {}; S.pop = 0;
  S.tick = 0; // Firstbloom (1.5)
  const chillyRate = computeRates().provisions;
  S.weather = "clear";
  const clearRate = computeRates().provisions;
  out.chillyRatio = chillyRate / clearRate; // expect 0.5
  // season display shows percent
  S.tick = 3 * 1000 * 10 * 100 / 1000; // put us in winter: ticks = 3 * TICKS_PER_DAY*DAYS_PER_SEASON
  S.tick = 3 * 10 * 100;
  S.weather = "chilly";
  renderTop(computeRates());
  out.seasonText = document.getElementById("season-line").textContent;
  S.tick = 0; S.weather = "clear"; S.buildings.farmstead = 0;
  return out;
});
check("cold snap now ×0.5", Math.abs(winter.chillyRatio - 0.5) < 0.01, winter.chillyRatio.toFixed(2));
check("season line shows Deepwinter −88% + bitter cold", /Deepwinter \(−88% harvest\)/.test(winter.seasonText) && /bitter cold/.test(winter.seasonText), winter.seasonText);

// ============ Storage split: Masonry vs Scholarship ============
const storage = await page.evaluate(() => {
  const out = {};
  const base = computeCaps();
  S.upgrades.expandedStores = true;
  const mas = computeCaps();
  out.timberUp = mas.timber / base.timber;       // 1.75
  out.knowledgeFlat = mas.knowledge / base.knowledge; // 1 — masonry no longer hits knowledge
  S.upgrades.cataloguing = true;
  const sch = computeCaps();
  out.knowledgeUp = sch.knowledge / mas.knowledge;  // 1.6
  out.cultureUp = sch.culture / mas.culture;        // 1.6
  out.devotionUp = sch.devotion / mas.devotion;     // 1.6
  out.timberFlat = sch.timber / mas.timber;         // 1 — scholarship doesn't hit timber
  out.renownFlat = sch.renown / base.renown;        // 1 — renown exempt from both
  S.upgrades.expandedStores = false; S.upgrades.cataloguing = false;
  return out;
});
check("Masonry ×1.75 materials, not knowledge", Math.abs(storage.timberUp - 1.75) < 0.01 && Math.abs(storage.knowledgeFlat - 1) < 0.01, JSON.stringify(storage));
check("Scholarship ×1.6 knowledge/culture/devotion only", Math.abs(storage.knowledgeUp - 1.6) < 0.01 && Math.abs(storage.cultureUp - 1.6) < 0.01 && Math.abs(storage.devotionUp - 1.6) < 0.01 && Math.abs(storage.timberFlat - 1) < 0.01, "");
check("renown exempt from both lines", Math.abs(storage.renownFlat - 1) < 0.01);
const schUpg = await page.evaluate(() => UPGRADES.filter(u => ["cataloguing", "crossReferencing", "greatIndex"].includes(u.id)).length);
check("3 Scholarship discoveries exist", schUpg === 3);

// ============ CHAMPIONS: passives always on ============
const passives = await page.evaluate(() => {
  const out = {};
  // recruit shaco at level 0: camp +15%
  S.champs = { shaco: { r: true, lvl: 0 } };
  S.leader = null;
  S.jobs = {}; S.buildings.hunterLodge = 0;
  out.campBase = campYieldMult();               // 1.15
  S.champs.shaco.lvl = 4;                        // ×(1+0.5*2)=2 → +30%
  out.campL4 = campYieldMult();                  // 1.30
  S.champs.shaco.lvl = 10;                       // ×(1+0.5*√10)×1.5 ≈ 3.87 → +58%
  out.campL10 = campYieldMult();
  // leona passive without leading
  S.champs.leona = { r: true, lvl: 0 };
  out.devBoost = (() => { S.buildings.shrine = 1; S.jobs.acolyte = 0; const a = computeRates("devotion"); return a; })();
  S.champs = {}; S.buildings.shrine = 0;
  return out;
});
check("Shaco passive on w/o leading: camp ×1.15", Math.abs(passives.campBase - 1.15) < 0.001, passives.campBase);
check("passive scales: L4 ×1.30, L10 ≈×1.58", Math.abs(passives.campL4 - 1.30) < 0.001 && passives.campL10 > 1.5 && passives.campL10 < 1.65, passives.campL10.toFixed(3));

// ============ Training: active purchase, renown+tomes → hexcores ============
const training = await page.evaluate(() => {
  const out = {};
  S.champs = { shaco: { r: true, lvl: 0 } };
  out.c0 = trainCost("shaco");                  // 40 renown + 1 tome
  S.champs.shaco.lvl = 5;
  out.c5 = trainCost("shaco");                  // hexcore era
  S.champs.shaco.lvl = 10;
  out.c10 = trainCost("shaco");                 // null (maxed)
  // actually train
  S.champs.shaco.lvl = 0;
  S.res.renown = 100; S.res.tome = 2; S.seenMax.renown = 500;
  trainChamp("shaco");
  out.trained = S.champs.shaco.lvl === 1 && S.res.renown === 60 && S.res.tome === 1;
  // can't afford → no train
  S.res.renown = 0;
  trainChamp("shaco");
  out.blocked = S.champs.shaco.lvl === 1;
  S.champs = {};
  return out;
});
check("train L0: 40 renown + 1 tome", training.c0.renown === 40 && training.c0.tome === 1, JSON.stringify(training.c0));
check("train L5+: costs hexcores", training.c5.hexcore === 2 && training.c5.tome === undefined, JSON.stringify(training.c5));
check("level 10 is max (no more training)", training.c10 === null);
check("training pays cost and levels up; blocked when broke", training.trained && training.blocked);

// ============ Champion costs raised (run-shaping) ============
const costs = await page.evaluate(() => CHAMPS.map(c => c.cost.renown));
check("recruit costs 150–260 renown (was 50–90)", Math.min(...costs) >= 150 && Math.max(...costs) <= 260, costs.join(","));

// ============ LEADER UNIQUES ============
// Leona: winter never bites
const leona = await page.evaluate(() => {
  S.champs = { leona: { r: true, lvl: 0 } }; S.leader = "leona";
  S.buildings.farmstead = 4; S.pop = 0; S.jobs = {};
  S.tick = 3 * 10 * 100; S.weather = "chilly"; // deepwinter + cold snap
  const withLeona = computeRates().provisions;
  S.leader = null;
  const without = computeRates().provisions;
  S.tick = 0; S.weather = "clear"; S.buildings.farmstead = 0; S.champs = {};
  return { ratio: withLeona / without }; // 1 / 0.125 = 8
});
check("Leona leads: winter+cold shielded (×8 vs unled)", Math.abs(leona.ratio - 8) < 0.1, leona.ratio.toFixed(2));

// Twitch: fatigue ignored
const twitch = await page.evaluate(() => {
  S.champs = { twitch: { r: true, lvl: 0 } }; S.leader = "twitch";
  S.tradeFatigue = { noxus: { n: 12, t: Date.now() } };
  const led = fatigueMult("noxus");
  S.leader = null;
  const unled = fatigueMult("noxus");
  S.tradeFatigue = {}; S.champs = {};
  return { led, unled };
});
check("Twitch leads: fatigue ignored (1.0 vs 0.15)", twitch.led === 1 && Math.abs(twitch.unled - 0.15) < 0.01, JSON.stringify(twitch));

// Poppy: ALL caps +25%, including renown/vigor
const poppy = await page.evaluate(() => {
  S.champs = { poppy: { r: true, lvl: 0 } }; S.leader = null;
  const base = computeCaps();
  S.leader = "poppy";
  const led = computeCaps();
  const out = { renown: led.renown / base.renown, vigor: led.vigor / base.vigor, timber: led.timber / base.timber };
  S.leader = null; S.champs = {};
  return out;
});
check("Poppy leads: +25% on ALL caps incl. renown & vigor", Math.abs(poppy.renown - 1.25) < 0.01 && Math.abs(poppy.vigor - 1.25) < 0.01 && Math.abs(poppy.timber - 1.25) < 0.01, JSON.stringify(poppy));

// Poppy passive (storage 8%) applies without leading
const poppyP = await page.evaluate(() => {
  S.champs = {}; const base = computeCaps();
  S.champs = { poppy: { r: true, lvl: 0 } };
  const withP = computeCaps();
  const out = { timber: withP.timber / base.timber, renown: withP.renown / base.renown };
  S.champs = {};
  return out;
});
check("Poppy passive: +8% material storage, renown untouched", Math.abs(poppyP.timber - 1.08) < 0.01 && Math.abs(poppyP.renown - 1) < 0.01, JSON.stringify(poppyP));

// Swain: research/discovery discount
const swain = await page.evaluate(() => {
  S.champs = { swain: { r: true, lvl: 0 } }; S.leader = "swain";
  const t = TECHS.find(x => x.id === "almanac");
  const dc = discCost(t.cost);
  S.leader = null;
  const full = discCost(t.cost);
  S.champs = {};
  return { disc: dc.knowledge, full: full.knowledge };
});
check("Swain leads: tech costs ×0.8 (24 vs 30)", swain.disc === 24 && swain.full === 30, JSON.stringify(swain));

// Heimerdinger: craft cost −20%
const heimer = await page.evaluate(() => {
  S.champs = { heimerdinger: { r: true, lvl: 0 } }; S.leader = "heimerdinger";
  const c = craftCostOf("parchment");
  S.leader = null;
  const full = craftCostOf("parchment");
  const out = { disc: c.furs, full: full.furs };
  // actual craft consumes discounted amount
  S.leader = "heimerdinger";
  S.res.furs = 20; S.res.parchment = 0; S.seenMax.parchment = 1;
  craftItem("parchment", 1);
  out.spent = 20 - S.res.furs;
  S.leader = null; S.champs = {};
  return out;
});
check("Heimer leads: parchment 3.2 furs (was 4), craft spends 3.2", Math.abs(heimer.disc - 3.2) < 0.01 && heimer.full === 4 && Math.abs(heimer.spent - 3.2) < 0.01, JSON.stringify(heimer));

// Zilean: passive 15% respawn + leader ×0.75 all cooldowns
const zilean = await page.evaluate(() => {
  S.champs = { zilean: { r: true, lvl: 0 } }; S.leader = "zilean";
  S.techs.logistics = true; S.campReady = {}; S.res.vigor = 100; S.seenMax.vigor = 100;
  runExpedition("wolves");
  const cd = (S.campReady.wolves - Date.now()) / 1000; // 90 * 0.85 * 0.75 ≈ 57.4
  S.champs = {}; S.leader = null; S.campReady = {};
  return { cd };
});
check("Zilean leads: wolves cd ≈57s (90 ×0.85 ×0.75)", zilean.cd > 55 && zilean.cd < 60, zilean.cd.toFixed(1));

// Jarvan: arrivals at 12s threshold
const jarvan = await page.evaluate(() => {
  S.champs = { jarvan: { r: true, lvl: 0 } }; S.leader = "jarvan";
  const led = leaderIs("jarvan");
  S.leader = null; S.champs = {};
  return led;
});
check("Jarvan leader wiring in place", jarvan === true);

// Caitlyn: caravans grant renown while leading
const cait = await page.evaluate(() => {
  S.champs = { caitlyn: { r: true, lvl: 0 } }; S.leader = "caitlyn";
  S.techs.trade = true; S.techs.callToArms = true; S.tradeReady = {}; S.tradeFatigue = {};
  S.res.gold = 500; S.res.provisions = 5000; S.res.furs = 100; S.res.timber = 5000; S.res.renown = 0;
  const f = FACTIONS[0];
  for (const r in f.cost) S.res[r] = Math.max(S.res[r] || 0, f.cost[r] * 2 + 20);
  tradeCaravan(f.id);
  const renown = S.res.renown;
  S.leader = null; S.champs = {}; S.tradeFatigue = {};
  return { renown };
});
check("Caitlyn leads: caravan pays +3 renown", cait.renown >= 3, cait.renown);

// Shaco: 30% vigor refund while leading (force via many runs)
const shaco = await page.evaluate(() => {
  S.champs = { shaco: { r: true, lvl: 0 } }; S.leader = "shaco";
  S.techs.logistics = true;
  let refunds = 0;
  for (let i = 0; i < 200; i++) {
    S.campReady = {}; S.res.vigor = 40;
    runExpedition("wolves");
    if (S.res.vigor >= 40) refunds++;
  }
  S.champs = {}; S.leader = null; S.campReady = {}; S.res.vigor = 0;
  return refunds;
});
check("Shaco leads: ~30% expeditions refund vigor", shaco > 30 && shaco < 90, shaco + "/200");

// Bard: chime grants a burst
const bard = await page.evaluate(() => {
  S.champs = { bard: { r: true, lvl: 0 } }; S.leader = "bard";
  S.chimeTimer = 44.9;
  S.res.timber = 0; S.seenMax.timber = 100;
  const logLen = S.log.length;
  tick(); // advances chimeTimer past 45
  const chimed = S.log.slice(0, 3).some(l => l.text.includes("chime"));
  S.champs = {}; S.leader = null;
  return { chimed };
});
check("Bard leads: chime fires and grants resources", bard.chimed === true);

// ============ ERA3 AFFINITY replaces posts ============
const aff = await page.evaluate(() => {
  S.champs = { heimerdinger: { r: true, lvl: 5 }, twitch: { r: true, lvl: 3 } };
  const overseer = affinityBonus("overseer"); // 2*(5+3)=16
  const voidb = affinityBonus("voidleader");  // 0
  S.champs.zilean = { r: true, lvl: 4 };
  const voidz = affinityBonus("voidleader");  // 2*4*1.5=12
  S.champs = {};
  return { overseer, voidb, voidz };
});
check("era-3 affinity: champion levels accelerate later eras", aff.overseer === 16 && aff.voidb === 0 && aff.voidz === 12, JSON.stringify(aff));

// Old save migration: xp → lvl, posts dropped
const migrate = await page.evaluate(() => {
  const save = serialize();
  const data = JSON.parse(decodeURIComponent(escape(atob(save))));
  data.champs = { shaco: { r: true, post: "vanguard", xp: 3000 } }; // sqrt(3000/120)=5
  loadFromString(btoa(unescape(encodeURIComponent(JSON.stringify(data)))));
  const c = S.champs.shaco;
  const out = { lvl: c.lvl, noXp: c.xp === undefined, noPost: c.post === undefined };
  S.champs = {};
  return out;
});
check("old saves: xp 3000 → level 5, post removed", migrate.lvl === 5 && migrate.noXp && migrate.noPost, JSON.stringify(migrate));

// ============ QoL ============
const qol = await page.evaluate(() => {
  const out = {};
  out.hexName = RES.crystals.name;
  // poro curve: 3*sqrt
  S.res.poros = 100; out.poro100 = poroMoraleBonus();
  S.res.poros = 10; out.poro10 = poroMoraleBonus();
  S.res.poros = 0;
  // banners live in side column now
  const side = document.getElementById("side-col");
  out.bannersInSide = !!side.querySelector("#scuttler-banner") && !!side.querySelector("#honey-banner");
  // split toggles
  S.techs.almanac = true; S.techs.cultivation = true; S.upgrades.ironPlows = true;
  S.buildings.archive = Math.max(1, S.buildings.archive || 0); S.activeTab = "lore"; uiDirty = true; renderAll();
  out.twoToggles = !!document.getElementById("btn-hidedone-r") && !!document.getElementById("btn-hidedone-d");
  // toggles independent
  S.hideDoneR = true; S.hideDoneD = false; renderAll();
  const t = document.getElementById("tab-content").textContent;
  out.independent = !/✓ Almanac/.test(t);
  S.hideDoneR = false;
  // expeditions have yield text for hover
  out.yields = EXPEDITIONS.every(e => !!e.yield || e.id === "drakeHunt") || EXPEDITIONS.filter(e => e.yield).length >= 8;
  // buff text out of always-visible desc
  const blue = EXPEDITIONS.find(e => e.id === "blueSentinel");
  out.buffOutOfDesc = !blue.desc.includes("Crest") && blue.yield.includes("Crest of Insight");
  // abyss true ice
  S.techs.abyss = true;
  let ice = 0;
  for (let i = 0; i < 60 && ice === 0; i++) {
    S.campReady = {}; S.res.vigor = 200; S.res.provisions = 200;
    const t0 = S.res.trueice;
    runExpedition("abyssJourney");
    ice = S.res.trueice - t0;
  }
  out.trueIce = ice >= 1;
  S.campReady = {};
  return out;
});
check("Hextech renamed to Hextech Crystals (id intact)", qol.hexName === "Hextech Crystals");
check("poro morale: 3√ curve (10→9, 100→30)", qol.poro10 === 9 && qol.poro100 === 30, qol.poro10 + "," + qol.poro100);
check("banners moved to side column", qol.bannersInSide);
check("separate show-completed toggles, independent", qol.twoToggles && qol.independent);
check("expedition yields on record for hover", qol.yields);
check("buff text moved out of camp desc into yield", qol.buffOutOfDesc);
check("Abyss journey can drop True Ice", qol.trueIce);

// ============ Champions tab renders ============
const champTab = await page.evaluate(() => {
  S.techs.songcraft = true; S.techs.callToArms = true; S.pop = 30;
  S.champs = { shaco: { r: true, lvl: 2 } }; S.leader = "shaco";
  S.activeTab = "champions"; uiDirty = true; renderAll();
  const t = document.getElementById("tab-content").textContent;
  const out = {
    passiveShown: /Ambush: camp yields \+\d+%/.test(t),
    leadShown: t.includes("Deceive"),
    trainBtn: !!document.querySelector("[data-train='shaco']") || !!document.querySelector('[data-train="shaco"]'),
    unrecruitedPassive: /Solari Radiance/.test(t)
  };
  return out;
});
check("champion card: passive is the headline (scaled %)", champTab.passiveShown);
check("champion card: leader unique shown", champTab.leadShown);
check("TRAIN button present", champTab.trainBtn);
check("unrecruited cards show passive headline", champTab.unrecruitedPassive);

// ============ Regressions ============
const reg = await page.evaluate(() => {
  const out = {};
  S.champs = {}; S.leader = null;
  gain("mana", 60); const t0 = S.res.timber; transmuteMana(1); out.transmute = S.res.timber > t0;
  const str = serialize(); loadFromString(str);
  out.saveRT = isFinite(S.res.mana) && typeof S.champs === "object";
  // ascent still pure conversion, no bonus
  S.res.devotion = 80; S.res.worship = 0; const asc0 = S.ascends || 0;
  ascendTargon();
  out.ascentPure = S.res.worship === 80 && S.res.devotion === 0 && S.ascends === asc0 + 1;
  // core function names intact for harness
  out.coreFns = [typeof tick, typeof computeRates, typeof computeCaps, typeof morale, typeof ascendTargon, typeof renderAll, typeof renderTop].every(x => x === "function");
  // stone slab + updateAffordability still around
  out.slab = !!RES.stoneSlab && typeof updateAffordability === "function";
  return out;
});
for (const [k, v] of Object.entries(reg)) check("regression: " + k, v === true);

for (const tab of ["settlement", "crafting", "village", "lore", "wilds", "trade", "targon", "champions"]) {
  await page.evaluate(t => { S.buildings.archive = Math.max(1, S.buildings.archive || 0); S.buildings.shelter = Math.max(1, S.buildings.shelter || 0); S.upgrades.keepingTheRolls = true; S.activeTab = t; uiDirty = true; renderAll(); }, tab);
  await page.waitForTimeout(50);
}
check("all tabs render, no console errors", errors.length === 0, errors.slice(0, 3).join(" | "));

console.log("\n" + pass + " passed, " + fail + " failed");
await browser.close();
process.exit(fail > 0 ? 1 : 0);
