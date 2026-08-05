# Analyzer status — Runeterra Reclaimed

Standing status for the Analyzer cycle. Read alongside `STANDING-RULINGS.md` (closed rulings,
do not re-litigate) and the latest `docs/HANDOFF-v0.NN.md` (the map of the shipped build).

---

## Where the cycle is

| | |
|---|---|
| Last shipped build | **v0.54**, tagged `v0.54` |
| Last consumed spec | `docs/specs/rr-analyzer-v053-spec.md` (produced v0.53; v0.54 had no spec) |
| Current spec, awaiting a builder | **`current-build-spec.md` at the repo root — produces v0.55** |
| Live suites | **23 suites, 1,098 assertions, 0 failures** — re-run and confirmed 2026-08-04 |

## v0.55 — the analyzer's verification pass, and the storage-scope finding

**Everything BUILD REPORT v0.54 §6 claims reproduces to the digit** on a fresh clone: Rites
y73.9, Sparks y149.0, Icathia y790.2, Era 3 641.2, 130 wanderers y758.8, peak pop 222, morale
band 61%, trades 69,930, crystals at cap 94.8%, Hexdraulic Plants 2, Frostguard Cairns 12. All
23 suites re-run, every per-suite count matching §8. The v0.53 spec was verified shipped part
by part by grep on comment-stripped source; nothing was skipped.

**The round's finding is a measurement nobody had taken — time at cap, per resource.** Over a
1,200-game-year seed-1 run: culture **93.8%**, knowledge **90.0%**, crystals **89.8%**, renown
**76.6%**, shimmer 64.2%, ore 56.0%, zaunore 33.8% (**52.6% inside Era 3**), and then a long
tail — provisions 12.3%, mana 2.6%, hexore 0.2%, timber 0.1%, coalgas and voidessence **0.0%**.

**The three most cap-bound resources in the game are the three Masonry does not touch**
(knowledge exempt, culture on Scholarship, renown on the square root), while the twelve that
take the full multiplier average 17.7% and five are at cap essentially never. **A uniform
multiplier cannot fix a distribution that unequal**, and the source has the missing dimension:
`addBarnWarehouseRatio` (`js/resources.js`, quoted verbatim in the spec) runs **two additive
accumulators with different scope per resource** and touches **seven effect names and no
others** — oil, uranium, unobtainium and starcharts get nothing and are relieved by buildings.
RR runs one *multiplicative* chain across twelve resources, which is a Kittens'-Law violation
(additive within a category) on top of a scope error.

**And the ×22 figure this project has quoted since the v0.39 spec has never been reached.**
`voidwardStores` costs `voidglass 8 + hexcrete 8`, voidessence is held at **0 at every
milestone**, and the Discovery has never been researched in a measured run. The real stack is
**×12.6**.

### New this pass, beyond the report

- **`catMonument` is ×1.00 at all three milestones** — Foundry 0, Reactor 0, Chembarrel 0. The
  global-production category is inert. Carried open from BUILD REPORT v0.53 §11, not new, but
  `seenMax.hexgear` has risen ~51 → **155.61** against the Foundry's 200: **22% short, not 75%**.
- **`hexdraulicPlant` reaching 2 is not the amplifier path.** That block gates on
  `count("hextechFoundry") >= 3` (`simcore.mjs:494`) and the Foundry is 0; the two copies came
  through `BUILD_ORDER` (`:465`). Grepped and resolved — **not a defect, do not flag it.**
- **Two of v0.53 Part 4's monotonicity conditions fail, not one** — `voidessence` accumulates
  0 → 70,124 after Icathia with no consumer, alongside `riftsteel` at 0.
- **Convergence at Sparks measures 2.33% against its 5–8% target** (5.4% at v0.52) and has no
  pass condition attached, so nothing catches it.
- **Crystal spend is 18.9% of income** against the v0.53 target band of 40–70%.
- **HANDOFF v0.54 §4's claim that `BUILD_ORDER` and `DEDICATED_ROUTINES` are "at module scope
  and exported" is false** — both are declared inside `runSim`'s `page.evaluate` at
  `simcore.mjs:441–442` and neither is exported. `test-v53`'s check 1.1 asserts module scope but
  tests it with `src.indexOf("const BUILD_ORDER = [")` on the file text, which matches at any
  scope. **The reachability guard itself is real and works**; the scope half is decorative.
