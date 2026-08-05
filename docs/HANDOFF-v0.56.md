# HANDOFF v0.56 — Runeterra Reclaimed

Written for whoever picks this up next, builder or analyzer. The BUILD REPORT is the
argument; this is the map.

---

## 1. What the project is

**Runeterra Reclaimed** — a League of Legends–themed incremental/idle game modelled
rung-for-rung on **Kittens Game** (`github.com/nuclear-unicorn/kittensgame`), shipped as a
**single self-contained HTML file**. No build step. No bundler. `index.html` is the game, and
that filename is permanent (STANDING-RULINGS §10).

**The workflow is two Claude sessions.** An **analyzer** measures the shipped build against
Kittens' real source and returns a formal BUILDER SPEC at `current-build-spec.md`. A
**builder** implements every item, runs the suites and the headless simulator, and writes a
BUILD REPORT and a HANDOFF back. Jerry attaches his own numbered directives, **and his
directives override the spec where they conflict.**

**Two standing rules, both non-negotiable:**

1. **Every item gets actioned.** Never silently skip one. If an item cannot be satisfied, say
   so plainly and say why.
2. **All design claims are grounded in Kittens' actual source**, never in recollection. Cite
   file and line.

---

## 2. The one thing to read before anything else

**A single-seed Era-3 figure is not evidence.** Three seeds on the *same* v0.56 build gave
**700.6 / 1,709.3 / 1,835.3** game-years — a **2.6× spread**. The five cumulative prefixes this
round swung Era 3 by **+1,046, −1,007, +450, −448**, every one larger than the change in that
slice could plausibly cause, because the food economy now runs close enough to its own
starvation threshold that a small change flips which side a settlement lands on and the run
diverges for a millennium.

**Consequences, all binding:**

- Do not compare two builds on one seed. The harness needs an ensemble (§7.1) and until it has
  one, quote a median of at least three and state the spread.
- **Every Era-3 comparison in BUILD REPORTS v0.44 through v0.55 is one draw from an unmeasured
  distribution.** They are not wrong; their error bars were never taken.
- Things that are NOT chaotic and can still be compared on one run: cap-out fractions, morale
  band, peak population, delivered multipliers, and anything measured by `tests/`.

---

## 3. The laws the game is built on

**Kittens' Law.** Effects are **additive within a category** and multiplicative only **between**
categories. v0.56 Part 5 is the largest violation of this the project has found and fixed.

**Kittens ticks 5/s.** Per-second = `perTick × 5`.

**Three diminishing-return primitives:** `limitedDR(x, L)` is linear below `0.75·L` — **75% of
the limit is free**; `unlimitedDR` is sqrt-shaped; `strictDR(x, L) = L·x/(x+L)` has **no free
band**. Picking the wrong one is a balance decision.

**`BOOST_LIMIT` has seven keys and `knowledge` is deliberately absent.**

**Storage now has SCOPE (§19).** Two additive accumulators — `BARN_LINE` Σ 4.35, `WAREHOUSE_LINE`
Σ 1.80 — applied through `CAP_SCOPE` at four tiers: **narrow ×14.98 · broad ×2.80 · quarter
×2.0875 (gated on Silos) · none ×1.00**. `CAP_SCOPE` is total by construction and `test-v56`
asserts it by enumeration; a new capped resource cannot arrive without a tier decision.

**Closed rulings live in STANDING-RULINGS §§11–21.** New this round: **§19** storage scope,
**§20** food stores hold Kittens' figures, **§21** a test that captures a baseline from live
state must reset the state it is baselining.

---

## 4. The state of the build

**25 live suites, 1,219 assertions, 0 failures.** `VERSION = "v0.56"`.

