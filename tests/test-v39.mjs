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
const reset = () => page.evaluate(() => loadFromString(btoa(unescape(encodeURIComponent(JSON.stringify(freshState()))))));

// ===================== §2 — the Era 2 → Era 3 gate =====================
const s2 = await page.evaluate(() => {
  const o = {};
  const sparks = TECHS.find(t => t.id === "sparks");
  o.championStillRequired = typeof sparks.unlock === "function";
  // the requirement is kept (user direction); the Renown ceiling is what was widened
  S.buildings = {}; S.techs = {}; S.upgrades = {}; S.jobs = {}; S.pop = 0;
  const base = computeCaps().renown;
  S.techs = { trade: true };            const withTrade = computeCaps().renown;
  S.techs = { drakeLore: true };        const withDrake = computeCaps().renown;
  S.techs = { voidStudies: true };      const withVoid = computeCaps().renown;
  S.techs = { trade: true, drakeLore: true, voidStudies: true };
  const withAll = computeCaps().renown;
  S.techs = {};
  const hall = BUILDINGS.find(b => b.id === "hallOfHeroes");
  const tg = BUILDINGS.find(b => b.id === "trainingGround");
  return Object.assign(o, {
    base, tradeAdds: withTrade - base, drakeAdds: withDrake - base, voidAdds: withVoid - base,
    allAdds: withAll - base,
    hallRenown: hall.caps && hall.caps.renown, tgRenown: tg.caps && tg.caps.renown,
    logisticsTrickle: /rates\.renown \+= renownTrickle/.test(computeRates.toString())
  });
});
check("Sparks keeps its champion requirement (user direction over spec §2c)", s2.championStillRequired);
check("Trade Routes widens the Renown ceiling", s2.tradeAdds === 40, `+${s2.tradeAdds}`);
check("Drake Hunt widens the Renown ceiling", s2.drakeAdds === 60, `+${s2.drakeAdds}`);
check("Baron Hunt widens the Renown ceiling", s2.voidAdds === 80, `+${s2.voidAdds}`);
check("the three stack additively, not multiplicatively", s2.allAdds === 180, `+${s2.allAdds}`);
// v0.44 Part 2.2: 120 → 250. Renown's ceiling now takes only √Masonry, so the
// building-side term has to carry more of the total for the ladder to stay reachable.
// RE-POINTED v0.58.1, superseded by NOTES 30 and 31.1. The Training Ground's renown ceiling is
// DELETED ("Training ground should not increase renown cap") and the Hall of Heroes is the only
// renown store left, its flat grant raised 250 -> 900 so note 31.2's constraint still holds
// against the new 15,377 tenth champion. Two buildings quietly sharing a ceiling is how a
// ceiling stops being legible, which is what note 30 is about.
check("Hall of Heroes carries the building-side Renown cap, and after v0.58.1 note 30 it is the ONLY one",
  s2.hallRenown === 900, String(s2.hallRenown));
check("Training Ground no longer holds Renown (v0.58.1 note 30)", s2.tgRenown === undefined, String(s2.tgRenown));
check("Expedition Logistics gives Renown a passive trickle", s2.logisticsTrickle);

// ===================== §3 — the housing wall =====================
const s3 = await page.evaluate(() => {
  const pf = UPGRADES.find(u => u.id === "petriciteFrames");
  const sg = UPGRADES.find(u => u.id === "stonecutGuild");
  const sky = BUILDINGS.find(b => b.id === "skyrise");
  return { pfTech: pf.tech, sgTech: sg.tech, skyRatio: sky.ratio, sgCost: sg.cost };
});
check("Petricite Frames no longer sits behind Deep Works", s3.pfTech === "hexcore", s3.pfTech);
check("Stonecut Guild no longer sits behind Deep Works", s3.sgTech === "petricite", s3.sgTech);
check("Stonecut Guild costs the Era-1 stoneSlab, not the Era-3 hexSlab", s3.sgCost.stoneSlab === 150 && s3.sgCost.hexSlab === undefined, JSON.stringify(s3.sgCost));
check("Skyrise normalised to the 1.15 band", Math.abs(s3.skyRatio - 1.15) < 1e-9, String(s3.skyRatio));

