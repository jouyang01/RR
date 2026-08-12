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

---

## v0.59.1 — Jerry's eight dev notes, all actioned (OFF-CYCLE round)

- ~~**"The mana discovery should affect all mana production, not just arcanists."**~~ — **note 1.**
  `leylineCalibration` leaves the Arcanist job line and becomes a global +30%, additive with
  Hexresonance and (now) True Ice Cellars: all three held is **+80%, never ×1.95**. **Its ledger
  row is RE-RATED PARITY → EASIER in the same round**, because the Kittens `catnipJobRatio`
  citation it shipped with six hours earlier no longer describes what the game does.
- ~~**"The new buttons on the wanderer page are terrible."**~~ — **note 2, and it reverses v0.59
  Part 8 note 1.** That round fixed clipped chips by letting the row WRAP, which turned eight
  rows into sixteen. Kittens' answer is structural: two controls per row and the 5/25/all steps
  in an **absolutely positioned** flyout, which cannot push the rows below it down. Measured at
  430px: six rows at 28px, zero overflow, and **the list bottom is identical with a flyout open.**
- ~~**"Get rid of Kindling Theory Research."**~~ — **note 3.** A 50,000-knowledge leaf whose
  entire content was opening one discovery. Banked Coals moves to Sump Ecology. **First
  application of STANDING-RULINGS §30:** `kindling` is a reserved id, the migration keeps the
  discovery the player paid for, and it names v1.0 as its retirement.
- ~~**"Sump Ecology unlocks the Sump Crawl... this is not shown in the materials section."**~~ —
  **note 4.1, and it was a REAL LOSS OF YIELD.** Coalgas and shimmer were revealed by `chemtech`
  alone, and `withYieldFilter()` DROPS a gain whose resource is hidden — so a player who took
  Sump Ecology first ran the crawl and **received nothing for two of its three rewards,
  silently.** Both now reveal on either tech.
- ~~**"Switch the costs of Sump Ecology and The Chemtech Whisper."**~~ — **note 4.2.** 55,000 ↔
  60,000. No rung added or removed, no other price moved.
- ~~**"The Sump Crawl should go after the Baron Nashor hunt in the UI."**~~ — **note 4.3.** It sat
  among the four Era-1 camps; it is the last expedition unlocked.
- ~~**"Bulk hunts should show the total yield, not an entry for each hunt."**~~ — **note 5.** One
  line carrying the summed yield and price. **A bulk of ONE is left alone** and keeps the camp's
  flavour line.
- ~~**"True Ice Cellars should not affect anything provisions related."**~~ — **note 6, and it has
  an argument beyond feel:** the −20% was a Discovery quietly rescaling `CONSUMPTION`, the one
  parity constant in the food economy. It is +20% mana now.
- ~~**"Hextech Manufactory should cost more crystals... a primary hextech crystal sink."**~~ —
  **note 7, backed by the v0.59 ensemble:** crystals sat at their ceiling **95.5% of all ticks**,
  finished 90,279/90,279, and the bot assigned **zero tinkerers** in 2,500 years. Cost 60 → 400,
  fuel 0.02 → 0.12/s, the three discoveries ×4.5–5. `ratio` untouched at 1.15.
- ~~**"Automated Workshop should work just like Kitten's Workshop Automation."**~~ — **note 7.2.**
  A yearly flat grant out of nothing becomes a **spill-guard**: at 95% of a raw ceiling the
  overflow converts to the crafted tier **at the ordinary price**. The 5% share is RR-ORIGINAL
  and ledgered UNVERIFIED rather than dressed up as parity.
- ~~**"Masquerade should unlock Harvest Rites, songcraft should not."**~~ — **note 8.** Songcraft
  is the tech that makes culture a resource; gating the festival on it put the first culture SINK
  on the rung that opens the faucet. Cost untouched, gate moved.

## v0.60 — Jerry's five round notes, all actioned or held as instructed

Four of the five are instructions about HOW the round should be run rather than what the game
should do; they are recorded here because two of them are holds, and a hold that is not written
down gets quietly re-proposed by the next spec.

