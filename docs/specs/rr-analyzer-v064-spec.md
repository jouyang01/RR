# BUILDER SPEC v0.64 — the population wall is the housing ladder, and Option B ships

Written against the **v0.63 tag**, verified from disk on a fresh checkout.

**What reproduces.** Thirty-four suites parsed from their own `SUITE-END` trailers: **1,876
assertions passed, 0 failed, no missing trailer, no skipped call site, no non-zero exit.** The
parity ledger reproduces exactly from the generator — **225 rows, PARITY 87, EASIER 117, HARDER
21, UNVERIFIED 0.** Every v0.63 part shipped, including `DISCOVERY_RUNG_CAP = 2.43` (`:3430`) and
`CRYSTAL_SINK_MAX` (`:4243`).

**Builder note 1 asked for the population decomposition before any proposal. Here it is, and it
answers the question the last two rounds have been circling.**

> **RR has exactly three buildings that raise `maxPop`, and the first two cap the settlement at
> 78 people.** Shelter is ratio-bound at ~15 copies (30 pop). Longhouse is ceiling-bound at 48
> copies (48 pop) by a **1,200-provisions component Kittens' log house does not have.**
> **Everything above 78 requires the Skyrise Terrace, gated on `deepWorks` — tech #30 of 35, 86%
> up RR's ladder.** Kittens unlocks its third housing tier at **34%** of its own ladder.
> **Part 1.**

**And builder note 2's rule immediately disqualifies the thing I recommended last session.** I
told Jerry that uncapping provisions would relieve population. **It would not.** The Longhouse is
gated on the provisions **ceiling** — a 1,200-unit lump at ratio 1.15 — and Option B raises
provisions **production**. **The constraint Option B relieves is not the binding one for
population, and this spec says so before proposing anything.**

---

## Jerry's dev notes — where every one lives

| # | note | Part |
|---|---|---|
| **B** | **Option B — raise the boost ceilings to rails** | **2** |
| 1 | Coalgas Vent should require Iron Plating | **3.1** |
| 2 | New-era buildings should be gated behind crafted tier materials | **3** |
| 3 | Are there enough mana multipliers? | **4** |
| 4 | Retire `DISCOVERY_RUNG_CAP`; re-base the two authored outliers | **5** |
| 5 | Trade cost 5,000 → 3,500 provisions | **6** |

---

## Part 0 — Ground rules

**This spec produces `v0.64`.** Clone Kittens and pin **`c52985b`**. **Do not re-open** §§1–30, 32.
§31 remains Jerry's open question.

**§0.1's new rule governs this round: a proposal aimed at completion must demonstrate the
constraint it relieves is the binding one.** Part 1 does that and Part 2 explicitly does not claim
to.

**Builder note 5 changes the measurement protocol: Sparks is dominated by a 3-of-10 champion draw
and its spread moved ×1.01 → ×1.71 on a re-roll. Any condition steering on a Sparks median needs
more than three seeds. Report Sparks with its draw, or do not steer on it.**

---

## Part 1 — The housing ladder, decomposed (builder note 1)

**Measured, not inferred. Every building in RR that raises `maxPop`:**

| building | pop | ratio | cost | tech | **bound by** | **max pop it can give** |
|---|---|---|---|---|---|---|
| **Shelter** (`:549`) | 2 | **2.2** | timber 8 | — | **its own ratio** — the 15th costs 497,746 timber | **30** |
| **Longhouse** (`:560`) | 1 | 1.15 | timber 220, ore 260, **provisions 1,200** | carpentry (1,000) | **the provisions CEILING** — the 48th needs 855,027 in one lump | **48** |
| **Skyrise Terrace** (`:649`) | 2 | 1.15 | hexcrete 4, alloy 20, scaffold 8 | **deepWorks (100,000)** | crafted-goods throughput | effectively unbounded |

**Shelter + Longhouse = 78. That is the entire population ceiling before the third tier.**
Measured peak population is **136 / 134 / 180**, and §27's band is 150–220 — so two seeds sit
**58 and 56 above the two-tier ceiling**, meaning both are already relying on Skyrises and still
falling short.