// ===================== §4 — Era 3 raw resources become autoprod =====================
const s4 = await page.evaluate(() => {
  const o = {};
  o.jobsGone = !JOBS.some(j => j.id === "prospector" || j.id === "stoker");
  o.jobIds = JOBS.map(j => j.id).join(",");
  ["sumpMine", "coalgasVent", "hexQuarry"].forEach(id => {
    const b = BUILDINGS.find(x => x.id === id);
    o[id] = !!(b.autoprod && b.convert && b.convert.output);
  });
  // the smelterRatio analog
  o.limit = typeof AUTOPROD_LIMIT !== "undefined" && AUTOPROD_LIMIT === 2.0;
  S.buildings = {}; S.techs = {}; S.upgrades = {}; S.policies = {}; S.champs = {};
  o.multBare = +autoprodMult().toFixed(4);
  S.techs = { deepWorks: true };
  o.multDeepWorks = +autoprodMult().toFixed(4);
  S.buildings = { chembarrel: 4 };
  o.multFourBarrels = +autoprodMult().toFixed(4);
  S.buildings = { chembarrel: 500 };
  o.multCeiling = +autoprodMult().toFixed(4);
  S.buildings = {}; S.techs = {};
  return o;
});
check("Prospector and Stoker jobs are gone entirely", s4.jobsGone, s4.jobIds);
check("Sump Mine is a passive converter", s4.sumpMine);
check("Coalgas Vent is a passive converter", s4.coalgasVent);
check("Hexcrystal Quarry is a passive converter", s4.hexQuarry);
check("AUTOPROD_LIMIT is the smelterRatio analog at 2.0", s4.limit);
check("bare autoprod multiplier is 1.0", s4.multBare === 1, String(s4.multBare));
check("Deep Works raises it", s4.multDeepWorks > 1.4, String(s4.multDeepWorks));
check("Chembarrels raise it further", s4.multFourBarrels > s4.multDeepWorks, `${s4.multDeepWorks} → ${s4.multFourBarrels}`);
check("and it never reaches the 3.0 ceiling", s4.multCeiling < 3.0 && s4.multCeiling > 2.7, String(s4.multCeiling));

// ===================== §5 — storage cost composition =====================
const s5 = await page.evaluate(() => {
  const c = id => BUILDINGS.find(b => b.id === id).cost;
  const beam = CRAFTS.find(x => x.id === "beam");
  return {
    warehouse: c("warehouse"), harbor: c("harbor"), storehouse: c("storehouse"),
    beamShowsAt: (() => { const t = { carpentry: true }; return beam.show({ techs: t, upgrades: {}, seenMax: {} }); })(),
    beamNotSparksOnly: !/techs\.sparks/.test(beam.show.toString()) &&
      !/techs\.sparks/.test(CRAFTS.find(c => c.id === "scaffold").show.toString()),
    warehouseRatio: BUILDINGS.find(b => b.id === "warehouse").ratio,
    harborRatio: BUILDINGS.find(b => b.id === "harbor").ratio
  };
});
// v0.42 Part 4 supersedes the quantities: Kittens prices the Warehouse at beam 1.5 +
// slab 2 — fractional crafted goods, because crafted materials are meant to accumulate
// quietly rather than be a project. RR asked four times that for the building a player
// buys constantly. The property — paid in CRAFTED goods, not raw — is unchanged.
check("Warehouse is paid in crafted goods", s5.warehouse.beam === 2 && s5.warehouse.stoneSlab === 3 && s5.warehouse.timber === undefined, JSON.stringify(s5.warehouse));
check("Harbor is paid in crafted goods", s5.harbor.stoneSlab === 50 && s5.harbor.gear === 20 && s5.harbor.beam === 30 && s5.harbor.ore === undefined, JSON.stringify(s5.harbor));
// SUPERSEDED v0.47 Part 4.4: Kittens' barn is `wood 50` — ONE raw material. The ore cost
// is gone entirely, so "raw-only" is now "timber-only".
check("Storehouse is timber-only, Kittens' barn exactly", s5.storehouse.timber === 50 && s5.storehouse.ore === undefined, JSON.stringify(s5.storehouse));
check("both storage ratios stay 1.15", Math.abs(s5.warehouseRatio - 1.15) < 1e-9 && Math.abs(s5.harborRatio - 1.15) < 1e-9);
// SUPERSEDED v0.47 Part 1.4(a): beam AND scaffold both moved to Carpentry (rank 7), which
// is what fixed the live deadlock that made the Quarry and Observatory unbuildable.
check("Beams and Scaffolds both gate on Carpentry", s5.beamShowsAt && s5.beamNotSparksOnly);

