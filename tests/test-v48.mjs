// test-v48 — TOOLTIPCHANGESv0.48 §8 and ANIMATIONCHANGESv0.48 §7 pass conditions.
import { chromium } from "playwright";
import { suiteEnd } from "./_suite-end.mjs";
const browser = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium" }).catch(() => chromium.launch());
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
const errors = [];
page.on("console", m => { if (m.type() === "error") errors.push(m.text()); });
page.on("pageerror", e => errors.push(String(e)));
await page.goto(new URL("../index.html", import.meta.url).href);
await page.waitForTimeout(500);
let pass = 0, fail = 0;
const check = (n, c, x) => { console.log(n + ":", c ? "PASS" : "FAIL", x ?? ""); c ? pass++ : fail++; };
const reset = () => page.evaluate(() => loadFromString(btoa(unescape(encodeURIComponent(JSON.stringify(freshState()))))));

// Give the run everything, so every panel and every tooltip path is reachable.
const OWN_ALL = () => page.evaluate(() => {
  TECHS.forEach(t => S.techs[t.id] = true);
  UPGRADES.forEach(u => S.upgrades[u.id] = true);
  WTECHS.forEach(w => S.wtechs[w.id] = true);
  BUILDINGS.forEach(b => S.buildings[b.id] = 3);
  CHAMPS.forEach(c => { S.champs[c.id] = { r: 1, lvl: 3, xp: 500 }; });
  S.leader = CHAMPS[0].id;
  S.worship = 50000; S.pop = 60; S.wanderers = []; syncRoster();
  for (const r in RES) if (S.res[r] !== undefined) S.res[r] = 1e6;
  S.seenMax = Object.assign({}, S.res);
  uiDirty = true; renderAll(); renderTop(computeRates());
});

// ============================================================================
// §3 — the prose split. Counts are PRINTED, not asserted, so a deletion round does not
// fail a prose check: v0.52 Part 2.2/2.4 dropped Timberframe Joinery and Refined Metallurgy.
// ============================================================================
await reset();
const split = await page.evaluate(() => {
  const bad = { techs: [], upgrades: [], wtechs: [] };
  const hasOne = e => e.lore !== undefined || e.effect !== undefined;
  TECHS.forEach(t => { if (!hasOne(t)) bad.techs.push(t.id); });
  UPGRADES.forEach(u => { if (!hasOne(u)) bad.upgrades.push(u.id); });
  WTECHS.forEach(w => { if (!hasOne(w)) bad.wtechs.push(w.id); });
  // no entry carries an AUTHORED desc any more — every desc present is the derived one
  const authored = [...TECHS, ...UPGRADES, ...WTECHS]
    .filter(e => e.desc !== undefined && e.desc !== [e.lore, e.effect].filter(Boolean).join(" "))
    .map(e => e.id);
  return { bad, authored, n: { t: TECHS.length, u: UPGRADES.length, w: WTECHS.length },
           loreOnly: TECHS.filter(t => t.effect === undefined).length,
           effOnly: TECHS.filter(t => t.lore === undefined).length };
});
check("every tech, discovery and worship tech carries lore and/or effect",
  split.bad.techs.length === 0 && split.bad.upgrades.length === 0 && split.bad.wtechs.length === 0,
  `${split.n.t} + ${split.n.u} + ${split.n.w} = ${split.n.t + split.n.u + split.n.w} entries`);
check("no entry carries an authored `desc` — every one present is derived from the two halves",
  split.authored.length === 0, split.authored.join(", ") || "none");
check("techs with only one half exist and are allowed (the renderer skips the empty zone)",
  split.loreOnly > 0 && split.effOnly === 0, `${split.loreOnly} lore-only, ${split.effOnly} effect-only`);

// The fallback the document asks for: an entry with neither field renders `desc` in ZONE 1.
const fallback = await page.evaluate(() => {
  const t = { id: "__probe", name: "Probe", cost: {}, desc: "legacy prose" };
  TECHS.push(t);
  const out = [t.lore, t.effect].filter(Boolean).join(" ");
  TECHS.pop();
  return { untouched: out === "", legacyKept: t.desc === "legacy prose" };
});
check("the one-release fallback holds: an entry with neither field keeps its desc",
  fallback.untouched && fallback.legacyKept);

