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

// ==================== Part 4 — the craft yield ceiling ====================
await reset();
const p4 = await page.evaluate(() => {
  const o = { limit: CRAFT_YIELD_LIMIT };
  S.jobs = {}; S.policies = {}; S.champs = {}; S.wanderers = []; S.upgrades = {}; S.buildings = {};
  o.bare = +craftYield("stoneSlab").toFixed(3);
  S.buildings = { workshop: 1e7 };
  o.ceiling = +craftYield("stoneSlab").toFixed(3);
  S.upgrades = { scribesGuild: 1, greatLibrary: 1, illuminators: 1 };
  o.parchCeiling = +craftYield("parchment").toFixed(3);
  o.tomeCeiling = +craftYield("tome").toFixed(3);
  // one craft action yields craftYield() units, so THIS is the number recipes are
  // really priced against — the thing four rounds of tuning did not account for
  S.buildings = { workshop: 60 }; S.upgrades = {};
  S.techs = { mining: 1 }; S.upgrades = { slabCutting: 1 };
  S.res.ore = 1e6; S.res.stoneSlab = 0;
  craftItem("stoneSlab", 1);
  o.orePerSlab = +((1e6 - S.res.ore) / S.res.stoneSlab).toFixed(1);
  S.buildings = {}; S.upgrades = {}; S.techs = {}; S.res.ore = 0; S.res.stoneSlab = 0;
  return o;
});
check("CRAFT_YIELD_LIMIT drops 4 → 2.2", p4.limit === 2.2, String(p4.limit));
check("craft yield still starts at ×1", p4.bare === 1);
check("...and tops out at Kittens' ~×3.2, not ×5", p4.ceiling > 3.1 && p4.ceiling <= 3.2, `×${p4.ceiling}`);
check("the scribal stack tops out near ×4.2, not ×9.375",
  p4.parchCeiling > 4.0 && p4.parchCeiling < 4.4 && Math.abs(p4.parchCeiling - p4.tomeCeiling) < 1e-6,
  `×${p4.parchCeiling}`);
check("effective ore per Stone Slab is now ~65, not ~40", p4.orePerSlab > 55 && p4.orePerSlab < 75, `${p4.orePerSlab} ore/slab`);

const scrip = await page.evaluate(() => ({
  guild: UPGRADES.find(u => u.id === "scribesGuild").desc,
  illum: UPGRADES.find(u => u.id === "illuminators").desc,
  lib: UPGRADES.find(u => u.id === "greatLibrary").desc,
  warehouse: BUILDINGS.find(b => b.id === "warehouse").cost
}));
check("the scriptorium descriptions match the new multipliers",
  /\+10%/.test(scrip.guild) && /\+10%/.test(scrip.illum) && /\+20%/.test(scrip.lib));
check("Warehouse drops to Kittens' fractional-crafted shape — beam 2, slab 3",
  scrip.warehouse.beam === 2 && scrip.warehouse.stoneSlab === 3, JSON.stringify(scrip.warehouse));

// the number the spec named as its target
const eff = await page.evaluate(() => {
  S.jobs = {}; S.policies = {}; S.champs = {}; S.wanderers = [];
  S.techs = {}; TECHS.forEach(t => S.techs[t.id] = true);
  S.buildings = { workshop: 60 };
  S.upgrades = { scribesGuild: 1, illuminators: 1, greatLibrary: 1 };
  const perParchment = craftCostOf("parchment").furs / craftYield("parchment");
  const tc = craftCostOf("tome");
  const perTome = (tc.parchment / craftYield("tome")) * perParchment;
  S.buildings = {}; S.upgrades = {}; S.techs = {};
  return { perParchment: +perParchment.toFixed(1), perTome: +perTome.toFixed(1) };
});
check("effective Tome cost lands near 400 furs, not 100", eff.perTome > 350 && eff.perTome < 700,
  `${eff.perTome} furs/tome (${eff.perParchment} furs/parchment)`);

