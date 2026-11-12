// TASK 23: läsande kontroll av D10/Faraoh-paketen 270–277 och basprodukterna 254/236/242/256. Inga korgar.
import fs from "node:fs"; import path from "node:path";
import { chromium, ctxFor, open, ready } from "../../catalog-reconciliation-2026-11/lib/harness.mjs";
const DIR = path.dirname(new URL(import.meta.url).pathname);
const M = JSON.parse(fs.readFileSync(path.join(DIR, "../../catalog-reconciliation-2026-11/CURRENT-CATALOG-MATRIX.json"), "utf8"));
const rows = Array.isArray(M) ? M : (M.rows || M.products || Object.values(M).find(Array.isArray));
const slugOf = id => (rows.find(r => r.nhId === id) || {}).nhSlug || null;
const b = await chromium.launch(); const ctx = await ctxFor(b, 1440, 1000, { which: "external" });
const p = await open(ctx, "/sv/products/thc-x-vape-hero-core-2ml"); await ready(p, 1500);
const out = await p.evaluate(async ({ bases }) => {
  const x = decodeURIComponent((document.cookie.match(/XSRF-TOKEN=([^;]+)/) || [])[1] || "");
  const H = { Accept: "application/json", "Content-Type": "application/json", "X-Requested-With": "XMLHttpRequest", "X-XSRF-TOKEN": x };
  const st = async id => { const r = await fetch("/frontend-api/product/state", { method: "POST", credentials: "same-origin", headers: H, body: JSON.stringify({ product_id: id, variant_ids: [null] }) }); return r.ok ? (await r.json()).product : { status: r.status }; };
  const slugs = n => { const s = n.toLowerCase().replace(/['’]/g, "").replace(/[åä]/g, "a").replace(/ö/g, "o").replace(/%/g, ""); return [...new Set([s.replace(/[^a-z0-9]+/g, "-"), s.replace(/\./g, "").replace(/[^a-z0-9]+/g, "-")].map(v => v.replace(/^-+|-+$/g, "")))]; };
  const res = { bases: {}, packages: {} };
  for (const [id, slug] of Object.entries(bases)) {
    const P = await st(+id);
    res.bases[id] = { slug, name: P.name, options: (P.options || []).map(o => o.name), variants: (P.variants || []).map(v => ({ id: v.id, opt: (v.option_values || []).map(o => o.name).join("/"), price: v.price && v.price.formatted_price, stock: v.available_stock, track: v.track_inventory, buyable: v.buyable, img: v.image_id })) };
  }
  for (const id of [270, 271, 272, 273, 274, 275, 276, 277]) {
    const P = await st(id); const v = P.variants && P.variants[0];
    const r = { name: P.name, is_package: P.is_package, variant: v && v.id, sku: v && v.sku, price: v && v.price && v.price.formatted_price, buyable: v && v.buyable };
    for (const s of slugs(P.name || "")) {
      const rr = await fetch("/sv/products/" + s, { credentials: "same-origin", headers: { Accept: "text/html" } });
      if (!rr.ok) continue;
      const html = await rr.text(); const doc = new DOMParser().parseFromString(html, "text/html");
      const at = (e, n) => e.getAttribute(n) != null ? e.getAttribute(n) : e.getAttribute(":" + n);
      r.route = "/sv/products/" + s; r.viewProduct = (html.match(/viewProduct\(.(\d+)/) || [])[1];
      r.rows = [...doc.querySelectorAll("package-product-variants, package-product")].map(e => ({ tag: e.tagName.toLowerCase(), product: +at(e, "product-id"), pivot: +at(e, "pivot-id"), locked: at(e, "locked-variant"), qty: +(at(e, "quantity") || 1) }));
      break;
    }
    res.packages[id] = r;
  }
  return res;
}, { bases: { 254: slugOf(254), 236: slugOf(236), 242: slugOf(242), 256: slugOf(256) } });
out.checkedAt = new Date().toISOString();
fs.writeFileSync(path.join(DIR, "probe-d10-faraoh.json"), JSON.stringify(out, null, 2));
for (const [id, r] of Object.entries(out.bases)) console.log("BAS", id, r.slug, "|", r.name, r.options, r.variants.map(v => `${v.id}:${v.opt}:${v.price}:${v.stock}:${v.buyable}`).join(" "));
for (const [id, r] of Object.entries(out.packages)) console.log("PKG", id, r.name, r.is_package, r.variant, r.sku, r.price, r.buyable, r.route, (r.rows || []).map(x => `${x.tag[16] ? "V" : "L"}${x.product}/p${x.pivot}/${x.locked}/q${x.qty}`).join(" "));
await b.close();
