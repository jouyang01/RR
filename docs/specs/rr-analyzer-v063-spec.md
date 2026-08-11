# BUILDER SPEC v0.63 — the harshness is one rung, not the divisor; and the source says 0.8 was right

Written against the **v0.62 tag**, verified from disk on a fresh checkout.

**What reproduces.** Thirty-three suites parsed from their own `SUITE-END` trailers: **1,786
assertions passed, 0 failed, no missing trailer, no skipped call site, no non-zero exit.** The
parity ledger reproduces exactly from the generator — **225 rows, PARITY 87, EASIER 117, HARDER
21, UNVERIFIED 0.** **The ledger is finished.** Every v0.62 part shipped, including the two the
report was most careful about: the Warehouse at `timber 150 / ore 200 / gold 5` and the Harbor at
`ore 950 / gold 25`, both exactly as specced.

**And the report's own verdict — "the round is too harsh, 4 of 10 gates fail" — is right. This
spec's job is to find the cause, and it is not where builder note 1 says it is.**

> **Builder note 1 asks to halve the discovery-knowledge divisor to ~0.4 × K. The source says the
> shipped 0.8 × K is correct.** A census of Kittens' 171 workshop upgrades: **139 (81%) carry a
> science cost**, and against the tech that unlocks them the **median ratio is 0.90 × the rung**
> — Rotary Kiln ×1.04, Factory Robotics ×0.71, Offset Press ×0.87, Petri ×0.76, exactly Jerry's
> examples. **Total upgrade science per rung: median 2.43×.** The builder's own note says RR sits
> at "2.4 × the rung's own price". **That is the source's number to two significant figures.**
> **Part 1.**

---

## Jerry's dev notes — where every one lives

| # | note | Part |
|---|---|---|
| 1 | Every workshop upgrade costs science in Kittens — confirm and match | **1** |
| 2 | Piltover Concord: craft +8%, crafting costs −3.5% | **3.1** |
| 3 | Demacian Accord: timber and ore production +8.5% | **3.2** |
| 4 | Noxian Doctrine: +33% hunt renown **and** +7.5% hunt yields | **3.3** |
| 5 | All philosophies cost 10k culture | **3.4** |
| 6 | Jarvan's tooltips updated | **4** |
| 7 | Targon banner is missing the golden halo | **5.1** |
| 8 | Insight's blue lights should be more prominent | **5.2** |
| 9 | Cinders' red glow looks weird — floating red lights instead | **5.3** |
| 10 | Reduce the box random-event chance | **6** |
| 11 | Steel in RR is the analogue of iron in Kittens | **2** |

---

## Part 0 — Ground rules

**This spec produces `v0.63`.** Clone Kittens and pin **`c52985b`**; do not use grep.app.
**Do not re-open** STANDING-RULINGS §§1–30. §31 remains Jerry's open question.

**This round must finish on all three seeds.** v0.62 reached Icathia on one of three. **Every
sizing decision below is subordinate to that**, and Part 8 makes it a gate.

---

## Part 1 — Dev note 1 confirmed, and the divisor is NOT the problem (builder note 1)

### 1.1 The source, measured

**Jerry's claim is right and the numbers are close.** `js/workshop.js` against `js/science.js`
at `c52985b`:

| | |
|---|---|
| workshop upgrades with a price list | **171** |
| **carrying a science cost** | **139 — 81%** (the 32 without are the antimatter/void tier, priced in antimatter and eludium) |
| **per-upgrade science ÷ its unlocking tech's rung** | **median 0.90, mean 0.97** |
| upgrades per tech | median **3** |
| **total upgrade science per rung** | **median 2.43×, mean 2.79×** |
| whole game: upgrade science ÷ tech science | **0.50** |

**Jerry's own examples, verbatim:** `rotaryKiln` 145,000 against `robotics` 140,000 = **×1.04**;
`factoryRobotics` 100,000 = ×0.71; `offsetPress` 100,000 against `combustion` 115,000 = ×0.87;
`petri` 65,000 against `biology` 85,000 = ×0.76. **"Almost the same amount of knowledge as the
original research" is exactly what the source does.**

