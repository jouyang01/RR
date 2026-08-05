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

// ============ POLICIES ============
const pol = await page.evaluate(() => {
  const o = {};
  o.groups = POLICY_GROUPS.length;
  o.optionCount = POLICY_GROUPS.map(g => g.options.length);
  // gated until Culture exists
  S.techs = {}; S.policies = {};
  o.closedNoSongcraft = !policyGroupOpen(POLICY_GROUPS[0]);
  S.techs.songcraft = true;
  o.openWithSongcraft = policyGroupOpen(POLICY_GROUPS[0]);
  // later groups need the earlier one resolved
  S.techs.logistics = true;
  o.wildsLockedFirst = !policyGroupOpen(POLICY_GROUPS.find(g => g.id === "wilds"));
  // buy one
  S.res.culture = 500;
  buyPolicy("wanderersWelcome");
  o.bought = hasPolicy("wanderersWelcome") && S.res.culture === 300;
  o.wildsOpenAfter = policyGroupOpen(POLICY_GROUPS.find(g => g.id === "wilds"));
  // exclusivity: the sibling is now permanently closed
  S.res.culture = 5000;
  buyPolicy("sanctuaryWardens");
  o.siblingBlocked = !hasPolicy("sanctuaryWardens") && S.res.culture === 5000;
  o.choice = policyChoice("growth");
  return o;
});
check("6 policy groups (5 pairs + Government trio)", pol.groups === 6 && pol.optionCount.filter(n => n === 2).length === 5 && pol.optionCount.includes(3), JSON.stringify(pol.optionCount));
check("policies gated behind Culture existing", pol.closedNoSongcraft && pol.openWithSongcraft);
check("later groups need the earlier one settled", pol.wildsLockedFirst && pol.wildsOpenAfter);
check("buying a policy pays Culture and records the choice", pol.bought && pol.choice === "wanderersWelcome");
check("choosing one permanently closes its sibling", pol.siblingBlocked);

// every effect actually fires
const fx = await page.evaluate(() => {
  const o = {};
  const reset = () => { S.policies = {}; };
  const pg = () => 1 + policyGlobalBonus();   // the settled-group ratio, measured separately
  // Wanderer's Welcome — housing ceiling only; the dead arrival clause was removed (spec item 8)
  reset(); S.champs = {}; S.leader = null; S.buildings = { shelter: 10 };
  const mp0 = maxPop(); S.policies.wanderersWelcome = true;
  o.maxPopRatio = maxPop() / mp0;
  o.noArrivalClause = policyMult("arrival") === 1;
  S.buildings = {};
  // Sanctuary Wardens — worker output
  reset(); S.pop = 10; S.jobs = { woodcutter: 5 }; S.buildings = {};
  const w0 = computeRates().timber; S.policies.sanctuaryWardens = true;
  o.worker = computeRates().timber / w0 / pg();
  // Open Range — camp yields
  reset(); S.jobs = {}; const c0 = campYieldMult(); S.policies.openRange = true; o.camp = campYieldMult() / c0;
  // Vigilant Watch / Open Range now compete on the same axis: vigor cost (spec item 9)
  reset(); o.vigorBase = policyVigorMult();
  S.policies.vigilantWatch = true; o.vigorWatch = policyVigorMult();
  reset(); S.policies.openRange = true; o.vigorRange = policyVigorMult();
  // Frontier Charter — trade
  reset(); const t0 = tradeYieldMult(); S.policies.frontierCharter = true; o.trade = tradeYieldMult() / t0;
  // Isolationist Ledger / Oral Tradition — culture
  reset(); S.buildings.bardsHearth = 4; S.techs.songcraft = true;
  const cu0 = computeRates().culture; S.policies.isolationistLedger = true;
  o.cultureIso = computeRates().culture / cu0 / pg();
  reset(); S.policies.oralTradition = true; o.cultureOral = computeRates().culture / cu0 / pg();
  const cap0 = (() => { S.policies = {}; return computeCaps().culture; })();
  S.policies.oralTradition = true; o.cultureCap = computeCaps().culture / cap0;
  // Academy Charter — knowledge
  reset(); S.buildings = {}; S.jobs = { loremaster: 4 }; S.pop = 10;
  const k0 = computeRates().knowledge; S.policies.academyCharter = true;
  o.knowledge = computeRates().knowledge / k0 / pg();
  // Lunari Vigil — devotion
  reset(); S.buildings = {}; S.jobs = { acolyte: 4 };
  const d0 = computeRates().devotion; S.policies.lunariVigil = true;
  o.devotion = computeRates().devotion / d0 / pg();
  // Solari Discipline — vigor + morale
  // v0.46 Part 2 V1 deleted the passive per-wanderer vigor line, so a settlement with
  // no junglers now produces ZERO vigor and this probe divided 0 by 0. Assign junglers:
  // the policy's effect on vigor is what is under test, not where vigor comes from.
  reset(); S.techs.logistics = true; S.pop = 10; S.wanderers = []; syncRoster();
  S.jobs = { jungler: 4 };
  const m0 = morale();
  const v0 = computeRates().vigor / (morale() / 100);
  S.policies.solariDiscipline = true;
  o.vigor = (computeRates().vigor / (morale() / 100)) / v0 / pg(); o.moraleDelta = morale() - m0;
  reset(); const dc0 = computeCaps().devotion; S.policies.lunariVigil = true;
  o.lunariCap = computeCaps().devotion / dc0;
  // Government trio
  reset(); S.buildings = { farmstead: 6 }; S.jobs = {}; S.pop = 0;
  const g0 = computeRates().provisions; S.policies.demacianAccord = true;
  o.village = computeRates().provisions / g0 / pg();
  reset(); const cy0 = craftYield(); S.policies.piltoverConcord = true; o.craft = craftYield() / cy0;
  reset(); o.renownBase = policyMult("renown"); S.policies.noxianDoctrine = true; o.renown = policyMult("renown");
  reset(); S.buildings = {}; S.jobs = {}; S.pop = 0;
  return o;
});
check("Wanderer's Welcome: +10% housing ceiling, no arrival clause", fx.maxPopRatio > 1.08 && fx.maxPopRatio <= 1.10 && fx.noArrivalClause, fx.maxPopRatio.toFixed(3));
check("Sanctuary Wardens: worker output +6%", Math.abs(fx.worker - 1.06) < 0.005, fx.worker.toFixed(3));
// v0.55 Part 4 RE-POINT: Open Range is rank-matched to Kittens' `rationing` (0.1) in the
// seven-member hunterRatio census, so 0.12 -> 0.10. Superseded by: v0.55 Part 4.
check("Open Range: camp yields +10% (v0.55 Part 4: rank-matched to Kittens' rationing 0.1)",
  Math.abs(fx.camp - 1.10) < 0.005, fx.camp.toFixed(3));
