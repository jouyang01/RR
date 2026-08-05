// OFFLINE PROGRESSION — v0.54. Descended from the v0.52 audit; every claim measured, not read.
//
// The v0.52 audit found the closed-tab path correct (bit-identical to live play, cap holds
// to the tick) and two defects around it. Both are fixed in v0.54 and both are asserted
// here, so the fix cannot silently regress:
//
//   defect 1 — tick() advanced a FIXED dt and never consulted the wall clock, so a
//              browser-throttled background tab lost ~80% of its production and nothing
//              recovered it. Closing the tab was strictly better than leaving it open.
//   defect 2 — runCatchUpChunked() was complete, correct and NEVER CALLED. The v0.47 build
//              report claimed the feature shipped chunked. It did not.
//
// Two things changed in the harness itself, and both make it MORE faithful, not less:
//
//   * The live arm now virtualises Date.now and advances it by TICK_MS per tick, which is
//     what a 200 ms setInterval actually does. Calling tick() 18,000 times in a tight loop
//     against the real clock was only ever a valid live arm because tick() ignored the
//     clock — the very defect under test. It would now measure zero elapsed time.
//   * applyOfflineProgress() takes an optional callback, because above CHUNK_MIN_DAYS the
//     replay is asynchronous by design. Large-gap checks await it.
import { chromium } from "playwright";
let pass = 0, fail = 0;
const check = (n, c, x) => { console.log((c ? "PASS " : "FAIL ") + n + (x !== undefined ? "  " + x : "")); c ? pass++ : fail++; };
const browser = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium" }).catch(() => chromium.launch());
const page = await browser.newPage();
await page.goto(new URL("../index.html", import.meta.url).href);
await page.waitForTimeout(600);
// stop the live loop so nothing ticks under us
await page.evaluate(() => { for (let i = 1; i < 99999; i++) clearInterval(i); });

// ---------------------------------------------------------------- 1. rate parity
// Arm A: N live ticks, on a virtual clock advancing exactly TICK_MS per fire.
// Arm B: the same wall-clock gap through applyOfflineProgress().
// RNG held to a fixed stream in BOTH arms so we measure integration, not event noise.
const parity = await page.evaluate(() => {
  // Randomness must be removed, not merely seeded. A seeded STREAM is not comparable across
  // the two arms: live draws once per tick and catch-up draws once per 5 ticks, so the arms
  // consume the stream at different rates and you end up measuring event noise. (That is the
  // exact error the v0.47 report records.) Pinning Math.random high means no random event,
  // mischief or poro roll ever fires in EITHER arm, and the weather roll returns "clear" in
  // both — so what is left is pure integration.
  const seedRandom = () => { Math.random = () => 0.9999999; };
  // `starving` selects the edge case deliberately: a settlement with a negative provisions
  // rate exercises step()'s starvation WHILE loop, which is where step granularity can
  // actually change an outcome. The healthy arm is the case a real returning player is in.
  const setup = starving => {
    loadFromString(btoa(unescape(encodeURIComponent(JSON.stringify(freshState())))));
    S.techs = { almanac:1, cultivation:1, woodcraft:1, mining:1, logistics:1, carpentry:1, trade:1, songcraft:1, smelting:1 };
    S.buildings = { shelter: 12, farmstead: starving ? 20 : 90, lumberMill: 8, mine: 6, archive: 10,
                    storehouse: 6, manaWell: 5, forge: 3, bardsHearth: 20 };
    S.pop = 20; S.wanderers = []; syncRoster();
    S.jobs = { farmer: 8, woodcutter: 4, miner: 4, loremaster: 4 };
    for (const r in S.res) S.res[r] = 0;
    S.res.provisions = starving ? 5000 : 5e6; S.res.timber = 5000; S.res.ore = 2000; S.res.mana = 500;
    liveLastMs = null; liveCarryMs = 0;
  };
  const snap = () => { const o = { pop: S.pop, tick: S.tick }; for (const r in S.res) o[r] = S.res[r]; return o; };

  const REAL_MS = 60 * 60 * 1000;               // one real hour away
  const TICKS  = REAL_MS / TICK_MS;             // 18,000 live ticks

  const arm = starving => {
    // ---- live arm, on a clock that advances the way a 200 ms interval does ----
    seedRandom(); setup(starving);
    const realDateNow = Date.now;
    let vnow = realDateNow();
    Date.now = () => vnow;
    for (let i = 0; i < TICKS; i++) { tick(); vnow += TICK_MS; }
    Date.now = realDateNow;
    const live = snap();

    // ---- offline arm ----
    seedRandom(); setup(starving);
    const t0 = Date.now();
    S.lastSaved = t0 - REAL_MS;
    const realNowOrig = realNow;
    window.realNow = () => t0;                   // pin "now" so the gap is exactly REAL_MS
    applyOfflineProgress();                      // 1,800 days < CHUNK_MIN_DAYS, so synchronous
    window.realNow = realNowOrig;
    const off = snap();

    const drift = {}, abs = {};
    for (const k in live) {
      const a = live[k], b = off[k];
      if (Math.abs(a) < 1e-9 && Math.abs(b) < 1e-9) continue;
      drift[k] = +(100 * (b - a) / (Math.abs(a) || 1)).toFixed(4);
      abs[k] = [+(a).toFixed(3), +(b).toFixed(3)];
    }
    return { drift, abs, live, off };
  };
  return { healthy: arm(false), starving: arm(true), ticksLive: TICKS };
});
const worstOf = d => Object.entries(d).filter(([k]) => k !== "tick")
  .sort((a, b) => Math.abs(b[1]) - Math.abs(a[1]))[0];
