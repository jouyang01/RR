# BUILD REPORT v0.60 — a dying suite made to fail, a job the bot could not reach, and the ×92 nobody had decomposed

Eight Parts, two of Jerry's rulings, and the close of a lookup open since v0.55.

---

## 1. Part 1 earned its keep in the first ten minutes

**The defect class is new and it is the sibling of §21: a suite that dies is not a suite that
fails.** `test-v38` died at assertion 21 of 27, `test-v45` at 43 of 59, both by exception rather
than by a failing `check()` — and every "N passed, 0 failed" line in the project reported that as
health for a full round.

**Neither abort was in a predicate.** `test-v38` died *formatting its own message*:
`CAMP_MAX_CHARGES` is a game constant that lives in the browser page and has never existed in
Node scope. `test-v45` died on `byId["kindling"].cost` after v0.59.1 note 3 deleted the tech —
that round re-pointed twelve assertions for the ladder moving 37 → 36 and missed this one because
**it is not a count, it is a lookup**.

**And fixing them immediately surfaced four failing assertions that had not run in a round:**

**The charge-surplus bound was mine, from v0.59, and it was wrong twice over.** I bounded the
empowered-hunt surplus by the *initial* bank of 2 charges per camp. Charges regenerate — and each
of the two slots regenerates **independently**, so a 90-second camp yields `2 × floor(3600/90) =
80` empowered hunts an hour, not 40. That factor of two is the whole gap between the failing 584
and the measured 1,088. Derived properly it is not a bound at all but an **exact** figure, so the
assertion is now an equality and a much stronger guard than the inequality it replaces:

| camp | regen | slots × cycles | surplus |
|---|---|---|---|
| wolves | 90 s | 2 × 40 = 80 | 80 × 2 renown × (3−1) = **320** |
| gromp | 120 s | 2 × 30 = 60 | **240** |
| raptors | 150 s | 2 × 24 = 48 | **288** |
| krugs | 180 s | 2 × 20 = 40 | **240** |
| | | | **1,088 — measured exactly** |

`test-v45`'s other three measured `kindling` as "the one branch tech surviving the v0.46 cull";
re-pointed to state what an empty set means, so re-adding a branch tech re-arms them.

### 1.2 The trailer, and the one place I did not do what the spec asked

Every suite now prints `SUITE-END <name> asserted=<n> passed=<p> failed=<f>` as its last act, and
`tools/run-suites.mjs` fails the round on four conditions: `failed > 0`; a **non-zero exit even at
`failed=0`**; a **missing trailer** (the suite died); and **fewer executed assertions than the
suite has `check()` call sites** (the suite ran but skipped).

`asserted` is counted from the suite's own source rather than hand-maintained — a
`const ASSERTED = 27` is a second number to maintain and would drift the first time someone added
an assertion.

**The spec asks for `asserted === passed + failed` and I shipped a lower bound instead, because
the measurement says equality is the wrong test.** Seven suites call `check()` inside a loop and
legitimately execute *more* assertions than they have call sites — `test-v32` runs 67 from 61.
Requiring equality would fail seven healthy suites and teach the next reader to ignore the line,
**which is exactly how the old scraper became untrustworthy in the first place.** The residual gap
— one skipped site in a suite whose loops over-run the count — is stated in the runner rather than
papered over. The exact guard is the missing-trailer one, and that one has no gap.

**And it is demonstrated.** `tests/_selftest-throws.mjs` reproduces the exact shape of the two
real aborts — several checks pass, then it dies while formatting a message with an identifier that
exists only in the page — and `--selftest` requires the runner to catch it. **Verdict: CAUGHT.**

---

## 2. Part 3's question is answered, and the answer is the spec's own second hypothesis

**The spec refused to size the Manufactory's burn a third time until 559/s was decomposed, and it
named two candidates:** an unenumerated faucet, or a multiplier far larger than it reads.

**Both are true, and the second is the finding.** The decomposition, at Icathia and at the end of
the run, is **fully attributed — 100.00% of gross**:

```
CRYSTAL DECOMPOSITION @final: net 73.991/s = gross 79.0198/s  -5.0288/s drain
  42 refineries (base 0.02/s each) · 18 manufactories (burn 0.06/s each, FLAT) · 6 tinkerers
        77.325225/s    97.86%  42× Hextech Refinery
        -5.028783/s    -6.36%  18× Hexdraulic Manufactory (consumes)
         1.694537/s     2.14%  6× Tinkerer
     multipliers applied to all of the above: Global bonuses ×4.6563
     faucet shares sum to 100.00% of gross — fully attributed
```

| | |
|---|---|
| 42 Refineries × `crystals: 0.02` | **0.84/s base** |
| delivered | **77.33/s** |
| **total multiplier stack** | **×92.1** |
| of which the global bonuses | ×4.66 |
| **so the converter-side stack alone** | **×19.77** |

**The spec estimated the converter stack at ×2.7–4. It is ×19.8.** And the spec's Part 3.2 said
precisely what that would mean:

> *"If RR's is genuinely two orders of magnitude, the out-of-parity item is RR's conversion
> multiplier stack, not the Manufactory's fuel — and raising `MANUFACTORY_FUEL` would paper over
> it at exactly one point on the curve while making early Manufactories unbuildable."*

**Kittens' `calcinerRatio` sums 2.70 across three upgrades, so the source runs a ×3.70 production
multiplier against a flat burn. RR runs ×19.77 on the same footing — ×5.3 the source.** That is
the out-of-parity item, it is now measured rather than inferred, and it is a magnitude on a
multiplier stack rather than anything to do with the Manufactory.

**The second candidate is real too, and it explains the 559 itself.** v0.59.1 measured 559/s on a
run that had built **8–10 Augment Chambers**; this round's build has **zero**, because Part 2
changed what the bot staffs and therefore what it builds. Crystal income at the end is **74/s**.
**So 559/s was never a Refinery figure at all** — the report that quoted it, and the spec that
tried to reconcile it against refineries, were both reasoning about the wrong faucet.

**`MANUFACTORY_FUEL` is UNCHANGED at 0.12**, per pass condition 7 and the analyzer's "hold the
line". Sizing it now would be the third attempt against a number that has just turned out to
describe something else.

---

## 3. Part 2 — the tinkerer was unreachable, and so was any job appended to that list

The policy has existed since the Refinery shipped. v0.59.1 concluded *"the bot has no tinkerer
policy at all"* — **the measurement was right and the diagnosis was wrong**, and the spec is
correct that the true cause is both simpler and more general.

`want` is an **ordered** list, **one** assignment per call, with an early `return` on the **first**
job below its share. The shares ahead of `tinkerer` sum to **1.06** of a population of 1.00, so
they can never all be satisfied at once and the last entry is never reached. No RR job defines
`max()`, so the `continue` that could skip a saturated job never fires either.

**Two rounds have now drawn a balance conclusion from an artefact of list order** — v0.57 Part 4
for farmers, v0.59.1 note 7 for tinkerers. Both shipped a number; neither fixed the mechanism.

**Both halves of the structural fix ship, and the spec asked which was chosen and why:**

1. **Normalisation, in code, to a `JOB_SHARE_BUDGET` of 0.85** — leaving 0.15 for farmers. Doing
   it in code rather than by editing six literals is the whole point: **the invariant becomes true
   by construction, and appending a job cannot re-break it.** Hand-tuned numbers drift the first
   time somebody adds a job, which is the history above.
2. **Pick the job furthest below its share**, not the first below it. **This is the fix that makes
   order stop mattering permanently** — a job at the end of the list now competes on how far
   behind it is, so appending an entry can never again produce dead code. Ties keep list order, so
   the shares still express priority between equally-starved jobs.

**Measured, and the tinkerer exists for the first time in this project's history:**

| milestone | tinkerers | crystals/s |
|---|---|---|
| Sparks | 1 | 0.40 |
| Hexcore | 3 | 4.77 |
| Icathia | 5 | 33.44 |
| final | **6** | 73.99 |

**One correction to the spec's arithmetic.** It quotes Σ = 1.06 in both branches; that is the sum
of the jobs **ahead of** the tinkerer, which is the figure that makes the tinkerer unreachable.
The sum of the **whole** list is **1.11**. Both are asserted, labelled, and the distinction stated
— a list oversubscribes the population whether or not its last entry is counted.

