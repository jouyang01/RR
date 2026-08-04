# BUILDER SPEC v0.39 — Eras 0–3 against the revamped absolute-pacing plan

Measured against `index_36.html` (v0.38) running headlessly through the real
`tick()`, `computeRates()`, `computeCaps()`, `buyTech()` and `recruitChamp()`.
Every number below is from the shipped code, not a port.

Grounded in `rr_game_plan.md` §1.2 / §1.3 / §1.5 / §2.2 and
`era3_regional_crafting_spec_2.md` §1 / §6 / §8. Era 4 is explicitly out of
scope. Where a finding came out of the harness rather than the game, I say so.

---

## 0. The one-paragraph verdict

**Eras 0 and 1 already hit the new absolute-pacing targets almost exactly, and
need no re-tuning.** Era 0's loop closes at game-year 9–11 (≈2¼ real hours) and
Era 1 closes with Convergence of the Aspects at game-year 159 (≈3 real days) —
both inside the windows the revamped plan calls for. **Era 2 and Era 3 do not
exist as playable content in v0.38**, and the reason is a single gate, not a
tuning problem: Era 3's entry tech is locked behind recruiting a champion, and
champions are locked behind a Renown cap that requires **fourteen copies of Hall
of Heroes** to clear once. Nothing past Call to Arms (year 77) was reached in
300 simulated years — no champion, no Sparks Beyond the Wall, no Zaun Ore, no
craft chain, no Hextech Core. Fix the gate first; the rest of this document is
about what Era 3 should then be stretched *into*.

---

## 1. What "absolute pacing" means in game-years

`rr_game_plan.md` §2.2 retires the 1-week target and asks for real Kittens
pacing. §2.3 asks the analyzer to translate that into the simulator's clock.
Here is that translation, and it is the yardstick for everything below.

One game-year = `TICKS_PER_DAY 10 × DAYS_PER_SEASON 100 × 4 seasons = 4,000
ticks × TICK_MS 200` = **800 s = 13m20s of real time**, the same as Kittens.

A reference engaged-idle player banks roughly **11 game-hours per real day**:
about 3 hours of active session plus two offline windows, each truncated by
`OFFLINE_CAP_HOURS = 4`. That is **≈50 game-years per real day**.

| Real time | Game-year |
|---|---|
| 1 day | 50 |
| 3 days | 150 |
| 1 week | 350 |
| 2 weeks | 700 |
| 4 weeks | 1,400 |
| 6 weeks | 2,100 |

### Target windows, and what v0.38 actually does

| Era | Plan target (§2.2) | Target game-year | v0.38 measured | Verdict |
|---|---|---|---|---|
| Era 0 complete (Trade + Smelting, storage loop live) | first real hours, well under a day | 10–25 | **9–11** | on target, marginally fast |
| Era 1 complete (Convergence of the Aspects) | within the first few real days | 100–250 | **159** | **on target** |
| Era 2 first champion | overlapping Era 1 | 60–120 | **never (300 yr)** | broken |
| Era 2 roster of 5 | into early Era 3 | 250–500 | **never** | broken |
| Era 3 entry (Sparks Beyond the Wall) | end of week 1 / start of week 2 | 350–500 | **never** | broken |
| Era 3 complete (Icathia + Hextech Core + all four advanced buildings + Observatory) | multiple real weeks | 1,400–2,300 | **never** | broken |

