# BUILDER SPEC v0.61 — the converter stack is at HALF the source's upgrade line, and the early ladder is where the debt actually lives

Written against the **v0.60 tag**, verified from disk on a fresh checkout.

**What reproduces.** Thirty-one suites, run with the round's own new runner: **1,615 assertions
passed, 0 failed, every suite printing a `SUITE-END` trailer, no suite skipping a call site, no
non-zero exit.** Part 1 of the last round is doing exactly what it was built to do. The parity
ledger reproduces **to the row from the generator**: `226 rows — PARITY 72, EASIER 41, HARDER 2,
UNVERIFIED 111`, with the triage split `RETRIEVABLE 26, RR-ORIGINAL 85, GENUINELY OPEN 0`.

**Every v0.60 part shipped.** `XP_PER_SECOND = 0.05`; `XP_CAP = Math.floor(11500 * 20001 / 9000)`
— the constant is now literally its own derivation; `RANKS` back to Grandmaster 7,500 /
Challenger 11,500 with gaps 2,700 / 4,000; `AUTOMATION_BASE = 0.02` driving both
`automationTrigger()` and `automationShare(n)` against `AUTOMATION_CAP = 0.90`;
`JOB_SHARE_BUDGET = 0.85` with a deficit-ranked pick rather than first-below;
`tools/run-suites.mjs` and `tests/_selftest-throws.mjs` present.

**I independently reproduced the report's bonus-matched ladder table row for row** — ×3.50 /
×1.60 / ×1.33 / ×1.16 / ×0.96 / ×1.28 — and the XP arithmetic (11,500 / 0.05 / 3600 = **63.89 h**,
`XP_CAP` = **25,556**, gaps 2,700 / 4,000). §10.1's self-correction is sound.

**And one number in the report does not decompose the way it is described.**

> **§2 reports the "converter-side stack" at ×19.77 and compares it against Kittens'
> `calcinerRatio` ×3.70, concluding RR runs "×5.3 the source".** Measured on a maxed state,
> **`convMult` cannot exceed ×5.373** (×8.06 with the transient cinder buff). The ×19.77 is
> `convMult × (1 + boosts.crystals)` — **two different categories multiplied together** — while
> `calcinerRatio` is *one*. The comparison is not like-for-like, and when it is made like-for-like
> the finding **reverses**. Part 1.

---

## Jerry's dev notes — where every one lives in this spec

**All eleven notes from the previous round are specified. The mapping, so none can be lost:**

| # | note | Part |
|---|---|---|
| 1 | Trades should show the renown reward | **5.3** |
| 2 | Cataloguing / Great Index unlock together and do the same thing; Great Index → Sparks | **7** |
| 2.1 | Cataloguing = Academy → Archive; Great Index = Observatory → Academy | **7** |
| 3 | More mana multipliers, one costing hextech crystals | **8** — *revised: it moves to Petricite Masonry* |
| 4 | "civilisation" spelling in the Trade UI | **6.4** |
| 5 | Is Jarvan's XP passive Kittens' Academy `skillXP`? Are we at parity? | **4** |
| 6 | Drake and Baron hunts cannot be undone | **9** |
| 7 | Festival gives 25 renown | **5.2** |
| 8 | Does Kittens have a trade yield max? | **6.1** — *answer: no, it has none* |
| 9 | Howling Abyss pays too much; renown should scale with vigor | **5.1** |
| 10 | "deeper cargo slots" message is inaccurate | **6.2** |
| 11 | All trades cost provisions, ~5,000 | **6.3** |

**And this round's four updates:**

| update | disposition |
|---|---|
| XP rate → 0.05/s | **already shipped at v0.60.** `index.html:3235` is `var XP_PER_SECOND = 0.05;`. **But Jarvan cannot mitigate the early ladder — see Part 2.0, he arrives 12× too late.** |
| Only one mana discovery on Sparks; fourth goes on Petricite Masonry | **Part 8, revised.** `leylineCalibration` is confirmed on `sparks`; the new rung moves to `petricite`. |
| The "deeper cargo slots" message | **Part 6.2 — already specified**, with the exact wrong test named. |
| More post-Sparks discoveries cost Hextech Crystals | **Part 10, new** — and it is the best-shaped crystal sink this project has found. |

---

## Part 0 — Ground rules

**This spec produces `v0.61`.** Integers stay reserved 1:1 for spec rounds.

**Clone Kittens and pin the revision.** Everything below was read from
`nuclear-unicorn/kittensgame` at **`c52985b`**. Do not use grep.app.

**Do not re-open** STANDING-RULINGS §§1–30. §16's charter governs every sizing argument here.

**The ensemble.** v0.60 took 2,641 s (44.0 min). Budget 60–90 minutes and start it first.

---

## Part 1 — Decompose `convMult` term by term (builder note 1)

**Note 1 asks for the decomposition before any number is proposed. Here it is, measured on a
state with every upgrade, every drake maxed and all ten champions at level 10** — `index.html:5426–5433`:

| term | value | what kind of thing it is |
|---|---|---|
| `clockworkBellows` | ×1.25 | Discovery |
| `bankedCoals` | ×1.15 | Discovery |
| `resonanceCoils` | ×1.25 | Discovery |
| **the three Discoveries together** | **×1.7969** | **compare to the source's line** |
| `infernal` drake | ×1.4950 | RR-original system, `strictDR` capped at 0.5 |
| overseer affinity | ×2.0000 | RR-original system; 5 champions × 2 × level, and **level caps at 10**, so this term caps at exactly ×2 |
| cinder buff | ×1.5 | transient, not a standing multiplier |
| **`convMult` product** | **×5.3728** | **×8.0590 while cinder is up** |

### 1.1 The comparison, made like-for-like — and it reverses the finding

Kittens' `calcinerRatio` is **one additive category**: three upgrades summing to **2.70**, giving
**×3.70**. The like-for-like RR quantity is its own three conversion Discoveries.

| | value |
|---|---|
| Kittens, three upgrades, one additive category | **×3.70** |
| RR, three Discoveries, as shipped (multiplicative) | **×1.797** |
| RR, same three if additive within one category | ×1.65 |

