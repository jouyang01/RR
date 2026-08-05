// v0.52 Part 3.2 — size the Shimmer Refinery recost by measurement, not by feel.
// Compares the Refinery's shimmer/s per raw invested against the Sump Crawl's shimmer
// per expedition INCLUDING its vigor cost, at Deep Works and at Icathia.
import { chromium } from "playwright";
const browser = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium" }).catch(() => chromium.launch());
const page = await browser.newPage();
await page.goto(new URL("../index.html", import.meta.url).href);
await page.waitForTimeout(500);

const out = await page.evaluate(() => {
  // recursive expansion of any cost to RAW resources (anything with no craft recipe)
  const byOut = {}; CRAFTS.forEach(c => byOut[c.out] = c);
  function raw(cost, depth) {
    depth = depth || 0; const o = {};
    if (depth > 12) return o;
    for (const k in cost) {
      const c = byOut[k];
      if (!c) { o[k] = (o[k] || 0) + cost[k]; continue; }
      const per = c.amount || 1;           // units produced per craft action
      const scale = cost[k] / per;
      const sub = raw(c.cost, depth + 1);
      for (const j in sub) o[j] = (o[j] || 0) + sub[j] * scale;
    }
    return o;
  }
  const ref = BUILDINGS.find(b => b.id === "shimmerRefinery");
  const crawl = EXPEDITIONS.find(e => e.id === "sumpCrawl");
  const yearSec = TICKS_PER_DAY * DAYS_PER_SEASON * 4 * TICK_MS / 1000;
  return {
    refCost: ref.cost, refRaw: raw(ref.cost), refRatio: ref.ratio,
    refConvert: ref.convert, refCap: ref.caps,
    crawlCost: crawl.cost,
    yearSec,
    craftAmounts: CRAFTS.filter(c => ["plating","alloy","gear","steel","hexcrete","scaffold"].includes(c.out))
      .map(c => ({ out: c.out, amount: c.amount, cost: c.cost }))
  };
});
console.log(JSON.stringify(out, null, 1));

// ---- the arithmetic, outside the page ----
const YEAR = out.yearSec;                                  // seconds per game-year
// v0.53 Part 5.3. campYieldMult was HARDCODED at 6.27 from a run log. The shipped v0.52
// run's final state reports 6.35, so the v0.52 Refinery recost was sized on a figure that
// had already gone stale by 1.3% — silently, which is the whole objection. The figures are
// now read from a live run and only fall back to the logged constants if one is not
// supplied, with the fallback announced rather than assumed.
//   --camp <x>            campYieldMult, from the pacing run's FINAL block
//   --vigor-deep <x> --vigor-icathia <x>   vigor per game-year at each milestone
const argNum = (flag, dflt) => {
  const i = process.argv.indexOf(flag);
  return i >= 0 && process.argv[i + 1] !== undefined ? +process.argv[i + 1] : dflt;
};
const STALE_CAMP = 6.27, STALE_DEEP = 15235.4, STALE_ICATHIA = 27464.2;
const M_LIVE = argNum("--camp", null);
const M_ICATHIA = M_LIVE ?? STALE_CAMP, M_DEEPWORKS = M_LIVE ?? STALE_CAMP;
if (M_LIVE === null) console.log(`\n!! campYieldMult NOT SUPPLIED — falling back to the v0.52 log figure ${STALE_CAMP}.` +
  `\n!! Pass --camp <value> from the run's FINAL block. (v0.53 Part 5.3)`);
else console.log(`\ncampYieldMult read live: ${M_LIVE}`);
const crawlShimmer = m => 0.25 * 5 * m;                    // 25% chance, 3..7 uniform mean 5
const VIGOR_PER_YEAR = { deepWorks: argNum("--vigor-deep", STALE_DEEP),
                         icathia: argNum("--vigor-icathia", STALE_ICATHIA) };
for (const [k, v] of Object.entries(VIGOR_PER_YEAR)) {
  const crawls = v / out.crawlCost.vigor;
  const sh = crawls * crawlShimmer(k === "icathia" ? M_ICATHIA : M_DEEPWORKS);
  console.log(`\n${k}: vigor ${v}/game-year -> ${crawls.toFixed(1)} crawls -> ${sh.toFixed(1)} shimmer/game-year (all vigor spent on crawls)`);
  console.log(`  = ${(sh / YEAR).toFixed(4)} shimmer/s  |  one Refinery is 0.05 shimmer/s  |  ${(sh / YEAR / 0.05).toFixed(1)} Refineries to match`);
}
console.log(`\ngame-year = ${YEAR}s`);
await browser.close();
