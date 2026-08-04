# BUILD REPORT — Runeterra Reclaimed v0.46

Every item in BUILDER SPEC v0.46 is implemented, in the Part 8 order, plus all seven of
Jerry's forwarded items. **718 assertions across 14 suites, 0 failures** (v46 contributes
50). Four seeds × 3,000 game-years, plus the two isolation runs Part 8 asked for.

Nothing was silently skipped. The four things that did not land are §4 and §8.

---

## 0. My own errors first

**0.1 — I killed my own shell mid-script.** `pkill -f "pacing.mjs"` matched the bash
process running it, so a Python edit to `simcore.mjs` never executed while the surrounding
command reported success. I then spent two launches debugging a "guard that didn't work"
which had never been written to disk. Second time this project has lost a cycle to an edit
that silently did not apply; the handoff warns about exactly this class and I still only
caught it by grepping for the string afterwards.

**0.2 — Both isolation runs crashed on the first attempt, because I instrumented the
harness against the new build only.** `simcore.mjs` calls `tradeCost(f)`, which exists
from v0.46. The Part 1 and V1 isolation builds are cut from v0.45 and do not have it, so
both died with `ReferenceError` after wasting a launch. Now guarded with
`typeof tradeCost === "function"`. **Any harness change has to run against the older
builds too, or the isolations the spec asks for cannot be produced.**

**0.3 — Two of my four v46 test failures were my test, not the build.** A grep for
`0.05 * S.pop` to prove the passive vigor line was gone also matches the Bard's Hearth
culture line; and a jungler-vigor comparison at population 200 vs 20 read as a population
effect when it was morale (a 200-population settlement with no taverns is floored at 25%).
Both fixed by measuring the thing rather than a proxy for it.

**0.4 — And two were real, and they interact in a way I would not have predicted.**
Jerry's "Shelter at 4 timber" could not be satisfied by the unlock ratio at all, because
*two separate exemptions were already overriding it*: Transmute made timber count as "a
material a visible recipe can produce", and the v0.41 storage-ceiling unsticker fires at
base storage for any building cheaper than its base cap. The Shelter was visible on turn
one whatever ratio it carried. Both are now correctly narrowed — see §6.4.

---

## 1. The number that changes the round

**Part 1 is right, and it is the largest single lever anyone has found in this project.**

| | v0.44 | v0.45 | **v0.46 (median of 4 seeds)** | target |
|---|---|---|---|---|
| Sparks | y95.1 | y136.9 | **y98.0** | y350–500 |
| Doors of Icathia | y181.4 | y294.6 | **y463.1** | y1,400–2,300 |
| **Era 3 length** | 86.3 y | 156.6 y | **362.6 y** | — |

Era 3 has now more than doubled twice in two rounds, 86 → 157 → 363 game-years.

**The two isolation runs Part 8 asked for, seed 1, everything else held at v0.45:**

| Build | Sparks | Icathia | Era 3 length | vs v0.45 |
|---|---|---|---|---|
| v0.45 baseline | y138.3 | y298.9 | 160.6 y | — |
| **+ Part 1 only** (four building prices) | y180.0 | y453.9 | **273.9 y** | **×1.71** |
| **+ V1 only** (passive vigor line deleted) | y135.6 | y391.2 | **255.6 y** | **×1.59** |
| full v0.46 | y85.8 | y443.0 | 357.2 y | ×2.22 |

Two things fall out that neither of us predicted:

**1. V1 is nearly as large as Part 1, and it was never presented as a pacing lever.** You
asked for it on its own "because the passive line is worth 10.1/s and I want to know what
it was holding up". The answer is: 95 game-years of Era 3, from deleting one four-line
block. It costs almost nothing at Sparks (y138.3 → y135.6) and everything afterwards,
which is the exact shape the pacing needs.

**2. Part 5's ladder re-skew is worth −94 years of Era 3 *entry*, and that is why Sparks
went backwards.** Part 1 alone puts Sparks at y180 — inside its y350–500 band's direction
of travel. The full build puts it at y85.8. The difference is the trim: Call to Arms fell
14,000 → 7,700 and Sparks 20,000 → 15,400, so the re-skew that fixed the ladder's *shape*
paid for it by making Era 3 arrive a third sooner. That is a real trade and it was not
flagged in the spec.