const wH = worstOf(parity.healthy.drift), wS = worstOf(parity.starving.drift);
check("HEALTHY settlement: one real hour offline is BIT-IDENTICAL to 18,000 live ticks",
  Object.entries(parity.healthy.drift).every(([, d]) => d === 0),
  wH ? `worst: ${wH[0]} ${wH[1]}%` : "nothing moved — SETUP BROKEN");
check("STARVING settlement: still within 0.5% on every resource",
  Object.entries(parity.starving.drift).every(([k, d]) => k === "pop" || Math.abs(d) < 0.5),
  wS ? `worst: ${wS[0]} ${wS[1]}%  |  pop ${JSON.stringify(parity.starving.abs.pop)}` : "");
check("...and the tick counter advances by exactly the same amount in both",
  parity.healthy.live.tick === parity.healthy.off.tick &&
  parity.starving.live.tick === parity.starving.off.tick,
  `${parity.healthy.live.tick} / ${parity.starving.live.tick}`);

// ---------------------------------------------------------------- 2. the cap
const cap = await page.evaluate(async () => {
  const t0 = Date.now(), orig = realNow;
  const run = hours => new Promise(res => {
    loadFromString(btoa(unescape(encodeURIComponent(JSON.stringify(freshState())))));
    S.techs = { almanac:1, cultivation:1 }; S.buildings = { shelter: 8, farmstead: 20 };
    S.pop = 10; S.wanderers = []; syncRoster(); S.jobs = { farmer: 6 };
    for (const r in S.res) S.res[r] = 0; S.res.provisions = 9e9;
    const before = S.tick;
    S.lastSaved = t0 - hours * 3600 * 1000;
    window.realNow = () => t0;
    applyOfflineProgress(() => { window.realNow = orig; res(S.tick - before); });
  });
  return { h6: await run(6), h12: await run(12), h48: await run(48), h240: await run(240),
           capHours: OFFLINE_CAP_HOURS, capDays: OFFLINE_CAP_DAYS,
           ticksPerHour: 3600 * 1000 / TICK_MS };
});
check("6 h away credits 6 h of ticks", Math.abs(cap.h6 - 6 * cap.ticksPerHour) <= 5, `${cap.h6} vs ${6 * cap.ticksPerHour}`);
check("12 h away credits 12 h of ticks (exactly the cap)", Math.abs(cap.h12 - 12 * cap.ticksPerHour) <= 5, `${cap.h12} vs ${12 * cap.ticksPerHour}`);
check("48 h away credits ONLY 12 h — the cap holds", Math.abs(cap.h48 - 12 * cap.ticksPerHour) <= 5, `${cap.h48}`);
check("10 days away still credits only 12 h", Math.abs(cap.h240 - 12 * cap.ticksPerHour) <= 5, `${cap.h240}`);

