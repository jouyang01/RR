import { chromium } from "playwright";
import { suiteEnd } from "./_suite-end.mjs";
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

// ==================== §2.1 — Tomes out of the Knowledge cap ====================
await reset();
const s21 = await page.evaluate(() => {
  const o = {};
  o.lineGone = !/caps\.knowledge \+= 150 \* Math\.floor/.test(computeCaps.toString());
  S.buildings = { archive: 4 }; S.techs = {}; S.upgrades = {}; S.policies = {}; S.champs = {}; S.wtechs = {}; S.pop = 0;
  S.res.tome = 0; const noTomes = computeCaps().knowledge;
  S.res.tome = 100000; const manyTomes = computeCaps().knowledge;
  o.tomesDoNothing = Math.abs(manyTomes - noTomes) < 1e-9;
  S.res.tome = 0;
  // Tomes keep every other job
  o.tomeJobs = [
    UPGRADES.find(u => u.id === "crossReferencing").cost.tome,
    UPGRADES.find(u => u.id === "annotatedIndex").cost.tome,
    UPGRADES.find(u => u.id === "livingLibrary").cost.tome,
    BUILDINGS.find(b => b.id === "watchersEye").cost.tome
  ];
  o.trainUsesTomes = /c\.tome = lvl \+ 1/.test(trainCost.toString());
  o.tomeDesc = CRAFTS.find(c => c.id === "tome").desc;
  // Observatory reopens
  const obs = BUILDINGS.find(b => b.id === "observatory");
  o.obsUnlockGone = !obs.unlock;
  o.obsCost = obs.cost;
  o.obsRatio = obs.ratio;
  o.obsBoost = obs.boost.knowledge;
  // Great Index moves
  o.ladder = ["cataloguing", "crossReferencing", "greatIndex", "annotatedIndex", "livingLibrary"]
    .map(id => UPGRADES.find(u => u.id === id).tech);
  // and the pre-Sparks multiplier the spec's whole argument rests on
  // v0.44 Part 2.5.2: the line left the KNOWLEDGE cap, so the property is measured on
  // culture instead. The property itself — three tiers available before Sparks — stands.
  S.upgrades = { cataloguing: 1, crossReferencing: 1, greatIndex: 1 };
  S.buildings = { archive: 1, bardsHearth: 5 }; S.res.tome = 0;
  const withThree = computeCaps().culture;
  S.upgrades = {};
  o.preSparksMult = +(withThree / computeCaps().culture).toFixed(3);
  S.buildings = {}; S.upgrades = {};
  return o;
});
check("the Tome knowledge-cap line is deleted", s21.lineGone);
check("a hundred thousand Tomes now raise the cap by exactly nothing", s21.tomesDoNothing);
check("Tomes keep every other job they had", JSON.stringify(s21.tomeJobs) === JSON.stringify([5, 40, 120, 1]) && s21.trainUsesTomes, JSON.stringify(s21.tomeJobs));
// RE-POINTED v0.58, superseded by JERRY'S DEV NOTE 8 ("descriptions should not include the
// changes we've made... it should just have flavor text"). The Tome desc named a mechanic the
// player never saw, in a sentence written for someone who remembered v0.40. The invariant that
// survives is the one that matters: the desc must not RE-ADVERTISE the deleted cap line.
check("the Tome tooltip no longer advertises the deleted knowledge-cap line (v0.58 note 8: flavour only)",
  !/\+150 knowledge cap/.test(s21.tomeDesc) && !/knowledge cap/i.test(s21.tomeDesc), s21.tomeDesc);
check("the Observatory's Sparks gate is withdrawn", s21.obsUnlockGone);
// SUPERSEDED v0.46 Part 1. The v0.41 concern was that scaffold is Sparks-gated; it is
// not — Scaffold is unlocked by slabCutting at Mining, well before the Observatory's own
// Rites of Targon. Kittens' observatory asks for fifty scaffold and RR now does too.
// RE-POINTED v0.58.1 — notes 39 and 46. Scaffold survives; the numbers moved.
check("the Observatory costs Scaffold, exactly as Kittens' observatory does (35 after note 46)",
  s21.obsCost.steel === 150 && s21.obsCost.ore === undefined && s21.obsCost.knowledge === 1000 &&
  s21.obsCost.stoneSlab === 35 && s21.obsCost.scaffold === 35 && s21.obsCost.beam === undefined,
  JSON.stringify(s21.obsCost));
