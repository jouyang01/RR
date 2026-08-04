# BUILD REPORT v0.51 — Pixel Scene Banner

**Applied verbatim. All four anchors matched exactly. 911 assertions across 19 suites, 0 failures — the 895 economy assertions are unmoved to the digit.**

---

## 1. Anchors — checked before touching anything

The spec says: *"If any anchor text in §1–4 doesn't match your file verbatim, stop and diff rather than fuzzy-matching."* All four matched, each exactly once, and nothing named by the feature pre-existed:

| Anchor | Occurrences |
|---|---|
| §1 `@media (max-width: 700px) { header .subtitle { display: none; } }` | **1** |
| §2 `</header>\n<div id="calendar-bar"></div>` | **1** |
| §3 `function renderAll() { hideTooltip(); renderTabs();` | **1** |
| §4 the `// BOOT` header block | **1** |
| pre-existing `scene-banner` / `scene-canvas` / `updateSceneBanner` | **0 / 0 / 0** |

No fuzzy matching, no diffing needed. All four parts applied by exact string replacement.

---

## 2. The spec's own §5 verification, re-run against this build

The spec asks for this rather than trusting its own run. `test-banner-v51.mjs`, 16 assertions:

| Check | Result |
|---|---|
| Two canvases at 240×34, between `</header>` and `#calendar-bar`, **outside `#main`** | ✅ |
| `renderAll()` carries the guarded hook | ✅ |
| **All 8 scenes draw real content** (≥3 distinct colours each, `getImageData` on the backing canvas) | ✅ |
| **Zero console/page errors across all 8 scenes** | ✅ |
| Rest of the game untouched — `#resource-col`, `#tab-bar`, `#tab-content` all render | ✅ |
| Tab clicks still work **and v0.48's `tab-pop` still fires exactly once** alongside the banner | ✅ |
| **Animation advances** — two shots 900 ms apart differ | ✅ |
| **`prefers-reduced-motion: reduce` freezes it** — two shots 900 ms apart pixel-identical | ✅ |
| **380 px mobile**: no overflow, the 46 px height rule applies, no page errors | ✅ |
| **Sprite layer sized 1:1 to its own box** — backing 380×46 vs CSS 380×46, so hand-drawn art is never stretched | ✅ |
| **Five `renderAll()`s on the same tab do not restart the animation** | ✅ |
| The banner block reads **no game state at all** (comments stripped before grepping) | ✅ |
| Leaks exactly one global, `window.updateSceneBanner` | ✅ |
| Touches nothing in `computeRates` / `computeCaps` / `tick` / the save format | ✅ |
| The only edit to existing game code is **one** guarded line in `renderAll()` | ✅ |

Screenshots of all eight scenes plus the 380 px mobile shot are in `shots/banner-*.png`.

---

## 3. My errors

**Three of my own assertions were wrong before any of the code was.** All three were my test measuring its own setup:

1. **"five `renderAll()`s don't restart the animation"** — I drove the banner to `village` via `updateSceneBanner()` without moving `S.activeTab`, so the first `renderAll()` legitimately switched the scene back. Fixed by aligning them — then it *still* failed, because `village` isn't unlocked on a fresh save and `renderAll()`'s own visible-tab fallback resets `S.activeTab` to `settlement` on the first pass. Pinned to `settlement`, which is always visible.
2. **"the block reads no game state"** — my regex matched the block's own header comment, which contains the phrase *"no game-state reads beyond `S.activeTab`"*. Stripping comments first gives `none`.
3. **"the only edit is one line"** — I asserted two `window.updateSceneBanner` references and there are three: the assignment, plus the guard **and** the call on the single hook line. Now asserted structurally instead of by count.

None of the three was a defect in the spec's code.

---

## 4. One ordering observation — reported, not changed

The hook sits immediately after `renderTabs()`, which is **before** `renderAll()`'s own visible-tab fallback:

```js
renderTabs();
if (window.updateSceneBanner) window.updateSceneBanner(S.activeTab);   // <- reads it here
…
if (visible.indexOf(S.activeTab) === -1) S.activeTab = "settlement";    // <- corrects it here
```

So on the one render where the active tab stops being visible, the banner draws the stale scene for that frame and corrects on the next `renderAll()`. It needs a condition to *regress* (a Shelter count dropping to zero, say), it self-corrects immediately, and the spec is explicit about the insertion point — so it is recorded rather than moved. It is also what made my idempotence check fail twice, which is how it was found.

---

## 5. No regression

| | v0.50 | v0.51 |
|---|---|---|
| test-v32 … v50 (18 suites) | 895 / 0 | **895 / 0** |
| **test-banner-v51** | — | **16 / 0** |
| **Total** | 895 / 0 | **911 / 0** |

**Not one economy assertion moved.**

And because the banner adds a real `setInterval` to the page the simulation harness loads, I A/B'd the simulator rather than assuming: a 400-year seed-1 run on v0.51 against the same run on v0.50 gives **every milestone identical to the digit** — Void Studies y57.9, Rites of Targon y64.0, First Ascent y72.4, Call to Arms y97.2, Sparks y148.0, Chemtech y361.5, first trade y231.8. The banner's timer does not perturb the simulation.

---

## 6. Files

- `index_51.html` — 361,453 bytes (was 331,268; the sprite base64 is most of the +30 KB). Still one file, no build step.
- `runeterrareclaimed-v0.51-workspace.zip` — 19 suites, `test-banner-v51.mjs`, `banner-block.js` (the §4 block as its own file, so a future edit doesn't mean hand-editing base64 inside a 5,400-line HTML file), and the nine banner screenshots.
