# BUILDER SPEC v0.65 — the Discovery ladder stops being free, and the source says so line by line

Written against the **v0.64 tag**, verified from disk on a fresh checkout. Kittens pinned at
**`c52985b`**, cloned to `/home/claude/kg`.

**What reproduces, measured this session and not taken from the report.** Thirty-five suites under
`node tools/run-suites.mjs --selftest`: **1,907 `check()` call sites, 1,956 assertions executed,
1,956 passed, 0 failed**, no missing trailer, no skipped site, no non-zero exit, and the scratch
suite that throws on purpose FAILED the round as it must. `tools/parity-ledger.mjs` regenerates
**225 rows — PARITY 87, EASIER 116, HARDER 22, UNVERIFIED 0**, byte-identical to the committed
file. `tools/era-gate-audit.mjs`: **51 buildings, 27 gated, Era-2+ ungated 2.** `snapshots/v64/s8.html`
is byte-identical to `index.html` (`sha256 c170821…b854074`) — the §9 chain proof holds. **Every
Part of the v0.64 spec shipped or has a stated, honest non-action.** Part-by-part in §10.

**And one measurement in the build report does not reproduce**, stated here rather than buried:
BUILD REPORT §3.3 says RR has *"two residual outliers"* outside the source's per-upgrade band.
**There are five** — `standingOrders` 0.10, `surveyedApproaches` 0.10, `slabCutting` 0.70,
`beastLore` 1.25, `chemtechDistillation` 1.364. The report's claim that **every GENERATED member
sits exactly at 0.80 is true**; the outlier count is not. And the live comment above
`DISCOVERY_KNOWLEDGE_SET` claims the set takes the game *"from 10 of 78 to 35 of 78 — 13% to
45%"*; **the measured coverage is 32 of 78 — 41%.** Part 1 replaces both figures with a census.

---

## Jerry's dev notes — where every one lives

| # | note | Part |
|---|---|---|
| 1 | **Training grounds should not increase Vigor generation** | **2** |
| 2 | **The discoveries are still not costing knowledge. We want Kittens parity** | **1** |
| 3 | **If the Longhouse's provision cost was not a limiting factor, add it back. More provision sinks are good** | **3** |

## The builder's six notes — where every one lives

| # | note | Part |
|---|---|---|
| 1 | Don't make the round about population — the gate and the band both cleared | **7.1** — nothing in this round tunes either, and both are guarded |
| 2 | Mana is the one undischarged condition; read §11.6 first; not on `sparks` | **4** |
| 3 | Three of four failing conditions are one random variable | **5** |
| 4 | Dev note 2's converter ruling is the biggest unmeasured lever; `CONV_DISCOVERY_LINE` Σ0.65 | **7.2** — untouched, and named as this round's release valve |
| 5 | Decide: Rites-under-75 or per-upgrade parity | **6** — **ruled: per-upgrade parity** |
| 6 | Part 1.2b is available and probably unnecessary | **7.3** — not shipped |

---

## Part 0 — Ground rules

**This spec produces `v0.65`.** The git tag is the authoritative version (§10); bump the `VERSION`
constant, never a literal in a suite.

**Do not re-open §§1–30, 32, 33.** §31 remains Jerry's open question with its premise retracted at
§31.2a — **no round may add a new multiplicative category until he rules.** Nothing in this spec
adds one: Part 1 changes prices, Part 2 removes a member from an existing additive accumulator,
Part 4 adds a member to an existing additive accumulator.

**§0.1's rule governs Part 1 and Part 3 alike: a proposal must demonstrate the constraint it
relieves — or imposes — is the binding one.** Part 1 does it with a census. Part 3 does it with the
`housing` instrument that already exists, and **Part 3 is explicitly conditional on its own
measurement**, because Jerry's note is itself conditional.

**This round is ATTRIBUTED BY TWO ENSEMBLES, and that is declared up front** rather than discovered
afterwards, which is HANDOFF v0.64 §1's rule. Every change in v0.64 was late-game and seven of
eight 300-year slices measured exactly zero. Part 1 is a late-game change of larger magnitude than
anything this project has shipped. **Cheap per-part checks catch crashes and nothing else this
round; the attribution comes from E1 and E2 in Part 8.**

---

## Part 1 — DEV NOTE 2: the Discovery ladder's knowledge coverage

**Jerry has raised this twice. v0.63 note 1 asked "every workshop upgrade costs science in Kittens
— confirm and match"; the round confirmed the RATE half and never actioned the COVERAGE half, and
`docs/gameplay-notes.md` struck the note through on that basis.** The rate is at parity and has
been since v0.62. Coverage never was.

### 1.1 The census, measured this session, both games

| | Kittens @ `c52985b` | RR @ `v0.64` |
|---|---|---|
| upgrades with a price list | **143** | **78** |
| …carrying the research currency | **133 — 93%** | **32 — 41%** |
| per-upgrade ratio (cost ÷ its unlocking rung) | **IQR 0.73–1.00, median 0.87** | **0.80** — every generated member exactly there |
| total upgrade research ÷ total tech research | **0.470** | **0.0735** |

**The rate is at parity. The coverage is at 44% of the source's.** `tools/kittens-upgrade-census.mjs`
is the pinned join (v0.64 pass condition 13) and both figures above come from it.

### 1.2 The four stated exemptions are each contradicted by the source, by name

The comment above `DISCOVERY_KNOWLEDGE_SET` (`index.html:3540–3572`) gives four reasons for the 46
Discoveries that pay no knowledge. **All four were checked against `js/workshop.js` this session and
all four fail.**

| RR's stated exemption | the source |
|---|---|
| *"the AXE and SAW lines are exempt: re-forging a tool in a better metal is a material outlay, and the metal IS the cost"* | `steelAxe` **science 20,000** + steel 75; `titaniumAxe` titanium 10 + **science 38,000**; `alloyAxe` **science 70,000** + alloy 25 |
| *"the STORAGE lines are exempt for the same reason"* | `stoneBarns` wood 1,000 + minerals 750 + iron 50 + **science 500**; `reinforcedBarns` **science 800**; `titaniumBarns` titanium 25 + **science 60,000** + steel 200 + scaffold 250 |
| *"HOUSING and pure-capacity facilities are exempt"* | the source has no unpriced capacity upgrade at all; see the next row for the whole exempt population |
| *"everything post-Sparks is exempt HERE, because Part 10 gives that half of the ladder a HEXTECH CRYSTAL component instead. **A Discovery is not taxed twice for being late**"* | **107 Kittens upgrades carry a scarce crafted or converted component and 101 of them ALSO carry science — 94%.** `astrolabe` (`js/workshop.js:1436–1444`) is titanium 5 + **science 25,000** + starchart 75. `unobtainiumReflectors` (`:1467–1477`) is unobtainium 75 + **science 250,000** + starchart 750 |

