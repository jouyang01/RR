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

### v0.58.1 — the off-cycle round (48 notes, `docs/specs/rr-devnotes-v0.58.1.md`)

**Every one of Jerry's forty-eight v0.58.1 notes was actioned and is closed here.** Struck
through and cited by the round that closed them, per `OFF-CYCLE-PROTOCOL.md` §4, so none is
re-filed later. Grouped rather than listed one per bullet only because they arrived as one
numbered artefact and that artefact is archived intact.

- ~~**1 — the Festival.** No culture reward, one full game year (400 days), gives gold, cannot
  be layered, costs Vigor, larger culture cost as a repetitive sink, flat +20% morale.~~ —
  **v0.58.1 note 1.** Culture and vigor are PER-HEAD, which is what makes the culture draw
  repetitive rather than a one-off toll. **The +30% → +20% cut also fixed v0.58's one failing
  pass condition:** the morale 90–140 band was reading 76/72/98% against ≥80% and is back to
  98–100%.
- ~~**2 — Warehouses should not store hextech crystals.**~~ — **v0.58.1 note 2**, reverting
  v0.58's own note 13. The system working: Jerry shipped it, played it, and withdrew it.
- ~~**3 — Noxus' failure line cites "standing", which does not exist.**~~ — **note 3.** It
  never did. The line names `failChance`, which falls 3 points per caravan, instead.
- ~~**4, 5 — the +caravan button; the caravan tooltip spoiling locked cargo.**~~ — **notes 4
  and 5.** The last place in the file still leaking un-unlocked content into a tooltip.
- ~~**6 — the Revelations arrive all at once and cost too little devotion.**~~ — **note 6.**
  They reveal at half their worship threshold and the devotion ladder is 250 / 600 / 1,200 /
  1,800 / 3,000 — monotone for the first time, and unreachable without a real Targon quarter.
- ~~**7, 8, 9 — the cooldown camps are cheap and pay no gold.**~~ — **notes 7–9.** All three
  tiers now sit on one gold-per-cooldown-minute line: ~16 at 10 min, ~17 at 15, ~22 at 20.
- ~~**10, 12, 14 — no bulk actions for jobs, hunts or trades.**~~ — **notes 10, 12, 14.**
  Bulk hunting is restricted to camps with no cooldown and no charge timer, and both bulk
  runners LOOP the real single-action function rather than reimplementing it.
- ~~**11 — the top of the wanderer ladder is too shallow.**~~ — **note 11.** The two top GAPS
  double; nothing below Master moves. Re-rated **HARDER** in the ledger — the parity debt on
  Challenger goes from 27.8% to 102%.
- ~~**13, 18 — the Marus needs a worship gate; the Ascent destroys fractional devotion.**~~ —
  **notes 13 and 18.** The Ascent banked `Math.floor(devotion)` and then zeroed the stock, so
  every fractional point was silently destroyed on every one of 47–178 ascents in a run.
- ~~**15, 16 — culture and devotion cap multipliers are 6–7× the source's.**~~ — **notes 15
  and 16, shipped as STANDING-RULINGS §29**, a new explicit ruling from Jerry that amends §22
  and §23a by name. Culture ×6.43 → ×1.05 fixed-multiplier; devotion ×10.36 → ×1.00 whole-cap
  with a ×1.5 slice on one building.
- ~~**17 — the transmute button ignores craft effectiveness.**~~ — **note 17**, bounded at a
  quarter weight because this term sits inside the trade circuit's loop guard. See BUILD
  REPORT §1.
- ~~**19–25, 27, 45 — seven leader bonuses and two passives.**~~ — **notes 19–25, 27, 45.**
  Swain's was abusable by construction (a discount on a one-time purchase can be toggled on
  for the instant of the purchase); Caitlyn's duplicated Twitch's; Jarvan's was a nonfactor.
- ~~**26 — champion experience is unlabelled.**~~ — **note 26.**
- ~~**28, 29 — the Dragon Soul arrives one drake early; the Infernal Drake is a weaker copy
  of it.**~~ — **notes 28 and 29.** The Soul's gate is `DRAKE_TYPES.length`, not a literal 4.
- ~~**30, 31 — champions are too cheap early and the Hall of Heroes has two ceilings.**~~ —
  **notes 30, 31, 31.1, 31.3.** **Note 31.2 is a hard constraint and it is asserted, not
  hoped:** 20 Halls clear the 15,377 tenth champion flat, and the cumulative ladder with the
  Scholarship line.
