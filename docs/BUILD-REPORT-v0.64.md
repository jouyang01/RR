# BUILD REPORT v0.64 — the housing wall was real, the rails shipped, and a shipped effect was doing nothing

Built against BUILDER SPEC v0.64 (`docs/specs/rr-analyzer-v064-spec.md`) plus Jerry's four dev
notes. Tagged `v0.64`.

---

## 0. THE HEADLINE

**Every Part of the spec is actioned and every one of Jerry's four dev notes shipped exactly as
directed.** The round's three substantive findings, in the order they matter:

1. **Part 1.2a's ceiling relief is REAL and MEASURED — the two-tier population ceiling goes
   59 → 69 at a mid-run storage line, and the Longhouse stops being ceiling-bound entirely.** But
   at 300 game-years it changes *nothing else*: s1 reproduces s0's milestone years **to the
   digit**. The settlement was standing 12 Longhouses against 29 it could afford. **The ceiling
   was not binding in the early game; it binds late, which is exactly where completion lives.**
2. **Retiring `DISCOVERY_RUNG_CAP` (Part 5) is the ONLY change in the round that moves an early
   milestone, and it moves one the wrong way: Rites of Targon 61.1 → 103.4 on seed 1 at 300
   years.** That is the honest price of the parity restoration — the generated Discoveries return
   from the cap's 0.34 × K to the source-shaped 0.80 × K — and it was not predicted.
3. **Dev note 1 exposed a shipped effect that had been doing nothing at all.** v0.63 Part 3.2's
   Demacian Accord (+8.5% timber and ore) was applied by a `for...in` over an object literal that
   had no `timber` or `ore` key. **Measured on the v0.63 tag: +1.0%, which is `catPolicy`'s
   generic government term, and 0.0% of the advertised 8.5%.**

**And one number is much larger than anything in the spec.** Dev note 2's converter ruling takes
the three Zaun extractors' conversion multiplier from **×2.951 to ×9.738 — ×3.30** on a maxed
state. That is the largest single production change in the round and it lands squarely on the
Era-3 raws.

---

## 1. Part 1 — the housing ladder

### 1.1 What shipped

`index.html` Longhouse: `cost: { timber: 220, ore: 260 }`. The `provisions: 1200` component is
deleted. Nothing else on the building moved — ratio 1.15, `pop: 1`, `caps: { vigor: 50 }`, tech
`carpentry` — because every one of those is already the source's own figure.

**The citation, pass condition 4.** `js/buildings.js:476–487` @ `c52985b`:

```
name: "logHouse", label: "Log House",
prices: [ { name: "wood", val: 200 }, { name: "minerals", val: 250 } ],
priceRatio: 1.15,  effects: { "maxKittens": 1, "manpowerMax": 50 }
```

**Two materials and no food component of any kind.** RR's third component was RR-original and it
was the only housing cost in either game priced against the FOOD ceiling.

### 1.2 The decomposition, and pass condition 5's number before and after

The instrument HANDOFF v0.63 §6 asked for by name, printed at every milestone. Seed 1 at 300
game-years, on the two builds that differ only in this line:

| | s0 (v0.63) | **s1 (1.2a)** |
|---|---|---|
| Shelter | 11 copies → 22 pop, **max 15 → 30 pop** | 11 → 22, max 15 → 30 |
| Longhouse | 12 copies → 12 pop, **max 29 → 29 pop** | 12 → 12, **max 39 → 39 pop** |
| Skyrise Terrace | 0, not yet visible | 0, not yet visible |
| **TWO-TIER CEILING** | **59** | **69** |
| binding resource on the next Longhouse | **ore** (stock) | **ore** (stock) |

**The ceiling moves +10 at this point in the run and grows with the storage line from here** — at
a fully-built storage line the tier goes from a hard 48 copies to over 400, which is the figure
`test-v64` asserts. **The Longhouse is no longer ceiling-bound by anything.**

### 1.3 AND THE CENTRAL PREDICTION IS ONLY HALF CONFIRMED — SAY SO PLAINLY

The spec's prediction for s1 was **peak population +25 to +60**. At 300 game-years, seed 1:

> **peak population 37 → 37. Rites of Targon 61.1 → 61.1. First champion 206.3 → 206.3.
> BYTE-IDENTICAL.**

**The settlement was standing 12 Longhouses against the 29 the old ceiling already allowed.** A
ceiling that is not being pressed against cannot be relieved. **The early-game population wall is
not the housing CEILING — it is timber and ore throughput**, which is what the decomposition's
`stock-bound — ore` line says on both builds.

**That reproduction is also this round's §32 neutrality proof.** A change that alters no random
draw reproduces its predecessor's seeded figures to the digit; s1 does, so every slice from here
is attributable.

**Whether the ceiling binds at 2,500 years — where Icathia and the 150–220 band live — is the
ensemble's question, not this one.** §11 answers it.

### 1.4 Part 1.2b — NOT SHIPPED, and the spec's own condition is why

The spec makes 1.2b conditional: *"bring the third tier forward, **only if 1.2a does not clear the
gate**"*, and it is explicit that the source-shaped move is the tech rung rather than the price.
**A conditional Part cannot be evaluated before the ensemble it is conditioned on**, and shipping
it in the same round would have made 1.2a unattributable — which is the exact failure v0.62
recorded and v0.63's §0.1 rule exists to prevent. It is the analyzer's first item in §13.

---

## 2. Part 2 — Option B, the rails

### 2.1 What shipped

`BOOST_LIMIT` — **vigor 1.0 → 8.0, devotion 2.0 → 5.0, provisions 1.5 → 3.0, mana 1.0 → 2.0.
Crystals 2.0, gold 1.5 and culture 2.0 UNCHANGED** (pass condition 6). Both source citations are
at the site: `game.js:3429–3440` (not one of Kittens' five production-boost categories passes
through `getLimitedDR` at all) and `js/religion.js:1548–1550` (Solar Revolution, limit **10**
against a reachable **~4.5** — the rail pattern being copied).

### 2.2 Measured, on one fixture, before and after

Same maxed fixture on both builds, so the columns are like-for-like:

| family | L before → after | raw Σ | delivered before → after | **thrown away before → after** |
|---|---|---|---|---|
| **vigor** | 1.0 → **8.0** | 2.701 | 0.972 → **2.701** | **64% → 0%** |
| **devotion** | 2.0 → **5.0** | 3.024 | 1.877 → **3.024** | **38% → 0%** |
| **mana** | 1.0 → **2.0** | 1.215 | 0.913 → **1.215** | **24.9% → 0%** |
| **provisions** | 1.5 → **3.0** | 0.700 | 0.700 → 0.700 | 0% → 0% |
| crystals | 2.0 → 2.0 | 0.900 | 0.900 | 0% → 0% |
| gold | 1.5 → 1.5 | 1.031 | 1.031 | 0% → 0% |
| culture | 2.0 → 2.0 | 0.337 | 0.337 | 0% → 0% |