// ==================== Parts 2a / 2b / 3 — the knowledge system ====================
const know = await page.evaluate(() => {
  const o = {};
  S.jobs = {}; S.policies = {}; S.champs = {}; S.wtechs = {}; S.wanderers = []; S.pop = 0; S.drakes = {}; S.leader = null;
  S.buildings = { archive: 40 }; S.techs = {}; S.upgrades = {};
  S.res.morellonomicon = 0; S.res.tome = 0;
  const base = computeCaps().knowledge;
  o.base = Math.round(base);
  // the clamp: compendia can AT MOST double the building cap, never more
  S.res.morellonomicon = 1; o.one = Math.round(computeCaps().knowledge);
  S.res.morellonomicon = Math.ceil(base / 150) + 5; o.atClamp = Math.round(computeCaps().knowledge);
  S.res.morellonomicon = 1e7; o.absurd = Math.round(computeCaps().knowledge);
  o.perUnit = o.one - o.base;
  o.doublesExactly = Math.abs(o.absurd - base * 2) < 1;
  S.res.morellonomicon = 0;
  // Scholarship at ×4
  // v0.44 Part 2.5.2 moved the line off knowledge; the ×3.99 magnitude is unchanged
  // and is now asserted where it still applies.
  S.buildings = { archive: 40, bardsHearth: 5 }; S.res.tome = 0;
  const cbase = computeCaps().culture;
  S.upgrades = { cataloguing: 1, crossReferencing: 1, greatIndex: 1, annotatedIndex: 1, livingLibrary: 1 };
  o.scholarMult = +(computeCaps().culture / cbase).toFixed(3);
  o.knowledgeUntouched = Math.abs(computeCaps().knowledge / base - 1) < 1e-6;
  S.upgrades = {}; S.buildings = { archive: 40 };
  // Tomes now raise the CULTURE cap, Kittens' manuscript role
  S.buildings = { archive: 40, bardsHearth: 5 };
  const c0 = computeCaps().culture;
  S.res.tome = 100; const c100 = computeCaps().culture;
  S.res.tome = 10000; const c10k = computeCaps().culture;
  o.cultureFromTomes100 = Math.round(c100 - c0);
  o.sublinear = (c10k - c0) < (c100 - c0) * 100;   // UDR, not linear
  o.tomeKnowledgeUnchanged = true;
  S.res.tome = 0;
  const kNoTome = computeCaps().knowledge;
  S.res.tome = 1e6;
  o.tomeKnowledgeUnchanged = Math.abs(computeCaps().knowledge - kNoTome) < 1e-9;
  S.res.tome = 0; S.buildings = {};
  // the craft itself
  const m = CRAFTS.find(c => c.id === "morellonomicon");
  o.recipe = m && m.cost;
  o.gatedOnCrossRef = m && /crossReferencing/.test(m.show.toString());
  return o;
});
check("a Morellonomicon is worth +150 knowledge cap", know.perUnit === 150, `+${know.perUnit}`);
check("the compendium line is CLAMPED to the building cap — at most a doubling, ever",
  know.doublesExactly, `${know.base} building cap → ${know.absurd} with unlimited compendia`);
// RE-POINTED v0.58, superseded by SPEC PART 3. v0.42 cut the chain ×22.4 → ×3.99; v0.58 retires
// the chain outright for an additive accumulator at ×2.60. Same assertion, one more cut.
// RE-POINTED v0.58.1, superseded by NOTE 15 / STANDING-RULINGS §29: CULTURE LEAVES THE
// SCHOLARSHIP LINE ENTIRELY. Kittens' fixed-multiplier culture ceiling is ×1.05 and RR's was
// ×6.43; the structural half of closing that gap is that culture takes no whole-cap multiplier
// at all, so the Scholarship line reaches renown alone. The line is still additive (§23a) and
// still delivers ×2.60 — to renown — and that is asserted in test-v58.
check("Scholarship: ×22.4 (v0.41) → ×3.99 (v0.42) → ×2.60 additive (v0.58) → off culture entirely (v0.58.1)",
  Math.abs(know.scholarMult - 1) < 0.02, `culture ×${know.scholarMult}`);
