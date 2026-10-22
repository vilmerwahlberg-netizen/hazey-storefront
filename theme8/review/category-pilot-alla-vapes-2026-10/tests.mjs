// Funktionell verifiering av piloten. node tests.mjs [local|external]
import { chromium, ctxFor, open, URL_, DIR } from "./lib.mjs"; import fs from "node:fs";
const local = (process.argv[2] || "local") !== "external";
const b = await chromium.launch(); const R = {}; const fail = [];
const ok = (name, cond, info) => { R[name] = { pass: !!cond, info }; if (!cond) fail.push(name); console.log((cond ? "PASS " : "FAIL ") + name, info !== undefined ? JSON.stringify(info).slice(0, 300) : ""); };
async function page(w, h, q = "", opt = {}) {
  const ctx = await ctxFor(b, w, h, { local, reduced: opt.reduced, scale: opt.scale });
  if (opt.setup) await opt.setup(ctx);
  const p = await open(ctx, URL_(undefined, q));
  await p.waitForSelector(".hz8-ptool", { timeout: 60000 }); await p.waitForTimeout(opt.wait || 6500);
  if (!opt.noUnion) await p.waitForSelector(".hz8-series-results .product-card, .hz8-series-results .hz8-cat-empty, .hz8-series-status.has-action", { timeout: 25000 }).catch(() => {});
  return { p, ctx };
}
const basic = p => p.evaluate(() => ({ ov: document.documentElement.scrollWidth - innerWidth, h1: document.querySelectorAll("h1").length,
  mode: getComputedStyle(document.querySelector(".hz8-ptool__mob")).display !== "none" ? "mobile" : "desktop",
  cols: getComputedStyle(document.querySelector(".hz8-series-results__grid")).gridTemplateColumns.split(" ").length,
  small: [...document.querySelectorAll(".hz8-ptool button, .hz8-pchips button, .hz8-pguide button, .hz8-pseries a, .hz8-pseries button, .hz8-series-results .hz8-card-pill, .hz8-series-results .hz8-psold")].filter(e => e.offsetParent).map(e => { const r = e.getBoundingClientRect(); const ext = parseFloat(getComputedStyle(e, "::after").height) || 0; return { t: (e.textContent || e.getAttribute("aria-label")).trim().slice(0, 20), w: Math.round(r.width), h: Math.round(Math.max(r.height, getComputedStyle(e, "::after").position === "absolute" ? ext : 0)) }; }).filter(r => r.h < 44 || r.w < 44) }));

