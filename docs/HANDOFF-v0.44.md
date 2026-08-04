# HANDOFF — Runeterra Reclaimed, end of the v0.44 build round

Written for the next builder conversation. Everything here is either **not yet in the
project docs / memory**, or is context you need to operate identically. Read it all
before touching anything.

---

## 1. The role, and the loop

Jerry is building **Runeterra Reclaimed** — a League of Legends–themed incremental/idle
game modelled on **Kittens Game** — as a **single self-contained HTML file**.

There are two Claude instances in this workflow:

- **The analyzer** — a separate conversation. It measures the shipped build, compares it
  against Kittens Game's real source, and returns a formal **BUILDER SPEC vX.YZ**
  markdown document.
- **You (the builder)** — you implement the spec exactly, run the test suites and the
  headless simulator, and write a **BUILD REPORT vX.YZ** back. The analyzer reads that
  report and writes the next spec from it.

Every round arrives from Jerry with the framing **"ensure you action on all items listed
in the spec or I will die."** Take that as: action *every* item, do not silently skip
one, and say plainly which ones you could not satisfy and why.

Jerry also attaches **his own directives** on top of the spec each round, numbered. His
directives **override the spec** where they conflict (e.g. he confirmed ratio 1.6 in
v0.43, ordered the housing change to ship alone, ordered Part 1 and Part 2.5 to ship
together in v0.44). Treat his numbered notes as the highest authority in the round.

### The report is the product

The build report is not a changelog. It is a **measurement document**. What has earned
trust across six rounds:

- Lead with the number that changes the round, not with a list of what you did.
- **Report your own errors first and loudly.** Several rounds have turned on "the
  dominant error was my harness, not the build."
- Give numbers with units and years, in tables, against the spec's stated targets.
- State pass conditions as ✅/❌ honestly. Never soften a ❌.
- When you decline to change something, say so and say why (one-lever discipline).
- Prose voice: plain, direct, a little dry. No hedging, no marketing.

---

## 2. Standing constraints — never violate these

1. **Do NOT rename these functions.** The analyzer's harness calls the code directly:
   `tick`, `computeRates`, `computeCaps`, `morale`, `ascendTargon`, `renderAll`,
   `renderTop`. Also relied on by the sim: `loadFromString`, `serialize`, `freshState`,
   `count`, `buildingCost`, `buildingRatio`, `canAfford`, `buyBuilding`, `buyTech`,
   `craftItem`, `craftCostOf`, `assignJob`, `syncRoster`, `maxPop`, `luxuryComfort`,
   `worshipBonus`, `campYieldMult`, `caravanCount`, `rankOf`, `champPassive`,
   `policyMult`, `policyGlobalBonus`, `drakeBonus`, `limitedDR`, `unlimitedDR`.
2. **Ascent has NO cost, NO cooldown, NO bonus.** It is a pure 1:1 devotion→worship
   conversion. There is a test that greps `ascendTargon.toString()` for the words
   "cooldown" or "cost" and fails if either appears.
3. **Ground every design claim in the real Kittens Game source** at
   `github.com/nuclear-unicorn/kittensgame`, never in recollection. See §8 for the
   specific files and line numbers already used.
4. **One lever per measurement pass.** Do not change two coupled levers in the same
   round. If the spec asks for two and they are coupled, say so and ask, or ship one and
   report the other as deliberately withheld.
5. **The game is ONE file.** No build step, no external assets, no `localStorage`
   dependency beyond what already exists.

---

## 3. Where everything lives

| Path | What |
|---|---|
| `/home/claude/work/site/index.html` | **THE game.** The only real deliverable. ~4,028 lines, ~244 KB. Footer currently reads **v0.44**. |
| `/home/claude/work/simcore.mjs` | Headless simulator core. Exports `openGame(file)` and `runSim(page, years, seed)`. |
| `/home/claude/work/pacing.mjs` | Milestones + morale + luxury + Convergence report. `node pacing.mjs --years 900 --seed 1` |
| `/home/claude/work/objectives.mjs` | "is there always something to buy" check. |
| `/home/claude/work/luxdiag.mjs`, `moralecmp.mjs`, `measure-furs.mjs`, `diag-v37.mjs`, `diag-v39.mjs` | Older one-off diagnostics. |
| `/home/claude/work/diag-v44.mjs` | **New this round.** Dumps the Part 4 snapshots (multiplier product per category, science building counts) at Sparks / Hexcore / Icathia. |
| `/home/claude/work/test-v*.mjs` | Playwright assertion suites. |
| `/home/claude/work/BUILD-REPORT-v0.4*.md` | Prior reports. v0.44's is also in the project as `claude/rr-build-report-v044.md`. |