### 1.1 Two RR-original divergences, both in the source

**Kittens' three housing buildings, `js/buildings.js:451–510`:**

| | Kittens | RR |
|---|---|---|
| tier 1 | `hut` — wood 5, **ratio 2.5**, maxKittens 2 | Shelter — timber 8, ratio 2.2, pop 2 — **gentler than the source** |
| tier 2 | `logHouse` — wood 200 + minerals 250, ratio 1.15, **no food cost** | Longhouse — timber 220 + ore 260 **+ provisions 1,200** |
| tier 3 | `mansion` — titanium 25 + slab 185 + steel 75, ratio 1.15 | Skyrise — hexcrete 4 + alloy 20 + scaffold 8 |

**Divergence 1 — the Longhouse's 1,200-provisions component is RR-original.** The source's mid
tier costs two *materials* and nothing else, so it scales with the barn/warehouse line. **RR's
scales with the food ceiling**, which is exactly what v0.62's storage cut lowered — and population
went 179 → 135 in that round and has not recovered.

**Divergence 2 — the tier-2-to-tier-3 tech gap is three times the source's.**

| | tier 2 unlock | tier 3 unlock | gap | tier 3's position on the ladder |
|---|---|---|---|---|
| Kittens | `construction` 1,300 | `architecture` 42,000 | **×32** | **tech #22 of 64 — 34% up** |
| RR | `carpentry` 1,000 | `deepWorks` 100,000 | **×100** | **tech #30 of 35 — 86% up** |

**RR asks the player to reach 86% of its tech tree before the settlement can exceed 78 people —
and knowledge production scales with population.** That is the deadlock, and it is why two rounds
of knowledge relief did not move completion.

### 1.2 What to ship, in the order that isolates it

**Ship 1.2a alone first and measure it. It is one number and it has the best citation in the
round.**

- **1.2a — delete the Longhouse's provisions component**, leaving timber 220 + ore 260. **Kittens'
  log house has no food cost**; this is a straight parity correction, it decouples housing from
  the food ceiling, and it removes the mechanism by which a storage change collapsed population.
- **1.2b — bring the third tier forward**, only if 1.2a does not clear the gate. The
  source-shaped move is the tech rung, not the price: `deepWorks` at 86% against the source's 34%
  is the divergence. **A mid-ladder home for the Skyrise — or a fourth housing building between
  carpentry and deepWorks — is what the source's spacing implies.** Do not re-price the Skyrise;
  its cost shape already matches the mansion's.
- **Do not touch the Shelter.** At ratio 2.2 against the source's 2.5 it is already gentler.

**Pass conditions:** the maxPop decomposition printed at every milestone — every housing
building's count, its contribution, and **which resource is binding on the next copy**; the
Longhouse's provisions component deleted with `js/buildings.js:476–487` cited; **peak population
inside 150–220 on the median**, and the two-tier ceiling reported as a number; **Icathia on all
three seeds** or the failure reported against the decomposition.

---

## Part 2 — Option B: the boost ceilings become rails (Jerry's ruling)

**Jerry has ruled Option B. The ceilings stay in the code and move above the reachable range, so
they act as backstops rather than as a permanent tax** — which is how the source uses the same
curve. `getLimitedDR` is Kittens' own function, 0.75 free band and all (`game.js:2452–2465`), and
**not one of Kittens' five production-boost categories passes through it.** Where the source does
bound a production bonus — Solar Revolution, limit **10** — a real player reaches about **4.5**.
**The cap is a rail there, never felt.**

**What RR delivers today, measured at the end of a real run:**

| family | limit | knee | raw Σ | delivered | **thrown away** |
|---|---|---|---|---|---|
| **vigor** | 1.0 | 0.75 | **5.522** | 0.988 | **82.1%** |
| **devotion** | 2.0 | 1.50 | **3.550** | 1.902 | **46.4%** |
| **provisions** | 1.5 | 1.125 | 1.900 | 1.378 | **27.5%** |
| **mana** | 1.0 | 0.75 | 1.029 | 0.882 | **14.3%** |
| crystals | 2.0 | 1.50 | 1.338 | 1.338 | 0% |
| gold | 1.5 | 1.125 | 0.812 | 0.812 | 0% |
| culture | 2.0 | 1.50 | 0.182 | 0.182 | 0% |

