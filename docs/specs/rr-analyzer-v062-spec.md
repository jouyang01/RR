# BUILDER SPEC v0.62 — the knee audit nobody had run, a loop the source also has, and twelve dev notes

Written against the **v0.61 tag**, verified from disk on a fresh checkout.

**What reproduces.** Thirty-two suites parsed from their own `SUITE-END` trailers: **1,703
assertions passed, 0 failed, no missing trailer, no skipped call site, no non-zero exit.** The
parity ledger reproduces **exactly from the generator** — `226 rows — PARITY 81, EASIER 105,
HARDER 15, UNVERIFIED 25`, triage `RETRIEVABLE 25, RR-ORIGINAL 0, GENUINELY OPEN 0`. **Every
v0.61 part shipped**: `RENOWN_PER_VIGOR 0.0154`, `renownFlat`, `TRADE_YIELD_LIMIT 3.0`,
`TRADE_PROVISIONS 5000`, `convMultBreakdown()`, `petriciteResonators`, `noUndo`, the
`slotAvailable` swap, and `civilisation` gone from the file entirely.

**And one finding in the report is overstated in a way that matters, because a whole deviation
rests on it.**

> §5.2 calls the trade→transmute cycle *"an unbounded resource loop"* and ships
> `TRADE_YIELD_LIMIT = 3.0` — a ceiling **the source does not have** — to contain it.
> **Kittens has the same cycles.** Lizards buy minerals and sell wood; sharks buy iron and sell
> catnip; nagas sell minerals; griffins sell iron; and Kittens ships the one craft that turns a
> refined resource back into a raw one (`wood ← catnip`, `js/workshop.js`). **What keeps the
> source's loops bounded is not a yield ceiling. It is a per-trade cost in resources the cycle
> does not produce** — `baseGoldCost: 15` and `baseManpowerCost: 50` (`js/diplomacy.js:10–11`),
> charged flat and **never multiplied by `tradeRatio`** (`:883–887`). **RR already has that
> guard**: every route costs `vigor 175` and `gold 45–68`, and the cycle produces neither.
> **Part 1.**

---

## Jerry's dev notes — where every one lives

| # | note | Part |
|---|---|---|
| 1 | Shrine + Altar of the Dawn morale scaling | **4.1** |
| 2 | Remove the fourth mana multiplier (Swain covers it) | **4.2** |
| 3 | Festival provisions cost should be higher | **4.3** |
| 4 | Shaco should refund partial vigor on bulk hunts | **5.1** |
| 5 | Noxus Raptor Plume trade cost → 100 | **5.2** |
| 6 | Morale tooltip need not explain poro / true ice | **6.1** |
| 7 | Rift Scuttler only on a charge run | **5.3** |
| 8 | Gromp: honeyflower on a charge run, not a stray poro | **5.4** |
| 9 | Barn / Warehouse / Harbor storage against Kittens | **3** |
| 10 | Marus Omegnum devotion cap → 200, and less devotion/s | **4.4** |
| 11 | Festival tooltip lists the renown reward | **6.2** |
| 12 | Mount Targon banner — **corrected**: remove the SQUARE moon on the peak, **keep the crescent** | **6.3** |

**And this round's four follow-up changes:**

| change | Part |
|---|---|
| Targon: the square moon on the peak goes, the side crescent stays | **6.3 — corrected in place** |
| Jarvan's lead reaches all jobs at 6%; passive starts at 15% | **6a** |
| Crest of Cinders → red glow on the workshop anvil and hammer | **6.4** |
| Crest of Insight → blue lights around the lore bookshelves and torches | **6.5** |

---

## Part 0 — Ground rules

**This spec produces `v0.62`.** Clone Kittens and pin the revision; everything below was read
from `nuclear-unicorn/kittensgame` at **`c52985b`**. Do not use grep.app.

**Do not re-open** STANDING-RULINGS §§1–30. **§31 is Jerry's open question and Part 8 carries it.**

**The ensemble.** v0.61 took ~97 minutes with the suite runner sharing the box. Budget 90–120
minutes and start it before writing code.

---

## Part 1 — The trade cycle: which leg should not close (builder note 1)

**Decomposed leg by leg**, `index.html:4276–4346` and `:6838`:

| leg | mechanism | cost | yield |
|---|---|---|---|
| 1 | **Demacia** trade | `timber 600 + vigor 175 + gold 68` | `steel ≈ 33 × mult` |
| 2 | **Piltover** trade | `steel 145 + vigor 175 + gold 45` | `mana ≈ 1,100 × mult` |
| 3 | **Transmute** craft | `mana 20` | `timber × transmuteYield()` |

The multiplier enters **twice**, once per trade leg, so `G ∝ mult²` — which is why a magnitude
cut cannot close it and the report is right about that.

### 1.1 The answer: none of the three legs is the problem, and the source proves it

**Every leg has a source counterpart.**

- **Legs 1 and 2 are ordinary trades**, and Kittens' trades form cycles of exactly this kind:
  `lizards` buy minerals → sell wood; `sharks` buy iron → sell catnip; `nagas` sell minerals;
  `griffins` sell iron (`js/diplomacy.js`).
- **Leg 3 has a direct counterpart too, and this is the one I expected not to.** Kittens ships
  **exactly one craft whose output is a base resource: `wood ← catnip`.** A census of its whole
  craft list returns that one and only that one. **RR's transmute is that craft.**

**What bounds the source's loops is a universal per-trade tax in resources the cycle does not
produce.** `js/diplomacy.js:10–11` — `baseGoldCost: 15`, `baseManpowerCost: 50` — deducted at
`:885–886` **flat**, while only the race's `buys` resource scales with `getTradeVolume()` and only
the *yield* scales with `tradeRatio`. Gold and manpower come from outside every resource cycle, so
no cycle can pay for its own trades.

