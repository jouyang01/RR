# BUILDER SPEC v0.47 — the ladder gets Kittens' prices, and Worship stops tracking the economy

Measured against `index_46.html`, verified line by line. Every Kittens value below was read
from `nuclear-unicorn/kittensgame` in this session.

**Part 1 was the largest lever in the project and your isolations proved it cleanly.** Era 3
86 → 157 → 363 game-years in three rounds. The two isolation runs are the most useful
measurement anyone has produced here, and one of them says something neither of us
expected: **V1, deleting four lines of passive vigor, is worth 95 game-years of Era 3 —
nearly as much as re-pricing four buildings.**

Jerry named three things this spec has to answer. Short versions, before the arithmetic:

- **§1 — why Sparks went backwards.** My Part 5 said "re-skew" without saying "hold the
  landmark prices," so the trim cut Call to Arms 14,000 → 7,700 and Sparks 20,000 → 15,400.
  That is my error, and Part 1 below fixes it by pinning **every** RR tech to a Kittens tech
  price at the matching rank — not approximately, exactly.
- **§3 — the stripe cannot work, and you are right.** But the defect is not the curve and
  not `s`. **RR's Worship grows ×1,256 across Era 3 because devotion is multiplied by the
  whole industrial stack and its job cap is a building count. Kittens' faith is `transient`
  and its priests compete for population.** Fix the supply and Kittens' own stripe of 1,000
  works untouched. Part 2.
- **§8.2 — trade is dead pre-Era 3.** Jerry has approved Shelter 75. Part 3 ships it and
  says why the trade *cost* should not move with it.

**Part 4A is offline progression**, and the headline there is that RR already has it and it
is broken: the current `applyOfflineProgress` makes one `applyProduction(elapsed)` call, so
nothing that lives in `tick()` — population growth, starvation, champion XP, seasons,
weather, events — happens while the player is away, and twelve hours of income accrues even
against a ceiling that filled after ten minutes.

And one thing nobody asked about, found while checking that Jerry's Mining/Carpentry swap
would not break a dependency: **the Quarry and the Observatory have both been unbuildable
until Sparks since v0.46 shipped**, because I moved them onto `scaffold` without checking
that scaffold's own recipe is gated on Sparks. Part 1.4(a). It changes how two of this
round's measurements should be read.

---

## Part 0 — Concessions

**0.1 — The re-skew's price cuts were mine.** "Re-skew to Kittens' shape" without pinning
the anchors let the ladder's *level* move while its *shape* was being fixed. Your §8.4
isolates it at −94 years of Era 3 entry. You flagged it as "a real trade not flagged in the
spec," which is exactly right; it was not a trade you chose, it was one my wording made
invisible.

**0.2 — Part 2 V4's Shelter number was mine and it was wrong.** I wrote `vigor: 40` for a
`pop 2` building against Kittens' hut carrying `manpowerMax 75` for `maxKittens 2`. I had
the source open when I wrote it. Your §8.2 traced the dead trade layer to it and your
proposed fix is the one Jerry approved.

**0.3 — Part 5A's "no material cost on any Lore tech" is being partially reversed by Jerry,
and I should have scoped it by era in the first place.** Stripping all 23 was the right
call for Eras 0–2 and the wrong call for Era 3. Part 4.2.

**0.4 — v0.46 Part 1 moved the Observatory onto `scaffold 50` and I never checked
scaffold's own tech gate.** It is `show: s.techs.sparks`, so the Observatory *and* the
Quarry have both been unbuildable until Era 3 in the shipped build. Part 1.4(a). Two of
your measurements were taken on buildings that could not be built.

**0.5 — I asked for `W₂/W₁` and then gave you a condition that could not be met by the
lever I told you to pull.** "The band holds iff the ratio is 2.4" was true; what I never
checked was whether RR's ratio *could* be 2.4. It cannot be, at ×1,256, and no `s` fixes
that. Part 2 is what I should have written three rounds ago.

Three things you shipped that I want on the record: instrumenting the isolations against
the *older* builds (§0.2) is the reason this round has attributable numbers at all;
narrowing the Transmute and storage-ceiling exemptions (§9) found two live visibility bugs
that nobody asked you to look for; and refusing to back-solve a two-variable composition
from one number (§7) is precisely the discipline the harness needed.

---

## Part 1 — Every tech price becomes a Kittens tech price at the matching rank

Your §8.4 is the finding. The trim fixed the shape by moving the level, and the level is
what paces Era 3 entry.

**The rule from here: RR's ladder is Kittens' ladder, rank for rank, with ties added where
RR needs branches.** Not "shaped like." Identical values.

### 1.1 Ranks 1–20, to Sparks — no material cost on any of these (Jerry's directive)

| # | RR tech | **price** | Kittens tech at that rank |
|---|---|---|---|
| 1 | Almanac | **30** | calendar 30 |
| 2 | Cultivation | **100** | agriculture 100 |
| 3 | Woodcraft | **300** | archery 300 |
| 4 | **Mining** | **500** | **mining 500** |
| 5 | Expedition Logistics | **500** | animal 500 *(tie)* |
| 6 | **Scriptorium** *(promoted from Discovery)* | **900** | metal 900 |
| 7 | **Carpentry** *(new)* | **1,000** | math 1,000 |
| 8 | **Trade Routes** | **1,200** | brewery 1,200 |
| 9 | **Songcraft** | **1,300** | construction 1,300 |
| 10 | Smelting | **1,500** | civil 1,500 |
| 11 | Masquerade | **1,500** | engineering 1,500 *(tie)* |
| 12 | Abyssal Cartography | **2,000** | stripMining 2,000 |
| 13 | Yordle Ingenuity | **2,000** | clearCutting 2,000 *(tie)* |
| 14 | Hextech Theory | **2,200** | currency 2,200 |
| 15 | Drake Lore | **3,600** | writing 3,600 |
| 16 | Petricite Masonry | **9,500** | philosophy 9,500 |
| 17 | Void Studies | **12,000** | steel 12,000 |
| 18 | Rites of Targon | **12,000** | *(tie)* |
| 19 | **Call to Arms** | **15,000** | machinery 15,000 |
| 20 | **Sparks Beyond the Wall** | **20,000** | **theology 20,000** |

