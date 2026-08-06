# BUILD REPORT v0.57 — the spread collapses from ×2.6 to ×1.07, and Era 3 lands in its target band on every seed

Shipped as **v0.57**, tagged `v0.57`. `VERSION`, the footer and the tag agree.

Seven parts, six cumulative prefixes, **26 live suites, 1,273 assertions, 0 failures**, and — per
`BUILDER_PROTOCOL.md` — **six fast single-seed per-part checks plus exactly one full-rigour gate:
a three-seed, 2,500-year ensemble run concurrently in 2,561.6 s of wall clock.**

**The round has one headline and it is the apparatus item, not a game change.**

> **v0.56 measured a 2.6× Era-3 spread on one build and could not tell whether the chaos came
> from the game or from a bot with no food policy. It was the bot.** Part 4 taught `manageJobs()`
> to project to Deepwinter and to pull a worker off another job when nobody is idle. Measured on
> three seeds of the shipped build:
>
> | | v0.56 | **v0.57** |
> |---|---|---|
> | Era 3, per seed | 700.6 / 1,709.3 / 1,835.3 | **1,672.1 / 1,734.6 / 1,784.1** |
> | **spread** | **×2.62** | **×1.07** |
> | median | 1,709.3 | **1,734.6** |
> | seeds inside the 1,400–2,300 target | 2 of 3 | **3 of 3** |
>
> **The project can compare builds again.** Part 4's hypothesis was stated in the spec as the
> thing to test — *"a settlement which responds to hunger has a narrower Era-3 distribution"* —
> and it is confirmed at a factor of 2.4× narrower. The spec also said: if it does not narrow,
> the ensemble becomes permanent apparatus rather than a bridge. It narrowed.

> **And the tenth champion exists now.** It was never affordable inside 2,500 game-years on any
> prior build. It arrives at **y1,450.7 / 1,570.7 / 1,640.8** — on every seed.

---

## 1. My errors, and the two arguments I had to withdraw

1. **I wrote a ruling into `sim/pacing.mjs` whose stated reason my own round then disproved.**
   Keeping the Convergence 5–8% condition, I argued it was worth keeping because *"the trend is
   MONOTONE TOWARD THE TARGET"* — 2.33% → 3.87% → 4.17/4.40%. **The v0.57 ensemble reversed it:
   1.42% / 2.87% / 3.71%, worse than v0.56 on every seed.** The argument is withdrawn in the
   source, the condition is kept on a better one (§7.2), and `test-v57` now pins the *withdrawal*
   — a suite that guards a claim its own round disproved is worse than no suite.

2. **I re-based Rites of Targon to y75 and it fails on two of three seeds** (70.3 / 76.7 / 83.3,
   median 76.7). The spec asked for a ruling with a reason; I gave one, and I sized the margin
   from v0.56's *two-seed* readings of y72.7 and y72.5 — before I had the instrument that would
   have told me the figure has a ×1.18 spread. **Sizing a threshold from a two-seed sample in the
   same round that builds a three-seed ensemble is the exact error the ensemble exists to
   prevent, and I made it anyway.** §7.2 says what should happen instead.

3. **I placed the Renown percentage before the three deed grants** and it multiplied only the
   building sum — ×1.7565 at ten Halls where the additive shape says ×1.80, a quarter of the line
   silently missing. Caught by writing the assertion as `1 + 0.08n` rather than pinning a
   measured number, which is the only reason it was visible.

4. **`test-v56` pinned `VERSION === "v0.56"` — the fourth consecutive round to make this
   mistake**, and the v0.57 spec §0.1 called it before it happened. Re-pointed to the shape.

---

## 2. Part 3 — the seed ensemble

`sim/pacing.mjs --seeds N` launches N seeds as **concurrent child processes** (2,500-year runs
take ~1,600 s alone; sequential N=3 would be over two hours) and reports **median, min, max and
spread** for every milestone-derived figure. Measured: **2,561.6 s for three concurrent seeds.**

