# BUILDER SPEC v0.55 — the three resources that sit at their ceiling are the three storage never touches

Written against the **v0.54 tag**, verified from disk this session on a fresh clone: all 23
suites re-run, the 2,500-year seed-1 pacing run re-run end to end (1,495 s wall), a
per-resource cap-out instrument added and run to y1,200, and every claim below grepped
against `index.html` with comments stripped first (STANDING-RULINGS §8).

**Baseline, re-measured rather than quoted — it reproduces BUILD REPORT v0.54 §6 to the
digit:** Rites y73.9 · Sparks y149.0 · Icathia y790.2 · **Era 3 641.2** · 130 wanderers
y758.8 · peak pop 222 · morale band 61% · trades 69,930 · crystals at cap 94.8% · Hexdraulic
Plants 2 · Frostguard Cairns 12 · **23 suites, 1,098 assertions, 0 failures.**

**The round's finding is a measurement nobody has taken.** Time-at-cap, per resource, over a
1,200-game-year seed-1 run:

| resource | at cap, whole run | at cap, Era 3 only | storage multiplier it receives |
|---|---|---|---|
| **culture** | **93.8%** | **95.7%** | Scholarship line only |
| **knowledge** | **90.0%** | **89.8%** | **none — fully exempt** |
| **crystals** | **89.8%** | **95.5%** | Masonry ×12.6 |
| **renown** | **76.6%** | **69.0%** | √Masonry ×3.55 |
| **shimmer** | **64.2%** | **57.5%** | Masonry ×12.6 |
| **ore** | **56.0%** | **44.9%** | Masonry ×12.6 |
| zaunore | 33.8% | **52.6%** | Masonry ×12.6 |
| steel | 17.3% | 0.0% | Masonry ×12.6 |
| gold | 17.2% | 10.0% | Masonry ×12.6 |
| provisions | 12.3% | 7.4% | Masonry ×12.6 |
| mana | 2.6% | 0.0% | Masonry ×12.6 |
| hexore | 0.2% | 0.3% | Masonry ×12.6 |
| timber | 0.1% | 0.0% | Masonry ×12.6 |
| coalgas / voidessence / devotion / vigor | **0.0%** | 0.0% | Masonry ×12.6 / exempt |

**Two things fall out of that table and both are structural.**

**First: the three most cap-bound resources in the game are the three Masonry does not
touch.** Knowledge is exempt by ruling and sits at its ceiling 90% of the run. Culture is on
the Scholarship line and sits at 93.8%. Renown takes the square root and sits at 76.6%.
Meanwhile the twelve resources that take the full ×12.6 average **17.7%**, and five of them
are at cap essentially never.

**Second: a uniform multiplier cannot fix a distribution this unequal.** Timber is at cap
0.1% of the run and coalgas 0.0%, while ore is at 56% and Era-3 zaunore at 52.6% — all four
receive the identical ×12.6. That is not a tuning problem; it is a missing dimension.
Kittens has that dimension and RR deleted it.

**Also measured, and it changes the headline number the project has been quoting:** the fifth
Masonry Discovery, **Voidward Stores, has never been researched in a measured run** — it
costs `voidglass 8 + hexcrete 8` and voidessence is held at **0 at every milestone**. The real
stack is **×12.6**, not ×22. Every document in this project that says "≈22×" is quoting a
figure the game has never reached.

---

## Part 0 — Ground rules

### 0.1 Version discipline

**This spec produces `v0.55`.** The git tag is authoritative (STANDING-RULINGS §10). Bump the
`VERSION` constant, not the footer prose, and do not pin a literal version string in any suite
except this round's own.

### 0.2 Do not re-open

`STANDING-RULINGS.md` §§1–15 and its Appendix are closed. Nothing here reopens any of them.
In particular this round does **not** touch: Ascent, the 1.25 band, the effect-to-ratio
proportionality bound, merchant fatigue, the Convergence stripe's formula, the Sparks gate,
the `quarry` id, `catMetaTransient`, `BOOST_LIMIT`'s seven keys, `CAMP_YIELD_LIMIT`,
`poroRatio`'s unbounded shape, or `audience`.

**Verified shipped this session, part by part, from the last consumed spec
(`docs/specs/rr-analyzer-v053-spec.md`):** the reachability assertion exists and passes (43
order ids + 5 dedicated routines against 48 `BUILDINGS`, remainder empty); the crystal sink is
on the Vault at `crystals 400` inside a ratio-1.15 cost; `AUDIENCE_REOPEN_POP = 600` is at
line 3078; the tier-5 craft exists (`riftsteel`, `voidessence 150 + hexgear 375`, `tier5:
true`) **and** its repeatable consumer at `riftsteel 3 + hexcrete 40`, ratio 1.15; the
`KNOWLEDGE MULT` line now reports a **0.000%** gap at all three milestones against its <1%
target; Rites of Targon is re-based to y70 with the reason in `pacing.mjs`. Two of that
spec's pass conditions remain failing and **BUILD REPORT v0.53 §11 already reports them as
failing** — they are carried open in Parts 3 and 4 below, not re-flagged as new.

