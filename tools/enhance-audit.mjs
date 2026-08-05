// enhance-audit.mjs — Jerry's v0.52 directive 2, run independently of the spec's own table.
// "Make sure that every other enhancing building (including but not limited to:
//  mine/lumber mill/religion buildings/vigor) all enhance production the correct way."
//
// Method: enumerate EVERY field on EVERY building that could enhance anything, work out
// which mechanism it flows through, whether that mechanism is bounded, and MEASURE the
// delivered multiplier through computeRates() rather than reading it off the source.
import { chromium } from "playwright";
const browser = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium" }).catch(() => chromium.launch());
const page = await browser.newPage();
page.on("pageerror", e => console.log("PAGEERROR", e.message));
await page.goto(new URL("../index.html", import.meta.url).href);
await page.waitForTimeout(400);

const r = await page.evaluate(() => {
  const src = computeRates.toString();
  const capSrc = computeCaps.toString();

  // ---- 1. every non-cosmetic field any building carries ----
  const COSMETIC = new Set(["id", "name", "group", "tech", "lore", "effect", "cost", "ratio",
    "unlock", "toggleable", "req", "upg", "limit", "hidden", "gate", "seasonal"]);
  const fieldOwners = {};
  BUILDINGS.forEach(b => Object.keys(b).forEach(k => {
    if (COSMETIC.has(k)) return;
    (fieldOwners[k] = fieldOwners[k] || []).push(b.id);
  }));

  // ---- 2. bare-state harness: measure one building's delivered effect in isolation ----
  const bare = () => {
    S.buildings = {}; S.upgrades = {}; S.jobs = {}; S.pop = 0; S.wanderers = [];
    S.policies = {}; S.champs = {}; S.wtechs = {}; S.drakes = {}; S.leader = null;
    S.worship = 0; S.dragonSoul = false; S.baronUntil = 0;
    TECHS.forEach(t => S.techs[t.id] = true);
    for (const k in RES) if (S.res[k] !== undefined) S.res[k] = 1e9;
  };

  // Does the delivered multiplier keep growing linearly with copies, or does it bend?
  // Linear at high N == unbounded. Bending == a limitedDR sits on it.
  function linearity(setup, read, lo, hi) {
    bare(); setup(lo); const a = read();
    bare(); setup(hi); const b = read();
    bare();
    if (a === null || b === null || a === 0) return null;
    // ratio of measured growth to the growth a purely additive category would give
    return { lo: +a.toFixed(6), hi: +b.toFixed(6), scale: hi / lo,
             linear: +(((b - 1) / (a - 1)) / (hi / lo)).toFixed(4) };
  }

  const out = { fieldOwners, measured: {} };

  // ---- jobBoost: ore (Mine + Petricite Quarry), timber (Lumber Mill), crystals (Augment) ----
  out.measured.jobBoost_miner = linearity(
    n => { S.buildings = { mine: n }; },
    () => 1 + jobBoostTotal("miner"), 5, 500);
  out.measured.jobBoost_woodcutter = linearity(
    n => { S.buildings = { lumberMill: n }; },
    () => 1 + jobBoostTotal("woodcutter"), 5, 500);
  out.measured.jobBoost_tinkerer = linearity(
    n => { S.buildings = { augmentChamber: n }; },
    () => 1 + jobBoostTotal("tinkerer"), 5, 500);

  // ---- boost: knowledge (4 science buildings), provisions, devotion (Sanctum), vigor ----
  // Measured END TO END through a JOB's output, which is the path Jerry asked about.
  function jobOut(job, res, buildings, workers) {
    bare();
    S.buildings = Object.assign({}, buildings);
    S.pop = 20; S.wanderers = []; syncRoster();
    S.jobs = {}; if (workers) S.jobs[job] = workers;
    return computeRates()[res];
  }
  // ============================================================================
  // v0.53 Part 5.2 — THE READER WAS NOT MEASURING A MULTIPLIER.
  //
  // The old boostDelivered() returned with_/base where both are NET rates. For every
  // resource the settlement consumes, net = gross x mult - consumption, and the constant
  // consumption sits in the denominator:
  //
  //     net(n)/net(0) = (G*m(n) - E) / (G*m(0) - E)
  //
  // which is unbounded in E and has nothing to do with m. That is the whole of HANDOFF
  // v0.52 §8.3's unexplained `boost_provisions_irrigation x6.56`. Decomposed exactly by
  // the v0.53 spec's Part 0.3(c): for provisions, G = 10.0000/s and E = 8.5000/s, and
  // `net = trueMult x 10 - 8.5` reproduces all four measured rows to the digit. The bound
  // was always working — it saturates at 2.4902 against its 2.5 asymptote.
  //
  // The reader now does two things:
  //
  //  (1) REMOVES CONSUMPTION, end to end and without mirroring the game's eat formula:
  //      the same state with ZERO workers produces no output at all, so that reading IS
  //      -E. Subtracting it from both sides turns two net rates into two GROSS rates.
  //      This is general — it costs one extra computeRates() and it is correct for any
  //      resource whose consumption does not depend on the building under test.
  //
  //  (2) ANCHORS THE QUOTIENT. A gross ratio is still only m(Sigma0+sigma*n)/m(Sigma0),
  //      and Sigma0 is not zero for every resource — `bare()` turns every tech on, so
  //      provisions carries Cultivation's +0.10 before a single Irrigation Channel is
  //      built. Sigma0 is SOLVED FOR rather than enumerated from source lines (which is
  //      what would go stale): the gross ratio at the widest n is monotone decreasing in
  //      Sigma0, so one bisection recovers it, and the absolute multiplier is then read
  //      through the game's own limitedDR(). `predicted` re-derives the gross ratios at
  //      the narrower n from that solution — if those do not match `grossRatio`, the
  //      model is wrong and the audit says so instead of printing a number.
  // ============================================================================
  function boostMult(res, sigma) {
    const L = BOOST_LIMIT[res];
    return 1 + (L === undefined ? sigma : limitedDR(sigma, L));
  }
  function boostDelivered(job, res, bid, n) {
    const b = {}; b[bid] = n;
    const zero = jobOut(job, res, {}, 0);        // = -E : no workers, no output, eating only
    const base = jobOut(job, res, {}, 20);       // = G*m(Sigma0) - E
    const with_ = jobOut(job, res, b, 20);       // = G*m(Sigma0 + sigma*n) - E
    bare();
    const G0 = base - zero;
    if (!(G0 > 0)) return null;
    return { grossRatio: +((with_ - zero) / G0).toFixed(4), netRatioOld: +(with_ / base).toFixed(4) };
  }
  // One solve per (res, building) line, using the widest n, then applied to every n.
  function boostLine(job, res, bid, ns) {
    const bdef = BUILDINGS.find(x => x.id === bid);
    const sigmaPer = (bdef && bdef.boost && bdef.boost[res]) || 0;
    const rows = ns.map(n => Object.assign({ n }, boostDelivered(job, res, bid, n)));
    const wide = rows[rows.length - 1];
    if (!wide || !sigmaPer) return { sigmaPerCopy: sigmaPer, rows };
    // bisect Sigma0 in [0, 10]: ratio(Sigma0) = m(Sigma0 + sigma*N) / m(Sigma0), decreasing
    const f = s0 => boostMult(res, s0 + sigmaPer * wide.n) / boostMult(res, s0) - wide.grossRatio;
    let lo = 0, hi = 10;
    for (let i = 0; i < 100; i++) {
      const mid = (lo + hi) / 2;
      if (f(mid) > 0) lo = mid; else hi = mid;
    }
    const sigma0 = +((lo + hi) / 2).toFixed(6);
    rows.forEach(r2 => {
      r2.delivered = +boostMult(res, sigma0 + sigmaPer * r2.n).toFixed(4);
      r2.predictedGrossRatio = +(boostMult(res, sigma0 + sigmaPer * r2.n) / boostMult(res, sigma0)).toFixed(4);
      r2.modelError = +Math.abs(r2.predictedGrossRatio - r2.grossRatio).toFixed(5);
    });
    return { sigmaPerCopy: sigmaPer, sigma0Solved: sigma0,
             asymptote: BOOST_LIMIT[res] !== undefined ? 1 + BOOST_LIMIT[res] : null, rows };
  }
  const NS = [5, 50, 500];
  out.measured.boost_knowledge_observatory = boostLine("loremaster", "knowledge", "observatory", NS);
  out.measured.boost_devotion_sanctum = boostLine("acolyte", "devotion", "sanctum", NS);
  out.measured.boost_vigor_trainingGround = boostLine("jungler", "vigor", "trainingGround", NS);
  // v0.52 Part 1.2: the Farmstead's `boost` moved onto the new Irrigation Channel, so the
  // provisions BOOST reader has to follow it — pointing at the Farmstead now measures its
  // `prod`, which is linear by construction and says nothing about the bound.
  // v0.53 Part 5.2: this is the line HANDOFF v0.52 §8.3 left unexplained. It now reads
  // 1.25 / 2.3346 / 2.4902 against a 2.5 asymptote.
  out.measured.boost_provisions_irrigation = boostLine("farmer", "provisions", "irrigation", NS);

  // ---- the science stack at Kittens' own end-of-tree counts, and at RR's measured ones ----
  function scienceStack(counts) {
    bare();
    S.buildings = counts;
    S.pop = 20; S.wanderers = []; syncRoster(); S.jobs = { loremaster: 20 };
    const withB = computeRates().knowledge;
    bare();
    S.pop = 20; S.wanderers = []; syncRoster(); S.jobs = { loremaster: 20 };
    const bareB = computeRates().knowledge;
    bare();
    let sum = 0;
    for (const id in counts) {
      const b = BUILDINGS.find(x => x.id === id);
      if (b && b.boost && b.boost.knowledge) sum += b.boost.knowledge * counts[id];
    }
    return { sigma: +sum.toFixed(3), kittens: +(1 + sum).toFixed(3),
             rr: bareB > 0 ? +(withB / bareB).toFixed(4) : null };
  }
  out.kittensEndOfTree = scienceStack({ archive: 30, academy: 30, observatory: 25, hexLab: 13 });
  out.rrMeasuredCounts = scienceStack({ archive: 39, academy: 31, observatory: 49, hexLab: 21 });

  // ---- 3. every key ever written into `boosts`, and whether it has a limit ----
  const boostKeysFromBuildings = new Set();
  BUILDINGS.forEach(b => { if (b.boost) Object.keys(b.boost).forEach(k => boostKeysFromBuildings.add(k)); });
  const boostKeysInSrc = new Set((src.match(/boosts\.(\w+)\s*\+=/g) || []).map(x => x.slice(7).split(/\s/)[0]));
  const initKeys = ((src.match(/var boosts = \{([^}]*)\}/) || ["", ""])[1].match(/(\w+):/g) || [])
    .map(x => x.replace(":", ""));
  out.boostKeys = {
    fromBuildings: [...boostKeysFromBuildings].sort(),
    fromUpgradeLines: [...boostKeysInSrc].sort(),
    initialised: initKeys.sort(),
    BOOST_LIMIT: Object.keys(BOOST_LIMIT).sort(),
    limits: Object.assign({}, BOOST_LIMIT)
  };
  out.boostKeys.unbounded = [...new Set([...boostKeysFromBuildings, ...boostKeysInSrc])]
    .filter(k => BOOST_LIMIT[k] === undefined).sort();

  // ---- 4. every OTHER enhancing mechanism, and where it is applied ----
  out.otherMechanisms = {
    globalBoost: BUILDINGS.filter(b => b.globalBoost).map(b => b.id + " " + b.globalBoost),
    foundryBoost: BUILDINGS.filter(b => b.foundryBoost).map(b => b.id + " " + b.foundryBoost),
    poroRatio: BUILDINGS.filter(b => b.poroRatio).map(b => b.id + " " + b.poroRatio),
    cultureCapPct: BUILDINGS.filter(b => b.cultureCapPct).map(b => b.id + " " + b.cultureCapPct),
    crowdRelief: BUILDINGS.filter(b => b.crowdRelief).map(b => b.id + " " + b.crowdRelief),
    campBoost: BUILDINGS.filter(b => b.campBoost).map(b => b.id + " " + b.campBoost),
    craftBoost: BUILDINGS.filter(b => b.craftBoost).map(b => b.id + " " + b.craftBoost),
    tradeBoost: BUILDINGS.filter(b => b.tradeBoost).map(b => b.id + " " + b.tradeBoost),
    sumpBoost: BUILDINGS.filter(b => b.sumpBoost).map(b => b.id + " " + b.sumpBoost),
    audience: BUILDINGS.filter(b => b.audience).map(b => b.id + " " + b.audience),
    eatCut: BUILDINGS.filter(b => b.eatCut).map(b => b.id + " " + b.eatCut),
    caps: BUILDINGS.filter(b => b.caps).length + " buildings",
    prod: BUILDINGS.filter(b => b.prod).length + " buildings",
    convert: BUILDINGS.filter(b => b.convert).length + " buildings"
  };
  // and the bound that sits on each of the non-`boosts` categories
  out.otherBounds = {
    CAMP_YIELD_LIMIT, LUXURY_CAMP_YIELD_LIMIT, AUTOPROD_LIMIT,
    CRAFT_YIELD_LIMIT: typeof CRAFT_YIELD_LIMIT !== "undefined" ? CRAFT_YIELD_LIMIT : null,
    MORALE_RELIEF_LIMIT, TRAIT_LIMIT,
    tradeCeiling: "limitedDR(..., 1.0) in the caravan-yield line",
    globalBoost: "UNBOUNDED (catMonument = 1 + Σ)",
    jobBoost: "UNBOUNDED (1 + Σ)"
  };
  // ---- 5. the mechanisms the spec's own table did NOT cover. Jerry said
  //         "including but not limited to", so every one gets measured, not assumed. ----
  function growth(setup, read, lo, hi) {
    bare(); setup(lo); const a = read();
    bare(); setup(hi); const b = read();
    bare();
    return { ["at" + lo]: +a.toFixed(4), ["at" + hi]: +b.toFixed(4),
             linear: a !== 1 ? +(((b - 1) / (a - 1)) / (hi / lo)).toFixed(4) : null };
  }
  out.uncovered = {
    // Kittens' steamworks magnetoBoostRatio 0.15 — unbounded there
    foundryBoost: growth(n => { S.buildings = { hextechFoundry: 1, hexdraulicPlant: n }; },
      () => globalBoostPerCopy(BUILDINGS.find(b => b.id === "hextechFoundry")) / 0.06, 5, 500),
    // the Freljord monument line
    poroRatio: growth(n => { S.buildings = { frostguardCairn: n }; }, () => poroRatio(), 5, 500),
    // Hunter's Lodge -> campYieldMult, bounded by CAMP_YIELD_LIMIT
    // v0.55 Part 4: the Hunter's Lodge is deleted, so there is no building-count term left in
    // campYieldMult() to grow. The stack is measured at its own Sigma instead — every upgrade
    // owned, which is the state the source's x6.10 is quoted at.
    campStackAtFullSigma: (() => {
      bare();
      ["trappersCraft", "beastLore", "masterOfTheHunt", "atlasGauntletsUp", "jessedHawks"]
        .forEach(u => S.upgrades[u] = true);
      const material = campYieldMult(false), comfort = campYieldMult(true);
      bare();
      return { sigma: 5.10, material: +material.toFixed(4), comfort: +comfort.toFixed(4),
               kittensWouldGive: 6.10 };
    })(),
    // Yordle Workshop -> craftYield, bounded by CRAFT_YIELD_LIMIT
    craftBoost: growth(n => { S.buildings = { workshop: n }; }, () => craftYield(), 5, 500),
    // Chembarrel -> autoprodMult, bounded by AUTOPROD_LIMIT
    sumpBoost: growth(n => { S.buildings = { chembarrel: n }; }, () => autoprodMult(), 5, 500),
    // Tavern -> morale relief, bounded by MORALE_RELIEF_LIMIT
    crowdRelief: growth(n => { S.buildings = { bardsHearth: n }; S.pop = 200; S.wanderers = []; syncRoster(); },
      () => 1 + limitedDR(bfield("bardsHearth", "crowdRelief") * count("bardsHearth"), MORALE_RELIEF_LIMIT), 5, 500),
    // Poro Pasture -> eat rate, bounded by its own eatCutLimit
    eatCut: growth(n => { S.buildings = { poroPasture: n }; },
      () => 1 + limitedDR(bfield("poroPasture", "eatCut") * count("poroPasture"), bfield("poroPasture", "eatCutLimit")), 5, 500),
    // Trade Dock + Hexgate -> caravan yields, bounded at 1.0
    tradeBoost: growth(n => { S.buildings = { tradeDock: n }; },
      () => 1 + limitedDR(bfield("tradeDock", "tradeBoost") * count("tradeDock"), 1.0), 5, 500)
  };
  // Bard's Hearth `audience` scales with POPULATION, not with copies — measured separately.
  out.audience = (() => {
    const f = pop => { bare(); S.buildings = { bardsHearth: 1 }; S.pop = pop; S.wanderers = []; syncRoster();
                       return computeRates().culture; };
    const a = f(20), b = f(200), c = f(2000);
    bare();
    return { pop20: +a.toFixed(5), pop200: +b.toFixed(5), pop2000: +c.toFixed(5),
             linearInPop: +(((c - 0) / (a - 0)) / 100).toFixed(4) };
  })();
  bare();
  return out;
});

