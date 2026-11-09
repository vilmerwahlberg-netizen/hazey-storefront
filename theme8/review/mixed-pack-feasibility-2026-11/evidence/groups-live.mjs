// TASK 19 — read-only: crawl NH category listings (GET) and read product/state (the storefront's own read POST)
// for every product listed in the owner's target groups. No cart, no admin. Run: node groups-live.mjs > nh-groups-<date>.json
const O = "https://hazeyse.nyehandel.se", UA = "Mozilla/5.0 (Macintosh) task19-audit";
let ck = {};
const keep = r => { for (const c of r.headers.getSetCookie?.() || []) { const kv = c.split(";")[0]; const i = kv.indexOf("="); ck[kv.slice(0, i)] = kv.slice(i + 1); } };
const cookie = () => Object.entries(ck).map(([k, v]) => k + "=" + v).join("; ");
const sleep = ms => new Promise(r => setTimeout(r, ms));
async function get(p) { const r = await fetch(O + p, { headers: { "User-Agent": UA, Cookie: cookie() } }); keep(r); await sleep(200); return { status: r.status, body: await r.text() }; }
const CATS = ["ms-buds", "ms-hash", "d10-buds", "d10-hash", "high-life-buds", "high-life-hash", "hero-vapes", "core-vapes", "faraoh", "thcab-vapes", "thcba-vapes", "ms-vapes"];
const out = { generated: new Date().toISOString(), source: O, categories: {}, products: {} };
const slugs = new Set();
for (const c of CATS) {
  const first = await get("/sv/categories/" + c);
  let max = 1; for (const m of first.body.matchAll(/[?&](?:amp;)?page=(\d+)/g)) max = Math.max(max, +m[1]);
  let html = first.body;
  for (let p = 2; p <= Math.min(max, 20); p++) html += (await get("/sv/categories/" + c + "?page=" + p)).body;
  const i = html.indexOf('id="category-products"');
  const list = [...new Set([...(i < 0 ? html : html.slice(i)).matchAll(/href="(?:https:\/\/hazeyse\.nyehandel\.se)?\/sv\/products\/([^"?#]+)"/g)].map(m => m[1]))];
  out.categories[c] = { status: first.status, count: +((/id="products_count">\s*(\d+)/.exec(first.body) || [])[1] || 0), slugs: list };
  list.forEach(s => slugs.add(s));
}
for (const s of slugs) {
  const pg = await get("/sv/products/" + s);
  const id = +((pg.body.match(/viewProduct\(.(\d+)/) || [])[1] || 0);
  if (!id) { out.products[s] = { slug: s, status: pg.status }; continue; }
  const r = await fetch(O + "/frontend-api/product/state", { method: "POST", headers: { "User-Agent": UA, Cookie: cookie(), Accept: "application/json", "Content-Type": "application/json", "X-Requested-With": "XMLHttpRequest", "X-XSRF-TOKEN": decodeURIComponent(ck["XSRF-TOKEN"] || "") }, body: JSON.stringify({ product_id: id, variant_ids: [null] }) });
  keep(r); await sleep(200);
  const P = (await r.json().catch(() => null))?.product;
  out.products[s] = P ? { slug: s, id: P.id, name: P.name, is_package: P.is_package, brand: P.brand && (P.brand.name || P.brand.title) || null,
    categories: Object.entries(out.categories).filter(([, v]) => v.slugs.includes(s)).map(([k]) => k),
    variants: (P.variants || []).map(v => ({ id: v.id, sku: v.sku, option: (v.option_values || []).map(o => o.name).join(" · ") || null, active: v.active, buyable: v.buyable, always_orderable: !!v.always_orderable, track: !!v.track_inventory, stock: v.available_stock,
      unit: v.prices && v.prices[0] ? v.prices[0].price.price / 10000 : null, formatted: v.price && v.price.formatted_price, tiers: (v.prices || []).length })) } : { slug: s, id, stateStatus: r.status };
}
console.log(JSON.stringify(out, null, 1));
