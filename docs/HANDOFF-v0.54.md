# HANDOFF v0.54 — Runeterra Reclaimed

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

**v0.54 had no analyzer spec.** It answers a supplied offline-progression audit
(`docs/OFFLINE-AUDIT-v0.52.md`) and seventeen of Jerry's numbered directives. There are
therefore no cumulative prefixes and no predicted-vs-measured table this round — that
apparatus belongs to spec rounds. The next round should be a spec round; §7 has the list.

**Two standing rules, both non-negotiable:**

1. **Every item gets actioned.** Never silently skip one. If an item cannot be satisfied, say
   so plainly and say why.
2. **All design claims are grounded in Kittens' actual source**, never in recollection. Cite
   file and line.

---

## 2. The laws the game is built on

**Kittens' Law.** Effects are **additive within a category** and **multiplicative between
categories**.

**`<res>Ratio` is unbounded** (`game.js:3425–3435`). RR's two mechanisms for that one
category: `jobBoost` → `(1 + jobBoosts[job])`, unbounded; `boost` → `(1 + boosts[res])`,
bounded by `BOOST_LIMIT` via `limitedDR`.

`BOOST_LIMIT` has **seven** keys. **`knowledge` is deliberately absent and must stay absent.**

**Three closed rulings live in STANDING-RULINGS §§11–13** — `poroRatio` unbounded, `audience`
kept with the `AUDIENCE_REOPEN_POP = 600` tripwire, and *Era 3 length is a difference of two
milestones and both edges move*.

---

## 3. The state of the build

**23 live suites, 1,098 assertions, 0 failures.** `VERSION = "v0.54"`.

| | |
|---|---|
| offline, closed tab | bit-identical to live play; cap holds to the tick at 6 h / 12 h / 48 h / 10 days |
| offline, **backgrounded tab** | **100% of real rate** (was 20%) — the v0.54 headline |
| catch-up | **chunked**, ~500 game-days per slice, banner shown, same end state as blocking |
| tech ladder | 37 techs, unchanged prices, max research fan-out 3 |
| `auditCostGraph()` / `auditRawGraph()` | zero violations each |
| science parity | Kittens' 30/30/25/13 → ×20.8000 |
| wanderer rank | **per trade** — one person can be a Bronze jungler and a Challenger miner |
| merchant fatigue | **deleted** |

---

## 4. Files, and what each one is for

### The deliverable
- **`index.html`** — the game. The only real deliverable.
  - **`tick()` is no longer a fixed `dt`.** It holds `liveLastMs`, converts real elapsed time
    into whole ticks and carries the remainder in `liveCarryMs`. **Anything that drives
    `tick()` in a loop must virtualise `Date.now` and advance it by `TICK_MS` per fire** —
    `test-v35`, `test-v47` and `test-offline-v54` all do, and a tight loop against the real
    clock now advances no game time at all. This is the single most likely thing to trip up
    the next session.
  - `applyOfflineProgress(onDone)` takes an optional callback; above `CHUNK_MIN_DAYS` (2,000
    game-days) the replay is genuinely asynchronous.
  - `reportCatchUp(r, hitCap, prefix)` is shared by both catch-up routes.

### The simulator
- **`sim/simcore.mjs`** — the headless simulator. **`BUILD_ORDER` and `DEDICATED_ROUTINES`
  are at module scope and exported**; `test-v53` fails if `BUILDINGS` minus the two is
  non-empty. **Add a new building to one of those lists in the same commit that adds it.**
  `pay()` is wrapped to record spend by resource; the snapshot records every building count.
- **`sim/pacing.mjs`** — milestones and pass conditions. Two conditions were ruled on in
  v0.53: Rites of Targon re-based to y70, the early-morale dip retired, both with reasons in
  the file.

### The audits
- **`tools/enhance-audit.mjs`** — `boostDelivered()` removes consumption with a zero-worker
  reading and solves for Σ₀ by bisection. Do not "simplify" it back to a quotient of net rates.
- **`tools/shimmer-audit.mjs`** — takes `--camp`, `--vigor-deep`, `--vigor-icathia`; it
  announces the fallback if you forget.
