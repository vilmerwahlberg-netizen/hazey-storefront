import { chromium, ctxFor, open, ready } from "../../catalog-reconciliation-2026-11/lib/harness.mjs";
const b = await chromium.launch(); const ctx = await ctxFor(b, 1440, 1000, { which: "after" });
const p = await open(ctx, "/sv/categories/alla-vapes"); await ready(p, 2000);
console.log(JSON.stringify(await p.evaluate(async () => {
  const fam = window.HZ8.catalog.familyFormats("vapes").map(f => ({ key: f.key, href: f.href }));
  const names = async r => { const out = []; for (let pg = 1; pg < 6; pg++) { const d = new DOMParser().parseFromString(await (await fetch(r + (pg > 1 ? "?page=" + pg : ""))).text(), "text/html"); const cs = [...d.querySelectorAll("#category-products .product-card")]; cs.forEach(c => out.push({ n: c.querySelector(".name").textContent.trim(), p: new URL(c.querySelector("a[href*='/products/']").href).pathname })); if (cs.length < 25) break; } return out; };
  const ms = await names("/sv/categories/ms-vapes");
  const vf = fam.find(f => f.key === "vapes"); const vset = new Set((await names(new URL(vf.href, location.origin).pathname)).map(x => x.p));
  return { fam, ms: ms.map(x => ({ ...x, inVapesFormat: vset.has(x.p), type: window.HZ8.cardTypeOf ? window.HZ8.cardTypeOf(x.n) : null, vol: window.HZ8.pilotVolume ? (window.HZ8.pilotVolume(x.n) || {}).key : null })) };
}), null, 1));
await b.close();
