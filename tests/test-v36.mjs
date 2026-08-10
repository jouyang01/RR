import { chromium } from "playwright";
import { suiteEnd } from "./_suite-end.mjs";
const browser = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium" }).catch(() => chromium.launch());
const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
const errors = [];
page.on("console", m => { if (m.type() === "error") errors.push(m.text()); });
page.on("pageerror", e => errors.push(String(e)));
await page.goto(new URL("../index.html", import.meta.url).href);
await page.waitForTimeout(500);
import { readFileSync as _rf } from "fs";
const RAWSRC = _rf(new URL("../index.html", import.meta.url), "utf8");
let pass = 0, fail = 0;
const check = (n, c, x) => { console.log(n + ":", c ? "PASS" : "FAIL", x ?? ""); c ? pass++ : fail++; };

// ===================== ITEM 1 — caravan bonus curve =====================
// v0.41 §2.6 replaced the single shared bonusChance()/bonusUnlocked() with a per-tier
// slot ladder: thresholds move 3/6/9 -> 5/10/15 and the chances DESCEND by tier so the
// deep materials do not make the shallow slots pointless. What v0.36 was really
// guarding — a bounded curve that heavy investment improves but never runs away — is
// unchanged, and is asserted here against the new API.
const i1 = await page.evaluate(() => {
  const rows = [0, 5, 10, 15, 20, 40, 1e7].map(n => {
    S.caravans = { piltover: n };
    return { n, chance: Math.round(slotChance("piltover", 0) * 100),
             slots: [0, 1, 2].filter(i => caravanCount("piltover") >= 5 * (i + 1)).length };
  });
  S.caravans = {};
  return rows;
});
check("the 5-slot chance curve climbs from 5% and is bounded at 40%",
  i1[0].chance === 5 && i1[i1.length - 1].chance === 40 &&
  i1.every((r, k) => k === 0 || r.chance >= i1[k - 1].chance),
  i1.map(r => `${r.n}:${r.chance}%`).join(" "));
check("slots open at 5 / 10 / 15 caravans",
  i1[0].slots === 0 && i1[1].slots === 1 && i1[2].slots === 2 && i1[3].slots === 3,
  i1.map(r => `${r.n}:${r.slots}`).join(" "));
check("maximum reachable 5-slot chance is 40%, never 75%", Math.max(...i1.map(r => r.chance)) === 40);