### 1.2 RR measured after the generator runs — and the whole-game figure is the opposite of harsh

`DISCOVERY_KNOWLEDGE_DIVISOR = 1.25` (`index.html:3213`) applies `round(K / 1.25)` = **0.8 × K**
to a 22-member set at load. **Read from the mutated `UPGRADES` array, not the literal** — a
literal grep misses this rule entirely:

| | RR v0.62 | Kittens |
|---|---|---|
| discoveries carrying knowledge | 32 of 78 | 139 of 171 |
| **total discovery knowledge ÷ total tech knowledge** | **0.099** | **0.50** |
| per-rung burden, median | 1.60× | 2.43× |

**RR is at one fifth of the source's discovery-knowledge burden overall.** The round did not
overshoot on volume.

### 1.3 What it actually overshot on: ONE RUNG

**Every tech from `hexdraulics` (50,000) upward carries zero discovery knowledge.** All 22 set
members sit at or below `sparks`. So a rule calibrated per-rung lands its entire weight on the
early game — and that is exactly where three of the four failed gates are.

| tech | rung | discovery K | **× rung** |
|---|---|---|---|
| **`ritesOfTargon`** | 12,000 | **68,800** | **5.73×** |
| `hextech` | 2,200 | 8,280 | 3.76× |
| `songcraft` | 1,300 | 4,420 | 3.40× |
| `drakeLore` | 3,600 | 12,000 | 3.33× |
| `trade` | 1,200 | 3,780 | 3.15× |
| *(everything else)* | | | ≤ 2.05× |

**`ritesOfTargon` alone carries 48% of all discovery knowledge in the game, at 2.4× the source's
median burden — and `Rites of Targon` is one of the four failing gates** (median 76.0 against a
<75 condition). **That is not a coincidence and it is not the divisor.**

### 1.4 Ship the cap, not the halving

**Keep `DISCOVERY_KNOWLEDGE_DIVISOR = 1.25`.** It is the source's per-upgrade ratio and cutting it
to 0.4 × K moves *away* from parity in a project whose charter is parity.

**Add a per-rung ceiling at Kittens' own median: no tech may carry more than 2.43 × its own
knowledge price in discovery costs.** When a rung exceeds it, scale that rung's discoveries down
proportionally.

| | total discovery K | whole-game ratio | per-upgrade ratio |
|---|---|---|---|
| v0.62 as shipped | 142,410 | 0.099 | 0.80 — **at parity** |
| **cap at 2.43× (ship this)** | **94,459 (−34%)** | 0.065 | **0.80 — still at parity** |
| builder note 1's 0.4 × K | 71,205 (−50%) | 0.049 | **0.40 — half the source's 0.90** |

**The cap cuts `ritesOfTargon` 58% and leaves every rung already at or under the source's median
untouched.** Halving the divisor would cut the compliant rungs as hard as the offender.

**Pass conditions:** the divisor **unchanged at 1.25**; a per-rung cap at **2.43×** with the
Kittens census cited; no rung exceeds it, asserted from `TECHS` and `UPGRADES` after the generator
runs; the whole-game ratio reported against the source's 0.50; **Rites of Targon's median year
reported** — it is the gate this Part exists to relieve.

---

## Part 2 — Steel is iron, and the Storehouse is missing a line (dev note 11)

**Jerry's mapping settles the one figure v0.62 could not derive.** That round re-based the
Warehouse and Harbor from Kittens' barn ratios and kept steel at 100 because *"steel has no
Storehouse figure to take a ratio from."* **With steel ≡ iron there is one:**

| | Kittens iron | RR steel now | **ship** |
|---|---|---|---|
| barn / **Storehouse** | **50** | **absent** | **50 — a new line** |
| warehouse / **Warehouse** | 25 (0.50 × barn) | **100** | **25** |
| harbor / **Harbor** | 150 | **150** | **150 — already exact parity** |

