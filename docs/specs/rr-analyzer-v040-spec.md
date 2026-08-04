# BUILDER SPEC v0.40 — morale band, Wilds parity, Convergence at Kittens parity

Measured against `index_v039.html` running headlessly through the real `morale()`,
`computeRates()`, `computeCaps()`, `worshipBonus()` and `EXPEDITIONS[].run()`.

This round has three parts: answers to the three questions in your build report,
four directives from Jerry, and one live bug I found while verifying the morale
formula. Every formula change below is derived, not guessed — the arithmetic is
shown so you can check it and so we can re-tune with one constant next round.

---

## Part 0 — Where you were right, and where I was wrong

**Your §2 deviation is correct and I withdraw §6's parenthetical.** The
Observatory's slab is Kittens' Era-1 mineral slab (250 minerals), the Observatory
unlocks at Astronomy long before titanium, and my own §7 table mapped Slab →
Stone Slab. §6 and §7 contradicted each other; §7 was right. `stoneSlab: 35`
stands. Your measurement — every run stalling dead at year 65 — is the proof, and
it is a better argument than either of my sections.

**Your §3 is correct and is the most valuable finding of the round.** Kittens
caps only raw resources; every workshop material (beam, slab, plate, gear,
scaffold, alloy, concrete) is uncapped, precisely so geometric build costs cannot
outrun their own inputs. Uncapping the eleven crafted materials is right, and so
is the `buildingVisible` exemption — a craft you can already run is not a
discovery. Neither should be revisited.

**Your §0 measurement settled the Parchment question the right way.** 435,000
Parchment an hour was not compensating for low fur income; it was free. Parchment
at 175 furs is exact Kittens parity and it gave furs the only working sink in the
game. That result is what Part 2 below generalises to the other two luxuries.

---

## Part 1 — Answers to your three questions

### A. Knowledge cap: take Option 2, and take it *alone*

Option 2, and specifically **remove the Tome clamp entirely**:

```js
// was:
caps.knowledge += Math.min(
  150 * Math.floor(S.res.tome || 0) * (S.upgrades.greatLibrary ? 1.25 : 1),
  knowledgeFromBuildings);

// becomes:
caps.knowledge += 150 * Math.floor(S.res.tome || 0) * (S.upgrades.greatLibrary ? 1.25 : 1);
```

The clamp was a correct decision *at the time it was made* and your own §0
measurement is what retires it. It existed because Tomes were free — 5 Parchment
at 4 furs each was 20 furs a Tome, so an uncapped Tome line would have run away
instantly. A Tome now costs 50 Parchment + 250 mana + 1,500 knowledge, which at
175 furs a Parchment is **8,750 furs and 1,500 Knowledge per Tome**. That is
Kittens' Compendium shape exactly: 50 manuscripts + 10,000 science, uncapped,
self-limited by cost rather than by a clamp. Keeping a clamp on top of a real
cost is double-gating the same resource, and it is why your cap asymptotes at
~1.0M while building costs keep climbing geometrically.

Add two more tiers to the Scholarship line so the multiplicative half keeps pace,
gated *before* the techs they need to unlock:

```js
{ id: "annotatedIndex", name: "The Annotated Index", cost: { tome: 40, culture: 4000 }, tech: "chemtech",
  desc: "Scholarship IV — every citation now cites its own citations. Knowledge, Culture & Devotion storage ×2" },
{ id: "livingLibrary", name: "The Living Library", cost: { tome: 120, hexcore: 4 }, tech: "deepWorks",
  desc: "Scholarship V — the catalogue has started making suggestions. Knowledge, Culture & Devotion storage ×2" },
```

**Do not lower the Era-3 tech ceiling in the same pass.** Your 1,745-year
Chemtech→Hexcore gap is a symptom of the cap asymptote, not of the tech prices —
the prices only *look* wrong because the cap stopped growing underneath them. If
you change both levers at once we will not know which one moved the result. Ship
Option 2, re-measure, and send me the new gaps; if Hexcore still lands past year
1,000 I will cut the top three prices with real numbers instead of guesses.

### B. The luxury sinks — and the assumption of mine that broke

You are right that demand is not the lever, but the diagnosis goes one level
deeper, and it invalidates a derivation I gave you in v0.37.

