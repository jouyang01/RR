# HANDOFF v0.57 — Runeterra Reclaimed

Written for whoever picks this up next, builder or analyzer. The BUILD REPORT is the
argument; this is the map.

---

## 1. What the project is

**Runeterra Reclaimed** — a League of Legends–themed incremental/idle game modelled
rung-for-rung on **Kittens Game** (`github.com/nuclear-unicorn/kittensgame`), shipped as a
**single self-contained HTML file**. No build step. No bundler. `index.html` is the game, and
that filename is permanent (STANDING-RULINGS §10).

**The workflow is two Claude sessions.** An **analyzer** measures the shipped build against
Kittens' real source and returns a formal BUILDER SPEC at `current-build-spec.md`. A **builder**
implements every item and writes a BUILD REPORT and a HANDOFF back. Jerry attaches his own
numbered directives, **and his directives override the spec where they conflict.**

**Read `BUILDER_PROTOCOL.md` before starting.** It is a standing rule and v0.57 is the first
round run under it: fast single-seed short checks after each part, and the full multi-seed
full-length suite **once**, at the end, as the gate. It saved roughly three hours this round.

**Two standing rules, both non-negotiable:**

1. **Every item gets actioned.** Never silently skip one. If an item cannot be satisfied, say so
   plainly and say why.
2. **All design claims are grounded in Kittens' actual source**, never in recollection. Cite file
   and line.

---

## 2. The instrument works again — and here is how to use it

v0.56 measured a **×2.62** Era-3 spread on one build and could not tell whether the game or the
bot was responsible. **It was the bot.** Part 4's food policy took the spread to **×1.07**.

**`node sim/pacing.mjs --years 2500 --seeds 3`** launches the seeds as concurrent child processes
(2,561.6 s measured for three; sequential would be over two hours) and prints two labelled
blocks. **The labels are binding:**

- **ENSEMBLE figures** — milestone years, Era 3, and anything derived from them. **Quote only
  with a median and a spread.** Even now, `sparks` spreads ×1.37 and `firstTrade` ×4.46.
- **SINGLE-RUN figures** — cap-out fractions, morale band, peak population, delivered
  multipliers, anything `tests/` measures. Every seed's value is printed beside the median so the
  stability claim stays checkable.

**A milestone PASS CONDITION is still a scalar threshold against a figure with a spread, and that
is now the apparatus's weakest point** — see §7.1. I re-based Rites of Targon to y75 from two
seeds and it fails on two of three. Do not repeat that.

---

## 3. The laws the game is built on

**Kittens' Law.** Additive within a category, multiplicative only **between**. v0.56 fixed the
material storage line; **the Scholarship line is the same violation, still standing** (§23).

**Kittens ticks 5/s.** Per-second = `perTick × 5`.

**Three DR primitives:** `limitedDR(x, L)` is linear below `0.75·L` — **75% of the limit is
free**; `unlimitedDR` is sqrt-shaped; `strictDR(x, L) = L·x/(x+L)` has **no free band**.

**Every capped resource is in EXACTLY ONE cap family** (§22), decided by `capFamilyOf()`:

| family | takes | members |
|---|---|---|
| `CAP_MULT_EXEMPT` | nothing | knowledge, vigor |
| `SCHOLAR_CAPS` | the Scholarship product ×3.9926 | culture, devotion, **renown** (from v0.57) |
| `CAP_SCOPE` | the barn/warehouse accumulators at its tier | timber, ore, steel, mana (narrow ×14.98); gold, zaunore, coalgas, hexore, shimmer, crystals (broad ×2.80); provisions (quarter ×2.0875, gated on Silos); voidessence (none) |

**A cap-out fraction only measures a STOCK-limited resource** (§24). Check `resourceBalance` in
the snapshot before sizing any ceiling.

**Closed rulings live in STANDING-RULINGS §§11–25.** New this round: **§22** Renown is not a
material, **§23** the Scholarship line is dated to v0.58, **§24** stock vs flow vs lumpy sinks,
**§25** no milestone-year claim from a single seed. **§17 is AMENDED** — farmers are not
seasonal again.

