# STANDING RULINGS — Runeterra Reclaimed

**What this file is.** Every ruling below is *closed*. They are recorded here because
re-litigating them has cost this project whole rounds. An analyzer or builder session
that flags one of these as an open question, a violation, or a discrepancy is wrong by
construction — read the ruling, cite it, and move on.

Each entry states the ruling, the round that closed it, and the source document the
wording comes from. Nothing here is reopened except by a new explicit ruling from Jerry.

**This file is not the always-read tier.** That tier is `rr-current-state.md` (in the
claude.ai project), `current-build-spec.md`, and `BUILDER_PROTOCOL.md` — read all three at
the start of every session. This file is read before flagging anything as a violation.

---

## 1. Ascent is free, instant, uncapped, bonus-free — permanently

> "Faith→Worship via manual 'Ascend Targon's Peak' — **free, instant, uncapped, bonus-free,
> permanently** (re-confirmed multiple times; closed)."
> — `rr-design-spec.md`, Era 1

> "Ascent is permanently free, instant, uncapped, and bonus-free — closed, do not revisit."
> — `rr-design-spec.md`, Standing directives

> "Ascent stays free, instant, uncapped, bonus-free. Permanently closed."
> — v0.52 analyzer input spec, Part 0.2

**Closed.** Do not propose a cost, a cooldown, a cap, or an Ascent bonus. `test-v32`
carries the `ascentFree` and `ascentUnchanged` regressions.

---

## 2. The 1.25 ratio band — closed v0.50

> "**The 1.25 band is CLOSED, not pending.** Kittens has no ratio-to-effect band: barn 1.75
> with no multiplier, hut 2.50, amphitheatre 1.15 with a real one. The test comment states
> the ruling."
> — HANDOFF v0.50, "Parts 4 and 5"

> "The 1.25 ratio band and its whitelist — ruled and closed in v0.50 Part 4."
> — v0.52 analyzer input spec, Part 0.2

This is one of **two RR-invented rules the source has contradicted and which must not
return**. The other is the effect-to-ratio proportionality bound, deleted by ruling in
v0.52 Part 2.6:

> "**Two RR-invented rules have been ruled out of existence and must not return** — the 1.25
> price-band rule (v0.50) and the effect-to-ratio proportionality bound (v0.52 Part 2.6).
> Kittens assigns `priceRatio` by what a building *is*, not by the size of its effect; its
> own Aqueduct scores 0.25 on RR's retired rule."
> — HANDOFF v0.52 §7, Standing directives

**Both were deleted, not widened.** Do not re-derive either as a heuristic.

---

## 3. The Convergence stripe is Kittens' literal `unlimitedDR(worship, 1000)`

> "The Convergence stripe. It is Kittens' literal `0.01 × unlimitedDR(worship, 1000)`,
> capped ×10, since v0.47. The code comment says 'do not derive this again.' The
> v0.46-derived 1,884 is superseded history, not a discrepancy."
> — v0.52 analyzer input spec, Part 0.2

**Do not re-derive it.** The 1,884 figure that appears in pre-v0.47 documents is
superseded history. A session that "discovers" a discrepancy between 1,000 and 1,884 has
found the historical record, not a defect.

---

## 4. Champions never hard-gate content — with one sanctioned exception

**The rule:**

> "Champions never hard-gate content — they get thematic fit bonuses and Skill-line
> acceleration, not requirements."
> — `rr-design-spec.md`, Standing directives

**The single sanctioned exception, ruled by Jerry and shipped in v0.52:**

> "**Standing directive — the Sparks exception (ruled by Jerry, v0.51):** Sparks Beyond the
> Wall requires a recruited Piltover/Zaun champion (Twitch, Caitlyn, or Heimerdinger). This
> is the single sanctioned exception to the 'champions never hard-gate content' rule above —
> sanctioned because it gates an Era on a **3-of-10 choice**, not on any specific champion; a
> player who recruits any one of the three passes. No future analyzer or builder session
> should flag this as a violation, and no round should soften it without a new ruling."
> — `rr-design-spec.md`, Standing directives

