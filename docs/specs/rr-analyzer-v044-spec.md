# BUILDER SPEC v0.44 — the missing industrial layer, and Renown unbound

Measured against `index_v043.html`. Kittens values read from
`nuclear-unicorn/kittensgame` — `game.js:getResourcePerTick` (the full multiplier
chain), `js/buildings.js`, `js/workshop.js`.

Your §2 negative result is the most useful measurement of the round, and your §6
points at the right lever. This spec is mostly about finishing that lever, because I
can now put a number on how far short RR is.

---

## Part 0 — Accepting your three findings

**§1, the A/B: +422 years for the champion change.** Exactly the shape Part 2
predicted, now quantified. Correct, keep it.

**§2, housing did nothing.** A clean negative result, and it retires my Part 3
diagnosis from last round. The Shelter reducers are still worth keeping — the ratio
ladder 2.20 → 1.65 → 1.28 → 1.17 → 1.15 is right, and Shelter #40 at 1,863 timber
instead of 1.8 × 10¹⁴ removes a wall that *would* have bound later. But it was not
the wall today, and I was wrong that it was. Your measurement — **72 timber and 113
ore held against a 291 + 344 Longhouse** — is the finding, and Part 1 is the answer.

**Your `limitedDR` observation is right and I should have caught it.** RR's
`limitedDR` and Kittens' `getLimitedDR` are different curves, so my Σ = 1.20 against
ratioBase 1.20 lands at 1.15 in RR where it lands near 1.35 in Kittens. Leave the
deltas as shipped; 1.15 at the end of a four-upgrade line is a fine destination and
the intermediate rungs are well spaced.

---

## Part 1 — RR is ~16× short of Kittens' multiplier stack, and the gap is one missing tier

I traced Kittens' full production chain in `game.js:getResourcePerTick` (lines
3390–3540). Every multiplicative category, in order:

| # | Category | Source | Typical mid-late value |
|---|---|---|---|
| 1 | season / weather | `getWeatherMod` | ×0.85–1.15 |
| 2 | happiness | inside `village.getResProduction` | ×1.5–2.5 |
| 3 | leader rank | inside job production | ×1.05–1.25 |
| 4 | `<res>JobRatio` | workshop upgrades on jobs | ×1.25–1.75 |
| 5 | `<res>GlobalRatio` | upgrade effects, global | ×1.1–1.5 |
| 6 | **`<res>Ratio`** | **Mine 0.20/copy, Quarry 0.35/copy** | **×16** |
| 7 | `<res>RatioReligion` | religion | ×1.1–1.5 |
| 8 | `<res>SuperRatio` | late upgrades | ×1.1–1.4 |
| 9 | **`magnetoRatio × swRatio`** | **Magneto 0.02/copy × Steamworks 0.15/copy** | **×3.4** |
| 10 | **`productionRatio`** | **Reactor 0.05/copy at ratio 1.15** | **×2** |
| 11 | `solarRevolutionRatio` | faith | ×1.5–3 |
| 12 | paragon | prestige | ×1.5–3 |
| 13 | festival | calendar cycle | ×1.5 while active |

**RR matches categories 1–8 closely, and its Mine and Quarry are at exact parity**
(`jobBoost: { miner: 0.2 }` and `{ miner: 0.35 }` against Kittens' `mineralsRatio`
0.2 and 0.35, both additive and uncapped). That part of the build is correct.

**RR has nothing at all for categories 9, 10 and 12.** Multiplying out a developed
mid-late settlement:

| | Kittens | RR v0.43 |
|---|---|---|
| Mine + Quarry tier | ×16 | ×16 |
| Magneto × Steamworks | **×3.4** | **—** |
| Reactor tier | **×2.0** | **—** |
| Global multiplier buildings | (in 9 & 10) | ×2.3 (Foundry + Monument + Charts) |
| Faith | ×2–3 | ×1.065 *(correctly, after the stripe fix)* |
| Happiness | ×1.5–2.5 | ×1.35 |
| Paragon | ×1.5–3 | — (no prestige layer yet) |
| **Product** | **≈ ×870** | **≈ ×53** |

**RR is roughly 16× short**, and the deficit is almost entirely one missing tier:
Kittens' industrial layer, which arrives at Industrialization/Electricity — exactly
the position Era 3 occupies in RR. Era 3 brings RR autoprod raw materials and
crafting depth, but **no new production multiplier layer at all**. That is why every
correction we make lands so hard: there is nothing underneath to absorb it.

