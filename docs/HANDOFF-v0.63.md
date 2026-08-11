# HANDOFF v0.63 — Runeterra Reclaimed

Written for whoever picks this up next, with no memory of this session.

---

## 1. READ THIS FIRST — THE ROUND'S GATE FAILED, AND THE CAUSE IS POPULATION

**Pass condition 1 was "Icathia on ALL THREE seeds within 2,500 game-years". It reached ONE on the
Parts 1+2 build and TWO on the shipped build. Neither is three.**

That is the same score v0.62 got, and the spec predicted Parts 1 and 2 alone would fix it. They
did not. **But the round is not a wash and the reason is worth a paragraph rather than a line:**

| | v0.62 | **v0.63** |
|---|---|---|
| conditions failing | **4 of 10** | **1 of 10** |
| Rites of Targon [median, < 75] | **76.0 FAIL** | **69.3 PASS** |
| First champion [max, < 120] | **129.6 FAIL** | **110.2 PASS** |
| peak population [median, 150–220] | **135 FAIL** | **136 FAIL** |
| Icathia on 3 seeds | 1 of 3 | **1 of 3** (2 of 3 on the shipped build — §3) |

**THE DIAGNOSIS IS ONE LINE OF THE ENSEMBLE OUTPUT:**

> **peak population — 136 / 134 / 180. The one seed that reaches Icathia is the one seed inside
> §27's band. The two that do not are at 136 and 134, below it.**

Every other figure is tight across the three seeds — Sparks spreads ×1.01, Chemtech ×1.03.
**Population spreads ×1.34 and it is the only variable that sorts the seeds the way completion
does.** `pop130` has a median of **1,735.8 game-years**: the settlement spends seven tenths of the
run getting to 130 people.

**Parts 1 and 2 relieved the knowledge ladder exactly as specified — the per-rung cap took
142,410 → 94,451 and `ritesOfTargon` −58% — and both gates that measure the early knowledge ladder
cleared by wide margins. Completion was never gated on knowledge.** The last two rounds shared an
assumption nobody checked.

### The rule this earns, and it is a sibling of §13

> **A proposal aimed at COMPLETION must state which constraint it relieves, and demonstrate that
> constraint is the binding one.** §13 already says any proposal aimed at Era 3 must state which
> edge it moves. Knowledge was not the binding constraint on finishing; it was the constraint the
> previous round had most recently touched.

**The next round should be about population and nothing else.** See §6.

---

## 2. What the project is

A League-of-Legends-flavoured idle game in one HTML file, built with **Kittens Game as its balance
authority**. Not as inspiration — as an authority. STANDING-RULINGS §16 makes source parity of
timing and scale the primary goal, and `docs/PARITY-LEDGER.md` is the instrument. **The ledger is
finished: 225 rows, UNVERIFIED 0.**

---

## 2a. AND THERE ARE TWO ENSEMBLES, BECAUSE OF §32 — READ THIS BEFORE QUOTING A NUMBER

**STANDING-RULINGS §32 is new this round and it changes how every pacing figure in this project
must be read.** `sim/simcore.mjs:21` gives the whole game ONE xorshift stream, so **the number of
`Math.random()` calls a code path makes is part of the seed.** Part 6 changes how often a random
event fires. **The shipped build's seeds are therefore a FRESH SAMPLE, not a delta.**

| | **gate ensemble (Parts 1+2)** | **shipped ensemble** |
|---|---|---|
| comparable to v0.62 seed-for-seed | **YES** | **NO — re-rolled** |
| Icathia | 1 of 3 | **2 of 3** (1,473.8 / 1,704.3 / never) |
| Era 3 | unscoreable (1 seed) | **982.8** (843.2–1,122.3) — the shortest measured |
| peak population | 136 (136/134/180) | **148** (154/148/99) — seed 1 INSIDE the band |
| **crystals time-at-cap** | 96.2% | **25.0%** (28.4/25.0/42.1) |
| first champion spread | ×1.30 | **×3.51** |
| Sparks spread | ×1.01 | **×1.71** |
| conditions failing | **1 of 10** | 5 of 10 |

