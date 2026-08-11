# HANDOFF v0.62 — Runeterra Reclaimed

Written for whoever picks this up next, with no memory of this session.

---

## 1. What the project is

A League-of-Legends-flavoured idle game in one HTML file, built with **Kittens Game as its balance
authority**. Not as inspiration — as an authority. STANDING-RULINGS §16 makes source parity of
timing and scale the primary goal, and `docs/PARITY-LEDGER.md` is the instrument.

**As of this round the ledger is FINISHED: UNVERIFIED is zero.** Every one of 225 rows carries a
verdict argued or retrieved against a pinned revision of the source.

---

## 2. The four things v0.62 should change about how you work

**READ THE WHOLE SOURCE CHAIN BEFORE COMPARING AGAINST PART OF IT. THIS PROJECT HAS NOW MADE THE
SAME MISTAKE THREE TIMES.** v0.60 reported the converter stack at ×19.77 by multiplying two RR
categories and comparing against one Kittens category. v0.61 caught that — and then wrote §31 on
"RR's stack is ×9.3 the source's", which compares RR's *whole stack* against one Kittens category.
**Kittens' full production chain has roughly fourteen multiplicative steps; RR has about eleven.**
Every one of these was a real measurement compared against the wrong denominator.

**A CEILING THAT THE SOURCE DOES NOT HAVE NEEDS A REASON THE SOURCE DOES NOT SUPPLY.** v0.61
shipped `TRADE_YIELD_LIMIT` because RR's trade→transmute cycle crosses gain 1 at 133 Trade Docks.
**Kittens has the same cycles and ships the same base-resource craft.** What bounds the source's
loops is a per-trade tax in resources the cycle does not produce — and **RR already had it, and
nobody had costed it.** Before adding a bound the source lacks, ask what the source uses instead.

**WHEN A PRICE IS DENOMINATED IN SOMETHING THAT PLATEAUS, IT STOPS BEING A PRICE.** The festival
cost `60 × pop`; population plateaus near 200 while the provisions ceiling grows **×11.3**, so it
cost 15% of the ceiling at Sparks and **1.3% at Icathia**. **This is the second instance of one
bug shape** — v0.61's trade provisions cost was the first. **Check every remaining flat or
per-head price against the ceiling it is supposed to bind.**

**A CONDITIONAL CHANGE MUST BE MEASURED FROM THE COUNTERFACTUAL, NOT FROM THE SHIPPED STATE.**
Part 4.1 ships only if the shrine term exceeds half of total morale. It measured **79.2% before
the cut and 40.0% after.** Measuring after would have "proved" the branch should not have been
taken. `test-v62` computes the pre-cut share from `limitedDR` at the old rate.

---

## 3. The laws the game is built on

- **Kittens ticks 5/s.** `TICK_MS = 200` is exact tick parity.
- **`limitedDR(x, L)` is LINEAR only below 0.75·L.** This is the single most load-bearing fact in
  the file and **two families are far past it** — see §4.
- **Converters: inputs FLAT, outputs multiplied.** The source's own asymmetry, confirmed at the
  Calciner and the Smelter. **v0.62 Part 7 puts ONE input — the Manufactory's crystal fuel — on the
  yield's footing, and that is scoped deliberately**; do not generalise it.
- **Cap families — TWO**, decided by `capFamilyOf()`.
- **§30:** reserved ids — `runestone`, `hunterLodge`, `lumberCamp`, `petricite`, `tavern`,
  `bloomery`, `refinedMetallurgy`, `kindling`, `championsRegimen`, `deepCartography`,
  **`petriciteResonators`**.
- **§31 is an OPEN QUESTION and its premise was RETRACTED this round** (§31.2a). **Nothing has
  been collapsed. Until Jerry rules, no round may add a new multiplicative category.**
- **`computeRates()` with no argument returns NUMBERS ONLY.** Everything else goes behind `bdRes`.
  **This rule was written at v0.61 and broken at v0.62 by its own author** — `_knee` was attached
  unconditionally and `test-v44` caught it again.

---

## 4. The state of the build — and the thing most worth your attention

**Shipped v0.62.** 33 suites. Parity ledger: **225 rows — PARITY 87, EASIER 117, HARDER 21,
UNVERIFIED 0.**

### THE KNEE AUDIT IS THE FINDING OF THE ROUND

`limitedDR` is linear only below 0.75·L. Measured on a fully maxed state:

| family | L | knee | raw Σ | delivered | thrown away |
|---|---|---|---|---|---|
| **vigor** | 1.0 | 0.750 | **4.581** | 0.985 | **78.5%** |
| **devotion** | 2.0 | 1.500 | **4.024** | 1.917 | **52.4%** |
| mana | 1.0 | 0.750 | 0.750 after Part 4.2 | 0.750 | 0% — **exactly ON the knee** |
| **crystals** | 2.0 | 1.500 | **1.4999** | 1.4999 | 0% — **0.0001 from the knee** |
| gold | 1.5 | 1.125 | 1.031 | 1.031 | 0% |
| provisions / culture | | | | | 0% |

**A player who buys a +25% vigor upgrade receives about +0.4%.** The tooltips now say so — that is
what shipped. **NO `BOOST_LIMIT` VALUE MOVED: raising a cap is a large production change and §16
makes it Jerry's.**

**Two families now sit exactly on their knee.** The next mana boost and the next crystal boost, of
any size, are the first that will not pay in full. `test-v62` asserts crystals against its knee so
the next round that adds one trips a test rather than a player.

---

