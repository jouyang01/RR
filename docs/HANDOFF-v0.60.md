# HANDOFF v0.60 — Runeterra Reclaimed

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

## 2. The three things v0.60 should change about how you work

**CLONE THE SOURCE. Do not grep the web.** `XP_PER_SECOND` was UNVERIFIED for five rounds behind a
documented list of dead retrieval routes — raw.githubusercontent 404s, the blob view, jsdelivr,
grep.app's robots-disallowed HTML search, its repo-filter-ignoring JSON endpoint. **It is
`js/village.js:3228`, and it took one grep against a local clone.** So did `factoryAutomation` and
the five-category production census. **Three lookups this project had written off fell in minutes
once the source was on disk.** Clone `nuclear-unicorn/kittensgame`, pin the revision in every
citation (line numbers drift — the Golden Spire block earlier rounds cited as
`js/buildings.js:1929–1931` is `:1964–1966` at `c52985b`), and stop treating "not retrievable" as
a property of the fact rather than of the method.

**A SUITE THAT DIES IS NOT A SUITE THAT FAILS**, and until this round nothing in the project could
tell the difference. Two suites had been dying for a full round, losing 22 authored assertions,
**four of which were failing when they finally ran**. Every suite now prints a `SUITE-END` trailer
and `tools/run-suites.mjs` fails the round when one is missing. **Run suites with that runner, not
with a shell loop that scrapes "N passed" — a dead suite prints no failure, and a missing number
scrapes as zero.** The guard caught a real regression in the same round it shipped: Part 5 deleted
a constant `test-v591` referenced, and the trailer's absence is what surfaced it.

**A BOT BEHAVIOUR IS NOT A FACT ABOUT THE ECONOMY UNTIL YOU HAVE READ THE LOOP.** Two rounds have
now drawn a balance conclusion from an artefact of list order — v0.57 Part 4 for farmers, v0.59.1
note 7 for tinkerers. Both times the measurement was right and the diagnosis was wrong, and both
times the fix shipped a number instead of the mechanism. **When the bot never does something, read
the loop before concluding the economy discourages it.**

---

## 3. The laws the game is built on

- **Kittens ticks 5/s.** Per-second = per-tick × 5. RR's `TICK_MS = 200` is exact tick parity —
  and that is why `js/village.js:3228`'s `0.01/tick` ports to **0.05 XP/s** with no conversion.
- **Kittens' Law is literally `game.js:3409–3440`:** `getEffect` sums within a named category, and
  the categories multiply against each other. **There are FIVE** — `JobRatio` (additive onto
  village production), `GlobalRatio`, `Ratio` (keyed by BUILDING, not resource), `RatioReligion`,
  `SuperRatio`. **RR has ONE `boosts` accumulator, so RR cannot express "job-scoped" and "global"
  as different things at all.** Named as a standing divergence this round; not fixed.
- **DR primitives:** `limitedDR(x, L)` is **linear below 0.75·L**; `unlimitedDR` is
  `(√(1+8v/s)−1)/2`; **`strictDR(x, L)` bites from the first unit and has a true asymptote.**
- **Cap families — TWO, not three.** Every capped resource is in exactly one of
  `CAP_MULT_EXEMPT` or `CAP_SCOPE`, decided by `capFamilyOf()`.
- **Converters: inputs are FLAT, outputs take `convMult × (1 + boosts)`.** This asymmetry is the
  **source's own** — confirmed independently at the Calciner and the Smelter this round — so it is
  parity in shape. **Its magnitude is not: RR's converter-side stack measures ×19.77 against
  Kittens' `calcinerRatio` ×3.70.** That is the largest un-actioned parity item in the game.
- **§24 / §26:** classify with `resourceBalance` before sizing any ceiling.
- **§28:** express bot policies in the units of the thing being bought.
- **§30:** a deleted id is never reused while its migration exists, and a migration must name the
  version that retires it. Reserved ids: `runestone`, `hunterLodge`, `lumberCamp`, `petricite`,
  `tavern`, `bloomery`, `refinedMetallurgy`, `kindling`.
