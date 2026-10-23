// Förstorade utsnitt: node crop.mjs out.png scale "etikett=fil@x,y,w,h" ...
import { chromium } from "playwright"; import fs from "node:fs";
const [out, scale, ...items] = process.argv.slice(2); const k = Number(scale);
const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1600, height: 300 } });
const html = items.map(it => { const [l, rest] = it.split("="); const [f, box] = rest.split("@"); const [x, y, w, h] = box.split(",").map(Number);
  return `<figure style="margin:0 0 10px"><figcaption style="font:bold 14px Arial;color:#fff;padding:3px 0">${l}</figcaption><div style="width:${w * k}px;height:${h * k}px;overflow:hidden;outline:1px solid #777"><img src="data:image/png;base64,${fs.readFileSync(f).toString("base64")}" style="transform-origin:0 0;transform:scale(${k}) translate(${-x}px,${-y}px);image-rendering:pixelated;display:block"></div></figure>`; }).join("");
await p.setContent(`<body style="margin:0;padding:10px;background:#222">${html}</body>`); await p.waitForTimeout(200);
await p.screenshot({ path: out, fullPage: true }); await b.close();
