# BUILDER SPEC v0.58 — the Convergence formula was never the problem, and the 5–8% target has no source behind it

Written against the **v0.57 tag**, verified from disk on a fresh clone.

**Everything reproduces.** All 26 suites: **1,273 assertions, 0 failures.** Two independent
2,500-year runs reproduce the ensemble's per-seed values to the digit — seed 1 → Sparks y137.4,
Icathia y1872.0, **Era 3 1,734.6**, 130 wanderers y1726.5, peak pop 185, morale band 100%,
Convergence 1.42%; seed 2 → Sparks y157.2, Icathia y1829.3, **Era 3 1,672.1**, 130 at y1415.4,
peak pop 181. **The spread collapse is real** and Era 3 is inside its target band on both draws I
took.

**And every code claim verifies, including the one Jerry asked to have double-checked.**
`VERSION v0.57`; `CONSUMPTION 4.25` with farmer:eater **1.17647**; the farmer's description is
now plain `+5 provisions/s` and its output is **identical in all four seasons** (2.5/s at ten
farmers) while seasonal buildings still read ×1.5 / ×1.0 / ×1.0 / ×0.25; `capFamilyOf()` puts
**every capped resource in exactly one family** with `renown` in `scholar`; `renownCapPct 0.08`
delivers **exactly `1 + 0.08n`** (30 → 4,554 at ten Halls against 2,530 × 1.80); the ten dead
`renown:` fields in `CHAMPS` are **gone**; the ladder holds at 37 · 9 ties · ×1.1111 · ×1.2632 ·
×3.333; both audit graphs zero; and the ledger is **220 rows — PARITY 54, EASIER 38, HARDER 1,
UNVERIFIED 127**, which sums correctly now that the generator aborts if it does not.

> **Jerry's note 2 — "double check that storage is scaling correctly" — checked, and it is.**
> Measured on a bare state with the storage line fully researched: **timber ×14.98** (narrow),
> **gold and crystals ×2.80** (broad), **provisions ×2.0875** (quarter), **voidessence ×1.00**
> (none) — the source's own 4.35 / 1.80 accumulators to four decimals. And the families do not
> leak into each other: the Scholarship line delivers **×3.9926 to culture, devotion and renown
> and ×1.0000 to timber**, while the Masonry line delivers **×1.0000 to culture and renown**.
> **No change is warranted. Part 4 turns that measurement into an assertion**, because it is
> currently checked by nothing.

**The one thing I could not verify is the round's own headline**, and it is deliberate: the
ensemble is three seeds and I ran two. Both agreed with the report exactly, so I am recording
the median as reproduced rather than re-derived.

---

## Part 0 — Ground rules

**This spec produces `v0.58`.** Tag authoritative (§10). Assert the `vN.NN` shape everywhere
except this round's own suite — **five consecutive rounds have each fixed the previous round's
literal pin and then made their own.**

**Read `BUILDER_PROTOCOL.md` first.** v0.57 is the first round run under it and it saved about
three hours: fast single-seed short checks per part, the full three-seed ensemble **once**, at
the end, as the gate.

**Do not re-open** STANDING-RULINGS §§1–25. This round touches two of them **only in the ways
they themselves provide for**: §23 dates the Scholarship restructure to v0.58 and this is v0.58;
and the Convergence condition's own ruling in `sim/pacing.mjs` says it *"may not be re-based to
the measured value in any round that does not also do the Convergence work"* — **this round does
the Convergence work**, so Part 2 is the sanctioned path, not a re-base of convenience.

**§3 is NOT re-opened.** The Convergence stripe is Kittens' literal
`0.01 × unlimitedDR(worship, 1000)` capped ×10 and Part 2 does not touch the formula. It touches
the *inputs* and the *target*.

---

## Part 1 — Milestone pass conditions become median-and-spread (Jerry's note 1)

**The builder's own error is the argument.** Rites of Targon was re-based to y75 from v0.56's two
seeds; the v0.57 ensemble reads **70.3 / 76.7 / 83.3** and it fails on two of three. A scalar
threshold against a ×1.18 figure is a coin toss, and the instrument now reports both numbers.
This is the top apparatus item and the direct follow-on to v0.57 Part 3.

- **Restate every milestone-derived condition in `sim/pacing.mjs`** against the ensemble's
  **median**, and print the spread beside it. The ENSEMBLE / SINGLE-RUN labelling §25 introduced
  is already binding; the conditions have simply not caught up with it.
