# BUILD REPORT v0.63 — the harshness was one rung, the gate still fails, and the cause is population

Built against the `v0.62` tag from `current-build-spec.md`, plus Jerry's dev note on the Automated
Workshop tooltip.

---

## 0. THE HEADLINE, FIRST, BECAUSE IT IS A FAILED GATE

**Pass condition 1 — "Icathia on ALL THREE seeds within 2,500 years" — FAILS. One seed of three.**

The spec made this the round's gate and instructed the builder to stop and report if Parts 1 and 2
did not restore it. **They did not.** What follows is the report the spec asked for, and the
diagnosis is not where the spec, the previous round, or I expected it.

| condition | v0.62 | **v0.63 (Parts 1+2)** | verdict |
|---|---|---|---|
| **Icathia on all three seeds** | 1 of 3 | **1 of 3** (seed 3 only, y1,835.2) | **FAIL** |
| Rites of Targon < 75 [median] | **76.0 FAIL** | **69.3** — 69.3 / 80.4 / 69.3 | **PASS** |
| First champion < 120 [max] | **129.6 FAIL** | **110.2** — 84.9 / 97.3 / 110.2 | **PASS** |
| Peak population 150–220 [median] | **135 FAIL** | **136** — 136 / 134 / 180 | **FAIL** |
| Sparks < 500 [max] | pass | 195.7 worst — 193.2 / 195.7 / 193.9 | PASS |
| First Ascent occurs [all-seeds] | pass | 75 / 86.3 / 77.1 | PASS |
| morale 90–140 ≥ 80% after y60 | pass | 100 / 100 / 100 | PASS |
| morale not pinned above 140 | pass | 0 / 0 / 0 | PASS |
| Chemtech → Hexcore < 400 [max] | pass | 117.4 worst — 117.4 / 101.8 / 75.5 | PASS |
| Convergence at unlock ≥ 1% [median] | pass | 13.374 — 13.464 / 12.901 / 13.374 | PASS |
| cheapest trade affordable at Sparks | pass | true / true / true | PASS |

**v0.62 failed four of ten. This build fails one of ten — and the gate.** Three of the four gates
v0.62 broke are fixed and two of them by wide margins. The fourth is not, and it is the one that
decides completion.

### 0.1 The diagnosis, in one line of the ensemble output

> **peak population — 136 / 134 / 180.**
> **The one seed that reaches Icathia is the one seed inside §27's band. The two that do not are
> at 136 and 134, below it.**

Every other figure is tight across the three seeds — Sparks spreads ×1.01, Chemtech ×1.03, Rites
×1.16. **Population spreads ×1.34 and it is the only variable that sorts the seeds the way
completion does.** `pop130` has a median of **1,735.8 game-years**: the settlement spends seven
tenths of the run getting to 130 people.

**So the spec's central prediction is falsified, and it is worth saying exactly which part.** The
spec wrote:

> "I predict Parts 1 and 2 alone restore it, because the discovery cap removes 48,000 knowledge
> from the early ladder and the Storehouse steel line removes a ceiling constraint from the
> cheapest storage building in the game."

**The first clause is right about knowledge and wrong about completion.** The cap removed 47,959
knowledge from the early ladder — the arithmetic is exact, §1 below — and the two gates that
measure the early knowledge ladder both cleared. **Completion was never gated on knowledge.** What
stands between `deepWorks` and `icathia` is a settlement large enough to work Era 3, and RR is not
building one: peak population went 179 (v0.61) → 135 (v0.62) → **136 (v0.63)**, and the five
changes v0.62's handoff blamed for the collapse are all still in place. Parts 1 and 2 relieved a
constraint that was not binding on the thing being measured.

**This is STANDING-RULINGS §13 in a new shape.** §13 says any proposal aimed at Era 3 must state
which edge it moves. The sibling rule this round earns: **a proposal aimed at COMPLETION must state
which constraint it relieves, and demonstrate that constraint is the binding one.** Nobody checked
that knowledge was binding; it was the constraint the previous round had most recently touched.

---

## 1. Part 1 — the divisor is right and the DISTRIBUTION was wrong

### 1.1 The source, re-measured from a fresh clone

The spec's Part 1 asks the builder to keep `DISCOVERY_KNOWLEDGE_DIVISOR` at 1.25 and cap the
per-rung burden at Kittens' own 2.43×. **I re-ran the census rather than taking it, and it mostly
reproduces.** `tools/kittens-upgrade-census.mjs` joins `js/workshop.js` against `js/science.js` at
`c52985b`:

| | spec | **my re-run** |
|---|---|---|
| workshop upgrades with a price list | 171 | **143** |
| carrying a science cost | 139 — 81% | **133 — 93%** |
| per-upgrade science ÷ its rung, median | 0.90 | **0.882** (mean 0.892) |
| upgrades per tech, median | 3 | **3** |
| **total upgrade science per rung** | **median 2.43×** | **median 2.07×, mean 2.41×, max 6.25×** |
| whole game: upgrade science ÷ tech science | 0.50 | **0.470** |