The ×2.64 jump at rank 15→16 (`writing → philosophy`) is the one RR has never had, and it
is the largest single reason RR's median and mean diverged in the wrong direction.

**Jerry's swap — Mining to rank 4, Carpentry to rank 7 — is a better mapping than what I
had.** RR's Mining now sits on Kittens' `mining 500` literally, and Carpentry lands on
`math 1,000`. It also removes a hazard I had left in: the Mine, the Warehouse, Slab-Cutting
and the Academy all want ore, and putting Mining three ranks earlier means the ore economy
exists before anything asks for it. **Part 1.4 is the dependency work the swap requires,
and it turns out one of those dependencies is already broken in the shipped build.**

### 1.2 Ranks 21–38, Sparks to Icathia — these carry material costs (Jerry's directive)

Kittens' ranks 20–36 verbatim, plus one tie:

**28,000 · 35,000 · 42,000 · 50,000 · 50,000\* · 55,000 · 60,000 · 60,000\* · 65,000 ·
75,000 · 85,000 · 90,000 · 100,000 · 115,000 · 115,000\* · 125,000 · 125,000\* ·
135,000 (The Doors of Icathia)**

### 1.3 The four conditions, computed on the table above

| | value | target |
|---|---|---|
| tech count | **38** | 38 |
| exact ties | **8** | ≥5 |
| median step | **×1.1333** | ×1.10–1.20 |
| geometric mean | **×1.2553** | ×1.25–1.30 |
| largest step | **×3.33** | Kittens' own `calendar → agriculture` |

All four hold, and now they hold *because the prices are Kittens' prices* rather than
because a distribution was tuned to satisfy them. **Call to Arms goes 7,700 → 15,000 and
Sparks 15,400 → 20,000.** Your §8.4 isolation says that alone is worth roughly +94 years of
Era 3 entry, which should put Sparks near y180–200 before anything else in this spec lands.

### 1.5 Sparks is a floor, not a band — Jerry's ruling, and it changes what §8.4 means

**Jerry has ruled that Era 3 *entry* is not a target.** The y350–500 figure in the pacing
table is a guideline whose only job is to stop Eras 0–2 being rushed; the number that
matters is **Doors of Icathia at y1,400–2,300**.

That retires the framing of your §8.4 and of my Part 0.1 concession — the ladder's price
cuts were still a defect, but because they cut the *level* of a ladder that is supposed to
be Kittens', not because Sparks landed at y98. **Stop treating Sparks as a miss.**

Replacement condition, and it is one-sided:

- **Sparks not before y150.** Below that, Eras 0–2 are being cleared faster than the pacing
  model's Era 1 band (y100–250) allows, and that is the thing the guideline exists to
  catch. There is no upper bound.
- **Icathia y1,400–2,300.** This is the target. Currently y463.1.

Report Era 0–2 milestones — Rites of Targon, first champion, Call to Arms — alongside
Sparks, so a fast entry can be attributed to a specific era rather than to the ladder as a
whole.

### 1.4 Recipe gates the swap requires — and one live deadlock in v0.46

**Ship these with Part 1. Two of them are the swap; the third is a bug I introduced in
v0.46 Part 1 and neither of us caught.**

**(a) The Scaffold deadlock — this is the one that matters.** In `index_46.html`:

```js
{ id: "scaffold", name: "Assemble Scaffold", cost: { beam: 40 }, out: "scaffold",
  show: function (s) { return s.techs.sparks; } },          // <- 15,400 knowledge
```

against

```js
{ id: "quarry",       ..., tech: "petricite",      cost: { stoneSlab: 1000, steel: 125, scaffold: 50 } },  // 4,600
{ id: "observatory",  ..., tech: "ritesOfTargon",  cost: { ore: 750, knowledge: 1000, stoneSlab: 35, scaffold: 50 } },  // 6,500
```

**Both buildings unlock roughly 10,800 knowledge before the recipe for one of their inputs
exists.** The Quarry has been gated behind Sparks since v0.46 shipped, and so has the
Observatory. This is my error: v0.46 Part 1 moved the Observatory from `beam 50` to
`scaffold 50` to match Kittens' depth, and I never checked scaffold's own gate.

It also reframes two of your findings. Your §6.4 reports "0 Quarries at Sparks, 8 at
Hexcore, 37 at Icathia" and attributes the late arrival to the re-pricing — **the price is
real but the zero is a hard gate, not an economic choice.** And §8.1's Observatory
behaviour is being measured on a building that could not be built for the first two thirds
of the run.

**Fix: beam and scaffold both unlock at Carpentry.** Kittens gates neither behind a tech at
all — both arrive with the Workshop building — so putting the whole timber chain on one
tech is the closest single-axis equivalent:

```js
{ id: "beam",     ..., show: function (s) { return s.techs.carpentry; } },   // was woodcraft
{ id: "scaffold", ..., show: function (s) { return s.techs.carpentry; } },   // was sparks
```

Carpentry is rank 7 (1,000), the Quarry rank 16 (9,500) and the Observatory rank 18
(12,000), so both have a nine-rank runway. **Re-measure the Quarry and Observatory counts
against this rather than against v0.46's — the price finding needs re-establishing on a
build where they were actually buildable.**

**(b) The Warehouse moves to Carpentry.** It costs `beam 2, stoneSlab 3` and is currently
`tech: "mining"`. With Mining at rank 4 and beams at rank 7 it would be visible for three
ranks with an uncraftable input. Moving it is also parity: Kittens' `construction` unlocks
`buildings: ["logHouse", "warehouse", "lumberMill", "ziggurat"]` — **the Warehouse and the
Lumber Mill come from the same tech in the source.** Carpentry is RR's `construction`.

