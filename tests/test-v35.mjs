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

// ============ LUXURIES & MORALE REMOVED FROM THE WANDERERS TAB ============
const stripped = await page.evaluate(() => {
  S.techs = { almanac: 1, logistics: 1, masquerade: 1 };
  S.pop = 12; syncRoster();
  S.res.mushrooms = 20; S.res.furs = 20; S.res.poros = 40; S.jackboxes = 3;
  S.buildings.shelter = Math.max(1, S.buildings.shelter || 0); S.upgrades.keepingTheRolls = true; S.activeTab = "village"; uiDirty = true; renderAll();
  const txt = document.getElementById("tab-content").textContent;
  return {
    noPanel: !txt.includes("Luxuries"),
    noMoraleWord: !/Morale/i.test(txt),
    noLuxLines: !txt.includes("Gromp's mushrooms") && !txt.includes("Jack in the Box"),
    jobsStillThere: txt.includes("Farmer") && document.querySelectorAll("[data-job]").length > 0,
    // the global morale readout and its breakdown tooltip still live in the top bar
    topBarMorale: !!document.getElementById("morale-stat"),
    moraleFnIntact: typeof morale === "function" && typeof luxuryTypes === "function"
  };
});
check("Luxuries & Morale panel gone from the Wanderers tab", stripped.noPanel && stripped.noLuxLines);
check("no Morale readout left on the tab", stripped.noMoraleWord);
check("job assignment controls untouched", stripped.jobsStillThere);
check("morale still shown (and explained) in the top bar", stripped.topBarMorale && stripped.moraleFnIntact);

// ============ CENSUS: roster mirrors pop and jobs ============
const roster = await page.evaluate(() => {
  const o = {};
  S.pop = 0; S.jobs = {}; S.wanderers = []; syncRoster();
  o.emptyAtZero = S.wanderers.length === 0;
  S.pop = 10; syncRoster();
  o.grows = S.wanderers.length === 10;
  o.allIdle = S.wanderers.every(w => w.j === null);
  o.haveNames = S.wanderers.every(w => typeof w.nm === "string" && w.nm.length > 0);
  o.haveTraits = S.wanderers.every(w => TRAITS.some(t => t.id === w.t));
  // assigning a job claims specific people
  S.techs.logistics = true;
  assignJob("farmer", 1); assignJob("farmer", 1); assignJob("woodcutter", 1);
  o.assigned = S.wanderers.filter(w => w.j === "farmer").length === 2 && S.wanderers.filter(w => w.j === "woodcutter").length === 1;
  o.matchesCounts = JOBS.every(j => S.wanderers.filter(w => w.j === j.id).length === (S.jobs[j.id] || 0));
  // unassigning frees them
  assignJob("farmer", -1);
  o.unassigned = S.wanderers.filter(w => w.j === "farmer").length === 1;
  // shrinking population removes the idle first
  const workerNames = S.wanderers.filter(w => w.j).map(w => w.nm);
  S.pop = 2; syncRoster();
  o.idleLeaveFirst = S.wanderers.length === 2 && S.wanderers.every(w => workerNames.includes(w.nm));
  S.pop = 0; S.jobs = {}; syncRoster();
  return o;
});
check("roster empty at zero population, grows with it", roster.emptyAtZero && roster.grows);
check("every Wanderer has a name and a trait", roster.haveNames && roster.haveTraits);
check("assigning a job claims specific Wanderers; counts stay in sync", roster.assigned && roster.matchesCounts && roster.unassigned);
check("when population falls, the unassigned leave first", roster.idleLeaveFirst);