Jerry's four named examples reproduce exactly: `rotaryKiln` 145,000 on `robotics` 140,000 = ×1.04;
`factoryRobotics` ×0.71; `offsetPress` 100,000 on `combustion` 115,000 = ×0.87; `petri` 65,000 on
`biology` 85,000 = ×0.76.

**The headline conclusion survives and is the important part: "almost as much knowledge as the
research itself" is exactly what the source does, per upgrade, and RR's 0.80 is at parity with it.
v0.62's own proposal to halve the divisor to 0.4 × K would have moved AWAY from the source in a
project whose charter is parity (§16).** The divisor does not move.

### 1.2 DISAGREEMENT, RECORDED — 2.43 is the source's MEAN, not its median

**2.43 ships exactly as specified, per project practice, and here is the measurement I disagree
with it on.** My re-run puts the source's per-rung figure at **median 2.07 and mean 2.41**, so
2.43 is the mean to two significant figures and not the median the spec calls it. Three
consequences the next round should have:

1. **45% of the source's own rungs sit ABOVE 2.43×**, and its maximum is **6.25×** — which is
   *above* RR's worst offender at 5.73×. **So `ritesOfTargon` at 5.73× was not, on its own,
   unsourced.** A cap at the source's median (2.07) would be the stricter and more defensible
   reading; a cap at 2.43 is a mean-shaped ceiling on a right-skewed distribution.
2. **The cap is therefore justified by CONCENTRATION, not by 5.73× being out of range** — one
   rung carrying 48% of the entire game's discovery knowledge is the defect, and no census figure
   is needed to see it.
3. The difference is small in practice: at 2.07 the total would be ~86,000 rather than 94,451.
   **It was not worth substituting a number the spec had chosen and stated its reasoning for.**

### 1.3 What shipped, and what it moved

`DISCOVERY_RUNG_CAP = 2.43`, applied by a load-time IIFE **after** the generator, reading the
mutated `UPGRADES` array. Five rungs exceeded it; each scales down proportionally.

| tech | rung | before | ×rung | **after** | **×rung** |
|---|---|---|---|---|---|
| **`ritesOfTargon`** | 12,000 | **68,800** | **5.73×** | **29,157** | **2.43×** |
| `hextech` | 2,200 | 8,280 | 3.76× | 5,344 | 2.43× |
| `songcraft` | 1,300 | 4,420 | 3.40× | 3,158 | 2.43× |
| `drakeLore` | 3,600 | 12,000 | 3.33× | 8,748 | 2.43× |
| `trade` | 1,200 | 3,780 | 3.15× | 2,914 | 2.43× |
| *(nine others)* | | | ≤ 2.05× | | **untouched** |

**Total 142,410 → 94,451, −33.7%. `ritesOfTargon` −57.6%.** Whole-game discovery ÷ tech knowledge
**0.099 → 0.0655**, against the source's 0.470 — **RR is at a seventh of the source's discovery
burden and this Part made that gap wider, deliberately.** The volume was never the problem.

**Three implementation decisions worth recording:**

- **FLOOR, not round.** Rounding put `trade` at 2,917 against its own 2,916 ceiling — one over.
  A cap that fails its own pass condition by one is worse than a cap a hair under.
- **The cap scales AUTHORED figures too, and it must.** `greatLibrary`'s hand-authored 40,000 was
  58% of the 68,800 that made `ritesOfTargon` the offender. The objection is to a *rung's total*
  and an authored figure is as much a part of that total as a generated one; exempting it would
  have meant scaling the two generated leaves to near zero to hit the same ceiling. **The
  GENERATOR still leaves authored costs alone** — `if (u.cost.knowledge === undefined)` is
  untouched — and `beastLore` is the control: `abyss` sits at 2.05×, under the cap, so its
  authored 2,500 is unmoved. That is what demonstrates the cap and not the generator moved the
  others.
- **A rung at or under the cap is left EXACTLY alone** (`if (sum <= ceiling) return;`). This is the
  whole argument against halving the divisor: halving would have cut the nine compliant rungs as
  hard as the five offenders.

### 1.4 Measured effect — pass conditions 4 and 5

**Rites of Targon: 76.0 → 69.3 median (69.3 / 80.4 / 69.3), target < 75. PASS.** This is the gate
the Part exists to relieve and it clears by 5.7 years on the median. Seed 2 is over at 80.4 and
the condition's declared shape is `median`, so it passes as declared — recorded rather than
smoothed.

**Attributed on a single seed at 150 game-years, against the v0.62 tag run identically:**

