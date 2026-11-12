import { chromium, ctxFor, open, ready } from "../../catalog-reconciliation-2026-11/lib/harness.mjs";
const b = await chromium.launch(); const ctx = await ctxFor(b, 1440, 1000, { which: "after" });
const p = await open(ctx, "/sv/categories/alla-vapes"); await ready(p, 2000);
console.log(JSON.stringify(await p.evaluate(() => window.HZ8.catalog.build().series.map(s => ({ n: s.name, hub: s.hub, routes: s.routes })))));
await b.close();