| | |
|---|---|
| Era 3, median of 3 seeds | **1,709.3 game-years — inside the 1,400–2,300 target for the first time** (spread 700.6–1,835.3) |
| storage | one multiplicative chain → **two additive accumulators at four scopes** |
| food stores | Storehouse **5,000**, Harbor **2,500**, Warehouse **750 after Silos** — all Kittens' own figures |
| provisions at cap | **25.8% of ticks** (was 1.5%) — Deepwinter binds |
| consumption | **4.25/s**, farmer:eater **1.17647 exactly** |
| wanderer XP | **0.5/s (UNVERIFIED)** with **XP_CAP 25,556 (PARITY)** |
| Leona | softens the season (Deepwinter ×0.25 → ×0.625); no longer deletes it |
| morale band after y60 | **100% on all three seeds** — passes for the first time |
| peak population | **177–185** (was 220) |
| parity ledger | **208 rows — PARITY 50, EASIER 32, HARDER 2, UNVERIFIED 127** |
| tech ladder | 37 techs, 9 ties, median ×1.1111, geo ×1.2632, max ×3.333 |
| `auditCostGraph()` / `auditRawGraph()` | zero each |
| `test-v32` | **not a flake** — 10/10 including under load |

---

## 5. Files, and what each one is for

### The deliverable
- **`index.html`** — the game.
  - **`tick()` reconciles against the wall clock** (v0.54). Anything driving `tick()` in a loop
    must virtualise `Date.now` and advance by `TICK_MS` per fire.
  - **`CAP_SCOPE` / `BARN_LINE` / `WAREHOUSE_LINE`** carry the storage restructure, with
    `js/resources.js addBarnWarehouseRatio` quoted verbatim beside them. **Do not re-introduce a
    multiplicative storage chain.** A new storage upgrade adds to the two lines; its shares are
    chosen so the sums stay at the source's 4.35 / 1.80.
  - **`capsIf: { upgrade, caps }`** is the declared field for a cap a building grants only once
    an upgrade is researched. One declaration (the Warehouse), two readers (`computeCaps()` and
    `effectLines()`). Do not add a second as an inline special case.
  - **`seasonFarmMult(season, weatherMult)`** is the ONE place the seasonal multiplier is
    computed. `computeRates()` and the Deepwinter forecast both call it; `test-v56` greps for a
    second copy. The `m < 1` guard inside it is load-bearing — without it Leona's lead pulls
    Firstbloom's ×1.5 down to ×1.25.
  - **`LEONA_SEASON_RELIEF` is declared beside `SEASONS`, not beside `seasonFarmMult`**, because
    the lead's prose is generated from it at CHAMPS-definition time and a `var` further down
    would hoist as `undefined` and render NaN.
  - **`XP_CAP` clamps `w.jx[job]` but NOT `w.xp`.** Kittens' cap is per-skill; the lifetime
    total is a different quantity the Census sorts on. The load path clamps old banks.
  - **`rerollPenalty` / `undoKind` are at module scope deliberately** (v0.55) — `doUndo()`
    replaces `S` wholesale.

### The simulator
- **`sim/simcore.mjs`** — `BUILD_ORDER` and `DEDICATED_ROUTINES` are declared **inside**
  `runSim`'s `page.evaluate` and are **not** exported (HANDOFF v0.55 corrected v0.54's claim).
  The reachability guard is real and works; a new building must join one of those lists in the
  same commit that adds it.
  - v0.56 instrumentation: **`capTicks` records time-at-cap for every capped resource** (the
    v0.55 analysis had to take those figures in a separate probe run), and the snapshot records
    the **delivered storage multiplier and held/cap per resource** by differencing the finished
    cap against the cap with the storage upgrades stripped.
  - Reading the `storage` line: stripping `chemtechSilos` also removes the Warehouse's
    conditional 750, so the provisions figure there is slightly above the tier multiplier.
    `test-v56` asserts the tiers on a bare state; both figures are correct.

### The apparatus tools
- **`tools/fixture-sweep.mjs`** — the standing detector for §21 defects. Re-runs every suite on
  a deliberately dirty roster and reports assertions that fail only there. **Run it after any
  change to a shared multiplier.** It documents its own one known artefact so a reader does not
  fix a non-bug.
- **`tools/parity-ledger.mjs`** → `docs/PARITY-LEDGER.md`. Enumerates the live game against a
  hand-written verdict map, now including one row per champion and one per leader clause.