---

## 2. Part 1.4 — the ore decomposition you needed before pricing anything else

Answered, and the answer is simpler than the question feared: **RR has no ore autoprod at
all, so the divergence you were worried about does not exist.**

| | Sparks (y85.8) | Hexcore (y218.2) | Icathia (y443) |
|---|---|---|---|
| **total ore** | 15.79 /s | 77.93 /s | **4,761.93 /s** |
| job (miners) | 18.29 (**116%**) | 103.03 (**132%**) | 4,843.68 (**102%**) |
| converters + autoprod | **−2.94 (−19%)** | **−33.41 (−43%)** | **−869.83 (−18%)** |
| camps, events, residual | 0.44 | 8.31 | 788.08 |

Measured by switching each source off in the game's own `computeRates()`, not by mirroring
its arithmetic.

**Ore income is ~100% job income. The converter block is a net ore SINK of 870/s at
Icathia** — the Forge and the Chembarrel line consume ore, so turning them off *raises* the
number, which is why those cells are negative. RR's autoprod buildings (Sump Mine, Coalgas
Vent, Hexcrystal Quarry) produce Zaun Ore, Coalgas and Hexcrystal Ore — **none of them
produces `ore`**. So there is nothing on the ore line for the ×38 building category to
multiply that Kittens would have excluded, and `perTickAutoprod`'s ordering at
`game.js:3466` has no RR analogue to get wrong.

For reference, ore income fell **9,215 /s → 4,762 /s** — Part 1 halved it without touching
a single rate.

---

## 3. Part 6 — the stripe is set, and the measurement says no stripe can work

Set to **1,884**, exactly as specified. Fourth deferral ended.

Then I measured `W₂/W₁`, which you asked for, and it is not 2.4.

| | year | Worship | Convergence |
|---|---|---|---|
| `W₁` at Sparks | y85.8 | **4,748** | **1.80%** |
| `W₂` at Icathia | y443 | **5,965,018** | **79.08%** |
| **W₂ / W₁** | | **×1,256** | — |

**Your condition was "the band holds at both ends iff that ratio is 2.4". It is 1,256.**
The √ curve compresses a 1,256× input range into only √1,256 ≈ ×35 of output, so
Convergence spans 1.8% → 79% and there is no value of `s` that puts both ends in 5–8%.
Moving `s` slides the whole curve; it cannot narrow it.

The stripe also missed at the near end, for the reason you predicted in advance: **the
input moved again.** 1,884 was derived from v0.45's four-seed `W₁` = 28,256. Parts 1 and 2
cut Worship-at-Sparks a further 4.5×:

| seed | 1 | 2 | 3 | 4 | median |
|---|---|---|---|---|---|
| Convergence at Sparks | 1.80% | 2.34% | 2.16% | 2.11% | **2.10%** |
| implied `W₁` | 4,748 | 7,362 | 6,430 | 6,181 | **6,306** |

Spread 1.55× — the tightest this input has ever been. `s = W₁/15` now gives **420**. I did
not apply it: re-deriving inside the same round that moved the input is the loop this has
been stuck in for five rounds, and at `s = 420` the Icathia end reads 168%. **The stripe is
not the lever. The lever is that Worship grows 1,256× across an era the band is supposed to
span.**

---

## 4. Pass conditions, honestly

