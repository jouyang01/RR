# BUILD REPORT v0.61 — the converter stack decomposed, a suite that lied for two rounds, and a trade loop the source's own shape opened

Built against the `v0.60` tag from `docs/specs/rr-analyzer-v061-spec.md`, plus Jerry's four dev
notes. **Dev notes supersede the analyzer**, and one of them cancels the round's largest proposed
change.

---

## 1. Part 1 — the ×19.77 was two categories multiplied, and the finding reverses

v0.60 §2 reported the "converter-side stack" at **×19.77** against Kittens' `calcinerRatio` ×3.70
and concluded RR runs **×5.3 the source**. The spec's Part 1 said that figure does not decompose,
and it is right.

**×19.77 was `convMult × (1 + boosts.crystals)` — two different categories multiplied together —
compared against ONE Kittens category.** `boosts[o]` multiplies *outside* `convMult`, in the
converter-output loop; it is a `<res>GlobalRatio` member, not a conversion upgrade. `convMult`
alone cannot exceed **×5.3728** on a fully maxed state (×8.0590 with the transient cinder buff).

**Made like-for-like, the finding reverses:**

| | value |
|---|---|
| Kittens, three upgrades, one additive category (`calcinerRatio` Σ2.70) | **×3.70** |
| RR, three conversion Discoveries, as shipped before this round (chained ×1.25 × ×1.15 × ×1.25) | ×1.7969 |
| RR, same three, now ADDITIVE (Σ0.65) | **×1.65** |

**RR's conversion upgrade line runs at 45% of the source's. It is half as strong, not five times
as strong.** Two rounds argued from the opposite number.

**Where the excess actually is:** entirely two RR-original systems multiplying on top — the
**infernal drake ×1.495** (`strictDR`, capped at 0.5) and the **overseer champion affinity
×2.000** (five champions × 2 × level, level capped at 10). **Both are bounded**, which is worth
recording because neither is obviously so, and both are ledgered EASIER.

### 1.1 The two pass conditions that cannot both hold

**Condition 1 asks for the ceiling asserted at ×5.3728 / ×8.0590. Condition 2 asks for the three
Discoveries to become additive. Making them additive CHANGES that ceiling.** ×5.3728 is
`1.4950 × 1.7969 × 2.0000` — the *multiplicative* form. After the collapse the ceiling is
`1.4950 × 1.65 × 2.0000 = ×4.9335`, or **×7.4003 with cinder**.

**Both are asserted**: the pre-change figure as an arithmetic identity of the form it describes,
and the shipped figure as what the game now delivers. Reported rather than silently picking one.

### 1.2 The readout

`convMultBreakdown()` is the single source the game, the sim harness and the suites all read, so
the number the game uses and the number the readout prints cannot drift. It names every factor,
its value, its cap and **what kind of thing it is**, and `sim/pacing.mjs` prints it at all four
milestones with the like-for-like line stated separately from `boosts.crystals` — so the two can
never be conflated into one figure again.

**`MANUFACTORY_FUEL` is UNCHANGED at 0.12.** The decomposition argues against a fourth raise.

---

## 2. Part 2 — HELD, by Jerry's dev note 2

The spec's Part 2 was the round's largest player-facing change: re-price the low rungs so RR's
ladder crosses each Kittens bonus at the source's XP. The case is strong and it is measured —
**RR asks 350 XP for the +1.25% Kittens grants at 100, so a player's first skill bonus arrives at
1 h 57 against the source's 36 minutes**, and that is the hour in which a player decides whether
the game rewards them.

**Jerry's note 2: "Early EXP rate is okay. Can ignore analyzer there." Nothing ships.**

The ladder is **asserted unchanged**, all nine rungs, because a hold that is not asserted is a
hold the next spec re-proposes — this round's own Part 3 exists because v0.60's triage was
recorded and not discharged. The ×3.50 measurement stays on the record in `test-v61` and in the
ledger.

