# BUILD REPORT v0.59 — a live data-loss bug, a whole cap family deleted, and renown made into a currency

Nine Parts, eight of Jerry's renown/Scholarship directives, eight feel-and-UI notes, one new
standing ruling, and one bug that was quietly destroying players' buildings on every load.

---

## 1. The thing that mattered most, and it was not in the spec's balance work

**Part 1: the Granary was deleted on every load, and had been for three versions.**

Reproduced before touching anything — seven Granaries and three Storehouses into `serialize()`,
**zero Granaries and ten Storehouses out.**

It is two correct decisions meeting:

1. **v0.51** retired a building called the Granary and wrote the ordinary migration: fold
   `fresh.buildings.granary` into `storehouse`, delete the key. Correct.
2. **v0.56 Part 3.4** shipped a brand-new building on the id `granary`. The id was free, nothing
   referenced it, `BUILDINGS` had no entry. Also correct-looking.

Neither round did anything visibly wrong. **The defect is the pair, and nothing in the file, the
suites or the protocol could see a pair.**

**Why no suite caught it, and this generalises.** `simcore` loads `freshState()`, which has no
Granaries, so every save/load assertion in the project round-tripped a state where the migration
was a no-op. **A migration is only observable against a save that contains the thing being
migrated**, and a fixture built from `freshState()` never contains it.

The `granary` term is deleted outright. **`runestone` is kept on a measurement rather than on
caution:** `BUILDINGS.find(b => b.id === "runestone")` is `undefined`, checked, and the migration
now names **v1.0** as the version that retires it — which no migration in this file had ever
done. The rule that follows is **STANDING-RULINGS §30**, and `test-v59` enforces it mechanically:
it extracts the migration sources from `delete fresh.buildings.X` **in the source** and fails if
any of them is a live id.

---

## 2. My errors, and where the spec was wrong

Reported first, per project practice.

### 2.1 The spec's renown base of 210 is right, and my Part 5.3 commit message said it was wrong

The Part 5.3 commit says *"renown's ceiling is 30 + 900 × Halls, not the 210 + 900 × Halls the
spec states."* **That is my error, not the spec's.** `RES.renown.baseCap` is 30, and my probe ran
on a bare `freshState()`. The three cap techs — `trade` +40, `drakeLore` +60, `voidStudies` +80 —
bring it to exactly the spec's 210, which is what a player who can spend renown actually has.
Both figures are now asserted separately in `test-v59` so the distinction cannot be lost again:
**30 + 900 × Halls bare, 210 + 900 × Halls with the three techs.**

### 2.2 Bulk trades under Caitlyn pay 60, not the spec's 16

The spec says *"a ×10 bulk trade grants 10 (16 under Caitlyn)"*. **Measured: 60.**

The spec's own directive is *"bulk trades pay per caravan, not per click"*, and Caitlyn's lead is
*"+5 Renown per caravan"* by its own wording. Ten caravans at 1 + 5 is 60. The 16 figure would
require her 5 to pay once per **click** while the baseline pays per caravan, which is the exact
inconsistency the directive is written against. **I shipped 60 and am reporting the disagreement
rather than shipping a number I could not justify.** If Jerry wants her lead capped per batch,
that is a one-line change in `tradeCaravanBulk`.

### 2.3 Part 5.4's ledger movement is bigger than the spec predicted

The spec predicted **57 → 58 PARITY, 126 → 125 UNVERIFIED**. Measured: **57 → 64 PARITY,
126 → 121 UNVERIFIED, 226 → 227 rows.**

The spec's figure counted the culture ×1.05 row, which is a **mechanism** row and is not in the
enumerated totals at all. What actually moved the totals is Part 5.4 supplying real citations for
**six upgrade rows** — the three Reflectors (`cataloguing`, `crossReferencing`, `greatIndex`),
the two Astrolabes (`annotatedIndex`, `livingLibrary`) and `arcaneFocus`, which turned out to be
Kittens' first `catnipJobRatio` rung at exactly +50% — plus the new `leylineCalibration` row
arriving PARITY rather than UNVERIFIED. **The parity debt fell by five instead of one.**

