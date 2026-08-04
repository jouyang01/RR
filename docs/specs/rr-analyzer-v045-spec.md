# BUILDER SPEC v0.45 — parity, on every curve

Measured against `index_44.html`, verified line by line. Every Kittens value below was
read from `nuclear-unicorn/kittensgame` in this session; nothing is recollection.

Your §0 is the best measurement anyone has produced in this project and it is right
about the shape of the problem — one category carrying the economy while the others
starve. It is wrong about the remedy, and the source says why. That is Part 2.

But the finding that changes the round is not the ore stack. It is that **RR multiplies
Knowledge and Culture by its entire industrial layer, and Kittens does not multiply
Science or Culture by any of it.** That is Part 1, and it is most of why Era 3 lasts 86
years.

Jerry's directive this round is the widest one yet — copy Kittens' income, building,
knowledge, morale, culture, faith and population curves — so this spec is a parity
audit rather than a tuning pass. Ten of its items are "make RR's number equal to
Kittens' number." They are not ten levers. **They are one directive, and Jerry has
asked for it explicitly.** Part 9 says how to attribute the result anyway.

Jerry's second directive — replace Poppy's passive outright and cut the leader storage
bonus hard — is **Part 8.1**, and it belongs to Part 5 rather than to the champion
roster: those two effects are the last things standing between the science buildings and
the knowledge ceiling.

---

## Part 0 — What I got wrong, what you got right, and one pass condition that should never have existed

**Your §0 retires my Part 1 table.** I costed twelve multiplier categories and omitted
the one that turned out to be 91% of the ore stack. RR was never ×53; the table was
incomplete, not the game. I will not defend it.

**Your §3 is right and I am withdrawing the pass condition that failed you.** You
measured RR's median tech step at ×1.25 against a spec target of ×1.10–1.20 and
reported a fail. That target was derived from Kittens' median across all **64**
science-costed techs — a span running to `exogeophysics 25,000,000`, five ranks of
which are post-Icathia content RR does not have and will never have. Over the ranks RR
actually covers — `calendar 30` to `electronics 135,000`, ranks 1 to 36 — Kittens'
**geometric mean step is ×1.272**, essentially identical to RR's ×1.25. Your ladder is
not too steep. Part 6 explains what the *median* discrepancy really means, and it is a
different problem with a different fix.

**Your `×2.50` largest-step fail is also not a fail.** Almanac 30 → Cultivation 75 is
×2.50 against Kittens' own `calendar 30 → agriculture 100`, which is **×3.33**. RR is
gentler than the source at the same rank. Ignore it.

**And Amendment A1 did not land.** I sent it; the report does not mention it and the
code does not contain it. Part 5 re-issues it, because the current build is *worse* than
v0.43 on that axis, not better.

Three things you shipped that I want on the record as correct: the amplifier pair is
implemented exactly as `game.js:3474–3476` writes it; `CHAMP_RUNG_GATE` adding to rather
than replacing signature material is the right reading; and generating the Scholarship
prose from `SCHOLAR_CAPS` caught a tooltip that would otherwise have shipped promising a
multiplier that no longer exists. That invariant has now paid for itself three times.

---

## Part 1 — Knowledge and Culture must be transient

**`js/resources.js:128–134`:**

```js
{
    name : "science",
    type : "common",
    transient: true,        // <-- this
    calculatePerTick: true
},{
    name : "culture",
    transient: true,
```

And `js/resources.js:14`, the comment that defines the flag:

> `transient: will not be affected by magneto production bonus (and other bonuses)`

`game.js:3472` and `:3485` both guard on it:

```js
if (!res.transient && this.bld.get("magneto").on > 0 && res.name != "catnip") { ... }
if (!res.transient && res.name != "uranium" && res.name != "catnip") {
    perTick *= 1 + this.getEffect("productionRatio");
}
```

Paragon (`:3477`) and CMBR (`:3496`) are guarded the same way.

**So in Kittens, Science and Culture receive exactly four things: happiness, leader
rank, `scienceRatio` from the four science buildings, and the Solar Revolution faith
line. They receive none of the industrial layer — no Magneto, no Steamworks amplifier,
no Reactor, no paragon, no cosmic radiation.**

RR does the opposite. `computeRates()`, the global block:

```js
var global = catMonument * catCharts * catReligion * catDrake * catSoul * catPolicy * catBuff;
var globalNoReligion = global / catReligion;
for (var r3 in rates) if (rates[r3] > 0) rates[r3] *= (r3 === "devotion" ? globalNoReligion : global);
```

Every rate. Knowledge included. `catMonument` contains every `globalBoost` building —
the Hextech Foundry, the Hexdraulic amplifier you just built, and the Arcane Reactor,
which is the literal Reactor Kittens excludes. You measured `catMonument` at **×2.75**
at Icathia, plus Infernal Drake ×1.30 and Dragon Soul ×1.25.

