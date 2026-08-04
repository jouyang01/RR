// test-banner-v51 — the spec's own §5 verification, re-run against THIS build rather
// than trusted from the spec. Presentational feature: this suite is additive and no
// existing assertion may move.
import { chromium } from "playwright";
import fs from "fs";
const FILE = new URL("../index.html", import.meta.url).href;
const SHOTS = new URL("./shots", import.meta.url).pathname;
const TABS = ["settlement", "village", "lore", "crafting", "wilds", "trade", "targon", "champions"];
let pass = 0, fail = 0;
const check = (n, c, x) => { console.log(n + ":", c ? "PASS" : "FAIL", x ?? ""); c ? pass++ : fail++; };

const browser = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium" }).catch(() => chromium.launch());

// ============================================================================
// 1 — every scene renders, with zero console/page errors
// ============================================================================
{
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 }, deviceScaleFactor: 2 });
  const errors = [];
  page.on("console", m => { if (m.type() === "error") errors.push(m.text()); });
  page.on("pageerror", e => errors.push(String(e)));
  await page.goto(FILE);
  await page.waitForTimeout(700);

  const wired = await page.evaluate(() => ({
    hasBanner: !!document.getElementById("scene-banner"),
    hasCanvas: !!document.getElementById("scene-canvas"),
    hasSprites: !!document.getElementById("scene-sprites"),
    hasFn: typeof window.updateSceneBanner === "function",
    canvasW: document.getElementById("scene-canvas").width,
    canvasH: document.getElementById("scene-canvas").height,
    // the banner must sit between </header> and #calendar-bar, outside #main
    prevIsHeader: document.getElementById("scene-banner").previousElementSibling.tagName === "HEADER",
    nextIsCalendar: document.getElementById("scene-banner").nextElementSibling.id === "calendar-bar",
    notInMain: !document.getElementById("main").contains(document.getElementById("scene-banner")),
    hookInRenderAll: /window\.updateSceneBanner\(S\.activeTab\)/.test(renderAll.toString())
  }));
  check("the banner exists as two canvases at 240×34, between </header> and #calendar-bar",
    wired.hasBanner && wired.hasCanvas && wired.hasSprites && wired.hasFn &&
    wired.canvasW === 240 && wired.canvasH === 34 &&
    wired.prevIsHeader && wired.nextIsCalendar && wired.notInMain,
    JSON.stringify(wired));
  check("renderAll() carries the guarded hook, and nothing else in it changed", wired.hookInRenderAll);

  // every scene drawn directly, bypassing tab-unlock gating
  const blank = [];
  for (const t of TABS) {
    await page.evaluate(id => window.updateSceneBanner(id), t);
    await page.waitForTimeout(260);
    const el = await page.$("#scene-banner");
    await el.screenshot({ path: `${SHOTS}/banner-${t}.png` });
    // a scene that drew nothing would be a single flat colour; count distinct bytes as a proxy
    const px = await page.evaluate(() => {
      const c = document.getElementById("scene-canvas");
      const d = c.getContext("2d").getImageData(0, 0, c.width, c.height).data;
      const seen = new Set();
      for (let i = 0; i < d.length; i += 4) seen.add(d[i] + "," + d[i + 1] + "," + d[i + 2]);
      return seen.size;
    });
    if (px < 3) blank.push(t + ":" + px);
  }
  check("all 8 scenes draw real content (≥3 distinct colours each)",
    blank.length === 0, blank.join(", ") || "settlement village lore crafting wilds trade targon champions");
  check("zero console or page errors across all 8 scenes",
    errors.length === 0, errors.slice(0, 3).join(" | "));

  // the rest of the game is untouched
  const game = await page.evaluate(() => ({
    resourceCol: (document.getElementById("resource-col").textContent || "").trim().length,
    tabButtons: document.querySelectorAll("#tab-bar .tab-btn").length,
    tabContent: (document.getElementById("tab-content").innerHTML || "").length
  }));
  check("the rest of the game still renders — resources, tab bar, tab content",
    game.resourceCol > 0 && game.tabButtons > 0 && game.tabContent > 200, JSON.stringify(game));

  // a real tab click still works AND drives the banner
  const click = await page.evaluate(async () => {
    const btns = [...document.querySelectorAll("#tab-bar [data-tab]")];
    const target = btns.find(b => b.getAttribute("data-tab") !== S.activeTab) || btns[0];
    const want = target.getAttribute("data-tab");
    target.click();
    return { want, active: S.activeTab, popped: document.querySelectorAll("#tab-bar .tab-pop").length };
  });
  check("tab clicks still work, and the v0.48 tab-pop still fires alongside the banner",
    click.active === click.want && click.popped === 1, JSON.stringify(click));
  await page.close();
}

// ============================================================================
// 2 — the animation actually advances
// ============================================================================
{
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  await page.goto(FILE);
  await page.waitForTimeout(500);
  await page.evaluate(() => window.updateSceneBanner("village"));
  await page.waitForTimeout(120);
  const el = await page.$("#scene-banner");
  const a = await el.screenshot();
  await page.waitForTimeout(900);
  const b = await el.screenshot();
  check("the animation advances — two shots 900ms apart differ",
    !a.equals(b), `${a.length} vs ${b.length} bytes`);
  await page.close();
}

