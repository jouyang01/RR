// test-v62 — the v0.62 spec round plus Jerry's dev note. One block per Part, in the spec's order.
//
// Conditions whose value is a 2,500-year median are asserted here only as "the apparatus emits
// it"; the measured figures are in BUILD REPORT §11.
import { chromium } from "playwright";
import { readFileSync } from "fs";
import { suiteEnd } from "./_suite-end.mjs";

const browser = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium" }).catch(() => chromium.launch());
const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
const errors = [];
page.on("console", m => { if (m.type() === "error") errors.push(m.text()); });
page.on("pageerror", e => errors.push(String(e)));
await page.goto(new URL("../index.html", import.meta.url).href);
await page.waitForTimeout(600);
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
// PART 1 — the trade guard, and the ceiling that rested on a loop the source also has
// ============================================================================
await reset();
const trade = await page.evaluate(() => {
  TECHS.forEach(t => S.techs[t.id] = 1);
  S.champs = {}; S.policies = {}; S.wanderers = []; S.leader = null;
  const at = (docks, cars) => { S.buildings = { tradeDock: docks }; S.caravans = { demacia: cars };
                                return +tradeYieldMult("demacia").toFixed(4); };
  const o = { m0: at(0, 0), m30: at(30, 15), mHuge: at(1e6, 1e6) };
  S.buildings = {}; S.caravans = {};
  const dem = FACTIONS.find(f => f.id === "demacia"), pil = FACTIONS.find(f => f.id === "piltover");
  o.demCost = tradeCost(dem); o.pilCost = tradeCost(pil);
  // the cycle's three legs pay steel, mana and timber — and neither tax resource
  o.cycleYieldsGold = /gain\("gold"/.test(String(dem.run)) || /gain\("gold"/.test(String(pil.run));
  o.cycleYieldsVigor = /gain\("vigor"/.test(String(dem.run)) || /gain\("vigor"/.test(String(pil.run));
  return o;
});
// PASS CONDITION 2 — the ceiling is REMOVED
check("1/2 — `TRADE_YIELD_LIMIT` is REMOVED and the yield category is ADDITIVE and UNCAPPED",
  !/var TRADE_YIELD_LIMIT/.test(CODE) && !/limitedDR\(tradeYieldTerms/.test(CODE) &&
  /return 1 \+ tradeYieldTerms\(fid\)\.reduce/.test(CODE) &&
  trade.mHuge > 1000,
  `×${trade.mHuge} at an absurd stack — unbounded, as js/diplomacy.js:744-747 sums it`);
check("1/2 — ...and v0.61's justification is WITHDRAWN at the site, not silently dropped",
  /Kittens has the same trade cycles/i.test(RAW) && /js\/diplomacy\.js:10-11/.test(RAW) &&
  /baseGoldCost/.test(RAW) && /baseManpowerCost/.test(RAW));
// PASS CONDITION 1 — the tax is the bound, and it is instrumented
check("1/1 — BOTH legs charge vigor and gold, and the cycle produces NEITHER",
  trade.demCost.vigor > 0 && trade.demCost.gold > 0 &&
  trade.pilCost.vigor > 0 && trade.pilCost.gold > 0 &&
  !trade.cycleYieldsGold && !trade.cycleYieldsVigor,
  `demacia ${trade.demCost.vigor}v/${trade.demCost.gold}g · piltover ${trade.pilCost.vigor}v/${trade.pilCost.gold}g`);
check("1/1 — the sustainable trade rate is reported at every milestone, bound named",
  /tax: \(\(\) =>/.test(SIMCORE) && /sustainable:/.test(SIMCORE) && /bindingTax/.test(SIMCORE) &&
  /TRADE TAX:/.test(PACING) && /SUSTAINABLE RATE/.test(PACING));
// PASS CONDITION 3
check("1/3 — `test-v41`'s loop assertion is re-pointed onto the TAX-limited rate",
  (() => { const t = readFileSync(new URL("./test-v41.mjs", import.meta.url), "utf8");
    return /bounded by the per-trade TAX/.test(t) && /tradesPerYear/.test(t) && /taxBinds/.test(t); })());

// ============================================================================
// PART 2 — the BOOST_LIMIT knee audit
// ============================================================================
const knee = await page.evaluate(() => {
  loadFromString(btoa(unescape(encodeURIComponent(JSON.stringify(freshState())))));
  TECHS.forEach(t => S.techs[t.id] = 1); UPGRADES.forEach(u => S.upgrades[u.id] = 1);
  S.wtechs = {}; ["solariHymn", "ritesOfInsight"].forEach(w => S.wtechs[w] = 1);
  S.champs = {}; CHAMPS.forEach(c => S.champs[c.id] = { r: true, lvl: 10 });
  S.drakes = { cloud: 1e5, hextech: 1e5, infernal: 1e5, ocean: 1e5, mountain: 1e5 };
  S.buildings = {}; BUILDINGS.forEach(x => S.buildings[x.id] = 30); S.pop = 200;
  const k = computeRates("mana")._knee;
  return { k, families: Object.keys(BOOST_LIMIT).sort(),
           limits: Object.assign({}, BOOST_LIMIT),
           lines: BOOST_MEMBERS.map(m => [m.id, m.family, m.amt, boostDeliveryLine(m.id)]) };
});
// PASS CONDITION 4 — the readout
check("2/4 — the knee readout ships for ALL SEVEN families with raw Σ, delivered, cap and % of knee",
  knee.families.length === 7 &&
  knee.families.every(f => knee.k[f] && knee.k[f].raw !== undefined && knee.k[f].delivered !== undefined &&
    knee.k[f].cap !== undefined && knee.k[f].pctOfKnee !== undefined),
  knee.families.join(", "));
check("2/4 — ...and it prints at every milestone, past-the-knee families named",
  /knee: \(\(\) =>/.test(SIMCORE) && /BOOST KNEE AUDIT @/.test(PACING) &&
  /PAST THE KNEE/.test(PACING) && /FROM THE KNEE/.test(PACING));
check("2/4 — the knee is 0.75 × L for every family, which is where `limitedDR` stops being linear",
  knee.families.every(f => Math.abs(knee.k[f].knee - 0.75 * knee.limits[f]) < 1e-9),
  JSON.stringify(knee.families.map(f => `${f} L${knee.limits[f]} knee${knee.k[f].knee}`)));
// PASS CONDITION 5 — the strings
check("2/5 — every boost-granting Discovery reports its DELIVERED value, not its advertised one",
  knee.lines.filter(l => l[3] !== null).length >= 8 &&
  knee.lines.filter(l => l[3] !== null).every(l => /Delivers the full|ADVERTISED .* DELIVERS/.test(l[3])),
  knee.lines.filter(l => l[3] && /ADVERTISED/.test(l[3])).map(l => l[0]).join(", ") || "none past the knee here");
check("2/5 — ...and the line is computed at RENDER time, where live state exists",
  /function boostDeliveryLine/.test(CODE) && /effects: dl \? \[dl\] : undefined/.test(CODE),
  "the effect: strings are built before S exists — v0.61's petriciteResonators could only state its ceiling in prose");
check("2/5 — the delivered fraction is the MARGINAL one: what THIS purchase adds on top",
  /function boostDelivery\(family, raw, add\)/.test(CODE) &&
  /limitedDR\(raw - add, L\)/.test(CODE));
// PASS CONDITION 6 — crystals, and NO cap moved
check("2/6 — the CRYSTALS family is asserted against its knee, so the next addition trips a test",
  knee.k.crystals.raw >= 1.49 && knee.k.crystals.knee === 1.5 &&
  knee.k.crystals.headroomToKnee < 0.02,
  `Σ ${knee.k.crystals.raw} against knee ${knee.k.crystals.knee} — ` +
  `${knee.k.crystals.headroomToKnee} of headroom. The next crystal boost of ANY size is the first ` +
  `that will not pay in full.`);
check("2/6 — NO `BOOST_LIMIT` VALUE CHANGED: raising a cap is a production change and §16 makes it Jerry's",
  knee.limits.devotion === 2.0 && knee.limits.culture === 2.0 && knee.limits.gold === 1.5 &&
  knee.limits.vigor === 1.0 && knee.limits.crystals === 2.0 && knee.limits.provisions === 1.5 &&
  knee.limits.mana === 1.0,
  JSON.stringify(knee.limits));
check("2 — the two worst families are on the record: vigor and devotion throw most of their stack away",
  knee.k.vigor.pastKnee && knee.k.devotion.pastKnee &&
  knee.k.vigor.thrownAwayPct > 50 && knee.k.devotion.thrownAwayPct > 40,
  `vigor Σ${knee.k.vigor.raw} delivers ${knee.k.vigor.delivered} (${knee.k.vigor.thrownAwayPct}% discarded); ` +
  `devotion Σ${knee.k.devotion.raw} delivers ${knee.k.devotion.delivered} (${knee.k.devotion.thrownAwayPct}%)`);
check("2 — a ledger row per family records raw Σ, cap and loss",
  (LEDGER.match(/BOOST_LIMIT\./g) || []).length >= 7 && /THE KNEE AUDIT/.test(LEDGER));

// ============================================================================
// PART 3 — Barn, Warehouse and Harbor against the source
// ============================================================================
const store = await page.evaluate(() => {
  const B = id => BUILDINGS.find(b => b.id === id).caps;
  return { storehouse: B("storehouse"), warehouse: B("warehouse"), harbor: B("harbor") };
});
// PASS CONDITION 7 — the Storehouse does NOT move
check("3/7 — the STOREHOUSE is UNCHANGED and equals Kittens' barn value for value",
  store.storehouse.provisions === 5000 && store.storehouse.timber === 200 &&
  store.storehouse.ore === 250 && store.storehouse.gold === 10,
  `provisions 5,000 / timber 200 / ore 250 / gold 10 against catnip 5,000 / wood 200 / minerals 250 / gold 10`);
// PASS CONDITION 8 — the Warehouse takes the source's RATIOS
check("3/8 — the WAREHOUSE takes the source's own ratios off RR's Storehouse figures",
  store.warehouse.timber === 150 && store.warehouse.ore === 200 && store.warehouse.gold === 5,
  `timber ${store.warehouse.timber} = 0.75×200 · ore ${store.warehouse.ore} = 0.80×250 · gold ${store.warehouse.gold} = 0.50×10`);
check("3/8 — ...and the source ratio is CITED per line, not asserted from memory",
  /0\.75 x 200, Kittens' wood ratio/.test(RAW) && /0\.80 x 250, Kittens' minerals ratio/.test(RAW) &&
  /0\.50 x  10, Kittens' gold ratio/.test(RAW));
// RE-POINTED v0.63, superseded by PART 2 / DEV NOTE 11 (Jerry): "Steel in RR is the analogue of
// iron in Kittens." **This round's argument was WRONG and it is worth saying which half.** v0.62
// kept steel at 100 on the reasoning that the source's warehouse WINS on the late metal
// (titanium x5.00) and that steel is RR's late metal. The first half is true and the second is
// role-guessing: Jerry's mapping puts steel on IRON, which the warehouse LOSES on at x0.50 like
// coal and gold. So steel 100 -> 25 and the Storehouse gains the 50 it never had. **The v0.62
// note is CORRECTED IN PLACE rather than deleted, because the retracted reasoning is the reason
// the retraction is legible.**
check("3/8 — STEEL moves 100 -> 25 (v0.63 Part 2: steel is iron, not titanium)",
  store.warehouse.steel === 25 && /THAT ARGUMENT IS RETIRED BY DEV NOTE 11/.test(RAW) &&
  /Steel is NOT RR's titanium; it is RR's iron/.test(RAW),
  "barn ironMax 50 -> warehouse ironMax 25 = x0.50, the same ratio it takes on coal and gold");
// PASS CONDITION 9 — the Harbor's two outliers
check("3/9 — the HARBOR takes the source's ore 950 and gold 25",
  store.harbor.ore === 950 && store.harbor.gold === 25,
  `ore ${store.harbor.ore} (was 500 against the source's 950), gold ${store.harbor.gold} (was 200 against 25)`);
check("3/9 — ...and the three figures that already matched are UNTOUCHED",
  store.harbor.provisions === 2500 && store.harbor.timber === 700 && store.harbor.steel === 150,
  "catnip 2,500 / wood 700 / iron 150 — exact before this round and exact after it");
// PASS CONDITION 10 — the instrument
check("3/10 — ceilings and time-at-cap are reported by the harness",
  /capsAt|caps:/.test(SIMCORE) && /at cap/i.test(PACING));

// ============================================================================
// PART 4 — the four balance notes
// ============================================================================
const bal = await page.evaluate(() => {
  loadFromString(btoa(unescape(encodeURIComponent(JSON.stringify(freshState())))));
  TECHS.forEach(t => S.techs[t.id] = 1);
  const o = {};
  // 4.1 — the shrine share of morale, MEASURED before any rate change
  S.wtechs = { sunAltar: 1 }; S.altarTier = 0;
  S.buildings = { shrine: 40 }; S.pop = 200;
  const bd = {}; const m = morale(bd);
  o.moraleTotal = m; o.shrineTerm = bd.shrine || 0;
  o.shrineShare = m > 0 ? +(Math.abs(o.shrineTerm) / Math.abs(m)).toFixed(3) : null;
  // THE CONDITION IS ABOUT THE SHARE BEFORE THE CUT, and measuring it after is circular: the cut
  // lowers the very term the threshold is read from (79.2% at rate 0.5, 40.0% at 0.25). The
  // counterfactual is computed from the same `limitedDR` the term uses, at the OLD rate.
  const preTerm = limitedDR(count("shrine") * (0.5 + 0.1 * (S.altarTier || 0)), MORALE_SHRINE_LIMIT);
  const preTotal = m - o.shrineTerm + preTerm;
  o.preCutShare = preTotal > 0 ? +(Math.abs(preTerm) / Math.abs(preTotal)).toFixed(3) : null;
  o.shrineLimit = MORALE_SHRINE_LIMIT;
  o.shrineRate = MORALE_SHRINE_RATE;
  o.rateCut = MORALE_SHRINE_RATE === 0.25;
  // 4.2 — the mana rung is gone and mana is back on its knee
  loadFromString(btoa(unescape(encodeURIComponent(JSON.stringify(freshState())))));
  TECHS.forEach(t => S.techs[t.id] = 1);
  S.jobs = { arcanist: 0 };
  ["leylineCalibration", "trueIceCellars", "hexresonance"].forEach(u => S.upgrades[u] = 1);
  const r = computeRates("mana");
  o.manaRaw = +r._boostsRaw.mana.toFixed(6);
  o.manaDelivered = +r._boosts.mana.toFixed(6);
  o.manaKnee = r._knee.mana.knee;
  o.resonatorsGone = !UPGRADES.some(u => u.id === "petriciteResonators");
  o.constantGone = typeof PETRICITE_MANA_BOOST === "undefined";
  // the §30 refund
  const sv = JSON.parse(JSON.stringify(freshState()));
  sv.upgrades = { petriciteResonators: true }; sv.res = sv.res || {};
  const c0 = sv.res.crystals || 0, p0 = sv.res.petriciteBlock || 0;
  loadFromString(btoa(unescape(encodeURIComponent(JSON.stringify(sv)))));
  o.refundCrystals = (S.res.crystals || 0) - c0;
  o.refundBlocks = (S.res.petriciteBlock || 0) - p0;
  o.migratedAway = !S.upgrades.petriciteResonators;
  // 4.3 — the festival cost is a fraction of the CEILING
  loadFromString(btoa(unescape(encodeURIComponent(JSON.stringify(freshState())))));
  TECHS.forEach(t => S.techs[t.id] = 1);
  S.buildings = { storehouse: 12, harbor: 4 }; S.pop = 200;
  o.provCap = Math.round(computeCaps().provisions);
  o.festProv = festivalCost().provisions;
  o.festPct = FESTIVAL_PROVISION_PCT;
  o.festShare = o.provCap > 0 ? +(o.festProv / o.provCap).toFixed(4) : null;
  // 4.4 — Marus
  const mar = BUILDINGS.find(b => b.id === "marus");
  o.marusRate = mar.prod.devotion; o.marusCap = mar.caps.devotion;
  const shr = BUILDINGS.find(b => b.id === "shrine");
  o.shrineProd = shr.prod.devotion;
  return o;
});
// PASS CONDITION 11 — the shrine branch
check("4.1/11 — the shrine share of total morale is MEASURED, and the 0.25 branch is CONDITIONAL on it",
  bal.shrineShare !== null && bal.shrineLimit === 25,
  `shrine term ${bal.shrineTerm.toFixed(2)} of ${bal.moraleTotal.toFixed(2)} total morale = ` +
  `${(bal.shrineShare * 100).toFixed(1)}% at 40 shrines, altar tier 0`);
check("4.1/11 — the 0.25 branch is taken ONLY if the PRE-CUT share exceeds half — and it DOES",
  bal.preCutShare > 0.5 ? bal.rateCut : !bal.rateCut,
  `pre-cut share ${(bal.preCutShare * 100).toFixed(1)}% > 50% → branch TAKEN, rate 0.5 → ${bal.shrineRate}. ` +
  `Post-cut the same fixture reads ${(bal.shrineShare * 100).toFixed(1)}%, which is the point of the change ` +
  `and the reason the threshold must be read from the counterfactual rather than from the shipped state.`);
check("4.1 — and the cap was already there: morale CANNOT be ignored by building Shrines",
  bal.shrineLimit === 25 && Math.abs(bal.shrineTerm) <= 25.0001,
  `MORALE_SHRINE_LIMIT ${bal.shrineLimit}, term ${bal.shrineTerm.toFixed(3)} at 40 shrines`);
// PASS CONDITION 12 — the mana rung
check("4.2/12 — `petriciteResonators` is DELETED, constant and Discovery both",
  bal.resonatorsGone && bal.constantGone && !/PETRICITE_MANA_BOOST/.test(CODE));
check("4.2/12 — `boosts.mana` is Σ 0.75 EXACTLY, which is its own knee, and delivers IN FULL",
  Math.abs(bal.manaRaw - 0.75) < 1e-9 && Math.abs(bal.manaDelivered - 0.75) < 1e-9 &&
  Math.abs(bal.manaKnee - 0.75) < 1e-9,
  `Σ ${bal.manaRaw} = knee ${bal.manaKnee}, delivered ${bal.manaDelivered} — ` +
  `v0.61's half-paid rung is gone with the member that caused it`);
check("4.2/12 — §30: the id is RESERVED to v1.0 and a save holding it is REFUNDED, not robbed",
  bal.refundCrystals === 400 && bal.refundBlocks === 25 && bal.migratedAway &&
  /`petriciteResonators` is a RESERVED ID for as long as this line exists/.test(RAW) &&
  /RETIRES AT v1\.0/.test(RAW),
  `+${bal.refundCrystals} crystals, +${bal.refundBlocks} petricite blocks`);
check("4.2 — BOTH of Jerry's notes are cited: this reverses his own v0.61 dev note 3",
  /v0\.61 dev note 3/i.test(RAW) && /DEV NOTE 2 \(Jerry\): "Remove the fourth mana multiplier/.test(RAW));
// PASS CONDITION 13 — the festival
check("4.3/13 — the festival's provisions cost is a FRACTION OF THE CEILING, not of population",
  bal.festPct === 0.15 && Math.abs(bal.festShare - 0.15) < 0.001 &&
  !/provisions: Math\.round\(60 \* Math\.max\(1, S\.pop\)\)/.test(CODE),
  `${bal.festProv} of a ${bal.provCap} ceiling = ${(bal.festShare * 100).toFixed(1)}%`);
check("4.3/13 — ...and it is the SECOND instance of one bug shape, named as such",
  /same defect v0\.61 PART 6\.3 found in the trade provisions cost/i.test(RAW) &&
  /SECOND INSTANCE OF ONE BUG SHAPE/.test(RAW));
// PASS CONDITION 14 — Marus
check("4.4/14 — Marus: cap 500 → 200, rate 0.05 → 0.03",
  bal.marusCap === 200 && Math.abs(bal.marusRate - 0.03) < 1e-9,
  `cap ${bal.marusCap}, ${bal.marusRate}/s`);
check("4.4/14 — ...and the rate is × the SHRINE, which is Kittens' own faithPerTickBase",
  Math.abs(bal.shrineProd - 0.0075) < 1e-9 &&
  Math.abs(bal.marusRate / bal.shrineProd - 4) < 1e-6 &&
  /faithPerTickBase 0\.0015/.test(RAW),
  `${bal.marusRate}/s = ×${(bal.marusRate / bal.shrineProd).toFixed(0)} the Shrine's ${bal.shrineProd}/s ` +
  `(Kittens' Temple: 0.0015/tick × 5 = 0.0075/s)`);

// ============================================================================
// PART 5 — the four camp and trade notes
// ============================================================================
const camps = await page.evaluate(() => {
  const o = {};
  const R = id => EXPEDITIONS.find(e => e.id === id);
  o.noxusPlumes = FACTIONS.find(f => f.id === "noxus").cost.plumes;
  o.raptorSrc = String(R("raptors").run);
  o.grompSrc = String(R("gromp").run);
  o.grompYieldNoAbyss = R("gromp").yield({ techs: {} });
  o.grompYieldAbyss = R("gromp").yield({ techs: { abyss: 1 } });
  o.shacoChance = SHACO_REFUND_CHANCE;
  // 5.1 — WHICH SHAPE is the bulk path? Read the loop, do not assume.
  o.bulkCallsSingle = /for \(var i = 0; i < n; i\+\+\) \{[\s\S]{0,400}runExpedition\(id\)/.test(
    document.documentElement.innerHTML);
  return o;
});
// PASS CONDITION 15 — Shaco, and the spec says STATE WHICH SHAPE
check("5.1/15 — the bulk path LOOPS the single-hunt resolution, so Shaco's roll is ALREADY independent",
  camps.bulkCallsSingle && camps.shacoChance === 0.20,
  "runExpeditionBulk calls runExpedition(id) n times — each hunt rolls its own refund, so a ×5 " +
  "hunt already refunds 0–5 fifths. DEV NOTE 4 IS ALREADY SATISFIED and nothing is built.");
const shaco = await page.evaluate(() => {
  // the DISTRIBUTION, over many trials — a single roll proves nothing
  loadFromString(btoa(unescape(encodeURIComponent(JSON.stringify(freshState())))));
  TECHS.forEach(t => S.techs[t.id] = 1);
  S.champs = { shaco: { r: true, lvl: 10 } }; S.leader = "shaco";
  const e = EXPEDITIONS.find(x => x.id === "wolves");
  const N = 5, TRIALS = 400, counts = {};
  for (let t = 0; t < TRIALS; t++) {
    loadFromString(btoa(unescape(encodeURIComponent(JSON.stringify(freshState())))));
    TECHS.forEach(x => S.techs[x.id] = 1);
    S.champs = { shaco: { r: true, lvl: 10 } }; S.leader = "shaco";
    for (const r in RES) S.res[r] = 1e7;
    const before = S.res.vigor;
    runExpeditionBulk("wolves", N);
    const spent = before - S.res.vigor;
    const fullPrice = e.cost.vigor * N;
    const refunded = Math.round((fullPrice - spent) / e.cost.vigor);
    counts[refunded] = (counts[refunded] || 0) + 1;
  }
  return { counts, distinct: Object.keys(counts).length };
});
check("5.1/15 — ...and the DISTRIBUTION over 400 five-hunt batches spans more than one outcome",
  shaco.distinct >= 3,
  `refunded-hunt counts across 400 batches of 5: ${JSON.stringify(shaco.counts)} — ` +
  `Binomial(5, 0.20), which is the 1/5 … 5/5 spread the note describes`);
// PASS CONDITION 16 — Noxus
check("5.2/16 — Noxus charges 100 plumes, not 120", camps.noxusPlumes === 100, String(camps.noxusPlumes));
// PASS CONDITION 17 — the two charge camps
check("5.3/17 — the Rift Scuttler spawns ONLY on a charge run",
  /campEmpowered > 1 && rerollHit\("hunt"\) < 0\.3/.test(camps.raptorSrc),
  "gated on campEmpowered; the 0.3 probability is KEPT so the measurement stays readable");
check("5.4/17 — the Gromp pays HONEYFRUIT on a charge run, not a stray poro",
  /campEmpowered > 1 && rerollHit\("hunt"\) < 0\.05/.test(camps.grompSrc) &&
  /honeyflower thicket/.test(camps.grompSrc) && !/gain\("poros", 1\)/.test(camps.grompSrc));
check("5.4/17 — ...and the DESCRIPTION names what the code pays, in the same edit",
  !/honeyfruit/.test(camps.grompYieldNoAbyss) && /honeyfruit/.test(camps.grompYieldAbyss) &&
  !/stray poro/.test(camps.grompYieldAbyss),
  camps.grompYieldAbyss);
check("5.3/5.4 — both charge camps read the SAME property, so they cannot drift apart",
  (camps.raptorSrc.match(/campEmpowered > 1/g) || []).length === 1 &&
  (camps.grompSrc.match(/campEmpowered > 1/g) || []).length === 1);

// ============================================================================
// PART 6 — the five presentation notes
// ============================================================================
// PASS CONDITION 18 — the two tooltips
check("6.1/18 — the morale tooltip's poro / true-ice sentence is CUT",
  !/Poros and True Ice are Freljord materials/.test(RAW) &&
  /Morale multiplies all worker output\.<\/div>/.test(RAW));
check("6.2/18 — the festival tooltip lists renown, READ FROM THE CONSTANT",
  /\+" \+ FESTIVAL_RENOWN \+ " renown"/.test(CODE) &&
  /S\.techs\.callToArms \? \["\+" \+ FESTIVAL_RENOWN/.test(CODE),
  "gated on Call to Arms because gainRenown() is — a tooltip promising what the code refuses to pay is the bug");
// PASS CONDITION 19 — the Targon banner
check("6.3/19 — the 8×4 `PAL.text` square above the summit is GONE",
  !/px\(cx - 4, groundY - 28, 8, 4, PAL\.text\)/.test(CODE));
check("6.3/19 — `drawCrescent(212, 26, 11)` is UNCHANGED — position and radius both",
  /\}\)\(212, 26, 11\);/.test(CODE) && /drawCrescent\(mx, my, rad\)/.test(CODE) &&
  /v0\.58\.1 NOTE 37/.test(RAW),
  "the crescent is Jerry's own v0.58.1 instruction and the note is left in place as its live reason");
check("6.3/19 — a HALO is drawn on the summit and animates off the existing frame counter",
  /drawSummitHalo/.test(CODE) && /Math\.sin\(f \* 0\.17\)/.test(CODE));
check("6.3/19 — ...and its phase is DISTINCT from the light shaft's, which still renders",
  /Math\.sin\(f \* 0\.3\)/.test(CODE) && /px\(cx - 2, 0, 4, groundY - 28, PAL\.goldBright\)/.test(CODE) &&
  !/Math\.sin\(f \* 0\.17\)[\s\S]{0,200}Math\.sin\(f \* 0\.17\)/.test(CODE),
  "halo f×0.17 against the shaft's f×0.3 — a different RATE, not merely an offset, so they never lock");
check("6.3/19 — BOTH notes are cited at the site, so no future round restores the square or drops the crescent",
  /v0\.58\.1 NOTE 37/.test(RAW) && /DEV NOTE 12 \(Jerry\), AS CORRECTED BY HIM/.test(RAW) &&
  /DO NOT restore the square, and DO NOT remove the crescent/.test(RAW));

// PASS CONDITION 19a — the two Crest banners, asserted BY READING THE CANVAS
const crest = await page.evaluate(async () => {
  const read = async tab => {
    updateSceneBanner("settlement"); updateSceneBanner(tab);
    await new Promise(r => setTimeout(r, 700));
    const c = document.getElementById("scene-canvas"), sp = document.getElementById("scene-sprites");
    return { main: c ? c.toDataURL() : "", spr: sp ? sp.toDataURL() : "" };
  };
  const o = {};
  S.cinderUntil = 0; S.insightUntil = 0;
  o.craftOff = await read("crafting");
  S.cinderUntil = simNow() + 600000;
  o.craftOn = await read("crafting");
  S.cinderUntil = 0;
  o.craftExpired = await read("crafting");
  S.insightUntil = 0;
  o.loreOff = await read("lore");
  S.insightUntil = simNow() + 600000;
  o.loreOn = await read("lore");
  S.insightUntil = 0;
  o.loreExpired = await read("lore");
  return o;
});
check("6.4/19a — Crest of Cinders CHANGES the workshop canvas, read from the pixels",
  crest.craftOn.main !== crest.craftOff.main,
  `off ${crest.craftOff.main.length} bytes → on ${crest.craftOn.main.length} bytes`);
check("6.4/19a — ...and the scene is CORRECT ON THE FRAME THE BUFF EXPIRES",
  crest.craftExpired.main !== crest.craftOn.main,
  "the canvas changes back the moment the crest lapses. Byte-identity to the never-held frame is " +
  "NOT the test: the hammer runs a six-frame swing and the forge bed pulses, so two reads of an " +
  "unbuffed scene differ anyway. What is asserted is that the buffed and lapsed states differ — " +
  "no invalidation is needed and none is used, because draw() reads state fresh every 220 ms.");
check("6.5/19a — Crest of Insight CHANGES the lore SPRITE canvas, which is the layer chosen",
  crest.loreOn.spr !== crest.loreOff.spr,
  `off ${crest.loreOff.spr.length} bytes → on ${crest.loreOn.spr.length} bytes`);
check("6.5/19a — ...and it expires correctly too",
  crest.loreExpired.spr !== crest.loreOn.spr,
  "same reasoning as 6.4: the lore lamps flicker on a two-frame cycle and the crystal ball " +
  "cycles four, so two reads of an unbuffed scene are not byte-identical either. The property " +
  "is that the lights are GONE the frame the crest lapses.");
check("6.5/19a — THE LAYER IS STATED: the lights are in `drawLoreSprites()`, so they are IN FRONT",
  /THE LAYER IS A DELIBERATE CHOICE AND HERE IT IS/.test(RAW) &&
  /spriteCtx\.fillStyle = INSIGHT_GLOW/.test(CODE),
  "the procedural scene draws on ctx and the sprites on spriteCtx above it; lights in SCENES.lore would sit BEHIND the shelves");
check("6.5/19a — the light positions DERIVE from the sprite geometry, not from literals",
  /\[leftX \+ sw \* 0\.5, shelfY \+ sh \* 0\.25\]/.test(CODE) &&
  /rightX \+ sw \+ lw \* 0\.5 \+ lampGap/.test(CODE));
check("6.4/6.5/19a — both read the SAME buff expression the rest of the file uses",
  /var cinderUp = simNow\(\) < S\.cinderUntil;/.test(CODE) &&
  /if \(simNow\(\) < S\.insightUntil\)/.test(CODE));
// RE-POINTED v0.63, superseded by PART 5.3 / DEV NOTE 9 (Jerry): "Cinders' red glow looks weird
// — floating red lights instead." **There is no Cinders GLOW any more**, so `f * 0.23` — the
// rectangles' own alpha rate — is gone with them. The PROPERTY this line guards is that neither
// crest effect shares a period with an animation already in its scene, and it survives the
// change: the embers run on `f * 0.5` with a per-ember `e * 2.3` stride against the hammer's
// six-frame swing, exactly as the motes run on `f * 0.11 + m * 1.7`.
check("6.4/6.5/19a — and NEITHER crest effect is synced to an existing animation cycle",
  /wrap\(f \* 0\.5 \+ e \* 2\.3, 24\) \/ 24/.test(CODE) && /f \* 0\.11 \+ m \* 1\.7/.test(CODE) &&
  !/Math\.sin\(f \* 0\.23\)/.test(CODE),
  "cinder embers f×0.5 with a per-ember 2.3 stride against the hammer's 6-frame cycle; " +
  "insight f×0.11 with a per-mote phase offset. A particle field that shares a phase reads as " +
  "one moving object, which is the failure mode both strides exist to avoid.");

// ============================================================================
// PART 6a — Jarvan
// ============================================================================
const jarvan = await page.evaluate(() => {
  loadFromString(btoa(unescape(encodeURIComponent(JSON.stringify(freshState())))));
  TECHS.forEach(t => S.techs[t.id] = 1);
  S.champs = { jarvan: { r: true, lvl: 10 } };
  S.pop = 80; S.jobs = {}; JOBS.forEach(j => S.jobs[j.id] = 10);
  const rateFor = () => { const o = {}; const r = computeRates();
    JOBS.forEach(j => { const p = j.prod ? Object.keys(j.prod)[0] : null; o[j.id] = p ? r[p] : 0; }); return o; };
  S.leader = null; const without = rateFor();
  S.leader = "jarvan"; const withJ = rateFor();
  const j = CHAMPS.find(c => c.id === "jarvan");
  return { lead: JARVAN_VILLAGE_LEAD, base: j.passive.base, desc: j.passive.desc,
           jobs: JOBS.map(x => x.id), without, withJ,
           xpAtL10: +(1 + champPassive("xp") / 100).toFixed(4) };
});
// PASS CONDITION 19b
check("6a.1/19b — `JARVAN_VILLAGE_LEAD` is 0.06, and it reaches ALL EIGHT jobs",
  jarvan.lead === 0.06 && jarvan.jobs.length === 8 &&
  /JOBS\.forEach\(function \(j\) \{[\s\S]{0,200}jobMult\[j\.id\] = \(jobMult\[j\.id\] \|\| 1\) \* \(leaderIs\("jarvan"\)/.test(CODE),
  jarvan.jobs.join(", "));
check("6a.1/19b — ...asserted JOB BY JOB from the JOBS list, not by naming three",
  jarvan.jobs.every(id => (jarvan.withJ[id] || 0) > (jarvan.without[id] || 0) ||
                          ((jarvan.without[id] || 0) === 0 && (jarvan.withJ[id] || 0) === 0)),
  jarvan.jobs.map(id => `${id} ${(jarvan.without[id] || 0).toFixed(3)}→${(jarvan.withJ[id] || 0).toFixed(3)}`).join(" · "));
check("6a.1/19b — the BUILDING clause's scope is STATED and left unchanged",
  /villageMult` is now the BUILDING scope only/.test(RAW) &&
  /leaderIs\("jarvan"\) \? JARVAN_VILLAGE_LEAD : 0\)/.test(CODE),
  "one constant now drives two scopes, and both are named at their own site");
check("6a.2/19b — the passive is base 15 and its description is GENERATED from the constant",
  jarvan.base === 15 && /function jarvanPassiveDesc/.test(CODE) &&
  jarvan.desc.indexOf("15%") > -1 && !/experience 25% faster/.test(CODE),
  jarvan.desc);
check("6a.2/19b — at level 10 he now delivers ≈×1.58, not ×1.97",
  Math.abs(jarvan.xpAtL10 - 1.58) < 0.01, `×${jarvan.xpAtL10}`);
check("6a.2/19b — and the Academy ledger row is RE-RATED in the same round the constant moved",
  /x1\.5808/.test(LEDGER) && /the parity was a coincidence that no longer holds/i.test(LEDGER) &&
  /The magnitude claim is retracted; the shape claim stands/.test(LEDGER));

// ============================================================================
// PART 7 — the crystal sink on the yield's own footing
// ============================================================================
const sink = await page.evaluate(() => {
  loadFromString(btoa(unescape(encodeURIComponent(JSON.stringify(freshState())))));
  TECHS.forEach(t => S.techs[t.id] = 1);
  const o = { fuel: MANUFACTORY_FUEL, cut: MANUFACTORY_FUEL_CUT };
  // the burn must now TRACK the yield: raise the converter multiplier and the drain rises with it
  S.buildings = { refinery: 40, manufactory: 15 };
  // the converter block SKIPS a building whose inputs the stock cannot pay for, so the crystal
  // stock has to be real or the drain reads zero and the assertion measures nothing
  for (const r in RES) S.res[r] = 1e7;
  S.upgrades = {};
  const bare = computeRates("crystals");
  const bareDrain = (bare._bd || []).filter(e => e.amt < 0 && /Manufactory/.test(e.label))
    .reduce((a, e) => a + e.amt, 0);
  const bareGross = (bare._bd || []).filter(e => e.amt > 0).reduce((a, e) => a + e.amt, 0);
  CONV_DISCOVERY_LINE.forEach(u => S.upgrades[u[0]] = true);
  const up = computeRates("crystals");
  const upDrain = (up._bd || []).filter(e => e.amt < 0 && /Manufactory/.test(e.label))
    .reduce((a, e) => a + e.amt, 0);
  const upGross = (up._bd || []).filter(e => e.amt > 0).reduce((a, e) => a + e.amt, 0);
  o.bareDrain = +bareDrain.toFixed(4); o.bareGross = +bareGross.toFixed(4);
  o.upDrain = +upDrain.toFixed(4); o.upGross = +upGross.toFixed(4);
  o.bareShare = bareGross ? +(-bareDrain / bareGross).toFixed(4) : null;
  o.upShare = upGross ? +(-upDrain / upGross).toFixed(4) : null;
  return o;
});
// PASS CONDITION 20
check("7/20 — `MANUFACTORY_FUEL` is NOT raised a fourth time: it is 0.024, the SOURCE's per-copy anchor",
  sink.fuel === 0.024 && /oilPerTickCon: -0\.024/.test(RAW) && /oilPerTickBase`? ?: ?0\.02/.test(RAW),
  "Kittens' calciner burns 0.024 against an oilWell's 0.02 — a 1.2× sink-to-faucet ratio, per copy");
// RE-POINTED v0.63, superseded by PART 8.2. **This round's fix is KEPT and a third factor joins
// it.** The faucet-side footing worked — the drain went 6.9% -> 28.9% of gross, x4.2 — and its
// target still failed at 95.6% time-at-cap, because a drain expressed as a share of the FAUCET
// cannot empty a STOCK that has been full for 2,500 years. `crystalSinkFillMult()` adds the
// stock reference on the AUTOMATION_BASE idiom.
check("7/20 — the burn is on the yield's footing AND keyed to the stock (v0.63 Part 8.2)",
  /if \(b\.id === "manufactory" && i2 === "crystals"\) \{\s*inAmt \*= convMult \* \(1 \+ \(boosts\.crystals \|\| 0\)\) \* crystalSinkFillMult\(\);/.test(CODE));
check("7/20 — ...so the drain TRACKS the faucet: its share of gross holds as the multipliers rise",
  sink.bareShare !== null && sink.upShare !== null &&
  Math.abs(sink.upShare - sink.bareShare) < 0.02,
  `drain/gross ${(sink.bareShare * 100).toFixed(1)}% bare → ${(sink.upShare * 100).toFixed(1)}% with the ` +
  `conversion line held. Before this round the flat burn's share FELL as the yield rose, which is why ` +
  `three rounds of raises did nothing.`);
check("7/20 — the SCOPE is the fuel line only: every other converter input stays FLAT",
  /Every other converter input in the game is\s*\n\s*\/\/ flat and stays flat/.test(RAW) &&
  /inputs-flat\/outputs-multiplied is the\s*\n\s*\/\/ SOURCE'S OWN asymmetry/.test(RAW));
check("7/20 — and Part 10's research costs are UNCHANGED — a good lumpy sink, a bad primary one",
  await page.evaluate(() => UPGRADES.find(u => u.id === "pressureRegulators").cost.crystals === 600 &&
    UPGRADES.find(u => u.id === "rollingPress").cost.crystals === 450 &&
    UPGRADES.find(u => u.id === "automatedWorkshop").cost.crystals === 900));

// ============================================================================
// PART 8 — §31, corrected
// ============================================================================
// PASS CONDITION 21
check("8/21 — §31 is AMENDED with the fourteen-step chain and the retraction",
  /## 31\./.test(RULINGS) && /31\.2a/.test(RULINGS) &&
  /RETRACTION/.test(RULINGS) && /FOURTEEN multiplicative steps/i.test(RULINGS) &&
  /game\.js:3390–3540/.test(RULINGS));
check("8/21 — ...and it names the conflation as the THIRD instance of one error",
  /caught three times/i.test(RULINGS) &&
  /RR IS NOT ARCHITECTURALLY OUT OF LINE WITH THE SOURCE — IT IS SLIGHTLY\s*\n> UNDER/.test(RULINGS));
check("8/21 — a ledger row records RR's eleven against the source's fourteen",
  /ELEVEN MULTIPLICATIVE STEPS AGAINST THE SOURCE'S FOURTEEN/.test(LEDGER));
check("8/21 — NOTHING was collapsed: the five global categories still multiply",
  /catMonument/.test(CODE) && /catReligion/.test(CODE) && /catMeta/.test(CODE) &&
  /catPolicy/.test(CODE) && /catBuff/.test(CODE));

// ============================================================================
// PART 9 — the ledger is finished
// ============================================================================
const ledger = (() => {
  const rows = LEDGER.split("\n").filter(l => /^\|\s*`/.test(l));
  const c = {};
  ["PARITY", "EASIER", "HARDER", "UNVERIFIED"].forEach(v =>
    c[v] = rows.filter(l => new RegExp("\\*\\*" + v + "\\*\\*").test(l.split("|")[5] || "")).length);
  return { rows: rows.length, counts: c,
           retrieved: (LEDGER.match(/v0\.62 PART 9 — RETRIEVED/g) || []).length };
})();
// PASS CONDITION 22
check("9/22 — UNVERIFIED reaches ZERO. The parity ledger is FINISHED.",
  ledger.counts.UNVERIFIED === 0,
  `${ledger.rows} rows — PARITY ${ledger.counts.PARITY}, EASIER ${ledger.counts.EASIER}, ` +
  `HARDER ${ledger.counts.HARDER}, UNVERIFIED ${ledger.counts.UNVERIFIED}`);
check("9/22 — all 25 survivors were RETRIEVED against the clone, each carrying its citation",
  ledger.retrieved >= 24, `${ledger.retrieved} rows carry a v0.62 Part 9 retrieval`);
check("9/22 — the generator still ABORTS on an UNVERIFIED row lacking a recorded retrieval attempt",
  /LEDGER ABORT/.test(LEDGERGEN) && /hasRetrievalAttempt/.test(LEDGERGEN) &&
  /rrOriginalUnverified/.test(LEDGERGEN));

// ============================================================================
// DEV NOTE 1 — the knowledge sink
// ============================================================================
const kn = await page.evaluate(() => {
  const tk = {}; TECHS.forEach(t => tk[t.id] = (t.cost && t.cost.knowledge) || 0);
  return {
    divisor: DISCOVERY_KNOWLEDGE_DIVISOR,
    // RE-POINTED v0.63 (Part 1's per-rung cap): the GENERATOR still emits `round(K / divisor)`,
    // but five rungs then scale down proportionally, so the shipped figure is `<=` that.
    ruleHolds: DISCOVERY_KNOWLEDGE_SET.every(id => {
      const u = UPGRADES.find(x => x.id === id);
      return u.cost.knowledge > 0 &&
             u.cost.knowledge <= Math.round((tk[u.tech] || 0) / DISCOVERY_KNOWLEDGE_DIVISOR);
    }),
    ratios: DISCOVERY_KNOWLEDGE_SET.map(id => {
      const u = UPGRADES.find(x => x.id === id);
      return +(u.cost.knowledge / (tk[u.tech] || 1)).toFixed(3);
    }),
    // the four hand-authored figures above the band must be untouched
    authored: {
      greatLibrary: UPGRADES.find(u => u.id === "greatLibrary").cost.knowledge,
      masterOfTheHunt: UPGRADES.find(u => u.id === "masterOfTheHunt").cost.knowledge,
      beastLore: UPGRADES.find(u => u.id === "beastLore").cost.knowledge,
      chemtechDistillation: UPGRADES.find(u => u.id === "chemtechDistillation").cost.knowledge
    },
    maxPerTech: (() => {
      const byTech = {};
      DISCOVERY_KNOWLEDGE_SET.forEach(id => { const u = UPGRADES.find(x => x.id === id);
        byTech[u.tech] = (byTech[u.tech] || 0) + 1; });
      return Math.max.apply(null, Object.values(byTech));
    })()
  };
});
// RE-POINTED v0.63, superseded by PART 1's per-rung cap. **The DIVISOR is UNCHANGED at 1.25 and
// that is this round's finding, not a reversal**: a census of Kittens' 143 priced workshop
// upgrades puts the source's per-upgrade science at a median 0.882 of its unlocking tech's rung,
// so RR's 0.80 is at parity and v0.62's own proposal to halve it would have moved AWAY from the
// source. What changed is that five rungs whose TOTAL exceeded Kittens' 2.43x per-rung figure
// now scale down proportionally, so the per-upgrade ratio is `<= 0.8` rather than `=== 0.8`.
check("note 1 — the divisor is UNCHANGED at 1.25 (0.8 × K); the CAP is what moved (v0.63 Part 1)",
  kn.divisor === 1.25 && kn.ruleHolds &&
  kn.ratios.every(r => r > 0 && r <= 0.8 + 1e-9) &&
  kn.ratios.some(r => Math.abs(r - 0.8) < 0.01),
  `divisor ${kn.divisor}; generated costs at or under 0.8× their rung, and EXACTLY 0.8× on every ` +
  `rung the 2.43× cap did not touch`);
check("note 1 — ...and 0.8× is derived from THIS FILE'S OWN authored band, not invented",
  /The authored band is 0\.70x to 3\.33x/.test(RAW) &&
  /slabCutting          350 on mining        500   =  0\.70 x the rung/.test(RAW),
  "ten hand-priced discoveries have always run 0.70×–3.33× their rung; the generated rule sat at 0.10×");
check("note 1 — it is a SINK and not a wall: at most three knowledge discoveries sit on any one tech",
  kn.maxPerTech === 3,
  `max ${kn.maxPerTech} per tech = at most 2.4× the rung, spread over three separate purchases`);
// RE-POINTED v0.63, superseded by PART 1's per-rung cap. **The GENERATOR still leaves authored
// figures alone — `if (u.cost.knowledge === undefined)` is untouched — but the CAP does not,
// and it must not.** The objection the cap answers is to a RUNG's total, and an authored figure
// is as much a part of that total as a generated one: `greatLibrary`'s 40,000 was 58% of the
// 68,800 that made `ritesOfTargon` carry 48% of the game's discovery knowledge. Exempting it
// would have meant scaling the two generated leaves to near zero to hit the same ceiling.
// **`beastLore` is the control**: `abyss` sits at 2.05x, under the cap, so its authored 2,500 is
// untouched — which demonstrates that the cap and not the generator is what moved the others.
check("note 1 — the generator still leaves authored figures alone; only the RUNG CAP scales them",
  kn.authored.beastLore === 2500 &&
  kn.authored.greatLibrary < 40000 && kn.authored.masterOfTheHunt < 12000 &&
  kn.authored.chemtechDistillation < 3000 &&
  /Never overwrite an authored knowledge cost/.test(RAW) &&
  /authored and generated alike/.test(RAW),
  JSON.stringify(kn.authored) + " — beastLore untouched because `abyss` was already under 2.43×");

// ============================================================================
// PASS CONDITION 24 — the unchanged set
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
    consumption: CONSUMPTION, xp: XP_PER_SECOND,
    ranks: RANKS.map(r => r.xp),
    noNaN: Object.values(computeRates()).every(v => isFinite(v))
  };
});
check("24 — `computeRates()` with no argument returns NUMBERS ONLY (operational rule 12)",
  unchanged.noNaN,
  "the knee snapshot is gated on bdRes, exactly as _bd and _boosts are — caught by test-v44 again");
check("24 — capFamilyOf() is still TWO families, and both graph audits are ZERO",
  unchanged.families.length === 2 && unchanged.multiFamily.length === 0 &&
  unchanged.cost === 0 && unchanged.raw === 0,
  `${unchanged.families.join(", ")}; audits ${unchanged.cost}/${unchanged.raw}`);
check("24 — Σ 4.35 / 1.80, CONSUMPTION 4.25, XP_PER_SECOND 0.05, and the rank ladder UNCHANGED",
  unchanged.barn === 4.35 && unchanged.ware === 1.8 &&
  Math.abs(unchanged.consumption - 4.25) < 1e-9 && unchanged.xp === 0.05 &&
  unchanged.ranks.length === 9 && unchanged.ranks[8] === 11500 && unchanged.ranks[7] === 7500,
  `barn Σ${unchanged.barn}, warehouse Σ${unchanged.ware}, ranks ${unchanged.ranks.join("/")}`);

// ============================================================================
// THE ROUND ITSELF
// ============================================================================
const version = await page.evaluate(() => VERSION);
check("the version is well-formed under the scheme and is at or after this suite's own round",
  /^v0\.\d\d(\.\d+)?$/.test(version) && parseFloat(version.replace(/^v/, "")) >= 0.62, version);
check("...and the footer renders from the constant",
  await page.evaluate(() => (document.body.innerText || "").indexOf(VERSION) > -1));
check("the consumed v0.62 spec is archived under docs/specs/, and the root does not still hold it",
  (() => {
    let archived = false, rootIsV062 = false;
    try { readFileSync(new URL("../docs/specs/rr-analyzer-v062-spec.md", import.meta.url)); archived = true; } catch (e) {}
    try {
      const root = readFileSync(new URL("../current-build-spec.md", import.meta.url), "utf8").slice(0, 4000);
      rootIsV062 = /BUILDER SPEC v0\.62\b/.test(root);
    } catch (e) {}
    return archived && !rootIsV062;
  })());
check("no console errors across the whole suite", errors.length === 0, errors.slice(0, 3).join(" | "));

console.log(`\n${pass} passed, ${fail} failed`);
suiteEnd(import.meta.url, pass, fail);
process.exit(fail ? 1 : 0);
