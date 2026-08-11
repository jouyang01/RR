// test-v63 — the v0.63 spec round plus Jerry's dev note. One block per Part, in the spec's order.
//
// Conditions whose value is a 2,500-year median are asserted here only as "the apparatus emits
// it"; the measured figures are in BUILD REPORT §11.
import { chromium } from "playwright";
import { readFileSync } from "fs";
import { suiteEnd } from "./_suite-end.mjs";

const browser = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium" }).catch(() => chromium.launch());
const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
const errors = [];
page.on("console", m => { if (m.type() === "error") errors.push(m.text()); });
page.on("pageerror", e => errors.push(String(e)));
await page.goto(new URL("../index.html", import.meta.url).href);
await page.waitForTimeout(600);
let pass = 0, fail = 0;
const check = (n, c, x) => { console.log(n + ":", c ? "PASS" : "FAIL", x ?? ""); c ? pass++ : fail++; };
const reset = () => page.evaluate(() => loadFromString(btoa(unescape(encodeURIComponent(JSON.stringify(freshState()))))));

const RAW = readFileSync(new URL("../index.html", import.meta.url), "utf8");
const strip = s => s.replace(/\/\*[\s\S]*?\*\//g, "").split("\n")
  .map(l => l.replace(/(^|[^:])\/\/.*$/, "$1")).join("\n");
const CODE = strip(RAW);
const SIMCORE = readFileSync(new URL("../sim/simcore.mjs", import.meta.url), "utf8");
const PACING = readFileSync(new URL("../sim/pacing.mjs", import.meta.url), "utf8");

// ============================================================================
// PART 1 — the per-rung discovery cap. The divisor is NOT the problem.
// ============================================================================
await reset();
const rung = await page.evaluate(() => {
  // READ FROM THE MUTATED `UPGRADES`, not from the literal. Both the generator and the cap are
  // load-time IIFEs; a source-text assertion sees neither, which is the trap this Part is about.
  const techK = {};
  TECHS.forEach(t => { techK[t.id] = (t.cost && t.cost.knowledge) || 0; });
  const per = {};
  let total = 0, carrying = 0;
  UPGRADES.forEach(u => {
    const k = u.cost && u.cost.knowledge; if (!k) return;
    carrying++; total += k;
    (per[u.tech] = per[u.tech] || { K: techK[u.tech] || 0, sum: 0 }).sum += k;
  });
  const rows = Object.entries(per).filter(([, r]) => r.K > 0)
    .map(([t, r]) => ({ tech: t, K: r.K, sum: r.sum, x: r.sum / r.K }))
    .sort((a, b) => b.x - a.x);
  const totalTech = TECHS.reduce((t, x) => t + ((x.cost && x.cost.knowledge) || 0), 0);
  const perUp = [];
  UPGRADES.forEach(u => { const k = u.cost && u.cost.knowledge; const K = techK[u.tech] || 0;
                          if (k && K) perUp.push(k / K); });
  return { rows, total, totalTech, carrying, divisor: DISCOVERY_KNOWLEDGE_DIVISOR,
           cap: DISCOVERY_RUNG_CAP, setSize: DISCOVERY_KNOWLEDGE_SET.length,
           worst: rows[0], rites: rows.find(r => r.tech === "ritesOfTargon"),
           maxPerUpgrade: Math.max.apply(null, perUp) };
});
// PASS CONDITION 2
check("1.4/2 — `DISCOVERY_KNOWLEDGE_DIVISOR` is UNCHANGED at 1.25 (0.8 × K)",
  rung.divisor === 1.25,
  "the source's per-upgrade median is 0.90 (my re-run: 0.882, mean 0.892) and RR's is 0.80 — " +
  "at parity. v0.62's own report proposed halving this to 0.4 × K; that moves AWAY from the " +
  "source in a project whose charter is parity, and the concentration is the real defect.");
check("1.4/2 — ...and the halving builder note 1 asked for is NOT in the file",
  !/DISCOVERY_KNOWLEDGE_DIVISOR = 2\.5/.test(CODE) && /DISCOVERY_KNOWLEDGE_DIVISOR = 1\.25;/.test(CODE));
// PASS CONDITION 3 — asserted from TECHS/UPGRADES AFTER the generator runs
check("1.4/3 — the per-rung cap exists at 2.43×, Kittens' own total-upgrade-science-per-rung figure",
  rung.cap === 2.43 && /var DISCOVERY_RUNG_CAP = 2\.43;/.test(CODE));
check("1.4/3 — NO RUNG EXCEEDS 2.43×, read from the mutated arrays after both IIFEs",
  rung.rows.every(r => r.x <= rung.cap + 1e-9),
  `worst rung is ${rung.worst.tech} at ${rung.worst.x.toFixed(3)}× (${rung.worst.sum} on a ${rung.worst.K} rung)`);
check("1.4/3 — the cap uses FLOOR, not round: rounding put `trade` one knowledge over its own ceiling",
  /Math\.floor\(u\.cost\.knowledge \* scale\)/.test(CODE),
  "2,917 against a 2,916 ceiling — a cap that fails its own test by one is worse than a cap a hair under");
check("1.4/3 — the cap scales a rung's discoveries PROPORTIONALLY, authored and generated alike",
  /var scale = ceiling \/ sum;/.test(CODE) &&
  /members\.forEach\(function \(u\) \{ u\.cost\.knowledge = Math\.floor/.test(CODE),
  "the objection is to the RUNG's total; an authored figure is as much a part of that total as a generated one");
check("1.4/3 — a rung already at or under the cap is left EXACTLY alone",
  /if \(sum <= ceiling\) return;/.test(CODE),
  "this is the whole argument against halving the divisor: it would cut the compliant rungs as hard as the offender");
// PASS CONDITION 4/5 — the figures the report must carry
check("1.4/5 — `ritesOfTargon` is the rung this Part exists to relieve, and it is now compliant",
  rung.rites && rung.rites.x <= 2.43 + 1e-9,
  `ritesOfTargon ${rung.rites.sum} on a ${rung.rites.K} rung = ${rung.rites.x.toFixed(2)}× (was 68,800 = 5.73×, 48% of the game's total)`);
check("1.4/5 — the whole-game discovery ratio is reported against the source's 0.50",
  rung.total / rung.totalTech < 0.50,
  `RR ${(rung.total / rung.totalTech).toFixed(4)} against the source's 0.470 (my re-run) / 0.50 (spec) — ` +
  `RR is at a SEVENTH of the source. Total discovery knowledge ${rung.total} across ${rung.carrying} of ${rung.setSize + 56} discoveries.`);
check("1.4 — the Kittens census is CITED at the site with the figures it was measured from",
  /workshop upgrades with a price list\s+143/.test(RAW) &&
  /per-upgrade science \/ its rung\s+median 0\.882/.test(RAW) &&
  /DISAGREEMENT, RECORDED PER PROJECT PRACTICE/.test(RAW),
  "the spec's 2.43 ships as specified; my own re-run puts the source's per-rung MEDIAN at 2.07 " +
  "and its MEAN at 2.41, so 2.43 is the mean — recorded rather than silently substituted");

// ============================================================================
// PART 2 — steel is iron (dev note 11)
// ============================================================================
const steel = await page.evaluate(() => {
  const g = id => BUILDINGS.find(b => b.id === id).caps || {};
  return { storehouse: g("storehouse"), warehouse: g("warehouse"), harbor: g("harbor") };
});
// PASS CONDITION 6
check("2/6 — the Storehouse GAINS a steel ceiling it has never had: 50, Kittens' barn `ironMax: 50`",
  steel.storehouse.steel === 50, JSON.stringify(steel.storehouse));
check("2/6 — ...and the rest of the Storehouse is UNMOVED — it was already an exact port of the barn",
  steel.storehouse.provisions === 5000 && steel.storehouse.timber === 200 &&
  steel.storehouse.ore === 250 && steel.storehouse.gold === 10 && steel.storehouse.mana === 100);
// PASS CONDITION 7
check("2/7 — the Warehouse falls 100 -> 25, Kittens' warehouse `ironMax: 25` = 0.50 × the barn",
  steel.warehouse.steel === 25,
  "x0.50 is the SAME ratio the source's warehouse takes on coal and gold; at 100 this building " +
  "was at 4× the source's relationship to the barn — the last surviving inversion");
check("2/7 — ...and the Warehouse's other three are UNCHANGED from v0.62's re-base",
  steel.warehouse.timber === 150 && steel.warehouse.ore === 200 && steel.warehouse.gold === 5);
check("2/7 — the HARBOR IS ASSERTED UNCHANGED at 150 — already exact parity with `ironMax: 150`",
  steel.harbor.steel === 150,
  "two of the three steel lines were corrections; this one was right before dev note 11 arrived, " +
  "so a future round tidying 'all three steel figures' trips this");
check("2 — the retired v0.62 argument (steel as RR's titanium) is CORRECTED IN PLACE, not deleted",
  /THAT ARGUMENT IS RETIRED BY DEV NOTE 11/.test(RAW) &&
  /Steel is NOT RR's titanium; it is RR's iron/.test(RAW));
// PASS CONDITION 8 — the instrument
check("2/8 — the pacing harness reports the ABSOLUTE steel ceiling, not only the fill fraction",
  /o\.cap\[rr\] = Math\.round\(withAll\[rr\] \|\| 0\)/.test(SIMCORE) &&
  /ceilings: /.test(PACING) && /storeCounts/.test(SIMCORE),
  "a ceiling that doubles while the stock doubles reads identically at 100%/100% — the fill " +
  "fraction cannot answer 'report the steel ceiling before and after'");

// ============================================================================
// PART 3 — the four government philosophies (dev notes 2, 3, 4, 5)
// ============================================================================
await reset();
const gov = await page.evaluate(() => {
  const g = POLICY_GROUPS.find(x => x.id === "government");
  const o = { costs: {}, descs: {} };
  g.options.forEach(x => { o.costs[x.id] = x.cost; o.descs[x.id] = x.desc; });
  const price0 = JSON.parse(JSON.stringify(craftCostOf("beam")));
  S.policies = {}; o.craftBase = policyMult("craft"); o.renownBase = policyMult("renown");
  o.villageBase = policyMult("village"); o.campBase = campYieldMult();
  S.policies = { piltoverConcord: true };
  const price1 = craftCostOf("beam");
  o.priceRatio = +(price1.timber / price0.timber).toFixed(6);
  o.craftOn = policyMult("craft"); o.craftCostMult = craftCostMult();
  S.policies = { demacianAccord: true };
  o.boost = { timber: policyBoost("timber"), ore: policyBoost("ore"),
              gold: policyBoost("gold"), provisions: policyBoost("provisions") };
  o.villageOn = policyMult("village");
  S.policies = { noxianDoctrine: true };
  o.renownOn = policyMult("renown"); o.campOn = campYieldMult();
  S.policies = {};
  o.consts = { POLICY_GOV_CULTURE, POLICY_PILTOVER_YIELD, POLICY_PILTOVER_COST,
               POLICY_DEMACIA_RATE, POLICY_NOXUS_RENOWN, POLICY_NOXUS_HUNT };
  o.demaciaScope = POLICY_DEMACIA_RES.slice();
  o.timberBounded = boostFamilyIsBounded("timber");
  o.oreBounded = boostFamilyIsBounded("ore");
  return o;
});
// PASS CONDITION 9
check("3.1/9 — Piltover Concord keeps craft yields +8%",
  gov.craftBase === 1 && gov.craftOn === 1.08 && gov.consts.POLICY_PILTOVER_YIELD === 1.08);
check("3.1/9 — ...and gains a -3.5% crafting-cost cut APPLIED TO PRICE, not to yield",
  Math.abs(gov.priceRatio - 0.965) < 1e-9 && gov.consts.POLICY_PILTOVER_COST === 0.965 &&
  /function policyCraftCostMult\(\)/.test(CODE) &&
  /craftCostMult\(\) \{ return \(leaderIs\("heimerdinger"\) \? HEIMER_CRAFT_COST : 1\) \* policyCraftCostMult\(\); \}/.test(CODE),
  `beam price × ${gov.priceRatio}; the cut enters test-v41's loop guard ONCE because it is on the price`);
check("3.1/9 — the tooltip states the RESOLVED PAIR, because a cost cut and a yield rise COMPOUND",
  /11\.9% more output per unit of input/.test(gov.descs.piltoverConcord),
  gov.descs.piltoverConcord);
// PASS CONDITION 10
check("3.2/10 — Demacian Accord is +8.5% on timber and ore",
  gov.boost.timber === 0.085 && gov.boost.ore === 0.085 && gov.consts.POLICY_DEMACIA_RATE === 0.085);
check("3.2/10 — ...and its SCOPE is stated: resource-keyed, and it reaches NOTHING else",
  gov.boost.gold === 0 && gov.boost.provisions === 0 &&
  JSON.stringify(gov.demaciaScope) === '["timber","ore"]');
check("3.2/10 — the retired VILLAGE-GROUP scope is gone and cannot silently return",
  gov.villageBase === 1 && gov.villageOn === 1 &&
  !/hasPolicy\("demacianAccord"\) \? 1\.06 : 1/.test(CODE));
check("3.2/10 — the ACCUMULATOR is named: it lands in `policyBoost()`, i.e. in `boosts`",
  /if \(hasPolicy\("demacianAccord"\) && POLICY_DEMACIA_RES\.indexOf\(res\) >= 0\) b \+= POLICY_DEMACIA_RATE;/.test(CODE));
// Part 7's immediate application, asserted here where the boost is added
check("3.2/10+19 — NEITHER timber NOR ore is a `BOOST_LIMIT` family, so the +8.5% is DELIVERED IN FULL",
  gov.timberBounded === false && gov.oreBounded === false,
  "against four families in BOOST_MEMBERS that discard 14%-82% of theirs — the asymmetry is " +
  "STATED rather than left for the reader to assume symmetry");
// PASS CONDITION 11
check("3.3/11 — Noxian Doctrine's renown multiplier falls 1.5 -> 1.33",
  gov.renownBase === 1 && gov.renownOn === 1.33 && gov.consts.POLICY_NOXUS_RENOWN === 1.33);
check("3.3/11 — ...and it gains a +7.5% hunt-yield term, ADDITIVE into the existing camp category",
  gov.campOn > gov.campBase && gov.consts.POLICY_NOXUS_HUNT === 0.075 &&
  /if \(hasPolicy\("noxianDoctrine"\)\) sum \+= POLICY_NOXUS_HUNT;/.test(CODE),
  `camp yield ${gov.campBase} -> ${gov.campOn}; §31 forbids a NEW multiplicative category until Jerry rules`);
// PASS CONDITION 12
check("3.4/12 — all three philosophies cost culture 10,000",
  gov.costs.demacianAccord.culture === 10000 && gov.costs.piltoverConcord.culture === 10000 &&
  gov.costs.noxianDoctrine.culture === 10000 && gov.consts.POLICY_GOV_CULTURE === 10000);
check("3.4/12 — the MATERIAL components stay: the note names culture only",
  gov.costs.demacianAccord.timber === 800 && gov.costs.demacianAccord.ore === 600 &&
  gov.costs.piltoverConcord.knowledge === 3000 && gov.costs.noxianDoctrine.steel === 250,
  "piltoverConcord's knowledge 3,000 now sits on the same resource as Part 1's discovery costs — " +
  "the report carries the combined knowledge burden rather than treating the two as unrelated");
check("3 — every philosophy description is GENERATED from the constant that delivers it",
  /desc: "Order, duty, and a well-kept ledger\. Timber and Ore production \+" \+\s*\n?\s*pctOf\(POLICY_DEMACIA_RATE\)/.test(CODE) ||
  /pctOf\(POLICY_DEMACIA_RATE\)/.test(CODE) && /pctOf\(POLICY_NOXUS_RENOWN - 1\)/.test(CODE) &&
  /pctOf\(POLICY_PILTOVER_YIELD - 1\)/.test(CODE),
  "this group carries five magnitudes across three options and would have been the next tooltip to drift");
check("3 — the magnitudes are declared ABOVE `POLICY_GROUPS` (operational rule 11)",
  CODE.indexOf("var POLICY_GOV_CULTURE") < CODE.indexOf("var POLICY_GROUPS = ["),
  "a `var` read inside an array literal but declared after it is `undefined` at that instant — " +
  "which is exactly this round's dev note 1");

// ============================================================================
// PART 4 — Jarvan's tooltips, and the guard that retires the class (dev note 6)
// ============================================================================
const jarvan = await page.evaluate(() => {
  const j = CHAMPS.find(c => c.id === "jarvan");
  return { lead: j.lead, passive: j.passive.desc, k: JARVAN_VILLAGE_LEAD, xp: JARVAN_XP_PASSIVE };
});
// PASS CONDITION 13
check("4/13 — Jarvan's lead string is GENERATED from `JARVAN_VILLAGE_LEAD`",
  jarvan.lead.includes("6%") && jarvan.k === 0.06 &&
  /lead: jarvanLeadDesc\(\),/.test(CODE) && /function jarvanLeadDesc\(\)/.test(CODE),
  jarvan.lead);
// Asserted against CODE, not RAW: the comment at the site QUOTES the retired string as the live
// reason the fix exists, and STANDING-RULINGS §8 says to strip comments before grepping source.
check("4/13 — the authored \"12%\" — wrong for two rounds against a shipped 0.06 — is GONE",
  !/every worker in the village produces 12% more/.test(CODE) &&
  /every worker in the village produces 12% more/.test(RAW),
  "gone from the code and KEPT in the comment, which is where the reason lives");
check("4/13 — ...and the WORDING reflects the all-job scope v0.62 Part 6a.1 shipped",
  /in every job/.test(jarvan.lead) && !/in the village/.test(jarvan.lead),
  "'in the village' described the retired three-job scope; the lead reaches all eight jobs");
check("4/13 — `JARVAN_VILLAGE_LEAD` is HOISTED above `var CHAMPS` (operational rule 11)",
  CODE.indexOf("var JARVAN_VILLAGE_LEAD = 0.06;") < CODE.indexOf("var CHAMPS = ["));
check("4/13 — Heimerdinger's inlined 0.85 is NAMED — the same latent defect, one champion over",
  /var HEIMER_CRAFT_COST     = 0\.85;/.test(CODE) && !/leaderIs\("heimerdinger"\) \? 0\.85 : 1/.test(CODE),
  "the guard below found it: the tooltip authored '15%' beside a bare literal");

// THE GENERAL GUARD — every percentage in a champion lead/passive must be produced by a constant
const guard = await page.evaluate(rawSrc => {
  // The authorised pool: every numeric literal declared as a champion/leader constant, plus every
  // `passive.base`. A percentage is authorised if it equals c, c×100, (c-1)×100 or (1-c)×100.
  const pool = [];
  const NAMES = /^(SHACO|LEONA|TWITCH|JARVAN|CAITLYN|SWAIN|BARD|POPPY|HEIMER|ZILEAN|TIMEWARP|TRADE_RENOWN|CHAMP|RENOWN)/;
  const decl = /var\s+([A-Z][A-Z0-9_]*)\s*=\s*(\[[^\]]*\]|-?\d+(?:\.\d+)?)\s*;/g;
  let m;
  while ((m = decl.exec(rawSrc))) {
    if (!NAMES.test(m[1])) continue;
    (m[2].match(/-?\d+(?:\.\d+)?/g) || []).forEach(v => pool.push(+v));
  }
  CHAMPS.forEach(c => { if (c.passive && typeof c.passive.base === "number") pool.push(c.passive.base); });
  const ok = p => pool.some(c => [c, c * 100, (c - 1) * 100, (1 - c) * 100].some(v => Math.abs(v - p) < 1e-6));
  const offenders = [];
  const scan = (id, kind, s) => {
    if (!s) return;
    (s.match(/(\d+(?:\.\d+)?)%/g) || []).forEach(t => {
      const p = parseFloat(t);
      if (!ok(p)) offenders.push(id + "." + kind + " = " + t);
    });
  };
  CHAMPS.forEach(c => { scan(c.id, "lead", c.lead); scan(c.id, "passive.desc", c.passive && c.passive.desc); });
  return { offenders, poolSize: pool.length };
}, RAW);
check("4/13 — NO CHAMPION `lead` OR `passive.desc` CARRIES A PERCENTAGE NO CONSTANT PRODUCES",
  guard.offenders.length === 0,
  guard.offenders.length ? guard.offenders.join("; ")
    : `19 percentages across 10 champions, all anchored (pool of ${guard.poolSize} constants). ` +
      `This is the third literal-drift defect in three rounds — v0.59's renown tooltips, v0.61's ` +
      `petriciteResonators, this — and the guard retires the class.`);
// ...and DEMONSTRATED to fail on a planted literal, which is the pass condition's own wording
const planted = await page.evaluate(() => {
  const j = CHAMPS.find(c => c.id === "jarvan"), keep = j.lead;
  j.lead = "Demacian Standard — every worker produces 37.3% more";
  const pool = [];
  CHAMPS.forEach(c => { if (c.passive && typeof c.passive.base === "number") pool.push(c.passive.base); });
  const ok = p => pool.some(c => [c, c * 100, (c - 1) * 100, (1 - c) * 100].some(v => Math.abs(v - p) < 1e-6));
  const caught = (j.lead.match(/(\d+(?:\.\d+)?)%/g) || []).some(t => !ok(parseFloat(t)));
  j.lead = keep;
  return { caught, restored: j.lead };
});
check("4/13 — ...and the guard is DEMONSTRATED to fail on a planted literal",
  planted.caught && planted.restored.includes("6%"),
  "a planted 37.3% is rejected and the real string is restored — a guard nobody has seen fail " +
  "is a guard nobody knows works");

// ============================================================================
// PART 5 — the three banners, ALL asserted by reading the canvas (pass condition 17)
// ============================================================================
// 5.1 the Targon halo — a VISIBILITY bug, not a missing feature
check("5.1/14 — the halo is NOT re-added: `drawSummitHalo` is the one from v0.62, still on `f * 0.17`",
  /drawSummitHalo/.test(CODE) && /Math\.sin\(f \* 0\.17\)/.test(CODE) &&
  (CODE.match(/drawSummitHalo/g) || []).length === 1,
  "dev note 7 says 'missing'; it has rendered every frame since v0.62 and could not be SEEN");
check("5.1/14 — the crescent is UNTOUCHED — position and radius both",
  /\}\)\(212, 26, 11\);/.test(CODE) && /drawCrescent\(mx, my, rad\)/.test(CODE));
