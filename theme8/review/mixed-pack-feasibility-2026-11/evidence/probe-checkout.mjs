// TASK 19 — verklig varukorg + kassa i en isolerad headless-session via Theme 8-previewn. Ingen order, ingen betalning.
// Användning: node probe-checkout.mjs <label> '<JSON-array av cart/item-payloads>'
// Lägger raderna, läser /frontend-api/cart, renderar /sv/checkout?preview=…, sparar skärmbild + text, tömmer korgen.
import { chromium } from "playwright"; import fs from "node:fs"; import path from "node:path";
const DIR = path.dirname(new URL(import.meta.url).pathname);
const PREVIEW = "v9kzdmqz4w60l5n", O = "https://hazeyse.nyehandel.se";
const label = process.argv[2] || "baseline"; const payloads = JSON.parse(String(process.argv[3] || "[]").startsWith("@") ? fs.readFileSync(process.argv[3].slice(1), "utf8") : (process.argv[3] || "[]"));
const startPath = process.argv[4] || "/sv/products/magic-sauce-buds-yoda-ice-cream-5-gram";
const b = await chromium.launch(); const out = { label, at: new Date().toISOString(), adds: [] };
// NH sparar inte korgen för HeadlessChrome-UA (verifierat 2026-11-06) -- samma desktop-UA som harnessen.
const go = async (pg, url) => { for (let i = 0; ; i++) { try { return await pg.goto(url, { waitUntil: "domcontentloaded", timeout: 60000 }); } catch (e) { if (i >= 2) throw e; await pg.waitForTimeout(5000); } } };
const ctx = await b.newContext({ viewport: { width: 1440, height: 1000 }, userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36" }); const p = await ctx.newPage();
await go(p, `${O}${startPath}?preview=${PREVIEW}`);
await p.waitForTimeout(2500);
try { await p.getByRole("button", { name: "Godkänn alla" }).click({ timeout: 3000 }); } catch { }
const api = (method, url, body) => p.evaluate(async ({ method, url, body }) => {
  const x = decodeURIComponent((document.cookie.match(/XSRF-TOKEN=([^;]+)/) || [])[1] || "");
  const r = await fetch("/frontend-api/" + url, { method, credentials: "same-origin", headers: { Accept: "application/json", "Content-Type": "application/json", "X-Requested-With": "XMLHttpRequest", "X-XSRF-TOKEN": x }, body: body ? JSON.stringify(body) : undefined });
  const t = await r.text(); let j = null; try { j = JSON.parse(t); } catch { } return { status: r.status, json: j, text: j ? null : t.slice(0, 300) };
}, { method, url, body });
for (const pl of payloads) { const r = await api("POST", "cart/item", pl); out.adds.push({ payload: pl, status: r.status, error: r.status >= 300 ? (r.json || r.text) : null }); }
const cart = await api("GET", "cart");
const C = cart.json && cart.json.data;
out.rawItems = C ? C.items : null;
out.cart = C ? { total: C.formatted_total, decimal_total: C.decimal_total, quantity_count: C.quantity_count, coupon: C.cart_coupon,
  items: C.items.map(i => ({ id: i.id, name: i.name, product_id: i.product_id, variant_id: i.variant_id, sku: i.variant_sku, quantity: i.quantity, price: i.formatted_price, total: i.formatted_total, discount: i.discount, discount_type: i.discount_type, meta: i.meta, package_items: i.package_items || null })) } : cart;
if (C && C.items.length) {
  await go(p, `${O}/sv/checkout?preview=${PREVIEW}`);
  await p.waitForTimeout(9000);
  out.checkoutUrl = p.url();
  out.checkoutText = (await p.evaluate(() => document.body.innerText)).replace(/\n{2,}/g, "\n").slice(0, 4000);
  out.kustomFrames = p.frames().map(f => f.url().split("#")[0]).filter(u => /kustom|klarna|walley|svea|payment/i.test(u)).slice(0, 5);
  out.kustomTestdrive = p.frames().some(f => /TESTDRIVE%22%3Atrue/.test(f.url()));
  await p.screenshot({ path: path.join(DIR, "shots", `${label}-checkout-1440.png`), fullPage: true });
  // Kustom-iframens egen sammanfattning (om den går att läsa).
  for (const f of p.frames()) if (/kustom|klarna/i.test(f.url())) { try { out.kustomText = (await f.evaluate(() => document.body.innerText)).slice(0, 2000); } catch (e) { out.kustomText = "ej läsbar: " + String(e).slice(0, 80); } }
  await go(p, `${O}${startPath}?preview=${PREVIEW}`); await p.waitForTimeout(1500);
  for (const it of C.items) await api("DELETE", "cart/item/" + it.id);
}
const after = await api("GET", "cart"); out.cleaned = after.json && after.json.data ? after.json.data.items.length === 0 : after;
fs.mkdirSync(path.join(DIR, "cart-runs"), { recursive: true });
fs.writeFileSync(path.join(DIR, "cart-runs", `${label}.json`), JSON.stringify(out, null, 1));
console.log(JSON.stringify({ adds: out.adds.map(a => a.status + (a.error ? " " + JSON.stringify(a.error).slice(0, 120) : "")), cart: out.cart && { total: out.cart.total, items: (out.cart.items || []).map(i => `${i.variant_id} ${i.sku} qty=${i.quantity} ${i.total} pkg=${JSON.stringify(i.package_items && i.package_items.map(x => x.name + "|" + (x.option_values || []).map(o => o.laravel_through_key + ":" + o.name).join("/")))} meta=${JSON.stringify(i.meta)}`) }, frames: out.kustomFrames, cleaned: out.cleaned }, null, 1));
console.log("--- kassatext ---\n" + (out.checkoutText || "").slice(0, 1800));
await b.close();