---

## 3. Dev note 1 — the Festival buff, and a suite that passed for two rounds while the feature never fired

Jerry: *"When Festival is active, it should show up as a buff similar to Hand of Baron and Crest
of Cinders."*

**It already had a chip. The chip could never fire.** The line tested `S.festivalUntil`, the
wall-clock field — and **v0.58 note 12 made the festival tick-denominated** so offline catch-up
expires it at the right game-time. `holdFestival()` sets `S.festivalUntilTick` and then sets
`S.festivalUntil = 0` explicitly. From v0.58 onward every festival a player held was invisible.

**And `test-v59` asserted this and passed:**

```js
check("8.7 — the Festival shows on the buff banner beside the Baron and the Crest of Cinders",
  /FESTIVAL ' \+ Math\.ceil/.test(RAW) && /HAND OF BARON/.test(RAW) && /CREST OF CINDERS/.test(RAW));
```

The string was present, so the check was green — for two rounds, while Jerry had to report the
same note twice. **A grep asserts that somebody wrote the code. It does not assert that the code
runs.** The assertion now holds an actual festival and reads the actual banner, and a second
assertion pins the *cause* so the class is legible: `S.festivalUntil === 0` while
`festivalActive()` is true.

The chip counts down in **seasons**, not minutes. The other four buffs are wall-clock because they
genuinely are; the festival is a game-year. A minutes countdown would have been a second
wrong-units bug in the same line.

---

## 4. Part 5 — the renown economy

### 4.1 One rate, and the Abyss was the outlier by a clear margin

`RENOWN_PER_VIGOR = 0.0154` — **the Baron's own rate**, chosen because the Baron is the ladder's
anchor and the one deed nobody has called mispriced. Deriving from a deed that is already right
makes this a re-levelling rather than a re-tuning.

| expedition | vigor | before | after |
|---|---|---|---|
| Hunt Wolves / Gromp | 100 | 2 | **2** |
| Hunt Raptors | 100 | 3 | **2** |
| Hunt Krugs | 150 | 3 | **2** |
| **Journey to the Howling Abyss** | 120 | **5** | **2** |
| The Sump Crawl | 140 | 4 | **2** |
| Drake Hunt | 900 | 15 | **14** |
| Challenge Baron Nashor | 2,600 | 40 | **40** |
| Send a Scouting Party | 1,750 | 8 | **8 — EXEMPT** |

The Abyss paid **41.67 renown per 1,000 vigor against the Baron's 15.38 — ×2.7** — and it is a
CHARGE camp, so an empowered run paid ×3 on top.

The Scouting Party exemption is a **property on the expedition** (`renownFlat`), not a branch on
id, so the next exemption is one field. At 1,750 vigor the rule would have paid it 27 against its
authored 8: a ×3.4 buff to a discovery expedition, which is not a hunt.

**THREE EXPEDITIONS THE SPEC'S TABLE OMITTED, and one of them is a large cut:**

| expedition | vigor | before | after |
|---|---|---|---|
| Blue Sentinel | 175 | 5 | **3** |
| Red Brambleback | 175 | 5 | **3** |
| **Void Expedition** | 500 | **25** | **8 — a 68% cut** |

The spec says *"ship a single rate"* and names one exemption, so these take the rate. **The Void
Expedition losing 17 renown a run is the largest single change in the table and nobody sized it.**
Flagged rather than quietly shipped.

### 4.2 The Festival pays 25, and the net

Through `gainRenown()`, so the `callToArms` gate is respected exactly as the expedition path
respects it — asserted in both directions.

**Sized against what it replaces: at the post-5.1 rate a Wolves hunt pays 2, so 25 renown is 12.5
Wolves hunts for one festival**, on a one-game-year cooldown, costing mushrooms and plumes rather
than vigor. It partly offsets 5.1's cut. The net is in §9.

### 4.3 Trades show their renown