check("5.1/14 — the square is still gone",
  !/px\(cx - 4, groundY - 28, 8, 4, PAL\.text\)/.test(CODE));
check("5.1/14 — the halo's RADIUS now EXCEEDS the peak's half-width — the ring clears the silhouette",
  /var TARGON_PEAK_HALFWIDTH = 15;/.test(CODE) && /var HALO_OUTER = 16, HALO_INNER = 12, HALO_ALPHA_FLOOR = 0\.45;/.test(CODE) &&
  /pixTriangle\(cx, groundY - 16, 30, 10, PAL\.goldBright\);/.test(CODE),
  "peak `pixTriangle(cx, groundY-16, 30, 10)` = half-width 15, apex at groundY-26 — the halo's " +
  "EXACT former centre, in the identical colour, at outer 9. Now 16 > 15.");
check("5.1/14 — ...and its COLOUR differs from the peak's: PAL.gold against PAL.goldBright",
  /px\(hx \+ dx, hy \+ dy, 1, 1, PAL\.gold\);/.test(CODE) &&
  !/px\(hx \+ dx, hy \+ dy, 1, 1, PAL\.goldBright\);/.test(CODE),
  "#C89B3C saturated gold against #F0E6D2 pale cream — and 'golden halo' is the note's own words");

// THE CANVAS READ. Never by grep, per v0.61 §3.
const banners = await page.evaluate(async () => {
  const sleep = ms => new Promise(r => setTimeout(r, ms));
  const grab = async (tab, which) => {
    updateSceneBanner("settlement"); updateSceneBanner(tab);
    await sleep(700);
    const c = document.getElementById(which === "spr" ? "scene-sprites" : "scene-canvas");
    const g = c.getContext("2d");
    return { d: g.getImageData(0, 0, c.width, c.height).data, w: c.width, h: c.height };
  };
  const rgb = h => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];
  const near = (img, c, tol) => { let n = 0;
    for (let i = 0; i < img.d.length; i += 4) {
      if (img.d[i + 3] < 8) continue;
      if (Math.abs(img.d[i] - c[0]) <= tol && Math.abs(img.d[i + 1] - c[1]) <= tol &&
          Math.abs(img.d[i + 2] - c[2]) <= tol) n++;
    } return n; };
  const o = {};
  // --- Targon: classify every pixel as PEAK-white or HALO-gold and measure their horizontal reach
  const tg = await grab("targon", "main");
  const at = (x, y) => { const i = 4 * (y * tg.w + x); return [tg.d[i], tg.d[i + 1], tg.d[i + 2]]; };
  let peakMaxDx = 0, haloMaxDx = 0, peakN = 0, haloN = 0, peakTop = 1e9;
  // SCOPED TO THE SUMMIT COLUMN. The crescent at (212, 26) is `PAL.goldBright` too, and so are
  // the stars — a whole-canvas scan for "near-white" measures those and reports the peak as
  // reaching ±108px. §8's own rule, one level up: check the instrument before reasoning from it.
  for (let y = 0; y < tg.h; y++) for (let x = 120 - 26; x <= 120 + 26; x++) {
    const q = at(x, y), dx = Math.abs(x - 120);
    const isPeak = Math.abs(q[0] - 240) < 14 && Math.abs(q[1] - 230) < 14 && Math.abs(q[2] - 210) < 14;
    // PAL.gold #C89B3C composited over the dark sky: R clearly above G clearly above B, mid-bright
    const isHalo = q[0] > q[1] + 18 && q[1] > q[2] + 8 && q[0] > 70 && q[0] < 235;
    if (isPeak) { peakN++; if (dx > peakMaxDx) peakMaxDx = dx; if (y < peakTop) peakTop = y; }
    if (isHalo) { haloN++; if (dx > haloMaxDx) haloMaxDx = dx; }
  }
  o.targon = { peakN, haloN, peakMaxDx, haloMaxDx, peakTop };
  // --- Cinders: hold -> read -> expire -> read
  S.cinderUntil = 0;                      const c0 = await grab("crafting", "main");
  S.cinderUntil = simNow() + 600000;      const c1 = await grab("crafting", "main");
  S.cinderUntil = 0;                      const c2 = await grab("crafting", "main");
  const EMB = rgb("#E8622D");
  o.cinders = { off: near(c0, EMB, 40), on: near(c1, EMB, 40), expired: near(c2, EMB, 40) };
  // --- Insight: hold -> read -> expire -> read, on the SPRITE layer, which is the layer chosen
  S.insightUntil = 0;                     const l0 = await grab("lore", "spr");
  S.insightUntil = simNow() + 600000;     const l1 = await grab("lore", "spr");
  S.insightUntil = 0;                     const l2 = await grab("lore", "spr");
  const INS = rgb("#4FA8D8");
  o.insight = { off: near(l0, INS, 40), on: near(l1, INS, 40), expired: near(l2, INS, 40) };
  return o;
});
// PASS CONDITION 14 + 17 — READ FROM THE RENDERED PIXELS
check("5.1/14/17 — READ FROM THE CANVAS: the halo is DISTINGUISHABLE from the peak, on BOTH axes",
  banners.targon.haloN > 0 && banners.targon.peakN > 0 &&
  banners.targon.haloMaxDx > banners.targon.peakMaxDx,
  `halo reaches ±${banners.targon.haloMaxDx}px against the peak's ±${banners.targon.peakMaxDx}px, ` +
  `in a different colour (${banners.targon.haloN} gold px, ${banners.targon.peakN} cream px). ` +
  `At outer 9 in PAL.goldBright there was nothing to see — this is the assertion that makes ` +
  `"invisible again" a suite failure rather than a third dev note.`);
