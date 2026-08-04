# BUILDER SPEC v0.43 — champions as a progression system, and the housing wall from source

Measured against `index_v042.html` through the real `computeCaps()`, `trainCost()`,
`recruitChamp()`, `buildingRatio()` and the shipped tables. Kittens values read from
`nuclear-unicorn/kittensgame` as in v0.42.

Jerry's directive this round rebuilds champions from a shop into a progression
system. That is Part 1. Part 3 is the population-113 wall, and the source has an
exact answer for it that neither of us has used yet.

---

## Part 0 — v0.42 verification, and one live bug

Verified against the shipped build: `CRAFT_YIELD_LIMIT` 2.2, Acolyte 0.012,
Jungler 0.30, Shelter `timber 8` @2.20, Quarry present at 1.15 with +35% miner,
Warehouse `beam 2 / stoneSlab 3`, Morellonomicon `30 tomes + 9,000 knowledge`
clamped to the building cap, Tomes on `unlimitedDR(tomes, 0.01)` culture, 35 techs
with a largest step of ×2.5 and no step above ×3. All correct.

**Your §0 correction of your own harness is the more valuable half of that report.**
Eight loremasters and three miners at population 28 is not a player, and the fact
that both our bots failed the same way — greedy first-affordable-wins against a
game that now requires saving — means the last two rounds had one error, not two
confirmations. Discounting your v0.41 pacing is right.

**One live bug.** The Scholarship multipliers were correctly cut to
`1.25 / 1.3 / 1.3 / 1.35 / 1.4` in `computeCaps()`, but the five upgrade `desc`
strings still read **"storage ×1.6", "×1.75", "×2", "×2", "×2"**. A player buying
The Great Index is promised ×2 and gets ×1.3. Same class of drift as the morale
tooltip in v0.40 — worth generating the description from the constant rather than
restating it.

---

## Part 1 — Champions: recruitment, experience, levelling

### 1.1 What the system does now, and why it does not meet the brief

```js
function recruitChamp(id) { ... if (!canAfford(d.cost)) return; ... }   // flat price, 320-540 renown
function trainCost(id) { renown: 40 * (lvl+1)^1.6, tome/hexcore }        // pure purchase
```

Recruitment is a flat price band 320–540 with no escalation, so once Renown income
covers the band, all ten arrive together — which is what you measured (ten champions
in Era 2). Levelling has **no experience component at all**; it is a shop with a
rising price. Neither matches "each champion investment feels like a significant
purchase."

### 1.2 Recruitment — a geometric ladder, ten rungs across Eras 2 and 3

```js
function championsRecruited() { return CHAMPS.filter(function (d) {
  return S.champs[d.id] && S.champs[d.id].r; }).length; }

function recruitCost(id) {
  var n = championsRecruited();
  var c = { renown: Math.round(250 * Math.pow(1.6, n)) };
  var d = champDef(id);
  for (var r in d.cost) if (r !== "renown") c[r] = d.cost[r];   // signature material, unscaled
  return c;
}
```

**The Renown price escalates with how many you already have; the signature material
does not.** Renown is the champion currency and carries the ladder; the signature
material stays a flavour gate. Scaling both would break — Leona's 900 Devotion at
the tenth rung would be 61,830 against a Devotion ceiling under 20,000.

| Champion # | Renown | Cumulative |
|---|---|---|
| 1 | 250 | 250 |
| 2 | 400 | 650 |
| 3 | 640 | 1,290 |
| 4 | 1,024 | 2,314 |
| 5 | 1,638 | 3,952 |
| 6 | 2,621 | 6,573 |
| 7 | 4,194 | 10,767 |
| 8 | 6,711 | 17,478 |
| 9 | 10,737 | 28,215 |
| **10** | **17,180** | **45,395** |

Ratio 1.6 is deliberately outside the 1.15 band: this is a ten-item ladder meant to
span two eras, not a building you buy forty of. Kittens' own outliers work the same
way — Hut at 2.5, Brewery at 1.5 — steep ratios are for things you buy *few* of.

### 1.3 Renown must join the Masonry storage line

The tenth champion costs 17,180 Renown and the current ceiling cannot hold it.
Renown is in `STORAGE_EXEMPT`, so its cap is a flat
`30 + 120·Halls + 60·TrainingGrounds + 180` from techs — reaching 17,180 would need
about **140 Halls of Heroes**.

**Remove `renown` from `STORAGE_EXEMPT`.** It then scales with Masonry I–V like every
other stored resource, and the ceiling tracks era progression on its own:

| Point in the game | Masonry | Halls / Training Grounds | Renown ceiling | Affords |
|---|---|---|---|---|
| Smelting | ×3.15 | 2 / 1 | 976 | champions 1–3 |
| Hextech | ×6.30 | 8 / 4 | 8,379 | through champion 7 |
| Chemtech | ×12.60 | 20 / 10 | 40,446 | **all ten** |
| Icathia | ×22.05 | 25 / 12 | 79,600 | levelling headroom |

That is the pacing Jerry asked for, produced by the storage curve rather than by a
hand-placed gate: the tenth champion becomes affordable in late Era 3 because that
is when Chemtech Silos land.

Keep `vigor` exempt — it is a transient flow resource and Masonry would break it.

### 1.4 Experience

```js
var CHAMP_XP_LEADER = 0.15;   // per second while this champion leads
var CHAMP_XP_BENCH  = 0.01;   // per second otherwise — 6.7% of leading

// The two champion buildings finally do something for champions.
function champXpMult() {
  return 1 + limitedDR(0.05 * count("trainingGround") + 0.03 * count("hallOfHeroes"), 1.0);
}

// in tick():
CHAMPS.forEach(function (d) {
  var c = S.champs[d.id];
  if (!c || !c.r) return;
  c.xp = (c.xp || 0) + dt * champXpMult() *
         (S.leader === d.id ? CHAMP_XP_LEADER : CHAMP_XP_BENCH);
});
```

XP is a **lifetime cumulative total and is never spent**. That is directive 4 done
structurally rather than with an overflow rule: a champion sitting at a threshold
keeps banking, and when the materials finally arrive they may level several times in
a row. Nothing is ever wasted, and a player who neglects the Training Grounds simply
gets there slower.

### 1.5 Level thresholds and the level-up gate

```js
function xpForLevel(lvl)  { return Math.round(120 * Math.pow(lvl, 2.2)); }  // lvl-1 -> lvl
function xpTotalFor(lvl)  { var s = 0; for (var k = 1; k <= lvl; k++) s += xpForLevel(k); return s; }

function canTrain(id) {
  var lvl = champLevel(id);
  if (lvl >= 10) return false;
  var c = S.champs[id];
  return (c.xp || 0) >= xpTotalFor(lvl + 1) && canAfford(trainCost(id));
}
```

`trainChamp()` keeps its existing material cost — `renown 40·(lvl+1)^1.6` plus Tomes
below 5 and Hextech Cores above — and now additionally requires the XP threshold.
**Materials alone are no longer sufficient**, which is the change.

| Level | XP for this level | Cumulative XP |
|---|---|---|
| 1 | 120 | 120 |
| 2 | 551 | 671 |
| 3 | 1,346 | 2,017 |
| 4 | 2,533 | 4,550 |
| 5 | 4,143 | 8,693 |
| 6 | 6,180 | 14,873 |
| 7 | 8,672 | 23,545 |
| 8 | 11,628 | 35,173 |
| 9 | 15,062 | 50,235 |
| **10** | **19,020** | **69,255** |

**Why these rates.** At the full ×2 building multiplier a leader earns 0.30 XP/s, so
69,255 XP is **289 game-years of uninterrupted leadership**. Over an Era 2 + Era 3
span of roughly 2,000 game-years there are ~1.6M seconds of leader time to
distribute across ten champions. A champion who leads 30% of that and rides the
bench the rest reaches **83,000 XP — level 10 with room to spare**. One who never
leads at all reaches ~16,000 — **level 5 or 6**.

That spread is the design: the bench still progresses, so nobody is dead weight, but
mastering a champion means choosing them. Getting all ten to level 10 is an
end-of-game achievement rather than a default.

### 1.6 UI

The champion card needs three things it does not have: current XP against the next
threshold (`23,545 / 35,173`), the accrual rate with a note on whether they are
leading, and — when XP is banked past a threshold — an explicit "ready to train,
needs 1,590 Renown + 3 Hextech Cores" rather than a greyed button with no
explanation. Banked overflow is the most satisfying part of this system and it is
invisible unless the card says so.

---

## Part 2 — Consequence: Era 3 loses its champion tailwind

Worth stating before you measure. Ten champions currently arrive in Era 2, and their
passives feed `champPassive("camp")`, `("caravan")`, `("craft")`, `("devotion")`,
`("storage")` plus the `ERA3_AFFINITY` accelerants — that is a broad, compounding
multiplier stack that Era 3 has been quietly leaning on, exactly as it was leaning
on the 32.6% Convergence you corrected last round.

