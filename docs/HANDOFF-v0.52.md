# HANDOFF v0.52 — Runeterra Reclaimed

Written for whoever picks this up next, builder or analyzer. The BUILD REPORT is the argument; this is the map.

---

## 1. What the project is

**Runeterra Reclaimed** — a League of Legends–themed incremental/idle game modelled rung-for-rung on **Kittens Game** (`github.com/nuclear-unicorn/kittensgame`), shipped as a **single self-contained HTML file**. No build step. No bundler. `index_52.html` is the game.

**The workflow is two Claude sessions.** An **analyzer** measures the shipped build against Kittens' real source and returns a formal BUILDER SPEC. A **builder** implements every item, runs the suites and the headless simulator, and writes a BUILD REPORT back. Jerry attaches his own numbered directives, **and his directives override the spec where they conflict.**

**Two standing rules, both non-negotiable:**

1. **Every item in the spec gets actioned.** Never silently skip one. If an item cannot be satisfied, say so plainly and say why.
2. **All design claims are grounded in Kittens' actual source**, never in recollection. Cite file and line.

---

## 2. The laws the game is built on

**Kittens' Law.** Effects are **additive within a category** and **multiplicative between categories**. An extra category is a multiplication; an extra member is an addition. Every parity argument in this project reduces to this.

**`<res>Ratio` is unbounded.** Kittens applies `perTick *= 1 + getEffect(res + "Ratio")` — `game.js:3425–3435` — with the *identical statement* for minerals, wood and science, and **no diminishing return anywhere**. v0.52 Part 0 exists because RR had routed knowledge through a bounded mechanism.

**RR's two mechanisms for that one Kittens category:**

- `jobBoost` → `(1 + jobBoosts[job])`, **unbounded** — correct, and the ore/timber/tinkerer lines use it.
- `boost` → `(1 + boosts[res])`, **bounded** by `BOOST_LIMIT` via `limitedDR`.

`limitedDR(x, limit)` is free below `0.75 × limit`, then hyperbolic, asymptote at `limit`.

**`BOOST_LIMIT` as shipped — seven keys, and which seven is load-bearing:**

```js
var BOOST_LIMIT = { devotion: 2.0, culture: 2.0, gold: 1.5, vigor: 1.0, crystals: 2.0,
                    provisions: 1.5, mana: 1.0 };
```

**`knowledge` is deliberately absent and must stay absent.** The comment above it in source says so and `test-v52` asserts its absence with the citation. Do not re-add it thinking it was an oversight — that was the entire v0.52 round.

---

## 3. The state of the build

`index_52.html`, 366,609 bytes. **941 assertions across 20 suites, 0 failures.**

| | |
|---|---|
| tech ladder | **37 techs** (was 38; Refined Metallurgy deleted with the Bloomery) |
| ladder shape | 8 ties · median ×1.1222 · geo mean ×1.2632 · largest step ×3.333 — all five conditions in band |
| `auditCostGraph()` / `auditRawGraph()` | **zero violations each** |
| science parity | Kittens' 30/30/25/13 → **×20.8000** against the source's ×20.80 |
| Sparks / Icathia (2,500y seed 1) | y215.6 / y1042.1 |
| **Era 3 length** | **826.5** against a **1,400–2,300** target — 59% of the minimum |
| peak population | 200 |
| morale band 90–140 after y60 | 100% |

---

## 4. Files, and what each one is for

### The deliverable
- **`index_52.html`** — the game. The only real deliverable. Everything else is apparatus.

### The simulator
- **`simcore.mjs`** — the headless simulator. Virtualises `Date.now`, seeds a deterministic xorshift `Math.random`, stubs the render layer, and drives a greedy bot through the game's own `tick()`. **The bot's build-order list lives here** — see §6, this is where the v0.52 apparatus defect was.
- **`pacing.mjs`** — the milestone/pass-condition report built on `simcore`. Carries the **standing zero-trade calibration note** in its header (v0.52 Part 3.3).
- **`objectives.mjs`** — the pacing targets as data.

### The audits
- **`enhance-audit.mjs`** — enumerates every non-cosmetic effect field on every building and **measures** the delivered multiplier end-to-end at 5 / 50 / 500 copies, reporting a linearity ratio. 1.0 = unbounded, ≪1.0 = a bound is biting. This is the tool that answered Jerry's directive 2 independently rather than trusting the spec's table.
- **`audit.mjs`**, **`effcost.mjs`** — effective-raw cost expansion and cost-graph checks.
- **`rawcost.mjs`** — expands every Zaun/Industry building's cost to raw resources. Written for v0.52 §3.2.
- **`shimmer-audit.mjs`** — the Shimmer Refinery vs Sump Crawl economics that sized the v0.52 recost.
- **`crystal-sinks.mjs`** — enumerates every crystal sink in the game. Produced the number in v0.52 §8: **the entire non-repeatable crystal demand is 580.**
- **`census-table.mjs`**, **`size.mjs`**, **`luxdiag.mjs`** — content census, file-size accounting, luxury-stock diagnostics.

