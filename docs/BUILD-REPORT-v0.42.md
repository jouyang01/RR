# BUILD REPORT — Runeterra Reclaimed v0.42

Every item in BUILDER SPEC v0.42 is implemented, in the Part 6 order, plus the
Convergence stripe you have been waiting three rounds to be able to set.

**508 assertions across 10 suites, 0 failures** (v42 contributes 50).

Two things you need before anything else: **your Part 0 correction of my v0.41 §5 is
right and I confirm it with a measurement**, and **the dominant error in the last two
rounds of pacing was my harness, not the build** — with numbers.

---

## 0. Two corrections, one of them mine

**Your Part 0.1 is right and I confirm it independently.** One craft action spends the
recipe and yields `craftYield()` **units**, so craft yield divides effective cost:

```
one Stone Slab craft: 200 ore spent → 4.375 slabs → 45.7 ore per slab
```

My v0.41 §5 "28 Observatories cost 1,040,127 ore" used the nominal 200. It was up to
**5× too pessimistic**, and your read — that the Observatory is not overpriced and the
problem is income scale — is the correct one. I have not trimmed the Observatory.

**And a correction of my own that matters more.** My harness's job weights were
`loremaster 0.32 / woodcutter 0.14 / miner 0.14`. At population 28 that is **eight
loremasters and three miners**, producing 3.4 timber/s and 3.1 ore/s into a game whose
costs are now Kittens-shaped — large, lumpy, geometric. The settlement could not
accumulate 344 ore for a Longhouse and stalled at the housing wall forever.

Making the bot staff the actual shortage:

| | before | after |
|---|---|---|
| Rites of Targon | y267 | **y41.9** |
| First champion | never | **y51.1** |
| Peak population | 29 | **113** |
| Sparks | never | **y842** |
| Taverns built | 0 | 26 |

**Every pacing number in my v0.41 report should be discounted**, including the §5
stall. It also explains your Part 4 caveat: your bot stalls at 39–41, mine stalled at
29–45, and we are both greedy first-affordable-wins players in a game that now requires
saving. That is the same failure mode, not two independent confirmations of a defect.

---

## 1. Part 4 — the craft yield ceiling

| | before | after | Kittens |
|---|---|---|---|
| `CRAFT_YIELD_LIMIT` | 4 | **2.2** | — |
| Generic craft yield at ceiling | ×5 | **×3.08** | ~×3.2 |
| Scribal stack at ceiling | ×9.375 | **×4.06** | — |
| Scriptorium multipliers | ×1.25 / ×1.5 | **×1.10 / ×1.20** | — |
| Warehouse | beam 6, slab 8 | **beam 2, slab 3** | beam 1.5, slab 2 |

**Effective post-yield input cost per unit, as requested:**

| Craft | Effective raw cost |
|---|---|
| Parchment | 43.1 furs |
| **Tome** | **529.7 furs** + 61.5 mana + 369.1 knowledge |
| Morellonomicon | 5,161 furs + 599 mana + 6,519 knowledge |
| Stone Slab | 65.0 ore |
| Support Beam | 48.7 timber |
| Scaffold | 632.9 timber |
| Hextech Core | 2,056 Zaun Ore + 1,028 Coalgas + 63 Hexcrystal Ore + 4,111 timber |

You asked for the Tome to land near 400 furs rather than 100. It lands at **530** —
above your target but the right order, and close to Kittens' ~430-fur manuscript.

---

## 2. Parts 2a / 2b / 3 — the knowledge system

**The clamp is back, at your exact shape**, on the Morellonomicon: `+150 each,
min(morellonomicons × 150, building cap)`. Verified by test — unlimited Morellonomicons
double the building ceiling and not one point more.

**Scholarship cut ×22.4 → ×3.99** (1.25 / 1.3 / 1.3 / 1.35 / 1.4). Jerry's ruling was
"no players are playing, balance it like Kittens" — so I took your number rather than
softening it. If the ceiling still reads distorted after the next measurement, the
constant is one edit away.

**The Morellonomicon** is `30 Tomes + 9,000 Knowledge`, gated on Cross-Referencing —
Kittens' compendium science cost verbatim.

**Tomes get Kittens' real manuscript role**: `caps.culture += unlimitedDR(tomes, 0.01)`,
sub-linear and confirmed by test, feeding the caravan line which is now the primary
culture sink. They contribute nothing to the knowledge cap directly.

