# HANDOFF v0.53 — Runeterra Reclaimed

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

1. **Every item in the spec gets actioned.** Never silently skip one. If an item cannot be
   satisfied, say so plainly and say why.
2. **All design claims are grounded in Kittens' actual source**, never in recollection. Cite
   file and line.

---

## 2. The laws the game is built on

**Kittens' Law.** Effects are **additive within a category** and **multiplicative between
categories**. An extra category is a multiplication; an extra member is an addition.

**`<res>Ratio` is unbounded.** Kittens applies `perTick *= 1 + getEffect(res + "Ratio")` —
`game.js:3425–3435` — with the identical statement for minerals, wood and science, and no
diminishing return anywhere.

**RR's two mechanisms for that one Kittens category:**

- `jobBoost` → `(1 + jobBoosts[job])`, **unbounded** — correct; the ore/timber/tinkerer lines.
- `boost` → `(1 + boosts[res])`, **bounded** by `BOOST_LIMIT` via `limitedDR`.

`BOOST_LIMIT` has **seven** keys — `devotion 2.0, culture 2.0, gold 1.5, vigor 1.0,
crystals 2.0, provisions 1.5, mana 1.0`. **`knowledge` is deliberately absent and must stay
absent** (the whole v0.52 round; `test-v52` asserts it).

**Two unbounded categories are ruled correct and closed as of v0.53** — see §7.

---

## 3. The state of the build

**21 live suites, 1,013 assertions, 0 failures.** `index.html`, `VERSION = "v0.53"`.

| | |
|---|---|
| tech ladder | **37 techs**, unchanged prices; three `req` edges re-parented (Jerry directive 1) |
| max research fan-out | **3** — asserted over the whole tree in `test-v53` |
| `auditCostGraph()` / `auditRawGraph()` | **zero violations each** |
| science parity | Kittens' 30/30/25/13 → **×20.8000** |
| `KNOWLEDGE MULT` reader | **gap 0.000%** at all three milestones (was read as a ×3 overshoot) |
| `boost_provisions_irrigation` | **1.25 / 2.3346 / 2.4902** against its 2.5 asymptote |
| buildings unreachable by the instrument | **zero**, asserted by enumeration |
| Sparks / Icathia (2,500y seed 1) | y156.1 / y966.6 |
| **Era 3 length** | **810.5** against a **1,400–2,300** target — 58% of the minimum, and **16.0 SHORTER than v0.52** |
| peak population | **223** — off 200 for the first time in four rounds |
| morale band 90–140 after y60 | **61%** — a regression this round caused, see §7.7 |
| content | 48 buildings · 21 crafts · 74 discoveries · 43 resources · 390,283 bytes |

**Seven of the round's nineteen pass conditions FAIL.** Read BUILD REPORT §13 before doing
anything else; three of them (the tier-5 craft never being forged, the morale band, and a
re-based target that still misses by 0.7 years) are the shape of the next round.

---

## 4. Files, and what each one is for

### The deliverable
- **`index.html`** — the game. The only real deliverable. Everything else is apparatus.

### The simulator
- **`sim/simcore.mjs`** — the headless simulator. Virtualises `Date.now`, seeds a
  deterministic xorshift `Math.random`, stubs the render layer, and drives a greedy bot
  through the game's own `tick()`.
  - **`BUILD_ORDER` and `DEDICATED_ROUTINES` are now at module scope and exported in the run
    result.** They were a `const` inside `manageBuildings()`, which is why five buildings
    could be unreachable for five rounds without anything noticing. `test-v53` subtracts them
    from `BUILDINGS` and fails on a non-empty remainder. **Add a new building to one of those
    two lists in the same commit that adds the building.**
  - `pay()` is wrapped at run start to record **spend by resource**, cumulative and at every
    milestone. That is the only choke point through which anything leaves the stock.
  - The snapshot records **every building count** (48 now), not a hand-picked few. Three
    consecutive rounds wanted a count it did not carry.
- **`sim/pacing.mjs`** — the milestone/pass-condition report. Carries the standing zero-**bank**
  calibration note (corrected in v0.53: the bot *does* trade, 46,630 times in a 2,500-year
  run; what it never does is bank vigor).
- **`sim/objectives.mjs`** — the pacing targets as data.

### The audits
- **`tools/enhance-audit.mjs`** — measures every non-cosmetic effect field end to end.
  `boostDelivered()` **no longer divides net rates** (v0.53 Part 5.2); it removes consumption
  with a zero-worker reading and solves for Σ₀ by bisection.
- **`tools/audit.mjs`**, **`tools/effcost.mjs`**, **`tools/rawcost.mjs`** — cost-graph checks
  and effective-raw expansion.
- **`tools/shimmer-audit.mjs`** — takes `--camp`, `--vigor-deep`, `--vigor-icathia` from the
  run. **It announces the fallback if you forget**; do not quote its output without them.
- **`tools/crystal-sinks.mjs`** — enumerates every crystal sink. Its one-off total is still
  **580**; v0.53's sinks are repeatable and by design do not appear in it.
