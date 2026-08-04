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

// ============ FINDING 2: the DR primitives ============
const dr = await page.evaluate(() => {
  const o = {};
  // LDR is completely free below 0.75*limit, then asymptotic, never reaching it
  o.freeBelow75 = [0, 0.1, 0.5, 0.74].every(f => Math.abs(limitedDR(f, 1) - f) < 1e-9);
  o.atExactly75 = Math.abs(limitedDR(0.75, 1) - 0.75) < 1e-9;
  o.curvedAbove = limitedDR(1.0, 1) < 1.0 && limitedDR(1.0, 1) > 0.75;
  o.neverReaches = limitedDR(1e9, 1) < 1 && limitedDR(1e9, 1) > 0.99;
  o.monotonic = (() => { let prev = -1; for (let x = 0; x < 20; x += 0.13) { const v = limitedDR(x, 2); if (v < prev) return false; prev = v; } return true; })();
  o.signPreserved = Math.abs(limitedDR(-1.0, 1) + limitedDR(1.0, 1)) < 1e-9;
  o.zeroLimit = limitedDR(5, 0) === 0;
  // UDR is the inverse of a triangular number: unbounded, sqrt-shaped
  o.udrAtStripe = Math.abs(unlimitedDR(1000, 1000) - 1) < 1e-9;
  o.udrGrowsForever = unlimitedDR(1e9, 1000) > unlimitedDR(1e8, 1000);
  o.udrSqrtShape = Math.abs(unlimitedDR(4e6, 1000) / unlimitedDR(1e6, 1000) - 2) < 0.05;  // 4x stock -> 2x bonus
  return o;
});
check("LDR: free below 0.75×limit", dr.freeBelow75 && dr.atExactly75);
check("LDR: curved above 0.75×limit, asymptotic, never reaches it", dr.curvedAbove && dr.neverReaches);
check("LDR: monotonic and sign-preserving; zero limit is safe", dr.monotonic && dr.signPreserved && dr.zeroLimit);
check("UDR: equals 1 at one stripe, unbounded, sqrt-shaped (4× stock → 2× bonus)", dr.udrAtStripe && dr.udrGrowsForever && dr.udrSqrtShape);

const routed = await page.evaluate(() => {
  const o = {};
  // Drakes: additive per kill, bounded — the old unbounded-bonus class of bug
  S.drakes = {};
  o.drake0 = drakeBonus("infernal", 0.5);
  S.drakes.infernal = 1; o.drake1 = drakeBonus("infernal", 0.5);
  S.drakes.infernal = 7; o.drake7 = drakeBonus("infernal", 0.5);
  S.drakes.infernal = 1000; o.drake1000 = drakeBonus("infernal", 0.5);
  S.drakes = {};
  // Worship: no wall left
  S.wtechs = { convergence: true };
  const w = v => { S.worship = v; return worshipBonus(); };
  o.w1k = w(1000); o.w100k = w(100000); o.w1M = w(1e6); o.w1B = w(1e9);
  o.noWall = o.w1B > o.w1M;
  S.worship = 0;
  // Camp + craft stacks route through LDR
  S.jobs = {}; S.buildings = {}; S.upgrades = {}; S.policies = {}; S.champs = {};
  o.campBase = campYieldMult();
  S.upgrades = { trappersCraft: 1, beastLore: 1, masterOfTheHunt: 1 };
  o.campStack = campYieldMult();                     // additive 1+1.0, not multiplicative 2.34
  S.upgrades = {};
  S.buildings.workshop = 5; o.craft5 = craftYield();
  S.buildings.workshop = 100000; o.craftHuge = craftYield();
  S.buildings = {};
  return o;
});
check("drake bonus: 0 at none, +5% at one kill", routed.drake0 === 0 && Math.abs(routed.drake1 - 0.05) < 1e-9);
check("drake bonus: free to +35% at 7 kills, bounded under +50% forever", Math.abs(routed.drake7 - 0.35) < 1e-9 && routed.drake1000 < 0.5 && routed.drake1000 > 0.49, routed.drake1000.toFixed(4));
// v0.40 Part 2.4 supersedes: RR was running Kittens' Solar Revolution curve at 5x its
// coefficient. Same unlimitedDR, same stripe of 1000, now 0.01 not 0.05 — so the shape
// this test was really guarding (sqrt, unbounded-but-decelerating) is unchanged and the
// magnitudes are one fifth of what they were.
// v0.42 Part 6 set the STRIPE from a measured three-seed median of Worship at Sparks
// (255k/481k/548k, a 2.15x spread after the Acolyte fix): 1000 -> 20,000. The
// coefficient is still Kittens' 0.01 and the primitive is unchanged; the magnitudes at
// any fixed Worship are correspondingly smaller. The shape is what this guards.
check("worship keeps its sqrt shape at the measured stripe",
  routed.w1k < routed.w100k && routed.w100k < routed.w1M &&
  (routed.w1M / routed.w100k) < (routed.w100k / routed.w1k),
  `${(routed.w1k * 100).toFixed(2)}% / ${(routed.w100k * 100).toFixed(1)}% / ${(routed.w1M * 100).toFixed(1)}%`);