Slab-Cutting stays on Mining (rank 4); `stoneSlab ← ore 200` needs nothing else.

**(c) Nothing else breaks.** Audited every cost in `BUILDINGS` and `CRAFTS` against the new
ranks: the Storehouse is timber-only after Part 4.4, the Archive and Shelter are
timber/mana, the Academy wants ore and arrives at rank 6 behind Mining at 4, and the Harbor
wants `gear` which needs Smelting at rank 10 regardless. **Add a startup assertion that no
building or craft is reachable before every one of its cost components is** — this class of
defect has now cost two rounds and a one-time graph walk catches all of it.

**One parity gap found in the same audit, deferred deliberately.** RR's Longhouse unlocks
from Woodcraft (rank 3); Kittens' logHouse unlocks from `construction`, which is Carpentry
at rank 7. RR gets its second housing tier four ranks earlier than the source. Moving it is
a population-curve change and must not ride along inside a round that already moves the
ladder — **v0.48**, and only after Part 1's isolation is read.

---

## Part 2 — §3: the stripe is not the problem, the Worship supply is

You measured `W₂/W₁ = 1,256` against a procedure that assumed 2.4, and concluded correctly
that no `s` can hold the band. **The right question is why RR's ratio is 1,256 when
Kittens' is about 10.**

### 2.1 What Kittens' faith actually is

Three things I had not read carefully enough until this round:

**Faith is `transient`.** `js/resources.js:144–150` — the same flag as science, culture and
manpower. No magneto, no reactor, no CMBR.

**Its building source is tiny.** `js/buildings.js:1904`, the Temple:
`effects["faithPerTickBase"] = 0.0015` — **0.0075/s per Temple, identical to one priest.**
RR's Shrine produces `devotion: 0.03` — **4× Kittens' Temple** — and receives the full
`globalNoReligion` stack on top.

**Nothing in Kittens raises the priest cap.** Priests compete for kittens like every other
job. RR's Acolyte is `max: 2 * count("shrine")`, so the acolyte count grows with buildings,
which grow with wealth, which grows with the production stack the devotion is then
multiplied by. **That is a feedback loop Kittens does not have**, and it is why a ×10 input
range becomes ×1,256.

`getSolarRevolutionRatio` reads `religion.faith` — the *praised pool*, described at
`js/religion.js:12` as "an amount of faith temporarily moved to a praised pool (aka
worship)" — so RR's Worship maps to it correctly. The mapping was never the defect.

### 2.2 The fix — three edits to the supply, then Kittens' own stripe

```js
// v0.47 Part 2. Kittens marks faith transient (js/resources.js:148) alongside science,
// culture and manpower. Devotion joins them: no Monument, no drakes, no Dragon Soul,
// no Baron buff. It already forgoes the religion category, so it now takes exactly
// what Kittens' faith takes.
var TRANSIENT = { knowledge: 1, culture: 1, vigor: 1, devotion: 1 };
```

```js
// Shrine: Kittens' Temple is faithPerTickBase 0.0015/tick = 0.0075/s (js/buildings.js:1904).
{ id: "shrine", ..., prod: { devotion: 0.0075, culture: 0.005 }, caps: { devotion: 75, culture: 15 } },

// Acolyte: no building-derived cap. Kittens has no structure that raises the priest
// count; priests compete for population like every other job, which is the only thing
// keeping Kittens' faith income roughly flat across a playthrough.
{ id: "acolyte", name: "Acolyte", desc: "+0.0075 devotion/s", prod: { devotion: 0.0075 },
  tech: "ritesOfTargon" },        // `max:` removed entirely
```

**Then set `s = 1,000` — Kittens' literal stripe**, `getUnlimitedDR(this.faith, 1000)` at
`js/religion.js:1549`. Stop deriving it. The five-round loop of re-deriving `s` against a
moving input ends by adopting the source's constant and fixing what feeds it.

### 2.3 What that pays, and why the 5–8% band was the wrong target

At `s = 1,000` the curve is Kittens' curve exactly:

| Worship | Convergence |
|---|---|
| 1,000 | 1.0% |
| 10,000 | 4.0% |
| 25,000 | **6.6%** |
| 65,000 | **10.9%** |
| 100,000 | 13.7% |
| 1,000,000 | 44.2% |

**Kittens does not hold a band either.** A first-run player's faith sits in 10k–100k, so
Solar Revolution runs 4–13.7% — the range comes from where the *stock* lands, not from
tuning. Jerry's 5–8% corresponds to Worship 25k–65k, a ×2.6 span, which is the 2.4 the
procedure always wanted.

So the target changes from "hold 5–8%" to **"land Worship at Icathia between 25,000 and
100,000" — Jerry has accepted this.** Currently 5,965,018. The three edits above cut the *level* by roughly ×4.5
(transient) × ×4 (Shrine rate) and cut the *growth rate* from building-bound to
population-bound, which is the ×1,256 → ×10 correction. If the level still overshoots after
measuring, the remaining lever is the Shrine's `devotion` cap, not `s`.

**Second-order effect worth naming: Convergence is currently paying +79% on all production
at Icathia.** Bringing it to ~10% removes a ×1.6 late-Era-3 production multiplier. This is
a pacing change as much as a band fix, and it should lengthen Era 3 on its own.

---

## Part 3 — §8.2: Shelter 75, and do not move the trade cost with it

**Shelter `vigor: 40` → `75`. Approved by Jerry, and it is straight parity** — Kittens' hut
carries `manpowerMax 75` for `maxKittens 2` (`js/buildings.js:468`). Longhouse 50 and
Skyrise 50 are already exact (logHouse and mansion, `:486` and `:509`) and stay.

