# BUILDER SPEC v0.60 — the rate half of the rank ladder, found; two suites that die without failing; and a job the bot cannot reach

Written against the **v0.59.1 tag**, verified from disk on a fresh checkout.

**What reproduces.** Thirty suites run: **1,573 assertions passed, 0 failed.** The parity ledger
reproduces exactly — **226 rows: PARITY 63, EASIER 41, HARDER 2, UNVERIFIED 120.** `VERSION
v0.59.1`. Every v0.59 spec part I could check by grep shipped, including the two I most expected
to find altered: **the whole Scholarship cap family is gone** (`SCHOLAR_CAPS`, `SCHOLAR_LINE`,
`scholarMult`, `scholarCapNames` all return zero hits and `capFamilyOf()` is down to
`exempt`/`masonry`/null), and **Part 4's Convergence capture really did move to the unlock** —
`simcore.mjs:1383–1388` samples the bonus the tech *will* pay at the gate, and `pacing.mjs:826`
reads `r.convergenceAtUnlock`. I nearly filed that one as unshipped because the printed readout
is still keyed `convergenceAtSparks`; **grepping the consumer rather than the label is what
caught it, and that is the standing rule working.**

**Two things the report does not carry, and one of them contradicts its own diagnosis.**

> **Two suites abort mid-run and neither counts as a failure.** `test-v38` dies at assertion 21
> of 27 and `test-v45` at 43 of 59 — **22 authored assertions never execute**, and because both
> die by exception rather than by a failing `check()`, every "0 failures" count in the round is
> arithmetically true and materially wrong. Part 1.

> **The bot's tinkerer policy exists.** The report states *"the bot has no tinkerer policy at
> all. `manageJobs()` never staffs one, in any round, at any population."* It is at
> `sim/simcore.mjs:760`: `if (count("refinery") >= 1) want.push(["tinkerer", 0.05]);`. The
> measurement — zero tinkerers ever — is right; **the diagnosis is wrong, and the true cause is
> both simpler and more general.** Part 2.

**And the round's largest find, which closes a lookup open since v0.55.** `XP_PER_SECOND` has
been UNVERIFIED for five rounds across a documented list of dead retrieval routes. **It is
`js/village.js:3228`.** Part 7.

---

## Part 0 — Ground rules

**This spec produces `v0.60`.** Integers stay reserved 1:1 for spec rounds; v0.59.1 took the
point release. Read `BUILDER_PROTOCOL.md` and `OFF-CYCLE-PROTOCOL.md` first.

**Clone the Kittens source; do not use grep.app.** Every citation in this spec was read from
`github.com/nuclear-unicorn/kittensgame` at **`c52985b`** cloned to disk. Three of this round's
findings — `factoryAutomation`, the production-category census, and `XP_PER_SECOND` itself —
were retrieved in minutes after multiple prior rounds failed on them, and the ledger's own
"routes ruled out" note for `XP_PER_SECOND` lists three failures that a clone makes moot.
**Pin the revision in every citation:** line numbers drift, the Golden Spire block earlier
rounds cited as `js/buildings.js:1929–1931` is `:1964–1966` at this revision.

**Do not re-open** STANDING-RULINGS §§1–30. §16's charter governs every sizing argument here.

**The ensemble.** v0.59.1 took 4,038 s (67.3 min) for three seeds. Budget 75–90 minutes and
start it before writing code.

---

## Part 1 — Two suites die without failing, and the harness cannot tell

`test-v38` aborts at `tests/test-v38.mjs:251`:

```
ReferenceError: CAMP_MAX_CHARGES is not defined
```

The assertion's *predicate* is fine; its **message template** interpolates `CAMP_MAX_CHARGES`,
which is a game constant living in the browser page (`index.html`, `var CAMP_MAX_CHARGES = 2;`)
and **does not exist in Node scope**. The suite dies while formatting a string.

`test-v45` aborts at `tests/test-v45.mjs:408`:

```
TypeError: Cannot read properties of undefined (reading 'cost')
```

`const NEW = ["kindling"]`, then `byId[id].cost.knowledge`. **v0.59.1 note 3 deleted the
`kindling` tech.** §7 of that report re-pointed twelve assertions for the ladder count moving
37 → 36 and missed this one, because it is not a count — it is a lookup that now returns
`undefined`.

