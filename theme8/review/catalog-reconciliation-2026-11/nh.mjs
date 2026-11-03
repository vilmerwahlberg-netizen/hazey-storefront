// TASK 17 — read-only inventering av Nyehandel efter migreringen (Node 18+).
// Källor (inget skrivs till Nyehandel; bara GET + Nyehandels egen läsande POST /frontend-api/product/state,
// samma anrop som HZ8.productState):
//   1. Produktsitemap /channel/1/products/1/sitemap.xml
//   2. Kategorier: BFS över /sv/categories/-länkar från startsidan, Alla produkter, varje funnen kategori,
//      Theme 8:s källkod (theme8/js) och produktsidornas brödsmulor/relaterade kategorier.
//      Per kategori: status, H1, #products_count, alla sidor med produktkort (medlemskap).
//   3. Varje produktsida: id (viewProduct), H1, brödsmulor (JSON-LD), varumärke, relaterade kategorier,
//      variantfält, pristrappa, analyslänkar.
//   4. product/state: varianter, lager, priser, jämförelsepris, is_package, bilder, egenskaper.
// Kör: node nh.mjs  ->  runs/nh.json
import fs from "node:fs";
import path from "node:path";

const DIR = path.dirname(new URL(import.meta.url).pathname);
const ROOT = path.resolve(DIR, "../../..");
const O = "https://hazeyse.nyehandel.se";
const UA = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36";
const sleep = ms => new Promise(r => setTimeout(r, ms));
const errors = [];
let ck = {};
const cookie = () => Object.entries(ck).map(([k, v]) => `${k}=${v}`).join("; ");
function keep(r) { for (const c of (r.headers.getSetCookie ? r.headers.getSetCookie() : [])) { const [kv] = c.split(";"); const i = kv.indexOf("="); ck[kv.slice(0, i)] = kv.slice(i + 1); } }
async function req(url, opt = {}, kind = "text") {
  for (let a = 0; a < 3; a++) {
    const ctl = new AbortController(); const t = setTimeout(() => ctl.abort(), 30000);
    try {
      const r = await fetch(url.startsWith("http") ? url : O + url, { ...opt, signal: ctl.signal, redirect: "follow", headers: { "User-Agent": UA, Cookie: cookie(), ...(opt.headers || {}) } });
      clearTimeout(t); keep(r);
      const body = kind === "json" ? await r.json().catch(() => null) : await r.text();
      await sleep(200);
      return { status: r.status, url: r.url, body };
    } catch (e) { clearTimeout(t); if (a === 2) { errors.push({ url, error: String(e) }); return { status: 0, body: null }; } await sleep(2500 * (a + 1)); }
  }
}
const api = () => ({ Accept: "application/json", "Content-Type": "application/json", "X-Requested-With": "XMLHttpRequest", "X-XSRF-TOKEN": decodeURIComponent(ck["XSRF-TOKEN"] || "") });
const dec = s => String(s == null ? "" : s).replace(/&amp;/g, "&").replace(/&quot;/g, '"').replace(/&#0?39;/g, "'").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/\s+/g, " ").trim();
const strip = s => dec(String(s || "").replace(/<[^>]+>/g, " "));
const slugOf = href => decodeURIComponent(new URL(href, O).pathname).replace(/^\/sv\/products\//, "").replace(/\/$/, "");
const catKey = href => { const u = new URL(dec(href), O); return u.pathname.replace(/\/+$/, ""); };
const catLinks = html => [...new Set([...String(html).matchAll(/href="((?:https:\/\/hazeyse\.nyehandel\.se)?\/sv\/categories\/[^"#?]+)/g)].map(m => catKey(m[1])))];

const out = { schema: "nh-catalog/1", generated: new Date().toISOString(), origin: O, sitemap: [], categories: {}, products: [], errors };

const sm = await req("/channel/1/products/1/sitemap.xml");
out.sitemap = [...String(sm.body).matchAll(/<loc>([^<]+)<\/loc>/g)].map(m => m[1]).filter(u => /\/sv\/products\//.test(u)).map(slugOf);
console.log("sitemap", out.sitemap.length);

// Theme 8-källor: alla category-routes som nämns i koden.
const theme8Routes = new Set();
for (const f of fs.readdirSync(path.join(ROOT, "theme8/js"))) {
  const src = fs.readFileSync(path.join(ROOT, "theme8/js", f), "utf8");
  for (const m of src.matchAll(/(?:\/sv\/categories\/|categories\/)([a-z0-9-]+)/g)) theme8Routes.add("/sv/categories/" + m[1]);
  for (const m of src.matchAll(/hub:\s*"([a-z0-9-]+)"/g)) theme8Routes.add("/sv/categories/" + m[1]);
}
out.theme8Routes = [...theme8Routes].sort();

function cardsOf(html) {
  const i = html.indexOf('id="category-products"'); if (i < 0) return [];
  return html.slice(i).split('class="product-card"').slice(1).map(c => {
    const href = (/href="(https:\/\/hazeyse\.nyehandel\.se)?(\/sv\/products\/[^"]+)"/.exec(c) || [])[2];
    return href ? slugOf(href) : null; // varumärke läses ur product/state
  }).filter(Boolean);
}
const queue = ["/", "/sv/categories/alla-produkter", ...theme8Routes];
const seen = new Set();
async function crawlCategory(route) {
  const first = await req(route);
  const html = String(first.body || "");
  const finalPath = first.url ? new URL(first.url).pathname.replace(/\/+$/, "") : null;
  if (route === "/") { catLinks(html).forEach(l => queue.push(l)); return; }
  let max = 1; for (const m of html.matchAll(/(?:[?&]|&amp;)page=(\d+)/g)) max = Math.max(max, +m[1]);
  let slugs = cardsOf(html);
  for (let p = 2; p <= Math.min(max, 30); p++) slugs = slugs.concat(cardsOf(String((await req(route + "?page=" + p)).body || "")));
  const count = +((/id="products_count">\s*(\d+)/.exec(html) || [])[1] || 0);
  const h1 = strip((/<h1[^>]*>([\s\S]*?)<\/h1>/.exec(html) || [])[1] || "");
  const catId = +((/<product-filter category-id="(\d+)"/.exec(html) || [])[1] || 0) || null;
  out.categories[route] = { route, status: first.status, finalPath, redirected: finalPath !== route, h1, count, pages: max, catId, slugs: [...new Set(slugs)], fromTheme8: theme8Routes.has(route) };
  catLinks(html).forEach(l => queue.push(l));
  process.stdout.write(`cat ${route} ${first.status} h1="${h1}" n=${count} cards=${out.categories[route].slugs.length}\n`);
}
while (queue.length) { const r = queue.shift(); if (seen.has(r)) continue; seen.add(r); await crawlCategory(r); }

const membership = {};
for (const c of Object.values(out.categories)) if (c.status === 200) for (const s of c.slugs) (membership[s] = membership[s] || []).push(c.route);

const all = [...new Set([...out.sitemap, ...Object.keys(membership)])].sort();
let n = 0;
const extraCats = new Set();
for (const slug of all) {
  n++;
  const rec = { slug, route: "/sv/products/" + slug, inSitemap: out.sitemap.includes(slug), listedIn: (membership[slug] || []).sort() };
  const pg = await req(rec.route);
  rec.status = pg.status;
  const h = String(pg.body || "");
  if (pg.status !== 200) { out.products.push(rec); continue; }
  rec.id = +((h.match(/viewProduct\(.(\d+)/) || h.match(/product_id["']?\s*[:=]\s*["']?(\d+)/) || [])[1] || 0) || null;
  rec.h1 = strip((/<h1[^>]*>([\s\S]*?)<\/h1>/.exec(h) || [])[1] || "");
  rec.breadcrumb = [];
  for (const m of h.matchAll(/<script type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)) {
    try { const j = JSON.parse(m[1]); if (j["@type"] === "BreadcrumbList") rec.breadcrumb = (j.itemListElement || []).map(i => ({ id: i.item && i.item["@id"], name: i.item && i.item.name })); if (j["@type"] === "Product") rec.ld = { name: j.name, sku: j.sku || null, brand: j.brand && (j.brand.name || j.brand), images: [].concat(j.image || []).length, offers: [].concat(j.offers || []).map(o => ({ price: o.price, availability: String(o.availability || "").replace(/^https?:\/\/schema\.org\//, "") })) }; } catch { /* */ }
  }
  const rc = h.indexOf('<div class="related-categories">');
  rec.relatedCategories = rc < 0 ? [] : catLinks(h.slice(rc, h.indexOf("</h3>", rc) + 4000).split(/<div class="(?!tags|tag")/)[0]);
  rec.breadcrumb.forEach(b => { if (b.id && /\/sv\/categories\//.test(b.id)) extraCats.add(catKey(b.id)); });
  rec.relatedCategories.forEach(c => extraCats.add(c));
  rec.pdfs = [...h.matchAll(/href="([^"]+\.pdf)"[^>]*>([\s\S]*?)<\/a>/gi)].map(m => ({ href: dec(m[1]), text: strip(m[2]) }));
  rec.pricingTable = [...h.matchAll(/<tr[^>]*>([\s\S]*?)<\/tr>/g)].filter(m => /product-pricing-table/.test(h)).length;
  if (rec.id) {
    const st = await req("/frontend-api/product/state", { method: "POST", headers: api(), body: JSON.stringify({ product_id: rec.id, variant_ids: [null] }) }, "json");
    rec.stateStatus = st.status;
    const P = st.body && st.body.product;
    if (P) {
      rec.state = {
        id: P.id, name: dec(P.name), productTypeId: P.product_type_id, hasVariants: P.has_variants, isPackage: P.is_package, partsBuyable: P.parts_buyable,
        brand: P.brand && (P.brand.name || P.brand.title) || null,
        unit: P.unit && P.unit.title,
        options: (P.options || []).map(o => ({ id: o.id, name: o.name, type: o.option_type && o.option_type.name, values: (o.values || []).map(v => v.name) })),
        properties: (P.properties || []).map(p => ({ name: p.name || (p.property && p.property.name), value: p.value || (p.values || []).map(v => v.name || v.value).join(", ") })),
        images: (P.images || []).map(i => ({ id: i.id, url: i.image_url, thumb: i.thumb_url })),
        packageParts: P.package_products || P.parts || null,
        variants: (P.variants || []).map(v => ({
          id: v.id, sku: v.sku, active: v.active, buyable: v.buyable, trackInventory: !!v.track_inventory, available: v.available_stock, displayStock: v.display_stock,
          positiveStatus: v.positive_inventory_status && v.positive_inventory_status.name, negativeStatus: v.negative_inventory_status && v.negative_inventory_status.name,
          packageSize: v.package_size, imageId: v.image_id, options: (v.option_values || []).map(o => o.name),
          prices: (v.prices || []).map(p => ({ tier: p.price.tier || 1, unit: p.price.price / 10000, compare: p.price.has_compare_price ? p.price.compare_price / 10000 : null }))
        })),
        rawKeys: Object.keys(P)
      };
    } else errors.push({ slug, error: "product/state " + st.status });
  }
  out.products.push(rec);
  process.stdout.write(`${n}/${all.length} ${slug} ${rec.status} id=${rec.id} v=${rec.state ? rec.state.variants.length : "-"} pkg=${rec.state ? rec.state.isPackage : "-"}\n`);
}
// Kategorier som bara syns via produktsidor (brödsmulor/relaterade) -- crawla dem också.
for (const c of extraCats) if (!seen.has(c)) { seen.add(c); await crawlCategory(c); }
for (const p of out.products) p.listedIn = Object.values(out.categories).filter(c => c.status === 200 && c.slugs.includes(p.slug)).map(c => c.route).sort();
fs.writeFileSync(path.join(DIR, "runs/nh.json"), JSON.stringify(out, null, 1));
console.log("products", out.products.length, "categories", Object.keys(out.categories).length, "errors", errors.length);
