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

// ==================== Part 1.1 — the amplifier pair ====================
await reset();
const amp = await page.evaluate(() => {
  const plant = BUILDINGS.find(b => b.id === "hexdraulicPlant");
  const bare = () => {
    S.buildings = {}; S.upgrades = {}; S.techs = {}; S.jobs = {}; S.pop = 0; S.wanderers = [];
    S.policies = {}; S.champs = {}; S.wtechs = {}; S.drakes = {}; S.leader = null; S.worship = 0;
    S.res.timber = 0;
  };
  // isolate a single production line: farmsteads make provisions with no worker
  const provAt = (foundries, plants) => {
    bare();
    S.buildings = { farmstead: 10, hextechFoundry: foundries, hexdraulicPlant: plants };
    return computeRates().provisions;
  };
  const base = provAt(0, 0);
  const o = {
    plantExists: !!plant, plantRatio: plant && plant.ratio, plantTech: plant && plant.tech,
    plantHasNoOwnBoost: plant && !plant.globalBoost,
    // 30 foundries alone: 1 + 30x0.06 = x2.80
    thirtyAlone: +(provAt(30, 0) / base).toFixed(4),
    // 30 foundries + 20 plants: swRatio = 1 + 0.15x20 = 4, so 1 + 30x0.06x4 = x8.20
    thirtyAmplified: +(provAt(30, 20) / base).toFixed(4),
    // a Plant with no Foundry does nothing at all
    plantsAlone: +(provAt(0, 20) / base).toFixed(4),
    // and it must not amplify the OTHER globalBoost buildings
    petriciteAlone: (() => { bare(); S.buildings = { farmstead: 10, petricite: 10 }; return +(computeRates().provisions / base).toFixed(4); })(),
    petriciteWithPlants: (() => { bare(); S.buildings = { farmstead: 10, petricite: 10, hexdraulicPlant: 20 }; return +(computeRates().provisions / base).toFixed(4); })()
  };
  bare();
  return o;
});
// SUPERSEDED v0.47 Part 1.4(c): the Plant costs hexgear 120 and the hexgear recipe is
// gated on The Hexcore Conjecture, so at tech "hexdraulics" it was unbuildable — the same
// class of defect as the scaffold deadlock. It now arrives with the Foundry it amplifies.
check("the Hexdraulic Plant exists, at ratio 1.25, gated on the Hexcore Conjecture",
  amp.plantExists && amp.plantRatio === 1.25 && amp.plantTech === "hexcore", amp.plantTech);
check("it carries no global boost of its own — it is an amplifier, not a monument",
  amp.plantHasNoOwnBoost === true);
check("30 Foundries alone are ×2.80 (Kittens' additive category)",
  Math.abs(amp.thirtyAlone - 2.80) < 0.001, `×${amp.thirtyAlone}`);
check("30 Foundries + 20 Plants are ×8.20 — swRatio = 1 + 0.15×20 = 4",
  Math.abs(amp.thirtyAmplified - 8.20) < 0.001, `×${amp.thirtyAmplified}`);
check("Plants with no Foundry do nothing at all", Math.abs(amp.plantsAlone - 1) < 1e-9, `×${amp.plantsAlone}`);
check("the Plant amplifies the FOUNDRY only, not every monument",
  Math.abs(amp.petriciteAlone - amp.petriciteWithPlants) < 1e-9,
  `${amp.petriciteAlone} vs ${amp.petriciteWithPlants}`);

// ==================== Part 1.2 — the Reactor tier ====================
const reactor = await page.evaluate(() => {
  const r = BUILDINGS.find(b => b.id === "arcaneReactor");
  return { exists: !!r, ratio: r && r.ratio, boost: r && r.globalBoost, tech: r && r.tech, cost: r && r.cost };
});
check("the Arcane Reactor is Kittens' Reactor outright — 0.05 at ratio 1.15, on Grey Reclamation",
  // v0.49 Part 1.7: 0.04 -> 0.05, Kittens js/buildings.js:1550-1568 productionRatio.
  reactor.exists && reactor.ratio === 1.15 && reactor.boost === 0.05 && reactor.tech === "greyReclamation",
  JSON.stringify(reactor));
