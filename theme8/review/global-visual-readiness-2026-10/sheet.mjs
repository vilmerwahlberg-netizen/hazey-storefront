// Kontaktark av en ramkatalog: node sheet.mjs <ramkatalog> <ut.png> [max=16] [från-ms] [till-ms]
import { chromium } from "playwright"; import fs from "node:fs"; import path from "node:path";
const [dir, out, max = "16", from = "0", to = "999999"] = process.argv.slice(2);
const all = fs.readdirSync(dir).filter(f => /\.(jpg|png)$/.test(f)).sort().filter(f => { const t = parseInt(f); return t >= +from && t <= +to; });
const n = Math.min(+max, all.length); const pick = [...new Set(Array.from({ length: n }, (_, i) => all[Math.round(i * (all.length - 1) / Math.max(1, n - 1))]))];
const labels = fs.existsSync(path.join(dir, "labels.json")) ? JSON.parse(fs.readFileSync(path.join(dir, "labels.json"))) : {};
const col = { READY: "#4d7042", NATIVE: "#c0392b", MASK: "#8a7a5a", BLANK: "#555", SIDEBAR: "#c0392b", PARTIAL: "#b8865a" };
const html = `<html><body style="margin:0;background:#222;font:13px Arial;color:#fff;display:flex;flex-wrap:wrap;gap:8px;padding:8px">${pick.map(f => { const l = labels[f] || ""; const st = l.split(" ")[0];
  return `<figure style="margin:0;width:300px"><img src="data:image/${f.endsWith("png") ? "png" : "jpeg"};base64,${fs.readFileSync(path.join(dir, f)).toString("base64")}" style="width:100%;display:block;outline:1px solid #555"><figcaption style="padding:3px 0">${parseInt(f)} ms ${l ? `<b style="background:${col[st] || "#333"};padding:1px 5px">${l}</b>` : ""}</figcaption></figure>`; }).join("")}</body></html>`;
const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1600, height: 400 } });
await p.setContent(html); await p.waitForTimeout(200); await p.screenshot({ path: out, fullPage: true }); await b.close();
console.log(out, pick.length);