**Knowledge is currently receiving ×4.47 at Icathia that Kittens' science does not
receive.** That is the largest single divergence in the build and it is why the
re-priced ladder — which is at *exact* Kittens parity, rank for rank — is being cleared
ten times too fast.

### 1.1 The fix

```js
// v0.45 Part 1. Kittens marks science and culture `transient: true`
// (js/resources.js:128,136) and every industrial multiplier in getResourcePerTick
// guards on it: magneto (game.js:3472), reactor (:3485), paragon (:3477), CMBR (:3496).
// Science in Kittens gets happiness, leader, the four science buildings and the faith
// line. Nothing else. RR must match, or the knowledge ladder cannot be paced by
// anything we do to its prices.
var TRANSIENT = { knowledge: 1, culture: 1 };

// Kittens keeps the faith line on science: getSolarRevolutionRatio() is applied at
// game.js:3494, AFTER the reactor block and NOT guarded by transient. So catReligion
// stays. Everything sourced from a building or a kill does not.
var globalTransient = catCharts * catReligion * catPolicy;

for (var r3 in rates) {
  if (rates[r3] <= 0) continue;
  rates[r3] *= TRANSIENT[r3]  ? globalTransient
             : r3 === "devotion" ? globalNoReligion
             : global;
}
```

`catCharts` (Celestial Charts) and `catPolicy` stay, because their Kittens analogues are
`<res>GlobalRatio` and policy effects, both applied at `game.js:3427–3430` **before** the
transient guard. `catMonument`, `catDrake`, `catSoul` and `catBuff` all leave — they are
building- and kill-sourced, which is precisely the class Kittens excludes.

**Do the breakdown panel too.** The `bdRes` branch below the loop must use the same
multiplier or the tooltip will claim a bonus the resource is not getting. This is the
fourth tooltip-drift risk in this file; derive it from the same expression rather than
restating it.

### 1.2 What this predicts

At Sparks the Monument/drake/soul product is small — your own table has the whole ore
stack at ×5.13 there — so the exclusion costs knowledge perhaps ×1.4 at Era-3 entry and
×4.5 at Icathia. **It barely moves Sparks and it stretches Era 3 hard**, which is the
exact shape the pacing needs: your Era 3 is 86 game-years against a target of
1,000–1,800.

---

## Part 2 — Ore vs timber: what Kittens actually does, and why `limitedDR` is the wrong answer

Jerry asked me to confirm how Kittens handles this. The answer is unambiguous and it is
not a cap.

### 2.1 Kittens' minerals line, complete

```js
// js/buildings.js:977   mine
"mineralsRatio": 0.2,
// js/buildings.js:1007  quarry
"mineralsRatio": 0.35,
```

That is the **entire** minerals multiplier set. `grep -rn "mineralsJobRatio"` across the
whole repository returns **nothing** — there is no miner tool line in Kittens. There is
no `mineralsGlobalRatio` and no `mineralsSuperRatio` either; the only other appearances
of `mineralsRatio` are two calendar events. Minerals has **one category, fed by two
buildings, and nothing else.**

### 2.2 Kittens' wood line, complete

```js
// js/buildings.js:1416  lumberMill
self.effects["woodRatio"] = 0.1 + game.getEffect("lumberMillRatio") * 0.1;
```

fed by five saw upgrades (`js/workshop.js:77, 91, 108, 125, 175`):

| Upgrade | lumberMillRatio |
|---|---|
| reinforcedSaw | 0.20 |
| steelSaw | 0.20 |
| titaniumSaw | 0.15 |
| alloySaw | 0.15 |
| unobtainiumSaw | 0.25 |
| **Σ** | **0.95 → 0.195 woodRatio per Lumber Mill** |

*and* a six-rung axe line on the job tier, `woodJobRatio`:

| Upgrade | woodJobRatio |
|---|---|
| mineralAxes | 0.70 |
| ironAxes | 0.50 |
| steelAxe | 0.50 |
| titaniumAxe | 0.50 |
| alloyAxe | 0.50 |
| unobtainiumAxe | 0.50 |
| **Σ** | **3.20 → ×4.20 on the woodcutter** |

**So Kittens balances the two lines by opposite composition, not by a ceiling.**
Minerals gets *breadth* — two buildings, a fat 0.55 per matched pair. Wood gets *depth*
— one building whose per-copy ratio nearly doubles across five upgrades, plus a job
multiplier worth ×4.2 that minerals is denied entirely.

Neither is bounded. `game.js:3425–3433` applies both as plain additive sums:

```js
var workshopResRatio = this.getEffect(res.name + "JobRatio");
...
perTick *= 1 + this.getEffect(res.name + "GlobalRatio");
perTick *= 1 + this.getEffect(res.name + "Ratio");
```

No `getLimitedDR` anywhere in the chain.

### 2.3 Which is why your §5.1 recommendation should not ship

**Do not put `limitedDR` on `buildingJobBoost`.** Three reasons, in order of weight:

1. **Kittens' equivalent is unbounded and that is load-bearing.** The whole late-game
   income curve is `1 + 0.55N` growing without limit against building costs growing at
   1.15ⁿ. Capping it flattens RR's late curve below Kittens' — which is the one thing
   Jerry's standing rule forbids in the *other* direction and which he equally does not
   want here.
2. **A cap needs retuning every time a building count moves.** Every round that changes
   Era 3's length changes N, and a DR limit tuned at N=31 is wrong at N=60. The
   composition fix is stable under N.
3. **It treats a symptom.** ×23.05 on ore is not too large — Kittens reaches ×23.0 at
   N=40 from `mineralsRatio` alone. The defect is ×3.90 on timber, and a third ore
   building and a miner tool line that Kittens does not have.

### 2.4 The composition fix, with the arithmetic

Four edits. Each one makes an RR line identical in *kind* to its Kittens counterpart.

**E1 — Delete the miner job line.** Kittens has no `mineralsJobRatio`.
- `zauniteDrills` stops being `miner ×1.5`. It becomes **+0.05 `mineralsRatio` per
  Mine** (Mine 0.20 → 0.25), which is Kittens' own `lumberMillRatio` mechanism applied
  to the ore building at a fifth of the magnitude. It keeps the upgrade meaningful and
  keeps ore inside a single category.
- `sumpVentilation` stops being a separate `resRatio.ore` slot. It becomes **+0.05
  `mineralsRatio` per Quarry** (Quarry 0.35 → 0.40).
- `masterworkTools` stops applying to `miner`.
- **Augment Chamber loses `miner: 0.15`.** It keeps `tinkerer: 0.40`. Kittens has two
  minerals buildings, not three.

**E2 — Build the axe line to Kittens' depth.** One upgrade at ×1.40 becomes six rungs
summing to `woodJobRatio` 3.20:

```js
var AXE_LINE = [
  ["sharpenedAxes",  0.70, "woodcraft"],       // was the whole line at x1.40
  ["ironAxes",       0.50, "smelting"],
  ["steelAxes",      0.50, "refinedMetallurgy"],
  ["hexsteelAxes",   0.50, "sparks"],
  ["atlasAxes",      0.50, "atlasGauntlets"],
  ["voidsteelAxes",  0.50, "icathia"]
];
// woodcutter job multiplier = 1 + Sum(owned)   ->  x4.20 at full line
```

**E3 — Give the Lumber Mill a saw line.** `timberRatio` per Lumber Mill becomes
`0.10 × (1 + Σ saws)` with five saws summing to 0.95 → **0.195 per copy** at the full
line, matching `js/buildings.js:1416` exactly:

```js
var SAW_LINE = [
  ["reinforcedSaw", 0.20, "woodcraft"],
  ["steelSaw",      0.20, "smelting"],
  ["hexsteelSaw",   0.15, "sparks"],
  ["atlasSaw",      0.15, "deepWorks"],
  ["voidsteelSaw",  0.25, "icathia"]
];
```

Note the deliberate pairing: each axe rung and each saw rung shares a tech with an ore
material tier, so the two lines advance together and neither becomes a dead branch.

**E4 — The woodcutter base rate.** Covered in Part 4; it is listed here because E1–E3
do not land without it. Kittens' woodcutter is `0.018 wood/tick = 0.09/s`. RR's is
`0.30/s` — **3.33× Kittens** against timber costs that are already at Kittens parity
(Shelter 8 timber vs hut 5 wood; Longhouse 220 vs logHouse 200). It must go to **0.09**.

### 2.5 What the four edits produce

Kittens, at N copies of each ratio building:

| N | minerals `1+0.55N` | wood `4.2×(1+0.195N)` | per-worker minerals | per-worker wood | ratio |
|---|---|---|---|---|---|
| 10 | ×6.5 | ×12.4 | 1.62 | 1.12 | 1.46 |
| 20 | ×12.0 | ×20.6 | 3.00 | 1.85 | 1.62 |
| 30 | ×17.5 | ×28.8 | 4.38 | 2.59 | **1.69** |
| 40 | ×23.0 | ×37.0 | 5.75 | 3.33 | 1.73 |

RR after E1–E4, ore `1 + 0.25M + 0.40Q`:

| N | ore | timber | per-worker ore | per-worker timber | ratio |
|---|---|---|---|---|---|
| 10 | ×7.5 | ×12.4 | 1.88 | 1.12 | 1.68 |
| 20 | ×14.0 | ×20.6 | 3.50 | 1.85 | 1.89 |
| 30 | ×20.5 | ×28.8 | 5.12 | 2.59 | **1.98** |
| 40 | ×27.0 | ×37.0 | 6.75 | 3.33 | 2.03 |

**RR today, from your §0 table: ore/worker 8.64, timber/worker 1.64, ratio 5.28:1.**
After the fix, 1.98:1 against Kittens' 1.69:1 — inside 17% at every count, and the
*absolute* per-worker figures land within 17% of Kittens' too. The category stays
unbounded, exactly as the source has it.