// v0.50 Part 3: x10 on every component. The Reactor cost HALF its own amplifier in
// effective-raw terms where Kittens' costs 181x it; that was the first step.
// v0.52 Part 1.1: the SECOND x10, ruled by Jerry in v0.50 and shipped here.
// 40/80/60 -> 400/800/600. Only the base moves; ratio 1.15 and globalBoost 0.05 are
// untouched and still asserted one check above. See BUILD REPORT v0.52 §1.1.
check("and it is priced in deep-Era-3 goods, not raws — at v0.52's second x10",
  reactor.cost.hexcore === 400 && reactor.cost.hexcrete === 800 && reactor.cost.focusedHex === 600,
  JSON.stringify(reactor.cost));

// ==================== Part 1.3 — the per-resource global category ====================
const gr = await page.evaluate(() => {
  const bare = () => {
    S.buildings = {}; S.upgrades = {}; S.techs = {}; S.jobs = {}; S.pop = 0; S.wanderers = [];
    S.policies = {}; S.champs = {}; S.wtechs = {}; S.drakes = {}; S.leader = null; S.worship = 0;
  };
  bare(); S.buildings = { mine: 0, manaWell: 20, farmstead: 10 };
  S.pop = 20; S.wanderers = []; syncRoster();
  S.jobs = { miner: 8, woodcutter: 8 };
  const base = computeRates();
  const withUp = ups => { S.upgrades = ups; const r = computeRates(); S.upgrades = {}; return r; };
  const ore = withUp({ sumpVentilation: 1 }), tim = withUp({ seasonedTimberworks: 1 }), man = withUp({ hexresonance: 1 });
  const o = {
    oreX: +(ore.ore / base.ore).toFixed(4),
    oreLeavesTimber: Math.abs(ore.timber - base.timber) < 1e-9,
    timX: +(tim.timber / base.timber).toFixed(4),
    // v0.50 Part 1.3: where Seasoned Timberworks lives NOW
    sawLine: { has: SAW_LINE.some(u => u[0] === "seasonedTimberworks"),
               sum: +lineTotal(SAW_LINE).toFixed(4), n: SAW_LINE.length },
    manX: +(man.mana / base.mana).toFixed(4),
    upgrades: ["sumpVentilation", "seasonedTimberworks", "hexresonance"].map(id => {
      const u = UPGRADES.find(x => x.id === id); return u && u.tech;
    })
  };
  bare(); S.pop = 0; S.jobs = {}; syncRoster();
  return o;
});
// SUPERSEDED v0.45 Part 2 E1. Ore has LEFT the per-resource global category. Kittens'
// minerals line is ONE category fed by two buildings — mine mineralsRatio 0.20, quarry
// 0.35 — and `mineralsGlobalRatio` returns zero results anywhere in the repository, as
// does `mineralsJobRatio`. Sump Ventilation now raises the QUARRY's per-copy term
// (0.35 -> 0.40) instead of opening a multiplicative slot of its own, so ore stays one
// category however many upgrades feed it. Timber and mana keep their slot.
check("Sump Ventilation no longer opens an ore slot — ore is one category now",
  Math.abs(gr.oreX - 1.0) < 0.001 && gr.oreLeavesTimber, `ore ×${gr.oreX}`);
// v0.50 Part 1.3: Seasoned Timberworks LEAVES resRatio — Kittens leaves <res>GlobalRatio
// empty for wood — and becomes the sixth rung of the saw line, which is Kittens' own
// lumberMillRatio. Same upgrade, same 0.25, a category that already existed.
check("Seasoned Timberworks is the sixth saw, not a timber resRatio",
  Math.abs(gr.timX - 1.0) < 0.001 && gr.sawLine.has && gr.sawLine.sum === 1.20,
  `resRatio.timber ×${gr.timX}; saw line Σ${gr.sawLine.sum} over ${gr.sawLine.n} rungs`);
check("Hexresonance is +25% mana", Math.abs(gr.manX - 1.25) < 0.001, `×${gr.manX}`);
check("all three are Era-3 discoveries", gr.upgrades.every(t => !!t), JSON.stringify(gr.upgrades));