**RR's conversion upgrade line is at 49% of the source's — it is half as strong, not five times
as strong.** The v0.60 report's "×5.3 the source" compared RR's `convMult × (1 + boosts.crystals)`
against one Kittens category. **The excess over the source is not in the upgrade line at all: it
is entirely two RR-original systems — the infernal drake (×1.495) and the overseer champion
affinity (×2.000) — multiplying on top of it.**

### 1.2 What that means, and what to ship

**Do not raise the Discoveries and do not cut `MANUFACTORY_FUEL`.** The parity question this
decomposition actually poses is a **structural** one, and it is the same one Part 6 of the last
round named for `boosts`:

> Kittens composes conversion strength as **one category of three upgrades**. RR composes it as
> **three multiplicative categories** — Discoveries, drakes, champions — plus a transient. Under
> Kittens' Law a distinct system may be a distinct category, so the composition is *legal*; but
> **the source has one category here and RR has three, and that is the divergence, not any
> individual number.**

1. **Ship the decomposition as a permanent readout**, term by term, next to the crystal
   decomposition v0.60 added. **A product with six factors that nobody can name is how this got
   two rounds of wrong diagnosis.** Name every factor and its current value at each milestone.
2. **Make the three Discoveries additive within one category** — Σ0.65 → ×1.65. It is a 8%
   reduction and that is not the point: **the point is that RR's own §19 requires it everywhere
   else, and the conversion line is the last place still chaining discrete upgrades
   multiplicatively.** Ledger it PARITY-of-shape against `calcinerRatio`.
3. **Ledger the drake and champion terms as RR-ORIGINAL multiplicative categories**, with their
   caps stated (×1.495 and ×2.000 — both bounded, which is worth recording since neither was
   obviously so). **HARDER/EASIER by argument, per §16 — they are EASIER.**
4. **Correct the v0.60 report's ×19.77 row** rather than leaving it: state that the figure was
   `convMult × (1 + boosts.crystals)`, that `convMult` alone caps at ×5.373, and that the
   like-for-like upgrade-line comparison is ×1.797 against ×3.70.

**Pass conditions:** the term-by-term readout ships and prints at every milestone; the three
Discoveries are one additive category; `convMult`'s measured ceiling asserted at **×5.3728** on a
maxed state and **×8.0590** with cinder; the drake and affinity caps asserted; the ×19.77 row
corrected with the two-category explanation; **`MANUFACTORY_FUEL` still unchanged.**

---

## Part 2 — The early rank ladder, where a new player actually lives (builder note 2)

### 2.0 The XP rate is already at the source, and Jarvan cannot reach this problem

**`XP_PER_SECOND = 0.05` shipped at v0.60** (`index.html:3235`) — the first half of the update is
already true and no code moves for it.

**The second half needs a measurement before it is relied on.** Jarvan's passive is +25% XP, and
the question is whether it offsets the early ladder. **It cannot, by more than an order of
magnitude:**

| | real time |
|---|---|
| one game-year (`TICK_MS 200 × TICKS_PER_DAY 10 × DAYS_PER_SEASON 100 × 4 seasons`) | **800 s = 13.33 min** |
| **the first rank rung** — 350 XP at 0.05/s | **1.94 hours** |
| **the first champion** — y106, v0.60's three-seed median | **23.6 hours** |

**Jarvan arrives roughly 12× later than the rung he would be helping with** — and he is one
champion of ten, so on most runs he is later still. **A +25% XP passive that arrives on day two
does nothing for the player's first two hours, which is the entire span the ×3.50 debt covers.**

**So Part 2 stands as written.** If Jerry would rather leave the ladder alone and accept the
early pace, that is a legitimate call — but it should be made knowing Jarvan is not the mitigation.


**28% is the top rung and nothing else.** Matched by bonus — the only comparison with meaning,
since RR has nine rungs and Kittens seven — the debt is worst at the very first one and narrows
monotonically upward. **I reproduced §10.1's table independently and it is exact:**

| Kittens bonus | Kittens XP | RR XP | ratio | RR hours | Kittens hours |
|---|---|---|---|---|---|
| **+1.25%** | 100 | **350** | **×3.50** | **1.9** | **0.6** |
| +2.5% | 500 | 800 | ×1.60 | 4.4 | 2.8 |
| +4.5% | 1,200 | 1,600 | ×1.33 | 8.9 | 6.7 |
| +7.5% | 2,500 | 2,900 | ×1.16 | 16.1 | 13.9 |
| +12.5% | 5,000 | 4,800 | ×0.96 — EASIER | 26.7 | 27.8 |
| +18.75% | 9,000 | 11,500 | ×1.28 | 63.9 | 50.0 |

**The first rung is the one that matters and it is ×3.50.** A Kittens player sees their first
skill bonus after **36 minutes**; an RR player waits **1 hour 57**. That is the first hour of the
game — the hour in which a player decides whether the game rewards them — and it is the single
harshest rung on the ladder by a wide margin.

**The cause is a rung-count mismatch, not a pricing decision.** RR spends its second rung
(Silver, 100 XP) on **+1.0%**, which is *below* Kittens' first bonus of +1.25%, so the player must
climb to Gold at 350 to match what Kittens grants at 100. **RR's extra rungs are paid for out of
the early game.**

**Ship the source-shaped fix and let Jerry rule the shape.** Two options, and state which:

1. **Re-price the low rungs so RR's ladder crosses each Kittens bonus at the source's XP.**
   Silver → +1.25% at 100 keeps nine rungs and fixes the first-rung debt outright; the rest of the
   low ladder then re-spaces toward 500 / 1,200 / 2,500. **Preferred: it is the source's timing
   with RR's granularity.**
2. **Drop to seven rungs and take Kittens' ladder literally.** Cleanest parity, loses the
   nine-rung progression texture RR chose deliberately.

**Do not touch the top rung.** It is Jerry's note 4 figure, it puts the top rank at 63.9 h in the
centre of his stated 50–75 band, and moving it re-opens a decision he has already made.

