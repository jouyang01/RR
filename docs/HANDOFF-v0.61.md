# HANDOFF v0.61 — Runeterra Reclaimed

Written for whoever picks this up next, with no memory of this session.

---

## 1. What the project is

A League-of-Legends-flavoured idle game in one HTML file, built with **Kittens Game as its
balance authority**. Not as inspiration — as an authority. STANDING-RULINGS §16 makes source
parity of timing and scale the primary goal, and `docs/PARITY-LEDGER.md` is the instrument that
gives "is this at parity?" an answer that does not have to be re-derived every round.

**RR-original content is legal.** It has to be labelled, and — new this round — **labelling it
UNVERIFIED is no longer allowed.** See §2.

---

## 2. The four things v0.61 should change about how you work

**A GREP ASSERTS THAT SOMEBODY WROTE THE CODE. IT DOES NOT ASSERT THAT THE CODE RUNS.** v0.59
shipped "the Festival shows on the buff banner", and its suite grepped the source for the literal
string it had just written. The string was there. **The feature never fired once** — the line
tested a wall-clock field that v0.58 had already set to zero forever — and the assertion stayed
green for two rounds while Jerry reported the same note twice. **When an assertion can be
satisfied by the presence of text, it is not testing behaviour.** Hold the festival; read the
banner.

**UNVERIFIED MEANS ONLY "RETRIEVABLE AND NOT YET RETRIEVED."** 86 rows — 38% of the ledger — were
classed RR-ORIGINAL and still labelled UNVERIFIED, which is a judgement deferred by mislabelling.
A mechanism with no counterpart **cannot** be looked up; it must be argued EASIER or HARDER
against the nearest source-shaped alternative. All 86 are argued, and
**`tools/parity-ledger.mjs` now ABORTS on RR-ORIGINAL + UNVERIFIED**, so the class cannot return.
Eight of the 86 turned out to have counterparts nobody had looked for — including the five storage
rungs, which are Kittens' own `barnRatio`/`warehouseRatio` line whose sums this project has been
asserting every round for eleven versions.

**THE SOURCE'S SHAPE DOES NOT ALWAYS TRANSPLANT, AND THE REASON IS USUALLY SOMETHING RR HAS THAT
KITTENS DOES NOT.** Kittens' trade yield is additive and genuinely uncapped, so the spec asked for
that. Shipped uncapped, **RR grows an infinite-timber loop at 133 Trade Docks** — because RR has a
trade → transmute cycle the source has no analogue for, and the yield multiplier enters it twice.
**A magnitude fix does not close it** at any positive per-copy rate. Before porting a source shape,
ask what RR has that the source does not.

**AN UNNAMED PRODUCT IS HOW A STACK GOES TWO ROUNDS MIS-DIAGNOSED.** v0.60 reported the converter
stack at ×19.77 and concluded RR runs ×5.3 the source; that figure was **two categories
multiplied together** compared against one Kittens category. Line to line, **RR's conversion
upgrade line is at 45% of the source's.** Both `convMult` and the crystal rate now print term by
term, with kind and cap, at every milestone.

---

## 3. The laws the game is built on

- **Kittens ticks 5/s.** Per-second = per-tick × 5. `TICK_MS = 200` is exact tick parity.
- **Kittens' Law is literally `game.js:3409–3440`** — additive within a named category,
  multiplicative between. **RR's divergence is the CENSUS, not the principle** (§31, new).
- **DR primitives:** `limitedDR(x, L)` is **linear below 0.75·L**; `unlimitedDR` is
  `(√(1+8v/s)−1)/2`; `strictDR(x, L)` bites from the first unit.
  **The 0.75·L knee bit for the first time this round** — see §4.
- **Cap families — TWO.** `CAP_MULT_EXEMPT` or `CAP_SCOPE`, decided by `capFamilyOf()`.
- **Converters: inputs FLAT, outputs `× convMult × (1 + boosts)`.** The asymmetry is the source's
  own. `convMult` and `boosts` are **different categories** and must never be multiplied together
  and compared against one Kittens category.
- **§19:** additive within a category. **The conversion Discovery line was the last place in the
  game still chaining discrete upgrades multiplicatively, and v0.61 Part 1 closed it.**