// ==================== Part 2.1 — the content gate on the ladder ====================
const gate = await page.evaluate(() => {
  S.champs = {}; S.upgrades = {}; S.buildings = {};
  const ids = CHAMPS.map(c => c.id);
  const rungs = [];
  for (let n = 0; n < 10; n++) {
    rungs.push(recruitCost(ids[n]));
    S.champs[ids[n]] = { r: true, lvl: 0, xp: 0 };
  }
  S.champs = {};
  return {
    ratio: RECRUIT_RATIO,
    renown: rungs.map(c => c.renown),
    cumulative: rungs.reduce((a, c) => a + c.renown, 0),
    gateLength: CHAMP_RUNG_GATE.length,
    early: [0, 1, 2].every(i => Object.keys(CHAMP_RUNG_GATE[i]).length === 0),
    r4: rungs[3].stoneSlab, r6: rungs[5].gear, r6c: rungs[5].culture,
    r8: rungs[7].hexgear, r9: rungs[8].hexcore,
    r10hexcore: rungs[9].hexcore, r10hexcrete: rungs[9].hexcrete
  };
});
check("the ladder is 250 × 1.5^n", gate.ratio === 1.5 &&
  JSON.stringify(gate.renown) === JSON.stringify([250, 375, 563, 844, 1266, 1898, 2848, 4271, 6407, 9611]),
  JSON.stringify(gate.renown));
check("cumulative Renown to ten is 28,333", gate.cumulative === 28333, String(gate.cumulative));
check("the gate table has exactly ten rungs, the first three free of it",
  gate.gateLength === 10 && gate.early);
// rung 6 in CHAMPS order is Swain, whose signature cost is already 700 culture, so the
// gate's +200 ADDS to it rather than replacing it — 900 is the gate working correctly.
check("rungs 4-5 want Era-1 craft, 6-7 Era-2",
  gate.r4 === 25 && gate.r6 === 10 && gate.r6c === 900, `slab ${gate.r4} / gear ${gate.r6} / culture ${gate.r6c}`);
check("rung 8 needs Hexgear, rung 9 needs 4 Hextech Cores",
  gate.r8 === 6 && gate.r9 === 4, `${gate.r8} hexgear / ${gate.r9} hexcore`);
check("rung 10 needs 10 Hextech Cores and Hexcrete — deep Era 3 by construction",
  gate.r10hexcore === 10 && gate.r10hexcrete === 2);

// the gate must ADD to a signature material, never replace it
const sig = await page.evaluate(() => {
  S.champs = {};
  const ids = CHAMPS.map(c => c.id);
  const first = recruitCost(ids[0]);
  for (let n = 0; n < 9; n++) S.champs[ids[n]] = { r: true };
  const asTenth = recruitCost(ids[0]);
  S.champs = {};
  const sigKeys = Object.keys(first).filter(k => k !== "renown");
  return { sigKeys, stable: sigKeys.every(k => first[k] === asTenth[k] || asTenth[k] > first[k]),
           unchanged: sigKeys.filter(k => !CHAMP_RUNG_GATE[9][k]).every(k => first[k] === asTenth[k]) };
});
check("signature material still does not scale with the rung", sig.unchanged, JSON.stringify(sig.sigKeys));

