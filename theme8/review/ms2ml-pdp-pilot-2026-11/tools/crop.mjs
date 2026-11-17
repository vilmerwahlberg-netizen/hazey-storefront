// node crop.mjs <in> <out> x y w h [scale]  -- beskär (och skalar) en bild via canvas.
import { chromium } from "playwright"; import fs from "node:fs"; import path from "node:path";
const [inp, out, x, y, w, h, sc = "1"] = process.argv.slice(2);
const b = await chromium.launch({ channel: "chrome", headless: true }); const p = await b.newPage();
const data = "data:image/" + (inp.endsWith(".png") ? "png" : "jpeg") + ";base64," + fs.readFileSync(inp).toString("base64");
const url = await p.evaluate(async ([d, x, y, w, h, s]) => {
  const im = new Image(); im.src = d; await im.decode();
  const W = w === "full" ? im.naturalWidth - x : +w, H = h === "full" ? im.naturalHeight - y : +h;
  const c = document.createElement("canvas"); c.width = Math.round(W * s); c.height = Math.round(H * s);
  const g = c.getContext("2d"); g.imageSmoothingQuality = "high"; g.drawImage(im, x, y, W, H, 0, 0, c.width, c.height);
  return c.toDataURL("image/jpeg", .88);
}, [data, +x, +y, w, h, +sc]);
fs.writeFileSync(out, Buffer.from(url.split(",")[1], "base64")); await b.close();