### 2.1 The rails, and the rule that sets them

**Set each limit so the knee sits above the family's end-of-run raw sum**, exactly as Solar
Revolution's 10 sits above its reachable 4.5. **Rail = ceil(raw Σ ÷ 0.75), rounded up to a round
number**, so the free band covers everything reachable and the curve still exists:

| family | raw Σ | knee must exceed | **ship limit** | new knee | delivered after |
|---|---|---|---|---|---|
| **vigor** | 5.522 | 5.522 | **8.0** | 6.00 | **5.522 — full** |
| **devotion** | 3.550 | 3.550 | **5.0** | 3.75 | **3.550 — full** |
| **provisions** | 1.900 | 1.900 | **3.0** | 2.25 | **1.900 — full** |
| **mana** | 1.029 | 1.029 | **2.0** | 1.50 | **1.029 — full** |
| crystals, gold, culture | | | **unchanged** | | already full |

**Production effect: vigor ×1.99 → ×6.52 (3.3×), devotion ×2.90 → ×4.55 (1.6×), provisions ×2.38
→ ×2.90 (1.2×), mana ×1.88 → ×2.03 (1.1×).**

**And RR's per-copy rates are already source-shaped, so no source re-pricing is needed.** RR's
knowledge line — hexLab 0.35, observatory 0.25, academy 0.20, archive 0.10 — is a **direct port of
Kittens' biolab/observatory/academy/library**, and knowledge has never had a `BOOST_LIMIT`. It has
run uncapped at the source's rates for the whole project's life without complaint. **Twenty
biolabs give Kittens ×8 on science with no diminishing return anywhere; RR's vigor uncapped is
×6.52.** That is inside the source's normal operating range.

### 2.2 Ship it one family at a time, and this is not optional

**The four differ by 1.08× to 3.3×, and two of them are upstream of global multipliers** — vigor
feeds hunts → renown → champions → champion affinities → `convMult`; devotion feeds worship →
`catReligion`, which multiplies everything. **A single ensemble would say the round moved and
nothing about which part did it, which is precisely how v0.62 shipped five sound changes and
failed four gates.**

**Order, and the reason for it:**

1. **provisions** — smallest (×1.22) and the only one that touches the food economy Part 1 is
   decoupling from. Run it **after** Part 1.2a so the two are not confounded.
2. **vigor** — largest, and the one most likely to surprise.
3. **devotion and mana together** — mana is nearly a no-op; devotion needs Convergence watched.

**Each with its own three-seed run.** On a two-core box that is real time; **it is cheaper than
another four-gate failure.**

### 2.3 The measurement that must precede all of it

**Print each family's raw Σ at every milestone, not just at the end.** v0.62's static probe put
two families past the knee and the real run found four — **provisions and mana cross partway
through**. If provisions crosses at year 400, uncapping it changes the early game far more than
the end-of-run +22% suggests, and the population effect is front-loaded. **The readout exists;
this is one print statement and it sharpens every prediction in this Part.**

**Pass conditions:** the four limits at 8.0 / 5.0 / 3.0 / 2.0 with each family's raw Σ cited;
crystals, gold and culture **unchanged**; **every family's raw Σ printed at all four milestones**;
**one ensemble per family, in the stated order**, each reported separately; **no per-copy source
rate re-priced**; the delivered value of every boost string still matches what it advertises.

---

## Part 3 — Era-tier materials (dev note 2), and the Coalgas Vent (dev note 1)

### 3.1 The Coalgas Vent takes Iron Plating

`index.html:834` — `cost: { timber: 250, ore: 420, steel: 20 }`. **A Zaun-tier Era-3 building
priced entirely in Era-1 raws plus a little steel.** Add **`plating`** (Iron Plating), which is
the Zaun chain's own first crafted good and is unlocked on `sparks`, the era the Vent belongs to.

