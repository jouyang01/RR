# BUILDER SPEC v0.51 — the knowledge buildings are capped at ×3.97 where Kittens is ×20.8

Measured against `index_50.html`, verified line by line. Every Kittens value below was read
from `nuclear-unicorn/kittensgame` in this session. Baseline: **Sparks y148.0, Icathia
y803.9, Era 3 655.9.**

**Jerry's instinct is right and the defect is bigger than the shape he described.** The
knowledge buildings *do* reach the Loremaster — the wiring is correct. They are **bounded at
×3.97 where Kittens' equivalent is unbounded and reaches ×20.8**, because RR implements the
same Kittens category through two different mechanisms and bounded one of them. Part 0 is
the answer, the audit he asked for, and the honest pacing consequence.

**This is a lever round** (input spec Part 0.1) and Part 0 pulls the wrong way. That tension
is named rather than hidden, and Part 7 isolates it so it is measured rather than argued.

**Every part of `rranalyzerv051spec.md` is actioned below.** Two are closed as
already-shipped with line citations, two are answered as rulings rather than code, and one
is corrected before it ships because it would have created the eighth raw-gate violation.

---

## Part 0 — Jerry's question: yes, and here is the audit

### 0.1 The wiring is correct — the bound is not

`index_50.html`:

```js
// 2903 — every building's `boost` is summed into the per-resource category
if (b.boost) for (var r in b.boost) boosts[r] = (boosts[r] || 0) + b.boost[r] * count(b.id);

// 2927 — and then bounded
for (var bk in boosts) if (BOOST_LIMIT[bk]) boosts[bk] = limitedDR(boosts[bk], BOOST_LIMIT[bk]);

// 2987 — applied to job output, which includes the Loremaster
var jv = j.prod[r] * n * mult * (1 + (boosts[r] || 0));
```

**So the Loremaster is enhanced.** Line 2903 → 2987 is intact, and the same term also
reaches building production (2942) and converter output (3019), which is right — Kittens'
`scienceRatio` multiplies the whole `perTick`.

**The defect is line 2927 combined with `BOOST_LIMIT.knowledge = 3.0`.**

| At the science stock… | Σ boost | Kittens `scienceRatio` | RR after `limitedDR(Σ, 3.0)` | shortfall |
|---|---|---|---|---|
| Kittens' end-of-tree **30 / 30 / 25 / 13** | 19.80 | **×20.80** | **×3.969** | **×5.24** |
| RR's measured **39 / 31 / 49 / 21** | 29.70 | ×30.70 | ×3.980 | **×7.71** |

Kittens applies it as `perTick *= 1 + this.getEffect("scienceRatio")` with **no diminishing
return anywhere** — the identical statement it uses for `mineralsRatio` and `woodRatio`.

**And it explains something we have been misreading for four rounds.** RR's science building
counts run high — 49 Observatories against a target of 25 — and every spec has treated that
as an income problem. It is not. Past Σ 2.25 each additional Observatory contributes
essentially nothing to production, so the player keeps buying them **for the cap alone**. The
overshoot is the symptom of the bound, not of the economy.

### 0.2 The audit Jerry asked for — every enhancing building, both mechanisms

RR implements Kittens' single `<res>Ratio` category through **two** mechanisms with
different bounding rules. This is the whole finding.

| RR mechanism | members | bounded? | Kittens counterpart | verdict |
|---|---|---|---|---|
| **`jobBoost`** → line 2984, `(1 + jobBoosts[j])` | Mine `miner 0.20` · Petricite Quarry `miner 0.35` | **no** | `mineralsRatio`, unbounded | ✅ exact |
| | Lumber Mill `woodcutter 0.10 × (1+saws)` | **no** | `woodRatio`, unbounded | ✅ exact |
| | Augment Chamber `tinkerer 0.40` | **no** | none — RR-only | ✅ consistent |
| **`boost`** → line 2987, `(1 + boosts[r])`, **bounded at 2927** | Archive .10 · Academy .20 · Observatory .25 · Hexcore Lab .35 | **YES, 3.0** | **`scienceRatio`, unbounded** | ❌ **the violation** |
| | Farmstead `provisions 0.03` | no key → **unbounded** | `catnipRatio` (aqueduct), unbounded | ✅ shape right, building wrong — Part 1.2 |
| | Aspect's Sanctum `devotion 0.10` | YES, 2.0 | **none — Kittens' faith has no `<res>Ratio`** | ✅ RR-only, bound is fine |
| | Wilds building `vigor 0.10` | YES, 1.0 | **none — manpower has no `<res>Ratio`** | ✅ RR-only, bound is fine |

