// test-v45 — BUILDER SPEC v0.45 pass conditions, plus Jerry's three directives.
// Every assertion here is a Part 9 condition or a directive, stated as a measurement.
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

// ============================================================================
// Part 1 — Knowledge and Culture are transient
// "Knowledge and Culture receive catCharts x catReligion x catPolicy and nothing else.
//  Assert directly against catMonument, catDrake, catSoul, catBuff at three save states."
// ============================================================================
await reset();
const tr = await page.evaluate(() => {
  const bare = () => {
    S.buildings = {}; S.upgrades = {}; S.techs = {}; S.jobs = {}; S.pop = 0; S.wanderers = [];
    S.policies = {}; S.champs = {}; S.wtechs = {}; S.drakes = {}; S.leader = null; S.worship = 0;
    S.dragonSoul = false; S.baronUntil = 0; S.insightUntil = 0; S.cinderUntil = 0; S.honeyUntil = 0;
    S.festivalUntil = 0; S.jackboxes = 0;
    ["furs", "plumes", "mushrooms"].forEach(r => S.res[r] = 50);
  };
  // A workforce that produces ore, timber, knowledge and culture simultaneously.
  const stand = () => {
    bare();
    S.techs = { mining: 1, songcraft: 1, logistics: 1, hextech: 1, petricite: 1 };
    S.pop = 40; S.wanderers = []; syncRoster();
    S.jobs = { miner: 10, woodcutter: 10, loremaster: 10 };
    S.buildings = { bardsHearth: 10, manaWell: 5 };   // v0.52 Part 2.3: the Tavern is deleted
  };
  const snap = () => { const r = computeRates(); return { ore: r.ore, timber: r.timber, knowledge: r.knowledge, culture: r.culture }; };

  // --- state A: bare baseline
  stand(); const A = snap();

  // --- state B: add ONLY the four excluded categories (monument / drake / soul / buff)
  stand();
  // NB: use the Hextech Foundry, NOT the Piltover Spire — the Spire carries
  // prod: { culture: 0.04 } of its own, so it raises culture's BASE as well as its
  // multiplier and the measurement would read a game bug that is not there.
  S.buildings.hextechFoundry = 20;         // globalBoost 0.06, no prod -> pure catMonument
  S.drakes = { infernal: 6 };              // -> catDrake
  S.dragonSoul = true;                     // -> catSoul
  S.baronUntil = Date.now() + 600000;      // -> catBuff
  const B = snap();

  // --- state C: add ONLY the three kept categories (charts / religion / policy)
  stand();
  S.upgrades.celestialCharts = 1;          // -> catCharts
  S.wtechs = { convergence: 1 }; S.worship = 5e6;   // -> catReligion
  POLICY_GROUPS.forEach(g => { S.policies[g.id] = g.options[0].id; });  // -> catPolicy
  const C = snap();

  const oreDef = BUILDINGS.find(b => b.id === "hextechFoundry");
  return {
    A, B, C,
    excludedOreGain: +(B.ore / A.ore).toFixed(4),
    excludedKnowGain: +(B.knowledge / A.knowledge).toFixed(6),
    excludedCultGain: +(B.culture / A.culture).toFixed(6),
    keptOreGain: +(C.ore / A.ore).toFixed(4),
    keptKnowGain: +(C.knowledge / A.knowledge).toFixed(4),
    keptCultGain: +(C.culture / A.culture).toFixed(4),
    spireIsGlobal: !!(oreDef && oreDef.globalBoost && !oreDef.prod)
  };
});
check("the four excluded categories move ore substantially", tr.excludedOreGain > 2, `ore ×${tr.excludedOreGain}`);
check("catMonument / catDrake / catSoul / catBuff do NOT touch knowledge",
  Math.abs(tr.excludedKnowGain - 1) < 1e-6, `knowledge ×${tr.excludedKnowGain}`);
check("...and do NOT touch culture either",
  Math.abs(tr.excludedCultGain - 1) < 1e-6, `culture ×${tr.excludedCultGain}`);
