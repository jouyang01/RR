# v0.51 SPEC — Analyzer Input (action every part)

Input spec for the analyzer session, assembled from the code-verified v0.50 mapping (`index_50.html`, checked line-by-line 2026-08-04) plus the v0.50 build report and handoff. **Every part in this document is to be actioned this round** — either as a spec item issued to the builder, a measurement you run and report, or a ruling/draft you return to Jerry. Nothing here is optional context; if a part cannot be actioned, say so explicitly and why rather than silently dropping it.

Jerry has his own notes on all of these; this document is the shared reference so the round's spec and his notes reconcile.

---

## Part 0 — Ground rules for this round (read before writing the spec)

**0.1 — This is a LEVER round.** Era 3 measures 655.9 game-years against the 1,400–2,300 target, and v0.50 moved it the wrong way (−45.0). The v0.50 handoff's own conclusion stands: structure and correctness rounds are done paying for themselves; this round's spec items must be justified by their expected pacing direction, and the round fails its purpose if Era 3 does not move toward target.

**0.2 — Do not re-open the following. They are settled, code-verified, and re-litigating them has cost rounds before:**

- The Convergence stripe. It is Kittens' literal `0.01 × unlimitedDR(worship, 1000)`, capped ×10, since v0.47. The code comment says "do not derive this again." The v0.46-derived 1,884 is superseded history, not a discrepancy.
- Chronoshard has **no champion gate** in code (`icathia` tech only; Zilean is flavor text). Any source doc saying otherwise is wrong about the shipped game — see Part 6.2.
- Ascent stays free, instant, uncapped, bonus-free. Permanently closed.
- The 1.25 ratio band and its whitelist — ruled and closed in v0.50 Part 4.
- Gameplay notes #1, #2, #4, #5, #6, #8, #9, #10, #11, #12, #13, #14, #15, #16, #17, #19 — all verified shipped in `index_50.html`. Do not mark any of them outstanding.

**0.3 — Known failure mode, restated:** this analyzer instance has repeatedly marked already-shipped items as outstanding and cited identifiers that do not exist in the codebase. Every item below carries the code-verified state as of v0.50; verify against `index_50.html` before contradicting it.

**0.4 — Version discipline:** the last spec you titled "v0.48" shipped as v0.49. This spec's build ships as **v0.51** against baseline v0.50 (Sparks y148.0, Icathia y803.9, Era 3 655.9).

---

## Part 1 — The levers (code changes, pacing-positive)

### 1.1 — Arcane Reactor: the next ×10

v0.50's ×10 (`hexcore 40, hexcrete 80, focusedHex 60`) moved the count 21 → 12 against a predicted 5–8, bought only +9.4 years, and left separation at ×5.25 against Kittens' ×181. The evidence says the Reactor is still the cheap way to buy global production.

- Set cost to **`hexcore 400, hexcrete 800, focusedHex 600`** (effective-raw ≈ 6.26M; separation ≈ ×52 vs the Foundry's 119,252).
- Predict the Icathia count **before** the run and state the prediction in the spec, as v0.50 did. Report predicted vs measured.
- Pass condition: Reactor count at Icathia ≤ Foundry count, and `catMonument` at Icathia below v0.50's ×2.398.

### 1.2 — Farmstead: re-home the provisions boost (the round's largest single lever)

The `boost: { provisions: 0.03 }` is Kittens' Aqueduct figure on the wrong building — the cheapest starter at ratio 1.12, of which the bot builds sixty. Measured ×4.40, unbounded. **Recommended shape, in one move:**

- **Create a distinct mid-game building carrying the 0.03** — an Aqueduct analogue (working name: Irrigation Channel), unlocked by **Cultivation**, priced and ratioed off Kittens' real Aqueduct (`minerals 75`, ratio 1.12 — verify against source before setting). This restores true parity (Kittens' Aqueduct is a *distinct* building), fills the hole Granary's deletion left in Cultivation's unlock list, and *removes* production from the shipped state, which is the direction this round needs.
- Strip `boost` from the Farmstead; it keeps `prod.provisions 0.14`, seasonal, and nothing else.
- **Jerry has confirmed the recommended shape — ship it as written** (the `BOOST_LIMIT.provisions` key in 1.3 goes in as well, as belt-and-suspenders, not as the fallback).
- Report provisions/s at the v0.50 comparison state (60 Farmsteads, pop 201) before/after.

### 1.3 — Close the two unbounded BOOST_LIMIT slots

