// Serie x format-mallen: rutter, dataintegritet, layoutregler, responsivt, a11y. node tests.mjs [group,...]
import { chromium, ctxFor, open, URL_ } from "../pdp-pilot-2026-10/lib.mjs"; import fs from "node:fs";
const only = (process.argv[2] || "").split(",").filter(Boolean); const run = g => !only.length || only.includes(g);
const b = await chromium.launch(); const R = {}; const fail = [];
const ok = (name, cond, info) => { R[name] = { pass: !!cond, info }; if (!cond) fail.push(name); console.log((cond ? "PASS " : "FAIL ") + name, info === undefined ? "" : JSON.stringify(info).slice(0, 420)); };
const errs = p => p.errors.filter(e => !/Failed to load|429|net::/.test(e));
async function page(w, h, path, q = "", opt = {}) { const ctx = await ctxFor(b, w, h, { reduced: opt.reduced, scale: opt.scale }); const p = await open(ctx, URL_(path, q)); await p.waitForTimeout(opt.wait || 9000); return { p, ctx }; }
const state = p => p.evaluate(() => { const c = HZ8.catalog.contextFor(location.href); const html = document.documentElement;
  const cards = [...document.querySelectorAll("#category-products .product-card")];
  return { ctx: c ? [c.type, c.series && c.series.name, c.format && c.format.key, !!c.query] : null, sf: html.classList.contains("hz8-sf"), n: html.getAttribute("data-hz8-sf-n"), low: html.classList.contains("hz8-sf-low"),
    h1: [...document.querySelectorAll("h1")].map(h => h.textContent.trim()), eyebrow: (document.querySelector(".hz8-sf-eyebrow") || {}).textContent || null,
    lead: (document.querySelector(".hz8-sf-lead") || {}).textContent || null, leadSrc: (document.querySelector(".hz8-sf-lead") || { getAttribute: () => null }).getAttribute("data-hz8-source"),
    native: ((document.getElementById("products_count") || {}).textContent || "").trim(), sfCount: (document.querySelector(".hz8-sf-count") || {}).textContent || null,
    cards: cards.length, chips: cards.map(c => [(c.querySelector(".name") || {}).textContent.trim(), [...c.querySelectorAll(".hz8-pcardchip")].map(x => x.textContent), c.querySelectorAll(".hz8-pcardchip.is-extra").length]),
    tabs: [...document.querySelectorAll(".hz8-sf-tab")].map(a => [a.textContent, a.getAttribute("href"), a.getAttribute("aria-current")]),
    panel: (() => { const m = document.querySelector(".hz8-sf-more"); return m && !m.hidden && m.getClientRects().length ? [...m.querySelectorAll("a")].map(a => [a.textContent.trim(), a.getAttribute("href")]) : null; })(),
    cont: (() => { const s = document.querySelector(".hz8-sf-cont"); return s && !s.hidden ? [...s.querySelectorAll("a")].map(a => a.textContent.trim()) : null; })(),
    others: (() => { const s = document.querySelector(".hz8-sf-others"); return s && !s.hidden ? [...s.querySelectorAll(".hz8-sf-serie__name")].map(a => a.textContent.trim()) : null; })(),
    rails: !!document.querySelector(".hz8-cat-rails:not([hidden])") && getComputedStyle(document.querySelector(".hz8-cat-rails")).display !== "none",
    popular: !!document.querySelector(".hz8-cat-popular"), canon: (document.querySelector("link[rel=canonical]") || {}).href, title: document.title,
    crumbs: [...document.querySelectorAll(".designer-breadcrumbs a")].map(a => a.textContent.trim()).filter((v, i, a) => a.indexOf(v) === i),
    ov: document.documentElement.scrollWidth - innerWidth }; });

