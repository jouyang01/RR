# BUILD REPORT v0.62 — the knee audit nobody had run, a ceiling withdrawn, and the ledger finished

Built against the `v0.61` tag from `docs/specs/rr-analyzer-v062-spec.md`, plus Jerry's dev note on
discovery knowledge costs. **Twelve dev notes from the previous round and four follow-ups.**

---

## 1. Part 2 — two families are throwing most of their stack away, and the player is told otherwise

`limitedDR(x, L)` is **linear only below 0.75·L**. v0.61 found the mana line sitting exactly on
that knee and nobody had asked the same question of the other six families. Measured on a fully
maxed state:

| family | L | knee | raw Σ | delivered | % of knee | thrown away |
|---|---|---|---|---|---|---|
| **vigor** | 1.0 | 0.750 | **4.581** | 0.985 | **611%** | **78.5%** |
| **devotion** | 2.0 | 1.500 | **4.024** | 1.917 | **268%** | **52.4%** |
| mana | 1.0 | 0.750 | 1.215 | 0.913 | 162% | 24.9% |
| provisions | 1.5 | 1.125 | 1.000 | 1.000 | 88.9% | 0% |
| **crystals** | 2.0 | 1.500 | **1.4999** | 1.4999 | **100.0%** | 0% |
| gold | 1.5 | 1.125 | 1.031 | 1.031 | 91.6% | 0% |
| culture | 2.0 | 1.500 | 0.387 | 0.387 | 25.8% | 0% |

**A player who buys a +25% vigor upgrade receives about +0.4%.** Devotion discards more than half.
**This is v0.61 §7.1's mana finding three times over, in families nobody was looking at.**

**And crystals is 0.0001 from its knee** — tighter than the analyzer's own 0.006 estimate. **The
next crystal boost of any size, however small, is the first that will not pay in full.**
`test-v62` asserts Σ ≥ 1.49 against knee 1.50, so the next round that adds one trips a test rather
than a player.

**No `BOOST_LIMIT` value moved.** Every one was chosen long ago against a stack that has since
grown past it; raising a cap is a large production change and §16 makes it Jerry's.

### 1.1 The part that reaches a player

The effect strings could not carry a live figure: `effect:` is evaluated while the `UPGRADES`
array literal is built, before `S` exists, which is why v0.61's `petriciteResonators` could only
state its ceiling in prose. **`boostDeliveryLine()` runs at RENDER time instead**, from the
tooltip, where the state is real — and it reports the **marginal** delivery, what *this* purchase
adds on top of what is already held, because that is what the button is promising:

> **ADVERTISED +25%, DELIVERS +0.7%.** The devotion boost line already sums to +402% against a
> +200% ceiling, so 97% of this one is absorbed by diminishing returns.

The seven families and every member's delivered fraction print at all four milestones beside
`convMultBreakdown()`, and each family has a ledger row recording its raw Σ, cap and loss.

---

## 2. Part 1 — the ceiling v0.61 shipped rested on a loop the source also has

v0.61 §5.2 called the Demacia → Piltover → transmute cycle *"an unbounded resource loop"* and
shipped `TRADE_YIELD_LIMIT = 3.0`, **a ceiling the source does not have**, to contain it. The
analyzer caught the error and it is worth stating plainly: **that reasoning was wrong.**

**Kittens has the same cycles.** Lizards buy minerals and sell wood; sharks buy iron and sell
catnip; nagas sell minerals; griffins sell iron. And it ships **exactly one craft whose output is
a base resource — `wood ← catnip`** — which is RR's transmute precisely.

**What bounds the source's loops is a per-trade tax in resources the cycle does not produce.**
`js/diplomacy.js:10–11` — `baseGoldCost: 15`, `baseManpowerCost: 50` — deducted **flat** at
`:885–886`, while only the race's `buys` resource scales with `getTradeVolume()` and only the
*yield* scales with `tradeRatio`.

**RR already had the identical guard and nobody had costed it. Measured this round:**

