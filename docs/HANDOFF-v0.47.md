# HANDOFF — Runeterra Reclaimed, end of the v0.47 build round

Successor to `claude/rr-handoff-v046.md` → `v045` → `v044`. **Read v0.44 §1–§3, §5, §8, §12
first** — the role, the loop, the standing constraints, how the simulator works, the
established Kittens facts and the era table are all still correct. This file records only
what changed in v0.47 and what is outstanding.

---

## 1. State of the build

**Standard run set: 15 suites, 770 assertions, 0 failures.**

| Suite | v32 | v34 | v35 | v36 | v37 | v38 | v39 | v40 | v41 | v42 | v43 | v44 | v45 | v46 | **v47** |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| assertions | 64 | 41 | 44 | 44 | 38 | 34 | 70 | 59 | 62 | 51 | 40 | 63 | 58 | 50 | **52** |

```bash
cd /home/claude/work && for f in test-v32 test-v34 test-v35 test-v36 test-v37 test-v38 \
  test-v39 test-v40 test-v41 test-v42 test-v43 test-v44 test-v45 test-v46 test-v47; do \
  echo "--- $f"; node /home/claude/work/$f.mjs 2>&1 | tail -1; done
```

Absolute paths, always. A 4,000-year pacing run is ~25 minutes; two concurrent on 2 cores
is the practical maximum.

---

## 2. New machinery you must know about

**`auditCostGraph()` is now IN THE GAME** (near `techVisible`). It walks BUILDINGS, CRAFTS,
UPGRADES and TECHS and returns every case where something is reachable before the recipe for
one of its cost components exists. It found **six** live deadlocks on the shipped v0.46
build, five of which had never been reported — including a rank-16 craft (Petricite Block)
requiring a Hexcore-tier material, which made the Petricite Monument unbuildable through the
whole mid-game. **Run it after any price or tech-gate change.** It is asserted in test-v47.

**The simulated clock.** `simNow()` returns `Date.now()` during live play and the replay's
own clock during catch-up; all 29 former `Date.now()` sites route through it. `realNow()` is
the real clock and is used only for save timestamping and measuring replay wall time.
**Do not reintroduce a bare `Date.now()` inside `step()` or anything it calls** — there is a
grep-level assertion. Note two functions have a local `var now`, which is why the helper is
called `simNow` and not `now`.

**`step(dt, ticks)` is the one economy.** `tick()` is `step(TICK_MS/1000, 1)`;
`runCatchUp()` calls the same `step()` with `CATCHUP_TICKS = 5`. `live` inside `step()` is
`ticks === 1` and guards UI-only work and per-arrival logging. Per-tick probabilities go
through `probOver(p, ticks)`.

`simcore.mjs` snapshots additionally carry `acolytePctOfPop`, `gold {held, cap,
cheapestTradeGold, ceilingBindsATrade}`, `shrines`, `worship`, `convergencePct` and
`linesOwned {axes, saws}`.

---

## 3. Standing constraints — additions

The v0.44–v0.46 lists still hold. Additions:

13. **The tech ladder is Kittens' ladder, rank for rank — identical values, not "shaped
    like".** All 38 prices are asserted against a table in test-v47. Do not move one without
    moving the table.
14. **Devotion needs TWO exclusions, not one.** It is `transient` *and* exempt from
    `catReligion`. Devotion becomes Worship 1:1 and Worship sets `catReligion`, so the
    religion category multiplying devotion is the v0.36 self-feeding loop. Making devotion
    transient re-opened it in this round and the v0.36 test caught it.
15. **`auditCostGraph()` must return empty.** See §2.
16. **Offline catch-up IS the live path.** One `step()`, no second economy.

---

## 4. Where v0.47 landed — four seeds × 4,000 game-years

| Milestone | median | range | spread |
|---|---|---|---|
| Rites of Targon | y65.4 | y64.1–70.5 | 1.10× |
| Call to Arms / first champion | y74.2 | y72.4–79.2 | 1.09× |
| Sparks | y94.7 | y90.6–127.4 | 1.41× |
| First trade | y169.7 | y147.1–201.5 | 1.37× |
| **Doors of Icathia** | **y435.9** | y413.6–590.6 | 1.43× |
| 130 wanderers | y324.1 | y308.6–409.7 | 1.33× |
| Vigor at cap | 20.8% | 16.9–26.3% | — |