// ===================== §6 — Celestial Observatory =====================
const s6 = await page.evaluate(() => {
  const o = BUILDINGS.find(b => b.id === "observatory");
  S.techs = {}; const lockedNoSparks = !!(o.unlock && !o.unlock(S));
  S.techs = { sparks: true }; const openWithSparks = !o.unlock || !!o.unlock(S);
  S.techs = {};
  return { cost: o.cost, lockedNoSparks, openWithSparks, boost: o.boost.knowledge, ratio: o.ratio };
});
// v0.41 §2.1(a) WITHDRAWS the Sparks gate v0.39 §6 added. With Tomes out of the
// Knowledge cap the Observatory is the only ceiling between Academies and 200,000
// Knowledge, so gating it behind Sparks deadlocks Sparks — the analyzer withdrew its
// own instruction. The Observatory is an Era-1 building again.
check("the Observatory is buildable from Rites of Targon, no Sparks gate", s6.lockedNoSparks === false);
// SUPERSEDED v0.46 Part 1. Kittens' observatory asks for fifty SCAFFOLD (16.7 beams
// each, 972 wood each), not fifty beams. One word, a factor of 19 in effective raw cost,
// and it is most of why 45 Observatories were built against a target of 25.
// RE-POINTED v0.58.1, superseded by NOTES 39 and 46: "Celestial Observatory should cost Steel
// instead of Ore" and "let's have the first one cost 35 scaffolds". The SCAFFOLD half — the
// v0.46 fix this assertion exists to protect, a factor of 19 — is intact; the quantity moved.
check("Observatory still pays SCAFFOLD (v0.46's fix), at v0.58.1's 35, and STEEL not ore",
  s6.cost.steel === 150 && s6.cost.ore === undefined && s6.cost.knowledge === 1000 &&
  s6.cost.stoneSlab === 35 && s6.cost.scaffold === 35, JSON.stringify(s6.cost));
// Deliberate deviation from spec §6's parenthetical, which said hexSlab. Kittens'
// Observatory slab is the Era-1 MINERAL slab (250 minerals) — the spec's own §7 table
// maps that to RR's stoneSlab. Reading it as hexSlab makes the Observatory
// hexcore-gated, three techs past Sparks, and the Knowledge cap then cannot grow
// enough to afford Chemtech at all. Measured: the run stalled dead at year 65.
check("Observatory is affordable at Sparks (stoneSlab, not the hexcore-gated hexSlab)",
  s6.cost.hexSlab === undefined);
check("Observatory's effect and ratio are untouched", s6.boost === 0.25 && Math.abs(s6.ratio - 1.10) < 1e-9);

