# BUILDER SPEC v0.42 — RR rebalanced against Kittens' three curves, from source

I cloned `nuclear-unicorn/kittensgame` and read `science.js`, `buildings.js`,
`workshop.js`, `village.js` and `resources.js` directly. Every Kittens number below
is quoted from that source, not recalled. Where RR diverges I say by how much and
whether the divergence is a defect or a deliberate choice.

This supersedes the earlier v0.42 draft. Jerry's Morellonomicon directive is in
Part 3, and the answer changed once I read what a compendium actually does.

---

## Part 0 — Six things I have told you that are wrong

I have been working from recollection for eleven rounds. Six claims do not survive
contact with the source, and three of them shaped decisions you shipped.

**1. Kittens *does* clamp its compendium line. This is the big one.**

```js
// workshop.js:2785
var compendiaScienceMax = Math.floor(this.game.resPool.get("compedium").value * 10);
this.effectsBase["scienceMax"] = Math.min(compendiaScienceMax, scienceMaxCap);
```

Each compendium gives **+10 science max**, and the total compendium contribution is
`Math.min(compendia × 10, building-derived cap)` — so **compendiums can at most
double the building cap, never more**. In v0.41 §2.1 I wrote "Kittens' Compendia are
uncapped, self-limited by cost rather than by a clamp" and had you delete RR's
clamp. That was exactly backwards: **RR's original clamp was correct Kittens
behaviour and I removed it.** Your v0.40 §5 option 2 — "restore it at half strength"
— was closer to source than my instruction was.

**2. Amphitheatre is priceRatio 1.15, not 1.75.** Cost `wood 200, minerals 1200,
parchment 3, iron 1250, titanium 75`. My Tavern recommendation cited a 1.75 ratio
that does not exist. The *cost* argument still holds — RR's old 150/120/80 was far
below Kittens' mineral figure — and your measurement (10% of samples below 90 early,
up from 0%) says the change worked. Keep it; the grounding was wrong, the number
was right.