`TRADE_RENOWN` has been paid on every caravan since v0.59 Part 2.3 and the tooltip never mentioned
it, so a player had no way to learn that trading is a renown faucet at all. The line **reads the
constants** — `TRADE_RENOWN + (leaderIs("caitlyn") ? CAITLYN_TRADE_RENOWN : 0)` — rather than
writing `+1`. A literal there is how the v0.59 payout and its two tooltips came to disagree.

---

## 5. Part 6 — trade parity, and the one place the source's shape does not transplant

### 5.1 Kittens has no trade yield maximum — retrieved, and the answer is unambiguous

`js/diplomacy.js:744–747` @ `c52985b` sums `tradeRatio` **additively with no diminishing return
and no ceiling**; the tradepost contributes `tradeRatio: 0.015` per copy, unbounded in count. The
only `Math.min` near trade yield is inside the pacifism challenge, which is not base play.

**RR capped it twice and composed it multiplicatively:** four categories, with a +100% ceiling on
docks and a +60% ceiling on the embassy. RR was HARDER than the source on trade yield and
structurally different from it.

### 5.2 SHIPPED UNCAPPED, RR GROWS AN INFINITE-TIMBER LOOP — the round's most serious finding

**RR has a closed cycle Kittens does not have.** Demacia trades timber → steel, Piltover trades
steel → mana, and `transmute` converts mana back into timber. The yield multiplier enters the
circuit **twice**, once per trade leg, and `test-v41` has asserted the loop gain below 0.8 since
v0.41 for exactly this reason.

Measured on this build, sweeping Trade Docks with caravans at half that count:

| Trade Docks / caravans | trade yield | loop gain G |
|---|---|---|
| 30 / 15 | ×2.365 | 0.19 |
| 100 / 50 | ×4.465 | 0.68 |
| **133 / 67** | **×5.465** | **1.013 — BREAK-EVEN** |
| 200 / 100 | ×7.465 | 1.89 |

**133 Trade Docks is reachable in a 2,500-year run.** This is not a balance disagreement; it is an
unbounded resource loop.

**A magnitude fix does not close it**, which matters because the spec's own instruction was *"if
it regresses, the fix is the magnitudes, not the composition."* Cutting the Trade Dock from RR's
0.02 to the source's own 0.015 per copy only moves the break-even to ~177 docks. **G grows without
bound at any positive per-copy rate, because the cycle is closed and the multiplier is squared.**

**WHAT SHIPS — the spec's substance with one bound, and this is a stated deviation:**

- **ONE ADDITIVE CATEGORY** — docks + caravans + champion + trait + policy, summed exactly as the
  source sums them. This is the structural half of dev note 8 and the half the spec argues hardest
  for. Both per-term ceilings are gone.
- **ONE CEILING ON THAT CATEGORY** (`TRADE_YIELD_LIMIT = 3.0`, asymptote ×4.0), replacing the two
  ceilings on two of four categories. **Four categories with two bounds becomes one category with
  one — strictly closer to the source than what RR had.** G is bounded at ~0.51 at any stack.

**If a future round wants the source's uncapped form it must first break the cycle**, and the
transmute leg is the one that closes it. That is the real finding and it belongs to the transmute,
not to trade.

### 5.3 The "deeper cargo slots" message was testing the wrong property

`ttResKnown` is a resource **visibility** test — has the player ever *seen* this resource — while
the sentence beside it claims a **capability**: goods "this settlement has not yet handled". The
codebase has had the capability test since v0.50: `slotAvailable(fid, i)`.

**The two disagree on exactly one case and it is the reported bug: the craft is unlocked and
buildable and the player has never actually held one.** Jerry's Piltover example is precise — the
10-caravan slot pays support beams, the beam craft is buildable at will, and the slot still
counted as unhandled goods.

### 5.4 Trades cost provisions