This also satisfies Jerry's constraint precisely. Adding these does not push RR
*past* the Kittens curve — it brings RR *up to* it, in the same era, with the same
per-copy magnitudes and the same price ratios.

### 1.1 The amplifier pair — Kittens' single most powerful structure

Kittens' Magneto gives +2% to everything per copy, and Steamworks **amplifies every
Magneto by +15% per Steamworks copy**:

```js
var swRatio = steamworks.on > 0 ? (1 + 0.15 * steamworks.on) : 1;
perTick *= 1 + (magnetoRatio * swRatio);
```

Twenty Steamworks turn thirty Magnetos from +60% into +240%. **RR has no
multiplicative pairing anywhere.** Add it, using the building RR already has in that
slot:

```js
// Hextech Foundry keeps globalBoost 0.06 at ratio 1.25 — this is the Magneto.
{ id: "hexdraulicPlant", name: "Hexdraulic Plant", group: "Zaun", tech: "hexdraulics",
  lore: "Pressure, routed. The Foundries hum an octave higher and nobody sleeps.",
  effect: "Each Hextech Foundry is +15% more effective per Plant",
  cost: { hexgear: 120, plating: 200, gold: 4000 }, ratio: 1.25,
  foundryBoost: 0.15 },

// in computeRates(), replacing the flat globalBoost sum for foundries:
var swRatio = 1 + 0.15 * count("hexdraulicPlant");
var foundryGlobal = 0.06 * count("hextechFoundry") * swRatio;
```

Twelve Foundries and ten Plants: 0.06 × 12 × 2.5 = **+180%**, against +72% today.

### 1.2 The Reactor tier — a global multiplier at ratio 1.15

Kittens' Reactor is `productionRatio: 0.05` per copy at **ratio 1.15**, which is why
you can own thirty of them. **Both of RR's global buildings sit at 1.25**, so a
player realistically owns ten to twelve of each and the category tops out near +70%.
The gentle ratio is the whole point of that tier.

```js
{ id: "arcaneReactor", name: "Arcane Reactor", group: "Zaun", tech: "greyReclamation",
  lore: "Contained, mostly. The Chem-Barons signed something they did not read.",
  effect: "All production +4% each",
  cost: { hexcore: 4, hexcrete: 8, focusedHex: 6 }, ratio: 1.15,
  globalBoost: 0.04 },
```

At ratio 1.15 a developed settlement reaches ~30 copies: **+120%**. Priced in
capstone crafted materials so it is genuinely Era-3 content and pulls on all three
chains — which is also the answer to "what are Hextech Cores *for* after the
Observatory."

### 1.3 Two upgrade categories RR is thin on

Kittens carries `<res>GlobalRatio` and `<res>SuperRatio` as separate additive
categories fed by workshop upgrades. RR has `zauniteDrills` and `masterworkTools`
and little else. Add three Era-3 discoveries, one per raw line, each +25% to that
resource globally: **Sump Ventilation** (ore), **Seasoned Timberworks** (timber),
**Hexresonance** (mana). Cheap to write, and they fill a category Kittens leans on.

---

## Part 2 — Renown, unbound (Jerry's directive 1)

Jerry's ruling: Renown has no Kittens equivalent, scale it freely, and the only rule
is that it must not push income, production or cost curves past Kittens'.

**That rule has a consequence worth naming: champion passives *are* a production
multiplier.** `champPassive` feeds camp yields, caravan yields, craft yields,
devotion, storage and now knowledge, plus the `ERA3_AFFINITY` accelerants. So the
champion stack is one of RR's multiplier categories and must be budgeted inside the
Part 1 total, not on top of it. With Part 1 landing, the champion stack should stay
roughly where it is — it is no longer needed to carry Era 3, which is what let it
distort the pacing in the first place.

### 2.1 Gate the last three rungs on content, not currency

Your §3 finding is that the ceiling reaches 23,208 before Sparks because Masonry,
three tech grants and Poppy's `champStore` all compound where my table assumed
Masonry alone. Chasing that with a steeper ratio is a race between two numbers that
both move. **Gate the top of the ladder on materials that cannot exist before Era 3
instead** — then the timing is structural and no ceiling arithmetic can outrun it.