check("worship: the arbitrary +400% wall is gone (old cap was 4.0)", routed.noWall && routed.w1B > 3.0, `+${Math.round(routed.w1B * 100)}% at 1B worship`);
check("camp discoveries stack additively (+100%), not multiplicatively (+134%)", Math.abs(routed.campStack - 2.0) < 0.01, routed.campStack.toFixed(3));
check("craft yield bounded by LDR under absurd workshop counts", routed.craftHuge < 5 && routed.craft5 > 1.29, `${routed.craft5.toFixed(2)} / ${routed.craftHuge.toFixed(2)}`);

// price-ratio reductions are LDR-capped against (base - 1)
const ratios = await page.evaluate(() => {
  const o = {};
  const sh = BUILDINGS.find(b => b.id === "shelter"), lh = BUILDINGS.find(b => b.id === "longhouse");
  S.upgrades = {}; o.shelterBase = buildingRatio(sh);
  S.upgrades.ironwoodShelters = true; o.shelterIron = buildingRatio(sh);
  S.upgrades.petriciteFrames = true; o.shelterBoth = buildingRatio(sh);
  S.upgrades = {}; o.longhouseBase = buildingRatio(lh);
  S.upgrades.stonecutGuild = true; o.longhouseCut = buildingRatio(lh);
  // an absurd stack of reductions can never push a ratio to or below 1.0
  o.neverBelowOne = sh.ratio - limitedDR(99, sh.ratio - 1) > 1.0;
  S.upgrades = {};
  return o;
});
// v0.42 Part 2f puts the Shelter on Kittens' Hut shape — Hut is wood 5 at ratio 2.50,
// where the ratio is punishing BECAUSE the base is trivial, and that is exactly what
// makes the ratio reducers feel like a breakthrough rather than a patch. RR: timber 8
// at 2.20. What this test really guards — that the reducers bite, in order, through the
// DR primitive and never reach 1.0 — is unchanged.
check("shelter reducers still bite in order, through the primitive",
  ratios.shelterBase > ratios.shelterIron && ratios.shelterIron > ratios.shelterBoth && ratios.shelterBoth > 1,
  `${ratios.shelterBase.toFixed(2)}/${ratios.shelterIron.toFixed(2)}/${ratios.shelterBoth.toFixed(2)}`);
// SUPERSEDED v0.45 Part 3. Kittens discounts exactly one house type — the hut, whose
// priceRatio starts at a punitive 2.5. `logHousePriceRatio` and `mansionPriceRatio`
// return zero results in the whole repository; the Log House and the Mansion sit at
// 1.15 forever. RR's two Longhouse reducers took 1.15 to 1.055, at which the hundredth
// Longhouse costs 175x the first. Both are deleted and re-pointed at the Storehouse,
// the one RR building whose 1.75 is punitive the way the hut's 2.5 is. The Longhouse
// must now hold 1.15 no matter what is owned.
check("longhouse holds 1.15 — no reducer, as Kittens' logHouse has none",
  Math.abs(ratios.longhouseBase - 1.15) < 1e-9 && Math.abs(ratios.longhouseCut - 1.15) < 1e-9,
  `${ratios.longhouseBase} / ${ratios.longhouseCut}`);
check("no stack of reductions can drive a ratio to 1.0", ratios.neverBelowOne);

