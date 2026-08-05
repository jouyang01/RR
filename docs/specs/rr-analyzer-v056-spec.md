# BUILDER SPEC v0.56 — the skill increment's file and line, Leona deletes Deepwinter, and `test-v32` is not a flake

Written against the **v0.55 tag**, verified from disk on a fresh clone. Every claim below is
either a measurement I took this session or a source line I read this session.

**Baseline, re-measured — the pacing run reproduces BUILD REPORT v0.55 §8 to the digit:**
Rites y75.3 · Sparks y177.1 · Icathia y837.7 · **Era 3 660.6** · 130 wanderers **y1013** · peak
pop 220 · morale band 67%, minimum 88 · Convergence at Sparks 3.87% · camp multiplier at
Icathia ×5.8179 · median XP bank at Icathia 176,750, top 1,335,491 · crystals at cap 94.2% ·
vigor at cap 0% (1,613.5 s wall).

**And every code claim verifies exactly:** `VERSION v0.55`, `PROVISIONS_SCALE 10`,
`CONSUMPTION 4`, farmer 5.000/s, Farmstead 0.625/s seasonal at ratio 1.12, Granary
`provisions 100 + timber 10` at 1.15 with `eatCut 0.005` on `logistics`, `poroPasture` ratio
1.75, `hunterLodge` **absent**, `petricite` at `knowledge 65,000 + morellonomicon 65`,
`irrigation` on `smelting`, `XP_PER_SECOND 2`, the `DRAKE_CAP` table, `strictDR` delivering
9.09 / 16.67 / 33.33 / 50.00 / 66.67 / 83.33 / 90.91 % of cap at 1/2/5/10/20/50/100 kills, the
camp stack delivering **×5.9286** at Σ 5.10, the ladder at **37 techs · 9 ties · median
×1.1111 · geometric mean ×1.2632 · largest ×3.333**, both audit graphs zero, and the parity
ledger at **188 rows — PARITY 50, EASIER 12, HARDER 2, UNVERIFIED 124.**

**One claim does not reproduce, and it is not a flake.**

> BUILD REPORT §9: *"`test-v32` flaked once under contention during the full sweep (64/65) and
> passed clean on an idle re-run, exactly as HANDOFF §8.6 predicts. Not a defect."*
>
> **I measured 64/65 four times out of four**, twice under load and twice more afterwards, with
> the failure value *varying*: **4.980, 4.980, 4.960, 4.980** against an expected 5.000. It is
> not contention and an idle re-run does not fix it. **Root cause, traced to the line:** the
> assertion computes `campYieldMult() / base` where `base` is taken with the **live roster still
> in `S`** — the block clears `S.upgrades`, `S.jobs` and `S.buildings` and not `S.wanderers`. I
> instrumented it: at that point the page holds **10 wanderers, one of them a Trailblazer**, so
> `traitBonus("trailblazer") = 0.005`, `base = 1.005`, and `5.005 / 1.005 = 4.980`. Two
> Trailblazers gives 4.960. With an empty roster the same probe returns **base 1.000 and exactly
> 5.000.**
>
> The trait roll is random, so the assertion passes only when the roster happens to contain zero
> Trailblazers. **HANDOFF §8.6's remedy — "re-run on an idle box" — works by luck**, and it has
> now been credited with masking a real fixture defect across three rounds.

So the honest suite count on the shipped build is **1,166 passed, 1 failed**, and Part 6 fixes
the fixture rather than the box.

---

## Part 0 — Ground rules, and two corrections the builder must not inherit

### 0.1 Version and rulings

**This spec produces `v0.56`.** The tag is authoritative (§10). Bump `VERSION`; assert the
`vN.NN` *shape* everywhere except this round's own suite (§Appendix — the literal-pin mistake
has now recurred twice).

**Do not re-open** STANDING-RULINGS §§1–18. In particular: seasonal farmers are RR-ORIGINAL and
deliberate (§17) — Part 3 does **not** revert them; `hunterLodge` stays deleted (§18);
`CAMP_YIELD_LIMIT` stays 6; `poroRatio` stays unbounded; `BOOST_LIMIT` keeps seven keys.