- ~~**32 — Jack in the Box morale runs away.**~~ — **note 32.** `limitedDR` was the wrong
  primitive — it is LINEAR below 75% of its limit, so seven boxes paid full freight. The first
  five stay linear as the note asks and everything past five goes through `strictDR`, which
  has a true asymptote.
- ~~**33, 34, 39, 41, 44, 46 — six costs and yields.**~~ — **notes 33, 34, 39, 41, 44, 46.**
  Freljord's Deepwinter clause was a CONVERSION, so "winter always provides" made the route
  worse in winter; it is a bonus now.
- ~~**35, 36, 40 — scouting is too cheap; the Rift Scuttler is a rounding error by Era 3;
  there is no star-shard event.**~~ — **notes 35, 36, 40.** The Scuttler pays a share of the
  CEILING now, and Celestial Observatories raise the star shard's chance through `strictDR`.
- ~~**37, 38 — the Targon banner has no moon; a festival is invisible.**~~ — **notes 37, 38.**
- ~~**42, 43 — a grammar error and undifferentiated trade lines in the chronicle.**~~ —
  **notes 42 and 43.**
- ~~**47 — policies stop being a culture sink after the second group.**~~ — **note 47.** The
  spread goes 12× → 35×, the first two groups untouched. It only works BECAUSE of note 15:
  this scaling against v0.58's ×6.43 multiplier stack would have been a speed bump.
- ~~**48 — no Factory-shaped building.**~~ — **note 48.** The Hexdraulic Manufactory is inert
  on purchase and becomes what its three discoveries make it. RR has never had one.


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

---

## v0.56 — Jerry's three directives, and the storage round

- ~~**"Farmer's are not affected by seasonality, adjust this."**~~ — **v0.56, Part 3, and the
  premise needed correcting before the fix could be right.** Seasonal farmers shipped in v0.55
  and the code was correct — `if (r === "provisions") jv *= farmMult;` was live and asserted at
  all four seasons. What produced the symptom was **Leona's lead**, which floored `farmMult` at
  1 and therefore deleted seasonality outright; and v0.55 had silently widened its blast radius
  from buildings to buildings + jobs. She now HALVES the shortfall instead of removing it —
  Deepwinter ×0.25 → **×0.625**, a cold snap ×0.5 → ×0.75, and Firstbloom ×1.5 unchanged. Both
  the maths and the forecast tooltip read one function; the lead's prose is generated from the
  constant. **STANDING-RULINGS §17 still stands: do not revert seasonal farmers.**
- ~~**"Consumption should follow kitten's line."**~~ — **v0.56, Part 2.** 4 → **4.25**
  (`catnipPerKitten: -0.85` × 5 ticks/s), farmer:eater ratio back to **1.17647 exactly**. This
  closes the disagreement v0.55 opened: the analyzer asked for 4.25, Jerry's v0.55 directive
  said 4, 4 shipped with the 6.2% relaxation recorded, and Jerry has now ruled the other way.
- ~~**"Wanderer EXP gain should be SLOWER than before."**~~ — **v0.56, Part 1.** `XP_PER_SECOND`
  2 → **0.5**, slower than v0.55's 2 and v0.54's 1. Time to Challenger 1.60 → **6.39 real
  hours**. And the source's **skill cap is finally found and ported**: `js/village.js:2622`
  `var skillsCap = 20001;` against a top tier at 9,000, rank-matched to RR's Challenger 11,500
  → **XP_CAP 25,556**. RR had no cap at all and the measured top bank was **1,335,491**. The
  RATE is still UNVERIFIED — `skillXP` itself could not be located — and the ledger says so.
- ~~**"Ensure that the storage changes take place on this patch."**~~ — **v0.56, Part 5**, dated
  three times and now shipped. One multiplicative chain across twelve resources becomes the
  source's two additive accumulators at three scopes: **narrow ×14.98 · broad ×2.80 · quarter
  ×2.0875 after Silos · none ×1.00**, with every capped resource in exactly one tier.
- ~~**"The provision cap is too large and deepwinter is never a problem."**~~ — **v0.56**, and
  measured: provisions sat at cap **1.5% of ticks** on the v0.55 build. The Storehouse held
  7,500 against Kittens' barn 5,000, the Harbor 10,000 against the harbour's 2,500, and the
  Warehouse held none at all against the source's 750. All three now hold the source's figures,
  and provisions moves onto the quarter tier gated on Silos exactly as the source gates catnip.
  **STANDING-RULINGS §20.**