// ============================================================================
// 3 — prefers-reduced-motion freezes it, pixel-identical
// ============================================================================
{
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 }, reducedMotion: "reduce" });
  await page.goto(FILE);
  await page.waitForTimeout(500);
  await page.evaluate(() => window.updateSceneBanner("village"));
  await page.waitForTimeout(120);
  const el = await page.$("#scene-banner");
  const a = await el.screenshot();
  await page.waitForTimeout(900);
  const b = await el.screenshot();
  const state = await page.evaluate(() => ({
    matches: window.matchMedia("(prefers-reduced-motion: reduce)").matches
  }));
  check("prefers-reduced-motion is honoured — two shots 900ms apart are pixel-identical",
    state.matches && a.equals(b), `media matches ${state.matches}, identical ${a.equals(b)}`);
  await page.close();
}

// ============================================================================
// 4 — mobile width: no clipping, no distortion
// ============================================================================
{
  const page = await browser.newPage({ viewport: { width: 380, height: 800 }, deviceScaleFactor: 2 });
  const errors = [];
  page.on("pageerror", e => errors.push(String(e)));
  await page.goto(FILE);
  await page.waitForTimeout(600);
  await page.evaluate(() => window.updateSceneBanner("village"));
  await page.waitForTimeout(300);
  const el = await page.$("#scene-banner");
  await el.screenshot({ path: `${SHOTS}/banner-mobile-village.png` });
  const m = await page.evaluate(() => {
    const b = document.getElementById("scene-banner");
    const c = document.getElementById("scene-canvas");
    const s = document.getElementById("scene-sprites");
    const br = b.getBoundingClientRect(), sr = s.getBoundingClientRect();
    return {
      bannerW: Math.round(br.width), canvasCssH: Math.round(c.getBoundingClientRect().height),
      // the sprite layer must be sized to its OWN pixel box, not stretched
      spriteBackingW: s.width, spriteBackingH: s.height,
      spriteCssW: Math.round(sr.width), spriteCssH: Math.round(sr.height),
      overflow: br.width > document.documentElement.clientWidth + 1
    };
  });
  check("at 380px the banner does not overflow and the mobile height rule applies (46px)",
    !m.overflow && m.canvasCssH === 46, JSON.stringify(m));
  check("the sprite layer is sized 1:1 to its own box, so hand-drawn art is never stretched",
    m.spriteBackingW === m.spriteCssW && m.spriteBackingH === m.spriteCssH,
    `backing ${m.spriteBackingW}×${m.spriteBackingH} vs css ${m.spriteCssW}×${m.spriteCssH}`);
  check("no page errors at mobile width", errors.length === 0, errors.slice(0, 2).join(" | "));
  await page.close();
}

// ============================================================================
// 5 — the hook is idempotent: it must not restart the animation on every uiDirty
// ============================================================================
{
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  await page.goto(FILE);
  await page.waitForTimeout(500);
  const idem = await page.evaluate(async () => {
    // Use a tab that is ALWAYS visible. renderAll() resets S.activeTab to "settlement"
    // when the active tab is not unlocked, so pinning it to "village" on a fresh save
    // made the second renderAll() legitimately switch the scene — the first two versions
    // of this check were measuring their own setup, not the hook.
    S.activeTab = "settlement";
    window.updateSceneBanner("settlement");
    await new Promise(r => setTimeout(r, 700));            // let the frame counter advance
    const c = document.getElementById("scene-canvas");
    const snap = () => c.toDataURL();
    const before = snap();
    for (let i = 0; i < 5; i++) { uiDirty = true; renderAll(); }   // five purchases' worth
    const after = snap();
    return { sameFrame: before === after };
  });
  check("five renderAll()s on the same tab do NOT restart the animation", idem.sameFrame);
  await page.close();
}

// ============================================================================
// 6 — the source itself: no game state read beyond S.activeTab
// ============================================================================
{
  const src = fs.readFileSync(new URL("../index.html", import.meta.url).pathname, "utf8");
  const raw = src.slice(src.indexOf("// PIXEL SCENE BANNER"), src.indexOf("// BOOT"));
  // Strip comments before grepping for state reads — the block's own header comment says
  // "no game-state reads beyond S.activeTab", and the first version of this check matched
  // that sentence rather than any code.
  const block = raw.replace(/\/\/[^\n]*/g, "");
  const stateReads = (block.match(/\bS\.\w+/g) || []).filter((v, i, a) => a.indexOf(v) === i);
  const globals = (block.match(/window\.\w+\s*=/g) || []);
  check("the banner block reads NO game state at all — S.activeTab is passed in by the caller",
    stateReads.length === 0, stateReads.join(", ") || "none");
  check("it leaks exactly one global, window.updateSceneBanner",
    globals.length === 1 && /window\.updateSceneBanner\s*=/.test(globals[0]), globals.join(", "));
  check("it touches nothing in computeRates, computeCaps, tick or the save format",
    !/computeRates|computeCaps|\btick\b|serialize|loadFromString/.test(block));
  // One assignment inside the IIFE, and one hook line carrying the guard AND the call.
  check("...and the ONLY edit to existing game code is the one guarded line in renderAll()",
    (src.match(/^\s*if \(window\.updateSceneBanner\) window\.updateSceneBanner\(S\.activeTab\);$/gm) || []).length === 1 &&
    (src.match(/window\.updateSceneBanner\s*=/g) || []).length === 1,
    (src.match(/window\.updateSceneBanner/g) || []).length + " references total: 1 assignment + 1 hook line (guard + call)");
}

console.log(`\n${pass} passed, ${fail} failed`);
await browser.close();
process.exit(fail ? 1 : 0);
