// Filterhylla, filtrerade vyer, SEO-text, korttitlar. node tests.mjs [group,...]
import { chromium, ctxFor, open, URL_ } from "../pdp-pilot-2026-10/lib.mjs"; import fs from "node:fs";
const only = (process.argv[2] || "").split(",").filter(Boolean); const run = g => !only.length || only.includes(g);
const b = await chromium.launch(); const fail = []; const R = {};
const ok = (n, c, d) => { R[n] = { pass: !!c, d }; if (!c) fail.push(n); console.log((c ? "PASS " : "FAIL ") + n, d === undefined ? "" : JSON.stringify(d).slice(0, 420)); };
const errs = p => p.errors.filter(e => !/Failed to load|429|net::/.test(e));
async function page(w, h, path, q = "", o = {}) { const ctx = await ctxFor(b, w, h, { reduced: o.reduced, scale: o.scale }); const p = await open(ctx, URL_(path, q)); await p.waitForTimeout(o.wait || 10000); return { p, ctx }; }
const st = p => p.evaluate(() => { const sort = document.querySelector(".category-sort"); const html = document.documentElement;
  return { h1: [...document.querySelectorAll("h1")].map(h => h.textContent.trim()), sf: html.classList.contains("hz8-sf"), shelf: html.classList.contains("hz8-catshelf"),
    count: ((document.getElementById("products_count") || {}).textContent || "").trim(), cards: document.querySelectorAll("#category-products .product-card").length,
    chips: [...document.querySelectorAll(".category-sort .selected-filters.is-hidden-touch .selected-filters-item:not(.no-chip), .category-sort .selected-filters .selected-filters-item:not(.no-chip)")].filter(c => c.getClientRects().length).map(c => c.textContent.replace(/\s+/g, " ").trim()),
    stale: /filtrerat på/i.test(document.body.innerText), url: location.search, sortPos: sort ? getComputedStyle(sort).position : null, sortBg: sort ? getComputedStyle(sort, "::before").backgroundColor + "|" + getComputedStyle(sort).backgroundColor : null,
    bodyW: Math.round(document.body.getBoundingClientRect().width), ov: document.documentElement.scrollWidth - innerWidth }; });

// 1. Filtrerade vyer utanför de representativa breda sidorna.
if (run("filtered")) {
  // Filtrerad carts + Alla Vapes med native Serie-filter.
  const c = await page(1440, 900, "/sv/categories/alla-cartridges", "filters=Serie_Magic%20Sauce"); const cs = await st(c.p);
  ok("filtered-carts-broad", cs.h1.join() === "Alla Carts" && !cs.sf && cs.chips.some(x => /Magic Sauce/.test(x)) && !cs.stale, cs); await c.ctx.close();
  const v = await page(1440, 900, "/sv/categories/alla-vapes", "filters=Serie_Magic%20Sauce", { wait: 13000 });
  const vs = await v.p.evaluate(() => ({ url: location.search, chips: [...document.querySelectorAll(".hz8-pchip")].map(c => c.textContent), count: document.querySelector(".hz8-pcount").textContent }));
  ok("alla-vapes-native-serie-translated", /serie=magic-sauce/.test(vs.url) && !/Serie_/.test(vs.url) && vs.chips.some(c => /Magic Sauce/.test(c)) && /2 produkter/.test(vs.count), vs); await v.ctx.close();
  // Dedikerade R3-sidor oförändrade.
  for (const [path, h1] of [["/sv/categories/m-s-vapes", "Magic Sauce Vapes"], ["/sv/categories/m-s-buds", "Magic Sauce Buds"], ["/sv/categories/thca-vapes", "THCaB Vapes"], ["/sv/categories/thca-hash", "THCaB Hasch"]]) {
    const d = await page(1440, 900, path); const ds = await st(d.p); ok(`dedicated-${path.split("/").pop()}`, ds.sf && ds.h1.join() === h1 && ds.ov === 0, { sf: ds.sf, h1: ds.h1 }); await d.ctx.close(); } }

