// Gör sidans WebP-varianter av det levererade fotografiska bladassetet
// (tropical-leaf-corner-cutout-v1.png): vänster + spegelvänd höger i två
// bredder, och en separat mycket svag varm kastskugga ur alfakanalen,
// förskjuten ned/höger (ljus uppe till vänster) för båda varianterna.
import { chromium } from "playwright"; import fs from "node:fs"; import path from "node:path";
const [inp, out] = process.argv.slice(2);
const b = await chromium.launch({ channel: "chrome", headless: true }); const p = await b.newPage();
const res = await p.evaluate(async d => {
  const im = new Image(); im.src = d; await im.decode();
  const W = im.naturalWidth, H = im.naturalHeight, out = {};
  const draw = (w, mirror, shadow) => {
    const s = w / W, c = document.createElement("canvas"); c.width = w; c.height = Math.round(H * s); const g = c.getContext("2d");
    g.imageSmoothingQuality = "high";
    if (shadow) {
      // silhuett -> varm brun, oskarp, förskjuten ned/höger i skärmriktning
      const t = document.createElement("canvas"); t.width = c.width; t.height = c.height; const q = t.getContext("2d");
      if (mirror) { q.translate(c.width, 0); q.scale(-1, 1); }
      q.drawImage(im, 0, 0, c.width, c.height);
      q.setTransform(1, 0, 0, 1, 0, 0); q.globalCompositeOperation = "source-in"; q.fillStyle = "rgb(98,62,26)"; q.fillRect(0, 0, c.width, c.height);
      g.filter = `blur(${Math.round(14 * s * 1.6)}px)`; g.drawImage(t, 28 * s * 1.6, 36 * s * 1.6);
    } else {
      if (mirror) { g.translate(c.width, 0); g.scale(-1, 1); }
      g.drawImage(im, 0, 0, c.width, c.height);
    }
    return c.toDataURL("image/webp", shadow ? .8 : .86);
  };
  for (const [side, m] of [["l", false], ["r", true]]) {
    out[`leaf-${side}-1200`] = draw(1200, m, false);
    out[`leaf-${side}-600`] = draw(600, m, false);
    out[`leaf-shadow-${side}-600`] = draw(600, m, true);
  }
  return out;
}, "data:image/png;base64," + fs.readFileSync(inp).toString("base64"));
for (const [k, v] of Object.entries(res)) fs.writeFileSync(path.join(out, `ms2ml-tropical-${k}.webp`), Buffer.from(v.split(",")[1], "base64"));
await b.close(); console.log(Object.keys(res).join(" "));