// 5.2 the Insight motes
check("5.2/15 — the mote COUNT and SIZE are raised, and the alpha floor with them",
  /var INSIGHT_MOTES = 9, INSIGHT_MOTE_SCALE = 2\.25, INSIGHT_ALPHA_FLOOR = 0\.45;/.test(CODE) &&
  /spriteCtx\.globalAlpha = INSIGHT_ALPHA_FLOOR \+ 0\.30/.test(CODE),
  "6 -> 9 motes (+50%), 1.5× -> 2.25× scale (area ×2.25), total lit area ×3.4, alpha floor 0.30 -> 0.45. " +
  "SIZE AND COUNT BEFORE ALPHA: alpha raises luminance, size and count raise legibility, and " +
  "'more prominent' is a legibility complaint.");
check("5.2/15 — the three new anchors DERIVE from the sprite geometry, like the first six",
  /\[leftX \+ sw \* 0\.5, shelfY \+ sh \* 0\.48\], \[rightX \+ sw \* 0\.5, shelfY \+ sh \* 0\.48\]/.test(CODE) &&
  !/\[\s*\d+\s*,\s*\d+\s*\]\s*\]\.slice\(0, INSIGHT_MOTES\)/.test(CODE));
check("5.2/15/17 — READ FROM THE CANVAS: hold -> read -> expire -> read on the SPRITE layer",
  banners.insight.off === 0 && banners.insight.on > 0 && banners.insight.expired === 0,
  `off ${banners.insight.off} px -> held ${banners.insight.on} px -> lapsed ${banners.insight.expired} px`);
