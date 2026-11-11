// TASK 20: läsande kontroll av referensprodukterna för paket som INTE är verifierade (5-pack, andra variantfamiljer).
import fs from "node:fs"; import path from "node:path";
import { chromium, ctxFor, open, ready } from "../../catalog-reconciliation-2026-11/lib/harness.mjs";
const DIR = path.dirname(new URL(import.meta.url).pathname);
const b = await chromium.launch(); const ctx = await ctxFor(b, 1440, 1000, { which: "external" });
const p = await open(ctx, "/sv/products/thc-x-vape-hero-core-2ml"); await ready(p, 1500);
const out = await p.evaluate(async () => {
  const x = decodeURIComponent((document.cookie.match(/XSRF-TOKEN=([^;]+)/) || [])[1] || "");
  const H = { Accept: "application/json", "Content-Type": "application/json", "X-Requested-With": "XMLHttpRequest", "X-XSRF-TOKEN": x };
  const r = {};
  for (const id of [159, 162, 166, 169, 145, 147, 255, 260, 261]) {
    const res = await fetch("/frontend-api/product/state", { method: "POST", credentials: "same-origin", headers: H, body: JSON.stringify({ product_id: id, variant_ids: [null] }) });
    if (!res.ok) { r[id] = { status: res.status }; continue; }
    const P = (await res.json()).product;
    r[id] = { name: P.name, is_package: P.is_package, variants: P.variants.map(v => ({ id: v.id, sku: v.sku, opt: (v.option_values || []).map(o => o.name).join("/"), price: v.price && v.price.formatted_price, stock: v.available_stock, track: v.track_inventory, buyable: v.buyable, active: v.active })) };
  }
  return r;
});
out.checkedAt = new Date().toISOString();
fs.writeFileSync(path.join(DIR, "probe-refs.json"), JSON.stringify(out, null, 2));
for (const [k, v] of Object.entries(out)) if (v && v.name) console.log(k, v.name, "pkg=" + v.is_package, v.variants.map(x => `${x.id}:${x.sku}:${x.opt}:${x.price}:${x.stock}:${x.buyable}`).join(" | "));
await b.close();