**Playwright:** always launch with `executablePath: "/opt/pw-browsers/chromium"` and a
`.catch(() => chromium.launch())` fallback. Never run `playwright install`.

**Bash gotcha that has bitten repeatedly:** `cd site && …` when already in `site` fails
silently and the edit does not apply. Use absolute paths, and **verify every batch edit
with `grep -c` or a syntax check afterwards**:

```bash
node -e "const fs=require('fs');const m=fs.readFileSync('/home/claude/work/site/index.html','utf8').match(/<script>([\s\S]*)<\/script>/);new Function(m[1]);console.log('syntax OK')"
```

---

## 4. The test suites — current state

**Standard run set: 12 suites, 610 assertions, 0 failures at v0.44.**

| Suite | Assertions |
|---|---|
| test-v32 | 64 |
| test-v34 | 41 |
| test-v35 | 44 |
| test-v36 | 44 |
| test-v37 | 38 |
| test-v38 | 34 |
| test-v39 | 70 |
| test-v40 | 59 |
| test-v41 | 62 |
| test-v42 | 51 |
| test-v43 | 40 |
| **test-v44** | **63** |

`test-v2 … test-v31` also exist on disk and were patched for the v0.44 tab gates, but
they are **not** part of the standard run set and were not re-verified this round.

Run them with:

```bash
cd /home/claude/work && for f in test-v32 test-v34 test-v35 test-v36 test-v37 test-v38 \
  test-v39 test-v40 test-v41 test-v42 test-v43 test-v44; do \
  echo "--- $f"; node $f.mjs 2>&1 | tail -2; done
```

### Test-harness changes made this round that you must know about

The v0.44 tab gates broke ~10 suites that set `S.activeTab` without the prerequisite
building. **Every `test-v*.mjs` was patched** so that:

- `S.activeTab = "lore"` is preceded by `S.buildings.archive = Math.max(1, S.buildings.archive || 0);`
- `S.activeTab = "village"` is preceded by `S.buildings.shelter = …` **and** `S.upgrades.keepingTheRolls = true;`
- the all-tabs loops (`S.activeTab = t;` / `= tab;`) set both buildings and the upgrade.

If you add a new tab gate, you must patch the suites the same way. `renderAll()` already
falls back to `"settlement"` when the active tab is not visible, so a missing
prerequisite shows as "0 cards found", not a crash.

### Assertions superseded this round (with a comment explaining why, in place)

- **v34** — the 1.25-ratio band now admits `hexdraulicPlant` (amplifier of a global
  multiplier counts as the same category).
- **v36** — Era 1→3 costs re-pointed at the Part 2.5 ladder; the ×1.5–2.5 band and the
  "deliberate boundary" exemption were **both deleted** and replaced with "every step
  rises and none is a cliff (×1.0–2.5)". A step below ×1.5 is now the target, not a defect.
- **v37** — "exactly one step above ×3" → "no step above ×3".
- **v39** — Hall of Heroes 120 → 250; Era-3 ladder re-priced.
- **v40 / v41 / v42** — the three "Era-3 prices UNCHANGED, one lever per pass" assertions
  became "prices sit on the v0.44 Part 2.5 ladder". Scholarship measurements moved from
  `computeCaps().knowledge` to `computeCaps().culture` (setups now need
  `bardsHearth: 5` and `S.res.tome = 0`). v42's `era3` filter threshold moved
  `k >= 200000` → `k >= 20000`.
- **v43** — Renown Masonry assertion → √Masonry; recruit ratio 1.6 → 1.5; ladder and
  cumulative (45,395 → 28,333); the Scholarship-drift invariant measures culture now.

---

## 5. The simulator — how it works and what I changed

`runSim` virtualises `Date.now`, seeds a deterministic xorshift `Math.random`, stubs the
render layer (`renderTop`, `renderAll`, `renderLog`, `updateAffordability`,
`showCostTooltip`, `hideTooltip`, `snapshotUndo`, `renderUndoToast`), loads a fresh
state, and drives a greedy player through the game's own `tick()`. 4,000 ticks = 1
game-year. **A 900-year run takes ~260 s wall.** A 250-year run ~200 s.

