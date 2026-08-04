# BUILDER SPEC v0.53 — five buildings measure zero because the bot cannot buy them, and one of them is the mechanism you asked me to rule on

Written against the **v0.52 tag**, verified from disk this session: every suite re-run, the
2,500-year seed-1 pacing run re-run end to end, `enhance-audit`, `rawcost` and
`crystal-sinks` re-run, and every claim below grepped against `index.html` with comments
stripped first (STANDING-RULINGS §8).

**Baseline, re-measured rather than quoted — it reproduces the BUILD REPORT to the digit:**
Sparks **y215.6**, Icathia **y1042.1**, **Era 3 826.5**, peak pop 200, morale 90–133,
crystals at cap **96.5%**, **941 assertions across 20 suites, 0 failures**.

**The round's finding is not in the report, and it changes what the open questions mean.**
Five buildings measure exactly zero at every milestone in the shipped run, and none of the
five is priced wrong:

| building | count @ Icathia | why it is zero |
|---|---|---|
| `hextechFoundry` | **0** | first copy costs `hexgear 200`; the bot's hexgear stock has **never exceeded 50.96** in 1,100 game-years |
| `hexdraulicPlant` | **0** | `hexgear 120`, same starvation |
| `chembarrel` | **0** | `alloy 160 + plating 130`; alloy peaks at 184.5 and is drained every tick |
| `hexcreteBastion` | **0** | **not in the bot's build order at all** — the Shimmer Refinery defect, verbatim |
| `frostguardCairn` + the whole Freljord `poroRatio` ladder | **0** | `poroPasture` is **not in the build order**, and `manageCrafts()` contains a literal `if (rec.id === "poroTears") continue;` |

**So `poroRatio` — "the largest unbounded non-job category in the game", which BUILD REPORT
§13.1 and HANDOFF §7.1 both ask the analyzer to rule on — has never been built in any
measured run of this project.** Part 3 rules on it anyway, from source, because the ruling is
cheap and the mechanism is right. But the reason it looked exotic is that nothing was ever
measured through it.

**This is the third instance of the same defect class in three rounds** (v0.50 acted on
"Refineries: 0"; v0.52 found the cause and fixed one string; this round finds four more). The
standing rule from HANDOFF §6 — *"a zero in a measurement is a claim about the apparatus until
you have checked the apparatus"* — was written but never swept. **Part 1 is the sweep, and it
comes before everything else in this round because every pacing number below is measured on
an instrument that cannot buy a fifth of the late game.**

---

## Part 0 — Ground rules

### 0.1 Version discipline

**This spec produces `v0.53`.** The git tag is authoritative (STANDING-RULINGS §10), not this
title, not the `VERSION` constant. At ship time the `VERSION` constant, the footer and the tag
all read `v0.53`.

### 0.2 Do not re-open

`STANDING-RULINGS.md` §§1–10 and its Appendix are closed by construction. Nothing in this
spec reopens any of them, and a builder session that finds one of them "violated" has found
the ruling. In particular this round does **not** touch: Ascent, the 1.25 band, the
effect-to-ratio proportionality bound, the Convergence stripe, the Sparks champion gate, the
`quarry` id, `catMetaTransient`, autoprod-not-worker-roles, `BOOST_LIMIT`'s seven keys, or
`CAMP_YIELD_LIMIT`.

**Verified absent at grep level this session, on comment-stripped source:** `resRatio`,
`timberframeJoinery`, `mw`. `tavern`, `bloomery`, `refinedMetallurgy` and `petricite`
(the Monument) survive **only** inside the save-migration block at lines 3862–3893, which is
where the v0.52 spec put them. That is correct and is not a discrepancy.

### 0.3 Three corrections to the v0.52 record the builder must not inherit

**0.3(a) — `poroRatio` DOES have a Kittens counterpart.** BUILD REPORT §2.2 and HANDOFF §7.1
both say it is "RR-only content with no source counterpart, so there is nothing to be at
parity *with*." That is wrong. It is Kittens' `unicornsRatioReligion`, and RR's own mapping
doc already says so. Source, read this session (`js/religion.js`, ziggurat ladder):

| Kittens | `unicornsRatioReligion` | RR | `poroRatio` |
|---|---|---|---|
| Unicorn Tomb | 0.05 | Frostguard Cairn | 0.08 |
| Ivory Tower | 0.10 | Avarosan Hearthhold | 0.15 |
| Ivory Citadel | 0.25 | Ice-Wrought Spire | 0.30 |
| Sky Palace | 0.50 | The Frozen Watcher | 0.60 |
| Unicorn Utopia | 2.50 | — | — |
| Sunspire | 5.00 | — | — |
| **Σ (all)** | **8.40 → ×9.40, additive, unbounded, priceRatio 1.15** | **Σ 1.13 → ×2.13** | ratios 1.15/1.15/1.15/1.25 |

RR's four rungs are a rank-for-rank transliteration of Kittens' first four, **and Kittens'
line is additive within one category with no diminishing return anywhere.** See Part 3.1.

