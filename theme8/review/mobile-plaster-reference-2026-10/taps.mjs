// TASK 01D-R -- träffyta: guide-CTA, sökfält (portal), första fliken och
// "Filter & sortera" scrollas till vyns mitt och träffas av elementFromPoint
// i kontrollens mitt (inte putsen eller heron). node taps.mjs <which>
import { chromium, ctxFor, open, ready, DIR, ROUTES } from "./lib.mjs"; import fs from "node:fs";
const which = process.argv[2] || "after";
const b = await chromium.launch(); const rows = [];
for (const route of ["alla-vapes", "buds", "hasch", "alla-produkter"]) for (const ws of ["320", "393", "430", "720z"]) {
  const z = ws.endsWith("z"), w = parseInt(ws);
  const ctx = await ctxFor(b, w, z ? 450 : 852, { which, zoom: z ? 2 : 0 }); const p = await open(ctx, ROUTES[route]); await ready(p, 4000);
  const hits = await p.evaluate(async () => {
    const out = {};
    for (const [k, s] of [["guideCta", ".hz8-pguide__cta"], ["search", ".hz8-pq__input"], ["firstTab", ".hz8-pfam__tab"], ["filter", ".hz8-ptool__mob .hz8-ptool__filter"]]) {
      const e = document.querySelector(s); if (!e || !e.getClientRects().length) continue;
      const r0 = e.getBoundingClientRect(); window.scrollTo({ top: scrollY + r0.top - innerHeight / 2, behavior: "instant" }); await new Promise(r => setTimeout(r, 250));
      const r = e.getBoundingClientRect(); const t = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2);
      out[k] = t && (t === e || e.contains(t)) ? "ok" : "BLOCKED " + (t ? t.className : "null");
    }
    return out;
  });
  rows.push({ which, route, w: ws, hits, overflowX: await p.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1), errors: p.errors }); console.log(JSON.stringify(rows.at(-1)));
  await ctx.close();
}
fs.writeFileSync(`${DIR}/runs/taps-${which}.json`, JSON.stringify(rows, null, 1)); await b.close();
