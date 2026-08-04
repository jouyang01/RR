# BUILD REPORT v0.50

**Three separate builds, three isolation runs, as instructed. Every spec item and all five of Jerry's directives shipped. 895 assertions across 18 suites, 0 failures.**

---

## 0. The number, and it is the wrong sign

**Era 3 goes 700.9 → 655.9 game-years. This round made it 45.0 years SHORTER.**

Icathia moves y827.9 → y803.9 while Sparks moves y127.0 → y148.0.

The three-build discipline is what makes that legible rather than mysterious, and it says the census is the larger half of it:

| Build | Sparks | Icathia | **Era 3** | Δ Era 3 |
|---|---|---|---|---|
| **v0.49** (baseline) | y127.0 | y827.9 | **700.9** | — |
| **+ Part 2** (raw gates) | y127.0 | y803.2 | **676.2** | **−24.7** |
| **+ Part 1** (census) | y148.0 | y794.5 | **646.5** | **−29.7** |
| **+ Part 3** (Reactor ×10) = full v0.50 | y148.0 | y803.9 | **655.9** | **+9.4** |

Each row differs from the one above it by exactly one part, so each Δ is that part alone. I built them as **cumulative prefixes of the shipped file** rather than as three reconstructions of v0.49-plus-one-part: after v0.47's isolation script turned out not to contain what its label claimed, a snapshot that *is* the shipped build up to that point is the only version of this I trust.

**Two of the three parts were supposed to cut production and one of them did.** §2 is why.

---

## 1. My errors, first

**1.1 — I killed my own shell with `pkill` again.** `pkill -f "index-iso-p2.html"` matched the bash process running it, exit 144, and the two `python3` patches queued behind it in the same command never executed while the command reported nothing. **This is the identical mistake documented in the v0.46 report** — same tool, same cause, same cost. It is now in two build reports and a handoff, and I still made it. Killing by PID from `ps -eo pid,args` is the fix and I should have been doing it since v0.46.

**1.2 — A 10-minute `sleep` that hit the tool timeout killed a background pacing run.** The Part 2 run had been going 20 minutes; the timeout returned exit 143 and took the run with it. Cost one relaunch. Sleeps are now sized under the timeout.

**1.3 — I did not instrument the Glorious Evolution before launching**, so the first pass of the Part 2 and full-v0.50 runs came back without the two numbers the spec explicitly asks for. Both had to be re-run. The spec named them in §2.3 and I read past it.

---

## 2. Part 1 — the census

### 2.1 The table. This is the deliverable, and it is generated off the shipped build, not typed

`census-table.mjs` reads it out of `computeRates()` and the tables it uses.

#### Job-tier tool lines — Kittens' `<res>JobRatio`

| Resource | Kittens | RR v0.50 | |
|---|---|---|---|
| timber / wood | 6 axes, Σ3.20 → **×4.20** | **7 rungs, Σ3.45 → ×4.45** | RR +1 (Masterwork Tools re-homed) |
| provisions / catnip | 2 hoes, Σ0.80 → **×1.80** | **2 rungs, Σ0.55 → ×1.55** | closer; still under |
| ore / minerals | **none** | **none** | ✅ exact |
| knowledge / science | none | none | ✅ exact |
| vigor / manpower | 3, Σ1.00 → ×2.00 | 0 in `jobMult` (×2.00 lives in `BOOST_LIMIT.vigor`) | same magnitude, different slot |
| mana | no such resource | `arcaneFocus` ×1.50 | RR-only |
| crystals | no such resource | `facetedCuts` ×1.25 | RR-only |

#### Building ratio — Kittens' `<res>Ratio`

| Resource | Kittens | RR v0.50 | |
|---|---|---|---|
| ore / minerals | mine 0.20 + quarry 0.35 (**2**) | mine 0.20 + Petricite Quarry 0.35 (**2**) | ✅ exact |
| timber / wood | lumberMill 0.10×(1+Σ5 saws) = **0.195** | lumberMill 0.10×(1+Σ**6** saws) = **0.220** | RR +1 saw |
| knowledge / science | library/academy/observatory/biolab (**4**) | archive .10 / academy .20 / observatory .25 / hexLab .35 (**4**) | ✅ exact |
| provisions / catnip | **aqueduct 0.03 (1)** | **farmstead 0.03 (1)** | **parity restored — and see §2.3** |