**The output separates the two classes and labels them, and that separation is the Part.**
Milestone years, Era 3 and anything derived from them print under *"ENSEMBLE FIGURES — quote
these only with a spread"*; cap-out fractions, the morale band, peak population and delivered
multipliers print under *"SINGLE-RUN FIGURES — from the median seed"*, with every seed's value
shown beside it so the stability claim is checkable rather than asserted. **A report must not be
able to quote one as the other, so the output does not let it.**

Each child emits one `##MACHINE {json}` line that the parent aggregates and nothing else, so the
aggregation cannot drift from the prose printed above it. STANDING-RULINGS §25.

---

## 3. Part 4 — the bot's food policy, and why the old rule did nothing

`manageJobs()` staffed **one farmer** at every milestone, in every era, at every population from
36 to 220 — across five v0.56 slices and three rounds. The old rule read:

```js
if (provNet < 0.5 && idleCount() > 0) { assignTo("farmer", 1); return; }
```

and both halves were wrong for the settlement this game now produces:

- **`idleCount() > 0`** — once every wanderer holds a job the clause cannot fire *at all*, so a
  fully-employed settlement starves without ever reassigning anyone. That is the state the bot
  reaches by Sparks and never leaves.
- **`net("provisions")`** is *today's* net. In Firstbloom it reads healthy; the crisis arrives one
  season later. A policy that reacts to today is always three-quarters of a year late on a
  mechanic whose entire point is the calendar.

**The rule that ships, stated in the source because every future food number depends on it:**
project net provisions at the **worst seasonal multiplier of the coming year** (read
`computeRates()` with `S.tick` moved to a winter tick and put straight back — it is a pure read);
staff under projected deficit, taking an idle wanderer if there is one and otherwise **pulling
one off the largest non-farm job**; unstaff only when the stock is at ≥98% of ceiling **and**
projected winter net exceeds a stated headroom; never below one farmer and never past
`FARM_MAX_SHARE = 0.45` of the population, so the policy cannot collapse the settlement into a
monoculture. **No price was changed to compensate.**

Measured immediately on the per-part check: farmers at Sparks **1 → 17**, net provisions
**−27.9/s → +161.6/s**. After Part 2 removed the farmer's winter penalty the same policy settled
back to **4 farmers** — which is the policy working, not the policy being reverted.

---

## 4. Part 2 — farmers lose the season, and the charter closes its own loop

Jerry: *"the wanderers tab says Farmers (the harvest follows the calendar) when in reality,
Farmers provision production should not be impacted by winter."*

**The string he read was accurate, and that is the point.** v0.55 shipped seasonal farmers on a
directive whose stated premise — that Kittens' farmers are seasonal — the builder disproved from
`js/village.js updateResourceProduction()` in the same round, and it shipped labelled
**RR-ORIGINAL / HARDER**, the charter's first HARDER label, *precisely so this could be revisited
without re-deriving the argument*. Two rounds later Jerry read the label and reversed it.

**That is §16's labelling machinery working end to end**, and it is the strongest argument this
project has produced for why an honest label costs nothing and buys a great deal.

Shipped: the season term leaves the farmer job; the `desc` becomes plain *"+5 provisions/s"*; the
breakdown line drops its season clause. **Buildings with `seasonal: true` keep theirs** — that is
Kittens' catnip field, which *is* seasonal in the source. Measured:

| | spring | summer | autumn | winter |
|---|---|---|---|---|
| **farmer** | 49.5 | 49.5 | 49.5 | **49.5 — identical** |
| seasonal building | ×1.5 | ×1.0 | ×1.0 | **×0.25** |
| seasonal building, Leona leading | **×1.5 unchanged** | ×1.0 | ×1.0 | **×0.625** |