**RR already has the identical guard and nobody costed it.** Both legs charge `vigor 175` and
`gold 45–68`; the cycle yields steel, mana and timber and **no gold and no vigor**. So the loop is
throughput-limited by gold and vigor income, exactly as the source's are.

**The correction that follows:** *G > 1* means **timber stops being a constraint** — and timber is
a capped resource, so it sits at its ceiling. It does **not** mean unbounded resources. The report
should not have called it that, and `TRADE_YIELD_LIMIT` should not have been justified by it.

### 1.2 What to ship

1. **Measure the guard before touching anything.** Report, at every milestone: gold income, vigor
   income, and **the maximum sustainable trade rate each allows**. That is the real bound and it
   has never been quoted.
2. **If the guard binds — and I predict it does — remove `TRADE_YIELD_LIMIT` and ship the source's
   uncapped additive form**, which is what dev note 8 asked for and what v0.61 deviated from. The
   deviation was reasoned from a loop the source also has.
3. **If it does not bind, the fix belongs to the tax, not to the yield ceiling.** Raise the per-
   trade gold or vigor until it does. That is the source's own lever and it leaves the yield
   category uncapped.
4. **Keep `test-v41`'s loop-gain assertion** and re-point it: it should assert **G against the
   gold-and-vigor-limited trade rate**, not against yield alone. A loop gain above 1 in a
   *capped* resource whose trades cost an *uncapped* one is not the same defect.

**Pass conditions:** the three legs and the two taxes reported at every milestone with the
sustainable trade rate; `TRADE_YIELD_LIMIT` removed **or** its retention justified by a measured
non-binding guard; `test-v41` re-pointed onto the tax-limited rate; timber time-at-cap reported.

---

## Part 2 — The `BOOST_LIMIT` knee audit: which bites next (builder note 2)

**Nobody had run this and the answer is that two families are throwing most of their stack away.**
`limitedDR(x, L)` is linear only below **0.75·L** (`index.html:3838–3844`). Measured by
instrumenting `limitedDR` through one `computeRates()` on a fully maxed state:

| family | L | knee | **raw Σ** | delivered | **% of knee** | thrown away |
|---|---|---|---|---|---|---|
| **vigor** | 1.0 | 0.750 | **5.571** | 0.988 | **743%** | **82%** |
| **devotion** | 2.0 | 1.500 | **5.024** | 1.938 | **335%** | **61%** |
| **mana** | 1.0 | 0.750 | 1.465 | 0.935 | 195% | 36% |
| provisions | 1.5 | 1.125 | 1.300 | 1.244 | 116% | 4% |
| **crystals** | 2.0 | 1.500 | **1.494** | 1.494 | **99.6%** | 0% |
| gold | 1.5 | 1.125 | 1.031 | 1.031 | 92% | 0% |
| culture | 2.0 | 1.500 | 0.387 | 0.387 | 26% | 0% |

**Which bites next: crystals, and it is 0.006 away.** Σ1.494 against a knee of 1.500 — **the next
crystal boost of any size, however small, is the first one that will not be delivered in full.**
Gold is second at 92%.

**And two families are already past the point of absurdity.** **Vigor carries a raw Σ of 5.571
into a cap of 1.0 and delivers 0.988 — 82% of every vigor boost in the game is discarded**, so a
player who buys a +25% vigor upgrade receives roughly +0.4%. Devotion discards 61%. **This is the
same class as v0.61 §7.1's mana finding, three times worse, and in a family nobody was looking
at.**

**Ship the diagnosis, not a re-balance.** Every one of these is a `BOOST_LIMIT` chosen long ago
against a stack that has since grown past it. **Raising a cap is a large production change and §16
makes it Jerry's.** What ships:

1. **A permanent knee readout** — raw Σ, delivered, cap and % of knee for all seven families, at
   every milestone, next to `convMultBreakdown()`. **The same instrument that made the converter
   stack legible.**
2. **Every advertised effect string reads its delivered value, not its raw one.** v0.61 fixed this
   for `petriciteResonators` alone. **A vigor upgrade advertising +25% while paying +0.4% is the
   same defect at 60× the error.** This is the part that matters to a player and it ships now.
3. **A ledger row per family** recording raw Σ, cap and loss, so the next round that adds a boost
   can see what it will actually deliver.

**Pass conditions:** the knee readout ships and prints all seven families at every milestone; every
boost-granting effect string asserted to match its **delivered** contribution within 0.001; the
crystals family asserted at **Σ ≥ 1.49 against knee 1.50**, so the next addition trips a test
rather than a player; **no `BOOST_LIMIT` value changed.**

---

## Part 3 — Barn, Warehouse and Harbor against the source (dev note 9)

**Jerry's reading of the source is exactly right, and RR's Storehouse is already a faithful port —
it is the Warehouse that inverts the relationship.** Kittens, per copy
(`js/buildings.js:758–940`):

| | barn | warehouse | **warehouse ÷ barn** |
|---|---|---|---|
| catnip | 5,000 | 0 | — |
| wood | 200 | 150 | **0.75** |
| minerals | 250 | 200 | **0.80** |
| coal | 60 | 30 | **0.50** |
| iron | 50 | 25 | **0.50** |
| gold | 10 | 5 | **0.50** |
| titanium | 2 | 10 | 5.00 — the one metal the warehouse wins |

