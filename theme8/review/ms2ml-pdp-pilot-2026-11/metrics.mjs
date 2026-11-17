// Mått för mobilens första del: var scen, köpknapp och "Vad är …?" börjar.
// node metrics.mjs <namn=builddir> ...   (builddir med hazey-theme8.css/.min.js)
import { chromium, ctxFor, open, URL_ } from "../pdp-pilot-2026-10/lib.mjs";
import path from "node:path";
const b = await chromium.launch({ channel: "chrome", headless: true });
const rows = [];
for (const arg of process.argv.slice(2)) {
  const [name, dir] = arg.split("=");
  for (const [w, h] of [[393, 852], [1440, 900]]) {
    const ctx = await ctxFor(b, w, h, { scale: 1, build: path.resolve(dir) });
    const p = await open(ctx, URL_("/sv/products/vape-magic-sauce-magic-farmers-2ml/454"));
    await p.waitForSelector(".hz8-pp__cta", { timeout: 30000 }); await p.waitForTimeout(4500);
    const m = await p.evaluate(() => {
      const y = s => { const e = document.querySelector(s); if (!e) return null; const r = e.getBoundingClientRect(); return [Math.round(r.top + scrollY), Math.round(r.bottom + scrollY)]; };
      return { scen: y(".product-detail__media"), h1: y(".product-detail__information h1"), paket: y(".hz8-pp__choice"), strain: y(".hz8-pp__strains"), pris: y(".hz8-pp__price"), knapp: y(".hz8-pp__cta"), trygg: y(".hz8-pp__trust"), vadAr: y("#hz8-pcx-sum"), strainsH: y("#hz8-pcx-strains"), cues: y(".hz8-pcx-sum__cues"), sw: document.documentElement.scrollWidth };
    });
    rows.push({ name, w, ...m });
    await ctx.close();
  }
}
console.log("| läge | bredd | scen | köpknapp börjar | Vad är … börjar–slutar (höjd) | faktarad | Strains börjar | sidbredd |");
console.log("|---|---|---|---|---|---|---|---|");
for (const r of rows) console.log(`| ${r.name} | ${r.w} | ${r.scen.join("–")} | ${r.knapp[0]} | ${r.vadAr.join("–")} (**${r.vadAr[1] - r.vadAr[0]}**) | ${r.cues.join("–")} | ${r.strainsH[0]} | ${r.sw} |`);
await b.close();