// 5.3 the Cinders embers
check("5.3/16 — THE TWO RECTANGLES ARE DELETED, both of them, by their own footprints",
  !/px\(cx - 12, groundY - 10, 24, 8, CINDER_GLOW\)/.test(CODE) &&
  !/px\(cx \+ 1, groundY \+ hy - 6, 13, 9, CINDER_GLOW\)/.test(CODE),
  "a 24×8 and a 13×9 filled rectangle at alpha 0.10-0.22. The objection is to the SHAPE and no " +
  "alpha fixes a shape; a glow left underneath the embers is the same weirdness quieter.");
check("5.3/16 — embers replace them, on PER-MOTE phases so they never rise as one",
  /var CINDER_EMBERS = 10;/.test(CODE) &&
  /wrap\(f \* 0\.5 \+ e \* 2\.3, 24\) \/ 24/.test(CODE) &&
  /px\(ex, ey, 1\.5, 1\.5, CINDER_GLOW\)/.test(CODE),
  "10 embers, two sources — the forge bed and the MOVING hammer head — rising and fading on sin(pi*t)");
check("5.3/16 — the embers are drawn AFTER the anvil and hammer, so they float in FRONT",
  CODE.indexOf("px(cx + 3, groundY + hy - 4, 9, 5,") < CODE.indexOf("for (var e = 0; e < CINDER_EMBERS; e++)"),
  "the rectangles were drawn BEFORE the anvil and were partly occluded by the thing they lit");
