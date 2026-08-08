// v0.60 PART 1.2 — THE TRAILER THAT MAKES A DYING SUITE FAIL.
//
// The defect class this closes: **a suite that dies is not a suite that fails.** `test-v38` died
// at assertion 21 of 27 and `test-v45` at 43 of 59, both by exception rather than by a failing
// `check()`, and every "N passed, 0 failed" line in the project reported that as health. Twenty-two
// authored assertions had not executed for a full round, and four of them were failing when they
// finally did.
//
// §21 covers a test that measures a baseline it did not reset. This is its sibling.
//
// THE MECHANISM, and both halves are needed:
//
//   1. Every suite prints `SUITE-END <name> asserted=<n> passed=<p> failed=<f>` as its LAST act.
//      A suite that dies anywhere — during a check, during a fixture, while formatting a message
//      — never reaches this line, so **the trailer's ABSENCE is the signal**. The runner treats a
//      missing trailer as a failure.
//   2. `asserted` is the number of `check()` call sites the suite CONTAINS, counted from its own
//      source at run time rather than hand-maintained. So a suite that runs to completion but
//      SKIPS a check — an early `return`, a conditional block, a branch that was never taken —
//      prints `asserted > passed + failed` and the runner catches that too.
//
// COUNTING FROM SOURCE IS THE POINT. A hand-written `const ASSERTED = 27` is a second number to
// maintain and would have drifted the first time someone added an assertion; reading the file the
// suite is defined in cannot drift from the file the suite is defined in. Comments are stripped
// first, so a `check(` inside a prose block does not inflate the count — this file's own header
// says `check()` several times and would otherwise be counted if it were ever measured.
import { readFileSync } from "fs";

export function assertedCount(metaUrl) {
  const src = readFileSync(new URL(metaUrl), "utf8");
  const stripped = src.replace(/\/\*[\s\S]*?\*\//g, "").split("\n")
    .map(l => l.replace(/(^|[^:])\/\/.*$/, "$1")).join("\n");
  // A call site, not a mention: `check(` preceded by start-of-line or a non-identifier,
  // non-`.` character. The `.` exclusion stops `foo.check(` counting as this suite's check.
  return (stripped.match(/(?:^|[^.\w$])check\s*\(/g) || []).length;
}

export function suiteEnd(metaUrl, pass, fail) {
  const name = String(metaUrl).split("/").pop().replace(/\.mjs$/, "");
  console.log(`SUITE-END ${name} asserted=${assertedCount(metaUrl)} passed=${pass} failed=${fail}`);
}