check("and v0.44 Part 2.5.2 takes it off the knowledge cap entirely", know.knowledgeUntouched === true);
check("the Morellonomicon recipe is Kittens' compendium, rescaled",
  know.recipe && know.recipe.tome === 30 && know.recipe.knowledge === 9000 && know.gatedOnCrossRef,
  JSON.stringify(know.recipe));
check("Tomes raise the CULTURE cap now — Kittens' actual manuscript role",
  know.cultureFromTomes100 > 0 && know.sublinear, `+${know.cultureFromTomes100} culture at 100 tomes, sub-linear`);
check("...and Tomes still contribute nothing to the knowledge cap directly", know.tomeKnowledgeUnchanged);

// ==================== Parts 2d / 2e / 2f + 4.2 ====================
const rates = await page.evaluate(() => {
  const j = id => JOBS.find(x => x.id === id);
  const shelter = BUILDINGS.find(b => b.id === "shelter");
  const quarry = BUILDINGS.find(b => b.id === "quarry");
  const mine = BUILDINGS.find(b => b.id === "mine");
  return {
    acolyte: j("acolyte").prod.devotion, acolyteDesc: j("acolyte").desc,
    jungler: j("jungler").prod.vigor, junglerDesc: j("jungler").desc,
    shelterCost: shelter.cost, shelterRatio: shelter.ratio, shelterPop: shelter.pop,
    quarry: quarry && { tech: quarry.tech, ratio: quarry.ratio, boost: quarry.jobBoost, cost: quarry.cost },
    mineBoost: mine.jobBoost
  };
});
// SUPERSEDED v0.45 Part 4: 0.012 was still 1.60x Kittens. js/village.js priest is
// 0.0015 faith/tick; Kittens ticks 5/s, so exact parity is 0.0075/s.
check("Acolyte 0.012 → 0.0075 devotion/s — EXACT Kittens priest parity, not 1.6x",
  rates.acolyte === 0.0075 && /0\.0075/.test(rates.acolyteDesc), String(rates.acolyte));
check("Jungler 0.15 → 0.30 vigor/s — exact Kittens hunter parity",
  rates.jungler === 0.30 && /0\.30/.test(rates.junglerDesc), String(rates.jungler));
check("Shelter takes Kittens' hut shape: trivial base, punishing ratio",
  rates.shelterCost.timber === 8 && rates.shelterCost.provisions === undefined &&
  Math.abs(rates.shelterRatio - 2.20) < 1e-9 && rates.shelterPop === 2, JSON.stringify(rates.shelterCost));
check("a Quarry exists as the second ore-side building, at 1.15 like Kittens'",
  rates.quarry && Math.abs(rates.quarry.ratio - 1.15) < 1e-9 && rates.quarry.boost.miner > 0,
  JSON.stringify(rates.quarry && rates.quarry.boost));
check("Mine and Quarry both boost the same job, additively", rates.mineBoost.miner === 0.20 && rates.quarry.boost.miner === 0.35);