// ---------- 0. route-matchning (ren logik, i sidans kontext) ----------
if (run("match")) { const { p, ctx } = await page(1440, 900, "/sv/categories/alla-vapes", "", { wait: 6000 });
  const m = await p.evaluate(() => { const C = HZ8.catalog, t = (u) => { const c = C.contextFor(u); return c ? [c.type, c.series && c.series.name, c.format && c.format.key].join("/") : "null"; };
    return { allCarts: t("/sv/categories/alla-cartridges"), msCarts20: t("/sv/categories/alla-cartridges?filters=Serie_Magic%20Sauce"), msCartsPlus: t("/sv/categories/alla-cartridges?filters=Serie_Magic+Sauce"),
      msCartsSort: t("/sv/categories/alla-cartridges?sort=price_low&filters=Serie_Magic%20Sauce&page=2"), msCartsMore: t("/sv/categories/alla-cartridges?filters=Serie_Magic%20Sauce~smart-filter_in-stock"),
      cartsOther: t("/sv/categories/alla-cartridges?filters=Varum%C3%A4rke_Faraoh"), hasch: t("/sv/categories/hasch"), msHasch: t("/sv/categories/hasch?filters=Serie_Magic+Sauce"),
      haschSort: t("/sv/categories/hasch?sort=price_low"), thcaVapes: t("/sv/categories/thca-vapes?sort=popular"), msVapes: t("/sv/categories/m-s-vapes/"), allaVapes: t("/sv/categories/alla-vapes"),
      allaVapesSerie: t("/sv/categories/alla-vapes?serie=magic-sauce"), hub: t("/sv/categories/magic-sauce"), rmNo: C.routeMatches("/sv/categories/hasch?filters=Serie_Magic%20Sauce", "/sv/categories/hasch"),
      rmOtherSerie: C.routeMatches("/sv/categories/hasch?filters=Serie_Magic%20Sauce", "/sv/categories/hasch?filters=Serie_Nano11") }; });
  ok("match-plain-carts-is-format", m.allCarts === "format//carts", m.allCarts);
  ok("match-plain-hasch-is-format", m.hasch === "format//hasch" && m.haschSort === "format//hasch", [m.hasch, m.haschSort]);
  ok("match-ms-carts-encodings", [m.msCarts20, m.msCartsPlus, m.msCartsSort, m.msCartsMore].every(x => x === "combo/Magic Sauce/carts"), [m.msCarts20, m.msCartsPlus, m.msCartsSort, m.msCartsMore]);
  ok("match-ms-hasch", m.msHasch === "combo/Magic Sauce/hasch", m.msHasch);
  ok("match-other-filter-stays-format", m.cartsOther === "format//carts" && !m.rmNo && !m.rmOtherSerie, [m.cartsOther, m.rmNo, m.rmOtherSerie]);
  ok("match-dedicated-with-list-params", m.thcaVapes === "combo/THCaB/vapes" && m.msVapes === "combo/Magic Sauce/vapes", [m.thcaVapes, m.msVapes]);
  ok("match-unchanged-pages", m.allaVapes === "format//vapes" && m.allaVapesSerie === "format//vapes" && m.hub === "series-hub/Magic Sauce/", [m.allaVapes, m.allaVapesSerie, m.hub]);
  await ctx.close(); }

