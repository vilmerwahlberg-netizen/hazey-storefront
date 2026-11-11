// TASK 20 v5: körs Theme 8 på paketens direktsidor? Läsande. which=external (publicerad Theme 8 via GitHub Pages)
// och which=after (lokal build). Dessutom: länkar till basprodukten i paketsidans HTML.
import fs from "node:fs"; import path from "node:path";
import { chromium, ctxFor, open, ready } from "../../../catalog-reconciliation-2026-11/lib/harness.mjs";
const DIR = path.dirname(new URL(import.meta.url).pathname);
const b = await chromium.launch(); const out = {};
for (const which of ["external", "after"]) {
  const ctx = await ctxFor(b, 1440, 1000, { which });
  const p = await open(ctx, "/sv/products/heros-core-2ml-5-pack-blandbart"); await ready(p, 3000);
  out[which] = await p.evaluate(() => ({ url: location.href, hz8: document.documentElement.classList.contains("hz8"), loader: !!document.querySelector("[data-hz8-dev-js]"), hz8Obj: !!window.HZ8, page: document.documentElement.getAttribute("data-hz8-page"),
    viewProduct: (document.documentElement.innerHTML.match(/viewProduct\(.(\d+)/) || [])[1], baseLinks: [...new Set([...document.querySelectorAll("a[href*='/products/']")].map(a => a.getAttribute("href")).filter(h => !/blandbart/.test(h)))].slice(0, 12) }));
  await ctx.close();
}
// Rå HTML (som loadPivots ser den) från den skarpa sajten utan preview.
const r = await fetch("https://hazeyse.nyehandel.se/sv/products/heros-core-2ml-5-pack-blandbart", { headers: { "User-Agent": "Mozilla/5.0 hazey-review" } });
const html = await r.text();
out.liveRaw = { status: r.status, hasLoaderTheme8: /Theme 8 development loader/.test(html), scripts: [...html.matchAll(/<script[^>]*src="([^"]+)"/g)].map(m => m[1]).filter(s => !/cloudfront|googletag|gtm/.test(s)).slice(0, 10), hazeyRefs: [...new Set(html.match(/hazey-storefront[^"' ]*/g) || [])].slice(0, 5) };
fs.writeFileSync(path.join(DIR, "probe-direct.json"), JSON.stringify(out, null, 2)); console.log(JSON.stringify(out, null, 1));
await b.close();
