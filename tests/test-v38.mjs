import { chromium } from "playwright";
const browser = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium" }).catch(() => chromium.launch());
const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
const errors = [];
page.on("console", m => { if (m.type() === "error") errors.push(m.text()); });
page.on("pageerror", e => errors.push(String(e)));
await page.goto(new URL("../index.html", import.meta.url).href);
await page.waitForTimeout(500);
let pass = 0, fail = 0;
const check = (n, c, x) => { console.log(n + ":", c ? "PASS" : "FAIL", x ?? ""); c ? pass++ : fail++; };

// ===================== ITEM 3 — Worship out of the resource menus =====================
const i3 = await page.evaluate(() => {
  const o = {};
  o.notInRES = typeof RES.worship === "undefined";
  o.noStaleReads = !/S\.res\.worship/.test(document.documentElement.innerHTML);
  // the whole loop still works off S.worship
  loadFromString(btoa(unescape(encodeURIComponent(JSON.stringify(freshState())))));
  o.freshIsZero = S.worship === 0;
  S.res.devotion = 500;
  ascendTargon();
  o.ascentBanks = S.worship === 500 && S.res.devotion === 0;
  S.wtechs = { convergence: true };
  // v0.40 Part 2.4: coefficient 0.05 -> 0.01 (Kittens parity). The property this guards
  // is that worshipBonus reads S.worship, not S.res.worship — the coefficient is incidental.
  // v0.42 set the stripe from a measured median (1000 -> 20,000). Read it from the live
  // function rather than restating it, so a future stripe change cannot break this again.
  o.bonusReadsIt = (function () {
    var m = worshipBonus.toString().match(/unlimitedDR\(S\.worship \|\| 0, (\d+)\)/);
    if (!m) return false;
    return Math.abs(worshipBonus() - 0.01 * unlimitedDR(500, +m[1])) < 1e-12 && worshipBonus() > 0;
  })();
  // threshold gating reads it too
  S.worship = 0; S.res.devotion = 9999; S.res.gold = 9999;
  buyWtech("sunAltar");
  o.blockedBelowThreshold = !S.wtechs.sunAltar;
  S.worship = 400;
  buyWtech("sunAltar");
  o.allowedAtThreshold = S.wtechs.sunAltar === true;
  // it must not reappear in the sidebar
  S.worship = 5000; renderTop(computeRates());
  o.notInSidebar = !document.getElementById("resource-col").textContent.includes("Worship");
  // but the Targon tab still shows it
  S.techs = { ritesOfTargon: 1 }; S.activeTab = "targon"; uiDirty = true; renderAll();
  o.stillOnTargonTab = document.getElementById("tab-content").textContent.includes("Worship");
  return o;
});
check("Worship removed from RES entirely", i3.notInRES);
check("no stale S.res.worship reads anywhere in the file", i3.noStaleReads);
check("Ascent banks into S.worship", i3.freshIsZero && i3.ascentBanks);
check("worshipBonus() and the wtech threshold both read S.worship", i3.bonusReadsIt && i3.blockedBelowThreshold && i3.allowedAtThreshold);
check("Worship gone from the sidebar, still shown on the Targon tab", i3.notInSidebar && i3.stillOnTargonTab);

const i3mig = await page.evaluate(() => {
  const data = JSON.parse(decodeURIComponent(escape(atob(serialize()))));
  delete data.worship; data.res.worship = 7777;
  loadFromString(btoa(unescape(encodeURIComponent(JSON.stringify(data)))));
  return S.worship;
});
check("old saves carry S.res.worship across to S.worship", i3mig === 7777, String(i3mig));