**Pass conditions:** the bonus-matched table asserted rung by rung with each ratio; **the +1.25%
rung at ×1.00–×1.20**; the top rung **unchanged at 11,500 / 63.9 h**; every rung's ratio reported
before and after; Era 3 and first-champion reported, since early skill bonuses compound.

---

## Part 3 — The 85 mislabelled rows, and one mapping that is wrong (builder notes 3, 4)

### 3.1 UNVERIFIED is not a verdict for a mechanism that cannot be looked up

**85 of 226 rows — 38% of the ledger — are classed RR-ORIGINAL and still labelled UNVERIFIED.**
The v0.60 triage established the class; it did not discharge it. **A mechanism with no
counterpart cannot be "not yet looked up". It must be argued EASIER or HARDER.**

**Ship the argument pass.** For each of the 85, a one-line verdict with a reason of the form *"no
Kittens counterpart; it is EASIER/HARDER than the nearest source-shaped alternative because X."*
The nearest-alternative framing is what makes this tractable — `hextech` has no counterpart
resource, but "a resource with a converter faucet and a flat sink" does, and the Calciner is it.

**The guard, so this cannot recur:** `tools/parity-ledger.mjs` should **abort on an RR-ORIGINAL
row still labelled UNVERIFIED**, exactly as it already aborts on a GENUINELY OPEN row with no
recorded retrieval attempt. **UNVERIFIED must mean only "RETRIEVABLE and not yet retrieved".**

**Predicted split of the 85, stated before the pass: 60 EASIER, 20 HARDER, 5 that turn out to
have a counterpart after all** and move to RETRIEVABLE. Score it.

### 3.2 `hextechFoundry` points at the wrong Kittens building

Flagged by v0.60 rather than repaired, correctly. **RR's Foundry is a converter; the row maps it
to Kittens' Factory, which is a craft-ratio building** (`craftRatio`, not a conversion). The
mapping was never comparing like things.

**The source-shaped counterpart is the Calciner** — a building that consumes one resource per
tick and autoproduces another, which is what RR's Foundry does. Kittens' `calciner`:
`mineralsPerTickCon: -1.5`, `oilPerTickCon: -0.024`, `ironPerTickAutoprod: 0.15 * (1 +
calcinerRatio)`. **Re-point the row, and re-rate against the Calciner's actual ratios.**

**And note what the Foundry additionally does that the Calciner does not:** it carries
`globalBoost: 0.06` per copy, amplified by `hexdraulicPlant`, feeding `catMonument` — **a global
production multiplier on a converter building.** Kittens' Calciner has nothing of the kind.
**That is a separate ledger row and it is EASIER.**

**Pass conditions:** every RR-ORIGINAL row carries EASIER or HARDER with a reason; the generator
aborts on RR-ORIGINAL + UNVERIFIED; the predicted split scored; `hextechFoundry` re-pointed to
`calciner` with line numbers; the `globalBoost` clause ledgered separately.

---

## Part 4 — The learning rate: what RR has, what it lacks (builder note 5, dev note 5)

**Dev note 5 asks whether Jarvan's passive is Kittens' Academy `skillXP` and whether RR is at
parity. It is the same effect class, and the answer is a near-coincidence worth stating.**

| | Kittens | RR |
|---|---|---|
| mechanism | **Academy**, `skillXP: 0.0005` per copy (`js/buildings.js:628`) | **Jarvan's passive**, `{ key: "xp", base: 25 }` (`index.html:1503`) |
| composition | **additive** into the same accumulator as the 0.01 base: `(baseSkillXP + getEffect("skillXP")) * times` | **multiplicative** on the rate: `XP_PER_SECOND * (1 + champPassive("xp") / 100)` |
| source of the bonus | a **building** you may own many of | a **champion**, one only |
| magnitude at full stack | 20 Academies → `0.01 + 0.010` = **×2.00** | Jarvan at level 10 → `25 × passiveMult(10)` ≈ **+97% → ×1.97** |

**The magnitudes land within 2% of each other, and that is the whole of the parity.** The
composition, the source and the scaling are all different: Kittens' is an additive building line
that grows with your settlement, RR's is a single multiplicative champion bonus that arrives whole
the moment one champion levels.

**Two things to ship, and neither is a magnitude change.**

1. **Ledger Jarvan's passive with the comparison stated** — the ×1.97 vs ×2.00 coincidence, and
   the three structural differences. **Rate it PARITY-of-magnitude, RR-ORIGINAL-of-shape.**
2. **Builder note 5's missing content is real: RR has no building that accelerates learning.**
   Kittens' Academy is the only additive contributor to `getEffect("skillXP")` in the entire
   game, and RR's `academy` — already the Academy's analogue for knowledge cap and boost — is the
   obvious home. **Specify it, do not ship it this round:** `skillXP` additive, sized so that
   RR's academy count at Icathia reaches ×2.00 in combination with nothing else, and **explicitly
   ruled against Jarvan** so the two do not silently stack to ×4. **That interaction is the reason
   this is a specify-then-decide item rather than a build item.**

**Pass conditions:** the Jarvan row ledgered with both figures and the three differences; a
missing-content row for the Academy `skillXP` line with its proposed sizing and the Jarvan
interaction named; **no XP magnitude changed this round.**

---

## Part 5 — The renown economy: three notes, one of them a real outlier (dev notes 1, 7, 9)

### 5.1 Hunt renown must scale with vigor (dev note 9)

**Jerry is right and the Abyss is the outlier by a clear margin.** Every expedition's authored
renown against its vigor cost, measured:

| expedition | renown | vigor | **renown per 1,000 vigor** |
|---|---|---|---|
| **Journey to the Howling Abyss** | 5 | 120 | **41.67** |
| Hunt Raptors | 3 | 100 | 30.00 |
| The Sump Crawl | 4 | 140 | 28.57 |
| Hunt Wolves / Gromp | 2 | 100 | 20.00 |
| Hunt Krugs | 3 | 150 | 20.00 |
| Drake Hunt | 15 | 900 | 16.67 |
| Challenge Baron Nashor | 40 | 2,600 | 15.38 |
| Send a Scouting Party | 8 | 1,750 | 4.57 |

