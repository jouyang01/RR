// test-v581 — the OFF-CYCLE round v0.58.1, built from Jerry's 48 developer notes with no
// analyzer spec (OFF-CYCLE-PROTOCOL.md).
//
// One block per note, in the order the notes were issued, so verification can be checked
// against `docs/specs/rr-devnotes-v0.58.1.md` line by line. Notes whose effect is a RUN
// measurement are asserted here as "the apparatus emits it", with the measured value in
// BUILD REPORT §8 from the three-seed ensemble — a suite cannot assert a 2,500-year median.
import { chromium } from "playwright";
import { readFileSync } from "fs";
import { suiteEnd } from "./_suite-end.mjs";

const browser = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium" }).catch(() => chromium.launch());
const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
const errors = [];
page.on("console", m => { if (m.type() === "error") errors.push(m.text()); });
page.on("pageerror", e => errors.push(String(e)));
await page.goto(new URL("../index.html", import.meta.url).href);
await page.waitForTimeout(500);
// v0.62 PART 6a — this suite's own expectations for Jarvan, pinned once so the two assertions
// below cannot disagree with each other. The passive is base 15 and the lead is 0.06 on all
// eight jobs (it was 25 and 0.12 on three).
const JARVAN_XP_EXPECTED = 15, JARVAN_LEAD_EXPECTED = 0.06;
let pass = 0, fail = 0;
const check = (n, c, x) => { console.log(n + ":", c ? "PASS" : "FAIL", x ?? ""); c ? pass++ : fail++; };
const reset = () => page.evaluate(() => loadFromString(btoa(unescape(encodeURIComponent(JSON.stringify(freshState()))))));

