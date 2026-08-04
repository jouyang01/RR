# BUILD REPORT — Runeterra Reclaimed v0.45

Every item in BUILDER SPEC v0.45 is implemented, in the Part 9 order, plus all three of
Jerry's directives. **665 assertions across 13 suites, 0 failures** (v45 contributes 55).
Nothing was silently skipped; the four things I could not satisfy are named in §4 and §9.

**Everything below is four seeds, not one.** The v0.44 multi-seed debt is paid.

---

## 0. My own errors first

**0.1 — I ran the entire 12-suite set against the wrong path and read 12 false failures.**
My shell was left in `site/` from an earlier command, so `node test-v32.mjs` resolved to
`site/test-v32.mjs` and every suite reported `MODULE_NOT_FOUND`. This is *precisely* the
gotcha §3 of the handoff warns about, written by the previous builder, which I had read
that morning. Cost: one wasted cycle. It is now absolute paths only.

**0.2 — I shipped four broken branch techs and the existing suites caught them, not me.**
Part 6 asks for side techs priced *at* an existing rung. Four of mine were priced at or
*below* their own prerequisite — `coinage` 600 = `trade` 600, `lapidary` 1,700 <
`hextech` 2,200, `shimmerworks` 50,000 = `chemtech` 50,000, `chronometry` 92,000 =
`hexgate` 92,000. Kittens' ties are *siblings* branching off a shared parent, never a
tech tying with its own parent. Fixed by re-parenting `coinage` onto `mining` and
re-pricing the other three up one rung. The v0.42 and v0.44 monotonicity assertions found
all four; I did not.

**0.3 — a false FAIL of my own making, in my own new suite.** My Part 1 test measured the
excluded categories using the Piltover Spire as a pure `globalBoost` building. The Spire
carries `prod: { culture: 0.04 }`, so 20 of them raise culture's *base*, not its
multiplier, and the test reported culture ×2.333 — which reads exactly like a Part 1
leak. It is not one. Re-measured with the Hextech Foundry (globalBoost, no `prod`):
culture ×1.000000. Had I trusted the first number, §5.1 below would have reported a bug
that does not exist.

**0.4 — `simcore.mjs`'s `snapshot()` would have lied, and the handoff is why it did not.**
It mirrors `computeRates()` by hand. I changed three of the categories it mirrors, so
before running a single measurement I re-pointed it at the game's own `jobBoostPerCopy()`
and `axeMult()`, zeroed the miner tool line and the ore `resRatio`, and added the
transient product. Without that, every ore and timber figure in this report would have
been silently wrong in my favour.

---

## 1. The number that changes the round

**Part 1 over-delivered, Parts 4 and 5 landed exactly, and Era 3 still cleared in 157
game-years against a target of 1,400–2,300.**

| | v0.44 (seed 1) | v0.45 (median of 4 seeds) | spec's prediction |
|---|---|---|---|
| Sparks | y95.1 | **y136.9** | ~y450 |
| Doors of Icathia | y181.4 | **y294.6** | y1,800–2,800 |
| Era 3 length | 86.3 y | **156.6 y** | ~2,300 y |

Part 1 was supposed to be the large lever and it *was*: knowledge now forgoes **×7.508**
at Icathia, well above the ×4.5 the spec predicted. Part 4's loremaster cut (×1.71) and
Part 5's cap repair both landed exactly. The three compounded terms should have been
≈×27. Era 3 moved ×1.81.

**The mechanism is that the knowledge ceiling was never the binding constraint, and Part 5
converted the multipliers into building count rather than into time.** Measured at
Icathia:

```
caps.knowledge = 142,650   against Doors of Icathia at 135,000 knowledge
science stock  = 44 Archives / 32 Academies / 45 Observatories / 47 Hexcore Laboratories
ore income     = 9,215 /s
```