**0.3(b) — the Rites of Targon regression cannot have the cause the report gives it.**
BUILD REPORT §10 attributes both worsened pass conditions to "the same one that lengthened
Era 3: Part 3.2's 26 Shimmer Refineries draw 5.2 coalgas/s and 13 mana/s, and Part 1's higher
trade-route vigor slows the early expedition loop." **Rites of Targon lands at y75.6. The
Shimmer Refinery is gated on `chemtech`, which lands at y443.0** — 367 game-years later. The
Refinery cannot have moved Rites of Targon by one tick. Only the trade-vigor half of that
sentence can apply to it, and Freljord went 100 → 175 vigor per route, a **+75%** rise in the
cheapest early sink. See Part 6.

**0.3(c) — the `boost_provisions_irrigation ×6.56` anomaly is solved, and it is the
instrument.** HANDOFF §8.3 records it unexplained ("I did not chase it. Someone should.").
Reproducing `enhance-audit`'s reader exactly and decomposing it:

| irrigation copies | Σ (incl. Cultivation 0.10) | **true multiplier** `1+limitedDR(Σ,1.5)` | `computeRates().provisions` (NET) | the audit's ratio |
|---|---|---|---|---|
| 0 | 0.10 | **1.1000** | +2.500 | 1.0000 |
| 5 | 0.25 | **1.2500** | +4.000 | 1.6000 |
| 50 | 1.60 | **2.3346** | +14.846 | 5.9382 |
| 500 | 15.10 | **2.4902** | +16.402 | 6.5608 |

Solving the four rows simultaneously: gross production at ×1 is **10.0000/s** and the
settlement eats a constant **8.5000/s**. Every row is then exact:
`net = trueMult × 10 − 8.5` (1.1×10−8.5 = 2.5 ✓; 2.4902×10−8.5 = 16.402 ✓). **The bound is
working perfectly — it saturates at 2.4902 against its 2.5 asymptote.** `boostDelivered()`
divides two *net* rates, so the constant 8.5/s sits in the denominator and inflates the
quotient without limit. The ×6.56 is not a multiplier and never was. Part 5.2 fixes the
reader.

### 0.4 What this round is for, and the lever direction is now evidence, not opinion

Era 3 is **826.5** against a **1,400–2,300** target — **59% of the minimum, 573.5 short.**

