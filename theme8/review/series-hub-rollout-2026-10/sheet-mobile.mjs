// TASK 04C-R -- före/efter-ark för seriehubbarnas hela mobilhero.
// 1) per bredd (320/393/430): fem hubbar, före ovanför efter.
// 2) Core mot Magic Sauce vid 393, före/efter sida vid sida.
// Utsnitt: viewportens topp till heronederkant + formatraden.
import { chromium } from "playwright"; import fs from "node:fs"; import { DIR } from "./lib.mjs";
const S = `${DIR}/runs/shots`, OUT = `${DIR}/proof/mobile-hero-correction`;
const H = [["magic-sauce", "Magic Sauce"], ["thcab", "THCaB / THC-A"], ["thcba", "THCbA / THC-B"], ["nano11", "Nano-11"], ["core", "Core"]];
const src = f => `data:image/png;base64,${fs.readFileSync(f).toString("base64")}`;
const fig = (f, w, cap) => `<figure style="margin:0"><figcaption style="font:600 13px Arial;color:#ddd;margin:0 0 4px">${cap}</figcaption>${fs.existsSync(f) ? `<div style="width:${w}px;height:${Math.round(w * 1.62)}px;overflow:hidden;outline:1px solid #444"><img src="${src(f)}" style="display:block;width:${w}px"></div>` : `<div style="color:#f66">saknas ${f.split("/").pop()}</div>`}</figure>`;
const page = async (html, out, width) => { const b = await chromium.launch(); const p = await b.newPage({ viewport: { width, height: 400 } }); await p.setContent(`<body style="margin:0;padding:14px;background:#1d1d1b">${html}</body>`); await p.waitForTimeout(400); await p.screenshot({ path: out, fullPage: true, type: "jpeg", quality: 78 }); await b.close(); console.log(out); };
for (const w of [320, 393, 430]) {
  const row = which => `<div style="display:flex;gap:14px;margin-bottom:14px">${H.map(([k, n]) => fig(`${S}/${which}-${k}-${w}-top.png`, w, `${n} · ${which === "before" ? "före" : "efter"} · ${w}px`)).join("")}</div>`;
  await page(row("before") + row("after"), `${OUT}/mobile-hero-before-after-${w}.jpg`, 5 * (w + 14) + 28);
}
await page(`<div style="display:flex;gap:14px">${[["magic-sauce", "before", "Magic Sauce · före"], ["magic-sauce", "after", "Magic Sauce · efter"], ["core", "before", "Core · före"], ["core", "after", "Core · efter"]].map(([k, wh, c]) => fig(`${S}/${wh}-${k}-393-top.png`, 393, c)).join("")}</div>`, `${OUT}/core-vs-magic-sauce-393.jpg`, 4 * 407 + 28);
