#!/bin/bash
# v0.65 PART 5 — THE §32 NEUTRALITY PROOF FOR s4, AND IT CANNOT BE A FILE DIFF.
#
# §32 rule 4: "a cumulative prefix is only attributable if every slice is PRNG-NEUTRAL with
# respect to the ones before it." s4 adds `mark("firstPZChampion")` to `sim/simcore.mjs`, and
# `index.html` is byte-identical across s3, s4 and s5 — so the usual proof (one prefix
# reproducing the previous prefix's seeded figures) has nothing to compare.
#
# The proof that DOES apply: run the SAME index.html on the SAME seed against the harness WITH
# the marker and WITHOUT it, and require the seeded figures to match to the digit. If they do
# not, the marker added a draw to a live path and §32 says the rest of the round is a fresh
# sample rather than a delta.
#
# This is the same discipline v0.63 used to prove Part 6's chronicle batching neutral after it
# had NOT been — that round's build report records 69.3/84.9/193.2/270.8 reproducing "to the
# digit" as the test. A guard nobody has watched pass is a guard nobody knows works.
set -e
cd "$(dirname "$0")/.."
SLICE="$(pwd)/snapshots/v65/s3.html"
YEARS="${1:-300}"
SEED="${2:-1}"

echo "=== s4 §32 NEUTRALITY PROOF: same index.html, same seed, harness with and without the marker ==="
cp sim/simcore.mjs /tmp/simcore-with-marker.mjs

# WITHOUT: strip the two lines the marker occupies, leaving everything else identical.
python3 - <<'PY'
src = open("sim/simcore.mjs").read()
needle = """          if (["twitch", "caitlyn", "heimerdinger"].some(id => S.champs[id] && S.champs[id].r))
            mark("firstPZChampion");
"""
assert needle in src, "the marker is not where the proof expects it"
open("/tmp/simcore-no-marker.mjs", "w").write(src.replace(needle, "", 1))
print("  built a marker-free harness")
PY

# ALWAYS restore the real harness, on any exit path. The first run of this script died
# between the two halves and left the marker-free harness in the tree.
trap 'cp /tmp/simcore-with-marker.mjs sim/simcore.mjs' EXIT

run () {  # $1 = harness, $2 = label
  cp "$1" sim/simcore.mjs
  # `pacing.mjs` exits non-zero when pass conditions fail, which is correct and is NOT a
  # failure of this proof — a 300-year run misses most milestones by construction. `|| true`
  # so `set -e` does not kill the script between the two halves of the comparison and leave
  # the marker-free harness installed, which is exactly what happened the first time.
  node sim/pacing.mjs --years "$YEARS" --seed "$SEED" --force-local-eval --file "$SLICE" \
    > "/tmp/s4proof-$2.log" 2>&1 || true
  grep -o '##MACHINE.*' "/tmp/s4proof-$2.log" > "/tmp/s4proof-$2.json"
  echo "  $2 done"
}

run /tmp/simcore-no-marker.mjs without
run /tmp/simcore-with-marker.mjs with
cp /tmp/simcore-with-marker.mjs sim/simcore.mjs   # always leave the real harness in place

node - <<'PY'
const fs = require("fs");
const a = JSON.parse(fs.readFileSync("/tmp/s4proof-without.json", "utf8").replace("##MACHINE ", ""));
const b = JSON.parse(fs.readFileSync("/tmp/s4proof-with.json", "utf8").replace("##MACHINE ", ""));
// firstPZChampion exists only in the WITH run by construction; it is the thing being added.
const keys = Object.keys(a).filter(k => k !== "conditions" && k !== "firstPZChampion");
const diff = keys.filter(k => JSON.stringify(a[k]) !== JSON.stringify(b[k]));
keys.forEach(k => { if (["ritesOfTargon","firstChampion","sparks","peakPop","icathia","voidStudies","firstAscent"].includes(k))
  console.log(`  ${k.padEnd(18)} without ${String(a[k]).padStart(10)}   with ${String(b[k]).padStart(10)}`); });
console.log(`  firstPZChampion    (absent by construction)   with ${b.firstPZChampion}`);
if (diff.length) {
  console.log("\n  §32 NEUTRALITY PROOF FAILED — these figures moved: " + diff.join(", "));
  console.log("  The marker added or removed a Math.random() call. The round is a FRESH SAMPLE.");
  process.exit(1);
}
console.log(`\n  §32 NEUTRALITY PROOF PASSED — all ${keys.length} seeded figures reproduce TO THE DIGIT.`);
console.log("  s4 adds no draw to any live path, so the whole s0->s6 chain stays seed-for-seed comparable.");
PY
