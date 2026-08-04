import { chromium } from "playwright";
const b = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium" }).catch(() => chromium.launch());
const p = await b.newPage();
p.on("pageerror", e => console.log("PAGEERROR", e.message));
await p.goto(new URL("../index.html", import.meta.url).href);
await p.waitForTimeout(300);
console.log(await p.evaluate(() => {
  // An Era-3 state roughly matching the measured run: 201 pop, the counts the log reports.
  const setup = () => {
    TECHS.forEach(t => S.techs[t.id] = true);
    UPGRADES.forEach(u => S.upgrades[u.id] = true);
    S.buildings = { farmstead: 60, manaWell: 60, lumberMill: 40, mine: 40, quarry: 40,
      archive: 20, academy: 20, observatory: 40, hexLab: 20, forge: 20, refinery: 20,
      workshop: 40, storehouse: 40, warehouse: 30, harbor: 20, tavern: 57, shelter: 60,
      hextechFoundry: 7, arcaneReactor: 12, hexdraulicPlant: 8, sumpMine: 20,
      coalgasVent: 20, hexQuarry: 20, chembarrel: 20, augmentChamber: 16 };
    S.pop = 201; S.wanderers = []; syncRoster();
    S.jobs = { farmer: 60, woodcutter: 40, miner: 40, loremaster: 30, arcanist: 20, tinkerer: 11 };
    S.policies = {}; S.champs = {}; S.wtechs = {}; S.drakes = {}; S.leader = null; S.worship = 0;
    for (const r in RES) if (S.res[r] !== undefined) S.res[r] = 1e7;
  };
  setup();
  const base = computeRates();

  // (a) the Farmstead's new provisions boost, at the measured Farmstead count
  const fs = BUILDINGS.find(x => x.id === "farmstead");
  const keep = fs.boost; delete fs.boost;
  const noFarm = computeRates();
  fs.boost = keep;

  // (b) hexresonance: gross (boosts.mana, v0.50) vs net (resRatio.mana, v0.49)
  setup();
  const withHex = computeRates().mana;
  S.upgrades.hexresonance = false;
  const noHex = computeRates().mana;
  // what the OLD shape would have given: +25% on the NET rate
  const oldShape = noHex * 1.25;

  setup();
  return JSON.stringify({
    farmsteadCount: 60,
    provisionsWith: +base.provisions.toFixed(2),
    provisionsWithout: +noFarm.provisions.toFixed(2),
    farmsteadBoostWorth: +(base.provisions / noFarm.provisions).toFixed(4),
    manaNoHex: +noHex.toFixed(2),
    manaGross_v050: +withHex.toFixed(2),
    manaNet_v049shape: +oldShape.toFixed(2),
    hexresonanceNowWorth: +(withHex / noHex).toFixed(4),
    hexresonanceWasWorth: 1.25
  }, null, 1);
}));
await b.close();