> "**The Sparks exception.** Sparks Beyond the Wall requires a recruited Piltover/Zaun
> champion. This is the **single sanctioned exception** to 'champions never hard-gate
> content', sanctioned because it gates an Era on a **3-of-10 choice**, not on a specific
> champion. Ruled by Jerry, v0.51. Recorded in `rr-design-spec.md` and at the `sparks` tech
> entry."
> — HANDOFF v0.52 §7, Standing directives

The gate in code is `["twitch","caitlyn","heimerdinger"].some(recruited)`.

**Corollary, and it has already misled one prediction:**

> "**Sparks is champion-gated, not knowledge-gated.** Its gate is
> `["twitch","caitlyn","heimerdinger"].some(recruited)`. Any prediction about Sparks timing
> that reasons from knowledge is predicting the wrong gate; **Call to Arms is the rung to aim
> at.**"
> — HANDOFF v0.52 §7

**Chronoshard is NOT champion-gated.** Any source doc saying otherwise is wrong about the
shipped game:

> "Chronoshard has **no champion gate** in code (`icathia` tech only; Zilean is flavor text).
> Any source doc saying otherwise is wrong about the shipped game."
> — v0.52 analyzer input spec, Part 0.2 (correction applied to `era3_4_bridge_spec.md` in
> v0.52 Part 4.2)

---

## 5. The Petricite Quarry keeps the id `quarry` — forever

> "**The merge runs one way only.** The building keeps the id `quarry`, keeps
> `stoneSlab 1000 + steel 125 + scaffold 50` at ratio 1.15 (Kittens' quarry transliterated —
> v0.46 Part 1, the largest lever in the project), gains `petriciteBlock 2` so the craft keeps
> a consumer, and is displayed as **Petricite Quarry**. `MINERALS_LINE` keys off the id and the
> ore formula `1 + 0.25M + 0.40Q` is stated in it — **never rename the id.**"
> — HANDOFF v0.49, "The global-production category (Part 1.7)"

The display name is **Petricite Quarry**; the id is **`quarry`**. `MINERALS_LINE` keys off
the id. Renaming it silently breaks the ore formula.

The Petricite Monument was deleted into this building, and the migration is one-way:

> "Old saves: `buildings.petricite` is dropped and refunded as `2 × n` Petricite Blocks. It is
> deliberately **not** converted into Quarries — `gold 600` against `stoneSlab 1000` is a
> twentieth of the price."
> — HANDOFF v0.49

---

## 6. `catMeta`'s two-output collapse must never be merged

> "**The collapse has TWO outputs and it must stay that way.** `catMetaTransient` carries the
> charts term alone, so knowledge, culture, vigor and devotion take ×1.10 exactly as before and
> do **not** inherit the drakes or the Dragon Soul. This is the v0.47 devotion trap in a new
> shape; a test asserts all four measure ×1.000 with the Infernal Drake at 100 kills and the
> Soul owned."
> — HANDOFF v0.50, "Part 1 — the census"

`catCharts`, `catDrake` and `catSoul` collapsed into
`catMeta = 1 + limitedDR(sum, META_LIMIT = 1.0)`. **`catMetaTransient` is the second output
and is load-bearing.** Collapsing the two into one re-creates the v0.47 devotion trap:
knowledge, culture, vigor and devotion would silently inherit the drakes and the Dragon Soul.

---

## 7. Autoprod, not worker roles, for later-Era raw resources

> "Later-Era intermediate resources should be gathered via passive, building-driven autoprod
> (buildings that continuously consume banked resources to produce the new resource every
> tick) rather than a dedicated worker role — mirroring Kittens' Smelter/Calciner pattern.
> Confirmed project-wide principle per rr_game_plan.md §1.3."
> — `rr-design-spec.md`, Core production model

Applied to Era 3's three Zaun raws (Zaun Ore, Coalgas, Hexcrystal Ore):

> "`era3_regional_crafting_spec.md`: remove the Prospector/Stoker worker roles — superseded by
> ruling; the three Zaun raws are autoprod, matching Kittens' Smelter/Calciner."
> — v0.52 analyzer input spec, Part 4.2 (correction applied in v0.52)