- ~~**"Start with Part 1... until a suite that throws is a suite that fails, every measurement
  this round produces is being graded by an instrument that reports health when it crashes."**~~
  — **note 1, and it was the right ordering for a reason the note did not predict.** The guard
  shipped first and then **caught a real regression later in the same round**: Part 5 deleted
  `AUTOMATION_TRIGGER`, `test-v591` referenced it and died, and the missing `SUITE-END` trailer is
  what surfaced it. It also surfaced six assertions that had been passing on stale numbers. The
  balance check shipped as a **lower bound rather than the equality the spec asked for** — seven
  suites call `check()` in loops and legitimately execute more assertions than they have call
  sites; the deviation and its residual gap are stated at the top of `tools/run-suites.mjs`.
- ~~**"Then Part 2 before anything crystal-related... fixing the loop to pick the job furthest
  below its share makes ordering stop mattering permanently."**~~ — **note 2, and it is worth
  more than the tinkerer exactly as the note said.** The bot's `want` list was an ordered
  first-match with an early `return` and shares summing to 1.06 of a population of 1.00, so the
  last entry was unreachable **by construction**. Two rounds had read that artefact as a fact
  about the economy. The loop now normalises to an 0.85 budget and assigns the largest deficit.
  **The tinkerer exists for the first time in the project's history** — 1 / 3 / 5 / 6 across the
  run — and it was never a pricing problem.
- ~~**"Hold the line on Part 3... the arithmetic genuinely doesn't close. A third ×6 on
  `MANUFACTORY_FUEL` without that answer will fail the same way."**~~ — **note 3, HELD, and the
  decomposition settled it in the note's favour on the second of its two hypotheses.** 42
  Refineries × 0.02 = 0.84/s base delivers **77.33/s**: a ×92.1 stack, global bonuses ×4.66,
  **converter side ×19.77 against Kittens' ×3.70.** No unenumerated faucet — a multiplier is
  ×5.3 the source. **`MANUFACTORY_FUEL` stays at 0.12.** Also: **the 559/s two rounds argued over
  was never a Refinery figure** — that run had built 8–10 Augment Chambers and this one builds
  zero.
- ~~**"Change the EXP ratio to match kittens. We want the top rank to be reached in about 50-75
  hours."**~~ — **note 4, both halves, and it supersedes Jerry's own v0.58.1 note 11.** The rate
  is the source's: `js/village.js:3228` @ `c52985b` banks 0.01/tick and Kittens ticks 5/s, so
  **`XP_PER_SECOND` 0.50 → 0.05.** At that rate note 11's 18,200 top rung is 101.1 hours, outside
  the band; **11,500 is 63.9 hours, its centre**, so the top two rungs revert to 7,500 / 11,500 —
  Grandmaster for monotonicity, not symmetry. **There is no figure that satisfies both notes.**
  **This is a large pacing move and it landed as one: Era 3's median went 785.9 → 1,172.5**,
  because every wanderer skill bonus now accrues ten times slower for the whole run. If that is
  too slow, **the lever is the thresholds, not the rate** — the rate now has a line number.
- ~~**"Hold the line on Mana."**~~ — **note 5, HELD.** No mana constant moved this round.

## v0.61 — Jerry's four dev notes, all actioned (one of them a HOLD)

- ~~**"When Festival is active, it should show up as a buff similar to Hand of Baron and Crest of
  Cinders."**~~ — **note 1, and the chip already existed and could never fire.** The line tested
  `S.festivalUntil`, the WALL-CLOCK field — and v0.58 note 12 made the festival TICK-denominated
  so offline catch-up expires it at the right game-time, setting `S.festivalUntil = 0`
  explicitly. **Every festival held from v0.58 onward was invisible.** Worse, `test-v59` asserted
  it and PASSED for two rounds, because it grepped the source for the literal string rather than
  holding a festival and reading the banner. **A grep asserts that somebody wrote the code; it
  does not assert that the code runs.** Now reads `festivalActive()` and counts down in SEASONS,
  the unit the festival is actually denominated in.