// ==================== Part 2.2 — the ceiling ====================
const ceil = await page.evaluate(() => {
  S.buildings = {}; S.upgrades = {}; S.techs = {}; S.champs = {}; S.leader = null;
  S.jobs = {}; S.pop = 0; S.wanderers = []; S.policies = {}; S.wtechs = {}; S.drakes = {};
  const hall = BUILDINGS.find(b => b.id === "hallOfHeroes");
  S.buildings = { hallOfHeroes: 20, trainingGround: 10 };
  S.techs = { trade: 1, drakeLore: 1, voidStudies: 1 };
  const bare = computeCaps().renown;
  S.upgrades = { expandedStores: 1, ironboundStores: 1, hexRunedStores: 1, chemtechSilos: 1 };
  const chem = computeCaps().renown;
  // and the material caps must still take the FULL line
  const timberBare = (() => { S.upgrades = {}; return computeCaps().timber; })();
  S.upgrades = { expandedStores: 1, ironboundStores: 1, hexRunedStores: 1, chemtechSilos: 1 };
  const timberFull = computeCaps().timber;
  S.buildings = {}; S.upgrades = {}; S.techs = {};
  return { hallCap: hall.caps.renown, bare: Math.round(bare), chem: Math.round(chem),
           renownX: +(chem / bare).toFixed(4), timberX: +(timberFull / timberBare).toFixed(4) };
});
check("Hall of Heroes is +250 Renown", ceil.hallCap === 250, String(ceil.hallCap));
// v0.56 Part 5 RE-POINT (both lines): the multiplicative Masonry chain is gone. Kittens'
// `js/resources.js addBarnWarehouseRatio` runs TWO ADDITIVE accumulators — barnRatio Σ 4.35
// and warehouseRatio Σ 1.80 across six workshop upgrades each — applied at three different
// SCOPES, and RR's five rungs carry the source's sums between them. At four rungs owned the
// barn sum is 3.55 and the warehouse sum is 1.55, so timber (narrow: both) takes
// (1+3.55)(1+1.55) = ×11.6025 and renown (broad: warehouse only) takes ×2.55.
// The properties under test are unchanged: renown rises with the era SUB-LINEARLY against
// materials, and materials take the whole line. Superseded by: v0.56 Part 5.
check("Renown rises sub-linearly against materials, on the warehouse tier",
  Math.abs(ceil.renownX - (1 + 0.25 + 0.50 + 0.45 + 0.35)) < 0.01 && ceil.renownX < ceil.timberX,
  `renown ×${ceil.renownX} against timber ×${ceil.timberX}`);
check("materials still take the FULL line — both accumulators, multiplied between categories",
  Math.abs(ceil.timberX - (1 + 0.75 + 0.80 + 1.00 + 1.00) * (1 + 0.25 + 0.50 + 0.45 + 0.35)) < 0.01,
  `×${ceil.timberX}`);
check("the Chemtech ceiling clears the tenth rung's 9,611 Renown", ceil.chem > 9611, String(ceil.chem));

// ==================== Part 2.5 — the re-priced ladder ====================
const lad = await page.evaluate(() => {
  const k = TECHS.filter(t => t.cost.knowledge).map(t => ({ id: t.id, k: t.cost.knowledge })).sort((a, b) => a.k - b.k);
  const steps = []; for (let i = 1; i < k.length; i++) steps.push(k[i].k / k[i - 1].k);
  const sorted = [...steps].sort((a, b) => a - b);
  const cost = id => TECHS.find(t => t.id === id).cost.knowledge;
  const violations = TECHS.filter(t => {
    if (!t.req || !t.cost.knowledge) return false;
    const p = TECHS.find(x => x.id === t.req);
    return p && p.cost.knowledge && t.cost.knowledge <= p.cost.knowledge;
  }).map(t => t.id);
  return {
    count: k.length,
    era3: { sparks: cost("sparks"), chemtech: cost("chemtech"), hexcore: cost("hexcore"),
            deepWorks: cost("deepWorks"), icathia: cost("icathia") },
    bridge: { championsRegimen: cost("championsRegimen"), deepCartography: cost("deepCartography") },
    interstitial: { hexdraulics: cost("hexdraulics"), sumpEcology: cost("sumpEcology"),
                    progressDay: cost("progressDay"), chemBaronAccords: cost("chemBaronAccords"),
                    gloriousEvolution: cost("gloriousEvolution"), atlasGauntlets: cost("atlasGauntlets"),
                    hexgate: cost("hexgate"), greyReclamation: cost("greyReclamation"),
                    voidglassOptics: cost("voidglassOptics"), watchersBelow: cost("watchersBelow") },
    median: +sorted[Math.floor(sorted.length / 2)].toFixed(3),
    max: +Math.max(...steps).toFixed(3),
    callToArmsToSparks: +(cost("sparks") / cost("callToArms")).toFixed(3),
    over3: steps.filter(x => x > 3).length,
    violations
  };
});
// SUPERSEDED v0.46 Part 5 — ladder trimmed 45 -> 38 and re-skewed to Kittens' shape.
// SUPERSEDED v0.47 Part 1 — the ladder is Kittens' ladder rank for rank now.
check("the five Era-3 anchors land on the v0.47 Kittens-parity ladder",
  lad.era3.sparks === 20000 && lad.era3.chemtech === 60000 && lad.era3.hexcore === 75000 &&
  lad.era3.deepWorks === 100000 && lad.era3.icathia === 135000, JSON.stringify(lad.era3));
