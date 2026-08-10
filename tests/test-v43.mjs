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
const reset = () => page.evaluate(() => loadFromString(btoa(unescape(encodeURIComponent(JSON.stringify(freshState()))))));

// ==================== Part 3 — the housing reducers ====================
await reset();
const house = await page.evaluate(() => {
  const sh = BUILDINGS.find(b => b.id === "shelter"), lh = BUILDINGS.find(b => b.id === "longhouse");
  const at = ups => { S.upgrades = ups; return { s: +buildingRatio(sh).toFixed(4), l: +buildingRatio(lh).toFixed(4) }; };
  const o = {
    none: at({}),
    ironwood: at({ ironwoodShelters: 1 }),
    petricite: at({ ironwoodShelters: 1, petriciteFrames: 1 }),
    hexcrete: at({ ironwoodShelters: 1, petriciteFrames: 1, hexcreteFrames: 1 }),
    all4: at({ ironwoodShelters: 1, petriciteFrames: 1, hexcreteFrames: 1, voidwrightFrames: 1 }),
    lhOne: at({ stonecutGuild: 1 }),
    lhTwo: at({ stonecutGuild: 1, hexboundJoinery: 1 })
  };
  // Shelter #40, reduced and unreduced
  S.upgrades = { ironwoodShelters: 1, petriciteFrames: 1, hexcreteFrames: 1, voidwrightFrames: 1 };
  S.buildings = { shelter: 39 };
  o.shelter40 = Math.round(buildingCost(sh).timber);
  S.upgrades = {};
  o.shelter40Raw = buildingCost(sh).timber;
  S.buildings = {}; S.upgrades = {};
  // the two new Shelter reducers and the new Longhouse one exist with the specced tech and cost
  const u = id => UPGRADES.find(x => x.id === id);
  o.hexcreteFrames = u("hexcreteFrames") && { tech: u("hexcreteFrames").tech, cost: u("hexcreteFrames").cost };
  o.voidwrightFrames = u("voidwrightFrames") && { tech: u("voidwrightFrames").tech, cost: u("voidwrightFrames").cost };
  o.hexboundJoinery = u("hexboundJoinery") && { tech: u("hexboundJoinery").tech };
  return o;
});
check("the Shelter ratio ladder now moves in four steps, not two",
  house.none.s === 2.2 && house.ironwood.s < house.none.s && house.petricite.s < house.ironwood.s &&
  house.hexcrete.s < house.petricite.s && house.all4.s < house.hexcrete.s,
  `${house.none.s} → ${house.ironwood.s} → ${house.petricite.s} → ${house.hexcrete.s} → ${house.all4.s}`);
check("...and never reaches 1.0, through the DR primitive", house.all4.s > 1.0);
check("Hexcrete Frames lands at Deep Works with the specced cost",
  house.hexcreteFrames && house.hexcreteFrames.tech === "deepWorks" &&
  house.hexcreteFrames.cost.hexcrete === 60 && house.hexcreteFrames.cost.scaffold === 120,
  JSON.stringify(house.hexcreteFrames));
check("Voidwright Frames lands at Icathia with the specced cost",
  house.voidwrightFrames && house.voidwrightFrames.tech === "icathia" &&
  house.voidwrightFrames.cost.voidglass === 12 && house.voidwrightFrames.cost.chronoshard === 6,
  JSON.stringify(house.voidwrightFrames));
// SUPERSEDED v0.45 Part 3. Kittens has no logHousePriceRatio and no mansionPriceRatio
// anywhere in its source — only the hut, at a punitive 2.5 base, is ever discounted.
// Both Longhouse reducers are deleted and re-pointed at the Storehouse (1.75 base).
// Hexbound Joinery still exists and still reduces a ratio; it is just no longer this one.
check("the Longhouse takes no reducer at all, as Kittens' logHouse takes none",
  house.hexboundJoinery && house.none.l === house.lhOne.l && house.lhOne.l === house.lhTwo.l,
  `${house.none.l} → ${house.lhOne.l} → ${house.lhTwo.l}`);