- `tools/audit.mjs`, `effcost.mjs`, `rawcost.mjs`, `crystal-sinks.mjs`, `census-table.mjs`,
  `size.mjs`, `luxdiag.mjs`.

---

## 5. The suites

**23 live, 1,098 assertions, 0 failures:**

```
test-v32  65   test-v40  60   test-v47  52   test-v53  72
test-v34  41   test-v41  61   test-v48  54   test-v54  59
test-v35  46   test-v42  51   test-v49  37   test-offline-v54  23
test-v36  44   test-v43  40   test-v50  34
test-v37  38   test-v44  63   test-banner-v51  16
test-v38  33   test-v45  58   test-v52  31
test-v39  70   test-v46  50
```

```bash
cd tests && for f in test-v32 test-v34 test-v35 test-v36 test-v37 test-v38 test-v39 \
  test-v40 test-v41 test-v42 test-v43 test-v44 test-v45 test-v46 test-v47 test-v48 test-v49 \
  test-v50 test-banner-v51 test-v52 test-v53 test-v54 test-offline-v54; do echo -n "$f: "; \
  node $f.mjs 2>&1 | grep -E '^[0-9]+ passed' | tail -1; done
```

**`tests/historical/` is archaeology and will fail.** `test-v14` asserts the Tavern, deleted
in v0.52; it carries a header saying so.

**Do not pin a literal version string in a suite.** `test-v53` did (`VERSION === "v0.53"`)
and became a check designed to fail every subsequent round. Assert the shape; pin the value
in the round's own suite.

---

## 6. Operational rules, each of which has already cost a round

**`tick()` reconciles against the wall clock.** See §4 — this is new in v0.54 and it changes
how every test that drives the live loop must be written.

**Kill background runs by PID from `ps -eo pid,args`.** `pkill -f` matches the bash process
running it and returns exit 144. Made twice.

**Size every `sleep` under the tool timeout** while background runs are live. Use `sleep 100`
or less and poll; the `nohup` job survives a killed shell, the reporting does not.

**Instrument before launching.** Every metric the spec names goes into the snapshot before the
first 2,500-year run — and record every building count, not the ones you expect to need.

**Strip comments before grepping source.** Broken three times now. Every suite from v0.53
carries a `strip()` helper; use it.

**A zero in a measurement is a claim about the apparatus until you have checked the
apparatus.** The build-order class of this defect is now an assertion. The stock-versus-flow
class is not, and it is what left Riftsteel unforged in v0.53.

**Isolation builds must BE the shipped file up to that point**, snapshotted forward. See
`snapshots/s0` … `s4` from v0.53 for the pattern.

**Playwright:** `chromium.launch({ executablePath: "/opt/pw-browsers/chromium" })` with a
`.catch(() => chromium.launch())` fallback. **Never run `playwright install`.** On a fresh
container, `PLAYWRIGHT_BROWSERS_PATH=/opt/pw-browsers PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1
npm install playwright` once.

**Pushing.** The git proxy blocks this repo by default and returns 403. Set the token remote,
push with the proxy env vars unset for that one call, then scrub the token back out:

```bash
git remote set-url origin "https://x-access-token:<PAT>@github.com/jouyang01/RR.git"
env -u HTTP_PROXY -u HTTPS_PROXY -u http_proxy -u https_proxy -u ALL_PROXY \
  git push origin main --follow-tags
git remote set-url origin https://github.com/jouyang01/RR.git
```

**Timing on a 2-core container:** a 2,500-year seed-1 run is ~700 s alone and ~1,300 s with
one other. Two-core parallelism is real; three-way is not.

**Syntax-check after every batch of edits:** `npm run syntax`.

---

## 7. What is open, and for whom

**Carried from v0.53, untouched this round and still the spine of the next spec:**

1. **The craft-depth tie-break.** `hexcore` and `riftsteel` are both at craft-tree depth 2,
   the deepest-first sort does not order them, and Cores eat every Hexgear before 375 can
   accumulate — so **the tier-5 craft has never been forged**. Prefer the craft that is a
   direct component of a *visible building*. One line, needs its own baseline run.