// SUPERSEDED v0.46 Part 5 — ladder trimmed 45 -> 38 and re-skewed to Kittens' shape.
// SUPERSEDED v0.47 Part 1 — the ladder is Kittens' ladder rank for rank now.
check("all ten Era-3 interstitials land on the v0.47 Kittens-parity ladder",
  lad.interstitial.hexdraulics === 50000 && lad.interstitial.sumpEcology === 55000 &&
  lad.interstitial.progressDay === 60000 && lad.interstitial.chemBaronAccords === 65000 &&
  lad.interstitial.gloriousEvolution === 85000 && lad.interstitial.atlasGauntlets === 90000 &&
  lad.interstitial.hexgate === 115000 && lad.interstitial.greyReclamation === 115000 &&
  lad.interstitial.voidglassOptics === 125000 && lad.interstitial.watchersBelow === 125000,
  JSON.stringify(lad.interstitial));
// SUPERSEDED v0.46 Part 5 — ladder trimmed 45 -> 38 and re-skewed to Kittens' shape.
// SUPERSEDED v0.47 Part 1 — the ladder is Kittens' ladder rank for rank now.
// v0.52 Part 2.4: three became two. Refined Metallurgy (42,000) is deleted with the
// Bloomery; Steel Axes re-homed onto Smelting, which already carried its prerequisite.
check("the two surviving Era-2 bridge techs land at 28,000 / 35,000",
  lad.bridge.championsRegimen === 28000 && lad.bridge.deepCartography === 35000,
  JSON.stringify(lad.bridge));
// SUPERSEDED v0.46 Part 5: the re-skew flattens the tail but Call to Arms -> Sparks is a
// real era boundary and now reads x2.0. The x14.3 cliff is what mattered and it is gone.
check("the ×14.3 Call to Arms → Sparks cliff is gone",
  lad.callToArmsToSparks <= 2.0, `×${lad.callToArmsToSparks}`);
// SUPERSEDED v0.46 Part 5 — Kittens' own largest early step is ×3.33 and RR now matches it.
check("no step anywhere exceeds Kittens' ×3.33", lad.max <= 3.35, `max ×${lad.max}`);
check("the median step is at or below Kittens' ×1.25 neighbourhood",
  lad.median <= 1.30, `×${lad.median}`);
check("cost still rises monotonically along every prerequisite chain",
  lad.violations.length === 0, lad.violations.join(", "));
check("Icathia is now within one order of magnitude of Kittens' last tech",
  lad.era3.icathia < 200000, String(lad.era3.icathia));

// ==================== Part 2.5.2 — Scholarship off the knowledge cap ====================
const sch = await page.evaluate(() => {
  S.buildings = { archive: 40, bardsHearth: 5 }; S.upgrades = {}; S.techs = {};
  S.jobs = {}; S.pop = 0; S.wanderers = []; S.policies = {}; S.champs = {}; S.wtechs = {}; S.drakes = {};
  S.leader = null; S.res.tome = 0; S.res.morellonomicon = 0;
  const k0 = computeCaps().knowledge, c0 = computeCaps().culture, d0 = computeCaps().devotion;
  S.upgrades = { cataloguing: 1, crossReferencing: 1, greatIndex: 1, annotatedIndex: 1, livingLibrary: 1 };
  const k1 = computeCaps().knowledge, c1 = computeCaps().culture, d1 = computeCaps().devotion;
  S.upgrades = {};
  // the description prose is generated from the same table the maths reads
  const prose = UPGRADES.find(u => u.id === "greatIndex").desc;
  S.buildings = {};
  return { kX: +(k1 / k0).toFixed(4), cX: +(c1 / c0).toFixed(4), dX: d0 > 0 ? +(d1 / d0).toFixed(4) : null,
           prose, mentionsKnowledge: /Knowledge/i.test(prose), capNames: Object.keys(SCHOLAR_CAPS) };
});
check("Scholarship no longer touches the knowledge cap at all",
  Math.abs(sch.kX - 1) < 1e-9, `×${sch.kX}`);