- **`index.html:1447` cites `addBarnWarehouseRatio` as `js/buildings.js`.** It is defined in
  `js/resources.js`.

## v0.54 — no spec, two workstreams

v0.54 answers a supplied **offline-progression audit** (`docs/OFFLINE-AUDIT-v0.52.md`) and
**seventeen of Jerry's numbered directives**. No analyzer spec, so no cumulative prefixes and
no predicted-vs-measured table — that apparatus belongs to spec rounds.

**The audit's defect 1 is the headline and it was the worst kind of bug: `tick()` advanced a
fixed dt and never consulted the wall clock, so a browser-throttled background tab lost ~80%
of its production. Closing the tab was strictly better than leaving it open.** Measured after
the fix: 100% of real rate. Defect 2: `runCatchUpChunked()` had been complete, correct and
never called since v0.47, while the v0.47 build report claimed the feature shipped chunked.

**Pacing cost of the directives, measured once at the end** (2,500-year seed-1, against
v0.53's shipped build): Era 3 **810.5 → 641.2**, Icathia y966.6 → y790.2, and **trades ×2.00**
— the last is directive 10, which deleted merchant fatigue, and it is the largest identifiable
cause. None of the seventeen was a pacing item. Era 3 is now **758.8 short** of the 1,400
minimum.

**Two figures moved that never had before:** Hexdraulic Plants at Icathia 0 → **2** (gold
reaches 219,277 against a 254,676 ceiling), and Frostguard Cairns 6 → **12** (directive 13's
×5 poro production feeding the sacrifice that feeds the ladder).

### Closed in v0.54 — STANDING-RULINGS §§14–15

- **Merchant fatigue is deleted.** The THIRD RR-invented rule ruled out of existence, after
  the 1.25 price band and the effect-to-ratio proportionality bound. Caitlyn's and Twitch's
  leads were re-pointed onto cargo slots in the same round — Twitch's had become a leader slot
  that did nothing at all.
- **The live loop reconciles against the wall clock.** Consequence for every future test:
  anything driving `tick()` in a loop must virtualise `Date.now` and advance it by `TICK_MS`
  per fire. Two shipped suites had to be re-pointed for this.

### New for the analyzer from v0.54

- **The Poro Pasture is still two divergences from source** — priceRatio 1.15 against
  Kittens' **1.75**, and `eatCut` 0.003 against `catnipDemandRatio` **−0.0015**. Directive 13
  fixed production only, and at ×5 production the price ratio is now the one that matters.
- **Caitlyn's two lead clauses compound** — the tier discount raises the `over` term the slot
  ladder is computed from, so +10 points of slot chance reads as +25 at five caravans.
- **`w.xp` is now a lifetime total nothing reads but the Census sort.**
- **The 12-hour offline cap has never been questioned**, and is now a single tunable enforced
  identically on both routes.

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
| **The storage-scope restructure** | **v0.55, Part 1 — the round's spine** | one multiplicative chain across twelve resources becomes two additive accumulators and a scope table, ported from `addBarnWarehouseRatio`. Moves the Icathia edge only |
| **The Chembarrel / save-for-a-visible-building fix** | **v0.55, Part 3** | dated to v0.54 and not actioned. `catMonument` is ×1.00 because Foundry, Reactor and Chembarrel are all 0 |
| **The craft-depth tie-break** so Riftsteel can be forged at all | **v0.55, Part 4** | dated to v0.54 and not actioned. Two monotonicity conditions now fail, not one — voidessence accumulates with no consumer |
| **A morale round** | **v0.55, Part 6** | band 61% against ≥80%, run minimum 88; `MORALE_RELIEF_LIMIT` saturates at 77.7% as population finally moves off 200 |
| **Trade-banking policy** for `manageTrade()`, with its own baseline | **v0.55, Part 7.2 — ship or re-date with a reason** | deferred twice with reasons. The gap is now 150.33 trades a game-year affordable against 0.05 run |
| **`libraryRatio` for the knowledge ceiling** | **v0.55 Part 2, conditional on Part 4** | knowledge is at cap 90.0% of the run; the exemption's stated reason was that eludium/unobtainium sit outside RR's era window, and v0.53 shipped both |
| **Freljord rungs 5 and 6** — Kittens' `unicornUtopia` 2.50 and `sunspire` 5.00 | **v0.56 candidate** | rank-matched structural lengthener with the source's own numbers; deferred so v0.55's storage movement stays attributable |

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
