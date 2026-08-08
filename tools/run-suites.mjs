// v0.60 PART 1.2 — THE RUNNER, and it exists because "N passed, 0 failed" was a lie for a round.
//
// Until this file, the project's suite runner was a shell loop that scraped the last
// "N passed, M failed" line out of each suite's stdout. That loop reports a suite which DIES as
// clean, because a dead suite prints no failure — it prints nothing at all, and a missing number
// scrapes as zero. `test-v38` and `test-v45` had been dying for a full round, losing 22 authored
// assertions, four of which were failing when they finally ran.
//
// THIS RUNNER FAILS THE ROUND ON ANY OF FOUR CONDITIONS, and the last three are the new ones:
//
//   1. a suite reports failed > 0                       (the old check)
//   2. a suite exits non-zero                           — even at failed=0
//   3. a suite prints no `SUITE-END` trailer            — i.e. it died before the end
//   4. a suite's trailer has passed+failed < asserted  — i.e. it ran to the end but SKIPPED
//                                                         call sites, which a scraper cannot see
//
// WHY (4) IS A LOWER BOUND AND NOT AN EQUALITY, stated because the spec asked for equality and
// the measurement says equality is the wrong test. `asserted` counts `check()` CALL SITES in the
// source; seven suites call `check()` inside a loop, so they legitimately execute MORE assertions
// than they have call sites — `test-v32` runs 67 from 61 sites. Requiring equality would fail
// seven healthy suites and teach the next reader to ignore this line, which is exactly how the
// old scraper became untrustworthy.
//
// What the lower bound DOES catch: a call site that never executed at all, in a suite that still
// reached its end — an early `return`, a `try` that swallowed, a branch never taken.
// What it does NOT catch: one skipped site in a suite whose loops over-run the count by more than
// one. That residual is stated rather than papered over. **The primary guard is (3)**, which is
// exact, has no such gap, and is demonstrated under `--selftest`.
//
// Usage:  node tools/run-suites.mjs [--selftest]
//
// `--selftest` additionally runs `tests/_selftest-throws.mjs`, a scratch suite that throws on
// purpose, and requires the runner to FAIL on it. A guard nobody has watched fail is a guard
// nobody knows works, and this one exists precisely because the previous guard did not.
import { readdirSync, existsSync } from "fs";
import { execFileSync } from "child_process";

const SELFTEST = process.argv.includes("--selftest");
const files = readdirSync("tests").filter(f => f.startsWith("test-") && f.endsWith(".mjs")).sort();

let totalAsserted = 0, totalPassed = 0, totalFailed = 0;
const problems = [];

function runOne(file, expectFailure) {
  let out = "", code = 0;
  try {
    out = execFileSync("node", ["tests/" + file], { encoding: "utf8", maxBuffer: 64 * 1024 * 1024 });
  } catch (e) {
    out = (e.stdout || "") + (e.stderr || "");
    code = e.status === undefined || e.status === null ? 1 : e.status;
  }
  const trailer = out.match(/^SUITE-END (\S+) asserted=(\d+) passed=(\d+) failed=(\d+)$/m);
  const failLines = (out.match(/^.*: FAIL.*$/gm) || []);
  const rec = { file, code, trailer: !!trailer, failLines };
  if (trailer) {
    rec.asserted = +trailer[2]; rec.passed = +trailer[3]; rec.failed = +trailer[4];
  }
  const bad = [];
  if (!trailer) bad.push("NO SUITE-END TRAILER — the suite died before finishing");
  if (code !== 0 && trailer && rec.failed === 0) bad.push(`exit ${code} with failed=0`);
  if (trailer && rec.failed > 0) bad.push(`${rec.failed} failing assertion(s)`);
  if (trailer && rec.passed + rec.failed < rec.asserted)
    bad.push(`only ${rec.passed + rec.failed} of ${rec.asserted} check() call sites executed — checks were SKIPPED`);
  rec.bad = bad;

  if (expectFailure) return rec;

  if (trailer) { totalAsserted += rec.asserted; totalPassed += rec.passed; totalFailed += rec.failed; }
  const status = bad.length ? "FAIL" : "ok";
  console.log(`${file.padEnd(26)} ${status.padEnd(5)} ` +
    (trailer ? `sites=${rec.asserted} ran=${rec.passed + rec.failed} passed=${rec.passed} failed=${rec.failed}` : "(no trailer)") +
    (bad.length ? "\n    " + bad.join("\n    ") : ""));
  failLines.slice(0, 6).forEach(l => console.log("    " + l.trim()));
  if (bad.length) problems.push(rec);
  return rec;
}

console.log("=== SUITES ===");
for (const f of files) runOne(f, false);

console.log(`\nTOTAL: ${files.length} suites, ${totalAsserted} check() call sites, ` +
  `${totalPassed + totalFailed} assertions executed, ${totalPassed} passed, ${totalFailed} failed`);

if (SELFTEST) {
  console.log("\n=== SELF-TEST: a suite that throws MUST fail the round ===");
  if (!existsSync("tests/_selftest-throws.mjs")) {
    console.log("MISSING tests/_selftest-throws.mjs — the guard cannot be demonstrated");
    process.exit(1);
  }
  const rec = runOne("_selftest-throws.mjs", true);
  const caught = rec.bad.length > 0 && !rec.trailer;
  console.log(`  scratch suite exit=${rec.code}, trailer=${rec.trailer}, verdict=${caught ? "CAUGHT" : "MISSED"}`);
  console.log(`  ${caught ? "PASS" : "FAIL"} — a deliberately-thrown exception ${caught ? "fails" : "DOES NOT FAIL"} the round`);
  if (!caught) process.exit(1);
}

if (problems.length) {
  console.log(`\n${problems.length} suite(s) failed the round:`);
  problems.forEach(p => console.log(`  ${p.file}: ${p.bad.join("; ")}`));
  process.exit(1);
}
console.log("\nall suites clean: every one printed a trailer, every trailer balanced, every exit zero");
