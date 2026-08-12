import { openGame } from "../sim/simcore.mjs";
const file = process.argv[2] || undefined;
const { browser, page } = await openGame(file);
const out = await page.evaluate(() => {
  loadFromString(btoa(unescape(encodeURIComponent(JSON.stringify(freshState())))));
  TECHS.forEach(t => S.techs[t.id] = 1);
  UPGRADES.forEach(u => S.upgrades[u.id] = 1);
  WTECHS.forEach(w => S.wtechs[w.id] = 1);
  BUILDINGS.forEach(b => S.buildings[b.id] = 20);
  CHAMPS.forEach(c => S.champs[c.id] = { r: 1, lvl: 10 });
  POLICY_GROUPS.forEach(g => { S.policies[g.id ? g.options[0].id : ""] = true; g.options.forEach(o=>{}); });
  S.pop = 200;
  const k = computeRates("mana")._knee;
  const knee = {}; Object.keys(k).filter(f=>f[0]!=="_").forEach(f => knee[f] = {
    cap:k[f].cap, knee:k[f].knee, raw:k[f].raw, delivered:k[f].delivered, thrown:k[f].thrownAwayPct, past:k[f].pastKnee });
  const auto = convMultBreakdown(true), worked = convMultBreakdown(false);
  return {
    knee,
    autoProduct:+auto.product.toFixed(4), workedProduct:+worked.product.toFixed(4),
    autoTerms: auto.terms.map(t=>[t.label, +t.value.toFixed(4)]),
    boostLimit: BOOST_LIMIT,
    version: VERSION,
  };
});
console.log(JSON.stringify(out));
await browser.close();
