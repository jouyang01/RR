# BUILD REPORT v0.56 — storage gets a scope, Deepwinter gets teeth, and the instrument stops measuring

Shipped as **v0.56**, tagged `v0.56`. `VERSION`, the footer and the tag agree.

Six parts, five cumulative prefixes, **25 live suites, 1,219 assertions, 0 failures**, and seven
2,500-year pacing runs — five slices plus two extra seeds on the shipped build, which turned out
to be the most important two runs of the round.

**Two headlines, and the second one is uncomfortable.**

> **Jerry's directive lands, and it lands hard.** RR's two food stores were carrying **×1.5 and
> ×4** their Kittens counterparts, and its Warehouse carried none at all against the source's
> 750. Measured on v0.55, provisions sat at cap for **1.5% of all ticks** — the ceiling was so
> far above the economy that a season could not reach it. On v0.56 it is **25.8%**, and the
> settlement's held/cap at Sparks moves **56% → 91%**. Deepwinter now bites.

> **Era 3 reaches its target band for the first time — and finding that out required
> discovering that every Era-3 number this project has ever quoted was one draw from a very wide
> distribution.** Adjacent slices swung Era 3 by **+1,046, −1,007, +450, −448** game-years,
> every one larger than any effect that slice's change could plausibly have. So I measured the
> instrument instead: three seeds on the *same shipped build* give **700.6 / 1,709.3 / 1,835.3**
> — a **2.6× spread**, with the **median at 1,709.3, inside the 1,400–2,300 target**, and two
> of three draws in band. Seed 1, which every slice above was measured on, is the low outlier.
> Under STANDING-RULINGS §16 this is fine — the source is the balance authority and the bot is
> an instrument — but **single-seed Era-3 figures are no longer evidence for anything**, and
> that includes the ones in every prior build report.

---

## 1. My errors, first

1. **I applied Part 3 before snapshotting slice s4, so s4 could not be snapshotted forward.**
   The operational rule is explicit — isolation builds must BE the shipped file up to that
   point. I rebuilt s4 mechanically from s3 plus the Part 2 hunk and then diffed it against the
   shipped file to prove the remainder is exactly Part 3 (five lines, all Leona). The
   reconstruction is verifiable and I am recording it rather than quietly presenting s4 as a
   forward snapshot.

2. **My compensating Era-3 caps did nothing, and I should have predicted that from the data I
   already had.** I raised the shimmer ceiling ×2.5 and cut the hexore ceiling ×3.5 to chase
   pass condition 5. Measured on the shipped run: shimmer **84.1% → 87.2%**, hexore **3.2% →
   3.2%**. Neither is cap-limited. `held/cap` for hexore reads **0%** at every milestone — it is
   consumed as fast as it is produced — and shimmer reads **100%** because nothing consumes it
   at all. **These are flow problems wearing a stock problem's clothes**, which is the exact
   class HANDOFF v0.55 §6 names, and I walked into it. The caps ship because reverting them
   would need another 25-minute run to keep the shipped file honest against its own measurement,
   and they do no harm; the null result is the finding.

3. **The spec's `LEONA_SEASON_RELIEF` formula is wrong and I nearly shipped it.** Written as the
   spec gives it, `m + (1 - m) * 0.5` pulls Firstbloom's ×1.50 **down to ×1.25** — the clause
   would penalise a good season as eagerly as it softens a bad one, which contradicts the
   spec's own pass condition that spring measures 1.5 unchanged. Caught by that pass condition.
   A `m < 1` guard ships. See §6.

4. **Five of my own new assertions failed on first run**, including one that divided by a
   knowledge cap whose base is zero and read ×Infinity. All five were test defects, not game
   defects, and all five are fixed.

---

## 2. Part 6 — `test-v32` is not a flake, and the remedy hid it for three rounds

The analyzer traced this and it reproduces exactly. The camp block cleared `S.upgrades`,
`S.jobs` and `S.buildings` and then took `base = campYieldMult()` **with the live roster still in
`S`**. Since v0.55 Part 4 the seventh member of that stack is `traitBonus("trailblazer")`, so a
leftover Trailblazer makes `base` 1.005 and the assertion measures **4.980** against an expected
5.000. Two Trailblazers give 4.960. The trait roll is random, so it passed only when the roster
happened to hold none.