Moving the tenth champion to late Era 3 removes most of that stack from the middle
of the game. **Expect Sparks to land later again**, on top of the ~26 percentage
points the stripe correction already removed. Both corrections are right and neither
should be reverted; if Era 3 then reads too slow, the lever is Part 4 of the v0.42
spec — more independent multiplier categories on the ore side — not walking back a
number we now know was wrong.

---

## Part 3 — The population wall, with the exact mechanism from source

You flagged population 113 against the 130 target with the wall sitting at `maxPop`.
Kittens solves this with four hut ratio reducers, and I pulled the real values:

```js
// workshop.js — four upgrades, additive negative deltas
ironwood         hutPriceRatio -0.50
concreteHuts     hutPriceRatio -0.30
unobtainiumHuts  hutPriceRatio -0.25
eludiumHuts      hutPriceRatio -0.10
                              Σ = -1.15

// buildings.js:2394 — how they apply
ratioBase = priceRatio - 1;                    // 2.5 - 1 = 1.5
ratioDiff = getLimitedDR(Σ deltas, ratioBase); // LDR(-1.15, 1.5) = -1.1484
finalRatio = priceRatio + ratioDiff;           // 2.5 - 1.1484 = 1.3516
```

**RR already implements this primitive** — `buildingRatio()` sums reductions and
LDR-caps them against `base - 1`. The problem is the numbers: v0.42 moved Shelter
from 1.75 to 2.20 but left the two reducers phrased against the old base, and two
reducers cannot do the work of four.

**Restate them as deltas against the new base, and add the two Kittens has that RR
does not:**

```js
{ id: "ironwoodShelters", ... shelterPriceRatio: -0.55 },   // Smelting   (existing)
{ id: "petriciteFrames",  ... shelterPriceRatio: -0.37 },   // Hexcore    (existing)
{ id: "hexcreteFrames",   ... shelterPriceRatio: -0.20,     // Deep Works (new)
  cost: { hexcrete: 60, scaffold: 120 } },
{ id: "voidwrightFrames", ... shelterPriceRatio: -0.08,     // Icathia    (new)
  cost: { voidglass: 12, chronoshard: 6 } },
```

Σ = −1.20 against `ratioBase` 1.20. Through the LDR that lands the Shelter ratio at
**≈1.28**, closely mirroring Kittens' 1.3516 — and it arrives in four steps across
Eras 2, 3 and 4 rather than two, so the population ceiling keeps moving for the
whole game instead of stalling once Petricite Frames is bought.

At ratio 1.28, Shelter #40 costs `8 × 1.28^39 ≈ 61,000` timber — reachable — against
`8 × 2.2^39` at the unreduced ratio, which is astronomically not. **That is the 113 →
130+ fix**, and it is the same shape Kittens uses.

Do the same audit on Longhouse: Stonecut Guild takes 1.15 → 1.09, which is a −0.06
delta against a `ratioBase` of 0.15 — only 40% of the available headroom, where
Kittens spends 77%. A second Longhouse reducer in Era 3 at −0.035 would take it to
about 1.055 and is worth adding while you are in the file.

---

## Part 4 — Order, and what to verify

1. **Part 3** — housing reducers. Population gates every Era-3 measurement, so it
   lands first and alone.
2. **Part 1.3** — Renown into the Masonry line.
3. **Part 1.2 / 1.4 / 1.5 / 1.6** — the champion system, one pass.
4. **Part 0** — the Scholarship description strings.

Pass conditions:

- **Population reaches 130 by y600 and is still rising at y1,000**
- **Tenth champion recruited between 70% and 100% of the way through Era 3**;
  first champion still by y120; fifth no earlier than Era 3 entry
- No champion reaches level 10 before Era 3 entry
- A champion left on the bench for the whole run reaches level 5 or 6, never 0 and
  never 10
- At least one champion is observed banking XP past a threshold while short of
  materials — that is the mechanic working, and it should be visible in the UI
- Renown ceiling exceeds the next champion's price at every rung; never the binding
  constraint for more than 40 game-years at a time
- Report **Era 3 entry and completion with and without the champion change**, so the
  Part 2 tailwind loss is separated from everything else
- No regression: `G < 0.8` at max `M`; Convergence 4.5–7% at Sparks; morale below 90
  for ≥10% of samples before y50; knowledge ceiling 1.5–2.5× the next tech

**Sources:** `nuclear-unicorn/kittensgame` — `js/workshop.js` (hut price ratios),
`js/buildings.js:2394` (`getPriceRatioWithAccessor`).