// ==================== Part 1.3 — the tech ladder ====================
const ladder = await page.evaluate(() => {
  const k = TECHS.filter(t => t.cost.knowledge).map(t => ({ id: t.id, k: t.cost.knowledge })).sort((a, b) => a.k - b.k);
  const steps = []; for (let i = 1; i < k.length; i++) steps.push(k[i].k / k[i - 1].k);
  const sorted = [...steps].sort((a, b) => a - b);
  // v0.44 Part 2.5 re-prices the ladder; Era 3 now begins at Sparks = 20,000.
  const era3 = k.filter(t => t.k >= 20000);
  // every prerequisite chain must rise monotonically — the real rule, per Part 0.6
  const chainViolations = TECHS.filter(t => {
    if (!t.req || !t.cost.knowledge) return false;
    const p = TECHS.find(x => x.id === t.req);
    return p && p.cost.knowledge && t.cost.knowledge <= p.cost.knowledge;
  }).map(t => t.id + " <= " + t.req);
  return {
    count: k.length, era3Rungs: era3.length,
    median: +sorted[Math.floor(sorted.length / 2)].toFixed(3),
    max: +Math.max(...steps).toFixed(3),
    over3: steps.filter(x => x > 3).length,
    chainViolations,
    prices: { sparks: k.find(t => t.id === "sparks").k, chemtech: k.find(t => t.id === "chemtech").k,
              hexcore: k.find(t => t.id === "hexcore").k, deepWorks: k.find(t => t.id === "deepWorks").k,
              icathia: k.find(t => t.id === "icathia").k }
  };
});
check("the tech count rises from 22 toward Kittens' 61", ladder.count >= 32, `${ladder.count} science-costed techs`);
// SUPERSEDED v0.45 Part 6: two of the ten branch techs (Shimmerworks, Chronometry)
// land inside Era 3, so the floor is 15 rather than the exact count.
// SUPERSEDED v0.46 Part 5: Sparks moved 20,000 -> 15,400, so a k>=20000 filter no longer
// means "Era 3". Count from Sparks' own price instead, and the floor drops to 13 because
// the trim retired two Era-3 branches (Shimmerworks, Chronometry).
check("Era 3 is still a deep ladder, not a five-rung one", ladder.era3Rungs >= 12, String(ladder.era3Rungs));
// SUPERSEDED v0.45 Part 6. The target moved to x1.10-1.20, derived from Kittens' own
// median over the price span RR covers (calendar 30 -> electronics 135,000), which is
// ~x1.13 because five EXACT ties and eight sub-x1.10 steps sit in it as branches.
check("median cost-sorted step lands in Kittens' ×1.10–1.20 band", ladder.median >= 1.10 && ladder.median <= 1.20, `×${ladder.median}`);
// SUPERSEDED v0.46 Part 5: the re-skew deliberately restores Kittens' big early jumps —
// calendar 30 -> agriculture 100 is x3.33 in the source. The cliff that mattered was the
// x14.3 at Call to Arms -> Sparks, and it is still gone (now x2.0).
check("no step exceeds Kittens' own largest early step, and the ×14.3 cliff is gone",
  ladder.max <= 3.35, `max ×${ladder.max}`);
check("cost rises monotonically along every prerequisite chain (Part 0.6's real rule)",
  ladder.chainViolations.length === 0, ladder.chainViolations.join(", "));
// superseded by v0.44 Part 2.5 — see test-v44
// SUPERSEDED v0.46 Part 5 — re-skewed ladder.
// SUPERSEDED v0.47 Part 1 — the ladder is Kittens' ladder rank for rank now.
check("the five Era-3 anchors sit on the v0.47 Kittens-parity ladder",
  ladder.prices.sparks === 20000 && ladder.prices.chemtech === 55000 && ladder.prices.hexcore === 75000 &&
  ladder.prices.deepWorks === 100000 && ladder.prices.icathia === 135000, JSON.stringify(ladder.prices));

