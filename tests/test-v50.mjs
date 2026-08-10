// test-v50 — BUILDER SPEC v0.50 Part 6 pass conditions, plus Jerry's five directives.
import { chromium } from "playwright";
import { suiteEnd } from "./_suite-end.mjs";
const browser = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium" }).catch(() => chromium.launch());
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
const errors = [];
page.on("console", m => { if (m.type() === "error") errors.push(m.text()); });
page.on("pageerror", e => errors.push(String(e)));
await page.goto(new URL("../index.html", import.meta.url).href);
await page.waitForTimeout(500);
let pass = 0, fail = 0;
const check = (n, c, x) => { console.log(n + ":", c ? "PASS" : "FAIL", x ?? ""); c ? pass++ : fail++; };
const reset = () => page.evaluate(() => loadFromString(btoa(unescape(encodeURIComponent(JSON.stringify(freshState()))))));
const ALL_UPG = () => page.evaluate(() => { UPGRADES.forEach(u => S.upgrades[u.id] = true); });

// ============================================================================
// PART 1 — the census. The table is the deliverable, so it is asserted line by line.
// ============================================================================
await reset();
await ALL_UPG();
const cen = await page.evaluate(() => {
  const src = computeRates.toString();
  return {
    // 1.1 job-tier tool lines
    axe: { n: AXE_LINE.length, sum: +lineTotal(AXE_LINE).toFixed(4), mult: +axeMult().toFixed(4) },
    hoe: { n: HOE_LINE.length, sum: +lineTotal(HOE_LINE).toFixed(4), mult: +hoeMult().toFixed(4) },
    mwGone: !/\bvar mw\b/.test(src),
    mwInAxe: AXE_LINE.some(u => u[0] === "masterworkTools"),
    mwInHoe: HOE_LINE.some(u => u[0] === "masterworkTools"),
    minerNoLine: !/miner:\s*[^,]*(axeMult|hoeMult|Line)/.test(src),
    // 1.2 building ratio
    saw: { n: SAW_LINE.length, sum: +lineTotal(SAW_LINE).toFixed(4) },
    millPerCopy: +(0.10 * (1 + lineTotal(SAW_LINE))).toFixed(4),
    farmstead: BUILDINGS.find(b => b.id === "farmstead").boost,
    // v0.52 Part 1.2: the Aqueduct figure moved onto the NEW Irrigation Channel, so the
    // Farmstead can stay Kittens' plain field and the +3% has a building of its own.
    irrigation: (BUILDINGS.find(b => b.id === "irrigation") || {}).boost,
    farmsteadRatio: BUILDINGS.find(b => b.id === "farmstead").ratio,
    // 1.3 per-resource global ratio
    resRatioSrc: (src.match(/var resRatio = \{[\s\S]*?\n  \};/) || [""])[0],
    srcAll: src,
    // 1.4 the global tier
    globalExpr: (src.match(/var global = ([^;]+);/) || [])[1],
    transientExpr: (src.match(/var globalTransient = ([^;]+);/) || [])[1]
  };
});
check("1.1 — the axe line is seven rungs summing 3.45 (×4.45), Masterwork Tools among them",
  cen.axe.n === 7 && cen.axe.sum === 3.45 && cen.axe.mult === 4.45 && cen.mwInAxe,
  `${cen.axe.n} rungs, Σ${cen.axe.sum}, ×${cen.axe.mult}`);
check("1.1 — the plough line reaches ×1.55, against Kittens' two hoes at ×1.80",
  cen.hoe.n === 2 && cen.hoe.sum === 0.55 && cen.hoe.mult === 1.55 && cen.mwInHoe,
  `${cen.hoe.n} rungs, Σ${cen.hoe.sum}, ×${cen.hoe.mult}`);
check("1.1 — `mw` appears NOWHERE as a multiplier; the cross-resource category is gone",
  cen.mwGone && cen.minerNoLine);
