// TASK 17C — matcha frilagda original (Canva-exporter / lokala PNG) mot exakt produktbild, utan gissning.
// För varje PNG:
//   1. Alfa: filen har en alfakanal, kantringen är genomskinlig, produkten rör inte dukens kant (ej kapad).
//   2. Match: PNG:ns produkt (alfa >= 16) jämförs mot VARJE katalogbild (product/state, 198 st): båda beskärs
//      till sin produkts bbox och skalas till 96x96; PNG:n läggs över katalogbildens kantton och medelfelet
//      (RGB, 0-255) mäts där PNG:n täcker. Bästa träff godtas bara om felet är lågt OCH klart lägre än
//      näst bästa produkt (annan produkt). Annars: "ingen säker matchning".
//   3. Täckning: andel av katalogbildens produktpixlar (avvikelse > 30 resp. > 14 från kanttonen = även
//      mjuka skuggor) som PNG:ns alfa täcker -- låg täckning = kapade delar eller bortplockad skugga.
//      Godkänt kräver >= 99 % med 2 px registreringstolerans (t30d); kantzonen syns i diagnosbilden.
// Kör: node cutout-match.mjs <png...>  ->  runs/cutout-match.json (skrivs över per körning)
import fs from "node:fs"; import path from "node:path"; import { chromium } from "playwright";
const DIR = path.dirname(new URL(import.meta.url).pathname);
const NH = JSON.parse(fs.readFileSync(path.join(DIR, "../catalog-reconciliation-2026-11/runs/nh.json"), "utf8")).products;
const files = process.argv.slice(2).map(f => path.resolve(f));
const cat = []; for (const n of NH) for (const im of (n.state && n.state.images) || []) cat.push({ slug: n.slug, name: n.state.name, nhId: n.id, imageId: im.id, url: im.thumb || im.url, full: im.url });
const b = await chromium.launch(); const p = await (await b.newContext()).newPage();
await p.goto("https://hazeyse.nyehandel.se/robots.txt");
// Katalogbildernas signaturer (en gång).
await p.evaluate(() => {
  const S = 96;
  window.load = src => new Promise((res, rej) => { const i = new Image(); i.crossOrigin = "anonymous"; i.onload = () => res(i); i.onerror = rej; i.src = src; });
  window.px = (img, w, h, sx = 0, sy = 0, sw = img.naturalWidth, sh = img.naturalHeight) => { const c = document.createElement("canvas"); c.width = w; c.height = h; const x = c.getContext("2d", { willReadFrequently: true }); x.drawImage(img, sx, sy, sw, sh, 0, 0, w, h); return x.getImageData(0, 0, w, h).data; };
  // Kantton + produktens bbox (samma mått som bildmanifestet).
  window.fg = (img) => {
    const N = 128, d = px(img, N, N); const ring = [];
    for (let j = 0; j < N; j++) for (let i = 0; i < N; i++) { if (i > 1 && j > 1 && i < N - 2 && j < N - 2) continue; const k = (j * N + i) * 4; ring.push([d[k], d[k + 1], d[k + 2]]); }
    const mean = [0, 1, 2].map(c => ring.reduce((a, q) => a + q[c], 0) / ring.length);
    let x0 = N, y0 = N, x1 = -1, y1 = -1;
    for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) { const k = (y * N + x) * 4; if (Math.max(...[0, 1, 2].map(c => Math.abs(d[k + c] - mean[c]))) > 30) { x0 = Math.min(x0, x); x1 = Math.max(x1, x); y0 = Math.min(y0, y); y1 = Math.max(y1, y); } }
    const W = img.naturalWidth / N, H = img.naturalHeight / N;
    return { mean, box: x1 < 0 ? null : [x0 * W, y0 * H, (x1 - x0 + 1) * W, (y1 - y0 + 1) * H] };
  };
  window.sig = async (src) => { const img = await load(src); const f = fg(img); if (!f.box) return null; return { mean: f.mean, aspect: f.box[2] / f.box[3], d: Array.from(px(img, S, S, ...f.box)) }; };
  window.SIGS = [];
});
for (const c of cat) { const s = await p.evaluate(async u => { try { const s = await sig(u); if (s) SIGS.push({ u, ...s }); return !!s; } catch (e) { return false; } }, c.url); c.ok = s; }
console.log("katalogbilder med signatur:", cat.filter(c => c.ok).length, "/", cat.length);
const out = [];
for (const f of files) {
  const data = "data:image/png;base64," + fs.readFileSync(f).toString("base64");
  const r = await p.evaluate(async (data) => {
    const S = 96, img = await load(data), N = 256;
    const a = px(img, N, N); let clear = 0, ring = 0, touch = 0, x0 = N, y0 = N, x1 = -1, y1 = -1, anyAlpha = false;
    for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) {
      const al = a[(y * N + x) * 4 + 3]; if (al < 250) anyAlpha = true;
      const edge = x < 2 || y < 2 || x >= N - 2 || y >= N - 2; if (edge) { ring++; if (al < 16) clear++; else if (x === 0 || y === 0 || x === N - 1 || y === N - 1) touch++; }
      if (al >= 16) { x0 = Math.min(x0, x); x1 = Math.max(x1, x); y0 = Math.min(y0, y); y1 = Math.max(y1, y); }
    }
    const W = img.naturalWidth / N, H = img.naturalHeight / N, box = [x0 * W, y0 * H, (x1 - x0 + 1) * W, (y1 - y0 + 1) * H];
    const d = px(img, S, S, ...box), aspect = box[2] / box[3];
    const scores = SIGS.map(s => {
      if (Math.abs(Math.log(aspect / s.aspect)) > 0.25) return { u: s.u, err: 999 };
      let e = 0, n = 0;
      for (let k = 0; k < d.length; k += 4) { const al = d[k + 3] / 255; if (al < 0.6) continue; for (let c = 0; c < 3; c++) e += Math.abs(d[k + c] * al + s.mean[c] * (1 - al) - s.d[k + c]); n += 3; }
      return { u: s.u, err: n ? e / n : 999 };
    }).sort((x, y) => x.err - y.err);
    return { w: img.naturalWidth, h: img.naturalHeight, anyAlpha, ringClear: clear / ring, touchesEdge: touch, box, scores: scores.slice(0, 12) };
  }, data);
  const name = u => cat.find(c => c.url === u) || {};
  const best = r.scores[0], bm = name(best.u);
  // Samma foto kan ligga på flera produkter (t.ex. en enkelprodukt och dess paket): de räknas som samma
  // bild (fel inom 1 enhet) och listas, och avståndet mäts mot närmaste ANDRA foto.
  const samePhoto = r.scores.filter(s => s.err <= best.err + 1).map(s => ({ slug: name(s.u).slug, imageId: name(s.u).imageId }));
  const other = r.scores.find(s => s.err > best.err + 1 && name(s.u).slug !== bm.slug);
  const sameProductImages = r.scores.filter(s => name(s.u).slug === bm.slug && s.err < best.err + 6).map(s => name(s.u).imageId);
  const ratio = other ? other.err / best.err : 99;
  const match = best.err < 14 && ratio > 1.6;
  // Täckning mot katalogbilden: läggs PNG:n i katalogbildens produkt-bbox, hur mycket av katalogens produkt täcks?
  let coverage = null;
  if (match) coverage = await p.evaluate(async ([data, u]) => {
    const S = 160, img = await load(data), cimg = await load(u), f = fg(cimg);
    const N = 256, a = px(img, N, N); let x0 = N, y0 = N, x1 = -1, y1 = -1;
    for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) if (a[(y * N + x) * 4 + 3] >= 16) { x0 = Math.min(x0, x); x1 = Math.max(x1, x); y0 = Math.min(y0, y); y1 = Math.max(y1, y); }
    const W = img.naturalWidth / N, H = img.naturalHeight / N;
    const pa = px(img, S, S, x0 * W, y0 * H, (x1 - x0 + 1) * W, (y1 - y0 + 1) * H), cb = px(cimg, S, S, ...f.box);
    // d = samma mått med alfamasken utvidgad 2 px (av 160): tål kantutjämning och 1-2 px registrering
    // mellan två omskalade bilder, men inte saknade delar (de är större än kantzonen).
    const R = 2, dil = new Uint8Array(S * S);
    for (let y = 0; y < S; y++) for (let x = 0; x < S; x++) { if (pa[(y * S + x) * 4 + 3] < 64) continue; for (let dy = -R; dy <= R; dy++) for (let dx = -R; dx <= R; dx++) { const yy = y + dy, xx = x + dx; if (yy >= 0 && xx >= 0 && yy < S && xx < S) dil[yy * S + xx] = 1; } }
    const res = {}; for (const T of [30, 14]) { let fgN = 0, cov = 0, covD = 0; for (let k = 0; k < cb.length; k += 4) { const dv = Math.max(...[0, 1, 2].map(c => Math.abs(cb[k + c] - f.mean[c]))); if (dv > T) { fgN++; if (pa[k + 3] >= 64) cov++; if (dil[k / 4]) covD++; } } res["t" + T] = +(cov / fgN).toFixed(3); res["t" + T + "d"] = +(covD / fgN).toFixed(4); }
    return res;
  }, [data, best.u]);
  const alphaOk = r.anyAlpha && r.ringClear >= 0.95 && r.touchesEdge === 0;
  const rec = { file: path.relative(process.cwd(), f), size: [r.w, r.h], alpha: { has: r.anyAlpha, ringClear: +r.ringClear.toFixed(3), touchesEdge: r.touchesEdge, ok: alphaOk },
    best: { slug: bm.slug, name: bm.name, nhId: bm.nhId, imageId: bm.imageId, err: +best.err.toFixed(2) }, sameProductImages, samePhoto, nextOther: other && { slug: name(other.u).slug, err: +other.err.toFixed(2) }, ratio: +ratio.toFixed(2), match, coverage,
    verdict: !alphaOk ? "alfa ej godkänd" : !match ? "ingen säker matchning" : coverage && coverage.t30d < 0.99 ? "matchad men täcker inte hela produkten" : "godkänd kandidat" };
  out.push(rec);
  console.log(`${path.basename(f)}: ${rec.verdict} | alfa ${alphaOk} (kant ${rec.alpha.ringClear}, rör kant ${r.touchesEdge}) | bäst ${bm.slug} #${bm.imageId} fel ${rec.best.err} | näst ${rec.nextOther && rec.nextOther.slug} ${rec.nextOther && rec.nextOther.err} (x${rec.ratio}) | täckning ${JSON.stringify(coverage)}`);
}
fs.writeFileSync(path.join(DIR, "runs/cutout-match.json"), JSON.stringify(out, null, 1));
await b.close();
