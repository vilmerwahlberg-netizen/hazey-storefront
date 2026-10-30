// Närbilder: utökningsraden (12 / 24 / allt visat) och vald formatruta, 393 + 1440. node closeup.mjs
import { chromium, ctxFor, open, ready, DIR } from "./lib.mjs";
const b = await chromium.launch();
for (const w of [393, 1440]) for (const [n, q] of [["12", ""], ["24", "?visa=24"], ["all", "?typ=hasch&visa=24"]]) {
  const ctx = await ctxFor(b, w, w < 768 ? 852 : 900, { which: "after" }); const p = await open(ctx, "/sv/page/vara-bastsaljare" + q); await ready(p, 9000);
  const el = p.locator(".hz8-bs-more"); await el.scrollIntoViewIfNeeded(); await p.waitForTimeout(500);
  await el.screenshot({ path: `${DIR}/runs/shots/after-r2-ctl-${n}-${w}.png` });
  if (n === "all") { const g = p.locator(".hz8-bs-guide"); await g.scrollIntoViewIfNeeded(); await p.waitForTimeout(400); await g.screenshot({ path: `${DIR}/runs/shots/after-r2-guide-hasch-${w}.png` }); }
  await ctx.close();
}
await b.close();