| Condition | Result |
|---|---|
| Quarry effective-raw ≥ 500× the Mine's | ✅ **×1,016** (101,598 raw vs 100) |
| Observatory ≥ 300× | ✅ **×381.8** (38,181 raw) |
| Ore income decomposed at Sparks and Icathia | ✅ §2 |
| Science stock near 30/30/25/13, all four within ±30% | ❌ **39 / 31 / 49 / 21** |
| Per-worker ore : timber 1.6–2.2 at Icathia | ❌ **3.17** (was 3.66) — ✅ **2.09 at Hexcore** |
| ...report ore ratio-buildings against Lumber Mills | ✅ **97 vs 37** at Icathia |
| Timber category reported at the line actually owned | ✅ §7 |
| Vigor: no production term that scales with population | ✅ 0/s at pop 200, no junglers |
| Vigor receives `catCharts × catReligion × catPolicy` and nothing else | ✅ ×1.000000 from the excluded four |
| `BOOST_LIMIT.vigor` asymptote ×2.0 | ✅ exactly ×2.00 |
| Vigor at cap for < 10% of elapsed time | ❌ **40.5–43.2%** across four seeds |
| Trades/game-year at Icathia ≤ 3× at Sparks | ❌ **unmeasurable — zero trades before Sparks** |
| First expedition reachable from a cold start | ✅ **y9.5–11.3** |
| Tech count 38 | ✅ |
| ...five or more exact ties | ✅ **5** |
| ...median ×1.10–1.20 | ✅ **×1.1885** |
| ...geometric mean ×1.25–1.30 | ✅ **×1.2553** |
| ...**all three simultaneously** | ✅ **that was the point of the trim, and it worked** |
| No single production line's champion multiplier > ×3.0 | ✅ **max ×1.774** (devotion, culture) |
| ≥15% of Discoveries chain off another Discovery | ✅ **12/75 = 16.0%**, Kittens' own share |
| ≥78% tech-gated | ✅ **96%** |
| No Lore tech carries a material cost | ✅ **zero of 38** |
| Crafting tab hidden on a Transmute-only save | ✅ |
| Loremaster hidden until an Archive stands | ✅ |
| Cold-start visibility years reported, 4 seeds | ✅ §6.4 |
| `W₁`, `W₂`, `W₂/W₁` reported | ✅ §3 |
| Regression: `caps.knowledge` == Σ(building caps) exactly | ✅ |
| Regression: `buildingJobBoost` still unbounded | ✅ |
| Regression: morale ≥ 0.90 at Icathia | ✅ **1.17** |
| Regression: no champion at level 10 before Era 3 | ✅ |
| Population 130 by y600 | ✅ median **y349.5** |

---

## 5. Multi-seed

| Milestone | s1 | s2 | s3 | s4 | median | spread |
|---|---|---|---|---|---|---|
| Rites of Targon | y48.9 | y48.9 | y50.5 | y48.5 | y48.9 | 1.04× |
| First champion | y69.9 | y78.6 | y85.6 | y73.9 | y76.3 | 1.22× |
| **Sparks** | y85.8 | y106.7 | y101.5 | y94.4 | **y98.0** | 1.24× |
| Chemtech | y161.5 | y197.1 | y206.9 | y193.5 | y195.3 | 1.28× |
| Hexcore | y218.2 | y279.2 | y277.2 | y237.9 | y258.6 | 1.28× |
| Deep Works | y290.5 | y336.2 | y327.2 | y307.2 | y317.2 | 1.16× |
| **Doors of Icathia** | y443.0 | y468.3 | y483.7 | y458.0 | **y463.1** | **1.09×** |
| 130 wanderers | y305.3 | y380.7 | y374.5 | y337.4 | y349.5 | 1.25× |
| Peak population | 195 | 194 | 199 | 193 | 195 | 1.03× |
| Final morale | 119 | 119 | 118 | 119 | 119 | — |
| Vigor at cap | 43.2% | 41.3% | 40.5% | 41.5% | 41.4% | — |

Spread still tightens with era. Morale holds at **100% in the 90–140 band after y60** on
every seed.

---

## 6. Jerry's seven items

**6.1 — Shelter visible at 4 timber.** ✅ Shipped, and it took three fixes rather than one
— see §0.4 and §6.4.

**6.2 — Knowledge cap starts at 0.** ✅ `RES.knowledge.baseCap` 150 → 0. Nothing remembers
anything until an Archive stands, the same reasoning as v0.44's `maxPop` base 2 → 0. The
bootstrap holds: Channel Mana → Transmute → Shelter (y2.31) → Archive (y2.47), and the
Loremaster job unlocks on the same building in the same tick.

