# HANDOFF v0.59.1 — Runeterra Reclaimed

Written for whoever picks this up next, with no memory of this session. **This was an OFF-CYCLE
round** — built from Jerry's eight gameplay notes with no analyzer spec, per
`OFF-CYCLE-PROTOCOL.md` — so read that file alongside this one.

---

## 1. What the project is

A League-of-Legends-flavoured idle game in one HTML file, built with **Kittens Game as its
balance authority**. Not as inspiration — as an authority. STANDING-RULINGS §16 makes source
parity of timing and scale the primary goal, and `docs/PARITY-LEDGER.md` is the instrument that
gives "is this at parity?" an answer that does not have to be re-derived every round.

**RR-original content is legal.** It has to be labelled, and the null hypothesis (§16) is that an
unlabelled RR-original is a suspected speed-up rather than a neutral one.

---

## 2. The three things v0.59.1 should change about how you work

**A visibility gate and a yield filter can silently eat a reward, and nothing anywhere will tell
you.** Note 4.1: the Sump Crawl paid coalgas and shimmer; both were revealed by `chemtech` alone;
`withYieldFilter()` drops a `gain()` whose resource is hidden. A player who researched Sump
Ecology first ran the hunt and **received nothing for two of its three rewards** — no error, no
log line, no zero in a tooltip. **When you add a faucet, check that the tech which unlocks it also
reveals everything it pays**, because the filter that protects early-game clarity will otherwise
protect the player right out of their loot.

**When a directive changes a mechanism's SCOPE, its parity citation usually dies with it.** Note 1
took `leylineCalibration` from a job-scoped rung to a global boost. The Kittens `catnipJobRatio`
citation it had shipped with **six hours earlier** was sound for a job line and says nothing about
a global one. **Re-rate the row in the same round.** A citation left attached to a mechanism it no
longer describes is worse than no citation, because the next reader trusts it.

**Fixing a symptom can make the disease worse, and the round after will say so.** v0.59 Part 8
note 1 fixed clipped job chips by letting the row **wrap** — which turned eight rows into sixteen
and made the vertical-space problem it existed to solve strictly worse. Note 2 reverses it with
the source's structural answer. **When a UI note is about space, check what your fix does to the
total, not just to the symptom you were pointed at.**

---

## 3. The laws the game is built on

- **Kittens ticks 5/s.** Per-second = per-tick × 5. RR's `TICK_MS = 200` is exact tick parity.
- **Kittens' Law, CATEGORY-GENERAL:** additive within a category, multiplicative only between.
  The three mana boosts (`leylineCalibration` 0.30, `trueIceCellars` 0.20, `hexresonance` 0.25)
  are one accumulator: **+80% together, never ×1.95.**
- **DR primitives:** `limitedDR(x, L)` is **linear below 0.75·L**; `unlimitedDR` is
  `(√(1+8v/s)−1)/2`; **`strictDR(x, L)` bites from the first unit and has a true asymptote.**
- **Cap families — TWO, not three (§22, §29, v0.59 Part 5.3).** Every capped resource is in
  EXACTLY ONE of `CAP_MULT_EXEMPT` or `CAP_SCOPE`, decided by `capFamilyOf()`, which returns
  `exempt`, `masonry` or null. `SCHOLAR_CAPS`, `SCHOLAR_LINE`, `scholarMult` and
  `scholarCapNames()` are all deleted.
- **A whole-cap KNOWLEDGE multiplier belongs on a POLICY, never on a Discovery chain.** Kittens
  has exactly one in the entire game — `technocracy`, ×1.20 for 150,000 culture and the permanent
  loss of two policy branches. **None ships.**
- **§24 / §26:** run `resourceBalance` and read `kind` before sizing any ceiling. `lumpy-only`
  means a percentage target is the wrong SHAPE of target.
- **§28:** express bot policies in the units of the thing being bought, never as a fraction of a
  ceiling.
- **§30:** a deleted id is never reused while its migration exists, and a migration must name the
  version that retires it. **Written at v0.59, first applied at v0.59.1** (`kindling`). Reserved
  ids: `runestone`, `hunterLodge`, `lumberCamp`, `petricite`, `tavern`, `bloomery`,
  `refinedMetallurgy`, **`kindling`**.
- **`CONSUMPTION` is a parity constant** (`catnipPerKitten −0.85 × 5` against `catnip 1 × 5`,
  ratio 1.17647 exactly) and **nothing may quietly rescale it.** True Ice Cellars did, for
  several versions, at −20%; note 6 removed it.