- **`tools/census-table.mjs`**, **`size.mjs`**, **`luxdiag.mjs`**.

### The suites
`tests/test-v*.mjs`. **21 are live** — see §5. `tests/historical/` is archaeology.

---

## 5. The suites: which are live, and the honest count

**The live regression set is 21 suites, 1,013 assertions, 0 failures:**

```
test-v32  65   test-v40  59   test-v47  52
test-v34  41   test-v41  61   test-v48  54
test-v35  44   test-v42  51   test-v49  37
test-v36  44   test-v43  40   test-v50  34
test-v37  38   test-v44  63   test-banner-v51  16
test-v38  33   test-v45  58   test-v52  31
test-v39  70   test-v46  50   test-v53  72   ← new
```

Run them with:

```bash
cd tests && for f in test-v32 test-v34 test-v35 test-v36 test-v37 test-v38 test-v39 \
  test-v40 test-v41 test-v42 test-v43 test-v44 test-v45 test-v46 test-v47 test-v48 test-v49 \
  test-v50 test-banner-v51 test-v52 test-v53; do echo -n "$f: "; node $f.mjs 2>&1 | \
  grep -E '^[0-9]+ passed' | tail -1; done
```

941 (the twenty carried suites, unchanged in total) + `test-v53`'s 72 = **1,013**.

**`test-v2` … `test-v31` are historical.** They live in `tests/historical/`, are shipped for
archaeology, and **will fail** against the shipped build. `test-v14` in particular asserts the
Tavern, which was deleted in v0.52; it now carries a header saying so (v0.53 Part 5.5).

---

## 6. Operational rules, each of which has already cost a round

**Kill background runs by PID from `ps -eo pid,args`.** `pkill -f "<pattern>"` matches the
bash process running it and returns exit 144, silently dropping queued work. Made twice.

**Size every `sleep` under the tool timeout** while background runs are live. A 2-minute
tool timeout kills a longer sleep — the background `nohup` job survives, but the shell
reporting on it does not. Use `sleep 100` or less and poll.

**Instrument before launching.** Every metric the spec names goes into `simcore.mjs`'s
snapshot *before* the first 2,500-year run. **Broken again this round**, in a new way: the
metrics the spec *named* were all instrumented, but the metric a spec *prediction* implied
(Vault and Spire counts) was not, and it cost a re-run. **Record every building count, not the
ones you expect to need** — v0.53 does.

**Strip comments before grepping source.** Broken twice (v0.51 banner, v0.52 `resRatio`), and
`test-v53` nearly made it three times: its Part 5.4 assertion matched the comment that
*names* the retired selector. `test-v53` carries a `strip()` helper; use it.

**A zero in a measurement is a claim about the apparatus until you have checked the
apparatus.** v0.53 Part 1 is the first time this was executed as a *sweep* rather than a
reaction, and it found four more instances.

**Isolation builds must BE the shipped file up to that point**, snapshotted forward from it —
never reconstructed by re-applying patches. v0.53 used `snapshots/s0` … `snapshots/s4`, each a
verbatim copy of `index.html` + `sim/` at that point.

**Playwright:** `chromium.launch({ executablePath: "/opt/pw-browsers/chromium" })` with a
`.catch(() => chromium.launch())` fallback. **Never run `playwright install`.** On a fresh
container you do need `npm install playwright` once, with
`PLAYWRIGHT_BROWSERS_PATH=/opt/pw-browsers PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1`.

**Paths are relative** (`new URL("../index.html", import.meta.url)`). The hardcoded
`/home/claude/work/site/` quirk in HANDOFF v0.52 §6 is **stale and does not apply.**

**Timing, re-measured on a 2-core container:** a 2,500-year seed-1 run is **~700 s alone**,
~1,300 s with one other run, and roughly **N × 700 s for N runs in parallel above two**.
Two-core parallelism is real; three-way is not. Plan a five-prefix round as three batches, not
one.

**Syntax-check after every batch of edits:** `npm run syntax`.

---

## 7. What is open, and for whom

**Closed this round — do not re-open:**

- **`poroRatio` stays unbounded.** It is Kittens' `unicornsRatioReligion` (`js/religion.js`),
  and RR runs four of the source's six rungs at **23%** of its stack. Recorded at
  `poroRatio()` with the census. **Its first measured run in this project's history is
  v0.53's** — it read ×1.5 in every prior round because the Poro sacrifice was never
  performed.
- **`audience` stays unbounded**, recorded as a conscious departure, with
  **`AUDIENCE_REOPEN_POP = 600`** as a tripwire in code rather than a note in a comment.
- **`boost_provisions_irrigation ×6.56` is explained and fixed** (HANDOFF v0.52 §8.3).
- **The Rites-of-Targon and early-morale pass conditions are ruled on** — one re-based, one
  retired, both with reasons in `pacing.mjs`.

**For the analyzer:**

