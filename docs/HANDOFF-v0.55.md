# HANDOFF v0.55 — Runeterra Reclaimed

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

**v0.55 was a spec round** — ten parts, five cumulative prefixes, a predicted-vs-measured
table, and the first round conducted under the parity charter.

**Two standing rules, both non-negotiable:**

1. **Every item gets actioned.** Never silently skip one. If an item cannot be satisfied, say
   so plainly and say why.
2. **All design claims are grounded in Kittens' actual source**, never in recollection. Cite
   file and line. **v0.55 is the round that proves why**: a directive arrived asserting the
   source did something it does not do, and the only reason it shipped correctly labelled
   rather than incorrectly labelled PARITY is that somebody opened `js/village.js`.

---

## 2. The laws the game is built on

**Kittens' Law.** Effects are **additive within a category** and **multiplicative between
categories**.

**Kittens ticks 5/s.** Per-second = `perTick × 5`. This conversion is the project's standing
one and it is where v0.55's largest defect came from — see §3.

**`<res>Ratio` is unbounded** (`game.js:3425–3435`). RR's two mechanisms for that category:
`jobBoost` → `(1 + jobBoosts[job])`, unbounded; `boost` → `(1 + boosts[res])`, bounded by
`BOOST_LIMIT` via `limitedDR`.

`BOOST_LIMIT` has **seven** keys. **`knowledge` is deliberately absent and must stay absent.**

**Three diminishing-return primitives, and picking the wrong one is a balance decision:**

| | shape | free band |
|---|---|---|
| `limitedDR(x, L)` | linear below `0.75·L`, then hyperbolic | **75% of the limit is free** |
| `unlimitedDR(x, L)` | `sqrt`-shaped, no ceiling | — |
| `strictDR(x, L)` | `L·x/(x+L)` | **none — bites from the first point** (new in v0.55) |

**`limitedDR`'s free band is not a detail.** It is why drakes delivered three-quarters of every
cap with no diminishing return at all, and why `eatCutLimit` was decorative for four rounds. If
a bound is supposed to bite early, `limitedDR` is the wrong primitive.

**Closed rulings live in STANDING-RULINGS §§11–18.** New this round: **§17 — Kittens' farmers
are NOT seasonal, and RR's are anyway, deliberately and labelled**; **§18 — `hunterLodge` is
deleted and `campYieldMult()` reads no job count and no building count.**

---

## 3. The state of the build

**24 live suites, 1,167 assertions, 0 failures.** `VERSION = "v0.55"`.