// ===================== §7 — craft and tech inflation =====================
const s7 = await page.evaluate(() => {
  const c = id => CRAFTS.find(x => x.id === id).cost;
  const t = id => TECHS.find(x => x.id === id).cost.knowledge;
  const b = id => BUILDINGS.find(x => x.id === id).cost;
  return {
    beam: c("beam"), stoneSlab: c("stoneSlab"), scaffold: c("scaffold"), plating: c("plating"),
    gear: c("gear"), alloy: c("alloy"), hexgear: c("hexgear"), hexcore: c("hexcore"),
    parchment: c("parchment"), tome: c("tome"),
    techs: { sparks: t("sparks"), chemtech: t("chemtech"), hexcore: t("hexcore"), deepWorks: t("deepWorks"), icathia: t("icathia") },
    foundry: b("hextechFoundry"), vault: b("vault"), spire: b("piltoverSpire"), chembarrel: b("chembarrel")
  };
});
check("Support Beam 25 → 150 timber", s7.beam.timber === 150);
check("Stone Slab 50 → 200 ore", s7.stoneSlab.ore === 200);
check("Scaffold 4 → 40 beam", s7.scaffold.beam === 40);
check("Iron Plating 15 → 100 Zaun Ore", s7.plating.zaunore === 100);
check("Gear 8 → 25 steel", s7.gear.steel === 25);
check("Chemtech Alloy 12+8 → 60+30", s7.alloy.zaunore === 60 && s7.alloy.coalgas === 30);
check("Hexgear 4 → 25 alloy", s7.hexgear.alloy === 25);
check("Hextech Core 6/4/3 → 40/30/20", s7.hexcore.hexgear === 40 && s7.hexcore.hexSlab === 30 && s7.hexcore.scaffold === 20);
check("Parchment 4 → 175 furs (Kittens parity, backed by the fur measurement)", s7.parchment.furs === 175, JSON.stringify(s7.parchment));
check("Tome 5 parchment → 50 parchment, and costs Knowledge like Kittens' Compendium",
  s7.tome.parchment === 50 && s7.tome.knowledge === 1500, JSON.stringify(s7.tome));
// v0.44 Part 2.5 reverses this stretch. The v0.39 ladder priced Era 3 at 9-37x the
// Kittens rungs it corresponds to, which is what produced the ×14.3 cliff.
// SUPERSEDED v0.46 Part 5 — the ladder was trimmed 45 -> 38 and re-skewed to Kittens'
// shape (big early jumps, flat after). The v0.44 Part 2.5 prices are retired; what is
// asserted now is the SHAPE that produces Kittens' median and geometric mean together.
// SUPERSEDED v0.47 Part 1 — the ladder is Kittens' ladder rank for rank now.
check("Era 3 tech ladder sits on the v0.47 Kittens-parity curve",
  s7.techs.sparks === 20000 && s7.techs.chemtech === 55000 && s7.techs.hexcore === 75000 &&
  s7.techs.deepWorks === 100000 && s7.techs.icathia === 135000, JSON.stringify(s7.techs));
check("Hextech Foundry 30/15 → 200/100", s7.foundry.hexgear === 200 && s7.foundry.scaffold === 100);
check("The Vault 15/25 → 100/160", s7.vault.hexSlab === 100 && s7.vault.plating === 160);
check("Piltover Spire 20/12 → 130/80", s7.spire.scaffold === 130 && s7.spire.hexSlab === 80);
check("Chembarrel Refinery 25/20 → 160/130", s7.chembarrel.alloy === 160 && s7.chembarrel.plating === 130);

// ===================== §8 — the Freljord capstone =====================
await reset();
const s8 = await page.evaluate(() => {
  const o = {};
  const fm = CRAFTS.find(c => c.id === "frostMegalith");
  const eye = BUILDINGS.find(b => b.id === "watchersEye");
  const sac = CRAFTS.find(c => c.id === "poroTears");
  o.megalithExists = !!fm;
  o.megalithCost = fm && fm.cost;
  o.eyeExists = !!eye;
  o.eyeCost = eye && eye.cost;
  o.eyeRatio = eye && eye.ratio;
  o.eyeTech = eye && eye.tech;
  o.eyePct = eye && eye.cultureCapPct;
  o.sacExists = !!sac;
  o.sacCost = sac && sac.cost;

  // culture cap is a percentage multiplier, additive per copy
  S.buildings = { bardsHearth: 10 }; S.techs = {}; S.upgrades = {}; S.policies = {}; S.champs = {};
  const noEye = computeCaps().culture;
  S.buildings.watchersEye = 1; const oneEye = computeCaps().culture;
  S.buildings.watchersEye = 2; const twoEyes = computeCaps().culture;
  o.oneEyePct = +((oneEye / noEye - 1)).toFixed(4);
  o.additive = Math.abs(twoEyes / noEye - 1.16) < 0.002;

  // the sacrifice yields exactly one Tear per Eye, no craft bonuses
  S.buildings = { watchersEye: 3, workshop: 50 };
  S.upgrades = { }; S.policies = { piltoverConcord: undefined };
  o.yieldEqualsEyes = craftYield("poroTears") === 3;
  S.res.poros = PORO_SACRIFICE_COST * 2; S.res.poroTears = 0;
  o.sacShows = sac.show(S);
  craftItem("poroTears", 1);
  o.tearsGained = S.res.poroTears;
  o.porosSpent = PORO_SACRIFICE_COST * 2 - S.res.poros;
  o.sacCostConst = PORO_SACRIFICE_COST;

  // no Eye means no sacrifice
  S.buildings = {}; o.sacHiddenWithoutEye = !sac.show(S);
  S.res.poros = 0; S.res.poroTears = 0;
  return o;
});
check("Frost Megalith craft exists with the spec's recipe",
  s8.megalithExists && s8.megalithCost.beam === 50 && s8.megalithCost.plating === 25 && s8.megalithCost.hexSlab === 50,
  JSON.stringify(s8.megalithCost));
