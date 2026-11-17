// Kartläggning av Hero's Core 2 ml (produkt 255) i Theme 8-previewn. Bara läsande:
// serverns HTML (utan JS), product/state, omdömen, paket, bilder, PDF:er.
// node map.mjs  -> map.json
import { chromium, ctxFor, open, URL_ } from "../pdp-pilot-2026-10/lib.mjs";
import fs from "node:fs"; import path from "node:path";
const DIR = path.dirname(new URL(import.meta.url).pathname);
const ROUTE = "/sv/products/thc-x-vape-hero-core-2ml";
const raw = await (await fetch("https://hazeyse.nyehandel.se" + ROUTE)).text();
const rawInfo = {
  bytes: raw.length,
  viewProduct: (raw.match(/viewProduct\('(\d+)'\)/) || [])[1],
  title: (raw.match(/<title>([^<]*)/) || [])[1]?.trim(),
  meta: (raw.match(/<meta name="description" content="([^"]*)"/) || [])[1],
  canonical: (raw.match(/<link rel="canonical" href="([^"]*)"/) || [])[1],
  robots: (raw.match(/<meta name="robots" content="([^"]*)"/) || [])[1],
  headings: [...raw.matchAll(/<h([1-6])[^>]*>([\s\S]*?)<\/h\1>/g)].map(m => "H" + m[1] + " " + m[2].replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim()).filter(h => h.length > 3),
  pdfs: [...new Set([...raw.matchAll(/href="([^"]+\.pdf)"/gi)].map(m => m[1]))],
  ld: [...raw.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map(m => { try { return JSON.parse(m[1]); } catch { return m[1].slice(0, 400); } })
};
const b = await chromium.launch({ channel: "chrome", headless: true });
const ctx = await ctxFor(b, 1440, 900, { local: false });
const p = await open(ctx, URL_(ROUTE));
await p.waitForSelector(".hz8-pp", { timeout: 30000 }); await p.waitForTimeout(4000);
const d = await p.evaluate(async () => {
  const H = (() => { const m = document.cookie.match(/(?:^|;\s*)XSRF-TOKEN=([^;]+)/); const h = { "Content-Type": "application/json", Accept: "application/json", "X-Requested-With": "XMLHttpRequest" }; if (m) h["X-XSRF-TOKEN"] = decodeURIComponent(m[1]); return h; })();
  const id = +(document.documentElement.innerHTML.match(/viewProduct\(.(\d+)/) || [])[1];
  const st = await fetch("/frontend-api/product/state", { method: "POST", credentials: "same-origin", headers: H, body: JSON.stringify({ product_id: id, variant_ids: [null] }) }).then(r => r.json());
  const rv = await fetch("/frontend-api/product-reviews/" + id, { credentials: "same-origin", headers: H }).then(r => r.json()).catch(e => String(e));
  const P = st.product || {};
  const art = document.querySelector(".product-description, #product-information, article") || document.createElement("div");
  const pk = (window.HZ8 && HZ8.packageTable && HZ8.packageTable[id]) || null;
  const packs = [];
  for (const e of (pk ? pk.packs : [])) {
    const s = await fetch("/frontend-api/product/state", { method: "POST", credentials: "same-origin", headers: H, body: JSON.stringify({ product_id: e.packageId, variant_ids: [null] }) }).then(r => r.json()).catch(() => ({}));
    packs.push({ qty: e.qty, packageId: e.packageId, route: e.route, name: s.product?.name, is_package: s.product?.is_package, price: (s.product?.variants || [])[0]?.price?.formatted_price });
  }
  return {
    id, name: P.name, brand: document.querySelector(".product-detail__information .brand a")?.textContent.trim(), brandHref: document.querySelector(".product-detail__information .brand a")?.getAttribute("href"),
    options: (P.options || []).map(o => ({ name: o.name, values: (o.values || []).map(v => v.name) })),
    variants: (P.variants || []).map(v => ({ id: v.id, sku: v.sku, strain: (v.option_values || []).map(o => o.name).join("/"), stock: v.available_stock ?? v.stock, buyable: v.purchasable ?? v.is_purchasable, price: v.price?.formatted_price, img: ((v.images || [])[0] || {}).url || v.image?.url || null, imgs: (v.images || []).length })),
    productImages: (P.images || []).map(i => i.url || i).slice(0, 20),
    gallery: [...document.querySelectorAll(".product-detail__media img")].map(i => i.currentSrc || i.src).filter((x, i, a) => a.indexOf(x) === i).slice(0, 20),
    shortDesc: document.querySelector(".product-detail__information .short-description")?.innerText.trim(),
    shortDescHtml: document.querySelector(".product-detail__information .short-description")?.innerHTML,
    articleText: art.innerText, articleHtml: art.innerHTML,
    productInfo: [...document.querySelectorAll(".product-information li, .product-info li, dl div")].map(e => e.innerText.replace(/\s+/g, " ").trim()).slice(0, 30),
    related: [...document.querySelectorAll(".related-categories a")].map(a => [a.textContent.trim(), a.getAttribute("href")]),
    breadcrumbs: [...document.querySelectorAll(".breadcrumb a, nav[aria-label*=read] a")].map(a => a.textContent.trim()),
    reviews: Array.isArray(rv) ? rv.length : (rv && rv.data ? rv.data.length : rv),
    packs, authored: document.documentElement.classList.contains("hz8-pdp-authored")
  };
});
const out = { route: ROUTE, raw: rawInfo, live: d, at: new Date().toISOString() };
fs.writeFileSync(path.join(DIR, "map.json"), JSON.stringify(out, null, 1));
await p.screenshot({ path: path.join(DIR, "fore-1440-topp.jpg"), type: "jpeg", quality: 75 });
console.log(JSON.stringify({ ...out, live: { ...d, articleHtml: undefined, shortDescHtml: undefined } }, null, 1).slice(0, 14000));
await b.close();