**Two of the three are corrections and one is already right.** The Warehouse is at **4× the
source's relationship** to the barn; the Harbor matches the source exactly and must not move.

**And this Part relieves the round rather than tightening it**: the Storehouse gains a steel
ceiling it never had, which is the cheapest storage building in the game and the one a player
builds first. **Report the steel ceiling at every milestone before and after** — v0.62's harshness
came from storage and this is the one storage change that goes the other way.

**Pass conditions:** Storehouse gains `steel: 50` citing Kittens' barn `ironMax: 50`; Warehouse
100 → 25 citing the 0.50 barn ratio; **Harbor asserted unchanged at 150**; the steel ceiling and
steel time-at-cap reported before and after.

---

## Part 3 — The four government philosophies (dev notes 2, 3, 4, 5)

`POLICIES` (`index.html:3520`) and `policyMult()` (`:3559`).

### 3.1 Piltover Concord (dev note 2)

**Craft yields +8% already ships** — `case "craft": return hasPolicy("piltoverConcord") ? 1.08 : 1`.
**The new half is the −3.5% crafting cost.** Add it as a cost multiplier on `craftItem()`'s price,
not as a second yield term; **report both, because a cost cut and a yield rise compound** and the
tooltip should state the resolved pair rather than two numbers a player has to multiply.

### 3.2 Demacian Accord (dev note 3)

Currently `case "village": return hasPolicy("demacianAccord") ? 1.06 : 1` — a **village-scope**
+6%. Jerry wants **timber and ore production +8.5%**, which is a different scope: resource-keyed,
not building-group-keyed.

**Ship it as a resource boost on timber and ore**, and **say which accumulator it lands in.**
Neither timber nor ore is in `BOOST_LIMIT`, so this is delivered in full — **unlike four families
that are not** (Part 7). State that in the ledger row so the next reader does not assume symmetry.

### 3.3 Noxian Doctrine (dev note 4)

`case "renown": return hasPolicy("noxianDoctrine") ? 1.5 : 1` → **1.33**, plus a new **+7.5% hunt
yield** term.

**Check the interaction with `RENOWN_PER_VIGOR` before shipping.** v0.61 re-levelled every camp
onto one rate against its vigor cost; a renown policy multiplier rides on top of that rate, so
**1.5 → 1.33 is a renown cut in a round whose first-champion gate already fails at 129.6 against
<120.** Report first champion on three seeds. **If it regresses further, the 7.5% yield term is
the compensation and it should be sized to hold first champion flat**, not chosen for tidiness.

### 3.4 All philosophies cost 10k culture (dev note 5)

All three currently cost `culture: 5000` plus a material component. **Ship `culture: 10000`.**

**State what happens to the material components** — `timber 800 + ore 600`, `knowledge 3000`,
`steel 250`. The note names culture only, so they stay; but `piltoverConcord`'s `knowledge 3000`
now sits alongside Part 1's discovery costs on the same resource, and **the report should carry
the combined knowledge burden** rather than treating the two as unrelated.

**Pass conditions:** all four effects asserted at their new magnitudes; the crafting-cost cut
applied to price and not yield; Demacian Accord's scope stated with its accumulator; **first
champion on three seeds after 3.3**; culture 10,000 on all three; a ledger row each.

---

## Part 4 — Jarvan's tooltips (dev note 6)

**Half of this shipped and the half that did not is the third instance of one defect.**
`JARVAN_XP_PASSIVE = 15` (`:1541`) and the passive description is generated from it. **But
`index.html:1595` still reads:**

```js
lead: "Demacian Standard — every worker in the village produces 12% more",
```

**against a shipped `JARVAN_VILLAGE_LEAD = 0.06`.** The tooltip says 12%, the game pays 6%, and
the scope changed from three jobs to eight in the same round the literal stayed put.

**Generate it**, exactly as the passive line already is. **And the string is now wrong twice** —
"in the village" described the old three-job scope; it reaches every job now.

