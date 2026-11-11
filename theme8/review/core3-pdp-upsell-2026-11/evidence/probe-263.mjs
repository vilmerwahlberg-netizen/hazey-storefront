// TASK 20: läsande kontroll av pilotpaket 263 och basprodukt 255 (ingen korg, ingen order).
import fs from "node:fs"; import path from "node:path";
import { chromium, ctxFor, open, ready } from "../../catalog-reconciliation-2026-11/lib/harness.mjs";
const DIR = path.dirname(new URL(import.meta.url).pathname);
const b = await chromium.launch(); const ctx = await ctxFor(b, 1440, 1000, { which: "external" });
const p = await open(ctx, "/sv/products/pilot-t19-heros-core-2ml-3-pack"); await ready(p, 1500);
const out = await p.evaluate(async () => {
  const x = decodeURIComponent((document.cookie.match(/XSRF-TOKEN=([^;]+)/) || [])[1] || "");
  const H = { Accept: "application/json", "Content-Type": "application/json", "X-Requested-With": "XMLHttpRequest", "X-XSRF-TOKEN": x };
  const st = async id => (await fetch("/frontend-api/product/state", { method: "POST", credentials: "same-origin", headers: H, body: JSON.stringify({ product_id: id, variant_ids: [null] }) })).json();
  const pk = await st(263), base = await st(255);
  const rows = [...document.querySelectorAll("package-product-variants, package-product")].map(e => ({ tag: e.tagName.toLowerCase(), attrs: Object.fromEntries([...e.attributes].map(a => [a.name, a.value])) }));
  const P = pk.product, v = P.variants[0];
  return { url: location.href, pkg: { id: P.id, name: P.name, is_package: P.is_package, variant: v.id, sku: v.sku, price: v.price && v.price.formatted_price, compare: v.price && v.price.formatted_compare_price, buyable: v.buyable, keys: Object.keys(v) }, rows,
    base: { name: base.product.name, pkeys: Object.keys(base.product), variants: base.product.variants.map(v => ({ id: v.id, sku: v.sku, opt: (v.option_values || []).map(o => o.name).join("/"), price: v.price.formatted_price, stock: v.available_stock, track: v.track_inventory, buyable: v.buyable, images: JSON.stringify(v.images || v.image || null).slice(0, 300) })), vkeys: Object.keys(base.product.variants[0]) } };
});
const res = await p.goto("https://hazeyse.nyehandel.se/sv/products/pilot-t19-heros-core-2ml-3-pack?preview=v9kzdmqz4w60l5n");
out.http = res.status(); out.checkedAt = new Date().toISOString();
fs.writeFileSync(path.join(DIR, "probe-263.json"), JSON.stringify(out, null, 2)); console.log(JSON.stringify(out, null, 1).slice(0, 6000));
await b.close();