// 2. Hyllan: glas, i flödet, ingen överlappning, aktiva filter i samma hylla, mobil 44 px.
if (run("shelf")) for (const path of ["/sv/categories/alla-cartridges"]) for (const [w, h, sc] of [[320, 700], [393, 852], [430, 932], [768, 1024], [1024, 768], [1280, 800], [1440, 900], [1512, 982], [1920, 1080], [720, 450, 2]]) {
  const { p, ctx } = await page(w, h, path, "", { scale: sc });
  const s0 = await st(p);
  await p.mouse.move(w / 2, h - 80); const hits = [];
  for (let i = 0; i < 18; i++) { await p.mouse.wheel(0, 60); await p.waitForTimeout(50); hits.push(await p.evaluate(() => { const sr = document.querySelector(".category-sort").getBoundingClientRect(); const hd = document.querySelector("#store-header .main").getBoundingClientRect(); return [...document.querySelectorAll("#category-products .product-card")].some(c => { const r = c.getBoundingClientRect(); return sr.bottom > r.top + 1 && sr.top < r.bottom - 1; }) || (sr.top < hd.bottom && sr.bottom > hd.top && !document.documentElement.classList.contains("hz8-header-hidden")); })); }
  const g = await p.evaluate(() => { const s = document.querySelector(".category-sort"), r = s.getBoundingClientRect(), main = document.querySelector("#category-products").getBoundingClientRect(); const fs = document.querySelector(".hz8-sf-fs__btn"); const vis = e => e && e.getClientRects().length && getComputedStyle(e).display !== "none";
    return { L: Math.round(r.left), R: Math.round(r.right), gL: Math.round(main.left), gR: Math.round(main.right), radius: getComputedStyle(s).borderTopLeftRadius, glass: getComputedStyle(s, "::before").backdropFilter, h: Math.round(r.height), fs: vis(fs) ? Math.round(fs.getBoundingClientRect().height) : 0, native: [...s.querySelectorAll(".product-filter-button, .sort-control")].filter(vis).length, empty: s.querySelectorAll(":scope *").length === 0 }; });
  const mob = w < 768 && !sc;
  const tag = `${path.split("/").pop()}-${w}${sc ? "z2" : ""}`;
  ok(`shelf-${tag}`, s0.shelf && s0.sortPos !== "sticky" && s0.sortPos !== "fixed" && !hits.some(Boolean) && Math.abs(g.L - g.gL) <= 2 && Math.abs(g.R - g.gR) <= 2 && /blur/.test(g.glass) && parseFloat(g.radius) >= 14 && !g.empty && (mob ? g.fs >= 44 && g.native === 0 : g.h <= 80) && s0.ov === 0 && s0.h1.length === 1 && !errs(p).length, { ...g, pos: s0.sortPos, overlap: hits.filter(Boolean).length, ov: s0.ov });
  await ctx.close(); }

// 3. Mobil Filter & sortera på bred sida: sortering + lager + badge.
if (run("mobile")) { const { p, ctx } = await page(393, 852, "/sv/categories/alla-cartridges");
  await p.click(".hz8-sf-fs__btn"); await p.waitForTimeout(300); const open1 = await p.evaluate(() => !document.querySelector(".hz8-sf-fs__panel").hidden);
  await p.keyboard.press("Escape"); await p.waitForTimeout(200); const esc = await p.evaluate(() => document.querySelector(".hz8-sf-fs__panel").hidden && document.activeElement === document.querySelector(".hz8-sf-fs__btn"));
  await p.click(".hz8-sf-fs__btn"); await p.waitForTimeout(300); await p.click('.hz8-sf-fs__sort[data-native="Lägsta pris"]'); await p.waitForTimeout(5000);
  const so = await p.evaluate(() => location.search);
  await p.click(".hz8-sf-fs__btn"); await p.waitForTimeout(300); await p.click(".hz8-sf-fs__stock"); await p.waitForTimeout(5000);
  const sk = await p.evaluate(() => ({ url: decodeURIComponent(location.search), badge: document.querySelector(".hz8-sf-fs__n").textContent, checked: document.querySelector(".hz8-sf-fs__stock").getAttribute("aria-checked"), ov: document.documentElement.scrollWidth - innerWidth }));
  ok("mobile-filter-sort-broad", open1 && esc && /sort=price_low/.test(so) && /in-stock/.test(sk.url) && sk.badge === "1" && sk.checked === "true" && sk.ov === 0 && !errs(p).length, { open1, esc, so, sk }); await ctx.close();
  const d = await page(1440, 900, "/sv/categories/alla-cartridges"); await d.p.locator(".hz8-sf-stock").focus(); await d.p.keyboard.press("Enter"); await d.p.waitForTimeout(5000);
  const ds = await d.p.evaluate(() => ({ url: decodeURIComponent(location.search), checked: document.querySelector(".hz8-sf-stock").getAttribute("aria-checked"), chips: [...document.querySelectorAll(".category-sort .selected-filters-item:not(.no-chip)")].filter(c => c.getClientRects().length).map(c => c.textContent.trim()) }));
  ok("desktop-stock-switch-keyboard", /in-stock/.test(ds.url) && ds.checked === "true" && ds.chips.length >= 1, ds); await d.ctx.close(); }