### The isolation-build scripts
- **`apply-bld.mjs`**, **`apply-split.mjs`**, **`split-v48.mjs`** — the patch-application scripts used to construct isolation builds.

**Read §6 before using them.**

### The suites
34 `test-v*.mjs` plus `test-banner-v51.mjs`. **Only 20 are live** — see §5.

---

## 5. The suites: which are live, and the honest count

**The live regression set is 20 suites, 941 assertions, 0 failures:**

```
test-v32  65   test-v40  59   test-v47  52
test-v34  41   test-v41  61   test-v48  54
test-v35  44   test-v42  51   test-v49  37
test-v36  44   test-v43  40   test-v50  34
test-v37  38   test-v44  63   test-banner-v51  16
test-v38  33   test-v45  58   test-v52  31   ← new
test-v39  70   test-v46  50
```

Run them with:

```bash
cd /path/to/work && for f in test-v32 test-v34 test-v35 test-v36 test-v37 test-v38 test-v39 \
  test-v40 test-v41 test-v42 test-v43 test-v44 test-v45 test-v46 test-v47 test-v48 test-v49 \
  test-v50 test-banner-v51 test-v52; do echo -n "$f: "; node $f.mjs 2>&1 | \
  grep -E '^[0-9]+ passed' | tail -1; done
```

**`test-v2` … `test-v31` are historical.** They were written against builds three to eight versions retired and **will fail against v0.52**. They are shipped for archaeology, not for regression. Do not add them to the loop above and do not treat their failures as defects.

**On the count.** v0.51 was 911 across 19 suites — 895 economy plus the banner's 16. The 19 carried suites now total **910**, not 911, because three of them moved this round:

| | Δ | why |
|---|---|---|
| `test-v32` | **+1** | Timberframe Joinery's *absence* is now asserted |
| `test-v38` | **−1** | the effect-to-ratio proportionality assertion, **deleted by ruling** (v0.52 Part 2.6) |
| `test-v41` | **−1** | the Tavern's 400/800/200 price table retired with the building |

910 + `test-v52`'s 31 = **941**.

---

## 6. Operational rules, each of which has already cost a round

**Kill background runs by PID from `ps -eo pid,args`.** `pkill -f "<pattern>"` matches the bash process running it and returns exit 144, silently dropping queued work. **This mistake has now been made twice** — v0.46 and v0.50.

**Size every `sleep` under the tool timeout** while background runs are live. A 10-minute sleep returns exit 143 and takes a 20-minute pacing run with it.

**Instrument before launching.** Every metric the spec names goes into `simcore.mjs`'s snapshot *before* the first 2,500-year run. Not doing this cost v0.50 two re-runs.

**Strip comments before grepping source.** A source-shape assertion that greps for a phrase will match the comment that explains the phrase. This has now happened twice — the v0.51 banner check and the v0.52 `resRatio` check.

**A zero in a measurement is a claim about the apparatus until you have checked the apparatus.** The v0.52 round found that "Shimmer Refineries: 0", reported in three consecutive rounds and acted on in one, meant the bot's build-order list did not contain the building. Before reasoning from a zero, confirm the instrument can produce a non-zero.

**Isolation builds must BE the shipped file up to that point**, snapshotted from it — never reconstructed by re-applying patches. v0.47 shipped a report labelling an isolation build "Part 1 only" when it was not, and retired at y1,005.3 on the strength of it. Since v0.50 the discipline is **cumulative prefixes**: snapshot `index.html` after each slice, run each snapshot, and the differences are attributable by construction.

**Playwright:** always `chromium.launch({ executablePath: "/opt/pw-browsers/chromium" })` with a `.catch(() => chromium.launch())` fallback. **Never run `playwright install`.**

**Every suite and harness hardcodes `file:///home/claude/work/site/index.html`.** If you work anywhere else, recreate that path or sed the constant. This is a workspace quirk, not a design choice, and it will bite on first run somewhere new.

**Syntax-check after every batch of edits:**

```bash
node -e "const fs=require('fs');const m=fs.readFileSync('site/index.html','utf8')\
.match(/<script>([\s\S]*)<\/script>/);new Function(m[1]);console.log('syntax OK')"
```

**Timing:** a 2,500-year seed-1 run is ~22–31 min wall, and three in parallel is roughly the same as one. Plan the round around that, not around the optimistic case.

---

## 7. What is open, and for whom

**For the analyzer to rule on:**