**Exactly one violation: knowledge.** The two other bounded entries have no Kittens
counterpart to be unbounded against, so bounding them is an RR choice rather than a parity
error. Nothing else in the game falls into this shape — that is the audit's answer.

### 0.3 The fix, and it is one key

```js
// v0.51 Part 0. Kittens' scienceRatio is the SAME category as mineralsRatio and woodRatio
// — game.js applies all three as `perTick *= 1 + getEffect(res + "Ratio")` with no DR.
// RR routes ore and timber through `jobBoost` (unbounded, correct) and knowledge through
// `boosts` (bounded), so the four science buildings were capped at x3.97 against the
// source's x20.8. The bound goes; the mechanism stays.
var BOOST_LIMIT = { devotion: 2.0, culture: 2.0, gold: 1.5, vigor: 1.0, crystals: 2.0,
                    provisions: <Part 1.3>, mana: <Part 1.3> };   // `knowledge` removed
```

`boosts.knowledge` also carries Rites of Insight (+0.10) and Swain's passive (+12%). Both
stay — Kittens' categories are additive and take upgrade contributions too.

### 0.4 The pacing consequence, stated in advance

**This is a production increase in a round that needs production cuts, and it must not be
hidden inside another slice.**

The mitigating structure is real: v0.45 Part 5 made `caps.knowledge` the building sum plus
the clamped Tome term and nothing else, and v0.47 measured it at **142,650 against Icathia's
135,000**. So knowledge is *cap*-limited at the top of the ladder and *rate*-limited below
it. Unbounding production removes waiting at low stock and does much less at the top.

**Prediction, stated before the run as the input spec requires: Sparks moves substantially
earlier — expect y148 → y60–90 — and Icathia moves much less, so Era 3 lengthens or holds.**
If Icathia moves in proportion to Sparks, the prediction is wrong and the cap is not binding
where I think it is; that is the informative failure and it should be reported as such.

---

## Part 1 — The levers

### 1.1 Arcane Reactor: the next ×10 — **ship as written**

`hexcore 400, hexcrete 800, focusedHex 600`. Effective-raw ≈ **6.26M**, separation ≈ **×52**
against the Foundry's 119,252, against Kittens' ×181.

The evidence supports it: ×10 moved the count 21 → 12 against a predicted 5–8, so a ×10
price bought a ×0.57 reduction. **Prediction: 6–8 Reactors at Icathia**, `catMonument`
×2.398 → **×1.9–2.1**.

Pass: Reactor count ≤ Foundry count; `catMonument` at Icathia below ×2.398.

### 1.2 The Irrigation Channel — **ship, but NOT on Cultivation**

Your §2.3(a) is the best catch in the report: `boost: { provisions: 0.03 }` measured **×4.40**
in a spec section I titled "the cheapest parity item." The figure was Kittens' and the
building was not — the Aqueduct is a distinct mid-game structure, the Farmstead is the
cheapest starter at ratio 1.12 of which the bot builds sixty.

**Kittens' Aqueduct, verified: `minerals 75`, `priceRatio 1.12`, `catnipRatio 0.03`,
`unlockRatio 0.3`** (`js/buildings.js:399–410`). The input spec's guessed figures are exact.

```js
{ id: "irrigation", name: "Irrigation Channel", group: "Village", tech: "mining",
  lore: "Water persuaded to go where the fields are, and to keep going.",
  effect: "Provisions production +3% each",
  cost: { ore: 75 }, ratio: 1.12, boost: { provisions: 0.03 } },
// and the Farmstead loses its `boost` entirely — it keeps prod.provisions 0.14 and seasonal
```