// ============ RANKS ============
const ranks = await page.evaluate(() => {
  const o = {};
  o.nine = RANKS.length;
  o.names = RANKS.map(r => r.name);
  o.topIsChallenger = RANKS[RANKS.length - 1].id === "challenger";
  o.thresholds = RANKS.map(r => r.xp);
  o.bonuses = RANKS.map(r => r.bonus);
  o.monotonic = RANKS.every((r, i) => i === 0 || (r.xp > RANKS[i - 1].xp && r.bonus > RANKS[i - 1].bonus));
  o.endpointPreserved = RANKS[RANKS.length - 1].bonus === 0.1875;   // Kittens' real top-tier value
  // v0.54 directive 8 RE-POINT: rank is per TRADE. rankOf/rankProgress read w.jx[job], so a
  // probe has to name the job it is asking about. The thresholds and the curve are unchanged
  // — only which number they are read from moved.
  const at = xp => rankOf({ j: "farmer", jx: { farmer: xp } }).id;
  o.boundaries = [at(0), at(99), at(100), at(11499), at(18200), at(1e9)];
  const prog = xp => rankProgress({ j: "farmer", jx: { farmer: xp } });
  o.progressMid = Math.abs(prog(225) - 0.5) < 0.01;                  // halfway Silver→Gold
  o.progressTop = prog(1e9) === 1;
  // ...and the point of the directive: the SAME wanderer holds different ranks in different
  // trades, and only the one they are working counts.
  const w2 = { nm: "X", j: "miner", jx: { miner: 18200, jungler: 50 }, t: "none" };
  o.perJob = rankOf(w2, "miner").id === "challenger" && rankOf(w2, "jungler").id === "bronze" &&
             rankOf(w2).id === "challenger";                          // defaults to their trade
  o.movingResets = (function () { var m = { nm: "Y", j: "jungler", jx: { miner: 18200 }, t: "none" };
                                  return rankOf(m).id === "bronze"; })();
  return o;
});
check("nine League-rank tiers, Bronze → Challenger", ranks.nine === 9 && ranks.topIsChallenger && ranks.names[0] === "Bronze", ranks.names.join(" → "));
check("thresholds and bonuses both climb monotonically", ranks.monotonic, JSON.stringify(ranks.thresholds));
check("top tier preserves Kittens' real 18.75% endpoint", ranks.endpointPreserved);
// RE-POINTED v0.58.1, superseded by NOTE 11: "The amount of exp it takes wanderers to go from
// Master -> Grandmaster should double. The amount of exp it takes from grandmaster ->
// challenger should also double." The GAPS double, so Grandmaster 7,500 -> 10,200 and
// Challenger 18,200 -> 18,200 while Bronze through Master are untouched. Every fixture here
// that pinned an XP figure at or above Grandmaster resolves one rank lower now, which is the
// change working; the RESOLUTION LOGIC this block guards is unchanged.
// RE-POINTED v0.58.1, superseded by NOTE 11 (the top two rungs of the ladder double:
// Grandmaster 7,500 -> 10,200, Challenger 11,500 -> 18,200). Every fixture in this block that
// pinned an XP figure at or above Grandmaster now resolves one rank lower, which is the change
// working. The RESOLUTION LOGIC these assertions guard — per-trade banks, only the worked trade
// counting, ranks averaging rather than stacking — is untouched, so only the fixtures move.
check("rank boundaries resolve correctly (v0.58.1 note 11: the top two rungs doubled)", JSON.stringify(ranks.boundaries) === JSON.stringify(["bronze", "bronze", "silver", "grandmaster", "challenger", "challenger"]), JSON.stringify(ranks.boundaries));
check("XP progress bar fills between ranks and caps at the top", ranks.progressMid && ranks.progressTop);
check("v0.54 directive 8 — one wanderer, a different rank in each trade, and only the worked one counts",
  ranks.perJob, JSON.stringify(ranks.perJob));
check("v0.54 directive 8 — moving a Challenger to a new trade starts them at Bronze in it",
  ranks.movingResets);

