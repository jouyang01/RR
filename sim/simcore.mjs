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
        e.sum += 1 + rankOf(w).bonus; e.n++;
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
        science: (() => {
          const counts = { archive: count("archive"), academy: count("academy"),
                           observatory: count("observatory"), hexLab: count("hexLab") };
          let sigma = 0;
          for (const id in counts) {
            const b = BUILDINGS.find(x => x.id === id);
            if (b && b.boost && b.boost.knowledge) sigma += b.boost.knowledge * counts[id];
          }
          // delivered = what a Loremaster's output is actually multiplied by
          const saveJobs = S.jobs, savePop = S.pop, saveB = S.buildings;
          S.jobs = { loremaster: 20 }; S.pop = Math.max(20, S.pop);
          const withB = computeRates().knowledge;
          S.buildings = {};
          const bareB = computeRates().knowledge;
          S.buildings = saveB; S.jobs = saveJobs; S.pop = savePop;
          return { counts, sigma: +sigma.toFixed(3), kittensWouldGive: +(1 + sigma).toFixed(3),
                   delivered: bareB > 0 ? +(withB / bareB).toFixed(4) : null };
        })(),
        // Part 1.2: the Irrigation Channel replaces the Farmstead's boost
        irrigation: count("irrigation"), farmsteads: count("farmstead"),
        provisionsPerSec: +computeRates().provisions.toFixed(3),
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
      if (k === "sparks" || k === "icathia" || k === "hexcore") snaps[k] = snapshot();
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
      const order = ["manaWell", "farmstead", "archive", "lumberMill", "mine", "academy",
        "bardsHearth", "storehouse", "forge", "shrine", "observatory", "workshop",
        "tradeDock", "hunterLodge", "sanctum", "trainingGround", "warehouse",
        "refinery", "marus", "hexLab", "sumpMine", "coalgasVent", "hexQuarry",
        // v0.52 Part 1.2: the Irrigation Channel; Part 3.2: the SHIMMER REFINERY, which
        // was never in this list at all — the reason its measured count was 0 at every
        // milestone in every prior round is that the bot never considered it, NOT that it
        // was overpriced. Apparatus defect, reported in BUILD REPORT v0.52 §3.2.
        "irrigation", "shimmerRefinery",
        "hextechFoundry", "hexdraulicPlant", "arcaneReactor", "chembarrel",
        "piltoverSpire", "vault", "watchersEye",
        "frostguardCairn", "avarosanHold", "iceWroughtSpire", "frozenWatcher",
        "quarry", "augmentChamber", "hexgateBuilding", "wardOfWatchers"];
        // v0.52 Part 2.3/2.4: "tavern" and "bloomery" removed — both buildings deleted.
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
        if (fatigueMult(f.id) < 0.6) continue;               // wait out weariness
        // v0.46 Part 3: trades now cost gold AND vigor, and tradeCost() applies the two
        // subtractive discounts. Reading f.cost here would let the bot attempt trades it
        // cannot pay for and under-count the gate's effect.
        // tradeCost() only exists from v0.46; isolation builds cut from earlier
        // versions do not have it, and the sim must still run against them.
        const tc = (typeof tradeCost === "function") ? tradeCost(f) : f.cost;
        if (canAfford(tc) && surplus(tc)) { tradeCaravan(f.id); tradeCount++; mark("firstTrade"); }
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
      const wanted = Object.keys(wantIntermediate).sort((a, b) => depth(b) - depth(a));
      for (const r of wanted) {
        if (S.res[r] >= wantIntermediate[r]) continue;
        const rec = CRAFTS.find(c => c.out === r && c.show(S));
        if (!rec || rec.id === "poroTears") continue;
        if (rec.id === "parchment" && S.res.furs < craftCostOf("parchment").furs * 1.5) continue;
        const cst = craftCostOf(rec.id);
        if (!canAfford(cst)) continue;
        // Batch, or the 60,000-Zaun-Ore chains never finish inside a run — but never
        // spend more than half of any raw input in one go. A Stone Slab is 200 ore and
        // 25 of them is 5,000; unbounded batching starves the ore that housing, storage
        // and the Observatory all need.
        const short = Math.ceil(wantIntermediate[r] - S.res[r]);
        let batch = Math.max(1, Math.min(25, short));
        for (const inp in cst) {
          if (!cst[inp]) continue;
          batch = Math.min(batch, Math.max(1, Math.floor(S.res[inp] * 0.5 / cst[inp])));
        }
        craftItem(rec.id, batch);
      }
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
        buildings: BUILDINGS.reduce((a, b) => a + count(b.id), 0)
      }
    };
  }, { years, seed });
}