**Pass condition 9 — no per-copy source rate is re-priced.** The knowledge line is still
hexLab 0.35 / observatory 0.25 / academy 0.20 / archive 0.10, Kittens'
biolab/observatory/academy/library exact; the Sanctum is still 0.10 devotion, the Training Ground
0.10 vigor, the Irrigation Channel 0.03 provisions. `test-v64` asserts all seven.

### 2.3 THE RAILS ARE INERT BEFORE YEAR 300, AND THAT IS THE DESIGN WORKING

s3, s4 and s5 — the provisions rail, the vigor rail, the devotion+mana rails — return
**identical figures to s2 at 300 game-years on seed 1**: peak population 41, Rites 103.4, first
champion 134.6, and the same milestone table throughout. The knee audit says why: at 300 years
provisions carries Σ0.82 against the OLD knee of 1.125 and vigor carries Σ0.40 against 0.75.
**No family has reached its old knee yet, so raising the ceiling above it cannot do anything.**

**This is the property Option B was chosen for.** The first hours do not move at all — which
matters, because Jerry ruled at v0.61 that the early game is fine as it is. The rails' entire
effect is late, where the stacks fill.

### 2.4 DISAGREEMENT, RECORDED PER PROJECT PRACTICE

**On `test-v62`'s maxed static fixture — which stacks twenty of every building AND every policy —
devotion reaches Σ4.024 against the new knee of 3.750 and still discards 1.2%.** The spec sized
the devotion rail from the end-of-run raw Σ of 3.550, and `ceil(3.550 ÷ 0.75) = 4.73 → 5.0`. On
the harsher fixture the rule would have given 6.0.

**The spec's 5.0 ships as specified and I think it is right anyway**, for v0.62's own reason: the
static probe is not the instrument, the end-of-run audit is. A settlement holding twenty of every
devotion carrier at once is not a state any measured run reaches. **1.2% discarded against 46.4%
is the item.** Recorded here rather than silently substituted.

### 2.5 Pass condition 8 — ONE ENSEMBLE PER FAMILY: NOT MET, AND REPORTED AS NOT MET

The spec asks for **one full ensemble per family, in the stated order, each reported separately** —
five ensembles for the round. **Jerry's session protocol for this build supersedes it:** one fast
single-seed short-length pass per part, and the complete multi-seed suite **once**, at the end, as
the round's only gate.

**What ships instead is one attributable cumulative-prefix SLICE per family** — s3 provisions, s4
vigor, s5 devotion+mana, in the spec's order — each run single-seed at 300 game-years and reported
separately in §2.3. **That is weaker than what the spec asked for and the weakness is specific:
the rails are late-game changes and a 300-year slice cannot see them.** The three families are
therefore attributable to each other only in the sense that all three are provably inert early;
their late-game separation is not measured this round. §13 carries it forward.

---

## 3. Part 5 — the rung cap is retired, and it COSTS an early milestone

### 3.1 What shipped

`DISCOVERY_RUNG_CAP` and its load-time IIFE are **gone at grep level**. The generated Discoveries
return to exactly **0.8 × K**. The two authored figures outside Kittens' per-upgrade band are
re-based by hand to its p75 of 1.00: **`greatLibrary` 40,000 → 12,000** and **`masterOfTheHunt`
12,000 → 3,600**.

**The argument, and it is the analyzer's own and the builder's own:**

| | Kittens @ `c52985b` |
|---|---|
| **per-UPGRADE** science ÷ its unlocking rung | **IQR 0.73–1.00, median 0.87 — TIGHT** |
| **per-RUNG** total upgrade science ÷ the rung | **0.30 – 8.19 — NOT A RULE** |

A rung's total is just per-upgrade × how many upgrades sit on it, and the source puts up to six on
one tech. **Half of Kittens' own rungs exceed 2.43×.** And the cap cut the wrong members: on
`ritesOfTargon` it took the same 42% off an authored outlier at 3.33× *and* off three generated
members sitting at 0.80× — dead centre of the source's spread — taking them to **0.34×, far below
the source's p25 of 0.73**.

**−36,400 taken entirely from the two figures outside the source's spread, against the cap's
−47,959 taken mostly from members that were already correct.**

### 3.2 Measured — and this is the round's one regression

Seed 1 at 300 game-years, s1 → s2, the only difference being this Part:

| | s1 | **s2** | |
|---|---|---|---|
| Rites of Targon | **61.1** | **103.4** | **+42.3 — a real delay** |
| first champion | 206.3 | **134.6** | −71.7 |
| peak population | 37 | **41** | +4 |

**Rites of Targon is the milestone the previous round fought to bring under 75 and it goes back
over 100.** That is exactly what the Part does by construction: `ritesOfTargon`'s three generated
Discoveries go from the capped 0.34 × K back to 0.80 × K, so the early knowledge ladder is
heavier again. **The spec predicted "s2: 0 to +5 peak population, Icathia unchanged" and said
nothing about Rites; +4 population is right and the Rites cost was not anticipated.**

**I would ship it again, and the reason is §16.** The cap was an RR-invented rule bounding a
quantity the source does not hold constant, and it was making the generated Discoveries *cheaper
than the source's own p25*. Restoring parity has a price and the price is legible. **But the
analyzer should decide whether Rites-under-75 or per-upgrade parity is the target, because this
round cannot have both.**

### 3.3 The census, reconciled (pass condition 13)

Two joins were in play across three rounds — the analyzer's (median 2.43 / max 8.19 / whole-game
0.50) and the builder's (median 2.07 / max 6.25 / whole-game 0.470). **The join now pinned is
`tools/kittens-upgrade-census.mjs`'s**, recorded at the site: an upgrade joins to the tech named in
its own unlock field; rungs with no science price are EXCLUDED from the per-rung distribution
rather than counted as zero; upgrades whose unlocking tech has no science price are dropped from
both numerator and denominator.

**Neither census governs anything any more, because the cap they were arguing about is retired.**
The live invariant is the per-UPGRADE band, and RR sits inside it:

- **RR's per-upgrade median: 0.80**, against the source's IQR 0.73–1.00 (median 0.87). Pass
  condition 12, asserted after every load-time mutation.
