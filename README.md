# Runeterra Reclaimed

A League of Legends–themed incremental/idle game, modelled rung-for-rung on
[Kittens Game](https://github.com/nuclear-unicorn/kittensgame) and shipped as a **single
self-contained HTML file**. No build step, no bundler, no backend — `index.html` *is* the
game. Saves are per-player and local; hosting is static.

The game runs five Eras to the first World Rune prestige reset: Rift Camp (Era 0), the
Targon/Devotion line (Era 1), the ten named Champions (Era 2), Piltover/Zaun crafting
(Era 3), and the World Rune bridge (Era 4). Pacing is calibrated against Kittens' real
*absolute* pacing, not a compressed version of it — a full clear is meant to take real-world
weeks, not a week.

Current shipped build: **v0.58**. For the live suite count, assertion total, parity-ledger
figures and where the Analyzer/Builder cycle currently stands, read `docs/analyzer-status.md` —
that file is maintained every round and this one is not.

---

## Repo layout

```
index.html              The game. The only real deliverable. Everything else is apparatus.
                        This filename is permanent — versioning lives in the in-file version
                        string, in commits, and in git tags, never in the filename again.

sim/                    The headless simulator and its reports.
  simcore.mjs             Virtualises Date.now, seeds a deterministic xorshift Math.random,
                          stubs the render layer, drives a greedy bot through the game's own
                          tick(). The bot's build-order list lives here.
  pacing.mjs              Milestone / pass-condition report built on simcore. Carries the
                          standing zero-trade calibration note in its header.
  objectives.mjs          The pacing targets, as data.
  luxdiag.mjs             Luxury-stock diagnostics.

tests/                  The live regression set — every .mjs directly in this directory.
                        Current count and assertion total: docs/analyzer-status.md.
  historical/             test-v2 … test-v31. Written against builds many versions retired;
                          they WILL fail against the current build. Shipped for archaeology,
                          not for regression. Do not add them to the run loop and do not treat
                          their failures as defects.
  shots/                  Screenshot output from the banner suite (gitignored).

tools/                  Audits and one-off instruments.
  audit.mjs, effcost.mjs      Effective-raw cost expansion and cost-graph checks.
  enhance-audit.mjs           Enumerates every non-cosmetic effect field on every building and
                              measures the delivered multiplier end-to-end at 5/50/500 copies.
                              Linearity 1.0 = unbounded; ≪1.0 = a bound is biting.
  rawcost.mjs                 Expands every Zaun/Industry building's cost to raw resources.
  shimmer-audit.mjs           Shimmer Refinery vs Sump Crawl economics.
  crystal-sinks.mjs           Enumerates every crystal sink in the game.
  census-table.mjs, size.mjs  Content census and file-size accounting.
  apply-bld.mjs, apply-split.mjs, split-v48.mjs
                              Patch-application scripts used to construct isolation builds.
                              Read STANDING-RULINGS.md §9 before using them.

docs/                   The written record.
  BUILD-REPORT-v0.4x.md, BUILD-REPORT-v0.5x.md   One per round: the round's argument, with
                                                 every measurement.
  HANDOFF-v0.4x.md, HANDOFF-v0.5x.md             One per round: the map for whoever picks it up.
  specs/                                         The analyzer specs each round was built from.
  gameplay-notes.md                              Raw playtest observations, untriaged.

STANDING-RULINGS.md     Closed rulings. Read this before flagging anything as a violation.
BUILDER_PROTOCOL.md     How a builder verifies a multi-part spec. Always-read tier.
OFF-CYCLE-PROTOCOL.md   How a round built from gameplay notes, with no analyzer spec, ships.
current-build-spec.md   The spec the current round is being built from. Always-read tier.
README.md               This file.
```

**The always-read tier.** Three documents are read at the start of every session, before any
other work: `rr-current-state.md` (in the claude.ai project), `current-build-spec.md` *if one
is present*, and `BUILDER_PROTOCOL.md`. `STANDING-RULINGS.md` is read before flagging anything
as a violation. `OFF-CYCLE-PROTOCOL.md` governs any round built from Jerry's gameplay notes
rather than from a spec.

`current-build-spec.md` exists only while a spec is awaiting a builder; the round that consumes
it *moves* it into `docs/specs/`. Its absence means no spec round should be started — check
`docs/analyzer-status.md` for where the cycle actually is.

---

## Running things

The suites and harness resolve `index.html` relative to their own location, so they run from
anywhere in a clone. Playwright must be available; the browser is expected at
`/opt/pw-browsers/chromium` with a plain-launch fallback. **Never run `playwright install`.**

```bash
# the live regression set — globbed, so it cannot go stale as suites are added
for f in tests/*.mjs; do
  echo -n "$(basename "$f" .mjs): "; node "$f" 2>&1 | grep -E '^[0-9]+ passed' | tail -1
done   # tests/historical/ is a subdirectory and is correctly skipped by this glob

# a pacing run (a 2,500-year seed-1 run is ~22–31 min wall)
node sim/pacing.mjs --years 2500 --seed 1

# syntax-check after every batch of edits
node -e "const fs=require('fs');const m=fs.readFileSync('index.html','utf8')\
.match(/<script>([\s\S]*)<\/script>/);new Function(m[1]);console.log('syntax OK')"
```

---

## The development cycle

The project runs as a loop of four steps, each with a named owner. **Jerry reviews between
every pair of steps, and his directives override the spec wherever they conflict.**

**1 — Analyzer.** A session that measures the shipped build against Kittens' actual source,
line by line, and returns a formal BUILDER SPEC: a numbered list of levers, correctness
items, measurements to run, and rulings to draft. It does not write game code.

**2 — Jerry reviews the spec.** He attaches his own numbered directives. A directive beats a
spec item where the two disagree, and the build report records which items were Jerry's.

**3 — Builder.** A session that implements every item in the spec, runs the suites and the
headless simulator, and writes a BUILD REPORT back — the round's full argument, with the
measurements that justify each change, the assertions that were re-pointed and why, and the
pass conditions that failed. **Verification cadence is governed by
[`BUILDER_PROTOCOL.md`](BUILDER_PROTOCOL.md)** — cheap single-seed check per part, full
multi-seed suite once at the end, never the full suite per part.

**4 — Jerry reviews the build.** The build ships, gets tagged, and the report and handoff go
into `docs/`. The next Analyzer cycle starts from the tagged build.

**The off-cycle path.** Jerry plays the shipped build and sometimes finds things that must not
wait for an Analyzer pass. Those land as an **off-cycle round**: same implementation rigour,
same verification, same written record, but built from his numbered gameplay notes with no
spec, and tagged as a point release. [`OFF-CYCLE-PROTOCOL.md`](OFF-CYCLE-PROTOCOL.md) is the
full rule — including what an off-cycle round may not do, which is mostly: it may not consume a
pending spec, take an integer tag, or override a closed ruling.

**Two standing rules govern the whole loop, and both are non-negotiable:**

1. **Every item in the spec gets actioned.** Never silently skip one. If an item cannot be
   satisfied, say so plainly and say why.
2. **All design claims are grounded in Kittens' actual source**, never in recollection. Cite
   file and line.

Before flagging anything as outstanding, missing, or in violation, read
[`STANDING-RULINGS.md`](STANDING-RULINGS.md) and grep `index.html`. This analyzer instance
has repeatedly marked already-shipped items as outstanding and cited identifiers that do not
exist in the codebase.

---

## Versioning

The git tag is the authoritative version number. A spec is named for the build it *produces*,
and where a spec's title disagrees with the tag, the tag wins — the analyzer has mislabeled the
version twice. See `STANDING-RULINGS.md` §10.

**Integers are reserved for analyzer-spec rounds.** A round built from Jerry's gameplay notes
with no spec takes a point release off the last tag — `v0.58` → `v0.58.1` — so the spec→build
mapping stays 1:1 and the tag itself says which kind of round produced it. See
[`OFF-CYCLE-PROTOCOL.md`](OFF-CYCLE-PROTOCOL.md).

---

A non-commercial fan project. League of Legends and Runeterra are property of Riot Games,
Inc. Riot Games does not endorse or sponsor this project.

