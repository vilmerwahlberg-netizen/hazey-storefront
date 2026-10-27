// TASK 01G -- regression: Alla produkter (portal) ska vara oförändrad.
// node portal.mjs before|after
import { chromium, ctxFor, open, ready, DIR, ROUTES } from "./lib.mjs"; import fs from "node:fs";
const which = process.argv[2] || "after"; const S = `${DIR}/runs/shots`; fs.mkdirSync(S, { recursive: true }); const b = await chromium.launch();
for (const w of [393, 1440]) {
  const ctx = await ctxFor(b, w, w < 768 ? 852 : 900, { which }); const p = await open(ctx, ROUTES["alla-produkter"]); await ready(p, 6000);
  await p.screenshot({ path: `${S}/${which}-portal-${w}-top.png` });
  const y = await p.evaluate(() => { const e = document.querySelector(".hz8-proutes"); if (!e) return null; e.scrollIntoView({ block: "center", behavior: "instant" }); const r = e.getBoundingClientRect(); return { top: Math.round(r.top + scrollY), h: Math.round(r.height), items: [...e.querySelectorAll(".hz8-proutes__name")].map(x => x.textContent), kicker: e.querySelector(".hz8-kicker").textContent }; });
  if (y) { await p.waitForTimeout(600); await p.screenshot({ path: `${S}/${which}-portal-${w}-routes.png`, clip: { x: 0, y: y.top - 20, width: w, height: y.h + 40 }, fullPage: true }); }
  console.log(JSON.stringify({ which, w, routes: y, errors: p.errors })); await ctx.close();
}
await b.close();