**3. Temple is priceRatio 1.15, not 2.5.** So my justification for bounding RR's
Shrine morale — "Kittens' Temple is 2.5 and self-limiting where RR's Shrine is 1.15
and spammable" — was false. Kittens' Temple is equally spammable. The `limitedDR(…,
25)` bound is still the right call, but on its own merits: RR needs a morale ceiling
because Jerry specified a 130–140 band, and Kittens has no such requirement.

**4. Alloy is `titanium 10 + steel 75`, not `titanium 75 + steel 10`.** I had the
recipe inverted in the v0.39 craft table.

**5. Gear is `steel 15`, not `steel 25`.** RR shipped 25, so RR's Gear is 1.67× more
expensive than parity. Minor, but it is in the chain the Noxus route now feeds.

**6. "Tech ladder inversions" are not bugs — they are branches.** I made you fix two
of them. Kittens' tree has *many*: `animal 500` after `metal 900`, `math 1000` after
`civil 1500`, `steel 12000` after `machinery 15000`, `archeology 65000` after
`drama 90000`, `industrialization 100000` after `genetics 190000`. The tree is a
branching DAG where several techs are affordable at once, and a cheaper tech
appearing after an expensive one is how a player gets a *choice*. The real rule is
narrower: **cost must rise monotonically along any single prerequisite chain**, and
may do anything across branches.

---

## Part 1 — The three curves, from source

### 1.1 The income curve

Kittens ticks at 5/s. Base rates converted to per-second, against RR's:

| Role | Kittens (per s) | RR (per s) | RR ÷ Kittens |
|---|---|---|---|
| Woodcutter → wood | 0.090 | 0.30 timber | **3.33× generous** |
| Miner → minerals | 0.250 | 0.25 ore | **1.00 — parity** |
| Scholar → science | 0.175 | 0.30 knowledge | **1.71× generous** |
| Hunter → manpower | 0.300 | 0.15 vigor | **0.50× — half** |
| Priest → faith | 0.0075 | 0.04 devotion | **5.33× generous** |
| Farmer → food | 5.00 catnip | 0.50 provisions | (see below) |
| Consumption per head | 4.25 catnip/s | 0.35 provisions/s | — |
| **Heads fed per farmer** | **1.18** | **1.43** | 1.21× generous |

**The law underneath all of these: base rates never change.** `woodcutter` is
`0.018/tick` from the first minute to the last. Every point of growth in Kittens
comes from multiplier categories, each additive internally and applied once as
`(1 + Σ)`. RR already follows this; it is the one structural thing that has been
right since v0.20.

Three divergences are worth acting on:

- **Acolyte at 5.33× a Kittens priest is the root of the Worship problem.** Your
  §6 last round measured 3.4M Worship at Sparks and we could not find a stripe that
  fit two seeds. Devotion is being produced at five times parity and converted 1:1
  by a free, cooldownless Ascent. **Bring the Acolyte to 0.012 devotion/s** (1.6×
  parity, keeping RR's faster overall pacing) and the Worship input drops by ~3.3×
  before we touch the Convergence curve at all. This is a supply fix, and it is the
  right one — Ascent stays free and closed, as established.
- **Jungler at half parity is why Vigor is always tight.** Kittens' hunter makes
  0.3 manpower/s and a hunt costs 100 manpower; RR's jungler makes 0.15 and a hunt
  now costs 100 Vigor. So RR hunting is **2× slower per trip than Kittens'** while
  carrying more jobs (luxuries, Poros, True Ice, Drakes, Baron, scouting, and now
  trade costs). Raise the Jungler to **0.30 vigor/s** — exact parity — and the Wilds
  stop being the bottleneck for five unrelated systems at once.
- **Woodcutter at 3.33× is fine and should stay.** Timber is RR's Beam input and
  Beams now price the Warehouse, the Observatory and the Piltover slot table. The
  generosity is load-bearing.

### 1.2 The building curve

Every `priceRatio` in `buildings.js`, all 40 buildings:

| Ratio | Count | Buildings |
|---|---|---|
| 1.10 | 2 | observatory, biolab |
| 1.12 | 2 | field, aqueduct |
| **1.15** | **26 (65%)** | pasture, logHouse, mansion, library, academy, warehouse, harbor, mine, quarry, smelter, calciner, lumberMill, oilWell, workshop, factory, reactor, accelerator, tradepost, mint, amphitheatre, chapel, temple, aiCore, zebraWorkshop, zebraForge, ivoryTemple |
| 1.25 | 5 | steamworks, magneto, ziggurat, chronosphere, stasisPod |
| 1.35 | 1 | zebraOutpost |
| 1.50 | 1 | brewery |
| 1.75 | 2 | barn, unicornPasture |
| 2.50 | 1 | hut |

The rules this encodes:

- **1.15 is the default and should be ~65% of RR's buildings.** RR is at 26 of 38 —
  68%. Correct already.
- **1.10 is reserved for the two deep science buildings only.** RR uses it for
  Observatory and Hexcore Laboratory. Exact match.
- **1.25 is reserved for global multipliers.** Kittens: steamworks, magneto,
  ziggurat, chronosphere, stasisPod. RR: Hextech Foundry (+6% all production),
  Watcher's Eye, Petricite Monument. Correct.
- **1.75 and 2.50 are for the two things a player buys constantly**: first-tier
  storage and first-tier housing. Barn at 1.75 costs `wood 50`; Hut at 2.50 costs
  **`wood 5`**. The ratio is punishing *because the base is trivial* — that is the
  pattern, and it is what makes the four hut-ratio reducers feel like a
  breakthrough rather than a patch.

**RR's Shelter is `timber 20 + provisions 10` at 1.75 against Kittens' Hut at
`wood 5` and 2.50.** RR's base is 4–6× higher and its ratio far gentler. That
combination front-loads housing cost and then lets it run away later, which is the
shape of the population wall we have chased twice. Recommend **Shelter → `timber 8`
at ratio 2.20**, with Ironwood Shelters and Petricite Frames reducing toward 1.5 and
1.3 as they already do. Cheap enough to spam early, steep enough that the reducers
matter, which is Kittens' actual design.

Base costs worth copying directly, since RR has near-equivalents:

| Kittens | Cost | RR equivalent | Verdict |
|---|---|---|---|
| barn | wood 50 | Storehouse timber 60 + ore 75 | close |
| warehouse | **beam 1.5, slab 2** | Warehouse beam 6, stoneSlab 8 | RR 4× heavier |
| harbor | slab 50, plate 75, scaffold 5 | Harbor stoneSlab 50, gear 20, beam 30 | fine |
| library | wood 25 | Archive timber 40 + mana 50 | RR heavier |
| academy | wood 50, minerals 70, **science 100** | Academy timber 100, ore 140, mana 150, knowledge 80 | close |
| observatory | iron 750, science 1000, slab 35, scaffold 50 | Observatory ore 750, knowledge 1000, stoneSlab 35, beam 50 | **RR is cheaper** |
| biolab | science 1500, slab 100, plastic 15, alloy 25 | Hexcore Lab scaffold 6, plating 10, hexgear 4, gold 400 | RR much cheaper |

**Note the Observatory row, because it contradicts your §5.** RR's Observatory is
already *cheaper* than Kittens' — Kittens asks for 50 **scaffold** (2,500 beams)
where RR asks for 50 beams. So the million-ore result is not the Observatory being
overpriced. It is that **RR's ore income cannot reach Kittens' relative scale**,
which is a multiplier-stack problem, not a price problem. Do not trim the
Observatory. See Part 4.

### 1.3 The knowledge curve

**The ladder.** 61 techs, `calendar 30` → `exogeophysics 25,000,000` — an
**833,333× span**:

| | Kittens | RR v0.41 |
|---|---|---|
| Techs with a science cost | **61** | 22 |
| Span | 30 → 25,000,000 (833,333×) | 30 → 5,000,000 (166,667×) |
| Median step, cost-sorted | **×1.12** | ×1.56 |
| Mean step | ×1.36 | ×2.25 |
| Geometric mean step | **×1.255** | ×1.773 |
| Largest single step | ×5.0 | **×14.3** (Call to Arms → Sparks) |
| Techs below 100,000 | 29 (48%) | 17 (77%) |

Two things fall out. First, **RR has a third of the techs across a fifth of the
span, so every RR step is nearly three times as large as a Kittens step.** That is
the single clearest statement of why RR's pacing keeps coming out lumpy: seventeen
cheap techs, then a ×14.3 cliff, then five expensive ones. Second, **Kittens' median
step is ×1.12** — the ladder is dense and shallow, and it gets its length from
*count*, not from *size*.

**Recommendation: do not re-price the five Era-3 techs. Add techs between them.**
Nine to twelve new techs spread across Sparks → Icathia, each a ×1.3–1.5 step,
turning a five-rung ladder into a fifteen-rung one. Content, not inflation, is how
Kittens makes an era last — and it is the only change that lengthens Era 3 without
making any individual research feel unfair.

**The science cap.** This is the part I got wrong, and it is worth stating fully:

```
scienceMax = Σ(building scienceMax)  +  min(compendia × 10, Σ(building scienceMax))
```

with `library 250, academy 500, observatory 1000 (1500 with Astrolabe), biolab 1500`
— **all four of which RR already matches exactly**, along with their `scienceRatio`
of 0.10 / 0.20 / 0.25 / 0.35. RR's science buildings are the most faithful part of
the whole game.

Three consequences:

1. **The ceiling is at most 2× the building-derived cap.** Ever.
2. **Kittens has no multiplicative science-cap line at all.** RR's Scholarship I–V
   (×1.6 × 1.75 × 2 × 2 × 2 = **×22.4**) has no counterpart in Kittens and is doing
   more work than every building combined. This is RR's largest single divergence
   from the knowledge curve.
3. **The cap tracks the ladder at roughly 1.5–2×.** A mid-game Kittens stock of ~30
   libraries, ~25 academies and ~20 observatories is 40,000 building cap, 80,000
   with compendia — against Astronomy 28,000, Navigation 35,000, Architecture
   42,000, Physics 50,000. The ceiling sits just above the tech you are working
   toward, always. That is the tuning target.

---

## Part 2 — What "copy the curves" means for RR, concretely

Six changes, in dependency order. Each is a rate or a count, none is structural.

**2a. Restore the cap clamp, at Kittens' exact shape.**

```js
// computeCaps(): the compendium line, clamped as workshop.js:2785 clamps it.
var buildingKnowledgeCap = caps.knowledge;          // before any craft contribution
caps.knowledge += Math.min(
  150 * Math.floor(S.res.morellonomicon || 0),
  buildingKnowledgeCap);
