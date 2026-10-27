// TASK 01E -- ramark före/efter (393): rad i flödet, strax efter dockans
// entré (före: fasta raden), aktivt filter, filterark, sorteringsark, nära
// sidans slut. node sheet.mjs <route> <ut.jpg>
import { chromium } from "playwright"; import fs from "node:fs"; import { DIR } from "./lib.mjs";
const [route = "alla-vapes", out = `${DIR}/proof/frames-${route}-393.jpg`] = process.argv.slice(2);
const F = `${DIR}/runs/frames`;
const cols = [["01-row", "Raden i flödet"], ["03-dock-entry", "Raden har lämnat vyn (före: ingen docka; Alla Vapes hade en fast rad)"], ["04-active", route === "alla-vapes" ? "Aktivt filter (?volym=2ml)" : "Aktivt filter (?typ=vapes)"], ["05-dock-filter-sheet", "Filterarket"], ["06-dock-sort-sheet", "Sortering"], ["07-page-end", "Nära sidans slut"]];
const img = f => fs.existsSync(f) ? `<img src="data:image/png;base64,${fs.readFileSync(f).toString("base64")}" style="width:100%;display:block;outline:1px solid #444">` : `<div style="height:200px;border:1px dashed #666;color:#888;padding:6px">saknas</div>`;
let h = `<html><body style="margin:0;padding:10px;background:#1d1d1b;color:#fff;font:12px Arial"><div style="font-size:15px;margin-bottom:6px">TASK 01E — ${route} 393 px, före / efter</div>`;
for (const w of ["before", "after"]) { h += `<div style="font-weight:700;margin:8px 0 4px">${w === "before" ? "FÖRE" : "EFTER"}</div><div style="display:grid;grid-template-columns:repeat(6,1fr);gap:6px">`; for (const [k, l] of cols) h += `<figure style="margin:0">${img(`${F}/${w}-${route}-393-${k}.png`)}<figcaption style="padding-top:2px;color:#ccc">${l}</figcaption></figure>`; h += `</div>`; }
const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1600, height: 400 } }); await p.setContent(h + "</body></html>"); await p.waitForTimeout(300);
await p.screenshot({ path: out, fullPage: true, type: "jpeg", quality: 78 }); await b.close(); console.log(out);