`LEONA_SEASON_RELIEF` and its load-bearing `m < 1` guard are untouched; her blast radius simply
returns to where it was before v0.55. **Consumption double-checked and unchanged: 4.25/s against
a 5.000/s farmer, ratio 1.17647 exactly**, now asserted so it stays that way.

STANDING-RULINGS §17 is **amended, not deleted** — the history is the ruling. Ledger row
**HARDER → PARITY.**

---

## 5. Part 1 — Renown leaves the material line, and the trigger fires

`js/resources.js addBarnWarehouseRatio` touches **seven material effect names and nothing else**.
Kittens relieves non-material ceilings by different machinery entirely — `libraryRatio` for
science, **Ziggurat +8% per copy** for culture, the Temple line for faith. **A non-material
resource on the material storage line is a category error in the source's own terms**, and Renown
— earned socially, spent on champions — is not a material. v0.56's placement of it in `broad`
(×2.80) was flagged in that round's own report as an RR-original design ruling rather than
parity; the directive replacing it is better grounded than the ruling was.

**Step 1 — the move, and an invariant that had to get stronger with it.** `renown` goes from
`CAP_SCOPE` into `SCHOLAR_CAPS`. Both `r !== "renown"` special cases are deleted. But the move
exposed something: until v0.57, `culture`, `devotion`, `knowledge` and `vigor` were each in **two
families** — listed in `CAP_SCOPE` as `"none"` while also being members of `SCHOLAR_CAPS` or
`CAP_MULT_EXEMPT` — with the storage loop's ternary silently deciding which one won. **Renown
joining `SCHOLAR_CAPS` while still reading `broad` would have made that table state a figure the
code did not deliver.** The invariant becomes **"exactly one family"**, decided in one place by
`capFamilyOf()` and asserted by enumeration.

**Step 2 — the trigger fired, on measurement, and the line shipped.** Jerry pre-authorised it
conditionally: ship if the tenth champion is not affordable within 2,500 game-years **or**
Renown's time-at-cap does not fall below 70%. Measured on the post-move build (1,400 years,
seed 1): **time-at-cap 88.7% → 83.1%, not below 70%**, and **no tenth champion**. Both halves.

`renownCapPct: 0.08` on the Hall of Heroes — **Kittens' own Ziggurat figure**, on the additive
per-copy shape RR already ships as `cultureCapPct`. Not a fourth Discovery chain: §19 ruled that
shape out for the material line and §23 dates the same fix for the Scholarship line. Sized at 20
copies and the count is stated:

| | bare | + 3-of-5 Scholarship |
|---|---|---|
| flat 250/copy only | 5,810 | 12,274 |
| **+ `renownCapPct 0.08` × 20** | **14,818** | **31,303** |

The tenth champion costs **9,611** in one lump and all ten cost **28,333** cumulatively. The flat
line covered the lump with 28% headroom and never came close to the cumulative figure.

**Part 1.4 — ten dead prices deleted.** Every champion carried a `renown:` figure in its `cost` —
Shaco 320 through Zilean 540, **4,140 in total — and not one was ever read**, because
`recruitCost()` builds the price from `RECRUIT_BASE × RECRUIT_RATIO^n` and copied only the
*non*-Renown components. Deleted rather than wired: wiring them would change the recruit ladder,
a balance change §5 forbids in a round already moving Renown's ceiling. **The `if (r !== "renown")`
guard went with them, and the two had to move together** — keeping the fields without the guard
would have let them silently override the ladder.

---

## 6. Parts 5 and 6 — two measurements that changed what the next round should do

### The Scholarship census, and it contradicts the spec's own assumption

The spec sized the v0.58 restructure against *"the 3-of-5 state the instrument actually
reaches"*, by analogy with v0.56's storage finding. **Measured on the full-length ensemble, the
instrument reaches 5 of 5:**