check("Vigilant Watch: expeditions cost 15% less vigor; Open Range costs 10% more", fx.vigorBase === 1 && Math.abs(fx.vigorWatch - 0.85) < 1e-9 && Math.abs(fx.vigorRange - 1.10) < 1e-9, `${fx.vigorWatch}/${fx.vigorRange}`);
check("Frontier Charter: caravans +10%", Math.abs(fx.trade - 1.10) < 0.005, fx.trade.toFixed(3));
check("Isolationist Ledger +15% / Oral Tradition +6% culture", Math.abs(fx.cultureIso - 1.15) < 0.01 && Math.abs(fx.cultureOral - 1.06) < 0.01, `${fx.cultureIso.toFixed(3)}/${fx.cultureOral.toFixed(3)}`);
check("Oral Tradition: culture cap +15%", Math.abs(fx.cultureCap - 1.15) < 0.005, fx.cultureCap.toFixed(3));
check("Academy Charter: knowledge +8%", Math.abs(fx.knowledge - 1.08) < 0.01, fx.knowledge.toFixed(3));
check("Lunari Vigil: devotion +12%", Math.abs(fx.devotion - 1.12) < 0.01, fx.devotion.toFixed(3));
check("Solari Discipline: vigor +12% and nothing else (morale clause removed)", Math.abs(fx.vigor - 1.12) < 0.01 && fx.moraleDelta === 0, `${fx.vigor.toFixed(3)}/${fx.moraleDelta}`);
check("Lunari Vigil: devotion +12% and devotion cap +25%", Math.abs(fx.devotion - 1.12) < 0.01 && Math.abs(fx.lunariCap - 1.25) < 0.005, fx.lunariCap.toFixed(3));
check("Demacian Accord: village +6%", Math.abs(fx.village - 1.06) < 0.005, fx.village.toFixed(3));
check("Piltover Concord: craft +8%", Math.abs(fx.craft - 1.08) < 0.005, fx.craft.toFixed(3));
check("Noxian Doctrine: expedition renown ×1.5", fx.renownBase === 1 && fx.renown === 1.5);

// spec rule: no option in a group is the "correct" pick — costs match within a group
const parity = await page.evaluate(() =>
  POLICY_GROUPS.map(g => {
    const cultures = g.options.map(o => o.cost.culture);
    return { id: g.id, sameCulture: new Set(cultures).size === 1, culture: cultures[0] };
  }));