### Rules inside the bot you should not casually change

These were each the fix for a measured defect. Read the inline comments before touching.

- **Job weights** (the single largest historical error source). At the housing wall or
  when knowledge is pinned: woodcutter 0.26 / miner 0.26 / loremaster 0.14. Otherwise
  loremaster 0.30 / woodcutter 0.18 / miner 0.18. The old weights (loremaster 0.32) put
  8 loremasters and 3 miners at pop 28 and stalled every run.
- **Surplus-only trading**, bounded craft batching (max 25, never more than half of any
  raw input in one go), morale-driven tavern rule, `canTrain`-aware champion levelling
  with leader rotation to whoever is closest to their next threshold.
- **Craft only toward a building you are close to buying** — unbounded intermediate
  chasing converted all ore into Stone Slabs that were never finished.
- **A "save for housing" rule was tried and reverted** — it deadlocked the run at 0 techs
  / pop 10.

### What I added to `simcore.mjs` this round (NOT in any project doc)

1. **A `snapshot()` function and a `snaps` return field.** `mark()` now captures a full
   state snapshot the instant `sparks`, `hexcore` or `icathia` is first researched:
   science building counts, amplifier counts (`foundries`, `plants`, `reactors`,
   `swRatio`), all eight global categories, and the per-line multiplier breakdown for ore
   and timber with a `lineProduct` and a `total`. This is what produced the §0 table of
   the v0.44 report. **Keep it** — the analyzer will want it again.
   *Caveat:* it mirrors `computeRates()`'s maths by hand. If you change how any category
   is computed in `index.html`, you must mirror the change in `snapshot()` or the report
   will silently lie.
2. **A save-for-it rule for the Part 1 industrial tier**, placed just before the storage
   rule:
   ```js
   if (S.techs.hexcore) {
     if (tryBuild("hextechFoundry")) return;
     if (S.techs.hexdraulics && count("hextechFoundry") >= 3 && tryBuild("hexdraulicPlant")) return;
     if (S.techs.greyReclamation && tryBuild("arcaneReactor")) return;
   }
   ```
   Without it the bot built **0 Foundries and 0 Plants** across a full run to Icathia,
   because the Chembarrel at 160 alloy kept eating the alloy Hexgear needs. With it:
   2 Foundries, 0 Plants, 7 Reactors. **The remaining shortfall is time, not priority.**
3. **Build order** now includes `hexdraulicPlant`, `arcaneReactor` and `bloomery`, with
   the industrial tier moved ahead of `chembarrel`.

---

## 6. Measurements from this round that are NOT in the build report

The build report covers the headline findings. These are additional numbers I am holding
that the next round will want.

### 6a. Morale has become a failing pass condition

From the 900-year seed-1 run:

```
MORALE  min 25  max 124
  in the 90-140 band after y60: 2%    (target >=80%)   ❌
  below 90 before y50:          44%   (target >0%)     ✅
  above 140 after Era 3 entry:  0%    (target ~0%)     ✅
  at 100+ wanderers: min 25 avg 33.2 max 106
FINAL pop 477, maxPop 477, morale 31, taverns 56
```

Morale sits at **31** with **477 wanderers** and 56 Taverns. It is a ×0.66 production
divisor at Icathia and ×0.31 by y900. **This is a real, unreported regression** — the
v0.43 housing ladder plus v0.44's income correction let population run far past what the
Tavern crowd-relief line was tuned for. It did not make the v0.44 report's headline
because §0 was larger, but it should be in the next spec.

### 6b. Luxury balance has drifted out of band

Target 0.5×–3.0× of `luxuryComfort()`, dry <5%. From the same run:

| | v0.42 | v0.44 |
|---|---|---|
| furs | 0.81× | **0.18×** ❌ |
| mushrooms | 3.92× | **3.60×** ❌ |
| plumes | 3.95× | 1.93× ✅ |

Furs have fallen well below the band; mushrooms remain above it. Dry percentage is 0% for
all three, so nothing starves — but furs are now the scarce comfort where they used to be
the balanced one. **Unreported.** Likely a consequence of Parchment/Tome demand plus the
camp-yield line, but I did not isolate it.

### 6c. Convergence, both ends

- **0.91% at Sparks** (y95.1) against the 5–8% target — far below.
- **119.6% at end of a 900-year run** (Worship 144,247,182, ascends 400) — far above.