### 3.2 The general rule dev note 2 asks for, and the source has it exactly

**Kittens gates every new tier behind a crafted or refined material the previous tier could not
make**, and Jerry's examples are all real:

| Kittens building | gating material |
|---|---|
| `mansion` | **titanium** 25 |
| `factory` | titanium + **concrate** |
| `calciner` | **oil** 500, titanium |
| `biolab` | **plastic** 15, alloy |
| `observatory` | **scaffold** 50, slab |
| `ship` / harbor line | **starchart**, plate, scaffold |

**The pattern is one gating material per tier, in a small quantity, alongside bulk raws.** The
quantity is small — titanium 25, plastic 15, scaffold 50 — because **the gate is the unlock, not
the volume.** A player cannot mass-build the new tier on the day it unlocks because the crafted
input is throughput-limited, and that is the whole effect.

**Ship the audit, then the gates.** For every RR building, list its era and whether its cost
contains a material from **that era's own craft chain**. **Report the count before proposing
individual costs** — a rule applied to a list nobody has read is how v0.62 shipped five changes in
one direction.

**Two constraints on the fix:**

- **Small quantities, alongside the existing raws.** Do not replace bulk costs; add a gate.
  Kittens' mansion is titanium 25 against slab 185 — **the crafted good is 12% of the line items
  and 100% of the gate.**
- **`auditCostGraph()` must pass.** v0.62 §7.2 caught a Discovery priced in a material gated a
  full rung later. **Every gate must be craftable at the tech that unlocks the building** — this
  is the single most likely way this Part ships a broken build.

**Pass conditions:** an era-by-era audit table of every building and its gating material, reported
before any cost changes; the Coalgas Vent takes `plating`; every new gate craftable at its
building's own tech, asserted by `auditCostGraph()` and `auditRawGraph()`; **Era 3 and Icathia
reported** — this Part slows Era-3 build-out by construction and it must not be shipped in the
same slice as Part 1.

---

## Part 4 — Do we have enough mana multipliers? (dev note 3)

**Measured first, and one premise in the note needs correcting.**

**RR has seven mana-consuming converters** — `hexLab` 0.05, `tradeDock` 1.0, `trainingGround` 0.5,
`coalgasVent` 0.3, `hexQuarry` 0.6, `shimmerRefinery` 0.5, `chemForgeworks` 0.5 per copy per
second. **That is a genuinely large sink and the note is right to ask.**

**The multipliers are three discoveries and Swain, exactly as the note says.** `boosts.mana` takes
`leylineCalibration` 0.30, `trueIceCellars` 0.20 and `hexresonance` 0.25 — **Σ 0.75** — plus
`champPassive("mana")`, which is **Swain's** *Administrative Vision, +12%* (`index.html:1683–1697`).

**Swain carries two different slots and they must not be conflated.** His **passive** is the mana
boost, shipped at v0.59 Part 8 note 5 precisely so it would stop duplicating his lead; his
**lead** is `SWAIN_KNOWLEDGE_LEAD = 0.25` into `boosts.knowledge` (`:1763`, `:6378`). **A passive
applies whenever he is recruited; a lead applies only while he is leading.** So Swain is the mana
champion *and* a knowledge leader, and a reader who greps one slot will get the other wrong.

**Part 2 answers most of this without adding content.** `BOOST_LIMIT.mana` is **1.0** and Σ0.75 is
**exactly the knee**, so today the three discoveries deliver in full but *any* fourth member is
the first that would not. **Raising the rail to 2.0 makes room for Swain's 12% and a fourth
discovery to both pay face value** — which is a mana increase with no new content at all.

**So: measure before adding a fourth discovery.** Report **net mana per second at every
milestone**, and the **consumed/produced ratio**. A fixture of twenty of everything nets +132/s,
but that is not a run. **If net mana is positive at every milestone after Part 2, no fourth
discovery is needed** and the note is answered by the rail. **If it is negative at any milestone,
ship the fourth** — and put it on a tech that is not `sparks`, which already carries the mana
discovery.