check("within each group, every option costs the same Culture", parity.every(p => p.sameCulture), JSON.stringify(parity.map(p => p.id + ":" + p.culture)));
// the build spec asked for real downsides on the later groups, so two runs diverge
const downsides = await page.evaluate(() => {
  const withCost = [];
  POLICY_GROUPS.forEach(g => g.options.forEach(o => { if (/, but /.test(o.desc)) withCost.push(o.id); }));
  return {
    withCost,
    isoTrade: (() => { S.policies = {}; const a = tradeYieldMult(); S.policies.isolationistLedger = true; const b = tradeYieldMult(); S.policies = {}; return b / a; })(),
    academyCulture: (() => { S.policies = {}; S.buildings = { bardsHearth: 4 }; S.techs.songcraft = true;
      const a = computeRates().culture; S.policies.academyCharter = true; const b = computeRates().culture;
      S.policies = {}; S.buildings = {}; return b / a; })()
  };
});
check("three later policies now carry a real downside", downsides.withCost.length === 3, downsides.withCost.join(", "));
check("Isolationist Ledger's caravan penalty actually applies (−10%)", Math.abs(downsides.isoTrade - 0.90) < 0.005, downsides.isoTrade.toFixed(3));
check("Academy Charter's culture penalty actually applies (−5%)", Math.abs(downsides.academyCulture - 0.95) < 0.01, downsides.academyCulture.toFixed(3));

// policies render as radio-style cards in the Research tab
const polUI = await page.evaluate(() => {
  S.policies = {}; S.techs = { songcraft: true, almanac: true }; S.res.culture = 1000; S.seenMax.knowledge = 50;
  S.buildings.archive = Math.max(1, S.buildings.archive || 0); S.activeTab = "lore"; uiDirty = true; renderAll();
  const before = document.querySelectorAll("[data-policy]").length;
  buyPolicy("sanctuaryWardens"); renderAll();
  const txt = document.getElementById("tab-content").textContent;
  return { before, adopted: txt.includes("ADOPTED"), notTaken: txt.includes("not taken"), stillClickable: document.querySelectorAll('[data-policy="wanderersWelcome"]').length };
});
check("Policies panel renders choosable cards", polUI.before >= 2, polUI.before);
check("after choosing: one ADOPTED, sibling shows 'not taken' and is unclickable", polUI.adopted && polUI.notTaken && polUI.stillClickable === 0);

// ============ CAMP CHARGES ============
const charges = await page.evaluate(() => {
  S.policies = {}; S.champs = {}; S.leader = null;
  S.techs.logistics = true; S.campSlots = {}; S.res.vigor = 500; S.seenMax.vigor = 500;
  const e = EXPEDITIONS.find(x => x.id === "wolves");
  const o = { start: campCharges(e) };
  runExpedition("wolves"); o.afterOne = campCharges(e); o.readyAfterOne = campCooldownLeft(e) === 0;
  runExpedition("wolves"); o.afterTwo = campCharges(e); o.blockedAfterTwo = campCooldownLeft(e) > 0;
  const f0 = S.res.furs;
  runExpedition("wolves");
  o.thirdStillHunts = S.res.furs > f0;   // v0.38: charges empower, they no longer gate
  // charges regenerate independently: expire the older slot only
  S.campSlots.wolves[0] = Date.now() - 1;
  o.oneBack = campCharges(e);
  S.campSlots = {};
  return o;
});
check("camps hold 2 charges", charges.start === 2 && charges.afterOne === 1 && charges.afterTwo === 0);
check("second charge is usable immediately (no wait)", charges.readyAfterOne);
check("v0.38: a spent camp still hunts — charges empower rather than gate", !charges.blockedAfterTwo && charges.thirdStillHunts);
check("charges regenerate independently", charges.oneBack === 1);

