# BUILD REPORT — Runeterra Reclaimed v0.44

Every item in BUILDER SPEC v0.44 is implemented, in the Part 4 order, plus all six of
Jerry's developer gameplay notes. **610 assertions across 12 suites, 0 failures**
(v44 contributes 63).

**Era 3 completes for the first time.** The Doors of Icathia land at **y181.4**.

That is the headline and it is also the problem, and Jerry's directive 3 is what makes
it legible: the number to scrutinise is not the year, it is what the settlement had
built when it got there. So the two named numbers come first, and one of them says
**the Part 1 premise is measured against the wrong baseline**.

---

## 0. The number that changes the round: ore is ×252, not ×53

Part 1's table puts RR's multiplier stack at ≈×53 against Kittens' ≈×870, and asks for
three new categories to close a 16× gap. Measured on the shipped build at Icathia,
category by category, exactly as Part 4 asks:

| Category | Ore | Timber |
|---|---|---|
| Tool upgrade (Zaunite Drills / Sharpened Axes) | ×1.50 | ×1.40 |
| Masterwork Tools | ×1.25 | ×1.25 |
| Village (champion Settlement Stewards) | ×1.12 | ×1.12 |
| **Building jobBoost** (Mine, Quarry, Augment Chamber / Lumber Mill) | **×23.05** | **×3.90** |
| Census rank | ×1.139 | ×1.137 |
| **Resource global ratio** (Part 1.3, new) | ×1.25 | ×1.25 |
| **Monument** (globalBoost buildings, Part 1.2 Reactors included) | ×2.75 | ×2.75 |
| Celestial Charts | ×1.10 | ×1.10 |
| Religion (Convergence) | ×1.064 | ×1.064 |
| Infernal Drake | ×1.30 | ×1.30 |
| Dragon Soul | ×1.25 | ×1.25 |
| Policy | ×1.06 | ×1.06 |
| **Morale** | **×0.66** | **×0.66** |
| **Product** | **×252.16** | **×39.77** |

At Sparks the same lines read **ore ×5.13, timber ×4.27** — the whole of Era 3's growth
happens inside Era 3, which is right.

**Three things fall out of this table.**

**1. `buildingJobBoost` is an unbounded additive category and it is 91% of the ore
stack.** Mine +20%, Quarry +35%, Augment Chamber +15%, summed flat per copy with no
ceiling. At Icathia that is +2,205%. Every *other* category in the game — all twelve of
them, including everything Part 1 added — multiplies to ×10.9. The Part 1 table does
not list this category at all, which is why it read RR as ×53. RR was never 16× short
of Kittens; it was carrying one category that overshoots by roughly the same factor the
other twelve are short by.

**2. The ore and timber lines are not comparable, and the gap is structural.** Ore has
three jobBoost buildings; timber has one (Lumber Mill, +10%). ×23.05 against ×3.90 from
the same category. That asymmetry is why "income is too small" kept measuring as a
*timber* problem in v0.42 and v0.43 — it was never the whole economy, it was one line
of it.

**3. Morale is a ×0.66 production divisor at Icathia**, and it is the only term in the
table below 1. Population runs to 412 by y250 against 54 Taverns; morale sits at 35–46.
The housing ladder from v0.43 works so well that overcrowding is now the tax.

---

## 1. Science building counts at Icathia — Jerry's directive 3

Target 30 Archives / 30 Academies / 25 Observatories / 13 Hexcore Laboratories.

| | target | measured at Icathia |
|---|---|---|
| Archives | 30 | **43** |
| Academies | 30 | **22** |
| Observatories | 25 | **41** |
| Hexcore Laboratories | 13 | **38** |

Three of four overshoot and one undershoots, and the *shape* is the tell. The cheap
early building (Archive) and the two Era-3 buildings (Observatory, Hexcore Lab) are all
over, while the mid-game Academy is under. That is a settlement that never had to
choose: with ore at ×252 and the knowledge ladder cut 9–37×, science buildings stopped
being an investment and became something you buy because there is nothing else to spend
on. Kittens' 30/30/25/13 is the stock of a player who had to *ration*.

**Arcane Reactors: 7 at Icathia against the ≥25 pass condition. Hexdraulic Plants: 0
against ≥8. Hextech Foundries: 2.**

I gave the bot an explicit save-for-it rule for all three, the same treatment housing
gets, after measuring **0 Foundries and 0 Plants** without it. It moved 0→2 and 4→7.
The constraint is not the bot's priorities, it is that **Era 3 lasts 86 game-years** —
Sparks y95.1 to Icathia y181.4. There is no time to build a 200-Hexgear Foundry, let
alone 25 Reactors, before the era it belongs to is over.

---

## 2. Pass conditions, honestly

