// TASK 17 — mätbar bildinventering av Nyehandels produktbilder efter migreringen (ingen redesign).
// Per produkt: antal bilder, första bildens upplösning och bildformat, bakgrund (hörnens färg och
// spridning: vit / enhetlig / ojämn), produktens fyllnadsgrad (andel av ytan som skiljer sig från
// bakgrunden, bounding box) och om motivet går ut i kanten (risk för kapning vid beskärning).
// Bilderna hämtas i Node (originalet, image_url) och avkodas i en Playwright-sida (data-URL, ingen CORS).
// Kör: node image-audit.mjs  ->  runs/image-audit.json
import fs from "node:fs"; import path from "node:path";
import { chromium } from "playwright";
const DIR = path.dirname(new URL(import.meta.url).pathname);
const MX = JSON.parse(fs.readFileSync(path.join(DIR, "CURRENT-CATALOG-MATRIX.json"), "utf8")).rows;
const NH = JSON.parse(fs.readFileSync(path.join(DIR, "runs/nh.json"), "utf8")).products;
const sleep = ms => new Promise(r => setTimeout(r, ms));
const b = await chromium.launch(); const page = await (await b.newContext()).newPage();
await page.setContent("<canvas id=c></canvas>");
const out = [];
for (const r of MX) {
  const n = NH.find(x => x.slug === r.nhSlug);
  const imgs = (n.state && n.state.images) || [];
  const rec = { nhId: r.nhId, slug: r.nhSlug, name: r.nhName, format: r.format, series: r.series, kind: r.kind, visibilityClass: r.visibilityClass, count: imgs.length, wooCount: r.images.woo };
  if (imgs[0]) {
    try {
      const res = await fetch(imgs[0].url); const buf = Buffer.from(await res.arrayBuffer());
      rec.bytes = buf.length; rec.type = res.headers.get("content-type");
      rec.file = decodeURIComponent(imgs[0].url.split("/").pop());
      Object.assign(rec, await page.evaluate(async ({ src }) => {
        const img = new Image(); img.src = src; await img.decode();
        const W = img.naturalWidth, H = img.naturalHeight, s = Math.min(1, 400 / Math.max(W, H));
        const w = Math.max(1, Math.round(W * s)), h = Math.max(1, Math.round(H * s));
        const c = document.getElementById("c"); c.width = w; c.height = h; const x = c.getContext("2d"); x.drawImage(img, 0, 0, w, h);
        const d = x.getImageData(0, 0, w, h).data; const px = (i, j) => { const k = (j * w + i) * 4; return [d[k], d[k + 1], d[k + 2], d[k + 3]]; };
        const corners = [px(1, 1), px(w - 2, 1), px(1, h - 2), px(w - 2, h - 2)];
        const avg = [0, 1, 2].map(k => corners.reduce((a, c2) => a + c2[k], 0) / 4);
        const spread = Math.max(...[0, 1, 2].map(k => Math.max(...corners.map(c2 => c2[k])) - Math.min(...corners.map(c2 => c2[k]))));
        const alpha = corners.some(c2 => c2[3] < 250);
        const dist = (p) => p[3] < 30 ? 0 : Math.max(Math.abs(p[0] - avg[0]), Math.abs(p[1] - avg[1]), Math.abs(p[2] - avg[2]));
        let minX = w, minY = h, maxX = -1, maxY = -1, fg = 0, edge = 0;
        for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) { if (dist(px(i, j)) > 28) { fg++; if (i < minX) minX = i; if (j < minY) minY = j; if (i > maxX) maxX = i; if (j > maxY) maxY = j; if (i < 2 || j < 2 || i > w - 3 || j > h - 3) edge++; } }
        const bbox = maxX < 0 ? null : { x: +(minX / w).toFixed(3), y: +(minY / h).toFixed(3), w: +((maxX - minX + 1) / w).toFixed(3), h: +((maxY - minY + 1) / h).toFixed(3) };
        return { w: W, h: H, aspect: +(W / H).toFixed(3), bg: { rgb: avg.map(Math.round), spread, transparent: alpha, white: !alpha && avg.every(v => v > 240) && spread < 12 }, fill: +(fg / (w * h)).toFixed(3), bbox, bboxArea: bbox ? +(bbox.w * bbox.h).toFixed(3) : 0, edgeTouch: +(edge / (2 * (w + h))).toFixed(3) };
      }, { src: `data:${rec.type || "image/jpeg"};base64,${buf.toString("base64")}` }));
    } catch (e) { rec.error = String(e).slice(0, 120); }
    await sleep(150);
  }
  const f = [];
  if (!rec.count) f.push("saknar bild");
  if (rec.w && Math.max(rec.w, rec.h) < 800) f.push("lågupplöst (<800 px)");
  if (rec.aspect && (rec.aspect < 0.9 || rec.aspect > 1.1)) f.push(rec.aspect < 1 ? "stående bild (" + rec.aspect + ")" : "liggande bild (" + rec.aspect + ")");
  if (rec.bg && rec.bg.white) f.push("vit bakgrund");
  else if (rec.bg && !rec.bg.transparent && rec.bg.spread >= 40) f.push("ojämn bakgrund/miljöbild");
  if (rec.bboxArea && rec.bboxArea < 0.35) f.push("liten produkt i bild (" + Math.round(rec.bboxArea * 100) + " % av ytan)");
  if (rec.edgeTouch > 0.25) f.push("motiv går ut i kanten (kapas lätt)");
  if (rec.wooCount > 1 && rec.count < rec.wooCount) f.push(`färre bilder än WooCommerce (${rec.count}/${rec.wooCount})`);
  rec.flags = f;
  out.push(rec);
  process.stdout.write(`${rec.nhId} ${rec.slug} ${rec.w}x${rec.h} ${f.join("; ")}\n`);
}
await b.close();
fs.writeFileSync(path.join(DIR, "runs/image-audit.json"), JSON.stringify(out, null, 1));
const t = {}; out.forEach(r => r.flags.forEach(x => { const k = x.replace(/\s*\(.*\)/, ""); t[k] = (t[k] || 0) + 1; })); console.log(t);