| | v0.62 baseline | Parts 1+2 | Δ |
|---|---|---|---|
| Rites of Targon | 77.7 | **69.3** | **−8.4** |
| voidStudies | 75.5 | **67.0** | −8.5 |
| First Ascent | 81.5 | **75.0** | −6.5 |
| First champion | 131.9 | **84.9** | **−47.0** |

**Part 2 contributes ZERO to all four of these** — the Part 1 and Part 2 cumulative-prefix
snapshots return byte-identical milestone figures at 150 years. The steel ceiling does not bind in
the first 150 game-years, which is unsurprising and is stated rather than left implied.

---

## 2. Part 2 — steel is iron, and the last inversion goes

Dev note 11 settles the one figure v0.62 could not derive. Verified from a fresh clone:
`js/buildings.js:781` barn **`ironMax: 50`**, `:847` warehouse **`ironMax: 25`**, `:929` harbor
**`ironMax: 150`**.

| | Kittens iron | RR steel before | **shipped** |
|---|---|---|---|
| barn / **Storehouse** | 50 | **absent** | **50 — a new line** |
| warehouse / **Warehouse** | 25 (0.50 × barn) | **100** | **25** |
| harbor / **Harbor** | 150 | 150 | **150 — asserted unchanged** |

**v0.62's argument for keeping steel at 100 was wrong and it is worth saying which half.** That
round reasoned that the source's warehouse WINS on the late metal (titanium ×5.00) and that steel
is RR's late metal. **The first half is true; the second is role-guessing.** Jerry's mapping puts
steel on iron, which the warehouse loses on at ×0.50 exactly like coal and gold. At 100 against
the Storehouse's new 50 the Warehouse was at **4× the source's relationship to the barn** — the
last surviving inversion after v0.62 fixed timber, ore and gold. **The v0.62 note is corrected in
place rather than deleted**, because the retracted reasoning is what makes the retraction legible.

**Every one of the barn's six shared materials is now matched value for value.**

### 2.1 Pass condition 8 — the steel ceiling before and after

**The instrument had to be built first.** The milestone snapshot carried `heldOverCap` — a
*fraction* — and a fraction cannot answer "report the ceiling before and after": a ceiling that
doubles while the stock doubles reads identically at 100%/100%. `sim/simcore.mjs` now emits
absolute `cap` and `held` per resource plus the three store counts, and `pacing.mjs` prints them.

Measured across the ensemble, steel spends the run far from its ceiling at every milestone on all
three seeds — it is not a binding constraint before or after. **The Storehouse line's value is
that it is the one storage change in three rounds that goes the RELIEVING direction**, and the
Warehouse cut is a real reduction that the Storehouse line partly offsets rather than compounds.
Neither moved a milestone.

---

## 3. Part 3 — the four philosophies

All three descriptions are **generated** from their constants. This group now carries five
magnitudes across three options and would have been the next tooltip to drift after Jarvan's.

| | shipped | note |
|---|---|---|
| **3.1** Piltover Concord | craft yields **+8%** (unchanged) **and crafting costs −3.5%** | on the **PRICE**, `policyCraftCostMult()` inside `craftCostMult()` |
| **3.2** Demacian Accord | village-group +6% → **timber and ore +8.5%** | a RESOURCE scope, landing in `policyBoost()` |
| **3.3** Noxian Doctrine | renown **1.5 → 1.33**, plus **+7.5% camp yield** | additive into the existing camp category |
| **3.4** all three | culture 5,000 → **10,000** | material components stay |

**3.1 — the cut is on the price and NOT a second yield term**, and the reason is not tidiness.
A yield term multiplies output; a cost cut lowers the input and therefore also raises how many
crafts a given stock buys. Folding it into `policyMult("craft")` would have made the tooltip's
"+8%" false in the other direction and would have compounded with itself inside `test-v41`'s
timber → Demacia → steel → Piltover → mana → transmute → timber loop guard, the one circuit in
the file that must stay under gain 1. On the price it enters that guard once. `test-v41` passes
unchanged, 62 assertions.

**The tooltip states the RESOLVED PAIR**, because a cost cut and a yield rise compound and a
player should not have to multiply two numbers off a tooltip: *"Craft yields +8% and crafting
costs 3.5% less — together, 11.9% more output per unit of input."*

**3.2 — the scope changed, and the delivery asymmetry is stated rather than assumed.** The retired
effect was a building-GROUP multiplier on the Village group's whole output; dev note 3 asks for
timber and ore *production*, which is resource-keyed. It lands in the `boosts` accumulator and
reaches every source of those two resources — jobs, buildings, converters. **Neither `timber` nor
`ore` is a `BOOST_LIMIT` family, so the +8.5% is DELIVERED IN FULL, 0% discarded**, against four
families in `BOOST_MEMBERS` that discard between 14% and 82% of theirs. Part 7 exists to stop a
reader assuming symmetry there.

**3.3 — and this is the one the spec predicted I would report as a problem.** The spec:

> "I predict Part 3.3's renown cut pushes first champion past 130. If it does, the +7.5% hunt
> yield is not enough compensation and the doctrine's two halves should be sized together."

**Measured on the Parts 1+2 build BEFORE 3.3: first champion 84.9 / 97.3 / 110.2, worst 110.2
against a < 120 condition.** The margin is 9.8 years at the worst seed. The +7.5% camp yield is
additive into the same category the five hunt Discoveries and Open Range sit in, so it passes
through `limitedDR(_, CAMP_YIELD_LIMIT = 6)` like every other member and its *delivered* value at
a full stack is well under its nominal 7.5% — measured `campYieldMult` 1.000 → 1.075 on a bare
state, and much less than that on a stacked one. **The final ensemble's first-champion figure is
in §11; if it crosses 120 the spec's own instruction is that the two halves should be sized
together, and this report says so rather than shipping a silent gate failure.**

**3.4 — the combined knowledge burden, which the spec asked to be carried rather than split.**
`piltoverConcord` still asks `knowledge: 3000`, and that now sits on the same resource as Part 1's
discovery costs. Against Part 1's post-cap total of 94,451 across the whole game, a single 3,000
policy component is 3.2% — and the policy is gated on `callToArms`, deep past the five rungs the
cap relieved. **The two do not interact meaningfully and the arithmetic is here so that claim is
checkable rather than asserted.**

---

## 4. Part 4 — the third literal-drift defect, and the guard that retires the class

`index.html` shipped `lead: "Demacian Standard — every worker in the village produces 12% more"`
against a shipped `JARVAN_VILLAGE_LEAD = 0.06`. **The tooltip said 12%, the game paid 6%** — and
it was wrong about SCOPE in the other direction at the same time, because v0.62 Part 6a.1 widened
the lead from three jobs to all eight while "in the village" stayed put.

Generated now, from the constant, with all-job wording: *"Demacian Standard — every worker in the
settlement, in every job, produces 6% more."* The constant is **hoisted above `var CHAMPS`** for
operational rule 11.

**The class is retired with a guard, because this is the third instance in three rounds** —
v0.59's renown tooltips, v0.61's `petriciteResonators`, this. `test-v63` builds an authorised pool
from every champion/leader constant declared in the source plus every `passive.base`, and fails if
any champion `lead` or `passive.desc` carries a percentage no constant produces. **19 percentages
across 10 champions, all anchored.** It is **demonstrated to fail on a planted literal** (a
planted 37.3% is rejected and the real string restored), because a guard nobody has seen fail is a
guard nobody knows works.

**And it immediately found a fourth latent instance:** Heimerdinger's `craftCostMult()` read a
bare `0.85` with an authored "15%" beside it — the identical shape, one champion over. Named
`HEIMER_CRAFT_COST`.

---

## 5. Part 5 — three banners, one of which was never missing

### 5.1 The Targon halo is a VISIBILITY bug and the alpha was never the cause

**Do not add a halo — there is one, and it has rendered every frame since v0.62.** The spec's
diagnosis is exactly right and the geometry confirms it: the golden peak is
`pixTriangle(cx, groundY - 16, 30, 10, PAL.goldBright)` — base half-width **15**, **apex at
`groundY - 26`** — and the halo was centred at `(cx, groundY - 26)`, the apex exactly, at
`outer: 9`, **in `PAL.goldBright`, the peak's own colour.** A gold ring of radius 9 centred on the
apex of a gold triangle of half-width 15 is inside the silhouette for its lower half and
identically coloured for the rest.

**Separated on all three axes the spec offers, not the two it asks for:**

| | before | after |
|---|---|---|
| colour | `PAL.goldBright` #F0E6D2 pale cream | **`PAL.gold` #C89B3C saturated gold** |
| outer radius | 9 — **inside** the peak's half-width of 15 | **16 — outside it** |
| alpha floor | 0.35 | **0.45** |

**The `f * 0.17` rate is unchanged**, deliberately: v0.62's note beside it is still live — the
light shaft below pulses on `f * 0.3` and a halo on the same rate strobes with it.

**Asserted from the RENDERED CANVAS**, per pass condition 17 and v0.61 §3. The test classifies
each pixel in the summit column as peak-cream or halo-gold and measures horizontal reach: the halo
reaches **±16px against the peak's ±11px**, in a different colour. The scan is scoped to the
summit column deliberately — the crescent at (212, 26) is `PAL.goldBright` too, and a whole-canvas
"near-white" scan reports the peak as reaching ±108px. *Check the instrument before reasoning from
it (§8).*

The crescent and the deleted square are both asserted untouched. Both instructions are Jerry's.

### 5.2 Insight — size and count before alpha

Six motes at `1.5 × scale` on `0.30 + 0.30|sin|`. At `scale` 1 that is a 2px square, and **a 2px
square at 30% alpha does not become prominent when you raise the alpha — it becomes a slightly
brighter smudge.** Alpha raises luminance; size and count raise legibility, and "should be more
prominent" is a legibility complaint.

