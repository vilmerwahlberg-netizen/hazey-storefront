// Före/efter-bilder för filterhylla + filtrerade vyer. node shots.mjs <lab> [BUILD]
import { chromium, ctxFor, open, URL_ } from "../pdp-pilot-2026-10/lib.mjs"; import fs from "node:fs";
const lab = process.argv[2], BUILD = process.argv[3]; const OUT = new URL(`./${lab}/`, import.meta.url).pathname; fs.mkdirSync(OUT, { recursive: true });
export const ROUTES = [["m-s-vapes", "/sv/categories/m-s-vapes", ""], ["m-s-buds", "/sv/categories/m-s-buds", ""], ["thca-vapes", "/sv/categories/thca-vapes", ""], ["thca-hash", "/sv/categories/thca-hash", ""], ["alla-vapes", "/sv/categories/alla-vapes", ""], ["alla-cartridges", "/sv/categories/alla-cartridges", ""], ["blommor-buds", "/sv/categories/blommor-buds", ""], ["hasch", "/sv/categories/hasch", ""], ["hasch-ms", "/sv/categories/hasch", "filters=Serie_Magic+Sauce"], ["buds-thcab", "/sv/categories/blommor-buds", "serie=thcab"]];
const only = process.env.ONLY ? process.env.ONLY.split(",") : null;
const b = await chromium.launch();
for (const [k, path, q] of ROUTES) { if (only && !only.includes(k)) continue; for (const [w, h] of [[1440, 900], [393, 852]]) {
  const ctx = await ctxFor(b, w, h, BUILD ? { build: BUILD } : {}); const p = await open(ctx, URL_(path, q)); await p.waitForTimeout(11000);
  await p.evaluate(async () => { for (let y = 0; y < document.body.scrollHeight; y += 600) { scrollTo({ top: y, behavior: "instant" }); await new Promise(r => setTimeout(r, 90)); } scrollTo({ top: 0, behavior: "instant" }); }); await p.waitForTimeout(1200); await p.mouse.move(w - 10, h - 10);
  await p.screenshot({ path: `${OUT}${k}-${w}-first.png` }); await p.screenshot({ path: `${OUT}${k}-${w}-full.png`, fullPage: true });
  const r = await p.evaluate(() => ({ h1: [...document.querySelectorAll("h1")].map(h => h.textContent.trim()), sf: document.documentElement.classList.contains("hz8-sf"), pilot: document.documentElement.classList.contains("hz8-cat-pilot"), ov: document.documentElement.scrollWidth - innerWidth, lead: (document.querySelector(".hz8-cat-lead") || {}).textContent }));
  console.log(lab, k, w, JSON.stringify(r).slice(0, 300), p.errors.filter(e => !/Failed to load|429|net::/.test(e)).length); await ctx.close(); } }
await b.close();