| milestone | gold income | trades by gold | vigor income | trades by vigor | **sustainable** | bound by |
|---|---|---|---|---|---|---|
| Sparks | 840/game-year | 15.8 | 2,104/game-year | 15.6 | **15.6** | **vigor** |
| Hexcore | 4,048 | 76.4 | 6,361 | 47.1 | **47.1** | **vigor** |

**The guard binds hard at every milestone**, so the ceiling is removed and the source's uncapped
additive form ships — which is what dev note 8 asked for at v0.61 and what that round deviated
from. The spec predicted the guard would bind; **it does.**

**The correction that follows:** *G > 1* means **timber stops being a constraint** and sits at its
ceiling. Timber is a capped resource. **It does not mean unbounded resources, and v0.61's report
should not have said so.** `test-v41`'s guard is re-pointed onto the tax-limited rate, which is
the thing that actually bounds the cycle.

**If a future round finds the guard has stopped binding, the fix belongs to the TAX** — raise the
per-trade gold or vigor — **not to the yield.** That is the source's own lever.

---

## 3. Part 3 — the Storehouse was already right; the Warehouse had it backwards

Jerry's reading of the source is exact. Kittens per copy (`js/buildings.js:758–940`), warehouse
against barn: **wood ×0.75, minerals ×0.80, coal ×0.50, iron ×0.50, gold ×0.50** — and titanium
×5.00, the one late metal the warehouse wins. **The source's warehouse is smaller than its barn on
every shared material**, and the price shape is his argument: the barn costs raw wood, the
warehouse costs crafted beam and slab.

**RR's Storehouse copies the barn value for value** — provisions 5,000 / timber 200 / ore 250 /
gold 10 against catnip 5,000 / wood 200 / minerals 250 / gold 10. **Exact parity, and it does not
move.**

| | now | **shipped** | from |
|---|---|---|---|
| Warehouse timber | 400 (**×2.00**) | **150** | 0.75 × 200, the source's wood ratio |
| Warehouse ore | 300 (×1.20) | **200** | 0.80 × 250, the source's minerals ratio |
| Warehouse gold | 80 (**×8.00**) | **5** | 0.50 × 10, the source's gold ratio |
| Warehouse steel | 100 | **kept** | Steel has no Storehouse figure to take a ratio from, and the source's warehouse **wins** on the late metal (titanium ×5.00). **Steel is RR's late metal — keeping it is the source's own shape**, argued in the ledger rather than left a silent survivor. |
| Harbor ore | 500 | **950** | the source's harbor figure directly |
| Harbor gold | 200 (**×8.00**) | **25** | the source's harbor figure directly |

The Harbor's other three already matched exactly (`provisions 2,500 / timber 700 / steel 150`
against `catnip 2,500 / wood 700 / iron 150`) and are untouched.

**This is the round's largest single pacing term** and it is a large storage cut at any settlement
holding many Warehouses.

---

## 4. Part 4 — four balance notes, one of them decided by its own measurement

### 4.1 The Shrine rate — the conditional branch fired

The spec made this conditional: ship 0.5 → 0.25 **only if** the shrine term exceeds half of total
morale. **Measured at 40 Shrines, altar tier 0, pop 200: 79.2%.** The branch is taken.

**The threshold has to be read from the counterfactual, not from the shipped state**, because the
cut lowers the very term the threshold is measured from — the same fixture reads **40.0% after**.
`test-v62` computes the pre-cut share from `limitedDR` at the old rate and asserts the branch
against that; measuring after the change would have been circular and would have "proved" the
branch should not have been taken.

**Jerry's worst case could not have happened either way**: `MORALE_SHRINE_LIMIT` is 25, so the
term asymptotes at +25 morale however many Shrines are built. **What the note is really about is
the knee** — at 0.5 the first **37 Shrines** paid in full and at tier 5 only **18** did; at 0.25
the linear region reaches **75**, so an Altar tier is worth something for far longer.

### 4.2 The fourth mana rung is deleted, one round after it shipped