// ---------- 1. rutter och dataintegritet ----------
const ROUTES = [
  ["/sv/categories/m-s-vapes", "", "Magic Sauce", "vapes", "Magic Sauce Vapes"], ["/sv/categories/m-s-buds", "", "Magic Sauce", "buds", "Magic Sauce Buds"],
  ["/sv/categories/alla-cartridges", "filters=Serie_Magic%20Sauce", "Magic Sauce", "carts", null], ["/sv/categories/hasch", "filters=Serie_Magic%20Sauce", "Magic Sauce", "hasch", null],
  ["/sv/categories/thca-vapes", "", "THCaB", "vapes", "THCaB Vapes"], ["/sv/categories/thca-carts", "", "THCaB", "carts", "THCaB Carts"], ["/sv/categories/thca-blommor", "", "THCaB", "buds", "THCaB Buds"], ["/sv/categories/thca-hash", "", "THCaB", "hasch", "THCaB Hasch"],
  ["/sv/categories/thcb-vapes", "", "THCbA", "vapes", "THCbA Vapes"], ["/sv/categories/thcb-carts", "", "THCbA", "carts", "THCbA Carts"], ["/sv/categories/10-oh-thc-vapes", "", "D10", "vapes", "D10 Vapes"],
  ["/sv/categories/nano11-blommor", "", "Nano-11", "buds", "Nano-11 Buds"], ["/sv/categories/thcv-vape", "", "THCV", "vapes", "THCV Vapes"], ["/sv/categories/thcv-carts", "", "THCV", "carts", "THCV Carts"],
  ["/sv/categories/hhcpm-vapes", "", "HHCPM", "vapes", "HHCPM Vapes"], ["/sv/categories/hhcpm-blommor", "", "HHCPM", "buds", "HHCPM Buds"], ["/sv/categories/thcnm-blommor", "", "THCNM", "buds", "THCNM Buds"], ["/sv/categories/thcnm-hash", "", "THCNM", "hasch", "THCNM Hash"]
];
const TYPE = { vapes: "Vape", carts: "Cart", buds: "Buds", hasch: "Hasch" };
const PAUSED = /^(THCNM|HHCPM|D10)$/;
if (run("routes")) for (const [path, q, serie, fmt, title] of ROUTES) {
  const { p, ctx } = await page(1440, 900, path, q, { wait: 11000 }); const s = await state(p); const k = path.split("/").pop() + (q ? "?" + q.split("_")[0] : "");
  const nNative = parseInt(s.native, 10);
  const baseTitle = title ? title.replace(/ Hash$/, " Hasch") : null;
  ok(`route-${k}-context`, s.ctx && s.ctx[0] === "combo" && s.ctx[1] === serie && s.ctx[2] === fmt && s.ctx[3] === !!q && s.sf, s.ctx);
  ok(`route-${k}-heading`, s.h1.length === 1 && (q ? !/Magic Sauce/.test(s.h1[0]) : s.h1[0] === baseTitle) && !/\bM\.S\b|THC-?A\b|THC-?B\b|10-OH/.test(q ? "" : s.h1[0]) && (s.eyebrow || "").toLowerCase().startsWith(serie.toLowerCase()), { h1: s.h1, eyebrow: s.eyebrow, lead: s.lead, src: s.leadSrc });
  ok(`route-${k}-counts`, !isNaN(nNative) && s.cards === Math.min(nNative, 25) && (s.sfCount === nNative + (nNative === 1 ? " produkt" : " produkter")), { native: s.native, cards: s.cards, sfCount: s.sfCount });
  /* Inga seriechips (serien är vald), typchip ur produktens eget namn. */
  const badChip = s.chips.filter(([n, c, extra]) => extra || (c[0] && n && !new RegExp("^" + c[0], "i").test(n.replace(/^Hash/i, "Hasch").replace(/^Blommor/i, "Buds"))));
  ok(`route-${k}-cards`, s.chips.length === s.cards && !badChip.length, { badChip, sample: s.chips.slice(0, 3) });
  const cur = s.tabs.filter(t => t[2] === "page");
  ok(`route-${k}-tabs`, cur.length === 1 && cur[0][0] === (fmt === "hasch" ? "Hasch" : fmt === "buds" ? "Buds" : fmt === "carts" ? "Carts" : "Vapes") && s.tabs.every(t => t[1] && t[1] !== "#" && !/^javascript/.test(t[1])) && !s.rails && !s.popular, s.tabs.map(t => t[0] + (t[2] ? "*" : "")));
  const lowExpected = nNative >= 1 && nNative <= 3 && s.tabs.length > 1 + (s.tabs[0] && /^Alla /.test(s.tabs[0][0]) ? 1 : 0);
  ok(`route-${k}-layout`, s.n === (nNative >= 1 && nNative <= 3 ? String(nNative) : nNative ? "many" : "0") && (!!s.panel === s.low) && (!s.panel || (s.panel.length >= 1 && /^Fler/.test(await p.evaluate(() => document.querySelector(".hz8-sf-more__title").textContent)))) && !(s.panel && s.cont), { n: s.n, low: s.low, panel: s.panel && s.panel.map(x => x[0]), cont: s.cont, lowExpected });
  ok(`route-${k}-others-no-paused`, !s.others || s.others.every(n => !PAUSED.test(n.split(" ")[0]) && !n.startsWith(serie + " ")), s.others);
  ok(`route-${k}-seo-untouched`, s.canon && s.canon.split("?")[0].endsWith(path) && !/\?/.test(s.canon), { canon: s.canon, title: s.title });
  ok(`route-${k}-clean`, s.ov === 0 && !errs(p).length, { ov: s.ov, err: errs(p).slice(0, 2) });
  await ctx.close(); }

// ---------- 2. kontrollsidor ----------
if (run("control")) for (const path of ["/sv/categories/alla-cartridges", "/sv/categories/hasch", "/sv/categories/alla-vapes", "/sv/categories/magic-sauce"]) {
  const { p, ctx } = await page(1440, 900, path); const s = await state(p);
  const want = { "alla-cartridges": "format", hasch: "format", "alla-vapes": "format", "magic-sauce": "series-hub" }[path.split("/").pop()];
  ok(`control-${path.split("/").pop()}`, s.ctx && s.ctx[0] === want && !s.sf && !s.eyebrow && !s.tabs.length && s.ov === 0 && !errs(p).length, { ctx: s.ctx, sf: s.sf, h1: s.h1 });
  await ctx.close(); }

