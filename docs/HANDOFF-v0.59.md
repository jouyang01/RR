# HANDOFF v0.59 — Runeterra Reclaimed

Written for whoever picks this up next, with no memory of this session.

---

## 1. What the project is

A League-of-Legends-flavoured idle game in one HTML file, built with **Kittens Game as its
balance authority**. Not as inspiration — as an authority. STANDING-RULINGS §16 makes source
parity of timing and scale the primary goal, and `docs/PARITY-LEDGER.md` is the instrument that
gives "is this at parity?" an answer that does not have to be re-derived every round.

**RR-original content is legal.** It has to be labelled, and the null hypothesis (§16) is that an
unlabelled RR-original is a suspected speed-up rather than a neutral one.

---

## 2. The two things v0.59 should change about how you work

**A migration is invisible to a fixture built from `freshState()`, and that is how the game spent
three versions deleting players' buildings.** The Granary bug (BUILD REPORT §1) was not a bad
line of code — it was two correct decisions in different rounds meeting. v0.51 retired an id and
wrote the ordinary migration for it; v0.56 shipped a new building on the same id because the id
looked free. **Every save/load assertion in the project passed throughout**, because they all
round-tripped a `freshState()` that had no Granaries in it. **If you write a migration, write a
fixture that CONTAINS the thing being migrated**, and read STANDING-RULINGS §30, which is new
this round and enforced mechanically by `test-v59`.

**Check whether a condition is measuring a mechanism or measuring an absence.** The Convergence
condition read 0 on all three seeds for a whole round and was treated as a balance finding.
`worshipBonus()` returns 0 unless the tech is researched, and the measurement point was an era
boundary at which the bot has not researched it — so the condition was reporting *"the player has
not bought this yet"* as *"the curve has collapsed"*. **A condition that reads exactly 0, on every
seed, with no spread, is far more likely to be measuring a gate than a curve.**

---

## 3. The laws the game is built on

- **Kittens ticks 5/s.** Per-second = per-tick × 5. RR's `TICK_MS = 200` is exact tick parity.
- **Kittens' Law, CATEGORY-GENERAL:** additive within a category, multiplicative only between.
- **DR primitives:** `limitedDR(x, L)` is **linear below 0.75·L**; `unlimitedDR` is
  `(√(1+8v/s)−1)/2`; **`strictDR(x, L)` bites from the first unit and has a true asymptote.** If
  you want a bound that cannot be run away from, `strictDR` is the one.
- **Cap families — TWO of them now, not three (§22, §29, and v0.59 Part 5.3).** Every capped
  resource is in EXACTLY ONE of `CAP_MULT_EXEMPT` or `CAP_SCOPE`, decided by `capFamilyOf()`,
  which returns `exempt`, `masonry` or null. **`SCHOLAR_CAPS` is deleted**, along with
  `SCHOLAR_LINE`, `scholarMult`, `scholarAdd` and `scholarCapNames()`. `CAP_MULT_EXEMPT` is
  `{ vigor, knowledge, culture, devotion }`; renown sits at `CAP_SCOPE`'s `"none"` tier, which
  resolves to ×1 but still takes the drakes and a leader.
- **§29's SLICE multipliers** — `capsSliceMult(building, resource)` applies to one building's
  contribution rather than a finished ceiling. That is Kittens' shape for faith **and for
  science**, and v0.59 Part 5.4 uses it for the Archive's `archiveRatio` too.
- **A whole-cap KNOWLEDGE multiplier belongs on a POLICY, never on a Discovery chain.** Kittens
  has exactly one in the entire game and it is `technocracy` — ×1.20 for 150,000 culture and the
  permanent loss of two policy branches. If a future round wants one, that is the magnitude and
  that is the shape. **None ships.**
- **§24 / §26:** run `resourceBalance` and read `kind` before sizing any ceiling. `lumpy-only`
  means a percentage target is the wrong SHAPE of target.
- **§28:** express bot policies in the units of the thing being bought, never as a fraction of a
  ceiling.
- **§30 (new):** a deleted id is never reused while its migration exists, and a migration must
  name the version that retires it.

---

## 4. The state of the build

**Shipped v0.59. 29 suites, 1,482 assertions, 0 failures.** Parity ledger: **227 rows — PARITY
64, EASIER 40, HARDER 2, UNVERIFIED 121.** Parity debt fell 126 → 121, the largest single-round
repayment since the ledger was built, because Part 5.4 found real citations for six upgrade rows
at once.

