# BUILD REPORT v0.58 — the Chapel broke trade, and finding out why was worth more than the Chapel

Shipped as **v0.58**, tagged `v0.58`. `VERSION`, the footer and the tag agree.

Eight parts, SEVEN cumulative prefixes, Jerry's fourteen dev notes, **27 live suites, 1,341
assertions, 0 failures**, and — per `BUILDER_PROTOCOL.md` — **six fast single-seed per-part
checks plus exactly one full-rigour gate: a three-seed, 2,500-year ensemble run concurrently.**

**The round has one headline and it is not a spec item.**

> **Part 2 shipped the Chapel — a missing producer tier, a clean parity fix — and it took first
> trade from y317.2 to NEVER.** Not a slowdown. Zero trades in 700 game-years on a seed that had
> completed 142.
>
> The attribution took four instrumented runs and it is worth stating in full, because every
> step of it was somewhere I would have guessed wrong:
>
> 1. The Chapel diverts labour into the **acolyte** job. Vigor income falls ~23% (2,612 → 2,017
>    per game-year at y100).
> 2. The 500-vigor **scouting party** therefore runs fewer times.
> 3. **Freljord is never discovered** inside the horizon.
> 4. And Freljord was carrying the ENTIRE trade economy — because it charges **ore**, and ore
>    was the only capped good that ever idled at 99.9% of its ceiling, which was the only way the
>    bot's surplus rule could ever be satisfied.
>
> Per-route counts, seed 1, 450 game-years, which is the measurement that made this legible:
>
> | build | demacia (timber route) | freljord (ore route) | trades |
> |---|---|---|---|
> | v0.58 s2 (pre-Chapel) | open 70,418 ticks · affordable 52 · **surplus-ok 0** | open 21,256 · affordable 142 · **surplus-ok 142** | **142** |
> | v0.58 s3 (post-Chapel) | open 70,418 ticks · affordable 32 · **surplus-ok 0** | **never discovered** | **0** |
>
> **The whole trade economy was resting on one route's stock idling at 99.9% of a ceiling. The
> Chapel stepped on it.** The defect was never the Chapel and never the Chapel's price — it was
> a bot policy expressed as a fraction of a CEILING, in a project that had just multiplied every
> material ceiling by ~15. That is STANDING-RULINGS §28 and it is the most portable thing in
> this round.

---

## 1. My errors, and what each one cost

**1.1 — I shipped Part 2 without looking at trade, and Part 5 was the part I had just finished.**
The Chapel check read Convergence and the Targon counts and passed. Trades went to zero in the
same slice and I did not see it until Part 3's baseline run, two slices later. **The per-part
check is supposed to catch gross regressions with immediate attribution, and "the trade economy
stopped" is as gross as it gets.** It was missed because I looked at the numbers the Part was
about. The fix that actually holds is in the apparatus: `TRADE REFUSALS` and the per-route split
are now printed on every run, so a zero cannot be silent.

**1.2 — Kittens' literal Chapel price made the building unbuildable, and I shipped it that way
first.** `ore 2000, culture 250, parchment 250` measured **Chapel = 0 at every milestone**:
visible, unaffordable, blocked on parchment (20 held against 250 needed, on 174,772 ore). RR's
parchment costs 175 furs, so 250 parchment is **43,750 furs**. Rank-matched to RR's own faith
curve at `ore 600 / culture 120 / parchment 12` (2,100 furs), keeping the source's price *shape*.
After: Chapel 6 at Sparks, 12 at Hexcore; worship at Sparks **1,722 → 16,137 (×9.4)**;
Convergence **1.42% → 5.2% (×3.7)**. The analyzer's stated informative-failure threshold was
"less than ×2 means the bot is not building it" — cleared.

**1.3 — my first re-derived Convergence ceiling had no more source than the one it replaced.**
I set the band to 1–4%, sourcing the floor from Kittens' 1,000-worship Solar Revolution gate and
the ceiling from "10,000 worship, an order of magnitude past". Then I measured 5.2% — above my
own new ceiling. **That is the identical defect that produced the 5–8% band I was replacing: a
convenience number wearing a citation.** The ceiling is withdrawn. The condition is a **FLOOR**
at 1%, and the upper edge is `worshipBonus()`'s own +1000% hard cap, explicitly labelled as
vacuous rather than invented.