Your §8.2 arithmetic: at 40, four Shelters are needed to hold one 150-vigor trade; at 75,
two are. Kittens needs one hut for a 50-catpower trade, so RR at two Shelters is one
housing step behind Kittens at one hut — acceptable, and Shelters arrive at y2.31.

**Do not also cut the trade cost.** The gate is doing exactly what Kittens' gate does once
the ceiling is right, and cutting both in the same round makes neither measurable. If two
Shelters still leaves trade dead before Sparks after this ships, the next lever is the
cheapest route's vigor cost (150 → 100), not the ceiling again.

**§8.3 follows from the same change.** Vigor sits at cap 41.4% of the time because the
ceiling stopped growing with population while income did not stop. Raising the ceiling
×1.875 and opening the trade sink should both bite. **Re-measure rather than re-tune** —
if it is still above 10%, report it and we treat it as a finding rather than adjusting two
things at once.

---

## Part 4 — Jerry's design items

### 4.1 The ladder ordering items, folded into Part 1.1

Three of Jerry's items are ordering constraints and Part 1.1 already satisfies all of them:

- **Carpentry replaces Falconry**, at rank 7 (1,000) after Jerry's swap. It unlocks the
  **Lumber Mill**, the **Warehouse**, the **Support Beam** and **Scaffold** recipes and
  **Reinforced Saw** — which is `construction` in Kittens (`js/science.js:124–127`:
  `buildings: ["logHouse","warehouse","lumberMill","ziggurat"]`,
  `upgrades: [..., "reinforcedSaw"]`). One tech opening the timber buildings and the timber
  chain together is the source's own pairing, and it is now a closer match than the version
  I wrote, because the Warehouse joins it. Retire Falconry and its Jessed Hawks Discovery,
  or re-home Jessed Hawks onto Expedition Logistics.
- **Scriptorium becomes a Lore tech** at rank 6 (900), unlocking the Academy. Kittens'
  `math` unlocks `buildings: ["academy"]` (`js/science.js:109–112`), so this is parity, not
  just tidiness. It stops being a Discovery.
- **Trade Routes at rank 8, after Carpentry (7) and Scriptorium/Academy (6). Songcraft at
  rank 9, after Trade.** Both as Jerry asked, and the swap makes the Carpentry constraint
  tighter rather than looser — Trade is now one rank behind Carpentry instead of four.

**Support Beams and Scaffolds are gated by Carpentry** — Part 1.4(a), which is also where
the live deadlock is. Kittens gates neither behind a tech; both arrive with the Workshop
*building*. RR gating them on a tech is a one-axis divergence in the same spirit, and it is
what makes Carpentry a real unlock rather than a building permit.

### 4.2 Material costs return, from Sparks onward only

Jerry's directive reverses half of v0.46's §6.3. **Ranks 1–20 are knowledge-only.
Ranks 21–38 carry materials.** Restore the material components you stripped from the
Era-3 techs in §6.3 — `sparks steel 200`, `hexdraulics beam 40`, `sumpEcology plating 30`,
`progressDay culture 2000`, `chemtech culture 600`, `chemBaronAccords alloy 40`,
`gloriousEvolution hexgear 30 + shimmer 40`, `hexcore culture 800 + crystals 60`,
`atlasGauntlets plating 120`, `hexgate hexcore 3 + hexSlab 150`, `deepWorks culture 900 +
hexcore 5`, `greyReclamation shimmer 200`, `voidglassOptics voidglass 6 + hexSlab 200`,
`watchersBelow trueice 400 + poroTears 40`, `icathia culture 1200 + hexcore 10`.

**Leave the Era 0–2 re-homing exactly as you shipped it** — masquerade, hextech,
voidStudies, ritesOfTargon, callToArms, championsRegimen, deepCartography and
refinedMetallurgy keep their costs on the Discoveries that absorbed them.

State the divergence honestly in the code comment: Kittens' techs are priced in science
alone at every rank. RR's Era-3 techs carrying materials is Jerry's design call. It slows
Era 3, which is the direction that needs slowing, and it does not push any curve past
Kittens'.

### 4.3 Cultivation: no Granary

RR has no Granary and is not getting one. Kittens' `agriculture` unlocks `buildings:
["barn"]` and `jobs: ["farmer"]` — RR's Cultivation already unlocks the Storehouse (the
barn analogue) and RR has farmers from the start.

```js
{ id: "cultivation", name: "Cultivation", cost: { knowledge: 100 }, req: "almanac",
  desc: "Rows, seasons, and a reason to stay. Provisions +10%; unlocks the Storehouse and Iron Plows." }
```

The **+10% provisions** is an RR addition with no Kittens counterpart — `agriculture`
itself grants no production effect there. It is small enough not to matter to any curve and
it gives the tech a felt effect in a game where the farmer already exists. Put it in the
`resRatio` category alongside Sump Ventilation and friends so it occupies a slot the
source has, even if the source does not fill it here.

### 4.4 Storehouse: timber only, on Kittens' barn

Kittens' barn (`js/buildings.js:758–790`): **`wood 50`, `priceRatio 1.75`**, caps
`catnip 5000, wood 200, minerals 250, coal 60, iron 50, titanium 2, gold 10`.

RR's Storehouse is `timber 60, ore 75` at ratio 1.75 with caps `provisions 750, timber 200,
ore 150, mana 100`.

**Take the price ramp, not the food cap. Jerry's call, and he is right about why.**

```js
{ id: "storehouse", name: "Storehouse", group: "Storage", tech: "cultivation",
  cost: { timber: 50 }, ratio: 1.75,
  caps: { provisions: 750, timber: 200, ore: 250, mana: 100 } },
