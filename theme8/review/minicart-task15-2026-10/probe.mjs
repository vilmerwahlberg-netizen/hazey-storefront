// Upptäckt: drawerns DOM, Vuex-modulens actions/mutations/state-form, triggers.
import { chromium, ctxFor, open, productState, add, openCart, DIR } from "./lib.mjs"; import fs from "node:fs";
const b = await chromium.launch(); const ctx = await ctxFor(b, 1440, 900);
const p = await open(ctx, "/sv/products/vape-thc-a-45-faraoh-2ml");
const out = {};
out.store = await p.evaluate(() => { const st = HZ8.store(); return { actions: Object.keys(st._actions).filter(k => /cart/i.test(k)), mutations: Object.keys(st._mutations).filter(k => /cart/i.test(k)), cartKeys: Object.keys(st.state.cart || {}), cart: st.state.cart && st.state.cart.cart ? Object.keys(st.state.cart.cart) : null }; });
out.triggers = await p.evaluate(() => [...document.querySelectorAll("button,a")].filter(b => /varukorg|cart|basket/i.test((b.getAttribute("aria-label") || "") + " " + b.className + " " + (b.id||""))).map(b => ({ tag: b.tagName, cls: b.className, id: b.id, aria: b.getAttribute("aria-label"), vis: !!b.offsetParent })).slice(0, 15));
await openCart(p);
out.emptyHTML = await p.evaluate(() => document.getElementById("cart-side-wrap").outerHTML.slice(0, 6000));
const st = await productState(p, 57);
out.ps57 = { selected: st.selected_variant && { id: st.selected_variant.id, name: st.selected_variant.name }, variants: (st.product.variants || []).map(v => ({ id: v.id, name: v.name, opt: v.option_values || v.options, stock: v.available_stock, track: v.track_inventory, buyable: v.buyable, prices: (v.prices || []).map(x => x.price && [x.price.tier, x.price.formatted_price]) })) };
await add(p, out.ps57.variants[0].id, 1); await p.waitForTimeout(1500);
out.cartState = await p.evaluate(() => JSON.parse(JSON.stringify(HZ8.store().state.cart)));
out.filledHTML = await p.evaluate(() => document.getElementById("cart-side-wrap").outerHTML);
fs.writeFileSync(`${DIR}/runs/probe.json`, JSON.stringify(out, null, 1));
console.log(JSON.stringify({ store: out.store, triggers: out.triggers, ps57: out.ps57 }, null, 1).slice(0, 5000));
await b.close();
