# HANDOFF — Runeterra Reclaimed, end of the v0.45 build round

Successor to `claude/rr-handoff-v044.md`. **Read that document first** — §1 (the role and
the loop), §2 (standing constraints), §3 (where everything lives), §5 (how the simulator
works), §8 (Kittens source facts) and §12 (eras) are all still accurate and are NOT
repeated here. This file records only what CHANGED in v0.45 and what is outstanding.

---

## 1. What is different from the v0.44 handoff

**Standard run set is now 13 suites, 665 assertions, 0 failures.**

| Suite | v32 | v34 | v35 | v36 | v37 | v38 | v39 | v40 | v41 | v42 | v43 | v44 | **v45** |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| assertions | 64 | 41 | 44 | 44 | 38 | 34 | 70 | 59 | 62 | 51 | 40 | 63 | **55** |

```bash
cd /home/claude/work && for f in test-v32 test-v34 test-v35 test-v36 test-v37 test-v38 \
  test-v39 test-v40 test-v41 test-v42 test-v43 test-v44 test-v45; do \
  echo "--- $f"; node /home/claude/work/$f.mjs 2>&1 | tail -1; done
```

**Use absolute paths.** The v0.44 handoff warns about `cd site &&` failing silently; the
v0.45 builder hit the same trap from the other direction — the shell was left in `site/`,
so `node test-v32.mjs` resolved to `site/test-v32.mjs` and twelve suites reported
`MODULE_NOT_FOUND`, which reads exactly like twelve real failures.

**New in the workspace:**

| Path | What |
|---|---|
| `test-v45.mjs` | 55 assertions, every v0.45 Part 9 pass condition and all three of Jerry's directives. |
| `effcost.mjs` | **Part 7's standing requirement, permanent.** Prints every Era-3 building cost in nominal *and* effective-raw terms, at both the craft floor (`--bare`) and the craft ceiling. Run it every round; the spec now requires that column. |

**`simcore.mjs`'s `snapshot()` was updated and must be kept in sync.** It mirrors
`computeRates()` by hand — the v0.44 handoff flags this and it bit immediately. v0.45
re-pointed it at the game's own `jobBoostPerCopy()` and `axeMult()`, zeroed the miner tool
line and the ore `resRatio`, and added `transientProduct`, `excludedFromTransient`,
`ratioBuildings` (N for Mine/Quarry/Lumber Mill), `jobs`, `championAggregate` and
`caps.knowledge`. **If you change how any category is computed, mirror it here or the
report will silently lie.**

**Run cost has gone up.** Era 3 now completes around y295, so a meaningful pacing run is
3,000 game-years ≈ 29 minutes wall with two running concurrently on 2 cores. Budget for it.

---

## 2. Anti-drift: the pattern has now caught five tooltips

`SCHOLAR_LINE` / `SCHOLAR_CAPS` (v0.43) were joined in v0.45 by `RATIO_LINES`, `AXE_LINE`,
`SAW_LINE` and a generated Poppy `lead` string. Every one of them generates its own
description from the same table the code reads.

This keeps paying. In v0.45 both Shelter upgrade strings still promised "1.75 → 1.5" and
"1.5 → 1.3" against a base that became 2.20 two versions earlier, and Poppy's lead still
promised "even Renown" which stopped being true in v0.43. **If you add an effect with a
player-visible number, generate the prose. Do not write it.**

---

## 3. Standing constraints — additions to the v0.44 list

The v0.44 list still holds in full. Two additions:

7. **`buildingJobBoost` must stay UNBOUNDED.** This reverses the v0.44 builder's own
   recommendation. Kittens' `mineralsRatio` and `woodRatio` are plain additive sums with
   no `getLimitedDR` anywhere in the chain, and `mineralsJobRatio` / `mineralsGlobalRatio`
   return zero results in the entire repository — verified this round. Kittens balances ore
   against timber by **opposite composition** (ore gets breadth: two buildings at 0.20/0.35;
   timber gets depth: one building whose per-copy ratio nearly doubles across five saws,
   plus a six-rung job line ore is denied) not by a ceiling. There is an explicit
   no-regression assertion in `test-v45.mjs`.
8. **Every Era-3 building cost must be reported in effective-raw terms alongside nominal.**
   Use `effcost.mjs`. See §5 below for why this is not optional.