check("catCharts / catReligion / catPolicy DO still reach knowledge",
  tr.keptKnowGain > 1.10, `knowledge ×${tr.keptKnowGain}`);
check("...and reach culture identically to knowledge (same transient multiplier)",
  Math.abs(tr.keptKnowGain - tr.keptCultGain) < 1e-4, `${tr.keptKnowGain} vs ${tr.keptCultGain}`);
check("...and reach ore by the same three, so nothing was double-counted",
  Math.abs(tr.keptOreGain - tr.keptKnowGain) < 1e-4, `ore ×${tr.keptOreGain} vs knowledge ×${tr.keptKnowGain}`);

// The tooltip must be derived from the same expression, not restated.
const trSrc = await page.evaluate(() => ({
  // v0.46 Part 2 V2 added vigor to the set — manpower carries the same transient flag
  // in js/resources.js that science and culture do.
  // v0.47 Part 2 added devotion to the set.
  hasSet: /var TRANSIENT = \{ knowledge: 1, culture: 1, vigor: 1, devotion: 1 \};/.test(computeRates.toString()),
  hasFn: /function globalMultFor\(r\)/.test(computeRates.toString()),
  bdDerived: /var bdMult = globalMultFor\(bdRes\);/.test(computeRates.toString()),
  // v0.50 Part 1.4: catCharts folded into catMeta, and the transient path takes
  // catMetaTransient — the charts term alone, through the same primitive — so transients
  // get exactly what they got before and NOT the drakes or the Dragon Soul.
  transientProduct: /var globalTransient = catMetaTransient \* catReligion \* catPolicy;/.test(computeRates.toString())
}));
check("TRANSIENT set and globalTransient product are exactly as specced",
  trSrc.hasSet && trSrc.transientProduct, JSON.stringify(trSrc));
check("the breakdown panel DERIVES its multiplier rather than restating it",
  trSrc.hasFn && trSrc.bdDerived, JSON.stringify(trSrc));

// ============================================================================
// Part 5 — the knowledge ceiling is buildings + the clamped compendium term, full stop
// ============================================================================
await reset();
const caps = await page.evaluate(() => {
  const bare = () => {
    S.buildings = {}; S.upgrades = {}; S.techs = {}; S.jobs = {}; S.pop = 0; S.wanderers = [];
    S.policies = {}; S.champs = {}; S.wtechs = {}; S.drakes = {}; S.leader = null;
    S.res.tome = 0; S.res.morellonomicon = 0;
  };
  const sci = { archive: 30, academy: 30, observatory: 25, hexLab: 13 };
  const buildingKnowledge = () => {
    let sum = RES.knowledge.baseCap;
    BUILDINGS.forEach(b => { if (b.caps && b.caps.knowledge) sum += b.caps.knowledge * (S.buildings[b.id] || 0); });
    return sum;
  };
  bare(); S.buildings = Object.assign({}, sci);
  const plainK = computeCaps().knowledge, plainExpected = buildingKnowledge();

  // Now switch on EVERY storage multiplier in the game at once.
  bare(); S.buildings = Object.assign({}, sci, { hallOfHeroes: 10 });
  S.upgrades = { expandedStores: 1, ironboundStores: 1, hexRunedStores: 1, chemtechSilos: 1, voidwardStores: 1,
                 cataloguing: 1, crossReferencing: 1, greatIndex: 1, annotatedIndex: 1, livingLibrary: 1 };
  S.drakes = { mountain: 8 };
  S.champs = { poppy: { r: 1, lvl: 10 } }; S.leader = "poppy";
  const loadedK = computeCaps().knowledge, loadedExpected = buildingKnowledge();
  const loadedMats = computeCaps().timber;

  // ...and the same save with a different leader.
  S.leader = "shaco"; S.champs.shaco = { r: 1, lvl: 10 };
  const otherK = computeCaps().knowledge, otherMats = computeCaps().timber;

  const src = computeCaps.toString();
  bare();
  return {
    plainK, plainExpected, loadedK, loadedExpected, loadedMats, otherK, otherMats,
    noChampStore: !/champStore/.test(src),
    noStoragePassive: !/champPassive\("storage"\)/.test(src),
    noStorageKeyAnywhere: !CHAMPS.some(c => c.passive.key === "storage"),
    exemptSet: /var CAP_MULT_EXEMPT = \{ vigor: 1, knowledge: 1 \};/.test(document.documentElement.innerHTML)
  };
});
check("caps.knowledge == base + Σ(building caps.knowledge), exactly, with nothing owned",
  caps.plainK === caps.plainExpected, `${caps.plainK} vs ${caps.plainExpected}`);