// ============ FINDING 1: ratio distribution ============
const dist = await page.evaluate(() => {
  const by = {};
  BUILDINGS.forEach(b => { by[b.ratio] = (by[b.ratio] || 0) + 1; });
  const at125 = BUILDINGS.filter(b => b.ratio === 1.25).map(b => b.id);
  const globals = BUILDINGS.filter(b => b.globalBoost).map(b => b.id);
  return { by, at125, globals, total: BUILDINGS.length, at115: by[1.15] || 0 };
});
check("1.15 is now the default band (≥60% of buildings)", dist.at115 / dist.total >= 0.6, `${dist.at115}/${dist.total} = ${Math.round(dist.at115 / dist.total * 100)}%`);
// v0.39 §8 adds the Watcher's Eye at 1.25 by explicit spec instruction: it is a
// percentage Culture-cap multiplier, which is the same "genuine global multiplier"
// category the 1.25 band is reserved for, just on a cap rather than a rate.
// v0.44 Part 1.1 adds the Hexdraulic Plant at 1.25: it is Kittens' Steamworks, an
// AMPLIFIER of a global multiplier (each Hextech Foundry +15% per Plant). Same
// category, one level of indirection, so it belongs in the same band.
// v0.50 Part 4 — CLOSED, not pending. The 1.25-band rule is an RR invention: Kittens
// assigns priceRatio by what a building IS, not by which effect category it carries. Its
// barn is 1.75 with no multiplier of any kind, its hut is 2.50, its amphitheatre is 1.15
// WITH a real one. So this whitelist is not a concession — the rule it exempts these two
// from does not exist in the source. The capstones stay at 1.25 by Jerry's ruling, and the
// band is advisory from here: it is no longer a reason to re-price anything on its own.
const CAP_MULTIPLIERS = ["watchersEye", "hexdraulicPlant", "wardOfWatchers", "frozenWatcher"];
check("1.25 reserved for genuine global multipliers only",
  dist.at125.every(id => dist.globals.includes(id) || CAP_MULTIPLIERS.includes(id)),
  JSON.stringify(dist.at125));
// v0.42 Part 2f: the Shelter joins the Storehouse above the 1.25 band, which IS Kittens'
// pattern — first-tier storage (barn 1.75) and first-tier housing (hut 2.50) are the two
// things a player buys constantly, and both are priced with a trivial base to match.
check("nothing above 1.25 except first-tier storage and first-tier housing",
  Object.keys(dist.by).filter(r => +r > 1.25).length <= 2 &&
  Object.keys(dist.by).filter(r => +r > 1.25).every(r => dist.by[r] === 1), JSON.stringify(dist.by));

// ============ FINDING 3: science depth ============
const sci = await page.evaluate(() => {
  const ids = ["archive", "academy", "observatory", "hexLab"];
  const tiers = ids.map(id => { const b = BUILDINGS.find(x => x.id === id); return b ? { id, ratio: b.ratio, boost: b.boost.knowledge, cap: b.caps.knowledge } : null; });
  // additive stack across the whole line
  S.buildings = { archive: 10, academy: 10, observatory: 10, hexLab: 10 };
  S.jobs = { loremaster: 5 }; S.pop = 10; S.upgrades = {}; S.policies = {}; S.champs = {};
  const withAll = computeRates().knowledge;
  S.buildings = {};
  const bare = computeRates().knowledge;
  S.jobs = {}; S.pop = 0;
  // v0.52 Part 0: the delivered multiplier must now equal Kittens' own closed form
  // exactly — perTick *= 1 + getEffect(res + "Ratio"), game.js:3425-3435, no DR.
  const sigma = ids.reduce((t, id) => t + BUILDINGS.find(x => x.id === id).boost.knowledge * 10, 0);
  return { tiers, stack: withAll / bare, sigma: +sigma.toFixed(4) };
});
check("science line is four tiers deep", sci.tiers.every(Boolean) && sci.tiers.length === 4, JSON.stringify(sci.tiers.map(t => t && t.id)));
check("Archive reverted to 1.15 (analyzer's error)", sci.tiers[0].ratio === 1.15);
check("deeper science tiers get cheaper ratios (1.10), not steeper", sci.tiers[2].ratio === 1.10 && sci.tiers[3].ratio === 1.10);
check("cap steps deepen: 250 → 500 → 1000 → 1500", sci.tiers.map(t => t.cap).join(",") === "250,500,1000,1500");
// SUPERSEDED v0.52 Part 0. This asserted the bound that WAS the defect. Kittens applies
// scienceRatio with the identical statement it uses for mineralsRatio and woodRatio —
// `perTick *= 1 + getEffect(res + "Ratio")`, game.js:3425-3435 — with no diminishing
// return anywhere. RR routed knowledge through the bounded `boosts` mechanism, which
// capped the four science buildings at a MEASURED x3.969 against the source's x20.80 at
// Kittens' own end-of-tree 30/30/25/13. The bound is gone; what is asserted now is the
// source's closed form to the digit, which is a strictly stronger check.
check("science stack is EXACTLY Kittens' 1 + Sigma, additive and unbounded (v0.52 Part 0)",
  Math.abs(sci.stack - (1 + sci.sigma)) < 1e-9,
  `delivered x${sci.stack.toFixed(4)} against 1 + Σ${sci.sigma} = x${(1 + sci.sigma).toFixed(4)}`);