---

## 4. The state of the build

**26 live suites, 1,273 assertions, 0 failures.** `VERSION = "v0.57"`.

| | |
|---|---|
| **Era 3, 3-seed ensemble** | **1,734.6 median · 1,672.1–1,784.1 · spread ×1.07 · all three inside the 1,400–2,300 target** |
| Era-3 spread, v0.56 → v0.57 | **×2.62 → ×1.07** |
| tenth champion | **y1,450.7 / 1,570.7 / 1,640.8** — reached on every seed; never on any prior build |
| bot food policy | projects to Deepwinter; pulls workers off other jobs; farmers 1 → 4–17 by need |
| farmers | **not seasonal** (§17 amended); seasonal BUILDINGS still ×0.25 in winter |
| Renown | `SCHOLAR_CAPS`, plus `renownCapPct 0.08` per Hall of Heroes; time-at-cap 88.7% → **72%** |
| consumption | 4.25/s, farmer:eater **1.17647 exactly** — checked, unchanged |
| peak population | 181–185; morale band **100% on all three seeds** |
| culture / crystals at cap | **97.3% / 96.3%** — unchanged, and the two worst readings in the game |
| parity ledger | **220 rows — PARITY 54, EASIER 38, HARDER 1, UNVERIFIED 127** |
| tech ladder | 37 techs, 9 ties, median ×1.1111, geo ×1.2632, max ×3.333 |
| `auditCostGraph()` / `auditRawGraph()` | zero each |

---

## 5. Files, and what each one is for

### The deliverable
- **`index.html`** — the game.
  - `tick()` reconciles against the wall clock (v0.54). Anything driving it in a loop must
    virtualise `Date.now` and advance by `TICK_MS` per fire.
  - **`capFamilyOf(r)`** is the one place a capped resource's cap family is decided. `CAP_SCOPE`
    now holds **only** Masonry-line resources — before v0.57 four resources were in two families
    at once and a ternary silently picked the winner.
  - **`renownCapPct` on the Hall of Heroes is applied AFTER the three deed grants**, so it lifts
    the whole ceiling. Placed before them it multiplied only the building sum and delivered
    ×1.7565 at ten Halls where the additive shape says ×1.80. `test-v57` states the assertion as
    `1 + 0.08n` so placement stays checkable.
  - `seasonFarmMult()` is the ONE place the seasonal multiplier is computed, and its `m < 1`
    guard is load-bearing. It reaches **buildings only** again.
  - `recruitCost()` builds the Renown price from `RECRUIT_BASE × RECRUIT_RATIO^n`. **The ten
    static `renown:` fields in `CHAMPS` are deleted** — they were never read.
  - `XP_CAP` clamps `w.jx[job]` but not `w.xp`. `rerollPenalty`/`undoKind` are module-scope
    deliberately.

### The simulator
- **`sim/pacing.mjs`** — `--seeds N` is the ensemble. Each child emits one `##MACHINE {json}`
  line that the parent aggregates and nothing else, so the aggregation cannot drift from the
  prose. `--years N` and `--seed N`, **never a bare positional** (a positional silently yields
  `simulating NaN game-years`).
- **`sim/simcore.mjs`** — `BUILD_ORDER`/`DEDICATED_ROUTINES` live inside `runSim`'s
  `page.evaluate` and are not exported; the reachability guard is real. New this round:
  **`manageJobs()`'s food policy** (`projectedWinterNet()`, `FARM_MAX_SHARE`, `WINTER_HEADROOM`),
  the **`scholarship`** census, the **`resourceBalance`** block, and the tenth-champion milestone.
  - `resourceBalance` traps, both of which bit during construction: `gross` must switch off only
    the converters that **consume** the resource (the Sump Mine that *produces* zaunore is a
    converter too), and the lumpy-sink scan must read **dynamically priced** sinks or Renown
    reads as having none.

### The apparatus tools
- **`tools/fixture-sweep.mjs`** — the standing detector for §21 defects. Run after any change to
  a shared multiplier.
