// Riktig data för riktningarna: multi-korgen ur Nyehandels Vuex + pristrappor
// (product/state) + Theme 8:s egna korsförsäljningsval. Inget hittas på.
import { chromium, ctxFor, open, add, openCart, productState, DIR } from "./lib.mjs"; import fs from "node:fs";
const b = await chromium.launch(); const ctx = await ctxFor(b, 1440, 900);
const p = await open(ctx, "/sv/products/vape-thc-a-45-faraoh-2ml");
for (const [v, q] of [[130, 1], [197, 2], [177, 1], [230, 1], [156, 1]]) await add(p, v, q);
await openCart(p); await p.waitForTimeout(6000);
const cart = await p.evaluate(() => JSON.parse(JSON.stringify(HZ8.store().state.cart.cart)));
const xsell = await p.evaluate(() => [...document.querySelectorAll(".hz8-xsell__item")].map(li => ({ name: li.querySelector(".hz8-xsell__text a").textContent, price: li.querySelector(".hz8-xsell__text span").textContent, img: (li.querySelector("img") || {}).src, variants: li.querySelector("a.hz8-xsell__btn") != null })));
const tiers = {};
for (const it of cart.items) { const s = await productState(p, it.product_id); const v = (s.product.variants || []).find(x => x.id === it.variant_id) || {}; tiers[it.id] = { stock: v.available_stock, tiers: (v.prices || []).map(x => ({ min: x.price.tier, unit: x.price.formatted_price })) }; }
fs.writeFileSync(`${DIR}/runs/realdata.json`, JSON.stringify({ cart: { items: cart.items.map(i => ({ id: i.id, name: i.name, opt: (i.option_values || []).map(o => [o.option.name, o.name]), qty: +i.quantity, price: i.formatted_price, total: i.formatted_total, cmp: i.has_compare ? i.formatted_comparison_row_total : null, img: i.image && i.image.thumb_url, href: i.href })), count: cart.quantity_count, total: cart.formatted_total, vat: cart.formatted_total_vat }, tiers, xsell }, null, 1));
console.log(JSON.stringify({ count: cart.quantity_count, total: cart.formatted_total, items: cart.items.map(i => i.name + " ×" + i.quantity + " " + i.formatted_total + (i.has_compare ? " jmf " + i.formatted_comparison_row_total : "")), xsell: xsell.map(x => x.name + " " + x.price) }, null, 1));
await b.close();
