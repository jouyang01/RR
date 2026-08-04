# BUILDER SPEC v0.41 — Era 3 overshoot, the Tome reversal, and the trade revamp

Measured against `index_v040.html` through the real `morale()`, `computeCaps()`,
`craftYield()`, `tradeCaravan()`, `caravanCost()` and the shipped cost tables.

Six directives from Jerry land this round, and one of them — taking Tomes out of
the Knowledge cap — is the correct fix for the largest problem in the build. Part 1
explains why, because the rest of the document depends on it.

---

## Part 1 — Era 3 is now six times too fast, and the Tome line is why

Your isolation test was clean and the conclusion was right: the prices were never
the problem, and one `Math.min` was worth 1,745 years. But it overshot, and the
pacing table says so:

| | Sparks | Icathia | Era 3 span |
|---|---|---|---|
| Target (v0.39 §1) | y350–500 | **y1,400–2,300** | ~1,200 yr |
| v0.40 seed 1 | y196.9 | **y231.4** | **34.5 yr** |
| v0.40 seed 2 | y229.4 | **y338.0** | **108.6 yr** |

Five techs spanning 30,000 → 5,000,000 Knowledge — a 25× range — clear in 35 game
years. Chemtech to Hexcore is 0.7 years on seed 1. That is not a long grind before
the Era 4 payoff; it is a formality.

The cause is that the Knowledge cap has no bound on it at all once Tomes are
uncapped. A Tome costs 50 Parchment + 250 mana + 1,500 Knowledge and returns +150
cap × 1.25, and Parchment is fur-bound — so the whole Era-3 tech ladder became
**gated on fur income**, which is a Wilds resource with none of Era 3's crafting
depth behind it. The player never has to build the Era-3 chains to finish Era 3.

**Jerry's directive fixes exactly this**, and it is worth naming what it does
structurally: it moves the Era-3 gate off Tomes (fur-bound, shallow) and onto
Hexcore Laboratories (scaffold/plating/hexgear-bound, three craft chains deep).
That is the "material volume, not tech price" lever I asked for in v0.39 §7 and
never actually got, because Tomes kept routing around it.

---

## Part 2 — Jerry's six directives

### 2.1 Tomes no longer raise the Knowledge cap — and the three changes that must ship with it

```js
// DELETE this line from computeCaps():
caps.knowledge += 150 * Math.floor(S.res.tome || 0) * (S.upgrades.greatLibrary ? 1.25 : 1);
```

Tomes keep every other job they have: Cross-Referencing (5), The Annotated Index
(40), The Living Library (120), Watcher's Eye, and champion training below level 5.
So Tomes still raise the cap — **indirectly, through the Scholarship line, which is
multiplicative and gated**. That is a better shape than a linear per-copy add, and
it is worth putting in the Tome tooltip: "Tomes no longer widen the Archive by
themselves. They buy the Scholarship line, which widens everything."

**This change deadlocks the game unless three other things move with it.** I traced
the cap arithmetic before recommending anything, and the pre-Sparks ceiling is the
problem:

Building-only cap = `(150 + 250·Archives + 500·Academies + 1000·Observatories + 1500·HexLabs) × scholarMult`

where `scholarMult` is 1.6 → 2.8 → 5.6 → 11.2 → 22.4 across the five Scholarship
tiers. Sparks costs **200,000** Knowledge. Before Sparks:

- **Celestial Observatory is gated on Sparks** — both by `unlock: function (s) { return s.techs.sparks; }` and by its cost, since the Scaffold craft is itself `show: s.techs.sparks`. So the Observatory contributes nothing to the cap that buys Sparks.
- **The Great Index is `tech: "sparks"`**, so `scholarMult` before Sparks is only 1.6 × 1.75 = **2.8**.
- That leaves Archives and Academies alone. A realistic late-Era-2 stock (≈50 Archives, ≈30 Academies) is 27,650 base × 2.8 = **77,420** against a 200,000 price.

**Sparks becomes unreachable, and the run stalls exactly the way you measured at
year 65 in v0.39.** Three fixes, all required:

**(a) Ungate the Observatory and move it one craft tier shallower.**

```js
{ id: "observatory", name: "Celestial Observatory", group: "Industry", tech: "ritesOfTargon",
  // unlock: sparks — REMOVED, and the `gate` string with it
  cost: { ore: 750, knowledge: 1000, stoneSlab: 35, beam: 50 }, ratio: 1.10,
  caps: { knowledge: 1000 }, boost: { knowledge: 0.25 } },
```

