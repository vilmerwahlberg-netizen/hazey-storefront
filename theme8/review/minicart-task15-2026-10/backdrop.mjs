import { chromium, ctxFor, open, DIR } from "./lib.mjs";
const b = await chromium.launch();
for (const [w, h] of [[1440, 900], [1920, 1080]]) { const ctx = await ctxFor(b, w, h); const p = await open(ctx, "/sv/products/vape-thc-a-45-faraoh-2ml"); await p.waitForTimeout(2000); await p.screenshot({ path: `${DIR}/runs/backdrop-${w}.png` }); await ctx.close(); }
await b.close();