| Condition | Result |
|---|---|
| Era 3 completes at all | ✅ **first time ever — y181.4** |
| Sparks y350–500 | ❌ **y95.1** |
| Doors of Icathia y1,400–2,300 | ❌ **y181.4** |
| Science counts near 30/30/25/13 | ❌ 43 / 22 / 41 / 38 |
| Arcane Reactor ≥25 by Icathia | ❌ 7 |
| Hexdraulic Plant ≥8 | ❌ 0 |
| Population 130 by y600 | ✅ y164.3 |
| Largest tech step ≤ ×1.5 | ❌ ×2.50 (Almanac→Cultivation, Era 0, Kittens' own value) |
| Median step ×1.10–1.20 | ❌ ×1.25 |
| Ore held when a Longhouse is wanted exceeds its price | ✅ inverted, by a wide margin |
| Morale below 90 for ≥10% before y50 | ✅ 44% |
| No champion at level 10 before Era 3 | ✅ |
| First champion before y120 | ✅ y27.1 |

**Part 1 and Part 2.5 shipped together as Jerry directed, and that was the right call —
it is what makes this diagnosable.** Had the ladder come down alone we would be looking
at a fast Era 3 and blaming the prices. Both halves landed and Era 3 is still 86 years,
which points at neither: it points at the category the table above found.

---

## 3. Jerry's directive 2 — the three Era-2 bridge techs

**My recommendation is to keep all three, and the reason is a number rather than a
preference.** The ladder around them now reads:

| Tech | Science | Step |
|---|---|---|
| Call to Arms | 14,000 | — |
| The Champions' Regimen | 15,500 | ×1.107 |
| Deep Cartography | 17,000 | ×1.097 |
| Refined Metallurgy | 18,500 | ×1.088 |
| Sparks Beyond the Wall | 20,000 | ×1.081 |

Those four consecutive steps are the flattest stretch in the game — and **Kittens'
median step is ×1.12**, so this is the most Kittens-shaped part of RR's ladder, not the
least. RR's overall median is ×1.25, above the spec's own ×1.10–1.20 target. Dropping a
rung here moves RR away from the target it is being measured against.

The honest criticism is content, not spacing: Champions' Regimen unlocks only Standing
Orders and Deep Cartography only Surveyed Approaches. Refined Metallurgy carries the
Bloomery and is safe. If one has to go, **Deep Cartography** is the thinnest — but the
better fix is more rungs elsewhere, since 35 science-costed techs against Kittens' 61 is
where the ×1.25 median actually comes from.

---

## 4. What shipped

**Part 1.1 — the amplifier pair.** `perTick *= 1 + (magnetoRatio × swRatio)`, with
`swRatio = 1 + 0.15 × plants`, applied to the Hextech Foundry only. Measured: 30
Foundries alone are ×2.80; with 20 Plants, ×8.20. Plants with no Foundry do nothing;
the Plant does not touch the other monuments. Hexdraulic Plant at ratio 1.25 on
Hexdraulics.

**Part 1.2 — the Reactor tier.** Arcane Reactor, ratio 1.15, `globalBoost 0.04`, gated
on Grey Reclamation, priced in Hextech Cores / Hexcrete / Focused Hexcrystal.

**Part 1.3 — the per-resource global category.** Sump Ventilation (+25% ore), Seasoned
Timberworks (+25% timber), Hexresonance (+25% mana), each in its own multiplicative
slot, each verified not to leak into the other lines.

**Part 2.1 — the content gate.** `CHAMP_RUNG_GATE`, ratio 1.6 → 1.5. Ladder 250 … 9,611,
cumulative **28,333**. Rungs 8–10 want Hexgear, 4 Hextech Cores, then 10 Cores plus
Hexcrete. The gate *adds* to a signature material and never replaces it.

**Part 2.2 — the ceiling.** `caps.renown *= Math.sqrt(masonryMult)`, Hall of Heroes
120 → 250. Measured ×3.5496 at Chemtech Silos against the full line's ×12.6; materials
still take the full line.

**Part 2.5 — the ladder.** All eighteen Era-3 and bridge prices on the spec's table.
Call to Arms → Sparks was ×14.29, is now **×1.429**. Zero steps above ×3, monotonic
along every prerequisite chain.

**Part 2.5.2 — Scholarship leaves the knowledge cap.** ×1 on knowledge, ×3.99 on
culture, and the descriptions are generated from `SCHOLAR_CAPS` so the prose moved with
the code — the v0.43 Part 0 invariant held through the change, which is what it was
built for. Without that fix the tooltips would now be promising a Knowledge multiplier
that no longer exists.

**Part 3 — not set, per the spec.** Measured Convergence is **0.91% at Sparks** against
the 5–8% target. The stripe is not the reason: the input moved again, harder than
before. `s = W₁/15` requires knowing Worship at Sparks, and Sparks moved from y958 to
y95. Re-deriving it now would be the fourth time against a moving input.

**Gameplay notes 1–6, all six.** Wanderer cap starts at 0 (a camp with no roof houses
nobody; Channel Mana → Transmute → the first Shelter still bootstraps cleanly).
Wanderers tab hidden until the first Shelter, Lore tab until the first Archive, with a
fallback so an active tab that goes out of view lands on Settlement rather than a blank
panel. The Census is now the **Keeping the Rolls** lore unlock at Songcraft, 60 Culture
— before it the tab tells you how to get it. Chronicle events fire only on resources
the settlement has actually held, bounded to 1–5% of that resource's storage. The boxes
are 70/30 positive, tricks cut from 10% of a stockpile to 2%, six new treat lines, and
the boxes stay the one deliberate exception to the unlocked-resources rule — a Shaco
box producing something nobody has seen is the joke working. Measured over 600 boxes:
342 gifts, 164 tricks.

---

## 5. What I would do next, and what I did not do

I have not tuned anything beyond the spec, and specifically I have **not** touched
`buildingJobBoost` — that is the one-lever discipline and it is also the largest lever
in the game, so it belongs in a spec rather than in a build.

If §0 is right, the next round is not more multiplier categories. It is:

1. **Bound `buildingJobBoost` with `limitedDR`**, the way camp yields, craft yields and
   the boost stacks already are. It is the last unbounded additive stack in RR and it is
   worth ×23 on ore.
2. **Give timber the same number of jobBoost buildings ore has**, or take two off ore.
   ×23.05 against ×3.90 from one category is not a design, it is an accident.
3. **Then** re-measure Era 3's length before touching prices again — with the ore
   category bounded, the re-priced ladder may be close to right rather than 10× fast.

The measurement that keeps pointing there is the same one as last round, inverted: in
v0.43 the settlement held 113 ore against a 344-ore Longhouse. It now holds 8,266 ore
per second. Nothing in between was ever tried.
