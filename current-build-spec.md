# BUILDER SPEC v0.59 — the Granary is being deleted on every load, and it is a reused id

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

## Part 2 — Renown is earned only by spending a Wilds charge (dev note 10, builder note 5)

Enumerated: `gainRenown()` has exactly two callers — expedition resolution
(`Math.max(1, round(e.renown × RENOWN_DEED_RATE × policyMult("renown")))`, with `e.renown`
running 2 for Wolves to 40 for the Baron) and Caitlyn's `CAITLYN_TRADE_RENOWN` per caravan.
**No building, job or tech produces renown at all.**

**Jerry calls this a bug, so it is a directive.** The design reading that makes it coherent is
the one the constant already names: `RENOWN_DEED_RATE` says renown is paid for **deeds**, and
the game has deeds that are not expeditions.

- **Add renown to deeds the player already performs and is not paid for.** The candidates, in
  order of how clearly they are "a deed the settlement would sing about": completing a **trade
  route** (not only under Caitlyn), an **Ascent**, a **first-time tech or Discovery**, and a
  **drake kill** that is not itself an expedition. **Pick and state the set**; do not add a
  passive per-second trickle, which is a production line rather than a deed and would make
  Renown a fifth resource economy.
- **Builder note 5 is the sizing lever and it is the right one.** First champion reads y140.9 on
  one seed against a y120 condition; `RENOWN_DEED_RATE 0.34` is the multiplier on every deed
  and it moves all of them together, where the recruit base `250 × 1.5ⁿ` moves the ladder's
  *shape*. **Size with the rate, not the base**, and report first-champion on all three seeds.
- **This interacts with three v0.58.1 notes pushing the same way** — note 31 raised the ladder,
  31.1 removed the Hall's percentage, 30 removed the Training Ground's ceiling. **Report the
  net**, and if first champion moves earlier than y100 on any seed, say so: the round removed
  three renown sources and this Part adds several back.

**Pass conditions:** at least one non-expedition renown source ships and is asserted;
`RENOWN_DEED_RATE` is the stated lever with its before/after value; first champion, tenth
champion and Renown time-at-cap reported on all three seeds.

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

## Part 5 — §29's magnitudes get their line numbers, and the cap family has stopped being one

### 5.1 The citations builder note 3 asks for — one found, one still missing

§29 records culture's fixed multiplier at **×1.05** and devotion's whole-cap at **×1.00 with a
×1.5 slice**, both as Jerry's figures with no Kittens line number. I went looking.

**Devotion's ×1.5-on-a-slice is now sourced, and Jerry's scope claim is exactly right.**
`js/buildings.js:1929–1931`, inside the **Temple's** `calculateEffects`:

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

**Culture's ×1.05 is still UNVERIFIED and should be labelled so.** The only `cultureMaxRatio`
terms in the source are the **Ziggurat's 0.08 per copy** (`js/buildings.js`, priceRatio 1.25 —
a per-copy ratio, not a fixed multiplier) and a **`cultureMaxRatioBonues: 0.01`** in
`js/religion.js:919`. The ×1.05 is presumably the City On A Hill policy, but `cityOnAHill`'s
effects object could not be retrieved — three queries returned only its references in
`js/science.js:229/1199/1275`. **Label it UNVERIFIED with the retrieval routes recorded**, the
way `XP_PER_SECOND` already is. Do not invent a citation.

### 5.2 The finding that came with it: `SCHOLAR_CAPS` no longer has one behaviour

Measured on a fully-stacked state: **culture ×1.05, devotion ×1.00, renown ×2.60.** All three are
in the same cap family, and §22's whole point was that a capped resource belongs to exactly one
family *with one behaviour*. After §29 the family has three members and three treatments, and
`renown` — the one §29 does not name — kept the multiplier the other two lost.

- **Rule on renown's ×2.60 explicitly.** Either it belongs with its family-mates at the source's
  magnitudes, or it is a deliberate exception and §29 should say so by name. **What is not
  acceptable is inheriting it because §29 happened not to mention it.**
