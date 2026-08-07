// test-v53 — BUILDER SPEC v0.53 ("five buildings measure zero because the bot cannot buy
// them"), plus Jerry's six numbered gameplay directives, which override the spec where
// they conflict.
//
// Every item asserted against the SHIPPED build rather than against the spec's own
// arithmetic. Two assertions here read files other than index.html — Part 1.1's
// reachability enumeration has to subtract the bot's build order from BUILDINGS, and the
// bot lives in sim/simcore.mjs. The spec asks for exactly that ("have it read both
// files"), because the defect it catches is precisely one that lives in the gap between
// the two.
import { chromium } from "playwright";
import fs from "fs";
const FILE = new URL("../index.html", import.meta.url).href;
const SRC = fs.readFileSync(new URL("../index.html", import.meta.url).pathname, "utf8");
const SIM = fs.readFileSync(new URL("../sim/simcore.mjs", import.meta.url).pathname, "utf8");
// STANDING-RULINGS §8 / HANDOFF v0.52 §6: strip comments before grepping source. A
// source-shape assertion that greps for a phrase will otherwise match the comment that
// explains the phrase — broken twice already, v0.51's banner and v0.52's resRatio.
const strip = s => s.replace(/\/\*[\s\S]*?\*\//g, "").replace(/^[ \t]*\/\/.*$/gm, "");
const CODE = strip(SRC);
const SIMCODE = strip(SIM);
let pass = 0, fail = 0;
const check = (n, c, x) => { console.log(n + ":", c ? "PASS" : "FAIL", x ?? ""); c ? pass++ : fail++; };
const browser = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium" }).catch(() => chromium.launch());
const page = await browser.newPage();
await page.goto(FILE);
await page.waitForTimeout(500);
const reset = () => page.evaluate(() =>
  loadFromString(btoa(unescape(encodeURIComponent(JSON.stringify(freshState()))))));

// ============================================================================
// PART 1.1 — EVERY BUILDING IS REACHABLE BY THE INSTRUMENT, BY ENUMERATION
//
// This is the assertion the spec asks for by name, and it is the whole reason the build
// order was hoisted out of manageBuildings() into a module-scope BUILD_ORDER: a list
// nothing outside one function can read cannot be enumerated. A comment saying "tavern
// and bloomery removed" did not stop the Shimmer Refinery omission recurring four more
// times. This will.
// ============================================================================
await reset();
const ids = await page.evaluate(() => BUILDINGS.map(b => b.id));
const listOf = (src, name) => {
  const i = src.indexOf("const " + name + " = [");
  if (i < 0) return null;
  const j = src.indexOf("];", i);
  return (src.slice(i, j).match(/"[a-zA-Z]+"/g) || []).map(s => s.slice(1, -1));
};
const order = listOf(SIMCODE, "BUILD_ORDER");
const dedicated = listOf(SIMCODE, "DEDICATED_ROUTINES");
check("1.1 — simcore exposes BUILD_ORDER and DEDICATED_ROUTINES at module scope",
  Array.isArray(order) && order.length > 30 && Array.isArray(dedicated) && dedicated.length >= 5,
  `${order ? order.length : "?"} + ${dedicated ? dedicated.length : "?"}`);
const unreachable = ids.filter(id => !order.includes(id) && !dedicated.includes(id));
check("1.1 — NO building is unreachable by the bot: BUILDINGS − BUILD_ORDER − dedicated routines is EMPTY",
  unreachable.length === 0, unreachable.join(", ") || `all ${ids.length} reachable`);
check("1.1 — the two v0.53 additions are the ones that were missing: poroPasture and hexcreteBastion",
  order.includes("poroPasture") && order.includes("hexcreteBastion"));
check("1.1 — every id in the build order is a real building (no ghosts left behind by a deletion)",
  order.every(id => ids.includes(id)), order.filter(id => !ids.includes(id)).join(", ") || "none");
check("1.1 — every dedicated-routine id is a real building",
  dedicated.every(id => ids.includes(id)), dedicated.filter(id => !ids.includes(id)).join(", ") || "none");

// ============================================================================
// PART 1.2 — the Poro sacrifice, and the skip that is now justified rather than silent
// ============================================================================
check("1.2 — the poroTears skip in manageCrafts SURVIVES (its input is a herd, not a stock)",
  /rec\.id === "poroTears"\) continue;/.test(SIMCODE));
