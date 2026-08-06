# BUILDER SPEC v0.57 — Renown is at its ceiling 89% of the run, and the line Jerry wants to move it onto is at 97%

Written against the **v0.56 tag**, verified from disk on a fresh clone.

**Verified, and it all reproduces.** All 25 suites: **1,219 assertions, 0 failures** — including
`test-v32`, which the analyzer flagged last round and which now passes; the builder's fix and
diagnosis match mine exactly. **Two independent 2,500-year runs reproduce the report's seed
ensemble to the digit:** seed 1 → Sparks y200.7, Icathia y901.3, **Era 3 700.6**, 130 wanderers
y750; seed 2 → Sparks y187.1, Icathia y1896.4, **Era 3 1,709.3**, 130 wanderers y1472.1. The
**2.6× spread is real and independently confirmed**, and so is the claim that the non-chaotic
figures agree: morale band **100%** on both, peak pop 180 / 185, Rites y72.7 / y72.5,
Convergence 4.17% / 4.40%, culture at cap 97.3% / 97.2%, crystals 95.9% / 96.2%.

**And every code claim verifies:** `VERSION v0.56`, `CONSUMPTION 4.25` with farmer:eater
**1.17647 exactly**, `XP_PER_SECOND 0.5`, `XP_CAP 25,556`, `LEONA_SEASON_RELIEF 0.5` giving
winter **×0.625** and spring **×1.5 unchanged**, Storehouse provisions **5,000**, Harbor
**2,500**, the Warehouse's `capsIf: { chemtechSilos → provisions 750 }`, `BARN_LINE` Σ **4.35**
and `WAREHOUSE_LINE` Σ **1.80**, the four tiers measuring **×14.98 / ×2.80 / ×2.0875 / ×1.00**,
`RECRUIT_BASE 250 × 1.5ⁿ` putting the tenth champion at **9,611**, the ladder at 37 · 9 ties ·
×1.1111 · ×1.2632 · ×3.333, and both audit graphs zero.

**One number is wrong in four places, and the generated artefact is the one that is right.**

> BUILD REPORT §7 and §11, HANDOFF §4 and `docs/analyzer-status.md` all quote the ledger as
> *"208 rows — PARITY 50, **EASIER 32**, HARDER 2, UNVERIFIED 127."* **That sums to 211.**
> `docs/PARITY-LEDGER.md` itself — the file `tools/parity-ledger.mjs` generates and `test-v56`
> asserts by enumeration — says **EASIER 29**, and 50 + 29 + 2 + 127 = **208**, which is the row
> count I measured independently. **The ledger is correct; the prose summary is wrong in four
> documents.** `test-v56` asserts the ledger against the live game and nothing asserts the prose
> against the ledger. Part 7.1.

---

## Part 0 — Ground rules

### 0.1 Version, rulings, and the one ruling this round reverses

**This spec produces `v0.57`.** Tag authoritative (§10). Assert the `vN.NN` shape everywhere
except this round's own suite — the literal-pin mistake has now recurred in four consecutive
rounds.

**Do not re-open** STANDING-RULINGS §§1–21, **with one exception, which is an explicit new
ruling from Jerry and therefore exactly the mechanism §17's own preamble provides for:**

> **§17 — "Kittens' farmers are NOT seasonal, and RR's are anyway, deliberately and labelled" —
> is REVERSED by Jerry in v0.57.** See Part 2. The reversal moves RR *toward* the source, so
> the ledger row goes **HARDER → PARITY** and the project's HARDER count falls from 2 to 1.

Everything else stands: storage scope is closed (§19) and must not become multiplicative again;
the food stores hold Kittens' figures (§20); a test that captures a baseline from live state
must reset it (§21); `test-v32` does not flake under contention.

### 0.2 The charter, and what it means for this round's numbers

§16: the source is the balance authority, the simulator is an instrument. v0.56 turned that from
a principle into a measured fact — **a 2.6× Era-3 spread on one build** — so this round inherits
a hard rule from HANDOFF §2: **no milestone-year claim from a single seed.** Part 3 makes that
affordable; until it lands, every pacing statement below is written as a median-of-three with the
spread stated.