**1.4 — a `var` hoisting bug and a key collision, both caught by running rather than reading.**
`CONVERGENCE_BAND` was declared below its first use and read `undefined`. And the scholarship
census's `held` (a list of rung ids) was silently replaced by a per-resource map I added beside
it — the same class of collision §22 exists for. Both fixed; the second is commented at the site.

**1.5 — the census reported nonsense for one run and the game was correct.** After Part 3 flipped
`SCHOLAR_LINE` to increments, the census kept multiplying the entries and printed "product
×0.0225, all-five additive ×−2.4". **An instrument that disagrees with the code it measures is
worse than no instrument.** Fixed to report a Σ and a 1+Σ, and to carry the retired chain's
figure alongside so the cut stays auditable.

---

## 2. Part 1 — conditions get a declared shape, and `--seeds 1` refuses to guess

The analyzer asked for exactly one thing and named the failure it was preventing: *"a `--seeds 1`
run should refuse to evaluate an ensemble condition rather than evaluating it on one draw."*

Every condition is now a shaped object with a **declared shape** and a **stated reason**:

| shape | meaning | members |
|---|---|---|
| `median` | a distribution question — early pace, growth pace | rites, popBand, convergence |
| `max` | a ceiling — must hold for EVERY player, not the median one | firstChampion, sparks, chemToHex |
| `all-seeds` | must happen at all | firstAscent |
| `single` | stable across seeds; quote plainly | moraleBand, moraleHigh, tradeAffordable |

A `--seeds 1` run now prints, for each ensemble condition:

```
  n/a   Rites of Targon before year 75   [median] — needs --seeds; one draw is not evidence  (this seed: 70.3)
```

and evaluates only the four `single`-shape conditions. **`--force-local-eval` exists as a narrow,
named escape hatch for the per-part gross-regression checks and is deliberately not in the
ensemble's passthrough list** — `test-v58` asserts both halves of that.

Jerry's specific example is honoured: **"Sparks before y500" is a `max`** (a genuine ceiling —
Era 3 must open for every player) while **Rites is a `median`** (early pace is a distribution).
v0.57's Rites re-base failed on two of three seeds precisely because it was sized from a
two-seed draw and treated as a worst case.

---

## 3. Part 2 — the Convergence round, five times deferred

**The substantive gap was a missing producer tier, and it is now filled.** Kittens' faith curve
runs temple → **chapel** → higher tiers. RR jumped from Shrine straight to Sanctum.

| | value | source |
|---|---|---|
| production | **0.025 devotion/s** | rank-matched between the Shrine (0.0075/s, exact Kittens `faithPerTickBase`) and the Sanctum |
| cost | ore 600 / culture 120 / parchment 12, ratio 1.15 | **shape** from the source, **magnitude** from RR's own faith curve — see §1.2 |
| unlock | 2 Shrines | its rank on the curve |

**Then, and only then, the band was re-derived.** `pacing.mjs`'s own ruling permits the
re-derivation in a round that does the work — but only in that order, and the analyzer said so
explicitly.

**The arithmetic, shown rather than asserted.** `worshipBonus()` is `min(10.0, 0.01 ×
unlimitedDR(worship, 1000))`, which is Kittens' Solar Revolution curve at Kittens' own
coefficient. Inverting it:

| bonus | worship required |
|---|---|
| **1.00%** | **1,000** ← Kittens gates Solar Revolution here |
| 5% | 15,000 |
| 8% | 36,000 |

**So 1% is the one number on this curve with a source: it is the exact bonus the formula pays at
the exact threshold the source gates on.** The condition becomes `Convergence at Sparks ≥ 1%`, a
FLOOR. The 5–8% band's upper edge had no derivation and neither did my replacement for it; the
upper edge is now `worshipBonus()`'s own +1000% cap, stated as vacuous.

`worshipBonus()` itself is **byte-identical** to HEAD, verified by diff, and `test-v58` asserts
the anchor pays exactly 1.00% at 1,000 worship and that the function still floors at 0 and caps
at +1000%.

---

## 4. Part 3 — the Scholarship restructure, and a prediction that held

`SCHOLAR_LINE` is an additive accumulator, the same shape as `BARN_LINE` and `WAREHOUSE_LINE`.