// ===================== ITEM 1 — the reserve floor is gone =====================
const i1 = await page.evaluate(() => {
  const o = {};
  o.comfortExists = typeof LUXURY_COMFORT !== "undefined" && LUXURY_COMFORT === 25;
  o.floorGone = typeof LUXURY_FLOOR === "undefined";
  o.blocksGone = typeof caravanLuxuryBlock === "undefined" && typeof craftLuxuryBlock === "undefined";
  // v0.39 §9.2: the fixed comfort constant became a population-scaled demand function
  // v0.40 Part 2.1 cut the jackbox branch, so the term reads S.res[r] directly
  o.moraleUsesComfort = /S\.res\[r\] \/ luxuryComfort\(\)/.test(morale.toString());
  // crafting can now spend a luxury all the way down
  S.techs = { songcraft: 1 }; S.buildings = {}; S.upgrades = {}; S.policies = {}; S.champs = {}; S.wanderers = [];
  invalidateCensus(); S.seenMax.parchment = 1;
  // v0.39 §7 raised Parchment to 175 furs (Kittens parity); the point of the check is
  // that crafting spends a luxury all the way down, so scale the stock to two crafts.
  // v0.40 also added plumes as quills, so stock both inputs
  // v0.41 §2.4 took plumes back out of Parchment (exact Kittens parity), so stock
  // whatever the live recipe actually asks for.
  const pc = craftCostOf("parchment");
  for (const r in pc) S.res[r] = pc[r] * 2;
  S.res.parchment = 0;
  craftItem("parchment", 2);
  o.craftSpendsToZero = S.res.furs === 0 && S.res.parchment > 0;
  // and so can a caravan. v0.41 §2.6 rebuilt every faction cost table, so read the
  // live one rather than assuming Freljord still charges furs.
  S.techs.trade = true; S.factionsFound = { freljord: true }; S.tradeFatigue = {};
  const f = FACTIONS.find(x => x.id === "freljord");
  for (const r in f.cost) S.res[r] = f.cost[r];
  const before = Object.fromEntries(Object.keys(f.cost).map(r => [r, S.res[r]]));
  tradeCaravan("freljord");
  o.tradeSpendsToZero = Object.keys(f.cost).every(r => S.res[r] <= before[r] - f.cost[r] + 1e-9);
  return o;
});
check("LUXURY_COMFORT = 25 replaces LUXURY_FLOOR", i1.comfortExists && i1.floorGone);
check("both reserve-block functions removed", i1.blocksGone);
// SUPERSEDED v0.45, Jerry's directive 3. morale() no longer reads luxuryComfort() at
// all — Kittens pays a flat +10 per luxury HELD (js/village.js updateHappines, gated on
// `value > 0` with no quantity term). luxuryComfort() survives as the Festival's
// mushroom price and as the reporting scale, not as a morale ramp.
check("morale no longer ramps on luxuryComfort — the flat rule replaced it",
  !i1.moraleUsesComfort, `moraleUsesComfort=${i1.moraleUsesComfort}`);
check("crafting can now spend a luxury to zero", i1.craftSpendsToZero);
check("trading can now spend a luxury to zero", i1.tradeSpendsToZero);

const ramp = await page.evaluate(() => {
  S.pop = 10; S.buildings = {}; S.jackboxes = 0; S.wtechs = {}; S.wanderers = []; invalidateCensus();
  const at = v => { ["mushrooms", "furs", "plumes", "poros", "trueice"].forEach(r => S.res[r] = 0); S.res.furs = v; return morale(); };
  const none = at(0);
  // v0.39 §9.2: the ramp's full-payout point is luxuryComfort(), which scales with pop.
  const C = luxuryComfort();
  return { at0: none, C, atFifth: at(C / 5) - none, atHalf: at(C / 2) - none, atFull: at(C) - none, at999: at(999999) - none };
});
// SUPERSEDED v0.45, Jerry's directive 3. The ramp is gone; every non-zero stock pays
// the same flat +10. This is the same measurement with the opposite expectation, kept
// rather than deleted because it is the sharpest statement of what changed.
check("the ramp is gone — every non-zero stock pays the same flat +10",
  ramp.atFifth === 10 && ramp.atHalf === 10 && ramp.atFull === 10 && ramp.at999 === 10,
  `comfort ${ramp.C}: 1/5 +${ramp.atFifth}, 1/2 +${ramp.atHalf}, full +${ramp.atFull}, hoard +${ramp.at999}`);

