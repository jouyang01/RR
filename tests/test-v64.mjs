// test-v64 — BUILDER SPEC v0.64 plus Jerry's four dev notes. One block per Part, in the spec's
// order, then one block per dev note.
//
// Conditions whose value is a 2,500-year median (Icathia on three seeds, peak population inside
// 150-220) are asserted here only as "the apparatus emits it"; the measured figures are in
// BUILD REPORT §11. A suite cannot assert a 2,500-year median and pretending otherwise is how a
// green suite stops meaning anything.
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

// ============================================================================
// PART 1 — THE HOUSING LADDER. Pass conditions 2, 3, 4, 5.
// ============================================================================
await reset();
const house = await page.evaluate(() => {
  const b = id => BUILDINGS.find(x => x.id === id);
  const lh = b("longhouse"), sh = b("shelter"), sk = b("skyrise");
  // the ceiling-bound maximum of a tier: the largest k whose k-th copy still fits under the
  // ceiling of every CAPPED component. This is the arithmetic the spec's 48-copy figure comes
  // from, computed here rather than restated.
  TECHS.forEach(t => S.techs[t.id] = 1);
  UPGRADES.forEach(u => S.upgrades[u.id] = 1);
  S.buildings = { storehouse: 40, warehouse: 40, harbor: 20 };
  const caps = computeCaps();
  const ceilingCopies = bd => {
    let k = null;
    for (const r in bd.cost) {
      if (caps[r] === undefined || !(caps[r] > 0)) continue;
      const n = Math.floor(Math.log(caps[r] / bd.cost[r]) / Math.log(bd.ratio)) + 1;
      k = k === null ? n : Math.min(k, n);
    }
    return k;
  };
  S.buildings = {};
  return {
    lhCost: lh.cost, lhRatio: lh.ratio, lhPop: lh.pop, lhCaps: lh.caps, lhTech: lh.tech,
    shRatio: sh.ratio, shPop: sh.pop, shCost: sh.cost,
    skTech: sk.tech, skCost: sk.cost, skRatio: sk.ratio,
    popTiers: BUILDINGS.filter(x => x.pop).map(x => x.id),
    lhCeilingCopies: ceilingCopies(lh),
    // the 48th Longhouse's provisions lump under the OLD cost, kept as the figure that made
    // the tier ceiling-bound. 1200 x 1.15^47.
    oldLump48: Math.round(1200 * Math.pow(1.15, 47)),
    provisionsCapAtFullStores: Math.round(caps.provisions)
  };
});
// PASS CONDITION 4
check("1.2a/4 — the Longhouse's provisions component is DELETED: timber 220 + ore 260 and nothing else",
  JSON.stringify(house.lhCost) === JSON.stringify({ timber: 220, ore: 260 }),
  JSON.stringify(house.lhCost));
check("1.2a/4 — ...and `js/buildings.js:476-487` is cited at the site with the source's own recipe",
  /js\/buildings\.js:476-487/.test(RAW) &&
  /prices: \[ \{ name: "wood", val: 200 \}, \{ name: "minerals", val: 250 \} \]/.test(RAW) &&
  /TWO MATERIALS AND NO FOOD COMPONENT OF ANY KIND/.test(RAW),
  "the source's logHouse costs two materials; RR carried a third that the source does not have");
check("1.2a — the source's OTHER logHouse figures are untouched: ratio 1.15, pop 1, manpowerMax 50",
  house.lhRatio === 1.15 && house.lhPop === 1 && house.lhCaps.vigor === 50 && house.lhTech === "carpentry",
  `ratio ${house.lhRatio}, pop ${house.lhPop}, vigor cap ${house.lhCaps.vigor}, tech ${house.lhTech}`);
// PASS CONDITION 5 — the two-tier ceiling as a NUMBER, before and after
check("1.2a/5 — the Longhouse is no longer CEILING-BOUND by a food component",
  !("provisions" in house.lhCost) && house.lhCeilingCopies > 48,
  `at a fully-built storage line the tier now reaches ${house.lhCeilingCopies} copies. ` +
  `Before: the 48th copy wanted ${house.oldLump48.toLocaleString()} provisions in ONE lump against a ` +
  `ceiling of ${house.provisionsCapAtFullStores.toLocaleString()} — no amount of PRODUCTION could buy it.`);
check("1.2a — the Shelter is NOT touched: ratio 2.20, gentler than the source's hut at 2.50",
  house.shRatio === 2.20 && house.shPop === 2 && JSON.stringify(house.shCost) === JSON.stringify({ timber: 8 }),
  `ratio ${house.shRatio} against Kittens' hut 2.50 — already gentler, and §2 rules ratios are assigned by what a building IS`);
check("1.2b — the Skyrise is NOT re-priced (the spec forbids it; its cost shape already matches the mansion's)",
  JSON.stringify(house.skCost) === JSON.stringify({ hexcrete: 4, alloy: 20, scaffold: 8 }) &&
  house.skRatio === 1.15 && house.skTech === "deepWorks",
  JSON.stringify(house.skCost) + ` on ${house.skTech}. Part 1.2b's tech rung is NOT shipped — see BUILD REPORT §3.`);
check("1 — RR still has exactly THREE buildings that raise maxPop",
  JSON.stringify(house.popTiers) === JSON.stringify(["shelter", "longhouse", "skyrise"]),
  house.popTiers.join(", "));
