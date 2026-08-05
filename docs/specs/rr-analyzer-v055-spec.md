# BUILDER SPEC v0.55 — the parity round: Jerry's charter, eight directives, and a food economy that is exactly one-tenth of the source

**This spec replaces the storage-scope draft that stood here before.** Jerry has issued a
charter that changes what balance arguments are made of, and eight numbered directives that
follow from it. Directives override the spec where they conflict (HANDOFF §1); here they *are*
the spec, and my job was to source every number they depend on and say where the source
disagrees.

Written against the **v0.54 tag**, verified from disk on a fresh clone: all 23 suites re-run
(**1,098 assertions, 0 failures**), the 2,500-year seed-1 pacing run re-run end to end
(1,495 s wall, reproducing BUILD REPORT v0.54 §6 to the digit — Rites y73.9, Sparks y149.0,
Icathia y790.2, Era 3 641.2, peak pop 222, morale band 61%, trades 69,930, crystals at cap
94.8%), and every identifier below grepped against `index.html` with comments stripped first.

**The single most important thing I found while sourcing the directives, and it reframes three
of them:**

> **RR's food economy is exactly one-tenth of Kittens', to three decimal places — and its
> internal ratio is already at perfect parity.** Kittens: farmer `catnip: 1` per tick × 5
> ticks/s = **5.000/s**; `catnipPerKitten: −0.85` per tick = **4.250/s**. Ratio **1.17647**.
> RR: farmer **0.500/s**; `CONSUMPTION = 0.425`/s. Ratio **1.17647**. Identical.
>
> **The one term that is not on that scale is the Farmstead.** Kittens' catnip field is
> `catnipPerTickBase 0.125` = **0.625/s**; RR's is **0.14/s**. At RR's own tenth-scale it
> should be 0.0625. **RR's starter food building is 2.24× the source's**, and it is the
> cheapest building in the game at ratio 1.12, of which the bot owns sixty.

That is the Deepwinter problem, and it is not the eating rate. Part 3 is built on it.

---

## Part 0 — The charter, and what it changes about how this spec argues

Recorded as **STANDING-RULINGS §16** in the same commit as this spec. The operative clauses:

- **The source is the balance authority; the simulator is an instrument.** Every proposal below
  is justified by a Kittens rung, cost, ratio or rate with a file citation. Pacing runs still
  ship and every milestone pass condition still stands — but **a bot measurement is now
  evidence about the instrument, not a balance argument.**
- **Every RR-original item carries a parity label** — EASIER or HARDER than source, with the
  reason. Jerry's null hypothesis is that RR-original content usually makes the game *easier or
  quicker*, so an unlabelled RR-original item is assumed to be a speed-up until measured.
- **Port the mechanism and the rung; assign by role.** "Kittens does X" is not licence to
  transliterate a name onto a different building — v0.52 Part 1.2 put the Aqueduct's figure on
  the Farmstead and had to undo it.

**Version discipline:** this spec produces **v0.55**. The tag is authoritative (§10). Bump the
`VERSION` constant; do not pin a literal version string outside this round's own suite.

**Do not re-open** anything in STANDING-RULINGS §§1–15. In particular this round does not touch
Ascent, the 1.25 band, the proportionality bound, merchant fatigue, the Convergence stripe,
the Sparks gate, `catMetaTransient`, `BOOST_LIMIT`'s seven keys, `poroRatio`'s unbounded shape,
or `audience`. **`CAMP_YIELD_LIMIT = 6` stays at 6** — Part 4 changes the stack's membership,
not its ceiling.

### 0.1 — The one directive whose parity classification I could not resolve, stated as unresolved

**Directive 5 (farmers affected by seasons).** I could not establish from source whether
Kittens' season modifier reaches the *farmer job's* catnip or only the catnip *field's*
`catnipPerTickBase`. A targeted read of `js/village.js` reports no weather or season term in
the farmer's production path; `js/game.js` returned 404 at the path I tried, and the wiki's
skill page does not cover it. **Per the project's own rule — a hedged fetch is unverified until
the raw file is read (`kittens-game-reference.md`, standing practice) — this is open.**

It does not block the directive: Jerry's ruling stands either way. **It decides the label**,
which under §16 is now a deliverable in itself:

- If the modifier reaches total catnip including farmers → directive 5 is a **parity fix**.
- If it reaches fields only → directive 5 is an **RR-original divergence, HARDER than source** —
  and the first item to be labelled HARDER under the new charter, which is worth having.

**Resolve it against the raw file before shipping and record the answer in the ledger.**

---

## Part 1 — `docs/PARITY-LEDGER.md`, the charter's instrument

A charter with no instrument is a preference. §16 needs a place where "is this at parity?" has
an answer that does not require re-deriving it every round.

Create `docs/PARITY-LEDGER.md`, one row per RR tech, building, upgrade, job and craft:

| column | content |
|---|---|
| RR id | the identifier in `index.html` |
| Kittens counterpart | file and symbol, or **`RR-ORIGINAL`** |
| rung | RR knowledge cost vs Kittens science cost |
| scale | the comparable magnitude — cost, ratio, per-second rate |
| verdict | `PARITY` · `EASIER` · `HARDER` · `UNVERIFIED` |
| note | one line: why, with the citation |

