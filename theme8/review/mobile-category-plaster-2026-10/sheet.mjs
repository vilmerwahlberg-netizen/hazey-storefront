// TASK 01D -- jämförelseark: före / accepterad referens / efter (393),
// plus efter vid 320/430 och 200 % zoom per familj.
// node sheet.mjs <ut.jpg> <route,..> <kolumner: before-393,ref,after-393,after-320,...>
import { chromium } from "playwright"; import fs from "node:fs"; import { DIR, ROOT } from "./lib.mjs";
const [out, rs, cs] = process.argv.slice(2);
const S = `${DIR}/runs/shots`; const REF = `${ROOT}/theme8/review/mobile-hero-plaster-transition-concepts-2026-10/concept-b-eroded-plaster-edge.png`;
const src = f => `data:image/png;base64,${fs.readFileSync(f).toString("base64")}`;
const label = c => c === "ref" ? "Accepterad referens (koncept B)" : c.replace("before", "FÖRE").replace("after", "EFTER").replace(/-z200/, " · 200 %").replace(/-(\d+)/, " · $1 px");
let html = `<html><body style="margin:0;padding:10px;background:#1d1d1b;color:#fff;font:13px Arial">`;
for (const r of rs.split(",")) {
  html += `<div style="margin:8px 0 4px;font-weight:700;font-size:15px">${r}</div><div style="display:flex;gap:8px;align-items:flex-start">`;
  for (const c of cs.split(",")) {
    let f, style = "width:300px";
    if (c === "ref") { f = REF; style = "width:300px;height:420px;object-fit:cover;object-position:50% 72%"; }
    else { const [w, x] = c.split("-"); f = `${S}/${w}-${r}-${x}${c.includes("z200") ? "-z200" : ""}-edge.png`.replace("-z200-z200", "-z200"); }
    if (!fs.existsSync(f)) continue;
    html += `<figure style="margin:0"><img src="${src(f)}" style="${style};display:block;outline:1px solid #444"><figcaption style="font-size:11px;color:#ccc;padding-top:2px">${label(c)}</figcaption></figure>`;
  }
  html += `</div>`;
}
const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1700, height: 400 } });
await p.setContent(html + "</body></html>"); await p.waitForTimeout(300);
await p.screenshot({ path: out, fullPage: true, type: "jpeg", quality: 80 }); await b.close(); console.log(out);