### 0.2 Jerry's directive 1, explained rather than re-implemented

> Jerry: *"Farmer's are not affected by seasonality, adjust this."*

**Seasonal farmers shipped in v0.55 and the code is correct.** `index.html:3515` carries
`if (r === "provisions") jv *= farmMult;` inside the job loop, the breakdown line at `:3518`
names the season and the multiplier, the farmer's `desc` was updated to *"the harvest follows
the calendar"*, and `test-v55` asserts all four seasons including winter's exact 75.0% cut.
**Grepped and measured — do not re-implement it.**

**There is exactly one way a player sees what Jerry describes, and it is a real defect:**

```js
// index.html:3410
if (leaderIs("leona")) farmMult = Math.max(1, season.farmMult) * Math.max(1, weatherMult);
```

**Leona's lead — *"Zenith Blade — Deepwinter and cold snaps never touch the harvest"* — floors
`farmMult` at 1 and therefore deletes seasonality outright.** With Leona leading, Deepwinter's
×0.25 becomes ×1.00, chilly weather's ×0.5 becomes ×1.00, and a farmer is *exactly* as
unaffected by seasons as before v0.55 shipped.

**And v0.55 silently made it stronger.** Before v0.55, `farmMult` reached only buildings with
`seasonal: true`; Part 3.2 extended it to the farmer job, so Leona's lead now cancels the
season on the job path as well — a scope expansion nobody noticed, in the round whose stated
purpose was making Deepwinter bite. See Part 3.

### 0.3 The drake rework is unmeasured, and that is a §8-class finding

The shipped run kills at most **two** drakes of any type in 2,500 game-years: at Icathia,
infernal 0, ocean 2, mountain 2, cloud 1, hextech 1. v0.55 Part 6 replaced `limitedDR` with
`strictDR` precisely because `limitedDR` was linear below 75% of the cap — **but at 0–2 kills
the old curve was linear anyway**, so the change is measured over the one range where the two
curves nearly agree. The kill-count table in BUILD REPORT §5 is a synthetic probe, and it is
correct; what has never been observed is a *run* in which the difference matters.

**This is not a reason to revert anything.** It is a reason to say so in the ledger and to stop
quoting the drake rework as a pacing item. Report drake kills per type at every milestone in
every future round.

---

## Part 1 — Wanderer experience: the source's mechanism is found, with its cap

**Jerry's directive 3:** *"Wanderer EXP gain should be SLOWER than before. If you can find the
Kittens' job exp rate, use that ratio, but if not, make it slower."*

v0.55 shipped `XP_PER_SECOND = 2` as an UNVERIFIED interim after `js/game.js` and `js/core.js`
404'd from three mirrors, and it cost **−193.6 game-years of Era 3** — the round's largest
single accelerant, filed as flavour. This Part is the follow-through.

### 1.1 What I found, and where

`js/village.js` resolves. The accrual is there; it was missed because it uses local variables
rather than a named effect. **Lines 2645–2651, verbatim:**

```js
if (!kitten.skills[kitten.job]){
    kitten.skills[kitten.job] = 0;
}
//Learning job's skill
if (kitten.job != "engineer" || kitten.engineerSpeciality != null) { // Engineers who don't craft don't learn
    if (kitten.skills[kitten.job] < skillsCap){
        kitten.skills[kitten.job] = Math.min(kitten.skills[kitten.job] + skillXP, skillsCap);
    }
```

and immediately above, **lines 2621–2622:**

```js
var neuralNetworks = game.workshop.get("neuralNetworks").researched;
var skillsCap = 20001;
```

**Three things are now sourced that were not:**

1. **Kittens caps job skill at 20,001.** RR has **no cap at all** on `w.jx`.
2. **Kittens awards skill only for the job actually worked**, and a kitten in a job that does no
   work (an engineer with no speciality) learns nothing. RR matches the first half
   (`w.jx[w.j] += dt`) and has no equivalent of the second.
3. **A workshop upgrade (`neuralNetworks`) is read on the line that sets up the accrual**, so
   the rate is upgrade-modified in the source. RR's is a bare constant.

