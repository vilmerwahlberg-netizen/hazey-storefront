// TASK 17 — renderar WooCommerce-kategorier vars server-HTML saknar produktposter (egna landningssidor),
// read-only: alla anrop som inte är GET blockeras, liksom varukorg/kassa/admin-ajax. En sida i taget, paus mellan.
// Kör: node woo-render.mjs slug ...  ->  runs/woo-render.json
import fs from "node:fs"; import path from "node:path";
import { chromium } from "playwright";
const DIR = path.dirname(new URL(import.meta.url).pathname);
const RAW = JSON.parse(fs.readFileSync(path.join(DIR, "runs/woo-raw.json"), "utf8"));
const out = fs.existsSync(path.join(DIR, "runs/woo-render.json")) ? JSON.parse(fs.readFileSync(path.join(DIR, "runs/woo-render.json"), "utf8")) : {};
const b = await chromium.launch(); const ctx = await b.newContext({ viewport: { width: 1440, height: 1000 } });
await ctx.route("**/*", r => { const q = r.request(); if (q.method() !== "GET" || /admin-ajax|add-to-cart|\/wc\/store\/v1\/(cart|checkout)|\/(varukorg|kassa|cart|checkout)\b/.test(q.url())) return r.abort(); return r.continue(); });
for (const slug of process.argv.slice(2)) {
  const c = RAW.categories.find(x => x.slug === slug); if (!c) continue;
  const p = await ctx.newPage();
  await p.goto(c.permalink, { waitUntil: "load", timeout: 60000 }).catch(() => {});
  await p.waitForTimeout(5000);
  for (let y = 0; y < 8; y++) { await p.mouse.wheel(0, 1200); await p.waitForTimeout(500); }
  const r = await p.evaluate(() => {
    const vis = el => { const s = getComputedStyle(el); const b = el.getBoundingClientRect(); return s.display !== "none" && s.visibility !== "hidden" && b.width > 20 && b.height > 20; };
    const inHeader = el => !!el.closest("header, #main-header, #top-header, nav, .et-menu, footer, #main-footer, .mega-menu, .et_mobile_menu");
    const links = [...document.querySelectorAll('a[href*="/produkt/"]')].filter(a => vis(a) && !inHeader(a)).map(a => a.href.replace(/^https:\/\/www\.hazey\.se\/produkt\//, "").replace(/\/.*$/, ""));
    return { h1: (document.querySelector("h1") || {}).textContent?.trim(), links: [...new Set(links)] };
  });
  out[slug] = { url: c.permalink, ...r, at: new Date().toISOString() };
  console.log(slug, r.h1, r.links.length, r.links.join(" "));
  await p.close(); await new Promise(r2 => setTimeout(r2, 3000));
}
await b.close();
fs.writeFileSync(path.join(DIR, "runs/woo-render.json"), JSON.stringify(out, null, 1));
