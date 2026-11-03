// TASK 17 — Nyehandels filterfacetter per kategori (GET /frontend-api/products/filters, samma anrop som
// kategorisidornas filterpanel). Visar vilka Serie-/Varumärke-/Volym-värden som finns efter migreringen.
// Kör: node facets.mjs  ->  runs/nh-facets.json
import fs from "node:fs";
import path from "node:path";
const DIR = path.dirname(new URL(import.meta.url).pathname);
const O = "https://hazeyse.nyehandel.se";
const UA = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36";
const NH = JSON.parse(fs.readFileSync(path.join(DIR, "runs/nh.json"), "utf8"));
const sleep = ms => new Promise(r => setTimeout(r, ms));
const out = {};
for (const route of Object.keys(NH.categories)) {
  const h = await (await fetch(O + route, { headers: { "User-Agent": UA } })).text();
  const id = (/<product-filter category-id="(\d+)"/.exec(h) || [])[1] || null;
  let facets = null;
  if (id) {
    const r = await fetch(`${O}/frontend-api/products/filters?filters=&categoryId=${id}`, { headers: { "User-Agent": UA, Accept: "application/json", "X-Requested-With": "XMLHttpRequest" } });
    const j = await r.json().catch(() => null);
    const list = Array.isArray(j) ? j : (j && (j.data || j.filters)) || [];
    facets = list.map(f => ({ name: f.name || f.title || f.key, values: (f.values || f.options || []).map(v => ({ name: v.name || v.title || v.value, count: v.count ?? v.products_count ?? null, key: v.key || v.slug || null })) }));
    if (!list.length) facets = { raw: JSON.stringify(j).slice(0, 600) };
  }
  out[route] = { categoryId: id, facets };
  process.stdout.write(`${route} id=${id} ${Array.isArray(facets) ? facets.map(f => f.name).join("|") : JSON.stringify(facets).slice(0, 120)}\n`);
  await sleep(250);
}
fs.writeFileSync(path.join(DIR, "runs/nh-facets.json"), JSON.stringify(out, null, 1));
