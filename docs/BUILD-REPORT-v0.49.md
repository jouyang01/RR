# BUILD REPORT v0.49

*(the analyzer titled this spec v0.48; v0.48 shipped last round as the two UI documents, so this is v0.49)*

**Every spec item and all five of Jerry's UI directives shipped. 861 assertions across 17 suites, 0 failures.**

---

## 0. The two numbers

**Icathia moves y413.6 → y827.9. Era 3 goes 323.0 → 700.9 game-years, ×2.17.**

That is the answer to the retired Run A, obtained by subtraction exactly as §2.2 predicted: removing three `globalBoost` buildings and putting the Arcane Reactor on Kittens' `productionRatio` is worth **+414.3 years on Icathia** and **+377.9 years of Era 3**. It is the second-largest single lever this project has measured, behind only v0.46 Part 1.

**And the 591 years never existed as a like-for-like number.** Part 1.6 was a grep, and the grep says the "+ Part 1 only" build that produced y1,005.3 **was not Part 1 as shipped**. §1 is that answer, and it should be read before anything else in this report, because it retires a figure both of us have been reasoning from for two rounds.

---

## 1. Part 1.6 — what was actually inside the "+ Part 1 only" build

Answered by reading the build script out of the session transcript, not from memory. The isolation file was `site/index-iso-p1.html`, built from `/home/claude/index_46.html` by a script whose **entire** economic content was two edits.