check("1.2 — the saw line is six rungs summing 1.20, so the Lumber Mill reads 0.220 per copy",
  cen.saw.n === 6 && cen.saw.sum === 1.20 && cen.millPerCopy === 0.220,
  `${cen.saw.n} rungs, Σ${cen.saw.sum}, mill ${cen.millPerCopy}`);
// SUPERSEDED v0.52 Part 1.2. The Aqueduct figure moves OFF the Farmstead and onto the new
// Irrigation Channel — 0.03 provisions at ratio 1.12, on `mining` (not Cultivation: it
// costs ore 75 and ore arrives at rank 4, so Cultivation at rank 2 would have been an
// eighth raw-gate violation). The Farmstead keeps prod and drops boost entirely.
check("1.2 — the Aqueduct figure is on the Irrigation Channel now, and off the Farmstead",
  cen.irrigation && cen.irrigation.provisions === 0.03 && !cen.farmstead,
  `irrigation ${JSON.stringify(cen.irrigation)}, farmstead boost ${JSON.stringify(cen.farmstead)}`);
// SUPERSEDED v0.52 Part 2.1. `resRatio` is DELETED outright — table, apply loop and
// breakdown branch. It was a second, redundant expression of the same category `boosts`
// already carries, and Kittens has exactly one. Its last member moved to boosts.provisions.
check("2.1 — `resRatio` no longer exists anywhere in the build",
  cen.resRatioSrc === "" && !/var resRatio/.test(cen.srcAll || ""),
  cen.resRatioSrc || "deleted");
check("1.4 — `global` is the product of FIVE categories, not seven",
  cen.globalExpr.trim() === "catMonument * catReligion * catPolicy * catMeta * catBuff",
  cen.globalExpr.trim());
check("1.4 — the transient path takes catMetaTransient, NOT the drakes or the Soul",
  /catMetaTransient/.test(cen.transientExpr) && !/catMeta\b(?!Transient)/.test(cen.transientExpr),
  cen.transientExpr.trim());

const meta = await page.evaluate(() => {
  S.buildings = {}; S.jobs = {}; S.pop = 0; S.wanderers = []; S.policies = {};
  S.champs = {}; S.wtechs = {}; S.leader = null; S.worship = 0;
  S.upgrades = { celestialCharts: true }; S.drakes = { infernal: 100 }; S.dragonSoul = true;
  const full = 0.10 + drakeBonus("infernal", 0.5) + 0.25;
  const catMetaFull = 1 + limitedDR(full, 1.0);
  const oldFull = 1.10 * (1 + drakeBonus("infernal", 0.5)) * 1.25;
  // the Baron, measured through computeRates rather than read off the source
  S.buildings = { manaWell: 20 };
  const calm = computeRates().mana;
  S.baronUntil = simNow() + 60000;
  const buffed = computeRates().mana;
  S.baronUntil = 0; S.drakes = {}; S.dragonSoul = false; S.upgrades = {}; S.buildings = {};
  return { catMetaFull: +catMetaFull.toFixed(4), oldFull: +oldFull.toFixed(4),
           buffRatio: +(buffed / calm).toFixed(4) };
});
check("1.4 — catMeta is ≤ ×1.85 at a full stack, against the ×2.06 the three categories gave",
  meta.catMetaFull <= 1.85, `×${meta.catMetaFull} (was ×${meta.oldFull})`);
check("1.4 — the Hand of Baron is ×1.25, not ×2.00; nothing in Kittens doubles all production",
  Math.abs(meta.buffRatio - 1.25) < 1e-6, `×${meta.buffRatio}`);