```

- **`timber 50`, ratio 1.75** — Kittens' barn (`wood 50`, `priceRatio 1.75`) exactly. The
  ore cost goes; the barn is priced in one raw material and so should the Storehouse be.
  This also removes an ordering hazard on its own: the Storehouse arrives at Cultivation,
  rank 2, and used to demand ore.
- **`provisions 750` stays.** I had proposed 5,000 on the reasoning that Kittens' barn holds
  25× as much catnip as wood. **That reasoning does not survive the mapping**: Kittens'
  catnip is one resource doing two jobs — the food a kitten eats and the thing a Field
  produces — and RR splits it into **provisions and mana**. There is no single RR resource
  the barn's `catnipMax 5000` corresponds to, so transplanting the ratio would inflate one
  half of a split resource against a ceiling that was sized for both. Leave it.
- **`ore 150 → 250`** — approved. `minerals` has a clean one-to-one analogue in `ore` and
  250 is the barn's own number.
- **`gold: 10` is added**, and it is the barn's own number too. See 4.4b.

**Do not compensate elsewhere.** v0.45 Part 4 set consumption at 85% of a farmer's output
deliberately, and with the provisions ceiling unchanged that pressure is untouched.

### 4.4b The gold ceiling belongs to the storage line, not the Trade Dock

Jerry's item, and it is parity — I checked both halves.

**Kittens' `tradepost` grants no `goldMax` at all** (`js/buildings.js:1665–1683`). Its whole
effect set is `tradeRatio 0.015`, three demand-ratio reductions and `standingRatio`. The
gold ceiling comes from the storage line and one dedicated building:

| Kittens building | goldMax |
|---|---|
| barn | **10** |
| harbor | **25** |
| mint | 100 |
| ivoryTemple | 10 |

— and all of them are inside `addBarnWarehouseRatio`, so the storage upgrades multiply the
gold ceiling exactly as they multiply wood and minerals.

RR has it on the wrong building. The **Trade Dock** (`tech: "trade"`, "Caravan yields +15%
each, +100 gold cap") is RR's tradepost, and it is the only trade building in either game
that raises a storage ceiling.

```js
// Trade Dock: caravan yields only. Kittens' tradepost grants no goldMax.
{ id: "tradeDock", ..., effect: "Caravan yields +15% each",
  cost: { timber: 180, ore: 260, gold: 60 }, ratio: 1.15 },        // caps: removed

// Storehouse picks up the barn's own gold term (see 4.4).
{ id: "storehouse", ..., caps: { provisions: 750, timber: 200, ore: 250, mana: 100, gold: 10 } },
```

**Leave the Warehouse at `gold 80` and the Harbor at `gold 200`.** Both are material stores
and both already carry the line; Kittens' harbor carries gold for the same reason. The net
change is −100/copy from a building at ratio 1.15, which is a real reduction in the
ceiling — **so measure it before compensating.** Gold is now a trade gate (Part 3, 45–90 per
route), so report **peak gold, the gold ceiling, and whether the ceiling ever binds a
trade**, at Sparks and at Icathia. If it binds, the lever is the Warehouse's gold term,
which is a material store and the right home for it. It is not the Trade Dock.

**One slot RR does not have, noted for later:** Kittens' **Mint** is a dedicated gold
building — `goldMax 100 × (1 + warehouseRatio)`, and it converts catpower into gold. RR has
no analogue, and with vigor now a real catpower it would be a natural sink for both.
**v0.48 at the earliest**, and only if 4.4b's measurement says the ceiling binds.

### 4.5 Tab order and name

Kittens' buildings unlock tabs in this order — village from the hut (`js/buildings.js:462`),
science from the library (`:565`), workshop from the workshop (`:1482`) — so Jerry's
requested order is the source's:

```js
var TABS = [
  { id: "settlement", name: "Settlement", ... },
  { id: "village",    name: "Wanderers",  show: count("shelter") > 0 },
  { id: "lore",       name: "Lore",       show: count("archive") > 0 },
  { id: "crafting",   name: "Workshop",   show: <a real recipe exists> },   // renamed
  { id: "wilds", ... }, { id: "trade", ... }, { id: "targon", ... }, { id: "champions", ... }
];
```

Rename **Crafting → Workshop**. Keep the Transmute exclusion in the `show` predicate
exactly as shipped.

### 4.6 Expedition yields respect what the settlement has seen

**Krugs must not drop Hextech Crystals before crystals exist.** This is RR's own v0.44
gameplay-note-4 rule — "Chronicle events fire only on resources the settlement has actually
held" — applied to the one system it was never extended to.

```js
// One predicate, used by chronicle events, expedition yields and trade slots alike.
function yieldAllowed(res) { return (S.seenMax[res] || 0) > 0 || resUnlocked(res); }
```

Apply it to `EXPEDITIONS[].run` and to faction slot rolls. **The Shaco boxes stay the one
deliberate exception** — a box producing something nobody has seen is the joke working, and
that exemption was made explicitly in v0.44.

### 4.7 Renown does not exist before Call to Arms

```js
function gainRenown(n) { if (S.techs.callToArms) gain("renown", n); }
```

Currently gated on `logistics` (rank 5), so Renown accumulates for fifteen ranks with
nothing to spend it on. **Also hide it from the Wilds panel** — expedition entries should
not display a `renown:` line, and the resource row should not render, until Call to Arms is
researched. Kittens' precedent is that a resource is not `visible` until it is `unlocked`;
RR shows a currency for most of the game before its only sink appears.

### 4.8 The stale "researchable" highlight

Jerry's report: text stays red after an item becomes researchable if the tab is not
switched, matching the button-highlight bug.

The highlight is being cleared on **tab switch** rather than on **render of the item**.
Clear it where the item is drawn, so the state lives with the thing it describes:

```js
// in the Lore/Workshop item renderer, after drawing:
if (S.pending && S.pending[t.id] && S.activeTab === <this tab>) delete S.pending[t.id];
```

Audit every `pending` / `isNew` / highlight flag in the same pass — this is the second
report of the same class and a per-item clear fixes all of them at once. Add an assertion
that no highlight flag survives one render of its own item while its tab is active.

---

## Part 4A — Offline progression (Jerry's directive)

Jerry wants the settlement to keep running with the tab closed or the machine off. **RR
already has offline progress and it is badly broken** — not missing, broken, in ways that
are easy to demonstrate. And the design review's account of how Kittens does it is right on
two of four points and wrong on the two that matter most for implementation, so I have
checked all four against `js/time.js` and `js/settings.js`.

### 4A.1 What RR does today, and everything it gets wrong

```js
function applyOfflineProgress() {
  if (!S.lastSaved) return;
  var elapsed = (Date.now() - S.lastSaved) / 1000;
  if (elapsed < 30) return;
  var capped = Math.min(elapsed, OFFLINE_CAP_HOURS * 3600);
  S.tick += Math.floor(capped / (TICK_MS / 1000));
  applyProduction(capped);                      // ONE call, dt up to 43,200 seconds
  addLog(...);
}
```

This is the naive `rate × time` shortcut, and because it calls `applyProduction` **once**
rather than `tick()` repeatedly, everything that lives in `tick()` and not in
`applyProduction()` simply does not happen while you are away:

| What is skipped | Where it lives |
|---|---|
| **Population growth** — no wanderer ever arrives offline | `tick()`, `if (S.pop < maxPop() ...)` |
| **Starvation** — a settlement cannot die offline | `tick()`, the `provisions <= 0` block |
| **Champion XP** | `tickChampXp(dt)` in `tick()` |
| **Season and weather changes** — the whole gap runs at the season you left in | the `seasonIdx` block in `tick()` |
| **Renown, expeditions, mischief, poro and chronicle events** | `tick()` |
| **Resource ceilings mid-gap** — 12 hours of income accrues even if the cap filled after ten minutes | one `applyProduction` call, capped once at the end |

The season one is the most visible: leave in Deepwinter and the farm multiplier of **×0.25**
is applied to twelve hours of catch-up; leave in Firstbloom and you get **×1.5** for twelve
hours. `S.tick` is advanced but the weather roll never fires.

### 4A.2 What Kittens actually does — two corrections to the design review

**Correct: it is timestamp-based, on the system clock.** `js/time.js:238–242` —
`delta = currentTimestamp - this.timestamp`, with the timestamp saved at `:36`. RR already
does this (`S.lastSaved`, autosaved every 30 s and on `beforeunload`), so point 1 needs no
work.

**Correct: it is opt-in.** `js/settings.js:121` — `enableRedshift`, `defaultValue: false`,
`isExtra: true`. But note `js/time.js:232`: `isMobile() ? true : opts.enableRedshift` —
**it is unconditionally on for mobile.** RR is a single-page game with no mobile/web split,
so the mobile branch is the relevant precedent: **ship it always-on.**

**Wrong: Kittens does not replay its tick function.** `applyRedshift` calls seven dedicated
per-manager routines — `resPool.fastforward`, `calendar.fastForward`, `bld.fastforward`,
`workshop.fastforward`, `village.fastforward`, `space.fastforward`, `religion.fastforward`
— and then a separate `resPool.enforceLimits(resourceLimits)` using limits captured
*before* the fast-forward. That is a closed-form-per-subsystem approach, not a replay.

**The recommendation is still right for RR, but for a different reason than the one given.**
Kittens split it that way because it has seven managers to fast-forward; RR has one `tick()`
and one `applyProduction()`. And Kittens' own source flags the cost of its choice three
times, in `js/time.js` at `:692`, `:783` and `:908`:

> `// XXX Partially duplicates resources#fastforward and #enforceLimits, some nice factorization is probably possible`