check("Watcher's Eye exists at Deep Works with the spec's cost",
  s8.eyeExists && s8.eyeTech === "deepWorks" && s8.eyeCost.scaffold === 50 && s8.eyeCost.tome === 1 && s8.eyeCost.frostMegalith === 50,
  JSON.stringify(s8.eyeCost));
check("Watcher's Eye uses the 1.25 capstone ratio", Math.abs(s8.eyeRatio - 1.25) < 1e-9);
check("one Eye is +8% Culture cap", s8.eyePct === 0.08 && Math.abs(s8.oneEyePct - 0.08) < 0.002, String(s8.oneEyePct));
check("Eyes stack additively (+16% at two), never compounding", s8.additive);
check("the Poro sacrifice exists and is gated on owning an Eye", s8.sacExists && s8.sacShows && s8.sacHiddenWithoutEye);
check("Tears per sacrifice equal the number of Eyes, exactly 1:1", s8.yieldEqualsEyes && s8.tearsGained === 3, `${s8.tearsGained} tears from 3 eyes`);
// v0.40 Part 1C retuned the sacrifice from 250 to 60: measured Poro stockpiles run
// ~1/game-year, so 250 was ~2.5x a mid-game hoard and the mechanic would have fired
// once and gone dead for a century.
const PORO_COST = s8.sacCostConst;
check("the sacrifice actually spends Poros", s8.porosSpent === PORO_COST, `${s8.porosSpent} poros`);

// ===================== §9 — the smaller items =====================
const s9 = await page.evaluate(() => {
  const o = {};
  o.mining = TECHS.find(t => t.id === "mining").cost.knowledge;
  o.songcraft = TECHS.find(t => t.id === "songcraft").cost.knowledge;
  o.offline = OFFLINE_CAP_HOURS;
  o.comfortScales = typeof luxuryComfort === "function";
  S.pop = 5; S.buildings = {}; S.jackboxes = 0; S.wanderers = []; invalidateCensus();
  o.comfortSmall = luxuryComfort();
  S.pop = 130; invalidateCensus();
  o.comfortLarge = luxuryComfort();
  // a stock that fully satisfies a village of 20 does not satisfy one of 130
  const at = (pop, v) => {
    S.pop = pop; invalidateCensus();
    ["mushrooms", "furs", "plumes", "poros", "trueice"].forEach(r => S.res[r] = 0);
    const none = morale();
    S.res.furs = v;
    return morale() - none;
  };
  o.smallSatisfied = at(20, 80);
  o.largeUnsatisfied = at(130, 80);
  S.pop = 0; S.res.furs = 0; invalidateCensus();
  // §9.4 — the slab rename
  o.noBareSlabRes = typeof RES.slab === "undefined";
  o.hexSlabExists = typeof RES.hexSlab !== "undefined";
  o.stoneSlabExists = typeof RES.stoneSlab !== "undefined";
  return o;
});
// SUPERSEDED v0.46 Part 5: the whole ladder was re-skewed. The invariant that matters
// — Mining still sits above Songcraft, no backwards step — is unchanged.
// SUPERSEDED v0.47 Part 1 / Jerry's swap: Mining is rank 4 (Kittens' `mining 500`) and
// Songcraft rank 9 (`construction 1,300`), so Mining is now deliberately BELOW Songcraft.
// The swap exists so the ore economy is in place before anything asks for ore.
check("Mining sits at Kittens' 500, three ranks before Songcraft", s9.mining === 500 && s9.songcraft === 1300, `${s9.mining} / ${s9.songcraft}`);
check("OFFLINE_CAP_HOURS 4 → 12", s9.offline === 12, String(s9.offline));
check("luxury comfort scales with population", s9.comfortScales && s9.comfortLarge > s9.comfortSmall * 4, `${s9.comfortSmall} → ${s9.comfortLarge}`);
check("a stock that pleases 20 wanderers no longer pleases 130",
  s9.smallSatisfied === 10 && s9.largeUnsatisfied < 10, `+${s9.smallSatisfied} at pop 20, +${s9.largeUnsatisfied} at pop 130`);
