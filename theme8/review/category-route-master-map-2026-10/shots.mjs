// TASK 04 — representativa kontroller + anomalier i extern Theme 8-preview
// (ingen interception, ingen lokal build: exakt det som previewn visar nu).
// En webbläsare, sekventiellt. Playwright lånas från huvudcheckouten om
// worktreen saknar node_modules: PW=/abs/path/node_modules/playwright/index.mjs
// Kör: node shots.mjs  -> shots/*.jpg + shots/shots.json
import fs from "node:fs";
import path from "node:path";

const DIR = path.dirname(new URL(import.meta.url).pathname);
const { chromium } = await import(process.env.PW || "playwright");
const PREVIEW = "v9kzdmqz4w60l5n";
const OUT = path.join(DIR, "shots");
fs.mkdirSync(OUT, { recursive: true });
const url = p => `https://hazeyse.nyehandel.se${p}${p.includes("?") ? "&" : "?"}preview=${PREVIEW}`;

const SHOTS = [
  ["control-m-s-vapes", "/sv/categories/m-s-vapes", "dedikerad serie x format (kontroll) -- innehåller en cart"],
  ["anomaly-m-s-buds", "/sv/categories/m-s-buds", "M.S Buds innehåller 2 hasch, saknar La Chupacabra"],
  ["filtered-ms-hasch", "/sv/categories/hasch?filters=Serie_Magic+Sauce", "Magic Sauce Hasch = filtrerad bred sida"],
  ["filtered-ms-carts", "/sv/categories/alla-cartridges?filters=Serie_Magic+Sauce", "Magic Sauce Carts = filtrerad Alla Carts"],
  ["control-thca-vapes", "/sv/categories/thca-vapes", "serie x format-mall (THCaB-kontroll)"],
  ["legacy-hero-vapes", "/sv/categories/hero-vapes", "tillverkarkategori med missvisande H1, äldre skal"],
  ["hub-core", "/sv/categories/core", "Core-hubb i extern preview (lokal Core-build ej pushad)"],
  ["legacy-thcv-hub", "/sv/categories/thcv", "seriehubb på äldre HZ8.seriesHub"],
  ["broad-alla-carts", "/sv/categories/alla-cartridges", "Alla Carts -- ej i bred familj (Task 05)"],
  ["hidden-prerolled", "/sv/categories/prerolled", "dold strukturkategori med 4 pre-rolls"]
];

const browser = await chromium.launch();
const results = [];
for (const [name, p, note] of SHOTS) {
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  let rec = { name, route: p, note };
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      await page.goto(url(p), { waitUntil: "load", timeout: 45000 });
      await page.waitForTimeout(3500);
      rec = Object.assign(rec, await page.evaluate(() => ({
        h1: (document.querySelector("h1") || {}).textContent?.trim() || null,
        h1Count: document.querySelectorAll("h1").length,
        shell: [...document.documentElement.classList].filter(c => /^hz8-(cat|sf|sh|portal|series)/.test(c)).join(" "),
        nav: (document.querySelector("[data-hz8-nav]") || {}).getAttribute?.("data-hz8-nav") || null,
        overflowX: document.documentElement.scrollWidth - innerWidth
      })), { attempt });
      await page.screenshot({ path: path.join(OUT, name + ".jpg"), type: "jpeg", quality: 72 });
      break;
    } catch (e) { rec.error = String(e.message || e); }
  }
  results.push(rec);
  console.log(JSON.stringify(rec));
  await ctx.close();
}
await browser.close();
fs.writeFileSync(path.join(OUT, "shots.json"), JSON.stringify(results, null, 1));