check("1.2 — ...and a DEDICATED managePoroSacrifice() now exists and is called each decision pass",
  /function managePoroSacrifice\(\)/.test(SIMCODE) && /managePoroSacrifice\(\);/.test(SIMCODE));
check("1.2 — it sacrifices only from surplus: the spec's poros >= PORO_SACRIFICE_COST × Watcher's Eyes",
  /S\.res\.poros < PORO_SACRIFICE_COST \* eyes/.test(SIMCODE));
check("1.2 — ...and never more than half the herd in one pass",
  /S\.res\.poros \* 0\.5 \/ PORO_SACRIFICE_COST/.test(SIMCODE));
const p12 = await page.evaluate(() => {
  const ladder = ["frostguardCairn", "avarosanHold", "iceWroughtSpire", "frozenWatcher"];
  return {
    tears: CRAFTS.find(c => c.id === "poroTears").cost,
    yieldIsEyes: (() => { S.buildings.watchersEye = 7; const y = craftYield("poroTears");
                          S.buildings.watchersEye = 0; return y; })(),
    ladderCosts: ladder.map(id => BUILDINGS.find(b => b.id === id).cost.poroTears)
  };
});
check("1.2 — the sacrifice is unchanged by this round: 60 poros in, one Tear per Eye out",
  p12.tears.poros === 60 && p12.yieldIsEyes === 7, JSON.stringify(p12.tears));
check("1.2 — the whole poroRatio ladder is priced in Tears, which is why zero Tears meant zero ladder",
  JSON.stringify(p12.ladderCosts) === JSON.stringify([5, 25, 120, 600]), JSON.stringify(p12.ladderCosts));

// ============================================================================
// PART 1.3 — the hexgear starvation. The fix is demand propagation, not a price cut.
// ============================================================================
check("1.3 — manageCrafts propagates demand DOWN the craft tree (the missing step)",
  /propagationOrder/.test(SIMCODE) && /wantIntermediate\[inp\] = Math\.max/.test(SIMCODE));
check("1.3 — ...deepest-first, so a want reaches the shallowest craft in one pass",
  /sort\(\(a, b\) => craftDepth\[b\] - craftDepth\[a\]\)/.test(SIMCODE));
check("1.3 — propagation stops at raw resources (only `made`/`craft` inputs are propagated to)",
  /RES\[inp\]\.kind !== "made" && RES\[inp\]\.kind !== "craft"/.test(SIMCODE));
check("1.3 — the spec's option (a) also ships: the batch ceiling lifts when the shortfall exceeds it",
  /BATCH_CEILING = 25/.test(SIMCODE) && /short > BATCH_CEILING \? short :/.test(SIMCODE));
check("1.3 — the half-of-any-raw-input guard is UNCHANGED, so propagation cannot starve the raws",
  /batch = Math\.min\(batch, Math\.max\(1, Math\.floor\(S\.res\[inp\] \* 0\.5 \/ cst\[inp\]\)\)\)/.test(SIMCODE));
check("1.3 — the Hextech Foundry's price is NOT touched: hexgear 200 + scaffold 100, ratio 1.25",
  await page.evaluate(() => { const b = BUILDINGS.find(x => x.id === "hextechFoundry");
    return b.cost.hexgear === 200 && b.cost.scaffold === 100 && b.ratio === 1.25 && !b.cost.crystals; }));