**The Abyss pays 2.7× the Baron's rate per unit of vigor — and it is a CHARGE camp**
(`CHARGE_REGEN_S.abyssJourney = 200`), so an empowered run pays ×3 on top. **That is the whole of
the complaint and the table is the argument.**

**Ship a single rate.** `renown = max(1, round(vigor × RENOWN_PER_VIGOR))` with
**`RENOWN_PER_VIGOR = 0.0154`** — the Baron's current rate, chosen because the Baron is the
ladder's anchor and the one deed nobody has called mispriced:

| expedition | before | after |
|---|---|---|
| Wolves / Gromp | 2 | **2** |
| Raptors | 3 | **2** |
| Krugs | 3 | **2** |
| **Abyss** | **5** | **2** |
| Sump Crawl | 4 | **2** |
| Drake Hunt | 15 | **14** |
| Baron | 40 | **40** |

**Exempt the Scouting Party and say so.** At 1,750 vigor the rule would pay it 27 against its
authored 8 — a ×3.4 buff to a discovery expedition that is not a hunt, and Jerry's note says
*hunts*. Keep its authored 8 and ledger the exemption.

**This is a renown cut and it interacts with Part 5.2.** Report first-champion on three seeds.

### 5.2 The Festival pays 25 renown (dev note 7)

`holdFestival()` (`index.html:4883`) grants gold, morale and luxuries and **no renown**. Add a
flat **25**, through `gainRenown()` so the `callToArms` gate is respected.

**Size it against what it replaces:** 25 renown is **12.5 Wolves hunts** at the post-5.1 rate, for
a festival that costs mushrooms and plumes and is already on a cooldown. **That is a large single
grant and it partly offsets 5.1's cut** — which may be exactly what Jerry intends, but the report
must state the net rather than each half.

### 5.3 Trades show their renown (dev note 1)

`TRADE_RENOWN = 1` per caravan has been paid since v0.59 and **the trade tooltip never mentions
it** — `showTooltip(btn, { ... yield: ys ... })` at `index.html:8671` builds `ys` from cargo slots
only. Add the renown line, **and make it read the constant** rather than a literal `+1`. Under
Caitlyn it is 1 + 5; show the resolved figure.

**Pass conditions:** one `RENOWN_PER_VIGOR` constant; the table above asserted expedition by
expedition; the Scouting Party exemption asserted and ledgered; festival 25 through `gainRenown()`
with the `callToArms` gate asserted; the trade tooltip shows the resolved renown including
Caitlyn's; **first and tenth champion on three seeds, with the net of 5.1 and 5.2 stated.**

---

## Part 6 — Trade parity: a cap the source does not have, a message that is wrong, a cost, a typo

### 6.1 Kittens has NO trade yield maximum (dev note 8)

**Retrieved, and the answer is unambiguous.** `js/diplomacy.js:744–747`:

```js
var tradeRatio =
    1
    + this.game.diplomacy.getTradeRatio()
    + this.game.diplomacy.calculateTradeBonusFromPolicies(race.name, this.game)
    + this.game.challenges.getChallenge("pacifism").getTradeBonusEffect(this.game);
```

and `getTradeRatio()` is `getEffect("tradeRatio") + village.getEffectLeader("merchant", 0)`
(`:250`). **A plain additive sum with no diminishing return and no ceiling.** The tradepost
contributes `tradeRatio: 0.015` per copy (`js/buildings.js:1679`), unbounded in count — 100
tradeposts is +150%. **The only `Math.min` anywhere near it is inside the pacifism challenge**
(`js/challenges.js:326`), not base play.

**RR caps it twice and composes it multiplicatively** (`index.html:4072–4080`):

```js
var docks = limitedDR(... , 1.0);                                  // ceiling +100%
function caravanYieldMult(fid) { return 1 + limitedDR(0.02 * caravanCount(fid), 0.60); }   // ceiling +60%
return (1 + docks) * embassy * (1 + champPassive("caravan")/100 + traitBonus("merchant")) * policyMult("trade");
```

**So RR is HARDER than the source on trade yield, and structurally different: four multiplicative
categories against the source's one additive sum.** Jerry asks for parity, and the source-shaped
answer is **one additive category, uncapped**: `1 + docks + caravans + champion + trait + policy`.

**Predict before running: this is a large trade buff at high caravan counts** — the +60% embassy
ceiling currently binds hard, and removing it while making the composition additive is not a
uniform change. **Report trade income at every milestone and `firstTrade`.** If the additive form
comes out *weaker* at low counts (it will — multiplication of small terms exceeds their sum), say
so; that is the source's shape and it is the correct trade-off, but it must be seen.

### 6.2 "deeper cargo slots" is testing the wrong property (dev note 10)

`index.html:8711` prints *"N deeper cargo slots carry goods this settlement has not yet handled"*,
and `N` is counted by `if (!ttResKnown(sl.res)) hiddenSlots++`. **`ttResKnown` is a resource
*visibility* test.** The sentence claims a *capability*, and **the codebase already has the
capability test**: `slotAvailable(fid, i)` (`index.html:4231`) checks the craft exists and its
`show()` passes.

**That is exactly Jerry's Piltover case:** the 10-caravan slot pays support beams, the beam craft
is unlocked and buildable, but if he has not yet *held* a beam the slot is still counted as goods
the settlement "has not handled". **Swap the test to `slotAvailable`.** The two tests disagree
precisely on "can craft it, has not yet made one", which is the reported bug.

### 6.3 Trades cost provisions (dev note 11)

`tradeCost(f)` (`index.html:4263`) copies the faction's own cost and applies two discounts;
**no faction costs provisions.** Jerry wants a provisions cost large enough that the provisions
ceiling limits how many caravans can be sent at once, and suggests **5,000**.