// ===================== ITEM 4 — the Wilds redesign =====================
const i4 = await page.evaluate(() => {
  const o = { bonus: CHARGE_BONUS, chargeBonus: CHARGE_BONUS, regen: CHARGE_REGEN_S, maxCharges: CAMP_MAX_CHARGES };
  const camp = id => EXPEDITIONS.find(e => e.id === id);
  o.resourceCampsNoCooldown = ["wolves", "gromp", "raptors", "krugs"].every(id => !camp(id).cooldown);
  o.othersKeepCooldown = camp("blueSentinel").cooldown === 600 && camp("redBrambleback").cooldown === 600 &&
    camp("drakeHunt").cooldown === 600 && camp("baron").cooldown === 900 &&
    // v0.41 §2.3: the Abyss journey is no longer in this list — it lost its 300 s
    // cooldown and joined the charge layer at 200 s regen.
    camp("scouting").cooldown === 900 && camp("voidExpedition").cooldown === 300;
  o.isChargeCamp = ["wolves", "gromp", "raptors", "krugs"].every(id => isChargeCamp(camp(id))) &&
    !isChargeCamp(camp("drakeHunt")) && !isChargeCamp(camp("baron"));
  return o;
});
// v0.41 §2.3 adds the Abyss journey to the charge layer at 200 s regen — it lost its
// 300 s cooldown, so Poros and True Ice are vigor-bound like the four camps. The four
// original camps are unchanged.
check("CHARGE_BONUS 3.0, 2 charges, the four camps still at 90/120/150/180",
  i4.chargeBonus === 3.0 && i4.maxCharges === 2 &&
  i4.regen.wolves === 90 && i4.regen.gromp === 120 && i4.regen.raptors === 150 && i4.regen.krugs === 180,
  JSON.stringify(i4.regen));
check("the four resource camps have no cooldown", i4.resourceCampsNoCooldown && i4.isChargeCamp);
check("every other camp keeps its cooldown unchanged (Abyss moved to charges in v0.41)", i4.othersKeepCooldown);

const gate = await page.evaluate(() => {
  let now = 1700000000000; Date.now = () => now;
  const realRandom = Math.random; Math.random = () => 0.5;   // roll is always 7 furs
  S.techs = { logistics: 1 }; S.campSlots = {}; S.buildings = {}; S.jobs = {}; S.upgrades = {};
  S.policies = {}; S.champs = {}; S.wanderers = []; invalidateCensus();
  const e = EXPEDITIONS.find(x => x.id === "wolves");
  const o = { startCharges: campCharges(e), neverBlocks: [] };
  const yields = [];
  for (let i = 0; i < 6; i++) {
    S.res.vigor = 1000; S.res.furs = 0;
    o.neverBlocks.push(campCooldownLeft(e));
    runExpedition("wolves");
    yields.push({ furs: S.res.furs, chargesLeft: campCharges(e) });
    now += 1000;
  }
  o.yields = yields;
  // the third hunt onward is unempowered and much smaller
  o.firstTwoEmpowered = yields[0].furs === yields[2].furs * 3 && yields[1].furs === yields[2].furs * 3;
  o.chargesDrain = yields[0].chargesLeft === 1 && yields[1].chargesLeft === 0 && yields[2].chargesLeft === 0;
  o.stillHuntable = yields[5].furs > 0;
  // stagger two spends 50s apart so their regen timers are distinguishable
  S.campSlots = {}; now += 1000;
  S.res.vigor = 1000; runExpedition("wolves");          // slot expires at +90s
  now += 50000;
  S.res.vigor = 1000; runExpedition("wolves");          // slot expires at +140s
  o.drained = campCharges(e) === 0;
  now += 41000;                                          // t = +91s: first slot expired
  o.regeneratesOne = campCharges(e) === 1;
  now += 50000;                                          // t = +141s: both expired
  o.capsAtTwo = campCharges(e) === 2;
  now += 1e6;
  o.neverExceedsTwo = campCharges(e) === 2;
  Math.random = realRandom;
  return o;
});
check("a charge camp NEVER blocks — cooldownLeft is always 0", gate.neverBlocks.every(v => v === 0));
check("charges drain 2 → 1 → 0 and hunting continues regardless", gate.chargesDrain && gate.stillHuntable, JSON.stringify(gate.yields.map(y => y.furs)));
check("an empowered hunt yields far more than a routine one", gate.firstTwoEmpowered);
check("charges regenerate independently and cap at 2", gate.drained && gate.regeneratesOne && gate.capsAtTwo && gate.neverExceedsTwo);