**Pass conditions:** net mana/s and the consumed÷produced ratio at all four milestones, before and
after Part 2; **Swain's two slots recorded in the ledger as distinct — passive mana +12%, lead knowledge +25%**; a fourth discovery shipped **only if
the measurement shows a deficit**, with the milestone that showed it named.

---

## Part 5 — Retire `DISCOVERY_RUNG_CAP` (dev note 4)

**Jerry's note is the analyzer's own correction, and the builder recorded the same objection in
BUILD-REPORT v0.63 §1.2 before it was raised. Both were right.**

**The per-rung total is not a Kittens invariant.** Joining `js/workshop.js` against
`js/science.js`: the **per-upgrade** ratio has a tight IQR of **0.73–1.00** (median 0.87), while
the per-rung total ranges from 0.30 to **8.19** — because a rung's total is simply *per-upgrade ×
how many upgrades sit on it*, and the source puts up to six on one tech. **Half of Kittens' own
rungs exceed 2.43×.**

**And the cap cut the wrong members.** It scales whole rungs proportionally, so on `ritesOfTargon`:

| discovery | source | before | **after the cap** | vs the source's 0.73–1.00 |
|---|---|---|---|---|
| `greatLibrary` | **AUTHORED** | 3.33× | **1.41×** | **still above p75** |
| `cataloguing` | generated | 0.80× | **0.34×** | **far below p25** |
| `crossReferencing` | generated | 0.80× | **0.34×** | **far below p25** |
| `illuminators` | generated | 0.80× | **0.34×** | **far below p25** |

**Across the game the generated members' per-upgrade median fell 0.80 → 0.62, minimum 0.34.**
**Every discovery above the source's p75 is AUTHORED, not generated. The rule was never out of
parity.**

**Ship exactly what the note says:** retire `DISCOVERY_RUNG_CAP` (`:3430`), restore the generated
members to **0.8 × K**, and re-base the two authored outliers to the source's p75 of 1.00 —
**`greatLibrary` 40,000 → 12,000**, **`masterOfTheHunt` 12,000 → 3,600**. That is **−36,400 taken
entirely from the two figures outside the source's spread**, against the cap's −47,959 taken
mostly from members that were already correct.

**And reconcile the census.** The analyzer measured median 2.43 / max 8.19 / whole-game 0.50; the
builder's re-run gave median 2.07 / max 6.25 / whole-game 0.470. **Both joined upgrades to their
unlocking tech and the joins differ. Three rounds have argued from this table — pin one and record
the join.**

**Pass conditions:** `DISCOVERY_RUNG_CAP` gone; generated members back at 0.8 × K; the two
authored figures at 12,000 and 3,600; **RR's per-upgrade median asserted inside 0.73–1.00 after
every load-time mutation**; the two censuses reconciled and the join recorded; the whole-game
ratio reported against the source's ~0.47–0.50.

---

## Part 6 — Trade provisions cost (dev note 5)

`TRADE_PROVISIONS = 5000` (`:5215`) → **3,500**.

**And record what it does and does not do.** v0.61 measured this cost as **never binding** — the
provisions ceiling allowed 15 caravans at Sparks and 180 at Icathia — so 5,000 was already a stock
drain rather than a caravan limiter, and 3,500 is a gentler stock drain. **It does not become a
limiter by getting smaller.** Report provisions time-at-cap before and after, and the caravan
count the ceiling allows at each milestone, so the note's own test is answered with a number.

**This interacts with Part 1.2a.** Deleting the Longhouse's provisions component and cutting the
trade cost both loosen the food economy in the same round. **Report them separately.**

**Pass conditions:** 3,500 shipped; provisions time-at-cap and the allowed caravan count at all
four milestones; the interaction with Part 1.2a reported as two figures, not one.

---

## Part 7 — Two things not to touch (builder notes 3, 4)

- **`CRYSTAL_SINK_MAX` — leave it.** Part 8.2 cleared by a wide margin and builder note 4 names
  the single constant if a future round wants it gentler. **No round should tune a condition that
  passed.**
