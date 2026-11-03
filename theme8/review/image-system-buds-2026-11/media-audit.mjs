// TASK 17B — alla 140 produkters bilder genom SAMMA klassificerare som Theme 8 (03a-product-media.js, laddas
// ur arbetskopian och körs i en tom sida). Ger: bildtyp per bild, tonzon, antal riktiga bilder och vilka
// produkter som saknar säker friläggning (allt som inte är transparent) eller sekundära bilder.
// Källa: ../catalog-reconciliation-2026-11/runs/nh.json (product/state-bilderna) + matrisens synlighetsklass.
// Kör: node media-audit.mjs  ->  runs/media-audit.json
import fs from "node:fs"; import path from "node:path"; import { chromium } from "playwright";
const DIR = path.dirname(new URL(import.meta.url).pathname);
const NH = JSON.parse(fs.readFileSync(path.join(DIR, "../catalog-reconciliation-2026-11/runs/nh.json"), "utf8")).products;
const MX = JSON.parse(fs.readFileSync(path.join(DIR, "../catalog-reconciliation-2026-11/CURRENT-CATALOG-MATRIX.json"), "utf8")).rows;
const SRC = fs.readFileSync(path.join(DIR, "../../js/03a-product-media.js"), "utf8");
const b = await chromium.launch(); const p = await (await b.newContext()).newPage();
await p.goto("https://hazeyse.nyehandel.se/robots.txt");
await p.evaluate(src => { window.HZ8 = { register() {}, watch() {} }; new Function(src)(); }, SRC);
const out = [];
for (const n of NH) {
  const row = MX.find(r => r.nhSlug === n.slug) || {};
  const imgs = (n.state && n.state.images) || [];
  const res = [];
  for (const im of imgs) res.push({ id: im.id, url: im.thumb || im.url, ...(await p.evaluate(u => window.HZ8.productMedia.classify(u), im.thumb || im.url)) });
  const variantImages = new Set(((n.state && n.state.variants) || []).map(v => v.imageId).filter(Boolean));
  out.push({ nhId: n.id, slug: n.slug, name: n.state && n.state.name, visibilityClass: row.visibilityClass, format: row.format, series: row.series, images: res.length, primary: res[0] || null, kinds: res.map(r => r.kind), variantImages: variantImages.size,
    secondary: Math.max(0, res.length - Math.max(1, variantImages.size)) });
  process.stdout.write(`${n.id} ${n.slug} ${res.map(r => r.kind).join(",")}\n`);
}
await b.close();
fs.writeFileSync(path.join(DIR, "runs/media-audit.json"), JSON.stringify(out, null, 1));
const t = {}; out.forEach(o => { const k = o.primary ? o.primary.kind : "saknar bild"; t[k] = (t[k] || 0) + 1; }); console.log(t);
