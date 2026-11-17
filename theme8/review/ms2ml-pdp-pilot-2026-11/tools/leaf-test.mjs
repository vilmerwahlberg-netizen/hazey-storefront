// Komponerar ett alfa-asset på sidans beige och rapporterar alfastatistik.
// node leaf-test.mjs <in.png> <ut.jpg> [bg]
import { chromium } from "playwright"; import fs from "node:fs";
const [inp, out, bg = "#f5e3ca"] = process.argv.slice(2);
const b = await chromium.launch({ channel: "chrome", headless: true }); const p = await b.newPage();
const r = await p.evaluate(async ([d, bg]) => {
  const im = new Image(); im.src = d; await im.decode();
  const c = document.createElement("canvas"); c.width = im.naturalWidth; c.height = im.naturalHeight; const g = c.getContext("2d");
  g.drawImage(im, 0, 0); const px = g.getImageData(0, 0, c.width, c.height).data;
  let semi = 0, opaque = 0, clear = 0, semiYellow = 0;
  for (let i = 0; i < px.length; i += 4) { const a = px[i + 3]; if (a === 0) clear++; else if (a > 250) opaque++; else { semi++; if (px[i] > 150 && px[i + 1] > 130 && px[i + 2] < 90) semiYellow++; } }
  g.globalCompositeOperation = "destination-over"; g.fillStyle = bg; g.fillRect(0, 0, c.width, c.height);
  return { url: c.toDataURL("image/jpeg", .85), clear, opaque, semi, semiYellow, total: px.length / 4 };
}, ["data:image/png;base64," + fs.readFileSync(inp).toString("base64"), bg]);
fs.writeFileSync(out, Buffer.from(r.url.split(",")[1], "base64")); delete r.url; console.log(JSON.stringify(r)); await b.close();