**Both are the same class of defect and it is a new one: a suite that dies is not a suite that
fails.** §21 covers a test that measures a baseline it did not reset. This is its sibling — **a
test whose failure mode is an exception, which every "N passed, 0 failed" line in the project
silently reports as health.**

### 1.1 Fix both

- `test-v38:251` — read `CAMP_MAX_CHARGES` inside the `page.evaluate` that builds `renown` and
  return it, or hard-code 2 with the source line cited. **Do not delete the assertion.**
- `test-v45:396` — `kindling` is retired; `NEW` should be empty or name a live tech. The
  surrounding assertions (retired ids gone, their Discoveries re-homed) are still worth keeping,
  and `kindling`'s Discovery `bankedCoals` moved to Sump Ecology, which is exactly what
  `retiredUpgradesKept` is for. **Add `kindling` to `RETIRED`.**

### 1.2 Make the class impossible to hide — this is the part that matters

**Every suite must end by printing a machine-readable trailer**, and the runner must treat its
absence as failure:

```
SUITE-END <name> asserted=<n> passed=<p> failed=<f>
```

where `asserted` is a count the suite states **before** running (the number of `check()` calls
it intends), so a suite that dies early prints nothing and a suite that dies late prints a
mismatch. **A non-zero exit code must fail the round even when `failed=0`.**

**Pass conditions:** both suites run to completion; every suite prints `SUITE-END` with
`asserted === passed + failed`; the runner fails on a non-zero exit; a deliberately-thrown
exception in a scratch suite is demonstrated to fail the round.

---

## Part 2 — The tinkerer is unreachable by construction (builder note 1, second half)

The policy is at `sim/simcore.mjs:760`. The reason it never fires is the loop it sits in:

```js
for (const [job, share] of want) {
  const j = JOBS.find(x => x.id === job);
  if (j.max && (S.jobs[job] || 0) >= j.max()) continue;
  if ((S.jobs[job] || 0) < Math.floor(pop * share)) { assignJob(job, 1); return; }
}
```

**`want` is an ordered priority list, one assignment per call, with an early `return`.** The
last entry is only reached when every earlier entry is simultaneously at or above its share.
The shares ahead of `tinkerer`:

| branch | jobs ahead | Σ share |
|---|---|---|
| `atWall \|\| kPinned` | woodcutter .26, miner .26, loremaster .14, arcanist .10, jungler .12, acolyte .18 | **1.06** |
| else | loremaster .30, woodcutter .18, miner .18, arcanist .10, jungler .12, acolyte .18 | **1.06** |

**Σ = 1.06 of a population of 1.00.** The jobs ahead of the tinkerer can never all be satisfied
at once, so the loop always returns before reaching it. **And no RR job defines `max()`**, so
the `continue` that could skip a saturated job never fires either.

**This is not a tinkerer bug. Any job appended to the end of `want` is dead code**, and the next
one added will be too. Two rounds have now drawn a balance conclusion from a bot behaviour that
was an artefact of list order — v0.57 Part 4 for farmers, and note 7 here.

**Ship the structural fix, not a bump:**

1. **Assert the invariant:** `Σ shares ≤ 1.0` in both branches, in `test-v60`, computed from the
   arrays rather than restated. **A list whose shares oversubscribe the population is a bug
   whichever job is last.**
2. **Re-normalise** so the sum clears 1.00 with headroom for farmers, or **change the loop to
   pick the job furthest below its share** rather than the first one below it. The second is
   the real fix and it makes order stop mattering; state which was chosen and why.
3. **`tinkerer` gets a share that survives normalisation.** 0.05 at pop 209 is 10 tinkerers,
   which is a real crystal faucet and the thing note 7 wanted to observe.

**Pass conditions:** Σ-share assertion in both branches; **tinkerers > 0 on all three seeds**,
reported with the count at Icathia; farmers still staffed; peak population and the morale band
unmoved beyond their existing tolerances.

---

## Part 3 — Decompose the crystal economy BEFORE sizing the burn (builder note 1, first half)