Removing Masonry (×22.4), the Mountain Drake (×1.6) and Poppy (×1.25) from the knowledge
cap did not lower the ceiling. It made *buildings the only way to raise it* — and building
count is unbounded, the Observatory and the Hexcore Lab sit at ratio 1.10, and the
settlement is earning 9,215 ore a second. So it bought 47 Hexcore Laboratories against a
target of 13 and reached the same ceiling from the other direction.

**Part 5 is correct and should stay. It is simply not a pacing lever, because nothing that
raises the price of knowledge matters while ore income can buy the ceiling outright.**
That is the finding the next spec has to answer, and it points back at the same place
v0.44's §0 pointed: the ore side.

---

## 2. Part 7 is inverted, and the arithmetic is not close

The spec's Part 7 reasons that craft yield makes Era-3 buildings *cheaper* than nominal —
"a player entering Era 3 with a stocked workshop is not paying the nominal price of
anything" — and concludes **"the correct action on those prices this round is none."**

Measured, with the craft line at its ceiling (all upgrades, 40 Workshops, craftYield
×2.97):

| Building | nominal units | **effective raw units** | effective / nominal |
|---|---|---|---|
| Hextech Foundry | 300 | **119,252** | **×398** |
| Piltover Spire | 210 | **89,126** | ×424 |
| Hexgate | 202 | **71,805** | ×355 |
| Arcane Reactor | 18 | **62,595** | **×3,478** |
| Hexdraulic Plant | 4,320 | **41,405** | ×9.6 |
| Hexcrete Bastion | 16 | **28,989** | ×1,812 |

Hand-verified, independent of my script, for the Foundry:

```
1 alloy    = (60 zaunore + 30 coalgas) / 2.9673   =  20.22 zo +  10.11 cg
1 hexgear  = 25 alloy / 2.9673                    = 170.36 zo +  85.18 cg
1 beam     = 150 timber / 2.9673                  =  50.55 timber
1 scaffold = 40 beam / 2.9673                     = 681.44 timber
Foundry (200 hexgear + 100 scaffold) = 34,072 zaunore + 17,036 coalgas + 68,144 timber
```

The spec's claim about the *craft multiplier* is right — at the craft floor the same
Foundry is 1,050,000 raw units, so the craft line does divide by ×8.8, close to its stated
×9.5. What is wrong is the inference. **Chain depth multiplies the raw cost far faster
than yield divides it.** A nominal "300 units" is 119,252 raw units even at the ceiling,
and the Plant is ratio 1.25, so its eighth copy costs ×4.8 that again.

So the spec's own diagnosis — 5 Foundries, 5 Plants and 12 Reactors at Icathia against
targets of ≥8 and ≥25 — is *not* explained by "Era 3 is too short to bank them". It is
explained by the prices. **I did not change them** (the spec said take no action, and
one-lever discipline), but the recommendation to leave them alone rests on arithmetic that
runs the wrong way, and the next spec should revisit it with the table above.

`effcost.mjs` is now in the workspace and prints this table for every Era-3 building at
both the craft floor and the craft ceiling. Part 7's standing reporting requirement is met
permanently, not by hand.

---

## 3. Three corrections to the spec's Kittens sourcing

I re-read the source rather than trusting the citations, per standing constraint 3. Seven
of the spec's ten claim-groups verified exactly. Three did not.

**3.1 — Paragon and CMBR are NOT transient-guarded, so Part 1's stated justification is
wrong for three of the four categories it removes.** The spec says `catDrake`, `catSoul`
and `catBuff` leave because they are "building- and kill-sourced, which is precisely the
class Kittens excludes". But `game.js:3341` (`perTick *= 1 + paragonProductionRatio`) and
`:3383` (CMBR) sit at base indentation with no `res.transient` test — only magneto
(`:3358`) and the reactor `productionRatio` line (`:3372`) are guarded. Paragon and CMBR
are the *nearest analogues* to RR's drake/soul/buff meta-multipliers, and Kittens applies
both to science.

**I shipped the exclusion anyway**, because it is Part 1's explicit pass condition and
Jerry's directive is to action every item — and it is worth ×1.625 at Icathia. But it is a
**deliberate RR divergence, not Kittens parity**, it is commented as such in
`computeRates()`, and the spec should not cite Kittens for it.