The √ curve assumes Era 3 spans a thousand-plus game-years. It spans 86. The stripe is
still **20,000** and was deliberately **not** re-derived, per the spec's own instruction
("Do not set the stripe in the same pass as Part 1"). Note the spec's procedure needs
`W₁` = median Worship at Sparks across ≥4 seeds; I only have seed 1.

### 6d. Two pacing runs, for reference

| | 900y run (pre-harness-tweak) | 250y run (post-tweak) |
|---|---|---|
| Sparks | y95.1 | y95.1 |
| Chemtech | y99.9 | y99.9 |
| Hexcore | y105.7 | y105.7 |
| Deep Works | y171.9 | y171.9 |
| **Icathia** | **y178.6** | **y181.4** |
| First champion | y27.1 | y27.1 |
| pop 130 | y164.3 | y164.3 |

Everything before Deep Works is identical, which is the determinism working. Only the
industrial-tier priority rule moved the tail.

### 6e. Only seed 1 was measured this round

v0.42 and v0.43 used 2–4 seeds. **v0.44's numbers are all seed 1.** Multi-seed
confirmation is outstanding and should be the first thing the next round does before
acting on any of it.

---

## 7. The v0.44 build — exactly what is in `index.html` now

### Shipped this round

- **Era-3 + bridge tech re-pricing (Part 2.5)** — 18 techs. Sparks 200,000→**20,000**,
  chemtech 450,000→**50,000**, hexcore 1,000,000→**75,000**, deepWorks 2,200,000→**100,000**,
  icathia 5,000,000→**135,000**; hexdraulics 28,000, sumpEcology 35,000, progressDay 42,000,
  chemBaronAccords 58,000, gloriousEvolution 65,000, atlasGauntlets 85,000, hexgate 92,000,
  greyReclamation 112,000, voidglassOptics 120,000, watchersBelow 128,000;
  championsRegimen 15,500, deepCartography 17,000, refinedMetallurgy 18,500.
- **`SCHOLAR_CAPS = { culture: 1, devotion: 1 }`** hoisted to module scope next to
  `SCHOLAR_LINE`, and `scholarDesc()` now generates its prose from it via
  `scholarCapNames()`. **This is load-bearing** — it is the v0.43 Part 0 anti-drift
  invariant, and moving knowledge off the line would otherwise have left every
  Scholarship tooltip promising a multiplier that no longer applies.
- **The amplifier pair** in `computeRates()`:
  ```js
  var amp = (b.id === "hextechFoundry") ? (1 + 0.15 * count("hexdraulicPlant")) : 1;
  monumentSum += b.globalBoost * count(b.id) * amp;
  ```
- **Two new buildings**, in `BUILDINGS`, group `"Zaun"`: `hexdraulicPlant`
  (ratio 1.25, tech `hexdraulics`, `foundryBoost: 0.15`, cost hexgear 120 / plating 200 /
  gold 4000) and `arcaneReactor` (ratio 1.15, tech `greyReclamation`,
  `globalBoost: 0.04`, cost hexcore 4 / hexcrete 8 / focusedHex 6).
  ⚠️ `foundryBoost` is **descriptive only** — the actual amplification is hard-coded on
  `count("hexdraulicPlant")` in `computeRates()`. If you add a second amplifier, generalise
  it rather than adding a second hard-coded branch.
- **A new per-resource multiplicative category** (`resRatio`) applied after the global
  block: `sumpVentilation` (+25% ore), `seasonedTimberworks` (+25% timber),
  `hexresonance` (+25% mana). Note the breakdown-row guard —
  `if (typeof e.amt === "number")` — because by that point `bd` may contain a
  `{label, mult}` row with no `amt`; multiplying it produced "Global bonuses: NaN" once.
- **`CHAMP_RUNG_GATE`** + `RECRUIT_RATIO` 1.6 → **1.5**. The gate **adds** to a
  champion's signature cost; it never replaces it (rung 6 is Swain, whose 700 culture
  becomes 900 — that is correct, and there is a test comment saying so).
- **`caps.renown *= Math.sqrt(masonryMult)`** inside the storage loop; Hall of Heroes
  `caps.renown` 120 → **250**.
- **Gameplay note 1** — `maxPop()` base `2` → `0`. Bootstrap still works:
  Channel Mana → Farmstead (15 mana, autoprod) → Transmute → Shelter (8 timber).