| | figure |
|---|---|
| retired multiplicative chain | `1.25 × 1.30 × 1.30 × 1.35 × 1.40` = **×3.9926** |
| shipped additive accumulator | `1 + (0.25+0.30+0.30+0.35+0.40)` = **×2.60** |
| **the cut** | **34.9% at five rungs** |

`scholarMult *= ` appears **nowhere** on stripped source. The prose is regenerated: a rung now
says **"+25%"** where it said "×1.25", because saying ×1.25 for a rung that adds is the drift
class v0.43 Part 0 built these generators to end.

**The analyzer called this a null slice and the analyzer was right.** The classification was run
BEFORE any compensating change, exactly as the spec ordered:

| resource | kind | continuous consumers | lumpy sinks | cap-out before | cap-out after |
|---|---|---|---|---|---|
| **culture** | `lumpy-only` | **0** | 28 | **89.7%** | **89.8%** |
| devotion | `lumpy-only` | 0 | 4 | 0% | 0% |
| renown | `lumpy-only` | 0 | 20 | 39.5% | 47.7% |

**A 12.4% ceiling cut moved culture's time-at-cap by 0.1 points.** That is §24's prediction
confirmed as a testable claim rather than assumed: a resource pinned by a lumpy sink does not
care which ceiling it is pinned to. **No compensating `cultureCapPct` change was shipped, and
that is the finding, not an omission.**

---

## 5. Part 7.1 — Renown's last 1.7 points, closed by classification

Renown read 71.7 / 72.8 / 72.9% against a v0.57 trigger of <70%. One point of `renownCapPct`
would have closed it. **§24 exists to stop exactly that, and this is the round it stopped it.**

Renown's sinks are champion recruitment (`RECRUIT_BASE 250 × 1.5ⁿ` — the tenth costs 9,611 in a
single lump) and training. Both lumpy, both dynamically priced, **no continuous consumer at all**.
Its cap-out fraction measures the gap between champion purchases, not the tightness of the
ceiling.

**The percentage target is RETIRED for Renown** and replaced by two conditions a lumpy sink can
actually fail, both emitted per run:

- **A — the ceiling clears the largest SINGLE purchase.** Measured post-cut at the 450-year
  slice: ceiling 47,240 against a largest single purchase of 4,271. **PASS.**
- **B — the champion ladder completes.** Judged at full length; see §8.

This is STANDING-RULINGS §26 and it governs any resource `resourceBalance` classifies
`lumpy-only`.

---

## 6. Part 7.2 + Part 8.1 — one building closes two dead ends

Pass condition 5 asked all four Era-3 raws to sit between 30% and 60% time-at-cap. §24's
restatement showed **the band cannot describe any of them**. Measured at hexcore: shimmer held
**100%** of its ceiling, **gross 0/s, consumed 0/s, 10 lumpy sinks**. Nothing drew it per tick.

The spec offered two exits and asked for a choice. **The consumer ships**, in the version that
closes Part 8.1 in the same slice — because the two were one problem seen from opposite ends:

- **shimmer** accumulated because nothing consumed it continuously;
- **Void Essence** accumulated because its only sink is Riftsteel;
- **Riftsteel** (voidessence 150 + **hexgear 375**) was never forged because hexgear is a `made`
  good with **no producer at all** — every unit hand-crafted out of alloy 25.

**The Chem-Forgeworks** is Kittens' converter shape exactly — repeatable, priceRatio 1.15, raw +
mana in, refined out, worked rather than `autoprod` — taking `shimmer 0.05/s + mana 0.5/s` and
paying `hexgear 0.005/s` per copy. At the ~10-copy scale its price is rank-matched to, that is
0.5 shimmer/s drawn against ~1.0/s produced by the Refinery family (**P/C ≈ 2**, comfortably
inside "stock-limited"), and 40 hexgear per game-year — **Riftsteel's 375 in roughly 9 game-years
against the hundreds Icathia lasts.**

It is in `BUILD_ORDER` in the same slice that adds it. That is not politeness: the Shimmer
Refinery measured 0 copies for four rounds because the bot never considered it, and it was read
as a pricing defect for four rounds.

**And shimmer and voidessence are reported together as resources with no sink** — the analyzer's
point that two of them is a pattern, not two incidents.

---

## 7. §7 — invariants re-pointed this round, with their superseding cause

Fifteen shipped assertions across nine suites. **Every one is re-pointed, none deleted**, and
each carries its superseding spec item in a comment at the site.