check("its effect and ratio are untouched", s21.obsBoost === 0.25 && Math.abs(s21.obsRatio - 1.10) < 1e-9);
check("The Great Index moves to Call to Arms, and the ladder stays monotonic (v0.54 d5: I joins II at Rites of Targon, ordered by req)",
  JSON.stringify(s21.ladder) === JSON.stringify(["ritesOfTargon", "ritesOfTargon", "callToArms", "chemtech", "deepWorks"]),
  JSON.stringify(s21.ladder));
// v0.42 Part 2b supersedes the magnitude: the Scholarship line drops from x22.4 to
// x3.99 because Kittens has NO multiplicative science-cap line at all, and x22.4 meant
// the Archives, Academies and Observatories barely mattered next to five upgrades.
// The PROPERTY v0.41 was guarding — that the Great Index lands before Sparks so the
// pre-Sparks multiplier is the full early-line product — is unchanged.
// RE-POINTED v0.58, superseded by SPEC PART 3. The three early rungs no longer multiply; they
// sum. The PROPERTY this assertion has always guarded — that all three land before Sparks, so
// the pre-Sparks figure is the full early-line total — is untouched, and only the arithmetic
// that combines them has changed.
// RE-POINTED v0.58.1, superseded by NOTE 15 / STANDING-RULINGS §29: CULTURE LEAVES THE
// SCHOLARSHIP LINE ENTIRELY. Kittens' fixed-multiplier culture ceiling is ×1.05 and RR's was
// ×6.43; the structural half of closing that gap is that culture takes no whole-cap multiplier
// at all, so the Scholarship line reaches renown alone. The line is still additive (§23a) and
// still delivers ×2.60 — to renown — and that is asserted in test-v58.
check("all three pre-Sparks Scholarship tiers are still available before Sparks; culture no longer takes them",
  Math.abs(s21.preSparksMult - 1) < 0.01, `culture ×${s21.preSparksMult} — the line reaches renown alone`);
const prices41 = await page.evaluate(() => {
  const t = id => TECHS.find(x => x.id === id).cost.knowledge;
  return { sparks: t("sparks"), chemtech: t("chemtech"), hexcore: t("hexcore"), deepWorks: t("deepWorks"), icathia: t("icathia") };
});
// superseded by v0.44 Part 2.5 — see test-v44
// SUPERSEDED v0.46 Part 5 — ladder trimmed 45 -> 38 and re-skewed to Kittens' shape.
// SUPERSEDED v0.47 Part 1 — the ladder is Kittens' ladder rank for rank now.
check("Era-3 tech prices sit on the v0.47 Kittens-parity ladder",
  prices41.sparks === 20000 && prices41.chemtech === 55000 && prices41.hexcore === 75000 &&
  prices41.deepWorks === 100000 && prices41.icathia === 135000, JSON.stringify(prices41));

// ==================== §2.4 / §2.2 / §2.5 ====================
const small = await page.evaluate(() => ({
  parchment: CRAFTS.find(c => c.id === "parchment").cost,
  // v0.52 Part 2.3: the Tavern is DELETED and its relief moved onto the Bard's Hearth,
  // which is what Kittens' Amphitheatre always was (js/buildings.js:1801-1830, one
  // building carrying both culturePerTickBase and unhappinessRatio).
  tavernGone: BUILDINGS.every(b => b.id !== "tavern"),
  hearth: BUILDINGS.find(b => b.id === "bardsHearth"),
  harvestRites: UPGRADES.find(u => u.id === "harvestRites"),
  festivalSrc: festivalUnlocked.toString()
}));
check("Parchment is back to exact Kittens parity — 175 furs, no quills",
  small.parchment.furs === 175 && small.parchment.plumes === undefined, JSON.stringify(small.parchment));
// SUPERSEDED v0.52 Part 2.3. The 400/800/200 base and the 1.15 ratio belonged to a
// building that no longer exists. What survives is the ROLE, and the invariant that
// replaces the price table is that exactly one building carries it.
check("the Tavern is deleted, and the Bard's Hearth carries the relief instead",
  small.tavernGone && small.hearth.crowdRelief === 0.0115 && small.hearth.ratio === 1.10,
  `gone ${small.tavernGone}, hearth ${small.hearth.crowdRelief}@${small.hearth.ratio}`);
// RE-POINTED v0.59.1, superseded by NOTE 8 (Jerry): "Masquerade should unlock Harvest Rites
// discovery, songcraft should not." Songcraft is the tech that makes CULTURE A RESOURCE, so
// gating the festival on it put the game's first culture SINK on the same rung that opens the
// faucet — a player reached Harvest Rites with a 300-culture price and no culture. Masquerade
// (1,500 knowledge, off `trade`) is the festival-and-strangers tech. THE COST IS UNTOUCHED, and
// that half of this assertion is the half worth keeping: only the gate moved.
check("Harvest Rites exists in the Masquerade line with the SAME cost (v0.59.1 note 8)",
  small.harvestRites && small.harvestRites.tech === "masquerade" && small.harvestRites.cost.mushrooms === 400 &&
  small.harvestRites.cost.culture === 300 && small.harvestRites.cost.parchment === 10,
  JSON.stringify(small.harvestRites && small.harvestRites.cost));