```js
var CHAMP_RUNG_GATE = [
  {}, {}, {},                                  // 1-3: signature material only
  { stoneSlab: 25 }, { stoneSlab: 40 },        // 4-5: Era 1 craft
  { gear: 10, culture: 200 }, { gear: 18, culture: 400 },   // 6-7: Era 2
  { hexgear: 6 },                              // 8:  Era 3 chain running
  { hexcore: 4 },                              // 9:  capstone assembled
  { hexcore: 10, hexcrete: 2 }                 // 10: deep Era 3
];

function recruitCost(id) {
  var n = championsRecruited();
  var c = { renown: Math.round(250 * Math.pow(1.5, n)) };
  var d = champDef(id);
  for (var r in d.cost) if (r !== "renown") c[r] = d.cost[r];
  for (var g in CHAMP_RUNG_GATE[n]) c[g] = (c[g] || 0) + CHAMP_RUNG_GATE[n][g];
  return c;
}
```

Ladder at 1.5: 250, 375, 563, 844, 1,266, 1,898, 2,848, 4,271, 6,407, **9,611**;
cumulative 28,333. Gentler than 1.6 because the rungs no longer have to do the
gating alone — rung 9 needs 4 Hextech Cores and rung 10 needs 10 plus Hexcrete,
which is deep-Era-3 content by construction.

### 2.2 A ceiling that tracks era progression without matching it

```js
// Renown leaves the flat exemption but takes the square root of Masonry, so the
// ceiling rises with the era without inheriting all 22x of it.
var STORAGE_EXEMPT = { vigor: 1 };
// ...
caps.renown *= Math.sqrt(masonryMult);          // instead of the full masonryMult
```

with **Hall of Heroes raised from +120 to +250 renown per copy**. Resulting
ceilings, against the ladder:

| Point | √Masonry | Halls / TG | Ceiling | Highest rung affordable |
|---|---|---|---|---|
| Smelting | ×1.77 | 3 / 2 | 1,745 | 4 |
| Hextech | ×2.51 | 8 / 5 | 5,979 | 7 |
| Chemtech | ×3.55 | 20 / 10 | 20,626 | 10 *(if materials allow)* |
| Icathia | ×4.70 | 30 / 15 | 40,890 | levelling headroom |

The currency stops being the binding constraint around rung 7, and rungs 8–10 are
paced by Hexgear, Hextech Cores and Hexcrete instead. That is the design.

---

## Part 2.5 — The ×14.3 cliff: Jerry is right, and it is the whole Era-3 ladder

Jerry's question: why is Call to Arms → Sparks a ×14.3 step against Kittens' ~×3,
and is Theology the Sparks equivalent? Both halves of that are correct, and chasing
them down produces the largest single finding of the round.

**Kittens' ladder around that point, from source:**

| Rank | Tech | Science | Step |
|---|---|---|---|
| 15 | steel | 12,000 | ×1.26 |
| 16 | machinery | 15,000 | ×1.25 |
| 17 | **theology** | **20,000** | **×1.33** |
| 18 | astronomy | 28,000 | ×1.40 |
| 19 | navigation | 35,000 | ×1.25 |

**RR's Era 0–2 is already at Kittens parity and nobody noticed.** Call to Arms is
14,000 against machinery's 15,000 at the same rank. The entire divergence is on the
other side of the cliff: **RR's Era-3 costs are 9–37× Kittens' at the equivalent
rank.** The ×14.3 step is not a mispriced tech, it is the seam where a
Kittens-priced Era 2 meets an Era 3 that was inflated across four separate rounds —
including twice at my instruction.

And Jerry's mapping is right: **Sparks should be Theology, 20,000.** Not 200,000.

### 2.5.1 The re-priced Era-3 ladder

Fifteen rungs across Kittens' Theology → Electronics band (ranks 17–35), spaced to
Kittens' own ×1.05–1.40 steps:

| Tech | Now | **New** | Step | Cut |
|---|---|---|---|---|
| Sparks Beyond the Wall | 200,000 | **20,000** | ×1.33 | 10× |
| Hexdraulics | 247,000 | **28,000** | ×1.40 | 9× |
| Sump Ecology | 305,000 | **35,000** | ×1.25 | 9× |
| Progress Day | 377,000 | **42,000** | ×1.20 | 9× |
| The Chemtech Whisper | 450,000 | **50,000** | ×1.19 | 9× |
| Chem-Baron Accords | 580,000 | **58,000** | ×1.16 | 10× |
| Glorious Evolution | 750,000 | **65,000** | ×1.12 | 12× |
| The Hexcore Conjecture | 1,000,000 | **75,000** | ×1.15 | 13× |
| Atlas Gauntlets | 1,300,000 | **85,000** | ×1.13 | 15× |
| Hexgate | 1,700,000 | **92,000** | ×1.08 | 18× |
| The Deep Works | 2,200,000 | **100,000** | ×1.09 | 22× |
| Grey Reclamation | 2,700,000 | **112,000** | ×1.12 | 24× |
| Voidglass Optics | 3,320,000 | **120,000** | ×1.07 | 28× |
| Watchers Below | 4,080,000 | **128,000** | ×1.05 | 32× |
| The Doors of Icathia | 5,000,000 | **135,000** | ×1.05 | 37× |