check("it still multiplies Culture by ×3.99", Math.abs(sch.cX - 3.99) < 0.02, `×${sch.cX}`);
check("SCHOLAR_CAPS is culture and devotion only",
  JSON.stringify(sch.capNames) === JSON.stringify(["culture", "devotion"]), JSON.stringify(sch.capNames));
check("and the prose no longer promises Knowledge storage — generated, not restated",
  !sch.mentionsKnowledge, sch.prose);

// ==================== gameplay note 1 — the wanderer cap starts at 0 ====================
const cap0 = await page.evaluate(() => {
  S.buildings = {}; S.upgrades = {}; S.policies = {};
  const empty = maxPop();
  S.buildings = { shelter: 1 };
  const oneShelter = maxPop();
  S.buildings = {};
  return { empty, oneShelter };
});
check("a settlement with no roof houses nobody", cap0.empty === 0, String(cap0.empty));
check("the first Shelter is what makes it a settlement (+2)", cap0.oneShelter === 2, String(cap0.oneShelter));

// ==================== gameplay notes 2 & 4 — the tab gates ====================
await reset();
const tabs = await page.evaluate(() => {
  const vis = () => TABS.filter(t => t.show()).map(t => t.id);
  S.buildings = {}; S.seenMax.knowledge = 999; S.pop = 5;
  const fresh = vis();
  S.buildings = { shelter: 1 };
  const withShelter = vis();
  S.buildings = { shelter: 1, archive: 1 };
  const withArchive = vis();
  // and an active tab that goes out of view must not strand the player
  S.activeTab = "lore"; S.buildings = {}; renderAll();
  const stranded = S.activeTab;
  S.buildings = {}; S.pop = 0;
  return { fresh, withShelter, withArchive, stranded };
});
check("a fresh camp shows neither Wanderers nor Lore",
  tabs.fresh.indexOf("village") === -1 && tabs.fresh.indexOf("lore") === -1, tabs.fresh.join(","));
check("the first Shelter opens the Wanderers tab",
  tabs.withShelter.indexOf("village") >= 0 && tabs.withShelter.indexOf("lore") === -1, tabs.withShelter.join(","));
check("the first Archive opens the Lore tab", tabs.withArchive.indexOf("lore") >= 0, tabs.withArchive.join(","));
check("losing the building behind the active tab falls back to Settlement, never a blank panel",
  tabs.stranded === "settlement", tabs.stranded);

// ==================== gameplay note 3 — the Census is a lore unlock ====================
const census = await page.evaluate(() => {
  const u = UPGRADES.find(x => x.id === "keepingTheRolls");
  S.buildings = { shelter: 20, archive: 1 }; S.pop = 6; S.wanderers = []; syncRoster();
  S.upgrades = {}; S.activeTab = "village"; renderAll();
  const locked = document.getElementById("tab-content").textContent;
  S.upgrades = { keepingTheRolls: 1 }; renderAll();
  const unlocked = document.getElementById("tab-content").textContent;
  const filters = document.querySelectorAll("[data-census]").length;
  S.upgrades = {}; S.buildings = {}; S.pop = 0; S.wanderers = []; syncRoster();
  return {
    exists: !!u, tech: u && u.tech, culture: u && u.cost && u.cost.culture,
    lockedNamesIt: /Keeping the Rolls/.test(locked),
    lockedHasNoRoster: document.querySelectorAll("[data-census]").length === 0 || !/Bronze/.test(locked),
    unlockedShowsRoster: /Challenger/.test(unlocked), filters
  };
});
check("Keeping the Rolls exists, costs Culture, and lands in the culture era",
  census.exists && census.tech === "songcraft" && census.culture === 60,
  `${census.tech} / ${census.culture} culture`);
