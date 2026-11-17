import { chromium, ctxFor, open, URL_ } from "../../pdp-pilot-2026-10/lib.mjs";
const b = await chromium.launch({ channel: "chrome", headless: true });
const ctx = await ctxFor(b, 393, 852, { scale: 2 });
const p = await open(ctx, URL_("/sv/products/vape-magic-sauce-magic-farmers-2ml/454"));
await p.waitForSelector(".hz8-pcx-sa__item", { timeout: 30000 }); await p.waitForTimeout(5000);
await p.locator("#hz8-pcx-strains").scrollIntoViewIfNeeded();
await p.locator(".hz8-pcx-sa__arrow[data-dir='1']").click(); await p.waitForTimeout(1200);
console.log(await p.evaluate(() => { const L = document.querySelector(".hz8-pcx-sa__list"), lr = L.getBoundingClientRect(); return JSON.stringify({ list: [lr.left, lr.right, L.scrollLeft, L.clientWidth, L.scrollWidth], cards: [...L.children].slice(3, 6).map(li => { const r = li.getBoundingClientRect(); return [Math.round(r.left * 10) / 10, Math.round(r.right * 10) / 10]; }) }); }));
await b.close();