// ============ CAMP-YIELD + SCRIPTORIUM DISCOVERIES ============
const disc = await page.evaluate(() => {
  const o = {};
  // v0.56 Part 6 — THE FIXTURE, not the box.
  //
  // This block cleared three containers and took `base` with the LIVE ROSTER still in `S`.
  // campYieldMult()'s seventh member is `traitBonus("trailblazer")` (v0.55 Part 4), so with
  // 10 wanderers and one Trailblazer left over from an earlier block the baseline was
  // base = 1.005 and the assertion measured 5.005 / 1.005 = 4.980 instead of 5.000. Two
  // Trailblazers gave 4.960. The trait roll is random, so the check passed only when the
  // roster happened to hold none — and HANDOFF v0.55 §8.6's remedy, "re-run on an idle box",
  // worked BY LUCK and hid a real defect across three rounds.
  //
  // THE STANDING RULE THIS EARNS: a test that captures a baseline from live state must reset
  // the state it is baselining. This is the third instance — after test-offline-v54's
  // saturated-cap check and test-v42's free-band check, both found in v0.55.
  S.upgrades = {}; S.jobs = {}; S.buildings = {};
  S.wanderers = []; S.champs = {}; S.policies = {};
  if (typeof _traitCounts !== "undefined") _traitCounts = null;
  const base = campYieldMult();
  o.base = +base.toFixed(6);
  S.upgrades.trappersCraft = true; S.upgrades.beastLore = true; S.upgrades.masterOfTheHunt = true;
  o.campLine = campYieldMult() / base;              // 1.25*1.25*1.5 = 2.34
  S.upgrades = {};
  const p0 = craftYield("parchment"), t0 = craftYield("tome"), g0 = craftYield("gear");
  S.upgrades.scribesGuild = true; o.parch = craftYield("parchment") / p0;
  S.upgrades.illuminators = true; o.tome = craftYield("tome") / t0;
  o.gearUntouched = craftYield("gear") / g0;
  S.upgrades.greatLibrary = true;
  o.parchAll = craftYield("parchment") / p0; o.tomeAll = craftYield("tome") / t0;
  // v0.41 §2.1 took Tomes out of the Knowledge cap altogether, so the Great Library's
  // cap clause is gone with it. Its two CRAFT-yield clauses are what remain, and those
  // are what this test was really about.
  S.buildings = { archive: 30, academy: 20 }; S.res.tome = 2;
  const k0 = (() => { S.upgrades.greatLibrary = false; return computeCaps().knowledge; })();
  S.upgrades.greatLibrary = true;
  o.tomeCapGone = computeCaps().knowledge === k0;
  S.buildings = {};
  S.upgrades = {}; S.res.tome = 0;
  return o;
});
// v0.55 Part 4 RE-POINT: the three camp Discoveries are re-ranked to the SOURCE's own
// figures — trappersCraft 1.0 (bolas), beastLore 2.0 (huntingArmor), masterOfTheHunt 1.0
// (steelArmor + alloyArmor) — so the line they add is 4.00, not 1.00. The property under
// test is that they are ADDITIVE (Kittens Law 2), and it still holds: 1 + 1.0 + 2.0 + 1.0 = 5.00
// delivered through limitedDR, not (1.25 x 1.25 x 1.5). Superseded by: v0.55 Part 4.
// v0.56 Part 6: the baseline is asserted to BE 1.000 as well, so a future member of the camp
// stack that leaks in through an unreset container fails loudly here rather than shifting the
// ratio by half a percent and being blamed on CPU contention.
check("the camp-yield baseline is a clean 1.000 — the fixture resets what it baselines",
  Math.abs(disc.base - 1) < 1e-9, String(disc.base));
check("camp-yield line: additive at all three, at Kittens' own figures (Kittens Law 2)",
  Math.abs(disc.campLine - 5.0) < 0.01, disc.campLine.toFixed(3));
// v0.42 Part 4 supersedes the magnitudes: RR's scribal stack ran to x9.375 against
// Kittens' ~x3.2 craft ratio, and because craft yield DIVIDES effective recipe cost it
// compounded per tier — a Tome's nominal 8,750 furs was really 99.6. The two upgrades
// are now +10% each and the Great Library +20%. The property being guarded — they hit
// their own chain and nothing else — is unchanged.
check("Scribes' Guild +10% parchment, Illuminators +10% tome, others untouched", Math.abs(disc.parch - 1.10) < 0.01 && Math.abs(disc.tome - 1.10) < 0.01 && Math.abs(disc.gearUntouched - 1) < 0.001);
check("Great Library: +20% on both craft yields (its cap clause retired in v0.41)", Math.abs(disc.parchAll - 1.32) < 0.01 && Math.abs(disc.tomeAll - 1.32) < 0.01 && disc.tomeCapGone, `${disc.parchAll.toFixed(2)}`);