#### Per-resource global ratio, and the global tier

| | Kittens | RR v0.50 | |
|---|---|---|---|
| `<res>GlobalRatio` filled for | 2 resources (starchart, unicorns) | **1** (provisions, by ruling) | RR-only, recorded |
| multiplicative global categories | magneto×steamworks · productionRatio · solarRevolution | **5**: `catMonument · catReligion · catPolicy · catMeta · catBuff` | **7 → 5** |
| `globalBoost` buildings | magneto + reactor (**2**) | hextechFoundry 0.06 + arcaneReactor 0.05 (**2**) | ✅ exact |

Every pass condition holds: `mw` appears nowhere as a multiplier; `AXE_LINE` sums to 3.45 (×4.45); the plough line reaches ×1.55; `SAW_LINE` sums to 1.20 and the Mill reads 0.220; `resRatio` has exactly one member; **`catMeta` is ×1.8197 at a full stack** against the old ×2.058; **the Baron measures ×1.25** through `computeRates()`, not read off the source.

### 2.2 The collapse could not be done naively, and the trap is the v0.47 devotion trap in a new shape

`globalTransient` was `catCharts × catReligion × catPolicy`. Folding `catCharts` into `catMeta` alongside the drakes and the Dragon Soul would have handed knowledge, culture, vigor and devotion two multipliers that three previous rounds explicitly excluded from them.

So the collapse has two outputs:

```js
var catMeta          = 1 + limitedDR(metaCharts + drakeBonus("infernal", 0.5) + soul, META_LIMIT);
var catMetaTransient = 1 + limitedDR(metaCharts, META_LIMIT);
```

`metaCharts` is 0.10, well below `limitedDR`'s free band, so transients take **×1.10 exactly as before**. Asserted end-to-end: with the Infernal Drake at 100 kills and the Dragon Soul owned, knowledge ×1.000, culture ×1.000, devotion ×1.000, mana ×1.747.

### 2.3 Why the census made Era 3 *shorter* — two terms the spec sized as small, measured

The category collapse cut the global tier as designed. It was outweighed. Both causes are re-homings the spec described as neutral.

**(a) The Farmstead's `boost: { provisions: 0.03 }` is worth ×4.40, not 3%.**

At the shipped run's own building counts (60 Farmsteads, 201 population), provisions production measures **337.63/s with it and 76.65/s without** — the single largest production change in this round, in a spec section titled "the cheapest parity item."

The figure is Kittens' figure and the mechanism is Kittens' mechanism. **The building is not.** Kittens' `catnipRatio 0.03` sits on the *Aqueduct*, a distinct mid-game building; RR now has it on the **Farmstead**, which is the game's cheapest starter building at ratio 1.12, of which the bot builds sixty. The per-copy value is at parity and the *count it multiplies* is not, and `boosts.provisions` has no `BOOST_LIMIT` entry, so it is unbounded.

**I shipped it exactly as specified** — it is an explicit pass condition — and I am reporting it rather than quietly correcting it. **Recommendation: keep the 0.03 and give it a `BOOST_LIMIT.provisions`, or move it onto a building that is not the starter.** One line either way.

**(b) Moving `hexresonance` out of `resRatio` fixed a live bug — it was a no-op whenever mana ran a deficit.**

```js
for (var r4 in resRatio) if (rates[r4] > 0 && resRatio[r4] !== 1) rates[r4] *= resRatio[r4];
```

`resRatio` multiplies the **net** rate and is guarded on `rates > 0`. Mana is heavily consumed by converters, so at any state where mana runs negative, Hexresonance did **nothing at all**. At a synthetic Era-3 state matching the run's counts, net mana is **−6.38/s**: the old shape applied no bonus, the new `boosts.mana` shape raises gross production and lands **+3.38/s**. A swing of **+9.76 mana/s** from a re-homing described as "same content."