**Shipped: 9 motes at `2.25 × scale`, alpha floor 0.45.** Count +50%, per-mote area ×2.25, **total
lit area ×3.4**, dimmest frame half again as bright. The three new anchors are the shelf midpoints,
derived from the function's own geometry like the first six — the motes had clustered at the top
and bottom of each shelf with a gap through the middle, which is where the eye rests.

Canvas read: **0 px → 94 px held → 0 px lapsed.**

### 5.3 Cinders — the rectangles are deleted, not dimmed

What shipped at v0.62 was `px(cx-12, groundY-10, 24, 8)` and `px(cx+1, groundY+hy-6, 13, 9)` — **two
filled rectangles**, 24×8 and 13×9, in `CINDER_GLOW` at alpha 0.10–0.22. At this resolution a
translucent rectangle reads as a **block**, which is what "looks weird" means. **v0.62's note
beside them ("FAINT MEANS FAINT") was solving the wrong problem: the objection is to the SHAPE and
no alpha fixes a shape.** A low-alpha glow left underneath the embers would be the same weirdness,
quieter.

**Ten embers on per-ember phases** (`wrap(f * 0.5 + e * 2.3, 24) / 24` — a stride that shares no
period with the hammer's six-frame swing), from **two sources**: the forge bed, and the hammer
head, which *moves* with the swing. Odd-indexed embers take the hammer, so half the field tracks
the animation and half does not. Alpha is `0.85 · sin(πt)`, zero at both ends, so an ember appears
from nothing and dies out rather than popping. **Drawn AFTER the anvil and hammer** so they float
in front — the rectangles were drawn before and were partly occluded by the thing they were
supposed to be lighting.

Canvas read: **0 px → 7 px held → 0 px lapsed.**

---

## 6. Part 6 — the box event rate, and the ceiling that was missing

`if (S.jackboxes > 0 && Math.random() < probOver(S.jackboxes * 0.0002, ticks)) fireMischief();`

**Linear in the box count, with nothing capping it, on a building whose copies are permanent.** At
20 boxes that is one event every 50 seconds — roughly 16 game-days — and every one writes a
chronicle line. At 40 it doubles again.

**The spam is the symptom; the unbounded rate is the defect, and the same building already had the
fix.** Its MORALE term is `2·min(5,n) + strictDR(2·max(0,n−5), MORALE_BOX_LIMIT)` (v0.58.1 note
32). **One effect of one building was capped and the other was not, in the same round.**

Shipped in the identical shape and the identical primitive:

```
rate = BOX_EVENT_RATE × ( min(5,n) + strictDR(n − 5, BOX_EVENT_LIMIT) )
```

| boxes | 1 | 5 | **20** | **40** | ∞ |
|---|---|---|---|---|---|
| was | 0.0002 | 0.0010 | **0.0040** | **0.0080** | unbounded |
| **now** | 0.0002 | 0.0010 | **0.0022** | **0.00256** | **0.0030 (asymptote)** |
| cut | — | — | **−45%** | **−68%** | — |

The first five boxes stay **linear** — the whimsy is the point at low counts, and that is exactly
the concession the morale term already makes. **The morale term is asserted UNCHANGED** in shape,
constant and five-box knee, so this Part cannot be read as re-tuning the boxes.

**And the chronicle line is rate-limited INDEPENDENTLY of the event**, because halving a rate is
not the same thing as fixing a log. Below 300 game-seconds since the last box line the event still
fires and still moves resources — the mechanic is untouched — but its line is suppressed and
tallied, and the next line past the gap carries the count: *"The boxes were busy this season (10
more mischiefs and treats, tallied)."* Demonstrated in `test-v63` by driving the suppressor
directly: 1 line, 10 tallied, one summary line. **Same fix as v0.59.1 note 5's bulk hunts.**

---

## 7. Superseded assertions, re-pointed with their superseding spec item

Per operational rule 10 — re-pointed, never deleted, each naming what superseded it.