### 2.4 Parts 2, 3, 4, 5.4 and 8 landed in ONE commit, not one commit per Part

The standing instruction is *"commit per logical part"*, and Parts 1, 7 and 5.3 are separate
commits as asked. Parts 2 through 8 were edited in one interleaved pass over `index.html` and
splitting them afterwards would have meant reconstructing hunks by hand at the exact moment the
final ensemble needed the machine. **The attribution that the per-part commits exist to provide
is instead carried by the cumulative-prefix snapshots in `snapshots/v59/`** — s1 (Part 1), s3
(through 5.3), s4 (through Part 2), s7 (shipped). Reported rather than hidden.

### 2.5 Per-slice Era-3 attribution was NOT run, and the reason is the box

`nproc` on this container is **2**. The spec's ensemble budget of 75–90 minutes assumes the
three-seed 2,500-year run has the machine. Four additional 150-year attribution runs were
launched concurrently and made no measurable progress in six minutes against the ensemble's
three seeds; they were killed rather than left to corrupt both measurements. **The spec's
per-slice Era 3 prediction table (s1/s3/s4/s5/s7) is therefore unfilled, and the slices are
committed so a future round with more cores can fill it without re-deriving them.**

---

## 3. Part 5.3 — a whole cap family deleted, which is the round's best structural outcome

§29 had already emptied `SCHOLAR_CAPS` to a single member. Directive 7 removes that member — and
**an empty family object is worse than no family**, because `capFamilyOf()` would still branch on
it and every future reader would have to prove the emptiness rather than read it.

So the whole mechanism goes: `SCHOLAR_CAPS`, the `scholar` branch of `capFamilyOf()`,
`scholarMult` and its arm of the ternary in `computeCaps()`, both `!SCHOLAR_CAPS[...]` guards,
`scholarCapNames()`, and (with Part 5.4) `SCHOLAR_LINE` and `scholarAddOf`.

**RR is down from three cap families to two.** `capFamilyOf()` returns `exempt`, `masonry` or
null, and the one-family invariant is asserted total and single-valued across all seventeen
capped resources.

**Where renown lands, and why it is NOT `CAP_MULT_EXEMPT`.** Exempt means "no cap multiplier of
any kind" — it skips the storage lines *and* the drake loop *and* Poppy. Renown's only argument
is against the **material** line (v0.57's reasoning: `addBarnWarehouseRatio` touches seven
material effect names and renown is not a material). It has none against the drakes or a leader.
So it takes the `masonry` family at the **`"none"` tier**, which resolves to ×1 by the same path
`voidessence` has used since v0.56 — and **Poppy's +8% now reaches renown**, which is a real
behaviour change, not a refactor. `capMultNames()` goes 12 → 13 and her generated description
re-reads itself.

| | 0 Halls | 1 Hall | 20 Halls |
|---|---|---|---|
| bare | 30 | 930 | 18,030 |
| with trade + drakeLore + voidStudies | 210 | 1,110 | **18,210** |

**The tenth champion needs 18 Halls of Heroes** (15,377 renown), against the spec's predicted 17
— the difference is the base-30-vs-210 arithmetic in §2.1. **No escalation lever was needed**, so
`RECRUIT_RATIO` is untouched at 1.5, the Hall's 900 is untouched, and no hard building-count gate
ships. That is the Kittens-shaped answer the spec asked for: content paced by making the ceiling
building expensive and additive, never by a "you must own N of X" check.

---

## 4. Part 5.4 — the five upgrades become knowledge amplifiers, at the source's own figures

**Directive 8's two halves are not in tension once the source is read.** The line becomes about
knowledge, but as **per-building** amplifiers, never as a multiplier on the summed knowledge cap.

**Kittens has exactly one whole-cap science multiplier in the entire game and it is not an
upgrade.** It is the `technocracy` **policy** (`js/science.js:1067–1080`,
`technocracyScienceCap: 0.2`, price **culture 150,000**, mutually exclusive with `theocracy` and
`expansionism`, consumed at `js/resources.js:954–956`). Every *upgrade*-shaped science boost in
the source — Astrolabe, the three Reflectors, Uplink, the AI Core line — is per-building. **So
the standing rule is recorded and nothing ships against it: a whole-cap knowledge multiplier in
RR belongs on a policy, priced like one and exclusive like one. If a future round wants one,
×1.20 is the source's magnitude.**

