# BUILD REPORT v0.59.1 — eight notes, one silently discarded yield, and a number I shipped this morning re-scoped

An **OFF-CYCLE round** (`OFF-CYCLE-PROTOCOL.md`): built from Jerry's eight developer notes with
no analyzer spec. Point release off `v0.59`; integers stay reserved 1:1 for spec rounds.

---

## 1. The note that mattered most, and it was a real loss of yield

**Note 4.1: "This is not shown in the materials section."**

Sump Ecology unlocks the Sump Crawl, which pays Zaun Ore, **Coalgas and Shimmer**. Both of those
last two were revealed by `chemtech` alone — and `withYieldFilter()` **drops a `gain()` whose
resource is still hidden.** That filter is correct and exists for a good reason: it stops an
early hunt paying in materials the player has no way to understand.

So the two mechanisms met, and **a player who researched Sump Ecology before The Chemtech Whisper
ran the crawl and received nothing at all for two of its three rewards, silently.** No error, no
log line, no zero in a tooltip — the gain was simply discarded.

**Note 4.2 is Jerry's fix for the ordering** and it is the right one: The Chemtech Whisper is
what *reveals* coalgas and shimmer and unlocks the Vent and the Refinery, so it should come
first. The two costs swap, 55,000 ↔ 60,000, and no other price on the ladder moves.

**But a cost swap makes chemtech the cheaper research, not the earlier one.** A player may buy
Era-3 interstitials in any order they like. So note 4.1 ships as its own fix as well: **both
resources now reveal on EITHER tech**, which makes the property unconditional — the tech that
unlocks a faucet also reveals what that faucet pays. Both halves are asserted.

---

## 2. My errors, and a number I shipped this morning

### 2.1 Note 1 re-scopes `leylineCalibration`, and takes its parity citation with it

v0.59 Part 8 note 6 shipped `leylineCalibration` **six hours before this round** as the second
rung of the Arcanist **job** line, and rated it **PARITY** on a real citation: Kittens'
`catnipJobRatio` is two rungs, `mineralHoes` 0.50 + `ironHoes` 0.30, landing at ×1.80. That was
a good piece of work and the citation was sound.

Jerry: *"the mana discovery should affect all mana production, not just arcanists."*

**The citation no longer describes what RR does.** A job-scoped +30% and a global +30% are not
the same claim about the source. So the ledger row is **re-rated PARITY → EASIER** rather than
left carrying a line number it has stopped matching — the shape is still sourced (Kittens does
have global `<res>Ratio` upgrades) but the magnitude is now RR-original, and it is strictly more
generous than the rung it replaced because it reaches Mana Wells, the manual channel and every
future mana faucet rather than one job.

**The magnitude is deliberately unchanged at 0.30.** Jerry moved its scope, not its size, and
inventing a new number while re-scoping would have made the measurement unreadable.

### 2.2 The `v0.59` snapshots are one round stale, and that is fine but should be said

`snapshots/v59/s1,s3,s4,s7` are cumulative prefixes of the **v0.59** shipped file. They are not
re-cut for this round — an off-cycle round of eight feel notes has no per-part attribution
question to answer — so a future session should read them as *v0.59's* slices, which is what
their directory name says.

---

## 3. Notes 1 and 6 — two discoveries onto one additive category

| | before | after |
|---|---|---|
| `leylineCalibration` | Arcanist **job** line, +30% (2nd rung of a ×1.80 pair) | **all mana production, +30%** |
| `trueIceCellars` | wanderers eat **20% less** | **all mana production, +20%** |
| `hexresonance` | all mana +25% | unchanged |

**Measured on a settlement with zero arcanists assigned** — a job-scoped bonus cannot move that
number, so it is the only fixture that distinguishes the two claims:

| held | delivered |
|---|---|
| Leyline Calibration alone | **×1.30** |
| True Ice Cellars alone | **×1.20** |
| Hexresonance alone | ×1.25 |
| **all three** | **×1.75** |

**×1.75 is `1 + 0.30 + 0.20 + 0.25` exactly.** Kittens' Law holds — additive within the category,
never the ×1.95 a chain would give. All three land in one `boosts.mana` accumulator, which is why
a third multiplicative category never appears.

**Note 6 has an argument stronger than feel, and it is worth stating.** True Ice Cellars cut
wanderer consumption by 20% — that is, **a Discovery was quietly rescaling `CONSUMPTION`, the one
parity constant in the whole food economy** (STANDING-RULINGS Appendix: `catnipPerKitten −0.85 ×
5` against `catnip 1 × 5`, ratio **1.17647** exactly). A discovery that moves a parity constant
by a fifth makes that constant unmeasurable in play. Measured after: provisions **−170/s at pop
40 with and without the discovery, identical to the unit.**