The source file `era3_regional_crafting_spec.md` was corrected in v0.52 Part 4.2. Do not
re-introduce the worker roles from an older copy of that document.

---

## 8. Known analyzer failure modes — grep the code before flagging

> "**Known failure mode, restated:** this analyzer instance has repeatedly marked
> already-shipped items as outstanding and cited identifiers that do not exist in the
> codebase. Every item below carries the code-verified state as of v0.50; verify against
> `index_50.html` before contradicting it."
> — v0.52 analyzer input spec, Part 0.3

> "The mechanics analyzer periodically marks already-shipped items as outstanding or cites
> identifiers that don't exist in the codebase — verify against actual code before
> implementing anything it flags."
> — `rr-design-spec.md`, Standing directives

**Always grep `index.html` before flagging anything as outstanding or missing.** And when
you grep, strip comments first — this has bitten twice:

> "**Strip comments before grepping source.** A source-shape assertion that greps for a phrase
> will match the comment that explains the phrase. This has now happened twice — the v0.51
> banner check and the v0.52 `resRatio` check."
> — HANDOFF v0.52 §6

And the companion rule, from the four-round-old Shimmer Refinery defect:

> "**A zero in a measurement is a claim about the apparatus until you have checked the
> apparatus.** The v0.52 round found that 'Shimmer Refineries: 0', reported in three
> consecutive rounds and acted on in one, meant the bot's build-order list did not contain the
> building. Before reasoning from a zero, confirm the instrument can produce a non-zero."
> — HANDOFF v0.52 §6

---

## 9. Operational rules — each of these has already cost a round

> "**Kill background runs by PID from `ps -eo pid,args`.** `pkill -f "<pattern>"` matches the
> bash process running it and returns exit 144, silently dropping queued work. **This mistake
> has now been made twice** — v0.46 and v0.50."
> — HANDOFF v0.52 §6

> "**Size every `sleep` under the tool timeout** while background runs are live. A 10-minute
> sleep returns exit 143 and takes a 20-minute pacing run with it."
> — HANDOFF v0.52 §6

> "**Instrument before launching.** Every metric the spec names goes into `simcore.mjs`'s
> snapshot *before* the first 2,500-year run. Not doing this cost v0.50 two re-runs."
> — HANDOFF v0.52 §6

> "**Isolation builds must BE the shipped file up to that point**, snapshotted from it — never
> reconstructed by re-applying patches. v0.47 shipped a report labelling an isolation build
> 'Part 1 only' when it was not, and retired at y1,005.3 on the strength of it. Since v0.50 the
> discipline is **cumulative prefixes**: snapshot `index.html` after each slice, run each
> snapshot, and the differences are attributable by construction."
> — HANDOFF v0.52 §6

Two more from the same section, kept because they are the same class of rule:

> "**Playwright:** always `chromium.launch({ executablePath: "/opt/pw-browsers/chromium" })`
> with a `.catch(() => chromium.launch())` fallback. **Never run `playwright install`.**"

> "**Timing:** a 2,500-year seed-1 run is ~22–31 min wall, and three in parallel is roughly the
> same as one. Plan the round around that, not around the optimistic case."

---

## 10. Version numbering — the repo tag is authoritative

**v0.52 is shipped and tagged. The next build is v0.53.**

The analyzer has mislabeled the version twice, in consecutive directions:

> "**Naming:** the analyzer titled its spec 'BUILDER SPEC v0.48'. v0.48 had already shipped as
> the two UI documents (tooltip restructure + animations), so that spec shipped as **v0.49**.
> Expect the analyzer's next spec to be off by one again unless someone tells it."
> — HANDOFF v0.49

> "**Version discipline:** the last spec you titled 'v0.48' shipped as v0.49."
> — v0.52 analyzer input spec, Part 0.4

> "Shipped as **v0.52**. The spec is titled v0.51; v0.51 was the pixel banner."
> — BUILD REPORT v0.52, header

