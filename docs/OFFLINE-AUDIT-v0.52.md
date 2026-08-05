# OFFLINE PROGRESSION AUDIT — v0.52

**Asked: does the game run offline correctly? Measured, not read.** `test-offline-v52.mjs`, 20 checks.

**Short answer: the closed-tab path is correct — bit-identical to live play, and the cap holds to the tick. Two real defects sit around it, and one of them makes closing the tab strictly better than leaving it open.**

---

## 1. What is correct

| Check | Result |
|---|---|
| **Healthy settlement, 1 real hour away vs 18,000 live ticks** | **0.0000% drift on every resource and on population — bit-identical** |
| 6 h away credits 6 h of ticks | 108,000 / 108,000 ✅ |
| 12 h away credits 12 h | 216,000 / 216,000 ✅ |
| 48 h away credits only 12 h | 216,000 — the cap holds ✅ |
| 10 days away credits only 12 h | 216,000 ✅ |
| A festival running at save time **pays** during the replay, then expires | ✅ |
| Camp cooldowns set at save time have elapsed on return | ✅ |
| Seasons turn during catch-up | 19 seasons over 4.5 game-years ✅ |
| `SIM_NOW` restored to `null` afterwards, so live play is back on the real clock | ✅ |
| A gap under 3 game-days is ignored (Kittens' own UI-lag guard) | ✅ |
| `serialize()` stamps `lastSaved` on every save; `beforeunload` saves | ✅ |
| `applyOfflineProgress()` wired into the load path | ✅ |

The architecture is right: **there is one economy, not two.** `runCatchUp()` replays the game's own `step()` rather than a parallel "apply N seconds of production" shortcut, and `simNow()` makes every `Date.now()`-based deadline correct during the replay without changing the deadlines themselves. That is the hard part and it is done properly.

**One measured divergence, and it is in an edge case.** A *starving* settlement — negative provisions rate, stock at zero — loses **one fewer wanderer** offline than live (13 → 12 over an hour, 20 to start). Cause: catch-up integrates in 5-tick steps, so the moment provisions crosses zero lands up to 0.8 s later than live, and one pass of the starvation `while` loop is missed. Knock-on: knowledge differs by **0.04%**. It favours the player, it only appears while starving, and every other resource is identical to the digit. **Recorded, not a bug worth fixing.**

---

## 2. Defect 1 — the backgrounded tab silently loses ~80% of production

**This is the one that matters.**

```js
function tick() { step(TICK_MS / 1000, 1); }     // a FIXED 0.2 s, always
setInterval(tick, TICK_MS);
```

`tick()` never consults the wall clock. It assumes the interval fired on time. **Every browser throttles `setInterval` in a background tab** — typically to 1 Hz, and more aggressively after a few minutes.

**Measured:** ticks delivered at 1/second for 10 real seconds advanced **2,000 ms of game time — 20% of the real rate.**

`applyOfflineProgress()` cannot rescue this, because it only runs from `loadFromString()` and the page never reloads. Nothing else reconciles game time against the wall clock: the only `visibilitychange` listener in the file belongs to the v0.51 scene banner and just pauses its animation.

**The consequence is a perverse incentive.** A player who *closes* the tab gets full credit up to 12 hours. A player who leaves it open in a background window gets roughly a fifth of that and is never told. Closing the game is the optimal play.

**The fix is small and lives entirely in the live loop** — hold a `lastTickMs`, compute the real elapsed time each tick, and feed the true `dt` (clamped to the same 12-hour cap) into `step()`. `simNow()`, `probOver()` and the multi-tick `while` loops already handle a large `dt` correctly, because `runCatchUp()` has been exercising exactly that path since v0.47. A `visibilitychange` handler that runs the same reconciliation on foreground would cover the throttle-to-zero case.

---

## 3. Defect 2 — `runCatchUpChunked()` is dead code, and the report says otherwise

`runCatchUpChunked()` is defined, complete, and **never called from anywhere.** `applyOfflineProgress()` calls the blocking `runCatchUp()`. `#catchup-banner` sits in the DOM at line 214 and is never shown.

**Measured: a full 12-hour catch-up blocks the main thread for 2,775 ms** (54 game-years). Not fatal, but it is 2.8 seconds of a frozen, blank-looking tab on the exact load where the player is most likely to think something broke.

**The v0.47 build report states this feature ships chunked:**

> *"…chunked at ~500 game-days per frame with a progress indicator."*

**That is not what ships.** The chunking function was written and never wired up, and the claim has been carried in the record since v0.47 unchallenged — including by me, in the v0.52 handoff, which listed offline progression among the things that work without my having checked this. **Fixing it is one line:** call `runCatchUpChunked(capped, S.lastSaved, done => …)` in place of the blocking call and move the log line into the callback.

---

## 4. Verdict

**Offline progression is implemented the right way and wired up wrong at the edges.** The replay engine is correct and provably so. What is missing is the *other* half of "running offline" — the tab that stays open — plus the progress UI that was built and never connected.

Neither defect was introduced by v0.52; both predate it. Neither is covered by any of the 20 live suites. `test-offline-v52.mjs` is the 21st.