**THE CHAMPION LADDER COMPLETES FOR THE FIRST TIME.** v0.58.1's tenth champion was never
affordable inside 2,500 years; v0.59 recruits all ten by **y994.5 median, on all three seeds**.
The two changes that did it pull in opposite directions on paper — Part 5.3 *removed* renown's
×2.60 ceiling multiplier and Part 2.2 cut the passive trickle by up to 100× — and Part 2.1's deed
rate paid for both. **A settlement that hunts finishes the ladder; one that idles does not.**

**Era 3 is 797.5 (624.1–824.0), and the SPREAD is the thing to look at, not the median.**
v0.58.1 measured ×1.02 — the tightest this project has recorded. v0.59 measures **×1.32**, and
nothing this round touched Era 3 content. What it touched is the champion ladder, and champion
passives are production multipliers: seed 2 gets its first champion at y142 against seed 1's
y101 and finishes Era 3 two hundred years later. **The renown economy is now the largest source
of run-to-run variance in the game.** That is a real property of making renown a deed currency,
not a defect — but it deserves a ruling rather than an inheritance, and it is why the one failing
pass condition fails.

**Nine of ten pacing conditions pass. The failure is `First champion before year 120` at its
`[max]` shape** — seed 2 reads 142 against 101 and 102.1. The median, 102.1, is 38.8 years better
than v0.58.1's 140.9. It is a **ceiling** condition by construction (v0.58 Part 1: the first
champion must arrive for every player, not the median player), so one seed at 142 fails it and
should. **Reported, not re-based** — it is the variance finding above, measured a second way.

**The round's structural headline is a deletion.** `SCHOLAR_CAPS` was a whole cap family with one
member; deleting it rather than emptying it took RR from three cap families to two and removed
five symbols and two guards along with it. **A family object with one member is a family object
about to be wrong.**

**Renown is a different currency than it was.** Deeds pay their authored value (rate 0.34 → 1.00,
charge guard deleted, charge multiplies ×3 after the floor), trade pays +1 per caravan for every
leader, and the passive trickle is flat 0.007/s — 100× smaller at pop 140 than it was. The tenth
champion now needs **18 Halls of Heroes**.

**Two targets were retired rather than re-based**, which is the discipline this project keeps
failing and then re-learning: the **Era 3 1,400–2,300 band** (Jerry's ruling: "907 is okay"), and
the **Convergence-at-Sparks** measurement point (moved onto the unlock, where the source's anchor
actually is). Both retirements are recorded in `pacing.mjs` with their reasoning at the site.

---

## 5. Operational rules, each of which has already cost a round

1. **Add a new building to `BUILD_ORDER` in the same commit that adds the building.**
2. **A per-part check must look at more than the part.**
3. **Instrument BEFORE you change the thing.**
4. **Two-tier verification (`BUILDER_PROTOCOL.md`):** cheap single-seed checks per item; the full
   multi-seed ensemble EXACTLY ONCE, at the end. **It is not optional.**
5. **Run ensemble seeds concurrently, and don't poll them — but CHECK `nproc` FIRST.** This
   container has **two cores**. v0.59 launched four attribution slices beside a three-seed
   ensemble and all seven made no progress; the slices were killed. On a 2-core box, concurrent
   means the ensemble and nothing else.
6. **A fixture that takes a baseline from live state must reset the state it is baselining** (§21).
7. **A migration fixture must contain the thing being migrated** (§30, and BUILD REPORT §1).
8. **Never pin a literal version string in a suite** — and *"assert that a file is absent"* is a
   version-pinned assertion in disguise. `test-v581`'s §3 assertion was one and had to be
   re-pointed the moment a new spec arrived.
9. **Re-point superseded assertions, never delete them**, and name the superseding item at the
   site. Twenty were re-pointed this round; the table is BUILD REPORT §8.
10. **Run a syntax check before a sim run.** A `count()` call inside an `effect:` string — which
    is evaluated when the `UPGRADES` array is built, before `S` exists — took the whole page down
    this round and cost thirty seconds to find because the checker exists.
11. **Push with the proxy unset, and scrub the token afterwards** — see §8.

---

## 6. What is open, and for whom

**For Jerry:**

- **Bulk trades under Caitlyn pay 60 renown, not the spec's 16.** Ten caravans at 1 + 5 each. Her
  lead says "+5 per caravan" and the directive says bulk pays per caravan, so 60 is the
  consistent reading — but it is a large number and it is yours to cap. One line in
  `tradeCaravanBulk`. BUILD REPORT §2.2.
- **The tenth champion needs 18 Halls of Heroes** — cumulative ~16,000 timber and ~29,000 ore.
  The spec's escalation ladder (raise `RECRUIT_RATIO`, cut the Hall's 900, a hard Hall-count gate)
  was NOT used, because 18 met the target. Say the word if it should be steeper or shallower.
