// TASK 20 v4: läsande kontroll av alla paketartiklar (263, 265–269) och basprodukterna 255/260/261.
// Inga korgar, ingen order. Slug hittas via /sv/products/<id> (omdirigering) eller sökning.
import fs from "node:fs"; import path from "node:path";
import { chromium, ctxFor, open, ready } from "../../catalog-reconciliation-2026-11/lib/harness.mjs";
const DIR = path.dirname(new URL(import.meta.url).pathname);
const b = await chromium.launch(); const ctx = await ctxFor(b, 1440, 1000, { which: "external" });
const p = await open(ctx, "/sv/products/thc-x-vape-hero-core-2ml"); await ready(p, 1500);
const out = await p.evaluate(async () => {
  const x = decodeURIComponent((document.cookie.match(/XSRF-TOKEN=([^;]+)/) || [])[1] || "");
  const H = { Accept: "application/json", "Content-Type": "application/json", "X-Requested-With": "XMLHttpRequest", "X-XSRF-TOKEN": x };
  const st = async id => { const r = await fetch("/frontend-api/product/state", { method: "POST", credentials: "same-origin", headers: H, body: JSON.stringify({ product_id: id, variant_ids: [null] }) }); return r.ok ? (await r.json()).product : { status: r.status }; };
  const res = { packages: {}, bases: {} };
  for (const id of [255, 260, 261]) { const P = await st(id); res.bases[id] = { name: P.name, variants: P.variants.map(v => ({ id: v.id, opt: (v.option_values || []).map(o => o.name).join("/"), price: v.price.formatted_price, stock: v.available_stock, track: v.track_inventory, buyable: v.buyable, always: v.always_orderable })) }; }
  for (const id of [263, 265, 266, 267, 268, 269]) {
    const P = await st(id); const v = P.variants && P.variants[0];
    const r = { name: P.name, is_package: P.is_package, parts_buyable: P.parts_buyable, variant: v && v.id, sku: v && v.sku, price: v && v.price && v.price.formatted_price, buyable: v && v.buyable, track: v && v.track_inventory };
    // sidadress: prova /sv/products/<id>
    let route = null;
    for (const u of ["/sv/products/" + id, "/products/" + id]) { try { const rr = await fetch(u, { credentials: "same-origin", redirect: "follow" }); if (rr.ok && /package-product/.test(await rr.clone().text())) { route = new URL(rr.url).pathname; break; } } catch (e) { } }
    r.routeTry = route; res.packages[id] = r;
  }
  return res;
});
fs.writeFileSync(path.join(DIR, "probe-packages.json"), JSON.stringify(out, null, 2)); console.log(JSON.stringify(out, null, 1).slice(0, 5000));
await b.close();