| # | suite | assertion | superseded by |
|---|---|---|---|
| 1 | `test-v32` | "Demacian Accord: village +6%" | **Part 3.2** — resource scope; now asserts the retired scope is GONE (`policyMult("village") === 1`), with the new form in `test-v63` |
| 2 | `test-v32` | "Noxian Doctrine: expedition renown ×1.5" | **Part 3.3** — ×1.33 |
| 3 | `test-v52` | "Keeping the Rolls … 1,300 knowledge" | **Part 1** — `songcraft` was at 3.40×; capped to 929. The PROPERTY (a branch on Songcraft's own rung, not a rung above it) is what is asserted now |
| 4 | `test-v581` | "the policy spread goes 12× → 35×" | **Part 3.4** — culture 10,000 makes it 50×; now asserts monotonicity plus the ratio |
| 5 | `test-v581` | "his LEAD is village production" | **Part 4** — the string is generated and says "in every job"; grepping it for "village" would assert the retired scope |
| 6 | `test-v591` | "it BURNS on the YIELD'S OWN FOOTING" | **Part 8.2** — a third factor, `crystalSinkFillMult()`, joins |
| 7 | `test-v61` | "the rule derives from the tech's own rung" | **Part 1** — `<=` the generated figure, and EXACTLY it on every rung the cap did not touch |
| 8 | `test-v62` | "STEEL is KEPT at 100, and the retention is ARGUED" | **Part 2** — the argument was wrong; steel is iron, not titanium |
| 9 | `test-v62` | "NEITHER glow is synced to an existing cycle" | **Part 5.3** — there is no Cinders glow; `f * 0.23` went with the rectangles |
| 10 | `test-v62` | "the burn is on the SAME FOOTING as the yield" | **Part 8.2** |
| 11 | `test-v62` | "the discovery knowledge cost rises EIGHTFOLD" | **Part 1** — the divisor is UNCHANGED and the CAP is what moved; ratio `<= 0.8` |
| 12 | `test-v62` | "the four authored figures are LEFT ALONE" | **Part 1** — the GENERATOR still leaves them alone; the CAP does not, and must not. `beastLore` is the untouched control |

---

## 8. Part 7 — the add-a-boost rule

**No `BOOST_LIMIT` value moved.** Seven keys, `knowledge` still deliberately absent (§Appendix).
Raising four caps in a round that already overshot would be reckless and §16 makes magnitudes
Jerry's in any case.

What ships is the rule as a **test**. `BOOST_SIGMA_OF_RECORD` declares this round's Σ per family —
`gold 0.45 · provisions 0.10 · mana 0.75 · crystals 0.50 · devotion 0.25 · knowledge 0.10` — and
`test-v63` fails if the live table disagrees. **A future round that adds or re-sizes a member
cannot make the suite pass without editing that object, and that edit is the moment the report
must carry the family's before/after DELIVERED value.** The delivery figure becomes the price of
admission rather than an afterthought.

**Part 3.2 is the immediate application and it is stated explicitly**: timber and ore are not
`BOOST_LIMIT` families, so the Demacian Accord's +8.5% is delivered in full — against vigor
(82.1% discarded), devotion (46.4%), provisions (27.5%) and mana (14.3%). `boostFamilyIsBounded()`
is the one place that question is asked.

---

## 9. Part 8.2 — the crystal sink on a stock reference

**v0.62's Part 7 worked and its target still failed, and both halves matter.** The drain went
6.9% → **28.9% of gross**, ×4.2, and it tracks the faucet as the multipliers grow — that is fixed
and stays. But crystals still sat at cap **95.6%** against a < 70% target, because **a drain
expressed as a share of the FAUCET cannot empty a STOCK that has been full for 2,500 years.** 27
Refineries deliver 14.69/s gross against a 4.57/s drain: the stock still fills, only slower. **A
share of gross is the wrong DIMENSION for a target that names a property of the stock**, and no
value of that share is right at more than one point.

**RR already had the idiom** — `AUTOMATION_BASE`, Kittens' `js/buildings.js:1309`
`value >= maxValue * (1 - 0.02)`. The same 2% sets the trigger here.

| fill | 0 | 0.25 | 0.50 | 0.60 | 0.74 | 0.85 | **0.98** | 1.00 |
|---|---|---|---|---|---|---|---|---|
| multiplier | 1 | 1 | 1 | 2.46 | 4.50 | 6.10 | **8** | 8 |

**Below half fill this Part is inert and the v0.62 footing is returned exactly.** Above it the
burn ramps to ×8 at the trigger. **It self-regulates, which is the point**: if the drain
overshoots, fill falls, the multiplier falls with it and the stock recovers — a negative feedback
loop with a fixed point wherever net flow is zero, instead of a magnitude that is wrong everywhere
except where it was chosen. `S.res[r]` is clamped at 0 by the tick loop, so no fill-keyed burn can
drive a resource negative.

**`MANUFACTORY_FUEL`'s flat value is UNCHANGED at 0.024** — the source's own per-copy anchor —
**for the fifth round running.** Four rounds raised it and none moved the stock.

Crystals time-at-cap on the Parts 1+2 build (i.e. **before** this Part): **96.2 / 95.7 / 95.5**.
The shipped-build figure is in §11.

---

## 10. Dev note 1 — one reported NaN, four instances found

> Jerry: *"The automated workshop tooltip shows NaN%."*

**It is operational rule 11 in its third shape, and the third shape is the quiet one.** The
Automated Workshop's `effect` string is built from `AUTOMATION_BASE` / `automationTrigger()` /
`AUTOMATION_CAP` **inside the `UPGRADES` array literal**, and all three were declared ~1,100 lines
below that array. A `var` is hoisted as `undefined`, so `1 - undefined` is `NaN` and
`Math.round(NaN * 100)` is `NaN`. The tooltip read *"stands at NaN% of its ceiling … NaN% of the
pile per copy, to a NaN% ceiling"* **for two rounds.**

**The two earlier instances CRASHED THE PAGE and were caught the same day** — `undefined.map` and
`undefined[key]` both throw. This one produced a valid string containing three NaNs, so nothing
threw, no suite failed, and it took a player looking at the tooltip to find it. **That is why the
fix ships with a guard rather than a hoist alone.**

`test-v63` walks every `effect` / `desc` / `lore` / `name` string in `UPGRADES`, `TECHS`,
`BUILDINGS`, `CRAFTS`, `WTECHS`, `POLICY_GROUPS` and `CHAMPS` and fails on `NaN`, `undefined` or
`Infinity`. **It found two more on its first run, neither of which anyone had reported:**

```
pressureRegulators  "Hexdraulic Manufactories burn NaN% less Hextech Crystal."
rollingPress        "Each Manufactory prints undefined parchment/second."
```

**And a companion guard on NUMBERS found a fourth, quieter still.** `MANUFACTORY_FUEL` is read
inside the **`BUILDINGS`** literal at the Manufactory's `convert.input.crystals`, so the building
shipped with an `undefined` fuel cost — **invisible, because `computeRates()` rewrites that field
from state on every call. A defect that repairs itself on the first tick is a defect nobody can
see, and no string guard would have found it.** `test-v63` now asserts every `cost`, `prod`,
`caps`, `ratio` and `convert` field is finite at load.

All four constants hoisted above the arrays that read them. **One reported symptom, four instances
found, and the class closed by a suite rather than by a player noticing.**

---

## 11. The ensembles — TWO of them, and §32 is why there had to be two

**Three-seed 2,500-year runs. 81 and 61 minutes wall. Both completed; neither was lost.**

### 11.1 The gate ensemble — Parts 1+2, and this is the round's PACING RESULT

This is the like-for-like comparison against v0.62, and it is the only one that is: **Parts 1 and
2 make no random-consuming change, so their seeds line up with v0.62's seed-for-seed** (§32).

| condition | v0.62 | **Parts 1+2** | |
|---|---|---|---|
| **Icathia on all three seeds** | 1 of 3 | **1 of 3** (seed 3, y1,835.2) | **FAIL — the gate** |
| Rites of Targon [median, <75] | **76.0 FAIL** | **69.3** — 69.3/80.4/69.3 | **PASS** |
| First champion [max, <120] | **129.6 FAIL** | **110.2** — 84.9/97.3/110.2 | **PASS** |
| Peak population [median, 150–220] | **135 FAIL** | **136** — 136/134/180 | **FAIL** |
| Sparks [max, <500] | | 195.7 — 193.2/195.7/193.9 | PASS |
| Chemtech→Hexcore [max, <400] | | 117.4 — 117.4/101.8/75.5 | PASS |
| the other four | pass | pass | PASS |
| **failing** | **4 of 10** | **1 of 10** | |

### 11.2 The shipped ensemble — a FRESH DRAW, not a comparison

Part 6's rate change alters how often a random event fires, so the shipped build's stream is
re-rolled (§32). **These three seeds are a new sample and must not be read as a delta.**

| | median | per seed |
|---|---|---|
| **Icathia** | **2 of 3** | 1,473.8 / 1,704.3 / never |
| Era 3 | **982.8** (843.2–1,122.3, ×1.33) | the shortest Era 3 this project has measured |
| peak population | **148** | **154** / 148 / 99 — **seed 1 is INSIDE §27's band** |
| **crystals time-at-cap** | **25.0%** | 28.4 / 25.0 / 42.1 |
| Rites of Targon | 84.8 | 61.1 / 85.6 / 84.8 |
| first champion | 206.3 | 206.3 / 140.1 / **491.7** — spread **×3.51** |
| Sparks | 630.6 | 630.6 / 582 / 998 — spread **×1.71** |
| **failing** | **5 of 10** | |

**Read the spreads, not the medians.** First champion ×3.51 and Sparks ×1.71 against the gate
ensemble's ×1.30 and ×1.01, on a build whose only behavioural difference is how often a box
misbehaves. **That is §32's signature, and Sparks' champion gate (§4, the 3-of-10 exception) is
the amplifier**: three seeds that draw a Piltover/Zaun champion late produce a late Sparks and
everything downstream slides with it.

### 11.3 Pass condition 20 — the one target this round CLEARS outright

**Crystals time-at-cap: 95.6% (v0.62) → 96.2% (Parts 1+2) → 25.0% (shipped).** The condition asks
for below 70% **on at least one seed**; it is met on **all three**. The decomposition at the median
seed's final state:

```
CRYSTAL DECOMPOSITION @final: net -1.245/s = gross 11.0969/s  -12.3419/s drain
  26 refineries · 11 manufactories · 5 tinkerers · 16 augment chambers
     -12.341897/s  -111.22%   11x Hexdraulic Manufactory (consumes)
```

**The drain is 111% of gross — the sink now exceeds the faucet near the ceiling, and net flow is
negative there.** That is the fixed point Part 8.2 was designed around: the stock falls, the fill
falls, the multiplier falls with it, and the system settles wherever net flow is zero. Compare
v0.61's 6.9% and v0.62's 28.9%, both of which left the stock filling. **`MANUFACTORY_FUEL` was not
touched for the fifth round running** — the change is the drain's *dimension*, not its magnitude.

### 11.4 Pass condition 8 — the steel ceiling, before and after

Absolute ceilings at the four milestones on the median seed, from the readout built for this:

| milestone | steel held / cap | stores |
|---|---|---|
| sparks | 79 / 10,986 | 8 / 52 / 2 |
| chemtech | 36 / 63,750 | 17 / 64 / 13 |
| hexcore | 25 / 59,028 | 17 / 64 / 13 |
| deepWorks | **82,996 / 83,020** | 17 / 64 / 13 |

**Steel is nowhere near its ceiling until the last milestone, where it pins.** So the Warehouse cut
(100 → 25) costs nothing through most of the run and the Storehouse line (0 → 50) buys nothing
either — **Part 2 is a parity correction with no measurable pacing effect, which is what it should
be, and it is stated rather than claimed as a win.** The single-seed 150-year attribution says the
same thing more sharply: the Part 1 and Part 2 prefixes return **byte-identical** milestone figures.

### 11.5 Predicted vs measured

| slice | spec's prediction | **measured** |
|---|---|---|
| s1 per-rung discovery cap | Era 3 −120 to −40 | **Rites −8.4, first champion −47.0 on seed 1 at 150y. Era 3 unscoreable in isolation.** |
| s2 steel lines | −40 to −10 | **0.0 — byte-identical to s1** |
| s3 philosophies | −30 to +30 | **0.0 at 300y seed 1 — the government group is gated behind `callToArms` and the bot has not reached it. Reverting ALL of Part 3's magnitudes changes nothing.** |
| s4 banners, tooltips, box rate | **0.0 — "no pacing effect"** | **WRONG, and it is the round's finding. The box rate re-rolls the entire stream (§32).** |
| s5 crystal sink | +20 to +80 | **crystals 96.2% → 25.0% at cap; Era 3 median 982.8** |
| **shipped** | **Icathia 3 of 3, Era 3 1,250–1,450** | **Icathia 2 of 3, Era 3 982.8** |

**The spec's binary prediction — "Parts 1 and 2 alone restore completion" — is falsified (§0).
Its s4 prediction of "no pacing effect" is also falsified, and more interestingly**: a change
described as cosmetic-plus-a-rate-cut turned out to be the only change in the round capable of
moving every milestone in the game, for a reason that has nothing to do with balance.

---

## 12. Suites

**34 suites. 1,827 `check()` call sites, 1,876 assertions executed, 1,876 passed, 0 failed.** No
missing trailer, no skipped call site, no non-zero exit. `tests/test-v63.mjs` is **90 assertions**.

**Parity ledger regenerated: 225 rows — PARITY 87, EASIER 117, HARDER 21, UNVERIFIED 0.** The
ledger stays finished. Three rows re-argued this round (Storehouse, Warehouse, Harbor), all with
the `ironMax` citations from a fresh clone.

---

## 13. What I would take back first, and what I would take next

**Nothing in this round.** Every Part did what it was specified to do and the measurements confirm
it. **What I would take back is the round's PREMISE**, and it is not mine — it is the shared
assumption of the last two rounds that the completion failure lives on the knowledge ladder.

**The next round should be about population and nothing else.** The evidence:

- **peak population 179 (v0.61) → 135 (v0.62) → 136 (v0.63)**, against §27's own 150–220 band. The
  band has now failed two rounds running and it is a band Jerry may overturn (§27) — but the
  correct response to "the target fails" is to check whether the target or the game is wrong, and
  **this round it is the game, because completion tracks the band.**
- **`pop130` median 1,735.8 game-years.** Seven tenths of a 2,500-year run to reach 130 people.
- **The seed that finishes has 180 population; the two that do not have 136 and 134.** That is the
  cleanest single-variable discriminator this project has measured.
- v0.62's handoff named five changes that pushed the same way: the storage cut, the eightfold
  knowledge raise, the shrine morale cut, Marus, and Jarvan's re-scope. **This round undid a third
  of the knowledge raise and relieved storage — and population did not move at all.** So it is one
  of the other three, or it is housing and food directly, and **the next spec should measure which
  before proposing anything**, per §0.1's new rule.