**3.2 — `mineralsJobRatio` and `mineralsGlobalRatio` return zero results anywhere in the
repository.** Verified. Part 2's whole E1 argument stands.

**3.3 — the hut upgrade is `ironwood`, not `ironwoodHuts`.** Cosmetic for RR, but it is
the same class of identifier error that cost this project a round in v0.37
(`shrineSolari` vs `shrine`). The four `hutPriceRatio` values, and the absence of
`logHousePriceRatio` and `mansionPriceRatio`, verify exactly.

Also verified exactly, and load-bearing below: Kittens' luxury happiness (§6.3), all six
worker base rates, `catnipPerKitten -0.85`, the five saw values, the six axe values, and
`libraryRatio` at 0.02 × 3 upgrades.

---

## 4. Pass conditions, honestly

| Condition | Result |
|---|---|
| Knowledge & Culture receive `catCharts × catReligion × catPolicy` and nothing else | ✅ excluded four move knowledge/culture ×1.000000 at three save states |
| `caps.knowledge` == Σ(building caps) exactly, before the compendium term | ✅ **47,650 == 47,650** with every storage multiplier in the game switched on |
| `champStore` gone from `computeCaps()`, `champPassive("storage")` no call sites | ✅ |
| Poppy-led knowledge ceiling identical to another leader | ✅ **165,150 == 165,150** at the measured Icathia stock |
| ...and material ceilings 8% higher | ✅ **×1.080000** |
| `buildingJobBoost` remains unbounded | ✅ ×1.996 on doubling 400→800 copies |
| Science stock near 30 / 30 / 25 / 13 | ❌ **44 / 32 / 45 / 47** |
| ...Poppy-drake save vs neither, agree within 10% | ⚠️ see §9.1 — the ceiling half proven *exactly*, the two-run half not run |
| Per-worker ore : timber between 1.6 and 2.2 | ❌ **3.66** |
| ...each within 25% of the Part 2.5 table at measured N | ✅ ore **100%** of the table, timber **78%** |
| Population 115–140 at Icathia and still rising | ❌ **166**, rising to 202 |
| 130 wanderers by y600 | ✅ median **y287.4** |
| Morale ≥ 0.90 at Icathia | ✅ **1.19** |
| ...with no change to the morale code | ❌ overridden by Jerry's directive 3 — isolated in §6.3 |
| Median tech step ×1.10–1.20 | ✅ **×1.1292**, 10 exact ties |
| Geometric mean ×1.25–1.30 | ❌ **×1.2107** — arithmetically impossible, see §7 |
| Every Era-3 cost in effective-raw terms | ✅ §2 |
| Champion aggregate ×1.5–3.0 | ❌ **×12.46** at Icathia, **×80.99** at full level 10 |
| Sparks y350–500 | ❌ **y136.9** median |
| Doors of Icathia y1,400–2,300 | ❌ **y294.6** median |
| No champion at level 10 before Era 3 | ✅ |
| First champion before y120 | ✅ median **y80.8** |
| `G < 0.8` at max `M` | ✅ |

---

## 5. Multi-seed — the outstanding v0.44 item, paid

Four seeds, 3,000 game-years each, ~29 minutes wall apiece.

| Milestone | seed 1 | seed 2 | seed 3 | seed 4 | median | spread |
|---|---|---|---|---|---|---|
| Rites of Targon | y60.1 | y51.1 | y63.6 | y45.8 | y55.6 | 1.39× |
| First champion | y83.1 | y78.4 | y83.9 | y62.5 | y80.8 | 1.34× |
| **Sparks** | y138.3 | y137.7 | y124.0 | y136.1 | **y136.9** | 1.12× |
| Chemtech | y193.8 | y181.3 | y186.4 | y182.4 | y184.4 | 1.07× |
| Hexcore | y272.2 | y259.8 | y267.8 | y256.6 | y263.8 | 1.06× |
| Deep Works | y291.5 | y282.1 | y293.4 | y278.6 | y286.8 | 1.05× |
| **Doors of Icathia** | y298.9 | y290.3 | y299.4 | y288.4 | **y294.6** | **1.04×** |
| 130 wanderers | y291.9 | y282.8 | y293.8 | y280.2 | y287.4 | 1.05× |
| Peak population | 202 | 202 | 206 | 200 | 202 | 1.03× |
| Final morale | 117 | 117 | 116 | 118 | 117 | — |

