// Hero's Core, lokal build i previewn (paket + labblänk). Härlett ur ms2ml preview-check.mjs.
// Kontroll mot Theme 8-previewn efter merge till dev (ingen lokal
// injicering). 1) Paketköp 3-pack på MS 2 ml, tas bort efteråt.
// 2) Labblänkarnas PDF:er svarar. 3) Andra PDP:er: förhandsvisning (dev nu)
// jämförd pixel för pixel med bygget före merge (PREV=<dist/theme8>).
// node preview-check.mjs
import { chromium, ctxFor, open, URL_ } from "../pdp-pilot-2026-10/lib.mjs";
import fs from "node:fs"; import path from "node:path";
const DIR = path.dirname(new URL(import.meta.url).pathname), OUT = path.join(DIR, "shots", "paket");
fs.mkdirSync(OUT, { recursive: true });
const PDP = "/sv/products/thc-x-vape-hero-core-2ml";
const api = (p, method, ep, body) => p.evaluate(async ([m, e, b]) => {
  const x = document.cookie.match(/(?:^|;\s*)XSRF-TOKEN=([^;]+)/);
  const h = { Accept: "application/json", "Content-Type": "application/json", "X-Requested-With": "XMLHttpRequest" };
  if (x) h["X-XSRF-TOKEN"] = decodeURIComponent(x[1]);
  const r = await fetch("/frontend-api/" + e, { method: m, credentials: "same-origin", headers: h, body: b ? JSON.stringify(b) : undefined });
  let j = null; try { j = await r.json(); } catch {} return { status: r.status, json: j };
}, [method, ep, body]);
const items = async p => ((await api(p, "GET", "cart")).json?.data?.items || []).map(i => ({ id: i.id, variant: i.variant_id || i.variant?.id, qty: i.quantity, name: i.name, price: i.price?.formatted_price || i.formatted_price }));
const b = await chromium.launch({ channel: "chrome", headless: true }); const R = { packs: {}, labs: null, others: {} };

// 1) Paketval + paketköp
for (const [w, h] of [[1440, 900], [393, 852]]) {
  const ctx = await ctxFor(b, w, h, { scale: 1 });
  const p = await open(ctx, URL_(PDP));
  await p.waitForSelector(".hz8-pc", { timeout: 30000 }); await p.waitForTimeout(4000);
  const r = R.packs[w] = {};
  r.cards = await p.evaluate(() => [...document.querySelectorAll(".hz8-pc")].map(c => c.textContent.replace(/\s+/g, " ").trim() + (c.getAttribute("aria-checked") === "true" ? " [vald]" : "")));
  await p.locator('.hz8-pc[data-qty="3"]').click(); await p.waitForTimeout(800);
  const fill = p.locator(".hz8-up__fill"); if (await fill.isVisible().catch(() => false)) { await fill.click(); await p.waitForTimeout(600); }
  r.module = await p.evaluate(() => ({ title: document.querySelector(".hz8-up__title")?.textContent, slots: [...document.querySelectorAll(".hz8-up__slots select")].map(s => s.selectedOptions[0]?.textContent.trim()), sum: document.querySelector(".hz8-up__sum")?.textContent.trim(), cta: document.querySelector(".hz8-pp__cta")?.textContent.trim(), overflow: document.documentElement.scrollWidth - innerWidth }));
  const st = await p.locator(".product-detail").boundingBox();
  await p.screenshot({ path: path.join(OUT, `paket-3-${w}.jpg`), clip: { x: 0, y: Math.max(0, st.y), width: w, height: Math.min(w < 768 ? 1700 : 1000, st.height) }, fullPage: true, type: "jpeg", quality: 80 });
  if (w === 1440) {
    const before = await items(p);
    await p.locator(".hz8-pp__cta").click(); await p.waitForTimeout(5000);
    const after = await items(p);
    const added = after.filter(a => !before.some(x => x.id === a.id && x.qty === a.qty));
    r.buy = { added };
    for (const a of added) await api(p, "DELETE", "cart/item/" + a.id);
    r.buy.cleaned = (await items(p)).filter(a => added.some(x => x.id === a.id)).length === 0;
  }
  if (w === 1440) {
    r.labs = await p.evaluate(() => [...document.querySelectorAll("#hz8-pcx-strains a[href$='.pdf'], .hz8-pcx-labs a[href]")].map(a => [a.textContent.trim(), a.href]));
  }
  await ctx.close();
}
// 2) Labblänkar: svarar PDF:erna?
R.labs = [];
for (const [t, u] of R.packs[1440].labs || []) {
  let s = "fel"; try { const x = await fetch(u, { method: "HEAD", redirect: "follow" }); s = x.status + " " + (x.headers.get("content-type") || ""); } catch (e) { s = String(e); }
  R.labs.push([t, u, s]);
}
fs.writeFileSync(path.join(DIR, "pack-check.json"), JSON.stringify(R, null, 1));
console.log(JSON.stringify(R, null, 1)); await b.close();
