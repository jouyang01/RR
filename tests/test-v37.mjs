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

// helper: a clean settlement with a chosen pop / hearth / shrine setup.
// v0.52 Part 2.3 merged the Tavern into the Bard's Hearth. Per-copy relief went
// 0.05 -> 0.0115, sized from measured counts, so every count in this file is scaled
// x4.348 to hold the RAW RELIEF SUM — and therefore the delivered morale — fixed.
const moraleAt = async (pop, hearths, opts = {}) => page.evaluate(({ pop, hearths, opts }) => {
  S.pop = pop; S.wanderers = []; invalidateCensus();
  S.buildings = { bardsHearth: hearths, shrine: opts.shrines || 0 };
  S.jackboxes = 0;
  ["mushrooms", "furs", "plumes", "poros", "trueice"].forEach(r => S.res[r] = 0);
  S.wtechs = opts.sunAltar ? { sunAltar: true } : {};
  S.altarTier = opts.altarTier || 0;
  const m = morale();
  S.pop = 0; S.buildings = {}; S.wtechs = {};
  return m;
}, { pop, hearths, opts });

// ===================== B3 — crowding is linear again =====================
const b3 = await page.evaluate(() => {
  const src = morale.toString();
  return {
    noSuperLinear: !/S\.pop\s*-\s*60/.test(src),
    // the spec's own table: penalty = 100 - morale, with luxuries and shrines at zero
    // v0.52 Part 2.3: 10/20/30/40 Taverns at 0.05 -> 43/87/130/174 Hearths at 0.0115.
    // Raw sums 0.500/1.000/1.500/2.000 -> 0.4945/1.0005/1.4950/2.0010, so the column holds.
    penalty: [[60, 43], [100, 87], [150, 130], [250, 174]].map(([pop, tav]) => {
      S.pop = pop; S.wanderers = []; invalidateCensus();
      S.buildings = { bardsHearth: tav }; S.jackboxes = 0; S.wtechs = {};
      ["mushrooms", "furs", "plumes", "poros", "trueice"].forEach(r => S.res[r] = 0);
      return { pop, tav, pen: 100 - morale() };
    })
  };
});
check("super-linear past-60 crowd term removed", b3.noSuperLinear);
// v0.40 Part 2.2 supersedes v0.37's penalty column. Tavern relief now asymptotes at
// 0.88 rather than 1.0, deliberately, so the crowd penalty is no longer cancellable and
// the column reads 55 / 39 / 48 / 74. What v0.37 was really guarding — that crowding is
// LINEAR in population, with no super-linear cliff — is unchanged and still asserted
// above. What v0.40 adds is that the residue must GROW with population; that is the
// whole reason morale is a system rather than a bonus.
// v0.52 Part 2.3: the first entry moves 55 -> 56 and nothing else moves. 0.0115/copy
// cannot reproduce 0.05 x 10 = 0.500 at an integer count — 43 hearths is 0.4945 and 44 is
// 0.5060 — so the one row still inside limitedDR's FREE zone lands 0.6 of a morale point
// low and rounds up. The three saturated rows are identical to the digit. Recorded, not
// papered over: the column is 56 / 39 / 48 / 74 from v0.52.
check("penalty at the v0.40 relief ceiling (56 / 39 / 48 / 74)",
  JSON.stringify(b3.penalty.map(p => p.pen)) === JSON.stringify([56, 39, 48, 74]),
  b3.penalty.map(p => `pop${p.pop}:${p.pen}`).join("  "));
check("the crowding residue grows with population — it can no longer be cancelled",
  b3.penalty[3].pen > b3.penalty[2].pen && b3.penalty[2].pen > b3.penalty[1].pen);

