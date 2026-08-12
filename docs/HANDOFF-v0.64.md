# HANDOFF v0.64 — Runeterra Reclaimed

Written for whoever picks this up next, with no memory of this session.

---

## 1. READ THIS FIRST — THE GATE CLEARED, AFTER THREE ROUNDS OF FAILING IT

**Pass condition 1 was "Icathia on ALL THREE seeds within 2,500 game-years". It reached three.**

| | v0.62 | v0.63 | **v0.64** |
|---|---|---|---|
| **Icathia** | 1 of 3 | 2 of 3 | **3 of 3 — 2,234.7 / 1,339.9 / 1,694.2** |
| **peak population [median, band 150–220]** | **135 FAIL** | **148 FAIL** | **180 PASS — 165 / 191 / 180, all three inside** |
| conditions failing | 4 of 10 | 5 of 10 | **4 of 10** |

**Both of the conditions this round was built for cleared, and the population band cleared on
every seed rather than on the median alone.** That is the first time in the project's recorded
history either has been true.

**What is NOT known is which change did it**, and the report says so rather than claiming it. Two
candidates are large enough to matter and neither is separable from the other in one ensemble:

- **Part 1.2a** deleted the Longhouse's 1,200-provisions component. The two-tier population
  ceiling was **78** by the spec's arithmetic and reads **135** at end of run, material-bound
  rather than ceiling-bound.
- **Jerry's dev note 2** widened the converter multipliers to reach the Zaun extractors, taking
  their conversion multiplier **×4.28 → ×20.35 in a real run — a ×4.75 move on the Era-3 raws**,
  which is what Era 3 runs out of. **This is a dev note, not a spec Part, and it is the largest
  production change in the round.**

### The rule this earns

> **A round whose every change is LATE-GAME cannot be attributed by cheap per-part checks.**
> Seven of this round's eight cumulative-prefix slices measured **exactly zero** at 300
> game-years. A ceiling that binds after year 1,000, four rails whose families do not reach their
> knee until Era 3, and era gates on `chemtech` are all invisible to a short run. **Either run the
> slices at full length, or say up front that attribution will come from one ensemble.**

---

## 2. What the project is

A League-of-Legends-flavoured idle game in one HTML file, built with **Kittens Game as its balance
authority**. Not as inspiration — as an authority. STANDING-RULINGS §16 makes source parity of
timing and scale the primary goal, and `docs/PARITY-LEDGER.md` is the instrument. **The ledger is
finished: 225 rows, UNVERIFIED 0.**

---

## 3. The five things v0.64 should change about how you work

**A TERM KEYED ON A NAME IS DEAD UNTIL THE CONTAINER DECLARES THAT NAME — and this is a NEW
OPERATIONAL RULE, the sibling of rule 11.** v0.63 Part 3.2 re-scoped the Demacian Accord onto the
resources `timber` and `ore` and landed it in `policyBoost()`, which is the right home. The term
is applied by `for (var pk in boosts) boosts[pk] += policyBoost(pk)` — **a loop over the keys the
object literal declares** — and neither key existed. **Measured on the v0.63 tag: the policy
delivered +1.0%, which is `catPolicy`'s generic government term, and 0.0% of the advertised
8.5%.** Nothing threw, nothing rendered NaN, no suite failed, and the tooltip stated a figure the
engine never applied, for a full version. **When you add a resource, family or category to a keyed
accumulator, assert the DELIVERED value, never the presence of the key.**

**THE STATIC PROBE IS NOT THE INSTRUMENT — I RECORDED A DISAGREEMENT AND THE RUN SETTLED IT
AGAINST ME.** I argued the devotion rail wanted 6.0 rather than the spec's 5.0 because a maxed
static fixture reached Σ4.024 against the 3.75 knee. **The real run reads Σ3.650 — inside it, at
97.3%.** v0.62's own finding was sitting in the file I was editing. **Trust the end-of-run audit.**