**Kittens' warehouse is smaller than its barn on every shared material.** And the price shape is
Jerry's own argument: the barn costs raw `wood 50`; the warehouse costs crafted `beam 1.5 + slab
2`, so you build more of them and each does less.

**RR today** (`index.html`):

| | RR Storehouse (`timber 50`) | RR Warehouse (`beam 2 + stoneSlab 3`) | ratio |
|---|---|---|---|
| provisions | **5,000** ✓ matches barn | 0 ✓ | — |
| timber | **200** ✓ matches barn | **400** | **2.00 ✗** |
| ore | **250** ✓ matches barn | **300** | **1.20 ✗** |
| gold | **10** ✓ matches barn | **80** | **8.00 ✗** |
| steel | — | 100 | — |

**The Storehouse copies Kittens' barn value for value** — 5,000 / 200 / 250 / 10 against catnip
5,000 / wood 200 / minerals 250 / gold 10. **That is exact parity and it should not move.** The
Warehouse is where the inversion lives.

**Ship the source's ratios applied to RR's own Storehouse figures:**

| | now | **ship** | from |
|---|---|---|---|
| timber | 400 | **150** | 0.75 × 200, Kittens' wood ratio |
| ore | 300 | **200** | 0.80 × 250, Kittens' minerals ratio |
| gold | 80 | **5** | 0.50 × 10, Kittens' gold ratio |
| steel | 100 | **keep 100** | RR-original; steel has no Storehouse figure to take a ratio from, and Kittens' warehouse *wins* on the late metal (titanium ×5.00). **Steel is RR's late metal — the Warehouse keeping it is the source's own shape.** |

**And the Harbor is mostly faithful with two outliers.** RR's `provisions 2,500 / timber 700 /
steel 150` match Kittens' harbor `catnip 2,500 / wood 700 / iron 150` exactly. **`ore 500` against
the source's `minerals 950` is low, and `gold 200` against the source's `gold 25` is 8× high** —
the same gold inflation as the Warehouse. Ship **ore 950** and **gold 25**.

**Predict before running:** this is a **large storage cut** at any settlement holding many
Warehouses, and timber and gold ceilings will fall materially. **Report every material's ceiling
at every milestone before and after, and time-at-cap for timber, ore and gold.** If timber's
ceiling falls far enough to bind the trade cycle, that is Part 1's guard tightening as a side
effect and it should be reported as such, not celebrated.

**Pass conditions:** the Storehouse **unchanged** and asserted equal to Kittens' barn value for
value; the Warehouse at 150 / 200 / 5 with the source ratio cited per line; the Harbor at ore 950
/ gold 25; steel's retention argued in the ledger; ceilings and time-at-cap reported before and
after.

---

## Part 4 — Four balance notes (dev notes 1, 2, 3, 10)

### 4.1 Shrines and the Altar of the Dawn (dev note 1)

**There is already a cap and Jerry's worst case cannot happen** — `index.html:5424`:

```js
shrine = limitedDR(count("shrine") * (0.5 + 0.1 * (S.altarTier || 0)), MORALE_SHRINE_LIMIT);
```

`MORALE_SHRINE_LIMIT = 25`, so the shrine term asymptotes at **+25 morale** however many Shrines
are built. **Morale cannot be ignored by building Shrines.**

**But the knee is generous and that is the real answer to the note.** Linear below 0.75 × 25 =
**18.75**, so at `altarTier 0` the first **37 Shrines pay in full**, and each Altar tier raises the
per-Shrine rate by 0.1, so at tier 5 only **18 Shrines** reach the same place. **Measure before
changing the rate:** report the shrine term, the Altar tier and **the shrine share of total
morale** at every milestone. Morale sat at **100% in band on all three seeds** at v0.61, which is
consistent with morale being trivially satisfied.

**Jerry's fallback — 0.5 → 0.25 — is conditional on that measurement and should stay conditional.**
Ship it only if the shrine term exceeds **half of total morale** at any milestone; otherwise report
the share and leave the rate. **State which branch was taken.**

### 4.2 Remove the fourth mana multiplier (dev note 2)

**Delete `petriciteResonators`**, shipped last round on `petricite`. `boosts.mana` returns to
**Σ 0.75** across three members — which is **exactly the knee** (0.75 × `BOOST_LIMIT.mana` 1.0),
so all three deliver in full again and v0.61 §7.1's half-paid rung disappears with it.

**This is a straight reversal of Jerry's own previous note and both should be cited**, as v0.61
cited the one before. §30 applies: **`petriciteResonators` is a reserved id until v1.0** and a save
holding it is refunded its cost rather than silently losing it.

**Note the interaction Part 2 makes visible:** at Σ0.75 mana sits **exactly on its knee**, so mana
joins crystals as a family where the next addition is the first one that will not pay in full.
**Record it in the knee readout.**

### 4.3 The Festival's provisions cost (dev note 3)

`festivalCost()` returns `provisions: round(60 × max(1, S.pop))` — **12,000 at pop 200.**

**It has the same defect Part 6.3 found in the trade provisions cost last round, and this is the
second instance of one bug shape.** The cost scales with **population**, which plateaus near 200;
the provisions **ceiling** grows from 79,500 at Sparks to 900,338 at Icathia — **×11.3.** So the
festival costs 15% of the ceiling at Sparks and **1.3% at Icathia**: it stops being a cost exactly
when the player can hold the most.

**Ship a cost denominated in the ceiling, not in population** — the constraint Jerry describes is
"a hefty amount of provisions", and a hefty amount is a *fraction of what you can hold*:

```
provisions = round(FESTIVAL_PROVISION_PCT * computeCaps().provisions)
```

**`FESTIVAL_PROVISION_PCT = 0.15`** reproduces the current cost at Sparks (15% of 79,500 ≈ 11,900
against today's 12,000 — the same number by construction) **and holds that bite for the rest of the
run** instead of decaying to a rounding error.

**Pass conditions:** the cost is a fraction of the ceiling; the Sparks figure lands within 5% of
today's; the cost and its share of the ceiling reported at all four milestones; provisions
time-at-cap reported.

### 4.4 Marus Omegnum (dev note 10)

`{ prod: { devotion: 0.05 }, caps: { devotion: 500 } }` at `cost: { gold 800, ore 400, steel 60,
crystals 40, culture 150 }`.

**Cap 500 → 200, as directed.** For the production cut the note says "reduce" without a figure, so
take one from the source rather than inventing it: **Kittens' Temple is `faithPerTickBase 0.0015`
= 0.0075/s**, and RR's Shrine is at that figure exactly (v0.47 Part 2). Marus at **0.05/s is 6.7×
one Shrine**. RR's own faith curve runs Shrine → Chapel → Sanctum → Marus, so a top tier at **×4 a
Shrine = 0.03/s** keeps the ladder's shape and is a 40% cut.

**Report the Convergence effect.** Marus feeds devotion, devotion feeds worship through the Ascent,
worship feeds `catReligion` — so this cut reaches the global multiplier. **Convergence at its
unlock must stay inside its band**; if it falls below the 1% floor the cut has gone too far and the
cap change should ship without the rate change.

**Pass conditions:** cap 200; rate 0.03/s with the Shrine-multiple argument in the ledger;
Convergence at unlock reported and inside band; devotion time-at-cap before and after.

---

## Part 5 — Four camp and trade notes (dev notes 4, 5, 7, 8)

### 5.1 Shaco's partial refund on bulk hunts (dev note 4)

`runExpeditionBulk(id, times)` takes **one** `snapshotUndo` for the whole batch, and the refund
roll lives in the single-hunt path at `index.html:7528`:
`if (leaderIs("shaco") && e.cost.vigor && Math.random() < SHACO_REFUND_CHANCE) gain("vigor", e.cost.vigor)`.

**Verify before building: if the bulk path calls the single-hunt resolution `n` times, each roll is
already independent and a ×5 hunt already refunds 0–5 fifths — the note is already satisfied.** If
instead it resolves once and multiplies, it is not. **Grep the loop and state which**; the note asks
for a distribution that one shape already gives and the other cannot.

**If it needs building:** roll `SHACO_REFUND_CHANCE` **per hunt in the batch** and refund the sum,
so the outcome is `Binomial(n, 0.20) / n` of the batch cost — exactly the 1/5 … 5/5 spread Jerry
describes. **Assert the distribution over many trials, not a single roll.**

### 5.2 Noxus (dev note 5)

`cost: { plumes: 120, vigor: 175, gold: 68 }` → **`plumes: 100`**. Report `firstTrade` and trades
per game-year on the Noxus route; plumes are a luxury and a hunt yield, so this loosens a limiter
on both.

### 5.3 The Rift Scuttler only on a charge run (dev note 7)

`index.html:4041` — the Raptor camp spawns it on `rerollHit("hunt") < 0.3` with **no charge test**.
`empowered` is already computed in the expedition path and Part 5 of v0.59 made it the renown
multiplier, so the property exists. **Gate the spawn on `empowered`.**

**Keep the 0.3 probability**: gating it already cuts the spawn rate to the charge cadence, and
changing both at once makes the measurement unreadable. **Report Scuttler spawns per game-year
before and after**; the Scuttler pays knowledge and vigor as a percentage of cap, so this reaches
two economies.

### 5.4 Gromp pays honeyflower on a charge run (dev note 8)

`index.html:4029` — `if (rerollHit("hunt") < 0.05 && S.techs.abyss) { gain("poros", 1); }`, and the
camp's description advertises *"rare stray poro"* (`:4023`). **Replace the poro with honeyflower and
gate it on `empowered`**, mirroring 5.3 so both charge camps read the same way.

**Update the description string in the same edit** — it is generated at `:3775` and a stale
description is how v0.59's tooltip and payout came to disagree. **Assert the string names what the
code pays.**

---

## Part 6 — Five presentation notes (dev notes 6, 11, 12, and the two Crest banners)

### 6.1 The morale tooltip (dev note 6)

`index.html:8059` ends with *"Poros and True Ice are Freljord materials, and pay no morale."*
**Cut the sentence.** It documents a v0.40 change to a reader who never saw the old behaviour —
the same class as v0.59.1's Tome description, and that note's ruling was *flavour only; what a
thing is FOR is stated by the things that ask for it.* The first sentence, *"Morale multiplies all
worker output"*, is the part that tells a player anything.

### 6.2 The Festival tooltip lists renown (dev note 11)

`index.html:8925` builds the festival tooltip's `effects` array with morale, gold and the
one-at-a-time rule — **and not the 25 renown v0.61 added.** **Add it, reading the constant**, as
v0.61's trade tooltip does. **A payout shipped without its tooltip is exactly what dev note 1 was
about two rounds running.**

### 6.3 Mount Targon's banner — CORRECTED (dev note 12, re-scoped)

**My first reading of this note was wrong and Jerry has corrected it. The crescent stays.**

There are **two** pale objects in this scene and the spec conflated them:

| what | where | disposition |
|---|---|---|
| the **crescent moon**, off to the right at `(212, 26)` radius 11, clear of the silhouette | `index.html:9898–9906`, added at v0.58.1 note 37 on Jerry's own instruction | **KEEP — do not touch it** |
| an **8 × 4 filled rectangle** sitting directly above the summit, drawn in `PAL.text` | `index.html:9913` — `px(cx - 4, groundY - 28, 8, 4, PAL.text)` | **REMOVE — this is the "square moon"** |

**That one line is the whole of the complaint.** It is a flat rectangle at this resolution, which
is exactly why it reads as a square moon rather than as the peak's own light the old comment
claimed it was.

**Ship:**

1. **Delete `px(cx - 4, groundY - 28, 8, 4, PAL.text)` at `index.html:9913`.** Nothing else in the block moves.
2. **Keep `drawCrescent(212, 26, 11)` exactly as it is**, and **leave the v0.58.1 note 37 comment
   in place** — it is still the live reason the crescent exists.
3. **Draw the golden halo around the peak** in the square's place: a ring centred on the summit,
   drawn as pixels the way the crescent is (two discs, the inner one in the sky colour biting the
   ring out of the outer), with a slight shine cycling off the same `f` counter the stars use.
4. **Mind the light shaft.** `px(cx - 2, 0, 4, groundY - 28, PAL.goldBright)` (`:9915`) already pulses on
   `0.3 + 0.3·|sin(f·0.3)|` and rises from the summit through where the square was. **The halo
   must read with that beam, not fight it** — offset its shine phase, or the two will strobe
   together and look like a fault.

**Pass conditions:** the 8×4 `PAL.text` rectangle is gone; `drawCrescent(212, 26, 11)` is
**asserted unchanged**, including its position and radius; a halo is drawn centred on the summit
and animates off the existing frame counter; the light shaft still renders and its phase is
distinct from the halo's; **both the v0.58.1 note and this correction are cited at the site**, so
no future round restores the square or removes the crescent.

### 6.4 Crest of Cinders changes the workshop banner (new)

`SCENES.crafting` (`index.html:9821–9841`) draws the forge procedurally: a pulsing gold forge bed,
a three-tier **anvil** (`px(cx-9, groundY-8, 18, 4)`, `px(cx-4, groundY-11, 8, 3)`,
`px(cx-2, groundY-14, 4, 3)`), and a **hammer** on a six-frame swing
(`px(cx+6, groundY+hy, 3, 11)` handle, `px(cx+3, groundY+hy-4, 9, 5)` head) that throws sparks on
`phase === 3`.

**When `simNow() < S.cinderUntil`, give the anvil and hammer a faint red glow.** The buff flag is
already read this way elsewhere (`index.html:5689`, `var cinderUp = simNow() < S.cinderUntil`), so
use the same expression rather than a second source of truth.

- **Faint means faint.** A soft red halo behind those five rectangles, alpha well under the forge
  bed's own `0.5 + 0.35·|sin|` — the forge is the bright thing in this scene and the crest should
  tint it, not outshine it.
- **Drive it off `f`**, like everything else on this canvas, and **do not sync it to the hammer's
  six-frame cycle** — a glow that pulses exactly with the swing reads as part of the animation
  rather than as a state.
- **The scene must be correct on the frame the buff expires.** `draw()` runs on a 220 ms interval
  and reads state fresh each frame, so this needs no invalidation — **assert it by expiring the
  crest and re-reading the canvas**, not by grepping for the branch.

### 6.5 Crest of Insight changes the lore banner (new)

`SCENES.lore` (`index.html:9794–9820`) draws a teal/purple halo behind the crystal ball and five
rising motes. **The bookshelves and lamps are sprites**, drawn by `drawLoreSprites()`
(`index.html:9626`) on the separate `#scene-sprites` canvas at
`leftX = 0.20·w − sw/2` and `rightX = 0.80·w − sw/2`, with a lamp just outside each shelf.

