// TASK 04C-B -- verifiering av käll-routes i webbläsaren med Theme 8:s egna
// HZ8.fetchPage/categoryInfo/categoryCards (samma kodväg som hubben).
// node routes.mjs <route,..>  (sökvägar under /sv/categories/)
import { chromium, ctxFor, open, ready, DIR } from "./lib.mjs"; import fs from "node:fs";
const list = (process.argv[2] || "").split(",");
const b = await chromium.launch(); const ctx = await ctxFor(b, 1440, 900, { which: "after" });
const p = await open(ctx, "/sv/categories/magic-sauce"); await ready(p, 3000);
const rows = await p.evaluate(async list => {
  const out = [];
  for (const r of list) {
    const href = "/sv/categories/" + r;
    try {
      const [info, cards] = await Promise.all([HZ8.fetchPage(href, HZ8.categoryInfo), HZ8.fetchPage(href, HZ8.categoryCards)]);
      out.push({ route: href, count: info.count, cards: cards.map(c => { const m = c.html.match(/class="name"[^>]*>\s*([^<]+)/); const br = c.html.match(/class="brand"[^>]*>\s*([^<]+)/); return (m ? m[1].trim() : "?") + (br ? " [" + br[1].trim() + "]" : ""); }) });
    } catch (e) { out.push({ route: href, error: String(e) }); }
  }
  return out;
}, list);
for (const r of rows) console.log(JSON.stringify(r));
fs.writeFileSync(`${DIR}/runs/routes-${Date.now()}.json`, JSON.stringify(rows, null, 1));
await b.close();