| rung | Kittens shape | citation | effect |
|---|---|---|---|
| `cataloguing` | Reflectors | `js/workshop.js:1450` `titaniumMirrors libraryRatio 0.02` | `archiveRatio += 0.02` |
| `crossReferencing` | Reflectors | `:1467` `unobtainiumReflectors 0.02` | `archiveRatio += 0.02` |
| `greatIndex` | Reflectors | `:1483` `eludiumReflectors 0.02` | `archiveRatio += 0.02` |
| `annotatedIndex` | Astrolabe | `:1436–1448` → `js/buildings.js:672` | Academies hold **+50%** each |
| `livingLibrary` | Astrolabe | same | Hexcore Laboratories hold **+50%** each |

**Σ 0.06 is Kittens' figure taken, not tuned**, and the consumption is the source's:
`archive knowledge slice *= (1 + count("observatory") * archiveRatioTotal)`, exactly as
`js/buildings.js:579–580` does `library.scienceMax *= (1 + observatory.on * libraryRatio)`. **The
amplifier is multiplied by how many Observatories you own** — additive within the family,
multiplicative between categories, and it makes two buildings worth more together than apart. RR
had no analogue and this was the piece worth porting.

**`voidglassLenses` is untouched.** RR already shipped Kittens' Astrolabe at exact parity —
1,000 → 1,500 on the Observatory's own contribution, implemented at `capMultPerCopy()`. Ledgered
PARITY against `js/buildings.js:672` and left alone; the two new rungs copy it rather than
replacing it.

**Measured at the spec's own fixture** (20 archives, 15 academies, 10 observatories, 5 hexLabs,
all five plus `voidglassLenses`):

| slice | base | after |
|---|---|---|
| archive | 5,000 | **8,000** (`1 + 10 × 0.06`) |
| academy | 7,500 | **11,250** |
| observatory | 15,000 (already ×1.5) | 15,000 |
| hexLab | 7,500 | **11,250** |
| **building total** | **35,000** | **45,500 — ×1.30** |

**Exactly the spec's prediction, to the unit.**

**And the compounding the spec asked me to measure rather than assume.** `caps.knowledge` takes
`min(150 × morellonomicons, buildingKnowledgeCap)`, and that clamp reads **the building total** —
so raising the building slices raises the compendium ceiling too. With 1,000 Morellonomicons the
fully-stacked knowledge cap goes **70,000 → 91,000, ×1.30.** **A ×1.30 on buildings is ×1.30 on
the whole knowledge cap, not less.** Asserted, not stated.

Knowledge remains in `CAP_MULT_EXEMPT`; `caps.knowledge *=` appears nowhere in the file.

---

## 5. Part 2 — renown stops being income and becomes a currency

### 5.1 The defect underneath the defect

The charge guard is what Jerry reported and it is real: a charge camp paid renown **only when a
charge was consumed**, so a Wolves hunt with zero charges paid nothing.

**But `RENOWN_DEED_RATE 0.34` against a `Math.max(1, Math.round(...))` floor was worse.** It
collapsed the whole low ladder to a constant:

| camp `renown` field | 2 | 3 | 4 | 5 | 6 | 8 | 10 |
|---|---|---|---|---|---|---|---|
| paid at 0.34 | **1** | **1** | **1** | 2 | 2 | 3 | 3 |
| paid at 1.00 | **2** | **3** | **4** | **5** | **6** | **8** | **10** |

Wolves, Gromp, Raptors and Krugs are authored at 2, 2, 3 and 3 and **all four paid exactly 1**.
The camp ladder's differentiation did not exist on the shipped build, and "the charges should
multiply the renown given" cannot mean anything against a constant.

At 1.00 the authored fields pay themselves — Wolves 2, Raptors 3, Drake Hunt 15, Baron 40 — so
**the number on the camp card is the number the player receives.** The charge multiplies **×3
after the floor**, so an empowered Wolves hunt is a clean 2 → 6.

