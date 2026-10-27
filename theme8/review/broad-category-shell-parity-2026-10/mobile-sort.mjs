// TASK 01G -- motsvarigheten till funktionssvitens "allavapes-mobile-sort"
// i familjens nya kontroll: mobil Alla Vapes har (som Buds/Hasch) EN
// "Filter & sortera" i flödet; Sortera ligger i samma ark. Samma påstående:
// "Pris: högst först" -> ?sort=price_high och fallande priser.
// node mobile-sort.mjs before|after
import { chromium, ctxFor, open, ready, DIR } from "./lib.mjs"; import fs from "node:fs";
const which = process.argv[2] || "after"; const b = await chromium.launch(); const out = {};
for (const r of ["/sv/categories/alla-vapes", "/sv/categories/blommor-buds"]) {
  const ctx = await ctxFor(b, 393, 852, { which }); const p = await open(ctx, r); await ready(p, 6000);
  await p.click(".hz8-ptool__mob .hz8-ptool__filter"); await p.waitForTimeout(700);
  await p.evaluate(() => { const b = document.querySelector('#hz8-pfilter [data-acc="sort"] .hz8-pacc__btn'); if (b && b.getAttribute("aria-expanded") !== "true") b.click(); }); await p.waitForTimeout(400);
  await p.click('#hz8-pfilter .hz8-psort >> text="Pris: högst först"'); await p.waitForTimeout(7000);
  const s = await p.evaluate(() => ({ url: location.search.replace(/&?preview=[^&]+/, ""), sheetClosed: document.querySelector("#hz8-pfilter").hidden, prices: [...document.querySelectorAll(".hz8-series-results .product-card .price ins, .hz8-series-results .product-card .price:not(.has-comparison)")].slice(0, 8).map(e => parseInt(e.textContent.replace(/\D/g, ""), 10)) }));
  s.descending = s.prices.length > 2 && s.prices.every((v, i, a) => !i || a[i - 1] >= v); s.errors = p.errors;
  out[r] = s; await ctx.close();
}
fs.writeFileSync(`${DIR}/runs/mobile-sort-${which}.json`, JSON.stringify(out, null, 1)); console.log(JSON.stringify(out)); await b.close();