Measured on this build at year 101, population 41: **mushrooms 71,568, plumes
60,399** against a `luxuryComfort()` of 164. That is **436× oversupply** — an
order of magnitude worse than the 6,500 in your report, because your run had
other vigor sinks competing. Consumption is `0.002 × pop = 0.082/s`. Supply, with
`campYieldMult()` at ×6.6, is roughly 1.2 units/s. Supply outruns demand about
15× per luxury, permanently.

Here is the part that is my error. In v0.37 I argued luxury demand should revert
from `√pop` to linear `pop`, on the grounds that removing camp cooldowns made
supply **vigor-bound**, and vigor is proportional to population, so both sides
scale linearly and the crossover disappears structurally. That derivation is
sound *except* that `campYieldMult()` multiplies the supply side by up to ×6.6
and has no counterpart on the demand side. Supply is therefore not linear in
population — it is linear × a growing multiplier. The linear-demand change was
correct; the assumption underneath it was not.

**The fix is to restore the assumption, not to inflate demand.** Give the three
luxury camps their own, much tighter yield ceiling:

```js
var CAMP_YIELD_LIMIT = 6;          // unchanged — Krugs, Blue, Red, Drake, Baron
var LUXURY_CAMP_YIELD_LIMIT = 1.0; // Wolves, Gromp, Raptors: at most ×2

function campYieldMult(isLuxury) {
  var sum = 0.05 * (S.jobs.jungler || 0) + 0.15 * count("hunterLodge") + champPassive("camp") / 100;
  if (S.upgrades.trappersCraft) sum += 0.25;
  if (S.upgrades.beastLore) sum += 0.25;
  if (S.upgrades.masterOfTheHunt) sum += 0.50;
  return 1 + limitedDR(sum, isLuxury ? LUXURY_CAMP_YIELD_LIMIT : CAMP_YIELD_LIMIT);
}
```

and pass `true` from the Wolves, Gromp and Raptors `run()` bodies only.

Rationale, and it is narratively clean as well as arithmetically necessary:
better hunters bring back more *materials* — ore, gold, essences, trophies —
because those scale with skill. They do not bring back proportionally more
*comfort*, because a settlement of 130 can only enjoy so much at once. Kittens
does the same thing implicitly: its luxury resources (furs, ivory) come off a
hunt whose yield scales far more weakly than its mineral and science lines.

At ×2 instead of ×6.6, a 100-vigor hunt returns ~30 units. At population 130 with
~4 vigor/s of income split across three luxuries, that is ~0.4 units/s each
against demand of 0.26/s — about 1.5× headroom. Stocks should settle in the low
hundreds, near `luxuryComfort()`, which is exactly where the morale term is
supposed to bite. **Leave `0.002 × pop` alone**; the demand side is now correct
once supply stops carrying a multiplier demand never had.

One second-order effect to expect and not to panic about: furs now have both a
weaker supply multiplier *and* the Parchment sink, so they may go net-negative.
If `luxdiag` reports furs dry more than ~5% of samples, raise the Wolves base
yield rather than restoring the multiplier — Part 2.3 already changes that line.

### C. Poro sacrifice cost: 60, not 250

Measured Poro stockpiles on this build: 7 at year 51, 31 at year 61, 80 at
year 91, 102 at year 101 — roughly +1 Poro per game-year from the Abyss journey's
1–3 per run on a 300 s cooldown, plus Pasture herd growth. A 250-Poro sacrifice
is ~2.5× a mid-game stockpile, so the mechanic would fire once and then be dead
for a hundred years.

Set it to **60 Poros**. That is about 60% of a year-100 stockpile and a small
fraction of what a Deep-Works-era settlement will hold, so the first sacrifice is
immediate and repeat sacrifices are a real decision rather than a formality.

There is a helpful interaction with Part 2.1 below: once Poros stop granting
morale, there is no longer any reason to hoard them, and they become a pure
Freljord input. That is the first time the sacrifice has had an uncontested
claim on the resource, and it is worth saying in the tooltip.

*Caveat: my harness has never driven a run as far as Deep Works on this build
(see Part 4), so 60 is derived from the accumulation rate, not observed at the
moment of unlock. Report the actual stockpile at first Watcher's Eye and I will
finalise it.*

---

## Part 2 — Jerry's four directives

### 2.1 Only Furs, Plumes, Mushrooms and Jack-in-the-Box count toward morale