- `tools/enhance-audit.mjs`, `shimmer-audit.mjs`, `audit.mjs`, `effcost.mjs`, `rawcost.mjs`,
  `crystal-sinks.mjs`, `census-table.mjs`, `size.mjs`, `luxdiag.mjs`.

---

## 6. Operational rules, each of which has already cost a round

**Quote a median of at least three seeds for any milestone-year claim.** §2.

**Snapshot each slice BEFORE starting the next Part.** v0.56 applied Part 3 before staging s4
and had to reconstruct s4 from s3 plus one hunk, then diff it against the shipped file to prove
the remainder was exactly Part 3. It was verifiable, and it should not have been necessary.

**Before sizing a cap from a cap-out fraction, check whether the resource is a STOCK or a
FLOW.** v0.56 raised the shimmer ceiling ×2.5 and cut the hexore ceiling ×3.5 and moved their
cap-out by 3 points and 0 points respectively, because neither is ceiling-limited: hexore is
consumed as fast as it is produced (held/cap 0% everywhere) and nothing consumes shimmer at all
(held/cap 100%). `held/cap` is in the snapshot precisely so this can be checked first.

**A test that captures a baseline from live state must reset the state it is baselining** (§21).

**Do not pin a literal version string in a shipped suite.** v0.53 did it, v0.54 fixed it and did
it again, v0.55 fixed it and did it again, v0.56 fixed it a third time. Assert the shape; pin the
value in the round's own suite only.

**`limitedDR` gives away 75% of its limit.** `strictDR` does not.

**Kill background runs by PID from `ps -eo pid,args`.** `pkill -f` matches the bash process.

**Size every `sleep` under the tool timeout (600 s) and poll.**

**Pass `--years N` to `sim/pacing.mjs`**, never a bare positional — a positional silently yields
`simulating NaN game-years` and a run that finishes in 0.1 s. `--seed N` for the ensemble.

**Strip comments before grepping source.** Every suite carries a `strip()` helper.

**Playwright:** `chromium.launch({ executablePath: "/opt/pw-browsers/chromium" })` with a
`.catch(() => chromium.launch())` fallback. **Never run `playwright install`.** On a fresh
container: `PLAYWRIGHT_BROWSERS_PATH=/opt/pw-browsers PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1
npm install playwright` once. A snapshot run outside the repo root needs `node_modules`
symlinked or it will not resolve `playwright`.

**Pushing.** The git proxy blocks this repo and returns 403. Set the token remote, push with the
proxy env vars unset for that one call, then scrub the token back out:

```bash
git remote set-url origin "https://x-access-token:<PAT>@github.com/jouyang01/RR.git"
env -u HTTP_PROXY -u HTTPS_PROXY -u http_proxy -u https_proxy -u ALL_PROXY \
  git push origin main --follow-tags
git remote set-url origin https://github.com/jouyang01/RR.git
```

**Timing on a 2-core container:** a 2,500-year seed-1 run is ~1,600 s alone, ~2,400 s with one
other, and ~3,000 s with two. **Budget five slices plus a three-seed ensemble at roughly four
hours of wall clock**, and start the baseline before writing any code.

**Syntax-check after every batch of edits:** `npm run syntax`.

---

## 7. What is open, and for whom

**New from v0.56, and the first two are the round's own debts:**

1. **The seed ensemble.** Highest-priority apparatus item in the project. See §2.
2. **The bot has no food policy, and it now matters.** `manageJobs()` staffs **one farmer** at
   every milestone, in every era, at every population from 36 to 220 — measured across five
   slices and two prior rounds. It banks food instead of farming it. Now that the ceiling binds,
   that is the single largest source of the chaos in §2. **The decision Part 4 asked to be
   written down: the current numbers are a lower bound measured on a settlement that does not
   respond to hunger.** Fix the bot, do not price around it (§16).
3. **Pass condition 5 is mis-specified for three of its four resources.** Restate it as a
   producer/consumer balance for shimmer, hexore and coalgas, or drop them from it.
