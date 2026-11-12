// TASK 23b: läsande inventering av flerpackskort i Nyehandels listor (serverrenderade kategorisidor, alla sidor).
// Källor = katalogkartans format-, serie- och hubbsidor + Alla produkter. Inga ändringar.
import fs from "node:fs"; import path from "node:path";
import { chromium, ctxFor, open, ready } from "../../catalog-reconciliation-2026-11/lib/harness.mjs";
const DIR = path.dirname(new URL(import.meta.url).pathname);
const b = await chromium.launch(); const ctx = await ctxFor(b, 1440, 1000, { which: "after" });
const p = await open(ctx, "/sv/categories/alla-vapes"); await ready(p, 2000);
const out = await p.evaluate(async () => {
  const map = window.HZ8.catalog.build();
  const routes = new Set();
  routes.add(map.all.href);
  map.formats.forEach(f => routes.add(f.href));
  map.series.forEach(s => { if (s.hub) routes.add(s.hub); Object.values(s.routes).forEach(r => routes.add(r)); });
  const abs = r => new URL(r, location.origin).pathname;
  const res = {};
  const MULTI = /([-–]\s*\d+\s*-?\s*pack\b|kollektion|startpaket|\b\d+\s*[x×]\s|\bbundle\b|\bkit\b|\bset\b)/i;
  for (const r0 of [...routes]) {
    const r = abs(r0);
    let page = 1, cards = [], total = null;
    while (page <= 12) {
      const h = await (await fetch(r + (page > 1 ? "?page=" + page : ""), { credentials: "same-origin" })).text();
      const doc = new DOMParser().parseFromString(h, "text/html");
      const cs = [...doc.querySelectorAll("#category-products .product-card")];
      if (total == null) { const m = (doc.getElementById("products_count") || {}).textContent; total = m ? +(m.match(/\d+/) || [0])[0] : cs.length; }
      cs.forEach(c => { const a = c.querySelector("a[href*='/products/']"); cards.push({ name: (c.querySelector(".name") || {}).textContent?.replace(/\s+/g, " ").trim(), path: a ? new URL(a.href).pathname : "", stock: !c.querySelector(".out-of-stock, .is-out-of-stock") }); });
      if (!cs.length || cards.length >= total) break; page++;
    }
    res[r] = { total, multi: cards.filter(c => MULTI.test(c.name || "")) };
  }
  return res;
});
const byProduct = {};
for (const [r, v] of Object.entries(out)) for (const c of v.multi) { (byProduct[c.path] = byProduct[c.path] || { name: c.name, lists: [] }).lists.push(r); }
fs.writeFileSync(path.join(DIR, "audit-multipacks.json"), JSON.stringify({ checkedAt: new Date().toISOString(), lists: out, byProduct }, null, 1));
for (const [pth, v] of Object.entries(byProduct).sort((a, b) => a[1].name.localeCompare(b[1].name))) console.log(v.name, "|", pth, "|", v.lists.map(x => x.replace("/sv/categories/", "")).join(", "));
await b.close();