---

## 4. Where v0.45 landed — four seeds, 3,000 game-years each

| Milestone | median | range | spread |
|---|---|---|---|
| Rites of Targon | y55.6 | y45.8–63.6 | 1.39× |
| First champion | y80.8 | y62.5–83.9 | 1.34× |
| **Sparks** | **y136.9** | y124.0–138.3 | 1.12× |
| Chemtech | y184.4 | y181.3–193.8 | 1.07× |
| Hexcore | y263.8 | y256.6–272.2 | 1.06× |
| Deep Works | y286.8 | y278.6–293.4 | 1.05× |
| **Doors of Icathia** | **y294.6** | y288.4–299.4 | **1.04×** |
| 130 wanderers | y287.4 | y280.2–293.8 | 1.05× |
| Peak population | 202 | 200–206 | 1.03× |
| Final morale | 117 | 116–118 | — |

Determinism is excellent and the spread tightens monotonically with era. **Report medians,
not seed 1.** The v0.44 single-seed debt is paid and should not be re-incurred.

**Morale is fixed.** 2% → **99%** of samples in the 90–140 band after y60; final morale
31 → 117 at population 477 → 202.

---

## 5. The open questions the next round turns on

### 5.1 — Raising the price of knowledge does not slow the game

Restated so it cannot be lost. v0.45 removed ×7.5 of production multiplier from knowledge
(Part 1), cut the loremaster 1.71× (Part 4), and stripped every storage multiplier off the
knowledge cap (Part 5). Predicted effect on Era 3: ≈×27. **Measured: ×1.81** (86 → 157
game-years).

The mechanism is that **the knowledge ceiling was never binding, and Part 5 converted the
removed multipliers into building count.** At Icathia:

```
caps.knowledge = 142,650    against Doors of Icathia at 135,000
science stock  = 44 Archives / 32 Academies / 45 Observatories / 47 Hexcore Laboratories
                 (target 30 / 30 / 25 / 13)
ore income     = 9,215 /s
```

Building count is unbounded, the Observatory and Hexcore Lab sit at ratio 1.10, and the
settlement earns 9,215 ore a second — so it bought 47 Labs against a target of 13 and
reached the ceiling from the other direction. Part 5 is correct and should stay; it is
simply not a pacing lever. **The lever is ore income.**

### 5.2 — Part 7 is inverted and the Era-3 prices probably do need action

The v0.45 spec reasoned that craft yield makes Era-3 buildings cheaper than nominal and
concluded their prices need no action. Measured at the craft ceiling:

| Building | nominal units | effective raw units | ratio |
|---|---|---|---|
| Hextech Foundry | 300 | **119,252** | ×398 |
| Arcane Reactor | 18 | **62,595** | ×3,478 |
| Hexdraulic Plant | 4,320 | **41,405** | ×9.6 |

Hand-verified: 1 scaffold = 681 timber, 1 hexgear = 170 zaunore + 85 coalgas. The craft
line *does* divide by ~×8.8 as the spec claimed — at the craft floor the same Foundry is
1,050,000 raw units — but **chain depth multiplies raw cost far faster than yield divides
it.** So the shortfall (5 Foundries / 5 Plants / 12 Reactors at Icathia against ≥8 and ≥25)
is explained by price, not by Era 3 being too short. Prices were NOT changed; that is the
next spec's call, now with the right table.

### 5.3 — Per-worker ore : timber is 3.66 against a 1.6–2.2 band

The composition fix is arithmetically perfect — the ore formula `1 + 0.25M + 0.40Q`
reproduces **to the digit** at Sparks, Hexcore and Icathia. Two other things are wrong:

- **Timber's depth is entirely Era-3 gated.** Ore's two buildings work at full strength
  from copy one; every axe and saw rung is paired with an Era-3 material tier exactly as
  the spec specifies. Timber therefore runs at **51% / 63% / 78%** of its designed category
  at Sparks / Hexcore / Icathia.
- **The settlement builds 115 ore ratio-buildings against 40 Lumber Mills.** The spec's
  table assumes equal N; at equal N its own formulas give 2.03, inside the band.

### 5.4 — The Convergence stripe: fourth deferral, but the blocker is gone

