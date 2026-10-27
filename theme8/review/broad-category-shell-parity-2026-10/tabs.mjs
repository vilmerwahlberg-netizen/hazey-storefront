// TASK 01G -- serieflikarna är riktiga filter på sidan: klick/tangentbord ->
// URL ?serie=, antal, bakåt/framåt/omladdning. Alla tre rutter, 1440 + 393.
// node tabs.mjs before|after
import { chromium, ctxFor, open, ready, DIR } from "./lib.mjs"; import fs from "node:fs";
const which = process.argv[2] || "after";
const ROUTE = { vapes: "/sv/categories/alla-vapes", buds: "/sv/categories/blommor-buds", hasch: "/sv/categories/hasch" };
const b = await chromium.launch(); const out = [];
const st = p => p.evaluate(() => ({ url: location.search.replace(/[?&]preview=[^&]+/, ""), path: location.pathname, count: (document.querySelector(".hz8-pcount") || {}).textContent, pressed: [...document.querySelectorAll(".hz8-pfam__tab[aria-pressed=true]")].map(t => t.textContent.trim()), cards: [...document.querySelectorAll(".hz8-series-results .product-card")].filter(e => e.getClientRects().length).length }));
for (const r of Object.keys(ROUTE)) for (const w of [1440, 393]) {
  const ctx = await ctxFor(b, w, w < 768 ? 852 : 900, { which }); const p = await open(ctx, ROUTE[r]); await ready(p, 5000);
  const row = { r, w, start: await st(p) };
  const tab = p.locator(".hz8-pfam__tab", { hasText: "Magic Sauce" }).first();
  if (!(await tab.count())) { row.error = "no Magic Sauce tab"; out.push(row); await ctx.close(); continue; }
  if (w < 768) await tab.tap().catch(() => tab.click()); else await tab.click();
  await p.waitForTimeout(2500); row.clicked = await st(p);
  // Tangentbord: Tab till "Alla"-fliken, Enter.
  const all = p.locator('.hz8-pfam__tab[data-fam=""]'); await all.focus(); await p.keyboard.press("Enter"); await p.waitForTimeout(2500); row.keyboardAll = await st(p);
  await p.goBack(); await p.waitForTimeout(2500); row.back = await st(p);
  await p.goBack(); await p.waitForTimeout(2500); row.back2 = await st(p);
  await p.goForward(); await p.waitForTimeout(2500); row.forward = await st(p);
  await p.reload({ waitUntil: "domcontentloaded" }); await ready(p, 5000); row.reload = await st(p);
  row.navigatedAway = row.clicked.path !== row.start.path;
  row.errors = p.errors; out.push(row); console.log(JSON.stringify(row)); await ctx.close();
}
fs.writeFileSync(`${DIR}/runs/tabs-${which}.json`, JSON.stringify(out, null, 1)); await b.close();
