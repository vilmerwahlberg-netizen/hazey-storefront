// TASK 04 — native Serie-attribute membership (read-only GET).
// Läser runs/inventory.json, hämtar varje Serie-värde som Nyehandels egen
// facett exponerar, filtrerat på de breda format-/strukturkategorierna,
// och skriver runs/membership.json: produkt -> serie-attribut + kategorier.
// Kör efter inventory.mjs: node membership.mjs
import fs from "node:fs";
import path from "node:path";

const DIR = path.dirname(new URL(import.meta.url).pathname);
const ORIGIN = "https://hazeyse.nyehandel.se";
const UA = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36";
const inv = JSON.parse(fs.readFileSync(path.join(DIR, "runs/inventory.json"), "utf8"));
const sleep = ms => new Promise(r => setTimeout(r, ms));

async function html(url) {
  for (let i = 0; i < 2; i++) {
    try { const r = await fetch(url, { headers: { "User-Agent": UA } }); const b = await r.text(); await sleep(250); return b; }
    catch (e) { if (i) throw e; await sleep(3000); }
  }
}
function slugs(h) {
  const i = h.indexOf('id="category-products"');
  return i < 0 ? [] : [...new Set([...h.slice(i).matchAll(/<a href="https:\/\/hazeyse\.nyehandel\.se\/sv\/products\/([^"]+)">\s*<span class="name">/g)].map(m => m[1]))];
}
async function all(route) {
  const first = await html(ORIGIN + route);
  let max = 1;
  for (const m of first.matchAll(/[?&]page=(\d+)/g)) max = Math.max(max, +m[1]);
  let out = slugs(first);
  for (let p = 2; p <= max; p++) out = out.concat(slugs(await html(ORIGIN + route + "&page=" + p)));
  const count = (/id="products_count">\s*(\d+)/.exec(first) || [])[1];
  return { slugs: [...new Set(out)], count: count ? +count : 0 };
}

const series = new Set();
for (const r of inv.routes) for (const f of r.facets || []) if (f.title === "Serie") f.values.forEach(v => series.add(v));
// strukturkategorier som tillsammans täcker hela sortimentet
const BASES = ["/sv/categories/alla-produkter", "/sv/categories/vapes-ny", "/sv/categories/buds-ny", "/sv/categories/hash-ny", "/sv/categories/alla-cartridges", "/sv/categories/alla-vapes", "/sv/categories/blommor-buds", "/sv/categories/hasch"];
const attr = {};
for (const s of series) {
  attr[s] = {};
  for (const b of BASES) {
    const res = await all(`${b}?filters=${encodeURIComponent("Serie_" + s)}`);
    attr[s][b] = res;
    console.log(s, b, res.count, res.slugs.length);
  }
}
const products = inv.products.map(p => {
  const s = [...series].filter(v => Object.values(attr[v]).some(x => x.slugs.includes(p.slug)));
  return { slug: p.slug, name: p.name, serieAttr: s, categories: p.foundIn, breadcrumb: (p.breadcrumb || []).map(b => b.name) };
});
fs.writeFileSync(path.join(DIR, "runs/membership.json"), JSON.stringify({ generated: new Date().toISOString(), serieValues: [...series], attr, products }, null, 1));
console.log("products", products.length);
