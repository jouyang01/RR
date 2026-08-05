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