1. **`poroRatio` is unbounded** — four Freljord buildings, ×41 at 500 copies. Structurally consistent with Kittens' law but RR-only content with no source counterpart, so there is nothing to be at parity *with*.
2. **`audience` grows without limit in POPULATION** — the Bard's Hearth multiplies culture by `1 + 0.05 × S.pop`, reaching +2.02 at pop 2000. Kittens' Amphitheatre has no population term at all. This is the only effect in the game that scales with the quantity the whole game is trying to grow.
3. **Crystals have no sink.** Lifetime non-repeatable demand across the entire game is **580**. The shipped build holds **132,771** and sits at cap **96.5%** of all elapsed ticks. The Tinkerer count is **1** at every milestone in every build ever measured, so the ×7.4 `jobBoost.tinkerer` is a multiplier on a single worker. **Rule from the sink side, not the production side** — nerfing the Augment Chamber does not fix a resource with nowhere to go.
4. **Era 3 is 826.5 against 1,400–2,300** — 59% of the minimum, 573.5 short. The largest single thing that lengthened it this round was the Shimmer Refinery **price cut** (+172.6 on its own), via the coalgas and mana its 26 copies draw. Adding consumers looks more promising than raising prices.
5. **Sparks is champion-gated, not knowledge-gated.** Its gate is `["twitch","caitlyn","heimerdinger"].some(recruited)`. Any prediction about Sparks timing that reasons from knowledge is predicting the wrong gate; **Call to Arms is the rung to aim at.**

**Scheduled:**

6. **The trade-banking policy is scheduled for v0.53** with its own baseline round (v0.52 Part 3.3). Every pacing figure in this project is measured on a bot that never trades and is therefore an **upper bound** on a trading player's timeline. That is a deliberate calibration, recorded in `pacing.mjs`'s header.
7. **The Eludium tier** was deferred by the v0.52 spec itself (its Part 6) with the design sketched. Kittens' is `unobtainium 1000 + alloy 2500`, tier 5, `progressHandicap 300` (`js/workshop.js:2181–2189`).

**Standing directives — do not re-flag these as violations:**

- **The Sparks exception.** Sparks Beyond the Wall requires a recruited Piltover/Zaun champion. This is the **single sanctioned exception** to "champions never hard-gate content", sanctioned because it gates an Era on a **3-of-10 choice**, not on a specific champion. Ruled by Jerry, v0.51. Recorded in `rr-design-spec.md` and at the `sparks` tech entry.
- **`CAMP_YIELD_LIMIT = 6` is kept deliberately, not by default.** Censused against Kittens' `hunterRatio` in v0.52 Part 2.5: the source sums to ×6.10 unbounded across 7 members; RR runs 9 members at a measured ×6.35 against a ×7.00 asymptote. Parity in magnitude, ~10% haircut at the very top, nothing at all below it.
- **Two RR-invented rules have been ruled out of existence and must not return** — the 1.25 price-band rule (v0.50) and the effect-to-ratio proportionality bound (v0.52 Part 2.6). Kittens assigns `priceRatio` by what a building *is*, not by the size of its effect; its own Aqueduct scores 0.25 on RR's retired rule.

---

## 8. Known soft spots in the apparatus

None of these is a game defect. All of them will mislead someone who trusts the instrument.

1. **`simcore.mjs`'s `KNOWLEDGE MULT` line sums Σ from buildings only**, while the `delivered` figure beside it includes the Scholarship-ladder Discoveries. The two diverge steadily after Sparks; at Icathia the line reads ×105 against ×35.75 and most of that gap is missing Σ terms, not overshoot. **Fix the sum to include UPGRADES before quoting it.** BUILD REPORT §8 carries the same warning.
2. **`shimmer-audit.mjs` hardcodes `campYieldMult = 6.27`** from a run log rather than reading it live. If camp yields move, its arithmetic goes stale silently.
3. **`enhance-audit.mjs`'s `boost_provisions_irrigation` reads ×6.56 at 500 copies** against a `provisions: 1.5` bound that should asymptote near ×2.5. It clearly saturates (×5.94 → ×6.56 from 50 to 500 copies), so the bound is working, but the absolute level is unexplained. I did not chase it. Someone should.
4. **`test-v14.mjs` asserts the Tavern's definition** — tech, ratio, relief and cost. It is in the historical set so it does not run, but it now asserts a building that does not exist.
5. **`test-v52`'s `censusLocked` assertion greps for `census-row|data-w=`** in the unlocked Census HTML without my having verified those selectors are what the renderer actually emits. The adjacent length comparison is the real check; treat the selector half as decorative until someone confirms it.
6. **There is no in-game changelog.** The version footer reads `v0.52` and that is the only place the version appears. If the project ever wants one, nothing exists to extend.

---

## 9. Where the docs live

The project docs are the record. In the claude.ai project:

- `claude/rr-build-report-v052.md` — this round's full argument, with every measurement
- `claude/rr-design-spec.md` — the design law and the standing directives
- `claude/rr-current-state.md`, `claude/rr-analyzer-status.md` — running state
- `claude/kittens-game-reference.md` — source citations
- `era3_regional_crafting_spec_2.md`, `era3_4_bridge_spec_1.md` — Era 3/4 content specs, both corrected in v0.52 Part 4.2
- `claude/rr-gameplay-notes.md` — Jerry's raw playtest observations, **19 open items, not yet triaged into a spec**
