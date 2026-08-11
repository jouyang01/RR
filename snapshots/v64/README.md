# v0.64 cumulative-prefix isolation slices — STANDING-RULINGS §9
#
# Each slice IS the shipped file up to that point, built FORWARD from s0 one Part at a time,
# never reconstructed by reverse-patching the finished file. The proof that the chain is
# faithful is the last line: s8 must be BYTE-IDENTICAL to the shipped index.html.
#
# §32 corollary: a cumulative prefix is only attributable if every slice is PRNG-NEUTRAL with
# respect to the ones before it. s1-s7 alter prices, ceilings and multipliers only — no code
# path changes how many Math.random() calls it makes. s8 does, and is labelled.

s0  v0.63 shipped file, UNCHANGED. The round's instrumentation lives in sim/, not in index.html,
    so s0 is measurable with every readout this round adds.
s1  Part 1.2a — the Longhouse's provisions component deleted (and VERSION -> v0.64)
s2  Part 5 — DISCOVERY_RUNG_CAP retired, the two authored outliers re-based
s3  Part 2 — the PROVISIONS rail (1.5 -> 3.0), ALONE and first, per the spec's order
s4  Part 2 — the VIGOR rail (1.0 -> 8.0) joins. The largest lever in the round
s5  Part 2 — the DEVOTION (2.0 -> 5.0) and MANA (1.0 -> 2.0) rails join
s6  Parts 4 and 6 — TRADE_PROVISIONS 3,500, and Swain's two slots recorded as distinct
s7  Part 3 — the era-tier gates (Coalgas Vent + plating 8, Hexcrystal Quarry + alloy 6)
s8  Jerry's four dev notes — **PRNG RE-ROLL SLICE**: the Sump Crawl cooldown changes how often a random-consuming path fires (§32 rule 3), so it is deliberately LAST

s8 == shipped index.html byte-for-byte: True
   s8       sha256 c170821200f7c6b65ede8529e5aa32987e3485ab41d86630846ef7287b854074
   index    sha256 c170821200f7c6b65ede8529e5aa32987e3485ab41d86630846ef7287b854074
