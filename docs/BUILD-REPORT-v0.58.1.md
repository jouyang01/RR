# BUILD REPORT v0.58.1 — forty-eight notes, one new ruling, and a loop guard that earned its keep

Shipped as **v0.58.1**, tagged `v0.58.1`. `VERSION`, the footer and the tag agree.

**An OFF-CYCLE round** (`OFF-CYCLE-PROTOCOL.md`): built from Jerry's developer gameplay notes
with **no analyzer spec**, tagged as a **point release** so integers stay reserved 1:1 for
spec rounds. The next spec round is still `v0.59`.

**All 48 notes actioned. 28 live suites, 1,436 assertions, 0 failures.** Per
`BUILDER_PROTOCOL.md`: cheap single-seed checks through the round, and the full multi-seed,
full-length suite once, at the end.

**The round has two headlines and neither is a note.**

> **1. Notes 15 and 16 collided with two closed rulings, so I stopped and asked rather than
> deciding.** Reaching Kittens' ×1.05 culture and ×1.5 devotion ceilings requires culture and
> devotion to leave `SCHOLAR_CAPS` and stop taking `mountainMult` — which contradicts **§22**
> ("Renown moves into `SCHOLAR_CAPS`, *beside culture and devotion*") and **§23a** ("the
> multiplication that remains — this line against `cultureCapPct`, against `mountainMult` — is
> what the law permits **and all it permits**"). That is the operative reasoning of both, not
> stale prose. Jerry ruled: ship it as **STANDING-RULINGS §29**, a new numbered section that
> amends both **by name**. `OFF-CYCLE-PROTOCOL.md` §3 forbids the silent contradiction; this is
> the alternative it names.

> **2. `test-v41`'s loop guard caught an infinite-resource exploit that two of Jerry's notes
> created between them.** The timber → Demacia → steel → Piltover → mana → transmute → timber
> circuit must return **less** timber than it consumes at every multiplier's ceiling; the guard
> is `G < 0.8` and it stood at **0.744 — 93% of the way to the limit** — before this round.
>
> | | G |
> |---|---|
> | v0.58 | 0.744 |
> | + note 34 alone (Piltover mana ×1.83) | **1.364 — already broken** |
> | + note 17 (craft effectiveness on transmute, ×3.2) | **4.366 — a net timber gain of 4.4×** |
> | **shipped** | **0.759** |
>
> **Note 34 alone breaks it**, which is the finding: the margin was never as wide as it looked.
> Both notes ship in full and **three numbers move to hold the guard** — §1.1 below names all
> three, including the one Jerry did not ask me to touch.

---

## 1. My errors, and the numbers I moved that nobody asked me to

**1.1 — TRANSMUTE_COST 14 → 20, and I want this read rather than skimmed.** It is the one
number in this round that Jerry did not ask me to move. Notes 17 and 34 cannot both ship at the
old price without putting the trade circuit into net gain, and the circuit's timber leg is priced
here. The other two numbers that moved are defensible as readings of the notes themselves —
Piltover's steel price rises ×1.81 alongside its mana so "more mana per trade" is a route
improvement rather than an exchange-rate change, and note 17's craft term is bounded at a quarter
weight because every other percentage stack in this file is bounded by a DR primitive. The
transmute price is not that. **It is a real 43% nerf to the earliest loop in the game and it is
reported, not buried.** If Jerry would rather have the old price, the lever is note 34's mana
figure or note 17's weight, and I would want his call rather than mine.

**1.2 — I shipped a discovery priced in a material that arrives 25,000 knowledge later.** The
Automated Workshop (note 48.2C) asked for `hexgear`, gated on `hexcore` (75,000), while the
discovery unlocks at `hexdraulics` (50,000) — so it would have sat visible and unbuyable for an
entire tech tier. `auditCostGraph()` rejected it. Scaffold replaces it.

**1.3 — note 33 broke the same audit from the other side, and the audit had a blind spot that
hid it.** Giving the Tome a culture cost made it require a resource the player cannot hold — the
recipe is visible from the first fur, culture arrives with Songcraft. The fix moved the Tome's
REVEAL behind culture. But the audit then still flagged it, because **it could only read two of
this game's three gate shapes**: a `tech:` field and a `s.upgrades.X` discovery closure, but not
`s.seenMax.<res>` — which is how Parchment and the Tome are revealed. Any such craft scored as
"unlocks at start (0)" and every cost it carried looked like a violation. **The audit reads all
three now**, and a `seenMax` conjunction resolves to the DEEPEST of the named resources, because
a `show` conjunction names requirements where a `hidden` predicate names alternatives.

**1.4 — an inert converter crashed the tooltip layer, and inert is the whole point of note 48.**
`convertLine()` assumed every converter had at least one input and one output. The Manufactory
has an empty output until its discoveries are bought. `test-v53` caught it as a hard crash.

**1.5 — a mismatched quote, and a fixture that read a festival I had left running.** The first
took the page down entirely (`'…</div>";` — opened single, closed double) and was caught in
seconds by a syntax check. The second is **STANDING-RULINGS §21 exactly** — a fixture that takes
a baseline from live state must reset the state it is baselining — and it cost the note-32 block
three false failures reading +12 where the term pays +10, because a festival from the note-1
block was still multiplying morale by 1.20.

---

## 2. Notes 15 and 16 — STANDING-RULINGS §29

**Measured before anything moved**, which is what made the question askable:

| | delivered | built from |
|---|---|---|
| culture | **×6.4344** | Scholarship ×2.60 · Progress Day Parade ×1.35 · Oral Tradition ×1.15 · Mountain Drakes ×1.594 |
| devotion | **×10.3613** | Scholarship ×2.60 · Lunari Vigil ×1.25 · Solari Altar ×2.00 · Mountain Drakes ×1.594 |

Close enough to Jerry's ×6.19 and ×9.98 to confirm we were looking at the same thing.

**The fix is structural, not a constant cut, because note 16's objection is about SCOPE and no
choice of constants answers a scope objection.** Both resources move to `CAP_MULT_EXEMPT`.

| | shipped | measured |
|---|---|---|
| culture, fixed multiplier | Progress Day Parade only, ×1.35 → **×1.05** | **×1.05** exactly |
| culture, whole stack | the rest comes from BUILDINGS | **×1.197** on the 20-Hearth fixture |
| Oral Tradition | ×1.15 whole-cap → **+20 culture per Bard's Hearth** | sized against the measurement: the retired clause was worth +686 there, this pays ~+640 |
| devotion, whole-cap multiplier | **none at all** | **×1.000** |
| Solari Altar | ×2 whole-cap → **×1.5 slice on the Marus Omegnum** | **×1.495** all-Marus |
| Lunari Vigil | ×1.25 whole-cap → **×1.25 slice on the Shrine** | mixed settlement **×1.357** |

**The slice is the point.** `capsSliceMult(building, resource)` applies to one building's
contribution, so an all-Marus settlement sees ×1.5 and a mixed one sees less — *the slice cannot
lift what it does not touch*, which is precisely the property note 16 asks for and which no
whole-cap constant can reproduce.

**§22's invariant survives and is asserted:** every capped resource is in exactly one of the
three families, `capFamilyOf()` decides it in one place, `test-v581` checks totality and
single-valuedness by enumeration. `CAP_MULT_EXEMPT` is a family. **§23a's actual ruling — the
Scholarship line is additive — is untouched**; the line delivers ×2.60 to **renown alone**, which
is the one member with no Kittens counterpart and therefore the one no source-magnitude argument
can be made against.

---

## 3. The notes with the most substance behind them

**Note 1, the Festival — and it fixed v0.58's one failing pass condition.** v0.58 shipped a +30%
festival because that is what Jerry's note 12 said, and the three-seed ensemble then failed the
morale 90–140 band at **76 / 72 / 98%**. I reported it as a design question for Jerry rather than
guessing. He answered it in note 1.2 with +20%, and the band is back to **98–100%**. That is the
report loop closing in one round, which is the best argument for reporting failures plainly.

The rest of note 1 makes the festival a real sink: **culture and vigor are PER-HEAD**, which is
what makes the culture draw *repetitive* rather than a one-off toll — a flat price becomes free
the moment the ceiling grows, a per-head price costs a late settlement the same share of its
ceiling every year forever. And the culture REWARD is deleted, so culture only ever flows out;
gold takes its place at 250 + 25/Hearth, which against an early gold ceiling of a few hundred is
the "boost early" note 1.1 asks for.

**Note 32, the Jack in the Box — `limitedDR` was the wrong primitive and had been for eleven
versions.** It is LINEAR below 75% of its limit, which is its defining property, so at 2 points a
box **the first seven boxes paid full freight** and the curve only bent at fifteen. The note asks
for diminishing returns past five and an asymptote; the first five are now linear at exactly 2
each and everything past five goes through `strictDR`, which bites from the first unit and has a
true asymptote. **The boxes can never pay more than +30, at any count.**

**Note 20, Swain — the abuse is a CLASS, not an instance.** Any lead that discounts a **one-time
purchase** can be switched on for the instant of the purchase and off again, so its real value is
the full discount at no cost. A lead that acts on a **flow** cannot be gamed that way. The
discount becomes knowledge production: same subject matter, immune by construction.

**Note 31.2 is a hard constraint and it is asserted, not hoped.** Note 31 raises the tenth
champion from 9,611 to 15,377 while note 31.1 deletes the Hall of Heroes' percentage and note 30
deletes the Training Ground's ceiling entirely — three changes that all push the same way. The
flat grant rises 250 → **900** so the ladder stays finishable, and the numbers are measured:
**20 Halls clear 18,210 against the 15,377 tenth champion with no Scholarship at all**, and
**47,346 against the 45,332 cumulative** with it.

**Note 48, the Manufactory — RR's first inert building.** Every building in this game does
something the moment it is built; Kittens' Factory does not, and that shape is the note. It burns
crystals through the ordinary `convert` machinery, which means the existing rule applies
untouched: **a converter whose inputs are short simply does not run**, so an unfuelled
Manufactory is idle rather than broken and stops drawing crystals the moment the stock dries.
Verified: `0 parchment/s with no crystals`. It is in `BUILD_ORDER` in the same commit that adds
it — HANDOFF v0.58 operational rule 1, which exists because the Shimmer Refinery was read as a
pricing defect for four rounds when the bot had simply never considered it.

---

## 4. Every note, and where it landed

| # | note | shipped |
|---|---|---|
| 1 | Festival: no culture, 400 days, gold, no layering, Vigor cost, larger culture sink, +20% morale | all seven clauses; culture and vigor per-head |
| 2 | Warehouses should not store crystals | reverted, whole |
| 3 | Noxus' "standing approves anyway" | standing never existed; the line names `failChance`, which falls per caravan |
| 4 | +Caravan should grey and highlight | same `mini-btn`/`dim` convention as every other chip |
| 5 | Caravan tooltip spoils locked cargo | unseen slots are **counted, not named** |
| 6 | Revelations arrive all at once | revealed at half their worship threshold |
| 6.1 | Revelation devotion costs too low | 250 / 600 / 1,200 / 1,800 / 3,000 — monotone for the first time |
| 7 | Drake Hunt dearer, 15-min cooldown, gold | vigor 900, steel 80, provisions 9,000, 200–320 gold on success |
| 8 | Baron dearer, 20-min cooldown, gold | vigor 2,600, steel 260, 340–540 gold |
| 9 | Sentinel/Brambleback gold for 10 min | 15–25 → **120–200** |
| 10 | Job +5/+20/+all and −5/−20/−all | `assignJob` extended and clamped, not duplicated |
| 11 | Master→GM and GM→Challenger exp double | the GAPS double; nothing below Master moves. Re-rated **HARDER** |
| 12 | Bulk hunting on no-cooldown camps | only camps with no cooldown AND no charge timer |
| 13 | Marus needs 1,500 worship | plus its Sanctums |
| 14 | Bulk trading | same x/y/all shape as crafting |
| 15 | Culture cap multiplier ×6 too large | **§29** |
| 16 | Devotion cap multiplier too large and too broad | **§29**, with a slice mechanism |
| 17 | Transmute should read craft effectiveness | bounded at a quarter weight — see §1.1 |
| 18 | Ascent should consume all devotion | it destroyed every fractional point, silently, on every ascent |
| 19 | Jarvan | passive → wanderer XP; lead → village production |
| 20 | Swain abusable | a flow effect, immune by construction |
| 21 | Caitlyn too similar to Twitch | her cargo clauses deleted; renown-per-trade is her whole lead |
| 22 | Twitch cargo chance | tiered 15/10/5 by slot |
| 23 | Zilean time warp | banks 5 minutes, spends at +50%, on a duty cycle, with a meter |
| 24 | Shaco 20% | 30% → 20% |
| 25 | Heimerdinger 15% | 20% → 15% |
| 26 | Champion exp labelled (XP) | done |
| 27 | Bard 10% | 20% → 10% |
| 28 | Dragon Soul needs every drake, +15% | gate reads `DRAKE_TYPES.length`, not a literal |
| 29 | Infernal Drake → converters | same rate, same ceiling, narrower blast radius |
| 30 | Training Ground renown cap | deleted |
| 31 | Champions cost more renown | base 250 → 400; ratio untouched |
| 31.1 | Hall of Heroes flat only | percentage deleted, flat 250 → 900 |
| 31.2 | ladder must stay finishable | **measured and asserted** |
| 31.3 | renown gain very slow | deed rate ×0.34 |
| 32 | Jack in the Box asymptote | five linear, then `strictDR` |
| 33 | Tomes cost culture | culture 40; the Morellonomicon already charged 9,000 knowledge at exact parity |
| 34 | Piltover more mana | 500–700 → 900–1,300, steel 80 → 145 |
| 35 | Scouting 1,750, undiscountable | a property of the expedition, not its tab |
| 36 | Rift Scuttler should scale | 4% of max knowledge, 6% of max vigor, floored at the old flat figures |
| 37 | Targon crescent moon, off to the side | drawn as pixels, two discs |
| 38 | Festival fireworks | three shells on staggered cycles, behind the huts |
| 39 | Observatory costs Steel | 750 ore → 150 steel |
| 40 | Aurelion Sol's star shard | chronicle event; Observatories raise its chance through `strictDR` |
| 41 | Freljord Deepwinter provisions as a bonus | the old rule made the route WORSE in winter |
| 42 | "Some mana has gone missing" | done |
| 43 | Trade chronicle text yellow | its own class and colour |
| 44 | Harbor costs steel | 40 |
| 45 | Poppy's lead prose | says only what it does |
| 46 | Observatory 35 scaffold | 50 → 35 |
| 47 | Policy culture costs scale | spread 12× → 35×, first two groups untouched |
| 48 | A Factory-shaped building | the Hexdraulic Manufactory and three discoveries |

---

## 5. §7 — invariants re-pointed this round, with their superseding cause

**Thirty-eight shipped assertions across fifteen suites. Every one re-pointed, none deleted**,
each carrying its superseding note in a comment at the site. The pattern is dense this round
because 48 notes move a great many pinned numbers; the ones worth naming are the ones where the
*property* changed rather than the figure:

| suite | assertion | superseded by | what survives |
|---|---|---|---|
| `test-v41` | *"transmutation is flat — the Yordle Workshop no longer compounds it"* | **note 17** | the guard this protected is the NEXT assertion (G < 0.8) and it is intact; what is asserted here now is the **bound**, not the absence |
| `test-v41` | Piltover charges 80 steel | **note 34** | the loop numbers, at the new price |
| `test-v37`/`v40` | Jack in the Box bounded at +20, ceiling 175 | **note 32** | bounded at +30 and 185 — and the bound is **stronger**, because `strictDR` has a true asymptote where `limitedDR` has a linear band |
| `test-v39` | Training Ground is a second renown cap source | **note 30** | it holds none; the Hall is the only one |
| `test-v44`/`v57` | the ladder is 250 × 1.5ⁿ, tenth 9,611 | **note 31** | 400 × 1.5ⁿ, tenth 15,377 |
| `test-v57` | `renownCapPct` is a per-copy 0.08 | **note 31.1** | the CULTURE twin keeps Kittens' Ziggurat 0.08, which is what made the shape defensible |
| `test-v57` | Poppy's prose excludes Renown by family | **note 45** | the MECHANISM — the guard is the family, never a name — is still asserted; the prose stopped saying so |
| `test-v54` | Caitlyn opens cargo tiers early, +10% chance | **notes 21, 22** | deleted; Twitch owns cargo slots outright |
| `test-v45` | `CAP_MULT_EXEMPT` is `{ vigor, knowledge }` | **§29** | the invariant, unchanged |
| `test-v32`/`v36` | Lunari Vigil ×1.25 on the devotion cap | **note 16 / §29** | the fixtures now BUILD Shrines, and assert that a settlement with none sees no change at all — which is the slice property |
| `test-v38` | Renown income is UNCHANGED by removing cooldowns | **note 31.3** | re-pointed to the deed rate, so it still catches an unintended change while permitting the intended one |
| `test-v53` | the Arcanist's Circle spends `× 14` | **§1.1** | read from `TRANSMUTE_COST` rather than pinned |
| `test-v49` | the caravan tooltip lists ≥4 lines | **note 5** | one line per **revealed** slot |
| `test-v55`/`v56`/`v57`/`v58`/`v53`/`v54` | `VERSION` matches `/^v0\.\d\d$/` | **`OFF-CYCLE-PROTOCOL.md` §1** | the shape admits a point release; asserting a literal is what §10 exists to prevent |

---

## 6. Pacing — one full-rigour gate, three seeds, run concurrently

**One full-rigour gate, three seeds, 2,500 game-years, run concurrently in 5,376.5 s.**

### 6.1 The pass-condition table

| condition | shape | verdict | measured |
|---|---|---|---|
| Rites of Targon before y75 | median | **PASS** | median **66.7** (66.7 / 61.4 / 69.1) |
| First Ascent occurs | all-seeds | **PASS** | 72.8 / 68.5 / 78.1 |
| First champion before y120 | max | **FAIL** | worst **140.9** (100.5 / 140.9 / 96.2) — §6.4 |
| peak population in the 150–220 band | median | **PASS** | median **213** (214 / 213 / 205) |
| Sparks before y500 | max | **PASS** | worst **178** |
| **morale 90–140 band ≥80% after y60** | single | **PASS** | **100 / 99 / 100** — v0.58's failure, fixed |
| morale not pinned above 140 after Era 3 | single | **PASS** | 0 / 1 / 0 |
| Chemtech → Hexcore under 400 y | max | **FAIL** | worst **475.3** (475.3 / 365.2 / 177.5) |
| Convergence at Sparks ≥ 1% | median | **FAIL** | **0 on all three seeds** — §6.3 |
| cheapest trade affordable at Sparks | single | **PASS** | true / true / true |

**7 of 10 passing.** Three fail and all three are attributed below.

### 6.2 Headline pacing, against v0.58

| figure | v0.58 | **v0.58.1** | spread |
|---|---|---|---|
| **Era 3** | 1,403.9, Icathia on **2 of 3** | **907.1, Icathia on 3 of 3** | **×1.02** |
| peak population | 108 / 140 / 128 → median **108** | **214 / 213 / 205**, median **213** | — |
| morale band | 76 / 72 / 98 | **100 / 99 / 100** | — |
| tenth champion | 2 of 3, y1,446–1,655 | **3 of 3, y898–1,064** | ×1.18 |
| 130 wanderers | 1 of 3, y1,717 | **3 of 3, y925–1,071** | ×1.16 |
| firstTrade | ×1.94 | **×1.21** (175.8 / 213.1 / 184.2) | **×1.21** |
| trades | 111,187 | **237,476** | — |

**Era 3's spread is ×1.02, the tightest this project has ever recorded**, and Icathia, the tenth
champion and 130 wanderers now land on **every** seed rather than one or two.

**But Era 3 itself has fallen OUT of its 1,400–2,300 target band on the LOW side — 1,403.9 →
907.1 — and that is the round's largest unasked-for consequence.** No single note did it; the
aggregate did. The Manufactory's yearly autocraft is the biggest term (45 copies turning out
beams, slabs, gears and plating every year opens the crafted-goods economy — `seenMax.hexgear`
goes from 58 to 3.1M, because the bot can finally afford to craft it), with the star shard, the
ceiling-scaled Rift Scuttler, festival gold and a doubled trade count behind it. **The rates
themselves are exactly as designed** — measured directly: 11 Chem-Forgeworks pay 44 hexgear a
game-year and 45 Manufactories 180 parchment, both to spec. This is throughput, not a runaway.