---

## 4. The state of the build

**Shipped v0.59.1.** 30 suites. Parity ledger: **226 rows — PARITY 63, EASIER 41, HARDER 2,
UNVERIFIED 120.**

**The eight notes, in one line each:** the mana Discovery goes global (1); the job row becomes two
controls plus a hover flyout (2); Kindling Theory is deleted (3); the Sump Crawl's rewards become
receivable, its two techs swap rungs, and it moves to the end of the Wilds list (4.1–4.3); a bulk
hunt writes one chronicle line (5); True Ice Cellars leaves provisions for mana (6); the
Manufactory becomes a real crystal sink and its automation becomes Kittens' spill-guard (7,
7.2); Harvest Rites moves to Masquerade (8).

**The largest behavioural change is note 7 and it is measured, not felt.** The v0.59 ensemble had
crystals at their ceiling **95.5% of all elapsed ticks**, finishing **90,279 / 90,279**, with the
bot assigning **zero tinkerers across 2,500 game-years**. Cost 60 → 400 and fuel 0.02 → 0.12/s per
copy. **Expect this round's ensemble to move Era 3 and the Icathia milestone** — the Manufactory
is now a real drag on the crystal economy and the whole Era-3 industry chain runs through it.

**Era 3 has no target.** The 1,400–2,300 band was retired at v0.59 on Jerry's ruling, recorded in
`pacing.mjs` with its reasoning. **Do not re-base it to whatever this round measures.**

**MEASURED: 10 of 10 pass conditions, 4,038.5 s wall.** Era 3 785.9 (582.8–920.5). v0.59's one
failure — `First champion before year 120` at its `[max]` shape — is **closed**, 104.6 / 105.6 /
88.6 against a worst case of 142 last round. **Nothing in this round was aimed at it**; that is
the run-to-run variance resolving in the lucky direction, not a repair, and it does not retire the
question.

**NOTE 7 DID NOT ACHIEVE ITS STATED GOAL AND THE REPORT SAYS SO.** Crystals are still at their
ceiling **95.9%** of ticks, still finish full (94,360/94,360), and the bot still assigns **zero
tinkerers**. The arithmetic: twenty Manufactories burn 2.4 crystals/s against a late-game income
of **559/s — 0.4%.** A ×6 on a number that small is a rounding error at the scale the note is
aimed at. Two separate causes, needing separate fixes: **the burn is short by roughly two orders
of magnitude, not by a factor of six**, and **the bot has no tinkerer policy at all** — the same
shape of gap v0.57 Part 4 found and fixed for farmers. See BUILD REPORT §8.