```
rungs reached: 5 of 5  [cataloguing, crossReferencing, greatIndex, annotatedIndex, livingLibrary]
delivered ×3.9926   fully stacked ×3.9926   the SAME MEMBERS READ ADDITIVELY: ×2.6000
delivered per resource: culture ×3.9926   devotion ×3.9926   renown ×3.9926
```

**So the v0.58 cut is 35%, not the 20% a 3-of-5 reading implies** — applied to `culture`, which
sits at **97.3% time-at-cap** on all three seeds. And Renown now rides the same line, so the cut
lands on the champion ladder too. This is exactly why Part 5 was a measurement and a dated
placement rather than a change: shipping it beside Part 1 would have made neither attributable.
STANDING-RULINGS §23.

### Pass condition 5 restated — a cap-out fraction only measures a stock-limited resource

v0.56 sized two Era-3 ceilings from cap-out fractions and moved them by 3 points and 0 points.
The snapshot now carries `held`, `gross`, `consumed`, `pcRatio`, `continuousConsumers` and
`lumpySinks` for every capped resource, and the answer is unambiguous:

| raw | cap-out | held/cap | gross | consumed | lumpy sinks | kind |
|---|---|---|---|---|---|---|
| zaunore | 55.8% | 0% | 18.25/s | 0/s | 2 | **lumpy sink only** |
| coalgas | 1.3% | 7% | 12.48/s | 13.48/s | 1 | flow-limited |
| hexore | 1.7% | 0% | 19.56/s | 0/s | 2 | **lumpy sink only** |
| shimmer | 85.6% | **100%** | 14.15/s | 0/s | 10 | **lumpy sink only** |

**Three of the four are lumpy-sink-only: nothing draws them per tick, so a high cap-out means
"the player sat full waiting to spend", and no ceiling change can move it.** The condition is
restated to apply the 30–60% band only to stock-limited resources — **on this evidence that is
currently none of them**, which is reported as a FAIL rather than tuned into a pass.

**Two traps found while building it, both worth the next round's attention.** `gross` must switch
off only the converters that **consume** the resource — switching off every converter reads
`gross 0/s` for zaunore, because the Sump Mine that *produces* it is a converter too. And the
lumpy-sink scan must read **dynamically priced** sinks: champion prices are built by
`recruitCost()`, not declared, so a static scan reported **Renown as having no sink at all**
moments after this very round moved its entire storage family. STANDING-RULINGS §24.

---

## 7. §7 — invariants re-pointed this round, with their superseding cause

| suite | assertion | disposition | superseded by |
|---|---|---|---|
| `test-v55` | *"farmer output takes the season at all four: ×1.5 / ×1.0 / ×1.0 / ×0.25"* | **INVERTED**, not deleted — it now asserts the farmer is **identical in all four seasons**, and that no season term survives on the job path | **Part 2.** A reversal, not a re-tune. A future round that re-seasons the farmer has to come back here and say so. |
| `test-v56` | *"the seasonal-farmer line v0.55 shipped is untouched (§17)"* | **RE-POINTED** to the **seasonal BUILDING** line, which is the one the source makes seasonal | **Part 2.** §17 is amended by the mechanism its own preamble provides for. |
| `test-v43` | *"Renown rises with the storage era on the warehouse (broad) tier"* | **RE-POINTED** — the Masonry line must not move Renown **at all**; the Scholarship line is what lifts it | **Part 1.** |
| `test-v44` | *"Renown rises sub-linearly against materials, on the warehouse tier"* / *"the Chemtech ceiling clears 9,611"* | **RE-POINTED** to ×1.00 from Masonry, and to the Scholarship ceiling | **Part 1.** |
| `test-v44` | `SCHOLAR_CAPS` is culture and devotion only | **RE-POINTED** to include renown; what it was always about — that Scholarship does not reach **knowledge** — is unchanged and still asserted | **Part 1.** |
| `test-v56` | *"every capped resource lands in exactly one TIER"* | **STRENGTHENED** to *"exactly one FAMILY"*, plus a new assertion that no scholar- or exempt-family resource is moved by the Masonry line | **Part 1.** The old guard would have passed while `renown` claimed ×2.80 and delivered the Scholarship product. |
| `test-v56` | the pass-condition-5 grep | **RE-POINTED** to the restated string; the instrumentation it actually guards is unchanged and now richer | **Part 6.** |
| `test-v56` | `VERSION === "v0.56"` | **RE-POINTED** to the `vN.NN` shape | **Ship discipline — the FOURTH consecutive occurrence**, and the spec predicted it. |
| `test-offline-v54` | the HEALTHY fixture's building counts, and its 0.02% tolerance | **RE-PROVISIONED** to 12 Storehouses / 90 Farmsteads; tolerance 0.02% → 0.05% | **Parts 2 + 4.** The v0.56 fixture now finishes **pinned at its ceiling** (42,000/42,000) with a drift of exactly 0.0000% — the saturated-fixture failure v0.55 caught, arriving from the other direction. The wider tolerance is the fixture getting *more* honest: less clamping, so less of the residual is erased by `min(x, cap)`. |