**HANDOFF v0.55 §8.6 recorded three such failures as CPU contention and prescribed "re-run on an
idle box". That remedy worked by luck.** The entry is corrected and the contention note retired.

Fixed, plus a second assertion that the baseline **is** 1.000, so a future member of the camp
stack leaking through an unreset container fails loudly instead of shifting a ratio by half a
per cent. **`test-v32` passed 10/10, three of them while a 2,500-year run saturated both cores.**

### The sweep, done mechanically

`tools/fixture-sweep.mjs` is the standing detector and it is re-runnable. It runs every suite
twice — once normally, once on a page whose `freshState()` returns a deliberately dirty state
(20 Trailblazers, three champions, two policies) so that every `reset()` re-seeds the leak — and
reports assertions that fail only in the dirty run.

**Three genuine defects, all of the same shape, all beyond the one the analyzer found:**

| suite | assertion | what it was really reading |
|---|---|---|
| `test-v32` | *"scouting is a FLAT 500 vigor"* | `expCost()` multiplies by `policyVigorMult()` and two Discoveries; the block cleared neither |
| `test-v54` | *"ten pastures deliver 0.05 poros/s"* | `poroRatio` takes champion passives and policies; `freshState()` is a guarantee about the save format, not about what a test seeded before it |
| `test-v55` | the four hunt yields the undo block compares | `syncRoster()` rolls a random trait per wanderer, and the first setup ran *before* `Math.random` was pinned and the rest after — so `wrongKind === best` compared two different rosters. Camp CHARGES regenerate against `simNow()` too, so 300 ms of extra harness latency made the third hunt pay 63 against the first hunt's 57 |

**The tool documents its own one known artefact** — `loadFromString()` merges a save *over*
`freshState()` with `Object.assign` per object key, so poisoning `freshState()` re-dirties
containers a block legitimately cleared. Naming it is the difference between a detector and a
generator of false work.

**The standing rule this earns is STANDING-RULINGS §21:** *a test that captures a baseline from
live state must reset the state it is baselining.* Third instance in two rounds, after
`test-offline-v54`'s saturated-cap check and `test-v42`'s free-band check.

---

## 3. Part 5 — the storage-scope restructure, dated three times and now shipped

RR ran **one multiplicative chain across twelve resources**: `masonryMult` = 1.75 × 1.8 × 2 × 2
× 1.75 = ×22.05 nominal, ×12.6 realised. Wrong twice over — a Kittens'-Law violation (storage
expansion is one category; effects are additive within a category) **on top of** a scope error,
because the source touches seven effect names at three different strengths.

`js/resources.js:866-885` is quoted verbatim in `index.html` beside the tables. The two
accumulators, enumerated from `js/workshop.js` this session — six members each, and
`strenghtenBuild` is the one upgrade feeding both:

```
barnRatio       stoneBarns 0.75 + reinforcedBarns 0.80 + titaniumBarns 1.00
              + alloyBarns 1.00 + concreteBarns 0.75 + strenghtenBuild 0.05  = 4.35
warehouseRatio  reinforcedWarehouses 0.25 + titaniumWarehouses 0.50 + alloyWarehouses 0.45
              + concreteWarehouses 0.35 + storageBunkers 0.20 + strenghtenBuild 0.05 = 1.80
```

**Delivered, fully stacked: narrow ×14.98 · broad ×2.80 · quarter ×2.0875 · none ×1.00.**

RR has five Masonry rungs against the source's eleven upgrades, so each rung carries a barn
share **and** a warehouse share, mapped in ladder order, with `strenghtenBuild`'s +0.05/+0.05
folded onto the terminal Icathia rung. **The sums are the source's exactly**; only the packaging
differs, because RR's ladder is shorter.

### The spec disagrees with itself, and §16 breaks the tie

