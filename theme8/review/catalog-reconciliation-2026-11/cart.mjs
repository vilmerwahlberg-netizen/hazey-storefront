// TASK 17 — minicart och överlämning till kassan med de nya produkterna (preview-varukorg, ingen order).
// Lägger en listad produkt i lager i varukorgen via PDP:ns köpknapp, läser minicartens rader och
// rekommendationer (läckage mot WooCommerce-klassningen), följer kassaknappen till /checkout och stänger.
// Kör: node cart.mjs [before|after] -> runs/cart-<which>.json
import fs from "node:fs"; import path from "node:path";
import { chromium, ctxFor, open, ready, DIR } from "./lib/harness.mjs";
const which = process.argv[2] || "after";
const CLS = Object.fromEntries(JSON.parse(fs.readFileSync(path.join(DIR, "CURRENT-CATALOG-MATRIX.json"), "utf8")).rows.map(r => [r.nhSlug, r.visibilityClass]));
const b = await chromium.launch(); const R = {};
for (const [w, h] of [[1440, 900], [393, 852]]) {
  const ctx = await ctxFor(b, w, h, { which }); const p = await open(ctx, "/sv/products/magic-sauce-buds-yoda-ice-cream-5-gram"); await ready(p, 5000);
  const btn = p.locator(".product-detail__information button.buy, .hz8-pp button.buy, button:has-text('Lägg i varukorgen')").first();
  await btn.click({ timeout: 15000 }).catch(e => { R[w] = { clickError: String(e).slice(0, 120) }; });
  await p.waitForSelector("#cart-side-wrap.is-active, #cartAside", { timeout: 15000 }).catch(() => {});
  await p.waitForTimeout(6000);
  const cart = await p.evaluate(() => {
    const aside = document.querySelector("#cartAside"); if (!aside) return null;
    const rows = [...aside.querySelectorAll(".cart-item, .item, [class*=cart-row], li")].filter(e => /kr/.test(e.textContent) && e.querySelector("a[href*='/products/']")).map(e => e.querySelector("a[href*='/products/']").getAttribute("href"));
    const recs = [...aside.querySelectorAll("[class*=hz8] a[href*='/products/']")].map(a => new URL(a.href, location.origin).pathname.replace(/^\/sv\/products\//, ""));
    return { open: !!document.querySelector("#cart-side-wrap.is-active"), rows: [...new Set(rows)].slice(0, 6), recs: [...new Set(recs)], total: (aside.querySelector(".total, [class*=total]") || {}).textContent?.replace(/\s+/g, " ").trim().slice(0, 60) || null, buy: !!aside.querySelector(".button.buy") };
  });
  const recSlugs = (cart && cart.recs || []).filter(s => !/magic-sauce-buds-yoda-ice-cream/.test(s));
  const res = { ...(R[w] || {}), cart, recLeaks: recSlugs.filter(s => CLS[s] && CLS[s] !== "PUBLIC + LISTED").map(s => s + " [" + CLS[s] + "]"), errors: p.errors.filter(e => !/trustpilot|gtm|Failed to load resource: the server responded with a status of 4/i.test(e)).slice(0, 4) };
  await p.screenshot({ path: path.join(DIR, `shots/${w}-minicart-${which}.png`) });
  if (cart && cart.buy) {
    await Promise.all([p.waitForURL(/checkout/, { timeout: 30000 }).catch(() => {}), p.locator("#cartAside .button.buy").click().catch(() => {})]);
    await p.waitForTimeout(4000);
    res.checkout = { url: p.url().replace(/\?.*$/, ""), isCheckout: /checkout/.test(p.url()), hasYoda: await p.evaluate(() => /Yoda Ice Cream/.test(document.body.innerText)) };
    await p.screenshot({ path: path.join(DIR, `shots/${w}-checkout-${which}.png`) });
  }
  R[w] = res; console.log(w, JSON.stringify(res)); await ctx.close();
}
fs.writeFileSync(path.join(DIR, `runs/cart-${which}.json`), JSON.stringify(R, null, 1)); await b.close();