---

## Part 3 — Population 412 is a housing bug, and morale fixes itself when it is fixed

Your §0.3 reads morale ×0.66 as an overcrowding tax. It is, but morale is not the
defect. **412 population is**, and it traces to one line.

### 3.1 Kittens has no Log House price-ratio reducer

`grep -rn 'PriceRatio"' js/workshop.js js/buildings.js` returns exactly four reducer
effects, all of them on one building:

```
js/workshop.js:593   "hutPriceRatio" : -0.5     (ironwoodHuts)
js/workshop.js:608   "hutPriceRatio" : -0.30    (concreteHuts)
js/workshop.js:620   "hutPriceRatio" : -0.25    (unobtainiumHuts)
js/workshop.js:632   "hutPriceRatio" : -0.1     (eludiumHuts)
```

**There is no `logHousePriceRatio` and no `mansionPriceRatio` in Kittens. The Log House
sits at 1.15 forever and the Mansion sits at 1.15 forever.** Only the hut — the one
building whose ratio starts at a punitive 2.5 — is ever discounted, and the discount
exists to bring an unusable ratio into the usable band, not to make housing cheap.

RR gives the Longhouse two reducers:

```js
} else if (b.id === "longhouse") {
    if (S.upgrades.stonecutGuild) cut += 0.06;
    if (S.upgrades.hexboundJoinery) cut += 0.035;
}
```

1.15 → **1.055**. At 1.055 the hundredth Longhouse costs 175× the first. That is not a
cost curve; it is a subscription. **Delete both.** Re-point `stonecutGuild` and
`hexboundJoinery` at the Shelter line or at storage — anywhere but the Longhouse.

### 3.2 Kittens' hut floor is 1.3516, and 1.70 inside RR's era window

Computed with Kittens' own `getLimitedDR` (`game.js:2452`), `ratioBase = 2.5 - 1 = 1.5`:

| Reducers owned | Σ delta | LDR | hut ratio |
|---|---|---|---|
| ironwoodHuts | −0.50 | free | **2.00** |
| + concreteHuts | −0.80 | free | **1.70** |
| + unobtainiumHuts | −1.05 | free | 1.45 |
| + eludiumHuts | −1.15 | −1.1484 | **1.3516** |

The last two cost unobtainium and eludium — Kittens' post-Icathia tiers. **A Kittens
player at RR's Era-3-complete point is buying huts at 1.70, and 1.3516 is the
end-of-everything floor.** RR's Shelter reaches **1.15** with four reducers that are all
inside Era 3.

### 3.3 The Shelter ladder, re-derived

RR's `limitedDR(x, 1.20)` runs free below 0.90. Target floor = Kittens' **1.3516** →
cut Σ = 0.8484, inside the free region. Distributed in Kittens' own proportions
(0.50 / 0.30 / 0.25 / 0.10 of Σ 1.15):

```js
if (b.id === "shelter") {
    if (S.upgrades.ironwoodShelters) cut += 0.370;   // Smelting
    if (S.upgrades.petriciteFrames)  cut += 0.220;   // Hexcore
    if (S.upgrades.hexcreteFrames)   cut += 0.180;   // Deep Works
    if (S.upgrades.voidwrightFrames) cut += 0.075;   // Icathia
}
```

Ladder: **2.20 → 1.83 → 1.61 → 1.43 → 1.355**, against Kittens' 2.50 → 2.00 → 1.70 →
1.45 → 1.3516. Same shape, same destination, same number of rungs.

### 3.4 What that gives, and why morale then needs no edit

Shelter base 8 timber at floor 1.355: #30 costs 53,620 · #35 costs 244,921 · #40 costs
1,118,723. Longhouse base 220 at 1.15: #30 costs 12,667 · #40 costs 51,243 · #50 costs
207,308. A developed Era-3 settlement buys roughly **35 Shelters (70) + 45 Longhouses
(45) ≈ 115 population**, still climbing slowly — which is Kittens' own 70–120 band and
clears Jerry's 130 target with a little more investment.

Now run RR's morale at that population with 30 Taverns:

```
crowd          = (115 − 5) × 2      = 220
relief         = limitedDR(1.50, 0.88) = 0.834
crowdCharged   = 220 × 0.166        = 36.5
morale         = 100 − 36.5 + 30(lux) + ~15(shrine) ≈ 108   →  ×1.08
```

**Morale lands in the Kittens band with no change to the morale code at all.** Do not
touch `MORALE_RELIEF_LIMIT`, the luxury cap, or the crowd coefficient this round. Ship
housing and re-measure; if morale still reads below 0.9 at population 115 then morale is
a real finding and we will have isolated it cleanly.