| suite | assertion | superseded by | what survives |
|---|---|---|---|
| `test-v32` | scouting's cost moves with a Discovery discount | **note 14** — discounts scoped to Wilds | scouting is a flat 500 that nothing moves |
| `test-v40` | Scholarship IV+V are ×1.89 on culture | **Part 3** | ×1.75 additive; the isolation half is untouched |
| `test-v40` | festival spends the Mushrooms | **note 12** | it costs plumes + mushrooms + provisions |
| `test-v40` | festival pays full +30 comfort on an empty larder | **note 12** | retired — the mechanic is gone |
| `test-v40` | festival cannot pass the 175 ceiling | **note 12** | retired — there is no comfort ceiling to press |
| `test-v41` | the Tome tooltip explains where the cap went | **note 8** | it must not RE-advertise the deleted cap |
| `test-v41` | three pre-Sparks tiers give ×2.1125 | **Part 3** | all three still land before Sparks; ×1.85 |
| `test-v41` | Krugs carries the crystal faucet | **note 5.1** | a faucet exists, and it is not the first-tech camp |
| `test-v42` | Scholarship cut ×22.4 → ×4 | **Part 3** | now ×2.60 additive |
| `test-v42` | regression: Krugs still produces crystals | **note 5.1** | inverted — a re-appearance is still a regression |
| `test-v43` | descriptions state the ×multiplier applied | **Part 3** | descriptions state the +% applied |
| `test-v44` | Scholarship multiplies culture ×3.99 | **Part 3** | it still reaches culture, at ×2.60 |
| `test-v45` | the festival is worth what your larder is missing | **note 12** | it is worth +30% in EVERY state — including the full-larder dead spot the old assertion was pinning |
| `test-v49` | Wilds yields render ≥3 lines | **note 5.1** | ≥2 — the clause count was never the property |
| `test-v50` | tool prose states the line total | **note 9** | the prose is still GENERATED; the spoiler is gone |
| `test-v55` | Convergence band is 5–8% | **Part 2** | Convergence IS a pass condition |
| `test-v56` | `capsIf` is read ungated by the tooltip | **note 2** | both read sites are the gated form |
| `test-v57` | Scholarship ×2.1125 / ×3.9926 | **Part 3** | ×1.85 / ×2.60 |
| `test-v57` | the 20-Hall ceiling clears the CUMULATIVE ladder | **Parts 3 + 7.1** | it clears the largest SINGLE purchase — §26 rules the cumulative figure was the wrong target |
| `test-v57` | the restructure is DATED, not shipped | **Part 3** | flipped: the chain must be GONE |
| `test-v57` | Rites re-based to y75 with a margin | **Part 1** | y75 with a declared `median` shape and a reason |
| `test-v57` | Convergence kept at 5–8% as a marker | **Part 2** | re-derived as a sourced floor |
| `test-v57` | VERSION is v0.57 | round | shape asserted; value pinned in the round's own suite |

---

## 8. Pacing — one full-rigour gate, three seeds, run concurrently

**One full-rigour gate, three seeds, 2,500 game-years, run concurrently in 4,015.7 s.** It was
run twice: the first gate FAILED and the failure is reported in §8.3, because it is the round's
second-largest finding.

### 8.1 The pass-condition table

| condition | shape | verdict | measured |
|---|---|---|---|
| Rites of Targon before y75 | median | **PASS** | median **68.5** (62.4 / 76.8 / 68.5) |
| First Ascent occurs | all-seeds | **PASS** | 68.5 / 81.6 / 76 |
| First champion before y120 | max | **PASS** | worst **96.4** (79.1 / 96.4 / 83) |
| **peak population in the 150–220 band** | median | **PASS** | median **210** (210 / 211 / 128) |
| Sparks before y500 | max | **PASS** | worst **157.4** (157.4 / 135.7 / 143.5) |
| morale in the 90–140 band ≥80% after y60 | single | **FAIL** | **76 / 72 / 98** — attributed in §8.4 |
| morale not pinned above 140 after Era 3 | single | **PASS** | 1 / 1 / 1 |
| Chemtech → Hexcore under 400 y | max | **PASS** | worst **109.3** (109.3 / 108.4 / 49.2) |
| **Convergence at Sparks ≥ 1%** (re-derived floor) | median | **PASS** | median **4.92%** (6.72 / 3.88 / 4.92) |
| cheapest trade affordable at Sparks | single | **PASS** | true / true / true |

