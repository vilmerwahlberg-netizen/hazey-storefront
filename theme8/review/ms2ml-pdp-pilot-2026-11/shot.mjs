// Helsidesbilder + DOM-kontroller för MS 2 ml-piloten. Lokal build injiceras
// i Theme 8-previewn (lib.mjs). Användning: node shot.mjs <prefix> [bredd ...]
import { chromium, ctxFor, open, URL_ } from "../pdp-pilot-2026-10/lib.mjs";
import fs from "node:fs"; import path from "node:path";
const DIR = path.dirname(new URL(import.meta.url).pathname);
const prefix = process.argv[2] || "after";
const SIZES = { 393: 852, 1440: 900, 1920: 1080 };
const widths = (process.argv.slice(3).length ? process.argv.slice(3) : Object.keys(SIZES)).map(Number);
const PATH = process.env.PDP || "/sv/products/vape-magic-sauce-magic-farmers-2ml/454";
const browser = await chromium.launch({ channel: "chrome", headless: true });
const out = {};
for (const w of widths) {
  const ctx = await ctxFor(browser, w, SIZES[w], { local: process.env.LOCAL !== "0", scale: 1 });
  const p = await open(ctx, URL_(PATH, process.env.QS || ""));
  await p.waitForSelector(".hz8-pp", { timeout: 30000 }).catch(() => {});
  await p.waitForTimeout(5000);
  const H = await p.evaluate(() => document.documentElement.scrollHeight);
  for (let y = 0; y < H; y += 500) { await p.evaluate(v => window.scrollTo(0, v), y); await p.waitForTimeout(140); }
  await p.waitForTimeout(2500);
  await p.evaluate(() => window.scrollTo(0, 0)); await p.waitForTimeout(800);
  out[w] = await p.evaluate(() => {
    const vis = el => !!(el && el.offsetParent !== null && getComputedStyle(el).visibility !== "hidden");
    const h = sel => [...document.querySelectorAll(sel)].filter(vis).map(e => e.textContent.replace(/\s+/g, " ").trim());
    const links = [...document.querySelectorAll("main a[href], .hz8-ppc a[href]")].filter(vis).map(a => a.getAttribute("href"));
    return {
      scrollWidth: document.documentElement.scrollWidth, innerWidth: innerWidth,
      h1: h("h1"), h2: h("h2"), anchorsBroken: links.filter(h => h.startsWith("#") && h.length > 1 && !document.getElementById(h.slice(1))),
      carousel: [...document.querySelectorAll("[data-hz8-ms-rail] .hz8-pcx-more__name")].map(e => e.textContent.trim()),
      rating: !!document.querySelector(".hz8-pp__rating"), reviews: !!document.querySelector("#omdomen .hz8-pr"),
      ordering: [...document.querySelectorAll(".hz8-ppc > *")].filter(vis).map(e => e.id || e.className.split(" ")[0])
    };
  });
  out[w].errors = p.errors.slice(0, 8);
  /* Glaset (backdrop-filter) ritas inte utanför vyn i fullPage-läge:
     vyn görs lika hög som sidan i stället. */
  const fullH = await p.evaluate(() => document.documentElement.scrollHeight);
  await p.setViewportSize({ width: w, height: fullH }); await p.waitForTimeout(1200);
  await p.screenshot({ path: path.join(DIR, "shots", `${prefix}-${w}.jpg`), type: "jpeg", quality: 72 });
  /* Närbilder per sektion (SECTIONS=1). OPEN=1 öppnar Full produktinformation. */
  if (process.env.SECTIONS) {
    if (process.env.OPEN) await p.evaluate(() => { const d = document.getElementById("hz8-pcx-full"); if (d) d.open = true; });
    const secs = [["01-kop", ".product-detail"], ["02-vad-ar", "#hz8-pcx-sum"], ["03-strains-labb", "#hz8-pcx-strains"], ["04-om", "#hz8-pcx-om"], ["05-faq", "#hz8-pcx-faq"], ["06-karusell", "#liknande"], ["07-avslut", ".hz8-ppc--authored > .related-categories"]];
    fs.mkdirSync(path.join(DIR, "shots", "sections"), { recursive: true });
    for (const [name, sel] of secs) {
      const box = await p.evaluate(s => { const e = document.querySelector(s); if (!e) return null; const r = e.getBoundingClientRect(); return { y: r.top + scrollY, h: r.height }; }, sel);
      if (!box) continue;
      let y = Math.max(0, box.y - 24), h = box.h + 48;
      if (name === "07-avslut") h = await p.evaluate(() => document.documentElement.scrollHeight) - y; // kategorier -> footer
      await p.screenshot({ path: path.join(DIR, "shots", "sections", `${prefix}-${w}-${name}.jpg`), fullPage: true, clip: { x: 0, y, width: w, height: Math.min(h, 3000) }, type: "jpeg", quality: 78 });
    }
  }
  await ctx.close();
}
fs.writeFileSync(path.join(DIR, "shots", `${prefix}.json`), JSON.stringify(out, null, 1));
console.log(JSON.stringify(out, null, 1));
await browser.close();