**6.3 — Audit the twelve techs carrying material costs.** ✅ Done — **there were 23, not
12.** All 23 stripped; every Lore tech is now priced in knowledge alone, as Kittens' science
tree is. Each material set moved onto a Discovery the tech unlocks, or onto its building
where it unlocks no Discovery (three cases, marked B):

| tech | → absorber | moved |
|---|---|---|
| masquerade | Letter of Marque | gold 100 |
| hextech | Hex-Capacitors | crystals 15 |
| voidStudies | Tribute Reliquaries | crystals 20 |
| ritesOfTargon | Cross-Referencing | culture 300, crystals 25 |
| callToArms | The Great Index | culture 400 |
| championsRegimen | Standing Orders | culture 500, tome 4 |
| deepCartography | Surveyed Approaches | parchment 60, gold 400 |
| refinedMetallurgy | Steel Axes | steel 400, gear 30 |
| sparks | Seasoned Timberworks | steel 200 |
| hexdraulics | Piltovan Cranes | beam 40 |
| sumpEcology | Sump Ventilation | plating 30 |
| progressDay | Progress Day Parade | culture 2,000 |
| chemtech | The Annotated Index | culture 600 |
| chemBaronAccords | The Chem-Baron Tithe | alloy 40 |
| gloriousEvolution | **B** Augment Chamber | hexgear 30, shimmer 40 |
| hexcore | Hexresonance | culture 800, crystals 60 |
| atlasGauntlets | Atlas Gauntlets | plating 120 |
| hexgate | **B** Hexgate | hexcore 3, hexSlab 150 |
| deepWorks | The Living Library | culture 900, hexcore 5 |
| greyReclamation | Grey Scrubbers | shimmer 200 |
| voidglassOptics | Voidglass Lenses | voidglass 6, hexSlab 200 |
| watchersBelow | **B** Ward of the Watchers | trueice 400, poroTears 40 |
| icathia | Voidward Stores | culture 1,200, hexcore 10 |

**6.4 — Quarry genuinely expensive: your call.** ✅ **Yes, shipped verbatim** —
`stoneSlab 1000 + steel 125 + scaffold 50`. It is the single largest contributor to §1. The
Quarry goes from ×4.1 the Mine to **×1,016**, and it stops being a routine purchase: the
settlement holds **37** at Icathia against 55 in v0.45, while Mines went 60 → 60.

The felt change is real and it lands where you'd want it — Quarries arrive late (0 at
Sparks, 8 at Hexcore, 37 at Icathia) instead of being bought on sight.

Cold-start visibility, all four seeds, identical to two decimal places:

| | year first visible |
|---|---|
| Shelter | **y2.29** (built y2.31) |
| Archive | **y2.39** (built y2.47) |
| Loremaster job | **y2.47** |
| Crafting tab | **y4.30–5.58** |
| First expedition | **y9.5–11.3** |

**6.5 — Confirm the trade numbers.** ✅ Confirmed and shipped: vigor ×3 (150/225/300) and
gold at Kittens' 15:50 = 0.30 ratio (45/68/90), measured at 0.300–0.302 on every route.
**But the measurement says the gate is too strong at the near end — see §8.2.**

**6.6 — Decide the ladder trim.** ✅ **Yes.** 45 → 38, keeping Coinage (600→1,400),
Falconry (2,300) and Kindling (4,600) as the three tie-makers, retiring the other seven and
re-homing each one's Discovery onto an existing tech so no content was lost — Four-Part
Harmony → Songcraft, Faceted Cuts → Hextech, Iron-Shod Wheels → Trade Routes, Pasture
Rotation → Abyssal Cartography, Tribute Reliquaries → Void Studies, Continuous Draw →
Chemtech, The Standard Hour → The Hexgate.

Re-skewed to Kittens' shape: **30 → 100 → 300 → 800** is ×3.33 / ×3.00 / ×2.67, with 100
and 300 being `agriculture` and `archery` exactly, then a flat ×1.19 tail to 135,000. All
four ladder conditions hold at once for the first time.