**Ship 5,000 as a shared constant, not per-faction**, and **check it against the ceiling at the
year trades open**, which is the whole point of the note: a cost that only bites at Icathia is not
a limiter. **Report the provisions cap and the affordable-caravans count at `firstTrade`, Sparks
and Icathia.** If 5,000 does not bind at `firstTrade`, say so and give the figure that would —
Jerry asked for judgement here and the judgement needs the measurement.

**Interacts with the Storehouse line and with `eatCut`.** A hard provisions sink changes what the
Granary is for. Report provisions time-at-cap before and after.

### 6.4 The typo (dev note 4)

`index.html:8588` — `' civilisation' + (... > 1 ? 's are' : ' is')`. The spelling is British and
**consistent with `index.html:3572`**, so this is a house-style choice rather than an error.
**Ship `civilization` in both places** per Jerry's note, and **grep for the rest of the -ise/-ize
family in one pass** so the file ends up internally consistent rather than half-converted.

**Pass conditions:** trade yield is one additive uncapped category, asserted; trade income and
`firstTrade` reported before and after; `hiddenSlots` uses `slotAvailable`, asserted on the
craft-unlocked-but-never-held case; provisions cost shipped with the binding check at three
milestones; both spellings fixed and a repo-wide consistency grep recorded.

---

## Part 7 — Cataloguing and The Great Index become different things (dev note 2)

**Both complaints are exact.** `cataloguing` and `greatIndex` each contribute **0.02** to the same
`ARCHIVE_RATIO_LINE` (`index.html:2035`), so they are the same effect; and `greatIndex` sits on
`callToArms` alongside `crossReferencing`'s `ritesOfTargon`, which is why two of the three arrive
together.

**Jerry's proposal is achievable at semi-parity, and here is the honest accounting.** Kittens'
shape is *"a building's count amplifies another building's science max"*, and the source ships
exactly one such pairing: **Observatory → Library** (`js/buildings.js:579–580`,
`effects["scienceMax"] *= (1 + observatory.on * libraryRatio)`), fed by three upgrades at 0.02
each. **RR's `archive` is the Library analogue and its `observatory` is the Observatory analogue,
so RR currently holds the source's pairing exactly.**

**Ship this, which keeps the source's own pairing alive rather than trading it away:**

| upgrade | tech | effect |
|---|---|---|
| `cataloguing` | ritesOfTargon | **Academies** raise the **Archive's** knowledge cap, 0.02 each |
| `crossReferencing` | ritesOfTargon | **Observatories** raise the **Archive's** knowledge cap, 0.02 each — **the source's pairing, kept** |
| `greatIndex` | **sparks** | **Observatories** raise the **Academy's** knowledge cap, 0.02 each |

- **Σ stays 0.06 across three upgrades**, which is Kittens' three-reflector total taken, not
  tuned. **The magnitude parity is preserved exactly**; only the pairings change.
- **`crossReferencing` retains the literal source pairing**, so the ledger keeps a genuine PARITY
  row rather than three RR-original ones. **This is why the middle upgrade, not the first, keeps
  the original job.**
- **`greatIndex` moves to `sparks`** (20,000 knowledge + steel 200), which separates it from
  `crossReferencing` by a full era and is Jerry's stated ask.
- The two new pairings are **shape-PARITY, pairing-RR-ORIGINAL** — the mechanism is the source's,
  the choice of which building amplifies which is RR's. **Ledger them that way; do not claim full
  parity.**

**Predict before running:** the Academy→Archive term is the largest of the three in practice,
because RR builds more academies than observatories. **Report the knowledge ceiling at each
milestone and the Morellonomicon compounding**, since the building subtotal is that clamp's base.

**Pass conditions:** three distinct effects, asserted; Σ = 0.06 asserted; `crossReferencing` still
carries the Observatory→Archive pairing with `js/buildings.js:579–580` cited; `greatIndex` on
`sparks`; knowledge ceiling reported at every milestone with the compounding.

---

## Part 8 — The fourth mana multiplier goes on Petricite Masonry (dev note 3, revised)

**Jerry's correction is right and I should have caught it when I wrote the first draft.**
`leylineCalibration` is already on `sparks` (`index.html:2293`, `tech: "sparks"`, `req:
"arcaneFocus"`), so the first draft would have put **two** mana discoveries on one tech. **One
mana discovery per tech, and Sparks keeps Leyline.**

**The new rung goes on `petricite` — Petricite Masonry** (`index.html:1098`, 65,000 knowledge +
65 morellonomicons, `req: "smelting"`). That is a good home on three counts: it is comfortably
after Sparks (20,000), it is the tech whose whole flavour is *stone that drinks magic*, and its
own price already runs through the scribal chain, so a mana rung there sits with its own fiction.

| | |
|---|---|
| tech | **`petricite`** (65,000 knowledge) |
| cost | **`{ crystals: 400, hexgear: 25 }`** — crystals per Jerry's original note, and see Part 11 |
| effect | **+0.25 to `boosts.mana`**, additive into the existing accumulator |

**0.25, and the accounting travels with it.** Kittens' `<res>GlobalRatio` — the only category
with RR's scope — has **two members in the entire game, at 0.30 and 0.25**. RR's `boosts.mana`
becomes **Σ 1.00 across four members**. That is four against two, and 3.3× the source's largest
single member.

**This reverses the v0.60 ruling and that is fine — but it should be on the record.** v0.60 §6
recorded Jerry's note 5 as *"hold the line on Mana"* and Σ0.75 was left untouched on that basis.
Dev note 3 supersedes it. **Ledger the reversal with both notes cited**, so a future round does
not read the v0.60 row as still current.

**Do not create a fourth multiplicative category.** It lands in `boosts.mana` with the other
three. That accumulator being additive is the one thing about RR's mana line that is already
right, and Part 11 is about not making that mistake anywhere else.

**Pass conditions:** the discovery ships on `petricite` with a crystal cost; **`sparks` still
carries exactly one mana discovery, asserted by counting** rather than by naming Leyline;
`boosts.mana` measures **Σ 1.00 exactly** with all four held, on a settlement with **zero
arcanists** — the only fixture that distinguishes a global boost from a job-scoped one; the
ledger row records four members against the source's two and cites both of Jerry's notes; mana
production reported at each milestone.