**This is the third literal-drift defect in three rounds** — v0.59's renown tooltips, v0.61's
`petriciteResonators`, this. **Ship the general guard: `test-v63` should fail if any champion
`lead` or `passive.desc` string contains a percentage literal that does not appear in a constant.**
A grep-level rule is enough and it retires the class.

**Pass conditions:** the lead string generated from `JARVAN_VILLAGE_LEAD`; its wording reflects
all-job scope; **the no-literal-percentages guard ships and is demonstrated to fail on a planted
literal.**

---

## Part 5 — Three banner notes, and one of them already shipped (dev notes 7, 8, 9)

### 5.1 The Targon halo EXISTS — this is a visibility bug (dev note 7)

**Do not add a halo. There is one**, at `index.html:10368–10378`:

```js
(function drawSummitHalo(hx, hy, outer, inner) {
  ctx.globalAlpha = 0.35 + 0.25 * Math.abs(Math.sin(f * 0.17));
  ... px(hx + dx, hy + dy, 1, 1, PAL.goldBright);
})(cx, groundY - 26, 9, 6);
```

**Why it cannot be seen, and it is not the alpha.** The golden peak immediately above it is
`pixTriangle(cx, groundY - 16, 30, 10, PAL.goldBright)` — **apex at `groundY - 26`, the halo's
exact centre, in the identical colour.** A gold ring centred on a gold peak is invisible where it
overlaps and reads as part of the peak where it does not.

**Ship: separate it from the peak.** Any two of — a distinct colour (a paler gold or near-white
against `PAL.goldBright`), a larger `outer` so the ring clears the silhouette, a higher alpha
floor. **Assert the halo's pixels are a different colour from the peak's, or that its radius
exceeds the peak's half-width**, so "invisible again" fails a test rather than needing a third
note.

**Do not touch the crescent** (`:10328`, `(212, 26, 11)`) and **do not restore the square.** Both
instructions are Jerry's and the site already says so.

### 5.2 Insight's lights, more prominent (dev note 8)

Shipped at `index.html:6393` in `drawLoreSprites`: six motes, `1.5 × scale` px, alpha
`0.30 + 0.30·|sin|`, orbiting six anchors. **Raise prominence on size and count before alpha** —
alpha alone makes them wash out rather than read as lights. **Eight to ten motes at `2–2.5 ×
scale` with the alpha floor lifted to ~0.45** is the shape; state what was chosen.

### 5.3 Cinders: floating lights, not a glow (dev note 9)

Shipped at `index.html:10253–10259` as **two filled rectangles** — `px(cx-12, groundY-10, 24, 8)` at `:10256` and
`px(cx+1, groundY+hy-6, 13, 9)` in `CINDER_GLOW` at alpha 0.10–0.22. **Two translucent rectangles
at this resolution read as blocks, which is what "looks weird" means.**

**Replace with floating red lights, and the scene already has the idiom** — the lore banner's
motes and the crafting scene's own spark burst on `phase === 3`. **Embers rising from the forge
bed and around the hammer head**, on per-mote phases so they do not move as one, in `CINDER_GLOW`.

**Delete the rectangles.** A glow left underneath the embers is the same weirdness at lower alpha.

**Pass conditions for 5.1–5.3:** all three asserted by **holding the buff, reading the canvas,
expiring it and reading again** — never by grep, per v0.61 §3; the halo distinguishable from the
peak by colour or radius, asserted; the two cinder rectangles gone; mote counts and sizes stated.

---

## Part 6 — The box event is spamming the chronicle (dev note 10)

`index.html:6694` — `if (S.jackboxes > 0 && Math.random() < probOver(S.jackboxes * 0.0002, ticks)) fireMischief();`

**The rate is linear in the box count and nothing caps it.** At 20 Jack in the Boxes that is
`0.004`/tick × 5 ticks/s = **one event every 50 seconds — roughly 16 game-days**, and every one
writes a chronicle line. At 40 boxes it doubles again.

**Two things are wrong and the note only names one.** The spam is the symptom; **the rate having
no ceiling is the defect**, and it is the same shape as the `BOOST_LIMIT` families in Part 7 — a
term that was fine at the count it was sized for and was never bounded.

