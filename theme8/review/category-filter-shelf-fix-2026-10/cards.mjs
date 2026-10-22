// Kortmått före/efter + sekvensbilder. node cards.mjs <BASE>
import { chromium, ctxFor, open, URL_ } from "../pdp-pilot-2026-10/lib.mjs"; import fs from "node:fs";
const BASE = process.argv[2]; const OUT = new URL("./after/", import.meta.url).pathname; const b = await chromium.launch(); const res = {};
for (const [lab, build] of [["before", BASE], ["after", undefined]]) for (const [k, path, w] of [["m-s-vapes", "/sv/categories/m-s-vapes", 1440], ["thca-vapes", "/sv/categories/thca-vapes", 1440], ["alla-vapes", "/sv/categories/alla-vapes", 1440], ["thca-vapes", "/sv/categories/thca-vapes", 393], ["alla-vapes", "/sv/categories/alla-vapes", 393]]) {
  const ctx = await ctxFor(b, w, w > 700 ? 900 : 852, build ? { build } : {}); const p = await open(ctx, URL_(path)); await p.waitForTimeout(13000);
  const r = await p.evaluate(() => { const c = [...document.querySelectorAll("#category-products .product-card, .hz8-series-results .product-card")].filter(x => x.offsetParent)[0]; const r = c.getBoundingClientRect(); const pill = [...c.querySelectorAll(".hz8-card-pill, .hz8-psold")].find(x => x.getClientRects().length); return { h: Math.round(r.height), name: c.querySelector(".name").textContent, cta: pill && Math.round(pill.getBoundingClientRect().height) }; });
  res[`${k}-${w}-${lab}`] = r; console.log(lab, k, w, JSON.stringify(r));
  const c = p.locator("#category-products .product-card:visible, .hz8-series-results .product-card:visible").first(); await c.scrollIntoViewIfNeeded(); await p.waitForTimeout(500);
  await p.addStyleTag({ content: "#store-header{visibility:hidden!important}" });
  const row = p.locator("#category-products, .hz8-series-results__grid").first(); const bb = await c.boundingBox();
  await p.screenshot({ path: `${OUT}card-${k}-${w}-${lab}.png`, clip: { x: 0, y: Math.max(0, bb.y - 10), width: w, height: bb.height + 20 } });
  await ctx.close(); }
fs.writeFileSync(OUT + "card-measure.json", JSON.stringify(res, null, 1));
// Sekvens: filtrerad Hasch -> ta bort filtret.
for (const w of [1440, 393]) { const ctx = await ctxFor(b, w, w > 700 ? 900 : 852, {}); const p = await open(ctx, URL_("/sv/categories/hasch", "filters=Serie_Magic+Sauce")); await p.waitForTimeout(11000);
  await p.addStyleTag({ content: "#store-header{visibility:hidden!important}" });
  const s = p.locator(".category-sort"); await s.scrollIntoViewIfNeeded(); await p.evaluate(() => scrollBy(0, -260)); await p.waitForTimeout(600);
  await p.screenshot({ path: `${OUT}hasch-filtered-${w}-1-active.png` });
  if (w < 768) { await p.click(".hz8-sf-fs__btn"); await p.waitForTimeout(400); await p.screenshot({ path: `${OUT}hasch-filtered-393-2-panel.png` }); await p.keyboard.press("Escape"); }
  const chip = p.locator(".category-sort .selected-filters-item:not(.no-chip):visible", { hasText: "Magic Sauce" }).first();
  await chip.locator(".selected-filters-item__remove, button, a").first().click().catch(() => chip.click()); await p.waitForTimeout(7000);
  await p.addStyleTag({ content: "#store-header{visibility:hidden!important}" });
  await p.locator(".category-sort").scrollIntoViewIfNeeded(); await p.evaluate(() => scrollBy(0, -260)); await p.waitForTimeout(600);
  await p.screenshot({ path: `${OUT}hasch-filtered-${w}-3-removed.png` }); await ctx.close(); }
await b.close();