// ---- the new content actually does something ----
const content = await page.evaluate(() => {
  const o = {};
  // v0.52 Part 2.4: refinedMetallurgy removed from this list — the tech is deleted.
  const newTechs = ["championsRegimen", "deepCartography", "hexdraulics", "sumpEcology",
    "progressDay", "chemBaronAccords", "gloriousEvolution", "atlasGauntlets", "hexgate",
    "greyReclamation", "voidglassOptics", "watchersBelow"];
  o.allExist = newTechs.every(id => TECHS.some(t => t.id === id));
  // every new tech must unlock something real — a building, an upgrade or an expedition
  o.unlockless = newTechs.filter(id =>
    !BUILDINGS.some(b => b.tech === id) && !UPGRADES.some(u => u.tech === id) && !EXPEDITIONS.some(e => e.tech === id));
  o.newBuildings = BUILDINGS.filter(b => newTechs.indexOf(b.tech) !== -1).map(b => b.id);
  o.newUpgrades = UPGRADES.filter(u => newTechs.indexOf(u.tech) !== -1).map(u => u.id);
  o.newExpeditions = EXPEDITIONS.filter(e => newTechs.indexOf(e.tech) !== -1).map(e => e.id);

  const clean = () => { S.buildings = {}; S.jobs = {}; S.upgrades = {}; S.policies = {}; S.champs = {};
                        S.wanderers = []; S.wtechs = {}; S.drakes = {}; S.leader = null; S.techs = {}; S.pop = 0; };
  // Piltovan Cranes
  clean(); const scafBefore = craftCostOf("scaffold").beam;
  S.upgrades.piltovanCranes = true; const scafAfter = craftCostOf("scaffold").beam;
  o.cranes = [scafBefore, scafAfter];
  // Chem-Baron Tithe
  clean(); const apBefore = autoprodMult();
  S.upgrades.chemBaronTithe = true; o.tithe = apBefore < autoprodMult();
  // v0.55 Part 4: Atlas Gauntlets applies to EVERY camp now — Kittens has one hunterRatio and
  // no material/comfort split. `gauntlets` keeps its old meaning (material-only) so the
  // assertion can state that it is now FALSE; `luxuryBoundStillSplits` checks the split that
  // survives, which is the comfort CEILING rather than the upgrade.
  clean(); const matB = campYieldMult(), luxB = campYieldMult(true);
  S.upgrades.atlasGauntletsUp = true;
  o.gauntlets = campYieldMult() > matB && Math.abs(campYieldMult(true) - luxB) < 1e-9;
  // The bound only SPLITS where it actually bites. At Sigma 0.5 both limits are still in
  // their free linear band (0.75 x 1.0 = 0.75 and 0.75 x 6 = 4.5), so the two multipliers are
  // identical there by construction — the probe has to be read at a Sigma the comfort ceiling
  // can reach. The full five-Discovery stack is Sigma 5.00.
  S.upgrades = { trappersCraft: 1, beastLore: 1, masterOfTheHunt: 1, atlasGauntletsUp: 1, jessedHawks: 1 };
  o.luxuryBoundStillSplits = LUXURY_CAMP_YIELD_LIMIT === 1.0 && CAMP_YIELD_LIMIT === 6 &&
    campYieldMult(true) < campYieldMult();
  o.splitAtFullSigma = [+campYieldMult().toFixed(3), +campYieldMult(true).toFixed(3)];
  // Grey Scrubbers
  clean(); S.techs = { sparks: 1, chemtech: 1, hexcore: 1 };
  S.buildings = { sumpMine: 20 }; S.buildingsOff = {};
  ["ore", "mana", "timber", "steel", "gold"].forEach(r => S.res[r] = 1e9);
  const manaB = computeRates().mana;
  S.upgrades.greyScrubbers = true;
  o.scrubbers = computeRates().mana > manaB;
  // Voidglass Lenses
  clean(); S.buildings = { observatory: 10 };
  const capB = computeCaps().knowledge;
  S.upgrades.voidglassLenses = true;
  o.lenses = +(computeCaps().knowledge / capB).toFixed(3);
  // Progress Day Parade
  clean(); S.buildings = { bardsHearth: 10 }; S.caravans = { demacia: 0 };
  const cultB = computeCaps().culture, carB = caravanCost("demacia").culture;
  S.upgrades.progressDayParade = true;
  o.parade = { culture: +(computeCaps().culture / cultB).toFixed(3), caravan: caravanCost("demacia").culture / carB };
  // Standing Orders and Surveyed Approaches
  clean(); S.champs = { twitch: { r: true, lvl: 0 } };
  const trB = trainCost("twitch").renown;
  S.upgrades.standingOrders = true;
  o.orders = +(trainCost("twitch").renown / trB).toFixed(2);
  clean(); const vB = expCost(EXPEDITIONS.find(e => e.id === "krugs")).vigor;
  S.upgrades.surveyedApproaches = true;
  o.approaches = +(expCost(EXPEDITIONS.find(e => e.id === "krugs")).vigor / vB).toFixed(2);
  clean(); S.caravans = {};
  return o;
});
check("all thirteen new techs exist", content.allExist);
check("every new tech unlocks something real — no empty ladder rungs",
  content.unlockless.length === 0, content.unlockless.join(", "));
