# BUILD REPORT — Runeterra Reclaimed v0.43

Every item in BUILDER SPEC v0.43 is implemented, in the Part 4 order, plus Jerry's
duplicate-passive fix. **556 assertions across 11 suites, 0 failures** (v43 adds 40).

Two measurements matter more than the rest: **the A/B Jerry asked for puts a number
on the Part 2 tailwind loss**, and **the housing change alone did nothing**, which is
a clean negative result that only shipping it alone could have produced.

---

## 1. The A/B — the champion change costs 422 game-years

Same build, same seed, 1,400 years. The only difference is `recruitCost()` escalating
and `canTrain()` requiring XP; everything else is byte-identical.

| | Sparks | Peak population |
|---|---|---|
| **Without the champion change** (v0.42 behaviour) | **y536.6** | 107 |
| **With the champion change** | **y958.7** | 102 |
| **Delta** | **+422.1 years** | −5 |

Neither reaches Chemtech inside 1,400 years. So the Part 2 prediction is right and now
quantified: **moving the champion stack out of the middle of the game costs Era 3 about
420 years of entry**, on top of the ~26 percentage points the stripe correction removed
last round. As you said — both corrections are right and neither should be reverted.

---

## 2. Part 3, shipped and measured alone as directed — and it did nothing

The implementation is exactly the spec. Measured ratio ladder:

| Reducers owned | Shelter ratio |
|---|---|
| none | 2.20 |
| Ironwood (Smelting) | 1.65 |
| + Petricite Frames (Hexcore) | 1.2813 |
| + Hexcrete Frames (Deep Works) | 1.1731 |
| + Voidwright Frames (Icathia) | **1.15** |

Shelter #40 goes from **1.81 × 10¹⁴ timber to 1,863**. Longhouse 1.15 → 1.09 → 1.055
with the new Hexbound Joinery.

**One deviation from your prediction, and it is the primitive not the deltas.** You
predicted ≈1.28 at all four. RR's `limitedDR` is a different curve from Kittens'
`getLimitedDR` — it runs free below 0.75×limit then hyperbolic — so the same Σ = 1.20
against ratioBase 1.20 lands at **1.15**, and 1.28 arrives at the *second* reducer
rather than the fourth. I shipped your deltas verbatim; if you want 1.28 at the end of
the line, the deltas are what to restate.

**And the measurement, 1,000 years, two seeds:**

| | seed 1 | seed 2 | mean |
|---|---|---|---|
| v0.42 control | 77 | 44 | 60.5 |
| v0.43 housing only | 47 | 56 | 51.5 |

**No signal.** One seed up, one down, mean slightly lower — noise, not effect. The
Shelter ratio was not the binding constraint. That matches what I measured in v0.42:
the wall was the **Longhouse** at 291 timber + 344 ore against a settlement holding 72
timber and 113 ore. Housing is not too expensive; **income is too small**.

Shipping this alone is what made that visible, so the directive earned its keep.

---

## 3. Part 1 — champions, and what the measurement shows

Every number reproduces your tables:

| | spec | measured |
|---|---|---|
| Recruitment ladder | 250 … 17,180 | identical |
| Cumulative to ten | 45,395 | **45,395** |
| XP to level 10 | 69,255 | 69,292 |
| Leader XP at full buildings | 0.30/s | 0.297/s |
| Years of leadership to level 10 | 289 | **292** |
| Renown ceiling at Chemtech-era Masonry | 40,446 | **40,446** |

Signature material does not scale — Leona's Devotion is identical at rung 1 and rung
10. Vigor stays out of the Masonry line. XP is lifetime-cumulative and never spent;
there is a test that banks past three thresholds, levels three times off one bank, and
confirms the XP total is untouched by levelling.

**Pass conditions, measured at year 700 on the full build:**

| Condition | Result |
|---|---|
| No champion reaches level 10 before Era 3 | ✅ all ten sit at **level 5** |
| A benched champion reaches level 5 or 6 | ✅ every one is at 5 |
| XP observed banking past a threshold | ✅ **all ten**, visibly, in the UI |
| First champion by y120 | ✅ y34.5 |
| **Tenth champion 70–100% through Era 3** | ❌ **all ten recruited before Sparks** |
| Renown ceiling never binding >40 years | ❌ pinned at cap 23,208 |
| Population 130 by y600 | ❌ peak 102–107 at y1,400 |

Level 5 is a clean hard stop, and it is your design working: `trainCost` switches from
Tomes to **Hextech Cores** at level 5, which needs the Hexcore tech. Nobody can pass
level 5 until Era 3 is genuinely running.

**The one that missed, with the number.** The Renown ceiling reaches **23,208 before
Sparks** — enough for the 17,180 tenth rung — because Masonry, the three tech-granted
Renown caps and Poppy's `champStore` all compound, where your table assumed Masonry
alone. So the ladder gets outrun: ten champions land in Era 2, just later than before.

Two ways to close it, and I have applied neither, per the one-lever discipline:

1. **Steepen the ladder** — ratio 1.6 → 1.85 puts the tenth rung at 55,700, which the
   ceiling does not reach until Chemtech Silos. Jerry confirmed 1.6, so this is a
   change to a confirmed number and yours to make.
2. **Slow the ceiling** — put Renown on the Masonry line at a *fraction*, e.g.
   `√masonryMult`, so it tracks era progression without tracking it one-for-one.

---

## 4. Part 0 and Jerry's directive 4

**The Scholarship drift is fixed at the root.** The five multipliers now live in one
`SCHOLAR_LINE` constant that `computeCaps()` reads *and* the description strings are
generated from, so they cannot separate again — the same fix as the v0.40 morale
tooltip. There is a test that walks every tier and asserts the prose matches the
multiplier the code actually applies.

**Jarvan and Swain no longer share a passive.** Swain moves from `village +8%` — which
was Jarvan's Demacian Command twice over — to **`knowledge +12%`, "Administrative
Vision"**, which matches his Raven Ledger lead (research 20% cheaper) and the ravens
auditing everything. A test asserts no two champions share a passive key and base, and
another confirms the new passive actually reaches knowledge production.

---

## 5. One live bug found while implementing

Reintroducing XP surfaced a save-migration bug: the v0.30→v0.31 handler unconditionally
`delete cc.xp` on load. With XP a live field again that **wiped every champion's entire
experience history on the first reload**. It now only fires on the genuinely old shape
(xp present, `lvl` absent), strips the retired `post` field separately, and back-fills
`xp: 0` for champions recruited before v0.43.

---

## 6. Where this leaves things

Era 0–2 is unchanged and healthy: first champion y34.5, ten champions, Rites of Targon
early. Era 3 is now slower than it has ever been — Sparks y958 with the champion
change against y536 without — and Chemtech is out of reach inside 1,400 years.

That is three deliberate corrections stacking: the Convergence stripe (−26pp global
production), the craft-yield ceiling, and now the champion stack leaving mid-game. Each
was individually right and measured. Together they have removed most of Era 3's
tailwind and nothing has replaced it.

Your own Part 2 names the lever: **more independent multiplier categories on the ore
side**, the v0.42 Part 4 item that was never finished — RR added the Quarry but has
nothing like Kittens' ten-category minerals stack. The measurement that keeps pointing
there is the one from §2: housing is not expensive, income is small.