- **`RENOWN_DEED_RATE` is 1.00.** If you preferred 0.34, the ladder goes flat again — every low
  camp pays exactly 1 — and the charge multiplier stops meaning anything. That was the argument
  for moving it; the number itself is yours.
- **Zilean's time warp is now a BUFF as well as an agency change**, and is labelled EASIER on that
  basis: choosing when to spend +50% beats having it fire when the meter fills. If you want it
  neutral, the lever is `TIMEWARP_GAIN_RATE`.
- **§27, the population band** (150–220, from v0.58). Still yours to overturn with a word.

**For the analyzer:**

1. **`XP_PER_SECOND` is still UNVERIFIED, and Part 6 makes it matter more than it did.** The rank
   ladder is now measured as a **102% threshold debt** at the top rung — and a threshold debt at
   an unverified accrual rate is one unknown multiplied by another. **The two must not be
   conflated, and the ledger says so in one line.** Five retrieval routes are recorded as
   dead ends so nobody repeats them.
2. **121 UNVERIFIED rows.** Part 5.4 shows what a productive round looks like here: it did not
   guess, it read `js/workshop.js` and `js/buildings.js` and found that **six** RR upgrades were
   already at parity and nobody had checked. Ten to fifteen a round, by subsystem.
3. **The per-slice Era 3 attribution table is unfilled** (BUILD REPORT §2.5) because this box has
   two cores. The slices are committed at `snapshots/v59/s1,s3,s4,s7` as cumulative prefixes of
   the shipped file, so a session with more cores can fill it without re-deriving them.
4. **Era 3 has no target at all now.** That is correct for this round — the old band was
   calibrated on an instrument with a 2.6× error bar — but it means nothing is watching the
   number. If a target should come back, `era3_regional_crafting_spec_2.md`'s 7-day arc is the
   design intent to derive it from, and prior measurements are not.
5. **`archiveRatio`'s Σ 0.06 is Kittens' figure at RR's building economy, and those are not the
   same thing — now measured.** The spec's fixture assumed 10 Observatories and predicted ×1.30.
   **A real 2,500-year run holds 60**, so the Archive's own slice runs **×4.6** and the delivered
   multiplier on the whole knowledge ceiling is **×1.5199**. The mechanism is exact (the
   `delivered` vs `1 + Σ` gap is 0.000% at all four milestones); the magnitude a player sees is
   larger than the source's, because RR builds more Observatories than Kittens does. **Porting a
   source ratio does not port the source's outcome when the building it scales on is priced
   differently.** Worth a census of RR's four knowledge buildings against Kittens' four.
6. **Era 3's spread went ×1.02 → ×1.32 with no Era-3 content changed.** See §4. The mechanism is
   identified (champion passives, gated on a now-variable renown economy) but not quantified, and
   quantifying it is a better use of a round than moving any single number.

---

## 7. Where the docs live

| file | what it is |
|---|---|
| `STANDING-RULINGS.md` | the settled law. §16 (charter), §19/§22/§23a/§29 (cap families), §24/§26, §27, §28, **§30 (reused ids)** |
| `docs/PARITY-LEDGER.md` | **generated** by `tools/parity-ledger.mjs` — edit the verdict map, never the file |
| `docs/BUILD-REPORT-v0.59.md` | this round: what was measured, what failed, what was re-pointed |
| `docs/specs/rr-analyzer-v059-spec.md` | the spec as issued |
| `BUILDER_PROTOCOL.md` | the two-tier verification cadence |
| `OFF-CYCLE-PROTOCOL.md` | how a round with no spec lands without corrupting the cycle |
| `docs/analyzer-status.md` | the cycle table — **updated by the round that ships, never inherited** |
| `snapshots/v59/` | this round's cumulative-prefix isolation slices |

---

## 8. Pushing

The git proxy blocks this repo with a 403. Push with the proxy env unset for that one call, and
**scrub the token out of the remote afterwards**:

```bash
git remote set-url origin "https://x-access-token:<PAT>@github.com/jouyang01/RR.git"
env -u HTTP_PROXY -u HTTPS_PROXY -u http_proxy -u https_proxy -u ALL_PROXY \
  git push origin main --follow-tags
git remote set-url origin https://github.com/jouyang01/RR.git
```