**The input spec says Cultivation. It cannot be Cultivation.** Cultivation is rank 2 (100
knowledge); ore arrives with the Mine at Mining, rank 4 (500). An ore-priced building
unlocked at Cultivation is **precisely the Tavern and Storehouse shape Part 2 just cleared**,
and shipping it would put `auditRawGraph()` straight back to one. **`tech: "mining"`.**
Cultivation is not left empty — it keeps the Storehouse, Iron Plows and its own +10%.

Report provisions/s at the v0.50 comparison state (60 Farmsteads, pop 201) before and after.
Expect a large fall; that is the point of the round.

### 1.3 Close both unbounded `BOOST_LIMIT` slots — **ship, sized from source**

- **`provisions`**: Kittens' catnip boost category is `catnipRatio` — **one member, the
  Aqueduct at 0.03, unbounded**. There is nothing to census beyond that. With the Channel at
  ratio 1.12 a developed settlement owns 25–35, so Σ ≈ 0.75–1.05. **Set
  `BOOST_LIMIT.provisions = 1.5`** — above the realistic stack, so it never binds in normal
  play and catches the next Farmstead-shaped surprise. Belt and braces, as Jerry directs,
  not a nerf.
- **`mana`**: one member (Hexresonance 0.25). **Set `BOOST_LIMIT.mana = 1.0`**, which leaves
  0.25 deep in the free band.
- **`knowledge` is removed entirely** — Part 0.3. It is the one key whose absence is correct.

**Pass condition, as specified: every key written into `boosts` has a `BOOST_LIMIT` entry —
except `knowledge`, which is asserted absent with the reason in the test.** Write the
assertion as an allow-list of one so the third instance of this shape cannot ship, and so
nobody re-adds the knowledge key thinking it was an oversight.

### 1.4 Trade route vigor normalised to 175 — **ship as written**

Every route: **vigor 175**. Per-faction differentiation moves entirely to goods and gold.
Caravanserai and Letter of Marque stay subtractive on top.

**The Freljord 0.30 gold:vigor anchor is deliberately retired.** It was a parity check on
Kittens' `15:50` at the old per-route prices; with a flat vigor cost the invariant becomes
**`every route's vigor === 175`**. List it in §7 of the build report with this item as its
superseding cause.

Gold: hold each route's existing gold figure rather than re-deriving from 0.30 — gold has
never been the binding constraint (v0.47: a 12,373 ceiling against a 30-gold trade) and
changing two columns at once makes neither measurable.

Report first-trade timing and trades-affordable-at-Sparks under the new costs.

---

## Part 2 — Correctness

### 2.1 Kill `resRatio` — **ship as written**

Move Cultivation's +10% into `boosts.provisions` (under 1.3's new limit), then **delete the
table, the apply loop and the breakdown branch.** `resRatio` multiplies the *net* rate
guarded on `> 0`, so its one member does nothing at the moment a settlement is starving —
the same defect the census caught on Hexresonance by accident.

Pass: at a synthetic starving state (net provisions < 0) Cultivation measurably raises
**gross** provisions; grep-level assertion that `resRatio` no longer exists.

### 2.2 Delete Timberframe Joinery — **ship as written**

Longhouse gates on `tech: "carpentry"` alone. Delete the upgrade and the building's `unlock`
predicate, and scrub the v0.50 save-migration block of any `timberframeJoinery` reference so
a stale flag cannot resurrect a ghost gate. Grep-level assertion that the id appears nowhere;
Longhouse buildable at Carpentry with nothing else owned.

### 2.3 Merge the Tavern into Bard's Hearth — **ship as written**

Kittens' Amphitheatre does both jobs — `culturePerTickBase` **and** `unhappinessRatio`
(`js/buildings.js:1801–1830`) — and RR split them across two buildings. Reunify on **Bard's
Hearth**; the Tavern is removed.

**Sizing.** The Tavern is `crowdRelief 0.05` at ratio 1.15; Bard's Hearth is ratio 1.10, so
the Hearth count at any wealth will be **higher**. Size the per-copy relief so the curve
through `MORALE_RELIEF_LIMIT 0.88` at realistic Hearth counts lands on the old Tavern curve
at realistic Tavern counts — **compute it from the measured counts, do not assume 0.05
transfers.** State the before/after morale at the v0.50 comparison state.

