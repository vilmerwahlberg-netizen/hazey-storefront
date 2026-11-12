import { chromium, ctxFor, open, ready } from "../../catalog-reconciliation-2026-11/lib/harness.mjs";
const [route] = process.argv.slice(2);
const b = await chromium.launch(); const ctx = await ctxFor(b, 1440, 1000, { which: "after" });
const p = await open(ctx, route); await ready(p, 9000);
console.log(JSON.stringify(await p.evaluate(() => ({ url: location.href, h1: (document.querySelector("h1") || {}).textContent?.trim(), cls: document.documentElement.className.slice(0, 300), sf: document.documentElement.getAttribute("data-hz8-sf-n"), nativeCards: document.querySelectorAll("#category-products .product-card").length, results: document.querySelectorAll(".hz8-series-results .product-card").length, sfCount: (document.querySelector(".hz8-sf-count") || {}).textContent, rails: document.querySelectorAll(".hz8-prail .product-card").length, prodCount: (document.getElementById("products_count") || {}).textContent }))));
console.log(p.errors.slice(0, 5));
await b.close();
