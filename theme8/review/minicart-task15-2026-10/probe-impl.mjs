// TASK 15 implementation probe (read-only): kupong-API, tilläggskandidater, Faraoh-varianter.
import { chromium, ctxFor, open, productState, DIR } from "./lib.mjs"; import fs from "node:fs";
const b = await chromium.launch(); const ctx = await ctxFor(b, 1440, 900);
const p = await open(ctx, "/sv/products/vape-thc-a-45-faraoh-2ml");
const R = {};
R.scripts = await p.evaluate(() => [...document.scripts].map(s => s.src).filter(Boolean));
R.couponSrc = await p.evaluate(async () => {
  const out = [];
  for (const s of [...document.scripts].map(s => s.src).filter(u => /nyehandel|foundation|app|vendor/i.test(u) && !/theme8/.test(u))) {
    try { const t = await (await fetch(s)).text(); const re = /.{0,260}(coupon|discount-code|discountCode|campaign-code).{0,260}/gi; let m, n = 0; while ((m = re.exec(t)) && n < 25) { out.push(s.split("/").pop() + ": " + m[0]); n++; } } catch (e) { out.push("ERR " + s); }
  }
  return out;
});
R.pid = await p.evaluate(() => +(document.documentElement.innerHTML.match(/viewProduct\(.(\d+)/) || [])[1] || 0);
const st = await productState(p, R.pid);
R.faraoh = { name: st.product.name, is_package: st.product.is_package, variants: st.product.variants.map(v => ({ id: v.id, opt: (v.option_values||[]).map(o=>o.name).join(","), stock: v.available_stock, track: v.track_inventory, price: v.price && v.price.formatted_price, tiers: (v.prices||[]).map(x=>x.price.tier+":"+x.price.formatted_price), img: v.image ? (v.image.thumb_url||"").slice(0,60) : null })) , keys: Object.keys(st.product) };
R.search = await p.evaluate(async () => { const r = await fetch("/sv/search?q=pre-roll"); const t = await r.text(); return [...new Set((t.match(/\/sv\/products\/[a-z0-9\-]+/g) || []))].slice(0, 30); });
R.nav = await p.evaluate(() => (HZ8.navCategories || []).map(c => c.label + " " + c.href));
fs.writeFileSync(`${DIR}/runs/probe-impl.json`, JSON.stringify(R, null, 1));
console.log(JSON.stringify(R, null, 1).slice(0, 12000));
await b.close();