v0.52 ran the experiment that settles how to move it. Its four cumulative prefixes show price
rises buying almost nothing (Part 1's prices: +36.4) while **the Shimmer Refinery price
*cut* bought +172.6 on its own** — because 26 Refineries draw 5.2 coalgas/s and 13 mana/s.
**Demand lengthens Era 3; price does not.** That is also what the source does: Kittens does
not make its late game long by pricing buildings out of reach, it makes it long by giving
every late resource a repeatable consumer whose price ratio compounds. Verified this session,
`js/space.js` — **eleven** repeatable price-ratio buildings take `starchart` in their cost:

| building | starchart | priceRatio |
|---|---|---|
| Research Vessel | 100 | 1.15 |
| Satellite | 325 | 1.08 |
| Space Station | 425 | 1.12 |
| Spice Refinery | 500 | 1.15 |
| Moon Outpost | 650 | 1.12 |
| Moon Base | 700 | 1.12 |
| Hydrofracturer | 750 | 1.18 |
| Orbital Array | 2,000 | 1.15 |
| Planet Cracker | 2,500 | 1.18 |
| Space Beacon | 25,000 | 1.15 |

None is `limitBuild`-capped. **Supply is linear, demand is geometric, and that is the whole
mechanism by which Kittens' late game takes real time.** Parts 2 and 3 apply exactly this,
and nothing in this round raises a price.

---

## Part 1 — The apparatus sweep. Nothing else in this round is measurable until this ships.

**Rationale.** Every pacing figure this project steers by is produced by `simcore.mjs`'s
greedy bot. The bot cannot buy five of the game's buildings, and two of the five are not in
its build order at all — the identical defect v0.52 found in the Shimmer Refinery and fixed
with one string, without sweeping for others. HANDOFF §6 states the rule; this Part is the
first time it has been executed as a sweep rather than as a reaction.

### 1.1 — Every building must be reachable by the instrument, and this is asserted, not eyeballed

The bot's `order` list holds 40 ids. `BUILDINGS` holds 47. Of the seven not in `order`, five
are handled by dedicated routines (`longhouse`, `skyrise`, `shelter` at simcore 336–338,
`harbor` at 369, `hallOfHeroes` at 378). **Two are handled nowhere: `poroPasture` and
`hexcreteBastion`.**

- Add **`hexcreteBastion`** to `order`, positioned with the other Storage tiers (after
  `vault`). It is the deep-storage tier for zaunore, coalgas, hexore, shimmer and voidessence
  — the exact resources Era 3 must bank to afford anything expensive. **Every Era 3 number
  in this project's history was measured with it absent.**
- Add **`poroPasture`** to `order`, in the Village block.
- **Add a harness assertion, not a comment:** a test that enumerates `BUILDINGS`, subtracts
  the `order` list and the dedicated-routine ids, and **fails if the remainder is non-empty**.
  A comment saying "tavern and bloomery removed" did not stop this happening again; an
  assertion will. Put it in `test-v53` and have it read both files.

### 1.2 — The `poroTears` skip, and the ladder behind it

`manageCrafts()` contains, verbatim:

```js
if (!rec || rec.id === "poroTears") continue;
```

`poroTears` costs `PORO_SACRIFICE_COST = 60` poros and yields one Tear per Watcher's Eye
owned. The shipped run builds **17 Watcher's Eyes** and **zero Tears**, so `frostguardCairn`
(`trueice 30 + poroTears 5`) is unbuildable, and with it `avarosanHold`, `iceWroughtSpire`
and `frozenWatcher` — the entire `poroRatio` category.

- Teach the bot the Poro sacrifice: run `poroTears` when `S.res.poros >= 60 ×
  count("watchersEye")` **and** a visible building wants Tears. Keep it out of the generic
  deepest-first loop (its input is a live population, not a stock) — a dedicated call beside
  `manageTargon()`'s Ascent is the right shape.
- Pass condition: **`frostguardCairn` count at Icathia > 0** in the full-build run.
- **Instrument before launching** (HANDOFF §6): `poros`, `poroTears`, and all four ladder
  counts go into `simcore.mjs`'s snapshot before the first 2,500-year run of this round.

### 1.3 — The hexgear starvation, which is a real finding about the crafting policy

`seenMax.hexgear` peaks at **50.96** across 1,100 game-years while `seenMax.hexcore` reaches
**610** and `seenMax.scaffold` reaches **30,320**. The cause is `manageCrafts()`'s
deepest-first ordering combined with its `batch ≤ 25` cap: hexcore (depth 2) is crafted before
hexgear (depth 1), so every hexgear made is consumed into the deeper chain in the same pass
and the *stock* never accumulates. The Hextech Foundry's first copy costs `hexgear 200`, so it
is visible from y627.7 and unaffordable forever.

**Do not fix this by cutting the Foundry's price.** The finding is that the bot's crafting
policy cannot hold a stock of any intermediate that a deeper craft also consumes, which is a
statement about the instrument, not the economy.

- Raise the batch ceiling for an intermediate whose *own* shortfall against
  `wantIntermediate` exceeds the ceiling, or reserve `wantIntermediate[r]` from consumption by
  deeper crafts in the same pass. Either is acceptable; state which and why.
- Pass conditions: **`hextechFoundry` count at Icathia > 0**, **`hexdraulicPlant` > 0**,
  **`chembarrel` > 0**.
- **`catMonument` must then be re-reported.** The v0.51 spec's Part 1.1 pass condition was
  *"Reactor count at Icathia ≤ Foundry count"*. Measured on the shipped v0.52 build:
  **Reactors 3, Foundries 0 — the condition FAILS, and the BUILD REPORT does not list it
  among its three failing conditions.** It was unmeetable at any Reactor price. Re-run it
  once the Foundry can be bought and report it honestly either way.

### 1.4 — Predicted vs measured, stated before the run

**This Part adds production and therefore pulls against the round's purpose.** It goes in its
own slice for exactly that reason, the same way v0.52 isolated its Part 0.

> **Prediction: Era 3 SHORTENS on the apparatus slice alone — 826.5 → 600–780, and Icathia
> moves 100–250 years earlier.** The Foundry at `globalBoost 0.06` compounding with the
> Reactors, the Chembarrel's `sumpBoost 0.25` on all three Zaun extractors, and the Freljord
> ladder's `poroRatio` all add output; the Hexcrete Bastion removes the storage ceiling that
> was throttling the bank. **If Era 3 *lengthens* on this slice, the prediction is wrong and
> the reason is that the Bastion's storage is a demand sink rather than an enabler — that is
> the informative failure and it should be reported as such.**

**Every number in Parts 2, 3 and 6 is measured against the Part 1 build, not against v0.52.**
Say so in the report; a Δ that mixes the apparatus fix with a content change is unattributable.

---

## Part 2 — Crystals get a geometric sink

**Rationale, and it is a parity argument before it is a pacing one.**

Re-measured this session with `crystal-sinks.mjs`: the entire non-repeatable crystal demand
across the whole game is **580** — ten Discoveries (495), one tech (Hexcore 60), one worship
tech (Convergence 25). The only repeatable consumers are the **Aspect's Sanctum (8/copy)**
and **Marus Omegnum (40/copy)**, both Era 1 religion buildings, plus the **Petricite Block
craft (15)**.

Against that, the shipped run at Icathia: **28.7457 crystals/s gross, 132,771 held against a
cap of 132,771, at cap 96.5% of all elapsed ticks.** At `TICK_MS 200` and 4,000 ticks per
game-year — **800 seconds per game-year** — that is **22,996 crystals per game-year.**

> **The entire lifetime one-off crystal demand in Runeterra Reclaimed is 580, which is
> twenty seconds of Icathia-rate production.**

Kittens has no resource in this state, and Part 0.4 shows why: `starchart` is the structural
twin of RR's crystals — passively accrued, capped, arcane-flavoured — and **eleven repeatable
price-ratio buildings take it**, from 100 up to 25,000, at ratios 1.08–1.18. RR's crystals
have two, both of which stop being bought in Era 1.

**This is also the round's cheapest lengthener**, and by the Part 0.4 evidence it is the
right *kind* of lengthener: it adds demand, it raises no price, and the demand it adds
compounds at the consumer's own price ratio.

### 2.1 — Put crystals into the cost of the late repeatable tier

Add a `crystals` component to the cost of **four** late repeatable buildings, rank-ordered the
way `starchart` is rank-ordered across Kittens' space tiers. **Seed values, to be re-sized by
measurement before shipping (see 2.2):**

| RR building | group | ratio | seed `crystals` | Kittens rank-match |
|---|---|---|---|---|
| The Vault | Zaun | 1.15 | **400** | Satellite 325 @1.08 |
| Piltover Spire | Zaun | 1.15 | **900** | Moon Base 700 @1.12 |
| Hexdraulic Plant | Zaun | 1.25 | **1,800** | Orbital Array 2,000 @1.15 |
| Arcane Reactor | Zaun | 1.15 | **3,000** | Planet Cracker 2,500 @1.18 |

Rationale for the four chosen: all are repeatable, all are Era-3-or-later, all are Zaun-group
(crystals are a Hextech resource and the thematic fit is exact), and **the Vault and the
Spire are the two the bot demonstrably buys in quantity** — 26 and 40 copies respectively at
y1100 — so the sink bites immediately rather than waiting on Part 1.3's fix.

**Do not add crystals to the Hextech Foundry.** Part 1.3 has to prove the Foundry is buyable
at its current price before its price is changed; changing both in one round makes neither
measurable.

### 2.2 — Size it by measurement, and state the scale

The v0.52 Shimmer Refinery recost is the pattern: **name the scale the sizing is done at.**

- Measure crystals/s and crystals-spent-per-game-year on the **Part 1 build** at Deep Works
  and at Icathia, before setting final values.
- Set the four values so that, **at the Icathia state**, the measured crystal spend is
  **40–70% of measured crystal income**. Below 40% it will not move time-at-cap; above 70%
  crystals become the binding constraint on the whole Zaun group, which is a bigger change
  than this round should make in one step.
- **State the scale in the code comment**, as v0.52 §3.2 did for the Refinery's 20 copies.

### 2.3 — Do not nerf the Augment Chamber

Standing, and restated because the temptation returns every round: `jobBoost.tinkerer 0.40`
is ×7.4 on a job whose measured worker count is **1 at every milestone in every build ever
measured** (re-confirmed in this session's run: 1 tinkerer at Sparks, Hexcore *and* Icathia,
with 1 Augment Chamber). **Rule from the sink side, not the production side** — a resource
with nowhere to go behaves identically at ×1 and at ×7.4. `jobBoost` is unbounded by design
and at Kittens parity (`mineralsRatio`/`woodRatio`, no DR). No change.

### 2.4 — Pass conditions and prediction

- **Every building that takes crystals has them inside its `ratio`-scaled cost**, i.e. the
  crystal component escalates with copy count exactly as the other components do. Asserted.
- `auditCostGraph()` and `auditRawGraph()` both return **zero**, with crystals in the graph.
- **Crystals time-at-cap at Icathia falls below 40%** (from 96.5%).
- **Crystals held at Icathia falls below 3 game-years of production** (from 5.8).

> **Prediction: Era 3 lengthens by 80–250 game-years against the Part 1 build, and the
> Vault/Spire counts fall by 20–40%.** If time-at-cap falls below 40% but Era 3 does not move,
> the crystals were never the binding constraint on the late build order and the round should
> say so plainly rather than adding a fifth consumer.

---

## Part 3 — Two standing rulings, closed rather than carried

Both were handed to the analyzer by BUILD REPORT §13 and HANDOFF §7. Both are ruled here so
no future round re-opens them. **Neither ships a bound.** Two RR-invented rules have already
been ruled out of existence for being heuristics the source contradicts (STANDING-RULINGS §2);
inventing a third would be the same mistake in a new costume.

### 3.1 — `poroRatio`: KEEP IT UNBOUNDED. It is at parity, and it is at parity *below* the source.

The premise of the open item was that `poroRatio` is RR-only with nothing to be at parity
with. Part 0.3(a) shows the counterpart: Kittens' `unicornsRatioReligion`, six rungs summing
to **8.40 → ×9.40, additive within one category, no diminishing return, every rung at
priceRatio 1.15**. RR runs four rungs summing to **1.13 → ×2.13**, three of them at 1.15 and
the top one at 1.25.

**Ruling: RR is not over the source — it is at 23% of it, and it is missing the two largest
rungs, not carrying two invented ones.** The reported "×41 at 500 copies, linearity 1.0000"
is `enhance-audit` doing what it is built to do: 500 copies of each of four buildings is not
a state the game reaches, and the linearity of 1.0000 is the *correct* answer for a category
Kittens also runs unbounded. Additive-within-category, multiplicative-between is Kittens' Law
(HANDOFF §2) and `poroRatio` obeys it exactly.

Record it in code and in `test-v53` with the source citation, in the shape the CAMP_YIELD
census used:

```js
// v0.53 Part 3.1. Censused against Kittens' unicornsRatioReligion (js/religion.js, ziggurat
// ladder): unicornTomb 0.05 + ivoryTower 0.10 + ivoryCitadel 0.25 + skyPalace 0.50 +
// unicornUtopia 2.50 + sunspire 5.00 = 8.40 -> x9.40, ADDITIVE, UNBOUNDED, every rung at
// priceRatio 1.15. RR's four rungs sum to 1.13 -> x2.13 — a rank-for-rank transliteration of
// the source's first four, at 23% of the source's full stack. It is UNBOUNDED ON PURPOSE and
// at parity. Do not add a limit; do not re-flag it.
```

**And note what this opens rather than closes:** RR stops at Kittens' fourth rung. The source
carries two more, at 2.50 and 5.00, priced at `ivory 1,000,000 + tears 5,000` and
`ivory 750,000 + tears 25,000`. **A fifth and sixth Freljord rung is a rank-matched
structural lengthener with the source's own numbers behind it** — not for this round, which
already carries an apparatus fix and two demand items, but it is the strongest Era-3/4
candidate on the board after the Eludium tier. Date it in the report as a v0.54 candidate.

### 3.2 — `audience`: KEEP IT, record it as a conscious departure, bound nothing

`bardsHearth` carries `audience: 0.05`, multiplying its culture by `1 + 0.05 × S.pop`.
Kittens' Amphitheatre has no population term — `culturePerTickBase` is flat per copy
(`js/buildings.js:1801–1830`, and `kittens-game-reference.md` records Amphitheatre 0.005/tick,
Chapel 0.05, Temple 0.1, all flat). So this is an RR invention with no source counterpart, and
BUILD REPORT §2.2 is right that it is the only effect in the game that scales with the
quantity the whole game grows.

**Ruling: keep it.** The measured range is what settles it. `enhance-audit` reports +0.04 at
pop 20, +0.22 at pop 200, +2.02 at pop 2000. **RR's measured peak population is 200 and has
been 200–203 in every build measured for four rounds.** At the population the game actually
reaches, `audience` is worth **+22% culture on one building** whose culture is capped anyway.
It is a flavour term operating an order of magnitude below the range where it would matter.

The standing practice in `kittens-game-reference.md` is explicit about this case: *"Where
Runeterra Reclaimed deliberately departs from the source, that's fine to keep — but flag it
as a conscious departure rather than presenting it as if it matches the source."* Do exactly
that:

```js
// v0.53 Part 3.2. RR-ONLY, and a conscious departure: Kittens' Amphitheatre has no
// population term at all (culturePerTickBase is flat per copy). Kept because at RR's
// measured peak population of 200 this is worth +22% culture on one capped building, an
// order of magnitude below where it would matter. Measured +0.04 @ pop 20, +0.22 @ pop 200,
// +2.02 @ pop 2000. If peak population ever passes ~600, re-open this. Do not bound it now:
// a bound on a term that does not bind is a third RR-invented rule.
```

Assert the departure in `test-v53` so it is not re-flagged, **and assert the trigger**: a test
that fails if measured peak population in the pacing objectives exceeds 600 while `audience`
is still unbounded. That converts a judgement call into a tripwire.

---

## Part 4 — The Eludium tier, and its consumer

**This is the item this round owes.** The v0.51 spec's Part 6 ruled it in with a dated
placement — *"v0.52, as that round's single structural item"* — and the v0.52 BUILD REPORT
§5 records it as "deferred by the spec, not actioned, correctly." Under STANDING-RULINGS §10
that dated placement resolves to **the build after v0.52, which is v0.53.** It is not
re-flagged; it is due.

### 4.1 — The source, re-verified this session

`js/workshop.js`, `crafts` array, read directly rather than from the prior spec's citation:

```js
{ name: "eludium",
  prices:[ {name: "unobtainium", val: 1000}, {name: "alloy", val: 2500} ],
  progressHandicap: 300,
  tier: 5 }
```

For scale, the tiers beneath it in the same array: `alloy` (tier 4, `titanium 10 + steel 75`,
handicap 7), `gear` (tier 3, `steel 15`, handicap 5), `concrate` (tier 4,
`slab 2500 + steel 25`, handicap 9). **Eludium's `progressHandicap` of 300 is 30–60× every
other craft in the game.** The shape is: *deep-raw 1,000 + previous-tier-craft 2,500*, with
the previous tier dominating 2.5 : 1.

### 4.2 — The RR analogue

RR's chain maps cleanly (`rr-kittens-mapping-v050.md`, code-confirmed): Unobtainium →
**Void Essence**, and the tier-4 craft above Alloy is **Hexgear** (`alloy 25`).

```js
{ id: "eludium-analogue", name: "<name>", cost: { voidessence: <N>, hexgear: <2.5N> },
  out: "<id>", show: function (s) { return s.techs.icathia; } }
```

- **Preserve the 2.5 : 1 ratio of previous-tier-craft to deep-raw.** That ratio is the whole
  structural claim; the absolute numbers are RR's to set, because RR's craft quantities run
  one to two orders of magnitude below Kittens' (RR's Voidglass costs `voidessence 5`, where
  the comparable Kittens tier runs in the hundreds). **A literal 1000/2500 transliteration
  would be off-scale and must not be shipped unmeasured.**
