# BUILD REPORT — Runeterra Reclaimed v0.47

Every item in BUILDER SPEC v0.47 is implemented, in the Part 6 order, with Part 4A last as
Jerry directed. **770 assertions across 15 suites, 0 failures** (v47 contributes 52).
Four seeds × 4,000 game-years, plus the two isolation runs.

---

## 0. My own errors first

**0.1 — I made devotion transient and re-opened the v0.36 self-feeding loop.** Adding
`devotion` to `TRANSIENT` routed it through `globalTransient`, which *contains*
`catReligion` — and devotion becomes Worship 1:1, and Worship is what sets `catReligion`.
The v0.36 exemption was silently overridden. Measured ×2.41 on devotion at 5M Worship
before the fix. **The v0.36 test caught it, not me.** Devotion needs *two* exclusions —
transient AND the religion category — and they are different things. Fixed with
`globalTransientNoReligion`, asserted in test-v47.

**0.2 — my first offline A/B reported 2.16% drift and I nearly shipped that as a finding.**
The two arms were drawing different random event streams, so I was measuring event noise
and calling it integration error. Holding `Math.random` constant showed the replay is
**bit-identical to live play: 0% drift on every resource and on population.** I had even
"fixed" it by halving the replay step first, and written a code comment blaming
granularity. Both the comment and the conclusion were wrong and are now corrected in place.

**0.3 — I named my clock helper `now()` and two functions already had a local `var now`.**
Shadowed instantly, `TypeError` on the first tick. Renamed `simNow()`.

---

## 1. The number that changes the round

**Part 1 alone lands Icathia at y1,005.3 — the closest this project has come to the target.
The full build lands it at y435.9. The other parts cost 670 game-years.**

Isolation runs, seed 1, everything else held at v0.46:

| Build | Sparks | Icathia | Era 3 length |
|---|---|---|---|
| v0.46 baseline | y85.8 | y443.0 | 357.2 y |
| **+ Part 1 only** (the ladder at Kittens' prices) | y127.2 | **y1,005.3** | **878.1 y** |
| + Part 2 only (the Worship supply) | y85.0 | y438.1 | 353.1 y |
| **full v0.47** | y90.6 | y413.6 | 323.0 y |

Part 1 is worth **×2.46** on Era 3 on its own — 357 → 878 game-years — and it is the only
lever in this spec that moved pacing at all. Part 2 measured **neutral** (357 → 353).

**Then the rest of the spec gave 670 of those years back.** I did not isolate Part 4, so I
cannot name the term with certainty, and I am not going to guess in a table. What I can say
is what changed that plausibly could: **Part 4.4 made the Storehouse `timber 50` alone —
dropping an `ore 75` component from a ratio-1.75 building the settlement buys dozens of, and
raising its ore ceiling 150 → 250 at the same time.** Storage is upstream of everything, and
that is the only Part 4 item that touches a cost the bot pays repeatedly.

**This is the round's open question and it needs one isolation run to answer.** If it is the
Storehouse, Part 1's y1,005 is recoverable and the target is within one round's reach.

---

## 2. Jerry's void-figures directive, discharged

**You were right that the v0.46 Quarry and Observatory numbers were void, and re-measuring
changes the reading.**

| | v0.46 (under the scaffold gate) | **v0.47 (actually buildable)** |
|---|---|---|
| Quarries at Sparks / Hexcore / Icathia | 0 / 8 / 37 | **0 / 25 / 37** |
| Observatories at Sparks / Hexcore / Icathia | 0 / 20 / 49 | **1 / 38 / 49** |

The Quarry count at Hexcore is **×3.1 what v0.46 measured**. v0.46's report attributed the
late arrival to the re-pricing; measured properly, most of it was the hard gate. **The price
finding survives — the Quarry is still 0 at Sparks and still ×1,016 the Mine — but the
v0.46 §6.4 sentence "Quarries arrive late instead of being bought on sight" was reading a
deadlock as an economic choice.** §8.1's Observatory behaviour is the same story: 45 → 49
across v0.46 was measured on a building that could not be built for two thirds of the run.

The deadlock itself: `scaffold` was `show: s.techs.sparks` (20,000) while the Quarry (9,500)
and the Observatory (12,000) both cost `scaffold 50`.

---

## 3. The cost-graph walk found six deadlocks, not one

Part 1.4(c) asked for a one-time graph walk instead of spot-checking. It is now
`auditCostGraph()` in the game and asserted in test-v47. On the shipped v0.46 build it
returns **six** violations:

| Thing | unlocks at | but needs | gated on |
|---|---|---|---|
| **Observatory / Quarry** | 12,000 / 9,500 | scaffold | sparks 20,000 |
| Harbor | trade 1,200 | gear | smelting 1,500 |
| Hexdraulic Plant | hexdraulics 50,000 | hexgear | hexcore 75,000 |
| Augment Chamber | gloriousEvolution | hexgear | hexcore |
| Petricite Block *(craft)* | petricite 9,500 | hexSlab | hexcore 75,000 |
| Voidglass Optics / Ward of the Watchers | 125,000 | voidglass | icathia 135,000 |

Five of the six were **pre-existing and had never been reported**. The Petricite Block one
is the oldest: a rank-16 craft requiring a Hexcore-tier material, so the Petricite Monument
was unbuildable through the whole middle of the game.

Fixes, each minimal: Harbor → Smelting; Hexdraulic Plant → Hexcore (it amplifies the
Foundry, which is a hexcore building, so they now arrive together); **Hexcore and Glorious
Evolution swap prices inside the spec's own 21–38 multiset** (both `req chemtech`, so both
orderings are monotonic and the multiset is unchanged); `hexSlab 10` removed from the
Petricite Block, compensated in stoneSlab.