**6.7 — Set the Convergence stripe.** ✅ Set to 1,884. §3 is what it measured.

---

## 7. Part 2 and Part 8's timber correction

**Your §0.4 concession is confirmed by direct measurement.** Evaluating the timber formula
at the axes and saws *actually owned*, as you asked:

| | timber category, measured | formula at the line owned | |
|---|---|---|---|
| Sparks (y85.8, 9 Mills) | 5.27 | — (see below) | |
| Hexcore (y218.2, 29 Mills) | 20.06 | — (see below) | |
| **Icathia (y443, 37 Mills)** | **26.98** | `3.7 × (1 + 0.10 × 1.70 × 37)` = **26.97** | ✅ exact |

**Icathia is verified exactly** — the measured `toolUpgrade` of 3.7 back-solves to five
axes owned and the measured building term to four saws, and the formula at that line
reproduces the measurement to 0.04%. The full-line figure would be
`4.2 × (1 + 0.195×37)` = 34.5, and comparing against *that* is the mistake your §0.4
concedes.

**Sparks and Hexcore I am NOT claiming as verified**, because `snapshot()` did not record
which rungs were owned at those instants and I will not back-solve a two-variable
composition from one number. That is a harness gap of mine, not a build finding; the
snapshot now records `linesOwned: { axes, saws }` and the next round can state all three
exactly. What the Icathia figure does establish is your §0.4 point: **the line reproduces
its design at the rungs actually held, and the v0.45 "51% miss" was the comparison, not the
build.**

**Per-worker ore : timber is 3.17 at Icathia, and 2.09 at Hexcore — in band mid-era.** The
residual is entirely the building counts, exactly as your revised condition anticipated:
**97 ore ratio-buildings against 37 Lumber Mills.** Part 1 moved this from 115-vs-40; the
Quarry re-pricing did the work, and the Mine — which is now *cheaper*, at `timber 100` — did
not shrink at all.

**Part 4's anchor, for v0.47.** No prices changed, as instructed:

| | effective raw | count at Icathia |
|---|---|---|
| Hextech Foundry (amplifier tier) | 119,252 | **2** |
| Arcane Reactor (global tier) | 62,595 | **30** |
| **RR tier separation** | **×0.525** | |
| **Kittens** (Magneto 20,867 → Reactor 3,774,333) | **×181** | |

The Reactor count moved 12 → 30 with the longer era, so the ≥25 condition from v0.44 is met
for the first time — but by a building that costs *half* its amplifier, which is the defect
you identified. Hexdraulic Plants: 2.

---

## 8. What did not land, and why

**8.1 — Science stock 39 / 31 / 49 / 21 against 30 / 30 / 25 / 13.** Two of four now pass
(Academies 31, Archives 39 at +30%); **Hexcore Labs fell 47 → 21**, which is the Biolab
re-pricing working almost exactly as predicted. **Observatories went the wrong way, 45 →
49**, despite costing ×7 more in raw terms. The cause is era length: Part 1 bought 206 extra
game-years of Era 3, and the settlement spent them buying the building whose ratio is 1.10.
A price rise that also lengthens the era it is paid in partly refunds itself.

**8.2 — Trades: zero before Sparks, on every seed.** The pass condition is unmeasurable
because its denominator is zero. This is a real defect and it is an interaction between two
of this round's parts, not either alone:

- Part 3 sets the cheapest trade at **150 vigor**.
- Part 2 V4 puts the vigor *ceiling* on housing at **40 per Shelter**.

A settlement needs **four Shelters before it can physically hold enough vigor to trade
once**, and the gold gate binds on top of that. Combined with V1 deleting the passive vigor
income, the entire diplomacy layer is now dead until Era 3. Kittens' equivalent trade is 50
catpower against a 75-manpower hut — **one** hut. RR is at 150 against 40.