**Era 3's spread has now widened three rounds running — ×1.02 → ×1.32 → ×1.58 — with no round
touching Era-3 content.** Two candidate causes are stacked (champion passives on a variable renown
economy; the Manufactory's new drag on the crystal chain) and neither is quantified. **This is the
project's largest open measurement question and it deserves a round of its own.**

---

## 5. Operational rules, each of which has already cost a round

1. **Add a new building to `BUILD_ORDER` in the same commit that adds the building.**
2. **A per-part check must look at more than the part.**
3. **Instrument BEFORE you change the thing.**
4. **Two-tier verification (`BUILDER_PROTOCOL.md`):** cheap single-seed checks per item; the full
   multi-seed ensemble EXACTLY ONCE, at the end. **It is not optional.**
5. **Check `nproc` before planning concurrency.** This container has **two cores**; a three-seed
   2,500-year ensemble takes ~68 minutes and needs the box to itself.
6. **Launch long background runs with `setsid`.** v0.59 lost a 35-minute ensemble because
   `nohup … &` alone does not survive a turn being interrupted — the whole process group goes.
7. **A fixture that takes a baseline from live state must reset the state it is baselining**
   (§21). `tools/fixture-sweep.mjs` finds these; it found one in v0.59 (`test-v58`'s note-14
   block never reset `S.policies`, and Open Range costs Wilds expeditions +10% vigor).
8. **A migration fixture must contain the thing being migrated** (§30, BUILD REPORT v0.59 §1).
9. **Never pin a literal version string in a suite** — and `v0.58(.M)` is a literal with a
   wildcard, which failed exactly like a literal. **Pin the SCHEME:** `v0.NN` for a spec round,
   `v0.NN.M` for an off-cycle point release.
10. **Re-point superseded assertions, never delete them**, and name the superseding note at the
    site. Twenty-six were re-pointed this round; the table is BUILD REPORT §7.
11. **Run a syntax check before a sim run.** A constant declared *after* the `UPGRADES` array but
    read *inside* it takes the page down at load — hoisting gives you `undefined`, not an error.
12. **Push with the proxy unset, and scrub the token afterwards** — see §8.

---

## 6. What is open, and for whom

**For Jerry:**

- **Note 7's magnitudes are the round's biggest lever and they are a first estimate.** Cost ×6.7
  and fuel ×6 were sized to make crystals matter, not calibrated against a target. If the
  Manufactory now feels unaffordable rather than expensive, the fuel is the number to move — a
  build cost is paid once, a burn rate is felt forever.
- **`AUTOMATION_SHARE` is 5% of the ceiling per Manufactory per year**, and that figure is mine,
  not the source's. If automation feels too weak to bother with, this is the dial.
- **Bulk trades under Caitlyn still pay 60 renown** (v0.59, BUILD REPORT §2.2). Still open.
- **§27, the population band** (150–220). Still yours to overturn with a word.

**For the analyzer — and `OFF-CYCLE-PROTOCOL.md` §5 asks for this explicitly:**

> Off-cycle rounds are the ones most likely to drift from source, because they are justified by
> how the game *felt*. **Re-check every number this round moved against its Kittens counterpart
> and record the verdict as parity, EASIER or HARDER.**

The places to start, in order:

1. **Retrieve `factoryAutomation`'s conversion fraction from source.** It is the one number in
   note 7.2 that is RR-original, it is ledgered UNVERIFIED, and it is a cheap win — everything
   else about that mechanism (the shape, the 95% trigger, the at-the-ordinary-price conversion)
   is already the source's.
2. **Note 7's crystal economy, end to end.** Cost ×6.7 and fuel ×6 are the largest numbers this
   round moved and they are sized from one measurement (95.5% at cap, zero tinkerers). Census the
   Refinery, the Tinkerer and the Augment Chamber against Kittens' equivalents before assuming the
   new burn is the right size.
3. **`leylineCalibration` and `trueIceCellars` both now sit in `boosts.mana` at RR-original
   magnitudes.** Kittens has global `<res>Ratio` upgrades; find the ones for its mana-analogue and
   compare Σ, not individual rungs.
4. **`XP_PER_SECOND` is still UNVERIFIED**, and v0.59 Part 6 made it matter more: the rank ladder
   is a **102% threshold debt** at the top rung, and a threshold debt at an unverified accrual rate
   is one unknown times another.
5. **Era 3's spread is ×1.02 → ×1.32 → ×1.58 across three rounds, none of which touched Era-3
   content.** Two candidate causes are stacked and neither is quantified. **Separate them before
   reading either**, and prefer a round spent measuring this over any round spent tuning a number.
6. **Note 7's crystal sink is short by roughly two orders of magnitude, and the bot cannot staff
   a tinkerer.** BUILD REPORT §8 has the arithmetic. The second half is a BOT defect, not a
   balance one: `manageJobs()` has no tinkerer rule at any population, so "allocate tinkerers"
   is unmeasurable by this harness until it does — exactly the gap v0.57 Part 4 closed for
   farmers.
7. **120 UNVERIFIED rows.** v0.59 Part 5.4 is the model: it read `js/workshop.js` and
   `js/buildings.js` and found **six** RR upgrades already at parity that nobody had checked.

---

## 7. Where the docs live

| file | what it is |
|---|---|
| `OFF-CYCLE-PROTOCOL.md` | how a round with no spec lands without corrupting the cycle |
| `STANDING-RULINGS.md` | the settled law. §16 (charter), §19/§22/§23a/§29 (cap families), §24/§26, §27, §28, §30 |
| `docs/PARITY-LEDGER.md` | **generated** by `tools/parity-ledger.mjs` — edit the verdict map, never the file |
| `docs/BUILD-REPORT-v0.59.1.md` | this round: what was measured, what failed, what was re-pointed |
| `docs/specs/rr-devnotes-v0.59.1.md` | the eight notes as issued |
| `BUILDER_PROTOCOL.md` | the two-tier verification cadence |
| `docs/analyzer-status.md` | the cycle table — **updated by the round that ships, never inherited** |
| `snapshots/v59/` | **v0.59's** cumulative-prefix slices — not re-cut for this round |

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
