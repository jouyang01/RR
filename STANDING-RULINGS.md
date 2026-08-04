# STANDING RULINGS — Runeterra Reclaimed

**What this file is.** Every ruling below is *closed*. They are recorded here because
re-litigating them has cost this project whole rounds. An analyzer or builder session
that flags one of these as an open question, a violation, or a discrepancy is wrong by
construction — read the ruling, cite it, and move on.

Each entry states the ruling, the round that closed it, and the source document the
wording comes from. Nothing here is reopened except by a new explicit ruling from Jerry.

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
- **`test-v2` … `test-v31` are historical.** They were written against builds three to eight
  versions retired and **will fail against v0.52**. They live in `tests/historical/`, are shipped
  for archaeology, not for regression, and their failures are not defects. `test-v14` in
  particular asserts the Tavern, which no longer exists.
