// TASK 25b — regression: Magic Sauce-hubbens D10-rad (vapes) oförändrad, inga buds/hasch-rader på hubben.
import fs from "node:fs"; import path from "node:path";
import { chromium, ctxFor, open, ready } from "../../catalog-reconciliation-2026-11/lib/harness.mjs";
const DIR = path.dirname(new URL(import.meta.url).pathname); const out = {};
const b = await chromium.launch();
for (const VP of [393, 1440]) {
  const ctx = await ctxFor(b, VP, VP < 768 ? 852 : 1000, { which: "after" }); const p = await open(ctx, "/sv/categories/magic-sauce"); await ready(p, 8000);
  for (let i = 0; i < 25; i++) { await p.mouse.wheel(0, 1000); await p.waitForTimeout(400); }
  await p.waitForTimeout(3000);
  const btn = p.locator(".hz8-sh-more__btn").first(); if (await btn.count()) { await btn.scrollIntoViewIfNeeded(); await btn.click(); await p.waitForTimeout(2500); }
  const s = await p.evaluate(() => [...document.querySelectorAll(".hz8-sh-more")].map(m => ({ title: m.querySelector(".hz8-sh-more__t").textContent, after: m.closest(".hz8-sh-more-slot")?.previousElementSibling?.getAttribute("data-sh"), cards: [...m.querySelectorAll(".product-card")].map(c => (c.querySelector(".name")?.textContent.trim()) + " [" + (c.getAttribute("data-hz8-instock") === "1" ? "I lager" : c.querySelector(".hz8-pstock:not([hidden])")?.textContent.trim() || "-") + "]") })));
  out[VP] = s; await ctx.close();
  const ok = s.length === 1 && s[0].title === "Fler vapes från Magic Farmers" && s[0].after === "vapes" && s[0].cards.length > 1;
  console.log(VP, ok ? "PASS" : "FAIL", JSON.stringify(s));
}
fs.writeFileSync(path.join(DIR, "hub-regression.json"), JSON.stringify(out, null, 1)); await b.close();