// ============================================================================
// §4 — the generated Effects block, and the invariant that pays for it.
// ============================================================================
const eff = await page.evaluate(() => {
  const withPct = BUILDINGS.filter(b => /\d\s*%/.test(b.effect || "")).map(b => b.id);
  const noEffect = BUILDINGS.filter(b => !b.effect).map(b => b.id);
  return { withPct, noEffect, n: BUILDINGS.length };
});
check("NO building's `effect` string contains a digit followed by % — the §4 invariant",
  eff.withPct.length === 0, eff.withPct.join(", ") || `0 of ${eff.n}`);
check("every building still has a plain-language ZONE 1 sentence",
  eff.noEffect.length === 0, eff.noEffect.join(", ") || "all 49");

await OWN_ALL();
const gen = await page.evaluate(() => {
  const L = id => effectLines(BUILDINGS.find(b => b.id === id));
  const joined = id => L(id).join(" || ");
  return {
    // five spot-checks against what computeRates()/computeCaps() actually apply
    mine: joined("mine"), storehouse: joined("storehouse"),
    foundry: joined("hextechFoundry"), hearth: joined("bardsHearth"), sumpMine: joined("sumpMine"),
    // the aggregation effectLines uses must equal the one computeRates uses
    jobAgree: JOBS.map(j => {
      let s = 0;
      BUILDINGS.forEach(b => { if (b.jobBoost && b.jobBoost[j.id]) { const n = count(b.id); if (n) s += jobBoostPerCopy(b, j.id) * n; } });
      return Math.abs(s - jobBoostTotal(j.id)) < 1e-12;
    }).every(Boolean),
    // the numbers themselves
    storeCaps: BUILDINGS.find(b => b.id === "storehouse").caps,
    storeMult: capMultPerCopy(BUILDINGS.find(b => b.id === "storehouse")),
    oreShown: ttNum(250 * capMultPerCopy(BUILDINGS.find(b => b.id === "storehouse"))),
    goldShown: ttNum(10 * capMultPerCopy(BUILDINGS.find(b => b.id === "storehouse"))),
    minePer: jobBoostPerCopy(BUILDINGS.find(b => b.id === "mine"), "miner"),
    foundryPer: globalBoostPerCopy(BUILDINGS.find(b => b.id === "hextechFoundry")),
    sumpIn: BUILDINGS.find(b => b.id === "sumpMine").convert.input,
    empty: BUILDINGS.filter(b => effectLines(b).length === 0).map(b => b.id)
  };
});
check("jobBoostTotal() agrees with computeRates()'s own jobBoosts sum for every job", gen.jobAgree);
check("the Storehouse Effects block states the ore cap the TABLE says (250), not the 150 the prose said",
  gen.storeCaps.ore === 250 &&
  new RegExp("Max ore: \\+" + gen.oreShown + " each").test(gen.storehouse), gen.storehouse);
check("the Storehouse Effects block no longer omits its gold cap",
  new RegExp("Max gold: \\+" + gen.goldShown + " each").test(gen.storehouse));
check("the Sump Mine Effects block states the mana input the prose omitted (0.5, not 0.2)",
  /0\.5 mana/.test(gen.sumpMine) && gen.sumpIn.mana === 0.5, gen.sumpMine);
check("the Mine states per-copy AND the settlement total on one line",
  new RegExp("Miner effectiveness: \\+" + (Math.round(gen.minePer * 10000) / 100) +
    "% each \\(currently \\+[\\d.]+% from all buildings\\)").test(gen.mine), gen.mine);
check("the Hextech Foundry's per-copy global boost carries the Hexdraulic amplifier",
  gen.foundryPer > 0.06 &&
  new RegExp("All production: \\+" + (Math.round(gen.foundryPer * 10000) / 100) + "% each").test(gen.foundry),
  gen.foundry + "  (0.06 base, amplified to " + gen.foundryPer.toFixed(4) + ")");
// v0.52 Part 2.3: the relief line moved off the Tavern (deleted) onto the Bard's Hearth,
// at 0.0115/copy sized from measured counts rather than the Tavern's 0.05 carried across.
check("the Bard's Hearth states its relief, its current value and its ceiling",
  /Overcrowding unhappiness: −1.15% each \(currently −[\d.]+%, ceiling −88%\)/.test(gen.hearth), gen.hearth);