**Seed it with what is already verified.** This project has censused a great deal and the
findings are scattered across eleven build reports; the ledger is where they stop being
scattered. Verified rows available today, all with citations already in the repo or in this
spec: the tech ladder (RR's costs are a near-verbatim transliteration of Kittens' science
costs — see Part 2), `BOOST_LIMIT`'s seven keys, `CAMP_YIELD_LIMIT`, `poroRatio` ↔
`unicornsRatioReligion`, `audience` (RR-ORIGINAL, EASIER), the Sparks gate (RR-ORIGINAL,
HARDER — the only Era gate in the game), the science stack at ×20.8000, the quarry's cost, the
Aqueduct/Irrigation figures, and everything in Parts 2–8 below.

**Pass conditions.** Every entry in `TECHS`, `BUILDINGS`, `UPGRADES`, `JOBS` and `CRAFTS`
appears exactly once, asserted by enumeration in `test-v55` — the same shape as v0.53's
reachability assertion, so a thing added later cannot silently miss the ledger. **No row may be
blank; `UNVERIFIED` is a legal verdict and an honest one, a missing row is not.** Report the
count of each verdict; the `UNVERIFIED` count is this project's parity debt and every future
round should shrink it.

---

## Part 2 — Two unlock rungs are wrong, and the ladder makes them exactly computable

**Directives 3 and 7.4.** Both are confirmed and both now have an exact target, because of
something worth stating on its own:

> **RR's tech ladder is a near-verbatim transliteration of Kittens' science costs.** RR: 30,
> 100, 300, 500, 500, 900, 1000, 1200, 1300, 1500, 1500, 2000, 2000, 2200, 3600, 9500, 12000,
> 12000, 15000, 20000, 28000, 35000, 50000, 50000, 55000, 60000, 60000, 65000, 75000, 85000,
> 90000, 100000, 115000, 115000, 125000, 125000, 135000. Kittens: calendar 30, agriculture 100,
> archery 300, **mining 500**, **animal 500**, ..., **construction 1300**, **engineering 1500**,
> ..., steel 12000, machinery 15000, ..., **archeology 65000**, ..., electricity 75000,
> industrialization 100000, mechanization 115000.
>
> **Rung-matching is therefore not an approximation in this project — it is a lookup.** Where a
> Kittens building unlocks at science *N*, its RR analogue belongs on RR's *N*-knowledge rung.

### 2.1 — Petricite Masonry: 9,500 → 65,000 (directive 3)

Jerry: *"Petricite Masonry unlocks too early. The 35% miner bonus compared to the cost makes no
sense to build. Let's have it unlock later and be the equivalent of Kitten's Quarry in terms of
unlock timing and cost."*

Source, verified this session:

```js
// js/science.js
name: "archeology", prices: [ {name:"science", val: 65000}, {name:"compedium", val: 65} ],
unlocks: { buildings: ["quarry"] }
// js/buildings.js
quarry: prices [ {slab 1000}, {steel 125}, {scaffold 50} ], priceRatio 1.15,
        effects { "mineralsRatio": 0.35, "coalPerTickBase": 0.015 }
```

**The cost is already at exact parity and must not move** — STANDING-RULINGS §5 pins
`stoneSlab 1000 + steel 125 + scaffold 50` at ratio 1.15 and pins the id `quarry`. **Only the
tech moves**, which §5 does not cover.

- `petricite` (Petricite Masonry): **`knowledge 9500` → `knowledge 65000` + a compendium
  term.** Kittens charges `compedium 65` alongside; RR's compendium is `morellonomicon`, so
  add **`morellonomicon: 65`**. RR already has a rung at 65,000 (`chemBaronAccords`), so this
  is a tie, not a new rung — the ladder's tie count rises 8 → 9 and the fan-out rule (max 3)
  must be re-checked.
- **Re-check every dependant.** `stonecutGuild` sits on `tech: "petricite"` and
  `RES.petriciteBlock` hides on `!s.techs.petricite`; the `petriciteBlock` craft
  (`stoneSlab 40 + crystals 15`) gates on it too. Moving the tech moves all four. **Report
  which of them should follow the tech and which should be re-homed to a lower rung** — a
  crystal-costed craft arriving 55,500 knowledge later than today is a real change to the
  crystal sink v0.53 Part 2 shipped.
- Recompute all five ladder conditions and report them whether or not they hold.

**Parity label:** RR's Petricite Quarry at 9,500 is **EASIER** than source by 6.8× in rung
terms. After this change: **PARITY**.

### 2.2 — The Irrigation Channel: `mining` (500) → the 1,500 rung (directive 7.4)

Source: `aqueduct` is unlocked by **`engineering`, 1,500 science** (`js/science.js`), and costs
`minerals 75` at ratio 1.12 with `catnipRatio 0.03` (`js/buildings.js`). **RR's Irrigation
Channel copies the cost, the ratio and the figure exactly** — `ore 75`, 1.12,
`boost.provisions 0.03` — and sits on `mining`, **500**.

