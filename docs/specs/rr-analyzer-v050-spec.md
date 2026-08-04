# BUILDER SPEC v0.50 — the full category census

Measured against `index_49.html`, verified line by line. Every Kittens value below was read
from `nuclear-unicorn/kittensgame` in this session.

**Your §1 is the most valuable section any build report has had, and it costs me two rounds
of reasoning.** y1,005.3 is retired. I built two specs on a number whose label was wrong,
and the label being yours does not make the reasoning on top of it mine any less wrong — I
never asked what was in the build until v0.48's Part 1.6, and I should have asked when the
figure first appeared. **The baseline is v0.47's y413.6 and Part 1.7 moved it to y827.9,
Era 3 ×2.17.** Everything below is measured against that.

Jerry's priorities, in his order:

1. **The full category census.** One census was worth ×2.17 and it is the only method that
   has beaten price tuning three rounds running. **Part 1** — and it finds four global
   multipliers Kittens has no counterpart for, worth **×2.06** before the Baron buff and
   **×4.13** with it.
2. **The seven raw-gate violations**, their own section and their own isolation run.
   **Part 2**. Four of the seven are one shimmer displacement, exactly as you read it.
3. **The Foundry/Reactor price separation.** **Part 3**.
4. **The 1.25 band question.** Jerry has ruled: **keep the ratio.** **Part 4** ratifies the
   whitelist and closes it.

**Kept by ruling, no code:** Shelter 75, Cultivation's `+10% provisions`, and the v0.49
timeline. **No Convergence, no prestige, no Worship.**

---

## Part 0 — Ratifications and one retraction

**0.1 — y1,005.3 is retired and the retraction is accepted in full.** Your §1 reads the
build script rather than the memory of it, and it is unambiguous: 36 prices not 38, no
Scriptorium, no Carpentry, no retirements, materials still on ranks 1–20, `scaffold` moved
to `woodcraft` instead of Carpentry, and **five of six deadlocks still live.** It was not
"the ladder at Kittens' prices." Naming it in your own report, against your own label, is
the standard this project runs on.

**0.2 — `auditCostGraph()` was blind to raw resources and I asked for an assertion it could
not have satisfied.** My v0.48 §3.1 called the Storehouse "violation number seven" and asked
you to assert that an ore-priced Storehouse would fail the audit. It would not have — the
gate map was built from `CRAFTS` alone. You found that by trying to satisfy the condition
rather than by asserting it passed. **The split into `auditCostGraph()` and
`auditRawGraph()`, with the count pinned at seven, is the right shape** and both stay.

**0.3 — Not fixing the seven mid-round was correct**, and it is my own §1.7 warning applied
back to me. Part 2 gives them their own round.

**0.4 — Part 5.1's "one line" broke two shipped invariants and you kept the invariant.**
Moving gold with vigor to hold Kittens' 15:50 = 0.30 was right; the spec should have said
"one line and its ratio."

---

## Part 1 — The category census (Jerry's priority 1)

The method that produced ×2.17 was: *enumerate a multiplicative category's members in both
games, at their ranks and ratios, and correct the membership rather than the prices.* Here
it is applied to every category in `computeRates()`.

**Kittens' Law, restated because the whole census depends on it:** effects are **additive
within a category** and **multiplicative between categories**. So the number of categories
matters more than any member's value — an extra category is a multiplication, an extra
member is an addition.

### 1.1 Job-tier tool lines — Kittens' `<res>JobRatio`

| Resource | Kittens members | Kittens total | RR members | RR total | |
|---|---|---|---|---|---|
| wood / timber | 6 axes (0.7·0.5·0.5·0.5·0.5·0.5) | **×4.20** | `axeMult()`, 6 rungs | **×4.20** | ✅ exact |
| minerals / ore | **none** | ×1.00 | **none** | ×1.00 | ✅ exact |
| science / knowledge | none | ×1.00 | none | ×1.00 | ✅ |
| catnip / provisions | 2 hoes (0.5, 0.3) | **×1.80** | `ironPlows` ×1.3 | ×1.30 | ⚠️ under |
| manpower / vigor | 3 (compositeBow 0.5, crossbow 0.25, railgun 0.25) | **×2.00** | none in `jobMult` | ×1.00 | see note |
| mana | — *(no Kittens resource)* | — | `arcaneFocus` ×1.5 | ×1.50 | RR-only |
| crystals | — | — | `facetedCuts` ×1.25 | ×1.25 | RR-only |