**The source's ten unpriced upgrades are a single coherent category and RR has no counterpart for
it:** `fluxCondensator`, `amBases`, `amReactors`, `amReactorsMK2`, `voidReactors`, `relicStation`,
`alicornStable`, `voidAspiration`, `turnSmoothly`, `invisibleBlackHand` — every one priced in
antimatter, eludium, time crystals, void or blackcoin, i.e. **post-reset prestige currencies**.
Kittens exempts an upgrade from science when it is bought with a currency that only exists after a
reset. It does not exempt tools, storage, housing, or lateness.

**"A Discovery is not taxed twice for being late" is an RR-invented rule the source contradicts
94% of the time.** §2 records two such rules deleted, §14 a third. This is the fourth, and it is
retired by this Part.

### 1.3 THE COMPARISON THE LAST TWO ROUNDS HAVE BEEN MAKING IS THE WRONG ONE, and correcting it makes the gap larger, not smaller

BUILD REPORT v0.64 §3.3 says RR *"is at about a SIXTH of the source's share"* — 0.0735 against
0.470. **That compares RR's 35-rung tech tree against a 64-rung tree whose top six rungs carry
32,000,000 of its 42,226,130 science and almost no upgrades at all** (`exogeophysics` 25,000,000
with zero upgrades; `blackchain` 5,000,000 with one unpriced; `quantumCryptography` 1,250,000 with
zero; `hydroponics` 1,000,000 with zero). **The source's whole-game ratio is diluted by an endgame
RR does not have.** It is the same class of conflation §31.2a retracted — a whole against a part.

**Restrict the source to the range RR actually occupies and the two trees are nearly the same
size**, which is what makes the comparison legitimate:

| | total tech research | total upgrade research | ratio |
|---|---|---|---|
| **Kittens, techs priced ≤135,000 science** (RR's own largest rung) | **1,431,130** | **2,723,750** | **1.903** |
| **RR, whole tree** | **1,442,630** | **106,010** | **0.0735** |

> **Like for like, over a tech tree of the same total size, Kittens charges 1.90× the tech tree in
> upgrade research and RR charges 0.07×. RR is at 3.9% of the source, not 16%.**

**And full coverage does not overshoot.** Pricing every eligible Discovery at the existing 0.8 × K
rule gives RR **2,003,370** against the same 1,442,630 tree — a ratio of **1.389, which is 73% of
the source's like-for-like 1.903.** The parity-correct move is available and it still lands under
the source.

### 1.4 What to ship

- **`DISCOVERY_KNOWLEDGE_SET` is DELETED and INVERTED.** `applyDiscoveryKnowledge()` walks every
  member of `UPGRADES` and writes `Math.round(K / DISCOVERY_KNOWLEDGE_DIVISOR)` — the existing
  **0.8 × K** — wherever no authored knowledge cost exists, exactly as it does today for the 27
  named members. The named list becomes an **exemption** list and it is **empty**.
- **The only Discoveries that stay unpriced are the three whose unlocking tech has no knowledge
  price at all**, which is a division by zero and not a policy. `applyDiscoveryKnowledge()` already
  `console.error`s that case; keep the guard, make it a skip rather than an error, and name the
  three in the build report.
- **Coverage 32/78 → 75/78 = 96%**, against the source's 93%.
- **Never overwrite an authored figure.** The ten authored costs were sized deliberately in earlier
  rounds; the existing `if (u.cost.knowledge === undefined)` guard is what preserves them and it
  does not move.
- **The crystal component is NOT reduced or removed.** Kittens charges both on 101 of 107, and
  removing one to pay for the other would re-derive the rule this Part retires.
- **`DISCOVERY_KNOWLEDGE_DIVISOR` stays at 1.25.** It is the parity dial and it is already inside
  the source's band. **If this Part overshoots on pacing, the divisor is NOT the relief valve** —
  the in-band range is 0.73–1.00, so the whole legal move is −9%. §1.6 says where the relief
  actually lives.

**Exact figures, stated before the run:** 43 Discoveries gain a knowledge cost, totalling
**+1,897,360**. Total discovery knowledge **106,010 → 2,003,370**. Whole-game ratio **0.0735 →
1.3887**. Largest per-rung totals afterwards: `smelting` 8.00× (10 Discoveries on a 1,500 rung),
`hextech` 4.56×, `sparks` 4.00×, `trade` 3.95×, `songcraft` and `ritesOfTargon` 3.40×. **The
per-RUNG total is not a Kittens invariant (§Part 5 of v0.64, closed) — the source's own range is
0.30–8.19 — so `smelting` at 8.00 is reported, not capped. Do not re-derive `DISCOVERY_RUNG_CAP`.**

### 1.5 The supply side — measured this session, and it changes the prediction

**Knowledge sits at its ceiling for 82.8% of a 2,500-year run**, measured on the shipped v0.64 build,
median seed, and it is classified by `resourceBalance` as one of the *"LUMPY-SINK RESOURCES SITTING
AT THEIR CEILING — the player is full and waiting to spend"*, alongside provisions, culture, renown
and hexore. **Its multiplier reaches ×46.18 at end of run** (Σ 45.18, 56 archives · 49 academies ·
61 observatories · 41 hexLabs) and the delivered figure matches `1 + Σ` to 0.000%.

**The settlement is not knowledge-poor. It is knowledge-saturated four-fifths of the time**, and
`sim/simcore.mjs:1030`'s `kPinned` branch is the bot's own acknowledgement — it moves wanderers off
loremaster when knowledge pins. **Every housing tier at every milestone is stock-bound on timber,
ore or alloy; not one is knowledge-bound.**

> **This is the single measurement that makes Part 1 shippable rather than reckless.** A research
> bill 2.2× larger is being levied on the one currency in the game that is idle at its ceiling for
> most of the run. It will not be free — the ceiling limits how much can be banked for one lump, and
> the bot spends knowledge cheapest-first — but the slack is real and it is large.

**And no new cost can be unbuyable, by construction:** every new figure is `0.8 × K` where `K` is its
own unlocking tech's price, and the ceiling must already clear `K` for that tech to be researched at
all. `0.8K < K`. **Assert it anyway** — pass condition 4a — because "no suite failed" is exactly what
§33 says about a term nobody checked.

### 1.5a The instrument, and it lands BEFORE the prices move (operational rule 3)

**The cap-out fraction above is a SINGLE-RUN figure and it is not enough to size a follow-up.** Emit,
per milestone, from `simcore`'s snapshot:

- `knowledge` gross/s, consumed/s, held, cap, **time-at-cap to date**, and `resourceBalance`'s
  classification (§24) — a resource pinned at its ceiling has slack a resource at 3% does not;
- **cumulative knowledge spent on TECHS and cumulative spent on DISCOVERIES**, as two separate
  running totals, so the ratio this Part is moving is visible in the run and not only in the table;
- the count of Discoveries **owned** and **available but unaffordable**.

**Report all of it on s0 before a single price moves**, and again on the shipped build, so the round
can say how much of the new bill the slack absorbed rather than inferring it from a milestone year.

### 1.6 What to do if the gate breaks, decided in advance

**Prediction: Icathia moves later, by less than the demand increase suggests, and pass condition 1
survives on the median.** Pre-Icathia knowledge spend goes from ~1.55M to ~3.45M — **×2.2** — against
a currency measured idle at its ceiling 82.8% of the run. **My number is +150 to +500 game-years on
the median and the gate holding on at least three of five seeds.** The mechanism that would make it
worse than that is the ceiling rather than the income: the bot buys the cheapest affordable tech
first and then any affordable Discovery, so a heavier Discovery ladder delays a tech by occupying the
stock between purchases.

**If Icathia does not complete on every seed, DO NOT cut the discovery costs back below the
source's band, and do not restore any exemption.** Report it, and report the §1.5 supply figures
beside it. Three things are then true and each is a different round:

1. **The 2,500-game-year budget is an RR-original harness convention, not a source figure.** Kittens
   is a multi-week game. **Whether pass condition 1's horizon should move is Jerry's**, and this
   spec flags it in advance rather than discovering it after.
2. **The relief valve is the knowledge CEILING, not the discovery price, and §1.5a is the
   measurement that would size it.** RR's per-copy knowledge RATES are a direct port of the source's
   biolab/observatory/academy/library and reach ×46.18; what has never been checked is the source's
   `libraryRatio` ceiling line, which `docs/analyzer-status.md` has had dated and unactioned since
   v0.56 — and a resource pinned at its ceiling 82.8% of the time is a ceiling story, not a rate one.
3. **Builder note 4's `CONV_DISCOVERY_LINE` Σ0.65 is the other valve** and Part 7.2 keeps it
   untouched this round precisely so it is available.

**Pass conditions.** `DISCOVERY_KNOWLEDGE_SET` absent at grep level; coverage asserted at **75 of
78** by enumeration from `UPGRADES`, not from a list; the three unpriced named and each shown to sit
on a zero-knowledge tech; **per-upgrade median asserted inside 0.73–1.00 after every load-time
mutation** (v0.64 pass condition 12, unchanged and now over 43 more members); the ten authored
figures unmoved, asserted by value; total discovery knowledge asserted at **2,003,370** and the
whole-game ratio at **1.389** against the source's like-for-like **1.903**, both computed in the
suite rather than written down; **§1.5's supply block emitted at all four milestones on s0 and on
the shipped build**; `auditCostGraph()` and `auditRawGraph()` still 0/0.

---

## Part 2 — DEV NOTE 1: the Training Ground stops boosting Vigor generation, and the source's own carrier takes over

`index.html:894` — `boost: { vigor: 0.10 }` is **deleted**. `caps: { vigor: 150 }` **stays**, and so
does the building, its cost and its ratio. **And the effect is not simply deleted — it is re-homed
onto the carrier the source uses, because deleting it outright over-corrects RR to BELOW the source.
§2.4 is the arithmetic and it is the reason this Part is two moves rather than one.**

### 2.1 The source, and this is a parity correction rather than a pure directive

**Kittens produces manpower from the hunter JOB and multiplies it in exactly two places, neither of
them a building:**

- **`manpowerJobRatio`** — three WEAPON upgrades: `compositeBow` **0.5** (`js/workshop.js:672–691`),
  `crossbow` **0.25** (`:693–706`), `railgun` **0.25** (`:708–…`). **Σ 1.00**, additive, applied to
  village job production by `game.js:3425–3427` (`perTick += resProduction * <res>JobRatio`).
- **`manpowerRatio`** — one building, the **Brewery** (`js/buildings.js:1762`, `:1773`), and its
  value is `game.getEffect("breweryPolicyManpowerRatio")`, which is **0.01 and comes from a policy**
  (`js/science.js:1454`). **Zero outside that policy.**

**Every other `manpowerMax` in the source is a CEILING** — `logHouse` 50, `mansion` 50, the mint
line, the templar line. **The source's shape is exactly the one dev note 1 asks for: a building may
hold Vigor and may not make it.**

**And the magnitudes are three rounds apart.** RR's vigor family carried a raw Σ of **5.443** at end
of run on v0.64 against the source's **Σ 1.00** on the same category. The Training Ground is the
only BUILDING member of that family and is per-copy at 0.10, so it is the term that grew.

### 2.2 The instrument this Part needs, and it lands first

**`knee._members` only enumerates `BOOST_MEMBERS`, so a BUILDING boost is invisible to the audit
that exists.** Before deleting anything, extend the knee snapshot with **`_sources`**: every
family's raw Σ decomposed by contributor — each building by id with its live count and its
contribution, each `BOOST_MEMBERS` entry, each champion passive, each drake term, each policy term —
emitted at all four milestones. **Report the Training Ground's share of vigor's Σ before it is
deleted.** This is v0.64 Part 1's `housing` decomposition applied to the family this Part moves, and
it is one snapshot block.

### 2.3 The Training Ground carries 93% of the family, and here is the arithmetic

**Measured this session on the shipped v0.64 build, median seed, end of run.** Vigor's raw Σ is
**5.4432**, and the family has exactly four contributors:

| contributor | value at final | kind |
|---|---|---|
| **Training Ground** `boost: { vigor: 0.10 }` per copy | **5.0622 — 93.0% of Σ** (≈51 copies) | **BUILDING** |
| Poppy, *Steadfast Presence* `passive: { key: "vigor", base: 15 }` (`:1846–1847`) | 0.1500 | champion passive, RR-original |
| cloud drake, `drakeBonus("cloud", DRAKE_CAP.cloud)` | **0.2310** — printed by the run at *"cloud 3 kills → +23.1% of 100%"* | drake, RR-original |
| `policyBoost("vigor")` | **0** — `policyBoost()` has no `vigor` branch (`:4103–4115`) | policy |

**Delete the building term alone and vigor's Σ falls 5.4432 → 0.3810 — a multiplier of ×1.38
against the source's ×2.00.** That is a 79% cut to vigor production and it lands RR **below** the
source, which §16 does not ask for and no directive asks for either. **Dev note 1 is about the
BUILDING, not about vigor multipliers existing.**

### 2.4 So the effect moves to the source's own carrier: a three-rung weapon line

**RR is missing Kittens' weapon line entirely.** §18 established that RR's five hunt Discoveries map
onto the source's **armour and bolas** upgrades, which feed `hunterRatio` — the HUNT YIELD category
(RR's `campYieldMult`). **`compositeBow` / `crossbow` / `railgun` are a different line feeding a
different category** (`manpowerJobRatio`, the manpower PRODUCTION category), and RR ports neither the
line nor the category's magnitude.

**Ship the line, rank for rank, at the source's own shares:**

| RR Discovery | source rung | share | tech |
|---|---|---|---|
| tier 1 — the composite bow analogue | `compositeBow` **0.50** | **0.50** | an Era-1 rung at or near `mining`/`smelting`, matching the source's science 500 |
| tier 2 — the crossbow analogue | `crossbow` **0.25** | **0.25** | a mid rung, the source's science 12,000 |
| tier 3 — the railgun analogue | `railgun` **0.25** | **0.25** | an Era-3 rung, the source's science 12,000-class successor |

**Σ 1.00, additive, into the existing `boosts.vigor` accumulator as three `BOOST_MEMBERS` entries.
No new category (§31).** Each carries a knowledge cost from Part 1's rule and materials of its own
era. **Where a Discovery of the right fiction already exists, re-home rather than add** — the build
report states which of the three are new and which are re-pointed.

**Vigor's Σ after both moves: 0.3810 + 1.00 = 1.381 → ×2.381**, against the source's `manpowerJobRatio`
**Σ 1.00 → ×2.00** plus its policy-gated Brewery term. **RR lands 19% above the source and the
excess is exactly its two RR-original terms — Poppy 0.15 and the cloud drake 0.231 — both already
ledgered EASIER.** That is a parity landing, arrived at by removing a carrier the source does not
have and adding one it does.

### 2.5 What this predictably does, stated before the run

Vigor feeds hunts → renown → champions → champion affinities → `convMult`, and it pays for
expeditions and for every caravan's 135. **×6.44 → ×2.38 is a 63% cut to vigor income even after the
weapon line lands. Expect fewer expeditions per game-year, later champions, fewer trades, and a
knock-on to Sparks** — which is champion-gated (§4). **Part 5 exists partly because this Part makes
the champion draw matter more, not less.**

**`BOOST_LIMIT.vigor` stays at 8.0 and is NOT re-sized down to the new Σ.** A rail is sized to sit
above the reachable range (v0.64 Part 2, on Jerry's ruling, and Solar Revolution's limit 10 against a
reachable 4.5); a rail further above the range is still a rail. **Re-sizing it would be tuning a
condition that passed** (7.1), and the whole point of Option B is that the ceiling is never felt.

**Pass conditions:** `boost: { vigor:` absent from `trainingGround` on stripped source; the
building's `caps: { vigor: 150 }` unmoved and asserted; **`knee._sources` emitted at all four
milestones, with the Training Ground's pre-deletion share of vigor's Σ reported as a number and
checked against this spec's 93.0%**; the three weapon rungs present as `BOOST_MEMBERS` at
0.50 / 0.25 / 0.25 with `js/workshop.js:672–720` cited at the site; **vigor's raw Σ asserted at the
new value and asserted BELOW the knee of 6.00**; the **DELIVERED** vigor multiplier asserted, not the
presence of the keys (§33); `BOOST_LIMIT.vigor` still 8.0; expeditions run per game-year and trades
total reported before and after; the Training Ground's ledger row re-rated and three new rows added
with the source rungs named.

---

## Part 3 — DEV NOTE 3: the Longhouse's provisions component returns, sized so it cannot bind

**Jerry's note is conditional — *"if provision cost on the Longhouse was not a limiting factor"* —
and the honest answer is that it was not a limiting factor EARLY and would be one LATE.** Both
halves are measured:

- **Early: not limiting.** BUILD REPORT §1.3 — at 300 game-years the settlement stood **12
  Longhouses against the 29 the old ceiling already allowed**, and s1 reproduced s0 **byte-identically**.
- **Late: limiting, and by a measured amount.** At end of run the settlement stands **44
  Longhouses**, the tier is **stock-bound on timber at 59**, and the provisions cap is **976,685**.
  The old component's ceiling-bound maximum is `floor(ln(cap ÷ 1200) ÷ ln 1.15) + 1` = **48**.
  **48 against a stock-bound 59: restoring 1,200 verbatim costs 11 population at end of run and
  re-imposes precisely the coupling §20's storage cut collapsed population through** (179 → 135, two
  rounds to recover). Jerry's conditional therefore evaluates to *"it was not a limiting factor, and
  at 1,200 it would become one again."*

### 3.1 The rule that sizes it, and the number it produces

**Restore the component, and choose the base so the ceiling-bound copy count exceeds the stock-bound
copy count by at least 25% at EVERY milestone.** The `housing` instrument already emits both numbers
per tier (`ceilingCopies` and the binding resource, `sim/simcore.mjs:618–656`), so this is a measured
choice and not a guess:

> **base ≤ provisionsCap ÷ 1.15^(1.25 × stockBoundCopies − 1)**, evaluated at every milestone and
> the tightest one wins.

**Evaluated on the v0.64 ensemble this analyzer re-ran this session, median seed:**

| milestone | provisions cap | Longhouse stock-bound max | required ceiling max (×1.25) | **max base** |
|---|---|---|---|---|
| sparks | 68,250 | 40 | 50 | **72** |
| hexcore | 471,875 | 53 | 67 | **46** |
| icathia | 571,913 | 54 | 68 | **49** |
| **final** | **976,685** | **59** | **74** | **36 — the binding milestone** |

> **SHIP `provisions: 30`.** Rounded down from 36 for margin. At 30 the ceiling-bound maximum is
> **56 / 70 / 71 / 75** against stock-bound **40 / 53 / 54 / 59** — a margin of 1.40 / 1.32 / 1.31 /
> **1.27** at the four milestones, clearing the ≥1.25 rule at all four including the tightest.

**And state the size of the sink honestly, because that is what the note asks for.** Forty-four
copies at base 30 and ratio 1.15 cost **≈93,500 provisions in total**, the 44th copy alone costing
**≈12,200**. That is a real lump sink and it is **two orders of magnitude smaller than the old
1,200's would have been** — because the never-bind rule is what caps it. **If Jerry wants a
provisions sink larger than ~95,000 over a run, the Longhouse is structurally the wrong carrier: a
ratio-1.15 component on a 44-copy building cannot be large without becoming a ceiling.** A
continuous consumer or a low-copy-count building can. That finding is reported, not actioned.

**Why not a flat, non-scaling component.** It would be new machinery (`buildingCost()` multiplies
every component by `ratio^n`, `index.html:5835–5838`) and **Kittens scales every price component
uniformly** — there is no flat component anywhere in `js/buildings.js`. A mechanism RR invents to
make a divergence comfortable is how the project acquires its fifth RR-invented rule.

### 3.2 The label, and it is not a parity claim

**Kittens' `logHouse` costs wood 200 + minerals 250 and no food** (`js/buildings.js:476–487`). A
provisions component on RR's mid housing tier is **RR-ORIGINAL** and the ledger row says so —
**HARDER**, with the sizing rule stated, exactly as §17's precedent requires. v0.64 deleted this
component as a parity correction and it is being restored on a directive; **directives override the
spec, and what §16 forbids is shipping it as parity.**

**Pass conditions:** the component restored at the computed base with the arithmetic shown;
**`ceilingCopies` and the binding resource for every housing tier at all four milestones, before and
after**; the ceiling-bound count above the stock-bound count by ≥25% at every milestone, or the Part
reported as not shippable; **peak population still inside §27's 150–220 band on the median and
Icathia unaffected** — Part 7.1's guard; provisions time-at-cap and total provisions spent on
Longhouses reported, because the note's stated want is a sink; the ledger row **RR-ORIGINAL /
HARDER** with `js/buildings.js:476–487` cited.

---

## Part 4 — The fourth mana Discovery — the one undischarged condition (builder note 2)

**v0.64 pass condition 17 says ship it on a measured deficit. The deficit was measured — hexcore
−0.40/s (ratio 1.003) and final −14.52/s (ratio 1.011) — and the measurement arrived with the final
gate, so the round handed it on rather than shipping it unverified. This Part discharges it.**

### 4.1 Read §11.6's caution first, and it changes the sizing rather than the decision

−0.40/s against a gross of 119.35/s is **0.3%**; −14.52 against 1,351.27 is **1.1%**. **A ratio
pinned at ≈1.00 is a system in equilibrium**: the seven mana-consuming converters are throttled by
mana availability and consume what arrives. That is a binding constraint, not a collapse.

**The consequence for sizing: the target is not "make the deficit go away", it is "raise the
throughput the constraint is throttling."** Mana is the input to the Zaun extractor line and the
Shimmer Refinery; a mana increase shows up as **Era-3 raw output**, not as a large positive net
mana, because the converters will consume the new supply. **Predict the ratio to stay near 1.00 and
the gross to rise.** A report that claims victory because net mana went positive has measured the
wrong thing.

### 4.2 What to ship

- **One Discovery, +25% into the existing `boosts.mana` accumulator** as a `BOOST_MEMBERS` entry.
  **No new category** (§31): the accumulator already carries `leylineCalibration` 0.30,
  `trueIceCellars` 0.20, `hexresonance` 0.25 and Swain's passive, additively. Four members in one
  additive category is the source's own shape — `barnRatio` runs six (§19).
- **On `hexcore`, which is the milestone the deficit first appears at, and NOT on `sparks`** —
  builder note 2 and the v0.64 spec both say `sparks` already carries a mana Discovery.
- **The headroom is measured and it fits.** `BOOST_LIMIT.mana` is 2.0, knee **1.50**, and the
  end-of-run raw Σ is **1.050**. A fourth member at 0.25 takes Σ to **1.30 — still below the knee,
  so it is delivered in full**, which is the property Option B's rail was shipped for.
- **It pays Part 1's price like every other Discovery:** knowledge `0.8 × 75,000 = 60,000`, and
  because its fiction is hextech it **joins `DISCOVERY_CRYSTAL_SET`** at `round(75,000/100) = 750`
  crystals. A crafted component of its own era per Part 3 of v0.64's rule.

**Predicted vs measured, stated before the run:** mana gross at hexcore **119.35/s → ~134/s**
(+12.2%, being 1.30 delivered against 1.05); consumed÷produced at hexcore and final **stays inside
0.90–1.02**; net mana **no longer negative at any milestone**; **Zaun Ore, Coalgas and Hexcrystal
Ore gross all up**, which is the effect the Part is actually for.

**Pass conditions:** exactly one new `BOOST_MEMBERS` entry, family `mana`, amount 0.25, on a tech
that is not `sparks`; `boosts.mana` raw Σ asserted at the new value and asserted **below the knee**;
**the delivered value asserted, not the presence of the key** (§33); net mana/s and consumed÷produced
at all four milestones before and after; the three Zaun raws' gross at all four milestones before
and after; the Discovery carries a knowledge cost from Part 1's rule and a crystal cost from
`DISCOVERY_CRYSTAL_SET`; `auditCostGraph()` passes; the new building/upgrade added to the bot's
lists in the same commit (Appendix rule).

---

## Part 5 — The champion draw stops confounding three conditions (builder note 3)

**Three of v0.64's four failing conditions are one random variable and the v0.64 spec predicted it
before the round ran:** Sparks spread **×1.98**, first champion **×1.85**, Chemtech→Hexcore
**×2.70**. Sparks is champion-gated on a 3-of-10 choice (§4, the sanctioned exception), so its year
is dominated by *when a Piltover/Zaun champion is drawn*, and everything downstream inherits it.

**"Take more seeds" treats the symptom. Measure the confounder instead.**

- **Instrument `firstPZChampion`** — the game-year the first of `twitch`, `caitlyn`, `heimerdinger`
  is recruited, marked in `simcore`'s milestone map exactly as `firstChampion` is. It is the gate's
  own literal condition (`["twitch","caitlyn","heimerdinger"].some(recruited)`) and nothing in this
  project has ever measured it.
- **Report `sparks − firstPZChampion` as a derived ENSEMBLE figure with its own median and
  spread.** That difference is the part of Sparks' timing the designer controls: the knowledge and
  build-out after the gate opens. Sparks itself is the draw plus that.
- **The three conditions are labelled `[draw]` this round and are REPORTED, NOT FAILED.** A `[draw]`
  condition is one whose value is dominated by a random draw the design does not set; it prints its
  median, its spread, and the draw's own median and spread beside it. **Nothing steers on it until
  the instrument has produced a distribution** — which is the v0.64 spec's own instruction,
  *"report Sparks with its draw, or do not steer on it"*, made mechanical.
- **The final gate runs at FIVE seeds, not three** (Part 8). Three is not enough for a variable with
  a ×2.70 spread, and builder note 3 asks for more.

**This does not soften the Sparks gate itself.** §4 is closed; the exception is sanctioned; nothing
about the gate changes. What changes is that the round stops reading a champion draw as a pacing
result.

**Pass conditions:** `firstPZChampion` emitted per seed and as an ensemble figure with median and
spread; `sparks − firstPZChampion` emitted the same way; the three conditions printed with the
`[draw]` label and their draw beside them; **the ensemble at five seeds**; no condition's target
changed on the strength of a three-seed median.

---

## Part 6 — RULED: per-upgrade parity is the target, not Rites-under-75 (builder note 5)

**The builder asked the analyzer to decide and the decision is per-upgrade parity.** Part 5 of
v0.64 restored the generated Discoveries to the source's 0.80 × K and Rites of Targon went 61.1 →
103.4 on seed 1 (median still passing at 68.6). Part 1 of this spec will press on the same milestone
much harder.

**The reasoning, and it is §27's precedent almost exactly:**

1. **"Rites of Targon before y75" is an RR-original target that was never derived.** Kittens has no
   "first religion by year N" anywhere in the source. §27 retired "130 wanderers before year 600"
   for exactly this reason after it failed five consecutive rounds, and every other number improved
   when the project stopped defending it.
2. **The per-upgrade ratio IS the source's own invariant** — IQR 0.73–1.00 across 133 upgrades,
   median 0.87, and it is the one quantity the source holds tight while the per-rung total ranges
   0.30–8.19.
3. **§16 settles the tie.** The source is the balance authority; a milestone year measured off the
   bot is evidence about the instrument's playthrough.

**What ships:** the condition is **restated, not deleted** — Rites of Targon becomes a **reported
figure with a `[median]` band of y50–200** rather than a ceiling at 75, and the build report states
the year alongside the per-upgrade median every round. **If a future round wants Rites earlier, the
move is knowledge SUPPLY (§1.6), never a discovery price below the source's band.**

**Pass conditions:** the condition restated in `sim/pacing.mjs` with this ruling cited at the site;
Rites reported with its median and spread; **no discovery knowledge figure moved to serve it.**

---

## Part 7 — Three things not to touch

### 7.1 Population — the gate and the band both cleared (builder note 1)

Icathia **3 of 3** and peak population **180 median, all three seeds inside §27's band**, after
three rounds of failing both. **No round tunes a condition that passed.** Nothing in this spec aims
at population — but **Parts 1, 2 and 3 all press on it indirectly** (research demand, vigor, and a
housing cost respectively), so both are **GUARD conditions** this round: they must still pass, and
if they do not, the report says which Part did it. That is a guard, not a target.

### 7.2 `CONV_DISCOVERY_LINE` — untouched, and it is the release valve (builder note 4)

Dev note 2 of v0.64 took the Zaun extractors' conversion multiplier **×4.28 → ×20.35** in a real
run — the round's biggest lever, shipped inside a four-note PRNG re-roll slice and therefore
unattributed. **Era 3's median is 1,262.7 against v0.63's 982.8 — longer, not shorter — so Era 3
does not look too fast and there is nothing to correct.** Leave Σ0.65 exactly where it is. **This
round pushes Era 3 longer again; keeping this constant untouched keeps one large, well-understood
accelerator available if Part 1 overshoots.**

### 7.3 Part 1.2b — not shipped (builder note 6)

The Skyrise carries 56 of the final 180 population and `deepWorks` still lands at a median of
y1,655, so the tier-3 rung is still 86% up RR's ladder against the source's 34%. **But the gate it
was insurance for has cleared, and 7.1 forbids tuning a condition that passed.** It stays available.
If a future round takes it, the v0.64 spec's analysis stands: **move the RUNG, not the price.**

### 7.4 Also untouched

`CRYSTAL_SINK_MAX` (8) · `DISCOVERY_RUNG_CAP` (retired, do not re-derive) · `capFamilyOf()`'s two
families · `BARN_LINE`/`WAREHOUSE_LINE` Σ 4.35 / 1.80 · `CONSUMPTION` 4.25 · `XP_PER_SECOND` 0.05 ·
the rank ladder · every per-copy production rate (Part 1 moves research PRICES only).

---

## Part 8 — Order, discipline, pass conditions

### Order, and Part 1 is deliberately last

| slice | contents | why here |
|---|---|---|
| **s0** | v0.64 shipped file, unchanged, **with §1.5's knowledge-supply block and §2.2's `knee._sources` block added to `sim/` only** | instrument before you change the thing; the baseline must be measurable with every readout the round adds |
| **s1** | **Part 2** — the Training Ground's vigor boost deleted | one line, one family, PRNG-neutral |
| **s2** | **Part 3** — the Longhouse's provisions component restored at the computed base | PRNG-neutral; its own instrument already exists |
| **s3** | **Part 4** — the fourth mana Discovery | PRNG-neutral; a new Discovery changes no random draw |
| **s4** | **Part 5** — `firstPZChampion` and the `[draw]` labels, **`sim/` only** | **must be PRNG-neutral and must be PROVED so** (§32 rule 2): marking a milestone must not add or remove a `Math.random()` call. If s4 does not reproduce s3's seeded figures to the digit, it is wrong |
| **s5** | **Part 6** — the Rites condition restated, **`sim/` only** | reporting change |
| **s6** | **Part 1** — the discovery coverage. **LAST, and alone** | the round's only large change, and the only one E1 → E2 has to attribute |

**E0 — DO NOT RUN IT.** The v0.64 baseline was re-measured by this analyzer this session, three
seeds, 2,500 game-years, 4,463 s wall, and it reproduces BUILD REPORT §11.2 **to the digit on every
figure**. Those numbers are in §10 and in the predicted-vs-measured table above. **That saves the
round ninety minutes and it is the only reason two ensembles fit.**

**E1 — the full-length ensemble on s5, three seeds.** Everything except Part 1.
**E2 — the full-length ensemble on s6 = the shipped build, FIVE seeds.** The round's gate.
**s0 → E1 attributes Parts 2, 3 and 4 as a group; E1 → E2 attributes Part 1 alone**, which is the
one change large enough that a group attribution would be worthless. That is the reason for the
order.

### Operational

`--years 2500`. **`nproc` is 2**; v0.64's three-seed run took **87 minutes**. Budget **90–120
minutes for E1 and 150–210 for E2**, and launch with `setsid nohup … & disown`, polling
infrequently. **Kill by PID from `ps -eo pid,args`, never `pkill -f`** (§9, twice-made mistake).
Playwright: `chromium.launch({ executablePath: "/opt/pw-browsers/chromium" })` with a `.catch()`
fallback; **never `playwright install`** — and note that a fresh checkout has no `node_modules`, so
`PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1 npm install` comes first or every suite dies with
`ERR_MODULE_NOT_FOUND` and the runner correctly reports 35 dead suites.

**Cumulative prefixes built FORWARD, hash-proved against the shipped file** (`tools/mk-slices-v65.py`,
the v0.64 tool re-pointed). **Every slice in this round is PRNG-neutral** — no change alters how
many draws a live path makes — so the whole chain is seed-for-seed comparable and s4's reproduction
of s3 is the proof.

### Round pass conditions

| # | Condition | Target |
|---|---|---|
| **1** | **Icathia on all five seeds** | **GUARD (7.1). If it fails, report it against §1.5's supply figures — do NOT cut a discovery price below the source's band (§1.6)** |
| **2** | **Peak population 150–220 [median]** | **GUARD (7.1)** |
| **3** | `DISCOVERY_KNOWLEDGE_SET` | gone; coverage **75 of 78** asserted by enumeration |
| **4** | The three unpriced Discoveries | named, each shown to sit on a zero-knowledge tech |
| **4a** | No Discovery's knowledge cost exceeds the knowledge CEILING at its own tech | asserted, not argued — `0.8K < K` is a proof, and §33 is why it is asserted anyway |
| **5** | Per-upgrade median | **inside 0.73–1.00** after every load-time mutation, over all 75 |
| **6** | Total discovery knowledge · whole-game ratio | **2,003,370 · 1.389**, computed in the suite, against the source's like-for-like **1.903** |
| **7** | The ten authored figures | unmoved, asserted by value |
| **8** | Knowledge supply block | gross/s, consumed/s, held, cap, **time-at-cap**, cumulative tech spend, cumulative discovery spend, Discoveries owned and unaffordable — **at all four milestones, on s0 AND on the shipped build** |
| **9** | Training Ground | `boost: { vigor: … }` absent; `caps: { vigor: 150 }` unmoved |
| **9a** | The weapon line | three `BOOST_MEMBERS` at **0.50 / 0.25 / 0.25** into `boosts.vigor`, `js/workshop.js:672–720` cited; vigor Σ **≈1.381**, below the 6.00 knee; **DELIVERED value asserted** |
| **10** | `knee._sources` | every family's raw Σ decomposed by contributor at all four milestones; **the Training Ground's pre-deletion share of vigor's Σ reported as a number and checked against 93.0%** |
| **11** | `BOOST_LIMIT` | **unchanged — vigor 8.0, devotion 5.0, provisions 3.0, mana 2.0**, crystals/gold/culture untouched |
| **12** | Longhouse | **`provisions: 30`** restored, §3.1's four-milestone table reproduced on the round's own run |
| **13** | Housing decomposition | `ceilingCopies` and binding resource per tier at all four milestones, **before and after**; ceiling-bound ≥ 1.25 × stock-bound at every milestone, or Part 3 reported as not shippable |
| **14** | Longhouse ledger row | **RR-ORIGINAL / HARDER**, `js/buildings.js:476–487` cited |
| **15** | Fourth mana Discovery | one `BOOST_MEMBERS` entry, family `mana`, 0.25, **not on `sparks`**; Σ asserted **below the knee**; **DELIVERED value asserted** (§33) |
| **16** | Mana | net/s and consumed÷produced at all four milestones **before and after**; the three Zaun raws' gross likewise |
| **17** | `firstPZChampion` | emitted per seed and as an ensemble figure; **`sparks − firstPZChampion` emitted with median and spread** |
| **18** | The three draw conditions | printed `[draw]`, reported not failed, with the draw beside them |
| **19** | Rites of Targon | restated as `[median]` band y50–200 with Part 6's ruling cited at the site; **no discovery price moved to serve it** |
| **20** | Untouched | `CONV_DISCOVERY_LINE` Σ0.65 · `CRYSTAL_SINK_MAX` 8 · `DISCOVERY_RUNG_CAP` still absent · Part 1.2b not shipped · `capFamilyOf()` two families · audits 0/0 · Σ 4.35/1.80 · `CONSUMPTION` 4.25 · `XP_PER_SECOND` 0.05 |
| **21** | Slice chain | built forward, **s6 byte-identical to the shipped file**, and **s4 reproduces s3's seeded figures to the digit** (§32 neutrality proof) |
| **22** | Every Part | actioned, or its non-action explicitly justified |

### Predicted vs measured — stated before any run

| slice | Icathia [median] | peak population [median] | note |
|---|---|---|---|
| **s0** = v0.64 shipped | **1,694.2 — 3 of 3** (2,234.7 / 1,339.9 / 1,694.2) | **180** (165 / 191 / 180) | **re-measured this session and it reproduces the build report to the digit — do NOT re-run it** |
| **s1** vigor: Training Ground out, weapon line in | **+100 to +400** | **0 to −10** | vigor ×6.44 → ×2.38. Population is not downstream of vigor; **Sparks and the champion ladder are** |
| **s2** Longhouse provisions 30 | **0** | **0 to −5** | sized never to bind at any milestone; if population falls materially the sizing rule failed and §3.1's finding applies |
| **s3** fourth mana Discovery | **−50 to −200 (EARLIER)** | **0** | the round's only accelerator: Zaun raw gross up, and Era 3 is what runs out of them |
| **s4, s5** | **0 — byte-identical to s3** | **0** | `sim/`-only. s4's reproduction of s3 is the §32 neutrality proof and it is the slice most likely to break it |
| **s6** discovery coverage | **+150 to +500** | **0 to −15** | pre-Icathia knowledge spend ×2.2 against a currency idle at its ceiling **82.8%** of the run |
| **shipped (E2, five seeds)** | **1,900–2,400 median, 3 to 5 of 5 completing** | **160–190** | |

**The single prediction this spec stakes itself on: knowledge's 82.8% time-at-cap means Part 1 costs
far less than its ×2.2 demand increase implies.** If Icathia moves by more than +900 on the median,
that reading is wrong and the resource was ceiling-bound rather than slack — **which is a finding
worth the round on its own**, because it would mean §24's classification of knowledge as a
lumpy-sink-at-ceiling is describing a queue rather than a surplus.

**And one prediction against my own Parts.** I expect **Part 2 to be small on population and large
on Sparks**, because vigor's only path to population is the long one through champions. **If a 63%
cut to vigor income moves peak population by more than 10, vigor was feeding something nobody has
named — say so rather than absorbing it.** And I expect **Part 3 to be exactly zero on everything**;
it is sized never to bind, so a non-zero result means the sizing rule is wrong, not that the note
was.

---

## Sources, all read this session

**Line numbers pinned to `nuclear-unicorn/kittensgame` at `c52985b`, cloned to disk.**

**Kittens:** `js/workshop.js` — the full upgrade table, **143 priced, 133 carrying science (93%)**,
per-upgrade IQR **0.73–1.00**, median **0.87** via the pinned join in
`tools/kittens-upgrade-census.mjs`; `:672–691` `compositeBow` (`manpowerJobRatio` **0.5**, science
500), `:693–706` `crossbow` (**0.25**), `:708–…` `railgun` (**0.25**) — **Σ 1.00, the source's entire
manpower production multiplier**; `:1436–1444` `astrolabe` (titanium 5 + **science 25,000** +
starchart 75); `:1467–1477` `unobtainiumReflectors` (unobtainium 75 + **science 250,000** + starchart
750); `steelAxe` **science 20,000**, `titaniumAxe` **science 38,000**, `alloyAxe` **science 70,000**,
`stoneBarns` **science 500**, `reinforcedBarns` **science 800**, `titaniumBarns` **science 60,000** —
the four RR exemptions, each contradicted; the ten science-free upgrades enumerated, **all ten priced
in post-reset prestige currencies**. `js/buildings.js:476–487` — `logHouse`, wood 200 + minerals 250,
ratio 1.15, **no food component**; `:1762`, `:1773` — the Brewery, the source's ONLY building
`manpowerRatio`, valued from `breweryPolicyManpowerRatio`; `js/science.js:1454` — that policy's
**0.01**. `game.js:3425–3427` — `perTick += resProduction * <res>JobRatio`, where the weapon
upgrades land; `:3429–3440` — the five production categories; `js/religion.js:1548–1550` — Solar
Revolution's limit 10 against a reachable ~4.5, the rail pattern.

**Kittens, measured this session:** a per-tech join of science price against the science its own
upgrades cost, for all 64 techs — **six techs carry 32,000,000 of the tree's 42,226,130 science and
between them hold zero priced upgrades**; restricted to techs at or under **135,000** science (RR's
largest rung) the source's tree totals **1,431,130** against RR's **1,442,630**, and its upgrade
science is **2,723,750** — **ratio 1.903**; **107 upgrades carry a scarce crafted component and 101
of them also carry science**.

**RR**, at the `v0.64` tag: `index.html:263` `VERSION`; `:894` the Training Ground's
`boost: { vigor: 0.10 }` and `caps: { vigor: 150 }`; `:630–632` the Longhouse at `{ timber: 220,
ore: 260 }`; `:2980` `BOOST_LIMIT`; `:3017–3032` `BOOST_MEMBERS`; `:3572` `DISCOVERY_KNOWLEDGE_SET`
and `:3589` `applyDiscoveryKnowledge()`; `:3540–3572` the four stated exemptions; `:5835–5838`
`buildingCost()` and its uniform `Math.pow(ratio, n)`; `:5521` `TRADE_PROVISIONS` 3,500; `:4508`
`CRYSTAL_SINK_MAX` 8; `:6729–6730` the `boosts` literal now declaring `timber` and `ore`;
`sim/simcore.mjs:618–656` the `housing` decomposition, `:392–404` the knee audit and its
`_members`, `:1030` `kPinned`, `:1229–1243` the bot's research-then-discoveries order.

**RR, measured this session:** all 35 suites re-run from disk (**1,956 passed, 0 failed**);
`tools/parity-ledger.mjs` re-run (**225 / 87 / 116 / 22 / 0**, exact); `tools/era-gate-audit.mjs`
re-run (**51 / 27 / 2**); `sha256` equality of `snapshots/v64/s8.html` and `index.html`; a live probe
of every Discovery against its unlocking tech (**32 of 78 priced, 106,010 total, whole-game
0.0735**; full coverage would be **2,003,370 / 1.389**; **five** members outside the source's IQR,
not the report's two); a live measurement of the Demacian Accord at 30 miners and 30 woodcutters
(**+9.585% on both timber and ore**, reproducing BUILD REPORT §8 exactly); a three-seed 2,500-year
ensemble on the shipped `v0.64` build, re-run independently — §10 of this spec reports it against
the build report's own.

---

## 10 — v0.64 verified, part by part, from disk

**Every claim below was checked by grep or by measurement this session, on a fresh clone at the
`v0.64` tag. Nothing here is taken from the build report.**

| v0.64 spec item | shipped? | how verified |
|---|---|---|
| **1.2a** Longhouse provisions deleted | **YES** | `index.html:632` — `cost: { timber: 220, ore: 260 }`, `js/buildings.js:476–487` cited at the site |
| **1.2b** third housing tier brought forward | **NOT SHIPPED — justified** | the spec makes it conditional on 1.2a not clearing the gate; the gate cleared. BUILD REPORT §1.4 |
| **2** `BOOST_LIMIT` rails | **YES** | `:2980–2981` — devotion 5.0, culture 2.0, gold 1.5, vigor 8.0, crystals 2.0, provisions 3.0, mana 2.0. Knee audit at final: **0 families past the knee**, every family 0% thrown away |
| **2.5** one ensemble per family | **NOT SHIPPED — declared FAIL in the report** | one 300-year slice per family instead, per Jerry's session protocol. The report states the weakness rather than hiding it |
| **3.1** Coalgas Vent takes `plating` | **YES** | `:924` — `{ timber: 250, ore: 420, steel: 20, plating: 8 }` |
| **3.2** era-tier audit + Hexcrystal Quarry gate | **YES** | `:939` — `alloy: 6` added. `tools/era-gate-audit.mjs` re-run: **51 buildings, 27 gated, Era-2+ ungated 2** — the report's figures exactly |
| **4** mana measured, fourth Discovery on a deficit | **PARTIAL — and honestly reported** | deficit found at hexcore (**−0.3994/s, ratio 1.0033**) and final (**−14.52/s, ratio 1.011**), reproduced by my own ensemble to four decimals. Not shipped; §11.6 states why. **Part 4 of this spec discharges it** |
| **4** Swain's two slots ledgered distinct | **YES** | `docs/PARITY-LEDGER.md:338` and `:353` — neither row states the other's magnitude |
| **5** `DISCOVERY_RUNG_CAP` retired | **YES** | absent at grep level from `index.html`; `greatLibrary` **12,000** (`:3489`), `masterOfTheHunt` **3,600** (`:3462`) |
| **6** `TRADE_PROVISIONS` 3,500 | **YES** | `:5521` |
| **7** `CRYSTAL_SINK_MAX` untouched | **YES** | `:4508` — 8 |
| dev note 1 Sump Ventilation → `boosts.ore` | **YES** | `BOOST_MEMBERS` `:3031`; Demacian Accord **measured +9.585%** on both timber and ore at 30 miners / 30 woodcutters, reproducing BUILD REPORT §8 exactly |
| dev note 2 converter scope | **YES** | `convMult` at final: worked **×7.008**, autoprod **×20.350** — the report's figures |
| dev note 3 Sump Crawl cooldown | **YES** | `:5039` — `cooldown: 450` |
| dev note 4 devotion role separation | **YES** | `SHRINE_DEVOTION_CAP` 50 (`:493`), `CHAPEL_DEVOTION` 0.015 (`:494`), `MARUS_DEVOTION_CAP` 250 (`:492`) and the Marus's `prod` key absent (`:1391`) |
| §9 slice chain | **YES** | `sha256(snapshots/v64/s8.html) == sha256(index.html)` = `c170821200f7c6b65ede8529e5aa32987e3485ab41d86630846ef7287b854074` |

**The ensemble reproduces exactly.** Three seeds, 2,500 game-years, re-run independently on the
shipped `v0.64` build: Icathia **2,234.7 / 1,339.9 / 1,694.2**; peak population **165 / 191 / 180**;
Era 3 median **1,262.7**; Sparks **855.3 / 510 / 431.5**; Rites **103.4 / 61.3 / 68.6**; first
champion **134.6 / 248.4 / 135.6**; **4 of 10 conditions failing**; crystals cap-out 20.5%,
provisions 51.1%, culture 95.7%, renown 83.5%, morale 100%, trades 165,063. **Every figure matches
BUILD REPORT §11.2 and §11.3 to the digit.**

**Two discrepancies, both in the report's prose rather than its measurements:**

1. **§3.3 says "two residual outliers" outside the source's per-upgrade band. There are five** —
   `standingOrders` 0.10, `surveyedApproaches` 0.10, `slabCutting` 0.70, `beastLore` 1.25,
   `chemtechDistillation` 1.364. The report names the first and the last. Its stronger claim —
   **every GENERATED member sits exactly at 0.80** — is true.
2. **The live comment at `index.html:3571` claims the knowledge set takes the game "from 10 of 78 to
   35 of 78 — 13% to 45%". The measured coverage is 32 of 78 — 41%.** Part 1 makes both figures
   obsolete, but the comment was wrong when it was written.

**Neither changes a conclusion in the report.** They are recorded because §8's failure mode runs both
ways: an analyzer that flags shipped work as unshipped is the common error, and an analyzer that
waves a figure through because the surrounding argument is sound is the quieter one.
