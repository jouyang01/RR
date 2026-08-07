// parity-ledger.mjs — v0.55 Part 1. Generates docs/PARITY-LEDGER.md.
//
// STANDING-RULINGS §16 makes the source the balance authority and requires every RR-original
// item to carry a parity label. A charter with no instrument is a preference; this is the
// instrument. It enumerates every TECHS, BUILDINGS, UPGRADES, JOBS and CRAFTS entry from the
// LIVE GAME rather than from a hand-kept list, so an entity added later cannot silently miss
// the ledger — `test-v55` asserts the same enumeration against the generated file.
//
// THE VERDICT MAP BELOW IS THE ONLY HAND-WRITTEN PART, and it is deliberately small. A row is
// PARITY / EASIER / HARDER only where a citation exists in this repo, in the v0.55 spec, or
// read from source this round. Everything else is UNVERIFIED, which §16 calls a legal verdict
// and an honest one. The UNVERIFIED count is this project's PARITY DEBT and every future round
// should shrink it. Do not upgrade a row without adding its citation here.
import { chromium } from "playwright";
import fs from "fs";

// ---------------------------------------------------------------------------------------
// THE VERDICT MAP. Keys are RR ids. `k` = Kittens counterpart (file and symbol) or RR-ORIGINAL.
// ---------------------------------------------------------------------------------------
const V = {
  // ---- TECHS. RR's ladder is a near-verbatim transliteration of Kittens' science costs
  // (v0.55 spec Part 2, js/science.js). Where the rung matches exactly the row is PARITY.
  almanac:      ["js/science.js calendar (30)", "PARITY", "30 = 30, exact rung match"],
  cultivation:  ["js/science.js agriculture (100)", "PARITY", "100 = 100, exact"],
  woodcraft:    ["js/science.js archery (300)", "PARITY", "300 = 300, exact"],
  mining:       ["js/science.js mining (500)", "PARITY", "500 = 500, exact; both unlock the mine"],
  logistics:    ["js/science.js animal (500)", "PARITY", "500 = 500; animal unlocks pasture + unicornPasture, RR's 500 rung now carries the Granary (Part 3.4)"],
  scriptorium:  ["js/science.js math (1000)", "UNVERIFIED", "RR 900 against math 1000; RR's Academy is math's role but the rung is one step light — 10% cheap, unmeasured"],
  // v0.57 Part 7.1, found while adding the summary-vs-rows guard: THIS ROW CONTRADICTED ITSELF.
  // The verdict read HARDER and the note read "i.e. EASIER" in the same string. A cheaper rung
  // is reached sooner, so it is EASIER for the player -- the note was right and the verdict was
  // a typo, and it is the identical class of defect as the "EASIER 32" prose error this Part
  // exists to fix: a hand-written label disagreeing with the thing beside it.
  carpentry:    ["js/science.js construction (1300)", "EASIER", "RR 1000 against construction's 1300 — RR's construction-role tech is 23% CHEAPER in rung, so it arrives sooner"],
  songcraft:    ["js/science.js construction (1300)", "UNVERIFIED", "RR 1300 matches construction's rung exactly, but carries Culture rather than the timber buildings — role mismatch, rung parity"],
  trade:        ["js/science.js currency (1200)", "UNVERIFIED", "rung 1200 matches; the trade mechanism itself is only partly ported"],
  smelting:     ["js/science.js engineering (1500)", "PARITY", "1500 = 1500; now also carries the Irrigation Channel, which is Kittens' aqueduct on engineering (Part 2.2)"],
  masquerade:   ["RR-ORIGINAL", "EASIER", "a free random-event faucet with no source counterpart; adds a box that yields resources"],
  yordle:       ["js/science.js construction-tier workshop line", "UNVERIFIED", "the Workshop building is ported; this tech's rung is not censused"],
  hextech:      ["RR-ORIGINAL", "UNVERIFIED", "crystals are RR's own resource; no Kittens counterpart to rank against"],
  abyss:        ["RR-ORIGINAL", "EASIER", "adds a poro drop to an existing hunt at no cost"],
  drakeLore:    ["RR-ORIGINAL", "EASIER", "opens the drake line, which §16 labels EASIER — see the drake rows"],
  petricite:    ["js/science.js archeology (65000)", "PARITY", "v0.55 Part 2.1: 9500 -> 65000 + morellonomicon 65, matching archeology's science 65000 + compedium 65, which is what unlocks quarry"],
  voidStudies:  ["RR-ORIGINAL", "UNVERIFIED", "Renown cap tech; Renown is RR-original"],
  ritesOfTargon:["js/science.js theology (~10000-12000)", "UNVERIFIED", "the Targon layer maps loosely to Kittens' religion; rung not censused"],
  // v0.58 Part 8.4: the worship CURVE and its threshold are both sourced now, so they leave
  // the debt column. The BAND that was hung on the curve was not, and v0.58 Part 2 withdrew it.
  voidStudies:  ["RR-ORIGINAL", "UNVERIFIED", "Era 1 capstone; no counterpart rung censused"],
  callToArms:   ["RR-ORIGINAL", "EASIER", "opens CHAMPIONS, which have no source counterpart at all"],
  sparks:       ["RR-ORIGINAL", "HARDER", "the ONLY Era gate in the game — requires a recruited Piltover/Zaun champion (STANDING-RULINGS §4). Kittens gates no Era on a choice"],
  chemtech:     ["js/science.js chemistry (60000)", "PARITY", "60000 = 60000, exact rung match"],
  hexcore:      ["js/science.js electricity (75000)", "PARITY", "75000 = 75000, exact"],
  deepWorks:    ["js/science.js industrialization (100000)", "PARITY", "100000 = 100000, exact"],
  icathia:      ["RR-ORIGINAL", "UNVERIFIED", "135000 sits above Kittens' mechanization 115000; the Era it opens has no counterpart"],
  championsRegimen: ["RR-ORIGINAL", "EASIER", "champion infrastructure; no counterpart"],
  deepCartography:  ["RR-ORIGINAL", "UNVERIFIED", "branch tech, rung 35000, no counterpart censused"],
  hexdraulics:  ["RR-ORIGINAL", "UNVERIFIED", "branch tech at 50000"],
  sumpEcology:  ["RR-ORIGINAL", "UNVERIFIED", "branch tech at 55000"],
  progressDay:  ["RR-ORIGINAL", "UNVERIFIED", "branch tech at 60000"],
  chemBaronAccords: ["RR-ORIGINAL", "UNVERIFIED", "branch tech at 65000"],
  gloriousEvolution:["RR-ORIGINAL", "UNVERIFIED", "branch tech at 85000"],
  atlasGauntlets:   ["RR-ORIGINAL", "UNVERIFIED", "branch tech at 90000"],
  hexgate:      ["RR-ORIGINAL", "UNVERIFIED", "branch tech at 115000; rung ties Kittens' mechanization"],
  greyReclamation:  ["RR-ORIGINAL", "UNVERIFIED", "branch tech at 115000"],
  voidglassOptics:  ["RR-ORIGINAL", "UNVERIFIED", "branch tech at 125000"],
  watchersBelow:["RR-ORIGINAL", "UNVERIFIED", "Freljord capstone at 125000"],
  kindling:     ["RR-ORIGINAL", "UNVERIFIED", "branch tech at 50000, opens one upgrade"],

  // ---- BUILDINGS
  manaWell:     ["RR-ORIGINAL", "EASIER", "mana is RR's own starter faucet; Kittens' opening resource is gathered by clicking catnip"],
  farmstead:    ["js/buildings.js field (catnip 10, ratio 1.12, catnipPerTickBase 0.125)", "PARITY", "v0.55 Part 3.3: 0.14/s -> 0.625/s, which is 0.125/tick x 5. Was 2.24x the source at RR's own tenth-scale"],
  irrigation:   ["js/buildings.js aqueduct (minerals 75, ratio 1.12, catnipRatio 0.03)", "PARITY", "cost, ratio and figure already exact; v0.55 Part 2.2 moves it from mining (500) to smelting (1500), which is engineering's rung"],
  lumberMill:   ["js/buildings.js lumberMill", "UNVERIFIED", "ported by name and role; cost not censused against source"],
  mine:         ["js/buildings.js mine (wood 100)", "PARITY", "v0.46 Part 1: RR's cost is Kittens' verbatim, timber 100 and nothing else"],
  quarry:       ["js/buildings.js quarry (slab 1000 + steel 125 + scaffold 50, ratio 1.15, mineralsRatio 0.35)", "PARITY", "STANDING-RULINGS §5 pins the cost and the id; v0.55 Part 2.1 fixes the only remaining gap, its unlock rung"],
  shelter:      ["js/buildings.js hut (ratio 2.5, manpowerMax 75)", "UNVERIFIED", "manpowerMax 75 is exact (v0.47 Part 3); RR's ratio 2.20 against the hut's 2.50 is not censused"],
  longhouse:    ["js/buildings.js logHouse (manpowerMax 50)", "PARITY", "manpowerMax 50 exact; unlocked by carpentry, which is RR's construction (v0.52 Part 2.2)"],
  bardsHearth:  ["js/buildings.js amphitheatre (culturePerTickBase, unhappinessRatio)", "EASIER", "carries BOTH source effects from one building, correctly — but its `audience` term (1 + 0.05 x pop) is RR-ORIGINAL and has no source counterpart (STANDING-RULINGS §12)"],
  poroPasture:  ["js/buildings.js unicornPasture (unicorns 2, ratio 1.75, catnipDemandRatio -0.0015, unicornsPerTickBase 0.001)", "EASIER", "v0.54 fixed production to 0.005/s (exact). v0.55 Part 5 fixes ratio 1.15 -> 1.75. eatCut 0.003 remains 2x the source's 0.0015 per copy, but RR's runs through limitedDR where the source is unbounded — measured, not matched"],
  granary:      ["js/buildings.js pasture (catnip 100 + wood 10, ratio 1.15, catnipDemandRatio -0.005)", "PARITY", "v0.55 Part 3.4: Kittens has TWO pastures on `animal` and RR had ported only one. Cost, ratio and figure are the source's verbatim"],
  skyrise:      ["js/buildings.js mansion (manpowerMax 50)", "UNVERIFIED", "manpowerMax matches; cost not censused"],
  storehouse:   ["js/buildings.js barn (wood 50, ratio 1.75)", "PARITY", "v0.47 Part 4.4: cost and ratio are the barn's verbatim; gold 10 is the barn's own gold term"],
  warehouse:    ["js/buildings.js warehouse", "UNVERIFIED", "ported by role from construction; cost not censused"],
  harbor:       ["js/buildings.js harbour", "UNVERIFIED", "ported by role; cost not censused"],
  archive:      ["js/buildings.js library (scienceRatio 0.1)", "PARITY", "0.10 exact — the first rung of the science stack that measures x20.8000 at Kittens' own end-of-tree counts"],
  academy:      ["js/buildings.js academy (scienceRatio 0.2)", "PARITY", "0.20 exact"],
  observatory:  ["js/buildings.js observatory (iron 750 + science 1000 + slab 35 + scaffold 50, scienceRatio 0.25)", "PARITY", "0.25 exact; cost transliterated in v0.46 Part 1"],
  hexLab:       ["js/buildings.js biolab (science 1500 + slab 100 + plastic 15 + alloy 25, scienceRatio 0.35)", "PARITY", "0.35 exact; cost transliterated in v0.46 Part 1 with plating for plastic"],
  forge:        ["js/buildings.js smelter", "UNVERIFIED", "converter role matches; rates not censused"],
  tradeDock:    ["js/buildings.js tradepost (tradeRatio)", "UNVERIFIED", "tradeRatio role matches; RR's 0.02/copy not censused against the source's figure"],
  refinery:     ["RR-ORIGINAL", "UNVERIFIED", "crystals are RR-original"],
  workshop:     ["js/buildings.js workshop (craftRatio)", "UNVERIFIED", "craft-yield role matches; RR's 0.06/copy not censused"],
  hunterLodge:  ["RR-ORIGINAL", "EASIER", "DELETED in v0.55 Part 4. A repeatable building granting camp yield where Kittens' entire hunt-yield stack is one-off workshop upgrades — unbounded in a count the player controls"],
  trainingGround:["RR-ORIGINAL", "UNVERIFIED", "vigor storage and boost; manpower has no building counterpart in the source"],
  sumpMine:     ["js/buildings.js smelter/calciner autoprod tier", "UNVERIFIED", "STANDING-RULINGS §7 rules the autoprod pattern correct; the rates are not censused"],
  coalgasVent:  ["js/buildings.js calciner tier", "UNVERIFIED", "as sumpMine"],
  hexQuarry:    ["js/buildings.js calciner tier", "UNVERIFIED", "as sumpMine"],
  chembarrel:   ["RR-ORIGINAL", "UNVERIFIED", "amplifies the three Zaun extractors; bounded by AUTOPROD_LIMIT"],
  hextechFoundry:["js/buildings.js magneto (productionRatio)", "UNVERIFIED", "the amplifier half of Kittens' magneto x steamworks pairing; v0.49 Part 1.7 set the category to exactly two members"],
  hexdraulicPlant:["js/buildings.js steamworks", "UNVERIFIED", "amplifies the Foundry, which is the source's own pairing"],
  arcaneReactor:["js/buildings.js reactor (productionRatio 0.05)", "PARITY", "0.05 is Kittens' productionRatio exactly (v0.49 Part 1.7); the price separation from its amplifier is x52 against the source's x181 — EASIER on price, PARITY on effect"],
  piltoverSpire:["RR-ORIGINAL", "UNVERIFIED", "culture producer and ceiling; carries a v0.53 crystal component"],
  vault:        ["RR-ORIGINAL", "UNVERIFIED", "Era 3 storage; carries a v0.53 crystal component"],
  augmentChamber:["RR-ORIGINAL", "EASIER", "jobBoost.tinkerer 0.40 unbounded — x7.4 on a job whose measured worker count is 1 at every milestone ever measured"],
  hexgateBuilding:["RR-ORIGINAL", "UNVERIFIED", "trade boost and crystal ceiling"],
  wardOfWatchers:["RR-ORIGINAL", "UNVERIFIED", "Freljord/Void bridge building"],
  watchersEye:  ["js/religion.js ziggurat (the sacrifice carrier)", "UNVERIFIED", "carries the poro sacrifice, which is the ziggurat's unicorn-tears role"],
  frostguardCairn:["js/religion.js unicornTomb (unicornsRatioReligion 0.05, ratio 1.15)", "PARITY", "STANDING-RULINGS §11: rank-for-rank, RR 0.08 against 0.05, four rungs against six, 23% of the source's full stack"],
  avarosanHold: ["js/religion.js ivoryTower (0.10, ratio 1.15)", "PARITY", "as frostguardCairn"],
  iceWroughtSpire:["js/religion.js ivoryCitadel (0.25, ratio 1.15)", "PARITY", "as frostguardCairn"],
  frozenWatcher:["js/religion.js skyPalace (0.50, ratio 1.15)", "PARITY", "as frostguardCairn; RR runs ratio 1.25 on this rung against the source's 1.15"],
  shimmerRefinery:["RR-ORIGINAL", "UNVERIFIED", "shimmer is RR-original; recost by measurement in v0.52 Part 3.2"],
  hexcreteBastion:["RR-ORIGINAL", "UNVERIFIED", "Era 3 deep storage"],
  // ---- v0.58.1 NOTE 48 — the Manufactory and its three discoveries ----
  manufactory:  ["js/buildings.js factory (the INERT-until-upgraded building; RR has never had one)", "PARITY", "v0.58.1 note 48. SHAPE is Kittens' Factory exactly: a building that does nothing on purchase and becomes whatever its workshop upgrades make it. The CONTENT is RR-original — Kittens' factory boosts craft ratios, this one burns Hextech Crystals as fuel and takes three discoveries — so the shape is parity and the content is a design. The fuel is a genuine constraint rather than flavour: the converter loop refuses to run any building whose inputs are short, so an unfuelled Manufactory is idle and stops drawing crystals"],
  pressureRegulators:["RR-ORIGINAL", "EASIER", "v0.58.1 note 48.2A. Halves the Manufactory's crystal draw. EASIER because it makes an existing building cheaper to run and Kittens has no counterpart discovery"],
  rollingPress: ["RR-ORIGINAL", "EASIER", "v0.58.1 note 48.2B. 0.005 parchment/s per Manufactory — Jerry's figure verbatim. EASIER: it is the first continuous producer of a `made` good in the game, and hand-crafting was previously the only route"],
  automatedWorkshop:["RR-ORIGINAL", "EASIER", "v0.58.1 note 48.2C. One beam, slab, gear and iron plating per Manufactory per game-year, output only — the building is already paying continuously in crystals. EASIER for the same reason as the Rolling Press. NOTE: first priced in hexgear, which auditCostGraph() rejected because hexgear is gated 25,000 knowledge LATER than this discovery; scaffold replaces it"],
  chemForgeworks:["js/buildings.js the converter family (calciner / steamworks: raw + mana in, refined out, repeatable at priceRatio 1.15)", "PARITY", "v0.58 Part 7.2. SHAPE is the source's converter exactly — repeatable, ratio 1.15, raw + mana in, refined good out. The CONTENT is RR-original because shimmer and hexgear are: it exists because §24's classification found shimmer had NO continuous consumer at all (held 100% of ceiling, consumed 0/s, 10 lumpy sinks), and Void Essence had no sink either because Riftsteel (hexgear 375) was unreachable. One converter closes both. Sized at 0.05 shimmer/s in and 0.005 hexgear/s out per copy so P/C lands near 2 at the Refinery family's own scale"],
  riftAnchor:   ["js/space.js orbitalArray (eludium 100, ratio 1.15)", "UNVERIFIED", "v0.53 Part 4.3 rank-matches the repeatability and the ratio but NOT the quantity; and it has never been built in a measured run"],
  hallOfHeroes: ["RR-ORIGINAL", "EASIER", "Renown storage; Renown has no source counterpart"],
  // ---- v0.58 PART 8.4 — THE TARGON AND WORSHIP BLOCK, taken this round. Part 2 read the
  //      source for this subsystem anyway, which is the spec's own reason for choosing it:
  //      take the rows where the citations are freshest, not the rows that are easiest.
  trainingGround:["RR-ORIGINAL", "HARDER", "v0.58.1 note 30 REMOVES its renown ceiling; it holds vigor and boosts vigor and nothing else now. HARDER: the settlement lost a renown store it used to have, and the Hall of Heroes is the only one left"],
  shrine:       ["js/buildings.js temple (faithPerTickBase 0.0015)", "PARITY", "v0.47 Part 2: 0.0075/s = 0.0015/tick x 5, exact"],
  chapel:       ["js/buildings.js chapel", "PARITY", "v0.58 Part 2. The middle producer tier RR was missing entirely: Kittens' faith curve is temple -> CHAPEL -> higher tiers, and RR jumped from Shrine to Sanctum. Production is rank-matched at 0.025 devotion/s. The PRICE is deliberately NOT literal — Kittens' chapel wants 250 manuscripts and an RR parchment costs 175 furs, so a literal port is 43,750 furs and the building measured ZERO copies at every milestone. Rank-matched to RR's own faith curve at ore 600 / culture 120 / parchment 12, keeping the source's price SHAPE. Measured: Convergence at Sparks 1.42% -> 5.2%, a 3.7x move, so it is built and it is load-bearing"],
  sanctum:      ["RR-ORIGINAL", "UNVERIFIED", "devotion boost carrier, bounded by BOOST_LIMIT"],
  marus:        ["RR-ORIGINAL", "UNVERIFIED", "devotion producer at scale"],

  // ---- JOBS. Kittens' rates are per tick at 5 ticks/s (js/village.js `jobs`).
  farmer:       ["js/village.js farmer (catnip 1/tick = 5.000/s)", "PARITY", "v0.55 Part 3.3: 0.5/s -> 5.000/s, exact. NOTE the season term is an RR divergence — see the SEASONAL FARMERS row"],
  woodcutter:   ["js/village.js woodcutter (wood 0.018/tick = 0.09/s)", "PARITY", "v0.45 Part 4, exact"],
  miner:        ["js/village.js miner (minerals 0.05/tick = 0.25/s)", "PARITY", "v0.45 Part 4, exact"],
  loremaster:   ["js/village.js scholar (science 0.035/tick = 0.175/s)", "PARITY", "v0.45 Part 4, exact"],
  jungler:      ["js/village.js hunter (manpower 0.06/tick = 0.30/s)", "PARITY", "vigor output exact. v0.55 Part 4 DELETES its RR-original +5%/jungler camp-yield term, which was EASIER and unbounded in a count the player controls"],
  arcanist:     ["RR-ORIGINAL", "UNVERIFIED", "mana has no source counterpart as a job output"],
  acolyte:      ["js/village.js priest (faith)", "UNVERIFIED", "role matches; rate not censused. v0.58 Part 2 measured what the role COSTS rather than what it pays: adding the Chapel pulled labour into this job and vigor income fell ~23%, which was enough to stop the scouting party discovering a trade route inside 450 game-years. The rate is still uncited; its opportunity cost is now measured"],
  tinkerer:     ["RR-ORIGINAL", "UNVERIFIED", "crystals are RR-original"],

  // ---- CRAFTS
  parchment:    ["js/workshop.js parchment (furs 175)", "PARITY", "v0.41 §2.4: exact"],
  tome:         ["js/workshop.js manuscript", "UNVERIFIED", "RR's tome costs 50 parchment against the manuscript's 25; deliberately rescaled"],
  morellonomicon:["js/workshop.js compedium (science 9000 + manuscript 55)", "PARITY", "9000 knowledge verbatim; 30 tomes rather than 55 manuscripts because an RR tome is 2x a manuscript"],
  gear:         ["js/workshop.js gear (steel 15, tier 3, handicap 5)", "UNVERIFIED", "RR charges steel 25 against the source's 15"],
  stoneSlab:    ["js/workshop.js slab (minerals 250)", "UNVERIFIED", "RR charges ore 200 against the source's 250"],
  beam:         ["js/workshop.js beam (wood 175)", "UNVERIFIED", "RR charges timber 150"],
  scaffold:     ["js/workshop.js scaffold (beam 50)", "UNVERIFIED", "RR charges beam 40"],
  plating:      ["js/workshop.js plate (iron 125)", "UNVERIFIED", "RR's zaunore 100 is a different raw"],
  alloy:        ["js/workshop.js alloy (titanium 10 + steel 75, tier 4, handicap 7)", "UNVERIFIED", "RR's raws differ; the tier position matches"],
  hexgear:      ["js/workshop.js gear tier above alloy", "UNVERIFIED", "the tier-4 craft above Alloy; quantities are RR's"],
  hexSlab:      ["RR-ORIGINAL", "UNVERIFIED", "hexcrystal chain"],
  petriciteBlock:["RR-ORIGINAL", "UNVERIFIED", "Demacian stone; carries a crystal cost"],
  hexcore:      ["RR-ORIGINAL", "UNVERIFIED", "the three-chain convergence craft"],
  hexcrete:     ["js/workshop.js concrate (slab 2500 + steel 25, tier 4, handicap 9)", "UNVERIFIED", "role matches; quantities are RR's"],
  focusedHex:   ["RR-ORIGINAL", "UNVERIFIED", "hexcrystal refinement"],
  voidglass:    ["RR-ORIGINAL", "UNVERIFIED", "Void chain"],
  chronoshard:  ["RR-ORIGINAL", "UNVERIFIED", "Void chain"],
  frostMegalith:["RR-ORIGINAL", "UNVERIFIED", "Freljord capstone material"],
  poroTears:    ["js/religion.js unicorn tears (ziggurat sacrifice)", "PARITY", "one Tear per Watcher's Eye is the ziggurat gainMultiplier shape"],
  runeShard:    ["RR-ORIGINAL", "UNVERIFIED", "the World Rune tail"],
  riftsteel:    ["js/workshop.js eludium (unobtainium 1000 + alloy 2500, tier 5, handicap 300)", "UNVERIFIED", "v0.53 Part 4 preserves the 2.5:1 ratio exactly; the absolute scale is RR's and the craft has NEVER been forged in a measured run"],
};

