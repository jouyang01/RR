# BUILD REPORT v0.52 — the knowledge bound is gone, and the parity is exact

**Kittens' own end-of-tree 30/30/25/13 now delivers ×20.8000 against the source's ×20.80. It delivered ×3.9693 at v0.51.** That is the round.

**And the round's second finding is mine, not the spec's: the Shimmer Refinery's measured count of 0 was never a price problem. `shimmerRefinery` is not in the simulator's build order and never has been.** Every prior round that reported "Refineries: 0" was reporting that the bot never looked, not that the building was too expensive. The recost still shipped — Jerry ruled it — but the pass condition it was written against could not have been met by any price.

Shipped as **v0.52**. The spec is titled v0.51; v0.51 was the pixel banner.

---

## 1. My errors, first

**1.1 — the Shimmer Refinery finding above is a four-round-old apparatus defect I did not catch until this round.** `simcore.mjs`'s greedy build order lists 30 buildings and `shimmerRefinery` is not one of them. v0.50 reported "Shimmer Refineries: 0" at all three milestones and moved the building's tech rung on the strength of it; v0.51 reported the same; this spec's §3.2 wrote a pass condition ("Refinery count at Icathia > 0") that no price could satisfy. The fix is one string in the order list. The lesson is the one the v0.47 isolation-script error already taught and I did not generalise: **a zero in a measurement is a claim about the apparatus until you have checked the apparatus.**

**1.2 — I ran `enhance-audit.mjs` against a stale reader after Part 1.2.** The provisions-boost reader still pointed at the Farmstead after Part 1.2 moved `boost` off it onto the Irrigation Channel, so the audit reported `boost_provisions_farmstead` at **×47.2 at 500 copies** — which reads exactly like an unbounded slot and is in fact the Farmstead's `prod` scaling linearly, as production does. Repointed at `irrigation`, the same measurement reads ×1.60 / ×5.94 / ×6.56 at 5 / 50 / 500, saturating. **Nothing was wrong with the game; the instrument was pointed at the wrong building for one run.**

**1.3 — three of my own new assertions were wrong before any of the spec's code was.** All three in `test-v52`: the migration test asserted a refund computed from `Σ ratio^i, i = 1..n` where the code uses `i = 0..n-1`; the Census-gate test asserted `renderCensus()` returns a shorter string when locked, which is true but was measured before `syncRoster()` had run so both sides were empty; and the `resRatio`-is-deleted grep matched the deletion comment that contains the word `resRatio`. The same comment-matching mistake as v0.51's banner check. **Twice now. The rule is: strip comments before grepping source, every time, without being reminded.**

---

## 2. Jerry's directive 2, answered independently

> *"Make sure that every other enhancing building (including but not limited to: mine/lumber mill/religion buildings/vigor) all enhance production the correct way."*

I did not take the spec's §0.2 table on trust. `enhance-audit.mjs` enumerates **every non-cosmetic effect field on every building**, then measures the delivered multiplier end-to-end through `computeRates()` at 5 / 50 / 500 copies and reports a linearity ratio: `((b−1)/(a−1)) / (hi/lo)`. **1.0 means unbounded; well under 1.0 means a bound is biting.**

### 2.1 The spec's single-violation claim is confirmed to the digit

| Mechanism | Building | ×5 | ×50 | ×500 | Verdict |
|---|---|---|---|---|---|
| `jobBoost.miner` | Mine + Quarry | — | — | linear **1.0000** | unbounded, correct |
| `jobBoost.woodcutter` | Lumber Mill | — | — | linear **1.0000** | unbounded, correct |
| `jobBoost.tinkerer` | Augment Chamber | — | — | linear **1.0000** | unbounded, correct |
| `globalBoost` | Foundry, Reactor | — | — | linear **1.0000** | unbounded, `catMonument = 1 + Σ` |
| `boost.devotion` | Sanctum | ×1.500 | ×2.938 | **×2.9949** | bounded at 1+2.0 ✅ |
| `boost.vigor` | Training Ground | ×1.500 | ×1.986 | **×1.9987** | bounded at 1+1.0 ✅ |
| **`boost.knowledge`** | **Observatory** | **×2.25** | **×3.9488** | **×3.9954** | **HARD ASYMPTOTE ×4.0 — the violation** |