**Replay the real `tick()`. Do not write a second economy.** Not because the source does —
it does not — but because RR has exactly one code path to replay and Kittens' alternative is
the thing its own authors have flagged as fragile.

**Wrong: the cap is not ~8 hours, and it is not denominated in hours.** `js/time.js:249–256`:

```js
var maxYears = this.game.calendar.year >= 1000 || this.game.resPool.get("paragon").value > 0 ? 40 : 10;
var offset = this.game.calendar.daysPerSeason * this.game.calendar.seasonsPerYear * maxYears;
if (daysOffset > offset) { daysOffset = offset; }
```

**10 game-years for an ordinary player, 40 once past year 1000 or holding any paragon.** At
`daysOffset = Math.round(delta / 2000)` — 2,000 ms of real time per game day, so **1:1, no
discount** — those caps are:

| Kittens tier | game-years | real time |
|---|---|---|
| before year 1000, no paragon | 10 | **2 h 13 m** |
| after | 40 | **8 h 53 m** |

The "~8 hours" in the design review is the *late-game* cap. An early player gets a little
over two hours. **RR's `OFFLINE_CAP_HOURS = 12` is more generous than Kittens at either
tier** — 12 real hours is **54 game-years**.

**Keep 12 hours. It is a deliberate RR divergence and it is already load-bearing**: the
pacing model in the handoff assumes "3 h active plus two offline windows" to reach ≈50
game-years per real day, and cutting to Kittens' 10-year tier would roughly halve that.
Express it in game-years in the code so it is in the same unit as everything else the spec
measures.

**Unverified: the toggle exploit.** I could not confirm it, and the source runs the other
way — `delta = isRedshiftEnabled ? (now - ts) : 0; this.timestamp = now;` advances the
timestamp *whether or not* redshift is on, so disabling it **discards** elapsed time rather
than banking it. If there is a real double-dip it is somewhere I did not read. **Do not
design around it.** Shipping always-on removes the toggle and the question with it.

### 4A.3 The implementation

```js
// One shared step, called by the live loop and by catch-up alike. `simNow` is the
// simulated wall clock: during catch-up it advances with the replay; live it is Date.now().
function step(dt, simNow) { ... }              // the current body of tick(), verbatim
function tick() { step(TICK_MS / 1000, Date.now()); }
```

