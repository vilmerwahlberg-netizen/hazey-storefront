// TASK 17B — sätter ihop före/efter-par (eller valfria bilder) till ett jämförelseblad (JPEG).
// Kör: node pair.mjs <ut.jpg> "<rubrik>" <etikett>=<bild> ...   (bilder relativt mappen)
import fs from "node:fs"; import path from "node:path"; import { chromium } from "playwright";
const DIR = path.dirname(new URL(import.meta.url).pathname);
const [out, title, ...items] = process.argv.slice(2);
const cells = items.map(a => { const i = a.lastIndexOf("="); return { label: a.slice(0, i), f: path.join(DIR, a.slice(i + 1)) }; }).filter(c => fs.existsSync(c.f));
const b = await chromium.launch(); const p = await (await b.newContext({ viewport: { width: 1800, height: 1000 } })).newPage();
await p.setContent(`<html><body style="margin:0;background:#1d1d1b;color:#eee;font:14px system-ui"><h1 style="font-size:18px;margin:14px 16px">${title}</h1><div style="display:grid;grid-template-columns:repeat(${Math.min(cells.length, 4)},1fr);gap:12px;padding:0 16px 16px;align-items:start">` +
  cells.map(c => `<figure style="margin:0"><figcaption style="padding:4px 0">${c.label}</figcaption><img style="width:100%;display:block;border:1px solid #444" src="data:image/png;base64,${fs.readFileSync(c.f).toString("base64")}"></figure>`).join("") + "</div></body></html>", { waitUntil: "load" });
fs.mkdirSync(path.dirname(path.join(DIR, out)), { recursive: true });
await p.screenshot({ path: path.join(DIR, out), fullPage: true, type: "jpeg", quality: 78 }); await b.close(); console.log("wrote", out);