**That was the only one.** Every religion building, every mine, the Lumber Mill and the vigor line were already correct: the religion and vigor stacks are bounded *deliberately* (RR-only bounds with no Kittens counterpart, recorded), and the ore/timber/tinkerer lines run through `jobBoost`, which is unbounded by design and measures exactly linear.

### 2.2 Two mechanisms the spec's table did not cover

Jerry's "including but not limited to" earned these.

**`poroRatio` is unbounded.** Four buildings (Frostguard Cairn 0.08, Avarosan Hold 0.15, Ice-Wrought Spire 0.30, Frozen Watcher 0.60), additive, no bound: **×41 at 500 copies, linearity 1.0000.** It is structurally consistent with Kittens' law — one category, additive within it — and it is RR-only content with no source counterpart, so there is nothing to be at parity *with*. **Reported, not touched.** It is the largest unbounded non-job category in the game and the analyzer should rule on whether that is intended.

**`audience` is unbounded in POPULATION, not in copies.** The Bard's Hearth multiplies its culture by `1 + audience × S.pop`. Measured: pop 20 → +0.04, pop 200 → +0.22, pop 2000 → **+2.02**. Kittens' Amphitheatre has no population term at all — `culturePerTickBase` is flat per copy. This is an RR invention that grows without limit in the one quantity the whole game is trying to grow. **Reported, not touched** — it is not in the spec and changing it in a round that already moves production twice would make neither measurable.

### 2.3 The full field census, post-change

```
globalBoost   hextechFoundry 0.06 | arcaneReactor 0.05        UNBOUNDED (by design)
foundryBoost  hexdraulicPlant 0.15                            UNBOUNDED, ×76 at 500
poroRatio     4 Freljord buildings                            UNBOUNDED, ×41 at 500  ← 2.2
audience      bardsHearth 0.05                                UNBOUNDED in pop       ← 2.2
jobBoost      miner / woodcutter / tinkerer                    UNBOUNDED (Kittens parity)
boost.knowledge  4 science buildings                          UNBOUNDED (v0.52 Part 0) ✅
boost.devotion / vigor / culture / gold / crystals             bounded, at parity
boost.provisions / mana                                        bounded v0.52 Part 1.3
campBoost     hunterLodge 0.15        linearity 0.0796        bounded and biting
craftBoost    workshop 0.06           linearity 0.0730        bounded and biting
tradeBoost    tradeDock/hexgate       linearity 0.0993        bounded and biting
sumpBoost     chembarrel 0.25         linearity 0.0120        bounded and biting hard
eatCut        poroPasture 0.003       linearity 0.3250        bounded
crowdRelief   bardsHearth 0.0115      linearity 0.1515        bounded at 0.88
```

---

## 3. Part 0 — the fix, and the proof

One key removed from one table.

```js
// v0.52 Part 0 — THE KNOWLEDGE KEY IS DELIBERATELY ABSENT, and must stay absent.
var BOOST_LIMIT = { devotion: 2.0, culture: 2.0, gold: 1.5, vigor: 1.0, crystals: 2.0,
                    provisions: 1.5, mana: 1.0 };
```

| State | Σ | Kittens gives | RR gave (v0.51) | RR gives (v0.52) |
|---|---|---|---|---|
| Kittens' end-of-tree **30/30/25/13** | 19.80 | **×20.80** | ×3.9693 | **×20.8000** ✅ |
| RR's measured **39/31/49/21** | 29.70 | ×30.70 | ×3.9801 | **×30.7000** ✅ |
| Linearity: ×5 → ×50 copies | 4.5 → 45 | — | — | **surplus ×10.000000, no knee** ✅ |