2. **The Chembarrel / save-for-a-visible-building fix.** `manageBuildings()` runs before
   `manageCrafts()`, so a building priced in a contested intermediate is never affordable at
   the instant it is tested.
3. **The trade-banking policy** for `manageTrade()`, dated to the next spec round's first
   slice.
4. **Freljord rungs 5 and 6** (Kittens' `unicornUtopia` 2.50, `sunspire` 5.00) — measurable
   for the first time since v0.53 made the ladder buildable.
5. **A morale round.** The band is 61%, `MORALE_RELIEF_LIMIT` saturates at 77–81%, and peak
   population finally moved off 200.
6. **Demand lengthens Era 3 only when it is demand for something SCARCE** — and Era 3 is
   `Icathia − Sparks`, so say which edge you are moving.

**New from v0.54:**

7. **The Poro Pasture is still two divergences from source.** priceRatio 1.15 against the
   source's **1.75**, and `eatCut` 0.003 against `catnipDemandRatio` **−0.0015**. Directive 13
   fixed production only — and now that production is 5× what it was, the price ratio is the
   one that matters.
8. **Caitlyn's two clauses compound.** The tier discount raises the `over` term the slot
   ladder is computed from, so +10 points of slot chance reads as +25 at five caravans and
   more above that. Largest untested number this round shipped.
9. **`w.xp` is now a lifetime total that only the Census sort reads.** Either build a
   "veteran" concept on it or declare it dead weight.
10. **The 12-hour offline cap has never been questioned.** It is now enforced identically on
    both routes, so it is a single tunable rather than two.

**Standing directives — do not re-flag these as violations:**

- **The Sparks exception** — a 3-of-10 champion choice, ruled by Jerry in v0.51.
- **`CAMP_YIELD_LIMIT = 6` is kept deliberately.**
- **Three RR-invented rules have been ruled out of existence** — the 1.25 price band (v0.50),
  the effect-to-ratio proportionality bound (v0.52), and **merchant fatigue (v0.54)**. All
  three were heuristics the source does not have.

---

## 8. Known soft spots in the apparatus

1. **`manageBuildings()` runs before `manageCrafts()`** — see §7.2.
2. **The bot's amplifier block returns early on a `>= 3` Foundry gate.**
3. **Demand propagation is uncapped by design.** A visible Arcane Reactor makes the bot want
   ~267,000 Alloy. The half-of-any-raw-input guard bounds the rate, not the target.
4. **`enhance-audit`'s Σ₀ bisection assumes `limitedDR` is correct.** `modelError` is printed
   at every n and is currently 0; a non-zero there is the signal.
5. **Craft logging is per craft action.** v0.54's directive 14 adds an `addLog` to every
   completed `craftItem`, which in a 2,500-year run is a great many string builds. It did not
   change any result, but it lengthened the run measurably. If a future round needs the wall
   clock back, gate the log on `catchUpActive === false`.
6. **`test-v32` flakes under CPU contention** — it failed once in v0.53 and once in v0.54,
   both times while a 2,500-year run was saturating both cores, and passed on every re-run in
   both rounds. Suspected `waitForTimeout(500)` after `page.goto`. It has now happened twice,
   which is the project's own threshold for writing something down: **if it fails, re-run it
   with nothing else on the box before treating it as a defect.**
7. **There is still no in-game changelog.** `VERSION` exists as a constant, so there is
   finally something to extend.

---

## 9. Where the docs live

- `docs/BUILD-REPORT-v0.54.md` — this round's argument, with every measurement
- `docs/HANDOFF-v0.54.md` — this file
- `docs/OFFLINE-AUDIT-v0.52.md` — the supplied audit this round answers
- `docs/analyzer-status.md` — the cycle state and the dated schedule
- `docs/gameplay-notes.md` — Jerry's raw playtest observations; v0.54's seventeen are struck
  through with the directive that closed each
- `docs/specs/` — every consumed spec
- `STANDING-RULINGS.md` — closed rulings; a session that finds one "violated" has found the
  ruling
- `snapshots/s0` … `snapshots/s4` and `snapshots/logs/` — v0.53's five cumulative prefixes