**Quote the gate ensemble for anything compared against v0.62. Quote the shipped ensemble for
anything about the shipped file — above all the crystal result, which is unambiguous.**

**The exploding spreads are the champion gate, not the balance.** Sparks requires a Piltover/Zaun
champion (§4, the 3-of-10 sanctioned exception), so a re-rolled stream that draws those three late
pushes Sparks and everything downstream late. **The tight Sparks medians this project has quoted
for many rounds are partly an artefact of three seeds that agreed.**

---

## 3. The four things v0.63 should change about how you work

**THE NUMBER OF RANDOM DRAWS IS PART OF THE SEED — §32, and it is the finding of the round.** A
change that altered no rate, no price and no multiplier moved Rites of Targon from y69.3 to y90.1
on the same seed: Part 6's chronicle batching returned early before the line that picks a message
string, one draw fewer per suppressed event. **Fixed by drawing first and branching second, and the
neutrality is PROVED**: the shipped file with Part 6's rate reverted to linear reproduces the Parts
1+2 build's seed-1 figures **to the digit** (69.3 / 84.9 / 193.2 / 270.8). **That reproduction also
proves Parts 3, 4, 5, 7, 8.2 and dev note 1 are collectively pacing-neutral over 300 game-years.**

**RULE OUT THE OBVIOUS SUSPECT BY MEASUREMENT, NOT BY ARGUMENT.** The first hypothesis for the
regression was Part 3.3's renown cut, which the spec had itself predicted would bite. **Reverting
ALL of Part 3's magnitudes changed the 300-year seed-1 run by NOTHING** — the government
philosophies are gated behind `callToArms` and the bot never reaches them. Two runs, four minutes,
and the round's whole diagnosis turned.

**A GUARD FINDS MORE THAN THE DEFECT THAT PROMPTED IT — WRITE THE GUARD, NOT THE FIX.** Jerry
reported ONE NaN tooltip. The guard written for it found **three more instances of the same
load-order defect on its first run**, none of which anyone had reported: `pressureRegulators`
("burn NaN% less"), `rollingPress` ("prints undefined parchment/second"), and `MANUFACTORY_FUEL`
undefined inside the `BUILDINGS` literal. **Same for the percentage-literal guard in Part 4**: it
was written for Jarvan and immediately found Heimerdinger's inlined `0.85`. Two dev notes, six
defects closed.

**A DEFECT THAT REPAIRS ITSELF IS A DEFECT NOBODY CAN SEE.** `MANUFACTORY_FUEL` was `undefined` at
the Manufactory's `convert.input.crystals` and it never showed, because `computeRates()` rewrites
that field from state on every call. **No string guard would have found it** — it took a companion
assertion that every `cost`, `prod`, `caps` and `convert` field is finite at load. The two earlier
instances of rule 11 crashed the page and were caught the same day; the ones that do not throw are
the ones that live for rounds.

**CHECK THE INSTRUMENT BEFORE READING IT — AGAIN.** The Targon canvas assertion scanned the whole
banner for "near-white" pixels and reported the peak as reaching **±108px** when its half-width is
11. The crescent at (212, 26) is `PAL.goldBright` too, and so are the stars. Scoped to the summit
column it reads ±11 correctly. **This is §8's own rule one level up, and it would have produced a
confident wrong measurement in a build report.**

**A FRACTION CANNOT ANSWER A QUESTION ABOUT AN ABSOLUTE.** The spec asked for the steel ceiling
"before and after"; the milestone snapshot carried `heldOverCap`, a *fraction*, and a ceiling that
doubles while the stock doubles reads identically at 100%/100%. The snapshot now emits absolute
`cap` and `held` per resource. **The same shape of error is why Part 8.2 exists** — a drain sized
as a share of gross cannot hit a target expressed about a stock.

---

## 4. The laws the game is built on

- **Kittens ticks 5/s.** `TICK_MS = 200` is exact tick parity.
- **`limitedDR(x, L)` is LINEAR only below 0.75·L.** The single most load-bearing fact in the file.
  **Four families are past it** — vigor discards 82.1%, devotion 46.4%, provisions 27.5%, mana
  14.3%. **No `BOOST_LIMIT` value moved this round or last; §16 makes them Jerry's.**