`test-v52` asserts the first row to `1e-9` and asserts the *absence* of the key with the source citation, so a future round cannot re-add it thinking it was an oversight.

**The mechanism is untouched.** Devotion still asymptotes at ×2.9949 against its 1+2.0 bound in the same measurement. What was removed is one entry, not the primitive.

---

## 4. The spec's Part 0.4 prediction, on the record and wrong

The spec put this in writing before the run: **"Sparks y148 → y60–90. Icathia moves much less. Era 3 lengthens or holds."**

| | baseline v0.51 | s1: Part 0 alone | s2: + Part 1 |
|---|---|---|---|
| Void Studies | 57.9 | 61.5 | 61.2 |
| Rites of Targon | 64.0 | 64.4 | 63.8 |
| **Call to Arms** | **97.2** | **88.1** | **77.0** |
| **Sparks** | **148.0** | **171.4** ❌ | **165.4** ❌ |
| Chemtech | 361.5 | 398.1 | 409.7 |
| Hexcore | 613.0 | 407.6 | 755.0 |
| Deep Works | 700.3 | 641.5 | 826.6 |
| **Icathia** | **803.9** | **735.2** | **857.7** |
| **Era 3 length** | **655.9** | **563.8** | **692.3** |
| peak population | 201 | 203 | 200 |

**Sparks moved the wrong way, and the reason is that Sparks is not knowledge-bound.** Its gate is `["twitch","caitlyn","heimerdinger"].some(recruited)` — a champion draw. Knowledge arriving faster does not open it; recruiting one of three champions does. **Call to Arms, which is the last purely knowledge-gated rung before it, moved 97.2 → 88.1 → 77.0, a 21% improvement** — that is where the ×5 knowledge multiplier actually shows up, and it is exactly where the prediction should have been aimed.

**This is the informative failure the spec asked for.** The prediction was sound arithmetic applied to the wrong gate.

**The Era 3 half of the prediction — "lengthens or holds" — is right on the shipped build and wrong on Part 0 alone.**

| build | Sparks | Icathia | **Era 3 length** | vs 655.9 |
|---|---|---|---|---|
| baseline v0.51 | 148.0 | 803.9 | **655.9** | — |
| s1 Part 0 | 171.4 | 735.2 | **563.8** | **−92.1** ❌ shortened |
| s2 + Part 1 | 165.4 | 857.7 | **692.3** | +36.4 |
| s3 + Part 2 | 150.4 | 804.3 | **653.9** | −2.0 |
| **s4 shipped** | **215.6** | **1042.1** | **826.5** | **+170.6** ✅ |

**Against the 1,400–2,300 target, Era 3 is 826.5 — 573.5 game-years short of the near edge, at 59% of the minimum.** It was 47% at v0.51. Part 0 alone made it *worse*; the movement came from Part 1's prices (+36) and, unexpectedly, from **Part 3.2's Shimmer Refinery recost (+172.6 on its own)** — 26 Refineries drawing 5.2 coalgas/s and 13 mana/s is the largest single brake this round applied to Era 3, and it was shipped as a *buff*. That is worth the analyzer's attention: the cheapest way to lengthen Era 3 found so far was making something cheaper.

---

## 5. Everything else the spec asked for

