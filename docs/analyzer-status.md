# Analyzer status — Runeterra Reclaimed

Standing status for the Analyzer cycle. Read alongside `STANDING-RULINGS.md` (closed rulings,
do not re-litigate) and the latest `docs/HANDOFF-v0.NN.md` (the map of the shipped build).

**Always-read tier**, at the start of every session before any other work: `rr-current-state.md`
(in the claude.ai project), `current-build-spec.md` at the repo root, and
`BUILDER_PROTOCOL.md` at the repo root (the two-tier verification cadence — cheap single-seed
check per spec part, full multi-seed suite once at the end, never the full suite per part).

---

## Where the cycle is

| | |
|---|---|
| Last shipped build | **v0.57**, tagged `v0.57` |
| Last consumed spec | `docs/specs/rr-analyzer-v057-spec.md` |
| Current spec, awaiting a builder | **`current-build-spec.md` at the repo root — produces v0.58, THE CONVERGENCE ROUND** |
| Live suites | **26 suites, 1,273 assertions, 0 failures** — re-run and confirmed 2026-08-06 |
| Parity ledger | **220 rows — PARITY 54, EASIER 38, HARDER 1, UNVERIFIED 127** |
| Era 3 | **1,734.6 median of three seeds, spread 1,672.1–1,784.1 (×1.07). ALL THREE SEEDS INSIDE the 1,400–2,300 target.** |

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