// ============================================================================
// PART 2 — crystals get a geometric sink
// ============================================================================
const p2 = await page.evaluate(() => {
  const CARRIERS = { vault: 400, piltoverSpire: 900, hexdraulicPlant: 1800, arcaneReactor: 3000 };
  const out = { carriers: {}, scaled: {}, ratios: {} };
  for (const id in CARRIERS) {
    const b = BUILDINGS.find(x => x.id === id);
    out.carriers[id] = b.cost.crystals;
    out.ratios[id] = b.ratio;
    // the crystal component must escalate with copy count exactly as the others do
    S.buildings[id] = 0; const c0 = buildingCost(b).crystals;
    S.buildings[id] = 10; const c10 = buildingCost(b).crystals;
    const other = Object.keys(b.cost).find(k => k !== "crystals");
    const o0 = (S.buildings[id] = 0, buildingCost(b)[other]);
    const o10 = (S.buildings[id] = 10, buildingCost(b)[other]);
    S.buildings[id] = 0;
    out.scaled[id] = Math.abs((c10 / c0) - (o10 / o0)) < 1e-9 && c10 > c0;
  }
  return out;
});
check("2.1 — all four late repeatables carry crystals, rank-ordered as Kittens ranks starchart",
  JSON.stringify(p2.carriers) === JSON.stringify({ vault: 400, piltoverSpire: 900, hexdraulicPlant: 1800, arcaneReactor: 3000 }),
  JSON.stringify(p2.carriers));
check("2.4 — the crystal component is INSIDE the ratio-scaled cost for every carrier",
  Object.values(p2.scaled).every(Boolean), JSON.stringify(p2.scaled));
check("2.1 — the Hextech Foundry is deliberately NOT a carrier (Part 1.3 must prove it buyable first)",
  await page.evaluate(() => !BUILDINGS.find(x => x.id === "hextechFoundry").cost.crystals));
check("2.4 — auditCostGraph() and auditRawGraph() both return ZERO with crystals in the graph",
  await page.evaluate(() => auditCostGraph().length === 0 && auditRawGraph().length === 0),
  await page.evaluate(() => JSON.stringify([auditCostGraph(), auditRawGraph()])));
check("2.2 — the sizing SCALE is stated in the code comment, as v0.52 §3.2 did for the Refinery",
  /THE CRYSTAL SINK/.test(SRC) && /DEEP WORKS -> ICATHIA WINDOW/.test(SRC) && /8,372\/game-year/.test(SRC));
check("2.3 — the Augment Chamber is NOT nerfed: jobBoost.tinkerer stays 0.40, unbounded",
  await page.evaluate(() => BUILDINGS.find(b => b.id === "augmentChamber").jobBoost.tinkerer === 0.40 &&
    BOOST_LIMIT.tinkerer === undefined));
check("2 — this round raises NO price: every non-crystal component of the four carriers is unchanged",
  await page.evaluate(() => {
    const b = id => BUILDINGS.find(x => x.id === id);
    return b("vault").cost.hexSlab === 100 && b("vault").cost.plating === 160 &&
           b("piltoverSpire").cost.scaffold === 130 && b("piltoverSpire").cost.hexSlab === 80 &&
           b("hexdraulicPlant").cost.hexgear === 120 && b("hexdraulicPlant").cost.plating === 200 &&
           b("hexdraulicPlant").cost.gold === 4000 &&
           b("arcaneReactor").cost.hexcore === 400 && b("arcaneReactor").cost.hexcrete === 800 &&
           b("arcaneReactor").cost.focusedHex === 600;
  }));

// ============================================================================
// PART 3 — the two rulings, closed in code so no future round re-opens them
// ============================================================================
check("3.1 — poroRatio is UNBOUNDED and stays that way: no BOOST_LIMIT key, no limitedDR on it",
  await page.evaluate(() => {
    const src = poroRatio.toString();
    return BOOST_LIMIT.poroRatio === undefined && BOOST_LIMIT.poros === undefined &&
      !/limitedDR/.test(src);
  }), await page.evaluate(() => poroRatio.toString().replace(/\s+/g, " ")));