const bonusExact = await page.evaluate(() => {
  let now = 1700000000000; Date.now = () => now;
  S.techs = { logistics: 1 }; S.campSlots = {}; S.buildings = {}; S.jobs = {}; S.upgrades = {};
  S.policies = {}; S.champs = {}; S.wanderers = []; invalidateCensus();
  const e = EXPEDITIONS.find(x => x.id === "wolves");
  // drain both charges, then compare mean yields with and without
  const realRandom = Math.random;
  Math.random = () => 0.5;          // deterministic roll: the ratio must be exactly 3
  const N = 20;
  let emp = 0, routine = 0;
  for (let i = 0; i < N; i++) {                       // always charged
    S.campSlots.wolves = []; S.res.vigor = 1000; S.res.furs = 0;
    runExpedition("wolves"); emp += S.res.furs; now += 1000;
  }
  for (let i = 0; i < N; i++) {                       // never charged
    S.campSlots.wolves = [now + 1e9, now + 1e9]; S.res.vigor = 1000; S.res.furs = 0;
    runExpedition("wolves"); routine += S.res.furs; now += 1000;
  }
  Math.random = realRandom;
  return { ratio: (emp / N) / (routine / N), nEmp: N, nRoutine: N };
});
check("an empowered hunt yields exactly ×3", Math.abs(bonusExact.ratio - 3) < 1e-9, `×${bonusExact.ratio.toFixed(2)} over ${bonusExact.nEmp} empowered / ${bonusExact.nRoutine} routine`);

const renown = await page.evaluate(() => {
  let now = 1700000000000; Date.now = () => now;
  S.techs = { logistics: 1, callToArms: 1, smelting: 1 }; S.campSlots = {};
  S.buildings = {}; S.jobs = {}; S.upgrades = {}; S.policies = {}; S.champs = {}; S.wanderers = [];
  invalidateCensus();
  let awarded = 0, hunts = 0;
  const real = gainRenown;
  gainRenown = n => { awarded += n; };
  for (let t = 0; t < 3600000; t += 1000) {
    now += 1000;
    ["wolves", "gromp", "raptors", "krugs"].forEach(id => { S.res.vigor = 1e6; runExpedition(id); hunts++; });
  }
  gainRenown = real;
  // the old system allowed 2 clears per cooldown window, each paying renown
  const oldRate = 2 * (3600 / 90 * 2 + 3600 / 120 * 2 + 3600 / 150 * 3 + 3600 / 180 * 3);
  return { hunts, awarded, oldRate };
});
check("Renown is rate-limited to the charge, not to the hunt", renown.awarded < renown.hunts / 10,
  `${renown.hunts} hunts/game-hour but only ${renown.awarded} renown`);
check("Renown income is UNCHANGED by removing the cooldowns", Math.abs(renown.awarded - renown.oldRate) < 1,
  `${renown.awarded}/hour now vs ${renown.oldRate}/hour before`);