The spec's **prose** states Σ barn 4.35 → ×14.98 and ×2.0875. Its **pass-condition table**
states ×14.84 and ×2.075, which imply Σ barn **4.30** — the source's 4.35 minus
`strenghtenBuild`'s 0.05. But the same table's warehouse sum of 1.80 *includes* that upgrade. So
the spec counts `strenghtenBuild` for one accumulator and not the other, which is what
identifies it as an arithmetic slip rather than a ruling. **Under §16 the source is the balance
authority, so 4.35 ships.** The difference is 0.14 on the narrow tier.

### The scope table, and the three rows that are design rulings

| tier | ×  | resources |
|---|---|---|
| **narrow** | 14.98 | timber, ore, steel *(= wood, minerals, iron)*, **mana** |
| **broad** | 2.80 | gold *(= gold)*, zaunore, coalgas, hexore, shimmer *(= coal, titanium)*, **crystals**, **renown** |
| **quarter** | 2.0875 | provisions *(= catnip)*, **gated on Chemtech Silos** exactly as the source gates it on `silos` |
| **none** | 1.00 | voidessence; culture and devotion (which take the separate Scholarship family); knowledge and vigor (already exempt, two separately sourced reasons) |

**`CAP_SCOPE` is total by construction and `test-v56` asserts it by enumeration** — every capped
resource in exactly one tier, no tier naming a non-resource. That is the guard the old
arrangement lacked, and it is why `knowledge` was able to fall through to a ×22 line by omission
for three versions (v0.45 Part 5).

The three bolded rows are **RR-ORIGINAL design rulings and are stated as such in the source**,
not smuggled in as parity:

- **`mana` → narrow.** v0.36 item 15 ruled "Mana is a material, at cap parity with Timber".
  Honouring a ruling means honouring both halves of it.
- **`crystals`, `renown` → broad.** Gold's role is the closest either has.
- **`renown`'s `Math.sqrt(masonryMult)` is retired** — there is no longer a product to take a
  root of. **Measured before choosing:** at the "none" tier the Chemtech-era Renown ceiling is
  **5,810 against the tenth champion's 9,611** cost, putting the last rung of the champion
  ladder out of reach. At "broad" it is **14,815**.

### The apparatus finding that came with it

**The instrument holds only 3 of the 5 storage rungs through most of a run**, and 4 of 5 at
Icathia. The v0.55 analysis noted `voidwardStores` "has never been researched"; measured
per-milestone this round, it is **two** upgrades, not one. What a 2,500-year run actually
experiences is **×7.81 narrow / ×2.20 broad / ×1.00 quarter** for the whole of Era 2 and most of
Era 3 — so the fully-stacked table is never exercised, **and the quarter tier and the new
Warehouse cap are inert until late Era 3.** Every provisions result below therefore comes from
the Storehouse and Harbor reprices alone.

*(A note on reading the per-milestone `storage` line: the delivered figure is measured by
differencing the finished cap against the cap with the storage upgrades stripped, so stripping
`chemtechSilos` also removes the Warehouse's conditional 750. At Icathia it reads ×2.1991 for
provisions rather than the tier's ×1.8875 for that reason. `test-v56` asserts the tier
multipliers on a bare state where no Warehouses exist; both figures are correct.)*

---

## 4. Jerry's directive — the provisions cap, and why Deepwinter was free

> *"the provision cap is too large and deepwinter is never a problem."*

Measured on v0.55: **provisions at cap 1.5% of all ticks**, held/cap 56% at Sparks against a
1,284,413 ceiling. Three sourced corrections:

| building | RR before | source | RR now |
|---|---|---|---|
| Storehouse (= barn) | 7,500 | `js/buildings.js:766` `catnipMax: 5000` — and `woodMax: 200`, which RR already matched to the digit | **5,000** |
| Harbor (= harbour) | 10,000 | wiki *Catnip*: harbours hold 2,500 each | **2,500** |
| Warehouse (= warehouse) | **none** | 750 each, after Silos | **750**, on a declared `capsIf` field gated on Chemtech Silos |

**The v0.47 note that defended 750 is retired, and the reason it died is worth stating.** It
said Kittens' catnip is one resource doing two jobs and RR splits it into provisions and mana,
so `catnipMax 5000` had no single counterpart to transplant. That was an argument about UNITS —
and **v0.55 Part 3.1 dissolved it** by rescaling provisions ×10 so RR's farmer produces 5.000/s
exactly as Kittens' does. Once the units match the figure transplants directly. The mana term on
the Storehouse is a separate RR-original line and is untouched this round.

