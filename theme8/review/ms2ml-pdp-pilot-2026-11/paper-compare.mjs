// Närbild av "Vad är Magic Sauce 3.0?" (+ omgivning) vid 393/1440/1920 och mått.
// node paper-compare.mjs <prefix>
import { chromium, ctxFor, open, URL_ } from "../pdp-pilot-2026-10/lib.mjs";
import fs from "node:fs"; import path from "node:path";
const DIR = path.dirname(new URL(import.meta.url).pathname), OUT = path.join(DIR, "shots", "r6-papper"); fs.mkdirSync(OUT, { recursive: true });
const prefix = process.argv[2] || "efter"; const R = {};
const b = await chromium.launch({ channel: "chrome", headless: true });
for (const [w, h] of [[393, 852], [1440, 900], [1920, 1080]]) {
  const ctx = await ctxFor(b, w, h, { scale: w < 768 ? 2 : 1 });
  const p = await open(ctx, URL_("/sv/products/vape-magic-sauce-magic-farmers-2ml/454"));
  await p.waitForSelector(".hz8-pcx-sum__leaf", { timeout: 30000 }); await p.waitForTimeout(4500);
  const m = await p.evaluate(() => { const r = e => { const q = document.querySelector(e).getBoundingClientRect(); return [Math.round(q.top + scrollY), Math.round(q.bottom + scrollY)]; }; return { sum: r("#hz8-pcx-sum"), h2: r("#hz8-pcx-sum h2"), cues: r(".hz8-pcx-sum__cues"), cta: r(".hz8-pp__cta"), strains: r("#hz8-pcx-strains"), docW: document.documentElement.scrollWidth }; });
  m.height = m.sum[1] - m.sum[0]; R[w] = m;
  const top = m.sum[0] - (w < 768 ? 110 : 150), bot = m.sum[1] + 70;
  await p.setViewportSize({ width: w, height: Math.max(h, bot + 40) }); await p.waitForTimeout(700);
  await p.screenshot({ path: path.join(OUT, `${prefix}-${w}.jpg`), clip: { x: 0, y: top, width: w, height: bot - top }, type: "jpeg", quality: 88 });
  await ctx.close();
}
fs.writeFileSync(path.join(OUT, `${prefix}.json`), JSON.stringify(R, null, 1));
for (const w in R) console.log(w, "höjd", R[w].height, "Vad är", R[w].sum.join("–"), "faktarad", R[w].cues.join("–"), "Strains", R[w].strains[0], "sidbredd", R[w].docW);
await b.close();