That is a real defect found by the census and worth having. It is also production the round did not intend to add.

**The same trap remains live for provisions**, the one member `resRatio` still has — a settlement running a food deficit gets no Cultivation bonus at the moment it most needs one. Flagged, not touched: Jerry ruled the +10% stays and changing its application shape is a different decision.

---

## 3. Part 2 — the seven raw gates

**`auditRawGraph()` returns zero.** `auditCostGraph()` stays green. The pin moved **7 → 0 in the same commit as the fix**, as specified. And the check still bites: reverting the Storehouse to `timber 50, ore 75` adds exactly one violation back, naming the Storehouse.

Four edits cleared all seven.

| Fix | Detail |
|---|---|
| **Shimmer Refinery `deepWorks` → `chemtech`** | clears violations 1–4 at the source. **The spec says `progressDay`; this is `chemtech`, the same rung (60,000), for the spec's own escape-clause reason** — the Refinery costs `alloy` and alloy is gated on chemtech. On progressDay the two sit on sibling branches at equal price, so a player taking progressDay first would own an unbuildable Refinery. On chemtech the Refinery, its alloy input, its coalgas input and its first consumer all arrive together. |
| **`RES.shimmer.hidden` → `chemtech`** | not in the spec, and required. Visibility and production are two separate declarations; moving one without the other leaves a building producing an invisible resource. It is also why `auditRawGraph` reads the `hidden` predicate. |
| **Tavern `cultivation` → `mining`** | costs ore 800 at rank 2 where ore arrives at rank 4. |
| **Longhouse `woodcraft` → `carpentry`** | **Jerry's directive, overriding the spec's `mining`.** See below. |
| **Iron-Shod Wheels `trade` → `smelting`** | costs steel 120 at 1,200 where steel arrives at 1,500. |

### 3.1 The Longhouse — Jerry's call does two jobs where the spec's does one

The spec routes it to `mining` (500), which clears the ore gate and explicitly leaves the parity question open: *"whether it belongs at rank 7 stays open. Say so in the report so the two do not get conflated."*

Jerry routed it to **Carpentry (1,000)**, which clears the ore gate **and** closes the gap v0.47 Part 1.4 opened and deferred: Kittens unlocks its `logHouse` from `construction`, and Carpentry *is* RR's construction — the tech that already carries the Lumber Mill, the Warehouse and the Reinforced Saw. **The two are deliberately conflated, and the conflation is the point.** They close together instead of one closing alone.

One consequence, stated so it is not a surprise: `timberframeJoinery` — the Discovery that unlocks the Longhouse — still sits on `woodcraft` (300). It costs no ore, so it is not a raw-gate violation and moving it is out of Part 2's scope, but a player can now buy it 700 knowledge before the building it unlocks becomes available. One line to move it if that reads badly.

### 3.2 The Glorious Evolution, and how to state it precisely

Jerry: *"A tech that has never been researchable in any measured build, with a building behind it that has never been reachable — that should be stated as such in the report."*

Here it is, stated as precisely as the measurement supports:

| | v0.49 and every build before it | **v0.50** |
|---|---|---|
| The Glorious Evolution researched | **could not be researched at its own rank** — costs `shimmer 40` at 85,000 while shimmer required Deep Works at 100,000 | **year 663.4** |
| First Augment Chamber built | never, at its own rank | **year 663.9** |
| Augment Chambers at Icathia | **0** | **16** |

**The sharpest true statement is the timing.** Deep Works lands at y700.3. The Glorious Evolution now lands at **y663.4 — 36.9 game-years before it**, which is a window it could not previously occupy at all: before this round, shimmer did not exist until Deep Works, so the tech could not precede its own prerequisite's prerequisite. The Augment Chamber gives **tinkerer effectiveness +40% per copy**, and sixteen of them now exist by Icathia where zero ever did.

**That is most of Part 2's −24.7 years.** It is a correctness round that *adds* production, because it made content reachable that has never been reachable. I would not undo it.

### 3.3 One thing the run says that the spec did not anticipate

