// TASK 11 -- regressioner före (a9081ee) | efter (arbetskopia), REGRESSION-MATRIX:
// delad bästsäljarkälla (start, Butik, PDP "Bästsäljare just nu", kampanjer,
// FAQ), kategori-/hubb-/söksidor, universella PDP:n (a9081ee) samt
// varukorg + kassa. Per route och bredd: DOM-signatur (rubriker, kortordning,
// modulkort, sidmarkörer) + fullsidesbild. Ingen order läggs.
// node reg.mjs <before|after> [grupp]   grupp = shared|cat|pdp|cart (default alla)
import { chromium, ctxFor, open, ready, DIR } from "./lib.mjs"; import fs from "node:fs";
import { PRODUCTS } from "./products.mjs";
const [which = "after", only] = process.argv.slice(2);
const GROUPS = {
  shared: [["home", "/"], ["butik", "/sv/page/butik"], ["pdp-core", "/sv/products/vape-thcx-19-core-2ml"], ["kampanjer", "/sv/page/kampanjer"], ["faq", "/sv/page/faq"]],
  cat: [["portal", "/sv/categories/alla-produkter"], ["portal-hasch", "/sv/categories/alla-produkter?typ=hasch"], ["alla-vapes", "/sv/categories/alla-vapes"], ["buds", "/sv/categories/blommor-buds"], ["hasch-f", "/sv/categories/hasch?filters=Serie_Magic+Sauce"], ["m-s-vapes", "/sv/categories/m-s-vapes"], ["magic-sauce", "/sv/categories/magic-sauce"], ["core", "/sv/categories/core"], ["search", "/sv/search?query=magic+sauce"]],
  pdp: [91, 92, 57, 84, 88, 17].map(id => [`pdp-${id}`, PRODUCTS[id].route])
};
const SIG = () => {
  const t = e => (e ? e.textContent.replace(/\s+/g, " ").trim() : null);
  const names = sel => [...document.querySelectorAll(sel)].map(e => t(e)).filter(Boolean);
  const h = document.documentElement;
  return {
    page: h.getAttribute("data-hz8-page"), shell: h.getAttribute("data-hz8-shell"),
    cls: [...h.classList].filter(c => /^hz8-(cat|pdp|bs|series|sf|seo|shop|page)/.test(c)).sort().join(" "),
    h1: names("h1"), h2: names("main h2, #store-main h2").slice(0, 40),
    cards: names("#store-main .product-card .name").slice(0, 80),
    home: names(".hz8-bs .product-card .name, .hz8-bestsellers .product-card .name, [class*='hz8-bs'] .name").slice(0, 20),
    ppbest: names(".hz8-ppbest .name, .hz8-ppbest a[href*='/products/']").slice(0, 20),
    similar: (document.getElementById("liknande") || {}).getAttribute?.("data-hz8-similar") || null,
    station: !!document.querySelector(".hz8-pp"), adapter: h.classList.contains("hz8-pdp-pilot"),
    pills: names("#store-main .hz8-card-pill").slice(0, 40),
    overflowX: document.documentElement.scrollWidth > innerWidth + 1, height: document.documentElement.scrollHeight
  };
};
const b = await chromium.launch(); const R = {};
const out = `${DIR}/runs/reg-${which}${only ? "-" + only : ""}.json`;
for (const g of Object.keys(GROUPS)) {
  if (only && only !== g) continue;
  for (const [k, route] of GROUPS[g]) for (const w of [393, 1440]) {
    const ctx = await ctxFor(b, w, w < 768 ? 852 : 900, { which }); const p = await open(ctx, route); await ready(p, 5000);
    await p.evaluate(async () => { for (let y = 0; y < document.documentElement.scrollHeight; y += 500) { scrollTo({ top: y, behavior: "instant" }); await new Promise(r => setTimeout(r, 120)); } scrollTo({ top: 0, behavior: "instant" }); }); await p.waitForTimeout(2500);
    R[`${k}-${w}`] = { ...(await p.evaluate(SIG)), errors: p.errors };
    await p.screenshot({ path: `${DIR}/runs/shots/${which}-reg-${k}-${w}.png`, fullPage: true });
    console.log(k, w, JSON.stringify({ cards: R[`${k}-${w}`].cards.length, h1: R[`${k}-${w}`].h1, errs: p.errors.length }));
    await ctx.close();
  }
}
if (!only || only === "cart") for (const w of [393, 1440]) {
  const ctx = await ctxFor(b, w, w < 768 ? 852 : 900, { which }); const p = await open(ctx, "/sv/categories/alla-vapes"); await ready(p, 6000);
  const btn = p.locator(".product-card button.hz8-card-pill:not([disabled])").first();
  await btn.scrollIntoViewIfNeeded().catch(() => {}); await btn.click().catch(() => {}); await p.waitForTimeout(4000);
  await p.evaluate(() => scrollTo(0, 0)); await p.waitForTimeout(500);
  const drawer = await p.evaluate(() => ({ open: !!document.querySelector("#cart-side-wrap.is-active"), rows: document.querySelectorAll("#cartAside article.item").length }));
  if (!drawer.open) { await p.locator('#store-header [class*="cart"], #store-header [aria-label*="arukorg" i]').first().click().catch(() => {}); await p.waitForTimeout(2500); }
  await p.screenshot({ path: `${DIR}/runs/shots/${which}-reg-cart-${w}.png` });
  const cart = await p.evaluate(() => ({ open: !!document.querySelector("#cart-side-wrap.is-active"), rows: document.querySelectorAll("#cartAside article.item").length }));
  await p.goto("https://hazeyse.nyehandel.se/sv/checkout?preview=v9kzdmqz4w60l5n", { waitUntil: "domcontentloaded", timeout: 90000 }); await p.waitForTimeout(7000);
  await p.screenshot({ path: `${DIR}/runs/shots/${which}-reg-checkout-${w}.png`, fullPage: true });
  R[`cart-${w}`] = { cart, checkout: await p.evaluate(() => ({ url: location.pathname, kr: document.body.innerText.includes("kr") })), errors: p.errors };
  console.log("cart", w, JSON.stringify(R[`cart-${w}`]));
  await ctx.close();
}
fs.writeFileSync(out, JSON.stringify(R, null, 1));
await b.close();