// ============ XP accrual and its production effect ============
const xp = await page.evaluate(() => {
  const o = {};
  S.pop = 4; S.jobs = {}; S.wanderers = []; syncRoster();
  assignJob("farmer", 1); assignJob("farmer", 1);
  const before = S.wanderers.map(w => w.xp || 0);
  // v0.54 RE-POINT: tick() now reconciles against the wall clock (the backgrounded-tab fix),
  // so driving it in a tight loop against the real clock advances no game time at all. The
  // clock is virtualised and stepped by TICK_MS per fire, which is what a 200 ms interval
  // does — a strictly more faithful live arm than the old loop, which only worked because
  // tick() ignored the clock.
  const realDateNow = Date.now; let vnow = realDateNow();
  Date.now = () => vnow;
  liveLastMs = null; liveCarryMs = 0;
  for (let i = 0; i < 50; i++) { tick(); vnow += TICK_MS; }   // 50 ticks = 10s
  Date.now = realDateNow; liveLastMs = null; liveCarryMs = 0;
  // v0.54 directive 8 RE-POINT: experience banks into w.jx[job]. w.xp survives as the
  // lifetime total across trades and is asserted alongside, because the Census sorts on it.
  o.workersGain = S.wanderers.filter(w => w.j).every(w => (w.jx[w.j] || 0) > 0 && w.xp > 0);
  o.idleDoNot = S.wanderers.filter(w => !w.j).every(w => (w.xp || 0) === 0 &&
    Object.keys(w.jx || {}).length === 0);
  // v0.55 Part 7 RE-POINT: the increment is XP_PER_SECOND, not a hard-coded 1. It is read
  // from the game rather than restated, so a future change to the rate moves this assertion
  // with it instead of breaking it. Superseded by: v0.55 Part 7.
  o.rate = Math.abs(S.wanderers.filter(w => w.j)[0].jx[S.wanderers.filter(w => w.j)[0].j] - 10 * XP_PER_SECOND) < 1.5 * XP_PER_SECOND;
  o.perSecond = XP_PER_SECOND;
  // a ranked worker produces more
  S.pop = 2; S.jobs = { farmer: 2 }; S.wanderers = [
    { nm: "A", j: "farmer", xp: 0, jx: {}, t: "none" }, { nm: "B", j: "farmer", xp: 0, jx: {}, t: "none" }];
  invalidateCensus();
  S.buildings = {}; S.upgrades = {}; S.policies = {}; S.champs = {}; S.drakes = {}; S.wtechs = {};
  // read the Farmer line straight out of the breakdown, so consumption can't skew it
  const farmerProd = () => {
    const bd = computeRates("provisions"); let f = 0;
    (bd._bd || []).forEach(e => { if (/Farmer/.test(e.label)) f += e.amt; });
    return { prod: f, bd: bd };
  };
  const bronze = farmerProd();
  S.wanderers.forEach(w => { w.xp = 18200; w.jx = { farmer: 18200 }; });
  const challenger = farmerProd();
  o.skillLifts = challenger.prod > bronze.prod;
  o.skillExact = Math.abs(challenger.prod / bronze.prod - 1.1875) < 0.0001;
  o.breakdownMentionsSkill = (challenger.bd._bd || []).some(e => /skill \+19%/.test(e.label));
  // mixed ranks average, they do not sum
  S.wanderers[1].xp = 0; S.wanderers[1].jx = { farmer: 0 };
  o.averages = Math.abs(farmerProd().prod / bronze.prod - 1.09375) < 0.0001;
  S.pop = 0; S.jobs = {}; S.wanderers = []; syncRoster();
  return o;
});
check("assigned Wanderers gain XP at XP_PER_SECOND; idle ones do not", xp.workersGain && xp.idleDoNot && xp.rate, `${xp.perSecond}/s`);
check("a Challenger farmer out-produces a Bronze one by exactly 18.75%", xp.skillLifts && xp.skillExact);
check("mixed ranks average rather than stack", xp.averages);
check("resource breakdown surfaces the skill contribution", xp.breakdownMentionsSkill);