```

**2b. Cut the Scholarship line from ×22.4 to ×4.** Kittens has none; RR having some
is a reasonable divergence, but ×22.4 means buildings barely matter. Recommend
Scholarship I ×1.25, II ×1.3, III ×1.3, IV ×1.35, V ×1.4 — cumulative **×3.99**.
Same five upgrades, same gates, same feeling of progress, an order of magnitude less
distortion.

**2c. Re-target the ceiling to 1.5–2× the next tech.** With 2a and 2b, the building
stock has to carry the cap, which is the point. Sparks at 200,000 wants a ceiling
near 300,000–400,000, i.e. a building base of **75,000–100,000** at ×4 — roughly 40
Archives, 30 Academies and 45 Observatories, doubled by Morellonomicons. That is a
real science build-out and it is what Era 2 should be *for*.

**2d. Acolyte 0.04 → 0.012 devotion/s.** Part 1.1. Fixes the Worship input at
source; the Convergence stripe question becomes measurable afterwards.

**2e. Jungler 0.15 → 0.30 vigor/s.** Exact parity. Unblocks the Wilds.

**2f. Shelter `timber 20 + provisions 10` @1.75 → `timber 8` @2.20.** Part 1.2.

---

## Part 3 — Morellonomicon, respecced against the real compendium

Jerry's structure is right and the source confirms it exactly: Kittens runs
**parchment → manuscript → compendium**, and RR is missing the third tier.

```js
// Kittens: manuscript <- culture 400 + parchment 25 ; compedium <- science 9000 + manuscript 55
{ id: "morellonomicon", name: "Compile Morellonomicon",
  cost: { tome: 30, knowledge: 9000 }, out: "morellonomicon",
  desc: "+150 knowledge cap each, up to a doubling of what your halls can hold. " +
        "Every tome cross-read and reconciled into one volume that argues with itself.",
  show: function (s) { return s.upgrades.crossReferencing; } },