The things that are **not** chaotic and can still be compared on one run: cap-out fractions,
morale band, peak population, delivered multipliers, and anything `tests/` measures. Both of my
seeds agree on all of them.

---

## Part 1 — Renown leaves the material line (Jerry's directive 1)

> Jerry: *"Renown should not be in materials storage cap multiplier. Renown should be in
> Culture/Devotion's cap multipliers line. If the culture and devotion multipliers are not
> sufficient for renown to unlock all champions, then we will need to create a new discovery
> line specifically for renown to allow for this."*

### 1.1 Where Renown sits today, and why the directive is right

v0.56 Part 5 retired `Math.sqrt(masonryMult)` — there is no longer a product to take a root of —
and placed Renown in `CAP_SCOPE` as **`broad` (×2.80)**, alongside gold, the Zaun raws and
crystals. The report states the reasoning plainly: *"Gold's role is the closest either has"*, and
flags it as an **RR-ORIGINAL design ruling**, not parity.

**The directive is better grounded than the ruling it replaces, and the source supplies the
structure even though Renown itself has no counterpart.** `addBarnWarehouseRatio`
(`js/resources.js`) touches **seven material effect names and nothing else** — wood, minerals,
iron, coal, titanium, gold, catnip. Kittens relieves its *non-material* ceilings by entirely
different machinery: science through `libraryRatio` (an Observatory-count multiplier on the
Library), culture through **Ziggurats at +8% each**, faith through the Temple line. **A
non-material resource on the material storage line is a category error in the source's own
terms**, and Renown — earned socially, spent on champions — is not a material.

### 1.2 The measurement Jerry's conditional turns on, taken before any change

| | |
|---|---|
| **Renown time at cap, shipped build** | **88.7% (seed 1) · 88.8% (seed 2)** — the fourth-worst reading in the game |
| tenth champion's cost, one lump | `RECRUIT_BASE 250 × 1.5⁹` = **9,611** (the per-champion `renown:` figures in `CHAMPS` are **never read** — see 1.4) |
| cumulative across all ten | **28,333** |
| Renown ceiling at the `none` tier | **5,810** at the Chemtech era — *below* the tenth rung |
| Renown ceiling at `broad` ×2.80 | **14,815** — 54% headroom over 9,611 |
| Scholarship, fully stacked | `1.25 × 1.3 × 1.3 × 1.35 × 1.4` = **×3.9926** |
| Scholarship at the 3-of-5 state the instrument actually reaches | `1.25 × 1.3 × 1.3` = **×2.1125** → ceiling ≈ **12,274**, 28% headroom |

**So the answer to Jerry's conditional is: the Culture/Devotion line is *just* sufficient, and
only barely.** Headroom on the tenth champion falls from 54% to 28%, and it does so by coupling
the champion ladder to a research line the player may not have taken.

**And the line it would join is the most cap-bound family in the game: culture sits at 97.3% /
97.2% time-at-cap across both seeds** — worse than crystals, worse than knowledge. Renown at
88.8% would be joining it, and the two would then share one multiplier.

### 1.3 What to ship, in the order Jerry specified

**Step 1 — move it, and measure.** Take `renown` out of `CAP_SCOPE` and into `SCHOLAR_CAPS`
alongside `culture` and `devotion`. Update the three sites that special-case it
(`index.html:1579` and `:3621`'s `r !== "renown"` guards, and `scholarCapNames()`, which
generates the Scholarship prose and must now name Renown). **Run the three-seed ensemble.**

**Step 2 — ship the dedicated line only if the measurement says so.** Jerry pre-authorised it;
the trigger is objective. **Ship a Renown line if either holds on the median seed:**

- the tenth champion is **not affordable within 2,500 game-years**, or
- Renown's time-at-cap **does not fall below 70%** (from 88.8%).

**The shape, if it is needed, is the source's — a per-copy building percentage, not a Discovery
chain.** Kittens relieves culture with **Ziggurat `+8% culture cap each`**, additive and
unbounded, and **RR already ships that analogue**: `cultureCapPct` on the Watcher's Eye (0.08)
and the Ice-Wrought Spire (0.04), summed additively at `index.html:3549`. The Renown analogue is
**`renownCapPct` on the Hall of Heroes** — RR's renown building, which today grants a flat
`caps: { renown: 250 }` per copy. Add a percentage term beside the flat one, additive, and
**state the per-copy figure and the count it was sized at**, the way v0.52 §3.2 stated its 20
copies.