`TRADE_PROVISIONS = 5000`, **shared rather than per-faction**, so the constraint is "how many
caravans can this settlement provision" — which is the constraint the note describes. Neither the
Caravanserai's vigor discount nor the Letter of Marque's gold discount touches it; both were sized
against their own resource. The binding check is instrumented at every milestone and reported in
§9, with the figure that *would* bind if 5,000 does not.

### 5.5 Spelling

`civilisation` → `civilization` in all seven sites, and **the whole -ise/-ize family swept in one
pass: 26 sites across 15 words.** The file was genuinely half-converted — `serialize` appeared
five times against one `serialised`, and `mechanization` / `Pressurized` / `unionize` sat beside
`optimisation` / `specialisation`. It is internally consistent now.

---

## 6. Part 7 — Cataloguing and The Great Index become different things

Both of Jerry's complaints were exact. All three upgrades contributed 0.02 to the **same** line —
Observatories raising the Archive's knowledge cap — so they were one effect bought three times;
and `greatIndex` sat on `callToArms` beside `crossReferencing`'s `ritesOfTargon`.

| upgrade | tech | effect |
|---|---|---|
| `cataloguing` | ritesOfTargon | **Academies** raise the **Archive's** knowledge cap, 0.02 |
| `crossReferencing` | ritesOfTargon | **Observatories** raise the **Archive's** cap, 0.02 — **the source's own pairing, kept** |
| `greatIndex` | **sparks** | **Observatories** raise the **Academy's** cap, 0.02 |

**Σ stays 0.06 across three upgrades** — Kittens' three-reflector total, taken and not tuned. The
magnitude parity is preserved exactly; only the pairings change. **The middle upgrade keeps the
original job, not the first**, so `crossReferencing` retains the literal `js/buildings.js:579–580`
pairing and the ledger keeps a genuine PARITY row rather than three RR-original ones.

**The spec's prediction is scored and it is right:** the Academy→Archive term is the largest of
the three in practice, because RR builds more academies than observatories. At `test-v59`'s own
fixture (20 archives / 15 academies / 10 observatories / 5 hexLabs) the same base of 35,000
delivers **47,250 — ×1.35 rather than the ×1.30 the single-pairing model gave.**

---

## 7. Part 8 — the fourth mana multiplier, and a ceiling nobody had reached

`petriciteResonators` ships on `petricite` (65,000), +0.25 into `boosts.mana`. **Sparks still
carries exactly one mana discovery, asserted by COUNT rather than by naming Leyline.**

**`boosts.mana` reaches Σ 1.00 across FOUR members** against Kittens' `<res>GlobalRatio`, which has
**two members in the entire game, at 0.30 and 0.25.** Four against two, and the largest single
member is 3.3× the source's largest. This **reverses v0.60's "hold the line on Mana"** on Jerry's
own later note 3, and both notes are cited in the ledger so a future round does not read v0.60 as
current.

### 7.1 THE FINDING THE SPEC DID NOT PREDICT: Σ1.00 delivers 0.875

`BOOST_LIMIT.mana` is **1.0**, and `limitedDR` is linear only below **0.75 × L**. With three
members the mana line summed to **exactly 0.75** — the very top of the linear region — so **every
member before this round was delivered in full and nobody had cause to look.**

**The fourth member is the first one that is not.** Σ1.00 raw delivers **0.875**: Petricite
Resonators advertises +25% and contributes **+12.5 points, half of what it says.**

The Discovery's own effect string says so, generated from the constants. A button that advertises
+25% while delivering +12.5% is exactly the class of drift this project keeps having to fix.

### 7.2 A cost deviation the audit forced

The spec authored `{ crystals: 400, hexgear: 25 }`. **`auditCostGraph()` and `auditRawGraph()` both
rejected it: hexgear is gated on `hexcore` (75,000) and this Discovery unlocks at `petricite`
(65,000)**, so the player would have seen a Discovery a full rung before they could buy it. That
is an unbuildable item, not a balance disagreement. `petriciteBlock: 25` replaces it — available
at the rung, and it is the stone the Discovery is named for. **The crystal component, which is the
half that is Jerry's own note, is untouched at 400.**