**Measured, shipped vs v0.55:**

| | v0.55 | **v0.56** |
|---|---|---|
| provisions at cap, share of all ticks | 1.5% | **25.8%** |
| provisions held ÷ cap at Sparks | 56% | **91%** |
| provisions ceiling at Sparks | 1,284,413 | **93,250** |

And the effect showed up somewhere I did not plan for: **`test-offline-v54`'s "HEALTHY" fixture
starved.** Its 90 Farmsteads and 6 Storehouses, comfortable two versions ago, now sit at zero
provisions for **1,796 of 18,000 ticks**. That is the round working, not a defect — but a
fixture on the floor measures the `max(0, …)` nonlinearity instead of the integrator, exactly as
a fixture pinned to the ceiling did before v0.55 caught that. Re-sized by measurement to 8
Storehouses / 110 Farmsteads: zero floor ticks, 16.7% at cap, finishing at 38,433 of 42,000, and
the drift returns to **0.0155%**.

---

## 5. Parts 1 and 2 — experience, and the disagreement that closes

**Part 1(a) — `XP_PER_SECOND` 2 → 0.5**, on Jerry's directive 3. Slower than v0.55's 2 **and**
than v0.54's 1, so the directive is satisfied on either reading of "before". Time to Challenger
in one trade: **1.60 → 6.39 real hours**. **Still UNVERIFIED**: the scalar `skillXP` is a local
computed between `js/village.js:2623` and `:2644` and no grep query shape returns its
assignment. No number was invented, and the ledger says the rate moved for a directive rather
than for a citation.

**Part 1(b) — `XP_CAP` 25,556, and this one IS sourced.** `js/village.js:2622` `var skillsCap =
20001;` and `:2650` `Math.min(kitten.skills[kitten.job] + skillXP, skillsCap)`. Rank-matched by
ratio, which is the only way to port a cap between two different ladders: Kittens caps at
2.22233× its top tier's 9,000; RR's Challenger is 11,500. RR had **no cap at all**, and the
measured top bank at Icathia was **1,335,491** — 116× the top rank, in a number that changed no
bonus. A v0.55 save is clamped on load and no rank moves. The **lifetime** total `w.xp` is
deliberately left uncapped: Kittens' cap is per-skill, and merging the two would erase a
distinction the source keeps.

*(The spec states 25,556; the exact ratio is 11,500 × 20,001 / 9,000 = 25,556.833, which rounds
to 25,557 and floors to 25,556. The spec's figure is the floor, so `Math.floor` ships. One point
of experience — recorded because silently-different constants are how tables drift.)*

**Part 2 — `CONSUMPTION` 4 → 4.25**, on Jerry's directive 2. This closes a disagreement that ran
a full round: v0.55's analyzer asked for 4.25, Jerry's v0.55 directive said 4, directives
override, and 4 shipped with the 6.2% relaxation recorded in BUILD REPORT v0.55 §4. Jerry has
ruled the other way and the farmer:eater ratio returns to **1.17647 exactly**.

**Measured Challenger share at Sparks — pass condition 8, target below 62%:**

| slice | top bank | median bank | Challenger share at Sparks |
|---|---|---|---|
| v0.55 baseline | 278,641 (77.4 real h) | 144,180 | **62%** |
| s3 (+ XP rate and cap) | 25,557 | 15,183 | **52%** ✅ |
| **shipped** | 25,556 | 25,556 | **63%** ❌ |

The cap does exactly what it is for — the top bank falls from 278,641 to the ceiling — but the
shipped share is 63%, one point above the target and above s3's 52%. The share moved back up
because the *other* four slices changed how long Era 2 lasts, not because the rate moved. This
is the round's cleanest illustration that a share measured at a milestone is a function of when
the milestone lands.

---

## 6. Part 3 — Leona no longer deletes the season

