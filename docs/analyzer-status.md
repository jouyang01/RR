# Analyzer status — Runeterra Reclaimed

Standing status for the Analyzer cycle. Read alongside `STANDING-RULINGS.md` (closed rulings,
do not re-litigate) and the latest `docs/HANDOFF-v0.NN.md` (the map of the shipped build).

---

## Where the cycle is

| | |
|---|---|
| Last shipped build | **v0.53**, tagged `v0.53`, 390,283 bytes |
| Last consumed spec | `docs/specs/rr-analyzer-v053-spec.md` (titled v0.53, produced v0.53 — the titles finally agree) |
| Current spec, awaiting an analyzer | **none — `current-build-spec.md` is consumed** |
| Live suites | **21 suites, 1,013 assertions, 0 failures** |

**Workflow.** Two Claude sessions. The **analyzer** verifies the tagged build against Kittens'
real source and writes `current-build-spec.md` at the repo root. The **builder** implements
every part, runs the suites and the simulator, writes `docs/BUILD-REPORT-v0.NN.md` and
`docs/HANDOFF-v0.NN.md`, moves the consumed spec into `docs/specs/`, and tags. Jerry's own
numbered directives override the spec where they conflict. Two non-negotiables: every spec item
gets actioned or its non-action explicitly justified; every design claim is grounded in
Kittens' actual source with a file citation, never in recollection.

---

## What v0.53 did, and what it cost

**The round's thesis was "demand lengthens Era 3; price does not." The round tested it and the
thesis is too coarse.** Both demand items shipped and neither lengthened Era 3:

| slice | Era 3 | predicted |
|---|---|---|
| s0 — v0.52 unmodified, new harness | 826.5 | (reproduces the report to the digit) |
| s1 — + the apparatus sweep | **848.7** | 600–780 ❌ |
| s2 — + the crystal sink | **664.8** | 929–1,099 ❌ |
| s3 — + the Eludium tier | **664.8** | 815–1,065 ❌ (the tier shipped INERT) |
| s4 — + Jerry ×6, Parts 3/5/6 | **810.5** | 1,000–1,350 ❌ |

**The refined statement, and it is the round's main output for the analyzer: demand lengthens
Era 3 only when it is demand for something SCARCE.** Crystals are at cap 94.8% of every tick;
Void Essence cannot be accumulated by the instrument at all. v0.52's Shimmer Refinery result
(+172.6) was not "add a consumer" — it was "add a consumer for coalgas and mana, which the late
build order was genuinely short of."

**And a structural correction the whole project should carry: Era 3 is `Icathia − Sparks`, and
both edges move.** The apparatus fix moved Sparks 83.4 years earlier and Icathia 61.2 earlier,
so Era 3 "grew" by 22.2 without one thing in Era 3 getting longer. Any future item aimed at
Era 3 must say which edge it moves.

### Closed this round — do not re-open

- **`poroRatio` stays unbounded.** It is Kittens' `unicornsRatioReligion` (`js/religion.js`);
  RR runs four of the source's six rungs at **23%** of its stack. BUILD REPORT v0.52 §2.2's
  "no source counterpart" claim is corrected. **Its first measured run in this project's
  history is v0.53's** — it read ×1.5 in every prior round because the Poro sacrifice was never
  performed by the bot.
- **`audience` stays unbounded**, recorded as a conscious departure, with
  **`AUDIENCE_REOPEN_POP = 600`** as a tripwire in code.
- **HANDOFF v0.52 §8.3's `boost_provisions_irrigation ×6.56`** is explained exactly and fixed.
  The reader was dividing net rates; the bound was always correct.
- **`"Rites of Targon before y55"` re-based to y70**, and **`"morale dips below 90 before y50"`
  retired**, both with reasons recorded in `pacing.mjs`.

---

## Scheduled and dated

| item | dated to | why |
|---|---|---|
| **Trade-banking policy** for `manageTrade()`, with its own baseline | **v0.54, first slice** | scheduled for v0.53 by v0.52 Part 3.3 and deferred with a stated reason: v0.53's Part 1 already re-baselined every pacing number by changing what the bot can buy |
| **The craft-depth tie-break** so Riftsteel can be forged at all | **v0.54, with Part 1's slice** | `hexcore` and `riftsteel` are both depth 2 and Cores win the tie; the tier-5 craft shipped inert. BUILD REPORT v0.53 §5.2 |
| **The Chembarrel / save-for-a-visible-building fix** | **v0.54** | `manageBuildings()` runs before `manageCrafts()`, so a building priced in a contested intermediate is never affordable at the instant it is tested |
| **A morale round** | **v0.54 or v0.55** | band 100% → 61%; `MORALE_RELIEF_LIMIT` saturates at 77–81% while peak population finally moved off 200 |
| **Freljord rungs 5 and 6** — Kittens' `unicornUtopia` 2.50 and `sunspire` 5.00 | **v0.54 candidate** | rank-matched structural lengthener with the source's own numbers, and **now measurable for the first time** |

---

## Known analyzer failure modes — check every one before acting on a flag

1. **Marking already-shipped items as outstanding**, and **citing identifiers that do not
   exist**. Grep `index.html` first, every time.
2. **Grepping source without stripping comments.** Broken twice (v0.51 banner, v0.52
   `resRatio`) and nearly a third time in `test-v53` itself. `test-v53` carries a `strip()`
   helper; use it.
3. **Reasoning from a zero without checking the instrument.** v0.53 Part 1 executed this as a
   sweep for the first time and found four more instances — and then produced a fifth
   (Riftsteel). **The sweep is now an assertion**, so the *build order* class of this defect
   cannot recur; the *stock-versus-flow* class still can.
4. **Version numbering off by one.** The git tag is authoritative. There is now a `VERSION`
   constant and the footer renders from it, so the two cannot disagree.
5. **Predicting against the wrong gate.** Sparks is champion-gated, not knowledge-gated.
6. **NEW — reading "Era 3 length" as a property of Era 3.** It is a difference of two
   milestones and both move.

## Reference

`claude/kittens-game-reference.md` in the claude.ai project holds verified source-of-truth
Kittens mechanics and values. Check it before proposing new design; fetch the actual source
file when it does not cover the specific value, and cite file and line either way. Where RR
departs from the source deliberately, flag the departure rather than presenting it as parity.

**Verified from source this round:** `js/space.js` — `orbitalArray` (`science 250,000 +
starchart 2,000 + eludium 100 + kerosene 500`, priceRatio 1.15, `spaceRatio 0.02`,
`energyConsumption 20`, no `limitBuild`); `spaceStation` (`oil 35,000 + science 150,000 +
starchart 425 + alloy 750`, priceRatio 1.12, `scienceRatio 0.5`, **`maxKittens 2`**); the ten
repeatable price-ratio `starchart` consumers (the v0.53 spec says "eleven" and lists ten — the
eleventh only exists if the thirteen one-off missions are counted, and they are not price-ratio
buildings); the five `eludium` consumers (`orbitalArray` 100, `sunlifter` 225, `spaceShuttle`
500, `entangler` 5,000, all at 1.15).