// ============ FINDING 4: tome cap clamped, not linear forever ============
const tomes = await page.evaluate(() => {
  S.buildings = { archive: 4 }; S.upgrades = {}; S.res.tome = 0;
  const buildingCap = computeCaps().knowledge;
  const at = n => { S.res.tome = n; return computeCaps().knowledge; };
  const o = { buildingCap, t1: at(1), t4: at(4), t50: at(50), t5000: at(5000) };
  o.linearEarly = Math.abs(o.t1 - (buildingCap + 150)) < 1e-6;
  o.clampedAtDouble = Math.abs(o.t5000 - buildingCap * 2) < 1e-6 && Math.abs(o.t50 - buildingCap * 2) < 1e-6;
  // raising the clamp is what makes more tomes pay again
  S.buildings = { archive: 4, academy: 10, observatory: 10 };
  o.clampRises = computeCaps().knowledge > o.t5000;
  S.buildings = {}; S.res.tome = 0;
  return o;
});
// v0.41 §2.1 supersedes v0.40 Part 1A: Tomes leave the Knowledge cap altogether.
// Uncapping them closed a 1,745-year gap but overshot — Era 3 became gated on FUR
// income and five techs spanning a 25x range cleared in 35 game-years. Tomes still
// raise the cap, but indirectly, by buying the multiplicative Scholarship line.
check("tomes no longer touch the Knowledge cap at all", tomes.t1 === tomes.buildingCap && tomes.t5000 === tomes.buildingCap,
  `${Math.round(tomes.t5000)} at 5000 tomes vs building cap ${Math.round(tomes.buildingCap)}`);
// v0.40 Part 1A supersedes: the clamp is retired. It existed because Tomes were free at
// 20 furs apiece; a Tome now costs 8,750 furs and 1,500 Knowledge, which is Kittens'
// Compendium shape — uncapped, self-limited by cost rather than by a second gate. The
// clamp was why the Knowledge cap asymptoted near 1.0M and Hexcore sat 1,745 years past
// Chemtech. Assert the new shape: strictly linear in Tomes, all the way up.
check("the Knowledge ceiling now comes from buildings and the Scholarship line only",
  tomes.clampRises, "more science buildings still raise it");
check("building the science line raises the clamp, making tomes pay again", tomes.clampRises);

// ============ FINDING 5: named multiplicative categories ============
const cats = await page.evaluate(() => {
  const src = computeRates.toString();
  const named = (src.match(/var cat[A-Z]\w+/g) || []).map(x => x.replace("var ", ""));
  const o = { named, count: named.length };
  // the policy ratio is real and compounds
  S.policies = {}; S.buildings = { manaWell: 10 }; S.jobs = {}; S.pop = 0; S.upgrades = {}; S.champs = {}; S.drakes = {}; S.wtechs = {};
  const base = computeRates().mana;
  o.policyBonus0 = policyGlobalBonus();
  S.policies = { wanderersWelcome: 1, openRange: 1, frontierCharter: 1 };
  o.policyBonus3 = policyGlobalBonus();
  o.policyApplies = computeRates().mana / base;
  S.policies = {};
  // globalBoost is now actually read — the Foundry's +6% used to be dead data
  S.buildings = { manaWell: 10, hextechFoundry: 5 };
  o.foundryApplies = computeRates().mana / base;
  // v0.49 Part 1.7: the Demacian-stone monument is deleted and its globalBoost with it.
  // The same data path is now asserted on the Arcane Reactor, which took the Reactor slot.
  S.buildings = { manaWell: 10, arcaneReactor: 5 };
  o.petriciteApplies = computeRates().mana / base;
  S.buildings = {};
  return o;
});
// v0.50 Part 1.4 INVERTS this assertion's direction. It used to check the pipeline had
// enough named categories; the census's whole finding is that RR had too many — four
// globals with no Kittens counterpart, three of which were the same thing written at three
// different times. `global` is now five factors, and the sixth name is the transient
// variant of catMeta, which exists so the collapse cannot hand the drakes and the Dragon
// Soul to knowledge, culture, vigor and devotion.
check("the production pipeline names exactly the categories the census left standing",
  JSON.stringify(cats.named) === JSON.stringify(
    ["catMonument", "catReligion", "catPolicy", "catMeta", "catMetaTransient", "catBuff"]),
  cats.named.join(", "));
