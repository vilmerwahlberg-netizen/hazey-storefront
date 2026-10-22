// R5-bilder efter build: <route>-<viewport>-{first,full}.png + mätvärden. node shots-r5.mjs [BUILD] [outdir]
import { chromium, ctxFor, open, URL_ } from "../pdp-pilot-2026-10/lib.mjs"; import fs from "node:fs";
const BUILD = process.argv[2] || undefined, OUT = new URL(`./${process.argv[3] || "r5"}/`, import.meta.url).pathname; fs.mkdirSync(OUT, { recursive: true });
const ROUTES = [["blommor-buds", "/sv/categories/blommor-buds", ""], ["buds-thcab", "/sv/categories/blommor-buds", "serie=thcab"], ["hasch", "/sv/categories/hasch", ""], ["hasch-ms", "/sv/categories/hasch", "serie=magic-sauce"], ["alla-vapes", "/sv/categories/alla-vapes", ""], ["m-s-vapes", "/sv/categories/m-s-vapes", ""]];
const VP = (process.env.VP || "393,1024,1440,1920,z393").split(",");
const only = process.env.ONLY ? process.env.ONLY.split(",") : null;
const b = await chromium.launch(); const M = fs.existsSync(OUT + "measure.json") ? JSON.parse(fs.readFileSync(OUT + "measure.json")) : {};
for (const [k, path, q] of ROUTES) { if (only && !only.includes(k)) continue; for (const v of VP) {
  if (v === "z393" && !["blommor-buds", "hasch"].includes(k)) continue;
  const [w, h, sc, tag] = v === "z393" ? [197, 426, 4, "393z200"] : v === "393" ? [393, 852, 2, "393"] : [+v, { 1024: 768, 1440: 900, 1920: 1080 }[v], 1, v];
  const ctx = await ctxFor(b, w, h, { ...(BUILD ? { build: BUILD } : {}), scale: sc }); const p = await open(ctx, URL_(path, q)); await p.waitForTimeout(12000);
  await p.evaluate(async () => { await (document.fonts && document.fonts.ready); for (let y = 0; y < document.body.scrollHeight; y += 600) { scrollTo({ top: y, behavior: "instant" }); await new Promise(r => setTimeout(r, 80)); } document.documentElement.style.scrollBehavior = "auto"; scrollTo(0, 0); }); await p.waitForTimeout(1500); await p.mouse.move(w - 5, h - 5);
  const m = await p.evaluate(() => { const act = document.querySelector('.hz8-pfam__tab[aria-pressed="true"]'); const card = [...document.querySelectorAll("#category-products .product-card, .hz8-series-results .product-card")].find(c => c.offsetParent); const tool = document.querySelector(".hz8-ptool, .hz8-sf-tabs");
    return { underline: act ? Math.round(act.getBoundingClientRect().bottom - 5) : null, card: card ? Math.round(card.getBoundingClientRect().top) : null, tool: tool ? Math.round(tool.getBoundingClientRect().top) : null, sy: Math.round(scrollY), iw: innerWidth, sw: document.documentElement.scrollWidth }; });
  m.err = p.errors.filter(e => !/Failed to load|429|net::/.test(e)).length; M[`${k}-${tag}`] = m;
  await p.screenshot({ path: `${OUT}${k}-${tag}-first.png` }); await p.screenshot({ path: `${OUT}${k}-${tag}-full.png`, fullPage: true });
  console.log(k, tag, JSON.stringify(m)); await ctx.close(); } }
fs.writeFileSync(OUT + "measure.json", JSON.stringify(M, null, 1)); await b.close();
