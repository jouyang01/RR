// test-v591 — the OFF-CYCLE round v0.59.1, built from Jerry's eight developer notes with no
// analyzer spec (OFF-CYCLE-PROTOCOL.md).
//
// One block per note, in the order the notes were issued, so verification can be checked
// against `docs/specs/rr-devnotes-v0.59.1.md` line by line.
import { chromium } from "playwright";
import { readFileSync } from "fs";

const browser = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium" }).catch(() => chromium.launch());
const page = await browser.newPage({ viewport: { width: 430, height: 900 } });   // note 2's own narrow case
const errors = [];
page.on("console", m => { if (m.type() === "error") errors.push(m.text()); });
page.on("pageerror", e => errors.push(String(e)));
await page.goto(new URL("../index.html", import.meta.url).href);
await page.waitForTimeout(500);
let pass = 0, fail = 0;
const check = (n, c, x) => { console.log(n + ":", c ? "PASS" : "FAIL", x ?? ""); c ? pass++ : fail++; };

const RAW = readFileSync(new URL("../index.html", import.meta.url), "utf8");
const strip = s => s.replace(/\/\*[\s\S]*?\*\//g, "").split("\n")
  .map(l => l.replace(/(^|[^:])\/\/.*$/, "$1")).join("\n");
const CODE = strip(RAW);
const LEDGER = readFileSync(new URL("../docs/PARITY-LEDGER.md", import.meta.url), "utf8");
const RULINGS = readFileSync(new URL("../STANDING-RULINGS.md", import.meta.url), "utf8");

// ============================================================================
// NOTE 1 — the mana Discovery affects ALL mana production
// NOTE 6 — True Ice Cellars leaves provisions and joins it
// ============================================================================
const mana = await page.evaluate(() => {
  const fresh = () => loadFromString(btoa(unescape(encodeURIComponent(JSON.stringify(freshState())))));
  const all = () => TECHS.forEach(t => S.techs[t.id] = 1);
  const o = {};
  // NO ARCANISTS AT ALL. A job-scoped bonus cannot move this; only a global one can, which is
  // exactly the difference note 1 asks for and the only way to assert it without ambiguity.
  const wells = ups => { fresh(); all(); S.buildings = { manaWell: 20 };
    S.pop = 0; S.jobs = {}; S.wanderers = []; S.upgrades = {};
    (ups || []).forEach(u => S.upgrades[u] = 1); return computeRates().mana; };
  const base = wells([]);
  o.leyline = +(wells(["leylineCalibration"]) / base).toFixed(4);
  o.trueIce = +(wells(["trueIceCellars"]) / base).toFixed(4);
  o.hexres  = +(wells(["hexresonance"]) / base).toFixed(4);
  o.allThree = +(wells(["leylineCalibration", "trueIceCellars", "hexresonance"]) / base).toFixed(4);
  o.consts = { leyline: LEYLINE_MANA_BOOST, trueIce: TRUE_ICE_MANA_BOOST };
  // the Arcanist line returns to ONE rung
  fresh(); all(); S.buildings = {}; S.pop = 10; S.jobs = { arcanist: 10 };
  S.wanderers = Array.from({ length: 10 }, (_, i) => ({ nm: "a" + i, j: "arcanist", jx: {}, xp: 0, t: "trailblazer" }));
  S.upgrades = {}; const j0 = computeRates().mana;
  S.upgrades.arcaneFocus = 1; o.arcanistFocusOnly = +(computeRates().mana / j0).toFixed(4);
  // NOTE 6 — provisions
  const eat = up => { fresh(); all(); S.pop = 40; S.upgrades = {};
    if (up) S.upgrades.trueIceCellars = 1; return +computeRates().provisions.toFixed(4); };
  o.provisionsWithout = eat(false); o.provisionsWith = eat(true);
  o.consumptionProse = (() => { fresh(); S.pop = 40; S.buildings.shelter = 20;
    S.activeTab = "village"; uiDirty = true; renderAll();
    return document.body.innerText.indexOf(CONSUMPTION.toFixed(3)) > -1; })();
  return o;
});
check("1 — the mana Discovery reaches Mana Wells with ZERO arcanists assigned",
  Math.abs(mana.leyline - (1 + mana.consts.leyline)) < 1e-4,
  `×${mana.leyline} on wells alone (LEYLINE_MANA_BOOST ${mana.consts.leyline})`);
check("6 — True Ice Cellars is a MANA discovery now, and it reaches wells too",
  Math.abs(mana.trueIce - (1 + mana.consts.trueIce)) < 1e-4,
  `×${mana.trueIce} (TRUE_ICE_MANA_BOOST ${mana.consts.trueIce})`);
check("1/6 — all three mana boosts are ADDITIVE, never multiplicative (Kittens' Law)",
  Math.abs(mana.allThree - 1.75) < 1e-4,
  `×${mana.allThree} — additive 1+0.30+0.20+0.25 = 1.75; a chain would give 1.95`);
check("1 — ...and the Arcanist JOB line is back to one rung: Arcane Focus alone, ×1.50",
  Math.abs(mana.arcanistFocusOnly - 1.50) < 1e-4 &&
  !/leylineCalibration \? 0\.30/.test(CODE),
  `×${mana.arcanistFocusOnly}`);
check("6 — True Ice Cellars does not touch provisions BY ONE UNIT",
  mana.provisionsWithout === mana.provisionsWith,
  `${mana.provisionsWithout}/s vs ${mana.provisionsWith}/s`);
check("6 — ...and the -20% is gone from the source AND from the prose a player reads",
  !/trueIceCellars \? 0\.8 : 1/.test(CODE) && mana.consumptionProse);

// ============================================================================
// NOTE 2 — the job row: one row, two controls, a flyout that does not move the layout
// ============================================================================
const jobs = await page.evaluate(() => {
  loadFromString(btoa(unescape(encodeURIComponent(JSON.stringify(freshState())))));
  TECHS.forEach(t => S.techs[t.id] = 1);
  S.pop = 60; S.buildings.shelter = 20;
  S.wanderers = Array.from({ length: 60 }, (_, i) => ({ nm: "w" + i, j: null, jx: {}, xp: 0, t: "trailblazer" }));
  S.activeTab = "village"; uiDirty = true; renderAll();
  const rows = [...document.querySelectorAll(".job-row")];
  const o = { rows: rows.length,
              // one row per job, and every row a single line high
              maxRowHeight: Math.max(...rows.map(r => Math.round(r.getBoundingClientRect().height))),
              // nothing spills out of the panel at a 430px viewport — note 1 of v0.59's case
              worstOverflow: Math.max(...rows.map(r =>
                Math.round(r.getBoundingClientRect().right - r.parentElement.getBoundingClientRect().right))),
              // TWO controls per row means two `.job-ctl` wrappers, each holding exactly one
              // `.job-btn` and one `.job-flyout` — the screenshot's `[+]` and `[−]` and nothing else.
              ctlsPerRow: rows.map(r => r.querySelectorAll(".job-ctl").length),
              controlsPerRow: rows.map(r => r.querySelectorAll(".job-ctl > .job-btn").length),
              flyoutsPerRow: rows.map(r => r.querySelectorAll(".job-ctl > .job-flyout").length),
              listBottomClosed: Math.round(rows[rows.length - 1].getBoundingClientRect().bottom),
              flyoutsClosed: [...document.querySelectorAll(".job-flyout")]
                .filter(f => getComputedStyle(f).display !== "none").length,
              stepsPerFlyout: [...document.querySelectorAll(".job-flyout")]
                .map(f => [...f.children].map(c => c.textContent).join(" "))[0],
              flyoutPosition: getComputedStyle(document.querySelector(".job-flyout")).position };
  return o;
});
check("2 — one row per job, and each row is a SINGLE line (v0.59's wrap made them two)",
  jobs.rows > 0 && jobs.maxRowHeight <= 34, `${jobs.rows} rows, tallest ${jobs.maxRowHeight}px`);
check("2 — nothing spills out of the panel at a 430px viewport",
  jobs.worstOverflow <= 0, `worst overflow ${jobs.worstOverflow}px`);
check("2 — exactly TWO controls per row, each with its own flyout, as in the screenshot",
  jobs.ctlsPerRow.every(n => n === 2) && jobs.controlsPerRow.every(n => n === 2) &&
  jobs.flyoutsPerRow.every(n => n === 2) && jobs.ctlsPerRow.length === jobs.rows,
  `${JSON.stringify(jobs.ctlsPerRow)} controls / ${JSON.stringify(jobs.flyoutsPerRow)} flyouts per row`);
check("2 — the flyout is CLOSED by default and holds Kittens' 5 / 25 / all",
  jobs.flyoutsClosed === 0 && /\+5 \+25 \+all|−5 −25 −all/.test(jobs.stepsPerFlyout),
  `${jobs.flyoutsClosed} open; first flyout: "${jobs.stepsPerFlyout}"`);
check("2 — ...and it is ABSOLUTELY POSITIONED, which is what stops it moving the rows below",
  jobs.flyoutPosition === "absolute", jobs.flyoutPosition);
// The behavioural half: hover it and prove the layout does not move.
await page.hover(".job-row .job-ctl:last-of-type .job-btn");
await page.waitForTimeout(200);
const hovered = await page.evaluate(() => {
  const rows = [...document.querySelectorAll(".job-row")];
  const open = [...document.querySelectorAll(".job-flyout")].filter(f => getComputedStyle(f).display !== "none");
  return { listBottom: Math.round(rows[rows.length - 1].getBoundingClientRect().bottom),
           open: open.length, labels: open.map(f => [...f.children].map(c => c.textContent).join(" ")) };
});
check("2 — HOVERING + OPENS EXACTLY ONE FLYOUT AND MOVES NOTHING — the whole point of the note",
  hovered.open === 1 && hovered.listBottom === jobs.listBottomClosed,
  `${hovered.open} open "${hovered.labels[0]}"; list bottom ${jobs.listBottomClosed} → ${hovered.listBottom}`);

// ============================================================================
// NOTES 3, 4 and 8 — the tech tree
// ============================================================================
const tree = await page.evaluate(() => {
  const fresh = () => loadFromString(btoa(unescape(encodeURIComponent(JSON.stringify(freshState())))));
  const o = {};
  fresh();
  // NOTE 3
  o.kindlingGone = !TECHS.find(t => t.id === "kindling");
  o.techCount = TECHS.length;
  o.bankedCoalsTech = UPGRADES.find(u => u.id === "bankedCoals").tech;
  o.kindlingIsNobodysReq = TECHS.every(t => t.req !== "kindling") &&
                           UPGRADES.every(u => u.tech !== "kindling") &&
                           BUILDINGS.every(b => b.tech !== "kindling") &&
                           JOBS.every(j => j.tech !== "kindling") &&
                           EXPEDITIONS.every(e => e.tech !== "kindling");
  // the migration: a save holding kindling loses the key, and KEEPS the discovery it paid for
  fresh(); S.techs.kindling = 1; S.upgrades.bankedCoals = 1; loadFromString(serialize());
  o.migration = { kindlingSurvives: !!S.techs.kindling, bankedCoalsSurvives: !!S.upgrades.bankedCoals };
  // NOTE 4.2
  o.costs = { chemtech: TECHS.find(t => t.id === "chemtech").cost.knowledge,
              sumpEcology: TECHS.find(t => t.id === "sumpEcology").cost.knowledge };
  // NOTE 4.1 — the Sump Crawl's rewards must be RECEIVABLE the moment the hunt exists
  fresh(); S.techs.sparks = 1; S.techs.sumpEcology = 1; S.res.vigor = 1e6;
  o.revealedOnSump = { coalgas: !RES.coalgas.hidden(S), shimmer: !RES.shimmer.hidden(S) };
  const before = { coalgas: S.res.coalgas, zaunore: S.res.zaunore };
  runExpedition("sumpCrawl");
  o.crawlPays = { coalgas: S.res.coalgas - before.coalgas, zaunore: S.res.zaunore - before.zaunore };
  // ...and the old gate still works on its own
  fresh(); S.techs.chemtech = 1;
  o.revealedOnChemtech = { coalgas: !RES.coalgas.hidden(S), shimmer: !RES.shimmer.hidden(S) };
  // NOTE 4.3
  const ids = EXPEDITIONS.map(e => e.id);
  o.sumpIndex = ids.indexOf("sumpCrawl"); o.baronIndex = ids.indexOf("baron"); o.lastIndex = ids.length - 1;
  // NOTE 8
  o.harvestRitesTech = UPGRADES.find(u => u.id === "harvestRites").tech;
  o.masqueradeExists = !!TECHS.find(t => t.id === "masquerade");
  o.costAudit = auditCostGraph(); o.rawAudit = auditRawGraph();
  return o;
});
check("3 — Kindling Theory is DELETED, and the ladder is 36 techs",
  tree.kindlingGone && tree.techCount === 36, `${tree.techCount} techs`);
check("3 — ...and nothing anywhere still gates on it",
  tree.kindlingIsNobodysReq);
check("3 — Banked Coals moves to The Sump Ecology",
  tree.bankedCoalsTech === "sumpEcology", tree.bankedCoalsTech);
check("3 — the migration drops `kindling` from a save and KEEPS the discovery it paid for",
  tree.migration.kindlingSurvives === false && tree.migration.bankedCoalsSurvives === true,
  JSON.stringify(tree.migration));
check("3 — §30: `kindling` is a reserved id, and the migration names the version that retires it",
  /## 30\./.test(RULINGS) && /delete fresh\.techs\.kindling/.test(CODE) &&
  /RESERVED ID[\s\S]{0,400}RETIRES AT\n\s*\/\/ v1\.0/.test(RAW));
check("4.2 — the two costs are SWAPPED: Chemtech 55,000, Sump Ecology 60,000",
  tree.costs.chemtech === 55000 && tree.costs.sumpEcology === 60000, JSON.stringify(tree.costs));
check("4.1 — coalgas and shimmer are VISIBLE on Sump Ecology, not only on Chemtech",
  tree.revealedOnSump.coalgas && tree.revealedOnSump.shimmer, JSON.stringify(tree.revealedOnSump));
check("4.1 — ...and Chemtech alone still reveals them, so the old path is untouched",
  tree.revealedOnChemtech.coalgas && tree.revealedOnChemtech.shimmer, JSON.stringify(tree.revealedOnChemtech));
check("4.1 — THE HUNT'S YIELD ACTUALLY LANDS: the Sump Crawl pays coalgas and Zaun Ore",
  tree.crawlPays.coalgas > 0 && tree.crawlPays.zaunore > 0, JSON.stringify(tree.crawlPays));
check("4.3 — the Sump Crawl is AFTER Baron Nashor, and is the last expedition in the list",
  tree.sumpIndex > tree.baronIndex && tree.sumpIndex === tree.lastIndex,
  `sumpCrawl at ${tree.sumpIndex}, baron at ${tree.baronIndex}, last is ${tree.lastIndex}`);
check("8 — Harvest Rites unlocks from Masquerade, not Songcraft",
  tree.harvestRitesTech === "masquerade" && tree.masqueradeExists, tree.harvestRitesTech);
check("3/4/8 — the cost and raw graphs are both still clean after four tech-tree moves",
  tree.costAudit.length === 0 && tree.rawAudit.length === 0,
  `${JSON.stringify(tree.costAudit)} / ${JSON.stringify(tree.rawAudit)}`);

// ============================================================================
// NOTE 5 — a bulk hunt writes ONE chronicle line, carrying the total
// ============================================================================
const chron = await page.evaluate(() => {
  const fresh = () => loadFromString(btoa(unescape(encodeURIComponent(JSON.stringify(freshState())))));
  fresh(); TECHS.forEach(t => S.techs[t.id] = 1);
  S.res.vigor = 1e7; S.buildings.hallOfHeroes = 400;
  const o = {};
  S.log = []; runExpeditionBulk("krugs", 20);
  o.bulk = { lines: S.log.length, text: (S.log[0] || {}).text };
  S.log = []; runExpeditionBulk("krugs", 1);
  o.bulkOfOne = { lines: S.log.length, text: (S.log[0] || {}).text };
  S.log = []; runExpedition("krugs");
  o.single = { lines: S.log.length, text: (S.log[0] || {}).text };
  o.muteIsACounter = true;
  return o;
});
check("5 — a ×20 bulk hunt writes EXACTLY ONE chronicle line, not twenty-one",
  chron.bulk.lines === 1, `${chron.bulk.lines} lines: "${chron.bulk.text}"`);
check("5 — ...and that line carries the TOTAL yield and the total price",
  /×20/.test(chron.bulk.text) && /\+/.test(chron.bulk.text) && /for −/.test(chron.bulk.text),
  chron.bulk.text);
check("5 — a bulk of ONE still reads like a single hunt, flavour and all",
  chron.bulkOfOne.lines === 1 && chron.bulkOfOne.text === chron.single.text.replace(/\+\d+/g, m => m) ||
  (chron.bulkOfOne.lines === 1 && !/×1/.test(chron.bulkOfOne.text)),
  `"${chron.bulkOfOne.text}" vs single "${chron.single.text}"`);
check("5 — the mute is a COUNTER, not a boolean, so nested batches cannot un-mute each other",
  /var logMuted = 0;/.test(CODE) && /if \(logMuted > 0\) return;/.test(CODE) &&
  /logMuted\+\+/.test(CODE) && /logMuted--/.test(CODE));

// ============================================================================
// NOTE 7 — the Manufactory as a real crystal sink, and Kittens' Workshop Automation
// ============================================================================
const fac = await page.evaluate(() => {
  const fresh = () => loadFromString(btoa(unescape(encodeURIComponent(JSON.stringify(freshState())))));
  const o = {};
  fresh();
  const b = BUILDINGS.find(x => x.id === "manufactory");
  o.buildCost = b.cost; o.ratio = b.ratio; o.fuel = MANUFACTORY_FUEL;
  o.discoveries = Object.fromEntries(["pressureRegulators", "rollingPress", "automatedWorkshop"]
    .map(id => [id, UPGRADES.find(u => u.id === id).cost.crystals]));
  // the burn, measured rather than read off the constant
  TECHS.forEach(t => S.techs[t.id] = 1);
  S.buildings = { manufactory: 10 }; S.res.crystals = 1e6; S.res.mana = 1e6; S.upgrades = {};
  o.burnAtTen = +computeRates().crystals.toFixed(4);
  // ---- 7.2 : automation is a SPILL-GUARD ----
  const run = fill => {
    fresh(); TECHS.forEach(t => S.techs[t.id] = 1);
    S.upgrades = { automatedWorkshop: 1 };
    S.buildings = { manufactory: 5, storehouse: 40, warehouse: 20 };
    const caps = computeCaps();
    S.res.timber = caps.timber * fill; S.res.ore = caps.ore * fill;
    S.res.beam = 0; S.res.stoneSlab = 0; S.log = [];
    const t0 = S.res.timber, o0 = S.res.ore;
    manufactoryYear();
    return { beams: Math.round(S.res.beam), slabs: Math.round(S.res.stoneSlab),
             timberSpent: Math.round(t0 - S.res.timber), oreSpent: Math.round(o0 - S.res.ore),
             lines: S.log.length };
  };
  o.at50 = run(0.50); o.at94 = run(0.94); o.atCeiling = run(1.00);
  o.trigger = AUTOMATION_TRIGGER; o.share = AUTOMATION_SHARE;
  o.noFlatGrant = true;
  return o;
});
check("7 — the Manufactory costs far more crystals, and the ratio is UNTOUCHED at 1.15",
  fac.buildCost.crystals === 400 && fac.ratio === 1.15,
  `${fac.buildCost.crystals} crystals at ratio ${fac.ratio}`);
check("7.1 — ...and it BURNS accordingly: 0.12/s per copy, six times what it was",
  fac.fuel === 0.12 && Math.abs(fac.burnAtTen + 1.2) < 1e-4,
  `${fac.fuel}/s per copy, ${fac.burnAtTen}/s at ten copies`);
check("7 — all three Manufactory discoveries are dearer, and dearer IN CRYSTALS",
  fac.discoveries.pressureRegulators === 600 && fac.discoveries.rollingPress === 450 &&
  fac.discoveries.automatedWorkshop === 900, JSON.stringify(fac.discoveries));
check("7.2 — automation does NOTHING below the 95% trigger, at 50% or at 94%",
  fac.at50.beams === 0 && fac.at50.slabs === 0 && fac.at94.beams === 0 && fac.at94.slabs === 0 &&
  fac.trigger === 0.95,
  `50%: ${JSON.stringify(fac.at50)}  94%: ${JSON.stringify(fac.at94)}`);
check("7.2 — AT the ceiling it converts the overflow into beams and slabs",
  fac.atCeiling.beams > 0 && fac.atCeiling.slabs > 0, JSON.stringify(fac.atCeiling));
check("7.2 — ...and it PAYS for them: this is a spill-guard, not a faucet",
  fac.atCeiling.timberSpent > 0 && fac.atCeiling.oreSpent > 0,
  `spent ${fac.atCeiling.timberSpent} timber and ${fac.atCeiling.oreSpent} ore`);
check("7.2 — the v0.58.1 yearly FLAT GRANT of four goods out of nothing is gone",
  !/MANUFACTORY_AUTOCRAFT/.test(CODE) && /AUTOMATION_TRIGGER/.test(CODE) &&
  /AUTOMATION_PAIRS/.test(CODE));
check("7.2 — a whole year of automation writes ONE chronicle line",
  fac.atCeiling.lines === 1, `${fac.atCeiling.lines} lines`);
check("7.2 — the RR-ORIGINAL share is labelled UNVERIFIED, not dressed up as parity",
  /AUTOMATION_SHARE/.test(RAW) && /RR-ORIGINAL magnitude/.test(RAW) &&
  /Workshop Automation/.test(LEDGER) && /UNVERIFIED/.test(LEDGER));

// ============================================================================
// THE ROUND ITSELF — off-cycle bookkeeping (OFF-CYCLE-PROTOCOL §1 and §4)
// ============================================================================
const version = await page.evaluate(() => VERSION);
check("§1 — this is an OFF-CYCLE round, so it takes a POINT release off v0.59",
  /^v0\.\d\d\.\d+$/.test(version) && version === "v0.59.1", version);
check("§1 — ...and the footer is rendered from the constant",
  await page.evaluate(() => (document.body.innerText || "").indexOf(VERSION) > -1));
check("§2 — the notes artefact is CONSUMED: moved to docs/specs/, gone from the repo root", (() => {
  let archived = false, rootGone = false;
  try { readFileSync(new URL("../docs/specs/rr-devnotes-v0.59.1.md", import.meta.url)); archived = true; } catch (e) {}
  try { readFileSync(new URL("../dev-notes-build.md", import.meta.url)); } catch (e) { rootGone = true; }
  return archived && rootGone;
})());
check("§3 — no pending analyzer spec was consumed: the repo root has none to consume", (() => {
  try { readFileSync(new URL("../current-build-spec.md", import.meta.url)); return false; } catch (e) { return true; }
})());
// The ledger enumerates by ID, so the rows are matched on the ids and on the phrases the
// standing-divergence rows actually carry — one probe per note, so a note that ships without
// a row fails here rather than being noticed a round later.
check("§3 — every one of the eight notes has its ledger row",
  /v0\.59\.1 NOTE 1/.test(LEDGER) &&          // 1 — leylineCalibration re-rated
  /v0\.59\.1 NOTE 2/.test(LEDGER) &&          // 2 — the job row
  /v0\.59\.1 NOTE 3/.test(LEDGER) &&          // 3 — Kindling Theory deleted
  /v0\.59\.1 NOTE 4\.1/.test(LEDGER) && /v0\.59\.1 NOTE 4\.2/.test(LEDGER) &&
  /v0\.59\.1 NOTE 4\.3/.test(LEDGER) &&      // 4 — all three sub-notes
  /v0\.59\.1 NOTE 5/.test(LEDGER) &&          // 5 — the bulk chronicle
  /v0\.59\.1 NOTE 6/.test(LEDGER) &&          // 6 — True Ice Cellars
  /v0\.59\.1 NOTE 7/.test(LEDGER) && /v0\.59\.1 NOTE 7\.2/.test(LEDGER) &&
  /v0\.59\.1 NOTE 8/.test(LEDGER),            // 8 — Harvest Rites
  "all eight notes present in docs/PARITY-LEDGER.md");
check("no console errors across the whole suite", errors.length === 0, errors.slice(0, 3).join(" | "));

console.log(`\n${pass} passed, ${fail} failed`);
await browser.close();
process.exit(fail ? 1 : 0);