- **Converters: inputs FLAT, outputs multiplied.** The source's own asymmetry. **v0.62 put ONE
  input — the Manufactory's crystal fuel — on the yield's footing, and v0.63 adds a STOCK
  reference to that same one line.** Do not generalise either.
- **Cap families — TWO**, decided by `capFamilyOf()`.
- **§30:** reserved ids — `runestone`, `hunterLodge`, `lumberCamp`, `petricite`, `tavern`,
  `bloomery`, `refinedMetallurgy`, `kindling`, `championsRegimen`, `deepCartography`,
  `petriciteResonators`.
- **§31 is an OPEN QUESTION with its premise RETRACTED (§31.2a). Nothing has been collapsed. Until
  Jerry rules, no round may add a new multiplicative category** — both of this round's new
  production terms (Part 3.2's timber/ore boost, Part 3.3's hunt yield) land in EXISTING additive
  accumulators for exactly that reason.
- **`computeRates()` with no argument returns NUMBERS ONLY.** Everything else goes behind `bdRes`.

---

## 5. Operational rules, each of which has already cost a round

1. **Add a new building to `BUILD_ORDER` in the same commit that adds the building.**
2. **A per-part check must look at more than the part.**
3. **Instrument BEFORE you change the thing.** Part 2's steel ceiling needed a new readout first.
4. **Two-tier verification:** cheap single-seed checks per part; the ensemble at the end.
5. **`nproc` is 2 — give the ensemble the box.** A 3-seed 2,500-year run took **81 minutes** this
   round, against v0.62's 48. **It is longer BECAUSE a seed now finishes** — reaching Icathia means
   simulating Era 3 rather than stalling in it. Budget 80–100 minutes, not 50.
6. **Launch long runs with `setsid nohup … & disown` AND POLL CONTINUOUSLY.** `setsid` survives a
   turn interrupt; it does **not** survive the container being reclaimed in an idle gap, which
   killed two ensembles in v0.62. Polling keeps the session alive. Both of this round's ensembles
   completed.
7. **Run suites with `node tools/run-suites.mjs`.**
8. **An assertion satisfiable by the presence of TEXT is not testing behaviour.** All three of this
   round's banner changes are asserted by rendering and reading pixels.
9. **Never pin a literal version string in a suite.**
10. **Re-point superseded assertions, never delete them**, naming the superseding item. **Twelve
    this round** — build report §7.
11. **A `var` declared after an array literal but read INSIDE it is `undefined`, not an error.**
    **Four more instances found this round**, in three different arrays. When you add a constant a
    tooltip reads, declare it above every array that reads it — `BUILDINGS`, then `UPGRADES`, then
    `CHAMPS`, then `POLICY_GROUPS`.
12. **`computeRates()` with no argument must return numbers only.**
13. **VERIFY BEFORE BUILDING.** Dev note 7 said the Targon halo was "missing". It was not — it had
    rendered every frame for a round. Nothing was added; it was made visible.
14. **Push with the proxy unset, and scrub the token afterwards.**
15. **NEW — assert a guard by making it FAIL.** The percentage-literal guard is demonstrated on a
    planted `37.3%` and the real string restored. A guard nobody has seen fail is a guard nobody
    knows works.

---

## 6. What is open, and for whom

### FOR JERRY — one thing matters more than the rest

**POPULATION IS THE BINDING CONSTRAINT ON FINISHING THE GAME, and it needs a directive.** Peak
population has gone **179 → 135 → 136** over three rounds against §27's own 150–220 band, and this
round proved it is not cosmetic: the seed that reaches Icathia is the seed at 180. Two questions
are yours:

1. **Is the 150–220 band still what you want?** §27 says you may overturn it with a word. **My
   recommendation is to keep it** — this round is the first evidence the band is measuring
   something real rather than an invented target.
2. **Which of the five v0.62 changes gets relieved?** That round's handoff named the storage cut,
   the eightfold knowledge raise, the shrine morale cut, Marus, and Jarvan's re-scope as pushing
   the same way. v0.63 undid a third of the knowledge raise and relieved storage; **population did
   not move at all.** So it is one of the other three, or it is housing and food directly — and the
   next spec should MEASURE which before proposing anything.

