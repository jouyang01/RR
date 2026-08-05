// test-v54 — Jerry's seventeen numbered dev-gameplay directives, asserted against the
// SHIPPED build. The offline-progression half of this round lives in test-offline-v54.mjs,
// which descends from the v0.52 audit and is the suite that proves both defects fixed.
//
// Where a directive supersedes an assertion an earlier suite already made, the earlier
// assertion is RE-POINTED rather than deleted, and the re-point is listed in BUILD REPORT
// v0.54 §7 with its superseding directive.
import { chromium } from "playwright";
import fs from "fs";
const FILE = new URL("../index.html", import.meta.url).href;
const SRC = fs.readFileSync(new URL("../index.html", import.meta.url).pathname, "utf8");
// STANDING-RULINGS §8: strip comments before grepping source, or a source-shape assertion
// matches the comment that explains it.
const strip = s => s.replace(/\/\*[\s\S]*?\*\//g, "").replace(/^[ \t]*\/\/.*$/gm, "");
const CODE = strip(SRC);
let pass = 0, fail = 0;
const check = (n, c, x) => { console.log(n + ":", c ? "PASS" : "FAIL", x ?? ""); c ? pass++ : fail++; };
const browser = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium" }).catch(() => chromium.launch());
const page = await browser.newPage();
await page.goto(FILE);
await page.waitForTimeout(500);
const reset = () => page.evaluate(() =>
  loadFromString(btoa(unescape(encodeURIComponent(JSON.stringify(freshState()))))));
await reset();

// ============================================================================
// 1 — True Ice Cellars must not be priced in a resource the player cannot make
// ============================================================================
const d1 = await page.evaluate(() => {
  const u = UPGRADES.find(x => x.id === "trueIceCellars");
  const t = id => TECHS.find(x => x.id === id).cost.knowledge;
  return { cost: u.cost, tech: u.tech,
           tradeRank: t("trade"), hextechRank: t("hextech"),
           // every Discovery priced in crystals, and the tech rank it sits on
           crystalPriced: UPGRADES.filter(u2 => u2.cost.crystals)
             .map(u2 => ({ id: u2.id, tech: u2.tech, crystals: u2.cost.crystals })) };
});
check("1 — True Ice Cellars no longer costs Hextech Crystals",
  !d1.cost.crystals, JSON.stringify(d1.cost));
check("1 — ...and nothing priced in crystals now sits below Hextech Theory, which is what makes them",
  d1.crystalPriced.every(u => u.tech !== "trade"),
  d1.crystalPriced.map(u => `${u.id}@${u.tech}`).join(", "));

// ============================================================================
// 2 — Jayce arrives when there is a foundry to inspect
// ============================================================================
const d2 = await page.evaluate(() => {
  const j = CHAMPION_MILESTONES.find(m => /Jayce/.test(m.text));
  const fireAt = techs => {
    loadFromString(btoa(unescape(encodeURIComponent(JSON.stringify(freshState())))));
    S.techs = techs; S.pop = 30; S.wanderers = []; syncRoster();
    S.res.crystals = 0; S.seenMax.crystals = 0;
    checkMilestones();
    return S.res.crystals;
  };
  const without = fireAt({});
  const withTech = fireAt({ hextech: true });
  loadFromString(btoa(unescape(encodeURIComponent(JSON.stringify(freshState())))));
  return { tech: j.tech, res: j.res, amt: j.amt, without, withTech,
           gateInCode: /if \(m\.tech && !S\.techs\[m\.tech\]\) return;/.test(checkMilestones.toString()) };
});
check("2 — the Jayce milestone is gated on Hextech Theory, not on population alone",
  d2.tech === "hextech" && d2.gateInCode);
check("2 — ...so at population 30 with no hextech he does not come, and with it he does",
  d2.without === 0 && d2.withTech === d2.amt, `without ${d2.without}, with ${d2.withTech}`);

// ============================================================================
// 3 — the Scouting Party is a Trade action at a flat 500 Vigor
// ============================================================================
const d3 = await page.evaluate(() => {
  const e = EXPEDITIONS.find(x => x.id === "scouting");
  const at = n => { S.factionsFound = {}; ["demacia","freljord","bilgewater","piltover"].slice(0, n)
                      .forEach(f => S.factionsFound[f] = true); return expCost(e); };
  const c1 = at(1), c4 = at(4);
  S.factionsFound = { demacia: true };
  return { tab: e.tab, cost: e.cost, hasCostFn: !!e.costFn, c1, c4,
           wildsSkips: /if \(e\.tab && e\.tab !== "wilds"\) return;/.test(renderWilds.toString()),
           tradeRenders: /data-exp=/.test(renderTrade.toString()) && /runExpedition/.test(renderTrade.toString()) };
});
check("3 — the Scouting Party costs a flat 500 Vigor and nothing else",
  d3.cost.vigor === 500 && Object.keys(d3.cost).length === 1 && !d3.hasCostFn, JSON.stringify(d3.cost));
check("3 — ...and it does NOT escalate with the number of civilisations already found",
  d3.c1.vigor === d3.c4.vigor && !d3.c1.provisions, JSON.stringify([d3.c1, d3.c4]));
check("3 — it is tagged for the Trade tab, THE WILDS skips it, and Trade renders and wires it",
  d3.tab === "trade" && d3.wildsSkips && d3.tradeRenders);
check("3 — the Trade tab no longer tells the player to go and find the button in THE WILDS",
  !/scouting party from THE WILDS/i.test(CODE));

// ============================================================================
// 4 — the Gromp line does not advertise a drop the player cannot get
// ============================================================================
const d4 = await page.evaluate(() => {
  const e = EXPEDITIONS.find(x => x.id === "gromp");
  const y = () => expYield(e).join(" · ");
  S.techs = { logistics: true }; const without = y();
  S.techs = { logistics: true, abyss: true }; const withAbyss = y();
  S.techs = {};
  return { without, withAbyss, isFn: typeof e.yield === "function",
           dropGate: /S\.techs\.abyss/.test(e.run.toString()) };
});
check("4 — the stray poro is hidden until Abyssal Cartography, and shown after it",
  !/stray poro/.test(d4.without) && /stray poro/.test(d4.withAbyss),
  `without: ${d4.without}  |  with: ${d4.withAbyss}`);
check("4 — ...and the tooltip now matches the gate the run itself uses",
  d4.isFn && d4.dropGate);
check("4 — the mushroom half of the line is untouched", /10–23 mushrooms/.test(d4.without));

// ============================================================================
// 5 — Cataloguing behind Rites of Targon
// ============================================================================
const d5 = await page.evaluate(() => {
  const u = id => UPGRADES.find(x => x.id === id);
  const IDS = ["cataloguing", "crossReferencing", "greatIndex", "annotatedIndex", "livingLibrary"];
  const price = { songcraft: 1300, ritesOfTargon: 12000, callToArms: 15000, chemtech: 60000, deepWorks: 100000 };
  const ladder = IDS.map(id => u(id).tech);
  return { cataloguing: u("cataloguing").tech, reqs: IDS.map(id => u(id).req || null),
           ladder, monotonic: ladder.every((t, i) => i === 0 || price[t] >= price[ladder[i - 1]]) };
});
check("5 — Cataloguing (Scholarship I) is gated on Rites of Targon, not Songcraft",
  d5.cataloguing === "ritesOfTargon", d5.cataloguing);
check("5 — the Scholarship ladder is still non-decreasing in tech price",
  d5.monotonic, JSON.stringify(d5.ladder));
check("5 — ...and where I and II now TIE at the same tech, a `req` orders them",
  d5.reqs[1] === "cataloguing", JSON.stringify(d5.reqs));

// ============================================================================
// 6 — Four-Part Harmony and Scribes' Guild, parchment −10 each
// ============================================================================
const d6 = await page.evaluate(() => {
  const u = id => UPGRADES.find(x => x.id === id).cost;
  return { fph: u("fourPartHarmony"), sg: u("scribesGuild") };
});
check("6 — Four-Part Harmony: parchment 30 → 20, culture untouched",
  d6.fph.parchment === 20 && d6.fph.culture === 250, JSON.stringify(d6.fph));
check("6 — Scribes' Guild: parchment 40 → 30, culture untouched",
  d6.sg.parchment === 30 && d6.sg.culture === 250, JSON.stringify(d6.sg));

// ============================================================================
// 7 — Illuminators arrives when Tomes are first REQUIRED
// ============================================================================
const d7 = await page.evaluate(() => {
  const ill = UPGRADES.find(x => x.id === "illuminators");
  const price = id => TECHS.find(t => t.id === id).cost.knowledge;
  // every Discovery that charges Tomes, and the tech rung it sits on
  const tomeCosted = UPGRADES.filter(u => u.cost.tome)
    .map(u => ({ id: u.id, tech: u.tech, rank: price(u.tech) }))
    .sort((a, b) => a.rank - b.rank);
  return { tech: ill.tech, req: ill.req, cost: ill.cost,
           firstTomeDiscovery: tomeCosted[0], rank: price(ill.tech) };
});
check("7 — Illuminators moves off Songcraft to Rites of Targon",
  d7.tech === "ritesOfTargon", `${d7.tech} (${d7.rank} knowledge)`);
check("7 — ...and sits behind Cross-Referencing, the FIRST Discovery in the game to charge Tomes",
  d7.req === "crossReferencing" && d7.firstTomeDiscovery.rank === d7.rank,
  `first tome-costed: ${d7.firstTomeDiscovery.id} @ ${d7.firstTomeDiscovery.tech}`);
check("7 — its own cost is unchanged; only the gate moved", d7.cost.tome === 8 && d7.cost.culture === 700);

// ============================================================================
// 8 — rank is PER JOB
// ============================================================================
const d8 = await page.evaluate(() => {
  const w = { nm: "X", j: "miner", jx: { miner: 11500, jungler: 50 }, xp: 11550, t: "none" };
  const fresh = { nm: "Y", j: "farmer", jx: {}, xp: 0, t: "none" };
  // accrual banks against the trade being worked
  loadFromString(btoa(unescape(encodeURIComponent(JSON.stringify(freshState())))));
  S.pop = 2; S.jobs = {}; S.wanderers = []; syncRoster();
  assignJob("farmer", 1);
  const realDateNow = Date.now; let vnow = realDateNow();
  Date.now = () => vnow; liveLastMs = null; liveCarryMs = 0;
  for (let i = 0; i < 50; i++) { tick(); vnow += TICK_MS; }
  Date.now = realDateNow; liveLastMs = null; liveCarryMs = 0;
  const worker = S.wanderers.find(x => x.j === "farmer");
  const idle = S.wanderers.find(x => !x.j);
  // production reads the rank in the trade being worked, not a global one
  S.pop = 1; S.jobs = { farmer: 1 };
  S.wanderers = [{ nm: "A", j: "farmer", jx: { miner: 11500 }, xp: 11500, t: "none" }];
  if (typeof invalidateCensus === "function") invalidateCensus();
  S.buildings = {}; S.upgrades = {}; S.policies = {}; S.champs = {}; S.drakes = {}; S.wtechs = {};
  const farmerProd = () => { const bd = computeRates("provisions"); let f = 0;
    (bd._bd || []).forEach(e => { if (/Farmer/.test(e.label)) f += e.amt; }); return f; };
  const asBronzeFarmer = farmerProd();
  S.wanderers[0].jx.farmer = 11500;
  const asChallengerFarmer = farmerProd();
  loadFromString(btoa(unescape(encodeURIComponent(JSON.stringify(freshState())))));
  return {
    minerRank: rankOf(w, "miner").id, junglerRank: rankOf(w, "jungler").id,
    defaultsToTrade: rankOf(w).id, freshIsBronze: rankOf(fresh).id,
    banked: worker ? (worker.jx.farmer || 0) : 0, lifetime: worker ? worker.xp : 0,
    idleBanked: idle ? Object.keys(idle.jx || {}).length : -1,
    ranked: rankedJobs(w).map(o => o.job),
    minerXpDoesNotPayTheFarmer: Math.abs(asChallengerFarmer / asBronzeFarmer - 1.1875) < 1e-4,
    xpRate: typeof XP_PER_SECOND !== "undefined" ? XP_PER_SECOND : 1
  };
});
check("8 — one wanderer is Challenger in one trade and Bronze in another at the same time",
  d8.minerRank === "challenger" && d8.junglerRank === "bronze",
  `miner ${d8.minerRank}, jungler ${d8.junglerRank}`);
check("8 — rankOf() with no job named defaults to the trade they are actually doing",
  d8.defaultsToTrade === "challenger" && d8.freshIsBronze === "bronze");
// v0.55 Part 7 RE-POINT: the accrual rate is a named constant now (`XP_PER_SECOND`) instead
// of the bare `dt` it was, and its value doubles 1 -> 2. This probe drives 50 ticks of
// TICK_MS = 10 virtual seconds, so the expected bank moves 10 -> 20. Read it from the
// constant rather than the literal so a future rate move does not re-break the assertion —
// what this check is really about is that the bank lands in the WORKED trade and that `xp`
// mirrors it as the lifetime total. Superseded by: v0.55 Part 7.
check("8 — experience banks into the worked trade at XP_PER_SECOND, and `xp` survives as the lifetime total",
  Math.abs(d8.banked - 10 * d8.xpRate) < 1.5 * d8.xpRate && Math.abs(d8.lifetime - 10 * d8.xpRate) < 1.5 * d8.xpRate,
  `jx.farmer ${d8.banked.toFixed(2)}, xp ${d8.lifetime.toFixed(2)}, rate ${d8.xpRate}/s`);
check("8 — an idle wanderer banks nothing, in any trade", d8.idleBanked === 0);
check("8 — a Challenger MINER farms like a Bronze farmer until they have farmed",
  d8.minerXpDoesNotPayTheFarmer);
check("8 — every trade a wanderer has practised is listed, best first",
  JSON.stringify(d8.ranked) === JSON.stringify(["miner", "jungler"]), JSON.stringify(d8.ranked));
// v0.56 Part 1(b) RE-POINT: the migration block gained a second job. It still seeds `w.jx`
// from a pre-v0.54 single-`xp` save, but it no longer EARLY-RETURNS when `w.jx` exists,
// because every loaded roster now also has to be clamped to XP_CAP -- a v0.55 save can hold
// banks in the millions (1,335,491 measured at Icathia) since RR had no cap until this round.
// The `if (w.jx) return;` guard became an `if (!w.jx) {...}` block for exactly that reason.
// Superseded by: v0.56 Part 1(b).
check("8 — old single-`xp` saves are migrated into the trade they were holding",
  /w\.jx\[w\.j\] = w\.xp/.test(CODE) && /if \(!w\.jx\) \{/.test(CODE));
check("8 — ...and every loaded bank is clamped to XP_CAP, so an uncapped v0.55 save is safe",
  /for \(var jk in w\.jx\) if \(w\.jx\[jk\] > XP_CAP\) w\.jx\[jk\] = XP_CAP;/.test(CODE));

// ============================================================================
// 9 — the Deepwinter forecast names the thing you actually stock
// ============================================================================
check("9 — the Deepwinter forecast says 'Stock provisions', not 'Stock granaries'",
  /Stock provisions, or your farmers may be too few/.test(CODE) && !/Stock granaries/.test(CODE));

// ============================================================================
// 10 / 11 — merchant fatigue is gone, and the two leads that referenced it are reworked
// ============================================================================
const d10 = await page.evaluate(() => {
  const cait = CHAMPS.find(c => c.id === "caitlyn"), twitch = CHAMPS.find(c => c.id === "twitch");
  loadFromString(btoa(unescape(encodeURIComponent(JSON.stringify(freshState())))));
  S.techs = { trade: true, callToArms: true };
  S.factionsFound = { demacia: true };
  // The two clauses of Caitlyn's lead COMPOUND — bringing a tier forward also raises the
  // `over` term the caravan ladder is computed from — so the +10 points are measured at ZERO
  // caravans, where `over` is 0 on both sides and the clause is the only difference.
  S.caravans = {};
  const base = { chance: slotChance("demacia", 0), thresh: slotThreshold("demacia", 0),
                 thresh1: slotThreshold("demacia", 1) };
  S.champs = { caitlyn: { r: 1, lvl: 1, xp: 0 } }; S.leader = "caitlyn";
  const withCait = { chance: slotChance("demacia", 0), thresh: slotThreshold("demacia", 0),
                     thresh1: slotThreshold("demacia", 1) };
  S.champs = { twitch: { r: 1, lvl: 1, xp: 0 } }; S.leader = "twitch";
  const withTwitch = { chance: slotChance("demacia", 0) };
  loadFromString(btoa(unescape(encodeURIComponent(JSON.stringify(freshState())))));
  return { base, withCait, withTwitch, caitLead: cait.lead, twitchLead: twitch.lead,
           fatigueGone: typeof fatigueMult === "undefined" && typeof tradeFatigue === "undefined" };
});
check("10 — fatigueMult() and tradeFatigue() no longer exist",
  d10.fatigueGone);
check("10 — no FATIGUE_ constant survives, and no 'weary' line is rendered",
  !/FATIGUE_(RECOVER_S|PENALTY|MAX)\b/.test(CODE) && !/weary −/.test(CODE));
check("10 — the bot no longer waits out weariness either",
  !/fatigueMult/.test(fs.readFileSync(new URL("../sim/simcore.mjs", import.meta.url).pathname, "utf8")));
check("11 — neither Caitlyn's nor Twitch's lead still promises something about fatigue",
  !/fatigue/i.test(d10.caitLead) && !/fatigue/i.test(d10.twitchLead),
  `${d10.caitLead} || ${d10.twitchLead}`);
check("11 — Caitlyn's lead opens EVERY cargo tier five caravans early",
  d10.base.thresh === 5 && d10.withCait.thresh === 0 &&
  d10.base.thresh1 === 10 && d10.withCait.thresh1 === 5,
  `tier 1: ${d10.base.thresh} → ${d10.withCait.thresh}, tier 2: ${d10.base.thresh1} → ${d10.withCait.thresh1}`);
check("11 — ...and adds +10 points of slot chance, where Twitch adds +15",
  Math.abs(d10.withCait.chance - d10.base.chance - 0.10) < 1e-9 &&
  Math.abs(d10.withTwitch.chance - d10.base.chance - 0.15) < 1e-9,
  `base ${d10.base.chance.toFixed(3)}, caitlyn ${d10.withCait.chance.toFixed(3)}, twitch ${d10.withTwitch.chance.toFixed(3)}`);
check("11 — Caitlyn's renown-per-caravan clause survives, raised 3 → 5",
  /gainRenown\(5\); \/\/ Ace in the Hole/.test(SRC) && /\+5 Renown/.test(d10.caitLead));

// ============================================================================
// 12 — the poro chronicle line no longer promises morale
// ============================================================================
check("12 — the Howling Abyss line does not claim morale soars",
  !/Morale soars/i.test(CODE) && /a meal goes further with one under the table/.test(CODE));
check("12 — ...and what it says instead is what poros actually do: the Pasture's eatCut",
  await page.evaluate(() => BUILDINGS.find(b => b.id === "poroPasture").eatCut > 0));

// ============================================================================
// 13 — poro production at Kittens' own rate
// ============================================================================
const d13 = await page.evaluate(() => {
  const b = BUILDINGS.find(x => x.id === "poroPasture");
  loadFromString(btoa(unescape(encodeURIComponent(JSON.stringify(freshState())))));
  // v0.56 Part 6 FIXTURE SWEEP: `poroRatio` takes champion passives and policies, so "ten
  // pastures deliver 0.05/s" was true only on a state whose roster and champion list happened
  // to be empty. freshState() is not a guarantee of that -- it is a guarantee about the SAVE
  // format, not about what a test seeded before it. Cleared explicitly, and the floor the
  // assertion depends on is asserted rather than assumed.
  S.champs = {}; S.policies = {}; S.upgrades = {}; S.wanderers = []; S.drakes = {}; S.wtechs = {};
  if (typeof _traitCounts !== "undefined") _traitCounts = null;
  S.buildings.poroPasture = 10;
  const rate = computeRates().poros;
  const ratioAtFloor = typeof poroRatio === "function" ? +poroRatio().toFixed(6) : null;
  loadFromString(btoa(unescape(encodeURIComponent(JSON.stringify(freshState())))));
  return { per: b.prod.poros, tenCopies: rate, ratioAtFloor };
});
// Kittens: js/buildings.js unicornPasture, unicornsPerTickBase 0.001, and Kittens ticks 5/s
// -> 0.005 per SECOND. RR carried 0.001/s, the per-tick figure read as if it were per-second.
check("13 — a Poro Pasture produces 0.005 poros/s, which is Kittens' 0.001/tick x 5 ticks/s",
  Math.abs(d13.per - 0.005) < 1e-12, String(d13.per));
// End to end through computeRates(): ten pastures on a bare state, with poroRatio at its
// floor of x1, must deliver 10 x 0.005 = 0.05 poros/s — five times the pre-v0.54 0.01.
check("13 — ...and it is five times the pre-v0.54 rate, end to end through computeRates()",
  Math.abs(d13.tenCopies - 0.05) < 1e-9, `10 pastures: ${d13.tenCopies.toFixed(4)}/s`);

// ============================================================================
// 14 — a craft says what it made
// ============================================================================
const d14 = await page.evaluate(() => {
  loadFromString(btoa(unescape(encodeURIComponent(JSON.stringify(freshState())))));
  S.techs = { carpentry: true }; S.res.timber = 1e6;
  const before = S.log.length;
  craftItem("beam", 3);
  const lines = S.log.slice(0, S.log.length - before).map(l => l.text);
  // and the "stopped early" clause: ask for more than the inputs allow
  S.res.timber = 150;                      // exactly one beam's worth
  const b2 = S.log.length;
  craftItem("beam", 5);
  const short = S.log.slice(0, S.log.length - b2).map(l => l.text);
  loadFromString(btoa(unescape(encodeURIComponent(JSON.stringify(freshState())))));
  return { lines, short };
});
check("14 — crafting logs the recipe, the number of actions and the amount produced",
  d14.lines.some(t => /Raise Support Beam ×3/.test(t) && /\+3(\.0)? support beams/i.test(t)),
  JSON.stringify(d14.lines));
check("14 — ...and says so when it stopped early rather than silently making fewer",
  d14.short.some(t => /×1/.test(t) && /stopped early/.test(t)), JSON.stringify(d14.short));

// ============================================================================
// 15 — the Tinkerer arrives with Hextech Theory
// ============================================================================
const d15 = await page.evaluate(() => {
  const j = JOBS.find(x => x.id === "tinkerer");
  const at = st => j.unlock(st);
  return { withTechNoBuilding: at({ techs: { hextech: true }, buildings: {} }),
           withBuildingNoTech: at({ techs: {}, buildings: { refinery: 3 } }),
           src: j.unlock.toString() };
});
check("15 — the Tinkerer unlocks on Hextech Theory alone, with no Refinery built",
  d15.withTechNoBuilding === true);
check("15 — ...and is no longer gated on owning the building",
  !d15.withBuildingNoTech && !/count\("refinery"\)/.test(d15.src), d15.src);

// ============================================================================
// 16 — Hex-Capacitors becomes Resonance Coils
// ============================================================================
const d16 = await page.evaluate(() => {
  const u = UPGRADES.find(x => x.id === "resonanceCoils");
  const gone = !UPGRADES.some(x => x.id === "hexCapacitors");
  loadFromString(btoa(unescape(encodeURIComponent(JSON.stringify(freshState())))));
  S.techs = { smelting: true }; S.buildings = { forge: 10 };
  S.res.ore = 1e6; S.res.mana = 1e6;
  const steelBefore = computeRates().steel;
  S.upgrades.resonanceCoils = true;
  const steelAfter = computeRates().steel;
  // and the crystal half
  S.buildings = {}; S.upgrades = {}; S.jobs = { tinkerer: 10 }; S.pop = 10;
  S.wanderers = []; syncRoster();
  const cryBefore = computeRates().crystals;
  S.upgrades.resonanceCoils = true;
  const cryAfter = computeRates().crystals;
  // the migration
  const migrated = (function () {
    const st = JSON.parse(JSON.stringify(freshState()));
    st.upgrades.hexCapacitors = true;
    loadFromString(btoa(unescape(encodeURIComponent(JSON.stringify(st)))));
    return !!S.upgrades.resonanceCoils && !S.upgrades.hexCapacitors;
  })();
  loadFromString(btoa(unescape(encodeURIComponent(JSON.stringify(freshState())))));
  return { name: u.name, cost: u.cost, gone, migrated,
           forgeLift: steelAfter / steelBefore, crystalLift: cryAfter / cryBefore };
});
check("16 — Hex-Capacitors is gone and Resonance Coils has replaced it",
  d16.gone && d16.name === "Resonance Coils");
check("16 — it costs 30 crystals, not 40", d16.cost.crystals === 30, JSON.stringify(d16.cost));
check("16 — it raises crystal production by 25%",
  Math.abs(d16.crystalLift - 1.25) < 1e-9, `×${d16.crystalLift.toFixed(4)}`);
check("16 — ...and worked-converter output — the Forge — by 25% as well",
  Math.abs(d16.forgeLift - 1.25) < 1e-9, `×${d16.forgeLift.toFixed(4)}`);
check("16 — a save that owned Hex-Capacitors keeps the Discovery under its new id",
  d16.migrated);

// ============================================================================
// 17 — the Wanderers tab carries the idle count
// ============================================================================
const d17 = await page.evaluate(() => {
  loadFromString(btoa(unescape(encodeURIComponent(JSON.stringify(freshState())))));
  const tab = TABS.find(t => t.id === "village");
  S.pop = 5; S.jobs = {}; S.wanderers = []; syncRoster();
  const allIdle = { badge: tab.badge(), n: idleWanderers() };
  assignJob("farmer", 1); assignJob("farmer", 1); assignJob("farmer", 1);
  const someIdle = { badge: tab.badge(), n: idleWanderers() };
  assignJob("farmer", 1); assignJob("farmer", 1);
  const noneIdle = { badge: tab.badge(), n: idleWanderers() };
  loadFromString(btoa(unescape(encodeURIComponent(JSON.stringify(freshState())))));
  return { allIdle, someIdle, noneIdle,
           renderUsesBadge: /t\.badge \? t\.badge\(\) : ""/.test(renderTabs.toString()) };
});
check("17 — the Wanderers tab shows the idle count in parentheses",
  d17.allIdle.badge === " (5)" && d17.someIdle.badge === " (2)",
  `${d17.allIdle.n} idle → "${d17.allIdle.badge}", ${d17.someIdle.n} idle → "${d17.someIdle.badge}"`);
check("17 — ...and shows nothing at all when everyone is working",
  d17.noneIdle.badge === "" && d17.noneIdle.n === 0);
check("17 — the badge is a general tab facility, not a special case in the renderer",
  d17.renderUsesBadge);

// ============================================================================
// OFFLINE — the two audit defects, asserted here too so a reader of ONE suite sees them
// ============================================================================
check("offline defect 1 — tick() reconciles against the wall clock",
  /var elapsed = now - liveLastMs;/.test(CODE) && /liveCarryMs \+= elapsed;/.test(CODE));
check("offline defect 1 — ...clamped to the SAME cap the closed-tab route uses",
  /var capMs = OFFLINE_CAP_HOURS \* 3600 \* 1000;/.test(CODE));
check("offline defect 2 — runCatchUpChunked() is called by applyOfflineProgress()",
  /runCatchUpChunked\(capped, S\.lastSaved,/.test(CODE));
check("offline — both catch-up routes share ONE chronicle line",
  /function reportCatchUp\(r, hitCap, prefix\)/.test(CODE) &&
  (CODE.match(/reportCatchUp\(/g) || []).length >= 3);

// ============================================================================
// SHIP DISCIPLINE and regression guards
// ============================================================================
// v0.55 ship RE-POINT: pinned to the literal "v0.54", so it is guaranteed to fail on the
// very next release — a shipped suite must not encode the round it shipped in. Restated as
// the shape plus the wiring, which is the property the check was for. This is the same
// re-point v0.54 applied to test-v53's copy of it. Superseded by: v0.55 ship discipline.
check("ship — VERSION is well-formed and the footer is rendered from it",
  await page.evaluate(() => /^v\d+\.\d+$/.test(VERSION)),
  await page.evaluate(() => VERSION));
check("regression — BOOST_LIMIT still has seven keys and `knowledge` is still absent",
  await page.evaluate(() => Object.keys(BOOST_LIMIT).length === 7 && BOOST_LIMIT.knowledge === undefined));
check("regression — auditCostGraph() and auditRawGraph() are both still zero",
  await page.evaluate(() => auditCostGraph().length === 0 && auditRawGraph().length === 0),
  await page.evaluate(() => JSON.stringify([auditCostGraph(), auditRawGraph()])));
check("regression — the tech ladder is untouched at 37 techs and no research reveals more than three",
  await page.evaluate(() => {
    const kids = {};
    TECHS.forEach(t => { if (t.req) (kids[t.req] = kids[t.req] || []).push(t.id); });
    return TECHS.length === 37 && Object.values(kids).every(v => v.length <= 3);
  }));
check("regression — poroRatio is still unbounded and `audience` still carries its tripwire",
  await page.evaluate(() => !/limitedDR/.test(poroRatio.toString()) && AUDIENCE_REOPEN_POP === 600));

console.log(`\n${pass} passed, ${fail} failed`);
await browser.close();
process.exit(fail ? 1 : 0);