- ~~**`test-v32` "flakes under CPU contention".**~~ — **v0.56, Part 6. It does not.** The camp
  block took its baseline with a live roster, and since v0.55 a stray Trailblazer moves
  `campYieldMult()` by half a percent. Three rounds of failures were misattributed and the
  documented remedy — re-run on an idle box — worked by luck. **§21**, and
  `tools/fixture-sweep.mjs` is now the standing detector.

---

## v0.57 — Jerry's two directives, and the round that gave the instrument error bars

- ~~**"Renown should not be in materials storage cap multiplier. Renown should be in
  Culture/Devotion's cap multipliers line."**~~ — **v0.57, Part 1**, and the directive is better
  grounded than the ruling it replaces. `js/resources.js addBarnWarehouseRatio` touches **seven
  material effect names and nothing else**; Kittens relieves non-material ceilings by other
  machinery entirely. Renown moves into `SCHOLAR_CAPS`. Jerry's conditional then fired on
  measurement — time-at-cap 88.7% → **83.1%**, not below the 70% trigger, and the tenth champion
  still never affordable — so the **dedicated line ships too**: `renownCapPct 0.08` per Hall of
  Heroes, which is **Kittens' own Ziggurat figure** on the additive per-copy shape RR already
  uses for culture. Not a fourth Discovery chain. **STANDING-RULINGS §22.**