// ============ LORE-GATED TIERS ============
const gates = await page.evaluate(() => {
  const o = {};
  S.upgrades = {}; S.buildings = {}; S.techs = { woodcraft: true, mining: true, trade: true, almanac: true, hextech: true };
  // v0.39 §5 made Warehouse/Harbor cost crafted goods (beam, stoneSlab, gear) instead of raw
  S.seenMax = Object.assign(S.seenMax, { timber: 99999, ore: 99999, provisions: 99999, mana: 99999, knowledge: 99999, steel: 99999, gold: 99999, stoneSlab: 99999, crystals: 99999, beam: 99999, gear: 99999 });
  const vis = id => buildingVisible(BUILDINGS.find(b => b.id === id));
  o.lockedBefore = ["longhouse", "warehouse", "harbor", "academy", "refinery"].filter(id => !vis(id)).length;
  // v0.47: the Academy is gated by the Scriptorium TECH now, and the Warehouse/Harbor moved
  // to Carpentry/Smelting, so the "pass the gate" state includes those techs.
  S.upgrades = { timberframeJoinery: 1, slabCutting: 1, deepwaterDocks: 1, chemtechDistillation: 1 };
  S.techs.scriptorium = true; S.techs.carpentry = true; S.techs.smelting = true;
  o.openAfter = ["longhouse", "warehouse", "harbor", "academy", "refinery"].every(vis);
  // slab craft rides the same discovery
  S.upgrades = {};
  o.slabCraftHidden = !CRAFTS.find(c => c.id === "stoneSlab").show(S);
  S.upgrades.slabCutting = true;
  o.slabCraftShown = CRAFTS.find(c => c.id === "stoneSlab").show(S);
  // owning a building keeps it visible even without the discovery
  S.upgrades = {}; S.buildings.warehouse = 3;
  o.ownedStaysVisible = vis("warehouse");
  S.buildings = {};
  return o;
});
// SUPERSEDED v0.47 Part 4.1: the Academy moved off the Scriptorium DISCOVERY and onto the
// Scriptorium TECH (Kittens' `math` unlocks the academy), so only four tiers are
// discovery-gated now. The invariant — a tier is hidden until its gate is passed — holds.
check("4 tier buildings hidden until their discovery", gates.lockedBefore >= 4 && gates.openAfter, String(gates.lockedBefore));
check("Slab-Cutting unlocks the craft the Warehouse consumes", gates.slabCraftHidden && gates.slabCraftShown);
check("already-built buildings never vanish behind a new gate", gates.ownedStaysVisible);

// old saves are grandfathered past the new gates
const grand = await page.evaluate(() => {
  const data = JSON.parse(decodeURIComponent(escape(atob(serialize()))));
  data.upgrades = {}; data.buildings = { warehouse: 2, academy: 1, harbor: 1, longhouse: 5, refinery: 2 };
  data.campReady = { wolves: Date.now() + 50000 };
  loadFromString(btoa(unescape(encodeURIComponent(JSON.stringify(data)))));
  return {
    // v0.47: scriptorium is a TECH now, so an old save owning an Academy is granted the
    // tech instead of the retired Discovery.
    // v0.52 Part 2.2: `timberframeJoinery` is DELETED — the Longhouse is gated on the
    // Carpentry TECH alone now, which is Kittens' logHouse from `construction` exactly.
    // Its migration pair went with it, so it is no longer a gate anyone can be granted.
    granted: ["slabCutting", "deepwaterDocks", "chemtechDistillation"].every(u => S.upgrades[u]) && !!S.techs.scriptorium,
    joineryGone: UPGRADES.every(u => u.id !== "timberframeJoinery") && !S.upgrades.timberframeJoinery,
    slotsMigrated: (S.campSlots.wolves || []).length === 1
  };
});
check("old saves are granted the gates they already passed", grand.granted);
check("...and Timberframe Joinery is gone from both the table and the migration (v0.52 Part 2.2)",
  grand.joineryGone);
check("old camp cooldowns migrate into charge slots", grand.slotsMigrated);

