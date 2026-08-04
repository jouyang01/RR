# BUILDER SPEC v0.46 — the buildings are priced one craft tier shallow

Measured against `index_45.html`, verified line by line. Every Kittens value below was
read from `nuclear-unicorn/kittensgame` in this session.

**Your §0 is the best section any build report has had, and §2 and §7 both overturn
things I wrote.** Part 0 concedes four items, three of which are mine and one of which is
a pass condition I constructed badly enough that you failed a test you had passed.

Your §11.1 says every miss traces back to 9,215 ore/s. It does, but not the way either of
us assumed. **RR's ore income is close to Kittens'. RR's ore-side buildings are priced
between 23× and 339× shallower than Kittens', so income converts into more income instead
of into progress.** That is Part 1, it is arithmetic rather than judgement, and it
explains the science overshoot, the 115-against-40 building asymmetry, and Era 3 clearing
in a sixth of its target with one change.

Jerry's directives — vigor as the catpower analogue, and trades gated on gold and vigor —
are Parts 2 and 3, and Kittens turns out to specify both almost completely. **Part 5A**
answers the design review on Discoveries and visibility: its axis diagnosis is right, its
recipe diagnosis is wrong, and acting on the second would move RR away from the source.

---

## Part 0 — Four concessions

**0.1 — You are right about paragon and CMBR, and my Part 1 justification was wrong for
three of the four categories it removed.** I checked. `game.js:3449`
(`perTick *= 1 + paragonProductionRatio`) and `:3495` (`getCMBRBonus`) sit at base
indentation with no `res.transient` test; only magneto (`:3471`) and the reactor
`productionRatio` line (`:3485`) are guarded. Kittens applies paragon and cosmic
radiation to science and culture. **So excluding `catDrake`, `catSoul` and `catBuff` from
knowledge is an RR divergence, not Kittens parity, and the spec should never have cited
the source for it.** Keep it — it is worth ×1.625 at Icathia and it errs toward slowing a
game that is six times too fast, which is the safe direction under Jerry's rule. Your
comment in `computeRates()` is the correct record. `catMonument` leaving *is* parity, and
that is the large one.

**0.2 — Your §2 is right and my Part 7 inference was backwards.** Chain depth multiplies
raw cost faster than craft yield divides it. I had the multiplier direction right and the
conclusion inverted. `effcost.mjs` is the correct permanent answer and Part 1 below is
built on top of it — but see Part 4, because the direction the numbers point is not the
one your §2 implies either.

**0.3 — The geometric-mean condition was mine and it is impossible alongside the
directive that produced it.** Your closed form is correct: `geo = (max/min)^(1/(N−1))`
depends only on the tech count, so "add 8–10 branches" and "geometric mean ×1.25–1.30"
cannot both hold. **The condition is withdrawn, and so is the instruction that broke it.**
Part 5 says what I should have written.

**0.4 — I compared your Sparks measurement against a full-line formula, and the 51%
"miss" in your §8 is my table's fault, not the build's.** `4.2 × (1 + 0.195N)` is the
value with all six axes and all five saws owned. At Sparks a settlement holds three axes
and two saws: `2.7 × (1 + 0.14 × 15) = 8.37`. **Your measured 8.37 is exact.** The line
is not back-loaded relative to its design; my pass condition failed to say which point on
the line it was measuring. Part 8 restates it properly.

Three things you shipped that I want on the record: re-pointing `simcore.mjs` at the
game's own `jobBoostPerCopy()` before measuring (§0.4) is the single most valuable thing
anyone has done to this harness; catching your own false culture-leak by re-measuring
with a building that has no `prod` (§0.3) is exactly the discipline this project needed
four rounds ago; and four seeds with a 1.04× spread at Icathia finally makes the pacing
numbers arguable.

---

## Part 1 — The ore-side buildings cost 4× a Mine where Kittens' cost 1,400×

This is the round. Everything else is downstream.

### 1.1 The measurement

RR's craft chain is already at Kittens parity — `stoneSlab ← ore 200` against
`slab ← minerals 250`, `beam ← timber 150` against `beam ← wood 175`,
`scaffold ← beam 40` against `scaffold ← beam 50`. Nothing is wrong with the recipes.

The building prices are the divergence. Effective raw units, craft yield ×3.0 applied at
every tier in both games so the ratio is internal to each and no cross-game income
assumption is needed:

| | Kittens | RR v0.45 |
|---|---|---|
| Mine | `wood 100` → **100 raw** | `timber 100, ore 150` → **250 raw** |
| Quarry | `slab 1000, steel 125, scaffold 50` → **140,278 raw** | `timber 300, ore 400, stoneSlab 5` → **1,033 raw** |
| **Quarry as a multiple of Mine** | **×1,403** | **×4.1** |
| Observatory | `iron 750, science 1000, slab 35, scaffold 50` → **52,278 raw** | `ore 750, knowledge 1000, stoneSlab 35, beam 50` → **5,583 raw** |
| **Observatory as a multiple of Mine** | **×523** | **×22.3** |

**RR's Quarry is 339× shallow. RR's Observatory is 23× shallow.**

The mechanism is one substitution repeated across the build: **RR prices in the first
craft tier where Kittens prices in the second.** Kittens' Quarry asks for a thousand
slabs; RR's asks for five. Kittens' Observatory asks for fifty *scaffold* — 16.7 beams
each, 972 wood each, 48,611 wood in total — where RR's asks for fifty *beams*, 2,500
timber. One word, a factor of 19.

That is why the settlement owns 55 Quarries and 45 Observatories. Not because ore income
is too large — **RR's ore category at the measured counts is only 18% above Kittens' at
the same counts** (`1 + 0.25×60 + 0.40×55 = 38.0` against Kittens'
`1 + 0.20×60 + 0.35×55 = 32.25`). The category is right. The things it buys are free.

### 1.2 The fix: Kittens' recipes, RR's nouns

```js
// v0.46 Part 1. Kittens' own building prices, transliterated. minerals->ore,
// wood->timber, slab->stoneSlab, iron->ore, science->knowledge. Ratios unchanged.
{ id: "mine",        cost: { timber: 100 },                                    ratio: 1.15 },
{ id: "quarry",      cost: { stoneSlab: 1000, steel: 125, scaffold: 50 },      ratio: 1.15 },
{ id: "observatory", cost: { ore: 750, knowledge: 1000, stoneSlab: 35, scaffold: 50 }, ratio: 1.10 },
{ id: "hexcoreLab",  cost: { knowledge: 1500, stoneSlab: 100, plating: 15, alloy: 25 }, ratio: 1.10 },
```

- **Mine loses its ore cost.** Kittens' Mine is `wood 100` and nothing else. This matters
  more than it looks: the Mine is the denominator every other price is judged against,
  and RR's being 2.5× Kittens' compresses the whole ladder.
- **Quarry becomes Kittens' Quarry.** Effective raw ≈ **100,000 + steel**, against a
  100-raw Mine: **×1,000**, inside Kittens' ×1,403 once the steel term is counted.
- **Observatory: `beam 50` → `scaffold 50`.** Effective raw 5,583 → **36,417**, ×364
  against the Mine. Kittens is ×523; the residual is the `iron 750` term, which RR pays
  in ore.
- **Hexcore Laboratory becomes Kittens' Biolab.** RR's current
  `scaffold 6, plating 10, hexgear 4, gold 400` **has no knowledge cost and no slab
  cost at all** — Kittens' Biolab asks `science 1500, slab 100, plastic 15, alloy 25`.
  That omission is why 47 got built against a target of 13.

**Archive (`timber 40, mana 50` vs library `wood 25`) and Academy (`timber 100, ore 140,
mana 150, knowledge 80` vs academy `wood 50, minerals 70, science 100`) are both already
at or above Kittens.** Leave them. Their counts — 44 and 32 against targets of 30 — are
the closest of the four, which is consistent.

### 1.3 What this predicts, and why it is one lever not four

All four edits are the same edit: restore the craft tier Kittens prices at. They cannot be
measured separately because the Quarry feeds the ore income that buys the Observatory.

- **Science stock should fall toward 30 / 30 / 25 / 13** without touching the knowledge
  cap, the knowledge rate or the ladder — all three of which are now at parity and none
  of which moved it.
- **Ore : timber should fall toward 2.0** without touching either line's composition,
  because the settlement stops being able to afford 115 ore buildings against 40 Mills.
  Your §8.2 already proved this: at equal N the spec's own formulas give 2.03.