**Do not build a fourth Discovery chain.** §19 has just ruled the multiplicative-chain shape out
of existence for the material line, and Part 5 shows the Scholarship line is the same shape
still standing. Adding a third one would be the sixth RR-invented rule.

### 1.4 Dead data found while sourcing this, and it should not survive the round

`recruitCost()` builds the Renown price entirely from `RECRUIT_BASE × RECRUIT_RATIO^n` and then
copies **only the non-Renown components** of the champion's own `cost`:

```js
var c = { renown: Math.round(RECRUIT_BASE * Math.pow(RECRUIT_RATIO, n)) };
for (var r in d.cost) if (r !== "renown") c[r] = d.cost[r];
```

**Every `renown:` figure in `CHAMPS` — Shaco 320 through Zilean 540, summing to 4,140 — is never
read anywhere.** Grepped: there is no `.cost.renown` read in the file. Either delete the ten dead
fields or make the ladder read them; **do not leave ten numbers in the content table that look
like prices and are not.** Whichever is chosen, assert it.

### 1.5 Pass conditions

1. `renown` appears in **exactly one** of `CAP_SCOPE` / `SCHOLAR_CAPS` / `CAP_MULT_EXEMPT`,
   asserted by enumeration — the same guard `CAP_SCOPE` already has.
2. No `r !== "renown"` special case survives anywhere; grep on stripped source.
3. Renown time-at-cap reported on all three seeds, before and after.
4. The tenth champion's affordability year reported on all three seeds.
5. If a Renown line ships: it is **additive per copy**, its figure and sizing count are stated in
   the code comment, and it is labelled **RR-ORIGINAL** in the ledger with the Ziggurat citation
   for its shape.
6. The ten dead `renown:` fields are deleted or wired, and asserted either way.

---

## Part 2 — Farmers are not seasonal (Jerry's directive 2, and it reverses §17)

> Jerry: *"Double check consumption, the wanderers tab says Farmers (the harvest follows the
> calendar) when in reality, Farmers provision production should not be impacted by winter."*

**Consumption, double-checked:** `CONSUMPTION = 4.25`, farmer `5.000/s`, ratio **1.17647** —
Kittens' `catnipPerKitten −0.85` × 5 against `catnip: 1` × 5, exact. **Nothing to change.**

**The seasonality half is a reversal, and it moves RR toward the source.** v0.55 shipped seasonal
farmers on a directive whose stated premise — that Kittens' farmers are seasonal — the builder
then disproved from `js/village.js updateResourceProduction()`, `js/calendar.js getWeatherMod()`
and the wiki's own sentence: *"Seasons affect catnip production from catnip fields, but do not
affect production from farmers."* It shipped labelled **RR-ORIGINAL / HARDER** — the charter's
first HARDER label — precisely so this could be revisited without re-deriving it. **Jerry is now
revisiting it, and the answer is the source's.**

**Ship:**

- **Remove the season term from the farmer job.** `index.html:3515`'s
  `if (r === "provisions") jv *= farmMult;` goes. Buildings with `seasonal: true` keep theirs
  (`:3454`) — that is the catnip **field**, which *is* seasonal in the source.
- **Fix the string Jerry is reading.** The farmer's `desc` currently reads
  *"+5 provisions/s (the harvest follows the calendar)"*. It becomes plain
  *"+5 provisions/s"* — and note that this string is the only place the behaviour was ever
  documented in-game, which is why a wrong one is a real defect rather than a cosmetic one.
- **Drop the job's season clause from the breakdown line** at `:3518`.
- **Amend STANDING-RULINGS §17** to record the reversal, Jerry's ruling, and the date — do not
  delete it. The history is the point: a directive whose premise was wrong shipped, was labelled
  honestly, and was reversed on the label.