// 4. Alla Vapes: hylla + docka aldrig samtidigt.
if (run("pilot")) for (const w of [1024, 1440, 1920]) { const { p, ctx } = await page(w, 900, "/sv/categories/alla-vapes", "", { wait: 13000 });
  const g = await p.evaluate(() => { const d = document.querySelector(".hz8-ptool__desk"); const cs = getComputedStyle(d); const bef = getComputedStyle(document.querySelector(".hz8-ptool"), "::before"); return { glass: cs.backdropFilter, radius: cs.borderTopLeftRadius, strip: bef.content !== "none" && parseFloat(bef.width) > innerWidth - 2 }; });
  await p.mouse.move(w / 2, 800); const both = []; for (let i = 0; i < 120; i++) { await p.mouse.wheel(0, 40); await p.waitForTimeout(30); if (await p.evaluate(() => { const t = document.querySelector(".hz8-ptool").getBoundingClientRect(), b = document.querySelector(".hz8-pdock__btn"), cs = getComputedStyle(b); return t.bottom > 0 && t.top < innerHeight && cs.visibility === "visible" && +cs.opacity > .02 && b.getBoundingClientRect().right > 0; })) both.push(i); }
  ok(`pilot-shelf-${w}`, /blur/.test(g.glass) && parseFloat(g.radius) >= 14 && !g.strip && !both.length && !errs(p).length, { ...g, both: both.length }); await ctx.close(); }

// 5. Kategoritext längst ned.
if (run("seo")) for (const [path, q] of [["/sv/categories/hasch", ""], ["/sv/categories/blommor-buds", ""], ["/sv/categories/alla-cartridges", ""], ["/sv/categories/alla-vapes", ""], ["/sv/categories/m-s-vapes", ""], ["/sv/categories/hasch", "filters=Serie_Magic+Sauce"]]) for (const w of [1440, 393]) {
  const { p, ctx } = await page(w, w > 700 ? 900 : 852, path, q, { wait: 11000 });
  const s = await p.evaluate(() => { const html = document.documentElement; const R = e => e && e.getClientRects().length ? e.getBoundingClientRect() : null;
    const head = R(document.querySelector(".hz8-cat-about-head")), box = R(document.querySelector("article.category-description .readmore")), btn = document.querySelector(".hz8-seo-toggle"), guide = R(document.querySelector(".hz8-cat-guide")), grid = R(document.querySelector("#category-products, .hz8-series-results"));
    const content = document.querySelector(".readmore__content"); const txt = content ? content.textContent.replace(/\s+/g, " ").trim().length : 0;
    return { seo: html.classList.contains("hz8-seo"), empty: html.classList.contains("hz8-seo-empty"), txt, h1: document.querySelectorAll("h1").length, nativeBtn: [...document.querySelectorAll(".readmore__toggle")].filter(e => e.getClientRects().length).length,
      headTop: head && Math.round(head.top + scrollY), boxTop: box && Math.round(box.top + scrollY), boxBottom: box && Math.round(box.bottom + scrollY), guideTop: guide && Math.round(guide.top + scrollY), gridBottom: grid && Math.round(grid.bottom + scrollY), btn: btn ? [btn.textContent, btn.getAttribute("aria-expanded"), Math.round(R(btn).height)] : null, inDom: !!content }; });
  const tag = `seo-${path.split("/").pop()}${q ? "-ms" : ""}-${w}`;
  if (s.empty || !s.seo) { ok(tag, s.h1 === 1 && (s.txt < 120) && !s.btn, s); await ctx.close(); continue; }
  const order = s.gridBottom < s.headTop && s.headTop < s.boxTop && s.boxBottom < s.guideTop;
  await p.locator(".hz8-seo-toggle").focus(); await p.keyboard.press("Enter"); await p.waitForTimeout(400);
  const o = await p.evaluate(() => { const c = document.querySelector(".readmore__content"); const b = document.querySelector(".hz8-seo-toggle"); const g = document.querySelector(".hz8-cat-guide").getBoundingClientRect(); return { h: Math.round(c.getBoundingClientRect().height), exp: b.getAttribute("aria-expanded"), label: b.textContent, overlap: b.getBoundingClientRect().bottom > g.top }; });
  await p.keyboard.press("Enter"); await p.waitForTimeout(300); const back = await p.evaluate(() => document.querySelector(".hz8-seo-toggle").getAttribute("aria-expanded"));
  ok(tag, s.h1 === 1 && s.inDom && !s.nativeBtn && order && s.btn[1] === "false" && s.btn[0] === "Visa mer" && s.btn[2] >= 44 && o.exp === "true" && o.label === "Visa mindre" && o.h > 300 && !o.overlap && back === "false" && !errs(p).length, { ...s, open: o });
  await ctx.close(); }