| Item | Status | Number |
|---|---|---|
| **0** knowledge bound removed | ✅ | ×3.9693 → **×20.8000**, exact parity |
| **1.1** Arcane Reactor second ×10 | ✅ | 40/80/60 → **400/800/600**, ratio and 0.05 held |
| **1.2** Irrigation Channel | ✅ | 0.03 @ 1.12 on **`mining`**, not Cultivation |
| **1.2** Farmstead is a plain field | ✅ | `boost` removed; provisions **337.63/s → 76.65/s** at the comparison state |
| **1.3** unbounded slots closed | ✅ | `provisions: 1.5`, `mana: 1.0` |
| **1.4** trade vigor normalised | ✅ | all five routes **175**; gold held per route |
| **2.1** `resRatio` deleted | ✅ | table, apply loop and breakdown branch; Cultivation still delivers **×1.10 exactly** |
| **2.2** Timberframe Joinery deleted | ✅ | Longhouse on `carpentry` alone, migration pair scrubbed |
| **2.3** Tavern → Bard's Hearth | ✅ | **0.0115/copy, derived** — §6 |
| **2.4** Bloomery + Refined Metallurgy deleted | ✅ | Steel Axes re-homed to `smelting`, zero orphans, ladder recomputed — §7 |
| **2.5** `CAMP_YIELD_LIMIT` comment | ✅ | census text replaces the false "insurance" claim |
| **2.6** proportionality assertion | ✅ | **deleted, not widened**, ruling recorded in the test |
| **3.1** Tinkerer/Augment chain | ✅ measured, untouched | §8 |
| **3.2** Shimmer Refinery recost | ✅ | plating 20+alloy 15 → **plating 4 + alloy 3**, scale stated — §9 |
| **3.3** zero-trade calibration | ✅ recorded | header block in `pacing.mjs`; banking policy scheduled v0.53 |
| **4.1** Sparks standing directive | ✅ | in `rr-design-spec.md` and at the `sparks` tech entry |
| **4.2** two source-doc corrections | ✅ | both live in the project docs |
| **5.1** Keeping the Rolls | ✅ | **900 → 1,300 knowledge** + 60 culture, branch on Songcraft's rung |
| **6** Eludium tier | deferred by the spec | not actioned, correctly |

**Nothing in the spec was skipped.**

---

## 6. Part 2.3 — the merge, sized rather than transferred

The spec: *"compute it from the measured counts, do not assume 0.05 transfers."*

Measured on a 900-year seed-1 run of the Part 0 + Part 1 build:

| Milestone | Taverns | Hearths | ratio |
|---|---|---|---|
| Sparks | 6 | 35 | 5.83× |
| Hexcore | 26 | 68 | 2.62× |
| Icathia | 41 | 92 | 2.24× |

Exact per-stage matches would be **0.00857 / 0.01912 / 0.02228** — they disagree by 2.6× because the Tavern was late and expensive (mining, 400/800/200 at 1.15) and the Hearth is early and cheap (songcraft, 80/40 at 1.10), so the count ratio falls as wealth rises. **Least-squares fit of `limitedDR(x·nHearth, 0.88)` to the old `limitedDR(0.05·nTavern, 0.88)` across all three pairs: x = 0.0115.**

| | old relief | new relief @ 0.0115 | Δ morale (crowd × Δrelief) |
|---|---|---|---|
| Sparks | 0.3000 | 0.4025 | **+8** (107 → ~115) |
| Hexcore | 0.8237 | 0.7385 | **−16** (137 → ~121) |
| Icathia | 0.8499 | 0.8017 | **−15** (118 → ~103) |

All three stay inside the 90–140 band, and it pulls the 137 peak down — the band gets *wider*, not tighter. **Measured morale on the shipped build: see §10.**

**One known bias, stated:** the Hearth counts above were measured on a build where the Tavern still competed for timber, ore and provisions. Post-merge those resources partly go to Hearths, so real Hearth counts will be **higher** than modelled and delivered relief slightly higher than the table. The spec anticipated this ("the Hearth count at any wealth will be higher"); §10's measured morale is the check.

**Migration.** `buildings.tavern` is dropped and refunded at **50% of the ratio-1.15 geometric sum** — 10 Taverns returns 4,060 timber / 8,120 ore / 2,030 provisions. The count is *not* carried onto the Hearth: at 80 timber + 40 provisions against 400/800/200, transferring counts would hand a returning player 40 Hearths for nothing. `test-v52` exercises the migration and checks the refund against the closed form, both buildings at once.

**Pass condition: exactly one building carries `crowdRelief`.** ✅ `bardsHearth`, asserted by enumeration in both `test-v50` and `test-v52`.