- **Ledger:** the seasonal-farmer row goes **HARDER → PARITY** and the standing-divergence entry
  is retired. HARDER count 2 → 1.

**Leona keeps her lead and it keeps meaning something.** `seasonFarmMult()` stays the one place
the multiplier is computed and `LEONA_SEASON_RELIEF = 0.5` stays, but its blast radius returns to
where it was before v0.55: **seasonal buildings only.** The `m < 1` guard is load-bearing —
without it Firstbloom's ×1.5 is pulled down to ×1.25 (BUILD REPORT §1.3) — **keep it and keep its
assertion.**

**Pass conditions:** the farmer's provisions output is **identical in all four seasons**,
asserted; a seasonal building's output still measures ×1.5 / ×1.0 / ×1.0 / ×0.25; with Leona
leading, a seasonal building measures **×0.625** in winter and **×1.5** in spring; no string in
the game claims farmers follow the calendar, grepped on stripped source; `seasonFarmMult` still
has exactly one definition.

**Predicted vs measured:** this is a **production increase** concentrated in one season out of
four, on a settlement whose food ceiling now binds (provisions at cap 25.8% / 29.6%). Winter
farmer output rises ×4. **Expect population to rise from 180–185 and Era 3 to shorten on the
median.** If peak population returns to 220 the food ceiling has stopped binding and Part 4's
ruling becomes urgent rather than merely open.

---

## Part 3 — The seed ensemble (the project's highest-priority apparatus item)

HANDOFF §7.1 names it first and §2 makes it binding. I confirmed the premise independently: two
seeds on the shipped build gave **700.6** and **1,709.3**.

- `sim/pacing.mjs` grows an `--seeds N` (or `--ensemble`) mode that runs N seeds and reports
  **median, min, max and spread** for every milestone-derived figure, and the plain value for
  everything else. Default **3**; the round's headline table quotes the median.
- **Separate the two classes in the output.** Milestone years, Era 3 and anything derived from
  them are ensemble figures; cap-out fractions, morale band, peak population and delivered
  multipliers are single-run figures. The report should not be able to quote one as the other.
- **Wall clock is the binding constraint** — measured this session: **2,887 s and 2,530 s for two
  parallel 2,500-year runs** on a 2-core box, against ~1,600 s alone. Three seeds is roughly an
  hour and a half. Consider a shorter horizon for slice comparisons (Icathia lands by y2,000 on
  every seed measured) and reserve 2,500 years for the shipped build.
- **Pass condition:** the round's own pacing table is produced by the ensemble, and every Era-3
  number in the BUILD REPORT carries a median and a spread.

---

## Part 4 — The bot has no food policy, and it is now the largest source of noise

HANDOFF §7.2, and the measurement is unambiguous: `manageJobs()` staffs **one farmer** at every
milestone, in every era, at every population from 36 to 220 — across five slices and three
rounds. Net provisions at Sparks by v0.56 slice ran **−6.5 / −59.9 / −68.0 / +25.7 / −27.9** per
second with held/cap at **56% / 99% / 81% / 99% / 91%**.

**The settlement now sits between its food ceiling and its starvation floor, and which it touches
first decides a millennium of the run.** That is the mechanism behind the 2.6× spread, and it is
an instrument defect, not a game result — §16 says fix the bot, do not price around it.

- Teach `manageJobs()` a food policy: staff farmers while projected net provisions over the next
  season is negative, unstaff when the stock is at ceiling and net is positive. Keep it simple
  and **state the rule in a comment**, because every future food number depends on it.
- **Run the ensemble before and after and report the spread, not just the median.** The
  hypothesis this Part is testing is that a settlement which responds to hunger has a *narrower*
  Era-3 distribution. **If the spread does not narrow, say so** — that would mean the chaos comes
  from somewhere else and Part 3's ensemble becomes permanent rather than transitional.
- **Do not change any price to compensate.** If the policy makes food easy, that is next round's
  ruling with a working instrument behind it.

---

## Part 5 — Culture is at 97.3%, and the Scholarship line is the storage chain §19 missed

**The worst two cap-out readings in the game are `culture` 97.3% / 97.2% and `crystals` 95.9% /
96.2%**, agreeing across both seeds. HANDOFF §7.12 flags both. Culture is the one with a
structural cause, and it is one v0.56 fixed everywhere except here:

```js
// index.html:3590 — still, after v0.56
SCHOLAR_LINE.forEach(function (u) { if (S.upgrades[u[0]]) scholarMult *= u[1]; });
```

**That is the identical multiplicative-chain shape STANDING-RULINGS §19 ruled out of existence
for the material line one round ago**, surviving on `culture` and `devotion` — and, if Part 1
step 1 lands, on `renown` too. Kittens' Law is stated in HANDOFF §3 as category-general:
**additive within a category, multiplicative only between.** Five members of one category
multiplied is the same violation whichever resources it governs.

**This Part is a measurement and a dated placement, not a code change**, for one reason worth
stating: converting `SCHOLAR_LINE` to additive at its natural reading (0.25 + 0.30 + 0.30 + 0.35
+ 0.40 = Σ 1.60 → **×2.60**) is a **cut** from ×3.9926, applied to the resource already at 97.3%
of its ceiling. **Shipping that in the same round as Part 1 would move Renown onto a line that is
itself being cut, and neither would be attributable.**

- **Measure and report:** the delivered Scholarship multiplier at each research state the
  instrument actually reaches (v0.56 found it holds only 3 of 5 *storage* rungs — do the same
  census for the Scholarship rungs); culture's held/cap and its producer/consumer balance;
  whether culture is ceiling-limited or flow-limited, per HANDOFF §6's stock-versus-flow rule.
- **Date the restructure to v0.58, as that round's first slice, together with the culture ceiling
  itself.** They are one problem and the fix has to be sized against the source's actual culture
  mechanism — **Ziggurat +8% per copy**, which RR already ports as `cultureCapPct` — not against
  the chain's current product.

---

## Part 6 — Pass condition 5 is mis-specified, and three of its four resources prove it

HANDOFF §7.3 asks for this and the shipped run states it outright: zaunore **43.3% / 60.1%** ✅,
shimmer **87.2% / 83.1%** ❌, hexore **3.2% / 3.7%** ❌, coalgas **0.0%** ❌.

The builder raised the shimmer ceiling ×2.5 and cut the hexore ceiling ×3.5 and moved their
cap-out by **3 points and 0 points**. `held/cap` reads **100% for shimmer** (nothing consumes it)
and **0% for hexore** (consumed as fast as produced). **These are flow problems wearing a stock
problem's clothes** — the same class that left Riftsteel unforged in v0.53.

- **Restate the condition.** For a resource with a consumer, the meaningful target is a
  **producer/consumer ratio band**, not a cap-out band. Keep the 30–60% cap-out band only for
  resources that are genuinely stock-limited — on the evidence, that is `zaunore` alone.
- **Add `held/cap` and a producer/consumer ratio to the snapshot for every capped resource**, so
  the next round cannot size a cap from a cap-out fraction without seeing which kind it is.