`BOOST_LIMIT` is `{ devotion: 2.0, knowledge: 3.0, culture: 2.0, gold: 1.5, vigor: 1.0, crystals: 2.0 }`. Two categories in active use have no key:

- **`provisions`** — add the key regardless of 1.2's outcome, sized against Kittens' catnip-boost stack (census it; do not guess).
- **`mana`** — Hexresonance's v0.50 re-homing (+0.25) landed in an unbounded slot. One member today, but it is the identical shape that produced the Farmstead surprise. Add the key now, sized so the current single member sits in the free band.
- Pass condition: every key in any `boosts` write has a `BOOST_LIMIT` entry, asserted by test so the third instance of this shape cannot ship.

### 1.4 — Normalize trade route vigor to 175 (Jerry's directive)

Every faction route gets the **same vigor cost: 175** (currently Demacia 225, Freljord 100, Piltover 150, Noxus 225, Bilgewater 300). Per-faction differentiation stays in the goods and gold columns, not vigor.

- Caravanserai and Letter of Marque remain subtractive discounts on top, unchanged.
- **This breaks the shipped Freljord 15:50 gold:vigor = 0.30 anchor assertion** (it was 30 gold : 100 vigor). Re-point that assertion deliberately and list it in §7 of the build report — the anchor was a parity check on the old prices; the new invariant to assert is `every route's vigor === 175`.
- Report first-trade timing and trades-affordable-at-Sparks under the new costs.

---

## Part 2 — Correctness (small, bounded, all shipped this round)

### 2.1 — Cultivation's +10% and the death of `resRatio`

`resRatio` multiplies the NET rate guarded on `rates > 0`, so its one member — Cultivation's +10% provisions — does nothing while a settlement is starving, the moment it exists for. Same defect class the census caught on Hexresonance.