**The ruling: the git tag is the authoritative version number, not the spec title.** A spec
is named for the build it *produces*, and if a spec's title disagrees with the tag, the tag
wins. The in-file `VERSION` constant and the footer must match the tag at ship time.

The filename `index.html` is now permanent. Versioning lives in the `VERSION` constant,
commits and tags — never again in the filename.

---

## 11. `poroRatio` is unbounded on purpose — closed v0.53

BUILD REPORT v0.52 §2.2 and HANDOFF v0.52 §7.1 both call `poroRatio` "RR-only content with no
source counterpart, so there is nothing to be at parity *with*." **That is wrong**, and the
correction is closed:

> "It is Kittens' `unicornsRatioReligion` (`js/religion.js`, ziggurat ladder): unicornTomb 0.05
> + ivoryTower 0.10 + ivoryCitadel 0.25 + skyPalace 0.50 + unicornUtopia 2.50 + sunspire 5.00 =
> 8.40 → ×9.40, ADDITIVE within one category, UNBOUNDED, every rung at priceRatio 1.15. RR's
> four rungs sum to 1.13 → ×2.13 — a rank-for-rank transliteration of the source's first four,
> at **23% of the source's full stack**."
> — v0.53 Part 3.1, recorded at `poroRatio()`

**RR is not over the source; it is at less than a quarter of it, and it is missing the two
largest rungs rather than carrying two invented ones.** `enhance-audit`'s "×41 at 500 copies,
linearity 1.0000" is the correct answer for a category Kittens also runs unbounded — 500 copies
of each of four buildings is not a state the game reaches.

**Do not add a limit.** §2 above records two RR-invented rules already deleted for being
heuristics the source contradicts; a bound here would be the third.

**Note for whoever reads a zero here:** the whole `poroRatio` ladder was **unbuildable by the
simulator** until v0.53 Part 1.2 taught the bot the Poro sacrifice. Every pre-v0.53 measurement
of this category reads ×1.5 for that reason and for no other.

---

## 12. `audience` is kept as a conscious departure, with a tripwire — closed v0.53

`bardsHearth` carries `audience: 0.05`, multiplying its culture by `1 + 0.05 × S.pop`. Kittens'
Amphitheatre has **no population term at all** — `culturePerTickBase` is flat per copy
(`js/buildings.js:1801–1830`). This is an RR invention with no source counterpart.

**Ruling: keep it, flag it, do not bound it.** At RR's measured peak population (200 for four
rounds, 222–224 on the v0.53 build) it is worth +22% culture on **one** building whose culture
is capped anyway — an order of magnitude below the range where it would matter.

The judgement is a **tripwire in code**, not a note in a comment:

```js
var AUDIENCE_REOPEN_POP = 600;
```

`test-v53` asserts the constant; the pacing harness prints peak population every run. **If peak
population passes 600, this ruling re-opens by construction** — and until it does, a bound on a
term that does not bind would be a third RR-invented rule.

---

## 13. Era 3 length is a difference of two milestones — recorded v0.53

Not a ruling about the game; a ruling about how the project reads its own instrument, and it has
already misled four rounds of reasoning.

> "Era 3 is measured as `Icathia − Sparks`. The v0.53 apparatus fix moved Sparks 83.4 game-years
> earlier and Icathia 61.2 earlier, so **Era 3 'grew' by 22.2 without one thing in Era 3 getting
> longer.**"
> — BUILD REPORT v0.53 §3

**Any proposal aimed at Era 3 must state which edge it moves.** A change that accelerates the
early game inflates Era 3 for free and tells you nothing.

The companion finding, from the same round:

> "**Demand lengthens Era 3 only when it is demand for something SCARCE.**  v0.53 shipped two
> demand items and neither bit: crystals sit at cap 94.8% of every tick, and Void Essence cannot
> be accumulated by the instrument at all. v0.52's Shimmer Refinery result (+172.6) was not 'add
> a consumer' — it was 'add a consumer for coalgas and mana, which the late build order was
> genuinely short of.'"
> — BUILD REPORT v0.53 §10

---

## 14. Merchant fatigue is deleted — closed v0.54