**Nothing was deleted to make a number green.** Three re-points added assertions. And while adding
Part 7.1's guard, the ledger's `carpentry` row was found to say **HARDER** in its verdict and
*"i.e. EASIER"* in its own note — the identical class of defect as the prose error that Part
exists to fix. Corrected to EASIER.

---

## 8. Pacing — one full-rigour gate, three seeds, run concurrently

Per `BUILDER_PROTOCOL.md`, per-part verification was **six fast single-seed short runs** (200–1,400
game-years) for gross-regression detection with immediate attribution, and the full multi-seed
full-length suite was run **exactly once, after every part was implemented**. That is a deliberate
change from v0.56's five full-length slice runs and it saved roughly three hours of wall clock;
the cost is stated in §10.

### The ensemble — 2,500 game-years, seeds 1–3, 2,561.6 s wall

| figure | median | min | max | spread | per seed |
|---|---|---|---|---|---|
| **Era 3** | **1,734.6** | 1,672.1 | 1,784.1 | **×1.07** | 1,734.6 / 1,672.1 / 1,784.1 |
| Sparks | 157.2 | 137.4 | 187.7 | ×1.37 | 137.4 / 157.2 / 187.7 |
| Icathia | 1,872.0 | 1,829.3 | 1,971.8 | ×1.08 | 1,872 / 1,829.3 / 1,971.8 |
| **tenth champion** | **1,570.7** | 1,450.7 | 1,640.8 | ×1.13 | **reached on all three — never on any prior build** |
| Rites of Targon | 76.7 | 70.3 | 83.3 | ×1.18 | 70.3 / 76.7 / 83.3 |
| 130 wanderers | 1,594.2 | 1,415.4 | 1,726.5 | ×1.22 | 1,726.5 / 1,415.4 / 1,594.2 |
| Deep Works | 1,456.0 | 1,369.0 | 1,514.2 | ×1.11 | |
| first trade | 350.8 | 317.2 | **1,414.8** | **×4.46** | the one figure still wildly chaotic |

**Single-run figures, all three seeds shown so the stability claim is checkable:**

| | seed 1 | seed 2 | seed 3 |
|---|---|---|---|
| peak population | 185 | 181 | 185 |
| morale band after y60 | 100% | 100% | 100% |
| Renown at cap | 72.8% | 71.7% | 72.9% |
| culture at cap | 97.3% | 97.2% | 97.1% |
| crystals at cap | 96.3% | 95.2% | 94.9% |
| provisions at cap | 46.6% | 49.1% | 54.2% |
| Convergence at Sparks | 1.42% | 2.87% | 3.71% |

### Predicted vs measured

