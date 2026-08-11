// test-v52 — BUILDER SPEC "v0.51" (shipped as v0.52: v0.51 was the pixel banner).
// Every item the spec names, asserted against the SHIPPED build rather than the spec's
// own arithmetic. Where an item retires a prior invariant, the retirement is asserted
// too — a deleted rule that leaves its assertion behind is a rule that still exists.
import { chromium } from "playwright";
import fs from "fs";
import { suiteEnd } from "./_suite-end.mjs";
const FILE = new URL("../index.html", import.meta.url).href;
let pass = 0, fail = 0;
const check = (n, c, x) => { console.log(n + ":", c ? "PASS" : "FAIL", x ?? ""); c ? pass++ : fail++; };
const browser = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium" }).catch(() => chromium.launch());
const page = await browser.newPage();
await page.goto(FILE);
await page.waitForTimeout(500);
const reset = () => page.evaluate(() =>
  loadFromString(btoa(unescape(encodeURIComponent(JSON.stringify(freshState()))))));

// ============================================================================
// PART 0 — the knowledge bound is gone, and the delivered multiplier is Kittens'
// ============================================================================
await reset();
const p0 = await page.evaluate(() => {
  const bare = () => { S.buildings = {}; S.upgrades = {}; S.techs = {}; S.jobs = {}; S.pop = 0;
    S.wanderers = []; S.policies = {}; S.champs = {}; S.wtechs = {}; S.drakes = {};
    S.leader = null; S.worship = 0; S.res.tome = 0; S.res.morellonomicon = 0; };
  // Kittens' own end-of-tree counts: library 30, academy 30, observatory 25, biolab 13.
  // js/buildings.js scienceRatio 0.1 / 0.2 / 0.25 / 0.35 -> Sigma 19.80 -> x20.80.
  const at = counts => {
    bare(); S.buildings = Object.assign({}, counts); S.jobs = { loremaster: 20 }; S.pop = 20;
    const w = computeRates().knowledge;
    S.buildings = {};
    const b = computeRates().knowledge;
    bare();
    return +(w / b).toFixed(4);
  };
  const sigma = counts => {
    let s = 0;
    for (const id in counts) {
      const b = BUILDINGS.find(x => x.id === id);
      if (b && b.boost && b.boost.knowledge) s += b.boost.knowledge * counts[id];
    }
    return +s.toFixed(4);
  };
  const KITTENS = { archive: 30, academy: 30, observatory: 25, hexLab: 13 };
  return {
    limits: BOOST_LIMIT,
    knowledgeAbsent: BOOST_LIMIT.knowledge === undefined,
    kittensSigma: sigma(KITTENS), kittensDelivered: at(KITTENS),
    // linearity: at 10x the copies the delivered surplus must be 10x, exactly
    lo: at({ archive: 5, academy: 5, observatory: 5, hexLab: 5 }),
    hi: at({ archive: 50, academy: 50, observatory: 50, hexLab: 50 }),
    loS: sigma({ archive: 5, academy: 5, observatory: 5, hexLab: 5 }),
    hiS: sigma({ archive: 50, academy: 50, observatory: 50, hexLab: 50 }),
    // the mechanism is unchanged for everything that SHOULD be bounded
    devotion: (() => { bare(); S.techs = { ritesOfTargon: 1 }; S.jobs = { acolyte: 4 }; S.pop = 10;
      S.buildings = { shrine: 100, sanctum: 500 }; const w = computeRates().devotion;
      S.buildings = { shrine: 100 }; const b = computeRates().devotion; bare();
      return +(w / b).toFixed(4); })(),
    // RE-POINTED v0.64 PART 2: read the bound from the table so the assertion above cannot be
    // invalidated by a magnitude change again. The MECHANISM is the item, not the numeral.
    devotionLimit: BOOST_LIMIT.devotion
  };
});
check("PART 0 — `knowledge` is absent from BOOST_LIMIT, and the table is the seven bounded stacks",
  p0.knowledgeAbsent &&
  JSON.stringify(Object.keys(p0.limits).sort()) ===
    JSON.stringify(["crystals", "culture", "devotion", "gold", "mana", "provisions", "vigor"]),
  JSON.stringify(p0.limits));