// ---------- 3. query-filtret: omladdning, bakåt, framåt ----------
if (run("history")) { const { p, ctx } = await page(1440, 900, "/sv/categories/hasch", "filters=Serie_Magic%20Sauce", { wait: 10000 });
  const a = await state(p);
  await p.reload({ waitUntil: "domcontentloaded" }); await p.waitForTimeout(10000); const r = await state(p);
  await p.locator(".hz8-sf-tab", { hasText: "Buds" }).first().click(); await p.waitForLoadState("domcontentloaded"); await p.waitForTimeout(10000); const buds = await state(p);
  await p.goBack({ waitUntil: "domcontentloaded" }); await p.waitForTimeout(10000); const back = await state(p);
  await p.goForward({ waitUntil: "domcontentloaded" }); await p.waitForTimeout(10000); const fwd = await state(p);
  const isMSH = s => s.sf && s.ctx && s.ctx.join() === "combo,Magic Sauce,hasch,true";
  ok("history-query-view", isMSH(a) && isMSH(r) && buds.ctx.join() === "combo,Magic Sauce,buds,false" && isMSH(back) && fwd.ctx.join() === "combo,Magic Sauce,buds,false" && back.native === a.native, { a: a.ctx, r: r.ctx, buds: buds.ctx, back: back.ctx, fwd: fwd.ctx, n: [a.native, back.native] });
  await ctx.close(); }

// ---------- 4. layoutregel 0/1/2/3/4/många + kortbredd ----------
if (run("layout")) { const W = {};
  for (const [k, path, q] of [["0", "/sv/categories/thca-carts", "filters=Serie_Magic%20Sauce"], ["1", "/sv/categories/thca-carts", ""], ["2", "/sv/categories/m-s-vapes", ""], ["3", "/sv/categories/thcb-vapes", ""], ["4", "/sv/categories/thca-vapes", ""], ["many", "/sv/categories/thca-blommor", ""]]) {
    const { p, ctx } = await page(1440, 900, path, q, { wait: 11000 }); const s = await state(p);
    const g = await p.evaluate(() => { const c = document.querySelector("#category-products .product-card"); const m = document.querySelector(".hz8-sf-more"); const grid = document.getElementById("category-products"); return { cardW: c ? Math.round(c.getBoundingClientRect().width) : null, cardTop: c ? Math.round(c.getBoundingClientRect().top) : null, panel: m && !m.hidden && m.getClientRects().length ? (r => [Math.round(r.left), Math.round(r.top), Math.round(r.width), Math.round(r.height)])(m.getBoundingClientRect()) : null, gridRight: grid ? Math.round(grid.getBoundingClientRect().right) : null, empty: !!document.querySelector(".hz8-cat-empty") }; });
    W[k] = g; console.log("layout", k, JSON.stringify({ n: s.n, low: s.low, ...g }));
    if (k === "0") ok("layout-empty", s.cards === 0 && g.empty && !g.panel && s.n === "0", { ...g, n: s.n });
    else if (k === "many" || k === "4") ok(`layout-${k}`, !s.low && !g.panel && s.cont && s.cont.length > 0, { n: s.n, cont: s.cont });
    else ok(`layout-${k}`, s.low && g.panel && Math.abs(g.panel[1] - g.cardTop) <= 2 && g.panel[0] > g.gridRight, { n: s.n, ...g });
    await ctx.close(); }
  const ws = ["1", "2", "3", "4"].map(k => W[k].cardW); ok("layout-card-width-constant", ws.every(x => Math.abs(x - ws[3]) <= 1), ws); }

// ---------- 5. responsivt + 200 % zoom ----------
if (run("responsive")) for (const path of ["/sv/categories/m-s-vapes", "/sv/categories/thca-vapes", "/sv/categories/hasch"]) for (const [w, h, sc] of [[320, 700], [393, 852], [430, 932], [768, 1024], [1024, 768], [1280, 800], [1440, 900], [1512, 982], [1920, 1080], [720, 450, 2]]) {
  const q = path.endsWith("hasch") ? "filters=Serie_Magic%20Sauce" : "";
  const { p, ctx } = await page(w, h, path, q, { scale: sc, wait: 10000 });
  const r = await p.evaluate(() => { const clipped = sel => [...document.querySelectorAll(sel)].filter(e => e.getClientRects().length && (e.scrollWidth > e.clientWidth + 1)).map(e => e.textContent.trim().slice(0, 30));
    const c = document.querySelector("#category-products .product-card"); const tabs = document.querySelector(".hz8-sf-tabs__list");
    const cta = [...document.querySelectorAll("#category-products .hz8-card-pill, #category-products .hz8-psold")].filter(e => e.getBoundingClientRect().width > 0).filter(e => { const r = e.getBoundingClientRect(), pr = e.closest(".product-card").getBoundingClientRect(); return r.right > pr.right + 1 || r.left < pr.left - 1; }).length;
    return { ov: document.documentElement.scrollWidth - innerWidth, h1Clip: clipped("h1, .hz8-sf-lead, .hz8-sf-eyebrow, .hz8-card-pill, .hz8-sf-tab, .hz8-sf-more__title"), cta, firstCard: c ? Math.round(c.getBoundingClientRect().top + scrollY) : null, tabsScroll: tabs ? tabs.scrollWidth > tabs.clientWidth : null, cols: getComputedStyle(document.getElementById("category-products")).gridTemplateColumns.split(" ").length };
  });
  const tag = `${path.split("/").pop()}-${w}${sc ? "z2" : ""}`;
  ok(`resp-${tag}`, r.ov === 0 && !r.h1Clip.length && !r.cta && !errs(p).length && (w >= 768 || sc || r.firstCard < 560), r);
  await ctx.close(); }