Note also that 400 does **not** follow Part 10's rung-scaled rule (K/100 at 65,000 would be 650).
The spec names 400 explicitly, so 400 ships; it is the one post-Sparks crystal figure in the game
that does not follow the rule, and it is recorded rather than silently normalized.

---

## 8. Parts 9, 10 and dev notes 3, 4

**Part 9 — `noUndo`.** A property of the expedition, not a branch on id, exactly as `noDiscount`
and `renownFlat` are. The Drake Hunt and Baron Nashor are the two highest-variance deeds in the
game and a ten-second undo on a bad roll was a free re-roll of the most valuable random outcome
RR has. **The re-roll penalty is asserted clean after a no-undo hunt** rather than reasoned about,
because "X is cleared elsewhere" is the shape of claim that stops being true one refactor later.

**Part 10 — post-Sparks crystal costs, 4 → 21.** Kittens prices its late upgrades in a scarce
converter output as a matter of course: **106 of its 171 priced workshop upgrades — 62% — carry a
scarce converted or crafted component.** RR had 4 of 33. The rule is `crystals = round(K / 100)`;
the four existing figures (600 / 450 / 900 / 80) are untouched because they were sized
deliberately at v0.59.1. **The set is chosen, not universal** — hextech and industry fiction take
it, the timber, stone, tool and culture lines stay on their own chains, because a rule that hits
everything is a tax and not a sink.

**And this is the crystal sink three rounds have been looking for.** §24 says why the previous
attempts failed: crystals are a **stock with no lumpy sink**, and a smooth per-tick burn against a
large faucet is a rounding error at every scale — most recently 96.2% time-at-cap after a ×6 on
`MANUFACTORY_FUEL`. **A research cost is a lumpy sink.** The measurement is in §9.

**Dev note 3 — knowledge, 10 → 32 of 79 (13% → 41%).** Amount from the tech's own rung (`K / 10`),
so a re-homed Discovery reprices itself. Set by a stated rule: **a Discovery takes knowledge when
it is a METHOD, not when it is an OUTFIT or a FACILITY.** Everything post-Sparks is exempt here
and takes crystals instead — **no Discovery is taxed twice for being late.**

**Dev note 4 — The Vanguard Doctrine.** Two `callToArms` children each opening one leaf become one
rung opening two, at **45,000**: above the dearer of the two it replaces (35,000) and below the
first Sparks child (50,000), which is the only window a bridge tech can occupy. The player saves
18,000 knowledge and **part of it moves to the leaves**, where note 3 puts 4,500 on each of the
two Discoveries. §30 migration: both ids reserved until v1.0; a save holding **either** is
credited the merge.

---

## 9. Parts 3, 4, 11 — the ledger argument pass and two rulings

### 9.1 Part 3.1 — 86 rows argued, and the predicted split scored

**UNVERIFIED is not a verdict for a mechanism that cannot be looked up.** v0.60's triage
established the class and did not discharge it: 86 rows were classed RR-ORIGINAL and still
labelled UNVERIFIED — **38% of the ledger deferring a judgement by mislabelling it.**

| | predicted | **measured** |
|---|---|---|
| EASIER | 60 | **65** |
| HARDER | 20 | **13** |
| turned out to have a counterpart | 5 | **8** |

**The ledger moves 226 rows — PARITY 72 → 81, EASIER 41 → 105, HARDER 2 → 15, UNVERIFIED 112 → 25
— and all 25 remaining UNVERIFIED rows are RETRIEVABLE.** RR-ORIGINAL + UNVERIFIED is **zero**,
and `tools/parity-ledger.mjs` now **aborts** on that combination, so the class cannot return.

**Eight rows turned out to have counterparts, and two of them are worth naming:**