// ===================== B1 — relief through the DR primitive =====================
const b1 = await page.evaluate(() => {
  const rel = n => +(limitedDR(0.05 * n, 1.0) * 100).toFixed(1);
  return {
    // v0.48 §4: the 0.05 literal became a `crowdRelief` FIELD, read by both morale() and
    // the generated Effects block. v0.52 Part 2.3 moved that field off the Tavern (deleted)
    // onto the Bard's Hearth. The table below exercises the PRIMITIVE at 0.05, which is
    // unchanged — it is limitedDR that is under test here, not the building's per-copy size.
    usesLDR: /limitedDR\(\s*bfield\("bardsHearth", "crowdRelief"\)\s*\*\s*count\("bardsHearth"\)/.test(morale.toString()),
    noHardCap: !/Math\.min\(0\.9/.test(morale.toString()),
    table: [5, 15, 18, 20, 30, 100].map(n => ({ n, r: rel(n) })),
    // the whole point: copy #19 must still be worth something
    t18: rel(18), t19: rel(19),
    neverFull: limitedDR(0.05 * 100000, 1.0) < 1
  };
});
check("relief runs through limitedDR, the hard 0.9 cap is gone", b1.usesLDR && b1.noHardCap);
check("relief table matches the spec exactly (25 / 75 / 84.4 / 87.5 / 93.8 / 98.6)",
  JSON.stringify(b1.table.map(t => t.r)) === JSON.stringify([25, 75, 84.4, 87.5, 93.8, 98.6]),
  b1.table.map(t => `${t.n}:${t.r}%`).join("  "));
check("copy #19 is no longer worth exactly nothing (limitedDR at 0.05/copy)", b1.t19 > b1.t18, `${b1.t18}% → ${b1.t19}%`);
check("relief approaches but never reaches 100%", b1.neverFull);
check("the first 15 copies at 0.05 are entirely free (LDR free zone)", b1.table[1].r === 75);

// ===================== B4 — floor raised to 25 =====================
const b4 = await page.evaluate(() => {
  S.pop = 5000; S.wanderers = []; invalidateCensus();
  S.buildings = {}; S.jackboxes = 0; S.wtechs = {};
  ["mushrooms", "furs", "plumes", "poros", "trueice"].forEach(r => S.res[r] = 0);
  const floored = morale();
  S.pop = 0;
  return { floored, hasFloor: /Math\.max\(25,/.test(morale.toString()) };
});
check("morale floors at 25, not 10", b4.floored === 25 && b4.hasFloor, `catastrophic settlement sits at ${b4.floored}%`);

// ===================== B2 — the Temple role =====================
const b2 = await page.evaluate(() => {
  const w = WTECHS.find(x => x.id === "sunAltar");
  return {
    exists: !!w,
    threshold: w && w.threshold,
    cost: w && w.cost,
    orderedByThreshold: WTECHS.every((x, i) => i === 0 || x.threshold >= WTECHS[i - 1].threshold),
    // the spec's snippet said count("shrineSolari"); the real building id is "shrine"
    usesRealBuildingId: /count\("shrine"\)/.test(morale.toString()) && !/shrineSolari/.test(morale.toString()),
    // v0.40 bounds it: shrine = limitedDR(count("shrine") * ..., 25); m += shrine
    isFlatAdd: /shrine = limitedDR\(count\("shrine"\)/.test(morale.toString()) && /m \+= shrine/.test(morale.toString())
  };
});
// RE-POINTED v0.58.1, superseded by NOTE 6.1: "Devotion cost for the revelations should be
// higher. It should force players to build more religion buildings." 300 -> 1,200. The
// THRESHOLD, which is what this assertion is really about, is untouched at 400.
check("Altar of the Dawn exists at threshold 400, costing 1,200 devotion + 200 gold",
  b2.exists && b2.threshold === 400 && b2.cost.devotion === 1200 && b2.cost.gold === 200, JSON.stringify(b2.cost));
check("worship techs stay ordered by threshold", b2.orderedByThreshold);
check("the term uses the real building id 'shrine' so it actually fires", b2.usesRealBuildingId);
check("it is a flat add, not a penalty reducer (different job from the Hearth)", b2.isFlatAdd);

const b2fx = await Promise.all([
  moraleAt(20, 5, { shrines: 20, sunAltar: false }),
  moraleAt(20, 5, { shrines: 20, sunAltar: true }),
  moraleAt(20, 5, { shrines: 0, sunAltar: true }),
  moraleAt(20, 5, { shrines: 20, sunAltar: true, altarTier: 3 })
]);
check("Shrines give no morale until the Altar is researched", b2fx[1] - b2fx[0] === 10, `+${b2fx[1] - b2fx[0]} from 20 shrines`);
check("20 Shrines × +0.5 = +10 morale once researched", b2fx[1] - b2fx[0] === 10);
check("no shrines, no bonus, even with the Altar", b2fx[2] === b2fx[0]);
check("altar tiers add +0.1 per shrine per tier", b2fx[3] - b2fx[1] === 6, `tier 3 adds +${b2fx[3] - b2fx[1]}`);

// the two roles are genuinely different shapes
// v0.40: the 25% floor is closer now that relief caps at 0.88, so this needs more
// copies than v0.37 did to stay off it and show the two shapes apart.
// v0.52 Part 2.3: 30/40 Taverns -> 130/174 Hearths, the same x4.348 scaling.
const shapes = await Promise.all([
  moraleAt(200, 130, { shrines: 0 }),
  moraleAt(200, 174, { shrines: 0 }),   // +44 hearths, past the relief knee
  moraleAt(200, 130, { shrines: 20, sunAltar: true })
]);
// v0.40 Part 2.2 supersedes the DIRECTION of this comparison, and deliberately so.
// v0.37 asserted 10 more Taverns beat 20 Shrines at pop 200, because relief scaled with
// the crowd without limit. Bounding relief at 0.88 is exactly the change that makes that
// stop being true past saturation: at the equivalent of 30 Taverns relief is already
// 0.855, so more buy +4 while 20 Shrines buy +10. The two roles are different SHAPES —
// the Amphitheatre role is
// multiplicative against the crowd, Shrine is a flat add — and a large settlement now
// genuinely wants both rather than spamming the one that never stops paying.
check("both roles still pay, and neither is a substitute for the other",
  shapes[1] > shapes[0] && shapes[2] > shapes[0],
  `+44 hearths gives +${shapes[1] - shapes[0]}, 20 shrines gives +${shapes[2] - shapes[0]}, at pop 200`);
check("Hearth relief saturates, so Shrines take over as the better buy late",
  (shapes[2] - shapes[0]) > (shapes[1] - shapes[0]));

// and the floor genuinely bites a mismanaged settlement
const floorBites = await moraleAt(200, 0, { shrines: 20, sunAltar: true });
check("a crowded settlement with no Hearths still bottoms out at the floor", floorBites === 25, `${floorBites}%`);

// ===================== the complete target function =====================
const target = await page.evaluate(() => {
  const src = morale.toString().replace(/\/\/[^\n]*/g, "");
  return {
    linearCrowd: /var crowd = Math\.max\(0, S\.pop - 5\) \* 2;/.test(src),
    // v0.40 Part 2.2: the relief limit is 0.88, not 1.0 — crowding must stay uncancellable
    ldrRelief: /var relief = limitedDR\(bfield\("bardsHearth", "crowdRelief"\) \* count\("bardsHearth"\), MORALE_RELIEF_LIMIT\);/.test(src),   // v0.52 Part 2.3: tavern -> bardsHearth
    penaltyApplied: /m -= crowdCharged;/.test(src),
    // v0.39 §9.2 scaled comfort with population; v0.40 Part 2.1 cut the term to the
    // three MAINTAINED comforts, so it reads S.res[r] directly with no jackbox branch
    // SUPERSEDED v0.45, Jerry's directive 3. The quantity ramp was never Kittens'
    // shape: js/village.js updateHappines() adds a flat happinessPerLuxury (10) for
    // each luxury with `value > 0` and has no quantity term at all. The term is now
    // MORALE_PER_LUXURY * luxes.length, and the assertion checks the ramp is GONE.
    luxuryTerm: /MORALE_PER_LUXURY \* luxes\.length/.test(src) &&
                !/Math\.min\(1, S\.res\[r\] \/ luxuryComfort\(\)\)/.test(src),
    shrineTerm: /S\.wtechs && S\.wtechs\.sunAltar/.test(src),
    // v0.40 Part 2.1: poroMoraleBonus is deleted and boxes are LDR-bounded
    poro: !/poroMoraleBonus/.test(src),
    // RE-POINTED v0.58.1, superseded by NOTE 32: the boxes are linear for the first five and
    // go through strictDR — which bites from the first unit and has a true asymptote — after
    // that. `limitedDR` was the wrong primitive here precisely because it is LINEAR below 75%
    // of its limit, so seven boxes paid full freight and the curve only bent at fifteen.
    jack: /var box = 2 \* Math\.min\(5, boxN\) \+ strictDR\(2 \* Math\.max\(0, boxN - 5\), MORALE_BOX_LIMIT\);/.test(src),
    floor: /return Math\.max\(25, Math\.round\(m\)\);/.test(src)
  };
});
check("morale() matches the spec's complete target function line for line",
  Object.values(target).every(Boolean), JSON.stringify(target));

// ===================== A1 — the last two steps above ×3 =====================
const a1 = await page.evaluate(() => {
  const cost = i => TECHS.find(t => t.id === i).cost.knowledge;
  const idx = i => TECHS.findIndex(t => t.id === i);
  const k = TECHS.map(t => t.cost.knowledge || 0).filter(Boolean);
  const steps = []; for (let i = 1; i < k.length; i++) steps.push(+(k[i] / k[i - 1]).toFixed(2));
  return {
    cultivation: cost("cultivation"), songcraft: cost("songcraft"),
    almanacStep: +(cost("cultivation") / cost("almanac")).toFixed(2),
    songcraftStep: +(cost("songcraft") / cost("woodcraft")).toFixed(2),
    logisticsBeforeSongcraft: idx("logistics") < idx("songcraft"),
    printedOrder: TECHS.slice(0, 6).map(t => t.cost.knowledge),
    maxStep: Math.max(...steps),
    // SUPERSEDED v0.45 Part 6: declaration order stopped being ladder order when the
    // ten branch techs were added as their own block at the end of TECHS. They are
    // branches of the DAG, not links in the chain. Sort by cost, which is what "no
    // step in the ladder is above x3" always meant.
    stepsOver3: (() => {
      const k = TECHS.filter(t => t.cost.knowledge).sort((a, b) => a.cost.knowledge - b.cost.knowledge);
      return k.filter((t, i) => i > 0 && t.cost.knowledge / k[i - 1].cost.knowledge > 3.5).map(t => t.id);
    })()
  };
});
// SUPERSEDED v0.46 Part 5. The ladder is re-skewed to Kittens' actual SHAPE: big early
// jumps, flat after. Kittens is calendar 30 -> agriculture 100 (x3.33) -> archery 300
// (x3.0). RR now matches those two exactly. The median and the geometric mean both land
// in band only because of this skew — that is the whole point of the re-skew.
check("Cultivation is 100 — Kittens' agriculture, x3.33 from Almanac", a1.cultivation === 100 && a1.almanacStep === 3.33, `${a1.cultivation} @ ×${a1.almanacStep}`);
// SUPERSEDED v0.47 Part 1: Songcraft is Kittens' `construction` at 1,300, rank 9.
check("Songcraft is 1300 — Kittens' construction at the matching rank", a1.songcraft === 1300, String(a1.songcraft));
check("Expedition Logistics sits before Songcraft", a1.logisticsBeforeSongcraft);
// v0.39 §9.1 supersedes: Mining moves 300 → 360 so it no longer sits below Songcraft's
// 320 — that ×0.94 was the last backwards step in the ladder.
// SUPERSEDED v0.47: declaration order is no longer price order (Scriptorium and Carpentry
// are declared after the Era-3 block). The ladder is asserted cost-sorted in test-v47.
check("the first six DECLARED techs are all real prices", a1.printedOrder.every(x => x > 0), JSON.stringify(a1.printedOrder));
// v0.44 Part 2.5 removes the Sparks wall itself: the whole Era-3 ladder came down to
// Kittens' curve, so the flat ×3 bound is back and there are now ZERO exceptions.
// SUPERSEDED v0.46 Part 5: x3.33 IS Kittens' own calendar -> agriculture step. The
// invariant that survives is that nothing exceeds Kittens' largest early step.
check("no step in the printed ladder is above ×3.5 (Kittens' own largest is ×3.33)",
  a1.stepsOver3.length === 0, JSON.stringify(a1.stepsOver3));

// ===================== sidebar placement =====================
const side = await page.evaluate(() => {
  S.techs = { ritesOfTargon: 1, mining: 1 };
  S.worship = 500; S.seenMax.worship = 500;
  S.jackboxes = 3; S.res.furs = 30; S.seenMax.furs = 30;
  S.res.mana = 50; S.seenMax.mana = 50;
  S.res.stoneSlab = 3; S.seenMax.stoneSlab = 3;
  renderTop(computeRates());
  const html = document.getElementById("resource-col").innerHTML;
  const at = s => html.indexOf(s);
  const loot = at(">Loot<"), crafting = at(">Crafting<");
  const inLoot = name => at(">" + name + "<") > loot && (crafting < 0 || at(">" + name + "<") < crafting);
  const inCrafting = name => crafting >= 0 && at(">" + name + "<") > crafting;
  return {
    jackInLoot: inLoot("Jack in the Box"), jackInCrafting: inCrafting("Jack in the Box"),
    worshipInLoot: inLoot("Worship"), worshipInCrafting: inCrafting("Worship"),
    slabStillCrafting: inCrafting("Stone Slabs")
  };
});
check("Jack in the Box is listed under Loot", side.jackInLoot && !side.jackInCrafting);
check("v0.38: Worship is gone from the sidebar entirely", !side.worshipInCrafting && !side.worshipInLoot);
check("crafted intermediates still live under Crafting", side.slabStillCrafting);

// ===================== regressions =====================
const reg = await page.evaluate(() => {
  const o = {};
  loadFromString(btoa(unescape(encodeURIComponent(JSON.stringify(freshState())))));
  o.altarTierInState = S.altarTier === 0;
  o.saveRT = (() => { S.wtechs.sunAltar = true; S.altarTier = 2; loadFromString(serialize()); return S.wtechs.sunAltar === true && S.altarTier === 2; })();
  loadFromString(btoa(unescape(encodeURIComponent(JSON.stringify(freshState())))));
  S.res.devotion = 80; S.worship = 0; const a0 = S.ascends || 0;
  ascendTargon();
  o.ascentStillFree = S.worship === 80 && S.res.devotion === 0 && S.ascends === a0 + 1;
  // v0.40 names the intermediate so the tooltip can render it; the term is identical
  o.taverRoleIntact = /crowd \* \(1 - relief\)/.test(morale.toString()) && /m -= crowdCharged/.test(morale.toString());
  o.coreFns = [tick, computeRates, computeCaps, morale, ascendTargon, renderAll, renderTop].every(f => typeof f === "function");
  o.noNaNRates = Object.values(computeRates()).every(v => isFinite(v));
  o.noNaNCaps = Object.values(computeCaps()).every(v => isFinite(v));
  o.moraleFinite = [0, 1, 50, 200, 1e6].every(p => { S.pop = p; return isFinite(morale()); });
  S.pop = 0;
  return o;
});
for (const [k, v] of Object.entries(reg)) check("regression: " + k, v === true);

for (const tab of ["settlement", "crafting", "village", "lore", "wilds", "trade", "targon", "champions"]) {
  await page.evaluate(t => {
    S.techs = { almanac: 1, cultivation: 1, woodcraft: 1, logistics: 1, mining: 1, trade: 1, smelting: 1, songcraft: 1, ritesOfTargon: 1, callToArms: 1, masquerade: 1 };
    S.pop = 20; syncRoster(); S.seenMax.knowledge = 999; S.worship = 2000;
    S.buildings.archive = Math.max(1, S.buildings.archive || 0); S.buildings.shelter = Math.max(1, S.buildings.shelter || 0); S.upgrades.keepingTheRolls = true; S.activeTab = t; uiDirty = true; renderAll();
  }, tab);
  await page.waitForTimeout(40);
}
check("all 8 tabs render, no console errors", errors.length === 0, errors.slice(0, 3).join(" | "));

console.log("\n" + pass + " passed, " + fail + " failed");
await browser.close();
suiteEnd(import.meta.url, pass, fail);
process.exit(fail > 0 ? 1 : 0);
