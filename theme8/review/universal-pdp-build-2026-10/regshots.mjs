// TASK 10B-4 -- regressionsbilder utanför produktsidan (före | efter):
// kategori (Alla Vapes), seriehubb (Magic Sauce), sök, varukorg (efter
// snabbköp på kategorin) och kassa. Ingen order läggs.
// node regshots.mjs <before|after>
import { chromium, ctxFor, open, ready, DIR } from "./lib.mjs"; import fs from "node:fs";
const [which = "after"] = process.argv.slice(2);
const b = await chromium.launch(); const R = {};
const PAGES = [["category", "/sv/categories/alla-vapes"], ["hub", "/sv/categories/magic-sauce"], ["search", "/sv/search?query=vape"]];
for (const [k, route] of PAGES) for (const w of [393, 1440]) {
  const ctx = await ctxFor(b, w, w < 768 ? 852 : 900, { which }); const p = await open(ctx, route); await ready(p, 5000);
  await p.evaluate(async () => { for (let y = 0; y < document.documentElement.scrollHeight; y += 600) { scrollTo({ top: y, behavior: "instant" }); await new Promise(r => setTimeout(r, 100)); } scrollTo({ top: 0, behavior: "instant" }); }); await p.waitForTimeout(2000);
  await p.screenshot({ path: `${DIR}/runs/shots/${which}-reg-${k}-${w}.jpg`, type: "jpeg", quality: 70 });
  R[`${k}-${w}`] = await p.evaluate(() => ({ h1: document.querySelectorAll("h1").length, cards: document.querySelectorAll(".product-card").length, overflowX: document.documentElement.scrollWidth > innerWidth + 1, adapter: document.documentElement.classList.contains("hz8-pdp-pilot") }));
  R[`${k}-${w}`].errors = p.errors; console.log(k, w, JSON.stringify(R[`${k}-${w}`]));
  await ctx.close();
}
// Varukorg + kassa: snabbköp på kategorisidan -> lådan -> kassan.
{
  const ctx = await ctxFor(b, 1440, 900, { which }); const p = await open(ctx, "/sv/categories/alla-vapes"); await ready(p, 6000);
  const btn = p.locator(".product-card button.hz8-card-pill, .product-card .hz8-pcard__cta:not([disabled])").first();
  await btn.scrollIntoViewIfNeeded().catch(() => {}); await btn.click().catch(() => {}); await p.waitForTimeout(4000);
  await p.evaluate(() => scrollTo(0, 0)); await p.locator('#store-header [class*="cart"], #store-header [aria-label*="arukorg" i]').first().click().catch(() => {}); await p.waitForTimeout(2500);
  await p.screenshot({ path: `${DIR}/runs/shots/${which}-reg-cart-1440.jpg`, type: "jpeg", quality: 70 });
  R.cart = await p.evaluate(() => ({ open: !!document.querySelector("#cart-side-wrap.is-active"), rows: document.querySelectorAll("#cartAside article.item").length }));
  await p.goto("https://hazeyse.nyehandel.se/sv/checkout?preview=v9kzdmqz4w60l5n", { waitUntil: "domcontentloaded", timeout: 90000 }); await p.waitForTimeout(7000);
  await p.screenshot({ path: `${DIR}/runs/shots/${which}-reg-checkout-1440.jpg`, type: "jpeg", quality: 70 });
  R.checkout = await p.evaluate(() => ({ url: location.pathname, items: document.body.innerText.includes("kr") }));
  R.cart.errors = p.errors; console.log("cart/checkout", JSON.stringify(R.cart), JSON.stringify(R.checkout));
  await ctx.close();
}
fs.writeFileSync(`${DIR}/runs/reg-${which}.json`, JSON.stringify(R, null, 1));
await b.close();