- **Era 3 should lengthen substantially.** I am not putting a number on it. My last two
  predictions were out by 5× and 10× in the same direction, and the honest position is
  that I do not know how much of the 157 years is price and how much is income.

### 1.4 One measurement I need before I can price anything else

Your §11.1 quotes 9,215 ore/s. **Decompose it: job income, building autoprod, and
converter output, as three numbers at Sparks and at Icathia.** Kittens adds
`perTickAutoprod` at `game.js:3466` — *after* `mineralsRatio` is applied at `:3433` — so
autoprod in Kittens bypasses the Mine/Quarry category entirely and is multiplied only by
paragon, the leader rank and magneto. If RR's ore autoprod is being multiplied by the
×38 building category, that is a second structural divergence hiding inside the same
number, and I cannot tell from the source alone.

---

## Part 2 — Vigor becomes catpower (Jerry's directive 1)

Kittens specifies this almost completely, and RR diverges on four of the five points.

### 2.1 Kittens' catpower, complete

| Property | Kittens | source |
|---|---|---|
| `transient` | **true** — no magneto, no reactor | `js/resources.js:120–126` |
| Production | hunter job only, `0.06/tick` = **0.30/s** | `js/village.js` job block |
| Passive per-kitten production | **none, anywhere** | — |
| Job multiplier | `manpowerJobRatio`: compositeBow 0.5, crossbow 0.25, railgun 0.25 → Σ 1.0 → **×2.0** | `js/workshop.js` |
| Cap | **housing buildings**: hut 75, logHouse 50, mansion 50 | `js/buildings.js:468, 486, 509` |
| Storage multipliers | **none** — `addBarnWarehouseRatio` covers catnip/wood/minerals/coal/iron/titanium/gold and not manpower | `js/buildings.js:953` |
| Sinks | hunt **100**; trade **50** | `js/village.js:1010`; `js/diplomacy.js:9` |

### 2.2 The four divergences, and the fix for each

**V1 — Delete the passive per-wanderer vigor line. This is the whole problem.**

```js
var vv = 0.05 * S.pop * (1 + boosts.vigor) * mor;
rates.vigor += vv;
track("vigor", S.pop + " wanderers training", vv);
```

