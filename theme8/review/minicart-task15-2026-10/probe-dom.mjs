// TASK 15 (read-only): drawerns native DOM med en rad (Vape Magic Sauce 99% 2ml) + tom korg.
import { chromium, ctxFor, open, add, openCart, productState } from "./lib.mjs";
const b = await chromium.launch(); const ctx = await ctxFor(b, 1440, 900);
const p = await open(ctx, "/sv/products/vape-magic-sauce-99-2ml");
const pid = await p.evaluate(() => +(document.documentElement.innerHTML.match(/viewProduct\(.(\d+)/) || [])[1] || 0);
const st = await productState(p, pid);
console.log("pid", pid, st.product.name, st.product.variants.map(v => v.id + ":" + v.option_values.map(o => o.name) + ":" + v.available_stock + ":" + v.buyable).join(" | "));
await add(p, 191, 1); await add(p, 130, 1);
await openCart(p);
const html = await p.evaluate(() => { const a = document.getElementById("cartAside").cloneNode(true); a.querySelectorAll("[class^=hz8], .hz8-xsell, .hz8-goal").forEach(n => n.remove()); return a.outerHTML.replace(/\s+/g, " ").replace(/ data-v-[a-z0-9]+=""/g, ""); });
console.log(html.slice(0, 6000));
console.log(await p.evaluate(() => JSON.stringify(Object.keys(HZ8.store().state.cart.cart)) + JSON.stringify(HZ8.store().state.cart.cart.items[0], null, 0).slice(0, 1800)));
console.log("pkgcat", await p.evaluate(() => typeof HZ8.mixedPack));
await b.close();