- **Rank:** gated on `icathia` (135,000), which is where Voidglass, Chronoshard and Rune
  Shard already live and is the RR rung the reference doc rank-matches to Kittens'
  Mechanization/Concrete-Huts seam.
- **Sizing rule:** set `N` so that one unit costs **2–4 game-years of measured Icathia-rate
  Void Essence income** on the Part 1 build. Measure that income first; state it; then set N.
  Report predicted vs measured.

### 4.3 — A craft with no consumer is a trophy, not a sink

This is the half the v0.51 sketch did not carry, and without it the tier changes nothing.
Kittens' Eludium is consumed by `eludiumReflectors`, `voidReactors`, and — the important one
— **`orbitalArray`, a repeatable building at `eludium 100`, priceRatio 1.15** (verified this
session in `js/space.js`). The craft is a sink because a *repeatable ratio-scaled building*
eats it forever.

- Ship **at least one repeatable consumer** in the same slice: either a new Void-tier
  building or a new component on an existing Icathia-gated repeatable, at
  `<new craft> ≈ 100` against a 1.15 ratio, rank-matched to `orbitalArray`.
- **Pass condition: the new craft's stock does not monotonically increase after Icathia.** A
  craft that only accumulates has failed, and it will look exactly like the crystals problem
  in Part 2 one round later.