---

## Part 9 — Drake and Baron hunts cannot be undone (dev note 6)

`runExpedition()` snapshots undo for every expedition. The Drake Hunt and Baron are the two
highest-variance deeds in the game — 900 and 2,600 vigor for 15 and 40 renown plus a drake soul —
and an undo on a bad roll is a re-roll of the most valuable random outcome in the game.

**Ship a `noUndo: true` property on the expedition**, tested in `runExpedition()`, exactly as
`noDiscount: true` already works — **a property of the expedition, not a special case in the
caller**, so the next high-value hunt is one field rather than an edit to shared code.

**Check the re-roll penalty interaction.** `clearRerollPenalty("hunt", "war-band")` already exists;
confirm that suppressing undo does not leave a penalty that only an undo used to clear, and assert
it.

**Pass conditions:** `noUndo: true` on `drakeHunt` and `baron`; the undo toast does not appear for
either; every other expedition still undoable; the re-roll penalty asserted clean after a
no-undo hunt; **the property is read from the expedition, not branched on id.**

---

## Part 10 — Post-Sparks discoveries take Hextech Crystals (dev note 4, new)

**Measured: 33 discoveries sit on techs at or after Sparks, and only 4 of them — 12% — cost
crystals.** Three of those four are the Manufactory line v0.59.1 repriced. So after Sparks, the
game's signature Era-3 resource is almost absent as a research currency.

**And this is the source's own pattern, not an RR invention.** A census of `js/workshop.js`:
**106 of Kittens' 171 priced workshop upgrades — 62% — carry a scarce converted or crafted
component** (titanium, unobtainium, eludium, alloy, blueprint, starchart, concrate, thorium).
`astrolabe` is titanium 5 + science 25,000 + starchart 75; `titaniumMirrors` is titanium 15 +
science 20,000 + starchart 20; `unobtainiumReflectors` is unobtainium 75 + science 250,000 +
starchart 750. **Kittens prices its late upgrades in a scarce converter output as a matter of
course, and RR's crystals are exactly that shape** — a converter product, capped, mid-tier.
Titanium is even produced the same way: `titaniumPerTickAutoprod: 0.0005` on the Calciner.

**Bring RR from 12% to roughly the source's 62%** — about twenty of the thirty-three.

### 10.1 This is also the crystal sink the project has been looking for since v0.58.1

**Three rounds have tried to make crystals scarce by raising a per-tick burn and all three
failed**, most recently at 96.2% time-at-cap after a ×6 on `MANUFACTORY_FUEL`. §24's own
classification says why: **crystals are a stock with no lumpy sink**, and a smooth per-tick burn
against a large faucet is a rounding error at every scale.

**A research cost is a lumpy sink, and lumpy sinks are what move a stock's time-at-cap.** It
draws the stockpile down in single large bites at exactly the moment the player has banked it,
and it does so without touching a production constant. **Report crystals-at-cap before and after —
this is the measurement three rounds of fuel changes could not produce.**

### 10.2 Sizing

**Scale the crystal component with the tech's knowledge rung**, so it stays meaningful as income
grows rather than being trivial by Icathia:

```
crystals ≈ round( K / 100 )      // K = the tech's knowledge price
```

which gives 200 at Sparks (20,000), 650 at Petricite (65,000), 1,000 at Deep Works (100,000),
1,350 at Icathia (135,000). **The four discoveries that already cost crystals keep their current
figures** — Pressure Regulators 600, The Rolling Press 450, The Automated Workshop 900,
Hexresonance 80 — because those were sized deliberately at v0.59.1 and re-deriving them would
discard that work.

**Do not add crystals to every discovery.** The ones that should carry it are those whose fiction
is hextech or industry; the timber and stone lines should stay on their own chains, exactly as
Kittens leaves `barges` on blueprint+titanium but keeps its catnip upgrades on catnip. **State
which twenty were chosen and why**; a rule that hits all thirty-three is a tax, not a sink.

**Pass conditions:** post-Sparks discoveries carrying crystals rises from **4 to ~20**, the share
reported against the source's 62%; the rung-scaled rule stated and applied; the four existing
figures unchanged; **crystals-at-cap and crystal time-at-cap reported before and after at every
milestone**; total crystals spent on research reported as a share of crystals produced.

---

## Part 11 — RULING REQUESTED: the multiplicative category count (Jerry's question)

**Jerry asked whether RR's multiplicative categories can be made additive, what that would do,
and whether RR can keep them and still resemble Kittens. This Part carries the measurement so he
can rule; it ships nothing on the analyzer's say-so (§16).**

### 11.1 What RR actually multiplies

Measured on a state with every tech, every upgrade, every drake maxed, all ten champions at level
10, full worship and thirty of every monument building:

| stack | terms | product | **if collapsed to one additive category** |
|---|---|---|---|
| `global` | `catMonument` ×4.30 · `catReligion` ×1.195 · `catPolicy` ×1.00 · `catMeta` ×1.25 · `catBuff` ×1.00 | **×6.42** | ×4.75 |
| `convMult` | infernal ×1.495 · clockworkBellows ×1.25 · bankedCoals ×1.15 · resonanceCoils ×1.25 · overseer ×2.00 | **×5.37** | ×3.15 |
| **combined** | | **×34.51** | **×14.92** |

**A converter output passes through roughly eleven multiplicative factors.** Collapsing all of
them into a single additive category gives **×6.89 against the current ×34.51 — the shipped stack
is 5.0× a fully additive one.**

### 11.2 The answer to "can we, and should we"

**Yes mechanically — but "make it all additive" is the wrong target, because Kittens is not
additive either.** `game.js:3409–3440` multiplies four categories against each other:
`<res>GlobalRatio`, `<res>Ratio`, `<res>RatioReligion`, `<res>SuperRatio`, with `<res>JobRatio`
added into village production before them. **Kittens' Law as this project states it — additive
within a category, multiplicative between — is literally the source's code.**

