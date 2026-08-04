# HANDOFF v0.49 — Runeterra Reclaimed

For whoever builds v0.50. Read `claude/rr-build-report-v049.md` alongside this.

**Naming:** the analyzer titled its spec "BUILDER SPEC v0.48". v0.48 had already shipped as the two UI documents (tooltip restructure + animations), so that spec shipped as **v0.49**. Expect the analyzer's next spec to be off by one again unless someone tells it.

## The headline

**Icathia y413.6 → y827.9. Era 3 length 323.0 → 700.9 game-years, ×2.17.** One cause: RR's global-production category went from five members to Kittens' two.

## Retire y1,005.3

v0.47's report claimed "Part 1 alone lands Icathia at y1,005.3". Part 1.6 of this spec asked what was actually in that build. The answer, read out of the session transcript rather than from memory: **it was not Part 1 as shipped.** The isolation script made two edits to `index_46.html` — overwrite 36 knowledge prices (keeping the v0.46 material components), and re-gate the Scaffold craft to `woodcraft`. It did **not** insert Scriptorium or Carpentry, did **not** retire Coinage or Falconry, did **not** move beam/Warehouse/Lumber Mill/Reinforced Saw, and left **five of the six deadlocks live** — including the Petricite Block one.

Do not reason from y1,005.3 again. **v0.47's y413.6 is the honest baseline.** And when you build an isolation, make the script's header comment describe what the code beneath it does; v0.47's did not, and that is what produced two rounds of bad inference.

## What v0.49 changed

### The global-production category (Part 1.7)

**Exactly two buildings carry `globalBoost` now, and a test asserts it at grep level.**

| | |
|---|---|
| Hextech Foundry | 0.06 @ ratio 1.25, `hexcore` 75,000 — Kittens' Magneto, exact parity, untouched |
| Arcane Reactor | **0.05** @ ratio 1.15, `greyReclamation` — Kittens' `productionRatio` to the digit |
| Petricite Monument | **deleted**, merged into the Quarry |
| Ward of the Watchers | `globalBoost` **removed**; keeps `prod.trueice`, `caps.voidessence` |
| The Frozen Watcher | `globalBoost` **removed**; keeps `poroRatio 0.60`, `prod.trueice` |