```

- **30 Tomes** ≈ Kittens' 55 manuscripts, adjusted because an RR Tome costs 50
  parchment where a manuscript costs 25.
- **9,000 Knowledge** is Kittens' compendium science cost verbatim. It is
  self-referential in the way Kittens intends: you spend from a bank the cap already
  limits, so the line can never outrun itself.
- **+150 cap each, clamped to the building cap** (2a). Kittens uses +10 against a
  ~40,000 building cap; RR's Era-3 building cap target is ~100,000, so +150 keeps
  the same "hundreds of units to reach the clamp" feel at RR's scale.

**Does this solve the Observatory/science stall?** Yes for the ceiling, no for the
Observatory, and the second half is not what your §5 thought it was:

- *The ceiling*: solved. Two sources — buildings and a clamped compendium line —
  exactly as Kittens has it, with the clamp preventing the v0.40 collapse and the
  second source preventing the v0.41 stall.
- *The Observatory*: RR's is **already cheaper than Kittens'** (50 beams vs 50
  scaffold = 2,500 beams). Its unaffordability is an income problem. **Do not trim
  it.** Part 4 is the actual fix.

**And Tomes get their real job back.** In Kittens, manuscripts raise the **culture**
cap, through `getUnlimitedDR(manuscripts, 0.01)`. RR deleted the Tome cap line and
left Tomes as a pure currency. Give them Kittens' actual role:

```js
caps.culture += unlimitedDR(Math.floor(S.res.tome || 0), 0.01);
```

That also feeds the caravan line, since caravans are now the primary culture sink —
so the scribal chain and the trade chain start supporting each other, which is
exactly how Kittens' manuscript economy behaves.

---

## Part 4 — Craft yields, stockpiles, and why the Observatory is unaffordable

Jerry's reminder — *players craft over time and stack it* — is the key to your §5,
and the source explains it.

**Kittens' craft ratio is a plain additive sum with no cap:**

```js
// game.js:4113
getCraftRatio: function(tag) {
  return this.getEffect("craftRatio") + this.village.getEffectLeader("engineer", 0) + ...
}
// workshop  craftRatio 0.06/copy      factory  craftRatio 0.05/copy
```

A developed Kittens settlement with ~20 workshops and ~20 factories runs about
**×3.2**. RR runs `1 + limitedDR(0.06·workshops + …, 4)` → **×5**, and then multiplies
the scriptorium upgrades on top: Parchment ×1.25 ×1.5, Tome ×1.25 ×1.5, giving
**×9.375** — roughly **3× Kittens' ceiling**.

And it compounds per tier:

| Chain | Nominal | At RR's ×9.375/tier | Discount |
|---|---|---|---|
| 1 Parchment | 175 furs | 18.7 furs | ×9.4 |
| 1 Tome | 8,750 furs | **99.6 furs** | **×88** |
| Kittens' 1 Manuscript at ×3.2 | 4,375 furs | ~430 furs | ×10 |

**That ×88 is why v0.40 reached Doors of Icathia at year 231.** We have been tuning
nominal recipes for four rounds while the game ran on numbers up to 88× smaller —
and on a four-tier Era-3 chain the ceiling is ×5⁴ = **×625**.

**Recommendation: `CRAFT_YIELD_LIMIT` 4 → 2.2**, giving ×3.2 at ceiling — Kittens
parity — and drop the scriptorium multipliers from ×1.25/×1.5 to ×1.10/×1.20 so the
scribal chain sits at ×4.2 rather than ×9.375. Then apply craft yield to
Morellonomicon normally; at ×4.2 on a third tier it no longer collapses the ladder,
so the exemption I asked for last draft is unnecessary.

**Now the stockpile point, which is the answer to §5.** Kittens prices the Warehouse
at `beam 1.5, slab 2` — *fractional crafted goods*. It can do that because crafted
materials accumulate slowly and permanently: a player is expected to hold a few
dozen beams, not a few thousand. RR's Warehouse asks for 6 beams and 8 stone slabs
— four times Kittens' — and the Observatory's 35 slabs and 50 beams then compound at
1.10 across 28 copies.

The fix is not to cut the recipe. It is that **RR's raw income has to reach Kittens'
relative scale so the stockpile builds while the player does other things.** Ore is
at exact parity per miner (0.25/s) but RR's ore *multiplier stack* is thinner than
Kittens' minerals stack, which carries Mine, Quarry, Steamworks, Magneto, happiness,
leader, paragon, faith, festival and season. Concretely, and in order of impact:

1. **Warehouse `beam 6, stoneSlab 8` → `beam 2, stoneSlab 3`** — Kittens parity,
   scaled ×1.5 for RR's higher beam cost. This is the building the player buys
   constantly and it should not be a crafting project.
2. **Add a Quarry** — Kittens has Mine *and* Quarry both feeding minerals, at 1.15.
   RR has only the Mine. A second ore multiplier building is the single largest
   missing piece of the ore stack.
3. **Report the ore multiplier stack** at a developed settlement so we can compare
   category counts directly against Kittens' ten.

---

## Part 5 — Divergence table

Everything checked, with a verdict. "Keep" means the divergence is deliberate and
correct for RR.

| Item | Kittens | RR v0.41 | Verdict |
|---|---|---|---|
| Library / Academy / Observatory / Biolab science % | 0.10 / 0.20 / 0.25 / 0.35 | identical | **exact — do not touch** |
| Their science max | 250 / 500 / 1000 / 1500 | identical | **exact** |
| Their price ratios | 1.15 / 1.15 / 1.10 / 1.10 | identical | **exact** |
| Workshop craft bonus | 0.06/copy | 0.06/copy | **exact** |
| Ziggurat culture cap | +8% | Watcher's Eye +8% | **exact** |
| Tradepost trade ratio | 0.015/copy | Trade Dock 0.02/copy | 1.33× — keep |
| Barn × Warehouse storage | ×14.98 | Masonry ×22.05 | 1.47× — keep |
| Science cap multiplier line | **none** | Scholarship ×22.4 | **fix → ×4** |
| Compendium cap contribution | +10, clamped to building cap | deleted in v0.41 | **restore, clamped** |
| Manuscript effect | culture cap via UDR | none | **restore** |
| Craft ratio ceiling | ~×3.2 additive, uncapped | ×5 LDR, ×9.375 scribal | **fix → ×3.2 / ×4.2** |
| Tech count / span | 61 / 833,333× | 22 / 166,667× | **add 9–12 Era-3 techs** |
| Median tech step | ×1.12 | ×1.56 | consequence of the above |
| Miner | 0.25/s | 0.25/s | **exact** |
| Woodcutter | 0.09/s | 0.30/s | 3.3× — keep |
| Scholar | 0.175/s | 0.30/s | 1.7× — keep |
| Hunter / Jungler | 0.30/s | 0.15/s | **fix → 0.30** |
| Priest / Acolyte | 0.0075/s | 0.04/s | **fix → 0.012** |
| Heads fed per farmer | 1.18 | 1.43 | 1.2× — keep |
| Entry housing | hut, wood 5, r2.5, +2 | Shelter, timber 20 + prov 10, r1.75, +2 | **fix → timber 8, r2.20** |
| Warehouse cost | beam 1.5, slab 2 | beam 6, stoneSlab 8 | **fix → beam 2, slab 3** |
| Observatory cost | iron 750, sci 1000, slab 35, **scaffold 50** | ore 750, kn 1000, slab 35, **beam 50** | RR cheaper — **do not trim** |
| Ore-side buildings | Mine + Quarry | Mine only | **add a Quarry** |
| Gear recipe | steel 15 | steel 25 | 1.67× — keep |
| Alloy recipe | titanium 10 + steel 75 | zaunore 60 + coalgas 30 | keep |
| Price-ratio mix | 65% at 1.15 | 68% at 1.15 | **exact** |

---

## Part 6 — Order, and what to verify

1. **Part 4** — `CRAFT_YIELD_LIMIT` → 2.2, scriptorium → ×1.10/×1.20, Warehouse
   recipe. Everything else is measured against effective costs, so this lands first.
2. **Part 2a / 2b / Part 3** — restore the clamp, cut Scholarship to ×4, add the
   Morellonomicon, give Tomes the culture cap. One pass; they are one system.
3. **Part 2d / 2e / 2f** — Acolyte, Jungler, Shelter.
4. **Part 4.2** — the Quarry.
5. **Part 1.3** — 9–12 new Era-3 techs at ×1.3–1.5 steps. Largest content item;
   do it last so it is tuned against a working economy.

Pass conditions:

- **Knowledge ceiling sits between 1.5× and 2.5× the next unresearched tech's price
  at every point from year 30 onward** — this is the single number that says the
  knowledge curve matches
- Morellonomicons contribute between 30% and 50% of the live cap (the clamp binding
  means they are at ceiling)
- **Median cost-sorted tech step ×1.15–1.35**; no step above ×3
- Sparks between y350 and y500; Doors of Icathia between y1,400 and y2,300
- Observatories built ≥30 by Chemtech, with **no change to their recipe**
- Effective post-yield input cost per unit, every craft, reported — the Tome should
  land near 400 furs, not 100
- Worship at Sparks within 3× across five seeds, then set the Convergence stripe
- No regression: `G < 0.8` at max `M`; crystals produced; morale below 90 for ≥10%
  of samples before y50; first champion by y120; 130 wanderers by y600

**Sources:** all Kittens values read from
[nuclear-unicorn/kittensgame](https://github.com/nuclear-unicorn/kittensgame) —
`js/science.js`, `js/buildings.js`, `js/workshop.js`, `js/village.js`,
`js/resources.js`, `game.js`.