**This is precisely what `OFF-CYCLE-PROTOCOL.md` §5 warns about** — an off-cycle round is
justified by feel, and feel does not have a pacing budget. **It needs a ruling, not a fix from
me**, because every one of the contributing notes is doing what it was asked to do.

### 6.3 Convergence reads 0 on all three seeds, and the cause is two notes meeting

Not a worship shortage — **worship at Sparks is 11,326 against a floor that needs 1,000.** The
Convergence *revelation* is simply not researched by Sparks, and two of Jerry's notes put it out
of reach together:

- **note 6.1** raises its devotion cost **400 → 3,000**;
- **note 16 / §29** removes the entire devotion cap multiplier stack (**×10.36 → ×1.00**), so the
  devotion ceiling is buildings-only.

Each is correct alone. Together, a 3,000-devotion revelation cannot be banked by y157. **Note 6.1
asked for exactly this** — *"it should force players to build more religion buildings to unlock
the benefits of these revelations"* — so the mechanism is working; what has not moved with it is
the **pass condition**, which was written in v0.58 when Convergence cost 400 devotion against a
ceiling ten times higher.

**I have NOT re-based it.** That is the trap `pacing.mjs`'s own Convergence ruling names by name,
and the honest options are Jerry's: keep the condition and accept that Convergence is a late-game
revelation now, or move the measurement to a later milestone than Sparks.

