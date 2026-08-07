# BUILDER SPEC v0.59 — the Granary is a reused id, and renown becomes a deed currency

Written against the **v0.58.1 tag**, verified from disk on a fresh clone.

**What reproduces.** All 28 suites run: **1,435 passed** against the report's 1,436. The parity
ledger reproduces exactly — **226 rows: PARITY 57, EASIER 41, HARDER 2, UNVERIFIED 126.** Every
code claim I probed verifies: `VERSION v0.58.1`; §29 as shipped delivers **culture ×1.05 and
devotion ×1.00** on a fully-stacked state, exactly Jerry's notes 15 and 16; the rank ladder tops
at **Challenger 18,200 / +0.1875**, confirming note 11's 102% parity debt; `XP_PER_SECOND 0.5`
and `XP_CAP 25,556`; `RENOWN_DEED_RATE 0.34`; both audit graphs zero.

**Jerry's two bug reports are both real. I reproduced the first end to end.**

> **Dev note 9 — "Granaries are turning into storehouses on refresh. MAJOR BUG."** Confirmed,
> root-caused, and demonstrated: seven Granaries and three Storehouses, serialised and reloaded,
> come back as **zero Granaries and ten Storehouses**.
>
> `index.html:6501–6505`, inside `loadFromString()`:
> ```js
> var legacy = (fresh.buildings.granary || 0) + (fresh.buildings.runestone || 0);
> if (legacy) {
>   fresh.buildings.storehouse = (fresh.buildings.storehouse || 0) + legacy;
>   delete fresh.buildings.granary; delete fresh.buildings.runestone;
> }
> ```
> **This is the v0.10-era migration that folded the OLD Granary into the Storehouse — and
> v0.56 Part 3.4 shipped a NEW building on the same id `granary`** (Kittens' `pasture`
> analogue, `provisions 100 + timber 10`, `eatCut 0.005`). The migration has been eating it
> ever since.

> **Dev note 10 — "Renown is still not being earned unless a wild charge is spent."** Confirmed
> by enumeration: **no building and no job produces renown.** Every source in the game is
> `gainRenown()` called from expedition resolution, scaled by `RENOWN_DEED_RATE 0.34`, plus
> Caitlyn's per-caravan clause when she leads. Spending a Wilds charge is the only way to earn
> it.

**Jerry issued eight further directives after the first draft of this spec, and they rewrite
Parts 2 and 5.** They are researched, measured and specified in place; the summary is that
**renown stops being an idle income and becomes a deed currency** (directives 1–6, Part 2) and
**the Scholarship line stops being a renown cap multiplier and becomes RR's port of Kittens'
knowledge amplifiers** (directives 7–8, Part 5). Two of the eight — no renown from Ascent, none
from first-time research — **were measured as already true and require no code**; two more
exposed defects nobody had reported: **`RENOWN_DEED_RATE 0.34` collapses the entire low camp
ladder to a flat 1 renown**, and **renown accrues invisibly before Call to Arms and arrives
pinned at its cap**, which is the backfill directive 2 rules out.

**Two corrections to my own previous work are recorded in place rather than quietly fixed.**
Part 2's opening retracts my claim that renown is expedition-only — **there is a passive trickle
at `index.html:5129` that I missed** because it writes `rates.renown` instead of calling
`gainRenown()`, and directive 2 therefore *cuts* an existing trickle by 14–100× rather than
adding a new one. Part 5.2 retracts the first draft's claim that `SCHOLAR_CAPS` had "three
members and three behaviours" — **it has one**, and §22 was never violated.

**One long-open lookup closed as a by-product.** Culture's ×1.05 — UNVERIFIED since v0.55
because three rounds could not retrieve `cityOnAHill` through grep.app — is **`cityOnAHill`'s
`onAHillCultureCap: 0.05`, consumed as a whole-cap multiplier at `js/resources.js:958–961`.
Exact parity with RR's `CULTURE_FIXED_MULT`.** The ledger row moves UNVERIFIED → PARITY.

**This round's Kittens research was done against a local clone of
`github.com/nuclear-unicorn/kittensgame`, not grep.app.** Every source citation below was read
from disk and can be re-checked the same way; the clone is the retrieval route future rounds
should use.

**And one discrepancy against the report's "0 failures":** `test-v581`'s assertion 36 fails
during a full-suite sweep — *"the Rift Scuttler scales with max knowledge and max Vigor: FAIL
+400 knowledge of 10000 cap, **+−9,996,500 vigor** of 3100"* — and passes 2/2 on an idle box
(+186 of 3,100, which is exactly 6% and correct). **The game code is right; the assertion is a
§21 defect.** It captures `v0 = S.res.vigor` and measures a delta without resetting the resource
it is baselining, so when an earlier block leaves vigor above the ceiling the `gain()` clamps and
the delta goes hugely negative. **The idle-box re-run hides it, which is the exact remedy §21
was written to retire.** Part 7.

---

## Part 0 — Ground rules

**This spec produces `v0.59`.** Integers stay reserved 1:1 for spec rounds; v0.58.1 took the
point release. Assert the `vN.NN` shape everywhere except this round's own suite.

**Read `BUILDER_PROTOCOL.md` and `OFF-CYCLE-PROTOCOL.md` first.** This is a spec round, so the
two-tier cadence applies: fast single-seed short checks per part, the three-seed ensemble
**once**, at the end. Budget it generously — **my ensemble on this build passed 62 minutes and
was still running**, materially longer than v0.57's 2,561 s, so plan on ~75–90 minutes.

**Do not re-open** STANDING-RULINGS §§1–29. Two are touched only in ways they provide for:
§27's population band is explicitly Jerry's to overturn, and §29 is amended by adding the
citations it asks for, not by moving its figures.

**`OFF-CYCLE-PROTOCOL.md` §5 asks this round to re-check every number v0.58.1 moved against its
Kittens counterpart.** Parts 5 and 6 do the two the handoff names first; Part 8 does the rest as
ledger rows.

---

## Part 1 — The Granary is deleted on every load (dev note 9) — ship this first

**Reproduced above.** The cost to the player is worse than losing a building: the count is
carried **1:1 into a different and far more expensive building**, so a player who owned seven
Granaries (`provisions 100 + timber 10` each) silently receives seven Storehouses
(`provisions 5,000` cap each) and loses the `eatCut` they were bought for. It is simultaneously
a loss and a free-Storehouse exploit.