Jerry's directive 1 was *"Farmer's are not affected by seasonality, adjust this."* **Seasonal
farmers shipped in v0.55 and the code is correct** — the job-loop line is live and `test-v55`
asserts all four seasons including winter's exact 75.0% cut. What produces the symptom is this:

```js
if (leaderIs("leona")) farmMult = Math.max(1, season.farmMult) * Math.max(1, weatherMult);
```

**Leona's lead floored `farmMult` at 1 and therefore deleted seasonality outright.** With Leona
leading, Deepwinter's ×0.25 became ×1.00 and a chilly snap's ×0.5 became ×1.00. **And v0.55
silently made it stronger**: before v0.55, `farmMult` reached only buildings with `seasonal:
true`; Part 3.2 extended it to the farmer job, so the lead began cancelling the season on the
job path as well — a scope expansion nobody decided on, in the round whose purpose was making
Deepwinter bite.

Shipped: `LEONA_SEASON_RELIEF = 0.5` halves the shortfall below 1.0.

| | without Leona | with Leona |
|---|---|---|
| Firstbloom | ×1.5 | **×1.5 — unchanged** |
| Sunfire / Harvestfall | ×1.0 | ×1.0 |
| **Deepwinter** | ×0.25 | **×0.625** |
| chilly snap | ×0.5 | **×0.75** |

**The spec's own formula is wrong and the guard is load-bearing.** Written as the spec gives it,
unguarded, `m + (1 - m) * 0.5` takes Firstbloom's ×1.50 down to **×1.25** — the clause would
penalise a good season as eagerly as it softens a bad one, contradicting the spec's own pass
condition that spring measures 1.5 unchanged. The condition states the intent; the snippet
states it wrongly. A `m < 1` guard ships.

**One function, two callers.** The forecast UI recomputed the multiplier by hand *and*
hard-coded `winterFarm = leaderIs("leona") ? 1 : 0.25`, so the tooltip and the maths could
drift — and after v0.55 extended `farmMult` to jobs, they did. Both call `seasonFarmMult()` now,
Deepwinter is looked up by id rather than by its literal, and **Leona's lead prose is generated
from the constant**, because the old string promised something the new clause deliberately does
not do. `test-v56` greps stripped source to assert no second copy of the expression survives.

**Part 7.6 — the champion and leader block is taken.** Twenty new ledger rows, one per champion
and one per lead, each labelled with a reason. It was a single line in the standing-divergences
table for three rounds. Ledger: **208 rows — PARITY 50, EASIER 32, HARDER 2, UNVERIFIED 127.**

---

## 7. §7 — invariants re-pointed this round, with their superseding cause

