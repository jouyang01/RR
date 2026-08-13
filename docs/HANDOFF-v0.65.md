# HANDOFF v0.65 — Runeterra Reclaimed

Written for whoever picks this up next, with no memory of this session.

---

## 1. READ THIS FIRST — VIGOR IS LOAD-BEARING FOR THE WHOLE ERA-3 ECONOMY, AND NOBODY KNEW

v0.65 deleted the Training Ground's vigor boost on Jerry's dev note and replaced it with a
source-parity weapon line. The spec expected that to be *"small on population and large on
Sparks"*. **What it actually did:**

| at end of run | v0.64 | **v0.65 shipped** | |
|---|---|---|---|
| `vigorPerSec` | **82.16** | **31.4** | ×0.38 |
| **zaunore gross** | **587.79/s** | **126.09/s** | **×0.21** |
| **coalgas gross** | **403.38/s** | **78.81/s** | **×0.20** |
| **hexore gross** | **646.57/s** | **110.33/s** | **×0.17** |
| **shimmer gross** | 193.49/s | 43.22/s | ×0.22 |
| **mana gross** | 1,351.27/s | 383.81/s | ×0.28 |
| trades over the run | 165,063 | 44,442 | |
| peak population [median] | 180 | **155** | |

**Nothing in the round touched an Era-3 price.** The chain is:

> **vigor → expeditions → the Wilds camps pay TIMBER, ORE and FURS → the Era-3 apparatus, and
> housing.**

Every housing tier at every milestone reads **stock-bound — timber** or **stock-bound — alloy**.
A caravan costs 135 vigor. **Vigor is not a champion-ladder resource; it is the settlement's raw
material income, laundered through the Wilds.** No document in this project said so before now.

### The rule this earns

> **Before cutting a resource, run the balance instrument on everything that resource can reach —
> not on the thing the change is named after.** The spec modelled vigor's only path to population
> as "the long one through champions" and was wrong by a factor of five on four other resources.
> The readouts that prove it (`maxPop DECOMPOSITION`, `resourceBalance`, `MANA BALANCE`) all
> existed at v0.64. **Nobody joined them.**

---

## 2. What the project is

A League-of-Legends-flavoured idle game in one HTML file, built with **Kittens Game as its balance
authority** — not as inspiration, as an authority. STANDING-RULINGS §16 makes source parity of
timing and scale the primary goal, and `docs/PARITY-LEDGER.md` is the instrument. **229 rows,
UNVERIFIED 0** (PARITY 88, EASIER 118, HARDER 23).

---

## 3. The four things v0.65 should change about how you work

**1. SUBTRACT SEED-FOR-SEED OR DO NOT SUBTRACT.** This round's headline was written as "−35
population" from two ensemble medians and the real figure is **−20 on the median seed, spread −8
to −86**. §25 already forbade the first form. **Every slice this round was PRNG-neutral, which is
what made the honest subtraction available at all** — build the chain that way and then use it.