// ============ TRAITS: always-on, job-independent, LDR-capped ============
const traits = await page.evaluate(() => {
  const o = {};
  o.eight = TRAITS.length;
  o.hasNone = TRAITS.some(t => t.id === "none");
  // roll distribution: present but not overwhelming, None most common
  const rolls = {};
  for (let i = 0; i < 20000; i++) { const t = rollTrait(); rolls[t] = (rolls[t] || 0) + 1; }
  o.noneShare = rolls.none / 20000;
  o.everyTraitAppears = TRAITS.every(t => rolls[t.id] > 0);
  o.spread = Math.max(...TRAITS.filter(t => t.id !== "none").map(t => rolls[t.id])) /
             Math.min(...TRAITS.filter(t => t.id !== "none").map(t => rolls[t.id]));
  // a trait applies with NO job at all
  S.pop = 1; S.jobs = {}; S.buildings = {}; S.upgrades = {}; S.policies = {}; S.champs = {};
  S.wanderers = [{ nm: "T", j: null, xp: 0, t: "trailblazer" }]; invalidateCensus();
  const campIdle = campYieldMult();
  S.wanderers[0].j = "farmer"; invalidateCensus();
  const campWorking = campYieldMult();
  o.jobIndependent = Math.abs(campIdle - campWorking) < 1e-12 && campIdle > 1;
  // each effect is wired
  const withOnly = (id, n, fn) => {
    S.wanderers = []; for (let i = 0; i < n; i++) S.wanderers.push({ nm: "x" + i, j: null, xp: 0, t: id });
    S.pop = n; invalidateCensus(); return fn();
  };
  const none = (fn) => { S.wanderers = []; S.pop = 0; invalidateCensus(); return fn(); };
  o.scholar = none(() => discCost({ knowledge: 1000 }).knowledge) - withOnly("scholar", 10, () => discCost({ knowledge: 1000 }).knowledge);
  o.devotee = none(() => faithCost({ culture: 1000 }).culture) - withOnly("devotee", 10, () => faithCost({ culture: 1000 }).culture);
  o.trail = withOnly("trailblazer", 10, () => campYieldMult()) - none(() => campYieldMult());
  o.artisan = withOnly("artisan", 10, () => craftYield("parchment")) - none(() => craftYield("parchment"));
  o.merchant = withOnly("merchant", 10, () => tradeYieldMult()) - none(() => tradeYieldMult());
  o.alchemistOnChem = withOnly("alchemist", 10, () => craftYield("alloy")) - none(() => craftYield("alloy"));
  o.alchemistOnOther = withOnly("alchemist", 10, () => craftYield("parchment")) - none(() => craftYield("parchment"));
  o.smithOnMetal = withOnly("smith", 10, () => craftYield("gear")) - none(() => craftYield("gear"));
  o.smithOnOther = withOnly("smith", 10, () => craftYield("parchment")) - none(() => craftYield("parchment"));
  // the aggregate is LDR-capped: 400 Trailblazers cannot become +200%
  o.at25 = withOnly("trailblazer", 25, () => traitBonus("trailblazer"));
  o.at400 = withOnly("trailblazer", 400, () => traitBonus("trailblazer"));
  o.capped = o.at400 < 0.15 && o.at400 > 0.14;
  S.pop = 0; S.wanderers = []; invalidateCensus();
  return o;
});
check("eight traits including 'None', all reachable", traits.eight === 8 && traits.hasNone && traits.everyTraitAppears);
check("None is the most common roll (~30%), the rest are even", Math.abs(traits.noneShare - 0.30) < 0.03 && traits.spread < 1.2, `none ${(traits.noneShare * 100).toFixed(1)}%`);
check("a trait applies identically whether the Wanderer works or is idle", traits.jobIndependent);
check("Scholar and Devotee cut their cost categories", traits.scholar > 0 && traits.devotee > 0, `${traits.scholar} kn / ${traits.devotee} cul`);
check("Trailblazer / Artisan / Merchant all wired", traits.trail > 0 && traits.artisan > 0 && traits.merchant > 0);
check("Alchemist lifts chemtech crafts only", traits.alchemistOnChem > 0 && Math.abs(traits.alchemistOnOther) < 1e-12);
check("Smith lifts metal crafts only", traits.smithOnMetal > 0 && Math.abs(traits.smithOnOther) < 1e-12);
check("aggregate trait bonus LDR-capped below +15% (analyzer KPI 3/4)", traits.capped && traits.at25 > 0.1, `25→${(traits.at25 * 100).toFixed(2)}%, 400→${(traits.at400 * 100).toFixed(2)}%`);