- **§30:** a deleted id is never reused while its migration exists. Reserved ids: `runestone`,
  `hunterLodge`, `lumberCamp`, `petricite`, `tavern`, `bloomery`, `refinedMetallurgy`, `kindling`,
  **`championsRegimen`, `deepCartography`**.
- **§31, NEW — OPEN QUESTION, ruling requested.** *A category is a kind of effect, not an
  individual effect, and RR targets four.* Nothing collapsed this round. **Until it is ruled, no
  round may add a new multiplicative category.**
- **`CONSUMPTION` is a parity constant** (ratio 1.17647 exactly).

---

## 4. The state of the build

**Shipped v0.61.** 32 suites. Parity ledger: **226 rows — PARITY 81, EASIER 105, HARDER 15,
UNVERIFIED 25 — and all 25 remaining UNVERIFIED rows are RETRIEVABLE.** RR-ORIGINAL + UNVERIFIED
is zero for the first time.

**`BOOST_LIMIT.mana` bit for the first time and nobody knew it was there.** The mana line summed
to **exactly 0.75** with three members — the very top of `limitedDR`'s linear region — so every
member before this round was delivered in full. The fourth member is the first that is not:
**Σ1.00 delivers 0.875**, so Petricite Resonators adds +25 and contributes +12.5. Its button says
so. **Check the other `BOOST_LIMIT` families before adding a member to any of them.**

**Trade yield is one additive category with one ceiling**, replacing four multiplicative categories
with two. That is strictly closer to the source than what RR had — but it is **not** the uncapped
form the source uses, and §5 of the build report says exactly why.

**Era 3 is 1,210.7 (spread ×1.30, from ×1.92) and THE SPREAD COLLAPSED WITHOUT ANYONE TARGETING
IT.** That is the largest single-round narrowing this project has recorded. The likely cause is the
renown re-levelling acting on the champion channel — v0.60 established that channel carries 59.5%
of the excess spread, and removing the Abyss outlier replaced a bursty charge-multiplied source
with one rate against a fixed price. **It is an inference, not a measurement. Decompose it.**

**Crystals at cap 96.2% → 94.7%.** §24's lumpy-sink reading is confirmed in direction and the
magnitude is small: at Icathia the Refineries deliver 33.4/s and a research cost fires ~20 times in
2,500 years. **Right shape, two orders of magnitude short of the right size.** The Manufactory is
now visibly not the problem, with a number: its 15 copies drain 6.9% of gross.

**5,000 provisions on trades NEVER BINDS** — the ceiling allows 15 caravans at Sparks, 31 at
Hexcore, 180 at Icathia. **A flat figure cannot bind across a ceiling that grows ×11 over a run.**

**The tech ladder is 35 techs.** Two `callToArms` children each opening one Discovery became The
Vanguard Doctrine at 45,000, opening both.

---

## 5. Operational rules, each of which has already cost a round

1. **Add a new building to `BUILD_ORDER` in the same commit that adds the building.**
2. **A per-part check must look at more than the part.**
3. **Instrument BEFORE you change the thing.**
4. **Two-tier verification:** cheap single-seed checks per part; the full ensemble once, at the end.
5. **Check `nproc` first.** Two cores. A 3-seed 2,500-year ensemble is ~45–70 minutes.
6. **Launch long runs with `setsid nohup … & disown`.** `nohup &` alone dies with a turn interrupt.
7. **Run suites with `node tools/run-suites.mjs --selftest`, never a scraping shell loop.**
8. **A fixture that baselines from live state must reset it** (§21); **a suite that can die must be
   able to fail**; **and an assertion that can be satisfied by text is not testing behaviour**
   (v0.61 — the newest member of this family and the most expensive so far).
9. **Never pin a literal version string in a suite.** **NINE of these have now been unpicked**, and
   I wrote the ninth myself at v0.60 while unpicking the eighth. Pin the SCHEME.
10. **Re-point superseded assertions, never delete them**, naming the superseding item at the site.
11. **Run a syntax check before a sim run**, and remember that a `var` declared *after* the
    `UPGRADES` array but read *inside* it is `undefined`, not an error. **This cost two page-downs
    this round alone** (`CONV_DISCOVERY_LINE`, then `BOOST_LIMIT`).
