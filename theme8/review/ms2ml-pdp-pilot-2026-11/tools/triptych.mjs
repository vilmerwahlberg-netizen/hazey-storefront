// node triptych.mjs <ut.jpg> <kolumnbredd> <etikett|fil|x,y,w,h eller full> ...
import { chromium } from "playwright"; import fs from "node:fs";
const [out, colW, ...cols] = process.argv.slice(2);
const items = cols.map(c => { const [label, file, crop] = c.split("|"); return { label, src: "data:image/" + (file.endsWith(".png") ? "png" : "jpeg") + ";base64," + fs.readFileSync(file).toString("base64"), crop: crop && crop !== "full" ? crop.split(",").map(Number) : null }; });
const b = await chromium.launch({ channel: "chrome", headless: true }); const p = await b.newPage();
const url = await p.evaluate(async ([items, W]) => {
  const load = s => new Promise(r => { const i = new Image(); i.onload = () => r(i); i.src = s; });
  const imgs = await Promise.all(items.map(i => load(i.src)));
  const dims = imgs.map((im, k) => { const c = items[k].crop || [0, 0, im.naturalWidth, im.naturalHeight]; return { c, h: c[3] * W / c[2] }; });
  const H = Math.max(...dims.map(d => d.h)), G = 20;
  const cv = document.createElement("canvas"); cv.width = (W + G) * imgs.length - G; cv.height = Math.min(H + 40, 32000); const g = cv.getContext("2d");
  g.fillStyle = "#1d1d1b"; g.fillRect(0, 0, cv.width, cv.height); g.imageSmoothingQuality = "high";
  imgs.forEach((im, k) => { const d = dims[k]; g.drawImage(im, d.c[0], d.c[1], d.c[2], d.c[3], k * (W + G), 40, W, d.h); g.fillStyle = "#fff"; g.font = "600 18px Helvetica"; g.fillText(items[k].label, k * (W + G) + 8, 26); });
  return cv.toDataURL("image/jpeg", .82);
}, [items, +colW]);
fs.writeFileSync(out, Buffer.from(url.split(",")[1], "base64")); await b.close();
