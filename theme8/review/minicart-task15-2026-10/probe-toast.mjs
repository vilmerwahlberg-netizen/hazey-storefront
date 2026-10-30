// TASK 15 (read-only): Nyehandels egen lager-toast vid 406 -- DOM och livslängd.
import { chromium, ctxFor, open, add, openCart } from "./lib.mjs";
const b = await chromium.launch(); const ctx = await ctxFor(b, 393, 852);
const p = await open(ctx, "/sv/products/vape-thc-a-45-faraoh-2ml");
await add(p, 183, 7); await openCart(p); await p.waitForTimeout(2500);
await p.locator('#cartAside .button[aria-label^="Öka antalet"]').first().click();
const find = () => { const n = [...document.querySelectorAll("body *")].filter(e => e.children.length < 6 && /inte önskat antal/i.test(e.textContent) && e.offsetParent); const t = n[n.length - 1]; if (!t) return null; let el = t, chain = []; for (let i = 0; i < 6 && el && el !== document.body; i++) { chain.push(el.tagName + "#" + el.id + "." + String(el.className).slice(0, 60) + " role=" + el.getAttribute("role") + " aria-live=" + el.getAttribute("aria-live")); el = el.parentElement; } return chain; };
for (const t of [600, 1500, 3000, 5000, 7000, 10000, 15000]) { await p.waitForTimeout(t - (t > 600 ? [600, 1500, 3000, 5000, 7000, 10000][[1500, 3000, 5000, 7000, 10000, 15000].indexOf(t)] : 0)); console.log(t, JSON.stringify(await p.evaluate(find))); }
console.log(await p.evaluate(() => { const st = HZ8.store(); return Object.keys(st.state).join(",") + " | " + JSON.stringify(st.state.alert || st.state.alerts || st.state.notifications || null).slice(0, 300); }));
await b.close();
