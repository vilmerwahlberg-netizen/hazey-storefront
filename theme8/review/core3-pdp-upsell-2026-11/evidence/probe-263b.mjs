// TASK 20: paketrader ur serverrenderad HTML (som loadPivots läser) + 255:s bilder per variant. Läsande.
import fs from "node:fs"; import path from "node:path";
import { chromium, ctxFor, open, ready } from "../../catalog-reconciliation-2026-11/lib/harness.mjs";
const DIR = path.dirname(new URL(import.meta.url).pathname);
const b = await chromium.launch(); const ctx = await ctxFor(b, 1440, 1000, { which: "external" });
const p = await open(ctx, "/sv/products/thc-x-vape-hero-core-2ml"); await ready(p, 1500);
const out = await p.evaluate(async () => {
  const html = await (await fetch("/sv/products/pilot-t19-heros-core-2ml-3-pack", { credentials: "same-origin", headers: { Accept: "text/html" } })).text();
  const doc = new DOMParser().parseFromString(html, "text/html");
  const rows = [...doc.querySelectorAll("package-product-variants, package-product")].map(e => ({ tag: e.tagName.toLowerCase(), attrs: Object.fromEntries([...e.attributes].map(a => [a.name, a.value])) }));
  const x = decodeURIComponent((document.cookie.match(/XSRF-TOKEN=([^;]+)/) || [])[1] || "");
  const H = { Accept: "application/json", "Content-Type": "application/json", "X-Requested-With": "XMLHttpRequest", "X-XSRF-TOKEN": x };
  const base = await (await fetch("/frontend-api/product/state", { method: "POST", credentials: "same-origin", headers: H, body: JSON.stringify({ product_id: 255, variant_ids: [null] }) })).json();
  return { rows, images: JSON.stringify(base.product.images).slice(0, 2500), imageIds: base.product.variants.map(v => [v.id, v.image_id]), hz8: !!window.HZ8, pdpImgs: [...document.querySelectorAll(".product-detail img, .hz8-pp img")].slice(0, 12).map(i => i.currentSrc || i.src) };
});
fs.writeFileSync(path.join(DIR, "probe-263-rows.json"), JSON.stringify(out, null, 2)); console.log(JSON.stringify(out, null, 1));
await b.close();