**Shimmer Refineries at Icathia: 0.** The bot never builds one, in any of the three runs. The shimmer that pays for the Glorious Evolution and the Augment Chambers comes from **the Sump Crawl expedition**, not from the building the whole of §2.1 moved.

The move was still correct — it is what makes the graph legal and the tech reachable at its rank — but **the Shimmer Refinery is a building nothing builds.** That belongs on the next census.

---

## 4. Part 3 — the Arcane Reactor at ×10

| | v0.49 | **v0.50** |
|---|---|---|
| cost | `hexcore 4, hexcrete 8, focusedHex 6` | **`hexcore 40, hexcrete 80, focusedHex 60`** |
| effective-raw cost | 62,595 | **625,952** |
| Foundry effective-raw | 119,252 | 119,252 *(untouched)* |
| **separation** | **×0.525** | **×5.25** |
| Arcane Reactors at Icathia | 21 | **12** |
| `catMonument` at Icathia | ×3.238 | **×2.398** |
| Era 3 | — | **+9.4 years** |

The separation lands at **×5.249**, against the spec's predicted ≈×5.25 — the ×10 went in cleanly and nothing else about the building moved (0.05 at ratio 1.15 on Grey Reclamation, Foundry untouched).

**The count did not fall as far as predicted.** The spec expected five to eight; measured **12**, against the Foundry's 7. So a ×10 price bought a ×0.57 reduction in count — the Reactor is still the cheaper way to buy global production, and **the next ×10 is warranted** on this evidence. The pacing effect is correspondingly small: +9.4 years, the smallest of the three parts.

---

## 5. Part 4 — the 1.25 band, closed

The whitelist comment in test-v34 now states the ruling rather than an open item: Kittens has no ratio-to-effect band at all — barn 1.75 with no multiplier, hut 2.50, amphitheatre 1.15 with a real one — so the rule these two are exempt from does not exist in the source. **Closed, not pending.**

**And a second RR-invented rule came under the same pressure this round, which is worth a ruling too.** test-v38 asserts every effect-bearing building sits within an order of magnitude on `effect / (ratio − 1)`. The Farmstead's new `boost 0.03` at ratio 1.12 scores **0.25** — and that is **Kittens' Aqueduct figure at Kittens' Aqueduct ratio, both verbatim**. So the source's own building violates RR's proportionality rule, exactly as it violates the band rule. I widened the bound to 15× with the cause recorded in the test. **It should get the same treatment as Part 4 gave the band: ruled on, not carried.**

---

## 6. Part 5 — there is no trade gate

"First trade before Sparks" is **retired**. Replaced with the state question, which is policy-independent, and it **passes**:

| At | cheapest route | payable? | vigor income | trades a player could run |
|---|---|---|---|---|
| **Sparks** | Freljord: `ore 500, vigor 60, gold 15` | **AFFORDABLE** | 2,690.6 / game-year | **44.8 / game-year** |
| Hexcore | same | AFFORDABLE | 14,633.4 | 243.9 |
| Icathia | same | AFFORDABLE | 29,129.6 | 485.5 |

**A player reaching Sparks can afford forty-five trades a game-year and the bot ran zero.** That is the whole of the "gate": the greedy policy spends vigor on expeditions the instant it can afford one and never banks, so its vigor is a flow where a player's — especially since v0.47's offline accrual — is a stock. Vigor at cap is **5.6%**, which is the same fact from the other side.

The route costs `vigor 60, gold 15` rather than the table's 100/30 because Caravanserai and the Letter of Marque are owned by then; both discounts are subtractive and both apply.

No code, no price change, as specified.

---

## 7. Suites

| | v0.49 | v0.50 |
|---|---|---|
| test-v32 … v49 (17 suites) | 861 / 0 | **861 / 0** |
| **test-v50** | — | **34 / 0** |
| **Total** | 861 / 0 | **895 / 0** |

**Seven shipped assertions were re-pointed**, every one directly superseded by a spec item:

| Suite | Assertion | Superseded by |
|---|---|---|
| test-v34 | "exposes named multiplicative categories" (`count >= 7`) | Part 1.4 **inverts** it — the finding is that RR had too many. Now asserts the exact six names `computeRates` leaves standing. |
| test-v38 | the proportionality bound | Part 1.2 — see §5. Widened to 15× with the cause recorded. |
| test-v44 | Arcane Reactor cost `4 / 8 / 6` | Part 3 → ×10. |
| test-v44 | "Seasoned Timberworks is +25% timber" | Part 1.3 — now the sixth saw. Asserts `resRatio.timber` is ×1.0 **and** the line reads Σ1.20. |
| test-v45 | `globalTransient = catCharts * …` | Part 1.4 → `catMetaTransient`. |
| test-v45 | axe six rungs ×4.20 / saw five rungs 0.95 | Parts 1.1 and 1.3 → seven ×4.45 / six 1.20. |
| test-v49 | the raw-gate pin at **seven** | Part 2 → **zero**, in the same commit as the fix, as the spec requires. |

**No regression, all asserted:** 38 tech prices to the digit; the five ladder conditions together (n=38, 8 ties, median ×1.1333, geo ×1.2553, max ×3.333); `catMonument` at exactly two members; the ore category `1 + 0.25M + 0.40Q` exact; knowledge cap buildings alone from 0; `buildingJobBoost` unbounded; **Shelter 75 and Cultivation's +10% both kept by ruling**; the religion layer untouched (stripe 1,000, Shrine 0.0075, Acolyte 0.0075 with no `max`, all five WTECH thresholds); the catch-up loop still renders nothing per simulated day.

---

## 8. Failed pass conditions

| Condition | Result |
|---|---|
| Icathia y1,400–2,300 | ❌ **y803.9, and 24.0 years worse than v0.49.** §0 and §2.3. |
| Rites of Targon before y55 | ❌ y64.0 (was y68.9 — improved) |
| 130 wanderers before y600 | ❌ y704.1 |
| morale dips below 90 before y50 | ❌ 0% — unchanged |
| Convergence 5–8% at Sparks | ❌ 2.9%. Deferred by ruling; no code touched. |
| cheapest trade affordable at Sparks | ✅ **new, and it passes** |
| vigor at cap < 10% | ✅ **5.6%** |
| morale 90–140 band after y60 | ✅ 100% |

---

## 9. Files

- `index_50.html` — one file, no build step.
- `runeterrareclaimed-v0.50-workspace.zip` — 18 suites, the three isolation builds, all four pacing logs, `census-table.mjs`, `size.mjs`, `audit.mjs`.

---

## 10. For the next spec

1. **The Farmstead's provisions boost is ×4.40, not 3%** (§2.3a). Either bound it with a `BOOST_LIMIT.provisions` or move it off the starter building. This is the largest single number this round produced and it went in as "the cheapest parity item."
2. **`resRatio` multiplies the NET rate and is guarded on `> 0`**, so its one remaining member — Cultivation's +10% provisions — does nothing at the moment a settlement is starving. Same class as the Hexresonance bug the census just fixed by accident.
3. **The Shimmer Refinery is a building nothing builds** (§3.3). The shimmer economy runs entirely off the Sump Crawl.
4. **The next ×10 on the Arcane Reactor is warranted.** ×10 moved the count 21 → 12 against a predicted 5–8; the separation is ×5.25 against Kittens' ×181.
5. **`CAMP_YIELD_LIMIT 6` — Jerry has already flagged this and the measurement backs him**: `campYieldMult` reads **6.35** at end of run, i.e. the stack is *at* the bound, so it is load-bearing rather than insurance. Nine members. Census it against Kittens' hunt-yield line.
6. **Rule on the proportionality bound** the way Part 4 ruled on the 1.25 band (§5). Two RR-invented rules have now been contradicted by the source in two rounds.
7. **Era 3 is 655.9 years against a 1,400–2,300 target and this round moved it the wrong way.** The three-build discipline says the cost was worth paying — Part 2 bought correctness and Part 1 bought structure and a bug fix — but the next round should be a lever round, not a structure round.