12. **`computeRates()` with no argument must return NUMBERS only.** Anything else goes behind the
    `bdRes` flag, as `_bd` already does — `test-v44`'s `noNaNRates` walks `Object.values()`.
13. **Push with the proxy unset, and scrub the token afterwards** — see §8.

---

## 6. What is open, and for whom

**For Jerry:**

- **§31 — the multiplicative category count.** The measurement is written down and nothing shipped.
  Grouping RR's eleven factors into four source-shaped categories cuts late production ~41% and
  **plausibly puts Era 3 back inside the 1,400–2,300 band you retired at v0.59.** It is the single
  largest pacing lever anyone has proposed. **It wants its own round with the ensemble to itself.**
- **The early rank ladder is HELD on your note 2 and the measurement stays on the record.** RR asks
  350 XP for the +1.25% Kittens grants at 100, so a player's first skill bonus arrives at
  **1 h 57 against the source's 36 minutes**. If that ever feels wrong, the lever is the low rungs.
- **The Void Expedition fell 25 → 8 renown** under the single hunt rate, a 68% cut. The spec's
  table did not list it and nobody sized it. Blue Sentinel and Red Brambleback fell 5 → 3.
- **Trade yield is capped where the source is not**, and the reason is the transmute leg. **If you
  want the source's uncapped form, the thing to change is the transmute**, not trade.
- **`harvestRites` opens festivals at 1,500 knowledge where Kittens opens them at 90,000** — 1.7%
  of the source's rung. Retrieved this round, not acted on.
- **Bulk trades under Caitlyn still pay 60 renown** (v0.59). Still open.
- **§27, the population band** (150–220). Still yours to overturn with a word.

**For the analyzer:**

1. **The trade → transmute cycle is the real finding of Part 6 and it is unaddressed.** RR cannot
   adopt the source's uncapped trade yield while a closed cycle exists. Decompose the circuit's
   three legs and propose which one should not close.
2. **Check every `BOOST_LIMIT` family for the 0.75·L knee.** Mana was at exactly 0.75 and nobody
   knew. `devotion` and `culture` are at 2.0, `gold` and `provisions` at 1.5, `crystals` at 2.0,
   `vigor` at 1.0 — **how close is each to its own knee, and which will bite next?**
3. **25 RETRIEVABLE rows remain**, each naming a Kittens identifier nobody has looked up. The
   crafts and champions blocks are the same shape of work the buildings block took.
4. **The Academy `skillXP` line is specified and not shipped**, with the Jarvan interaction named
   (they would stack to ×4). It needs a ruling, not a build.
5. **RR's tech ladder is 3.4% of the source's total science** (1,442,630 against 42,226,630) and
   tops out at 0.54% of its top rung. Every branch tech is argued EASIER from that one
   measurement. **Whether RR's ladder should be longer is a design question nobody has asked.**
6. **Part 10's crystal sink is the first credible one** — three rounds of per-tick burn failed. The
   before/after time-at-cap is in BUILD REPORT §9; if it moved, the lumpy-sink reading of §24 is
   confirmed and the same shape should be tried on the other stocks.

---

## 7. Where the docs live

| file | what it is |
|---|---|
| `STANDING-RULINGS.md` | the settled law, §§1–31 — **§31 is an OPEN QUESTION, not a ruling** |
| `docs/PARITY-LEDGER.md` | **generated** by `tools/parity-ledger.mjs` — edit the verdict map, never the file |
| `docs/BUILD-REPORT-v0.61.md` | this round: what was measured, what deviated, what was re-pointed |
| `docs/specs/rr-analyzer-v061-spec.md` | the spec as issued |
| `tools/run-suites.mjs` | **the suite runner.** Use it. `--selftest` demonstrates the guard |
| `BUILDER_PROTOCOL.md` / `OFF-CYCLE-PROTOCOL.md` | the verification cadence; how a spec-less round lands |
| `docs/analyzer-status.md` | the cycle table — **updated by the round that ships, never inherited** |

---

## 8. Pushing

```bash
git remote set-url origin "https://x-access-token:<PAT>@github.com/jouyang01/RR.git"
env -u HTTP_PROXY -u HTTPS_PROXY -u http_proxy -u https_proxy -u ALL_PROXY \
  git push origin main --follow-tags
git remote set-url origin https://github.com/jouyang01/RR.git
```