| slice | predicted Era 3 | measured |
|---|---|---|
| v0.56 baseline | 1,709.3 median, 700.6–1,835.3 | reproduced by the analyzer independently |
| shipped | **700–1,400**, *"likely below the target band, and that is acceptable"* | **1,734.6 median, 1,672–1,784 — ABOVE the predicted band and INSIDE the 1,400–2,300 target on every seed** |

**The prediction missed high, and the reason is the one the spec asked to be tested.** It assumed
Part 2's production increase would shorten Era 3 by 150–450 and Part 4's policy would land
somewhere in 900–1,700. What actually happened is that Part 4 removed the *stalls* — the
thousand-year troughs where a starving settlement stopped progressing — and those troughs were
what made seed 1 read 700.6 in v0.56. Removing them raised the floor far more than Part 2's
extra food lowered the ceiling.

**The spec's two informative failures to watch for, both answered.** Peak population did **not**
return to ~220 — it reads 181–185, so the food ceiling is still binding and morale's band holds
at 100% on every seed. And Renown's time-at-cap **did** fall, 88.7% → 71.7–72.9%.

### Round pass conditions from the ensemble

| # | condition | target | result |
|---|---|---|---|
| 1 | `renown` in exactly one cap family | enumerated; no `!== "renown"` survives | ✅ |
| 2 | Renown time at cap | 3 seeds; **< 70%** or the line ships | ⚠️ **71.7 / 72.8 / 72.9 — the line shipped, and it is still 1.7 points above the trigger** |
| 3 | Tenth champion affordable within 2,500 y | median seed | ✅ **y1,450.7 / 1,570.7 / 1,640.8 — all three** |
| 4 | Ten dead `renown:` fields | deleted or wired, asserted | ✅ deleted, asserted |
| 5 | Farmer output across four seasons | **identical**; no string says otherwise | ✅ |
| 6 | Seasonal buildings | ×1.5/×1.0/×1.0/×0.25; Leona ×0.625 winter, ×1.5 spring | ✅ |
| 7 | §17 amended, ledger row HARDER → PARITY | | ✅ |
| 8 | `CONSUMPTION` 4.25, ratio 1.17647 | unchanged, asserted | ✅ |
| 9 | Ensemble mode ships | median + spread for every milestone figure | ✅ |
| 10 | Bot food policy | shipped, rule in a comment; spread before/after | ✅ **×2.62 → ×1.07** |
| 11 | Scholarship censused; restructure dated to v0.58 | | ✅ **5 of 5 rungs, not 3** |
| 12 | Pass condition 5 restated | producer/consumer for shimmer, hexore, coalgas | ✅ restated; **reports FAIL honestly** |
| 13 | `held/cap` + P/C ratio in the snapshot | every capped resource | ✅ |
| 14 | Ledger prose corrected; summary-vs-rows guard | | ✅ **220 rows — PARITY 54, EASIER 38, HARDER 1, UNVERIFIED 127**; generator now aborts if the buckets do not sum |
| 15 | Rites and Convergence ruled with a reason | | ⚠️ **both ruled; the Rites re-base is wrong — see §1.2** |
| 16 | Unchanged set | ×20.8000 · 7 keys · limit 6 · ladder 37/9/1.1111/1.2632/3.333 · audits 0/0 · Σ 4.35/1.80 | ✅ |
| 17 | Every Part actioned | | ✅ |

**Milestone pass conditions in the harness: 8 of 10 on the median seed.** The two failures are
**130 wanderers** (y1,415–1,726 against y600 — the direct consequence of a food ceiling that
binds, and it got worse) and **Convergence** (1.42–3.71% against 5–8%, and it **regressed** this
round). Rites passes on seed 1 and fails on seeds 2 and 3 against my own re-base.

---

## 9. The suites

**26 live suites, 1,273 assertions, 0 failures.**