1. **Era 3 length is a difference of two milestones, and this round proved that matters.**
   The apparatus fix moved Sparks 83.4 years earlier and Icathia 61.2 earlier, so Era 3 grew
   by 22.2 without a single thing in Era 3 getting longer. **Any proposal to lengthen Era 3
   must say which edge it moves.**
2. **The Chembarrel is the next apparatus defect, and it is the same class one level up.**
   `manageBuildings()` runs before `manageCrafts()`, so a building whose cost is a crafted
   intermediate that a deeper craft also eats is checked for affordability against a stock
   that was drained the previous pass. A bot that *saves for a visible building* is the fix.
3. **The Hexdraulic Plant is gated behind `count("hextechFoundry") >= 3` in the bot's own
   amplifier block**, and the Foundry count reaches exactly 3 at Icathia. That is a bot
   policy, not a game property, and it should be ruled on rather than priced around.
4. **Riftsteel was never forged once.** The tier-5 craft and its consumer shipped INERT —
   `hexcore` and `riftsteel` are both at craft-tree depth 2, the deepest-first sort does not
   order them relative to each other, and Cores eat every Hexgear before 375 can accumulate.
   The remedy is a **tie-break in the sort comparator**, not a price cut: prefer the craft
   that is a direct component of a *visible building* over one that only feeds another craft.
   One line, and it needs its own baseline run. BUILD REPORT §5.2.
5. **Demand only lengthens Era 3 when it is demand for something SCARCE.** Both of this
   round's demand items shipped and neither bit: crystals sit at cap 94.8% of every tick, and
   Void Essence cannot be accumulated by the instrument at all. The scarce resources at
   Icathia are **scaffold, hexSlab, zaunore and coalgas**. v0.52's Shimmer Refinery result was
   not "add a consumer" — it was "add a consumer for the binding resource".
6. **Freljord rungs 5 and 6** — Kittens' `unicornUtopia` 2.50 and `sunspire` 5.00 — are a
   rank-matched structural lengthener with the source's own numbers behind them, and now that
   the ladder is actually buildable they can be measured. Strongest Era-3/4 candidate.
7. **Morale needs a round.** The band went 100% → 61%, `MORALE_RELIEF_LIMIT` saturates at
   77–81%, and peak population finally moved off 200. Those two facts are the same fact.
8. **The trade-banking policy for `manageTrade()`** is **dated to v0.54, first slice, against
   a Part-1-fixed harness.** Recorded in `docs/analyzer-status.md`.

**Standing directives — do not re-flag these as violations:**

- **The Sparks exception.** Sparks Beyond the Wall requires a recruited Piltover/Zaun
  champion. The single sanctioned exception to "champions never hard-gate content", because
  it gates an Era on a 3-of-10 choice. Ruled by Jerry, v0.51.
- **`CAMP_YIELD_LIMIT = 6` is kept deliberately.**
- **Two RR-invented rules have been ruled out of existence and must not return** — the 1.25
  price-band rule (v0.50) and the effect-to-ratio proportionality bound (v0.52 Part 2.6).
  **v0.53 declined to invent a third**: `poroRatio` and `audience` were both ruled *unbounded*
  rather than given a bound.

---

## 8. Known soft spots in the apparatus

None of these is a game defect. All of them will mislead someone who trusts the instrument.

1. **`manageBuildings()` runs before `manageCrafts()`.** See §7.2 — it is why the Chembarrel
   measures zero.
2. **The bot's amplifier block returns early on a `>= 3` Foundry gate.** See §7.3.
3. **Demand propagation is uncapped by design.** A visible Arcane Reactor makes the bot want
   ~267,000 Alloy, and it will keep crafting toward that number. The half-of-any-raw-input
   guard bounds the *rate*, not the target. This is intended — it is what makes the late
   chains real demand — but a future round that sees ore or zaunore behaving oddly should
   look here first.
4. **`enhance-audit`'s Σ₀ bisection assumes the DR primitive under test is correct.** It
   solves `m(Σ₀+σn)/m(Σ₀)` for Σ₀ using the game's own `limitedDR`. If `limitedDR` itself were
   wrong, the solve would be wrong in the same direction. `modelError` is printed at every n
   and is currently 0; a non-zero there is the signal.
5. **`test-v32` failed once under three-way CPU contention and passed on every re-run.**
   Suspected `waitForTimeout(500)` flake. Not chased.
6. **There is still no in-game changelog.** `VERSION` now exists as a constant, so there is
   finally something to extend.

---

## 9. Where the docs live

- `docs/BUILD-REPORT-v0.53.md` — this round's full argument, with every measurement
- `docs/HANDOFF-v0.53.md` — this file
- `docs/analyzer-status.md` — the cycle state, and the dated schedule
- `docs/gameplay-notes.md` — Jerry's raw playtest observations, untriaged
- `docs/specs/` — every consumed spec, including `rr-analyzer-v053-spec.md`
- `STANDING-RULINGS.md` — closed rulings; a session that finds one "violated" has found the
  ruling
- `snapshots/s0` … `snapshots/s4` — the five cumulative prefixes this round was measured on,
  with their run logs in `snapshots/logs/`