check("the Festival now unlocks from that research, not a tech-plus-sighting check",
  /S\.upgrades\.harvestRites/.test(small.festivalSrc) && !/seenMax\.mushrooms/.test(small.festivalSrc));

// ==================== §2.6 — the three trade invariants ====================
const inv = await page.evaluate(() => {
  const o = {};
  // 1. no faction yields what it charges
  o.v1 = FACTIONS.filter(f => {
    const y = (f.primaryYield || []).concat(f.slots.map(s => s.res));
    return Object.keys(f.cost).some(c => y.indexOf(c) !== -1);
  }).map(f => f.id);
  // 2. all fifteen slot materials distinct
  const all = FACTIONS.reduce((a, f) => a.concat(f.slots.map(s => s.res)), []);
  o.slotCount = all.length;
  o.distinct = new Set(all).size;
  o.dupes = all.filter((x, i) => all.indexOf(x) !== i);
  // 3. every slot material is reachable by a craft, or names its own gate
  o.unreachable = FACTIONS.reduce((a, f) => a.concat(f.slots.filter(s =>
    !s.gate && !CRAFTS.some(c => c.out === s.res)).map(s => f.id + ":" + s.res)), []);
  // one craft family per faction
  o.families = FACTIONS.map(f => f.family);
  o.routes = FACTIONS.map(f => ({ id: f.id, cost: f.cost, slots: f.slots.map(s => s.res) }));
  return o;
});
check("INVARIANT 1 — no faction's yield includes the resource it charges", inv.v1.length === 0, inv.v1.join(","));
check("INVARIANT 2 — all fifteen slot materials are distinct",
  inv.slotCount === 15 && inv.distinct === 15, `${inv.distinct}/${inv.slotCount} distinct, dupes: ${inv.dupes.join(",")}`);
check("INVARIANT 3 — every slot material is craftable or carries its own gate",
  inv.unreachable.length === 0, inv.unreachable.join(","));
check("each civilisation deepens exactly one named craft family",
  new Set(inv.families).size === 5, inv.families.join(", "));

// ---- the availability gate actually bites ----
await reset();
const gateT = await page.evaluate(() => {
  S.caravans = { noxus: 15 }; S.techs = { logistics: 1, trade: 1, smelting: 1, sparks: 1 };
  for (const r in RES) S.seenMax[r] = 99999;
  const before = [0, 1, 2].map(i => slotUnlocked("noxus", i));
  S.techs.chemtech = 1;
  const after = [0, 1, 2].map(i => slotUnlocked("noxus", i));
  // and a dormant slot pays out nothing
  S.techs = { logistics: 1, trade: 1, smelting: 1, sparks: 1 };
  S.res.alloy = 0; S.res.plumes = 1e6; S.res.vigor = 1e6;
  const rnd = Math.random; Math.random = () => 0;            // force every roll to hit
  for (var k = 0; k < 40; k++) { S.tradeFatigue = {}; tradeCaravan("noxus"); }
  Math.random = rnd;
  const alloyPaid = S.res.alloy;
  S.caravans = {}; S.techs = {}; S.res.alloy = 0; S.res.plumes = 0; S.res.vigor = 0; S.tradeFatigue = {};
  return { before, after, alloyPaid };
});
check("15 Noxus caravans before Chemtech open only two of three slots",
  JSON.stringify(gateT.before) === JSON.stringify([true, true, false]), JSON.stringify(gateT.before));
check("...and all three the moment Chemtech lands",
  JSON.stringify(gateT.after) === JSON.stringify([true, true, true]), JSON.stringify(gateT.after));
check("a dormant slot pays out nothing even on a guaranteed roll", gateT.alloyPaid === 0, `${gateT.alloyPaid} alloy`);

// ---- the chance ladder ----
const ladderT = await page.evaluate(() => {
  const at = n => { S.caravans = { demacia: n }; return [0, 1, 2].map(i => +(slotChance("demacia", i) * 100).toFixed(1)); };
  const r = { c5: at(5), c10: at(10), c15: at(15), c25: at(25), asym: at(1e7) };
  const amt = n => { S.caravans = { demacia: n }; return slotAmount("demacia", 0, 5); };
  r.amt5 = amt(5); r.amt25 = amt(25);
  S.caravans = {};
  return r;
});
check("slot chances descend by tier and converge on 40 / 23 / 14%",
  JSON.stringify(ladderT.asym) === JSON.stringify([40, 23, 14]), JSON.stringify(ladderT.asym));