| # | Candidate | Verdict | Evidence |
|---|---|---|---|
| 1 | the 38 tech prices | **IN — but 36 of 38, and not as shipped** | the price dict has 36 entries. `scriptorium` and `carpentry` are absent (they do not exist in v0.46 and the script has no insertion logic). The two retirements (`coinage`, `falconry`) were **not** performed, so the isolation ladder is a *different* 38. And ranks 1–20 kept their v0.46 **material components** — the script does `cur["knowledge"] = price`, where the shipped build rewrote each cost to knowledge alone. |
| 2 | beam and scaffold → Carpentry | **OUT as specified; half of it IN, on the wrong tech** | only `scaffold`'s `show` predicate was moved, and to **`woodcraft` (300)**, not Carpentry (1,000) — Carpentry does not exist in that file. `beam` untouched. The script's own comment: *"the scaffold gate, without which the isolation measures nothing."* |
| 3 | the Warehouse → Carpentry | **OUT** | no Warehouse edit. Also out for the same reason: `lumberMill` → carpentry, `reinforcedSaw` → carpentry, and the Academy moving from a Discovery to the Scriptorium tech. |
| 4 | `auditCostGraph()` | **OUT** | never added to the isolation file. Diagnostic only; no economic effect either way. |
| 5 | the six deadlock fixes | **five OUT, one IN** | Petricite Block still costs `hexSlab 10` → **still deadlocked**. Harbor/gear → **still deadlocked**. Hexdraulic Plant → **still deadlocked**. Voidglass Optics / Ward → **still deadlocked** (and largely *created* by the isolation's own re-pricing). Only the Augment Chamber is clear, and by accident: the price dict used the **post-fix, swapped** `hexcore: 75000 / gloriousEvolution: 85000`, not Part 1's original ordering. |
| 6 | Scriptorium promotion + Carpentry's creation | **OUT** | neither id is in the dict; the script has no insertion logic at all. |

### 1.1 What this means, stated plainly

**The Petricite Block deadlock was live inside the y1,005.3 build.** So the branch your §1.6 names is the one that holds: *"If the deadlock fixes were outside the Part 1 build, they are in the 591-year residual."* They were. There was no early Petricite Monument in that measurement, and the +5% global multiplier arriving 65,000 knowledge early **is** in the residual — which is exactly what this round's ×2.17 confirms.

**But the residual is not 591 years, because the two builds were never comparable.** y1,005.3 came from a ladder with two extra techs, two missing ones, materials still on ranks 1–20, and five live deadlocks. **My v0.47 report labelled it "+ Part 1 only (the ladder at Kittens' prices)" and it was not that.** That label is mine and it was wrong. The script's own header comment claims "incl. the two new techs and two retirements," which is false of the code beneath it — I wrote a comment describing what I meant to do and then did something else.

**Retire y1,005.3.** It measures a build that never shipped and cannot be reproduced from any spec. The honest baseline is v0.47's y413.6, and everything in §2 is measured against that.

---

## 2. Part 2 — the runs

Seed 1, 2,500 game-years, subtractive from full v0.49, everything else held.

| Build | Rites of Targon | Call to Arms | Sparks | Chemtech | Hexcore | Deep Works | **Icathia** | Era 3 | first trade | peak pop |
|---|---|---|---|---|---|---|---|---|---|---|
| **v0.47** (the baseline) | y66.2 | y72.4 | y90.6 | y186.5 | y230.2 | y285.7 | **y413.6** | 323.0 | y201.5 | 195 |
| **full v0.49** | y68.9 | y82.4 | y127.0 | y375.5 | y699.5 | y769.8 | **y827.9** | **700.9** | y218.0 | 201 |
| **B** − Cultivation `+10% provisions` | y70.1 | y87.7 | y164.4 | y387.8 | y594.8 | y713.8 | y846.7 | 682.3 | y224.7 | 201 |
| **C** − Shelter `vigor 75 → 40` | y68.9 | y82.4 | y128.4 | y375.0 | y631.5 | y739.2 | y764.5 | 636.1 | y216.9 | 201 |

### 2.1 Run A's answer, by subtraction

**Full v0.49 against v0.47: +414.3 years on Icathia, ×2.17 on Era 3.** Part 1.7 is the whole of the delta — nothing else in this round touches production. Three `globalBoost` buildings removed and one raised 0.04 → 0.05.

Every era stretches, and the stretch compounds with depth: Chemtech +189.0 y, Hexcore +469.3 y, Deep Works +484.1 y, Icathia +414.3 y. That is the signature of a *multiplier* being removed rather than a price being raised — the early game barely moves (Rites of Targon +2.7 y) and the late game moves enormously.

### 2.2 Run B — Cultivation's `+10% provisions`

| | Sparks | Icathia | Era 3 length |
|---|---|---|---|
| full v0.49 | y127.0 | y827.9 | 700.9 |
| without it | y164.4 | y846.7 | 682.3 |
| **worth** | **−37.4 y** | **−18.8 y** | **+18.6 y** |

**It is worth 37 years of Era 3 *entry* and almost nothing else.** Removing it delays Sparks by 37.4 years but delays Icathia by only 18.8, so Era 3 gets *shorter*, not longer. This is a lever on the opening, not on the era we are trying to lengthen.

**Your framing of it stands: it is the one item in v0.47 with no Kittens counterpart at all** — `agriculture` grants no production effect. If you want it gone for parity, the price is 18.8 years of Icathia, and I would take that trade. It is not the residual.

### 2.3 Run C — Shelter `vigor 75`

| | Sparks | Icathia | first trade |
|---|---|---|---|
| full v0.49 | y127.0 | y827.9 | y218.0 |
| reverted to 40 | y128.4 | y764.5 | y216.9 |
| **worth** | −1.4 y | **+63.4 y** | **−1.1 y** |

**Two findings, and the second is the more useful.**

The ceiling is worth **+63.4 years on Icathia** — a real Era-3 lever, three times Run B's — and it works entirely through *expeditions*, not trade.

**It does not touch the trade gate at all.** First trade moves 1.1 years when the vigor ceiling is cut by 47%. Combined with Part 5.1 below, that closes the question your §5.1 opened: **the trade gate is not the vigor ceiling and it is not the vigor price.** Both have now been measured directly and both are worth roughly one game-year. It is the bot's surplus rule or the material side of the recipe, and the next round can go straight there.

### 2.4 `catMonument`, measured for the first time

| | Sparks | Hexcore | Icathia |
|---|---|---|---|
| full v0.49 | **×1.000** | **×1.000** | **×3.238** |
| — decomposed | (no members owned) | (no members owned) | Hextech Foundry ×9 @ +13.20%/copy = **+118.8%** · Arcane Reactor ×21 @ +5.00%/copy = **+105.0%** |

The category is now **entirely Era 3**: nothing carries a global multiplier before the Hextech Foundry at 75,000 knowledge, which is Kittens' own Magneto rank. Under v0.47 the Petricite Monument sat at rank 16 with `globalBoost 0.05` at ratio 1.25, so `catMonument` was above 1 from the middle of Era 2 onward. **That structural change is the ×2.17.**

The Foundry's +13.20% per copy is the Hexdraulic amplifier at work (0.06 × (1 + 0.15 × 8)); the Reactor's 5.00% is flat, which is why twenty-one of them contribute less than nine Foundries.

Petricite Quarry counts: **0 at Sparks, 41 at Hexcore, 41 at Icathia** (47 by end of run). The `petriciteBlock 2` component is not gating it.

### 2.5 One caveat on the runs, stated because it is the kind of thing that voids a measurement

The three runs were launched at 01:13 and load their file at launch. **Three edits landed after that point**, and I need to name them rather than let you find them in the diff:

1. `auditCostGraph()` extended and split (§4). **It has zero callers inside the game** — grep confirms the only occurrences in `index.html` are the definition, the wrapper and a comment — so it cannot affect a simulation.
2. The champion name row went from `float: right` to a flex line (CSS only).
3. `champXpLabel()` lost its `"XP "` prefix (a display string).

None touches production, cost, cap or state. Everything measured above was in the file at launch.

---

## 3. Part 1.7 — the global-production category

**Exactly two buildings in the game carry `globalBoost`, matching Kittens' Magneto and Reactor.** Grep-level, asserted.

| | before | after |
|---|---|---|
| Petricite Monument | `globalBoost 0.05` @ 1.25, rank 16 | **deleted; merged into the Quarry** |
| Hextech Foundry | 0.06 @ 1.25, `hexcore` 75,000 | unchanged — already exact Magneto parity |
| Arcane Reactor | 0.04 @ 1.15, `greyReclamation` | **0.05 @ 1.15** — Kittens' `productionRatio` to the digit |
| Ward of the Watchers | 0.03 @ 1.25 | **`globalBoost` removed**; keeps `prod.trueice 0.01`, `caps.voidessence 150` |
| The Frozen Watcher | 0.04 @ 1.25 | **`globalBoost` removed**; keeps `poroRatio 0.60`, `prod.trueice 0.004` |

### 3.1 The merge, per §1.3.1

```js
{ id: "quarry", name: "Petricite Quarry", group: "Village", tech: "petricite",
  cost: { stoneSlab: 1000, steel: 125, scaffold: 50, petriciteBlock: 2 },
  ratio: 1.15, jobBoost: { miner: 0.35 } },
```

- **The `quarry` id is unchanged.** `MINERALS_LINE.quarry` resolves, and the ore category still measures `1 + 0.25M + 0.40Q` **exactly** — 12 mines + 7 quarries gives +580%, closed form +580%, asserted to 1e-9. The merge is visible only as the loss of `globalBoost`.
- **`petriciteBlock 2` came across**, so the craft keeps a consumer. Asserted: the Petricite Block has ≥ 1 consumer, and it is the Quarry.
- **The string "Petricite Monument" appears nowhere in the build**, comments included. Asserted.
- **`auditCostGraph()` is green** including the Quarry's new component. As you predicted: crystals arrive with the Hextech Refinery at rank 14 against the Quarry's rank 16, so it is clean.
- **Save migration.** An old save's `buildings.petricite` is **not** converted into Quarries — the two are not interchangeable (`gold 600` against `stoneSlab 1000`), and converting would hand a returning player free Quarries at a twentieth of the price. The count is dropped and refunded as `2 × n` Petricite Blocks. Asserted.

### 3.2 One thing Part 1.7 leaves behind, and I am not fixing it silently

The Ward of the Watchers and The Frozen Watcher now sit at **ratio 1.25 with no global multiplier**. This project's own band rule — asserted in test-v34 since v0.34, with `watchersEye` and `hexdraulicPlant` as the only whitelisted exceptions — reserves 1.25 for genuine global multipliers and puts everything else at 1.15.

They are the first two buildings to fail that rule. **I have whitelisted them rather than re-priced them**, because dropping a capstone's ratio makes it *cheaper*, which is the wrong direction in the round that is trying to lengthen Era 3, and your pass condition only guarantees their non-`globalBoost` *effects*. The whitelist carries the reason in a comment and the test says explicitly not to treat it as settled. **This is a live question for the next spec, not a decision I have made.**

---

## 4. `auditCostGraph()` only ever knew about crafted components — and there are seven live violations it could not see

Your §3.1 calls the v0.46 Storehouse "violation number seven … the one that got fixed a round before the audit existed to name it." Your pass condition asks for a direct assertion that a Storehouse priced in ore would fail the audit.

**It would not have.** The audit built its gate map from `CRAFTS` alone, so a *raw* resource gated behind a tech was invisible to it. `ore` is not crafted; the Storehouse case is exactly the shape the audit was blind to.

I extended it. A resource's own `hidden` predicate is the game's statement of when the resource exists, and where one names several techs they are OR'd, so the gate is the cheapest of them. I also taught it that a craft may be gated on a *Discovery* rather than a tech, which removed one false positive (`stoneSlab`, gated on `slabCutting`).

**The extended walk finds seven live violations. Every one is pre-existing. None has ever been reported.**

| # | Violation | Gap |
|---|---|---|
| 1 | **tech `gloriousEvolution`** (85,000) costs `shimmer`, gated on `deepWorks` (100,000) | **15,000 — the tech cannot be researched at all** |
| 2 | building `augmentChamber` (85,000) needs `shimmer` (100,000) | 15,000 — and it is behind #1 anyway |
| 3 | discovery `continuousDraw` (60,000) needs `shimmer` (100,000) | 40,000 |
| 4 | discovery `chemBaronTithe` (65,000) needs `shimmer` (100,000) | 35,000 |
| 5 | building `tavern` (100) needs `ore` (500) | 400 — the same shape as the v0.46 Storehouse |
| 6 | building `longhouse` (300) needs `ore` (500) | 200 — same shape |
| 7 | discovery `ironShodWheels` (1,200) needs `steel` (1,500) | 300 |

**#1 is the worst thing in this report.** The Glorious Evolution costs `hexgear 30, shimmer 40` at 85,000 knowledge, and shimmer only exists from the Shimmer Refinery at Deep Works, 100,000. **It is a dead tech in every build that has ever been measured, including all three runs above.** The Augment Chamber behind it has never been reachable at its own rank.

### 4.1 Reported, not actioned — and why

**I did not fix any of the seven.** Fixing seven gates mid-round would change the economy the isolation runs were measuring, and the comparison against v0.47's y413.6 is only valid if these stay exactly as broken as they were in v0.47. That is your own §1.7 warning applied to my own finding: *"otherwise we are attributing 591 years on an economy that no longer exists."*

So the audit is **split**, deliberately:

- `auditCostGraph()` walks exactly the graph it was written against in v0.47 and **is green** — your pass condition holds and still means what it meant.
- `auditRawGraph()` adds raw resources and Discovery-gated crafts, and returns the seven.

Both are asserted. The count is **pinned at seven** so a future round cannot quietly add an eighth or silently fix one. The Storehouse assertion you asked for runs against the raw walk and passes: reverting it to `timber 50, ore 75` adds **exactly one** new violation, naming the Storehouse.

---

## 5. Part 5.1 — the trade gate, and a conflict with a shipped invariant

**Freljord 150 → 100 vigor, and gold 45 → 30 with it.**

The spec says "one line." One line broke two shipped assertions: v0.46 Part 3 set every route at Kittens' `15:50` = **0.30 gold-to-vigor**, and `150 / 45` cut to `100 / 45` is 0.45. This spec does not revoke that invariant, and gold was never the binding constraint (v0.47 measured a 12,373 gold ceiling against a 30-gold trade), so **gold follows and the ratio survives**. The vigor cut does all the work either way.

| route | vigor | gold | ratio |
|---|---|---|---|
| **Freljord** | **100** | **30** | 0.300 |
| Piltover | 150 | 45 | 0.300 |
| Demacia / Noxus | 225 | 68 | 0.302 |
| Bilgewater | 300 | 90 | 0.300 |

**Pass condition: ❌ first trade is still after Sparks — y218.0 against Sparks at y127.0.**

And it did not move: first trade was y201.5 in v0.47 and is y218.0 now, across an economy whose Era 3 doubled. **Combined with Run C, this closes the vigor hypothesis entirely.** Cutting the price by a third moves first trade by roughly a game-year; cutting the ceiling by 47% moves it by 1.1 years in the other direction. Trade is not gated on vigor in any form. The bot's surplus rule is the remaining candidate and it should be read directly rather than inferred from another price change.

---

## 6. Jerry's five UI directives

All five shipped. Screenshots attached.

| Directive | Result |
|---|---|
| **Tooltip 1** — material counts update in real time | ✅ The open tooltip's descriptor is kept and re-rendered from `tick()`. Hovering an unaffordable button now shows the "have" side counting up beside the resource column instead of freezing at the value it had on `mouseenter`. |
| **Tooltip 2** — Wilds yields line by line | ✅ The yield string is split on its own `" · "` separators; the Renown line is appended as its own entry. `showTooltip`'s `yield` now accepts an array and gives each entry its own `.tt-yield` row. |
| **Tooltip 3** — trade flavour below the civilisation name | ✅ **Split in the data, not at render time** — `yieldAmt` + `yieldNote` on each faction, with `yieldDesc` derived, exactly the shape v0.48 gave the tech and discovery prose. The note renders in ZONE 1 directly under the name; the haul and every opened cargo slot get their own lines in ZONE 2. |
| **Tooltip 3.1** — caravan yields line by line | ✅ One line per cargo tier, each saying `OPEN` or the caravan count that opens it, with its floor and ceiling chance. Replaces a five-clause paragraph. |
| **Champion 1** — no rung, no class | ✅ Both removed from the recruit card. |
| **Champion 2** — EXP beside the name, live, no rate | ✅ On the name row, updating every tick off the same live layer as the tooltip. The `/s` line and the leading/benched text are gone. |

**One layout defect I caused and fixed:** the first version floated the XP chip, which escaped its line and collided with the level chip below (`Lv 3XP 1400 / 4549`). The name row is now its own flex line, scoped to the champion card rather than to every `.b-name` in the game, and the label lost its `"XP "` prefix because the card is only ~125 px wide once the TRAIN and ★ chips take their float. Caught by looking at the screenshot, not by a test.

---

## 7. Suites

| | v0.48 | v0.49 |
|---|---|---|
| test-v32 … v48 (16 suites) | 824 / 0 | **824 / 0** |
| **test-v49** | — | **37 / 0** |
| **Total** | 824 / 0 | **861 / 0** |

**Eight shipped assertions were edited, and one whitelist constant extended.** Every one was directly superseded by a spec item or a Jerry directive; none was edited to make a failure go away. Listed so you can audit the list rather than the diff:

| Suite | Assertion | Superseded by |
|---|---|---|
| test-v34 | "Petricite Monument still applies via the same data path" | Part 1.7 deletes the building. Re-pointed at the Arcane Reactor — same data path, same ×1.25. |
| test-v34 | `CAP_MULTIPLIERS` whitelist | §3.2 above. Extended with the reason in a comment. |
| test-v41 | `BUILDINGS.find(b => b.id === "petricite").cost` | Part 1.7. Re-pointed at the Quarry, which carries the block cost now. |
| test-v41 | "the capstone earns the 1.25 band with a genuine global multiplier" | Part 1.7 strips it. Now asserts it keeps **every other** effect — the spec's own pass condition. |
| test-v43 | "the card shows XP against the next threshold" (`/XP\s/`) | Jerry, champion edit 2. Now asserts the live node and the numeric label. |
| test-v43 | "…the accrual rate, and whether they are leading" | Jerry, champion edit 2 removes both. Now asserts XP is on a node the live layer updates. |
| test-v43 | "the recruit card shows which rung of the ladder you are on" | Jerry, champion edit 1. Asserted **absent** now. |
| test-v44 | Arcane Reactor `globalBoost === 0.04` | Part 1.7 → 0.05. |
| test-v46 | the vigor table, `Freljord/Piltover 150` | Part 5.1 → Freljord 100/30. Piltover and every other rung asserted unchanged. |

**No regression, all asserted:** all 38 tech prices to the digit; the five ladder conditions together (n=38, 8 exact ties, median ×1.1333, geometric mean ×1.2553, largest step ×3.333); knowledge cap still buildings alone starting at 0; `buildingJobBoost` still unbounded (400 mines = +8,000%); no change to Worship, Ascent, the stripe (1,000), the Shrine (0.0075), the Acolyte (0.0075, no `max`) or any WTECH threshold; morale 100% inside the 90–140 band after y60.

---

## 8. Failed pass conditions, honestly

| Condition | Result |
|---|---|
| First trade **before** Sparks on every seed | ❌ y218.0 against Sparks y127.0. §5 explains why, and rules out both vigor hypotheses. |
| Rites of Targon before y55 | ❌ y68.9 (was y66.2) |
| 130 wanderers before y600 | ❌ y770.7 (was y308.6) — population now paces against a doubled Era 3 |
| morale dips below 90 before y50 | ❌ 0% of samples — unchanged, and it is the small early settlement, not a regression |
| Convergence 5–8% at Sparks | ❌ 2.11%. Deferred by ruling; no code touched. Recorded because the number moved: at a 2,500-year horizon it reaches **+209.3% at 22.0M Worship**, three times v0.47's magnitude. The integral problem is getting worse with horizon, exactly as §4 of the spec predicts. |
| Icathia y1,400–2,300 | ❌ y827.9 — but **+414.3 years this round**, and the two isolations account for 82 more that were never on the table |

Vigor at cap: **5.7%** against a <10% target — **passes for the first time** (was 16.9–26.3%).

---

## 9. Files

- `index_49.html` — 324,605 bytes. One file, no build step.
- `runeterrareclaimed-v0.49-workspace.zip` — 17 suites, the three pacing logs, the two isolation builds, `audit.mjs`, `shot-v49.mjs` and five screenshots.

---

## 10. For the next spec

1. **The seven raw-gate violations in §4**, with #1 first: *The Glorious Evolution is a dead tech.* Four of the seven are `shimmer` arriving 15,000–40,000 knowledge after the things that cost it, which looks like one displacement rather than four independent errors.
2. **The trade gate is not vigor.** Price and ceiling have both been measured directly and both are worth about a game-year. Read the bot's surplus rule.
3. **The Ward and The Frozen Watcher at ratio 1.25 with no global multiplier** (§3.2). Whitelisted, not settled.
4. **Cultivation's `+10% provisions` costs 18.8 years of Icathia to remove and buys 37.4 years of Era 3 entry.** It has no Kittens counterpart. Your call; the number is now on the table.
5. **Icathia is y827.9 against a y1,400–2,300 target.** Part 1.7 was worth ×2.17 and the remaining gap is ×1.7–2.8. The Foundry/Reactor *price* separation (§5.3 of the spec, ×0.525 against Kittens' ×181) is now the sharpest remaining item in the same category, and it is sharper than it was: with three buildings gone, twenty-one Arcane Reactors are the whole tier rather than part of it.
6. **Convergence at +209% and rising with horizon.** Deferred, but the magnitude has tripled since v0.47 and it will keep tripling.
