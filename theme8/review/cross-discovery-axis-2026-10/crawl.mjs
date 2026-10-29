// TASK 04A -- länkarna finns innan antalen kommit: alla kategori-fetchar
// (inte dokumentet) fördröjs 6 s; modulens länkar läses direkt efter boot.
// Samt nätfel: destinationernas sidor avbryts -> länkarna står kvar utan antal.
// node crawl.mjs [route,..]
import { chromium, ctxFor, open, ready, DIR, ROUTES } from "./lib.mjs"; import fs from "node:fs";
const [rs = "thcab-vapes,buds,magic-sauce"] = process.argv.slice(2);
const b = await chromium.launch(); const rows = [];
for (const mode of ["slow", "fail"]) for (const route of rs.split(",")) {
  const ctx = await ctxFor(b, 1440, 900, { which: "after" });
  const self = new URL("https://x" + ROUTES[route]).pathname;
  await ctx.route(/hazeyse\.nyehandel\.se\/sv\/categories\/[^#]+/, async r => {
    const req = r.request(); if (req.resourceType() === "document") return r.fallback();
    if (new URL(req.url()).pathname === self) return r.fallback();
    if (mode === "fail") return r.abort("failed");
    await new Promise(res => setTimeout(res, 6000)); return r.fallback();
  });
  const p = await open(ctx, ROUTES[route]); await ready(p, mode === "slow" ? 300 : 9000);
  const g = await p.evaluate(() => { const m = document.querySelector(".hz8-xd"); return m && { hidden: m.hidden, links: [...m.querySelectorAll("a.hz8-sf-serie")].map(a => ({ t: a.querySelector(".hz8-sf-serie__name").textContent, href: new URL(a.href).pathname + new URL(a.href).search.replace(/[?&]?preview=[^&]+/, ""), count: a.querySelector(".hz8-sf-serie__count").textContent, h: Math.round(a.getBoundingClientRect().height) })) }; });
  rows.push({ mode, route, ...g, errors: p.errors.filter(e => !/net::ERR_FAILED|Failed to load resource/.test(e)) }); console.log(JSON.stringify(rows.at(-1)));
  await ctx.close();
}
fs.writeFileSync(`${DIR}/runs/crawl.json`, JSON.stringify(rows, null, 1));
await b.close();
