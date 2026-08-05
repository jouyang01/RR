# Gameplay Notes

Jerry's raw playtest observations — what actually felt wrong, confusing, slow, or broken
while playing the shipped build.

This file is deliberately unstructured and deliberately untriaged. Notes go in as they are
observed, in whatever form; the Analyzer triages them into numbered spec items in a later
round, and a note stays here until the round that actions it cites it by number and closes
it. A note that turns out to describe something already shipped gets struck through rather
than deleted, so the same observation is not re-filed twice.

This is not a bug tracker and not a spec. It is the input to one.

---
## Actioned

- ~~**Loose rule: each Knowledge research should reveal only 1–3 others.** Almanac unlocked
  five at once; it should unlock Cultivation, Woodcraft and Expedition Logistics only, and any
  other research breaking the rule should be brought into line.~~ — **v0.53, directive 1.**
  Three `req` edges moved (Songcraft → Cultivation, The Scriptorium → Woodcraft, Progress Day →
  Hexdraulics, Voidglass Optics → The Grey Reclamation). No price changed. `test-v53` asserts
  the rule over the whole tree, not just the Almanac.
- ~~**Mouseover tooltip: do not show an effect if the player has not unlocked that part of the
  game yet** (the Storehouse should not advertise max gold +10 before gold exists).~~ —
  **v0.53, directive 2.** `effectLines()` gates every production, storage and boost line on the
  game's own `resUnlocked()`.
- ~~**Woodcraft does not unlock Support Beams; Carpentry does. Fix the tooltip.**~~ —
  **v0.53, directive 3.** Both halves were wrong: the resource ROW was also gated on Woodcraft,
  two ranks before the recipe existed. Tooltip and gate both corrected.
- ~~**Gold storage should start at 200.**~~ — **v0.53, directive 4.** `RES.gold.baseCap`
  80 → 200; the storage line's own gold terms unchanged.