check("5.3/16/17 — READ FROM THE CANVAS: hold -> read -> expire -> read",
  banners.cinders.off === 0 && banners.cinders.on > 0 && banners.cinders.expired === 0,
  `off ${banners.cinders.off} px -> held ${banners.cinders.on} px -> lapsed ${banners.cinders.expired} px`);
check("5/17 — all three banner states read the SAME buff expressions the rest of the file uses",
  /var cinderUp = simNow\(\) < S\.cinderUntil;/.test(CODE) &&
  /if \(simNow\(\) < S\.insightUntil\)/.test(CODE));

// ============================================================================
// PART 6 — the box event rate (dev note 10)
// ============================================================================
const box = await page.evaluate(() => {
  const o = { rate: {}, morale: {} };
  [1, 5, 20, 40, 100, 100000].forEach(n => o.rate[n] = +boxEventRate(n).toFixed(8));
  // the MORALE term must be UNCHANGED — the note is about the event, not the boxes
  [5, 20, 40].forEach(n => { const bd = {}; S.jackboxes = n; morale(bd); o.morale[n] = +(bd.box || 0).toFixed(6); });
  S.jackboxes = 0;
  o.consts = { BOX_EVENT_RATE, BOX_EVENT_LIMIT, MORALE_BOX_LIMIT, BOX_LOG_MIN_GAP_S };
  o.asymptote = BOX_EVENT_RATE * (5 + BOX_EVENT_LIMIT);
  return o;
});
// PASS CONDITION 18 — asserted at 5, 20 and 40 boxes, with the ceiling stated
check("6/18 — the box event rate is BOUNDED: it has a true asymptote at 0.0030/tick",
  box.rate[100000] < box.asymptote + 1e-9 && box.rate[100000] > box.asymptote * 0.999,
  `BOX_EVENT_RATE × (5 + BOX_EVENT_LIMIT) = ${box.asymptote} — the linear rate had NO ceiling and boxes are permanent`);