The three Era-2 bridge techs move down to sit between Call to Arms and Sparks:
**Champion's Regimen 15,500, Deep Cartography 17,000, Refined Metallurgy 18,500**.
The ×14.3 cliff then disappears entirely — the largest remaining step in the whole
game is ×1.40, and the median lands at **×1.15** against Kittens' ×1.12.

### 2.5.2 The Scholarship line has to leave the knowledge cap

This is the part that actually delivers Jerry's brief — *"we should have to build a
similar number of Archives, Academies and Observatories as Kittens' Library, Academy
and Observatory."*

RR's science buildings are already exact parity (250/+10%, 500/+20%, 1000/+25%,
1500/+35%) and the compendium clamp is now correct. So required building count is
set by exactly two things: the tech price, and any multiplier sitting between the
buildings and the ceiling. Kittens has **no such multiplier**. RR has Scholarship at
**×3.99**, which means RR reaches any given ceiling with **a quarter of Kittens'
buildings**.

**Apply the Scholarship line to Culture and Devotion only, not Knowledge.**

```js
var SCHOLAR_CAPS = { culture: 1, devotion: 1 };   // knowledge removed
```

Then `knowledgeCap = Σ(building scienceMax) + min(150 × morellonomicons, that)` —
Kittens' formula with nothing added. Required stock at each landmark:

| Tech | Price | Building base needed | Stock that gets you there |
|---|---|---|---|
| Sparks (20,000) | 20,000 | 10,000 | ~20 Archives + ~10 Academies |
| Chemtech (50,000) | 50,000 | 25,000 | ~20 / ~20 / ~10 Observatories |
| Icathia (135,000) | 135,000 | 67,500 | ~30 / ~30 / ~25 / ~13 Hexcore Labs |

Those are Kittens' own end-of-tree building counts. That is the brief, met exactly.

### 2.5.3 What this does and does not do to pacing

**Knowledge stops being the Era-3 gate — and that is correct.** It is not the gate in
Kittens either. Your own §2 measurement says the binding constraint today is ore and
timber for buildings (72 timber held against a 291-timber Longhouse), not research.
Era 3's length must come from the craft chains, the autoprod fuel budget, the
building costs and the Part 1 multiplier tier — all of which this leaves untouched.

**Ship this with Part 1, not before it.** Cutting the ladder 9–37× while the
multiplier stack is still 16× short would produce a fast, shallow Era 3 and tell us
nothing. Together they are the two halves of the same correction: RR's costs came
down to Kittens' curve *and* RR's income came up to it.

---

## Part 3 — Convergence at 5–8% across Era 3 (Jerry's directive 2)

**First, Jerry's question — can we mimic Kittens' Worship→production totals? We
already do; only one constant differs.** The real formula, from `religion.js:1548`:

```js
getSolarRevolutionRatio: function() {
  var uncappedBonus = getUnlimitedDR(this.faith, 1000) / 100;
  return getLimitedDR(uncappedBonus, 10 + solarRevolutionLimit);
}
```

`unlimitedDR(faith, 1000)` read as a **percentage**, then LDR-capped at **10.0
(+1000%)**. RR's `0.01 × unlimitedDR(W, 1000)` is that expression exactly — the
v0.40 coefficient change was right, and it is verbatim parity.

What Kittens actually pays a first-run player:

| Faith | Solar Revolution |
|---|---|
| 1,000 | 1.0% |
| 10,000 | 4.0% |
| 100,000 | 13.7% |
| 1,000,000 | 44.2% |

A Kittens player before their first reset typically holds faith in the tens of
thousands to low hundreds of thousands, so **Solar Revolution runs about 4–15% in a
first playthrough** — noticeable, worth praising into, never load-bearing. That is
precisely the feel Jerry describes, and his 5–8% target is inside it.