// the whole trait layer stays below a single Champion leader power
const belowChampion = await page.evaluate(() => {
  S.pop = 300; S.wanderers = [];
  for (let i = 0; i < 300; i++) S.wanderers.push({ nm: "w" + i, j: null, xp: 0, t: TRAITS[i % 8].id });
  invalidateCensus();
  const worst = Math.max(...TRAITS.map(t => traitBonus(t.id)));
  S.pop = 0; S.wanderers = []; invalidateCensus();
  return worst;
});
check("even at 300 population no trait category reaches a Champion-scale effect", belowChampion < 0.15, `max +${(belowChampion * 100).toFixed(2)}%`);

// ============ CENSUS UI ============
const ui = await page.evaluate(() => {
  S.techs = { almanac: 1, logistics: 1 };
  S.pop = 40; S.jobs = {}; S.wanderers = []; syncRoster();
  for (let i = 0; i < 12; i++) assignJob("farmer", 1);
  for (let i = 0; i < 8; i++) assignJob("woodcutter", 1);
  S.wanderers.forEach((w, i) => { w.xp = i * 400; });
  S.censusFilter = "all";
  S.buildings.shelter = Math.max(1, S.buildings.shelter || 0); S.upgrades.keepingTheRolls = true; S.activeTab = "village"; uiDirty = true; renderAll();
  const txt = document.getElementById("tab-content").textContent;
  const o = {
    hasPanel: txt.includes("Census"),
    cards: document.querySelectorAll(".census-trait").length,
    filters: document.querySelectorAll("[data-census]").length,
    showsRanks: /Challenger|Grandmaster|Diamond|Bronze/.test(txt),
    // spec: no star icon, no Promote button, no rank-number display
    noLeaderStar: !document.querySelector("[data-census-lead]"),
    noPromote: !/Promote/i.test(txt)
  };
  // filtering narrows the list
  S.censusFilter = "woodcutter"; renderAll();
  o.filtered = document.querySelectorAll(".census-trait").length === 8;
  S.censusFilter = "idle"; renderAll();
  o.idleFilter = document.querySelectorAll(".census-trait").length === 20;
  S.censusFilter = "all"; renderAll();
  return o;
});
check("Census panel lives in the Wanderers tab", ui.hasPanel && ui.cards > 0);
check("cards show ranks; filter buttons present", ui.showsRanks && ui.filters >= 3, `${ui.filters} filters`);
check("filtering by job narrows the roster", ui.filtered && ui.idleFilter);
check("no Leader star, no Promote button (deliberately not carried over)", ui.noLeaderStar && ui.noPromote);

// large populations stay usable
const bigPop = await page.evaluate(() => {
  S.pop = 400; S.jobs = {}; S.wanderers = []; syncRoster();
  const t0 = performance.now();
  S.buildings.shelter = Math.max(1, S.buildings.shelter || 0); S.upgrades.keepingTheRolls = true; S.activeTab = "village"; uiDirty = true; renderAll();
  const ms = performance.now() - t0;
  const cards = document.querySelectorAll(".census-trait").length;
  const truncated = document.getElementById("tab-content").textContent.includes("most experienced");
  S.pop = 0; S.jobs = {}; S.wanderers = []; syncRoster();
  return { ms, cards, truncated };
});
check("400-population census renders fast and paginates (analyzer KPI 5)", bigPop.ms < 400 && bigPop.cards === 60 && bigPop.truncated, `${bigPop.ms.toFixed(0)}ms, ${bigPop.cards} cards shown`);