- Move it to RR's **1,500** rung. Two candidates: `smelting` (1,500) and `masquerade` (1,500).
  **Use `smelting`** — it is the construction/metallurgy rung and the Channel is priced in ore;
  `masquerade` is the culture rung and would be a role mismatch of exactly the kind §16's last
  clause warns about.
- **This is not the v0.52 Part 1.2 error repeating.** That round moved the *figure* off the
  wrong building onto the right one and put the right building on `mining` because ore arrives
  at `mining` and an ore-priced building any earlier would have re-opened a raw gate. The
  building is right; only the rung is early. Confirm `auditRawGraph()` still returns zero after
  the move — ore is available three rungs before 1,500, so it should.

**Parity label:** currently **EASIER** by three rungs. After: **PARITY**.

---

## Part 3 — The food economy, the Farmstead, and Deepwinter (directives 5, 7.1, 7.2, 7.3)

Jerry's stated goal for directive 7 is *"to make deepwinter's more impactful."* The measurements
say the eating rate is not what is blunting it.

### 3.1 — What is actually true today

| | Kittens (per second, ×5 ticks) | RR | RR ÷ Kittens |
|---|---|---|---|
| farmer output | `catnip 1`/tick = **5.000/s** | **0.500/s** | **0.100** |
| consumption per head | `catnipPerKitten −0.85`/tick = **4.250/s** | `CONSUMPTION 0.425`/s | **0.100** |
| **farmer : eater ratio** | **1.17647** | **1.17647** | **1.000 — exact parity** |
| starter food building | `field` `catnipPerTickBase 0.125` = **0.625/s** | Farmstead **0.14/s** | **0.224** — i.e. **2.24× too strong** at RR's own scale |
| season multiplier | spring 1.5 / summer 1.0 / autumn 1.0 / **winter 0.25** | identical | **PARITY** |
| does the season reach the farmer? | **UNRESOLVED — Part 0.1** | **no** (`if (b.seasonal && r === "provisions")` — buildings only) | — |

**The season table is already at exact parity. The ratio is already at exact parity. Two things
are not: the Farmstead is 2.24× the source's field, and RR's farmers are season-proof.** Those
two together are why Deepwinter does not bite — a 0.25× winter on buildings barely matters when
the buildings are over-strength and the jobs are exempt.

### 3.2 — Directive 5: farmers take the season

`JOBS`' farmer reads `desc: "+0.5 provisions/s (ignores seasons)"`, and `computeRates()` applies
`farmMult` only under `if (b.seasonal && r === "provisions")`. Apply `farmMult` to the farmer
job's provisions output as well, and rewrite the description — the parenthetical is currently
the only place the exemption is documented.

**This is the round's real Deepwinter lever.** At `farmMult 0.25` a settlement's entire
job-based food supply drops 75% for a quarter of every year, which is what winter does in the
source. Label it per Part 0.1 once the source question is resolved.

### 3.3 — Directives 7.1 and 7.2: the absolute scale, and the sweep it requires

Jerry directs `CONSUMPTION` → **4**, farmer → **5**, Farmstead → **0.63**. Sourcing each:

- **Farmer 5** — `catnip: 1`/tick × 5 = 5.000/s. **Exact source value. Ship as written.**
- **Farmstead 0.63** — `catnipPerTickBase 0.125` × 5 = 0.625/s. **Ship `0.625`**, not 0.63; the
  source value is exact and there is no reason to round it. This is the change that removes the
  2.24× over-strength.
- **`CONSUMPTION` 4** — the source is **4.25**/s. At 4, the farmer:eater ratio moves
  1.17647 → **1.250**, a **6.2% relaxation** of food pressure in a directive whose stated goal
  is more pressure. **Recommended: 4.25, which preserves the exact ratio the game already has.**
  Jerry's directives override and 4 ships if he wants it — but the number and its direction are
  on the record, which is what §16 asks for.

**The blast radius, and it is the largest risk this round carries.** Multiplying production and
consumption by 10 while every provisions *cost* and *cap* stays fixed makes every provisions
price one-tenth as expensive in real time. **A compensating ×10 sweep on every provisions cost
and every provisions cap must ship in the same slice**, or the round silently trivialises the
Storehouse, the Harbor, the Longhouse, the Training Ground, the Bard's Hearth and every
provisions-costed Discovery.

- Enumerate every `cost.provisions`, every `caps.provisions` and `RES.provisions.baseCap`, and
  multiply each by 10. **Assert the enumeration**, so a provisions price added later cannot be
  left on the old scale.
- **The fallback, if the sweep proves wider than expected:** the identical felt outcome is
  available with **no rescale at all** — set the Farmstead to **0.0625/s** and ship directive 5,
  leaving `CONSUMPTION` and the farmer where they are. The 2.24× over-strength and the seasonal
  exemption are the whole effect; the ×10 is cosmetic parity of absolute scale. **If the sweep
  cannot be completed cleanly, take the fallback and say so** rather than shipping half a
  rescale.

### 3.4 — Directive 7.3: the Granary

Source, verified: Kittens has **two** pastures and RR has only ported one.