**2. THE STATIC PROBE IS NOT THE INSTRUMENT. THE END-OF-RUN AUDIT IS.** v0.64's build report §13
recorded this lesson after a maxed static probe produced a wrong objection to the devotion rail.
**v0.65 then built its entire Part-2 arithmetic on a maxed static probe anyway** — quoting vigor
Σ 3.4432 (+72% over source) where the real run reads **2.3363** (+67%… of a different baseline;
the honest statement is a **48%** cut to vigor income, not the spec's 63%). Static probes belong
in suite assertions. They do not belong in a balance claim.

**3. A DECOMPOSITION INFERRED FROM A TOTAL IS NOT A DECOMPOSITION.** The v0.65 spec's §2.3 gave
four contributors to vigor's Σ. The **sum was exactly right at 5.4432 and every single component
was wrong** — Training Ground 73.5% not 93.0%, cloud drake 0.948 not 0.231, champion passives
0.375 not 0.150, and `policyBoost("vigor")` **0.12, where the spec asserted the branch does not
exist**. `knee._sources` caught all four **on its first run, before any constant moved**. Build the
instrument first; it is cheap and it corrects the spec.

**4. A GUARD THAT CRIES WOLF IS A GUARD THE NEXT READER IGNORES.** `knee._sources` shipped with a
reconciliation check that reported "DOES NOT RECONCILE — a contributor is UNNAMED" on perfectly
attributed families, by 1.3e-5. The cause was neither float error nor a missing term:
**`boostKneeFrom()` publishes `raw` already rounded to 4 dp**, so an exact sum can never equal it
(measured: raw 1.9421 against exact 1.9421155588561603). Fixed in `723e7cb` by rounding the sum the
same way. **E1 and E2 were launched before that commit, so their logs still carry the spurious
line** — the attribution underneath it is correct.

---

## 4. The laws the game is built on

- **Kittens ticks 5/s.** `TICK_MS = 200` is exact tick parity.
- **`limitedDR(x, L)` is LINEAR only below 0.75·L.** **Zero families are past their knee for the
  second round running.** Rails unchanged this round — vigor 8.0, devotion 5.0, provisions 3.0,
  mana 2.0. **vigor now has the most headroom of any family in the game: Σ 2.3363 against a knee
  of 6.00.** That is the arithmetic case for the next vigor move being an increase.
- **A CONVERTER IS ANY BUILDING WITH A `convert` BLOCK** (v0.64, dev note 2). `autoprod` says how
  a converter is DRIVEN, not whether it converts.
- **Converters: inputs FLAT, outputs multiplied.** Two scoped exceptions only; do not generalise.
- **Cap families — TWO**, decided by `capFamilyOf()`.
- **`DISCOVERY_KNOWLEDGE_SET` NO LONGER EXISTS — v0.65 Part 1 INVERTED IT.** Every Discovery is
  priced at **0.8 × its unlocking tech's knowledge** unless it appears in
  `DISCOVERY_KNOWLEDGE_EXEMPT` (**currently empty**) or its tech carries zero knowledge (which
  populates the generated `DISCOVERY_UNPRICED_ZERO_RUNG`). **Coverage went 39 → 79 of 82.** The
  per-UPGRADE ratio is the source invariant — IQR 0.73–1.00, median 0.87 — and RR sits at **0.80**.
  `applyDiscoveryKnowledge()` is still the only thing in the file that writes a discovery knowledge
  cost.
- **§30:** reserved ids unchanged.
- **§31 is an OPEN QUESTION with its premise RETRACTED (§31.2a). Until Jerry rules, no round may
  add a new multiplicative category.** v0.65 added none — the weapon line and `leylineLensing` are
  new *members* of existing additive families.
- **§32: ONE global RNG stream, so draw count is part of the seed.** Every v0.65 slice is
  PRNG-neutral and `tools/prove-s4-neutral.sh` proves the one slice most at risk (the
  `firstPZChampion` marker) reproduces its predecessor's seeded figures **to the digit**.
- **§33: a term keyed on a name is dead until the container declares that name** — so assert the
  **DELIVERED** value, never the presence of the key. Both of this round's new boost members are
  asserted at their delivered value on that rule.

---

## 5. Operational rules, each of which has already cost a round

1. **Add a new building to `BUILD_ORDER` in the same commit that adds the building.**
2. **A per-part check must look at more than the part**, and a late-game round's per-part checks
   may look at nothing at all.
3. **Instrument BEFORE you change the thing.** v0.65's two new blocks landed on an **unchanged
   v0.64** — `sim/` only, `index.html` byte-identical — and one of them corrected the spec before a
   constant moved. This is the highest-value rule in the list.
4. **Two-tier verification:** cheap single-seed checks per part; the ensemble at the end.
5. **`nproc` is 2 — give the ensemble the box.** **Five seeds × 2,500 years took 3,745.8s (62
   min) concurrently.** Three seeds took 5,244s at v0.64 while sharing the box with a slice chain.
   Budget 90–120 minutes and run nothing else.
6. **Launch long runs with `setsid nohup … & disown` AND POLL.**
7. **Run suites with `node tools/run-suites.mjs --selftest`.**
8. **An assertion satisfiable by the presence of TEXT is not testing behaviour.**
9. **Never pin a literal version string in a suite.**
10. **Re-point superseded assertions, never delete them**, naming the superseding item. **Six call
    sites this round — build report §7.** Four of them referenced the deleted
    `DISCOVERY_KNOWLEDGE_SET` and now share a shim that derives the set from `UPGRADES`.
11. **A `var` declared after an array literal but read INSIDE it is `undefined`, not an error.**
12. **`computeRates()` with no argument must return numbers only.**
13. **VERIFY BEFORE BUILDING.**
14. **Push with the proxy unset, and scrub the token afterwards.**
15. **Assert a guard by making it FAIL.**
16. **A term keyed on a name is dead until the container declares that name** (§33).
17. **Isolation prefixes are built FORWARD and the chain is PROVED** by hash equality with the
    shipped file. `tools/mk-slices-v65.py` does this for s0 → s6.
18. **NEW — NEVER POINT A LONG RUN AT A FILE YOU STILL INTEND TO EDIT.** E1 was launched against
    the mutable `index.html` and then Part 1 was written into it. The children had loaded the file
    90 seconds earlier so the run was probably sound — **and it was killed and relaunched against
    `snapshots/v65/s5.html` anyway**, because "probably sound" is not a verification protocol.
    Kill by **PID from `ps -eo pid,args`**; §9 forbids `pkill -f`.
19. **NEW — SUBTRACT SEED-FOR-SEED OR DO NOT SUBTRACT** (§3.1 above, and §25).

---

## 6. What is open, and for whom

### FOR JERRY

- **Your dev note shipped exactly as written.** The Training Ground no longer boosts vigor
  generation; it keeps its `caps: { vigor: 150 }`. The three replacement Discoveries carry Kittens'
  own `manpowerJobRatio` shares (0.50 / 0.25 / 0.25) and one of them — Latch and Lever — lands on a
  rung that matches the source **to the digit** (science 15,000), which then makes its generated
  knowledge cost 12,000, the source's exact `crossbow` price.
- **AND IT COST MORE THAN ANYONE PREDICTED — read §1.** Era-3 raw production fell ×4.7 and peak
  population fell from 180 to 155. **The question for you: is vigor supposed to be the settlement's
  material income?** If yes, this round made the game meaningfully slower and a future round should
  restore vigor by another route (there is more headroom under the rail than any other family
  has). If no, the Wilds are doing work the Era-3 buildings were meant to do, and that is the thing
  to fix.
- **THE 2,500-YEAR HORIZON IS AN RR HARNESS CONVENTION, NOT A SOURCE FIGURE, AND IT IS NOW
  DECIDING A GUARD.** Pass condition 1 ("Icathia on all five seeds") **fails at 4 of 5** — and the
  fifth seed is a run that never got its economy started at all (470 trades against a median of
  44,442). **If the horizon moves to 3,000 years, that condition may pass with no constant
  changing.** Worth your word before anyone tunes to satisfy it.
- **THE PROVISIONS SINK HAS A STRUCTURAL CEILING AND IT IS ≈93,500.** The Longhouse's restored
  `provisions: 30` at ratio 1.15 over 44 copies costs about that across a run, the 44th copy alone
  ≈12,200. **A sink larger than that cannot ride on the Longhouse** without becoming a population
  ceiling — it needs a continuous consumer or a low-copy building. Arithmetic, not preference.
- **`shimmer` AND `voidessence` STILL HAVE NO CONSUMER.** shimmer P/C **47.68**, 100% held;
  voidessence sitting at ceiling with `knowledge`, `culture` and `renown`. True since v0.57. It
  needs a sink or it needs deleting, and no cap round can touch it (§24).
- **§31's premise is retracted and the corrected section still awaits your ruling.**
- Still yours from earlier rounds: `gear` costs steel 25 against Kittens' 15; three repeatable
  buildings diverge on `priceRatio`; bulk trades under Caitlyn still pay 60 renown.

### FOR THE ANALYZER — what the next spec should be

1. **DECIDE THE VIGOR → ERA-3 COUPLING BEFORE TUNING ANYTHING ELSE.** §1. Everything downstream of
   this round is contaminated by one unmodelled edge, and no price in Era 3 should move until it is
   settled. **This is the round's finding and it is worth a spec on its own.**
2. **THE ICATHIA GUARD FAILS AT 4 OF 5 AND THE SPEC'S OWN §1.6 NAMES THE ANSWER — TAKE IT.** The
   **`libraryRatio` line has been dated and unactioned since v0.56**, and this round measured its
   justification directly: knowledge sits at its ceiling **84.4%** of the run *after* Part 1
   multiplied discovery spend by twenty. **The ceiling is the lever.** Second legitimate lever:
   `CONV_DISCOVERY_LINE`'s Σ0.65, flagged at v0.64 and still unmeasured in isolation. **Do NOT cut
   a discovery price below the source's band** — RR's per-upgrade median is 0.80 inside a source
   IQR of 0.73–1.00, and that ratio is the one thing Kittens actually holds constant.
3. **PART 1 IS A SUCCESS AND SHOULD NOT BE REOPENED.** Predicted +150 to +500 later, with +900 as
   the falsifier. **Measured seed-for-seed: −328.9 / (never → completes) / +51.7, median +51.7.**
   Two of three seeds got *earlier*; one went from never finishing to finishing. Discovery share of
   knowledge spend **6.7% → 59.7%** and time-at-cap **went up**, 82.8% → 84.4%. **§24's reading of
   knowledge as a lumpy-sink-at-ceiling was describing a surplus, not a queue — confirmed.**
4. **STEER ON `sparksAfterPZ` AND RETIRE `sparks` AS A TARGET.** Part 5 separated the confounder
   for the first time: **firstPZChampion ×3.32 (the draw, unsteerable)**, **sparksAfterPZ ×1.99
   (the design's own)**, sparks ×2.01 (the two together). Continuing to score `sparks` scores a
   coin flip. **The honest caveat: ×1.99 on the steerable half is still wide** — Part 5 says where
   to look, not that the design is tight.
5. **FIVE SEEDS IS THE NEW MINIMUM, AND SEED 5 IS WHY.** Peak population 74, 470 trades, Era 3
   never reached — **and it drew its first Piltover/Zaun champion earliest of the five.** Every
   previous round's failures were attributable to the champion order. **A seed can now fail for a
   reason that is not the draw**, and three seeds would have missed it.
6. **MANA IS NOT SOLVED, IT IS COMPENSATED.** v0.64's deficits (−0.40/s at hexcore, −14.52/s at
   final) are gone on the shipped build (+26.43/s, +24.81/s). **But E1 — which contains the new
   mana Discovery — reads −4.10/s at hexcore, DEEPER than v0.64**, because Part 2 cut the gross
   that Part 4's +25% multiplies. **Any round that restores vigor income must re-measure mana.**
7. **`moraleHigh` IS A NEW FAILURE AND IT IS SECOND-ORDER.** 6 / 4 / 4 / 5 / 0 against ≤5, where
   v0.64 read 0. Fewer wanderers against the same Bard's Hearth count means more relief per head.
   **Do not tune morale; it will follow whatever happens to population.**
8. **THE LEDGER IS MAINTENANCE.** 229 rows, UNVERIFIED 0. The RR-ORIGINAL+UNVERIFIED guard
   **aborted this build** until the four new Discoveries carried argued verdicts — working exactly
   as v0.63 designed it.

---

## 7. Where the docs live

| file | what it is |
|---|---|
| `STANDING-RULINGS.md` | the settled law, §§1–33 — **§31 is an OPEN QUESTION with a RETRACTION at §31.2a** |
| `docs/PARITY-LEDGER.md` | **generated** — edit the verdict map in the tool, never the file |
| `docs/BUILD-REPORT-v0.65.md` | this round |
| `docs/specs/rr-analyzer-v065-spec.md` | the spec this round was built against |
| `sim/simcore.mjs` | **new this round:** the `knowledgeSupply` block and `knee._sources` |
| `tools/mk-slices-v65.py` | builds the §9 cumulative prefixes forward, s0 → s6, and proves the chain |
| `tools/prove-s4-neutral.sh` | **new** — the §32 PRNG-neutrality proof for the `firstPZChampion` marker |
| `snapshots/v65/` | s0–s6 with the hash proof in `README.md`; **s6 == shipped `index.html`** |
| `tools/run-suites.mjs` | the suite runner. `--selftest` demonstrates the guard |
| `docs/analyzer-status.md` | the cycle table — updated by the round that ships |

---

## 8. Pushing

```bash
git remote set-url origin "https://x-access-token:<PAT>@github.com/jouyang01/RR.git"
env -u HTTP_PROXY -u HTTPS_PROXY -u http_proxy -u https_proxy -u ALL_PROXY \
  git push origin main --follow-tags
git remote set-url origin https://github.com/jouyang01/RR.git
```

**Then verify no token is in history — and match the TOKEN, not the word:**

```bash
git log --all -p | grep -cE 'github_pat_[A-Za-z0-9_]{20,}'   # must return 0
```

**The bare-prefix grep the earlier handoffs used is not safe to write down.** Any document that
states the needle literally becomes a permanent match for it, and the check then reports a hit on
its own text forever. The regex above only matches a string with a real token's payload after the
prefix, so it does not match itself — **v0.65 caught this the hard way**, on a line written in
this very section.