// ---------- 6. tangentbord, lagerväxel, reducerad rörelse ----------
if (run("a11y")) { const { p, ctx } = await page(1440, 900, "/sv/categories/thca-vapes", "", { wait: 10000 });
  const tabs = await p.$$eval(".hz8-sf-tab", a => a.length); await p.focus(".hz8-sf-tabs"); await p.evaluate(() => { const b = document.querySelector(".hz8-sf-tabs"); b.setAttribute("tabindex", "-1"); b.focus(); }); await p.keyboard.press("Tab");
  const foc = []; for (let i = 0; i < tabs; i++) { foc.push(await p.evaluate(() => [document.activeElement.textContent, getComputedStyle(document.activeElement).outlineStyle])); await p.keyboard.press("Tab"); }
  ok("a11y-tabs-keyboard", foc.length === tabs && foc.every(f => f[1] !== "none"), foc);
  ok("a11y-aria-current", (await p.$$eval('.hz8-sf-tab[aria-current="page"]', a => a.map(x => x.textContent))).join() === "Vapes");
  const sw = p.locator(".hz8-sf-stock"); const before = await p.evaluate(() => [location.search, document.querySelector("#products_count").textContent]);
  await sw.focus(); await p.keyboard.press("Enter"); await p.waitForTimeout(4000);
  const after = await p.evaluate(() => [location.search, document.querySelector("#products_count").textContent, document.querySelector(".hz8-sf-stock").getAttribute("aria-checked")]);
  ok("a11y-stock-switch", /Lagerstatus|in-stock|lager/i.test(decodeURIComponent(after[0])) && after[2] === "true", { before, after });
  await ctx.close();
  const { p: p2, ctx: c2 } = await page(1440, 900, "/sv/categories/thca-vapes", "", { reduced: true });
  ok("a11y-reduced-motion", await p2.evaluate(() => getComputedStyle(document.querySelector(".hz8-sf-eyebrow")).animationName === "none"));
  await c2.close(); }