```js
// js/buildings.js
pasture:        prices [ {catnip 100}, {wood 10} ], priceRatio 1.15,
                effects { "catnipDemandRatio": -0.005 }
unicornPasture: prices [ {unicorns 2} ],            priceRatio 1.75,
                effects { "catnipDemandRatio": -0.0015 }
// js/science.js — both unlocked by:
animal: prices [ {science 500} ], unlocks { buildings: ["pasture", "unicornPasture"] }
```

RR ported `unicornPasture` → `poroPasture` and never ported the plain one. Ship the **Granary**:

```js
{ id: "granary", name: "Granary", group: "Village", tech: "<RR's 500 rung>",
  cost: { provisions: 100, timber: 10 }, ratio: 1.15,
  eatCut: 0.005, eatCutLimit: <see below> }
```

- **Rung: RR's 500-knowledge rung**, which is where `animal` sits. `mining` and `logistics` are
  both 500; **`logistics`** is the better role match (it already carries the Wilds and the camp
  line, and food storage is a logistics concern) — but state the choice and check `auditRawGraph()`.
- **The `eatCut` bound needs a ruling, and it is not a free choice.** RR runs `eatCut` through
  `limitedDR(_, eatCutLimit)`; Kittens' `catnipDemandRatio` is **unbounded and additive**. With
  two members instead of one the bound now governs two buildings. **Compute the delivered eat
  reduction at realistic counts for both buildings with `enhance-audit` and report it before
  setting `eatCutLimit`** — the existing 0.5 was sized for one member.
- **The prose is a trap worth naming:** Jerry called it a "granary", and RR deleted a Granary
  in v0.10 whose prose survived until v0.54 directive 9 removed it. Check the Deepwinter
  forecast string and any other surviving reference before reusing the name.

**Parity labels:** the Granary is **PARITY** on arrival. `poroPasture`'s `eatCut 0.003` against
the source's 0.0015 is **EASIER** by 2× per copy before the bound — see Part 5.

---

## Part 4 — Hunt yield: delete the building, build the chain (directive 4)

Jerry: *"Hunter's lodge feels abusable. Let's remove this building and shift the hunt yield
bonuses to a discovery chain similar to the Kitten's Bow/armor for hunting upgrade... Jungler
should not increase camp yield."*

**Both halves are correct against source, and the source has no counterpart for either.**
Kittens' hunt yield comes entirely from **workshop upgrades** — censused in v0.52 Part 2.5 and
re-confirmed: `bolas 1.0 + huntingArmor 2.0 + steelArmor 0.5 + alloyArmor 0.5 + nanosuits 0.5 +
griffinRelationsScouts 0.5 + rationing 0.1 = Σ 5.10 → ×6.10`, unbounded, **seven members**.
Kittens' hunter *job* produces `manpower 0.06` and boosts nothing.

RR's `campYieldMult()` today sums **ten** sources:

```js
var sum = 0.05 * (S.jobs.jungler || 0)
        + bfield("hunterLodge", "campBoost") * count("hunterLodge")   // 0.15/copy
        + champPassive("camp") / 100;
if (S.upgrades.trappersCraft)   sum += 0.25;
if (S.upgrades.beastLore)       sum += 0.25;
if (S.upgrades.masterOfTheHunt) sum += 0.5;
if (S.upgrades.atlasGauntletsUp && !isLuxury) sum += 0.5;
if (S.upgrades.jessedHawks && isLuxury)       sum += 0.25;
if (hasPolicy("openRange"))     sum += 0.12;
sum += traitBonus("trailblazer");
```

**Two of those ten are RR-original and both are unbounded in a *count* the player controls** —
the Jungler term scales with workers assigned and the Lodge term with copies owned. Everything
in the source's list is a one-off upgrade. **That is the abuse Jerry felt**, and it is a
structural difference, not a tuning one.

- **Delete `hunterLodge`** with the same one-way save migration the Tavern and Bloomery used —
  drop `buildings.hunterLodge`, refund a stated fraction of the ratio-1.15 geometric sum, state
  the rule. Grep-level assertion that the id appears nowhere outside the migration block.
- **Remove the `0.05 × jungler` term.** The Jungler keeps `prod.vigor 0.30`, which is its
  Kittens-parity output (`hunter: manpower 0.06`/tick = 0.30/s — **exact**, and worth recording
  in the ledger as a PARITY row). Rewrite its `desc`.
- **Bring the upgrade chain to the source's Σ.** After the two deletions RR's upgrade-only stack
  is `0.25 + 0.25 + 0.5 + 0.5 = 1.50` (non-luxury) against the source's **5.10**. Extend the
  existing chain — `trappersCraft`, `beastLore`, `masterOfTheHunt`, `atlasGauntletsUp`,
  `jessedHawks` — rank-matched to Kittens' five workshop rungs (bolas is early archery,
  nanosuits is late), to **Σ ≈ 5.10 across seven members** including the policy and trait terms.
  Do not add a member count beyond seven without saying why.