Save migration: drop `buildings.tavern`, refund **50% of cumulative cost** at the ratio-1.15
geometric sum, the same one-way pattern as the Petricite Monument.

Pass: exactly one building carries `crowdRelief`; morale 90–140 after y60 still 100%.

### 2.4 Delete the Bloomery and Refined Metallurgy — **ship as written**

Drop the building with a stated refund; a researched `refinedMetallurgy` flag is dropped with
no knowledge refund, consistent with prior removals. Sweep for orphans — anything whose
`unlock`, `cost`, `tech` or prose references either — before shipping. **Re-measure steel/s
at the standard comparison states** so the loss is sized rather than assumed small; the Forge
becomes the only steel converter.

Note the ladder: `refinedMetallurgy` is one of the 38 techs and one of the eight ties.
**Removing it takes the count to 37 and will move the ladder conditions.** Recompute all five
and report them; if the median or geometric mean leaves band, say so rather than adjusting a
price — the ladder is Kittens' rank-for-rank and stays that way.

### 2.5 `CAMP_YIELD_LIMIT` — **censused, and the answer is: keep 6, fix the comment**

Actioned rather than deferred. Kittens' hunt-yield line, `hunterRatio`, read from source:

| Upgrade | hunterRatio | file |
|---|---|---|
| bolas | 1.0 | workshop.js |
| huntingArmor | 2.0 | workshop.js |
| steelArmor | 0.5 | workshop.js |
| alloyArmor | 0.5 | workshop.js |
| nanosuits | 0.5 | workshop.js |
| griffinRelationsScouts | 0.5 | diplomacy |
| rationing | 0.1 | policy |
| **Σ** | **5.10 → ×6.10**, **unbounded**, **7 members** | |

**RR: 9 members, measured ×6.35, `limitedDR` asymptote ×7.00.**

**Ruling: the magnitude is at parity (×6.35 against ×6.10) and the member count is close
(9 against 7). Do not prune the stack and do not change the bound.** The one real divergence
is that Kittens' is unbounded — but RR sits at 6.35 against an asymptote of 7.00, so the
bound is removing roughly 10% at full stack and nothing at all below it.

**Replace the false comment in the same commit:**

```js
// v0.51 Part 2.5. Censused against Kittens' hunterRatio: bolas 1.0 + huntingArmor 2.0 +
// steelArmor 0.5 + alloyArmor 0.5 + nanosuits 0.5 + griffinScouts 0.5 + rationing 0.1
// = 5.10 -> x6.10, unbounded, 7 members. RR runs 9 members and measures x6.35 against a
// x7.00 asymptote, so this is parity in magnitude and a ~10% haircut at the very top.
// It is NOT insurance — the stack sits at the bound. Kept deliberately, not by default.
var CAMP_YIELD_LIMIT = 6;
```

`LUXURY_CAMP_YIELD_LIMIT 1.0` (×2.00) has no Kittens counterpart — Kittens' hunt yields
ivory and unicorns off separate chance rolls, not a comfort multiplier. **RR-only, keep,
recorded.**

### 2.6 The test-v38 proportionality bound — **ruling: delete it**