Worship at Sparks is finally measurable across four seeds — 19,404 / 40,764 / 22,149 /
34,364, **median 28,256, spread 2.10×**, inside the spec's stated 3× condition. The spec's
own `s = W₁/15` gives **1,884**; solving the curve for 6.5% gives **1,159**.

The stripe is still **20,000** and was not touched. Note *why* the input moved: Part 4's
acolyte cut (0.012 → 0.0075) and a 202-population settlement dropped Worship-at-Sparks
~18× from the ~500,000 that set 20,000 in v0.42. **The stripe is now 17× too large, and
that is a v0.45 consequence, not a v0.42 error.** At the far end it overshoots the other
way: 265% at y3,000.

### 5.5 — The two tech-ladder conditions cannot both hold

Closed form, because this will recur: the geometric mean of the steps of a sorted price
list telescopes to `(max/min)^(1/(N−1))` = `4500^(1/(N−1))` over RR's span (30 → 135,000).
**It depends only on the tech count.** The same identity produces the spec's own Kittens
figure, `4500^(1/35) = ×1.2717`.

| N | geometric mean |
|---|---|
| 35 (v0.44) | ×1.2807 |
| 36 (Kittens) | ×1.2717 |
| 38 | ×1.2553 |
| 39 | ×1.2478 ← first below band |
| **45 (v0.45)** | **×1.2107** |

The ×1.25–1.30 band admits at most **38** techs; "add 8–10 side techs" puts RR at 45. All
ten shipped (median ×1.1292 passes, 10 exact ties, all leaves, all on exact existing
rungs, no existing price moved) and the incompatibility was reported. **The analyzer must
choose: ten branches at ×1.21, or three at ×1.2553.**

### 5.6 — Champion aggregate is ×12.46 at Icathia, ×80.99 at full level 10

Against a stated ×1.5–3.0 paragon-slot budget. The cause is the `passiveMult` curve —
`(1 + 0.5√level)`, ×1.5 again at level 10, so **×3.872 at cap** — not any single champion.
Untouched: roster-wide lever, belongs in a spec.

### 5.7 — Still outstanding

- **Population at Icathia is 166** against a 115–140 band, rising to 202.
- **"Morale dips below 90 before y50" reads 0%** and an A/B proves it is NOT caused by the
  flat-luxury change (0% in both arms). The early settlement is now small enough — pop 40
  at Sparks — that `(pop − 5) × 2` crowding never bites before y50.
- **Furs sit at 0.31–0.32× comfort.** Carried over unfixed from v0.44 (0.18×). Note this
  matters *much* less now: under the flat morale rule, stock level no longer affects morale
  at all, only whether you hold any.
- **The two-save science-stock comparison was not run** (see the build report §9.1). The
  half the spec called load-bearing — that a Poppy-led Mountain-Drake save shows an
  *identical* knowledge ceiling — is proven exactly by unit test at 165,150.

---

## 6. Errors added to the v0.44 §9 list

10. **Working directory, again.** Twelve false `MODULE_NOT_FOUND` failures from a shell
    left in `site/`. Absolute paths, every time.
11. **Branch techs priced at or below their own prerequisite.** Kittens' ties are
    *siblings* branching off a shared parent, never a tech tying with its own parent. Four
    of ten shipped broken and the existing v0.42/v0.44 monotonicity assertions caught them.
12. **A measurement harness that reads a building's `prod` as if it were a multiplier.**
    The Part 1 test used the Piltover Spire as a pure `globalBoost` building; it carries
    `prod: { culture: 0.04 }`, so the test reported "culture ×2.333" — indistinguishable
    from a real Part 1 leak. Re-measured with the Hextech Foundry: ×1.000000. **When
    measuring a multiplier, use a building that has no production of its own.**

---

## 7. Docs and memory

- Build report: `claude/rr-build-report-v045.md` (project).
- Persistent memory: `/areas/lol-idle-game-build-log.md` reached its 32 KB cap at v0.43.
  **v0.44 onward now lives in `/areas/lol-idle-game-build-log-2.md`.** Read both, plus
  `/areas/lol-idle-game-state.md` and `/areas/lol-idle-game.md`.
- `claude/rr-current-state.md` is still stale — it has not been refreshed since before
  v0.44. The build reports supersede it.
