// Compare "Våra populära serier" + page top between before-b34f905 and after-local.
import fs from "node:fs"; import path from "node:path"; import { PNG } from "pngjs"; import pixelmatch from "pixelmatch";
const DIR = path.dirname(new URL(import.meta.url).pathname);
const A = JSON.parse(fs.readFileSync(path.join(DIR, "before-b34f905/report.json"))), B = JSON.parse(fs.readFileSync(path.join(DIR, "after-local/report.json")));
const out = {};
for (const k of Object.keys(A)) {
  const a = A[k], b = B[k]; const r = { htmlSame: a.series.html === b.series.html, cardsSame: JSON.stringify(a.series.cards) === JSON.stringify(b.series.cards), seriesRectSame: JSON.stringify(a.series.rect) === JSON.stringify(b.series.rect), topSame: JSON.stringify(a.topSig) === JSON.stringify(b.topSig) };
  const f = k.replace(/[@%]/g, "");
  for (const n of ["popular-series", "top"]) {
    const pa = PNG.sync.read(fs.readFileSync(path.join(DIR, "before-b34f905", `${n}-${f}.png`))), pb = PNG.sync.read(fs.readFileSync(path.join(DIR, "after-local", `${n}-${f}.png`)));
    if (pa.width !== pb.width || pa.height !== pb.height) { r[n] = `size ${pa.width}x${pa.height} vs ${pb.width}x${pb.height}`; continue; }
    const d = new PNG({ width: pa.width, height: pa.height }); const px = pixelmatch(pa.data, pb.data, d.data, pa.width, pa.height, { threshold: 0.1 });
    r[n] = `${px} px differ (${(100 * px / (pa.width * pa.height)).toFixed(3)} %)`;
    if (n === "popular-series") { const sbs = new PNG({ width: pa.width * 2 + 20, height: pa.height }); sbs.data.fill(255); PNG.bitblt(pa, sbs, 0, 0, pa.width, pa.height, 0, 0); PNG.bitblt(pb, sbs, 0, 0, pb.width, pb.height, pa.width + 20, 0); fs.mkdirSync(path.join(DIR, "compare"), { recursive: true }); fs.writeFileSync(path.join(DIR, "compare", `popular-series-before-vs-after-${f}.png`), PNG.sync.write(sbs)); }
  }
  out[k] = r; console.log(k, JSON.stringify(r));
}
fs.writeFileSync(path.join(DIR, "compare/report.json"), JSON.stringify(out, null, 1));