// The three re-homed effects must GENERATE from their tables, not restate them.
const prose = await page.evaluate(() => ({
  plows: UPGRADES.find(u => u.id === "ironPlows").effect,
  mw: UPGRADES.find(u => u.id === "masterworkTools").effect,
  stw: UPGRADES.find(u => u.id === "seasonedTimberworks").effect,
  hex: UPGRADES.find(u => u.id === "hexresonance").effect,
  generated: typeof hoeDesc === "function" && typeof masterworkDesc === "function"
}));
// RE-POINTED v0.58, superseded by JERRY'S DEV NOTE 9 ("descriptions should not say 'one rung
// of the axe line' or '(×4.45 with all 7)'. No spoilers!"). The fully-stacked line totals told
// the player how many undiscovered upgrades a line still holds, which is the same spoiler class
// the tooltip layer already refuses elsewhere. The GENERATION property this assertion exists to
// guard is unchanged and is still asserted: the prose is built by the helpers from the tables,
// and each rung still states its OWN contribution from the table it lives in.
check("the three re-homed upgrades generate their prose from the same tables the code reads",
  prose.generated && /Farmers \+30%/.test(prose.plows) &&
  /Woodcutters \+25%/.test(prose.mw) && /Farmers \+25%/.test(prose.mw) &&
  /rises by 2\.5 points/.test(prose.stw) &&
  !/with all \d/.test(prose.plows + prose.mw + prose.stw),
  [prose.plows, prose.mw, prose.stw].join(" || "));

// ============================================================================
// PART 2 — the seven raw gates.
// ============================================================================
await reset();
const gates = await page.evaluate(() => {
  const raw = auditRawGraph();
  const st = BUILDINGS.find(b => b.id === "storehouse");
  const before = st.cost;
  st.cost = { timber: 50, ore: 75 };
  const withOre = auditRawGraph();
  st.cost = before;
  const t = id => TECHS.find(x => x.id === id).cost.knowledge;
  return {
    raw, clean: auditCostGraph(), withOre,
    refinery: BUILDINGS.find(b => b.id === "shimmerRefinery").tech,
    shimmerHidden: String(RES.shimmer.hidden),
    tavernGone: BUILDINGS.every(b => b.id !== "tavern"),
    reliefCarriers: BUILDINGS.filter(b => b.crowdRelief !== undefined).map(b => b.id),
    longhouse: BUILDINGS.find(b => b.id === "longhouse").tech,
    wheels: UPGRADES.find(u => u.id === "ironShodWheels").tech,
    prices: { chemtech: t("chemtech"), mining: t("mining"), carpentry: t("carpentry"),
              smelting: t("smelting"), deepWorks: t("deepWorks"), gloriousEvolution: t("gloriousEvolution") },
    geCost: TECHS.find(x => x.id === "gloriousEvolution").cost,
    // the Glorious Evolution must now be researchable: every component's gate at or below it
    geResearchable: auditRawGraph().every(v => !/gloriousEvolution/.test(v))
  };
});
check("auditRawGraph returns ZERO — all seven violations cleared",
  gates.raw.length === 0, gates.raw.join(" | ") || "[]");
check("auditCostGraph stays green too", gates.clean.length === 0, gates.clean.join(" | ") || "[]");
check("...and the check still bites: an ore-priced Storehouse adds exactly one violation back",
  gates.withOre.length === 1 && /storehouse/i.test(gates.withOre[0]), gates.withOre.join(" | "));
check("2.1 — the Shimmer Refinery moved to `chemtech`, which also gates its own alloy input",
  gates.refinery === "chemtech" && gates.prices.chemtech === 55000, gates.refinery);
check("2.1 — shimmer's VISIBILITY moved with its producer; the two are separate declarations",
  /techs\.chemtech/.test(gates.shimmerHidden) && !/deepWorks/.test(gates.shimmerHidden));
check("2.1 — THE GLORIOUS EVOLUTION IS RESEARCHABLE for the first time in any measured build",
  gates.geResearchable && gates.geCost.shimmer === 40 &&
  gates.prices.chemtech <= gates.prices.gloriousEvolution,
  `costs shimmer ${gates.geCost.shimmer}; shimmer now arrives at ${gates.prices.chemtech}, the tech is at ${gates.prices.gloriousEvolution}`);