**When `simNow() < S.insightUntil`, float small blue lights around the bookshelves and the lamps.**

- **Take the positions from the sprite function's own geometry** — the same `leftX` / `rightX` /
  `shelfY` expressions — rather than hard-coding coordinates. The shelves are placed as a fraction
  of width and will move if the canvas resizes; a second set of literals would drift.
- **Blue, and distinct from what is already there.** The existing motes alternate `PAL.teal` and
  `PAL.goldBright`; the crest's lights should be a colder blue so a player can tell the buff from
  the ambient animation at a glance.
- **Decide the layer deliberately and say which.** The procedural scene draws on `ctx` and the
  shelves on `spriteCtx` above it, so lights drawn in `SCENES.lore` sit **behind** the shelves.
  "Floating around" reads better with some in front — **if they should be in front, they belong in
  `drawLoreSprites()`**, and the report should state the choice rather than let the layering be
  incidental.
- **Same expiry property as 6.4**, asserted the same way.

**Pass conditions for 6.4 and 6.5:** both read their buff from the same `simNow() < S.xUntil`
expression the rest of the file uses; both are asserted by **holding the buff, reading the canvas,
expiring it and reading again** — not by grepping for the code, which is precisely how the festival
chip passed for two rounds while never firing (v0.61 §3); the lore lights derive their positions
from the sprite geometry; the chosen layer is stated; neither glow is synced to an existing
animation cycle.