## 5. Operational rules, each of which has already cost a round

1. **Add a new building to `BUILD_ORDER` in the same commit that adds the building.**
2. **A per-part check must look at more than the part.**
3. **Instrument BEFORE you change the thing.**
4. **Two-tier verification:** cheap single-seed checks per part; the ensemble once, at the end.
5. **`nproc` is 2 — give the ensemble the box.** Running the suite runner alongside it roughly
   doubles both. (Done anyway this round, knowingly, because the suite pass is short.)
6. **Launch long runs with `setsid nohup … & disown`.**
7. **Run suites with `node tools/run-suites.mjs --selftest`.**
8. **An assertion satisfiable by the presence of TEXT is not testing behaviour.** v0.61's festival
   chip. **This round's two Crest banner states are asserted by holding the buff, reading the
   canvas, expiring it and reading again** — and note that **byte-identity to the never-held frame
   is the wrong test**, because these scenes animate; assert that the buffed and lapsed states
   DIFFER.
9. **Never pin a literal version string in a suite.** Nine unpicked.
10. **Re-point superseded assertions, never delete them**, naming the superseding item.
11. **A `var` declared after the `UPGRADES` array but read inside it is `undefined`, not an
    error.** Three page-downs across two rounds.
12. **`computeRates()` with no argument must return numbers only.** Broken again this round.
13. **VERIFY BEFORE BUILDING.** Dev note 4 asked for a Shaco refund distribution the bulk path
    already produced — `runExpeditionBulk` loops the single-hunt resolution, so every roll was
    already independent. **Nothing was built and the distribution was asserted instead.**
14. **Push with the proxy unset, and scrub the token afterwards.**

---

## 6. What is open, and for whom

**For Jerry:**

- **`BOOST_LIMIT.vigor` discards 78.5% of every vigor boost, and devotion 52.4%.** The diagnosis
  and the honest tooltips shipped; **the caps did not move, because §16 makes that yours.** Raising
  `vigor` from 1.0 would be a large production change — the whole vigor economy would roughly
  double at the top of the stack.
- **§31's premise is retracted and the corrected section is waiting for your ruling.** RR has ~11
  multiplicative steps against the source's ~14. **The four-category proposal rested on a number
  that does not survive the full read.**
- **The Warehouse and Harbor cut is the round's largest single pacing term.** Timber, ore and gold
  ceilings all fall materially. §11 has the measured effect.
- **`gear` costs steel 25 against Kittens' 15** — the one craft in the whole ledger where RR asks
  more, and it feeds the Workshop line and every hextech chain.
- **Three repeatable buildings diverge on `priceRatio` and it compounds**: the Hexdraulic Plant
  (1.25 vs 1.15) and the Watcher's Eye (1.25 vs 1.12) are 2.1× and 2.7× dearer than the source at
  ten copies; the Shelter (2.20 vs 2.50) is 3.2× cheaper.
- **Bulk trades under Caitlyn still pay 60 renown** (v0.59). Still open.
- **§27, the population band** (150–220). Still yours to overturn with a word.

**THE PACING GATE FAILED 4 OF 10 AND THAT IS THE FIRST THING TO READ.** Era 3 was reached on
**one seed of three**; two never reach Icathia in 2,500 years. Peak population fell **179 → 135**,
below §27's band. First champion 87.3 → 129.6. **No single change did this — five did, together,
and they all push the same way**: the storage cut, the eightfold knowledge raise, the shrine
morale cut, Marus, and Jarvan's re-scope. **BUILD REPORT §13 says which one I would take back
first and why** (the knowledge divisor — the only magnitude in the round that was mine rather than
directed or derived, and it spread a band designed for ten discoveries across twenty-two).

**For the analyzer:**

1. **Check every remaining price denominated in something that plateaus.** Two instances of that
   bug shape have now been found in two rounds. Population, building count and flat literals are
   all suspect against ceilings that grow ×11 over a run.
2. **The knee audit is an instrument now — use it to size the next boost BEFORE proposing it.**
   Two families are on their knee and gold is at 92%.
3. **`gear`, and the three price ratios.** All four are single-number divergences with citations,
   which makes them the cheapest parity work left now that the ledger is finished.
4. **Part 10's spread decomposition was NOT RUN — see §11.** It remains the project's
   longest-standing open measurement.
5. **The ledger is finished, so the next parity work is MAINTENANCE, not discovery.** The
   generator aborts on RR-ORIGINAL+UNVERIFIED and on an unverified row with no recorded retrieval
   attempt; both guards are load-bearing now that the set is empty.

---

## 7. Where the docs live

| file | what it is |
|---|---|
| `STANDING-RULINGS.md` | the settled law, §§1–31 — **§31 is an OPEN QUESTION with a RETRACTION at §31.2a** |
| `docs/PARITY-LEDGER.md` | **generated** — edit the verdict map, never the file |
| `docs/BUILD-REPORT-v0.62.md` | this round |
| `docs/specs/rr-analyzer-v062-spec.md` | the spec as issued |
| `tools/run-suites.mjs` | **the suite runner.** `--selftest` demonstrates the guard |
| `docs/analyzer-status.md` | the cycle table — **updated by the round that ships** |

---

## 8. Pushing

```bash
git remote set-url origin "https://x-access-token:<PAT>@github.com/jouyang01/RR.git"
env -u HTTP_PROXY -u HTTPS_PROXY -u http_proxy -u https_proxy -u ALL_PROXY \
  git push origin main --follow-tags
git remote set-url origin https://github.com/jouyang01/RR.git
```