At population 202 that is **10.1 vigor/s produced by wanderers who are not junglers**,
which is more than thirty-three junglers would make. Kittens has no per-kitten manpower
term anywhere; catpower comes from assigned hunters and from nothing else. **Delete the
block.** Vigor comes from junglers only, and the jungler is already at exact parity
(0.30/s against the hunter's 0.30/s).

**Check the bootstrap before you ship it.** Expedition Logistics costs 200 knowledge and
the cheapest expedition costs 100 vigor, so a settlement that researches Logistics and
assigns one jungler reaches its first hunt in 333 seconds. That should be fine, but it is
the one thing this change could deadlock and it is worth an explicit test.

**V2 — Vigor becomes transient.** `js/resources.js:124` marks manpower `transient: true`
with the comment *"cant be affected by magneto bonus"* — the same flag as science and
culture, which RR already honours.

```js
var TRANSIENT = { knowledge: 1, culture: 1, vigor: 1 };
```

This removes `catMonument` — the Foundry, the Hexdraulic amplifier and the Arcane Reactor
— from vigor income. You measured `catMonument` at ×2.75 at Icathia, so this is a ×2.75
cut on its own, and it is straight parity rather than a tuning choice. `boosts.vigor`
stays: Kittens' `manpowerJobRatio` is a job-tier category and champion passives and the
Cloud Drake sit in the same slot.

**V3 — Bound the job tier at Kittens' ×2.0.** `BOOST_LIMIT.vigor` is **1.5** → ×2.5 at
the asymptote. Kittens' `manpowerJobRatio` sums to exactly 1.0 → ×2.0. Set
**`BOOST_LIMIT.vigor = 1.0`**. Cloud Drake (up to +1.00), Poppy (+0.15) and Solari
Discipline (+0.12) currently sum to 1.27, which lands at ×2.22 today and ×1.92 after —
inside Kittens' ceiling.

**V4 — Move the cap onto the housing buildings.** `caps.vigor += 15 * S.pop` ties the
ceiling to a population number Part 3 of the last spec exists to control. Kittens puts it
on the buildings:

```js
{ id: "shelter",   pop: 2, caps: { vigor: 40 } },   // Kittens hut:      maxKittens 2, manpowerMax 75
{ id: "longhouse", pop: 1, caps: { vigor: 50 } },   // Kittens logHouse: maxKittens 1, manpowerMax 50
{ id: "skyrise",   pop: 1, caps: { vigor: 50 } },   // Kittens mansion:  maxKittens 1, manpowerMax 50
```

At the Part 3 target stock — ~35 Shelters and ~45 Longhouses — that is **3,650 cap**
against the 3,030 the current rule gives at population 202. Same magnitude, but it is now
a building decision rather than a side effect of population, and it stops growing when
housing stops.

**Vigor stays in `CAP_MULT_EXEMPT`, and now for a sourced reason rather than an assumed
one.** `addBarnWarehouseRatio` (`js/buildings.js:953`) enumerates the resources storage
upgrades touch and manpower is not among them. The old justification — "Renown has no
Kittens equivalent" — was about Renown; vigor's exemption is parity in its own right.
Update the comment; the two exemptions now have two different sources.

---

## Part 3 — Trades cost gold *and* vigor (Jerry's directive 2)

Jerry asks for gold-gated or vigor-gated. **Kittens does both, as a hard AND, and has
since the beginning.**

```js
// js/diplomacy.js:8-11
defaultGoldCost: 15,
defaultManpowerCost: 50,

// :893  every trade checks all three
hasMultipleResources: function(race, amt){
    return (this.game.resPool.get("gold").value >= this.getGoldCost() * amt &&
        this.game.resPool.get("manpower").value >= this.getManpowerCost() * amt &&
        this.game.resPool.get(race.buys[0].name).value >= race.buys[0].val * amt * this.getTradeVolume());
}
```

Every Kittens trade costs **50 catpower + 15 gold + the route's trade good**. RR's trades
cost a trade good and vigor, and **no gold at all**.

### 3.1 The numbers

Kittens' gold-to-catpower ratio is **15 : 50 = 0.30**. Apply it to RR, and raise the vigor
side ×3 — because the passive vigor line is going away and because an RR trade is a
caravan where a Kittens trade is a transaction:

| Route | vigor now | **vigor** | **gold** | good (unchanged) |
|---|---|---|---|---|
| The Freljord | 50 | **150** | **45** | ore 500 |
| Piltover | 50 | **150** | **45** | steel 80 |
| Demacia | 75 | **225** | **68** | timber 600 |
| Noxus | 75 | **225** | **68** | plumes 120 |
| Bilgewater | 100 | **300** | **90** | hexSlab 40 |

Gold is the right second gate for RR specifically: it comes from exactly one source
(`miner`, 0.008/s alongside 0.25 ore), so it is genuinely scarce in Era 0–1 and abundant
by Icathia — which is the shape Kittens' 15 gold has, binding early and forgotten late.

### 3.2 Give both costs a discount line

Kittens does not leave the cost flat — `tradeCatpowerDiscount` (the `diplomacy` policy,
−5) and `tradeGoldDiscount` (`isolationism`, −1) reduce it, and
`dragonRelationsDynamicists` gives another −5. Subtractive, not multiplicative, so the
early relief is large and the late relief is nothing.

Add two RR upgrades in the same shape: one cutting **−40 vigor** per trade and one
cutting **−15 gold**, both subtractive, both floored at zero
(`return (cost < 0) ? 0 : cost`, `js/diplomacy.js:853`). Put them on Trade Routes and
Masquerade respectively so the relief arrives with the routes it applies to.

### 3.3 Keep trade fatigue

`FATIGUE_PENALTY 0.08` up to `FATIGUE_MAX 12` is an RR invention with no Kittens
equivalent, and it should stay. Kittens' anti-spam is purely the resource gate, which
works because catpower income is small and hunts compete for it. RR now has that too —
but fatigue is a *yield* penalty where the gate is a *frequency* limit, and having both
means a player who banks vigor for a burst is still paying for it. That is better than
either alone.

---

## Part 4 — Era-3 buildings: the tier separation is missing, and the absolute level is not the problem

Your §2 table, against Kittens' equivalents computed the same way:

| | nominal | effective raw | |
|---|---|---|---|
| Kittens Magneto | `gear 5, alloy 10, blueprint 1` | **20,867** | the amplifier tier |
| Kittens Reactor | `titanium 3500, plate 5000, concrate 50, blueprint 25` | **3,774,333** | the global tier |
| **Kittens tier separation** | | | **×181** |
| RR Hextech Foundry | 300 units | 119,252 | the amplifier tier |
| RR Arcane Reactor | 18 units | 62,595 | the global tier |
| **RR tier separation** | | | **×0.5** |

**Kittens' Reactor tier costs 181× its amplifier tier. RR's costs half.** That is the
defect — not the absolute level, which is why your §2's conclusion and my Part 7's
conclusion are both wrong in opposite directions. RR's Foundry is ~6× *more* expensive
than Kittens' Magneto; RR's Arcane Reactor is ~60× *less* expensive than Kittens' Reactor.

**Change neither price this round.** Part 1 re-prices the buildings that set the ore
income these two are bought out of, so any number set now would be measured against a
baseline that is about to move by an order of magnitude. What I want from this round is
the anchor: **report both buildings' effective-raw cost and their count at Icathia
against the ×181 tier separation**, and v0.47 sets them.

---

## Part 5 — The tech count: 38, and re-skew rather than add

Your §7 identity is right and it retires my instruction. `geo = 4500^(1/(N−1))` fixes the
mean by the count alone, so the two conditions were incompatible and the count was never
the thing that made Kittens' ladder feel the way it does.

**Kittens' shape is 36 techs, five exact ties, median ×1.13, geometric mean ×1.272.** The
median and the mean diverge because the *distribution* is skewed, not because the count is
high: three steps in ranks 1–16 are ×2.6 or larger (`calendar 30 → agriculture 100` at
×3.33, `agriculture → archery` at ×3.0, `writing 3,600 → philosophy 9,500` at ×2.64),
after which almost everything is between ×1.0 and ×1.4.

RR shipped 45. **Cut to 38** — keep the three branches that create the most useful ties
and retire the other seven, or re-parent them as upgrade unlocks that cost no knowledge.
38 gives a geometric mean of **×1.2553**, inside the band, with room for five ties.

Then **re-skew the surviving ladder to Kittens': make the first three steps ×2.5–×3.5 and
flatten everything after Songcraft.** That is what produces a ×1.13 median at 38 techs,
and it is what I should have specified instead of "add 8–10 side techs."

Your judgement to ship all ten and name the trade-off was correct given what the spec
said. The instruction was wrong, not the execution.

---

## Part 5A — Discoveries and visibility (Jerry's design-review items)

I checked the design review's structural claims against `js/workshop.js`, `js/science.js`
and `js/buildings.js` rather than against the journey doc it was working from. **Its
diagnosis of the axis problem is right and its diagnosis of the recipe problem is wrong,
and the difference matters, because the restructure it proposes would move RR away from
Kittens rather than toward it.**

### 5A.1 The census

| | Kittens | RR v0.45 |
|---|---|---|
| Workshop upgrades / Discoveries | **~132** (152 named entries less ~20 craft recipes) | **73** |
| Unlocked by a research tech | 103 — **78%** | 70 — **96%** |
| Unlocked by **another upgrade** | 21 — **16%** | **0** |
| Unlocked by a building | 1 | 2 (`unlock:` predicates) |
| Other (resource state, challenge state) | ~9 | 0 |

Two corrections to the review before the prescription:

**Density is not the problem.** RR has 73 Discoveries, not "a dozen-ish" — the journey doc
undercounts by 6×. Against Kittens' ~132 across a tree that includes the entire space
program, RR at 73 across Eras 0–3 is proportionate. And after Part 5 trims the tech ladder
to 38, RR's discovery-to-tech ratio is **1.9:1** against Kittens' **132/64 = 2.1:1**.
**Do not add Discoveries for density.**

**Recipe unlocks are not Workshop upgrades in Kittens.** This is the load-bearing
correction. Craft recipes are unlocked by *science techs*, in `js/science.js`, through
`unlocks.crafts`:

```
writing -> parchment        theology -> compedium       navigation -> ship
machinery -> steel          physics -> blueprint        chemistry -> alloy
architecture -> concrate    electronics -> microchip    oilProcessing -> tanker
...and plastic, kerosene, thorium, eludium
```

And the base construction chain — `beam`, `slab`, `plate`, `scaffold`, `gear` — has no
tech gate at all: it arrives **all at once with the Workshop building**
(`js/buildings.js:1482`, `unlocks: { tabs: ["workshop"] }`). Kittens does exactly the
thing the review criticises RR for doing at Sparks.

**So RR's Lore tree is not doing double duty on recipes. It is doing what Kittens' Science
tree does.** Do not pull recipe unlocks out into Discoveries; that is a large, risky
restructure away from parity. The one thing Kittens' Science tree does *not* carry is
material cost — its techs are priced in science alone — and RR's Era-3 techs already carry
`steel 200`, `culture 1200`, `hexcore 10` and similar. **That** is the real double-duty,
it is small, and it is a one-line fix per tech: strip the material components from the
Lore ladder and move them onto the Discoveries the tech unlocks. Twelve techs carry
material costs today; audit them and re-home the costs.

### 5A.2 The axis that is genuinely missing: discovery chains

Kittens unlocks 21 upgrades from *other upgrades*, with no tech involved:

```
mineralHoes -> ironHoes            mineralAxes -> ironAxes
steelSaw    -> titaniumSaw         titaniumSaw -> alloySaw
expandedBarns -> titaniumBarns     concrete -> concreteWarehouses, concreteBarns, concreteHuts
```

**RR has none.** Every Discovery hangs off a tech. Convert **12 of 73 (16%, Kittens' own
share)** to chain off the previous rung instead, and the candidates are already sitting in
the build — the ladders v0.46 Part 2 and v0.45 Part 3 created:

```js
// A rung requires BOTH its tech and the rung below it — exactly steelSaw -> titaniumSaw.
{ id: "ironAxes",     tech: "smelting",          req: "sharpenedAxes" },
{ id: "steelAxes",    tech: "refinedMetallurgy", req: "ironAxes" },
{ id: "hexsteelAxes", tech: "sparks",            req: "steelAxes" },
{ id: "atlasAxes",    tech: "atlasGauntlets",    req: "hexsteelAxes" },
{ id: "voidsteelAxes",tech: "icathia",           req: "atlasAxes" },
// same for the five saws, and for the Shelter reducer ladder
```

Three reasons this is worth doing beyond parity: it makes the ladders legible as ladders
in the UI; it stops a player buying `voidsteelAxes` before `ironAxes` and wondering why
the number moved so little; and it gives Discoveries a prerequisite graph of their own,
which is the structural thing the review correctly identified as absent.

### 5A.3 The second missing axis: resource state

Kittens' `unlockRatio` is not just a building rule — it is a general "you have held 30% of
this" predicate. RR applies it to buildings (`buildingVisible`) and not to Discoveries.

**Extend it: a Discovery stays hidden until the player has held 30% of every component of
its cost**, with the same crafted-material exemption `buildingVisible` already carries.
This is a second axis at zero content cost, and it removes the Era-3 discovery list
appearing wholesale the moment a tech lands.

### 5A.4 Visibility gating — Jerry's three items, with the numbers

**Crafting tab.** Currently `show: S.seenMax.mana >= TRANSMUTE_COST`, so Transmute gates
it. Kittens gates its Workshop tab on **owning the Workshop building**
(`js/buildings.js:1482`). Match the intent:

```js
{ id: "crafting", name: "Crafting", show: function () {
    // Transmute is a conversion, not a craft. The tab appears when a real recipe exists.
    return CRAFTS.some(function (c) { return c.id !== "transmute" && (!c.show || c.show(S)); });
} },
```

**Shelter and Archive.** Kittens' `unlockRatio` is **0.3** on both the hut and the library
(`js/buildings.js:454, 529`), so its hut is visible at **1.5 wood** and its library at
**7.5 wood**. RR's existing 30% rule already yields **2.4 timber** for the Shelter and
**12 timber + 15 mana** for the Archive — the same 1:5 spacing Kittens has. So the TBD
numbers are, at parity, already implemented.

**One deliberate divergence, and here is why.** Kittens' hut becomes visible after ~17
seconds of one woodcutter. RR's opening has **no timber income at all** before the first
Shelter — wanderer cap starts at 0 and timber comes only from Transmute — so the 30% rule
fires while the player is still minutes from acting on it. Raise the Shelter alone:

- **Shelter: visible at 4 timber** (50% of its 8-timber cost)
- **Archive: unchanged at 30% — 12 timber + 15 mana**

Half a Shelter is a meaningful gate in an economy with no passive timber; a quarter of one
is not. The Archive keeps parity because RR's mana faucet makes its 30% a real wait.

**Loremaster.** This one is exact Kittens parity and should simply be copied. Kittens
unlocks the `scholar` job from the **Library building**, and only once it is owned
(`js/buildings.js:565` — `unlocks: { tabs: ["science"], jobs: ["scholar"] }`, with the
queue unlock inside `if (self.val)`):

```js
{ id: "loremaster", name: "Loremaster", desc: "+0.175 knowledge/s", prod: { knowledge: 0.175 },
  unlock: function (s) { return count("archive") > 0; } },
```

The Lore tab already gates on `count("archive") > 0`, so the job and the tab now appear
together — which is exactly the pairing Kittens ships.

**While you are in `JOBS`: the Woodcutter has no gate either.** Kittens unlocks its
`hunter` from `archery` and its `miner` from `mining`; only the farmer and woodcutter are
free from the start, so RR is correct there. Leave it. Named so it is not re-litigated.

---

## Part 6 — Set the Convergence stripe

Fourth deferral ends. Your §9.2 has the input, across four seeds, at a 2.10× spread —
inside the 3× condition the procedure has required since v0.44.

- `W₁` median at Sparks = **28,256**
- Rule `s = W₁ / 15` → **s = 1,884**

**Set the stripe to 1,884.** Then measure `W₂` at Icathia and report `W₂/W₁`. The band
holds at both ends iff that ratio is 2.4; if it comes in below, the top of the band lands
under 8% and that is acceptable, and better than clamping.

Note for the record why the input moved by a factor of 18 since v0.42: Part 4's acolyte
cut (0.012 → 0.0075) and a settlement of 202 rather than 477. Both were deliberate, both
are parity, and neither was an error in the stripe. **The stripe was correct for the game
that existed when it was set.** Expect it to move again after Part 1, and re-derive rather
than assume — but it is no longer blocked, and it should not be deferred a fifth time.

---

## Part 7 — The champion budget was mine and it was measured wrong

Your §9.4 reports ×12.46 aggregate at Icathia against my ×1.5–3.0. **The condition is
withdrawn.** I specified an aggregate across ten passives that sit on ten *different*
production lines — camp, devotion, caravan, village, gold, knowledge, culture, craft,
respawn, vigor — and multiplied them as though a single resource saw all ten. No resource
does. The largest single-line figure in your own table is **×1.774** (devotion, culture),
which is inside the paragon slot the budget was meant to reserve.

**Replacement condition: no single production line's champion multiplier exceeds ×3.0.**
Currently the maximum is ×1.774 and this passes without any change. `passiveMult` stays as
it is; ×3.872 at level 10 is steep on paper but it is steep on one line at a time.

---

## Part 8 — Order, and what to verify

### Order

1. **Part 1**, alone in the diff. It is the round. Everything else is measured against the
   income and building counts it changes.
2. **Part 2** — vigor. V1 first and on its own if you can spare the run; the passive line
   is worth 10.1/s and I want to know what it was holding up.
3. **Part 3** — trade costs. After Part 2, because the vigor cost is meaningless until the
   income is right.
4. **Part 6** — the stripe. Set it, then re-measure `W₂/W₁`.
5. **Part 5** — the ladder trim and re-skew. Shape, not pacing.
6. **Part 5A** — the visibility gates (5A.4) can ship any time; they touch nothing this
   round measures. The discovery chains and the resource-state axis (5A.2, 5A.3) go
   **after** the ladder trim, because trimming 45 techs to 38 moves the `tech:` field on
   several Discoveries and re-parenting them twice is wasted work. **5A.1's material-cost
   re-homing is the exception — do it with Part 5**, since it is the same edit to the same
   tech entries.
7. **Part 4 and Part 7: no code.** Report only.

### Pass conditions

- **Quarry effective-raw cost ≥ 500× the Mine's**, Observatory ≥ 300×, both from
  `effcost.mjs`. This is Part 1 and it is checkable before a single run.
- **Science stock at Icathia near 30 / 30 / 25 / 13**, all four within ±30%.
- **Per-worker ore : timber between 1.6 and 2.2 at Icathia**, and separately: report
  ore ratio-buildings against Lumber Mills. **The composition is already proven correct at
  equal N; this condition is now about the counts.**
- **Timber category reported against the formula evaluated at the axes and saws actually
  owned**, not at the full line — `axeMult × (1 + 0.10 × (1 + Σ saws) × N)`. My fault last
  round; state both the owned-line and full-line figures.
- **Ore income decomposed into job / autoprod / converter** at Sparks and Icathia
  (Part 1.4).
- **Vigor: no production term that scales with population.** Grep-level assertion, plus
  vigor at cap for **less than 10% of elapsed time** across the run.
- **Vigor receives `catCharts × catReligion × catPolicy` and nothing else**, same
  assertion shape as knowledge and culture.
- **`BOOST_LIMIT.vigor` asymptote ×2.0**, and the measured job multiplier ≤ ×2.0.
- **Trades per game-year at Icathia ≤ 3× trades per game-year at Sparks.** A trade economy
  that scales freely with income is the thing the gate exists to stop, and frequency is
  the only way to see it.
- **First expedition reachable from a cold start** with the passive vigor line deleted —
  report the game-year.
- **Tech count 38, five or more exact ties, median ×1.10–1.20, geometric mean ×1.25–1.30.**
  All three now hold simultaneously; that was the point of the trim.
- **No single production line's champion multiplier exceeds ×3.0.**
- **Discovery unlock-axis mix: ≥15% chained off another Discovery**, ≥78% tech-gated,
  against Kittens' 16% / 78%. Report the census the same way Part 5A.1 does.
- **No Lore tech carries a material cost.** Knowledge only, as Kittens' science tree is.
  Report which Discoveries absorbed each re-homed cost.
- **The Crafting tab does not appear on a save that has only ever run Transmute**, and
  the Loremaster does not appear until an Archive stands. Two assertions, cold start.
- **Report the game-year at which the Shelter, the Archive, the Crafting tab and the
  Loremaster each first become visible**, cold start, four seeds. These are the first
  four minutes of the game and nobody has ever measured them.
- Convergence measured at Sparks and at Icathia, with `W₁`, `W₂` and `W₂/W₁` reported.
- No regression: `caps.knowledge` still equals `Σ(building caps.knowledge)` exactly;
  `buildingJobBoost` still unbounded; morale ≥ 0.90 at Icathia; no champion at level 10
  before Era 3.

**Sources, all read this session.** `nuclear-unicorn/kittensgame` —
`js/resources.js:120–126` (manpower transient), `:128–140` (science, culture transient);
`game.js:3433` (`<res>Ratio`), `:3449` (paragon, unguarded), `:3466` (autoprod ordering),
`:3471` (magneto, guarded), `:3485` (reactor, guarded), `:3495` (CMBR, unguarded);
`js/buildings.js:451–510` (hut/logHouse/mansion, `manpowerMax` 75/50/50), `:656–661`
(observatory), `:680–685` (biolab), `:953` (`addBarnWarehouseRatio`), `:964–966` (mine),
`:1001–1005` (quarry), `:1355–1364` (magneto), `:1550–1568` (reactor);
`js/workshop.js` craft table (beam 175, slab 250, scaffold 50 beams, steel 100+100,
plate 125, concrate 2500+25, gear 15, alloy 10+75, blueprint 7500), `manpowerJobRatio`
(compositeBow 0.5, crossbow 0.25, railgun 0.25), `unlocks.upgrades` chains (21 of ~132);
`js/science.js` `unlocks.crafts` (parchment, compedium, steel, ship, blueprint, alloy,
plastic, concrate, microchip, tanker, kerosene, thorium, eludium);
`js/buildings.js:318–321, 451–459, 524–531, 1471–1482` (`unlockRatio` 0.3 on field, hut
and library; 0.0025 on workshop; workshop unlocks the crafting tab), `:565`
(library unlocks the scholar job on ownership); `js/village.js:1010` (hunt 100 catpower);
`js/diplomacy.js:8–11` (15 gold, 50 catpower), `:849–861` (discounts), `:893–897`
(the three-way AND). Verified against `index_45.html` lines 232–241, 267–282, 446–450,
967, 1463–1614, 1810, 2283, 2312, 2350–2361, 2427–2429, 2498–2503, 2971–2992.
