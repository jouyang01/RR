# HANDOFF v0.58 — Runeterra Reclaimed

Written for whoever picks this up next, with no memory of this session. Read it before
`current-build-spec.md`; it is the shorter of the two and it explains why the spec is shaped the
way it is.

---

## 1. What the project is

A League-of-Legends-flavoured idle game in one HTML file, built with **Kittens Game as its
balance authority**. Not as inspiration — as an authority. STANDING-RULINGS §16 makes source
parity of timing and scale the primary goal, and `docs/PARITY-LEDGER.md` is the instrument that
gives "is this at parity?" an answer that does not have to be re-derived every round.

**RR-original content is legal.** It just has to be labelled, and the null hypothesis (§16) is
that an unlabelled RR-original is a suspected speed-up rather than a neutral one.

---

## 2. The one thing v0.58 should change about how you work

**A bot policy expressed as a fraction of a CEILING will silently invert the moment a storage
round lands.** This round found the trade economy resting entirely on one route's stock idling at
99.9% of its ceiling — because the bot's surplus rule was `stock ≥ 0.6 × ceiling`, and §19 had
multiplied every material ceiling by ~15 two rounds earlier. Timber's rule required 218,626
against a route price of 600, and the bot held 1%.

Nothing failed loudly. Trade just quietly ran on one route, and when v0.58 Part 2's Chapel pulled
enough labour into the acolyte job to stop the scouting party discovering that route, **trade went
to zero and the per-part check passed.**

STANDING-RULINGS §28: **express bot policies in the units of the thing being bought.** And the
apparatus lesson beside it: `TRADE REFUSALS` and the per-route split now print on every run,
because a zero that nobody prints is a zero nobody sees.

---

## 3. The laws the game is built on

- **Kittens ticks 5/s.** Per-second = per-tick × 5. Confirmed from the wiki this round, verbatim,
  and RR's `TICK_MS = 200` is exact tick parity — so a per-tick figure ports 1:1.
- **Kittens' Law, and it is CATEGORY-GENERAL:** additive within a category, multiplicative only
  between categories. §19 removed the violation from the material storage line; **§23a removed
  the last one, from Scholarship, this round.** If you find another chain of same-category
  factors, it is a defect, not a design.
- **DR primitives:** `limitedDR(x, L)` is linear below 0.75·L; `unlimitedDR` is
  `(√(1+8v/s)−1)/2`; `strictDR(x, L) = L·x/(x+L)` bites from the first unit.
- **Cap families (§22):** every capped resource is in EXACTLY ONE of `CAP_MULT_EXEMPT`,
  `SCHOLAR_CAPS`, `CAP_SCOPE`, decided by `capFamilyOf()`. **Isolation is now asserted in both
  directions** — it is the property that actually broke once.
- **§24 — a cap-out fraction only measures a STOCK-limited resource.** Run `resourceBalance`
  and read `kind` before you size any ceiling. `lumpy-only` means a ceiling change cannot move
  the number you are looking at, and v0.58 confirmed that as a testable prediction: a 12.4%
  ceiling cut on culture moved its cap-out by **0.1 points**.
- **§26 — and if a resource is `lumpy-only`, a percentage target is the wrong SHAPE of target.**
  Ask instead whether the ceiling clears the largest single purchase and whether the thing it
  gates completes.
- **§25 — no milestone-year claim from a single seed**, now enforced by the apparatus rather
  than by discipline: `--seeds 1` refuses to evaluate an ensemble condition.

---

## 4. The state of the build

**Shipped v0.58. 27 suites, 1,341 assertions, 0 failures.** Seven cumulative-prefix slices under
`snapshots/v58/`, each snapshotted forward BEFORE the next Part started.

**Era 3 is 1,403.9 game-years, spread ×1.14, inside the 1,400–2,300 band but on its lower edge.
Icathia is reached on 2 of 3 seeds; seed 3 does not reach it in 2,500 years.** The tenth champion
lands on the same two. **Nine of ten pass conditions hold; the morale band fails at 76 / 72 / 98%
against ≥80%, and that failure is attributable to dev note 12's +30% festival — shipped as
specified, and the choice about what to do next is Jerry's (BUILD REPORT §8.4).**

**Riftsteel is forged for the first time in the project's history (23 of them), Rift Anchors are
built (14), and Void Essence is no longer monotone.** Two of v0.53 Part 4's long-failing
conditions now pass.