**A third defect found while fixing the first two:** the payout formula was written out in three
places, and **the two tooltips did not agree with each other** — the Wilds one applied
`RENOWN_DEED_RATE`, the Scouting Party one printed the raw authored field. At 0.34 that was the
difference between "+1 renown" and "+2 renown" on the same camp. One generator now, and the
tooltip names the empowered payout (`+2 renown (+6 empowered)`) so the multiplier is visible
before it fires.

### 5.2 The trickle, and the size of the cut

| pop | shipped | v0.59 | factor |
|---|---|---|---|
| 20 | 0.100/s | 0.007/s | **14× slower** |
| 40 | 0.200/s | 0.007/s | **29× slower** |
| 140 | 0.700/s | 0.007/s | **100× slower** |

At 0.007/s the trickle pays the tenth champion's 15,377 in **25.4 real days**, so it can no
longer fund the ladder on its own at any settlement size. That is the design: renown becomes a
deed currency, which is what `RENOWN_DEED_RATE`'s own name always claimed.

**The no-backfill half fixed a live defect.** Renown is `hidden` until Call to Arms, but the
trickle ran from Expedition Logistics into a cap of 30 — so **a player arrived at Call to Arms
with the meter already pinned at 30/30 by a resource they had never seen.** Gating on the same
condition that reveals the resource means the meter starts at 0 on the tick the player first sees
it. Asserted: `logistics` without `callToArms`, one hour ticked, `S.res.renown === 0`.

### 5.3 Trade, and a failure path that was paying out

`tradeCaravan()` grants **+1 for every leader**; Caitlyn's 5 is an **addition**, so she pays 6.
Bulk pays per caravan because bulk loops the real function — **×10 grants 10, and 60 under
Caitlyn** (see §2.2).

**The grant moved INSIDE the success branch, which is a fix in its own right:** Caitlyn's renown
sat below the if/else and **paid out on failed caravans too.** A failed caravan is not a deed and
now pays nothing. Asserted.

### 5.4 Ascent and first-time research — no code, two ledger rows

Measured at **0** on `ascendTargon()`, `buyTech("mining")` and `buyUpgrade("cataloguing")`.
Directives 1 and 5 were already satisfied. **Nothing shipped**, and both are recorded in the
ledger so a future round does not add them as an "obvious" deed source. The renown Jerry saw
appearing at an Ascent is the passive trickle, which ran continuously at 0.2/s during any action
that took wall-clock time.

---

## 6. Parts 3, 4 and 6 — three rulings and no new mechanics

**Part 3 — the 1,400–2,300 Era 3 band is RETIRED, on Jerry's ruling: "907 is okay for Era 3."**
Recorded in `pacing.mjs` with its reason, because a retired target that leaves no trace in the
instrument is how the next round re-invents it. Three reasons stated at the site: **Icathia is
now reached on every seed for the first time in this project's history**, and a band that fails
while the era finally *completes* on 3 of 3 is measuring something other than whether the era
works; **every Era-3 target in this project predates the ×2.62 → ×1.07 → ×1.02 spread collapse**,
so it was calibrated on an instrument with a 2.6× error bar; and **this is a retirement, not a
re-base** — the band is not moved to 907, because that is the trap the Convergence ruling already
names. Era 3 length is still reported as a number with no pass/fail attached.

**Part 4 — Convergence's measurement point moves off Sparks and onto the unlock.** v0.58's
condition read 0 on all three seeds, and that was never a balance finding: `worshipBonus()`
returns 0 unless `S.wtechs.convergence` is set (`index.html:1827`), and at Sparks the bot has not
researched it. **The condition was measuring the absence of a tech and reporting it as a
collapsed curve** — and note 6.1 had just pushed the religion buildings later, which made the gap
wider and the reading more confidently wrong.

The source settles where to measure. Kittens' anchor is an **unlock**: Solar Revolution gates at
1,000 worship, and the arithmetic is shown at the site —

```
worshipBonus(w) = 0.01 × unlimitedDR(w, 1000) = 0.01 × (√(1 + 8w/1000) − 1) / 2
w = 1000  →  0.01 × (√9 − 1) / 2 = 0.01 × 1.0 = 1.00%
```