const j = (x) => JSON.stringify(x);
console.log("=== EVERY non-cosmetic field a building carries, and who carries it ===");
Object.entries(r.fieldOwners).sort().forEach(([k, v]) =>
  console.log(`  ${k.padEnd(16)} ${v.length.toString().padStart(2)}  ${v.join(", ")}`));

console.log("\n=== MECHANISM 1: jobBoost -> (1 + Σ), applied to job output ===");
console.log("  linear ≈ 1.0000 means the delivered multiplier grows exactly with copies, i.e. UNBOUNDED.");
["jobBoost_miner", "jobBoost_woodcutter", "jobBoost_tinkerer"].forEach(k =>
  console.log(`  ${k.padEnd(24)} ${j(r.measured[k])}`));

console.log("\n=== MECHANISM 2: boost -> (1 + boosts[res]), measured END TO END through a JOB ===");
console.log("  v0.53 Part 5.2: `delivered` is the MULTIPLIER, 1+limitedDR(Σ, BOOST_LIMIT[res]).");
console.log("  `grossRatio` is what the run measured after consumption was removed; `netRatioOld`");
console.log("  is what the pre-v0.53 reader printed — kept so the ×6.56 artefact stays visible.");
["boost_knowledge_observatory", "boost_devotion_sanctum", "boost_vigor_trainingGround",
 "boost_provisions_irrigation"].forEach(k => {
  const v = r.measured[k];
  console.log(`  ${k}  σ/copy ${v.sigmaPerCopy}  Σ0 solved ${v.sigma0Solved ?? "n/a"}  asymptote ${v.asymptote ?? "UNBOUNDED"}`);
  v.rows.forEach(row => console.log(`      n=${String(row.n).padStart(3)}  delivered ×${row.delivered ?? "?"}` +
    `   grossRatio ×${row.grossRatio}   predicted ×${row.predictedGrossRatio ?? "?"}` +
    `   model err ${row.modelError ?? "?"}   (old net reader ×${row.netRatioOld})`));
});