**Why no suite caught it, and this is the part worth fixing structurally.** `simcore` loads
`freshState()`, which has no Granaries, so `legacy` is always 0 and the simulator never touches
the path. `test-v56` asserts the Granary exists; nothing round-trips it through
`serialize()` → `loadFromString()`. **Every save migration in the file is in the same position.**

- **Retire the legacy block.** The old Granary was consolidated into the Storehouse in v0.10, a
  removal now forty-nine versions old; `runestone` is the same vintage. Delete the `granary` term
  and keep `runestone` only if a save from that era is still considered loadable — **state which
  and why**, because "keep it just in case" is what created this.
- **Add the missing guard, generally.** A round-trip assertion for **every** building the
  migration block names: build N, `serialize()`, `loadFromString()`, assert the resulting counts
  are what the migration intends. The Tavern, Bloomery, Petricite Monument and Hunter's Lodge
  migrations are all unexercised in the same way.
- **A new standing ruling, because this is a class:** *a deleted id must never be reused while
  its migration still exists, and a migration must name the version that retires it.* The project
  already has §5 pinning `quarry`'s id for a related reason; this is the other half.

**Pass conditions:** seven Granaries survive a save/load round trip as seven Granaries;
every id named in the migration block has a round-trip assertion; `test-v59` fails if a
`BUILDINGS` id also appears as a *source* in the migration block.

---

## Part 2 — The renown economy: Jerry's directives 1–6

**Read this first: I got the enumeration wrong last round, and the correction changes the
sizing.** I reported that "no building and no job produces renown" and that renown is
expedition-only. `gainRenown()` does have exactly two callers, and neither is a building or a
job — but **there is a passive renown trickle** and I missed it, because it writes `rates.renown`
directly rather than going through `gainRenown()`. `index.html:5129`, inside `computeRates()`:

```js
if (S.techs.logistics && S.pop > 0) {
  var renownTrickle = 0.005 * S.pop * (S.techs.callToArms ? 1 : 0.5);
  rates.renown += renownTrickle;
  track("renown", "A settlement of " + S.pop + ", spoken of", renownTrickle);
}
```

**Measured, live:** 0.200/s at pop 40 with Call to Arms, 0.100/s before it. Directive 2 does not
add a trickle to a game that has none — **it replaces a population-scaled trickle with a flat
one, and the flat one is far smaller.** That is Jerry's call to make, but he should make it
knowing the size of the cut. Part 2.2 states it.

### 2.0 What I measured before writing any of this

A live probe, fresh state, all techs, pop 40, 30 Halls, renown seeded at 100, one action per
run. **Every directive was checked against the game rather than against the code's intent:**

| directive | action | renown delta | verdict |
|---|---|---|---|
| 1 | `ascendTargon()` with 500 devotion | **0** | **already true — no code change needed** |
| 5 | `buyTech("mining")`, first time | **0** | **already true** |
| 5 | `buyUpgrade("cataloguing")`, first time | **0** | **already true** |
| 4 | `tradeCaravan("demacia")`, no leader | **0** | directive 4 is a real addition |
| 3 | `runExpedition("wolves")`, 2 charges | **+1** | |
| 3 | `runExpedition("wolves")`, 0 charges | **0** | **Jerry's bug, reproduced** |

**Directives 1 and 5 are already satisfied and the builder must not "fix" them.** Ascent converts
devotion to worship and grants nothing else (`index.html:1846`); `buyTech` and `buyUpgrade` grant
nothing but the tech or the upgrade. **Record both as ledger rows and ship no code.** The likely
reason Jerry saw renown appear at an Ascent is the trickle above: at pop 40 it pays 0.2/s
continuously, so renown rises during *any* action that takes wall-clock time. **If he saw a
step-change rather than a drift, that is a new bug and this Part has not found it — say so in the
build report rather than quietly closing the note.**

### 2.1 Hunts always pay, and the charge multiplies (directive 3)

`index.html:6356`:

```js
if (!isChargeCamp(e) || empowered) {
  gainRenown(Math.max(1, Math.round((e.renown || 2) * RENOWN_DEED_RATE * policyMult("renown"))));
}
```

For a charge camp — Wolves, Gromp, Raptors, Krugs, the Abyss Journey — renown is paid **only when
a charge was consumed**. That is exactly Jerry's report. **Delete the guard.**

**And a second defect the directive exposes, which matters more than the guard.**
`RENOWN_DEED_RATE 0.34` with a `Math.max(1, Math.round(...))` floor **collapses the whole low
ladder to a constant**:

| camp `renown` field | 2 | 3 | 4 | 5 | 6 | 8 | 10 |
|---|---|---|---|---|---|---|---|
| renown actually paid | **1** | **1** | **1** | 2 | 2 | 3 | 3 |

Wolves, Gromp, Raptors and Krugs are authored at 2, 2, 3 and 3 and **all four pay exactly 1**.
The camp ladder's differentiation is dead on the shipped build, and "the charges should multiply
the renown given" cannot mean anything until it is alive.

**Ship this shape:**

```js
var base = Math.max(1, Math.round((e.renown || 2) * RENOWN_DEED_RATE * policyMult("renown")));
gainRenown(empowered ? base * CHARGE_BONUS : base);
```

— unconditionally, for every expedition. **Multiply after the floor, not before**, so the charge
is a clean ×3 (`CHARGE_BONUS 3.0`, `index.html:6251`) rather than something rounding eats.

**`RENOWN_DEED_RATE` is the lever for the ladder, and it should rise to 1.00.** At 1.00 the
authored fields pay themselves — Wolves 2, Raptors 3, Baron 40 — which is what "the small renown
bonus listed" means to a player reading the camp. **Predicted:** an unempowered Wolves hunt goes
1 → 2, an empowered one 1 → 6. **Measure first-champion on three seeds before and after**; this
is the single largest renown change in the round and it moves the same direction as 2.2's cut.
If Jerry prefers to keep 0.34, say so in the report and leave the ladder flat by his ruling —
but do not leave it flat silently.

### 2.2 The passive trickle becomes flat 0.007/s (directive 2)

Replace the population-scaled trickle at `index.html:5129` with a **flat 0.007/s**. Jerry's
figure, taken as stated. **What it costs, stated before the run:**

| pop | shipped trickle | directive 2 | factor |
|---|---|---|---|
| 20 | 0.100/s | 0.007/s | **14× slower** |
| 40 | 0.200/s | 0.007/s | **29× slower** |
| 140 | 0.700/s | 0.007/s | **100× slower** |

