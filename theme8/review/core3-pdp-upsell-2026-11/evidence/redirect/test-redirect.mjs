// TASK 20 v5 — paketsidornas omdirigering i Theme 8 (lokal build, Theme 8-preview). Per paket:
// A navigering med pilotflagga -> basens PDP + förvald storlek; B utan flagga; C ?hz8-pkg-direct=1; D bakåtknappen;
// E byggarens HTML-hämtning (fetch, ingen omdirigering) + riktigt köp + minicartens länk; korgen töms. Ingen order.
// Kör: node redirect/test-redirect.mjs [paket-id-regex]   VP=393 för mobil.
import fs from "node:fs"; import path from "node:path";
import { chromium, ctxFor, open, ready, url } from "../../../catalog-reconciliation-2026-11/lib/harness.mjs";
const DIR = path.dirname(new URL(import.meta.url).pathname);
const PK = [
  { id: 263, variant: 467, qty: 3, price: "1 920 kr", route: "/sv/products/pilot-t19-heros-core-2ml-3-pack", home: "/sv/products/thc-x-vape-hero-core-2ml", pick: "Gelato - Indica" },
  { id: 265, variant: 469, qty: 5, price: "3 135 kr", route: "/sv/products/heros-core-2ml-5-pack-blandbart", home: "/sv/products/thc-x-vape-hero-core-2ml", pick: "Melon Haze" },
  { id: 266, variant: 470, qty: 3, price: "1 599 kr", route: "/sv/products/magic-sauce-30-2ml-3-pack-blandbart", home: "/sv/products/vape-magic-sauce-magic-farmers-2ml", pick: "Gorilla Cookies" },
  { id: 267, variant: 471, qty: 5, price: "2 530 kr", route: "/sv/products/magic-sauce-30-2ml-5-pack-blandbart", home: "/sv/products/vape-magic-sauce-magic-farmers-2ml", pick: "Gorilla Cookies" },
  { id: 268, variant: 472, qty: 3, price: "2 950 kr", route: "/sv/products/magic-sauce-30-5ml-3-pack-blandbart", home: "/sv/products/magic-sauce-vape-5ml", pick: "Kowa Bunga" },
  { id: 269, variant: 473, qty: 5, price: "4 450 kr", route: "/sv/products/magic-sauce-30-5ml-5-pack-blandbart", home: "/sv/products/magic-sauce-vape-5ml", pick: "Bruce Banner OG" }
];
const VP = +(process.env.VP || 1440), MOBILE = VP < 768;
const UA = "Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Mobile Safari/537.36";
const sp = t => String(t || "").replace(/[  ]/g, " ").trim();
/* Målas paketsidan? rAF-logg per dokument i sessionStorage (överlever navigeringen). */
const PAINT = () => {
  const key = "hz8-paintlog"; const path = location.pathname; let painted = false;
  const tick = () => { const b = document.body, h = document.documentElement; if (b) { const cs = getComputedStyle(b); if (cs.visibility !== "hidden" && +cs.opacity > 0 && !h.classList.contains("hz8-boot") && !h.classList.contains("hz8-redirecting")) painted = true; } requestAnimationFrame(tick); };
  requestAnimationFrame(tick);
  addEventListener("pagehide", () => { try { const L = JSON.parse(sessionStorage.getItem(key) || "[]"); L.push({ path, painted, redirecting: document.documentElement.classList.contains("hz8-redirecting") }); sessionStorage.setItem(key, JSON.stringify(L)); } catch (e) { } });
};
const api = (p, method, u, body) => p.evaluate(async ({ method, u, body }) => {
  const x = decodeURIComponent((document.cookie.match(/XSRF-TOKEN=([^;]+)/) || [])[1] || "");
  const r = await fetch("/frontend-api/" + u, { method, credentials: "same-origin", headers: { Accept: "application/json", "Content-Type": "application/json", "X-Requested-With": "XMLHttpRequest", "X-XSRF-TOKEN": x }, body: body ? JSON.stringify(body) : undefined });
  let j = null; try { j = await r.json(); } catch { } return { status: r.status, json: j };
}, { method, u, body });
const only = process.argv[2] ? new RegExp(process.argv[2]) : null;
const b = await chromium.launch(); const all = {};
for (const P of PK) {
  if (only && !only.test(String(P.id))) continue;
  const R = all[P.id] = {};
  const ctx = await ctxFor(MOBILE ? { newContext: o => b.newContext({ ...o, userAgent: UA }) } : b, VP, MOBILE ? 852 : 1000, { which: "after" });
  await ctx.addInitScript(PAINT);
  // D: kategori -> paketsida (vanlig navigering) -> bakåt.
  const p = await open(ctx, "/sv/categories/alla-vapes?hz8-pkg-pilot=1"); await ready(p, 1500);
  try { await p.getByRole("button", { name: "Godkänn alla" }).click({ timeout: 2000 }); } catch { }
  const navs = []; p.on("framenavigated", f => { if (f === p.mainFrame()) navs.push(new URL(f.url()).pathname); });
  // A: med pilotflagga
  await p.goto(url(P.route + "?hz8-pkg-pilot=1"), { waitUntil: "domcontentloaded" });
  await p.waitForURL(u => new URL(u).pathname.startsWith(P.home), { timeout: 30000 }).catch(() => { });
  await ready(p, 2500);
  const u1 = new URL(p.url());
  R.A = { finalPath: u1.pathname, query: u1.search, navs: navs.slice() };
  R.A.selected = await p.locator(`.hz8-pc[data-qty="${P.qty}"][aria-checked="true"]`).waitFor({ timeout: 25000 }).then(() => true, () => false);
  R.A.builder = await p.evaluate(() => { const e = document.querySelector(".hz8-up"); return e && !e.hidden ? (document.querySelector(".hz8-up__title") || {}).textContent : null; });
  await p.goBack({ waitUntil: "domcontentloaded" }); await p.waitForTimeout(1500);
  R.D = { backPath: new URL(p.url()).pathname };
  R.paint = await p.evaluate(() => JSON.parse(sessionStorage.getItem("hz8-paintlog") || "[]"));
  // B: utan flagga (ny flik i samma kontext; sessionStorage-flaggan nollas med =0)
  const p2 = await ctx.newPage(); await p2.goto(url(P.route + "?hz8-pkg-pilot=0"), { waitUntil: "domcontentloaded" });
  await p2.waitForURL(u => new URL(u).pathname.startsWith(P.home), { timeout: 30000 }).catch(() => { }); await ready(p2, 1500);
  const u2 = new URL(p2.url());
  R.B = { finalPath: u2.pathname, query: u2.search, choice: await p2.locator(".hz8-pp__choice").count() };
  // C: undantaget
  await p2.goto(url(P.route + "?hz8-pkg-direct=1"), { waitUntil: "domcontentloaded" }); await ready(p2, 1500);
  R.C = { finalPath: new URL(p2.url()).pathname };
  await p2.close();
  // E: byggarens HTML-hämtning (som loadPivots) + köp + minicartens länk
  await p.goto(url(P.home + "?hz8-pkg-pilot=1&hz8-pack=" + P.qty), { waitUntil: "domcontentloaded" }); await ready(p, 2500);
  R.E = {};
  R.E.fetch = await p.evaluate(async route => { const r = await fetch(route, { credentials: "same-origin", headers: { Accept: "text/html" } }); const h = await r.text(); return { status: r.status, redirected: r.redirected, url: new URL(r.url).pathname, rows: (h.match(/<package-product-variants/g) || []).length }; }, P.route);
  R.E.pivots = await p.evaluate(() => (window.HZ8.packageUpsells ? window.HZ8.packageUpsells() : null));
  await p.locator(`.hz8-pc[data-qty="${P.qty}"][aria-checked="true"]`).waitFor({ timeout: 25000 }).catch(() => { });
  const posts = []; p.on("request", rq => { if (/\/frontend-api\/cart\/item$/.test(rq.url()) && rq.method() === "POST") { try { posts.push(JSON.parse(rq.postData())); } catch { } } });
  for (let i = 0; i < P.qty; i++) { await p.locator(`.hz8-up select[data-upslot="${i}"]`).selectOption({ label: P.pick }); await p.waitForTimeout(150); }
  await p.locator(".hz8-pp__cta").click(); await p.waitForTimeout(5000);
  R.E.posts = posts.map(x => [x.product_variant_id, (x.meta.data.packageProductVariants || []).map(y => y.pivot_id).join(",")]);
  const c = await api(p, "GET", "cart"); R.E.cart = (c.json.data.items || []).map(i => [i.variant_id, sp(i.formatted_total), (i.package_items || []).length]);
  // minicartens länk till paketraden -> ska landa på basens PDP
  await p.evaluate(() => window.HZ8.store().dispatch("cart/reload").then(() => window.HZ8.store().dispatch("cart/open"))); await p.waitForTimeout(3000);
  const link = p.locator("#cartAside article.item .content a").first();
  R.E.minicartHref = await link.getAttribute("href").catch(() => null);
  await link.click().catch(() => { });
  await p.waitForURL(u => new URL(u).pathname.startsWith(P.home), { timeout: 30000 }).catch(() => { }); await p.waitForTimeout(1500);
  R.E.afterMinicartLink = new URL(p.url()).pathname + new URL(p.url()).search.replace(/preview=[^&]+&?/, "");
  for (const it of ((await api(p, "GET", "cart")).json.data.items || [])) await api(p, "DELETE", "cart/item/" + it.id);
  R.cleaned = (await api(p, "GET", "cart")).json.data.items.length === 0;
  R.errors = p.errors.filter(e => !/trustpilot|gtm|google|Failed to load resource/i.test(e)).slice(0, 5);
  const pkgPaint = R.paint.filter(x => x.path === P.route);
  const atHome = x => x === P.home || x.startsWith(P.home + "/");
  R.pass = atHome(R.A.finalPath) && /hz8-pack=/.test(R.A.query) && /preview=/.test(R.A.query) && R.A.selected && R.D.backPath === "/sv/categories/alla-vapes"
    && pkgPaint.length >= 1 && pkgPaint.every(x => !x.painted && x.redirecting) && atHome(R.B.finalPath) && !/hz8-pack=/.test(R.B.query) && R.B.choice === 0 && R.C.finalPath === P.route
    && R.E.fetch.status === 200 && !R.E.fetch.redirected && R.E.fetch.rows === P.qty && R.E.posts.length === 1 && R.E.posts[0][0] === P.variant && R.E.cart.length === 1 && R.E.cart[0][0] === P.variant && R.E.cart[0][1] === P.price
    && /^\/sv\/products\//.test(R.E.afterMinicartLink) && R.E.afterMinicartLink.startsWith(P.home) && R.cleaned && !R.errors.length;
  console.log(`\n### ${P.id}-${VP}: ${R.pass ? "PASS" : "FAIL"}`); console.log(JSON.stringify(R));
  await ctx.close();
}
fs.writeFileSync(path.join(DIR, "redirect-" + (process.argv[2] || "all").replace(/\W+/g, "_") + "-" + VP + ".json"), JSON.stringify(all, null, 1));
await b.close();