// SUPERSEDED v0.52 Part 2.3. The Tavern is deleted; the gate it was moved to went with it.
// The invariant that replaces it is the merge's own pass condition.
check("2.3 — the Tavern is gone and EXACTLY ONE building carries crowdRelief",
  gates.tavernGone && gates.reliefCarriers.length === 1 && gates.reliefCarriers[0] === "bardsHearth",
  gates.reliefCarriers.join(", "));
check("2.2 — the Longhouse moved to CARPENTRY per Jerry, not `mining` per the spec",
  gates.longhouse === "carpentry" && gates.prices.carpentry === 1000,
  `${gates.longhouse} (${gates.prices.carpentry}) — clears ore at 500 AND closes the v0.47 logHouse/construction parity gap`);
check("2.2 — Iron-Shod Wheels moved to `smelting`, where the steel it costs exists",
  gates.wheels === "smelting" && gates.prices.smelting === 1500, gates.wheels);

// ============================================================================
// PART 3 — the Arcane Reactor at ×10.
// ============================================================================
const reactor = await page.evaluate(() => {
  const r = BUILDINGS.find(b => b.id === "arcaneReactor");
  const f = BUILDINGS.find(b => b.id === "hextechFoundry");
  return { cost: r.cost, ratio: r.ratio, gb: r.globalBoost, tech: r.tech, foundryCost: f.cost };
});
// v0.52 Part 1.1 ships the SECOND x10, ruled by Jerry in v0.50 item 4.
check("3 — the Arcane Reactor costs ×100 what it did at v0.49: hexcore 400, hexcrete 800, focusedHex 600",
  reactor.cost.hexcore === 400 && reactor.cost.hexcrete === 800 && reactor.cost.focusedHex === 600,
  JSON.stringify(reactor.cost));
check("3 — and nothing else about it moved: 0.05 at ratio 1.15 on Grey Reclamation",
  reactor.gb === 0.05 && reactor.ratio === 1.15 && reactor.tech === "greyReclamation");
check("3 — the Foundry is untouched; the separation is raised by lifting the Reactor only",
  reactor.foundryCost.hexgear === 200 && reactor.foundryCost.scaffold === 100,
  JSON.stringify(reactor.foundryCost));

// ============================================================================
// PART 4 — the band question, closed.
// ============================================================================
// (asserted in test-v34, whose comment now states the ruling rather than an open item)