Same treatment Part 4 gave the 1.25 band, and the same reason. **Kittens has no
effect-to-ratio proportionality rule, and its own Aqueduct violates RR's** — `catnipRatio
0.03` at `priceRatio 1.12` scores 0.25, which is why you had to widen the bound to 15× to
ship a verbatim copy of a source building.

Delete the assertion and record in the test:

```js
// v0.51 Part 2.6. Deleted, not widened. Kittens assigns priceRatio by what a building IS,
// not by the size of its effect — aqueduct 0.03 at 1.12 scores 0.25, barn 1.75 with no
// effect at all, hut 2.50. The rule this asserted does not exist in the source, and a
// bound widened twice to admit verbatim copies of source buildings is measuring nothing.
// The defect class it was reaching for is covered by auditCostGraph/auditRawGraph.
```

**Two RR-invented rules contradicted by the source in two rounds. Both now ruled and closed
rather than carried.**

---

## Part 3 — Measurements

### 3.1 The Tinkerer/Augment chain — measure, do not touch

Sixteen Augment Chambers at `jobBoost.tinkerer 0.40` is **×7.4 additive** on a job with no
Kittens anchor. `buildingJobBoost` is unbounded by design and correctly so — the concern is
the absence of any measurement, not the mechanism.

Report at Icathia: tinkerer count, Augment Chamber count, crystals/s gross, crystals
time-at-cap %, **and what the crystals are actually spent on**. Rule from the measurement
next round. **Do not pre-emptively nerf.**

### 3.2 Shimmer Refinery — recost downward, sized by measurement

Ruled by Jerry; the measurement sizes the cut, not the decision.

Measure **shimmer/s per effective-raw invested** for the Refinery
(`coalgas 0.2 + mana 0.5 → shimmer 0.05`, costing `plating 20, alloy 15`) against the Sump
Crawl's yield per expedition **including its vigor cost**, at Deep Works and at Icathia. Set
the new cost so the Refinery is the better marginal shimmer source **at a stated scale** —
name the scale in the report.

Pass: Refinery count at Icathia > 0, with the cut in its own slice so its pacing effect is
attributable.

### 3.3 Trade-aware pacing — **ruling: record the calibration, do not teach the bot**

The input spec offers two actions and requires one. **Take the second: record in the pacing
objective files that every target is calibrated for a zero-trade player.**

Teaching `manageTrade()` a banking policy would re-baseline every number this project steers
by — Sparks, Icathia, Era 3 — in the same round that Part 0 and Part 1.2 both move
production hard. Three simultaneous re-baselines is the v0.47 mistake at larger scale.

The honest statement to record:

> RR's pacing targets (Sparks, Icathia, Era 3 length) are measured on a bot that never
> trades: it spends vigor on expeditions the instant it can afford one and never banks. A
> player at Sparks can afford **44.8 trades per game-year** and, since v0.47's offline
> accrual, returns to a vigor stock rather than a flow. **Every pacing figure in this
> project is therefore an upper bound on a trading player's timeline.** This is a
> deliberate calibration choice, not an artefact.

**Schedule the banking policy for v0.52** with its own baseline round, and say so.

---

## Part 4 — Text to return to Jerry

### 4.1 The Sparks champion gate — standing-directive text

For `rr-design-spec.md`:

> **Standing directive — the Sparks exception.** Sparks Beyond the Wall requires a recruited
> Piltover/Zaun champion (Twitch, Caitlyn or Heimerdinger). This is the **single sanctioned
> exception** to the rule that champions never hard-gate content, and it is sanctioned
> because it gates an Era on a **3-of-10 choice**, not on any specific champion — a player
> who recruits any one of the three passes. Ruled by Jerry, v0.51. **No future analyzer or
> builder session should flag this as a violation, and no round should soften it without a
> new ruling.**

Matching code comment at the `sparks` tech entry:

```js
// The recruited-Piltover/Zaun-champion requirement is the ONE sanctioned exception to
// "champions never hard-gate content" — it gates on a 3-of-10 choice, not on a specific
// champion. Ruled by Jerry, v0.51. See rr-design-spec.md, standing directives.
```

### 4.2 Source-doc corrections

**`era3_4_bridge_spec.md`** — delete the Chronoshard line and replace with:

> Chronoshard is gated on the **Icathia** tech only. It has no champion requirement; Zilean's
> association with it is flavour. *(Corrected v0.51 — the previous text said "gated behind
> Zilean," which is false in code and contradicts the never-gate rule this same document
> restates.)*

**`era3_regional_crafting_spec.md`** — delete the Prospector and Stoker worker roles and
replace with:

> The three Zaun raws (Zaun Ore, Coalgas, Hexcrystal Ore) are **autoprod** — produced by
> buildings, not by assigned workers — matching Kittens' Smelter and Calciner, which consume
> and produce without a job. There are no Prospector or Stoker roles. *(Corrected v0.51;
> the roles were superseded by ruling and never shipped.)*

---

## Part 5 — UX

### 5.1 "Keeping the Rolls" — ship

The Census roster detail (names, XP bars, traits) unlocks from a Lore research; the plain
job-assignment UI stays available from the first Shelter.

**Placement: Songcraft's rung.** The Census is a cultural artefact and Songcraft (rank 9,
**1,300**) is where Culture begins, so Culture is spendable the moment the research appears.
**As a branch at the same price — 1,300 knowledge + 60 culture** — which keeps the ladder at
its current count and adds a ninth tie rather than a rung.

Pass: the roster detail is hidden until researched; job assignment is not.

### 5.2 The v0.46 visibility rule — **CLOSED, it shipped**

Not outstanding. `index_50.html:2554–2555`:

```js
var UNLOCK_RATIO_DEFAULT = 0.3;
var UNLOCK_RATIO = { shelter: 0.5 };
```

with `costDiscovered()` at 2560 shared by `buildingVisible` (2605) and `upgradeVisible`
(2603). **Shelter at 50% of cost, Archive at the 30% default, exactly as v0.46 Part 5A.4
specified.** Close the note; do not re-issue.

### 5.3 The stale "researchable" label — **CLOSED, it shipped**

Not outstanding. Fixed in v0.47 Part 4.8 at the span level; `index_50.html:3436–3440`
carries the comment and `costHtml()` at 4500 is the single point every panel goes through.
Close the note. **If Jerry is still seeing it in play, that is a new bug with a different
cause and it needs a reproduction, not a re-issue of the old fix.**

---

## Part 6 — The Eludium tier

**Ruled into v0.52 with the design sketched, not re-flagged.** This round already carries
two production movers (Part 0, Part 1.2) and four removals; adding a crafting tier would make
the round unattributable, which is the failure mode the three-build discipline exists to
prevent.

**Kittens' Eludium, verified** (`js/workshop.js:2181–2189`): `unobtainium 1000 + alloy 2500`,
**tier 5**, `progressHandicap 300` — the deepest craft in the game, sitting between the Alloy
tier and the endgame, and consumed by `eludiumReflectors`, `voidReactors` and the late
workshop line.

**The RR analogue, for v0.52:**

- **Name and position:** a tier-5 craft between Hexgear (tier 4) and the Hextech Core
  capstone, or in the Era 4 spine before Voidglass.
- **Recipe shape:** Kittens' is `deep-raw 1000 + previous-tier-craft 2500`. RR's equivalent
  is **`voidessence 1000 + hexgear 2500`** or similar — the ratio matters more than the
  nouns: the previous tier's *craft* dominates by 2.5:1 over the deep *raw*.
- **Why it lengthens:** a tier-5 craft at those quantities is 2,500 hexgear = 62,500 alloy =
  3.75M zaunore before craft yield. That is a structural sink measured in game-years, not a
  price multiplier.
- **Rank:** Kittens gates Eludium on `metaphysics`-adjacent late science; RR's equivalent
  rung is Voidglass Optics (125,000) or Icathia (135,000).

Dated placement: **v0.52, as that round's single structural item.**

---

## Part 7 — Order, discipline, pass conditions

### Order — four cumulative prefixes of the shipped file

Your v0.50 method — snapshots that *are* the shipped build up to that point rather than
reconstructions — is the right one after v0.47 and stays.

1. **Part 0 alone** — the `BOOST_LIMIT.knowledge` key removed, nothing else. **It is the
   round's largest unknown and it pulls against the round's purpose; it must be its own
   slice or the round is unattributable.**
2. **Part 1** — Reactor ×10, Irrigation Channel, both `BOOST_LIMIT` keys, trade vigor 175.
3. **Part 2** — `resRatio` deleted, Timberframe Joinery, the Tavern merge, the Bloomery, the
   CAMP_YIELD comment, the proportionality assertion deleted.
4. **Everything else** — 3.2's recost, 5.1, and the two doc texts.

Each Δ attributes to one slice.

### Operational — both of these have now cost two rounds each

**Kill by PID from `ps -eo pid,args`. Never `pkill -f` a pattern that matches your own
shell.** It is in two build reports and a handoff. **Size every sleep under the tool
timeout** while background runs are live.

**Instrument before launching.** Every metric named in Parts 0–3 goes into the harness
before the first 2,500-year run — v0.50 re-ran two of them for skipping this, and the spec
named the numbers it needed.

### Pass conditions

- **`BOOST_LIMIT` has no `knowledge` key**, and the assertion that every `boosts` write has a
  limit carries a one-item allow-list naming knowledge and citing Kittens' unbounded
  `scienceRatio`.
- **Knowledge building multiplier reported at Sparks and Icathia**, unbounded, against
  Kittens' ×20.8 at 30/30/25/13. **And report the science building counts** — the Part 0.1
  claim is that the overshoot was a symptom of the bound, and this is where it is tested.
- **Part 0's slice reported alone**: Sparks, Icathia, Era 3. Prediction on the record is
  Sparks y60–90 and Era 3 lengthening or holding.
- Reactor count at Icathia **≤ Foundry count**; `catMonument` below ×2.398. Prediction: 6–8.
- **The Irrigation Channel is on `mining`, not `cultivation`**, and `auditRawGraph()`
  returns **zero** with it in the build.
- Provisions/s at the 60-Farmstead state, before and after; `BOOST_LIMIT.provisions` and
  `.mana` both present.
- Starving-state Cultivation raises **gross** provisions; `resRatio` absent at grep level.
- `timberframeJoinery`, `tavern`, `bloomery`, `refinedMetallurgy` **absent at grep level**,
  save migrations verified on a real v0.50 save.
- **Exactly one building carries `crowdRelief`**, morale 90–140 after y60 at 100%, with
  before/after morale stated.
- **The five ladder conditions recomputed at 37 techs** after Refined Metallurgy's removal,
  all five reported whether or not they hold.
- Every route's vigor **=== 175**; first-trade timing and trades-affordable-at-Sparks
  reported.
- Shimmer Refinery count at Icathia **> 0**, with the cut isolated.
- CAMP_YIELD comment replaced with the Part 2.5 census text; the proportionality assertion
  **deleted**, not widened.
- Tinkerer chain measured and reported; **no code**.
- **Era 3 length reported against 655.9 and against the 1,400–2,300 target**, with the
  distance stated.
- No regression: `catMonument` at exactly two members; the ore category `1 + 0.25M + 0.40Q`
  exact; knowledge **cap** still buildings alone from 0; `buildingJobBoost` unbounded;
  Shelter 75 and Cultivation's +10% both kept; offline replay 0% drift; **no change to
  Worship, Ascent, the stripe, the Shrine, the Acolyte or any WTECH.**

**Sources, all read this session.** `nuclear-unicorn/kittensgame` —
`game.js:3425–3435` (`perTick *= 1 + getEffect(res+"Ratio")`, no DR, the same statement for
minerals, wood and science); `js/buildings.js:399–410` (**aqueduct: `minerals 75`, ratio
1.12, `catnipRatio 0.03`, `unlockRatio 0.3`**), `:574–575, 627–629, 671–672, 687–718`
(library .10, academy .20, observatory .25/1500-with-astrolabe, biolab .35),
`:1801–1830` (amphitheatre — `culturePerTickBase` **and** `unhappinessRatio` in one
building); `js/workshop.js:725, 743, 760, 772, 784` (`hunterRatio` bolas 1.0, huntingArmor
2.0, steelArmor 0.5, alloyArmor 0.5, nanosuits 0.5), `:2181–2189` (**eludium: `unobtainium
1000 + alloy 2500`, tier 5, progressHandicap 300**); `js/village.js:1026–1061`
(`gainHuntRes`, `hunterRatio` applied unbounded). Verified against `index_50.html` lines
2554–2555 (`UNLOCK_RATIO`), 2877 (`BOOST_LIMIT`), 2901–2927 (`boosts` assembly and the
bound), 2942 / 2979–2987 / 3019 (the three application sites), 3436–3440 (the stale-red
fix), and the `BUILDINGS` `boost` / `jobBoost` census.