`petriciteResonators` came in at v0.61 on Jerry's own dev note 3 and goes out at v0.62 on his dev
note 2. **Both notes are cited, in the code and in the ledger** — a reversal that does not name
what it reverses reads to a later round as a mistake being corrected rather than a decision being
remade.

**`boosts.mana` returns to Σ 0.75 across three members, which is exactly the knee**, so all three
deliver in full again and v0.61 §7.1's half-paid rung disappears with the member that caused it.
**Mana now sits precisely ON its knee** — it joins crystals as a family where the next addition is
the first that will not pay.

§30: the id is reserved to v1.0 and **a save holding it is refunded** its 400 crystals and 25
petricite blocks, because the player paid for a Discovery that no longer exists.

### 4.3 The festival's provisions cost — the second instance of one bug shape

`festivalCost()` returned `provisions: 60 × pop`. **Population plateaus near 200 (§27's band);
the provisions ceiling grows ×11.3 from Sparks to Icathia.** So the festival cost 15% of the
ceiling at Sparks and **1.3% at Icathia — it stopped being a cost exactly when the player could
hold the most.**

**This is the same defect v0.61 Part 6.3 found in the trade provisions cost, and naming it as a
recurring shape is the point.** Both were prices denominated in something that plateaus, measured
against a ceiling that does not.

Shipped as `FESTIVAL_PROVISION_PCT × computeCaps().provisions` at **0.15**, which reproduces
today's figure at Sparks by construction and **holds that bite for the rest of the run.** The
culture and vigor lines stay per-head: v0.58.1 note 1 made them per-head deliberately and those
ceilings do not run away.

### 4.4 Marus Omegnum

Cap **500 → 200** as directed. For the rate the note says "reduce" without a figure, so it is
taken from the source: **Kittens' Temple is `faithPerTickBase 0.0015` = 0.0075/s and RR's Shrine
sits at that figure exactly**, so Marus at 0.05/s was **6.7× one Shrine**. RR's faith curve runs
Shrine → Chapel → Sanctum → Marus, so **a top tier at ×4 a Shrine = 0.03/s** keeps the ladder's
shape and is a 40% cut. **This reaches `catReligion` through worship** — Convergence at its unlock
is reported in §11.

---

## 5. Part 5 — and dev note 4 turned out to need nothing built

**5.1 — VERIFY BEFORE BUILDING, and the verification says the note is already satisfied.**
`runExpeditionBulk` **loops `runExpedition(id)` n times.** Each hunt therefore rolls its own
`SHACO_REFUND_CHANCE` independently, so a ×5 hunt already refunds 0–5 fifths — exactly the spread
Jerry describes. **Nothing is built.** `test-v62` asserts the distribution over **400 batches of
five**, not a single roll, and it spans more than one outcome as `Binomial(5, 0.20)` requires.

**5.2** — Noxus plumes 120 → 100. Plumes are both a luxury and a hunt yield, so this loosens a
limiter on two economies.

**5.3** — the Rift Scuttler had **no charge test at all**; it fired on `rerollHit("hunt") < 0.3`
on every Raptor hunt. Gated on `campEmpowered`. **The 0.3 probability is kept deliberately** —
gating already cuts the spawn rate to the charge cadence, and changing both would make the
measurement unreadable.

**5.4** — the Gromp pays **honeyfruit on a charge run** instead of a stray poro, gated the same
way so both charge camps read identically, and it pays the honeyfruit event's own grant rather
than inventing a second one. **The yield line moved in the same edit** — a stale description is
how v0.59's tooltip and payout came to disagree.

---

## 6. Part 6 — five presentation notes, two of them new banner states

**6.1** — the morale tooltip's *"Poros and True Ice are Freljord materials, and pay no morale"* is
cut. It documented a v0.40 change to a reader who never saw the old behaviour.

**6.2** — the festival tooltip lists the 25 renown v0.61 added and never advertised, **read from
the constant** and gated on Call to Arms because `gainRenown()` is. **This is the third round
running in which a payout shipped without its tooltip.**

**6.3 — the Targon banner, and the correction matters.** There were **two** pale objects and the
first reading conflated them. The **crescent** at `(212, 26)` radius 11 is Jerry's own v0.58.1
note 37 and is **untouched**, with its comment left in place as the live reason it exists. What
the note is about is **an 8×4 filled `PAL.text` rectangle sitting directly above the summit** — a
flat rectangle at this resolution, which is exactly why it read as a square moon. **Deleted**, and
a golden **halo** drawn in its place as pixels, the way the crescent is. **Its phase runs at
`f × 0.17` against the light shaft's `f × 0.3` — a different RATE, not merely an offset**, so the
two never lock and strobe.

**6.4 / 6.5 — the two Crest states, and they are asserted BY READING THE CANVAS.** Crest of
Cinders puts a faint red glow behind the anvil and hammer; Crest of Insight floats blue motes
around the lore shelves and lamps. Both read `simNow() < S.xUntil`, the same expression the rest
of the file uses. **Both are verified by holding the buff, reading the canvas, expiring it and
reading again — never by grepping for the branch, which is precisely how v0.61 §3's festival chip
passed for two rounds while never firing.**

**THE LAYER IS A DELIBERATE CHOICE AND HERE IT IS.** The procedural scene draws on `ctx` and the
sprites on `spriteCtx` above it, so lights drawn in `SCENES.lore` would sit **behind** the
bookshelves — a glow leaking out from behind furniture. *"Floating around"* wants some in front,
so they are drawn in `drawLoreSprites()`, after the shelves and lamps, **with their positions
derived from that function's own `leftX` / `rightX` / `shelfY` geometry** rather than from
literals that would drift the first time the canvas resized.

---

## 7. Part 6a — Jarvan reaches every job, and the ledger row moves with the constant

**6a.1 is a coverage fix first.** `JARVAN_VILLAGE_LEAD` reached **three of eight** assignable
jobs — `loremaster`, `arcanist` and `tinkerer` got nothing, and `jungler` and `acolyte` were not
in the table at all. **A settlement running a knowledge or devotion economy received nothing
whatever from Demacia's Standard**, which is not what "every worker in the village produces more"
says.

**0.12 → 0.06 on all eight**, iterated from `JOBS` so a ninth job inherits it instead of being
forgotten the way `jungler` and `acolyte` were. Weighted against the bot's own shares that is
**≈0.066 → 0.060: near-neutral in total output and materially different in shape.**

**The building clause is untouched and its scope is stated at both sites**, because one constant
now drives two scopes and the spec was right that leaving that implicit is how the next edit
breaks one while meaning the other.

**6a.2** — the passive goes base 25 → 15, **with the description generated from the constant.**
This project has had **three** defects from a literal drifting away from the number it describes —
v0.59's renown tooltips, v0.61's `petriciteResonators`, and the festival chip.

**And the ledger row moves in the same round.** v0.61 §9.3 rated Jarvan **PARITY-of-magnitude**
against Kittens' 20-Academy `skillXP` line on a 2% coincidence: ×1.97 against ×2.00. **Measured at
base 15, level 10: ×1.5808 — 21% weaker, which is not a coincidence and is not parity.** The
magnitude claim is retracted; the shape claim stands, and the row is EASIER on the three
structural differences that all favour RR.

---

## 8. Part 7 — the crystal sink was never too small; it was on the wrong footing

**Do not raise `MANUFACTORY_FUEL` a fourth time.** Three rounds have, 0.02 → 0.12, and none moved
the stock. v0.61 measured why: **15 Manufactories drain 2.56/s against 36.97/s gross — 6.9%.**

**The arithmetic on the research sink is decisive and it is worth stating:** at 33.4 crystals/s
over 2,500 game-years the settlement produces **66.8 million** crystals; twenty research purchases
averaging ~700 spend **14,000 — 0.02% of production.** A sink at 0.02% of a faucet cannot move a
stock off its ceiling and no rung-scaled research price ever will. **The research sink is the
right shape for lumpiness and the wrong instrument for a continuous faucet.**

**THE CAUSE IS THE ASYMMETRY, NOT THE NUMBER.** The Refinery's output is multiplied by
`convMult × (1 + boosts.crystals)` — ×92 on a maxed state — **and the Manufactory's input was
flat.** A sink that does not scale with the faucet is a rounding error at every point on the curve
except the one it was sized at.

**The source gives the anchor.** Kittens' `calciner` burns `oilPerTickCon: -0.024` per copy against
an `oilWell`'s `oilPerTickBase: 0.02` — **a primary sink burns 1.2× what a primary faucet makes,
per copy.** RR's Refinery makes `crystals: 0.02` per copy before multipliers, so **the burn goes to
0.024 and takes the same multiplier the yield takes.** `MANUFACTORY_FUEL` goes **down**, 0.12 →
0.024, which is what stops this being a fourth raise: the scaling is the change.

**Scoped to the fuel line only.** Every other converter input stays flat, because
inputs-flat/outputs-multiplied is the **source's own** asymmetry (v0.61 §3, confirmed independently
at the Calciner and the Smelter). Making every input scale would be a parity regression dressed as
a fix.

