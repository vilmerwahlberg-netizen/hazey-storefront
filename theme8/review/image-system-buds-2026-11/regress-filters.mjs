// TASK 17B — regressionskontroll av filterytan på Allt Hasch och Alla Vapes (före/efter): serieval, dimensioner, antal kort.
import fs from "node:fs"; import path from "node:path";
import { chromium, ctxFor, open, ready, DIR } from "./lib/harness.mjs";
const which = process.argv[2] || "after"; const out = {};
const b = await chromium.launch();
for (const r of ["/sv/categories/hasch", "/sv/categories/alla-vapes"]) for (const w of [393, 1440]) {
  const ctx = await ctxFor(b, w, 900, { which }); const p = await open(ctx, r); await ready(p, 8000); await p.waitForTimeout(6000);
  const m = await p.evaluate(() => ({
    series: [...document.querySelectorAll(".hz8-ptool [data-hz8-series]")].map(e => e.getAttribute("data-hz8-series")),
    dims: [...new Set([...document.querySelectorAll('[data-pt-dim] [data-hz8-dim]')].filter(e => !e.hidden).map(e => e.getAttribute("data-hz8-dim") + "=" + e.getAttribute("data-value") + "(" + e.querySelector(".hz8-popt__count").textContent + ")"))],
    volTitle: [...new Set([...document.querySelectorAll('[data-acc="volume"] .hz8-pacc__title')].map(e => e.textContent + (e.closest("[data-acc]").hidden ? " (dold)" : "")))],
    cards: [...document.querySelectorAll(".product-card")].filter(e => e.getBoundingClientRect().width > 20).length,
    overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth
  }));
  m.errors = p.errors.filter(e => !/trustpilot|gtm|status of 4/i.test(e)).length;
  out[r + "|" + w] = m; console.log(which, w, r, JSON.stringify(m)); await ctx.close();
}
fs.writeFileSync(path.join(DIR, `runs/regress-filters-${which}.json`), JSON.stringify(out, null, 1)); await b.close();