Two things worth saying plainly. First, the revamp **does not invalidate the
Era 0–1 work** — the faith line in particular (Rites of Targon yr 36 → First
Ascent yr 37 → Convergence yr 159) is now a well-shaped 120-year arc and should
not be touched. Second, the previously reported v0.36 figures ("first champion
yr 40.1, Era 3 at yr 43.9") do not reproduce against v0.38; on this build
neither is reachable at all. Something regressed between those builds — most
likely the `sparks.unlock` champion requirement described in §2.

---

## 2. CHANGE 1 — Break the Era 2 → Era 3 hard gate (do this before anything else)

### What the code does now

```js
{ id: "sparks", name: "Sparks Beyond the Wall",
  cost: { knowledge: 30000, steel: 200 }, req: "callToArms",
  unlock: function (s) {
    return ["twitch", "caitlyn", "heimerdinger"].some(function (id) {
      return s.champs && s.champs[id] && s.champs[id].r; }); },
  ...
```

The cheapest of those three is **Twitch at 400 Renown**. Renown's only cap
source is Hall of Heroes at **+30 per copy** (`caps: { renown: 30 }`, ratio
1.15). 400 ÷ 30 = **14 Halls of Heroes** before a player can hold enough Renown
to recruit one champion. Champion levelling is worse: `trainCost` is
`40 × (lvl+1)^1.6` Renown, so level 10 needs **1,590 Renown = 53 Halls**.

Measured over 200 game-years with a bot that explicitly prioritises cap-relief
for blocked purchases: Renown sat pinned at its cap (30/30 from year 81, then
44/44 at year 191) while Knowledge peaked at 698,702 and Steel at 43,104 — the
Sparks *costs* were affordable by an order of magnitude for ninety years. The
gate is the `unlock`, not the price.

This also directly contradicts `rr_game_plan.md` §1.6, which says Era 2 should
"run in parallel with Era 1/3 rather than a strictly sequential gate, since
champions are recruited opportunistically." Right now Era 2 is the hardest
sequential gate in the game.

### What to change

**2a. Raise Hall of Heroes' Renown cap by 4×** — `caps: { renown: 30 }` →
`caps: { renown: 120 }`. Four Halls then hold Twitch's 400 Renown, and thirteen
hold a level-10 champion. Four-to-thirteen copies of a dedicated building is the
Kittens shape (Ziggurat, Barn); fourteen-to-fifty-three is not.

**2b. Give Renown a second cap source that is not Hall of Heroes.** Hall of
Heroes is currently the only building in the game that raises Renown, which
makes the entire champion system hostage to one purchase queue. Add
`caps: { renown: 60 }` to **Training Ground** (already `tech: "logistics"`,
already thematically the place deeds are recorded) at no cost change.

**2c. Remove the champion requirement from `sparks.unlock` entirely.** Replace
it with a material gate, which is what Kittens actually uses to open the
Workshop-tier chain:

```js
{ id: "sparks", name: "Sparks Beyond the Wall",
  cost: { knowledge: 30000, steel: 200, gear: 40 }, req: "callToArms",
  unlock: function (s) { return count("workshop") >= 3; },
  gate: function (s) { return "Requires 3 Yordle Workshops — Piltover notices competence"; },
  ...
```

Keep the champion flavour as a *bonus*, not a gate: if a Piltover/Zaun champion
is recruited, Sparks costs 30% less. That preserves the intent ("your Piltovan
friend keeps talking about home") without making an entire era unreachable for a
player who has not solved the Renown puzzle.

**2d. Add a pre-Call-to-Arms Renown trickle so Era 2 genuinely overlaps Era 1.**
`rates.renown += 0.005 * S.pop` currently requires `S.techs.callToArms`
(year 77). Let expeditions and successful trades award small Renown from
Expedition Logistics onward (year 3), gated only on the *cap* being visible
after Call to Arms. A player should arrive at Call to Arms with a Renown
stockpile, not a cold start.

**Verification:** first champion by game-year 120, five champions by year 500,
Sparks Beyond the Wall by year 500.

---

## 3. CHANGE 2 — The population wall at 97, and the circular Deep Works gate

Population climbs to 97 and then stops dead: year 191 reads `pop 95/95`,
year 300 reads 97. It is a **cost** wall, not a morale or food wall (morale sat
at 160%, zero starvation deaths in 300 years). Measured at year 191:

| | Next copy costs | You can hold |
|---|---|---|
| Longhouse #47 | 156,755 timber / 185,256 ore | 219,394 timber / 164,424 ore |
| Shelter #24 | 224,455 timber | 219,394 timber |

Both are within a factor of ~1.2 of the ceiling, so both stop within one or two
more purchases. The game ships the correct answer to this — **Stonecut Guild**
(Longhouse 1.15 → 1.09) and **Petricite Frames** (Shelter 1.5 → 1.3). At 1.09,
Longhouse #78 costs 134,700 timber and stays inside the cap, which puts max
population around **129 wanderers** — exactly the Kittens reset benchmark.

The problem is placement. Both upgrades, plus the Skyrise Terrace housing tier,
are gated on **The Deep Works** — which is *two techs past Era 3 entry*, which
is itself gated on Era 2, which is gated on a Renown cap that needs population
to fill. The three things that unblock population all sit behind the thing
population unblocks.

Kittens does not do this: Ironwood Huts is a mid-game Construction upgrade and
Concrete Huts sits well before the endgame, precisely so the housing ratio comes
down *before* the player needs the population.

### What to change

**3a. Move Stonecut Guild from `deepWorks` to `petricite`** (Petricite Masonry,
reached year 24 — and "the masons finally unionize" is already Demacian-stone
flavour). Its cost must move to Era-2 materials at the same time:

```js
{ id: "stonecutGuild", name: "Stonecut Guild",
  cost: { stoneSlab: 150, gold: 800 }, tech: "petricite",
  desc: "Longhouse cost scaling 1.15 → 1.09 — the masons finally unionize" },
```

Note it currently costs `slab: 60`, which is **Hexcrystal Slabs (Era 3)**, not
**Stone Slabs (`stoneSlab`, Era 1)**. Those two resource ids are one character
apart and mean completely different eras; worth renaming `slab` →
`hexSlab` across the codebase to prevent this class of bug recurring.

**3b. Move Petricite Frames from `deepWorks` to `hexcore`** and re-cost to
`{ gear: 60, gold: 2000 }` so it is not gated on Hexcrete, which is a Deep Works
material.

**3c. Skyrise Terrace: ratio 1.12 → 1.15.** Kittens' third housing tier
(Mansion) is 1.15, and RR's third tier is currently *cheaper-scaling than its
second*, which inverts the whole steep-then-settle shape §1.1 describes. Keep
`pop: 2`; the ratio is the part that is out of pattern.

**Verification:** 130 wanderers reached by game-year 600; population still
rising at year 1,000 rather than flat.

---

## 4. CHANGE 3 — Era 3's raw resources must become passive autoprod buildings

`rr_game_plan.md` §1.3 and `era3_regional_crafting_spec_2.md` §1 both state this
directly, and it is the largest unimplemented item in the plan. Kittens'
Smelter/Calciner tier has **no worker role at all**: buildings consume banked
resources every tick and autoproduce the new one, scaled by
`smelterRatio`/`calcinerRatio` tech bonuses.

v0.38 does the opposite. The jobs still exist:

```js
{ id: "prospector", name: "Prospector", desc: "+0.2 Zaun Ore/s (+0.15 Hexcrystal Ore/s after the Conjecture)",
  prod: { zaunore: 0.2, hexore: 0.15 }, tech: "sparks" },
{ id: "stoker", name: "Stoker", desc: "+0.12 coalgas/s", prod: { coalgas: 0.12 }, tech: "chemtech" },
```

and the three buildings are percentage boosters on those jobs, not converters:

```js
{ id: "sumpMine", ..., boost: { zaunore: 0.2 }, caps: { zaunore: 100 } },
{ id: "coalgasVent", ..., boost: { coalgas: 0.2 }, caps: { coalgas: 80 } },
{ id: "hexQuarry", ..., boost: { hexore: 0.2 }, caps: { hexore: 90 } },
```

This matters beyond fidelity. With Era 3 raw supply proportional to population,
and population hard-capped at ~130, Era 3's ceiling is set by the same wall as
Era 0's. Under the autoprod pattern, Era 3's rate is set by *building count*
against a *banked-resource* budget, which is what lets it run for weeks.

### What to change

**4a. Delete the `prospector` and `stoker` jobs entirely.** No later-Era
resource gets a worker role.

**4b. Convert the three buildings to `convert` blocks** using the same schema
Forge and Shimmer Refinery already use (so no new engine code is needed):

```js
{ id: "sumpMine", name: "Sump Mine", group: "Zaun", tech: "sparks", toggleable: true,
  effect: "Consumes 0.5 ore & 0.2 mana/s → +0.06 Zaun Ore/s. +100 Zaun Ore cap",
  cost: { timber: 300, ore: 500, gear: 5 }, ratio: 1.15,
  convert: { input: { ore: 0.5, mana: 0.2 }, output: { zaunore: 0.06 } },
  caps: { zaunore: 100 } },

{ id: "coalgasVent", name: "Coalgas Vent", group: "Zaun", tech: "chemtech", toggleable: true,
  effect: "Consumes 0.4 timber & 0.05 steel/s → +0.04 Coalgas/s. +80 Coalgas cap",
  cost: { timber: 250, ore: 420, steel: 20 }, ratio: 1.15,
  convert: { input: { timber: 0.4, steel: 0.05 }, output: { coalgas: 0.04 } },
  caps: { coalgas: 80 } },

{ id: "hexQuarry", name: "Hexcrystal Quarry", group: "Zaun", tech: "hexcore", toggleable: true,
  effect: "Consumes 0.5 ore & 0.02 gold/s → +0.05 Hexcrystal Ore/s. +90 Hexcrystal Ore cap",
  cost: { timber: 350, ore: 600, gear: 8 }, ratio: 1.15,
  convert: { input: { ore: 0.5, gold: 0.02 }, output: { hexore: 0.05 } },
  caps: { hexore: 90 } },
```

Each input pairing is a judgment call, as the spec allows — what must hold is
the pattern: no worker, consumes banked Era 0–2 resources, output scales with
building count.

**4c. Re-point Chembarrel Refinery to be the `smelterRatio` analog.** Its
current `boost: { zaunore: 0.25, coalgas: 0.25, hexore: 0.25 }` boosted the
worker output; it should now multiply autoprod output instead, through
`limitedDR` so it cannot be spammed to infinity:

```js
// autoprodMult(): 1 + limitedDR(0.25 * count("chembarrel") + techBonuses, 2.0)
```

with a ceiling of +200%, matching the shape RR already uses for
`campYieldMult` / `CAMP_YIELD_LIMIT`.

**4d. Add a tech bonus that feeds it**, per §1.4 — The Deep Works should grant
+50% autoprod on all three buildings, so a late Era 3 discovery loops back and
improves the era's own early machinery.

**Verification:** first Zaun Ore within 10 game-years of Sparks; Zaun Ore rate
still rising at year 1,000 with population flat.

---

## 5. CHANGE 4 — Storage cost composition (plan §1.2)

The plan verifies a three-step rule from source: **raw material → crafted
material → later-Era crafted material**, and RR's *ratios* already match Kittens
exactly (Storehouse 1.75 = Barn 1.75; Warehouse 1.15; Harbor 1.15 — this is
correct and should not change). The *compositions* do not.

| Tier | Kittens cost | RR v0.38 cost | Status |
|---|---|---|---|
| Barn / Storehouse | 50 Wood | 60 timber + 75 ore | **correct** (raw only) |
| Warehouse | 1.5 Beam + 2 Slab | 180 timber + 380 ore | **wrong** — raw, should be crafted |
| Harbor | 50 Slab + 75 Plate + 5 Scaffold | 250 timber + 650 ore + 12 stoneSlab + 20 steel + 100 gold | **wrong** — mostly raw by volume |

### What to change

```js
{ id: "warehouse", ..., cost: { beam: 6, stoneSlab: 8 }, ratio: 1.15, ... },
{ id: "harbor",    ..., cost: { stoneSlab: 50, gear: 20, beam: 30 }, ratio: 1.15, ... },
```

Warehouse's `1.5 Beam + 2 Slab` maps to RR at a 4× scale because RR's beam and
slab crafts are cheaper per unit than Kittens' (see §7). Harbor's Slab/Plate/
Scaffold has no Era-1 analog in RR — Iron Plating and Scaffold are Era 3 — so
Stone Slab + Gear + Beam is the correct same-position substitute: all three are
Workshop-crafted, all three are available at Trade Routes.

This has a useful second-order effect the plan predicts: it makes the Yordle
Workshop's craft-yield bonus load-bearing from Era 1 rather than Era 3, because
storage — the thing every player buys constantly — now runs through crafting.

---

## 6. CHANGE 5 — Celestial Observatory must cost Era 3 crafted materials

`era3_regional_crafting_spec_2.md` §6 and `rr_game_plan.md` §1.5 both call for
this, and it is not implemented. Current definition:

```js
{ id: "observatory", name: "Celestial Observatory", tech: "ritesOfTargon",
  cost: { timber: 300, ore: 400, gold: 120, crystals: 10 }, ratio: 1.1,
  caps: { knowledge: 1000 }, boost: { knowledge: 0.25 } },
```

Gated on Rites of Targon (reached year 36) and payable entirely in raw
materials. The real Observatory costs `750 Iron + 1000 Science + 35 Slab +
50 Scaffold` — genuinely Workshop-gated.

### What to change

```js
{ id: "observatory", name: "Celestial Observatory", group: "Industry", tech: "ritesOfTargon",
  unlock: function (s) { return s.techs.sparks; },
  cost: { ore: 750, knowledge: 1000, slab: 35, scaffold: 50 }, ratio: 1.1,
  caps: { knowledge: 1000 }, boost: { knowledge: 0.25 } },
```

(`slab` here is Hexcrystal Slab — rename per §3a to `hexSlab: 35` when that
lands.) Note the `knowledge: 1000` component: the real Observatory costs Science
itself, which keeps the Knowledge loop self-referential at its third tier the
way Academy already is at its second. RR's Academy correctly costs
`knowledge: 80`; Observatory should follow.

Everything else about RR's Knowledge loop is already right and should not be
touched: Archive +10%/+250 at 1.15, Academy +20%/+500 at 1.15, Observatory
+25%/+1000 at 1.10, Hexcore Laboratory +35%/+1500 at 1.10, Tomes as the
compendium cap mechanic. That is a near-exact match to Library/Academy/
Observatory/Biolab, including the deeper-tiers-get-cheaper-ratios rule.

**Verification (era3 spec §7 KPI 1 and 2):** every simulated run has ≥1 Archive
and ≥1 Academy before Sparks; Observatory is not buildable before Sparks.

---

## 7. CHANGE 6 — Craft-chain depth is the lever that makes Era 3 last weeks

Once §2 removes the gate, Era 3 will collapse rather than stretch. Knowledge
already reaches **698,702 by year 191** at a population of 95 — more than double
the 320,000 that Doors of Icathia costs. The moment the champion gate opens,
the entire five-tech Era 3 ladder is affordable at once.

The instinct is to inflate the tech ladder. Do not do that as the primary lever:
Knowledge cap growth runs through Tomes (+150 each), and pushing Icathia to the
~20M that a 1,400-year span would imply needs roughly 24,000 Tomes, which is not
a real player experience. Kittens' own answer, and the one both Era 3 specs
already assume (§4: "the pressure comes from the recipe quantities themselves"),
is **material volume**.

RR's craft recipes are currently 3–12× cheaper per unit than Kittens':

| RR craft | RR now | Kittens analog | Kittens | RR cheaper by | Recommended |
|---|---|---|---|---|---|
| Support Beam | 25 timber | Beam | 175 wood | 7.0× | **150 timber** |
| Stone Slab | 50 ore | Slab | 250 minerals | 5.0× | **200 ore** |
| Scaffold | 4 beam | Scaffold | 50 beam | 12.5× | **40 beam** |
| Iron Plating | 15 zaunore | Plate | 125 iron | 8.3× | **100 zaunore** |
| Gear | 8 steel | Gear | 25 steel | 3.1× | **25 steel** |
| Chemtech Alloy | 12 zaunore + 8 coalgas | Alloy | 75 titanium + 10 steel | ~5× | **60 zaunore + 30 coalgas** |
| Hexgear | 4 alloy | (Gear-position) | 25 steel | ~6× | **25 alloy** |
| Hextech Core | 6 hexgear + 4 slab + 3 scaffold | (capstone) | — | — | **40 hexgear + 30 slab + 20 scaffold** |

Do these together with §4's autoprod conversion, not before it — the recipe
inflation only produces a long era if raw supply is building-bound. Applied
together, one Hextech Core goes from 288 Zaun Ore / 192 Coalgas / 80 Hexcrystal
Ore / 300 timber to roughly **60,000 Zaun Ore / 30,000 Coalgas / 6,000
Hexcrystal Ore / 120,000 timber**, which at the §4b autoprod rates is a
multi-day project per Core rather than a multi-minute one. That is where the
weeks come from.

Alongside it, a **modest** tech-ladder stretch of ×6–8, preserving the current
clean ×1.7–2.1 steps:

| Tech | Now | Recommended |
|---|---|---|
| Sparks Beyond the Wall | 30,000 | **200,000** |
| The Chemtech Whisper | 60,000 | **450,000** |
| The Hexcore Conjecture | 110,000 | **1,000,000** |
| The Deep Works | 190,000 | **2,200,000** |
| The Doors of Icathia | 320,000 | **5,000,000** |

Also raise the Era 3 advanced buildings' crafted costs in proportion (Hextech
Foundry 30 hexgear + 15 scaffold → **200 + 100**; The Vault 15 slab + 25 plating
→ **100 + 160**; Piltover Spire 20 scaffold + 12 slab → **130 + 80**;
Chembarrel Refinery 25 alloy + 20 plating → **160 + 130**). Each of these keeps
the two-crafted-materials rule from era3 spec §3, which v0.38 already satisfies.

**Two flagged items I could not verify and recommend you measure rather than
copy:** Parchment is 4 furs in RR against 175 furs in Kittens (43×), and Tome is
5 parchment + 50 mana against Compendium's 50 manuscript + 10,000 science. Those
gaps are large enough that they are probably compensating for a much lower fur
income, not a mistake — but since Tomes are the sole Knowledge-cap mechanic,
please report actual furs/hour and Tomes/hour before changing either.

---

## 8. CHANGE 7 — The Freljord capstone is entirely unimplemented

`era3_regional_crafting_spec_2.md` §8 is the final, twice-corrected mapping and
none of it exists in v0.38. Verified against the build: **True Ice exists as a
loot resource with zero sinks anywhere in the game**, and there is no Frost
Megalith, no Watcher's Eye, no Poro Tears, and no Poro sacrifice action.

Implement as specified:

```js
// craft
{ id: "frostMegalith", name: "Raise Frost Megalith",
  cost: { beam: 50, plating: 25, slab: 50 }, out: "frostMegalith" },

// building
{ id: "watchersEye", name: "Watcher's Eye", group: "Zaun", tech: "deepWorks",
  cost: { scaffold: 50, tome: 1, frostMegalith: 50 }, ratio: 1.25,
  cultureCapPct: 0.08,
  effect: "+8% Culture cap. Unlocks the Poro sacrifice — Poros become Poro Tears" },

// action, unlocked by watchersEye
// sacrificePoros(): pay N Poros, gain count("watchersEye") Poro Tears
```

The `gainMultiplier` detail is the load-bearing one and is verified at code
level in the source (`game.bld.get("ziggurat").on`): **Tears gained per
sacrifice equals the number of Watcher's Eyes owned**, exactly 1:1. Set the Poro
cost per sacrifice at whatever fraction of a realistic Poro stockpile you want
the decision to bite at — I'll measure it and report back rather than you
copying Kittens' literal 2,500.

Keep True Ice unspent for now; the Unicorn-Tomb-through-Sunspire line it feeds
is deliberately deferred to a later Era 1 addendum.

---

## 9. Smaller items, and things that are already right

**Already correct — do not re-open.** The tech ladder's shape is now clean:
steps run ×1.25–2.14 from Almanac (30) to Icathia (320,000), a 10,667× span,
with secondary costs (culture, crystals, steel, hexcore) on every Era 2/3 tech.
Storage ratio upgrades exist as a five-tier multiplicative line (Masonry I–V,
1.75 × 1.8 × 2 × 2 × 1.75 ≈ 22×) and Scholarship I–III for Knowledge/Culture/
Devotion (≈5.6×) — both above Kittens' ~15× barn×warehouse, which is fine.
Champion levelling is now an active purchase (`trainCost` = Renown + Tomes, then
Renown + Hexcores past level 5), which closes the old "passive XP" item.
Discoveries that loop back and improve earlier mechanics (§1.4) are well
represented — Masonry IV/V, The Great Index, Hextech Foundry's global +6%.

**Still outstanding:**

1. **One tech-ladder inversion remains.** Mining costs 300 Knowledge and sits
   after Songcraft at 320 — a ×0.94 step. Move Mining to 360 or Songcraft to
   260. It is the only remaining backwards step in the ladder.

2. **Morale is still a permanent bonus, not a constraint.** It ran 149–163% for
   the entire back half of every run, with zero starvation deaths across 300
   years. The Kittens-shaped pieces are all in place now (linear crowding, LDR
   tavern relief, floor 25, Sun Altar gating shrine morale) — the issue is
   magnitude: luxury contribution at `10 × min(1, stock/LUXURY_COMFORT)` per
   type maxes at +30 and is trivially satisfied once camps are running. Scale
   the luxury term by a fraction of population rather than a fixed comfort
   floor, so a settlement of 130 needs meaningfully more luxury than one of 20.

3. **`OFFLINE_CAP_HOURS = 4` is now the wrong shape for a multi-week game.** A
   player who sleeps eight hours loses half that window every night, which is a
   harsh tax on a design that now asks for a month of commitment. Raise it to
   **12**, and pay for the extra progress by taking the §7 stretch — net
   real-world era duration is unchanged, but the game stops punishing sleep.

4. **`slab` vs `stoneSlab` naming**, per §3a — one character apart, three eras
   apart, and it has already produced one mis-costed upgrade (Stonecut Guild).

5. Carry-forward UI items still open: split "show completed" toggles, camp hover
   details, Mana grouped as a material, Jack-in-the-Box as a random event.

---

## 10. Implementation order

Do these in order; each one unblocks the measurement of the next.

1. **§2 — the Era 2 → Era 3 gate.** Nothing downstream is measurable until a
   champion is recruitable and Sparks is reachable.
2. **§3 — housing ratio reducers moved out from behind Deep Works.** Population
   past 97 is what feeds everything in Era 3.
3. **§4 — autoprod conversion of the three Zaun buildings.** Era 3's supply must
   be building-bound before its recipes are inflated.
4. **§5 and §6 — storage composition and the Observatory's Era-3 cost.** Both
   are small, both are pure plan compliance.
5. **§7 — craft-recipe and tech-cost inflation.** Only after 1–4; this is the
   stretch, and stretching an unreachable era is wasted work.
6. **§8 — the Freljord capstone.**
7. **§9 items 1–3.**

Then re-measure and I'll report Era 0–3 boundaries against the §1 target table.

### Verification commands

```
node run2.js ./index_NN.html --seeds 2 --years 800
node objectives.js ./index_NN.html
node luxdiag.js ./index_NN.html
```

Pass conditions after the full set:

- Era 0 loop complete (Trade + Smelting) by game-year 25
- Convergence of the Aspects by game-year 250 *(already passing — do not regress)*
- First champion by game-year 120; five champions by game-year 500
- Sparks Beyond the Wall by game-year 500
- 130 wanderers by game-year 600, population still rising at year 1,000
- First Hextech Core by game-year 900
- Doors of Icathia between game-year 1,400 and 2,300
- No milestone gap longer than 60 game-years anywhere in Eras 0–3

---

## Appendix — harness notes, so you can discount them correctly

Three of this round's "never reached" results were partly my harness, and I
corrected them before reporting. Recording them so you can tell which findings
are about your code:

- The bot read `S.res.worship`; the game moved Worship to `S.worship` in v0.37
  when Worship left the resource menu. Fixed — the whole Solari line then fired
  (Convergence, year 159). **Not a game bug.**
- The bot ascended only at a fixed 400 Devotion against a base cap of 100. Now
  ascends at 90% of the live cap. First Ascent moved year 226 → 37.
- The bot crafted Gears down to zero Steel, starving Sparks' 200-Steel secondary
  cost. Now reserves the non-Knowledge inputs of any researchable tech. This one
  is worth a thought on your side too: Steel is simultaneously a research cost
  and a craft input with no reservation affordance in the UI.

Champion recruitment and Sparks remained unreachable after all three fixes,
which is what makes §2 a genuine finding rather than a harness artifact.
