// TASK 17 — visuella jämförelseblad (underlag för nästa visuella task, ingen redesign).
// 1) PDP första vy per bildklass vid 393 och 1440, 2) produktkortens rutnät på breda sidor (skala mellan kort),
// sedan ett sammansatt blad per bredd. Lokal build via harness; inget skrivs till Nyehandel.
// Kör: node sheets.mjs  ->  shots/ (råa, committas inte) + sheets/*.jpg (sammansatta, committas)
import fs from "node:fs"; import path from "node:path";
import { chromium, ctxFor, open, ready, DIR } from "./lib/harness.mjs";
const SHOTS = path.join(DIR, "shots"), SHEETS = path.join(DIR, "sheets");
fs.mkdirSync(SHOTS, { recursive: true }); fs.mkdirSync(SHEETS, { recursive: true });
const PDP = [
  ["Vape 2 ml, flera strains", "vape-magic-sauce-magic-farmers-2ml"], ["Vape 1+1 ml", "cookies-cbd-vape-dual-chamber-triple-scoop-apples-bananas"],
  ["Vape 5 ml", "magic-sauce-vape-5ml"], ["Enkel vape (H4CBD 2 ml, vit bakgrund)", "h4cbd-vape-cbd-group-2ml"], ["Cart", "cart-magic-sauce-magic-farmers-1ml"],
  ["Buds", "magic-sauce-buds-yoda-ice-cream-5-gram"], ["Hasch", "magic-sauce-hash-kitkat-5g"], ["Pre-roll", "magic-sauce-pre-rolls-1g"],
  ["Paket (importerat som vanlig produkt)", "ms-30-2ml-3-pack"], ["Saknar bild", "magic-sauce-hash-charas-5-gram"], ["Batteri (miljöbild)", "ccell-m3-plus-vape-batteri-510"]
];
const GRIDS = [["Alla vapes", "/sv/categories/alla-vapes"], ["Alla buds", "/sv/categories/blommor-buds"], ["Allt hasch", "/sv/categories/hasch"], ["Magic Sauce vapes (inkl. paket)", "/sv/categories/ms-vapes"]];
const b = await chromium.launch();
const made = { 393: [], 1440: [] };
async function shot(route, w, h, file, grid) {
  const ctx = await ctxFor(b, w, h, { which: "after" }); const p = await open(ctx, route); await ready(p, 5000);
  if (grid) {
    /* Theme 8 döljer native-gridet och renderar ett eget: beskär från det första synliga kortet. */
    const top = await p.evaluate(() => { const c = [...document.querySelectorAll(".product-card")].find(e => { const r = e.getBoundingClientRect(); return r.width > 40 && r.height > 40 && getComputedStyle(e).visibility !== "hidden"; }); if (!c) return null; c.scrollIntoView({ block: "start" }); return c.getBoundingClientRect().top + scrollY; });
    await p.waitForTimeout(2500);
    if (top != null) await p.screenshot({ path: file, fullPage: true, clip: { x: 0, y: Math.max(0, top - 24), width: w, height: w < 768 ? 1500 : 1000 } });
    else await p.screenshot({ path: file });
  } else await p.screenshot({ path: file });
  await ctx.close();
}
for (const [w, h] of [[393, 852], [1440, 900]]) {
  for (const [label, slug] of PDP) { const f = path.join(SHOTS, `${w}-pdp-${slug}.png`); await shot("/sv/products/" + slug, w, h, f); made[w].push({ label, f }); process.stdout.write(`${w} pdp ${slug}\n`); }
  for (const [label, route] of GRIDS) { const f = path.join(SHOTS, `${w}-grid-${route.split("/").pop()}.png`); await shot(route, w, h, f, true); made[w].push({ label: "Kort: " + label, f }); process.stdout.write(`${w} grid ${route}\n`); }
}
// Sammansatta blad (JPEG, lagom storlek för granskning).
const ctx = await b.newContext({ viewport: { width: 1600, height: 1000 } }); const p = await ctx.newPage();
for (const w of [393, 1440]) {
  const cols = w === 393 ? 6 : 3;
  const html = `<html><body style="margin:0;background:#1f1f1f;font:14px system-ui;color:#eee"><h1 style="font-size:20px;margin:16px">TASK 17 · produktbilder efter migreringen · ${w} px · lokal build ${new Date().toISOString().slice(0, 10)}</h1><div style="display:grid;grid-template-columns:repeat(${cols},1fr);gap:12px;padding:0 16px 16px">` +
    made[w].map(m => `<figure style="margin:0"><figcaption style="padding:4px 0">${m.label}</figcaption><img style="width:100%;display:block;border:1px solid #444" src="data:image/png;base64,${fs.readFileSync(m.f).toString("base64")}"></figure>`).join("") + "</div></body></html>";
  await p.setContent(html, { waitUntil: "load" }); await p.waitForTimeout(500);
  await p.screenshot({ path: path.join(SHEETS, `product-images-${w}.jpg`), fullPage: true, type: "jpeg", quality: 72 });
}
await b.close(); console.log("sheets done");
