// Shared headless simulator for Runeterra Reclaimed.
// Runs the game's own tick() at speed with a greedy player, a virtualised clock
// (so Date.now-based cooldowns actually elapse) and rendering stubbed out.
import { chromium } from "playwright";

export async function openGame(file = new URL("../index.html", import.meta.url).pathname) {
  const browser = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium" }).catch(() => chromium.launch());
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
  const errors = [];
  page.on("pageerror", e => errors.push(String(e)));
  page.on("console", m => { if (m.type() === "error") errors.push(m.text()); });
  await page.goto("file://" + file);
  await page.waitForTimeout(400);
  return { browser, page, errors };
}

export async function runSim(page, years, seed = 1) {
  return await page.evaluate(({ years, seed }) => {
    // ---- deterministic RNG ----
    let rngState = seed >>> 0 || 1;
    Math.random = function () {
      rngState ^= rngState << 13; rngState >>>= 0;
      rngState ^= rngState >> 17;
      rngState ^= rngState << 5; rngState >>>= 0;
      return rngState / 4294967296;
    };
    // ---- virtual clock so cooldowns elapse ----
    let simNow = 1700000000000;
    Date.now = function () { return simNow; };
    // ---- stub the presentation layer ----
    renderTop = function () {}; renderAll = function () {}; renderLog = function () {};
    updateAffordability = function () {}; showCostTooltip = function () {}; hideTooltip = function () {};
    snapshotUndo = function () {}; renderUndoToast = function () {};

    loadFromString(btoa(unescape(encodeURIComponent(JSON.stringify(freshState())))));

    const TICKS_PER_YEAR = TICKS_PER_DAY * DAYS_PER_SEASON * 4;   // 4000
    const totalTicks = years * TICKS_PER_YEAR;
    const yearNow = () => S.tick / TICKS_PER_YEAR;

    const milestones = {};
    const snaps = {};
    // v0.46 Part 8 instrumentation
    let tradeCount = 0;                 // trades executed, for trades-per-game-year
    let vigorAtCapTicks = 0, tickCount = 0;
    const tradeMarks = {};              // cumulative trade count at each milestone
    const firstVisible = {};            // cold-start visibility years (Part 8)
    const markVis = k => { if (firstVisible[k] === undefined) firstVisible[k] = +yearNow().toFixed(2); };
    // ---- v0.53 instrumentation, ALL of it written BEFORE the first run of the round
    // (HANDOFF v0.52 §6, "instrument before launching"; the v0.50 round paid two re-runs
    // for not doing this). Every metric Parts 1-6 of the v0.53 spec name is below.
    //
    // 1. SPEND. pay() is the single choke point through which every building, tech,
    //    discovery, craft, trade and recruitment leaves the stock, so wrapping it once
    //    measures spend for EVERY resource without touching the game. Part 2.2 needs
    //    crystal spend per game-year; Part 6 needs vigor spend split by cause; Part 4.3
    //    needs the new craft's stock to stop rising, which is a spend question.
    const spendTotal = {};              // cumulative spend, by resource, whole run
    const spendMarks = {};              // cumulative spend snapshot at each milestone
    const _origPay = pay;
    pay = function (cost) {
      for (const r in cost) spendTotal[r] = (spendTotal[r] || 0) + cost[r];
      return _origPay(cost);
    };
    const spendSnap = () => Object.assign({}, spendTotal);
    // 2. Vigor, split by cause. vigorSpent below already counts expeditions; trade is
    //    the other half and Part 6 asks for the split at y50 and y100 explicitly.
    let vigorOnTrade = 0;
    const vigorSplit = {};              // { y50: {...}, y100: {...} }
    // 3. seenMax for the crafted intermediates. Part 1.3's whole finding is that
    //    hexgear's STOCK never accumulates while hexcore's does; that is a peak-stock
    //    question and nothing in the harness recorded peaks.
    const seenMaxOf = r => +(S.seenMax[r] || 0).toFixed(2);
    // 4. Yearly series for the three resources whose accumulation is the question:
    //    crystals (Part 2), voidessence and the new tier-5 craft (Part 4.3).
    const stockSeries = [];             // { year, crystals, voidessence, <newCraft> }
    // 5. The five buildings that measured zero, tracked at every milestone rather than
    //    only at the three that snapshot().
    const ZERO_FIVE = ["hextechFoundry", "hexdraulicPlant", "chembarrel",
                       "hexcreteBastion", "frostguardCairn"];
    const PORO_LADDER = ["poroPasture", "frostguardCairn", "avarosanHold",
                         "iceWroughtSpire", "frozenWatcher", "watchersEye"];
    // v0.44 Part 4 asks for two named numbers at Sparks and at Icathia: the full
    // multiplier product per raw line, category by category, and the science building
    // counts. Both are read off live state at the instant the tech lands.
    function snapshot() {
      const mor = morale() / 100;
      const mw = S.upgrades.masterworkTools ? 1.25 : 1;
      const villageMult = (1 + champPassive("village") / 100) * policyMult("village");
      const jobBoosts = {};
      BUILDINGS.forEach(b => {
        if (!b.jobBoost) return;
        const n = count(b.id); if (!n) return;
        // v0.45: read the GAME's per-copy function rather than b.jobBoost directly —
        // the saw line scales the Lumber Mill's term and the minerals upgrades add to
        // the Mine's and Quarry's. Mirroring it by hand here is exactly how this
        // snapshot would start lying.
        for (const jb in b.jobBoost) jobBoosts[jb] = (jobBoosts[jb] || 0) + jobBoostPerCopy(b, jb) * n;
      });
      const jobSkill = {};
      (S.wanderers || []).forEach(w => {
        if (!w.j) return;
        const e = jobSkill[w.j] || (jobSkill[w.j] = { sum: 0, n: 0 });
        e.sum += 1 + rankOf(w, w.j).bonus; e.n++;   // v0.54 directive 8: rank is PER JOB
      });
      const skillMult = id => { const e = jobSkill[id]; return e && e.n ? e.sum / e.n : 1; };
      let monumentSum = 0;
      BUILDINGS.forEach(b => {
        if (!b.globalBoost) return;
        const amp = (b.id === "hextechFoundry") ? (1 + 0.15 * count("hexdraulicPlant")) : 1;
        monumentSum += b.globalBoost * count(b.id) * amp;
      });
      const cats = {
        monument:  1 + monumentSum,
        charts:    1 + (S.upgrades.celestialCharts ? 0.10 : 0),
        religion:  1 + worshipBonus(),
        drake:     1 + drakeBonus("infernal", 0.5),
        soul:      1 + (S.dragonSoul ? 0.25 : 0),
        policy:    1 + policyGlobalBonus(),
        morale:    mor,
        workerPolicy: policyMult("worker")
      };
      const line = (job, tool, ratioUp) => ({
        toolUpgrade: tool, masterwork: mw, village: villageMult,
        buildingJobBoost: 1 + (jobBoosts[job] || 0),
        censusRank: +skillMult(job).toFixed(4),
        resGlobalRatio: ratioUp
      });
      const prod = (o) => Object.values(o).reduce((a, x) => a * x, 1);
      // v0.45 Part 2 E1: the miner has NO tool line and ore has LEFT the per-resource
      // global category. v0.45 Part 2 E2: the woodcutter's tool line is the six-rung
      // axe line, read from the game's own axeMult().
      const oreLine = line("miner", 1, 1);
      // v0.46: record WHICH rungs are owned. The v0.45 report compared a measured value
      // against a full-line formula and read a 51% "miss" that was the formula's fault.
      const axesOwned = AXE_LINE.filter(u => S.upgrades[u[0]]).length;
      const sawsOwned = SAW_LINE.filter(u => S.upgrades[u[0]]).length;
      const timLine = line("woodcutter", +axeMult().toFixed(4),
                           1 + (S.upgrades.seasonedTimberworks ? 0.25 : 0));
      // v0.45 Part 2 E1: masterworkTools no longer applies to the miner.
      oreLine.masterwork = 1;
      const gp = prod(cats);
      // v0.45 Part 1: knowledge and culture take catCharts x catReligion x catPolicy only.
      const gpTransient = cats.charts * cats.religion * cats.policy;
      // v0.46 Part 1.4 — decompose ore income into job / autoprod / converter, by
      // switching each source off in the GAME's own computeRates rather than mirroring
      // its maths. Kittens adds perTickAutoprod AFTER mineralsRatio is applied, so
      // autoprod there bypasses the Mine/Quarry category entirely; the analyzer needs to
      // know whether RR's ore autoprod is being multiplied by the x38 building category.
      const oreTotal = computeRates().ore;
      const savedMiner = S.jobs.miner || 0;
      S.jobs.miner = 0;
      const oreNoJobs = computeRates().ore;
      S.jobs.miner = savedMiner;
      const savedOff = Object.assign({}, S.buildingsOff);
      BUILDINGS.forEach(b => { if (b.convert) S.buildingsOff[b.id] = true; });
      const oreNoConverters = computeRates().ore;
      S.buildingsOff = savedOff;
      const oreJob = oreTotal - oreNoJobs;
      const oreConv = oreTotal - oreNoConverters;
      return {
        year: +yearNow().toFixed(1), pop: S.pop, morale: Math.round(morale()),
        worship: Math.round(S.worship || 0),
        convergencePct: +(worshipBonus() * 100).toFixed(3),
        science: { archive: count("archive"), academy: count("academy"),
                   observatory: count("observatory"), hexLab: count("hexLab") },
        amplifier: { foundries: count("hextechFoundry"), plants: count("hexdraulicPlant"),
                     reactors: count("arcaneReactor"), swRatio: 1 + 0.15 * count("hexdraulicPlant") },
        categories: Object.fromEntries(Object.entries(cats).map(([k, v]) => [k, +v.toFixed(4)])),
        globalProduct: +gp.toFixed(2),
        // v0.45 Part 1 — what knowledge and culture actually receive, and the ratio of
        // what they no longer receive. This is the number Part 1 exists to move.
        transientProduct: +gpTransient.toFixed(4),
        excludedFromTransient: +(gp / gpTransient).toFixed(3),
        oreDecomposition: {
          total: +oreTotal.toFixed(2),
          job: +oreJob.toFixed(2),
          converterAndAutoprod: +oreConv.toFixed(2),
          other: +(oreTotal - oreJob - oreConv).toFixed(2),
          jobPct: +(100 * oreJob / (oreTotal || 1)).toFixed(1),
          convPct: +(100 * oreConv / (oreTotal || 1)).toFixed(1)
        },
        vigorRate: +computeRates().vigor.toFixed(3),
        vigorCap: Math.round(computeCaps().vigor),
        knowledgeRate: +computeRates().knowledge.toFixed(3),
        cultureRate: +computeRates().culture.toFixed(4),
        // v0.45 Part 2 — N for each ratio building, so the composition table is checkable
        ratioBuildings: { mine: count("mine"), quarry: count("quarry"), lumberMill: count("lumberMill") },
        // v0.50 Parts 2.3 and 3
        augmentChamber: count("augmentChamber"), arcaneReactor: count("arcaneReactor"),
        hextechFoundry: count("hextechFoundry"), shimmerRefinery: count("shimmerRefinery"),
        // ---- v0.52, instrumented BEFORE the first run this time ----
        // Part 0: the knowledge multiplier the four science buildings actually deliver,
        // and the counts behind it. The claim under test is that the overshoot in counts
        // was a SYMPTOM of the bound, so both have to be on the same line.
        // v0.53 Part 5.1. THE OLD READER COMPARED TWO DIFFERENT THINGS and the gap was
        // read as a x3 overshoot for two rounds. Two defects, not one:
        //   (a) Sigma summed the four science BUILDINGS only, while boosts.knowledge is
        //       also written by the Rites of Insight worship tech (+0.10), by Swain's
        //       knowledge passive, and by policyBoost("knowledge"). The spec calls these
        //       "the Scholarship-ladder Discoveries"; verified from source this round,
        //       NO Discovery writes to boosts.knowledge at all — Scholarship is a CAP
        //       multiplier (scholarMultOf), not a rate boost. The missing terms are the
        //       worship tech, the champion passive and the policy. Reported in §7.
        //   (b) `delivered` set S.buildings = {} to get its denominator, which removes
        //       the whole GLOBAL-production category (Foundries, Hexdraulic amplifier,
        //       Arcane Reactors) and changes morale() by deleting every Bard's Hearth.
        //       Neither belongs to the knowledge-boost category. That, not a missing
        //       Sigma, is most of the x105-vs-x35.75 gap.
        // The reader now neutralises EXACTLY the terms that feed boosts.knowledge and
        // nothing else, by zeroing the four science buildings' counts and stubbing the
        // three non-building contributors, so `delivered` is 1 + Sigma by construction
        // and the two halves of the line are finally comparable.
        science: (() => {
          const counts = { archive: count("archive"), academy: count("academy"),
                           observatory: count("observatory"), hexLab: count("hexLab") };
          let sigmaBuildings = 0;
          for (const id in counts) {
            const b = BUILDINGS.find(x => x.id === id);
            if (b && b.boost && b.boost.knowledge) sigmaBuildings += b.boost.knowledge * counts[id];
          }
          const sigmaRites = (S.wtechs && S.wtechs.ritesOfInsight) ? 0.10 : 0;
          const sigmaChamp = champPassive("knowledge") / 100;
          const sigmaPolicy = policyBoost("knowledge");
          const sigma = sigmaBuildings + sigmaRites + sigmaChamp + sigmaPolicy;
          const saveJobs = S.jobs, savePop = S.pop, saveB = S.buildings;
          const saveRites = S.wtechs && S.wtechs.ritesOfInsight;
          S.jobs = { loremaster: 20 }; S.pop = Math.max(20, S.pop);
          const withB = computeRates().knowledge;
          // neutralise the four boost carriers only — every other building stays, so
          // catMonument, crowd relief and morale are identical on both sides
          S.buildings = Object.assign({}, saveB);
          for (const id in counts) S.buildings[id] = 0;
          if (S.wtechs) S.wtechs.ritesOfInsight = false;
          const origChamp = champPassive, origPolicy = policyBoost;
          champPassive = k => (k === "knowledge" ? 0 : origChamp(k));
          policyBoost = k => (k === "knowledge" ? 0 : origPolicy(k));
          const bareB = computeRates().knowledge;
          champPassive = origChamp; policyBoost = origPolicy;
          if (S.wtechs) S.wtechs.ritesOfInsight = saveRites;
          S.buildings = saveB; S.jobs = saveJobs; S.pop = savePop;
          return { counts, sigma: +sigma.toFixed(4),
                   sigmaParts: { buildings: +sigmaBuildings.toFixed(4), rites: sigmaRites,
                                 champion: +sigmaChamp.toFixed(4), policy: +sigmaPolicy.toFixed(4) },
                   kittensWouldGive: +(1 + sigma).toFixed(4),
                   delivered: bareB > 0 ? +(withB / bareB).toFixed(4) : null };
        })(),
        // Part 1.2: the Irrigation Channel replaces the Farmstead's boost
        irrigation: count("irrigation"), farmsteads: count("farmstead"),
        provisionsPerSec: +computeRates().provisions.toFixed(3),
        // ---- v0.55, instrumented BEFORE the first run of the round ----
        // Part 4 asks for camp yields at all three milestones before and after the hunt-yield
        // restructure, and Part 4's pass condition is a DELIVERED multiplier, so both the
        // material and the comfort figures are recorded at every snapshot point.
        campYield: +campYieldMult().toFixed(4),
        luxCampYield: +campYieldMult(true).toFixed(4),
        junglers: S.jobs.jungler || 0,
        // Part 3: the food economy, in the units Part 3.1's table is written in. `eatPerSec`
        // is measured by differencing the provisions rate against a settlement of zero
        // wanderers, which is the same trick v0.53 Part 5.2 used to strip consumption out of
        // a net rate — it reads the game rather than mirroring its eat formula.
        food: (() => {
          const grossAt = pop => { const sp = S.pop, sw = S.wanderers;
            S.pop = pop; const r = computeRates().provisions; S.pop = sp; S.wanderers = sw; return r; };
          const net = computeRates().provisions;
          const noEat = grossAt(0);
          return { netPerSec: +net.toFixed(3), grossPerSec: +noEat.toFixed(3),
                   eatPerSec: +(noEat - net).toFixed(3),
                   farmers: S.jobs.farmer || 0, pop: S.pop,
                   season: currentSeason().id !== undefined ? currentSeason().id : currentSeason().name,
                   farmMultNow: +currentSeason().farmMult.toFixed(3),
                   provisionsCap: Math.round(computeCaps().provisions),
                   held: Math.round(S.res.provisions) };
        })(),
        // Part 6: drakes are RR-ORIGINAL and the round changes their curve, so the kill counts
        // and the delivered bonuses are recorded rather than inferred from the essence badges.
        drakes: (() => {
          const o = {};
          (typeof DRAKE_TYPES !== "undefined" ? DRAKE_TYPES : []).forEach(d => {
            // DRAKE_CAP arrives with v0.55 Part 6; the fallback keeps this snapshot valid on
            // the v0.54 baseline slice, which is the whole point of instrumenting first.
            const cap = (typeof DRAKE_CAP !== "undefined" && DRAKE_CAP[d.id] !== undefined)
              ? DRAKE_CAP[d.id] : (d.id === "cloud" ? 1.0 : d.id === "infernal" ? 0.5 : 0.6);
            o[d.id] = { kills: S.drakes[d.id] || 0, cap, delivered: +drakeBonus(d.id, cap).toFixed(4) };
          });
          return o;
        })(),
        // Part 7: time-to-Challenger is a real-hours question, so the roster's banked
        // experience is recorded in seconds worked, per trade, at the top and the median.
        xp: (() => {
          const banks = [];
          (S.wanderers || []).forEach(w => { for (const j in (w.jx || {})) banks.push(w.jx[j]); });
          banks.sort((a, b) => b - a);
          return { n: banks.length, top: +(banks[0] || 0).toFixed(1),
                   median: +(banks[Math.floor(banks.length / 2)] || 0).toFixed(1),
                   atChallenger: banks.filter(v => v >= RANKS[RANKS.length - 1].xp).length };
        })(),
        steelPerSec: +computeRates().steel.toFixed(4),
        bloomery: count("bloomery"), forge: count("forge"),
        bardsHearths: count("bardsHearth"), morale: morale(),
        // v0.52 Part 2.3: the delivered relief, so the merge is sized in the report and
        // not inferred from the Hearth count.
        crowdReliefPct: +(100 * limitedDR(bfield("bardsHearth", "crowdRelief") * count("bardsHearth"),
                                          MORALE_RELIEF_LIMIT)).toFixed(1),
        shimmerPerSec: +computeRates().shimmer.toFixed(4),
        // Part 3.1: the Tinkerer/Augment chain, measured not touched
        tinkerers: S.jobs.tinkerer || 0,
        crystalsPerSec: +computeRates().crystals.toFixed(4),
        crystalsHeld: Math.round(S.res.crystals), crystalsCap: Math.round(computeCaps().crystals),
        // ---- v0.53, instrumented before the first run ----
        // SEC_PER_GAME_YEAR: TICK_MS 200 x TICKS_PER_DAY 10 x DAYS_PER_SEASON 100 x 4 = 800 s.
        // Part 2.2 asks for crystal income and crystal spend in the SAME unit, which is
        // per game-year, and Part 2.4's "held < 3 game-years of production" needs both.
        crystalIncomePerGameYear: +(computeRates().crystals * 800).toFixed(1),
        crystalsHeldInGameYears: computeRates().crystals > 0
          ? +(S.res.crystals / (computeRates().crystals * 800)).toFixed(2) : null,
        // Part 4.2/4.3: the Void Essence income the tier-5 craft must be sized against.
        voidessencePerSec: +computeRates().voidessence.toFixed(4),
        voidessenceIncomePerGameYear: +(computeRates().voidessence * 800).toFixed(1),
        voidessenceHeld: +(S.res.voidessence || 0).toFixed(1),
        voidessenceCap: Math.round(computeCaps().voidessence || 0),
        // Part 1: the five buildings that measured exactly zero, and the Freljord ladder
        // whose whole category has never been built in a measured run.
        zeroFive: Object.fromEntries(ZERO_FIVE.map(id => [id, count(id)])),
        poroLadder: Object.fromEntries(PORO_LADDER.map(id => [id, count(id)])),
        poros: +(S.res.poros || 0).toFixed(1),
        poroTears: +(S.res.poroTears || 0).toFixed(1),
        poroRatioDelivered: +poroRatio().toFixed(4),
        // Part 1.3: the hexgear starvation is a PEAK-STOCK claim. Nothing recorded peaks.
        seenMaxIntermediates: { hexgear: seenMaxOf("hexgear"), hexcore: seenMaxOf("hexcore"),
                                alloy: seenMaxOf("alloy"), plating: seenMaxOf("plating"),
                                scaffold: seenMaxOf("scaffold"), hexSlab: seenMaxOf("hexSlab"),
                                voidessence: seenMaxOf("voidessence"), poroTears: seenMaxOf("poroTears"),
                                trueice: seenMaxOf("trueice"), frostMegalith: seenMaxOf("frostMegalith") },
        spendToDate: spendSnap(),
        stocks: Object.fromEntries(Object.keys(RES).map(r => [r, +(S.res[r] || 0).toFixed(2)])),
        // v0.53. EVERY building count, not a hand-picked five. Three rounds running, a
        // report has wanted a count that the snapshot did not carry (v0.50 the Refinery,
        // v0.52 the Foundry, this round the Vault and the Spire for Part 2.4's own
        // prediction) and the only remedy has been another 20-minute run. 47 integers.
        buildingCounts: Object.fromEntries(BUILDINGS.map(b => [b.id, count(b.id)])),
        // v0.49 Part 6: catMonument decomposed by building. This is the category Part 1.7
        // just cut from five members to Kittens' two, and nobody has ever measured it.
        catMonument: (() => {
          const parts = {}; let sum = 0;
          BUILDINGS.forEach(b => {
            if (!b.globalBoost) return;
            const n = count(b.id); if (!n) return;
            const per = globalBoostPerCopy(b), v = per * n;
            parts[b.id] = { n, perCopy: +per.toFixed(4), contrib: +v.toFixed(4) };
            sum += v;
          });
          return { total: +(1 + sum).toFixed(4), parts };
        })(),
        linesOwned: { axes: axesOwned, saws: sawsOwned, axeMult: +axeMult().toFixed(3), sawSum: +sawSum().toFixed(3) },
        jobs: { miner: S.jobs.miner || 0, woodcutter: S.jobs.woodcutter || 0,
                loremaster: S.jobs.loremaster || 0, acolyte: S.jobs.acolyte || 0 },
        // v0.47 Part 6: acolyte share of population, gold ceiling and whether it binds a trade
        acolytePctOfPop: +(100 * (S.jobs.acolyte || 0) / (S.pop || 1)).toFixed(1),
        gold: { held: Math.round(S.res.gold), cap: Math.round(computeCaps().gold),
                cheapestTradeGold: Math.min.apply(null, FACTIONS.map(f => tradeCost(f).gold || 0)),
                ceilingBindsATrade: computeCaps().gold < Math.max.apply(null, FACTIONS.map(f => tradeCost(f).gold || 0)) },
        // v0.50 Part 5. "First trade before Sparks" measured the BOT's expedition policy,
        // not the game: the greedy policy spends vigor the instant it can afford an
        // expedition and never banks, so its vigor is a flow where a player's is a stock.
        // The replacement is a STATE question — can the cheapest route be paid for at all
        // at this point — plus the income needed to judge how many a player could run.
        cheapestTrade: (() => {
          const SEC_PER_GAME_YEAR = 4 * 100 * 10 * (200 / 1000);   // 4 seasons x 100 days x 10 ticks x 0.2s = 800
          const costs = FACTIONS.map(f => ({ id: f.id, c: tradeCost(f) }));
          const cheapest = costs.slice().sort((a, b) => (a.c.vigor || 0) - (b.c.vigor || 0))[0];
          const caps = computeCaps(), c = cheapest.c;
          const binding = Object.keys(c).filter(r => caps[r] !== undefined && caps[r] < c[r]);
          const vps = computeRates().vigor;
          return { route: cheapest.id, cost: c, affordable: binding.length === 0, binding,
                   vigorPerSec: +vps.toFixed(3),
                   vigorPerGameYear: +(vps * SEC_PER_GAME_YEAR).toFixed(1),
                   tradesPerGameYear: c.vigor ? +((vps * SEC_PER_GAME_YEAR) / c.vigor).toFixed(2) : null };
        })(),
        shrines: count("shrine"),
        // v0.45 Part 8 — the aggregate champion multiplier across every line it reaches
        championAggregate: +(["camp", "devotion", "caravan", "village", "gold", "knowledge",
                             "culture", "craft", "respawn", "vigor"]
                            .reduce((a, k) => a * (1 + champPassive(k) / 100), 1)).toFixed(3),
        caps: { knowledge: Math.round(computeCaps().knowledge) },
        ore: { line: Object.fromEntries(Object.entries(oreLine).map(([k, v]) => [k, +v.toFixed(4)])),
               lineProduct: +prod(oreLine).toFixed(3), total: +(prod(oreLine) * gp).toFixed(2),
               perWorker: +(prod(oreLine) / cats.morale / cats.workerPolicy).toFixed(3),
               ratePerSec: +computeRates().ore.toFixed(2) },
        timber: { line: Object.fromEntries(Object.entries(timLine).map(([k, v]) => [k, +v.toFixed(4)])),
                  lineProduct: +prod(timLine).toFixed(3), total: +(prod(timLine) * gp).toFixed(2),
                  perWorker: +(prod(timLine) / cats.morale / cats.workerPolicy).toFixed(3),
                  ratePerSec: +computeRates().timber.toFixed(2) }
      };
    }
    const mark = k => {
      if (milestones[k] !== undefined) return;
      milestones[k] = +yearNow().toFixed(1);
      tradeMarks[k] = tradeCount;
      spendMarks[k] = spendSnap();
      // v0.53 Part 2.2 requires crystal income and spend measured "at Deep Works and at
      // Icathia", and Deep Works has never been a snapshot point. Adding it costs one
      // snapshot() call in a 2,500-year run.
      if (k === "sparks" || k === "icathia" || k === "hexcore" || k === "deepWorks") snaps[k] = snapshot();
    };

    const samples = [];      // objectives + luxury samples, twice per year
    const campRuns = {};     // how often each camp was actually hunted
    let vigorOnLuxury = 0, vigorSpent = 0, vigorEarned = 0, crystalsAtCapTicks = 0;
    const popSeries = [];

    // ---------- player heuristics ----------
    const net = r => computeRates()[r];
    const caps = () => computeCaps();
    const has = (r, n) => S.res[r] >= n;

    function buildingByIdVisible(id) {
      const b = BUILDINGS.find(x => x.id === id);
      return b && buildingVisible(b) ? b : null;
    }
    function tryBuild(id) {
      const b = buildingByIdVisible(id);
      if (!b) return false;
      if (!canAfford(buildingCost(b))) return false;
      buyBuilding(id);
      return true;
    }

    function assignTo(job, n) {
      for (let i = 0; i < n; i++) assignJob(job, 1);
    }
    function idleCount() {
      let a = 0; JOBS.forEach(j => a += S.jobs[j.id] || 0);
      return S.pop - a;
    }

    function manageJobs() {
      // shed everyone occasionally and re-lay the mix, cheap enough at this cadence
      const targets = {};
      const pop = S.pop;
      if (!pop) return;
      const provNet = net("provisions");
      // farmers first: keep food positive
      let farmers = S.jobs.farmer || 0;
      if (provNet < 0.5 && idleCount() > 0) { assignTo("farmer", 1); return; }
      if (provNet > 6 && farmers > 1) { assignJob("farmer", -1); return; }
      if (idleCount() <= 0) return;

      const want = [];
      // v0.42: RR's costs are now dominated by timber and ore, not knowledge. A player
      // at a housing wall does not staff eight loremasters and three miners.
      const c3 = caps();
      const kPinned = S.res.knowledge >= c3.knowledge - 1e-6;
      const atWall = S.pop >= maxPop() - 1;
      if (atWall || kPinned) {
        want.push(["woodcutter", 0.26]);
        if (S.techs.mining) want.push(["miner", 0.26]);
        want.push(["loremaster", 0.14]);
      } else {
        want.push(["loremaster", 0.30]);
        want.push(["woodcutter", 0.18]);
        if (S.techs.mining) want.push(["miner", 0.18]);
      }
      if (count("manaWell") >= 3) want.push(["arcanist", 0.10]);
      if (S.techs.logistics) want.push(["jungler", 0.12]);
      if (S.techs.ritesOfTargon) want.push(["acolyte", 0.18]);
      if (count("refinery") >= 1) want.push(["tinkerer", 0.05]);

      for (const [job, share] of want) {
        const j = JOBS.find(x => x.id === job);
        if (j.max && (S.jobs[job] || 0) >= j.max()) continue;
        if ((S.jobs[job] || 0) < Math.floor(pop * share)) { assignJob(job, 1); return; }
      }
      // anything left over goes to farming
      if (idleCount() > 0) assignJob("farmer", 1);
    }

    // v0.53 Part 1.1. The build order was a `const` INSIDE manageBuildings, which is
    // exactly why nothing could assert against it: a list nothing outside the function
    // can read cannot be enumerated, and the omission of the Shimmer Refinery survived
    // three rounds and four more omissions survived this one. It is hoisted here and
    // returned in the run result so `test-v53` can subtract it from BUILDINGS and fail
    // on a non-empty remainder. A comment saying "tavern and bloomery removed" did not
    // stop this happening again; an assertion will.
    //
    // DEDICATED_ROUTINES: the ids manageBuildings() handles by name above the loop.
    // They are legitimately absent from `order` and the assertion has to know that.
    const DEDICATED_ROUTINES = ["longhouse", "skyrise", "shelter", "harbor", "hallOfHeroes"];
    const BUILD_ORDER = ["manaWell", "farmstead", "archive", "lumberMill", "mine", "academy",
      // v0.55 Part 3.4: the Granary. Added in the SAME slice as the building — test-v53's
      // reachability assertion fails if a building is not in one of these two lists.
      "granary",
      "bardsHearth", "storehouse", "forge", "shrine", "observatory", "workshop",
      "tradeDock", "hunterLodge", "sanctum", "trainingGround", "warehouse",
      "refinery", "marus", "hexLab", "sumpMine", "coalgasVent", "hexQuarry",
      // v0.52 Part 1.2: the Irrigation Channel; Part 3.2: the SHIMMER REFINERY, which
      // was never in this list at all — the reason its measured count was 0 at every
      // milestone in every prior round is that the bot never considered it, NOT that it
      // was overpriced. Apparatus defect, reported in BUILD REPORT v0.52 §3.2.
      "irrigation", "shimmerRefinery",
      // v0.53 Part 1.1 — THE SWEEP. v0.52 fixed the Shimmer Refinery omission with one
      // string and did not check for others. Two more ids were missing from this list
      // and are added here, both of them load-bearing for the round's own thesis:
      //   * `poroPasture` — without it the poro herd never grows, so PORO_SACRIFICE_COST
      //     is never affordable, so no Poro Tears exist, so the ENTIRE Freljord
      //     poroRatio ladder (Cairn -> Hold -> Spire -> Watcher) is unbuildable. That is
      //     the category BUILD REPORT v0.52 §13.1 asked the analyzer to rule on: it had
      //     never been built in any measured run of this project. Village block, beside
      //     the other cheap Village producers.
      //   * `hexcreteBastion` — the deep-storage tier for zaunore, coalgas, hexore,
      //     shimmer and voidessence, i.e. exactly the resources Era 3 must bank. EVERY
      //     Era 3 number in this project's history was measured with it absent. Placed
      //     with the other Storage tiers, after `vault`.
      "poroPasture",
      "hextechFoundry", "hexdraulicPlant", "arcaneReactor", "chembarrel",
      // v0.53 Part 4.3: the Rift Anchor, the tier-5 craft's repeatable consumer. Added in
      // the SAME slice as the craft — a consumer the instrument cannot buy would reproduce
      // the exact defect Part 1 exists to sweep.
      "piltoverSpire", "vault", "hexcreteBastion", "riftAnchor", "watchersEye",
      "frostguardCairn", "avarosanHold", "iceWroughtSpire", "frozenWatcher",
      "quarry", "augmentChamber", "hexgateBuilding", "wardOfWatchers"];
      // v0.52 Part 2.3/2.4: "tavern" and "bloomery" removed — both buildings deleted.

    function manageBuildings() {
      // Morale multiplies ALL worker output, so a player buys the thing that fixes it
      // before anything else. v0.41 raised the Tavern to 400/800/200, which pushed it
      // to the back of a first-affordable-wins list and it was never bought at all.
      // v0.52 Part 2.3: the Tavern is deleted; the Bard's Hearth carries crowdRelief now.
      if (morale() < 115 && tryBuild("bardsHearth")) return;
      // housing whenever we are at the ceiling — and SAVE for it rather than
      // frittering the stock on whatever happens to be cheapest this tick
      if (S.pop >= maxPop() - 1) {
        if (tryBuild("longhouse")) return;
        if (tryBuild("skyrise")) return;
        if (tryBuild("shelter")) return;
      }
      // v0.44 Part 1: the amplifier pair and the Reactor tier are the whole point of
      // the round, and a first-affordable-wins bot never reaches a 200-Hexgear Foundry
      // because the Chembarrel at 160 alloy keeps eating the alloy the Hexgear needs.
      // A player building toward a global multiplier saves for it. Measured without
      // this: 0 Foundries and 0 Plants across a full run to Icathia.
      if (S.techs.hexcore) {
        if (tryBuild("hextechFoundry")) return;
        if (S.techs.hexdraulics && count("hextechFoundry") >= 3 && tryBuild("hexdraulicPlant")) return;
        if (S.techs.greyReclamation && tryBuild("arcaneReactor")) return;
      }
      // storage when something we need is pinned at its cap
      const c = caps();
      const pinned = r => S.res[r] >= c[r] - 1e-6;
      // v0.41 §2.1 moved the Knowledge ceiling off Tomes and onto buildings, so the
      // ceiling now costs 750 ore a copy. A greedy first-affordable-wins bot spends
      // every ore the moment it arrives and can therefore never save for one — measured:
      // ore sawtoothed between 100 and 250 against an 18,000 cap while the cap sat
      // frozen at 16,640 for 800 game-years. A player SAVES for the thing that unblocks
      // them. When knowledge is pinned, buy nothing but the ceiling.
      if (pinned("knowledge")) {
        if (tryBuild("hexLab")) return;
        if (tryBuild("observatory")) return;
        if (tryBuild("academy")) return;
        if (tryBuild("archive")) return;
        const ceiling = ["hexLab", "observatory", "academy", "archive"]
          .map(buildingByIdVisible).filter(Boolean);
        if (ceiling.length) return;   // save; do not fritter the stock on anything else
      }
      if (pinned("timber") || pinned("ore") || pinned("provisions") || pinned("gold") || pinned("mana")) {
        if (tryBuild("harbor")) return;
        if (tryBuild("warehouse")) return;
        if (tryBuild("storehouse")) return;
      }
      if (S.techs.ritesOfTargon && pinned("devotion")) {
        if (tryBuild("marus")) return;
        if (tryBuild("sanctum")) return;
      }
      if (pinned("culture") && tryBuild("bardsHearth")) return;
      if (S.techs.callToArms && pinned("renown") && tryBuild("hallOfHeroes")) return;

      // steady economic build-out, cheapest useful thing first
      const order = BUILD_ORDER;
      for (const id of order) {
        const b = buildingByIdVisible(id);
        if (!b) continue;
        if (count(id) >= 60) continue;
        if (tryBuild(id)) return;
      }
    }

    function manageResearch() {
      // cheapest affordable first
      const avail = TECHS.filter(t => !S.techs[t.id] && techVisible(t) && canAfford(discCost(t.cost)))
        .sort((a, b) => (a.cost.knowledge || 0) - (b.cost.knowledge || 0));
      if (avail.length) { buyTech(avail[0].id); return true; }
      return false;
    }
    function manageDiscoveries() {
      for (const u of UPGRADES) {
        if (S.upgrades[u.id]) continue;
        if (u.tech && !S.techs[u.tech]) continue;
        if (u.unlock && !u.unlock(S)) continue;
        if (canAfford(discCost(u.cost))) { buyUpgrade(u.id); return true; }
      }
      return false;
    }
    function managePolicies() {
      for (const g of POLICY_GROUPS) {
        if (!policyGroupOpen(g) || policyChoice(g.id)) continue;
        for (const o of g.options) if (canAfford(faithCost(o.cost))) { buyPolicy(o.id); return true; }
      }
      return false;
    }
    function manageWilds() {
      if (!S.techs.logistics) return;
      const avail = EXPEDITIONS.filter(e => {
        if (e.tech && !S.techs[e.tech]) return false;
        if (e.id === "scouting" && factionsFoundCount() >= FACTIONS.length) return false;
        if (campCooldownLeft(e) > 0) return false;
        return canAfford(expCost(e));
      });
      const LUX_OF = { wolves: "furs", gromp: "mushrooms", raptors: "plumes", krugs: null };
      // hold roughly an hour of demand in reserve; 0.002/s/wanderer x 3600
      const target = Math.max(120, 7.2 * S.pop);
      // charged camps first: an empowered haul is worth far more per unit of vigor.
      // Then SCARCEST luxury first. Before v0.40 the three luxury camps cost 40/60/100
      // vigor, so cheaper ones ran first and the rest spilled naturally. At a flat 100
      // each, plain list order let Wolves eat every point of vigor and the other two
      // ran dry 100% of the time — a harness artifact, not a game property. A player
      // managing morale hunts whatever they are short of.
      const scarcity = e => {
        const lux = LUX_OF[e.id];
        return lux ? Math.min(9, S.res[lux] / target) : 9;
      };
      avail.sort((a, b) => {
        const ca = (typeof isChargeCamp === "function" && isChargeCamp(a) && campCharges(a) > 0) ? 0 : 1;
        const cb = (typeof isChargeCamp === "function" && isChargeCamp(b) && campCharges(b) > 0) ? 0 : 1;
        if (ca !== cb) return ca - cb;
        return scarcity(a) - scarcity(b);
      });
      for (const e of avail) {
        if (campCooldownLeft(e) > 0) continue;
        const c = expCost(e);
        if (!canAfford(c)) continue;
        if (typeof isChargeCamp === "function" && isChargeCamp(e)) {
          const lux = LUX_OF[e.id];
          const charged = campCharges(e) > 0;
          // skip a routine hunt when already well stocked; never skip an empowered one
          // stop entirely when massively overstocked — even an empowered haul is
          // not worth the vigor if you are sitting on ten hours of the stuff
          if (lux && S.res[lux] > target * 2) continue;
          if (!charged && lux && S.res[lux] > target) continue;
          if (!lux && S.res.ore > computeCaps().ore * 0.75) continue;
        }
        const vBefore = S.res.vigor;
        runExpedition(e.id); mark("firstExpedition");
        campRuns[e.id] = (campRuns[e.id] || 0) + 1;
        const spent = vBefore - S.res.vigor;
        if (typeof isChargeCamp === "function" && isChargeCamp(e)) vigorOnLuxury += spent;
        vigorSpent += spent;
      }
    }
    function manageTrade() {
      if (!S.techs.trade) return;
      // v0.41 routes charge bulk RAW materials (Demacia 600 timber, Freljord 500 ore),
      // which are the same materials housing and storage want. A player trades their
      // SURPLUS, not their entire stock — without this rule the bot trades itself into
      // permanent poverty and nothing downstream is measurable.
      const c2 = caps();
      const surplus = cost => Object.keys(cost).every(r => {
        if (r === "vigor") return true;
        const cap = c2[r];
        if (cap === undefined) return S.res[r] >= cost[r] * 2;   // uncapped: keep a buffer
        return S.res[r] >= cost[r] && S.res[r] >= cap * 0.6;
      });
      for (const f of FACTIONS) {
        if (!tradeOpen(f.id)) continue;
        // v0.54 directive 10: merchant fatigue is deleted, so there is no weariness to wait
        // out and the bot no longer sits on a route it can afford.
        // v0.46 Part 3: trades now cost gold AND vigor, and tradeCost() applies the two
        // subtractive discounts. Reading f.cost here would let the bot attempt trades it
        // cannot pay for and under-count the gate's effect.
        // tradeCost() only exists from v0.46; isolation builds cut from earlier
        // versions do not have it, and the sim must still run against them.
        const tc = (typeof tradeCost === "function") ? tradeCost(f) : f.cost;
        // v0.53 Part 6: vigor spend has to be split by CAUSE. Expeditions were already
        // counted (vigorSpent, above); trade was not, so "the cheapest early sink" could
        // not be checked against the +75% route-vigor rise the spec attributes it to.
        if (canAfford(tc) && surplus(tc)) {
          const vB = S.res.vigor;
          tradeCaravan(f.id); tradeCount++; mark("firstTrade");
          vigorOnTrade += Math.max(0, vB - S.res.vigor);
        }
      }
      // v0.41: embassies are the primary culture sink and the slot ladder runs to 15,
      // so a player who cares about a chain keeps buying past the old cap of 9.
      for (const f of FACTIONS) {
        if (!tradeOpen(f.id)) continue;
        if (caravanCount(f.id) >= 20) continue;
        if (canAfford(caravanCost(f.id))) { buildCaravan(f.id); return; }
      }
    }
    function manageCrafts() {
      if (S.res.mana > caps().mana * 0.8) transmuteMana(5);
      const p = CRAFTS.find(c => c.id === "parchment");
      if (p && p.show(S) && S.res.furs > craftCostOf("parchment").furs * 1.5 && canAfford(craftCostOf("parchment"))) craftItem("parchment", 2);
      const t = CRAFTS.find(c => c.id === "tome");
      if (t && t.show(S) && canAfford(craftCostOf("tome"))) craftItem("tome", 1);
      const g = CRAFTS.find(c => c.id === "gear");
      if (g && g.show(S) && canAfford(craftCostOf("gear")) && S.res.steel > craftCostOf("gear").steel * 2) craftItem("gear", 1);
      const sl = CRAFTS.find(c => c.id === "stoneSlab");
      if (sl && sl.show(S) && canAfford(craftCostOf("stoneSlab")) && S.res.ore > craftCostOf("stoneSlab").ore * 1.5) craftItem("stoneSlab", 1);
      // v0.39 §5 routes storage through crafted goods, so the player must actually
      // keep a stock of intermediates. Craft any intermediate a visible building
      // needs and we are short of, cheapest-first.
      const wantIntermediate = {};
      const wantFrom = c => {
        for (const r in c) if (RES[r] && (RES[r].kind === "made" || RES[r].kind === "craft")) {
          wantIntermediate[r] = Math.max(wantIntermediate[r] || 0, c[r]);
        }
      };
      // Only chase intermediates for a building we are actually CLOSE to buying. The
      // Warehouse's crafted cost escalates at 1.15, so by copy #24 it wants 199 Stone
      // Slabs = 39,800 ore, and a bot that chases it converts every ore it will ever
      // mine into slabs it can never finish. Measured: ore sat at ~130 against an
      // 18,000 ceiling for 900 game-years, which is why the Tavern at 800 ore was never
      // once affordable. A player crafts toward the thing in front of them.
      BUILDINGS.forEach(b => {
        if (!buildingVisible(b)) return;
        const c = buildingCost(b);
        const rawAffordable = Object.keys(c).every(r => {
          const craftable = RES[r] && (RES[r].kind === "made" || RES[r].kind === "craft");
          return craftable || S.res[r] >= c[r];
        });
        if (rawAffordable) wantFrom(c);
      });
      // Techs and upgrades also demand crafted goods (Deep Works wants 5 Hextech
      // Cores, Scholarship IV/V want Tomes), and those are the deepest chains in
      // the game — without this the bot never drives Era 3 to its end.
      TECHS.forEach(t => { if (!S.techs[t.id] && techVisible(t)) wantFrom(t.cost); });
      UPGRADES.forEach(u => {
        if (S.upgrades[u.id]) return;
        if (u.tech && !S.techs[u.tech]) return;
        wantFrom(u.cost);
      });
      // Deepest-first: a Hextech Core is worthless if nobody machines the Hexgear.
      const depth = id => {
        const rec = CRAFTS.find(c => c.out === id);
        if (!rec) return 0;
        let d = 0;
        for (const r in rec.cost) if (CRAFTS.some(c => c.out === r)) d = Math.max(d, 1 + depth(r));
        return d;
      };
      // ======================================================================
      // v0.53 Part 1.3 — THE HEXGEAR STARVATION, and why it was not a price problem.
      //
      // Measured on v0.52: seenMax.hexgear peaks at 50.96 across 1,100 game-years while
      // seenMax.hexcore reaches 610 and seenMax.scaffold reaches 30,320. The Hextech
      // Foundry's first copy costs hexgear 200, so it was visible from y627.7 and
      // unaffordable forever — 0 Foundries, 0 Hexdraulic Plants, 0 Chembarrels at every
      // milestone in every run this project has ever measured.
      //
      // The cause is not the Foundry's price. It is that `wantIntermediate` records only
      // the demand of the thing being BOUGHT, never the demand that thing's own recipe
      // creates further down the chain. The Foundry wants 200 hexgear; a hexgear costs
      // 25 alloy; nothing in this function ever asked for 5,000 alloy. Alloy's want
      // topped out at the Chembarrel's 160, alloy stopped being crafted the moment it
      // reached 160, and hexgear could therefore never be machined in quantity. Combined
      // with deepest-first ordering — hexcore (depth 2) is crafted before hexgear
      // (depth 1) — every hexgear made was consumed into the deeper chain in the same
      // pass and the STOCK never accumulated.
      //
      // WHICH FIX, AND WHY (the spec's Part 1.3 asks for this explicitly):
      //
      //  * The spec's option (b), "reserve wantIntermediate[r] from consumption by
      //    deeper crafts", DEADLOCKS and was rejected after tracing it: hexgear needs
      //    alloy 25, alloy's want is 160, so hexgear may only be machined once alloy
      //    exceeds 185 — but alloy STOPS being crafted at 160 because it has reached its
      //    own want. Alloy then sits between 160 and 185 forever and the chain never
      //    moves. A reservation without demand propagation is a deadlock, not a fix.
      //
      //  * The spec's option (a), raising the batch ceiling when the shortfall exceeds
      //    it, is SHIPPED (see the batch line below) — but it cannot fix this on its own
      //    either, because the shortfall it reads is against a want that was never
      //    raised in the first place.
      //
      //  * So the actual fix is the missing step both options presuppose: PROPAGATE
      //    DEMAND DOWN THE CRAFT TREE. For every wanted output, ask what its recipe
      //    needs to close the shortfall and want that too, deepest-first so a want
      //    propagates all the way to the shallowest craft in one pass. This is what a
      //    player does — "the Foundry wants 200 Hexgear, so I need five thousand Alloy"
      //    — and it is the same reasoning v0.39 §5 used when it routed storage through
      //    crafted goods in the first place. Raw inputs are untouched: propagation stops
      //    at anything no recipe makes, and the "never spend more than half of any raw
      //    input in one go" guard below still holds, so this cannot starve the ore and
      //    timber that housing and storage need.
      // ======================================================================
      const craftDepth = {};
      CRAFTS.forEach(c => { craftDepth[c.out] = depth(c.out); });
      const propagationOrder = Object.keys(craftDepth).sort((a, b) => craftDepth[b] - craftDepth[a]);
      for (const r of propagationOrder) {
        const want = wantIntermediate[r];
        if (want === undefined) continue;
        const need = want - (S.res[r] || 0);
        if (need <= 0) continue;
        const rec = CRAFTS.find(c => c.out === r && c.show(S));
        if (!rec || rec.id === "poroTears") continue;   // its input is a live herd, see managePoroSacrifice
        const actions = Math.ceil(need / (craftYield(rec.id) || 1));
        for (const inp in rec.cost) {
          if (!RES[inp] || (RES[inp].kind !== "made" && RES[inp].kind !== "craft")) continue;
          wantIntermediate[inp] = Math.max(wantIntermediate[inp] || 0,
                                           (S.res[inp] || 0) + rec.cost[inp] * actions);
        }
      }
      const wanted = Object.keys(wantIntermediate).sort((a, b) => depth(b) - depth(a));
      for (const r of wanted) {
        if (S.res[r] >= wantIntermediate[r]) continue;
        const rec = CRAFTS.find(c => c.out === r && c.show(S));
        // v0.53 Part 1.2: the literal `poroTears` skip STAYS here and is now justified
        // rather than unexplained — its input is a live population, not a stock, so it
        // does not belong in a deepest-first stock-chasing loop. It is handled by
        // managePoroSacrifice(), a dedicated call beside manageTargon()'s Ascent.
        if (!rec || rec.id === "poroTears") continue;
        if (rec.id === "parchment" && S.res.furs < craftCostOf("parchment").furs * 1.5) continue;
        const cst = craftCostOf(rec.id);
        if (!canAfford(cst)) continue;
        // Batch, or the 60,000-Zaun-Ore chains never finish inside a run — but never
        // spend more than half of any raw input in one go. A Stone Slab is 200 ore and
        // 25 of them is 5,000; unbounded batching starves the ore that housing, storage
        // and the Observatory all need.
        const short = Math.ceil(wantIntermediate[r] - S.res[r]);
        // v0.53 Part 1.3, the spec's option (a), shipped as specified: the ceiling of 25
        // is lifted for an intermediate whose OWN shortfall exceeds it. Without this the
        // propagated 5,000-alloy want would be served 25 at a time and take a thousand
        // decision passes to fill. The half-of-any-raw-input guard below is what actually
        // bounds the spend, and it is unchanged.
        const BATCH_CEILING = 25;
        let batch = Math.max(1, short > BATCH_CEILING ? short : Math.min(BATCH_CEILING, short));
        for (const inp in cst) {
          if (!cst[inp]) continue;
          batch = Math.min(batch, Math.max(1, Math.floor(S.res[inp] * 0.5 / cst[inp])));
        }
        craftItem(rec.id, batch);
      }
    }
    // ========================================================================
    // v0.53 Part 1.2 — THE PORO SACRIFICE, which no measured run of this project has
    // ever performed.
    //
    // `manageCrafts()` carried a literal `if (rec.id === "poroTears") continue;`. It is
    // correct that the sacrifice does not belong in that loop — its input is a live
    // population that regrows, not a stock that is mined — but nothing anywhere else
    // performed it, so `poroTears` was 0 for the whole run. The shipped v0.52 run builds
    // 17 Watcher's Eyes and 0 Tears, which makes `frostguardCairn` (trueice 30 +
    // poroTears 5) unbuildable, and with it `avarosanHold`, `iceWroughtSpire` and
    // `frozenWatcher` — THE ENTIRE poroRatio CATEGORY. That category is the one BUILD
    // REPORT v0.52 §13.1 and HANDOFF §7.1 both asked the analyzer to rule on. It has
    // never been built.
    //
    // Shape: a dedicated call beside manageTargon()'s Ascent, exactly as the spec asks.
    // Policy: sacrifice only from SURPLUS. The herd is the faucet, so the threshold is
    // the spec's — poros >= PORO_SACRIFICE_COST x count("watchersEye") — and never more
    // than half the herd in one pass, which is the same discipline the craft loop applies
    // to every raw input. One action costs 60 poros and yields one Tear per Eye owned
    // (craftYield's ziggurat gainMultiplier), so the Eye count is the lever, not the cost.
    // ========================================================================
    function managePoroSacrifice() {
      const eyes = count("watchersEye");
      if (eyes <= 0) return;
      const rec = CRAFTS.find(c => c.id === "poroTears");
      if (!rec || !rec.show(S)) return;
      // "and a visible building wants Tears" — techs count too: The Watchers Below
      // costs poroTears 40, and it gates the Ward.
      let want = 0;
      BUILDINGS.forEach(b => {
        if (!buildingVisible(b)) return;
        const c = buildingCost(b);
        if (c.poroTears) want = Math.max(want, c.poroTears);
      });
      TECHS.forEach(t => {
        if (S.techs[t.id] || !techVisible(t)) return;
        const c = discCost(t.cost);
        if (c.poroTears) want = Math.max(want, c.poroTears);
      });
      if (want <= 0) return;
      if ((S.res.poroTears || 0) >= want) return;
      if (S.res.poros < PORO_SACRIFICE_COST * eyes) return;      // surplus only; keep the herd
      const short = want - (S.res.poroTears || 0);
      let actions = Math.max(1, Math.ceil(short / eyes));
      actions = Math.min(actions, Math.floor(S.res.poros * 0.5 / PORO_SACRIFICE_COST));
      if (actions >= 1) craftItem("poroTears", actions);
    }
    function manageTargon() {
      if (!S.techs.ritesOfTargon) return;
      if (S.res.devotion >= caps().devotion * 0.9 && Math.floor(S.res.devotion) >= 5) {
        ascendTargon();
        mark("firstAscent");
      }
      for (const w of WTECHS) {
        if (S.wtechs[w.id]) continue;
        if ((S.worship || 0) < w.threshold) continue;
        if (canAfford(faithCost(w.cost))) buyWtech(w.id);
      }
    }
    function manageChampions() {
      if (!S.techs.callToArms) return;
      for (const d of CHAMPS) {
        if (S.champs[d.id] && S.champs[d.id].r) continue;
        if (canAfford(recruitCost(d.id))) { recruitChamp(d.id); mark("firstChampion"); return; }
      }
      if (!S.leader) {
        const owned = CHAMPS.filter(d => S.champs[d.id] && S.champs[d.id].r);
        if (owned.length) makeLeader(owned[0].id);
      }
      // v0.43: levelling now needs the XP threshold as well as the materials, and a
      // player rotates leadership so the champion they are levelling actually earns it.
      for (const d of CHAMPS) {
        const c = S.champs[d.id];
        if (!c || !c.r) continue;
        if (canTrain(d.id) && S.res.renown > recruitCost(d.id).renown * 0.5) { trainChamp(d.id); return; }
      }
      // lead whoever is closest to their next threshold — leading is 15x bench XP
      const owned2 = CHAMPS.filter(d => S.champs[d.id] && S.champs[d.id].r);
      if (owned2.length) {
        let best = null, bestGap = Infinity;
        for (const d of owned2) {
          const lvl = champLevel(d.id);
          if (lvl >= 10) continue;
          const gap = xpTotalFor(lvl + 1) - champXp(d.id);
          if (gap > 0 && gap < bestGap) { bestGap = gap; best = d.id; }
        }
        if (best && best !== S.leader) makeLeader(best);
      }
    }

    function countObjectives() {
      let buyable = 0, visible = 0;
      TECHS.forEach(t => {
        if (S.techs[t.id] || !techVisible(t)) return;
        canAfford(discCost(t.cost)) ? buyable++ : visible++;
      });
      UPGRADES.forEach(u => {
        if (S.upgrades[u.id]) return;
        if (u.tech && !S.techs[u.tech]) return;
        if (u.unlock && !u.unlock(S)) return;
        canAfford(discCost(u.cost)) ? buyable++ : visible++;
      });
      BUILDINGS.forEach(b => {
        if (count(b.id) > 0 || !buildingVisible(b)) return;
        canAfford(buildingCost(b)) ? buyable++ : visible++;
      });
      WTECHS.forEach(w => {
        if (S.wtechs[w.id]) return;
        if ((S.worship || 0) < w.threshold) return;
        canAfford(faithCost(w.cost)) ? buyable++ : visible++;
      });
      CHAMPS.forEach(d => {
        if (S.champs[d.id] && S.champs[d.id].r) return;
        if (!S.techs.callToArms) return;
        canAfford(d.cost) ? buyable++ : visible++;
      });
      POLICY_GROUPS.forEach(g => {
        if (!policyGroupOpen(g) || policyChoice(g.id)) return;
        g.options.forEach(o => { canAfford(faithCost(o.cost)) ? buyable++ : visible++; });
      });
      return { buyable, visible, total: buyable + visible };
    }

    // ---------- main loop ----------
    const DECIDE_EVERY = 25;                  // 5 game-seconds
    const SAMPLE_EVERY = TICKS_PER_YEAR / 2;  // twice a game-year
    let starved = 0;

    for (let i = 0; i < totalTicks; i++) {
      // bootstrap: the only manual faucet before Mana Wells exist
      if (S.pop === 0 && count("manaWell") < 2) channelMana();

      const vBeforeTick = S.res.vigor;
      tick();
      if (S.res.vigor > vBeforeTick) vigorEarned += S.res.vigor - vBeforeTick;
      simNow += TICK_MS;

      if (i % DECIDE_EVERY === 0) {
        manageJobs();
        manageBuildings();
        manageResearch();
        manageDiscoveries();
        manageCrafts();
        // random-event banners a real player clicks
        if (S.jackActive && typeof clickJack === "function") clickJack();
        if (S.honeyActive && typeof clickHoney === "function") clickHoney();
        if (S.scuttlerActive && typeof clickScuttler === "function") clickScuttler();
        manageWilds();
        // a player holds a festival when comfort is thin and they can spare the stew
        if (typeof festivalUnlocked === "function" && festivalUnlocked() && !festivalActive()) {
          const c = luxuryComfort();
          const thin = ["furs", "mushrooms", "plumes"].some(r => S.res[r] < c);
          if (thin && canAfford(festivalCost())) holdFestival();
        }
        manageTrade();
        manageTargon();
        managePoroSacrifice();          // v0.53 Part 1.2
        manageChampions();
        managePolicies();

        if (S.techs.ritesOfTargon) mark("ritesOfTargon");
        if (S.techs.callToArms) mark("callToArms");
        if (S.techs.voidStudies) mark("voidStudies");
        if (S.techs.sparks) mark("sparks");
        if (S.techs.chemtech) mark("chemtech");
        if (S.techs.hexcore) mark("hexcore");
        if (S.techs.deepWorks) mark("deepWorks");
        if (S.techs.icathia) mark("icathia");
        // v0.50 Part 2.3: both of these are ZERO in every build ever measured — the tech
        // was unresearchable and the building behind it unreachable. First round they can fire.
        if (S.techs.gloriousEvolution) mark("gloriousEvolution");
        if (count("augmentChamber") > 0) mark("firstAugmentChamber");
        if ((S.res.hexcore || 0) >= 1) mark("firstHexcore");
        if (S.pop >= 75) mark("pop75");
        if (S.pop >= 130) mark("pop130");
        if ((S.ascends || 0) >= 1) mark("firstAscent");
      }

      tickCount++;
      if (computeCaps().vigor > 0 && S.res.vigor >= computeCaps().vigor * 0.999) vigorAtCapTicks++;
      // v0.52 Part 3.1 — is the crystal line producing into a full bucket?
      if (computeCaps().crystals > 0 && S.res.crystals >= computeCaps().crystals * 0.999) crystalsAtCapTicks++;
      // v0.46 Part 8: the first four minutes of the game, which nobody has ever measured
      if (buildingVisible(BUILDINGS.find(b => b.id === "shelter"))) markVis("shelter");
      if (buildingVisible(BUILDINGS.find(b => b.id === "archive"))) markVis("archive");
      const craftTab = TABS.find(t => t.id === "crafting");
      if (!craftTab.show || craftTab.show(S)) markVis("craftingTab");
      const loreJob = JOBS.find(j => j.id === "loremaster");
      if (!loreJob.unlock || loreJob.unlock(S)) markVis("loremaster");
      if (count("shelter") > 0) markVis("firstShelterBuilt");
      if (count("archive") > 0) markVis("firstArchiveBuilt");

      // v0.53 Part 6: the early vigor economy, measured at the two years the spec names.
      // Cumulative income and cumulative spend split expeditions/trade, so the ratio is
      // readable rather than inferred from a rate at one instant.
      if (vigorSplit.y50 === undefined && yearNow() >= 50) {
        vigorSplit.y50 = { year: 50, earned: +vigorEarned.toFixed(1), onExpeditions: +vigorSpent.toFixed(1),
                           onTrade: +vigorOnTrade.toFixed(1), ratePerSec: +computeRates().vigor.toFixed(4),
                           perGameYear: +(computeRates().vigor * 800).toFixed(1),
                           cheapestRouteVigor: Math.min.apply(null, FACTIONS.map(f =>
                             ((typeof tradeCost === "function" ? tradeCost(f) : f.cost).vigor) || 0)) };
      }
      if (vigorSplit.y100 === undefined && yearNow() >= 100) {
        vigorSplit.y100 = { year: 100, earned: +vigorEarned.toFixed(1), onExpeditions: +vigorSpent.toFixed(1),
                            onTrade: +vigorOnTrade.toFixed(1), ratePerSec: +computeRates().vigor.toFixed(4),
                            perGameYear: +(computeRates().vigor * 800).toFixed(1),
                            cheapestRouteVigor: Math.min.apply(null, FACTIONS.map(f =>
                              ((typeof tradeCost === "function" ? tradeCost(f) : f.cost).vigor) || 0)) };
      }
      // v0.53 Part 4.3: "the new craft's stock does not monotonically increase after
      // Icathia" is a SERIES question, so the series has to exist. Sampled yearly with
      // the crystal and Void Essence stocks beside it, because Part 2 asks the same
      // question of crystals in a different sentence.
      if (i % TICKS_PER_YEAR === 0) {
        const row = { year: +yearNow().toFixed(0), crystals: +(S.res.crystals || 0).toFixed(1),
                      voidessence: +(S.res.voidessence || 0).toFixed(2) };
        CRAFTS.forEach(c => { if (c.tier5) row[c.out] = +(S.res[c.out] || 0).toFixed(2); });
        stockSeries.push(row);
      }

      if (i % SAMPLE_EVERY === 0) {
        const o = countObjectives();
        samples.push({
          year: +yearNow().toFixed(1),
          buyable: o.buyable, visible: o.visible, total: o.total,
          pop: S.pop,
          morale: morale(),
          bardsHearths: count("bardsHearth"),
          shrines: count("shrine"),
          sunAltar: !!(S.wtechs && S.wtechs.sunAltar),
          fursFlow: +computeRates().furs.toFixed(4),
          furs: +S.res.furs.toFixed(1),
          mushrooms: +S.res.mushrooms.toFixed(1),
          plumes: +S.res.plumes.toFixed(1),
          knowledge: Math.round(S.res.knowledge),
          knowledgeCap: Math.round(caps().knowledge),
          gold: Math.round(S.res.gold),
          devotion: Math.round(S.res.devotion),
          worship: Math.round(S.worship || 0),
          comfort: Math.round(luxuryComfort()),
          worshipBonus: +(worshipBonus() * 100).toFixed(2)
        });
        popSeries.push(S.pop);
      }
    }

    return {
      years, seed,
      milestones,
      snaps,
      samples,
      campRuns,
      trades: { total: tradeCount, atMilestone: tradeMarks },
      firstVisible,
      // ---- v0.53 instrumentation, returned so the report can quote it rather than infer it ----
      // Part 1.1: the enumeration `test-v53` subtracts. Exported from the run rather than
      // re-parsed out of the source, so the assertion reads the list the bot actually used.
      buildOrder: BUILD_ORDER.slice(),
      dedicatedRoutines: DEDICATED_ROUTINES.slice(),
      unreachableBuildings: BUILDINGS.map(b => b.id)
        .filter(id => BUILD_ORDER.indexOf(id) < 0 && DEDICATED_ROUTINES.indexOf(id) < 0),
      spend: spendTotal,                 // Part 2.2, Part 4.3
      spendAtMilestone: spendMarks,
      vigorSplit,                        // Part 6
      stockSeries,                       // Part 4.3 monotonicity, Part 2 crystal accumulation
      seenMaxFinal: Object.fromEntries(Object.keys(RES).map(r => [r, seenMaxOf(r)])),
      vigorAtCapPct: +(100 * vigorAtCapTicks / (tickCount || 1)).toFixed(1),
      crystalsAtCapPct: +(100 * crystalsAtCapTicks / (tickCount || 1)).toFixed(1),
      vigor: { onLuxuryCamps: Math.round(vigorOnLuxury), onAllCamps: Math.round(vigorSpent), earned: Math.round(vigorEarned) },
      peakPop: popSeries.length ? Math.max.apply(null, popSeries) : S.pop,
      final: {
        pop: S.pop, maxPop: maxPop(), morale: morale(), bardsHearths: count("bardsHearth"),
        quarries: count("quarry"),
        campYieldMult: +campYieldMult().toFixed(2),
        luxCampYieldMult: +campYieldMult(true).toFixed(2),
        comfort: Math.round(luxuryComfort()),
        worshipBonusPct: +(worshipBonus() * 100).toFixed(2),
        vigorPerSec: +computeRates().vigor.toFixed(2),
        techs: Object.keys(S.techs).length,
        upgrades: Object.keys(S.upgrades).length,
        ascends: S.ascends || 0,
        worship: Math.round(S.worship || 0),
        champions: CHAMPS.filter(d => S.champs[d.id] && S.champs[d.id].r).length,
        policies: Object.keys(S.policies || {}).length,
        caravans: FACTIONS.reduce((a, f) => a + caravanCount(f.id), 0),
        buildings: BUILDINGS.reduce((a, b) => a + count(b.id), 0),
        buildingCount: BUILDINGS.length
      }
    };
  }, { years, seed });
}