### 4.4 — Prediction

> **Prediction: Era 3 lengthens by 150–400 game-years against the Part 1 + 2 build, and
> Icathia-to-end-of-run Void Essence stock stops being cap-bound.** If Era 3 moves less than
> 150, the tier is priced below the scale at which it is structural and the report should say
> what scale it would need, rather than shipping a second price change to chase it.

---

## Part 5 — The apparatus, before any measurement is quoted from it

HANDOFF §8 lists six known soft spots. Five are actioned here; the sixth (§8.6, no in-game
changelog) is not a defect and is not in scope.

### 5.1 — `simcore.mjs`'s `KNOWLEDGE MULT` line sums Σ from buildings only

Re-confirmed in this session's run: at Icathia it prints *"delivered ×105.2446 (Kittens would
give ×35.75 at the same Σ 34.75)"*. The Σ excludes the Scholarship-ladder Discoveries that
also write to `boosts.knowledge`, so the two halves of the line are not comparable and the
gap reads as a ×3 overshoot that does not exist. **Fix the sum to include `UPGRADES` before
the line is quoted anywhere.** Pass condition: at Sparks, Hexcore and Icathia the printed
`delivered` and `kittensWouldGive` differ by **less than 1%**, since RR's mechanism is now
literally `1 + Σ`.