**1 of 10 failing.**

### 8.2 Headline pacing, against the v0.57 baseline

| figure | v0.57 | **v0.58** | spread |
|---|---|---|---|
| **Era 3** | 1,734.6 (1,672 / 1,735 / 1,784) | **1,403.9** (1,497.6 / 1,310.2 / — ) | **×1.14** |
| Sparks | — | 143.5 (135.7–157.4) | ×1.16 |
| Hexcore | — | **399.8** (399.6–404.3) | **×1.01** |
| Deep Works | — | 1,383.3 (1,317.6–1,488.5) | ×1.13 |
| **firstTrade** | 317.2 / 350.8 / 1,414.8, **×4.46** | 228.9 / 326.1 / 167.9, **×1.94** | **×4.46 → ×1.94** |
| tenth champion | 1,450.7 / 1,570.7 / 1,640.8 | 1,654.9 / 1,445.6 / — | ×1.14 |
| peak population | 181–185 | **210 / 211 / 128** | — |

**Era 3 shortened by ~330 game-years to 1,403.9 and stays inside the 1,400–2,300 target band — but
only just, and on the lower edge.** The direction is what Part 2 predicted (a global production
bonus arriving earlier shortens Era 3) and the magnitude is larger than predicted. **Icathia is
reached on 2 of 3 seeds; seed 3 does not reach it inside 2,500 years, and neither does its tenth
champion.** That is a genuine "say which edge moved" item and the edge is the lower one.

**`firstTrade`'s spread is ×1.94, not the "under ×1.5" the spec asked for.** Part 5's deliverable
was the spread and it improved by a factor of 2.3, from the single most chaotic figure in the game
to the fourth. It is not closed.

### 8.3 The first gate failed, and the failure was mine

The first ensemble ran to completion and reported **Icathia NEVER reached on any seed** and peak
population 108 / 140 / 107. The cause was §28's own fix:

```
route demacia   open 398,406 ticks · affordable 122,828 · surplus-ok 122,709
TRADE BANKING: the reserve held an expedition back 434,498 times
```

**Roughly fifty trades a game-year, sustained for 2,500 years, funded by a reserve that starved
the expeditions Era 3's raws come from.** Removing the ceiling clause removed the only thing that
had ever accidentally throttled trade, and I put nothing in its place.

**The missing half of the rule is the OUTPUT.** A player does not run a caravan because they can;
they run it because they want what it brings back. The bot now skips a route whose declared
`primaryYield` is already at 90% of its ceiling — reading the game's own faction data. Measured
on seed 1 at 600 years, same seed both sides:

| | before | after |
|---|---|---|
| trades | ~50/game-year | **27 in 600 years** |
| first trade | y228.9 | y228.9 |
| reserve blocks | 434,498 | **58** |
| vigor on expeditions by y100 | 96,354 | **128,428** |

And the per-route split on the shipped gate shows the new rule doing visible work:
`demacia … refused by <yield already full> ×76,575`, `freljord … ×14,537`. **Three routes are now
live where the project had only ever measured one.**

### 8.4 The morale band, and why it failed

`MORALE min 86 max 157 (n=5,000)`; the band reads 76 / 72 / 98%.

**This is attributable to dev note 12, and it is a direct consequence of shipping the note as
written.** A +30% multiplier on a settlement sitting at its normal ~115 morale produces ~150,
which is outside a 90–140 band by construction. The companion condition — *"not pinned above 140
after Era 3"* — reads **1%**, so this is not a settlement living above the band; it is a
settlement leaving it during festivals.

**Shipped as specified, reported as a disagreement with a measurement, per project practice.**
The next round has a clean choice and it should be Jerry's: either the band is wrong (a festival
SHOULD feel like something, and a ceiling that forbids it is a ceiling that forbids celebration),
or the festival's contribution should be clamped the way the old design clamped it. **I would not
guess which.**

### 8.5 Parts 7.2 and 8.1 — both dead ends are open

| | before | **after** |
|---|---|---|
| shimmer classification | `lumpy-only`, gross 0/s, **consumed 0/s** | **`stock-limited`, P/C 13.44** |
| Chem-Forgeworks built | — | **9** |
| **Riftsteel forged** | **NEVER, in the project's history** | **23** |
| Rift Anchors built | **NEVER** | **14** |
| Void Essence | monotone after Icathia | **non-monotonic — PASS**, 7,130 spent |