check("...and STILL exactly that with every storage multiplier in the game switched on",
  caps.loadedK === caps.loadedExpected, `${caps.loadedK} vs ${caps.loadedExpected}`);
check("champStore no longer appears in computeCaps()", caps.noChampStore);
check('champPassive("storage") has no call sites', caps.noStoragePassive);
check("no champion carries a storage passive at all", caps.noStorageKeyAnywhere);
check("CAP_MULT_EXEMPT is { vigor, knowledge }", caps.exemptSet);
check("a Poppy-led save shows a knowledge ceiling IDENTICAL to another leader",
  caps.loadedK === caps.otherK, `${caps.loadedK} vs ${caps.otherK}`);
check("...and material ceilings exactly 8% higher",
  Math.abs(caps.loadedMats / caps.otherMats - 1.08) < 1e-9, `×${(caps.loadedMats / caps.otherMats).toFixed(6)}`);

// ============================================================================
// Part 8.1 — Poppy's new passive
// ============================================================================
await reset();
const poppy = await page.evaluate(() => {
  const d = CHAMPS.find(c => c.id === "poppy");
  S.buildings = {}; S.upgrades = {}; S.techs = { logistics: 1 }; S.jobs = {}; S.pop = 30;
  S.wanderers = []; syncRoster(); S.jobs = { jungler: 10 }; S.champs = {}; S.policies = {};
  S.drakes = {}; S.leader = null;
  const before = computeRates().vigor;
  S.champs = { poppy: { r: 1, lvl: 0 } };
  const after = computeRates().vigor;
  // no two champions may share a passive key AND base
  const seen = {}, dupes = [];
  CHAMPS.forEach(c => { const k = c.passive.key + ":" + c.passive.base; if (seen[k]) dupes.push(k); seen[k] = 1; });
  return {
    key: d.passive.key, base: d.passive.base, lead: d.lead, skill: d.skill,
    vigorGain: +(after / before).toFixed(4), dupes,
    leadNamesNoRenown: !/Renown/i.test(d.lead.split("untouched")[0]),
    leadGenerated: /Iron Ambassador/.test(d.lead) && /8%/.test(d.lead),
    leadAndSkillDiffer: d.lead.split(" —")[0] !== d.skill.split(" —")[0]
  };
});
check("Poppy's passive is vigor / base 15", poppy.key === "vigor" && poppy.base === 15,
  `${poppy.key} ${poppy.base}`);
check("...and it actually raises vigor production by 15%",
  Math.abs(poppy.vigorGain - 1.15) < 0.001, `×${poppy.vigorGain}`);
check("no two champions share a passive key AND base", poppy.dupes.length === 0, poppy.dupes.join(","));
check("the lead string is generated, names Iron Ambassador and 8%", poppy.leadGenerated, poppy.lead);
check("...and no longer collides with her skill name", poppy.leadAndSkillDiffer,
  `${poppy.lead.split(" —")[0]} vs ${poppy.skill.split(" —")[0]}`);