// ===================== ITEM 5 — luxury supply and demand =====================
const i5 = await page.evaluate(() => {
  S.buildings = {}; S.jobs = {}; S.upgrades = {}; S.policies = {}; S.champs = {}; S.wanderers = [];
  invalidateCensus();
  const drain = pop => { S.pop = pop; S.res.furs = 500; S.seenMax.furs = 500; return -computeRates().furs; };
  const d30 = drain(30), d60 = drain(60), d300 = drain(300);
  S.pop = 0; S.res.furs = 0;
  const w = EXPEDITIONS.find(e => e.id === "wolves").run.toString();
  const r = EXPEDITIONS.find(e => e.id === "raptors").run.toString();
  return {
    linear30: d30 / (0.002 * 30), linear60: d60 / (0.002 * 60), linear300: d300 / (0.002 * 300),
    noSqrt: !/Math\.sqrt\(S\.pop\)/.test(computeRates.toString()),
    // v0.40 Part 2.3 flattened all three luxury camps to 100 vigor and raised Wolves and
    // Gromp to hold the ~6.3 vigor-per-unit parity line. Raptors were already at 100.
    // v0.55 Part 8 RE-POINT: every roll inside an expedition now goes through `rerollAmt`,
    // which returns the FLOOR under the undo penalty and Math.random() otherwise. The RANGES
    // are what this assertion is about and they are unchanged; only the roll source moved.
    // Superseded by: v0.55 Part 8.
    wolvesRange: /12 \+ Math\.floor\(rerollAmt\("hunt"\) \* 8\)/.test(w),
    raptorRange: /12 \+ Math\.floor\(rerollAmt\("hunt"\) \* 7\)/.test(r)
  };
});
check("demand is linear in population again (identical ratio at 30 / 60 / 300)",
  [i5.linear30, i5.linear60, i5.linear300].every(v => Math.abs(v - 1) < 1e-9) && i5.noSqrt);
check("Wolves 12-19 furs, Raptors 12-18 plumes (v0.40 Part 2.3)", i5.wolvesRange && i5.raptorRange);

const perUnit = await page.evaluate(() => {
  S.buildings = {}; S.jobs = {}; S.upgrades = {}; S.policies = {}; S.champs = {}; S.wanderers = [];
  S.techs = { logistics: 1 }; S.campSlots = {}; invalidateCensus();
  let now = 1700000000000; Date.now = () => now;
  const measure = (id, res) => {
    let total = 0, cost = 0;
    for (let i = 0; i < 300; i++) {
      S.res.vigor = 1e6; S.res[res] = 0;
      const v0 = S.res.vigor;
      // force routine (unempowered) hunts so this measures the base rate
      S.campSlots[id] = [now + 1e9, now + 1e9];
      runExpedition(id);
      total += S.res[res]; cost += v0 - S.res.vigor;
      now += 1000;
    }
    return +(cost / total).toFixed(2);
  };
  return { wolves: measure("wolves", "furs"), gromp: measure("gromp", "mushrooms"), raptors: measure("raptors", "plumes") };
});
check("all three luxury camps now cost ~6.5 vigor per unit (was Raptors 28.6)",
  Math.max(perUnit.wolves, perUnit.gromp, perUnit.raptors) / Math.min(perUnit.wolves, perUnit.gromp, perUnit.raptors) < 1.35,
  `wolves ${perUnit.wolves}  gromp ${perUnit.gromp}  raptors ${perUnit.raptors}`);