Poros and True Ice both become Freljord materials, so neither should be paying
morale rent. Poros are currently paid **twice** — once through `luxuryTypes()`
for up to +10, and again through `poroMoraleBonus()` for up to +30.

```js
function luxuryTypes() {
  var t = [];
  if (S.res.mushrooms >= 1) t.push("mushrooms");
  if (S.res.furs >= 1) t.push("furs");
  if (S.res.plumes >= 1) t.push("plumes");
  return t;                       // poros, trueice and jackbox all removed
}
// poroMoraleBonus() — delete the function and its call site entirely.
```

Jack-in-the-Box leaves `luxuryTypes()` too, but for a different reason: boxes are
never consumed, so `stock / luxuryComfort()` is not a meaningful ratio for them.
They get their own bounded line in 2.2 instead. Net effect on the ceiling: the
luxury term drops from a possible +60 to a hard **+30**, and Poros lose a further
+30.

Verified against the running build at year 101 (pop 41, 16 taverns, furs 162,
mushrooms and plumes both far above comfort, poros 102, comfort 164): the shipped
formula computes 151, and the game reported 151. With this change alone the same
state computes **111**.

### 2.2 The 130–140 morale band: cap Tavern relief, and bound the two flat adders

Three terms are currently unbounded, and any one of them alone puts morale
through the ceiling in Era 3.

| Term | Now | Ceiling |
|---|---|---|
| Tavern relief | `limitedDR(0.05 × taverns, 1.0)` | **100% — crowding can be fully cancelled** |
| Shrine morale | `count("shrine") × (0.5 + 0.1 × altarTier)` | **unbounded — Shrine is ratio 1.15** |
| Jack-in-the-Box | `S.jackboxes × 2` | **unbounded** |

The Tavern one is the important one. `limitedDR(x, 1.0)` asymptotes at 1.0, so
crowding — the only force in the system that grows with population — can be
driven to zero. Kittens' Amphitheatre reduces `unhappinessRatio` but its Temple
counterpart runs at price ratio **2.5**, which self-limits the count; RR's Shrine
is 1.15 and spammable, so RR needs an explicit bound where Kittens gets one for
free from the price curve.

```js
function morale() {
  var m = 100;
  var crowd = Math.max(0, S.pop - 5) * 2;

  // Relief asymptotes at 88%, never 100%. A large settlement always carries some
  // crowding — that residue is what keeps morale a system instead of a bonus.
  var relief = limitedDR(0.05 * count("tavern"), 0.88);
  m -= crowd * (1 - relief);

  // Maintained comforts only: furs, plumes, mushrooms. Max +30.
  m += luxuryTypes().reduce(function (a, r) {
    return a + 10 * Math.min(1, S.res[r] / luxuryComfort());
  }, 0);

  // Shrines: same flat-add role as Kittens' Sun Altar, but LDR-bounded at +25
  // because RR's Shrine is ratio 1.15 where Kittens' Temple is 2.5.
  if (S.wtechs && S.wtechs.sunAltar) {
    m += limitedDR(count("shrine") * (0.5 + 0.1 * (S.altarTier || 0)), 25);
  }

  // Boxes: permanent, so bounded. +2 each, asymptote +20.
  m += limitedDR(2 * S.jackboxes, 20);

  return Math.max(25, Math.round(m));
}
```

Positive ceiling is now fixed at **100 + 30 + 25 + 20 = 175**, and the crowding
residue does the rest. Resulting curve:

| Stage | pop | taverns | relief | lux | shrine | box | **morale** |
|---|---|---|---|---|---|---|---|
| Era 0 | 20 | 2 | 0.100 | 18 | — | — | **91** |
| Era 1 | 40 | 6 | 0.300 | 24 | — | — | **75** |
| Era 2 | 80 | 16 | 0.746 | 27 | 10 | 6 | **105** |
| Era 3 | 130 | 30 | 0.834 | 30 | 19.8 | 15.8 | **124** |
| Era 3, invested | 130 | 60 | 0.861 | 30 | 19.8 | 15.8 | **131** |
| Era 3, asymptote | 130 | ∞ | 0.880 | 30 | 25 | 20 | **140** |
| Late Era 3 | 190 | ∞ | 0.880 | 30 | 25 | 20 | **121** |