---

## 7. Part 2.4 — the ladder at 37 techs, recomputed and reported

The spec: *"Recompute all five and report them; if the median or geometric mean leaves band, say so rather than adjusting a price."*

| Condition | band | 38 techs | **37 techs** | |
|---|---|---|---|---|
| count | — | 38 | **37** | — |
| exact ties | ≥ 5 | 8 | **8** | ✅ |
| median step | ×1.10–1.20 | ×1.1333 | **×1.1222** | ✅ |
| geometric mean | ×1.25–1.30 | ×1.2553 | **×1.2632** | ✅ |
| largest step | ≤ ×3.4 | ×3.333 | **×3.333** | ✅ |

**All five hold. No price was touched.** Removing the 42,000 rung shortens the tail, which pulls the median down and the geometric mean up — both stay inside their bands with room.

**The orphan sweep caught one thing: Steel Axes.** It was `tech: "refinedMetallurgy"` and would have become unreachable. Re-homed to **`smelting`**, which already carries its own prerequisite (Ironwood Axes) and is the metal hub of the ladder. **Zero orphans** across upgrades, buildings and `req` chains, asserted.

The Bloomery refunds at 50% of its geometric sum (ore 900 / gear 25 / stoneSlab 20 at 1.15). **A researched `refinedMetallurgy` flag is dropped with no knowledge refund**, consistent with every prior tech retirement.

**Steel per second, re-measured rather than assumed small** — the Forge is now the only converter:

| | Sparks | Hexcore | Icathia |
|---|---|---|---|
| v0.51 (Forge + Bloomery) | 0.3611/s (7F, 0B) | 10.0238/s (39F, 46B) | 32.3072/s (55F, 47B) |
| **v0.52 (Forge alone)** | **0.4811/s** (9F) | **2.3445/s** (37F) | **17.5113/s** (54F) |

---

## 8. Part 3.1 — the Tinkerer chain, measured, not touched

Reported as the spec required. **No code changed.**

On the shipped build (s4), with the v0.51 range in brackets:

| | Sparks | Hexcore | Icathia |
|---|---|---|---|
| tinkerers | 1 | 1 | **1** (never more, at any milestone, in any build measured) |
| Augment Chambers | 0 | 0 | **1** [14–17] |
| crystals/s gross | 0.45 | 4.61 | **28.75** [23.7–42.2] |
| crystals held / cap | 1,755 / 3,213 | 22,623 / 22,680 | **132,771 / 132,771** |
| **time at cap** | — | — | **96.5%** of all elapsed ticks [96.1–97.2] |

**Instrumentation caveat, stated so the analyzer does not over-read the run logs.** `simcore.mjs`'s `KNOWLEDGE MULT` line computes Σ from **buildings only**, while the `delivered` figure it prints alongside includes the Scholarship-ladder Discoveries that also write to `boosts.knowledge`. The two are therefore not comparable past Sparks: at Sparks (few Discoveries owned) the line reads ×10.24 delivered against ×9.40 "Kittens would give", which is close; at Icathia it reads **×105.24 against ×35.75, and most of that gap is the missing upgrade terms in Σ, not an overshoot.** §3's parity table — measured directly at fixed counts with upgrades cleared — is the trustworthy comparison; the run-log line is a trend indicator only. **Fix the Σ sum to include UPGRADES before quoting that line again.**

**The tinkerer count is 1 at every milestone in every build measured.** A `jobBoost.tinkerer` of 0.40 per Augment Chamber is a ×7.4 multiplier on **one worker**. Whatever the Chamber is doing, it is not doing it through the job.

**And what the crystals are actually spent on — the number that matters:**

> **The entire non-repeatable crystal demand in the game is 580.** Ten discoveries (10 + 80 + 25 + 50 + 80 + 40 + 60 + 40 + 80 + 30 = 495), one tech (Hexcore, 60), one worship tech (Convergence, 25). The only repeatable sinks are the Sanctum (8/copy), the Marus Shrine (40/copy) and the Petricite Block craft (15 each).