4. **The instrument researches only 3 of 5 storage rungs** for most of a run and 4 of 5 at
   Icathia, so the fully-stacked table and the entire quarter tier are never exercised in a
   measured game. Either the bot's Discovery priority needs a look, or the ladder's terminal
   rungs are unreachable in practice.
5. **130 wanderers reads y750 / y1472 / y1535 across the three seeds** against a y600 target.
   It is the one condition that got worse, and it is the direct intended consequence of a food
   ceiling that finally binds. **Decide whether ~180 is the target population.**
6. **`XP_PER_SECOND` is still UNVERIFIED.** `skillXP` is a local computed between
   `js/village.js:2623` and `:2644`. The grep.app query that found `skillsCap` does not find it;
   try `var skillXP`, `skillXP *=`, or the enclosing function name. The CAP beside it is PARITY
   and the two must not be conflated.

**Carried, unchanged:**

7. **The craft-depth tie-break.** Riftsteel still never forged; voidessence still accumulates
   after Icathia with no consumer.
8. **The Chembarrel / save-for-a-visible-building fix.** `catMonument` still ×1.00.
9. **The trade-banking policy** for `manageTrade()`.
10. **Convergence 3.57–4.40% at Sparks** against 5–8%, and **Rites y72.7** against y70 — both
    now within a seed's noise of their targets, which is itself an argument for §7.1.
11. **127 UNVERIFIED ledger rows.** Ten to fifteen a round by subsystem. The champion and leader
    block was taken this round.
12. **Crystals at cap 95.9%** and **culture 97.3%** — the two worst cap-out readings in the game,
    and neither is on the Masonry line. Culture takes the Scholarship family; crystals are now
    on the broad tier. Both need a round of their own.

**Standing directives — do not re-flag these as violations:**

- **Seasonal farmers are RR-ORIGINAL and deliberate** (§17). Leona softens them (§Part 3); she
  does not delete them, and she must not be restored to doing so.
- **Storage scope is closed** (§19). Do not re-introduce a multiplicative chain.
- **The food stores hold Kittens' figures** (§20). The v0.47 "units" argument for 7,500 is dead.
- **`test-v32` does not flake under CPU contention** (§21). Do not restore the idle-box remedy.
- **The Sparks exception**, **`CAMP_YIELD_LIMIT = 6`**, **the Quarry keeps the id `quarry`**.
- **Five RR-invented rules have been ruled out of existence** — the 1.25 price band (v0.50), the
  effect-to-ratio proportionality bound (v0.52), merchant fatigue (v0.54), the Hunter's Lodge as
  a hunt-yield source (v0.55), and the multiplicative storage chain (v0.56).

---

## 8. Known soft spots in the apparatus

1. **Single-seed pacing.** §2. Everything else on this list is smaller than this one.
2. **`manageJobs()` will not staff farming under a deficit.** §7.2.
3. **`manageBuildings()` runs before `manageCrafts()`**, so a building priced in a contested
   intermediate is never affordable at the instant it is tested.
4. **Demand propagation is uncapped by design.**
5. **`enhance-audit`'s Σ₀ bisection assumes `limitedDR` is correct.** `modelError` is printed at
   every n and is currently 0.
6. **Craft logging is per craft action** and lengthens a 2,500-year run measurably.
7. **The Poro Pasture's price curve is steep** at ratio 1.75 — the bot stops at 18.
8. **There is still no in-game changelog.**

---

## 9. Where the docs live

- `docs/BUILD-REPORT-v0.56.md` — this round's argument, with every measurement
- `docs/HANDOFF-v0.56.md` — this file
- `docs/PARITY-LEDGER.md` — regenerate with `tools/parity-ledger.mjs`
- `docs/specs/rr-analyzer-v056-spec.md` — the spec this round consumed
- `docs/analyzer-status.md` — the cycle state
- `docs/gameplay-notes.md` — Jerry's raw playtest observations
- `STANDING-RULINGS.md` — §§1–21, and the Appendix of settled items not to re-open