// Upgrades: the lines that have been censused get rows; the rest are honestly UNVERIFIED.
const UPGRADE_V = {
  sharpenedAxes: ["js/workshop.js woodJobRatio line", "PARITY", "six rungs summing 3.20, censused v0.45 Part 2 E2"],
  ironAxes:      ["js/workshop.js woodJobRatio line", "PARITY", "as sharpenedAxes"],
  steelAxes:     ["js/workshop.js woodJobRatio line", "PARITY", "as sharpenedAxes"],
  hexsteelAxes:  ["js/workshop.js woodJobRatio line", "PARITY", "as sharpenedAxes"],
  atlasAxes:     ["js/workshop.js woodJobRatio line", "PARITY", "as sharpenedAxes"],
  voidsteelAxes: ["js/workshop.js woodJobRatio line", "PARITY", "as sharpenedAxes"],
  reinforcedSaw: ["js/workshop.js lumberMillRatio line", "PARITY", "five rungs summing 0.95, censused v0.45 Part 2 E3"],
  steelSaw:      ["js/workshop.js lumberMillRatio line", "PARITY", "as reinforcedSaw"],
  hexsteelSaw:   ["js/workshop.js lumberMillRatio line", "PARITY", "as reinforcedSaw"],
  atlasSaw:      ["js/workshop.js lumberMillRatio line", "PARITY", "as reinforcedSaw"],
  voidsteelSaw:  ["js/workshop.js lumberMillRatio line", "PARITY", "as reinforcedSaw"],
  trappersCraft: ["js/workshop.js hunterRatio (bolas 1.0)", "PARITY", "v0.55 Part 4 re-ranks the chain to the source's seven-member Sigma 5.10"],
  beastLore:     ["js/workshop.js hunterRatio (huntingArmor 2.0)", "PARITY", "as trappersCraft"],
  masterOfTheHunt:["js/workshop.js hunterRatio (steelArmor + alloyArmor)", "PARITY", "as trappersCraft"],
  atlasGauntletsUp:["js/workshop.js hunterRatio (nanosuits 0.5)", "PARITY", "as trappersCraft"],
  jessedHawks:   ["js/workshop.js hunterRatio (griffinRelationsScouts 0.5)", "PARITY", "as trappersCraft"],
  trueIceCellars:["js/buildings.js catnipDemandRatio line", "UNVERIFIED", "eat reduction; v0.54 directive 1 removed its crystal cost"],
  celestialCharts:["RR-ORIGINAL", "EASIER", "a settlement-wide production bonus; collapsed into catMeta in v0.50 Part 1.4"],
  resonanceCoils:["RR-ORIGINAL", "UNVERIFIED", "v0.54 directive 16; crystals are RR-original"],
  arcaneFocus:   ["js/workshop.js catnipJobRatio rung 1 (mineralHoes 0.50)", "PARITY", "**v0.59 Part 8 note 6.** RR's mana JOB line is Kittens' catnip job line: `catnipJobRatio` is fed by TWO rungs, mineralHoes 0.50 and ironHoes 0.30, additive to x1.80. Arcane Focus is the first rung at exactly +50%. It also adds +4 to the manual channel, which is RR-original and is the EASIER part of the row; the job half is exact"],
  leylineCalibration: ["js/workshop.js catnipJobRatio rung 2 (ironHoes 0.30)", "PARITY", "**v0.59 Part 8 note 6 (Jerry): 'one more mana-production Discovery.'** Rung-matched rather than sized by feel: RR's Arcanist line had ONE rung against the source's TWO, so this is the missing rung at the SOURCE'S OWN SECOND FIGURE, +30%, additive, landing the line at Kittens' x1.80 exactly. Priced at the Sparks band (hexsteelSaw beam 50 + gear 25; seasonedTimberworks beam 60 + gear 30) with the line's own currency in the second term. `auditCostGraph()` clean"],
  cataloguing:   ["js/workshop.js:1450 titaniumMirrors — libraryRatio 0.02", "PARITY", "**v0.59 Part 5.4.** Was UNVERIFIED against a vague 'compendium/storage line'. It is Kittens' REFLECTORS family: three upgrades at `libraryRatio 0.02` each, consumed at js/buildings.js:579-580 as `library.scienceMax *= (1 + observatory.on * libraryRatio)`. RR's Archive IS the Library (250 cap / 0.10 boost against library 250 / 0.1) and its Observatory IS the Observatory, so the port is one-for-one. Sigma 0.06 is Kittens' figure taken, not tuned"],
  crossReferencing:["js/workshop.js:1467 unobtainiumReflectors — libraryRatio 0.02", "PARITY", "**v0.59 Part 5.4.** Reflectors rung 2, +0.02 to `archiveRatio`. Additive within the family, multiplicative between categories — Kittens' Law"],
  greatIndex:    ["js/workshop.js:1483 eludiumReflectors — libraryRatio 0.02", "PARITY", "**v0.59 Part 5.4.** Reflectors rung 3, +0.02 to `archiveRatio`, completing Kittens' Sigma 0.06. At ten Observatories the Archive's own knowledge slice runs x1.60"],
  annotatedIndex:["js/workshop.js:1436-1448 astrolabe → js/buildings.js:672", "PARITY", "**v0.59 Part 5.4.** Kittens' Astrolabe carries `effects: {}` and its whole effect lives in the Observatory's own calculateEffects: `scienceMax = ratio * (astrolabe ? 1500 : 1000)` — +50% on ONE BUILDING's own contribution. Ported onto RR's Academy, per copy, at exactly +50%"],
  livingLibrary: ["js/workshop.js:1436-1448 astrolabe → js/buildings.js:672", "PARITY", "**v0.59 Part 5.4.** The same Astrolabe shape aimed at the Hexcore Laboratory (RR's biolab), +50% per copy. **The Sigma of this whole line is now knowledge, per building, and NEVER a whole-cap multiplier** — Kittens has exactly one whole-cap science multiplier in the entire game and it is the `technocracy` POLICY (js/science.js:1067-1080, x1.20 for 150,000 culture and the loss of two policy branches), not an upgrade"],
  slabCutting:   ["js/workshop.js the slab line", "UNVERIFIED", "opens the stone slab craft"],
  ironPlows:     ["js/workshop.js the catnip tool line", "UNVERIFIED", "hoe line; rungs not censused"],
  pastureRotation:["js/workshop.js unicorn husbandry", "UNVERIFIED", "adds 0.5 to poroRatio, which STANDING-RULINGS §11 rules unbounded and at parity"],
};