- **Where a condition is genuinely about the worst case, say so and assert the max** — "Sparks
  before y500" is a *ceiling* condition and belongs on the max, not the median. Each condition
  needs one of three explicit shapes: **median**, **max** (no seed may exceed), or **all-seeds**
  (every draw must pass). **Pick one per condition and record which and why**; a condition whose
  shape is unstated is the defect this Part exists to remove.
- **A single-seed run must refuse to evaluate an ensemble condition** rather than evaluating it
  on one draw — print `n/a (needs --seeds)`. That is what would have caught the Rites re-base.
- **Pass conditions:** every milestone condition carries a declared shape; a `--seeds 1` run
  reports none of them as pass or fail; `test-v58` asserts the shape declaration exists for each.

---

## Part 2 — The Convergence round, five times deferred (Jerry's note 3)

> Jerry: *"Convergence bonus values should follow Kitten's Worship production bonus… This means
> making sure devotion/faith production should be very similar."*

**I checked all three links in that chain against source. Two are already at exact parity, the
third is a missing building, and the thing that is actually failing is the target itself.**

### 2.1 The formula is at parity and is closed

`worshipBonus()` is `0.01 × unlimitedDR(worship, 1000)` capped ×10, and
`unlimitedDR(v, s) = (√(1 + 8v/s) − 1) / 2` — Kittens' Solar Revolution shape exactly.
**STANDING-RULINGS §3 closes it. Part 2 does not touch it.**

### 2.2 The production rates are at exact parity, per unit — verified this session

| RR | rate | Kittens | source | verdict |
|---|---|---|---|---|
| Acolyte (job) | **0.0075 devotion/s** | priest `faith: 0.0015`/tick × 5 | `js/village.js` jobs array | **exact parity** |
| Shrine of the Solari | **0.0075 devotion/s** | **temple** `effects["faithPerTickBase"] = 0.0015` × 5 | `js/buildings.js:1910` | **exact parity** |
| — *(nothing)* | — | **chapel** `effects["faithPerTickBase"] = 0.005` × 5 = **0.025/s** | `js/buildings.js:1858` | **RR has no analogue** |
| Marus Omegnum | 0.05 devotion/s | — | — | 2× the Chapel; RR-original |
| Aspect's Sanctum | `boost.devotion 0.10` | — | — | a multiplier, not a producer |

**So "devotion/faith production should be very similar" is already true where the two games
map** — and the gap Jerry is reaching for is structural: **Kittens has a middle faith producer
at 0.025/s that RR never ported.** RR jumps from a 0.0075/s starter straight to a 0.05/s
capstone, and the Sanctum in between produces nothing at all.

### 2.3 The 5–8%-at-Sparks target has no source derivation, and this is the round that may say so

Solving `0.01 × (√(1 + 8w/1000) − 1)/2` for the target band gives the worship it demands:

| Convergence at Sparks | worship required |
|---|---|
| **5%** (target floor) | **15,000** |
| **8%** (target ceiling) | **36,000** |
| 1.42% (measured, seed 1) | ≈ 1,720 |
| 3.71% (measured, seed 3) | ≈ 8,740 |

**And here is the source comparison nobody has taken: Kittens gates Solar Revolution at 1,000
worship, and at 1,000 worship this same formula delivers exactly 1.00%.** A player who has just
unlocked the source's equivalent upgrade gets one per cent. **RR's measured 1.42–3.71% is
already above the source's unlock-point value; the 5–8% band asks for 15–36× the source's
unlock threshold.**

The band has stood since v0.46 and no document derives it. `sim/pacing.mjs`'s own ruling says it
must not be re-based in a round that does not do the Convergence work. **This round does it, so
re-derive it from the source rather than from what we happen to measure.**

### 2.4 What to ship

1. **Port the Chapel.** A middle Targon producer at **0.025 devotion/s**, rank-matched to
   Kittens' chapel and priced from it, sitting between the Shrine and the Marus. This is the
   parity item, it is the substantive half of Jerry's note, and it raises worship at Sparks by
   construction rather than by tuning a number.
2. **Re-derive the Convergence condition from the source.** State the worship RR expects at
   Sparks, state the bonus that worship produces under the unchanged formula, and set the band
   there — with **Kittens' own 1,000-worship / 1.00% unlock point recorded beside it** as the
   anchor. If the honest answer is that the band should be **1–4%**, say so; the failure was the
   target, not the game.
3. **Do not touch `worshipBonus()`, the Ascent, or the stripe.** §§1 and 3.