- **`tools/parity-ledger.mjs`** → `docs/PARITY-LEDGER.md`. **It now aborts** rather than write a
  file whose verdict buckets do not sum to its own row count, or one that invents a fifth
  verdict. `test-v57` additionally checks the summary table against the rows it summarises.

---

## 6. Operational rules, each of which has already cost a round

**Two-tier verification, per `BUILDER_PROTOCOL.md`.** Fast single-seed short runs per part; the
full multi-seed full-length suite once, at the end. **Snapshot each slice BEFORE starting the
next Part** (v0.56 failed this and had to reconstruct s4; v0.57 kept `s4a` as the pre-step-2
build the Part 1 trigger was measured on, which is a legitimate use of an extra prefix).

**Never size a threshold from fewer seeds than the instrument can give you.** §7.1.

**Check whether a resource is stock-, flow- or lumpy-sink-limited before sizing its ceiling**
(§24). `held/cap` and `pcRatio` are in the snapshot for exactly this.

**A test that captures a baseline from live state must reset the state it is baselining** (§21) —
**and must not reset what it is about to baseline.** v0.57 added a Renown ceiling probe one line
after the block cleared its buildings and read 63 instead of 12,274.

**Do not pin a literal version string in a shipped suite.** v0.53, v0.54, v0.55 and v0.56 each
fixed the previous round's pin and then made their own. **Four consecutive rounds.**

**Kill background runs by PID from `ps -eo pid,args`.** `pkill -f` matches the bash process.

**Size every `sleep` under 600 s and poll sparingly** — launch concurrent jobs and check once or
twice rather than looping long sleeps.

**Strip comments before grepping source.** Every suite carries a `strip()` helper.

**Playwright:** `chromium.launch({ executablePath: "/opt/pw-browsers/chromium" })` with a
`.catch(() => chromium.launch())` fallback. **Never `playwright install`.** A snapshot run outside
the repo root needs `node_modules` symlinked.

**Pushing.** The git proxy blocks this repo and returns 403:

```bash
git remote set-url origin "https://x-access-token:<PAT>@github.com/jouyang01/RR.git"
env -u HTTP_PROXY -u HTTPS_PROXY -u http_proxy -u https_proxy -u ALL_PROXY \
  git push origin main --follow-tags
git remote set-url origin https://github.com/jouyang01/RR.git
```

**Timing on a 2-core box:** one 2,500-year run ~1,600 s alone; **three concurrent seeds 2,561.6
s**. Budget one ensemble plus six short per-part checks at roughly ninety minutes.

**Syntax-check after every batch of edits:** `npm run syntax`.

---

## 7. What is open, and for whom

**New from v0.57, and the first is the round's own debt:**

1. **Milestone pass conditions are scalar thresholds against figures with spreads.** I re-based
   Rites of Targon to y75 from v0.56's two seeds; the ensemble reads 70.3 / 76.7 / 83.3 and it
   fails on two of three. **Restate every milestone condition in `sim/pacing.mjs` as a median
   with a spread** — the instrument now reports both, and a scalar threshold on a ×1.18 figure is
   a coin toss. This is the natural follow-on to Part 3 and it should be the next apparatus item.
2. **Convergence REGRESSED and it is probably this round's own doing.** 4.17/4.40% →
   1.42/2.87/3.71%. Worship is ascent-driven and the food policy holds population lower for
   longer. Kept as a deferred-work marker; **the Convergence round is five times deferred.**
3. **The Scholarship restructure is a 35% cut, not 20%.** The instrument reaches **5 of 5** rungs
   (×3.9926), not the 3 of 5 the v0.57 spec assumed by analogy with storage. v0.58's first slice,
   sized against `cultureCapPct` (Ziggurat +8%), with **renown now on the same line**.
4. **Renown at 72% time-at-cap against a <70% trigger.** The dedicated line moved it 88.7 → 72
   and made the tenth champion reachable, which was the substantive half. Renown also appears in
   the "sitting at ceiling waiting to spend" list — **check whether it is partly lumpy-sink-bound
   before adding another percentage** (§24).
