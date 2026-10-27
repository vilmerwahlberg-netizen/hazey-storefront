// TASK 01E -- ramen "aktivt filter" (393): Alla Vapes ?volym=2ml, Alla
// produkter ?typ=vapes, scrollat förbi raden. node active.mjs before|after
import { chromium, ctxFor, open, ready, DIR, ROUTES } from "./lib.mjs";
const which = process.argv[2] || "after"; const b = await chromium.launch();
for (const [route, q] of [["alla-vapes", "?volym=2ml"], ["alla-produkter", "?typ=vapes"]]) {
  const ctx = await ctxFor(b, 393, 852, { which }); const p = await open(ctx, ROUTES[route] + q); await ready(p, 5000);
  await p.evaluate(() => scrollTo({ top: 1300, behavior: "instant" })); await p.waitForTimeout(900);
  await p.screenshot({ path: `${DIR}/runs/frames/${which}-${route}-393-04-active.png` }); await ctx.close();
}
await b.close(); console.log("ok");
