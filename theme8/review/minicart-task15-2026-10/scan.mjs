import { chromium, ctxFor, open, productState, DIR } from "./lib.mjs"; import fs from "node:fs";
const ids = [57, 88, 91, 84, 17, 2, 87, 78, 92, 72, 3, 119, 27];
const b = await chromium.launch(); const ctx = await ctxFor(b, 1440, 900);
const p = await open(ctx, "/sv/products/vape-thc-a-45-faraoh-2ml"); const out = {};
for (const id of ids) {
  const s = await productState(p, id);
  out[id] = { name: s.product && s.product.name, variants: (s.product.variants || []).map(v => ({ id: v.id, opt: (v.option_values || []).map(o => o.name).join("/"), stock: v.available_stock, track: v.track_inventory, always: v.always_orderable, buyable: v.buyable, inStock: v.in_stock, price: (v.prices || []).map(x => x.price && x.price.tier + ":" + x.price.formatted_price + (x.price.formatted_comparison_price ? "(jmf " + x.price.formatted_comparison_price + ")" : "")).join(" "), cmp: v.has_compare || v.comparison_price || null })) };
}
fs.writeFileSync(`${DIR}/runs/scan.json`, JSON.stringify(out, null, 1));
for (const [id, o] of Object.entries(out)) { console.log(id, o.name); o.variants.slice(0, 6).forEach(v => console.log("   ", JSON.stringify(v))); }
await b.close();
