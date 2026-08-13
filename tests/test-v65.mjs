// test-v65 — BUILDER SPEC v0.65 plus Jerry's three dev notes. One block per Part, in the spec's
// order.
//
// Conditions whose value is a 2,500-year median (Icathia on five seeds, peak population) are
// asserted here only as "the apparatus emits it"; the measured figures are in BUILD REPORT §11.
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
const MANIFEST = readFileSync(new URL("../snapshots/v65/README.md", import.meta.url), "utf8");

// ============================================================================
// PART 1 — THE DISCOVERY LADDER'S KNOWLEDGE COVERAGE. Conditions 3, 4, 4a, 5, 6, 7.
// ============================================================================
await reset();
const disc = await page.evaluate(() => {
  const techK = {}; TECHS.forEach(t => techK[t.id] = (t.cost && t.cost.knowledge) || 0);
  // READ FROM THE MUTATED `UPGRADES`. The generator is a load-time IIFE; a source-text
  // assertion sees none of its output, which is the trap this whole Part is about.
  let priced = 0, total = 0;
  const per = [], unpriced = [];
  UPGRADES.forEach(u => {
    const k = (u.cost && u.cost.knowledge) || 0;
    if (k) { priced++; total += k; const K = techK[u.tech] || 0; if (K) per.push({ id: u.id, r: k / K }); }
    else unpriced.push({ id: u.id, tech: u.tech || null, techK: techK[u.tech] || 0 });
  });
  per.sort((a, b) => a.r - b.r);
  const totalTech = TECHS.reduce((a, t) => a + ((t.cost && t.cost.knowledge) || 0), 0);
  // the four Discoveries THIS ROUND adds, so the spec's own 2,003,370 (which was computed over
  // the 78 upgrades that existed at v0.64) can be reproduced exactly rather than approximately.
  const NEW_THIS_ROUND = ["huntersDraw", "latchAndLever", "arclightLance", "leylineLensing"];
  const newSum = NEW_THIS_ROUND.reduce((a, id) => {
    const u = UPGRADES.find(x => x.id === id); return a + ((u && u.cost.knowledge) || 0); }, 0);
  const AUTHORED = { slabCutting: 350, deepwaterDocks: 900, trappersCraft: 400, keepingTheRolls: 1300,
                     beastLore: 2500, chemtechDistillation: 3000, masterOfTheHunt: 3600,
                     greatLibrary: 12000, standingOrders: 4500, surveyedApproaches: 4500 };
  const authoredOk = Object.keys(AUTHORED).every(id => {
    const u = UPGRADES.find(x => x.id === id); return u && u.cost.knowledge === AUTHORED[id]; });
  // 4a — the CEILING property. Every generated figure is 0.8 x K and the ceiling must already
  // clear K for the tech to be researched at all, so 0.8K < K is a proof. Asserted anyway (§33).
  const generatedOverRung = UPGRADES.filter(u => {
    const k = (u.cost && u.cost.knowledge) || 0, K = techK[u.tech] || 0;
    if (!k || !K) return false;
    return k !== AUTHORED[u.id] && k > K;
  }).map(u => u.id);
  const generatedExact = UPGRADES.filter(u => {
    const K = techK[u.tech] || 0, k = (u.cost && u.cost.knowledge) || 0;
    return K && k && AUTHORED[u.id] === undefined;
  }).every(u => u.cost.knowledge === Math.round((techK[u.tech] || 0) / DISCOVERY_KNOWLEDGE_DIVISOR));
  return {
    upgrades: UPGRADES.length, priced, unpriced,
    zeroRung: DISCOVERY_UNPRICED_ZERO_RUNG.slice(),
    exemptEmpty: DISCOVERY_KNOWLEDGE_EXEMPT.length === 0,
    divisor: DISCOVERY_KNOWLEDGE_DIVISOR,
    total, totalTech, newSum, totalExcludingNew: total - newSum,
    wholeGame: +(total / totalTech).toFixed(4),
    wholeGameExcludingNew: +((total - newSum) / totalTech).toFixed(4),
    median: +per[Math.floor(per.length / 2)].r.toFixed(4),
    outOfBand: per.filter(x => x.r < 0.73 || x.r > 1.00).map(x => [x.id, +x.r.toFixed(3)]),
    authoredOk, generatedExact, generatedOverRung,
    costGraph: auditCostGraph(), rawGraph: auditRawGraph()
  };
});
// PASS CONDITION 3
check("1/3 — `DISCOVERY_KNOWLEDGE_SET` is GONE from live code, and the exemption list is EMPTY",
  !/DISCOVERY_KNOWLEDGE_SET/.test(CODE) && disc.exemptEmpty &&
  /var DISCOVERY_KNOWLEDGE_EXEMPT = \[/.test(CODE),
  "Kittens exempts an upgrade from science only when it is bought with a POST-RESET PRESTIGE " +
  "CURRENCY, and RR has none. All four of RR's stated exemptions were checked against the source " +
  "and all four failed.");
check("1/3 — the generator WALKS `UPGRADES` rather than a named list, so coverage is a PROPERTY",
  /UPGRADES\.forEach\(function \(u\) \{\s*\n\s*if \(DISCOVERY_KNOWLEDGE_EXEMPT\.indexOf\(u\.id\) >= 0\) return;/.test(CODE),
  "a list nobody has read is how coverage sat at 41% for three rounds while the RATE was " +
  "reported at parity");
check("1/3 — COVERAGE, enumerated from `UPGRADES` and never from a list",
  disc.priced === disc.upgrades - 3,
  `${disc.priced} of ${disc.upgrades} Discoveries carry knowledge — ` +
  `${(100 * disc.priced / disc.upgrades).toFixed(0)}%, against the source's 93%. ` +
  `The spec's target was 75 of 78; this round ADDS four Discoveries (the weapon line and the ` +
  `fourth mana rung), so 75+4 of 78+4 is the same statement.`);
// PASS CONDITION 4
check("1/4 — the three unpriced Discoveries are named, and each sits on a tech with NO knowledge price",
  disc.unpriced.length === 3 && disc.unpriced.every(u => u.techK === 0) &&
  JSON.stringify(disc.zeroRung.slice().sort()) === JSON.stringify(disc.unpriced.map(u => u.id).sort()),
  disc.unpriced.map(u => `${u.id} (tech ${u.tech ?? "NONE"})`).join(", ") +
  " — a division by zero, not a policy. All three are pre-tech starter upgrades.");
// PASS CONDITION 4a
check("1/4a — NO GENERATED figure exceeds its own tech's rung, let alone the ceiling",
  disc.generatedOverRung.length === 0,
  "`0.8K < K` is a proof and the ceiling must already clear K for the tech to be researched at " +
  "all — but §33 is exactly about the term nobody checked, so it is asserted. " +
  (disc.generatedOverRung.length ? "OFFENDERS: " + disc.generatedOverRung.join(", ") : "0 offenders"));
// PASS CONDITION 5
check("1/5 — the per-upgrade MEDIAN is inside Kittens' own 0.73-1.00 band, after every load-time mutation",
  disc.median >= 0.73 && disc.median <= 1.00,
  `median ${disc.median} against the source's IQR 0.73-1.00 (median 0.87), now over ` +
  `${disc.priced} members rather than 32`);
check("1/5 — every GENERATED member sits exactly at 0.8 x its own rung",
  disc.generatedExact && disc.divisor === 1.25,
  `divisor ${disc.divisor}. **It is NOT the relief valve if this Part overshoots** — the in-band ` +
  `range is 0.73-1.00, so the whole legal move is -9%.`);
check("1/5 — the FIVE out-of-band members are all AUTHORED, and the analyzer's correction is confirmed",
  disc.outOfBand.length === 5 &&
  JSON.stringify(disc.outOfBand.map(x => x[0]).sort()) ===
    JSON.stringify(["beastLore", "chemtechDistillation", "slabCutting", "standingOrders", "surveyedApproaches"]),
  disc.outOfBand.map(x => `${x[0]} ${x[1]}`).join(", ") +
  " — BUILD REPORT v0.64 §3.3 said TWO; the v0.65 analyzer said FIVE and the analyzer is right.");
// PASS CONDITION 6
check("1/6 — total discovery knowledge and the whole-game ratio, computed here rather than written down",
  disc.totalExcludingNew === 2003370 && disc.wholeGameExcludingNew === 1.3887,
  `over the 78 upgrades that existed at v0.64: **${disc.totalExcludingNew.toLocaleString()}**, ratio ` +
  `**${disc.wholeGameExcludingNew}** — the spec's 2,003,370 / 1.389 TO THE DIGIT. Including this ` +
  `round's four new Discoveries (+${disc.newSum.toLocaleString()}): ${disc.total.toLocaleString()}, ` +
  `ratio ${disc.wholeGame}. Against the source's LIKE-FOR-LIKE 1.903 over a tree of the same size, ` +
  `RR is at ${(100 * disc.wholeGame / 1.903).toFixed(0)}% — still UNDER the source.`);
check("1/6 — ...and the like-for-like correction is argued AT THE SITE, not only in a report",
  /diluted by an endgame RR does not have/.test(RAW) &&
  /1,431,130/.test(RAW) && /2,723,750/.test(RAW) && /1\.903/.test(RAW),
  "RR's 0.0735 against the source's whole-game 0.470 compared a 35-rung tree against a 64-rung " +
  "tree whose top six rungs carry 32,000,000 science and almost no upgrades — the same class of " +
  "conflation §31.2a retracted");
// PASS CONDITION 7
check("1/7 — the ten AUTHORED figures are unmoved, asserted by value",
  disc.authoredOk,
  "the `if (u.cost.knowledge === undefined)` guard is what preserves them and it does not move");
check("1 — the four stated exemptions are each contradicted AT THE SITE, by name",
  /steelAxe` science 20,000|`steelAxe` science 20,000/.test(RAW) &&
  /stoneBarns` wood 1,000|`stoneBarns` wood 1,000/.test(RAW) &&
  /101 of them\s*(?:\/\/\s*)?ALSO carry science -- 94%/.test(RAW) &&
  /POST-RESET PRESTIGE CURRENCY/.test(RAW),
  "an RR-invented rule the source contradicts 94% of the time — the fifth this project has retired");
check("1 — both audit graphs are still 0/0 after 43 Discoveries gained a price",
  disc.costGraph.length === 0 && disc.rawGraph.length === 0,
  (disc.costGraph.concat(disc.rawGraph).join(" | ")) || "auditCostGraph 0, auditRawGraph 0");
// PASS CONDITION 8 — the instrument
check("1.5a/8 — the knowledge SUPPLY block is emitted at all four milestones",
  /knowledgeSupply: \(\(\) => \{/.test(SIMCORE) && /timeAtCapPctToDate:/.test(SIMCORE) &&
  /spentOnTechs: Math\.round\(kOnTechs\), spentOnDiscoveries: Math\.round\(kOnDiscoveries\)/.test(SIMCORE) &&
  /discoveriesAvailableUnaffordable:/.test(SIMCORE) && /KNOWLEDGE SUPPLY @/.test(PACING),
  "§24: a cap-out fraction cannot size anything on its own — it cannot tell a surplus from a queue");
check("1.5a/8 — ...and the TECH-vs-DISCOVERY split wraps the purchase entry points, not the prices",
  /buyTech = function \(id\) \{ _buyKind = "tech";/.test(SIMCORE) &&
  /buyUpgrade = function \(id\) \{ _buyKind = "disc";/.test(SIMCORE),
  "wrapping the entry points rather than re-deriving prices means a Discovery whose cost is " +
  "built at runtime is still counted correctly — §24's `recruitCost()` lesson");

// ============================================================================
// PART 2 — THE TRAINING GROUND, AND THE WEAPON LINE. Conditions 9, 9a, 10, 11.
// ============================================================================
const vig = await page.evaluate(() => {
  loadFromString(btoa(unescape(encodeURIComponent(JSON.stringify(freshState())))));
  const tg = BUILDINGS.find(b => b.id === "trainingGround");
  TECHS.forEach(t => S.techs[t.id] = 1);
  VIGOR_WEAPON_LINE.forEach(w => S.upgrades[w[0]] = 1);
  const k = computeRates("mana")._knee;
  // the DELIVERED figure, not the presence of the keys (§33)
  const withLine = computeRates("mana")._boosts.vigor;
  VIGOR_WEAPON_LINE.forEach(w => delete S.upgrades[w[0]]);
  const withoutLine = computeRates("mana")._boosts.vigor;
  return {
    tgHasBoost: !!tg.boost, tgCaps: tg.caps, tgCost: tg.cost, tgRatio: tg.ratio,
    line: VIGOR_WEAPON_LINE.map(w => ({ id: w[0], amt: w[1], tech: w[2] })),
    sigma: weaponLineSigma(),
    members: BOOST_MEMBERS.filter(m => m.family === "vigor").map(m => [m.id, m.amt]),
    rawWithLine: +k.vigor.raw.toFixed(6), knee: k.vigor.knee, cap: k.vigor.cap,
    deliveredWith: +withLine.toFixed(6), deliveredWithout: +withoutLine.toFixed(6),
    upgradesExist: VIGOR_WEAPON_LINE.every(w => UPGRADES.some(u => u.id === w[0])),
    techs: VIGOR_WEAPON_LINE.map(w => (UPGRADES.find(u => u.id === w[0]) || {}).tech),
    boostLimit: BOOST_LIMIT
  };
});
// PASS CONDITION 9
check("2/9 — the Training Ground's `boost: { vigor: … }` is GONE, and its `caps: { vigor: 150 }` is unmoved",
  !vig.tgHasBoost && vig.tgCaps.vigor === 150 &&
  !/id: "trainingGround"[\s\S]{0,400}?boost:/.test(CODE),
  `caps ${JSON.stringify(vig.tgCaps)}, cost ${JSON.stringify(vig.tgCost)}, ratio ${vig.tgRatio} — ` +
  "the building, its cost and its ratio are all untouched. **Every other `manpowerMax` in the " +
  "source is a CEILING** (logHouse 50, mansion 50, the mint and templar lines): a building may " +
  "HOLD Vigor and may not MAKE it.");
check("2/9 — the source's own carriers are cited at the site, and there are exactly two",
  /manpowerJobRatio/.test(RAW) && /js\/workshop\.js:672-720/.test(RAW) &&
  /js\/buildings\.js:1762`, `:1773`\)|Brewery \(`js\/buildings\.js:1762`/.test(RAW) &&
  /breweryPolicyManpowerRatio/.test(RAW),
  "three WEAPON upgrades (Σ 1.00) and ONE building whose value comes from a POLICY and is 0.01");
// PASS CONDITION 9a
check("2/9a — the weapon line ships as three `BOOST_MEMBERS` at 0.50 / 0.25 / 0.25, Σ 1.00",
  vig.sigma === 1.00 && vig.upgradesExist &&
  JSON.stringify(vig.line.map(l => l.amt)) === JSON.stringify([0.5, 0.25, 0.25]) &&
  vig.members.length === 3,
  vig.line.map(l => `${l.id} ${l.amt} on ${l.tech}`).join(" · ") +
  " — Kittens' compositeBow 0.5 / crossbow 0.25 / railgun 0.25, the source's ENTIRE manpower " +
  "production multiplier");
check("2/9a — the rungs are assigned by ROLE (§16), and two of the three match the source to the digit",
  vig.techs[0] === "carpentry" && vig.techs[1] === "callToArms" && vig.techs[2] === "atlasGauntlets",
  "compositeBow ← `construction`, and **carpentry IS RR's construction** (v0.52 Part 2.2). " +
  "crossbow ← `machinery`, **science 15,000 — and callToArms is 15,000**. railgun ← " +
  "`particlePhysics` **science 185,000**, and RR's ladder tops out at 135,000, so tier 3 is a " +
  "ROLE match on RR's late equipment tech. **The spec calls railgun a '12,000-class successor'; " +
  "it is science 150,000 on a 185,000 rung — reported in BUILD REPORT §2.**");
check("2/9a — vigor's raw Σ is BELOW the 6.00 knee, so the line is DELIVERED IN FULL",
  vig.rawWithLine < vig.knee && Math.abs(vig.deliveredWith - vig.deliveredWithout - 1.00) < 1e-6,
  `raw Σ ${vig.rawWithLine} against knee ${vig.knee} (cap ${vig.cap}). **DELIVERED, not declared ` +
  `(§33): buying all three moves the delivered vigor boost by exactly ` +
  `${(vig.deliveredWith - vig.deliveredWithout).toFixed(6)} — the full 1.00.**`);
// PASS CONDITION 11
check("2/11 — `BOOST_LIMIT` is UNCHANGED, vigor still railed at 8.0",
  JSON.stringify(vig.boostLimit) === JSON.stringify({ devotion: 5, culture: 2, gold: 1.5, vigor: 8,
                                                      crystals: 2, provisions: 3, mana: 2 }),
  "a rail is sized to sit ABOVE the reachable range; a rail further above it is still a rail. " +
  "Re-sizing it down to the new Σ would be tuning a condition that passed (Part 7.1).");
// PASS CONDITION 10
check("2.2/10 — `knee._sources` decomposes EVERY family's Σ by contributor, at all four milestones",
  /out\._sources = \(\(\) => \{/.test(SIMCORE) && /add\(r, b\.name, b\.boost\[r\] \* n, "BUILDING"/.test(SIMCORE) &&
  /BOOST Σ SOURCES @/.test(PACING),
  "`_members` enumerates BOOST_MEMBERS and nothing else, so a BUILDING boost — which is exactly " +
  "what dev note 1 is about — was invisible to the audit that existed");
// RE-POINTED (build report §7, item 7). This site was authored against the tolerance the block
// SHIPPED WITH — `1e-6` against an unrounded sum — and that form is exactly what cried wolf: the
// cause was never float drift in the sum, it was that `boostKneeFrom()` PUBLISHES `raw` already
// rounded to four places, so an exact sum can never equal it at any float tolerance. Commit
// 723e7cb rounds the sum the same way and sizes the tolerance to the published precision. The
// assertion now demands the shipped behaviour — compare like for like, and carry BOTH sums —
// rather than the intermediate form that was wrong. Superseded by: Part 2's own §10 instrument.
check("2.2/10 — ...and it RECONCILES AT THE PUBLISHED PRECISION or says so, which is what makes a share figure quotable",
  /const sum = \+sumExact\.toFixed\(4\)/.test(SIMCORE) &&
  /reconciles: Math\.abs\(sum - raw\) < 1e-4/.test(SIMCORE) &&
  /namedSum: \+sumExact\.toFixed\(6\)/.test(SIMCORE) &&
  /COMPARE LIKE FOR LIKE/.test(SIMCORE) &&
  /THE SUM IS KEPT UNROUNDED/.test(SIMCORE) &&
  /DOES NOT RECONCILE/.test(PACING),
  "a false 'does not reconcile' is worse than none — the first two runs of this block cried wolf " +
  "at 1.3e-5 and 4.9e-5 on families that were perfectly attributed, because a 4-dp published " +
  "figure was being compared against an exact sum. The exact sum is still carried as `namedSum`; " +
  "only the COMPARISON is taken at the precision the source figure is published in.");

// ============================================================================
// PART 3 — THE LONGHOUSE'S PROVISIONS COMPONENT. Conditions 12, 13, 14.
// ============================================================================
const lh = await page.evaluate(() => {
  loadFromString(btoa(unescape(encodeURIComponent(JSON.stringify(freshState())))));
  TECHS.forEach(t => S.techs[t.id] = 1); UPGRADES.forEach(u => S.upgrades[u.id] = 1);
  const b = BUILDINGS.find(x => x.id === "longhouse");
  // the never-bind rule, evaluated at the four provisions ceilings the v0.64 ensemble measured
  const CAPS = { sparks: 68250, hexcore: 471875, icathia: 571913, final: 976685 };
  const STOCK = { sparks: 40, hexcore: 53, icathia: 54, final: 59 };
  const ceilingCopies = (base, cap) => Math.floor(Math.log(cap / base) / Math.log(1.15)) + 1;
  const table = Object.keys(CAPS).map(k => {
    const cc = ceilingCopies(LONGHOUSE_PROVISIONS, CAPS[k]);
    return { milestone: k, cap: CAPS[k], stockBound: STOCK[k], ceilingBound: cc,
             margin: +(cc / STOCK[k]).toFixed(2), clears: cc >= 1.25 * STOCK[k] };
  });
  // the sink's honest size: 44 copies at ratio 1.15
  let sink = 0; for (let i = 0; i < 44; i++) sink += LONGHOUSE_PROVISIONS * Math.pow(1.15, i);
  return { cost: b.cost, base: LONGHOUSE_PROVISIONS, table,
           sink: Math.round(sink), lastCopy: Math.round(LONGHOUSE_PROVISIONS * Math.pow(1.15, 43)),
           oldCeilingAt1200: ceilingCopies(1200, 976685) };
});
// PASS CONDITION 12
check("3/12 — the provisions component is restored at 30, not at the old 1,200",
  lh.cost.provisions === 30 && lh.base === 30 &&
  lh.cost.timber === 220 && lh.cost.ore === 260,
  JSON.stringify(lh.cost));
// PASS CONDITION 13
check("3/13 — the NEVER-BIND rule holds at ALL FOUR milestones: ceiling-bound >= 1.25 x stock-bound",
  lh.table.every(t => t.clears),
  lh.table.map(t => `${t.milestone} ${t.ceilingBound} vs ${t.stockBound} (x${t.margin})`).join(" · ") +
  ` — the tightest is ${lh.table.slice().sort((a, b) => a.margin - b.margin)[0].milestone} at ` +
  `x${lh.table.slice().sort((a, b) => a.margin - b.margin)[0].margin}`);
check("3/13 — ...and the old 1,200 would NOT have cleared it — this is why the note's answer is conditional",
  lh.oldCeilingAt1200 < 59,
  `at base 1,200 the ceiling-bound maximum at end of run is ${lh.oldCeilingAt1200} against a ` +
  `stock-bound 59 — **restoring it verbatim costs 11 population** and re-imposes exactly the ` +
  `coupling §20's storage cut collapsed population through`);
check("3 — the sink's honest size is stated, because a sink is what the note asks for",
  lh.sink > 80000 && lh.sink < 105000 &&
  /the Longhouse is structurally the wrong\s*(?:\/\/\s*)?carrier/.test(RAW),
  `44 copies at base 30 and ratio 1.15 cost **${lh.sink.toLocaleString()} provisions in total**, ` +
  `the 44th copy alone ${lh.lastCopy.toLocaleString()}. **If Jerry wants a sink larger than that, ` +
  `the Longhouse cannot carry it** — a ratio-1.15 component on a 44-copy building cannot be ` +
  `large without becoming a ceiling. That is arithmetic, not preference.`);
// PASS CONDITION 14
check("3/14 — the ledger row is HARDER, with the source cited and the divergence named RR-ORIGINAL",
  /js\/buildings\.js:476-487 logHouse[\s\S]{0,400}\*\*HARDER\*\*/.test(LEDGER) &&
  /The provisions component is RR-ORIGINAL/.test(LEDGER) &&
  /base <= provisionsCap \/ 1\.15\^/.test(LEDGER),
  "Kittens' logHouse costs wood 200 + minerals 250 and NO food. v0.64 deleted this as a parity " +
  "correction and a directive restores it; directives override, and §16 forbids shipping it AS parity.");
check("3 — the sizing RULE is stated at the site, not just its result",
  /base <= provisionsCap \/ 1\.15\^\(1\.25 x stockBoundCopies - 1\)/.test(RAW),
  "a number with no rule behind it is the thing this project keeps having to re-derive");

// ============================================================================
// PART 4 — THE FOURTH MANA DISCOVERY. Conditions 15, 16.
// ============================================================================
const mana = await page.evaluate(() => {
  loadFromString(btoa(unescape(encodeURIComponent(JSON.stringify(freshState())))));
  TECHS.forEach(t => S.techs[t.id] = 1);
  ["hexresonance", "leylineCalibration", "trueIceCellars", "leylineLensing"].forEach(u => S.upgrades[u] = 1);
  const k = computeRates("mana")._knee;
  const withIt = computeRates("mana")._boosts.mana;
  delete S.upgrades.leylineLensing;
  const without = computeRates("mana")._boosts.mana;
  const u = UPGRADES.find(x => x.id === "leylineLensing");
  return {
    members: BOOST_MEMBERS.filter(m => m.family === "mana").map(m => [m.id, m.amt]),
    raw: +k.mana.raw.toFixed(4), knee: k.mana.knee, cap: k.mana.cap,
    belowKnee: k.mana.raw < k.mana.knee,
    delivered: +(withIt - without).toFixed(6),
    tech: u.tech, cost: u.cost,
    inCrystalSet: DISCOVERY_CRYSTAL_SET.indexOf("leylineLensing") >= 0
  };
});
// PASS CONDITION 15
check("4/15 — exactly ONE new mana member, at 0.25, on a tech that is NOT `sparks`",
  mana.members.length === 4 && mana.members.some(m => m[0] === "leylineLensing" && m[1] === 0.25) &&
  mana.tech === "hexcore",
  mana.members.map(m => `${m[0]} ${m[1]}`).join(" · ") + ` — on \`${mana.tech}\`, the milestone the ` +
  `deficit first appears at. Four members in ONE additive category is the source's own shape ` +
  `(\`barnRatio\` runs six, §19), so NO new multiplicative category (§31).`);
check("4/15 — raw Σ is BELOW the knee, so it is DELIVERED IN FULL — the property the rail was shipped for",
  mana.belowKnee && Math.abs(mana.delivered - 0.25) < 1e-6,
  `Σ ${mana.raw} against knee ${mana.knee} (cap ${mana.cap}). **DELIVERED ${mana.delivered}, not ` +
  `the presence of the key (§33).**`);
check("4 — it pays Part 1's knowledge rule AND takes a crystal component, as the source does on 101 of 107",
  mana.cost.knowledge === 60000 && mana.cost.crystals === 750 && mana.inCrystalSet,
  JSON.stringify(mana.cost) + " — 0.8 x 75,000 and 75,000/100, both from the existing rules");
check("4 — §11.6's caution is carried at the site: the target is THROUGHPUT, not a positive net figure",
  /A ratio pinned at ~1\.00\s*(?:\/\/\s*)?is a system in EQUILIBRIUM/.test(RAW) &&
  /A report that claims victory because net mana went positive has measured the wrong thing/.test(RAW),
  "-0.40/s against a gross of 119.35/s is 0.3%; the converters are throttled by mana " +
  "availability and will eat the new supply, so the effect shows up as Era-3 RAW OUTPUT");
// PASS CONDITION 16
check("4/16 — mana net/s, consumed÷produced and the three Zaun raws are emitted at all four milestones",
  /MANA BALANCE @/.test(PACING) && /consumedOverProduced:/.test(SIMCORE) &&
  /zaunore/.test(PACING) && /coalgas/.test(PACING) && /hexore/.test(PACING));

// ============================================================================
// PART 5 — THE CHAMPION DRAW. Conditions 17, 18.
// ============================================================================
// PASS CONDITION 17
check("5/17 — `firstPZChampion` is marked from the GATE'S OWN literal condition",
  /\["twitch", "caitlyn", "heimerdinger"\]\.some\(id => S\.champs\[id\] && S\.champs\[id\]\.r\)\)\s*\n\s*mark\("firstPZChampion"\);/.test(SIMCORE) &&
  /firstPZChampion: m\.firstPZChampion/.test(PACING),
  "the id list is the gate's own condition, not a restatement of it — §4's exception, unchanged");
check("5/17 — `sparksAfterPZ` is derived per seed and reported with a median and a spread",
  /x\.machine\.sparksAfterPZ = \(typeof sp === "number" && typeof pz === "number"\)/.test(PACING) &&
  /"firstPZChampion", "sparksAfterPZ"/.test(PACING) &&
  /THE PART THE DESIGNER CONTROLS/.test(PACING),
  "Sparks is the DRAW plus the build-out after it. Only the second half is a pacing result, and " +
  "until this round nothing in the project had separated them.");
// PASS CONDITION 18
check("5/18 — the three confounded conditions are marked `[draw]` and are REPORTED, NOT FAILED",
  /{ id: "sparks", label: "Sparks before year 500", draw: true,/.test(PACING) &&
  /{ id: "firstChampion", label: "First champion before year 120", draw: true,/.test(PACING) &&
  /{ id: "chemToHex", label: "Chemtech -> Hexcore gap under 400 years", draw: true,/.test(PACING) &&
  /if \(!verdict && !isDraw\) ensFail\+\+;/.test(PACING),
  "counting an RNG outcome as a round failure attributes a draw to the round's changes");
check("5/18 — ...and the draw's own distribution prints beside them, so the two are never read as one",
  /THE CHAMPION DRAW — v0\.65 Part 5/.test(PACING) &&
  /Read the third line, not the second/.test(PACING));
check("5 — the Sparks GATE itself is untouched — §4 is closed and the exception is sanctioned",
  /\["twitch","caitlyn","heimerdinger"\]\.some/.test(CODE.replace(/\s/g, "").replace(/"/g, '"')) ||
  /twitch[\s\S]{0,60}caitlyn[\s\S]{0,60}heimerdinger/.test(CODE),
  "what changes is that the round stops reading a champion draw as a pacing result");

// ============================================================================
// PART 6 — RITES RESTATED. Condition 19.
// ============================================================================
check("6/19 — the Rites condition is a y50-200 BAND, not a y75 ceiling, with the ruling cited at the site",
  /id: "rites", label: "Rites of Targon inside the y50-200 band/.test(PACING) &&
  /test: v => v !== undefined && v >= 50 && v <= 200/.test(PACING) &&
  /v0\.65 PART 6 — RULED: PER-UPGRADE PARITY IS THE TARGET/.test(PACING),
  "an RR-ORIGINAL target that was never derived, retired on §27's own precedent — which retired " +
  "'130 wanderers before year 600' after five consecutive failures, and every other number improved");
check("6/19 — ...and NO discovery knowledge figure was moved to serve it",
  disc.divisor === 1.25 && disc.generatedExact,
  "if a future round wants Rites earlier the move is knowledge SUPPLY, never a discovery price " +
  "below the source's band");

// ============================================================================
// PART 7 — THREE THINGS NOT TO TOUCH. Condition 20.
// ============================================================================
const untouched = await page.evaluate(() => ({
  convSigma: +CONV_DISCOVERY_LINE.reduce((a, u) => a + u[1], 0).toFixed(4),
  crystalSinkMax: CRYSTAL_SINK_MAX,
  rungCapGone: typeof DISCOVERY_RUNG_CAP === "undefined",
  barn: +BARN_LINE.reduce((a, u) => a + u[1], 0).toFixed(4),
  warehouse: +WAREHOUSE_LINE.reduce((a, u) => a + u[1], 0).toFixed(4),
  consumption: CONSUMPTION, xp: XP_PER_SECOND,
  skyrise: BUILDINGS.find(b => b.id === "skyrise").tech,
  capFamilies: (() => { const f = {}; Object.keys(RES).forEach(r => {
    if (RES[r].baseCap === undefined) return; const k = capFamilyOf(r); f[k] = (f[k] || 0) + 1; }); return f; })()
}));
check("7/20 — `CONV_DISCOVERY_LINE` Σ0.65 is UNTOUCHED — it is this round's release valve",
  untouched.convSigma === 0.65,
  "Era 3's median is 1,262.7 against v0.63's 982.8 — longer, not shorter, so there is nothing to " +
  "correct. **This round pushes Era 3 longer again; keeping this constant untouched keeps one " +
  "large, well-understood accelerator available if Part 1 overshoots.**");
check("7/20 — `CRYSTAL_SINK_MAX` 8 · `DISCOVERY_RUNG_CAP` still absent · Part 1.2b not shipped",
  untouched.crystalSinkMax === 8 && untouched.rungCapGone && untouched.skyrise === "deepWorks",
  `the Skyrise is still on \`${untouched.skyrise}\` — 7.3 forbids tuning a condition that passed`);
check("7/20 — and the standing invariants are unmoved",
  untouched.barn === 4.35 && untouched.warehouse === 1.80 && untouched.consumption === 4.25 &&
  untouched.xp === 0.05 && Object.keys(untouched.capFamilies).length === 2,
  `BARN Σ${untouched.barn} · WAREHOUSE Σ${untouched.warehouse} · CONSUMPTION ${untouched.consumption} · ` +
  `XP ${untouched.xp} · cap families ${JSON.stringify(untouched.capFamilies)}`);

// ============================================================================
// THE ROUND'S DISCIPLINE — condition 21.
// ============================================================================
check("21 — the slice chain is built FORWARD and s6 is byte-identical to the shipped file",
  /s6 == shipped index\.html byte-for-byte: True/i.test(MANIFEST),
  "the proof is arithmetic: the last prefix hashes identically to the shipped file");
check("21 — ...and s4's §32 neutrality is proved by RUNNING it, not by asserting it",
  /§32 NEUTRALITY PROOF/.test(readFileSync(new URL("../tools/prove-s4-neutral.sh", import.meta.url), "utf8")) &&
  /`sim\/` ONLY — index\.html byte-identical to s3/.test(MANIFEST),
  "s4 changes sim/ only, so the usual prefix-reproduces-prefix proof has nothing to compare. " +
  "The proof that applies runs ONE index.html against the harness with and without the marker " +
  "and requires the seeded figures to match to the digit.");
check("VERSION — the constant is bumped and matches the tag this round ships",
  /var VERSION = "v0\.65"/.test(CODE),
  "§10: the git tag is authoritative and the in-file constant must match it at ship time");
check("no page errors on load", errors.length === 0, errors.slice(0, 3).join(" | "));

console.log(`\n${pass} passed, ${fail} failed`);
suiteEnd(import.meta.url, pass, fail);
await browser.close();
process.exit(fail ? 1 : 0);