check("the ladder matches the spec's published table at 5 / 10 / 15 caravans",
  ladderT.c5[0] === 5 && ladderT.c10[0] === 20 && ladderT.c10[1] === 3 &&
  ladderT.c15[0] === 33.9 && ladderT.c15[1] === 18 && ladderT.c15[2] === 2,
  `5:${ladderT.c5} 10:${ladderT.c10} 15:${ladderT.c15}`);
check("slot amounts grow past their own threshold", ladderT.amt5 === 5 && ladderT.amt25 === 10, `${ladderT.amt5} → ${ladderT.amt25}`);

// ---- caravans as a pure culture sink ----
const carT = await page.evaluate(() => {
  S.caravans = {};
  const c0 = caravanCost("demacia");
  S.caravans = { demacia: 14 };
  const c14 = caravanCost("demacia");
  let cum = 0; for (let n = 0; n < 15; n++) cum += Math.round(150 * Math.pow(1.15, n));
  S.caravans = {};
  const y = n => { S.caravans = { demacia: n }; return +caravanYieldMult("demacia").toFixed(4); };
  const r = { c0, c14, cum, y0: y(0), y15: y(15), y30: y(30), yInf: y(1e7) };
  S.caravans = {};
  return r;
});
check("a caravan costs culture and nothing else",
  Object.keys(carT.c0).length === 1 && carT.c0.culture === 150, JSON.stringify(carT.c0));
check("the ratio is Kittens' 1.15", carT.c14.culture === Math.round(150 * Math.pow(1.15, 14)), String(carT.c14.culture));
check("fifteen caravans cost about 7,137 culture per faction", Math.abs(carT.cum - 7137) <= 2, String(carT.cum));
check("each caravan raises that route's yield +2%, bounded at +60%",
  carT.y0 === 1 && Math.abs(carT.y15 - 1.30) < 0.02 && Math.abs(carT.y30 - 1.52) < 0.02 && carT.yInf <= 1.6,
  `15→×${carT.y15}, 30→×${carT.y30}, ∞→×${carT.yInf}`);

// ---- the loop gain, computed from the LIVE tables, never hardcoded ----
const loop = await page.evaluate(() => {
  const avgFrom = fn => {
    const m = fn.toString().match(/\((\d+)\s*\+\s*Math\.floor\(Math\.random\(\)\s*\*\s*(\d+)\)\)/);
    return m ? (+m[1] + (+m[1] + (+m[2] - 1))) / 2 : null;
  };
  const dem = FACTIONS.find(f => f.id === "demacia"), pil = FACTIONS.find(f => f.id === "piltover");
  // every multiplier term at its ceiling
  S.buildings = { tradeDock: 1e7, workshop: 1e7 };
  S.caravans = { demacia: 1e7, piltover: 1e7 };
  S.upgrades = { riverstoneTools: true }; S.policies = {}; S.wanderers = []; S.champs = {};
  POLICY_GROUPS.forEach(g => g.options.forEach(o => { if (/trade/i.test(o.id)) S.policies[g.id] = o.id; }));
  CHAMPS.forEach(d => { S.champs[d.id] = { r: true, lvl: 10 }; });
  S.leader = "twitch";
  const maxM = tradeYieldMult("demacia");
  const G = (avgFrom(dem.run) / dem.cost.timber) * (avgFrom(pil.run) / pil.cost.steel) *
            (transmuteYield() / TRANSMUTE_COST) * maxM * maxM;
  const o = { maxM: +maxM.toFixed(3), G: +G.toFixed(3),
              steel: avgFrom(dem.run), mana: avgFrom(pil.run),
              timberCost: dem.cost.timber, steelCost: pil.cost.steel,
              timberPerMana: +(transmuteYield() / TRANSMUTE_COST).toFixed(4),
              transmuteFlat: !/craftYield\(\)/.test(transmuteYield.toString()) };
  S.buildings = {}; S.caravans = {}; S.upgrades = {}; S.policies = {}; S.champs = {}; S.leader = null;
  return o;
});
// RE-POINTED v0.58.1, superseded by NOTE 17. Transmute is a craft and now takes craft
// effectiveness — at a QUARTER weight, because this circuit is exactly why it was flat. The
// guard this assertion protects is the NEXT one (G < 0.8) and that guard is intact; three
// numbers moved to keep it so. What is asserted here is the BOUND, not the absence.
check("transmutation takes craft effectiveness at a bounded weight (v0.58.1 note 17)",
  await page.evaluate(() => /TRANSMUTE_CRAFT_WEIGHT = 0\.20;/.test(document.documentElement.innerHTML) &&
    /craftYield\("transmute"\) - 1\) \* TRANSMUTE_CRAFT_WEIGHT/.test(transmuteYield.toString())));