**The merge runs one way only.** The building keeps the id `quarry`, keeps `stoneSlab 1000 + steel 125 + scaffold 50` at ratio 1.15 (Kittens' quarry transliterated — v0.46 Part 1, the largest lever in the project), gains `petriciteBlock 2` so the craft keeps a consumer, and is displayed as **Petricite Quarry**. `MINERALS_LINE` keys off the id and the ore formula `1 + 0.25M + 0.40Q` is stated in it — **never rename the id.**

Old saves: `buildings.petricite` is dropped and refunded as `2 × n` Petricite Blocks. It is deliberately **not** converted into Quarries — `gold 600` against `stoneSlab 1000` is a twentieth of the price.

### `catMonument`, measured for the first time

×1.000 at Sparks, ×1.000 at Hexcore, **×3.238 at Icathia** (Foundry ×9 at +13.20%/copy after the Hexdraulic amplifier, Reactor ×21 at +5.00%). The category is now entirely Era 3. Under v0.47 the Monument put it above 1 from the middle of Era 2, and that is the ×2.17.

### The trade gate is NOT vigor — both hypotheses are now dead

- Part 5.1 cut the cheapest route 150 → 100 vigor (**and gold 45 → 30**, so v0.46's Kittens `15:50` = 0.30 ratio survives — the spec said "one line" but one line broke two shipped assertions).
- Isolation C cut the Shelter's vigor **ceiling** 75 → 40.

First trade moved **1.1 game-years** for the ceiling and got **16 years later** across the price cut. It is still after Sparks (y218.0 vs y127.0). Stop pricing vigor; read the bot's surplus rule in `simcore.mjs`'s `manageTrade()`.

### Isolation values, for the record

| Lever | Sparks | Icathia | Era 3 length |
|---|---|---|---|
| Cultivation `+10% provisions` | **−37.4 y** | −18.8 y | +18.6 y |
| Shelter `vigor 75` (vs 40) | −1.4 y | **+63.4 y** | +64.8 y |

Cultivation's +10% is an *opening* lever, not an Era-3 one, and it has no Kittens counterpart at all.

## `auditCostGraph()` was blind to raw resources — SEVEN live violations

The audit built its gate map from `CRAFTS` alone, so a raw resource gated behind a tech was invisible. That is exactly the shape of the v0.46 Storehouse (`ore 75` at rank 2, ore at rank 4).

It is now **split, on purpose**:

- `auditCostGraph()` walks exactly the graph it walked in v0.47 and **is green**.
- `auditRawGraph()` adds raw resources (read from each resource's own `hidden` predicate — where it names several techs they are OR'd, so the gate is the cheapest) and Discovery-gated crafts. It returns **seven**.

| # | Violation | Gap |
|---|---|---|
| 1 | **tech `gloriousEvolution` (85,000) costs `shimmer`, gated on `deepWorks` (100,000)** | **the tech cannot be researched at all** |
| 2 | `augmentChamber` (85,000) needs `shimmer` (100,000) | 15,000 |
| 3 | `continuousDraw` (60,000) needs `shimmer` (100,000) | 40,000 |
| 4 | `chemBaronTithe` (65,000) needs `shimmer` (100,000) | 35,000 |
| 5 | `tavern` (100) needs `ore` (500) | 400 |
| 6 | `longhouse` (300) needs `ore` (500) | 200 |
| 7 | `ironShodWheels` (1,200) needs `steel` (1,500) | 300 |

**None was fixed.** Fixing them mid-round would have changed the economy the isolation runs were measuring, and the comparison against v0.47's y413.6 is only valid if they stay as broken as they were. The count is **pinned at seven** by an assertion so nobody can quietly add an eighth or silently fix one.

**#1 is the most serious defect currently in the game.** Four of the seven are `shimmer` arriving after the things that cost it, which looks like one displacement rather than four errors.

## Jerry's UI directives (all shipped)

- **The open tooltip is live.** `_ttOpen` holds the descriptor; `updateLive()` re-renders it from `tick()`. `hideTooltip()` clears it. Do not remove the clear — a hidden tooltip must not be re-rendered.
- **`showTooltip`'s `yield` accepts an array**, one `.tt-yield` line per entry. Wilds yields split on their own `" · "`; faction tooltips list the haul plus every opened cargo slot; caravan tooltips list one line per tier.
- **Faction prose is split in the DATA** — `yieldAmt` + `yieldNote`, with `yieldDesc` derived, the same shape v0.48 gave the tech and discovery prose. The note renders in ZONE 1 under the civilisation's name.
- **Champion cards**: no class, no recruit index, no xp/second. XP rides on the name row (`.b-name.champ-name`, a flex line — a float escaped and collided with the level chip) and updates every tick via `[data-champxp]` / `[data-champbar]`.
- **`updateLive()` is called from `tick()`, never from `step()`** — so it does not run per simulated day during offline catch-up. Keep it that way.

## Suites

**861 assertions across 17 suites, 0 failures.** 824 carried + 37 new in `test-v49.mjs`.

Eight shipped assertions were edited and one whitelist constant extended, every one directly superseded by a spec item or a Jerry directive. The list is in §7 of the build report — audit the list, not the diff.

Run from `/home/claude/work` with **absolute paths**:

```bash
cd /home/claude/work && for f in test-v32 test-v34 test-v35 test-v36 test-v37 test-v38 test-v39 \
  test-v40 test-v41 test-v42 test-v43 test-v44 test-v45 test-v46 test-v47 test-v48 test-v49; do \
  echo -n "$f: "; node /home/claude/work/$f.mjs 2>&1 | grep -E '^[0-9]+ passed' | tail -1; done
```

A full 2,500-year pacing run takes ~29 minutes wall with three in parallel; ~12 alone.

## Open for v0.50

1. **The seven raw-gate violations**, #1 first.
2. **The trade gate.** Not vigor. Read `manageTrade()`.
3. **The Ward and The Frozen Watcher sit at ratio 1.25 with no global multiplier**, which breaks this project's own band rule (test-v34's `CAP_MULTIPLIERS`). Whitelisted with the reason recorded, **not settled** — dropping the ratio makes capstones cheaper, which fights the Era-3 objective.
4. **Icathia y827.9 against y1,400–2,300.** The remaining gap is ×1.7–2.8. The Foundry/Reactor *price* separation (RR ×0.525 against Kittens' ×181 in effective-raw terms) is the sharpest item left in the same category, and it is sharper now that twenty-one Arcane Reactors are the whole tier.
5. **Convergence +209.3% at 22.0M Worship** on a 2,500-year horizon — three times v0.47's magnitude, and it will keep growing because Worship is a lifetime integral. Deferred by Jerry's ruling to the prestige round; the diagnosis and the three things that round needs are in the spec's Part 4.
6. Still failing: Rites of Targon y68.9 (target <55); 130 wanderers y770.7 (target <600). Vigor at cap is **5.7%**, which passes for the first time.