**Granularity: one game day per iteration.** Kittens' own fast-forward unit is the game day
(`delta / 2000`, and a day is 10 ticks × 200 ms = 2,000 ms), and it is the right unit here
too: at the 12-hour cap a replay is **21,600 iterations**, which is a second or two, where
tick granularity would be 216,000 calls to `computeRates()` and would block for far longer.
Everything that matters — seasons, caps, unlocks, population — resolves at day resolution.

```js
var DAY_MS = TICKS_PER_DAY * TICK_MS;                  // 2,000 ms, Kittens' own unit
var OFFLINE_CAP_DAYS = OFFLINE_CAP_HOURS * 3600 * 1000 / DAY_MS;   // 21,600 days = 54 game-years

function applyOfflineProgress() {
  if (!S.lastSaved) return;
  var days = Math.floor((Date.now() - S.lastSaved) / DAY_MS);
  if (days < 3) return;                                // Kittens' own UI-lag guard (time.js:247)
  days = Math.min(days, OFFLINE_CAP_DAYS);
  runCatchUp(days, S.lastSaved);
}
```

**Chunk with yields, not with a single blocking loop.** Replay ~500 days, hand control back
to the browser, repeat, with a "catching up…" indicator and a progress count. A player
returning after a week must see the game responding, not a frozen tab.

### 4A.4 Three RR-specific hazards the design review does not cover

These are the things that will silently produce wrong numbers, and they are the reason this
cannot be a two-line change.

**(a) `Date.now()` inside the step — 29 call sites.** `S.insightUntil`, `S.cinderUntil`,
`S.baronUntil`, `S.festivalUntil`, `S.honeyUntil` are all wall-clock deadlines, and
`tradeFatigue` computes `(Date.now() - f.t) / (FATIGUE_RECOVER_S * 1000)`. Replayed against
the real clock, a buff that was active when the player left is evaluated as **already
expired for the whole catch-up**, and a festival running at save time pays nothing. **Route
every one of them through the simulated clock**, and convert the `*Until` fields from
wall-clock timestamps to simulated ones in the same pass. This is the single most likely
place for the feature to look fine and be wrong.

**(b) `Math.random()` — 49 call sites, and per-tick probabilities.** The mischief roll is
`Math.random() < S.jackboxes * 0.0002` **per tick**; the poro event is `0.00004` per tick.
Replaying at day granularity fires each roll once per day instead of ten times, so events
land **10× too rarely** unless the probability is converted: `p_day = 1 - (1 - p_tick)^10`.
Do the conversion at the call site or pass the tick-count into the step. And these rolls
**must** fire — otherwise 54 game-years offline produce no renown, no expeditions and no
chronicle events, which is a worse bug than the one being fixed.

**(c) Ceilings, unlocks and population must resolve inside the loop, not after it.** This is
the whole reason for replaying rather than integrating: a resource that fills two game-days
in must stop earning on day three, a building that becomes affordable mid-gap must be
purchasable when the player returns rather than retroactively bought, and wanderers must
arrive on the same schedule they would have live. Kittens handles the first of these with a
separate `enforceLimits` pass; replaying gets all three for free.

**Report what happened.** The current log line says "the settlement carried on without you."
Replace it with a summary of the replay — game-years elapsed, resources gained, wanderers
arrived, events fired, and **whether the cap was hit** — so a player who was away for three
days understands they received twelve hours.

---

## Part 5 — Deferred, with the anchors recorded

**The Foundry/Reactor tier separation stays deferred to v0.48.** Your §7 anchor: RR is at
**×0.525** (Foundry 119,252 raw, Arcane Reactor 62,595) against Kittens' **×181** (Magneto
20,867 → Reactor 3,774,333). Thirty Arcane Reactors at `globalBoost 0.04` is +120% on all
production, bought at half the price of the thing they amplify. This is a large pacing
lever and it must not land in the same build as Part 2, which removes a different large
production multiplier.

**Your §10.3 — the Observatory going 45 → 49 after a ×7 price rise — I think you have the
cause right and it is worth naming precisely.** Kittens' `libraryRatio`
(`js/buildings.js:579`, three upgrades at 0.02 each) multiplies the *Library's* science cap
by the Observatory count, so an Observatory makes every Library worth more. RR has nothing
of the kind, so Observatories can only be bought, never improved. That is exactly the A2
slot I reserved in the v0.44 amendment and deferred twice. **v0.48, with the Reactor.**

---

## Part 6 — Order, and what to verify

### Order

1. **Part 1** — the ladder. Alone in the diff. It is a pure price change and its isolation
   is the cleanest measurement available.
2. **Part 2** — the Worship supply, then `s = 1,000`. Second-largest lever; it removes a
   ×1.6 production multiplier at the same time as it fixes the band.
3. **Part 3** — Shelter 75. One line.
4. **Part 4** — the design items. 4.1's ordering is inside Part 1; the rest touch nothing
   this round measures and can ship in any order. 4.4b's Trade Dock is the one to watch, as
   it lowers the gold ceiling.
5. **Part 4A** — offline progression. **Ship it last, and measure the pacing runs on the
   live loop as usual.** It changes no rate and no price, so it cannot confound Parts 1–3 —
   but extracting `step()` from `tick()` touches the hottest function in the file, and a
   regression there would poison every measurement in the round. Land the numbers first.
6. **Part 5** — no code.

*(The three UI animations that were drafted as Part 4B have moved to their own document,
`ANIMATION-CHANGES-v0.48.md`, and are v0.48 scope. Nothing in this spec depends on them.)*

### Pass conditions

- **Every tech price equals the Part 1 table exactly.** Assertion over the whole ladder,
  not a spot check; the table is the spec.
- Tech count **38**, ties **≥5**, median **×1.10–1.20**, geometric mean **×1.25–1.30**,
  largest step **≤×3.4**. All four together, as in v0.46.