**Two of v0.53 Part 4's long-failing conditions now pass**, and pass condition 5 finally applies
to something: `the 30-60% cap-out band applies ONLY to stock-limited raws: shimmer → FAIL`, at
87.4%. **That FAIL is worth more than the previous PASS-by-vacuity** — the band now measures a
real resource and says the ceiling is too tight for the consumer that was just added. Sizing it
is next round's work, and for the first time it is a sizing question rather than a
classification one.

### 8.6 Parts 3 and 7.1 at full length

```
rungs held 5/5   Σ 1.60 → ×2.60   (the retired chain on the same members: ×3.9926)
  culture   cap 162,143   cap-out 97.4%   28 lumpy sinks   LUMPY SINK ONLY
  devotion  cap 141,794   cap-out  0.0%    4 lumpy sinks   LUMPY SINK ONLY
  renown    cap 312,763   cap-out 74.2%   12 lumpy sinks   LUMPY SINK ONLY
  RENOWN condition A — ceiling 312,763 vs largest single purchase 14,416 → PASS
  RENOWN condition B — 10/10 champions recruited → PASS
```

**The instrument reaches all five rungs at full length, which is what v0.57's census predicted and
what sized the cut at 35% rather than 20%.** And Part 7.1's substantive conditions both pass by
wide margins — the ceiling clears the largest single purchase **21.7×** over — while the retired
percentage target would still read 74.2% and still "fail". **That is the case for §26 in one
line.**

---

## 9. Jerry's fourteen dev notes

| # | note | shipped |
|---|---|---|
| 1 | Deepwater Docks claims Harbor without naming Smelting | `discoveryUnlocks()` **derives** the line from the gates and names every one: *"Unlocks Harbor (also requires Smelting)."* |
| 1.1 | audit ALL discoveries | it is a **generator**, so all three are covered and any future one is too: Slab-Cutting names Carpentry, Chemtech Distillation names Hextech Theory |
| 2 | Warehouses shouldn't say +provisions before the discovery | the conditional cap line is printed **only when its gate is held**. This overturns v0.56 Part 5's stated intent, and the directive is the ruling |
| 3 | ETA missing on layered crafting | the `&& !isSub` guard is removed — the sub-row is the raw material the player is actually waiting on |
| 4 | Hextech Theory doesn't show it unlocks the tinkerer | `techUnlocks()` read only the declarative `tech:` field and never the `unlock` closure. Now reads both, for jobs, buildings and expeditions |
| 5 | Krugs give far too much gold too early | **20–40 → 6–12 base, a 70% cut.** The sizing is Jerry's own parenthesis: `campYieldMult()` reached ×5.79 and an empowered hunt multiplies by 3.0 again, so the real top end was **695 gold for 150 vigor** at the first Wilds tech. Now 208. Ore untouched |
| 5.1 | Krugs shouldn't give hextech crystals | the 30% drop is **deleted** — an entire tier's currency arriving before the tier |
| 6 | don't explain the undo mechanic, show the yield | the toast label is rewritten **after** the run from the actual resource deltas |
| 7 | crafts should log what they cost | the chronicle line carries the spend as well as the gain, **and mana→timber is no longer silent** — including the Arcanist's Circle's automatic yearly draw |
| 8 | descriptions shouldn't be changelogs | the Tome desc is flavour only; two more "no longer" sentences swept from the morale tooltip and the Watcher's Eye |
| 9 | no "one rung of the axe line", no "(×4.45 with all 7)", no "Masonry 1, or 2" | line totals and internal line names removed from the axe, plough, saw, Masterwork and Masonry prose. **The generation property is kept and still asserted** |
| 10 | Masonry description is unclear | *"Barns and cellars hold +75% more Timber, Ore, Steel, Mana. Warehouses and yards hold +25% more of those, and of Gold, …"*. The number was never the problem — the noun in front of it was |
| 11 | confirm wanderer XP matches Kittens | **it cannot be confirmed, and no number was invented — see below** |
| 12 | Festival: +30% morale for a year, costs Plumes + Mushrooms + Provisions | shipped, tick-denominated (4,000 ticks = one game-year), applied to the finished morale figure so it is worth +30% in every state — including the full larder where the old design paid literally nothing |
| 13 | Warehouse should contribute to the crystal cap | `crystals: 15`, one rung below the Harbor's 20, on the `broad` scope |
| 14 | "expeditions" is confusing — say Wilds expeditions | reworded **and made true**: the vigor discounts now apply to Wilds expeditions only |