So "Convergence, once researched, delivers ≥1%" is precisely "the player had banked ≥1,000
worship by the time they could buy it" — Kittens' own gate restated in RR's units. `simcore` now
captures the bonus **at the gate, before the purchase**, plus the worship banked and the year.
Worship at Sparks is still reported as a single-run figure. **`worshipBonus()` is untouched**
(§§1 and 3).

**Part 6 — the rank ladder is a 102% parity debt, reported rung by rung.** In the ledger against
Kittens' seven tiers, with the debt at each: **0% at 100, 500, 1,200, 2,500 and 5,000** — the
whole divergence is in the last two rungs, which is exactly what note 11 asked for. RR asks
**18,200 for the +18.75% Kittens grants at 9,000.** Stated in the same row and not conflated:
**that is a THRESHOLD ratio, and `XP_PER_SECOND` — the accrual rate, the other half of
time-to-rank — is still UNVERIFIED with five dead-end retrieval routes on record.** A 102%
threshold debt at an unverified rate is one unknown multiplied by another. If Jerry wants it
reduced, the source-shaped move is to match the thresholds and leave the rate alone, because the
thresholds have a citation and the rate does not.

**Part 5.1's two citations, both found.** The Golden Spire (`js/buildings.js:1964–1966`,
`faithMax *= (1 + (0.4 + 0.1 * goldenSpire.on))`, scoped to the Temple's own slice;
`faithMaxRatio` returns no hits anywhere) supplies the line number §29 asserted without. And
`cityOnAHill` (`js/science.js:1283–1297`, `onAHillCultureCap: 0.05`, consumed at
`js/resources.js:958–961` as a whole-cap culture multiplier) makes **culture's ×1.05 VERIFIED** —
Jerry's figure was the source's figure, in magnitude *and* in shape.

**Part 5.2 — a retraction.** The v0.58.1 record claimed §22's one-family invariant had been
violated. **It had not:** after §29 `SCHOLAR_CAPS` held exactly one key and `capFamilyOf()` was
total and single-valued throughout. Recorded in the ledger, because a false defect claim
propagates further than a false clean bill.

---

## 7. Part 8 and Jerry's dev notes — eight feel changes, every one ledgered

| # | note | what shipped |
|---|---|---|
| 1 | job buttons too bulky, text does not fit | **Layout only.** Both halves were one cause: eight fixed 28px squares reserved 272px, so "−20"/"+20" were laid out into 28px and clipped and a narrow viewport overflowed the panel. Chips size to their own text; the row wraps. No counts, no maxima, no `assignJob` behaviour touched. |
| 2 | crafting needs an undo | Wired into the **existing** window and the **existing** re-roll guard, which is what v0.55 built the seam for. **The open v0.55 item closes in the same round: trades now snapshot too**, stamped `"trade"`, so undoing a bad caravan sets the penalty — without that stamp, adding an undo to trades would have handed the player the free re-roll the original comment forbade. Bulk actions snapshot **once** at the batch boundary (`undoBulkDepth`). |
| 3 | a button for Zilean, not an automatic trigger at 5m | The automatic flip is **deleted**, not bypassed — asserted by running 50 s at a full bank and confirming `warpSpending` stays false. `spendTimeWarp()` refuses on an empty bank. **Labelled EASIER, not neutral:** choosing when to spend +50% is strictly better play than having it fire when the meter happens to fill. |
| 4 | bulk hunting on charge camps, not cooldown camps | A gate, not new machinery — `isChargeCamp()` already existed. The old exclusion rested on "a bulk run would waste the banked ×3", and **Part 2.1 removes the premise** by making the charge a multiplier rather than a gate. Cooldown camps stay excluded and that half is not negotiable. |
| 5 | Swain's lead duplicates his passive | **The Twitch defect of v0.54 in a new costume.** Note 20 moved his lead onto knowledge production — correctly — which left the lead and the passive doing the same thing to the same resource, so the leader slot bought a bigger number rather than a different decision. Passive → **mana +12%**; lead stays knowledge +25%. Asserted distinct, and asserted to actually reach mana production. |
| 6 | one more mana-production Discovery | **Rung-matched, not felt.** Kittens' catnip **job** line has TWO rungs (`catnipJobRatio`: mineralHoes 0.50 + ironHoes 0.30 → ×1.80). RR's Arcanist line had **one**, `arcaneFocus` at +50%. `leylineCalibration` is the missing rung at **the source's own second figure, +30%**, additive, landing the line at Kittens' ×1.80 exactly. Priced at the Sparks band; `auditCostGraph()` clean. |
| 7 | Festival on the buff banner | **Already shipped** — it renders beside HAND OF BARON and CREST OF CINDERS. Verified rather than re-implemented, and asserted so a future round does not "add" it twice. |
| 8 | fewer mushrooms; plumes at half | Mushrooms `4 → 2` per unit of comfort, and **plumes are now derived as half the mushroom term** rather than stated separately, so the ratio Jerry asked for cannot drift out of a future edit. At `luxuryComfort() = 3`: mushrooms 12 → 6, plumes 12 → 3. |

