# Analyzer status — Runeterra Reclaimed

Standing status for the Analyzer cycle. Read alongside `STANDING-RULINGS.md` (closed rulings,
do not re-litigate) and the latest `docs/HANDOFF-v0.NN.md` (the map of the shipped build).

**Always-read tier**, at the start of every session before any other work: `rr-current-state.md`
(in the claude.ai project), `current-build-spec.md` at the repo root **if one is present**, and
`BUILDER_PROTOCOL.md` at the repo root (the two-tier verification cadence — cheap single-seed
check per spec part, full multi-seed suite once at the end, never the full suite per part).
Also `OFF-CYCLE-PROTOCOL.md` when the round is being built from Jerry's gameplay notes rather
than from a spec.

**`current-build-spec.md` is present ONLY while a spec is awaiting a builder.** The round that
consumes it *moves* it to `docs/specs/` — it is never copied and left behind. If the file is at
the root and the cycle table below says no spec is pending, the file is a leftover and the
table wins.

---

## Where the cycle is

| | |
|---|---|
| Last shipped build | **v0.63**, tagged `v0.63` — the per-rung discovery cap, steel-is-iron, and **STANDING-RULINGS §32: the simulator has ONE random stream** |
| Previous build | **v0.61**, tagged `v0.61` — the converter stack decomposed, the RR-ORIGINAL backlog discharged |
| Last consumed spec | **`docs/specs/rr-analyzer-v063-spec.md`** (consumed by v0.63; moved out of the root) |
| Last consumed dev notes | **Jerry's eleven v0.63 notes plus the Automated Workshop NaN note**, in `docs/gameplay-notes.md` |
| Current spec, awaiting a builder | **NONE — v0.63 is shipped and the next spec is not written.** **THE ROUND'S GATE FAILED: Icathia on 1 of 3 seeds (Parts 1+2 build) and 2 of 3 (shipped build), against a condition of 3 of 3.** The diagnosis is in BUILD REPORT v0.63 §0 and it is **population, not knowledge** — the seed that finishes is the seed inside §27's 150-220 band. **The next round should be about population and should MEASURE what caps it before proposing anything** (HANDOFF §6). |
| Live suites | **33 suites, 1,737 `check()` call sites, 1,786 assertions, all passing** under `node tools/run-suites.mjs --selftest`. `tests/test-v62.mjs` is new, 84 assertions. |
| **PARITY LEDGER — FINISHED** | **225 rows — PARITY 87, EASIER 117, HARDER 21, UNVERIFIED 0.** Every row carries a verdict argued or retrieved against `c52985b`. **The next parity work is MAINTENANCE, not discovery**, and both generator guards (RR-ORIGINAL+UNVERIFIED, and UNVERIFIED without a recorded retrieval attempt) are load-bearing now that the set is empty. |
| **THE KNEE AUDIT — the round's finding, and a live player-facing bug** | `limitedDR(x, L)` is linear only below **0.75·L**. Measured on a maxed state: **vigor carries raw Σ 4.581 into a cap of 1.0 and delivers 0.985 — 78.5% discarded**, so a +25% vigor upgrade pays about +0.4%. **Devotion discards 52.4%.** Every boost tooltip now reports its DELIVERED value; the readout prints all seven families at every milestone. **NO `BOOST_LIMIT` VALUE MOVED — §16 makes that Jerry's.** |
| **TWO FAMILIES SIT EXACTLY ON THEIR KNEE** | **crystals Σ 1.4999 against knee 1.5000** and **mana Σ 0.750 against knee 0.750** (after Part 4.2 deleted the fourth rung). **The next boost to either, of ANY size, is the first that will not pay in full.** `test-v62` asserts crystals against its knee, so the next round that adds one trips a test rather than a player. Gold is next at 92%. |
| **`TRADE_YIELD_LIMIT` — REMOVED, and v0.61's justification WITHDRAWN** | That round called the trade→transmute cycle "an unbounded resource loop" and capped yield to contain it. **Kittens has the same cycles** (lizards buy minerals sell wood; sharks buy iron sell catnip) **and ships the same base-resource craft** (`wood ← catnip`). What bounds the source's loops is a **per-trade tax in resources the cycle does not produce** — `baseGoldCost: 15`, `baseManpowerCost: 50`, charged flat — **and RR already had it.** Measured: **15.6 sustainable trades/game-year at Sparks, 47.1 at Hexcore, bound by VIGOR.** A loop gain above 1 in a CAPPED resource means timber sits at its ceiling, not unbounded resources. **If the guard ever stops binding, the fix belongs to the TAX, not the yield.** |
| **§31 — its PREMISE IS RETRACTED (§31.2a)** | The "×9.3 the source's" figure compared **RR's whole stack against ONE Kittens category** — the third instance of that conflation in three rounds. **Kittens' full chain (`game.js:3390–3540`) has ~14 multiplicative steps; RR has ~11. RR is slightly UNDER, not over.** The four-category proposal rests on a premise that no longer holds. **Nothing collapsed. Until Jerry rules, no round may add a new multiplicative category.** |
| **A PRICE DENOMINATED IN SOMETHING THAT PLATEAUS STOPS BEING A PRICE** | **Second instance of one bug shape in two rounds.** The festival cost `60 × pop`; population plateaus near 200 while the provisions ceiling grows **×11.3**, so it cost 15% of the ceiling at Sparks and **1.3% at Icathia.** Now `FESTIVAL_PROVISION_PCT × computeCaps().provisions`. **Check every remaining flat or per-head price against the ceiling it is meant to bind.** |
| **The crystal sink was on the wrong FOOTING, not too small** | Three rounds raised `MANUFACTORY_FUEL` and none moved the stock, because the Refinery's output is multiplied ×92 and the Manufactory's input was FLAT. The research sink is **0.02% of the faucet** (66.8M produced against ~14,000 spent over 2,500 years). **The burn goes DOWN to 0.024 — Kittens' own `calciner` anchor, 1.2× an `oilWell`'s output — and takes the same multiplier the yield takes.** Scoped to the fuel line only: inputs-flat is the source's asymmetry everywhere else. |
| Storage | **Part 3 is the round's largest single pacing term.** The Storehouse already copied Kittens' barn value for value and **did not move**; the Warehouse had timber ×2.00, ore ×1.20 and **gold ×8.00** of it where the source runs ×0.75 / ×0.80 / ×0.50. Shipped at **150 / 200 / 5**, steel kept at 100 with the argument (the source's warehouse WINS on the late metal). Harbor **ore 500→950, gold 200→25**. |
| Cap families | **TWO.** `capFamilyOf()` returns `exempt` / `masonry` / null. |
| §30 | Reserved ids: `runestone`, `hunterLodge`, `lumberCamp`, `petricite`, `tavern`, `bloomery`, `refinedMetallurgy`, `kindling`, `championsRegimen`, `deepCartography`, **`petriciteResonators`** (deleted one round after it shipped, on a reversal by the same author; **a save holding it is REFUNDED**). |
| **Kittens retrieval** | **CLONE THE SOURCE.** `github.com/nuclear-unicorn/kittensgame` @ **`c52985b`**. Do not use grep.app. |
| Machine note | **`nproc` = 2.** Give the ensemble the box; the suite runner alongside it roughly doubles both. Launch long runs with `setsid nohup … & disown`. |

**The cycle table was six rounds stale before v0.58.1 and is corrected here.** It had been
carrying v0.58's suite and ledger counts from v0.57 (26/1,273 and 220 rows) and an Era 3 figure
from v0.57 (1,734.6, ×1.07) as though they were current. Both were superseded at v0.58 and again
at v0.58.1. **The rule that keeps this honest: this table is updated by the round that ships,
in the same commit, and its numbers are the ones that round measured — never inherited.**

**Off-cycle rounds and what to ask of them (`OFF-CYCLE-PROTOCOL.md` §5).** v0.58.1 was justified
by how the game *felt* to Jerry, not by a Kittens rung, which is legitimate — he is the designer.
It means the next analyzer pass should explicitly re-check every number this round moved against
its Kittens counterpart and record the verdict. **Two of the notes were themselves parity fixes
and are the place to start: notes 15 and 16 cut the culture and devotion ceiling multipliers to
the source's magnitudes.**

## THE CHARTER — read this before any balance argument (STANDING-RULINGS §16, ruled by Jerry v0.55)

**Kittens parity of timing and scale is now the project's primary goal.** Everything in RR
should unlock at a comparable rung and run at a comparable scale to its Kittens counterpart.

- **The source is the balance authority; the simulator is an instrument.** A proposal is
  justified by a Kittens rung, cost, ratio or rate with a file citation — not by what the greedy
  bot did with it. Pacing runs still ship and every milestone condition still stands, but a bot
  measurement is **evidence about the instrument, not a balance argument**. "The bot never builds
  it" remains a reason to check the apparatus; it is no longer a reason to change a price.
- **Every RR-original item carries a parity label** — EASIER or HARDER, with the reason, in
  `docs/PARITY-LEDGER.md` (v0.55 Part 1). Jerry's null hypothesis: RR-original content usually
  makes the game easier or quicker, so an unlabelled RR-original item is a suspected speed-up.
- **Port the mechanism and the rung; assign by role.** v0.52 Part 1.2 put Kittens' Aqueduct
  figure on the wrong RR building and had to undo it.

**The lookup that makes this cheap, established this pass: RR's tech ladder is a near-verbatim
transliteration of Kittens' science costs** (30 / 100 / 300 / 500 / 500 / 900 / 1000 / 1300 /
1500 / … / 12000 / 15000 / … / 65000 / 75000 / 100000 / 115000 / 135000). **Rung-matching is a
lookup, not an estimate** — where a Kittens building unlocks at science N, its RR analogue
belongs on RR's N-knowledge rung.

### The headline finding of the v0.55 analysis

**RR's food economy is exactly one-tenth of Kittens', and its internal ratio is already at
perfect parity.** Kittens: farmer 5.000/s, consumption 4.250/s, ratio **1.17647**. RR: farmer
0.500/s, `CONSUMPTION` 0.425/s, ratio **1.17647** — identical. **The one term off that scale is
the Farmstead**: Kittens' catnip field is 0.625/s, RR's is 0.14/s where its own scale wants
0.0625 — **2.24× too strong**, on the cheapest building in the game at ratio 1.12, of which the
bot owns sixty. That, plus farmers being season-proof while the season table is already at exact
parity (winter 0.25), is why Deepwinter does not bite. It was never the eating rate.

### Two directives whose Kittens rung is now exact