check("PART 0 — at Kittens' own 30/30/25/13 the delivered multiplier IS Kittens' ×20.80",
  Math.abs(p0.kittensDelivered - 20.80) < 1e-9 && Math.abs(p0.kittensSigma - 19.80) < 1e-9,
  `Σ${p0.kittensSigma} → ×${p0.kittensDelivered} (was a measured ×3.969 at v0.51)`);
check("PART 0 — and it is LINEAR: ×10 the copies is ×10 the surplus, with no knee anywhere",
  Math.abs(((p0.hi - 1) / (p0.lo - 1)) - 10) < 1e-6 &&
  Math.abs((p0.hi - 1) - p0.hiS) < 1e-9 && Math.abs((p0.lo - 1) - p0.loS) < 1e-9,
  `x5 → ×${p0.lo} (Σ${p0.loS}), x50 → ×${p0.hi} (Σ${p0.hiS})`);
// RE-POINTED v0.64 PART 2 (Option B, ruled by Jerry). This Part's subject is that REMOVING
// `knowledge` from `BOOST_LIMIT` did not disturb the mechanism for the families that keep a
// bound — so what it must assert is that devotion STILL ASYMPTOTES, computed from the table.
// The rail goes 2.0 → 5.0 and the asymptote with it; the mechanism is untouched, which is the
// claim. `p0.devotionLimit` is read from `BOOST_LIMIT` so the numeral cannot drift again.
check("PART 0 — the mechanism itself is untouched: devotion still asymptotes at 1 + its own bound",
  p0.devotion > 1 + 0.95 * p0.devotionLimit && p0.devotion < 1 + p0.devotionLimit,
  `×${p0.devotion} against 1 + ${p0.devotionLimit}`);

// ============================================================================
// PART 1 — the levers
// ============================================================================
await reset();
const p1 = await page.evaluate(() => {
  const B = id => BUILDINGS.find(b => b.id === id);
  const r = B("arcaneReactor"), f = B("farmstead"), irr = B("irrigation");
  return {
    reactor: r.cost, reactorRatio: r.ratio, reactorGB: r.globalBoost, reactorTech: r.tech,
    farmstead: { boost: f.boost, prod: f.prod, ratio: f.ratio, seasonal: f.seasonal },
    irr: irr && { tech: irr.tech, cost: irr.cost, ratio: irr.ratio, boost: irr.boost },
    limits: BOOST_LIMIT,
    routes: FACTIONS.map(x => ({ id: x.id, vigor: x.cost.vigor, gold: x.cost.gold })),
    rawViolations: auditRawGraph(), costViolations: auditCostGraph()
  };
});
check("1.1 — the Arcane Reactor takes the second ×10: 400 / 800 / 600, everything else held",
  p1.reactor.hexcore === 400 && p1.reactor.hexcrete === 800 && p1.reactor.focusedHex === 600 &&
  p1.reactorRatio === 1.15 && p1.reactorGB === 0.05 && p1.reactorTech === "greyReclamation",
  JSON.stringify(p1.reactor));
// v0.55 Part 3 RE-POINT (rung): `mining` was correct against the RAW graph — ore arrives
// there — but wrong against Kittens' LADDER. The aqueduct sits at Kittens' 1,500 rung, and
// RR's Channel was three rungs early at 500. It moves to `smelting`, RR's own 1,500 rung and
// the metallurgy rung, which is where an ore-priced building belongs (§16's role clause rules
// out `masquerade`, the other 1,500). Cost, ratio and figure are all unmoved — this is a rung
// correction, not a rebalance. Superseded by: v0.55 Part 3.2.
check("1.2 — the Irrigation Channel is Kittens' aqueduct at Kittens' 1,500 rung: 0.03/1.12/ore 75",
  p1.irr && p1.irr.tech === "smelting" && p1.irr.boost.provisions === 0.03 &&
  p1.irr.ratio === 1.12 && p1.irr.cost.ore === 75, JSON.stringify(p1.irr));