check("the mix is Kittens-shaped: mostly upgrades, some buildings, one expedition",
  content.newUpgrades.length >= 6 && content.newBuildings.length >= 3 && content.newExpeditions.length >= 1,
  `${content.newUpgrades.length} upgrades, ${content.newBuildings.length} buildings, ${content.newExpeditions.length} expedition`);
check("Piltovan Cranes cuts the Scaffold recipe 40 → 28 beams",
  content.cranes[0] === 40 && content.cranes[1] === 28, JSON.stringify(content.cranes));
check("the Chem-Baron Tithe feeds the same diminishing pool as the Chembarrels", content.tithe);
// v0.55 Part 4 RE-POINT: the five hunt Discoveries are UNCONDITIONAL now. Kittens has one
// `hunterRatio` and no material/comfort split, so conditioning two of the five on which kind
// of camp was being hunted meant NEITHER path ever saw the source's Sigma. RR's split is kept
// where it belongs — in the BOUND (LUXURY_CAMP_YIELD_LIMIT 1.0 against CAMP_YIELD_LIMIT 6),
// which is RR's comfort design and is recorded as such in the parity ledger.
// Superseded by: v0.55 Part 4.
check("Atlas Gauntlets applies to every camp, and the comfort ceiling does the comfort work",
  !content.gauntlets && content.luxuryBoundStillSplits,
  `unconditional: ${!content.gauntlets}, at Σ 5.00 materials/comfort = ${JSON.stringify(content.splitAtFullSigma)}`);
check("Grey Scrubbers cuts converter mana draw", content.scrubbers);
check("Voidglass Lenses gives Observatories +50% knowledge cap", Math.abs(content.lenses - 1.5) < 0.01, `×${content.lenses}`);
// RE-POINTED v0.58.1, superseded by NOTE 15 / §29: the Parade is the ONE fixed multiplier
// culture keeps, cut ×1.35 -> ×1.05 — Jerry's figure, and Kittens' magnitude. Caravans untouched.
check("Progress Day Parade widens culture ×1.05 (v0.58.1 §29) and discounts caravans 15%",
  Math.abs(content.parade.culture - 1.05) < 0.01 && Math.abs(content.parade.caravan - 0.85) < 0.01,
  JSON.stringify(content.parade));
check("Standing Orders cuts champion training 25%", Math.abs(content.orders - 0.75) < 0.01, `×${content.orders}`);
check("Surveyed Approaches cuts expedition Vigor 15%", Math.abs(content.approaches - 0.85) < 0.01, `×${content.approaches}`);

// ==================== Part 3 / Part 6 — the Convergence stripe, set from measurement ====================
const conv = await page.evaluate(() => {
  S.wtechs = { convergence: true };
  const at = w => { S.worship = w; return +(worshipBonus() * 100).toFixed(2); };
  const o = { seed2: at(255000), median: at(481250), seed1: at(548000), ceiling: at(1e18),
              stripeFromSource: /unlimitedDR\(S\.worship \|\| 0, 1000\)/.test(worshipBonus.toString()),
              coefficient: /0\.01 \* unlimitedDR/.test(worshipBonus.toString()) };
  S.worship = 0; S.wtechs = {};
  return o;
});
// SUPERSEDED v0.46 Part 6. The stripe is 1,884, re-derived from a FOUR-seed median
// Worship-at-Sparks of 28,256 after v0.45's acolyte cut and population correction moved
// the input ~18x. The v0.42 stripe was correct for the game that existed then.
// SUPERSEDED v0.47 Part 2: Kittens' own stripe of 1,000, adopted rather than derived.
check("the Convergence stripe is Kittens' own 1,000",
  conv.stripeFromSource && conv.coefficient);