---

## Part 6a — Jarvan reaches every job, at half the rate (new)

**Two changes, and the first is a coverage fix rather than a nerf.**

### 6a.1 The leader bonus applies to all eight jobs

`villageMult` (`index.html:5795`) carries `JARVAN_VILLAGE_LEAD = 0.12` — and the job table it
feeds reaches **three of the eight assignable jobs**:

```js
var jobMult = {
  farmer:     hoeMult() * villageMult,
  woodcutter: axeMult() * villageMult,
  miner:      villageMult,
  arcanist:   1 + (S.upgrades.arcaneFocus ? 0.50 : 0),
  tinkerer:   S.upgrades.facetedCuts ? 1.25 : 1,
  loremaster: 1
};
```

**`loremaster`, `arcanist`, `tinkerer` get nothing from it, and `jungler` and `acolyte` are not in
the table at all.** A settlement running a knowledge or devotion economy gets no value from
Demacia's Standard whatsoever, which is not what "every worker in the village produces 12% more"
says.

**Ship: `JARVAN_VILLAGE_LEAD 0.12 → 0.06`, applied to all eight jobs.**

**Predict the sign before running, because it is not obvious.** The bot's shares put roughly half
the workforce in farmer/woodcutter/miner, so the weighted effect is about `0.12 × 0.55 ≈ 0.066`
today against `0.06 × 1.00 = 0.06` after — **roughly neutral in total output and materially
different in shape.** Jarvan stops being a food-and-timber leader and becomes a flat settlement
leader, which is what his lead text has always claimed.

**Leave the building clause alone.** `villageMult` also multiplies `b.group === "Village"`
production (`:5579`). The note is about jobs a wanderer can hold; **the building term is a separate
effect and halving it was not asked for.** Say so in the report rather than letting it ride on the
same constant — if one constant now drives two scopes, split it.

### 6a.2 The passive starts at 15%, not 25%