**Note 11, in full, because "I could not verify it" is a result and deserves its evidence.**

- **CONFIRMED, and newly sourced:** Kittens runs at **5 ticks/s, 200 ms each** (wiki, Game
  Mechanics, verbatim). RR's `TICK_MS = 200` is therefore exact tick parity, so any per-tick
  figure ports 1:1 — one whole class of conversion error is now excluded, and it had never been
  written down.
- **CONFIRMED:** the source ladder, verbatim — Dabbling 0 / Novice 100 / Adequate 500 /
  Competent 1200 / Skilled 2500 / Proficient 5000 / Master 9000 → +18.75%. This re-confirms the
  **27.8% parity debt** in RR's Challenger at 11,500 for the same top bonus.
- **NOT CONFIRMED — the rate.** `skillXP` is a local computed between `js/village.js:2623` and
  `:2644`. Three retrieval routes were tried and all three are now recorded as dead ends: the
  raw file is too large to be delivered in full and every targeted excerpt query returns "not
  present"; **grep.app's HTML search is disallowed by its robots.txt**; and **grep.app's JSON
  endpoint silently ignores the repository filter** and returns matches from unrelated projects.
- **So `XP_PER_SECOND = 0.5` remains an RR-original number set by directive, labelled UNVERIFIED
  in the ledger.** It was not changed on a guess: this round moved trade, storage and the faith
  curve, and inventing an XP rate on top of that would have made none of them measurable.

**Note 14 is a balance change, not a wording change, and I am flagging it as one.** `scouting`
carries `tab: "trade"`, so scoping the discounts to Wilds expeditions raises its price from
500 × 0.85 × 0.90 = 383 to a flat 500 once both upgrades are held. **Shipped as specified.** But
this round established that faction discovery is the single most load-bearing thing vigor buys —
see the headline — so if a later round finds trade discovery slipping, this is the first place
to look.

---

## 10. The suites

**27 live suites, 1,341 assertions, 0 failures.** `tests/test-v58.mjs` is new and carries 70
assertions: the seventeen round pass conditions in spec order, plus one block per dev note.

The isolation assertions Part 4 asked for are in and they are the ones that matter:

- the Scholarship line delivers **×1.0000** to timber and gold;
- the Masonry line delivers **×1.0000** to culture, renown and devotion;
- `capFamilyOf()` is **total and single-valued** over every capped resource;
- the four tiers read **×14.98 / ×2.80 / ×2.0875 / ×1.00** and the sums **4.35 / 1.80**.

Isolation is the property that actually broke once — four resources in two families at a time
with a ternary silently picking the winner — and until this round nothing stopped it recurring.

---

## 11. Files

| file | change |
|---|---|
| `index.html` | Chapel; Chem-Forgeworks; `SCHOLAR_LINE` additive; `discoveryUnlocks()`; `techUnlocks()` reads closures; Krugs; Festival; Warehouse crystals; sub-row ETA; craft + transmute chronicle lines; undo toast; Wilds-scoped vigor discounts; prose sweeps; `VERSION` |
| `sim/pacing.mjs` | shaped conditions + `--seeds 1` refusal; Convergence floor + arithmetic; scholarship family readout; Renown Part 7.1 verdict; population ruling; trade refusal/per-route diagnostics; final-state balance |
| `sim/simcore.mjs` | `tradeSurplusOk` re-denominated; banking reserve; Targon snapshot; scholarship census fixed to additive; `snaps.final`; `chapel` and `chemForgeworks` in `BUILD_ORDER` |
| `tools/parity-ledger.mjs` | Chapel, Chem-Forgeworks, Void Studies rows; acolyte and XP rows updated |
| `tests/test-v58.mjs` | new, 68 assertions |
| nine historical suites | fifteen assertions re-pointed, none deleted (§7) |
| `STANDING-RULINGS.md` | §23a, §26, §27, §28 |
| `docs/PARITY-LEDGER.md` | regenerated at v0.58 — 222 rows, PARITY 56, EASIER 38, HARDER 1, UNVERIFIED 127 |