**Ship: `strictDR` the rate against a cap**, the way the boxes' own morale contribution already is
(`box = 2 × min(5, n) + strictDR(2 × max(0, n − 5), MORALE_BOX_LIMIT)`, `:5701`). **The morale
term is bounded and the event rate is not, in the same building.**

**And rate-limit the log line independently of the event** — a batched "the boxes were busy this
season (+N)" beyond some frequency. The chronicle's job is to tell a player what they could not
watch; sixty lines of the same event is the failure mode v0.59.1 note 5 already fixed for bulk
hunts.

**Pass conditions:** the event rate bounded, with the ceiling stated and asserted at 5, 20 and 40
boxes; the morale term **unchanged**; chronicle lines per game-year from this source reported
before and after; the batching rule stated.

---

## Part 7 — Four families past the knee, and the readout is now the sizing tool (builder note 4)

**v0.62's end-of-run audit found four, not two:**

| family | raw Σ | delivered | thrown away |
|---|---|---|---|
| **vigor** | 5.522 | 0.988 | **82.1%** |
| **devotion** | 3.550 | 1.902 | **46.4%** |
| **provisions** | 1.900 | 1.378 | **27.5%** |
| **mana** | 1.029 | 0.882 | **14.3%** |
| crystals | 1.338 | 1.338 | 0% |

**`cultivation` advertises +10% and pays 1.2%.** Provisions and mana crossed during a real run
even though a maxed static probe put them under — **so the static probe is not the instrument;
the end-of-run audit is.**

**This Part ships no re-balance.** `BOOST_LIMIT` values are Jerry's under §16 and raising four
caps in a round that already overshot would be reckless.

**What ships is the rule builder note 4 asks for: no boost may be added or re-sized without its
marginal delivery quoted first.** `boostDeliveryLine()` already computes it at render time. **Make
that a spec-level obligation and a test:** `test-v63` fails if a `BOOST_LIMIT` family's raw Σ moves
without the round's report carrying that family's before/after delivered value.

**Part 3.2's timber-and-ore boost is the immediate application** — neither is a `BOOST_LIMIT`
family, so it pays in full, and **the report must say so rather than leaving the reader to assume
the asymmetry.**

**Pass conditions:** the end-of-run audit prints all seven families; the add-a-boost rule
asserted; **no `BOOST_LIMIT` changed**; Part 3.2's full delivery stated explicitly.

---

## Part 8 — The round must finish, and the crystal sink must be sized against the stock (builder notes 2, 3)

### 8.1 Completion is a gate, not a figure

**v0.62 reached Icathia on one seed of three and Era 3 was unscoreable.** Every measurement this
project makes about Era 3, the spread, and the tenth champion depends on the run finishing.

**Ship this as pass condition 1 of the round: Icathia reached on all three seeds within 2,500
game-years.** If Parts 1 and 2 do not restore it, **stop and report** rather than proceeding to
the decomposition — builder note 3 is right that the variance question is now entangled with a
completion question, and the entanglement resolves in one direction only.

### 8.2 The crystal burn, sized against the stock (builder note 2)

**Part 7 of v0.62 worked and its target still failed.** The drain went 6.9% → **28.9% of gross**,
a ×4.2 improvement, and it now tracks the faucet as the multipliers grow. **Crystals at cap:
95.6%, against a <70% target.**

**Builder note 2 has the right diagnosis: a drain expressed as a share of the faucet cannot empty
a stock that has been full for 2,500 years.** 27 Refineries deliver 14.69/s gross against a 4.57/s
drain — the stock still fills, just slower.

**Size it against time-at-cap directly.** The quantity the target names is a property of the
*stock*, so the sizing must be too: **choose the drain such that the stock spends most of the run
below its ceiling**, which means net crystal flow near zero once the ceiling is reached, not a
fixed fraction of gross.