check("6/18 — the first FIVE boxes stay LINEAR, exactly as the morale term's own knee does",
  Math.abs(box.rate[1] - 0.0002) < 1e-9 && Math.abs(box.rate[5] - 0.0010) < 1e-9,
  "the whimsy is the point at low counts and that is the concession the morale term already makes");
check("6/18 — at 20 boxes: 0.0040 -> 0.0022, a 45% cut",
  Math.abs(box.rate[20] - 0.0022) < 1e-6,
  `${box.rate[20]}/tick. Was 20 × 0.0002 = 0.0040 = one event every 50 s ≈ 16 game-days, every one a chronicle line.`);
check("6/18 — at 40 boxes: 0.0080 -> 0.00256, a 68% cut, and the gap WIDENS with the count",
  Math.abs(box.rate[40] - 0.0025556) < 1e-5 && box.rate[40] / box.rate[20] < 1.3,
  `${box.rate[40]}/tick against a linear 0.0080 — the defect is that the old rate only ever went up`);
check("6/18 — it uses `strictDR`, THE SAME PRIMITIVE THE SAME BUILDING'S MORALE TERM ALREADY USED",
  /return BOX_EVENT_RATE \* \(Math\.min\(5, n\) \+ strictDR\(Math\.max\(0, n - 5\), BOX_EVENT_LIMIT\)\);/.test(CODE),
  "one effect of one building was capped and the other was not, in the same round — that is the defect");
// PASS CONDITION 18 — the morale term UNCHANGED
check("6/18 — THE MORALE TERM IS UNCHANGED: shape, constant and five-box knee all",
  /var box = 2 \* Math\.min\(5, boxN\) \+ strictDR\(2 \* Math\.max\(0, boxN - 5\), MORALE_BOX_LIMIT\);/.test(CODE) &&
  box.consts.MORALE_BOX_LIMIT === 20 && Math.abs(box.morale[5] - 10) < 1e-6,
  `morale box term: 5 boxes ${box.morale[5]}, 20 ${box.morale[20]}, 40 ${box.morale[40]} — ` +
  `this Part must not read as re-tuning the boxes`);
// the batching rule
check("6/18 — the chronicle line is rate-limited INDEPENDENTLY of the event",
  /function boxLogAllow\(\)/.test(CODE) && /function boxLogFlush\(\)/.test(CODE) &&
  box.consts.BOX_LOG_MIN_GAP_S === 300,
  "halving a rate is not the same thing as fixing a log — same fix as v0.59.1 note 5's bulk hunts");
check("6/18 — ...and the EFFECT still fires unconditionally: only the LINE is suppressed",
  /S\.res\[r\] -= amt;\s*\n\s*\/\/ v0\.63 Part 6[\s\S]{0,120}if \(!boxLogAllow\(\)\) return;/.test(RAW) &&
  /gain\(r, amt\);\s*\n\s*if \(!boxLogAllow\(\)\) return;/.test(RAW),
  "the mischief still steals and the treat still pays; the player loses sixty rows, not the information");
const batched = await page.evaluate(() => {
  // drive the suppressor directly: the first line passes, the next N are tallied, and the tally
  // is emitted on the next line past the gap.
  S.log = []; boxLogLast = -1e9; boxLogSuppressed = 0;
  const first = boxLogAllow();                       // passes, stamps the clock
  const nextTen = [];
  for (let i = 0; i < 10; i++) nextTen.push(boxLogAllow());   // all suppressed, all tallied
  const tally = boxLogSuppressed;
  boxLogLast = -1e9;                                  // the gap has now elapsed
  const after = boxLogAllow();
  boxLogFlush();
  const line = S.log.length ? S.log[0].text : "";
  boxLogLast = -1e9; boxLogSuppressed = 0; S.log = [];
  return { first, suppressed: nextTen.every(x => x === false), tally, after, line };
});
check("6/18 — the batch is DEMONSTRATED: 1 line, 10 tallied, then one summary line carrying the count",
  batched.first === true && batched.suppressed && batched.tally === 10 && batched.after === true &&
  /10 more mischiefs and treats/.test(batched.line),
  batched.line);

// ============================================================================
// PART 7 — the add-a-boost rule (builder note 4)
// ============================================================================
const boosts = await page.evaluate(() => ({
  live: boostSigmaLive(), record: BOOST_SIGMA_OF_RECORD, limits: BOOST_LIMIT,
  bounded: { timber: boostFamilyIsBounded("timber"), ore: boostFamilyIsBounded("ore"),
             vigor: boostFamilyIsBounded("vigor"), knowledge: boostFamilyIsBounded("knowledge") },
  members: BOOST_MEMBERS.length
}));
// PASS CONDITION 19
check("7/19 — NO `BOOST_LIMIT` VALUE MOVED: seven keys, and `knowledge` is still deliberately absent",
  JSON.stringify(boosts.limits) === JSON.stringify({ devotion: 2, culture: 2, gold: 1.5, vigor: 1,
                                                     crystals: 2, provisions: 1.5, mana: 1 }) &&
  boosts.bounded.knowledge === false,
  "raising four caps in a round that already overshot would be reckless, and §16 makes magnitudes Jerry's");
check("7/19 — THE ADD-A-BOOST RULE SHIPS AS A TEST: the live Σ per family matches the round's record",
  JSON.stringify(boosts.live) === JSON.stringify(boosts.record),
  `Σ of record ${JSON.stringify(boosts.record)} across ${boosts.members} members. A future round ` +
  `that adds or re-sizes a member CANNOT make this pass without editing BOOST_SIGMA_OF_RECORD — ` +
  `and that edit is the moment the report must carry that family's before/after DELIVERED value.`);
check("7/19 — the obligation is stated at the site, not only in a build report",
  /no boost may be added or\s*(?:\/\/\s*)?re-sized without its marginal delivery quoted first/.test(RAW) &&
  /the static\s*(?:\/\/\s*)?probe is not the instrument; the end-of-run audit is/.test(RAW),
  "v0.62's end-of-run audit found FOUR families past the knee where a maxed static probe predicted two");
check("7/19 — `boostDeliveryLine()` still computes the marginal delivery at render time",
  /function boostDeliveryLine\(id\)/.test(CODE) && /var dl = boostDeliveryLine\(u\.id\);/.test(CODE));
check("7/19 — the end-of-run knee audit prints ALL SEVEN families",
  /BOOST KNEE AUDIT/.test(PACING) && /boostKneeFrom/.test(CODE) &&
  /rates\._knee = boostKneeFrom\(boostsRaw, boosts\)/.test(CODE));