// 6. Korttitlar: volym bort ur synlig titel när samma tagg finns, hela namnet i etiketter; täthet.
if (run("cards")) for (const [path, w] of [["/sv/categories/m-s-vapes", 1440], ["/sv/categories/thca-vapes", 1440], ["/sv/categories/alla-vapes", 1440], ["/sv/categories/thca-vapes", 393], ["/sv/categories/thca-hash", 1440]]) {
  const { p, ctx } = await page(w, w > 700 ? 900 : 852, path, "", { wait: 13000 });
  const r = await p.evaluate(() => [...document.querySelectorAll("#category-products .product-card, .hz8-series-results .product-card")].filter(c => c.offsetParent).map(c => { const n = c.querySelector(".name"), link = n && n.closest("a"); const tags = [...c.querySelectorAll(".hz8-pcardchip")].map(x => x.textContent); const pill = [...c.querySelectorAll(".hz8-card-pill, .hz8-psold")].find(x => x.getClientRects().length && getComputedStyle(x).display !== "none");
    return { shown: n.textContent, full: n.getAttribute("data-hz8-full"), aria: link && link.getAttribute("aria-label"), pillAria: pill && pill.getAttribute("aria-label"), tags, h: Math.round(c.getBoundingClientRect().height), cta: pill ? Math.round(pill.getBoundingClientRect().height) : null, bottom: Math.round(c.getBoundingClientRect().bottom) }; }));
  const bad = r.filter(c => { const endsVol = /\d\s*ml$/i.test(c.shown); const hasTag = c.tags.some(t => /ml$/.test(t)); if (c.full) return !(c.aria === c.full && !/\d\s*ml$/i.test(c.shown) && c.full.startsWith(c.shown) && (!c.pillAria || c.pillAria.indexOf(c.full) !== -1 || /^(Välj|Slutsåld)/.test(c.pillAria))); return endsVol && hasTag && false; });
  const trimmed = r.filter(c => c.full).length;
  const rows = {}; r.forEach(c => (rows[c.h] = 1));
  ok(`cards-${path.split("/").pop()}-${w}`, r.length && !bad.length && (/hash/.test(path) ? trimmed === 0 && r.every(c => !c.full) : trimmed >= 1) && r.every(c => c.cta === null || c.cta >= 44), { n: r.length, trimmed, bad: bad.slice(0, 2), sample: r.slice(0, 2).map(c => [c.shown, c.full, c.tags.join("/"), c.h, c.cta]) });
  await ctx.close(); }