**Note 7 has now been sized twice against the wrong quantity and the spec will not do it a third
time.** v0.59.1 took the burn ×6 and moved crystals-at-cap from 95.5% to 95.9%. The report's
conclusion — *"the burn is too small by roughly two orders of magnitude"* — is a plausible
reading of `20 × 0.12 = 2.4` against 559/s, but **nobody has decomposed the 559/s**, and reading
the code says it cannot come from where the report assumes.

**What the code says.** RR's converter block, `computeRates()`:

```js
for (var i2 in b.convert.input) {
  var inAmt = b.convert.input[i2] * n * (i2 === "mana" ? manaCut : 1);   // FLAT
  ...
}
for (var o in b.convert.output) {
  var outAmt = b.convert.output[o] * n * convMult * (1 + (boosts[o] || 0));   // MULTIPLIED
  ...
}
```

**Inputs take no `convMult` and no `boosts`; outputs take both.** So the Manufactory's burn is
flat per copy by construction while the Refinery's yield rides the whole conversion stack.

**And the arithmetic does not close.** 41 Refineries at `crystals: 0.02` per copy is **0.82/s**
of base output. `convMult` tops out around 2.7–4 (cinder 1.5 × clockworkBellows 1.25 ×
bankedCoals 1.15 × resonanceCoils 1.25, plus overseer affinity and the infernal drake) and
`boosts.crystals` sums resonanceCoils 0.25 + tributeReliquaries 0.25 + hexwarden affinity + the
hextech drake. **Those terms do not multiply 0.82/s into 559/s.** Either there is a crystal
faucet neither the report nor I have enumerated, or one of these multipliers is far larger than
it reads. **That gap is the finding; do not size anything until it is closed.**

### 3.1 Ship the instrument first

`track()` already records every contribution to every rate with a label. **Emit the crystal rate
decomposition at each milestone** — every labelled contributor, its magnitude, and its share of
the total — into the run result, and print it. **Then** state where 559/s comes from.

### 3.2 The Kittens anchor for a primary sink, once you know what you are sizing against

Crystals are RR-original and have no counterpart resource, so the parity argument must be
structural rather than a magnitude. The source supplies one cleanly:

| | | |
|---|---|---|
| `oilWell` | `js/buildings.js`, `oilPerTickBase: 0.02` | one **faucet** building |
| `calciner` | `js/buildings.js`, `oilPerTickCon: -0.024` | one **sink** building |

**In Kittens a primary consumer burns 1.2× what a primary producer makes, per copy.** That is
the shape to hit — the Manufactory's per-copy burn against the Refinery's per-copy yield **on
the same footing**, which today they are not, because one is multiplied and the other is not.

**And note that Kittens has the same asymmetry** — `oilPerTickCon` is flat while
`ironPerTickAutoprod` is `0.15 * (1 + calcinerRatio)`. **The asymmetry is parity; its magnitude
is not.** Kittens' `calcinerRatio` sums to **2.70** across three upgrades, so the source's
production multiplier is ×3.70 against a flat burn. **If RR's is genuinely two orders of
magnitude, the out-of-parity item is RR's conversion multiplier stack, not the Manufactory's
fuel** — and raising `MANUFACTORY_FUEL` would paper over it at exactly one point on the curve
while making early Manufactories unbuildable.

**Pass conditions:** the crystal decomposition ships and is printed at every milestone; 559/s is
attributed to named contributors summing to 100%; the burn is sized **against the Refinery's
per-copy yield at the same multiplier footing**, with the 1.2× anchor cited; **`MANUFACTORY_FUEL`
is NOT raised until the decomposition is in the report.**

---

## Part 4 — Quantify Era 3's spread (builder note 2)

×1.02 → ×1.32 → ×1.58 across three rounds, none of which touched Era-3 content. Two candidate
causes are stacked and neither is separated: **champion passives gated on a renown economy that
v0.59 made variable**, and **the Manufactory's crystal drag**. This is the project's largest open
measurement question and it gets a Part rather than another note.

**The experiment, and it is a decomposition, not another run.** Cumulative-prefix isolation is
already the project's tool; use it with **seed-matched pairs** so the difference is the variable
and not the draw:

| slice | build | what it isolates |
|---|---|---|
| A | v0.59.1 as shipped | the baseline spread |
| B | A with `MANUFACTORY_FUEL = 0` | removes the crystal drag entirely |
| C | A with champion passives forced to a **fixed** roster at a fixed year | removes the renown-variance channel |
| D | B + C | the residual — whatever spread survives both |

