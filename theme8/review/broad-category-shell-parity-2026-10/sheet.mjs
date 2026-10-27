// TASK 01G -- treradigt jämförelseark: Alla Vapes | Alla Buds | Allt Hasch.
// node sheet.mjs <before|after> <width> <state> <ut.jpg>
// Rader: hero, hylla + första produktrad, nedre upptäckt (normal-läge).
import { chromium } from "playwright"; import fs from "node:fs"; import { DIR } from "./lib.mjs";
const [which = "after", w = "1440", st = "normal", out] = process.argv.slice(2);
const S = `${DIR}/runs/shots`; const R = [["vapes", "Alla Vapes"], ["buds", "Alla Buds"], ["hasch", "Allt Hasch"]];
const rowsDef = [["hero", "Hero"], ["shelf", "Hylla + första produktrad"], ["lower", "Nedre upptäckt"]];
const img = f => fs.existsSync(f) ? `<img src="data:image/png;base64,${fs.readFileSync(f).toString("base64")}" style="width:100%;display:block;outline:1px solid #444">` : `<div style="padding:8px;color:#888;border:1px dashed #555">–</div>`;
let h = `<html><body style="margin:0;padding:10px;background:#1d1d1b;color:#fff;font:12px Arial"><div style="font-size:15px;margin-bottom:6px">TASK 01G — ${which === "before" ? "FÖRE" : "EFTER"} · ${w} px · ${st}</div><div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-bottom:4px">${R.map(r => `<b>${r[1]}</b>`).join("")}</div>`;
for (const [k, l] of rowsDef) { const files = R.map(([r]) => `${S}/${which}-${r}-${w}-${st}-${k}.png`); if (!files.some(f => fs.existsSync(f))) continue; h += `<div style="color:#ccc;margin:8px 0 3px">${l}</div><div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px;align-items:start">${files.map(img).join("")}</div>`; }
const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: +w <= 430 ? 1250 : 2100, height: 400 } }); await p.setContent(h + "</body></html>"); await p.waitForTimeout(300);
await p.screenshot({ path: out || `${DIR}/proof/family-${which}-${w}-${st}.jpg`, fullPage: true, type: "jpeg", quality: 76 }); await b.close(); console.log(out || `proof/family-${which}-${w}-${st}.jpg`);