`index.html:1528` — `passive: { key: "xp", base: 25, desc: "Demacian Command: wanderers earn
experience 25% faster" }` → **`base: 15`**.

**The description string carries a hard-coded 25 and must be generated from the constant**, not
edited alongside it. This project has now had three separate defects from a literal drifting away
from the number it describes — v0.59's renown tooltips, v0.61's `petriciteResonators`, and the
festival chip. **A second literal is a third one waiting.**

**And Part 2's knee audit reaches this.** `champPassive("xp")` feeds
`XP_PER_SECOND * (1 + champPassive("xp") / 100)` (`:6461`), which is **not** a `BOOST_LIMIT`
family, so it is delivered in full — but v0.61 §9.3 measured Jarvan at level 10 delivering
**×1.97**, against Kittens' 20-Academy `skillXP` line at **×2.00**. **At base 15 that becomes
≈×1.58**, so the 2%-coincidence parity row from v0.61 stops being true. **Re-rate that ledger row
in the same round the constant moves** — this is the §2.1-of-v0.59.1 rule, and it has already
caught this project once.

**Pass conditions:** `JARVAN_VILLAGE_LEAD = 0.06` reaching **all eight** jobs, asserted job by job
from the `JOBS` list rather than by naming three; the building clause's scope stated and
unchanged; `base: 15` with the description **generated**, asserted to match the constant; the
Jarvan-vs-Academy ledger row re-rated with the new ×1.58 figure; population, morale band and
Era 3 reported, since the lead now touches every job.

---

## Part 7 — Part 10's sink is two orders of magnitude short (builder note 4)

**v0.61 measured the result honestly and the number is the finding: crystals at cap fell 96.2% →
94.7%, 1.5 points.** The decomposition says why — Refineries deliver **33.4 crystals/s** at
Icathia against a research spend of a few hundred crystals, **about twenty times across 2,500
game-years.**

**Arithmetic, stated before any change.** 33.4/s over 2,500 game-years at 800 s a year is
**66.8 million crystals produced**. Twenty purchases averaging ~700 is **14,000 spent — 0.02% of
production.** A sink at 0.02% of a faucet cannot move a stock off its ceiling and no rung-scaled
research price ever will.

**So the research sink is the right shape and the wrong instrument for this job, and the honest
conclusion is that crystals need a CONTINUOUS sink sized against 33.4/s** — which is what
`MANUFACTORY_FUEL` was always trying to be and failed at because **15 Manufactories drain 2.56/s
against 36.97/s gross, 6.9%** (v0.61 §9.8).

**Do not raise `MANUFACTORY_FUEL` a fourth time.** Three rounds have. **Size the sink against the
faucet instead**, and the source gives the shape: Kittens' `calciner` burns
`oilPerTickCon: -0.024` per copy against an `oilWell`'s `oilPerTickBase: 0.02` — **a primary sink
burns 1.2× what a primary faucet makes, per copy.** RR's Refinery makes 0.02 crystals/s per copy
before multipliers; **the Manufactory's per-copy burn should be ~0.024 on the same footing** — and
the reason today's 0.12 is still nothing is that **the Refinery's output is multiplied ×92 and the
Manufactory's burn is not.**

**That is the real fix and it is Part 1's asymmetry again: put the burn on the same multiplier
footing as the yield.** A burn of `0.024 × convMult × (1 + boosts.crystals)` tracks the faucet at
every point on the curve instead of at one.

**Pass conditions:** crystal production and drain reported per milestone with the drain as a share
of gross; the burn expressed on the same footing as the yield with the 1.2× anchor cited;
**crystals time-at-cap below 70% on at least one seed, or the failure reported with the measured
share**; the research costs from Part 10 **unchanged** — they are a good lumpy sink and a bad
primary one.

---

## Part 8 — §31, and it wants the round to itself (builder note 6)

**§31 is Jerry's open question and this spec does not answer it.** The measurement is recorded:
grouping RR's eleven multiplicative factors into four source-shaped categories cuts the product
~41%; collapsing to one cuts it ~80%.

**One correction the analyzer owes before Jerry rules, because it was mine.** The claim that RR's
combined stack is "×9.3 the source's" compared **RR's whole stack against ONE Kittens category** —
the same conflation this project has now caught three times. **Kittens' full production chain
(`game.js:3390–3540`) has roughly fourteen multiplicative steps**, not four: season, `GlobalRatio`,
`Ratio`, `RatioReligion`, `SuperRatio`, the steamworks hack, paragon, pollution, magnetos,
reactors, the Solar Revolution faith bonus, cosmic radiation, festival cycles and necrocracy.
**RR has about eleven. RR is not architecturally out of line with the source — it is slightly
under.**

**Ship the correction into §31 and nothing else.** The four-category proposal rests on a premise
that does not survive the full read, and Jerry should rule on a corrected §31 rather than the one
now written.

**Pass conditions:** §31 amended with the fourteen-step chain and the retraction; **no category
collapsed**; a ledger row recording RR's eleven against the source's fourteen.

---

## Part 9 — The remaining 25 UNVERIFIED rows (builder note 5)

**All 25 are RETRIEVABLE and each names an identifier**, so each is a grep against a clone that is
already on disk. RR-ORIGINAL + UNVERIFIED is zero and the generator aborts on it.

**Retrieve them. This is the round that can finish the ledger**, and it is the last block of parity
work that can be discharged mechanically rather than argued.

**Predict before the pass: 18 PARITY, 5 EASIER, 2 HARDER.** The prediction is worth making because
v0.60's RETRIEVABLE count was right to the row and v0.61's split was not — scoring both teaches
which kind of estimate this project can trust.

**Pass conditions:** UNVERIFIED reaches **0**, or every survivor carries the query tried and the
reason it failed; the split scored against the prediction; the generator aborts on any UNVERIFIED
row lacking a recorded retrieval attempt.

---

## Part 10 — Decompose the spread collapse (builder note 3)

