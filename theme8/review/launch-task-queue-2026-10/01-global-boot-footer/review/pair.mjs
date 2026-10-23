// Sätter ihop före/efter-par sida vid sida med etikett.
import { chromium } from "playwright"; import fs from "node:fs";
const [out, ...pairs] = process.argv.slice(2); // label=path
const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1800, height: 400 } });
const items = pairs.map(x => { const [l, f] = x.split("="); return `<figure style="margin:0"><figcaption style="padding:4px 0;font:bold 14px Arial;color:#fff">${l}</figcaption><img src="data:image/png;base64,${fs.readFileSync(f).toString("base64")}" style="max-width:${Math.floor(1760 / pairs.length)}px;display:block;outline:1px solid #666"></figure>`; }).join("");
await p.setContent(`<body style="margin:0;padding:10px;background:#222;display:flex;gap:12px;align-items:flex-start">${items}</body>`);
await p.waitForTimeout(200); await p.screenshot({ path: out, fullPage: true }); await b.close();