- ~~**"Early EXP rate is okay. Can ignore analyzer there."**~~ — **note 2, HELD, and it overrides
  the round's largest proposed change.** The v0.61 spec's Part 2 would have re-priced the low
  rungs so RR's ladder crossed each Kittens bonus at the source's XP — the first rung is ×3.50
  (RR asks 350 where Kittens asks 100), which is 1 h 57 against 36 minutes for a player's first
  skill bonus. **Nothing ships. The ladder is asserted UNCHANGED**, because a hold that is not
  asserted is a hold the next spec re-proposes. The measurement stays on the record.
- ~~**"Let's have more (not all) of the discoveries cost knowledge."**~~ — **note 3.** 10 of 78
  Discoveries carried a knowledge component — 13% — against a source whose workshop upgrades
  essentially always cost science plus materials. **32 of 79 now, 41%.** The amount derives from
  the tech's own rung (`K / 10`) so a re-homed Discovery reprices itself; the SET is chosen by a
  stated rule — **a Discovery takes knowledge when it is a METHOD, not when it is an OUTFIT or a
  FACILITY** — which is why the axe, saw, storage and housing lines are exempt, and why
  everything post-Sparks is exempt here and takes crystals instead. **No Discovery is taxed twice
  for being late.**
- ~~**"Combine Deep Cartography and Champion's Regiment into 1 research that unlocks both
  discoveries."**~~ — **note 4.** Two `callToArms` children, each costing knowledge alone, each
  unlocking exactly one Discovery — a ladder with a landing on it. They become **The Vanguard
  Doctrine** (both Discoveries are about PREPARING a deed: drill the champions, map the route) at
  **45,000**, the centre of the only window a bridge tech can occupy: above the dearer of the two
  it replaces (35,000) and below the first Sparks child (50,000). **The player saves 18,000
  knowledge and part of it moves to the leaves**, where note 3 puts 4,500 on each Discovery.
  §30: both retired ids are reserved until v1.0, and a save holding either is credited the merge.

## v0.62 — Jerry's twelve notes, four follow-ups, and the knowledge sink

- ~~**"Shrine + Altar of the Dawn morale scaling."**~~ — **note 1, and the spec made it conditional
  on a measurement that crossed the line.** The cap was always there (`MORALE_SHRINE_LIMIT` 25, so
  the term asymptotes at +25 however many Shrines are built) — what the note is really about is the
  KNEE. **Measured at 40 Shrines: the shrine term was 79.2% of total morale**, above the stated
  half, so the base rate goes **0.5 → 0.25**. At 0.5 the first 37 Shrines paid in full; at 0.25 the
  linear region reaches 75, so an Altar tier is worth something for far longer.
- ~~**"Remove the fourth mana multiplier (Swain covers it)."**~~ — **note 2, reversing his own
  v0.61 note 3 one round later, and both are cited.** `boosts.mana` returns to **Σ 0.75, exactly
  its knee**, so all three survivors deliver in full again and v0.61's half-paid rung goes with the
  member that caused it. §30: the id is reserved and **a save holding it is refunded.**
- ~~**"Festival provisions cost should be higher."**~~ — **note 3, and it is the SECOND instance of
  one bug shape.** The cost was `60 × pop` and population plateaus near 200 while the provisions
  ceiling grows ×11.3 — so it cost 15% of the ceiling at Sparks and **1.3% at Icathia.** Now a
  fraction of the ceiling, which reproduces today's figure at Sparks and holds the bite after it.
- ~~**"Shaco should refund partial vigor on bulk hunts."**~~ — **note 4, and NOTHING WAS BUILT,
  because the note was already satisfied.** `runExpeditionBulk` loops `runExpedition(id)` n times,
  so every hunt already rolls its own refund and a ×5 hunt already refunds 0–5 fifths. **Verified
  before building, and the distribution asserted over 400 batches rather than a single roll.**
- ~~**"Noxus Raptor Plume trade cost → 100."**~~ — **note 5.** 120 → 100.
- ~~**"Morale tooltip need not explain poro / true ice."**~~ — **note 6.** Cut.
- ~~**"Rift Scuttler only on a charge run."**~~ — **note 7.** It had **no charge test at all**.
  Gated on `campEmpowered`; the 0.3 probability kept, so the measurement stays readable.
