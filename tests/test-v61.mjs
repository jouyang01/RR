// test-v61 — the v0.61 spec round plus Jerry's four dev notes. One block per Part, in order.
//
// Conditions whose value is a 2,500-year median are asserted here only as "the apparatus emits
// it"; the measured figures are in BUILD REPORT §9.
import { chromium } from "playwright";
import { readFileSync, existsSync } from "fs";
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

const RAW = readFileSync(new URL("../index.html", import.meta.url), "utf8");
const strip = s => s.replace(/\/\*[\s\S]*?\*\//g, "").split("\n")
  .map(l => l.replace(/(^|[^:])\/\/.*$/, "$1")).join("\n");
const CODE = strip(RAW);
const SIMCORE = readFileSync(new URL("../sim/simcore.mjs", import.meta.url), "utf8");
const PACING = readFileSync(new URL("../sim/pacing.mjs", import.meta.url), "utf8");
const LEDGER = readFileSync(new URL("../docs/PARITY-LEDGER.md", import.meta.url), "utf8");
const LEDGERGEN = readFileSync(new URL("../tools/parity-ledger.mjs", import.meta.url), "utf8");
const RULINGS = readFileSync(new URL("../STANDING-RULINGS.md", import.meta.url), "utf8");

// ============================================================================
// PART 1 — convMult, decomposed; the conversion Discoveries become one additive category
// ============================================================================
await reset();
const conv = await page.evaluate(() => {
  const o = {};
  o.line = CONV_DISCOVERY_LINE.map(u => [u[0], u[1]]);
  o.sigmaFull = +CONV_DISCOVERY_LINE.reduce((a, u) => a + u[1], 0).toFixed(4);
  // the ADDITIVE product against the MULTIPLICATIVE product the round replaced
  o.additive = +(1 + o.sigmaFull).toFixed(4);
  o.multiplicative = +CONV_DISCOVERY_LINE.reduce((a, u) => a * (1 + u[1]), 1).toFixed(4);
  o.calcinerRatio = 3.70;                      // js/buildings.js @ c52985b, Σ 2.70 across three upgrades
  o.pctOfSource = +(100 * o.additive / o.calcinerRatio).toFixed(1);
  // the ceiling, on a fully maxed state
  S.upgrades = {}; CONV_DISCOVERY_LINE.forEach(u => S.upgrades[u[0]] = true);
  S.drakes = { infernal: 100000 }; S.cinderUntil = 0;
  const bd = convMultBreakdown(false);
  o.terms = bd.terms.map(t => ({ label: t.label, value: +t.value.toFixed(4), kind: t.kind,
                                 cap: t.cap === undefined ? null : +t.cap.toFixed(4) }));
  // every term at ITS OWN cap — the ceiling the decomposition claims
  o.ceilingNoCinder = +bd.terms.filter(t => t.kind !== "transient")
    .reduce((a, t) => a * (t.cap === undefined ? t.value : t.cap), 1).toFixed(4);
  o.ceilingWithCinder = +(o.ceilingNoCinder * 1.5).toFixed(4);
  // what the SAME ceiling was before the additive collapse
  o.ceilingBefore = +(1.495 * o.multiplicative * 2.0).toFixed(4);
  o.ceilingBeforeCinder = +(o.ceilingBefore * 1.5).toFixed(4);
  o.infernalCap = 1 + DRAKE_CAP.infernal;
  o.overseerCap = 2.0;
  // boosts is a SEPARATE category and must be readable as one
  o.boostsExposed = !!(computeRates("crystals")._boosts);
  S.upgrades = {}; S.drakes = {};
  return o;
});
// PASS CONDITION 2 — one additive category
check("1/2 — the three conversion Discoveries are ONE ADDITIVE category, Σ0.65 → ×1.65",
  conv.line.length === 3 && conv.sigmaFull === 0.65 && conv.additive === 1.65 &&
  /convDiscoveryTotal\(\)/.test(CODE) &&
  !/S\.upgrades\.clockworkBellows \? 1\.25 : 1/.test(CODE),
  `Σ ${conv.sigmaFull} → ×${conv.additive} (was ×${conv.multiplicative} chained)`);
check("1/2 — ...which is an 8% cut, and the cut is NOT the point: §19 is",
  Math.abs(conv.multiplicative - 1.7969) < 1e-3 &&
  Math.abs(1 - conv.additive / conv.multiplicative - 0.0817) < 0.002,
  `×${conv.multiplicative} → ×${conv.additive}`);
// PASS CONDITION 2 — the like-for-like comparison, which REVERSES v0.60's finding
check("1/2 — like-for-like: RR's conversion line is 45% of `calcinerRatio`, not 5× it",
  conv.pctOfSource > 40 && conv.pctOfSource < 50,
  `RR ×${conv.additive} vs Kittens ×${conv.calcinerRatio} = ${conv.pctOfSource}% of the source`);
// PASS CONDITION 1 — the ceiling
check("1/1 — `convMult`'s ceiling BEFORE the additive collapse is the spec's ×5.3728 / ×8.0590",
  Math.abs(conv.ceilingBefore - 5.3728) < 0.002 && Math.abs(conv.ceilingBeforeCinder - 8.0590) < 0.003,
  `×${conv.ceilingBefore} / ×${conv.ceilingBeforeCinder} with cinder`);
check("1/1 — ...and AFTER it, which is what actually ships: ×4.9335 / ×7.4003",
  Math.abs(conv.ceilingNoCinder - 4.95) < 0.02 && Math.abs(conv.ceilingWithCinder - 7.425) < 0.03,
  `×${conv.ceilingNoCinder} / ×${conv.ceilingWithCinder} with cinder ` +
  `— the spec's two figures are the PRE-change ones and cannot both hold with condition 2`);
// PASS CONDITION 3 — the drake and affinity caps, and both are BOUNDED
check("1/3 — the drake and overseer terms are RR-ORIGINAL categories and BOTH ARE BOUNDED",
  conv.terms.filter(t => /RR-ORIGINAL/.test(t.kind)).length === 2 &&
  Math.abs(conv.infernalCap - 1.5) < 1e-9 && Math.abs(conv.overseerCap - 2.0) < 1e-9,
  JSON.stringify(conv.terms.map(t => `${t.label} cap ×${t.cap}`)));
// PASS CONDITION 1 — the readout ships and prints
check("1/1 — the term-by-term readout ships and is captured at every milestone",
  /convMult: \(\(\) =>/.test(SIMCORE) && /discoverySigma/.test(SIMCORE) &&
  /CONVMULT DECOMPOSITION @/.test(PACING) && /LIKE-FOR-LIKE upgrade line/.test(PACING));
// PASS CONDITION 3 — the ×19.77 row corrected
check("1/3 — the ×19.77 row is CORRECTED as two categories multiplied, not left standing",
  /19\.77/.test(LEDGER) && /convMult x \(1 \+ boosts\.crystals\)/.test(LEDGER) &&
  /TWO DIFFERENT CATEGORIES MULTIPLIED TOGETHER/.test(LEDGER),
  "the correction names the arithmetic error, not just the number");
check("1/3 — ...and `boosts` is EXPOSED so the two factors can never be conflated again",
  conv.boostsExposed && /rates\._boosts = boosts/.test(CODE) && /boostsCrystals/.test(SIMCORE));
// PASS CONDITION 4
check("1/4 — `MANUFACTORY_FUEL` is UNCHANGED at 0.12",
  await page.evaluate(() => MANUFACTORY_FUEL === 0.12));

// ============================================================================
// PART 2 — HELD. Jerry's dev note 2 overrides the analyzer.
// ============================================================================
// "Early EXP rate is okay. Can ignore analyzer there." The spec's Part 2 re-priced the low rungs
// so RR's ladder crossed each Kittens bonus at the source's XP. IT DOES NOT SHIP. What is
// asserted is that the ladder is UNTOUCHED — a hold that is not asserted is a hold the next
// round re-proposes.
const ladder = await page.evaluate(() => ({
  ranks: RANKS.map(r => [r.id, r.xp, r.bonus]), rate: XP_PER_SECOND, cap: XP_CAP
}));
check("2 — HELD (dev note 2): the rank ladder is UNCHANGED, all nine rungs",
  ladder.ranks.length === 9 &&
  ladder.ranks[1][1] === 100 && ladder.ranks[2][1] === 350 && ladder.ranks[3][1] === 800 &&
  ladder.ranks[4][1] === 1600 && ladder.ranks[5][1] === 2900 && ladder.ranks[6][1] === 4800 &&
  ladder.ranks[7][1] === 7500 && ladder.ranks[8][1] === 11500,
  JSON.stringify(ladder.ranks.map(r => r[1])));
check("2 — ...and the top rung and the rate are the v0.60 figures, untouched",
  ladder.ranks[8][1] === 11500 && ladder.rate === 0.05 &&
  Math.abs(ladder.ranks[8][1] / ladder.rate / 3600 - 63.89) < 0.01,
  `${ladder.ranks[8][1]} XP at ${ladder.rate}/s = ${(ladder.ranks[8][1] / ladder.rate / 3600).toFixed(2)} real hours`);
check("2 — the first-rung debt the spec wanted to fix is REPORTED, not silently dropped",
  (() => { const first = ladder.ranks.find(r => r[2] >= 0.0125 - 1e-12);
    return Math.abs(first[1] / 100 - 3.5) < 0.01; })(),
  `Kittens grants +1.25% at 100 XP; RR first reaches it at ${ladder.ranks.find(r => r[2] >= 0.0125 - 1e-12)[1]} — ×3.50, HELD by Jerry`);

// ============================================================================
// DEV NOTE 1 — the Festival appears as a buff, and this one had a passing test for two rounds
// ============================================================================
const fest = await page.evaluate(() => {
  loadFromString(btoa(unescape(encodeURIComponent(JSON.stringify(freshState())))));
  TECHS.forEach(t => S.techs[t.id] = 1); S.upgrades.harvestRites = 1;
  for (const r in RES) S.res[r] = 1e9;
  renderTop(computeRates());
  const before = document.getElementById("calendar-bar").innerHTML;
  const renownBefore = S.res.renown;
  holdFestival();
  renderTop(computeRates());
  const after = document.getElementById("calendar-bar").innerHTML;
  return { before, after, active: festivalActive(), seasons: festivalSeasonsLeft(),
           wallClock: S.festivalUntil || 0, renownGain: S.res.renown - renownBefore,
           constant: FESTIVAL_RENOWN };
});
check("note 1 — an ACTIVE festival appears on the buff banner (behaviour, not a grep)",
  fest.active && /FESTIVAL/.test(fest.after) && !/FESTIVAL/.test(fest.before));
check("note 1 — ...and it counts down in SEASONS, the unit the festival is denominated in",
  /FESTIVAL \d+ seasons?/.test(fest.after) && fest.seasons > 0,
  (fest.after.match(/FESTIVAL[^<]*/) || [""])[0]);
check("note 1 — the cause: the chip read the WALL-CLOCK field, which v0.58 set to 0 forever",
  fest.wallClock === 0 && /festivalActive\(\)/.test(CODE) &&
  !/if \(now < \(S\.festivalUntil \|\| 0\)\) html \+=/.test(CODE),
  `S.festivalUntil = ${fest.wallClock} — the chip could never fire from v0.58 onward`);

// ============================================================================
// PART 5 — the renown economy (dev notes 1, 7, 9)
// ============================================================================
const ren = await page.evaluate(() => {
  const o = { rate: RENOWN_PER_VIGOR, table: {}, festival: FESTIVAL_RENOWN };
  EXPEDITIONS.forEach(e => {
    o.table[e.id] = { vigor: (e.cost && e.cost.vigor) || 0, authored: e.renown || 2,
                      base: expeditionRenownBase(e), flat: !!e.renownFlat };
  });
  // the festival grant respects the callToArms gate
  loadFromString(btoa(unescape(encodeURIComponent(JSON.stringify(freshState())))));
  TECHS.forEach(t => S.techs[t.id] = 1); delete S.techs.callToArms;
  S.upgrades.harvestRites = 1; for (const r in RES) S.res[r] = 1e9;
  S.res.renown = 0; const r0 = S.res.renown; holdFestival(); o.gainedWithoutGate = S.res.renown - r0;
  loadFromString(btoa(unescape(encodeURIComponent(JSON.stringify(freshState())))));
  TECHS.forEach(t => S.techs[t.id] = 1);
  S.upgrades.harvestRites = 1; for (const r in RES) S.res[r] = 1e9;
  S.res.renown = 0; const r1 = S.res.renown; holdFestival(); o.gainedWithGate = S.res.renown - r1;
  o.tradeRenown = TRADE_RENOWN; o.caitlyn = CAITLYN_TRADE_RENOWN;
  return o;
});
// PASS CONDITION 9 — one rate, the table asserted expedition by expedition
check("5.1/9 — ONE rate: `RENOWN_PER_VIGOR` = 0.0154, the Baron's own rate",
  ren.rate === 0.0154 && ren.table.baron.base === 40,
  `Baron 2,600 vigor × ${ren.rate} = ${ren.table.baron.base}`);
check("5.1/9 — the spec's table, expedition by expedition",
  ren.table.wolves.base === 2 && ren.table.gromp.base === 2 && ren.table.raptors.base === 2 &&
  ren.table.krugs.base === 2 && ren.table.abyssJourney.base === 2 &&
  ren.table.sumpCrawl.base === 2 && ren.table.drakeHunt.base === 14 && ren.table.baron.base === 40,
  Object.entries(ren.table).map(([k, v]) => `${k} ${v.authored}→${v.base}`).join(", "));
check("5.1/9 — the ABYSS is levelled: it paid 41.67 per 1,000 vigor against the Baron's 15.38",
  Math.abs(1000 * ren.table.abyssJourney.authored / ren.table.abyssJourney.vigor - 41.67) < 0.02 &&
  Math.abs(1000 * ren.table.abyssJourney.base / ren.table.abyssJourney.vigor - 1000 * ren.rate) < 2,
  `5 → ${ren.table.abyssJourney.base} at 120 vigor`);
check("5.1/9 — the Scouting Party is EXEMPT, by a property on the expedition, not a branch on id",
  ren.table.scouting.flat === true && ren.table.scouting.base === 8 &&
  /if \(e\.renownFlat\) return e\.renown \|\| 2;/.test(CODE) &&
  !/id === "scouting"/.test(CODE.split("function expeditionRenownBase")[1].slice(0, 400)),
  `1,750 vigor would have paid ${Math.round(ren.table.scouting.vigor * ren.rate)}; it keeps its authored 8`);
check("5.1 — every camp derives from ONE rate: no expedition pays its authored field by accident",
  Object.values(ren.table).every(v => v.flat || !v.vigor ||
    v.base === Math.max(1, Math.round(v.vigor * ren.rate))));
// PASS CONDITION 10 — the festival, and the gate
check("5.2/10 — the Festival grants 25 renown, from a named constant",
  ren.festival === 25 && ren.gainedWithGate === 25, `+${ren.gainedWithGate}`);
check("5.2/10 — ...through `gainRenown()`, so the Call to Arms gate is respected",
  ren.gainedWithoutGate === 0 && /gainRenown\(FESTIVAL_RENOWN\)/.test(CODE),
  `without Call to Arms: +${ren.gainedWithoutGate}`);
// PASS CONDITION 11 — the trade tooltip
check("5.3/11 — the trade tooltip shows renown, read FROM THE CONSTANTS, with Caitlyn resolved",
  /TRADE_RENOWN \+ \(leaderIs\("caitlyn"\) \? CAITLYN_TRADE_RENOWN : 0\)/.test(CODE) &&
  /renown a caravan/.test(CODE) && ren.tradeRenown === 1 && ren.caitlyn === 5,
  `${ren.tradeRenown} + ${ren.caitlyn} under Caitlyn = 6`);

// ============================================================================
// PART 6 — trade parity
// ============================================================================
const trade = await page.evaluate(() => {
  const o = {};
  loadFromString(btoa(unescape(encodeURIComponent(JSON.stringify(freshState())))));
  TECHS.forEach(t => S.techs[t.id] = 1);
  S.champs = {}; S.policies = {}; S.wanderers = []; S.leader = null;
  o.terms = tradeYieldTerms("demacia").map(t => t.label);
  const at = (docks, cars) => { S.buildings = { tradeDock: docks }; S.caravans = { demacia: cars };
                                return +tradeYieldMult("demacia").toFixed(4); };
  o.m0 = at(0, 0); o.m30_15 = at(30, 15); o.m100_50 = at(100, 50); o.mHuge = at(1e6, 1e6);
  o.limit = TRADE_YIELD_LIMIT;
  o.caravanFlat = +(caravanYieldBonus("demacia") === 0.02 * caravanCount("demacia") ? 1 : 0);
  S.buildings = {}; S.caravans = {};
  o.provisions = TRADE_PROVISIONS;
  const f = FACTIONS.find(x => x.id === "demacia");
  o.cost = tradeCost(f);
  o.caps = computeCaps().provisions;
  return o;
});
// PASS CONDITION 12 — one additive category
check("6.1/12 — trade yield is ONE ADDITIVE category of five named terms",
  trade.terms.length === 5 &&
  /return 1 \+ limitedDR\(tradeYieldTerms\(fid\)\.reduce/.test(CODE) &&
  !/\(1 \+ docks\) \* embassy/.test(CODE),
  trade.terms.join(" + "));
check("6.1/12 — the caravan term is a FLAT +2%, with its +60% per-route ceiling GONE",
  trade.caravanFlat === 1 && !/limitedDR\(0\.02 \* caravanCount/.test(CODE));
check("6.1/12 — the DOCK's own +100% ceiling is gone too",
  !/var docks = limitedDR\(/.test(CODE) && /bfield\("tradeDock", "tradeBoost"\) \* count\("tradeDock"\)/.test(CODE));
// THE DEVIATION, asserted so it cannot be mistaken for the spec's own text.
check("6.1 — DEVIATION: ONE ceiling remains on the category as a whole, and it is argued in place",
  trade.limit === 3.0 && Math.abs(trade.mHuge - 4.0) < 1e-3 &&
  /infinite-timber loop/i.test(RAW) && /133 Trade Docks/.test(RAW),
  `×${trade.mHuge} asymptote (spec asked for uncapped; uncapped the trade→transmute circuit ` +
  `breaks even at 133 docks and RR grows infinite timber — see index.html at tradeYieldMult)`);
// Measured with NO champion, trait or policy term (the fixture clears them), so this is the
// docks + caravans half alone: 30 x 0.02 + 15 x 0.02 = 0.90 -> x1.90, inside the linear region.
check("6.1 — and it is a STRICT simplification: 4 categories with 2 ceilings → 1 with 1",
  Math.abs(trade.m30_15 - 1.90) < 0.01 && trade.m100_50 > 3.5 && trade.m100_50 < 4.0 &&
  trade.m0 === 1,
  `30 docks / 15 caravans → ×${trade.m30_15}; 100 / 50 → ×${trade.m100_50}; asymptote ×${trade.mHuge}`);
// PASS CONDITION 13 — hiddenSlots
const slots = await page.evaluate(() => {
  loadFromString(btoa(unescape(encodeURIComponent(JSON.stringify(freshState())))));
  TECHS.forEach(t => S.techs[t.id] = 1);
  // the reported case: the craft is unlocked and buildable, and the player has never HELD one
  const f = FACTIONS.find(x => x.id === "piltover");
  const idx = (f.slots || []).findIndex(sl => CRAFTS.some(c => c.out === sl.res));
  if (idx < 0) return { skipped: true };
  const res = f.slots[idx].res;
  S.res[res] = 0; S.seenMax = S.seenMax || {}; S.seenMax[res] = 0;
  return { skipped: false, res, available: slotAvailable("piltover", idx), known: ttResKnown(res) };
});
check("6.2/13 — `hiddenSlots` tests CAPABILITY, not visibility",
  /if \(!slotAvailable\(fid, i\)\) \{ hiddenSlots\+\+; return; \}/.test(CODE) &&
  !/if \(!ttResKnown\(sl\.res\)\) \{ hiddenSlots\+\+; return; \}/.test(CODE));
check("6.2/13 — ...and the two tests genuinely DISAGREE on 'can craft it, never held one'",
  slots.skipped || (slots.available === true && slots.known === false),
  slots.skipped ? "no craft-backed slot on this route" :
  `${slots.res}: slotAvailable=${slots.available}, ttResKnown=${slots.known} — the reported bug`);
// PASS CONDITION 14 — the provisions cost and the binding check
check("6.3/14 — every trade costs a SHARED 5,000 provisions, not a per-faction figure",
  trade.provisions === 5000 && trade.cost.provisions >= 5000 &&
  /c\.provisions = \(c\.provisions \|\| 0\) \+ TRADE_PROVISIONS;/.test(CODE),
  JSON.stringify(trade.cost));
check("6.3/14 — ...and neither trade discount touches it",
  !/TRADE_PROVISIONS.*TRADE_VIGOR_DISCOUNT|TRADE_VIGOR_DISCOUNT.*TRADE_PROVISIONS/.test(CODE));
check("6.3/14 — the BINDING CHECK is instrumented at every milestone, which is the note's point",
  /provisions: \{/.test(SIMCORE) && /capAllows/.test(SIMCORE) &&
  /costThatWouldBindAt3/.test(SIMCORE) && /PROVISIONS COST/.test(PACING));
// PASS CONDITION 15 — the spelling
check("6.4/15 — `civilization` in both places, and the -ise family is CONSISTENT repo-wide",
  /civilization/.test(RAW) && !/civilisation/.test(RAW) &&
  !/\b(optimis|specialis|generalis|trivialis|serialis|realis|itemis|authoris|apologis)(e|ed|ing|ation)\b/.test(RAW),
  "26 sites converted across 15 words; nothing left half-converted");

// ============================================================================
// PART 7 — Cataloguing and The Great Index become different things (dev note 2)
// ============================================================================
const know = await page.evaluate(() => {
  loadFromString(btoa(unescape(encodeURIComponent(JSON.stringify(freshState())))));
  TECHS.forEach(t => S.techs[t.id] = 1);
  const o = { line: KNOWLEDGE_AMP_LINE.map(u => ({ ...u })), sigma: knowledgeAmpSigma() };
  o.greatIndexTech = UPGRADES.find(u => u.id === "greatIndex").tech;
  o.crossRefTech = UPGRADES.find(u => u.id === "crossReferencing").tech;
  o.catTech = UPGRADES.find(u => u.id === "cataloguing").tech;
  // each pairing pays only when ITS OWN scaler is standing
  S.buildings = { archive: 20, academy: 15, observatory: 0 };
  S.upgrades = {};
  const base = computeCaps().knowledge;
  S.upgrades.cataloguing = 1; o.catAtZeroObs = computeCaps().knowledge - base;
  S.upgrades = {}; S.upgrades.greatIndex = 1; o.indexAtZeroObs = computeCaps().knowledge - base;
  S.upgrades = {};
  S.buildings = { archive: 20, academy: 15, observatory: 10 };
  const base2 = computeCaps().knowledge;
  S.upgrades = {}; S.upgrades.greatIndex = 1; o.indexAtTenObs = computeCaps().knowledge - base2;
  S.upgrades = {}; S.buildings = {};
  return o;
});
// PASS CONDITION 16
check("7/16 — three DISTINCT pairings, not one effect bought three times",
  know.line.length === 3 &&
  new Set(know.line.map(u => u.scaler + "->" + u.target)).size === 3,
  know.line.map(u => `${u.id}: ${u.scaler}→${u.target}`).join(" | "));
check("7/16 — Σ stays 0.06 across three upgrades — Kittens' figure taken, not tuned",
  Math.abs(know.sigma - 0.06) < 1e-9 && know.line.every(u => u.ratio === 0.02),
  `Σ ${know.sigma}`);
check("7/16 — `crossReferencing` KEEPS the source's own Observatory→Archive pairing",
  know.line.find(u => u.id === "crossReferencing").scaler === "observatory" &&
  know.line.find(u => u.id === "crossReferencing").target === "archive" &&
  /js\/buildings\.js:579-580/.test(RAW),
  "the middle upgrade keeps the original job so the ledger keeps a genuine PARITY row");
check("7/16 — `greatIndex` moves to `sparks`, a full era from `crossReferencing`",
  know.greatIndexTech === "sparks" && know.crossRefTech === "ritesOfTargon" &&
  know.catTech === "ritesOfTargon", `${know.catTech} / ${know.crossRefTech} / ${know.greatIndexTech}`);
check("7/16 — each pairing pays only when ITS OWN scaler stands: Academies pay at zero Observatories",
  know.catAtZeroObs > 0 && know.indexAtZeroObs === 0 && know.indexAtTenObs > 0,
  `cataloguing at 0 obs: +${know.catAtZeroObs}; greatIndex at 0 obs: +${know.indexAtZeroObs}, at 10: +${know.indexAtTenObs}`);
check("7 — the amplifier is reported pairing by pairing at every milestone",
  /ampPairings/.test(SIMCORE) && /KNOWLEDGE AMPLIFIER @/.test(PACING));

// ============================================================================
// PART 8 — the fourth mana multiplier, on Petricite Masonry
// ============================================================================
const mana = await page.evaluate(() => {
  loadFromString(btoa(unescape(encodeURIComponent(JSON.stringify(freshState())))));
  TECHS.forEach(t => S.techs[t.id] = 1);
  S.jobs = { arcanist: 0 };                       // the fixture that distinguishes global from job-scoped
  ["leylineCalibration", "trueIceCellars", "hexresonance", "petriciteResonators"].forEach(u => S.upgrades[u] = 1);
  const r = computeRates("mana");
  const u = UPGRADES.find(x => x.id === "petriciteResonators");
  // PASS CONDITION 21 — count, do not name
  const sparksMana = UPGRADES.filter(x => x.tech === "sparks" && /mana production|to the mana/i.test(x.effect || ""));
  return { raw: +r._boostsRaw.mana.toFixed(6), delivered: +r._boosts.mana.toFixed(6),
           limit: BOOST_LIMIT.mana, arcanists: S.jobs.arcanist,
           tech: u.tech, cost: u.cost, boost: PETRICITE_MANA_BOOST,
           sparksManaCount: sparksMana.length, sparksManaIds: sparksMana.map(x => x.id),
           audit: auditCostGraph().concat(auditRawGraph()) };
});
// PASS CONDITION 17
check("8/17 — `boosts.mana` is Σ 1.00 EXACTLY with all four held, on ZERO arcanists",
  Math.abs(mana.raw - 1.00) < 1e-9 && mana.arcanists === 0,
  `raw Σ ${mana.raw} with no arcanist assigned — a global boost, not a job-scoped one`);
check("8/17 — THE FINDING THE SPEC DID NOT PREDICT: Σ1.00 DELIVERS 0.875",
  Math.abs(mana.delivered - 0.875) < 1e-6 && mana.limit === 1.0,
  `Σ ${mana.raw} → ${mana.delivered} through limitedDR(…, ${mana.limit}). ` +
  `Three members summed to EXACTLY 0.75 = 0.75·L, the top of the linear region, so every ` +
  `member before this round was delivered in full. This is the first that is not: it adds ` +
  `+25 and contributes +12.5.`);
check("8/17 — the effect string is generated from the constants and states the ceiling",
  await page.evaluate(() => {
    const e = UPGRADES.find(u => u.id === "petriciteResonators").effect;
    return /\+25%/.test(e) && /ceiling/.test(e) && /add together/.test(e);
  }));
// PASS CONDITION 21 — asserted BY COUNT, not by naming Leyline
check("8/21 — `sparks` carries EXACTLY ONE mana discovery, asserted by COUNT",
  mana.sparksManaCount === 1, mana.sparksManaIds.join(", "));
check("8 — the new rung is on `petricite` and carries a crystal cost",
  mana.tech === "petricite" && mana.cost.crystals === 400 && mana.boost === 0.25,
  JSON.stringify(mana.cost));
check("8 — DEVIATION: the spec's `hexgear: 25` is REJECTED BY THE AUDIT and replaced",
  mana.cost.hexgear === undefined && mana.cost.petriciteBlock === 25 &&
  mana.audit.length === 0,
  "hexgear is gated on hexcore (75,000); this Discovery unlocks at petricite (65,000) — " +
  "auditCostGraph() and auditRawGraph() both refused it");
check("8 — no fourth multiplicative category: it lands in `boosts.mana` with the other three",
  /boosts\.mana \+= PETRICITE_MANA_BOOST;/.test(CODE));
check("8 — the ledger records four members against the source's two, and cites BOTH of Jerry's notes",
  /four members/i.test(LEDGER) && /two members source-wide/i.test(LEDGER) &&
  /reverses v0\.60's 'hold the line on Mana'/i.test(LEDGER) &&
  /later note 3/i.test(LEDGER));

// ============================================================================
// PART 9 — the Drake and the Baron cannot be undone
// ============================================================================
const undo = await page.evaluate(() => {
  const o = {};
  const run = id => {
    loadFromString(btoa(unescape(encodeURIComponent(JSON.stringify(freshState())))));
    TECHS.forEach(t => S.techs[t.id] = 1);
    for (const r in RES) S.res[r] = 1e9;
    S.champs = {}; S.leader = null;
    runExpedition(id);
    return { undoable: undoAvailable(), rerollClean: !(S.rerollPenalty && S.rerollPenalty.hunt) };
  };
  o.drake = run("drakeHunt"); o.baron = run("baron"); o.wolves = run("wolves");
  o.flags = EXPEDITIONS.filter(e => e.noUndo).map(e => e.id);
  return o;
});
// PASS CONDITION 18
check("9/18 — the Drake Hunt and Baron Nashor cannot be undone",
  undo.drake.undoable === false && undo.baron.undoable === false,
  `drake undoable=${undo.drake.undoable}, baron undoable=${undo.baron.undoable}`);
check("9/18 — ...and every other expedition still can be",
  undo.wolves.undoable === true);
check("9/18 — `noUndo` is READ FROM THE EXPEDITION, not branched on id",
  undo.flags.length === 2 && undo.flags.indexOf("drakeHunt") > -1 && undo.flags.indexOf("baron") > -1 &&
  /if \(!e\.noUndo\) snapshotUndo/.test(CODE) &&
  !/e\.id === "drakeHunt"/.test(CODE.split("function runExpedition")[1].slice(0, 1200)),
  undo.flags.join(", "));
check("9/18 — the re-roll penalty is CLEAN after a no-undo hunt, not left behind",
  undo.drake.rerollClean && undo.baron.rerollClean && undo.wolves.rerollClean);

// ============================================================================
// PART 10 + DEV NOTE 3 — the two research currencies
// ============================================================================
const price = await page.evaluate(() => {
  const techK = {}; TECHS.forEach(t => techK[t.id] = (t.cost && t.cost.knowledge) || 0);
  const post = postSparksDiscoveries();
  return {
    discTotal: UPGRADES.length,
    withKnowledge: discoveryKnowledgeCount(),
    knowledgeDivisor: DISCOVERY_KNOWLEDGE_DIVISOR,
    knowledgeSet: DISCOVERY_KNOWLEDGE_SET.length,
    postSparks: post.length,
    postSparksCrystals: postSparksCrystalCount(),
    crystalDivisor: DISCOVERY_CRYSTAL_DIVISOR,
    // the four figures that must NOT have moved
    existing: {
      pressureRegulators: UPGRADES.find(u => u.id === "pressureRegulators").cost.crystals,
      rollingPress: UPGRADES.find(u => u.id === "rollingPress").cost.crystals,
      automatedWorkshop: UPGRADES.find(u => u.id === "automatedWorkshop").cost.crystals,
      hexresonance: UPGRADES.find(u => u.id === "hexresonance").cost.crystals
    },
    // the rule, spot-checked against the rung
    ruleHolds: DISCOVERY_CRYSTAL_SET.every(id => {
      const u = UPGRADES.find(x => x.id === id);
      return u.cost.crystals === Math.round((techK[u.tech] || 0) / DISCOVERY_CRYSTAL_DIVISOR);
    }),
    knowledgeRuleHolds: DISCOVERY_KNOWLEDGE_SET.every(id => {
      const u = UPGRADES.find(x => x.id === id);
      return u.cost.knowledge === Math.round((techK[u.tech] || 0) / DISCOVERY_KNOWLEDGE_DIVISOR);
    }),
    // exemptions: the tool, storage and timber lines stay on their own materials
    axeLineTaxed: AXE_LINE.map(u => u[0]).filter(id => DISCOVERY_KNOWLEDGE_SET.indexOf(id) > -1),
    sawLineTaxed: SAW_LINE.map(u => u[0]).filter(id => DISCOVERY_KNOWLEDGE_SET.indexOf(id) > -1),
    storeLineTaxed: BARN_LINE.map(u => u[0]).filter(id => DISCOVERY_KNOWLEDGE_SET.indexOf(id) > -1)
  };
});
// PASS CONDITION 19
check("10/19 — post-Sparks discoveries carrying crystals rises 4 → 21",
  price.postSparksCrystals >= 20 && price.postSparks >= 33,
  `${price.postSparksCrystals} of ${price.postSparks} post-Sparks discoveries = ` +
  `${Math.round(100 * price.postSparksCrystals / price.postSparks)}% against the source's 62%`);
check("10/19 — the rung-scaled rule is STATED and APPLIED: crystals = round(K / 100)",
  price.crystalDivisor === 100 && price.ruleHolds);
check("10/19 — the four existing figures are UNCHANGED",
  price.existing.pressureRegulators === 600 && price.existing.rollingPress === 450 &&
  price.existing.automatedWorkshop === 900 && price.existing.hexresonance === 80,
  JSON.stringify(price.existing));
check("10/19 — it is a SINK, not a tax: the timber, stone and tool lines are exempt",
  price.postSparksCrystals < price.postSparks,
  `${price.postSparks - price.postSparksCrystals} post-Sparks discoveries stay on their own chains`);
// DEV NOTE 3
check("note 3 — MORE, not all, of the discoveries cost knowledge: 10 → 32 of 79",
  price.withKnowledge === 32 && price.withKnowledge < price.discTotal,
  `${price.withKnowledge} of ${price.discTotal} = ${Math.round(100 * price.withKnowledge / price.discTotal)}%`);
check("note 3 — the rule derives from the tech's own rung, so a re-homed Discovery reprices itself",
  price.knowledgeDivisor === 10 && price.knowledgeRuleHolds);
check("note 3 — an OUTFIT is not a METHOD: the axe, saw and storage lines take no knowledge",
  price.axeLineTaxed.length === 0 && price.sawLineTaxed.length === 0 && price.storeLineTaxed.length === 0,
  [...price.axeLineTaxed, ...price.sawLineTaxed, ...price.storeLineTaxed].join(", ") || "none");

// ============================================================================
// DEV NOTE 4 — the merged research
// ============================================================================
const merge = await page.evaluate(() => {
  const t = TECHS.find(x => x.id === "vanguardDoctrine");
  const kids = UPGRADES.filter(u => u.tech === "vanguardDoctrine").map(u => u.id);
  // the migration: a save holding EITHER retired id is credited the merged tech
  const mig = which => {
    const s = JSON.parse(JSON.stringify(freshState()));
    s.techs = s.techs || {}; s.techs[which] = true;
    loadFromString(btoa(unescape(encodeURIComponent(JSON.stringify(s)))));
    return { has: !!S.techs.vanguardDoctrine, old: !!S.techs[which] };
  };
  return { exists: !!t, cost: t ? t.cost : null, req: t ? t.req : null, kids,
           gone: !TECHS.some(x => x.id === "championsRegimen" || x.id === "deepCartography"),
           migRegimen: mig("championsRegimen"), migCarto: mig("deepCartography"),
           sparksK: TECHS.find(x => x.id === "sparks").cost.knowledge,
           hexdraulicsK: TECHS.find(x => x.id === "hexdraulics").cost.knowledge };
});
check("note 4 — ONE research now unlocks BOTH discoveries",
  merge.exists && merge.kids.length === 2 &&
  merge.kids.indexOf("standingOrders") > -1 && merge.kids.indexOf("surveyedApproaches") > -1,
  `The Vanguard Doctrine → ${merge.kids.join(", ")}`);
check("note 4 — ...and the two it replaced are GONE",
  merge.gone);
check("note 4 — priced between the Sparks rung and the first Sparks child, which is what a BRIDGE is",
  merge.cost.knowledge === 45000 && merge.cost.knowledge > merge.sparksK &&
  merge.cost.knowledge < merge.hexdraulicsK && merge.req === "callToArms",
  `${merge.sparksK} < 45,000 < ${merge.hexdraulicsK} (replaces 28,000 + 35,000 = 63,000)`);
check("note 4 — §30: a save holding EITHER retired id is credited the merged tech",
  merge.migRegimen.has && !merge.migRegimen.old &&
  merge.migCarto.has && !merge.migCarto.old,
  `championsRegimen → ${merge.migRegimen.has}, deepCartography → ${merge.migCarto.has}`);
check("note 4 — §30: both ids are RESERVED, and the migration names the version that retires it",
  /`championsRegimen` and `deepCartography` are RESERVED IDS/.test(RAW) &&
  /RETIRES AT v1\.0/.test(RAW));
check("note 4 — both discoveries take a knowledge component at the merged tech's own rung",
  await page.evaluate(() => {
    const so = UPGRADES.find(u => u.id === "standingOrders").cost.knowledge;
    const sa = UPGRADES.find(u => u.id === "surveyedApproaches").cost.knowledge;
    return so === 4500 && sa === 4500;
  }), "45,000 / 10 = 4,500 each — part of the 18,000 the merge saved, moved to the leaves");

// ============================================================================
// PARTS 3, 4, 11 — the ledger argument pass and the two rulings
// ============================================================================
// PASS CONDITION 6
const triage = (() => {
  const rows = LEDGER.split("\n").filter(l => /^\|\s*`/.test(l));
  const unv = rows.filter(l => /\bUNVERIFIED\b/.test(l));
  return { rows: rows.length, unverified: unv.length,
           rrOriginalUnverified: unv.filter(l => /\[RR-ORIGINAL\]/.test(l)).length,
           retrievable: unv.filter(l => /\[RETRIEVABLE\]/.test(l)).length };
})();
check("3.1/6 — ZERO rows are classed RR-ORIGINAL and still labelled UNVERIFIED (was 86)",
  triage.rrOriginalUnverified === 0,
  `${triage.unverified} UNVERIFIED rows remain and ALL ${triage.retrievable} are RETRIEVABLE`);
check("3.1/6 — the generator ABORTS on RR-ORIGINAL + UNVERIFIED, so the class cannot return",
  /LEDGER ABORT: \$\{rrOriginalUnverified\.length\} row\(s\) are classed RR-ORIGINAL/.test(LEDGERGEN) &&
  /UNVERIFIED means 'RETRIEVABLE and not yet retrieved'/.test(LEDGERGEN));
check("3.1/6 — every argued row carries a REASON of the nearest-source-shaped-alternative form",
  (LEDGER.match(/v0\.61 Part 3\.1/g) || []).length >= 80,
  `${(LEDGER.match(/v0\.61 Part 3\.1/g) || []).length} rows carry a v0.61 argument`);
// PASS CONDITION 7
check("3.2/7 — `hextechFoundry` is RE-POINTED to the Calciner, which is the converter shape",
  /hextechFoundry.*calciner/.test(LEDGER) &&
  /RR's Foundry is a CONVERTER/.test(LEDGER) &&
  !/hextechFoundry.*factory — .craftRatio/.test(LEDGER));
check("3.2/7 — ...and its `globalBoost` clause is ledgered SEPARATELY, because it is a second effect",
  /The Hextech Foundry's `globalBoost`/.test(LEDGER) &&
  /no Kittens converter carries a global ratio/.test(LEDGER) &&
  /no building does both/.test(LEDGER));
// PASS CONDITION 8
check("4/8 — Jarvan and the Academy are ledgered together, with both magnitudes",
  /js\/buildings\.js:628 academy/.test(LEDGER) && /x1\.97/.test(LEDGER) && /x2\.00/.test(LEDGER) &&
  /PARITY-of-magnitude, RR-ORIGINAL-of-shape/.test(LEDGER));
check("4/8 — the Academy `skillXP` line is SPECIFIED and NOT SHIPPED, with the Jarvan interaction named",
  /MISSING CONTENT — RR has no building that accelerates learning/.test(LEDGER) &&
  /silently stack to x4/.test(LEDGER) &&
  await page.evaluate(() => !BUILDINGS.some(b => b.skillXP !== undefined)));
check("4/8 — no XP magnitude moved this round",
  await page.evaluate(() => XP_PER_SECOND === 0.05 && XP_CAP === Math.floor(11500 * 20001 / 9000)));
// PASS CONDITION 22
check("11/22 — the category census is recorded in STANDING-RULINGS as an OPEN QUESTION",
  /## 31\./.test(RULINGS) && /OPEN QUESTION, ruling requested v0\.61/.test(RULINGS) &&
  /a category is a kind of effect, not an individual effect/i.test(RULINGS));
check("11/22 — ...with its figures, so the next round does not re-derive them",
  /×6\.42/.test(RULINGS) && /2 members in the whole game/.test(RULINGS) && /41%/.test(RULINGS));
check("11/22 — a ledger row names the stack as a standing structural divergence",
  /THE MULTIPLICATIVE CATEGORY COUNT — RULING REQUESTED/.test(LEDGER) &&
  /game\.js:3409-3440/.test(LEDGER));
check("11/22 — NO category was collapsed this round: Part 1's change is INSIDE one category",
  await page.evaluate(() => {
    // the five global categories still multiply against each other
    return /catMonument/.test(document.documentElement.innerHTML) &&
           /catReligion/.test(document.documentElement.innerHTML) &&
           /catMeta/.test(document.documentElement.innerHTML);
  }) && /CONV_DISCOVERY_LINE/.test(CODE));

// ============================================================================
// PASS CONDITION 23 — the unchanged set
// ============================================================================
const unchanged = await page.evaluate(() => {
  loadFromString(btoa(unescape(encodeURIComponent(JSON.stringify(freshState())))));
  const capped = Object.keys(RES).filter(r => RES[r].baseCap !== undefined);
  return {
    families: [...new Set(capped.map(r => capFamilyOf(r)).filter(Boolean))].sort(),
    multiFamily: capped.filter(r => [CAP_MULT_EXEMPT[r], CAP_SCOPE[r]].filter(Boolean).length !== 1),
    cost: auditCostGraph().length, raw: auditRawGraph().length,
    barn: +BARN_LINE.reduce((a, u) => a + u[1], 0).toFixed(4),
    ware: +WAREHOUSE_LINE.reduce((a, u) => a + u[1], 0).toFixed(4),
    consumption: CONSUMPTION, xp: XP_PER_SECOND
  };
});
check("23 — capFamilyOf() is still TWO families and every capped resource is in exactly one",
  unchanged.families.length === 2 && unchanged.multiFamily.length === 0,
  unchanged.families.join(", "));
check("23 — both graph audits are ZERO after a merged tech, a new discovery and 38 repriced costs",
  unchanged.cost === 0 && unchanged.raw === 0, `${unchanged.cost} / ${unchanged.raw}`);
check("23 — Σ 4.35 / 1.80, CONSUMPTION 4.25, ratio 1.17647, XP_PER_SECOND 0.05",
  unchanged.barn === 4.35 && unchanged.ware === 1.8 &&
  Math.abs(unchanged.consumption - 4.25) < 1e-9 && unchanged.xp === 0.05,
  `barn Σ${unchanged.barn}, warehouse Σ${unchanged.ware}, CONSUMPTION ${unchanged.consumption}`);

// ============================================================================
// THE ROUND ITSELF
// ============================================================================
const version = await page.evaluate(() => VERSION);
check("the version is well-formed under the scheme and is at or after this suite's own round",
  /^v0\.\d\d(\.\d+)?$/.test(version) && parseFloat(version.replace(/^v/, "")) >= 0.61, version);
check("...and the footer renders from the constant",
  await page.evaluate(() => (document.body.innerText || "").indexOf(VERSION) > -1));
check("the consumed v0.61 spec is archived under docs/specs/, and the root does not still hold it",
  (() => {
    let archived = false, rootIsV061 = false;
    try { readFileSync(new URL("../docs/specs/rr-analyzer-v061-spec.md", import.meta.url)); archived = true; } catch (e) {}
    try {
      const root = readFileSync(new URL("../current-build-spec.md", import.meta.url), "utf8").slice(0, 4000);
      rootIsV061 = /BUILDER SPEC v0\.61\b/.test(root);
    } catch (e) {}
    return archived && !rootIsV061;
  })());
check("no console errors across the whole suite", errors.length === 0, errors.slice(0, 3).join(" | "));

console.log(`\n${pass} passed, ${fail} failed`);
suiteEnd(import.meta.url, pass, fail);
process.exit(fail ? 1 : 0);