- **Two residual outliers, both AUTHORED and both named rather than hidden by the median:**
  `standingOrders` at 0.10× (dev note 4's merged-research accounting) and `chemtechDistillation`
  at 1.36× (authored v0.58). **Every GENERATED member sits exactly at 0.80.**
- **Whole-game: RR carries 106,010 discovery knowledge against 1,442,630 tech knowledge —
  0.0735, against the source's 0.470–0.50. RR is at about a SIXTH of the source's share**, so the
  retirement moves toward the source and nowhere near past it.

---

## 4. Part 3 — the era-tier audit, then the gates

### 4.1 THE AUDIT, REPORTED BEFORE ANY COST MOVED (pass condition 15)

`tools/era-gate-audit.mjs`, run against the v0.63 tag. Era is the era of a building's own
unlocking tech, with boundaries at the milestone techs the pacing harness already measures on;
a GATE is a crafted material of the building's own era or the one immediately below it.

| era | buildings | gated | **ungated** |
|---|---|---|---|
| 1 | 26 | 4 | 22 — *expected: there is no previous tier to gate against* |
| **2** | **2** | **2** | **0 — 100%** |
| **3** | **21** | **17** | **4** |
| **4** | **2** | **2** | **0 — 100%** |
| **total** | **51** | **25** | 26 |

**THE FINDING THE SPEC WANTED READ BEFORE ANY COST WAS PROPOSED: of the 27 Era-2+ buildings, 23
already carried a crafted gate. The rule dev note 2 asks for was already 85% satisfied.**

### 4.2 Two of the four are join artefacts, and are REPORTED rather than fixed

- **Petricite Quarry** — `petriciteBlock 2` *is* a crafted gate; the linear era join under-rates
  it because the block's chain contains no Zaun raw. **And §5 protects this recipe as Kittens'
  quarry transliterated verbatim** (`stoneSlab 1000 + steel 125 + scaffold 50`, the largest lever
  in the project). Adding a component to satisfy an RR heuristic would break a verified parity
  port. **Left alone deliberately.**
- **Frostguard Cairn** — carries `poroTears`, the Freljord chain's own crafted good, and is that
  chain's first building. **The join cannot rank a PARALLEL regional chain against a linear era
  index**, and that limitation is stated in the tool rather than fixed into invisibility.

### 4.3 Two are genuine, and both are gated

- **3.1 Coalgas Vent takes `plating 8`** (the spec's dev note 1, directed). A Zaun-tier Era-3
  building priced entirely in Era-1 raws plus a little steel. `plating` is the Zaun chain's own
  first crafted good and unlocks on `sparks` — **a rung before the Vent's own `chemtech`**, so
  pass condition 16 holds by construction.
- **3.2 Hexcrystal Quarry takes `alloy 6`.** Its only crafted component was `gear`, an Era-1 tool
  craft two full tiers below it. `alloy` unlocks on `chemtech`, a rung below its own `hexcore`.

**Quantities are the source's shape.** Kittens' mansion is titanium 25 against slab 185 — the
crafted good is 12% of the line items and 100% of the gate, because the gate is the UNLOCK and not
the volume. **Existing bulk raws are kept; a gate is added, nothing is replaced.**

**After the gates: 27 gated, and the Era-2+ ungated population falls 4 → 2, both of them the
artefacts above. `auditCostGraph()` 0, `auditRawGraph()` 0** (pass condition 16).

**Measured pacing effect at 300 game-years: NONE.** s6 → s7 is identical on every figure, because
the bot has not reached `chemtech` at 300 years. The spec predicted "s6: −10 to 0, may regress";
the regression it warns about is an Era-3 build-out effect and lives in the ensemble.

---

## 5. Part 6 — the trade provisions cost

`TRADE_PROVISIONS` 5,000 → **3,500**, shared across every route, subject to neither discount.

**And the note's own test, answered with the number rather than with the constant.** Seed 1 at
300 game-years, s0 vs the shipped build:

| | 5,000 | **3,500** |
|---|---|---|
| provisions held / cap | 67,941 / 68,250 | 67,141 / 68,250 |
| provisions time-at-cap to date | 82.7% | **82.0%** |
| **caravans the CEILING allows** | **13** | **19** |
| caravans the STOCK allows | 13 | 19 |

**A SMALLER COST DOES NOT MAKE THIS A LIMITER — it makes it less of one.** v0.61 measured the cost
as never binding; it is less binding now. That is stated rather than claimed as a win.

**Separated from Part 1.2a as the spec requires (pass condition 19).** The two figures are: Part
1.2a moved the two-tier population ceiling **59 → 69** and changed provisions time-at-cap by
nothing measurable; Part 6 moved the allowed caravan count **13 → 19** and provisions time-at-cap
by **0.7 points**. Two changes, two figures, no combined claim.

---

## 6. Part 4 — mana, and Swain's two slots

**No fourth mana discovery shipped, and the measurement is why** (pass condition 17). Seed 1 at
300 game-years on the shipped build:

```
MANA BALANCE @final: net 26.2745/s = gross 33.4124/s − consumed 7.1379/s
                     consumed÷produced 0.2136
   held 9,968 / cap 14,843    consumers: 6× forge @ 0.05/s · 6× refinery @ 1/s
```

**Net mana is strongly positive and consumption is 21% of production.** The spec's condition is a
fourth discovery *only on a measured deficit, with the milestone that showed it named* — there is
no deficit to name. §11 carries all four milestones from the ensemble.

**And Part 2 answers the note without adding content, which is the spec's own observation.**
`BOOST_LIMIT.mana` was 1.0 and the three discoveries sum Σ0.75 — **exactly the knee**, so any
fourth member was the first that would not pay in full. The rail takes the knee to 1.50, so
**Swain's passive +12% and a future fourth discovery both pay face value now.**

**Pass condition 18 — Swain's two slots, ledgered as distinct:**

| slot | effect | applies |
|---|---|---|
| **passive** `champPassive("mana")` | **mana +12%** | **whenever he is RECRUITED** |
| **lead** `SWAIN_KNOWLEDGE_LEAD` | **knowledge +25%** | **only while he is LEADING** |

Two rows in the ledger, `swain` and `swain-lead`, **each naming only its own slot's magnitude**, so
a grep for either figure returns exactly one slot. `test-v64` asserts the greppability as well as
the distinctness, because the failure mode the condition names is a reader, not a value.

---

## 7. Superseded assertions, re-pointed with their superseding spec item

Per operational rule 10 — re-pointed, never deleted, each naming what superseded it.
**Fourteen this round, across thirteen suites.**

| # | suite | assertion | superseded by |
|---|---|---|---|
| 1 | `test-v36` | "`BOOST_LIMIT` is exactly the seven bounded stacks … `devotion === 2.0`" | **Part 2** — membership is the item and is unchanged; the magnitude was never this item's subject |
| 2 | `test-v36` | "50 and 200 Sanctums are bounded below +200%" | **Part 2** — asserts BOUNDEDNESS against `1 + BOOST_LIMIT.devotion`, computed rather than written |
| 3 | `test-v38` | "the RESOLVED trade price carries the shared provisions cost … `>= 5000`" | **Part 6** — reads `TRADE_PROVISIONS`; SHARED-ness is the claim, not the figure |
| 4 | `test-v44` | "Sump Ventilation no longer opens an ore slot — ore ×1.0" | **dev note 1** — ore is still ONE ADDITIVE category; the 5% is now visible on it at ×1.05 |
| 5 | `test-v45` | "Mine 0.25 and Quarry **0.40**" | **dev note 1** — the Quarry returns to Kittens' own **0.35**; Sump Ventilation has left `MINERALS_LINE` |
| 6 | `test-v46` | "`BOOST_LIMIT.vigor` is 1.0 → ×2.0 asymptote" | **Part 2** — asserts `asymptote === 1 + BOOST_LIMIT.vigor`, from the table |
| 7 | `test-v47` | "…and keeps its caps" (Shrine devotion 75) | **dev note 4** — 50, directed. The suite's item is the Shrine's RATE, asserted unmoved on the line above |
| 8 | `test-v49` | "`MINERALS_LINE.quarry` still resolves off the unchanged id" | **dev note 1** — §5's claim is the KEYING; asserts the table is still keyed by live building id |
| 9 | `test-v49` | "the ore category measures 1 + 0.25M + **0.40Q**" | **dev note 1** — 0.35Q. MEASURED == CLOSED FORM is the item and is unchanged |
| 10 | `test-v50` | "no regression — the ore category is still 1 + 0.25M + **0.40Q**" | **dev note 1** — same |
| 11 | `test-v52` | "devotion still asymptotes at its **2.0** bound" | **Part 2** — asymptotes at `1 + its own bound`, read from the table |
| 12 | `test-v52` | "the two slots unbounded by OMISSION are closed: provisions **1.5**, mana **1.0**" | **Part 2** — still CLOSED, which is the item; the magnitudes are rails now |
| 13 | `test-v52` | "Keeping the Rolls … capped to **929**" | **Part 5** — **RESTORED to the authored 1,300.** v0.63 re-pointed this away from 1,300; the cap is retired and it is back |
| 14 | `test-v58` | "a Chapel analogue exists, at **0.025** devotion/s" | **dev note 4** — 0.015, directed. The structural claim (a middle tier exists at all) is what is asserted |
| 15 | `test-v61` | "every trade costs a SHARED **5,000** provisions" | **Part 6** — reads the constant, and asserts SHARED-ness by enumerating every route |
| 16 | `test-v61` | "Σ0.75 IS EXACTLY THE KNEE" | **Part 2** — still delivered in full, now with **0.75 of headroom** where v0.62 had exactly zero |
| 17 | `test-v61` | "the generated cost is `<=` the generated figure" | **Part 5** — **RESTORED to `===`.** The cap forced the `<=` at v0.63 |
| 18 | `test-v61` | `knowledgeUncappedRungsExact`'s "was this rung scaled?" branch | **Part 5** — with one load-time writer there is no ambiguity left to work around |
| 19 | `test-v62` | "NO `BOOST_LIMIT` VALUE CHANGED … §16 makes it Jerry's" | **Part 2** — **he ruled.** Asserts the three untouched families |
| 20 | `test-v62` | "vigor and devotion throw most of their stack away" | **Part 2** — **inverted**: the assertion now demands they DON'T, and reports the same two figures |
| 21 | `test-v62` | "`boosts.mana` is Σ0.75 EXACTLY, which is its own knee" | **Part 2** — Σ0.75 delivered in full, with headroom rather than on a knife-edge |
| 22 | `test-v62` | "Marus: cap 500 → 200, rate 0.05 → 0.03" | **dev note 4** — the RATE is deleted entirely; the `prod` key is gone |
| 23 | `test-v62` | "only the RUNG CAP scales authored figures" | **Part 5** — **RESTORED**: nothing scales an authored figure now |
| 24 | `test-v63` | four assertions pinning the cap's existence, its 2.43, its FLOOR and its proportional scaling | **Part 5** — replaced by four the retirement makes available, all strictly stronger |
| 25 | `test-v63` | "`ritesOfTargon` … is now compliant" | **Part 5** — relieved by re-basing its AUTHORED outlier, not by scaling its compliant leaves |
| 26 | `test-v63` | "NO `BOOST_LIMIT` VALUE MOVED: seven keys" | **Part 2** — seven keys and `knowledge` absent are the items that survive |
| 27 | `test-v63` | **"the VERSION constant is bumped: `=== "v0.63"`"** | **operational rule 9 CATCHING ITSELF** — a literal version string pinned in a suite is forbidden by the Appendix, written after `test-v53` did exactly this. Asserts the shape |

*(Rows 1–14 are the fourteen distinct call sites the runner reported failing; 15–27 are the
additional sites inside the three suites that died before reaching their trailer.)*

---

## 8. Jerry's dev note 1, second instance — A SHIPPED EFFECT THAT REACHED NOTHING

**This is the round's operational finding and it was not reported by anyone.**

Landing Sump Ventilation's 5% on `boosts.ore` required `ore` to be a KEY of the `boosts` object
literal in `computeRates()`. It was not. And the policy term is applied by:

```js
for (var pk in boosts) boosts[pk] += policyBoost(pk);
```

**A `for...in` visits the keys the literal declares.** v0.63 Part 3.2 re-scoped the Demacian
Accord from a building group to the resources `timber` and `ore` and landed it in `policyBoost()`
— which is the right home — but neither key existed, **so the loop never asked
`policyBoost("timber")` and the +8.5% was never delivered to anything.**

**Measured on the v0.63 tag, policy held, 30 miners and 30 woodcutters:**

| | timber | ore |
|---|---|---|
| without the policy | 121.328 | 196.350 |
| with the policy | 122.541 | 198.314 |
| **delivered** | **+1.0%** | **+1.0%** |

**+1.0% is `catPolicy`'s generic government term, which was always live. 0.0% of the advertised
8.5% ever reached a resource.**

**It is operational rule 11's sibling and it is quieter.** Rule 11 is "a `var` read inside an
array literal declared below it is `undefined`, not an error"; this is "a key absent from an
object literal is never visited by a `for...in`, and the term that would have written it reads as
live code." **Nothing throws, nothing renders NaN, no suite fails, and the tooltip states a figure
the engine never applies.** It is v0.63 §10's own finding — *a defect that repairs itself is a
defect nobody can see* — one level down.

**Fixed by the declaration, not by a special case**, and `test-v64` asserts the Accord **DELIVERS**
rather than asserting the key exists — because a key nobody reads is what shipped last round. The
measured lift is now +9.585%, which is the 8.5% resource boost compounded with `catPolicy`'s 1.0%.

**The rule this earns, and it is a sibling of rule 11:**

> **A term keyed on a name is dead until the container declares that name.** When you add a
> resource, a family or a category to a keyed accumulator, assert the DELIVERED value, never the
> presence of the key.

---

## 9. Dev notes 2, 3 and 4

### 9.1 Note 2 — what is a converter, and the largest production change in the round

**The ruling: A CONVERTER IS ANY BUILDING WITH A `convert` BLOCK. There is no second kind.**

What was shipped before: the three `autoprod` Zaun extractors took the infernal drake and the Zaun
autoprod line; **the other three converter-output terms — the conversion Discoveries, the overseer
affinity and the Cinders buff — reached only the non-autoprod converters.** So Banked Coals raised
the Forge, both Refineries and the Chem-Forgeworks, and did nothing for the two buildings that
make Zaun Ore and Coalgas — **the inputs the Shimmer Refinery it DOES boost runs on.**

**The split was an accident of shape.** `autoprod` says how a converter is DRIVEN — off banked
stock rather than off a worked job (§7) — and nothing about that makes a conversion Discovery
inapplicable. **v0.58.1 note 29 had already made this exact argument for the drake in this same
function** (*"excluding them would have made the drake a Forge upgrade wearing a drake's name"*);
it was applied to one term and the other three were left behind, and Resonance Coils' own effect
string documented the gap as deliberate, which is how a scope becomes invisible.

**Measured on a maxed state:**

| shape | before | **after** | |
|---|---|---|---|
| worked converters | ×3.300 | ×3.300 | **unchanged** |
| **autoprod (Zaun extractors)** | **×2.951** | **×9.738** | **×3.30** |

**That is the largest single production change in the round and it lands on the Era-3 raws** — the
resources four rounds have measured as the thing Era 3 runs out of. The autoprod line stays
EXCLUSIVE to those three buildings and that asymmetry is correct: the Chembarrel drives them
specifically, the way Kittens' Steamworks drives its Magnetos. **No new multiplicative category
(§31): every term already existed and three now have a wider scope.**

### 9.2 Note 3 — the Sump Crawl cooldown

`cooldown: 450` — 7.5 minutes, the floor the note states. **It was the only UNCOOLED source of a
converted material in the game:** every other route to Zaun Ore and Coalgas is a converter,
rate-limited by building count, inputs and the autoprod line, while this paid 40–70 Zaun Ore +
20–35 Coalgas × `campYieldMult` for 140 vigor as fast as vigor arrived. v0.52 measured **108.8
crawls a game-year at Deep Works**.

**And the parity ledger row already claimed "the constraint is the cooldown rather than the
price." There was no cooldown. The row is true now.**

**§32: this is a PRNG re-roll and is labelled as one, not made neutral** — the whole point of the
change is that the expedition fires less often, which is §32 rule 3 exactly. It is the LAST slice
so every Part before it stays seed-for-seed comparable. **Measured at 300 game-years the re-roll
does not fire at all** — s8 is identical to s7 — because `sumpEcology` costs 60,000 knowledge and
the bot is nowhere near it. It fires in the ensemble.

### 9.3 Note 4 — devotion

All four figures directed, all four shipped exactly:

| | before | **after** |
|---|---|---|
| Shrine of the Solari | 0.0075/s, **+75 cap** | 0.0075/s, **+50 cap** |
| Chapel of the Dawn | **0.025/s** | **0.015/s** |
| Aspect's Sanctum | multiplier | multiplier — unchanged |
| **Marus Omegnum** | **0.03/s, +200 cap** | **NO RATE AT ALL, +250 cap** |

**It is a ROLE separation, not a magnitude cut.** Every building on the faith curve used to do
both jobs; now the top of it does exactly one. The Marus is the settlement's devotion CEILING and
produces nothing, so the reason to climb is capacity rather than compounding — and devotion is the
one resource in the game whose rate compounds into a global multiplier, through `worship` into
`catReligion`. **A producer at the top of that curve is where "devotion comes too quickly" comes
from.**

**The `prod` key is REMOVED, not zeroed.** A `prod: { devotion: 0 }` would still be enumerated by
`effectLines()` and would print "0/second" — a tooltip advertising a thing the building does not
do. `test-v64` asserts the tooltip carries no rate.

**The Shrine's rate is untouched at 0.0075/s** — Kittens' temple `faithPerTickBase 0.0015` × 5,
and the one devotion figure in the file at verified source parity. **The Chapel's 0.025 → 0.015
is a departure from the source's own chapel figure** and is ledgered **RR-ORIGINAL / HARDER**
rather than as a parity fix. §17 is the precedent: a directive arrived whose premise about the
source was false, the builder shipped it anyway because directives override, and labelled it
honestly — and two rounds later Jerry read the label and reversed it. **An honest label costs
nothing and buys a great deal.**

---

## 10. Suites

**35 suites, 1,907 `check()` call sites, 1,956 assertions executed, 1,956 passed, 0 failed.** No
missing trailer, no skipped call site, no non-zero exit. The `--selftest` scratch suite threw on
purpose and the runner FAILED on it, as it must.

`tests/test-v64.mjs` is new: **81 assertions**, one block per Part in the spec's order, then one
per dev note.

**Parity ledger regenerated: 225 rows — PARITY 87, EASIER 116, HARDER 22, UNVERIFIED 0.** The
movements, all argued in §7 of the tool's verdict map:

- **four `BOOST_LIMIT` rows → PARITY** on the rails (vigor and devotion and provisions were HARDER;
  a rail above the reachable range is as close as RR gets to a source that bounds nothing);
- **the Chapel PARITY → HARDER** on dev note 4's directed rate cut — the honest label, not a
  parity claim;
- **the Marus's FAUCET row re-rated rather than deleted**, because the divergence it described
  (an additional devotion faucet with no counterpart rung) no longer exists;
- **`sumpVentilation` re-pointed** from the Steamworks to `<res>Ratio`, its actual shape now;
- **`sumpCrawl` corrected** — the row claimed a cooldown constrained it and no cooldown existed.

---

## 11. The ensemble — THREE SEEDS, 2,500 GAME-YEARS, 5,244 SECONDS WALL

**One ensemble, on the shipped build, as the round's only gate — per Jerry's session protocol
(§2.5). Three seeds launched concurrently; all three completed.**

**§32 first: THIS IS A FRESH DRAW.** Slice s8 (the Sump Crawl cooldown) changes how often a
random-consuming path fires, so the shipped build's stream is re-rolled. It is comparable to
v0.63's shipped ensemble as one sample against another; it is **not** a seed-for-seed delta.

### 11.1 THE GATE

| | v0.63 (shipped) | **v0.64** | |
|---|---|---|---|
| **Icathia** | **2 of 3** — 1,473.8 / 1,704.3 / never | **3 of 3 — 2,234.7 / 1,339.9 / 1,694.2** | **PASS — the gate, after three rounds of failing it** |
| **peak population [median, 150–220]** | **148** — 154 / 148 / 99 | **180** — 165 / **191** / 180 | **PASS — and all three seeds are inside the band** |
| conditions failing | 5 of 10 | **4 of 10** | |

**PASS CONDITION 1 AND PASS CONDITION 2, THE TWO THE ROUND WAS BUILT FOR, BOTH CLEAR.** Every
seed reaches Icathia and every seed lands inside §27's population band — the first time in the
project's recorded history that either has been true of all three.

### 11.2 The full ensemble table

| figure | median | min | max | spread | per seed |
|---|---|---|---|---|---|
| **icathia** | **1,694.2** | 1,339.9 | 2,234.7 | ×1.67 | 2,234.7 / 1,339.9 / 1,694.2 |
| era3 | 1,262.7 | 829.9 | 1,379.4 | ×1.66 | 1,379.4 / 829.9 / 1,262.7 |
| sparks | 510 | 431.5 | **855.3** | **×1.98** | 855.3 / 510 / 431.5 |
| chemtech | 700.2 | 675 | 1,091.8 | ×1.62 | 1,091.8 / 675 / 700.2 |
| hexcore | 1,629 | 791.4 | 2,134.5 | **×2.70** | 2,134.5 / 791.4 / 1,629 |
| deepWorks | 1,655.2 | 1,272.5 | 2,161.3 | ×1.70 | 2,161.3 / 1,272.5 / 1,655.2 |
| ritesOfTargon | **68.6** | 61.3 | 103.4 | ×1.69 | 103.4 / 61.3 / 68.6 |
| firstChampion | 135.6 | 134.6 | 248.4 | ×1.85 | 134.6 / 248.4 / 135.6 |
| pop130 | 1,711.5 | 1,356.2 | 2,240.2 | ×1.65 | 2,240.2 / 1,356.2 / 1,711.5 |
| firstTrade | 348.5 | 302.5 | 668.3 | ×2.21 | 668.3 / 348.5 / 302.5 |
| **peak population** | **180** | 165 | 191 | ×1.16 | 165 / 191 / 180 |

**Single-run figures from the median seed (3):** crystals time-at-cap **20.5%** (37 / 22.5 / 20.5),
provisions **51.1%**, culture 95.7%, renown 83.5%, morale band 100%, trades 165,063.

### 11.3 The ten milestone conditions — 4 failing, and what each one is

| condition | shape | result | |
|---|---|---|---|
| Rites of Targon before y75 | median | **68.6** | **PASS** |
| First Ascent occurs | all-seeds | 109 / 69.4 / 78.7 | PASS |
| **First champion before y120** | max | **248.4** | **FAIL** |
| **peak population 150–220** | median | **180** | **PASS** |
| **Sparks before y500** | max | **855.3** | **FAIL** |
| **morale 90–140 band ≥80% after y60** | single | **70** on seed 2 | **FAIL** |
| morale not pinned above 140 after Era 3 | single | 0 / 3 / 0 | PASS |
| **Chemtech → Hexcore under 400 years** | max | **1,042.7** | **FAIL** |
| Convergence at its own unlock ≥1% | median | 32.7% | PASS |
| cheapest trade affordable at Sparks | single | true ×3 | PASS |

**Two of the four failures are the champion draw, and builder note 5 predicted exactly this.**
Sparks is champion-gated on a 3-of-10 choice (§4, the sanctioned exception), and its spread is
**×1.98** against first champion's **×1.85** — the two move together, and seed 1 draws its first
champion at y134.6 but does not draw a Piltover/Zaun one until far later, pushing Sparks to 855.3
and everything downstream with it. **Chemtech → Hexcore's 1,042.7 on that same seed is the same
draw propagating.** The spec's own instruction applies: *report Sparks with its draw, or do not
steer on it.* **Three seeds is not enough to steer on any of these three; §13 carries it.**

**The morale failure is real and is seed 2's alone** — 70% against a ≥80% target, on the seed with
the highest population (191) and by far the most trade (282,691 trades against the median's
165,063). It is a `[single]`-shape condition being read off one seed and the two others read 100%.

### 11.4 THE HOUSING DECOMPOSITION AT FULL LENGTH — Part 1's actual answer

Median seed, at Icathia and at end of run:

| | @icathia | **@final** |
|---|---|---|
| Shelter | 21 copies → 42 pop (max 31 → 62) | 32 → 64 (max 38 → 76) |
| Longhouse | 32 copies → 32 pop (**max 54 → 54**) | 44 → 44 (**max 59 → 59**) |
| Skyrise Terrace | 14 → 28 pop, **max ∞** | 28 → **56 pop**, max ∞ |
| **two-tier ceiling** | **116** | **135** |
| pop / maxPop | 112 / 112 — **at the wall** | 180 / 180 — **at the wall** |
| binding on the next Longhouse | **timber (stock)** | **timber (stock)** |

**THE SPEC'S 78-POPULATION TWO-TIER CEILING IS GONE. It reads 135 at end of run and it is
material-bound, not ceiling-bound — the next Longhouse is waiting on timber STOCK, not on a
ceiling that forbids it.** The settlement is still at its housing wall at every milestone, which
is the honest reading: population is *still* the binding constraint on this game, but the
constraint is now build-rate against timber and ore, which is exactly where Kittens puts it.

**And the Skyrise carries 56 of the final 180.** The spec's alternative hypothesis — *"if 1.2a
does not move population, the Skyrise is already carrying the settlement past 78 and the answer is
Part 1.2b"* — is answered: **the Skyrise is carrying a third of the population, AND 1.2a moved
peak population from a median of 148 to 180.** Both were partly true; neither alone was.

### 11.5 THE KNEE AUDIT AT END OF RUN — the rails, doing exactly what they were sized to do

| family | cap | knee | raw Σ | delivered | % of knee | **thrown away** |
|---|---|---|---|---|---|---|
| devotion | 5 | 3.75 | 3.650 | 3.650 | 97.3% | **0%** |
| crystals | 2 | 1.50 | 1.422 | 1.422 | 94.8% | 0% |
| vigor | 8 | 6.00 | 5.443 | 5.443 | 90.7% | **0%** |
| provisions | 3 | 2.25 | 1.900 | 1.900 | 84.4% | **0%** |
| gold | 1.5 | 1.125 | 0.825 | 0.825 | 73.3% | 0% |
| mana | 2 | 1.50 | 1.050 | 1.050 | 70.0% | **0%** |
| culture | 2 | 1.50 | 0.200 | 0.200 | 13.3% | 0% |

> **ZERO FAMILIES PAST THE KNEE. EVERY BOOST IN THE GAME NOW DELIVERS WHAT ITS BUTTON SAYS.**

**And §2.4's recorded disagreement is settled against me.** I argued the devotion rail might want
6.0 because a maxed static probe reached Σ4.024 against the 3.75 knee. **The real run reaches
3.650 — inside it, at 97.3%.** The spec's 5.0 was right and my objection was the probe's artefact,
which is the same lesson v0.62 drew and I should have trusted first time.

### 11.6 MANA — AND THE MEASUREMENT TRIPS THE SPEC'S OWN CONDITION

Pass condition 17, median seed, all four milestones:

| milestone | net | gross | consumed | **consumed ÷ produced** | |
|---|---|---|---|---|---|
| sparks | **+33.39/s** | 40.58 | 7.19 | 0.177 | comfortable |
| **hexcore** | **−0.40/s** | 119.35 | 119.75 | **1.003** | **DEFICIT** |
| icathia | +10.21/s | 157.49 | 147.28 | 0.935 | tight |
| **final** | **−14.52/s** | 1,351.27 | 1,365.80 | **1.011** | **DEFICIT** |

**THE SPEC SAYS: "If it is negative at any milestone, ship the fourth [discovery]." IT IS
NEGATIVE AT TWO. THE FOURTH DISCOVERY IS NOT SHIPPED, AND THAT IS A DELIBERATE NON-ACTION WITH A
STATED REASON.**

The measurement that triggers the condition **is the round's final gate** — it did not exist until
the 87-minute ensemble finished. Shipping a new Discovery on the strength of it would mean adding
content *after* the only run that verifies the build, i.e. shipping unmeasured, which is the
failure mode this whole protocol exists to prevent. **It is handed to the analyzer with the exact
figures and the exact milestones, in §13.**

**And the deficits want reading carefully before anyone sizes against them.** −0.40/s against a
gross of 119/s is **0.3%**, and −14.52 against 1,351 is **1.1%**. A ratio pinned at ≈1.00 is the
signature of a system in equilibrium — the mana-consuming converters are throttled by mana
availability and consume exactly what arrives. That is a *binding constraint*, which is what the
note was asking about; it is not a collapse. **Whether it should bind is a design question and it
is Jerry's.**

### 11.7 THE CONVERTER RULING AT FULL LENGTH — bigger in a real run than in the probe

Median seed at end of run:

| shape | terms | product |
|---|---|---|
| worked | infernal ×1.4747 · cinder ×1.5 · Discoveries ×1.65 · overseer ×1.92 | **×7.008** |
| **autoprod (Zaun)** | infernal ×1.4747 · **autoprod line ×2.9038** · cinder ×1.5 · Discoveries ×1.65 · overseer ×1.92 | **×20.350** |

**Before dev note 2 the autoprod shape carried only the first two terms: ×1.4747 × 2.9038 =
×4.282. The ruling takes it to ×20.350 — a ×4.75 move on Zaun Ore, Coalgas and Hexcrystal Ore in
a real run**, against the ×3.30 the static probe predicted, because the overseer affinity and the
Cinders buff are live at end of run and were not in the probe.

**This is the largest production change in the round by a wide margin, and it is a dev note rather
than a spec Part.** It is very likely a material part of why Icathia now completes on all three
seeds: Era 3's raws are what Era 3 runs out of, and this multiplies all three of them. **The round
cannot separate it from Part 1 — s8 is the re-roll slice and the ensemble is a single draw — so it
is stated as a candidate cause rather than claimed as one.**

### 11.8 Predicted vs measured

| slice | spec's prediction | **measured (seed 1, 300y, cumulative prefixes)** |
|---|---|---|
| s1 Longhouse food cost deleted | **peak population +25 to +60**, Icathia 2–3 of 3 | **0 at 300y — BYTE-IDENTICAL to s0.** Two-tier ceiling 59 → 69. At full length: peak pop median 148 → 180 and Icathia 3 of 3, but not attributable to s1 alone |
| s2 `DISCOVERY_RUNG_CAP` retired | 0 to +5 population, Icathia unchanged | **peak pop +4 ✓. AND Rites of Targon +42.3, which was not predicted** |
| s3 provisions rail | +5 to +20 | **0 at 300y — the family is at 73% of its OLD knee** |
| s4 vigor rail | 0 to +10 | **0 at 300y — same reason** |
| s5 devotion + mana rails | 0 | **0 at 300y ✓** |
| s7 era gates | −10 to 0, may regress | **0 at 300y — the bot has not reached `chemtech`** |
| **shipped** | **165–200 population, Icathia 3 of 3** | **180 median, Icathia 3 of 3 — BOTH INSIDE THE PREDICTION** |

**The spec's headline prediction is correct and its per-slice predictions are mostly not**, which
is worth stating plainly: every early-game slice measured zero, so the round's whole effect is
late-game and none of it is attributable at 300 years. **The analyzer's "falsifiable in one run"
framing was right about the target and wrong about the instrument** — a 300-year slice cannot
falsify a claim about a ceiling that binds after year 1,000.

---

## 12. Pass conditions

| # | Condition | Target | **Result** |
|---|---|---|---|
| **1** | **Icathia on all three seeds** | the gate, third round running | **PASS — 2,234.7 / 1,339.9 / 1,694.2** |
| **2** | **Peak population 150–220 [median]** | the constraint Part 1 demonstrates | **PASS — 180 (165 / 191 / 180), all three inside** |
| 3 | maxPop decomposition at every milestone, binding resource per building | | **PASS** |
| 4 | Longhouse provisions deleted, `js/buildings.js:476–487` cited | | **PASS** |
| 5 | Two-tier ceiling reported as a number, before and after | | **PASS — 59 → 69 at 300y; 135 at end of run** |
| 6 | `BOOST_LIMIT` vigor 8.0, devotion 5.0, provisions 3.0, mana 2.0; others unchanged | | **PASS** |
| 7 | Raw Σ per family at **all four milestones** | | **PASS** |
| 8 | Option B slices: **one ensemble per family**, in order, reported separately | | **FAIL — one attributable SLICE per family and one ensemble total, per Jerry's session protocol. §2.5 states the weakness: a 300-year slice cannot see a late-game rail.** |
| 9 | Per-copy rates **unchanged** | | **PASS** |
| 10 | `DISCOVERY_RUNG_CAP` gone; generated back at 0.8 × K | | **PASS** |
| 11 | `greatLibrary` 12,000, `masterOfTheHunt` 3,600 | | **PASS** |
| 12 | Per-upgrade median inside **0.73–1.00** after every load-time mutation | | **PASS — 0.80** |
| 13 | Census reconciled, join recorded, one table pinned | | **PASS** |
| 14 | Coalgas Vent takes `plating`; `auditCostGraph()` passes | | **PASS — plating 8, both graphs 0** |
| 15 | Era-tier audit, every building, **reported before any cost change** | | **PASS — 51 buildings, 25 gated, 4 Era-2+ ungated** |
| 16 | New gates craftable at the building's own tech, both audit graphs | | **PASS** |
| 17 | Mana net/s and consumed÷produced at four milestones; fourth discovery **only on a measured deficit** | | **PARTIAL — measured at all four; DEFICIT FOUND at hexcore (−0.40/s) and final (−14.52/s); the fourth discovery is NOT shipped and §11.6 states why** |
| 18 | Swain's two slots ledgered as distinct | | **PASS** |
| 19 | `TRADE_PROVISIONS` 3,500; caravan count reported; separated from 1.2a | | **PASS — 13 → 19 caravans at 300y, 279 at end of run** |
| 20 | `CRYSTAL_SINK_MAX` **untouched** | | **PASS — 8** |
| 21 | Unchanged: `capFamilyOf()` two families · audits 0/0 · Σ 4.35/1.80 · `CONSUMPTION` 4.25 · `XP_PER_SECOND` 0.05 | | **PASS** |
| 22 | Every Part actioned, or its non-action explicitly justified | | **PASS — 1.2b (§1.4) and the fourth mana discovery (§11.6) are the two non-actions, both justified** |

**20 PASS, 1 PARTIAL, 1 FAIL.** The one FAIL is a protocol difference stated in advance, not a
missed target.

---

## 13. What I would take back, and what the analyzer should take next

### What I would take back

**My objection to the devotion rail (§2.4).** I recorded a disagreement based on a maxed static
probe reading Σ4.024 against the new 3.75 knee. **The real run reads 3.650.** v0.62's own finding
— the static probe is not the instrument, the end-of-run audit is — was sitting in the file I was
editing, and I raised the objection anyway. The spec's figure was right.

**And the round's per-part verification told me almost nothing, which is a protocol finding.**
Seven of the eight slices measured EXACTLY ZERO at 300 game-years. Every change in this round is
late-game by construction — a ceiling that binds after year 1,000, four rails whose families do
not reach their knee until deep in Era 3, era gates on `chemtech`. **A cheap per-part check catches
gross regressions and it did that; it cannot attribute a late-game round, and this round was
entirely late-game.** A future round of this shape should either run its slices at full length or
say up front that its attribution will come from one ensemble.

### For the analyzer — in priority order

1. **THE GATE IS CLEARED. THE NEXT ROUND SHOULD NOT BE ABOUT POPULATION.** Icathia 3 of 3, peak
   population 180 median with all three seeds inside the band. **Do not tune a condition that
   passed** (§Part 7's own rule). The two-tier ceiling is 135 and material-bound; the settlement is
   still at its housing wall at every milestone, but the binding resource is **timber stock**, which
   is where Kittens puts it.
2. **MANA RUNS A MEASURED DEFICIT AND THE SPEC'S OWN CONDITION SAYS SHIP THE FOURTH DISCOVERY.**
   Hexcore **−0.40/s (ratio 1.003)** and final **−14.52/s (ratio 1.011)**. The figures are in
   §11.6 with the milestones named, as pass condition 17 requires. **It is not shipped because the
   measurement arrived with the final gate.** Read §11.6's caution first: a ratio pinned at ≈1.00
   is equilibrium, not collapse, and the deficits are 0.3% and 1.1% of gross. **If it ships, put
   it on a tech that is not `sparks`**, per the spec.
3. **SPARKS AND FIRST CHAMPION NEED MORE THAN THREE SEEDS, AND THE SPEC SAID SO BEFORE THE ROUND
   RAN.** Sparks spread **×1.98**, first champion **×1.85**, Chemtech→Hexcore **×2.70** — all three
   move together and all three are the 3-of-10 champion draw (§4). **Three of this round's four
   failing conditions are one random variable.** Either take more seeds or stop steering on them;
   builder note 5 called this exactly and the round reproduced it.
4. **PART 1.2b IS STILL AVAILABLE AND IS PROBABLY NOT NEEDED.** The Skyrise carries 56 of the final
   180 population and is doing real work, but `deepWorks` still lands at a median of y1,655 — 86%
   up RR's ladder against the source's 34%. **If a future round wants it, the spec's own analysis
   stands: move the RUNG, not the price.** But the gate it was insurance for has cleared.
5. **DEV NOTE 2'S CONVERTER RULING IS THE ROUND'S BIGGEST UNMEASURED LEVER — ×4.75 ON THE ERA-3
   RAWS.** It shipped in the same slice as three other dev notes and inside a PRNG re-roll, so its
   individual effect is not attributable. **If Era 3 now looks too fast, this is the first place to
   look, and `CONV_DISCOVERY_LINE`'s Σ0.65 is the one constant to move.** Era 3's median is
   1,262.7 against v0.63's 982.8 — longer, not shorter, but that is a fresh draw.
6. **RITES OF TARGON COST 42 GAME-YEARS ON SEED 1 AND THE MEDIAN STILL PASSES.** Part 5's parity
   restoration made the early knowledge ladder heavier by construction. **The analyzer should
   decide whether Rites-under-75 or per-upgrade parity is the target**, because a future round
   cannot have both — and the per-upgrade band is the one the source actually holds constant.
7. **A NEW OPERATIONAL RULE, from §8, and it is a sibling of rule 11.** *A term keyed on a name is
   dead until the container declares that name.* When adding a resource, family or category to a
   keyed accumulator, **assert the DELIVERED value, never the presence of the key** — a shipped
   effect reached nothing for a full version and no suite could see it.
