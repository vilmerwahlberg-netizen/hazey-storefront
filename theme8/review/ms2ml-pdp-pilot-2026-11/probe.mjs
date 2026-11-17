// Läser produktens riktiga data i Theme 8-previewn (ingen skrivning).
import { chromium, ctxFor, open, URL_ } from "../pdp-pilot-2026-10/lib.mjs";
import fs from "node:fs"; import path from "node:path";
const DIR = path.dirname(new URL(import.meta.url).pathname);
const browser = await chromium.launch({ channel: "chrome", headless: true });
const ctx = await ctxFor(browser, 1440, 900, { local: false });
const p = await open(ctx, URL_("/sv/products/vape-magic-sauce-magic-farmers-2ml/454"));
await p.waitForTimeout(4000);
const d = await p.evaluate(async () => {
  const id = +(document.documentElement.innerHTML.match(/viewProduct\(.(\d+)/) || [])[1];
  const st = await fetch("/frontend-api/product/state", { method: "POST", credentials: "same-origin", headers: (()=>{const m=document.cookie.match(/(?:^|;\s*)XSRF-TOKEN=([^;]+)/);const h={"Content-Type":"application/json",Accept:"application/json","X-Requested-With":"XMLHttpRequest"};if(m)h["X-XSRF-TOKEN"]=decodeURIComponent(m[1]);return h;})(), body: JSON.stringify({ product_id: id, variant_ids: [null] }) }).then(r => r.json());
  const rv = await fetch("/frontend-api/product-reviews/" + id, { credentials: "same-origin", headers: { Accept: "application/json" } }).then(r => r.text()).catch(e => String(e));
  return {
    id, title: document.title, meta: document.querySelector('meta[name=description]')?.content, canonical: document.querySelector('link[rel=canonical]')?.href,
    ld: [...document.querySelectorAll('script[type="application/ld+json"]')].map(s => s.textContent.slice(0, 1500)),
    shortDesc: document.querySelector(".product-detail__information .short-description")?.innerHTML,
    article: (document.querySelector("article.product-description, .product-description, #product-information")||{}).innerHTML,
    related: [...document.querySelectorAll(".related-categories a")].map(a => [a.textContent.trim(), a.getAttribute("href")]),
    brand: document.querySelector(".product-detail__information .brand a")?.getAttribute("href"),
    reviewsBtn: document.querySelector(".accordion-button#product-reviews")?.textContent,
    reviewsApi: rv.slice(0, 400),
    variants: ((st.product||{}).variants || []).map(v => ({ id: v.id, sku: v.sku, opts: (v.option_values || []).map(o => o.name).join("/"), stock: v.available_stock, track: v.track_inventory, always: v.always_orderable, img: (v.images || [])[0]?.url || (v.image && v.image.url) })),
    keys: Object.keys(st.product||st)
  };
});
fs.writeFileSync(path.join(DIR, "probe.json"), JSON.stringify(d, null, 1));
console.log(JSON.stringify(d, null, 1));
await browser.close();