check("before it, the Wanderers tab says how to get the Census", census.lockedNamesIt);
check("after it, the roster and its filters are there",
  census.unlockedShowsRoster && census.filters > 0, `${census.filters} filters`);

// ==================== gameplay note 5 — the Chronicle ====================
const chron = await page.evaluate(() => {
  S.buildings = {}; S.upgrades = {}; S.techs = {}; S.jobs = {}; S.pop = 0; S.wanderers = [];
  S.policies = {}; S.champs = {}; S.wtechs = {}; S.drakes = {}; S.leader = null;
  for (const r in S.res) { S.res[r] = 0; S.seenMax[r] = 0; }
  // nothing seen: nothing to give
  const noneSeen = EVENTS.filter(e => resUnlocked(e.res)).length;
  S.seenMax.timber = 100;
  const oneSeen = EVENTS.filter(e => resUnlocked(e.res)).map(e => e.res);
  // and the amount is bounded by storage, both ways
  S.buildings = { storehouse: 4, farmstead: 40 };
  const caps = computeCaps(), rates = computeRates();
  const amt = eventAmount("timber", 60, rates, caps);
  // a huge production rate must still not blow past 5% of the cap
  const rich = eventAmount("timber", 60, { timber: 1e9 }, caps);
  const poor = eventAmount("timber", 60, { timber: 0 }, caps);
  const src = fireRandomEvent.toString();
  for (const r in S.res) { S.res[r] = 0; S.seenMax[r] = 0; }
  S.buildings = {};
  return { noneSeen, oneSeen, amt, rich, poor, cap: caps.timber,
           filtersPool: /resUnlocked/.test(src), fraction: EVENT_CAP_FRACTION };
});
check("with nothing ever held, no Chronicle event can fire", chron.noneSeen === 0);
check("once timber has been seen, only the timber event is eligible",
  JSON.stringify(chron.oneSeen) === JSON.stringify(["timber"]), JSON.stringify(chron.oneSeen));
check("fireRandomEvent draws from the unlocked pool, not the whole table", chron.filtersPool);
check("an event is never worth more than 5% of that resource's storage",
  chron.rich <= chron.cap * 0.05 + 1e-9, `${Math.round(chron.rich)} against a ${Math.round(chron.cap)} cap`);
check("and never so small it is beneath mentioning (≥1% of storage)",
  chron.poor >= chron.cap * 0.01 - 1e-9, `${Math.round(chron.poor)}`);
check("a normal event sits between the two", chron.amt >= chron.poor && chron.amt <= chron.rich);

// ==================== gameplay note 6 — the boxes give more than they take ====================
const jack = await page.evaluate(() => {
  S.buildings = { storehouse: 6, farmstead: 20 }; S.upgrades = {}; S.techs = {};
  S.jobs = {}; S.pop = 0; S.wanderers = []; S.policies = {}; S.champs = {}; S.drakes = {};
  S.wtechs = {}; S.leader = null;
  for (const r in S.res) { S.res[r] = 0; S.seenMax[r] = 0; }
  S.res.timber = 1000; S.seenMax.timber = 1000;
  S.res.provisions = 1000; S.seenMax.provisions = 1000;
  S.res.gold = 1000; S.seenMax.gold = 1000;
  S.res.mana = 1000; S.seenMax.mana = 1000;
  const before = S.res.timber + S.res.provisions + S.res.gold + S.res.mana;
  // drive the real entry point many times and count which way it went
  let up = 0, down = 0;
  const seed = (() => { let x = 20240404; return () => (x = (x * 1103515245 + 12345) % 2147483648) / 2147483648; })();
  const realRandom = Math.random; Math.random = seed;
  for (let i = 0; i < 600; i++) {
    const b4 = S.res.timber + S.res.provisions + S.res.gold + S.res.mana + S.res.ore + S.res.furs + S.res.crystals;
    fireMischief();
    const af = S.res.timber + S.res.provisions + S.res.gold + S.res.mana + S.res.ore + S.res.furs + S.res.crystals;
    if (af > b4) up++; else if (af < b4) down++;
  }
  Math.random = realRandom;
  // and a single trick is a nuisance, not a setback
  S.res.timber = 1000; S.res.provisions = 0; S.res.gold = 0; S.res.mana = 0;
  const t0 = S.res.timber;
  const src = fireMischief.toString();
  for (const r in S.res) { S.res[r] = 0; S.seenMax[r] = 0; }
  S.buildings = {};
  return { up, down, ratio: +(up / (up + down)).toFixed(3), rate: JACK_POSITIVE_RATE,
           trickFraction: JACK_TRICK_FRACTION, treats: TREATS.length,
           routesToTreat: /fireTreat\(\)/.test(src), before, t0 };
});
check("the boxes are set to a 70/30 positive-to-negative split", jack.rate === 0.70, String(jack.rate));
check("fireMischief routes to a treat before it considers a trick", jack.routesToTreat);
check("over 600 boxes, roughly seven in ten are gifts",
  jack.ratio >= 0.62 && jack.ratio <= 0.78, `${jack.up} up / ${jack.down} down = ${jack.ratio}`);