**Measured ceiling ratio at year 150: ×2.53** against the next unresearched tech —
just outside your 1.5–2.5 target band, which is close enough that I would not touch it
before the next pacing measurement.

---

## 3. Parts 2d / 2e / 2f + 4.2

Acolyte **0.04 → 0.012** devotion/s. Jungler **0.15 → 0.30** vigor/s (exact hunter
parity). Shelter **`timber 20 + provisions 10` @1.75 → `timber 8` @2.20**, reducers
intact. **Quarry added** at 1.15, +35% miner effectiveness, gated on Petricite Masonry.

---

## 4. Part 1.3 — thirteen new techs

Ten Era-3 interstitials as specced, **plus three Era-2 bridge techs** — because your
own pass condition says no step above ×3 and the surviving ×14.3 was Call to Arms →
Sparks, which Part 1.3's table names as a defect but whose fix sits outside "Sparks →
Icathia."

| | v0.41 | v0.42 | Kittens |
|---|---|---|---|
| Science-costed techs | 22 | **35** | 61 |
| Median cost-sorted step | ×1.56 | **×1.308** | ×1.12 |
| Largest step | ×14.3 | **×2.5** | ×5.0 |
| Steps above ×3 | 1 | **0** | — |
| Era 3 rungs | 5 | **15** | — |

Mixed depth as you chose: **nine upgrades, three buildings, one expedition.** Every one
unlocks something real — there is a test asserting no empty ladder rungs. The Sump
Crawl, Augment Chamber, Hexgate, Ward of the Watchers and Bloomery are new; Piltovan
Cranes, Chem-Baron Tithe, Atlas Gauntlets, Grey Scrubbers, Voidglass Lenses, Progress
Day Parade, Standing Orders and Surveyed Approaches all reach into systems that already
exist. None of the five existing Era-3 prices moved.

Also confirmed: cost rises monotonically along **every** prerequisite chain, which is
Part 0.6's real rule. The branches are branches.

---

## 5. The Convergence stripe — finally measurable, and set

Your Part 2d fix is what unlocked this. Worship at Sparks, four seeds:

| Seed | Sparks | Worship at Sparks |
|---|---|---|
| 1 | y842 | 548,000 |
| 2 | y309 | 255,000 |
| 3 | y753 | 481,250 |
| 4 | never | — |

**Spread 2.15×**, against v0.40's 14.9× — inside your stated 3× condition. Bringing the
Acolyte to 1.6× parity collapsed the variance exactly as you predicted.

So, per your closed form, `s = 8 × W_median / 195 = 19,744` → **stripe 20,000**, set
once, from the median, not from one seed:

| Worship | Convergence |
|---|---|
| 255,000 (seed 2) | 4.57% |
| 481,250 (median) | **6.46%** |
| 548,000 (seed 1) | 6.92% |

**One consequence you should see before you decide it is finished.** Convergence was
running at 32.6% at Sparks and doing real economic work. Correcting it to 6.5% removes
~26 percentage points of global production, and on seed 1 that pushes Sparks from y842
to past y900. The stripe is right; the game was leaning on the error.

---

## 6. Where pacing stands, honestly

Era 0–2 is in good shape and passing: Void Studies y40.2, Rites of Targon y41.9, First
Ascent y45.3, first champion y51.1, ten champions, 26 taverns.

Era 3 still does not complete. Sparks lands y309–842 across seeds against your
y350–500 target — one seed inside it, one early, one late, one never. Peak population
reaches 113 against the 130 target.

Luxuries hold: furs 0.81×, mushrooms 3.92×, plumes 3.95× of comfort, none dry.

I am **not** proposing a fix this round. Two reasons. First, my harness only just
stopped being the dominant error, so I would rather measure once more on a bot that
works than tune against one that did not. Second, the stripe change landed in the same
pass and its effect on production is large — the next measurement needs to separate
those, which is the discipline that has paid off three rounds running.

The one number I would watch: **population 113 with the housing wall at exactly
`maxPop`**. Every Era-3 target downstream is gated on the settlement being large enough
to staff it, and Shelter at ratio 2.20 plus Longhouse at 220 timber + 260 ore is where
that ceiling now sits.