**So the only divergence is a unit conversion.** RR's Worship totals run ~500k–3.4M
where Kittens' faith runs 10k–100k — roughly 30× higher — so RR needs its stripe
scaled by the same factor to land in the same band. Cutting supply instead would need
another 10–30× off the Acolyte on top of last round's cut, which would gut Targon.
**Scale the stripe; it is a unit conversion, not a nerf.**

Two small fidelity fixes while you are there: use `limitedDR(x, 10)` rather than
`Math.min(10, x)` for the ceiling, so RR approaches +1000% the way Kittens does
rather than clipping; and note the cap will never bind, which is fine — it does not
bind in Kittens either until deep prestige.

Now the band. Jerry wants it *across the era*, not at a point, and the √ curve gives
that for free. With `bonus = 0.01 · unlimitedDR(W, s)`:

- 5% at Era-3 entry needs `unlimitedDR(W₁, s) = 5` → **`s = W₁ / 15`**
- 8% at Era-3 completion needs `unlimitedDR(W₂, s) = 8` → **`s = W₂ / 36`**

Both hold simultaneously **iff `W₂ / W₁ = 2.4`** — Worship 2.4× at Icathia against
Sparks. Over an Era 3 of a thousand-plus game-years that is the natural accumulation,
so the band is achievable with a single constant and no clamps.

**The stripe must be re-derived, because Sparks moved.** The 20,000 you set came from
`W_median = 481,250` at a Sparks landing y309–842. Sparks is now y958 and will move
again with Part 1, so that input is stale in the direction of being too small.

Procedure, once Part 1 has landed and pacing is stable:

1. Measure Worship at Sparks across ≥4 seeds → `W₁ = median`.
2. Set **`s = W₁ / 15`**.
3. Measure Worship at Icathia → `W₂`. If `W₂ / W₁ < 2.4` the top of the band comes in
   under 8% — acceptable, and better than clamping. If it is much greater than 2.4,
   Era 3 is producing more Worship than the curve expects and the Acolyte rate is the
   lever, not the stripe.

Do not set the stripe in the same pass as Part 1. It has been re-derived twice
against a moving input already.

---

## Part 4 — Order, and what to verify

1. **Part 1.1 and 1.2 together with Part 2.5** — the amplifier pair, the Reactor
   tier, the re-priced Era-3 ladder and Scholarship leaving the knowledge cap.
   These four are one correction seen from two sides: costs coming down to Kittens'
   curve and income coming up to it. Measuring either alone would mislead.
2. **Part 1.3** — the three Era-3 raw-line upgrades.
3. **Part 2** — the Renown restructure and the rung gates.
4. **Part 3** — the stripe, only after pacing settles.

Pass conditions:

- **Science building counts at Icathia land near 30 Archives / 30 Academies / 25
  Observatories / 13 Hexcore Laboratories** — Kittens' own end-of-tree stock. This
  is Jerry's brief and the number that says the knowledge curve is copied rather
  than approximated
- **Largest tech step in the whole game ≤ ×1.5; median ×1.10–1.20**
- Convergence 5–8% across Era 3, and report the Worship totals alongside so the
  stripe stays a documented unit conversion rather than a magic number

- **Report the full multiplier product for ore and timber at Sparks and at Icathia**,
  category by category, against the Part 1 table. This is the number that says
  whether the industrial layer landed; everything else is downstream of it.
- Ore held at the moment a Longhouse is wanted rises above its price — the §2
  measurement (113 held vs 344 needed) inverts
- **Sparks between y350 and y500; Doors of Icathia between y1,400 and y2,300**
- Arcane Reactor count ≥25 by Icathia; Hexdraulic Plant ≥8
- Population reaches 130 by y600 and is still rising at y1,000
- **Tenth champion recruited between 70% and 100% through Era 3**, gated by Hextech
  Cores rather than by the Renown ceiling — confirm by logging which cost component
  was the last to be satisfied
- Renown ceiling is *not* the binding constraint for rungs 8–10
- Convergence 5–8% across Era 3, measured at both ends
- No regression: `G < 0.8` at max `M`; morale below 90 for ≥10% before y50; no
  champion at level 10 before Era 3; a benched champion reaches level 5–6

**Sources:** `nuclear-unicorn/kittensgame` — `game.js:3390–3540`
(`getResourcePerTick`), `js/buildings.js` (Magneto, Steamworks, Reactor, Mine,
Quarry), `js/workshop.js`.