// ===================== ITEM 2 — the proportionality check =====================
const i2 = await page.evaluate(() => {
  const scores = [];
  BUILDINGS.forEach(b => {
    let effect = 0;
    if (b.boost) for (const r in b.boost) effect += b.boost[r];
    if (b.jobBoost) for (const j in b.jobBoost) effect += b.jobBoost[j];
    if (b.globalBoost) effect += b.globalBoost * 4;   // globals multiply everything
    if (!effect) return;
    scores.push({ id: b.id, ratio: b.ratio, effect: +effect.toFixed(3), score: +(effect / (b.ratio - 1)).toFixed(2) });
  });
  scores.sort((a, b) => b.score - a.score);
  return scores;
});
const hi = i2[0], lo = i2[i2.length - 1];
console.log("  proportionality (effect per copy / (ratio-1)):");
i2.forEach(s => console.log(`    ${s.id.padEnd(14)} ratio ${s.ratio}  effect ${s.effect}  score ${s.score}`));
// v0.51 Part 2.6. Deleted, not widened. Kittens assigns priceRatio by what a building IS,
// not by the size of its effect — aqueduct 0.03 at 1.12 scores 0.25, barn 1.75 with no
// effect at all, hut 2.50. The rule this asserted does not exist in the source, and a
// bound widened twice to admit verbatim copies of source buildings is measuring nothing.
// The defect class it was reaching for is covered by auditCostGraph/auditRawGraph.
// The score dump above is kept as a DIAGNOSTIC — it prints, it does not assert.
console.log(`  (spread ${hi.id} ${hi.score} vs ${lo.id} ${lo.score} = ${(hi.score / lo.score).toFixed(1)}x — printed, not asserted)`);

// ===================== regressions =====================
const reg = await page.evaluate(() => {
  const o = {};
  loadFromString(btoa(unescape(encodeURIComponent(JSON.stringify(freshState())))));
  o.saveRT = (() => { S.worship = 123; loadFromString(serialize()); return S.worship === 123; })();
  // v0.40 Part 2.2: the relief limit became MORALE_RELIEF_LIMIT = 0.88
  o.moraleIntact = /Math\.max\(25, Math\.round\(m\)\)/.test(morale.toString()) &&
    /limitedDR\(bfield\("bardsHearth", "crowdRelief"\) \* count\("bardsHearth"\), MORALE_RELIEF_LIMIT\)/.test(morale.toString());   // v0.52 Part 2.3: tavern -> bardsHearth
  o.ascentStillFree = (() => {
    loadFromString(btoa(unescape(encodeURIComponent(JSON.stringify(freshState())))));
    S.res.devotion = 80; const a0 = S.ascends || 0; ascendTargon();
    return S.worship === 80 && S.res.devotion === 0 && S.ascends === a0 + 1;
  })();
  o.coreFns = [tick, computeRates, computeCaps, morale, ascendTargon, renderAll, renderTop].every(f => typeof f === "function");
  o.noNaNRates = Object.values(computeRates()).every(v => isFinite(v));
  o.noNaNCaps = Object.values(computeCaps()).every(v => isFinite(v));
  // SUPERSEDED v0.46 Part 5: Cultivation is Kittens' agriculture at 100.
  o.techCurve = TECHS.find(t => t.id === "cultivation").cost.knowledge === 100 &&
    TECHS.find(t => t.id === "songcraft").cost.knowledge === 1300;
  return o;
});
for (const [k, v] of Object.entries(reg)) check("regression: " + k, v === true);

for (const tab of ["settlement", "crafting", "village", "lore", "wilds", "trade", "targon", "champions"]) {
  await page.evaluate(t => {
    S.techs = { almanac: 1, cultivation: 1, woodcraft: 1, logistics: 1, mining: 1, trade: 1, smelting: 1, songcraft: 1, ritesOfTargon: 1, callToArms: 1, masquerade: 1 };
    S.pop = 20; syncRoster(); S.seenMax.knowledge = 999; S.worship = 2000;
    S.buildings.archive = Math.max(1, S.buildings.archive || 0); S.buildings.shelter = Math.max(1, S.buildings.shelter || 0); S.upgrades.keepingTheRolls = true; S.activeTab = t; uiDirty = true; renderAll();
  }, tab);
  await page.waitForTimeout(40);
}
check("all 8 tabs render, no console errors", errors.length === 0, errors.slice(0, 3).join(" | "));

console.log("\n" + pass + " passed, " + fail + " failed");
await browser.close();
process.exit(fail > 0 ? 1 : 0);