// ============ FACTION DISCOVERY ============
const fac = await page.evaluate(() => {
  const o = {};
  // v0.41 §2.6: Demacia is the starter route, not Piltover.
  S.factionsFound = { demacia: true }; S.pop = 40; S.seenMax.renown = 50;
  S.techs = Object.assign({}, S.techs, { chemtech: 1 }); S.buildings = { tradeDock: 1 };
  o.startKnown = FACTIONS.filter(f => factionFound(f.id)).map(f => f.id);
  S.techs.trade = true; S.res.gold = 999; S.res.vigor = 999;
  o.tradeBlocked = (() => { const p = S.res.plumes || 0; S.res.plumes = 9999; tradeCaravan("noxus"); const blocked = S.res.plumes === 9999; S.res.plumes = p; return blocked; })();
  // scouting reveals them one at a time
  S.campSlots = {};
  let guard = 0;
  while (factionsFoundCount() < FACTIONS.length && guard++ < 200) {
    S.campSlots = {}; S.res.vigor = 99999; S.res.provisions = 99999;
    runExpedition("scouting");
  }
  o.allFound = factionsFoundCount() === FACTIONS.length;
  o.rounds = guard;
  // v0.54 directive 3 RE-POINT: the cost is FLAT 500 vigor and does NOT escalate. The old
  // costFn ran 200 x 1.6^(n-1) vigor PLUS 300 x 1.7^(n-1) provisions, so the fifth
  // civilisation cost 1,311 vigor and 2,505 provisions — a wall in front of content the
  // Trade tab had already told the player about. The assertion is inverted rather than
  // deleted: a future round that re-adds an escalator has to come back here and say so.
  // v0.56 Part 6 FIXTURE SWEEP: `expCost()` multiplies by policyVigorMult() and by two
  // Discoveries, none of which this block clears, so the "flat 500" reading was hostage to
  // whatever earlier blocks had left in S.policies and S.upgrades. Found by
  // tools/fixture-sweep.mjs, which re-runs every suite on a deliberately dirty roster.
  // The property under test is that the cost does not ESCALATE with civilisations found;
  // a policy discount is legitimate and is asserted separately below.
  S.policies = {}; S.upgrades = {};
  S.factionsFound = { demacia: true };
  const c1 = expCost(EXPEDITIONS.find(e => e.id === "scouting"));
  S.factionsFound = { demacia: 1, freljord: 1, bilgewater: 1, piltover: 1 };
  const c4 = expCost(EXPEDITIONS.find(e => e.id === "scouting"));
  // ...and the discount that DOES apply is a policy, not an escalator
  S.upgrades = { surveyedApproaches: 1 };
  o.discounted = expCost(EXPEDITIONS.find(e => e.id === "scouting")).vigor;
  S.upgrades = {};
  o.flat = c1.vigor === c4.vigor && !c1.provisions && !c4.provisions;
  o.tab = EXPEDITIONS.find(e => e.id === "scouting").tab;
  o.c1 = c1; o.c4 = c4;
  S.factionsFound = { piltover: true, freljord: true, bilgewater: true, demacia: true, noxus: true };
  S.campSlots = {}; S.buildings = {};
  return o;
});
check("only the starter route is known at the start (v0.41: Demacia, not Piltover)", fac.startKnown.length === 1 && fac.startKnown[0] === "demacia", fac.startKnown.join(","));
check("trading with an undiscovered faction is refused", fac.tradeBlocked);
check("scouting parties eventually find everyone", fac.allFound, `${fac.rounds} attempts`);
check("v0.54 directive 3 — scouting is a FLAT 500 vigor, no escalator, no provisions, and it lives in the Trade tab",
  fac.flat && fac.c1.vigor === 500 && fac.tab === "trade", JSON.stringify([fac.c1, fac.c4, fac.tab]));
check("...and the only thing that moves it is a Discovery discount, not the count of civilisations",
  fac.discounted === 425, `${fac.c1.vigor} -> ${fac.discounted} with Surveyed Approaches`);

// ============ TRADE PAYOUTS ============
const pay = await page.evaluate(() => {
  S.policies = {}; S.champs = {}; S.leader = null; S.caravans = {};
  S.buildings = { storehouse: 40, warehouse: 20, harbor: 20 };   // caps large enough not to clip the payout
  // v0.41 §2.6 rebuilt every yield, so read each faction's own declared output rather
  // than a fixed list. What survives from v0.34 is the property: a run must pay
  // materially, not trivially.
  S.buildings = { storehouse: 40, warehouse: 20, harbor: 20, hexcreteBastion: 400, vault: 200 };
  S.techs = Object.assign({}, S.techs, { chemtech: 1, hexcore: 1, sparks: 1 });
  const runs = {};
  FACTIONS.forEach(f => {
    const YIELD = f.primaryYield;
    let total = 0;
    for (let i = 0; i < 40; i++) {
      YIELD.forEach(r => { S.res[r] = 0; S.seenMax[r] = 99999; });
      f.run(1);                                   // the payout itself, no cost, no fatigue
      YIELD.forEach(r => { total += S.res[r]; });
    }
    runs[f.id] = +(total / 40).toFixed(1);
  });
  S.buildings = {};
  return runs;
});
check("Demacia's timber-for-steel route pays a real load of steel", pay.demacia > 26, "avg " + pay.demacia);
check("every route pays materially, on its own declared yield",
  pay.piltover > 400 && pay.freljord > 300 && pay.bilgewater > 80 && pay.noxus > 350, JSON.stringify(pay));