### 0.3 Corrections and carried failures the builder must not inherit

**0.3(a) — three pass conditions fail on the shipped build, and one of them is a condition
re-based *last round*.** `Rites of Targon before y70` measures **y73.9**: v0.53 Part 6 moved
the bar from 55 to 70 on the grounds that the then-current build measured y65.5 and "y70
leaves a 4.5-year margin", and one round later the margin is gone. `130 wanderers before
y600` measures y758.8. `morale 90–140 after y60` measures **61%** against ≥80%, with a run
minimum of **88** — below the band's own floor. See Part 6.

**0.3(b) — the global-production category is inert on the shipped build.** `catMonument`
reads **×1.00 at Sparks, at Hexcore and at Icathia**, because `hextechFoundry` is 0,
`arcaneReactor` is 0 and `chembarrel` is 0 at every milestone. This is v0.53 §2.3's diagnosis
still standing, with one number moved: `seenMax.hexgear` now peaks at **155.61** against the
Foundry's 200-hexgear first copy, where v0.52 measured ~51. **The Foundry is 22% short of
buildable, not 75% short.** See Part 3.

**0.3(c) — `hexdraulicPlant` reaching 2 is not the amplifier block.** BUILD REPORT v0.54 §6
records the first non-zero Plant count in the project's history. The bot's amplifier block
gates the Plant on `count("hextechFoundry") >= 3` (`simcore.mjs:494`) and the Foundry is 0, so
the two copies came through `BUILD_ORDER` (`simcore.mjs:465`) instead. **This is not a defect
and must not be flagged as one** — grepped and resolved. It does mean the gold explanation in
§6 is the right one and the amplifier path is still dead.

**0.3(d) — one documentation claim is false and one assertion cannot detect what it
asserts.** HANDOFF v0.54 §4 states `BUILD_ORDER` and `DEDICATED_ROUTINES` are "at module scope
and exported". They are declared at `simcore.mjs:441–442`, **inside `runSim`'s
`page.evaluate` callback**, and neither is exported. `test-v53`'s check 1.1 asserts "at module
scope" but tests it with `src.indexOf("const BUILD_ORDER = [")` on the file *text*, which
matches at any scope. **The reachability guard itself is real and works** — `listOf()` parses
the array from source and compares against the live `BUILDINGS` — so nothing is unprotected.
The label is wrong and the scope half of the assertion is decorative. See Part 7.1.

### 0.4 What this round is for

Era 3 is **641.2** against a **1,400–2,300** target — **758.8 short of the minimum**, and it
went the wrong way by 169.3 last round. STANDING-RULINGS §13 governs every proposal aimed at
it: **Era 3 is `Icathia − Sparks` and both edges move, so say which edge**, and **demand
lengthens Era 3 only when it is demand for something scarce.**

Part 1 is built to satisfy both clauses at once. It moves the **Icathia edge only** — nothing
in it touches an Era 0–2 gate — and it works by making four Era-3 resources genuinely scarce
rather than by adding another consumer for something already sitting at cap.

---

## Part 1 — Storage scaling: one multiplier becomes two accumulators and a scope table

This is the round's spine. It is a structural fix to an existing system: **no new Discoveries,
no new techs, no new buildings, no re-pricing and no re-gating.** Only which variable each of
the five existing Discoveries increments, and which resources each variable reaches.

### 1.1 What RR does today

`computeCaps()`, `index.html:3203–3230`:

```js
var masonryMult = 1, scholarMult = 1;
[["expandedStores", 1.75], ["ironboundStores", 1.8], ["hexRunedStores", 2],
 ["chemtechSilos", 2], ["voidwardStores", 1.75]].forEach(function (u) {
  if (S.upgrades[u[0]]) masonryMult *= u[1];
});
...
for (var rs in caps) {
  if (CAP_MULT_EXEMPT[rs]) continue;
  var line = SCHOLAR_CAPS[rs] ? scholarMult
           : (rs === "renown" ? Math.sqrt(masonryMult) : masonryMult);
  caps[rs] *= line;
}
```

`CAP_MULT_EXEMPT = { vigor: 1, knowledge: 1 }`; `SCHOLAR_CAPS = { culture: 1, devotion: 1 }`.
Seventeen resources carry a `baseCap`; after the two exemptions, the two Scholarship members
and Renown, **twelve receive an identical multiplier.** `mountainMult` (drakes) and
`POPPY_CAP_MULT` (1.08, leader) stack on top of the same set.

### 1.2 What the source does — verified verbatim this session

`js/resources.js`, `addBarnWarehouseRatio`, quoted in full:

```js
addBarnWarehouseRatio: function(effects){
	var newEffects = {};
	var barnRatio = this.game.getEffect("barnRatio");
	var warehouseRatio = 1 + this.game.getEffect("warehouseRatio");
	for (var name in effects){
		var effect = effects[name];
		if (name === "catnipMax" && this.game.workshop.get("silos").researched){
			effect *= 1 + barnRatio * 0.25;
		}
		if (name == "woodMax" || name == "mineralsMax" || name == "ironMax"){
			effect *= 1 + barnRatio;
			effect *= warehouseRatio;
		}
		if (name == "coalMax" || name == "titaniumMax" || name == "goldMax"){
			effect *= warehouseRatio;
		}
		newEffects[name] = effect;
	}
	return newEffects;
},
```

**Note the file.** `index.html:1447` cites this function as `js/buildings.js`. It is defined
in **`js/resources.js`**. Correct the citation in the same commit.

`js/workshop.js`, every upgrade carrying either effect, read directly rather than from a
summary:

| upgrade | barnRatio | warehouseRatio |
|---|---|---|
| stoneBarns | 0.75 | — |
| reinforcedBarns | 0.80 | — |
| titaniumBarns | 1.00 | — |
| alloyBarns | 1.00 | — |
| concreteBarns | 0.75 | — |
| reinforcedWarehouses | — | 0.25 |
| titaniumWarehouses | — | 0.50 |
| alloyWarehouses | — | 0.45 |
| concreteWarehouses | — | 0.35 |
| storageBunkers | — | 0.20 |
| strenghtenBuild | 0.05 | 0.05 |
| **Σ** | **4.35** | **1.80** |

Three findings the brief that prompted this round flagged as medium-confidence, now
confirmed or corrected:

1. **The totals are 4.35 and 1.80.** Fully maxed, the source delivers
   **wood/minerals/iron ×14.98**, **coal/titanium/gold ×2.80**, **catnip ×2.0875** (and only
   with Silos researched).
2. **Both accumulators are ADDITIVE and applied as `1 + Σ`.** RR's chain is
   *multiplicative* — `1.75 × 1.8 × 2 × 2 × 1.75`. That is a Kittens' Law violation on its own
   terms: **additive within a category, multiplicative between categories** (HANDOFF §2). RR
   has one category applied as if it were five. The brief did not catch this and it is the
   larger half of the defect.
3. **`addBarnWarehouseRatio` touches exactly seven effect names and nothing else.** Oil,
   uranium, unobtainium, starcharts, ivory and spice all have ceilings and all receive
   **×1.00** from the upgrade line; they are relieved by *buildings*. **The source does not
   merely differentiate strength — it exempts most of the game.** RR applies its multiplier to
   twelve resources; the source applies one to seven.

### 1.3 The mechanism

Replace `masonryMult` with two additive accumulators and a scope table:

```js
// v0.55 Part 1. Kittens' storage line is TWO accumulators, each ADDITIVE (1 + Sigma) and each
// applied with a different scope — js/resources.js addBarnWarehouseRatio, quoted in the spec.
// barnRatio sums to 4.35 across six workshop upgrades, warehouseRatio to 1.80 across six.
// wood/minerals/iron take BOTH (x14.98); coal/titanium/gold take warehouse only (x2.80);
// catnip takes a QUARTER of barn and only after Silos (x2.0875); everything else takes NOTHING.
// RR had one MULTIPLICATIVE chain applied uniformly to twelve resources, which is a
// Kittens'-Law violation (additive within a category) on top of a scope error.
var STORAGE_LINE = [
  ["expandedStores",  { storehouse: 0.80, warehouse: 0.25 }],
  ["ironboundStores", { storehouse: 0.75, warehouse: 0.50 }],
  ["hexRunedStores",  { storehouse: 1.00, warehouse: 0.45 }],
  ["chemtechSilos",   { storehouse: 1.00, warehouse: 0.35 }],
  ["voidwardStores",  { storehouse: 0.75, warehouse: 0.25 }]
];   // Sigma storehouse 4.30 -> x5.30 (source 4.35 -> x5.35); Sigma warehouse 1.80 -> x2.80 (source 1.80)
```

Both tracks fed by all five Discoveries with different weights is **source-sanctioned** —
Kittens' own `strenghtenBuild` carries both. It also means **no Discovery is re-priced,
re-gated or reordered**, which is the constraint this fix was asked to work under.

Fully stacked: **storehouse ×5.30** against the source's ×5.35, **warehouse ×2.80** against
the source's ×2.80. The narrow tier lands at **×14.84** against the source's ×14.98.

### 1.4 The scope table — assigned by role and by measurement, not by name

**The mechanism is ported from source; the assignment is not.** Transliterating Kittens'
resource *names* onto RR is the exact error v0.52 Part 1.2 fixed when it moved the Aqueduct's
0.03 off the Farmstead — right figure, wrong building. RR splits some Kittens resources in
two and has two eras' worth of others, so the mapping is a judgement and is stated as one.

| tier | multiplier | RR resources | why |
|---|---|---|---|
| **narrow** — both tracks | **×14.84** | `timber`, `ore`, `steel` | Kittens' wood / minerals / iron, member for member. RR's early bulk trio: timber is wood, ore is the Stone Slab input at 200 against the source's 250, steel is the first smelted metal. These carry Eras 0–2 and feed every craft chain; keeping them near today's level is what stops this round regressing the early game. Measured today: ore **56.0%** at cap, steel 17.3%, timber 0.1%. |
| **broad** — warehouse only | **×2.80** | `gold`, `coalgas`, `hexore` | Kittens' coal / titanium / gold, member for member. Coalgas is coal — the fuel that is useless alone and gates the best metal tier (`era3_regional_crafting_spec_2.md` §2). Hexore is the late valuable mineral. Gold is gold, and it stays on the weak track **despite being visible from turn one**, because the source keeps it there: it is a currency, not bulk. Measured today: gold 17.2%, coalgas **0.0%**, hexore **0.2%**. |
| **quarter, gated** | **×2.075** | `mana`, `provisions` | Kittens' catnip, which RR splits in two: provisions is the food half (the settlement eats a measured 8.5/s at pop 20) and mana is the refine-to-timber half — *Transmute Mana → Timber* is *Refine Catnip → Wood*, per the project's own mapping. Gate the clause on **Chemtech Silos**, the Discovery that already carries the source's name for it. Measured today: mana **2.6%**, provisions 12.3% — the two most over-provisioned resources in the game. |
| **none** | **×1.00** | `zaunore`, `shimmer`, `voidessence`, `crystals` | The source gives oil, uranium, unobtainium and starcharts **nothing** from the upgrade line and relieves them with buildings. RR already has those buildings: The Vault (`zaunore 900 / coalgas 750 / hexore 840`), the Hexcrete Bastion (`zaunore/coalgas/hexore 750, shimmer 180, voidessence 45`), the Shimmer Refinery (`shimmer 60`), the Hexgate (`crystals 400`), the Rift Anchor (`crystals 900, voidessence 400`). **This is the change that makes them load-bearing** — which is what `era3_regional_crafting_spec_2.md` §3 designed The Vault to be, and §1's stated intent that the three Zaun raws "feel cap-constrained on raw materials before they can even get to crafting in bulk." |

**The one assignment that is genuinely arguable, stated as such: `zaunore`.** By craft mapping
it is iron (*Zaun Ore → Iron Plating* is *Iron → Plate*) and iron is narrow-tier. By role it
is an Era-3 autoprod raw with a dedicated storage building, which is what the source does with
oil and uranium, not with iron. **Era wins over name here**, for three reasons: RR's own Era-3
spec asks for exactly this pressure; RR already has `ore` occupying the early minerals/iron
slot; and it is the assignment the pacing goal needs. If the builder disagrees after
measuring, say so with the number rather than moving it quietly.

**Unchanged, and assert that they are:** `CAP_MULT_EXEMPT = { vigor: 1, knowledge: 1 }`
(knowledge for the v0.45 Part 5 reason, vigor because Kittens' manpower is absent from
`addBarnWarehouseRatio`'s list — two exemptions, two different sources, do not merge them);
`SCHOLAR_CAPS = { culture: 1, devotion: 1 }` on the Scholarship line; `mountainMult` and
`POPPY_CAP_MULT` scoped exactly as today.

### 1.5 Renown — ruling: keep it on the square root of the full product

The open question was whether Renown should dampen off the broad track alone. **It should not.**
Renown has no Kittens counterpart at all, so there is nothing to port; the dampening exists
for a stated RR reason — v0.44 Part 2.2, *"so the ceiling rises with the era without inheriting
all ~22× of it"* — and that reason is unchanged. And the measurement forbids cutting it:
**Renown is at cap 76.6% of the run and 69.0% of Era 3.** Moving it to `√2.80 = ×1.67` from
today's `√12.6 = ×3.55` would tighten the fourth-most-bound ceiling in the game for no
source-derived reason.

Key it to **`Math.sqrt(storehouseMult × warehouseMult)`** = √14.84 = **×3.85** fully stacked,
against today's √22.05 = ×4.70 theoretical and ×3.55 measured. Intent preserved, behaviour
essentially unmoved, and the reason recorded at the line.

### 1.6 The compensating building caps — sized by measurement, not guessed

Dropping four resources from ×12.6 to ×1.00 is the largest single cap change this project has
made. Two of them are already biting: **shimmer 57.5% and zaunore 52.6% at cap in Era 3.**
Left uncompensated they would sit at their ceilings permanently, and "Era 3 got longer because
production stopped" is not the same result as "Era 3 got longer."

**The rule, and it is the brief's rule and it is right: if cap-out becomes oppressive, raise
the Vault's and the Hexcrete Bastion's own `caps: {}` — never reflate the multiplier.**
Reflating would restore precisely the defect this Part exists to remove.

- Measure Era-3 cap-out on the Part 1 build **before** setting any building number.
- Raise per-copy caps on **The Vault** and the **Hexcrete Bastion** — and only those two —
  until the four "none"-tier resources land inside a **30–60% Era-3 cap-out band**. Not zero:
  the pressure is the point. Not 90%: that is a stalled era, not a long one.
- At Icathia the run measures **Vault 22** and **Hexcrete Bastion 17** copies. Size against
  those counts and **state the counts you sized against**, as v0.52 §3.2 stated its 20 copies.
- `coalgas` and `hexore` sit at **0.0% and 0.2%** today under the full multiplier. On the
  broad track at ×2.80 they should begin to bite for the first time. **That is the era spec's
  stated intent being delivered, not a regression** — report it as such.

### 1.7 Pass conditions

1. `masonryMult` **does not exist**; two additive accumulators do, asserted on comment-stripped
   source with `test-v53`'s `strip()` helper.
2. The five Discoveries are **unchanged in cost, tech and order** — asserted field by field.
3. Fully-stacked multipliers measure **storehouse ×5.30, warehouse ×2.80, narrow ×14.84,
   broad ×2.80, quarter ×2.075, none ×1.00**, each to 1e-9.
4. The quarter clause is **inert until Chemtech Silos is researched**, asserted at both states.
5. `CAP_MULT_EXEMPT` and `SCHOLAR_CAPS` are **unchanged**, asserted by content.
6. Renown measures **√(narrow product)**.
7. Every resource with a `baseCap` appears in **exactly one** tier, asserted by enumeration —
   the same shape as v0.53's reachability assertion, so a resource added later cannot silently
   fall through to a default.
8. Era-3 cap-out for `zaunore`, `coalgas`, `hexore`, `shimmer` lands in **30–60%**.
9. **No starvation regression**: provisions cap falls ~6×, so assert deaths-from-starvation and
   the Deepwinter trough are no worse than the Part 0 build.
10. `auditCostGraph()` / `auditRawGraph()` return **0 / 0**.
11. The `js/buildings.js` → `js/resources.js` citation at `index.html:1447` is corrected.

### 1.8 Predicted vs measured, stated before the run

> **Prediction: Era 3 lengthens by 150–350 game-years, entirely on the Icathia edge. Sparks
> moves by less than 10 years in either direction.** Nothing in Part 1 touches an Era 0–2 gate;
> the four "none"-tier resources are all gated at `sparks` or later. If **Sparks** moves more
> than 10 years, the tier assignment is reaching into Era 2 and the table is wrong.
>
> **Secondary predictions:** `voidwardStores` is researched for the first time in a measured
> run (voidessence stops being the binding input once the Bastion is worth buying). Vault and
> Hexcrete Bastion counts **rise by 50–150%**. Crystal spend as a share of income rises from
> **18.9%** toward v0.53's 40–70% target without a single price changing, because a ×1.00
> crystal ceiling makes the Vault's `crystals 400` bite at a lower stock.
>
> **The informative failure:** if Era 3 lengthens but the four raws sit above 60% cap-out, the
> length was bought by stalling production and Part 1.6's compensation was undersized. Report
> that rather than the length.

---

## Part 2 — The knowledge ceiling, and why its exemption is now partly expired

**Knowledge is at cap 90.0% of the run and 89.8% of Era 3 — the second-most cap-bound resource
in the game, and the only one that receives no multiplier from anything.**

That exemption is correct and sourced, and this Part does **not** propose removing it.
`index.html:1439–1449` records the reason: RR's knowledge ceiling is Σ(building `scienceMax`)
plus the clamped Morellonomicon term and nothing else, exactly as Kittens does it — **and**
that Kittens' one multiplicative science-cap line, `libraryRatio`, was excluded because its
three feeding upgrades are gated on titanium, unobtainium and eludium, *"entirely outside RR's
era window."*

**That justification has partly expired, and v0.53 is what expired it.** RR now has a
`voidessence` (unobtainium) resource and a `riftsteel` tier-5 craft (eludium) in code. The
source, re-verified this session, `js/buildings.js`:

```js
effects["scienceMax"] *= (1 + game.bld.get("observatory").on * libraryRatio);
```

fed by three workshop upgrades at 0.02 each — worth **×2.50 at 25 Observatories**, as
`index.html:1441` already records. The shipped run holds **53 Observatories at Icathia**.

**This Part is conditional on Part 4 and must not ship before it.** Riftsteel has never been
forged; an eludium-gated upgrade behind a craft the bot cannot make is a second inert tier, and
v0.53 shipped one of those already.

- **If Part 4 lands and Riftsteel is forged:** port `libraryRatio` as a *scoped* line — an
  Observatory-count multiplier on the Archive's `knowledge` cap only, fed by upgrades gated on
  `voidessence` and `riftsteel`, at the source's 0.02 per upgrade. Knowledge stays out of
  `CAP_MULT_EXEMPT`; this is a building-effect line, not a storage line, exactly as in source.
- **If Part 4 does not land:** action this as a **measurement and a dated placement**, not
  code. Report the knowledge ceiling and time-at-cap at all three milestones and date the port
  to v0.56. Do not ship the upgrades inert.

**Pass condition either way:** the 90.0% figure is re-measured and reported, and
`CAP_MULT_EXEMPT` still contains `knowledge` and `vigor` and nothing else.

---

## Part 3 — The global-production category is inert, and the Foundry is now 22% short

`catMonument` measures **×1.00 at Sparks, Hexcore and Icathia**: `hextechFoundry` 0,
`arcaneReactor` 0, `chembarrel` 0. v0.53 §2.3 diagnosed the mechanism and BUILD REPORT v0.53
§11 reported the pass condition as failing; this is **carried open, not newly discovered.**

What is new is the size of the gap. `seenMax.hexgear` peaks at **155.61** against the
Foundry's `hexgear 200` first copy — v0.52 measured ~51. The starvation is three-quarters
closed by v0.53's propagation work.

- **Do not cut the Foundry's price.** The finding is about the bot's stock-versus-flow
  behaviour, not the economy, and cutting the price would hide it.
- Ship **the Chembarrel / save-for-a-visible-building fix**, dated to this round by
  `docs/analyzer-status.md` and untouched by v0.54: `manageBuildings()` runs before
  `manageCrafts()`, so a building priced in a contested intermediate is never affordable at the
  instant it is tested. This is the same defect for the Foundry, the Chembarrel and the
  Hexdraulic Plant's amplifier path.
- Pass conditions: `hextechFoundry` at Icathia **> 0**; `chembarrel` **> 0**; `catMonument` at
  Icathia **> ×1.00**, reported with its parts.
- **Prediction: this ADDS production and shortens Era 3 by 40–120 years on its own slice.** It
  is in this round because an inert category cannot be reasoned about, not because it helps the
  headline. Slice it separately so Part 1's movement stays attributable.

---

## Part 4 — Riftsteel, voidessence, and the craft-depth tie-break

Dated to v0.54 by `docs/analyzer-status.md` and not actioned. The measurement is worse than
the schedule implies — **two** of v0.53 Part 4's monotonicity pass conditions fail on the
shipped build, not one:

```
crystals     first 36040.4  last 244244.7   monotonic-increasing: no  (pass)
voidessence  first 0        last 70124.8    monotonic-increasing: YES (FAIL)
riftsteel    first 0        last 0          monotonic-increasing: YES (FAIL)
```

Voidessence is held at **0 at every milestone**, then accumulates to 70,124 after Icathia with
no consumer — which is also why `voidwardStores`, the fifth Masonry Discovery, has never been
researched.

- `hexcore` and `riftsteel` are both at craft-tree depth 2; the deepest-first sort does not
  order them and Cores eat every Hexgear before 375 can accumulate. **Prefer the craft that is
  a direct component of a visible building.** One line, and it needs its own slice.
- Pass conditions: `riftsteel` **forged at least once**; `riftAnchor` count at end of run
  **> 0**; **neither** `voidessence` nor `riftsteel` monotonically increasing after Icathia.
- Report the Foundry interaction: both fixes compete for Hexgear, and Part 3 and Part 4
  together will move `seenMax.hexgear` in opposite directions.

---

## Part 5 — The Poro Pasture's two remaining divergences

BUILD REPORT v0.54 §5 directive 13 fixed production only and referred both of these to the
analyzer. Source re-verified this session, `js/buildings.js`, `unicornPasture` quoted in full:

```js
prices: [ { name: "unicorns", val: 2 } ],
priceRatio: 1.75,
effects: { "catnipDemandRatio": -0.0015, "unicornsPerTickBase": 0.001, "unicornsMax": 0 }
```

RR: `cost: { poros: 5 }`, **ratio 1.15**, `eatCut` **0.003**.

**Ruling: ship the priceRatio, hold the eatCut, and here is why they are different cases.**

- **`priceRatio` 1.15 → 1.75.** Kittens assigns `priceRatio` by what a building *is*
  (STANDING-RULINGS §2), and this is the same building. At ×5 production the price ratio is
  now the term that decides how many the player owns; the run holds **60 Pastures** and
  **505,505 poros**. Ship it.
- **`eatCut` 0.003 vs `catnipDemandRatio` −0.0015 — hold and report.** RR is exactly 2× the
  source, but RR's `eatCut` runs through `limitedDR` with a measured linearity of 0.325 while
  the source's is unbounded, so per-copy figures are not comparable without a delivered-effect
  measurement. **Measure the delivered eat reduction at 5 / 50 / 500 copies with
  `enhance-audit` and rule from that**, not from the per-copy number. Halving a bounded term
  to match an unbounded one is the kind of name-matching this project has already been burned
  by twice.
- Pass condition: Pasture count at Icathia reported before and after; poro production and the
  `poroRatio` ladder depth reported, since directive 13 doubled Frostguard Cairns to 12 and
  this pulls the other way.

---

## Part 6 — Three failing pass conditions, one of them re-based last round

| condition | target | measured | note |
|---|---|---|---|
| Rites of Targon | before **y70** | **y73.9** | re-based from y55 in v0.53 on a y65.5 measurement; the 4.5-year margin is gone in one round |
| 130 wanderers | before y600 | **y758.8** | failing for four consecutive rounds |
| morale 90–140 after y60 | ≥ 80% | **61%** | run minimum **88**, below the band floor; at 100+ wanderers the average is **95.6** |

Also unreported anywhere and failing: **Convergence at Sparks measures 2.33% against its
5–8% target**, down from 5.4% at v0.52. It is printed by `pacing.mjs` and is not in the
pass-condition list, so nothing catches it. **Add it to the list** — a target with no
condition attached is not a target.

- **The morale round is dated here** by `docs/analyzer-status.md` ("v0.54 or v0.55") and it is
  now the largest single failing condition. `MORALE_RELIEF_LIMIT` saturates at **77.7%** at
  Icathia while peak population has finally moved off 200 to **222**, so the relief ceiling is
  binding exactly as population starts to grow. Diagnose the saturation before proposing a
  number.
- **Rule on Rites of Targon rather than re-basing it a second time.** A condition re-based once
  and failed immediately is either measuring something real about the early game or it is not a
  condition. Both answers are acceptable; a third re-base is not.

---

## Part 7 — Apparatus and schedule

### 7.1 The `BUILD_ORDER` scope claim

Per 0.3(d): move both constants to genuine module scope and **export** them, then have
`test-v53`'s check 1.1 `import` them rather than regex the file — so the assertion tests what
its own message claims. The reachability check itself is correct and must not be weakened
while doing this.

### 7.2 The trade-banking policy

Dated to "the next spec round's first slice" by HANDOFF v0.54 §7.3, and this is that round.
**Ship it or re-date it with a reason — do not carry it silently a third time.** The gap it
describes is now larger than when it was written: at Icathia the bot could run **150.33
trades a game-year** and runs **0.05**. If it is deferred again, the reason must be stated, and
the reason cannot be "the round was busy" for the third consecutive round.

### 7.3 Instrument before launching

The per-resource cap-out instrument used to produce this spec's headline table does not exist
in `simcore.mjs`. **Add it before the first 2,500-year run**: time-at-cap per capped resource,
whole-run and Era-3-only, plus final caps. Part 1 cannot be evaluated without it, and it is
four lines in the tick block plus one in the return.

---

## Part 8 — Order, discipline, pass conditions

### Order — five cumulative prefixes, snapshotted forward from the shipped file

1. **Part 7.3 + Part 1 alone** — the instrument, then the storage restructure with its
   compensating building caps. The round's largest unknown and the only Part aimed at the
   headline. Its own slice.
2. **Part 3** — the Chembarrel / save-for-a-visible-building fix. Adds production; must not be
   mixed with Part 1.
3. **Part 4** — the craft-depth tie-break.
4. **Part 2** — `libraryRatio`, only if Part 4 landed.
5. **Everything else** — Parts 5, 6, 7.1, 7.2.

Snapshot `index.html` and `sim/simcore.mjs` after each slice, into `snapshots/`, the way v0.53
did. Do not reverse-patch.

### Operational

Kill background runs by PID from `ps -eo pid,args`. Size every `sleep` under the tool timeout.
Strip comments before grepping — use `test-v53`'s `strip()`. Never run `playwright install`;
`chromium.launch({ executablePath: "/opt/pw-browsers/chromium" })` with a fallback.
`test-v32` flakes under CPU contention (HANDOFF §8.6) — re-run it on an idle box before
treating a failure as a defect. **A 2,500-year seed-1 run measured 1,495 s wall this session
with one other job on a 2-core box**; plan on ~25–35 minutes each.

### Round pass conditions

| # | Condition | Target |
|---|---|---|
| 1 | `masonryMult` absent; two additive accumulators present | asserted on stripped source |
| 2 | The five Discoveries' cost, tech and order | **unchanged**, field by field |
| 3 | Fully-stacked multipliers | 5.30 / 2.80 / 14.84 / 2.80 / 2.075 / 1.00 to 1e-9 |
| 4 | Every `baseCap` resource in exactly one tier | asserted by enumeration |
| 5 | `CAP_MULT_EXEMPT`, `SCHOLAR_CAPS` | unchanged, asserted by content |
| 6 | Era-3 cap-out: zaunore / coalgas / hexore / shimmer | **30–60%** each |
| 7 | Starvation and the Deepwinter trough | no worse than the Part 0 build |
| 8 | `hextechFoundry` and `chembarrel` at Icathia | **> 0**; `catMonument` **> ×1.00** |
| 9 | `riftsteel` forged; `riftAnchor` at end | **> 0**; voidessence not monotonic |
| 10 | `voidwardStores` researched in the run | **yes** (secondary prediction) |
| 11 | Poro Pasture `priceRatio` | **1.75**, with counts before/after |
| 12 | `eatCut` delivered effect at 5 / 50 / 500 | **measured and ruled**, not name-matched |
| 13 | Convergence at Sparks | added to the pass-condition list |
| 14 | Rites of Targon / 130 wanderers / morale band | each moved **or ruled**, not re-based again |
| 15 | Trade-banking policy | shipped, or re-dated **with a reason** |
| 16 | `BUILD_ORDER` exported; `test-v53` 1.1 imports it | asserted by import, not regex |
| 17 | `auditCostGraph()` / `auditRawGraph()` | 0 / 0 |
| 18 | Science parity, `BOOST_LIMIT`, tech ladder | unchanged: ×20.8000, seven keys, 37 techs |
| 19 | Era 3 length | reported **per slice** against 641.2 and against 1,400–2,300 |
| 20 | Every Part above | actioned, or its non-action explicitly justified |

### Predicted vs measured — on the record, before any run

| slice | Era 3 | Icathia | Sparks |
|---|---|---|---|
| v0.54 baseline (re-measured) | **641.2** | y790.2 | y149.0 |
| s1: + storage restructure | **791–991** | +150 to +350 | **within ±10 of y149** |
| s2: + the Chembarrel fix | s1 **−40 to −120** | earlier | unmoved |
| s3: + the craft-depth tie-break | s2 **+20 to +100** | later | unmoved |
| s4/s5: + the remainder | — | — | — |
| **shipped** | **750–1,000** | — | — |

**This round does not claim it will reach 1,400.** Storage scope is a structural correction
that happens to point the right way, not a lever sized to close a 758.8-year gap. If s1 lands
inside 791–991 **with Sparks unmoved**, the scope thesis is confirmed and the v0.56 spine is
the Freljord rungs 5 and 6 plus a second scarcity pass. If s1 lengthens Era 3 but **Sparks
also moves**, the tier assignment reached into Era 2 and Part 1.4's table is what needs
revising — not the multiplier values.

---

## Sources, all read this session

**Kittens** (`github.com/nuclear-unicorn/kittensgame`, raw source):
`js/resources.js` — **`addBarnWarehouseRatio` quoted verbatim above**; seven effect names
touched and no others. `js/workshop.js` — the eleven upgrades carrying `barnRatio` /
`warehouseRatio` with their exact values, **Σ 4.35 and Σ 1.80**; `crafts` array for the tier
scale. `js/buildings.js` — `effects["scienceMax"] *= (1 + observatory.on * libraryRatio)`;
`unicornPasture` quoted in full (`unicorns 2`, **priceRatio 1.75**, `catnipDemandRatio
−0.0015`, `unicornsPerTickBase 0.001`). `claude/kittens-game-reference.md` — the standing
"flag conscious departures" practice, and the Alloy→Eludium tier.

**RR**, at the v0.54 tag, comment-stripped: `computeCaps()` 3195–3245 (the masonry loop, the
Renown √, `mountainMult`, `POPPY_CAP_MULT`); `SCHOLAR_LINE` 1309, `SCHOLAR_CAPS` 1438,
`CAP_MULT_EXEMPT` 1450 with the v0.45 Part 5 justification at 1439–1449; the five Masonry
Discoveries 1336–1350; `RES` (17 of 43 resources carry a `baseCap`); The Vault 394–398, the
Hexcrete Bastion 476–480, the Harbor 238–240, the Warehouse 233–235; `riftsteel` craft 4086
and its consumer 518; `AUDIENCE_REOPEN_POP` 3078. `sim/simcore.mjs` — `BUILD_ORDER` /
`DEDICATED_ROUTINES` 441–442 (function scope, not module scope), the amplifier gate 493–494,
`BUILD_ORDER` at 465. `tests/test-v53.mjs` 40–55 (`listOf()` regex).
`era3_regional_crafting_spec_2.md` §1 and §3 — the Zaun raws are meant to be cap-constrained
and The Vault is meant to be the relief.

**Measurements taken this session:** all 23 suites (1,098 assertions, 0 failures); the
2,500-year seed-1 pacing run (1,495 s wall, reproducing BUILD REPORT v0.54 §6 exactly); a
1,200-game-year run with per-resource cap-out instrumentation added to a copy of
`simcore.mjs`, which produced the headline table and the `voidwardStores`-never-researched
finding.