// 7. Bred formatsida (Allt Hasch, Alla Buds): skalet ägs av pathname och
//    ändras aldrig av filter; gamla Produkttyp-/Serier-blocket finns aldrig.
const shellState = p => p.evaluate(() => { const html = document.documentElement; const vis = sel => [...document.querySelectorAll(sel)].filter(e => e.getClientRects().length && getComputedStyle(e).display !== "none" && getComputedStyle(e).visibility !== "hidden");
  const legacyHeads = [...document.querySelectorAll(".hz8-rail__heading")].filter(e => e.getClientRects().length).map(e => e.textContent.trim());
  return { shell: html.getAttribute("data-hz8-shell"), pilot: html.classList.contains("hz8-cat-pilot"), sf: html.classList.contains("hz8-sf"),
    legacy: vis(".hz8-cat-rails, .hz8-rail--format, .hz8-rail--series, .hz8-cat-popular, .hz8-cat-actions").length, legacyHeads,
    tabs: vis(".hz8-pfam__tab").map(t => t.textContent.trim() + (t.getAttribute("aria-pressed") === "true" ? "*" : "")),
    h1: [...document.querySelectorAll("h1")].map(h => h.textContent.trim()), count: (document.querySelector(".hz8-pcount") || {}).textContent || "",
    chips: [...document.querySelectorAll(".hz8-pchip")].map(c => c.textContent.replace("×", "").trim()), url: location.search, stale: /filtrerat på/i.test(document.body.innerText),
    toolPos: document.querySelector(".hz8-ptool") ? getComputedStyle(document.querySelector(".hz8-ptool")).position : null, hero: !!document.querySelector(".hz8-cat-hero__plaster"), guide: !!document.querySelector(".hz8-pguide"),
    ov: document.documentElement.scrollWidth - innerWidth }; });