// ============================================================================
// NO REGRESSION.
// ============================================================================
await reset();
const TABLE = {
  almanac: 30, cultivation: 100, woodcraft: 300, mining: 500, logistics: 500,
  scriptorium: 900, carpentry: 1000, trade: 1200, songcraft: 1300, smelting: 1500,
  masquerade: 1500, abyss: 2000, yordle: 2000, hextech: 2200, drakeLore: 3600,
  // v0.55 Part 2.1 RE-POINT: Petricite 9,500 -> 65,000 (+ 65 Morellonomica) — repriced
  // beside the Chem-Baron Accords, where the material line it gates actually opens.
  // This table is a no-regression mirror of test-v47's, and moves with it.
  // Superseded by: v0.55 Part 2.1.
  petricite: 65000, voidStudies: 12000, ritesOfTargon: 12000, callToArms: 15000, sparks: 20000,
  championsRegimen: 28000, deepCartography: 35000,
  // v0.52 Part 2.4: refinedMetallurgy (42000) deleted with the Bloomery; ladder is 37.
  hexdraulics: 50000, sumpEcology: 60000, progressDay: 60000,
  chemtech: 55000, chemBaronAccords: 65000, hexcore: 75000, gloriousEvolution: 85000,
  atlasGauntlets: 90000, deepWorks: 100000, hexgate: 115000, greyReclamation: 115000,
  voidglassOptics: 125000, watchersBelow: 125000, icathia: 135000
};
const reg = await page.evaluate(table => {
  const byId = {}; TECHS.forEach(t => byId[t.id] = t);
  const wrongPrice = Object.keys(table).filter(id => !byId[id] || byId[id].cost.knowledge !== table[id]);
  const ks = TECHS.filter(t => t.cost.knowledge).map(t => t.cost.knowledge).sort((a, b) => a - b);
  const steps = []; for (let i = 1; i < ks.length; i++) steps.push(ks[i] / ks[i - 1]);
  const sorted = [...steps].sort((a, b) => a - b);
  const med = sorted.length % 2 ? sorted[(sorted.length - 1) / 2] : (sorted[sorted.length / 2 - 1] + sorted[sorted.length / 2]) / 2;
  const geo = Math.exp(steps.reduce((s, v) => s + Math.log(v), 0) / steps.length);

  S.buildings = {}; S.upgrades = {}; S.jobs = {}; S.pop = 0; S.wanderers = [];
  S.policies = {}; S.champs = {}; S.wtechs = {}; S.drakes = {}; S.leader = null;
  S.res.tome = 0; S.res.morellonomicon = 0;
  const capBase = computeCaps().knowledge;
  S.buildings = { archive: 10 };
  const cap10 = computeCaps().knowledge;
  S.upgrades = { zauniteDrills: true, sumpVentilation: true };
  S.buildings = { mine: 12, quarry: 7 };
  const oreMeasured = jobBoostTotal("miner");
  S.upgrades = {}; S.buildings = { mine: 400 };
  const unbounded = Math.abs(jobBoostTotal("miner") - 0.20 * 400) < 1e-9;
  S.buildings = {};
  return {
    wrongPrice, n: ks.length, ties: steps.filter(v => v === 1).length,
    med: +med.toFixed(4), geo: +geo.toFixed(4), max: +Math.max(...steps).toFixed(3),
    capBase, cap10, archiveCap: BUILDINGS.find(b => b.id === "archive").caps.knowledge,
    oreMeasured: +oreMeasured.toFixed(10), oreClosed: +(0.25 * 12 + 0.40 * 7).toFixed(10), unbounded,
    monumentMembers: BUILDINGS.filter(b => b.globalBoost).map(b => b.id),
    shelterVigor: BUILDINGS.find(b => b.id === "shelter").caps.vigor,
    // v0.52 Part 2.1: `resRatio` is deleted, so Cultivation's +10% is no longer a ternary
    // inside it — it is `boosts.provisions += 0.10`. Asserted by MEASUREMENT now, which is
    // the stronger check: grep only ever proved a string was present.
    cultivation: (() => {
      const setup = t => { S.buildings = { farmstead: 10 }; S.upgrades = {}; S.jobs = {};
        S.pop = 0; S.wanderers = []; S.policies = {}; S.champs = {}; S.wtechs = {};
        S.drakes = {}; S.leader = null; S.worship = 0; S.techs = t ? { cultivation: 1 } : {};
        return computeRates().provisions; };
      const off = setup(false), on = setup(true);
      return off > 0 && Math.abs(on / off - 1.10) < 1e-9;
    })(),
    stripe: (worshipBonus.toString().match(/unlimitedDR\(S\.worship \|\| 0, (\d+)\)/) || [])[1],
    shrine: BUILDINGS.find(b => b.id === "shrine").prod.devotion,
    acolyte: JOBS.find(j => j.id === "acolyte").prod.devotion,
    acolyteNoMax: JOBS.find(j => j.id === "acolyte").max === undefined,
    wtechs: WTECHS.map(w => w.id + ":" + w.threshold).join(","),
    catchUpClean: !/renderTop\(|renderAll\(\)|updateAffordability\(\)|updateLive\(\)/.test(runCatchUp.toString())
  };
}, TABLE);
// RE-POINTED v0.61, superseded by DEV NOTE 4 (Jerry): The Champions' Regimen (28,000) and
// Deep Cartography (35,000) are MERGED into The Vanguard Doctrine (45,000), which unlocks both
// Standing Orders and Surveyed Approaches. **The ladder goes 36 -> 35 techs.** Both retired ids
// are RESERVED under STANDING-RULINGS §30 until v1.0. The SHAPE conditions this assertion
// actually protects — tie count, median step, geometric step, largest single cliff — are
// unchanged and are what still carries the check.
check("no regression — all 35 tech prices unchanged, apart from the two the merge retired",
  reg.wrongPrice.filter(w => !/championsRegimen|deepCartography/.test(w)).length === 0 && reg.n === 35,
  reg.wrongPrice.join(", ") || "35 techs");   // v0.59.1 notes 3, 4.2; v0.61 dev note 4
check("no regression — the five ladder conditions still hold together",
  reg.n === 35 && reg.ties >= 5 && reg.med >= 1.10 && reg.med <= 1.25 &&
  reg.geo >= 1.20 && reg.geo <= 1.30 && reg.max <= 3.5,
  `n=${reg.n} ties=${reg.ties} median=×${reg.med} geo=×${reg.geo} max=×${reg.max}`);
check("no regression — catMonument is still exactly two members",
  reg.monumentMembers.length === 2, reg.monumentMembers.join(", "));
check("no regression — the ore category is still 1 + 0.25M + 0.40Q exactly",
  Math.abs(reg.oreMeasured - reg.oreClosed) < 1e-9, `+${(reg.oreMeasured * 100).toFixed(0)}%`);
check("no regression — knowledge cap is buildings alone, starting at 0",
  reg.capBase === 0 && reg.cap10 === 10 * reg.archiveCap, `base ${reg.capBase}, 10 archives ${reg.cap10}`);
check("no regression — buildingJobBoost is still unbounded", reg.unbounded);
check("no regression — Shelter 75 kept, and Cultivation still DELIVERS exactly +10%",
  reg.shelterVigor === 75 && reg.cultivation, `shelter vigor ${reg.shelterVigor}, cultivation x1.10 ${reg.cultivation}`);
check("no regression — nothing in the religion layer moved",
  reg.stripe === "1000" && reg.shrine === 0.0075 && reg.acolyte === 0.0075 && reg.acolyteNoMax &&
  reg.wtechs === "solariHymn:50,ritesOfInsight:200,sunAltar:400,solariAltar:600,convergence:1500",
  `stripe ${reg.stripe}, shrine ${reg.shrine}, acolyte ${reg.acolyte}`);
check("no regression — the catch-up loop still renders nothing per simulated day", reg.catchUpClean);

// The category collapse must not have leaked drakes or the Soul onto transients.
const trans = await page.evaluate(() => {
  // knowledge needs a worker and mana needs a well — with neither, the base rate is 0
  // and the ratio is null rather than 1, which is what the first version of this measured.
  S.buildings = { archive: 20, bardsHearth: 10, shrine: 10, manaWell: 20 }; S.upgrades = {};
  S.pop = 6; S.jobs = { loremaster: 6 }; S.wanderers = []; S.policies = {}; S.champs = {};
  S.wtechs = {}; S.leader = null; S.worship = 0; S.drakes = {}; S.dragonSoul = false;
  const base = computeRates();
  S.drakes = { infernal: 100 }; S.dragonSoul = true;
  const withMeta = computeRates();
  const r = {};
  ["knowledge", "culture", "devotion", "mana"].forEach(k => {
    r[k] = base[k] > 0 ? +(withMeta[k] / base[k]).toFixed(6) : null;
  });
  S.drakes = {}; S.dragonSoul = false; S.buildings = {}; S.jobs = {}; S.pop = 0;
  return r;
});
check("the collapse did NOT hand the drakes or the Dragon Soul to transient resources",
  trans.knowledge === 1 && trans.culture === 1 && trans.devotion === 1 && trans.mana > 1,
  `knowledge ×${trans.knowledge}, culture ×${trans.culture}, devotion ×${trans.devotion}, mana ×${trans.mana}`);

check("no console errors across the whole suite", errors.length === 0, errors.slice(0, 3).join(" | "));

console.log(`\n${pass} passed, ${fail} failed`);
await browser.close();
suiteEnd(import.meta.url, pass, fail);
process.exit(fail ? 1 : 0);