> "It charged a running −8% per recent trade with the same civilisation, to a floor of ×0.15,
> recovering over 90 seconds. It has **no Kittens counterpart** — the source's trade has a
> season modifier, a race standing/embassy ladder and a failure chance, and no per-partner
> cooldown penalty of any kind. And it punished the only interaction the Trade tab has: the
> counter-play was to stop playing for ninety seconds, and waiting is not a decision."
> — v0.54, directive 10

**This is the THIRD RR-invented rule ruled out of existence**, after the 1.25 price band
(v0.50) and the effect-to-ratio proportionality bound (v0.52 Part 2.6). Do not re-derive any
of the three as a heuristic.

`tradeFatigue()`, `fatigueMult()`, `FATIGUE_RECOVER_S`, `FATIGUE_PENALTY`, `FATIGUE_MAX` and
the "· weary −N%" line are all absent at grep level. **`S.tradeFatigue` survives in
`freshState()` and in one read inside `loadFromString()`** — it is how an old save's met
civilisations are inferred, and deleting the key would lose that. Nothing writes it.

Two leader effects were re-pointed in the same round because they referenced the deleted
mechanic; Twitch's had already become a leader slot that did nothing at all:

- **Caitlyn** — +5 Renown per caravan, every cargo tier opens five caravans early, +10 points
  of slot chance.
- **Twitch** — +15 points of slot chance on every route.

---

## 15. The live loop reconciles against the wall clock — closed v0.54

`tick()` advanced a **fixed** 0.2 s and never consulted the clock, so a browser-throttled
background tab lost ~80% of its production with nothing to recover it. **Closing the tab was
strictly better than leaving it open.**

> "Ticks delivered at 1/second for 10 real seconds advanced 2,000 ms of game time — 20% of
> the real rate." — OFFLINE AUDIT v0.52, defect 1

**Consequence for every future test:** anything that drives `tick()` in a loop must
**virtualise `Date.now` and advance it by `TICK_MS` per fire**. A tight loop against the real
clock now advances no game time at all. `test-v35`, `test-v47` and `test-offline-v54` all do
this; two of them had to be re-pointed in v0.54 for exactly this reason.

The large-gap branch routes through `runCatchUp()` — **the same replay the closed-tab route
uses** — and is clamped to the same `OFFLINE_CAP_HOURS`. There is still ONE production path,
and `test-v47` asserts it.

`runCatchUpChunked()` was complete, correct and **never called** from v0.47 until v0.54,
while the v0.47 build report claimed the feature shipped chunked. It is wired up now, and it
runs as a single blocking pass below `CHUNK_MIN_DAYS` so a 200 ms replay does not become
asynchronous for no reason.

---

## 16. Kittens parity of TIMING and SCALE is the project's primary goal — ruled by Jerry, v0.55

> "Let's make our primary goal with changes going forward to increase parity timing with
> Kittens. Everything in this game should unlock in similar timing and scale with Kittens.
> Having the bots is helpful but they do not play the game the same way a person does and
> therefore building things based on their gameplay will not balance correctly. Keep the bots
> so we have a loose year count, but ultimately, we should balance based off of Kittens. Where
> this becomes difficult is RR original content, which typically will make things EASIER or
> QUICKER — it will be important to call out when RR original content makes things easier or
> harder compared to Kittens."
> — Jerry, v0.55

**This supersedes the balance authority every round since v0.44 has used.** Three consequences,
and all three are binding:

1. **The source is the balance authority; the simulator is an instrument.** A proposal is
   justified by a Kittens rung, cost, ratio or rate — with a file citation — not by what the
   greedy bot did with it. Pacing runs still ship every round, and every pass condition that
   reads a milestone year still stands, but a bot measurement is now **evidence about the
   instrument's playthrough, not a balance argument**. "The bot never builds it" is a reason to
   check the apparatus (§8); it is no longer a reason to change a price.

