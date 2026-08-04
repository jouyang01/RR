# HANDOFF — Runeterra Reclaimed, end of the v0.46 build round

Successor to `claude/rr-handoff-v045.md`, which succeeds `claude/rr-handoff-v044.md`.
**Read v0.44 §1–§3, §5, §8, §12 first** — the role, the loop, the standing constraints, how
the simulator works, the established Kittens facts and the era table are all still correct
and are not repeated. This file records only what changed in v0.46 and what is outstanding.

---

## 1. State of the build

**Standard run set: 14 suites, 718 assertions, 0 failures.**

| Suite | v32 | v34 | v35 | v36 | v37 | v38 | v39 | v40 | v41 | v42 | v43 | v44 | v45 | **v46** |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| assertions | 64 | 41 | 44 | 44 | 38 | 34 | 70 | 59 | 62 | 51 | 40 | 63 | 58 | **50** |

```bash
cd /home/claude/work && for f in test-v32 test-v34 test-v35 test-v36 test-v37 test-v38 \
  test-v39 test-v40 test-v41 test-v42 test-v43 test-v44 test-v45 test-v46; do \
  echo "--- $f"; node /home/claude/work/$f.mjs 2>&1 | tail -1; done
```

**Absolute paths, always.** Two rounds running, a working-directory or shell-lifetime
mistake has cost a cycle. In v0.46 it was `pkill -f "pacing.mjs"` matching the bash process
that was running it, which killed the shell mid-script so a `simcore.mjs` edit silently
never executed while the command reported success. **Verify every batch edit by grepping
for the string afterwards.**

**Pacing runs are ~25 minutes each now** (3,000 game-years, two concurrent on 2 cores).
Era 3 completes around y463, so 3,000 years is still the right horizon.

---

## 2. Harness changes you must know about

`simcore.mjs` gained, and these are all load-bearing for the v0.46 pass conditions:

| Field | What |
|---|---|
| `snaps[k].oreDecomposition` | ore split into job / converters+autoprod / residual, by switching each source off in the game's own `computeRates()` |
| `snaps[k].linesOwned` | how many axe and saw rungs were owned at that instant — **added because v0.45 compared a measured value against a full-line formula and read a 51% "miss" that was the formula's fault** |
| `snaps[k].worship` / `.convergencePct` | for `W₁`, `W₂` and `W₂/W₁` |
| `snaps[k].vigorRate` / `.vigorCap` | Part 2 |
| `r.trades` | trade count, plus the count at each milestone, for trades-per-game-year |
| `r.vigorAtCapPct` | fraction of ticks with vigor at ceiling |
| `r.firstVisible` | cold-start year each of Shelter / Archive / Crafting tab / Loremaster first becomes visible |
| `milestones.firstExpedition` | Part 8 |

**Two rules the harness now has to obey:**

1. **`snapshot()` still mirrors `computeRates()` by hand in places.** If you change how a
   category is computed, mirror it or the report lies. v0.45 and v0.46 both had to update it
   before measuring anything.
2. **Any harness change must still run against OLDER builds.** The isolation runs the spec
   asks for are cut from the previous version, and v0.46's `tradeCost()` call crashed both of
   them until it was guarded with `typeof tradeCost === "function"`.

`effcost.mjs` (v0.45) is unchanged and still the permanent answer to "report every Era-3
cost in effective-raw terms".

---

## 3. Standing constraints — additions

The v0.44 and v0.45 lists still hold in full. Additions:

9. **`buildingJobBoost` stays unbounded** (from v0.45) — Kittens balances ore against timber
   by opposite composition, not by a ceiling.
10. **Lore techs are priced in KNOWLEDGE ALONE.** All 23 that carried materials were stripped
    in v0.46 and the costs re-homed onto the Discoveries those techs unlock. Kittens' science
    tree carries no material cost; do not put one back.
11. **Descriptions are generated, never written.** `SCHOLAR_LINE`/`SCHOLAR_CAPS`,
    `RATIO_LINES`, `AXE_LINE`, `SAW_LINE`, the Poppy lead string. Five tooltips have drifted
    in this file's history and generation is the only fix that has held.
12. **`buildingVisible` and `upgradeVisible` share one `costDiscovered()`.** They drifted the
    moment Discoveries gained a resource-state gate. Do not re-fork them.

---

## 4. Where v0.46 landed — four seeds × 3,000 game-years

| Milestone | median | range | spread |
|---|---|---|---|
| Rites of Targon | y48.9 | y48.5–50.5 | 1.04× |
| First champion | y76.3 | y69.9–85.6 | 1.22× |
| Sparks | y98.0 | y85.8–106.7 | 1.24× |
| Hexcore | y258.6 | y218.2–279.2 | 1.28× |
| **Doors of Icathia** | **y463.1** | y443.0–483.7 | **1.09×** |
| 130 wanderers | y349.5 | y305.3–380.7 | 1.25× |
| Peak population | 195 | 193–199 | 1.03× |
| Final morale | 119 | 118–119 | — |

**Era 3 length: 86.3 y (v0.44) → 156.6 (v0.45) → 362.6 (v0.46).** Morale holds at 100% in
the 90–140 band after y60 on every seed.