**One comment to correct while you are in there.** The block above `MORALE_RELIEF_LIMIT`
says *"Kittens gets this bound for free from its Temple's price ratio of 2.5."* Both
halves are false: the Temple is 1.15 and the Amphitheatre is 1.15. The honest
justification — and it is a good one — is that Kittens' `unhappinessRatio` is a plain
additive sum with no floor (`js/village.js:913`), and its Broadcast Tower stage pays
**−0.75 per copy**, so Kittens will happily let crowding go *negative* and become a
bonus. RR's bound is a deliberate divergence from a Kittens behaviour we do not want.
Say that instead.

---

## Part 4 — Worker base rates: the parity table

Kittens ticks 5/s. Per-second rates below are `perTick × 5`, read from
`js/village.js:78–84` and the job block above it.

| Job | Kittens (per s) | RR v0.44 | RR ratio | **Set to** |
|---|---|---|---|---|
| miner → ore | 0.25 | 0.25 | 1.00 | **unchanged** |
| hunter/jungler → vigor | 0.30 | 0.30 | 1.00 | **unchanged** |
| woodcutter → timber | **0.09** | 0.30 | **3.33×** | **0.09** |
| scholar/loremaster → knowledge | **0.175** | 0.30 | **1.71×** | **0.175** |
| priest/acolyte → faith | **0.0075** | 0.012 | **1.60×** | **0.0075** |
| farmer → food | 5.0 catnip | 0.5 provisions | — | **unchanged** |
| per-head consumption | **4.25** (`catnipPerKitten −0.85/tick`) | 0.35 | — | **0.425** |

The last row is the one that is easy to miss. Kittens' consumption is **85% of a single
farmer's output** (4.25 / 5.0). RR's is **70%** (0.35 / 0.5). Net surplus per farming
head is therefore 0.75/s in Kittens and 0.15/s in RR — but as a *fraction of a farmer*,
RR runs at 30% surplus where Kittens runs at 15%. Setting consumption to **0.425/s**
(and `trueIceCellars` to 0.34) puts RR on Kittens' exact ratio and doubles the food
pressure on growth. `catnipDemandRatio −0.005` per pasture (`js/buildings.js:349`)
confirms consumption-reduction upgrades are a legitimate Kittens mechanism, so
`trueIceCellars` stays.

**Housing sets the population ceiling; food sets the rate of approach to it.** These are
separately measurable — report max-affordable population and years-to-fill as two
numbers — so shipping both does not violate the one-lever rule. Say which is which in
the report.

The acolyte change also feeds Part 3 of v0.44: Worship totals drop by 1.6×, which moves
the Convergence stripe input again. **Still do not set the stripe.** Fourth deferral,
same reason.

---

## Part 5 — Amendment A1, re-issued, because it did not ship

`index_44.html` line 2018 onward:

```js
var STORAGE_EXEMPT = { vigor: 1 };
var champStore = 1 + champPassive("storage") / 100;
for (var rs in caps) {
  if (STORAGE_EXEMPT[rs]) continue;
  var line = SCHOLAR_CAPS[rs] ? scholarMult
           : (rs === "renown" ? Math.sqrt(masonryMult) : masonryMult);
  caps[rs] *= line * champStore;
}
...
var mountainMult = 1 + drakeBonus("mountain", 0.6);
for (var r2 in caps) caps[r2] *= mountainMult;
if (leaderIs("poppy")) for (var r3 in caps) caps[r3] *= 1.25;
```

`SCHOLAR_CAPS` is now `{ culture: 1, devotion: 1 }`, so `SCHOLAR_CAPS["knowledge"]` is
undefined, so **knowledge falls through to `masonryMult`** — which reaches ×22.4 across
the full storage line. We removed a ×3.99 multiplier from the knowledge cap and replaced
it with a ×22.4 one. On top of that, `mountainMult` (up to ×1.60) and Poppy's ×1.25
still apply.

This is the trap Amendment A flagged and it is live. The fix, unchanged:

```js
// v0.45 Part 5 (= Amendment A1). Kittens' science ceiling in RR's era window is
// Sum(building scienceMax) plus the clamped compendium term and NOTHING else
// (js/workshop.js:2769-2786). Knowledge therefore takes no storage multiplier at all:
// not Scholarship, not Masonry, not Mountain Drakes, not a leader.
// Renown is exempt for the OPPOSITE reason - it has no Kittens equivalent and is meant
// to scale freely. Same keyword, two different intents; do not merge them.
var CAP_MULT_EXEMPT = { vigor: 1, knowledge: 1 };
var SCHOLAR_CAPS    = { culture: 1, devotion: 1 };

for (var rs in caps) {
  if (CAP_MULT_EXEMPT[rs]) continue;
  var line = SCHOLAR_CAPS[rs] ? scholarMult
           : (rs === "renown" ? Math.sqrt(masonryMult) : masonryMult);
  caps[rs] *= line;                       // champStore is gone entirely - see Part 8.1
}
...
for (var r2 in caps) { if (CAP_MULT_EXEMPT[r2]) continue; caps[r2] *= mountainMult; }
// Keeper's Verdict, rescoped - Part 8.1
if (leaderIs("poppy")) {
  for (var r3 in caps) {
    if (CAP_MULT_EXEMPT[r3] || SCHOLAR_CAPS[r3] || r3 === "renown") continue;
    caps[r3] *= 1.08;
  }
}
```

