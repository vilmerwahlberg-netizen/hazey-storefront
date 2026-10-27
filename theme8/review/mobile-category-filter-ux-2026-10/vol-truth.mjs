// TASK 01E -- volymsanning: alla produktnamn i Alla Vapes-pilotens källor
// (samma hämtning som 80-category.js: HZ8.fetchPage + categoryCards, alla
// sidor) och vilken volym som tolkas ur namnet. node vol-truth.mjs before|after
import { chromium, ctxFor, open, ready, ROUTES, DIR } from "./lib.mjs"; import fs from "node:fs";
const which = process.argv[2] || "after";
const b = await chromium.launch(); const ctx = await ctxFor(b, 393, 852, { which });
const p = await open(ctx, ROUTES["alla-vapes"]); await ready(p, 4000);
const r = await p.evaluate(async () => {
  const srcs = HZ8.catalog.familyFormats("vapes").map(f => ({ key: f.key, href: f.href }));
  const out = [];
  for (const s of srcs) {
    const info = await HZ8.fetchPage(s.href, HZ8.categoryInfo); let cards = await HZ8.fetchPage(s.href, HZ8.categoryCards);
    const size = cards.length || 1, pages = Math.ceil((info.count || cards.length) / size);
    for (let i = 2; i <= pages; i++) { const u = new URL(s.href, location.href); u.searchParams.set("page", i); cards = cards.concat(await HZ8.fetchPage(u.pathname + u.search, HZ8.categoryCards)); }
    for (const c of cards) { const m = c.html.match(/class="name"[^>]*>\s*([^<]+?)\s*</); const n = m ? m[1].replace(/&amp;/g, "&").trim() : ""; const v = HZ8.pilotVolume(n); out.push({ src: s.key, name: n, key: v && v.key, label: v && v.label }); }
  }
  const opts = [...document.querySelectorAll('#hz8-pfilter [data-pt-dim="volym"] .hz8-popt')].map(o => o.getAttribute("data-value"));
  return { srcs, out, opts };
});
fs.writeFileSync(`${DIR}/runs/vol-truth-${which}.json`, JSON.stringify(r, null, 1));
const by = {}; r.out.forEach(o => { const k = o.label || "(ingen volym)"; (by[k] = by[k] || []).push(o.src + ": " + o.name); });
console.log("källor", r.srcs.map(s => s.key + " " + s.href).join(" | ")); console.log("filteralternativ", r.opts.join(", "));
for (const k of Object.keys(by)) console.log("\n" + k + " (" + by[k].length + ")\n  " + by[k].join("\n  "));
await b.close();