- **The five storage rungs** (`expandedStores` … `voidwardStores`) are Kittens' `barnRatio` /
  `warehouseRatio` line, at the source's own Σ 4.35 / 1.80 — an identity that is already a
  standing round invariant. **They were UNVERIFIED for eleven versions while the sums they carry
  were being asserted every round.**
- **`harvestRites`** — Kittens gates festivals behind `drama` at **90,000 science**
  (`js/village.js:5495`, `js/science.js:312`). RR gates them at **1,500 knowledge**. Same
  mechanism, same purpose, **RR opens it at 1.7% of the source's rung.** The clearest single rung
  divergence found in the pass.

**The tech rows are argued from one measurement:** RR's whole ladder is **35 techs totalling
1,442,630 knowledge, topping out at 135,000**; Kittens' is **62 techs totalling 42,226,630
science, topping out at 25,000,000**. The rung *values* are the source's own — 50,000 / 60,000 /
65,000 / 75,000 / 85,000 / 90,000 / 100,000 / 115,000 / 125,000 / 135,000 all appear in both — so
this is not a pricing divergence, it is a **length** one. **RR's endgame rung costs what Kittens'
mid-game rung costs, and the complete RR tree is 3.4% of the source's total science.**

### 9.2 Part 3.2 — `hextechFoundry`, re-pointed and split

v0.60 flagged the mapping as wrong and correctly refused to repair it silently. **The row pointed
at Kittens' Factory, a craft-ratio building, while RR's Foundry is a converter** — a `craftRatio`
figure cannot be ranked against a conversion rate at all. Re-pointed to the **Calciner**, which has
exactly the Foundry's shape.

**And the `globalBoost` clause is ledgered separately, because it is a second effect.** The Foundry
carries `globalBoost: 0.06` per copy feeding `catMonument` — **a global production multiplier on a
converter building.** In the source a converter converts and a monument multiplies, and no building
does both.

### 9.3 Part 4 — Jarvan and the Academy: a 2% coincidence and three structural differences

| | Kittens | RR |
|---|---|---|
| mechanism | **Academy**, `skillXP: 0.0005` per copy (`js/buildings.js:628`) | **Jarvan's passive**, `{ key: "xp", base: 25 }` |
| composition | **additive** into the same accumulator as the 0.01 base | **multiplicative** on the rate |
| source | a **building** you may own many of | a **champion**, one only |
| at full stack | 20 Academies → **×2.00** | Jarvan at level 10 → **×1.97** |

**The magnitudes land within 2% of each other and that is the whole of the parity.** Rated
**PARITY-of-magnitude, RR-ORIGINAL-of-shape.**

**RR has no building that accelerates learning**, and that is ledgered as missing content with its
proposed sizing — **and with the Jarvan interaction named, because the two would silently stack to
×4.** That interaction is why it is a specify-then-decide item. **No XP magnitude moved.**

### 9.4 Part 11 — the category census, recorded as an open question, shipping nothing

`STANDING-RULINGS §31` carries the measurement so Jerry can rule. The short form: **Kittens' Law is
literally the source's code** (`game.js:3409–3440` multiplies four categories), so "make it
additive" is the wrong target. **The divergence is the CENSUS.** In Kittens one or two categories
are live per resource — `<res>GlobalRatio` has 2 members in the whole game — and RR gives each
individual upgrade, drake, champion system and buff its own. **Kittens has categories that are
kinds of effect; RR has categories that are individual effects.**

Grouping RR's eleven factors into four source-shaped categories cuts the product ~41%; collapsing
to one cuts it ~80%. **It should ship in its own round with the ensemble to itself.** Proposed for
ruling, not shipped: *a category is a kind of effect, not an individual effect, and RR targets
four.*

---

## 10. Invariants re-pointed this round, with their superseding item