Kittens' Observatory costs `750 Iron + 1000 Science + 35 Slab + 50 Scaffold`. RR
keeps the quantities and the crafted-material composition exactly; only Scaffold
becomes Beam, because RR's Scaffold sits behind Sparks where Kittens' does not.
I put that `unlock: sparks` in v0.39 §6 to make the Observatory an Era-3 milestone.
With Tomes out of the cap it is a deadlock, and I withdraw it.

**(b) Move The Great Index from `sparks` to `callToArms`.** Pre-Sparks
`scholarMult` becomes 5.6. Recomputed: 27,650 (Archives + Academies) + 40,000
(40 Observatories) = 67,650 base × 5.6 = **378,840** against Sparks' 200,000.
Comfortable. The ladder stays monotonic: Songcraft → Rites of Targon → Call to
Arms → Chemtech → Deep Works, which also fixes the ordering problem you flagged in
your §1 without needing the Sparks placement.

**(c) Hexcore Laboratory becomes the Era-3 tie for the Knowledge loop.** It already
is one — `tech: "hexcore"`, cost `6 scaffold + 10 plating + 4 hexgear + 400 gold`,
+1500 cap at ratio 1.10. It satisfies `era3_regional_crafting_spec_2.md` §6's
intent ("a player literally cannot finish the Knowledge loop's deepest tier until
Era 3's crafting chains are running") better than the Observatory ever did, because
its cost draws on all three chains rather than one.

**Resulting ladder, and this is the check to run:**

| Tech | Price | scholarMult at purchase | Building base required |
|---|---|---|---|
| Sparks | 200,000 | 5.6 | 35,700 |
| Chemtech | 450,000 | 5.6 | 80,400 |
| Hexcore | 1,000,000 | 11.2 | 89,300 |
| Deep Works | 2,200,000 | 11.2 | **196,400** |
| Icathia | 5,000,000 | 22.4 | 223,200 |

The Deep Works row is where Era 3 gets its length back. 196,400 of building base
needs roughly **75 Hexcore Laboratories** on top of a full Observatory line, and
Hexcore Lab #75 at ratio 1.10 costs ~6,700 scaffold, ~11,200 plating, ~4,500
hexgear. That is tens of thousands of Zaun Ore and Coalgas through the autoprod
buildings — the multi-week grind Era 3 was always supposed to be, now actually
load-bearing.

**Do not change any Era-3 tech price in this pass.** Same discipline as last round,
and it paid off last round.

### 2.2 Taverns cost more early

You are right that lowering the relief limit cannot produce the early pinch — the
live spread between early and late morale is only ~5 points, so one constant moves
both ends together. Jerry has picked your option 1, and the arithmetic supports it
over option 2 because it does not touch the Era-3 ceiling at all.

```js
{ id: "tavern", name: "Tavern", group: "Village", tech: "cultivation",
  effect: "Overcrowding unhappiness −5% each",
  cost: { timber: 400, ore: 800, provisions: 200 }, ratio: 1.15, crowdRelief: 0.05 },
```

**Base cost only — the ratio stays 1.15.** Raising the ratio would delay the early
taverns *and* make the 30 taverns Era 3 needs unaffordable; raising the base delays
the first few and becomes negligible by copy #20, because 1.15^20 is already 16×.

Grounding: Kittens' Amphitheatre — the building the Tavern models — costs
**200 wood + 1,200 minerals + 3 parchment at price ratio 1.75**. RR's Tavern at
150 timber + 120 ore + 80 provisions at 1.15 is roughly 8× cheaper in mineral terms
*and* scales at a third the rate. This change closes about half of the mineral gap
and leaves the ratio alone, which is the compromise RR needs because RR has no
Broadcast Tower to take over from the Tavern later.

The 800 ore matters more than the 400 timber: early ore cap is 100 base + 150 per
Storehouse, so the **first Tavern is unbuildable until two or three Warehouses are
up**. That is a natural, cap-driven delay rather than an arbitrary price, and it is
how Kittens gates its own early buildings.

Expected effect: cumulative cost of 6 Taverns goes 1,313 → 3,500 timber and
1,050 → 7,000 ore. Six taverns should land nearer population 70–80 than 40.
Cumulative 30 Taverns is ~174,000 timber / ~347,000 ore, which Masonry-V-era
storage supports, so the Era-3 band is untouched.

**Verify:** morale below 90 for at least 15% of samples before year 60; morale
still 90–140 for ≥90% of samples after year 60; Tavern count ≥25 by Era 3 entry.

### 2.3 No cooldown on the journey to the Freljord wilds

```js
{ id: "abyssJourney", name: "Journey to the Howling Abyss", tech: "abyss", renown: 5,
  // cooldown: 300 — REMOVED
  cost: { vigor: 120, provisions: 50 }, ... }
```

Poros and True Ice become vigor-bound like the four camps, which is the right shape
now that neither pays morale: both are pure Freljord materials, so their supply
should be limited by what you spend on them, not by a timer.

**Recommendation, flagged as a judgment call:** give it the same two-charge
treatment the four camps have (`CAMP_MAX_CHARGES = 2`, independent regen, charged
hunts yield more). Removing the cooldown without charges makes it the only
uncapped-frequency expedition with no charge layer, which reads as an oversight
rather than a design. A regen around 200 s fits between Raptors (150) and
Krugs (180) for a 120-vigor trip.

Second-order effect worth watching: at 120 Vigor uncapped it competes directly with
the three 100-Vigor comfort camps, and Poro income stops being the slow trickle the
60-Poro sacrifice cost was set against (Part 1C last round measured ~1 Poro per
game-year). Re-measure the Poro stockpile at first Watcher's Eye; if a sacrifice
costs less than a few minutes of hunting, raise it toward 250.

### 2.4 Raptor Plumes out of the Parchment recipe

```js
{ id: "parchment", name: "Scribe Parchment", cost: { furs: 175 }, out: "parchment", ... }
```

Exact Kittens parity restored, and the plume sink moves to Trade 4 in §2.6 where
Jerry wants it. Note the direct consequence for §2.1: with Tomes out of the
Knowledge cap, Parchment stops being the Era-3 gate anyway, so this costs nothing
that mattered.

Watch furs after this lands. Your v0.40 measurement had furs at 0.35–0.48× comfort
— already the tightest of the three, and *below* the 0.5× floor of the stated
target. Removing the plume component makes Parchment cheaper in total, which eases
fur pressure slightly; if furs still read under 0.5× comfort in the next run,
raise the Wolves base yield from `12 + rand(8)` to `15 + rand(9)` rather than
touching the recipe.

### 2.5 The Festival unlocks from a lore research

```js
function festivalUnlocked() { return !!S.upgrades.harvestRites; }

{ id: "harvestRites", name: "Harvest Rites", cost: { mushrooms: 400, culture: 300, parchment: 10 },
  tech: "songcraft",
  desc: "Drums, stew, and a reason. Unlocks Hold a Festival." },
```

Currently it is `!!S.techs.songcraft && S.seenMax.mushrooms >= 1`, which is a
tech-plus-sighting check rather than a research the player chooses. A discovery in
the Songcraft line is the right home — Kittens gates festivals behind **Drama and
Poetry**, a Culture-tab research, for the same reason. Costing it in mushrooms and
parchment makes the unlock itself a first taste of the sink it opens.

Everything else about the Festival stays as you built it, including paying through
the same +30 comfort term so it cannot breach the 175 ceiling. That design is
right.

### 2.6 The trade revamp

This is the largest item. What is sourced from Kittens and what is an RR judgment
call is marked, per the standing directive.

**Sourced:** embassies cost **culture** and nothing else, at a geometric ratio;
each embassy raises that race's trade yield through the `(1 + 0.02 × energy)` term;
each race trades one specific input for one specific output set; the deep partner's
premium good (Zebra titanium) is gated on a separate building count (Ships) and its
amount scales with that count; tradeposts contribute +1.5% per copy to `tradeRatio`.

**Judgment calls:** every RR resource pairing (Jerry specified these), the 5/10/15
thresholds (Jerry specified), the base culture price, and the faction reassignment.

#### The five routes

| # | Faction | Found | Pay | Receive |
|---|---|---|---|---|
| 1 | **Demacia** | known from start | Timber 600 | Steel 28–38 |
| 2 | **Freljord** | first scouting find | Ore 500 | Timber 350–500 |
| 3 | **Piltover** | pop ≥ 20 or any Renown | Steel 80 | **Mana 500–700** |
| 4 | **Noxus** | pop ≥ 30 or Renown ≥ 20 | Raptor Plumes 120 | Ore 400–560 |
| 5 | **Bilgewater** | **gated — see below** | Hexcrystal Slab 40 | Zaun Ore 250–400 |

Every route keeps its existing Vigor component alongside the material cost. Vigor
is the one population-bound input in the system, and it is what bounds trade
frequency no matter what the material maths says. Do not strip it.

Two reassignments are needed to make Jerry's cost/yield pairs payable in order.
**Demacia becomes the starter faction and Piltover moves to pop 20**, because
Trade 1 must be payable on turn one and Trade 3 costs Steel, which does not exist
until Smelting. Demacia as the neighbouring kingdom that buys timber for charcoal
and sells finished steel is also a better fit for the starter slot than a city
across the continent. Update `FACTION_FIND_ORDER` and `factionFound()`'s hardcoded
`fid === "piltover"` accordingly.

**Three invariants Jerry asked for. Assert all three in tests, not in review.**

1. *No faction's yield — primary or slot — may include the resource that faction
   charges.* The current build violates this once: Freljord costs `furs: 4` and its
   first bonus slot returns `furs: 6`, a net-positive fur loop at 5–40% chance.
2. *No material appears in more than one faction's slot table.* The current build
   violates this repeatedly — Demacia and Bilgewater both give steel, Piltover and
   Demacia both give crystals, Bilgewater and Piltover overlap again on steel.
3. *A slot never opens before its material is craftable in ordinary play* (see the
   availability gate below).

```js
// walk FACTIONS once; every one of these should be provable, not eyeballed
assert(disjoint(Object.keys(f.cost), f.slots.map(s => s.res).concat(f.primaryYield)));
assert(noDuplicatesAcross(FACTIONS.map(f => f.slots.map(s => s.res))));
```

#### Piltover's mana yield, and the trade loop it would otherwise open

Jerry's read is right — mana has no late identity. It is the click resource, the
first two buildings' price, and then a trickle into converters. Raising Piltover's
yield is correct. **But raising it without one other change opens a closed,
net-positive trade loop**, and I want to show the arithmetic before the number.

The loop is: **Timber → (Demacia) → Steel → (Piltover) → Mana → (transmute) →
Timber.** Every edge is mandated — Jerry has fixed Trade 1, Trade 3, and
transmutation, so the cycle cannot be broken structurally. **It has to be broken on
rates instead**, which is fine, but it means the three numbers are now coupled and
must never be tuned independently again.

Define the loop gain per full circuit:

```
G  =  (steel per timber) × (mana per steel) × (timber per mana) × M²
```

`M` is the trade multiplier stack — Trade Docks up to ×2, caravans up to ×1.6,
champion passive and trade policy on top. A developed settlement runs about ×3.2;
a maximally invested one with Twitch leading and the trade policy could touch ×4.
**The loop is safe only while `G < 1` at the highest `M` the game permits.**

Under the previous numbers — Demacia 400 timber → 37.5 steel, Piltover 60 steel →
220 mana, transmute `10 mana → craftYield() timber` with `craftYield()` running to
×5 — `G` was **12.8 at M = 3.2**. The loop was already a runaway faucet at the
180–260 mana I proposed last revision, before any increase. Same failure we removed
when gold stopped being a trade reward.

**Transmutation stays, permanently and unretired.** The fix is three coupled rate
changes:

```js
// 1. Transmutation is alchemy, not carpentry — the Yordle Workshop has no business
//    making it more efficient. Flat yield, Riverstone Tools still applies.
//    Available forever, exactly as now.
function transmuteYield() { return (S.upgrades.riverstoneTools ? 1.15 : 1); }
var TRANSMUTE_COST = 10;    // unchanged

// 2. Demacia: 400 timber -> 30-45 steel  becomes  600 timber -> 28-38 steel
// 3. Piltover: costs 80 steel, not 60
```

Recomputing: `G = (33/600) × (600/80) × (0.115) × M² = 0.0474 · M²`.

| M | G | verdict |
|---|---|---|
| 2.0 (early, one Trade Dock) | 0.19 | strongly negative |
| 3.2 (developed) | 0.49 | **loses half the timber per circuit** |
| 4.0 (max realistic stack) | 0.76 | still negative |
| 4.59 | 1.00 | break-even — above anything the multipliers can reach |

Trade fatigue (−8% per consecutive run, floor 0.15) sits on top of all of this, so
sustained looping is punished far harder than the table shows. **Assert `G < 0.8`
at maximum `M` as a unit test**, computed from the live faction tables rather than
hardcoded, so a future yield tweak cannot silently reopen it.

I also walked the other four routes for cycles: Plumes → Ore → Timber → Steel →
Mana is a strict chain with no return edge, Stone Slab never converts back to Ore,
and Bilgewater's Era-3 raws never reach Timber. The Demacia–Piltover circuit is the
only cycle in the graph, and now it is a lossy one.

**With that in place, Piltover yields 500–700 mana** — 2.7× the previous figure.
At a developed M ≈ 3.2 that is 1,600–2,240 realised, roughly 76 arcanist-minutes
of output per run, which is the same order as Demacia's steel delivery measured in
forge-seconds. Generous, proportionate, and no longer a faucet.

**And give mana somewhere to go, because that is the actual complaint.** More mana
does not fix "mana has no use" — it worsens it. Mana already plays Kittens' **Oil**
role: produced by a well, consumed by converters (Forge 0.05/s, Hextech Refinery
1/s, Shimmer Refinery 0.5/s, Sump Mine 0.2/s). Lean into it rather than inventing
a new system:

- **Raise the Era-3 autoprod mana draw.** Sump Mine 0.2 → 0.5 mana/s, Coalgas Vent
  gains 0.3 mana/s, Hexcrystal Quarry 0.2 → 0.6 mana/s. Mana becomes the fuel of
  Era 3 the way Oil fuels Calciners, which is exactly what makes a bulk mana
  delivery from Piltover worth 60 Steel.
- **Put mana in the Hextech capstone recipe** — Hextech Core gains `mana: 400`.
  It is the one craft that should feel like it costs power.

Both make Piltover the route a player runs *because Era 3 is running*, rather than
a trade they take once and forget.

#### Caravans as the embassy line — a pure culture sink

```js
function caravanCost(fid) {
  var n = caravanCount(fid);
  return { culture: Math.round(150 * Math.pow(1.15, n)) };
}
```

Culture only — drop the timber and gold. Kittens' embassies are priced in culture
alone, and Jerry wants caravans to be the primary culture sink, which they cannot
be while two thirds of the price is material. Ratio 1.15 matches Kittens; base 150
is scaled down from Kittens' 400 because RR's early culture economy is thinner
(culture cap is 60 base + 40 per Bard's Hearth, where Kittens has amphitheatres,
temples and chapels feeding it).

Cumulative culture to reach 15 caravans is **7,137 per faction, 35,685 across all
five** — against a mid-game culture ceiling in the low tens of thousands. That is a
genuine primary sink and it competes with The Annotated Index (4,000 culture) and
the Era-2/3 techs, which is the tension it should create.

#### Per-caravan yield growth

```js
// Kittens: yield includes (1 + 0.02 * energy), where energy is embassy-derived.
function caravanYieldMult(fid) { return 1 + limitedDR(0.02 * caravanCount(fid), 0.60); }
```

+2% per caravan, LDR-bounded at +60%. Fifteen caravans is +30%; thirty is +52%;
it never runs away. Multiply this into `tradeYieldMult()`'s product for that
faction's run, alongside the existing Trade Dock term.

#### The 5 / 10 / 15 slots — one exclusive crafting chain per civilisation

This is the part Kittens gets right and RR's `bonuses` arrays do not. In Kittens
**every race gives a different resource when upgraded**, and a race's extras are
tiers of *one* chain, not a grab bag: parchment → manuscript → compendium,
wood → beam → scaffold, iron → steel → gear, minerals → slab → monolith. A player
picks which race to invest embassies in because they want *that chain deepened*.

RR's current arrays fail both halves — Demacia and Bilgewater both hand out steel,
Piltover and Demacia both hand out crystals, and nobody's three slots belong to a
common chain. Replace them with five exclusive triples, each ascending one of RR's
own craft families:

| Faction | Craft family (Kittens analog) | 5 caravans | 10 caravans | 15 caravans |
|---|---|---|---|---|
| **Piltover** | Structure — *wood → beam → scaffold* | Support Beam ×6 | Scaffold ×3 | Hexcrete ×1 |
| **Demacia** | Masonry — *minerals → slab → monolith* | Stone Slab ×5 | Hexcrystal Slab ×3 | **Petricite Block ×1** |
| **Noxus** | Metal — *iron → steel → gear* | Gear ×4 | Iron Plating ×3 | Chemtech Alloy ×2 |
| **Freljord** | The Freljord's own goods | Parchment ×3 | Tome ×1 | **True Ice ×2** |
| **Bilgewater** | Hextech — the capstone line | Hexgear ×3 | Hextech Core ×1 | Focused Hexcrystal ×1 |

Fifteen distinct materials, no repeats across factions, and none collides with its
own faction's cost. Three notes on the edges:

- **Demacia's monolith tier needs a material that does not exist yet.** Jerry is
  right that Frost Megalith does not belong on a Demacian route — it is frost-named
  and its recipe (Beam + Iron Plating + Hexcrystal Slab) is Freljord capstone
  content. RR's masonry chain currently stops at Hexcrystal Slab, so the honest
  answer is to add the tier rather than borrow one:

  ```js
  { id: "petriciteBlock", name: "Quench Petricite Block",
    cost: { stoneSlab: 25, hexSlab: 10, crystals: 15 }, out: "petriciteBlock",
    desc: "Stone that drinks magic and gives nothing back. Demacia's whole architecture, in one brick.",
    show: function (s) { return s.techs.petricite; } },
  ```

  This also closes a real gap: **Petricite Masonry currently unlocks a building and
  no material**, which makes it the only tech in the tree that adds nothing to the
  crafting menu. Give the Petricite Monument a Petricite Block component so the new
  material has a home outside the trade route, and Frost Megalith goes back to
  being purely Watcher's Eye's input, which is where it belongs.

- **Freljord's third slot is True Ice, at Jerry's direction, and it is the one
  deliberate exception to the one-family rule.** It is justified: True Ice has
  exactly one source in the whole game (a 20% roll on the Abyss journey), and with
  §2.3 removing that cooldown it becomes vigor-bound and still scarce. A second
  source at ~14% on a 15-caravan route is the point. Note this makes the *missing*
  True Ice sink more visible — the Unicorn-Tomb-through-Sunspire line is still
  deferred, so True Ice will accumulate against nothing. Worth scheduling that
  design pass before this slot ships, or the reward reads as decorative.

- **Demacia yields Hexcrystal Slab and Bilgewater charges it.** That is deliberate
  and safe — it is a supply chain between two routes, not a cycle, because
  Bilgewater returns Era-3 raws rather than Slabs. Worth keeping; it is the first
  place trade routes feed each other.

**Availability gate — a slot never opens before the craft exists.** Jerry's rule,
and it matters most for the 15-slots, which are all Era-3 materials that a player
could otherwise reach on caravan count alone:

```js
// A slot is dormant until its material is craftable in ordinary play. Not shown,
// not rolled, not received — the caravan threshold is necessary, never sufficient.
function slotAvailable(fid, i) {
  var slot = factionSlots(fid)[i];
  // A slot may name its own gate — needed for True Ice, which is loot, not a craft.
  if (slot.gate) return slot.gate(S);
  var cr = CRAFTS.find(function (c) { return c.out === slot.res; });
  return !!cr && (!cr.show || cr.show(S));
}
// Freljord's True Ice slot: gate on having seen the resource at all, so the route
// deepens a supply the player already understands rather than introducing one.
// { res: "trueice", amt: 2, gate: function (s) { return s.seenMax.trueice >= 1; } }
function slotUnlocked(fid, i) {
  return caravanCount(fid) >= 5 * (i + 1) && slotAvailable(fid, i);
}
```

Hide dormant slots from the trade panel entirely, per Jerry. One UX note I would
act on: a player with 15 Noxus caravans and no Chemtech Alloy craft sees two rows
where they expect three and has no way to learn why. Render the row count as
"3 routes · 2 open" without naming the third material — that keeps the material
itself unrevealed while telling the player the investment is not wasted.

**Amounts grow with caravans past each slot's own threshold:**

```js
function slotAmount(fid, i, base) {
  return Math.round(base * (1 + 0.05 * Math.max(0, caravanCount(fid) - 5 * (i + 1))));
}
```

**Chances descend by tier.** Deeper slots are rarer, per Jerry — the 5-slot should
mature into the 35–40% band, the 10-slot below it, the 15-slot lower still. Replace
the single shared `bonusChance()` with per-tier floors and ceilings:

```js
var SLOT_CHANCE_FLOOR = [0.05, 0.03, 0.02];   // the chance the turn a slot opens
var SLOT_CHANCE_LIMIT = [0.35, 0.20, 0.12];   // LDR asymptote for each tier
function slotChance(fid, i) {
  var over = Math.max(0, caravanCount(fid) - 5 * (i + 1));
  return SLOT_CHANCE_FLOOR[i] + limitedDR(0.03 * over, SLOT_CHANCE_LIMIT[i]);
}
```

Resulting ladder, computed through the shipped `limitedDR`:

| Caravans | 5-slot | 10-slot | 15-slot |
|---|---|---|---|
| 5 | 5.0% | — | — |
| 10 | 20.0% | 3.0% | — |
| 15 | 33.9% | 18.0% | 2.0% |
| 20 | 36.9% | 21.8% | 11.6% |
| 25 | 38.4% | 22.5% | 13.6% |
| asymptote | **40%** | **23%** | **14%** |

The 5-slot reaches Jerry's 35–40% band around 15–20 caravans; the 10-slot settles
near a quarter of the time; the 15-slot stays a genuine event. Because the deep
materials are worth one to two orders of magnitude more per unit than a Support
Beam, a flat chance across tiers would have made the 15-slot the only one that
mattered — the descending ladder is what keeps all three worth investing in.

#### Bilgewater as the Zebra analog

Kittens gates the Zebra titanium line on **Ships**, and scales the amount by ship
count. RR's Ship analog is the **Trade Dock**:

```js
{ id: "bilgewater", ...
  unlock: function (s) { return s.techs.chemtech && count("tradeDock") >= 1; },
  gate: function (s) { return "Requires The Chemtech Whisper and a Trade Dock — the deep-water route needs a berth"; },
  cost: { hexSlab: 40, vigor: 100 },
  run: function (mult) {
    // Kittens scales zebra titanium with game.resPool.get("ship").value
    var n = Math.round((60 + 20 * count("tradeDock")) * mult);
    gain("zaunore", n); gain("coalgas", Math.round(n * 0.6)); gain("hexore", Math.round(n * 0.4));
  } },
```

Move Bilgewater to the end of `FACTION_FIND_ORDER` with that gate. This gives the
Era-3 raw materials a second source that scales with a *building* rather than with
population, which is the same shape §4 of the v0.39 spec put on the autoprod line
— and it gives Hexcrystal Slabs a use outside their own chain.

#### Freljord keeps provisions, as a seasonal conversion

Confirmed by Jerry. Under Trade 2 the Freljord route's base yield is Timber, and
none of the five routes produces food — so the winter lifeline survives as a
**seasonal conversion of that route's own yield**, not as a sixth yield resource:

```js
// Freljord, Deepwinter only: half the timber arrives as provisions instead.
// "Winter always provides" survives without breaking the cost/yield rule —
// nothing new is created, the same shipment is simply loaded differently.
run: function (mult) {
  var n = Math.round((350 + Math.floor(Math.random() * 151)) * mult);
  if (currentSeason().id === "deepwinter") {
    gain("timber", Math.round(n * 0.5));
    gain("provisions", Math.round(n * 0.5 * 3));   // provisions are the cheaper unit
  } else gain("timber", n);
}
```

The ×3 on the provisions half reflects that a unit of provisions is worth far less
than a unit of timber in RR's economy; tune it against the labour-value table if
the winter route becomes the only food a player ever needs. This also gives the
Freljord route a reason to be run *on a schedule* rather than continuously, which
is the only seasonal decision in the trade system.

---

## Part 3 — Convergence: no stripe can land the band, and here is the proof

Your §6 reasoning is right that the coefficient was never the problem and that my
25,832 Worship read was a broken-harness artifact. But **stripe 140,000 will not
work either**, and the reason is in your own two seeds.

Back-solving your measured percentages through the shipped
`0.01 × unlimitedDR(W, 1000)`:

| Seed | Convergence at Sparks | Implied Worship |
|---|---|---|
| 1 | 81.6% | 3,400,000 |
| 2 | 20.9% | **228,875** |

That is a **14.9× spread in Worship at the same milestone.** Now solve for a stripe
`s` that lands both seeds in a 4–8% band:

- seed 2 ≥ 4% requires `unlimitedDR(228875, s) ≥ 4` → **s ≤ 22,900**
- seed 1 ≤ 8% requires `unlimitedDR(3400000, s) ≤ 8` → **s ≥ 94,400**

The constraints are disjoint. **No stripe exists that satisfies both seeds**, so
tuning `s` to seed 1's 3.4M would put seed 2 at 1.4% and tuning to seed 2 would put
seed 1 near 20%. The band is not achievable by curve tuning while the input varies
15×.

**What to do, in order:**

1. **Measure Worship at Sparks across at least five seeds** and report median and
   spread. Two seeds cannot distinguish "high variance" from "one unlucky seed."
2. **Set `s` to `8 × W_median / 195`**, which is the closed form for landing 6.5%
   at `W_median`. Do this once, from the five-seed median, not from seed 1.
3. **Treat the spread itself as the real defect.** It is almost certainly the same
   root cause as your first-champion spread (y55.3 vs y137.9): Worship accumulates
   as roughly the integral of Devotion rate, Devotion rate scales with Shrines and
   Acolytes, and Shrine count compounds — so an 80-year delay in getting the faith
   engine started produces an order of magnitude by Sparks. Fixing the champion
   variance will narrow the Worship variance for free.

In the meantime, if you want a number to ship rather than a `TODO`, **s = 40,000**
gives 2.9% on seed 2 and 12.6% on seed 1 — outside Jerry's band on both ends but
symmetric about it, which is the honest best available from two data points. Say in
the changelog that it is provisional.

---

## Part 4 — Harness caveat, again, and what I am doing about it

My bot reached **population 39 and 20 techs in 400 game-years** on v0.40, never
researching Rites of Targon. Yours reaches Icathia. Take your pacing table.

One number of mine is worth having, because it is the first independent
confirmation of your Renown work: **first champion at y13, five champions at y55**,
against v0.39's "never in 300 years." The Hall of Heroes widening and the three
tech-granted Renown caps did exactly what they were meant to.

Everything else in this document is static analysis of the shipped source — cost
tables, cap arithmetic, the `scholarMult` ladder, the Kittens comparisons — or
algebra over your measurements, which is why Part 3 is a proof about your two seeds
rather than a claim from mine. The cap arithmetic in §2.1 is the load-bearing piece
and I would like you to check it independently before implementing: if my
`scholarMult`-at-purchase column is wrong anywhere, the Observatory and Great Index
moves may be unnecessary or insufficient.

My craft policy is what gates my measurement, same as yours was. I am rewriting it
against the v0.40 recipe scale before the next round.

---

## Part 5 — Order, and what to verify

1. **§2.1** — delete the Tome cap line, ungate the Observatory, move The Great
   Index to Call to Arms. All three together, no tech price touched.
2. **§2.4** — plumes out of Parchment.
3. **§2.6** — the trade revamp, including the faction reassignment and the
   disjoint-cost/yield test.
4. **§2.2** — Tavern base cost.
5. **§2.5** — Harvest Rites.
6. **§2.3** — Abyss cooldown and charges.
7. **Part 3** — five-seed Worship measurement, then one stripe change.

Pass conditions:

- **Sparks between y350 and y500; Doors of Icathia between y1,400 and y2,300**
- Chemtech → Hexcore gap between 100 and 400 game-years; no Era 0–3 gap over 300
- Deep Works requires ≥60 Hexcore Laboratories in every seed — if it does not, the
  cap is still coming from somewhere it should not
- Morale below 90 for ≥15% of samples before year 60; 90–140 for ≥90% after year 60
- Six Taverns not reached before population 65
- Mushrooms, Plumes and Furs all 0.5–3× `luxuryComfort()`, none dry over 5%
- Every faction's cost keys disjoint from every one of its yield keys
- **Loop gain `G < 0.8` at the maximum achievable trade multiplier**, computed from
  the live faction tables — the Demacia → Piltover → transmute circuit must lose
  timber on every pass, and the test must not hardcode the numbers
- Mana is net-negative in Era 3 without the Piltover route running — if a
  settlement can fuel every converter on Arcanists alone, the draw is still too low
- Petricite Block is craftable from Petricite Masonry and consumed by something
  other than the Demacia route
- No material appears in two factions' slot tables — all fifteen distinct
- No slot ever pays out, or renders, a material whose craft is not yet visible;
  specifically, 15 Noxus caravans before The Chemtech Whisper yields nothing
- Slot hit rates converge to ~40% / ~23% / ~14% for the 5 / 10 / 15 tiers
- Freljord's Deepwinter run returns provisions; its other three seasons do not
- Culture spent on caravans exceeds culture spent on all upgrades combined by Era 3
- No regression: first champion by y120, 130 wanderers by y600, Convergence occurs