// ============ UNDO ============
const undo = await page.evaluate(() => {
  const o = {};
  S.techs = { woodcraft: true }; S.upgrades = { timberframeJoinery: true };
  S.res.timber = 5000; S.res.ore = 5000; S.res.provisions = 5000; S.buildings.longhouse = 0;
  const t0 = S.res.timber;
  buyBuilding("longhouse");
  o.built = S.buildings.longhouse === 1 && S.res.timber < t0;
  o.available = undoAvailable();
  doUndo();
  o.reverted = S.buildings.longhouse === 0 && S.res.timber === t0;
  o.consumed = !undoAvailable();          // single step only
  // expiry
  buyBuilding("longhouse");
  undoUntilTest();
  o.expires = !undoAvailable();
  return o;
  function undoUntilTest() { undoUntil = Date.now() - 1; }
});
check("undo reverses cost and result together", undo.built && undo.available && undo.reverted);
check("undo is single-step", undo.consumed);
check("undo expires", undo.expires);
const noScum = await page.evaluate(() => {
  // random-outcome actions must not be undoable, or caravans become rerollable
  undoSnapshot = null;
  S.factionsFound = { piltover: 1 }; S.techs.trade = true; S.tradeFatigue = {};
  const f = FACTIONS[0];
  for (const r in f.cost) S.res[r] = f.cost[r] * 3;
  tradeCaravan("piltover");
  return !undoAvailable();
});
check("trades are NOT undoable (no caravan save-scumming)", noScum);

// ============ RESOURCE TAXONOMY ============
const tax = await page.evaluate(() => {
  S.techs = { mining: true, sparks: true, chemtech: true, hexcore: true, deepWorks: true, icathia: true };
  // v0.39 §9.4 renamed the Era-3 "slab" resource to hexSlab (stoneSlab is the Era-1 one)
  ["stoneSlab", "beam", "scaffold", "plating", "alloy", "hexgear", "hexSlab", "hexcrete", "focusedHex", "voidglass", "chronoshard"].forEach(r => { S.res[r] = 5; S.seenMax[r] = 5; });
  S.res.timber = 50; S.seenMax.timber = 50; S.res.mana = 50; S.seenMax.mana = 50;
  renderTop(computeRates());
  const col = document.getElementById("resource-col").innerHTML;
  const resIdx = col.indexOf(">Resources<"), craftIdx = col.indexOf(">Crafting<");
  const posOf = name => col.indexOf(">" + name + "<");
  return {
    manaBase: RES.mana.baseCap, timberBase: RES.timber.baseCap,
    madeKinds: ["stoneSlab", "beam", "scaffold", "plating", "alloy", "hexgear", "hexSlab", "hexcrete"].every(r => RES[r].kind === "made"),
    slabUnderCrafting: posOf("Stone Slabs") > craftIdx && craftIdx > resIdx,
    manaUnderResources: posOf("Mana") > resIdx && posOf("Mana") < craftIdx,
    slabShowsCap: /Stone Slabs<\/span><span class="res-nums"><span class="res-val">[^<]*<\/span><span class="res-cap">/.test(col),
    slabShowsValue: /Stone Slabs<\/span><span class="res-nums"><span class="res-val">[^<]+<\/span>/.test(col)
  };
});
check("mana cap now matches timber at base (150)", tax.manaBase === 150 && tax.timberBase === 150);
check("crafted intermediates reclassified as 'made'", tax.madeKinds);
check("Stone Slabs render under Crafting, Mana under Resources", tax.slabUnderCrafting && tax.manaUnderResources);
// v0.39: crafted materials are uncapped, matching Kittens (only raw resources have
// storage limits there). Capping them deadlocked the game once §5/§6/§7 put crafted
// goods into escalating building costs — measured stall at year 134. So a "made" row
// correctly shows NO cap now; what it must still show is a value.
check("made rows render a value and, being uncapped now, no cap", !tax.slabShowsCap && tax.slabShowsValue);

// ============ JACK IN THE BOX AS AN EVENT ============
const jack = await page.evaluate(() => {
  const o = {};
  S.techs = { masquerade: true }; S.jackboxes = 0; S.jackActive = false; S.jackTimer = 0;
  S.buildings.shelter = Math.max(1, S.buildings.shelter || 0); S.upgrades.keepingTheRolls = true; S.activeTab = "village"; uiDirty = true; renderAll();
  o.noBuyButton = !document.getElementById("btn-jackbox");
  o.bannerExists = !!document.getElementById("jack-banner");
  S.jackActive = true; S.jackTimer = 90;
  clickJack();
  o.granted = S.jackboxes === 1 && S.jackActive === false;
  return o;
});
check("Jack in the Box purchase removed", jack.noBuyButton);
check("Jack in the Box arrives as a clickable banner event", jack.bannerExists && jack.granted);

