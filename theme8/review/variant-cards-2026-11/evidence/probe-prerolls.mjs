import { chromium, ctxFor, open, ready } from "../../catalog-reconciliation-2026-11/lib/harness.mjs";
const b = await chromium.launch(); const ctx = await ctxFor(b, 1440, 1000, { which: "after" });
const p = await open(ctx, "/sv/categories/alla-produkter?q=pre%20rolls"); await ready(p, 9000);
console.log(JSON.stringify(await p.evaluate(() => ({ names: [...document.querySelectorAll(".hz8-series-results .product-card")].filter(c => c.getClientRects().length).map(c => (c.querySelector(".name") || {}).textContent.trim()), paused: [...document.querySelectorAll(".product-card.hz8-paused")].length, hiddenPack: [...document.querySelectorAll(".hz8-pack-card")].map(c => (c.querySelector(".name") || {}).textContent.trim()) }))));
await b.close();
