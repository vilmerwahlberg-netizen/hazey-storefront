import { chromium, ctxFor, open, ready } from "../../catalog-reconciliation-2026-11/lib/harness.mjs";
const UA = "Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Mobile Safari/537.36";
const b = await chromium.launch();
for (const route of ["/sv/categories/alla-vapes", "/sv/categories/alla-vapes?filters=smart-filter_in-stock"]) {
  const ctx = await ctxFor({ newContext: o => b.newContext({ ...o, userAgent: UA }) }, 393, 852, { which: "after" });
  const p = await open(ctx, route); await ready(p, 9000);
  console.log(route, JSON.stringify(await p.evaluate(() => [...document.querySelectorAll("body *")].filter(e => e.children.length === 0 && /^\s*\d+\s+produkt(er)?\s*$/.test(e.textContent) && e.getClientRects().length && getComputedStyle(e).visibility !== "hidden").map(e => ({ cls: e.className, t: e.textContent.trim(), hidden: e.closest("[aria-hidden=true]") ? "aria-hidden" : "" })))));
  await ctx.close();
}
await b.close();
