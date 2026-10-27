// TASK 01E -- desktop (1440/1920): verktygsraden i vila, desktopdockan
// efter scroll (ska fungera som förut) och att mobildockan aldrig visas.
// node desk.mjs before|after <route,..>
import { chromium, ctxFor, open, ready, DIR, ROUTES } from "./lib.mjs"; import fs from "node:fs";
const [which = "after", rs = "alla-vapes"] = process.argv.slice(2);
const OUT = `${DIR}/runs/shots`; fs.mkdirSync(OUT, { recursive: true });
const b = await chromium.launch(); const rows = [];
for (const route of rs.split(",")) for (const w of [1440, 1920]) {
  const ctx = await ctxFor(b, w, 900, { which }); const p = await open(ctx, ROUTES[route]); await ready(p, 5000);
  await p.evaluate(() => scrollTo({ top: 2200, behavior: "instant" })); await new Promise(r => setTimeout(r, 300));
  await p.evaluate(() => scrollTo({ top: 2400, behavior: "instant" })); await new Promise(r => setTimeout(r, 900));
  const r = await p.evaluate(() => { const d = document.querySelector(".hz8-pdock"), m = document.querySelector(".hz8-mdock"); return { pdockShown: !!d && d.classList.contains("is-shown"), mdockDisplay: m ? getComputedStyle(m).display : "absent", toolPos: getComputedStyle(document.querySelector(".hz8-ptool")).position }; });
  await p.screenshot({ path: `${OUT}/${which}-${route}-${w}-dock.png`, clip: { x: 0, y: 0, width: w, height: 260 } });
  rows.push({ which, route, w, ...r, errors: p.errors }); console.log(JSON.stringify(rows.at(-1))); await ctx.close();
}
fs.writeFileSync(`${DIR}/runs/desk-${which}-${rs.replace(/,/g, "_")}.json`, JSON.stringify(rows, null, 1)); await b.close();