**Vigor is fine and is not a gap:** v0.47 Part 2 V3 put its ×2.00 ceiling in `BOOST_LIMIT.vigor`
instead of in `jobMult`. Different slot, Kittens' magnitude. Leave it.

**One orphan, and it is the kind the census exists to find:**

```js
var mw = S.upgrades.masterworkTools ? 1.25 : 1;
farmer:     (…ironPlows…) * mw * villageMult,
woodcutter: axeMult()     * mw * villageMult,
```

**`masterworkTools` is a cross-resource job multiplier and Kittens has none.** Every Kittens
tool line is `<res>`-specific — an axe raises wood and nothing else. A ×1.25 sitting on two
jobs at once is a category with one member that should not exist.

**Fix:** fold it into the lines it touches. `+0.25` into `AXE_LINE` as a seventh rung
(×4.20 → ×4.45), and `+0.25` into the provisions line alongside `ironPlows` (×1.30 → ×1.55,
which also closes the catnip gap above, against Kittens' ×1.80). **`mw` disappears as a
multiplier.** Net effect on timber and provisions is close to neutral; the structural gain is
one fewer multiplicative category.

### 1.2 Building ratio — Kittens' `<res>Ratio`

| | Kittens | RR | |
|---|---|---|---|
| minerals / ore | mine 0.20 + quarry 0.35 — **2 buildings** | mine 0.20 + Petricite Quarry 0.35 — **2** | ✅ exact |
| wood / timber | lumberMill `0.10 × (1 + Σ5 saws)` = **0.195** | lumberMill `0.10 × (1 + sawSum())` = 0.195 | ✅ exact |
| science / knowledge | library .10, academy .20, observatory .25, biolab .35 — **4** | archive .10, academy .20, observatory .25, hexcore lab .35 — **4** | ✅ exact |
| catnip / provisions | **aqueduct 0.03** — 1 building | **none** | ❌ RR is missing one |
| crystals | — | augment chamber, tinkerer 0.40 | RR-only, and it is a *job* boost |

**This is the one place the census finds RR *under* the source.** Kittens' Aqueduct raises
catnip production by 3% per copy at `priceRatio 1.12` and is the food economy's only
building multiplier. RR's provisions line has a job tool and a `resRatio` term but **no
building at all.**

**Fix: give the Farmstead `boost: { provisions: 0.03 }` at its existing ratio.** One member,
Kittens' own figure, in a category RR already has code for. It is the cheapest parity item
in the spec and it is the only one that *adds*.

### 1.3 Per-resource global ratio — Kittens' `<res>GlobalRatio`

**Kittens fills this slot for exactly two resources — `starchart` (hubbleTelescope 0.30) and
`unicorns` (unicornSelection 0.25). For wood, minerals, catnip, science and manpower it is
empty.**

RR's `resRatio`:

```js
provisions: 1 + (S.techs.cultivation ? 0.10 : 0),
timber:     1 + (S.upgrades.seasonedTimberworks ? 0.25 : 0),
mana:       1 + (S.upgrades.hexresonance ? 0.25 : 0)
```

Three members in a slot the source leaves empty for the equivalent resources. **Two of the
three are mine** — v0.44 Part 1.3 invented `seasonedTimberworks` and `hexresonance` on the
argument that "Kittens carries `<res>GlobalRatio` as its own multiplicative slot." It does
carry the slot; it does not fill it for these resources, and I did not check.

**Jerry has ruled Cultivation's +10% stays** — it costs 18.8 years of Icathia and buys 37.4
of Era 3 entry, which is a trade he wants. So:

- **`provisions +10%` stays.** Ruled.
- **`seasonedTimberworks` moves into the saw line** as a sixth rung (`SAW_LINE` Σ 0.95 →
  1.20, so the Lumber Mill goes 0.195 → 0.220 per copy). Same content, one fewer category.
- **`hexresonance` moves into `boosts.mana`**, which already exists as a per-resource
  additive category.

`resRatio` then has one member and is a slot RR fills where the source does not — recorded
as a deliberate divergence with Jerry's name on it, rather than an unexamined one.

### 1.4 The four orphan globals — this is the finding

`computeRates()` multiplies seven independent global categories:

```js
var global = catMonument * catCharts * catReligion * catDrake * catSoul * catPolicy * catBuff;
```

Against Kittens, applied to a normal resource:

| RR category | value | Kittens counterpart |
|---|---|---|
| `catMonument` | 2 members | **magneto×steamworks + productionRatio** ✅ *(fixed in v0.49)* |
| `catReligion` | Convergence | **solarRevolutionRatio** ✅ |
| `catPolicy` | `0.01 × settled groups` | policy effects exist, per-resource | ~ |
| **`catCharts`** | **×1.10** | **none** |
| **`catDrake`** | **up to ×1.50** | **none** |
| **`catSoul`** | **×1.25** | **none** |
| **`catBuff`** | **×2.00 while the Hand of Baron runs** | **none, at any rank** |

**Four categories with no counterpart, multiplying to ×2.06 sustained and ×4.13 with the
buff.** Kittens' only unmatched global terms are **paragon** (×1.5–3.0) and **CMBR**, and RR
has neither — so RR's four are occupying roughly paragon's space, which is defensible in
total and indefensible in *structure*: four multiplications where the source has one.

**Fix — collapse three into one, and cut the fourth.**

```js
// v0.50 Part 1.4. Kittens' Law: additive WITHIN a category, multiplicative BETWEEN.
// Celestial Charts, the Infernal Drake and the Dragon Soul are three RR-only sources of
// the same thing — a settlement-wide production bonus with no Kittens counterpart. They
// were three categories because they were written at three different times, not because
// the source has three. One category, additive, bounded like every other RR stack.
var META_LIMIT = 1.0;
var catMeta = 1 + limitedDR(
    (S.upgrades.celestialCharts ? 0.10 : 0) +
    drakeBonus("infernal", 0.5) +
    (S.dragonSoul ? 0.25 : 0),
  META_LIMIT);

// The Hand of Baron doubled ALL production. Nothing in Kittens doubles all production at
// any rank, timed or otherwise. A quarter is still the strongest temporary effect in RR.
var catBuff = 1 + (simNow() < S.baronUntil ? 0.25 : 0);

var global = catMonument * catReligion * catPolicy * catMeta * catBuff;
```

At full stack `catMeta` is **×1.85** against the old **×2.06**, and the Baron goes ×2.00 →
×1.25. **Combined, the global tier drops from ×4.13 to ×2.31 at its maximum** — and, more
importantly, from seven multiplications to five.

**Expect this to be worth real years and to compound with depth**, the same signature §2.1
measured for `globalBoost`: the early game barely moves, the late game moves a lot.

### 1.5 The bounded side categories — one number is far out

| RR | limit | at a full stack | Kittens analogue |
|---|---|---|---|
| `CRAFT_YIELD_LIMIT` 2.2 | ×3.04 at Σ3.0 | | `getCraftRatio`, unbounded, ≈×3.2 developed | ✅ |
| `AUTOPROD_LIMIT` 2.0 | ×3.00 | | `smelterRatio` | ~ |
| `MAXPOP_RATIO_LIMIT` 1.0 | ×2.00 | | `maxKittensRatio`, capped +100% | ✅ |
| `LUXURY_CAMP_YIELD_LIMIT` 1.0 | ×2.00 | | | ~ |
| **`CAMP_YIELD_LIMIT` 6** | **×4.00 at Σ3.0, ×7.25 at the asymptote** | | **needs the same census** | ❓ |

**`CAMP_YIELD_LIMIT 6` is the largest bound in the game by a factor of three**, and its
category has nine members (junglers, Hunter Lodges, champion `camp` passive, Trapper's
Craft, Beast Lore, Master of the Hunt, Atlas Gauntlets, Open Range, the trailblazer trait).
Expeditions are RR's hunting, and Kittens' hunt yields scale off `huntingArmor`, `bolas` and
their successors.

**Do not change it this round. Census it next round** — enumerate Kittens' hunt-yield line
member by member the way Part 1.1 does the axes, and set the bound from the source instead
of from a guess. Naming it here so it is on the list rather than discovered in v0.53.

### 1.6 Categories that are already correct — recorded so they are not re-litigated

`<res>SuperRatio` (Kittens: coal only; RR: none) ✅ · `<res>RatioReligion` (Kittens: unicorns
and faith; RR: none per-resource) ✅ · season/weather on food only ✅ · morale/happiness, one
category each ✅ · leader rank ↔ census skill, one each ✅ · `catMonument` at two members ✅
(v0.49) · the ore, timber and science building ratios, all exact (1.2).

---

## Part 2 — The seven raw-gate violations (Jerry's priority 2)

**Own section, own build, own isolation run, nothing else in it.** Jerry's instruction, and
v0.47 is the evidence for it.

### 2.1 The shimmer displacement — four of seven are one error

| # | Violation | Gap |
|---|---|---|
| 1 | **tech `gloriousEvolution` (85,000) costs `shimmer`, gated on `deepWorks` (100,000)** | **15,000 — the tech cannot be researched at all** |
| 2 | building `augmentChamber` (85,000) needs `shimmer` | 15,000, and behind #1 |
| 3 | discovery `continuousDraw` (60,000) needs `shimmer` | 40,000 |
| 4 | discovery `chemBaronTithe` (65,000) needs `shimmer` | 35,000 |

**Four things priced in shimmer sit 15,000–40,000 knowledge below the Shimmer Refinery.**
Your reading is right: that is one displacement, not four errors. Something priced shimmer
into the 60,000–85,000 band on the assumption the Refinery was there.

**Fix at the source, not at four call sites: move the Shimmer Refinery.** It is
`tech: "deepWorks"` (100,000). The earliest thing that costs shimmer is `continuousDraw` at
**60,000**. Put the Refinery on **`progressDay` (60,000)** and all four clear at once, with
no price touched and no content moved.

Check before shipping: the Refinery's own cost must be reachable at 60,000 — run
`auditRawGraph()` on the moved build, and if the Refinery's inputs are themselves gated
later, the move goes to the next rung up that clears.

**#1 is the worst defect ever found in this project** — a tech that has never been
researchable in any measured build, with a building behind it that has never been reachable.
It should be stated as such in the round's report.

### 2.2 The three ordering violations

| # | Violation | Gap | Fix |
|---|---|---|---|
| 5 | `tavern` (100) needs `ore` (500) | 400 | **Tavern → `mining`** (rank 4, 500) |
| 6 | `longhouse` (300) needs `ore` (500) | 200 | **Longhouse → `mining`** |
| 7 | `ironShodWheels` (1,200) needs `steel` (1,500) | 300 | **→ `smelting`** (1,500) |

All three are the v0.46-Storehouse shape: a thing unlocked before one of its inputs exists.
Moving the *consumer* up is right here rather than moving the *producer* down, because ore
and steel are already at their Kittens ranks (`mining` 500, `steel`/Smelting 1,500) and the
consumers are not anchored to anything.

**Note on the Longhouse.** v0.47 Part 1.4 recorded that RR's Longhouse unlocks from Woodcraft
(rank 3) where Kittens' logHouse comes from `construction` — Carpentry, rank 7 — and deferred
the move as a population-curve change. **This fixes the deadlock without settling that**:
`mining` at rank 4 clears the ore gate, and whether it belongs at rank 7 stays open. Say so
in the report so the two do not get conflated.

### 2.3 What to measure

**One isolation run: full v0.50 with Part 2 only**, seed 1, against v0.49's y827.9. Nothing
from Part 1 in that build.

Report the full milestone set, plus **Augment Chamber count and Glorious Evolution research
year** — both are zero in every build ever measured and this is the first round they can be
non-zero.

---

## Part 3 — The Foundry/Reactor price separation (Jerry's priority 3)

Deferred three rounds. Your §2.4 makes it sharper than it has ever been:

| | count at Icathia | per copy | contribution |
|---|---|---|---|
| Hextech Foundry | 9 | +13.20% *(0.06 × amplifier)* | +118.8% |
| Arcane Reactor | **21** | +5.00% flat | +105.0% |

**Twenty-one Reactors are now the whole global tier rather than part of it**, and the price
separation is:

| | amplifier tier | global tier | separation |
|---|---|---|---|
| Kittens | Magneto **20,867 raw** | Reactor **3,774,333 raw** | **×181** |
| RR | Foundry 119,252 raw | Arcane Reactor 62,595 raw | **×0.525** |

RR's Reactor costs **half** its amplifier; Kittens' costs **181×**. That is the defect — not
the absolute level. RR's Foundry is ~6× *more* expensive than Kittens' Magneto; RR's Reactor
is ~60× *less* expensive than Kittens' Reactor.

**Raise the Arcane Reactor, do not cut the Foundry.**

```js
{ id: "arcaneReactor", tech: "greyReclamation", ratio: 1.15, globalBoost: 0.05,
  cost: { hexcore: 40, hexcrete: 80, focusedHex: 60 } },   // was 4 / 8 / 6 — ×10
```

**×10 on every component**, which takes the separation from ×0.525 to ≈**×5.25**. That is
still far short of Kittens' ×181 and it is deliberate: RR's Reactor sits at rank 36 against
Kittens' rank 39, in a game that ends where Kittens' Reactor begins, so full separation would
put it out of reach. **×10 is one round's step. Measure it, then decide whether the next ×10
is warranted** — with twenty-one copies today, a ×10 price should land the count near five to
eight, which is where the Foundry already sits.

**Ship this alone in its own build too.** It is a production lever and Part 1.4 is a
production lever; landing both in one build is the v0.47 mistake.

---

## Part 4 — The 1.25 band (Jerry's priority 4): keep the ratio, close the question

**Jerry has ruled: keep the ratio.** The Ward of the Watchers and The Frozen Watcher stay at
**1.25** with no `globalBoost`.

Your instinct not to re-price them was right and the reasoning is now the ruling: dropping a
capstone's ratio makes it *cheaper*, which fights the round's objective. And the band rule
itself is an RR invention — **Kittens has no ratio-to-effect band at all.** Its ratios are
1.10, 1.12, 1.15, 1.25, 1.35, 1.50, 1.75 and 2.50, assigned by what the building *is* rather
than by what category its effect sits in: the Barn is 1.75 with no multiplier of any kind,
the Hut is 2.50, the Amphitheatre is 1.15 with a real one.

**So the whitelist is not a concession — the rule it exempts them from does not exist in the
source.** Change the test's comment from "not settled" to a statement of that, and stop
carrying it as an open item:

```js
// v0.50 Part 4. The 1.25-band rule is an RR invention; Kittens assigns priceRatio by what a
// building IS, not by which effect category it carries (barn 1.75 with no multiplier at all,
// amphitheatre 1.15 with a real one). Capstones stay at 1.25 by ruling. Closed, not pending.
```

**Two consequences worth stating.** The rule is now advisory, so it stops being a reason to
re-price anything on its own — and if a future round wants a genuine ratio principle, the
source's is "what is this building," which is a design question rather than an arithmetic one.

---

## Part 5 — There is no trade gate (Jerry's question)

**Jerry: "Is there really a trade gate? Players will not always have vigor being spent
consistently as they will not be playing the entire time." That is the answer, and it
retires the pass condition rather than the feature.**

Both vigor hypotheses are now measured and dead. Run C cut the ceiling by 47% and moved first
trade **1.1 years**. Part 5.1 cut the cheapest route's price by a third and moved it **the
wrong way**, y201.5 → y218.0, across an economy whose Era 3 doubled.

**The reason neither moved it is that the bot is not a player.** The greedy policy spends
vigor on expeditions the moment it can afford one, continuously, for two and a half thousand
game-years. It never banks. A human plays in sessions, closes the tab, and — since v0.47
Part 4A — comes back to twelve hours of accrued vigor with no expeditions having fired in
between. **The bot's vigor is a flow; the player's is a stock.** First-trade-year measured on
a flow says nothing about a player holding a stock.

Vigor at cap is the tell: **5.7%** across the run. The bot is spending essentially everything
it earns.

**Retire "first trade before Sparks."** It measures the bot's expedition policy, not the
game. Replace it with two conditions that are policy-independent:

- **The cheapest trade is *affordable* before Sparks** — i.e. `caps.vigor ≥ 100` and
  `caps.gold ≥ 30` and the Freljord's `ore 500` is within the ore ceiling, at Sparks. A state
  question, not a behaviour one.
- **Report vigor income per game-year at Sparks against the cheapest trade's cost**, so we
  can say how many trades a player *could* run rather than how many the bot did.

**No code, no price change.** The trade layer is reachable; the measurement was wrong. If
Jerry wants trade to feel more available in play, the lever is offline vigor accrual, which
already works — not another price cut.

---

## Part 6 — Order, and what to verify

### Order — three separate builds, and the separation is the point

1. **Part 2 alone** — the seven raw gates. One isolation run against v0.49's y827.9. It is a
   correctness round and it must not be mixed with a production lever.
2. **Part 1 alone** — the census: `mw` folded in, the Farmstead's provisions ratio,
   `seasonedTimberworks` into the saws, `hexresonance` into `boosts`, and the four orphan
   globals collapsed to `catMeta` + a quartered Baron. One isolation run.
3. **Part 3 alone** — the Arcane Reactor at ×10. One isolation run.
4. **Part 4** — a comment change.
5. **Part 5** — pass conditions only.

**Three builds, three runs. v0.47 shipped seven items in one build and cost two rounds of
attribution; v0.49 shipped one and answered its question in a single number.**

### Pass conditions

- **Category census reported as a table**, RR member count against Kittens member count, for
  every category in Part 1. This is the deliverable, not a side effect.
- **`global` is the product of five categories, not seven.** Grep-level.
- **`catMeta` ≤ ×1.85 at a full stack** and `catBuff` ≤ ×1.25. Asserted.
- **`mw` appears nowhere as a multiplier**; `AXE_LINE` sums to 3.45 (×4.45) and the
  provisions job line reaches ×1.55.
- **The Farmstead carries `boost: { provisions: 0.03 }`**, Kittens' Aqueduct figure.
- **`resRatio` has exactly one member** (provisions, by ruling); `SAW_LINE` sums to 1.20 and
  the Lumber Mill reads 0.220 per copy.
- **`auditRawGraph()` returns zero**, and the pinned count changes from seven to zero in the
  same commit as Part 2 — not before.
- **The Glorious Evolution is researched in every seed, with the game-year reported**, and
  the Augment Chamber count at Icathia is non-zero. Both have been zero in every build ever
  measured.
- **Arcane Reactor count at Icathia**, against 21 today. Expect five to eight.
- **The Foundry/Reactor separation reported in effective-raw terms** against Kittens' ×181.
- **Cheapest trade affordable before Sparks** (state, not behaviour), and vigor income per
  game-year at Sparks against its cost. **"First trade before Sparks" is retired.**
- No regression: all 38 tech prices; the five ladder conditions together; `catMonument` at
  exactly two members; the ore category `1 + 0.25M + 0.40Q` exact; knowledge cap buildings
  alone; `buildingJobBoost` unbounded; morale in band; Shelter 75 and Cultivation's +10%
  both unchanged; offline replay 0% drift; no change to Worship, Ascent, the stripe, the
  Shrine, the Acolyte or any WTECH.

**Sources, all read this session.** `nuclear-unicorn/kittensgame` — `js/workshop.js` (the
full `<res>JobRatio` census: 6 axes Σ3.20, 2 hoes Σ0.80, 3 manpower Σ1.00, **no
`mineralsJobRatio`**; 5 saws Σ0.95; `coalSuperRatio` 0.20 the only SuperRatio);
`js/buildings.js` (the `<res>Ratio` census: mine 0.20, quarry 0.35, lumberMill
`0.1 × (1 + lumberMillRatio)`, **aqueduct `catnipRatio` 0.03**, library/academy/observatory/
biolab 0.10/0.20/0.25/0.35; magneto `magnetoRatio 0.02` @1.25, steamworks
`magnetoBoostRatio 0.15`, reactor `productionRatio 0.05` @1.15; barn 1.75 with no
multiplier, hut 2.50, amphitheatre 1.15 — the evidence that Kittens has no ratio band);
`js/religion.js` (`faithRatioReligion` 0.10, `unicornsRatioReligion` ×6);
`game.js:3425–3500` (`getResourcePerTick`, the category order and the transient guards);
`js/science.js` (`electricity` 75,000 → magneto, `nuclearFission` 150,000 → reactor).
Verified against `index_49.html` lines 1611–1615 (`policyGlobalBonus`), 1747–1750
(`DRAKE_PER_KILL`), 1772–1783 (`campYieldMult`, nine members, `CAMP_YIELD_LIMIT 6`),
2815 (`BOOST_LIMIT`), 2890–2898 (`mw`, `jobMult`), 3041–3049 (`resRatio`), 3554–3566
(`craftYield`), and the `catMonument … catBuff` block in `computeRates()`.