### 5.2 — `enhance-audit.mjs`'s `boostDelivered()` divides net rates

Solved in Part 0.3(c) with an exact decomposition. **Fix the reader to measure the multiplier,
not a quotient of net rates** — read `1 + limitedDR(Σ, BOOST_LIMIT[res])` directly, or
measure at a state with no consumption. Pass condition: `boost_provisions_irrigation` reads
**1.25 / 2.3346 / 2.4902** at 5 / 50 / 500 against its 2.5 asymptote, and HANDOFF §8.3 is
closed in the build report with this decomposition quoted.

### 5.3 — `shimmer-audit.mjs` hardcodes `campYieldMult = 6.27`

The shipped run's final state reports `campYieldMult 6.35`. Read it live from the run rather
than from a stale log line; the v0.52 recost's arithmetic was sized on the stale figure.

### 5.4 — `test-v52`'s `censusLocked` selector half

HANDOFF §8.5 records that the `census-row|data-w=` grep was written without confirming the
renderer emits those selectors. **Confirm them or delete that half of the assertion.** A
decorative assertion is worse than none: it will be cited as coverage.

### 5.5 — `test-v14.mjs` asserts a building that does not exist

It is in `tests/historical/` and does not run, but it asserts the Tavern's tech, ratio, relief
and cost. Add a header line to the file recording that it is archaeology and that the Tavern
was deleted in v0.52 — the historical set is shipped for archaeology (STANDING-RULINGS
Appendix) and a reader deserves to know which of its assertions describe a deleted building.

---

## Part 6 — Eras 1 and 2 got longer, which nobody asked for

Re-measured this session on the shipped build:

| condition | target | v0.51 baseline | **v0.52 shipped** | |
|---|---|---|---|---|
| Rites of Targon | before y55 | y64.0 | **y75.6** | ❌ worse by 11.6 |
| 130 wanderers | before y600 | y704.1 | **y857.4** | ❌ worse by 153.3 |
| morale dips below 90 before y50 | > 0% of ticks | 0% | **0%** | ❌ unmoved |
| 75 wanderers | — | — | **y615.0** | (reported for the first time) |

Per Part 0.3(b) the Shimmer Refinery cannot be the cause of the first — it is 367 game-years
downstream. The trade-vigor normalisation can: Freljord went **100 → 175 vigor**, +75% on the
cheapest early route, in a period when vigor is also the only currency for expeditions, and
this session's run shows **first expedition at y6.70** and **first trade at y362.7**.

- **Measure, do not guess.** Report vigor income and vigor spend per game-year at y50 and
  y100 on the Part 1 build, split between expeditions and trade.
- **Rule from the measurement.** Either the early vigor economy is tight enough to justify a
  compensating change — Caravanserai's subtractive discount arriving earlier is the smallest
  candidate, since it changes no route price — or Rites-of-Targon-before-y55 is a target
  calibrated against a build that no longer exists and should be **re-based with its reason
  recorded**, the same way the "first trade before Sparks" condition was retired in v0.50
  Part 5. **Do not silently carry a third consecutive round of a failing condition.**
- The `morale dips below 90 before y50` condition has now been at 0% for four rounds against
  a `> 0%` target. It is asking for an early-game morale trough that the shipped build never
  produces. **Rule on it: either it is a real design goal and something must create the
  trough, or it is a dead condition and it should be retired with its reason.**

---

## Part 7 — Order, discipline, pass conditions

### Order — four cumulative prefixes of the shipped file

Snapshot `index.html` (and `simcore.mjs`) **after each slice, forward from the file itself**.
v0.52 §10 admits its s3 was reverse-patched rather than snapshotted — *"the v0.47 failure mode
in miniature, in the round that re-states the discipline."* Not again.

1. **Part 1 alone — the apparatus.** It is the round's largest unknown, it changes the
   measuring instrument rather than the game, and it pulls against the round's purpose. It
   must be its own slice or nothing after it is attributable. **Also re-run the *unmodified*
   v0.52 build under the new harness**, so the harness Δ and the content Δ are separable.
   This is what "its own baseline round" means.
2. **Part 2** — the crystal sink.
3. **Part 4** — the Eludium tier and its consumer.
4. **Everything else** — Part 3's two rulings and comments, Part 5's apparatus fixes, Part 6's
   measurements.

Part 5.1 and 5.2 are instrumentation and go in **before** slice 1 runs, not in slice 4 —
"instrument before launching" (HANDOFF §6) means the reader is correct before the first
2,500-year run, and Part 5.2's reader is quoted in this very spec.

### The trade-banking policy, dated to this round, and why it is deferred with a reason

v0.52 Part 3.3 scheduled the `manageTrade()` banking policy for v0.53 *"with its own baseline
round."* **It is deferred to v0.54, and this is a ruling with a stated reason, not a silent
skip** — Part 1 already re-baselines every pacing number in the project by changing what the
bot can buy. Teaching the bot to trade in the same round would re-baseline them a second time
from a different cause, and the two would be inseparable. That is the v0.47 mistake at larger
scale, and it is the exact reasoning the v0.51 spec used to defer this item the first time.

The calibration note in `pacing.mjs`'s header stays accurate and stays put. This session's
run re-confirms the gap it describes: at Icathia the bot could run **186.88 trades a
game-year** and runs **0.45**.

**Date it: v0.54, as that round's first slice, against a Part-1-fixed harness.** Record the
date in `docs/analyzer-status.md` so it is not lost a second time.

### Operational — each has already cost this project a round

- **Kill background runs by PID from `ps -eo pid,args`.** Never `pkill -f` a pattern that
  matches your own shell. Broken twice, v0.46 and v0.50.
- **Size every `sleep` under the tool timeout** while background runs are live.
- **Strip comments before grepping source.** Broken twice, v0.51 and v0.52.
- **Instrument before launching.** Every metric named in Parts 1–6 goes into `simcore.mjs`'s
  snapshot before the first 2,500-year run.
- **Playwright:** `chromium.launch({ executablePath: "/opt/pw-browsers/chromium" })` with a
  `.catch(() => chromium.launch())` fallback. Never run `playwright install`.
- **Timing:** a 2,500-year seed-1 run measured **833.1s wall** this session on a clean
  container, and the paths in `sim/` and `tests/` are relative (`new URL("../index.html")`),
  so the old hardcoded-`/home/claude/work/site/` quirk in HANDOFF §6 is **stale — it does not
  apply to the repo layout.** Plan on ~14 minutes per run, three in parallel ≈ one.

### Round pass conditions