// v0.55 Part 3.3 RE-POINT (value): the Farmstead is still a plain field with no boost — that
// half of v0.52 Part 1.2 stands. What moves is the RATE. Kittens' `field` is
// catnipPerTickBase 0.125 = 0.625/s; RR shipped 0.14/s, which is 2.24x Kittens' rate at RR's
// own tenth-scale. The starter food building was the single largest un-flagged EASIER item in
// the food economy. Part 3.1 rescales provisions x10 and Part 3.3 sets the field to the
// source's own 0.625. Superseded by: v0.55 Parts 3.1 + 3.3.
check("1.2/3.3 — the Farmstead is a plain field, now at Kittens' own 0.625/s",
  p1.farmstead.boost === undefined && p1.farmstead.prod.provisions === 0.625 &&
  p1.farmstead.ratio === 1.12 && p1.farmstead.seasonal === true, JSON.stringify(p1.farmstead));
check("1.2 — ...and putting ore on `mining` keeps auditRawGraph at ZERO",
  p1.rawViolations.length === 0 && p1.costViolations.length === 0,
  p1.rawViolations.join(" | ") || "[]");
// RE-POINTED v0.64 PART 2. The item is that provisions and mana are BOUNDED AT ALL — v0.52
// closed two slots that were unbounded by OMISSION, and that closure is what this asserts.
// Part 2 rails the magnitudes (1.5 → 3.0, 1.0 → 2.0) so the ceilings sit above the reachable
// range rather than taxing every member; the slots are still closed, which is the claim.
check("1.3 — the two slots that were unbounded by OMISSION are still CLOSED (magnitudes: v0.64 Part 2)",
  typeof p1.limits.provisions === "number" && p1.limits.provisions > 0 &&
  typeof p1.limits.mana === "number" && p1.limits.mana > 0, JSON.stringify(p1.limits));
check("1.4 — every trade route is exactly 175 vigor",
  p1.routes.every(r => r.vigor === 175), p1.routes.map(r => `${r.id} ${r.vigor}v`).join(" | "));
check("1.4 — ...and every route's gold is HELD, so only one column moved this round",
  p1.routes.find(r => r.id === "freljord").gold === 30 &&
  p1.routes.find(r => r.id === "piltover").gold === 45 &&
  p1.routes.find(r => r.id === "demacia").gold === 68 &&
  p1.routes.find(r => r.id === "noxus").gold === 68 &&
  p1.routes.find(r => r.id === "bilgewater").gold === 90,
  p1.routes.map(r => `${r.id} ${r.gold}g`).join(" | "));

