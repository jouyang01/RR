// v0.64 PART 3 — THE ERA-TIER AUDIT (dev note 2: "new-era buildings should be gated behind
// crafted tier materials").
//
// THE SPEC'S ORDER IS EXPLICIT AND IT IS THE WHOLE POINT OF THE PART: "Ship the audit, THEN the
// gates. For every RR building, list its era and whether its cost contains a material from THAT
// ERA'S OWN craft chain. Report the count BEFORE proposing individual costs — a rule applied to
// a list nobody has read is how v0.62 shipped five changes in one direction."
//
// So this tool produces a TABLE, not a fix, and it is run and reported before `index.html` moves.
//
// ---------------------------------------------------------------------------------------------
// HOW "ERA" IS DECIDED, stated because RR has no `era:` field and inventing one silently would
// make every count in this table unfalsifiable.
//
// A building's era is the era of ITS OWN UNLOCKING TECH, and the tech ladder's era boundaries are
// the milestone techs this project already measures on (`sim/pacing.mjs`):
//
//     ERA 1   everything before `sparks`                       the settlement
//     ERA 2   `sparks` .. before `chemtech`                     Piltover, the first crafted tier
//     ERA 3   `chemtech` .. before `icathia`                    Zaun and the deep works
//     ERA 4   `icathia` and beyond                              the Void
//
// A building with no tech (`tech: undefined`) is Era 1 by construction — it is available from the
// first minute. This is a JOIN, and per pass condition 13's discipline it is recorded here rather
// than argued in a report.
//
// ---------------------------------------------------------------------------------------------
// WHAT COUNTS AS A GATE, and this is the definition Kittens supplies rather than one RR invents.
//
// Kittens gates every new tier behind a CRAFTED OR REFINED material the previous tier could not
// make (`js/buildings.js` @ `c52985b`): mansion <- titanium 25; factory <- titanium + concrate;
// calciner <- oil 500 + titanium; biolab <- plastic 15 + alloy; observatory <- scaffold 50 + slab;
// the ship/harbor line <- starchart + plate + scaffold. **One gating material per tier, in a
// SMALL quantity, alongside bulk raws** — titanium 25 against slab 185 is 12% of the line items
// and 100% of the gate. The gate is the UNLOCK, not the volume: a player cannot mass-build the
// new tier on the day it opens because the crafted input is throughput-limited.
//
// So a building is GATED when its cost contains at least one CRAFT OUTPUT (a member of `CRAFTS`'s
// `out` set) whose own era is >= the building's era MINUS ONE. A craft two full eras below the
// building is a bulk raw in everything but name by the time the building unlocks, and counting it
// would make the audit say "gated" about buildings that plainly are not.
import { openGame } from "../sim/simcore.mjs";

const { browser, page, errors } = await openGame(
  process.argv.includes("--file") ? process.argv[process.argv.indexOf("--file") + 1] : undefined);

const data = await page.evaluate(() => {
  const ERA_BOUNDARY = [["sparks", 2], ["chemtech", 3], ["icathia", 4]];
  // tech -> era, walked from the boundary techs' own knowledge prices so a re-homed tech
  // re-sorts itself rather than needing this list edited.
  const kOf = {};
  TECHS.forEach(t => kOf[t.id] = (t.cost && t.cost.knowledge) || 0);
  const eraOfTech = id => {
    if (!id) return 1;
    const k = kOf[id] || 0;
    let e = 1;
    ERA_BOUNDARY.forEach(([bid, be]) => { if (k >= (kOf[bid] || Infinity)) e = Math.max(e, be); });
    return e;
  };
  const craftOut = {};
  CRAFTS.forEach(c => craftOut[c.out] = c.id);
  // a craft's era = the era of the earliest building/tech that can make its inputs; approximated
  // by the era of the deepest craft in its own input chain, resolved recursively from raws.
  const craftEra = {};
  const eraOfCraft = (out, seen) => {
    if (craftEra[out] !== undefined) return craftEra[out];
    seen = seen || {};
    if (seen[out]) return 1;
    seen[out] = 1;
    const c = CRAFTS.find(x => x.out === out);
    if (!c) return 1;
    let e = 1;
    for (const r in c.cost) if (craftOut[r]) e = Math.max(e, eraOfCraft(r, seen));
    // the four Zaun/Void raws are themselves Era-3+ converter products
    const RAW_ERA = { zaunore: 2, coalgas: 3, hexore: 3, shimmer: 3, voidessence: 4 };
    for (const r in c.cost) if (RAW_ERA[r]) e = Math.max(e, RAW_ERA[r]);
    craftEra[out] = e;
    return e;
  };
  CRAFTS.forEach(c => eraOfCraft(c.out));

  const rows = BUILDINGS.map(b => {
    const era = eraOfTech(b.tech);
    const comps = Object.keys(b.cost || {});
    const crafted = comps.filter(r => craftOut[r]);
    // a gate must be a craft from THIS era or the one immediately below it
    const gates = crafted.filter(r => (craftEra[r] || 1) >= era - 1);
    const stale = crafted.filter(r => (craftEra[r] || 1) < era - 1);
    return {
      id: b.id, name: b.name, group: b.group, tech: b.tech || "(none)", era,
      techK: b.tech ? (kOf[b.tech] || 0) : 0,
      cost: b.cost || {}, components: comps.length,
      crafted, gates, stale,
      gated: gates.length > 0,
      craftEras: Object.fromEntries(crafted.map(r => [r, craftEra[r] || 1]))
    };
  });
  return { rows, craftEra };
});

const { rows } = data;
const pad = (s, n) => String(s).padEnd(n);
console.log("v0.64 PART 3 — ERA-TIER GATE AUDIT. Every building, its era, and its gating material.");
console.log("Reported BEFORE any cost change, per the spec's own order.\n");

[1, 2, 3, 4].forEach(era => {
  const es = rows.filter(r => r.era === era);
  if (!es.length) return;
  const gated = es.filter(r => r.gated).length;
  console.log(`=== ERA ${era} — ${es.length} buildings, ${gated} gated by a craft of era >= ${era - 1}, ` +
    `${es.length - gated} NOT GATED (${Math.round(100 * gated / es.length)}% gated) ===`);
  console.log("  " + pad("building", 24) + pad("tech", 20) + pad("gating craft", 26) + "cost");
  es.forEach(r => console.log("  " + pad(r.name, 24) + pad(r.tech, 20) +
    pad(r.gates.length ? r.gates.join("+") : (r.stale.length ? "(stale: " + r.stale.join("+") + ")" : "— NONE —"), 26) +
    Object.entries(r.cost).map(([k, v]) => `${k} ${v}`).join(", ")));
  console.log("");
});

const ung = rows.filter(r => r.era >= 2 && !r.gated);
console.log(`TOTALS: ${rows.length} buildings · ${rows.filter(r => r.gated).length} gated · ` +
  `${rows.filter(r => !r.gated).length} ungated`);
console.log(`ERA 2+ UNGATED — the population this Part's rule is about: ${ung.length}`);
ung.forEach(r => console.log(`   era ${r.era}  ${pad(r.name, 24)} ${pad(r.tech, 18)} ` +
  Object.entries(r.cost).map(([k, v]) => `${k} ${v}`).join(", ")));
if (errors.length) console.log("\nPAGE ERRORS:", errors.slice(0, 5));
await browser.close();