- **Gameplay notes 2 & 4** — `TABS` gates: village `count("shelter") > 0`, lore
  `count("archive") > 0`. `renderAll()`'s existing fallback to `"settlement"` covers the
  stranded-tab case.
- **Gameplay note 3** — `keepingTheRolls` upgrade (tech `songcraft`, cost
  `{ culture: 60, knowledge: 900 }`). `renderCensus()` returns a "here is how to get it"
  panel until it is bought. Ranks and traits still apply mechanically — it is a
  **visibility** unlock only.
- **Gameplay note 5** — `resUnlocked(r)` (`seenMax > 0` and not hidden) filters the
  `EVENTS` pool; `eventAmount()` bounds every gift to
  `[cap × EVENT_CAP_FLOOR (0.01), cap × EVENT_CAP_FRACTION (0.05)]`.
- **Gameplay note 6** — `JACK_POSITIVE_RATE = 0.70`, `JACK_TRICK_FRACTION = 0.02`
  (was 0.10), `fireTreat()`, a `TREATS` table of six lines, `jackPool()`. The boxes are
  the one deliberate exception to note 5 — they may hand out a resource never seen.

### Deliberately NOT done

- **The Convergence stripe** is untouched at 20,000, per Part 3's explicit instruction.
- **`buildingJobBoost` is untouched.** It is the largest lever in the game (×23.05 on ore
  at Icathia) and belongs in a spec, not in a build. This is the one-lever discipline.

---

## 8. Kittens Game source facts already established — reuse, don't re-derive

All from `github.com/nuclear-unicorn/kittensgame`.

- **Two scaling laws.** Costs are geometric: `price = base × ratio^n`. Effects are
  **additive per copy within a category, never compounding**. Exponential growth comes
  from ~13 **independent multiplicative categories**, each of the form
  `(1 + Σ additive terms)`.
- **`getLimitedDR(x, limit)`** — free below 0.75×limit, then hyperbolic, never reaches
  the limit. **RR's `limitedDR` is a DIFFERENT curve** and the analyzer accepted this
  divergence in v0.44 Part 0. Consequence: the same Σ = 1.20 against ratioBase 1.20 lands
  at 1.15 in RR where the analyzer predicted 1.28. Don't "fix" it.
- **`getUnlimitedDR(v, stripe)` = `(√(1 + 8v/s) − 1) / 2`.**
- **Compendium clamp** (`workshop.js:2785`):
  `scienceMax = min(compendia × 10, building cap)` — compendiums can at most **double**
  the building cap. RR implements this on the Morellonomicon.
- **The amplifier pair** (`buildings.js`, Magneto + Steamworks):
  `swRatio = 1 + 0.15 × steamworks; perTick *= 1 + (magnetoRatio × swRatio)`. **The only
  multiplicative pairing in Kittens.**
- **Solar Revolution** (`religion.js:1548`):
  `getLimitedDR(getUnlimitedDR(faith, 1000) / 100, 10 + solarRevolutionLimit)`.
  A first-run Kittens player sees **4–15%**.
- **`getResourcePerTick`** — `game.js:3390–3540`.
- **Craft yield DIVIDES effective cost.** One craft action spends the recipe and yields
  `craftYield()` **units**. 200 ore → 4.375 slabs = **45.7 ore/slab**, not 200. This was
  the single most consequential misunderstanding in the project's history (v0.41 §5 was
  up to 5× too pessimistic because of it). Never quote a nominal recipe cost as an
  effective cost.
- Kittens' ladder: **61 science-costed techs, median step ×1.12, largest ×5.0**.
  RR is at 35 techs, median ×1.25, largest ×2.50.
- Kittens' end-of-tree science stock: **30 Archives / 30 Academies / 25 Observatories /
  13 Hexcore-Lab-equivalents** — this is the target Jerry cares most about.

---

## 9. Errors found across the project — do not repeat them

These are the ones that cost whole rounds.

1. **The harness read `S.res.worship`** where v0.38 moved it to `S.worship`. No worship
   tech was purchasable in any run from v0.38 on. Fixing it raised population 59→149 at
   y200 and invalidated every Worship figure in the v0.38/v0.39 reports.
2. **Camp ordering starved two of three luxury camps** once all cost 100 vigor — Wolves
   ate everything. Fixed by hunting the scarcest comfort first.