// ===================== ITEM 2 — gold is never a trade reward =====================
// v0.41 §2.6 rebuilt every faction's cost and yield table and renamed `bonuses` to
// `slots`. v0.36's specific slot contents are gone. What it was really guarding is the
// GENERAL form of the rule Jerry restated as Invariant 1 — no faction may pay out what
// it charges — so assert that across every resource, which is strictly stronger than
// v0.36's gold-only version. Gold is no longer a trade reward at all.
const i2 = await page.evaluate(() => {
  const yieldsOf = f => (f.primaryYield || []).concat(f.slots.map(s => s.res));
  return {
    violations: FACTIONS.filter(f => Object.keys(f.cost).some(c => yieldsOf(f).indexOf(c) !== -1)).map(f => f.id),
    goldPayers: FACTIONS.filter(f => yieldsOf(f).indexOf("gold") !== -1 || /gain\(\s*["']gold["']/.test(f.run.toString())).map(f => f.id),
    goldChargers: FACTIONS.filter(f => !!f.cost.gold).map(f => f.id),
    goldRatios: FACTIONS.map(f => +(f.cost.gold / f.cost.vigor).toFixed(3)),
    vigors: FACTIONS.map(f => f.cost.vigor)
  };
});
check("invariant: no faction pays out ANY resource it charges (v0.41 generalises v0.36's gold rule)",
  i2.violations.length === 0, i2.violations.join(",") || "clean");
check("gold is no longer a trade reward anywhere", i2.goldPayers.length === 0, i2.goldPayers.join(",") || "none");
// SUPERSEDED v0.46 Part 3. Kittens gates EVERY trade on gold AND catpower AND the
// route's good, as a hard three-way AND (js/diplomacy.js:893), and has since the
// beginning: defaultGoldCost 15, defaultManpowerCost 50. RR charged no gold at all.
// Every route now carries gold at Kittens' 15:50 = 0.30 ratio against the vigor side.
// SUPERSEDED v0.52 Part 1.4. The 0.30 gold:vigor anchor is DELETED, not widened. It was
// a parity check on Kittens' 15:50 at the OLD per-route vigor prices; v0.52 normalises
// every route to vigor 175 and holds each route's existing gold, so the ratio necessarily
// spreads (0.171 Freljord to 0.514 Bilgewater) and the invariant that replaces it is
// "every route's vigor === 175". Ruled by the spec's own §1.4, which requires this be
// listed with that item as its superseding cause. Gold was never the binding constraint —
// v0.47 measured a 12,373 gold ceiling against a 30-gold trade.
check("EVERY route charges gold, and every route's vigor is now exactly 175",
  i2.goldRatios.every(r => r > 0) && i2.vigors.every(v => v === 175),
  `vigors ${i2.vigors.join(", ")} | ratios ${i2.goldRatios.join(", ")}`);

// ===================== ITEM 3 — tech curve =====================
const i3 = await page.evaluate(() => {
  const id = i => TECHS.findIndex(t => t.id === i);
  const cost = i => TECHS.find(t => t.id === i).cost.knowledge;
  const chain = ["voidStudies", "ritesOfTargon", "callToArms", "sparks", "chemtech", "hexcore", "deepWorks", "icathia"];
  const steps = [];
  for (let k = 1; k < chain.length; k++) steps.push(+(cost(chain[k]) / cost(chain[k - 1])).toFixed(2));
  return {
    // v0.37 spec A1 supersedes v0.36's "immediately after Woodcraft":
    // Expedition Logistics must now sit BEFORE Songcraft so the order is monotonic
    songcraftAfterLogistics: id("songcraft") === id("logistics") + 1,
    costs: Object.fromEntries(chain.map(c => [c, cost(c)])),
    steps
  };
});
check("Songcraft sits immediately after Expedition Logistics (v0.37 A1 supersedes v0.36)", i3.songcraftAfterLogistics);
// v0.39 §7 supersedes v0.36's Era-3 tech costs: the five Era-3 techs are stretched
// ×6.7-15.6 so Era 3 spans weeks rather than minutes. Era 1/2 costs are unchanged.
// v0.44 Part 2.5 supersedes v0.39 §7 in full: the ×14.3 Call-to-Arms→Sparks cliff was
// the whole Era-3 ladder priced 9-37x above Kittens' equivalent rungs. Era 1/2 unchanged.
// SUPERSEDED v0.46 Part 5 — the ladder was trimmed 45 -> 38 and re-skewed to Kittens'
// shape (big early jumps, flat after). The v0.44 Part 2.5 prices are retired; what is
// asserted now is the SHAPE that produces Kittens' median and geometric mean together.
// SUPERSEDED v0.47 Part 1. The ladder is now Kittens' ladder rank for rank — not
// "shaped like", identical values — so every price in it moved. The v0.46 numbers are
// retired; what is asserted is the new table.
check("Era 1→3 costs sit on the v0.47 Kittens-parity ladder",
  i3.costs.ritesOfTargon === 12000 && i3.costs.callToArms === 15000 && i3.costs.sparks === 20000 &&
  i3.costs.chemtech === 55000 && i3.costs.hexcore === 75000 && i3.costs.deepWorks === 100000 && i3.costs.icathia === 135000,
  JSON.stringify(i3.costs));
// v0.44 Part 2.5 supersedes the ×1.5-2.5 band and the boundary exemption both. The
// ladder is now measured against Kittens', whose median step is ×1.12: the invariant
// is that every step still RISES (monotonic spine) and that none of them is a cliff.
// A step BELOW 1.5 is no longer a defect — it is the target.
// SUPERSEDED v0.47 Part 1: the spine now contains Kittens' own ×3.0 archery step and a
// ×1.0 tie (voidStudies = ritesOfTargon at 12,000). Both are the source's shape.
check("every step on the spine rises or ties, and none exceeds Kittens' ×3.33",
  i3.steps.every(x => x >= 1.0 && x <= 3.35), i3.steps.join(", "));

// ===================== ITEM 4 — sublinear luxury demand =====================
const i4 = await page.evaluate(() => {
  S.buildings = {}; S.jobs = {}; S.upgrades = {}; S.policies = {}; S.champs = {}; S.wanderers = [];
  const drain = pop => {
    S.pop = pop; S.res.furs = 500; S.seenMax.furs = 500;
    return -computeRates().furs;
  };
  const d60 = drain(60), d130 = drain(130), d250 = drain(250);
  S.pop = 0; S.res.furs = 0;
  return { d60, d130, d250, lin60: 0.002 * 60, lin130: 0.002 * 130, lin250: 0.002 * 250 };
});
check("demand is identical at 60 wanderers (the calibration point)", Math.abs(i4.d60 / i4.lin60 - 1) < 0.005, `${i4.d60.toFixed(5)} vs ${i4.lin60}`);
// v0.38 Item 5a reverts this to linear, safe because Item 4 made supply vigor-bound
check("v0.38: demand is linear again at 130 and 250 wanderers",
  Math.abs(i4.d130 / i4.lin130 - 1) < 1e-9 && Math.abs(i4.d250 / i4.lin250 - 1) < 1e-9,
  `${(i4.d130 / i4.lin130).toFixed(3)} / ${(i4.d250 / i4.lin250).toFixed(3)} vs linear`);

// ===== ITEMS 5 & 6 superseded by v0.38 Item 1: the reserve block was removed =====
const i56 = await page.evaluate(() => ({
  floorGone: typeof LUXURY_FLOOR === "undefined",
  comfortReplacesIt: typeof LUXURY_COMFORT !== "undefined" && LUXURY_COMFORT === 25,
  blocksGone: typeof caravanLuxuryBlock === "undefined" && typeof craftLuxuryBlock === "undefined"
}));
check("v0.38: LUXURY_FLOOR and both reserve blocks removed", i56.floorGone && i56.blocksGone);
check("v0.38: LUXURY_COMFORT = 25 carries the morale ramp instead", i56.comfortReplacesIt);

// ===================== ITEM 7 — boost stacks bounded =====================
const i7 = await page.evaluate(() => {
  const o = { limits: BOOST_LIMIT };
  S.buildings = {}; S.jobs = { acolyte: 4 }; S.pop = 10; S.upgrades = {}; S.policies = {}; S.champs = {}; S.wtechs = {};
  S.techs = { ritesOfTargon: 1 };
  const dev = n => { S.buildings = { shrine: 100, sanctum: n }; return computeRates().devotion; };
  const base = dev(0);
  o.at15 = dev(15) / base;      // 15 sanctums = +150%, entirely free under LDR
  o.at50 = dev(50) / base;      // +500% raw -> bounded
  o.at200 = dev(200) / base;    // +2000% raw -> still bounded
  o.bounded = o.at200 < 3.0;
  S.buildings = {}; S.jobs = {}; S.pop = 0;
  return o;
});
// v0.52: the table is SEVEN keys, and which seven is the whole point of this round.
// Part 0 removed `knowledge` — Kittens applies scienceRatio with the identical unbounded
// statement it uses for mineralsRatio and woodRatio (game.js:3425-3435), and the bound was
// capping the four science buildings at a measured x3.969 against the source's x20.80.
// Part 1.3 closed the two slots that were unbounded by omission, `provisions` and `mana`.
// Net 6 -> 7. Asserted by CONTENT, not by count, so a future addition has to be named.
check("BOOST_LIMIT is exactly the seven bounded stacks, and knowledge is NOT among them",
  JSON.stringify(Object.keys(i7.limits).sort()) ===
    JSON.stringify(["crystals", "culture", "devotion", "gold", "mana", "provisions", "vigor"]) &&
  i7.limits.devotion === 2.0 && i7.limits.knowledge === undefined, JSON.stringify(i7.limits));
check("15 Sanctums still pay in full (+150%, LDR-free zone)", Math.abs(i7.at15 - 2.5) < 0.02, `×${i7.at15.toFixed(2)}`);
check("50 and 200 Sanctums are bounded below +200%", i7.at50 < 3.0 && i7.bounded, `×${i7.at50.toFixed(2)} / ×${i7.at200.toFixed(2)}`);

// ===================== ITEMS 8, 9, 10 — policies =====================
const i8910 = await page.evaluate(() => {
  const o = {};
  const desc = id => { let d = null; POLICY_GROUPS.forEach(g => g.options.forEach(x => { if (x.id === id) d = x.desc; })); return d; };
  o.wwDesc = desc("wanderersWelcome");
  o.wwNoArrival = !/sooner/i.test(o.wwDesc);
  S.policies = {}; S.buildings = { shelter: 10 };
  const mp0 = maxPop(); S.policies.wanderersWelcome = true;
  o.wwRatio = maxPop() / mp0;
  o.wwLdrCapped = 1 + limitedDR(0.10 * 50, MAXPOP_RATIO_LIMIT) < 2.0;
  S.policies = {}; S.buildings = {};

  o.vwDesc = desc("vigilantWatch");
  o.vigorBase = policyVigorMult();
  S.policies = { vigilantWatch: 1 }; o.vigorWatch = policyVigorMult();
  S.policies = { openRange: 1 }; o.vigorRange = policyVigorMult();
  o.campRange = (() => { S.policies = {}; const a = campYieldMult(); S.policies = { openRange: 1 }; const b = campYieldMult(); return b / a; })();
  // the discount reaches the actual expedition cost
  S.policies = { vigilantWatch: 1 };
  const e = EXPEDITIONS.find(x => x.id === "wolves");
  o.expCostDiscounted = expCost(e).vigor;
  S.policies = {}; o.expCostBase = expCost(e).vigor;

  o.solariDesc = desc("solariDiscipline");
  o.solariNoMorale = !/morale/i.test(o.solariDesc);
  const m0 = morale(); S.policies = { solariDiscipline: 1 }; o.moraleDelta = morale() - m0;
  S.policies = {};
  // v0.58.1 §29: a SLICE on the Shrine's contribution, so the fixture must build Shrines.
  S.buildings = Object.assign({}, S.buildings, { shrine: 20 });
  const dc0 = computeCaps().devotion; S.policies = { lunariVigil: 1 };
  o.lunariCap = computeCaps().devotion / dc0;
  S.policies = {};
  return o;
});
check("Wanderer's Welcome: arrival clause gone, +10% housing, LDR-capped", i8910.wwNoArrival && i8910.wwRatio > 1.08 && i8910.wwRatio <= 1.10 && i8910.wwLdrCapped, i8910.wwDesc);
check("Vigilant Watch is now continuous: −15% expedition vigor", /15% less Vigor/i.test(i8910.vwDesc) && Math.abs(i8910.vigorWatch - 0.85) < 1e-9);
check("the discount reaches the real expedition cost", i8910.expCostDiscounted === Math.round(i8910.expCostBase * 0.85), `${i8910.expCostBase} → ${i8910.expCostDiscounted}`);
// v0.55 Part 4 RE-POINT: the camp half is rank-matched to Kittens' `rationing` (0.1), so
// 0.12 -> 0.10. The vigor half is untouched and so is the point of the assertion — the policy
// pays and charges on the SAME axis. Superseded by: v0.55 Part 4.
check("Open Range: +10% camp yields but +10% vigor cost — same axis, real trade",
  Math.abs(i8910.campRange - 1.10) < 0.005 && Math.abs(i8910.vigorRange - 1.10) < 1e-9);
check("Solari Discipline lost its second benefit (no morale clause)", i8910.solariNoMorale && i8910.moraleDelta === 0);
// RE-POINTED v0.58.1 — see §29. The clause is slice-scoped to the Shrine now.
check("Lunari Vigil's devotion-cap clause survives, scoped to the Shrine's slice (v0.58.1 §29)",
  i8910.lunariCap > 1 && i8910.lunariCap <= 1.25, i8910.lunariCap.toFixed(3));

// ===================== ITEM 11 — Trade Dock ratio =====================
const i11 = await page.evaluate(() => {
  S.champs = {}; S.policies = {}; S.wanderers = []; invalidateCensus();
  const at = n => { S.buildings = { tradeDock: n }; return tradeYieldMult(); };
  const o = { one: at(1), ten: at(10), twenty: at(20), huge: at(100000) };
  S.buildings = {};
  return o;
});
check("Trade Dock is 0.02/copy, not 0.15", Math.abs(i11.one - 1.02) < 0.001, `×${i11.one.toFixed(3)} at 1 dock`);
check("10 docks give +20%, not +150%", Math.abs(i11.ten - 1.20) < 0.001, `×${i11.ten.toFixed(3)}`);
// RE-POINTED v0.61, superseded by PART 6.1 / DEV NOTE 8 (Jerry): "Does Kittens have a trade
// yield max?" **RETRIEVED: it has none** — `js/diplomacy.js:744-747` sums `tradeRatio`
// additively, uncapped, and the tradepost is an unbounded 0.015 per copy. The DOCK'S OWN +100%
// ceiling is therefore gone; the dock is a flat 0.02 per copy into one additive category, which
// is what the two assertions above still check and which is the source's shape.
//
// **ONE CEILING REMAINS, ON THE CATEGORY AS A WHOLE, and it is a deliberate deviation from the
// spec's "uncapped".** Shipped fully uncapped, RR grows an infinite-timber loop at 133 Trade
// Docks: RR has a Demacia -> Piltover -> transmute cycle that Kittens does not have, the yield
// multiplier enters it twice, and `test-v41` has asserted the loop gain below 0.8 since v0.41.
// The argument and the measurement are at `tradeYieldMult` in index.html. **Four multiplicative
// categories with two ceilings became ONE additive category with one — strictly closer to the
// source than what RR had.** The asymptote moves +100% -> +300%.
check("the DOCK's own ceiling is gone; one ceiling remains, on the whole additive category",
  i11.huge <= 4.0 && i11.huge > 3.9 &&
  !/var docks = limitedDR\(/.test(RAWSRC),
  `×${i11.huge.toFixed(3)} at absurd counts (was +100%, now the category ceiling at +300%)`);

// ============= ITEMS 12-16 — spec lists these as outstanding; verify shipped =============
const i1216 = await page.evaluate(() => {
  S.champs = { shaco: { r: true, lvl: 0 } };
  const before = JSON.stringify(S.champs.shaco);
  for (let i = 0; i < 100; i++) tick();
  const passiveXp = JSON.stringify(S.champs.shaco) !== before;
  S.champs = { shaco: { r: true, lvl: 0 } };
  const cost = trainCost("shaco");
  S.champs = {};
  S.seenMax.knowledge = 50; S.techs.almanac = 1; S.buildings.archive = Math.max(1, S.buildings.archive || 0); S.activeTab = "lore"; uiDirty = true; renderAll();
  const splitToggles = !!document.getElementById("btn-hidedone-r") && !!document.getElementById("btn-hidedone-d");
  S.techs.masquerade = 1; S.buildings.shelter = Math.max(1, S.buildings.shelter || 0); S.upgrades.keepingTheRolls = true; S.activeTab = "village"; renderAll();
  return {
    i12: typeof trainChamp === "function" && passiveXp && cost.renown === 40 && cost.tome === 1,
    i13: splitToggles,
    i14: EXPEDITIONS.every(e => !!e.yield) && !EXPEDITIONS.find(e => e.id === "blueSentinel").desc.includes("Crest"),
    i15: RES.mana.baseCap === RES.timber.baseCap &&
         (() => { const a = computeCaps().mana; S.upgrades.expandedStores = true; const c = computeCaps().mana; S.upgrades.expandedStores = false; return c > a; })(),
    i16: typeof buyJackbox === "undefined" && typeof jackboxCost === "undefined" &&
         !!document.getElementById("jack-banner") && !document.getElementById("btn-jackbox")
  };
});
// v0.43 Part 1.4 supersedes the "no passive XP" half, deliberately and by directive:
// champions were a shop with a rising price, and the brief was that each investment
// should feel like a real purchase. XP is back as a LIFETIME CUMULATIVE total that is
// never spent, and levelling now needs the XP threshold AS WELL AS the materials — so
// the material cost this test guards is still necessary, just no longer sufficient.
check("item 12: champion levelling still costs Renown + Tomes (v0.43 adds an XP gate on top)", i1216.i12);
check("item 13: separate Research / Discovery completed toggles", i1216.i13);
check("item 14: all camps carry hover yields, buffs out of the description", i1216.i14);
check("item 15: Mana is a material — cap parity with Timber, raised by the Masonry line", i1216.i15);
check("item 16: Jack in the Box is a banner event, purchase path fully removed", i1216.i16);

// ===================== ITEM 17 — luxury morale is no longer a permanent flag =====================
const i17 = await page.evaluate(() => {
  S.pop = 10; S.jackboxes = 0; S.buildings = {}; S.policies = {}; S.wanderers = []; invalidateCensus();
  const zero = { mushrooms: 0, furs: 0, plumes: 0, poros: 0, trueice: 0 };
  const set = o => Object.assign(S.res, zero, o);
  // v0.39 §9.2: comfort demand now scales with population, so the ramp's
  // midpoint and ceiling are luxuryComfort(), not the fixed LUXURY_COMFORT.
  const C = luxuryComfort();
  set({}); const none = morale();
  set({ furs: 1 }); const one = morale();
  set({ furs: C / 2 }); const half = morale();
  set({ furs: C }); const stocked = morale();
  set({ furs: 10000 }); const hoard = morale();
  set({});
  return { none, one, half, stocked, hoard, C };
});
// SUPERSEDED v0.45, Jerry's directive 3 — and it turns out the ramp was never Kittens.
// js/village.js updateHappines():
//     var happinessPerLuxury = 10;
//     for (...) if (resources[i].type != "common" && resources[i].value > 0)
//         happiness += happinessPerLuxury;
// A luxury pays a FLAT +10 the moment you hold any of it; one unit and one million
// units are identical. There is no quantity term in that loop. So the two assertions
// below are inverted: a single unit SHOULD buy the whole bonus, and a part-stocked
// luxury should NOT pay proportionally. Same three checks, opposite expectations.
check("a single unit buys the full morale bonus, as Kittens' value>0 test does",
  i17.one - i17.none === 10, `+${i17.one - i17.none} at 1 fur`);
check("quantity held is irrelevant — 1, half, full and a hoard all pay the same",
  i17.one === i17.half && i17.half === i17.stocked && i17.stocked === i17.hoard,
  `1:${i17.one} half:${i17.half} full:${i17.stocked} hoard:${i17.hoard}`);
check("a fully stocked luxury pays the full +10", i17.stocked - i17.none === 10, `+${i17.stocked - i17.none} at ${i17.C} furs`);
check("hoarding beyond the reserve pays no more", i17.hoard === i17.stocked);

// ============= the Targon feedback loop found during the pacing run =============
const loop = await page.evaluate(() => {
  S.buildings = { shrine: 20 }; S.jobs = { acolyte: 8 }; S.pop = 20;
  S.upgrades = {}; S.policies = {}; S.champs = {}; S.drakes = {}; S.wanderers = []; invalidateCensus();
  S.wtechs = { convergence: true }; S.techs = { ritesOfTargon: 1 };
  S.worship = 0; const d0 = computeRates().devotion;
  S.worship = 1e7; const d1 = computeRates().devotion;
  const mana = (() => { S.buildings = { shrine: 20, manaWell: 10 }; S.worship = 0; const a = computeRates().mana; S.worship = 1e7; const b = computeRates().mana; return b / a; })();
  S.worship = 0; S.buildings = {}; S.jobs = {}; S.pop = 0;
  return { devotionRatio: d1 / d0, manaRatio: mana };
});
check("Worship no longer multiplies Devotion (the compounding loop is broken)", Math.abs(loop.devotionRatio - 1) < 1e-9, `×${loop.devotionRatio.toFixed(4)}`);
// v0.40 Part 2.4 dropped the Convergence coefficient 0.05 -> 0.01 (Kittens parity), so
// 10M Worship is now ×2.4 on mana rather than ×8. The property this guards is that
// Worship still multiplies non-Devotion production at all — the exemption is Devotion-only.
// v0.42 set the stripe to 20,000 from a measured median, so 10M Worship is now x1.3 on
// mana rather than x2.4. The property guarded — Worship multiplies non-Devotion
// production at all, and the exemption is Devotion-only — is unchanged.
check("Worship still multiplies everything else", loop.manaRatio > 1.1, `×${loop.manaRatio.toFixed(1)} on mana at 10M worship`);

// ===================== regressions =====================
const reg = await page.evaluate(() => {
  const o = {};
  loadFromString(btoa(unescape(encodeURIComponent(JSON.stringify(freshState())))));
  o.saveRT = (() => { loadFromString(serialize()); return isFinite(S.res.mana); })();
  S.res.devotion = 80; S.worship = 0; const a0 = S.ascends || 0;
  ascendTargon();
  o.ascentStillFreeAndPure = S.worship === 80 && S.res.devotion === 0 && S.ascends === a0 + 1;
  o.noAscendsInBonus = !/ascends/i.test(worshipBonus.toString());
  o.convergenceTextClean = !/every future ascent/i.test(document.body.innerHTML);
  o.coreFns = [tick, computeRates, computeCaps, morale, ascendTargon, renderAll, renderTop].every(f => typeof f === "function");
  o.noNaNRates = Object.values(computeRates()).every(v => isFinite(v));
  o.noNaNCaps = Object.values(computeCaps()).every(v => isFinite(v));
  return o;
});
for (const [k, v] of Object.entries(reg)) check("regression: " + k, v === true);

for (const tab of ["settlement", "crafting", "village", "lore", "wilds", "trade", "targon", "champions"]) {
  await page.evaluate(t => {
    S.techs = { almanac: 1, cultivation: 1, woodcraft: 1, logistics: 1, mining: 1, trade: 1, smelting: 1, songcraft: 1, ritesOfTargon: 1, callToArms: 1, masquerade: 1 };
    S.pop = 20; syncRoster(); S.seenMax.knowledge = 999; S.buildings.archive = Math.max(1, S.buildings.archive || 0); S.buildings.shelter = Math.max(1, S.buildings.shelter || 0); S.upgrades.keepingTheRolls = true; S.activeTab = t; uiDirty = true; renderAll();
  }, tab);
  await page.waitForTimeout(40);
}
check("all 8 tabs render, no console errors", errors.length === 0, errors.slice(0, 3).join(" | "));

console.log("\n" + pass + " passed, " + fail + " failed");
await browser.close();
suiteEnd(import.meta.url, pass, fail);
process.exit(fail > 0 ? 1 : 0);