That is the shape Jerry asked for: a real pinch in Era 1 (75% is a 25% output tax
— morale multiplies all worker output — but well clear of the 25% floor), a
recovery through Era 2 as Shrines and boxes come online, and a **130–140 band in
Era 3 that has to be earned with Tavern investment rather than arriving free**.
It keeps tapering past 130 population, so growth stays a real trade-off.

**The band is tunable with exactly one number.** If it lands low, raise the
relief limit; if high, lower it. Sensitivity at population 130, full investment:

| Relief limit | Ceiling morale |
|---|---|
| 0.85 | 137.5 |
| 0.88 | **140.6** |
| 0.90 | 143.1 |

Note this interacts with Part 1B: with luxury stocks settling near
`luxuryComfort()` instead of 400× above it, the +30 luxury term will often be
partial, which pulls realised morale a few points below the table. Measure after
both land, then adjust the one constant.

### 2.3 The Wilds: Wolves, Gromp and Raptors all cost 100 Vigor

Current costs and the resulting efficiency:

| Camp | Vigor | Yield | Avg | Vigor per unit |
|---|---|---|---|---|
| Wolves | 40 | `4 + rand(6)` furs | 6.5 | 6.15 |
| Gromp | 60 | `5 + rand(11)` mushrooms | 10.0 | 6.00 |
| Raptors | 100 | `12 + rand(7)` plumes | 15.0 | 6.67 |
| Krugs | 150 | ore + gold | — | unchanged |

Those three efficiencies were deliberately equalised in v0.37, so flattening the
cost to 100 without touching yields would break the parity in the other
direction — Wolves would become 2.3× worse per fur than Raptors are per plume.
Raise the yields to hold the ~6.3 vigor-per-unit line:

```js
// wolves  — cost { vigor: 100 }
var f = Math.round((12 + Math.floor(Math.random() * 8)) * campYieldMult(true));   // 12-19, avg 15.5
// gromp   — cost { vigor: 100 }
var shrooms = Math.round((10 + Math.floor(Math.random() * 14)) * campYieldMult(true)); // 10-23, avg 16.5
// raptors — cost { vigor: 100 }, yield unchanged 12-18
// krugs   — cost { vigor: 150 }, yield unchanged
```

Resulting spread: Wolves 6.45, Gromp 6.06, Raptors 6.67 vigor per unit — tighter
than today's. Update the three `yield:` description strings to match.

This has a deliberate second effect worth naming, because it serves 2.2 directly:
base Vigor cap is 100, so at the start of the game a full Vigor bar now buys
**exactly one hunt** where it used to buy two and a half. Early luxury supply
gets substantially harder, which is precisely the "morale should be hard to
manage early" half of the directive. It eases naturally as Junglers, Hunter's
Lodges and the camp-yield upgrades raise both Vigor income and yield.

### 2.4 Convergence at 5–7% in Era 3 — and Kittens parity gets there exactly

```js
function worshipBonus() {
  if (!S.wtechs || !S.wtechs.convergence) return 0;
  return Math.min(10.0, 0.01 * unlimitedDR(S.worship || 0, 1000));
}
```

**One character changes: `0.05` → `0.01`.** RR is currently running Kittens' own
Solar Revolution curve at exactly **five times** its coefficient. Kittens'
production bonus from praised faith is `unlimitedDR(worship, 1000)` read as a
*percentage* — i.e. `0.01 ×` as a fraction — hard-capped at +1000%. RR uses the
identical `unlimitedDR` with the identical stripe of 1000 and then multiplies by
five.

Dropping to parity lands the Era-3 target without touching the curve at all.
Measured Worship on this build at year 101 is **25,832**, accumulating ~470/year:

| Worship | Current (0.05×) | **Kittens parity (0.01×)** |
|---|---|---|
| 1,000 | 5.0% | 1.0% |
| 10,000 | 20.0% | 4.0% |
| **25,000 — Era 3 entry** | 32.9% | **6.6%** |
| 50,000 | 47.6% | 9.5% |
| 100,000 | 68.3% | 13.7% |
| 500,000 | 155.6% | 31.1% |
| 1,000,000 — Era 4 | 221.2% | 44.2% |

6.6% at Era 3 entry, inside Jerry's 5–7% band, with no stripe adjustment and no
new mechanic. The heavy diminishing return he asked for is intrinsic to
`unlimitedDR`: it is √-shaped, so **40× the Worship buys 6.7× the bonus**. Add
the `Math.min(10.0, …)` to match Kittens' own +1000% ceiling — it will not bind
for a very long time, but it is part of the source formula and costs nothing.