**Jerry's dev note 1 (supersedes the analyzer): only bulk transmute shows in the chronicle.**
v0.58 note 7 was right that the conversion should not be silent — the Arcanist's Circle spends up
to a third of a full mana pool without a word — but transmute is the most-clicked action in the
early game and one line per click buried every other line. A single cast is visible in the
resource column as it happens; a **batch** is what a player cannot reconstruct, and the Circle's
draw is always a batch. The conversion itself is unchanged.

**Jerry's dev note 2 (supersedes the analyzer): 907 is okay for Era 3.** Part 3 above.

---

## 8. Invariants re-pointed this round, with their superseding cause

**Thirty-eight were re-pointed at v0.58.1; twenty at v0.59.** Every one names its superseding
spec item at the site.

| suite | assertion | superseded by |
|---|---|---|
| `test-v581` | §3 — the consumed v0.58 spec is GONE from the repo root | **v0.59 spec Part 0** — a new analyzer round legitimately restores `current-build-spec.md`. The old form asserted the file's ABSENCE, true for exactly as long as no new spec existed, i.e. a version-pinned assertion in disguise. Now: the v0.58 spec is archived under `docs/specs/` and whatever sits at the root is not it. |
| `test-v581` | §29 — SCHOLAR_CAPS is renown alone, ×2.60 | **Part 5.3** — the family is deleted; the line delivers ×1.00 |
| `test-v581` | §29 — renown's family is `scholar` | **Part 5.3** — it is `masonry` at the `"none"` tier; the invariant is untouched |
| `test-v581` | 31.2 — with the line they clear the CUMULATIVE ladder | **Part 5.3** — the ×2.60 carried that, and cumulative was never the target: renown is lumpy-sink-bound. Replaced by the Halls-for-the-tenth count. |
| `test-v581` | 31.3 — deed income is cut to a third | **Part 2.1** — the rate rises to 1.00; the ONE-NAMED-CONSTANT property is what survives |
| `test-v581` | 12 — bulk hunting only on no-cooldown, no-charge camps | **Part 8 note 4** |
| `test-v58` | 7 — SCHOLAR_LINE Σ 1.60 | **Part 5.4** — `ARCHIVE_RATIO_LINE` Σ 0.06, Kittens' figure |
| `test-v58` | 7 — delivered ×1.85 / ×2.60, a 34.9% cut | **Part 5.3** — ×1.00; replaced by the flat `210 + 900 × Halls` assertion |
| `test-v58` | 7 — the prose says "+25%" | **Part 5.4** — "a further 2%", about the Archive and the Observatory |
| `test-v57` | 1 — renown is in SCHOLAR_CAPS, there ALONE | **Part 5.3** |
| `test-v57` | 1 — the Scholarship line delivers ×1.85/×2.60 to renown | **Part 5.3** |
| `test-v57` | 2 — the Scholarship prose NAMES Renown | **Part 5.3** — the generator is deleted |
| `test-v57` | 3 — the ceiling clears the CUMULATIVE ladder | **Part 5.3** — largest SINGLE purchase, as v0.58 Part 7.1 itself said |
| `test-v57` | 11 — `scholarAdd` exists, `retiredChainWouldGive` censused | **Parts 5.3/5.4** — no Scholarship multiplier of any shape survives |
| `test-v57` | 15 — Convergence re-derived as a sourced floor | **Part 4** — the floor is unchanged; the measurement point moved |
| `test-v56` | the one-family invariant over three families | **Part 5.3** — two families, same invariant |
| `test-v55` | 18 — Convergence at Sparks is a pass condition | **Part 4** |
| `test-v45` | knowledge cap == base + Σ(building caps) under every multiplier | **Part 5.4** — the expectation now reads the per-building terms. The property (**no whole-cap knowledge multiplier**) is unchanged and still fails instantly if one appears, because a whole-cap multiplier would scale the base cap too and this sum does not. |
| `test-v44` | Scholarship no longer touches the knowledge cap at all | **Part 5.4** — split into the two halves that actually differ: no whole-cap multiplier (asserted on a settlement with no knowledge buildings) *and* the per-building amplifiers work |
| `test-v44` | the prose no longer promises Knowledge storage | **Part 5.4** — the line is about knowledge now, so the prose must say so; the invariant is that it is GENERATED |
| `test-v43` | every Scholarship description states the multiplier applied | **Part 5.4** — read from `ARCHIVE_RATIO_LINE`/`ASTROLABE_LINE`, and **measured as an absolute delta rather than a ratio**, because the rung amplifies the Archive's own slice and a ratio against the whole ceiling encodes the fixture's composition |
| `test-v43` | Swain's passive matches his Raven Ledger identity | **Part 8 note 5** — strengthened to "a champion's passive does not duplicate their own lead" |
| `test-v42`, `test-v40` | festival mushroom cost `4 × luxuryComfort()` | **Part 8 note 8** — reads `FESTIVAL_MUSHROOMS` and `FESTIVAL_PLUME_SHARE`, so it will not need re-pointing again |
| `test-v38` | Renown is rate-limited to the CHARGE, not the hunt | **Part 2.1** — reversed by name. **What replaces it is tighter, not looser:** the payout must equal the camps' authored fields exactly, once per hunt, with the only permitted surplus being the banked charges' ×3. |