- **Shimmer having no consumer at all is the finding under the finding.** It is the same shape as
  voidessence, which still accumulates monotonically after Icathia with nothing to spend it on
  (both of v0.53 Part 4's monotonicity conditions still fail). **Report both together**; a
  resource with no sink is a design question, and it is now two resources.

---

## Part 7 — Corrections and carried items

### 7.1 The ledger prose

Four documents say **EASIER 32**; the generated ledger says **29**, and only 29 makes the row
total 208. **Fix the four documents, not the ledger**, and add the guard that was missing:
`test-v56`'s ledger assertion should also check the **summary table inside the ledger against the
rows it summarises**, so a hand-written count can never disagree with a generated one again.

### 7.2 Carried, unchanged, each with its measured state

1. **The craft-depth tie-break.** Riftsteel never forged; voidessence monotone after Icathia on
   both seeds. Two of v0.53 Part 4's conditions still fail.
2. **The Chembarrel / save-for-a-visible-building fix.** `catMonument` still ×1.00.
3. **The trade-banking policy** for `manageTrade()`. Trades ran 19,138 (seed 1) and 14,453
   (seed 2) — a 32% spread on the same build, which is its own argument for Part 3.
4. **`XP_PER_SECOND` is still UNVERIFIED.** `skillXP` is a local between `js/village.js:2623` and
   `:2644`. The grep.app query that found `skillsCap = 20001` does not find it; try `var skillXP`,
   `skillXP *=`, or the enclosing function name. **The `XP_CAP` beside it is PARITY and the two
   must not be conflated.**
5. **127 UNVERIFIED ledger rows.** Ten to fifteen a round by subsystem. **Take the Wilds and
   expedition block this round** — Part 6 opens the shimmer economy anyway.
6. **Rites of Targon y72.7 / y72.5** against y70, and **Convergence 4.17% / 4.40%** against 5–8%.
   Both are close, both are stable across seeds, and both have now failed for four rounds.
   **Rule on them or re-base them with a reason** — a condition failed four times without a
   ruling is not a condition.

---

## Part 8 — Order, discipline, pass conditions

### Order — five cumulative prefixes, snapshotted forward **before** the next Part starts

v0.56 applied Part 3 before staging s4 and had to reconstruct it. Snapshot first, every time.

1. **Part 3** — the ensemble. It must come first because it is the instrument every later slice
   is measured with.
2. **Part 4** — the bot's food policy. The other apparatus item, and the one that should narrow
   the spread. Alone in its slice, with a before/after ensemble.
3. **Part 2** — farmers lose the season. A production change, cleanly isolated.
4. **Part 1** — Renown, step 1 then step 2 if the trigger fires.
5. **Parts 5, 6, 7** — measurements, the restatement, the corrections, the ledger rows.

### Operational

Median of three seeds for any milestone claim. `--years N` and `--seed N`, never a positional.
Kill by PID from `ps -eo pid,args`. Size every `sleep` under 600 s and poll. Strip comments
before grepping. `limitedDR` gives away 75% of its limit; `strictDR` does not. Never
`playwright install`. **Measured this session: two parallel 2,500-year runs took 2,887 s and
2,530 s** — budget accordingly. **Pushing works** via HANDOFF §6's token-remote recipe; it was
used for this commit.

### Round pass conditions

| # | Condition | Target |
|---|---|---|
| 1 | `renown` in exactly one cap family | asserted by enumeration; no `!== "renown"` special case survives |
| 2 | Renown time at cap | reported on 3 seeds; **< 70%** or the dedicated line ships |
| 3 | Tenth champion | affordable within 2,500 game-years on the median seed |
| 4 | The ten dead `renown:` fields in `CHAMPS` | deleted or wired, asserted either way |
| 5 | Farmer output across the four seasons | **identical**; no in-game string says otherwise |
| 6 | Seasonal buildings | ×1.5 / ×1.0 / ×1.0 / ×0.25; with Leona ×0.625 winter, ×1.5 spring |
| 7 | STANDING-RULINGS §17 | amended with the reversal, not deleted; ledger row HARDER → PARITY |
| 8 | `CONSUMPTION` | **4.25**, ratio 1.17647 — unchanged, asserted |
| 9 | Ensemble mode | ships; median + spread for every milestone figure |
| 10 | Bot food policy | shipped, rule stated in a comment; **Era-3 spread before and after** |
| 11 | Scholarship line | censused and measured; restructure **dated to v0.58**, not shipped |
| 12 | Pass condition 5 | restated as producer/consumer for shimmer, hexore, coalgas |
| 13 | `held/cap` + producer/consumer ratio | in the snapshot for every capped resource |
| 14 | Ledger prose | corrected in all four documents; summary-vs-rows guard added |
| 15 | Rites y70 and Convergence 5–8% | ruled or re-based **with a reason** |
| 16 | Unchanged | ×20.8000 science parity · `BOOST_LIMIT` seven keys · `CAMP_YIELD_LIMIT` 6 · `CAP_SCOPE` total · ladder 37/9/1.1111/1.2632/3.333 · audits 0/0 |
| 17 | Every Part | actioned, or its non-action explicitly justified |

### Predicted vs measured — stated before any run, **as medians of three**

**v0.56 got every single-slice prediction wrong by a factor, and then explained why: the slices
were not separable.** These are therefore written as ensemble medians with an expected spread,
and the spread is as much the prediction as the median is.

| slice | Era 3 median | spread | Sparks | note |
|---|---|---|---|---|
| v0.56 baseline (2 seeds re-measured, 3rd from the report) | **1,709.3** | 700.6–1,835.3 | y187.1 | reproduces the report exactly |
| s1: ensemble | **1,709.3** | unchanged | unchanged | measurement only, no game code |
| s2: + bot food policy | **900–1,700** | **narrower — this is the prediction** | y180–210 | a settlement that farms under deficit stalls less |
| s3: + farmers lose the season | **−150 to −450** | narrower still | earlier by 5–25 | winter farm output ×4; population rises |
| s4: + Renown | **≈ 0** | unchanged | unchanged | a ceiling change on a non-material resource |
| **shipped** | **700–1,400** | | | **likely below the target band, and that is acceptable this round** |

**The round's real deliverable is the spread, not the median.** If Part 4 narrows the Era-3
distribution to under 1.5×, the project can compare builds again and every prior Era-3 comparison
can be re-taken cheaply. If it does not narrow, the chaos is not the job policy and Part 3's
ensemble becomes permanent apparatus rather than a bridge — **say which, with the numbers.**

**Two informative failures to watch for.** If **peak population returns to ~220** after Part 2,
the food ceiling has stopped binding and morale's first-ever passing band will go with it — check
it in the same run. And if **Renown's time-at-cap does not fall** after moving it to the
Scholarship line, then Renown was never ceiling-limited either and Part 6's stock-versus-flow
correction applies to it too.

---

## Sources, all read this session

**Kittens** (`github.com/nuclear-unicorn/kittensgame`): `js/resources.js`
`addBarnWarehouseRatio` — **seven material effect names and no others**, which is the structural
argument for Part 1. `js/buildings.js` — `ziggurat`'s per-copy culture-cap percentage, the shape
Part 1.3 and Part 5 both point at; `unicornPasture`; `field`. `js/village.js` — `catnipPerKitten
−0.85` and farmer `catnip: 1` (Part 2's consumption check); `:2621–2622` `var skillsCap = 20001`;
`:2645–2651` the skill-learning block; `updateResourceProduction()` carrying **no season term**,
which is what Part 2's reversal restores.

**RR**, at the v0.56 tag, comment-stripped: `CAP_SCOPE` at `:1551` (renown → `broad`);
`BARN_LINE` / `WAREHOUSE_LINE` Σ 4.35 / 1.80; `SCHOLAR_LINE` at `:1315` and its **multiplicative**
apply at `:3590`; `SCHOLAR_CAPS` `:1444`; `CAP_MULT_EXEMPT` `:1456`; the two `r !== "renown"`
guards at `:1579` and `:3621`; `cultureCapPct` on `watchersEye` 0.08 and `iceWroughtSpire` 0.04,
summed at `:3549`; `recruitCost()` at `:1109–1116` and `RECRUIT_BASE 250, RECRUIT_RATIO 1.5` at
`:1096`; the ten unread `renown:` fields in `CHAMPS`; `trainCost()` at `:1188`; the farmer job at
`:676` and the season term at `:3515`; `seasonFarmMult` and `LEONA_SEASON_RELIEF 0.5`; the
Hall of Heroes' flat `caps: { renown: 250 }` at `:698` and the Training Ground's `renown: 60` at
`:451`; `docs/PARITY-LEDGER.md`'s own summary table.

**Measurements taken this session:** all 25 suites (**1,219 assertions, 0 failures**, `test-v32`
included); **two independent 2,500-year runs, seeds 1 and 2** (2,887.7 s and 2,529.8 s wall),
reproducing the report's ensemble to the digit; a live-game probe of `VERSION`, `CONSUMPTION`,
the farmer rate and description, `XP_PER_SECOND`, `XP_CAP`, `LEONA_SEASON_RELIEF`, the four
seasons with and without Leona, the three food stores and the Warehouse's `capsIf`, the two
storage accumulators, all four scope tiers, the Scholarship product, the recruit ladder, the tech
ladder and both audit graphs; and an independent row-and-verdict count of the parity ledger.