**And the spec's own prediction about the consequence was wrong in the informative direction it
hoped for.** It predicted *"if crystals-at-cap falls below 90% purely from staffing tinkerers,
then note 7's premise was wrong from the start."* Crystals-at-cap is **96.2%**, up from 95.9. Six
tinkerers contribute **2.14%** of gross crystal production against the Refineries' 97.86%.
**Staffing the workforce did not move the crystal economy, because the workforce was never the
constraint — the ×92 multiplier stack on 42 buildings is.**

---

## 4. Part 7 — `XP_PER_SECOND` found, and Jerry's ruling on it

**Open since v0.55, across five recorded dead retrieval routes. Closed in one grep against a
clone.** `js/village.js:3228` @ `c52985b`:

```js
var baseSkillXP = game.workshop.get("internet").researched
                  ? Math.max(this.getKittens() * hgSkillModifier / 10000, 0.01) : 0.01;
```

The base increment is **0.01 per tick, unconditionally** before the Internet upgrade, and the
`times`/`frequency` machinery above it is a performance optimisation that preserves the rate
exactly. Kittens ticks 5/s and `TICK_MS = 200` is exact tick parity, so **the source rate is
0.05 XP/s. RR shipped 0.50 — ten times the source.**

**Every retrieval route this project had written off predates cloning the repository. Three
lookups fell to single greps once the source was on disk.** That is the lesson and it is in the
handoff.

### 4.1 Jerry's note 4, and the one decision it forced

> *"Change the EXP ratio to match kittens. We want the top rank to be reached in about 50-75
> hours."*

The first half is unambiguous: `XP_PER_SECOND` → **0.05**. The second half is not settled by it,
and the arithmetic makes the choice unambiguous:

| top rank | hours at 0.05/s | |
|---|---|---|
| **18,200** (note 11's figure) | **101.1** | outside the band |
| 9,000 (Kittens' own) | 50.0 | the band's very edge |
| **11,500** (RR's pre-note-11 top) | **63.9** | **the centre of the band** |

A 50–75 hour band at 0.05/s **is** a top threshold between 9,000 and 13,500, and 11,500 is the
only figure in that window this project has ever shipped.

**So this note supersedes Jerry's own note 11**, and it is worth saying plainly rather than
burying: note 11 doubled the top two gaps to reach 18,200, and **there is no figure that satisfies
both notes** — holding 18,200 inside the band would need ~0.084 XP/s, which is not Kittens' rate.

**Grandmaster reverts with it for monotonicity, not symmetry.** Leaving GM at 10,200 under an
11,500 top would put a 5,400 gap before a 1,300 gap — the hardest rung on the ladder followed by
the easiest. Reverting both restores the 2,700 / 4,000 shape the rest of the ladder is built on.
Bronze through Master are untouched: **the divergence is the top rung alone.**

### 4.2 And it closes `XP_CAP`'s staleness for free

The spec's Part 7.2 records that `XP_CAP` was derived from a top rank of 11,500 and never followed
note 11 to 18,200, so the parity ratio had silently fallen from **2.222×** to **1.404×**, and
proposes 40,446 as the ratio-preserving figure.

**With the top rank back at 11,500 the shipped constant is correct by construction.** It is
literally `Math.floor(11500 * 20001 / 9000)`, and the measured ratio is **×2.2223** against
Kittens' 2.22233. **Nothing needs re-deriving and 40,446 is not needed.**

### 4.3 The ladder is re-rated by the product

| | Kittens | RR | |
|---|---|---|---|
| top-rank threshold | 9,000 | 11,500 | ×1.28 harder |
| XP rate | 0.05/s | **0.05/s** | ×1.00 — **parity, exactly** |
| **time to top rank** | **50.0 h** | **63.9 h** | **×1.28 HARDER** |

The ledger called this *"the largest single parity divergence in the game"* at **102%** for two
rounds, measured on thresholds with the rate unknown — and its own row said *"a 102% threshold
debt at an unverified rate is one unknown multiplied by another."* **It is 28%, and the rate row
is now PARITY for the first time.**

---

## 5. Part 5 — `factoryAutomation`, and RR was wrong on all three of its numbers

v0.59.1 shipped the *shape* from a wiki-level description and said explicitly that the share was
RR-original and UNVERIFIED. The clone settles it in one grep.

| | Kittens (`js/buildings.js:1309–1318`) | RR before |
|---|---|---|
| trigger | `value ≥ maxValue × (1 − 0.02)` = **98%** | `0.95` |
| share | `min(0.02 × (copies+1), 0.90)` of the **stockpile** | `0.05 × copies` of the **ceiling**, unbounded |
| base | the current `value` | the `cap` |

**The trigger and the share are the same constant in the source** — `baseAutomationRate` is used
for both — an elegant coupling RR had split into two unrelated literals, **which is why neither
could be made consistent by tuning the other.** One `AUTOMATION_BASE = 0.02` now drives both.

| copies | 1 | 2 | 5 | 10 | 20 | 44 |
|---|---|---|---|---|---|---|
| Kittens | 4.0% | 6.0% | 12.0% | 22.0% | 42.0% | **90.0% (cap)** |
| RR before | 5.0% | 10.0% | 25.0% | 50.0% | 100.0% | 220.0% |
| **RR now** | **4.0** | **6.0** | **12.0** | **22.0** | **42.0** | **90.0** |

Asserted rung for rung. The ledger row moves **UNVERIFIED → PARITY**.

---

## 6. Part 6 — the mana census. No magnitude moved.

Jerry's note 5 is *"hold the line on Mana"*, and §16 makes it his call. **Σ 0.75 is untouched.**

`game.js:3409–3440` is the whole production stack, and **Kittens' Law is literally this code**:
`getEffect` sums within a named category, categories multiply against each other. **Five
categories, and they are not interchangeable.** A census of every declaration in `js/*.js`:

| category | members in the whole game | magnitudes |
|---|---|---|
| **`<res>GlobalRatio`** | **2** — starchart, unicorns | **0.30, 0.25** |
| `<res>SuperRatio` | 1 — coal | 0.20 |
| `<res>RatioReligion` | 2 keys | unicorns Σ8.40, faith 0.10 |
| `<res>JobRatio` | 3 keys | wood Σ3.20, manpower Σ1.00, **catnip Σ0.80** |
| `<res>Ratio` | 268 declarations, 138 keys | keyed by **building**, not by resource |

**Against the only category with RR's scope, RR is 2.5–3× the source's largest single member, and
no resource in Kittens has a stacked global production category at all. Against the source's job
lines, Σ0.75 is unremarkable — catnip is Σ0.80 over two rungs.** So the magnitude is fine and the
scope is not: RR's line is a catnip-sized boost applied globally. That is the honest framing for
Jerry; nothing changes on my say-so.

**A citation is corrected.** v0.59.1 re-rated `leylineCalibration` EASIER — correctly — but
justified it with *"Kittens does have global `<res>Ratio` upgrades."* **`<res>Ratio` is the
buildings category**, keyed by building. The global category is `<res>GlobalRatio` and it has two
members. The verdict was right; the citation was one category over.

**And the deeper item is named rather than fixed:** RR has **one** `boosts` accumulator where the
source has **five**, applied to building production, job production and converter outputs alike.
**RR cannot express "job-scoped" and "global" as different things at all** — which is why
v0.59's `leylineCalibration` could move between them by editing one line. That is a refactor of
the production pipeline, not a number, and it is a standing-divergence row.

---

## 7. Part 8 — the triage, and the guard that makes it stick

**120 of 226 rows — 53% — were UNVERIFIED.** Three of this round's finds were UNVERIFIED rows that
fell to a single grep against a clone, which reframes the number: much of it is not
unverifi**able**, it is unatt**empted** under a retrieval method that no longer applies.

**Every UNVERIFIED row now carries a class, derived from the row rather than hand-assigned** —
120 hand-assignments would be 120 things to maintain and the first future round to add a row would
forget one.

| | predicted | **measured** |
|---|---|---|
| RETRIEVABLE | 35 | **35 — exact** |
| RR-ORIGINAL | 60 | **85** |
| GENUINELY OPEN | 25 | **0** |

**The RETRIEVABLE prediction is right to the row.** The other two are wrong in a way that matters:
there is no "looked for and not found" class in the current data, because every row either names a
Kittens identifier or says there is no counterpart. **The 25 the spec expected are mislabelled
RR-ORIGINALs — exactly the archetype it named with the `hextech` row.** UNVERIFIED means "not yet
looked up"; a mechanism with no counterpart cannot be looked up and must be argued EASIER or
HARDER instead.

**The guard:** `tools/parity-ledger.mjs` now aborts on a GENUINELY OPEN row with no recorded
retrieval attempt. *"I could not find it"* is a verdict; *"I did not say whether I looked"* is a
gap, and 48 rows were in it.

**The RETRIEVABLE set was then worked, not just classed.** The buildings block — the largest
coherent group — was retrieved from the clone with pinned line numbers: `aqueduct`, `workshop`,
`tradepost`, `oilWell`, `calciner`, `quarry`, `mine`, `lumberMill`, `warehouse`, `harbor`,
`smelter`, `factory`, `pasture`. **13 rows cited, 8 moving to PARITY.**

Two of them matter beyond their own row:

- **The Calciner and the Smelter both have flat inputs and multiplied outputs.** The asymmetry RR
  was suspected of inventing is the source's own, confirmed twice independently — and that is what
  Part 3 turns on.
- **The `hextechFoundry` row's mapping is wrong** — it points at Kittens' Factory, which is a
  craft-ratio building, while RR's Foundry is a converter. **Flagged rather than silently
  repaired**, because re-pointing a mapping is a judgement the next round should make deliberately.

**Ledger: 226 rows — PARITY 63 → 72, EASIER 41, HARDER 2, UNVERIFIED 120 → 111.**

---

## 8. Pacing — the full-rigour gate

*(three seeds, 2,500 game-years)*

---

## 9. Part 4 — the Era-3 variance decomposition

*(four seed-matched slices)*

---

## 10. Invariants re-pointed this round, with their superseding spec item

| suite | assertion | superseded by |
|---|---|---|
| `test-v38` | the charge surplus is bounded by the initial 2 charges per camp | **Part 1.1** — charges regenerate, and each slot independently. Now an **exact equality** at 1,088, which is strictly stronger than the inequality it replaces. |
| `test-v45` | `kindling` is "the one surviving branch tech", is a leaf, sits on a rung | **Part 1.1** — v0.59.1 note 3 deleted it. Re-pointed to state what an empty `NEW` set means, so re-adding a branch tech re-arms the properties. |
| `test-v59` | the repo root holds no spec | **Part 0** — the v0.60 analyzer pushed one. **Seventh instance of this class**: "file X is absent" is a version-pinned assertion in disguise. Re-pointed to the durable property (a consumed spec is *moved*, not copied). |
| `test-v591` | §3 — the repo root has no spec to consume | **Part 0**, same class. Re-pointed onto the two archived artefacts, which is what OFF-CYCLE-PROTOCOL §3 actually requires. |
| `test-v581` | `AUTOMATION_TRIGGER` / `AUTOMATION_SHARE` exist as separate constants | **Part 5** — one `AUTOMATION_BASE` drives both, as in the source. |
| `test-v591` | the RR-original share is labelled UNVERIFIED | **Part 5** — retrieved and rated PARITY. |

---

## 11. Files

| file | change |
|---|---|
| `index.html` | Part 5 (automation), Part 7 (XP rate and the rank ladder); `VERSION` → `v0.60` |
| `sim/simcore.mjs` | Part 2 (normaliser + deficit rule), Part 3.1 (crystal decomposition capture) |
| `sim/pacing.mjs` | Part 3.1 (the decomposition printer) |
| `tools/run-suites.mjs` | **new** — the runner that fails on a dying suite |
| `tests/_suite-end.mjs`, `tests/_selftest-throws.mjs` | **new** — the trailer and its demonstration |
| `tools/parity-ledger.mjs` | Parts 6, 7, 8 — the census, the re-ratings, the triage classifier and its abort guard |
| `tests/test-v60.mjs` | **new**, 50 assertions |
| `tests/test-v38/45/59/581/591` | re-pointed, §10 above |
| `snapshots/v60/A,B,C,D` | Part 4's seed-matched slices |
| `docs/specs/rr-analyzer-v060-spec.md` | the consumed spec, archived |