The cleanest fix is not to weaken the gate: it is to put RR's Shelter on Kittens' actual
ratio. Kittens' hut carries `manpowerMax 75` for `maxKittens 2`; RR's Shelter carries 40 for
`pop 2`. **Raising the Shelter to 75 makes the first trade reachable at two Shelters, which
is Kittens' own shape, and it is a one-line change I did not make because Part 2 V4's
numbers were specified explicitly.**

**8.3 — Vigor sits at cap 40.5–43.2% of the time** against a <10% target. Same root cause
seen from the other side: with trades unaffordable and expeditions the only sink, vigor
income saturates a ceiling that no longer grows with population. Expect this to resolve with
8.2, and to need re-measuring rather than re-tuning.

**8.4 — Sparks at y98.0 against y350–500.** Part 1 alone reaches y180; the ladder re-skew
pulls it back to y98. If Era 3 *entry* matters as much as Era 3 *length*, the trim's price
cuts (Call to Arms 14,000 → 7,700, Sparks 20,000 → 15,400) are the lever, and they were a
side effect of fixing the ladder's shape rather than a pacing decision. Icathia at y463.1
against y1,400–2,300 is short by ×3, down from ×8 last round.

---

## 9. What shipped

**Part 1**, alone in the diff and measured alone: Mine → `timber 100`; Quarry → Kittens'
`stoneSlab 1000 + steel 125 + scaffold 50`; Observatory `beam 50` → `scaffold 50`; Hexcore
Laboratory → Kittens' Biolab (`knowledge 1500 + stoneSlab 100 + plating 15 + alloy 25`).
Archive and Academy deliberately untouched. **Part 2** V1–V4: the passive per-wanderer vigor
line deleted, vigor added to `TRANSIENT`, `BOOST_LIMIT.vigor` 1.5 → 1.0, the cap moved onto
Shelter 40 / Longhouse 50 / Skyrise 50 and off population, and the `CAP_MULT_EXEMPT` comment
re-sourced to `addBarnWarehouseRatio`. **Part 3**: gold on every route at 0.30, a
`tradeCost()` seam so cost is computed in one place, and two subtractive discounts floored at
zero (Caravanserai −40 vigor on Trade Routes, Letter of Marque −15 gold on Masquerade).
**Part 5**: 45 → 38 techs, re-skewed. **Part 5A**: 12 discovery chains (16%), a resource-state
gate on Discoveries, `buildingVisible` and `upgradeVisible` collapsed onto one
`costDiscovered()` so they cannot drift, the Crafting tab off Transmute, and the Loremaster
onto the Archive. **Part 6**: stripe 1,884. **Parts 4 and 7**: no code, report only, as
instructed.

Two narrowings were required to make Jerry's Shelter directive reachable at all, and both are
corrections in their own right: **Transmute no longer counts as a craft** for the
crafted-material exemption (it is a conversion — the same distinction the spec draws for the
Crafting tab), and **the storage-ceiling exemption no longer fires at base storage**, only
once a ceiling has actually been raised. The v0.41 Tavern/Observatory deadlock it exists for
is unaffected: by then Storehouses have lifted the ore ceiling far above its base.

---

## 10. What I would do next

1. **Shelter `vigor: 40` → `75`, Kittens' own `manpowerMax`.** It is the smallest change
   that unblocks §8.2 and §8.3 together, and it is parity rather than tuning.
2. **The Convergence band cannot be held by a stripe.** §3 measures W₂/W₁ = 1,256 against
   the procedure's assumed 2.4. Either the band has to widen with the era, or Convergence
   needs a different curve. Setting `s` again will not do it.
3. **The Observatory, at ratio 1.10.** It is the one science building that got *more*
   numerous after a ×7 price rise, because the era grew around it. Kittens' observatory is
   1.10 too, so the divergence is elsewhere — probably that RR has no `libraryRatio`
   equivalent making Observatories worth *more* rather than *more numerous*.
4. **Decide whether Era 3 entry is a target.** The ladder re-skew and the Era-3 length fix
   pull in opposite directions on Sparks, and this round has both.

The lever I would not pull again is the tech ladder. It is the only part of the game where
all four stated conditions now hold simultaneously.