**Same three seeds for every slice.** Report Era 3 median and spread for each, and **the
variance decomposition**: how much of A's ×1.58 is B-attributable, how much C-attributable, how
much residual.

**State the prediction before running.** Mine: **C dominates.** Champion recruitment is a
threshold crossing on a resource whose income v0.59 made deed-paced and therefore bursty, and a
champion passive is a production multiplier — a threshold on a bursty input, feeding a
multiplier, is the classic variance amplifier. The Manufactory's drag is a smooth per-tick
subtraction and smooth terms do not widen spreads. **Predicted: B ≈ ×1.50 (barely moved),
C ≈ ×1.15, D ≈ ×1.10.** If B moves more than C, my model of this is wrong and the report should
say so plainly.

**Pass conditions:** four slices, three seeds each, same seeds; a variance decomposition table;
the prediction above quoted and scored; **if the residual D exceeds ×1.20, a third cause exists
and is named as an open question rather than absorbed.**

---

## Part 5 — `factoryAutomation` retrieved, and RR is wrong on all three of its numbers (builder note 3)

**Retrieved from the clone in one grep.** `js/workshop.js:1240–1250` — `factoryAutomation`
carries `effects: {}` and prices `science 10,000 + gear 25`; the entire mechanism is the
Steamworks' `action()`, `js/buildings.js:1309–1318`:

```js
var baseAutomationRate = 0.02;
// Cap automation at 90% of resource cap to prevent trying to craft more than you have
var automationRate = Math.min(baseAutomationRate * (self.on + 1), 0.9);

var newCrafter = function(consumedResource, craftedResourceName, isAllowed) {
    var consumedQuantity = consumedResource.value * automationRate;
    return {
        numberOfCrafts: isAllowed && consumedResource.value >= consumedResource.maxValue * (1 - baseAutomationRate)
            ? Math.max(0, Math.floor(consumedQuantity / game.workshop.getCraft(craftedResourceName).prices[0].val))
            : 0,
```

**Three figures, and RR matches none of them.**

| | Kittens | RR (`index.html:3409–3410`) |
|---|---|---|
| trigger | `value ≥ maxValue × (1 − 0.02)` = **98%** | `AUTOMATION_TRIGGER = 0.95` |
| share | `min(0.02 × (copies + 1), 0.90)` of the **stockpile** | `AUTOMATION_SHARE = 0.05` × copies of the **ceiling**, unbounded |
| base | current `value` | `cap` |

**The trigger and the share are the same constant in the source** — `baseAutomationRate` is
used for both — which is an elegant coupling RR split into two unrelated numbers. And the
scaling is *sub*-linear and capped where RR's is linear and unbounded:

| copies | 1 | 2 | 5 | 10 | 20 | 44 |
|---|---|---|---|---|---|---|
| Kittens | 4.0% | 6.0% | 12.0% | 22.0% | 42.0% | **90.0% (cap)** |
| RR | 5.0% | 10.0% | **25.0%** | **50.0%** | **100.0%** | 220.0% |

**RR is ~2× the source at five copies and unbounded past twenty.** The base difference (ceiling
vs stockpile value) is minor because the trigger only fires near the ceiling — say so rather
than fixing it silently.

**Ship the source's figures:** `AUTOMATION_TRIGGER` and the share derive from **one**
`AUTOMATION_BASE = 0.02`; share is `min(AUTOMATION_BASE × (n + 1), 0.90)`; the base is the
current stockpile. **The ledger row moves UNVERIFIED → PARITY with both citations.** RR's
`jammed`-equivalent already matches — the source jams until next year, which is RR's per-game-year
cadence.

**Pass conditions:** one constant drives both trigger and share; the 0.90 cap asserted at 44+
copies; the share table above asserted at 1, 5, 10 and 20; ledger row re-rated with
`js/buildings.js:1309–1318` cited; **the automation's effect on Era 3 reported** — this is a
real cut to a faucet at high copy counts.

---

## Part 6 — The mana boost census, against the source's five categories (builder note 4)

