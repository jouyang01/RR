# Analyzer specs

One document per round, named for the build it **produced** — not for whatever the analyzer
titled it. The analyzer has mislabeled the version twice (see `STANDING-RULINGS.md` §10), so
the mapping between a spec's own title and its filename here is not always one-to-one. Where
they differ, the filename is right.

Every spec in this directory is **consumed**. None of them is the next round's spec. The
next round's spec is written by the Analyzer cycle after it verifies the tagged build.

## Two documents cover the v0.52 round, and they are not the same document

- **`rr-analyzer-v051-spec.md`** — titled *"BUILDER SPEC v0.51 — the knowledge buildings are
  capped at ×3.97 where Kittens is ×20.8"*. This is the analyzer's **output**: the formal
  builder spec that v0.52 was actually built from. Its Part numbering is the one the v0.52
  BUILD REPORT §5 answers item by item (Part 0 = the knowledge bound, 1.1 = the Reactor, 2.3 =
  the Tavern merge, and so on). Filed under `v051` because that is the title it shipped under;
  the build it produced is v0.52.

- **`rr-analyzer-v052-spec.md`** — titled *"v0.51 SPEC — Analyzer Input (action every part)"*.
  This is the analyzer's **input**: the brief handed to the analyzer session before it wrote
  the spec above. Its Part numbering differs (2.5 = the Tavern merge, 2.6 = the Bloomery), so
  reading the BUILD REPORT's item numbers against this document will mismatch. It is archived
  because several rulings are stated here in their original wording — the Convergence stripe,
  the Chronoshard correction, the Ascent closure — and `STANDING-RULINGS.md` quotes it.

Read the BUILD REPORT against `rr-analyzer-v051-spec.md`. Read the rulings against either.