// SUPERSEDED v0.45 Part 3. The ladder is re-derived to Kittens' own end-of-everything
// hut floor of 1.3516 (RR: 1.355) instead of RR's old 1.15, so Shelter #40 is meant to
// be EXPENSIVE — that is the point of the change. Kittens' floor exists to bring an
// unusable ratio into the usable band, not to make housing cheap. The invariant worth
// keeping is that the reducers still collapse a number that is otherwise absurd.
check("Shelter #40 still collapses by orders of magnitude, to a floor that bites",
  house.shelter40Raw / house.shelter40 > 1e6 && house.shelter40 > 5000,
  `${house.shelter40} timber reduced vs ${house.shelter40Raw.toExponential(2)} unreduced`);

// ==================== Part 1.3 — Renown on the storage curve ====================
const renown = await page.evaluate(() => {
  S.buildings = { hallOfHeroes: 20, trainingGround: 10 };
  S.techs = { trade: 1, drakeLore: 1, voidStudies: 1 };
  S.jobs = {}; S.pop = 0; S.wanderers = []; S.policies = {}; S.wtechs = {}; S.drakes = {};
  S.champs = {}; S.leader = null; S.upgrades = {};
  const bare = computeCaps().renown;
  S.upgrades = { expandedStores: 1, ironboundStores: 1, hexRunedStores: 1, chemtechSilos: 1 };
  const chemtech = computeCaps().renown;
  S.upgrades.voidwardStores = 1;
  const icathia = computeCaps().renown;
  // vigor must stay exempt
  // v0.57 Part 1: the line that actually moves Renown now. The instrument reaches 3 of the 5
  // Scholarship rungs in a measured run, so that is the state the affordability claim is made at.
  const scholar3 = (() => { S.upgrades = { cataloguing: 1, crossReferencing: 1, greatIndex: 1 };
                            return computeCaps().renown; })();
  const vBare = (() => { S.upgrades = {}; return computeCaps().vigor; })();
  S.upgrades = { expandedStores: 1, ironboundStores: 1, hexRunedStores: 1, chemtechSilos: 1, voidwardStores: 1 };
  const vMasonry = computeCaps().vigor;
  S.buildings = {}; S.upgrades = {}; S.techs = {};
  return { bare: Math.round(bare), chemtech: Math.round(chemtech), icathia: Math.round(icathia),
           scholar3: Math.round(scholar3),
           vigorExempt: Math.abs(vBare - vMasonry) < 1e-9 };
});
// v0.44 Part 2.2 superseded v0.43's magnitude with sqrt(Masonry), because the full
// multiplicative line reached 23,208 before Sparks and the currency never gated anything.
//
// v0.56 Part 5 RE-POINT: THERE IS NO LONGER A PRODUCT TO TAKE A ROOT OF. The Masonry chain is
// replaced by two additive accumulators applied at three scopes (Kittens `js/resources.js`
// addBarnWarehouseRatio), and Renown — which is RR-ORIGINAL with no source counterpart at all
// — is assigned to the WAREHOUSE (broad) tier. That is a design ruling, not a parity claim,
// and it was made from this measurement: at the "none" tier the Chemtech-era ceiling is 5,810
// against the tenth champion's 9,611 Renown cost, which puts the last rung of the champion
// ladder out of reach. At "broad" it is 14,815. The property this assertion has always been
// about — the ceiling rises with the era, sub-linearly, and clears the tenth champion — is
// unchanged and is asserted directly below. Superseded by: v0.56 Part 5.
// v0.57 Part 1 RE-POINT: Renown LEAVES THE MATERIAL LINE ENTIRELY, on Jerry's directive 1.
// `js/resources.js addBarnWarehouseRatio` touches seven MATERIAL effect names and nothing else,
// and Kittens relieves its non-material ceilings by different machinery altogether — so a
// non-material resource on the storage line is a category error in the source's own terms.
// Renown joins SCHOLAR_CAPS beside culture and devotion, and the Masonry upgrades no longer
// move it AT ALL. That is the property this assertion becomes.
// Superseded by: v0.57 Part 1.
check("Renown is untouched by the Masonry line — it is not a material",
  renown.bare === renown.chemtech && renown.chemtech === renown.icathia,
  `${renown.bare} bare → ${renown.chemtech} at Chemtech Silos → ${renown.icathia} at Voidward`);
check("...and the SCHOLARSHIP line is what lifts it now, clearing the tenth champion's 9,611",
  renown.scholar3 > 9611, `${renown.bare} bare → ${renown.scholar3} at 3 of 5 Scholarship rungs`);
check("Vigor stays exempt — it is a transient flow, not a store", renown.vigorExempt);