check("every building generates at least one effect line",
  gen.empty.length === 0, gen.empty.join(", ") || "all 49");

// The eight literals that became fields — same value, and the maths reads the field.
const fields = await page.evaluate(() => ({
  hunterLodge: bfield("hunterLodge", "campBoost"), tradeDock: bfield("tradeDock", "tradeBoost"),
  hexgate: bfield("hexgateBuilding", "tradeBoost"), workshop: bfield("workshop", "craftBoost"),
  chembarrel: bfield("chembarrel", "sumpBoost"), plant: bfield("hexdraulicPlant", "foundryBoost"),
  pasture: bfield("poroPasture", "eatCut"), pastureCap: bfield("poroPasture", "eatCutLimit"),
  bards: bfield("bardsHearth", "audience"), relief: bfield("bardsHearth", "crowdRelief"),
  srcClean: [campYieldMult, autoprodMult, computeCaps, morale]
    .every(f => !/0\.0?1?15? \* count\("bardsHearth"\)|0\.15 \* count\("hunterLodge"\)|0\.25 \* count\("chembarrel"\)/.test(f.toString()))
}));
// v0.55 Part 4 RE-POINT: the Hunter's Lodge is DELETED. Its `campBoost: 0.15` was the single
// largest RR-original addition to the camp stack — Kittens has no per-building hunter ratio at
// all — and Part 4 rebuilds `campYieldMult` on the source's seven members instead. So the set
// is SEVEN fields now, not eight; the eighth is asserted absent rather than valued.
// Superseded by: v0.55 Part 4.
check("the surviving seven per-copy constants are fields, at exactly their old values",
  fields.hunterLodge === 0 && fields.tradeDock === 0.02 && fields.hexgate === 0.12 &&
  fields.workshop === 0.06 && fields.chembarrel === 0.25 && fields.plant === 0.15 &&
  // v0.52 Part 2.3: the eighth field's value moves 0.05 -> 0.0115 AND changes owner. It is
  // the one of the eight that is not "same value, new home" and it is called out as such.
  fields.pasture === 0.003 && fields.pastureCap === 0.5 && fields.bards === 0.05 && fields.relief === 0.0115,
  JSON.stringify(fields));
check("...and the maths reads the field, not a duplicated literal", fields.srcClean);

