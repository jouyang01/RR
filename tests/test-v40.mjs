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

// ============ Part 1A — the Tome clamp is gone, Scholarship IV/V exist ============
await reset();
const p1a = await page.evaluate(() => {
  const o = {};
  o.noClamp = !/Math\.min\(\s*150 \* Math\.floor/.test(computeCaps.toString());
  o.capsSrc = computeCaps.toString();
  o.tomeTermPresent = /caps\.knowledge \+= 150 \* Math\.floor/.test(computeCaps.toString());
  // a tome pile far past the building cap now actually counts
  S.buildings = { archive: 1 }; S.techs = {}; S.upgrades = {}; S.policies = {}; S.champs = {}; S.wtechs = {}; S.pop = 0;
  S.res.tome = 0; const capNoTomes = computeCaps().knowledge;
  S.res.tome = 100; const cap100 = computeCaps().knowledge;
  S.res.tome = 1000; const cap1000 = computeCaps().knowledge;
  o.capNoTomes = Math.round(capNoTomes);
  o.linearInTomes = Math.abs((cap1000 - capNoTomes) / (cap100 - capNoTomes) - 10) < 1e-6;
  o.unbounded = cap1000 > capNoTomes * 20;
  o.perTome = (cap100 - capNoTomes) / 100;
  S.res.tome = 0;
  const iv = UPGRADES.find(u => u.id === "annotatedIndex");
  const v = UPGRADES.find(u => u.id === "livingLibrary");
  o.iv = iv && { tech: iv.tech, cost: iv.cost };
  o.v = v && { tech: v.tech, cost: v.cost };
  // the scholarship line multiplies knowledge/culture/devotion and nothing else
  S.buildings = { archive: 4, bardsHearth: 4 }; S.techs = { songcraft: true };
  S.upgrades = {}; const before = computeCaps();
  S.upgrades = { annotatedIndex: true, livingLibrary: true }; const after = computeCaps();
  o.knowledgeX = +(after.knowledge / before.knowledge).toFixed(3);
  o.cultureX = +(after.culture / before.culture).toFixed(3);
  o.timberX = +(after.timber / before.timber).toFixed(3);
  S.buildings = {}; S.upgrades = {}; S.techs = {};
  return o;
});
// v0.41 §2.1 supersedes: Tomes leave the Knowledge cap ENTIRELY. v0.40's uncapping was
// the right diagnosis (the clamp was why the cap asymptoted) but the wrong dose — it
// made the whole Era-3 ladder fur-bound, and five techs across a 25x Knowledge range
// cleared in 35 game-years. The gate moves onto Hexcore Laboratories instead.
// v0.42 Part 2a supersedes BOTH v0.40 and v0.41 here, and the analyzer withdrew its own
// instruction: workshop.js:2785 reads
//   scienceMax = min(compendia x 10, building cap)
// so Kittens DOES clamp its compendium line — RR's original clamp was correct and v0.41
// deleted it on bad recollection. It is back, on the Morellonomicon, at Kittens' shape.
// Tomes stay out of the knowledge cap; their real Kittens job is the CULTURE cap.
check("the compendium clamp is restored, on the Morellonomicon, and Tomes stay out",
  !p1a.tomeTermPresent && /Math\.min\(\s*150 \* Math\.floor\(S\.res\.morellonomicon/.test(p1a.capsSrc));
check("Tomes contribute nothing to the cap directly — they buy the Scholarship line",
  p1a.perTome === 0 && !p1a.unbounded, `${p1a.perTome}/tome against a ${p1a.capNoTomes} building cap`);
check("Scholarship IV lands at Chemtech, before the Hexcore it has to fund",
// v0.46 Part 5A.1: Chemtech's culture 600 was stripped off the tech and absorbed here,
  // so the Annotated Index now costs 4,600 culture. Placement is what this asserts.
  // v0.47 Part 4.2 returned Chemtech's culture 600 to the TECH, so the Annotated Index is
  // back to 4,000. Placement is what this asserts.
  p1a.iv && p1a.iv.tech === "chemtech" && p1a.iv.cost.tome === 40 && p1a.iv.cost.culture === 4000, JSON.stringify(p1a.iv));
check("Scholarship V lands at Deep Works, before the Icathia it has to fund",
// v0.46 Part 5A.1: Deep Works' culture 900 + hexcore 5 were absorbed here.
  p1a.v && p1a.v.tech === "deepWorks" && p1a.v.cost.tome === 120 && p1a.v.cost.hexcore === 4, JSON.stringify(p1a.v));
// v0.42 Part 2b cut the whole line from x22.4 to x3.99 — Kittens has no multiplicative
// science-cap line at all, and x22.4 meant the science BUILDINGS barely mattered. IV+V
// are now x1.35 x x1.4 = x1.89. Still knowledge/culture/devotion only.
// v0.44 Part 2.5.2 supersedes the knowledge half of this: the Scholarship line LEFT
// the knowledge cap entirely, because a multiplicative science-cap line is exactly what
// forced Era 3's ladder to be priced 9-37x above Kittens'. Knowledge is now buildings
// plus the clamped Morellonomicon term, as Kittens does it. Culture and Devotion keep
// the line, so the ×1.89 is asserted there and knowledge must now be ×1.
// RE-POINTED v0.58, superseded by SPEC PART 3 (the Scholarship restructure). The two rungs
// multiplied to ×1.89 (1.35 × 1.40); they now ADD to ×1.75 (1 + 0.35 + 0.40). The isolation
// half of this assertion — nothing on knowledge, nothing on materials — is UNCHANGED and is
// the half that was ever load-bearing.
check("Scholarship IV+V are ×1.75 on culture (v0.58: additive), and nothing on knowledge or materials",
  Math.abs(p1a.knowledgeX - 1) < 1e-6 && Math.abs(p1a.cultureX - 1.75) < 0.01 && Math.abs(p1a.timberX - 1) < 1e-6,
  `k×${p1a.knowledgeX} c×${p1a.cultureX} timber×${p1a.timberX}`);
// deliberate deviation, flagged to the analyzer
const LADDER_IDS = ["cataloguing", "crossReferencing", "greatIndex", "annotatedIndex", "livingLibrary"];
const ladder = await page.evaluate(ids => ids.map(id => UPGRADES.find(u => u.id === id).tech), LADDER_IDS);
// v0.54 directive 5: Scholarship I moved Songcraft -> Rites of Targon, where II already sat.
// A tie is only legitimate if a `req` orders them, so the req is asserted beside the tier.
const ladderReqs = await page.evaluate(ids => ids.map(id => UPGRADES.find(u => u.id === id).req || null), LADDER_IDS);
// v0.41 §2.1(b) moves the Great Index one tier earlier still, sparks -> callToArms, so
// pre-Sparks scholarMult is 5.6 rather than 2.8. Still monotonic.
check("the Scholarship ladder is monotonic in tech order (v0.54 d5: I and II now TIE at Rites of Targon, ordered by req)",
  JSON.stringify(ladder) === JSON.stringify(["ritesOfTargon", "ritesOfTargon", "callToArms", "chemtech", "deepWorks"]) &&
  ladderReqs[1] === "cataloguing", JSON.stringify(ladder) + " reqs " + JSON.stringify(ladderReqs));
// NOT changed this pass, on Jerry's explicit instruction
const prices = await page.evaluate(() => {
  const t = id => TECHS.find(x => x.id === id).cost.knowledge;
  return { sparks: t("sparks"), chemtech: t("chemtech"), hexcore: t("hexcore"), deepWorks: t("deepWorks"), icathia: t("icathia") };
});
// v0.44 Part 2.5 is the pass that finally moves them, together with Part 1's income
// correction — Jerry's directive 1: costs come down and the multiplier stack comes up.
// SUPERSEDED v0.46 Part 5 — ladder trimmed 45 -> 38 and re-skewed to Kittens' shape.
// SUPERSEDED v0.47 Part 1 — the ladder is Kittens' ladder rank for rank now.
check("Era-3 tech prices sit on the v0.47 Kittens-parity ladder",
  prices.sparks === 20000 && prices.chemtech === 60000 && prices.hexcore === 75000 &&
  prices.deepWorks === 100000 && prices.icathia === 135000, JSON.stringify(prices));

// ============ Part 1B — the luxury camp yield ceiling ============
const p1b = await page.evaluate(() => {
  const o = { limit: typeof LUXURY_CAMP_YIELD_LIMIT !== "undefined" && LUXURY_CAMP_YIELD_LIMIT === 1.0,
              matLimit: CAMP_YIELD_LIMIT === 6 };
  // v0.55 Part 4 RE-POINT: `hunterLodge` is DELETED and the Jungler no longer feeds this
  // stack, so the old `{ hunterLodge: 40 }, { jungler: 40 }` probe now measures nothing.
  // The fully-invested settlement is the SOURCE's seven members: five hunt Discoveries
  // (1.0 + 2.0 + 1.0 + 0.5 + 0.5), the Open Range policy (0.1), and 20 Trailblazers
  // (20 x 0.005 = 0.10) -> Sigma 5.10, which is Kittens' own Sigma exactly.
  S.buildings = {}; S.jobs = {}; S.policies = {}; S.champs = {};
  S.wanderers = []; for (var i = 0; i < 20; i++) S.wanderers.push({ t: "trailblazer" });
  _traitCounts = null;
  S.upgrades = { trappersCraft: 1, beastLore: 1, masterOfTheHunt: 1, atlasGauntletsUp: 1, jessedHawks: 1 };
  S.policies = { openRange: 1 };
  o.sigma = +(1.0 + 2.0 + 1.0 + 0.5 + 0.5 + 0.1 + traitBonus("trailblazer")).toFixed(3);
  o.materials = +campYieldMult().toFixed(3);
  o.luxury = +campYieldMult(true).toFixed(3);
  S.buildings = {}; S.jobs = {}; S.upgrades = {}; S.policies = {}; S.wanderers = []; _traitCounts = null;
  o.bareMaterials = +campYieldMult().toFixed(3);
  o.bareLuxury = +campYieldMult(true).toFixed(3);
  // the three luxury camps must pass the flag; the material camps must not
  const src = id => EXPEDITIONS.find(e => e.id === id).run.toString();
  o.wolvesLux = /campYieldMult\(true\)/.test(src("wolves"));
  o.grompLux = /campYieldMult\(true\)/.test(src("gromp"));
  o.raptorsLux = /campYieldMult\(true\)/.test(src("raptors"));
  o.krugsNotLux = !/campYieldMult\(true\)/.test(src("krugs"));
  return o;
});
check("LUXURY_CAMP_YIELD_LIMIT is 1.0 and the material limit is untouched at 6", p1b.limit && p1b.matLimit);
check("both multipliers start at ×1", p1b.bareMaterials === 1 && p1b.bareLuxury === 1);
// v0.55 Part 4 RE-POINT: the stack is the SOURCE's now — Sigma 5.10 across seven members
// against Kittens' own 5.10 -> x6.10, delivered through limitedDR(_, 6) at x5.9. The old
// ">6" was reachable only because RR carried two extra RR-original members (the Hunter's
// Lodge per copy and the Jungler per worker), both of which v0.55 deletes. The band is the
// spec's pass condition. Superseded by: v0.55 Part 4.
check("a fully invested settlement gets ×5.7–6.1 on materials — Kittens' own Σ 5.10 → ×6.10",
  p1b.materials >= 5.7 && p1b.materials <= 6.1, `×${p1b.materials}`);
check("but comforts are held under ×2", p1b.luxury < 2 && p1b.luxury > 1.9, `×${p1b.luxury}`);
check("Wolves, Gromp and Raptors pass the luxury flag; Krugs does not",
  p1b.wolvesLux && p1b.grompLux && p1b.raptorsLux && p1b.krugsNotLux);

// ============ Part 2.3 — the Wilds at a flat 100 Vigor ============
const p23 = await page.evaluate(() => {
  const c = id => EXPEDITIONS.find(e => e.id === id).cost.vigor;
  // v0.54 directive 4 RE-POINT: an expedition's `yield` may now be a FUNCTION of state, so
  // the Gromp line can stop advertising the stray poro to a player who has not researched
  // Abyssal Cartography. Read it through the game's own expYield(), which is what both
  // tooltip call sites use.
  const y = id => expYield(EXPEDITIONS.find(e => e.id === id)).join(" · ");
  // average yield straight out of the run() source, at multiplier 1
  const avg = { wolves: (12 + 19) / 2, gromp: (10 + 23) / 2, raptors: (12 + 18) / 2 };
  const src = id => EXPEDITIONS.find(e => e.id === id).run.toString();
  return {
    costs: { wolves: c("wolves"), gromp: c("gromp"), raptors: c("raptors"), krugs: c("krugs") },
    perUnit: {
      wolves: +(c("wolves") / avg.wolves).toFixed(2),
      gromp: +(c("gromp") / avg.gromp).toFixed(2),
      raptors: +(c("raptors") / avg.raptors).toFixed(2)
    },
    // v0.55 Part 8 RE-POINT: every roll inside EXPEDITIONS now goes through the undo-penalty
    // wrappers `rerollAmt` / `rerollHit` instead of raw Math.random. The RANGES are unchanged;
    // only the source of the uniform moved. Superseded by: v0.55 Part 8.
    wolvesRange: /12 \+ Math\.floor\(rerollAmt\("hunt"\) \* 8\)/.test(src("wolves")),
    grompRange: /10 \+ Math\.floor\(rerollAmt\("hunt"\) \* 14\)/.test(src("gromp")),
    raptorRange: /12 \+ Math\.floor\(rerollAmt\("hunt"\) \* 7\)/.test(src("raptors")),
    strings: { wolves: y("wolves"), gromp: y("gromp"), raptors: y("raptors") },
    grompWithAbyss: (function () { var had = S.techs.abyss; S.techs.abyss = true;
                                   var v = y("gromp"); S.techs.abyss = had; return v; })()
  };
});
check("all three luxury camps cost exactly 100 Vigor, Krugs stays at 150",
  p23.costs.wolves === 100 && p23.costs.gromp === 100 && p23.costs.raptors === 100 && p23.costs.krugs === 150,
  JSON.stringify(p23.costs));
// v0.55 Part 8 RE-POINT: the roll source moved to `rerollAmt`; the ranges did not.
check("Wolves yield 12–19, Gromp 10–23, Raptors unchanged 12–18",
  p23.wolvesRange && p23.grompRange && p23.raptorRange);
check("per-unit vigor cost stays inside the 6.0–6.7 parity band",
  Object.values(p23.perUnit).every(v => v >= 6.0 && v <= 6.7), JSON.stringify(p23.perUnit));
check("the three yield strings were updated to match",
  /12–19 furs/.test(p23.strings.wolves) && /10–23 mushrooms/.test(p23.strings.gromp) && /12–18/.test(p23.strings.raptors),
  JSON.stringify(p23.strings));
check("v0.54 directive 4 — the Gromp line names the stray poro ONLY once Abyssal Cartography is in",
  !/stray poro/.test(p23.strings.gromp) && /stray poro/.test(p23.grompWithAbyss),
  `without: ${p23.strings.gromp}  |  with: ${p23.grompWithAbyss}`);
check("a starting Vigor bar (100) now buys exactly one hunt", p23.costs.wolves === 100);

// ============ Parts 2.1 + 2.2 — the morale rewrite ============
const p22 = await page.evaluate(() => {
  const o = {};
  S.buildings = {}; S.jobs = {}; S.upgrades = {}; S.policies = {}; S.champs = {}; S.wtechs = {}; S.wanderers = [];
  S.pop = 40; S.jackboxes = 0; if (typeof invalidateCensus === "function") invalidateCensus();
  const C = luxuryComfort();
  ["mushrooms", "furs", "plumes"].forEach(r => S.res[r] = C);
  S.res.poros = 500; S.res.trueice = 500;
  o.types = luxuryTypes();
  o.poroGone = typeof poroMoraleBonus === "undefined";
  // poros and true ice pay nothing now
  const withFluff = morale();
  S.res.poros = 0; S.res.trueice = 0;
  o.poroPaysNothing = morale() === withFluff;
  // luxury term caps at exactly +30
  ["mushrooms", "furs", "plumes"].forEach(r => S.res[r] = C * 100);
  const bd = {}; morale(bd);
  o.luxCap = +bd.lux.toFixed(4);
  // relief asymptote
// v0.52 Part 2.3 merged the Tavern into the Bard's Hearth at 0.0115/copy (from 0.05),
// sized from measured counts. Every count in this file is scaled x4.348 so the RAW RELIEF
// SUM — and therefore every morale number asserted below — is held fixed.
  S.buildings = { bardsHearth: 100000 };
  const bd2 = {}; morale(bd2);
  o.reliefAsymptote = +bd2.relief.toFixed(4);
  S.buildings = { bardsHearth: 261 };   // 60 Taverns x4.348
  const bd2b = {}; morale(bd2b);
  o.reliefAt60 = +bd2b.relief.toFixed(4);
  // shrine and box ceilings
  S.buildings = { shrine: 100000 }; S.wtechs = { sunAltar: true }; S.altarTier = 3;
  const bd3 = {}; morale(bd3);
  o.shrineCeiling = +bd3.shrine.toFixed(2);
  S.buildings = {}; S.wtechs = {}; S.jackboxes = 100000;
  const bd4 = {}; morale(bd4);
  o.boxCeiling = +bd4.box.toFixed(2);
  // the stated positive ceiling: 100 + 30 + 25 + 20
  S.buildings = { bardsHearth: 1e9, shrine: 1e9 }; S.wtechs = { sunAltar: true }; S.pop = 5;
  o.absoluteCeiling = morale();
  S.buildings = {}; S.jackboxes = 0; S.wtechs = {}; S.altarTier = 0; S.pop = 0;
  ["mushrooms", "furs", "plumes"].forEach(r => S.res[r] = 0);
  return o;
});
check("luxuryTypes() keeps only the three maintained comforts",
  JSON.stringify(p22.types) === JSON.stringify(["mushrooms", "furs", "plumes"]), JSON.stringify(p22.types));
check("poroMoraleBonus() is deleted outright", p22.poroGone);
check("Poros and True Ice pay no morale at all now", p22.poroPaysNothing);
check("the comfort term caps at exactly +30", p22.luxCap === 30, `+${p22.luxCap}`);
check("Hearth relief asymptotes at 0.88, never 1.0 — crowding can't be cancelled",
  p22.reliefAsymptote <= 0.88 && p22.reliefAsymptote > 0.8799, String(p22.reliefAsymptote));
check("even 261 Hearths (60 Taverns' worth) leaves a real crowding residue", p22.reliefAt60 < 0.87, String(p22.reliefAt60));
check("Shrine morale is LDR-bounded at +25", p22.shrineCeiling <= 25 && p22.shrineCeiling > 24.9, `+${p22.shrineCeiling}`);
check("Jack-in-the-Box is bounded at +20", p22.boxCeiling <= 20 && p22.boxCeiling > 19.9, `+${p22.boxCeiling}`);
check("the positive ceiling is 175 as specified", p22.absoluteCeiling === 175, String(p22.absoluteCeiling));

// the analyzer's own Part 2.2 curve, term for term
const curve = await page.evaluate(() => {
  const at = (pop, tav, shr, altar, box, luxFrac) => {
    S.buildings = { bardsHearth: tav, shrine: shr };
    S.jobs = {}; S.upgrades = {}; S.policies = {}; S.champs = {}; S.wanderers = [];
    S.wtechs = altar ? { sunAltar: true } : {}; S.altarTier = 0;
    S.pop = pop; S.jackboxes = box;
    if (typeof invalidateCensus === "function") invalidateCensus();
    ["mushrooms", "furs", "plumes"].forEach(r => S.res[r] = luxuryComfort() * luxFrac);
    return morale();
  };
  const r = {
    // v0.52 Part 2.3: 2/6/16/30/60 Taverns -> 9/26/70/130/261 Hearths (x4.348).
    era0: at(20, 9, 0, false, 0, 1),
    era1: at(40, 26, 0, false, 0, 1),
    era2: at(80, 70, 20, true, 3, 1),
    era3: at(130, 130, 40, true, 8, 1),
    era3inv: at(130, 261, 60, true, 8, 1),
    late: at(190, 261, 60, true, 8, 1)
  };
  S.buildings = {}; S.pop = 0; S.jackboxes = 0; S.wtechs = {};
  ["mushrooms", "furs", "plumes"].forEach(x => S.res[x] = 0);
  return r;
});
check("Era 1 is a real pinch, well clear of the 25 floor", curve.era1 < 90 && curve.era1 > 25, String(curve.era1));
check("Era 3 lands in the 120–140 band with Hearth investment",
  curve.era3 >= 118 && curve.era3inv >= 125 && curve.era3inv <= 142, `${curve.era3} → ${curve.era3inv}`);
check("morale still tapers past 130 wanderers, so growth stays a trade-off",
  curve.late < curve.era3inv, `pop130 ${curve.era3inv} → pop190 ${curve.late}`);
check("the curve dips in Era 1 and recovers through Era 2",
  curve.era1 < curve.era0 && curve.era2 > curve.era1, `${curve.era0} → ${curve.era1} → ${curve.era2}`);

// ============ Part 2.4 — Convergence at Kittens parity ============
const p24 = await page.evaluate(() => {
  S.wtechs = { convergence: true };
  const at = w => { S.worship = w; return +(worshipBonus() * 100).toFixed(2); };
  const o = { k1: at(1000), k25: at(25000), k100: at(100000), m1: at(1000000), huge: at(1e18),
              k481k: at(481250), k548k: at(548000),
              wNow: at(28256), stripe: +(worshipBonus.toString().match(/unlimitedDR\(S\.worship \|\| 0, (\d+)\)/) || [])[1] };
  o.coefficient = /0\.01 \* unlimitedDR/.test(worshipBonus.toString());
  o.ceiling = /Math\.min\(10\.0/.test(worshipBonus.toString());
  o.desc = WTECHS.find(w => w.id === "convergence").desc;
  S.worship = 0; S.wtechs = {};
  return o;
});
check("Convergence runs at Kittens' 0.01 coefficient, not 5× it", p24.coefficient);
// v0.42 sets the stripe from a measured three-seed median (255k/481k/548k Worship at
// Sparks, a 2.15x spread after Part 2d's Acolyte fix): s = 8 x W_median / 195 = 20,000.
// The COEFFICIENT is still Kittens' 0.01 and the curve is still the same primitive.
// SUPERSEDED v0.46 Part 6 — the Convergence stripe is set from the four-seed W1.
// Those three Worship figures were measured on the v0.42 economy. v0.45 Part 4 cut the
// acolyte 0.012 -> 0.0075 and v0.45 Part 3 took population 477 -> 202, so Worship at
// Sparks fell ~18x to a four-seed median of 28,256 and the stripe with it, 20,000 -> 1,884.
// Feeding v0.42 Worship into a v0.46 stripe is what these two now measure, so they read
// the CURRENT median instead.
check("the stripe lands the CURRENT median Worship-at-Sparks in the 5-8% band",
  p24.wNow >= 5 && p24.wNow <= 8, `${p24.wNow}% at W1 = 28,256`);
// SUPERSEDED v0.47 Part 2: the stripe is Kittens' own 1,000, adopted rather than derived.
// The five-round loop of re-deriving `s` against a moving input ends by fixing the SUPPLY —
// devotion transient, the Shrine at Kittens' Temple rate, the Acolyte cap gone.
check("the stripe is Kittens' own 1,000, adopted not derived", p24.stripe === 1000, String(p24.stripe));
check("still well under the ceiling at a million Worship", p24.m1 < 50, `${p24.m1}%`);
check("Kittens' +1000% hard ceiling is present and binds", p24.ceiling && p24.huge === 1000, `${p24.huge}%`);
check("the Convergence description now states the scale",
  /\+1%/.test(p24.desc) && /Era 3/.test(p24.desc), p24.desc);

// ============ Part 1C — the Poro sacrifice at 60 ============
const p1c = await page.evaluate(() => {
  const sac = CRAFTS.find(c => c.id === "poroTears");
  S.buildings = { watchersEye: 2 }; S.res.poros = 200; S.res.poroTears = 0;
  craftItem("poroTears", 1);
  const o = { cost: PORO_SACRIFICE_COST, recipeCost: sac.cost.poros, spent: 200 - S.res.poros, tears: S.res.poroTears,
              // v0.48 §4: the numbers moved out of `effect` and into the GENERATED Effects
              // block. The assertion now reads the block the player actually sees.
              effect: effectLines(BUILDINGS.find(b => b.id === "watchersEye")).join(" ") };
  S.buildings = {}; S.res.poros = 0; S.res.poroTears = 0;
  return o;
});
check("the Poro sacrifice costs 60, not 250", p1c.cost === 60 && p1c.recipeCost === 60);
check("one sacrifice spends 60 Poros and pays one Tear per Eye", p1c.spent === 60 && p1c.tears === 2, `${p1c.spent} poros → ${p1c.tears} tears`);
check("the Watcher's Eye tooltip names its now-uncontested claim on Poros",
  /60 Poros/.test(p1c.effect) && /morale/.test(p1c.effect));

// ============ Part 3 — the tooltip can no longer drift from morale() ============
const p3 = await page.evaluate(() => {
  const o = {};
  o.noOwnCrowd = !/Math\.max\(0, S\.pop - 60\)/.test(showMoraleTooltip.toString());
  o.noOwnRelief = !/Math\.min\(0\.9, 0\.05 \* count\("(tavern|bardsHearth)"\)\)/.test(showMoraleTooltip.toString());
  o.readsBreakdown = /morale\(bd\)/.test(showMoraleTooltip.toString());
  // and the breakdown actually reconciles to the number
  S.buildings = { bardsHearth: 130, shrine: 40 }; S.wtechs = { sunAltar: true }; S.altarTier = 0;   // 30 Taverns x4.348
  S.jobs = {}; S.upgrades = {}; S.policies = {}; S.champs = {}; S.wanderers = [];
  S.pop = 130; S.jackboxes = 8; if (typeof invalidateCensus === "function") invalidateCensus();
  ["mushrooms", "furs", "plumes"].forEach(r => S.res[r] = luxuryComfort());
  const bd = {};
  const m = morale(bd);
  o.reconciles = Math.abs((100 - bd.crowd + bd.lux + bd.shrine + bd.box) - bd.raw) < 1e-9 && Math.round(bd.raw) === m;
  o.terms = { crowd: +bd.crowd.toFixed(2), lux: +bd.lux.toFixed(2), shrine: +bd.shrine.toFixed(2), box: +bd.box.toFixed(2), m };
  // rendering it does not throw
  document.getElementById("tooltip") && showMoraleTooltip(document.body);
  hideTooltip();
  S.buildings = {}; S.pop = 0; S.jackboxes = 0; S.wtechs = {};
  ["mushrooms", "furs", "plumes"].forEach(r => S.res[r] = 0);
  return o;
});
check("the tooltip no longer carries the super-linear crowd term v0.36 deleted", p3.noOwnCrowd);
check("the tooltip no longer uses its own hard-min relief", p3.noOwnRelief);
check("the tooltip renders morale()'s own breakdown", p3.readsBreakdown);
check("the breakdown reconciles exactly to the number shown", p3.reconciles, JSON.stringify(p3.terms));

// ============ Jerry's directive — the two missing luxury sinks ============
const sinks = await page.evaluate(() => {
  const o = {};
  const p = CRAFTS.find(c => c.id === "parchment");
  o.quills = p.cost.plumes;
  o.noxusPlumes = FACTIONS.find(f => f.id === "noxus").cost.plumes;
  o.fursIntact = p.cost.furs;
  o.festivalExists = typeof holdFestival === "function" && typeof festivalCost === "function";
  S.buildings = {}; S.jobs = {}; S.upgrades = {}; S.policies = {}; S.champs = {}; S.wtechs = {}; S.wanderers = [];
  S.pop = 100; S.buildings = { bardsHearth: 174 }; S.techs = { songcraft: true }; S.seenMax.mushrooms = 999;
  if (typeof invalidateCensus === "function") invalidateCensus();
  S.upgrades.harvestRites = true;      // v0.41 §2.5 gates the Festival on this research
  o.unlocked = festivalUnlocked();
  const c = festivalCost();
  o.cost = c;
  o.scalesWithComfort = c.mushrooms === Math.round(4 * luxuryComfort());
  // a festival pays full comfort even with an empty larder, and cannot breach the ceiling
  ["mushrooms", "furs", "plumes"].forEach(r => S.res[r] = 0);
  const starved = morale();
  S.res.mushrooms = c.mushrooms; S.res.provisions = c.provisions; S.res.culture = c.culture;
  holdFestival();
  o.active = festivalActive();
  o.spentMushrooms = c.mushrooms - S.res.mushrooms;
  const bdF = {}; const during = morale(bdF);
  o.festivalLux = +bdF.lux.toFixed(2);
  o.gain = during - starved;
  // ceiling is unchanged by the festival
  S.buildings = { bardsHearth: 1e9, shrine: 1e9 }; S.wtechs = { sunAltar: true }; S.jackboxes = 1e9; S.pop = 5;
  if (typeof invalidateCensus === "function") invalidateCensus();
  o.ceilingDuringFestival = morale();
  // a second festival cannot be stacked
  S.res.mushrooms = 1e9; S.res.provisions = 1e9; S.res.culture = 1e9;
  const before = S.res.mushrooms;
  holdFestival();
  o.noStacking = S.res.mushrooms === before;
  S.festivalUntil = 0; S.festivals = 0; S.buildings = {}; S.jackboxes = 0; S.pop = 0; S.wtechs = {}; S.techs = {};
  ["mushrooms", "furs", "plumes"].forEach(r => S.res[r] = 0);
  return o;
});
// v0.41 §2.4 takes the quills back out — exact Kittens parity — and moves the plume
// sink to the Noxus route, which charges 120 plumes a run.
check("Parchment is back to 175 furs alone; the plume sink moved to the Noxus route",
  sinks.quills === undefined && sinks.fursIntact === 175 &&
  sinks.noxusPlumes === 120, `${sinks.fursIntact} furs, Noxus charges ${sinks.noxusPlumes} plumes`);
check("the Festival exists and unlocks from the Harvest Rites research (v0.41 §2.5)",
  sinks.festivalExists && sinks.unlocked);
check("its Mushroom cost scales with the settlement, like comfort does",
  sinks.scalesWithComfort, JSON.stringify(sinks.cost));
// RE-POINTED v0.58 (three assertions), superseded by JERRY'S DEV NOTE 12. The Festival no
// longer fakes a full larder for ten real minutes; it is a flat +30% on the finished morale
// figure for one game-year, and it now costs Plumes as well as Mushrooms and Provisions. The
// "empty larder" and "175 ceiling" assertions were both statements ABOUT the retired mechanic
// and there is nothing left for them to check; the cost assertion survives, re-pointed to the
// cost the note specifies.
check("v0.58 note 12 — the Festival costs Plumes, Mushrooms and Provisions",
  JSON.stringify(Object.keys(sinks.cost).sort()) === JSON.stringify(["mushrooms", "plumes", "provisions"]),
  JSON.stringify(sinks.cost));
check("festivals cannot be stacked while one is running", sinks.noStacking);

// ============ regressions ============
await reset();
const reg = await page.evaluate(() => {
  const o = {};
  o.ascentPure = !/cost|cooldown|Until/i.test(ascendTargon.toString());
  S.res.devotion = 500; S.worship = 0;
  ascendTargon(); ascendTargon();
  o.ascentBanks = S.worship === 500 && S.res.devotion === 0;
  o.coreFns = ["tick", "computeRates", "computeCaps", "morale", "ascendTargon", "renderAll", "renderTop"]
    .every(f => typeof window[f] === "function");
  o.moraleStillTakesNoArgs = typeof morale() === "number";
  S.buildings = {}; BUILDINGS.forEach(b => S.buildings[b.id] = 3);
  S.techs = {}; TECHS.forEach(t => S.techs[t.id] = true);
  S.upgrades = {}; UPGRADES.forEach(u => S.upgrades[u.id] = true);
  S.wtechs = {}; WTECHS.forEach(w => S.wtechs[w.id] = true);
  S.pop = 130; S.jobs = { farmer: 20, loremaster: 20, miner: 20, woodcutter: 20, acolyte: 20 };
  if (typeof invalidateCensus === "function") invalidateCensus();
  const caps = computeCaps(), rates = computeRates();
  o.noNaNCaps = Object.values(caps).every(v => isFinite(v));
  o.noNaNRates = Object.values(rates).every(v => isFinite(v));
  o.moraleFinite = isFinite(morale());
  o.badCaps = Object.entries(caps).filter(([, v]) => !isFinite(v)).map(([k]) => k).join(",");
  o.badRates = Object.entries(rates).filter(([, v]) => !isFinite(v)).map(([k]) => k).join(",");
  // v0.39 structural fixes must survive
  o.craftedUncapped = ["beam", "scaffold", "stoneSlab", "hexSlab", "plating"].every(r => caps[r] === undefined);
  o.rawStillCapped = ["zaunore", "coalgas", "hexore"].every(r => caps[r] !== undefined);
  return o;
});
check("regression: Ascent is still free, cooldownless and bonusless", reg.ascentPure && reg.ascentBanks);
check("regression: core function names unchanged", reg.coreFns);
check("regression: morale() still returns a plain number with no argument", reg.moraleStillTakesNoArgs);
check("regression: no NaN caps with everything owned", reg.noNaNCaps, reg.badCaps);
check("regression: no NaN rates with everything owned", reg.noNaNRates, reg.badRates);
check("regression: morale finite at 130 wanderers", reg.moraleFinite);
check("regression: v0.39's crafted-uncapped fix survives", reg.craftedUncapped && reg.rawStillCapped);

await reset();
const rt = await page.evaluate(() => {
  S.festivalUntil = 12345; S.festivals = 3; S.res.poroTears = 4;
  loadFromString(btoa(unescape(encodeURIComponent(JSON.stringify(S)))));
  return S.festivals === 3 && S.res.poroTears === 4;
});
check("regression: saves round-trip the festival counter", rt);

await reset();
for (const tab of ["settlement", "crafting", "village", "lore", "wilds", "trade", "targon", "champions"]) {
  await page.evaluate(t => {
    S.techs = {}; TECHS.forEach(x => S.techs[x.id] = true);
    S.upgrades = {}; UPGRADES.forEach(u => S.upgrades[u.id] = true);
    S.wtechs = {}; WTECHS.forEach(w => S.wtechs[w.id] = true);
    S.buildings = {}; BUILDINGS.forEach(b => S.buildings[b.id] = 2);
    S.pop = 20; syncRoster(); S.worship = 5000;
    for (const r in RES) S.seenMax[r] = 999;
    S.buildings.archive = Math.max(1, S.buildings.archive || 0); S.buildings.shelter = Math.max(1, S.buildings.shelter || 0); S.upgrades.keepingTheRolls = true; S.activeTab = t; uiDirty = true; renderAll();
  }, tab);
  await page.waitForTimeout(40);
}
check("all 8 tabs render with the full build, no console errors", errors.length === 0, errors.slice(0, 3).join(" | "));

console.log(`\n${pass} passed, ${fail} failed`);
await browser.close();
process.exit(fail ? 1 : 0);