- ~~**"Gromp: honeyflower on a charge run, not a stray poro."**~~ — **note 8.** Gated the same way
  so both charge camps read identically, paying the honeyfruit event's own grant, **with the yield
  line moved in the same edit.**
- ~~**"Barn / Warehouse / Harbor storage against Kittens."**~~ — **note 9, and his reading of the
  source is exact.** Kittens' warehouse is SMALLER than its barn on every shared material. **RR's
  Storehouse already copied the barn value for value and does not move**; the Warehouse had gold at
  **×8.00** of it. Shipped at the source's own ratios: timber 150, ore 200, gold 5, steel kept.
  Harbor ore 500 → 950 and gold 200 → 25.
- ~~**"Marus Omegnum devotion cap → 200, and less devotion/s."**~~ — **note 10.** Cap directed;
  the rate taken from the source rather than invented — **Kittens' Temple is 0.0075/s and RR's
  Shrine sits at that exactly**, so a top tier at ×4 a Shrine is 0.03/s, a 40% cut.
- ~~**"Festival tooltip lists the renown reward."**~~ — **note 11, and it is the third round running
  in which a payout shipped without its tooltip.** Read from the constant.
- ~~**"Mount Targon banner — remove the SQUARE moon on the peak, KEEP the crescent."**~~ — **note
  12, as corrected by Jerry.** There were **two** pale objects and the first reading conflated them.
  The crescent is his own v0.58.1 note 37 and is untouched; the 8×4 filled rectangle above the
  summit is deleted and a golden halo drawn in its place, **at a different animation RATE from the
  light shaft so the two never lock.**
- ~~**"Crest of Cinders → red glow on the workshop anvil and hammer."**~~ — **follow-up, and it is
  asserted BY READING THE CANVAS**, not by grepping for the branch.
- ~~**"Crest of Insight → blue lights around the lore bookshelves and torches."**~~ — **follow-up.**
  Drawn in `drawLoreSprites()` so they are IN FRONT of the shelves, with positions derived from
  that function's own geometry. **The layer choice is stated rather than incidental.**
- ~~**"Jarvan's lead reaches all jobs at 6%; passive starts at 15%."**~~ — **follow-up, and the
  first half is a COVERAGE FIX.** The lead reached three of eight jobs — a knowledge or devotion
  settlement got nothing from Demacia's Standard. Now all eight, iterated from `JOBS`. The passive's
  description is **generated from the constant**, and the Academy parity row is re-rated to ×1.58
  in the same round the constant moved.
- ~~**"The knowledge requirement for discoveries should be higher... a healthy sink while the player
  ramps up their knowledge buildings."**~~ — **the dev note, and the measurement did not need the
  source.** RR's ten hand-authored knowledge costs have always run **0.70×–3.33×** their tech's
  rung; the generated rule sat at **0.10×**. Raised to **0.8 × K**, the low end of the file's own
  band. At most three knowledge Discoveries sit on any tech, so it is a sink and not a wall.

## v0.64 — Jerry's four dev notes, and the one that found a shipped effect doing nothing

- ~~**"Sump Ventilation improves Quarry, Quarry cannot be built yet. Let's change this to an ore
  production bonus."**~~ — **note 1, and the tech ladder confirms the premise exactly.** The
  Discovery sits on `sumpEcology` (60,000 knowledge + 30 plating); the Petricite Quarry, the only
  building it touched, sits on `petricite` (65,000 **+ 65 Morellonomicon**, a tier-5 craft). It
  improved a building the player could not yet build, so its **measured delivery to a real player
  was ZERO**. The same 5% now lands on `boosts.ore`, where it reaches every source of ore and —
  because ore is not a `BOOST_LIMIT` family — is **delivered in full**. The Petricite Quarry's own
  miner term returns to Kittens' 0.35 exactly, which it was not at before.