- **`CAMP_YIELD_LIMIT` stays 6** (STANDING-RULINGS Appendix). At Σ5.10 through
  `limitedDR(_, 6)` the delivered figure is **×5.93** against the source's ×6.10 — parity within
  3%, and the ruling that keeps the bound is undisturbed. **Report the delivered figure; do not
  change the limit to hit a number.**
- **Pass conditions:** `hunterLodge` absent at grep level; `campYieldMult()` contains no term
  keyed to a job or a building count; the delivered multiplier measures **×5.7–6.1**; camp
  yields at Sparks/Hexcore/Icathia reported before and after.

**Parity labels:** `hunterLodge` **RR-ORIGINAL, EASIER** (a repeatable building where the source
has one-off upgrades) — deleted. The Jungler camp term: **RR-ORIGINAL, EASIER** — deleted. The
Jungler's vigor: **PARITY**.

---

## Part 5 — The Poro Pasture's price ratio (directive 6)

Source, quoted in full above: `unicornPasture`, `priceRatio 1.75`. RR's `poroPasture` runs
**1.15**. Directive 6 and BUILD REPORT v0.54 §9.1 agree, and STANDING-RULINGS §2 governs the
reasoning: **Kittens assigns `priceRatio` by what a building *is***, and this is the same
building.

- `poroPasture.ratio`: **1.15 → 1.75.** Ship it.
- **Hold `eatCut` and measure it.** RR's 0.003 against the source's 0.0015 is 2× per copy, but
  RR's runs through `limitedDR` (measured linearity **0.325**) where the source is unbounded, so
  the per-copy figures are not comparable. **Measure the delivered eat reduction at 5 / 50 / 500
  copies with `enhance-audit` and rule from that**, alongside Part 3.4's Granary, since after
  this round two buildings share the bound. Halving a bounded term to match an unbounded one is
  the name-matching §16 warns against.
- Report Pasture count at Icathia before and after: v0.54 measures **60 Pastures and 505,505
  poros** at ratio 1.15, and directive 13 last round put production at ×5. At 1.75 the count
  should fall hard, which also feeds Part 4's camp economy and the Freljord ladder — **say which
  of those moved.**

---

## Part 6 — Drakes: diminish from the first kill, keep the cap (directive 1)

**Grep first, because half of this is already shipped and the other half is the interesting
half.** `index.html`:

```js
var DRAKE_PER_KILL = { infernal: 0.05, ocean: 0.06, mountain: 0.06, cloud: 0.10, hextech: 0.06 };
function drakeBonus(id, max) { ... return limitedDR(n * (DRAKE_PER_KILL[id] || 0.05), max); }
```

**The cap exists and `limitedDR` exists.** What does not exist is diminishing return anywhere a
player will actually be:

```js
function limitedDR(x, limit) {
  var a = Math.abs(x), free = 0.75 * limit;
  if (a <= free) return x;            // <-- LINEAR, no DR at all, below 75% of the cap
  ...
}
```

Worked for the Mountain Drake (0.06/kill, cap 0.6): the free band ends at 0.45, which is
**7.5 kills**. A player reaches **75% of the cap with no diminishing return whatsoever**, and
only the last quarter is curved. **That is exactly the behaviour directive 1 objects to**, and
Jerry's phrasing — *"it should be very difficult for the player to reach drake cap"* — is a
request for a curve that bites from the first kill.

**Drakes are RR-ORIGINAL; Kittens has none.** So there is no rung to port — but there is a
*curve*, and RR already ships it: `unlimitedDR(v, stripe) = (√(1 + 8v/stripe) − 1) / 2`, which
is Kittens' own Solar Revolution shape and diminishes from zero.

- Add a **`strictDR(x, limit) = limit * x / (x + limit)`** — monotone, asymptotic at `limit`,
  **no free band**, half the cap at `x = limit`. Route `drakeBonus()` through it. Do **not**
  change `limitedDR` itself: it is load-bearing for `BOOST_LIMIT`, `CAMP_YIELD_LIMIT`,
  `MORALE_RELIEF_LIMIT` and `eatCut`, and changing it here would change all of them silently.
- **Report the kill counts before and after** for all five drakes at 25%, 50%, 75% and 90% of
  cap. Under `strictDR` the Mountain Drake reaches half its cap at 10 kills and 90% at **90
  kills**, against **8 kills to 75%** today. That is the directive's "very difficult", quantified
  before the run rather than asserted after it.
- **Check every call site**, because drakes feed five different systems: `mountainMult` on
  storage caps (3022), `boosts.vigor` (3119), `boosts.crystals` (3120), `catMeta` (3249) and
  `oceanMult` (3332). **`catMeta` is under STANDING-RULINGS §6 — the two-output collapse must
  not be merged.** Assert that the four Scholarship-line resources still measure ×1.000 with the
  Infernal Drake at 100 kills and the Soul owned, exactly as the existing test does.

**Parity label:** drakes are **RR-ORIGINAL, EASIER** today — five uncapped-in-practice
multipliers reached in single-digit kill counts. After: **RR-ORIGINAL, labelled**, with the
kill-count table as the evidence.

---

## Part 7 — Wanderer experience is one point per second (directive 2)