---

## 9. Part 8 — §31's premise retracted, by the analyzer that wrote it

v0.61 recorded that RR's combined stack is **"×9.3 the source's"** — a comparison that put **RR's
whole stack against ONE Kittens category.** That is **the identical conflation this project has
now caught three times**: v0.60 reported the converter stack at ×19.77 by multiplying two
categories and comparing against one; v0.61 corrected that and made the same mistake one level up.

**Read in full, `game.js:3390–3540` has roughly FOURTEEN multiplicative steps**, not four — season,
`<res>GlobalRatio`, `<res>Ratio`, `<res>RatioReligion`, `<res>SuperRatio`, the steamworks hack,
paragon, pollution, magnetos, reactors, the Solar Revolution faith bonus, cosmic radiation,
festival cycles and necrocracy.

> **RR has about ELEVEN. RR is not architecturally out of line with the source — it is slightly
> under.**

§31 carries the retraction as its own subsection **rather than being quietly edited**, because a
ruling request that survives on a bad number is worse than no ruling request. **The four-category
proposal rests on a premise that no longer holds, and Jerry should rule on the corrected section.**
**Nothing was collapsed.**

---

## 10. Part 9 — the ledger is finished

**UNVERIFIED reaches ZERO.**

| | v0.61 | **v0.62** |
|---|---|---|
| rows | 226 | **225** |
| PARITY | 81 | **87** |
| EASIER | 105 | **117** |
| HARDER | 15 | **21** |
| **UNVERIFIED** | **25** | **0** |

