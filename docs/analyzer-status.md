# Analyzer status — Runeterra Reclaimed

Standing status for the Analyzer cycle. Read alongside `STANDING-RULINGS.md` (closed rulings,
do not re-litigate) and the latest `docs/HANDOFF-v0.NN.md` (the map of the shipped build).

---

## Where the cycle is

| | |
|---|---|
| Last shipped build | **v0.52**, tagged `v0.52`, 366,609 bytes |
| Last consumed spec | `docs/specs/rr-analyzer-v051-spec.md` (titled v0.51, produced v0.52) |
| Current spec, awaiting a builder | **`current-build-spec.md` at the repo root — produces v0.53** |
| Verification pass | 2026-08-04 — everything below was re-run from disk, not quoted |

**Workflow.** Two Claude sessions. The **analyzer** verifies the tagged build against Kittens'
real source and writes `current-build-spec.md` at the repo root. The **builder** implements
every part, runs the suites and the simulator, writes `docs/BUILD-REPORT-v0.NN.md` and
`docs/HANDOFF-v0.NN.md`, moves the consumed spec into `docs/specs/`, and tags. Jerry's own
numbered directives override the spec where they conflict. Two non-negotiables: every spec
item gets actioned or its non-action explicitly justified; every design claim is grounded in
Kittens' actual source with a file citation, never in recollection.

---

## v0.52 verification — what was checked, and what it cost

Re-run from disk this pass, on a clean container:

- **20 live suites: 941 assertions, 0 failures.** Every per-suite count matches the BUILD
  REPORT §11 table exactly.
- **2,500-year seed-1 pacing run (833.1s wall): reproduces the report to the digit.** Sparks
  y215.6, Icathia y1042.1, Era 3 826.5, Rites of Targon y75.6, 130 wanderers y857.4, peak pop
  200, morale 90/133, crowd relief 42.5/71.0/81.0%, Shimmer Refineries 26, shimmer 19.5487/s,
  Convergence 5.4% at Sparks, crystals at cap 96.5%, steel 0.4811/2.3445/17.5113 per second.
- **Science parity ×20.8000 exact** at Kittens' 30/30/25/13; ×30.7000 at RR's 39/31/49/21;
  surplus linearity ×10.000000 across 5→50 copies.
- **Tech ladder at 37 techs**, recomputed independently: 8 ties, median ×1.1222, geometric
  mean ×1.2632, largest step ×3.333 — all five conditions in band.
- `auditCostGraph()` and `auditRawGraph()` both return **zero**.
- **`enhance-audit`, `rawcost` and `crystal-sinks` all reproduce their reported figures**,
  including the 580 lifetime one-off crystal demand and the Shimmer Refinery's 580 zaunore +
  90 coalgas against the Hex Lab's 3,000.
- Every part of the consumed spec verified **shipped, part by part, by grep on
  comment-stripped source**. Nothing was skipped.

**Three things the BUILD REPORT did not report, found this pass:**

1. **Five buildings measure zero at every milestone because the bot cannot buy them** —
   `hextechFoundry` and `hexdraulicPlant` (hexgear stock peaks at 50.96 against a 200-hexgear
   price), `chembarrel`, `hexcreteBastion` (**not in the build order at all**), and the entire
   Freljord `poroRatio` ladder (`poroPasture` not in the order; `manageCrafts()` contains a
   literal `poroTears` skip). The third instance of the Shimmer Refinery defect class in three
   rounds. **`poroRatio`, the mechanism the report asks the analyzer to rule on, has never
   been built in a measured run.**
2. **A fourth failing pass condition, unlisted.** The consumed spec's Part 1.1 required
   *"Reactor count at Icathia ≤ Foundry count."* Measured: Reactors 3, Foundries 0. It was
   unmeetable at any Reactor price.
3. **The Rites of Targon regression cannot have the cause the report gives it.** BUILD REPORT
   §10 attributes it to the 26 Shimmer Refineries; Rites lands at y75.6 and the Refinery is
   gated on `chemtech` at y443.0. Only the trade-vigor half of that explanation can apply.

