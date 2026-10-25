// Sida vid sida: node sbs.mjs <before.png> <after.png> <out.png>
import { PNG } from "pngjs"; import fs from "node:fs";
const [a, b, out] = process.argv.slice(2).map((f, i) => i < 2 ? PNG.sync.read(fs.readFileSync(f)) : f);
const gap = 24, W = a.width + b.width + gap, H = Math.max(a.height, b.height), o = new PNG({ width: W, height: H });
o.data.fill(255);
for (const [img, x0] of [[a, 0], [b, a.width + gap]]) for (let y = 0; y < img.height; y++) img.data.copy(o.data, (y * W + x0) * 4, y * img.width * 4, (y + 1) * img.width * 4);
fs.writeFileSync(out, PNG.sync.write(o));