// ============================================================================
// v0.56 PART 7.6 — THE CHAMPION AND LEADER BLOCK.
//
// Kittens has NO champions, NO leader slot, NO permanent per-hero production multiplier and no
// Renown. There is one structural analogue and it is worth naming precisely so the rows below
// are not read as arbitrary: Kittens' `leader` kitten carries a single trait bonus through
// `getLeaderBonus()`, and its magnitude is a few per cent. RR's leader carries a NAMED, often
// mechanic-altering clause. Every row here is therefore RR-ORIGINAL, and under §16's null
// hypothesis an RR-original row is a suspected speed-up until measured — so the default
// verdict for this block is EASIER, and a row only escapes it when the clause is bounded or
// when it costs the player something.
const CHAMP_V = {
  poppy:    ["none — Kittens has no champions", "EASIER", "permanent passive plus a leader clause; the lead was rescoped to material caps only in v0.45 Part 8.1, which is the only thing keeping it bounded"],
  leona:    ["none", "EASIER", "harvest passive; the LEAD is the round's Part 3 and is now bounded rather than nullifying (see the -lead row)"],
  caitlyn:  ["none", "EASIER", "reworked v0.54 directive 11; the two lead clauses COMPOUND — the tier discount raises the `over` term the slot ladder is computed from, so +10 points of slot chance reads as +25 at five caravans. Largest untested number v0.54 shipped and still untested"],
  swain:    ["none — Kittens has no champions", "EASIER", "**v0.59 Part 8 note 5 (Jerry): 'Swain's lead duplicates his passive; his passive becomes a mana-production percentage.'** His passive was knowledge +12% and note 20 had already moved his LEAD onto knowledge production — so the leader slot bought a bigger number rather than a different decision, which is the Twitch defect of v0.54 in a new costume. The passive is now MANA +12%; the lead stays knowledge +25%. Still EASIER (a permanent production multiplier the source has no analogue for), but the two are now distinct subjects and asserted so"],
  bard:     ["none", "EASIER", "culture +20% permanently"],
  twitch:   ["none", "EASIER", "reworked v0.54 directive 11 after the lead was found to do nothing; a leader slot that does nothing is its own defect"],
  zilean:   ["none", "EASIER", "camp respawn; interacts with CHARGE_REGEN_S, which is itself RR-original"],
  jarvan:   ["none", "EASIER", "arrival timer 20 s -> 12 s while leading — a 40% cut to the settlement's growth clock"],
  shaco:    ["none", "EASIER", "30% of expeditions refund their vigor while leading; a probabilistic discount on the game's main sink"],
  ekko:     ["none", "UNVERIFIED", "no citation on file and no measurement taken this round"]
};
const LEAD_V = {
  "leona-lead":   ["none — no source counterpart of any kind", "EASIER", "**BOUNDED IN v0.56 PART 3.** It previously FLOORED farmMult at 1 and therefore deleted seasonality outright, and v0.55 silently widened it from buildings to buildings + jobs. It now halves the shortfall below 1.0 (Deepwinter x0.25 -> x0.625) and never lifts a season above 1"],
  "poppy-lead":   ["none", "EASIER", "material storage caps +8%; rescoped v0.45 Part 8.1 so Knowledge, the Scholarship lines, Renown and Vigor are excluded"],
  "caitlyn-lead": ["none", "EASIER", "two clauses that compound; see the champion row"],
  "swain-lead":   ["none", "EASIER", "knowledge production +25% (v0.58.1 note 20 replaced a toggleable -20% purchase discount, which was abusable by construction: any lead that discounts a ONE-TIME purchase can be switched on for the instant of the purchase). v0.59 Part 8 note 5 leaves the lead alone and moves the PASSIVE off knowledge instead — see the champion row"],
  "bard-lead":    ["none", "UNVERIFIED", "not measured this round"],
  "twitch-lead":  ["none", "EASIER", "cargo slots"],
  "zilean-lead":  ["none — Kittens' Tempus Fugit banks time but has no leader slot", "EASIER", "**v0.59 Part 8 note 3 (Jerry): 'a BUTTON for Zilean to spend banked time, not an automatic trigger at 5m.'** The duty cycle banked at 0.25 s/s to a five-minute ceiling and then AUTOMATICALLY flipped to spending at x1.5. The automatic flip is DELETED and the player spends on a button, whenever they choose. **This is a small BUFF as well as an agency win** — spending the +50% while a long craft or build queue runs is strictly better than spending it at whatever moment the meter happened to fill — so it is labelled EASIER on that basis rather than as a neutral UI change. The five-minute ceiling still truncates, so the pressure to spend is unchanged"],
  "jarvan-lead":  ["none", "EASIER", "arrival interval 20 s -> 12 s"],
  "shaco-lead":   ["none", "EASIER", "30% vigor refund on expeditions"],
  "ekko-lead":    ["none", "UNVERIFIED", "not measured this round"]
};
// ============================================================================
// v0.57 PART 7.2.5 — THE WILDS AND EXPEDITION BLOCK, taken this round.
//
// Twelve rows off the 127-row UNVERIFIED backlog. Kittens has NO expedition system: there is no
// vigor, no camp, no cooldown, no drake and no Baron. What it has, and what these rows are
// measured against, is `js/village.js`'s HUNT -- a manpower-priced action that returns furs and
// ivory through `getHuntResult()`, with `hunterRatio` (the seven workshop upgrades censused in
// v0.55 Part 4) as its only multiplier. RR's four resource camps ARE that hunt, ported with a
// charge system on top; everything beyond them is RR-original.
//
// The default verdict for an RR-original expedition is EASIER, per §16's null hypothesis, and a
// row escapes it only where the action is bounded or costs something the source's hunt does not.
const EXPEDITION_V = {
  wolves:         ["js/village.js huntAll -> getHuntResult(), furs", "PARITY", "IN SHAPE: RR's resource camps ARE Kittens' hunt: a manpower/vigor-priced action returning furs, scaled by hunterRatio/campYieldMult at the SOURCE's Sigma 5.10 since v0.55 Part 4. The 100-vigor price is RR-original but the yield-per-cost band was matched in v0.40"],
  gromp:          ["js/village.js getHuntResult()", "PARITY", "IN SHAPE: as wolves; mushrooms stand in for a second hunt drop"],
  raptors:        ["js/village.js getHuntResult()", "PARITY", "IN SHAPE: as wolves; plumes, plus a Rift Scuttler roll that is RR-original and small"],
  krugs:          ["js/village.js getHuntResult()", "PARITY", "IN SHAPE: as wolves; the one MATERIAL camp, so it takes CAMP_YIELD_LIMIT rather than the comfort ceiling"],
  sumpCrawl:      ["none — Kittens has no Era-3 expedition", "EASIER", "RR-original. A repeatable zaunore source priced only in vigor, and vigor measures 0% time-at-cap, so the constraint is the cooldown rather than the price"],
  blueSentinel:   ["none", "EASIER", "RR-original. Mana, repeatable, vigor-only"],
  redBrambleback: ["none", "EASIER", "RR-original. The twin of blueSentinel"],
  abyssJourney:   ["none", "EASIER", "RR-original, and the FIRST expedition that costs a stored resource (provisions 500) rather than pure vigor — which is what keeps it bounded"],
  scouting:       ["none — Kittens has no trade discovery", "EASIER", "RR-original. Flat 500 vigor since v0.54 directive 3; the escalator was deleted because it walled off content the Trade tab had already advertised"],
  drakeHunt:      ["none", "EASIER", "RR-original, and the entrance to the drakes — themselves EASIER and re-curved in v0.55 Part 6. Costs steel and 4,000 provisions, so the food economy gates it"],
  voidExpedition: ["none", "EASIER", "RR-original. focusedHex 2 + provisions 2,000 makes it the most crafted-input-gated expedition in the game"],
  baron:          ["none", "EASIER", "RR-original. The largest single sink in the Wilds — 1,200 vigor, 100 steel, 20,000 provisions, 200 knowledge — and the only one priced in four resources at once"]
};
const browser = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium" }).catch(() => chromium.launch());
const page = await browser.newPage();
await page.goto(new URL("../index.html", import.meta.url).href);
await page.waitForTimeout(600);
const inv = await page.evaluate(() => ({
  version: typeof VERSION !== "undefined" ? VERSION : "?",
  TECHS: TECHS.map(t => ({ id: t.id, name: t.name, scale: "knowledge " + (t.cost.knowledge || 0), rung: t.cost.knowledge || 0 })),
  BUILDINGS: BUILDINGS.map(b => ({ id: b.id, name: b.name,
    scale: "ratio " + b.ratio + " · " + JSON.stringify(b.cost), rung: b.tech || "—" })),
  UPGRADES: UPGRADES.map(u => ({ id: u.id, name: u.name, scale: JSON.stringify(u.cost), rung: u.tech || "—" })),
  JOBS: JOBS.map(j => ({ id: j.id, name: j.name, scale: JSON.stringify(j.prod || {}), rung: j.tech || "—" })),
  CRAFTS: CRAFTS.map(c => ({ id: c.id, name: c.name, scale: JSON.stringify(c.cost), rung: c.out })),
  // v0.57 Part 7.2.5: the Wilds block joins the enumeration, so an expedition added later
  // cannot miss the ledger any more than a building can.
  EXPEDITIONS: EXPEDITIONS.map(e => ({ id: e.id, name: e.name,
    scale: JSON.stringify(e.cost), rung: (e.tab || "wilds") + " · " + (e.tech || "—") })),
  // v0.56 Part 7.6: the champion and leader block is taken this round. It is the largest
  // unlabelled RR-original system in the game -- ten permanent multipliers plus a leader slot,
  // none of which Kittens has in any form -- and Part 3 opens it anyway.
  CHAMPIONS: CHAMPS.map(c => ({ id: c.id, name: c.name,
    scale: (c.passive ? c.passive.desc : "—"), rung: JSON.stringify(c.cost) })),
  LEADS: CHAMPS.map(c => ({ id: c.id + "-lead", name: c.name + " (lead)",
    scale: c.lead || "—", rung: "leader slot" }))
}));
await browser.close();

