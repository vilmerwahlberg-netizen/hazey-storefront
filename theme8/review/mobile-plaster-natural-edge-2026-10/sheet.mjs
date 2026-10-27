// TASK 01D-R3 (kopia av 01D-R:s sheet.mjs; facit = vänsterpanelen i
// task-01d-r3-natural-plaster-edge/references/reference-before-after.png).
// TASK 01D-R -- jämförelseark. Läge "cmp": accepterat facit | före | efter
// vid 393 (samma viewport, utsnitt förankrat i quizkortets underkant).
// Läge "grid": efter per rutt vid 320/393/430/200 %.
// node sheet.mjs cmp <ut.jpg> <route>
// node sheet.mjs grid <ut.jpg> <route,..> <kol: after-320,after-393,after-430,after-1440-z200>
import { chromium } from "playwright"; import fs from "node:fs"; import { DIR, ROOT } from "./lib.mjs";
const [mode, out, rs, cs = ""] = process.argv.slice(2);
const S = `${DIR}/runs/shots`; const REF = `${ROOT}/theme8/review/storefront-task-system/ready-for-claude/task-01d-r3-natural-plaster-edge/references/reference-before-after.png`;
const src = f => `data:image/png;base64,${fs.readFileSync(f).toString("base64")}`;
// Facit: vänsterpanelen x 0..555 av 1702 px (555 px = 393 CSS-px, faktor 1,412);
// quizkortets underkant y 328 -> 232 CSS-px.
const K = 555 / 393, REF_ANCHOR = 328 / K;
const fig = (inner, cap, w = 393) => `<figure style="margin:0"><div style="width:${w}px;height:520px;overflow:hidden;position:relative;outline:1px solid #444;background:#000">${inner}</div><figcaption style="font-size:13px;color:#ddd;padding-top:4px">${cap}</figcaption></figure>`;
const shot = (f, w = 393) => fs.existsSync(f) ? `<img src="${src(f)}" style="display:block;width:${w}px">` : `<div style="color:#f66;padding:20px">saknas: ${f.split("/").pop()}</div>`;
let html = `<html><body style="margin:0;padding:12px;background:#1d1d1b;color:#fff;font:13px Arial">`;
if (mode === "cmp") {
  html += `<div style="font-weight:700;font-size:16px;margin-bottom:6px">${rs} · 393 px · samma vertikala utsnitt (quizkortets / sökfältets underkant −230 / +290 px)</div><div style="display:flex;gap:12px">`;
  html += fig(`<img src="${src(REF)}" style="position:absolute;width:${1702 / K}px;left:0;top:${-(REF_ANCHOR - 230)}px">`, "Facit (reference-before-after.png, vänster)");
  html += fig(shot(`${S}/before-${rs}-393-cmp.png`), "Före (HEAD 1c3b4e3, v2 200 %-beskärning)");
  html += fig(shot(`${S}/after-${rs}-393-cmp.png`), "Efter (v3, 100 % auto, centrerad)");
  html += `</div>`;
} else {
  for (const r of rs.split(",")) {
    html += `<div style="margin:10px 0 4px;font-weight:700;font-size:15px">${r}</div><div style="display:flex;gap:10px;align-items:flex-start">`;
    for (const c of cs.split(",")) { const [wh, w, z] = c.split("-"); const f = `${S}/${wh}-${r}-${w}${z ? "-z200" : ""}-cmp.png`; html += fig(shot(f, Math.min(+w, 430)), `${wh === "after" ? "Efter" : "Före"} · ${z ? "200 % zoom (1440-fönster, 720 CSS-px)" : w + " px"}`, Math.min(+w, 430)); }
    html += `</div>`;
  }
}
const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1700, height: 400 } });
await p.setContent(html + "</body></html>"); await p.waitForTimeout(400);
await p.screenshot({ path: out, fullPage: true, type: "jpeg", quality: 82 }); await b.close(); console.log(out);