// ============================================================================
// PART 2 — correctness
// ============================================================================
await reset();
const p2 = await page.evaluate(() => {
  const src = document.documentElement.innerHTML;
  const reliefCarriers = BUILDINGS.filter(b => b.crowdRelief !== undefined).map(b => b.id);
  // 2.1 cultivation's +10% must still DELIVER, out of the deleted resRatio
  const cult = (() => {
    const setup = t => { S.buildings = { farmstead: 10 }; S.upgrades = {}; S.jobs = {}; S.pop = 0;
      S.wanderers = []; S.policies = {}; S.champs = {}; S.wtechs = {}; S.drakes = {};
      S.leader = null; S.worship = 0; S.techs = t ? { cultivation: 1 } : {};
      return computeRates().provisions; };
    const off = setup(false), on = setup(true);
    S.buildings = {}; S.techs = {};
    return off > 0 ? +(on / off).toFixed(9) : null;
  })();
  return {
    resRatioGone: !/var resRatio = \{/.test(src),
    joineryGone: UPGRADES.every(u => u.id !== "timberframeJoinery"),
    longhouseUnlock: BUILDINGS.find(b => b.id === "longhouse").unlock === undefined,
    longhouseTech: BUILDINGS.find(b => b.id === "longhouse").tech,
    tavernGone: BUILDINGS.every(b => b.id !== "tavern"),
    reliefCarriers, hearthRelief: bfield("bardsHearth", "crowdRelief"),
    bloomeryGone: BUILDINGS.every(b => b.id !== "bloomery"),
    refMetGone: TECHS.every(t => t.id !== "refinedMetallurgy"),
    steelAxesTech: UPGRADES.find(u => u.id === "steelAxes").tech,
    orphanU: UPGRADES.filter(u => u.tech && !TECHS.some(t => t.id === u.tech)).map(u => u.id),
    orphanB: BUILDINGS.filter(b => b.tech && !TECHS.some(t => t.id === b.tech)).map(b => b.id),
    orphanReq: UPGRADES.filter(u => u.req && !UPGRADES.some(x => x.id === u.req)).map(u => u.id),
    campLimit: CAMP_YIELD_LIMIT,
    cult,
    techCount: TECHS.filter(t => t.cost.knowledge).length
  };
});
check("2.1 — `resRatio` is deleted outright: table, apply loop and breakdown branch",
  p2.resRatioGone);
check("2.1 — ...and Cultivation still DELIVERS exactly +10% from its new home in `boosts`",
  Math.abs(p2.cult - 1.10) < 1e-9, `×${p2.cult}`);
check("2.2 — Timberframe Joinery is gone and the Longhouse is gated on the Carpentry TECH alone",
  p2.joineryGone && p2.longhouseUnlock && p2.longhouseTech === "carpentry", p2.longhouseTech);
check("2.3 — the Tavern is deleted and EXACTLY ONE building carries crowdRelief",
  p2.tavernGone && p2.reliefCarriers.length === 1 && p2.reliefCarriers[0] === "bardsHearth",
  p2.reliefCarriers.join(", ") || "none");
check("2.3 — ...at 0.0115/copy, SIZED from measured counts rather than the Tavern's 0.05 carried across",
  p2.hearthRelief === 0.0115, String(p2.hearthRelief));
check("2.4 — the Bloomery and Refined Metallurgy are both gone, with no orphans left behind",
  p2.bloomeryGone && p2.refMetGone && p2.orphanU.length === 0 && p2.orphanB.length === 0 &&
  p2.orphanReq.length === 0, JSON.stringify({ u: p2.orphanU, b: p2.orphanB, r: p2.orphanReq }));
check("2.4 — ...and Steel Axes is re-homed on `smelting`, which already carried its prerequisite",
  p2.steelAxesTech === "smelting", p2.steelAxesTech);
// RE-POINTED v0.61, superseded by DEV NOTE 4 (Jerry): The Champions' Regimen (28,000) and
// Deep Cartography (35,000) are MERGED into The Vanguard Doctrine (45,000), which unlocks both
// Standing Orders and Surveyed Approaches. **The ladder goes 36 -> 35 techs.** Both retired ids
// are RESERVED under STANDING-RULINGS §30 until v1.0. The SHAPE conditions this assertion
// actually protects — tie count, median step, geometric step, largest single cliff — are
// unchanged and are what still carries the check.
check("2.4 — ...taking the ladder to 35 techs (36 before v0.61 dev note 4 merged the bridge)",
  p2.techCount === 35, String(p2.techCount));
check("2.5 — CAMP_YIELD_LIMIT is kept at 6 by ruling, not changed", p2.campLimit === 6, String(p2.campLimit));

// the migrations, exercised rather than read
await reset();
const mig = await page.evaluate(() => {
  const data = JSON.parse(decodeURIComponent(escape(atob(serialize()))));
  data.buildings = { tavern: 10, bloomery: 5 };
  data.techs = { refinedMetallurgy: true, mining: true };
  data.res = Object.assign({}, data.res, { timber: 0, ore: 0, provisions: 0, gear: 0, stoneSlab: 0 });
  loadFromString(btoa(unescape(encodeURIComponent(JSON.stringify(data)))));
  const geo = n => (Math.pow(1.15, n) - 1) / 0.15;
  return {
    tavernGone: !S.buildings.tavern, bloomeryGone: !S.buildings.bloomery,
    refMetDropped: !S.techs.refinedMetallurgy,
    timber: S.res.timber, ore: S.res.ore, provisions: S.res.provisions,
    gear: S.res.gear, stoneSlab: S.res.stoneSlab,
    wantTimber: Math.floor(0.5 * 400 * geo(10)),
    wantOre: Math.floor(0.5 * 800 * geo(10)) + Math.floor(0.5 * 900 * geo(5)),
    wantProv: Math.floor(0.5 * 200 * geo(10)),
    wantGear: Math.floor(0.5 * 25 * geo(5)), wantSlab: Math.floor(0.5 * 20 * geo(5))
  };
});
check("2.3/2.4 — an old save's Taverns and Bloomeries are dropped and refunded at 50% of the geometric sum",
  mig.tavernGone && mig.bloomeryGone && mig.refMetDropped &&
  mig.timber === mig.wantTimber && mig.ore === mig.wantOre && mig.provisions === mig.wantProv &&
  mig.gear === mig.wantGear && mig.stoneSlab === mig.wantSlab,
  JSON.stringify({ got: [mig.timber, mig.ore, mig.provisions, mig.gear, mig.stoneSlab],
                   want: [mig.wantTimber, mig.wantOre, mig.wantProv, mig.wantGear, mig.wantSlab] }));
check("2.4 — ...and a dropped `refinedMetallurgy` pays NO knowledge refund, as prior removals did not",
  mig.refMetDropped);

// ============================================================================
// PART 3.2 / PART 5.1
// ============================================================================
await reset();
const p35 = await page.evaluate(() => {
  const B = id => BUILDINGS.find(b => b.id === id);
  const ref = B("shimmerRefinery");
  const roll = UPGRADES.find(u => u.id === "keepingTheRolls");
  const byOut = {}; CRAFTS.forEach(c => byOut[c.out] = c);
  function raw(cost, d) { d = d || 0; const o = {}; if (d > 12) return o;
    for (const k in cost) { const c = byOut[k];
      if (!c) { o[k] = (o[k] || 0) + cost[k]; continue; }
      const sc = cost[k] / (c.amount || 1), sub = raw(c.cost, d + 1);
      for (const j in sub) o[j] = (o[j] || 0) + sub[j] * sc; } return o; }
  // the Census gate: roster detail hidden until researched, job assignment never gated
  S.pop = 10; S.wanderers = []; syncRoster(); S.upgrades = {};
  const lockedCensus = renderCensus();
  S.upgrades = { keepingTheRolls: true };
  const openCensus = renderCensus();
  const villageSrc = renderVillage.toString();
  S.pop = 0; S.upgrades = {};
  return {
    refCost: ref.cost, refRaw: raw(ref.cost), refConvert: ref.convert, refRatio: ref.ratio,
    rollCost: roll.cost, rollTech: roll.tech,
    songcraft: TECHS.find(t => t.id === "songcraft").cost.knowledge,
    // v0.53 Part 5.4 — RE-POINTED, and the old selector is recorded in BUILD REPORT §7.
    // HANDOFF v0.52 §8.5 flagged that `census-row|data-w=` was written without confirming
    // the renderer emits those selectors. Confirmed this round: it does not, and never
    // did. renderCensus() emits `census-trait`, `data-trait=` and `data-census=`. The old
    // negative therefore matched nothing in EITHER state and passed for free — decorative
    // coverage, which is worse than none because it gets cited. The assertion now names
    // selectors the renderer actually emits, and asserts them on BOTH sides so a renderer
    // change that drops them fails loudly instead of silently passing.
    censusLocked: /Keeping the Rolls/.test(lockedCensus) &&
                  !/census-trait|data-census=/.test(lockedCensus),
    censusOpenSelectors: /census-trait/.test(openCensus) && /data-census=/.test(openCensus),
    censusOpen: openCensus.length > lockedCensus.length,
    jobsUngated: !/keepingTheRolls/.test(villageSrc.slice(0, villageSrc.indexOf("renderCensus()")))
  };
});
check("3.2 — the Shimmer Refinery is recost downward: plating 4 + alloy 3, 580 raw zaunore (was 2,900)",
  p35.refCost.plating === 4 && p35.refCost.alloy === 3 &&
  Math.abs(p35.refRaw.zaunore - 580) < 1e-6 && Math.abs(p35.refRaw.coalgas - 90) < 1e-6,
  JSON.stringify(p35.refRaw));
check("3.2 — ...and its conversion and ratio are UNTOUCHED, so only the price moved",
  p35.refConvert.output.shimmer === 0.05 && p35.refConvert.input.coalgas === 0.2 &&
  p35.refConvert.input.mana === 0.5 && p35.refRatio === 1.15, JSON.stringify(p35.refConvert));
// RE-POINTED TWICE, AND THE SECOND RE-POINT RESTORES THE FIRST. v0.63 Part 1's per-rung cap took
// this figure 1,300 → 929; **v0.64 Part 5 RETIRES that cap (Jerry's dev note 4) and the authored
// 1,300 is live again.** The PROPERTY v0.52 shipped — that this is a BRANCH on Songcraft's own
// rung rather than a rung above it — held under both regimes and is still what is asserted; the
// literal is restored because the authored figure is the one the file now carries. **The lesson
// v0.63 drew from pinning a literal stands: the inequality is the item, the numeral is not.**
check("5.1 — Keeping the Rolls is a BRANCH on Songcraft's own rung (v0.64 Part 5: the cap is retired)",
  p35.rollCost.knowledge === 1300 && p35.rollCost.culture === 60 &&
  p35.rollTech === "songcraft" && p35.songcraft === 1300 &&
  p35.rollCost.knowledge <= p35.songcraft, JSON.stringify(p35.rollCost));
check("5.1 — the roster detail is hidden until researched (selectors confirmed, v0.53 Part 5.4)",
  p35.censusLocked && p35.censusOpen && p35.censusOpenSelectors);
check("5.1 — ...and job assignment is NOT gated on it", p35.jobsUngated);

// ============================================================================
// The source-level record: the comments the spec requires, present verbatim in kind
// ============================================================================
{
  const src = fs.readFileSync(new URL("../index.html", import.meta.url).pathname, "utf8");
  check("the Part 0 comment forbids re-adding `knowledge`, with the source citation",
    /THE KNOWLEDGE KEY IS DELIBERATELY ABSENT/.test(src) && /3425-3435/.test(src));
  check("the Part 2.5 census comment replaces the false one — no 'insurance' claim survives",
    /bolas 1\.0 \+ huntingArmor 2\.0/.test(src) && /It is NOT insurance/.test(src) &&
    !/CAMP_YIELD_LIMIT[\s\S]{0,200}insurance against/.test(src));
  check("the Sparks standing directive is recorded at the tech entry",
    /ONE sanctioned exception/.test(src) && /3-of-10 choice/.test(src));
  const t38 = fs.readFileSync(new URL("./test-v38.mjs", import.meta.url).pathname, "utf8");
  check("2.6 — test-v38's proportionality assertion is DELETED, not widened, with the ruling recorded",
    !/hi\.score \/ lo\.score <= 15/.test(t38) && /aqueduct 0\.03 at 1\.12 scores 0\.25/.test(t38));
}

console.log(`\n${pass} passed, ${fail} failed`);
await browser.close();
suiteEnd(import.meta.url, pass, fail);
process.exit(fail ? 1 : 0);
