// v0.63 Part 1 verification: join Kittens' workshop upgrades against the techs that unlock
// them, and report the per-upgrade and per-rung science ratios. Source pinned at c52985b.
import { readFileSync } from "fs";
const KG = "/home/claude/kg";

// Strip // and /* */ comments without touching string literals — a comment containing an
// unmatched bracket walks the matcher off the end of the array (it did, into `crafts:[`).
function stripComments(src) {
  let out = "", i = 0, inStr = null, esc = false;
  while (i < src.length) {
    const c = src[i];
    if (inStr) {
      out += c;
      if (esc) esc = false;
      else if (c === "\\") esc = true;
      else if (c === inStr) inStr = null;
      i++; continue;
    }
    if (c === '"' || c === "'") { inStr = c; out += c; i++; continue; }
    if (c === "/" && src[i + 1] === "/") { while (i < src.length && src[i] !== "\n") i++; continue; }
    if (c === "/" && src[i + 1] === "*") { i += 2; while (i < src.length && !(src[i] === "*" && src[i + 1] === "/")) i++; i += 2; continue; }
    out += c; i++;
  }
  return out;
}

function evalArray(file, marker) {
  const src = stripComments(readFileSync(KG + file, "utf8"));
  const i = src.indexOf(marker);
  if (i < 0) throw new Error("marker not found: " + marker);
  // find the [ that opens the array and match brackets
  const start = src.indexOf("[", i);
  let d = 0, j = start, inStr = null, esc = false;
  for (; j < src.length; j++) {
    const c = src[j];
    if (inStr) { if (esc) esc = false; else if (c === "\\") esc = true; else if (c === inStr) inStr = null; continue; }
    if (c === '"' || c === "'") { inStr = c; continue; }
    if (c === "[") d++;
    else if (c === "]") { d--; if (!d) break; }
  }
  const body = src.slice(start, j + 1);
  // strip functions — we only need data fields
  return new Function("$I", "dojo", "com", "classes", "return (" + body + ")")(
    x => x, {}, {}, {});
}

const upgrades = evalArray("/js/workshop.js", "upgrades:[");
const techs = evalArray("/js/science.js", "techs:[");

const sci = p => { const e = (p || []).find(x => x.name === "science"); return e ? e.val : 0; };

// map upgrade id -> unlocking tech
const owner = {};
techs.forEach(t => {
  const us = (t.unlocks && t.unlocks.upgrades) || [];
  us.forEach(u => { if (owner[u] === undefined) owner[u] = t.name; });
});
const techSci = {}; techs.forEach(t => { techSci[t.name] = sci(t.prices); });

const priced = upgrades.filter(u => u.prices && u.prices.length);
const withSci = priced.filter(u => sci(u.prices) > 0);

const perUp = [], perRung = {};
priced.forEach(u => {
  const t = owner[u.name]; if (!t) return;
  const K = techSci[t]; if (!K) return;
  const s = sci(u.prices);
  if (s > 0) perUp.push(s / K);
  (perRung[t] = perRung[t] || { K, sum: 0, n: 0 });
  perRung[t].sum += s; perRung[t].n++;
});
const med = a => { const b = a.slice().sort((x, y) => x - y); return b.length ? (b.length % 2 ? b[(b.length - 1) / 2] : (b[b.length / 2 - 1] + b[b.length / 2]) / 2) : 0; };
const mean = a => a.reduce((t, x) => t + x, 0) / a.length;
const rungRatios = Object.values(perRung).filter(r => r.sum > 0).map(r => r.sum / r.K);
const counts = Object.values(perRung).map(r => r.n);

console.log("workshop upgrades with a price list :", priced.length);
console.log("carrying a science cost             :", withSci.length,
  "(" + Math.round(100 * withSci.length / priced.length) + "%)");
console.log("per-upgrade science / rung  median  :", med(perUp).toFixed(3), " mean", mean(perUp).toFixed(3));
console.log("upgrades per tech           median  :", med(counts));
console.log("total upgrade science / rung median :", med(rungRatios).toFixed(3), " mean", mean(rungRatios).toFixed(3));
const totUp = priced.reduce((t, u) => t + sci(u.prices), 0);
const totTech = techs.reduce((t, x) => t + sci(x.prices), 0);
console.log("whole game: upgrade sci / tech sci  :", (totUp / totTech).toFixed(3));

console.log("\nJerry's five named examples:");
for (const [u, t] of [["rotaryKiln", "robotics"], ["factoryRobotics", "robotics"],
                      ["offsetPress", "combustion"], ["petri", "biology"]]) {
  const up = upgrades.find(x => x.name === u);
  console.log("  " + u.padEnd(18), sci(up.prices), "against", t, techSci[t],
    "= x" + (sci(up.prices) / techSci[t]).toFixed(2));
}

// --- detail, for the build report ---
const rungRows = Object.entries(perRung).filter(([, r]) => r.sum > 0)
  .map(([t, r]) => ({ t, K: r.K, sum: r.sum, n: r.n, x: r.sum / r.K }))
  .sort((a, b) => a.x - b.x);
console.log("\nrungs with at least one science-priced upgrade:", rungRows.length);
const q = p => rungRows[Math.min(rungRows.length - 1, Math.floor(p * (rungRows.length - 1)))].x;
console.log("per-rung quartiles: p25", q(0.25).toFixed(2), " p50", q(0.50).toFixed(2),
  " p75", q(0.75).toFixed(2), " p90", q(0.90).toFixed(2), " max", q(1).toFixed(2));
console.log("share of rungs at or under 2.43x:", rungRows.filter(r => r.x <= 2.43).length, "/", rungRows.length);