**The prediction was 18 PARITY / 5 EASIER / 2 HARDER. The measured split is 8 PARITY / 11 EASIER /
6 HARDER**, so the prediction was wrong in an informative direction: **the analyzer expected the
last 25 to be mostly confirmations and they were mostly divergences.** Scoring both estimates was
the point of making it — v0.60's RETRIEVABLE count was exact, v0.61's split was not, and this one
is not either. **The lesson is that COUNTS of retrievable work are predictable and VERDICTS are
not.**

Five findings from the pass are worth naming:

- **`trade`'s counterpart figure was WRONG in the ledger.** It said *currency (1200)*; **`currency`
  is science 2,200** — 1,200 is `brewery`. RR opens Trade Routes at **55% of the source's rung.**
  The error is recorded rather than quietly corrected: a wrong citation that reads as PARITY is
  worse than an honest blank.
- **`ritesOfTargon`** guessed *~10000–12000*; `theology` is **20,000 science AND 35 manuscripts**,
  a crafted component RR does not ask for at all.
- **`acolyte` is EXACT.** Kittens' priest is `faith: 0.0015` per tick × 5 ticks/s = **0.0075/s**,
  and RR's Acolyte is `devotion: 0.0075`. Ported at exact tick parity, and never censused until now.
- **Three repeatable buildings diverge on `priceRatio`, which compounds.** The Hexdraulic Plant is
  1.25 against the oilWell's **1.15** and the Watcher's Eye is 1.25 against the aqueduct's **1.12** —
  at ten copies that is 2.1× and 2.7× dearer than the source. The Shelter is 2.20 against the hut's
  **2.50**, which is 3.2× *cheaper* at ten copies. **Nobody had compared a single price ratio before.**