- ~~**the same note, SECOND INSTANCE — and nobody had reported this one.**~~ Landing a boost on
  `ore` required `ore` to be a KEY of the `boosts` object, and it was not. **The policy term is
  applied by `for (var pk in boosts)` — a loop over the keys the literal declares — so v0.63 Part
  3.2's re-scope of the Demacian Accord onto timber and ore had been shipping an effect that read
  as live code and reached nothing.** Measured on the v0.63 tag with the policy held: timber and
  ore both moved by exactly **+1.0%**, which is `catPolicy`'s generic government term, and **0.0%
  of the advertised 8.5%**. It is operational rule 11's sibling and it is quieter — nothing
  throws, nothing renders NaN, and the tooltip states a figure the engine never applies.
- ~~**"Banked Coals, Infernal Drake and other bonuses to converter output need review. What are we
  defining as a converter?"**~~ — **note 2, and the answer is a ruling rather than a list: A
  CONVERTER IS ANY BUILDING WITH A `convert` BLOCK. There is no second kind.** The conversion
  Discoveries, the overseer affinity and the Cinders buff reached only the non-`autoprod`
  converters, so Banked Coals raised the Forge, both Refineries and the Chem-Forgeworks and did
  **nothing** for the two buildings that make Zaun Ore and Coalgas — **the inputs the Shimmer
  Refinery it DOES boost runs on.** The split was an accident of shape: `autoprod` describes how a
  converter is DRIVEN, not whether it converts. v0.58.1 note 29 had already made this exact
  argument for the drake in the same function; it was applied to one term and the other three were
  left behind. **Measured: the Zaun extractors' converter multiplier goes ×2.951 → ×9.738, a
  ×3.30 move, and it is the largest single production change in the round.** The autoprod line
  stays exclusive to those three buildings and that asymmetry is correct — the Chembarrel drives
  them specifically, the way Kittens' Steamworks drives its Magnetos.
- ~~**"Sump Crawl should be on a cooldown of at least 7.5 minutes."**~~ — **note 3, and it was the
  only UNCOOLED source of a converted material in the game.** Every other route to Zaun Ore and
  Coalgas is a converter, rate-limited by building count, inputs and the autoprod line; this paid
  40–70 Zaun Ore + 20–35 Coalgas × `campYieldMult` for 140 vigor as fast as vigor arrived (v0.52
  measured **108.8 crawls a game-year at Deep Works**). `cooldown: 450`. **The parity ledger row
  already claimed "the constraint is the cooldown rather than the price" — there was no cooldown.
  The row is true now.** Per §32 this is a PRNG re-roll and is labelled as one.