**Still unresolved: the scalar `skillXP`.** It is a local computed between lines 2623 and 2644,
and the grep index that resolved `skillsCap` does not return that assignment under any query I
could construct. **No number was invented.** Keep hunting — Part 1.4 — but the round does not
depend on it, because the cap and the directive together are enough to act on.

### 1.2 What the measurement says the problem actually is

From the shipped run's `xp` instrumentation:

| milestone | trade-ranks at Challenger | median bank | top bank |
|---|---|---|---|
| Sparks (y177.1) | **40 of 65 — 62%** | 144,180 | 278,641 |
| Hexcore | 63 of 96 | 349,830 | 686,271 |
| Deep Works | 95 of 132 | 329,820 | 1,152,901 |
| Icathia (y837.7) | **132 of 191 — 69%** | 176,750 | 1,335,491 |

**Two thirds of the settlement is at the top rank before Era 3 begins, and the top bank is 116×
the Challenger threshold of 11,500.** The ranking system's entire dynamic range is consumed in
Era 2 and contributes nothing afterwards except a flat +18.75%.

**Note what this rules out.** A cap alone does **not** fix it: `rankOf()` already stops at
Challenger, so banks above 11,500 change no bonus today. **The rate is the lever; the cap is
parity.** Ship both, for different reasons, and do not let the cap be mistaken for the fix.

### 1.3 What to ship

**(a) `XP_PER_SECOND = 2 → 0.5.`** Unambiguously slower than v0.55's 2 and slower than v0.54's
1, satisfying the directive on either reading of "before". Sized from v0.55's own elasticity:
1 → 2 cost **−193.6** game-years of Era 3, almost entirely on the late edge (Icathia −173.0).

**(b) A skill cap, at parity by ratio.** Kittens caps at **20,001** against a top tier that
begins at **9,000** — a cap **2.2223×** the top threshold. RR's top rank (Challenger) is
**11,500**, so the rank-matched cap is **`XP_CAP = 25,556`**. Clamp `w.jx[job]` at it, exactly
as the source does with `Math.min(..., skillsCap)`.

**(c) Label it honestly.** `XP_CAP` is **PARITY** (ratio-matched to a read source line).
`XP_PER_SECOND` stays **UNVERIFIED** until the scalar is found — the value moved for a
directive, not for a citation, and the ledger must say so.

**Do not touch `RANKS`.** Its thresholds and bonuses are already at parity in shape and exactly
at parity at the top (0.1875 = Kittens' `getValueModifierPerSkill` ceiling before
`masterSkillMultiplier`). Changing the ladder and the rate together would make neither
measurable.

### 1.4 Keep hunting for `skillXP`

For whoever tries next, so the search is not repeated blind: `js/village.js` **does** resolve
from `raw.githubusercontent.com`, but a whole-file fetch is summarised and drops the line. What
worked was **grep.app's API** with the repo filter URL-encoded:

```
https://grep.app/api/search?q=<term>&filter%5Brepo%5D%5B0%5D=nuclear-unicorn%2Fkittensgame
```

`skillsCap =` returned `js/village.js:2622` directly. The same query shape for `skillXP =`
returns no kittensgame hit, so the variable is assigned in a form that query does not match.
Try `var skillXP`, `skillXP*=`, `neuralNetworks ?`, or the enclosing function name. **If it is
found, reprice and report the delta against this round's measured 0.5.**

---

## Part 2 — `CONSUMPTION` 4 → 4.25 (Jerry's directive 2)

> Jerry: *"Consumption should follow kitten's line."*

This closes a disagreement the analyzer raised, the builder shipped against, and the build
report recorded. Source: `js/village.js`, `catnipPerKitten: -0.85` per tick × 5 ticks/s =
**4.250/s**, against a farmer's `catnip: 1`/tick × 5 = **5.000/s**.

