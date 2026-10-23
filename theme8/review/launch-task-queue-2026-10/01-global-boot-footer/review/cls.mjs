// Upprepad CLS-mätning före/efter (brus vs regression). node cls.mjs route,.. width runs
import { chromium, ctxFor, open, ready, ROUTES, DIR } from "./lib.mjs"; import fs from "node:fs";
const [rs, w, n] = [process.argv[2].split(","), Number(process.argv[3]), Number(process.argv[4] || 3)];
const b = await chromium.launch(); const out = [];
for (const r of rs) for (const which of ["before", "after"]) { const v = [];
  for (let i = 0; i < n; i++) { const ctx = await ctxFor(b, w, w < 768 ? 852 : 900, { which });
    await ctx.addInitScript(() => { window.__cls = 0; new PerformanceObserver(l => { for (const e of l.getEntries()) if (!e.hadRecentInput) window.__cls += e.value; }).observe({ type: "layout-shift", buffered: true }); });
    const p = await open(ctx, ROUTES[r]); await ready(p, 6000); v.push(Math.round(await p.evaluate(() => window.__cls) * 1000) / 1000); await ctx.close(); }
  out.push({ route: r, w, which, cls: v }); console.log(r, w, which, v.join(", ")); }
fs.writeFileSync(`${DIR}/loaded/cls-repeat-${rs.join("_")}-${w}.json`, JSON.stringify(out, null, 1)); await b.close();