**Pass conditions:** the Chapel analogue exists at 0.025 devotion/s with a stated source
citation and a rank-matched price; worship-at-Sparks reported on all three seeds before and
after; the Convergence band is re-derived with its arithmetic shown, and the 1,000-worship /
1.00% source anchor is recorded in `pacing.mjs`; `worshipBonus()` is byte-identical.

**Predicted vs measured:** the Chapel roughly triples the mid-game devotion line. **Expect
worship at Sparks to rise 2–4×** — from ≈1,700–8,700 to ≈5,000–25,000 — and Convergence at
Sparks to land in **3–6%**. If it lands above 8% the Chapel is priced too cheaply for its rung;
if it moves less than 2× the bot is not building it, which is an apparatus finding, not a
balance one.

---

## Part 3 — The Scholarship restructure (Jerry's note 4, §23's dated slice)

§23 dates it here. The v0.57 census corrected the sizing: **the instrument reaches 5 of 5 rungs,
not 3**, so the conversion is a **35% cut, not 20%** — `1.25 × 1.3 × 1.3 × 1.35 × 1.4 = ×3.9926`
against an additive `1 + (0.25 + 0.30 + 0.30 + 0.35 + 0.40) = ×2.60`. **Both figures verified
this session.**

**Kittens' Law is category-general** (HANDOFF §3): additive within a category, multiplicative
only between. Five members of one category multiplied is the same violation §19 removed from the
material line, and it now governs **culture, devotion and renown** — including, since v0.57, the
ceiling that gates the champion ladder.

- **Convert `SCHOLAR_LINE` to an additive accumulator**, the same shape as `BARN_LINE` and
  `WAREHOUSE_LINE`.
- **Size it against `cultureCapPct`, the shape RR already ports.** Kittens relieves culture with
  **`ziggurat` `cultureMaxRatio: 0.08` at priceRatio 1.25** — verified from `js/buildings.js`
  this session — additive per copy and unbounded, and RR already carries it as `cultureCapPct`
  on the Watcher's Eye (0.08) and the Ice-Wrought Spire (0.04). **The upgrade line is not
  supposed to be the whole culture ceiling; the buildings are.** If the 35% cut leaves culture
  short, the compensation goes on `cultureCapPct` — **not back into the chain.**
- **Culture is at 97.1–97.3% time-at-cap on all three seeds and has been for three rounds.**
  §24 governs what to do next: **check `resourceBalance` before sizing anything.** If culture is
  lumpy-sink-bound rather than stock-bound, a bigger ceiling does nothing and the finding is that
  the ceiling was never the constraint.
- **Renown is on this line now.** The cut lands on it too, and Part 7 measures whether it can
  absorb it. **Sequence: Part 3 then Part 7**, and report Renown's ceiling and the tenth
  champion's year on both sides of the cut.

**Pass conditions:** `scholarMult *= ` appears nowhere on stripped source; the additive Σ and the
delivered multiplier are asserted; culture's `resourceBalance` classification is reported before
any compensating change; the tenth champion is still reached on all three seeds; if
`cultureCapPct` moves, the per-copy figure and the count it was sized at are stated in the code.

**Predicted vs measured:** a 35% ceiling cut on three resources that are all at or near their
ceilings. **Expect culture's time-at-cap to stay above 90% — that is the prediction, and it is a
prediction of no effect**, because a resource pinned at 97% with a lumpy sink does not care which
ceiling it is pinned to. **If culture's cap-out falls materially, culture was stock-bound after
all and §24's classification is wrong for it** — which would be the more interesting result.

---

## Part 4 — Storage scaling: verified, and now asserted (Jerry's note 2)

Checked this session and **correct** — the measurements are in the header. **There is no defect
here and none should be invented.** What is missing is the guard:

- Assert the **four delivered tier multipliers on a bare state** (×14.98 / ×2.80 / ×2.0875 /
  ×1.00) and the two accumulator sums (4.35 / 1.80).
- Assert **family isolation**: the Scholarship line delivers ×1.0000 to a Masonry-line resource
  and the Masonry line delivers ×1.0000 to a Scholarship-line resource. Before v0.57 four
  resources were in two families at once and a ternary silently picked the winner; nothing
  currently stops that recurring.
- Assert `capFamilyOf()` is **total and single-valued** over every resource with a `baseCap`.

`test-v57` asserts the tier table; it does not assert isolation, and isolation is the property
that actually broke once.