- ~~**Auto-converter of mana into timber: a Discovery (Arcanist's Circle) that auto-converts
  33% of mana to timber if capped, on a yearly basis. Unlocked after Songcraft.**~~ —
  **v0.53, directive 5.** Note in BUILD REPORT §9: the bot transmutes at 80% of cap, so mana
  almost never reaches the ceiling in simulation and the Circle almost never fires there. That
  is a property of the bot, not the feature.
- ~~**Parchment should be seen as craftable as soon as Furs are obtained.**~~ —
  **v0.53, directive 6.** The reveal moved to `seenMax.furs >= 1`; the 175-fur cost is
  untouched Kittens parity.

## Actioned — v0.54 (offline audit + seventeen dev directives)

- ~~**Hextech crystals — True Ice Cellars should not cost them, they are not unlocked yet.**~~
  — **v0.54, directive 1.** Crystals removed; gold 200 → 300 so the Discovery still costs
  something at its own rank. `test-v54` asserts nothing priced in crystals sits below Hextech
  Theory.
- ~~**Jayce event comes too early — is it because of True Ice Cellars?**~~ — **v0.54,
  directive 2.** Yes: Jayce was the crystal economy's only faucet and, via True Ice Cellars,
  its only reason for existing. Now gated on Hextech Theory as well as population 16.
- ~~**Scouting Party should be in the Trade tab and cost 500 Vigor.**~~ — **v0.54,
  directive 3.** Moved via `tab: "trade"`, flat 500 vigor, escalator deleted (it reached
  1,311 vigor + 2,505 provisions for the fifth civilisation).
- ~~**Gromp tooltip should not show the rare stray poro until Abyssal Cartography.**~~ —
  **v0.54, directive 4.** An expedition's `yield` may now be a function of state.
- ~~**Cataloguing should be gated behind Rites of Targon.**~~ — **v0.54, directive 5.**
  Knock-on handled: Cross-Referencing gains `req: "cataloguing"` so I and II do not appear
  together.
- ~~**Four-Part Harmony and Scribes' Guild parchment costs −10.**~~ — **v0.54, directive 6.**
- ~~**Illuminators should be much later — when Tomes are first required.**~~ — **v0.54,
  directive 7.** Rites of Targon, behind Cross-Referencing, the first Discovery to charge
  Tomes.
- ~~**Wanderers should rank per job — a bronze jungler can be a challenger miner.**~~ —
  **v0.54, directive 8.** Experience banks in `w.jx` per trade; `w.xp` survives as the
  lifetime total. Measured: a Challenger miner farms like a Bronze farmer until they farm.
- ~~**Deepwinter forecast should say "Stock provisions", not "Stock granaries".**~~ —
  **v0.54, directive 9.** Granaries were consolidated into Storehouses in v0.10.
- ~~**No merchant fatigue in Trade.**~~ — **v0.54, directive 10.** Deleted entirely; it had
  no Kittens counterpart and its counter-play was to stop playing for ninety seconds.
- ~~**Caitlyn's leader bonus needs reworking if fatigue is gone.**~~ — **v0.54,
  directive 11.** And Twitch's with it — his lead had become a leader slot that did nothing.
  Both now act on cargo slots.
- ~~**The poro Chronicle line says "morale soars"; poros have no morale effect any more.**~~
  — **v0.54, directive 12.** It now names the Pasture's `eatCut`, which is what a poro is
  actually worth.
- ~~**Poro production should match Kitten's.**~~ — **v0.54, directive 13.** 0.001/s → 0.005/s;
  the source's 0.001 is PER TICK at 5 ticks/s. Five times too slow for four rounds. Two
  further divergences on the same building (priceRatio, eatCut) reported to the analyzer.
- ~~**Crafting should show the amount crafted in the Chronicle.**~~ — **v0.54,
  directive 14.** Including the count that actually completed and why it stopped early.
- ~~**Tinkerer should unlock with Hextech Theory, not when the Refinery is built.**~~ —
  **v0.54, directive 15.**
- ~~**Rename Hex-Capacitors; +25% crystal AND forge efficiency; 30 crystals not 40.**~~ —
  **v0.54, directive 16.** Now Resonance Coils. Old saves migrated.
- ~~**The Wanderers tab should show the idle count in parentheses.**~~ — **v0.54,
  directive 17.** `TABS` grew an optional `badge()`.
- ~~**Offline progression: a backgrounded tab loses ~80% of production, and
  `runCatchUpChunked()` is dead code.**~~ — **v0.54**, both fixed, both asserted in
  `tests/test-offline-v54.mjs`. See `docs/OFFLINE-AUDIT-v0.52.md`.

---

## v0.55 — Jerry's directive, and the eight the analyzer sourced from it

- ~~**"Kitten's farmers are affected by seasonality."**~~ — **v0.55, Part 3.2.** Shipped, and
  the premise is factually wrong about the source: `js/village.js updateResourceProduction()`
  applies skill, rank, leader and happiness and **no season term**, `getWeatherMod()` lives in
  `js/calendar.js` and feeds the catnip *field*, and the Kittens wiki says it in a sentence.
  The change is good on its own merits — Deepwinter now cuts the settlement's entire job-based
  food supply 75% for a quarter of every year — so it ships as **RR-ORIGINAL, HARDER**, the
  first HARDER label under the charter. **STANDING-RULINGS §17. Do not revert it to parity.**
- ~~**The Hunter's Lodge feels abusable; move hunt yield to a discovery chain; the Jungler
  should not increase camp yield.**~~ — **v0.55, Part 4.** Both halves correct against source:
  Kittens' hunt yield is seven workshop upgrades (Σ 5.10 → ×6.10), its hunter job produces
  manpower and boosts nothing, and it has no hunt building at all. Lodge deleted, old saves
  refunded 50%, `campYieldMult()` rebuilt on the source's seven members. **§18.**
- ~~**Petricite Masonry unlocks far too early.**~~ — **v0.55, Part 2.1.** 9,500 → **65,000 +
  65 Morellonomica**, which is Kittens' `archeology` exactly, and `archeology` is what unlocks
  `quarry`. The Quarry's own cost and id untouched.
- ~~**Irrigation arrives too early.**~~ — **v0.55, Part 2.2.** It is Kittens' `aqueduct` to the
  digit (`minerals 75`, ratio 1.12, `catnipRatio 0.03`) and `aqueduct` unlocks at
  `engineering` 1,500. Moved from RR's 500 rung to its 1,500 rung.
- ~~**The food economy feels off.**~~ — **v0.55, Part 3.1/3.3.** It was running at **exactly
  one-tenth of Kittens'**, and it was the only resource that was. Farmer 0.5 → **5.0/s**,
  Farmstead 0.14 → **0.625/s** (it had been ×2.24 the source at RR's own scale), and a
  thirteen-site ×10 sweep across every provisions cost and cap. Consumption shipped at Jerry's
  **4** rather than the source's 4.25 — a 6.2% relaxation, reported.
- ~~**There should be a second food-storage building.**~~ — **v0.55, Part 3.4.** Kittens has
  **two** pastures and RR had ported one. The **Granary** ships at `provisions 100 + timber 10`,
  ratio 1.15, `eatCut 0.005`, on RR's 500 rung. `eatCutLimit` re-ruled from measurement and
  **kept at 0.5** — it is a tail-cap, not a tax, and it went from decorative to real.
- ~~**The Poro Pasture is too cheap to spam.**~~ — **v0.55, Part 5.** Ratio 1.15 → **1.75**,
  Kittens' `unicornPasture`. The bot's count went 60 → **18**.
- ~~**Drakes stop mattering too slowly.**~~ — **v0.55, Part 6.** `limitedDR` is linear below
  75% of its limit, so a player reached three-quarters of every drake cap with **no diminishing
  return at all**. New `strictDR` bites from the first kill: 25% of cap at 5 kills, 50% at 10,
  75% at 50, 90% at 100.
- ~~**Wanderers rank up too slowly.**~~ — **v0.55, Part 7.** `XP_PER_SECOND = 2`; Challenger
  goes 3.19 → 1.60 real hours. **The source figure could not be located and no citation was
  invented — it is UNVERIFIED**, and it turned out to be the round's largest pacing lever
  (Era 3 −193.6 game-years).
- ~~**Undo lets you re-roll a bad hunt.**~~ — **v0.55, Part 8.** The next roll of the same kind
  fails outright. Marker lives outside `S` (which `doUndo()` replaces wholesale) and survives
  save/load. Asserted by forced-fail outcome: 57 furs → undo → 36 → 57.