check("3.1 — the ruling is recorded in code with the unicornsRatioReligion census and its citation",
  /unicornsRatioReligion/.test(SRC) && /js\/religion\.js/.test(SRC) &&
  /8\.40/.test(SRC) && /23% of the source/.test(SRC) && /Do not add a limit/.test(SRC));
check("3.1 — RR's four rungs still sum to 1.13 → ×2.13, a rank-for-rank transliteration of Kittens' first four",
  await page.evaluate(() => {
    const s = ["frostguardCairn", "avarosanHold", "iceWroughtSpire", "frozenWatcher"]
      .reduce((a, id) => a + BUILDINGS.find(b => b.id === id).poroRatio, 0);
    return Math.abs(s - 1.13) < 1e-9;
  }));
check("3.2 — `audience` is KEPT, on the Bard's Hearth, at 0.05, unbounded",
  await page.evaluate(() => {
    const h = BUILDINGS.find(b => b.id === "bardsHearth");
    return h.audience === 0.05 && BUILDINGS.filter(b => b.audience).length === 1;
  }));
check("3.2 — ...and recorded as a CONSCIOUS DEPARTURE, not presented as parity",
  /RR-ONLY, and a conscious departure/.test(SRC) && /culturePerTickBase is flat/.test(SRC) &&
  /js\/buildings\.js:1801-1830/.test(SRC) && /DO NOT BOUND IT NOW/.test(SRC));
// The tripwire the spec asks for, converted from a judgement call into an assertion.
// The term is `1 + audience x pop` applied to ONE building's culture. Asserted as the
// shape the ruling rests on — it grows strictly with population and is unbounded — plus
// the tripwire, rather than against enhance-audit's delivered figures, which are diluted
// by every other culture source and are not what this multiplier is.
const p32 = await page.evaluate(() => {
  const h = BUILDINGS.find(b => b.id === "bardsHearth");
  const at = p => +(1 + h.audience * p).toFixed(4);
  return { at20: at(20), at200: at(200), at2000: at(2000),
           AUDIENCE_REOPEN_POP: typeof AUDIENCE_REOPEN_POP !== "undefined" ? AUDIENCE_REOPEN_POP : null };
});
check("3.2 — the multiplier is 1 + 0.05 x pop, unbounded, and grows strictly with population",
  p32.at20 === 2 && p32.at200 === 11 && p32.at2000 === 101, JSON.stringify(p32));
check("3.2 — THE TRIPWIRE: AUDIENCE_REOPEN_POP exists at 600, so a population that passes it re-opens the ruling",
  p32.AUDIENCE_REOPEN_POP === 600, String(p32.AUDIENCE_REOPEN_POP));

// ============================================================================
// PART 4 — the Eludium tier and its repeatable consumer
// ============================================================================
const p4 = await page.evaluate(() => {
  const c = CRAFTS.find(x => x.tier5);
  const consumers = BUILDINGS.filter(b => c && b.cost[c.out]);
  return c ? {
    id: c.id, out: c.out, cost: c.cost, tier5: c.tier5,
    ratio: +(c.cost.hexgear / c.cost.voidessence).toFixed(4),
    showsAtIcathia: (() => { S.techs = {}; const a = c.show(S); S.techs = { icathia: true }; const b = c.show(S);
                             S.techs = {}; return !a && b; })(),
    res: !!RES[c.out],
    consumers: consumers.map(b => ({ id: b.id, ratio: b.ratio, amount: b.cost[c.out], tech: b.tech }))
  } : null;
});
check("4.1/4.2 — a tier-5 craft exists, gated on Icathia, made of Void Essence and Hexgear",
  !!p4 && p4.res && p4.showsAtIcathia && p4.cost.voidessence > 0 && p4.cost.hexgear > 0,
  p4 ? JSON.stringify(p4.cost) : "MISSING");