// ==================== Part 1.2 — the recruitment ladder ====================
const recruit = await page.evaluate(() => {
  S.champs = {}; S.upgrades = {}; S.buildings = {};
  const ids = CHAMPS.map(c => c.id);
  const ladder = [], cumulative = [];
  let cum = 0;
  for (let n = 0; n < 10; n++) {
    const c = recruitCost(ids[n]);
    ladder.push(c.renown); cum += c.renown; cumulative.push(cum);
    S.champs[ids[n]] = { r: true, lvl: 0, xp: 0 };
  }
  // the signature material must NOT scale
  S.champs = {};
  const first = recruitCost("leona");
  for (let n = 0; n < 9; n++) S.champs[ids[n]] = { r: true };
  const tenth = recruitCost("leona");
  const sigStable = Object.keys(first).filter(k => k !== "renown")
    .every(k => first[k] === tenth[k]);
  S.champs = {};
  return { ladder, cumulative: cum, base: RECRUIT_BASE, ratio: RECRUIT_RATIO,
           sigStable, firstSig: first, tenthSig: tenth };
});
// v0.44 Part 2.1 supersedes 1.6: the ladder is gentler at 1.5 BECAUSE the rungs no
// longer do the gating alone — rungs 8-10 also demand Hexgear, Hextech Cores and
// Hexcrete, which cannot exist before Era 3. See test-v44 for the gate itself.
// RE-POINTED v0.58.1, superseded by NOTE 31: "Let's increase how much renown each champion
// takes to make it a little harder to get champions at the start." RECRUIT_BASE 250 -> 400;
// the RATIO is untouched at 1.5, deliberately, because the note is about the START and the base
// is the term that governs it. Note 31.2's constraint — the ladder must stay finishable — is a
// measured pass in BUILD REPORT §8, not an assumption.
check("recruitment is a geometric ladder at 1.5 off a 400 base, top gated on content",
  recruit.base === 400 && recruit.ratio === 1.5, `${recruit.base} × ${recruit.ratio}^n`);
check("the ten rungs match the spec's table exactly",
  JSON.stringify(recruit.ladder) === JSON.stringify([400, 600, 900, 1350, 2025, 3038, 4556, 6834, 10252, 15377]),
  JSON.stringify(recruit.ladder));
check("cumulative Renown to ten champions is 45,332 (v0.58.1 note 31)", recruit.cumulative === 45332, String(recruit.cumulative));
check("the signature material does NOT scale — only Renown carries the ladder",
  recruit.sigStable, `${JSON.stringify(recruit.firstSig)} → ${JSON.stringify(recruit.tenthSig)}`);

// ==================== Parts 1.4 / 1.5 — experience ====================
const xp = await page.evaluate(() => {
  const o = { leaderRate: CHAMP_XP_LEADER, benchRate: CHAMP_XP_BENCH };
  o.thresholds = []; for (let l = 1; l <= 10; l++) o.thresholds.push(xpTotalFor(l));
  S.champs = { jarvan: { r: true, lvl: 0, xp: 0 } }; S.leader = "jarvan";
  S.buildings = {}; S.upgrades = {}; S.policies = {}; S.wanderers = [];
  o.leadBare = +champXpRate("jarvan").toFixed(4);
  S.buildings = { trainingGround: 1e7, hallOfHeroes: 1e7 };
  o.leadCeiling = +champXpRate("jarvan").toFixed(4);
  S.leader = null;
  o.benchCeiling = +champXpRate("jarvan").toFixed(4);
  // XP accrues, is cumulative, and is NEVER spent
  S.buildings = {}; S.leader = "jarvan";
  S.champs.jarvan.xp = 0;
  tickChampXp(1000);
  o.accrued = +S.champs.jarvan.xp.toFixed(2);
  // bank past a threshold, then level — the overflow must survive
  S.champs.jarvan.xp = xpTotalFor(3) + 500;
  S.res.renown = 1e9; S.res.tome = 1e9; S.res.hexcore = 1e9;
  const before = S.champs.jarvan.xp;
  trainChamp("jarvan");
  o.levelledOnce = champLevel("jarvan") === 1;
  o.xpNotSpent = Math.abs(S.champs.jarvan.xp - before) < 1e-9;
  // ...and can level repeatedly off the same bank
  trainChamp("jarvan"); trainChamp("jarvan");
  o.levelledThrice = champLevel("jarvan") === 3;
  o.blockedAtFour = !canTrain("jarvan");   // xp banked was only enough for 3
  // materials alone are not sufficient
  S.champs.zilean = { r: true, lvl: 0, xp: 0 };
  o.materialsAloneInsufficient = !canTrain("zilean");
  S.champs = {}; S.leader = null; S.buildings = {};
  ["renown", "tome", "hexcore"].forEach(r => S.res[r] = 0);
  return o;
});
check("XP accrues at 0.15/s leading and 0.01/s benched", xp.leaderRate === 0.15 && xp.benchRate === 0.01);
check("the two champion buildings finally do something for champions",
  xp.leadBare === 0.15 && xp.leadCeiling > 0.29 && xp.leadCeiling <= 0.30 && xp.benchCeiling > 0.019,
  `lead ${xp.leadBare} → ${xp.leadCeiling}, bench → ${xp.benchCeiling}`);