**`champStore` disappears from `computeCaps()` entirely.** Part 8.1 removes the storage
passive that fed it, and `champPassive("storage")` has exactly one call site
(line 2021), so the variable and both its uses delete cleanly. That is a third
multiplier leaving the gap between the buildings and the ceiling, on top of Masonry and
the Mountain Drake — which is the whole objective of this Part.

**Two stale comments to delete in the same pass**, both of which now contradict the code
directly above or below them and will mislead the next person:
- The `computeCaps` block still says *"Kittens has NO multiplicative science-cap line at
  all."* It does — `libraryRatio`, `js/buildings.js:579`, three upgrades at 0.02 each,
  applied as `library.scienceMax *= (1 + observatories × libraryRatio)`, worth ×2.50 at
  25 Observatories. It is gated behind titanium/unobtainium/eludium so it is outside
  RR's era window, which is why the directive stands — but the comment is false and I
  wrote it.
- The Tome block says *"the clamp is retired"* immediately above a live
  `Math.min(150 × morellonomicon, buildingKnowledgeCap)`. The clamp is not retired; that
  text is v0.40 prose that survived the v0.42 restoration.

---

## Part 6 — The tech ladder: add branches, do not re-price

Your median is ×1.25. Kittens' geometric mean over the same rank span is ×1.272, so the
*average* step is right. But Kittens' **median** over ranks 1–36 is ≈×1.13, and the gap
between its median and its mean is the entire point of its shape.

From the source price table: Kittens has **five exact ties** in ranks 1–36 —
`mining 500` = `animal 500`, `civil 1500` = `engineering 1500`, `stripMining 2000` =
`clearCutting 2000`, `chemistry 60000` = `acoustics 60000`, `mechanization 115000` =
`combustion 115000` — plus another eight steps under ×1.10. Those flat rungs are
**branches of the DAG, not links in a chain**. They sit beside each other at the same
depth, and they are what makes progress feel continuous while the *chain* cost still
climbs at ×1.27 a rank.

RR has 35 science-costed techs to Icathia against Kittens' 36 at the same price — the
chain length is right. What RR lacks is width.

**Directive: add 8–10 side techs, each priced at or within 5% of an existing rung, each
opening one upgrade or building rather than gating the next tech.** Do not change a
single existing price. This drops the median toward ×1.13 while leaving the geometric
mean and the total span exactly where they are.

Two you already identified as thin — Champions' Regimen and Deep Cartography — become
correct under this reading rather than suspect: they *are* branches. **Keep all three
bridge techs.** Your §3 recommendation stands and your reasoning was better than the
pass condition it failed.

---

## Part 7 — Crafted materials stack, and we keep pricing as if they do not

Jerry's third note, and it is handoff error #10 recurring for the fifth round.

`craftYield()` at `CRAFT_YIELD_LIMIT 2.2` reaches **×3.08**, and it compounds per chain
tier — a two-tier craft is effectively ×9.5 against its raw inputs. A player entering
Era 3 with a stocked workshop is not paying the nominal price of anything.

Your §1 reports **7 Arcane Reactors against a ≥25 target and 0 Hexdraulic Plants against
≥8**, and correctly diagnoses it as time rather than priorities — Era 3 lasts 86 years
and a 200-Hexgear Foundry cannot be banked inside it. That diagnosis is right, and it
means **the correct action on those prices this round is none.** With Era 3 at 1,000+
years and craft stock accumulating across it, both buildings become reachable at their
current nominal cost. Kittens' own Magneto costs `gear 5 + alloy 10 + blueprint 1` —
trivial nominally, expensive only through the chain. RR's Plant at `hexgear 120 +
plating 200 + gold 4000` is the same design.

**Standing requirement from here on, and please add it to the report template: every
Era-3 building cost must be reported in effective-raw terms — nominal divided by the
craft multiplier at its chain depth — alongside the nominal figure.** We have now spent
five rounds tuning nominal numbers while the game ran on numbers up to 88× smaller. A
column in the build report ends it permanently.

---

## Part 8 — Champions, inside the budget rather than beside it

Champion passives are a production multiplier — `champPassive` reaches camp yields,
caravan yields, craft yields, devotion, storage and knowledge. Kittens has no analogue,
so under Jerry's standing rule they must be *budgeted inside* the total rather than added
on top.

They have a natural slot. Kittens' thirteenth category is **paragon**, worth ×1.5–3.0,
and RR has no prestige layer and is not getting one until Era 3 completes reliably. Let
the champion stack occupy that slot: **total champion contribution across all lines held
to ×1.5–3.0.** Your §0 table puts the village line at ×1.12 with the craft, storage and
knowledge passives on top — comfortably inside. Report the aggregate so we can watch it.

**One champion changes this round, and only because it is a storage change wearing a
champion costume.** Everything else in the roster is untouched.

### 8.1 Poppy — new passive, and Keeper's Verdict rescoped (Jerry's directive)

Poppy is currently the only champion whose effects land on the storage system:

```js
passive: { key: "storage", base: 8, desc: "Steadfast Keeper: material & knowledge storage +8%" },
lead:    "Keeper's Verdict — ALL storage caps +25%, even Renown, Vigor, Devotion and Culture",
```

**Kittens has no leader storage effect of any kind.** `getLeaderBonus(rank)`
(`js/village.js:761`) multiplies *job production* only, applied at `:653` and `:687`, and
`rankLeaderBonusConversion` (`game.js:3467`) multiplies *autoprod*. There is no cap or
max effect attached to a leader anywhere in the source. RR's ×1.25 on every cap in the
game is therefore not a large divergence from Kittens — it is a divergence from
*nothing*, and it is the single biggest term standing between the science buildings and
the knowledge ceiling that Part 5 is trying to clear.

**The passive, replaced completely:**

```js
{ id: "poppy", name: "Poppy", cls: "Tank", cost: { renown: 380, timber: 1800 },
  passive: { key: "vigor", base: 15, desc: "Steadfast Presence: vigor production +15%" },
  lead: "Iron Ambassador — material storage caps +8%",
  flavor: "Still looking for the hero this hammer belongs to.",
  skill: "Keeper's Verdict — nothing gets past her, especially rats near the granary" },