check("the Demacia → Piltover → transmute circuit LOSES timber at the maximum trade stack",
  loop.G < 0.8, `G = ${loop.G} at max M = ${loop.maxM}`);
// RE-POINTED v0.58.1, superseded by NOTE 34. Piltover's mana rises 500-700 -> 900-1,300 and its
// steel price rises 80 -> 145 by the same ×1.81, so a trade delivers more mana as the note asks
// while mana-per-steel — the term this circuit multiplies — is held flat. Demacia is untouched.
check("v0.58.1 note 34: 600 timber → 28–38 steel; Piltover charges 145 steel for 900–1,300 mana",
  loop.timberCost === 600 && loop.steel === 33 && loop.steelCost === 145 && loop.mana === 1100,
  JSON.stringify(loop));

// ---- routes, gating and the seasonal conversion ----
const routes = await page.evaluate(() => {
  const o = {};
  o.starter = STARTER_FACTION;
  o.findOrder = FACTION_FIND_ORDER.map(e => e.id);
  loadFromString(btoa(unescape(encodeURIComponent(JSON.stringify(freshState())))));
  o.demaciaFoundAtStart = factionFound("demacia");
  o.piltoverNotFoundAtStart = !factionFound("piltover");
  // Bilgewater needs Chemtech AND a berth
  S.factionsFound.bilgewater = true; S.techs = { chemtech: 1 }; S.buildings = {};
  o.bilgeClosedNoDock = !tradeOpen("bilgewater");
  S.buildings = { tradeDock: 1 };
  o.bilgeOpenWithDock = tradeOpen("bilgewater");
  S.techs = {};
  o.bilgeClosedNoTech = !tradeOpen("bilgewater");
  // ...and its haul scales with the berth count, Zebra-style
  S.techs = { chemtech: 1 }; S.caravans = {}; S.policies = {}; S.champs = {}; S.wanderers = [];
  const haul = docks => { S.buildings = { tradeDock: docks, hexcreteBastion: 200 }; S.res.zaunore = 0;
    FACTIONS.find(f => f.id === "bilgewater").run(1); return Math.round(S.res.zaunore); };
  o.haul1 = haul(1); o.haul10 = haul(10);
  // Freljord's Deepwinter conversion
  S.buildings = {};
  const seasonRun = seasonId => {
    const real = currentSeason;
    currentSeason = function () { return { id: seasonId, farmMult: 1 }; };
    S.res.timber = 0; S.res.provisions = 0;
    FACTIONS.find(f => f.id === "freljord").run(1);
    currentSeason = real;
    return { timber: Math.round(S.res.timber), provisions: Math.round(S.res.provisions) };
  };
  o.winter = seasonRun("deepwinter");
  o.spring = seasonRun("firstlight");
  S.buildings = {}; S.res.timber = 0; S.res.provisions = 0; S.res.zaunore = 0; S.techs = {};
  return o;
});
check("Demacia is the starter route and is found on turn one",
  routes.starter === "demacia" && routes.demaciaFoundAtStart);
check("Piltover is no longer free — it is scouted like the rest",
  routes.piltoverNotFoundAtStart && routes.findOrder.indexOf("piltover") !== -1);
check("Bilgewater sits at the end of the find order behind Chemtech and a Trade Dock",
  routes.findOrder[routes.findOrder.length - 1] === "bilgewater" &&
  routes.bilgeClosedNoDock && routes.bilgeOpenWithDock && routes.bilgeClosedNoTech);
check("Bilgewater's haul scales with Trade Docks, the way Zebra titanium scales with Ships",
  routes.haul10 > routes.haul1 * 3, `1 dock ${routes.haul1} → 10 docks ${routes.haul10} zaun ore`);
check("Freljord returns provisions in Deepwinter and none in any other season",
  routes.winter.provisions > 0 && routes.winter.timber > 0 && routes.spring.provisions === 0 && routes.spring.timber > 0,
  `winter ${JSON.stringify(routes.winter)} / spring ${JSON.stringify(routes.spring)}`);