**The spread tightens monotonically with era.** Icathia lands inside 1.04× across four
seeds — the tightest agreement this project has measured. Every v0.45 number in this
report is a median, and none of the conclusions turn on a single seed.

---

## 6. Jerry's three directives

### 6.1 — Keeper's Verdict → +8% on materials specifically ✅

Shipped exactly. `POPPY_CAP_MULT = 1.08`, scoped by the same three guards
`computeCaps()` reads (`CAP_MULT_EXEMPT`, `SCHOLAR_CAPS`, `renown`). Measured on the
Icathia stock: knowledge **165,150 → 165,150** (×1.000), timber **834,234 → 900,973**
(×1.0800).

The lead string is now **generated** from those guards rather than written. The old one
promised "even Renown" — Renown stopped taking it in v0.43, so that tooltip had been
lying for two versions before this round touched it. It also no longer collides with her
Skill name (`Iron Ambassador` vs `Keeper's Verdict`), the same defect class as the
Jarvan/Swain collision fixed in v0.43.

### 6.2 — Vigor is the right home for the passive ✅

`{ key: "vigor", base: 15 }`, wired into `boosts.vigor` alongside the other champion
passives and bounded by the existing `BOOST_LIMIT.vigor` of 1.5. Measured ×1.15 on vigor
production at level 0. No two champions share a passive key and base.

### 6.3 — Flat luxury morale ✅ — and it turns out to be exact Kittens parity

The directive is not a house tuning decision. It is what the source does.
`js/village.js`, `updateHappines()`:

```javascript
var happinessPerLuxury = 10;
for (var i = resources.length - 1; i >= 0; i--) {
    if (resources[i].type != "common" && resources[i].value > 0){
        happiness += happinessPerLuxury;
```

