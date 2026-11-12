// TASK 21: visuell kontroll av kassans paketrader vid 393 (Android-UA). Lägger paket via API i en sessionskorg
// (en familj per körning: 3-pack blandat + 5-pack upprepat + vanlig vara), öppnar kassans hopfällda varulista som en
// kund, injicerar kassans CSS (simulerad inklistring) och tar en helsidesbild. Korgen töms. Ingen order.
import fs from "node:fs"; import path from "node:path";
import { chromium, ctxFor, open, ready, url, ROOT } from "../../catalog-reconciliation-2026-11/lib/harness.mjs";
const DIR = path.dirname(new URL(import.meta.url).pathname);
const CSS = fs.readFileSync(path.join(ROOT, "dist/theme8/hazey-theme8-checkout.css"), "utf8");
const UA = "Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Mobile Safari/537.36";
const FAM = {
  core: { home: "/sv/products/thc-x-vape-hero-core-2ml", p3: [467, [[425, 1], [431, 2], [438, 3]]], p5: [469, [[429, 7], [429, 8], [429, 9], [429, 10], [429, 11]]], single: 425 },
  ms2: { home: "/sv/products/vape-magic-sauce-magic-farmers-2ml", p3: [470, [[454, 12], [454, 13], [464, 14]]], p5: [471, [[454, 15], [454, 16], [454, 17], [454, 18], [454, 19]]], single: 454 },
  ms5: { home: "/sv/products/magic-sauce-vape-5ml", p3: [472, [[449, 20], [451, 21], [453, 22]]], p5: [473, [[456, 23], [456, 24], [456, 25], [456, 26], [456, 27]]], single: 449 }
};
const b = await chromium.launch(); const res = {};
for (const [k, F] of Object.entries(FAM)) {
  const ctx = await ctxFor({ newContext: o => b.newContext({ ...o, userAgent: UA }) }, 393, 852, { which: "after" });
  const p = await open(ctx, F.home); await ready(p, 2000);
  const api = (method, u, body) => p.evaluate(async ({ method, u, body }) => { const x = decodeURIComponent((document.cookie.match(/XSRF-TOKEN=([^;]+)/) || [])[1] || ""); const r = await fetch("/frontend-api/" + u, { method, credentials: "same-origin", headers: { Accept: "application/json", "Content-Type": "application/json", "X-Requested-With": "XMLHttpRequest", "X-XSRF-TOKEN": x }, body: body ? JSON.stringify(body) : undefined }); try { return await r.json(); } catch { return null; } }, { method, u, body });
  for (const [v, rows] of [F.p3, F.p5]) await api("POST", "cart/item", { product_variant_id: v, quantity: 1, meta: { data: { packageProductVariants: rows.map(([id, pivot_id]) => ({ id, pivot_id })) } } });
  await api("POST", "cart/item", { product_variant_id: F.single, quantity: 1 });
  for (let i = 0; ; i++) { try { await p.goto(url("/sv/checkout"), { waitUntil: "domcontentloaded", timeout: 60000 }); break; } catch (e) { if (i > 2) throw e; await p.waitForTimeout(6000); } }
  await p.waitForTimeout(8000); await p.addStyleTag({ content: CSS }); await p.waitForTimeout(500);
  // Mobilens växlare för varulistan (Nyehandel): klicka det element som visar/döljer .checkout-items-summary.
  res[k] = { before: await p.evaluate(() => { const e = document.querySelector(".checkout-items-summary"); return e ? Math.round(e.getBoundingClientRect().height) : null; }) };
  res[k].toggle = await p.evaluate(() => {
    const cands = [...document.querySelectorAll("button, a, [role=button], .is-hidden-desktop, [class*=toggle], [class*=summary] > *")].filter(e => e.getClientRects().length && /varukorg|beställning|visa|produkter|artiklar/i.test(e.textContent || "") && e.textContent.length < 80);
    const t = cands[0]; if (!t) return null; t.click(); return (t.className || t.tagName) + ": " + t.textContent.replace(/\s+/g, " ").trim();
  });
  await p.waitForTimeout(1200);
  res[k].after = await p.evaluate(() => { const e = document.querySelector(".checkout-items-summary"); return e ? Math.round(e.getBoundingClientRect().height) : null; });
  res[k].rows = await p.evaluate(() => [...document.querySelectorAll(".checkout-items-summary article.item")].map(a => { const st = a.querySelector(".content a > strong"); const r = a.getBoundingClientRect(); return { h: Math.round(r.height), after: st ? getComputedStyle(st, "::after").content : null, tile: getComputedStyle(a.querySelector(".media"), "::after").content }; }));
  res[k].overflow = await p.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1);
  const box = await p.evaluate(() => { const rs = [...document.querySelectorAll(".checkout-items-summary article.item")].map(a => a.getBoundingClientRect()); const top = Math.min(...rs.map(r => r.top)) + scrollY, bot = Math.max(...rs.map(r => r.bottom)) + scrollY; return { y: top, h: bot - top }; });
  await p.screenshot({ path: path.join(DIR, "shots", k + "-393-kassa.png"), fullPage: true, clip: { x: 0, y: Math.max(0, box.y - 70), width: 393, height: Math.min(box.h + 110, 2400) } });
  await p.goto(url(F.home), { waitUntil: "domcontentloaded" }); await p.waitForTimeout(1200);
  for (const it of ((await api("GET", "cart")).data.items || [])) await api("DELETE", "cart/item/" + it.id);
  res[k].cleaned = (await api("GET", "cart")).data.items.length === 0;
  await ctx.close();
}
fs.writeFileSync(path.join(DIR, "checkout-393.json"), JSON.stringify(res, null, 1)); console.log(JSON.stringify(res, null, 1));
await b.close();