A build that holds **132,771 crystals** and sits **at cap 96.5% of the time** against a lifetime one-off demand of **580** is not a chain that needs nerfing at the source — **it is a resource with no sink.** ×7.4 additive on the Tinkerer job is not the problem; the problem is that the crystals have nowhere to go, and the same would be true at ×1. **Rule from the sink side, not the production side.** Do not pre-emptively nerf the Augment Chamber.

---

## 9. Part 3.2 — the Shimmer Refinery, measured, with the apparatus defect

**The measurement, at the two states the spec named:**

| | Deep Works | Icathia |
|---|---|---|
| vigor income | 15,235/game-year | 27,464/game-year |
| Sump Crawls affordable (140 vigor each) | 108.8 | 196.2 |
| shimmer from crawls (25% × mean 5 × campYieldMult 6.27) | **853/game-year** | **1,537/game-year** |
| = shimmer/s | 1.0661 | 1.9219 |
| **Refineries needed to match** (0.05/s each) | **21.3** | **38.4** |

**The Refinery was never expensive.** Expanded to raw, `plating 20 + alloy 15` is **2,900 zaunore + 450 coalgas** — the *cheapest* Zaun-group building in the game (next: Hex Lab 3,000, Vault 16,000, Chembarrel 22,600, Hexdraulic Plant 200,000, Arcane Reactor 72,000,000).

**What is expensive is the twentieth copy.** At ratio 1.15 the 20th costs 2,900 × 1.15¹⁹ = **41,300 raw zaunore = 120 crawls = 940 shimmer foregone**, against the **40 shimmer** a copy produces in a game-year. A 23-game-year payback at exactly the scale where the building starts to matter.

**The cut: `plating 4 + alloy 3` = 580 raw zaunore + 90 coalgas, a ×5 reduction. THE STATED SCALE IS 20 COPIES** — the Deep Works matching scale — at which the 20th copy now pays its raw back in shimmer inside **5 game-years**. The conversion (`coalgas 0.2 + mana 0.5 → shimmer 0.05`), the ratio and the cap are untouched; only the price moved.

**And the pass condition could not have been met by any price.** See §1.1. `shimmerRefinery` is now in the build order alongside `irrigation`; `tavern` and `bloomery` are out of it.

**Because the apparatus fix landed in slice 3 and the recost in slice 4, the two are separable — which is the whole point of the cumulative-prefix discipline:**

| | Refineries @ Hexcore | Refineries @ Icathia | shimmer/s @ Icathia |
|---|---|---|---|
| v0.51 (not in the build order) | 0 | 0 | 0 |
| **s3 — apparatus fix, OLD price** | 2 | **6** | 1.9455 |
| **s4 — apparatus fix + recost** | 26 | **26** | **19.5487** |

**The apparatus fix alone delivers 6 Refineries. The recost delivers the other 20, and ×10 the shimmer.** Pass condition met, and the cut is sized by what it actually bought rather than by what it was hoped to buy.

---

## 10. The four cumulative prefixes

s1 and s2 **are** the shipped file up to that point, snapshotted forward from it. **s3 is not, and I am correcting the claim rather than leaving it.** s3 was built by taking the finished file and *reverse-patching* the two slice-4 values (`plating 20/alloy 15` and `knowledge 900`). The diff between s3 and s4 is exactly those two lines and nothing else, so s3 is behaviourally a correct Part 0+1+2 build — but it also carries Part 4.1's Sparks comment, which belongs to slice 4, and it was reconstructed rather than snapshotted. **That is the v0.47 failure mode in miniature and it should not have happened in the round that re-states the discipline.** Recorded so the next round snapshots forward at every slice boundary without exception.

**Second caveat on this table: s1/s2 were run on the OLD harness and s3/s4 on the NEW one.** `simcore.mjs` gained `shimmerRefinery` and `irrigation` in its build order and lost `tavern` and `bloomery` between s2 and s3. The s2 → s3 column boundary therefore mixes a code change with an apparatus change, and only the s3 → s4 boundary is a clean single-variable comparison.