// ============ SAVE / MIGRATION ============
const save = await page.evaluate(() => {
  const o = {};
  S.pop = 6; S.jobs = {}; S.wanderers = []; syncRoster();
  assignJob("farmer", 1);
  S.wanderers[0].xp = 5000;
  const names = S.wanderers.map(w => w.nm), xps = S.wanderers.map(w => w.xp);
  loadFromString(serialize());
  o.roundTrip = S.wanderers.length === 6 && S.wanderers.map(w => w.nm).join() === names.join() && S.wanderers.map(w => w.xp).join() === xps.join();
  // a pre-Census save has pop but no roster — it must be rebuilt, not lost
  const data = JSON.parse(decodeURIComponent(escape(atob(serialize()))));
  delete data.wanderers;
  data.pop = 9; data.jobs = { farmer: 4, woodcutter: 2 };
  loadFromString(btoa(unescape(encodeURIComponent(JSON.stringify(data)))));
  o.migrated = S.wanderers.length === 9 &&
    S.wanderers.filter(w => w.j === "farmer").length === 4 &&
    S.wanderers.filter(w => w.j === "woodcutter").length === 2;
  S.pop = 0; S.jobs = {}; S.wanderers = []; syncRoster();
  return o;
});
check("census survives a save round-trip", save.roundTrip);
check("pre-Census saves rebuild a roster from pop and jobs", save.migrated);

// ============ REGRESSIONS ============
const reg = await page.evaluate(() => {
  const o = {};
  loadFromString(btoa(unescape(encodeURIComponent(JSON.stringify(freshState())))));
  gain("mana", 60); const t0 = S.res.timber; transmuteMana(1); o.transmute = S.res.timber > t0;
  S.res.devotion = 80; S.worship = 0; const a0 = S.ascends || 0;
  ascendTargon();
  o.ascentUnchanged = S.worship === 80 && S.res.devotion === 0 && S.ascends === a0 + 1;
  o.coreFns = [tick, computeRates, computeCaps, morale, ascendTargon, renderAll, renderTop].every(f => typeof f === "function");
  o.drPrimitives = typeof limitedDR === "function" && typeof unlimitedDR === "function";
  o.policies = POLICY_GROUPS.length === 6;
  o.charges = CAMP_MAX_CHARGES === 2;
  o.scienceDepth = ["archive", "academy", "observatory", "hexLab"].every(id => BUILDINGS.some(b => b.id === id));
  o.ratioBand = BUILDINGS.filter(b => b.ratio === 1.15).length / BUILDINGS.length >= 0.6;
  o.noNaNRates = Object.values(computeRates()).every(v => isFinite(v));
  o.noNaNCaps = Object.values(computeCaps()).every(v => isFinite(v));
  return o;
});
for (const [k, v] of Object.entries(reg)) check("regression: " + k, v === true);

for (const tab of ["settlement", "crafting", "village", "lore", "wilds", "trade", "targon", "champions"]) {
  await page.evaluate(t => {
    S.techs = { almanac: 1, cultivation: 1, woodcraft: 1, logistics: 1, mining: 1, trade: 1, smelting: 1, songcraft: 1, ritesOfTargon: 1, callToArms: 1 };
    S.pop = 25; syncRoster();
    S.seenMax.knowledge = 999; S.buildings.archive = Math.max(1, S.buildings.archive || 0); S.buildings.shelter = Math.max(1, S.buildings.shelter || 0); S.upgrades.keepingTheRolls = true; S.activeTab = t; uiDirty = true; renderAll();
  }, tab);
  await page.waitForTimeout(40);
}
check("all 8 tabs render, no console errors", errors.length === 0, errors.slice(0, 3).join(" | "));

console.log("\n" + pass + " passed, " + fail + " failed");
await browser.close();
suiteEnd(import.meta.url, pass, fail);
process.exit(fail > 0 ? 1 : 0);