- **`CONSUMPTION` is a parity constant** (ratio 1.17647 exactly) and nothing may quietly rescale it.

---

## 4. The state of the build

**Shipped v0.60.** **31 suites, 1,566 `check()` call sites, 1,615 assertions executed, all passing**, under `node tools/run-suites.mjs --selftest` (self-test verdict CAUGHT). Parity ledger: **226 rows — PARITY 72, EASIER 41, HARDER 2,
UNVERIFIED 111.**

**Two constants moved and both were rulings, not tuning.** `XP_PER_SECOND` 0.50 → **0.05** (the
source's figure, `js/village.js:3228`), and the top two rungs of the rank ladder 10,200 / 18,200 →
**7,500 / 11,500** (Jerry's note 4: top rank in 50–75 hours; 11,500 gives **63.9**). **Jerry's note
4 supersedes his own note 11, and there is no figure that satisfies both** — holding 18,200 inside
the band needs ~0.084 XP/s, which is not Kittens' rate.

**`XP_CAP`'s staleness closed itself.** The spec proposed re-deriving it to 40,446; with the top
rank back at 11,500 the shipped constant is literally `Math.floor(11500 * 20001 / 9000)` and the
ratio is Kittens' 2.222× again. **Nothing needed changing.**

**`MANUFACTORY_FUEL` is UNCHANGED at 0.12**, and that was the right call — see §6.

**The tinkerer exists for the first time in this project's history**: 1 at Sparks, 3 at Hexcore,
5 at Icathia, 6 at the end.

---

## 5. Operational rules, each of which has already cost a round

1. **Add a new building to `BUILD_ORDER` in the same commit that adds the building.**
2. **A per-part check must look at more than the part.**
3. **Instrument BEFORE you change the thing.** Part 3.1 is this round's example and it settled a
   question two rounds had guessed at.
4. **Two-tier verification (`BUILDER_PROTOCOL.md`):** cheap single-seed checks per part; the full
   multi-seed ensemble exactly once, at the end.
5. **Check `nproc` first.** Two cores. A 3-seed 2,500-year ensemble is ~45–68 minutes and wants
   the box; twelve concurrent runs saturate it and each takes ~4× as long.
6. **Launch long runs with `setsid`.** `nohup … &` alone does not survive a turn being
   interrupted — the whole process group goes.
7. **Run suites with `node tools/run-suites.mjs --selftest`, never a scraping shell loop.**
8. **A fixture that takes a baseline from live state must reset it** (§21), and
   **a suite that can die must be able to fail** (this round). `tools/fixture-sweep.mjs` finds
   the first class; the trailer finds the second.
9. **Never pin a literal version string in a suite** — nor "file X is absent", which is the same
   thing in disguise. **Eight of these have now been unpicked.** Pin the SCHEME and facts about
   the suite's own round, which do not change.
10. **Re-point superseded assertions, never delete them**, naming the superseding item at the site.
11. **Run a syntax check before a sim run**, and remember that a constant declared *after* the
    `UPGRADES` array but read *inside* it is `undefined`, not an error.
12. **Push with the proxy unset, and scrub the token afterwards** — see §8.

---

## 6. What is open, and for whom

**For Jerry:**

- **The XP change is a large pacing move and it landed as one.** The spec warned it would be; v0.55
  moved this constant twice and one move cost −193.6 game-years of Era 3. **Era 3's median went
  785.9 → 1,172.5.** Wanderer skill bonuses now accrue ten times slower, so every job's output
  ramps far more slowly for the whole run. **If that is too slow, the lever is the ladder's
  thresholds rather than the rate** — the rate is now the source's and has a line number; the
  thresholds are RR's and do not.
- **RR's converter multiplier stack is ×19.77 where Kittens' is ×3.70.** That is now measured
  rather than inferred, and it is the reason the Manufactory's burn has never mattered. **This is
  a real balance decision and it is yours** — see §6's analyzer notes for what it would take.
- **`AUTOMATION_BASE` is 0.02 and the automation is now sub-linear and capped at 90%**, where RR's
  was linear and unbounded (100% at twenty copies). If automation now feels too weak, that is the
  source's figure and changing it is a deliberate divergence rather than a fix.
- **Bulk trades under Caitlyn still pay 60 renown** (v0.59, BUILD REPORT §2.2). Still open.
- **§27, the population band** (150–220). Still yours to overturn with a word.

**For the analyzer:**

1. **The converter multiplier stack is the largest un-actioned parity item in the game, and it is
   now quantified.** 42 Refineries × `crystals: 0.02` = 0.84/s base delivers **77.33/s** — a
   **×92.1** total stack, of which the global bonuses are ×4.66 and **the converter-side stack is
   ×19.77.** Kittens' `calcinerRatio` sums 2.70 → ×3.70. **RR is ×5.3 the source on the same
   footing.** Decompose `convMult` term by term against the source's three-upgrade line before
   proposing a number.
2. **The 559/s that two rounds argued about was never a Refinery figure.** v0.59.1's run had built
   8–10 Augment Chambers; this round's builds zero, because Part 2 changed what the bot staffs.
   Crystal income is 74/s. **Any future sizing must name which faucet it is sizing against.**
3. **The rank ladder is NOT uniformly 28% harder, and the ledger's first draft of that row was
   wrong in a way an old suite caught.** RR has nine rungs, Kittens seven, so no rung-for-rung
   threshold map exists. Matched by BONUS, RR is harsher at every Kittens rung — **×3.50 at
   +1.25%, narrowing to ×1.16 at +7.5% — then EASIER at ×0.96 at +12.5%, then ×1.28 at the top.**
   **The early ladder is the harsh part and no round has looked at it.** BUILD REPORT §10.1.
4. **`hextechFoundry`'s ledger mapping is wrong** — it points at Kittens' Factory, a craft-ratio
   building, while RR's Foundry is a converter. Flagged, not silently repaired.
5. **26 RETRIEVABLE rows remain**, and they are retrievable in the literal sense: each names a
   Kittens identifier and nobody has looked. The buildings block took one session; the crafts and
   upgrades blocks are the same shape of work.
6. **85 rows are classed RR-ORIGINAL and are still labelled UNVERIFIED.** That label means "not yet
   looked up"; a mechanism with no counterpart **cannot** be looked up and must be argued EASIER or
   HARDER. **This is 38% of the ledger deferring a judgement by mislabelling it.**
7. **Kittens' Academy grants `skillXP: 0.0005` per copy** (`js/buildings.js:628`) — a building that
   accelerates learning, the only additive contributor to that effect in the game. **RR has no
   analogue.** Ledgered as missing content; deliberately not shipped this round.

---

## 7. Where the docs live

| file | what it is |
|---|---|
| `STANDING-RULINGS.md` | the settled law, §§1–30 |
| `docs/PARITY-LEDGER.md` | **generated** by `tools/parity-ledger.mjs` — edit the verdict map, never the file |
| `docs/BUILD-REPORT-v0.60.md` | this round: what was measured, what failed, what was re-pointed |
| `docs/specs/rr-analyzer-v060-spec.md` | the spec as issued |
| `tools/run-suites.mjs` | **the suite runner.** Use it. `--selftest` demonstrates the guard |
| `BUILDER_PROTOCOL.md` / `OFF-CYCLE-PROTOCOL.md` | the verification cadence; how a spec-less round lands |
| `docs/analyzer-status.md` | the cycle table — **updated by the round that ships, never inherited** |
| `snapshots/v60/A,B,C,D` | Part 4's seed-matched variance slices |

---

## 8. Pushing

```bash
git remote set-url origin "https://x-access-token:<PAT>@github.com/jouyang01/RR.git"
env -u HTTP_PROXY -u HTTPS_PROXY -u http_proxy -u https_proxy -u ALL_PROXY \
  git push origin main --follow-tags
git remote set-url origin https://github.com/jouyang01/RR.git
```