// ============================================================================
// Part 2 — composition: ore breadth, timber depth, both unbounded
// ============================================================================
await reset();
const comp = await page.evaluate(() => {
  const all = o => { S.upgrades = {}; Object.keys(o).forEach(k => S.upgrades[k] = 1); };
  // v0.50: the two re-homed upgrades join the sets they now belong to, or the lines
  // measure short — lineSum() counts what is OWNED, lineTotal() the whole table.
  all({ sharpenedAxes: 1, ironAxes: 1, steelAxes: 1, hexsteelAxes: 1, atlasAxes: 1, voidsteelAxes: 1,
        masterworkTools: 1,
        reinforcedSaw: 1, steelSaw: 1, hexsteelSaw: 1, atlasSaw: 1, voidsteelSaw: 1,
        seasonedTimberworks: 1,
        zauniteDrills: 1, sumpVentilation: 1 });
  const B = id => BUILDINGS.find(b => b.id === id);
  const o = {
    axe: +axeMult().toFixed(4),
    sawSum: +sawSum().toFixed(4),
    mine: +jobBoostPerCopy(B("mine"), "miner").toFixed(4),
    quarry: +jobBoostPerCopy(B("quarry"), "miner").toFixed(4),
    mill: +jobBoostPerCopy(B("lumberMill"), "woodcutter").toFixed(4),
    augmentHasMiner: !!(B("augmentChamber").jobBoost || {}).miner,
    axeRungs: AXE_LINE.length, sawRungs: SAW_LINE.length
  };
  // the category must stay UNBOUNDED — explicit no-regression item
  S.buildings = { mine: 400, quarry: 400 };
  S.techs = { mining: 1 }; S.pop = 20; S.wanderers = []; syncRoster(); S.jobs = { miner: 10 };
  S.policies = {}; S.champs = {}; S.drakes = {}; S.wtechs = {}; S.leader = null;
  const at400 = computeRates().ore;
  S.buildings = { mine: 800, quarry: 800 };
  const at800 = computeRates().ore;
  o.doublingGain = +(at800 / at400).toFixed(3);
  // and the miner must have NO job-tier multiplier left
  o.minerJobLine = /miner: villageMult,/.test(computeRates.toString());
  o.mwOffMiner = !/miner: \(S\.upgrades\.zauniteDrills/.test(computeRates.toString());
  S.upgrades = {}; S.buildings = {}; S.jobs = {}; S.pop = 0; S.wanderers = []; syncRoster();
  return o;
});
// v0.50 Part 1.1 and 1.3 each add a rung. Masterwork Tools was a cross-resource job
// multiplier — a category with one member, which Kittens has nowhere — and is now the
// seventh axe; Seasoned Timberworks was a timber resRatio and is now the sixth saw.
// Both are re-homings into categories that already existed, not new content.
check("axe line is SEVEN rungs summing to ×4.45 on the woodcutter",
  comp.axeRungs === 7 && Math.abs(comp.axe - 4.45) < 1e-6, `×${comp.axe} over ${comp.axeRungs} rungs`);
check("saw line is SIX rungs summing to 1.20", comp.sawRungs === 6 && Math.abs(comp.sawSum - 1.20) < 1e-6, String(comp.sawSum));
// v0.50 Part 1.3: the saw line gains a sixth rung (Seasoned Timberworks, out of resRatio),
// so Σ goes 0.95 -> 1.20 and the Mill's per-copy term goes 0.195 -> 0.220. The SHAPE is
// unchanged and it is still Kittens' own 0.1 + lumberMillRatio × 0.1 — RR now has one more
// saw than the source's five, which is the trade the census made to delete a category.
check("Lumber Mill reaches 0.220 timber boost per copy (Kittens' shape: 0.1 + lumberMillRatio×0.1)",
  Math.abs(comp.mill - 0.220) < 1e-6, String(comp.mill));
check("Mine reaches 0.25 and Quarry 0.40 — Kittens' 0.20/0.35 plus one rung each",
  Math.abs(comp.mine - 0.25) < 1e-6 && Math.abs(comp.quarry - 0.40) < 1e-6, `${comp.mine} / ${comp.quarry}`);
check("Augment Chamber no longer boosts miners — Kittens has TWO minerals buildings",
  !comp.augmentHasMiner);
check("the miner keeps no job-tier multiplier at all (no mineralsJobRatio in Kittens)",
  comp.minerJobLine && comp.mwOffMiner, JSON.stringify({ line: comp.minerJobLine, mw: comp.mwOffMiner }));
check("buildingJobBoost remains UNBOUNDED — doubling the buildings still nearly doubles ore",
  comp.doublingGain > 1.9, `×${comp.doublingGain} from 400→800 copies`);

// ============================================================================
// Part 3 — housing, and Jerry's directive 3 (flat luxury morale)
// ============================================================================
await reset();
const house = await page.evaluate(() => {
  const sh = BUILDINGS.find(b => b.id === "shelter"), lh = BUILDINGS.find(b => b.id === "longhouse");
  const st = BUILDINGS.find(b => b.id === "storehouse");
  const ladder = [];
  S.upgrades = {};
  ladder.push(+buildingRatio(sh).toFixed(4));
  ["ironwoodShelters", "petriciteFrames", "hexcreteFrames", "voidwrightFrames"].forEach(u => {
    S.upgrades[u] = 1; ladder.push(+buildingRatio(sh).toFixed(4));
  });
  const lhAll = (() => { S.upgrades = { stonecutGuild: 1, hexboundJoinery: 1 }; return +buildingRatio(lh).toFixed(4); })();
  S.upgrades = {}; const lhNone = +buildingRatio(lh).toFixed(4);
  const stNone = +buildingRatio(st).toFixed(4);
  S.upgrades = { stonecutGuild: 1, hexboundJoinery: 1 };
  const stAll = +buildingRatio(st).toFixed(4);
  S.upgrades = {};
  return { ladder, lhNone, lhAll, stNone, stAll };
});
check("Shelter ladder is 2.20 → 1.83 → 1.61 → 1.43 → 1.355, Kittens' hut shape and floor",
  JSON.stringify(house.ladder) === JSON.stringify([2.2, 1.83, 1.61, 1.43, 1.355]), JSON.stringify(house.ladder));
check("...and lands on Kittens' own 1.3516 end-of-everything floor, within 0.005",
  Math.abs(house.ladder[4] - 1.3516) < 0.005, String(house.ladder[4]));
check("the Longhouse takes NO reducer — Kittens has no logHousePriceRatio",
  house.lhNone === 1.15 && house.lhAll === 1.15, `${house.lhNone} / ${house.lhAll}`);
check("the two reducers now discount the Storehouse (1.75, RR's punitive ratio) instead",
  house.stNone === 1.75 && house.stAll < 1.5, `${house.stNone} → ${house.stAll}`);

await reset();
const mor = await page.evaluate(() => {
  // v0.52 Part 2.3: 30 Taverns at 0.05 -> 130 Hearths at 0.0115, the same raw relief sum,
  // so the luxury column below is measured off an unchanged morale baseline.
  S.buildings = { bardsHearth: 130 }; S.upgrades = {}; S.techs = {}; S.jobs = {}; S.pop = 60;
  S.wanderers = []; syncRoster(); S.jackboxes = 0; S.wtechs = {}; S.policies = {}; S.champs = {};
  S.festivalUntil = 0;
  const set = o => { ["furs", "plumes", "mushrooms"].forEach(r => S.res[r] = 0); Object.assign(S.res, o); return morale(); };
  const none = set({});
  const oneFur = set({ furs: 1 });
  const hugeFur = set({ furs: 1e9 });
  const allOne = set({ furs: 1, plumes: 1, mushrooms: 1 });
  const allHuge = set({ furs: 1e9, plumes: 1e9, mushrooms: 1e9 });
  const twoOnly = set({ furs: 1, plumes: 1 });
  // Festival pays the full set, so it is worth exactly what you are missing
  set({ furs: 1 }); S.festivalUntil = Date.now() + 600000;
  const festThin = morale();
  set({ furs: 1, plumes: 1, mushrooms: 1 }); const festFull = morale();
  S.festivalUntil = 0;
  const src = morale.toString();
  return { none, oneFur, hugeFur, allOne, allHuge, twoOnly, festThin, festFull,
    perLux: MORALE_PER_LUXURY, kinds: LUXURY_KINDS,
    noRamp: !/Math\.min\(1, S\.res\[r\] \/ luxuryComfort\(\)\)/.test(src),
    flatForm: /MORALE_PER_LUXURY \* luxes\.length/.test(src) };
});
check("Jerry 3: a comfort pays a FLAT amount — 1 unit and 1e9 units are identical",
  mor.oneFur === mor.hugeFur && mor.allOne === mor.allHuge,
  `1 fur ${mor.oneFur} / 1e9 furs ${mor.hugeFur}; all×1 ${mor.allOne} / all×1e9 ${mor.allHuge}`);
check("...at exactly 10 per kind, which is Kittens' happinessPerLuxury",
  mor.oneFur - mor.none === 10 && mor.twoOnly - mor.none === 20 && mor.allOne - mor.none === 30,
  `+${mor.oneFur - mor.none} / +${mor.twoOnly - mor.none} / +${mor.allOne - mor.none}`);
check("...with the constants named and the old ramp gone from the source",
  mor.perLux === 10 && mor.kinds === 3 && mor.noRamp && mor.flatForm,
  JSON.stringify({ perLux: mor.perLux, kinds: mor.kinds, noRamp: mor.noRamp, flatForm: mor.flatForm }));
check("the Festival still pays the full set, so it is worth what your larder is missing",
  mor.festThin > mor.oneFur && mor.festFull === mor.allOne,
  `thin ${mor.oneFur}→${mor.festThin}, full ${mor.allOne}→${mor.festFull}`);

// ============================================================================
// Part 4 — worker base rates at Kittens parity (perTick × 5)
// ============================================================================
await reset();
const rates = await page.evaluate(() => {
  const j = id => JOBS.find(x => x.id === id);
  return {
    woodcutter: j("woodcutter").prod.timber, woodcutterDesc: j("woodcutter").desc,
    loremaster: j("loremaster").prod.knowledge, loremasterDesc: j("loremaster").desc,
    acolyte: j("acolyte").prod.devotion, acolyteDesc: j("acolyte").desc,
    miner: j("miner").prod.ore, jungler: j("jungler").prod.vigor, farmer: j("farmer").prod.provisions,
    consumption: CONSUMPTION, cellars: +(CONSUMPTION * 0.8).toFixed(4),
    scale: typeof PROVISIONS_SCALE !== "undefined" ? PROVISIONS_SCALE : null
  };
});
check("woodcutter 0.30 → 0.09 timber/s (Kittens wood 0.018/tick)",
  rates.woodcutter === 0.09 && /0\.09/.test(rates.woodcutterDesc), String(rates.woodcutter));
check("loremaster 0.30 → 0.175 knowledge/s (Kittens science 0.035/tick)",
  rates.loremaster === 0.175 && /0\.175/.test(rates.loremasterDesc), String(rates.loremaster));
check("acolyte 0.012 → 0.0075 devotion/s (Kittens faith 0.0015/tick)",
  rates.acolyte === 0.0075 && /0\.0075/.test(rates.acolyteDesc), String(rates.acolyte));
check("miner 0.25 and jungler 0.30 unchanged — already at exact parity",
  rates.miner === 0.25 && rates.jungler === 0.30, `${rates.miner} / ${rates.jungler}`);
// v0.55 Part 3 RE-POINT — TWO superseding changes stack here, and they must be read apart:
//   (a) Part 3.1 rescales the whole provisions economy x10 (PROVISIONS_SCALE), because RR's
//       food ledger was the only resource running at one-tenth of Kittens'. Farmer 0.5 -> 5,
//       consumption 0.425 -> 4.25 would have been the pure rescale, ratio unchanged at 0.85.
//   (b) Jerry's directive then set CONSUMPTION to a flat 4, not 4.25. Directives override the
//       spec, so 4 ships — but it is a 6.2% RELAXATION (farmer:eater 1.17647 -> 1.250) inside
//       a change whose stated purpose was more food pressure. Reported in build report §7.
// This assertion now pins the SHIPPED ratio of 0.80 and names the parity value it is not.
// Superseded by: v0.55 Part 3.1 + Jerry's CONSUMPTION directive.
check("consumption is 4/s against a 5/s farmer — ratio 0.80 (Kittens' catnipPerKitten ratio is 0.85 → 4.25)",
  rates.consumption === 4 && Math.abs(rates.consumption / rates.farmer - 0.80) < 1e-9,
  `${rates.consumption} vs farmer ${rates.farmer}`);
check("the provisions rescale is a declared constant, not scattered literals",
  rates.scale === 10, `PROVISIONS_SCALE ${rates.scale}`);
check("True Ice Cellars lands on 3.2 (0.32 × 10)", rates.cellars === 3.2, String(rates.cellars));

// ============================================================================
// Part 6 — branches, not rungs
// ============================================================================
await reset();
const lad = await page.evaluate(() => {
  // SUPERSEDED v0.46 Part 5. The analyzer withdrew the instruction that produced the ten
  // branches ("the condition is withdrawn, and so is the instruction that broke it") and
  // the ladder was trimmed 45 -> 38. Three branches survive; the other seven had their
  // Discoveries re-homed onto existing techs and cost no knowledge now. The assertions
  // below are unchanged in kind — they just measure the three that remain.
  // SUPERSEDED AGAIN v0.47 Part 1. The branch-tech experiment is over: the ladder is now
  // Kittens' ladder rank for rank, and its ties come from Kittens' own tied prices rather
  // than from added branches. Coinage and Falconry were retired (Carpentry replaces
  // Falconry; Coinage was the second retirement the spec's 18-slot table required), each
  // with its Discovery re-homed onto a surviving tech. Kindling survives, re-priced into
  // Era 3. The assertions below now measure that the retirements were clean.
  const NEW = ["kindling"];
  const RETIRED = ["chorale", "lapidary", "cartwright", "poroHusbandry",
                   "baronsTribute", "shimmerworks", "chronometry", "coinage", "falconry"];
  const byId = {}; TECHS.forEach(t => byId[t.id] = t);
  const reqs = new Set(TECHS.map(t => t.req).filter(Boolean));
  const sci = TECHS.filter(t => t.cost.knowledge);
  const ks = sci.map(t => t.cost.knowledge).sort((a, b) => a - b);
  const steps = []; for (let i = 1; i < ks.length; i++) steps.push(ks[i] / ks[i - 1]);
  const med = a => { const x = [...a].sort((p, q) => p - q); return x.length % 2 ? x[Math.floor(x.length / 2)] : (x[x.length / 2 - 1] + x[x.length / 2]) / 2; };
  const geo = a => Math.exp(a.reduce((s, v) => s + Math.log(v), 0) / a.length);
  // every new tech must sit ON an existing rung (a price some OTHER tech already had)
  const priceCount = {}; sci.forEach(t => priceCount[t.cost.knowledge] = (priceCount[t.cost.knowledge] || 0) + 1);
  const onExistingRung = NEW.filter(id => priceCount[byId[id].cost.knowledge] >= 2);
  const unlocksOne = NEW.map(id => UPGRADES.filter(u => u.tech === id).length);
  return {
    present: NEW.filter(id => byId[id]).length,
    retiredGone: RETIRED.every(id => !byId[id]),
    retiredUpgradesKept: ["fourPartHarmony", "facetedCuts", "ironShodWheels", "pastureRotation",
      "tributeReliquaries", "continuousDraw", "standardHour", "mintedCoin", "jessedHawks"]
      .every(u => UPGRADES.some(x => x.id === u && x.tech && byId[x.tech])),
    leaves: NEW.filter(id => !reqs.has(id)).length,
    onExistingRung: onExistingRung.length,
    monotonic: sci.filter(t => t.req && byId[t.req] && t.cost.knowledge <= (byId[t.req].cost.knowledge || 0)).map(t => t.id),
    unlocksExactlyOne: unlocksOne.every(n => n === 1),
    count: sci.length, median: +med(steps).toFixed(4), geo: +geo(steps).toFixed(4),
    ties: steps.filter(s => s === 1).length, max: +Math.max(...steps).toFixed(3),
    era3: sci.filter(t => t.cost.knowledge >= 20000).length
  };
});
check("the one surviving branch tech is present", lad.present === 1, String(lad.present));
check("...the seven retired ones are gone", lad.retiredGone);
check("...and every retired branch's Discovery survives on an existing tech",
  lad.retiredUpgradesKept);
check("...it is a LEAF — the req of nothing", lad.leaves === 1, String(lad.leaves));
check("...and sits exactly ON an existing rung (a genuine tie)", lad.onExistingRung === 1, String(lad.onExistingRung));
check("...and each opens exactly one upgrade", lad.unlocksExactlyOne);
check("cost still rises monotonically along every prerequisite chain",
  lad.monotonic.length === 0, lad.monotonic.join(", "));
check("median cost-sorted step lands in Kittens' ×1.10–1.20 band",
  lad.median >= 1.10 && lad.median <= 1.20, `×${lad.median} over ${lad.count} techs, ${lad.ties} exact ties`);
// v0.46 Part 5: with N=38 the geometric mean is BACK in band and all three hold together.
check("...and the geometric mean is now in band TOO, at N=38",
  lad.geo >= 1.25 && lad.geo <= 1.30, `×${lad.geo} at N=${lad.count}`);
// SUPERSEDED v0.46 Part 5: the re-skew restores Kittens' own ×3.33 largest early step.
check("no step anywhere exceeds Kittens' ×3.33", lad.max <= 3.35, `max ×${lad.max}`);
// Reported, NOT asserted as a pass — see the build report: with the price span fixed at
// 4,500 (30 -> 135,000), the sorted geometric mean is span^(1/(N-1)) and is therefore
// pinned by the tech COUNT alone. The x1.25-1.30 target and "add 8-10 techs" cannot both
// hold; the band admits N <= 38 and the spec's directive puts RR at 45.
console.log(`geometric mean (reported, arithmetically pinned): ×${lad.geo} at N=${lad.count}; ` +
  `span^(1/(N-1)) = ${Math.pow(4500, 1 / (lad.count - 1)).toFixed(4)}`);

// ============================================================================
// Regressions that must never break
// ============================================================================
await reset();
const reg = await page.evaluate(() => {
  const src = ascendTargon.toString();
  const r = computeRates();
  return {
    ascentClean: !/cooldown/i.test(src) && !/cost/i.test(src),
    noNaNRates: Object.values(r).every(v => typeof v === "number" && isFinite(v)),
    noNaNCaps: Object.values(computeCaps()).every(v => typeof v === "number" && isFinite(v)),
    moraleFinite: isFinite(morale())
  };
});
check("regression: Ascent still has no cost and no cooldown", reg.ascentClean);
check("regression: no NaN in rates", reg.noNaNRates);
check("regression: no NaN in caps", reg.noNaNCaps);
check("regression: morale finite", reg.moraleFinite);

// every tab renders with everything owned
await reset();
const tabs = await page.evaluate(() => {
  S.techs = {}; TECHS.forEach(t => S.techs[t.id] = true);
  S.upgrades = {}; UPGRADES.forEach(u => S.upgrades[u.id] = true);
  S.buildings = {}; BUILDINGS.forEach(b => S.buildings[b.id] = 3);
  S.champs = {}; CHAMPS.forEach(c => S.champs[c.id] = { r: 1, lvl: 3 });
  S.leader = "poppy"; S.pop = 60; S.wanderers = []; syncRoster();
  const out = {};
  TABS.forEach(t => {
    if (t.show && !t.show(S)) return;
    S.activeTab = t.id;
    try { renderAll(); out[t.id] = document.querySelectorAll("#main .panel").length; }
    catch (e) { out[t.id] = "ERR " + e.message; }
  });
  return out;
});
check("every visible tab renders with every v0.45 tech, upgrade and building owned",
  Object.values(tabs).every(v => typeof v === "number" && v > 0), JSON.stringify(tabs));
check("no console errors across the whole suite", errors.length === 0, errors.slice(0, 3).join(" | "));

console.log(`\n${pass} passed, ${fail} failed`);
await browser.close();
process.exit(fail ? 1 : 0);