// v9: volymparser för det migrerade sortimentet (1/2 ml carts, 2/5 ml vapes, 10 ml refill)
{ const { p, ctx } = await page(1440, 900);
  const v = await p.evaluate(() => ["Cart - THCa 90% - Core - 1ml", "Cart - THCa 90% - Core - 2 ml", "Vape - HHC - Core - 2ml", "Vape - THCa - Hero - 5ml", "Refill - THCa - Core - 10ml", "Refill - X - 10 ml", "Vape Dual - CBD - 1+1ml", "Vape - utan volym"].map(n => { const r = window.HZ8.pilotVolume(n); return r ? r.key : null; }));
  ok("v9-volume-parser", v.join() === "1ml,2ml,2ml,5ml,10ml,10ml,1+1ml,", v);
  const glass = await p.evaluate(() => { const g = getComputedStyle(document.querySelector(".hz8-pguide")); const c = getComputedStyle(document.querySelector(".hz8-pguide__cta")); return { blur: g.backdropFilter, radius: parseFloat(g.borderTopLeftRadius), border: g.borderTopColor, shadow: g.boxShadow, before: getComputedStyle(document.querySelector(".hz8-pguide"), "::before").backgroundImage.includes("radial-gradient"), ctaBase: c.backgroundColor, ctaRadius: parseFloat(c.borderTopLeftRadius) }; });
  ok("v9-quiz-glass", /blur\(18px\) saturate\(1\.05\)/.test(glass.blur) && glass.radius >= 14 && glass.radius <= 18 && glass.border === "rgba(255, 253, 248, 0.28)" && glass.before && !/rgb\(0, 0, 0/.test(glass.shadow) && glass.ctaRadius === 8, glass);
  await ctx.close(); }
for (const [w, h, want] of [[393, 852, "category-vapes-sunset-v4-mobile.webp"], [1512, 982, "category-vapes-sunset-v4-1512.webp"], [1920, 1080, "category-vapes-sunset-v4-1920.webp"]]) {
  const got = []; const { p, ctx } = await page(w, h, "", { setup: async c => c.on("request", r => { const m = r.url().match(/category-vapes-(?:sunset|coast)-[\w-]+\.webp/); if (m) got.push(m[0]); }) });
  await p.evaluate(() => scrollTo(0, document.body.scrollHeight)); await p.waitForTimeout(1500);
  const u = [...new Set(got)];
  ok(`v9-one-hero-asset-${w}`, u.length === 1 && u[0] === want, u);
  await ctx.close(); }

// 1. Bredder + 200 % zoom
for (const [w, h, label, scale] of [[320, 700], [390, 844], [393, 852], [430, 932], [768, 1024], [1024, 768], [1440, 900], [1920, 1080], [720, 450, "1440@200%", 2]]) {
  const { p, ctx } = await page(w, h, "", { scale });
  const r = await basic(p);
  const scrolled = await p.evaluate(async () => { for (let y = 0; y < document.body.scrollHeight; y += 600) { scrollTo(0, y); await new Promise(r => setTimeout(r, 30)); } return document.documentElement.scrollWidth - innerWidth; });
  ok(`width-${label || w}`, r.ov === 0 && scrolled === 0 && r.h1 === 1 && (w >= 768 || r.small.length === 0) && r.cols === (w < 768 || label ? 2 : w < 1024 ? 3 : w < 1600 ? 4 : 5), { ...r, scrolled });
  if (label) await p.screenshot({ path: `${DIR}/review-zoom-200.png` });
  await ctx.close();
}

// 1b. Designkrav: inga missvisande antal, ingen THCNM, ingen funktionslös Produkttyp, CTA-former, sökning
{ const { p, ctx } = await page(1440, 900);
  const d = await p.evaluate(() => {
    const radius = s => { const e = document.querySelector(s); return e ? parseFloat(getComputedStyle(e).borderTopLeftRadius) : null; };
    const txt = document.querySelector(".hz8-ptool").textContent + document.querySelector("#hz8-pfilter").textContent + (document.querySelector(".hz8-pseries")?.textContent || "") + document.querySelector(".hz8-pguide").textContent;
    return {
      seriesCounts: [...document.querySelectorAll("[data-hz8-series] .hz8-popt__count")].map(e => e.textContent).filter(Boolean),
      thcnm: /thc-?nm|hhc-?pm|\bD10\b|10-OH/i.test(txt),
      decor: (() => { const d = document.querySelector(".hz8-pdecor"); return !!d && d.getAttribute("aria-hidden") === "true" && getComputedStyle(d).pointerEvents === "none" && !!d.querySelector("svg textPath"); })(),
      countPill: (() => { const c = document.querySelector(".hz8-pcount"); const cs = getComputedStyle(c); return cs.backgroundColor !== "rgba(0, 0, 0, 0)" || parseFloat(cs.borderTopLeftRadius) > 0; })(),
      heroAsset: (getComputedStyle(document.querySelector(".hz8-cat-hero__art")).backgroundImage.match(/category-vapes-[\w-]+\.webp/g) || []).concat(getComputedStyle(document.querySelector(".hz8-cat-hero__plaster"), "::after").backgroundImage.match(/category-vapes-plaster-[\w-]+\.webp/g) || []),
      actions: (() => { const cards = [...document.querySelectorAll(".hz8-series-results .product-card")].filter(c => c.offsetParent); return cards.slice(0, 8).map(c => { const a = [...c.querySelectorAll(".hz8-card-pill, .hz8-psold")].find(e => e.offsetParent); const pr = c.querySelector(".offer").getBoundingClientRect(); const r = a.getBoundingClientRect(); return { text: a.textContent.trim(), w: Math.round(r.width / c.getBoundingClientRect().width * 100), sameRow: Math.abs((r.top + r.bottom) / 2 - (pr.top + pr.bottom) / 2) < 8, radius: parseFloat(getComputedStyle(a).borderTopLeftRadius), h: Math.round(Math.max(r.height, parseFloat(getComputedStyle(a, "::after").height) || 0)), visualH: Math.round(r.height), priceSize: parseFloat(getComputedStyle(c.querySelector(".price")).fontSize), ctaSize: parseFloat(getComputedStyle(a).fontSize) }; }); })(),
      heroFade: [...document.querySelectorAll(".hz8-cat-hero__art")].map(e => getComputedStyle(e).backgroundImage).join().includes("180deg"),
      productType: !!document.querySelector('[data-pt="type"]') || /Produkttyp/.test(document.querySelector("#hz8-pfilter").textContent),
      bandCounts: [...document.querySelectorAll(".hz8-pseries__count")].map(e => e.textContent),
      ctaRadius: radius(".hz8-pguide__cta"), showRadius: radius("#hz8-pfilter .hz8-pshow"), toolBtnRadius: radius(".hz8-ptool__btn"),
      emblem: !!document.querySelector(".hz8-pguide__emblem svg"),
      sale: [...document.querySelectorAll(".hz8-series-results .price.has-comparison")].map(e => [e.querySelector("del")?.textContent.trim(), e.querySelector("ins")?.textContent.trim()])[0]
    };
  });
  ok("no-misleading-counts", d.seriesCounts.length === 0 && d.bandCounts.every(t => /totalt$/.test(t)), d);
  ok("paused-series-hidden", !d.thcnm, d.thcnm);
  ok("decor-layer", d.decor, d.decor);
  ok("count-not-pill", !d.countPill, d.countPill);
  ok("hero-assets-v4", d.heroAsset && d.heroAsset.join() === "category-vapes-sunset-v4-1512.webp,category-vapes-plaster-v1.webp", d.heroAsset);
  ok("compact-card-actions", d.actions.every(a => a.w < 60 && a.sameRow && a.radius >= 6 && a.radius <= 8 && a.h >= 44 && a.priceSize > a.ctaSize && !/^\+$/.test(a.text)), d.actions);
  ok("hero-no-vertical-fade", !d.heroFade, d.heroFade);
  ok("producttype-present", d.productType, d.productType);
  ok("cta-shapes", d.ctaRadius >= 6 && d.ctaRadius <= 8 && d.showRadius >= 9 && d.showRadius <= 12 && d.toolBtnRadius > 100 && d.emblem, d);
  ok("sale-price", d.sale && d.sale[0] && d.sale[1] && d.sale[0] !== d.sale[1], d.sale);
  await p.click('[data-pt="series"]'); await p.fill("#hz8-ppop-series .hz8-psearch input", "thc"); await p.waitForTimeout(200);
  const vis = await p.evaluate(() => [...document.querySelectorAll("#hz8-ppop-series .hz8-popt")].filter(e => e.offsetParent).map(e => e.getAttribute("data-hz8-series")));
  await p.fill("#hz8-ppop-series .hz8-psearch input", "zzz"); await p.waitForTimeout(200);
  const none = await p.evaluate(() => ({ empty: !document.querySelector("#hz8-ppop-series .hz8-psearch__empty").hidden, url: location.search }));
  await p.fill("#hz8-ppop-series .hz8-psearch input", ""); await p.waitForTimeout(200);
  const all = await p.evaluate(() => [...document.querySelectorAll("#hz8-ppop-series .hz8-popt")].filter(e => e.offsetParent).length);
  ok("series-search-local", vis.join() === "THCaB,THCbA,THCV" && none.empty && !/serie=/.test(none.url) && all === 5, { vis, none, all });
  await ctx.close(); }
/* v9: fullbreddsfoto, heron får vara hög (briefen: kapa inte motivet).
   Taket = uppmätt v9-läge + ~20 px marginal (fångar oavsiktlig tillväxt). */
for (const [w, h, scale, max] of [[393, 852, undefined, 790], [320, 640, undefined, 760], [720, 450, 2, 9999]]) {
  const { p, ctx } = await page(w, h, "", { scale });
  const m = await p.evaluate(() => {
    const h1 = document.querySelector("h1"); const range = document.createRange(); range.selectNodeContents(h1); const t = range.getBoundingClientRect();
    const c = document.querySelector(".hz8-pcount").getBoundingClientRect(); const g = document.querySelector(".hz8-pguide__cta").getBoundingClientRect(); const gt = document.querySelector(".hz8-pguide__title").getBoundingClientRect();
    const overlap = (a, b) => a.left < b.right && b.left < a.right && a.top < b.bottom && b.top < a.bottom;
    return { firstCard: Math.round(document.querySelector(".hz8-series-results .product-card").getBoundingClientRect().top + scrollY), h1Count: overlap(t, c), titleCta: overlap(gt, g) };
  });
  ok(`mobile-flow-${w}${scale ? "@200%" : ""}`, m.firstCard <= max && !m.h1Count && !m.titleCta, m);
  await ctx.close(); }

// 1c. v9-geometri på mobil: fullbreddsfoto, solen synlig mellan text och quiz,
// aldrig bakom headern; glaset och verktygsraden i kontraktets mått.
for (const [w, h] of [[393, 852], [430, 932], [320, 640]]) {
  const { p, ctx } = await page(w, h);
  const g = await p.evaluate(() => {
    const R = s => document.querySelector(s).getBoundingClientRect(); const hero = R(".hz8-cat-hero"), art = R(".hz8-cat-hero__art"), q = R(".hz8-pguide"), t = R(".hz8-ptool__mob"), hd = R("#store-header .main"), cr = R(".designer-breadcrumbs a, .designer-breadcrumbs li"), cnt = R(".hz8-pcount");
    /* Solens läge ur bildens geometri: 900x1600, solen vid (305, 745), cover, position 50% 0. */
    const sc = Math.max(art.width / 900, art.height / 1600), ox = (art.width - 900 * sc) / 2;
    const sun = { x: Math.round(art.left + ox + 305 * sc), y: Math.round(art.top + 745 * sc) };
    const pl = getComputedStyle(document.querySelector(".hz8-cat-hero__plaster"));
    return { hero: Math.round(hero.height), sun, headerBottom: Math.round(hd.bottom), countBottom: Math.round(cnt.bottom), quizTop: Math.round(q.top), qw: Math.round(q.width), qh: Math.round(q.height), toolGap: Math.round(t.top - hero.bottom), toolH: Math.round(t.height), crumbsGap: Math.round(cr.top - hd.bottom),
      noPlaster: pl.maskImage === "none" && getComputedStyle(document.querySelector(".hz8-cat-hero__plaster"), "::after").content === "none", art: getComputedStyle(document.querySelector(".hz8-cat-hero__art")).backgroundImage.match(/[\w-]+\.webp/)?.[0], blur: getComputedStyle(document.querySelector(".hz8-pguide")).backdropFilter };
  });
  ok(`v9-mobile-geometry-${w}`, g.sun.y > g.headerBottom + 20 && g.sun.y > g.countBottom && g.sun.y < g.quizTop && g.noPlaster && g.art === "category-vapes-sunset-v4-mobile.webp" && /blur\(16px\)/.test(g.blur) && g.qw >= Math.min(320, w - 32) && g.qw <= 344 && g.qh >= 120 && g.qh <= 160 && g.toolGap >= 10 && g.toolGap <= 18 && g.toolH >= 48 && g.toolH <= 52 && g.crumbsGap >= 14 && g.crumbsGap <= 30, g);
  await ctx.close(); }

// 1d. v6: pausade produkter dolda i gridet, Produkttyp, sticky
{ const { p, ctx } = await page(1440, 900, "", { wait: 9000 });
  const g = await p.evaluate(() => {
    const vis = [...document.querySelectorAll(".hz8-series-results .product-card")].filter(c => c.offsetParent);
    const txt = document.body.innerText;
    return { visible: vis.length, count: document.querySelector(".hz8-pcount").textContent, pausedVisible: vis.filter(c => /hhc-?pm|10-oh|thc-?nm/i.test(c.textContent)).length, thcvVisible: vis.filter(c => /thc-?v/i.test(c.textContent)).length, pausedInUi: /hhcpm|thcnm|\bD10\b/i.test(document.querySelector(".hz8-ptool").innerText + document.querySelector("#hz8-pfilter").textContent + (document.querySelector(".hz8-pseries")?.innerText || "")) };
  });
  ok("paused-hidden-in-grid", g.pausedVisible === 0 && g.thcvVisible > 0 && !g.pausedInUi && g.count === g.visible + " produkter", g);
  const names0 = await p.evaluate(() => [...document.querySelectorAll(".hz8-series-results .product-card")].filter(c => c.offsetParent).map(c => ({ n: c.querySelector(".name").textContent.trim(), h: c.querySelector("a").getAttribute("href").replace(/\?.*/, "") })));
  ok("merged-assortment", names0.some(x => /^Vape/.test(x.n)) && names0.some(x => /^Cart/.test(x.n)) && !names0.some(x => /batteri/i.test(x.n)) && new Set(names0.map(x => x.h)).size === names0.length && g.count === names0.length + " produkter", { n: names0.length, carts: names0.filter(x => /^Cart/.test(x.n)).length, count: g.count });
  const types = await p.evaluate(() => ({ shown: !document.querySelector(".hz8-ptool__type").hidden, opts: [...document.querySelectorAll('#hz8-ppop-type [data-hz8-dim="typ"]')].map(e => e.getAttribute("data-value")), vols: [...document.querySelectorAll('#hz8-pfilter [data-hz8-dim="volym"]')].map(e => e.getAttribute("data-value")) }));
  await p.click('[data-pt="type"]'); await p.waitForTimeout(300);
  await p.click('#hz8-ppop-type [data-value="carts"] button'); await p.waitForTimeout(6000);
  const r1 = await p.evaluate(() => ({ url: location.search, names: [...document.querySelectorAll(".hz8-series-results .product-card .name")].map(e => (e.getAttribute("data-hz8-full") || e.textContent).trim()), count: document.querySelector(".hz8-pcount").textContent, chips: [...document.querySelectorAll(".hz8-pchip")].map(c => c.textContent) }));
  ok("producttype-filter", types.shown && types.opts.join() === "vapes,carts" && /typ=carts/.test(r1.url) && r1.names.length > 0 && r1.names.every(n => /^Cart/.test(n)) && r1.count === r1.names.length + (r1.names.length === 1 ? " produkt" : " produkter") && r1.chips.some(c => /Carts/.test(c)), { types, r1 });
  await p.keyboard.press("Escape");
  await p.click('[data-pt="series"]'); await p.click('#hz8-ppop-series [data-hz8-series="THCaB"] button'); await p.waitForTimeout(6000); await p.keyboard.press("Escape");
  const r2 = await p.evaluate(() => ({ url: location.search, names: [...document.querySelectorAll(".hz8-series-results .product-card .name")].map(e => (e.getAttribute("data-hz8-full") || e.textContent).trim()) }));
  ok("producttype-combined-series", /typ=carts/.test(r2.url) && /serie=thcab/.test(r2.url) && r2.names.length >= 1 && r2.names.every(n => /^Cart/.test(n) && /THC-A/.test(n)), r2);
  await p.evaluate(() => { window.__noReload = 1; history.back(); }); await p.waitForTimeout(7000);
  const r3 = await p.evaluate(() => ({ url: location.search, n: document.querySelectorAll(".hz8-series-results .product-card").length, sameDoc: window.__noReload === 1 }));
  ok("producttype-back", r3.sameDoc && /typ=carts/.test(r3.url) && !/serie=/.test(r3.url) && r3.n === r1.names.length, r3);
  await p.evaluate(() => history.back()); await p.waitForTimeout(7000);
  const r4 = await p.evaluate(() => ({ url: location.search, n: [...document.querySelectorAll(".hz8-series-results .product-card")].filter(c => c.offsetParent).length }));
  ok("producttype-back-to-all", !/typ=/.test(r4.url) && r4.n === names0.length, r4);
  // Volym (filterarket) + kombination med typ
  await p.click('[data-pt="all"]'); await p.waitForTimeout(500);
  await p.evaluate(() => document.querySelector('#hz8-pfilter [data-acc="volume"] .hz8-pacc__btn').click()); await p.waitForTimeout(300);
  await p.click('#hz8-pfilter [data-hz8-dim="volym"][data-value="2ml"] button'); await p.waitForTimeout(6000);
  const r5 = await p.evaluate(() => ({ url: location.search, names: [...document.querySelectorAll(".hz8-series-results .product-card .name")].map(e => (e.getAttribute("data-hz8-full") || e.textContent).trim()), count: document.querySelector(".hz8-pcount").textContent }));
  ok("volume-filter", types.vols.includes("1ml") && types.vols.includes("2ml") && /volym=2ml/.test(r5.url) && r5.names.length > 0 && r5.names.every(n => /2\s*ml$/i.test(n)) && r5.count === r5.names.length + " produkter", { vols: types.vols, r5 });
  await p.keyboard.press("Escape");
  await p.reload({ waitUntil: "domcontentloaded" }); await p.waitForTimeout(9000);
  const r6 = await p.evaluate(() => ({ url: location.search, n: document.querySelectorAll(".hz8-series-results .product-card").length, chips: [...document.querySelectorAll(".hz8-pchip")].map(c => c.textContent) }));
  ok("volume-reload", /volym=2ml/.test(r6.url) && r6.n === r5.names.length && r6.chips.some(c => /2 ml/.test(c)), r6);
  await ctx.close(); }
{ const { p, ctx } = await page(393, 852, "typ=carts&volym=1ml", { wait: 9000 });
  const r = await p.evaluate(() => ({ names: [...document.querySelectorAll(".hz8-series-results .product-card .name")].map(e => (e.getAttribute("data-hz8-full") || e.textContent).trim()), count: document.querySelector(".hz8-pcount").textContent, chips: [...document.querySelectorAll(".hz8-pchip")].map(c => c.textContent) }));
  ok("direct-load-type-volume", r.names.length > 0 && r.names.every(n => /^Cart/.test(n) && /1\s*ml$/i.test(n)) && r.chips.length === 2 && r.count === r.names.length + " produkter", r);
  await ctx.close(); }
// v8: ärlig sortering + träffantal ur det sammanslagna underlaget
{ const { p, ctx } = await page(1440, 900, "", { wait: 9000 });
  const r = await p.evaluate(() => {
    const vis = [...document.querySelectorAll(".hz8-series-results .product-card")].filter(c => c.offsetParent).length;
    const num = sel => [...document.querySelectorAll(sel)].map(e => parseInt(e.textContent, 10)).filter(n => !isNaN(n));
    const t = num('#hz8-ppop-type [data-hz8-dim="typ"] .hz8-popt__count'), v = num('#hz8-pfilter [data-hz8-dim="volym"] .hz8-popt__count');
    return { vis, typeSum: t.reduce((a, b) => a + b, 0), volSum: v.reduce((a, b) => a + b, 0), t, v, label: document.querySelector(".hz8-ptool__desk .hz8-psort-label").textContent, sorts: [...document.querySelectorAll("#hz8-ppop-sort .hz8-psort")].map(b => b.textContent), note: !document.querySelector("#hz8-ppop-sort .hz8-psort-note").hidden };
  });
  /* Volymsumman får vara mindre än totalen (produkter utan säker volym klassas inte). */
  ok("facet-counts", r.t.length === 2 && r.typeSum === r.vis && r.volSum <= r.vis && r.volSum > 0, r);
  ok("sort-honest", r.label === "Sortera" && r.sorts.length === 4 && !r.sorts.some(x => /Populär|Nyast|lager/.test(x)) && r.note, r);
  await p.click('[data-pt="type"]'); await p.click('#hz8-ppop-type [data-value="carts"] button'); await p.waitForTimeout(6000); await p.keyboard.press("Escape");
  const r2 = await p.evaluate(() => ({ vis: document.querySelectorAll(".hz8-series-results .product-card").length, vol: [...document.querySelectorAll('#hz8-pfilter [data-hz8-dim="volym"] button')].map(b => b.getAttribute("aria-label")) }));
  const volSum = r2.vol.map(l => parseInt((l.match(/(\d+) produkt/) || [])[1] || "0", 10)).reduce((a, b) => a + b, 0);
  /* Alternativ utan träffar givet Carts döljs (aldrig "0" visat). */
  const hid = await p.evaluate(() => ({ hidden: [...document.querySelectorAll('#hz8-pfilter [data-hz8-dim="volym"]')].filter(r => r.hidden).map(r => r.getAttribute("data-value")), shown: [...document.querySelectorAll('#hz8-pfilter [data-hz8-dim="volym"]')].filter(r => !r.hidden).map(r => r.getAttribute("data-value")) }));
  ok("facet-counts-recompute", volSum === r2.vis && hid.hidden.length > 0 && hid.shown.length > 0, { ...r2, ...hid });
  await ctx.close(); }
/* Desktop/surfplatta (2026-10-21): ordinarie filterrad i flödet + filterdocka
   till vänster när raden lämnat vyn. Ersätter de gamla sticky-1024/1440/1920. */
const dockState = p => p.evaluate(() => { const t = document.querySelector(".hz8-ptool").getBoundingClientRect(), d = document.querySelector(".hz8-pdock"), btn = d.querySelector(".hz8-pdock__btn"), r = btn.getBoundingClientRect(), cs = getComputedStyle(btn);
  return { rowVis: t.bottom > 0 && t.top < innerHeight, rowTop: Math.round(t.top + scrollY), rowPos: getComputedStyle(document.querySelector(".hz8-ptool")).position, rowBottom: Math.round(t.bottom), shown: d.classList.contains("is-shown"), btnVis: cs.visibility === "visible" && +cs.opacity > .02 && r.right > 0, btn: [Math.round(r.left), Math.round(r.top), Math.round(r.width), Math.round(r.height)], y: Math.round(scrollY), ov: document.documentElement.scrollWidth - innerWidth }; });
for (const [w, h] of [[1024, 768], [1440, 900], [1920, 1080]]) {
  const { p, ctx } = await page(w, h, "", { wait: 9000 }); await p.mouse.move(w / 2, h - 120);
  const s0 = await dockState(p);
  ok(`dock-row-in-flow-${w}`, s0.rowVis && s0.rowPos === "relative" && !s0.shown && !s0.btnVis, s0);
  const both = []; let first = null;
  const end = await p.evaluate(() => document.querySelector(".designer-category").getBoundingClientRect().bottom + scrollY);
  for (let i = 0; i < 400; i++) { await p.mouse.wheel(0, 37); await p.waitForTimeout(35); const x = await dockState(p); if (x.rowVis && x.btnVis) both.push(x.y); if (x.shown && !first) { first = x; await p.waitForTimeout(80); first.mid = (await dockState(p)).btn[0]; } if (x.y > end) break; }
  const rowTopAfter = (await dockState(p)).rowTop;
  for (let i = 0; i < 400; i++) { await p.mouse.wheel(0, -37); await p.waitForTimeout(35); const x = await dockState(p); if (x.rowVis && x.btnVis) both.push(x.y); if (x.y <= 0) break; }
  ok(`dock-never-with-row-${w}`, !both.length, both.slice(0, 5));
  ok(`dock-enters-after-row-left-${w}`, first && first.rowBottom < 0 && rowTopAfter === s0.rowTop, first && { y: first.y, rowBottom: first.rowBottom, midLeft: first.mid, rowTop: [s0.rowTop, rowTopAfter] });
  await p.evaluate(() => scrollTo({ top: document.querySelector(".designer-category").getBoundingClientRect().top + scrollY + 500, behavior: "instant" })); await p.waitForTimeout(700);
  const s1 = await dockState(p);
  ok(`dock-button-${w}`, s1.shown && s1.btnVis && s1.btn[0] >= 20 && s1.btn[0] <= 24 && s1.btn[2] >= 104 && s1.btn[2] <= 116 && s1.btn[3] >= 40 && s1.btn[3] <= 44 && s1.ov === 0, s1);
  const card0 = await p.evaluate(() => JSON.stringify(document.querySelector("#category-products .product-card").getBoundingClientRect()));
  await p.focus(".hz8-pdock__btn"); await p.keyboard.press("Enter"); await p.waitForTimeout(300);
  const pan = await p.evaluate(() => { const pn = document.querySelector(".hz8-pdock__panel"), r = pn.getBoundingClientRect(); return { open: !pn.hidden, exp: document.querySelector(".hz8-pdock__btn").getAttribute("aria-expanded"), focusIn: pn.contains(document.activeElement), w: Math.round(r.width), h: Math.round(r.height), clear: !pn.querySelector(".hz8-pdock__clear").hidden }; });
  const card1 = await p.evaluate(() => JSON.stringify(document.querySelector("#category-products .product-card").getBoundingClientRect()));
  ok(`dock-panel-open-${w}`, pan.open && pan.exp === "true" && pan.focusIn && pan.w >= 296 && pan.w <= 320 && pan.h <= 470 && !pan.clear && card0 === card1 && (await dockState(p)).ov === 0, pan);
  for (let i = 0; i < 12; i++) { await p.mouse.wheel(0, 30); await p.waitForTimeout(40); }
  ok(`dock-header-held-${w}`, !(await p.evaluate(() => document.documentElement.classList.contains("hz8-header-hidden"))));
  await p.keyboard.press("Escape"); await p.waitForTimeout(200);
  const esc = await p.evaluate(() => document.querySelector(".hz8-pdock__panel").hidden && document.activeElement === document.querySelector(".hz8-pdock__btn"));
  await p.click(".hz8-pdock__btn"); await p.waitForTimeout(200);
  await p.evaluate(() => document.body.dispatchEvent(new PointerEvent("pointerdown", { bubbles: true }))); await p.waitForTimeout(200);
  const outside = await p.evaluate(() => document.querySelector(".hz8-pdock__panel").hidden);
  ok(`dock-escape-outside-focus-${w}`, esc && outside, { esc, outside });
  ok(`dock-no-errors-${w}`, !p.errors.filter(e => !/Failed to load|429|net::/.test(e)).length, p.errors.slice(0, 3));
  await ctx.close(); }
/* Filter, sortering, antal, URL, omladdning och bakåt/framåt via dockan. */
{ const { p, ctx } = await page(1440, 900, "", { wait: 9000 }); await p.mouse.move(720, 780);
  await p.evaluate(() => scrollTo({ top: document.querySelector(".designer-category").getBoundingClientRect().top + scrollY + 500, behavior: "instant" })); await p.waitForTimeout(700);
  await p.click(".hz8-pdock__btn"); await p.waitForTimeout(250);
  await p.click('.hz8-pdock [data-pd-sec="type"] .hz8-pdock__row'); await p.click('.hz8-pdock [data-pt-dim="typ"] [data-value="vapes"] button'); await p.waitForTimeout(1500);
  const a = await p.evaluate(() => ({ url: location.search, n: document.querySelector(".hz8-pdock__btn .hz8-pdock__n").textContent, show: document.querySelector(".hz8-pdock__show").textContent, clear: !document.querySelector(".hz8-pdock__clear").hidden }));
  await p.click('.hz8-pdock [data-pd-sec="volume"] .hz8-pdock__row'); await p.click('.hz8-pdock [data-pt-dim="volym"] [data-value="2ml"] button'); await p.waitForTimeout(1500);
  const b2 = await p.evaluate(() => ({ url: location.search, n: document.querySelector(".hz8-pdock__btn .hz8-pdock__n").textContent, show: document.querySelector(".hz8-pdock__show").textContent, vis: [...document.querySelectorAll(".hz8-series-results .product-card")].filter(c => c.offsetParent).length }));
  const nb = parseInt((b2.show.match(/\((\d+)\)/) || [])[1], 10);
  ok("dock-filter-url-count", /typ=vapes/.test(a.url) && a.n === "1" && a.clear && /typ=vapes/.test(b2.url) && /volym=2ml/.test(b2.url) && b2.n === "2" && nb === b2.vis, { a, b2 });
  await p.click('.hz8-pdock [data-pd-sec="sort"] .hz8-pdock__row'); await p.waitForTimeout(150);
  const sorts = await p.$$eval(".hz8-pdock .hz8-psort", x => x.map(e => e.textContent));
  await p.click('.hz8-pdock .hz8-psort[data-native="Lägsta pris"]'); await p.waitForTimeout(2500);
  const so = await p.evaluate(() => ({ url: location.search, val: document.querySelector('.hz8-pdock [data-pd-sec="sort"] .hz8-pdock__val').textContent }));
  ok("dock-sort", /sort=/.test(so.url) && /lägst/.test(so.val), { sorts, ...so });
  if (await p.evaluate(() => !document.querySelector(".hz8-pdock__panel").hidden)) { await p.click(".hz8-pdock__show"); await p.waitForTimeout(1200); }
  const before = await p.evaluate(() => location.search);
  await p.reload({ waitUntil: "domcontentloaded" }); await p.waitForTimeout(12000);
  const rl = await p.evaluate(() => ({ url: location.search, chips: [...document.querySelectorAll(".hz8-pchip")].map(c => c.textContent), n: document.querySelector(".hz8-pdock__btn .hz8-pdock__n").textContent }));
  ok("dock-reload", rl.url === before && rl.chips.length === 2 && rl.n === "2", rl);
  await p.goBack({ waitUntil: "domcontentloaded" }).catch(() => {}); await p.waitForTimeout(9000);
  const back = await p.evaluate(() => location.search);
  await p.goForward({ waitUntil: "domcontentloaded" }).catch(() => {}); await p.waitForTimeout(9000);
  const fwd = await p.evaluate(() => ({ url: location.search, chips: [...document.querySelectorAll(".hz8-pchip")].length }));
  ok("dock-history", back !== before && fwd.url === before && fwd.chips === 2, { back, fwd });
  ok("dock-filter-no-errors", !p.errors.filter(e => !/Failed to load|429|net::/.test(e)).length && (await dockState(p)).ov === 0, p.errors.slice(0, 3));
  await ctx.close(); }
{ const { p, ctx } = await page(1440, 900, "", { reduced: true });
  const d = await p.evaluate(() => [getComputedStyle(document.querySelector(".hz8-pdock__btn")).transitionDuration, getComputedStyle(document.querySelector(".hz8-pdock")).transitionDuration]);
  ok("dock-reduced-motion", d.every(x => /^0s/.test(x)), d); await ctx.close(); }
/* Mobil (oförändrad): fast rad kant i kant med headern; följer med upp när
   headern döljs (semi-sticky) -- då mäts mot vyns överkant. */
{ const { p, ctx } = await page(393, 852);
  const res = [];
  for (const y of [300, 900, 1600, 900, 300]) { await p.evaluate(y => scrollTo(0, y), y); await p.waitForTimeout(500); await p.mouse.wheel(0, 40); await p.waitForTimeout(700);
    res.push(await p.evaluate(() => { const hidden = document.documentElement.classList.contains("hz8-header-hidden"); const hd = document.querySelector("#store-header .main").getBoundingClientRect(); const t = document.querySelector(".hz8-ptool").getBoundingClientRect(); const cs = getComputedStyle(document.querySelector(".hz8-ptool"), "::before"); return { stuck: document.querySelector(".hz8-ptool").classList.contains("is-stuck"), hidden, gap: Math.round(t.top - (hidden ? 0 : hd.bottom)), beforeH: Math.round(parseFloat(cs.height)), toolH: Math.round(t.height), dock: getComputedStyle(document.querySelector(".hz8-pdock")).display }; })); }
  const stuck = res.filter(r => r.stuck);
  ok("sticky-393", stuck.length >= 2 && stuck.every(r => r.gap >= 0 && r.gap <= 14 && r.beforeH <= r.toolH + 16) && res.every(r => r.dock === "none"), res);
  await ctx.close(); }

// 2. Desktop: popover via tangentbord, Escape, fokus tillbaka
{ const { p, ctx } = await page(1440, 900);
  await p.focus('[data-pt="series"]'); await p.keyboard.press("Enter"); await p.waitForTimeout(300);
  const st = await p.evaluate(() => ({ exp: document.querySelector('[data-pt="series"]').getAttribute("aria-expanded"), inPanel: document.querySelector("#hz8-ppop-series").contains(document.activeElement), vis: document.activeElement.matches(":focus-visible"), outline: getComputedStyle(document.activeElement).outlineStyle }));
  const firstIsSearch = await p.evaluate(() => document.activeElement.matches(".hz8-psearch input"));
  await p.keyboard.press("Tab"); await p.keyboard.press("Space"); await p.waitForTimeout(6000);
  const sel = await p.evaluate(() => ({ url: location.search, pressed: document.activeElement.getAttribute("aria-pressed"), live: document.querySelector('[data-pt="live"]').textContent, status: document.querySelector(".hz8-series-status__text")?.textContent }));
  await p.keyboard.press("Escape"); await p.waitForTimeout(200);
  const back = await p.evaluate(() => ({ focus: document.activeElement.getAttribute("data-pt"), hidden: document.querySelector("#hz8-ppop-series").hidden }));
  ok("desktop-popover-keyboard", firstIsSearch && st.exp === "true" && st.inPanel && sel.pressed === "true" && back.focus === "series" && back.hidden, { st, sel, back });
  ok("screenreader-status", /visas/.test(sel.live) && /serie vald/.test(sel.status || ""), sel);
  // klick utanför stänger
  await p.click('[data-pt="sort"]'); await p.waitForTimeout(200); await p.mouse.click(700, 120); await p.waitForTimeout(200);
  ok("desktop-popover-outside-close", await p.evaluate(() => document.querySelector("#hz8-ppop-sort").hidden));
  // Alla filter-panel: fokusfälla, scroll-lås, Escape
  await p.click('[data-pt="all"]'); await p.waitForTimeout(500);
  const lock = await p.evaluate(() => document.documentElement.classList.contains("hz8-scroll-locked"));
  for (let i = 0; i < 40; i++) await p.keyboard.press("Tab");
  const trapped = await p.evaluate(() => document.querySelector("#hz8-pfilter").contains(document.activeElement));
  await p.keyboard.press("Escape"); await p.waitForTimeout(200);
  const after = await p.evaluate(() => ({ open: !document.querySelector("#hz8-pfilter").hidden, lock: document.documentElement.classList.contains("hz8-scroll-locked"), focus: document.activeElement.getAttribute("data-pt") }));
  ok("desktop-allfilters-dialog", lock && trapped && !after.open && !after.lock && after.focus === "all", { lock, trapped, after });
  await ctx.close(); }

// 3. Mobil: filterark, 44 px, fast fot, Escape, fokus tillbaka
{ const { p, ctx } = await page(393, 852);
  await p.click('[data-pt="sheet"]'); await p.waitForTimeout(600);
  const s = await p.evaluate(() => {
    const d = document.querySelector("#hz8-pfilter .hz8-psheet__panel");
    const small = [...d.querySelectorAll("button, a")].filter(e => e.offsetParent).map(e => e.getBoundingClientRect()).filter(r => r.height < 44).length;
    const foot = d.querySelector(".hz8-psheet__foot").getBoundingClientRect();
    const openSecs = [...d.querySelectorAll(".hz8-pacc__btn[aria-expanded='true']")].map(b => b.textContent.trim());
    return { role: d.getAttribute("role"), modal: d.getAttribute("aria-modal"), small, footBottom: Math.round(foot.bottom), vh: innerHeight, openSecs, lock: document.documentElement.classList.contains("hz8-scroll-locked"), focusIn: d.contains(document.activeElement) };
  });
  await p.keyboard.press("Escape"); await p.waitForTimeout(200);
  const after = await p.evaluate(() => ({ hidden: document.querySelector("#hz8-pfilter").hidden, focus: document.activeElement.getAttribute("data-pt") }));
  ok("mobile-filter-sheet", s.role === "dialog" && s.modal === "true" && s.small === 0 && s.footBottom === s.vh && s.lock && s.focusIn && s.openSecs.length === 1 && after.hidden && after.focus === "sheet", { s, after });
  // sorteringsark
  await p.click('[data-pt="sort-sheet"]'); await p.waitForTimeout(500);
  const opts = await p.evaluate(() => [...document.querySelectorAll("#hz8-psortsheet .hz8-psort")].map(b => b.textContent));
  await p.click('#hz8-psortsheet .hz8-psort >> text="Pris: lägst först"'); await p.waitForTimeout(5000);
  const sorted = await p.evaluate(() => ({ url: location.search, label: document.querySelector(".hz8-ptool__mob .hz8-psort-label").textContent, prices: [...document.querySelectorAll(".hz8-series-results .product-card .price ins, .hz8-series-results .product-card .price:not(.has-comparison)")].slice(0, 6).map(e => parseInt(e.textContent.replace(/\D/g, ""))) }));
  ok("mobile-sort", opts.join() === "Pris: lägst först,Pris: högst först,Namn A–Ö,Namn Ö–A" && /sort=price_low/.test(sorted.url) && sorted.label === "Sortera: Pris: lägst först" && sorted.prices.every((v, i, a) => !i || a[i - 1] <= v), { opts, sorted });
  await ctx.close(); }

// 4. Quiz: öppna, steg, stäng, slutför -> riktigt filter
{ const { p, ctx } = await page(393, 852);
  await p.click(".hz8-pguide__cta"); await p.waitForTimeout(600);
  const s1 = await p.evaluate(() => ({ title: document.querySelector("#hz8-pquiz-title").textContent, prog: document.querySelector(".hz8-pquiz__progress").textContent, opts: [...document.querySelectorAll(".hz8-pquiz__opt")].map(o => o.textContent), next: document.querySelector(".hz8-pquiz__next").disabled, text: document.querySelector("#hz8-pquiz").textContent }));
  ok("quiz-no-forbidden-words", !/smak|rus|effekt|medicin|hög|lugn|sömn/i.test(s1.text), s1.text.slice(0, 200));
  await p.keyboard.press("Escape"); await p.waitForTimeout(200);
  const closed = await p.evaluate(() => ({ hidden: document.querySelector("#hz8-pquiz").hidden, focus: document.activeElement.classList.contains("hz8-pguide__cta") }));
  await p.click(".hz8-pguide__cta"); await p.waitForTimeout(500);
  await p.click('.hz8-pquiz__opt[data-value="vapes"]'); await p.click(".hz8-pquiz__next"); await p.waitForTimeout(800);
  const s2 = await p.evaluate(() => ({ prog: document.querySelector(".hz8-pquiz__progress").textContent, opts: [...document.querySelectorAll(".hz8-pquiz__opt")].map(o => o.textContent) }));
  await p.click('.hz8-pquiz__opt[data-value="THCV"]'); await p.click(".hz8-pquiz__next"); await p.waitForTimeout(7000);
  const done = await p.evaluate(() => ({ url: location.search, chips: [...document.querySelectorAll(".hz8-pchip")].map(c => c.textContent), n: document.querySelectorAll(".hz8-series-results .product-card").length, open: !document.querySelector("#hz8-pquiz").hidden }));
  ok("quiz-series-no-counts", s2.opts.length > 0 && s2.opts.every(o => !/\d+ produkt/.test(o)) && !s2.opts.some(o => /THCNM/i.test(o)), s2.opts);
  ok("quiz-flow", s1.next && closed.hidden && closed.focus && s2.opts.length > 0 && /serie=thcv/.test(done.url) && /typ=vapes/.test(done.url) && done.n === 6 && !done.open, { s1: { prog: s1.prog, opts: s1.opts }, s2, done });
  await ctx.close(); }

// 5. Delbar URL + flera serier + bakåt/framåt
{ const { p, ctx } = await page(1440, 900, "serie=thcab,thcba&filters=smart-filter_in-stock", { wait: 9000 });
  const s = await p.evaluate(() => ({ chips: [...document.querySelectorAll(".hz8-pchip")].map(c => c.textContent), n: document.querySelectorAll(".hz8-series-results .product-card").length, count: document.querySelector(".hz8-pcount").textContent, sw: document.querySelector('[data-pt="stock"]').getAttribute("aria-checked") }));
  ok("shareable-url", s.chips.length === 3 && s.n >= 2 && s.count === s.n + " produkter" && s.sw === "true", s);
  await p.click('.hz8-pchip >> text="THCbA"'); await p.waitForTimeout(6000);
  const s2 = await p.evaluate(() => ({ url: location.search, n: document.querySelectorAll(".hz8-series-results .product-card").length }));
  await p.goBack(); await p.waitForTimeout(8000);
  const s3 = await p.evaluate(() => ({ url: location.search, chips: [...document.querySelectorAll(".hz8-pchip")].map(c => c.textContent), n: document.querySelectorAll(".hz8-series-results .product-card").length }));
  await p.goForward(); await p.waitForTimeout(8000);
  const s4 = await p.evaluate(() => ({ url: location.search, chips: [...document.querySelectorAll(".hz8-pchip")].map(c => c.textContent) }));
  ok("back-forward", /serie=thcab(&|$)/.test(s2.url) && s3.chips.length === 3 && s3.n === s.n && s4.chips.length === 2, { s2, s3, s4 });
  // Rensa alla
  await p.click(".hz8-pchips__clear"); await p.waitForTimeout(7000);
  const s5 = await p.evaluate(() => ({ url: location.search, chipsHidden: document.querySelector(".hz8-pchips").hidden, count: document.querySelector(".hz8-pcount").textContent, visible: [...document.querySelectorAll(".hz8-series-results .product-card")].filter(c => c.offsetParent).length }));
  ok("clear-all", s5.chipsHidden && s5.count === s5.visible + " produkter" && s5.visible > 20 && !/filters=[^&]|serie=|typ=|volym=/.test(s5.url), s5);
  await ctx.close(); }

// 6. Noll produkter / en produkt
{ const { p, ctx } = await page(1440, 900, "filters=Varum%C3%A4rke_Hero&serie=thcab", { wait: 9000 });
  const z = await p.evaluate(() => ({ empty: document.querySelector(".hz8-series-results .hz8-cat-empty")?.textContent, count: document.querySelector(".hz8-pcount").textContent, chips: [...document.querySelectorAll(".hz8-pchip")].map(c => c.textContent) }));
  ok("zero-products", /Inga produkter/.test(z.empty || "") && z.count === "0 produkter", z);
  await p.screenshot({ path: `${DIR}/review-edge-zero.png` });
  await ctx.close(); }
{ const { p, ctx } = await page(1440, 900, "filters=Varum%C3%A4rke_Hero");
  const o = await p.evaluate(() => ({ cards: document.querySelectorAll(".hz8-series-results .product-card").length, count: document.querySelector(".hz8-pcount").textContent }));
  ok("one-product", o.cards === 1 && o.count === "1 produkt", o);
  await p.screenshot({ path: `${DIR}/review-edge-one.png` });
  await ctx.close(); }

// 7. Slutsåld, variant, långt namn, kortkontroller
{ const { p, ctx } = await page(1440, 900);
  const c = await p.evaluate(() => {
    const cards = [...document.querySelectorAll(".hz8-series-results .product-card")].filter(c => c.offsetParent);
    const sold = cards.filter(c => c.classList.contains("hz8-is-soldout"));
    const soldOk = sold.every(c => c.querySelector(".hz8-psold") && getComputedStyle(c.querySelector(".hz8-card-pill")).display === "none");
    const variants = cards.filter(c => c.querySelector(".has-variants") && !c.classList.contains("hz8-is-soldout")).map(c => c.querySelector(".hz8-card-pill .hz8-pill-long")?.textContent);
    const adds = cards.filter(c => !c.querySelector(".has-variants") && !c.classList.contains("hz8-is-soldout")).map(c => c.querySelector(".hz8-card-pill .hz8-pill-long")?.textContent);
    const long = cards.find(c => /Blueberry Banana/.test(c.textContent));
    const lr = long.getBoundingClientRect(), nr = long.querySelector(".name").getBoundingClientRect();
    const rows = {}; cards.forEach(c => { const t = Math.round(c.getBoundingClientRect().top); const pill = c.querySelector(".hz8-card-pill:not([style*='none']), .hz8-psold"); rows[t] = rows[t] || []; const rr = [...c.querySelectorAll(".hz8-card-pill, .hz8-psold")].filter(e => e.offsetParent)[0]?.getBoundingClientRect(); rows[t].push(rr ? Math.round((rr.top + rr.bottom) / 2) : null); });
    return { cards: cards.filter(c => c.offsetParent).length, sold: sold.length, soldOk, variants: [...new Set(variants)], adds: [...new Set(adds)], longInside: nr.right <= lr.right + 1, ctaAligned: Object.values(rows).every(r => new Set(r).size === 1), stockLines: document.querySelectorAll(".hz8-series-results .hz8-pstock:not(.is-pending)").length };
  });
  const v9 = await p.evaluate(() => {
    const cards = [...document.querySelectorAll(".hz8-series-results .product-card")].filter(c => c.offsetParent);
    const rated = cards.filter(c => c.querySelector(".rating .nh-stars[title]")), unrated = cards.filter(c => !c.querySelector(".rating *"));
    const dot = c => { const s = c.querySelector(".hz8-pstock"); const b = getComputedStyle(s, "::before"); return { w: b.width, ring: b.boxShadow, text: s.textContent, color: getComputedStyle(s).color }; };
    const sold = cards.find(c => c.classList.contains("hz8-is-soldout")), inst = cards.find(c => !c.classList.contains("hz8-is-soldout"));
    const nm = cards.map(c => c.querySelector(".name"));
    return {
      amp: nm.filter(n => /&amp;/.test(n.textContent)).length, decoded: nm.some(n => /Banana & Tequila/.test(n.textContent)), altAmp: cards.filter(c => /&amp;/.test(c.querySelector("img")?.alt || "")).length,
      clamp: [...new Set(nm.map(n => getComputedStyle(n).webkitLineClamp))], fullName: nm.every(n => n.scrollHeight >= n.clientHeight),
      rate: rated.every(c => { const t = parseFloat(c.querySelector(".nh-stars").getAttribute("title")); return c.querySelector(".hz8-prate")?.textContent === t.toFixed(1).replace(".", ","); }), rated: rated.length, unratedNoRow: unrated.every(c => c.querySelector(".rating").getBoundingClientRect().height === 0 && !c.querySelector(".hz8-prate")),
      inDot: inst && dot(inst), soldDot: sold && dot(sold), sale: getComputedStyle(document.querySelector(".hz8-series-results .price.has-comparison ins")).color,
      brand: (() => { const b = getComputedStyle(cards[0].querySelector(".brand")); return { fs: b.fontSize, fw: b.fontWeight, ls: b.letterSpacing }; })(),
      pill: getComputedStyle(cards.find(c => c.querySelector(".hz8-card-pill") && !c.classList.contains("hz8-is-soldout")).querySelector(".hz8-card-pill")).backgroundColor
    };
  });
  ok("v9-names-decoded", v9.amp === 0 && v9.altAmp === 0 && v9.decoded && v9.clamp.join() === "2", v9);
  ok("v9-rating-decimal", v9.rated > 0 && v9.rate && v9.unratedNoRow, { rated: v9.rated, rate: v9.rate, unratedNoRow: v9.unratedNoRow });
  ok("v9-stock-dot", v9.inDot.w === "6px" && v9.inDot.ring === "none" && v9.inDot.text === "I lager" && v9.soldDot.text === "Slutsåld" && v9.soldDot.color !== v9.inDot.color, { in: v9.inDot, sold: v9.soldDot });
  ok("v9-sale-terracotta", !/rgb\(2[0-9]{2}, [0-9]{1,2}, [0-9]{1,2}\)/.test(v9.sale) && v9.sale !== "rgb(35, 35, 29)", v9.sale);
  ok("v9-brand-and-buy", parseFloat(v9.brand.fs) >= 11 && parseFloat(v9.brand.fs) <= 12 && +v9.brand.fw >= 600 && /rgb\(50, 61, 37\)|#323d25/.test(v9.pill), { brand: v9.brand, pill: v9.pill });
  ok("cards-states", c.sold > 0 && c.soldOk && c.variants.join() === "Välj" && c.adds.join() === "Lägg till" && c.longInside && c.ctaAligned && c.stockLines === c.cards, c);
  // Direktköp
  const before = await p.evaluate(() => { const s = window.HZ8.store(); return s ? s.state.cart.cart?.quantity_count || 0 : null; });
  const target = await p.evaluate(() => { const c = [...document.querySelectorAll(".hz8-series-results .product-card")].find(c => !c.classList.contains("hz8-is-soldout") && c.querySelector("button.hz8-card-pill")); c.querySelector("button.hz8-card-pill").setAttribute("data-test-buy", "1"); return c.querySelector(".name").textContent.trim(); });
  await p.click('[data-test-buy="1"]'); await p.waitForTimeout(6000);
  const after = await p.evaluate(() => { const s = window.HZ8.store(); return { qty: s ? s.state.cart.cart?.quantity_count || 0 : null, aside: !!document.querySelector("#cartAside.is-active, #cartAside[class*='active'], .cart-aside.is-active") }; });
  ok("direct-buy-cart", after.qty === (before || 0) + 1, { target, before, after });
  await p.screenshot({ path: `${DIR}/review-direct-buy.png` });
  await ctx.close(); }

// 8. Trasig produktbild
{ const { p, ctx } = await page(1440, 900, "", { setup: async ctx => { await ctx.route(/cloudfront\.net\/eyJ/, r => r.request().url().length % 3 === 0 ? r.fulfill({ status: 404, body: "" }) : r.continue()); } });
  const s = await p.evaluate(() => { const hs = [...document.querySelectorAll(".hz8-series-results .product-card__image")].filter(e => e.offsetParent).map(e => Math.round(e.getBoundingClientRect().height)); const broken = [...document.querySelectorAll(".hz8-series-results .product-card__image img")].filter(i => i.complete && !i.naturalWidth).length; return { broken, uniformMedia: new Set(hs).size === 1, ov: document.documentElement.scrollWidth - innerWidth }; });
  ok("broken-image", s.broken > 0 && s.uniformMedia && s.ov === 0, s);
  await p.screenshot({ path: `${DIR}/review-edge-broken-image.png` });
  await ctx.close(); }

// 9. Blockerad fetch (alla andra kategorisidor + frontend-API)
{ const { p, ctx } = await page(1440, 900, "", { setup: async ctx => { await ctx.route(/\/sv\/categories\/(?!alla-vapes\?preview=[^&]*$)/, r => r.request().resourceType() === "document" ? r.continue() : r.abort()); } });
  const s = await p.evaluate(() => ({ cards: document.querySelectorAll("#category-products .product-card").length, stock: document.querySelectorAll(".hz8-pstock:not(.is-pending)").length, band: !!document.querySelector(".hz8-pseries:not([hidden])"), others: document.querySelectorAll(".hz8-pother:not([hidden])").length, opts: [...document.querySelectorAll("#hz8-ppop-series .hz8-popt")].map(e => e.textContent), count: document.querySelector(".hz8-pcount").textContent, ov: document.documentElement.scrollWidth - innerWidth }));
  /* Ingen omprövningsloop: antalet ska ligga still och inga nya anrop till den blockerade källan ske. */
  const samples = []; for (let i = 0; i < 5; i++) { await p.waitForTimeout(1500); samples.push(await p.evaluate(() => document.querySelector(".hz8-pcount").textContent)); }
  ok("blocked-no-retry-loop", samples.every(x => x === "24 produkter"), samples);
  ok("blocked-fetch", s.cards === 24 && s.stock === 0 && !s.band && s.others === 0 && s.count === "24 produkter", { ...s, errors: p.errors.filter(e => !/Failed to load|ERR_FAILED/.test(e)) });
  await p.screenshot({ path: `${DIR}/review-edge-blocked-fetch.png` });
  // Union kan inte byggas -> ärligt felläge
  await p.click('[data-pt="series"]'); await p.click('#hz8-ppop-series [data-hz8-series="THCV"] button'); await p.waitForTimeout(5000);
  const e = await p.evaluate(() => ({ status: document.querySelector(".hz8-series-status")?.textContent, visible: document.querySelector(".hz8-series-status")?.classList.contains("has-action"), nativeVisible: getComputedStyle(document.querySelector("#category-products")).display !== "none" }));
  ok("blocked-fetch-union-error", /kunde inte kombineras/.test(e.status || "") && e.visible && e.nativeVisible, e);
  await p.keyboard.press("Escape");
  await p.screenshot({ path: `${DIR}/review-edge-union-error.png` });
  await ctx.close(); }

// 10. Laddningsläge
{ const { p, ctx } = await page(1440, 900, "", { setup: async ctx => { await ctx.route(/\/sv\/categories\/thcv-vape/, async r => { await new Promise(x => setTimeout(x, 5000)); r.continue(); }); }, wait: 4000 });
  await p.evaluate(() => sessionStorage.clear());
  await p.click('[data-pt="series"]'); await p.click('#hz8-ppop-series [data-hz8-series="THCV"] button'); await p.waitForTimeout(800);
  const s = await p.evaluate(() => ({ busy: document.getElementById("skip-to-main-content").getAttribute("aria-busy"), show: document.querySelector("#hz8-ppop-series .hz8-pshow").textContent, dim: getComputedStyle(document.querySelector(".hz8-series-results")).opacity, count: document.querySelector(".hz8-pcount").textContent }));
  await p.screenshot({ path: `${DIR}/review-edge-loading.png` });
  await p.waitForTimeout(9000);
  const s2 = await p.evaluate(() => ({ busy: document.getElementById("skip-to-main-content").getAttribute("aria-busy"), show: document.querySelector("#hz8-ppop-series .hz8-pshow").textContent }));
  ok("loading-state", s.busy === "true" && s.show === "Visa produkter" && parseFloat(s.dim) < 1 && s.count === "" && s2.busy === null && /\(7\)/.test(s2.show), { s, s2 });
  await ctx.close(); }

// 11. Reducerad rörelse
{ const { p, ctx } = await page(393, 852, "", { reduced: true });
  await p.click('[data-pt="sheet"]'); await p.waitForTimeout(100);
  const t = await p.evaluate(() => getComputedStyle(document.querySelector("#hz8-pfilter .hz8-psheet__panel")).transitionDuration);
  ok("reduced-motion", /^0s|0\.01ms|1e-05s/.test(t) || t.split(",").every(x => parseFloat(x) < 0.01), t);
  await ctx.close(); }

// 12. Paginering: native element orört
{ const { p, ctx } = await page(1440, 900);
  const s = await p.evaluate(() => ({ total: document.querySelector("#products_count")?.textContent.trim(), pag: !!document.querySelector(".designer-category .pagination"), cards: document.querySelectorAll("#category-products .product-card").length }));
  ok("pagination-native", s.cards === 24, s);
  await ctx.close(); }

fs.writeFileSync(`${DIR}/tests-${local ? "local" : "external"}.json`, JSON.stringify(R, null, 1));
console.log("FAILED:", fail);
await b.close();
