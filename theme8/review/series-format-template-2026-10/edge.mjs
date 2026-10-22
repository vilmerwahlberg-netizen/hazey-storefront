// Kantfall: trasig produktbild, blockerad seriebild, slutsåld, saknat betyg. node edge.mjs
import { chromium, ctxFor, open, URL_ } from "../pdp-pilot-2026-10/lib.mjs";
const b = await chromium.launch(); let fails = 0;
const ok = (n, c, d) => { console.log(c ? "PASS" : "FAIL", n, JSON.stringify(d).slice(0, 400)); if (!c) fails++; };
const errs = p => p.errors.filter(e => !/Failed to load|429|net::/.test(e));
// 1. Produktbilder 404 + R3-seriebilder blockerade.
{ const ctx = await ctxFor(b, 1440, 900, {});
  await ctx.route(/cloudfront\.net\//, r => r.request().resourceType() === "image" ? r.fulfill({ status: 404, body: "" }) : r.continue());
  await ctx.route(/series-format-r3\/series-/, r => r.fulfill({ status: 404, body: "" }));
  const p = await open(ctx, URL_("/sv/categories/m-s-vapes")); await p.waitForTimeout(11000);
  await p.evaluate(async () => { for (let y = 0; y < document.body.scrollHeight; y += 500) { scrollTo(0, y); await new Promise(r => setTimeout(r, 120)); } }); await p.waitForTimeout(1200);
  const r = await p.evaluate(() => ({ cards: [...document.querySelectorAll("#category-products .product-card")].map(c => ({ broken: c.querySelector(".product-card__image").classList.contains("hz8-img-broken"), h: Math.round(c.getBoundingClientRect().height), well: Math.round(c.querySelector(".product-card__image").getBoundingClientRect().height) })),
    series: [...document.querySelectorAll(".hz8-sf-serie")].map(a => ({ bgColor: getComputedStyle(a).backgroundColor, color: getComputedStyle(a.querySelector(".hz8-sf-serie__name")).color, art: a.getAttribute("data-hz8-series-art") })), ov: document.documentElement.scrollWidth - innerWidth }));
  ok("edge-broken-product-image", r.cards.length && r.cards.every(c => c.broken && c.well > 200) && new Set(r.cards.map(c => c.h)).size === 1, r.cards);
  ok("edge-series-art-missing-readable", r.series.length && r.series.filter(s => s.art).every(s => s.bgColor === "rgb(38, 48, 27)" && /255, 250, 240/.test(s.color)) && r.ov === 0 && !errs(p).length, r.series);
  await ctx.close(); }
// 2. Slutsåld + saknat betyg + långa namn på riktiga sidor (alla bredder i huvudsviten).
for (const path of ["/sv/categories/thca-vapes", "/sv/categories/thca-blommor", "/sv/categories/hhcpm-blommor"]) for (const [w, h] of [[1440, 900], [393, 852]]) {
  const ctx = await ctxFor(b, w, h, {}); const p = await open(ctx, URL_(path)); await p.waitForTimeout(11000);
  const r = await p.evaluate(() => { const cards = [...document.querySelectorAll("#category-products .product-card")]; const rows = {};
    cards.forEach(c => { const t = Math.round(c.getBoundingClientRect().top); (rows[t] = rows[t] || []).push(Math.round(c.getBoundingClientRect().bottom)); });
    return { n: cards.length, soldout: cards.filter(c => c.classList.contains("hz8-is-soldout")).length, soldPill: cards.filter(c => c.classList.contains("hz8-is-soldout") && c.querySelector(".hz8-psold")).length, noRating: cards.filter(c => !c.querySelector(".rating *")).length,
      longName: Math.max(...cards.map(c => (c.querySelector(".name") || {}).textContent.trim().length)), nameClip: cards.filter(c => { const n = c.querySelector(".name"); return n && n.scrollHeight > n.clientHeight + 2 && getComputedStyle(n).webkitLineClamp === "none"; }).length,
      rowsAligned: Object.values(rows).every(b => new Set(b).size === 1), ctaOverlap: cards.filter(c => { const n = c.querySelector(".name").getBoundingClientRect(), a = c.querySelector(".hz8-card-pill, .hz8-psold"); if (!a) return false; const ar = a.getBoundingClientRect(); return ar.width && n.bottom > ar.top; }).length, ov: document.documentElement.scrollWidth - innerWidth }; });
  ok(`edge-cards-${path.split("/").pop()}-${w}`, r.n > 0 && r.soldout === r.soldPill && r.rowsAligned && !r.ctaOverlap && !r.nameClip && r.ov === 0 && !errs(p).length, r);
  await ctx.close(); }
console.log("FAILS", fails); await b.close();