**The spread went ×1.92 → ×1.30, the largest single-round narrowing recorded, and nobody targeted
it.** v0.61 §9.6 offers an inference — the renown re-levelling removed the Abyss outlier, a bursty
charge-multiplied high-variance source, and replaced every camp's payout with one rate — and says
plainly that it is an inference.

**v0.60 Part 4 built the apparatus for exactly this and it was not re-run.** Use it: four
seed-matched slices at 1,400 years, same three seeds.

| slice | intervention | isolates |
|---|---|---|
| A | v0.61 as shipped | the ×1.30 baseline |
| B | A with the pre-v0.61 renown table restored | the renown re-levelling |
| C | A with `TRADE_YIELD_LIMIT` removed | the trade change |
| D | B + C | the residual |

**Learn v0.60's lesson: a control arm that moves the mean cannot isolate anything.** That round's
C slice withheld champions until y400 and pushed Sparks from ~200 to ~490, making Era 3
unscoreable. **Both interventions here are magnitude changes at the same milestones, so the mean
should hold — verify that it does before reading the spread, and report Sparks for every slice as
the check.**

**Predict: B recovers most of the spread.** If restoring the old renown table returns the spread to
~×1.9, the inference is confirmed and the champion channel is settled as the dominant variance term
for good. **If B does not recover it, the collapse came from somewhere nobody has named** — and
that is a bigger finding than the collapse.

**Pass conditions:** four slices, three seeds, same seeds; Sparks reported per slice as the
mean-stability check; the variance attributed or the residual named as an open question; the
prediction scored.

---

## Part 11 — Order, discipline, pass conditions

### Order

1. **Part 2's readout and effect strings.** An instrument, and the strings are a player-facing
   correctness bug.
2. **Part 4.2** — delete the fourth mana rung. One line, and it returns mana to its knee.
3. **Parts 3, 4.3, 4.4, 5** — the storage re-basing and the balance and camp notes. **Part 3 is the
   largest and wants its own measurement.**
4. **Part 7** — the crystal sink on the right footing. **The round's second-largest number.**
5. **Part 1** — the trade guard measurement, and the ceiling decision that follows it.
6. **Part 10** — the spread decomposition. **Long pole; it needs the ensemble.**
7. **Part 6a** — Jarvan. One constant and one coverage fix, but it touches every job, so it wants
   a clean slice rather than riding along with Part 3's storage change.
8. **Parts 6, 8, 9** — the five presentation notes, the §31 correction, the ledger finish. No game
   numbers move.

### Operational

Median and spread for every milestone claim (§25). `--years N --seeds 3`. Classify with §24 before
sizing any ceiling. Strip comments before grepping. **Clone Kittens; pin `c52985b`.** `nproc` is 2
— give the ensemble the box. Push via the token-remote recipe and scrub the token.

### Round pass conditions

| # | Condition | Target |
|---|---|---|
| 1 | Trade guard | gold and vigor income and the sustainable trade rate, every milestone |
| 2 | `TRADE_YIELD_LIMIT` | removed, **or** retention justified by a measured binding guard |
| 3 | `test-v41` | re-pointed onto the tax-limited rate |
| 4 | Knee readout | all seven families — raw Σ, delivered, cap, % of knee — every milestone |
| 5 | Effect strings | every boost string matches its **delivered** value within 0.001 |
| 6 | Crystals family | asserted **Σ ≥ 1.49 against knee 1.50**; no `BOOST_LIMIT` changed |
| 7 | Storehouse | **unchanged**, asserted equal to Kittens' barn value for value |
| 8 | Warehouse | 150 / 200 / 5, each citing its source ratio; steel argued |
| 9 | Harbor | ore 950, gold 25 |
| 10 | Ceilings | every material, before and after; time-at-cap for timber, ore, gold |
| 11 | Shrine morale | share of total morale reported; the 0.25 branch taken **only** if it exceeds half |
| 12 | `petriciteResonators` | deleted; `boosts.mana` **Σ 0.75 exactly**; id reserved; save refunded |
| 13 | Festival cost | a fraction of the ceiling; Sparks within 5% of today; share reported at four milestones |
| 14 | Marus | cap 200, rate 0.03/s; **Convergence at unlock inside band** |
| 15 | Shaco | the bulk path stated; distribution asserted over many trials |
| 16 | Noxus | plumes 100; `firstTrade` reported |
| 17 | Scuttler, Gromp | both gated on `empowered`; descriptions match payouts; spawns/year before and after |
| 18 | Tooltips | morale sentence cut; festival lists renown from the constant |
| 19 | Targon banner | the 8×4 `PAL.text` square gone; **`drawCrescent(212, 26, 11)` asserted UNCHANGED**; halo animated off `f`; phase distinct from the light shaft; both notes cited |
| 19a | Crest banners | Cinders → red glow on anvil and hammer; Insight → blue lights from the sprite geometry; **both asserted by holding, reading, expiring and re-reading the canvas**, never by grep; layer choice stated |
| 19b | Jarvan | `JARVAN_VILLAGE_LEAD 0.06` on **all eight** jobs, asserted from `JOBS`; building clause scope stated; `base: 15` with a **generated** description; the Academy ledger row re-rated to ×1.58 |
| 20 | Crystal sink | burn on the same footing as the yield, 1.2× anchor cited; **time-at-cap < 70% on a seed, or the failure reported** |
| 21 | §31 | amended with the fourteen-step chain and the retraction; **nothing collapsed** |
| 22 | UNVERIFIED | **0**, or every survivor carries its failed query; split scored |
| 23 | Spread | four slices, seed-matched; Sparks as the mean check; prediction scored |
| 24 | Unchanged | `capFamilyOf()` two families · audits 0/0 · Σ 4.35/1.80 · `CONSUMPTION` 4.25 · ratio 1.17647 · `XP_PER_SECOND` 0.05 · the rank ladder |
| 25 | Every Part | actioned, or its non-action explicitly justified |

