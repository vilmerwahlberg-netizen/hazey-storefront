// Pixeljämförelse före/efter mobilkorrigeringen för vyer som inte ska ändras (desktop).
// node pixeldiff.mjs före.webp efter.png
import { chromium } from "playwright"; import fs from "node:fs";
const [a, b] = process.argv.slice(2);
const uri = f => `data:image/${f.endsWith(".webp") ? "webp" : "png"};base64,` + fs.readFileSync(f).toString("base64");
const br = await chromium.launch({ channel: "chrome" }); const p = await br.newPage();
const r = await p.evaluate(async ([A, B]) => {
  const load = async s => { const i = new Image(); i.src = s; await i.decode(); const c = document.createElement("canvas"); c.width = i.width; c.height = i.height; const g = c.getContext("2d"); g.drawImage(i, 0, 0); return { w: i.width, h: i.height, d: g.getImageData(0, 0, i.width, i.height).data }; };
  const x = await load(A), y = await load(B); if (x.w !== y.w || x.h !== y.h) return { size: [x.w, x.h, y.w, y.h] };
  let n = 0; for (let k = 0; k < x.d.length; k += 4) if (Math.abs(x.d[k] - y.d[k]) + Math.abs(x.d[k + 1] - y.d[k + 1]) + Math.abs(x.d[k + 2] - y.d[k + 2]) > 30) n++;
  return { w: x.w, h: x.h, changedPct: +(100 * n / (x.w * x.h)).toFixed(3) };
}, [uri(a), uri(b)]);
console.log(JSON.stringify(r)); await br.close();