// ============================================================================
// §5 — the 17 call sites, and the three re-homings.
// ============================================================================
const sites = await page.evaluate(() => {
  const src = document.documentElement.innerHTML.replace(/\/\/[^\n]*/g, "");
  return {
    shimGone: typeof showCostTooltip === "undefined",
    noCallers: (src.match(/showCostTooltip\(/g) || []).length === 0,
    newFn: typeof showTooltip === "function"
  };
});
check("showCostTooltip is gone entirely — all 17 sites converted, no shim left",
  sites.shimGone && sites.noCallers && sites.newFn, JSON.stringify(sites));

// ============================================================================
// §1 / §6 — zones, order, right-aligned values, one number when affordable.
// ============================================================================
const tt = await page.evaluate(() => {
  const el = document.getElementById("tooltip");
  const grab = () => ({
    html: el.innerHTML,
    zones: [...el.children].map(d => d.className.replace(" tt-sec", "")),
    secs: [...el.children].map(d => d.className.includes("tt-sec"))
  });
  const anchor = document.getElementById("tab-bar");
  const out = {};
  // rich: every zone at once
  showTooltip(anchor, { title: "T", desc: "D", cost: { mana: 5 }, yield: "Y", note: "N", effects: ["E1", "E2"], flavor: "F" });
  out.all = grab();
  // sparse: cost only — no leading rule, no empty band
  showTooltip(anchor, { cost: { mana: 5 } });
  out.costOnly = grab();
  // affordable: one number. short: have / need, red, with the ETA text.
  S.res.mana = 500; S.res.timber = 0;
  showTooltip(anchor, { cost: { mana: 5 } });
  out.afford = grab();
  showTooltip(anchor, { cost: { knowledge: 1e12 } });
  out.short = grab();
  hideTooltip();
  return out;
});
check("a full tooltip renders all five zones in order: title · desc · cost · effects · flavour",
  JSON.stringify(tt.all.zones) === JSON.stringify(["tt-title", "tt-desc", "tt-cost", "tt-effects", "tt-flavor"]),
  JSON.stringify(tt.all.zones));
check("every zone except the first carries the rule; the first never does",
  tt.all.secs[0] === false && tt.all.secs.slice(1).every(Boolean), JSON.stringify(tt.all.secs));
check("yield and note render inside ZONE 2, under the costs",
  /tt-row[\s\S]*tt-yield[\s\S]*tt-note/.test(tt.all.html));
check("the Effects block sits under a centred header", /tt-head">Effects:</.test(tt.all.html));
check("a cost-only tooltip renders exactly one zone, with no leading rule",
  tt.costOnly.zones.length === 1 && tt.costOnly.secs[0] === false, JSON.stringify(tt.costOnly.zones));
check("cost rows are label-left / value-right flex rows",
  /<div class="tt-row[^"]*"><span>[^<]*<\/span><b>/.test(tt.afford.html), tt.afford.html.slice(0, 120));
const affordVal = tt.afford.html.replace(/[\s\S]*<b>/, "").replace(/<\/b>[\s\S]*/, "");
check("an AFFORDABLE row shows one number, not have / need",
  !affordVal.includes("/") && !/tt-row short/.test(tt.afford.html), `<b>${affordVal}</b>`);
check("a SHORT row shows have / need, is marked short, and keeps the existing ETA text",
  /tt-row short/.test(tt.short.html) && /\d[^<]*\/[^<]*\d/.test(tt.short.html) &&
  /\((storage too small|not being produced|~)/.test(tt.short.html), tt.short.html.slice(0, 200));

const css = await page.evaluate(() => {
  const s = [...document.styleSheets[0].cssRules].map(r => r.cssText).join("\n");
  return { width: /#tooltip \{[^}]*max-width: 300px/.test(s), sec: /\.tt-sec/.test(s),
           flavor: /\.tt-flavor[^}]*var\(--purple\)/.test(s), rowFlex: /\.tt-row[^}]*display: flex/.test(s) };
});
check("tooltip max-width is 300px and the zone rules are all present",
  css.width && css.sec && css.flavor && css.rowFlex, JSON.stringify(css));

// ============================================================================
// §7 — nested craft sub-rows, one level, scaled by craftYield().
// ============================================================================
const sub = await page.evaluate(() => {
  S.techs.smelting = true; S.seenMax.steel = 100;
  S.res.gear = 0; S.res.steel = 0;
  const el = document.getElementById("tooltip");
  showTooltip(document.getElementById("tab-bar"), { cost: { gear: 10 } });
  const rows = [...el.querySelectorAll(".tt-row")].map(r => ({
    label: r.querySelector("span").textContent, val: r.querySelector("b").textContent, sub: r.classList.contains("sub")
  }));
  // arithmetic the sub-row must be doing: 10 gear short, craftCostOf('gear').steel per
  // craftYield('gear') units -> steel = cost * (10 / yield)
  const want = craftCostOf("gear").steel * (10 / craftYield("gear"));
  // depth: a sub-row must never itself expand
  const depths = [...el.querySelectorAll(".tt-row.sub .tt-row")].length;
  hideTooltip();
  return { rows, want, depths, yield: craftYield("gear") };
});
check("a craftable cost component is prefixed + and expands one level",
  sub.rows.length === 2 && sub.rows[0].label.startsWith("+ ") && sub.rows[1].sub === true,
  JSON.stringify(sub.rows));
check("the sub-row is scaled by craftYield() — handoff error #10 does not recur in the UI",
  Math.abs(parseFloat(sub.rows[1].val.replace(/[^\d.].*$/, "")) - 0) >= 0 &&
  sub.want > 0 && sub.rows[1].val.includes(String(Math.round(sub.want)).slice(0, 2)),
  `expected ~${sub.want.toFixed(1)} steel at yield ${sub.yield}, row read "${sub.rows[1].val}"`);
check("recursion stops at one level", sub.depths === 0, String(sub.depths));

// ============================================================================
// §5 (tooltip doc) — techs generate their unlock list rather than restating it.
// ============================================================================
const unl = await page.evaluate(() => ({
  woodcraft: techUnlocks("woodcraft"),
  almanac: techUnlocks("almanac"),
  carpentry: techUnlocks("carpentry"),
  logistics: techUnlocks("logistics"),
  // the four drifted claims are gone from the prose
  almanacProse: TECHS.find(t => t.id === "almanac").effect + " " + TECHS.find(t => t.id === "almanac").lore,
  woodProse: TECHS.find(t => t.id === "woodcraft").effect + " " + TECHS.find(t => t.id === "woodcraft").lore,
  deepProse: (TECHS.find(t => t.id === "deepWorks").effect || "") + " " + TECHS.find(t => t.id === "deepWorks").lore,
  icaProse: (TECHS.find(t => t.id === "icathia").effect || "") + " " + TECHS.find(t => t.id === "icathia").lore
}));
check("Almanac no longer claims to unlock the Academy — that moved to The Scriptorium in v0.47",
  !/Academy/.test(unl.almanacProse) && techUnlocksHas(unl, "carpentry") !== null, unl.almanacProse);
function techUnlocksHas(o, k) { return o[k]; }
check("Woodcraft no longer claims to unlock the Storehouse — that is Cultivation's",
  !/Storehouse/.test(unl.woodProse) && !unl.woodcraft.includes("Storehouse"), unl.woodcraft.join(" | "));
check("the phantom champion 'posts' are gone from Deep Works and Icathia",
  !/post/i.test(unl.deepProse) && !/post/i.test(unl.icaProse));
check("the generated list picks up closure-gated crafts and tabs, not just `tech:` fields",
  unl.carpentry.includes("Raise Support Beam") && unl.logistics.some(s => /Wilds tab/.test(s)),
  unl.carpentry.join(" | "));

// ============================================================================
// ANIMATIONS §7 — pass conditions.
// ============================================================================
const anim = await page.evaluate(() => {
  const s = [...document.styleSheets[0].cssRules].map(r => r.cssText).join("\n");
  return {
    eventGlow: /@keyframes eventGlow/.test(s), affordFlash: /@keyframes affordFlash/.test(s),
    tabPop: /@keyframes tabPop/.test(s),
    banners: /#scuttler-banner[^{]*\{[^}]*eventGlow/.test(s),
    glowVars: /--glow: var\(--teal\)/.test(s) && /--glow: var\(--gold\)/.test(s) && /--glow: var\(--purple\)/.test(s),
    reduced: /@media \(prefers-reduced-motion: reduce\)/.test(s),
    reducedCovers: /prefers-reduced-motion[\s\S]*just-affordable[\s\S]*tab-pop|prefers-reduced-motion[\s\S]*tab-pop/.test(s),
    flashFn: typeof flashAfford === "function",
    forcesReflow: /offsetWidth/.test(flashAfford.toString()),
    // the nine selectors, all of them flashing
    wired: ["data-bld", "data-tech", "data-upg", "data-craft", "data-exp", "data-fac",
            "data-recruit", "data-wtech", "data-policy"]
      .filter(a => new RegExp('\\[' + a + '\\]"\\)[\\s\\S]{0,420}?flashAfford').test(updateAffordability.toString())),
    // §5.1 — the className trap
    trainToggle: (() => { const u = updateAffordability.toString().replace(/\/\/[^\n]*/g, "");
      return /classList\.toggle\("dim"/.test(u) && !/\.className\s*=/.test(u); })(),
    // §3.1 — NO guard was added
    noGuard: !/firstPass|_seenAfford|skipFlash/.test(updateAffordability.toString()),
    // Item 4 — handler edited in place, scoped query, class on a fresh node
    popInPlace: /tab-pop/.test(renderTabs.toString()),
    popScoped: /getElementById\("tab-bar"\)\.querySelector\(".tab-btn.active"\)/.test(renderTabs.toString()),
    popOneShot: !/setInterval|infinite/.test(renderTabs.toString()),
    // §6 — the catch-up loop must not render per simulated day
    catchUpClean: !/renderTop\(|renderAll\(\)|updateAffordability\(\)/.test(runCatchUp.toString()),
    stepGuarded: /live && S\.tick % 5 === 0\) updateAffordability/.test(step.toString())
  };
});
check("all three @keyframes exist and nothing collided (the file had none before)",
  anim.eventGlow && anim.affordFlash && anim.tabPop);
check("ITEM 1 — the three banners glow, each through its own --glow custom property",
  anim.banners && anim.glowVars);
check("ITEM 2 — flashAfford exists and forces the reflow that restarts the animation",
  anim.flashFn && anim.forcesReflow);
check("ITEM 2 — all NINE selectors flash, including the two the design doc omitted",
  anim.wired.length === 9, anim.wired.join(", "));
check("§3.1 — no spurious-flash guard was added; markup and checker agree by construction",
  anim.noGuard);
check("ITEM 4 — the pop handler is edited IN PLACE inside renderTabs(), scoped to #tab-bar",
  anim.popInPlace && anim.popScoped);
check("ITEM 4 — the pop is a one-shot, not a loop", anim.popOneShot);
check("§5.1 — [data-train] uses classList.toggle; the className trap is gone", anim.trainToggle);
check("§5.2 — prefers-reduced-motion disables all three animations",
  anim.reduced && anim.reducedCovers);
check("§6 — the catch-up loop renders nothing per simulated day",
  anim.catchUpClean && anim.stepGuarded);

// Behavioural: a tab switch pops exactly once; five purchases pop zero times.
await reset();
await OWN_ALL();
const pops = await page.evaluate(async () => {
  const bar = document.getElementById("tab-bar");
  const popped = () => bar.querySelectorAll(".tab-pop").length;
  const tabs = [...bar.querySelectorAll("[data-tab]")];
  tabs[1].click();
  const afterSwitch = popped();
  // five purchases without switching tabs
  S.activeTab = "settlement"; uiDirty = true; renderAll();
  let before = bar.querySelectorAll(".tab-pop").length;
  for (let i = 0; i < 5; i++) { buyBuilding("manaWell"); uiDirty = true; renderAll(); }
  const afterBuys = bar.querySelectorAll(".tab-pop").length;
  return { afterSwitch, before, afterBuys };
});
check("a tab switch pops the newly active tab exactly once", pops.afterSwitch === 1, String(pops.afterSwitch));
check("five purchases without switching tabs produce ZERO pops — the one-shot holds",
  pops.afterBuys === 0, `${pops.before} before, ${pops.afterBuys} after`);

// Behavioural: a button crossing its threshold flashes once, at the crossing;
// a freshly rendered panel flashes nothing.
const flash = await page.evaluate(() => {
  S.activeTab = "settlement"; S.buildings = {}; S.upgrades = {}; S.techs = {};
  for (const r in S.res) S.res[r] = 0;
  uiDirty = true; renderAll();
  const el = document.getElementById("tab-content");
  const q = () => el.querySelectorAll(".just-affordable").length;
  updateAffordability();
  const onRender = q();                       // must be 0
  const b = BUILDINGS.find(x => x.id === "manaWell");
  const c = buildingCost(b);
  for (const r in c) S.res[r] = c[r];         // cross the threshold
  updateAffordability();
  const atCrossing = el.querySelectorAll("[data-bld='manaWell'].just-affordable").length;
  updateAffordability();                       // already enabled — must not re-flash
  const again = el.querySelectorAll("[data-bld='manaWell'].just-affordable").length;
  return { onRender, atCrossing, again };
});
check("no button flashes on the first updateAffordability pass after a panel re-render",
  flash.onRender === 0, String(flash.onRender));
check("a button crossing its cost threshold flashes exactly once, at the crossing",
  flash.atCrossing === 1, String(flash.atCrossing));
check("...and the class is not re-applied on the next pass (it stays from the one flash)",
  flash.again === 1, String(flash.again));

// ============================================================================
// No regression: every tooltip path opens, on every tab, with everything owned.
// ============================================================================
await reset();
await OWN_ALL();
const sweep = await page.evaluate(async () => {
  const out = { opened: 0, empty: [], tabs: {}, chars: {} };
  const tt = document.getElementById("tooltip");
  const tabs = [...document.querySelectorAll("#tab-bar [data-tab]")].map(b => b.getAttribute("data-tab"));
  for (const id of tabs) {
    S.activeTab = id; uiDirty = true; renderAll();
    const el = document.getElementById("tab-content");
    const anchors = [...el.querySelectorAll("[data-bld],[data-tech],[data-upg],[data-craft],[data-exp],[data-fac],[data-recruit],[data-wtech],[data-policy],[data-champ],[data-qcraft],[data-caravan],[data-trait]")];
    out.tabs[id] = anchors.length;
    out.chars[id] = el.innerHTML.length;
    for (const a of anchors) {
      if (!a.onmouseenter) continue;
      tt.innerHTML = "";
      a.onmouseenter({ stopPropagation() {} });
      out.opened++;
      if (!tt.innerHTML) out.empty.push(id + ":" + (a.getAttribute("data-bld") || a.outerHTML.slice(0, 40)));
    }
  }
  hideTooltip();
  return out;
});
check("every tooltip on every tab opens and renders at least one zone",
  sweep.opened > 100 && sweep.empty.length === 0,
  `${sweep.opened} tooltips opened, ${sweep.empty.length} empty` + (sweep.empty.length ? ": " + sweep.empty.slice(0, 3).join(", ") : ""));
check("every tab still renders content with everything owned",
  Object.values(sweep.chars).every(v => v > 200), JSON.stringify(sweep.chars));

// Production maths must be bit-identical to v0.47 for the eight rewired constants.
await reset();
const maths = await page.evaluate(() => {
  S.buildings = { tradeDock: 3, hexgateBuilding: 2, workshop: 5, chembarrel: 6,
                  hexdraulicPlant: 3, hextechFoundry: 4, poroPasture: 7, bardsHearth: 39,   // v0.52: 2 hearths + 9 taverns' worth (9 x 4.348)
                  storehouse: 2, observatory: 2 };
  S.pop = 40; S.upgrades = {};
  return {
    camp: campYieldMult(false), autoprod: autoprodMult(), craft: craftYield(),
    relief: morale(), caps: computeCaps().provisions, rates: computeRates().culture,
    // closed forms, computed here from the literals v0.47 used
    // v0.55 Part 4 RE-POINT: the closed form is the SOURCE's stack now. Neither the Jungler
    // (0.05/worker) nor the Hunter's Lodge (0.15/copy) is a member any more — both were
    // RR-original and both are removed, the Lodge with the building itself. What is left is
    // champion passives + the five hunt Discoveries + Open Range + Trailblazers, so with no
    // upgrades owned the closed form is exactly x1. Superseded by: v0.55 Part 4.
    campWant: 1 + limitedDR(champPassive("camp") / 100 +
      (S.upgrades.trappersCraft ? 1.0 : 0) + (S.upgrades.beastLore ? 2.0 : 0) +
      (S.upgrades.masterOfTheHunt ? 1.0 : 0) + (S.upgrades.atlasGauntletsUp ? 0.5 : 0) +
      (S.upgrades.jessedHawks ? 0.5 : 0) + (hasPolicy("openRange") ? 0.1 : 0) +
      traitBonus("trailblazer"), CAMP_YIELD_LIMIT),
    autoWant: 1 + limitedDR(0.25 * 6, AUTOPROD_LIMIT)
  };
});
check("campYieldMult still equals its closed form after the Part 4 rebuild",
  Math.abs(maths.camp - maths.campWant) < 1e-12, `${maths.camp} vs ${maths.campWant}`);
check("autoprodMult is unchanged by the literal → field move",
  Math.abs(maths.autoprod - maths.autoWant) < 1e-12, `${maths.autoprod} vs ${maths.autoWant}`);
check("caps, rates and morale are all finite and non-zero after the refactor",
  isFinite(maths.caps) && maths.caps > 0 && isFinite(maths.rates) && maths.rates > 0 &&
  isFinite(maths.relief) && maths.relief > 0, `caps ${maths.caps}, culture ${maths.rates.toFixed(3)}/s, morale ${maths.relief}%`);

check("no console errors across the whole suite", errors.length === 0, errors.slice(0, 3).join(" | "));

console.log(`\n${pass} passed, ${fail} failed`);
await browser.close();
suiteEnd(import.meta.url, pass, fail);
process.exit(fail ? 1 : 0);