---

## 5. The open questions the next round turns on

### 5.1 — Building prices are the lever, and the isolations prove it

Seed 1, everything else held at v0.45:

| Build | Era 3 length | vs v0.45 |
|---|---|---|
| v0.45 baseline | 160.6 y | — |
| **+ Part 1 only** (four ore-side building prices) | **273.9 y** | **×1.71** |
| **+ V1 only** (passive per-wanderer vigor line deleted) | **255.6 y** | **×1.59** |
| full v0.46 | 357.2 y | ×2.22 |

**V1 was never presented as a pacing lever and is nearly as large as Part 1** — 95 game-years
from deleting one four-line block, costing almost nothing at Sparks and everything after it.

### 5.2 — The ladder re-skew and Era-3 length pull in opposite directions

Part 1 alone puts Sparks at **y180**. The full build puts it at **y85.8**, because Part 5's
trim cut Call to Arms 14,000 → 7,700 and Sparks 20,000 → 15,400. **Fixing the ladder's shape
cost 94 game-years of Era 3 entry.** Someone has to decide whether Era 3 *entry* is a target
in its own right, because right now the two goals fight.

### 5.3 — Trade is dead before Era 3, and it is an interaction between two v0.46 parts

**Zero trades before Sparks on all four seeds**, and vigor sits at its ceiling 40.5–43.2% of
elapsed time against a <10% target. Cause:

- Part 3 sets the cheapest trade at **150 vigor**.
- Part 2 V4 puts the vigor **ceiling** on housing at **40 per Shelter**.

A settlement needs four Shelters before it can physically *hold* enough vigor to trade once,
and the gold gate binds on top. Kittens' equivalent is 50 catpower against a 75-manpower hut
— **one** hut.

**Recommended fix, and it is parity rather than weakening the gate: raise the Shelter's
vigor cap 40 → 75, Kittens' actual `manpowerMax`.** Not applied because Part 2 V4's numbers
were specified explicitly.

### 5.4 — No stripe can hold the Convergence band

The stripe was set to **1,884** as specified — the fourth deferral ended. Then:

| | Worship | Convergence |
|---|---|---|
| `W₁` at Sparks (y85.8) | 4,748 | **1.80%** |
| `W₂` at Icathia (y443) | 5,965,018 | **79.08%** |
| **W₂/W₁** | **×1,256** | vs the procedure's assumed **2.4** |

The √ curve compresses a 1,256× input range into ~×35 of output, so **no value of `s` puts
both ends in 5–8%**. Moving `s` slides the curve; it cannot narrow it. Either the band widens
with the era or Convergence needs a different curve.

Separately the input moved *again* — Parts 1 and 2 cut Worship-at-Sparks 4.5× to a four-seed
median of **6,306** (spread 1.55×, the tightest ever), implying `s = 420`. **Deliberately not
re-applied**: re-deriving inside the round that moved the input is the loop this has been
stuck in for five rounds.

### 5.5 — Still outstanding

- **Science stock 39 / 31 / 49 / 21** against 30/30/25/13. Hexcore Labs 47 → 21 is the Biolab
  re-pricing working. **Observatories went the wrong way, 45 → 49, despite costing ×7 more** —
  a price rise that also lengthens the era it is paid in partly refunds itself.
- **Per-worker ore : timber 3.17 at Icathia**, but **2.09 at Hexcore** — in band mid-era. The
  residual is counts, not composition: **97 ore ratio-buildings against 37 Lumber Mills.**
- **Sparks y98.0 against y350–500; Icathia y463.1 against y1,400–2,300** — short by ×3, down
  from ×8 last round.
- **Part 4's anchor for v0.47:** Hextech Foundry 119,252 effective raw and **2 owned** at
  Icathia; Arcane Reactor 62,595 and **30 owned**. RR's tier separation is **×0.525** against
  Kittens' **×181**. The Reactor's ≥25 condition is met for the first time, by a building that
  costs half its amplifier.

---

## 6. Errors added to the running list

13. **`pkill -f "<script>"` can match the shell running it**, silently killing a script
    mid-way while the command reports success.
14. **Harness changes must run against older builds** or the isolation runs the spec asks for
    cannot be produced.
15. **Grepping for a proxy instead of measuring the thing.** `0.05 * S.pop` also matches the
    Bard's Hearth culture line; a jungler-vigor comparison at population 200 vs 20 reads as a
    population effect when it is the morale floor.
16. **Two visibility exemptions were silently overriding the unlock ratio** — Transmute made
    timber count as a craftable material, and v0.41's storage-ceiling unsticker fired at base
    storage. Both are now narrowed. If a visibility gate does not bite, check the exemptions
    before changing the ratio.

---

## 7. Docs and memory

- Build report: `claude/rr-build-report-v046.md` (project).
- Memory: `/areas/lol-idle-game-build-log.md` is **capped at v0.43**; v0.44 onward lives in
  `/areas/lol-idle-game-build-log-2.md`. Read both, plus `/areas/lol-idle-game-state.md` and
  `/areas/lol-idle-game.md`.
- `claude/rr-current-state.md` remains stale. The build reports supersede it.