---

## Part 5 — The trade-banking policy (Jerry's note 5)

`firstTrade` spreads **×4.46** — 317.2 / 350.8 / 1,414.8 — while everything else collapsed to
×1.07–1.37. It is now the single most chaotic figure in the game, and it is **the same class of
defect Part 4 of v0.57 just fixed for food**: a greedy bot with no banking policy, spending vigor
on expeditions the instant it can afford one and never saving for a route.

Deferred four rounds. **v0.57 proved the pattern pays**: teaching `manageJobs()` to project and
bank took the Era-3 spread from ×2.62 to ×1.07.

- Teach `manageTrade()` a banking rule: hold vigor when the stock is within reach of the cheapest
  affordable route and no expedition is urgent. **State the rule in a comment**, as the food
  policy does.
- **Report `firstTrade`'s spread before and after** — that is the deliverable, not the median.
- **Do not change a route price.** §16: fix the bot, do not price around it.

**Predicted vs measured:** `firstTrade` spread **×4.46 → under ×1.5**. Trades per game-year rise;
Era 3 moves by **−100 to +150** and the direction is genuinely unknown — trade is raw material,
so more trade is more production, but a banking bot also spends less vigor on expeditions.
**Whichever way it goes, attribute it.**

---

## Part 6 — Rule on target population (Jerry's note 6)

**130 wanderers reads y1,415–1,726 against a y600 target and has failed five rounds.** Peak
population is **181–185** on all three seeds. Every other number in the project improved when
population stopped running away — morale's band crossed 80% for the first time in the project's
history at exactly the moment peak population fell from 220 to 181–185.

**This is a ruling, not a tuning item, and it needs Jerry.** Two coherent positions:

- **~180 is the target.** Then the 130-wanderers condition is measuring an obsolete goal and
  should be **restated as a population *band*** — e.g. peak population 150–220 — with the
  y600 milestone retired and its reason recorded. Kittens' own population is governed by hut
  capacity and catnip, not by a milestone year, so a band is the source-shaped statement.
- **130 by y600 is still the goal.** Then the food economy is over-tight and `CONSUMPTION`, the
  Farmstead or the housing line has to move — and **each of those is at verified source parity
  right now**, so the change would be a deliberate RR-original divergence and must be labelled
  EASIER in the ledger.

**Action either way: state which, in `pacing.mjs`, with the reason.** A condition that has failed
five consecutive rounds without a ruling is not a condition. **Do not re-base it to the measured
value** — that is the trap `pacing.mjs`'s own Convergence ruling names.

---

## Part 7 — Renown's last two points, and pass condition 5 (Jerry's notes 7 and 8)

### 7.1 Is Renown lumpy-sink-bound? (note 7)

Renown reads **71.7 / 72.8 / 72.9%** time-at-cap against the v0.57 trigger of **<70%**. The
dedicated line did the substantive work — 88.7% → 72%, and the tenth champion is now reached on
every seed — and the temptation is to add another percentage point for the last 1.7.

**§24 exists precisely to stop that.** Renown's sinks are champion recruitment
(`RECRUIT_BASE 250 × 1.5ⁿ`, so the tenth costs 9,611 in one lump) and champion training
(`40 × (lvl+1)^1.6`). **Both are lumpy and dynamically priced.** A resource that sits at its
ceiling waiting for one large purchase is not ceiling-limited, and raising the ceiling moves the
cap-out fraction by nothing.

- **Run `resourceBalance` on Renown and classify it before changing any number.**
- **If it is lumpy-sink-bound, close the trigger with the classification, not with a
  percentage** — record that <70% was the wrong shape of target for this resource and that the
  substantive conditions (tenth champion reached, ceiling above the largest single purchase) are
  met.
- **If it is genuinely stock-limited**, then and only then size `renownCapPct` up, and state the
  count you sized at.

### 7.2 Pass condition 5 applies to nothing (note 8)

v0.57's restatement classifies **all four** Era-3 raws as lumpy-sink-only or flow-limited, so the
30–60% cap-out band applies to none of them and reports FAIL. **A condition that cannot pass by
construction is worse than no condition.**

Two honest exits, and the spec asks for a choice rather than a default:

- **Give one raw a continuous consumer.** `shimmer` is the candidate: `held/cap` reads 100% at
  every milestone because **nothing consumes it at all**, which is the same shape as
  `voidessence` accumulating monotonically after Icathia with no sink. A continuous shimmer
  consumer makes it genuinely stock-limited and the band starts measuring something.