check("§9.4 rename: no bare `slab`, both stoneSlab and hexSlab present", s9.noBareSlabRes && s9.hexSlabExists && s9.stoneSlabExists);

// ===== STRUCTURAL FIX (not in the spec, required for §5/§6/§7 to function) =====
const sx = await page.evaluate(() => {
  const caps = (() => {
    S.buildings = {}; BUILDINGS.forEach(b => S.buildings[b.id] = 5);
    S.techs = {}; TECHS.forEach(t => S.techs[t.id] = true);
    S.upgrades = {}; UPGRADES.forEach(u => S.upgrades[u.id] = true);
    S.pop = 100; invalidateCensus();
    return computeCaps();
  })();
  const crafted = ["stoneSlab", "beam", "scaffold", "plating", "alloy", "hexgear", "hexSlab", "hexcrete", "focusedHex", "voidglass", "chronoshard", "gear", "parchment", "tome"];
  const rawEra3 = ["zaunore", "coalgas", "hexore", "shimmer", "voidessence"];
  const o = {
    craftedUncapped: crafted.filter(r => caps[r] !== undefined),
    rawStillCapped: rawEra3.filter(r => caps[r] === undefined),
    noNaN: Object.entries(caps).filter(([, v]) => !isFinite(v)).map(([k]) => k)
  };
  // the deadlock itself: a building whose crafted cost exceeds any old ceiling
  // must still be reachable
  S.buildings = { observatory: 40 };
  const c = buildingCost(BUILDINGS.find(b => b.id === "observatory"));
  o.escalatedScaffold = Math.round(c.scaffold);
  o.scaffoldCapUndefined = computeCaps().scaffold === undefined;
  S.buildings = {}; S.techs = {}; S.upgrades = {}; S.pop = 0; invalidateCensus();
  return o;
});
check("crafted materials are uncapped, as in Kittens", sx.craftedUncapped.length === 0, sx.craftedUncapped.join(","));
check("raw Era-3 resources keep their storage limits", sx.rawStillCapped.length === 0, sx.rawStillCapped.join(","));
check("uncapping introduces no NaN caps", sx.noNaN.length === 0, sx.noNaN.join(","));
// v0.41 swapped the Observatory's Scaffold for Beam; the property is unchanged.
// SUPERSEDED v0.46 Part 1: the Observatory's crafted component is scaffold now, not beam.
// The invariant is unchanged — a geometrically escalated CRAFTED cost must have no ceiling
// to run into, which is why v0.39 uncapped all eleven crafted materials.
check("an escalated crafted cost can no longer exceed its own ceiling",
  sx.escalatedScaffold > 900 && sx.scaffoldCapUndefined, `Observatory #41 wants ${sx.escalatedScaffold} scaffold`);
check("buildings priced in crafted goods are visible before you have crafted any",
  await page.evaluate(() => {
    loadFromString(btoa(unescape(encodeURIComponent(JSON.stringify(freshState())))));
    // v0.47 Part 1.4(b): the Warehouse is a Carpentry building now, and beams are a
    // Carpentry recipe — which is the whole point, since it costs beam 2.
    S.techs = { almanac: 1, woodcraft: 1, mining: 1, carpentry: 1 }; S.upgrades = { slabCutting: 1 };
    S.seenMax.beam = 0; S.seenMax.stoneSlab = 0;
    return buildingVisible(BUILDINGS.find(b => b.id === "warehouse"));
  }));