check("4.2 — the 2.5 : 1 previous-tier-craft to deep-raw ratio is PRESERVED (Kittens: alloy 2500 / unobtainium 1000)",
  !!p4 && Math.abs(p4.ratio - 2.5) < 1e-9, p4 ? `hexgear/voidessence = ${p4.ratio}` : "n/a");
check("4.3 — it has at least one REPEATABLE consumer at priceRatio 1.15, rank-matched to orbitalArray",
  !!p4 && p4.consumers.length >= 1 && p4.consumers.some(c => c.ratio === 1.15),
  p4 ? JSON.stringify(p4.consumers) : "n/a");
check("4.3 — ...and that consumer is Icathia-gated, so the craft and its sink arrive together",
  !!p4 && p4.consumers.every(c => c.tech === "icathia"));
check("4 — the source citation is in the code: eludium unobtainium 1000 + alloy 2500, tier 5, handicap 300",
  /deep-raw 1,000 \+ previous-tier-craft 2,500/.test(SRC) && /progressHandicap/.test(SRC) &&
  /js\/workshop\.js/.test(SRC) && /handicap of 300 is 30-60x/.test(SRC));
check("4 — the consumer's rank-match is cited from source (spaceStation starchart 425 + alloy 750 @1.12)",
  /orbitalArray/.test(SRC) && /js\/space\.js/.test(SRC));

// ============================================================================
// PART 5 — the apparatus fixes, asserted in the apparatus
// ============================================================================
check("5.1 — the KNOWLEDGE MULT Σ includes the non-building contributors, not buildings alone",
  /sigmaParts/.test(SIMCODE) && /sigmaRites/.test(SIMCODE) && /sigmaChamp/.test(SIMCODE) && /sigmaPolicy/.test(SIMCODE));