### Predicted vs measured — medians of three, with spreads

| slice | Era 3 median | spread | note |
|---|---|---|---|
| v0.61 baseline | **1,210.7** | ×1.30 | the report's figure; **my ensemble had not finished at hand-off** |
| s1: knee readout + effect strings | **0.0** | unchanged | instrument and text |
| s2: mana rung deleted | **+5 to +25** | unchanged | Σ1.00 → Σ0.75 restores full delivery but removes a member; net small |
| s3: storage re-based | **+40 to +140** | may widen | **the round's largest single term** — timber, ore and gold ceilings all fall |
| s4: festival + Marus + camps | **+10 to +60** | | a real provisions cost late, and a devotion cut reaching `catReligion` |
| s4a: Jarvan | **−10 to +20** | | roughly neutral in total output by construction; the shape change is the point, not the level |
| s5: crystal sink on the yield's footing | **+30 to +120** | | the first crystal change with the faucet's own scaling |
| s6: trade ceiling decision | **−60 to +20** | | sign depends on whether the guard binds |
| **shipped** | **1,250–1,500** | **report against ×1.30** | |

**The spread is the figure to watch, not the median.** It collapsed last round without anyone
targeting it, and **Part 3 is the kind of change that could reverse that** — a storage cut binds
the fastest seeds hardest, which is the same mechanism v0.60 found when removing the Manufactory's
drag *widened* Era 3. **If the spread re-opens past ×1.6, report it against Part 10's decomposition
rather than treating it as noise.**

**And one prediction I expect to be wrong.** I predict Part 1's guard binds and
`TRADE_YIELD_LIMIT` can go. **If gold and vigor income turn out to support hundreds of trades a
game-year, the guard does not bind, the source's uncapped form genuinely is unsafe in RR, and
v0.61's ceiling was right for a reason its report did not give.** Either way the measurement is
the deliverable.

---

## Sources, all read this session

**Line numbers pinned to `nuclear-unicorn/kittensgame` at `c52985b` (2026-08-04), cloned to disk.**

**Kittens:** `js/diplomacy.js:10–11` — `baseGoldCost: 15`, `baseManpowerCost: 50`; `:883–887` —
both deducted **flat** while only `buys` scales with `getTradeVolume()`; `:744–747` and `:250` —
the additive uncapped `tradeRatio`; the race table — `lizards` buy minerals sell wood, `sharks` buy
iron sell catnip, `nagas` sell minerals, `griffins` sell iron, **the source's own trade cycles**;
`js/workshop.js` crafts — a full census returning **exactly one craft whose output is a base
resource, `wood ← catnip`**, RR's transmute counterpart; `js/buildings.js:758–800` — the barn's
`catnip 5000 / wood 200 / minerals 250 / coal 60 / iron 50 / titanium 2 / gold 10`; `:791–830` —
the warehouse's `wood 150 / minerals 200 / coal 30 / iron 25 / titanium 10 / gold 5`; `:905–940` —
the harbor's `catnip 2500 / wood 700 / minerals 950 / coal 100 / iron 150 / titanium 50 / gold 25`;
`js/buildings.js` — `calciner` `oilPerTickCon: -0.024` against `oilWell` `oilPerTickBase: 0.02`,
the 1.2× sink anchor; `game.js:3390–3540` — the **fourteen-step** production chain that corrects
§31's premise.

**RR**, at the v0.61 tag: `index.html:4276–4294` and `:4328–4346` — the Demacia and Piltover legs
with their `vigor 175` and `gold 45–68`; `:6838` and `:6769` — `transmuteYield()` and
`TRANSMUTE_COST 20`; `:3838–3844` — `limitedDR`'s 0.75·L knee; `:2627` — `BOOST_LIMIT`; `:5814` — the
family loop; `:5424` and `:5365` — the shrine morale term and `MORALE_SHRINE_LIMIT 25`; `:5272` —
`festivalCost()`'s `60 × pop`; `:1189` — Marus `prod 0.05 / caps 500`; `:7528` and `:1617` —
Shaco's refund and `SHACO_REFUND_CHANCE 0.20`; `:7411` — `runExpeditionBulk`; `:4352` — Noxus
`plumes 120`; `:4041` — the Scuttler spawn with no charge test; `:4029` and `:4023` — Gromp's
stray poro and its description; `:8059` — the morale tooltip sentence; `:8925` — the festival
tooltip's effects array; `:9898–9906` — the pixel crescent, **kept**; `:9913` — the 8×4 `PAL.text` square above the summit, **the object dev note 12 is actually about**; `:9915` — the pulsing light shaft; `:9821–9841` — the crafting scene's anvil and hammer; `:9794–9820` and `:9626–9652` — the lore scene and `drawLoreSprites()`'s shelf and lamp geometry; `:5795` and `:1618` — `villageMult` reaching three of eight jobs and `JARVAN_VILLAGE_LEAD 0.12`; `:1528` — Jarvan's `base: 25` and its hard-coded description; `:6678–6688`
— the Aurelion Sol star shard.

**Measurements taken this session:** all 32 suites re-run from disk and parsed from their own
trailers (**1,703 passed, 0 failed, no missing trailer, no skipped site, no non-zero exit**);
`tools/parity-ledger.mjs` re-run (**226 / 81 / 105 / 15 / 25**, triage **25 / 0 / 0**, exact); a
live probe **instrumenting `limitedDR` through one `computeRates()`** on a fully maxed state,
giving the raw Σ and delivered value for all seven boost families; a decomposition of the
three-leg trade cycle against the source's own cycles and tax; a side-by-side of RR's three storage
buildings against Kittens' barn, warehouse and harbor. **The three-seed ensemble was launched at
the start of the session and had not finished at hand-off — every Era-3 and milestone figure quoted
here is v0.61's own, labelled as such.**
