// TASK 21: var kommer paketradens namn och bild ifrån? Korg-API, minicart (Vue + Theme 8) och kassa.
// Lägger ett paket (263) + en vanlig variant (425) i en sessionskorg, läser, tömmer. Ingen order.
import fs from "node:fs"; import path from "node:path";
import { chromium, ctxFor, open, ready, url } from "../../catalog-reconciliation-2026-11/lib/harness.mjs";
const DIR = path.dirname(new URL(import.meta.url).pathname);
const b = await chromium.launch(); const ctx = await ctxFor(b, 1440, 1000, { which: "after" });
const p = await open(ctx, "/sv/products/thc-x-vape-hero-core-2ml"); await ready(p, 3000);
try { await p.getByRole("button", { name: "Godkänn alla" }).click({ timeout: 2000 }); } catch { }
const api = (method, u, body) => p.evaluate(async ({ method, u, body }) => {
  const x = decodeURIComponent((document.cookie.match(/XSRF-TOKEN=([^;]+)/) || [])[1] || "");
  const r = await fetch("/frontend-api/" + u, { method, credentials: "same-origin", headers: { Accept: "application/json", "Content-Type": "application/json", "X-Requested-With": "XMLHttpRequest", "X-XSRF-TOKEN": x }, body: body ? JSON.stringify(body) : undefined });
  return r.json();
}, { method, u, body });
await api("POST", "cart/item", { product_variant_id: 467, quantity: 1, meta: { data: { packageProductVariants: [{ id: 425, pivot_id: 1 }, { id: 431, pivot_id: 2 }, { id: 431, pivot_id: 3 }] } } });
const c = await api("POST", "cart/item", { product_variant_id: 425, quantity: 1 });
const out = {};
const items = c.data.items;
out.cartKeys = Object.keys(items[0]);
out.items = items.map(i => { const o = {}; for (const [k, v] of Object.entries(i)) if (v === null || typeof v !== "object") o[k] = v; o.package_items0 = i.package_items && i.package_items[0] ? Object.keys(i.package_items[0]) : null; o.imageLike = Object.fromEntries(Object.entries(i).filter(([k]) => /image|thumb|media|url|slug|link/i.test(k))); return o; });
await p.evaluate(() => window.HZ8.store().dispatch("cart/reload").then(() => window.HZ8.store().dispatch("cart/open"))); await p.waitForTimeout(3000);
out.minicart = await p.evaluate(() => Array.from(document.querySelectorAll("#cartAside article.item")).map(a => ({ cls: a.className, html: a.outerHTML.replace(/\s+/g, " ").slice(0, 1600) })));
await p.goto(url("/sv/checkout"), { waitUntil: "domcontentloaded" }); await p.waitForTimeout(9000);
out.checkout = await p.evaluate(() => ({ hz8: document.documentElement.className, loader: !!document.querySelector("[data-hz8-dev-js]"), hz8css: !!document.querySelector("[data-hz8-dev-css]"), hz8obj: !!window.HZ8,
  styleSheets: [...document.styleSheets].map(s => s.href || "inline:" + (s.ownerNode.textContent || "").slice(0, 60)).slice(0, 15),
  scriptsSrc: [...document.scripts].map(s => s.src).filter(Boolean).slice(0, 15),
  row: (() => { const t = [...document.querySelectorAll("*")].find(e => e.children.length === 0 && /PILOT T19/.test(e.textContent)); let e = t; for (let i = 0; i < 6 && e && e.parentElement; i++) e = e.parentElement; return e ? e.outerHTML.replace(/\s+/g, " ").slice(0, 2500) : null; })(),
  vuex: (() => { const st = document.querySelector("#store-instance") && document.querySelector("#store-instance").__vue__ && document.querySelector("#store-instance").__vue__.$store; return st ? Object.keys(st.state) : null; })() }));
fs.writeFileSync(path.join(DIR, "probe-sources.json"), JSON.stringify(out, null, 2));
await p.goto(url("/sv/products/thc-x-vape-hero-core-2ml"), { waitUntil: "domcontentloaded" }); await p.waitForTimeout(1500);
const fin = await api("GET", "cart"); for (const it of fin.data.items) await api("DELETE", "cart/item/" + it.id);
console.log(JSON.stringify({ cartKeys: out.cartKeys, items: out.items, checkout: { ...out.checkout, row: undefined } }, null, 1).slice(0, 6000));
await b.close();
