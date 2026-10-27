// TASK 01G -- hittar ett riktigt tomt läge per rutt: en serie i flikarna +
// I lager som ger 0 produkter (aldrig ett påhittat tillstånd). Skriver
// runs/empty-probe.json { vapes|buds|hasch: "?serie=...&filters=..." }.
import { chromium, ctxFor, open, ready, url, DIR } from "./lib.mjs"; import fs from "node:fs";
const ROUTE = { vapes: "/sv/categories/alla-vapes", buds: "/sv/categories/blommor-buds", hasch: "/sv/categories/hasch" };
const b = await chromium.launch(); const out = {}, log = {};
for (const r of Object.keys(ROUTE)) {
  const ctx = await ctxFor(b, 1440, 900, { which: "after" }); const p = await open(ctx, ROUTE[r]); await ready(p, 5000);
  const slugs = await p.evaluate(() => [...document.querySelectorAll(".hz8-ptool__desk .hz8-popt[data-hz8-series]")].map(e => { const n = e.getAttribute("data-hz8-series"); const s = HZ8.catalog.build().series.find(x => x.name === n); try { return HZ8.catalog.seriesSlug(s); } catch (err) { return n.toLowerCase().replace(/[^a-z0-9]+/g, "-"); } }));
  log[r] = [];
  for (const s of slugs) {
    const q = `?serie=${s}&filters=smart-filter_in-stock`;
    await p.goto(url(ROUTE[r] + q), { waitUntil: "domcontentloaded" }); await ready(p, 5000);
    const c = await p.evaluate(() => ({ count: (document.querySelector(".hz8-pcount") || {}).textContent, cards: [...document.querySelectorAll(".hz8-series-results .product-card")].filter(e => e.getClientRects().length).length, status: (document.querySelector(".hz8-pstatus") || {}).textContent.trim().slice(0, 80) }));
    log[r].push({ q, ...c });
    if (/^0 /.test(c.count || "") || (c.cards === 0 && c.status)) { out[r] = q; break; }
  }
  await ctx.close();
}
fs.writeFileSync(`${DIR}/runs/empty-probe.json`, JSON.stringify(out, null, 1)); fs.writeFileSync(`${DIR}/runs/empty-probe-log.json`, JSON.stringify(log, null, 1));
console.log(JSON.stringify(out), JSON.stringify(log).slice(0, 1500)); await b.close();