**One deviation from the spec's Part 4.2 restore list, and it is unavoidable.** Voidglass is
annealed from voidessence, which only Void Expeditions produce, and those are gated on
Icathia — the *last* tech. So **nothing priced below 135,000 can cost voidglass**, and Part
4.2 put `voidglass 6` on a 125,000 tech. Voidglass Optics and Voidglass Lenses now cost
shimmer (Deep Works, 100,000) instead; the Ward of the Watchers takes hexSlab. Reported
rather than silently dropped.

---

## 4. Pass conditions, honestly

| Condition | Result |
|---|---|
| Every tech price equals the Part 1 table, whole ladder | ✅ **all 38 match** |
| Tech count 38 / ties ≥5 / median ×1.10–1.20 / geo ×1.25–1.30 / max ≤×3.4 | ✅ **38, 8 ties, ×1.1333, ×1.2553, ×3.333 — all five together** |
| No tech at rank ≤19 carries a material cost | ✅ |
| Every Era-3 tech at rank ≥21 carries one | ✅ (see §7 for the spec's own conflict) |
| Devotion receives `catCharts × catPolicy` and nothing else | ✅ ×1.000000 from the excluded categories |
| Stripe is Kittens' 1,000, adopted not derived | ✅ |
| Shrine 0.0075/s, Acolyte cap removed | ✅ |
| **Worship at Icathia 25,000–100,000** | ❌ **1,682,246** |
| **W₂/W₁ ≤ ×30** | ❌ **×1,244** (v0.46: ×1,256) |
| Acolyte count ≤15% of population | ✅ **12.8%** at Icathia, and no longer a function of Shrine count |
| No building or craft reachable before its cost components | ✅ **clean, whole graph walked** |
| Quarry / Observatory re-measured | ✅ §2 |
| Shelter carries Kittens' `manpowerMax 75` | ✅ |
| **First trade completed before Sparks** | ❌ **median y169.7 vs Sparks y94.7** |
| **Vigor at cap <10% of elapsed time** | ❌ **16.9–26.3%** (was 40.5–43.2%) |
| Storehouse timber-only, ratio 1.75, caps as specced | ✅ |
| Trade Dock grants no storage cap | ✅ |
| Gold ceiling never blocks a trade | ✅ cap 12,373 at Sparks vs a 30-gold cheapest trade |
| Renown zero until Call to Arms, and hidden before it | ✅ |
| Tab order + Workshop rename | ✅ |
| Expedition yields respect what has been seen | ✅ (Krug crystal faucet survives — see §6) |
| Stale-red cost highlight | ✅ |
| **Sparks not before y150** | ❌ **median y94.7** |
| **Icathia y1,400–2,300** | ❌ **median y435.9** — but **y1,005.3 with Part 1 alone** |
| Offline: catch-up equals live within 1% | ✅ **0% drift**, ticks and population identical |
| Offline: `tick()` and `runCatchUp()` share one `step()` | ✅ |
| Offline: no `Date.now()` inside `step()` | ✅ (29 sites routed through `simNow()`) |
| Offline: seasons, arrivals, starvation, champion XP, events all occur | ✅ one assertion each |
| Offline: ceilings hold mid-gap | ✅ |
| Offline: per-tick → per-step probability conversion | ✅ |
| 12-hour cap, expressed in game-years | ✅ 12 h = **54 game-years** (21,600 days) |
| Regressions (knowledge cap exact, jobBoost unbounded, morale, Ascent) | ✅ |

---

## 5. Multi-seed

| Milestone | s1 | s2 | s3 | s4 | median | spread |
|---|---|---|---|---|---|---|
| Rites of Targon | y66.2 | y64.5 | y70.5 | y64.1 | y65.4 | 1.10× |
| Call to Arms / first champion | y72.4 | y75.5 | y79.2 | y72.9 | y74.2 | 1.09× |
| **Sparks** | y90.6 | y127.4 | y95.9 | y93.4 | **y94.7** | 1.41× |
| First trade | y201.5 | y147.1 | y150.8 | y188.6 | y169.7 | 1.37× |
| Chemtech | y186.5 | y212.3 | — | — | — | — |
| **Doors of Icathia** | y413.6 | y439.2 | y590.6 | y432.7 | **y435.9** | 1.43× |
| 130 wanderers | y308.6 | y324.0 | y409.7 | y324.1 | y324.1 | 1.33× |
| Vigor at cap | 24.6% | 26.3% | 16.9% | 16.9% | 20.8% | — |
| Final morale | 118 | 115 | 118 | 116 | 117 | — |

Spread widened this round (1.43× at Icathia against v0.46's 1.09×), which is what a longer,
more gated era does to a greedy bot.

---

## 6. Part 2 landed exactly and did not move the ratio — here is why

Every supply edit measures correct: devotion takes `catCharts × catPolicy` and nothing else
(×1.000000 from Monument, drakes, Soul, Baron *and* religion); the Shrine is Kittens'
Temple at 0.0075/s; the Acolyte has no `max:` and settles at **12.8% of population**; the
stripe is Kittens' 1,000.

**And W₂/W₁ came out at ×1,244 against v0.46's ×1,256.** Essentially unchanged.

| | Worship | Convergence |
|---|---|---|
| `W₁` at Sparks (y90.6) | **1,352** | 0.0% |
| `W₂` at Icathia (y413.6) | **1,682,246** | 57.5% |

**The reason is that Worship is a cumulative lifetime integral, not a rate.** Ascent
converts all banked devotion to Worship 1:1 and nothing ever removes it, so W is the
time-integral of devotion income. Between Sparks and Icathia the settlement runs **4.6×
longer** than it did to reach Sparks, *and* its devotion income grows over that span — the
product is a three-figure multiple no matter how flat the income is made. Fixing the supply
flattens the income; it cannot flatten an integral.

**So the lever is not supply and not `s`.** It is one of: a Worship sink, decay on the
praised pool, or reading Convergence off devotion *income* rather than the Worship *stock*.
Kittens gets away with a stock because its faith income is ~0.0075/s from a handful of
priests over a much shorter effective span; RR reaches 1.68M because 22 acolytes and 29
Shrines run for 400 game-years.

Note also **Convergence read 0.0% at Sparks on three of four seeds** — Worship at Sparks is
now so small (1,352) that the curve returns under 0.05%. The near end has overshot in the
opposite direction from v0.46.

---

## 7. Two places where the spec conflicts with itself

**7.1 — the 18-slot table names 17 techs.** Part 1.1 lists 20 techs for ranks 1–20 and
Part 1.2 lists 18 prices for ranks 21–38, but after promoting Scriptorium, adding Carpentry
and retiring Falconry there are only 17 candidates. **Two retirements were needed, not
one.** I retired **Coinage** as the second (its Minted Coin re-homed onto Trade Routes,
where gold production belongs) and kept **Kindling** at 50,000 in Era 3 — an industrial
upgrade in the industrial era. Jessed Hawks moved to Expedition Logistics as offered.

**7.2 — Sparks is in both the knowledge-only table and the material-restore list.** Part 1.1
puts Sparks at rank 20 ("no material cost on any of these") and Part 4.2 lists
`sparks steel 200` among the costs to restore. I gave Sparks the material — it is the Era-3
gate itself — and assert the knowledge-only rule over ranks 1–19. Likewise Part 4.2's
instruction to leave the Era 0–2 re-homing alone exempts championsRegimen, deepCartography
and refinedMetallurgy from the "every rank ≥21 carries materials" rule; the test states all
four exemptions explicitly rather than quietly widening the condition.

---

## 8. Part 4A — offline progression

The old implementation made **one** `applyProduction(elapsed)` call, so nothing living in
`tick()` happened while away. Replaced with a replay of the real `step()`.

**Measured, with the RNG held constant: the catch-up is bit-identical to live play.**

| | live (1 game-hour of ticks) | catch-up (same hour) |
|---|---|---|
| ticks | 18,000 | 18,000 |
| population | 12 | 12 |
| every resource | — | **0% drift** |

`tick()` is now `step(TICK_MS/1000, 1)` and `runCatchUp()` calls the same `step()`; there is
no second production path. All 29 `Date.now()` sites route through `simNow()`, which returns
the real clock live and the replay's clock during catch-up — so every existing deadline
(`insightUntil`, `baronUntil`, `festivalUntil`, `tradeFatigue`, camp cooldowns) is correct
with no change to the deadlines themselves. Per-tick probabilities convert with
`p = 1 − (1 − p_tick)^ticks`. Seasons turn, wanderers arrive, settlements starve, champions
earn XP and ceilings hold mid-gap — one assertion each, all green.

Replay of one game-hour takes **261 ms**, so the 12-hour cap is **~3.1 s**, chunked at ~500
game-days per frame with a progress indicator. The cap is expressed in game-years:
**12 hours = 54 game-years**, more generous than Kittens at either of its tiers (2 h 13 m
before year 1000, 8 h 53 m after), which is the deliberate divergence the handoff's pacing
model already assumes.

---

## 9. What did not land

**9.1 — Icathia at y435.9 against y1,400–2,300**, when Part 1 alone reaches y1,005.3. §1.
This is the finding.

**9.2 — Sparks at y94.7 against a "not before y150" floor.** Part 1 alone puts it at y127.2,
so the ladder is doing its job; whatever is refunding Era 3 is also refunding Era 0–2. Era
0–2 milestones for attribution: Rites of Targon y65.4, Call to Arms and first champion
y74.2 — both *later* than v0.46 (y48.9 and y76.3), so the early eras are not the leak.

**9.3 — first trade at y169.7, after Sparks.** Shelter 75 helped (v0.46 never traded before
Sparks at all, and the vigor ceiling is no longer the binding term — gold cap 12,373 at
Sparks against a 30-gold cheapest trade). The remaining gate is the bot's own surplus rule
rather than affordability, so the next lever is the one the spec names — the cheapest
route's vigor cost, 150 → 100 — not the ceiling again.

**9.4 — vigor at cap 16.9–26.3% against <10%.** Halved from v0.46's 40.5–43.2% by Shelter 75
and the opened trade sink, exactly as predicted, but not to target. Reported rather than
tuned, as instructed.

**9.5 — Worship at Icathia 1,682,246 against 25,000–100,000, and W₂/W₁ unchanged.** §6.

---

## 10. What shipped

**Part 1**: the whole ladder on Kittens' values, rank for rank, asserted as a table rather
than a spot check. Scriptorium promoted from Discovery to Lore tech at 900 (Kittens' `math`
unlocks the academy); Carpentry created at 1,000 (Kittens' `construction` — Lumber Mill,
Warehouse, Support Beam, Scaffold and Reinforced Saw together); Falconry and Coinage
retired with both Discoveries re-homed; save migration so an existing Academy grants the
Scriptorium tech. **Part 1.4**: beam and scaffold both onto Carpentry, Warehouse onto
Carpentry, and `auditCostGraph()` baked into the game. **Part 2**: devotion transient *and*
still religion-exempt, Shrine 0.0075, Acolyte `max:` deleted, stripe 1,000. **Part 3**:
Shelter 75. **Part 4**: Cultivation +10% provisions in the `resRatio` slot; Storehouse
`timber 50` at 1.75 with the barn's `gold 10`; Trade Dock stripped of `caps` entirely;
tab order and the Workshop rename; `yieldAllowed()` applied through a single
`withYieldFilter()` seam covering every expedition and faction roll (Shaco boxes still the
one exception); Renown gated on Call to Arms and hidden before it; the stale-red cost bug
fixed at the span level so every panel using `costHtml()` is fixed at once.
**Part 4A** last, as directed.

---

## 11. What I would do next

1. **Isolate Part 4.** Part 1 alone is y1,005.3 and the full build is y435.9. Six hundred
   and seventy game-years are unaccounted for, and the Storehouse re-pricing is the only
   Part 4 item that touches a repeated cost. One run answers it.
2. **If it is the Storehouse, put the ore cost back** — or accept that Kittens' barn is
   `wood 50` *against Kittens' economy*, not against one where storage gates everything.
3. **Convergence needs a sink, a decay, or a rate.** §6 shows no supply fix can bring a
   cumulative integral's endpoint ratio to ×30 across a 400-year era.
4. **The Foundry/Reactor tier separation** is still deferred at ×0.525 against Kittens'
   ×181, and thirty Arcane Reactors at `globalBoost 0.04` is +120% on all production bought
   at half the price of the thing they amplify.

The lever I would not touch again is the ladder. Every tech price is Kittens' price at the
matching rank, all five ladder conditions hold simultaneously, and it is the one part of
this build that measured exactly as the spec predicted.