```js
w.jx[w.j] = (w.jx[w.j] || 0) + dt;     // index.html:3611 — 1 xp per second worked
```

`RANKS` tops at **Challenger, 11,500 xp, bonus 0.1875**. So **Challenger in one trade takes
11,500 seconds = 3.19 real hours of continuous work**, and v0.54's directive 8 made experience
bank per trade, which multiplies that by however many trades a wanderer practises.

**What is verified about the source, and what is not.** Kittens' `getValueModifierPerSkill()`
is confirmed verbatim: tiers at **<100 → 0, 100 → 0.0125, 500 → 0.025, 1200 → 0.045, 2500 →
0.075, 5000 → 0.125, 9000+ → 0.1875 × (1 + masterSkillMultiplier)**. RR's ladder is already
close in shape: nine tiers to the source's seven, topping at 11,500 against 9,000, with an
**identical top bonus of 0.1875**. **The thresholds are not the problem.**

**The accrual rate is, and I could not find the increment in `js/village.js`** — the file
contains skill *reads* and save/load only; the wiki's skill page does not carry a rate. Rather
than quote a number I have not read, the spec item is a derivation:

- **Read the skill increment from the raw source before setting anything.** Search
  `js/village.js`, the `KittenSim` class and `js/game.js` for `skills[` with `+=`. Record the
  file and line in the ledger.
- **Express the target as time, not as a constant.** Compute *real hours of single-job work to
  reach the top tier* in Kittens, and set RR's `dt` coefficient so RR matches it. RR's current
  value is **3.19 hours**; state Kittens' and state the ratio.
- **Keep the thresholds and the bonuses as they are.** They are already at parity in shape and
  exactly at parity at the top; changing them as well would make the rate change unmeasurable.
- Pass condition: time-to-Challenger reported before and after, in hours, with the source
  figure and its citation beside it. **If the increment genuinely cannot be located in source,
  say so and ship a stated multiple of today's rate as an interim, labelled `UNVERIFIED` in the
  ledger** — do not invent a citation.

---

## Part 8 — The undo re-roll (directive 8)

`snapshotUndo()` / `undoSnapshot` / `UNDO_SECONDS = 10` give a 10-second undo window that
snapshots all of `S`. Because `Math.random()` is re-rolled on the retried action, a player can
undo and repeat a hunt or a trade until the roll is favourable. **This is RR-ORIGINAL — Kittens
has no undo — and it is the largest EASIER item in the game: it converts every probabilistic
outcome into a best-of-N.**

Jerry's fix: *"any % chance of failure should be 100% and any % chance to receive an item should
be 0%"* on the next attempt after an undo.

- On undo, set a penalty marker recording **which kind of action was undone** — e.g.
  `S.rerollPenalty = { hunt: true }` or `{ trade: true }`. Do **not** make it global: undoing a
  champion recruit should not poison the next hunt.
- The next resolution of that kind forces every failure roll to **fail** and every
  chance-to-receive roll to **miss**, then clears the marker. Deterministic amounts — a trade's
  base goods, a hunt's floor yield — are unaffected; only the rolls are.
- **The marker must survive the undo itself.** `undoSnapshot = JSON.stringify(S)` and a restore
  overwrites `S` wholesale, so a flag stored inside `S` is erased by the very action that sets
  it. **Set it after the restore, or hold it outside `S` and mirror it into `serialize()`.** This
  is the one place this Part can silently do nothing, and a test that only checks the flag is
  set will not catch it — **assert the penalty by observing a forced-fail outcome**, not by
  reading the flag.
- **Tell the player.** A forced failure that looks like bad luck is worse than the exploit. The
  chronicle line should say the attempt was rushed after a reversal.
- Pass conditions: hunt → undo → hunt yields the floor result with zero item drops, asserted
  end-to-end; trade → undo → trade yields base goods and no caravan bonuses; an undo of a
  *different* action kind does not penalise; the marker clears after exactly one attempt; and
  the offline/catch-up replay path is unaffected (STANDING-RULINGS §15 — there is one production
  path and this must not become a second).

**Parity label:** **RR-ORIGINAL, EASIER** today; **RR-ORIGINAL, bounded** after.

---

## Part 9 — What this round does NOT do, and why

**The storage-scope restructure is re-dated to v0.56**, with a technical reason rather than a
capacity one. The draft that previously occupied this file replaced the single multiplicative
`masonryMult` with two additive accumulators and a per-resource scope table, ported from
`addBarnWarehouseRatio` (`js/resources.js`) — and it remains the right fix, fully sourced, with
its measurements taken: cap-out is **culture 93.8%, knowledge 90.0%, crystals 89.8%, renown
76.6%** against a twelve-resource average of 17.7%, and the ×22 figure this project has quoted
since the v0.39 spec **has never been reached** (`voidwardStores` has never been researched;
the real stack is **×12.6**).

**It cannot ship in the same round as Part 3.** Part 3 multiplies every provisions cost and cap
by 10; the storage restructure changes what multiplies every cap. Shipping both makes the
provisions ceiling unattributable to either, which is the failure mode cumulative prefixes exist
to prevent. **v0.56, first slice**, and the measurements above carry forward unchanged.