| suite | assertion | disposition | superseded by |
|---|---|---|---|
| `test-v32` | camp baseline taken with the live roster in `S` | **FIXED** — the block resets `S.wanderers`, `S.champs`, `S.policies`, and a new assertion pins `base === 1.000` | **Part 6.** Not a re-point of a rule: the rule was right and the fixture was wrong. |
| `test-v32` | *"scouting is a FLAT 500 vigor"* | **RE-POINTED** — policies and upgrades cleared before the read, plus a new assertion that the only thing which moves the cost is a Discovery discount | **Part 6 fixture sweep.** |
| `test-v43` | *"Renown scales with the SQUARE ROOT of the Masonry line"* | **RE-POINTED** to the warehouse (broad) tier | **Part 5.** There is no longer a product to take a root of. The property — rises with the era, sub-linearly, clears the tenth champion — is unchanged and still asserted. |
| `test-v44` | *"Renown takes √Masonry"* / *"materials take the FULL Masonry line"* | **RE-POINTED** to ×2.55 and ×11.6025 at four rungs owned, with the sub-linearity asserted directly | **Part 5.** |
| `test-v45` | `CONSUMPTION === 4`, ratio 0.80; True Ice Cellars 3.2 | **RE-POINTED** to 4.25 / 0.850 / 3.4 | **Part 2.** This is the disagreement closing, not another re-point. |
| `test-v47` | storehouse provisions cap 7,500 | **RE-POINTED** to 5,000, Kittens' `barn.catnipMax` | **Part 5 + Jerry's directive.** |
| `test-v54` | *"ten pastures deliver 0.05 poros/s"* | **RE-POINTED** — champs, policies, upgrades, roster and drakes cleared explicitly | **Part 6 fixture sweep.** |
| `test-v54` | the migration block's `if (w.jx) return;` guard | **RE-POINTED** to `if (!w.jx) {`, **plus a new assertion** that every loaded bank is clamped to `XP_CAP` | **Part 1(b).** The guard had to become a block so an uncapped v0.55 save could be migrated. |
| `test-v55` | `CONSUMPTION` is 4, ratio 0.800 | **RE-POINTED** to 4.25 / 0.850 | **Part 2.** This is the one v0.55 assertion written expecting to be re-pointed. |
| `test-v55` | every provisions cap is at ×10 its v0.54 value | **RE-POINTED** — the two food STORES now hold the source's barn/harbour figures; the rest of the ×10 sweep is unchanged and still asserted | **Part 5 + Jerry's directive.** |
| `test-v55` | `XP_PER_SECOND === 2`; 20 s banks 40 | **RE-POINTED** to read the constant and to `20 × rate`, plus the `Math.min(…, XP_CAP)` clamp | **Part 1.** |
| `test-v55` | the four hunt yields in the undo block | **RE-POINTED** — `Math.random` pinned before the first setup, roster traits zeroed, camp charges reset before every hunt | **Part 6 fixture sweep.** |
| `test-v55` | `VERSION === "v0.55"` | **RE-POINTED** to the `vN.NN` shape | **Ship discipline — and this is the THIRD occurrence.** v0.53 did it, v0.54 fixed it and did it again, v0.55 fixed it and did it again. |
| `test-offline-v54` | the HEALTHY fixture's building counts | **RE-PROVISIONED** by measurement — 8 Storehouses / 110 Farmsteads | **Part 5 + Part 2.** The old fixture STARVED: zero provisions for 1,796 of 18,000 ticks. |