**The divergence is the CENSUS, not the principle.** In Kittens, for any given resource, **one or
two of those four categories are live** — `<res>GlobalRatio` has 2 members in the whole game,
`<res>SuperRatio` has 1, `<res>RatioReligion` has 2 keys. For most resources the only non-empty
category is `<res>Ratio`, and it reaches **×3.70** (`calcinerRatio`) to **×5.35** (`barnRatio`).

> **RR's combined ×34.5 is 9.3× the source's single live conversion category.** Not because any
> RR number is large — the three conversion Discoveries are at **49% of the source's** (Part 1) —
> but because **RR gives each individual upgrade, drake, champion system and buff its own
> category.** Kittens has categories that are *kinds of effect*; RR has categories that are
> *individual effects*.

### 11.3 The move that is actually available

**Group RR's eleven factors into four source-shaped categories** — buildings/monuments, religion,
meta/prestige, and one "upgrades and systems" category holding the conversion Discoveries, drakes
and champion affinities additively:

| | product |
|---|---|
| shipped | ×34.51 |
| **four source-shaped categories** | **×20.20 — a 41% cut** |
| fully additive (one category) | ×6.89 — an 80% cut |

**What it would do to the game, stated honestly:**

- **It is a late-game change only, and that is a feature.** Early on almost every factor is 1.0,
  so a product and a sum are the same number. The gap opens only as the stack fills. **The first
  two hours — Part 2's problem — do not move at all.**
- **It compresses the dynamic range**, which is the deeper reason Kittens *feels* different: in
  the source, late numbers grow because you own **more buildings** (linear in count), not because
  multipliers compound. RR currently gets both.
- **It would lengthen Era 3, and Era 3 is already lengthening.** 785.9 → 1,172.5 over one round.
  A 41% cut to late production plausibly puts Era 3 back into the **1,400–2,300 band Jerry
  retired at v0.59** — which may be welcome or may not, but it is the consequence and it must be
  measured, not assumed. **This is the single largest pacing lever anyone has proposed in this
  project and it should not ship in the same round as Part 2's ladder re-price.**

**Recommendation: rule the principle now, ship it in its own round.** The principle — *a category
is a kind of effect, not an individual effect, and RR targets four* — is a standing ruling worth
having. The implementation is a round of its own with the ensemble to itself, because it moves
every production number in the game and nothing else in v0.61 should be entangled with it.

**Pass conditions for THIS round:** the measurement above recorded in `STANDING-RULINGS.md` as an
open question with its figures; **no category collapsed this round**; a ledger row naming the
eleven-factor stack as a standing structural divergence with the ×9.3 comparison; Part 1's
additive-Discoveries change is the *only* composition change that ships, and it is inside a single
category rather than across them.

---

## Part 12 — Order, discipline, pass conditions

### Order

1. **Part 1's readout** — the term-by-term decomposition. Instrument first; two rounds have now
   mis-diagnosed this stack.
2. **Part 2** — the early ladder. It is the round's largest player-facing change and everything
   downstream of population moves with it, so it wants the ensemble to itself.
3. **Part 5** — the renown economy, all three notes in one slice. **They do not decompose:** 5.1
   cuts and 5.2 adds, and a prefix with only one measures a game that will not ship.
4. **Part 6** — trade. 6.1 is a real balance change; 6.2–6.4 are corrections and ride along.
5. **Parts 7, 8, 9, 10** — the knowledge split, the mana rung on Petricite, the undo guard, and
   the crystal research costs. **Part 10 wants its own measurement slice**: it is the first
   credible crystal sink and its effect on time-at-cap is the round's cleanest result.
6. **Parts 3, 4, 11** — the ledger argument pass, the learning-rate rows, and the category-count
   measurement. **Rows and rulings; no game numbers move, and Part 11 explicitly ships nothing.**

### Operational

Median and spread for every milestone claim (§25). `--years N --seeds 3`. Classify with §24
before sizing any ceiling. Strip comments before grepping. **Clone Kittens; pin the revision.**
`nproc` is 2 — the ensemble needs the box. Push via the token-remote recipe and scrub the token.

### Round pass conditions

| # | Condition | Target |
|---|---|---|
| 1 | `convMult` readout | term by term at every milestone; ceiling asserted **×5.3728** / **×8.0590** with cinder |
| 2 | Conversion Discoveries | one additive category, Σ0.65 → ×1.65; ledgered vs `calcinerRatio` |
| 3 | The ×19.77 row | corrected as `convMult × (1 + boosts.crystals)`, two categories |
| 4 | `MANUFACTORY_FUEL` | **still unchanged** |
| 5 | Early ladder | +1.25% rung at **×1.00–×1.20**; every rung's ratio reported; **top rung unchanged at 11,500** |
| 6 | RR-ORIGINAL rows | all 85 argued EASIER/HARDER; generator **aborts** on RR-ORIGINAL + UNVERIFIED; split scored |
| 7 | `hextechFoundry` | re-pointed to `calciner`; the `globalBoost` clause ledgered separately |
| 8 | Jarvan / Academy | both ledgered; ×1.97 vs ×2.00 stated; Academy `skillXP` specified not shipped; **no XP magnitude moved** |
| 9 | Hunt renown | one `RENOWN_PER_VIGOR`; table asserted; Scouting exempt and ledgered |
| 10 | Festival | 25 via `gainRenown()`, `callToArms` gate asserted; **net of 9 and 10 stated** |
| 11 | Trade tooltip | shows resolved renown including Caitlyn |
| 12 | Trade yield | one additive uncapped category; income and `firstTrade` before/after |
| 13 | `hiddenSlots` | uses `slotAvailable`; asserted on craft-unlocked-but-never-held |
| 14 | Trade provisions cost | shipped; **binding check at `firstTrade`, Sparks, Icathia**; provisions time-at-cap before/after |
| 15 | Spelling | both sites; repo-wide consistency grep recorded |
| 16 | Knowledge line | three distinct effects; Σ0.06; `crossReferencing` keeps the source pairing; `greatIndex` on `sparks` |
| 17 | Mana | Σ **1.00** exactly, zero arcanists; ledger row records four members vs the source's two and the reversal |
| 18 | Undo | `noUndo: true` read from the expedition; re-roll penalty asserted clean |
| 19 | Post-Sparks crystal costs | 4 → **~20** discoveries; share reported vs the source's 62%; rung-scaled rule stated; the four existing figures unchanged |
| 20 | Crystals | **time-at-cap and crystals-at-cap before and after**, every milestone; research spend as a share of production |
| 21 | Sparks mana discoveries | **exactly one**, asserted by count |
| 22 | Category count | measurement recorded in `STANDING-RULINGS.md` as an open question; ledger row with the ×9.3 comparison; **no category collapsed this round** |
| 23 | Unchanged | `capFamilyOf()` two families · audits 0/0 · Σ 4.35/1.80 · `CONSUMPTION` 4.25 · ratio 1.17647 · `XP_PER_SECOND` 0.05 |
| 24 | Every Part | actioned, or its non-action explicitly justified |