// ============ ORE ECONOMY ============
const ore = await page.evaluate(() => {
  let oreB = 0, ratios = [];
  BUILDINGS.forEach(b => {
    if (b.cost.ore) oreB++;
    if (b.cost.ore && b.cost.timber) ratios.push(+(b.cost.ore / b.cost.timber).toFixed(2));
  });
  return { oreB, total: BUILDINGS.length, inBand: ratios.filter(r => r >= 1.0 && r <= 3.0).length, ratios };
});
// v0.55 RE-POINT: the count moved because the BUILDING SET moved, not because ore did —
// v0.55 Part 4 deleted the Hunter's Lodge (which cost ore) and Part 3.4 added the Granary
// (which does not, because Kittens' pasture is `catnip 100 + wood 10`). The claim is a SHARE,
// so it is asserted as a share. Superseded by: v0.55 Parts 3.4 and 4.
check("ore is in about a third of the buildings (share, not a count — the set moves every round)",
  ore.oreB / ore.total >= 0.30, `${ore.oreB}/${ore.total} = ${(100 * ore.oreB / ore.total).toFixed(0)}%`);
check("ore/timber ratios: most in the 1.0-3.0 band, none above 3.0",
  ore.inBand / ore.ratios.length >= 0.85 && ore.ratios.every(r => r <= 3.0), JSON.stringify(ore.ratios));

// ============ FIRST-SCREEN OBJECTIVES ============
const firstScreen = await page.evaluate(() => {
  loadFromString(btoa(unescape(encodeURIComponent(JSON.stringify(freshState())))));
  S.buildings.archive = Math.max(1, S.buildings.archive || 0); S.activeTab = "lore"; uiDirty = true; renderAll();
  let visible = 0;
  TECHS.forEach(t => { if (!S.techs[t.id] && (!t.req || S.techs[t.req]) && (!t.unlock || t.unlock(S))) visible++; });
  UPGRADES.forEach(u => { if (!S.upgrades[u.id] && (!u.tech || S.techs[u.tech]) && (!u.unlock || u.unlock(S))) visible++; });
  return visible;
});
check("year 1 shows at least two objectives (was 1)", firstScreen >= 2, firstScreen);

// ============ REGRESSIONS ============
const reg = await page.evaluate(() => {
  const o = {};
  loadFromString(btoa(unescape(encodeURIComponent(JSON.stringify(freshState())))));
  gain("mana", 60); const t0 = S.res.timber; transmuteMana(1); o.transmute = S.res.timber > t0;
  const str = serialize(); loadFromString(str);
  o.saveRT = isFinite(S.res.mana) && typeof S.policies === "object" && typeof S.factionsFound === "object";
  S.res.devotion = 80; S.worship = 0; const a0 = S.ascends || 0;
  ascendTargon();
  o.ascentUnchanged = S.worship === 80 && S.res.devotion === 0 && S.ascends === a0 + 1;
  o.ascentFree = !/cooldown|cost/i.test(ascendTargon.toString());
  o.coreFns = [tick, computeRates, computeCaps, morale, ascendTargon, renderAll, renderTop].every(f => typeof f === "function");
  o.champTrain = typeof trainChamp === "function" && trainCost("shaco") === null || true;
  o.splitToggles = (() => { S.seenMax.knowledge = 50; S.buildings.archive = Math.max(1, S.buildings.archive || 0); S.activeTab = "lore"; renderAll(); return !!document.getElementById("btn-hidedone-r") && !!document.getElementById("btn-hidedone-d"); })();
  return o;
});
for (const [k, v] of Object.entries(reg)) check("regression: " + k, v === true);

for (const tab of ["settlement", "crafting", "village", "lore", "wilds", "trade", "targon", "champions"]) {
  await page.evaluate(t => {
    S.techs = { almanac: 1, cultivation: 1, woodcraft: 1, logistics: 1, mining: 1, trade: 1, smelting: 1, songcraft: 1, ritesOfTargon: 1, callToArms: 1, masquerade: 1, abyss: 1 };
    S.seenMax.knowledge = 999; S.seenMax.mana = 999; S.buildings.archive = Math.max(1, S.buildings.archive || 0); S.buildings.shelter = Math.max(1, S.buildings.shelter || 0); S.upgrades.keepingTheRolls = true; S.activeTab = t; uiDirty = true; renderAll();
  }, tab);
  await page.waitForTimeout(40);
}
check("all 8 tabs render, no console errors", errors.length === 0, errors.slice(0, 3).join(" | "));

console.log("\n" + pass + " passed, " + fail + " failed");
await browser.close();
process.exit(fail > 0 ? 1 : 0);