**+10 per distinct luxury held, gated on `value > 0`, with no quantity term anywhere in
the loop.** One unit and one million units are identical. RR's `10 × min(1, stock /
luxuryComfort())` ramp was the invention. So the magnitude you asked me to find is
**10 each, 30 total** — the source's own number, and by coincidence exactly the ceiling RR
already had, which is why Part 3's predicted arithmetic (100 − 36.5 + 30 + ~15 ≈ 108)
survives the change untouched.

The Festival still pays the full set, so it is now worth precisely what your larder is
missing — which preserves its "worth most when the larder is thin" intent better under the
flat rule than under the ramp.

**This conflicts with Part 3's instruction not to touch the morale code, so I A/B'd it**
— same build, same seeds, only the luxury term differing, 310 years:

| | ramp (control) | **flat (shipped)** |
|---|---|---|
| morale in 90–140 band after y60, seed 1 | 84% | **99%** |
| ...seed 3 | 87% | **100%** |
| morale below 90 before y50 | **0% ❌** | **0% ❌** |
| Icathia, seed 1 | y304.3 | y298.9 |
| Icathia, seed 3 | y308.8 | y299.4 |
| final population, seed 1 | 188 | 202 |

Three things fall out, and the second is the one that matters:

1. **Part 3 was right.** The housing fix *alone* already clears the ≥80% band at 84–87%.
   Your directive adds 12–13 points on top; it is an improvement, not the fix.
2. **The failing "morale dips below 90 before y50" condition is NOT caused by your
   directive.** It reads 0% in *both* arms. Without this A/B I would have reported the
   flat rule as the cause and been wrong. The real cause is that Part 3 and Part 4
   together make the early settlement small enough that crowding never bites before y50 —
   population is 40 at Sparks, and crowd penalty is `(pop − 5) × 2`.
3. The flat rule slightly *accelerates* Era 3 (5–9 game-years) because higher morale is
   more production. It is a small cost against the pacing target, paid for a large gain in
   band occupancy.

Morale is the headline improvement of this round: **2% → 99%** in band, and final morale
**31 → 117** against 477 → 202 population.

---

## 7. The tech ladder: the two conditions cannot both hold

Median ✅ ×1.1292. Geometric mean ❌ ×1.2107 against a ×1.25–1.30 target. That miss is not
a tuning failure, it is arithmetic, and it is worth stating in closed form because it will
recur.

The geometric mean of the steps of a sorted price list telescopes:

```
geo = (max / min)^(1/(N-1)) = 4500^(1/(N-1))      [30 knowledge -> 135,000 knowledge]
```

It depends only on the **tech count**. It is the same identity that produces the spec's own
Kittens figure: 4500^(1/35) = ×1.2717, the ×1.272 Part 0 quotes.

| N (science-costed techs) | geometric mean |
|---|---|
| 35 (v0.44) | ×1.2807 |
| 36 (Kittens' count) | ×1.2717 |
| 38 | ×1.2553 |
| **39** | **×1.2478** ← first value below the band |
| **45 (v0.45 as shipped)** | **×1.2107** |

**The band ×1.25–1.30 admits at most 38 techs. The directive "add 8–10 side techs" puts RR
at 43–45.** RR was already inside the band at 35. Adding *any* branch inside the price
span lowers the mean; adding three keeps it in band.

I shipped all ten, because the content directive is explicit and Jerry's override is to
action every item — and because the median condition, which the branches exist to fix,
now passes with 10 exact ties. But I could have satisfied both conditions by shipping
three, and chose not to. The analyzer should pick: ten branches and a mean of ×1.21, or
three branches and a mean of ×1.2553. Kittens' own answer is 36 techs with five ties.

All ten are leaves, all ten sit on an exact existing rung, each opens exactly one upgrade,
no existing price moved, and monotonicity along every prerequisite chain holds.

---

## 8. Part 2, measured: the composition is exact, the timing and the counts are not

The ore line reproduces the spec's formula **to the digit** at every checkpoint.

| | Sparks | Hexcore | Icathia |
|---|---|---|---|
| N: Mine / Quarry / Lumber Mill | 12 / 0 / 15 | 46 / 37 / 34 | **60 / 55 / 40** |
| ore category, spec formula `1 + 0.25M + 0.40Q` | 4.00 | 27.30 | 38.00 |
| ore category, **measured** | **4.00** (100%) | **27.30** (100%) | **38.00** (100%) |
| timber category, spec formula `4.2 × (1 + 0.195N)` | 16.49 | 32.05 | 36.96 |
| timber category, **measured** | **8.37** (51%) | **20.06** (63%) | **28.86** (78%) |
| per-worker ore | 1.000 | 6.825 | **9.500** |
| per-worker timber | 0.753 | 1.806 | **2.597** |
| **ratio** | 1.33 | 3.78 | **3.66** |

Two distinct causes, and neither is the composition:

**8.1 — The timber line is back-loaded and ore's is not.** Ore's two buildings work at full
strength from the first copy; timber's depth is *entirely* upgrade-gated, and the axe and
saw rungs are paired with Era-3 material tiers (`sparks`, `deepWorks`, `icathia`) exactly
as E2 and E3 specify. So timber runs at **51%** of its intended category at Sparks and only
reaches 78% at Icathia, where the last two rungs have just unlocked. The pairing was
deliberate and it is the thing that hurts.

**8.2 — The spec's table assumes equal N and the settlement does not build equal N.** At
Icathia it holds **115 ore ratio-buildings against 40 Lumber Mills**. Evaluate the spec's
own formulas at N=40 for both and the ratio is 2.03, inside the band. Evaluate them at the
measured counts and it is 3.66. The composition fix is arithmetically perfect; it is being
fed 2.9× as many ore buildings.

The delivered rate tells the same story more gently: 9,215 ore/s across 42 miners against
4,062 timber/s across 43 woodcutters is **2.32:1 per assigned worker** — just outside the
1.6–2.2 band rather than far outside it.

`buildingJobBoost` is untouched and unbounded, per the explicit no-regression item.

---

## 9. What I could not satisfy, and why

**9.1 — the two-save science-stock comparison.** The condition asks for the science stock
measured on a Poppy-leading Mountain-Drake save *and* a save with neither, agreeing within
10%. I cannot force either state across a full run without editing the bot's leader
rotation and drake hunts, and editing the bot to produce a measurement is exactly the
class of error that dominated v0.41–v0.42. **The half the spec says matters most — "the
two saves should now agree on the knowledge ceiling exactly" — is proven exactly**, at the
measured Icathia stock and at 30/30/25/13, by unit test: 165,150 across all three variants.
The building-count half is not run, and I am reporting it as not run rather than
approximating it.

**9.2 — the Convergence stripe. Fourth deferral, per Part 9 — but the blocker is gone.**
The input has been unmeasurable for three rounds. It is measurable now, across four seeds,
inside the spec's own 3× condition:

| | seed 1 | seed 2 | seed 3 | seed 4 | median |
|---|---|---|---|---|---|
| Convergence at Sparks | 0.98% | 1.58% | 1.07% | 1.42% | 1.24% |
| Worship at Sparks (back-solved, stripe 20,000) | 19,404 | 40,764 | 22,149 | 34,364 | **28,256** |

Spread **2.10×**, inside 3×. The spec's own rule `s = W₁/15` gives **s = 1,884**; solving
the curve directly for 6.5% gives **s = 1,159**.

The stripe is still **20,000** and I did not touch it. Note *why* the input moved again:
Part 4's acolyte cut (0.012 → 0.0075) and a settlement of 202 rather than 477 dropped
Worship-at-Sparks from v0.42's ~500,000 — which is what set 20,000 — to ~28,000, a factor
of 18. **The stripe is now 17× too large, and that is a v0.45 consequence, not a v0.42
error.** At the far end it overshoots the other way: 265% at y3,000.

**9.3 — Sparks and Icathia both land far below their bands**, and below the spec's own
stated-in-advance prediction. §1 is my account of why. The spec says "if Icathia lands
above 2,800 the lever is not the tech ladder" — it landed at 294.6, so that guidance does
not apply and I did not re-price anything.

**9.4 — the champion aggregate is ×12.46 at Icathia and ×80.99 at full level 10**, against
a ×1.5–3.0 paragon-slot budget. Ten passives at level 10 are each ×1.31–×1.77:

```
camp 1.581 · devotion 1.774 · caravan 1.465 · village 1.310 · gold 1.581
knowledge 1.465 · culture 1.774 · craft 1.465 · respawn 1.581 · vigor 1.581
```

The `passiveMult` curve — `(1 + 0.5√level)`, ×1.5 again at level 10, so ×3.872 at cap — is
what does it, not any single champion. Untouched: it is a roster-wide lever and belongs in
a spec.

---

## 10. What shipped

**Part 5 + Part 8.1, together as directed.** `CAP_MULT_EXEMPT = { vigor: 1, knowledge: 1 }`;
the champion storage multiplier deleted from `computeCaps()` entirely; the mountain-drake
loop and the leader loop both guarded; Poppy's passive `storage 8` → `vigor 15`;
Keeper's Verdict ×1.25-on-everything → Iron Ambassador ×1.08-on-materials, prose generated.
Both stale comments deleted — the false "Kittens has NO multiplicative science-cap line"
(it has `libraryRatio`, gated out of RR's era window, which is why the directive survives
its own justification) and "the clamp is retired" sitting above a live clamp.

**Part 1.** `TRANSIENT = { knowledge: 1, culture: 1 }`, `globalTransient = catCharts ×
catReligion × catPolicy`, applied through a single `globalMultFor()` that the breakdown
panel also calls — derived, not restated, because that is the fourth tooltip in this file
to drift.

**Part 2 E1–E3 + Part 4's woodcutter, together as directed.** Miner tool line deleted
(`zauniteDrills` → Mine 0.20→0.25, `sumpVentilation` → Quarry 0.35→0.40, Masterwork Tools
off the miner, Augment Chamber's `miner: 0.15` removed, ore out of `resRatio`); a six-rung
axe line summing 3.20 → **×4.20**; a five-rung saw line summing 0.95 → **0.195 per Mill**;
woodcutter 0.30 → **0.09**. `jobBoostPerCopy()` is generalised rather than branching on a
building id — the generalisation v0.44's Hexdraulic hard-code left a warning to write.

**Part 3.** Both Longhouse reducers deleted (Kittens has no `logHousePriceRatio`), the
Longhouse pinned at 1.15 forever, and `stonecutGuild` / `hexboundJoinery` re-pointed at the
**Storehouse** — 1.75 is RR's one punitive ratio, which is the only condition under which
Kittens ever discounts a building. Shelter ladder re-derived to
**2.20 → 1.83 → 1.61 → 1.43 → 1.355** against Kittens' 2.50 → 2.00 → 1.70 → 1.45 → 1.3516.
Both reducer tables now generate their own upgrade descriptions, closing a fifth drift
source: both Shelter strings still promised "1.75 → 1.5" against a base that became 2.20
two versions ago. The false `MORALE_RELIEF_LIMIT` justification replaced with the true one
(Kittens' `unhappinessRatio` has no floor and its Broadcast Tower pays −0.75/copy, so
Kittens lets crowding go negative — RR's bound is a divergence from a behaviour we do not
want).

**Part 4.** woodcutter 0.09, loremaster 0.175, acolyte 0.0075, consumption 0.35 → **0.425**
(85% of one farmer, Kittens' `catnipPerKitten` ratio exactly), True Ice Cellars → 0.34.
Miner 0.25 and jungler 0.30 already exact, unchanged. **Housing and food are separately
measurable and here are the two numbers:** max-affordable population is now **202** (was
477) and years-to-fill is **y287.4** to 130 wanderers (was y164.3).

**Part 6.** Ten branch techs — Coinage, Chorale, Falconry, Lapidary, The Cartwright's Rule,
Kindling Theory, Poro Husbandry, The Baron's Tribute, Shimmerworks, Chronometry — each on an
exact existing rung, each a leaf, each opening exactly one upgrade, all ten deliberately
outside the categories this round measures. The Research panel now renders cost-sorted,
because declaration order stopped being ladder order the moment branches existed.

**Part 7.** `effcost.mjs`. No price changed.

---

## 11. What I would do next

1. **The ore side, again.** Every miss in §4 traces to 9,215 ore/s at Icathia: the science
   stock overshoot, the 115-vs-40 building asymmetry, and Era 3 clearing in a sixth of its
   target. Part 5 proved the knowledge *ceiling* is not the lever. Part 1 proved the
   knowledge *multiplier* is not the lever either — it took ×7.5 away and bought 158 years.
2. **Front-load the timber lines or re-gate them.** Timber runs at 51–78% of its designed
   category for the whole of Era 3 because every rung of its depth is Era-3 gated, while
   ore's breadth works from copy one. This is E2/E3 working exactly as written and still
   producing a 3.66:1 ratio.
3. **Set the Convergence stripe.** The input is measurable for the first time in four
   rounds (§9.2), 2.10× spread, median W₁ = 28,256, and the current value is 17× too large.
4. **The `passiveMult` curve**, if the ×1.5–3.0 champion budget is real. ×3.872 per
   champion at level 10 is what produces ×80.99.
5. **Decide the ladder question in §7** — ten branches or three. It cannot be both.

The one thing I would not do next is re-price the tech ladder. It is at exact Kittens
parity rank for rank, the median now sits in band, and Era 3 is short for a reason that has
nothing to do with what knowledge costs.