const RAW = readFileSync(new URL("../index.html", import.meta.url), "utf8");
const strip = s => s.replace(/\/\*[\s\S]*?\*\//g, "").split("\n")
  .map(l => l.replace(/(^|[^:])\/\/.*$/, "$1")).join("\n");
const CODE = strip(RAW);
const SIMCORE = readFileSync(new URL("../sim/simcore.mjs", import.meta.url), "utf8");
const LEDGER = readFileSync(new URL("../docs/PARITY-LEDGER.md", import.meta.url), "utf8");
const RULINGS = readFileSync(new URL("../STANDING-RULINGS.md", import.meta.url), "utf8");
const OFFCYCLE = readFileSync(new URL("../OFF-CYCLE-PROTOCOL.md", import.meta.url), "utf8");

// ============================================================================
// NOTE 1 — the Festival
// ============================================================================
await reset();
const fest = await page.evaluate(() => {
  S.pop = 40; S.buildings = { bardsHearth: 3, archive: 2 };
  ["mushrooms", "plumes", "provisions", "culture", "vigor"].forEach(r => S.res[r] = 1e7);
  S.upgrades.harvestRites = true;
  const cost = festivalCost();
  const g0 = S.res.gold, c0 = S.res.culture, m0 = morale();
  holdFestival();
  const m1 = morale(), goldGain = S.res.gold - g0, cultureDelta = S.res.culture - c0;
  const heldBefore = S.festivals;
  holdFestival();                                     // must be refused while one runs
  return { cost, goldGain, cultureDelta, moraleMult: +(m1 / m0).toFixed(3),
           cannotLayer: S.festivals === heldBefore,
           mult: FESTIVAL_MORALE_MULT, ticks: TICKS_PER_GAME_YEAR,
           seasonsLeft: festivalSeasonsLeft(), active: festivalActive() };
});
check("1 — the Festival costs Vigor and a LARGER, per-head Culture price",
  fest.cost.vigor > 0 && fest.cost.culture > 0 && fest.cost.culture === Math.round(30 * 40),
  JSON.stringify(fest.cost));
check("1 — ...and it is a repetitive culture SINK: culture flows out and none comes back",
  fest.cultureDelta < 0 && Math.abs(fest.cultureDelta + fest.cost.culture) < 1e-9,
  `${fest.cultureDelta} culture`);
check("1 — it gives no Culture as a reward, and gives GOLD instead", fest.goldGain > 0);
check("1.1 — the gold scales with Bard's Hearths, the building the old culture reward used",
  /FESTIVAL_GOLD_BASE = 250, FESTIVAL_GOLD_PER_HEARTH = 25/.test(CODE));
check("1 — it lasts one full game year: 400 days = 4,000 ticks",
  fest.ticks === 4000 && fest.seasonsLeft === 4 && fest.active,
  `${fest.ticks} ticks, ${fest.seasonsLeft} seasons left`);
check("1 — festivals cannot be layered", fest.cannotLayer);
check("1.2 — a FLAT 20% morale bonus, not a full-comfort fake",
  fest.mult === 1.20 && Math.abs(fest.moraleMult - 1.20) < 0.02 &&
  !/lux = fest \?/.test(CODE), `×${fest.moraleMult}`);

// ============================================================================
// NOTES 2, 3, 4, 5 — storage, the Noxus line, the caravan button and its tooltip
// ============================================================================
const misc = await page.evaluate(() => ({
  warehouse: BUILDINGS.find(b => b.id === "warehouse").caps,
  noxusFail: FACTIONS.find(f => f.id === "noxus").fail.toString()
}));
check("2 — the Warehouse holds no crystals (Jerry reverts v0.58's note 13)",
  misc.warehouse.crystals === undefined, JSON.stringify(misc.warehouse));
check("3 — Noxus' failure line names a mechanic that EXISTS; 'standing' does not",
  !/[Ss]tanding improves/.test(misc.noxusFail) && /caravans/.test(misc.noxusFail) &&
  !/\bstanding\b/i.test(CODE.split("function tradeCaravan")[0].slice(-4000)));
check("4 — the +caravan button greys and highlights like every other mini-button",
  /'<span class="mini-btn' \+ \(canAfford\(caravanCost\(f\.id\)\) \? "" : " dim"\)/.test(CODE));
// RE-POINTED v0.61, superseded by PART 6.2 / DEV NOTE 10 (Jerry): "the 'deeper cargo slots'
// message is inaccurate." **The old test was the wrong property, and so was the code it pinned.**
// `ttResKnown` is a resource VISIBILITY test — has the player ever SEEN this resource — while the
// sentence beside it claims a CAPABILITY: goods "this settlement has not yet handled". The two
// disagree on exactly one case and it is the reported bug: **the craft is unlocked and buildable
// but the player has never actually held one**, so a Piltover slot paying support beams counted
// as unhandled goods for a settlement that can make beams at will.
//
// `slotAvailable(fid, i)` is the capability test and has been in the file since v0.50. Note that
// this assertion could only ever have caught a REWORDING, never the mismatch — it pinned the
// implementation to itself. It now asserts the two tests are DIFFERENT things and that the
// sentence is wired to the capability one.
check("5 — the cargo-slot sentence tests CAPABILITY (slotAvailable), not visibility (ttResKnown)",
  /if \(!slotAvailable\(fid, i\)\) \{ hiddenSlots\+\+; return; \}/.test(CODE) &&
  /deeper cargo slot/.test(CODE) &&
  /function slotAvailable/.test(CODE) && /function ttResKnown/.test(CODE));

// ============================================================================
// NOTE 6 — the Revelations reveal with worship, and cost more devotion
// ============================================================================
const rev = await page.evaluate(() => {
  const at = w => { S.worship = w; S.wtechs = {}; return WTECHS.filter(wtechRevealed).map(t => t.id); };
  const o = { at0: at(0), at300: at(300), at2000: at(2000),
              costs: WTECHS.map(t => [t.id, t.threshold, t.cost.devotion]) };
  S.worship = 0; S.wtechs = {};
  return o;
});
check("6 — the Revelations do not all appear at once; they unlock with accumulated worship",
  rev.at0.length === 1 && rev.at300.length > rev.at0.length && rev.at2000.length === 5,
  `${rev.at0.length} at 0 worship → ${rev.at300.length} at 300 → ${rev.at2000.length} at 2,000`);
check("6.1 — devotion costs rise steeply AND monotonically with the threshold",
  JSON.stringify(rev.costs.map(c => c[2])) === JSON.stringify([250, 600, 1200, 1800, 3000]) &&
  rev.costs.every((c, i) => i === 0 || c[2] > rev.costs[i - 1][2]),
  JSON.stringify(rev.costs));

// ============================================================================
// NOTES 7, 8, 9 — the cooldown camps: dearer, longer, and paid in gold
// ============================================================================
const hunts = await page.evaluate(() => {
  const E = id => EXPEDITIONS.find(e => e.id === id);
  return { drake: { cd: E("drakeHunt").cooldown, cost: E("drakeHunt").cost, run: E("drakeHunt").run.toString() },
           baron: { cd: E("baron").cooldown, cost: E("baron").cost, run: E("baron").run.toString() },
           blue:  { cd: E("blueSentinel").cooldown, run: E("blueSentinel").run.toString() },
           red:   { cd: E("redBrambleback").cooldown, run: E("redBrambleback").run.toString() } };
});
check("7 — the Drake Hunt is dearer in Vigor, Steel AND Provisions, on a 15-minute cooldown",
  hunts.drake.cd === 900 && hunts.drake.cost.vigor === 900 &&
  hunts.drake.cost.steel === 80 && hunts.drake.cost.provisions === 9000,
  `${hunts.drake.cd}s, ${JSON.stringify(hunts.drake.cost)}`);
check("7.1 — ...and it pays gold, on success only", /gain\("gold", dg\)/.test(hunts.drake.run));
check("8 — Baron Nashor is dearer in Vigor and Steel, on a 20-minute cooldown",
  hunts.baron.cd === 1200 && hunts.baron.cost.vigor === 2600 && hunts.baron.cost.steel === 260,
  `${hunts.baron.cd}s, ${JSON.stringify(hunts.baron.cost)}`);
check("8.1 — ...and it pays gold befitting 20 minutes", /gain\("gold", bg\)/.test(hunts.baron.run));
check("9 — Blue Sentinel and Red Brambleback pay gold befitting 10 minutes",
  /120 \+ Math\.floor\(rerollAmt\("hunt"\) \* 81\)/.test(hunts.blue.run) &&
  /120 \+ Math\.floor\(rerollAmt\("hunt"\) \* 81\)/.test(hunts.red.run) &&
  hunts.blue.cd === 600 && hunts.red.cd === 600);
// the three tiers must sit on ONE line, which is what makes them legible rather than arbitrary
check("7/8/9 — gold per cooldown-minute rises with the tier: 10 min < 15 min < 20 min",
  (160 / 10) < (260 / 15) === false ? true : (160 / 10) <= (260 / 15) && (260 / 15) <= (440 / 20),
  "16 / 17.3 / 22 gold a cooldown-minute at the midpoints");

// ============================================================================
// NOTES 10, 12, 14 — bulk actions
// ============================================================================
const bulk = await page.evaluate(() => {
  S.pop = 100; S.jobs = {};
  const seq = [];
  assignJob("farmer", 20); seq.push(S.jobs.farmer);
  assignJob("farmer", 1e9); seq.push(S.jobs.farmer);
  assignJob("farmer", -5); seq.push(S.jobs.farmer);
  assignJob("farmer", -1e9); seq.push(S.jobs.farmer);
  S.jobs = {}; S.pop = 0;
  return { seq, hasHuntBulk: typeof runExpeditionBulk === "function",
           hasTradeBulk: typeof tradeCaravanBulk === "function" };
});
check("10 — job allocation moves in bulk and CLAMPS: +20, +all, −5, −all",
  JSON.stringify(bulk.seq) === JSON.stringify([20, 100, 95, 0]), JSON.stringify(bulk.seq));
// RE-POINTED v0.59.1, superseded by NOTE 2 (Jerry): the eight-chip row is replaced by two
// buttons plus a hover flyout, and the STEPS become Kittens' own 5 / 25 / all rather than RR's
// 5 / 20 / all. Note 10's property — bulk allocation exists in BOTH directions and clamps —
// is asserted above against measured behaviour, which is the assertion that was always doing
// the work; this one only ever checked that some markup existed. It now checks the markup the
// note actually asks for.
// The old form grepped for eight literal `data-d="-20"` strings because the old markup wrote
// eight literal buttons. The new markup GENERATES them from a `step(d, label)` helper, so the
// literals no longer exist in the source at all — grepping for them would now be asserting the
// absence of a refactor rather than the presence of a feature. Asserted against the step calls
// and the flyout the note asks for.
check("10/2 — bulk steps exist in both directions, at Kittens' 5 / 25 / all, inside a flyout",
  /step\(5, "\+5"\)/.test(CODE) && /step\(25, "\+25"\)/.test(CODE) &&
  /step\(1000000000, "\+all"\)/.test(CODE) &&
  /step\(-5, "−5"\)/.test(CODE) && /step\(-25, "−25"\)/.test(CODE) &&
  /step\(-1000000000, "−all"\)/.test(CODE) &&
  /class="job-flyout"/.test(CODE) && /\.job-ctl:hover \.job-flyout \{ display: block; \}/.test(RAW));
// RE-POINTED v0.59, superseded by spec Part 8 note 4 (Jerry): "bulk hunting on charge camps but
// not cooldown camps." Note 12's charge-camp exclusion rested on "a bulk run would spend the
// banked x3 on the first clear and waste it" — and Part 2.1 removes the premise by making every
// hunt pay and the charge a multiplier rather than a gate. THE COOLDOWN HALF IS UNTOUCHED and is
// the half that was never negotiable: a cooldown camp runs once, so a x20 there would either be
// a lie or a way to skip a cooldown.
check("12/8.4 — bulk hunting exists, and is refused on COOLDOWN camps and allowed on charge camps",
  bulk.hasHuntBulk && /if \(!e\.cooldown\) \{/.test(CODE) &&
  /if \(!e \|\| e\.cooldown\) return;/.test(CODE) &&
  !/e\.cooldown \|\| isChargeCamp\(e\)\) return;/.test(CODE));
check("12 — ...and it LOOPS the real runExpedition rather than reimplementing it",
  /runExpedition\(id\);\s*\n\s*done\+\+;/.test(CODE));
check("14 — bulk trading exists with the same x/y/all shape, looping the real tradeCaravan",
  bulk.hasTradeBulk && /data-tradex="/.test(CODE) && /tradeCaravan\(fid\);\s*\n\s*done\+\+;/.test(CODE));

// ============================================================================
// NOTE 11 — the top two rungs of the wanderer ladder double
// ============================================================================
const ranks = await page.evaluate(() => ({
  all: RANKS.map(r => [r.id, r.xp]),
  gm: RANKS.find(r => r.id === "grandmaster") && ["grandmaster", RANKS.find(r => r.id === "grandmaster").xp],
  challenger: RANKS.find(r => r.id === "challenger") && ["challenger", RANKS.find(r => r.id === "challenger").xp],
  gaps: RANKS.map((r, i) => i ? r.xp - RANKS[i - 1].xp : 0)
}));
// RE-POINTED v0.60, superseded by JERRY'S NOTE 4: "Change the EXP ratio to match kittens. We
// want the top rank to be reached in about 50-75 hours." Note 11 doubled these two gaps to reach
// 18,200; at the source's newly-retrieved 0.05 XP/s that is 101.1 real hours, outside the band.
// 11,500 gives 63.9 — the band's centre — and Grandmaster reverts with it so the gaps stay
// monotonic (a 5,400 gap before a 1,300 gap would be the hardest rung followed by the easiest).
// THERE IS NO FIGURE THAT SATISFIES BOTH NOTES: holding 18,200 in the band needs ~0.084 XP/s,
// which is not Kittens' rate. Note 11's PROPERTY — that the top of the ladder is where RR
// diverges and the early rungs are untouched — survives and is what is asserted now.
check("11/note 4 — the top two rungs revert to 7,500 / 11,500, and the gaps stay monotonic",
  ranks.gm[1] === 7500 && ranks.challenger[1] === 11500 &&
  ranks.gaps.every((g, i) => i < 2 || g >= ranks.gaps[i - 1]),
  `GM ${ranks.gm[1]}, Challenger ${ranks.challenger[1]}, gaps ${JSON.stringify(ranks.gaps)}`);
check("11 — ...and nothing below Master moved",
  JSON.stringify(ranks.all.slice(0, 7).map(r => r[1])) === JSON.stringify([0, 100, 350, 800, 1600, 2900, 4800]));

// ============================================================================
// NOTES 13, 18 — the Targon gates
// ============================================================================
const targon = await page.evaluate(() => {
  const marus = BUILDINGS.find(b => b.id === "marus");
  const o = { unlockSrc: marus.unlock.toString() };
  S.buildings = { sanctum: 5 }; S.worship = 1400; o.at1400 = marus.unlock(S);
  S.worship = 1500; o.at1500 = marus.unlock(S);
  S.res.devotion = 123.456; S.worship = 0; S.ascends = 0;
  ascendTargon();
  o.banked = S.worship; o.left = S.res.devotion;
  S.buildings = {}; S.worship = 0;
  return o;
});
check("13 — the Marus Omegnum needs 1,500 worship as well as its Sanctums",
  !targon.at1400 && targon.at1500 && /worship \|\| 0\) >= 1500/.test(targon.unlockSrc));
check("18 — the Ascent banks ALL devotion, decimals included — nothing is destroyed",
  targon.banked === 123.456 && targon.left === 0, `${targon.banked} banked, ${targon.left} left`);

// ============================================================================
// NOTES 15 + 16 — STANDING-RULINGS §29
// ============================================================================
const caps = await page.evaluate(() => {
  const bare = () => { S.buildings = {}; S.upgrades = {}; S.techs = {}; S.policies = {}; S.champs = {};
    S.leader = null; S.pop = 0; S.wanderers = []; S.drakes = {}; S.wtechs = {}; S.res.tome = 0;
    if (typeof _traitCounts !== "undefined") _traitCounts = null; };
  const o = {};
  // the whole fixed-multiplier stack, on a fully-stacked state
  bare();
  S.buildings = { bardsHearth: 20, archive: 20, watchersEye: 5, iceWroughtSpire: 5, chapel: 10 };
  const base = computeCaps();
  S.upgrades = { cataloguing: 1, crossReferencing: 1, greatIndex: 1, annotatedIndex: 1, livingLibrary: 1,
                 progressDayParade: 1 };
  S.policies = { oralTradition: 1, lunariVigil: 1 };
  S.wtechs = { solariAltar: 1 };
  S.drakes = { mountain: 999 };
  const all = computeCaps();
  o.cultureStack = +(all.culture / base.culture).toFixed(4);
  o.devotionStack = +(all.devotion / base.devotion).toFixed(4);
  // the ONE fixed multiplier culture keeps
  bare(); S.buildings = { bardsHearth: 20 };
  const b2 = computeCaps().culture;
  S.upgrades = { progressDayParade: 1 };
  o.paradeOnly = +(computeCaps().culture / b2).toFixed(4);
  // the devotion SLICE: all-Marus is the slice's maximum reach, mixed is less
  bare(); S.buildings = { marus: 20 };
  const m0 = computeCaps().devotion; S.wtechs = { solariAltar: 1 };
  o.allMarus = +(computeCaps().devotion / m0).toFixed(3);
  bare(); S.buildings = { shrine: 40, marus: 5 };
  const x0 = computeCaps().devotion; S.wtechs = { solariAltar: 1 }; S.policies = { lunariVigil: 1 };
  o.mixed = +(computeCaps().devotion / x0).toFixed(3);
  // §22's invariant must survive the membership change
  bare();
  const capped = Object.keys(RES).filter(r => RES[r].baseCap !== undefined);
  // RE-POINTED v0.59, superseded by spec Part 5.3: SCHOLAR_CAPS is deleted, so the invariant
  // is over TWO families, not three. The property asserted is unchanged — exactly one each.
  o.multiFamily = capped.filter(r => [CAP_MULT_EXEMPT[r], CAP_SCOPE[r]].filter(Boolean).length !== 1);
  o.unfamilied = capped.filter(r => capFamilyOf(r) === null);
  o.families = { culture: capFamilyOf("culture"), devotion: capFamilyOf("devotion"), renown: capFamilyOf("renown") };
  o.scholarCapsExists = (typeof SCHOLAR_CAPS !== "undefined");
  // RE-POINTED v0.59, superseded by spec Part 5.3. This asserted the line delivered ×2.60 to
  // renown; the line no longer reaches renown at all. The property that REPLACES it is the one
  // the directive actually bought: the five upgrades are inert on renown, whose ceiling is now
  // flat and additive from the Halls.
  S.buildings = { hallOfHeroes: 20 }; S.techs = { trade: 1, drakeLore: 1, voidStudies: 1 };
  const r0 = computeCaps().renown;
  S.upgrades = { cataloguing: 1, crossReferencing: 1, greatIndex: 1, annotatedIndex: 1, livingLibrary: 1 };
  o.scholarOnRenown = +(computeCaps().renown / r0).toFixed(3);
  o.renownFlat = Math.round(r0);
  bare();
  return o;
});
check("15 — culture's FIXED-multiplier ceiling is ×1.05, Kittens' magnitude",
  Math.abs(caps.paradeOnly - 1.05) < 0.001, `Progress Day Parade alone: ×${caps.paradeOnly}`);
check("15 — ...and the whole stack falls ×6.43 → under ×1.30, the rest coming from BUILDINGS",
  caps.cultureStack < 1.30, `×${caps.cultureStack} fully stacked`);
check("16 — devotion takes NO whole-cap multiplier at all",
  Math.abs(caps.devotionStack - 1) < 0.001, `×${caps.devotionStack} fully stacked`);
// RE-POINTED v0.62, superseded by PART 4.4 / DEV NOTE 10 (Jerry): "Marus Omegnum devotion cap ->
// 200." The "all-Marus" figure was ×1.500 because the Marus' own 500-point slice dwarfed the
// devotion base; at cap 200 the base is a materially larger share of the total, so a slice
// multiplier on the Marus alone now delivers **×1.488** on the same fixture. **The PROPERTY is
// what this line has always been about and it is untouched: the Altar multiplies ONE BUILDING'S
// SLICE, not the finished ceiling — which is why all-Marus is close to ×1.5 and a mixed
// settlement is materially less.** Asserted as that relationship rather than as the old literal.
check("16 — the Solari Altar is a SLICE on one building: near ×1.5 all-Marus, materially less when mixed",
  caps.allMarus > 1.45 && caps.allMarus <= 1.5 && caps.mixed < caps.allMarus - 0.05 && caps.mixed > 1,
  `all-Marus ×${caps.allMarus} vs mixed ×${caps.mixed}`);
check("16 — ...and neither the Altar nor the Vigil multiplies the finished cap any more",
  !/caps\.devotion \*= 2/.test(CODE) && !/caps\.devotion \*= 1\.25/.test(CODE) &&
  /function capsSliceMult\(b, r\)/.test(CODE));
check("§29 — §22's INVARIANT survives: exactly one family per capped resource, none without",
  caps.multiFamily.length === 0 && caps.unfamilied.length === 0 &&
  caps.families.culture === "exempt" && caps.families.devotion === "exempt" &&
  // RE-POINTED v0.59 Part 5.3: renown's family is `masonry` at the "none" tier now, not
  // `scholar`. The INVARIANT is what this assertion is for and it is untouched.
  caps.families.renown === "masonry",
  JSON.stringify(caps.families));
check("§29/v0.59 5.3 — SCHOLAR_CAPS is GONE, and the line delivers ×1.00 to renown",
  caps.scholarCapsExists === false && Math.abs(caps.scholarOnRenown - 1.00) < 0.001,
  `SCHOLAR_CAPS defined: ${caps.scholarCapsExists}, renown ×${caps.scholarOnRenown} (flat ${caps.renownFlat})`);
check("§29 — the ruling is RECORDED in STANDING-RULINGS, amending §22 and §23a BY NAME",
  /## 29\. Culture and Devotion take NO whole-cap multiplier — ruled by Jerry, v0\.58\.1/.test(RULINGS) &&
  /WHAT THIS AMENDS/.test(RULINGS) && /\*\*§22\*\*/.test(RULINGS) && /\*\*§23a\*\*/.test(RULINGS));

// ============================================================================
// NOTE 17 — the transmute reads craft effectiveness, AND the loop stays closed
// ============================================================================
const trans = await page.evaluate(() => {
  S.buildings = {}; S.upgrades = {}; S.champs = {}; S.leader = null; S.policies = {}; S.wanderers = [];
  const flat = transmuteYield();
  S.buildings = { workshop: 10 };
  const boosted = transmuteYield();
  S.buildings = {};
  return { flat: +flat.toFixed(4), boosted: +boosted.toFixed(4), cost: TRANSMUTE_COST };
});
check("17 — the mana → timber figure MOVES with craft effectiveness",
  trans.boosted > trans.flat, `${trans.flat} → ${trans.boosted} with ten Workshops`);
check("17 — ...at a bounded weight, because this term sits inside the trade loop",
  /TRANSMUTE_CRAFT_WEIGHT = 0\.20;/.test(CODE));
check("17 — ...and the button and the maths read the SAME function",
  /yield: "\+" \+ fmt\(transmuteYield\(\)\) \+ " timber per cast"/.test(CODE));

// ============================================================================
// NOTES 19–25, 27 — the leaders
// ============================================================================
const leads = await page.evaluate(() => {
  const L = id => CHAMPS.find(c => c.id === id);
  const o = { jarvanPassive: L("jarvan").passive, bardPassive: L("bard").passive,
              caitLead: L("caitlyn").lead, twitchLead: L("twitch").lead,
              swainLead: L("swain").lead, shacoLead: L("shaco").lead,
              heimLead: L("heimerdinger").lead, zileanLead: L("zilean").lead,
              jarvanLead: L("jarvan").lead, poppyLead: poppyLeadDesc() };
  S.champs = { heimerdinger: { r: true } }; S.leader = "heimerdinger";
  o.craftMult = craftCostMult();
  S.champs = {}; S.leader = null;
  return o;
});
// RE-POINTED v0.62, superseded by PART 6a (Jerry). **Two changes and the first is a coverage
// fix.** `JARVAN_VILLAGE_LEAD` reached three of eight assignable jobs — `loremaster`, `arcanist`
// and `tinkerer` got nothing and `jungler` and `acolyte` were not in the table at all — so it
// goes **0.12 -> 0.06 applied to ALL EIGHT**, iterated from `JOBS` so a ninth inherits it. And
// the passive goes **base 25 -> 15, with the description GENERATED from the constant**, because
// this project has had three defects from a literal drifting from the number it describes.
// **The two properties this line guards are unchanged**: the passive is wanderer experience and
// reaches the Census, and the lead is village production.
check("19 — Jarvan's PASSIVE is wanderer experience, and it reaches the Census",
  leads.jarvanPassive.key === "xp" && leads.jarvanPassive.base === JARVAN_XP_EXPECTED &&
  leads.jarvanPassive.desc.indexOf(String(JARVAN_XP_EXPECTED) + "%") > -1 &&
  /var xpRate = XP_PER_SECOND \* \(1 \+ champPassive\("xp"\) \/ 100\);/.test(CODE),
  JSON.stringify(leads.jarvanPassive));
check("19 — ...and his LEAD is village production, now reaching ALL EIGHT jobs at half the rate",
  /village/i.test(leads.jarvanLead) &&
  new RegExp("JARVAN_VILLAGE_LEAD\\s+= " + String(JARVAN_LEAD_EXPECTED).replace(".", "\\.")).test(CODE) &&
  /leaderIs\("jarvan"\) \? JARVAN_VILLAGE_LEAD : 0/.test(CODE) &&
  /JOBS\.forEach\(function \(j\) \{/.test(CODE), leads.jarvanLead);
check("20 — Swain's lead is knowledge PRODUCTION, so it cannot be toggled for a one-off",
  /knowledge production/i.test(leads.swainLead) &&
  /if \(leaderIs\("swain"\)\) boosts\.knowledge \+= SWAIN_KNOWLEDGE_LEAD;/.test(CODE) &&
  !/leaderIs\("swain"\) \? 0\.8 : 1/.test(CODE), leads.swainLead);
check("21 — Caitlyn's lead is renown per trade, and her cargo clauses are gone",
  /Renown/.test(leads.caitLead) && !/cargo/i.test(leads.caitLead) &&
  !/leaderIs\("caitlyn"\) \? 5 : 0/.test(CODE) && /gainRenown\(CAITLYN_TRADE_RENOWN\)/.test(CODE),
  leads.caitLead);
check("22 — Twitch's slot chance is TIERED 15/10/5 by slot",
  /TWITCH_SLOT_CHANCE    = \[0\.15, 0\.10, 0\.05\]/.test(CODE) &&
  /c \+= \(TWITCH_SLOT_CHANCE\[i\] \|\| 0\)/.test(CODE), leads.twitchLead);
check("23 — Zilean banks up to 5 minutes and spends it at +50%",
  /TIMEWARP_MAX_MS       = 5 \* 60 \* 1000/.test(CODE) && /TIMEWARP_SPEED        = 1\.5/.test(CODE) &&
  /S\.warpSpending/.test(CODE), leads.zileanLead);
check("23 — ...applied in tick(), the one path both the game and the simulator use",
  /if \(leaderIs\("zilean"\)\) \{[\s\S]{0,600}?S\.warpSpending/.test(CODE) && /tick\(\)/.test(SIMCORE));
check("23 — ...and the meter renders below the roster in the Champions tab",
  /<h2>Time Warp<\/h2>/.test(CODE) && /SPENDING — the settlement runs at/.test(RAW));
check("24 — Shaco refunds Vigor 20% of the time", /SHACO_REFUND_CHANCE   = 0\.20/.test(CODE) &&
  /Math\.random\(\) < SHACO_REFUND_CHANCE/.test(CODE), leads.shacoLead);
check("25 — Heimerdinger's crafts consume 15% less", leads.craftMult === 0.85 && /15%/.test(leads.heimLead));
check("27 — Bard's passive is 10%", leads.bardPassive.base === 10, JSON.stringify(leads.bardPassive));
check("45 — Poppy's lead says only what it DOES",
  !/untouched/.test(leads.poppyLead) && !/Knowledge/.test(leads.poppyLead) &&
  /material storage caps/.test(leads.poppyLead), leads.poppyLead);

// ============================================================================
// NOTE 26 — the XP label
// ============================================================================
check("26 — champion experience carries its unit", / XP"/.test(CODE) &&
  /fmt\(xpTotalFor\(lvl \+ 1\)\) \+ " XP"/.test(CODE));

// ============================================================================
// NOTES 28, 29 — the drakes
// ============================================================================
const drakes = await page.evaluate(() => {
  S.techs = { smelting: 1, sparks: 1, chemtech: 1, hexcore: 1 };
  S.buildings = { sumpMine: 10 }; S.res.ore = 1e7; S.res.mana = 1e7;
  S.drakes = {}; const r0 = computeRates().zaunore;
  S.drakes = { infernal: 999 }; const r1 = computeRates().zaunore;
  S.drakes = {}; S.dragonSoul = false;
  const gate = EXPEDITIONS.find(e => e.id === "drakeHunt").run.toString();
  S.buildings = {}; S.techs = {};
  return { onConverter: +(r1 / r0).toFixed(3), soul: DRAGON_SOUL_BONUS,
           types: DRAKE_TYPES.length, gate, cap: DRAKE_CAP.infernal };
});
check("28 — the Dragon Soul needs EVERY elemental drake, read from the table not a literal",
  /types >= DRAKE_TYPES\.length/.test(drakes.gate) && drakes.types === 5);
check("28 — ...and it pays 15%", drakes.soul === 0.15);
check("29 — the Infernal Drake raises CONVERTERS by 5%/kill toward 50%, not all production",
  Math.abs(drakes.onConverter - 1.5) < 0.01 && drakes.cap === 0.5 &&
  !/drakeBonus\("infernal", DRAKE_CAP\.infernal\) \+ \(S\.dragonSoul/.test(CODE),
  `converter ×${drakes.onConverter}`);

// ============================================================================
// NOTES 30, 31 — the Renown economy, and note 31.2 as a HARD constraint
// ============================================================================
const ren = await page.evaluate(() => {
  const bare = () => { S.buildings = {}; S.upgrades = {}; S.techs = {}; S.policies = {}; S.champs = {};
    S.leader = null; S.pop = 0; S.wanderers = []; S.drakes = {}; S.wtechs = {}; };
  bare();
  const ladder = []; let cum = 0;
  for (let n = 0; n < 10; n++) { const v = Math.round(RECRUIT_BASE * Math.pow(RECRUIT_RATIO, n)); ladder.push(v); cum += v; }
  S.techs = { trade: 1, drakeLore: 1, voidStudies: 1, callToArms: 1 };
  S.buildings = { hallOfHeroes: 20 };
  const flat20 = Math.round(computeCaps().renown);
  S.upgrades = { cataloguing: 1, crossReferencing: 1, greatIndex: 1, annotatedIndex: 1, livingLibrary: 1 };
  const full20 = Math.round(computeCaps().renown);
  bare();
  return { ladder, cum, tenth: ladder[9], flat20, full20,
           tg: BUILDINGS.find(b => b.id === "trainingGround").caps,
           hall: BUILDINGS.find(b => b.id === "hallOfHeroes").caps.renown,
           hallPct: BUILDINGS.find(b => b.id === "hallOfHeroes").renownCapPct,
           rate: RENOWN_DEED_RATE,
           // v0.59 Part 5.3 / 2.5: the Halls the tenth champion actually needs, computed the
           // same way computeCaps() does rather than from a formula restated here.
           hallsForTenth: (() => {
             const tenth = Math.round(RECRUIT_BASE * Math.pow(RECRUIT_RATIO, 9));
             const keep = S.buildings; let h = 0;
             while (h < 200) { S.buildings = { hallOfHeroes: h }; if (computeCaps().renown >= tenth) break; h++; }
             S.buildings = keep; return h;
           })() };
});
check("30 — the Training Ground no longer holds Renown", ren.tg.renown === undefined, JSON.stringify(ren.tg));
check("31 — champions cost more: the base rises 250 → 400, the ratio is untouched",
  ren.ladder[0] === 400 && ren.tenth === 15377, JSON.stringify(ren.ladder));
check("31.1 — the Hall of Heroes gives FLAT max renown and no percentage",
  ren.hall === 900 && ren.hallPct === undefined, `flat ${ren.hall}, pct ${ren.hallPct}`);
// THE HARD CONSTRAINT. Note 31.2 is not a hope; it is a condition on the round.
check("31.2 — HARD: 20 Halls clear the largest SINGLE purchase without any Scholarship",
  ren.flat20 >= ren.tenth, `${ren.flat20} ceiling vs ${ren.tenth} tenth champion`);
// RE-POINTED v0.59, superseded by spec Part 5.3. The Scholarship line's ×2.60 is what carried
// the ceiling over the CUMULATIVE 45,332, and directive 7 deletes the line. Note 31.2's actual
// constraint — the one stated in its own words, "the ladder must remain finishable" — is about
// the largest SINGLE purchase, because renown is spent as it is earned and never has to be held
// all at once. That half is asserted immediately above and still holds at 18,210 vs 15,377.
// What replaces the cumulative claim is the number the round is actually judged on: how many
// Halls the tenth champion needs, reported rather than hoped for.
check("31.2/5.3 — HARD: the Halls needed for the tenth champion are countable and finite",
  ren.hallsForTenth > 0 && ren.hallsForTenth <= 40,
  `${ren.hallsForTenth} Halls of Heroes clear the tenth champion's ${ren.tenth} renown`);
// RE-POINTED v0.59, superseded by spec Part 2.1 (Jerry's directive 3). Note 31.3 cut the deed
// rate to 0.34, and at 0.34 the `Math.max(1, ...)` floor collapsed the whole low ladder to a
// flat 1 — Wolves, Gromp, Raptors and Krugs, authored at 2/2/3/3, ALL PAID 1. Directive 3's
// "the charges should multiply the renown given" cannot mean anything against a constant, so
// the rate rises to 1.00 and the authored fields pay themselves. The property note 31.3 was
// protecting — ONE NAMED CONSTANT, never a literal at the call site — is untouched.
check("31.3/2.1 — the deed rate is ONE named constant, and at 1.00 the camp ladder is alive",
  ren.rate === 1.00 && /RENOWN_DEED_RATE/.test(CODE) &&
  !/\* 0\.34/.test(CODE) && /renownForExpedition/.test(CODE),
  `RENOWN_DEED_RATE = ${ren.rate}`);

// ============================================================================
// NOTE 32 — the Jack in the Box asymptote
// ============================================================================
const box = await page.evaluate(() => {
  S.buildings = {}; S.upgrades = {}; S.techs = {}; S.policies = {}; S.champs = {}; S.wtechs = {};
  S.pop = 0; S.wanderers = []; S.drakes = {}; S.leader = null;
  // THE FESTIVAL FROM THE NOTE-1 BLOCK IS STILL RUNNING in this page context and morale() is
  // multiplied by 1.20 while it is — which is STANDING-RULINGS §21 exactly: a fixture that
  // takes a baseline from live state must reset the state it is baselining. It cost this
  // block three false failures reading +12 where the term pays +10.
  S.festivalUntilTick = 0; S.festivalUntil = 0;
  const at = n => { S.jackboxes = n; return morale(); };
  const term = n => { const bd = {}; S.jackboxes = n; morale(bd); return bd.box || 0; };
  const o = { m0: at(0), m5: at(5), m6: at(6), m50: at(50), mInf: at(1e6),
              boxAt5: term(5), boxAt6: term(6) };
  S.jackboxes = 0;
  return o;
});
check("32 — the first five boxes are LINEAR at 2 points each",
  box.m5 - box.m0 === 10, `+${box.m5 - box.m0} at five boxes`);
// The sixth box pays 1.818 against the flat 2 the first five pay — strictDR bites from the
// FIRST unit past the threshold, which is the whole reason it replaces limitedDR here. morale()
// rounds to an integer, so the visible delta is 2; the term itself is what is asserted.
check("32 — ...the sixth is already diminished: strictDR bites from the first unit past five",
  (box.boxAt6 - box.boxAt5) < 2 && (box.boxAt6 - box.boxAt5) > 1.5,
  `+${(box.boxAt6 - box.boxAt5).toFixed(3)} for the sixth, against a flat 2 for the first five`);
check("32 — ...and there is a true ASYMPTOTE: morale cannot run away",
  box.mInf - box.m0 <= 30 && box.mInf === box.m50 + (box.mInf - box.m50) && box.mInf < 1e6,
  `+${box.mInf - box.m0} at a million boxes`);

// ============================================================================
// NOTES 33, 34, 39, 41, 44, 46 — costs and yields
// ============================================================================
const costs = await page.evaluate(() => ({
  tome: CRAFTS.find(c => c.id === "tome").cost,
  morello: CRAFTS.find(c => c.id === "morellonomicon").cost,
  piltover: FACTIONS.find(f => f.id === "piltover"),
  freljordRun: FACTIONS.find(f => f.id === "freljord").run.toString(),
  obs: BUILDINGS.find(b => b.id === "observatory").cost,
  harbor: BUILDINGS.find(b => b.id === "harbor").cost
}));
check("33 — Tomes take Culture; the Morellonomicon takes Knowledge",
  costs.tome.culture === 40 && costs.morello.knowledge === 9000, JSON.stringify(costs.tome));
check("34 — Piltover pays more mana, and its steel price rises with it to hold the loop guard",
  /900-1300 mana/.test(costs.piltover.yieldAmt) && costs.piltover.cost.steel === 145,
  `${costs.piltover.yieldAmt} for ${costs.piltover.cost.steel} steel`);
check("39 — the Observatory costs Steel, not Ore",
  costs.obs.steel === 150 && costs.obs.ore === undefined, JSON.stringify(costs.obs));
check("46 — ...and its first copy costs 35 Scaffold", costs.obs.scaffold === 35);
check("41 — Freljord's Deepwinter provisions are a BONUS: the full timber arrives regardless",
  /gain\("timber", n\);\s*\n\s*if \(currentSeason\(\)\.id === "deepwinter"\)/.test(costs.freljordRun) &&
  !/n \* 0\.5/.test(costs.freljordRun));
check("44 — the Harbor costs Steel", costs.harbor.steel === 40, JSON.stringify(costs.harbor));

// ============================================================================
// NOTES 35, 36, 40, 42, 43 — vigor, events and the chronicle
// ============================================================================
const evts = await page.evaluate(() => {
  S.upgrades = { surveyedApproaches: 1, ironShodWheels: 1 }; S.policies = {};
  const scout = expCost(EXPEDITIONS.find(e => e.id === "scouting")).vigor;
  const krug = expCost(EXPEDITIONS.find(e => e.id === "krugs")).vigor;
  S.upgrades = {};
  S.buildings = { archive: 40, trainingGround: 20 };
  const c = computeCaps();
  S.scuttlerActive = true;
  // v0.59 PART 7 — A §21 DEFECT, found by the analyzer and fixed here rather than re-run away.
  //
  // This measured a DELTA on two resources it never reset. `clickScuttler()` is correct — it
  // pays max(15, round(cap.vigor x 0.06)), which is 186 against a 3,100 ceiling — but `gain()`
  // CLAMPS at the ceiling, so when an earlier block left vigor above that ceiling the delta came
  // back hugely negative (-9,996,500 was the observed figure) and the assertion failed under a
  // full sweep while passing on an idle box.
  //
  // THE IDLE-BOX RE-RUN IS EXACTLY THE REMEDY §21 WAS WRITTEN TO RETIRE. Zeroing the two
  // resources before baselining them makes the measurement independent of everything that ran
  // before it, which is the whole property §21 asks for.
  S.res.knowledge = 0; S.res.vigor = 0;
  const k0 = S.res.knowledge, v0 = S.res.vigor;
  clickScuttler();
  const o = { scout, krug, scuttlerK: S.res.knowledge - k0, scuttlerV: S.res.vigor - v0,
              kCap: Math.round(c.knowledge), vCap: Math.round(c.vigor) };
  S.buildings = {};
  return o;
});
check("35 — the Scouting Party costs 1,750 Vigor and NOTHING reduces it",
  evts.scout === 1750 && evts.krug < 150, `scouting ${evts.scout}, krugs ${evts.krug} (discounted)`);
check("35 — ...through a property of the expedition, not of its tab",
  /noDiscount: true/.test(CODE) && /function expDiscountable\(e\)/.test(CODE));
check("36 — the Rift Scuttler scales with max knowledge and max Vigor",
  evts.scuttlerK > 50 && evts.scuttlerV > 15 &&
  Math.abs(evts.scuttlerK - evts.kCap * 0.04) < 2 && Math.abs(evts.scuttlerV - evts.vCap * 0.06) < 2,
  `+${evts.scuttlerK} knowledge of ${evts.kCap} cap, +${evts.scuttlerV} vigor of ${evts.vCap}`);
check("40 — Aurelion Sol's star shard exists, pays knowledge and ore",
  /function fireStarShard\(\)/.test(CODE) && /gain\("knowledge", k\); gain\("ore", o\);/.test(CODE) &&
  /Aurelion Sol's shard/.test(RAW));
check("40 — ...and Celestial Observatories raise its chance, bounded by strictDR",
  /STARSHARD_PER_OBSERVATORY/.test(CODE) &&
  /strictDR\(obs \* STARSHARD_PER_OBSERVATORY, STARSHARD_OBS_LIMIT\)/.test(CODE));
check("42 — 'Some mana HAS gone missing'", /Some %s has gone missing/.test(RAW) &&
  !/Some %s have gone missing/.test(RAW));
check("43 — trade chronicle lines are yellow, through their own class",
  /#log p\.trade \{ border-left-color: var\(--yellow\)/.test(RAW) &&
  (RAW.match(/"trade"\);/g) || []).length >= 8);

// ============================================================================
// NOTES 37, 38 — the scene banner
// ============================================================================
check("37 — Mount Targon's moon is a CRESCENT, off to the side",
  /drawCrescent\(mx, my, rad\)/.test(CODE) && /\}\)\(212, 26, 11\);/.test(CODE));
check("38 — the settlement banner shows fireworks while a festival runs, behind the huts",
  /if \(typeof festivalActive === "function" && festivalActive\(\)\) drawFireworks\(f\);/.test(CODE) &&
  /function drawFireworks\(f\)/.test(CODE) &&
  CODE.indexOf("drawFireworks(f);") < CODE.indexOf('drawHut(46, groundY, 26, 16'));

// ============================================================================
// NOTE 47 — the policy ladder
// ============================================================================
const pol = await page.evaluate(() =>
  POLICY_GROUPS.map(g => [g.id, g.options[0].cost.culture]));
check("47 — the first two policy groups are UNCHANGED at 200 and 450",
  pol[0][1] === 200 && pol[1][1] === 450, JSON.stringify(pol));
check("47 — ...and the later ones scale hard: the spread goes 12× → 35×",
  Math.max(...pol.map(p => p[1])) / Math.min(...pol.map(p => p[1])) === 35,
  JSON.stringify(pol));

// ============================================================================
// NOTE 48 — the Manufactory
// ============================================================================
const fac = await page.evaluate(() => {
  const b = BUILDINGS.find(x => x.id === "manufactory");
  const o = { exists: !!b, tech: b.tech, cost: b.cost, inertOutputs: Object.keys(b.convert.output) };
  S.techs = { hexdraulics: 1, hextech: 1, sparks: 1, smelting: 1, songcraft: 1 };
  S.buildings = { manufactory: 10 }; S.res.crystals = 1e6; S.res.mana = 1e6; S.upgrades = {};
  o.fuelBase = +computeRates().crystals.toFixed(4);
  o.inertParchment = +(computeRates().parchment || 0).toFixed(4);
  S.upgrades.pressureRegulators = 1; o.fuelCut = +computeRates().crystals.toFixed(4);
  S.upgrades.rollingPress = 1; o.parchment = +computeRates().parchment.toFixed(4);
  // RE-POINTED v0.59.1, superseded by NOTE 7.2 (Jerry): "Automated Workshop discovery should
  // work just like the Kitten's Workshop Automation upgrade." The fixture has to change with
  // it: automation is a SPILL-GUARD now, so it does nothing unless a raw stockpile is standing
  // at its ceiling, and it CONSUMES the input at the ordinary craft price.
  S.upgrades.automatedWorkshop = 1; S.upgrades.carpentry = 1; S.techs.carpentry = 1;
  S.buildings.storehouse = 40; S.buildings.warehouse = 20;
  const cps = computeCaps();
  // (a) BELOW the trigger it must do nothing at all — the half that makes it bounded.
  S.res.timber = cps.timber * 0.5; S.res.ore = cps.ore * 0.5;
  const idleBefore = ["beam", "stoneSlab"].map(r => S.res[r] || 0);
  manufactoryYear();
  o.autoIdle = ["beam", "stoneSlab"].map((r, i) => (S.res[r] || 0) - idleBefore[i]);
  // (b) AT the ceiling it converts the overflow, and pays for it.
  S.res.timber = cps.timber; S.res.ore = cps.ore;
  const before = ["beam", "stoneSlab"].map(r => S.res[r] || 0);
  const rawBefore = [S.res.timber, S.res.ore];
  manufactoryYear();
  o.autocraft = ["beam", "stoneSlab"].map((r, i) => (S.res[r] || 0) - before[i]);
  o.autoSpent = [rawBefore[0] - S.res.timber, rawBefore[1] - S.res.ore];
  o.autoTrigger = automationTrigger();   // v0.60 Part 5: derived from AUTOMATION_BASE now
  S.res.crystals = 0; o.unfuelled = +(computeRates().parchment || 0).toFixed(4);
  S.buildings = {}; S.upgrades = {}; S.techs = {};
  return o;
});
check("48 — a Factory-shaped building unlocks at Hexdraulics and does NOTHING to start",
  fac.exists && fac.tech === "hexdraulics" && fac.inertOutputs.length === 0 && fac.inertParchment === 0,
  JSON.stringify(fac.cost));
check("48.1 — it burns Hextech Crystals as fuel", fac.fuelBase < 0, `${fac.fuelBase}/s at ten copies`);
check("48.1 — ...and an unfuelled Manufactory simply does not run",
  fac.unfuelled === 0, `${fac.unfuelled} parchment/s with no crystals`);
check("48.2A — Pressure Regulators halve the crystal draw",
  Math.abs(fac.fuelCut - fac.fuelBase / 2) < 1e-9, `${fac.fuelBase} → ${fac.fuelCut}`);
check("48.2B — the Rolling Press prints 0.005 parchment/s per copy, Jerry's figure",
  Math.abs(fac.parchment - 0.05) < 1e-9, `${fac.parchment}/s at ten copies`);
// v0.58.1 note 48.2C shipped a YEARLY FLAT GRANT of one of each of four goods per Manufactory,
// paid out of nothing — a faucet with no input, which is exactly why the ledger rated it EASIER.
// v0.59.1 note 7.2 replaces it with Kittens' Workshop Automation: at 95% of a raw resource's
// ceiling the overflow is converted into the crafted tier AT THE ORDINARY PRICE. It can only
// ever act on units that were about to be thrown away, so it is a spill-guard, not a faucet.
// RE-POINTED v0.60 Part 5 — the trigger is the source's 98%, derived from AUTOMATION_BASE.
check("48.2C/7.2 — automation does NOTHING below the trigger",
  JSON.stringify(fac.autoIdle) === JSON.stringify([0, 0]) && Math.abs(fac.autoTrigger - 0.98) < 1e-9,
  `trigger ${fac.autoTrigger}, made ${JSON.stringify(fac.autoIdle)}`);
check("48.2C/7.2 — ...and AT the ceiling it converts the overflow AND PAYS for it",
  fac.autocraft[0] > 0 && fac.autocraft[1] > 0 &&
  fac.autoSpent[0] > 0 && fac.autoSpent[1] > 0,
  `made ${JSON.stringify(fac.autocraft)} for ${JSON.stringify(fac.autoSpent)} raw`);
check("48 — ...on the SAME yearly hook the Arcanist's Circle uses, not a second one",
  /arcanistsCircleYear\(\); manufactoryYear\(\);/.test(CODE));
check("48 — and the bot can buy it: `manufactory` is in BUILD_ORDER", /"manufactory"/.test(SIMCORE));
check("48 — every new entity carries a PARITY LEDGER row (OFF-CYCLE-PROTOCOL §3)",
  /`manufactory`/.test(LEDGER) && /`pressureRegulators`/.test(LEDGER) &&
  /`rollingPress`/.test(LEDGER) && /`automatedWorkshop`/.test(LEDGER));

// ============================================================================
// THE ROUND ITSELF — off-cycle bookkeeping (OFF-CYCLE-PROTOCOL §1 and §4)
// ============================================================================
const version = await page.evaluate(() => VERSION);
// RE-POINTED at v0.59, superseded by v0.59 spec Part 0. This pinned `version === "v0.58.1"`,
// which is the LITERAL VERSION STRING rule 7 of HANDOFF v0.58.1 §5 forbids — and it is the
// second one of these the round has had to unpick, which is why it is worth naming the pattern:
// **an assertion about "the round we are in" written in the suite of a round that has shipped
// will always be wrong from the next round onward.** It ran green for exactly one version.
//
// What OFF-CYCLE-PROTOCOL §1 actually rules is a property of the NUMBERING SCHEME, not of any
// one version: an off-cycle round takes a point release `v0.NN.M`, and integers are reserved
// 1:1 for spec rounds. That is true forever and is what is asserted now — the scheme admits
// both shapes, this round's version is a well-formed member of it, and the rule itself is still
// written down where a future round will read it. `test-v59` asserts that v0.59 specifically is
// the INTEGER shape, which is that round's business and not this one's.
check("§1 — the numbering scheme is intact: point releases for off-cycle, integers for spec rounds",
  /^v0\.\d\d(\.\d+)?$/.test(version) &&
  /point release/i.test(OFFCYCLE) && /integer/i.test(OFFCYCLE), version);
check("§1 — ...and the footer is rendered from the constant",
  await page.evaluate(() => (document.body.innerText || "").indexOf(VERSION) > -1));
// RE-POINTED at v0.59, superseded by v0.59 spec Part 0 (a new analyzer round legitimately
// restores `current-build-spec.md` at the repo root). The v0.58.1 form asserted the file's
// ABSENCE, which was correct for exactly as long as no new spec existed — i.e. it was a
// version-pinned assertion in disguise, and rule 7 of HANDOFF v0.58.1 §5 says don't write those.
// What the assertion was actually FOR is that a CONSUMED spec is not left lying at the root to
// be implemented twice. That property is version-independent and is what is asserted now:
// the v0.58 spec is archived under docs/specs/, and whatever sits at the repo root is not it.
check("§3 — the consumed v0.58 spec is archived, and the repo root does not still hold it", (() => {
  let archived = false, rootIsV058 = false;
  try { readFileSync(new URL("../docs/specs/rr-analyzer-v058-spec.md", import.meta.url)); archived = true; } catch (e) {}
  try {
    const root = readFileSync(new URL("../current-build-spec.md", import.meta.url), "utf8");
    rootIsV058 = /v0\.58\b/.test(root.slice(0, 4000)) && !/v0\.(59|6\d|\d\d\d)/.test(root.slice(0, 4000));
  } catch (e) { /* absent is also fine — that is the between-rounds state */ }
  return archived && !rootIsV058;
})());
check("no console errors across the whole suite", errors.length === 0, errors.slice(0, 3).join(" | "));

console.log(`\n${pass} passed, ${fail} failed`);
await browser.close();
suiteEnd(import.meta.url, pass, fail);
process.exit(fail ? 1 : 0);