- **Or retire the band** and replace it with the producer/consumer ratio §24 already computes.

**Ship one. Record which and why.** And note that shimmer and voidessence are now **two**
resources with no sink — report them together; a resource with no sink is a design question, and
two of them is a pattern.

---

## Part 8 — Carried, unchanged, each with its measured state

1. **The craft-depth tie-break.** Riftsteel still never forged; voidessence still monotone after
   Icathia. Two of v0.53 Part 4's conditions still fail. **This is Part 7.2's sibling** — if a
   shimmer consumer ships, look at whether the same slice can make Riftsteel forgeable.
2. **The Chembarrel / save-for-a-visible-building fix.** `catMonument` still ×1.00.
3. **`XP_PER_SECOND` is still UNVERIFIED.** `skillXP` is a local between `js/village.js:2623` and
   `:2644`; `skillsCap = 20001` at `:2622` is found and `XP_CAP` beside it is PARITY. **The two
   must not be conflated.** grep.app with the repo filter URL-encoded is the method that worked.
4. **127 UNVERIFIED ledger rows.** Ten to fifteen a round by subsystem. **Take the Targon and
   worship block this round** — Part 2 opens it anyway and it is the subsystem with the most
   newly-verified source citations.
5. **crystals at cap 94.9–96.3%.** On the Masonry broad tier; classify it with §24 in the same
   pass as culture.

---

## Part 9 — Order, discipline, pass conditions

### Order — six cumulative prefixes, snapshotted forward **before** the next Part starts

Per `BUILDER_PROTOCOL.md`: fast single-seed short check after each; the three-seed ensemble
**once**, at the end.

1. **Part 1** — the condition restatement. Measurement apparatus; it must exist before any
   later slice is judged by it.
2. **Part 5** — trade banking. The other apparatus item and the one with a spread to collapse.
3. **Part 2** — the Convergence round.
4. **Part 3** — the Scholarship restructure, then **Part 7.1** in the same slice, since the cut
   lands on Renown.
5. **Part 7.2 + Part 8.1** — the shimmer consumer and, if it fits, Riftsteel.
6. **Parts 4, 6, 8.4** — assertions, the population ruling, ledger rows.

### Operational

Median and spread for every milestone claim (§25). `--years N --seeds 3`, never a bare
positional. Check §24's classification before sizing any ceiling. Kill by PID. Strip comments
before grepping. `limitedDR` gives away 75% of its limit. Never `playwright install`. **Measured
this session: two concurrent 2,500-year runs took 1,329 s and 1,368 s** — faster than v0.57's
three-seed 2,561 s, so budget the ensemble at roughly 45 minutes. **Pushing works** via HANDOFF
§6's recipe; used for this commit.

### Round pass conditions

| # | Condition | Target |
|---|---|---|
| 1 | Every milestone condition | carries a declared shape (median / max / all-seeds) with a reason |
| 2 | `--seeds 1` | reports ensemble conditions as `n/a`, not as pass or fail |
| 3 | Chapel analogue | exists at **0.025 devotion/s**, rank-matched, source cited |
| 4 | Worship at Sparks | reported on 3 seeds before and after |
| 5 | Convergence band | **re-derived with arithmetic shown**; Kittens' 1,000-worship / 1.00% anchor recorded |
| 6 | `worshipBonus()` | **byte-identical**; §§1 and 3 untouched |
| 7 | `SCHOLAR_LINE` | additive; `scholarMult *= ` absent on stripped source |
| 8 | Culture, renown, crystals | classified per §24 **before** any ceiling is sized |
| 9 | Tenth champion | still reached on all three seeds after the 35% cut |
| 10 | Storage | four tiers and both sums asserted; **family isolation asserted** |
| 11 | `manageTrade()` banking | shipped, rule in a comment; **`firstTrade` spread before and after** |
| 12 | Target population | **ruled** in `pacing.mjs` with a reason; not re-based to the measured value |
| 13 | Renown's <70% trigger | closed by classification or by a sized change — not left open |
| 14 | Pass condition 5 | a continuous consumer ships, **or** the band is retired for a P/C ratio |
| 15 | Ledger | Targon/worship rows taken; counts sum; generator still aborts if they do not |
| 16 | Unchanged | ×20.8000 · 7 keys · limit 6 · ladder 37/9/1.1111/1.2632/3.333 · audits 0/0 · Σ 4.35/1.80 · `CONSUMPTION` 4.25 |
| 17 | Every Part | actioned, or its non-action explicitly justified |

