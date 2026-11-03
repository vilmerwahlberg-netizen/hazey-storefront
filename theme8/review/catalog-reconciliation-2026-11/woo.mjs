// TASK 17 — read-only inventering av WooCommerce-livesidan (www.hazey.se), facit för kundsynligt sortiment.
// Källor (endast GET, via lib/fetch-cache.mjs: concurrency 1, 2,5 s + jitter, backoff, cache):
//   1. product-sitemap.xml (vilka produktsidor Woo själv publicerar för sökmotorer)
//   2. Store API /wp-json/wc/store/v1/products per catalog_visibility (any/visible/catalog/search/hidden)
//   3. Store API /products/categories (alla kategorier)
//   4. Varje kategorisida i HTML, alla sidor (vad en kund faktiskt ser listat, inkl. eventuell dold-slutsåld-inställning)
//   5. Varje produktsida (HTML): window.HZY_PRODUKT / HZY_PAKET / HZY_EXTRA, JSON-LD, galleri
// Kör: node woo.mjs [--only=api|cats|html]  ->  runs/woo-raw.json (index; rådata ligger i cache/)
import fs from "node:fs";
import path from "node:path";
import { get } from "./lib/fetch-cache.mjs";

const DIR = path.dirname(new URL(import.meta.url).pathname);
const O = "https://www.hazey.se";
const only = (process.argv.find(a => a.startsWith("--only=")) || "").slice(7);
const locs = xml => [...String(xml).matchAll(/<loc>([^<]+)<\/loc>/g)].map(m => m[1].trim());
const json = r => { try { return JSON.parse(r.body); } catch { return null; } };

const out = { generated: new Date().toISOString(), sitemap: [], api: {}, categories: [], categoryListings: {}, pages: [] };

const smIndex = locs((await get(O + "/sitemap_index.xml", { accept: "application/xml" })).body);
for (const u of smIndex.filter(u => /product-sitemap\d*\.xml$/.test(u))) out.sitemap.push(...locs((await get(u, { accept: "application/xml" })).body).filter(x => /\/produkt\/[^/]+\/?$/.test(x)));
out.sitemap = [...new Set(out.sitemap)];

for (const vis of ["any", "visible", "catalog", "search", "hidden"]) {
  const ids = [];
  for (let page = 1; page < 10; page++) {
    const list = json(await get(`${O}/wp-json/wc/store/v1/products?per_page=100&page=${page}&catalog_visibility=${vis}`, { accept: "application/json" })) || [];
    ids.push(...list.map(p => p.id));
    if (list.length < 100) break;
  }
  out.api[vis] = ids;
  console.log("api", vis, ids.length);
}
out.categories = json(await get(`${O}/wp-json/wc/store/v1/products/categories?per_page=100`, { accept: "application/json" })) || [];

if (!only || only === "cats") {
  const shop = [{ slug: "butik", permalink: O + "/butik/" }].concat(out.categories.map(c => ({ slug: c.slug, permalink: c.permalink })));
  for (const c of shop) {
    const slugs = []; let pages = 0;
    for (let p = 1; p < 20; p++) {
      const r = await get(p === 1 ? c.permalink : c.permalink + "page/" + p + "/");
      if (r.status !== 200) break;
      pages = p;
      const seg = r.body.split(/<ul class="products/).slice(1).join("");
      const found = [...seg.matchAll(/href="https:\/\/www\.hazey\.se\/produkt\/([^/"]+)\/?"/g)].map(m => m[1]);
      const fresh = found.filter(s => !slugs.includes(s));
      slugs.push(...fresh);
      if (!fresh.length || !/class="next page-numbers"/.test(r.body)) break;
    }
    out.categoryListings[c.slug] = { permalink: c.permalink, pages, slugs };
    console.log("cat", c.slug, slugs.length);
  }
}
if (!only || only === "html") {
  const anyList = [];
  for (let page = 1; page < 10; page++) {
    const list = json(await get(`${O}/wp-json/wc/store/v1/products?per_page=100&page=${page}&catalog_visibility=any`, { accept: "application/json" })) || [];
    anyList.push(...list); if (list.length < 100) break;
  }
  const urls = [...new Set(anyList.map(p => p.permalink).concat(out.sitemap))];
  let i = 0;
  for (const u of urls) { const r = await get(u); i++; out.pages.push({ url: u, status: r.status }); process.stdout.write(`${i}/${urls.length} ${r.status} ${u}\n`); }
}
fs.writeFileSync(path.join(DIR, "runs/woo-raw.json"), JSON.stringify(out, null, 1));
console.log("sitemap", out.sitemap.length, "categories", out.categories.length);