| | consumption | farmer : eater ratio |
|---|---|---|
| source | 4.250 | **1.17647** |
| shipped v0.55 (Jerry's 4) | 4.000 | 1.25000 |
| **v0.56** | **4.250** | **1.17647 — exact parity** |

The shipped 4 is a **6.2% relaxation** of food pressure; 4.25 removes it. Measured now, this
is not academic: at Sparks the run shows **gross 93.877/s − eat 100.378/s = net −6.501/s**, and
at Hexcore **gross 55.603/s − eat 117.440/s = net −61.837/s** in Deepwinter. The settlement is
already running a food deficit at two of four milestones and living off stock.

**Pass conditions:** `CONSUMPTION === 4.25` and the ratio measures 1.17647 to 1e-5;
`test-v45`'s re-pointed assertion updated to assert parity rather than to *name* it as the
value RR does not use; net food at all four milestones reported before and after.

**Prediction, stated before the run:** a 6.25% rise in consumption against an economy already
at a deficit is **not** a 6.25% effect. Expect **130 wanderers to move later again** — it is
already at y1013, the worst in the project's history — and expect **Era 3 to lengthen on the
late edge**. If 130 wanderers is never reached inside 2,500 years, that is the signal that Part
4's ruling is overdue, not that Part 2 is wrong.

---

## Part 3 — Leona's lead deletes the mechanic v0.55 shipped (Jerry's directive 1)

Per 0.2, this is what Jerry is seeing. `leaderIs("leona")` floors `farmMult` at 1 in
`computeRates()` (`:3410`) and in the forecast UI (`:5766–5767`, which hard-codes
`winterFarm = leaderIs("leona") ? 1 : 0.25`).

**Under the charter this is a first-class parity item.** Kittens has no leader, no lead slot
and nothing that cancels a season; the whole champion system is RR-ORIGINAL and the ledger
already labels it EASIER. Leona's lead is the extreme case: **it does not reduce a seasonal
penalty, it removes the season.** And v0.55 widened its blast radius from buildings to buildings
+ jobs without anyone deciding to.

**Ruling to ship: bound it instead of nullifying.** Replace the flooring with a *reduction*:

```js
// v0.56 Part 3. Leona no longer deletes the season; she softens it. A lead that sets a
// multiplier to max(1, x) is not a bonus, it is the removal of a mechanic — and since v0.55
// extended farmMult to the job path it removed it for jobs too. Kittens has no leader effect
// of any kind; this is RR-ORIGINAL and is labelled EASIER with the softening stated.
var LEONA_SEASON_RELIEF = 0.5;   // halves the shortfall below 1.0, never raises above it
if (leaderIs("leona")) farmMult = farmMult + (1 - farmMult) * LEONA_SEASON_RELIEF;
```

At Deepwinter that is ×0.25 → **×0.625** rather than ×1.00; at chilly ×0.5 → ×0.75; and at
spring ×1.5 it is **unchanged**, because the clause only lifts values below 1. Leona stays the
harvest champion and Deepwinter stays a season.

**Do not delete the lead.** It is thematically load-bearing and Jerry has never asked for it to
go; and a leader slot that does nothing is the exact defect v0.54 found on Twitch.

**Pass conditions:** with Leona leading, winter `farmMult` measures **0.625** and spring
measures **1.5** unchanged; the forecast UI at `:5765–5767` derives from the same expression
rather than hard-coding `1`, asserted by grep on stripped source so the two cannot drift; the
non-Leona path is bit-identical to v0.55 at all four seasons. Ledger row: **RR-ORIGINAL,
EASIER, bounded.**

---

## Part 4 — One farmer, and a settlement that banks instead of farming

The run's food instrumentation reports **`1 farmers`** at Sparks, Hexcore, Deep Works *and*
Icathia — pop 36, 59, 91 and 220 respectively. One farmer, at every milestone, in every era.

This is the same shape as "1 tinkerer" (v0.52 §8) and it deserves the same treatment: **it is a
statement about the instrument before it is a statement about the game.** The bot assigns jobs
greedily and provisions are held in enormous stock (713,013 at Sparks against a 1,284,413 cap),
so it never sees a reason to farm. A human plays the food economy; the bot banks it.

**Under §16 this is exactly the case the charter was written for: do not price around it.**

- **Report, do not fix by pricing.** Add farmer count, gross/eat/net and provisions held ÷ cap
  at all four milestones to the round's table — three are already instrumented, so this is a
  reporting requirement rather than new code.
- **Rule on the bot's job policy as apparatus.** If `manageJobs()` will not staff farming while
  a deficit runs, then every food number this project has measured since v0.55 is measured on a
  settlement that refuses to respond to hunger. Decide whether that is acceptable as a lower
  bound — it may well be — and **write the decision down** either way.
- **Do not change `CONSUMPTION`, the Farmstead or the Granary to compensate.** Part 2 already
  moves consumption for a sourced reason; a second food change in the same round makes both
  unattributable.

---

## Part 5 — The storage-scope restructure (carried, and now dated for the third time)

Unchanged, fully sourced, and dated to "v0.56, first slice" by two consecutive handoffs. The
measurements are still the ones taken in the v0.55 analysis and they have not been invalidated:
cap-out is **culture 93.8%, knowledge 90.0%, crystals 89.8%, renown 76.6%** against a
twelve-resource average of **17.7%** — *the three most cap-bound resources in the game are the
three the Masonry line does not touch* — and the **×22** figure quoted since the v0.39 spec has
never been reached, because `voidwardStores` has never been researched. The real stack is
**×12.6**. Crystals are still at cap **94.2%** of every tick on the shipped build.

The source is `addBarnWarehouseRatio` (**`js/resources.js`**): **two additive accumulators**,
`barnRatio` Σ 4.35 and `warehouseRatio` Σ 1.80, applied with **different scope per resource** —
wood/minerals/iron ×14.98, coal/titanium/gold ×2.80, catnip ×2.0875 and only after Silos, and
**everything else ×1.00**. RR runs **one multiplicative chain across twelve resources**, which
is a Kittens'-Law violation (additive within a category) on top of a scope error.

**It could not ship in v0.55 because Part 3 multiplied every provisions cap by 10.** That
collision is gone. **Ship it as this round's first slice**, with the full scope table, the
`strictDR`-era discipline about which primitive bounds what, and compensating Vault / Hexcrete
Bastion caps sized by measurement to land the Era-3 raws in a **30–60% cap-out band**.

**If it slips a third time, say why in one sentence in the build report** — an item dated three
times without a stated technical reason has stopped being scheduled and started being avoided.

---

## Part 6 — Fix the `test-v32` fixture, and correct the flake attribution

Per the header. The assertion is sound; the fixture is not.

- Add `S.wanderers = []; S.champs = {}; S.policies = {};` to the `disc` block's reset alongside
  the three it already clears, then take `base`. With an empty roster the probe returns
  **base 1.000 / campLine 5.000** — verified this session.
- **Sweep for the same shape.** Any assertion that divides by a `base` captured from live state
  is exposed to whatever earlier blocks left behind. `test-v40`'s camp probe and `test-v42`'s
  `luxuryBoundStillSplits` are the two most likely; check every `/ base` in the suites.
- **Correct HANDOFF §8.6.** It records three `test-v32` failures across v0.53–v0.55 as CPU
  contention with "re-run on an idle box" as the remedy. At least the v0.55 occurrence is this
  fixture defect, it is reproducible on an idle box, and the documented remedy hid it. Rewrite
  the entry with the real cause and keep the contention note only if a *different* assertion has
  ever been the one that failed.
- **Pass conditions:** `test-v32` passes **ten consecutive runs**, at least three of them while
  a 2,500-year run is saturating the box; the suite total is reported as a number the analyzer
  can reproduce.

**And a standing rule worth adding to the operational list:** *a test that captures a baseline
from live state must reset the state it is baselining.* This is the third distinct instance of a
green-or-red assertion that was really reading its fixture — after `test-offline-v54`'s
saturated-cap check and `test-v42`'s free-band check, both found in v0.55.

---

## Part 7 — Carried, unchanged, and each with its measured state

Every one of these is open in HANDOFF v0.55 §7 and untouched this round. **Actioned as a
reporting requirement, not as code**, except where a slice below says otherwise.

1. **The craft-depth tie-break.** Riftsteel still never forged; voidessence still accumulates
   monotonically after Icathia with no consumer. Two of v0.53 Part 4's pass conditions still
   fail.
2. **The Chembarrel / save-for-a-visible-building fix.** `catMonument` is still ×1.00;
   `seenMax.hexgear` 155.61 against the Foundry's 200.
3. **The trade-banking policy.** Deferred with a reason three rounds running.
4. **A morale round.** Band **67%** against ≥80%, minimum **88** — below the band's own floor.
5. **Convergence at Sparks 3.87%** against its 5–8% target. The pass condition finally exists
   (v0.55 Part 9) and it fails.
6. **124 UNVERIFIED ledger rows.** A reasonable cadence is ten to fifteen a round by subsystem.
   **Take the champion and leader block this round** — Part 3 opens it anyway, and it is the
   largest unlabelled RR-original system in the game.

---

## Part 8 — Order, discipline, pass conditions

### Order — five cumulative prefixes, snapshotted forward into `snapshots/v56/`

1. **Part 6** — the fixture fix. It costs no pacing and it is the only way the round's other
   numbers can be trusted. First, and re-run the whole suite after it.
2. **Part 5** — the storage-scope restructure. The largest unknown; alone in its slice.
3. **Part 1** — the XP rate and cap. **v0.55 proved this is a first-order pacing item**; it gets
   its own slice and the prediction below is the one to check hardest.
4. **Part 2** — `CONSUMPTION` 4.25.
5. **Part 3 + Part 7.6** — Leona, and the champion/leader ledger rows.

Never reverse-patch. Instrument before launching: farmer count, gross/eat/net, provisions held ÷
cap, drake kills per type, XP banks and Challenger counts all go into `snapshot()` first.

### Operational

Kill background runs by PID from `ps -eo pid,args`. `--years N`, never a bare positional. Size
every `sleep` under the tool timeout and poll. Strip comments before grepping — use `strip()`.
`limitedDR` gives away 75% of its limit; `strictDR` does not. Never `playwright install`. A
2,500-year seed-1 run measured **1,613.5 s** this session with a suite sweep alongside.
**Pushing works** — HANDOFF §6's token-remote-with-proxy-unset recipe is correct and was used
for this commit.

### Round pass conditions

| # | Condition | Target |
|---|---|---|
| 1 | `test-v32` | passes **10/10**, including under load; fixture resets the roster |
| 2 | Suite total | reported and **reproducible by the analyzer** |
| 3 | `masonryMult` | absent; two additive accumulators; every `baseCap` resource in exactly one tier |
| 4 | Fully-stacked storage multipliers | narrow ×14.84 · broad ×2.80 · quarter ×2.075 · none ×1.00 |
| 5 | Era-3 cap-out: zaunore / coalgas / hexore / shimmer | **30–60%** each |
| 6 | `XP_PER_SECOND` | **0.5**; time-to-Challenger reported in real hours |
| 7 | `XP_CAP` | **25,556**, clamped like the source's `Math.min(..., skillsCap)` |
| 8 | Challenger share at Sparks | reported; **below 62%** (the shipped reading) |
| 9 | `CONSUMPTION` | **4.25**; farmer:eater ratio **1.17647** to 1e-5 |
| 10 | Leona | winter `farmMult` **0.625**, spring **1.5** unchanged; forecast UI derives, not hard-codes |
| 11 | Non-Leona seasonality | bit-identical to v0.55 at all four seasons |
| 12 | Farmer count + net food | reported at all four milestones, before and after |
| 13 | Drake kills per type | reported at all four milestones |
| 14 | Ledger | regenerated; champion/leader rows labelled; UNVERIFIED count reported |
| 15 | Unchanged | ×20.8000 science parity · `BOOST_LIMIT` seven keys · `CAMP_YIELD_LIMIT` 6 · ladder 37/9/1.1111/1.2632/3.333 · audits 0/0 |
| 16 | Every Part | actioned, or its non-action explicitly justified |

### Predicted vs measured — on the record, before any run

**Under §16 these are secondary to the citations. They are stated anyway, and v0.55 is the
reason: the one slice nobody predicted was the one that decided the round.**

| slice | Era 3 | Icathia | Sparks | note |
|---|---|---|---|---|
| v0.55 baseline (re-measured) | **660.6** | y837.7 | y177.1 | reproduces §8 exactly |
| s1: fixture fix | **0.0** | unmoved | unmoved | no game code changes |
| s2: + storage scope | **+150 to +350** | later | **within ±15 of y177** | late edge only; nothing in it gates before Sparks |
| s3: + XP 2 → 0.5 | **+190 to +390** | **later** | later by 10–40 | two halvings against a measured −193.6 per doubling |
| s4: + `CONSUMPTION` 4.25 | **+20 to +90** | later | later by 5–20 | 6.25% on an economy already at a deficit |
| s5: + Leona + ledger | **−10 to +30** | | | Leona only binds when she is the leader |
| **shipped** | **1,020–1,430** | — | — | **first round with a credible path into the target band** |

**The informative failures to watch for.** If s3 returns **less than +150**, the XP elasticity
is not linear in halvings and v0.55's −193.6 included something else — say what. If s2 moves
**Sparks** at all, the storage tier table has reached into Era 2 and the table is what is wrong,
not the multipliers. If **130 wanderers is never reached** after Part 2, stop and rule on the
food economy before shipping anything else — that condition has now failed four rounds running
and each round has made it worse.

---

## Sources, all read this session

**Kittens** (`github.com/nuclear-unicorn/kittensgame`):
`js/village.js:2621–2622` — `var neuralNetworks = game.workshop.get("neuralNetworks").researched;`
and **`var skillsCap = 20001;`**. `js/village.js:2645–2651` — the skill-learning block quoted in
full in Part 1.1, including *"Engineers who don't craft don't learn"* and
`Math.min(kitten.skills[kitten.job] + skillXP, skillsCap)`. `js/village.js` — `catnipPerKitten:
-0.85`, farmer `modifiers: { "catnip": 1 }`, `getValueModifierPerSkill()`'s seven tiers topping
at **0.1875 at 9,000**. Kittens wiki, *Kittens* page — the same seven tiers as prose
(0 / 100 / 500 / 1200 / 2500 / 5000 / 9000 → 0% / 1% / 3% / 4% / 8% / 13% / 18.75%), confirming
the code table independently. `js/resources.js` — `addBarnWarehouseRatio`, for Part 5.

**RR**, at the v0.55 tag, comment-stripped: `index.html:3410` and `:5765–5767` (Leona's
`Math.max(1, …)` flooring, and the forecast's hard-coded `winterFarm`); `:3454` and **`:3515`**
(seasonal buildings, and the seasonal *job* line v0.55 added); `:676` (the farmer's updated
`desc`); `:1141–1145` (Leona's lead text); `SEASONS` at `:22–25`; `CONSUMPTION 4`;
`PROVISIONS_SCALE 10`; `XP_PER_SECOND 2`; `RANKS` topping at Challenger 11,500 / 0.1875;
`DRAKE_CAP` and `strictDR`; `campYieldMult()`'s seven mapped members plus the Trailblazer;
`traitDef("trailblazer").per = 0.005` and `TRAIT_LIMIT = 0.15`.
`tests/test-v32.mjs:179–209` — the `disc` block that clears `S.upgrades`, `S.jobs` and
`S.buildings` but not `S.wanderers`, instrumented this session to **10 wanderers, one
Trailblazer, base 1.005**.

**Measurements taken this session:** all 24 suites (**1,166 passed, 1 failed** — `test-v32`,
four times out of four); the 2,500-year seed-1 pacing run (1,613.5 s wall, reproducing BUILD
REPORT v0.55 §8 exactly); a live-game probe of `VERSION`, `PROVISIONS_SCALE`, `CONSUMPTION`,
the farmer and Farmstead rates, the Granary, `poroPasture`, `petricite`, `irrigation`,
`XP_PER_SECOND`, `DRAKE_CAP`, `strictDR`, the camp stack, the tech ladder and both audit
graphs; and a targeted instrumentation of `test-v32`'s failing block.
