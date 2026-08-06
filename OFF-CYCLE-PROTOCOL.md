# Off-Cycle Round Protocol (standing rule — read when there is no analyzer spec)

Jerry plays the shipped build and finds things that must not wait for an Analyzer cycle.
This file is how those land without corrupting the cycle's bookkeeping.

An **off-cycle round** is a build produced from Jerry's developer gameplay notes, with **no
analyzer spec**. It is a first-class round — same implementation rigour, same verification,
same written record — and it is deliberately distinguishable from a spec round at every point
where a future session might confuse the two.

---

## 1. Versioning — off-cycle rounds take a POINT release

**An off-cycle build tags as `v0.NN.M`, off the last spec-produced tag.** After `v0.58`, the
first off-cycle round ships `v0.58.1`, the second `v0.58.2`. Integers stay reserved, 1:1, for
analyzer-spec rounds: the next spec round is still `v0.59`.

**Why, and this is the whole reason the rule exists.** The one piece of bookkeeping this
project has broken more than once is the spec→build mapping — STANDING-RULINGS §10 exists
because the analyzer mislabelled versions twice. If off-cycle rounds consumed integers, then
"spec vNN produces build vNN" would stop being true, every pending spec would need re-titling
the moment Jerry played the game, and the next session would have to reconstruct which rounds
came from a spec and which did not. A point release keeps the mapping intact, needs no
renumbering anywhere, and carries its own provenance: `v0.58.1` reads as *"off-cycle work on
top of v0.58"* without opening a single document.

The in-file `VERSION` constant and the footer match the tag, exactly as in a spec round.
Assert the version's **shape** in suites, never a literal string — HANDOFF v0.54 §5.

---

## 2. The notes are an artefact, not a chat message

The analyzer verifies a build by checking each part against the archived spec. An off-cycle
round with no written artefact cannot be verified at all — so it gets the same three layers a
spec round gets.

**The trigger.** Jerry supplies numbered developer notes. The builder writes them verbatim to
**`dev-notes-build.md` at the repo root**, numbered, before implementing anything. That file is
the off-cycle equivalent of `current-build-spec.md` and is consumed the same way: moved — not
copied — to `docs/specs/rr-devnotes-v0.NN.M.md` when the round ships.

**The build.** Every note gets actioned, or its non-action explicitly justified in the report.
Verification cadence is `BUILDER_PROTOCOL.md`: a cheap single-seed, short-length check after
each note, and the full multi-seed, full-length suite **once**, at the end. The final run is
not optional — Era 3 has run a 2.6× spread across seeds, so any pacing claim from one seed is
noise, not a measurement.

**The record.** `docs/BUILD-REPORT-v0.NN.M.md` and `docs/HANDOFF-v0.NN.M.md`, same shape as a
spec round, plus the four bookkeeping updates in §4 below.

---

## 3. What an off-cycle round must NOT do

- **It must not consume `current-build-spec.md`.** If a spec is pending at the root, it stays
  there untouched. The off-cycle build report states that the pending spec's measured baseline
  has moved, so the analyzer re-measures instead of trusting its own pre-run numbers.
- **It must not take an integer tag.** See §1.
- **It must not override `STANDING-RULINGS.md`.** Jerry's notes supersede *prior gameplay
  notes* and *spec items in conflict with them*. They do not reopen closed rulings. A note that
  genuinely requires reopening one is a **new explicit ruling from Jerry** and is recorded as a
  new numbered section in `STANDING-RULINGS.md`, with the round that closed it — never as a
  silent contradiction.
- **It must not skip the parity ledger.** THE CHARTER (STANDING-RULINGS §16) makes Kittens
  parity the primary goal. Jerry's directives override the spec, so a note does not need a
  Kittens citation to *ship* — but anything it adds or re-rates still needs its
  `docs/PARITY-LEDGER.md` row, labelled EASIER or HARDER with the reason. An unlabelled
  RR-original item is a suspected speed-up.
- **It must not leave the consumed notes file at the root.** Move it. A consumed artefact left
  in the always-read tier tells the next session it has work waiting that is already done.

---

## 4. What the analyzer must be able to see afterwards

The next Analyzer cycle starts cold. These four updates are what tell it the ground moved:

1. **`docs/analyzer-status.md`** — the cycle table updated: last shipped build and tag, last
   consumed artefact, whether a spec is pending, and a line naming the round as off-cycle.
2. **`docs/HANDOFF-v0.NN.M.md`** — the map of the build, including which notes shipped and
   what each one measurably changed.
3. **`docs/specs/rr-devnotes-v0.NN.M.md`** — the notes as issued, so verification has something
   to check against.
4. **`docs/gameplay-notes.md`** — every note the round actioned struck through and cited by
   the round that closed it, so it is not re-filed later.

---

## 5. The standing question the analyzer should ask of an off-cycle round

Off-cycle rounds are the ones most likely to drift from source, because they are justified by
how the game *felt* rather than by a Kittens rung. That is legitimate — Jerry is the designer
and feel is his call — but it means the next analyzer pass should explicitly re-check any
number an off-cycle round moved against its Kittens counterpart, and record the result as
parity, EASIER, or HARDER rather than letting it pass unexamined.