// SUPERSEDED v0.46 Part 6: those three figures are v0.42-economy Worship. Against the
// v0.46 stripe the CURRENT four-seed spread is what has to land in band; see test-v46.
check("the v0.42 Worship figures now read high against the new stripe, as expected",
  conv.median > 8 && conv.seed1 > 8,
  `255k→${conv.seed2}%, 481k→${conv.median}%, 548k→${conv.seed1}%`);
check("Kittens' +1000% ceiling still binds", conv.ceiling === 1000);

// ==================== regressions ====================
await reset();
const reg = await page.evaluate(() => {
  const o = {};
  o.ascentPure = !/cost|cooldown|Until/i.test(ascendTargon.toString());
  S.res.devotion = 500; S.worship = 0; ascendTargon(); ascendTargon();
  o.ascentBanks = S.worship === 500 && S.res.devotion === 0;
  o.coreFns = ["tick", "computeRates", "computeCaps", "morale", "ascendTargon", "renderAll", "renderTop"]
    .every(f => typeof window[f] === "function");
  S.buildings = {}; BUILDINGS.forEach(b => S.buildings[b.id] = 3);
  S.techs = {}; TECHS.forEach(t => S.techs[t.id] = true);
  S.upgrades = {}; UPGRADES.forEach(u => S.upgrades[u.id] = true);
  S.wtechs = {}; WTECHS.forEach(w => S.wtechs[w.id] = true);
  S.pop = 130; S.jobs = { farmer: 20, loremaster: 20, miner: 20, woodcutter: 20, acolyte: 20 };
  if (typeof invalidateCensus === "function") invalidateCensus();
  const caps = computeCaps(), rts = computeRates();
  o.noNaNCaps = Object.values(caps).every(v => isFinite(v));
  o.noNaNRates = Object.values(rts).every(v => isFinite(v));
  o.badCaps = Object.entries(caps).filter(([, v]) => !isFinite(v)).map(([k]) => k).join(",");
  o.badRates = Object.entries(rts).filter(([, v]) => !isFinite(v)).map(([k]) => k).join(",");
  o.moraleFinite = isFinite(morale());
  o.craftedUncapped = ["beam", "scaffold", "stoneSlab", "hexSlab", "morellonomicon"].every(r => caps[r] === undefined);
  // the v0.41 trade invariants must survive
  o.tradeV1 = FACTIONS.filter(f => {
    const y = (f.primaryYield || []).concat(f.slots.map(s => s.res));
    return Object.keys(f.cost).some(c => y.indexOf(c) !== -1);
  }).map(f => f.id);
  const all = FACTIONS.reduce((a, f) => a.concat(f.slots.map(s => s.res)), []);
  o.tradeV2 = new Set(all).size === 15;
  // crystals still produced
  o.krugsCrystals = /gain\("crystals"/.test(EXPEDITIONS.find(e => e.id === "krugs").run.toString());
  return o;
});
check("regression: Ascent is still free, cooldownless and bonusless", reg.ascentPure && reg.ascentBanks);
check("regression: core function names unchanged", reg.coreFns);
check("regression: no NaN caps with everything owned", reg.noNaNCaps, reg.badCaps);
check("regression: no NaN rates with everything owned", reg.noNaNRates, reg.badRates);
check("regression: morale finite at 130 wanderers", reg.moraleFinite);
check("regression: crafted materials still uncapped, including the Morellonomicon", reg.craftedUncapped);
check("regression: the v0.41 trade invariants survive", reg.tradeV1.length === 0 && reg.tradeV2);
// RE-POINTED v0.58, superseded by JERRY'S DEV NOTE 5.1. This guarded against an ACCIDENTAL
// removal; the removal is now deliberate and directed, so the assertion is inverted rather
// than deleted — a silent RE-appearance of the drop would still be a regression.
check("regression: Krugs produces NO crystals (v0.58 note 5.1, deliberate)", !reg.krugsCrystals);

// ---- the loop gain must not have reopened ----
const loop = await page.evaluate(() => {
  const avgFrom = fn => {
    const m = fn.toString().match(/\((\d+)\s*\+\s*Math\.floor\(Math\.random\(\)\s*\*\s*(\d+)\)\)/);
    return m ? (+m[1] + (+m[1] + (+m[2] - 1))) / 2 : null;
  };
  const dem = FACTIONS.find(f => f.id === "demacia"), pil = FACTIONS.find(f => f.id === "piltover");
  S.buildings = { tradeDock: 1e7, workshop: 1e7, hexgateBuilding: 1e7 };
  S.caravans = { demacia: 1e7, piltover: 1e7 };
  S.upgrades = { riverstoneTools: true, progressDayParade: true }; S.policies = {}; S.wanderers = []; S.champs = {};
  POLICY_GROUPS.forEach(g => g.options.forEach(o => { if (/trade/i.test(o.id)) S.policies[g.id] = o.id; }));
  CHAMPS.forEach(d => { S.champs[d.id] = { r: true, lvl: 10 }; });
  S.leader = "twitch";
  const maxM = tradeYieldMult("demacia");
  const G = (avgFrom(dem.run) / dem.cost.timber) * (avgFrom(pil.run) / pil.cost.steel) *
            (transmuteYield() / TRANSMUTE_COST) * maxM * maxM;
  S.buildings = {}; S.caravans = {}; S.upgrades = {}; S.policies = {}; S.champs = {}; S.leader = null;
  return { maxM: +maxM.toFixed(3), G: +G.toFixed(3) };
});
check("regression: the trade circuit still loses timber at the maximum stack",
  loop.G < 0.8, `G = ${loop.G} at max M = ${loop.maxM}`);

await reset();
const rt = await page.evaluate(() => {
  S.res.morellonomicon = 5; S.buildings.quarry = 3; S.upgrades.voidglassLenses = true;
  loadFromString(btoa(unescape(encodeURIComponent(JSON.stringify(S)))));
  return S.res.morellonomicon === 5 && S.buildings.quarry === 3 && S.upgrades.voidglassLenses === true;
});
check("regression: saves round-trip the new resource, building and upgrade", rt);

await reset();
for (const tab of ["settlement", "crafting", "village", "lore", "wilds", "trade", "targon", "champions"]) {
  await page.evaluate(t => {
    S.techs = {}; TECHS.forEach(x => S.techs[x.id] = true);
    S.upgrades = {}; UPGRADES.forEach(u => S.upgrades[u.id] = true);
    S.wtechs = {}; WTECHS.forEach(w => S.wtechs[w.id] = true);
    S.buildings = {}; BUILDINGS.forEach(b => S.buildings[b.id] = 2);
    S.caravans = {}; FACTIONS.forEach(f => { S.caravans[f.id] = 16; S.factionsFound[f.id] = true; });
    S.pop = 20; syncRoster(); S.worship = 5000;
    for (const r in RES) S.seenMax[r] = 999;
    S.buildings.archive = Math.max(1, S.buildings.archive || 0); S.buildings.shelter = Math.max(1, S.buildings.shelter || 0); S.upgrades.keepingTheRolls = true; S.activeTab = t; uiDirty = true; renderAll();
  }, tab);
  await page.waitForTimeout(40);
}
check("all 8 tabs render with every new tech, building and upgrade owned", errors.length === 0, errors.slice(0, 3).join(" | "));

console.log(`\n${pass} passed, ${fail} failed`);
await browser.close();
process.exit(fail ? 1 : 0);