Also carried, unchanged, and still open: the **Chembarrel / save-for-a-visible-building fix**
(`catMonument` is ×1.00 at all three milestones — Foundry 0, Reactor 0, Chembarrel 0; but
`seenMax.hexgear` has risen ~51 → **155.61** against the Foundry's 200, so it is 22% short, not
75%); the **craft-depth tie-break** (Riftsteel never forged, and **two** of v0.53 Part 4's
monotonicity conditions fail — voidessence accumulates 0 → 70,124 after Icathia with no
consumer); the **trade-banking policy**; the **morale round** (band 61%, minimum 88); and
**Convergence at Sparks measuring 2.33% against a 5–8% target with no pass condition attached to
catch it.** Add that pass condition this round even though the morale and Convergence work is
deferred — a target with no condition is not a target.

Two documentation corrections to fold in wherever they are cheapest: `index.html:1447` cites
`addBarnWarehouseRatio` as `js/buildings.js`; it is in **`js/resources.js`**. And HANDOFF v0.54
§4 states `BUILD_ORDER` and `DEDICATED_ROUTINES` are "at module scope and exported" — they are
declared inside `runSim`'s `page.evaluate` at `simcore.mjs:441–442` and neither is exported;
`test-v53`'s check asserts module scope but tests it with a text `indexOf`, which matches at any
scope. **The reachability guard itself is real and works.**

---

## Part 10 — Order, discipline, pass conditions

### Order — five cumulative prefixes, snapshotted forward from the shipped file

1. **Part 1** — the parity ledger. It is the round's charter deliverable and it costs no
   pacing; doing it first means Parts 2–8 fill it in as they land rather than as an afterthought.
2. **Part 3** — the food economy and its ×10 sweep. The largest blast radius in the round and
   the one with a stated fallback; it must be alone in its slice.
3. **Parts 2 + 4** — the two rung corrections and the hunt-yield restructure. Both are removals
   or delays and both should push pacing the same way.
4. **Parts 5 + 6** — the Poro Pasture ratio and the drake curve.
5. **Parts 7 + 8** — experience and the undo penalty; neither is expected to move pacing.

Snapshot `index.html` and `sim/simcore.mjs` into `snapshots/` after each slice. Do not
reverse-patch.

### Operational

Kill background runs by PID from `ps -eo pid,args`. Size every `sleep` under the tool timeout.
Strip comments before grepping — use `test-v53`'s `strip()`. Never run `playwright install`.
`test-v32` flakes under CPU contention (HANDOFF §8.6) — re-run on an idle box before calling it
a defect. A 2,500-year seed-1 run measured **1,495 s** this session with one other job on a
2-core box. **Pushing works** — HANDOFF §6's token-remote-with-proxy-unset recipe is correct and
was used for this commit.

### Round pass conditions