// operational rule 12, broken at v0.62 by its own author — asserted again
check("7 — operational rule 12 holds: `computeRates()` with no argument returns NUMBERS ONLY",
  await page.evaluate(() => Object.values(computeRates()).every(v => typeof v === "number" && Number.isFinite(v))) &&
  /if \(bdRes\) \{ rates\._boosts = boosts; rates\._boostsRaw = boostsRaw; rates\._knee = boostKneeFrom/.test(CODE));

// ============================================================================
// PART 8.2 — the crystal sink, keyed to the STOCK's fill (builder note 2)
// ============================================================================
const sink = await page.evaluate(() => ({
  curve: [0, 0.25, 0.5, 0.6, 0.74, 0.85, 0.98, 1.0].map(f => [f, +crystalSinkMultAt(f).toFixed(4)]),
  trigger: crystalSinkTrigger(),
  consts: { CRYSTAL_SINK_BASE, CRYSTAL_SINK_FLOOR, CRYSTAL_SINK_MAX, AUTOMATION_BASE,
            MANUFACTORY_FUEL, MANUFACTORY_FUEL_CUT },
  ratesFinite: Object.values(computeRates()).every(Number.isFinite)
}));
// PASS CONDITION 21
check("8.2/21 — `MANUFACTORY_FUEL`'s FLAT VALUE IS UNCHANGED at 0.024",
  sink.consts.MANUFACTORY_FUEL === 0.024 && /var MANUFACTORY_FUEL = 0\.024;/.test(CODE),
  "the source's own per-copy figure (calciner oilPerTickCon -0.024 against oilWell 0.02). " +
  "FOUR rounds raised it and none of them moved the stock; a fifth was not going to.");
// PASS CONDITION 20 — the shape, which is what this Part can assert without a 2,500-year run
check("8.2/20 — the sink is keyed to the STOCK'S FILL, not to gross",
  /inAmt \*= convMult \* \(1 \+ \(boosts\.crystals \|\| 0\)\) \* crystalSinkFillMult\(\);/.test(CODE) &&
  /var cap = computeCaps\(\)\.crystals;/.test(CODE),
  "a drain expressed as a share of the FAUCET cannot empty a STOCK that has been full for 2,500 " +
  "years — 27 Refineries deliver 14.69/s gross against a 4.57/s drain and the stock still fills");
check("8.2/20 — it uses the `AUTOMATION_BASE` idiom, with the SAME 2% that sets that trigger",
  sink.consts.CRYSTAL_SINK_BASE === AUTOMATION_BASE_EXPECTED() && sink.trigger === 0.98 &&
  /function crystalSinkTrigger\(\) \{ return 1 - CRYSTAL_SINK_BASE; \}/.test(CODE),
  `trigger ${sink.trigger} — Kittens js/buildings.js:1309 \`value >= maxValue * (1 - 0.02)\``);
function AUTOMATION_BASE_EXPECTED() { return 0.02; }
check("8.2/20 — BELOW half fill this Part is INERT: the v0.62 footing is returned exactly",
  sink.curve[0][1] === 1 && sink.curve[1][1] === 1 && sink.curve[2][1] === 1,
  JSON.stringify(sink.curve));
check("8.2/20 — ...and it RAMPS toward the ceiling, so the sink SELF-REGULATES",
  sink.curve[3][1] > 1 && sink.curve[6][1] === 8 && sink.curve[7][1] === 8 &&
  sink.curve.every((p, i) => i === 0 || p[1] >= sink.curve[i - 1][1]),
  "monotone in fill: burn harder near the ceiling, lighter away from it. If the drain overshoots, " +
  "fill falls, the multiplier falls with it and the stock recovers — a negative feedback loop " +
  "with a fixed point wherever net flow is zero, instead of a magnitude wrong everywhere but one point.");
check("8.2/20 — no fill-keyed burn can drive the resource negative — the tick loop clamps at 0",
  /S\.res\[r\] = Math\.max\(0, S\.res\[r\] \+ rates\[r\] \* dt\);/.test(CODE) && sink.ratesFinite);
check("8.2/20 — v0.62 Part 7's faucet-side scaling is KEPT, not replaced",
  /inAmt \*= convMult \* \(1 \+ \(boosts\.crystals \|\| 0\)\)/.test(CODE) &&
  /A PRIMARY SINK IS PUT ON THE SAME FOOTING AS THE FAUCET IT DRAINS/.test(RAW),
  "it worked — 6.9% -> 28.9% of gross, ×4.2 — and its target still failed. Both halves are load-bearing.");
check("8.2 — inputs stay FLAT everywhere else: the scaling is scoped to the fuel line alone",
  /SCOPED TO THE FUEL, NOT TO ALL INPUTS/.test(RAW) &&
  (CODE.match(/\* crystalSinkFillMult\(\);/g) || []).length === 1,
  "inputs-flat / outputs-multiplied is the SOURCE'S own asymmetry (Calciner, Smelter)");

// ============================================================================
// DEV NOTE 1 — the Automated Workshop's NaN%, and the guard that generalises it
// ============================================================================
const nan = await page.evaluate(() => {
  const bad = [];
  const scan = (kind, arr) => (arr || []).forEach(x => {
    ["effect", "lore", "desc", "name"].forEach(k => {
      const s = x[k];
      if (typeof s === "string" && /(NaN|undefined|Infinity)/.test(s)) bad.push(kind + " " + x.id + "." + k + ": " + s);
    });
  });
  scan("upgrade", UPGRADES); scan("tech", TECHS); scan("building", BUILDINGS); scan("craft", CRAFTS);
  scan("wtech", typeof WTECHS !== "undefined" ? WTECHS : []);
  POLICY_GROUPS.forEach(g => g.options.forEach(o => {
    if (/(NaN|undefined|Infinity)/.test(o.desc || "")) bad.push("policy " + o.id + ".desc: " + o.desc);
  }));
  CHAMPS.forEach(c => {
    [c.lead, c.flavor, c.skill, c.passive && c.passive.desc].forEach((s, i) => {
      if (typeof s === "string" && /(NaN|undefined|Infinity)/.test(s)) bad.push("champ " + c.id + "[" + i + "]: " + s);
    });
  });
  // The QUIETER half of the same defect: a NUMBER read from a not-yet-declared `var` inside an
  // array literal is `undefined`, and `MANUFACTORY_FUEL` was exactly that at the Manufactory's
  // `convert.input.crystals` — invisible because computeRates() rewrites the field every call.
  const numBad = [];
  BUILDINGS.forEach(b => {
    ["cost", "prod", "caps"].forEach(k => { for (const r in (b[k] || {}))
      if (!Number.isFinite(b[k][r])) numBad.push("building " + b.id + "." + k + "." + r); });
    if (b.convert) ["input", "output"].forEach(k => { for (const r in (b.convert[k] || {}))
      if (!Number.isFinite(b.convert[k][r])) numBad.push("building " + b.id + ".convert." + k + "." + r); });
    if (b.ratio !== undefined && !Number.isFinite(b.ratio)) numBad.push("building " + b.id + ".ratio");
  });
  [["upgrade", UPGRADES], ["tech", TECHS], ["craft", CRAFTS]].forEach(([kind, arr]) =>
    (arr || []).forEach(x => { for (const r in (x.cost || {}))
      if (!Number.isFinite(x.cost[r])) numBad.push(kind + " " + x.id + ".cost." + r); }));
  const aw = UPGRADES.find(u => u.id === "automatedWorkshop");
  return { bad, numBad, aw: aw.effect, base: AUTOMATION_BASE, cap: AUTOMATION_CAP, trigger: automationTrigger() };
});
check("dev note 1 — the Automated Workshop's tooltip reads its three real figures",
  /stands at 98% of its ceiling/.test(nan.aw) && /2% of the pile per copy/.test(nan.aw) &&
  /to a 90% ceiling/.test(nan.aw), nan.aw);
check("dev note 1 — the cause was OPERATIONAL RULE 11 for the third time: the constants are HOISTED",
  CODE.indexOf("var AUTOMATION_BASE = 0.02;") < CODE.indexOf("var UPGRADES = [") &&
  CODE.indexOf("function automationTrigger()") < CODE.indexOf("var UPGRADES = ["),
  "`1 - undefined` is NaN and Math.round(NaN*100) is NaN. The two earlier instances CRASHED THE " +
  "PAGE and were caught the same day; this one produced a valid string containing three NaNs, so " +
  "nothing threw, no suite failed, and it took a player looking at the tooltip to find it.");
check("dev note 1 — THE GUARD: no generated string anywhere carries NaN / undefined / Infinity",
  nan.bad.length === 0,
  nan.bad.length ? nan.bad.join(" | ")
    : "UPGRADES, TECHS, BUILDINGS, CRAFTS, WTECHS, POLICY_GROUPS and CHAMPS all scanned — a " +
      "load-order defect in ANY generated string now fails a suite instead of shipping. " +
      "IT FOUND TWO MORE ON ITS FIRST RUN: pressureRegulators 'burn NaN% less' and rollingPress " +
      "'prints undefined parchment/second', neither of which anyone had reported.");
check("dev note 1 — ...and the QUIETER half: no cost, prod, cap or convert field is non-finite at load",
  nan.numBad.length === 0,
  nan.numBad.length ? nan.numBad.join(" | ")
    : "`MANUFACTORY_FUEL` was read inside the BUILDINGS literal at the Manufactory's " +
      "convert.input.crystals and was `undefined` there — invisible, because computeRates() " +
      "rewrites that field from state every call. A defect that repairs itself on the first " +
      "tick is a defect nobody can see, and no string guard would have found it.");
check("dev note 1 — all four Manufactory/automation constants are hoisted above the arrays that read them",
  CODE.indexOf("var MANUFACTORY_FUEL = 0.024;") < CODE.indexOf("var BUILDINGS = [") &&
  CODE.indexOf("var MANUFACTORY_FUEL_CUT = 0.5;") < CODE.indexOf("var BUILDINGS = [") &&
  CODE.indexOf("var MANUFACTORY_PARCHMENT = 0.005;") < CODE.indexOf("var BUILDINGS = [") &&
  (CODE.match(/var MANUFACTORY_FUEL = /g) || []).length === 1 &&
  (CODE.match(/var MANUFACTORY_PARCHMENT = /g) || []).length === 1,
  "hoisted once, not duplicated — a second declaration would shadow nothing and confuse everything");

// ============================================================================
// PASS CONDITION 22 — the things that must NOT have moved
// ============================================================================
const unchanged = await page.evaluate(() => {
  const fams = {}; for (const r in RES) if (RES[r].baseCap !== undefined) fams[capFamilyOf(r)] = 1;
  return {
    capFamilies: Object.keys(fams).sort(),
    barnSum: +BARN_LINE.reduce((a, u) => a + u[1], 0).toFixed(4),
    warehouseSum: +WAREHOUSE_LINE.reduce((a, u) => a + u[1], 0).toFixed(4),
    consumption: CONSUMPTION, xp: XP_PER_SECOND,
    convDisc: +CONV_DISCOVERY_LINE.reduce((a, u) => a + u[1], 0).toFixed(4),
    ranks: RANKS.length
  };
});
check("22 — `capFamilyOf()` still resolves to TWO families over the capped resources",
  unchanged.capFamilies.length === 2, unchanged.capFamilies.join(", "));
check("22 — the storage sums are UNMOVED at Σ 4.35 / 1.80 (STANDING-RULINGS §19)",
  unchanged.barnSum === 4.35 && unchanged.warehouseSum === 1.80);
check("22 — `CONSUMPTION` is unmoved at 4.25 and `XP_PER_SECOND` at 0.05",
  unchanged.consumption === 4.25 && unchanged.xp === 0.05);
check("22 — the rank ladder is unmoved",
  unchanged.ranks === 9, `${unchanged.ranks} ranks`);
check("22 — §31 is STILL OPEN and no new multiplicative category was added this round",
  unchanged.convDisc === 0.65 &&
  /if \(hasPolicy\("noxianDoctrine"\)\) sum \+= POLICY_NOXUS_HUNT;/.test(CODE) &&
  /if \(hasPolicy\("demacianAccord"\) && POLICY_DEMACIA_RES\.indexOf\(res\) >= 0\) b \+= POLICY_DEMACIA_RATE;/.test(CODE),
  "both of Part 3's new production terms land in EXISTING additive accumulators — the camp " +
  "category and the boosts table — exactly as v0.61 Part 8's fourth mana rung did");

// ============================================================================
// PASS CONDITION 1 — the round's gate. The apparatus, asserted here; the FIGURES in the report.
// ============================================================================
check("1 — the ensemble instrument emits Icathia per seed, so the gate is machine-readable",
  /icathia/.test(PACING) && /--seeds/.test(PACING) && /MEDIAN SEED/.test(PACING));
check("1 — the VERSION constant is bumped",
  await page.evaluate(() => VERSION) === "v0.63");

check("no console errors across the whole suite", errors.length === 0, errors.join(" | "));
console.log(`\n${pass} passed, ${fail} failed`);
suiteEnd(import.meta.url, pass, fail);
await browser.close();
process.exit(fail ? 1 : 0);