---

## 4. Note 2 — the job row, and a reversal of my own last round

**v0.59 Part 8 note 1 fixed the wrong thing.** Jerry's complaint then was that the chips were
bulky and the text did not fit; I widened them and let the row **wrap**. That traded a clipped
row for a **two-line** row — eight jobs became sixteen lines — and made the vertical-space
problem worse while technically fixing the clipping.

Jerry supplied the Kittens Jobs panel, and **the source's answer is structural rather than
cosmetic**: one row per job, exactly **two** controls, and the bulk steps in a **flyout that
opens on hover beneath the button**.

**The flyout is `position: absolute`, and that is the mechanism, not a detail.** An out-of-flow
element cannot push the rows beneath it down, so eight jobs cost eight rows whether every flyout
is open or none is.

**Measured at a 430 px viewport** — the narrow case the note is about:

| | |
|---|---|
| rows | **6**, one per job |
| tallest row | **28 px** — a single line |
| worst overflow past the panel | **−11 px** (i.e. 11 px *inside* it; nothing clips) |
| controls per row | **2**, each with its own flyout |
| flyouts open by default | **0** |
| on hovering `+` | exactly **1** opens, labelled **`+5 +25 +all`** |
| **list bottom, closed → open** | **633 px → 633 px — the layout does not move** |

The steps are **Kittens' own 5 / 25 / all**, from the screenshot, not RR's previous 5 / 20 / all.
Layout only: no counts, no maxima, no `assignJob` behaviour touched.

---

## 5. Note 7 — the Manufactory becomes a real crystal sink, on measured grounds

**The v0.59 three-seed ensemble is the argument.** Crystals sat at their ceiling **95.5% of all
elapsed ticks**, finished at **90,279 / 90,279**, and the bot assigned **zero tinkerers across
2,500 game-years** — it never needed one. A resource that is permanently full with no sink is not
an economy, and the Manufactory was the one continuous crystal consumer in the game while costing
60 crystals and burning 0.02/s.

| | before | after | ×    |
|---|---|---|---|
| build cost | 60 crystals | **400** | ×6.7 |
| fuel burn per copy | 0.02/s | **0.12/s** | ×6 |
| Pressure Regulators | 120 crystals | **600** | ×5 |
| The Rolling Press | 90 crystals | **450** | ×5 |
| The Automated Workshop | 200 crystals | **900** | ×4.5 |

**The fuel is the half that does the work.** A one-off cost is paid once out of a full stockpile
and changes nothing; a **burn rate** is what makes a player look at where crystals come from — the
Refinery and the Tinkerer, which is what the note asks for in its own words.

**`ratio` is deliberately untouched at 1.15.** Steepening it as well would price the tenth
Manufactory out of reach and turn a sink into a wall.

### 5.1 Note 7.2 — a faucet becomes a spill-guard

v0.58.1's Automated Workshop granted **one beam, slab, gear and iron plating per Manufactory per
game-year, out of nothing.** That is a faucet with no input, and the ledger rated it EASIER on
exactly that basis.

**Kittens' Workshop Automation is a different kind of effect.** It watches the raw stockpiles and,
when one is nearly full, converts the **overflow** into the crafted tier at the ordinary recipe
price. It can only ever act on units that were about to be thrown away at the ceiling — so it
adds nothing to a settlement whose storage is not full, and everything to one whose is.

Routed through `craftItem()` rather than reimplemented, so automation pays the same price, takes
the same yield multipliers and respects the same output ceiling a hand-craft does.

**Measured, five Manufactories, at three fill levels:**

| timber/ore at | beams | slabs | timber spent | ore spent | chronicle lines |
|---|---|---|---|---|---|
| 50% of ceiling | 0 | 0 | 0 | 0 | 0 |
| **94%** | **0** | **0** | **0** | **0** | **0** |
| 100% | 26 | 20 | 3,900 | 4,000 | **1** |

**What is parity and what is not, stated rather than blurred.** The **shape** is the source's and
the **95% trigger** is the documented threshold. The **share** — how much of the standing pool one
trigger converts — I could not retrieve from source this round, so **5% of the ceiling per
Manufactory per game-year is an RR-ORIGINAL magnitude and is ledgered UNVERIFIED**, not dressed up
as parity. Retrieving `factoryAutomation`'s conversion fraction is a cheap win for the next
analyzer pass.

---

## 6. Notes 3, 5 and 8