Also still yours:

- **`BOOST_LIMIT.vigor` discards 82.1% of every vigor boost**, devotion 46.4%, provisions 27.5%,
  mana 14.3%. The diagnosis and honest tooltips shipped two rounds ago; the caps did not move.
- **§31's premise is retracted and the corrected section awaits your ruling.** RR has ~11
  multiplicative steps against the source's ~14.
- **`gear` costs steel 25 against Kittens' 15** — the one craft where RR asks more.
- **Three repeatable buildings diverge on `priceRatio`** — Hexdraulic Plant (1.25 vs 1.15),
  Watcher's Eye (1.25 vs 1.12), Shelter (2.20 vs 2.50).
- **Bulk trades under Caitlyn still pay 60 renown** (v0.59). Still open.

### FOR THE ANALYZER — what the next spec should be

1. **MAKE THE NEXT ROUND ABOUT POPULATION AND MEASURE BEFORE PROPOSING.** The instrument does not
   currently answer "what is capping population" — `maxPop()` is emitted but not decomposed. Add a
   housing/food decomposition to the milestone snapshot **first**, then size. Note that seed 1's
   final state reads `pop 136, maxPop 136` — **the settlement is AT its housing ceiling, not short
   of food**, which points at the housing line rather than at Farmsteads. That is a lead, not a
   conclusion; confirm it across seeds.
2. **CHECK WHETHER A CONSTRAINT BINDS BEFORE RELIEVING IT.** Build report §0.1 states the rule.
   Two rounds have now spent their largest lever on the knowledge ladder while the binding
   constraint was elsewhere.
3. **The 2.43× cap is the source's MEAN, not its median.** My re-run of the Kittens census puts the
   per-rung figure at median 2.07 / mean 2.41 / max 6.25. **2.43 shipped as specified and the
   disagreement is recorded** (build report §1.2). If a future round wants to tighten it, 2.07 is
   the better-sourced number — but note the cap's justification is CONCENTRATION (one rung carrying
   48% of the game's total), not that 5.73× was out of the source's range, because it was not.
4. **Part 8.2 CLEARED ITS TARGET AND THE MARGIN IS LARGE — do not tune it further without a
   reason.** Crystals time-at-cap **95.6% → 25.0%**, met on all three seeds against a "<70% on at
   least one" condition. The final-state decomposition reads **drain 12.34/s against gross 11.10/s
   — 111% of gross, net −1.245/s** — the sink exceeds the faucet near the ceiling, which is the
   fixed point the design wanted. `MANUFACTORY_FUEL` was not touched for the fifth round. **If a
   future round wants it gentler, `CRYSTAL_SINK_MAX` is the one constant to move**, and the curve
   is inert below half fill by construction.
5. **The ledger is finished, so parity work is MAINTENANCE.** The generator aborts on
   RR-ORIGINAL+UNVERIFIED and on an unverified row with no recorded retrieval attempt.

---

## 7. Where the docs live

| file | what it is |
|---|---|
| `STANDING-RULINGS.md` | the settled law, §§1–31 — **§31 is an OPEN QUESTION with a RETRACTION at §31.2a** |
| `docs/PARITY-LEDGER.md` | **generated** — edit the verdict map, never the file |
| `docs/BUILD-REPORT-v0.63.md` | this round |
| `tools/kittens-upgrade-census.mjs` | **new** — the source census, re-runnable against a clone |
| `tools/rung-burden.mjs` | **new** — RR's per-rung discovery burden, read from the MUTATED arrays |
| `tools/run-suites.mjs` | the suite runner. `--selftest` demonstrates the guard |
| `docs/analyzer-status.md` | the cycle table — updated by the round that ships |

---

## 8. Pushing

```bash
git remote set-url origin "https://x-access-token:<PAT>@github.com/jouyang01/RR.git"
env -u HTTP_PROXY -u HTTPS_PROXY -u http_proxy -u https_proxy -u ALL_PROXY \
  git push origin main --follow-tags
git remote set-url origin https://github.com/jouyang01/RR.git
```
