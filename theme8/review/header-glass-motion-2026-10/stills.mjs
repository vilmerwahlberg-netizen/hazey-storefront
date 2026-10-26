// TASK 01F -- före/efter-stillbilder av headerglaset i sitt sammanhang
// (övre delen av vyn) över foto och beige ytor, plus ett ark.
// node stills.mjs   (kör före och efter sekventiellt, en sida i taget)
import { chromium, ctxFor, open, ready, DIR, ROUTES } from "./lib.mjs"; import fs from "node:fs";
const CASES = [
  ["alla-vapes", 0, "Alla Vapes, toppen: ljust glas över kategorifotot"],
  ["home", 1150, "Startsidan: ljust glas över beige innehåll"],
  ["alla-produkter", 1150, "Alla produkter: ljust glas över produktrutnätet"],
  ["home", 0, "Startsidan, toppen: mörkt fotoläge (oförändrat)"]
];
const sleep = ms => new Promise(r => setTimeout(r, ms));
const b = await chromium.launch(); const shots = {};
for (const which of ["before", "after"]) for (const w of [393, 1440]) {
  const ctx = await ctxFor(b, w, w < 768 ? 852 : 900, { which });
  for (const [route, y, label] of CASES) {
    const p = await open(ctx, ROUTES[route]); await ready(p, 2500);
    await p.evaluate(y => window.scrollTo({ top: y, behavior: "instant" }), y); await sleep(900);
    const h = w < 768 ? 150 : 130;
    const buf = await p.screenshot({ clip: { x: 0, y: 0, width: w, height: h }, type: "jpeg", quality: 88 });
    shots[`${which}|${w}|${route}|${y}`] = buf.toString("base64"); await p.close();
  }
  await ctx.close();
}
const img = k => `<img src="data:image/jpeg;base64,${shots[k]}" style="display:block;width:100%;outline:1px solid #444">`;
let html = `<html><body style="margin:0;padding:10px;background:#1d1d1b;color:#fff;font:13px Arial"><div style="font-size:16px;margin-bottom:6px">TASK 01F — headerglas före (70 %) och efter (60 % elfenben / 40 % transparent)</div>`;
for (const [route, y, label] of CASES) {
  html += `<div style="margin:10px 0 4px;font-weight:700">${label}</div><div style="display:grid;grid-template-columns:393px 393px 1fr 1fr;gap:8px;align-items:start">`;
  for (const w of [393, 1440]) for (const which of ["before", "after"]) html += `<figure style="margin:0">${img(`${which}|${w}|${route}|${y}`)}<figcaption style="font-size:11px;color:#ccc">${which === "before" ? "FÖRE" : "EFTER"} · ${w}px</figcaption></figure>`;
  html += `</div>`;
}
html += `</body></html>`;
const p = await b.newPage({ viewport: { width: 2200, height: 400 } }); await p.setContent(html); await sleep(400);
await p.screenshot({ path: `${DIR}/proof/glass-before-after.jpg`, fullPage: true, type: "jpeg", quality: 82 }); await b.close();
console.log("proof/glass-before-after.jpg");