- **`gear` is the one craft where RR asks more**: steel 25 against the source's 15, same tier, same
  input. Gears feed the Workshop line and every hextech chain above it.

---

## 11. Dev note 1 — the knowledge sink, sized from the file's own precedent

Jerry: *"The knowledge requirement for discoveries should be higher... a healthy sink for knowledge
while the player is ramping up their knowledge buildings to afford the next lore research."*

**The measurement did not need the source at all.** RR already had **ten hand-authored knowledge
costs** and none of them was anywhere near the generated rule's K/10:

| discovery | cost | tech rung | ratio |
|---|---|---|---|
| `slabCutting` | 350 | mining 500 | **0.70×** |
| `deepwaterDocks` | 900 | trade 1,200 | 0.75× |
| `trappersCraft` | 400 | logistics 500 | 0.80× |
| `keepingTheRolls` | 1,300 | songcraft 1,300 | 1.00× |
| `beastLore` | 2,500 | abyss 2,000 | 1.25× |
| `chemtechDistillation` | 3,000 | hextech 2,200 | 1.36× |
| `masterOfTheHunt` | 12,000 | drakeLore 3,600 | **3.33×** |
| `greatLibrary` | 40,000 | ritesOfTargon 12,000 | **3.33×** |

**The authored band is 0.70× to 3.33×. The generated rule sat at 0.10× — an order of magnitude
below the game's own precedent, on the same buttons.** `DISCOVERY_KNOWLEDGE_DIVISOR` goes
**10 → 1.25**, i.e. **0.8 × K**, the low end of that band, so the rule-generated Discoveries now
cost what the hand-priced ones have always cost and nothing becomes an outlier in either direction.

**Why it is a sink and not a wall**, which is the half of the note that constrains it: **at most
three knowledge-carrying Discoveries sit on any one tech**, so a tech's leaves cost at most 2.4×
the rung — spread over three separate purchases, against a ceiling that grows with every Archive,
Academy, Observatory and Hexcore Laboratory built. **That is the shape the note asks for: something
to spend knowledge on while the buildings that raise the ceiling go up.** The four authored figures
above the band are left alone.

---

## 12. Operational — the ensemble died TWICE, and `setsid` was never the problem

**Two full ensembles were lost before one completed**, and the first diagnosis in this section was
wrong, so it is corrected here rather than edited away.

**What I first wrote:** that a turn interrupt killed the run despite `setsid nohup … & disown`,
which is the exact failure operational rule 6 exists to prevent.

**What actually happened:** the second run died the same way after 22 minutes, and `uptime` on the
next check read **`up 0 min`. THE CONTAINER HAD RESTARTED.** Both losses were the sandbox being
reclaimed between turns, not a signal reaching the process group. The reparent to PID 1 was
verified on the second launch and it made no difference, because nothing about process parentage
survives the machine going away.

**So rule 6 is correct and it is not sufficient, for a reason it does not mention:**

> **A background run only survives while the SESSION stays active.** `setsid` protects against a
> turn interrupt. It does not protect against the container being reclaimed during an idle gap,
> and a 90-minute ensemble spans several such gaps if the turn is allowed to end.

**The working pattern, which is what v0.61's 97-minute ensemble actually did:** keep the session
active across the whole run by polling continuously, rather than ending the turn and returning on
a scheduled wake-up. **Both of this round's losses came from scheduling a check-in and letting the
turn end; the run that completed was the one nobody left alone.**

**And a second-order lesson worth more than the first:** the parent buffers every child's output
until all of them finish, so **a run killed at 95% of its wall time leaves a log containing only
its header.** 45 minutes of measurement produced two lines, twice. **A long harness should write
per-seed results incrementally**, so a lost run still yields the seeds that finished.

---
