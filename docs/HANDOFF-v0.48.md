# HANDOFF v0.48 — Runeterra Reclaimed

Written for whoever builds v0.49. Read `claude/rr-build-report-v048.md` alongside this.

## What v0.48 was

A **UI round**. Two documents: `TOOLTIPCHANGESv0.48.md` (tooltip restructure + one data change) and `ANIMATIONCHANGESv0.48.md` (three CSS animations). Both shipped in full, including the tooltip document's §7, which it marked separable and deferrable.

**No economy number moved.** A 500-year pacing run on v0.47 and on v0.48 at the same seed diff to nothing — every milestone year, every cold-start year, every final-state field. `pacing-v0.47.txt` / `pacing-v0.48.txt` are in the workspace zip.

## The shape of the file now

### Prose is split three ways, and `desc` is derived

`TECHS` (38), `UPGRADES` (74) and `WTECHS` (5) — **117 entries** — author `lore` (flavour, ZONE 4) and `effect` (mechanics, ZONE 1) separately, matching the shape `BUILDINGS` always used.

`desc` still exists on those three tables but is **derived** by `deriveLegacyDesc()` immediately after `UPGRADES` is declared: `desc = [lore, effect].filter(Boolean).join(" ")`. It exists because log lines and six shipped assertions still read it. **Authoring a `desc` on those tables is a mistake — it is overwritten.** test-v48 asserts every `desc` present equals the derived value.

The one-release fallback holds: an entry with neither field keeps its `desc` and renders it in ZONE 1.

### The tooltip is zoned

`showCostTooltip` is **gone**, not shimmed. All 17 call sites use:

```js
showTooltip(anchor, { title, desc, cost: {res: amt}, yield, note, effects: [string], flavor })
```

Every field optional. `.tt-sec` (the rule) goes on every zone except the first rendered. Costs are label-left / value-right flex rows; an affordable row shows one number, a short row shows `have / need` in red with the v0.46 ETA text unchanged. Crafted components are prefixed `+` and expand **one level**, scaled by `craftYield()`.

Do not reintroduce `showCostTooltip`. Do not touch the `short`/ETA branch.

### Effects are generated, never written

`effectLines(b)` derives the Effects block from `pop`, `prod`, `caps`, `jobBoost`, `boost`, `globalBoost`, `crowdRelief`, `convert`, `autoprod`, `poroRatio`, `cultureCapPct`, `seasonal` and eight new fields. **`b.effect` is now one plain-language sentence and must never contain a number.** test-v48 asserts no building's `effect` contains a digit followed by `%` — 0 of 49, down from 28 of 49.

`techUnlocks(id)` generates a tech's ZONE 3 the same way: it sweeps the declarative `tech:` field on BUILDINGS / JOBS / EXPEDITIONS / UPGRADES **and reads the `show(s)` closure source** on CRAFTS and TABS for `techs.<id>`. The closure half is what catches Carpentry's Support Beams and Scaffolds and Logistics' Wilds tab.

### Ten constants became fields

`bfield(id, key)` reads them; `bdef(id)` caches the index. Both the maths and the display read the field:

`hunterLodge.campBoost` · `tradeDock.tradeBoost` · `hexgateBuilding.tradeBoost` · `workshop.craftBoost` · `chembarrel.sumpBoost` · `hexdraulicPlant.foundryBoost` · `poroPasture.eatCut` + `eatCutLimit` · `bardsHearth.audience` · `tavern.crowdRelief` · plus `capMultPerCopy(b)` and `globalBoostPerCopy(b)`.

Every substitution was literal-for-literal. If you add a per-copy constant to a building, put it on the building.

**`jobBoostTotal(job)` is deliberately a second implementation** of the sum `computeRates()` forms in its `jobBoosts` loop. Merging them would put an O(jobs × buildings) sweep inside the hottest function in the file. test-v48 asserts they agree to 1e-12 — keep that assertion.

### Animations

Three `@keyframes` (`eventGlow`, `affordFlash`, `tabPop`) and one `prefers-reduced-motion` block. The file had none of these before v0.48.