---

## 5. The open questions the next round turns on

### 5.1 — Part 1 alone reaches y1,005. The rest of the spec gave back 670 years.

Isolations, seed 1, everything else held at v0.46:

| Build | Icathia | Era 3 length |
|---|---|---|
| v0.46 baseline | y443.0 | 357.2 y |
| **+ Part 1 only** (ladder at Kittens' prices) | **y1,005.3** | **878.1 y** |
| + Part 2 only (Worship supply) | y438.1 | 353.1 y |
| full v0.47 | y413.6 | 323.0 y |

**Part 1 is worth ×2.46 on Era 3 and is the only lever in the spec that moved pacing.
Part 2 measured neutral.** Something in Parts 3/4/4A refunds 670 game-years and it was not
isolated.

**Prime suspect: Part 4.4's Storehouse** — `timber 50` alone at ratio 1.75, dropping an
`ore 75` component from a building the settlement buys dozens of, while raising its ore
ceiling 150 → 250. It is the only Part 4 item that touches a repeatedly-paid cost, and
storage is upstream of everything. **One isolation run answers this and it is the next
round's first job.**

### 5.2 — Worship is an integral, so no supply fix can bound W₂/W₁

Every Part 2 edit landed exactly (devotion takes `catCharts × catPolicy` and nothing else;
Shrine 0.0075; Acolytes 12.8% of population; stripe 1,000) and **W₂/W₁ came out ×1,244
against v0.46's ×1,256.**

| | Worship | Convergence |
|---|---|---|
| `W₁` at Sparks (y90.6) | 1,352 | **0.0%** |
| `W₂` at Icathia (y413.6) | **1,682,246** | 57.5% |

Ascent converts banked devotion 1:1 and nothing ever removes it, so Worship is the
**time-integral** of devotion income. Era 3 runs 4.6× longer than the run to Sparks, and
income grows across it. **Flattening the income cannot flatten an integral.** The lever is a
Worship sink, decay on the praised pool, or reading Convergence off devotion *income*
rather than the Worship *stock*. Note the near end has now overshot the other way —
Convergence reads 0.0% at Sparks on three of four seeds.

### 5.3 — Still outstanding

- **Sparks y94.7 against a "not before y150" floor.** Part 1 alone puts it at y127.2, so
  the ladder is working; whatever refunds Era 3 also refunds Era 0–2.
- **First trade y169.7, still after Sparks.** Shelter 75 helped and the ceiling is no longer
  the binding term — the gold ceiling never binds (12,373 at Sparks against a 30-gold
  cheapest trade). The spec's own next lever applies: the cheapest route's vigor cost,
  150 → 100.
- **Vigor at cap 16.9–26.3% against <10%**, halved from v0.46.
- **Science stock 44 / 31 / 49 / 22** against 30/30/25/13.
- **Per-worker ore : timber 3.10 at Icathia** (60 Mines + 37 Quarries against 38 Mills).
- **Foundry/Reactor tier separation still ×0.525 against Kittens' ×181**, deferred twice.
- **The Longhouse parity gap** the v0.47 spec deferred deliberately: RR unlocks it from
  Woodcraft (rank 3), Kittens from `construction` (Carpentry, rank 7). It is a
  population-curve change and was explicitly held for v0.48.

---

## 6. Errors added to the running list

17. **Making a resource `transient` can silently undo an unrelated exemption.** Devotion
    needed both; the transient set contains `catReligion` and devotion must not have it.
18. **An A/B with unseeded RNG measures event noise, not the thing under test.** A 2.16%
    "integration error" was two different random event streams; with `Math.random` held
    constant the drift was 0%. I had already changed code and written a comment blaming the
    wrong cause.
19. **Naming a global helper `now()` when locals called `now` exist** — instant shadowing.

---

## 7. Docs and memory

- Build report: `claude/rr-build-report-v047.md` (project).
- Memory: `/areas/lol-idle-game-build-log.md` is capped at v0.43; v0.44 onward is in
  `/areas/lol-idle-game-build-log-2.md`. Read both, plus `/areas/lol-idle-game-state.md`
  and `/areas/lol-idle-game.md`.
- `claude/rr-current-state.md` remains stale; the build reports supersede it.