// ---- mana becomes the fuel of Era 3 ----
const mana = await page.evaluate(() => {
  const conv = id => BUILDINGS.find(b => b.id === id).convert.input.mana;
  const o = { sump: conv("sumpMine"), vent: conv("coalgasVent"), quarry: conv("hexQuarry"),
              hexcoreMana: CRAFTS.find(c => c.id === "hexcore").cost.mana };
  // an Era-3 settlement running its converters on Arcanists alone must be mana-negative
  // converters only draw when their OTHER inputs are stocked and they are switched on
  S.buildingsOff = {};
  ["ore", "timber", "steel", "gold", "mana", "coalgas"].forEach(r => S.res[r] = 1e9);
  const rateAt = n => { S.buildings = { sumpMine: n, coalgasVent: n, hexQuarry: n, refinery: Math.round(n / 3) };
    return computeRates().mana; };
  S.buildings = {};
  S.techs = {}; TECHS.forEach(t => S.techs[t.id] = true);
  S.upgrades = {}; S.policies = {}; S.champs = {}; S.wtechs = {}; S.drakes = {};
  S.pop = 130; S.jobs = { arcanist: 40 }; S.wanderers = [];
  if (typeof invalidateCensus === "function") invalidateCensus();
  o.rate30 = +rateAt(30).toFixed(2);
  o.rate60 = +rateAt(60).toFixed(2);
  let be = 0; for (let n = 5; n <= 300; n += 5) { if (rateAt(n) < 0) { be = n; break; } }
  o.breakEvenConverters = be;
  S.buildings = {}; S.jobs = {}; S.pop = 0; S.techs = {};
  return o;
});
check("the Era-3 autoprod line now drinks mana", mana.sump === 0.5 && mana.vent === 0.3 && mana.quarry === 0.6,
  `sump ${mana.sump} · vent ${mana.vent} · quarry ${mana.quarry}`);
check("the Hextech capstone costs power", mana.hexcoreMana === 400);
// The spec's own Era-3 picture is ~75 Hexcore Labs and a full autoprod line, so the
// honest form of "arcanists alone cannot fuel it" is: the break-even converter count
// must sit well inside a real Era-3 build.
check("an Era-3 settlement cannot fuel its converters on Arcanists alone",
  mana.breakEvenConverters > 0 && mana.breakEvenConverters <= 60 && mana.rate60 < 0,
  `40 arcanists, no wells: ${mana.rate30}/s at 30 converters each, ${mana.rate60}/s at 60 — turns negative at ${mana.breakEvenConverters}`);

// ---- the masonry chain gets its monolith tier ----
const pb = await page.evaluate(() => {
  const c = CRAFTS.find(x => x.id === "petriciteBlock");
  return { cost: c && c.cost, showsAtPetricite: c && c.show({ techs: { petricite: true }, upgrades: {}, seenMax: {} }),
           hidden: c && !c.show({ techs: {}, upgrades: {}, seenMax: {} }),
           // v0.49 Part 1.7: the monument merged INTO the Quarry, which carries the block cost now.
           monument: BUILDINGS.find(b => b.id === "quarry").cost,
           inDemaciaSlot: FACTIONS.find(f => f.id === "demacia").slots.some(s => s.res === "petriciteBlock") };
});
// SUPERSEDED v0.47 Part 1.4(c): hexSlab 10 removed from the recipe. It is a Hexcore
// material (75,000) on a craft gated at Petricite Masonry (9,500), so the Petricite
// Monument was unbuildable for the whole middle of the game. The cost-graph walk found it.
check("Petricite Block is craftable from Petricite Masonry, with no Hexcore input",
  pb.cost && pb.cost.stoneSlab === 40 && pb.cost.hexSlab === undefined && pb.cost.crystals === 15 && pb.showsAtPetricite && pb.hidden,
  JSON.stringify(pb.cost));
check("...and is consumed by something other than the Demacia route",
  pb.monument.petriciteBlock === 2 && pb.inDemaciaSlot, JSON.stringify(pb.monument));

// ==================== §2.3 — the Abyss journey ====================
const abyss = await page.evaluate(() => {
  const e = EXPEDITIONS.find(x => x.id === "abyssJourney");
  return { cooldownGone: e.cooldown === undefined, cost: e.cost,
           isCharge: isChargeCamp(e), regen: CHARGE_REGEN_S.abyssJourney,
           maxCharges: CAMP_MAX_CHARGES };
});
check("the Abyss journey loses its 300 s cooldown", abyss.cooldownGone);
check("...and joins the charge layer at 200 s, between Raptors and Krugs",
  abyss.isCharge && abyss.regen === 200 && abyss.maxCharges === 2);