```

Three reasons for **vigor** specifically, in order of weight:

1. **It is the only production line with no champion on it, and it does not confound a
   single measurement in this spec.** The taken passive keys are `camp`, `devotion`,
   `caravan`, `village`, `gold`, `knowledge`, `culture`, `craft`, `respawn` — and
   `storage`, which is leaving. Parts 1 through 6 measure ore, timber, knowledge,
   population, morale and the tech ladder. A vigor passive touches none of them, so
   Poppy's change cannot muddy the parity read this round is built to produce. **A
   timber or ore passive was the other obvious candidate and I rejected it for exactly
   that reason** — it would sit inside the category whose ratio is a pass condition.
2. **It has a real Kittens analogue.** `manpowerJobRatio` (`game.js:661`) is a first-class
   job-tier category on the hunter line, which is what RR's jungler is. A champion
   multiplying vigor is the same shape as a workshop upgrade multiplying manpower.
3. **It is her actual kit.** Steadfast Presence is Poppy's W. It also un-duplicates her
   entry: `lead` and `skill` are both currently "Keeper's Verdict", the same
   name-collision class as the Jarvan/Swain passive you fixed in v0.43. Iron Ambassador
   is her LoL passive and is a logistics name, which is where the storage effect now
   lives.

**The leader bonus, cut on both axes:** ×1.25 → **×1.08**, and the scope narrows from
every cap in the game to **material caps only** — the set that already receives
`masonryMult`. Knowledge, Culture, Devotion, Renown and Vigor are all excluded, per the
`CAP_MULT_EXEMPT` / `SCHOLAR_CAPS` / `renown` guards in the Part 5 code block. Measured
effect on the knowledge ceiling: **×1.25 → ×1.00.** Measured effect on material
ceilings: ×1.25 → ×1.08, roughly a third of one Masonry rung, which is the right
magnitude for a leadership choice that costs you every other leader in the roster.

**Both description strings must be generated, not written.** The old lead string promised
"even Renown", and Renown has been exempt since v0.43 — it was already lying before this
change. Derive the resource list from the same guards the code uses, the way
`SCHOLAR_CAPS` generates its prose. This is the fourth storage tooltip to drift in this
file and derivation is the only fix that has held.

**Migration:** existing saves have `S.champs.poppy` with a level and XP; nothing in the
save references the passive key, so no migration handler is needed. Confirm the
"no two champions share a passive key and base" test still passes — `vigor` is unused,
and base 15 collides with `camp 15` and `respawn 15` on the *number* but not the key, so
check which pair the assertion actually compares before assuming it is clean.

---

## Part 9 — Order, projections, and pass conditions

### Order

1. **Part 5** first, alone in the diff if you can — it is a regression fix and everything
   downstream is measured against the knowledge cap it repairs.
2. **Part 1** — the transient set. Largest single effect; must precede any pacing read.
3. **Part 2 (E1–E3) with Part 4's woodcutter rate.** These four are one correction; E1–E3
   without the base rate leaves timber 2.9× over, and the base rate without E1–E3 leaves
   it 2.9× under. Ship together, as Part 1 and Part 2.5 were shipped together last round
   and for the same reason.
4. **Part 3** — the Longhouse deletion and the Shelter ladder.
5. **Part 4's remaining rates** — loremaster, acolyte, consumption.
6. **Part 8.1** — Poppy. Ship it *with* Part 5, not after: the storage passive and the
   leader multiplier are two of the terms Part 5 exists to remove, and leaving them in
   for a round would mean measuring the cap fix against a ceiling that is still ×1.35
   inflated on a Poppy-led save. The new vigor passive is deliberately outside every
   category this spec measures, so it adds no confound.
7. **Part 6** — the branch techs. Cosmetic to pacing; do it last so it cannot confound.
8. **Not Part 3 of v0.44.** The Convergence stripe stays unset for a fourth round.

### What I expect, stated in advance so a miss is informative

Sparks is currently y95.1 and Era 3 is 86 years.

- At **Sparks**, the Monument/drake/soul product is small, so Part 1 costs knowledge
  ≈×1.4; the loremaster rate costs ×1.71; population at that point is perhaps half of
  what it will be, ≈×2. Compounded: **≈×4.8 → Sparks near y450.** Target band y350–500.
- Across **Era 3**, all three terms are at full size: ×4.5 × 1.71 × 3.6 ≈ **×27**, giving
  an era of roughly 2,300 years — but that ignores the Reactors and Plants the settlement
  can now actually afford to build, which pull it back. **Expect Icathia y1,800–2,800**
  against a target of y1,400–2,300.

**If Icathia lands above 2,800 the lever is not the tech ladder** — it is at exact
Kittens parity rank for rank and re-pricing it would undo Part 2.5 of v0.44. The lever is
the Era-3 building costs measured in effective-raw terms per Part 7.

### Pass conditions

- **Knowledge and Culture receive `catCharts × catReligion × catPolicy` and nothing
  else.** Assert directly against `catMonument`, `catDrake`, `catSoul`, `catBuff` at
  three save states. This is Part 1 and everything else is downstream of it.
- `caps.knowledge` before the compendium term equals `Σ(building caps.knowledge)`
  **exactly** — not approximately.
- **Science building stock at Icathia near 30 / 30 / 25 / 13**, measured on **both** a
  Poppy-leading Mountain-Drake save and a save with neither, and **the two must agree
  within 10%**. That agreement is what proves Part 5 is wired through every multiplier
  rather than just the Scholarship one. With Part 8.1 shipped the two saves should now
  agree on the knowledge ceiling **exactly**, not within 10% — the 10% band is for the
  building counts, which still differ through material caps.
- **`champStore` no longer appears in `computeCaps()`**, and `champPassive("storage")`
  has no call sites. Grep-level assertion; it is the cheapest one in the list.
- **A Poppy-led save shows a knowledge ceiling identical to the same save with a
  different leader**, and material ceilings 8% higher. Two numbers, one test.
- **Per-worker ore : timber at Icathia between 1.6 and 2.2**, and each within 25% of the
  Part 2.5 table at the measured building count. Report N for Mine, Quarry and Lumber
  Mill so the comparison is checkable.
- **`buildingJobBoost` remains unbounded.** Explicit no-regression item.
- **Population 115–140 at Icathia and still rising**; 130 by y600.
- **Morale ≥ 0.90 at Icathia with no change to the morale code.** If it is not, morale is
  a genuine finding and we will have isolated it.
- Median tech step ×1.10–1.20 **over ranks 1–36 only**; geometric mean ×1.25–1.30. Both,
  reported separately.
- Every Era-3 building cost reported in effective-raw as well as nominal terms.
- Aggregate champion multiplier across all lines reported, expected ×1.5–3.0.
- No regression: `G < 0.8` at max `M`; no champion at level 10 before Era 3; a benched
  champion reaches level 5–6; first champion before y120.

---

**Sources, all read this session.** `nuclear-unicorn/kittensgame` —
`js/resources.js:14, 128–140` (transient); `game.js:3425–3496` (`getResourcePerTick`,
the guards), `:2452–2470` (`getLimitedDR`), `:5476` (`getUnlimitedDR`);
`js/buildings.js:451–510` (hut, logHouse, mansion), `:579–580` (libraryRatio),
`:959–1015` (mine, quarry), `:1355–1364` (magneto), `:1246–1256` (steamworks),
`:1402–1416` (lumberMill), `:1550–1568` (reactor), `:1801–1830` (amphitheatre),
`:2389–2404` (`getPriceRatioWithAccessor`); `js/workshop.js:73–175` (saw and axe lines),
`:593–632` (hutPriceRatio), `:2769–2786` (compendium clamp);
`js/village.js:7–9` (kittensPerTickBase, catnipPerKitten), `:78–84` (priest),
`:653, 687, 761` (`getLeaderBonus` — production only, no cap effect), `:908–990`
(`getUnhappiness`, `updateHappines`); `game.js:661` (`manpowerJobRatio`), `:1487, 3467`
(`rankLeaderBonusConversion`); `js/science.js` (full 64-tech price table). Verified
against `index_44.html` lines 225–248, 431–441, 536–588 (`CHAMPS`), 597–604
(`champPassive`), 806–877, 1734–1745, 1900–1955, 2018–2050, 2138–2148, 2190–2235.