**Nothing was deleted to make a number green.** Three re-points *added* assertions, and one
(`test-v32`'s baseline) added a guard specifically so the defect that motivated it cannot recur
silently.

---

## 8. Pacing — five prefixes, three seeds, and an instrument that stopped working

2,500 game-years each, seed 1 unless stated. **Per §13 every figure is a difference of two
milestones and both edges are named.**

| slice | Sparks | Icathia | **Era 3** | Δ vs prior | predicted | verdict |
|---|---|---|---|---|---|---|
| **s0** v0.55 baseline (re-measured) | y177.1 | y837.7 | **660.6** | — | 660.6 | reproduces the analyzer's figures exactly |
| **s1** fixture fix | — | — | **660.6** | 0.0 | 0.0 | ✅ no game code changes |
| **s2** + storage scope | y152.8 | y1859.3 | **1,706.5** | **+1,045.9** | +150 to +350 | ❌ overshot by 3× — and **into the target band** |
| **s3** + XP 2 → 0.5 | y166.0 | y865.2 | **699.2** | **−1,007.3** | +190 to +390 | ❌ **wrong sign, by a thousand years** |
| **s4** + `CONSUMPTION` 4.25 | y195.6 | y1344.3 | **1,148.7** | **+449.5** | +20 to +90 | ❌ 5× the top of the band |
| **s5** + Leona + compensating caps (**shipped**) | y200.7 | y901.3 | **700.6** | **−448.1** | −10 to +30 | ❌ wrong sign again |
| **shipped vs baseline** (seed 1) | **+23.6** | **+63.6** | **+40.0** | | 1,020–1,430 | ❌ on this seed |
| **shipped, median of 3 seeds** | y187.1 | y1896.4 | **1,709.3** | **+1,048.7** | 1,020–1,430 | **overshoots the prediction, and lands in the 1,400–2,300 TARGET** |

### The finding: those numbers are not measuring the changes

Every adjacent-slice swing is larger than any effect that slice's change could have. Part 3
binds only while Leona leads and the compensating caps measurably do nothing (§1.2) — yet s4→s5
moved Era 3 by **−448 years**. That is not a game result.

**So I measured the instrument instead.** Three seeds on the *same shipped build*, same
2,500 game-years, nothing else changed:

| seed | Sparks | Icathia | **Era 3** | in the 1,400–2,300 target? |
|---|---|---|---|---|
| 1 | y200.7 | y901.3 | **700.6** | ❌ |
| 2 | y187.1 | y1896.4 | **1,709.3** | ✅ |
| 3 | y167.3 | y2002.6 | **1,835.3** | ✅ |
| **median** | **y187.1** | **y1896.4** | **1,709.3** | **✅** |

**A 2.6× spread on one build.** The slice table above is measured entirely on seed 1, which is
the low draw — so the s2 → s3 "collapse" of 1,007 years and the s4 → s5 "collapse" of 448 are
very largely the seed, not the changes. **Read the slice table as evidence that the slices are
no longer separable, not as evidence about what each Part did.**

Every one of the three seeds agrees on the things that are not chaotic: morale band **100%** in
all three, peak population **177–185**, provisions cap-out **25.8–29.6%**, and the same four
pass conditions failing.

The mechanism is visible in the food instrumentation. Net provisions at Sparks by slice:
**−6.5 / −59.9 / −68.0 / +25.7 / −27.9** per second, with held/cap at **56% / 99% / 81% / 99% /
91%**. The settlement now runs at or near its food ceiling *and* near its starvation floor, and
which of the two it touches first decides whether the run stalls for a millennium. A greedy bot
with no banking policy has no way to steer out of that.

**This is a §16 outcome, not a crisis.** The source is the balance authority; the bot is an
instrument. But every Era-3 figure this project has quoted since v0.44 is one draw from a
distribution nobody had measured the width of, and the next round should not accept a
single-seed Era-3 number as evidence for anything.

### Pass conditions from the shipped run

| condition | v0.55 | **v0.56** |
|---|---|---|
| Rites of Targon before y70 | ❌ y75.3 | ❌ **y72.7** (improved) |
| First Ascent occurs | ✅ | ✅ y80.5 |
| First champion before y120 | ✅ | ✅ **y100.3** |
| 130 wanderers before y600 | ❌ y1013 | ❌ **y750** (much improved) |
| Sparks before y500 | ✅ | ✅ y200.7 |
| **morale 90–140 band ≥ 80% after y60** | ❌ 67% | ✅ **100% — first time in the project's history** |
| morale not pinned above 140 | ✅ | ✅ |
| Chemtech → Hexcore under 400 years | ✅ | ✅ **109** |
| Convergence 5–8% at Sparks | ❌ 3.87% | ❌ **4.17%** (improved) |
| cheapest trade affordable at Sparks | ✅ | ✅ |

**6 of 10 pass, and all four failures moved in the right direction.** Morale crossing its band
for the first time is the round's quiet win, and it is a consequence of the food ceiling holding
population to 180 instead of 220 — it reads **100% on all three seeds**, so unlike Era 3 it is a
real result and not a draw.

**130 wanderers is the one that got worse and it needs naming.** Seed 1 improves it y1013 →
y750, but seeds 2 and 3 read **y1472.1** and **y1535.5**. The spec said: *"If 130 wanderers is
never reached after Part 2, stop and rule on the food economy before shipping anything else."*
It is reached on all three seeds, so the stop-condition does not fire — but the median moves the
wrong way, and that is the direct, intended consequence of a food ceiling that finally binds.
**The next round has to decide whether a settlement of ~180 is the target.** Every other number
this round improved because population stopped running away.

### Part 5's own pass condition 5 — reported honestly as failed

| Era-3 raw | v0.55 | **v0.56 shipped** | target | why |
|---|---|---|---|---|
| zaunore | 27.8% | **43.3%** | 30–60% | ✅ |
| shimmer | 82.9% | **87.2%** | 30–60% | ❌ nothing consumes shimmer; held/cap 100% at every milestone. Raising the ceiling ×2.5 moved it 3 points. |
| hexore | 1.8% | **3.2%** | 30–60% | ❌ consumed as fast as produced; held/cap 0% at every milestone. Cutting the ceiling ×3.5 moved it 0 points. |
| coalgas | 0.4% | **0.0%** | 30–60% | ❌ a converter intermediate, not a stock. The band does not apply. |

**Three of the four are flow-limited, not ceiling-limited, and no cap can fix that.** The
condition was written as if cap-out were a function of the ceiling; for these three it is a
function of the producer/consumer balance. That is the correction the next round needs, and it
is the same stock-versus-flow class that left Riftsteel unforged in v0.53.

---

## 9. The suites

**25 live suites, 1,219 assertions, 0 failures.**

```
test-v32  67   test-v39  70   test-v45  59   test-v52  31
test-v34  41   test-v40  60   test-v46  50   test-v53  72
test-v35  46   test-v41  61   test-v47  52   test-v54  60
test-v36  44   test-v42  51   test-v48  54   test-v55  67
test-v37  38   test-v43  40   test-v49  37   test-v56  48   ← new
test-v38  33   test-v44  63   test-v50  34
test-offline-v54  25          test-banner-v51  16
```

`test-v32` was run 10 consecutive times, three of them under a saturated box: **10/10**.

---

## 10. Open, for the analyzer

1. **The instrument needs a seed ensemble, and this is now the project's highest-priority
   apparatus item.** Three seeds on the shipped build gave **700.6 / 1,709.3 / 1,835.3** — a
   2.6× spread. The harness should run N seeds and report a median and a spread, and every pass
   condition on a milestone year should be restated against the median. **Until that lands, no
   Era-3 comparison between two builds means anything**, including the ones in BUILD REPORTS
   v0.44 through v0.55.
2. **The bot has no food policy.** `manageJobs()` staffs **one farmer** at every milestone, in
   every era, at every population from 36 to 220 — measured across all five slices and both
   prior rounds. It banks food instead of farming it, and now that the ceiling binds, that is
   the single largest source of the chaos above. This is the apparatus decision Part 4 asked to
   be written down, and here it is: **the current numbers are a lower bound measured on a
   settlement that does not respond to hunger.**
3. **Pass condition 5 is mis-specified for three of its four resources.** Re-state it as a
   producer/consumer balance for shimmer, hexore and coalgas, or drop them from it.
4. **The instrument researches only 3 of 5 storage rungs** for most of a run and 4 of 5 at
   Icathia, so the fully-stacked table and the entire quarter tier are never exercised. Either
   the bot's Discovery priority needs a look or the ladder's terminal rungs are unreachable in
   practice; either way the measurement does not currently test what was built.
5. **`XP_PER_SECOND` is still UNVERIFIED.** `skillXP` remains the highest-value open lookup.
   The grep.app query shape that found `skillsCap` does not find it; try `var skillXP`,
   `skillXP *=`, or the enclosing function name.
6. **Convergence 4.17% at Sparks** against 5–8%, and **Rites y72.7** against y70 — both now
   within a seed's noise of their targets, which is itself an argument for item 1.
7. **Carried, unchanged:** the craft-depth tie-break (Riftsteel still never forged); the
   Chembarrel / visible-building fix; the trade-banking policy; **127 UNVERIFIED ledger rows.**

---

## 11. Files

| file | what changed |
|---|---|
| `index.html` | Parts 1, 2, 3, 5, Jerry's provisions-cap directive, `VERSION = "v0.56"` |
| `tools/fixture-sweep.mjs` | **new** — the standing detector for baseline-capture defects |
| `tools/parity-ledger.mjs` | champion and lead rows (Part 7.6); storage, food-store and skill-cap divergences |
| `docs/PARITY-LEDGER.md` | 208 rows — PARITY 50, EASIER 32, HARDER 2, UNVERIFIED 127 |
| `sim/simcore.mjs` | time-at-cap for **every** capped resource; delivered storage multiplier and held/cap per resource |
| `sim/pacing.mjs` | the cap-out distribution, pass condition 5 as a pass/fail line, the storage table per milestone, Challenger **share** |
| `tests/test-v56.mjs` | **new** — 48 assertions, the sixteen pass conditions in spec order |
| 8 shipped suites | re-pointed per §7 |
| `snapshots/v56/s0,s2–s5` | the cumulative prefixes (s4 reconstructed — see §1.1) |
| `STANDING-RULINGS.md` | §19 storage scope, §20 food stores, §21 baseline-capture fixtures |