- Move the +10% to `boosts.provisions` (under 1.3's new limit). The magnitude stays — Jerry's ruling kept the number, not the application shape.
- `resRatio` then has zero members: **delete the mechanism** — the table, the apply loop, and the breakdown branch. One less multiplier slot for every future census.
- Pass condition: at a synthetic starving state (net provisions < 0), Cultivation measurably raises gross provisions production; grep-level assertion that `resRatio` no longer exists.

### 2.2 — Remove Timberframe Joinery from the game (Jerry's directive — supersedes the "move it" recommendation)

The Longhouse unlocks at **Carpentry directly**, with no interposed Discovery.

- Delete the `timberframeJoinery` upgrade entry and the Longhouse's `unlock` predicate; the building's `tech: "carpentry"` becomes its whole gate.
- Legacy saves: owners of the upgrade need no refund logic beyond removing the flag, but check the v0.50 save-migration block (`fresh.upgrades.timberframeJoinery` grants `techs.carpentry`? — it currently maps mintedCoin/jessedHawks that way) and remove any reference so a stale flag can't resurrect a ghost gate.
- Pass condition: grep-level assertion that `timberframeJoinery` appears nowhere; Longhouse buildable at Carpentry with nothing else owned.

### 2.5 — Merge the Tavern's crowding relief into Bard's Hearth (Jerry's directive)

**One building is the Amphitheatre analogue.** Kittens' Amphitheatre does two jobs — culture production and unhappiness reduction — and RR split them across Bard's Hearth and the Tavern. Jerry's ruling: reunify.

- Move `crowdRelief` onto **Bard's Hearth** (size the per-copy value so the relief curve through `MORALE_RELIEF_LIMIT` at realistic Hearth counts lands near the old Tavern curve at realistic Tavern counts — state the before/after morale at the v0.50 comparison state).
- The Tavern is left with no effect: **remove the building**, with the same one-way save migration pattern as the Petricite Monument (drop `buildings.tavern`, refund a stated fraction of its cost; state the refund rule in the spec).
- Pass condition: exactly one building carries `crowdRelief`; morale band conditions (90–140 after y60) still pass.

### 2.6 — Remove the Bloomery and Refined Metallurgy (Jerry's directive)

Delete the Bloomery building and the `refinedMetallurgy` tech (42,000) with everything that hangs off it.

- Save migration: drop `buildings.bloomery` with a stated refund; a researched `refinedMetallurgy` flag is simply dropped (knowledge is not refunded — consistent with prior removals).
- Check for orphans before shipping: anything whose unlock, cost, or prose references the Bloomery or Refined Metallurgy (the Research panel is cost-sorted, so the ladder just closes up).
- Pass condition: grep-level assertion that `bloomery` and `refinedMetallurgy` appear nowhere; steel economy re-measured (the Forge is again the only steel converter — report steel/s at the standard comparison states so the loss is sized, not assumed small).

### 2.3 — CAMP_YIELD: fix the false comment, then census the stack

`CAMP_YIELD_LIMIT = 6` carries the comment "insurance, not a nerf" while the measured stack reads **6.35 — at the bound and load-bearing**. False justifications in this codebase have cost rounds (the MORALE_RELIEF_LIMIT comment, v0.45).

- Replace the comment with the true state in the same commit as anything else touching camps.
- **Census the nine members against Kittens' hunt-yield line** (Bolas, Hunting Armour, Steel Armour, and the catpower-side upgrades — pull the real list from source, same discipline as the v0.50 job-line census). Report member-by-member parity and rule whether 6 is the right bound or the stack needs pruning. `LUXURY_CAMP_YIELD_LIMIT 1.0` is in scope for the same table.

### 2.4 — Rule on the test-v38 proportionality bound

Two RR-invented rules have now been contradicted by the source in two rounds; the 1.25 band got ruled on and closed, this one got widened to 15× with a note. Give it the same treatment: **rule, don't carry.** Recommended ruling: delete the bound and record in the test that Kittens has no effect-to-ratio proportionality rule (the Aqueduct itself violates it). If you keep it, state what defect class it still catches that `auditCostGraph`/`auditRawGraph` do not.

---

## Part 3 — Measurements to run and report (no code until measured)

### 3.1 — The Tinkerer/Augment chain — the least-measured large multiplier in the game

Sixteen Augment Chambers at `jobBoost.tinkerer 0.40` is a ×7.4 additive boost on a job with no Kittens parity anchor (0.015 crystals/s base, ×1.25 Lapidary), feeding a resource whose cap the Hexgate widens to 400. `buildingJobBoost` is unbounded by design (matches Kittens) — that is not the concern; the absence of any measurement is.

- Report at Icathia: tinkerer count, Augment Chamber count, crystals/s gross, crystals time-at-cap %, and what the crystals actually get spent on.
- Rule from the measurement whether the chain needs a spec item next round. Do not pre-emptively nerf.

### 3.2 — Shimmer Refinery: cheapen it (Jerry's ruling — option (a), measurement sizes the cut)

Zero built in every measured run; the shimmer economy is the Sump Crawl expedition. The converter is real (`coalgas 0.2 + mana 0.5 → shimmer 0.05`); the bot just never pays `plating 20, alloy 15` while the Crawl is free. **The ruling is made: recost the Refinery downward.** The measurement's job is to size the cut, not to reopen the decision.

- Measure shimmer/s per effective-raw invested for the Refinery vs the Sump Crawl's yield per expedition (including vigor cost), at Deep Works and at Icathia — then set the new cost so the Refinery is the better marginal shimmer source at some clearly stated scale.
- Pass condition: Refinery count at Icathia > 0 in the full-build run, with the cost cut isolated in its own slice so its pacing effect is attributable.

### 3.3 — Trade-aware pacing (calibration honesty)

Every pacing number this project steers by assumes zero trades, while a player at Sparks could run 44.8/game-year. Either **teach `manageTrade()` a banking policy** (e.g., trade when vigor stock > N× the cheapest route and no expedition is queued) and re-baseline, or **record in the pacing objective files that targets are calibrated for a no-trade player** — a conscious ruling, not an accident of the greedy bot. Actioning this part means doing one of the two, not deferring it.

---

## Part 4 — Rulings to draft and return to Jerry (do not ship code)

### 4.1 — The Sparks champion gate: RULED — it stays

**Jerry has ruled: the gate is allowed.** No code change, no measurement of the softened alternative needed. The actioned form is documentation: supply the exact standing-directive text for `rr-design-spec.md` recording that Sparks Beyond the Wall's recruited-Piltover/Zaun-champion requirement (Twitch/Caitlyn/Heimerdinger) is the **single sanctioned exception** to the "champions never hard-gate content" rule — it gates Era entry on a 3-of-10 choice, not any specific champion — so no future analyzer or builder session flags it again. Add a matching code comment at the `sparks` tech entry citing the ruling.

### 4.2 — Source-doc corrections: CONFIRMED — supply the text

Jerry has confirmed both corrections. Supply the exact replacement text for each; Jerry applies them:

- `era3_4_bridge_spec.md`: remove the Chronoshard "gated behind Zilean" line — false in code (gated on `icathia` tech only), contradicts the never-gate rule the same document restates.
- `era3_regional_crafting_spec.md`: remove the Prospector/Stoker worker roles — superseded by ruling; the three Zaun raws are autoprod, matching Kittens' Smelter/Calciner.

---

## Part 5 — UX remainder (the three surviving gameplay notes)

- **5.1 (note #3):** the Census unlock is a Lore research named **"Keeping the Rolls"** (Jerry's directive). It reveals the roster detail (names, XP bars, traits) while the plain job-assignment UI stays available from the first Shelter. Seed its Era placement and Knowledge + Culture cost consistent with how other lore unlocks are priced, and state the numbers.
- **5.2 (note #7):** confirm whether the v0.46 visibility rule (Shelter visible at 4 timber, Archive at 30% of cost) actually shipped — it was not found in this verification pass. If absent, re-issue it; if present, cite the line and close the note.
- **5.3 (note #18):** the stale "researchable" red label that doesn't clear until a tab switch. UI-only; spec the fix alongside any other UI item this round rather than leaving it floating.

---

## Part 6 — The structural lengthener (design item, this round or explicitly scheduled)

### 6.1 — The Eludium tier

Kittens has a real intermediate (`Alloy + Unobtainium → Eludium`, 2500+1000) between Alloy and the endgame that RR never accounted for — flagged in `kittens-game-reference.md`, unresolved since. This round needs Era 3/4 *longer*, and a missing crafting tier is a structural lengthener, unlike price multipliers. **Action:** design the RR analogue — a deep-crafted intermediate between the Chemtech Alloy/Hexgear tier and the Hextech Core capstone (or in the Era 4 spine before Voidglass), with costs rank-matched to Eludium's position in the source chain. If you rule it out of v0.51's scope, the actioned form is a dated placement in the v0.52 plan with the design sketched — not a re-flag.

---

## Part 7 — Discipline, verification, pass conditions

**Isolation:** three-build discipline again, **cumulative prefixes of the shipped file** — Part 1 levers, then Part 2 correctness, then everything else. Each Δ attributes to one slice.

**Instrument before launching:** every metric named in Parts 1–3 (Reactor counts, provisions before/after, starving-state Cultivation, Tinkerer chain numbers, Refinery-vs-Crawl, Sparks-without-gate if measured) goes into the harness before the first 2,500-year run. v0.50 re-ran two 2,500-year runs for skipping this.

**Operational (both broken twice now):** kill by PID from `ps -eo pid,args`, never `pkill -f` a pattern matching your own shell; size every sleep under the tool timeout when background runs are live.

**Suites:** all 18 existing suites green plus `test-v51.mjs` covering: the Reactor price, the Farmstead/Irrigation split, both new BOOST_LIMIT keys, the boosts-implies-limit assertion, `resRatio` nonexistence, `timberframeJoinery` nonexistence + Longhouse-at-Carpentry, `bloomery`/`refinedMetallurgy` nonexistence, exactly-one-`crowdRelief`-building (Bard's Hearth) + `tavern` nonexistence, every route's vigor === 175, the Shimmer Refinery recost, "Keeping the Rolls" gating the Census, and the CAMP_YIELD comment. Any re-pointed shipped assertion (the Freljord 0.30 anchor will be one) gets listed in §7 of the build report with its superseding item, per standing practice.

**Round pass conditions:**

| Condition | Target |
|---|---|
| Era 3 length | **> 700.9** (beats the v0.49 high-water; state the distance to 1,400–2,300) |
| Reactor count at Icathia | ≤ Foundry count |
| Provisions at 60-Farmstead state | Reported before/after; boost bounded or re-homed |
| Starving-state Cultivation | Gross provisions rises |
| `auditRawGraph()` / `auditCostGraph()` | 0 / green |
| Shimmer Refinery count at Icathia | > 0 |
| Morale band 90–140 after y60 (post-Tavern merge) | 100% |
| Removed content (`tavern`, `bloomery`, `refinedMetallurgy`, `timberframeJoinery`) | Absent at grep level; save migrations verified on a v0.50 save |
| Trade vigor | Every route === 175; first-trade timing reported |
| Rites of Targon | < y55 (still failing; report) |
| 130 wanderers | < y600 (still failing; report) |
| Vigor at cap | < 10% |
| Every Part above | Actioned, or its non-action explicitly justified in the report |