**Note 4 asks for a Σ comparison rather than a rung-by-rung one, and the source turns out to
have a much more explicit structure than either was assuming.** `game.js:3409–3440` is the whole
production stack for a resource:

```js
perTick += resProduction;                                       // village jobs
perTick += resProduction * this.getEffect(res.name + "JobRatio");        // job-scoped, ADDITIVE
perTick *= 1 + this.getEffect(res.name + "GlobalRatio");                 // global
perTick *= 1 + this.getEffect(res.name + "Ratio");                       // buildings and space
perTick *= 1 + this.getEffect(res.name + "RatioReligion");               // religion
perTick *= 1 + this.getEffect(res.name + "SuperRatio");                  // "super"
```

**Kittens' Law is literally this code**: `getEffect` sums every contributor within a named
category, and the categories multiply against each other. **Five categories, and they are not
interchangeable.**

**The census, every declaration in `js/*.js` at `c52985b`:**

| category | declarations | resources | magnitudes |
|---|---|---|---|
| **`<res>GlobalRatio`** | **2 in the entire game** | starchart, unicorns | **0.30, 0.25** |
| `<res>SuperRatio` | 1 | coal | 0.20 |
| `<res>RatioReligion` | 10 | unicorns, faith | unicorns Σ8.40, faith 0.10 |
| `<res>JobRatio` | 11 | wood, manpower, catnip | **wood Σ3.20, manpower Σ1.00, catnip Σ0.80** |
| `<res>Ratio` | 268 | 138 keys | keyed by **building/mechanism** (`barnRatio` Σ4.35, `warehouseRatio` Σ1.80), not by resource |

**The finding, stated as a Σ comparison because that is what note 4 asked for.** RR's
`boosts.mana` is Σ **0.75** — `leylineCalibration 0.30 + trueIceCellars 0.20 + hexresonance 0.25`
— in **one accumulator applied to building production, job production and converter outputs
alike** (`index.html:5216`, `:5296`, `:5345`).

- **Against the only category with the same scope, RR is 2.5–3× the source's largest.**
  `<res>GlobalRatio` has **two members in the whole of Kittens**, one upgrade each, at 0.30 and
  0.25. **No resource in Kittens has a stacked global production category at all.**
- **Against the source's job lines, Σ0.75 is unremarkable** — catnip Σ0.80 over two rungs is
  almost exactly it. **So the magnitude is fine and the scope is not.** RR's line is a
  catnip-sized boost applied globally.
- **The report's re-rating of `leylineCalibration` to EASIER is right, and its stated reason is
  half wrong.** *"Kittens does have global `<res>Ratio` upgrades"* — `<res>Ratio` is the
  **buildings** category and is keyed by building, not resource. The global category is
  `<res>GlobalRatio` and it has two members. **Correct the row's citation to `game.js:3430` and
  the two-member census rather than leaving it pointing at the wrong category.**

**What to ship.** This Part is a **ruling and a ledger correction, not a re-balance.** Do not
change 0.75 on the analyzer's say-so — §16 makes this Jerry's call, and the honest framing for
him is: *RR's mana line is the only stacked global production category in either game; Kittens'
equivalent category tops out at a single 0.30.* Ship the census as three ledger rows (one per
discovery) each citing `game.js:3409–3440`, and **flag `boosts` as a structural divergence in
its own right** — RR has one accumulator where the source has five, so RR cannot express
"job-scoped" and "global" as different things at all. That is the deeper item and it should be
named now even if it is not fixed this round.

**Pass conditions:** three ledger rows with the category census cited; `leylineCalibration`'s
citation corrected off `<res>Ratio`; a standing-divergence row for the single-accumulator
`boosts` design; **no magnitude changed**.

---

## Part 7 — `XP_PER_SECOND` is FOUND, and it inverts the rank ladder's verdict (builder note 5)

**Open since v0.55. Closed from the clone.** `js/village.js:3227–3229`:

```js
var hgSkillModifier = (this.kittens.length <= this.maxKittens) ? 1/(1 + getLimitedDR(getEffect("maxKittensRatio"), 1)) : 1;
var baseSkillXP = game.workshop.get("internet").researched ? Math.max(this.getKittens() * hgSkillModifier / 10000, 0.01) : 0.01;
var skillXP = (baseSkillXP + game.getEffect("skillXP")) * times;
```