| | baseline | s1: **Part 0** | s2: **+ Part 1** | s3: **+ Part 2** | s4: **+ Parts 3/5** |
|---|---|---|---|---|---|
| Rites of Targon | 64.0 | 64.4 | 63.8 | 60.9 | 75.6 |
| Call to Arms | 97.2 | 88.1 | 77.0 | 85.9 | 113.1 |
| Sparks | 148.0 | 171.4 | 165.4 | 150.4 | 215.6 |
| Chemtech | 361.5 | 398.1 | 409.7 | 384.9 | 443.0 |
| Hexcore | 613.0 | 407.6 | 755.0 | 389.8 | 627.7 |
| Deep Works | 700.3 | 641.5 | 826.6 | 639.4 | 832.0 |
| **Icathia** | **803.9** | 735.2 | 857.7 | **804.3** | ****1042.1**** |
| **Era 3 length** | **655.9** | 563.8 | 692.3 | **653.9** | ****826.5**** |
| peak population | 201 | 203 | 200 | 201 | 200 |
| morale band ≥80% after y60 | 100% | 100% | 100% | 100% | 100% |
| morale min / max | — | 90 / 137 | 88 / 138 | 90 / 134 | **90 / 133** |
| morale at 100+ wanderers (avg) | 114.8 | 114.9 | 114.8 | 99.8 | **100.9** |
| crowd relief @ Sparks / Hexcore / Icathia | — | — | — | 40.3 / 55.2 / 80.8% | **42.5 / 71.0 / 81.0%** |
| Shimmer Refineries @ Icathia | 0 | 0 | 0 | 6 | **26** |
| Convergence at Sparks (target 5–8%) | 3.49% | 3.55% | 3.49% | 2.9% | **5.4%** ✅ |
| crystals time-at-cap | — | 96.1% | 97.2% | 96.9% | **96.5%** |

### Pass conditions that FAIL on the shipped build

Three, and all three failed at baseline too — none is a v0.52 regression, but the report should not omit them:

| condition | target | s4 shipped | |
|---|---|---|---|
| Rites of Targon | before y55 | **y75.6** | ❌ (baseline y64.0 — this one got *worse*) |
| 130 wanderers | before y600 | **y857.4** | ❌ (baseline y704.1 — also worse) |
| morale dips below 90 before y50 | >0% of ticks | **0%** | ❌ (baseline 0% — unmoved) |

The first two moved the wrong way and the cause is the same one that lengthened Era 3: Part 3.2's 26 Shimmer Refineries draw 5.2 coalgas/s and 13 mana/s, and Part 1's higher trade-route vigor slows the early expedition loop. **Era 3 got longer, which was wanted; Eras 1 and 2 got longer too, which was not.**

---

## 11. The suites

| | v0.51 | v0.52 | |
|---|---|---|---|
| test-v32 | 64 | **65** | +1: Timberframe Joinery's absence asserted |
| test-v34 | 41 | **41** | the ×3.0–4.0 bound assertion **replaced** by exact `1 + Σ` |
| test-v35 | 44 | **44** | |
| test-v36 | 44 | **44** | 0.30 gold:vigor and the 6-key table both superseded |
| test-v37 | 38 | **38** | every count scaled ×4.348; one penalty row moves 55 → 56 |
| **test-v38** | 34 | **33** | **−1: the proportionality assertion, deleted by ruling** |
| test-v39 | 70 | **70** | |
| test-v40 | 59 | **59** | counts scaled ×4.348 |
| test-v41 | 62 | **61** | −1: the Tavern's price table retired with the building |
| test-v42 | 51 | **51** | |
| test-v43 | 40 | **40** | |
| test-v44 | 63 | **63** | Reactor ×10, bridge techs 3 → 2 |
| test-v45 | 58 | **58** | |
| test-v46 | 50 | **50** | route table superseded |
| test-v47 | 52 | **52** | ladder 38 → 37 |
| test-v48 | 54 | **54** | the eighth field changes owner *and* value |
| test-v49 | 37 | **37** | route assertions superseded |
| test-v50 | 34 | **34** | Farmstead boost, `resRatio`, Tavern gate all superseded |
| test-banner-v51 | 16 | **16** | untouched |
| **test-v52** | — | **31** | new |
| **Total** | **911** | **941** | **0 failures** |

