# BUILD REPORT v0.65 — the Discovery ladder stops being free, and the vigor cut cost more than anyone predicted

Built against BUILDER SPEC v0.65 (`docs/specs/rr-analyzer-v065-spec.md`) plus Jerry's three dev
notes. Tagged `v0.65`.

---

## 0. THE HEADLINE

**Every Part shipped exactly as specified. Two of the round's own predictions are falsified, and
one of them is the spec's own stake-in-the-ground.**

1. **PART 2 COST 20 POINTS OF PEAK POPULATION ON THE MEDIAN SEED, AND THE SPEC SAID THAT WOULD
   MEAN SOMETHING.** §2.5: *"If a 63% cut to vigor income moves peak population by more than 10,
   vigor was feeding something nobody has named — say so rather than absorbing it."* **Measured
   seed-for-seed on a PRNG-neutral slice: −20 / −86 / −8. Tripped on all three.** So: **vigor was
   feeding population, through the Wilds.** Vigor buys expeditions, expeditions pay timber, ore
   and furs, and **every housing tier at every milestone is stock-bound on TIMBER.** The path was
   in the instrument the whole time; nobody had joined the two readouts. **And it is far bigger
   than population** — Era-3 raw gross at end of run falls **×4.7** (§10.3).
2. **THE SPEC'S OWN §2.3 DECOMPOSITION IS WRONG IN EVERY COMPONENT, AND `knee._sources` — built
   for this Part — caught it on its first run.** The Σ is exactly right at 5.4432; the four terms
   under it are not. The Training Ground carries **73.5%**, not 93.0%.
3. **Part 1 shipped and the census reproduces the spec to the digit** — 2,003,370 over the 78
   upgrades that existed at v0.64, whole-game ratio 1.3887, coverage 79 of 82.

4. **THE SPEC'S CENTRAL PREDICTION HELD; ITS PART-1 FORECAST INVERTED.** The spec staked the round
   on knowledge's 82.8% time-at-cap meaning Part 1 would cost far less than its ×2.2 demand
   increase implies, with **+900 on the median Icathia** as the falsifier. **Measured seed-for-seed
   E1→E2: −328.9 / (never → 2,434.7) / +51.7 — median +51.7.** Part 1 made two of three seeds
   *earlier*, and time-at-cap is still **84.4%** with the discovery share of knowledge spend up
   from **6.7% to 59.7%**. **The slack was real and Part 1 ate it.**

**On the GUARDS: population is recovered, Icathia is not.** E1 loses both — peak population median
145, Icathia 2 of 3. **E2 puts population back inside the band at a median of 155 (PASS) and
leaves Icathia at 4 of 5 (FAIL).** The honest headline: the round's damage came from **Part 2**,
not from the change everyone was watching, and **Part 1 partly repaired it**.

---

## 1. The instruments, landed first (operational rule 3)

Both blocks landed on an **unchanged v0.64** — `sim/` only, `index.html` byte-identical — so the
baseline is measurable with every readout the round adds.

### 1.1 The knowledge supply block, on s0 at full length

Seed 3, the analyzer's median seed, 2,500 game-years. **A single seed, deliberately: this is not
the forbidden E0 ensemble** — it re-derives no milestone year, and §25 classifies cap-out
fractions and delivered multipliers as SINGLE-RUN figures that are quotable plainly.

| milestone | gross | held / cap | **time at cap to date** | spent on TECHS | spent on DISCOVERIES | discovery share |
|---|---|---|---|---|---|---|
| sparks | 8.95/s | 1,630 / 21,530 (8%) | **86.2%** | 77,455 | 54,483 | **41.3%** |
| hexcore | 85.20/s | 370 / 74,115 (1%) | **84.8%** | 545,705 | 101,066 | 15.6% |
| icathia | 182.55/s | 10,100 / 139,700 (7%) | **84.5%** | 1,282,855 | 101,066 | 7.3% |
| **final** | 724.01/s | **310,285 / 310,285 (100%)** | **82.8%** | 1,402,855 | 101,066 | **6.7%** |

**82.8% and ×46.18 reproduce the analyzer's figures to the digit**, independently measured. The
classification is **lumpy-only, 72 lumpy sinks, zero continuous consumers.**

**And the two readings look contradictory until you see what each measures.** Time-at-cap is
84–86% throughout while the instantaneous fill at three of four milestones is 1–8%. Both are
right: a milestone snapshot fires *the instant a tech is bought*, i.e. immediately after the
stock was drained to buy it. **Between purchases the bank is full.** That is precisely what
"lumpy sink sitting at its ceiling" means, and it is the slack Part 1 spends.

### 1.2 `knee._sources`, and it corrected the spec on its first run

`_members` enumerates `BOOST_MEMBERS` and nothing else, so a **BUILDING** boost was invisible to
the audit that existed — and dev note 1 is about a building. Measured on s0 at end of run:

| contributor | **spec §2.3 says** | **MEASURED** | |
|---|---|---|---|
| **Training Ground** | 5.0622 — **93.0%** (≈51 copies) | **4.0000 — 73.5%** (**40 copies**) | |
| cloud drake | 0.2310 | **0.9482 — 17.4%** | the spec quotes a mid-run printout |
| champion passives | 0.1500 (Poppy's base) | **0.3750 — 6.9%** | the spec quotes the BASE, not the levelled value |
| `policyBoost("vigor")` | **0** — *"`policyBoost()` has no `vigor` branch"* | **0.1200 — 2.2%** | **it does: `solariDiscipline` +0.12** |
| **Σ** | **5.4432** | **5.4432** | the total is exactly right |

**Every component is wrong and the sum is exactly right**, which is the signature of four figures
read at four different moments. The consequence for Part 2 is in §2.3 and it is not small.

**The guard cried wolf twice before it was trustworthy**, and that is recorded because it matters:
it reported vigor and crystals as "DOES NOT RECONCILE" by 1.3e-5. The cause was neither floating
point nor an unnamed contributor — **`boostKneeFrom()` publishes `raw` already rounded to four
decimal places**, so an exact sum can never equal it. Measured directly: raw 1.9421 against an
exact 1.9421155588561603. The sum is rounded the same way now. **A guard that cries wolf is a
guard the next reader ignores**, and this one is the only thing that makes a "carries N% of the
family" figure quotable at all.

---

## 2. Part 2 — the Training Ground, and the weapon line

### 2.1 What shipped

`boost: { vigor: 0.10 }` deleted; `caps: { vigor: 150 }`, the cost and the ratio all unmoved.
Three new Discoveries carry Kittens' `manpowerJobRatio` line at the source's own shares:

| RR Discovery | share | RR tech | source rung | |
|---|---|---|---|---|
| **The Hunter's Draw** | **0.50** | `carpentry` 1,000 | `compositeBow` ← `construction` | **rank-for-rank: carpentry IS RR's construction** (v0.52 Part 2.2) |
| **Latch and Lever** | **0.25** | `callToArms` 15,000 | `crossbow` ← `machinery` **science 15,000** | **the rung matches TO THE DIGIT** |
| **Arclight Lance** | **0.25** | `atlasGauntlets` 90,000 | `railgun` ← `particlePhysics` 185,000 | **a ROLE match, not a rung match — see §2.2** |

**And Latch and Lever's Part 1 knowledge cost lands at 0.8 × 15,000 = 12,000, which is the
source's own `crossbow` science price exactly.** That agreement only happens when the rung and
the rate are both at parity, and it is the strongest single confirmation in the round.

### 2.2 A SOURCE CORRECTION THE SPEC GOT WRONG

The spec (§2.4) calls `railgun` *"the source's science 12,000-class successor"*. Read from the
clone at `c52985b`, `js/workshop.js:708-724`:

```
railgun   manpowerJobRatio 0.25   titanium 5000 + science 150,000 + blueprint 25
          unlocked by particlePhysics — science 185,000
```

**It is science 150,000 on a 185,000 rung.** RR's entire ladder tops out at `icathia` 135,000, so
**no rung match exists**, and the third rung ships on `atlasGauntlets` (90,000) — RR's late
equipment tech, which already carries Atlas Axes and the Atlas Gauntlets upgrade. **The ledger row
says EASIER rather than PARITY on exactly that basis**: the same +25% arrives earlier in RR's tree
than it does in the source's. Reported rather than smoothed over.

### 2.3 THE ARITHMETIC THE SPEC BUILT ITS CASE ON DOES NOT HOLD

§2.3 predicts: *"Delete the building term alone and vigor's Σ falls 5.4432 → 0.3810"*, then
*"+1.00 = 1.381 → ×2.381 … RR lands 19% above the source."*

**Measured, with the spec's own instrument:**

| | spec | **measured** |
|---|---|---|
| Σ after deleting the building term | 0.3810 | **1.4432** |
| Σ after the weapon line lands | 1.381 | **2.4432** |
| delivered multiplier | ×2.381 | **×3.4432** |
| against the source's `manpowerJobRatio` ×2.00 | **+19%** | **+72%** |

**The spec under-counted RR's own RR-original vigor terms by 3.8×**, because it read the drake at
a mid-run value, the champion passive at its base and the policy branch as absent. **Shipped as
specified regardless** — the Part's two moves are directed and both are source-argued — and
recorded here with measurements, per project practice.

**The end-of-run figure on E1 is Σ 2.3304**, slightly under the static 2.4432 because the drake
and champion terms are below their maxima on that seed.

### 2.4 AND THE COST WAS 20 POINTS OF POPULATION ON THE MEDIAN SEED, WHICH THE SPEC SAID WOULD MEAN SOMETHING

The spec's own falsifiable prediction, §Predicted-vs-measured: *"I expect Part 2 to be small on
population and large on Sparks, because vigor's only path to population is the long one through
champions. **If a 63% cut to vigor income moves peak population by more than 10, vigor was
feeding something nobody has named — say so rather than absorbing it.**"*

**Stated seed-for-seed, because §25 forbids quoting an ensemble median against another ensemble
median as if it were a delta.** Every slice this round is PRNG-neutral, so s0 and E1 are the same
three draws and the subtraction is legitimate:

| seed | v0.64 (s0) | **E1 (s1–s3)** | **Δ** |
|---|---|---|---|
| 1 | 165 | **145** | **−20** |
| 2 | 191 | **105** | **−86** |
| 3 | 180 | **172** | **−8** |
| **median of the per-seed deltas** | | | **−20** |
| ensemble median (reported, not subtracted) | 180 | 145 | |

**−20 on the median seed, −86 at worst, −8 at best.** The threshold was 10. **It is tripped on all
three seeds, so the finding does not depend on which figure you take** — and the honest number is
−20, not the −35 the two ensemble medians would suggest.

**Saying so.** The path is not through champions and it is not long. It is:

> **vigor → expeditions → the Wilds camps pay TIMBER, ORE and FURS → housing.**

**And the housing decomposition names it in one line.** At end of run on E1's median seed, every
tier reads **stock-bound — timber** (Shelter, Longhouse) or **stock-bound — alloy** (Skyrise), and
every tier has fewer copies than v0.64:

| tier | v0.64 | **E1** |
|---|---|---|
| Shelter | 32 → 64 pop | **28 → 56 pop** |
| Longhouse | 44 → 44 pop | **36 → 36 pop** |
| Skyrise Terrace | 28 → 56 pop | **20 → 40 pop** |
| **peak population** | **180** | **145** |

**Not one tier is ceiling-bound. Every one is short of MATERIAL**, and the round's only change to
material income is that the settlement can no longer afford the expeditions that were paying for
it. **Trades collapse in the same breath: 165,063 → 11,453 on the median seed**, because a caravan
costs 135 vigor.

**This was findable before the round ran.** `campYieldMult` at end of run is 6.08 and the Wilds
camps pay materials; the housing decomposition has said "stock-bound — timber" at every milestone
since v0.64. **Nobody joined the two readouts, and the spec's model of vigor — "its only path to
population is the long one through champions" — is simply not what the game does.**

---

## 3. Part 3 — the Longhouse's provisions component

Restored at **`provisions: 30`**, sized by the never-bind rule:

> **base ≤ provisionsCap ÷ 1.15^(1.25 × stockBoundCopies − 1)**, tightest milestone wins

which gives 72 / 46 / 49 / **36** and ships the rounded-down 30. At 30 the ceiling-bound maxima
are 56 / 70 / 71 / 75 against stock-bound 40 / 53 / 54 / 59 — margins **1.40 / 1.32 / 1.31 /
1.27**, clearing the ≥1.25 rule at all four including the tightest.

**AND ITS OWN INSTRUMENT EXONERATES IT, WHICH MATTERS BECAUSE THE ROUND LOST POPULATION.** On E1
at end of run the Longhouse reads **36 copies standing, ceiling-bound maximum 58, binding resource
TIMBER**. The provisions component is **not the binding constraint at any milestone**, which is
exactly what it was sized to guarantee. The spec predicted *"Part 3 exactly zero on everything"*
and **that prediction holds**: the two-tier ceiling reads 134 against v0.64's 135.

**The sink's honest size, because a sink is what the note asks for:** 44 copies at base 30 and
ratio 1.15 cost **≈93,500 provisions**, the 44th alone ≈12,200. **If Jerry wants a provisions sink
larger than that, the Longhouse is structurally the wrong carrier** — a ratio-1.15 component on a
44-copy building cannot be large without becoming a ceiling. That is arithmetic, not preference,
and a continuous consumer or a low-copy-count building can carry it.

**Ledgered RR-ORIGINAL / HARDER**, PARITY → HARDER, with `js/buildings.js:476-487` cited and the
sizing rule stated. §16 forbids shipping a directive as parity; §17 is the precedent.

---

## 4. Part 4 — the fourth mana Discovery

`leylineLensing`, +25% into the existing additive `boosts.mana`, on `hexcore` and not on `sparks`.
Σ 1.05 → 1.30, still below the 1.50 knee, so it is **delivered in full**. It pays knowledge 60,000
(0.8 × its own rung) and crystals 750, which is the source's habit on 101 of its 107
crafted-component upgrades.

**Measured on E1, against v0.64's own figures — and §11.6's caution is the right way to read it:**

| milestone | v0.64 net | **E1 net** | v0.64 ratio | **E1 ratio** |
|---|---|---|---|---|
| sparks | +33.39/s | **+33.48/s** | 0.177 | 0.177 |
| **hexcore** | **−0.40/s** | **−4.10/s** | 1.003 | **1.047** |
| icathia | +10.21/s | **+39.90/s** | 0.935 | **0.781** |
| **final** | **−14.52/s** | **+37.76/s** | 1.011 | **0.894** |

**The end-of-run deficit is discharged — −14.52/s becomes +37.76/s — and hexcore's gets worse.**
Both are consistent with §11.6's model rather than against it: the converters are throttled by
mana availability and consume what arrives, so the ratio sits near 1.00 wherever the constraint
binds. Hexcore's gross falls 119.35 → 87.11 because Era-3 build-out is *slower* on E1, which is
Part 2's knock-on and not Part 4's doing. **A report that claimed victory on the net figure alone
would have measured the wrong thing in both directions.**

---

## 5. Part 5 — the champion draw, measured for the first time

`firstPZChampion` is marked from the gate's own literal condition, and `sparksAfterPZ` is derived
per seed. **E1, three seeds:**

| figure | median | spread | |
|---|---|---|---|
| **firstPZChampion** | **180.7** | 140.3–324.4 (**×2.31**) | **the draw — the design does not set this** |
| sparks | 619.9 | 538.2–909.9 (×1.69) | the draw PLUS the build-out |
| **sparksAfterPZ** | **397.9** | 295.5–729.2 (**×2.47**) | **the part the designer controls** |

**And the first reading of this instrument does NOT say what everyone assumed.** The expectation
was that Sparks' spread is the draw and the design half would be tight. **It is not: the design
half spreads ×2.47, WIDER than Sparks itself.** So Sparks' variance is not simply inherited — the
build-out after the gate opens is at least as variable as the draw. **That is a finding, and it
means "take more seeds" would not have found it.**

The three confounded conditions print `[draw]` and are **reported, not failed**. E1's line reads
*"1 of 7 steerable conditions failing, plus 3 of 3 [draw] conditions reported off-target"*, which
is the separation the Part exists to make.

**§32 neutrality is PROVED by running it** (`tools/prove-s4-neutral.sh`): one `index.html`, one
seed, the harness with and without the marker — **all 18 seeded figures reproduce to the digit.**

---

## 6. Part 6 — Rites restated

`rites` becomes a **y50–200 band** with the ruling cited at the site. E1 median **94.1** (71.1 /
94.1 / 116.1) — **inside the band, and it would have FAILED the retired y75 ceiling on all three
seeds.** That is the ruling doing its job rather than the game degrading: per-upgrade parity is
the target and the Rites year is a consequence of it.

---

## 7. Superseded assertions, re-pointed with their superseding spec item

Per operational rule 10 — re-pointed, never deleted. **Thirteen call sites across seven suites**,
plus four suites that referenced the deleted set and died before their trailer. **One of them is
this round's own suite (row 13)**, caught by the final gate rather than by inspection.

| # | suite | assertion | superseded by |
|---|---|---|---|
| 1 | `test-v57` | "Rites of Targon is a **y75** MEDIAN condition" | **Part 6** — a y50–200 band. The item is the SHAPE and the stated reason, which is what makes a condition auditable; the threshold was never its subject |
| 2 | `test-v61` | "MORE, not all: 10 → 32 of 79" | **Part 1** — Jerry asked for ALL. Asserts coverage GREW and is derived from `UPGRADES` |
| 3 | `test-v61` | **"an OUTFIT is not a METHOD: the axe, saw and storage lines take no knowledge"** | **Part 1 — INVERTED.** The source charges science on all three: `steelAxe` 20,000, `stoneBarns` 500, `titaniumBarns` 60,000. Those lines must now CARRY knowledge |
| 4 | `test-v61` | the `DISCOVERY_KNOWLEDGE_SET` fixture (5 sites) | **Part 1** — the set is deleted; the population is derived from the rule's own definition |
| 5 | `test-v62` | "at most THREE knowledge discoveries sit on any one tech" | **Part 1** — a property of the named SET, not of the rule. The densest rung is now `smelting` at ten, **reported and not capped** (v0.64 Part 5 closed that: the source's per-rung range is 0.30–8.19) |
| 6 | `test-v62` | the set fixture (3 sites) | **Part 1** |
| 7 | `test-v63` | "the whole-game discovery ratio is under the source's **0.50**" | **Part 1** — that comparison was a whole against a part. Asserts under the **like-for-like 1.903** |
| 8 | `test-v64` | "the Longhouse's provisions component is DELETED" | **Part 3** — restored on a directive. Asserts the tier is not CEILING-BOUND, which is a property of the component's SIZE and not of its absence |
| 9 | `test-v64` | "the three per-copy boost carriers are untouched" (Training Ground 0.10 vigor) | **Part 2** — deleted by directive. The item is that the RAILS re-priced no rate, still true for the two that remain |
| 10 | `test-v64` | "**NO** fourth mana discovery shipped" | **Part 4** — **this is the condition DISCHARGING, not breaking.** v0.64 said "only on a measured deficit"; the deficit was measured and this ships it |
| 11 | `test-v64` | "the whole-game ratio is under ~0.47–0.50" | **Part 1** — as row 7 |
| 12 | `test-v64` | **`VERSION === "v0.64"`** | **operational rule 9, THIRD INSTANCE.** v0.64's own report re-pointed this identical assertion in `test-v63` for pinning a literal version string — and then v0.64's own suite pinned "v0.64". Asserts the shape |
| 13 | **`test-v65`** | **`reconciles: Math.abs(sum - raw) < 1e-6` against an UNROUNDED sum** | **Part 2's own §10 instrument, corrected in `723e7cb`.** This is the round's own suite re-pointing itself, which is worth stating plainly: I asserted the tolerance the block shipped with, and **that form is precisely the thing that cried wolf.** The cause was never float drift — `boostKneeFrom()` publishes `raw` already rounded to four places, so an exact sum cannot equal it at *any* float tolerance. The comparison is now taken at the published precision and the exact sum is still carried as `namedSum`. **The assertion caught a real mismatch between the suite and the shipped fix, which is the guard working.** |

---

## 8. Part 1 — the Discovery ladder

### 8.1 What shipped, and the census reproduces the spec to the digit

`DISCOVERY_KNOWLEDGE_SET` is **deleted and inverted**; `applyDiscoveryKnowledge()` walks all of
`UPGRADES`; `DISCOVERY_KNOWLEDGE_EXEMPT` is **empty**.

| | v0.64 | **v0.65** |
|---|---|---|
| Discoveries carrying knowledge | 32 of 78 — **41%** | **79 of 82 — 96%** (source: 93%) |
| total discovery knowledge | 106,010 | **2,148,170** |
| …over the 78 that existed at v0.64 | | **2,003,370 — the spec's figure EXACTLY** |
| whole-game ratio | 0.0735 | **1.4891** (1.3887 over the same 78) |
| per-upgrade median | 0.80 | **0.80** |

**2,148,170 − 144,800 (this round's four new Discoveries) = 2,003,370.** The spec's prediction
reproduces to the digit, which is the strongest available check that the rule is implemented as
written rather than approximately.

**Against the source's LIKE-FOR-LIKE 1.903** — Kittens restricted to techs at or under RR's own
largest rung — **RR is at 78%. Still under the source.**

**The three unpriced Discoveries are `runicAttunement`, `arcaneFocus` and `riverstoneTools`, and
all three have no tech at all**, so there is no rung to take a fraction of. A division by zero,
not a policy.

**The five out-of-band members are all AUTHORED** — `standingOrders` 0.10, `surveyedApproaches`
0.10, `slabCutting` 0.70, `beastLore` 1.25, `chemtechDistillation` 1.364 — **which confirms the
v0.65 analyzer's correction of my own v0.64 report's "two residual outliers".** The analyzer was
right and the report was wrong.

### 8.2 The four exemptions, each retired with its source citation

| RR's stated exemption | the source |
|---|---|
| the AXE and SAW lines — *"the metal IS the cost"* | `steelAxe` **science 20,000**; `titaniumAxe` **38,000**; `alloyAxe` **70,000** |
| the STORAGE lines | `stoneBarns` **500**; `reinforcedBarns` **800**; `titaniumBarns` **60,000** |
| HOUSING and pure-capacity facilities | the source has **no unpriced capacity upgrade at all** |
| *"a Discovery is not taxed twice for being late"* | **107 upgrades carry a scarce crafted component and 101 also carry science — 94%** |

**The source's ten unpriced upgrades are one coherent category: every one is bought with a
POST-RESET PRESTIGE CURRENCY.** Kittens exempts an upgrade from science when it is bought with a
currency that only exists after a reset. It does not exempt tools, storage, housing, or lateness.
**"Not taxed twice for being late" is the fifth RR-invented rule this project has retired.**

---

## 9. Suites and the ledger

**36 suites, 1,955 `check()` call sites, 2,004 assertions executed, 2,004 passed, 0 failed.** No
missing trailer, no skipped site, no non-zero exit; the scratch suite that throws on purpose
FAILED the round as it must. `tests/test-v65.mjs` is **48 assertions**.

**Parity ledger: 229 rows — PARITY 88, EASIER 118, HARDER 23, UNVERIFIED 0.** The generator's
RR-ORIGINAL+UNVERIFIED guard **aborted the build** until the four new Discoveries carried argued
verdicts, which is that guard working exactly as v0.63 designed it.

---

## 10. E1 — the three PRNG-neutral Parts, at full length

**E1 = `snapshots/v65/s5.html`, three seeds (1, 2, 3), 2,500 game-years, launched concurrently.**
s5 carries Parts 2, 3 and 4 and **nothing else** — `index.html` is byte-identical to s3; s4 and s5
are `sim/`-only. Baseline is v0.64's shipped ensemble on **the same three seeds**, which is what
makes every subtraction in this section legitimate under §25.

> **A note on the logs.** E1 and E2 were both launched before commit `723e7cb`, which fixed
> `knee._sources`' reconciliation tolerance (`boostKneeFrom()` publishes `raw` rounded to 4 dp, so
> an exact sum can never equal it — measured raw 1.9421 against exact 1.9421155588561603). **Both
> logs therefore still carry spurious `DOES NOT RECONCILE: ±0.00004` lines on perfectly attributed
> families.** The attribution itself is correct; only the flag was wrong. Every `_sources` figure
> quoted below is from those logs and is unaffected.

### 10.1 The gate, seed-for-seed

| seed | Icathia v0.64 → **E1** | peak pop v0.64 → **E1** | Era 3 v0.64 → **E1** |
|---|---|---|---|
| 1 | 2,234.7 → **2,362.0** (+127.3) | 165 → **145** (−20) | 1,379.4 → **1,823.8** |
| 2 | 1,339.9 → **NEVER** | 191 → **105** (−86) | 829.9 → **NEVER** |
| 3 | 1,694.2 → **1,679.5** (−14.7) | 180 → **172** (−8) | 1,262.7 → **1,059.6** |
| **ensemble** | **3 of 3 → 2 of 3** | **180 → 145** | |

**Both GUARD conditions fail on E1, and Part 1 is not in this build.** The population band and the
Icathia gate were cleared at v0.64 and the three "small, PRNG-neutral" Parts lose them on their
own. Seed 2 is the whole story: it loses 86 population and never reaches Era 3 at all.

### 10.2 Why — and it is one number

| | v0.64 (s0, seed 3) | **E1 (seed 1)** | **E2 (seed 1)** |
|---|---|---|---|
| **`vigorPerSec` at end of run** | **82.16** | **30.7** | **31.4** |
| vigor raw Σ at end of run | **5.4432** | **2.3304** | **2.3363** |
| trades completed over the run | **165,063** | **31,826 → 11,453** (per seed) | 44,442 |
| buildings standing at end | 1,698 | 1,361 | 1,489 |

**Vigor income falls to 37% of baseline** and the settlement stops buying expeditions. A caravan
costs 135 vigor; the Wilds camps pay **timber, ore and furs**; every housing tier at every
milestone reads **stock-bound — timber** or **stock-bound — alloy**. The spec's model — *"vigor's
only path to population is the long one through champions"* — is not what the game does.

### 10.3 AND THE ERA-3 ECONOMY IS DOWNSTREAM OF IT TOO, BY ×4.7

This is the finding the population number was hiding. **Era-3 raw gross at end of run:**

| resource | v0.64 (s0) | **E1** | **E2 (shipped)** | shipped ÷ v0.64 |
|---|---|---|---|---|
| zaunore | **587.79/s** | 85.41/s | **126.09/s** | **×0.21** |
| coalgas | **403.38/s** | 59.42/s | **78.81/s** | **×0.20** |
| hexore | **646.57/s** | 79.22/s | **110.33/s** | **×0.17** |
| shimmer | **193.49/s** | 40.64/s | **43.22/s** | **×0.22** |
| **mana gross** | **1,351.27/s** | 357.59/s | **383.81/s** | **×0.28** |

**Pass condition 16 asks for the three Zaun raws' gross before and after. Here it is, and it is a
five-fold collapse.** The Era-3 apparatus is built out of materials the Wilds pay for, and the
Wilds are paid for in vigor. Nothing in the round touched an Era-3 price.

**This is the measurement the analyzer should read first.** It is much larger than the population
delta, it is entirely attributable to Part 2, and it was not predicted by anyone.

### 10.4 Part 3 — exonerated by its own instrument

Longhouse at end of run on E1: **36 copies standing, ceiling-bound maximum 58, binding resource
TIMBER**. The provisions component **never binds at any milestone**, exactly as the never-bind
sizing rule guaranteed. Two-tier ceiling **134** against v0.64's **135**. The spec predicted
*"Part 3 exactly zero on everything"* and **the prediction holds**.

### 10.5 Part 4 — mana, before and after (pass condition 16)

| milestone | v0.64 (s0) | **E1 (s3 in)** | **E2 (shipped)** |
|---|---|---|---|
| sparks | +33.39/s · ratio 0.177 | +33.48/s · 0.177 | **+33.51/s · 0.176** |
| hexcore | **−0.40/s · 1.003 DEFICIT** | **−4.10/s · 1.047 DEFICIT** | **+26.43/s · 0.620** |
| icathia | +10.21/s · 0.935 | +39.90/s · 0.781 | **+24.82/s · 0.878** |
| final | **−14.52/s · 1.011 DEFICIT** | +37.76/s · 0.894 | **+24.81/s · 0.935** |

**On the shipped build there is no deficit at any milestone**, which discharges v0.64's condition
17 in full. **Reported honestly: Part 4 alone did not do it.** E1 — which contains Part 4 — still
runs a −4.10/s deficit at `hexcore`, deeper than v0.64's −0.40/s, because Part 2 cut the mana
gross that Part 4's +25% multiplies. **The cure is the shipped combination, not the Discovery**,
and a future round that reverses Part 2 should re-measure rather than assume the deficit stays
closed. Boost line raw Σ 1.3 → **1.4646**, **below the 2.0 knee**, delivered = raw at every
milestone (§33's delivered-value assertion, satisfied).

---

## 11. E2 — the shipped build, five seeds, 2,500 game-years

**E2 = `snapshots/v65/s6.html`, byte-identical to the shipped `index.html`** (sha256
`fac1310d…f88a`). Five seeds launched concurrently, **3,745.8s wall**.

### 11.1 The ensemble table

| figure | median | min | max | spread | per-seed |
|---|---|---|---|---|---|
| **icathia** | **1,964.6** | 1,731.2 | 2,434.7 | ×1.41 | 2033.1 / 2434.7 / 1731.2 / 1896.1 / **—** |
| **peak population** | **155** | 74 | 165 | | 155 / 138 / 162 / 165 / **74** |
| era3 | 1,386.15 | 1,249.8 | 1,505.7 | ×1.20 | 1472.2 / 1505.7 / 1249.8 / 1300.1 / — |
| ritesOfTargon | **90.6** | 69.8 | 103.3 | ×1.48 | 69.8 / 103.3 / 90.6 / 88.7 / 96.4 |
| voidStudies | 88.2 | 66.3 | 100.1 | ×1.51 | |
| firstAscent | 98.0 | 75.8 | 108.9 | ×1.44 | |
| **firstPZChampion** | **303** | 139.4 | 462.6 | **×3.32** | 320.3 / 462.6 / 246.5 / 303 / 139.4 |
| **sparks** | 560.9 | 463.3 | 929 | ×2.01 | |
| **sparksAfterPZ** | **293** | 234.9 | 466.4 | **×1.99** | 240.6 / 466.4 / 234.9 / 293 / 323.9 |
| firstChampion | 298.9 | 134.9 | 458.6 | ×3.40 | |
| chemtech | 794.3 | 710.4 | 1,084.2 | ×1.53 | |
| hexcore | 980.95 | 897.2 | 1,281.2 | ×1.43 | |
| deepWorks | 1,752.65 | 1,485.5 | 2,205 | ×1.48 | |
| firstTrade | 467 | 179.1 | 778.4 | ×4.35 | |

**Icathia 4 of 5 — the GUARD fails.** Seed 5 is the miss, and it is the same seed that reads peak
population **74**: it drew its first Piltover/Zaun champion at **y139.4**, the *earliest* of the
five, and still never reached Era 3's end. Seed 5 is a run that never got its economy started —
**470 trades over 2,500 years against a median of 44,442**.

### 11.2 Part 5's instrument, and what it says on its first outing

The spec's question was whether the three `[draw]` conditions are one random variable. **They are,
and now it is separated:**

> **firstPZChampion spread ×3.32 — the draw, which the design does not set.**
> **sparksAfterPZ spread ×1.99 — the part the designer controls.**
> **sparks spread ×2.01 — the two of them together.**

**The draw is the wider variable and it is not steerable.** All three `[draw]` conditions are
printed `[draw]`, reported and **not counted as failures** (pass condition 18): first champion
before y120 (worst 458.6), Sparks before y500 (worst 929), Chemtech→Hexcore under 400 years
(worst 232.7 — **this one is inside its target on every seed that reached it**).

**Note the honest caveat**: ×1.99 on the steerable half is still wide. Part 5 tells the analyzer
where to look; it does not say the design half is tight.

### 11.3 Part 1's actual effect — seed-for-seed E1 → E2, which is the whole point of s6

| seed | icathia | peak pop | era3 | rites | hexcore |
|---|---|---|---|---|---|
| 1 | 2,362.0 → **2,033.1** (**−328.9**) | 145 → **155** (+10) | 1,823.8 → **1,472.2** | 94.1 → 69.8 | 2,166.5 → **897.2** |
| 2 | **NEVER → 2,434.7** | 105 → **138** (+33) | NEVER → **1,505.7** | 116.1 → 103.3 | 1,157.6 → 1,281.2 |
| 3 | 1,679.5 → **1,731.2** (+51.7) | 172 → **162** (−10) | 1,059.6 → 1,249.8 | 71.1 → 90.6 | 1,064.7 → 932.1 |
| **median of the deltas** | **+51.7** | **+10** | | | |

**The spec predicted +150 to +500 later, with +900 as its falsifier. Measured median: +51.7, and
two of three seeds got EARLIER.** Seed 2 went from never completing to completing.

**Why: the ceiling was slack and Part 1 spent it.** Pass condition 8's block, at end of run:

| | s0 (v0.64) | **E2 (shipped)** |
|---|---|---|
| knowledge gross | 724.01/s | 384.04/s |
| **time at cap to date** | **82.8%** | **84.4%** |
| spent on TECHS | 1,402,855 | 1,388,920 |
| **spent on DISCOVERIES** | **101,066** | **2,061,132** |
| **discovery share of knowledge spend** | **6.7%** | **59.7%** |
| Discoveries unaffordable at end | 0 | **0** |
| knowledge multiplier | ×46.18 | ×40.73 |

**A ×20 increase in cumulative discovery spend, and time-at-cap went UP.** The currency was idle
82.8% of the run and now it is idle 84.4% of the run while paying twenty times more. **§24's
classification of knowledge as a lumpy-sink-at-ceiling was describing a surplus, not a queue** —
the spec's central reading, confirmed. At **every** milestone the dearest reachable Discovery
**FITS** under the ceiling (pass condition 4a, measured as well as asserted).

### 11.4 Housing at end of run (pass condition 13)

| tier | s0 (v0.64) | E1 | **E2 (shipped)** | ceiling ÷ standing |
|---|---|---|---|---|
| Shelter | 32 → 64 pop (max 38) | 28 → 56 (max 38) | **28 → 56 (max 38)** | **×1.36** |
| Longhouse | 44 → 44 pop (max 59) | 36 → 36 (max 58) | **37 → 37 (max 58)** | **×1.57** |
| Skyrise Terrace | 28 → 56 pop (max ∞) | 20 → 40 | **24 → 48** | — |
| **two-tier ceiling** | **135** | **134** | **134** | |
| **peak population** | **180** | **145** | **155** | |

**Every tier is stock-bound at every milestone on every build** — timber for the first two, alloy
for the Skyrise. Pass condition 13's ≥1.25 margin is cleared at **×1.36 and ×1.57**, so the
Longhouse's restored provisions component is not the binding constraint and Part 3 is shippable on
its own terms.

### 11.5 The knee audit at end of run

| family | raw Σ s0 → **E2** | knee L | delivered | thrown away |
|---|---|---|---|---|
| **vigor** | 5.4432 → **2.3363** | 8.0 | = raw | **0%** |
| devotion | 3.65 → **3.8243** | 5.0 | = raw | 0% |
| provisions | 1.90 → **1.90** | 3.0 | = raw | 0% |
| **mana** | 1.05 → **1.4646** | 2.0 | = raw | **0%** |
| crystals | 1.4218 → **1.4143** | 2.0 | = raw | 0% |
| gold | 0.825 → **1.0308** | 1.5 | = raw | 0% |
| culture | 0.20 → **0.3372** | 2.0 | = raw | 0% |

**Zero families past the knee, on the shipped build, at end of run.** The rails sized in v0.64
still have headroom everywhere; **vigor now has more headroom than any family in the game** (2.34
against a knee of 6.00 and a rail of 8.00), which is the arithmetic case for the analyzer's
next move being an increase, not a further cut.

### 11.6 `knee._sources` — the decomposition the spec got wrong, at end of run

| contributor | spec §2.3 said | **measured (s0)** |
|---|---|---|
| Training Ground (40 copies × 0.1) | **93.0%** | **73.5%** (4.000) |
| cloud drake | 0.231 | **0.948** (17.4%) |
| champion passives | 0.15 | **0.375** (6.9%) |
| `policyBoost("vigor")` | **0** | **0.12** (2.2%) |
| **Σ** | **5.4432** | **5.4432 — exactly right** |

**Every component wrong; the total exactly right.** The spec inferred the parts from the whole and
the inference was invalid. That is what the instrument was built to catch, and it caught it on its
first run, **before any constant moved** — which is operational rule 3 paying for itself.

**The consequence the spec did not foresee.** Deleting the building term leaves **Σ 1.4432**, not
the spec's 0.3810; with the weapon line, **×3.4432 on a maxed static probe**, not ×2.381 — a
**+72%** over the source's ×2.00, not +19%. Shipped as specified and reported as required.

**And v0.64's own lesson applies to that paragraph.** The maxed static probe is not the
instrument; the end-of-run audit is. **The real run reads Σ 2.3363**, i.e. **×3.3363** delivered,
because the drake and policy terms are draw- and choice-dependent and a real run does not max
them. **The honest headline for Part 2 is a 48% cut to vigor income (×6.4432 → ×3.3363), not the
spec's 63%.** I record this because in v0.64 I made the opposite mistake and had to take it back.

### 11.7 Era-3 raw classification (pass condition 5, v0.57 restated)

Unchanged in kind from v0.64 and still **FAIL** on the same structural grounds: `zaunore` and
`hexore` are **lumpy-sink-only** — 0/s continuous consumption — so a cap-out band cannot measure
them (§24). Of the two stock-limited raws, `coalgas` reads 14.1% and `shimmer` 69.5%, both outside
30–60%. **`shimmer` at 100% held with a P/C of 47.68 is a resource with no real consumer**, and
`voidessence` joins `knowledge`, `culture` and `renown` sitting at ceiling. **This is a design
question, not a cap, and it has been one since v0.57.**

### 11.8 Predicted vs measured

| slice | predicted Icathia | **measured** | predicted pop | **measured** |
|---|---|---|---|---|
| s1 vigor | +100 to +400 | — (not run in isolation; s1–s3 = E1) | 0 to −10 | — |
| s2 Longhouse | 0 | **0 — instrument confirms non-binding** | 0 to −5 | **0** |
| s3 mana | −50 to −200 | — | 0 | — |
| **s1–s3 combined (E1)** | | **+127.3 / never / −14.7** | | **−20 / −86 / −8** |
| s4, s5 | 0, byte-identical | **PROVED — `tools/prove-s4-neutral.sh`, seeded figures match to the digit** | 0 | **0** |
| **s6 Part 1 (E1→E2)** | **+150 to +500** | **−328.9 / (never→done) / +51.7 — median +51.7** | 0 to −15 | **+10 / +33 / −10** |
| **shipped (E2)** | 1,900–2,400 median, 3–5 of 5 | **1,964.6 median — INSIDE. 4 of 5 — GUARD FAILS** | 160–190 | **155 — inside the 150–220 band, below the forecast** |

**Two of the three headline forecasts were inverted by measurement.** Part 2, forecast "small on
population", was the round's largest effect on everything. Part 1, forecast "+150 to +500 later",
came in at +51.7 and improved two seeds of three.

---

## 12. Pass conditions

| # | Condition | **Result** |
|---|---|---|
| **1** | **Icathia on all five seeds — GUARD** | **FAIL — 4 of 5** (2033.1 / 2434.7 / 1731.2 / 1896.1 / never). Reported against §1.5's supply figures per §1.6; **no discovery price cut**. §13 names the two legitimate levers. |
| **2** | **Peak population 150–220 [median] — GUARD** | **PASS — median 155** (155/138/162/165/74). Two seeds sit below the band individually; the declared shape is median. |
| **3** | `DISCOVERY_KNOWLEDGE_SET` gone; coverage 75 of 78 by enumeration | **PASS — absent at grep level; coverage 79 of 82 on the shipped roster** (the three unpriced are enumerated) |
| **4** | The three unpriced Discoveries named, each on a zero-knowledge tech | **PASS — `DISCOVERY_UNPRICED_ZERO_RUNG` is generated, not authored, and the suite asserts each one's tech carries `knowledge: 0`** |
| **4a** | No Discovery exceeds the knowledge CEILING at its own tech | **PASS — asserted (`0.8K < K`) AND measured: "dearest reachable Discovery FITS" at all four milestones on both s0 and the shipped build** |
| **5** | Per-upgrade median inside 0.73–1.00 after every load-time mutation | **PASS** |
| **6** | Total discovery knowledge · whole-game ratio 2,003,370 · 1.389 vs source 1.903 | **PASS — 2,003,370 and 1.3887, computed in the suite, reproduced to the digit** |
| **7** | The ten authored figures unmoved, asserted by value | **PASS** |
| **8** | Knowledge supply block at all four milestones, on s0 AND the shipped build | **PASS — §11.3; s0's 82.8% / ×46.18 reproduces the spec exactly** |
| **9** | Training Ground: `boost: { vigor: … }` absent; `caps: { vigor: 150 }` unmoved | **PASS** |
| **9a** | Weapon line 0.50/0.25/0.25 into `boosts.vigor`, Σ ≈1.381 below the 6.00 knee, DELIVERED asserted | **PASS on membership, amounts, citation, knee and delivered-value. The "Σ ≈1.381" figure is WRONG in the spec — measured Σ is 2.3363 at end of run (§11.6), still far below the knee. Reported, not adjusted.** |
| **10** | `knee._sources` at all four milestones; Training Ground's share checked against 93.0% | **PASS AS AN INSTRUMENT, FAIL AS A PREDICTION — measured 73.5%, not 93.0% (§11.6)** |
| **11** | `BOOST_LIMIT` unchanged | **PASS — vigor 8.0, devotion 5.0, provisions 3.0, mana 2.0; crystals/gold/culture untouched** |
| **12** | Longhouse `provisions: 30` restored; §3.1's four-milestone table reproduced | **PASS** |
| **13** | Housing decomposition before and after; ceiling-bound ≥ 1.25 × stock-bound at every milestone | **PASS — ×1.36 (Shelter) and ×1.57 (Longhouse) at end of run; every tier stock-bound at every milestone (§11.4)** |
| **14** | Longhouse ledger row RR-ORIGINAL / HARDER with citation | **PASS — PARITY → HARDER, `js/buildings.js:476–487`** |
| **15** | Fourth mana Discovery: one entry, family `mana`, 0.25, not on `sparks`; Σ below knee; DELIVERED asserted | **PASS — `leylineLensing` on `hexcore`; Σ 1.4646 against a knee of 2.0; delivered = raw** |
| **16** | Mana net/s and ratio at all four milestones before and after; the three Zaun raws' gross likewise | **PASS — §10.5 and §10.3. The Zaun figures are the round's largest unpredicted finding: ×4.7 collapse.** |
| **17** | `firstPZChampion` per seed and as an ensemble figure; `sparks − firstPZChampion` with median and spread | **PASS — median 303 spread ×3.32; `sparksAfterPZ` median 293 spread ×1.99** |
| **18** | The three draw conditions printed `[draw]`, reported not failed, with the draw beside them | **PASS — reported, `ensFail` not incremented, `drawReported` counted separately** |
| **19** | Rites restated as `[median]` y50–200 with Part 6's ruling cited; no discovery price moved to serve it | **PASS — median 90.6, all five seeds inside; no price moved** |
| **20** | Untouched: `CONV_DISCOVERY_LINE` Σ0.65 · `CRYSTAL_SINK_MAX` 8 · `DISCOVERY_RUNG_CAP` absent · 1.2b not shipped · `capFamilyOf()` two families · audits 0/0 · Σ 4.35/1.80 · `CONSUMPTION` 4.25 · `XP_PER_SECOND` 0.05 | **PASS — all asserted** |
| **21** | Slice chain forward, s6 byte-identical to shipped, s4 reproduces s3 to the digit | **PASS — s6 == shipped, sha256 `fac1310d…f88a`; `tools/prove-s4-neutral.sh` proves s4 neutrality** |
| **22** | Every Part actioned, or its non-action explicitly justified | **PASS — all six Parts shipped; no non-actions this round** |

**20 PASS, 1 FAIL (condition 1, the Icathia guard), 1 SPLIT (condition 10 — the instrument passes,
the prediction it was asked to check does not).**

**One steerable pass condition inside the harness also fails**, and it is not one of the round's:
`moraleHigh` ("morale not pinned above 140 after Era 3") reads 6 / 4 / 4 / 5 / 0 against a ≤5
target. **Two seeds over by one and two points.** It is a new failure this round — v0.64 read 0 —
and it is a second-order consequence of Part 2: fewer wanderers against the same Bard's Hearth
count means more relief per head.

---

## 13. What I would take back, and what the analyzer should take next

### What I would take back

**Quoting −35 population from two ensemble medians before doing the subtraction seed-for-seed.**
§25 exists for exactly this and I wrote the headline before I ran the join. The real figure is
**−20 on the median seed** with a spread of −8 to −86 — a smaller central estimate and a much more
alarming spread, and the spread is the part that matters. The finding survives; the number did not.

**And nearly the same mistake again on vigor's Σ.** I wrote "×3.4432, +72% over the source" from a
maxed static probe. The end-of-run audit reads **2.3363 → ×3.3363**. In v0.64 I had to take back an
objection built on a static probe and I recorded the lesson in that report's §13; I then built this
round's central Part-2 arithmetic on one anyway. **The static probe belongs in a suite assertion.
It does not belong in a balance claim.** Both figures are now in §11.6 with the run figure leading.

**Launching E1 against the mutable `index.html`.** I caught it and relaunched against
`snapshots/v65/s5.html`, killing the children **by PID** per §9 — but the correct order is to build
the slice first and never point a long run at a file I still intend to edit.

### For the analyzer — in priority order

1. **THE ROUND'S BIGGEST FINDING IS NOT POPULATION. IT IS THAT ERA-3 RAW PRODUCTION IS DOWNSTREAM
   OF VIGOR BY ×4.7.** zaunore 587.8 → 126.1/s, hexore 646.6 → 110.3/s, coalgas 403.4 → 78.8/s,
   mana gross 1,351 → 384/s. **Nothing in the round touched an Era-3 price.** The chain is
   vigor → expeditions → Wilds camps pay timber/ore/furs → the apparatus that produces the raws.
   **Before anything else is tuned, decide whether that coupling is intended.** If it is, vigor is
   the single most load-bearing resource in the game and should be treated as one. If it is not,
   the Wilds are doing work the Era-3 buildings were supposed to do.
2. **THE ICATHIA GUARD FAILS AT 4 OF 5 AND §1.6 NAMES THE ANSWER — TAKE IT.** The `libraryRatio`
   line has been **dated and unactioned since v0.56**, and this round measured its justification
   directly: knowledge sits at ceiling **84.4%** of the run *after* a ×20 increase in discovery
   spend. **The ceiling is the lever, not a discovery price.** Second legitimate lever:
   `CONV_DISCOVERY_LINE`'s Σ0.65, flagged in v0.64 §13.5 and still unmeasured in isolation.
   **Do not cut a discovery price below the source's band** — the per-upgrade median is 0.80 inside
   a source IQR of 0.73–1.00 and that is the one thing Kittens actually holds constant.
3. **SEED 5 IS A DIFFERENT KIND OF RUN AND FIVE SEEDS IS NOW THE MINIMUM.** Peak population **74**,
   **470 trades** against a median of 44,442, Era 3 never reached — and it drew its first
   Piltover/Zaun champion **earliest** of the five. **A seed can fail for reasons that are not the
   draw**, which is new information; every previous round's failures were attributable to the
   champion order. Three seeds would have missed it entirely.
4. **PART 5's INSTRUMENT SAYS THE STEERABLE HALF IS STILL ×1.99, AND THAT IS THE NUMBER TO WORK
   ON.** The draw is ×3.32 and unsteerable; `sparksAfterPZ` is ×1.99 and it is the design's own.
   **Steer on `sparksAfterPZ` from here and retire `sparks` as a target** — the harness now emits
   both, and continuing to score `sparks` scores a coin flip.
5. **PART 2 IS RESTORABLE AND VIGOR HAS MORE HEADROOM THAN ANY FAMILY IN THE GAME.** Σ 2.3363
   against a knee of 6.00 and a rail of 8.00. If the analyzer wants Era 3 and population back
   without touching a price, **a fourth weapon-line rung or a vigor building term is the cheapest
   correction available**, and §11.5 shows there is no rail in the way. **But read finding 1
   first**: restoring vigor restores the Era-3 raws too, and the two cannot be tuned separately
   until that coupling is decided.
6. **MANA'S DEFICIT IS CLOSED BY THE COMBINATION, NOT BY PART 4 — DO NOT TREAT IT AS SOLVED.** E1,
   which contains Part 4, runs **−4.10/s at hexcore**, deeper than v0.64's −0.40/s. The shipped
   build reads **+26.43/s**. Any round that restores vigor income must re-measure mana, because
   Part 4's +25% multiplies a gross that Part 2 cut.
7. **`shimmer` AND `voidessence` STILL HAVE NO CONSUMER, AND IT HAS BEEN TRUE SINCE v0.57.**
   shimmer P/C **47.68**, 100% held; voidessence at ceiling. **This is not a cap question and no
   further cap round should pretend it is** (§24). It needs a sink or it needs deleting.
8. **THE 2,500-YEAR HORIZON IS AN RR HARNESS CONVENTION, NOT A SOURCE FIGURE, AND IT IS NOW
   DECIDING A GUARD.** Seed 5 fails condition 1 by not finishing inside a window nobody derived
   from Kittens. **This is Jerry's to rule on** and the spec asked for his word on it before the
   round landed. If the horizon moves to 3,000, condition 1 may pass without a single constant
   changing — which is worth knowing before tuning anything to satisfy it.
9. **AND THE PROVISIONS SINK QUESTION, ALSO JERRY'S.** The Longhouse at base 30 and ratio 1.15 over
   44 copies costs **≈93,500 provisions across a run**, the 44th copy alone ≈12,200. **A sink
   larger than that cannot ride on the Longhouse** without becoming a ceiling; it needs a
   continuous consumer or a low-copy building. That is arithmetic, not preference.