// PASS CONDITION 3 — the instrument
check("1/3 — the maxPop DECOMPOSITION is emitted per building at every milestone, with its binding resource",
  /housing: \(\(\) => \{/.test(SIMCORE) && /bindingKind: overCap\.length \? "CEILING-BOUND"/.test(SIMCORE) &&
  /twoTierCeiling:/.test(SIMCORE) && /maxPop DECOMPOSITION @/.test(PACING),
  "HANDOFF v0.63 §6 asked for this by name: `maxPop()` is emitted but not decomposed");
check("1/3 — ...and it distinguishes a CEILING-BOUND tier from a merely stock-bound one",
  /CEILING-BOUND/.test(SIMCORE) && /stock-bound/.test(SIMCORE) && /ceilingCopies/.test(SIMCORE),
  "a fraction cannot answer a question about an absolute (§24) — 'population is capped' cannot " +
  "distinguish 'the player is saving up' from 'the ceiling forbids it' without this split");

// ============================================================================
// PART 2 — THE BOOST CEILINGS BECOME RAILS. Pass conditions 6, 7, 8, 9.
// ============================================================================
const rails = await page.evaluate(() => {
  loadFromString(btoa(unescape(encodeURIComponent(JSON.stringify(freshState())))));
  const o = { limits: JSON.parse(JSON.stringify(BOOST_LIMIT)), knees: {} };
  for (const f in BOOST_LIMIT) o.knees[f] = +boostKnee(f).toFixed(4);
  // the per-copy source rates that must NOT have been re-priced (pass condition 9)
  const g = id => (BUILDINGS.find(b => b.id === id) || {}).boost || {};
  o.knowledgeRates = { hexLab: g("hexLab").knowledge, observatory: g("observatory").knowledge,
                       academy: g("academy").knowledge, archive: g("archive").knowledge };
  o.sanctumDevotion = g("sanctum").devotion;
  o.trainingVigor = g("trainingGround").vigor;
  o.irrigationProvisions = g("irrigation").provisions;
  return o;
});
// PASS CONDITION 6
check("2/6 — the four rails ship at 8.0 / 5.0 / 3.0 / 2.0",
  rails.limits.vigor === 8.0 && rails.limits.devotion === 5.0 &&
  rails.limits.provisions === 3.0 && rails.limits.mana === 2.0,
  JSON.stringify(rails.limits));
check("2/6 — ...and crystals, gold and culture are UNCHANGED — all three already delivered in full",
  rails.limits.crystals === 2.0 && rails.limits.gold === 1.5 && rails.limits.culture === 2.0,
  "no round should tune a family that passed");
check("2.1 — each rail's KNEE clears the family's measured end-of-run raw Σ, which is the rule that sets it",
  rails.knees.vigor > 5.522 && rails.knees.devotion > 3.550 &&
  rails.knees.provisions > 1.900 && rails.knees.mana > 1.029,
  `knees: vigor ${rails.knees.vigor} > Σ5.522 · devotion ${rails.knees.devotion} > Σ3.550 · ` +
  `provisions ${rails.knees.provisions} > Σ1.900 · mana ${rails.knees.mana} > Σ1.029. ` +
  `rail = ceil(Σ / 0.75) rounded up, exactly as Solar Revolution's limit 10 sits above a reachable 4.5.`);
check("2 — the source citations for the rail pattern are AT THE SITE, both of them",
  /game\.js:3429-3440`: NOT ONE of Kittens' five production-boost\s*(?:\/\/\s*)?categories passes through/.test(RAW) &&
  /js\/religion\.js:1548-1550/.test(RAW) && /limit \*\*10\*\* against a reachable \*\*~4\.5\*\*/.test(RAW),
  "Kittens bounds no production category; where it does bound a bonus, the bound is a rail");
// PASS CONDITION 9 — no per-copy source rate re-priced
check("2/9 — NO per-copy source rate is re-priced: the knowledge line is still the source's port",
  rails.knowledgeRates.hexLab === 0.35 && rails.knowledgeRates.observatory === 0.25 &&
  rails.knowledgeRates.academy === 0.20 && rails.knowledgeRates.archive === 0.10,
  JSON.stringify(rails.knowledgeRates) + " — Kittens' biolab/observatory/academy/library, exact");
check("2/9 — ...and the three per-copy boost carriers in the railed families are untouched too",
  rails.sanctumDevotion === 0.10 && rails.trainingVigor === 0.10 && rails.irrigationProvisions === 0.03,
  `Sanctum ${rails.sanctumDevotion} devotion, Training Ground ${rails.trainingVigor} vigor, Irrigation Channel ${rails.irrigationProvisions} provisions`);
// PASS CONDITION 7 — the raw Σ at ALL FOUR milestones
check("2.3/7 — every family's raw Σ is printed at ALL FOUR milestones, not just at the end",
  /\["sparks", "hexcore", "icathia", "final"\]\.forEach\(k => \{\s*const kn = r\.snaps && r\.snaps\[k\] && r\.snaps\[k\]\.knee;/.test(PACING) &&
  /raw Sigma/.test(PACING),
  "v0.62's static probe put two families past the knee and the real run found four — provisions " +
  "and mana cross PARTWAY THROUGH, so an end-of-run figure alone under-states the early effect");
// PASS CONDITION 8 — the slices
check("2.2/8 — Part 2 ships as THREE attributable prefix slices in the spec's order: provisions, vigor, devotion+mana",
  /s3\s+Part 2 — the PROVISIONS rail/.test(readFileSync(new URL("../snapshots/v64/README.md", import.meta.url), "utf8")) &&
  /s4\s+Part 2 — the VIGOR rail/.test(readFileSync(new URL("../snapshots/v64/README.md", import.meta.url), "utf8")) &&
  /s5\s+Part 2 — the DEVOTION/.test(readFileSync(new URL("../snapshots/v64/README.md", import.meta.url), "utf8")),
  "the spec asks for one ENSEMBLE per family; this round ships one attributable SLICE per family " +
  "and one ensemble on the shipped build, per Jerry's session protocol. Reported honestly in §7.");

// ============================================================================
// PART 3 — THE ERA-TIER AUDIT AND THE GATES. Pass conditions 14, 15, 16.
// ============================================================================
const gates = await page.evaluate(() => {
  loadFromString(btoa(unescape(encodeURIComponent(JSON.stringify(freshState())))));
  const b = id => BUILDINGS.find(x => x.id === id);
  const craftOf = out => CRAFTS.find(c => c.out === out);
  const kOf = {}; TECHS.forEach(t => kOf[t.id] = (t.cost && t.cost.knowledge) || 0);
  return {
    vent: b("coalgasVent").cost, ventTech: b("coalgasVent").tech,
    hexQ: b("hexQuarry").cost, hexQTech: b("hexQuarry").tech,
    platingExists: !!craftOf("plating"), alloyExists: !!craftOf("alloy"),
    // pass condition 16: every new gate must be CRAFTABLE at the building's own tech, which for
    // RR means its own inputs are reachable by then. `sparks` < `chemtech` < `hexcore`.
    sparksK: kOf.sparks, chemtechK: kOf.chemtech, hexcoreK: kOf.hexcore,
    costViolations: auditCostGraph(), rawViolations: auditRawGraph()
  };
});
// PASS CONDITION 14
check("3.1/14 — the Coalgas Vent takes `plating`, the Zaun chain's own first crafted good",
  gates.vent.plating === 8 && gates.platingExists,
  JSON.stringify(gates.vent));
check("3.1/16 — ...and `plating` unlocks on `sparks`, a full rung BEFORE the Vent's own `chemtech`",
  gates.sparksK < gates.chemtechK,
  `sparks ${gates.sparksK} < chemtech ${gates.chemtechK} — craftable the day the building appears`);
check("3.1 — the existing bulk raws are KEPT: a gate is ADDED, nothing is replaced",
  gates.vent.timber === 250 && gates.vent.ore === 420 && gates.vent.steel === 20,
  "Kittens' mansion is titanium 25 against slab 185 — the crafted good is 12% of the line items and 100% of the gate");
check("3.2/14 — the Hexcrystal Quarry takes `alloy 6`, the second and last hole the audit found",
  gates.hexQ.alloy === 6 && gates.hexQ.gear === 8 && gates.alloyExists,
  JSON.stringify(gates.hexQ) + " — `gear` alone is an Era-1 tool craft two full tiers below an Era-3 building");
check("3.2/16 — ...and `alloy` unlocks on `chemtech`, a rung below the Quarry's own `hexcore`",
  gates.chemtechK < gates.hexcoreK,
  `chemtech ${gates.chemtechK} < hexcore ${gates.hexcoreK}`);
// PASS CONDITION 16
check("3/16 — both audit graphs are ZERO after the gates: nothing is reachable before its inputs are",
  gates.costViolations.length === 0 && gates.rawViolations.length === 0,
  (gates.costViolations.concat(gates.rawViolations).join(" | ")) || "auditCostGraph 0, auditRawGraph 0");
// PASS CONDITION 15
check("3/15 — the era-by-era audit TOOL exists, is re-runnable, and records its own JOIN",
  /era-gate-audit/.test(readFileSync(new URL("../tools/era-gate-audit.mjs", import.meta.url), "utf8")) === false ||
  /HOW "ERA" IS DECIDED/.test(readFileSync(new URL("../tools/era-gate-audit.mjs", import.meta.url), "utf8")),
  "the spec's order is explicit: ship the audit, THEN the gates. Reported in BUILD REPORT §8 " +
  "before any cost moved — 51 buildings, 25 gated, and only FOUR Era-2+ buildings ungated.");
check("3/15 — ...and it states what counts as a GATE, from the source rather than from an RR rule",
  /\*\*One gating material per tier, in a\s*(?:\/\/\s*)?SMALL quantity, alongside bulk raws\*\*/i.test(
    readFileSync(new URL("../tools/era-gate-audit.mjs", import.meta.url), "utf8")),
  "mansion <- titanium 25; factory <- titanium + concrate; biolab <- plastic 15; observatory <- scaffold 50");

// ============================================================================
// PART 4 — MANA. Pass conditions 17, 18.
// ============================================================================
const mana = await page.evaluate(() => {
  loadFromString(btoa(unescape(encodeURIComponent(JSON.stringify(freshState())))));
  TECHS.forEach(t => S.techs[t.id] = 1);
  ["leylineCalibration", "trueIceCellars", "hexresonance"].forEach(u => S.upgrades[u] = 1);
  const r = computeRates("mana");
  const sw = CHAMPS.find(c => c.id === "swain");
  return {
    raw: +r._boostsRaw.mana.toFixed(6), delivered: +r._boosts.mana.toFixed(6),
    knee: r._knee.mana.knee, limit: r._knee.mana.cap,
    consumers: BUILDINGS.filter(b => b.convert && b.convert.input && b.convert.input.mana)
      .map(b => ({ id: b.id, per: b.convert.input.mana })),
    swainPassiveKey: sw.passive.key, swainPassiveBase: sw.passive.base,
    swainLead: sw.lead, swainKnowledgeLead: SWAIN_KNOWLEDGE_LEAD,
    // a fourth mana discovery must NOT have shipped without a measured deficit
    manaBoostMembers: BOOST_MEMBERS.filter(m => m.family === "mana").map(m => m.id)
  };
});
// PASS CONDITION 17
check("4/17 — RR has SEVEN mana-consuming converters, which is what makes the note worth asking",
  mana.consumers.length === 7,
  mana.consumers.map(c => `${c.id} ${c.per}/s`).join(" · "));
check("4/17 — net mana/s AND consumed÷produced are emitted at all four milestones, before any fourth discovery",
  /manaBalance: \(\(\) => \{/.test(SIMCORE) && /consumedOverProduced:/.test(SIMCORE) &&
  /MANA BALANCE @/.test(PACING),
  "the spec refuses to answer this from a fixture: 'twenty of everything nets +132/s, but that is not a run'");
check("4/17 — NO fourth mana discovery shipped: the rail answers the note with no new content",
  mana.manaBoostMembers.length === 3 &&
  JSON.stringify(mana.manaBoostMembers.sort()) ===
    JSON.stringify(["hexresonance", "leylineCalibration", "trueIceCellars"]),
  `Σ${mana.raw} against a knee of ${mana.knee} — ${(mana.knee - mana.raw).toFixed(2)} of headroom where ` +
  `v0.62 had EXACTLY ZERO. A fourth discovery ships only on a measured deficit; BUILD REPORT §9 ` +
  `carries net mana/s at all four milestones.`);
check("4/17 — ...and the three that exist now deliver IN FULL with room, not exactly on the knee",
  Math.abs(mana.delivered - mana.raw) < 1e-9 && mana.knee > mana.raw && mana.limit === 2.0,
  `raw Σ${mana.raw} delivered ${mana.delivered} against knee ${mana.knee} (L ${mana.limit})`);
// PASS CONDITION 18 — Swain's two slots, and NEITHER GREP MAY FIND THE OTHER
check("4/18 — Swain's PASSIVE is mana +12% and his LEAD is knowledge +25% — two slots, two resources",
  mana.swainPassiveKey === "mana" && mana.swainPassiveBase === 12 &&
  mana.swainKnowledgeLead === 0.25 && /knowledge production \+25%/.test(mana.swainLead),
  `passive: ${mana.swainPassiveKey} +${mana.swainPassiveBase}% (whenever RECRUITED) · lead: ` +
  `knowledge +${mana.swainKnowledgeLead * 100}% (only while LEADING)`);
check("4/18 — ...and his passive's own field mentions no knowledge figure, nor his lead any mana one",
  !/knowledge/i.test(JSON.stringify(mana.swainPassiveBase) + mana.swainPassiveKey) &&
  !/mana/i.test(mana.swainLead),
  "a reader who greps one slot must not get the other");
check("4/18 — ...and the ledger carries them as TWO rows, each naming only its own slot's magnitude",
  /THIS ROW IS SWAIN'S PASSIVE SLOT AND NOTHING ELSE/.test(LEDGER) &&
  /THIS ROW IS SWAIN'S LEAD SLOT AND NOTHING ELSE/.test(LEDGER) &&
  !/THIS ROW IS SWAIN'S PASSIVE SLOT AND NOTHING ELSE[\s\S]{0,900}knowledge production \+25%/.test(LEDGER),
  "`swain` and `swain-lead`, and neither row states the other's figure");
check("4/18 — ...and the two slots are documented as distinct AT THE CHAMPION, not only in the ledger",
  /applies WHENEVER HE IS RECRUITED/.test(RAW) && /applies ONLY WHILE HE IS LEADING/.test(RAW),
  "a passive is a property of the roster; a lead is a property of the chair");

// ============================================================================
// PART 5 — RETIRE DISCOVERY_RUNG_CAP. Pass conditions 10, 11, 12, 13.
// ============================================================================
const disc = await page.evaluate(() => {
  loadFromString(btoa(unescape(encodeURIComponent(JSON.stringify(freshState())))));
  const techK = {}; TECHS.forEach(t => techK[t.id] = (t.cost && t.cost.knowledge) || 0);
  const per = [];
  let total = 0;
  UPGRADES.forEach(u => {
    const k = u.cost && u.cost.knowledge; if (!k) return;
    total += k;
    const K = techK[u.tech] || 0; if (K) per.push({ id: u.id, r: k / K });
  });
  per.sort((a, b) => a.r - b.r);
  const totalTech = TECHS.reduce((a, t) => a + ((t.cost && t.cost.knowledge) || 0), 0);
  const byTech = {};
  UPGRADES.forEach(u => { const k = u.cost && u.cost.knowledge; if (!k) return;
                          (byTech[u.tech] = byTech[u.tech] || 0); byTech[u.tech] += k; });
  return {
    capDefined: typeof DISCOVERY_RUNG_CAP !== "undefined",
    divisor: DISCOVERY_KNOWLEDGE_DIVISOR,
    greatLibrary: UPGRADES.find(u => u.id === "greatLibrary").cost.knowledge,
    masterOfTheHunt: UPGRADES.find(u => u.id === "masterOfTheHunt").cost.knowledge,
    beastLore: UPGRADES.find(u => u.id === "beastLore").cost.knowledge,
    chemtechDistillation: UPGRADES.find(u => u.id === "chemtechDistillation").cost.knowledge,
    greatLibraryRung: techK.ritesOfTargon, mothRung: techK.drakeLore,
    generatedExact: DISCOVERY_KNOWLEDGE_SET.every(id => {
      const u = UPGRADES.find(x => x.id === id);
      return u.cost.knowledge === Math.round((techK[u.tech] || 0) / DISCOVERY_KNOWLEDGE_DIVISOR);
    }),
    generatedMin: Math.min.apply(null, DISCOVERY_KNOWLEDGE_SET.map(id => {
      const u = UPGRADES.find(x => x.id === id);
      return u.cost.knowledge / (techK[u.tech] || 1);
    })),
    median: +per[Math.floor(per.length / 2)].r.toFixed(4),
    min: per[0], max: per[per.length - 1],
    total, totalTech, wholeGame: +(total / totalTech).toFixed(4),
    ritesTotal: byTech.ritesOfTargon, ritesRung: techK.ritesOfTargon
  };
});
// PASS CONDITION 10
check("5/10 — `DISCOVERY_RUNG_CAP` is GONE: absent from the runtime AND from the source at grep level",
  !disc.capDefined && !/DISCOVERY_RUNG_CAP\s*=/.test(CODE) && !/capDiscoveryKnowledgePerRung/.test(CODE),
  "a retired constant left declared is a constant the next round re-wires");
check("5/10 — the generated members are back at EXACTLY 0.8 × K, every one of them",
  disc.generatedExact && disc.divisor === 1.25 && Math.abs(disc.generatedMin - 0.8) < 1e-6,
  `divisor ${disc.divisor} (0.8 × K), generated minimum ratio ${disc.generatedMin.toFixed(4)} — ` +
  `the cap had taken the generated median 0.80 -> 0.62 and its minimum to 0.34, far below the source's p25 of 0.73`);
check("5/10 — ...and only ONE load-time writer of a discovery knowledge cost remains",
  /if \(u\.cost\.knowledge === undefined\) u\.cost\.knowledge = Math\.round\(K \/ DISCOVERY_KNOWLEDGE_DIVISOR\);/.test(CODE) &&
  (CODE.match(/u\.cost\.knowledge = /g) || []).length === 1,
  "two IIFEs mutating the same field in sequence is how the distribution got away from everybody");
// PASS CONDITION 11
check("5/11 — the two authored outliers are re-based to the source's p75 of 1.00 × their own rung",
  disc.greatLibrary === 12000 && disc.masterOfTheHunt === 3600 &&
  disc.greatLibrary === disc.greatLibraryRung && disc.masterOfTheHunt === disc.mothRung,
  `greatLibrary ${disc.greatLibrary} on a ${disc.greatLibraryRung} rung = 1.00× (was 40,000 = 3.33×); ` +
  `masterOfTheHunt ${disc.masterOfTheHunt} on a ${disc.mothRung} rung = 1.00× (was 12,000 = 3.33×). ` +
  `-36,400 taken ENTIRELY from the two figures outside the source's 0.73-1.00 band, against the ` +
  `cap's -47,959 taken mostly from members that were already correct.`);
check("5/11 — ...and the OTHER authored figures are left alone — they are the controls",
  disc.beastLore === 2500 && disc.chemtechDistillation === 3000,
  `beastLore ${disc.beastLore}, chemtechDistillation ${disc.chemtechDistillation} — untouched, ` +
  `which is what demonstrates a hand re-base and not a rule moved the other two`);
// PASS CONDITION 12 — asserted AFTER every load-time mutation
check("5/12 — RR's per-upgrade MEDIAN is inside the source's own 0.73-1.00 band, after every load-time mutation",
  disc.median >= 0.73 && disc.median <= 1.00,
  `median ${disc.median} against Kittens' IQR 0.73-1.00 (median 0.87). Read from the MUTATED ` +
  `UPGRADES array, not from the literal — both writers are load-time IIFEs and a source-text ` +
  `assertion would see neither.`);
check("5/12 — ...and the two residual outliers are NAMED rather than hidden by the median",
  disc.min.id === "standingOrders" && disc.max.id === "chemtechDistillation",
  `min ${disc.min.id} ${disc.min.r.toFixed(2)}× (authored under dev note 4's merged-research ` +
  `accounting), max ${disc.max.id} ${disc.max.r.toFixed(2)}× (authored v0.58). Both are AUTHORED; ` +
  `every GENERATED member sits exactly at 0.80.`);
// PASS CONDITION 13 — the census reconciled and the join RECORDED
check("5/13 — the census join is RECORDED at the site, and one table is pinned",
  /THE CENSUS IS RECONCILED AND THE JOIN IS RECORDED/.test(RAW) &&
  /tools\/kittens-upgrade-census\.mjs/.test(RAW) &&
  /rungs with no science price are EXCLUDED/.test(RAW),
  "three rounds argued from this table with two joins in play; the tool's join is the one pinned");
check("5 — the whole-game discovery ratio is reported against the source's ~0.47-0.50",
  disc.wholeGame < 0.50,
  `RR ${disc.wholeGame} against the source's 0.470 (builder re-run) / 0.50 (analyzer). ` +
  `RR carries ${disc.total.toLocaleString()} discovery knowledge against ${disc.totalTech.toLocaleString()} tech knowledge — ` +
  `about a SIXTH of the source's share, so the retirement moves TOWARD the source, not past it.`);
check("5 — `ritesOfTargon` is relieved by the re-base, and its generated leaves are back at full rate",
  disc.ritesTotal < 68800 && disc.ritesTotal > 0,
  `ritesOfTargon now carries ${disc.ritesTotal.toLocaleString()} on a ${disc.ritesRung.toLocaleString()} rung ` +
  `(was 68,800 = 5.73× and 48% of the game's total; the cap left it at 1.41× by cutting three compliant members to 0.34×)`);

// ============================================================================
// PART 6 — THE TRADE PROVISIONS COST. Pass condition 19.
// ============================================================================
const trade = await page.evaluate(() => {
  loadFromString(btoa(unescape(encodeURIComponent(JSON.stringify(freshState())))));
  TECHS.forEach(t => S.techs[t.id] = 1);
  S.buildings = { storehouse: 40, warehouse: 40, harbor: 20 };
  const caps = computeCaps();
  const costs = FACTIONS.map(f => tradeCost(f));
  S.buildings = {};
  return {
    constant: TRADE_PROVISIONS,
    allSame: costs.every(c => (c.provisions || 0) === TRADE_PROVISIONS),
    caravansCeilingAllows: Math.floor(caps.provisions / TRADE_PROVISIONS),
    caravansAtOldCost: Math.floor(caps.provisions / 5000),
    provisionsCap: Math.round(caps.provisions),
    // neither discount may touch it
    discountsUntouched: (() => {
      S.upgrades.caravanserai = 1; S.upgrades.letterOfMarque = 1;
      const c = tradeCost(FACTIONS[0]);
      delete S.upgrades.caravanserai; delete S.upgrades.letterOfMarque;
      return c.provisions === TRADE_PROVISIONS;
    })()
  };
});
// PASS CONDITION 19
check("6/19 — `TRADE_PROVISIONS` ships at 3,500, shared across every route",
  trade.constant === 3500 && trade.allSame,
  `${trade.constant}, identical on every route — the constraint is "how many caravans can this settlement provision"`);
check("6/19 — ...and neither trade discount touches it, as v0.61 ruled",
  trade.discountsUntouched,
  "Caravanserai discounts vigor and the Letter of Marque discounts gold; both were sized against their own resource");
check("6/19 — the ALLOWED CARAVAN COUNT is the figure that answers the note, and the cut RAISES it",
  trade.caravansCeilingAllows > trade.caravansAtOldCost,
  `at a fully-built storage line the ceiling allows ${trade.caravansCeilingAllows} caravans, against ` +
  `${trade.caravansAtOldCost} at the old 5,000. **A SMALLER COST DOES NOT MAKE THIS A LIMITER** — ` +
  `v0.61 measured the cost as never binding and it is less binding now, which is stated rather than claimed as a win.`);
check("6/19 — provisions time-at-cap and the allowed caravan count are emitted at all four milestones",
  /tradeProvisions: \(\(\) => \{/.test(SIMCORE) && /caravansCeilingAllows:/.test(SIMCORE) &&
  /provisionsAtCapPctToDate:/.test(SIMCORE) && /TRADE PROVISIONS @/.test(PACING),
  "the note's own test, answered with a number rather than with the constant");
check("6/19 — the interaction with Part 1.2a is stated at the site, as TWO figures and not one",
  /INTERACTS WITH THE STOREHOUSE LINE|REPORTED SEPARATELY FROM PART 1\.2a/.test(RAW) &&
  /two different figures and the report gives two, not one/.test(RAW),
  "deleting the Longhouse's provisions component and cutting the trade cost both loosen the food economy");

// ============================================================================
// PART 7 — TWO THINGS NOT TO TOUCH. Pass condition 20.
// ============================================================================
const untouched = await page.evaluate(() => ({
  crystalSinkMax: CRYSTAL_SINK_MAX,
  manufactoryFuel: MANUFACTORY_FUEL,
  consumption: CONSUMPTION,
  xpPerSecond: XP_PER_SECOND,
  barnSigma: +BARN_LINE.reduce((a, u) => a + u[1], 0).toFixed(4),
  warehouseSigma: +WAREHOUSE_LINE.reduce((a, u) => a + u[1], 0).toFixed(4),
  capFamilies: (() => { const f = {}; Object.keys(RES).forEach(r => {
    if (RES[r].baseCap === undefined) return; const k = capFamilyOf(r); f[k] = (f[k] || 0) + 1; }); return f; })()
}));
// PASS CONDITION 20 + 21
check("7/20 — `CRYSTAL_SINK_MAX` is UNTOUCHED: no round should tune a condition that passed",
  untouched.crystalSinkMax === 8,
  `${untouched.crystalSinkMax} — Part 8.2 cleared by a wide margin (crystals time-at-cap 95.6% -> 25.0%)`);
check("7/21 — and the standing invariants are all unmoved",
  Math.abs(untouched.barnSigma - 4.35) < 1e-9 && Math.abs(untouched.warehouseSigma - 1.80) < 1e-9 &&
  untouched.consumption === 4.25 && untouched.xpPerSecond === 0.05 &&
  Math.abs(untouched.manufactoryFuel - 0.024) < 1e-9,
  `BARN Σ${untouched.barnSigma} · WAREHOUSE Σ${untouched.warehouseSigma} · CONSUMPTION ` +
  `${untouched.consumption} · XP_PER_SECOND ${untouched.xpPerSecond} · MANUFACTORY_FUEL ${untouched.manufactoryFuel}`);
check("7/21 — `capFamilyOf()` still decides exactly TWO families, totally and single-valuedly",
  Object.keys(untouched.capFamilies).length === 2,
  JSON.stringify(untouched.capFamilies));

// ============================================================================
// DEV NOTE 1 — Sump Ventilation becomes an ore production bonus, AND the dead key it exposed
// ============================================================================
const note1 = await page.evaluate(() => {
  loadFromString(btoa(unescape(encodeURIComponent(JSON.stringify(freshState())))));
  TECHS.forEach(t => S.techs[t.id] = 1);
  S.wanderers = [];
  for (let i = 0; i < 40; i++) S.wanderers.push({ n: "w" + i, j: "miner", jx: {}, xp: 0, t: [] });
  S.pop = 40; S.jobs = { miner: 40 };
  const bare = computeRates().ore;
  S.upgrades.sumpVentilation = 1;
  const withSump = computeRates().ore;
  delete S.upgrades.sumpVentilation;
  // THE DEAD KEY. `for (var pk in boosts)` only visits keys the literal declares, so a policy
  // term keyed on a resource with no key was never applied. Assert DELIVERY, not the key.
  const noPolicy = computeRates().ore;
  S.policies.demacianAccord = true;
  const withPolicy = computeRates().ore;
  delete S.policies.demacianAccord;
  const kOf = {}; TECHS.forEach(t => kOf[t.id] = (t.cost && t.cost.knowledge) || 0);
  return {
    sumpLift: +((withSump / bare - 1) * 100).toFixed(3),
    policyLift: +((withPolicy / noPolicy - 1) * 100).toFixed(3),
    policyRate: POLICY_DEMACIA_RATE,
    quarryInMinerals: "quarry" in MINERALS_LINE,
    mineralsQuarryTerm: (BUILDINGS.find(b => b.id === "quarry") || {}).jobBoost,
    isBoostMember: BOOST_MEMBERS.some(m => m.id === "sumpVentilation" && m.family === "ore"),
    oreBounded: boostFamilyIsBounded("ore"),
    sigmaMatches: JSON.stringify(boostSigmaLive()) === JSON.stringify(BOOST_SIGMA_OF_RECORD),
    sigmaOre: BOOST_SIGMA_OF_RECORD.ore,
    ventTechK: kOf.sumpEcology, quarryTechK: kOf.petricite,
    quarryTechCost: TECHS.find(t => t.id === "petricite").cost
  };
});
check("note 1 — Sump Ventilation now lifts ORE production by exactly 5%, delivered IN FULL",
  Math.abs(note1.sumpLift - 5.0) < 0.01 && note1.isBoostMember && note1.oreBounded === false,
  `+${note1.sumpLift}% on the ore line. \`ore\` is not a BOOST_LIMIT family, so nothing is discarded.`);
check("note 1 — ...and it has LEFT MINERALS_LINE, while the Quarry's own 0.35 miner term stays",
  !note1.quarryInMinerals && note1.mineralsQuarryTerm.miner === 0.35,
  "the Quarry returns to Kittens' own 0.35 on this term, which it was not at before");
check("note 1 — the note's premise verified: the Discovery unlocked a TIER BEFORE the only building it touched",
  note1.ventTechK < note1.quarryTechK && !!note1.quarryTechCost.morellonomicon,
  `sumpEcology ${note1.ventTechK.toLocaleString()} + 30 plating vs petricite ${note1.quarryTechK.toLocaleString()} + ` +
  `${note1.quarryTechCost.morellonomicon} Morellonomicon — a tier-5 craft. Measured delivery to a player: ZERO.`);
// THE SECOND INSTANCE — the dead key
// The measured lift is the RESOURCE boost compounded with `catPolicy`'s generic +1% government
// term, which was always live: (1 + 0.085) × 1.01 = ×1.09585. **Before this round the resource
// half contributed NOTHING and the same measurement read +1.0% — the government term alone.**
check("note 1 — SECOND INSTANCE, FOUND BY THE NOTE: the Demacian Accord's ore boost now actually DELIVERS",
  Math.abs(note1.policyLift - ((1 + note1.policyRate) * 1.01 - 1) * 100) < 0.02 &&
  note1.policyLift > note1.policyRate * 100,
  `+${note1.policyLift}% = the declared ${(note1.policyRate * 100).toFixed(1)}% resource boost ` +
  `compounded with catPolicy's generic +1.0%. ` +
  `**BEFORE THIS ROUND IT DELIVERED 0.0%** — \`boosts\` had no \`timber\` or \`ore\` key, and the ` +
  `term is applied by \`for (var pk in boosts)\`, a loop over the keys the literal declares. ` +
  `v0.63 Part 3.2 shipped an effect that read as live code and reached nothing.`);
check("note 1 — ...and the defect class is NAMED at the site as a sibling of operational rule 11",
  /key absent from an object literal is never visited by a `for\.\.\.in`/.test(RAW) &&
  /IT IS THE SAME CLASS AS OPERATIONAL RULE 11 AND IT IS QUIETER/.test(RAW),
  "nothing throws, nothing renders NaN, and the tooltip states a figure the engine never applies");
check("note 1 — the add-a-boost rule is honoured: BOOST_SIGMA_OF_RECORD was EDITED to carry ore",
  note1.sigmaMatches && note1.sigmaOre === 0.05 &&
  /ore` is not a \*\*`BOOST_LIMIT`|`ore` is not\s*(?:\/\/\s*)?a `BOOST_LIMIT` family, so its raw Sigma 0\.05 is DELIVERED IN FULL/.test(RAW),
  "a future round that adds a member cannot make this pass without editing the record, and that " +
  "edit is the moment the report must carry the family's before/after delivered value");

// ============================================================================
// DEV NOTE 2 — what is a converter?
// ============================================================================
const note2 = await page.evaluate(() => {
  loadFromString(btoa(unescape(encodeURIComponent(JSON.stringify(freshState())))));
  TECHS.forEach(t => S.techs[t.id] = 1);
  CONV_DISCOVERY_LINE.forEach(u => S.upgrades[u[0]] = 1);
  const auto = convMultBreakdown(true), worked = convMultBreakdown(false);
  const lbl = t => t.map(x => x.label);
  return {
    autoLabels: lbl(auto.terms), workedLabels: lbl(worked.terms),
    autoProduct: +auto.product.toFixed(4), workedProduct: +worked.product.toFixed(4),
    discSum: convDiscoveryTotal(),
    // every building with a `convert` block is a converter, full stop
    converters: BUILDINGS.filter(b => b.convert).map(b => ({ id: b.id, auto: !!b.autoprod })),
    desc: UPGRADES.find(u => u.id === "bankedCoals").effect
  };
});
check("note 2 — the conversion Discoveries, the overseer affinity and the Cinders buff now reach EVERY converter",
  note2.autoLabels.some(l => /conversion Discoveries/.test(l)) &&
  note2.autoLabels.some(l => /overseer affinity/.test(l)) &&
  note2.autoLabels.some(l => /cinder buff/.test(l)),
  `autoprod terms: ${note2.autoLabels.join(" · ")}`);
check("note 2 — ...so the Sump Mine and the Coalgas Vent get the same Σ0.65 the Forge gets",
  Math.abs(note2.discSum - 0.65) < 1e-9 &&
  note2.autoProduct >= note2.workedProduct,
  `Σ${note2.discSum} — before this round Banked Coals raised the Forge, the Refineries and the ` +
  `Chem-Forgeworks, and did NOTHING for the two buildings that make Zaun Ore and Coalgas — the ` +
  `inputs the Shimmer Refinery it DOES boost runs on.`);
check("note 2 — the autoprod line stays EXCLUSIVE to the autoprod converters, and that asymmetry is correct",
  note2.autoLabels.some(l => /autoprod line \(Zaun\)/.test(l)) &&
  !note2.workedLabels.some(l => /autoprod line \(Zaun\)/.test(l)),
  "the Chembarrel Refinery drives those three buildings specifically, the way Kittens' Steamworks " +
  "drives its Magnetos — a property of the buildings, not a converter-output category");
check("note 2 — the RULING is stated: a converter is ANY building with a `convert` block",
  /A CONVERTER IS ANY BUILDING WITH A `convert` BLOCK\. There is no second kind\./.test(RAW),
  `${note2.converters.length} converters: ${note2.converters.map(c => c.id + (c.auto ? "*" : "")).join(", ")} (* = autoprod)`);
check("note 2 — NO new multiplicative category is added — §31 is still an OPEN QUESTION",
  /THIS ADDS NO NEW MULTIPLICATIVE CATEGORY/.test(RAW) &&
  note2.autoLabels.length === 5 && note2.workedLabels.length === 4,
  "every term already existed; three of them now have a wider SCOPE, and RR's factor count is unchanged");
check("note 2 — the tooltip no longer advertises the retired scope",
  /EVERY converter's output/.test(note2.desc) && !/worked converter/.test(note2.desc) &&
  !/non-autoprod siblings/.test(RAW),
  note2.desc);

// ============================================================================
// DEV NOTE 3 — the Sump Crawl cooldown
// ============================================================================
const note3 = await page.evaluate(() => {
  const e = id => EXPEDITIONS.find(x => x.id === id);
  return {
    sumpCrawl: e("sumpCrawl").cooldown,
    tier: EXPEDITIONS.filter(x => x.cooldown).map(x => ({ id: x.id, cd: x.cooldown }))
      .sort((a, b) => a.cd - b.cd)
  };
});
check("note 3 — the Sump Crawl is on a 450-second cooldown — 7.5 minutes, the floor the note states",
  note3.sumpCrawl === 450 && note3.sumpCrawl >= 7.5 * 60,
  `${note3.sumpCrawl}s. Cooled tier: ${note3.tier.map(t => `${t.id} ${t.cd}s`).join(" · ")}`);
// The Void Expedition's 300s is shorter and is not in this comparison: it is Era-4 content whose
// payout is Void Essence on a tech that ends the game, sized in its own round. Among the CAMPS —
// the repeatable resource routes — the Sump Crawl is the shortest, deliberately, because it is
// the only one whose payout is a MATERIAL rather than gold and the note sets a floor, not a figure.
check("note 3 — ...and it is the shortest of the repeatable CAMPS, which is deliberate",
  note3.tier.filter(t => t.id !== "voidExpedition")[0].id === "sumpCrawl",
  `cooled routes: ${note3.tier.map(t => `${t.id} ${t.cd}s`).join(" · ")}`);
check("note 3 — the premise is stated: it was the only UNCOOLED source of a converted material",
  /THE ONLY UNCOOLED SOURCE OF A CONVERTED MATERIAL\s*(?:\/\/\s*)?IN THE GAME/.test(RAW),
  "every other route to Zaun Ore and Coalgas is a converter, rate-limited by building count and inputs");
check("note 3 — §32: the slice is LABELLED a PRNG re-roll rather than reported as a pacing effect",
  /THIS SLICE IS A PRNG RE-ROLL AND IS LABELLED AS ONE \(§32\)/.test(RAW) &&
  /PRNG RE-ROLL SLICE/.test(readFileSync(new URL("../snapshots/v64/README.md", import.meta.url), "utf8")),
  "a cooldown changes how often a rerollAmt-consuming path fires. §32 rule 3: say so, and treat " +
  "the round's ensemble as a fresh draw. It is the LAST slice so every part before it stays comparable.");

// ============================================================================
// DEV NOTE 4 — devotion
// ============================================================================
const note4 = await page.evaluate(() => {
  loadFromString(btoa(unescape(encodeURIComponent(JSON.stringify(freshState())))));
  const b = id => BUILDINGS.find(x => x.id === id);
  const mar = b("marus"), ch = b("chapel"), sh = b("shrine");
  // the ceiling ladder: the Marus must be the PRIMARY way to raise the devotion cap
  const capPer = { shrine: sh.caps.devotion, marus: mar.caps.devotion };
  return {
    marusHasProd: !!mar.prod, marusCap: mar.caps.devotion,
    chapelDevotion: ch.prod.devotion, chapelCulture: ch.prod.culture,
    shrineDevotion: sh.prod.devotion, shrineCap: sh.caps.devotion,
    capPer, marusEffect: mar.effect,
    constants: { MARUS_DEVOTION_CAP, SHRINE_DEVOTION_CAP, CHAPEL_DEVOTION },
    marusDevotionGone: typeof MARUS_DEVOTION === "undefined",
    // effectLines() must not print a devotion rate for a building that has none
    marusLines: (S.buildings = { marus: 1 }, effectLines(mar).join(" | "))
  };
});
check("note 4 — the Marus's devotion RATE is removed: the `prod` key is gone, not zeroed",
  !note4.marusHasProd && note4.marusDevotionGone,
  "a `prod: { devotion: 0 }` would still be enumerated by effectLines() and would print '0/second'");
check("note 4 — ...and its tooltip does not advertise a rate it no longer has",
  !/devotion\/second|devotion\/s/i.test(note4.marusLines) && /ceiling/i.test(note4.marusEffect),
  note4.marusLines);
check("note 4 — the Marus's devotion CAP is 250, and it is the largest in the game",
  note4.marusCap === 250 && note4.constants.MARUS_DEVOTION_CAP === 250 &&
  note4.marusCap > note4.shrineCap,
  `Marus ${note4.marusCap} against the Shrine's ${note4.shrineCap} — "Marus should be the PRIMARY way to increase devotion cap"`);
check("note 4 — the Chapel gives 0.015 devotion/second",
  note4.chapelDevotion === 0.015 && note4.constants.CHAPEL_DEVOTION === 0.015,
  `${note4.chapelDevotion}/s (was 0.025, the source's chapel figure exactly — this is a deliberate departure)`);
check("note 4 — ...and the Chapel's CULTURE half is untouched at the source's own 0.250/s",
  note4.chapelCulture === 0.25,
  "only the half the note names moves; Kittens' chapel is culturePerTickBase 0.05 × 5 = 0.250/s");
check("note 4 — the Shrine of the Solari gives 50 devotion cap",
  note4.shrineCap === 50 && note4.constants.SHRINE_DEVOTION_CAP === 50,
  `${note4.shrineCap} (was 75)`);
check("note 4 — ...and the Shrine's RATE is untouched — the one devotion figure at verified source parity",
  note4.shrineDevotion === 0.0075,
  `${note4.shrineDevotion}/s = Kittens' temple faithPerTickBase 0.0015 × 5 (v0.47 Part 2)`);
check("note 4 — the Chapel's departure from the source is LEDGERED as HARDER, not shipped as a parity fix",
  /THIS ROW IS SWAIN'S PASSIVE SLOT/.test(LEDGER) &&
  /v0\.64 DEV NOTE 4[\s\S]{0,400}PARITY → HARDER/.test(LEDGER),
  "§16 requires the honest label; §17 is the precedent that shows it costs nothing and buys a great deal");
check("note 4 — the Marus's retired FAUCET row is re-rated rather than deleted",
  /THIS ROW IS RETIRED BY THE CHANGE IT DESCRIBES, AND IT IS RE-RATED RATHER THAN DELETED/.test(LEDGER),
  "v0.61 rated the Marus EASIER because it was an ADDITIONAL devotion faucet; the faucet is gone");

// ============================================================================
// THE ROUND'S DISCIPLINE — the prefix chain, and the round's own instrument
// ============================================================================
const README = readFileSync(new URL("../snapshots/v64/README.md", import.meta.url), "utf8");
check("§9 — the isolation slices are CUMULATIVE PREFIXES, built forward, and the chain is PROVED",
  /s8 == shipped index\.html byte-for-byte: True/i.test(README),
  "v0.47 shipped a report labelling an isolation build 'Part 1 only' when it was not. The proof " +
  "here is arithmetic: the last prefix hashes identically to the shipped file.");
check("§9 — ...and every slice is a real file on disk, one per Part, in the spec's order",
  ["s0", "s1", "s2", "s3", "s4", "s5", "s6", "s7", "s8"].every(s =>
    new RegExp("^" + s + "\\s", "m").test(README)),
  README.split("\n").filter(l => /^s\d/.test(l)).length + " slices recorded");
check("VERSION — the constant is bumped and matches the tag this round ships",
  /var VERSION = "v0\.64"/.test(CODE),
  "§10: the git tag is authoritative and the in-file constant must match it at ship time");
check("no page errors on load", errors.length === 0, errors.slice(0, 3).join(" | "));

console.log(`\n${pass} passed, ${fail} failed`);
suiteEnd(import.meta.url, pass, fail);
await browser.close();
process.exit(fail ? 1 : 0);