---

## 9. Pacing — the full-rigour gate

*(three seeds, 2,500 game-years, launched concurrently — see §11)*

---

## 10. Suites and the ledger

**`tests/test-v59.mjs` — 79 assertions covering the round's 17 pass conditions**, including the
mechanical reused-id guard, which is the one assertion in this suite that could fail on a future
round through no fault of that round's author. That is deliberate: it is the only kind of guard
that would have caught the Granary.

**`docs/PARITY-LEDGER.md` regenerated: 227 rows — PARITY 64, EASIER 40, HARDER 2, UNVERIFIED 121.**
Parity debt **126 → 121**. Every one of Part 8's eight notes and Jerry's two dev notes has a row
or an updated row, per `OFF-CYCLE-PROTOCOL.md` §5's lesson that feel-justified changes drift from
source unless the verdict is recorded in the same round.

---

## 11. Pass conditions

*(filled from the final ensemble — see the table at the end of this file)*

---

## 12. Files

| file | change |
|---|---|
| `index.html` | Parts 1, 2, 5.3, 5.4, 8; `VERSION` → `v0.59` |
| `sim/simcore.mjs` | the Scholarship census re-pointed onto the new mechanisms and the cap families; Part 4's Convergence capture at the gate |
| `sim/pacing.mjs` | Part 3's ruling and the retired band; Part 4's re-pointed condition; the re-pointed census readouts |
| `tools/parity-ledger.mjs` | the verdict map: six upgrade rows sourced, one new row, eight standing-divergence rows added or rewritten |
| `STANDING-RULINGS.md` | **§30** — a deleted id is never reused while its migration exists |
| `tests/test-v59.mjs` | new |
| `tests/test-v38/40/43/44/45/55/56/57/58/581` | re-pointed, §8 above |
| `snapshots/v59/s1,s3,s4,s7` | cumulative-prefix isolation slices |
| `docs/specs/rr-analyzer-v059-spec.md` | the consumed spec, archived |