**And one open item closed with an exact answer:** HANDOFF §8.3's unexplained
`boost_provisions_irrigation ×6.56`. `boostDelivered()` divides two *net* provisions rates;
gross production at ×1 is 10.0000/s and the settlement eats a constant 8.5000/s, so
`net = trueMult × 10 − 8.5` reproduces all four measured rows exactly. The true multiplier is
1.1 → 1.25 → 2.3346 → 2.4902 against its 2.5 asymptote. **The bound was always correct; the
reader is not a multiplier.**

---

## What the current spec does

`current-build-spec.md` (v0.53), seven parts:

1. **The apparatus sweep** — every building reachable by the instrument, asserted by
   enumeration; the `poroTears` skip; the hexgear starvation. Its own slice, because it
   changes the instrument and adds production.
2. **Crystals get a geometric sink** — grounded in Kittens' eleven repeatable `starchart`
   consumers (100–25,000 at ratios 1.08–1.18).
3. **Two rulings closed** — `poroRatio` keeps its unbounded shape (it is Kittens'
   `unicornsRatioReligion`, and RR runs at 23% of the source's stack); `audience` kept as a
   recorded conscious departure with a population tripwire.
4. **The Eludium tier**, dated into this round by the v0.51 spec's Part 6, **with a repeatable
   consumer** — a craft with no consumer is a trophy, not a sink.
5. **Apparatus fixes before any measurement is quoted** — the `KNOWLEDGE MULT` Σ, the net-rate
   reader, the hardcoded `campYieldMult`, two test soft spots.
6. **Eras 1 and 2 got longer** — measure the early vigor economy, then either compensate or
   retire the conditions with reasons.
7. **Order, discipline, pass conditions, and a predicted-vs-measured table stated before any
   run.**

**Round thesis:** Era 3 is 826.5 against 1,400–2,300. v0.52's own four-prefix ladder shows
price rises buying +36.4 while a price *cut* bought +172.6 by adding consumers. **Demand
lengthens Era 3; price does not** — and that is also how Kittens' late game takes time.
Predicted landing: **1,000–1,350, still short of target, and the spec says so.**

---

## Scheduled and dated

| item | dated to | why |
|---|---|---|
| **Trade-banking policy** for `manageTrade()`, with its own baseline | **v0.54, first slice** | scheduled for v0.53 by v0.52 Part 3.3, but v0.53's Part 1 already re-baselines every pacing number by changing what the bot can buy; two re-baselines in one round are inseparable |
| **Freljord rungs 5 and 6** — Kittens' `unicornUtopia` 2.50 and `sunspire` 5.00 | **v0.54 candidate** | rank-matched structural lengthener with the source's own numbers; RR stops at the source's fourth rung |

---

## Known analyzer failure modes — check every one before acting on a flag

1. **Marking already-shipped items as outstanding**, and **citing identifiers that do not
   exist**. Grep `index.html` first, every time.
2. **Grepping source without stripping comments** — a source-shape assertion matches the
   comment explaining it. Broken twice (v0.51 banner, v0.52 `resRatio`).
3. **Reasoning from a zero without checking the instrument.** Broken three times now
   (Shimmer Refinery across v0.50–v0.52; the five buildings above). A zero is a claim about
   the apparatus until the apparatus has been checked.
4. **Version numbering off by one.** The git tag is authoritative, not the spec title.
5. **Predicting against the wrong gate.** Sparks is champion-gated, not knowledge-gated; Call
   to Arms is the knowledge rung to aim at.

## Reference

`claude/kittens-game-reference.md` in the claude.ai project holds verified source-of-truth
Kittens mechanics and values. Check it before proposing new design; fetch the actual source
file when it does not cover the specific value, and cite file and line either way. Where RR
departs from the source deliberately, flag the departure rather than presenting it as parity.