| # | Condition | Target |
|---|---|---|
| 1 | Buildings absent from the bot's reachable set | **zero**, asserted by enumeration in `test-v53` |
| 2 | `hextechFoundry` / `hexdraulicPlant` / `chembarrel` at Icathia | **all > 0** |
| 3 | `hexcreteBastion` at Icathia | **> 0** |
| 4 | `frostguardCairn` at Icathia | **> 0** (the `poroRatio` ladder is finally measurable) |
| 5 | Reactor count at Icathia ≤ Foundry count | reported honestly either way, with `catMonument` |
| 6 | Crystals time-at-cap at Icathia | **< 40%** (from 96.5%) |
| 7 | Crystals held at Icathia | **< 3 game-years of production** (from 5.8) |
| 8 | Crystal spend as a share of crystal income at Icathia | **40–70%**, scale stated in the comment |
| 9 | The new tier-5 craft's stock after Icathia | **not monotonically increasing** |
| 10 | `auditCostGraph()` / `auditRawGraph()` | **0 / 0** |
| 11 | `BOOST_LIMIT` | seven keys, `knowledge` still absent, unchanged |
| 12 | Kittens' 30/30/25/13 science parity | **×20.8000**, unchanged |
| 13 | Tech ladder | 8 ties · median ×1.1222 · geo mean ×1.2632 · largest ×3.333 — recomputed and reported |
| 14 | Morale 90–140 after y60 | **100%** |
| 15 | `KNOWLEDGE MULT` line's two halves | within **1%** at all three milestones |
| 16 | `boost_provisions_irrigation` | **1.25 / 2.3346 / 2.4902**, HANDOFF §8.3 closed |
| 17 | Era 3 length | reported **per slice** against 826.5 and against 1,400–2,300, distance stated |
| 18 | Rites of Targon / 130 wanderers / early morale dip | measured, and each either moved or **retired with its reason** |
| 19 | Every Part above | actioned, or its non-action explicitly justified in the report |

### Predicted vs measured — on the record, before any run

| slice | Era 3 length | Icathia | note |
|---|---|---|---|
| v0.52 baseline (re-measured) | **826.5** | y1042.1 | reproduces the report to the digit |
| s1: Part 1 apparatus | **600–780** | 100–250 y earlier | production added; pulls against the round |
| s2: + Part 2 crystals | **s1 + 80–250** | later | demand added, no price raised |
| s3: + Part 4 Eludium | **s2 + 150–400** | later | the structural item |
| **s4 shipped** | **1,000–1,350** | — | **still short of 1,400; say so** |

**The round does not claim it will reach the target.** If s4 lands inside 1,000–1,350 the
lever direction from Part 0.4 is confirmed and Part 3.1's fifth and sixth Freljord rungs plus
the banking policy are the v0.54 spine. If s4 lands below 1,000, demand-side lengthening is
weaker than the v0.52 Shimmer Refinery result suggested, and that result was a one-building
coincidence rather than a principle — **which is the informative failure, and it is worth more
than a number that lands in band for the wrong reason.**

---

## Sources, all read this session

**Kittens** (`github.com/nuclear-unicorn/kittensgame`, fetched from raw source):
`js/workshop.js` `crafts` — **eludium `unobtainium 1000 + alloy 2500`, tier 5,
progressHandicap 300**; alloy `titanium 10 + steel 75` tier 4 handicap 7; gear `steel 15`
tier 3 handicap 5; concrate `slab 2500 + steel 25` tier 4 handicap 9. `js/space.js` — the
**eleven repeatable `starchart` consumers**, 100–25,000 at priceRatio 1.08–1.18, none
`limitBuild`-capped. `js/religion.js` ziggurat ladder — **`unicornsRatioReligion` 0.05 / 0.10
/ 0.25 / 0.50 / 2.50 / 5.00, additive, unbounded, every rung priceRatio 1.15**.
`claude/kittens-game-reference.md` — Amphitheatre 0.005/tick flat, Chapel 0.05, Temple 0.1;
the Alloy→Eludium tier flagged unaccounted since v0.43; the standing "flag conscious
departures" practice.

**RR**, verified against `index.html` at the v0.52 tag with comments stripped: `BOOST_LIMIT`
2722 (seven keys); `CAMP_YIELD_LIMIT` 1652; `costDiscovered` 2390–2415 and `buildingVisible`
2435–2448 (**craft outputs bypass the `seenMax` test — the Foundry is visible, not
undiscovered**); `crowdRelief` 156 (one carrier); five trade routes at `vigor 175`
(1865/1886/1912/1927/1950); `sparks` gate and comment 714–718; `keepingTheRolls`
`culture 60 + knowledge 1300` on `songcraft` 1185; save migrations 3862–3893; `CRAFTS`
3726–3800; `TICK_MS 200`, `TICKS_PER_DAY 10`, `DAYS_PER_SEASON 100` → **800 s per game-year**.
`sim/simcore.mjs` — build `order` 380–394 (40 ids), `manageCrafts()` 507–578 (**the `batch ≤
25` cap and the literal `poroTears` skip**), housing 336–338, harbor 369, hallOfHeroes 378.