### Predicted vs measured — medians of three, with spreads

| slice | Era 3 median | spread | note |
|---|---|---|---|
| v0.57 baseline (2 seeds re-measured) | **1,734.6** | ×1.07 | reproduces the report exactly |
| s1: condition restatement | **unchanged** | unchanged | measurement only |
| s2: + trade banking | **−100 to +150** | **`firstTrade` ×4.46 → under ×1.5** | direction genuinely unknown; attribute it |
| s3: + Convergence | **−50 to −250** | ×1.05–1.15 | a global production bonus arriving earlier shortens Era 3 |
| s4: + Scholarship cut + Renown | **≈ 0** | unchanged | **predicted to be a null slice, and stated as a testable claim** |
| s5: + shimmer consumer | **+20 to +120** | | a new continuous draw on an Era-3 raw |
| **shipped** | **1,400–1,850** | **under ×1.15** | **should stay inside the target band** |

**The s4 prediction is the one to check hardest.** v0.55 filed the XP change as "not a pacing
item" and it moved Era 3 by 193.6 years. **I am predicting a 35% ceiling cut on three resources
is a null slice, and I am predicting it because §24 says they are not ceiling-limited.** If s4
moves Era 3 by more than 100 years in either direction, §24's classification is wrong for at
least one of culture, devotion and renown — and that is a more valuable finding than the cut.

**Two informative failures to watch for.** If the Chapel moves Convergence **less than 2×**, the
bot is not building it and Part 2 measured an apparatus, not an economy. And if Era 3 leaves the
target band on any seed, say which edge moved — §13 still binds, and this is the first round in
the project's history that starts from inside the band.

---

## Sources, all read this session

**Kittens** (`github.com/nuclear-unicorn/kittensgame`): `js/buildings.js:1910` —
**`effects["faithPerTickBase"] = 0.0015`** on the temple, ×5 = **0.0075 faith/s**, exactly RR's
Shrine; `js/buildings.js:1858` — **`effects["faithPerTickBase"] = 0.005`** on the chapel,
×5 = **0.025 faith/s**, with **no RR analogue**; `js/buildings.js` — `ziggurat`
`cultureMaxRatio: 0.08` at priceRatio 1.25 and `unlockRatio 0.01`, the shape Part 3 sizes
against, and the `temple` definition's prices `gold 50 + slab 25 + plate 15 + manuscript 10` at
priceRatio 1.15; `js/village.js` — priest `faith: 0.0015`/tick, exactly RR's Acolyte;
`js/religion.js` — the Praise-the-Sun conversion `worshipGained = faith × (1 + apocryphaBonus)`,
1:1 at base as RR's Ascent is, and the religion upgrade ladder's faith prices (solarchant 150 →
transcendence 125,000). `js/resources.js` `addBarnWarehouseRatio` for Part 4's isolation
argument.

**RR**, at the v0.57 tag, comment-stripped: `worshipBonus()` at `:1313` and the `convergence`
WTECH at `:1309` (threshold 1500, `devotion 400 + crystals 25`); `ascendTargon()` at `:1344`
(1:1, free, uncapped — §1); the Acolyte at `:802` (0.0075 devotion/s); the Shrine at `:953`
(0.0075 devotion/s + 0.005 culture/s), the Sanctum at `:963` (`boost.devotion 0.10`, a
multiplier not a producer) and the Marus at `:968` (0.05 devotion/s); `capFamilyOf()`;
`SCHOLAR_LINE` (product **×3.9926**, additive-equivalent **×2.60**); `renownCapPct 0.08` on the
Hall of Heroes; `CAP_SCOPE`'s four tiers; `sim/pacing.mjs:494–525` — the Convergence condition's
own ruling, including the clause that permits this round to re-derive it.

**Measurements taken this session:** all 26 suites (**1,273 assertions, 0 failures**); **two
independent 2,500-year runs, seeds 1 and 2** (1,329.2 s and 1,368.1 s wall), reproducing the
ensemble's per-seed values exactly; a live-game probe of the storage tiers, family isolation,
`capFamilyOf` totality, the Scholarship product, `renownCapPct`'s `1 + 0.08n` shape, the farmer's
four-season output, `CONSUMPTION`, the devotion producers, the tech ladder and both audit graphs;
and an independent row-and-verdict count of the parity ledger (**220 / 54 / 38 / 1 / 127**).