- `flashAfford(btn)` reads `offsetWidth` to force the reflow that restarts the animation. Do not remove that line.
- Nine selectors flash: `[data-bld]`, `[data-tech]`, `[data-upg]`, `[data-craft]`, `[data-exp]`, `[data-fac]`, `[data-recruit]`, `[data-wtech]`, `[data-policy]`.
- **No spurious-flash guard was added, on purpose.** The markup and the checker set `disabled` from the same predicate, so the transition only fires on a real crossing. Adding a guard is a regression.
- The tab pop handler **must stay inside `renderTabs()`** — that function re-binds `onclick` on every `uiDirty`, so a handler attached anywhere else is discarded. The class goes on a freshly queried node scoped to `#tab-bar`, because `renderAll()` destroys the node `btn` points at.
- `#resource-col` and `#calendar-bar` rebuild every 200 ms. **Never animate anything inside them.**
- `runCatchUp()` must never call `renderTop` / `renderAll` / `updateAffordability`. Asserted.

## Ten drifts found and fixed

Found by *deriving* the display, not by reading it. In descending severity:

1. `tradeDock` advertised "+15% caravan yields each"; the code applies **0.02 per copy**. 7.5× overstated.
2. `sumpMine` advertised "0.2 mana"; input is **0.5**.
3. `coalgasVent` omitted its `mana: 0.3` input entirely.
4. `hexQuarry` omitted its `mana: 0.6` input entirely.
5. `storehouse` advertised "+150 ore"; the table says **250**.
6. `storehouse` omitted its `gold: 10` cap.
7. `almanac` claimed to unlock the Academy — **v0.47 Part 4.1 moved it to `scriptorium` and the string was not updated.**
8. `woodcraft` claimed to unlock the Storehouse; that is `cultivation`'s.
9. `deepWorks` promised "Foundry Overseer & Hexcrystal Warden posts for champions" — **no such feature exists in the file.**
10. `icathia` promised "the Void Expedition Leader post" — same.

## Four shipped assertions were edited

test-v37 ×2, test-v38 ×1, test-v40 ×1. All four pinned the *source text* of a literal that became a field, or a number that moved out of `effect` into the generated block. Each was re-pointed at the new source asserting the same property; the count did not change. Behaviour is independently proved unchanged by test-v37's relief table and by the identical pacing A/B.

## Suites

**824 assertions across 16 suites, 0 failures.** 770 carried forward + 54 new in `test-v48.mjs`.

Run them from `/home/claude/work` with **absolute paths** — a relative run from `site/` produces 16 false `MODULE_NOT_FOUND` failures and has cost this project a launch twice:

```bash
cd /home/claude/work && for f in test-v32 test-v34 test-v35 test-v36 test-v37 test-v38 \
  test-v39 test-v40 test-v41 test-v42 test-v43 test-v44 test-v45 test-v46 test-v47 test-v48; do \
  echo -n "$f: "; node /home/claude/work/$f.mjs 2>&1 | grep -E '^[0-9]+ passed' | tail -1; done
```

Syntax-check after every batch of edits:

```bash
node -e "const fs=require('fs');const m=fs.readFileSync('/home/claude/work/site/index.html','utf8').match(/<script>([\s\S]*)<\/script>/);new Function(m[1]);console.log('syntax OK')"
```

## Outstanding for v0.49

Unchanged from v0.47 §11, because v0.48 moved no economy numbers:

1. **The 670 missing game-years** between Part 1 alone (Icathia y1,005.3) and the full v0.47 build (y435.9). Prime suspect: v0.47 Part 4.4's Storehouse re-pricing. Needs one isolation run.
2. **Convergence needs a sink, a decay or a rate — not a stripe.** W₂/W₁ measures ×1,244 against an assumed 2.4 because Worship is a cumulative time-integral of devotion income, not a rate. No value of `s` can hold the band.
3. **Foundry/Reactor tier separation** ×0.525 against Kittens' ×181. Deferred three rounds.
4. **The Longhouse parity gap** — RR unlocks it from Woodcraft rank 3, Kittens from `construction` rank 7. Held for v0.48 and not addressed.
5. Sparks y90.6 against a "not before y150" floor; first trade y201.5, still after Sparks.

New:

6. Four buildings now carry declarative boost fields whose *pool aggregation* is still hand-written at the call site (`chembarrel`, `tradeDock`, `hexgateBuilding`, `workshop`). Adding a second building to any of those pools still means editing the call site. The fields make that visible; they do not make it automatic.