- ~~**"Double check consumption."**~~ — **checked, nothing to change.** `CONSUMPTION 4.25`,
  farmer 5.000/s, ratio **1.17647** — Kittens' `catnipPerKitten −0.85 × 5` against `catnip: 1 ×
  5`, exact. Asserted so it stays that way.
- ~~**"The wanderers tab says Farmers (the harvest follows the calendar) when in reality,
  Farmers provision production should not be impacted by winter."**~~ — **v0.57, Part 2, and it
  REVERSES v0.55's directive 5.** The string Jerry read was accurate, which is the point: v0.55
  shipped seasonal farmers on a premise about the source that the builder disproved in the same
  round, and it shipped labelled **RR-ORIGINAL / HARDER** precisely so it could be revisited on
  the label. Jerry read the label and reversed it. The season term is gone from the farmer;
  **seasonal BUILDINGS keep theirs**, which is Kittens' catnip field and *is* seasonal in the
  source. Ledger row **HARDER → PARITY**. Leona keeps her lead and it still means something —
  her blast radius simply returns to buildings. **§17, amended not deleted.**
- ~~**The bot has no food policy.**~~ — **v0.57, Part 4.** `manageJobs()` staffed **one farmer**
  at every milestone in every era at every population from 36 to 220, because the old rule could
  only fire when somebody was idle and only reacted to *today's* net. It now **projects to
  Deepwinter**, **pulls a worker off the largest other job** when nobody is idle, and unstaffs
  only when the stock is at ceiling *and* winter is covered. Measured immediately: 1 farmer →
  **17** at Sparks pre-Part-2, then back to **4** once winter stopped quartering them.
- ~~**Single-seed pacing numbers.**~~ — **v0.57, Part 3.** `--seeds N` launches seeds
  concurrently and reports median/min/max/spread, with **ensemble figures printed separately
  from single-run figures** so a report cannot quote one as the other. **§25.**
- ~~**"EASIER 32" in four documents against the ledger's own 29.**~~ — **v0.57, Part 7.1.** The
  ledger was right and the prose was wrong. The **generator now aborts** rather than write a
  file whose verdict buckets do not sum to its own row count, and `test-v57` checks the
  summary table against the rows it summarises. Found while adding the guard: the `carpentry`
  row's verdict said HARDER while its own note said *"i.e. EASIER"* — same class of defect,
  fixed.


---

## v0.59 — Jerry's eight renown/Scholarship directives and eight feel notes, all actioned

- ~~**"Renown should not be in the Scholarship line either."** (directive 7)~~ — **v0.59 Part
  5.3, and it took a whole cap family with it.** §29 had already emptied `SCHOLAR_CAPS` to
  renown alone; removing the last member left an empty family object, which is worse than no
  family. `SCHOLAR_CAPS`, `scholarMult`, `scholarCapNames()`, the `scholar` branch of
  `capFamilyOf()`, the ternary arm in `computeCaps()` and both `!SCHOLAR_CAPS[...]` guards are
  all **deleted**. **RR is down from three cap families to two.** Renown's ceiling is
  `210 + 900 × Halls`, flat, and **Poppy's +8% now reaches it**. **STANDING-RULINGS §29 stands;
  §30 is new.**
- ~~**"The Scholarship line should be about knowledge."** (directive 8)~~ — **v0.59 Part 5.4,
  and the source backed the instinct precisely.** The five rungs become **per-building**
  knowledge amplifiers, never a whole-cap multiplier: three Reflectors rungs at Kittens' own
  **Σ 0.06**, scaled by Observatory count inside the Archive's slice, and two Astrolabe-shaped
  **+50% per copy** on the Academy and the Hexcore Laboratory. **Kittens has exactly one
  whole-cap science multiplier in the entire game and it is the `technocracy` POLICY** — so the
  standing rule is recorded and nothing ships against it. Measured ×1.30 on the building total
  *and* ×1.30 on the fully-stacked ceiling, because the Morellonomicon clamp reads the building
  total.
- ~~**"Hunting should always give renown; the charges should multiply it."** (directive 3)~~ —
  **v0.59 Part 2.1.** The guard is deleted and the charge multiplies ×3 **after the floor**. The
  bigger find was underneath: at `RENOWN_DEED_RATE 0.34` the floor collapsed the whole low
  ladder to a flat 1 — Wolves, Gromp, Raptors and Krugs, authored at 2/2/3/3, **all paid 1**.
  The rate rises to **1.00** and every camp now pays the number printed on its card.
- ~~**"Renown passive gain should be flat and should not backfill."** (directive 2)~~ — **v0.59
  Part 2.2.** Flat **0.007/s**, 100× smaller at pop 140 than the old pop-scaled trickle. The
  gate moves to `callToArms`, which fixed a live defect: renown was **hidden** until Call to Arms
  but the trickle ran anyway, so players arrived at the tech with the meter already pinned at
  30/30 by a resource they had never seen.
- ~~**"Trading should give renown."** (directive 4)~~ — **v0.59 Part 2.3.** +1 per completed
  caravan for every leader; Caitlyn's 5 **adds**, so she pays 6. Moved inside the success branch,
  which fixed a second thing: her grant had been paying out on **failed** caravans.
- ~~**"Renown from the Ascent / from first-time research."** (directives 1 and 5)~~ —
  **measured at 0 and NO CODE SHIPPED.** Both were already correct. Two ledger rows so a future
  round does not add them as an "obvious" deed source.
- ~~**"There should be a bigger renown sink."** (directive 6)~~ — **satisfied by Part 5.3 alone.**
  Deleting the ×2.60 takes the tenth champion from 7 Halls of Heroes to **18**. No escalation
  lever was needed: `RECRUIT_RATIO` is untouched, the Hall's 900 is untouched, and no hard
  building-count gate ships — which is the Kittens-shaped answer, since the source paces content
  by making the ceiling building expensive, never by a "you must own N of X" check.
- ~~**"907 is okay for Era 3."**~~ — **v0.59 Part 3. The 1,400–2,300 band is RETIRED**, with the
  reasoning recorded in `pacing.mjs`: Icathia is now reached on every seed for the first time,
  and every Era-3 target in this project predates the ×2.62 → ×1.02 spread collapse. **Retired,
  not re-based to 907.**
- ~~**"Only bulk crafting of transmute should show in the chronicle."**~~ — **v0.59.** A single
  cast is visible in the resource column as it happens; a batch is what a player cannot
  reconstruct, and the Arcanist's Circle's yearly draw is always a batch.
- ~~**The eight feel-and-UI notes.**~~ — all shipped, each with a ledger row: the job row wraps
  and its chips size to their own text; **crafting AND trades** now use the existing undo window
  and its re-roll guard (closing an open v0.55 item); Zilean spends banked time on a **button**
  and the automatic trigger is deleted; bulk hunting works on charge camps and is still refused
  on cooldown camps; **Swain's passive moves to mana** so it stops duplicating his own lead; a
  second Arcanist rung completes Kittens' two-rung job line at ×1.80 exactly; the Festival was
  already on the buff banner; and its mushroom cost halves with plumes **derived** at half of
  that, so the ratio cannot drift.