| # | Condition | Target |
|---|---|---|
| 1 | `docs/PARITY-LEDGER.md` covers every TECH, BUILDING, UPGRADE, JOB and CRAFT | asserted by enumeration; no blank rows; verdict counts reported |
| 2 | Directive 5's source question | **resolved against the raw file** and the label recorded |
| 3 | `petricite` tech | `knowledge 65000` + `morellonomicon 65`; quarry cost and id **untouched** (§5) |
| 4 | Ladder | five conditions recomputed and reported; fan-out still ≤ 3 |
| 5 | `irrigation` | on the 1,500 rung; `auditRawGraph()` **0** |
| 6 | Farmer, Farmstead, `CONSUMPTION` | 5.000 / **0.625** / 4.25 (or Jerry's 4, with the ratio stated) |
| 7 | The ×10 provisions sweep | every `cost.provisions`, `caps.provisions` and `baseCap` enumerated and asserted — **or the 3.3 fallback taken and stated** |
| 8 | Farmers take `farmMult` | asserted at all four seasons; winter output falls 75% |
| 9 | Granary | shipped at `provisions 100 + timber 10`, ratio 1.15, `eatCut 0.005`, 500 rung |
| 10 | `eatCutLimit` | **re-ruled from a measurement** with two members sharing the bound |
| 11 | `hunterLodge` | absent at grep level; migration verified on a v0.54 save |
| 12 | `campYieldMult()` | no term keyed to a job or building count; delivered **×5.7–6.1**; seven members |
| 13 | `poroPasture.ratio` | **1.75**; counts before/after |
| 14 | `drakeBonus` | routed through `strictDR`; kill-count table at 25/50/75/90% of cap |
| 15 | `catMeta` regression | four Scholarship resources still ×1.000 with Infernal at 100 kills (§6) |
| 16 | Wanderer XP | source increment located and cited, **or** labelled UNVERIFIED; time-to-Challenger before/after |
| 17 | Undo penalty | asserted by a **forced-fail outcome**, not by reading the flag; survives the restore; clears after one attempt; wrong-kind undo does not penalise |
| 18 | Convergence at Sparks | **added to the pass-condition list** |
| 19 | Unchanged | science parity ×20.8000; `BOOST_LIMIT` seven keys; `CAMP_YIELD_LIMIT` 6; `auditCostGraph()`/`auditRawGraph()` 0/0 |
| 20 | Every Part | actioned, or its non-action explicitly justified |

### Predicted vs measured — on the record, before any run

**Under §16 these are secondary to the source citations, and they are stated anyway** — a
prediction that misses is still the most informative thing a round produces.

| slice | Era 3 | Icathia | Sparks | note |
|---|---|---|---|---|
| v0.54 baseline (re-measured) | **641.2** | y790.2 | y149.0 | reproduces the report exactly |
| s2: food economy + seasonal farmers | **+40 to +140** | later | **within ±15 of y149** | population growth slows; both edges move |
| s3: rungs + hunt yield | **+80 to +250** | later | **later by 20–60** | Petricite Masonry at 65,000 delays the ore line; camp yields fall |
| s4: Pasture ratio + drakes | **+10 to +60** | later | unmoved | |
| s5: XP + undo | **≈ 0** | unmoved | unmoved | neither is a pacing item |
| **shipped** | **770–1,090** | — | — | **still short of 1,400, and this round does not claim otherwise** |

**The informative failures to watch for.** If Sparks moves more than 15 years on s2, the food
rescale is reaching Era 1 harder than intended and the ×10 sweep missed a cost. If Era 3
*shortens* on s3, the Petricite delay freed ore for something more valuable than the Quarry and
that is worth knowing. And per STANDING-RULINGS §13, **every one of these is a difference of two
milestones — say which edge moved**, every time.

---

## Sources, all read this session

**Kittens** (`github.com/nuclear-unicorn/kittensgame`, raw source):
`js/science.js` — **`archeology` 65,000 science + 65 compedium unlocks `quarry`**;
**`engineering` 1,500 unlocks `aqueduct`**; `animal` 500 unlocks `pasture` **and**
`unicornPasture`; `mining` 500 unlocks `mine` and `workshop`; `construction` 1,300 unlocks
`logHouse`, `warehouse`, `lumberMill`, `ziggurat`.
`js/buildings.js` — `field` (`catnip 10`, ratio 1.12, **`catnipPerTickBase 0.125`**);
`pasture` (`catnip 100 + wood 10`, ratio 1.15, **`catnipDemandRatio −0.005`**); `unicornPasture`
(`unicorns 2`, **ratio 1.75**, `catnipDemandRatio −0.0015`, `unicornsPerTickBase 0.001`);
`aqueduct` (`minerals 75`, ratio 1.12, `catnipRatio 0.03`); `quarry` (`slab 1000 + steel 125 +
scaffold 50`, ratio 1.15, `mineralsRatio 0.35`, `coalPerTickBase 0.015`); `hut` (ratio 2.5);
`mine`, `lumberMill`, `workshop`, `barn`, `warehouse`, `library`, `logHouse`.
`js/village.js` — the `jobs` array (**farmer `catnip: 1`**, hunter `manpower 0.06`, miner
`minerals 0.05`, woodcutter `wood 0.018`, scholar `science 0.035`); **`catnipPerKitten: −0.85`**;
`getValueModifierPerSkill()`'s seven tiers topping at **0.1875 at 9,000**; **no season term in
the farmer's production path, and no skill-increment code in the file** — both recorded as
unresolved above.
`js/resources.js` — `addBarnWarehouseRatio` (for Part 9's carried-forward measurements).
`js/workshop.js` — the `hunterRatio` line, Σ 5.10 → ×6.10 across seven members.

**RR**, at the v0.54 tag, comment-stripped: `CONSUMPTION = 0.425` (33); `SEASONS` `farmMult`
1.5 / 1.0 / 1.0 / **0.25** (22–25); the `farmer` job `prod.provisions 0.5` "(ignores seasons)"
(551); `farmstead` `prod.provisions 0.14, seasonal: true`, `cost.mana 15`, ratio 1.12 (115);
`irrigation` on `tech: "mining"` (98–101); `petricite` tech `knowledge 9500` and the four
dependants (`stonecutGuild`, `RES.petriciteBlock`, the `petriciteBlock` craft, the `quarry`
building); `hunterLodge` `campBoost 0.15` on `logistics` (284–288); `jungler` (568);
`campYieldMult()`'s ten members (1927–1937); `poroPasture` `eatCut 0.003, eatCutLimit 0.5`,
ratio 1.15 (212); `DRAKE_PER_KILL` and `drakeBonus` (1897–1900) with call sites at 3022, 3119,
3120, 3249, 3332; `limitedDR`'s **`free = 0.75 * limit`** band (2554–2560) and `unlimitedDR`
(2564); `RANKS` (1740–1749); `w.jx[w.j] += dt` (3611); `snapshotUndo` / `undoSnapshot` /
`UNDO_SECONDS = 10` (4122–4131); the 37-tech ladder with costs.

**Measurements taken this session:** all 23 suites (1,098 assertions, 0 failures); the
2,500-year seed-1 pacing run (1,495 s wall); a 1,200-game-year run with per-resource cap-out
instrumentation, which produced Part 9's carried-forward table and the
`voidwardStores`-never-researched finding.