console.log("\n=== The science stack against Kittens ===");
console.log("  Kittens' end-of-tree 30/30/25/13 :", j(r.kittensEndOfTree));
console.log("  RR's measured        39/31/49/21 :", j(r.rrMeasuredCounts));

console.log("\n=== Every key written into `boosts`, and its bound ===");
console.log("  from buildings   :", r.boostKeys.fromBuildings.join(", "));
console.log("  from upgrades    :", r.boostKeys.fromUpgradeLines.join(", "));
console.log("  initialised      :", r.boostKeys.initialised.join(", "));
console.log("  BOOST_LIMIT keys :", r.boostKeys.BOOST_LIMIT.join(", "));
console.log("  limits           :", j(r.boostKeys.limits));
console.log("  *** UNBOUNDED    :", r.boostKeys.unbounded.join(", ") || "none");

console.log("\n=== Every OTHER enhancing mechanism ===");
Object.entries(r.otherMechanisms).forEach(([k, v]) =>
  console.log(`  ${k.padEnd(16)} ${Array.isArray(v) ? (v.join(" | ") || "none") : v}`));
console.log("\n=== MECHANISMS THE SPEC'S TABLE DID NOT COVER (Jerry: 'including but not limited to') ===");
console.log("  linear ~1.0 = unbounded; linear << 1.0 = a bound is biting.");
Object.entries(r.uncovered).forEach(([k, v]) => console.log(`  ${k.padEnd(14)} ${j(v)}`));
console.log("  audience (scales with POPULATION, not copies):", j(r.audience));

console.log("\n=== The bounds on those ===");
Object.entries(r.otherBounds).forEach(([k, v]) => console.log(`  ${k.padEnd(24)} ${v}`));

await browser.close();
