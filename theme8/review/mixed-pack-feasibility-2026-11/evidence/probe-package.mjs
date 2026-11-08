// TASK 19 — läser en paketprodukts verkliga struktur (ingen skrivning): product/state + PDP-HTML (server-renderade
// <package-product(-variants)>-taggar med pivot-id, product-id, quantity, locked-variant).
// Användning: node probe-package.mjs <paketprodukt-id> [--slug <slug>]
import { client } from "./nhcart.mjs"; import fs from "node:fs";
const id = +process.argv[2]; const c = client();
await c.page("/");
const st = await c.api("POST", "product/state", { product_id: id, variant_ids: [null] });
const P = st.json && st.json.product;
if (!P) { console.log("ingen product/state", st.status, st.text || st.json); process.exit(1); }
const slug = process.argv[3] === "--slug" ? process.argv[4] : P.slug;
const html = (await c.page("/sv/products/" + slug + "?preview=v9kzdmqz4w60l5n")).body;
const tags = [...html.matchAll(/<package-product(?:-variants)?\b[^>]*>/g)].map(m => {
  const a = {}; for (const x of m[0].matchAll(/([:@\w-]+)="([^"]*)"/g)) a[x[1].replace(/^:/, "")] = x[2]; return { tag: m[0].startsWith("<package-product-variants") ? "package-product-variants" : "package-product", ...a };
});
const out = { id, slug, is_package: P.is_package, parts_buyable: P.parts_buyable, product_type_id: P.product_type_id,
  stateKeys: Object.keys(P), packageLikeKeys: Object.fromEntries(Object.entries(P).filter(([k]) => /pack|part|pivot|item|child/i.test(k))),
  variant: (P.variants || []).map(v => ({ id: v.id, sku: v.sku, price: v.price && v.price.formatted_price, buyable: v.buyable, track: v.track_inventory, stock: v.available_stock })),
  pivots: tags, pivotsFoundInHtml: tags.length };
fs.mkdirSync(new URL("./cart-runs/", import.meta.url), { recursive: true });
fs.writeFileSync(new URL(`./cart-runs/package-${id}-structure.json`, import.meta.url), JSON.stringify(out, null, 1));
console.log(JSON.stringify(out, null, 1));
