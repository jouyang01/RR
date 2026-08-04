import { chromium } from "playwright";

const browser = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium" }).catch(() => chromium.launch());
const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
const errors = [];
page.on("console", m => { if (m.type() === "error") errors.push(m.text()); });
page.on("pageerror", e => errors.push(String(e)));

await page.goto(new URL("../index.html", import.meta.url).href);
await page.waitForTimeout(500);
let pass = 0, fail = 0;
const check = (name, cond, extra) => { console.log(name + ":", cond ? "PASS" : "FAIL", extra ?? ""); cond ? pass++ : fail++; };

// 1. Old bespoke silos are gone; three tiers exist with the right tech gates
const roster = await page.evaluate(() => {
  const ids = BUILDINGS.map(b => b.id);
  const s = BUILDINGS.find(b => b.id === "storehouse");
  const w = BUILDINGS.find(b => b.id === "warehouse");
  const h = BUILDINGS.find(b => b.id === "harbor");
  return {
    noGranary: !ids.includes("granary"), noRunestone: !ids.includes("runestone"),
    techs: [s.tech, w.tech, h.tech], ratios: [s.ratio, w.ratio, h.ratio]
  };
});
check("granary & runestone removed", roster.noGranary && roster.noRunestone);
check("tiers gated: cultivation/mining/trade", JSON.stringify(roster.techs) === '["cultivation","mining","trade"]', JSON.stringify(roster.techs));
check("barn-style ratios: 1.75 / 1.15 / 1.15", JSON.stringify(roster.ratios) === "[1.75,1.15,1.15]", JSON.stringify(roster.ratios));

// 2. Generalist caps: one storehouse raises multiple materials at once
const caps = await page.evaluate(() => {
  const base = computeCaps();
  S.buildings.storehouse = 1;
  const s1 = computeCaps();
  S.buildings.warehouse = 1;
  const w1 = computeCaps();
  S.buildings.harbor = 1;
  const h1 = computeCaps();
  return {
    store: { prov: s1.provisions - base.provisions, timber: s1.timber - base.timber, ore: s1.ore - base.ore, mana: s1.mana - base.mana },
    wh: { timber: w1.timber - s1.timber, steel: w1.steel - s1.steel, gold: w1.gold - s1.gold, prov: w1.provisions - s1.provisions },
    harbor: { prov: h1.provisions - w1.provisions, crystals: h1.crystals - w1.crystals, gold: h1.gold - w1.gold }
  };
});
check("storehouse: +750 prov/+200 timber/+150 ore/+100 mana", caps.store.prov === 750 && caps.store.timber === 200 && caps.store.ore === 150 && caps.store.mana === 100, JSON.stringify(caps.store));
check("warehouse stores materials, NOT provisions", caps.wh.timber === 400 && caps.wh.steel === 100 && caps.wh.gold === 80 && caps.wh.prov === 0, JSON.stringify(caps.wh));
check("harbor stores everything incl. crystals", caps.harbor.prov === 1000 && caps.harbor.crystals === 20 && caps.harbor.gold === 200, JSON.stringify(caps.harbor));

// 3. Reinforced Storehouses: +75% on storehouses ONLY
const reinforced = await page.evaluate(() => {
  S.buildings.storehouse = 2; S.buildings.warehouse = 2; S.buildings.harbor = 0;
  const before = computeCaps();
  S.upgrades.reinforcedStorehouses = true;
  const after = computeCaps();
  S.upgrades.reinforcedStorehouses = false;
  return {
    provDelta: after.provisions - before.provisions,     // 2*750*0.75 = 1125
    timberDelta: after.timber - before.timber            // storehouse part only: 2*200*0.75 = 300
  };
});
check("reinforced: storehouse caps +75%", reinforced.provDelta === 1125 && reinforced.timberDelta === 300, JSON.stringify(reinforced));

// 4. Science buildings still produce AND cap (the Kittens taxonomy)
const sci = await page.evaluate(() => {
  const a = BUILDINGS.find(b => b.id === "archive");
  return { hasCap: a.caps.knowledge === 250, hasBoost: a.boost.knowledge === 0.10 };
});
check("archive: production boost + cap (science pattern)", sci.hasCap && sci.hasBoost);

// 5. Migration: granary/runestone saves convert to storehouses
const mig = await page.evaluate(() => {
  const fake = JSON.parse(JSON.stringify(S));
  fake.buildings = Object.assign({}, S.buildings, { granary: 3, runestone: 2, storehouse: 1, warehouse: 0, harbor: 0 });
  fake.lastSaved = Date.now();
  loadFromString(btoa(unescape(encodeURIComponent(JSON.stringify(fake)))));
  return { store: S.buildings.storehouse, granary: S.buildings.granary, runestone: S.buildings.runestone };
});
check("granary+runestone migrate into storehouses (3+2+1=6)", mig.store === 6 && mig.granary === undefined && mig.runestone === undefined, JSON.stringify(mig));

// 6. Regressions
const reg = await page.evaluate(() => {
  const out = {};
  gain("mana", 999999); out.capClamp = S.res.mana <= computeCaps().mana + 0.01;
  S.buildings.archive = 6; gain("knowledge", 99999);
  buyTech("almanac"); buyTech("cultivation"); out.techBuy = S.techs.cultivation;
  gain("furs", 50); craftItem("parchment", 1); out.craft = S.res.parchment >= 1;
  S.techs.logistics = true; S.res.vigor = 40; const f0 = S.res.furs; runExpedition("wolves"); out.wolves = S.res.furs > f0;
  const str = serialize(); S.res.mana = 0; loadFromString(str); out.saveRT = S.res.mana > 0;
  return out;
});
for (const [k, v] of Object.entries(reg)) check("regression: " + k, v === true);

for (const tab of ["village", "lore", "wilds", "settlement"]) {
  await page.evaluate(t => { S.buildings.archive = Math.max(1, S.buildings.archive || 0); S.buildings.shelter = Math.max(1, S.buildings.shelter || 0); S.upgrades.keepingTheRolls = true; S.activeTab = t; renderAll(); }, tab);
}
check("all tabs render, no console errors", errors.length === 0, errors.join(" | "));

console.log("\n" + pass + " passed, " + fail + " failed");
await browser.close();
process.exit(fail > 0 ? 1 : 0);