**The base increment is `0.01` per tick**, unconditionally before the Internet upgrade. And the
`times`/`frequency` machinery immediately above it is a **performance optimisation that
preserves the rate exactly** — `frequency` is 1 below 100 kittens, the block early-returns unless
`ticks % frequency === 0`, and then `times = frequency`, so the average is 0.01/tick at every
population.

**Kittens ticks 5/s (§ the Appendix, and `TICK_MS = 200` is exact tick parity), so the source
rate is 0.05 XP/s. RR's `XP_PER_SECOND = 0.5` is ten times the source.**

### 7.1 The 102% threshold debt is not what the ledger says it is

v0.59 Part 6 recorded the rank ladder as **HARDER, a 102% debt**, and the ledger calls it *"the
largest single parity divergence in the game."* **It measured the thresholds with the rate
unknown, and the rate runs the other way:**

| | Kittens | RR | |
|---|---|---|---|
| top-rank threshold | 9,000 | 18,200 | ×2.02 **harder** |
| XP rate | **0.05/s** | 0.50/s | ×10.00 **faster** |
| **time to top rank** | **50.00 real hours** | **10.11 real hours** | **RR is ×4.95 FASTER** |

**The ladder is EASIER, by a factor of five, and it has been ledgered HARDER for two rounds.**
The ledger's own row anticipated exactly this — *"a 102% threshold debt at an unverified rate is
one unknown multiplied by another"* — and the unknown is now known. **Re-rate it, and re-rate it
by the product, not by either half.**

### 7.2 And `XP_CAP` is stale in the same place

`XP_CAP = 25,556` was derived at v0.56 as Kittens' cap ratio `20001/9000 = 2.22233` applied to
RR's then-top rank of **11,500**. Note 11 moved the top rank to **18,200** and the cap did not
follow: **25,556 / 18,200 = 1.404×**, against the source's 2.222×. **The ratio-preserving figure
is 40,446.** It is a PARITY row that stopped being parity when a different note moved its
denominator — the same failure mode as §2.1 of the last report, one round later.

### 7.3 What to ship

1. **The citation, everywhere.** `js/village.js:3228`, revision pinned. Three ledger rows change:
   `XP_PER_SECOND` UNVERIFIED → **rated**, the rank ladder HARDER → **EASIER with the product
   stated**, and `XP_CAP` PARITY → **stale, re-derived**.
2. **Do not silently re-rate to 0.05/s.** A ×10 cut to XP is a large pacing change and §16 makes
   it Jerry's ruling. **Ship the finding and the arithmetic; put the change to him.** Note that
   v0.55 already moved this constant twice and one move cost −193.6 game-years of Era 3.
3. **Also retrieved and not yet ported:** Kittens' **Academy** grants `skillXP: 0.0005` per copy
   (`js/buildings.js:628`), i.e. a building that accelerates learning — the only additive
   contributor to `getEffect("skillXP")` in the game. RR has no analogue. Ledger it as a
   missing-content row; do not ship it this round.

**Pass conditions:** the citation recorded with its revision; the rank ladder re-rated by the
**product** of threshold and rate with the ×4.95 stated; `XP_CAP`'s staleness recorded with
40,446 named; **no constant changed without Jerry's ruling**; the Academy `skillXP` row added.

---

## Part 8 — Triage the 120 UNVERIFIED rows now that retrieval is cheap (builder note 5)

**120 of 226 rows are UNVERIFIED — 53% of the ledger.** The instrument that exists to answer "is
this at parity?" cannot answer for the majority of the game. **Three of this round's finds were
UNVERIFIED rows that fell to a single grep against a local clone**, which reframes the number:
much of that 120 is not unverifiable, it is unattempted under a retrieval method that no longer
applies.

**Ship a triage pass, not a verification marathon.** For every UNVERIFIED row, classify:

| class | meaning | action |
|---|---|---|
| **RETRIEVABLE** | a named Kittens identifier exists | grep the clone; verify or refute this round |
| **RR-ORIGINAL** | no counterpart resource or mechanism | re-rate **EASIER/HARDER by argument**, and stop calling it UNVERIFIED — that label is for things not yet looked up, not for things that cannot exist |
| **GENUINELY OPEN** | a counterpart should exist and was not found | keep UNVERIFIED **with the routes tried recorded**, as `XP_PER_SECOND` did — that discipline is what made it findable the moment the method changed |

