// TASK 23b/c: läsande -- THCA-B/THCaB-produkter i Nyehandels listor och produkter i serie x format-routes som inte
// finns på formatets egen sida (felplacerade). Inga ändringar.
import fs from "node:fs"; import path from "node:path";
import { chromium, ctxFor, open, ready } from "../../catalog-reconciliation-2026-11/lib/harness.mjs";
const DIR = path.dirname(new URL(import.meta.url).pathname);
const b = await chromium.launch(); const ctx = await ctxFor(b, 1440, 1000, { which: "after" });
const p = await open(ctx, "/sv/categories/alla-vapes"); await ready(p, 2000);
const out = await p.evaluate(async () => {
  const C = window.HZ8.catalog, map = C.build();
  const list = async r => { const res = []; for (let pg = 1; pg < 12; pg++) { const d = new DOMParser().parseFromString(await (await fetch(new URL(r, location.origin).pathname + (pg > 1 ? "?page=" + pg : ""))).text(), "text/html"); const cs = [...d.querySelectorAll("#category-products .product-card")]; cs.forEach(c => res.push({ n: c.querySelector(".name").textContent.replace(/\s+/g, " ").trim(), p: new URL(c.querySelector("a[href*='/products/']").href).pathname })); if (cs.length < 25) break; } return res; };
  const fmt = {}; for (const f of map.formats) fmt[f.key] = new Set((await list(f.href)).map(x => x.p));
  const misplaced = [], thcab = {};
  for (const s of map.series) for (const [k, r] of Object.entries(s.routes)) {
    const cards = await list(r);
    cards.forEach(c => { if (fmt[k] && !fmt[k].has(c.p)) misplaced.push({ route: new URL(r, location.origin).pathname, format: k, product: c.n, path: c.p }); });
  }
  for (const r of [map.all.href, ...map.formats.map(f => f.href), ...map.series.map(s => s.hub).filter(Boolean), ...map.series.flatMap(s => Object.values(s.routes))]) {
    (await list(r)).forEach(c => { if (/thca-?b|thcab/i.test(c.n + " " + c.p)) { (thcab[c.p] = thcab[c.p] || { name: c.n, lists: [] }).lists.push(new URL(r, location.origin).pathname.replace("/sv/categories/", "")); } });
  }
  return { misplaced, thcab };
});
fs.writeFileSync(path.join(DIR, "audit-misplaced.json"), JSON.stringify({ checkedAt: new Date().toISOString(), ...out }, null, 1));
console.log("FELPLACERADE (finns i serie x format men inte på formatets sida):"); out.misplaced.forEach(m => console.log(" ", m.route, "|", m.format, "|", m.product));
console.log("THCA-B/THCaB I LISTOR:"); Object.values(out.thcab).forEach(t => console.log(" ", t.name, "|", [...new Set(t.lists)].join(", ")));
await b.close();
