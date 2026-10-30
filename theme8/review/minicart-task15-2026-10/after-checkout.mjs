// TASK 15: kassaknappen använder Nyehandels egen navigering till kassan
// (ingen order läggs; sidan laddas bara och stängs).
import { chromium, ctxFor, open, add, openCart, DIR } from "./lib.mjs"; import fs from "node:fs";
const b = await chromium.launch(); const R = {};
for (const [w, h] of [[1440, 900], [393, 852]]) {
  const ctx = await ctxFor(b, w, h); const p = await open(ctx, "/sv/products/vape-thc-a-45-faraoh-2ml");
  await add(p, 130, 1); await openCart(p); await p.waitForTimeout(3000);
  const label = await p.evaluate(() => document.querySelector("#cartAside .button.buy").getAttribute("data-hz8-label"));
  await Promise.all([p.waitForURL(/checkout/, { timeout: 30000 }).catch(() => {}), p.locator("#cartAside .button.buy").click()]);
  await p.waitForTimeout(4000);
  R[w] = { label, url: p.url().replace(/\?.*$/, ""), checkoutPage: await p.evaluate(() => document.body.classList.contains("checkout-page") || /checkout/.test(location.pathname)), total: await p.evaluate(() => (document.querySelector(".checkout-total, .checkout-summary") || {}).textContent?.replace(/\s+/g, " ").trim().slice(0, 160)) };
  await p.screenshot({ path: `${DIR}/after/${w}-checkout-handoff.png` });
  console.log(w, JSON.stringify(R[w])); await ctx.close();
}
fs.writeFileSync(`${DIR}/runs/after-checkout.json`, JSON.stringify(R, null, 1)); await b.close();