2. **Every RR-original item carries a parity label.** Anything with no Kittens counterpart —
   drakes, champions, Renown, the Wilds, the undo window, poros, the Freljord line, morale — is
   recorded as **EASIER** or **HARDER** than the source with the reason, in
   `docs/PARITY-LEDGER.md`. Jerry's own observation is the null hypothesis: **RR-original
   content usually makes the game easier or quicker**, so an unlabelled RR-original item should
   be assumed to be a speed-up until measured.

3. **Divergences are reported, not silently carried.** Where RR departs deliberately, say so
   and say which direction. `claude/kittens-game-reference.md` has required this of new design
   since v0.43; it now applies retroactively to everything already shipped.

**What this does NOT do.** It does not reopen anything in §§1–15. It does not make "Kittens does
X" sufficient grounds to transliterate a name onto a different building — v0.52 Part 1.2 put
Kittens' Aqueduct figure on the wrong RR building and had to be undone. **Port the mechanism and
the rung; assign by role.**

---

## 17. Kittens' farmers are NOT seasonal — closed v0.55, and the divergence ships anyway

Jerry's v0.55 directive was stated as a parity claim: *"Kitten's farmers are affected by
seasonality."* **They are not.** Resolved against the raw source this round:

- `js/village.js updateResourceProduction()` — the job production path applies **skill, rank,
  leader and happiness** and nothing else. There is no season term and no call to
  `getWeatherMod()`.
- `js/calendar.js` — `getWeatherMod()` exists and is real, but it is applied to the **catnip
  field** line, not to the job line.
- The Kittens wiki's Game Mechanics page states it outright: *"Seasons affect catnip production
  from catnip fields, but do not affect production from farmers."*

**The directive shipped regardless, because directives override the spec.** What §16 forbids is
shipping it as PARITY. It is recorded in `docs/PARITY-LEDGER.md` as **RR-ORIGINAL, HARDER** —
the first HARDER label the charter has produced, and the ruling that proves the labelling
machinery does something. Deepwinter now cuts the settlement's entire job-based food supply by
75% for a quarter of every year, which is what winter was always advertised to do and never did.

**Do not "fix" this back to parity in a later round without a directive.** It is deliberate, it
is labelled, and its cost is measured (see BUILD REPORT v0.55 §6). Equally, **do not cite it as
precedent for guessing at the source** — the reason it is a clean divergence rather than a bug
is that somebody read `js/village.js` before shipping it.

---

## 18. `hunterLodge` is deleted — closed v0.55

The Hunter's Lodge is gone from `BUILDINGS`, and `campYieldMult()` no longer reads **any** job
count or **any** building count. Kittens' hunt yield comes entirely from workshop upgrades
(`js/workshop.js`, Σ 5.10 → ×6.10 across seven members); its hunter *job* produces `manpower`
and boosts nothing, and it has no hunt building at all. RR carried two RR-original members —
`0.15 per Lodge` and `0.05 per Jungler` — which together were why the stack could not be read
against the source at any investment level.

The seven members that remain map one-for-one onto the source: five hunt Discoveries
(1.0 + 2.0 + 1.0 + 0.5 + 0.5) onto Kittens' six armour/bolas upgrades, and the **Open Range**
policy (0.1) onto `rationing`. Σ **5.10**, delivered **×5.9286** through `limitedDR(_, 6)`
against the source's unbounded ×6.10 — a 2.8% cost for the bound, which is why
`CAMP_YIELD_LIMIT = 6` stays (Appendix).

The **Trailblazer trait** is an eighth member and is RR-original. It is kept, not removed,
because it is hard-bounded: `limitedDR(n × 0.005, TRAIT_LIMIT = 0.15)` can never add more than
0.15 to Σ regardless of roster size. Labelled EASIER in the ledger with the ceiling stated.

**A v0.54 save that owns Lodges is migrated on load** — the building is dropped and 50% of the
ratio-1.15 geometric sum is refunded in timber, ore and furs. Do not delete that migration; it
is asserted in `test-v55` against a synthetic ten-Lodge save.

---

---

## 19. Storage has SCOPE, and it is a table — closed v0.56

