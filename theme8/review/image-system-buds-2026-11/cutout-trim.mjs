// TASK 17C — beskär ENDAST helt transparent ytterluft från ett frilagt original (förlustfritt, pngjs).
// Kvar blir den minsta rektangel som innehåller varje pixel med alfa > 0 -- även de svagaste
// skuggpixlarna och kantutjämningen räknas som produkt. Kontroller efteråt (avbryter vid fel):
//   1. varje bortskuren pixel har alfa == 0 i originalet;
//   2. varje kvarvarande pixel är byte-identisk (RGBA) med samma pixel i originalet.
// Originalet lämnas orört; resultatet skrivs bredvid som <namn>-trim.png.
// Kör: node cutout-trim.mjs <png>
import fs from "node:fs"; import path from "node:path"; import { PNG } from "pngjs";
const f = path.resolve(process.argv[2]);
const src = PNG.sync.read(fs.readFileSync(f)); const { width: W, height: H, data: d } = src;
let x0 = W, y0 = H, x1 = -1, y1 = -1;
for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) if (d[(y * W + x) * 4 + 3] > 0) { if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; }
if (x1 < 0) throw new Error("helt transparent bild");
const w = x1 - x0 + 1, h = y1 - y0 + 1, out = new PNG({ width: w, height: h });
for (let y = 0; y < h; y++) d.copy(out.data, y * w * 4, ((y + y0) * W + x0) * 4, ((y + y0) * W + x0 + w) * 4);
// 1. bortskuret = helt transparent
let cutOpaque = 0;
for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) if ((x < x0 || x > x1 || y < y0 || y > y1) && d[(y * W + x) * 4 + 3] !== 0) cutOpaque++;
// 2. kvar = byte-identiskt
let changed = 0;
for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) for (let c = 0; c < 4; c++) if (out.data[(y * w + x) * 4 + c] !== d[((y + y0) * W + x + x0) * 4 + c]) changed++;
if (cutOpaque || changed) throw new Error(`avbryter: ${cutOpaque} bortskurna pixlar hade alfa > 0, ${changed} ändrade värden`);
const dst = f.replace(/\.png$/i, "-trim.png");
fs.writeFileSync(dst, PNG.sync.write(out));
const r = { source: path.basename(f), out: path.basename(dst), from: [W, H], to: [w, h], removed: { left: x0, top: y0, right: W - 1 - x1, bottom: H - 1 - y1 }, cutPixelsWithAlpha: cutOpaque, changedValues: changed };
console.log(JSON.stringify(r));
fs.writeFileSync(dst.replace(/\.png$/, ".json"), JSON.stringify(r, null, 1));