3. **The v0.41 trade revamp removed every source of Hextech Crystals** while 17 things
   were crystal-priced. Runs dead-ended at 15 techs permanently. Fixed with a Krugs faucet.
4. **My own v0.41 §5 finding was wrong** (the craft-yield error above). I confirmed the
   analyzer's correction with a measurement and said so in the report.
5. **My harness job weights were the dominant pacing error** in v0.41–v0.42. Fixing them
   moved Rites of Targon y267 → y41.9 and peak population 29 → 113.
6. **A save migration deleted `cc.xp`** unconditionally; with XP live again it would have
   wiped every champion's experience on first reload. Now fires only on the genuinely old
   shape (`xp` present, `lvl` absent).
7. **`slotAvailable` returned truthy numbers/undefined** instead of booleans.
8. **A diagnostic read `e.amt` on a breakdown row carrying `mult`** → "Global bonuses:
   NaN". My script, not a game bug — but the same trap is live in `computeRates()`, which
   is why the new `resRatio` block guards with `typeof e.amt === "number"`.
9. **Both bots stall the same way** — greedy first-affordable-wins in a game that now
   requires saving. When the analyzer's bot and mine stall identically, that is **one
   error, not two confirmations**. Say so explicitly in the report.

---

## 10. The open question the next round turns on

The v0.44 report's §0 finding, restated so it cannot be lost:

> Part 1 of the v0.44 spec assumed RR's multiplier stack was ≈×53 against Kittens' ≈×870
> and asked for three new categories to close a 16× gap. **Measured, the ore stack at
> Icathia is ×252.16, and ×23.05 of that — 91% — comes from `buildingJobBoost`, an
> unbounded additive category the spec's table does not list.** Mine +20%, Quarry +35%,
> Augment Chamber +15%, flat per copy, no ceiling: +2,205% at Icathia. Every other
> category in the game, including everything Part 1 added, multiplies to ×10.9.
> Timber gets ×3.90 from the same category because it has one jobBoost building where ore
> has three.

My recommendation to the analyzer, in order:

1. **Bound `buildingJobBoost` with `limitedDR`** — it is the last unbounded additive stack
   in RR. Camp yields, craft yields and the `boosts` stacks are all already bounded.
2. **Level the ore/timber asymmetry** — three jobBoost buildings vs one is an accident,
   not a design.
3. **Then** re-measure Era 3's length before touching prices again. With ore bounded, the
   re-priced ladder may be close to right rather than ~10× fast.
4. Separately: **morale at 400+ population** (§6a) and **furs at 0.18× comfort** (§6b).

Also outstanding and explicitly deferred: **the Convergence stripe** (needs median
Worship at Sparks across ≥4 seeds), and **multi-seed confirmation of everything in
v0.44** (only seed 1 was run).

---

## 11. Project docs and memory

The Claude project ("Personal") holds the durable design docs — read these before
starting:

- `claude/rr-design-spec.md`, `claude/rr-current-state.md`, `claude/rr-gameplay-notes.md`
- `claude/kittens-game-reference.md`
- `claude/rr-analyzer-status.md`, and the analyzer specs `rr-analyzer-v039…v044-spec.md`
- `claude/rr-vs-kittens-journey-v043.md`
- `rr_game_plan.md`, `era3_regional_crafting_spec_2.md`, `era3_4_bridge_spec_1.md`
- **`claude/rr-build-report-v044.md`** — written this round.

Persistent memory holds `/areas/lol-idle-game.md` (at its 32,768-byte cap) and
`/areas/lol-idle-game-build-log.md` (~31 KB). Read both with `memory_read` at the start
of the next session. **Note:** neither has been updated with the §6 measurements in this
document — that is why this handoff exists. `rr-current-state.md` was also **not**
refreshed for v0.44; the build report supersedes it.

---

## 12. Eras, for orientation

| Era | Content |
|---|---|
| 0 | Rift Camp — mana, transmute, first shelters |
| 1 | Mount Targon — Devotion, Ascent, Worship, Convergence |
| 2 | Champions — Renown, recruitment ladder, levelling |
| 3 | Piltover & Zaun — autoprod raws, Hextech chains, the industrial tier |
| bridge | Void / Rune Shards |
| 4 | World Rune reset — **not built** |

Game clock: `TICK_MS = 200` (5 ticks/s), 4,000 ticks = 1 game-year = 13 m 20 s real time.