check("a trick takes 2% of a stockpile, not 10%", jack.trickFraction === 0.02, String(jack.trickFraction));
check("there is a real table of positive flavour, not one line", jack.treats >= 4, String(jack.treats));

// ==================== regressions ====================
await reset();
const reg = await page.evaluate(() => {
  const o = {};
  o.coreFns = [tick, computeRates, computeCaps, morale, ascendTargon, renderAll, renderTop].every(f => typeof f === "function");
  S.res.devotion = 80; S.worship = 0; const a0 = S.ascends || 0;
  ascendTargon();
  o.ascentUnchanged = S.worship === 80 && S.res.devotion === 0 && S.ascends === a0 + 1;
  o.ascentFree = !/cooldown|cost/i.test(ascendTargon.toString());
  // saves round-trip the new buildings and upgrades
  S.buildings.hexdraulicPlant = 7; S.buildings.arcaneReactor = 3;
  S.upgrades.sumpVentilation = true; S.upgrades.keepingTheRolls = true;
  const str = serialize(); loadFromString(str);
  o.saveRT = S.buildings.hexdraulicPlant === 7 && S.buildings.arcaneReactor === 3 &&
             S.upgrades.sumpVentilation === true && S.upgrades.keepingTheRolls === true;
  // no NaN anywhere on a full Era-3 build
  S.buildings = {}; BUILDINGS.forEach(b => { S.buildings[b.id] = 12; });
  TECHS.forEach(t => { S.techs[t.id] = true; });
  UPGRADES.forEach(u => { S.upgrades[u.id] = true; });
  S.pop = 60; S.wanderers = []; syncRoster();
  S.jobs = { farmer: 10, woodcutter: 10, miner: 10, arcanist: 10, loremaster: 10, tinkerer: 10 };
  const rates = computeRates(), caps = computeCaps();
  o.noNaNRates = Object.values(rates).every(v => isFinite(v));
  o.noNaNCaps = Object.values(caps).every(v => isFinite(v));
  o.moraleFinite = isFinite(morale());
  return o;
});
for (const [k, v] of Object.entries(reg)) check("regression: " + k, v === true);

for (const tab of ["settlement", "crafting", "village", "lore", "wilds", "trade", "targon", "champions"]) {
  await page.evaluate(t => {
    BUILDINGS.forEach(b => { S.buildings[b.id] = Math.max(1, S.buildings[b.id] || 0); });
    TECHS.forEach(x => { S.techs[x.id] = true; });
    UPGRADES.forEach(u => { S.upgrades[u.id] = true; });
    S.seenMax.knowledge = 9e9; S.seenMax.mana = 9e9;
    S.activeTab = t; uiDirty = true; renderAll();
  }, tab);
  await page.waitForTimeout(40);
}
check("all 8 tabs render with every v0.44 building and upgrade owned, no console errors",
  errors.length === 0, errors.slice(0, 3).join(" | "));

console.log("\n" + pass + " passed, " + fail + " failed");
await browser.close();
process.exit(fail > 0 ? 1 : 0);
