// Före/efter-ramark: två rader (före överst, efter under), ramarna vid
// samma tidpunkter efter navigationsstart plus varje tillståndsbyte.
// node pair-sheet.mjs <före-ramkatalog> <efter-ramkatalog> <ut.png> <titel> [n=8] [till-ms]
import { chromium } from "playwright"; import fs from "node:fs"; import path from "node:path";
const [A, B, out, title = "", n = "8", until = "8000"] = process.argv.slice(2);
const col = { READY: "#4d7042", NATIVE: "#c0392b", MASK: "#8a7a5a", BLANK: "#555", SIDEBAR: "#c0392b", PARTIAL: "#b8865a" };
function pick(dir) {
  const L = JSON.parse(fs.readFileSync(path.join(dir, "labels.json"))); const fsx = Object.keys(L).sort().filter(f => parseInt(f) <= +until);
  const keep = new Set([fsx[0], fsx.at(-1)]);
  fsx.forEach((f, i) => { if (i && L[fsx[i - 1]] !== L[f]) { keep.add(fsx[i - 1]); keep.add(f); } });
  const painted = fsx.filter(f => L[f] !== "MASK" && L[f] !== "BLANK"); [0.15, 0.4, 0.7].forEach(x => painted.length && keep.add(painted[Math.floor(painted.length * x)]));
  let k = [...keep].sort(); while (k.length > +n) { // ta bort ram med minst informationsvärde (samma etikett som grannarna)
    const i = k.findIndex((f, j) => j > 0 && j < k.length - 1 && L[k[j - 1]] === L[f] && L[k[j + 1]] === L[f]); k.splice(i > 0 ? i : 1, 1); }
  return k.map(f => ({ f, l: L[f], src: `data:image/jpeg;base64,${fs.readFileSync(path.join(dir, f)).toString("base64")}` }));
}
const row = (label, frames) => `<div style="display:flex;gap:6px;align-items:flex-start;margin:6px 0"><div style="width:70px;font-weight:700">${label}</div>${frames.map(x => `<figure style="margin:0;width:200px"><img src="${x.src}" style="width:100%;display:block;outline:1px solid #555"><figcaption style="padding:2px 0;font-size:12px">${parseInt(x.f)} ms <b style="background:${col[x.l] || "#333"};padding:0 4px">${x.l}</b></figcaption></figure>`).join("")}</div>`;
const html = `<html><body style="margin:0;padding:8px;background:#1d1d1b;color:#fff;font:13px Arial"><div style="font-size:15px;margin-bottom:4px">${title}</div>${row("FÖRE", pick(A))}${row("EFTER", pick(B))}<div style="font-size:11px;color:#bbb">MASK = varm boot-/beredskapsyta · PARTIAL = målad med synliga väntemarkörer/ej laddade bilder · SIDEBAR = stängd #sidebar syns · READY = Theme 8 klar · tid = ms från första tidslinjeram</div></body></html>`;
const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1800, height: 300 } });
await p.setContent(html); await p.waitForTimeout(300); await p.screenshot({ path: out, fullPage: true, type: out.endsWith(".jpg") ? "jpeg" : "png", ...(out.endsWith(".jpg") ? { quality: 80 } : {}) }); await b.close(); console.log(out);
