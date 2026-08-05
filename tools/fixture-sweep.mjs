// v0.56 Part 6 — the sweep the spec asks for, done mechanically rather than by eye.
//
// The defect class: an assertion that captures a `base` from LIVE state and divides by it,
// while the block resets only SOME of the containers that feed the function being baselined.
// It is invisible on a clean page and shows up as a few-per-cent error when an earlier block
// leaves a roster, a champion or a policy behind.
//
// The detector: run every suite twice against the same build. Once normally, and once on a
// page whose `freshState()` has been overridden to return a DIRTY state -- 20 Trailblazer
// wanderers, three champions and two policies -- so that every `reset()` in every suite
// re-seeds the leak instead of clearing it. Any assertion that fails ONLY in the dirty run is
// reading state its own block did not set.
//
// Assertions that legitimately measure "bare" behaviour will also fail, and that is the point:
// each one is then inspected by hand and either fixed or recorded as intentional.
//
// KNOWN ARTEFACT OF THE DETECTOR ITSELF, and it must be stated or a reader will "fix" a
// non-bug. `loadFromString()` merges a save OVER freshState() with Object.assign per object
// key (index.html:4920-4923), so poisoning freshState() means every container a save leaves
// EMPTY is re-dirtied on every load. In real play freshState()'s containers are empty, so a
// block that clears `S.champs = {}` and then calls loadFromString keeps its clean state. Any
// exposure whose block clears a container and then re-loads is this artefact, not a defect.
// The three genuine findings of the v0.56 sweep -- test-v32's camp baseline, test-v32's
// scouting cost, test-v54's poro rate -- were all confirmed by hand against a normal page.
const ARTEFACT = {
  "test-v55.mjs": ["17 — ...and it clears after exactly one attempt",
                   "17 — a wrong-kind undo does not penalise the hunt"]
};
import { readFileSync, writeFileSync, mkdirSync, readdirSync } from "fs";
import { execSync } from "child_process";

const DIRTY = `
await page.addInitScript(() => {
  window.__dirty = () => {
    const f = window.freshState;
    if (!f || window.__patched) return; window.__patched = true;
    window.freshState = function () {
      const s = f.apply(this, arguments);
      s.wanderers = []; for (let i = 0; i < 20; i++) s.wanderers.push({ nm: "D" + i, j: null, jx: {}, xp: 0, t: "trailblazer" });
      s.champs = { poppy: 1, leona: 1, caitlyn: 1 };
      s.policies = { openRange: 1, oralTradition: 1 };
      return s;
    };
  };
});
`;
const files = readdirSync("tests").filter(f => f.endsWith(".mjs")).sort();
mkdirSync("/tmp/fx", { recursive: true });
const results = [];
for (const f of files) {
  const src = readFileSync("tests/" + f, "utf8");
  // inject before the goto, then call the patch after the page has a freshState
  const patched = src.replace(/await page\.goto\(([^\n]*)\);/,
    DIRTY + "await page.goto($1);\nawait page.waitForTimeout(300);\nawait page.evaluate(() => { window.__dirty && window.__dirty(); });\nawait page.evaluate(() => { if (window.__patched) loadFromString(btoa(unescape(encodeURIComponent(JSON.stringify(freshState()))))); });");
  if (patched === src) { results.push([f, "SKIP (no goto)", ""]); continue; }
  writeFileSync("tests/__dirty_" + f, patched);
  let clean = "", dirty = "";
  try { clean = execSync(`node tests/${f} 2>&1`, { encoding: "utf8" }); } catch (e) { clean = e.stdout || ""; }
  try { dirty = execSync(`node tests/__dirty_${f} 2>&1`, { encoding: "utf8" }); } catch (e) { dirty = e.stdout || ""; }
  const fails = t => t.split("\n").filter(l => /: FAIL/.test(l)).map(l => l.split(": FAIL")[0]);
  const cf = new Set(fails(clean)), df = fails(dirty);
  const art = new Set((ARTEFACT[f] || []).map(x => x.trim()));
  const only = df.filter(x => !cf.has(x) && !art.has(x.trim()));
  const arte = df.filter(x => !cf.has(x) && art.has(x.trim()));
  execSync(`rm -f tests/__dirty_${f}`);
  results.push([f, only.length ? `${only.length} EXPOSED` : (arte.length ? `clean (${arte.length} known detector artefact)` : "clean"), only.join(" || ")]);
}
console.log("\n=== v0.56 Part 6 — FIXTURE SWEEP: assertions that fail ONLY on a dirty roster ===");
results.forEach(([f, v, d]) => console.log(`${f.padEnd(24)} ${v}${d ? "\n    " + d.split(" || ").join("\n    ") : ""}`));