check("its vigor cost is unchanged at 120", abyss.cost.vigor === 120);

// ==================== Jerry's directive — the Freljord line ====================
await reset();
const frel = await page.evaluate(() => {
  const o = {};
  const line = ["frostguardCairn", "avarosanHold", "iceWroughtSpire", "frozenWatcher"];
  o.all = line.map(id => {
    const b = BUILDINGS.find(x => x.id === id);
    return b && { id, group: b.group, cost: b.cost, ratio: b.ratio, poroRatio: b.poroRatio, globalBoost: b.globalBoost, prod: b.prod };
  });
  o.exists = o.all.every(Boolean);
  // BEFORE this line, True Ice and Poro Tears had zero consumers anywhere
  const consumers = res => {
    const b = BUILDINGS.filter(x => x.cost[res]).map(x => x.id);
    const c = CRAFTS.filter(x => x.cost[res]).map(x => x.id);
    const u = UPGRADES.filter(x => x.cost[res]).map(x => x.id);
    return b.concat(c).concat(u);
  };
  o.trueiceSinks = consumers("trueice");
  o.tearSinks = consumers("poroTears");
  // the ladder is a chain — each tier needs the one below
  S.buildings = {}; S.techs = { deepWorks: true, icathia: true };
  o.gated = line.map(id => { const b = BUILDINGS.find(x => x.id === id); return !!(b.unlock && !b.unlock(S)); });
  // poroRatio is additive per copy, Kittens Law 2, and drives Poro Pasture output
  S.jobs = {}; S.upgrades = {}; S.policies = {}; S.champs = {}; S.wtechs = {}; S.drakes = {}; S.pop = 0; S.wanderers = [];
  S.buildings = { poroPasture: 10 };
  const bare = computeRates().poros;
  S.buildings = { poroPasture: 10, frostguardCairn: 1 };
  const one = computeRates().poros;
  S.buildings = { poroPasture: 10, frostguardCairn: 2 };
  const two = computeRates().poros;
  o.ratioAdditive = Math.abs((one / bare - 1) - 0.08) < 1e-6 && Math.abs((two / bare - 1) - 0.16) < 1e-6;
  o.oneCairnPct = +((one / bare - 1) * 100).toFixed(2);
  S.buildings = {}; S.techs = {};
  return o;
});
check("the four-tier Freljord monument line exists", frel.exists, JSON.stringify(frel.all && frel.all.map(x => x && x.id)));
check("True Ice finally has consumers — it had exactly zero before this",
  frel.trueiceSinks.length >= 4, frel.trueiceSinks.join(","));
check("Poro Tears finally have consumers — they had exactly zero before this",
  frel.tearSinks.length >= 4, frel.tearSinks.join(","));
check("the line is a chain: each tier needs the one below it built",
  JSON.stringify(frel.gated) === JSON.stringify([true, true, true, true]), JSON.stringify(frel.gated));
check("it lives in its own Freljord group, not under Piltover & Zaun",
  frel.all.every(b => b.group === "Freljord"));
check("poro ratio is additive per copy (Kittens Law 2), never compounding",
  frel.ratioAdditive, `one cairn = +${frel.oneCairnPct}%`);
// v0.49 Part 1.7 strips globalBoost from The Frozen Watcher — Kittens' global-production
// category has exactly two members and this was the fifth. The spec's pass condition is
// that it keeps every OTHER effect it had, which is what this asserts now. The ratio stays
// 1.25 deliberately; see the note on CAP_MULTIPLIERS in test-v34.
check("the capstone keeps every non-globalBoost effect it had, and carries no global multiplier",
  frel.all[3].globalBoost === undefined && frel.all[3].ratio === 1.25 &&
  frel.all[3].poroRatio === 0.60 && frel.all[3].prod.trueice === 0.004,
  JSON.stringify({ gb: frel.all[3].globalBoost, poro: frel.all[3].poroRatio, prod: frel.all[3].prod }));