check("the level thresholds match the spec's table", xp.thresholds[0] === 120 && Math.abs(xp.thresholds[9] - 69255) < 100,
  `lvl1 ${xp.thresholds[0]}, lvl10 cumulative ${xp.thresholds[9]}`);
check("XP is a lifetime cumulative total and is NEVER spent", xp.accrued === 150 && xp.xpNotSpent);
check("banked overflow lets a champion level several times in a row",
  xp.levelledOnce && xp.levelledThrice && xp.blockedAtFour);
check("materials alone no longer level a champion — the XP gate is real", xp.materialsAloneInsufficient);

// ==================== Part 1.6 — the card says so ====================
const ui = await page.evaluate(() => {
  loadFromString(btoa(unescape(encodeURIComponent(JSON.stringify(freshState())))));
  S.techs = { callToArms: 1, logistics: 1 };
  S.champs = { jarvan: { r: true, lvl: 0, xp: 5000 } };   // banked well past level 1
  S.leader = "jarvan";
  S.res.renown = 0; S.res.tome = 0;
  S.activeTab = "champions"; uiDirty = true; renderAll();
  const h = document.getElementById("tab-content").innerHTML;
  return {
    // v0.49 (Jerry, champion edit 2): the label lost its "XP " prefix — the card is
    // ~125px wide once the TRAIN and star chips take their float, and the prefix pushed
    // the name onto a second line. Same property: progress against the next threshold.
    // RE-POINTED v0.58.1 — note 26 ("Champions exp should be labeled (XP)"): the label now
    // carries the unit, so the pattern asserts it rather than stopping at the numbers.
    showsXp: /data-champxp="\w+">[\d.KM]+\/[\d.KM]+ XP</.test(h),
    // v0.49 (Jerry, champion edit 2): the per-second rate and the leading/benched text
    // are deliberately gone from the card — the card was three lines deep. XP now rides
    // beside the name and ticks live, which is what this assertion checks instead.
    showsRate: /data-champxp=/.test(h) && /class="champ-xp"/.test(h),
    showsReadyLine: /Ready to train/.test(h),
    namesWhatIsMissing: /more renown/i.test(h) || /more tomes/i.test(h),
    // v0.49 (Jerry, champion edit 1): the class and the recruit index are both removed.
    // Neither was actionable and both cost a line. Asserted ABSENT now.
    showsRecruitIndex: !/champion #/.test(h) && !/\bAssassin\b|\bSupport\b/.test(h)
  };
});
// RE-POINTED v0.58.1 — note 26 appends " XP" to the label ("Champions exp should be labeled (XP)").
check("the card shows XP against the next threshold, and says so (v0.58.1 note 26)", ui.showsXp);
check("...beside the name, on a node the live layer updates every tick", ui.showsRate);
check("...and an explicit ready-to-train line naming what is still missing",
  ui.showsReadyLine && ui.namesWhatIsMissing);
check("the recruit card no longer lists the class or the rung", ui.showsRecruitIndex);