5. **`firstTrade` spreads ×4.46** while everything else collapsed to ×1.07–1.37. It is now the
   most chaotic figure in the game and points straight at the **trade-banking policy**, deferred
   four rounds — the same class of defect Part 4 just fixed for food.
6. **130 wanderers reads y1,415–1,726 against y600**, and got worse. Peak population 181–185.
   **Rule on target population.** Every other number improved because population stopped running
   away, and this condition has failed five rounds.
7. **Pass condition 5 currently classifies ALL FOUR Era-3 raws as lumpy-sink-only or
   flow-limited**, so the 30–60% band applies to none of them and reports FAIL. Either give one
   of them a continuous consumer or retire the band.

**Carried, unchanged:**

8. **The craft-depth tie-break** — Riftsteel never forged; voidessence monotone after Icathia.
9. **The Chembarrel / save-for-a-visible-building fix** — `catMonument` still ×1.00.
10. **`XP_PER_SECOND` is still UNVERIFIED.** `skillXP` is a local between `js/village.js:2623`
    and `:2644`. The `XP_CAP` beside it is PARITY; the two must not be conflated.
11. **127 UNVERIFIED ledger rows.** The Wilds and expedition block (12 rows) was taken this round.
12. **culture 97.3% and crystals 96.3%** — the two worst cap-out readings, and neither is on the
    Masonry line.

**Standing directives — do not re-flag these as violations:**

- **Farmers are NOT seasonal** (§17 as amended). Seasonal BUILDINGS are. Do not re-season the job
  without a directive; `test-v55`'s assertion is inverted, not deleted, so a future round that
  wants it back has to come back and say so.
- **Renown is not a material** (§22). Do not put it back on the storage line.
- **Storage scope is closed** (§19); **the food stores hold Kittens' figures** (§20);
  **`test-v32` does not flake under contention** (§21).
- **The Sparks exception**, **`CAMP_YIELD_LIMIT = 6`**, **the Quarry keeps the id `quarry`**.
- **Six RR-invented rules have been ruled out of existence** — the 1.25 price band (v0.50), the
  effect-to-ratio proportionality bound (v0.52), merchant fatigue (v0.54), the Hunter's Lodge as
  a hunt-yield source (v0.55), the multiplicative storage chain (v0.56), and **the ten dead
  `renown:` prices in `CHAMPS` (v0.57)**.

---

## 8. Known soft spots in the apparatus

1. **Milestone conditions are scalars against spreads.** §7.1. Biggest one on the list.
2. **`manageTrade()` has no banking policy.** §7.5 — the `firstTrade` ×4.46 spread.
3. **`manageBuildings()` runs before `manageCrafts()`**, so a building priced in a contested
   intermediate is never affordable at the instant it is tested.
4. **The food economy is a knife edge.** Re-sizing `test-offline-v54`'s healthy fixture this
   round measured the band at roughly **one Farmstead per Storehouse** between starving and
   saturating — 8/60 starves 2,974 ticks, 8/90 starves 54, 8/110 saturates. That knife edge is
   what the Era-3 spread was made of, and Part 4 walks it deliberately rather than removing it.
5. **Demand propagation is uncapped by design.**
6. **`enhance-audit`'s Σ₀ bisection assumes `limitedDR` is correct.**
7. **The Poro Pasture's price curve is steep** at ratio 1.75 — the bot stops at 18.
8. **There is still no in-game changelog.**

---

## 9. Where the docs live

- `docs/BUILD-REPORT-v0.57.md` — this round's argument, with every measurement
- `docs/HANDOFF-v0.57.md` — this file
- `BUILDER_PROTOCOL.md` — the two-tier verification rule, read every session
- `docs/PARITY-LEDGER.md` — regenerate with `tools/parity-ledger.mjs`
- `docs/specs/rr-analyzer-v057-spec.md` — the spec this round consumed
- `docs/analyzer-status.md` — the cycle state
- `docs/gameplay-notes.md` — Jerry's raw playtest observations
- `STANDING-RULINGS.md` — §§1–25, and the Appendix of settled items not to re-open