| suite | assertion | superseded by |
|---|---|---|
| `test-v59` | **8.7 — the Festival shows on the buff banner** (a GREP) | **dev note 1.** Passed for two rounds while the feature never fired. Re-pointed to hold a festival and read the banner. **See §3 — this is the round's methodological finding.** |
| `test-v59` | 10c — every camp pays its AUTHORED field exactly | **Part 5.1.** Camps derive from one rate against their own vigor cost. |
| `test-v59` | 10f — the Reflectors are SCALED BY OBSERVATORY COUNT, ×1.30 at 10 | **Part 7.** Three distinct pairings; the Academy rung pays at zero observatories, by design. |
| `test-v59` | 10f — the fixture delivers 35,000 → 45,500 | **Part 7.** Same fixture now 35,000 → **47,250**, which scores the round's own prediction. |
| `test-v59` | 5.4 — every rung's description names Archive AND Observatory | **Part 7.** Each string names its OWN pairing. |
| `test-v59`, `test-v43`, `test-v44` | the Reflectors prose / applied deltas | **Part 7.** Re-pointed to per-pairing checks, which are *stricter*: they fail if a pairing is mis-wired, where the old form could only fail on a magnitude. |
| `test-v44` | the two bridge techs land at 28,000 / 35,000 | **dev note 4.** Re-pointed to the durable property — a bridge is priced between the Sparks rung and the first Sparks child — which both old figures also satisfied. |
| `test-v42/46/47/49/50/52/53/54/55/56/57/591` | tech count 36, and the two retired ids | **dev note 4.** The ladder is 35. Shape conditions unchanged. |
| `test-v41` | each caravan raises yield +2%, **bounded at +60%** | **Part 6.1.** The per-route ceiling is gone; one ceiling remains on the category. |
| `test-v36` | the dock ratio asymptotes at +100% | **Part 6.1.** Same. Asymptote +100% → +300%, on the category rather than the term. |
| `test-v40`, `test-v41`, `test-v54` | the Scholarship ladder's tech order | **Part 7.** `greatIndex` moves to `sparks`; the ladder is still monotonic, which is the property. |
| `test-v581` | 5 — the cargo-slot sentence uses `ttResKnown` | **Part 6.2.** It pinned the implementation to itself and could only ever have caught a rewording. |
| `test-v38` | trading can spend a luxury to zero | **Part 6.3.** The fixture seeded from the AUTHORED cost; a caravan pays the RESOLVED one. |
| `test-v60` | 13 — thirteen v0.60 rows retrieved | **Part 3.2.** One was retrieved correctly and mapped wrongly; re-pointing it drops the marker to 12. |
| `test-v60` | `version === "v0.60"` | **the NINTH instance of the version-pinned-literal class**, and I wrote this one myself at v0.60 while re-pointing the eighth. Re-pointed to the scheme plus "at or after this suite's round". |

**Two of these caught real problems rather than needing accommodation:** `test-v41`'s loop-gain
guard caught §5.2's infinite-timber circuit, and `test-v44`'s `noNaNRates` caught `computeRates()`
returning objects — fixed by gating `_boosts` on `bdRes`, matching `_bd`'s existing convention,
rather than by loosening the check.

---

## 11. Files

| file | change |
|---|---|
| `index.html` | Parts 1, 5, 6, 7, 8, 9, 10; dev notes 1, 3, 4; `VERSION` → `v0.61` |
| `sim/simcore.mjs` | the `convMult` readout, the knowledge-amplifier census, the provisions binding check, the trade-yield terms |
| `sim/pacing.mjs` | four new milestone printers |
| `tools/parity-ledger.mjs` | 86 argued rows, the RR-ORIGINAL+UNVERIFIED abort, `hextechFoundry` re-pointed and split, the Part 11 census row |
| `STANDING-RULINGS.md` | **§31, new** — the category census as an open question |
| `tests/test-v61.mjs` | **new**, 85 assertions |
| 15 suites | re-pointed, §10 above |
| `docs/specs/rr-analyzer-v061-spec.md` | the consumed spec, archived |