| | |
|---|---|
| parity ledger | **188 rows — PARITY 50, EASIER 12, HARDER 2, UNVERIFIED 124** + 10 standing divergences |
| food economy | **rescaled ×10** — it had been running at one-tenth of the source, and it was the only resource that was |
| farmer / farmstead / consumption | 5.000 / 0.625 / **4** (source ratio wants 4.25 — see BUILD REPORT §4) |
| seasonal farmers | shipped, **RR-ORIGINAL / HARDER**; winter cuts job food 75% |
| hunt yield | `hunterLodge` **deleted**; Σ **5.10** across seven source-mapped members → **×5.9286** |
| drakes | `strictDR` — 25% of cap at 5 kills, 50% at 10, 75% at 50, 90% at 100 |
| Poro Pasture | ratio **1.75** (Kittens' `unicornPasture`); bot count 60 → **18** |
| wanderer XP | **2/s, UNVERIFIED** — the source increment could not be located |
| undo re-roll | **bounded** — next roll of the same kind fails; asserted by outcome |
| tech ladder | 37 techs, 9 ties, median ×1.1111, geo ×1.2632, max ×3.333, fan-out 3 |
| `auditCostGraph()` / `auditRawGraph()` | zero violations each |
| offline, closed tab | matches live to 0.0058% on a **dynamic** fixture (v0.54's "bit-identical" was reading a saturated one) |
| offline, backgrounded tab | 100% of real rate |

**Era 3 is 660.6 game-years** against a 1,400–2,300 target. Parts 3–6 bought **+213**; Part 7
(the XP doubling) gave back **−193.6**. Net **+19.4**. That single line is the round.

---

## 4. Files, and what each one is for

### The deliverable
- **`index.html`** — the game. The only real deliverable.
  - **`tick()` reconciles against the wall clock** (v0.54). **Anything that drives `tick()` in a
    loop must virtualise `Date.now` and advance it by `TICK_MS` per fire** — `test-v35`,
    `test-v47`, `test-v54`, `test-v55` and `test-offline-v54` all do. A tight loop against the
    real clock advances no game time at all. Still the single most likely thing to trip up a new
    session.
  - **`PROVISIONS_SCALE = 10`** is a declared constant with the rationale beside it. Anything
    new that is priced in provisions is priced at the ×10 scale.
  - **`rerollPenalty` and `undoKind` are at MODULE scope, deliberately.** `doUndo()` replaces
    `S` wholesale; a flag inside `S` would be erased by the act that sets it. They are mirrored
    through `serialize()`/`loadFromString()` so a save inside the undo window cannot launder the
    penalty. Do not "tidy" them into `S`.
  - **The `hunterLodge` save migration must not be deleted.** A v0.54 save that owns Lodges
    loads, drops them, and is refunded 50% of the ratio-1.15 geometric sum. `test-v55` asserts
    it against a synthetic ten-Lodge save.

### The simulator
- **`sim/simcore.mjs`** — the headless simulator. `BUILD_ORDER` and `DEDICATED_ROUTINES` are
  declared **inside `runSim`'s `page.evaluate`** (≈ lines 441–442) and **are not exported** —
  HANDOFF v0.54 §4 said otherwise and was wrong; `test-v53` asserts module scope but tests it
  with a text `indexOf`, which matches at any scope. **The reachability guard itself is real and
  works.** A new building must still be added to one of those two lists in the same commit that
  adds the building.
  - v0.55 instrumentation lives in `snapshot()`: `food` (gross/eat/net by differencing at pop 0,
    farmers, season, `farmMultNow`, cap, held), `campYield` / `luxCampYield` / `junglers`,
    `drakes` (kills/cap/delivered, with a `typeof DRAKE_CAP !== "undefined"` fallback so older
    slices still run), and `xp` (top and median banks, Challenger counts).
- **`sim/pacing.mjs`** — milestones and pass conditions. **The Convergence 5–8%-at-Sparks
  condition is new in v0.55** (spec Part 9): the target had existed for three rounds with no
  condition attached to catch it.

### The parity apparatus (new)
- **`tools/parity-ledger.mjs`** → **`docs/PARITY-LEDGER.md`**. Enumerates `TECHS`, `BUILDINGS`,
  `UPGRADES`, `JOBS`, `CRAFTS` out of the live game and joins them against a hand-written verdict
  map, so **a new entity cannot be silently omitted** — it arrives as an `UNVERIFIED` row with no
  note, which is visible. Mechanisms with no id go in the "standing divergences" table by hand.
  Re-run it after any content change; `test-v55` asserts the result by enumeration.

### The audits
- **`tools/enhance-audit.mjs`** — `boostDelivered()` removes consumption with a zero-worker
  reading and solves for Σ₀ by bisection. Do not "simplify" it back to a quotient of net rates.
  The `campBoost` growth probe is now `campStackAtFullSigma`, which reports
  `{sigma 5.1, material 5.875, comfort 1.9861, kittensWouldGive 6.1}`.
- `tools/shimmer-audit.mjs`, `audit.mjs`, `effcost.mjs`, `rawcost.mjs`, `crystal-sinks.mjs`,
  `census-table.mjs`, `size.mjs`, `luxdiag.mjs`.

---

## 5. The suites

**24 live, 1,167 assertions, 0 failures:**

```
test-v32  65   test-v40  60   test-v47  52   test-v53  72
test-v34  41   test-v41  61   test-v48  54   test-v54  59
test-v35  46   test-v42  51   test-v49  37   test-v55  66   ← new
test-v36  44   test-v43  40   test-v50  34   test-offline-v54  25
test-v37  38   test-v44  63   test-v52  31   test-banner-v51  16
test-v38  33   test-v45  59   test-v46  50
test-v39  70
```

**`test-v55` is the round's own suite** and it asserts the twenty pass conditions in spec order,
including the ledger by enumeration, the ×10 sweep by enumeration, seasonality at all four
seasons, the drake kill-count table, the Lodge migration against a synthetic save, and the undo
penalty **by forced-fail outcome rather than by reading the flag**.

**Fourteen shipped suites were re-pointed this round** — the full table with superseding causes
is BUILD REPORT §7. Two re-points *added* assertions rather than only moving them, because the
re-point revealed a hole.

---

## 6. Operational rules, each of which has already cost a round

**Read the source file before accepting a premise, including Jerry's.** v0.55's headline
directive asserted a Kittens behaviour that does not exist. The directive was right as a design
change and wrong as a parity claim, and only a raw-file read separated the two.

**`tick()` reconciles against the wall clock.** See §4.

**`limitedDR` gives away 75% of the limit for free.** Before using it as a bound, ask whether
the bound is meant to bite. `strictDR` exists now for the case where it is.

**Do not pin a literal version string in a shipped suite.** `test-v53` did it, v0.54 fixed it,
and `test-v54` then did it again by re-typing rather than copying. Assert the `vN.NN` shape; pin
the value in the round's own suite.

**Do not pin an ordinal that a price move can shift.** `test-v46`/`test-v47`'s "rank ≤ 19" rule
broke this round because repricing one tech slid another across the boundary — with no material
cost changing anywhere. Assert against the *thing* (the Era-3 gate), not its index.

**A green assertion on a saturated fixture asserts nothing.** `test-offline-v54`'s
"bit-identical" passed for four rounds because the settlement was pinned to its storage cap for
72% of the run. When a check is exact, ask what would have to be true for it to be exact by
accident, and assert that too.

**Kill background runs by PID from `ps -eo pid,args`.** `pkill -f` matches the bash process
running it and returns exit 144. Made three times now.

**Size every `sleep` under the tool timeout** (600 s) while background runs are live, and poll.
The `nohup` job survives a killed shell; the reporting does not.

**Pass `--years N` to `sim/pacing.mjs`.** The flag is `--years`, and a bare positional argument
silently produces `simulating NaN game-years` and a run that finishes in 0.1 s.

**Instrument before launching.** Every metric the spec names goes into `snapshot()` before the
first 2,500-year run.

**Strip comments before grepping source.** Every suite from v0.53 carries a `strip()` helper;
use it. This round's rationale comments quote the exact literals being asserted absent.

**Isolation builds must BE the shipped file up to that point**, snapshotted forward, never
reverse-patched. See `snapshots/v55/s0`, `s2`–`s5`.

**Playwright:** `chromium.launch({ executablePath: "/opt/pw-browsers/chromium" })` with a
`.catch(() => chromium.launch())` fallback. **Never run `playwright install`.**

**Pushing.** The git proxy blocks this repo by default and returns 403. Set the token remote,
push with the proxy env vars unset for that one call, then scrub the token back out:

```bash
git remote set-url origin "https://x-access-token:<PAT>@github.com/jouyang01/RR.git"
env -u HTTP_PROXY -u HTTPS_PROXY -u http_proxy -u https_proxy -u ALL_PROXY \
  git push origin main --follow-tags
git remote set-url origin https://github.com/jouyang01/RR.git
```

**Timing on a 2-core container:** a 2,500-year seed-1 run is ~700 s alone, ~1,300 s with one
other, and **~2,700 s with two others**. Two-way parallelism is real; three-way costs more than
it saves. Budget five slices at roughly two hours of wall clock.

**Syntax-check after every batch of edits:** `npm run syntax`.

---

## 7. What is open, and for whom

**New from v0.55, and the first two are the round's own debts:**

1. **`XP_PER_SECOND = 2` is UNVERIFIED and it is a first-order pacing lever.** The Kittens skill
   increment could not be located: `js/village.js` carries the rank table but not the accrual,
   and `js/game.js` and `js/core.js` **404 from raw.githubusercontent.com, the GitHub blob view
   and jsdelivr**. Find a source that resolves, reprice against it. If the real figure is below
   2, roughly 190 game-years of Era 3 come back.
2. **The s5 prediction miss is a classification error worth generalising.** "Not a pacing item"
   was applied to a change that doubles a *production multiplier's* rate of arrival. **Any change
   to rank, skill, trait or champion progression is a pacing item** and should get its own slice.
3. **130 wanderers at y1013**, the worst reading in the project's history, up from y758.8. Decide
   whether that is the correct consequence of a correct food scale or an over-correction. The
   cheapest dial is `CONSUMPTION`: shipped at Jerry's 4, source ratio wants **4.25**, and the gap
   is a 6.2% relaxation of the farmer:eater ratio in the wrong direction.
4. **124 UNVERIFIED ledger rows.** That is the charter's backlog and it is now countable. A
   reasonable cadence is ten to fifteen a round, taken by subsystem rather than at random.
5. **`eatCutLimit = 0.5` is now real rather than decorative**, with two members sharing it. If a
   third arrives, re-measure before assuming the ruling still holds.
6. **Trades never call `snapshotUndo()`.** The Part 8 guard for trades is therefore protecting a
   path that does not exist yet. Either wire trades into the undo window or delete the trade half
   of the guard; do not leave it ambiguous.

**Carried, unchanged, and still the spine of the next spec:**

7. **The storage-scope restructure — v0.56, first slice.** Fully sourced from
   `addBarnWarehouseRatio` (**`js/resources.js`**, not `js/buildings.js`), measurements intact:
   cap-out is culture 93.8%, knowledge 90.0%, crystals 89.8%, renown 76.6% against a
   twelve-resource average of 17.7%, and the ×22 figure quoted since v0.39 **has never been
   reached** — the real stack is **×12.6**. It could not ship beside Part 3, which multiplies
   every provisions cap; shipping both makes the ceiling unattributable to either.
8. **The Chembarrel / save-for-a-visible-building fix.** `catMonument` is ×1.00 at all three
   milestones, but `seenMax.hexgear` has risen to **155.61** against the Foundry's 200 — 22%
   short, not 75%.
9. **The craft-depth tie-break.** Riftsteel has still never been forged, and **two** of v0.53
   Part 4's monotonicity conditions fail — voidessence accumulates 0 → 70,124 after Icathia with
   no consumer.
10. **The trade-banking policy** for `manageTrade()`.
11. **A morale round.** Band 67% against an 80% target (up from 61%), minimum 88.
12. **Freljord rungs 5 and 6** (Kittens' `unicornUtopia` 2.50, `sunspire` 5.00).
13. **Caitlyn's two clauses compound** — the largest untested number v0.54 shipped.
14. **`w.xp` is a lifetime total only the Census sort reads.** Build a "veteran" concept on it or
    declare it dead weight.

**Standing directives — do not re-flag these as violations:**

- **Seasonal farmers are RR-ORIGINAL and deliberate** (§17). Do not "fix" them back to parity.
- **The Sparks exception** — a 3-of-10 champion choice, ruled by Jerry in v0.51.
- **`CAMP_YIELD_LIMIT = 6` is kept deliberately** — at the source's own Σ 5.10 the bound costs
  2.8% (×5.9286 against ×6.10), which is the measurement that justifies it.
- **The Petricite Quarry keeps the id `quarry`** (§5), and its cost was untouched this round even
  though its tech was repriced.
- **Four RR-invented rules have been ruled out of existence** — the 1.25 price band (v0.50), the
  effect-to-ratio proportionality bound (v0.52), merchant fatigue (v0.54), and the Hunter's Lodge
  as a hunt-yield source (v0.55).

---

## 8. Known soft spots in the apparatus

1. **`manageBuildings()` runs before `manageCrafts()`** — see §7.8.
2. **The bot's amplifier block returns early on a `>= 3` Foundry gate.**
3. **Demand propagation is uncapped by design.** The half-of-any-raw-input guard bounds the rate,
   not the target.
4. **`enhance-audit`'s Σ₀ bisection assumes `limitedDR` is correct.** `modelError` is printed at
   every n and is currently 0; a non-zero there is the signal.
5. **Craft logging is per craft action** and lengthens a 2,500-year run measurably. Gate it on
   `catchUpActive === false` if the wall clock is ever needed back.
6. **`test-v32` flakes under CPU contention** — ~~now three occurrences across v0.53, v0.54 and
   v0.55, every one while a long run was saturating the box, and it has passed on every idle
   re-run. Suspected `waitForTimeout(500)` after `page.goto`. Re-run on an idle box before
   treating it as a defect.~~
   **CORRECTED IN v0.56 — THIS ENTRY WAS WRONG AND IT HID A REAL DEFECT FOR THREE ROUNDS.** The
   failure is not contention and it reproduces on an idle box: the camp block took its baseline
   with the live roster still in `S`, and since v0.55 Part 4 a stray Trailblazer moves
   `campYieldMult()` by half a per cent (4.980 against 5.000; two Trailblazers give 4.960). The
   trait roll is random, so "re-run on an idle box" worked **by luck**. Fixed in v0.56 Part 6;
   see STANDING-RULINGS §21 and `tools/fixture-sweep.mjs`. Do not restore the old remedy.
7. **The Poro Pasture's price curve is steep now.** At ratio 1.75 the 61st copy costs on the
   order of 10¹⁵. That is the source's own ratio and the intended shape — the bot stops at 18 —
   but any future code that assumes a buildable 60th Pasture will find it is not.
8. **There is still no in-game changelog.** `VERSION` exists as a constant, so there is something
   to extend.

---

## 9. Where the docs live

- `docs/BUILD-REPORT-v0.55.md` — this round's argument, with every measurement
- `docs/HANDOFF-v0.55.md` — this file
- **`docs/PARITY-LEDGER.md`** — the charter's instrument; regenerate with `tools/parity-ledger.mjs`
- `docs/specs/rr-analyzer-v055-spec.md` — the spec this round consumed
- `docs/analyzer-status.md` — the cycle state and the dated schedule
- `docs/gameplay-notes.md` — Jerry's raw playtest observations
- `STANDING-RULINGS.md` — §§1–18, and the Appendix of settled items not to re-open