Closed this round: the Convergence band (five times deferred), the Scholarship chain (§23's dated
slice), Renown's <70% trigger, the population milestone, pass condition 5's unsatisfiable band,
Riftsteel's unreachability, and all fourteen of Jerry's dev notes.

**One item shipped that Jerry should look at first: §27, the population ruling.** The spec said it
needed him. It shipped so the round was not blocked, and it is the one v0.58 item that should be
overturned by a word rather than by a measurement.

---

## 5. Operational rules, each of which has already cost a round

1. **Add a new building to `BUILD_ORDER` in the same commit that adds the building.** The Shimmer
   Refinery measured 0 copies for four rounds and it was read as a pricing defect for four rounds.
   `test-v53` fails if any building is in neither list.
2. **A per-part check must look at more than the part.** See §1.1 of the build report.
3. **Instrument BEFORE you change the thing.** Every metric the spec names goes in first.
4. **Two-tier verification (`BUILDER_PROTOCOL.md`):** one fast single-seed short check per part;
   the full multi-seed ensemble EXACTLY ONCE, at the end.
5. **Run ensemble seeds concurrently, and don't poll them.** Check once or twice.
6. **`resourceBalance` at a MILESTONE is read the instant that tech lands** — so a consumer gated
   on the same tech is measured at zero copies by construction. That cost this round a wrong
   reading; `snaps.final` exists now and the classification prefers it.
7. **Isolation slices must run against EARLIER builds.** Guard every `BUILDINGS.find()` in
   `simcore.mjs` — an unguarded chapel lookup crashed the s2 comparison run outright.
8. **Never pin a literal version string in a historical suite.** Assert the shape.
9. **Re-point superseded assertions, never delete them**, and name the superseding item at the
   site. Fifteen were re-pointed this round; the table is BUILD REPORT §7.
10. **Push with the proxy unset, and scrub the token afterwards** — see §9.

---

## 6. What is open, and for whom

**For Jerry:**

- **§27, the population band.** 150–220 replaces "130 wanderers by y600". One word overturns it.
- **Note 14's balance edge.** Scoping the vigor discounts to Wilds expeditions makes the scouting
  party 30% dearer, and this round proved faction discovery is the most load-bearing thing vigor
  buys. Shipped as specified; flagged as a real change.

**For the analyzer:**

- **The trade volume after §28.** The surplus rule now fires far more often. The `firstTrade`
  spread is the deliverable; the VOLUME is the thing to look at next, and whether a settlement
  running several trades a game-year is the game we want.
- **`XP_PER_SECOND` is still UNVERIFIED**, and three more retrieval routes are now recorded as
  dead ends so nobody repeats them. See BUILD REPORT §9.
- **127 UNVERIFIED ledger rows.** The Targon/worship block was taken this round. Ten to fifteen a
  round by subsystem.
- **`catMonument` is still ×1.00.** Carried, unchanged, five rounds running.
- **Pass condition 5 now applies to something, and reports FAIL.** shimmer is `stock-limited`
  (P/C 13.44) for the first time, at **87.4%** cap-out against a 30–60% band. **That FAIL is worth
  more than the old PASS-by-vacuity** — it is a sizing question now rather than a classification
  one, which is the first time it has ever been one.
- **`firstTrade`'s spread is ×1.94, not the under-×1.5 the spec asked for.** Improved ×2.3 from
  ×4.46, but Part 5 is not closed.
- **Trade VOLUME.** The yield-wanted rule (§28's second half) brought it back from ~50 trades a
  game-year to something the economy survives, and three routes are live where only one ever was.
  Whether 3 trades/game-year across Era 3 is the game we want is a design question, not a bug.

---

## 7. Where the docs live

| file | what it is |
|---|---|
| `STANDING-RULINGS.md` | the settled law. Read §16 (parity charter), §19/§22/§23a (cap families), §24/§26 (classification before sizing), §27, §28 |
| `docs/PARITY-LEDGER.md` | **generated** by `tools/parity-ledger.mjs` — edit the verdict map, never the file |
| `docs/BUILD-REPORT-v0.58.md` | this round: what was measured, what failed, what was re-pointed |
| `BUILDER_PROTOCOL.md` | the two-tier verification rule |
| `current-build-spec.md` | the round in flight |
| `snapshots/v58/s1…s6` | cumulative prefixes, for attribution |

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