- **Petricite Masonry 9,500 → 65,000** — Kittens' `quarry` is unlocked by `archeology`
  (65,000 science + 65 compedium). The quarry's *cost* is already at exact parity and is pinned
  by STANDING-RULINGS §5; only the tech moves.
- **The Irrigation Channel `mining` (500) → the 1,500 rung** — Kittens' `aqueduct` is unlocked
  by `engineering` (1,500 science). RR already copies the cost, ratio and figure exactly.

### Unresolved, and recorded as unresolved

**Does Kittens' season modifier reach the farmer job's catnip, or only the field's
`catnipPerTickBase`?** `js/village.js` shows no season term in the farmer's path; `js/game.js`
404'd at the path tried; the wiki's skill page does not cover it. Jerry's directive stands
either way — but the answer decides whether "farmers take the season" is a **parity fix** or
RR's first item labelled **HARDER than source**. Resolve against the raw file.

**Kittens' skill-experience increment could not be located** in `js/village.js` (reads and
save/load only). RR's is `w.jx[w.j] += dt` — **1 xp per second worked, Challenger in 3.19 real
hours of single-job work**. The rank *thresholds* are already close to source in shape and
exactly at parity at the top (0.1875). Locate the increment before setting a rate, or ship an
interim labelled UNVERIFIED — do not invent a citation.

### v0.62 spec revised — the Targon note corrected, and three new changes

**I read dev note 12 wrong and Jerry corrected it. There are TWO pale objects in the Targon scene
and I conflated them:**

- **`index.html:9898–9906` — the crescent moon**, off to the right at `(212, 26)` radius 11, clear
  of the mountain, added at v0.58.1 note 37 on Jerry's own instruction. **KEEP. My first draft told
  the builder to delete it.**
- **`index.html:9913` — `px(cx - 4, groundY - 28, 8, 4, PAL.text)`**, an 8×4 filled rectangle
  sitting directly above the summit. **THIS is the "square moon", and it is the whole of the
  note.** It reads as a square because at this resolution it is one.

The golden halo goes in the square's place, and it has to share the frame with the pulsing light
shaft at `:9915` — **offset the phases or the two will strobe together.**

**Three further changes, all researched against the shipped code:**

- **Jarvan (Part 6a).** `villageMult` (`:5795`) reaches **three of the eight assignable jobs** —
  farmer, woodcutter, miner. `loremaster`, `arcanist` and `tinkerer` get nothing from Demacia's
  Standard and `jungler` and `acolyte` are not in the job table at all, so a knowledge or devotion
  settlement gets no value from him whatsoever. **`JARVAN_VILLAGE_LEAD 0.12 → 0.06` applied to all
  eight** is roughly neutral in total output — about `0.12 × 0.55` today against `0.06 × 1.00`
  after — and materially different in shape. His passive goes `base: 25 → 15` (`:1528`), **and the
  description string carries a hard-coded 25 that must be generated**, which is the third
  literal-drift defect this project has had. **v0.61 rated Jarvan PARITY-of-magnitude against
  Kittens' 20-Academy `skillXP` line on a ×1.97-vs-×2.00 coincidence; at base 15 that becomes
  ≈×1.58 and the row must be re-rated in the same round.**
- **Crest of Cinders → the workshop banner (6.4).** `SCENES.crafting` (`:9821–9841`) draws the
  anvil and hammer procedurally; a faint red glow keys off the same `simNow() < S.cinderUntil`
  expression used at `:5689`.
- **Crest of Insight → the lore banner (6.5).** The bookshelves and lamps are **sprites** drawn by
  `drawLoreSprites()` (`:9626`) on a separate canvas, so the lights must take their positions from
  that function's own `leftX` / `rightX` geometry and **the layer has to be chosen deliberately** —
  drawn in the scene they sit behind the shelves.

**Both Crest changes are asserted by holding the buff, reading the canvas, expiring it and reading
again — never by grep.** That is the v0.61 §3 lesson: the festival chip's assertion grepped for a
string and passed for two rounds while the feature never fired.

## v0.63 — the analyzer's verification pass

**Verified from a fresh checkout at the `v0.62` tag, from disk.**

**Everything reproduces.** Thirty-three suites parsed from their own `SUITE-END` trailers: **1,786
assertions passed, 0 failed, no missing trailer, no skipped call site, no non-zero exit.**
`tools/parity-ledger.mjs`: **225 rows — PARITY 87, EASIER 117, HARDER 21, UNVERIFIED 0. THE LEDGER
IS FINISHED.** Every v0.62 part shipped, including the Warehouse at `timber 150 / ore 200 / gold 5`
and the Harbor at `ore 950 / gold 25`.

**The report's own verdict — "the round is too harsh, 4 of 10 gates fail" — is right, and the
cause is not where builder note 1 places it.**

### Dev note 1 confirmed, and the divisor is at parity

**Jerry's claim is right and close.** A join of Kittens' 171 workshop upgrades against the techs
that unlock them: **139 (81%) carry a science cost**, and the **per-upgrade ratio to its rung has
a median of 0.90** — `rotaryKiln` ×1.04, `factoryRobotics` ×0.71, `offsetPress` ×0.87, `petri`
×0.76, exactly his examples. **Total upgrade science per rung: median 2.43×.** The builder's own
note says RR sits at "2.4 × the rung's own price". **That is the source's figure to two
significant figures, and halving the divisor to 0.4 × K would move away from parity.**

**RR's whole-game burden is one fifth of the source's, not more.** Read from the mutated
`UPGRADES` array — the rule is a load-time IIFE at `index.html:3213–3214` that **a literal grep
does not see**:

| | RR v0.62 | Kittens |
|---|---|---|
| discoveries carrying knowledge | 32 of 78 | 139 of 171 |
| **discovery K ÷ tech K** | **0.099** | **0.50** |
| per-rung burden, median | 1.60× | 2.43× |

**The overshoot is ONE RUNG.** Every tech from `hexdraulics` (50,000) up carries zero; all 22 set
members sit at or below `sparks`. **`ritesOfTargon` carries 68,800 — 5.73× its own rung and 48% of
all discovery knowledge in the game — and `Rites of Targon` is one of the four failing gates**
(median 76.0 against <75).

**v0.63 Part 1 caps the per-rung burden at Kittens' own median 2.43× instead of cutting the
divisor**: −34% total, −58% on the offending rung, every compliant rung untouched, and the
per-upgrade ratio stays at the source's 0.80.

### Dev note 11 settles the one figure v0.62 could not derive

