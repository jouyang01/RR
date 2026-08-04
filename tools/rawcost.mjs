import { chromium } from "playwright";
const browser = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium" }).catch(() => chromium.launch());
const page = await browser.newPage();
await page.goto(new URL("../index.html", import.meta.url).href);
await page.waitForTimeout(400);
const rows = await page.evaluate(() => {
  const byOut = {}; CRAFTS.forEach(c => byOut[c.out] = c);
  function raw(cost, d) { d=d||0; const o={}; if(d>12) return o;
    for (const k in cost) { const c=byOut[k];
      if(!c){o[k]=(o[k]||0)+cost[k];continue;}
      const per=c.amount||1, sc=cost[k]/per, sub=raw(c.cost,d+1);
      for(const j in sub) o[j]=(o[j]||0)+sub[j]*sc; } return o; }
  return BUILDINGS.filter(b => ["Zaun","Industry"].includes(b.group))
    .map(b => ({ id: b.id, group: b.group, tech: b.tech, cost: b.cost, raw: raw(b.cost),
                 zaun: +((raw(b.cost).zaunore||0)).toFixed(0),
                 conv: b.convert ? b.convert.output : null }));
});
rows.sort((a,b)=>a.zaun-b.zaun);
for (const r of rows) console.log(String(r.zaun).padStart(6), r.id.padEnd(18), r.group.padEnd(9), JSON.stringify(r.raw));
await browser.close();
