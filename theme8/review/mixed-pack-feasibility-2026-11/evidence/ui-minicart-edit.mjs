// TASK 19 — minicartens "Ändra"-flöde (84-cart.js replaceRow) mot pilotpaket 263, lokal build via harnessen.
// Paket Gelato/Melon Haze/Coconut Cake läggs via API, plats 3 byts till Pineapple Express i Theme 8:s strainvy,
// "Spara val" -> ny rad {id, pivot_id} + borttagning av gammal rad. Läser verklig korg, tömmer den. Ingen order.
import fs from "node:fs"; import path from "node:path";
import { chromium, ctxFor, open, ready } from "../../catalog-reconciliation-2026-11/lib/harness.mjs";
const DIR = path.dirname(new URL(import.meta.url).pathname);
const b = await chromium.launch(); const R = { posts: [], deletes: [] };
const ctx = await ctxFor(b, 1440, 1000, { which: "after" });
const p = await open(ctx, "/sv/products/thc-x-vape-hero-core-2ml?hz8-pkg-pilot=1"); await ready(p, 3000);
try { await p.getByRole("button", { name: "Godkänn alla" }).click({ timeout: 2000 }); } catch { }
const api = (method, u, body) => p.evaluate(async ({ method, u, body }) => {
  const x = decodeURIComponent((document.cookie.match(/XSRF-TOKEN=([^;]+)/) || [])[1] || "");
  const r = await fetch("/frontend-api/" + u, { method, credentials: "same-origin", headers: { Accept: "application/json", "Content-Type": "application/json", "X-Requested-With": "XMLHttpRequest", "X-XSRF-TOKEN": x }, body: body ? JSON.stringify(body) : undefined });
  let j = null; try { j = await r.json(); } catch { } return { status: r.status, json: j };
}, { method, u, body });
const parts = C => C.items.map(i => ({ id: i.id, variant: i.variant_id, total: i.formatted_total, parts: (i.package_items || []).flatMap(x => Array(x.quantity).fill(x.option_values[0].laravel_through_key)) }));
const pre = await api("POST", "cart/item", { product_variant_id: 467, quantity: 1, meta: { data: { packageProductVariants: [{ id: 425, pivot_id: 1 }, { id: 431, pivot_id: 2 }, { id: 438, pivot_id: 3 }] } } });
R.before = parts(pre.json.data);
p.on("request", rq => { if (/\/frontend-api\/cart\/item/.test(rq.url())) { if (rq.method() === "POST") R.posts.push(JSON.parse(rq.postData())); if (rq.method() === "DELETE") R.deletes.push(rq.url().split("/").pop()); } });
await p.evaluate(() => window.HZ8.store().dispatch("cart/reload").then(() => window.HZ8.store().dispatch("cart/open")));
await p.waitForSelector("#cartAside .hz8-pack__edit", { timeout: 30000 });
R.summaryBefore = await p.locator("#cartAside .hz8-pack__strains").first().innerText();
await p.locator("#cartAside .hz8-pack__edit").first().click(); await p.waitForTimeout(800);
await p.locator('[data-hz8-slot="2"]').click(); await p.waitForTimeout(400);
await p.locator('[data-hz8-opt="433"][data-slot="2"]').click(); await p.waitForTimeout(400);
await p.screenshot({ path: path.join(DIR, "shots", "UI-E1-minicart-strainvy.png") });
await p.locator(".hz8-strains__save").click();
await p.waitForTimeout(6000);
const after = await api("GET", "cart"); R.after = parts(after.json.data); R.total = after.json.data.formatted_total;
R.summaryAfter = await p.locator("#cartAside .hz8-pack__strains").first().innerText().catch(() => null);
R.live = await p.evaluate(() => (document.getElementById("hz8-cart-live") || {}).textContent || "");
await p.screenshot({ path: path.join(DIR, "shots", "UI-E1-minicart-efter.png") });
for (const it of after.json.data.items) await api("DELETE", "cart/item/" + it.id);
const fin = await api("GET", "cart"); R.cleaned = fin.json.data.items.length === 0;
R.pass = R.after.length === 1 && R.after[0].total === "1 920 kr" && JSON.stringify(R.after[0].parts) === JSON.stringify([425, 431, 433]) && R.deletes.includes(String(R.before[0].id))
  && R.posts.length === 1 && JSON.stringify(R.posts[0].meta.data.packageProductVariants) === JSON.stringify([{ id: 425, pivot_id: 1 }, { id: 431, pivot_id: 2 }, { id: 433, pivot_id: 3 }]);
fs.writeFileSync(path.join(DIR, "cart-runs", "ui-minicart-edit.json"), JSON.stringify(R, null, 1));
console.log((R.pass ? "PASS" : "FAIL"), JSON.stringify(R, null, 1));
await ctx.close(); await b.close();