**Steel ≡ iron.** Kittens: barn `ironMax 50`, warehouse `ironMax 25` (0.50), harbor `ironMax 150`.
RR: **the Storehouse has no steel line at all** (should be 50), **the Warehouse has 100** (should
be 25 — currently 4× the source's relationship), and **the Harbor's 150 is already exact parity.**
Part 2 is the one storage change that *relieves* the round.

### Two notes describe things that already shipped

- **Dev note 7 — the Targon halo exists** (`index.html:10368–10378`). It cannot be seen because
  it is drawn in `PAL.goldBright` centred at `(cx, groundY − 26)`, which is **the exact apex of
  the gold peak at `:10342`, in the identical colour.** A gold ring on a gold peak. **This is a
  visibility fix, not a missing feature — telling the builder to add a halo would produce a
  second one.**
- **Dev note 6 is half shipped.** `JARVAN_XP_PASSIVE = 15` is generated, but `index.html:1595`
  still reads *"every worker in the village produces 12% more"* against a shipped
  `JARVAN_VILLAGE_LEAD = 0.06` — **and the wording still describes the three-job scope the same
  round widened to eight.** Third literal-drift defect in three rounds; Part 4 ships a general
  guard.

### The box event's rate has no ceiling

`index.html:6694` — `jackboxes × 0.0002` per tick, linear and uncapped: **one event every ~50
seconds at 20 boxes**, each writing a chronicle line. **The same building's morale term IS bounded**
(`strictDR(…, MORALE_BOX_LIMIT)`, `:5701`). The spam is the symptom; the unbounded rate is the
defect.

### Not measured this round

**The three-seed ensemble was launched at the start of the session and had not finished at
hand-off.** Every Era-3 and milestone figure in the v0.63 spec is v0.62's own, labelled as such.
**v0.62 lost two ensembles to container restarts before one completed at 48 minutes — budget three
attempts.**

## v0.62 — the analyzer's verification pass

**Verified from a fresh checkout at the `v0.61` tag, from disk.**

**Everything reproduces.** Thirty-two suites parsed from their own `SUITE-END` trailers: **1,703
assertions passed, 0 failed, no missing trailer, no skipped call site, no non-zero exit.**
`tools/parity-ledger.mjs` re-run: **226 rows — PARITY 81, EASIER 105, HARDER 15, UNVERIFIED 25**,
triage **RETRIEVABLE 25 / RR-ORIGINAL 0 / GENUINELY OPEN 0**, exact. **Every v0.61 part shipped.**

### The trade loop: Kittens has the same cycles, and a different guard

**v0.61 §5.2 calls the trade→transmute cycle "an unbounded resource loop" and ships
`TRADE_YIELD_LIMIT = 3.0` — a ceiling the source does not have — to contain it. The premise does
not survive the source.**

- **Kittens' trades form cycles of exactly this kind**: `lizards` buy minerals → sell wood;
  `sharks` buy iron → sell catnip; `nagas` sell minerals; `griffins` sell iron.
- **Kittens ships the raw-producing craft too.** A census of its whole craft list returns
  **exactly one craft whose output is a base resource: `wood ← catnip`.** RR's transmute is that
  craft. **None of RR's three legs is unprecedented.**
- **What bounds the source's loops is a per-trade tax in resources the cycle does not produce** —
  `baseGoldCost: 15` and `baseManpowerCost: 50` (`js/diplomacy.js:10–11`), deducted **flat**
  (`:885–886`) while only the `buys` resource scales with volume and only the *yield* scales with
  `tradeRatio`.
- **RR already has the identical guard and nobody costed it.** Both legs charge `vigor 175` and
  `gold 45–68`; the cycle yields steel, mana and timber and **no gold and no vigor**.

**So G > 1 means timber stops being a constraint — and timber is capped, so it sits at its
ceiling. It does not mean unbounded resources.** v0.62 Part 1 measures the guard and, if it binds,
removes `TRADE_YIELD_LIMIT` and ships the source's uncapped form, which is what dev note 8 asked
for.

### The `BOOST_LIMIT` knee audit nobody had run

`limitedDR` is linear only below **0.75·L**. Measured by instrumenting `limitedDR` through one
`computeRates()` on a fully maxed state:

| family | L | knee | raw Σ | delivered | % of knee | thrown away |
|---|---|---|---|---|---|---|
| **vigor** | 1.0 | 0.750 | **5.571** | 0.988 | **743%** | **82%** |
| **devotion** | 2.0 | 1.500 | **5.024** | 1.938 | **335%** | **61%** |
| **mana** | 1.0 | 0.750 | 1.465 | 0.935 | 195% | 36% |
| provisions | 1.5 | 1.125 | 1.300 | 1.244 | 116% | 4% |
| **crystals** | 2.0 | 1.500 | **1.494** | 1.494 | **99.6%** | 0% |
| gold | 1.5 | 1.125 | 1.031 | 1.031 | 92% | 0% |
| culture | 2.0 | 1.500 | 0.387 | 0.387 | 26% | 0% |

**Which bites next: crystals, 0.006 from its knee.** Gold is second at 92%.

**And two families are far past it. Vigor carries a raw Σ of 5.571 into a cap of 1.0 and delivers
0.988 — 82% of every vigor boost in the game is discarded**, so a +25% vigor upgrade pays roughly
+0.4%. Devotion discards 61%. **Same class as v0.61 §7.1's mana finding, three times worse, in a
family nobody was watching.** v0.62 Part 2 ships the readout and makes every effect string read
its **delivered** value; **no `BOOST_LIMIT` is changed** — that is Jerry's under §16.

### Storage: the Storehouse is exact parity and the Warehouse inverts the source

Kittens per copy — barn `catnip 5000 / wood 200 / minerals 250 / iron 50 / gold 10`; warehouse
`wood 150 / minerals 200 / iron 25 / gold 5`. **The warehouse is smaller than the barn on every
shared material** (ratios 0.75 / 0.80 / 0.50 / 0.50), winning only on titanium.

**RR's Storehouse copies the barn value for value** — provisions 5,000 / timber 200 / ore 250 /
gold 10. **RR's Warehouse gives timber 400, ore 300, gold 80 — 2.0×, 1.2× and 8.0× the
Storehouse.** Dev note 9 is exactly right and the fix is derivable from the source's ratios:
**timber 150, ore 200, gold 5.** The Harbor matches the source except **ore 500 (source 950)** and
**gold 200 (source 25)**.

### The crystal sink is the right shape and 0.02% of the faucet

v0.61's research sink moved crystals-at-cap 96.2% → 94.7%. The arithmetic: 33.4 crystals/s over
2,500 game-years is **66.8 million produced** against roughly **14,000 spent — 0.02%.** No
rung-scaled research price will ever move that. **The Manufactory failed for the same reason its
burn is flat while the Refinery's yield is multiplied ×92.** v0.62 Part 7 puts the burn on the
same multiplier footing as the yield, anchored to Kittens' `calciner` −0.024 against `oilWell`
+0.02 — a primary sink burns 1.2× a primary faucet, per copy. **`MANUFACTORY_FUEL` is not raised a
fourth time.**

### A correction the analyzer owes on §31

**My claim that RR's stack is "×9.3 the source's" compared RR's WHOLE stack against ONE Kittens
category** — the same conflation this project has now caught three times, and I made it one
message after flagging it. **Kittens' full production chain (`game.js:3390–3540`) has roughly
fourteen multiplicative steps**, not four: season, `GlobalRatio`, `Ratio`, `RatioReligion`,
`SuperRatio`, the steamworks hack, paragon, pollution, magnetos, reactors, Solar Revolution,
cosmic radiation, festival cycles, necrocracy. **RR has about eleven — slightly under the source,
not nine times over it.** v0.62 Part 8 amends §31 so Jerry rules on a corrected question.

### Aurelion Sol, for the record

`fireStarShard()` (`index.html:6678–6688`) is gated on `ritesOfTargon` and fires at
`STARSHARD_BASE_RATE 0.00006` per tick, scaled by `1 + strictDR(observatories × 0.12, 3.0)` — so
**once per 4.2 game-years at zero observatories, rising to once per 1.2 at a hundred**. It pays
`max(120, 6% of the knowledge cap)` and `max(80, 5% of the ore cap)`.

### Not measured this round

**The three-seed ensemble was launched at the start of the session and had not finished at
hand-off.** Every Era-3 and milestone figure in the v0.62 spec is v0.61's own, labelled as such.

## v0.61 — the analyzer's verification pass

**Verified from a fresh checkout at the `v0.60` tag, from disk.**

**Everything reproduces, and the new harness is the reason it can be said cleanly.** Thirty-one
suites parsed from their own `SUITE-END` trailers: **1,615 assertions passed, 0 failed, no
missing trailer, no suite executing fewer assertions than it has `check()` sites, no non-zero
exit.** `tools/parity-ledger.mjs` re-run: **226 rows — PARITY 72, EASIER 41, HARDER 2, UNVERIFIED
111**, triage **RETRIEVABLE 26 / RR-ORIGINAL 85 / GENUINELY OPEN 0**, exact.

**Every v0.60 part shipped**, checked by grep: `XP_PER_SECOND = 0.05`; `XP_CAP =
Math.floor(11500 * 20001 / 9000)` — the constant is now its own derivation; `RANKS` back to
Grandmaster 7,500 / Challenger 11,500 with gaps 2,700 / 4,000; `AUTOMATION_BASE = 0.02` driving
both `automationTrigger()` and `automationShare(n)` against `AUTOMATION_CAP = 0.90`;
`JOB_SHARE_BUDGET = 0.85` with a deficit-ranked pick; `tools/run-suites.mjs` and
`tests/_selftest-throws.mjs` present.

**Two spot-checks reproduced independently.** The bonus-matched ladder table of §10.1 — all six
ratios exact (×3.50 / ×1.60 / ×1.33 / ×1.16 / ×0.96 / ×1.28) — and the XP arithmetic
(11,500 / 0.05 / 3600 = **63.89 h**, `XP_CAP` **25,556**). §10.1's self-correction is sound and
the bonus-matched framing is the right one.

### The one number that does not decompose as described

**§2 reports the "converter-side stack" at ×19.77 and compares it to Kittens' `calcinerRatio`
×3.70, concluding RR runs ×5.3 the source.** Measured on a state with every upgrade, every drake
maxed and all ten champions at level 10:

| term | value |
|---|---|
| `clockworkBellows` × `bankedCoals` × `resonanceCoils` | **×1.7969** |
| `infernal` drake (`strictDR`, cap 0.5) | ×1.4950 |
| overseer affinity (5 champions × 2 × level, **level caps at 10**) | ×2.0000 |
| **`convMult` product** | **×5.3728** (×8.0590 with the transient cinder buff) |

**`convMult` cannot exceed ×5.373.** The ×19.77 is `convMult × (1 + boosts.crystals)` — **two
categories multiplied together** — while `calcinerRatio` is one. **Made like-for-like the finding
reverses: RR's three conversion Discoveries deliver ×1.797 against the source's ×3.70 — 49%, half
as strong.** The excess over the source is not in the upgrade line; it is two RR-original systems,
the infernal drake and the overseer champion affinity, multiplying on top.

**The real divergence is compositional and it is the same shape as the `boosts` finding:** Kittens
composes conversion strength as **one category of three upgrades**; RR composes it as **three
multiplicative categories plus a transient**. v0.61 Part 1 ships the term-by-term readout, makes
the three Discoveries additive, and ledgers the drake and champion terms as RR-original
categories with their measured ceilings.

### The early rank ladder is where the debt lives

**28% is the top rung and nothing else.** The debt narrows monotonically upward and is worst at
the very first rung: **Kittens grants +1.25% at 100 XP; RR first reaches it at 350 — ×3.50.** In
hours, **36 minutes against 1 h 57**. That is the first hour of the game.

**The cause is a rung-count mismatch, not a pricing decision.** RR spends its second rung (Silver,
100 XP) on +1.0%, *below* Kittens' first bonus, so the player must climb to Gold at 350 to match
what the source grants at 100. **RR's extra rungs are paid for out of the early game.** v0.61
Part 2 re-prices the low rungs and leaves the top one — Jerry's note 4 figure — alone.

### Retrieved this round

- **Kittens has NO trade yield maximum.** `js/diplomacy.js:744–747`: `tradeRatio = 1 +
  getTradeRatio() + policies + pacifism`, and `getTradeRatio()` (`:250`) is
  `getEffect("tradeRatio") + merchant leader` — **a plain additive sum, no DR, no ceiling**, with
  the tradepost at `tradeRatio: 0.015` per copy, unbounded in count. The only `Math.min` is inside
  the pacifism challenge (`js/challenges.js:326`). **RR caps it twice** — docks at
  `limitedDR(…, 1.0)` and caravans at `limitedDR(0.02n, 0.60)` — **and composes four categories
  multiplicatively against the source's one additive sum. RR is HARDER here.**
- **Jarvan's passive and Kittens' Academy land within 2% of each other by magnitude and differ in
  every other respect.** 20 Academies give `0.01 + 20×0.0005` = **×2.00**, additive into the same
  accumulator as the base rate; Jarvan at level 10 gives ≈ **×1.97**, multiplicative on the rate,
  from one champion. **Magnitude parity, shape RR-original** — and RR still has no building that
  accelerates learning, which is builder note 5's missing-content row.

### Diagnosed from code, for the dev notes

- **The Howling Abyss is a genuine outlier.** Renown per 1,000 vigor: **Abyss 41.67**, Raptors
  30.00, Sump Crawl 28.57, Wolves/Gromp/Krugs 20.00, Drake Hunt 16.67, **Baron 15.38**, Scouting
  4.57. The Abyss pays **2.7× the Baron's rate** and is a charge camp, so an empowered run pays ×3
  on top.
- **"Deeper cargo slots" tests the wrong property.** `index.html:8711` counts hidden slots with
  `!ttResKnown(sl.res)` — a **resource-visibility** test — while the sentence claims a
  **capability**. `slotAvailable(fid, i)` (`:4231`) already computes the capability. The two
  disagree exactly on *"can craft it, has not yet made one"*, which is Jerry's Piltover beam case.
- **The trade tooltip never mentions renown** although `TRADE_RENOWN = 1` has been paid since
  v0.59 (`showTooltip(btn, …)` at `:8671` builds its yield list from cargo slots only).
- **`holdFestival()` (`:4883`) grants no renown**, and **no faction cost includes provisions**
  (`tradeCost`, `:4263`).
- **The spelling is British and consistent** across `:8588` and `:3572`, so dev note 4 is a
  house-style change rather than a typo fix — worth doing in one pass across the file.

### A reversal Jerry should see stated

v0.60 §6 records his note 5 as **"hold the line on Mana"** and Σ0.75 was left untouched on that
basis. **Dev note 3 now asks for a fourth mana multiplier.** Both are his calls under §16 and the
later supersedes the earlier — but the number should travel with it: Kittens' `<res>GlobalRatio`
has **two members in the entire game (0.30, 0.25)**; a fourth RR member at 0.25 makes it **Σ1.00
across four**, against the source's two.

### Not measured this round

**The three-seed ensemble was launched at the start of the session and had not finished at
hand-off.** Every Era-3 and milestone figure in the v0.61 spec is v0.60's own, labelled as such.

### v0.61 spec revised — Jerry's four updates, and the category-count question

**All eleven dev notes from the previous round are in the spec**, with a mapping table at its
head so none can be lost. The four updates:

- **XP rate → 0.05/s: already shipped at v0.60** (`index.html:3235`). **But Jarvan cannot
  mitigate the early ladder and the arithmetic is not close.** One game-year is
  `0.2s × 10 × 100 × 4 = 800 s = 13.33 real minutes`. The first rank rung (350 XP at 0.05/s) is
  **1.94 real hours**; the first champion, at v0.60's three-seed median of y106, is **23.6 real
  hours** — and Jarvan is one champion of ten, so usually later still. **He arrives ~12× too late
  to touch the span the ×3.50 debt covers.** Part 2 stands.
- **Only one mana discovery on Sparks.** Confirmed: `leylineCalibration` is already
  `tech: "sparks"` (`:2293`), so the first draft would have put two there. The fourth rung moves
  to **Petricite Masonry** (`:1098`, 65,000 knowledge), cost `{ crystals: 400, hexgear: 25 }`.
- **The cargo-slot message was already specified** (Part 6.2) with the wrong test named.
- **Post-Sparks discoveries take crystals — new Part 10, and it is the best-shaped crystal sink
  the project has found.**

### The crystal sink, finally the right shape

**Measured: 33 discoveries sit on techs at or after Sparks and only 4 — 12% — cost crystals**,
three of them the Manufactory line. **Kittens prices 106 of its 171 workshop upgrades — 62% — in
a scarce converted or crafted resource** (titanium, unobtainium, eludium, alloy, blueprint,
starchart): `astrolabe` titanium 5, `titaniumMirrors` titanium 15, `unobtainiumReflectors`
unobtainium 75. **Titanium is produced the same way RR's crystals are** — a converter autoprod
output (`titaniumPerTickAutoprod: 0.0005` on the Calciner). **So this is the source's own
upgrade-pricing pattern, not an RR invention.**

**And it is the sink three rounds of fuel changes could not produce.** §24 says why: crystals are
a **stock with no lumpy sink**, and a smooth per-tick burn against a large faucet is a rounding
error at every scale — hence 96.2% time-at-cap after a ×6 on `MANUFACTORY_FUEL`. **A research
cost is lumpy by construction.** Part 10 requires crystals-at-cap reported before and after.

### The category-count question, measured — Part 11, ruling requested

**Jerry asked whether RR's multiplicative categories can be made additive.** Measured on a fully
maxed state:

| stack | product | collapsed to one additive category |
|---|---|---|
| `global` (monument ×4.30 · religion ×1.195 · policy ×1.00 · meta ×1.25 · buff ×1.00) | **×6.42** | ×4.75 |
| `convMult` (infernal ×1.495 · 3 Discoveries ×1.797 · overseer ×2.00) | **×5.37** | ×3.15 |
| **combined** | **×34.51** | **×14.92** — and ×6.89 if every factor collapses into one |

**The answer is that "make it additive" is the wrong target, because Kittens is not additive
either.** `game.js:3409–3440` multiplies four categories against each other. **Kittens' Law as
this project states it is literally the source's code.**

**The divergence is the CENSUS, not the principle.** In Kittens one or two categories are live
per resource — `<res>GlobalRatio` has 2 members in the whole game, `<res>SuperRatio` 1 — and the
usual single live category reaches **×3.70** (`calcinerRatio`) to **×5.35** (`barnRatio`).
**RR's combined ×34.5 is 9.3× the source's single live conversion category** — not because any RR
number is large (its three conversion Discoveries are at **49%** of the source's) but because
**RR gives each individual upgrade, drake, champion system and buff its own category. Kittens'
categories are kinds of effect; RR's are individual effects.**

**Grouping RR's eleven factors into four source-shaped categories gives ×20.20 — a 41% cut**,
falling entirely on the late game because early factors are all 1.0. **It would plausibly put
Era 3 back inside the 1,400–2,300 band retired at v0.59.** That makes it the largest pacing lever
anyone has proposed here, so Part 11 **ships nothing**: it records the measurement, asks Jerry to
rule the principle, and recommends the implementation get a round of its own with the ensemble to
itself.

## v0.60 — the analyzer's verification pass

**Verified from a fresh checkout at the `v0.59.1` tag, from disk.**

**Reproduces.** Thirty suites: **1,573 assertions passed, 0 failed.** Parity ledger exact —
**226 rows: PARITY 63, EASIER 41, HARDER 2, UNVERIFIED 120.** `VERSION v0.59.1`.

**Every v0.59 spec part shipped, checked by grep.** The Scholarship cap family is gone
(`SCHOLAR_CAPS`, `SCHOLAR_LINE`, `scholarMult`, `scholarCapNames` all zero hits;
`capFamilyOf()` returns only `exempt`/`masonry`/null); the Granary migration is deleted and
`granary` is a live id; the charge guard is gone and `gainRenown(empowered ? base * CHARGE_BONUS
: base)` is unconditional; `RENOWN_DEED_RATE` is **1.00**; the trickle is a flat **0.007** gated
on `callToArms`; `TRADE_RENOWN 1`; `ARCHIVE_RATIO_LINE` sums **0.06** and is consumed as
`1 + count("observatory") * archiveRatioTotal()`; `ASTROLABE_LINE`/`ASTROLABE_MULT 1.5` carry
`annotatedIndex` → academy and `livingLibrary` → hexLab; the `test-v581` §21 fixture zeroes both
resources before baselining.

**A near-miss worth recording as method.** I almost filed **Part 4 (Convergence) as unshipped**:
the printed readout is still keyed `convergenceAtSparks` and computed at the Sparks milestone.
It shipped — `sim/simcore.mjs:1383–1388` captures `convergenceAtUnlock` at the gate and
`sim/pacing.mjs:826` is what the pass condition reads. **Grepping the consumer rather than the
label is what caught it**, and it is exactly the failure mode the standing instruction names.

### Two suites die without failing, and every "0 failures" line in the round is wrong about them

**`test-v38` aborts at assertion 21 of 27; `test-v45` aborts at 43 of 59. Twenty-two authored
assertions never execute.** Both die by exception rather than by a failing `check()`, so the
counts are arithmetically true and materially misleading.

- **`tests/test-v38.mjs:251`** — `ReferenceError: CAMP_MAX_CHARGES is not defined`. The predicate
  is fine; the **message template** interpolates a game constant that lives in the browser page
  (`index.html:6634`) and does not exist in Node scope. **The suite dies formatting a string.**
- **`tests/test-v45.mjs:396`** — `const NEW = ["kindling"]`, then `byId[id].cost.knowledge` at
  `:408`. **v0.59.1 note 3 deleted `kindling`.** §7 of that report re-pointed twelve assertions
  for the ladder count moving 37 → 36 and missed this one, because it is not a count.

**This is a new defect class and it deserves a ruling: a suite that dies is not a suite that
fails.** §21 covers a test that measures a baseline it did not reset; this is its sibling. v0.60
Part 1 ships a `SUITE-END asserted=/passed=/failed=` trailer and makes a non-zero exit fail the
round even at `failed=0`.

### The bot's tinkerer policy exists — the report's diagnosis is wrong, and the real cause is general

The v0.59.1 report states *"the bot has no tinkerer policy at all. `manageJobs()` never staffs
one, in any round, at any population."* **It is at `sim/simcore.mjs:760`:**
`if (count("refinery") >= 1) want.push(["tinkerer", 0.05]);`

The measurement — zero tinkerers ever — is right. The cause is the loop: **`want` is an ordered
priority list, one assignment per call, with an early `return`**, so the last entry is reached
only when every earlier entry is simultaneously at or above its share. **Those shares sum to
1.06 of a population of 1.00** in both branches, and **no RR job defines `max()`**, so the
`continue` that could skip a saturated job never fires. **The tinkerer is unreachable by
construction, and so is any job appended to the end of that list.**

**Two rounds have now drawn a balance conclusion from an artefact of list order** — v0.57 Part 4
for farmers, and note 7 here. v0.60 Part 2 asserts `Σ shares ≤ 1.0` and changes the loop to pick
the job furthest below its share.

### `XP_PER_SECOND` IS FOUND, and it inverts the rank ladder's verdict

**Open since v0.55, across a documented list of dead retrieval routes. Closed in one grep
against a local clone.** `js/village.js:3228`:

```js
var baseSkillXP = game.workshop.get("internet").researched
    ? Math.max(this.getKittens() * hgSkillModifier / 10000, 0.01) : 0.01;
var skillXP = (baseSkillXP + game.getEffect("skillXP")) * times;
```

**0.01 XP per tick**, unconditionally before the Internet upgrade — and the `frequency`
machinery above it is a performance optimisation that preserves the rate exactly (`frequency` is
1 below 100 kittens; the block early-returns unless `ticks % frequency === 0`; then
`times = frequency`). **At 5 ticks/s the source rate is 0.05 XP/s. RR's 0.5 is ten times it.**

**The consequence is that the ledger's headline HARDER row is backwards:**

| | Kittens | RR | |
|---|---|---|---|
| top-rank threshold | 9,000 | 18,200 | ×2.02 harder |
| XP rate | **0.05/s** | 0.50/s | ×10.00 faster |
| **time to top rank** | **50.00 h** | **10.11 h** | **RR is ×4.95 FASTER** |

The rank ladder has been ledgered **HARDER, "the largest single parity divergence in the game"**
for two rounds on a threshold measured with the rate unknown. **It is EASIER by a factor of
five.** The ledger's own row anticipated this — *"a 102% threshold debt at an unverified rate is
one unknown multiplied by another"* — and recording the dead routes is what made it findable the
moment the method changed. **Re-rate by the product, not by either half.**

**And `XP_CAP` went stale in the same place.** 25,556 was derived at v0.56 as Kittens' cap ratio
`20001/9000 = 2.22233` applied to a top rank of **11,500**. Note 11 moved the top rank to
**18,200** and the cap did not follow: **25,556/18,200 = 1.404×** against the source's 2.222×.
The ratio-preserving figure is **40,446**.

### `factoryAutomation` retrieved: RR matches none of its three numbers

`js/workshop.js:1240–1250` (`effects: {}`, science 10,000 + gear 25) and the Steamworks'
`action()` at `js/buildings.js:1309–1318`:

| | Kittens | RR (`index.html:3409–3410`) |
|---|---|---|
| trigger | `value ≥ maxValue × (1 − 0.02)` = **98%** | `AUTOMATION_TRIGGER = 0.95` |
| share | `min(0.02 × (copies + 1), 0.90)` of the **stockpile** | `AUTOMATION_SHARE 0.05` × copies of the **ceiling**, unbounded |

**The trigger and the share are the same constant in the source**; RR split them into two
unrelated numbers. RR is ~2× the source at five copies (25% vs 12%) and unbounded past twenty
where the source caps at 90%.

### The mana boost census: the source has five production categories, not one

`game.js:3409–3440` is the whole production stack, and **Kittens' Law is literally this code** —
`getEffect` sums within a named category, categories multiply against each other:
`<res>JobRatio` (additive onto village production), then `<res>GlobalRatio`, `<res>Ratio`,
`<res>RatioReligion`, `<res>SuperRatio`.

**A full census of `js/*.js` at `c52985b`: `<res>GlobalRatio` has TWO declarations in the entire
game** — starchart 0.30 and unicorns 0.25. `<res>SuperRatio` has one (coal 0.20). `<res>Ratio`'s
268 declarations are keyed by **building/mechanism** (`barnRatio` Σ4.35, `warehouseRatio` Σ1.80),
not by resource.

RR's `boosts.mana` is **Σ 0.75** in one accumulator applied to buildings, jobs and converter
outputs alike. **Against the only category with the same scope it is 2.5–3× the source's
largest, and no Kittens resource has a stacked global production category at all.** Against the
source's *job* lines it is unremarkable (catnip Σ0.80 over two rungs) — **so the magnitude is
fine and the scope is not.** The v0.59.1 report's re-rating to EASIER is right; its stated
reason, *"Kittens does have global `<res>Ratio` upgrades"*, points at the **buildings** category
by mistake. The citation should be `game.js:3430` and the two-member census.

**The deeper item, named now:** RR has one `boosts` accumulator where the source has five
categories, so RR **cannot express "job-scoped" and "global" as different things at all**. That
is a structural divergence in its own right.

### The crystal arithmetic does not close, and nobody has decomposed it

Note 7 has been sized twice against the wrong quantity. **RR's converter block applies
`convMult` and `boosts` to outputs and nothing to inputs** (`index.html:5345`), so the
Manufactory's burn is flat per copy while the Refinery's yield rides the whole stack. **But 41
Refineries at `crystals: 0.02` is 0.82/s of base output, and `convMult` (~2.7–4) times
`boosts.crystals` does not multiply that into the reported 559/s.** Either a crystal faucet is
unenumerated or a multiplier is far larger than it reads. **v0.60 Part 3 ships the `track()`
decomposition first and forbids touching `MANUFACTORY_FUEL` until 559/s is attributed.**

The source's anchor for when the sizing does happen: **`oilWell` `oilPerTickBase: 0.02` against
`calciner` `oilPerTickCon: -0.024`** — a primary sink burns 1.2× what a primary faucet makes,
per copy. **Kittens has the same input-flat/output-multiplied asymmetry**; its production
multiplier is ×3.70 (`calcinerRatio` Σ2.70). **If RR's is two orders of magnitude, the
out-of-parity item is RR's conversion multiplier stack, not the fuel constant.**

### Method: clone the Kittens source

**Three lookups that multiple prior rounds recorded as dead fell to single greps against a local
clone of `nuclear-unicorn/kittensgame` at `c52985b`** — `XP_PER_SECOND`, `factoryAutomation`, and
the production-category census. **Pin the revision in every citation:** the Golden Spire block
earlier rounds cited as `js/buildings.js:1929–1931` is `:1964–1966` at this revision, same code.
This also reframes the 120 UNVERIFIED rows: much of that is not unverifiable, it is unattempted
under a retrieval method that no longer applies. v0.60 Part 8 triages them.

### Not measured this round

**The three-seed ensemble was launched at the start of the session and had not finished at
hand-off.** Every Era-3 and milestone figure in the v0.60 spec is v0.59.1's own and is labelled
as such. Budget 75–90 minutes.

## v0.59 — the analyzer's verification pass

**Almost everything reproduces, and two of Jerry's bug reports are real.** Verified from a fresh
clone at the `v0.58.1` tag, from disk.

**Reproduces exactly.** The parity ledger: **226 rows — PARITY 57, EASIER 41, HARDER 2,
UNVERIFIED 126**, summing correctly. `VERSION v0.58.1`. §29 as shipped delivers **culture ×1.05
and devotion ×1.00** on a fully-stacked state — exactly what Jerry's notes 15 and 16 asked for,
so `OFF-CYCLE-PROTOCOL.md` §5's first two re-checks pass. The rank ladder tops at **Challenger
18,200 / +0.1875**. `XP_PER_SECOND 0.5`, `XP_CAP 25,556`, `RENOWN_DEED_RATE 0.34`. Both audit
graphs zero.

**One discrepancy against the report.** The report claims **1,436** assertions, 0 failures; my
full sweep counts **1,435 passed** with **`test-v581` assertion 36 failing** — *"the Rift
Scuttler scales with max knowledge and max Vigor: FAIL +400 knowledge of 10000 cap, **+−9,996,500
vigor** of 3100"*. It passes 2/2 when `test-v581` is run alone. **The game code is correct; the
assertion is a §21 fixture defect** (`tests/test-v581.mjs:446–465`): it captures `v0 = S.res.vigor`
and measures a delta without resetting the resource it baselines, so an earlier block that leaves
vigor above the ceiling makes `gain()` clamp and the delta go hugely negative. `clickScuttler()`
itself is right — `SCUTTLER_KNOWLEDGE_PCT 0.04`, `SCUTTLER_VIGOR_PCT 0.06`, both floored, +186 of
3,100 on a clean state, which is exactly 6%. **The idle-box re-run is what hid it, which is the
precise remedy §21 exists to retire.** v0.59 Part 7.

### Jerry's eight directives, and two corrections to my own work

**Issued after the first draft of v0.59 and specified into Parts 2 and 5.** Every one was
measured against the game before being written up — a one-action-per-run live probe, fresh state,
all techs, pop 40, 30 Halls, renown seeded at 100:

| directive | action | renown delta | verdict |
|---|---|---|---|
| 1 — no renown from Ascent | `ascendTargon()` | **0** | **already true; ship no code** |
| 5 — none from first research | `buyTech`, `buyUpgrade` | **0 / 0** | **already true; ship no code** |
| 4 — +1 per trade | `tradeCaravan`, no leader | **0** | a real addition |
| 3 — hunts always pay | Wolves, 2 charges | **+1** | |
| 3 — hunts always pay | Wolves, 0 charges | **0** | **Jerry's bug, reproduced** |

**CORRECTION 1 — renown is not expedition-only, and I said it was.** `gainRenown()` does have
exactly two callers, but **there is a passive trickle at `index.html:5129`** that I missed
because it writes `rates.renown` directly: `0.005 × pop × (callToArms ? 1 : 0.5)`, gated on
`logistics`. Measured 0.200/s at pop 40. **Directive 2's flat 0.007/s therefore CUTS an existing
trickle by 14× at pop 20 and 100× at pop 140** rather than adding a new one — a fact Jerry should
have when he rules, and the spec states it in a table before specifying the change.

**CORRECTION 2 — `SCHOLAR_CAPS` has one member, not three.** The first v0.59 draft claimed
culture, devotion and renown shared a cap family with "three treatments" and called it a §22
violation. `index.html:2054` is `{ renown: 1 }`; culture and devotion are in `CAP_MULT_EXEMPT`.
**`capFamilyOf()` returns `exempt`/`exempt`/`scholar` — different families, one behaviour each,
§22 never violated.** The three measured multipliers were right; the structure inferred from them
was not. Retracted in place at spec §5.2.

**Two defects nobody had reported, found while sizing the directives.**

- **`RENOWN_DEED_RATE 0.34` collapses the low camp ladder to a constant.** With the
  `Math.max(1, Math.round(...))` floor, camps authored at 2, 3 and 4 renown **all pay exactly
  1**. Wolves, Gromp, Raptors and Krugs are indistinguishable. "Charges multiply the renown"
  cannot mean anything until this is fixed.
- **Renown backfills before the player ever sees it.** It is `hidden` until `callToArms`
  (`index.html:355`) but the trickle runs from `logistics` at 0.100/s into a cap of 30, so the
  resource **arrives pinned at 30/30 from a meter the player has never seen.** That is exactly
  the backfill directive 2 rules out, and it is live on the shipped build.

### The Kittens source is now a local clone, and it closed a four-round lookup

**Research this round was done against `github.com/nuclear-unicorn/kittensgame` at `c52985b`
(2026-08-04), cloned to disk — not grep.app.** Future rounds should do the same and **cite a
revision, not a bare line number**: the Golden Spire block earlier rounds cited as
`js/buildings.js:1929–1931` is `:1964–1966` at this revision, same code.

**Culture's ×1.05 is VERIFIED and the lookup open since v0.55 is closed.** Three rounds failed to
retrieve `cityOnAHill` through grep.app and correctly refused to invent a citation. It is
`js/science.js:1283–1297`, `onAHillCultureCap: 0.05`, price culture 4,000, consumed as a
**whole-cap** culture multiplier at `js/resources.js:958–961`. **Exact parity with RR's
`CULTURE_FIXED_MULT = 1.05`.** Ledger row moves UNVERIFIED → PARITY: **57→58 PARITY,
126→125 UNVERIFIED.**

**And the finding that grounds directive 8.** Kittens has exactly **one** whole-cap science
multiplier in the entire game and it is **a policy, not an upgrade** — `technocracy`
(`js/science.js:1067–1080`, `technocracyScienceCap: 0.2`, culture 150,000, mutually exclusive
with theocracy and expansionism). Every upgrade-shaped science boost is per-building: **Astrolabe**
(`js/workshop.js:1436`, `effects: {}`, all of its effect inside the Observatory's
`calculateEffects` at `js/buildings.js:672`, `scienceMax 1000 → 1500`) and the three **Reflectors**
(`titaniumMirrors` :1450, `unobtainiumReflectors` :1467, `eludiumReflectors` :1483, each
`libraryRatio: 0.02`, consumed at `js/buildings.js:579–580` as
`library.scienceMax *= (1 + observatory.on × libraryRatio)`). **So Jerry's instruction not to
raise knowledge caps from the Discovery line is the source's own division of labour, not a
departure from it.**

**RR already ships the Astrolabe.** `voidglassLenses` — *"Celestial Observatories hold +50% more
knowledge each"* (`index.html:2472`, implemented at `capMultPerCopy()`) is Kittens' Astrolabe at
**exact parity**. The builder must not re-ship it. What is missing is the Reflectors' *cross*-
building shape, and that is what spec §5.4 ports.

### The MAJOR BUG: `granary` is a reused id, and the migration eats it on every load

**Dev note 9 confirmed, root-caused, and demonstrated.** Seven Granaries and three Storehouses,
serialised and reloaded, come back as **zero Granaries and ten Storehouses**.

`index.html:6501–6505`, inside `loadFromString()`:

```js
var legacy = (fresh.buildings.granary || 0) + (fresh.buildings.runestone || 0);
if (legacy) {
  fresh.buildings.storehouse = (fresh.buildings.storehouse || 0) + legacy;
  delete fresh.buildings.granary; delete fresh.buildings.runestone;
}
```

This is the **v0.10-era migration that folded the OLD Granary into the Storehouse** — and
**v0.56 Part 3.4 shipped a NEW building on the same id `granary`** (`index.html:546–550`,
Kittens' `pasture` analogue, `provisions 100 + timber 10`, ratio 1.15, `eatCut 0.005`). The
migration has been eating it ever since. The cost is worse than losing the building: the count is
carried 1:1 into a far more expensive one, so the player simultaneously loses the `eatCut` they
bought and gains free Storehouse cap.

**Why no suite caught it, and this is the structural lesson.** `simcore` loads `freshState()`,
which has no Granaries, so `legacy` is always 0 and the simulator never touches the path.
`test-v56` asserts the Granary *exists*; nothing round-trips it through `serialize()` →
`loadFromString()`. **Every save migration in the file sits in the same blind spot.** v0.59 Part 1
ships the fix, a new standing ruling against id reuse, and a round-trip assertion for every
migrated id.

### Dev note 10 — renown really is expedition-only

**Confirmed by enumeration: no building and no job produces renown.** Every source is
`gainRenown(n)` — itself gated `if (S.techs.callToArms)` — called from expedition resolution and
scaled by `RENOWN_DEED_RATE 0.34`, plus Caitlyn's per-caravan clause when she leads. Two callers
in the whole file. Spending a Wilds charge is the only way to earn it, exactly as Jerry reports.
This is not a regression; it is the shipped design, and it is what makes first-champion land at
**140.9**. v0.59 Part 2 sizes the fix through `RENOWN_DEED_RATE` rather than adding sources.

### §29's citations, and a third behaviour hiding in `SCHOLAR_CAPS`

`OFF-CYCLE-PROTOCOL.md` §5's re-check turned up one solid citation and one that does not exist.
**Golden Spire's ×1.5 faith-max slice is real** — `js/buildings.js:1929–1931`. **There is no
`faithMaxRatio` anywhere in the Kittens repo**, so §29's appeal to one is a phantom; the figure
it justifies must be re-sourced or labelled. **Culture's ×1.05 remains UNVERIFIED.** Separately,
`SCHOLAR_CAPS` now has **three members and three distinct behaviours** — renown kept ×2.60 while
culture and devotion moved — which is a family that no longer behaves like a family. v0.59 Part 5.

### Carried into the spec as open items

- **Era 3 at 907** versus the 1,400–2,300 band — v0.59 Part 3 asks Jerry to rule, because the
  charter makes this a Kittens-rung question and not a bot question.
- **The rank ladder's 102% parity debt** (note 11) is recorded as a ledger row, not a re-balance.
- **My own three-seed ensemble did not finish inside the session** — past 70 minutes and still
  running at hand-off. Every Era-3 figure quoted above is the report's, not mine. The next round
  must budget **75–90 minutes** for the ensemble and re-measure rather than inherit.

## v0.58 — the analyzer's verification pass

**Everything reproduces.** All 26 suites: **1,273 assertions, 0 failures.** Two independent
2,500-year runs reproduce the ensemble's per-seed values to the digit — seed 1 → Sparks y137.4,
Icathia y1872.0, **Era 3 1,734.6**, 130 wanderers y1726.5, peak pop 185, morale band 100%,
Convergence 1.42%; seed 2 → Sparks y157.2, Icathia y1829.3, **Era 3 1,672.1**, 130 at y1415.4,
peak pop 181. The spread collapse is real and Era 3 is inside the target band on both draws.

Code probe, all exact: `CONSUMPTION 4.25` / ratio **1.17647**; the farmer's desc is plain
`+5 provisions/s` and output is **identical in all four seasons** while seasonal buildings still
read ×1.5/×1.0/×1.0/×0.25; `capFamilyOf()` total and single-valued with `renown` in `scholar`;
`renownCapPct 0.08` delivering **exactly `1 + 0.08n`** (30 → 4,554 at ten Halls); the ten dead
`renown:` fields **gone**; ladder 37/9/1.1111/1.2632/3.333; audits 0/0; ledger **220 rows —
PARITY 54, EASIER 38, HARDER 1, UNVERIFIED 127**, summing correctly.

**Jerry's note 2 — storage scaling — checked and correct.** Bare state, line fully researched:
timber **×14.98**, gold and crystals **×2.80**, provisions **×2.0875**, voidessence **×1.00**.
And the families do not leak: Scholarship delivers ×3.9926 to culture/devotion/renown and
**×1.0000 to timber**; Masonry delivers **×1.0000 to culture and renown**. **No change warranted
— but nothing asserts family isolation, and isolation is the property that actually broke once**
(before v0.57 four resources were in two families and a ternary picked the winner). v0.58 Part 4
turns the measurement into an assertion.

### The Convergence round: the formula was never the problem

All three links checked against source. **Two are at exact parity and the third is a missing
building:**

| RR | rate | Kittens | source |
|---|---|---|---|
| Acolyte | **0.0075 devotion/s** | priest `faith: 0.0015`/tick × 5 | `js/village.js` |
| Shrine of the Solari | **0.0075 devotion/s** | **temple** `faithPerTickBase 0.0015` × 5 | `js/buildings.js:1910` |
| *(nothing)* | — | **chapel** `faithPerTickBase 0.005` × 5 = **0.025/s** | `js/buildings.js:1858` |
| Marus Omegnum | 0.05/s | — | RR-original, 2× the Chapel |

**RR jumps from a 0.0075/s starter straight to a 0.05/s capstone; the Sanctum between them is a
multiplier, not a producer.** Kittens' middle faith tier was never ported.

**And the 5–8%-at-Sparks target has no source derivation.** Under the unchanged formula
(§3, closed), 5% requires **15,000 worship** and 8% requires **36,000**; the measured 1.42% and
3.71% correspond to ≈1,720 and ≈8,740. **Kittens gates Solar Revolution at 1,000 worship, where
the same formula delivers exactly 1.00%** — so RR's measured value is already above the source's
unlock-point value, and the band asks for 15–36× the source's threshold. The band has stood since
v0.46 and nothing derives it. `pacing.mjs`'s own ruling permits re-deriving it in a round that
does the Convergence work; **this is that round.**

### Two more things worth carrying

- **The Scholarship cut is 35%**, confirmed independently: ×3.9926 product against ×2.60
  additive. Kittens' `ziggurat` `cultureMaxRatio: 0.08` at priceRatio 1.25 is verified as the
  shape to size against — **the upgrade line was never meant to be the whole culture ceiling;
  the buildings are.**
- **Renown's last 1.7 points are probably not a ceiling problem.** Its sinks are champion
  recruitment (`250 × 1.5ⁿ`, tenth = 9,611 in one lump) and training (`40 × (lvl+1)^1.6`) — both
  lumpy and dynamically priced. §24 says classify before sizing; the <70% trigger may be the
  wrong *shape* of target for this resource.

## v0.57 — the analyzer's verification pass

**Everything reproduces, including the round's most surprising claim.** All 25 suites:
**1,219 assertions, 0 failures**, `test-v32` included — the builder's diagnosis of it matches the
analyzer's exactly and the fix holds. **Two independent 2,500-year runs reproduce the seed
ensemble to the digit:** seed 1 → Sparks y200.7, Icathia y901.3, **Era 3 700.6**, 130 wanderers
y750; seed 2 → Sparks y187.1, Icathia y1896.4, **Era 3 1,709.3**, 130 wanderers y1472.1. The
**2.6× spread is independently confirmed**, and so is the claim that the non-chaotic figures
agree across seeds: morale band **100%** on both, peak pop 180 / 185, Rites y72.7 / y72.5,
Convergence 4.17% / 4.40%, culture at cap 97.3% / 97.2%, crystals 95.9% / 96.2%.

Code probe, all exact: `CONSUMPTION 4.25` with farmer:eater **1.17647**, `XP_PER_SECOND 0.5`,
`XP_CAP 25,556`, `LEONA_SEASON_RELIEF 0.5` giving winter ×0.625 and spring ×1.5 unchanged,
Storehouse 5,000 / Harbor 2,500 / Warehouse `capsIf` 750, `BARN_LINE` Σ 4.35 and
`WAREHOUSE_LINE` Σ 1.80, tiers ×14.98 / ×2.80 / ×2.0875 / ×1.00, the tenth champion at **9,611**,
ladder 37/9/1.1111/1.2632/3.333, audits 0/0.

### One number is wrong in four places

BUILD REPORT §7 and §11, HANDOFF §4 and this file all quoted the ledger as *"PARITY 50, **EASIER
32**, HARDER 2, UNVERIFIED 127"*. **That sums to 211.** `docs/PARITY-LEDGER.md` — the generated
artefact `test-v56` asserts by enumeration — says **EASIER 29**, and 50 + 29 + 2 + 127 = **208**,
the row count measured independently. **The ledger is right; the prose was wrong.** Corrected in
the table above; v0.57 Part 7.1 corrects the other three and adds the missing guard — nothing
checks the ledger's summary table against its own rows.

### What the v0.57 spec does with Jerry's two directives

**Directive 1 — Renown off the material line.** Right, and better grounded than the ruling it
replaces: `addBarnWarehouseRatio` touches **seven material effect names and nothing else**, and
Kittens relieves non-material ceilings by other machinery entirely (Ziggurats for culture,
`libraryRatio` for science). **The measurement Jerry's conditional turns on, taken first:**
Renown sits at cap **88.7% / 88.8%** — fourth-worst in the game; the tenth champion costs
**9,611** in one lump; the ceiling is **14,815** at `broad` but only **≈12,274** at the 3-of-5
Scholarship state the instrument actually reaches, so headroom falls 54% → 28%. **And the line it
would join is the most cap-bound family in the game (culture 97.3%).** The spec moves it as
directed, then ships the dedicated line on an objective trigger — and specifies it as a **per-copy
building percentage on the Hall of Heroes**, matching Kittens' Ziggurat, not a fourth Discovery
chain.

**Directive 2 — farmers are not seasonal.** Consumption double-checked and correct. The
seasonality half **reverses STANDING-RULINGS §17** and moves RR *toward* the source: v0.55 shipped
seasonal farmers on a premise the builder then disproved, and labelled it RR-ORIGINAL / HARDER
precisely so it could be revisited on the label. The row goes **HARDER → PARITY** and the
project's HARDER count falls 2 → 1. Leona keeps her lead; its blast radius returns to seasonal
buildings.

### Two findings of the analyzer's own

- **The Scholarship line is still a multiplicative chain** — `scholarMult *= u[1]` at
  `index.html:3590`, ×3.9926 across five rungs. That is the identical shape §19 ruled out of
  existence for the material line one round ago, surviving on the two resources with the worst
  cap-out in the game. **Dated to v0.58 with the culture ceiling**, not shipped beside Part 1,
  because converting it at its natural reading is a **cut** (×3.99 → ×2.60) applied to a resource
  already at 97.3%.
- **Ten dead numbers in `CHAMPS`.** `recruitCost()` builds the Renown price from
  `RECRUIT_BASE × RECRUIT_RATIO^n` and copies only the **non-Renown** components of the
  champion's own cost, so every `renown:` field in `CHAMPS` — Shaco 320 through Zilean 540,
  summing to 4,140 — is never read anywhere. Delete them or wire them; do not leave ten numbers
  that look like prices and are not.

## v0.56 — the analyzer's verification pass

**Everything BUILD REPORT v0.55 claims reproduces to the digit** on a fresh clone. Pacing
(1,613.5 s wall): Rites y75.3 · Sparks y177.1 · Icathia y837.7 · Era 3 **660.6** · 130 wanderers
**y1013** · peak pop 220 · morale band 67%, min 88 · Convergence 3.87% · camp ×5.8179 · median XP
bank 176,750, top 1,335,491 · crystals at cap 94.2%. Code probe: `VERSION v0.55`,
`PROVISIONS_SCALE 10`, `CONSUMPTION 4`, farmer 5.000, Farmstead 0.625 seasonal, Granary
`provisions 100 + timber 10` @1.15 `eatCut 0.005` on `logistics`, `poroPasture` 1.75,
`hunterLodge` absent, `petricite` 65,000 + 65 Morellonomica, `irrigation` on `smelting`,
`XP_PER_SECOND 2`, `strictDR` 9.09/16.67/33.33/50/66.67/83.33/90.91%, camp ×5.9286 at Σ5.10,
ladder 37/9/1.1111/1.2632/3.333, audits 0/0, ledger 188 rows / 50 / 12 / 2 / 124. All exact.

### The one claim that does not reproduce — and it is not a flake

BUILD REPORT §9 records `test-v32` as *"flaked once under contention… passed clean on an idle
re-run… Not a defect."* **It fails 4 out of 4 runs here, on an idle box, with a varying value:
4.980 / 4.980 / 4.960 / 4.980 against an expected 5.000.**

**Root cause, instrumented to the line.** The `disc` block clears `S.upgrades`, `S.jobs` and
`S.buildings` — **not `S.wanderers`** — then takes `base = campYieldMult()`. At that point the
page holds **10 wanderers, one a Trailblazer**, so `traitBonus("trailblazer") = 0.005`,
`base = 1.005`, and `5.005 / 1.005 = 4.980`. Two Trailblazers gives 4.960. With an empty roster
the same probe returns **base 1.000, campLine exactly 5.000**. The trait roll is random, so the
assertion passes only when the roster happens to hold zero Trailblazers — **HANDOFF §8.6's
"re-run on an idle box" works by luck and has masked this for three rounds.**

### Jerry's directive 1 explained rather than re-implemented

*"Farmer's are not affected by seasonality."* **Seasonal farmers shipped and the code is
correct** (`index.html:3515`, asserted at all four seasons). The one way a player sees otherwise
is **Leona**: her lead floors `farmMult` at `Math.max(1, …)` (`:3410`), which does not soften
Deepwinter — it **deletes** it, and the forecast UI hard-codes `winterFarm = 1` for her at
`:5767`. **And v0.55 silently widened it**: extending `farmMult` to the job path means Leona now
cancels the season for jobs too. v0.56 Part 3 bounds her to a 50% relief (winter ×0.25 → ×0.625)
instead of nullification.

### The skill increment: found, with its cap

`js/village.js:2645–2651` carries the learning block —
`kitten.skills[kitten.job] = Math.min(kitten.skills[kitten.job] + skillXP, skillsCap)`, with
*"Engineers who don't craft don't learn"* — and **`:2622` is `var skillsCap = 20001;`**.
**Kittens caps job skill; RR has no cap at all.** The scalar `skillXP` is still unresolved and
no number was invented. The search method that worked is recorded in the spec's Part 1.4:
grep.app's API with the repo filter URL-encoded.

**But the cap is not the fix.** `rankOf()` already stops at Challenger, so banks above 11,500
change no bonus. The measurement says the *rate* is the lever: **40 of 65 trade-ranks are already
Challenger at Sparks (62%), 132 of 191 at Icathia**, top bank 116× the threshold. v0.56 ships
`XP_PER_SECOND` 2 → **0.5** and `XP_CAP` **25,556** (Kittens' 20,001 ÷ 9,000 top tier × RR's
11,500), for two different reasons.

### Two more findings

- **The drake rework is unmeasured.** The run kills at most 2 drakes of any type in 2,500 years,
  and at 0–2 kills the old `limitedDR` was linear anyway — the range where `strictDR` differs has
  never been observed in a run. Not a reason to revert; a reason to stop quoting it as a pacing
  item.
- **`1 farmers` at every milestone**, with net food **−6.501/s at Sparks** and **−61.837/s at
  Hexcore**. The settlement banks instead of farming. Same shape as "1 tinkerer" — an instrument
  statement before a game statement, and §16 says do not price around it.

## v0.57 SHIPPED — the spread collapses, and the instrument is trustworthy again

All seven parts shipped plus Jerry's two directives. Full argument in
`docs/BUILD-REPORT-v0.57.md`; the map is `docs/HANDOFF-v0.57.md`.

### THE FINDING: IT WAS THE BOT

v0.56 measured a **×2.62** Era-3 spread on one build and could not say whether the chaos came
from the game or from an instrument with no food policy. **Part 4 answered it.**

| | v0.56 | **v0.57** |
|---|---|---|
| Era 3, per seed | 700.6 / 1,709.3 / 1,835.3 | **1,672.1 / 1,734.6 / 1,784.1** |
| **spread** | **×2.62** | **×1.07** |
| seeds inside the 1,400–2,300 target | 2 of 3 | **3 of 3** |
| tenth champion | never, on any build | **y1,450.7 / 1,570.7 / 1,640.8** |

`manageJobs()` staffed **one farmer** at every milestone in every era at every population from 36
to 220, because the old rule could only fire when somebody was idle and only reacted to *today's*
net. It now projects to Deepwinter, pulls a worker off the largest other job when nobody is idle,
and unstaffs only when the stock is at ceiling *and* winter is covered. **Builds can be compared
again**, and every Era-3 comparison from v0.44 to v0.56 can now be re-taken cheaply.

### What else shipped

- **Part 3, the ensemble.** `--seeds N` launches seeds concurrently and prints ENSEMBLE figures
  separately from SINGLE-RUN figures, so a report cannot quote one as the other. §25.
- **Part 2, farmers lose the season** — Jerry's directive 2, **reversing v0.55's directive 5**.
  This is the charter closing its own loop: v0.55 shipped on a false premise about the source,
  the builder disproved the premise and labelled it **HARDER** anyway, and two rounds later Jerry
  read the label and reversed it. §17 amended, ledger row **HARDER → PARITY**.
- **Part 1, Renown leaves the material line** — `addBarnWarehouseRatio` touches seven MATERIAL
  effect names and nothing else, so a non-material resource there is a category error in the
  source's own terms. Renown → `SCHOLAR_CAPS`. Jerry's objective trigger then fired on
  measurement (time-at-cap 83.1%, not below 70%; tenth champion never affordable), so the
  dedicated line shipped too: **`renownCapPct 0.08` per Hall of Heroes, Kittens' own Ziggurat
  figure on the additive per-copy shape.** Ten dead `renown:` prices deleted. §22.
- **Parts 5–7:** the Scholarship census, pass condition 5 restated, the ledger prose corrected
  with a generator that now aborts rather than write a file that does not add up. §§23–24.

### What the next analysis owes, in priority order

1. **Restate every milestone pass condition as a MEDIAN WITH A SPREAD.** The builder re-based
   Rites of Targon to y75 from v0.56's two seeds and the ensemble reads 70.3 / 76.7 / 83.3 — it
   fails on two of three. **A scalar threshold against a ×1.18 figure is a coin toss**, and the
   instrument now reports both numbers. This is the natural follow-on to Part 3 and it is the
   apparatus's weakest remaining point.
2. **Take the Convergence round — it is five times deferred and it REGRESSED this round.**
   4.17/4.40% → 1.42/2.87/3.71%. Worship is ascent-driven and the food policy holds population
   lower for longer, so the regression is a measured consequence of v0.57's own work.
3. **The Scholarship restructure is a 35% cut, not 20%.** The instrument reaches **5 of 5** rungs
   (×3.9926), not the 3 of 5 the v0.57 spec assumed by analogy with storage. v0.58's first slice,
   sized against `cultureCapPct` (Ziggurat +8%), **with renown now riding the same line**.
4. **`firstTrade` spreads ×4.46** while everything else collapsed to ×1.07–1.37. It is the most
   chaotic figure left and points straight at the trade-banking policy, deferred four rounds —
   the same class of defect Part 4 just fixed for food.
5. **Rule on target population.** 130 wanderers reads y1,415–1,726 against y600 and got worse;
   peak population is 181–185. Every other number improved *because* population stopped running
   away. Five rounds failed without a ruling.
6. **Renown is at 72% time-at-cap against a <70% trigger** and appears in the "sitting at ceiling
   waiting to spend" list. Check whether it is partly lumpy-sink-bound (§24) before adding
   another percentage.
7. **Pass condition 5 classifies all four Era-3 raws as lumpy-sink-only or flow-limited**, so the
   30–60% band applies to none of them. Give one a continuous consumer or retire the band.

---

## v0.56 SHIPPED — the storage round, and the instrument's error bars

All six parts shipped plus Jerry's provisions-cap directive. Full argument in
`docs/BUILD-REPORT-v0.56.md`; the map is `docs/HANDOFF-v0.56.md`.

### READ THIS BEFORE QUOTING ANY MILESTONE YEAR

**A single-seed Era-3 figure is not evidence.** Three seeds on the *same* shipped build gave
**700.6 / 1,709.3 / 1,835.3** game-years — a **2.6× spread**. The five cumulative prefixes swung
Era 3 by **+1,046, −1,007, +450, −448**, every one larger than the change in that slice could
cause. The food economy now runs close enough to its own starvation threshold that a small
change flips which side a settlement lands on and the run diverges for a millennium.

**Every Era-3 comparison in BUILD REPORTS v0.44 through v0.55 is one draw from a distribution
nobody had measured the width of.** They are not wrong; their error bars were never taken.
**Building an N-seed ensemble into `sim/pacing.mjs` is now the project's highest-priority
apparatus item**, and until it lands no two builds can be compared on Era-3 length.

What is NOT chaotic and can still be compared on one run: cap-out fractions, morale band, peak
population, delivered multipliers, and everything in `tests/`.

### What shipped

- **Part 5, the storage-scope restructure**, dated three times and now done. One multiplicative
  chain across twelve resources (`masonryMult` ×22.05 nominal, ×12.6 realised — a Kittens'-Law
  violation on top of a scope error) becomes the source's two additive accumulators at three
  scopes: **narrow ×14.98 · broad ×2.80 · quarter ×2.0875 gated on Silos · none ×1.00**.
  `CAP_SCOPE` is total by construction and asserted by enumeration. STANDING-RULINGS §19.
- **Jerry's provisions-cap directive.** Storehouse 7,500 → **5,000** (Kittens' `barn.catnipMax`),
  Harbor 10,000 → **2,500** (harbour), Warehouse none → **750 after Silos**. Provisions at cap
  moves **1.5% → 25.8%** of ticks and held/cap at Sparks **56% → 91%**. §20.
- **Part 1.** `XP_PER_SECOND` 2 → **0.5**; **`XP_CAP` 25,556**, sourced from
  `js/village.js:2622 var skillsCap = 20001` rank-matched by ratio. RR had no cap and the
  measured top bank was 1,335,491.
- **Part 2.** `CONSUMPTION` 4 → **4.25**, closing the v0.55 disagreement on Jerry's directive.
- **Part 3.** Leona's lead no longer FLOORS `farmMult` at 1 — it halves the shortfall.
  Deepwinter ×0.25 → **×0.625**, Firstbloom ×1.5 unchanged.
- **Part 6.** `test-v32` is **not a flake**; §21, and `tools/fixture-sweep.mjs` is the detector.
- **Part 7.6.** Twenty champion and leader ledger rows.

### The three spec defects the round had to rule on

1. **The spec's pass table states ×14.84 / ×2.075; its prose states ×14.98 / ×2.0875.** The
   table implies barn Σ 4.30 — the source's 4.35 minus `strenghtenBuild`'s 0.05 — while the same
   table's warehouse Σ 1.80 *includes* that upgrade. §16 breaks the tie: the sourced 4.35 ships.
2. **The spec's `LEONA_SEASON_RELIEF` snippet is wrong.** Unguarded, `m + (1 - m) * 0.5` pulls
   Firstbloom's ×1.5 down to ×1.25, contradicting the spec's own pass condition. A `m < 1` guard
   ships.
3. **`XP_CAP`: the exact ratio is 25,556.833.** The spec states 25,556, which is the floor;
   `Math.floor` ships.

### What the next analysis owes, in priority order

1. **Build the seed ensemble.** Nothing else on this list can be evaluated without it.
2. **Give the bot a food policy.** It staffs **one farmer** at every milestone in every era at
   every population from 36 to 220. It banks food instead of farming it, and now that the
   ceiling binds that is the largest single source of the chaos above. **Fix the instrument; do
   not price around it.**
3. **Rule on target population.** 130 wanderers reads y750 / y1472 / y1535 against a y600
   target — the one condition that got worse, and the direct intended consequence of a binding
   food ceiling. Peak population is now 177–185, down from 220. Morale passed its band for the
   first time *because* of that.
4. **Pass condition 5 is mis-specified for three of its four resources.** shimmer, hexore and
   coalgas are flow-limited, not ceiling-limited: raising the shimmer ceiling ×2.5 moved its
   cap-out 3 points and cutting the hexore ceiling ×3.5 moved it 0. Restate as a
   producer/consumer balance or drop them.
5. **The instrument holds only 3 of 5 storage rungs** for most of a run, so the fully-stacked
   table and the whole quarter tier are never exercised in a measured game.
6. **`skillXP` remains the highest-value open lookup.** The rate is still UNVERIFIED; the cap
   beside it is PARITY, and the two must not be conflated.
7. **Crystals 95.9% and culture 97.3% cap-out** are the two worst readings in the game and
   neither is on the Masonry line. Each needs a round.

---

## v0.55 SHIPPED — what the builder found, and what the next analysis owes

**All ten parts shipped. All twenty pass conditions asserted in `tests/test-v55.mjs`.** Full
argument in `docs/BUILD-REPORT-v0.55.md`; the map is `docs/HANDOFF-v0.55.md`.

### The two open questions above are now closed

**Are Kittens' farmers seasonal? NO.** Resolved against the raw file:
`js/village.js updateResourceProduction()` applies skill, rank, leader and happiness and no
season term; `getWeatherMod()` is in `js/calendar.js` and feeds the catnip *field*; the wiki's
Game Mechanics page states it outright. **Jerry's directive shipped anyway and is labelled
RR-ORIGINAL / HARDER — the charter's first HARDER label. STANDING-RULINGS §17.**

**The skill increment could NOT be located.** `js/game.js` and `js/core.js` **404 from
raw.githubusercontent.com, the GitHub blob view AND jsdelivr**. No citation was invented.
`XP_PER_SECOND = 2` ships as a stated interim, labelled UNVERIFIED in the ledger. **This is now
the project's highest-value open lookup** — see below.

### The finding the next analysis must absorb

**The spec predicted the XP/undo slice would move pacing by ≈ 0. It moved Era 3 by −193.6
game-years**, entirely on the late edge (Icathia y1010.8 → y837.7). Wanderer rank is a per-trade
*production multiplier*; doubling the accrual rate makes every wanderer reach every rank twice as
fast. Median XP bank at Icathia went 46,905 → 176,750 (×3.77).

**Generalise it: any change to rank, skill, trait or champion progression is a pacing item**, and
it gets its own slice. "It is experience, not economy" is not a classification.

### Two more predictions that missed, and why

- **Sparks moved +37.6 on the food slice against a ±15 diagnostic.** The diagnostic's stated
  cause — *"the ×10 sweep missed a cost"* — **is ruled out by enumeration**: the sweep is
  thirteen sites, read out of the live game after the fact, all at ×10. The real cause is that
  the rescale was never neutral: the Farmstead went from ×2.24 of the source's rate to ×1.00, a
  55.4% cut to the starter food building, plus the seasonal farmer on top. Era 1 got harder on
  purpose and the prediction assumed it would not.
- **The rungs/hunt slice undershot (+44.3 against +80–250) and moved Sparks EARLIER by 22.3.**
  Pushing the Quarry out of reach leaves the bot's ore going into Forges and Mines, which is a
  better Era-2 investment than the Quarry was. And deleting the Lodge *raised* the camp
  multiplier at Sparks (×3.24 → ×5.75), because the five Discoveries are unconditional now and
  arrive long before forty Lodges would have.

### What the next analysis owes, in priority order

1. **Find the Kittens skill increment.** It is worth ~190 game-years of Era 3 if the real figure
   is below 2, and it is the only UNVERIFIED item in the game that is also a first-order lever.
2. **Rule on 130 wanderers at y1013** — the worst reading in the project's history, up from
   y758.8. Correct consequence of a correct food scale, or over-correction? The cheapest dial is
   `CONSUMPTION`: shipped at Jerry's **4** against the source ratio's **4.25**, a 6.2%
   relaxation in the wrong direction.
3. **The storage-scope restructure, v0.56 first slice** — unchanged, fully sourced, measurements
   intact (see the v0.55 pass below). It could not ship beside the ×10 provisions sweep.
4. **Work the ledger's 124 UNVERIFIED rows** by subsystem, ten to fifteen a round.
5. **Convergence is 3.87% at Sparks** against 5–8% — improved from 2.33% and **now has a pass
   condition attached** (v0.55 Part 9), so it will not go unnoticed again.
6. **Trades never call `snapshotUndo()`**, so Part 8's trade guard protects a path that does not
   exist. Wire trades in or delete that half.

---

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
| **The storage-scope restructure** | **v0.56, first slice — re-dated with a technical reason** | fully sourced and measured, but v0.55 Part 3 multiplies every provisions cost and cap by 10, and a round that changes both what multiplies a cap and the caps themselves is unattributable. Measurements carry forward unchanged |
| **The Chembarrel / save-for-a-visible-building fix** | **v0.56** | dated to v0.54 and not actioned. `catMonument` is ×1.00 because Foundry, Reactor and Chembarrel are all 0 |
| **The craft-depth tie-break** so Riftsteel can be forged at all | **v0.56** | dated to v0.54 and not actioned. Two monotonicity conditions now fail, not one — voidessence accumulates with no consumer |
| **A morale round** | **v0.56** | band 61% against ≥80%, run minimum 88; `MORALE_RELIEF_LIMIT` saturates at 77.7% as population finally moves off 200 |
| **Trade-banking policy** for `manageTrade()`, with its own baseline | **v0.56** | deferred twice with reasons. The gap is now 150.33 trades a game-year affordable against 0.05 run |
| **`libraryRatio` for the knowledge ceiling** | **v0.56, conditional on the craft-depth fix** | knowledge is at cap 90.0% of the run; the exemption's stated reason was that eludium/unobtainium sit outside RR's era window, and v0.53 shipped both |
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