```
test-v32  67   test-v39  70   test-v45  59   test-v52  31
test-v34  41   test-v40  60   test-v46  50   test-v53  72
test-v35  46   test-v41  61   test-v47  52   test-v54  60
test-v36  44   test-v42  51   test-v48  54   test-v55  67
test-v37  38   test-v43  40   test-v49  37   test-v56  49
test-v38  33   test-v44  63   test-v50  34   test-v57  53   ← new
test-offline-v54  25          test-banner-v51  16
```

---

## 10. Open, for the analyzer

1. **Re-base Rites of Targon from the ensemble, not from two seeds.** My y75 fails on two of
   three (70.3 / 76.7 / 83.3, ×1.18 spread). **The right move is to state milestone conditions as
   a MEDIAN with a spread now that the instrument reports both** — a scalar threshold on a figure
   with a 13-year spread is a coin toss. That reframing applies to every milestone condition in
   `sim/pacing.mjs`, not just this one, and it is the natural follow-on to Part 3.
2. **Convergence regressed and the reason is probably this round's own work.** 4.17/4.40% →
   1.42/2.87/3.71%. Worship is ascent-driven and the food policy holds population lower for
   longer. It is kept as a deferred-work marker; **the Convergence round is now five times
   deferred and should be taken.**
3. **The Scholarship restructure is a 35% cut, not 20%.** The instrument reaches **5 of 5** rungs,
   not the 3 of 5 the spec assumed. Size v0.58's first slice against that, and against
   `cultureCapPct` (Ziggurat +8%), with `renown` now riding the same line.
4. **Renown's time-at-cap is 72% and the trigger wanted <70%.** The dedicated line moved it 88.7
   → 72 and made the tenth champion reachable, which was the substantive half. Whether the last
   two points are worth a second copy-percentage or whether **Renown is partly lumpy-sink-bound
   too** (it now shows in the "sitting at their ceiling waiting to spend" list) is next round's
   measurement — §24 gives the instrument for it.
5. **`firstTrade` still spreads ×4.46** while everything else collapsed to ×1.07–1.37. That is now
   the single most chaotic figure in the game and it points straight at the **trade-banking
   policy**, deferred four rounds. It is the same class of defect Part 4 just fixed for food.
6. **130 wanderers reads y1,415–1,726 against y600** and got worse. Peak population is 181–185.
   **Rule on target population** — every other number in this round improved because population
   stopped running away, and the condition has now failed five rounds.
7. **`XP_PER_SECOND` is still UNVERIFIED**; `skillXP` remains the highest-value open lookup.
8. **127 UNVERIFIED ledger rows** — unchanged this round, but the Wilds block (12 rows) was taken
   and the total grew to 220 because expeditions joined the enumeration.
9. **Carried:** the craft-depth tie-break (Riftsteel never forged; voidessence monotone); the
   Chembarrel / visible-building fix; **culture 97.3% and crystals 96.3%**, still the two worst
   readings in the game.

---

## 11. Files

| file | what changed |
|---|---|
| `index.html` | Parts 1 and 2, `VERSION = "v0.57"` |
| `sim/pacing.mjs` | **Part 3's ensemble mode**; Part 5's Scholarship census; Part 6's restated condition; Part 7.2.6's two rulings |
| `sim/simcore.mjs` | **Part 4's food policy**; the Scholarship and resource-balance snapshots; the tenth-champion milestone |
| `tools/parity-ledger.mjs` | the Wilds block, the Part 2 reversal, the Renown rows, and **a generator that aborts rather than write a ledger that does not add up** |
| `docs/PARITY-LEDGER.md` | 220 rows — PARITY 54, EASIER 38, HARDER 1, UNVERIFIED 127 |
| `tests/test-v57.mjs` | **new** — 53 assertions, the seventeen pass conditions in spec order |
| 6 shipped suites | re-pointed per §7 |
| `snapshots/v57/s1–s5` (+ `s4a`) | the cumulative prefixes; `s4a` is the pre-step-2 build the Part 1 trigger was measured on |
| `STANDING-RULINGS.md` | §17 amended; §§22–25 added |