// ===================== regressions =====================
await reset();
const reg = await page.evaluate(() => {
  const o = {};
  // Ascent is still free, cooldownless, bonusless
  o.ascentPure = !/cost|cooldown|Until/i.test(ascendTargon.toString());
  S.res.devotion = 500; S.worship = 0;
  ascendTargon();
  o.ascentBanks = S.worship === 500 && S.res.devotion === 0;
  ascendTargon();
  o.ascentNoCooldown = true;
  // core function names survive
  o.coreFns = ["tick", "computeRates", "computeCaps", "morale", "ascendTargon", "renderAll", "renderTop"]
    .every(f => typeof window[f] === "function");
  // no NaN anywhere
  S.buildings = {}; BUILDINGS.forEach(b => S.buildings[b.id] = 3);
  S.techs = {}; TECHS.forEach(t => S.techs[t.id] = true);
  S.upgrades = {}; UPGRADES.forEach(u => S.upgrades[u.id] = true);
  S.pop = 130; S.jobs = { farmer: 20, loremaster: 20, miner: 20, woodcutter: 20, acolyte: 20 };
  invalidateCensus();
  const caps = computeCaps(), rates = computeRates();
  o.noNaNCaps = Object.values(caps).every(v => isFinite(v));
  o.noNaNRates = Object.values(rates).every(v => isFinite(v));
  o.moraleFinite = isFinite(morale());
  o.badCaps = Object.entries(caps).filter(([, v]) => !isFinite(v)).map(([k]) => k).join(",");
  o.badRates = Object.entries(rates).filter(([, v]) => !isFinite(v)).map(([k]) => k).join(",");
  return o;
});
check("regression: Ascent is still free, cooldownless and bonusless", reg.ascentPure && reg.ascentBanks && reg.ascentNoCooldown);
check("regression: core function names unchanged", reg.coreFns);
check("regression: no NaN caps with everything owned", reg.noNaNCaps, reg.badCaps);
check("regression: no NaN rates with everything owned", reg.noNaNRates, reg.badRates);
check("regression: morale finite at 130 wanderers", reg.moraleFinite);

// save round-trip with the new resources
await reset();
const rt = await page.evaluate(() => {
  S.res.frostMegalith = 7; S.res.poroTears = 3; S.buildings.watchersEye = 2;
  const blob = btoa(unescape(encodeURIComponent(JSON.stringify(S))));
  loadFromString(blob);
  return S.res.frostMegalith === 7 && S.res.poroTears === 3 && S.buildings.watchersEye === 2;
});
check("regression: saves round-trip the new Freljord resources", rt);

// every tab renders, with the full Era-3 build owned
await reset();
for (const tab of ["settlement", "crafting", "village", "lore", "wilds", "trade", "targon", "champions"]) {
  await page.evaluate(t => {
    S.techs = {}; TECHS.forEach(x => S.techs[x.id] = true);
    S.upgrades = {}; UPGRADES.forEach(u => S.upgrades[u.id] = true);
    S.buildings = {}; BUILDINGS.forEach(b => S.buildings[b.id] = 2);
    S.pop = 20; syncRoster(); S.seenMax.knowledge = 999; S.worship = 2000;
    for (const r in RES) S.seenMax[r] = 999;
    S.buildings.archive = Math.max(1, S.buildings.archive || 0); S.buildings.shelter = Math.max(1, S.buildings.shelter || 0); S.upgrades.keepingTheRolls = true; S.activeTab = t; uiDirty = true; renderAll();
  }, tab);
  await page.waitForTimeout(40);
}
check("all 8 tabs render with the full Era-3 build, no console errors", errors.length === 0, errors.slice(0, 3).join(" | "));

console.log(`\n${pass} passed, ${fail} failed`);
await browser.close();
process.exit(fail ? 1 : 0);