### 6.4 The other two failures

**First champion, worst 140.9 against a y120 ceiling.** Note 31 raises the recruit base 250 → 400
*and* note 31.3 cuts deed income to 34%, both pushing the same way. The note asked to make
champions *"a little harder to get at the start"*; on one seed of three it went past the ceiling.
The median is 100.5 and two seeds are comfortably inside — this is a `max`-shaped condition doing
its job, and the lever if Jerry wants it back inside is `RENOWN_DEED_RATE` rather than the base.

**Chemtech → Hexcore, worst 475.3 against 400, on a 177.5 / 365.2 / 475.3 spread.** The gap
*widened* while Era 3 overall got 497 years shorter, which means it is a sequencing artefact
rather than a slowdown: Hexcore lands at 519–820 across seeds (×1.58 spread, the widest figure in
the run) while Chemtech is tight at ×1.11. Worth the analyzer's attention as a spread problem,
not a pace problem.

### 6.5 What the round's own additions measured

| | result |
|---|---|
| **Manufactories** | **31 by Hexcore, 45 at end, all three discoveries bought.** Note 48 is live and load-bearing, not a shipped ornament |
| Chem-Forgeworks (v0.58) | 5 at Icathia, 11 at end |
| **Renown, note 31.2's hard constraint** | ceiling **182,196** against a largest single purchase of **23,066**, and **10/10 champions recruited** |
| Scholarship line after §29 | 5/5 rungs, ×2.60, reaching **renown alone** |
| culture cap-out | **96.4%**, still `lumpy-only` with 29 lumpy sinks — §24's classification survives a ×6.43 → ×1.20 ceiling cut, which is the prediction §29 recorded |