**Note 3 — Kindling Theory is deleted, and it is the first application of §30 by the round after
the one that wrote it.** It was a leaf: `req: "smelting"`, the `req` of nothing, and the gate of
exactly one discovery. **A 50,000-knowledge research whose entire content is "you may now buy one
thing" is a toll booth, not a decision** — and it sat on an Era-2 rung while the thing it gated is
Era-3 industry. Banked Coals moves to Sump Ecology.

The migration drops `kindling` from a save and **keeps the discovery the player paid for**.
`kindling` is a **reserved id** for as long as that line exists and **the migration names v1.0 as
its retirement** — which is precisely what §30 was written for two commits earlier.

**Note 5 — one chronicle line per batch.** A ×20 hunt wrote twenty-one lines and pushed
everything else out of a sixty-line chronicle. The log's whole job is to tell you what you could
not watch, and a batch is exactly the case where it stopped doing that. Measured:

```
The war-band goes out 20 times over. Hunt Krugs ×20 — +100 ore, +200 gold, +72.0 renown for −3000 vigor.
```

**A bulk of ONE is left alone.** It still prints the camp's own flavour line — *"The krugs
crumble, then crumble again. +22 ore, +8 gold."* — because the note is about a run of twenty
burying the chronicle, not about losing flavour on a single click. The mute is a **counter**, not
a boolean, so nested batches cannot un-mute each other.

**Note 8 — Harvest Rites moves off Songcraft.** Songcraft is the tech that makes **culture a
resource**, so gating the festival on it put the game's first culture **sink** on the same rung
that opens the faucet: a player reached a 300-culture price with no culture. Masquerade (1,500
knowledge, off `trade`) is the festival-and-strangers tech. **The cost is untouched; only the gate
moved.**

---

## 7. Invariants re-pointed this round, with their superseding note

**Twenty-six assertions across fourteen suites**, every one naming its cause at the site. They
fall into four classes, and it is worth naming the classes rather than listing twenty-six rows:

| class | count | superseded by | what was re-pointed |
|---|---|---|---|
| **The tech ladder is 36, not 37** | 12 | **note 3** | Every suite that pinned `TECHS.length === 37` or a 37-entry price table. This literal has now moved 38 → 37 → 36, and **each time for a deliberate deletion** — which is the assertion working. `test-v56` and `test-v57` also re-measure the ladder's four shape statistics (8 ties, median ×1.1111 unmoved, geo ×1.2717, max ×3.333 unmoved); **the bands the ladder is judged against are untouched.** |
| **Two Era-3 rungs swapped** | 9 | **note 4.2** | Every `chemtech === 60000` anchor and the `sumpEcology: 55000` interstitial. **No rung is added or removed and no other price moves**, so the parity claim these make — RR's Era-3 anchors sit on Kittens' rungs — is intact. |
| **The job-row markup** | 3 | **note 2** | `test-v581`'s "the buttons exist for both directions" grepped for eight literal `data-d="-20"` strings; the markup **generates** them from a `step(d, label)` helper now, so those literals no longer exist and grepping for them would assert the absence of a refactor. Re-pointed onto the step calls and the flyout. `test-v59`'s `8.1` asserted the row **wraps**; it must not. |
| **The automation fixture** | 2 | **note 7.2** | `test-v581`'s `48.2C` expected `[10,10,10,10]` from a flat grant. Replaced by the two properties that actually distinguish a spill-guard: **nothing below the trigger**, and **at the ceiling it converts AND pays.** |

Two more, each its own case:

| suite | assertion | superseded by |
|---|---|---|
| `test-v41` | Harvest Rites exists in the **Songcraft** line | **note 8** — Masquerade. **The cost half of the assertion is unchanged and is the half worth keeping:** only the gate moved. |
| `test-v50` | the Shimmer Refinery sits on `chemtech`, priced 60,000 | **note 4.2** — 55,000. What the assertion is *for* — the Refinery sits on the same tech that gates its own alloy input — is untouched. |
| `test-v59` | the mana Discovery completes Kittens' **two-rung job line** at ×1.80 | **note 1** — see §2.1. Replaced by the property the note asks for, measured where it could not have been true before: it reaches mana production **with no arcanist assigned at all.** |

---

## 8. Pacing — the full-rigour gate

**Three seeds, 2,500 game-years, concurrent. 4,038.5 s wall (67.3 min). 10 of 10 pass
conditions.**

