// Kontaktark: node sheet.mjs out.png file[@skala][#maxhöjd] ... (sida vid sida, toppjusterat)
import { PNG } from "pngjs"; import fs from "node:fs";
const [out, ...specs] = process.argv.slice(2);
const imgs = specs.map(spec => {
  const m = spec.match(/^(.*?)(?:@([\d.]+))?(?:#(\d+))?$/);
  const im = PNG.sync.read(fs.readFileSync(m[1])); const sc = m[2] ? parseFloat(m[2]) : 1; const maxH = m[3] ? +m[3] : Infinity;
  const w = Math.round(im.width * sc), h = Math.min(Math.round(im.height * sc), maxH);
  const o = new PNG({ width: w, height: h });
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) { const sx = Math.min(im.width - 1, Math.floor(x / sc)), sy = Math.min(im.height - 1, Math.floor(y / sc)); im.data.copy(o.data, (y * w + x) * 4, (sy * im.width + sx) * 4, (sy * im.width + sx) * 4 + 4); }
  return o;
});
const gap = 24, W = imgs.reduce((a, i) => a + i.width, 0) + gap * (imgs.length - 1), Hh = Math.max(...imgs.map(i => i.height));
const o = new PNG({ width: W, height: Hh }); o.data.fill(255);
let x0 = 0; for (const im of imgs) { for (let y = 0; y < im.height; y++) im.data.copy(o.data, (y * W + x0) * 4, y * im.width * 4, (y + 1) * im.width * 4); x0 += im.width + gap; }
fs.writeFileSync(out, PNG.sync.write(o));