// ==================== Part 0 + Jerry's directive 4 ====================
const drift = await page.evaluate(() => {
  // RE-POINTED v0.59, superseded by spec Part 5.4. SCHOLAR_LINE is deleted; the three
  // Reflectors rungs live in ARCHIVE_RATIO_LINE and the two Astrolabe rungs in ASTROLABE_LINE.
  // THE INVARIANT IS UNCHANGED AND IS THE WHOLE POINT OF THIS BLOCK: a rung's description
  // states the number the code applies. Only the table it is read from moved.
  const descs = ARCHIVE_RATIO_LINE.map(([id, mult]) => ({ id, mult, desc: UPGRADES.find(u => u.id === id).desc }));
  // RE-POINTED v0.58, superseded by SPEC PART 3. SCHOLAR_LINE holds INCREMENTS now, so the
  // prose states "+25%" where it used to state "×1.25". The invariant is unchanged and is the
  // whole point of this block: the description must state the number the code applies.
  // v0.59: the ratio is 0.02, which prints as "2%" — Math.round(0.02*1000)/10 in the generator.
  const mismatched = descs.filter(d => d.desc.indexOf("a further " + (Math.round(d.mult * 1000) / 10) + "%") === -1).map(d => d.id);
  // ...and the two Astrolabe rungs name their building and their +50%.
  const astro = Object.entries(ASTROLABE_LINE).filter(([id, bld]) => {
    const dsc = UPGRADES.find(u => u.id === id).desc;
    const b = BUILDINGS.find(x => x.id === bld);
    return dsc.indexOf("+" + Math.round((ASTROLABE_MULT - 1) * 100) + "%") === -1 ||
           dsc.indexOf(b.name.replace(/y$/, "ie")) === -1;
  }).map(([id]) => id);
  // RE-POINTED v0.58.1 — §29 moves CULTURE out of SCHOLAR_CAPS, so the "applied" half of this
  // drift check must measure the line where it still lands: RENOWN. The invariant is unchanged
  // and is the whole point of the block — a rung's description states the number the code
  // applies — only the resource it is measured on moved.
  // and the multipliers computeCaps actually applies
  // v0.44 Part 2.5.2: knowledge left the line, so "the multiplier the code actually
  // applies" is measured on culture — SCHOLAR_CAPS is the single source for both the
  // prose and the maths, which is what makes this invariant hold through the move.
  S.buildings = { hallOfHeroes: 20, trainingGround: 10 }; S.techs = { trade: 1, drakeLore: 1, voidStudies: 1 }; S.upgrades = {}; S.res.tome = 0;
  S.jobs = {}; S.pop = 0; S.wanderers = []; S.policies = {}; S.champs = {}; S.wtechs = {}; S.drakes = {}; S.leader = null;
  // v0.59 Part 5.3: renown no longer takes the line at all, so the "applied" half is measured
  // where the effect now lands — the Archive's knowledge slice, scaled by Observatory count.
  // TEN observatories, so a 0.02 rung delivers a visible ×1.20 rather than a ×1.00 no-op.
  //
  // MEASURED AS AN ABSOLUTE DELTA, NOT A RATIO, and the distinction is the assertion. The rung
  // amplifies the ARCHIVE'S OWN SLICE, so the ratio against the whole knowledge ceiling is
  // diluted by every other knowledge building standing (20 archives = 5,000 of a 15,000 total,
  // so a x1.20 on the slice reads x1.067 on the total). A ratio test here would have to encode
  // the fixture's composition to be right, and would silently pass on a wrong mechanism if the
  // composition ever changed. The delta cannot: 5,000 x 10 observatories x 0.02 = exactly 1,000.
  S.buildings = { archive: 20, observatory: 10 };
  const ARCH = 20 * BUILDINGS.find(b => b.id === "archive").caps.knowledge;
  const base = computeCaps().knowledge;
  // RE-POINTED v0.61, superseded by PART 7 / DEV NOTE 2. The three rungs no longer all amplify
  // the ARCHIVE scaled by OBSERVATORIES — there are three distinct pairings now. The expected
  // delta is therefore each rung's own `target` slice times its own `scaler` count, which is a
  // stricter test than the old one: it would fail if a pairing were mis-wired, where the old
  // form could only fail if a magnitude moved. The fixture stands 20 archives, 10 observatories
  // and 15 academies so all three pairings deliver a visible, distinguishable delta.
  S.buildings = { archive: 20, observatory: 10, academy: 15 };
  const base2 = computeCaps().knowledge;
  const slice = bid => (S.buildings[bid] || 0) * BUILDINGS.find(b => b.id === bid).caps.knowledge;
  const applied = KNOWLEDGE_AMP_LINE.map(u => {
    S.upgrades = {}; S.upgrades[u.id] = true;
    return { id: u.id, mult: u.ratio,
             expect: Math.round(slice(u.target) * (S.buildings[u.scaler] || 0) * u.ratio),
             actual: Math.round(computeCaps().knowledge - base2) };
  });
  S.upgrades = {}; S.buildings = {};
  const wrong = applied.filter(a => Math.abs(a.actual - a.expect) > 1).map(a => `${a.id} ${a.actual}!=${a.expect}`);
  // duplicate passives
  const keys = CHAMPS.map(c => c.passive.key + ":" + c.passive.base);
  return { mismatched, astro, wrong, dupes: keys.filter((x, i) => keys.indexOf(x) !== i),
           swain: CHAMPS.find(c => c.id === "swain").passive,
           swainLead: CHAMPS.find(c => c.id === "swain").lead,
           jarvan: CHAMPS.find(c => c.id === "jarvan").passive,
           generated: /scholarDesc\(/.test(UPGRADES.find(u => u.id === "greatIndex").desc) === false &&
                      typeof scholarDesc === "function" };
});
check("every Scholarship description states the multiplier the code actually applies",
  drift.mismatched.length === 0 && drift.astro.length === 0 && drift.wrong.length === 0,
  `desc mismatch: ${drift.mismatched.join(",") || "none"}; astrolabe prose: ${drift.astro.join(",") || "none"}; applied mismatch: ${drift.wrong.join(",") || "none"}`);
check("...because the descriptions are GENERATED from the constants, not restated", drift.generated);
check("no two champions share a passive any more (Jarvan and Swain both ran village +8%)",
  drift.dupes.length === 0, drift.dupes.join(", "));
// RE-POINTED v0.59, superseded by spec Part 8 note 5 (Jerry): "Swain's lead duplicates his
// passive; his passive becomes a mana-production percentage." Note 20 had moved his LEAD onto
// knowledge production to close a toggling exploit, which left the lead and the passive doing
// the same thing to the same resource — the Twitch defect of v0.54 in a new costume. The
// property this block is actually for is the one three lines above: NO TWO CHAMPIONS SHARE A
// PASSIVE. v0.59 extends it to the stronger form — no champion's passive duplicates their own
// lead either — which is what the note bought.
check("Swain's passive and his LEAD are distinct subjects (v0.59 Part 8 note 5)",
  drift.swain.key === "mana" && drift.jarvan.key === "xp" &&
  /knowledge production/.test(drift.swainLead) && !/knowledge/i.test(drift.swain.desc),
  `Swain passive ${drift.swain.key} +${drift.swain.base}%, lead "${drift.swainLead}", Jarvan ${drift.jarvan.key} +${drift.jarvan.base}%`);

// and Swain's new passive must actually reach production
// RE-POINTED v0.59 Part 8 note 5: the passive is measured where it now lands — MANA production,
// through the Arcanist job — rather than on knowledge, which is his lead's subject.
const swainWorks = await page.evaluate(() => {
  S.buildings = {}; S.jobs = { arcanist: 10 }; S.pop = 10; S.upgrades = {};
  S.wanderers = Array.from({ length: 10 }, (_, i) => ({ nm: "a" + i, j: "arcanist", jx: {}, xp: 0, t: "trailblazer" }));
  S.policies = {}; S.wtechs = {}; S.drakes = {}; S.leader = null; S.techs = { almanac: 1 };
  if (typeof invalidateCensus === "function") invalidateCensus();
  S.champs = {};
  const before = computeRates().mana;
  S.champs = { swain: { r: true, lvl: 0, xp: 0 } };
  const after = computeRates().mana;
  S.champs = {}; S.jobs = {}; S.pop = 0; S.wanderers = [];
  return { before: +before.toFixed(4), after: +after.toFixed(4), works: after > before };
});
check("...and it actually reaches MANA production", swainWorks.works,
  `${swainWorks.before}/s → ${swainWorks.after}/s`);

// ==================== regressions ====================
await reset();
const reg = await page.evaluate(() => {
  const o = {};
  o.ascentPure = !/cost|cooldown|Until/i.test(ascendTargon.toString());
  S.res.devotion = 500; S.worship = 0; ascendTargon(); ascendTargon();
  o.ascentBanks = S.worship === 500 && S.res.devotion === 0;
  o.coreFns = ["tick", "computeRates", "computeCaps", "morale", "ascendTargon", "renderAll", "renderTop"]
    .every(f => typeof window[f] === "function");
  S.buildings = {}; BUILDINGS.forEach(b => S.buildings[b.id] = 3);
  S.techs = {}; TECHS.forEach(t => S.techs[t.id] = true);
  S.upgrades = {}; UPGRADES.forEach(u => S.upgrades[u.id] = true);
  S.wtechs = {}; WTECHS.forEach(w => S.wtechs[w.id] = true);
  S.champs = {}; CHAMPS.forEach(d => S.champs[d.id] = { r: true, lvl: 10, xp: 1e6 });
  S.pop = 130; S.jobs = { farmer: 20, loremaster: 20, miner: 20, woodcutter: 20, acolyte: 20 };
  if (typeof invalidateCensus === "function") invalidateCensus();
  const caps = computeCaps(), rts = computeRates();
  o.noNaNCaps = Object.values(caps).every(v => isFinite(v));
  o.noNaNRates = Object.values(rts).every(v => isFinite(v));
  o.badCaps = Object.entries(caps).filter(([, v]) => !isFinite(v)).map(([k]) => k).join(",");
  o.badRates = Object.entries(rts).filter(([, v]) => !isFinite(v)).map(([k]) => k).join(",");
  o.moraleFinite = isFinite(morale());
  o.craftYieldLimit = CRAFT_YIELD_LIMIT === 2.2;
  o.morelloClamped = /Math\.min\(\s*150 \* Math\.floor\(S\.res\.morellonomicon/.test(computeCaps.toString());
  o.tradeV1 = FACTIONS.filter(f => {
    const y = (f.primaryYield || []).concat(f.slots.map(s => s.res));
    return Object.keys(f.cost).some(c => y.indexOf(c) !== -1);
  }).map(f => f.id);
  const all = FACTIONS.reduce((a, f) => a.concat(f.slots.map(s => s.res)), []);
  o.tradeV2 = new Set(all).size === 15;
  // SUPERSEDED v0.46 Part 6: stripe re-derived 20,000 -> 1,884 from a four-seed W₁.
  o.stripe = /unlimitedDR\(S\.worship \|\| 0, 1000\)/.test(worshipBonus.toString());
  const k = TECHS.filter(t => t.cost.knowledge).map(t => t.cost.knowledge).sort((a, b) => a - b);
  const steps = []; for (let i = 1; i < k.length; i++) steps.push(k[i] / k[i - 1]);
  // SUPERSEDED v0.46 Part 5: the re-skew restores Kittens' x3.33 calendar->agriculture step.
  o.noStepOver3 = steps.every(x => x <= 3.35);
  return o;
});
check("regression: Ascent is still free, cooldownless and bonusless", reg.ascentPure && reg.ascentBanks);
check("regression: core function names unchanged", reg.coreFns);
check("regression: no NaN caps with everything owned and every champion at 10", reg.noNaNCaps, reg.badCaps);
check("regression: no NaN rates with everything owned", reg.noNaNRates, reg.badRates);
check("regression: morale finite at 130 wanderers", reg.moraleFinite);
check("regression: v0.42's craft ceiling and clamped compendium survive", reg.craftYieldLimit && reg.morelloClamped);
check("regression: the trade invariants survive", reg.tradeV1.length === 0 && reg.tradeV2);
check("regression: the measured Convergence stripe survives", reg.stripe);
check("regression: no tech step above Kittens' own largest (×3.33)", reg.noStepOver3);

const loop = await page.evaluate(() => {
  const avgFrom = fn => {
    const m = fn.toString().match(/\((\d+)\s*\+\s*Math\.floor\(Math\.random\(\)\s*\*\s*(\d+)\)\)/);
    return m ? (+m[1] + (+m[1] + (+m[2] - 1))) / 2 : null;
  };
  const dem = FACTIONS.find(f => f.id === "demacia"), pil = FACTIONS.find(f => f.id === "piltover");
  S.buildings = { tradeDock: 1e7, workshop: 1e7, hexgateBuilding: 1e7 };
  S.caravans = { demacia: 1e7, piltover: 1e7 };
  S.upgrades = { riverstoneTools: true, progressDayParade: true }; S.policies = {}; S.wanderers = []; S.champs = {};
  POLICY_GROUPS.forEach(g => g.options.forEach(o => { if (/trade/i.test(o.id)) S.policies[g.id] = o.id; }));
  CHAMPS.forEach(d => { S.champs[d.id] = { r: true, lvl: 10, xp: 1e6 }; });
  S.leader = "twitch";
  const maxM = tradeYieldMult("demacia");
  const G = (avgFrom(dem.run) / dem.cost.timber) * (avgFrom(pil.run) / pil.cost.steel) *
            (transmuteYield() / TRANSMUTE_COST) * maxM * maxM;
  S.buildings = {}; S.caravans = {}; S.upgrades = {}; S.policies = {}; S.champs = {}; S.leader = null;
  // v0.62 PART 1 — the TAX is what bounds this cycle; the yield category is uncapped, as the
  // source's is. Gold and vigor come from outside every resource cycle.
  const SECY = 4 * 100 * 10 * 0.2;
  const rr2 = computeRates(), dc2 = tradeCost(dem);
  const byG2 = dc2.gold ? (rr2.gold || 0) * SECY / dc2.gold : Infinity;
  const byV2 = dc2.vigor ? (rr2.vigor || 0) * SECY / dc2.vigor : Infinity;
  return { maxM: +maxM.toFixed(3), G: +G.toFixed(3),
           tradesPerYear: +Math.min(byG2, byV2).toFixed(1),
           bindingTax: byG2 < byV2 ? "gold" : "vigor",
           taxBinds: isFinite(Math.min(byG2, byV2)) };
});
// RE-POINTED v0.62, superseded by PART 1 — `TRADE_YIELD_LIMIT` is REMOVED and v0.61's
// justification for it is WITHDRAWN. Kittens has the same trade cycles and the same
// base-resource craft; what bounds them is a per-trade tax in resources the cycle does not
// produce, and RR already had it. **Measured: 15.6 sustainable trades/game-year at Sparks, 47.1
// at Hexcore, bound by VIGOR.** The yield category is one ADDITIVE, UNCAPPED sum, which is
// `js/diplomacy.js:744-747` exactly and what dev note 8 asked for at v0.61.
check("regression: the trade cycle is still tax-bounded, not yield-capped (v0.62 Part 1)",
  loop.taxBinds && loop.tradesPerYear < 200,
  `${loop.tradesPerYear} sustainable trades/game-year bound by ${loop.bindingTax}; ` +
  `yield-only G = ${loop.G} at max M = ${loop.maxM} — a CAPPED resource at its ceiling, not unbounded resources`);

await reset();
const rt = await page.evaluate(() => {
  S.champs = { jarvan: { r: true, lvl: 4, xp: 12345 } };
  S.upgrades.hexcreteFrames = true;
  loadFromString(btoa(unescape(encodeURIComponent(JSON.stringify(S)))));
  return S.champs.jarvan.xp === 12345 && S.champs.jarvan.lvl === 4 && S.upgrades.hexcreteFrames === true;
});
check("regression: saves round-trip champion XP and the new upgrades", rt);

await reset();
for (const tab of ["settlement", "crafting", "village", "lore", "wilds", "trade", "targon", "champions"]) {
  await page.evaluate(t => {
    S.techs = {}; TECHS.forEach(x => S.techs[x.id] = true);
    S.upgrades = {}; UPGRADES.forEach(u => S.upgrades[u.id] = true);
    S.wtechs = {}; WTECHS.forEach(w => S.wtechs[w.id] = true);
    S.buildings = {}; BUILDINGS.forEach(b => S.buildings[b.id] = 2);
    S.champs = {}; CHAMPS.forEach(d => S.champs[d.id] = { r: true, lvl: 5, xp: 40000 });
    S.leader = CHAMPS[0].id;
    S.caravans = {}; FACTIONS.forEach(f => { S.caravans[f.id] = 16; S.factionsFound[f.id] = true; });
    S.pop = 20; syncRoster(); S.worship = 5000;
    for (const r in RES) S.seenMax[r] = 999;
    S.buildings.archive = Math.max(1, S.buildings.archive || 0); S.buildings.shelter = Math.max(1, S.buildings.shelter || 0); S.upgrades.keepingTheRolls = true; S.activeTab = t; uiDirty = true; renderAll();
  }, tab);
  await page.waitForTimeout(40);
}
check("all 8 tabs render with a fully levelled roster, no console errors", errors.length === 0, errors.slice(0, 3).join(" | "));

console.log(`\n${pass} passed, ${fail} failed`);
await browser.close();
suiteEnd(import.meta.url, pass, fail);
process.exit(fail ? 1 : 0);