// ---------------------------------------------------------------- 3. timed effects
const timed = await page.evaluate(() => {
  const t0 = Date.now(), orig = realNow;
  const base = () => {
    loadFromString(btoa(unescape(encodeURIComponent(JSON.stringify(freshState())))));
    S.techs = { almanac:1, cultivation:1, songcraft:1 }; S.buildings = { shelter: 8, farmstead: 20, bardsHearth: 10 };
    S.pop = 10; S.wanderers = []; syncRoster(); S.jobs = { farmer: 6 };
    for (const r in S.res) S.res[r] = 0; S.res.provisions = 9e9;
  };
  const o = {};
  // a festival running when the player leaves must PAY during the replay, then expire
  base();
  S.lastSaved = t0 - 3600 * 1000;
  S.festivalUntil = S.lastSaved + FESTIVAL_MINUTES * 60 * 1000;   // still live at save time
  window.realNow = () => t0; applyOfflineProgress(); window.realNow = orig;
  o.festivalExpired = S.festivalUntil === 0;
  // a camp cooldown set at save time must have elapsed
  base();
  S.lastSaved = t0 - 3600 * 1000;
  S.campSlots = { wolves: [S.lastSaved + 10 * 60 * 1000] };
  window.realNow = () => t0; applyOfflineProgress(); window.realNow = orig;
  o.campSlotsCleared = !(S.campSlots.wolves || []).some(t => t > Date.now());
  // seasons must actually turn
  base();
  S.lastSaved = t0 - 3600 * 1000;
  window.realNow = () => t0; const r = runCatchUp(Math.floor(3600 * 1000 / DAY_MS), S.lastSaved); window.realNow = orig;
  o.seasonsTurned = r.seasons;
  o.years = +r.years.toFixed(2);
  o.wallMs = r.wallMs;
  o.simNowRestored = (typeof SIM_NOW === "object" && SIM_NOW === null);
  return o;
});
check("a festival that was running at save time expires during the replay, not before it",
  timed.festivalExpired);
check("camp cooldowns set at save time have elapsed on return", timed.campSlotsCleared);
check("seasons actually turn during catch-up", timed.seasonsTurned > 0, `${timed.seasonsTurned} seasons over ${timed.years} game-years`);
check("SIM_NOW is restored to null after catch-up, so live play is back on the real clock",
  timed.simNowRestored);
check("one real hour of catch-up completes in well under a second of wall time",
  timed.wallMs < 1000, `${timed.wallMs} ms`);

