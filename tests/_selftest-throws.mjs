// v0.60 PART 1.2 — A SUITE THAT THROWS ON PURPOSE.
//
// This exists so the guard can be WATCHED failing rather than assumed to work. The whole reason
// Part 1 exists is that the previous runner reported a dying suite as healthy for a full round;
// shipping a new guard and not demonstrating it would be repeating the mistake in a new place.
//
// It is named with a leading underscore so `tools/run-suites.mjs` skips it in the ordinary pass,
// and it is run ONLY under `--selftest`, where the runner requires it to fail.
//
// It reproduces the exact shape of the two real aborts: everything is fine, several assertions
// pass, and then the suite dies while FORMATTING A MESSAGE with an identifier that does not exist
// in Node scope — which is precisely how `test-v38` died at `CAMP_MAX_CHARGES`.
import { suiteEnd } from "./_suite-end.mjs";

let pass = 0, fail = 0;
const check = (n, c, x) => { console.log(n + ":", c ? "PASS" : "FAIL", x ?? ""); c ? pass++ : fail++; };

check("this one passes", true);
check("so does this one", true);

// The line that kills it. `A_CONSTANT_THAT_LIVES_IN_THE_PAGE` is undefined in Node, exactly as
// CAMP_MAX_CHARGES was, and the throw happens while building the message — not in the predicate.
check("and this one dies while formatting its message",
  true, `value is ${A_CONSTANT_THAT_LIVES_IN_THE_PAGE}`);

// UNREACHABLE. Under the old scraper this suite printed "2 passed, 0 failed"-shaped output and
// counted as clean; under the new runner it prints no trailer and fails the round.
check("this assertion never runs", true);

console.log(`\n${pass} passed, ${fail} failed`);
suiteEnd(import.meta.url, pass, fail);
process.exit(fail ? 1 : 0);