---

## 12. §7 — invariants retired this round, with their superseding cause

The spec requires these listed rather than quietly widened.

| Retired invariant | Superseded by | Why |
|---|---|---|
| science stack bounded at ×3.0–4.0 | **Part 0** | it asserted the defect; replaced by exact `1 + Σ` |
| `BOOST_LIMIT` has six keys | **Part 0 + 1.3** | knowledge out, provisions and mana in; now asserted by *content* |
| every route at 0.30 gold:vigor | **Part 1.4** | flat 175 vigor with gold held makes the ratio spread by construction |
| the cheapest route is 100 vigor | **Part 1.4** | there is no cheapest route any more |
| the Farmstead carries Kittens' Aqueduct 0.03 | **Part 1.2** | the figure moved to the Irrigation Channel |
| `resRatio` has exactly one member | **Part 2.1** | `resRatio` does not exist |
| the Longhouse needs Timberframe Joinery | **Part 2.2** | the Discovery is deleted |
| the Tavern's 400/800/200 at 1.15 | **Part 2.3** | the building is deleted |
| the Tavern moved to `mining` | **Part 2.3** | as above |
| the three Era-2 bridge techs at 28/35/42k | **Part 2.4** | two now; 42k is deleted |
| tech count is 38 | **Part 2.4** | 37 |
| effect-to-ratio proportionality within 15× | **Part 2.6** | ruled: the rule does not exist in the source |
| the Arcane Reactor at 40/80/60 | **Part 1.1** | second ×10 |
| Cultivation's +10% asserted by grep | **Part 2.1** | now asserted by *measurement*, which is stronger |

**Two RR-invented rules the source contradicts have now been closed in two consecutive rounds** (the 1.25 band in v0.50, the proportionality bound here). Both deleted, not widened.

---

## 13. Open, for the analyzer

1. **`poroRatio` is unbounded and reaches ×41 at 500 copies** (§2.2). RR-only content, structurally consistent with Kittens' law, no source counterpart. Rule on it.
2. **`audience` grows without limit in population** (§2.2). Kittens' Amphitheatre has no population term. This is the only effect in the game that scales with the quantity the whole game grows.
3. **Crystals have no sink** (§8). Lifetime one-off demand **580** against **132,771 held** and **96.5% time-at-cap** — and the Tinkerer count is **1** at every milestone in every build ever measured, so the ×7.4 `jobBoost` is a multiplier on a single worker. Rule from the sink side, not the production side.
4. **Era 3 is 826.5 against a 1,400–2,300 target — 59% of the minimum, 573.5 short** (§4). The movement that got it there came mostly from the Shimmer Refinery *price cut*, via its coalgas and mana draw. Lengthening Era 3 by adding consumers looks more promising than by raising prices, and that is a design question, not a parity one.
5. **Sparks is champion-gated, not knowledge-gated** (§4). Any future prediction about Sparks timing that reasons from knowledge is predicting the wrong gate. Call to Arms is the rung to aim at.
6. **The banking policy is scheduled for v0.53** with its own baseline round, per Part 3.3.

---

## 14. Files

- `index_52.html` — 366,609 bytes (was 361,453). Still one file, no build step.
- `runeterrareclaimed-v0.52-workspace.zip` — 20 suites, `enhance-audit.mjs`, `shimmer-audit.mjs`, `crystal-sinks.mjs`, `rawcost.mjs`, the four cumulative-prefix snapshots and their run logs.