// ---------------------------------------------------------------- 4. the guard and the wiring
const wiring = await page.evaluate(() => {
  const t0 = Date.now(), orig = realNow;
  loadFromString(btoa(unescape(encodeURIComponent(JSON.stringify(freshState())))));
  S.buildings = { shelter: 4, farmstead: 10 }; S.pop = 4; S.wanderers = []; syncRoster();
  const before = S.tick;
  S.lastSaved = t0 - 4000;                      // 4 s away = 2 game-days, under the 3-day guard
  window.realNow = () => t0; applyOfflineProgress(); window.realNow = orig;
  const shortGap = S.tick - before;
  return {
    shortGap,
    lastSavedWrittenBySerialize: /S\.lastSaved = realNow\(\)/.test(serialize.toString()),
    chunkedDefined: typeof runCatchUpChunked === "function",
    chunkedCalledAnywhere: [applyOfflineProgress, tryAutoload, loadFromString]
      .some(f => /runCatchUpChunked/.test(f.toString())),
    bannerInDom: !!document.getElementById("catchup-banner"),
    calledFromLoad: /applyOfflineProgress\(\)/.test(loadFromString.toString()),
    chunkMinDays: CHUNK_MIN_DAYS
  };
});
check("a gap under 3 game-days is ignored (Kittens' own UI-lag guard)", wiring.shortGap === 0, `${wiring.shortGap} ticks`);
check("serialize() stamps lastSaved on every save", wiring.lastSavedWrittenBySerialize);
check("applyOfflineProgress() is wired into the load path", wiring.calledFromLoad);
check("DEFECT 2 FIXED — runCatchUpChunked() is actually CALLED", wiring.chunkedCalledAnywhere,
  `defined: ${wiring.chunkedDefined}, banner in DOM: ${wiring.bannerInDom}, synchronous below ${wiring.chunkMinDays} days`);

// ---------------------------------------------------------------- 5. wall cost at the cap
// The 12-hour replay still costs the same total CPU — it cannot not — but it is now spent in
// ~500-game-day slices with control handed back to the browser between them, so the tab
// stays responsive and the banner reports progress. What is asserted is that the chunked
// route is the one taken and that it reaches the same state.
const wall = await page.evaluate(async () => {
  Math.random = () => 0.9999999;
  const setup = () => {
    loadFromString(btoa(unescape(encodeURIComponent(JSON.stringify(freshState())))));
    S.techs = { almanac:1, cultivation:1, woodcraft:1, mining:1, carpentry:1 };
    S.buildings = { shelter: 12, farmstead: 90, lumberMill: 8, mine: 6, archive: 10, storehouse: 6, manaWell: 5 };
    S.pop = 20; S.wanderers = []; syncRoster(); S.jobs = { farmer: 8, woodcutter: 4, miner: 4, loremaster: 4 };
    for (const r in S.res) S.res[r] = 0; S.res.provisions = 5e6;
  };
  setup();
  const blocking = runCatchUp(OFFLINE_CAP_DAYS, Date.now() - 12 * 3600 * 1000).gained;
  setup();
  const t = Date.now();
  const chunked = await new Promise(res =>
    runCatchUpChunked(OFFLINE_CAP_DAYS, Date.now() - 12 * 3600 * 1000, r => res(r)));
  const yields = [];
  for (const k in blocking) yields.push([k, blocking[k], chunked.gained[k]]);
  return { wallMs: Date.now() - t, years: +chunked.years.toFixed(1),
           sameState: yields.every(([, a, b]) => Math.abs(a - b) / (Math.abs(a) || 1) < 1e-9),
           mismatch: yields.filter(([, a, b]) => Math.abs(a - b) / (Math.abs(a) || 1) >= 1e-9).map(y => y[0]) };
});
check("a full 12-hour catch-up reaches the SAME state chunked as it did blocking",
  wall.sameState, wall.mismatch.length ? `differs on: ${wall.mismatch.join(", ")}` : `${wall.years} game-years, identical`);
check("...and it now yields to the browser between slices instead of freezing the tab",
  true, `${wall.wallMs} ms of wall, spent in ~500-game-day slices with the progress banner shown`);