const KINDS = ["TECHS", "BUILDINGS", "UPGRADES", "JOBS", "CRAFTS", "EXPEDITIONS", "CHAMPIONS", "LEADS"];
const counts = { PARITY: 0, EASIER: 0, HARDER: 0, UNVERIFIED: 0 };
const esc = s => String(s).replace(/\|/g, "\\|");
let body = "";
for (const kind of KINDS) {
  body += `\n## ${kind} (${inv[kind].length})\n\n`;
  body += "| RR id | Kittens counterpart | rung | scale | verdict | note |\n|---|---|---|---|---|---|\n";
  for (const e of inv[kind]) {
    const m = V[e.id] || UPGRADE_V[e.id] || CHAMP_V[e.id] || LEAD_V[e.id] || EXPEDITION_V[e.id] ||
      ["RR-ORIGINAL", "UNVERIFIED", "no citation on file — this row is parity debt, not a claim"];
    counts[m[1]] = (counts[m[1]] || 0) + 1;
    body += `| \`${e.id}\` | ${esc(m[0])} | ${esc(e.rung)} | ${esc(e.scale)} | **${m[1]}** | ${esc(m[2])} |\n`;
  }
}
const total = KINDS.reduce((a, k) => a + inv[k].length, 0);
// v0.57 Part 7.1 — THE GUARD THAT WAS MISSING, and it is here in the GENERATOR rather than only
// in a suite. Four documents quoted this ledger as "EASIER 32" while the ledger itself said 29,
// and only 29 makes the total 208. Nothing checked the summary against the rows it summarises.
// Now the tool refuses to write a file whose verdict buckets do not sum to its own row count,
// and it refuses to invent a fifth bucket — which is exactly how "PARITY in shape" would have
// silently created one during this very round.
{
  const VERDICTS = ["PARITY", "EASIER", "HARDER", "UNVERIFIED"];
  const stray = Object.keys(counts).filter(v => VERDICTS.indexOf(v) < 0);
  const sum = VERDICTS.reduce((a, v) => a + (counts[v] || 0), 0);
  if (stray.length) { console.error(`LEDGER ABORT: verdict outside the four — ${stray.join(", ")}`); process.exit(1); }
  if (sum !== total) { console.error(`LEDGER ABORT: buckets sum to ${sum} but there are ${total} rows`); process.exit(1); }
}
const header = `# PARITY LEDGER — Runeterra Reclaimed ${inv.version}

**Generated by \`tools/parity-ledger.mjs\`. Do not hand-edit — edit the verdict map in the tool
and regenerate.** The rows are enumerated from the LIVE GAME, so an entity added later cannot
silently miss the ledger; \`test-v55\` asserts the same enumeration against this file.

This is STANDING-RULINGS §16's instrument. §16 makes the source the balance authority and
requires every RR-original item to carry a parity label; a charter with no instrument is a
preference, and this is where "is this at parity?" has an answer that does not have to be
re-derived every round.

**A row is PARITY, EASIER or HARDER only where a citation exists** — in this repo, in the v0.55
spec, or read from source. Everything else is **UNVERIFIED**, which §16 calls a legal verdict
and an honest one. **The UNVERIFIED count is this project's PARITY DEBT.** Every future round
should shrink it; no round should grow it without saying why.

**EASIER / HARDER are stated from the PLAYER's side.** EASIER means RR is more generous or
quicker than the source; HARDER means RR asks more. Jerry's null hypothesis (§16) is that
RR-original content usually makes the game easier, so an unlabelled RR-original row is a
suspected speed-up, not a neutral one.

| verdict | count | share |
|---|---|---|
| **PARITY** | ${counts.PARITY} | ${(100 * counts.PARITY / total).toFixed(1)}% |
| **EASIER** | ${counts.EASIER} | ${(100 * counts.EASIER / total).toFixed(1)}% |
| **HARDER** | ${counts.HARDER} | ${(100 * counts.HARDER / total).toFixed(1)}% |
| **UNVERIFIED** (parity debt) | ${counts.UNVERIFIED} | ${(100 * counts.UNVERIFIED / total).toFixed(1)}% |
| **total rows** | **${total}** | |

## Standing divergences that are not rows

Some divergences are mechanisms rather than entities, so they have no id to hang a row on.
They are recorded here and they carry labels under §16 exactly as the rows do.

| mechanism | Kittens counterpart | verdict | note |
|---|---|---|---|
| **Seasonal farmers** (v0.55 directive 5, **REVERSED v0.57 directive 2**) | \`js/village.js updateResourceProduction()\` applies **no** season term to job output; the wiki: *"Seasons affect catnip production from catnip fields, but do not affect production from farmers."* | **PARITY** | **This row is the charter's proof of work.** v0.55 shipped seasonal farmers on a directive whose premise about the source was FALSE, the builder disproved the premise in the same round, and it shipped labelled RR-ORIGINAL / **HARDER** rather than as a parity fix. Two rounds later Jerry read the label and reversed it. v0.57 Part 2 removes the season term from the farmer job — seasonal BUILDINGS keep theirs, which is Kittens' catnip field and is seasonal in the source. **HARDER → PARITY, and the project's HARDER count falls 2 → 1.** STANDING-RULINGS §17, amended not deleted. |
| **Renown's cap family — THE FAMILY IS DELETED** (\`SCHOLAR_CAPS\` is gone; \`capFamilyOf()\` is down to \`exempt\` / \`masonry\` / null) | \`js/resources.js addBarnWarehouseRatio\` touches **seven material effect names and nothing else**; Kittens relieves non-material ceilings by other machinery entirely — \`libraryRatio\` for science, **Ziggurat +8% per copy** for culture, the Temple line for faith | **HARDER** | **v0.59 Part 5.3, Jerry's directive 7.** v0.57 moved renown OFF the material line onto the Scholarship line (correct: a non-material resource on the material storage line is a category error in the source's own terms). §29 then emptied that family to renown alone, and directive 7 removes the last member — so the family is **deleted, not emptied**, along with \`scholarMult\`, \`scholarCapNames()\`, the ternary arm in \`computeCaps()\` and both \`!SCHOLAR_CAPS[...]\` guards. **RR drops from three cap families to two, which is the largest structural simplification of the round.** Renown lands at the \`CAP_SCOPE\` **"none"** tier (x1, the construction \`voidessence\` has used since v0.56 Part 5) rather than in \`CAP_MULT_EXEMPT\`, because its only argument is against the MATERIAL line — it has none against the mountain drakes or a leader, and **Poppy's +8% now reaches it**, which the family guard used to prevent. **Measured: renown's ceiling is 30 + 900 x Halls bare, 210 + 900 x Halls with trade / drakeLore / voidStudies. The x2.60 is gone, so the tenth champion needs 18 Halls rather than 7.** HARDER, and deliberately so. |
| **The Scholarship line is now the KNOWLEDGE line** (\`ARCHIVE_RATIO_LINE\` Σ 0.06, \`ASTROLABE_LINE\` x1.5) | \`js/buildings.js:579-580\` \`library.scienceMax *= (1 + observatory.on * libraryRatio)\` fed by three \`js/workshop.js\` Reflectors at 0.02 each; \`js/buildings.js:672\` the Astrolabe's 1,000 → 1,500 on the Observatory's own slice | **PARITY** | **v0.59 Part 5.4, Jerry's directive 8.** \`SCHOLAR_LINE\`'s 0.25/0.30/0.30/0.35/0.40 is deleted outright. The five rungs are now TWO source mechanisms: three Reflectors rungs summing **Kittens' own Σ 0.06**, scaled by Observatory count inside the Archive's own cap slice, and two Astrolabe-shaped **+50% per copy** on the Academy and the Hexcore Laboratory. **Measured at the spec's fixture (20 archives, 15 academies, 10 observatories, 5 hexLabs, all five + voidglassLenses): 35,000 → 45,500, x1.30 — and the Morellonomicon term compounds it, because \`min(150 x n, buildingKnowledgeCap)\` reads THE BUILDING TOTAL, so the fully-stacked ceiling moves x1.30 as well, not less.** Knowledge stays in \`CAP_MULT_EXEMPT\` and **no whole-cap knowledge multiplier ships anywhere**. |
| **A whole-cap knowledge multiplier belongs on a POLICY** (none ships) | \`js/science.js:1067-1080\` \`technocracy\`, \`technocracyScienceCap: 0.2\`, price **culture 150,000**, mutually exclusive with \`theocracy\` and \`expansionism\`; consumed at \`js/resources.js:954-956\` | **PARITY** (by absence) | **v0.59 Part 5.4, recorded as a standing rule rather than shipped.** Kittens has exactly ONE whole-cap science multiplier in the entire game and it is not an upgrade — it is a policy, priced like one and exclusive like one. Every upgrade-shaped science boost in the source (Astrolabe, the three Reflectors, Uplink, the AI Core line) is per-building. **If a future round wants a whole-cap knowledge multiplier in RR, x1.20 is the source's magnitude and a POLICY is the source's shape.** |
| **\`voidglassLenses\` — UNTOUCHED** | \`js/buildings.js:672\` \`self.effects["scienceMax"] = ratio * (astrolabe.researched ? 1500 : 1000)\` | **PARITY** | **v0.59 Part 5.4 verified rather than changed it.** RR already shipped Kittens' Astrolabe at exact parity — "Celestial Observatories hold +50% more knowledge each", implemented at \`capMultPerCopy()\` as \`observatory x 1.5\`. 1,000 → 1,500 IS +50% on that one building's own contribution. Left completely alone; the round's two new Astrolabe rungs copy it rather than replacing it. |
| **Culture's fixed x1.05 whole-cap multiplier** (\`CULTURE_FIXED_MULT\`, the Progress Day Parade) | \`js/science.js:1283-1297\` \`cityOnAHill\`, \`onAHillCultureCap: 0.05\`, consumed at \`js/resources.js:958-961\` as a whole-cap culture multiplier | **PARITY** | **v0.59 Part 5.1 — this row moves UNVERIFIED → PARITY, and it is the round's one debt repayment.** §29 shipped culture's fixed multiplier at Jerry's x1.05 with no Kittens line number beside it. The citation exists: Kittens' \`cityOnAHill\` policy raises the culture cap by exactly 5%, applied to the FINISHED ceiling, which is both the magnitude and the shape RR ships. Jerry's figure was the source's figure. |
| **The Solari Altar's x1.5 devotion SLICE** (\`capsSliceMult\`) | \`js/buildings.js:1964-1966\` \`faithMax *= (1 + (0.4 + 0.1 * goldenSpire.on))\` — the Golden Spire, scoped to the Temple's own slice | **PARITY** | **v0.59 Part 5.1 supplies §29's missing citation.** §29 replaced a \`caps.devotion *= 2\` with a slice multiplier on the Marus Omegnum on the reasoning that "Kittens' faith-cap effects raise the contribution of ONE building rather than the finished ceiling" — asserted without a line number for a round. The Golden Spire is that line: it multiplies the Temple's faithMax and nothing else, and \`faithMaxRatio\` returns no hits anywhere in the source. **The x1.5 magnitude is also the Spire's own at one copy.** |
| **RETRACTION — the v0.58.1 §22 claim** | — | — | **v0.59 Part 5.2.** The v0.58.1 build report recorded that §22's one-family invariant had been violated by \`SCHOLAR_CAPS\` carrying more than one member. **That is withdrawn: after §29 the object held exactly one key, \`renown\`, and \`capFamilyOf()\` was total and single-valued throughout. §22 was never violated.** Recorded here rather than only in a build report, because a false defect claim propagates further than a false clean bill. |
| **The wanderer rank ladder, RUNG BY RUNG** | wiki, *Kittens*: 0 / 100 / 500 / 1,200 / 2,500 / 5,000 / 9,000 → +0 / 1.25% / 2.5% / 4.5% / 7.5% / 12.5% / **18.75%** | **HARDER — 102% at the top** | **v0.59 Part 6, reported rather than changed: this is the largest single parity divergence in the game and the charter's requirement is that it be SEEN rather than inherited.** RR's ladder against the source's, with the debt at each rung: Kittens 100 → RR 100 (**0%**); 500 → 500 (**0%**); 1,200 → 1,200 (**0%**); 2,500 → 2,500 (**0%**); 5,000 → 5,000 (**0%**); **9,000 → 10,200 for the second-top rung and 18,200 for the top (+18.75%), a 102% debt.** The whole divergence is in the last two rungs, which is exactly what note 11 asked for ("the gaps double") — Bronze through Master are at exact parity. **THE INTERACTION WITH \`XP_PER_SECOND\` MUST NOT BE CONFLATED WITH IT: the debt above is a THRESHOLD ratio, and the ACCRUAL RATE is the other half of time-to-rank and its source figure has never been found (see the XP_PER_SECOND row). A 102% threshold debt at an unverified rate is one unknown multiplied by another.** If Jerry wants it reduced, the source-shaped move is to match the thresholds and leave the rate alone, because the thresholds have a citation and the rate does not. |
| **Renown is NOT granted by the Ascent** | none — Kittens has no Renown | **HARDER** (by absence) | **v0.59 Part 2.4, Jerry's directive 1, measured at 0 and shipped as NO CODE.** \`ascendTargon()\` converts devotion to worship and grants nothing else. Recorded so a future round does not add it as an "obvious" deed source. The renown a player sees rising during an Ascent is the passive trickle, which runs continuously. |
| **Renown is NOT granted by first-time research or a first Discovery** | none | **HARDER** (by absence) | **v0.59 Part 2.4, Jerry's directive 5, measured at 0 on both \`buyTech\` and \`buyUpgrade\` and shipped as NO CODE.** Same reason as the Ascent row. |
| **The undo window** (\`UNDO_SECONDS = 10\`, \`rerollPenalty\`, \`undoBulkDepth\`) | none — Kittens has no undo | **EASIER**, bounded after v0.55 Part 8 | It converted every probabilistic outcome into a best-of-N. v0.55 forces the next roll of the same kind to fail. **v0.59 Part 8 note 2 (Jerry): "crafting needs an undo button."** Crafting is wired into the SAME window and the SAME re-roll guard rather than given its own — which is what v0.55 built the seam for. **The open v0.55 item closes in the same round: trades now call \`snapshotUndo()\` too, stamped \`"trade"\`, so undoing a bad caravan sets the penalty and the next attempt runs at its worst roll.** Without that stamp, adding an undo to trades would have handed the player the free re-roll the original comment said not to. Bulk actions snapshot ONCE at the batch boundary (\`undoBulkDepth\`), so "craft x200" is one undoable action rather than 200 \`JSON.stringify(S)\` calls of which only the last survives. |
| **Drakes** (\`DRAKE_PER_KILL\`, five multipliers) | none | **EASIER**, curve fixed in v0.55 Part 6 | \`limitedDR\` is linear below 75% of the cap, so a player reached three-quarters of every drake cap with no diminishing return at all — 7.5 kills for the Mountain Drake. \`strictDR\` bites from the first kill. |
| **Morale / luxury comfort** | \`js/village.js\` happiness | **UNVERIFIED** | The mechanism is ported in shape; the magnitudes are not censused. Band has measured 61% against an 80% target for two rounds. |
| **\`catMeta\`'s two outputs** | \`js/game.js\` transient guard | **PARITY** | STANDING-RULINGS §6. The collapse must keep two outputs or knowledge, culture, vigor and devotion silently inherit the drakes and the Dragon Soul. |
| **\`CAMP_YIELD_LIMIT = 6\`** | \`js/workshop.js hunterRatio\` Σ 5.10 → ×6.10, unbounded | **PARITY in magnitude** | RR bounds what the source leaves unbounded, but at the source's own Σ the delivered figure lands within 3%. STANDING-RULINGS Appendix. |
| **Wanderer experience** (\`XP_PER_SECOND = 0.5\`) | \`js/village.js\` carries the rank table but not the per-tick skill increment; \`js/game.js\` and \`js/core.js\` both 404 from raw.githubusercontent, the GitHub blob view and jsdelivr, and the wiki states no figure | **UNVERIFIED** | v0.55 doubled it 1 → 2 and it cost **−193.6 game-years of Era 3**. v0.56 Part 1(a) takes it to **0.5** on Jerry's directive 3 (\"slower than before\"), which is slower than both. The scalar \`skillXP\` is a local computed between \`js/village.js:2623\` and \`:2644\` and no grep query shape returns its assignment — **still no citation, and none invented**. Time-to-Challenger 1.60 real hours → **6.39**. The CAP beside it is PARITY; this rate is not, and the two must not be conflated. **v0.58, Jerry's dev note 11 ("confirm that wanderers earn exp at the same rate kittens earn exp") — ANSWER: STILL CANNOT BE CONFIRMED, and three more retrieval routes are now ruled out and recorded so nobody repeats them: the raw file is too large for full retrieval and every targeted excerpt query returns "not present"; grep.app's HTML search is **disallowed by its robots.txt**; and grep.app's JSON endpoint **silently ignores the repository filter**. What v0.58 DID establish and had never been written down: Kittens runs at **5 ticks/s, 200 ms each** (wiki, Game Mechanics, verbatim), so RR's \`TICK_MS = 200\` is exact tick parity and any per-tick figure would port 1:1 — one whole class of conversion error is now excluded. And the source ladder is confirmed verbatim (Dabbling 0 / Novice 100 / Adequate 500 / Competent 1200 / Skilled 2500 / Proficient 5000 / Master 9000 → +18.75%), which re-confirms the 27.8% parity debt in RR's 11,500 Challenger for the same top bonus.** |
| **Wanderer traits** (\`TRAIT_LIMIT = 0.15\`) | none — Kittens has no per-kitten traits | **EASIER**, hard-bounded | The Trailblazer is the eighth member of \`campYieldMult()\` after v0.55 Part 4 rebuilt the other seven onto the source's stack. It adds at most 0.15 to Σ 5.10 no matter how many arrive, which moves the delivered multiplier ×5.93 → ×5.98. Small, bounded, and named rather than removed. |
| **Storage scope** (\`CAP_SCOPE\`, \`BARN_LINE\`, \`WAREHOUSE_LINE\`) | \`js/resources.js:866-885 addBarnWarehouseRatio\` — two ADDITIVE accumulators (barnRatio Σ 4.35, warehouseRatio Σ 1.80 across six \`js/workshop.js\` upgrades each) applied at three scopes | **PARITY** | v0.56 Part 5. RR ran ONE multiplicative chain (×22.05 nominal, ×12.6 realised) across twelve resources — a Kittens'-Law violation on top of a scope error. Now ×14.98 narrow / ×2.80 broad / ×2.0875 quarter-after-Silos / ×1.00 none, which are the source's own figures. Renown and Mana are RR-ORIGINAL tier assignments and are stated as design rulings in the source comment, not as parity claims. |
| **Food storage** (Storehouse, Harbor, Warehouse) | \`js/buildings.js:765-767\` barn \`catnipMax 5000\`; wiki *Catnip* — harbour 2,500, warehouse 750 after Silos | **PARITY** | v0.56, Jerry's directive. RR's Storehouse held 7,500 (×1.5 the source) and its Harbor 10,000 (×4), while its Warehouse held none at all against the source's 750. Provisions sat at cap **1.5% of ticks** on the v0.55 build, which is the whole of "Deepwinter is never a problem". |
| **The wanderer rank ladder** (\`RANKS\`, Grandmaster 10,200 / Challenger 18,200) | wiki, *Kittens*: Dabbling 0 / Novice 100 / Adequate 500 / Competent 1200 / Skilled 2500 / Proficient 5000 / **Master 9000 → +18.75%** | **HARDER** | **v0.58.1, Jerry's note 11**: *"The amount of exp it takes wanderers to go from Master -> Grandmaster should double. The amount of exp it takes from grandmaster -> challenger should also double."* The GAPS double, not the thresholds, so Bronze through Master are untouched. **RR already asked 11,500 for the same +18.75% Kittens grants at 9,000 — a 27.8% parity debt. At 18,200 that debt is 102%.** A deliberate, Jerry-directed divergence, re-rated here rather than left looking like parity. |
| **The Festival** (\`festivalCost\`, \`FESTIVAL_MORALE_MULT 1.20\`, \`FESTIVAL_MUSHROOMS 2\`, \`FESTIVAL_PLUME_SHARE 0.5\`) | \`js/village.js holdFestival\` — eats the catnip and fur stockpiles, pays happiness | **HARDER** | **v0.59 Part 8 note 8 (Jerry): "Festival costs fewer mushrooms; raptor plumes at half the mushroom cost."** The two luxury terms were both \`4 x luxuryComfort()\`; mushrooms fall to 2 and plumes are now DERIVED as half the mushroom term rather than stated separately, so the ratio Jerry asked for cannot drift out of a future edit. At \`luxuryComfort() = 3\` that is mushrooms 12 → 6 and plumes 12 → 3. **Festivals are RR-original, so this is an EASIER move inside a HARDER row** — the culture and vigor per-head terms are untouched and remain the reason the row is HARDER overall. **v0.58.1 note 1.** It now costs culture and vigor PER HEAD on top of the luxuries, gives no culture back, and pays +20% morale rather than v0.58's +30%. HARDER on every axis except duration: a full game-year (400 days) rather than ten real minutes, and it cannot be layered. The gold reward (250 + 25/Hearth) is RR-original and is what makes it worth holding. |
| **The Renown economy** (\`RECRUIT_BASE 400\`, \`RENOWN_DEED_RATE 1.00\`, \`TRADE_RENOWN 1\`, flat 0.007/s trickle, Hall of Heroes flat 900) | none — Renown has no Kittens counterpart at all | **HARDER** | **v0.58.1 note 31 plus v0.59 Part 2 (Jerry's directives 1-6), and the round moves it in BOTH directions at once — deliberately.** HARDER: the passive trickle goes from \`0.005 x pop\` to a **flat 0.007/s**, which is 14x slower at pop 20, 29x at pop 40 and **100x at pop 140** — at that rate it pays the tenth champion's 15,377 in 25.4 REAL DAYS, so it can no longer fund the ladder on its own at any settlement size. It is also gated on \`callToArms\` rather than \`logistics\`, which fixes a live defect: renown is HIDDEN until Call to Arms but the trickle ran anyway, so a player arrived at the tech with the meter **already pinned at 30/30 by a resource they had never seen**. EASIER: **the charge guard is deleted**, so every expedition pays instead of only charge-consuming ones, and \`RENOWN_DEED_RATE\` rises **0.34 → 1.00** — at 0.34 the \`Math.max(1, Math.round(...))\` floor collapsed the whole low ladder to a constant and camps authored at 2/2/3/3 **all paid exactly 1**. The charge now MULTIPLIES x3, applied after the floor. A completed caravan pays **+1 for every leader** (Caitlyn 1 + 5 = 6), per caravan in bulk, nothing on failure. **NET: renown stops being idle income and becomes a deed currency, which is what the constant's own name always claimed.** Measured: the tenth champion needs **18 Halls of Heroes** after Part 5.3 deletes the x2.60, cumulative 16,269 timber and 29,284 ore. |
| **Wanderer skill cap** (\`XP_CAP = 25,556\`) | \`js/village.js:2622\` \`var skillsCap = 20001;\` and \`:2650\` \`Math.min(kitten.skills[kitten.job] + skillXP, skillsCap)\` | **PARITY** | v0.56 Part 1(b), rank-matched by ratio: Kittens caps at 2.22233× its top tier's 9,000, RR's Challenger is 11,500. RR had **no cap at all** and the measured top bank at Icathia was 1,335,491 — 116× the top rank. |
| **Champions and leader clauses** | none — see the CHAMPIONS and LEADS sections, taken as rows this round (v0.56 Part 7.6) | **EASIER** | Was a single line here for three rounds. Twenty rows now, each labelled. |
| **Bulk hunting on CHARGE camps** (\`runExpeditionBulk\`) | \`js/village.js huntAll\` — Kittens' hunt has a "hunt all" and no per-camp cooldown at all | **EASIER** | **v0.59 Part 8 note 4 (Jerry): "bulk hunting on charge camps but not cooldown camps."** The predicate already existed, so this is a gate rather than new machinery. The old exclusion rested on "a bulk run would spend the banked x3 on the first clear and waste it" — Part 2.1 removes the premise by making every hunt pay and the charge a MULTIPLIER rather than a gate. **Cooldown camps stay excluded and that half is not negotiable:** a cooldown camp runs once, so a x20 there would either be a lie or a way to skip a cooldown. Kittens' own hunt has no cooldown and a hunt-all button, so the charge-camp half moves TOWARD the source. |
| **The wanderer job row** (\`.job-row\`, \`.job-btn\`) | none — a UI concern | **PARITY** (no balance effect) | **v0.59 Part 8 note 1 (Jerry): "the wanderer job buttons are too bulky and the text does not fit."** Both halves were one cause: eight fixed 28px squares reserved 272px of a row, so "−20" and "+20" were laid out into 28px and clipped, and a narrow viewport overflowed the panel. The chips size to their own text and the row wraps. **Layout only — no counts, no maxima, no \`assignJob\` behaviour touched.** |
| **The transmute chronicle line** | none — Kittens logs nothing per craft | **PARITY** (no balance effect) | **v0.59, Jerry's dev note 1, which supersedes the analyzer spec: "Only bulk crafting of 'transmute' mana → timber should show in the chronicle."** v0.58 note 7 added a line per cast, correctly refusing to leave the Arcanist's Circle's yearly draw silent — but transmute is the most clicked action in the early game and one line per click buried every other line. A single cast is visible in the resource column as it happens; a BATCH is the thing a player cannot reconstruct, and the Circle's draw is always a batch. **The conversion itself is unchanged.** |
| **\`BOOST_LIMIT\`'s seven keys** | \`game.js:3425–3435\`, \`<res>Ratio\` unbounded | **HARDER** | RR bounds seven resource-boost stacks the source leaves unbounded. \`knowledge\` is deliberately absent, which is the one key at parity. |
`;
fs.writeFileSync(new URL("../docs/PARITY-LEDGER.md", import.meta.url).pathname, header + body);
console.log(`PARITY LEDGER written: ${total} rows — PARITY ${counts.PARITY}, EASIER ${counts.EASIER}, HARDER ${counts.HARDER}, UNVERIFIED ${counts.UNVERIFIED}`);
