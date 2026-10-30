// TASK 15 (read-only): bildfält per variant för strainvyn.
import { chromium, ctxFor, open, productState } from "./lib.mjs";
const b = await chromium.launch(); const ctx = await ctxFor(b, 1440, 900);
const p = await open(ctx, "/sv/products/vape-thc-a-45-faraoh-2ml");
const st = await productState(p, 57);
console.log(JSON.stringify(st.product.images.slice(0, 3), null, 1).slice(0, 1500));
console.log(JSON.stringify(Object.keys(st.product.variants[0])));
console.log(JSON.stringify(st.product.variants[0], null, 0).slice(0, 2500));
console.log(JSON.stringify(st.product.options, null, 0).slice(0, 1500));
await b.close();