- **No tech at rank ≤20 carries a non-knowledge cost; every tech at rank ≥21 does.**
- **Devotion receives `catCharts × catPolicy` and nothing else** — same assertion shape as
  knowledge, culture and vigor, noting devotion also forgoes `catReligion`.
- **Worship at Icathia between 25,000 and 100,000**, and **`W₂/W₁` ≤ ×30**. Report both,
  four seeds. This replaces the 5–8% band, which was never Kittens' behaviour.
- Convergence reported at Sparks and Icathia with `s = 1,000` unchanged from Kittens.
- **Acolyte count at Icathia ≤ 15% of population**, and no longer a function of Shrine
  count.
- **First trade completed before Sparks**, on every seed — report the game-year. Vigor at
  cap **<10%** of elapsed time; if it misses, report rather than tune.
- **Storehouse costs timber alone**, ratio 1.75, caps `provisions 750, timber 200, ore 250,
  mana 100, gold 10`. Report whether the food buffer binds — it should behave as in v0.46,
  and a change here means something else moved.
- **The Trade Dock grants no storage cap of any kind.** Report **peak gold, the gold
  ceiling, and whether the ceiling ever blocks a trade**, at Sparks and Icathia. If it
  binds, that is a finding for v0.48, not something to compensate for in this build.
- **Sparks not before y150** (one-sided; Era 3 entry is a guideline, not a target).
  **Icathia y1,400–2,300** is the condition that matters. Report Rites of Targon, first
  champion and Call to Arms alongside Sparks so a fast entry is attributable to an era.
- **No building or craft is reachable before every one of its cost components is.** One
  startup graph walk over `BUILDINGS` and `CRAFTS`, asserted, not spot-checked. **The
  Quarry and the Observatory fail this assertion on the shipped v0.46 build** — that is
  the test's first job.
- **Quarry and Observatory counts re-measured at Sparks, Hexcore and Icathia** now that
  both are actually buildable pre-Sparks. v0.46's figures were taken under a hard gate and
  the Part 1 price finding needs re-establishing against these.
- **Renown is zero until Call to Arms** and does not render before it. **Krug and every
  other expedition yield only resources the settlement has seen** — one assertion per
  expedition, cold start.
- **No highlight flag survives one render of its own item while its tab is active.**
- **Offline catch-up is the live step.** `tick()` and `runCatchUp()` call the same `step()`;
  assert there is no second production path in the file.
- **A 12-hour catch-up equals 12 hours of live play, within 1%**, on every tracked resource
  and on population — run the same seed live for 12 game-hours and offline for 12, and diff.
  This is the only condition that proves the replay is the live path.
- **Season changes, weather rolls, population arrivals, starvation, champion XP and events
  all occur during catch-up.** One assertion each; every one of them is skipped today.
- **A resource at its ceiling two days into a gap does not exceed it**, and **a resource
  whose cap rises mid-gap keeps earning** — the two cases a `rate × time` shortcut cannot
  get right.
- **Event frequency per game-year is within 10% of live**, confirming the per-tick →
  per-day probability conversion.
- **No `Date.now()` remains inside `step()` or anything it calls.** Grep-level assertion,
  29 sites today.
- **A 7-day absence caps at 12 hours, completes without freezing the tab, and says so in
  the log.** Report wall-clock duration of the replay at the cap.
- **The catch-up loop calls no render function** — `renderTop`, `renderAll` and
  `updateAffordability` each appear zero times inside it. One render after the replay ends.
- Tab order Settlement · Wanderers · Lore · Workshop · Wilds · Trade · Targon · Champions,
  with Workshop still hidden on a Transmute-only save and the Loremaster still hidden until
  an Archive stands.
- **Isolate Part 1 and Part 2 separately**, as you did this round. They are the only two
  pacing levers in the spec and the isolations are what made v0.46 interpretable.
- No regression: `caps.knowledge` == Σ(building caps) exactly; `buildingJobBoost` unbounded;
  morale ≥ 0.90 at Icathia; no champion at level 10 before Era 3; ore : timber reported at
  Sparks, Hexcore and Icathia with `linesOwned` recorded at all three.

**Sources, all read this session.** `nuclear-unicorn/kittensgame` —
`js/resources.js:120–150` (manpower, science, culture, faith all `transient`);
`js/religion.js:12` (the praised pool), `:1548–1551` (`getSolarRevolutionRatio`,
`getUnlimitedDR(faith, 1000)`), `:1599–1611` (`praise`);
`js/buildings.js:451–468` (hut, `manpowerMax 75` for `maxKittens 2`), `:486`, `:509`
(logHouse, mansion 50), `:462, 565, 1482` (tab unlock order: village → science → workshop),
`:758–790` (barn: `wood 50`, ratio 1.75, catnip 5000 / wood 200 / minerals 250 /
**gold 10**), `:905` (harbor `goldMax 25`), `:1665–1683` (**tradepost — `tradeRatio`,
demand ratios and `standingRatio`, and no `goldMax`**), `:1690` (mint `goldMax 100`),
`:1867` (chapel `faithPerTickBase 0.005`), `:1904` (temple `faithPerTickBase 0.0015`,
`faithMax 100`), `:579` (`libraryRatio`);
`js/time.js:36` (timestamp saved), `:191–231` (`applyRedshift` — seven per-manager
`fastforward` calls plus `enforceLimits`), `:232–256` (`calculateRedshift` — mobile always
on, `delta / 2000` ms per game day, the `daysOffset < 3` guard, the 10/40 game-year cap),
`:692, 783, 908` (the author's own duplication warnings);
`js/settings.js:121` (`enableRedshift`, `defaultValue: false`, web only);
`js/science.js` (the full 64-tech price table used for every rank in Part 1; `agriculture`
unlocks barn + farmer; `math` unlocks academy; `construction` unlocks lumberMill +
reinforcedSaw). Verified against `index_46.html` lines 232, 268–270, 435–437, 475–476,
575, 729, 1131, 1176, and the `TABS` and `TECHS` blocks.