- **Note the interaction with Part 2:** three v0.58.1 notes already cut renown's ceiling and its
  sources. Removing the ×2.60 as well would be a fourth cut in the same direction. **Measure
  before deciding** (§24/§26 — renown's cap-out fraction is the wrong shape of target).

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
3. **Part 2** — renown from deeds.
4. **Parts 3 and 4** — the Era-3 ruling and the Convergence measurement point. Both are rulings
   plus a condition restatement; neither should move a game number.
5. **Parts 5 and 6** — the citations, the renown ×2.60 ruling, the rank-ladder ledger rows.
6. **Part 8** — the eight feel notes, with their ledger rows.

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
| 4 | Non-expedition renown source | ships, asserted; the deed set stated |
| 5 | First / tenth champion, Renown at cap | reported on three seeds |
| 6 | Era 3 vs the band | **ruled in `pacing.mjs` with a reason**; not re-based silently |
| 7 | Convergence condition | restated against the **unlock**, source anchor cited |
| 8 | Golden Spire citation | in the ledger for §29's ×1.5 slice |
| 9 | Culture's ×1.05 | labelled **UNVERIFIED** with retrieval routes recorded |
| 10 | Renown's ×2.60 | **ruled by name** — kept as an exception or brought to family |
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
| s3: + renown from deeds | **−30 to +60** | unchanged | champions arrive earlier; champion passives are production multipliers |
| s4: + rulings and conditions | **0.0** | unchanged | no game numbers move |
| s5: + the eight feel notes | **−50 to +100** | | note 6's mana Discovery is the only production change |
| **shipped** | **850–1,050** | **under ×1.10** | **still below the band; Part 3's ruling decides whether that matters** |

**The s1 prediction is the one to check.** I am claiming the Granary fix cannot move pacing
because `freshState()` has no Granaries and the migration never fires in the simulator. **If s1
moves Era 3 at all, the migration is firing somewhere I have not found**, and that is a bigger
finding than the fix.

**And one informative failure to watch for.** If first champion lands **earlier than y100** on
any seed after Part 2, the round has over-corrected a renown economy that v0.58.1 deliberately
tightened in three places — report the net across all four changes rather than Part 2 alone.

---

## Sources, all read this session

**Kittens** (`github.com/nuclear-unicorn/kittensgame`): **`js/buildings.js:1929–1931`** — the
Temple's `calculateEffects` multiplying `effects["faithMax"] *= (1 + (0.4 + 0.1 *
goldenSpire.on))`, **×1.5 at one level and scoped to the Temple's slice**, which is §29's
missing citation; a repo-wide search for **`faithMaxRatio` returns no hits**, confirming there is
no whole-cap faith multiplier in the source. `js/buildings.js` — `ziggurat`
`cultureMaxRatio: 0.08` per copy at priceRatio 1.25; `js/religion.js:919` —
`cultureMaxRatioBonues: 0.01`. **`cityOnAHill`'s effects object could not be retrieved** —
`js/science.js:229`, `:1199`, `:1275` are references only — so culture's ×1.05 stays UNVERIFIED.
`js/village.js` — `getValueModifierPerSkill()`'s seven tiers topping at **0.1875 at 9,000**, the
denominator of Part 6's 102% debt.

**RR**, at the v0.58.1 tag: **`index.html:6501–6505`** — the legacy `granary`/`runestone`
migration, reproduced end to end; `index.html:546–550` — the v0.56 Granary on the reused id;
`gainRenown()` and its two call sites, `RENOWN_DEED_RATE 0.34`, and the twelve expedition
`renown` values (2 → 40); `clickScuttler()` and `SCUTTLER_VIGOR_PCT 0.06`;
`tests/test-v581.mjs:446–465` — the unreset `v0 = S.res.vigor` baseline; `RANKS` topping at
**18,200 / 0.1875**; `XP_PER_SECOND 0.5`, `XP_CAP 25,556`; `STANDING-RULINGS.md` §§19–29.

**Measurements taken this session:** all 28 suites (**1,435 passed, 1 failed** — `test-v581`
under a full sweep, passing 2/2 idle); an independent row-and-verdict count of the parity ledger
(**226 / 57 / 41 / 2 / 126**, exact); a live-game probe reproducing the Granary bug (7 → 0,
storehouses 3 → 10), enumerating renown producers (**none**), and reading the rank ladder, the
fully-stacked cap multipliers (**culture ×1.05, devotion ×1.00, renown ×2.60**), `XP_PER_SECOND`,
`XP_CAP` and both audit graphs. **The three-seed ensemble was launched but had not finished after
62 minutes and is not quoted here** — Part 9's baseline row carries the report's figure and says
so.