**Predicted split, stated before the pass: 35 RETRIEVABLE, 60 RR-ORIGINAL, 25 GENUINELY OPEN.**
The `hextech` row — *"crystals are RR's own resource; no Kittens counterpart"* — is the
archetype of a mislabelled RR-ORIGINAL: it is not unverified, it is unverifiable, and it should
be argued rather than deferred.

**Pass conditions:** every UNVERIFIED row carries a class; the RETRIEVABLE set is actually
retrieved this round; UNVERIFIED's count reported before and after with the split; **`tools/parity-ledger.mjs`
rejects a row that is UNVERIFIED without a recorded retrieval attempt.**

---

## Part 9 — Order, discipline, pass conditions

### Order

1. **Part 1** — the suites. Nothing measured afterwards is trustworthy until a dying suite fails.
2. **Part 2** — the bot's job list. It gates Part 3's measurement and it is one assertion plus a
   loop change.
3. **Part 3.1** — the crystal decomposition instrument. **No sizing.**
4. **Part 5** — `factoryAutomation`. Self-contained, and it changes a faucet, so it lands before
   the ensemble.
5. **Part 4** — the Era-3 variance decomposition. Four slices × three seeds; **this is the round's
   long pole and it needs the ensemble budget.**
6. **Parts 6, 7, 8** — the census, the XP finding, the ledger triage. Rulings and rows; no game
   numbers move without Jerry.

### Operational

Median and spread for every milestone claim (§25). `--years N --seeds 3`, never a bare
positional. Classify with §24 before sizing any ceiling. Strip comments before grepping. Never
`playwright install`. **Clone Kittens; pin the revision.** Push via the handoff's token-remote
recipe and scrub the token afterwards.

### Round pass conditions

| # | Condition | Target |
|---|---|---|
| 1 | `test-v38`, `test-v45` | run to completion; 27 and 59 assertions execute |
| 2 | `SUITE-END` trailer | every suite; `asserted === passed + failed` |
| 3 | Non-zero exit | fails the round even at `failed=0`; demonstrated |
| 4 | Σ job shares | **≤ 1.0** in both branches, asserted from the arrays |
| 5 | Tinkerers | **> 0 on all three seeds**, count at Icathia reported |
| 6 | Crystal decomposition | printed at every milestone; 559/s attributed to 100% |
| 7 | `MANUFACTORY_FUEL` | **unchanged** until 6 is in the report |
| 8 | Era 3 variance | four slices, seed-matched, decomposition table, prediction scored |
| 9 | `factoryAutomation` | one constant drives trigger and share; 0.90 cap; table asserted |
| 10 | Mana census | three ledger rows; `leylineCalibration` citation corrected; **no magnitude moved** |
| 11 | `XP_PER_SECOND` | citation recorded; ladder re-rated by the **product**; ×4.95 stated |
| 12 | `XP_CAP` | staleness recorded; 40,446 named; **not changed without Jerry** |
| 13 | Ledger triage | every UNVERIFIED row classed; RETRIEVABLE set retrieved; split reported |
| 14 | Unchanged | `capFamilyOf()` two families · audits 0/0 · Σ 4.35/1.80 · `CONSUMPTION` 4.25 · ratio 1.17647 |
| 15 | Every Part | actioned, or its non-action explicitly justified |

### Predicted vs measured — medians of three, with spreads

| slice | Era 3 median | spread | note |
|---|---|---|---|
| v0.59.1 baseline | **785.9** | ×1.58 | the report's figure; **my ensemble had not finished at hand-off** |
| s1: suites + trailer | **0.0** | unchanged | no game code |
| s2: bot job list | **−40 to +40** | **may NARROW** | tinkerers appear for the first time; crystal income rises, and a job list that no longer oversubscribes may change every share |
| s3: crystal instrument | **0.0** | unchanged | measurement only |
| s4: `factoryAutomation` | **+10 to +60** | unchanged | a real cut to the beam/slab faucet past ten Manufactories |
| s5: rulings and rows | **0.0** | unchanged | no game numbers move |
| **shipped** | **760–890** | **the question, not the median** | |