RR ran **one multiplicative chain** across twelve resources (`masonryMult` = 1.75 × 1.8 × 2 × 2
× 1.75 = ×22.05 nominal, ×12.6 realised). That was wrong twice over: it is a Kittens'-Law
violation (storage expansion is ONE category, and effects are additive within a category), and
it had no scope at all where the source has three.

`js/resources.js:866-885 addBarnWarehouseRatio` is the authority, and it is quoted verbatim in
`index.html` beside `BARN_LINE`. Two additive accumulators, enumerated from `js/workshop.js`:

- **`barnRatio` Σ 4.35** — stoneBarns 0.75 + reinforcedBarns 0.80 + titaniumBarns 1.00 +
  alloyBarns 1.00 + concreteBarns 0.75 + strenghtenBuild 0.05
- **`warehouseRatio` Σ 1.80** — reinforcedWarehouses 0.25 + titaniumWarehouses 0.50 +
  alloyWarehouses 0.45 + concreteWarehouses 0.35 + storageBunkers 0.20 + strenghtenBuild 0.05

delivering **narrow ×14.98 · broad ×2.80 · quarter ×2.0875 (gated on Silos) · none ×1.00**.

**`CAP_SCOPE` is total by construction and `test-v56` asserts it by enumeration.** Every capped
resource is in exactly one tier and no tier names a non-resource. Adding a resource without a
tier fails the suite, which is the point — the previous arrangement let `knowledge` fall through
to a ×22 line by omission (v0.45 Part 5) and nobody noticed for three versions.

**Three tier assignments are RR-ORIGINAL design rulings, not parity claims, and they are stated
as such in the source comment:** `mana` sits in Timber's narrow tier because v0.36 item 15 ruled
"Mana is a material, at cap parity with Timber" and honouring a ruling means honouring both
halves of it; `crystals` and `renown` sit in the broad tier because gold's role is the closest
match either has. **`renown`'s v0.44 Part 2.2 `Math.sqrt(masonryMult)` is retired — there is no
longer a product to take a root of.** It was measured before it was chosen: at the "none" tier
the Chemtech-era Renown ceiling is 5,810 against the tenth champion's 9,611 cost, which puts the
last rung of the champion ladder out of reach; at "broad" it is 14,815.

**Do not re-introduce a multiplicative storage chain.** If a new storage upgrade arrives, it
adds to `BARN_LINE` and/or `WAREHOUSE_LINE` and its shares are chosen so the sums stay at the
source's 4.35 and 1.80 unless the source itself changes.

---

## 20. RR's food stores hold Kittens' figures — closed v0.56, on Jerry's directive

> Jerry, v0.56: *"the provision cap is too large and deepwinter is never a problem."*

Measured on the v0.55 build: **provisions sat at cap for 1.5% of all ticks** across a 2,500-year
run — the ceiling was so far above the economy that a season could not reach it. Three sourced
corrections, all now shipped:

| building | RR before | source | RR now |
|---|---|---|---|
| Storehouse (= Kittens' barn) | 7,500 | `js/buildings.js:766` `catnipMax: 5000` | **5,000** |
| Harbor (= harbour) | 10,000 | wiki *Catnip*, 2,500 each | **2,500** |
| Warehouse (= warehouse) | **none** | 750 each, after Silos | **750, gated on `chemtechSilos`** |

**The v0.47 note that defended provisions 750 is retired.** It said Kittens' catnip is one
resource doing two jobs and RR splits it into provisions and mana, so `catnipMax 5000` had no
single counterpart to transplant. **That was an argument about units, and v0.55 Part 3.1
dissolved it** by rescaling provisions ×10 so RR's farmer produces 5.000/s exactly as Kittens'
does. Once the units match, the figure transplants directly.

The Warehouse's conditional cap uses a declared `capsIf: { upgrade, caps }` field read in
`computeCaps()` and `effectLines()` — **one declaration, two readers.** Do not add a second
conditional cap as an inline special case.

---

## 21. A test that captures a baseline from live state must reset the state it is baselining

Closed v0.56 Part 6, and it is the third instance in two rounds.

`test-v32`'s camp assertion cleared `S.upgrades`, `S.jobs` and `S.buildings` and then took
`base = campYieldMult()` **with the live roster still in `S`**. Since v0.55 Part 4 the seventh
member of that stack is `traitBonus("trailblazer")`, so a leftover Trailblazer made `base` 1.005
and the assertion measured 4.980 against an expected 5.000. The trait roll is random, so it
passed only when the roster happened to hold none.

**HANDOFF v0.55 §8.6 recorded three such failures as CPU contention and prescribed "re-run on an
idle box". That remedy worked BY LUCK and hid a real defect across three rounds.** The entry is
corrected; the contention note is retired.

The two prior instances: `test-offline-v54`'s "bit-identical" check, which passed for four
rounds because its fixture was pinned to its storage cap for 72% of the run, and `test-v42`'s
free-band check, which was true by construction at Σ 0.5.

**`tools/fixture-sweep.mjs` is the standing detector.** It re-runs every suite on a deliberately
dirty roster and reports assertions that fail only there. Run it after any change to a shared
multiplier. It documents its own one known artefact — `loadFromString()` merges a save over
`freshState()`, so poisoning `freshState()` re-dirties containers a block legitimately cleared —
so that a reader does not "fix" a non-bug.

---

---

## Appendix — settled items an analyzer session should not re-open

These are not separate rulings; they are the code-verified state as of v0.52, recorded so a
session does not re-flag them:

- `BOOST_LIMIT` has **seven** keys — `devotion 2.0, culture 2.0, gold 1.5, vigor 1.0,
  crystals 2.0, provisions 1.5, mana 1.0`. **`knowledge` is deliberately absent and must stay
  absent** — that absence was the entire v0.52 round, and `test-v52` asserts it with the
  source citation. Do not re-add it thinking it was an oversight.
- **`CAMP_YIELD_LIMIT = 6` is kept deliberately, not by default.** Censused against Kittens'
  `hunterRatio` in v0.52 Part 2.5: the source sums to ×6.10 unbounded across 7 members; RR
  runs 9 members at a measured ×6.35 against a ×7.00 asymptote.
- **`resRatio` does not exist.** Deleted in v0.52 Part 2.1 — table, apply loop and breakdown
  branch.
- **Deleted content, absent at grep level:** `tavern`, `bloomery`, `refinedMetallurgy`,
  `timberframeJoinery`, `petricite` (the Monument), `mw` (Masterwork Tools as a category).
- **The bot's `BUILD_ORDER` and `DEDICATED_ROUTINES` live at module scope in `sim/simcore.mjs`
  and `test-v53` fails if `BUILDINGS` minus the two is non-empty.** Added v0.53 Part 1.1 after
  the Shimmer Refinery omission recurred four more times. **A new building must be added to one
  of those two lists in the same commit that adds the building.**
- **There is a `VERSION` constant** (`var VERSION = "v0.53"`) and the footer is rendered from it
  by `stampVersion()` at boot. Before v0.53 there was none, despite §10 requiring one — the
  version lived only inside the footer's prose. Bump the constant, not the prose.
- **Wanderer rank is PER TRADE** (v0.54 directive 8). Experience banks in `w.jx[job]`;
  `w.xp` survives only as the lifetime total the Census sorts on. A Challenger miner farms
  like a Bronze farmer until they have farmed.
- **Do not pin a literal version string in a suite.** `test-v53` did and became a check
  designed to fail every subsequent round. Assert the shape; pin the value in the round's own
  suite.
- **`test-v32` does NOT flake under CPU contention.** The v0.53-v0.55 failures attributed to
  contention were §21's fixture defect: the camp block took its baseline with a live roster and
  a random Trailblazer moved it. Fixed v0.56; `test-v32` passed 10/10 including under load.
  **Do not restore the "re-run on an idle box" remedy** — it hid this for three rounds.
- **`test-v2` … `test-v31` are historical.** They were written against builds three to eight
  versions retired and **will fail against v0.52**. They live in `tests/historical/`, are shipped
  for archaeology, not for regression, and their failures are not defects. `test-v14` in
  particular asserts the Tavern, which no longer exists.
