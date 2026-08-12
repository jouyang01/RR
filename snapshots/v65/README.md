# v0.65 cumulative-prefix isolation slices — STANDING-RULINGS §9
#
# Built FORWARD from s0, one Part at a time, never by reverse-patching the finished file.
# The proof is the last line: the final prefix is BYTE-IDENTICAL to the shipped index.html.
#
# §32: EVERY slice in this round is PRNG-NEUTRAL — no change alters how many Math.random()
# calls a live path makes — so the whole chain is seed-for-seed comparable. s4 is the one
# most likely to break that and it is proved separately by tools/prove-s4-neutral.sh.

s0  v0.64 shipped file, UNCHANGED. The round's two new instruments (the knowledge-supply
    block and knee._sources) live in sim/ only, so s0 is measurable with every readout
    this round adds — which is what makes it a usable baseline.
s1  Part 2 — the Training Ground's vigor boost deleted, Kittens' weapon line ported (and VERSION -> v0.65)
s2  Part 3 — the Longhouse's provisions component restored at 30, sized by the never-bind rule
s3  Part 4 — the fourth mana Discovery, on `hexcore`, discharging v0.64's one undischarged condition
s4  Part 5 — `firstPZChampion`, `sparksAfterPZ` and the [draw] labels. **`sim/` ONLY — index.html byte-identical to s3.** Its §32 neutrality proof is `tools/prove-s4-neutral.sh`, not a file diff
s5  Part 6 — the Rites condition restated as a y50-200 band. **`sim/` ONLY — index.html byte-identical to s3**
s6  Part 1 — `DISCOVERY_KNOWLEDGE_SET` deleted and INVERTED; coverage 32/78 -> 75/78

s6 == shipped index.html byte-for-byte: True
   s6       sha256 fac1310d9a54cab8868a859bd2aa41548fd3c6dade9caaf6bc6ae4036709f88a
   index    sha256 fac1310d9a54cab8868a859bd2aa41548fd3c6dade9caaf6bc6ae4036709f88a