| figure | v0.59 | **v0.59.1** | spread | per-seed |
|---|---|---|---|---|
| **Pass conditions** | **9 of 10** | **10 of 10** | — | — |
| First champion `[max] < 120` | **FAIL, 142** | **PASS, 105.6** | ×1.19 | 104.6 / 105.6 / 88.6 |
| Era 3 | 797.5 | 785.9 | **×1.58** | 785.9 / 582.8 / 920.5 |
| Icathia | 997.9 | 993.9 | ×1.39 | 3 of 3 seeds |
| Tenth champion | 994.5 | 991.7 | ×1.38 | 3 of 3 seeds |
| Sparks | 200.4 | 208.0 | ×1.15 | 208 / 215.6 / 188 |
| Peak population | 204 | 209 | — | 209 / 209 / 204 |
| Morale in the 90–140 band | 100% | 100% | — | — |
| Convergence at its unlock | 8.834% | 9.160% | — | 9.026 / 9.16 / 9.19 |

**The v0.59 failure is closed and nothing was aimed at it.** `First champion before year 120`
failed at v0.59 with seed 2 reading 142 against a `[max]` shape. It now reads 104.6 / 105.6 /
88.6 — **worst case 105.6, comfortably inside** — and no note in this round touched renown,
champions or the early economy. **That is the variance HANDOFF v0.59 §4 flagged, resolving in the
lucky direction on this draw rather than being fixed.** It should not be read as a repair, and it
does not retire the open question.

### The thing that did NOT happen, and it is note 7's own stated goal

> *"it should force the player to build more hextech refineries and allocate tinkerers"*

| | v0.59 | v0.59.1 |
|---|---|---|
| crystals at their ceiling | 95.5% of ticks | **95.9%** |
| crystals held at end | 90,279 / 90,279 | **94,360 / 94,360** |
| crystal income at end | 421.6/s | **559.0/s** |
| **tinkerers assigned, ever** | **0** | **0** |
| Refineries at Icathia | 41 | 41 |

**Cost ×6.7 and fuel ×6 did not move the crystal economy at all, and the arithmetic says why: the
burn is two orders of magnitude below the faucet.** Twenty Manufactories burn `20 × 0.12 = 2.4`
crystals/s against a late-game income of **559/s** — **0.4%**. A ×6 on a number that small is
still a rounding error at the scale the note is aimed at.

**Two separate causes, and they need separate fixes:**

1. **The burn is too small by roughly two orders of magnitude**, not by a factor of six. Making
   the Manufactory a *primary* crystal sink means a burn measured against 559/s, which is a
   different size of number entirely — and `MANUFACTORY_FUEL` is the one dial that does it.
2. **The bot has no tinkerer policy at all.** `manageJobs()` never staffs one, in any round, at
   any population — the same shape of gap v0.57 Part 4 found and fixed for farmers. **So "allocate
   tinkerers" cannot be measured by this harness until the bot can do it**, and no crystal price
   will produce that behaviour on its own.

**I shipped the note as specified and am reporting the measurement rather than quietly picking
larger numbers.** Jerry asked for "more expensive" and got it; the *consequence* he named needs a
second round with the two causes above addressed, and the analyzer notes carry both.

### Era 3's spread widened again: ×1.02 → ×1.32 → ×1.58

Three rounds, and nothing in any of them touched Era-3 content. v0.59 traced it to champion
passives gated on a newly-variable renown economy; **this round adds a second term**, because
seed 2 reaches Icathia at 798.4 while seed 3 takes 1,108.5 on a build where the Manufactory is now
a real drag on the crystal chain. **Two candidate causes are now stacked and neither is
quantified.** This is the project's largest open measurement question and it deserves a round of
its own rather than another note.

---

## 9. Suites and the ledger

**`tests/test-v591.mjs` — 43 assertions**, one block per note, in the order the notes were issued.

**`docs/PARITY-LEDGER.md` regenerated: 226 rows — PARITY 63, EASIER 41, HARDER 2, UNVERIFIED
120.** The row count falls by one because `kindling` is deleted; PARITY falls by one and EASIER
rises by one because `leylineCalibration` is re-rated (§2.1). **Every one of the eight notes has a
row, and `test-v591` asserts that by note number** so a future note cannot ship without one.

---

## 10. Files

| file | change |
|---|---|
| `index.html` | all eight notes; `VERSION` → `v0.59.1` |
| `tools/parity-ledger.mjs` | `kindling` removed; `leylineCalibration`, `trueIceCellars`, `manufactory` and the three Manufactory discoveries re-rated; six new standing-divergence rows |
| `tests/test-v591.mjs` | new |
| 14 suites | re-pointed, §7 above |
| `docs/specs/rr-devnotes-v0.59.1.md` | the notes as issued, consumed from the repo root |