check("policy ratio: +1% per settled group, compounds with the rest", cats.policyBonus0 === 0 && Math.abs(cats.policyBonus3 - 0.03) < 1e-9 && Math.abs(cats.policyApplies - 1.03) < 0.001, cats.policyApplies.toFixed(3));
check("Hextech Foundry's globalBoost now actually applies (was dead data)", Math.abs(cats.foundryApplies - 1.3) < 0.001, cats.foundryApplies.toFixed(3));
check("the second globalBoost building applies via the same data path", Math.abs(cats.petriciteApplies - 1.25) < 0.001, cats.petriciteApplies.toFixed(3));

// ============ Wanderer's Welcome is no longer a dead stat at cap ============
const ww = await page.evaluate(() => {
  S.policies = {}; S.buildings = { shelter: 10 };
  const base = maxPop();
  S.policies.wanderersWelcome = true;
  const withPol = maxPop();
  const o = { base, withPol, ratio: withPol / base, arrival: policyMult("arrival") };
  o.ldrCapped = (() => { let sum = 0; for (let i = 0; i < 100; i++) sum += 0.10; return 1 + limitedDR(sum, MAXPOP_RATIO_LIMIT) < 2.0; })();
  S.policies = {}; S.buildings = {};
  return o;
});
check("Wanderer's Welcome raises the ceiling ~10% (arrival clause dropped)", ww.ratio > 1.08 && ww.ratio <= 1.10 && ww.arrival === 1, `${ww.base} → ${ww.withPol}`);
check("max-wanderer ratio is LDR-capped at +100%", ww.ldrCapped);

// ============ REGRESSIONS ============
const reg = await page.evaluate(() => {
  const o = {};
  loadFromString(btoa(unescape(encodeURIComponent(JSON.stringify(freshState())))));
  gain("mana", 60); const t0 = S.res.timber; transmuteMana(1); o.transmute = S.res.timber > t0;
  loadFromString(serialize());
  o.saveRT = isFinite(S.res.mana) && typeof S.policies === "object" && typeof S.factionsFound === "object";
  S.res.devotion = 80; S.worship = 0; const a0 = S.ascends || 0;
  ascendTargon();
  o.ascentStillPure = S.worship === 80 && S.res.devotion === 0 && S.ascends === a0 + 1;
  o.coreFns = [tick, computeRates, computeCaps, morale, ascendTargon, renderAll, renderTop].every(f => typeof f === "function");
  o.drPrimitivesExported = typeof limitedDR === "function" && typeof unlimitedDR === "function";
  o.policiesIntact = POLICY_GROUPS.length === 6;
  o.chargesIntact = typeof campCharges === "function" && CAMP_MAX_CHARGES === 2;
  o.undoIntact = typeof doUndo === "function";
  o.noNaNCaps = Object.values(computeCaps()).every(v => isFinite(v));
  o.noNaNRates = Object.values(computeRates()).every(v => isFinite(v));
  return o;
});
for (const [k, v] of Object.entries(reg)) check("regression: " + k, v === true);

for (const tab of ["settlement", "crafting", "village", "lore", "wilds", "trade", "targon", "champions"]) {
  await page.evaluate(t => {
    S.techs = { almanac: 1, cultivation: 1, woodcraft: 1, logistics: 1, mining: 1, trade: 1, smelting: 1, songcraft: 1, ritesOfTargon: 1, callToArms: 1, hexcore: 1, sparks: 1, chemtech: 1 };
    S.seenMax.knowledge = 999; S.seenMax.mana = 999; S.buildings.archive = Math.max(1, S.buildings.archive || 0); S.buildings.shelter = Math.max(1, S.buildings.shelter || 0); S.upgrades.keepingTheRolls = true; S.activeTab = t; uiDirty = true; renderAll();
  }, tab);
  await page.waitForTimeout(40);
}
check("all 8 tabs render, no console errors", errors.length === 0, errors.slice(0, 3).join(" | "));

console.log("\n" + pass + " passed, " + fail + " failed");
await browser.close();
process.exit(fail > 0 ? 1 : 0);