Also update the Convergence wtech description, which currently promises "All
production rises with total Worship" without a scale; say "+1% to all production
per √Worship — about +7% at Era 3, +44% at a million" so the player can see the
shape before committing 400 Devotion.

---

## Part 3 — One live bug: the morale tooltip disagrees with morale

`showMoraleTooltip()` computes its own numbers and they are two versions stale:

```js
var relief = Math.min(0.9, 0.05 * count("tavern"));                       // hard min, not limitedDR
var crowd = (Math.max(0, S.pop - 5) * 2 + Math.max(0, S.pop - 60) * 1) * (1 - relief);
                                          // ^ the super-linear term removed in v0.36
```

`morale()` uses `limitedDR(0.05 × taverns, 1.0)` and a purely linear crowd. So a
player hovering the morale readout sees a penalty breakdown that does not add up
to the percentage shown directly above it, and the discrepancy grows with
population — at 130 wanderers the tooltip invents 70 points of crowding that the
real formula does not charge.

Have the tooltip call the same terms `morale()` uses rather than re-deriving
them. The cleanest fix is to have `morale()` optionally return its breakdown
(the same pattern `computeRates()` already uses with `rates._bd`) and have the
tooltip render that, so the two can never drift again. While you are in there,
the tooltip's Poro and Jack-in-the-Box lines need updating for Part 2.1 and 2.2.

---

## Part 4 — Harness caveat, stated plainly

My bot could not drive v0.39 past **population 41 and 17 techs in 250 game-years**,
against your simulator's population 192 and Sparks at year 93.5. That gap is my
harness, not your build, and I want to be explicit about which findings survive it.

The cause is that v0.39 raised craft input costs 6–40× (Beam 25 → 150 timber,
Parchment 4 → 175 furs) and moved storage onto crafted materials. My bot crafts
whenever it can afford one unit, which now drains exactly the timber and ore that
housing, Archive and Storehouse need, so the settlement never grows. I patched it
to craft only from surplus (above 35% of cap) and it improved from population 12
to 41, but it is still under-driving and I am not going to report pacing numbers
off it this round. **Take your pacing table, not mine.**

What that does *not* affect — and what every number in this document rests on:

- Formula reads and cost tables are static analysis of the shipped source.
- The morale verification is exact: at year 101 my harness computed 151 and the
  game reported 151, term for term. That is what licenses the Part 2.2 table.
- The luxury oversupply (mushrooms 71,568, plumes 60,399 against comfort 164) and
  the Poro accumulation rate are direct reads of live state, and the oversupply
  finding is *stronger* on a weak run, not weaker — a bot doing less hunting
  still drowned in mushrooms.
- Worship 25,832 at year 101 is a live read, and the Convergence table is
  algebra over the shipped `unlimitedDR`.

I will rebuild the bot's craft policy properly before the next round so I can go
back to reporting era boundaries independently.

---

## Part 5 — Order, and what to verify

1. **Part 1A** — drop the Tome clamp, add Scholarship IV/V. Re-measure the
   Era-3 tech gaps *before* changing any tech price.
2. **Part 1B** — `LUXURY_CAMP_YIELD_LIMIT`. Everything in Part 2.2 is measured
   against luxury stocks sitting near comfort, so this lands first.
3. **Part 2.1 and 2.2** — the morale rewrite, together.
4. **Part 2.3** — Wilds vigor and yields.
5. **Part 2.4** — the `0.05 → 0.01` coefficient.
6. **Part 1C** — Poro sacrifice at 60.
7. **Part 3** — the tooltip.

Pass conditions:

- Morale in the **90–140 band ≥80% of samples** after year 60; below 90 before
  year 50; never pinned above 140 after Era 3 entry
- Mushroom and Plume steady-state stocks within **0.5×–3× of `luxuryComfort()`**,
  each dry less than 5% of samples
- Convergence bonus between **5% and 8%** at Sparks, under 50% at 1M Worship
- All three luxury camps at 100 Vigor, per-unit vigor cost within 6.0–6.7
- Chemtech → Hexcore gap under 400 game-years; no Era 0–3 milestone gap over 60
- No regression: Era 0 by y25, Convergence by y250, first champion by y120,
  130 wanderers by y600, Sparks by y500