**A stock-referenced sink is the shape**, and RR already has the idiom in `AUTOMATION_BASE` —
a rule keyed to `value ≥ maxValue × (1 − base)`. **Burn harder when the stock is near its
ceiling and lighter when it is not**, so the sink self-regulates instead of needing a magnitude
that is wrong at every point but one.

**Do not raise `MANUFACTORY_FUEL` (`:3964`) as a flat number a fifth time.** Four rounds have.

**Pass conditions:** crystals time-at-cap **below 70% on at least one seed**, or the failure
reported with the measured drain and the stock's fill curve; the sink keyed to the stock's fill
rather than to gross; `MANUFACTORY_FUEL`'s flat value **unchanged**; the drain share reported at
every milestone.

---

## Part 9 — Order, discipline, pass conditions

### Order

1. **Part 1's cap**, then **Part 2**. Both relieve the round and everything else is measured
   against a build that finishes.
2. **A three-seed ensemble immediately after 1 and 2, before anything else ships.** If Icathia is
   not reached on all three, stop and report.
3. **Part 3** — the four philosophies. 3.3 touches first champion; watch it.
4. **Parts 4, 5, 6** — the tooltip guard, the three banners, the box rate. No pacing effect.
5. **Part 8.2** — the crystal sink on a stock reference.
6. **Part 7** — the boost rule. Rows and a test.

### Operational

Median and spread for every milestone (§25). `--years N --seeds 3`. **Clone Kittens; pin
`c52985b`.** `nproc` is 2 — give the ensemble the box, and note v0.62 lost two ensembles to
container restarts before one completed at 48 minutes; **budget for three attempts.**

### Round pass conditions

| # | Condition | Target |
|---|---|---|
| **1** | **Icathia on ALL THREE seeds** within 2,500 years | **the round's gate — stop and report if it fails** |
| 2 | `DISCOVERY_KNOWLEDGE_DIVISOR` | **unchanged at 1.25**; the source's 0.90 median cited |
| 3 | Per-rung discovery cap | **2.43×**, asserted from `TECHS`/`UPGRADES` after the generator |
| 4 | Rites of Targon | median year reported; **< 75** |
| 5 | Whole-game discovery ratio | reported against the source's 0.50 |
| 6 | Storehouse | gains `steel: 50` citing barn `ironMax` |
| 7 | Warehouse steel | 100 → **25**; **Harbor asserted unchanged at 150** |
| 8 | Steel ceiling | reported before and after, with time-at-cap |
| 9 | Piltover Concord | craft +8% **and** cost −3.5%, applied to price; resolved pair in the tooltip |
| 10 | Demacian Accord | timber and ore **+8.5%**, scope and accumulator stated, full delivery noted |
| 11 | Noxian Doctrine | renown **1.33**, hunt yield **+7.5%**; **first champion on three seeds** |
| 12 | Philosophies | **culture 10,000** each; combined knowledge burden with Part 1 reported |
| 13 | Jarvan lead string | generated; all-job wording; **no-literal-percentage guard demonstrated** |
| 14 | Targon halo | distinguishable from the peak by colour or radius, asserted; crescent untouched |
| 15 | Insight motes | count and size raised, stated |
| 16 | Cinder rectangles | **deleted**; embers on per-mote phases |
| 17 | All three banners | asserted by hold → read → expire → read, never by grep |
| 18 | Box event rate | bounded; asserted at 5, 20, 40 boxes; morale term unchanged; lines/year reported |
| 19 | Boost rule | no `BOOST_LIMIT` Σ moves without its delivered value reported; **no cap changed** |
| 20 | Crystals | time-at-cap **< 70% on a seed**, or the failure reported with the fill curve |
| 21 | `MANUFACTORY_FUEL` | flat value **unchanged** |
| 22 | Unchanged | `capFamilyOf()` two families · audits 0/0 · Σ 4.35/1.80 · `CONSUMPTION` 4.25 · ratio 1.17647 · `XP_PER_SECOND` 0.05 · the rank ladder |
| 23 | Every Part | actioned, or its non-action explicitly justified |

### Predicted vs measured — medians of three, with spreads