check("5.1 — ...and `delivered` neutralises ONLY the knowledge-boost carriers, not every building",
  /for \(const id in counts\) S\.buildings\[id\] = 0;/.test(SIMCODE) &&
  !/S\.buildings = \{\};\s*\n\s*const bareB/.test(SIMCODE));
{
  const EA = strip(fs.readFileSync(new URL("../tools/enhance-audit.mjs", import.meta.url).pathname, "utf8"));
  check("5.2 — boostDelivered() no longer divides two NET rates: consumption is removed by a zero-worker reading",
    /const zero = jobOut\(job, res, \{\}, 0\)/.test(EA) && /\(with_ - zero\) \/ G0/.test(EA));
  check("5.2 — ...and the printed `delivered` is the multiplier 1 + limitedDR(Σ, BOOST_LIMIT[res])",
    /function boostMult\(res, sigma\)/.test(EA) && /limitedDR\(sigma, L\)/.test(EA));
  check("5.2 — Σ0 is SOLVED FOR end-to-end rather than enumerated from source lines that go stale",
    /sigma0Solved/.test(EA) && /bisect/.test(fs.readFileSync(new URL("../tools/enhance-audit.mjs", import.meta.url).pathname, "utf8")));
  const SA = fs.readFileSync(new URL("../tools/shimmer-audit.mjs", import.meta.url).pathname, "utf8");
  check("5.3 — shimmer-audit no longer hardcodes campYieldMult: it is read live, and the fallback announces itself",
    /--camp/.test(SA) && /NOT SUPPLIED/.test(SA));
  const T52 = fs.readFileSync(new URL("./test-v52.mjs", import.meta.url).pathname, "utf8");
  check("5.4 — test-v52's censusLocked selector half is re-pointed at selectors the renderer emits",
    // strip() first: the re-pointing note NAMES the retired selector, and a raw grep would
    // match the comment explaining it — the exact failure mode STANDING-RULINGS §8 records
    // as having been made twice already.
    !/census-row\|data-w=/.test(strip(T52)) && /census-trait\|data-census=/.test(strip(T52)) &&
    /censusOpenSelectors/.test(strip(T52)));
  check("5.4 — ...and those selectors really are what renderCensus() emits",
    /class="census-trait"/.test(SRC) && /data-census="/.test(SRC));
  const T14 = fs.readFileSync(new URL("./historical/test-v14.mjs", import.meta.url).pathname, "utf8");
  check("5.5 — test-v14 declares itself archaeology and names the Tavern as deleted in v0.52",
    /ARCHAEOLOGY — NOT A REGRESSION SUITE/.test(T14) && /DELETED in v0\.52 Part 2\.3/.test(T14));
}

// ============================================================================
// JERRY'S DIRECTIVES — these override the spec where they conflict
// ============================================================================
// 1 — the knowledge fan-out rule: one research reveals at most three others
const j1 = await page.evaluate(() => {
  const kids = {};
  TECHS.forEach(t => { if (t.req) (kids[t.req] = kids[t.req] || []).push(t.id); });
  const over = Object.entries(kids).filter(([, v]) => v.length > 3).map(([k, v]) => `${k}:${v.length}`);
  const price = id => TECHS.find(t => t.id === id).cost.knowledge || 0;
  // every child must be strictly more expensive than its parent, or the DAG is not a ladder
  const backwards = TECHS.filter(t => t.req && price(t.id) <= price(t.req)).map(t => t.id);
  return { kids, over, backwards, almanac: (kids.almanac || []).slice().sort(),
           roots: TECHS.filter(t => !t.req).map(t => t.id), n: TECHS.length,
           costs: TECHS.map(t => t.cost.knowledge).filter(Boolean).sort((a, b) => a - b) };
});
check("J1 — NO research reveals more than three others (the loose rule, applied to the whole tree)",
  j1.over.length === 0, j1.over.join(", ") || "max fan-out ≤ 3 everywhere");
check("J1 — the Almanac unlocks exactly Cultivation, Woodcraft and Expedition Logistics",
  JSON.stringify(j1.almanac) === JSON.stringify(["cultivation", "logistics", "woodcraft"]),
  JSON.stringify(j1.almanac));
check("J1 — the tree still has exactly one root and every edge still climbs in price",
  j1.roots.length === 1 && j1.roots[0] === "almanac" && j1.backwards.length === 0,
  j1.backwards.join(", ") || "monotonic");
check("J1 — re-parenting moved NO price: the ladder is the same 37-tech multiset",
  j1.n === 37 && j1.costs.length === 37 && j1.costs[0] === 30 && j1.costs[36] === 135000,
  `${j1.n} techs, ${j1.costs[0]}..${j1.costs[36]}`);

// 2 — a tooltip must not advertise an effect on a resource the player has not unlocked
const j2 = await page.evaluate(() => {
  const store = BUILDINGS.find(b => b.id === "storehouse");
  const fresh = JSON.parse(JSON.stringify(freshState()));
  S.seenMax = Object.assign({}, fresh.seenMax); S.res = Object.assign({}, fresh.res);
  S.techs = {}; S.buildings = Object.assign({}, fresh.buildings); S.buildings.storehouse = 1;
  const cold = effectLines(store).join(" || ");
  S.seenMax.gold = 5; S.seenMax.ore = 5; S.techs.mining = true;
  const warm = effectLines(store).join(" || ");
  S.seenMax = Object.assign({}, fresh.seenMax); S.techs = {}; S.buildings = Object.assign({}, fresh.buildings);
  return { cold, warm };
});
check("J2 — the Storehouse does NOT advertise Max gold before gold has been unlocked",
  !/Max gold/.test(j2.cold), j2.cold);
check("J2 — ...and DOES advertise it the moment gold has been held",
  /Max gold/.test(j2.warm) && /Max ore/.test(j2.warm), j2.warm);
check("J2 — the gate is the game's own resUnlocked(), not a second definition of 'unlocked'",
  /function ttResKnown\(r\)/.test(CODE) && /resUnlocked\(r\)/.test(CODE));

// 3 — Woodcraft does not unlock Support Beams; Carpentry does
const j3 = await page.evaluate(() => {
  const t = id => TECHS.find(x => x.id === id);
  return {
    woodcraftEffect: t("woodcraft").effect || "",
    carpentryEffect: t("carpentry").effect || "",
    beamCraftShowsOnCarpentry: (() => { S.techs = { woodcraft: true };
      const a = CRAFTS.find(c => c.id === "beam").show(S);
      S.techs = { carpentry: true }; const b = CRAFTS.find(c => c.id === "beam").show(S);
      S.techs = {}; return !a && b; })(),
    beamResHiddenOnWoodcraft: (() => { S.techs = { woodcraft: true };
      const a = RES.beam.hidden(S); S.techs = { carpentry: true };
      const b = RES.beam.hidden(S); S.techs = {}; return a && !b; })()
  };
});
check("J3 — Woodcraft's tooltip no longer claims to reveal Support Beams",
  !/Support Beams/.test(j3.woodcraftEffect), j3.woodcraftEffect);
check("J3 — Carpentry's tooltip says it, because Carpentry is what actually unlocks the recipe",
  /Support Beams/.test(j3.carpentryEffect), j3.carpentryEffect);
check("J3 — and the resource ROW follows the recipe: hidden on Woodcraft, shown on Carpentry",
  j3.beamCraftShowsOnCarpentry && j3.beamResHiddenOnWoodcraft);

// 4 — gold storage starts at 200
check("J4 — gold's base storage is 200",
  await page.evaluate(() => RES.gold.baseCap === 200), await page.evaluate(() => String(RES.gold.baseCap)));
check("J4 — ...and it is the BASE that moved: the storage line's own gold terms are unchanged",
  await page.evaluate(() => {
    const b = id => BUILDINGS.find(x => x.id === id);
    return b("storehouse").caps.gold === 10 && b("warehouse").caps.gold === 80 && b("harbor").caps.gold === 200;
  }));

// 5 — the Arcanist's Circle
const j5 = await page.evaluate(() => {
  const u = UPGRADES.find(x => x.id === "arcanistsCircle");
  if (!u) return null;
  // drive it: mana at cap, one game-year boundary
  S.upgrades = { arcanistsCircle: true }; S.buildings = {}; S.techs = { songcraft: true };
  const cap = computeCaps().mana;
  S.res.mana = cap; S.res.timber = 0;
  const before = S.res.mana;
  arcanistsCircleYear();
  const spent = before - S.res.mana, gained = S.res.timber;
  // and NOT when mana is short of the cap
  S.res.mana = cap * 0.5; S.res.timber = 0;
  arcanistsCircleYear();
  const whenNotCapped = S.res.timber;
  S.upgrades = {}; S.techs = {}; S.res.mana = 0; S.res.timber = 0;
  return { tech: u.tech, cost: u.cost, share: ARCANIST_SHARE, before, spent, gained, whenNotCapped, cap, tCost: TRANSMUTE_COST };
});
check("J5 — an Arcanist's Circle Discovery exists and is unlocked after Songcraft",
  !!j5 && j5.tech === "songcraft", j5 ? JSON.stringify(j5.cost) : "MISSING");
check("J5 — it converts 33% of stored mana when mana is CAPPED",
// RE-POINTED v0.58.1 — the literal 14 was TRANSMUTE_COST, which this round moved to 20 to hold
// the trade circuit's loop guard after notes 17 and 34 (see transmuteYield in index.html). It
// is read from the constant now rather than pinned, so a future reprice cannot make this the
// third assertion in the project designed to fail on the next release.
  !!j5 && j5.share === 0.33 && Math.abs(j5.spent - Math.floor(j5.before * 0.33 / j5.tCost) * j5.tCost) < 1e-9 && j5.gained > 0,
  j5 ? `cap ${j5.cap}, spent ${j5.spent} mana, gained ${j5.gained} timber` : "n/a");
check("J5 — and does nothing at all when mana is below the cap",
  !!j5 && j5.whenNotCapped === 0);
check("J5 — it fires on a YEARLY boundary, not every tick",
  /arcanistsCircleYear\(\)/.test(CODE) && /S\.arcaneYear/.test(CODE));

// 6 — parchment is craftable as soon as furs are obtained
const j6 = await page.evaluate(() => {
  const p = CRAFTS.find(c => c.id === "parchment");
  const at = n => { S.seenMax.furs = n; return p.show(S); };
  const r = { none: at(0), one: at(1), some: at(20), full: at(175), cost: p.cost.furs };
  S.seenMax.furs = 0;
  return r;
});
check("J6 — Parchment shows as craftable the moment any furs have been held",
  j6.one && j6.some && j6.full && !j6.none, JSON.stringify(j6));
check("J6 — ...and its COST is untouched at 175 furs (Kittens parity; only the reveal moved)",
  j6.cost === 175, String(j6.cost));

// ============================================================================
// SHIP DISCIPLINE — the version, which STANDING-RULINGS §10 says must agree with the tag
// ============================================================================
const ver = await page.evaluate(() => (typeof VERSION !== "undefined" ? VERSION : null));
// v0.54 RE-POINT: this assertion pinned the literal "v0.53", which made it a check that
// fails on every subsequent round by design — the thing it exists to prove is that a
// VERSION constant EXISTS and that the footer is rendered from it, not what this round's
// number happens to be. It now asserts the SHAPE and defers the value to the round's own
// suite (test-v54 pins v0.54). Superseded by: v0.54 ship discipline.
check("ship — a VERSION constant exists and is well-formed (STANDING-RULINGS §10 required one; there was none)",
  typeof ver === "string" && /^v\d+\.\d+(\.\d+)?$/.test(ver), String(ver));
check("ship — the footer is RENDERED from VERSION, so the two can never disagree again",
  /footer-note[^]{0,400}VERSION/.test(CODE) || /getElementById\("version-note"\)/.test(CODE));

// ============================================================================
// REGRESSIONS this round must not have caused
// ============================================================================
check("regression — BOOST_LIMIT still has its seven keys and `knowledge` is still absent",
  await page.evaluate(() => Object.keys(BOOST_LIMIT).length === 7 && BOOST_LIMIT.knowledge === undefined),
  await page.evaluate(() => Object.keys(BOOST_LIMIT).sort().join(",")));
check("regression — CAMP_YIELD_LIMIT is still 6 and the Petricite Quarry still has the id `quarry`",
  await page.evaluate(() => CAMP_YIELD_LIMIT === 6 &&
    BUILDINGS.find(b => b.id === "quarry").name === "Petricite Quarry"));
check("regression — catMeta still has TWO outputs (catMetaTransient is load-bearing)",
  /catMetaTransient/.test(CODE) && /var catMeta = 1 \+ limitedDR/.test(CODE));
check("regression — the global-production category still has exactly two members",
  await page.evaluate(() => BUILDINGS.filter(b => b.globalBoost).map(b => b.id).join(",") ===
    "hextechFoundry,arcaneReactor"));
check("regression — Ascent is still free, instant, uncapped and bonus-free",
  await page.evaluate(() => !/cost|cooldown/i.test(ascendTargon.toString().split("\n").slice(0, 6).join(" "))));
check("regression — every building still produces at least one generated Effects line when everything is owned",
  await page.evaluate(() => {
    TECHS.forEach(t => S.techs[t.id] = true); UPGRADES.forEach(u => S.upgrades[u.id] = true);
    BUILDINGS.forEach(b => S.buildings[b.id] = 3);
    for (const r in RES) if (S.res[r] !== undefined) S.res[r] = 1e6;
    S.seenMax = Object.assign({}, S.res); S.pop = 60;
    const empty = BUILDINGS.filter(b => effectLines(b).length === 0).map(b => b.id);
    return empty.length === 0;
  }));

console.log(`\n${pass} passed, ${fail} failed`);
await browser.close();
process.exit(fail ? 1 : 0);