### Predicted vs measured — medians of three, with spreads

| slice | Era 3 median | spread | note |
|---|---|---|---|
| v0.60 baseline | **1,172.5** | ×1.92 | the report's figure; **my ensemble had not finished at hand-off** |
| s1: `convMult` readout + additive Discoveries | **+10 to +40** | unchanged | ×1.797 → ×1.65 is a 8% cut to every converter output |
| s2: early ladder re-priced | **−150 to −40** | **may NARROW** | the first rung at ×3.50 → ×1.0 compounds through every job for the whole run; this is the round's dominant term |
| s3: renown (5.1 cut + 5.2 festival) | **−20 to +60** | may widen | champions are threshold crossings on a bursty resource — the v0.60 decomposition showed this channel carries 59.5% of the spread |
| s4: trade (uncapped additive + provisions cost) | **−60 to +80** | | two changes in opposite directions; **the sign is genuinely unknown** |
| s5: knowledge split + mana + undo | **−40 to −10** | unchanged | a higher knowledge ceiling pulls late techs forward |
| s6: crystal research costs | **+20 to +90** | unchanged | ~20 discoveries gain a real price at the rung they sit on; **the first change that should move crystals-at-cap off 96%** |
| **shipped** | **950–1,200** | **report it against ×1.92** | |

**The spread is still the open question and Part 2 is the term most likely to move it.** v0.60
established that 59.5% of Sparks' excess spread is the champion channel and **0.0%** is the
Manufactory. **Early skill bonuses feed every job's output, so re-pricing the first rung acts
upstream of the champion channel** — if s2 narrows the spread materially, that is a third cause
nobody has named, and it should be reported as a finding rather than absorbed into the median.

**And one prediction I expect to be wrong.** I predict Part 6.1's additive trade yield is a *net
buff*. It may well be a nerf at low caravan counts, because four multiplicative terms near 1.0
exceed their additive sum, and `firstTrade` lives exactly there. **If `firstTrade` regresses, the
source's shape is still right and the fix is the magnitudes, not the composition** — say so rather
than reverting to the multiplicative form.

---

## Sources, all read this session

**Line numbers pinned to `nuclear-unicorn/kittensgame` at `c52985b` (2026-08-04), cloned to disk.**

**Kittens:** `js/diplomacy.js:250` and `:744–747` — `getTradeRatio()` and the `tradeRatio` sum,
**additive and uncapped**, the answer to dev note 8; `js/buildings.js:1679` — the tradepost's
`tradeRatio: 0.015` per copy; `js/challenges.js:326` — the only `Math.min` on trade yield, inside
the pacifism challenge; `js/buildings.js:628` — the Academy's `skillXP: 0.0005`, the only additive
contributor to that effect; `js/village.js:3228` — `baseSkillXP = 0.01`; `js/buildings.js:579–580`
— the Observatory→Library `scienceMax` pairing, three upgrades at `libraryRatio: 0.02`;
`js/buildings.js` — the `calciner`'s `mineralsPerTickCon: -1.5`, `oilPerTickCon: -0.024`,
`ironPerTickAutoprod: 0.15 * (1 + calcinerRatio)`, and `calcinerRatio` Σ**2.70** across three
upgrades — the like-for-like line for Part 1.

**RR**, at the v0.60 tag: `index.html:5426–5433` — `convMult`, decomposed term by term on a maxed
state; `:1641` `ERA3_AFFINITY` and `:1631` `champPassive`, the ×2.00 overseer ceiling and its
level-10 cap; `:3235/:3241/:3242` — `XP_PER_SECOND 0.05`, `XP_CAP = Math.floor(11500*20001/9000)`,
`RANKS` to Challenger 11,500; `:1503` — Jarvan's `{ key: "xp", base: 25 }`; `:4072–4080` —
`tradeYieldMult` and `caravanYieldMult`'s two ceilings; `:4231/:4238` — `slotAvailable` and
`slotUnlocked`; `:8711` — the `ttResKnown`-gated "deeper cargo slots" line; `:4263` — `tradeCost`;
`:2035` — `ARCHIVE_RATIO_LINE`; `:3788` — `abyssJourney`, renown 5 at 120 vigor; `:4883` —
`holdFestival()`, granting no renown; `:5447` — `monumentSum` and the five global categories;
`:8588` — the spelling.

**Measurements taken this session:** all 31 suites re-run from disk and parsed from their own
`SUITE-END` trailers (**1,615 passed, 0 failed, no missing trailer, no skipped call site, no
non-zero exit**); `tools/parity-ledger.mjs` re-run (**226 / 72 / 41 / 2 / 111**, triage
**26 / 85 / 0**, exact); an independent reproduction of the report's bonus-matched ladder table
(all six ratios exact) and of the XP arithmetic (63.89 h, `XP_CAP` 25,556, gaps 2,700 / 4,000); a
live probe measuring `convMult` term by term on a fully-maxed state (**×5.3728**, and the overseer
term capped at exactly ×2.000 by the level-10 cap); a table of every expedition's renown against
its vigor cost. **The three-seed ensemble was launched at the start of the session and had not
finished at hand-off — every Era-3 and milestone figure quoted here is v0.60's own, labelled as
such.**