**A CONDITIONAL PART CANNOT BE EVALUATED BEFORE THE ENSEMBLE IT IS CONDITIONED ON.** Part 1.2b
ships "only if 1.2a does not clear the gate", so it could not ship in the round that measures
whether 1.2a clears it. Shipping both would have made 1.2a unattributable. **Name the
non-action and say why; do not quietly ship the insurance.**

**A PARITY RESTORATION HAS A PRICE AND THE PRICE SHOULD BE LEGIBLE.** Retiring
`DISCOVERY_RUNG_CAP` put the generated Discoveries back at the source's 0.80 × K from the cap's
0.34 × K, and **Rites of Targon went 61.1 → 103.4 on seed 1**. The median still passes at 68.6.
**It was not predicted and it is reported rather than absorbed.**

**THREE OF THIS ROUND'S FOUR FAILING CONDITIONS ARE ONE RANDOM VARIABLE, AND THE SPEC SAID SO
BEFORE THE ROUND RAN.** Sparks spread **×1.98**, first champion **×1.85**, Chemtech→Hexcore
**×2.70** — all three move together and all three are the 3-of-10 Piltover/Zaun champion draw
(§4, the sanctioned exception). **Three seeds is not enough to steer on any of them.**

---

## 4. The laws the game is built on

- **Kittens ticks 5/s.** `TICK_MS = 200` is exact tick parity.
- **`limitedDR(x, L)` is LINEAR only below 0.75·L.** **AND FOR THE FIRST TIME IN THE PROJECT'S
  HISTORY, ZERO FAMILIES ARE PAST THEIR KNEE.** v0.64 Part 2 shipped Option B on Jerry's ruling:
  the four ceilings that were taxing every member became RAILS above the reachable range —
  **vigor 8.0, devotion 5.0, provisions 3.0, mana 2.0**, crystals/gold/culture unchanged. End of
  run: every family delivers **0% thrown away**, against vigor's 82.1% and devotion's 46.4% one
  round ago. The rule that sizes a rail is `ceil(raw Σ ÷ 0.75)`, and the source's own pattern is
  Solar Revolution (`js/religion.js:1548-1550`), limit 10 against a reachable ~4.5.
- **A CONVERTER IS ANY BUILDING WITH A `convert` BLOCK — ruled at v0.64 on Jerry's dev note 2.**
  `autoprod` says how a converter is DRIVEN, not whether it converts. All four converter-output
  categories now reach all eight converters; the **autoprod line stays exclusive** to the three
  Zaun extractors, which is correct — the Chembarrel drives them specifically, as Kittens'
  Steamworks drives its Magnetos.
- **Converters: inputs FLAT, outputs multiplied.** The source's own asymmetry. Two scoped
  exceptions only — the Manufactory's crystal fuel takes the yield's footing (v0.62 Part 7) and a
  stock reference (v0.63 Part 8.2). **Do not generalise either.**
- **Cap families — TWO**, decided by `capFamilyOf()`.
- **§30:** reserved ids — `runestone`, `hunterLodge`, `lumberCamp`, `petricite`, `tavern`,
  `bloomery`, `refinedMetallurgy`, `kindling`, `championsRegimen`, `deepCartography`,
  `petriciteResonators`.
- **§31 is an OPEN QUESTION with its premise RETRACTED (§31.2a). Nothing has been collapsed.
  Until Jerry rules, no round may add a new multiplicative category** — dev note 2 widened the
  SCOPE of three existing terms and added none, and RR's factor count is unchanged.
- **`computeRates()` with no argument returns NUMBERS ONLY.**
- **`DISCOVERY_RUNG_CAP` NO LONGER EXISTS.** The per-RUNG total is not a Kittens invariant (range
  0.30–8.19; half the source's own rungs exceed 2.43×). **The per-UPGRADE ratio is** — IQR
  0.73–1.00, median 0.87 — and RR sits at **0.80**. `applyDiscoveryKnowledge()` is now the only
  thing in the file that writes a discovery knowledge cost.

---

## 5. Operational rules, each of which has already cost a round

1. **Add a new building to `BUILD_ORDER` in the same commit that adds the building.**
2. **A per-part check must look at more than the part** — and **NEW: a late-game round's per-part
   checks may look at nothing at all.** See §1.
3. **Instrument BEFORE you change the thing.** This round's four new readouts (the maxPop
   decomposition, the mana balance, the trade-provisions block, and the era-gate audit) all
   landed before a single game constant moved, and the s0 baseline was measurable with all of them.