| slice | Era 3 | note |
|---|---|---|
| v0.62 baseline | **unscoreable — one seed of three** | the report's figure; **my ensemble had not finished at hand-off** |
| s1: per-rung discovery cap | **−120 to −40** | 34% off the total, 58% off the rung that carries 48% of it |
| s2: steel lines | **−40 to −10** | the Storehouse gains a ceiling; the Warehouse loses four fifths of one |
| s3: philosophies | **−30 to +30** | a craft cost cut and a production rise against a renown cut |
| s4: banners, tooltips, box rate | **0.0** | no pacing effect |
| s5: crystal sink on a stock reference | **+20 to +80** | a harder drain near the ceiling |
| **shipped** | **Icathia on 3 of 3, Era 3 1,250–1,450** | **completion is the result; the median is secondary** |

**The prediction that matters is binary: does the round finish on three seeds.** I predict Parts 1
and 2 alone restore it, because the discovery cap removes 48,000 knowledge from the early ladder
and the Storehouse steel line removes a ceiling constraint from the cheapest storage building in
the game.

**And one prediction I expect to be wrong.** I predict Part 3.3's renown cut pushes first champion
past 130. **If it does, the +7.5% hunt yield is not enough compensation and the doctrine's two
halves should be sized together rather than taken as two independent notes** — say so rather than
shipping a gate failure.

---

## Sources, all read this session

**Line numbers pinned to `nuclear-unicorn/kittensgame` at `c52985b` (2026-08-04), cloned to disk.**

**Kittens:** `js/workshop.js` and `js/science.js` — a full join of 171 workshop upgrades against
the techs that unlock them: **139 (81%) carry science; per-upgrade ratio median 0.90 / mean 0.97;
upgrades per tech median 3; total upgrade science per rung median 2.43× / mean 2.79×; whole-game
upgrade science ÷ tech science 0.50.** Jerry's five named examples: `rotaryKiln` 145,000 vs
`robotics` 140,000; `factoryRobotics` 100,000; `offsetPress` 100,000 vs `combustion` 115,000;
`petri` 65,000 vs `biology` 85,000. `js/buildings.js` — barn `ironMax: 50`, warehouse `ironMax:
25`, harbor `ironMax: 150`, the steel≡iron mapping for Part 2.

**RR**, at the v0.62 tag: `index.html:3213–3214` — `DISCOVERY_KNOWLEDGE_DIVISOR 1.25` and the
22-member set, **applied by a load-time IIFE that a literal grep does not see**; the mutated
`UPGRADES` read live (32 of 78 carrying knowledge, 142,410 total, whole-game ratio 0.099,
`ritesOfTargon` 68,800 at 5.73× its rung and 48% of the game's total); `:3520` and `:3559` — the
three philosophies at `culture 5000` and `policyMult()`; `:1541`, `:1595` — `JARVAN_XP_PASSIVE 15`
generated against the **hard-coded "12% more"** lead string; `:6694` — the box event's uncapped
`jackboxes × 0.0002`; `:5701` — the same building's **bounded** morale term; `:10328` the crescent,
`:10368–10378` **the halo that already exists**, `:10342` the gold peak whose apex is the
halo's exact centre in the identical colour; `:10253` — the two cinder rectangles; `:6393` — the
six insight motes; `:3964` — `MANUFACTORY_FUEL`; `:2677` — `BOOST_LIMIT`.

**Measurements taken this session:** all 33 suites re-run from disk and parsed from their own
trailers (**1,786 passed, 0 failed, no missing trailer, no skipped site, no non-zero exit**);
`tools/parity-ledger.mjs` re-run (**225 / 87 / 117 / 21 / 0 — the ledger is finished**); a live
probe reading `UPGRADES` **after** the discovery-knowledge generator runs, giving the per-rung
burden table; a join of Kittens' workshop upgrades against their unlocking techs. **The three-seed
ensemble was launched at the start of the session and had not finished at hand-off — every Era-3
and milestone figure quoted here is v0.62's own, labelled as such.**
