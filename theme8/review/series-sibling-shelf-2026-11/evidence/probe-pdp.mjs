// TASK 25b — sond: vilka hyllor PDP:erna har idag (lokal build). Läser bara.
import { chromium, ctxFor, open, ready } from "../../catalog-reconciliation-2026-11/lib/harness.mjs";
const b = await chromium.launch();
for (const r of (process.argv[2] || "/sv/products/vape-magic-sauce-magic-farmers-2ml,/sv/products/magic-sauce-buds-grape-gasoline,/sv/products/magic-sauce-hash-kitkat-5g").split(",")) {
  const ctx = await ctxFor(b, 1440, 1000, { which: "after" }); const p = await open(ctx, r); await ready(p, 8000);
  for (let y = 0; y < 12; y++) { await p.mouse.wheel(0, 1500); await p.waitForTimeout(500); }
  await p.waitForTimeout(4000);
  const s = await p.evaluate(() => ({ pilot: !!document.querySelector(".hz8-ppc"), html: document.documentElement.className, rel: [...document.querySelectorAll(".related-categories a")].map(a => a.textContent.trim() + "=" + new URL(a.href).pathname),
    heads: [...document.querySelectorAll("h2,h3,.hz8-sh-more__t,.hz8-more__title")].filter(e => e.getClientRects().length).map(e => e.className.split(" ")[0] + ": " + e.textContent.trim().slice(0, 70)) }));
  console.log("\n##", r, JSON.stringify(s, null, 1)); await ctx.close();
}
await b.close();