---

## 7. The suites and the ledger

**28 live suites, 1,436 assertions, 0 failures.** `tests/test-v581.mjs` is new and carries 95
assertions — **one block per note, in the order the notes were issued**, so verification can be
checked against `docs/specs/rr-devnotes-v0.58.1.md` line by line.

Three assertions in it are worth naming because they guard properties rather than figures:

- **note 31.2 as a HARD constraint** — the renown ceiling must clear the largest single purchase
  without any Scholarship, and the cumulative ladder with it.
- **the §29 invariant** — exactly one cap family per capped resource, by enumeration, after a
  membership change that touched two closed rulings.
- **note 48's inert-by-construction property** — an unfuelled Manufactory produces nothing, which
  is the behaviour that makes a fuel a real constraint rather than flavour.

**`docs/PARITY-LEDGER.md`: 226 rows — PARITY 57, EASIER 41, HARDER 2, UNVERIFIED 126.** Four new
rows for the Manufactory and its discoveries, and **three standing divergences re-rated HARDER**
because this round made them so: the wanderer rank ladder (note 11 takes the Challenger parity
debt from 27.8% to 102%), the Festival, and the Renown economy. `OFF-CYCLE-PROTOCOL.md` §3 is
explicit that a note does not need a Kittens citation to ship — Jerry's directives override the
spec — but anything it adds or re-rates still needs its row.

---

## 8. Files

| file | change |
|---|---|
| `index.html` | all 48 notes; `VERSION` |
| `sim/simcore.mjs` | `manufactory` in `BUILD_ORDER`; Manufactory instrumentation |
| `sim/pacing.mjs` | Manufactory counts and its discoveries in the milestone readout |
| `tools/parity-ledger.mjs` | four new rows, three re-rated divergences |
| `tests/test-v581.mjs` | new, 95 assertions, one block per note |
| fifteen historical suites | 38 assertions re-pointed, none deleted (§5) |
| `STANDING-RULINGS.md` | **§29**, amending §22 and §23a by name |
| `docs/analyzer-status.md` | the cycle table, six rounds stale, corrected |
| `docs/gameplay-notes.md` | all 48 struck through and cited |
| `docs/specs/rr-devnotes-v0.58.1.md` | the notes as issued, moved from the repo root on ship |
| `current-build-spec.md` | **deleted** — a consumed duplicate of the archived v0.58 spec |