- **`DISCOVERY_RUNG_CAP`'s 2.43 vs 2.07 — resolved by Part 5's retirement**, so the
  mean-versus-median disagreement is moot for the constant and live only for the census, which
  Part 5 reconciles.

---

## Part 8 — Order, discipline, pass conditions

### Order

1. **Part 1.2a alone** — delete the Longhouse's provisions component. **Ensemble immediately.**
   One number, the best citation in the round, aimed at the demonstrated binding constraint.
2. **Part 5** — retire the cap. Independent of everything else and it restores parity.
3. **Part 2, one family at a time**, provisions → vigor → devotion+mana, **each with its own
   ensemble**.
4. **Part 1.2b** — the third housing tier's rung, **only if 1.2a did not clear the gate**.
5. **Parts 4, 6** — the mana measurement and the trade cost.
6. **Part 3** — the era-tier audit, then the gates. **Last, because it slows Era-3 build-out and
   must not confound Part 1.**

### Operational

`--years N --seeds 3` minimum, **and more than three for anything steering on Sparks** (builder
note 5: the ×1.01 → ×1.71 re-roll). **Clone Kittens; pin `c52985b`.** `nproc` is 2 — give the
ensemble the box; v0.62 lost two ensembles to container restarts.

### Round pass conditions

| # | Condition | Target |
|---|---|---|
| **1** | **Icathia on all three seeds** | **the gate, third round running** |
| **2** | **Peak population 150–220 [median]** | **the constraint Part 1 demonstrates is binding** |
| 3 | maxPop decomposition | printed at every milestone with the binding resource per building |
| 4 | Longhouse | provisions component deleted, `js/buildings.js:476–487` cited |
| 5 | Two-tier ceiling | reported as a number before and after |
| 6 | `BOOST_LIMIT` | vigor 8.0, devotion 5.0, provisions 3.0, mana 2.0; others unchanged |
| 7 | Raw Σ per family | printed at **all four milestones**, not just end of run |
| 8 | Option B slices | **one ensemble per family**, in order, reported separately |
| 9 | Per-copy rates | **unchanged** — RR's are already the source's |
| 10 | `DISCOVERY_RUNG_CAP` | **gone**; generated back at 0.8 × K |
| 11 | Authored outliers | `greatLibrary` 12,000, `masterOfTheHunt` 3,600 |
| 12 | Per-upgrade median | asserted inside **0.73–1.00** after every load-time mutation |
| 13 | Census | reconciled, join recorded, one table pinned |
| 14 | Coalgas Vent | takes `plating`; `auditCostGraph()` passes |
| 15 | Era-tier audit | every building, its era, its gating material — **reported before any cost change** |
| 16 | New gates | craftable at the building's own tech, asserted by both audit graphs |
| 17 | Mana | net/s and consumed÷produced at four milestones; fourth discovery **only on a measured deficit** |
| 18 | Swain's two slots | ledgered — **passive = mana +12%, lead = knowledge +25%**; asserted as distinct slots so neither grep can find the other |
| 19 | `TRADE_PROVISIONS` | 3,500; allowed caravan count reported; separated from Part 1.2a |
| 20 | `CRYSTAL_SINK_MAX` | **untouched** |
| 21 | Unchanged | `capFamilyOf()` two families · audits 0/0 · Σ 4.35/1.80 · `CONSUMPTION` 4.25 · ratio 1.17647 · `XP_PER_SECOND` 0.05 · the rank ladder |
| 22 | Every Part | actioned, or its non-action explicitly justified |

### Predicted vs measured

