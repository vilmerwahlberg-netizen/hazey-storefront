// TASK 10B-R1 -- adaptertäckning för samtliga publicerade PDP:er (dagens
// Nyehandel-sitemap, runs/all-pdp-routes.txt). Per produkt i den riktiga
// Theme 8-previewn (lokal build): id, route, H1, varumärke (renderad DOM),
// formatmedlemskap, adaptern aktiv, listning (Task 10A routes.tsv).
// node coverage.mjs <which> <part 0|1> <parts>   -> runs/coverage-<which>-<part>.json
import { chromium, ctxFor, open, ready, DIR } from "./lib.mjs"; import fs from "node:fs";
const [which = "after", part = "0", parts = "1"] = process.argv.slice(2);
const all = fs.readFileSync(`${DIR}/runs/all-pdp-routes.txt`, "utf8").trim().split("\n");
const listing = {}; fs.readFileSync("/Users/wahlberg/HZY/hemsidor/hazey-storefront-task10a/theme8/review/pdp-capability-inventory-2026-10/routes.tsv", "utf8").trim().split("\n").slice(1).forEach(l => { const c = l.split("\t"); listing[c[1]] = { id: +c[0], format: c[2], listing: c[5] }; });
const mine = all.filter((_, i) => i % +parts === +part);
const b = await chromium.launch(); const rows = [];
for (const route of mine) {
  const ctx = await ctxFor(b, 1440, 900, { which });
  let r = { route };
  try {
    const p = await open(ctx, route); await ready(p, 2500);
    await p.waitForFunction(() => document.querySelector(".product-detail__information h1"), null, { timeout: 15000 }).catch(() => {});
    Object.assign(r, await p.evaluate(() => {
      const b = document.querySelector(".product-detail__information .brand a");
      const fm = [...document.querySelectorAll(".related-categories a[href]")].map(a => { const c = window.HZ8 && HZ8.catalog && HZ8.catalog.contextFor(a.href); return c && c.format && (c.type === "format" || c.type === "combo") ? c.format.key : null; }).filter(Boolean);
      return { id: +(document.documentElement.innerHTML.match(/viewProduct\(.(\d+)/) || [])[1] || null, h1: (document.querySelector(".product-detail__information h1") || {}).textContent?.trim().slice(0, 70) || null,
        brand: b ? b.textContent.trim() : null, formats: [...new Set(fm)], adapter: document.documentElement.classList.contains("hz8-pdp-pilot"),
        pdpOut: document.documentElement.classList.contains("hz8-pdp-out"), h1s: document.querySelectorAll("h1:not([role=heading])").length, overflowX: document.documentElement.scrollWidth > innerWidth + 1 };
    }));
    r.errors = p.errors.length;
  } catch (e) { r.error = String(e).slice(0, 120); }
  Object.assign(r, { listing: (listing[route] || {}).listing || "okänd", format10a: (listing[route] || {}).format || "" });
  rows.push(r); console.log(JSON.stringify(r));
  await ctx.close();
}
fs.writeFileSync(`${DIR}/runs/coverage-${which}-${part}.json`, JSON.stringify(rows, null, 1));
await b.close();