4. **Two-tier verification:** cheap single-seed checks per part; the ensemble at the end.
5. **`nproc` is 2 — give the ensemble the box.** This round's 3-seed 2,500-year run took **87
   minutes** while sharing the box with a slice chain. Budget 90–120 minutes.
6. **Launch long runs with `setsid nohup … & disown` AND POLL.** `setsid` survives a turn
   interrupt; it does not survive the container being reclaimed in an idle gap.
7. **Run suites with `node tools/run-suites.mjs --selftest`.**
8. **An assertion satisfiable by the presence of TEXT is not testing behaviour.**
9. **Never pin a literal version string in a suite** — **and v0.63 did it anyway**, asserting
   `VERSION === "v0.63"`. Re-pointed this round to assert the shape. The rule is in the Appendix
   because `test-v53` did the same thing three rounds earlier.
10. **Re-point superseded assertions, never delete them**, naming the superseding item.
    **Fourteen call sites this round across thirteen suites — build report §7.** Three of them
    RESTORE an earlier assertion (`test-v52`'s Keeping the Rolls back to 1,300; `test-v61`'s and
    `test-v62`'s discovery-cost checks back from `<=` to `===`), because Part 5 retires the cap
    that forced them to be loosened one round ago.
11. **A `var` declared after an array literal but read INSIDE it is `undefined`, not an error.**
12. **`computeRates()` with no argument must return numbers only.**
13. **VERIFY BEFORE BUILDING.**
14. **Push with the proxy unset, and scrub the token afterwards.**
15. **Assert a guard by making it FAIL.**
16. **NEW — a term keyed on a name is dead until the container declares that name.** §3.
17. **NEW — isolation prefixes are built FORWARD and the chain is PROVED.** `tools/mk-slices-v64.py`
    walks s0 → s8 applying one Part per step and **asserts the last prefix is byte-identical to
    the shipped file**. §9 forbids reconstructing a prefix by reverse-patching; a hash equality is
    a stronger guarantee than a process claim, and it is cheap.

---

## 6. What is open, and for whom

### FOR JERRY

- **Your four dev notes all shipped exactly as written**, and one of them found a defect nobody had
  reported: the Demacian Accord's timber/ore boost had been delivering **0.0%** since v0.63. §3.
- **The devotion round is done and the Chapel is labelled honestly.** Its 0.025 → 0.015 is a
  departure from Kittens' own chapel figure and is ledgered **RR-ORIGINAL / HARDER** rather than as
  a parity fix — §17's precedent, the entry that exists because you read a label two rounds later
  and reversed it.
- **MANA RUNS A MEASURED DEFICIT AND IT IS A DESIGN QUESTION.** Net mana is **−0.40/s at hexcore**
  and **−14.52/s at end of run**, with consumed÷produced pinned at ≈1.00. That is 0.3% and 1.1% of
  gross — the signature of a system in equilibrium where the seven mana-consuming converters are
  throttled by mana availability. **Is that the constraint you want Era 3 to have?** The spec's
  condition says ship a fourth mana discovery on a measured deficit; the measurement arrived with
  the final gate, so it is handed on rather than shipped unverified.
- **§27's population band is measuring something real and it should stay.** Three rounds ago it
  failed at 135, and completion tracked it exactly. It now passes at 180 on all three seeds and
  Icathia completes on all three.
- **§31's premise is retracted and the corrected section still awaits your ruling.** RR has ~11
  multiplicative steps against the source's ~14.
- Still yours from earlier rounds: `gear` costs steel 25 against Kittens' 15; three repeatable
  buildings diverge on `priceRatio` (Hexdraulic Plant 1.25 vs 1.15, Watcher's Eye 1.25 vs 1.12,
  Shelter 2.20 vs 2.50 — the Shelter is GENTLER); bulk trades under Caitlyn still pay 60 renown.

### FOR THE ANALYZER — what the next spec should be

1. **THE NEXT ROUND SHOULD NOT BE ABOUT POPULATION.** The gate cleared and the band cleared on
   every seed. **Do not tune a condition that passed.** The settlement is still at its housing wall
   at every milestone, but the binding resource is now **timber STOCK** rather than a ceiling that
   forbids the purchase — which is where Kittens puts it.
2. **THE FOURTH MANA DISCOVERY IS THE ONE UNDISCHARGED CONDITION.** Deficit at hexcore
   (−0.40/s, ratio 1.003) and at final (−14.52/s, ratio 1.011); the milestones are named as pass
   condition 17 requires. **Read BUILD REPORT §11.6's caution before sizing anything**, and if it
   ships, put it on a tech that is not `sparks`.
3. **SPARKS, FIRST CHAMPION AND CHEMTECH→HEXCORE ARE ONE RANDOM VARIABLE.** Spreads ×1.98, ×1.85,
   ×2.70; three of four failing conditions. Take more than three seeds or stop steering on them.
   Builder note 5 called this before the round ran and the round reproduced it exactly.
4. **DEV NOTE 2's CONVERTER RULING IS THE ROUND'S BIGGEST UNMEASURED LEVER.** ×4.75 on the Era-3
   raws in a real run, shipped inside a four-note slice that is also the round's PRNG re-roll, so
   its individual effect is not attributable. **If Era 3 now looks too fast, look here first and
   `CONV_DISCOVERY_LINE`'s Σ0.65 is the one constant to move.** Era 3's median is 1,262.7 against
   v0.63's 982.8 — longer, not shorter, but on a fresh draw.
5. **DECIDE WHETHER RITES-UNDER-75 OR PER-UPGRADE PARITY IS THE TARGET.** Part 5's restoration
   cost 42 game-years on seed 1 by putting the generated Discoveries back at the source's rate. A
   future round cannot have both, and the per-upgrade band is the one the source holds constant.
6. **PART 1.2b IS AVAILABLE AND PROBABLY UNNECESSARY.** The Skyrise carries 56 of the final 180
   population, but `deepWorks` still lands at a median of y1,655. If a future round wants it, move
   the RUNG and not the price — the spec's own analysis stands.
7. **THE LEDGER IS MAINTENANCE.** 225 rows, UNVERIFIED 0. Both generator guards are load-bearing.

---

## 7. Where the docs live

| file | what it is |
|---|---|
| `STANDING-RULINGS.md` | the settled law, §§1–32 — **§31 is an OPEN QUESTION with a RETRACTION at §31.2a** |
| `docs/PARITY-LEDGER.md` | **generated** — edit the verdict map in the tool, never the file |
| `docs/BUILD-REPORT-v0.64.md` | this round |
| `tools/era-gate-audit.mjs` | **new** — every building, its era, its gating material; records its own join |
| `tools/mk-slices-v64.py` | **new** — builds the §9 cumulative prefixes forward and proves the chain |
| `snapshots/v64/` | s0–s8, one per Part, with the hash proof in `README.md` |
| `tools/run-suites.mjs` | the suite runner. `--selftest` demonstrates the guard |
| `docs/analyzer-status.md` | the cycle table — updated by the round that ships |

---

## 8. Pushing

```bash
git remote set-url origin "https://x-access-token:<PAT>@github.com/jouyang01/RR.git"
env -u HTTP_PROXY -u HTTPS_PROXY -u http_proxy -u https_proxy -u ALL_PROXY \
  git push origin main --follow-tags
git remote set-url origin https://github.com/jouyang01/RR.git
```
