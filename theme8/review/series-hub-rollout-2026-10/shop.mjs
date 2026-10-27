// TASK 04C-R -- butikssidans serierutor: formatrad, antal och rutornas
// höjd före/efter att hubbdatan kommit (layoutskift), överflöd, fel.
// node shop.mjs before|after <width,..>
import { chromium, ctxFor, open, ready, DIR, ROUTES } from "./lib.mjs"; import fs from "node:fs";
const [which = "after", ws = "393,1440"] = process.argv.slice(2);
const b = await chromium.launch(); const rows = [];
for (const w of ws.split(",").map(Number)) {
  const ctx = await ctxFor(b, w, w < 768 ? 852 : 900, { which }); const p = await open(ctx, ROUTES.butik); await ready(p, 2500);
  const h0 = await p.evaluate(() => [...document.querySelectorAll(".hz8-shop__stile")].map(li => Math.round(li.getBoundingClientRect().height)));
  await p.waitForFunction(() => [...document.querySelectorAll(".hz8-shop__scount")].every(e => e.textContent), null, { timeout: 40000 }).catch(() => {}); await p.waitForTimeout(2500);
  const r = await p.evaluate(() => ({ tiles: [...document.querySelectorAll(".hz8-shop__stile")].map(li => ({ name: (li.querySelector(".hz8-shop__sname") || {}).textContent, formats: (li.querySelector(".hz8-shop__sformats") || {}).textContent || "", count: (li.querySelector(".hz8-shop__scount") || {}).textContent, href: new URL(li.querySelector("a").href).pathname, h: Math.round(li.getBoundingClientRect().height) })), overflowX: document.documentElement.scrollWidth > innerWidth + 1 }));
  const row = { which, w, heightsBefore: h0, ...r, errors: p.errors }; rows.push(row); console.log(JSON.stringify(row)); await ctx.close();
}
fs.writeFileSync(`${DIR}/runs/shop-${which}-${ws.replace(/,/g, "_")}.json`, JSON.stringify(rows, null, 1));
await b.close();