At 0.007/s the trickle pays **15,377 renown in 25.4 real days**, so it can no longer fund the
champion ladder on its own at any settlement size. **That is coherent design, not a
mistake** — it converts renown from an idle income into a deed currency, which is what
`RENOWN_DEED_RATE` always claimed it was and what directives 3 and 4 build out. **But it only
works if 2.1 and 2.3 land in the same build.** Ship all three together or none.

**No backfill (directive 2, second sentence), and it is a live defect today.** Measured: before
Call to Arms, renown is `hidden` (`index.html:355`) but the trickle still runs at 0.100/s into a
cap of 30, so **a player arrives at Call to Arms with renown already pinned at 30/30 by a
resource they have never seen.** That is the backfill Jerry is ruling out.

**Gate the trickle on the same condition that reveals the resource** — `S.techs.callToArms`, not
`S.techs.logistics` — so the meter starts at 0 on the tick the player first sees it. Drop the
`(callToArms ? 1 : 0.5)` factor with the gate that made it necessary. **Assert it:** a state with
`logistics` and without `callToArms`, ticked for an hour, ends with `S.res.renown === 0`.

### 2.3 Trading pays +1 renown (directive 4)

`tradeCaravan()` grants renown only under Caitlyn (`CAITLYN_TRADE_RENOWN 5`, `index.html:1671`
call site). Add a flat **+1 renown per completed caravan for every leader**, through
`gainRenown()` so the Call to Arms gate is respected.

- **Caitlyn's 5 becomes an addition, not a replacement** — she pays 1 + 5 = 6, keeping her lead
  meaningfully better rather than 5× a baseline of 1 becoming 5× nothing. State the resolved
  number in the report.
- **Bulk trades pay per caravan, not per click.** `tradeCaravanBulk(fid, times)` must grant
  `times` renown. **Assert it** — a ×10 bulk trade grants 10 (16 under Caitlyn). This is the
  clause most likely to be missed.
- **A failed caravan pays nothing.** The grant belongs on the success path, inside the same
  branch the yields are in.

### 2.4 Ascent and first-time research: no change, ledger rows only (directives 1, 5)

Both measured at 0 above. **Ship no code.** Add two PARITY-LEDGER rows recording that renown is
deliberately *not* granted by Ascent or by first-time research, with Jerry's directive as the
authority, so a future round does not add it as an "obvious" deed source. **Part 2 of the v0.59
spec as originally written listed both as candidates to ADD — that recommendation is withdrawn
and this Part supersedes it.**

### 2.5 The renown sink: many Halls of Heroes (directive 6)

`RECRUIT_BASE 400 × RECRUIT_RATIO 1.5ⁿ` (`index.html:1595`) prices the tenth champion at
**15,377 in one lump**, 45,332 cumulatively. The ceiling is `30 base + 40 trade + 60 drakeLore +
80 voidStudies = 210`, plus **900 per Hall of Heroes** flat (`caps: { renown: 900 }`, note 31.2),
all multiplied by the Scholarship line's **×2.60**.

**Part 5 removes that ×2.60 from renown, and doing so satisfies directive 6 almost by itself:**

| champion | price | Halls needed **today** (×2.60) | Halls needed **after Part 5** |
|---|---|---|---|
| 7 | 4,556 | 2 | **5** |
| 8 | 6,834 | 3 | **8** |
| 9 | 10,252 | 5 | **12** |
| 10 | 15,377 | **7** | **17** |

**Ship Part 5 first and measure before adding anything else.** Seventeen Halls is a real
build-out — cumulative **16,269 timber and 29,284 ore** at `ratio 1.15`, with the seventeenth
alone costing 2,339 timber — and it is reached by deleting a multiplier rather than by inventing
a gate. **That is the Kittens-shaped answer:** the source paces content by making the ceiling
building expensive and additive, never by a hard "you must own N of X" check.

**Only if 17 is not enough for Jerry**, escalate in this order, and state which was used:

1. **Raise `RECRUIT_RATIO` above 1.5.** Steepens the back half without touching the front —
   the first three champions are unaffected. Preferred: it is the ladder's own shape.
2. **Cut the Hall's flat 900.** Direct, but note 31.2 raised it 250 → 900 *specifically* to keep
   the ladder finishable. **Do not undo that note without saying so.**
3. **A hard Hall-count requirement per champion.** **Last resort and RR-original** — Kittens
   never gates a purchase on a building count. If it ships it is a **HARDER** ledger row with the
   departure named.

**Do not let the ladder become unfinishable.** Note 31.2's constraint stands: the tenth champion
must remain affordable. **Pass condition: the tenth champion is affordable within 2,500
game-years on at least one seed, and the Hall count needed for it is reported.**

### Part 2 pass conditions

| | |
|---|---|
| Charge guard | deleted; **every** expedition pays renown, asserted with 0 charges |
| Charge multiplier | **×3 after the floor**, asserted: Wolves 2 unempowered → 6 empowered |
| `RENOWN_DEED_RATE` | ruled by name, before/after stated; the camp ladder no longer flat |
| Trickle | flat **0.007/s**, gated on `callToArms`, asserted |
| No backfill | `logistics` without `callToArms` + 1 hour ticked → `S.res.renown === 0` |
| Trade | +1 per caravan, all leaders; **bulk ×10 grants 10**; failures grant 0 |
| Ascent, first research | **unchanged**, two ledger rows |
| Champion ladder | first and tenth champion on **three seeds**, with the Hall count for the tenth |

---

## Part 3 — Rule on Era 3 at 907 against the 1,400–2,300 band (builder note 1)

v0.58.1 measured **907.1 median, spread ×1.02, Icathia on 3 of 3** — out of the band on the low
side, down from v0.58's 1,403.9. The handoff is right that no single note did it and right that
it is a design call. **It is Jerry's to make, and the spec's job is to frame it so the call is
cheap.**

Three positions, and each has a different consequence:

- **The band is still the target.** Then Era 3 needs ~500 years back, and the levers that have
  actually moved it are on the record: v0.57's food policy moved it +1,000 by removing stalls,
  v0.56's storage scope +1,046. **Lengthening by adding scarce demand has worked; lengthening
  by raising prices has not** (§13's companion finding).
- **The band was calibrated on a broken instrument and should be re-derived.** Every Era-3
  target in this project predates the ×2.62 → ×1.07 → ×1.02 spread collapse. A band set when the
  measurement had a 2.6× error bar is not evidence about the game. **If this is the answer,
  re-derive the band from the 7-day arc `era3_regional_crafting_spec_2.md` states as the design
  intent, not from prior measurements.**
- **907 is fine.** Then say so in `pacing.mjs` and retire the band, and note that **Icathia is
  now reached on every seed for the first time**, which was the point of the era existing.

**Action either way: record the ruling in `pacing.mjs` with its reason.** Do not re-base the
band to 907 without one — that is the trap the Convergence ruling already names, and this
project has now re-based two conditions to measured values and regretted one.

---

## Part 4 — Convergence's measurement point (builder note 2)

**Convergence now reads 0 on all three seeds at Sparks**, against a condition v0.58 re-derived to
≥1%. Note 6.1 asked for exactly this — more religion buildings required — and the condition has
not moved with it.

**The measurement point is the problem, and the source says so.** Kittens gates Solar Revolution
at **1,000 worship**, where the shared formula `0.01 × unlimitedDR(worship, 1000)` delivers
exactly **1.00%**. That is an *unlock-time* value, not an Era-3-entry value — the source's
equivalent bonus does not exist at all until the player has banked 1,000 worship, and nothing in
Kittens promises a particular bonus at a particular era.

- **Move the condition off Sparks and onto the thing the source actually specifies: the unlock.**
  Assert that Convergence, once researched, delivers **≥1%** — i.e. that the player has banked
  ≥1,000 worship by the time they can buy it — and report the *year* Convergence is first
  affordable as an ensemble figure with a spread.
- **That keeps a real guard and drops a coincidental one.** A bonus measured at an era boundary
  the source does not share was never a parity statement; a bonus measured at its own unlock is.
- **Report worship at Sparks anyway**, as a single-run figure, so the trend stays visible without
  being a pass/fail.
- **Do not touch `worshipBonus()`** (§§1 and 3).

**Pass conditions:** the Convergence condition is restated against the unlock with its
arithmetic shown and Kittens' 1,000-worship / 1.00% anchor cited beside it; worship at Sparks and
the Convergence-affordable year both reported on three seeds.

---

## Part 5 — The Scholarship line becomes the knowledge line (directives 7, 8), and §29's citations

### 5.1 The citations builder note 3 asks for — one found, one still missing

§29 records culture's fixed multiplier at **×1.05** and devotion's whole-cap at **×1.00 with a
×1.5 slice**, both as Jerry's figures with no Kittens line number. I went looking.

**Devotion's ×1.5-on-a-slice is now sourced, and Jerry's scope claim is exactly right.**
`js/buildings.js:1964–1966`, inside the **Temple's** `calculateEffects`:

```js
var goldenSpire = game.religion.getRU("goldenSpire");
if (goldenSpire.on){
    effects["faithMax"] *= (1 + (0.4 + 0.1 * goldenSpire.on));
}
```

At `on = 1` that is **×1.5, applied to the Temple's own `faithMax` contribution and nothing
else.** And a repo-wide search for **`faithMaxRatio` returns no hits at all** — so there is
genuinely no whole-cap faith multiplier anywhere in Kittens. **Note 16's claim holds on both
counts. Record the citation in the ledger.**

**Culture's ×1.05 is now VERIFIED, and it closes a lookup that has been open since v0.55.**
Three previous rounds failed to retrieve `cityOnAHill`'s effects object through grep.app and
correctly refused to invent one. The local clone settles it. `js/science.js:1283–1297`:

```js
name: "cityOnAHill",
prices: [ {name : "culture", val: 4000} ],
effects:{ "onAHillCultureCap" : 0.05 },
```

and it is consumed as a **whole-cap multiplier** at `js/resources.js:958–961`:

```js
//city on a hill bonus
if (res.name == "culture"){
    maxValue *= (1 + this.game.getEffect("onAHillCultureCap"));
}
```

**×1.05, applied to the entire culture cap, from a single policy.** RR's `CULTURE_FIXED_MULT =
1.05` gated on Progress Day Parade is **exact parity — same magnitude, same whole-cap scope,
same single-toggle shape.** Jerry's note 15 figure was right and is now sourced. **Move the
ledger row from UNVERIFIED to PARITY and cite both lines**; the ledger's UNVERIFIED count drops
by one, from 126 to 125, and the PARITY count rises 57 → 58. **Report the recomputed totals.**

### 5.2 CORRECTION — `SCHOLAR_CAPS` has one member, not three

**The version of 5.2 in the first draft of this spec was wrong and is retracted here.** It
claimed culture, devotion and renown were "all in the same cap family" with "three members and
three treatments", and framed that as a §22 violation. I inferred the membership from the three
measured multipliers instead of reading the object. **What the file actually says
(`index.html:2054`):**

```js
var SCHOLAR_CAPS = { renown: 1 };
var CAP_MULT_EXEMPT = { vigor: 1, knowledge: 1, culture: 1, devotion: 1 };
```

`capFamilyOf()` returns **`exempt` / `exempt` / `scholar`** for culture, devotion and renown.
They are in **different families, one behaviour each. §22 holds and was never violated.** The
measurements were right — culture ×1.05, devotion ×1.00, renown ×2.60 — the structural claim
built on them was not.

**The history, from the file, for the record:** v0.52 shipped `{ culture, devotion }`; v0.57
Part 1 added renown on Jerry's directive; **v0.58.1 removed culture and devotion** in service of
his notes 15 and 16 — note 16 names Scholarship explicitly as one of the two things illegitimately
multiplying the whole Devotion cap — moving both to `CAP_MULT_EXEMPT` and giving culture a single
`CULTURE_FIXED_MULT = 1.05` gated on Progress Day Parade. **Renown was simply what was left
behind.** Directive 7 now removes it too.

### 5.3 Renown leaves the line, and the line's whole mechanism goes with it (directive 7)

Remove `renown` from `SCHOLAR_CAPS`. **The object is then empty, so do not leave it empty —
delete the family.** That means deleting `SCHOLAR_CAPS`, the `scholar` branch of
`capFamilyOf()`, `scholarMult` and its arm of the `storageMultFor` ternary in `computeCaps()`,
the `!SCHOLAR_CAPS[r]` guards in `capMultNames()` and Poppy's lead loop, and `scholarCapNames()`.
**This is a net deletion of a whole cap family and it is the single best structural outcome
available this round** — RR drops from three cap families to two, and `capFamilyOf()` becomes
`exempt` / `masonry` / null.

- **Renown's ceiling afterwards is `210 + 900 × Halls`, flat and additive**, plus the mountain
  drake multiplier and Poppy's ×1.08 — both of which now reach renown, because the
  `SCHOLAR_CAPS` guard that excluded it is gone. **Assert Poppy's new reach and report her
  advertised line count**, which is generated from `capMultNames()` and will change.
- **Poppy's description string is generated, not literal** (`poppyLeadDesc()`), so it will
  re-read itself. **Assert the number in it**, not the sentence.
- **Part 2.5 depends on this and is sized against it.** Ship 5.3 before measuring the champion
  ladder.

### 5.4 The five upgrades become knowledge amplifiers (directive 8)

**Directive 8's two halves are not in tension once the Kittens shape is read: the line becomes
about knowledge, but as per-building amplifiers, never as a multiplier on the summed knowledge
cap.** Knowledge is in `CAP_MULT_EXEMPT` and must stay there.

**And the source backs the instinct precisely.** Kittens has exactly one whole-cap science
multiplier in the entire game, and it is **not an upgrade** — it is the `technocracy` **policy**
(`js/science.js:1067–1080`, `technocracyScienceCap: 0.2`, price **culture 150,000**, mutually
exclusive with `theocracy` and `expansionism`), consumed at `js/resources.js:954–956`:

```js
if (res.name == "science"){
    maxValue *= (1 + this.game.getEffect("technocracyScienceCap"));
}
```

**One ×1.20, once, for 150,000 culture and the permanent loss of two other policy branches.**
Every *upgrade*-shaped science boost in Kittens — Astrolabe, the three Reflectors, Uplink, the
AI Core line — is per-building. **So directive 8 is not a departure from the source; it is the
source's own division of labour**, and the standing rule follows from it: **a whole-cap knowledge
multiplier in RR belongs on a policy, priced like one and exclusive like one — never on a
Discovery chain.** If a future round wants one, ×1.20 is the source's magnitude.

**First, what RR already ships — do not re-invent it.** Kittens' **Astrolabe**
(`js/workshop.js:1436–1448`) carries `effects: {}`; its entire effect lives in the Observatory's
own `calculateEffects` (`js/buildings.js:672`):

```js
self.effects["scienceMax"] = ratio * (game.workshop.get("astrolabe").researched ? 1500 : 1000);
```

**1,000 → 1,500 is +50% on that one building's own contribution.** RR shipped this in
`voidglassLenses` — *"Celestial Observatories hold +50% more knowledge each"*
(`index.html:2472`), implemented at `capMultPerCopy()` (`index.html:4112`) as
`observatory × 1.5`. **That is Kittens' Astrolabe at exact parity, already in the game. Ledger it
as PARITY and leave it alone.**

**What is missing is the Reflectors family**, and it is a different and better shape — a
*cross-building* amplifier. Three upgrades, each `libraryRatio: 0.02`, all
`upgrades: { buildings: ["library"] }`:

| upgrade | `js/workshop.js` | effect | price |
|---|---|---|---|
| `titaniumMirrors` | :1450 | `libraryRatio 0.02` | titanium 15, science 20,000, starchart 20 |
| `unobtainiumReflectors` | :1467 | `libraryRatio 0.02` | unobtainium 75, science 250,000, starchart 750 |
| `eludiumReflectors` | :1483 | `libraryRatio 0.02` | science 250,000, eludium 15 |

consumed additively in the **Library's** `calculateEffects` (`js/buildings.js:579–580`):

```js
var libraryRatio = game.getEffect("libraryRatio");
effects["scienceMax"] *= (1 + game.bld.get("observatory").on * libraryRatio);
```

**Read that carefully: the amplifier is multiplied by how many Observatories you own.** Three
upgrades sum to 0.06 and the Library's 250 is scaled by `1 + observatories × 0.06`. It is
additive within the family, multiplicative between categories — Kittens' Law — and it makes two
buildings worth more together than apart. **RR has no analogue of this and it is the piece worth
porting.**

**The mapping.** RR's four knowledge buildings are already a faithful port —
`archive` 250 / boost 0.10, `academy` 500 / 0.20, `observatory` 1000 / 0.25, `hexLab` 1500 / 0.35
against Kittens' library 250/0.1, academy 500/0.2, observatory 1000/0.25, biolab 1500/0.35. So
assign by role, which is the standing rule:

| RR upgrade | tech | new effect | Kittens shape |
|---|---|---|---|
| `cataloguing` | ritesOfTargon | `archiveRatio += 0.02` | Reflectors |
| `crossReferencing` | ritesOfTargon | `archiveRatio += 0.02` | Reflectors |
| `greatIndex` | callToArms | `archiveRatio += 0.02` | Reflectors |
| `annotatedIndex` | chemtech | **Academies hold +50% knowledge each** | Astrolabe |
| `livingLibrary` | deepWorks | **Hexcore Laboratories hold +50% knowledge each** | Astrolabe |

with `archiveRatio` consumed exactly as the source consumes `libraryRatio` — inside the Archive's
own cap slice, scaled by Observatory count:

```
archive knowledge slice *= (1 + count("observatory") * archiveRatioTotal)
```

**Σ 0.06 is Kittens' figure taken, not tuned.** The two Astrolabe-shaped upgrades reuse
`capMultPerCopy()`, which already does exactly this for `observatory`; extend it rather than
adding a second mechanism. **`SCHOLAR_LINE`'s 0.25/0.30/0.30/0.35/0.40 is deleted with the
family** — the new effects are not a shared additive line and must not be modelled as one.

**Predicted, stated before the run**, at a plausible late state (20 archives, 15 academies,
10 observatories, 5 hexLabs, all five upgrades, `voidglassLenses`):

| slice | base | after |
|---|---|---|
| archive | 5,000 | **8,000** (`1 + 10 × 0.06`) |
| academy | 7,500 | **11,250** |
| observatory | 15,000 (already ×1.5) | 15,000 |
| hexLab | 7,500 | **11,250** |
| **building total** | **35,000** | **45,500 — ×1.30** |

**And a compounding the builder must measure rather than assume.** `caps.knowledge` takes
`min(150 × morellonomicons, buildingKnowledgeCap)` at `index.html:4726` — the Morellonomicon
ceiling is *the building total*, so raising the building slices raises the compendium ceiling
too. **A ×1.30 on buildings is up to ×1.30 on the whole knowledge cap, not less.** Report the
fully-stacked figure, not the building subtotal.

### Part 5 pass conditions

| | |
|---|---|
| `SCHOLAR_CAPS`, `scholarMult`, `scholarCapNames` | **deleted**; `capFamilyOf()` returns only `exempt`/`masonry`/null |
| Renown ceiling | `210 + 900 × Halls`, asserted at 0, 1 and 20 Halls |
| Poppy | now reaches renown; `capMultNames()` count asserted, not the sentence |
| `voidglassLenses` | **unchanged**, ledgered PARITY against `js/buildings.js:672` |
| Culture ×1.05 | ledger row moved UNVERIFIED → PARITY, both citations recorded |
| No whole-cap knowledge multiplier | anywhere — the technocracy shape is a **policy**, and none ships this round |
| `archiveRatio` | Σ **0.06** at 5-of-5, scaled by Observatory count, asserted at 0 and 10 observatories |
| Knowledge | still in `CAP_MULT_EXEMPT`; **no global multiplier anywhere** |
| Fully-stacked knowledge cap | reported **with** the Morellonomicon compounding |
| Ledger | one row per repurposed upgrade, each citing its Kittens shape |

---

## Part 6 — The rank ladder is a 102% parity debt (builder note 4)

Confirmed by probe: `RANKS` tops at **Challenger 18,200 xp → +0.1875**, against Kittens'
`getValueModifierPerSkill()` granting **+0.1875 at 9,000**. RR asks **2.02× the experience for
the same bonus** — the largest single parity divergence in the game, re-rated HARDER this round
and up from 27.8%.

**This Part is a report and a ruling, not a change.** It is deliberate and Jerry-directed, and
the charter's requirement is that it be *seen* rather than inherited.

- **Put the full ladder in the ledger, rung by rung**, against Kittens' seven tiers
  (0 / 100 / 500 / 1,200 / 2,500 / 5,000 / 9,000 → 0 / 0.0125 / 0.025 / 0.045 / 0.075 / 0.125 /
  0.1875), with the debt computed at each rung rather than only at the top.
- **State the interaction with `XP_PER_SECOND`, which is still UNVERIFIED.** The debt is a
  *threshold* ratio; the accrual rate is the other half and its source figure has never been
  found. **The two must not be conflated** — a 102% threshold debt at an unverified rate is one
  unknown multiplied by another, and the ledger should say that in one line.
- **If Jerry wants it reduced**, the source-shaped move is to match the thresholds and leave the
  rate alone, because the thresholds have a line number and the rate does not.

---

## Part 7 — `test-v581`'s assertion 36 is a §21 defect (my finding)

Per the header. The block does:

```js
const k0 = S.res.knowledge, v0 = S.res.vigor;
clickScuttler();
o.scuttlerV = S.res.vigor - v0;
```

`clickScuttler()` is correct — `Math.max(15, round(cap.vigor × 0.06))` gives exactly 186 against
a 3,100 ceiling. But the assertion measures a **delta on a resource it never reset**, so if an
earlier block left vigor above the ceiling the `gain()` clamps and the delta is negative by
however much was over.

- **Reset `S.res.vigor` and `S.res.knowledge` before baselining them**, per §21 — *and* per the
  handoff's own corollary, do not reset what is being measured *after* the baseline is taken.
- **Sweep for the same shape.** `tools/fixture-sweep.mjs` exists for exactly this; **run it and
  report what it finds.** Any assertion measuring `S.res[x]` before-and-after a call is exposed.
- **Correct the record:** the round reported 28 suites / 1,436 / 0 failures. Under a full sweep
  it is **1,435 / 1**. The idle-box re-run passes, which is precisely why §21 exists.

**Pass conditions:** `test-v581` passes ten consecutive full-suite sweeps, at least three under
load; `fixture-sweep` reports zero new §21 candidates or lists them.

---

## Part 8 — The eight feel-and-UI notes (dev notes 1–8)

These are Jerry's design calls and are not parity items; the spec's job is to keep them
attributable and to flag the two with a source anchor.

1. **Wanderer job buttons are too bulky and the text does not fit** (note 1). Layout only. Assert
   nothing renders outside its container at the mobile breakpoint `test-banner-v51` already uses.
2. **Crafting needs an undo button** (note 2). `snapshotUndo()` / `rerollPenalty` already exist
   and are module-scope deliberately; **wire crafting into the same window and the same
   re-roll guard**, so the Part 8 exploit fix of v0.55 covers it from the start rather than
   afterwards. Note that **trades still never call `snapshotUndo()`** — that was recorded in
   v0.55 and is still open; do the two together or say why not.
3. **A button for Zilean to spend banked time, not an automatic trigger at 5m** (note 3). A
   player-agency change; assert the automatic path is gone rather than merely bypassed.
4. **Bulk hunting on charge camps but not cooldown camps** (note 4). `isChargeCamp(e)` already
   distinguishes them — the predicate exists, so this is a gate, not new machinery.
5. **Swain's lead duplicates his passive; his passive becomes a mana-production percentage**
   (note 5). This is the Twitch defect of v0.54 in a new costume — a leader slot that does what
   the passive already does. **Assert the two are distinct**, as v0.54's fix did.
6. **One more mana-production Discovery** (note 6). **This one has a source anchor and should
   use it:** mana is `narrow`-tier and RR's mana line maps to Kittens' catnip refine chain; price
   and rung it against the ladder lookup rather than by feel, and record the verdict in the
   ledger.
7. **Festival shows on the buff banner** like the Baron and Crest of Cinders (note 7). The banner
   already takes timed buffs; this is a registration, not a new mechanism.
8. **Festival costs fewer mushrooms; raptor plumes at half the mushroom cost** (note 8). State
   the before/after and the ratio, and label it in the ledger — festivals are RR-original.

**Every one of these gets a ledger row or an updated one.** `OFF-CYCLE-PROTOCOL.md` §5's lesson
from v0.58.1 is that feel-justified changes drift from source unless the verdict is recorded in
the same round.

---

## Part 9 — Order, discipline, pass conditions

### Order — six prefixes, snapshotted forward before the next Part starts

1. **Part 1** — the Granary migration. It is a live data-loss bug on the shipped build; nothing
   else in this round matters to a player until it is fixed. Ship it, tag it, and consider a
   point release before the rest of the round lands.
2. **Part 7** — the fixture defect, so the suite is trustworthy for everything after it.
3. **Part 5.3** — delete the Scholarship cap family. **Before Part 2.5**, because the champion
   ladder is sized against renown's post-deletion ceiling and measuring it first wastes the run.
4. **Part 2** — the renown economy, all of 2.1–2.5 in one slice. **These do not decompose:** 2.2
   cuts renown income 14–100× and 2.1/2.3 add it back, so a prefix containing only one of them
   measures a game that will never ship.
5. **Part 5.4** — the knowledge amplifiers.
6. **Parts 3 and 4** — the Era-3 ruling and the Convergence measurement point. Both are rulings
   plus a condition restatement; neither should move a game number.
7. **Parts 5.1, 5.2 and 6** — the citations, the retraction, the rank-ladder ledger rows.
8. **Part 8** — the eight feel notes, with their ledger rows.

### Operational

Median and spread for every milestone claim (§25). `--years N --seeds 3`, never a bare
positional. Classify with §24 before sizing any ceiling. Kill by PID. Strip comments before
grepping. Never `playwright install`. **The ensemble on this build ran past 62 minutes without
finishing in my session — budget 75–90 minutes and start it before writing any code.** Pushing
works via the handoff's token-remote recipe.

### Round pass conditions

| # | Condition | Target |
|---|---|---|
| 1 | Granary survives save → load | **7 in, 7 out**; asserted |
| 2 | Every id in the migration block | has a round-trip assertion |
| 3 | Reused-id guard | `test-v59` fails if a live `BUILDINGS` id is a migration *source* |
| 4 | Charge guard deleted | every expedition pays renown with **0 charges**; ×3 when empowered |
| 5 | First / tenth champion, Renown at cap | reported on three seeds, **with the Hall count for the tenth** |
| 6 | Era 3 vs the band | **ruled in `pacing.mjs` with a reason**; not re-based silently |
| 7 | Convergence condition | restated against the **unlock**, source anchor cited |
| 8 | Golden Spire citation | in the ledger for §29's ×1.5 slice |
| 9 | Culture's ×1.05 | **VERIFIED** — ledgered PARITY vs `js/science.js:1290` + `js/resources.js:960`; totals recomputed (**57→58 PARITY, 126→125 UNVERIFIED**) |
| 10 | Renown's ×2.60 | **deleted with the whole cap family** (5.3); `capFamilyOf()` down to two families |
| 10a | Trickle | flat **0.007/s**, gated on `callToArms`; no-backfill assertion passes |
| 10b | Trade | +1/caravan all leaders; **bulk ×10 grants 10**; failures grant 0 |
| 10c | `RENOWN_DEED_RATE` | ruled by name; the camp ladder no longer pays a flat 1 |
| 10d | Ascent, first-time research | **unchanged**, measured at 0, two ledger rows |
| 10e | `voidglassLenses` | untouched, ledgered **PARITY** vs `js/buildings.js:672` |
| 10f | `archiveRatio` | Σ **0.06**, scaled by Observatory count; knowledge still `CAP_MULT_EXEMPT` |
| 11 | Rank ladder | in the ledger rung by rung with the debt at each |
| 12 | `test-v581` | passes ten consecutive sweeps, three under load; `fixture-sweep` reported |
| 13 | Swain's lead and passive | asserted **distinct** |
| 14 | The mana Discovery | rung-matched via the ladder lookup, ledger row recorded |
| 15 | All eight feel notes | each has a ledger row |
| 16 | Unchanged | ×20.8000 · 7 keys · limit 6 · `capFamilyOf` total · audits 0/0 · Σ 4.35/1.80 · `CONSUMPTION` 4.25 |
| 17 | Every Part | actioned, or its non-action explicitly justified |

### Predicted vs measured — medians of three, with spreads

| slice | Era 3 median | spread | note |
|---|---|---|---|
| v0.58.1 baseline | **907.1** | ×1.02 | the report's figure; my ensemble did not finish inside the session |
| s1: Granary migration | **≈ 0** | unchanged | the simulator never exercised the path — **a null slice by construction, and stated as a testable claim** |
| s2: fixture fix | **0.0** | unchanged | no game code |
| s3: Part 5.3, cap family deleted | **+40 to +150** | unchanged | renown's ceiling falls ×2.60; champions arrive **later**, and champion passives are production multipliers |
| s4: Part 2, the renown economy | **−80 to +40** | may widen | **the round's one genuinely uncertain slice** — 2.2 cuts income 14–100×, 2.1 and 2.3 add it back, and which dominates depends on how much the bot hunts |
| s5: Part 5.4, knowledge amplifiers | **−60 to −10** | unchanged | ×1.30 on the knowledge ceiling brings late techs forward |
| s6: + rulings and conditions | **0.0** | unchanged | no game numbers move |
| s7: + the eight feel notes | **−50 to +100** | | note 6's mana Discovery is the only production change |
| **shipped** | **800–1,150** | **under ×1.15** | **still below the band; Part 3's ruling decides whether that matters** |

**Renown-specific predictions, stated before the run** (three seeds, median and spread on each):

| figure | v0.58.1 | predicted after Part 2 |
|---|---|---|
| first champion | y140.9 | **y150–260** — the trickle cut dominates early, when pop is small and hunts are few |
| tenth champion | never inside 2,500 | **still never** — report it, and report the Hall count reached |
| renown time-at-cap | 83.1% at 3-of-5 Scholarship | **under 40%** — the ×2.60 is gone and income is deed-paced |
| Halls at y2,500 | — | **report it**; 17 is the tenth champion's requirement |

**The s4 row is the one to distrust.** I am predicting a band that straddles zero because the two
halves of Part 2 pull opposite ways and the bot's hunting cadence is not something I can derive
from the source. **If s4 lands outside −80…+40, that is information about the bot's play pattern,
not a failure of the spec** — report what the bot actually did with charges before concluding
anything about balance (§16: the bot is an instrument, not an authority).

**The s1 prediction is the one to check.** I am claiming the Granary fix cannot move pacing
because `freshState()` has no Granaries and the migration never fires in the simulator. **If s1
moves Era 3 at all, the migration is firing somewhere I have not found**, and that is a bigger
finding than the fix.

**And the informative failures to watch for.** If first champion lands **earlier than y100** on
any seed, Part 2 has over-corrected a renown economy that v0.58.1 already tightened in three
places. If it lands **later than y400**, the trickle cut has over-shot and `RENOWN_DEED_RATE`
is the lever to relieve it — not the trickle, which is Jerry's stated figure. **Report the net
across Parts 2 and 5.3 together; neither is interpretable alone.**

---

## Sources, all read this session

**Line numbers below are pinned to `nuclear-unicorn/kittensgame` at `c52985b` (2026-08-04).**
They drift between revisions — the Golden Spire block that earlier rounds cited as
`js/buildings.js:1929–1931` from a grep.app index is `:1964–1966` at this revision, same code.
**Future rounds should clone and cite a revision, not quote a bare line number.**

**Kittens** (`github.com/nuclear-unicorn/kittensgame`): **`js/buildings.js:1964–1966`** — the
Temple's `calculateEffects` multiplying `effects["faithMax"] *= (1 + (0.4 + 0.1 *
goldenSpire.on))`, **×1.5 at one level and scoped to the Temple's slice**, which is §29's
missing citation; a repo-wide search for **`faithMaxRatio` returns no hits**, confirming there is
no whole-cap faith multiplier in the source. `js/buildings.js` — `ziggurat`
`cultureMaxRatio: 0.08` per copy at priceRatio 1.25; `js/religion.js:919` —
`cultureMaxRatioBonues: 0.01`. **`js/science.js:1283–1297` — `cityOnAHill`,
`onAHillCultureCap: 0.05`, price culture 4,000** — and `js/resources.js:958–961` consuming it as
a whole-cap culture multiplier: **culture's ×1.05 is VERIFIED and the four-round lookup is
closed.** `js/science.js:1067–1080` and `js/resources.js:954–956` — `technocracy`'s
`technocracyScienceCap: 0.2`, the source's only whole-cap science multiplier and a policy, not
an upgrade.
`js/village.js` — `getValueModifierPerSkill()`'s seven tiers topping at **0.1875 at 9,000**, the
denominator of Part 6's 102% debt.

**Kittens, read from a local clone this session** (`js/workshop.js:1436–1448` **`astrolabe`** —
`effects: {}`, prices titanium 5 / science 25,000 / starchart 75, `upgrades: {buildings:
["observatory"]}`; `js/buildings.js:669–672` — the Observatory's `calculateEffects` where
Astrolabe's whole effect lives, `scienceMax = ratio * (astrolabe ? 1500 : 1000)`;
`js/workshop.js:1450/1467/1483` — **`titaniumMirrors`, `unobtainiumReflectors`,
`eludiumReflectors`**, each `libraryRatio: 0.02`; `js/buildings.js:571–580` — the Library's
`scienceRatio 0.1` / `scienceMax 250` / `cultureMax 10` and the consumption
`effects["scienceMax"] *= (1 + observatory.on * libraryRatio)`; `js/buildings.js:627–629` — the
Academy's `scienceRatio 0.2` / `scienceMax 500`; `js/buildings.js:687–689` — the BioLab's
`scienceRatio 0.35`; `js/buildings.js:1953–1955` — `scholasticism` as a third amplifier shape,
`scienceMax = 400 + 100 * on`, noted but not ported; `js/space.js:252/264` — `observatoryRatio`
from satellites, the shape RR's `voidglassLenses` already occupies). **`titaniumReflectors` does
not exist under that name** — the identifier is `titaniumMirrors`, and the three "Reflectors" are
a Library family, not an Observatory one.

**RR**, at the v0.58.1 tag: **`index.html:6501–6505`** — the legacy `granary`/`runestone`
migration, reproduced end to end; `index.html:546–550` — the v0.56 Granary on the reused id;
`gainRenown()` and its two call sites, `RENOWN_DEED_RATE 0.34`, and the twelve expedition
`renown` values (2 → 40); `clickScuttler()` and `SCUTTLER_VIGOR_PCT 0.06`;
`tests/test-v581.mjs:446–465` — the unreset `v0 = S.res.vigor` baseline; `RANKS` topping at
**18,200 / 0.1875**; `XP_PER_SECOND 0.5`, `XP_CAP 25,556`; `STANDING-RULINGS.md` §§19–29.

**RR sites read for directives 1–8:** `index.html:5129` — the pop-scaled renown trickle inside
`computeRates()`, gated on `logistics`; `:6356` — the `if (!isChargeCamp(e) || empowered)` guard;
`:6251` — `CHARGE_BONUS 3.0`; `:1670–1671` — `RENOWN_DEED_RATE 0.34` and `gainRenown()`'s
`callToArms` gate; `:1846` — `ascendTargon()`, granting no renown; `:1595` — `RECRUIT_BASE 400`,
`RECRUIT_RATIO 1.5`; `:1007–1056` — the Hall of Heroes, `caps: { renown: 900 }` flat after note
31.1 deleted its percentage; `:2054` — `SCHOLAR_CAPS = { renown: 1 }`; `:1899` — `SCHOLAR_LINE`;
`:4106/4112` — `capsSliceMult()` and `capMultPerCopy()`, the two per-building hooks the amplifiers
extend; `:2472` — `voidglassLenses`; `:631/637/654/660` — the four knowledge buildings;
`:4726` — the Morellonomicon's `min(150 × n, buildingKnowledgeCap)` doubling clamp.

**Measurements taken this session:** all 28 suites (**1,435 passed, 1 failed** — `test-v581`
under a full sweep, passing 2/2 idle); an independent row-and-verdict count of the parity ledger
(**226 / 57 / 41 / 2 / 126**, exact); a live-game probe reproducing the Granary bug (7 → 0,
storehouses 3 → 10), enumerating renown producers (**and finding the trickle I had previously missed**), a
one-action-per-run probe measuring the renown delta of Ascent, first-time tech, first-time
Discovery, a caravan and a Wolves hunt with and without a charge (**0 / 0 / 0 / 0 / +1 / 0**), a
probe reading `SCHOLAR_CAPS`, `capFamilyOf()` and the three multipliers on a fully-stacked state,
and reading the rank ladder, the
fully-stacked cap multipliers (**culture ×1.05, devotion ×1.00, renown ×2.60**), `XP_PER_SECOND`,
`XP_CAP` and both audit graphs. **The three-seed ensemble was launched but had not finished after
62 minutes and is not quoted here** — Part 9's baseline row carries the report's figure and says
so.