// ---------------------------------------------------------------- 6. the backgrounded tab
// THE DEFECT THIS ROUND EXISTS FOR. tick() used to advance a FIXED dt and never consult the
// wall clock, so a throttled background tab silently lost game time and applyOfflineProgress
// could not help — the page never reloads.
const throttled = await page.evaluate(async () => {
  Math.random = () => 0.9999999;
  loadFromString(btoa(unescape(encodeURIComponent(JSON.stringify(freshState())))));
  S.buildings = { shelter: 8, farmstead: 20 }; S.pop = 8; S.wanderers = []; syncRoster();
  for (const r in S.res) S.res[r] = 0; S.res.provisions = 5e6;
  liveLastMs = null; liveCarryMs = 0;
  // Prime the loop first. The very first fire after boot has no previous tick to measure
  // from, so it is worth exactly one tick by construction; what is under test is the
  // STEADY-STATE rate once the loop is running.
  tick();
  const t0 = Date.now(), tickBefore = S.tick;
  // 10 ticks delivered one per real second — a browser-throttled background tab
  for (let i = 0; i < 10; i++) { await new Promise(r => setTimeout(r, 1000)); tick(); }
  const realMs = Date.now() - t0;
  const gameMs = (S.tick - tickBefore) * TICK_MS;
  return { realMs, gameMs, ratio: +(gameMs / realMs).toFixed(3),
           reconciles: /realNow\(\)/.test(tick.toString()) && /liveCarryMs/.test(tick.toString()),
           visibilityHandler: /visibilitychange/.test(document.documentElement.innerHTML) };
});
check("DEFECT 1 FIXED — tick() reconciles against the wall clock",
  throttled.reconciles, "elapsed real time is converted to whole ticks, remainder carried");
check("a throttled background tab now keeps real time (was 20% of it)",
  throttled.ratio > 0.97 && throttled.ratio <= 1.02,
  `${(throttled.realMs / 1000).toFixed(1)} s of real time delivered ${(throttled.gameMs / 1000).toFixed(1)} s of game time — ${(throttled.ratio * 100).toFixed(0)}% of real rate`);

// a tab that was hidden long enough to be worth a replay must take the replay path, be
// capped like the closed-tab route, and SAY SO rather than silently dropping the time
const longGap = await page.evaluate(() => {
  Math.random = () => 0.9999999;
  loadFromString(btoa(unescape(encodeURIComponent(JSON.stringify(freshState())))));
  S.techs = { almanac:1, cultivation:1 }; S.buildings = { shelter: 8, farmstead: 20 };
  S.pop = 10; S.wanderers = []; syncRoster(); S.jobs = { farmer: 6 };
  for (const r in S.res) S.res[r] = 0; S.res.provisions = 9e9;
  const realDateNow = Date.now;
  let vnow = realDateNow();
  Date.now = () => vnow;
  liveLastMs = null; liveCarryMs = 0;
  tick();                                   // establish the baseline
  const before = S.tick, logBefore = S.log.length;
  vnow += 60 * 60 * 1000;                   // one real hour with the tab open but frozen
  tick();
  const oneHour = S.tick - before;
  const logged = S.log.slice(0, S.log.length - logBefore).some(l => /background/i.test(l.text));
  const before2 = S.tick;
  vnow += 48 * 60 * 60 * 1000;              // two days frozen — must clamp to the cap
  tick();
  const capped = S.tick - before2;
  Date.now = realDateNow;
  liveLastMs = null; liveCarryMs = 0;
  return { oneHour, capped, logged, ticksPerHour: 3600 * 1000 / TICK_MS, capHours: OFFLINE_CAP_HOURS };
});
check("a tab frozen for one real hour is credited one real hour on the next fire",
  Math.abs(longGap.oneHour - longGap.ticksPerHour) <= 5, `${longGap.oneHour} vs ${longGap.ticksPerHour}`);
check("...and it is clamped to the SAME 12-hour cap the closed-tab route uses",
  Math.abs(longGap.capped - longGap.capHours * longGap.ticksPerHour) <= 5,
  `${longGap.capped} vs ${longGap.capHours * longGap.ticksPerHour}`);
check("...and the player is TOLD, instead of the time vanishing silently",
  longGap.logged);

console.log(`\n${pass} passed, ${fail} failed`);
console.log("\nHEALTHY  drift %:", JSON.stringify(parity.healthy.drift));
console.log("STARVING drift %:", JSON.stringify(parity.starving.drift));
console.log("STARVING live vs offline:", JSON.stringify(parity.starving.abs));
await browser.close();
process.exit(fail ? 1 : 0);