| slice | peak population | Icathia | note |
|---|---|---|---|
| v0.63 baseline | **136 / 134 / 180** | **1 of 3** | the report's figures; **my ensemble had not finished at hand-off** |
| s1: Longhouse food cost deleted | **+25 to +60** | **2–3 of 3** | the 48-copy ceiling becomes material-bound; this is the round's central prediction |
| s2: `DISCOVERY_RUNG_CAP` retired | **0 to +5** | unchanged | knowledge was never the binding constraint — v0.63 proved that |
| s3: provisions rail | **+5 to +20** | unchanged | production, not ceiling; small because Part 1 removed the coupling |
| s4: vigor rail | **0 to +10** | may improve | 3.3× vigor is hunts → renown → champions, not population directly |
| s5: devotion + mana rails | **0** | may improve | `catReligion` compounds into everything |
| s6: era gates | **−10 to 0** | **may regress** | slows Era-3 build-out by construction |
| **shipped** | **165–200** | **3 of 3** | |

**The central prediction is s1, and it is falsifiable in one run.** If deleting the Longhouse's
food cost does not move peak population materially, **then the two-tier ceiling of 78 is not what
is holding the settlement at 136** — the Skyrise is already carrying it — **and the answer is
Part 1.2b's tech rung, not the Longhouse.** Either result settles a question two rounds have
guessed at.

**And one prediction I expect to be wrong.** I predict Option B's provisions rail adds little
(s3, +5 to +20) **because Part 1 removes the mechanism by which provisions gated housing at all.**
If it adds a lot, provisions was gating something else nobody has named — say so rather than
absorbing it.

---

## Sources, all read this session

**Line numbers pinned to `nuclear-unicorn/kittensgame` at `c52985b` (2026-08-04), cloned to disk.**

**Kittens:** `js/buildings.js:451–510` — `hut` (wood 5, priceRatio **2.5**, maxKittens 2),
`logHouse` (wood 200 + minerals 250, ratio 1.15, **no food component**), `mansion` (titanium 25 +
slab 185 + steel 75, ratio 1.15); `js/science.js:125` and `:257` — `logHouse` unlocked by
`construction` (**1,300**), `mansion` by `architecture` (**42,000**), **tech #22 of 64**;
`js/workshop.js` × `js/science.js` — the per-upgrade IQR **0.73–1.00**, median 0.87, against a
per-rung range of 0.30–8.19; `game.js:2452–2465` — `getLimitedDR` and its 0.75 free band, **the
function RR ports**; `game.js:3429–3440` — the five production categories, **none of which passes
through it**; `js/religion.js:1548–1550` — Solar Revolution's limit **10** against a reachable
~4.5, the rail pattern Part 2 copies; `js/buildings.js` — the crafted gates of `mansion`,
`factory`, `calciner`, `biolab`, `observatory` and the ship line, for Part 3.

**RR**, at the v0.63 tag: `index.html:549`, `:560`, `:649` — the **three** buildings that raise
`maxPop`, and `:5705` `maxPop()`; a live probe computing each one's ceiling-bound and ratio-bound
maximum (**Shelter 15 copies → 30 pop; Longhouse 48 → 48 pop; Skyrise unbounded**), the
**78-population two-tier ceiling**, and the lump cost of the Nth copy of each; `:2782`
`BOOST_LIMIT`; `:3430` `DISCOVERY_RUNG_CAP`; `:5215` `TRADE_PROVISIONS`; `:834` the Coalgas Vent's
`{ timber 250, ore 420, steel 20 }`; `:2768` the three mana discoveries summing **0.75 — exactly
`BOOST_LIMIT.mana`'s knee**; `:1683–1697` **Swain's** mana passive (+12%) against `:1763`/`:6378` `SWAIN_KNOWLEDGE_LEAD`
(+25% knowledge) — **two different slots on the same champion**; `:4243` `CRYSTAL_SINK_MAX`; the seven mana-consuming converters.

**Measurements taken this session:** all 34 suites re-run from disk and parsed from their own
trailers (**1,876 passed, 0 failed, no missing trailer, no skipped site, no non-zero exit**);
`tools/parity-ledger.mjs` re-run (**225 / 87 / 117 / 21 / 0**, exact); a live decomposition of
`maxPop` into its three buildings with each one's binding resource; a join of Kittens' housing
buildings to their unlocking techs and each ladder's rank. **The three-seed ensemble was launched
at the start of the session and had not finished at hand-off — every population, Era-3 and
milestone figure quoted here is v0.63's own, labelled as such.**