**The spread is this round's headline figure, not Era 3's median.** Part 4 exists to explain
×1.58 and Part 2 may move it as a side effect — **so report s2's spread specifically**, because
if normalising the job list narrows the spread materially, then a third cause of the variance
was the bot's own allocation instability and Part 4's decomposition has a term nobody predicted.

**And one prediction I expect to be wrong in an informative way.** I predict Part 2 raises
crystal income (tinkerers at last) and therefore makes the Manufactory's burn *relatively even
smaller*. **If crystals-at-cap falls below 90% purely from staffing tinkerers, then note 7's
premise — that the sink is the problem — was wrong from the start, and the problem was that the
bot never built the faucet's workforce.**

---

## Sources, all read this session

**Line numbers are pinned to `nuclear-unicorn/kittensgame` at `c52985b` (2026-08-04), cloned to
disk.** Cloning is the retrieval route this project should use from here; three lookups that
multiple prior rounds recorded as dead fell to single greps against it.

**Kittens:** `js/village.js:3209–3229` — the `frequency` machinery and `baseSkillXP = 0.01`,
`skillXP = (baseSkillXP + getEffect("skillXP")) * times`, **the five-round `XP_PER_SECOND`
lookup**; `js/village.js:3231` `skillsCap = 20001`; `js/buildings.js:628` — the Academy's
`skillXP: 0.0005`, the only additive contributor to that effect; `js/workshop.js:1240–1250` —
`factoryAutomation`, `effects: {}`, science 10,000 + gear 25; `js/buildings.js:1309–1318` — the
Steamworks' automation, `baseAutomationRate = 0.02`, `min(0.02 × (on+1), 0.90)`, the
`(1 - baseAutomationRate)` = 98% trigger, and the `jammed` year cadence; `game.js:3409–3440` —
the five-category production stack, **`JobRatio` additive onto village production, then
`GlobalRatio`, `Ratio`, `RatioReligion`, `SuperRatio` multiplicative**; `js/buildings.js` —
`oilWell` `oilPerTickBase: 0.02` against `calciner` `oilPerTickCon: -0.024` and
`ironPerTickAutoprod: 0.15 * (1 + calcinerRatio)`, the faucet-vs-sink anchor; a full census of
`<res>{Global,Super,Job,Religion,}Ratio` declarations across `js/*.js`.

**RR**, at the v0.59.1 tag: `sim/simcore.mjs:760` — the tinkerer policy that exists, and the
`want` loop above it whose shares sum to **1.06**; `sim/simcore.mjs:1383–1388` and
`sim/pacing.mjs:826` — Part 4's Convergence-at-unlock capture, **shipped**, against the legacy
`convergenceAtSparks` readout that made it look unshipped; `index.html` converter block —
inputs flat, outputs `× convMult × (1 + boosts)`; `index.html:3409–3410` — `AUTOMATION_TRIGGER
0.95`, `AUTOMATION_SHARE 0.05`; `:3385` `MANUFACTORY_FUEL 0.12`; `:1769` `RENOWN_DEED_RATE 1.00`;
`:5503` the flat `renownTrickle = 0.007` gated on `callToArms`; `:6866`
`gainRenown(empowered ? renownBase * CHARGE_BONUS : renownBase)`; `:2035–2056` —
`ARCHIVE_RATIO_LINE` Σ0.06, `ASTROLABE_LINE`, `ASTROLABE_MULT 1.5`; `:2036` / `:4396` the archive slice
`1 + count("observatory") * archiveRatioTotal()`; `tests/test-v38.mjs:251` and
`tests/test-v45.mjs:396` and `:408` — the two aborts.

**Measurements taken this session:** all thirty suites re-run from disk (**1,573 passed, 0
failed, two suites aborted by exception losing 22 authored assertions**); an independent
row-and-verdict count of the parity ledger (**226 / 63 / 41 / 2 / 120**, exact); a grep-level
verification of every v0.59 spec part against the shipped file. **The three-seed ensemble was
launched at the start of the session and had not finished at hand-off — every Era-3 and
milestone figure quoted here is v0.59.1's own, labelled as such, and Part 9's baseline row says
so.**