- ~~**"Devotion comes too quickly still. Remove devotion/second from Marus Omegnum — make it just
  increase devotion cap by 250. Chapel .015/second. Shrine of Solari 50 devotion cap."**~~ —
  **note 4, all four figures directed and all four shipped exactly, and it is a ROLE separation
  rather than a magnitude cut.** The Marus's `prod` key is **removed**, not zeroed — a zero rate
  would still be enumerated and printed by `effectLines()`. The top of the faith curve is now a
  CEILING that produces nothing, so the reason to climb is capacity rather than compounding, and
  devotion is the one resource whose rate compounds into a global multiplier (worship →
  `catReligion`). **The Shrine's 0.0075/s is untouched — it is the one devotion figure at verified
  source parity (Kittens' temple `faithPerTickBase 0.0015` × 5).** The Chapel's 0.025 → 0.015 is a
  departure from the source's own chapel figure and is ledgered **RR-ORIGINAL / HARDER** rather
  than as a parity fix; §17 is the precedent that says an honest label costs nothing.

## v0.63 — Jerry's eleven notes, and the one that found four defects

- ~~**"Every workshop upgrade costs science in Kittens — confirm and match."**~~ — **note 1, and
  the confirmation is exact: 133 of Kittens' 143 priced workshop upgrades (93%) carry science, at
  a median 0.882x their unlocking tech's rung.** RR's 0.80 is at parity, so the divisor did NOT
  move. What moved is the DISTRIBUTION: `ritesOfTargon` carried 68,800 on a 12,000 rung — 5.73x,
  and 48% of the game's entire discovery knowledge. A per-rung cap at Kittens' own 2.43x cuts it
  58% and the whole-game total 34%, and leaves every compliant rung untouched.
- ~~**"Piltover Concord: craft +8%, crafting costs −3.5%."**~~ — **note 2.** The cut is on the
  PRICE, not a second yield term, and the tooltip states the resolved pair: **+11.9% output per
  unit of input**, because a player should not have to multiply two numbers off a tooltip.
- ~~**"Demacian Accord: timber and ore production +8.5%."**~~ — **note 3, and it is a SCOPE change
  as much as a magnitude one.** The old effect was a building-GROUP multiplier; this is
  resource-keyed and lands in the boosts accumulator. Neither timber nor ore is a `BOOST_LIMIT`
  family, so it is **delivered in full** — against four families that discard 14%-82% of theirs.
- ~~**"Noxian Doctrine: +33% hunt renown and +7.5% hunt yields."**~~ — **note 4.** Renown 1.5 ->
  1.33; the yield term is ADDITIVE into the existing camp category, because §31 forbids adding a
  multiplicative one until Jerry rules.
- ~~**"All philosophies cost 10k culture."**~~ — **note 5.** The material components stay; the
  note names culture only.
- ~~**"Jarvan's tooltips updated."**~~ — **note 6, and the lead had been WRONG FOR TWO ROUNDS.**
  It said "every worker in the village produces 12% more" against a shipped 0.06, and "in the
  village" described a three-job scope that had become all eight. Generated now — and the general
  guard that ships with it (no champion tooltip may carry a percentage no constant produces)
  immediately found Heimerdinger's inlined 0.85.
- ~~**"Targon banner is missing the golden halo."**~~ — **note 7, and NOTHING WAS ADDED.** The
  halo has rendered every frame since v0.62 at `outer: 9`, **centred on the peak's exact apex, in
  the peak's own colour**, inside a silhouette of half-width 15. A visibility bug, not a missing
  feature. Now saturated gold at outer 16, asserted from the rendered pixels.
- ~~**"Insight's blue lights should be more prominent."**~~ — **note 8.** 6 -> 9 motes at 2.25x
  scale, **total lit area x3.4**. Size and count before alpha: a 2px square at 30% alpha does not
  become prominent when you raise the alpha, it becomes a brighter smudge.
- ~~**"Cinders' red glow looks weird — floating red lights instead."**~~ — **note 9, and the two
  translucent RECTANGLES are deleted rather than dimmed.** The objection is to the shape and no
  alpha fixes a shape. Ten embers on per-ember phases, from the forge bed and the moving hammer.
- ~~**"Reduce the box random-event chance."**~~ — **note 10, and it turned out to be the most
  consequential change in the round for a reason nobody could have predicted.** The rate was
  linear and uncapped on a building whose copies are permanent; it is bounded now with the same
  `strictDR` the same building's MORALE term already used (20 boxes −45%, 40 boxes −68%). **But
  rate-limiting the chronicle line re-rolled every seeded run in the project** — one
  `Math.random()` call fewer per suppressed event, against a single global stream. See
  STANDING-RULINGS §32.
- ~~**"Steel in RR is the analogue of iron in Kittens."**~~ — **note 11, and it settles a figure
  v0.62 could not derive and got wrong.** Storehouse gains `steel 50` (barn `ironMax`), Warehouse
  100 -> 25 (x0.50, the same ratio the source's warehouse takes on coal and gold), Harbor
  unchanged at 150 — already exact parity. **v0.62 had put steel on the titanium row by guessing
  at its role; the note names the mapping and the ratio follows from it.**
- ~~**"The automated workshop tooltip shows NaN%."**~~ — **the dev note, and ONE REPORTED SYMPTOM
  FOUND FOUR DEFECTS.** It was a load-order bug (operational rule 11, third instance). The guard
  written for it — no generated string may contain NaN, undefined or Infinity — failed immediately
  on `pressureRegulators` ("burn NaN% less") and `rollingPress` ("prints undefined
  parchment/second"), and a companion guard on NUMBERS found `MANUFACTORY_FUEL` undefined inside
  the BUILDINGS literal, invisible because `computeRates()` rewrites that field every call.