const isBroadShell = (s, h1) => s.shell === "broad" && s.pilot && !s.sf && s.legacy === 0 && !s.legacyHeads.length && s.tabs.length >= 2 && s.h1.length === 1 && s.h1[0] === h1 && s.hero && s.guide && !s.stale && s.ov === 0;
async function watchShell(p) { await p.evaluate(() => { window.__shellChanges = []; new MutationObserver(m => m.forEach(x => { if (x.attributeName === "data-hz8-shell" || (x.attributeName === "class" && /hz8-(sf|cat-pilot)\b/.test(x.oldValue || "") !== /hz8-(sf|cat-pilot)\b/.test(document.documentElement.className))) window.__shellChanges.push(x.attributeName); })).observe(document.documentElement, { attributes: true, attributeOldValue: true }); }); }
if (run("broad")) {
  // Allt Hasch: Magic Sauce-filtrerad -> ta bort -> omladdning -> bakåt/framåt.
  { const { p, ctx } = await page(1440, 900, "/sv/categories/hasch", "filters=Serie_Magic+Sauce", { wait: 13000 });
    const a = await shellState(p); await watchShell(p);
    ok("broad-hasch-filtered-shell", isBroadShell(a, "Allt Hasch") && a.tabs.includes("Magic Sauce*") && a.chips.includes("Magic Sauce") && /2 produkter/.test(a.count) && /serie=magic-sauce/.test(a.url) && !/Serie_/.test(decodeURIComponent(a.url)), a);
    await p.locator(".hz8-pfam__tab", { hasText: "Allt Hasch" }).click(); await p.waitForTimeout(6000);
    const r = await shellState(p); const ch = await p.evaluate(() => window.__shellChanges);
    ok("broad-hasch-remove-filter", isBroadShell(r, "Allt Hasch") && r.tabs[0] === "Allt Hasch*" && !r.chips.length && /16 produkter/.test(r.count) && !/serie=|Serie_/.test(decodeURIComponent(r.url)) && !ch.length, { r, shellChanges: ch });
    await p.reload({ waitUntil: "domcontentloaded" }); await p.waitForTimeout(13000); const rl = await shellState(p);
    ok("broad-hasch-reload", isBroadShell(rl, "Allt Hasch") && !rl.chips.length && /16 produkter/.test(rl.count), rl);
    await p.goBack({ waitUntil: "domcontentloaded" }).catch(() => {}); await p.waitForTimeout(13000); const bk = await shellState(p);
    ok("broad-hasch-back", isBroadShell(bk, "Allt Hasch") && bk.tabs.includes("Magic Sauce*") && /2 produkter/.test(bk.count), bk);
    await p.goForward({ waitUntil: "domcontentloaded" }).catch(() => {}); await p.waitForTimeout(13000); const fw = await shellState(p);
    ok("broad-hasch-forward", isBroadShell(fw, "Allt Hasch") && !fw.chips.length && /16 produkter/.test(fw.count), fw);
    ok("broad-hasch-no-errors", !errs(p).length, errs(p).slice(0, 3)); await ctx.close(); }
  // Alla Buds: tabb THCaB -> Alla Buds; skalet ändras aldrig.
  { const { p, ctx } = await page(1440, 900, "/sv/categories/blommor-buds", "", { wait: 13000 });
    const a = await shellState(p); await watchShell(p);
    ok("broad-buds-shell", isBroadShell(a, "Alla Buds") && a.tabs[0] === "Alla Buds*" && /54 produkter/.test(a.count), a);
    await p.locator(".hz8-pfam__tab", { hasText: "THCaB" }).click(); await p.waitForTimeout(9000);
    const f = await shellState(p);
    const n = parseInt(f.count, 10);
    ok("broad-buds-family-filter", isBroadShell(f, "Alla Buds") && f.tabs.includes("THCaB*") && /serie=thcab/.test(f.url) && n > 0 && n < 54 && f.chips.includes("THCaB"), f);
    await p.locator(".hz8-pfam__tab", { hasText: "Alla Buds" }).click(); await p.waitForTimeout(6000);
    const c = await shellState(p); const ch = await p.evaluate(() => window.__shellChanges);
    ok("broad-buds-clear", isBroadShell(c, "Alla Buds") && c.tabs[0] === "Alla Buds*" && !c.chips.length && /54 produkter/.test(c.count) && !ch.length, { c, shellChanges: ch });
    await p.keyboard.press("Tab"); await p.locator(".hz8-pfam__tab", { hasText: "Magic Sauce" }).focus(); await p.keyboard.press("Enter"); await p.waitForTimeout(9000);
    const k = await shellState(p); ok("broad-buds-keyboard", k.tabs.includes("Magic Sauce*") && /serie=magic-sauce/.test(k.url) && await p.evaluate(() => getComputedStyle(document.activeElement).outlineStyle !== "none"), k);
    ok("broad-buds-no-errors", !errs(p).length, errs(p).slice(0, 3)); await ctx.close(); }
  // Bredder + zoom, filtrerat och ofiltrerat: samma skal, ingen gammal layout.
  for (const [path, q, h1] of [["/sv/categories/hasch", "", "Allt Hasch"], ["/sv/categories/hasch", "filters=Serie_Magic+Sauce", "Allt Hasch"], ["/sv/categories/blommor-buds", "", "Alla Buds"], ["/sv/categories/blommor-buds", "serie=nano-11", "Alla Buds"]]) for (const [w, h, sc] of [[393, 852], [1024, 768], [1440, 900], [1920, 1080], [720, 450, 2]]) {
    const { p, ctx } = await page(w, h, path, q, { scale: sc, wait: 12000 }); const s2 = await shellState(p);
    const mob = await p.evaluate(() => { const b = document.querySelector(".hz8-ptool__mob .hz8-ptool__filter"); return b && b.getClientRects().length ? Math.round(b.getBoundingClientRect().height) : 0; });
    const mobile = w < 768 && !sc;
    ok(`broad-${path.split("/").pop()}${q ? "-f" : ""}-${w}${sc ? "z2" : ""}`, isBroadShell(s2, h1) && (q ? s2.tabs.some(t => t.endsWith("*") && !/^Allt|^Alla/.test(t)) : /^All/.test(s2.tabs[0]) && s2.tabs[0].endsWith("*")) && (!mobile || (s2.toolPos !== "sticky" && mob >= 44)) && !errs(p).length, { ...s2, mob });
    await ctx.close(); }
  // Kontroller: Alla Vapes (vapes-skal, inga familjeflikar) och Magic Sauce Vapes (R3).
  { const { p, ctx } = await page(1440, 900, "/sv/categories/alla-vapes", "", { wait: 13000 }); const s3 = await shellState(p);
    ok("control-alla-vapes", s3.shell === "vapes" && s3.pilot && !s3.tabs.length && s3.legacy === 0 && s3.h1.join() === "Alla Vapes" && !errs(p).length, s3); await ctx.close(); }
  { const { p, ctx } = await page(1440, 900, "/sv/categories/m-s-vapes", "", { wait: 12000 }); const s4 = await shellState(p);
    ok("control-ms-vapes-r3", s4.sf && !s4.shell && !s4.pilot && s4.legacy === 0 && s4.h1.join() === "Magic Sauce Vapes" && !errs(p).length, s4); await ctx.close(); }
  // R5: mobil 393 -- hyllan i herons toning, korten i första vyn, samma
  // mobilrad på /hasch och /blommor-buds, Alla Vapes oförändrad (R4: rad 661, kort 725).
  { const geo = async (path, q) => { const { p, ctx } = await page(393, 852, path, q, { wait: 13000 });
      await p.evaluate(() => document.fonts && document.fonts.ready); await p.evaluate(() => { document.documentElement.style.scrollBehavior = "auto"; scrollTo(0, 0); }); await p.waitForTimeout(500);
      const g = await p.evaluate(() => { const act = document.querySelector('.hz8-pfam__tab[aria-pressed="true"]'); const card = [...document.querySelectorAll("#category-products .product-card, .hz8-series-results .product-card")].find(c => c.offsetParent);
        const cs = e => { if (!e) return null; const c = getComputedStyle(e); return [c.backgroundColor, c.backgroundImage, c.borderTopWidth, c.borderTopStyle, c.borderTopColor, c.borderRadius, c.boxShadow, c.height, c.padding].join("|"); };
        return { underline: act ? Math.round(act.getBoundingClientRect().bottom - 5) : null, card: card ? Math.round(card.getBoundingClientRect().top) : null, cta: Math.round(document.querySelector(".hz8-pguide__cta").getBoundingClientRect().top), quizBottom: Math.round(document.querySelector(".hz8-pguide").getBoundingClientRect().bottom), tool: Math.round(document.querySelector(".hz8-ptool").getBoundingClientRect().top), mob: cs(document.querySelector(".hz8-ptool__mob")), btn: cs(document.querySelector(".hz8-ptool__mob .hz8-ptool__filter")), iw: innerWidth, sw: document.documentElement.scrollWidth }; });
      const e = errs(p); await ctx.close(); return { ...g, err: e.length }; };
    const G = {};
    for (const [k, path, q] of [["buds", "/sv/categories/blommor-buds", ""], ["buds-f", "/sv/categories/blommor-buds", "serie=thcab"], ["hasch", "/sv/categories/hasch", ""], ["hasch-f", "/sv/categories/hasch", "serie=magic-sauce"]]) {
      const g = G[k] = await geo(path, q);
      ok(`r5-mobile-geometry-${k}`, Math.abs(g.underline - 560) <= 6 && g.card <= 640 && Math.abs(g.cta - 422) <= 2 && g.iw === 393 && g.sw === 393 && !g.err, g); }
    ok("r5-mobile-row-identical", G.buds.mob === G.hasch.mob && G.buds.btn === G.hasch.btn && G.hasch.mob === G["hasch-f"].mob, { buds: [G.buds.mob, G.buds.btn], hasch: [G.hasch.mob, G.hasch.btn] });
    const v = await geo("/sv/categories/alla-vapes", "");
    ok("r5-alla-vapes-unchanged-393", v.tool === 661 && v.card === 725 && v.cta === 422 && v.sw === 393 && !v.err, v); }
  // Reducerad rörelse.
  { const { p, ctx } = await page(1440, 900, "/sv/categories/hasch", "", { reduced: true });
    const rmv = await p.evaluate(() => { const cs = getComputedStyle(document.querySelector(".hz8-pfam__tab")); return [cs.transitionProperty, cs.transitionDuration]; });
    ok("broad-reduced-motion", rmv[0] === "none" || parseFloat(rmv[1]) <= 0.01, rmv); await ctx.close(); }
}

fs.writeFileSync(new URL("./tests-result.json", import.meta.url), JSON.stringify(R, null, 1));
console.log("FAILED:", fail.length, JSON.stringify(fail)); await b.close();