// ---------- 7. R2: glashylla, densitet, panel, rail, mobilkontroll, CLS ----------
if (run("r2")) {
  for (const [w, h] of [[1024, 768], [1280, 800], [1440, 900], [1920, 1080]]) {
    const ctx = await ctxFor(b, w, h, {}); await ctx.addInitScript(() => { window.__cls = 0; new PerformanceObserver(l => { for (const e of l.getEntries()) if (!e.hadRecentInput) window.__cls += e.value; }).observe({ type: "layout-shift", buffered: true }); });
    const p = await open(ctx, URL_("/sv/categories/m-s-vapes")); await p.waitForTimeout(11000);
    const r = await p.evaluate(() => { const t = document.querySelector(".hz8-sf-tabs"), tr = t.getBoundingClientRect(), g = document.querySelector("#store-main .designer-category").getBoundingClientRect(), s = document.querySelector(".category-sort").getBoundingClientRect();
      const before = getComputedStyle(t, "::before"); const cs = getComputedStyle(t);
      const cards = [...document.querySelectorAll("#category-products .product-card")].map(c => c.getBoundingClientRect());
      const prices = [...document.querySelectorAll("#category-products .product-card .price")].map(x => Math.round(x.getBoundingClientRect().bottom));
      const ctas = [...document.querySelectorAll("#category-products :is(.hz8-card-pill, .hz8-psold)")].filter(x => x.getBoundingClientRect().width).map(x => Math.round(x.getBoundingClientRect().bottom));
      const art = getComputedStyle(document.querySelector(".hz8-sf-more")).backgroundImage + " | art:" + getComputedStyle(document.querySelector(".hz8-sf-more__art")).display;
      return { one: !document.documentElement.classList.contains("hz8-sf-stack") && innerWidth >= 1280, strip: before.content !== "none" && before.content !== "normal" && parseFloat(before.width) > innerWidth - 2, blur: cs.backdropFilter, bg: cs.backgroundColor, radius: cs.borderTopLeftRadius,
        shelf: [Math.round(tr.left), Math.round(tr.right), Math.round(tr.height)], content: [Math.round(g.left), Math.round(g.right)], sortInShelf: s.top < tr.bottom && s.bottom > tr.top,
        cardH: cards.map(c => Math.round(c.height)), cardBottoms: cards.map(c => Math.round(c.bottom)), prices, ctas, art, cls: Math.round(window.__cls * 1e4) / 1e4, ov: document.documentElement.scrollWidth - innerWidth }; });
    ok(`r2-shelf-${w}`, !r.strip && /blur\(20px\)/.test(r.blur) && Math.abs(r.shelf[0] - r.content[0]) <= 1 && Math.abs(r.shelf[1] - r.content[1]) <= 1 && (w >= 1280 ? r.one && r.sortInShelf : !r.sortInShelf), r);
    ok(`r2-cards-${w}`, new Set(r.cardBottoms).size === 1 && new Set(r.ctas).size <= 1 && (w !== 1440 || r.cardH.every(x => x >= 430 && x <= 470)), { cardH: r.cardH, bottoms: r.cardBottoms, ctas: r.ctas });
    ok(`r3-panel-art-${w}`, /series-format-r3\/explore-panel-standard-r3\.webp/.test(r.art) && /art:none/.test(r.art) && !/data:/.test(r.art), r.art.slice(-140));
    ok(`r2-cls-${w}`, r.cls < 0.05 && r.ov === 0 && !errs(p).length, { cls: r.cls, ov: r.ov });
    const rail = await p.evaluate(() => { const l = document.querySelector(".hz8-sf-series"); const a = [...l.querySelectorAll("a")]; return { n: a.length, h: Math.round(a[0].getBoundingClientRect().height), w: Math.round(a[0].getBoundingClientRect().width), hrefs: a.every(x => /\/sv\/categories\//.test(x.getAttribute("href"))), all: (document.querySelector(".hz8-sf-row__all") || {}).getAttribute ? document.querySelector(".hz8-sf-row__all").getAttribute("href") : null }; });
    ok(`r2-rail-${w}`, rail.n >= 1 && rail.h <= 120 && rail.hrefs && /alla-vapes/.test(rail.all || ""), rail);
    await ctx.close(); }
  // Panelvarianter 1/3 produkter (desktop) -- ingen överlappning, länkar läsbara.
  for (const [k, path] of [["1", "/sv/categories/thca-carts"], ["3", "/sv/categories/thcb-vapes"]]) {
    const { p, ctx } = await page(1440, 900, path, "", { wait: 11000 });
    const r = await p.evaluate(() => { const m = document.querySelector(".hz8-sf-more"), mr = m.getBoundingClientRect(), t = m.querySelector(".hz8-sf-more__title"); const links = [...m.querySelectorAll("a")].map(a => a.getBoundingClientRect());
      const card = document.querySelector("#category-products .product-card").getBoundingClientRect();
      return { title: parseFloat(getComputedStyle(t).fontSize), w: Math.round(mr.width), bottom: Math.round(mr.bottom), cardBottom: Math.round(card.bottom), linksInside: links.every(l => l.right <= mr.right + 1 && l.height >= 44), lead: getComputedStyle(m.querySelector(".hz8-sf-more__lead")).display, bg: getComputedStyle(m).backgroundImage, eyebrow: m.querySelector(".hz8-sf-more__eyebrow").innerText, serie: HZ8.catalog.contextFor(location.href).series.name }; });
    ok(`r2-panel-${k}`, r.title <= 31 && r.linksInside && Math.abs(r.bottom - r.cardBottom) <= 2 && r.lead !== "none" && /series-format-r3\/explore-panel-(wide|narrow)-r3/.test(r.bg) && (k === "1" ? /wide/.test(r.bg) : /narrow/.test(r.bg)) && r.eyebrow === r.serie.toUpperCase() + " · UPPTÄCK MER", r);
    await ctx.close(); }
  // Mobil: hylla överlappar hero, en kontroll, rail svepbar.
  for (const [w, h] of [[320, 700], [393, 852], [430, 932]]) {
    const { p, ctx } = await page(w, h, "/sv/categories/m-s-vapes", "", { wait: 11000 });
    const r = await p.evaluate(() => { const t = document.querySelector(".hz8-sf-tabs").getBoundingClientRect(), hero = document.querySelector(".hz8-sf-hero").getBoundingClientRect();
      const vis = sel => [...document.querySelectorAll(sel)].filter(e => e.getClientRects().length && getComputedStyle(e).display !== "none").length;
      const fs = document.querySelector(".hz8-sf-fs__btn").getBoundingClientRect(); const rail = document.querySelector(".hz8-sf-series"); const card = rail.querySelector("a").getBoundingClientRect();
      const panel = document.querySelector(".hz8-sf-more").getBoundingClientRect();
      return { overlap: Math.round(hero.bottom - t.top), native: vis(".category-sort .product-filter-button, .category-sort .sort-control, .category-sort .hz8-sf-stock"), fsH: Math.round(fs.height), railScroll: rail.scrollWidth > rail.clientWidth, cardRatio: +(card.width / rail.clientWidth).toFixed(2), panelH: Math.round(panel.height), ov: document.documentElement.scrollWidth - innerWidth }; });
    ok(`r2-mobile-${w}`, r.overlap >= 10 && r.overlap <= 18 && r.native === 0 && r.fsH >= 44 && (!r.railScroll || (r.cardRatio >= .7 && r.cardRatio <= .82)) && r.panelH <= 285 && r.ov === 0 && !errs(p).length, r);
    if (w === 393) {
      await p.click(".hz8-sf-fs__btn"); await p.waitForTimeout(300);
      const o = await p.evaluate(() => ({ open: !document.querySelector(".hz8-sf-fs__panel").hidden, exp: document.querySelector(".hz8-sf-fs__btn").getAttribute("aria-expanded"), sorts: [...document.querySelectorAll(".hz8-sf-fs__sort")].map(b => b.textContent), sw: document.querySelector(".hz8-sf-fs__stock").getAttribute("role") }));
      await p.keyboard.press("Escape"); await p.waitForTimeout(200);
      const esc = await p.evaluate(() => document.querySelector(".hz8-sf-fs__panel").hidden && document.activeElement === document.querySelector(".hz8-sf-fs__btn"));
      await p.click(".hz8-sf-fs__btn"); await p.waitForTimeout(300);
      await p.click('.hz8-sf-fs__sort[data-native="Lägsta pris"]'); await p.waitForTimeout(4000);
      const so = await p.evaluate(() => location.search);
      await p.click(".hz8-sf-fs__btn"); await p.waitForTimeout(300); await p.click(".hz8-sf-fs__stock"); await p.waitForTimeout(4000);
      const st = await p.evaluate(() => ({ url: decodeURIComponent(location.search), badge: document.querySelector(".hz8-sf-fs__n").textContent, checked: document.querySelector(".hz8-sf-fs__stock").getAttribute("aria-checked") }));
      ok("r2-mobile-filter-sort", o.open && o.exp === "true" && o.sorts.length >= 2 && o.sw === "switch" && esc && /sort=price_low/.test(so) && /lager|in-stock/i.test(st.url) && st.badge === "1" && st.checked === "true", { o, esc, so, st });
    }
    await ctx.close(); }
  // R3: seriekortens bilder, fallback, mobilpanelens asset och att alla R3-anrop lyckas.
  { const ctx = await ctxFor(b, 1440, 900, {}); const bad = []; ctx.on("response", r => { if (/series-format-r3/.test(r.url()) && r.status() >= 400) bad.push(r.status() + " " + r.url()); });
    const p = await open(ctx, URL_("/sv/categories/m-s-buds")); await p.waitForTimeout(11000);
    await p.evaluate(() => document.querySelector(".hz8-sf-others").scrollIntoView()); await p.waitForTimeout(1200);
    const r = await p.evaluate(() => [...document.querySelectorAll(".hz8-sf-serie")].map(a => { const n = a.querySelector(".hz8-sf-serie__name").getBoundingClientRect(), ar = a.getBoundingClientRect(); return { name: a.querySelector(".hz8-sf-serie__name").textContent, key: a.getAttribute("data-hz8-series-art"), img: !!a.querySelector("img"), bg: (getComputedStyle(a).backgroundImage.match(/series-format-r3\/[^")]+/) || [null])[0], href: a.getAttribute("href"), textPct: Math.round(100 * (n.right - ar.left) / ar.width), size: [Math.round(ar.width), Math.round(ar.height)], fallbackBg: getComputedStyle(a).backgroundColor }; }));
    const MAP = { "Magic Sauce": "magic-sauce", THCaB: "thcab", THCbA: "thcba", Core: "core", THCV: "thcv" };
    const okCards = r.every(c => { const s = Object.keys(MAP).find(k => c.name.startsWith(k + " ")); return s ? c.key === MAP[s] && !c.img && c.bg === "series-format-r3/series-" + MAP[s] + "-vapes-r3.webp" && c.textPct <= 82 && /\/sv\/categories\//.test(c.href) : c.key === null && c.img && !c.bg; });
    ok("r3-series-cards-and-fallback", r.length >= 2 && okCards && r.some(c => !c.key) && !bad.length && !errs(p).length, { r, bad });
    await ctx.close(); }
  { const ctx = await ctxFor(b, 393, 852, {}); const p = await open(ctx, URL_("/sv/categories/m-s-vapes")); await p.waitForTimeout(11000);
    const r = await p.evaluate(() => { const m = document.querySelector(".hz8-sf-more"), b2 = m.querySelector(".hz8-sf-more__body"); const links = [...m.querySelectorAll(".hz8-sf-more__link")].map(a => Math.round(a.getBoundingClientRect().height)); return { bg: getComputedStyle(m).backgroundImage.match(/series-format-r3\/[^")]+/g), h: Math.round(m.getBoundingClientRect().height), body: Math.round(100 * b2.getBoundingClientRect().width / m.getBoundingClientRect().width), title: parseFloat(getComputedStyle(m.querySelector(".hz8-sf-more__title")).fontSize), links, ov: document.documentElement.scrollWidth - innerWidth }; });
    ok("r3-mobile-panel", r.bg && r.bg[0] === "series-format-r3/explore-panel-mobile-r3.webp" && r.body >= 54 && r.body <= 62 && r.title >= 23 && r.title <= 24 && r.links.every(x => x >= 35) && r.h <= 285 && r.ov === 0, r);
    await ctx.close(); }
  // Verktygsraden ligger i flödet: flyter aldrig över produktkorten vid scroll.
  for (const [w, h, sc] of [[320, 700], [393, 852], [430, 932], [720, 450, 2], [1024, 768], [1440, 900]]) {
    const ctx = await ctxFor(b, w, h, sc ? { scale: sc } : {}); const p = await open(ctx, URL_("/sv/categories/m-s-vapes")); await p.waitForTimeout(10000);
    await p.mouse.move(w / 2, h - 100); const hits = [];
    for (let i = 0; i < 24; i++) { await p.mouse.wheel(0, 30); await p.waitForTimeout(50); hits.push(await p.evaluate(() => { const sr = document.querySelector(".category-sort").getBoundingClientRect(); return [...document.querySelectorAll("#category-products .product-card")].some(c => { const r = c.getBoundingClientRect(); return sr.height > 0 && sr.bottom > r.top + 1 && sr.top < r.bottom - 1; }); })); }
    const pos = await p.evaluate(() => getComputedStyle(document.querySelector(".category-sort")).position);
    ok(`r3-toolbar-in-flow-${w}${sc ? "z2" : ""}`, !hits.some(Boolean) && pos !== "sticky" && pos !== "fixed" && !errs(p).length, { pos, overlaps: hits.filter(Boolean).length });
    await ctx.close(); }
  // Tangentbord: serie-rail nås och scrollar in kort.
  { const { p, ctx } = await page(393, 852, "/sv/categories/m-s-vapes", "", { wait: 11000 });
    const links = await p.$$eval(".hz8-sf-series a", a => a.length);
    await p.focus(".hz8-sf-series a"); for (let i = 1; i < links; i++) await p.keyboard.press("Tab"); await p.waitForTimeout(800);
    const r = await p.evaluate(() => { const a = document.activeElement, l = document.querySelector(".hz8-sf-series"); const ar = a.getBoundingClientRect(), lr = l.getBoundingClientRect(); return { a: [Math.round(ar.left), Math.round(ar.right)], l: [Math.round(lr.left), Math.round(lr.right)], sl: Math.round(l.scrollLeft), sw: l.scrollWidth, cw: l.clientWidth, inRail: l.contains(a), visible: ar.left >= lr.left - 3 && ar.right <= lr.right + 3, scrolled: l.scrollLeft > 0 || l.scrollWidth <= l.clientWidth, ov: document.documentElement.scrollWidth - innerWidth }; });
    ok("r2-rail-keyboard", r.inRail && r.visible && r.scrolled && r.ov === 0, r); await ctx.close(); }
}

fs.writeFileSync(new URL("./tests-result.json", import.meta.url), JSON.stringify(R, null, 1));
console.log("FAILED:", fail.length, JSON.stringify(fail)); await b.close();