// ==================== the crystal faucet the trade revamp removed ====================
const cry = await page.evaluate(() => {
  const src = EXPEDITIONS.find(e => e.id === "krugs").run.toString();
  const o = { krugsPays: /gain\("crystals"/.test(src) };
  // no faction yields crystals any more — so a non-trade source has to exist
  o.factionCrystals = FACTIONS.filter(f => (f.primaryYield || []).indexOf("crystals") !== -1 ||
    f.slots.some(s => s.res === "crystals")).map(f => f.id);
  o.crystalPriced = []
    .concat(TECHS.filter(t => t.cost.crystals).map(t => "tech:" + t.id))
    .concat(BUILDINGS.filter(b => b.cost.crystals).map(b => "bld:" + b.id))
    .concat(UPGRADES.filter(u => u.cost.crystals).map(u => "upg:" + u.id))
    .concat(CRAFTS.filter(c => c.cost.crystals).map(c => "craft:" + c.id));
  // and it actually pays
  S.buildings = {}; S.jobs = {}; S.upgrades = {}; S.policies = {}; S.champs = {}; S.wanderers = [];
  S.techs = { logistics: 1 }; S.res.crystals = 0; S.res.vigor = 1e6; S.pop = 10;
  const rnd = Math.random; Math.random = () => 0;
  runExpedition("krugs");
  Math.random = rnd;
  o.paid = S.res.crystals > 0;
  S.res.crystals = 0; S.res.vigor = 0; S.techs = {}; S.pop = 0;
  return o;
});
check("no faction yields Hextech Crystals any more (the revamp removed every one)",
  cry.factionCrystals.length === 0, cry.factionCrystals.join(","));
// RE-POINTED v0.58, superseded by JERRY'S DEV NOTE 5.1 ("Krugs should not give hextech
// crystals"). The disjunction this assertion offered — "Krugs carries the faucet, OR the tech
// tree dead-ends" — was answered by v0.41 with Krugs and by v0.58 with the OTHER branch: the
// Hexcrystal Quarry is the faucet, and it is the building that exists to be one. Krugs sit at
// Expedition Logistics, an entire tier below the resource. What is asserted now is that a
// faucet EXISTS and is not the first-tech camp.
const BUILD_HAS_QUARRY = await page.evaluate(() => !!BUILDINGS.find(b => b.id === "hexQuarry" && b.convert && b.convert.output.hexore));
check("...so a crystal faucet exists, and after v0.58 note 5.1 it is NOT the first-tech camp",
  !cry.krugsPays && BUILD_HAS_QUARRY, `${cry.crystalPriced.length} things are crystal-priced`);

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
  const caps = computeCaps(), rates = computeRates();
  o.noNaNCaps = Object.values(caps).every(v => isFinite(v));
  o.noNaNRates = Object.values(rates).every(v => isFinite(v));
  o.badCaps = Object.entries(caps).filter(([, v]) => !isFinite(v)).map(([k]) => k).join(",");
  o.badRates = Object.entries(rates).filter(([, v]) => !isFinite(v)).map(([k]) => k).join(",");
  o.moraleFinite = isFinite(morale());
  o.craftedUncapped = ["beam", "scaffold", "stoneSlab", "hexSlab", "petriciteBlock"].every(r => caps[r] === undefined);
  o.moraleCeiling = (function () {
    S.buildings = { bardsHearth: 1e9, shrine: 1e9 }; S.jackboxes = 1e9; S.pop = 5;
    ["mushrooms", "furs", "plumes"].forEach(r => S.res[r] = 1e9);
    const m = morale();
    S.buildings = {}; S.jackboxes = 0; S.pop = 0;
    ["mushrooms", "furs", "plumes"].forEach(r => S.res[r] = 0);
    return m;
  })();
  return o;
});
check("regression: Ascent is still free, cooldownless and bonusless", reg.ascentPure && reg.ascentBanks);
check("regression: core function names unchanged", reg.coreFns);
check("regression: no NaN caps with everything owned", reg.noNaNCaps, reg.badCaps);
check("regression: no NaN rates with everything owned", reg.noNaNRates, reg.badRates);
// RE-POINTED v0.58.1 — note 32 moves the box ceiling +20 -> +30, so the absolute ceiling is 185.
check("regression: morale finite, and the ceiling survives (185 after v0.58.1 note 32)", reg.moraleFinite && reg.moraleCeiling === 185, String(reg.moraleCeiling));
check("regression: crafted materials still uncapped, including the new Petricite Block", reg.craftedUncapped);

await reset();
const rt = await page.evaluate(() => {
  S.caravans = { demacia: 7 }; S.res.petriciteBlock = 3; S.buildings.frostguardCairn = 2;
  loadFromString(btoa(unescape(encodeURIComponent(JSON.stringify(S)))));
  return S.caravans.demacia === 7 && S.res.petriciteBlock === 3 && S.buildings.frostguardCairn === 2;
});
check("regression: saves round-trip the new caravans, blocks and monuments", rt);

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
check("all 8 tabs render with every route and slot open, no console errors", errors.length === 0, errors.slice(0, 3).join(" | "));

console.log(`\n${pass} passed, ${fail} failed`);
await browser.close();
suiteEnd(import.meta.url, pass, fail);
process.exit(fail ? 1 : 0);
