// TASK 01B: interaktionstester på Magic Sauce-hubben (lokal build, extern preview).
// node interact.mjs [before|after]
import { chromium } from "playwright"; import fs from "node:fs"; import path from "node:path";
const DIR = path.dirname(new URL(import.meta.url).pathname);
const ROOT = path.resolve(DIR, "../../..");
const which = process.argv[2] || "after";
const B = which === "before" ? process.env.HUB_BASE : path.join(ROOT, "dist/theme8");
const UA = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36";
const b = await chromium.launch(); const R = []; const ok = (n, c, info) => { R.push({ n, pass: !!c, info }); console.log((c ? "PASS " : "FAIL ") + n, JSON.stringify(info ?? "").slice(0, 400)); };
async function open(w, route = "magic-sauce", hash = "") {
  const m = w < 768;
  const ctx = await b.newContext({ viewport: { width: w, height: m ? 852 : 900 }, deviceScaleFactor: m ? 2 : 1, isMobile: m, hasTouch: m, userAgent: m ? undefined : UA });
  await ctx.route(/theme8\/hazey-theme8\.css/, r => r.fulfill({ path: path.join(B, "hazey-theme8.css"), contentType: "text/css" }));
  await ctx.route(/theme8\/hazey-theme8\.min\.js/, r => r.fulfill({ path: path.join(B, "hazey-theme8.min.js"), contentType: "application/javascript" }));
  await ctx.route(/github\.io\/hazey-storefront\/theme8\/assets\/([^?]+)/, r => { const f = path.join(ROOT, "theme8/assets", decodeURIComponent(new URL(r.request().url()).pathname.split("/theme8/assets/")[1])); return fs.existsSync(f) ? r.fulfill({ path: f }) : r.fulfill({ status: 404 }); });
  const p = await ctx.newPage(); p.errs = [];
  p.on("pageerror", e => p.errs.push(String(e).slice(0, 140))); p.on("console", mm => { if (mm.type() === "error" && !/recaptcha|trustpilot|favicon|Failed to load/i.test(mm.text())) p.errs.push(mm.text().slice(0, 140)); });
  await p.goto(`https://hazeyse.nyehandel.se/sv/categories/${route}?preview=v9kzdmqz4w60l5n${hash}`, { waitUntil: "domcontentloaded", timeout: 120000 });
  await p.waitForFunction(() => document.documentElement.classList.contains("hz8"), null, { timeout: 90000 });
  try { await p.getByRole("button", { name: "Godkänn alla" }).click({ timeout: 4000 }); } catch {}
  if (route === "magic-sauce") await p.waitForSelector(".hz8-sh-shelf .product-card", { timeout: 60000 });
  await p.waitForTimeout(3000);
  return { p, ctx };
}
const headerBottom = p => p.evaluate(() => { const h = document.querySelector("#store-header .main") || document.querySelector("#store-header"); const r = h.getBoundingClientRect(); return document.documentElement.classList.contains("hz8-header-hidden") ? 0 : Math.round(r.bottom); });

for (const w of [393, 1440, 1920]) {
  // 1. Ankare: klick -> hash, aktivt format, landar under headern; bakåt återställer
  { const { p, ctx } = await open(w);
    const nav = w < 768 ? "#hz8-sh-nav" : "#hz8-sh-nav";
    await p.locator(`${nav} a[data-sh="buds"]`).click(); await p.waitForTimeout(1500);
    const s1 = await p.evaluate(() => { const t = document.getElementById(location.hash.slice(1)); return { hash: location.hash, top: t ? Math.round(t.getBoundingClientRect().top) : null, cur: [...document.querySelectorAll('#hz8-sh-nav a[aria-current="true"], #hz8-sh-dock a[aria-current="true"]')].map(a => a.getAttribute("data-sh")) }; });
    const hb = await headerBottom(p);
    await p.goBack(); await p.waitForTimeout(1200);
    const back = await p.evaluate(() => location.hash);
    ok(`anchor-buds-${w}`, s1.hash && /buds/i.test(s1.hash) && s1.top !== null && s1.top >= hb && s1.top < 260 && s1.cur.includes("buds"), { ...s1, headerBottom: hb, backHash: back });
    // Direktlänk med hash landar också under headern
    await ctx.close(); }
  // Djuplänk: a) ingen interaktion, b) cookieklick under laddning, c) headern synlig efter uppåtscroll
  for (const mode of ["plain", "cookie", "header-visible", "header-hidden"]) {
    const m = w < 768;
    const ctx = await b.newContext({ viewport: { width: w, height: m ? 852 : 900 }, deviceScaleFactor: m ? 2 : 1, isMobile: m, hasTouch: m, userAgent: m ? undefined : UA });
    await ctx.route(/theme8\/hazey-theme8\.css/, r => r.fulfill({ path: path.join(B, "hazey-theme8.css"), contentType: "text/css" }));
    await ctx.route(/theme8\/hazey-theme8\.min\.js/, r => r.fulfill({ path: path.join(B, "hazey-theme8.min.js"), contentType: "application/javascript" }));
    await ctx.route(/github\.io\/hazey-storefront\/theme8\/assets\/([^?]+)/, r => { const f = path.join(ROOT, "theme8/assets", decodeURIComponent(new URL(r.request().url()).pathname.split("/theme8/assets/")[1])); return fs.existsSync(f) ? r.fulfill({ path: f }) : r.fulfill({ status: 404 }); });
    const p = await ctx.newPage();
    if (mode === "header-hidden") {
      // Headern dold: scrolla ned (riktig hjulinput) tills headern döljs, navigera sedan till ankaret i sidan.
      await p.goto("https://hazeyse.nyehandel.se/sv/categories/magic-sauce?preview=v9kzdmqz4w60l5n", { waitUntil: "domcontentloaded", timeout: 120000 });
      await p.waitForSelector(".hz8-sh-shelf .product-card", { timeout: 60000 }); await p.waitForTimeout(2500);
      await p.mouse.move(w / 2, 400); for (let i = 0; i < 6; i++) { await p.mouse.wheel(0, 250); await p.waitForTimeout(150); } await p.waitForTimeout(900);
      await p.evaluate(() => { location.hash = "#magic-sauce-hasch"; });
      await p.waitForTimeout(1500);
    } else
    await p.goto("https://hazeyse.nyehandel.se/sv/categories/magic-sauce?preview=v9kzdmqz4w60l5n#magic-sauce-hasch", { waitUntil: "domcontentloaded", timeout: 120000 });
    if (mode === "cookie") { await p.waitForTimeout(1200); try { await p.getByRole("button", { name: "Godkänn alla" }).click({ timeout: 4000 }); } catch {} }
    // vänta tills målets läge varit stilla 1,5 s (layoutbaserat, max 20 s)
    await p.waitForFunction(() => { const t = document.getElementById("magic-sauce-hasch"); if (!t) return false; const top = Math.round(t.getBoundingClientRect().top); const s = window.__st || (window.__st = { top, since: performance.now() }); if (s.top !== top) { s.top = top; s.since = performance.now(); } return performance.now() - s.since > 1500; }, null, { timeout: 20000, polling: 100 }).catch(() => {});
    if (mode === "header-visible") { const bx = { x: w / 2, y: 400 }; await p.mouse.move(bx.x, bx.y); await p.mouse.wheel(0, -60); await p.waitForTimeout(900); }
    const st = await p.evaluate(() => { const t = document.getElementById("magic-sauce-hasch"); const h = document.querySelector("#store-header .main"); const hidden = document.documentElement.classList.contains("hz8-header-hidden"); const hb = Math.round(h.getBoundingClientRect().bottom); return { top: Math.round(t.getBoundingClientRect().top), want: Math.round(parseFloat(getComputedStyle(t).scrollMarginTop)), headerHidden: hidden, headerBottom: hb, visibleHeaderBottom: hidden ? 0 : Math.max(0, hb) }; });
    const pass = mode === "header-visible" ? (!st.headerHidden && st.top >= st.visibleHeaderBottom + 8)
      : mode === "header-hidden" ? (st.headerHidden && Math.abs(st.top - st.want) <= 2 && st.top > 0)
      : (Math.abs(st.top - st.want) <= 2 && st.top >= st.visibleHeaderBottom + 8);
    ok(`deeplink-${mode}-${w}`, pass, st);
    await ctx.close();
  }
  // 2. Hyllor: pilar, trackpad/hjul, tangentbordsfokus, snap, ingen scrollbar, enkel Carts sträcks inte
  { const { p, ctx } = await open(w);
    const sel = '.hz8-sh-shelf[data-sh="buds"] .hz8-prail__list';
    await p.locator(sel).scrollIntoViewIfNeeded(); await p.waitForTimeout(500);
    const st0 = await p.evaluate(s => { const l = document.querySelector(s); return { sl: l.scrollLeft, sb: getComputedStyle(l).scrollbarWidth, wk: getComputedStyle(l, "::-webkit-scrollbar").display, snap: getComputedStyle(l).scrollSnapType, gap: l.offsetHeight - l.clientHeight }; }, sel);
    let arrow = null;
    const next = p.locator('.hz8-sh-shelf[data-sh="buds"] .hz8-prail__btn').last();
    if (await next.isVisible().catch(() => false)) { await next.click(); await p.waitForTimeout(900); arrow = await p.evaluate(s => document.querySelector(s).scrollLeft, sel); }
    await p.evaluate(s => document.querySelector(s).scrollTo({ left: 0, behavior: "instant" }), sel); await p.waitForTimeout(400);
    const box = await p.locator(sel).boundingBox(); await p.mouse.move(box.x + box.width / 2, box.y + 60); await p.mouse.wheel(500, 0); await p.waitForTimeout(900);
    const wheel = await p.evaluate(s => document.querySelector(s).scrollLeft, sel);
    await p.evaluate(s => document.querySelector(s).scrollTo({ left: 0, behavior: "instant" }), sel); await p.waitForTimeout(300);
    const kb = await p.evaluate(s => { const l = document.querySelector(s); const links = [...l.querySelectorAll("a[href]")]; const last = links[links.length - 1]; last.focus(); return new Promise(r => setTimeout(() => { const lr = l.getBoundingClientRect(), fr = document.activeElement.getBoundingClientRect(); r({ sl: Math.round(l.scrollLeft), inView: fr.left >= lr.left - 2 && fr.right <= lr.right + 2, focused: l.contains(document.activeElement) }); }, 700)); }, sel);
    const single = await p.evaluate(() => { const l = document.querySelector('.hz8-sh-shelf[data-sh="carts"] .hz8-prail__list'); if (!l) return null; const c = l.children[0].getBoundingClientRect(); const bl = document.querySelector('.hz8-sh-shelf[data-sh="buds"] .hz8-prail__list').children[0].getBoundingClientRect(); return { cartsW: Math.round(c.width), budsW: Math.round(bl.width) }; });
    ok(`rail-no-scrollbar-${w}`, st0.sb === "none" && st0.wk === "none" && st0.gap === 0 && /x/.test(st0.snap), st0);
    ok(`rail-arrow-${w}`, w < 768 ? true : arrow > 0, { arrow, mobileNoArrows: w < 768 });
    ok(`rail-trackpad-wheel-${w}`, wheel > 0, { wheel });
    ok(`rail-keyboard-focus-${w}`, kb.focused && kb.inView && kb.sl > 0, kb);
    ok(`single-carts-not-stretched-${w}`, single && Math.abs(single.cartsW - single.budsW) <= 1, single);
    await ctx.close(); }
  // 3. Formatrad: 44 px, fokus synlig, mobil scroll utan scrollbar, ingen toggle, grid dold, serie-rad
  { const { p, ctx } = await open(w);
    const s = await p.evaluate(() => {
      const nav = document.getElementById("hz8-sh-nav"); const list = nav.querySelector("ul"); const cs = getComputedStyle(nav);
      const links = [...nav.querySelectorAll("a")];
      const series = document.querySelector(".hz8-sh-after .hz8-rail--series");
      const cur = series && series.querySelector('[aria-current="page"]');
      return { radius: cs.borderTopLeftRadius, blur: cs.backdropFilter, minH: Math.min(...links.map(a => a.getBoundingClientRect().height)), listSb: getComputedStyle(list).scrollbarWidth, listOverflow: list.scrollWidth - list.clientWidth, toggle: document.querySelectorAll(".hz8-sh-allbtn, .hz8-sh-after .hz8-hub__grid-toggle").length, gridHidden: getComputedStyle(document.querySelector(".designer-category") || document.body).display === "none",
        seriesCount: series ? series.querySelectorAll(".hz8-rail__item").length : 0, curHasHref: cur ? cur.hasAttribute("href") : null, curTabbable: cur ? cur.tabIndex >= 0 && cur.matches("a[href],button,[tabindex]") : null, curName: cur && cur.textContent.replace(/\s+/g, " ").trim(), curImg: cur ? !!cur.querySelector("img") : null, others: series ? series.querySelectorAll("a.hz8-rail__item[href]").length : 0, ov: document.documentElement.scrollWidth - innerWidth, visAll: [...document.querySelectorAll(".hz8-prail__all")].filter(a => a.offsetParent).map(a => a.getAttribute("href").replace(/\?preview=.*/, "")) };
    });
    await p.locator("#hz8-sh-nav a").first().focus(); await p.keyboard.press("Tab");
    const focus = await p.evaluate(() => { const a = document.activeElement; const cs = getComputedStyle(a); return { inNav: !!a.closest("#hz8-sh-nav"), outline: cs.outlineStyle + " " + cs.outlineWidth }; });
    ok(`nav-shelf-${w}`, /20px|18px/.test(s.radius) && /blur\(20px\)/.test(s.blur) && s.minH >= 44 && s.listSb === "none", s);
    ok(`nav-focus-visible-${w}`, focus.inNav && /solid 2px/.test(focus.outline), focus);
    ok(`no-duplicate-grid-toggle-${w}`, s.toggle === 0 && s.gridHidden, { toggle: s.toggle, gridHidden: s.gridHidden });
    ok(`series-current-not-linked-${w}`, s.curHasHref === false && s.curTabbable === false && s.curImg && /Magic Sauce/.test(s.curName) && s.others >= 5, { cur: s.curName, img: s.curImg, others: s.others });
    ok(`format-visa-alla-kept-${w}`, s.visAll.length >= 3, s.visAll);
    // Aktuell serie: aktiv markering, inte klickbar (ingen pekare, ingen hoverändring)
    const curSel = '.hz8-sh-after .hz8-rail--series [aria-current="page"]';
    await p.locator(curSel).scrollIntoViewIfNeeded(); await p.waitForTimeout(400);
    const look = () => p.evaluate(sel => { const e = document.querySelector(sel); const cs = getComputedStyle(e); return { border: cs.borderTopColor, shadow: cs.boxShadow, bg: cs.backgroundImage.slice(0, 60), cursor: cs.cursor, pe: cs.pointerEvents }; }, curSel);
    const l0 = await look(); const bb = await p.locator(curSel).boundingBox();
    if (w >= 768) { await p.mouse.move(bb.x + bb.width / 2, bb.y + bb.height / 2); await p.waitForTimeout(400); }
    const l1 = await look();
    const other = await p.evaluate(() => { const a = document.querySelector('.hz8-sh-after .hz8-rail--series a.hz8-rail__item[href]'); return { href: !!a, cursor: getComputedStyle(a).cursor }; });
    ok(`series-current-inert-${w}`, l0.cursor === "default" && l0.pe === "none" && JSON.stringify(l0) === JSON.stringify(l1) && /rgb\(2/.test(l0.border) && other.href && other.cursor === "pointer", { before: l0, hovered: l1, other });
    // Luft mellan serieraden och kundserviceblocket
    const gap = await p.evaluate(() => { const l = document.querySelector(".hz8-sh-after .hz8-rail--series .hz8-rail__list"), g = document.querySelector(".hz8-cat-guide"); return Math.round(g.getBoundingClientRect().top - l.getBoundingClientRect().bottom); });
    ok(`series-to-service-gap-${w}`, gap >= 40 && gap <= 72, { gap });
    ok(`no-overflow-${w}`, s.ov === 0, s.ov);
    if (w < 768) { // mobilrad scrollar horisontellt (om innehållet är bredare) och dockan fungerar
      const navScroll = await p.evaluate(() => { const l = document.querySelector("#hz8-sh-nav ul"); l.scrollLeft = 200; return { max: l.scrollWidth - l.clientWidth, after: l.scrollLeft }; });
      await p.evaluate(() => { const s = document.querySelector('.hz8-sh-shelf[data-sh="buds"]'); scrollTo(0, s.getBoundingClientRect().top + scrollY - 200); }); await p.waitForTimeout(1200);
      const dock = await p.evaluate(() => ({ on: !!document.querySelector(".hz8-sh-dock.is-on"), cur: (document.querySelector('#hz8-sh-dock a[aria-current="true"]') || {}).textContent }));
      await p.evaluate(() => scrollTo(0, document.documentElement.scrollHeight)); await p.waitForTimeout(1200);
      const dockFoot = await p.evaluate(() => !!document.querySelector(".hz8-sh-dock.is-on"));
      ok("mobile-nav-scrolls", navScroll.max <= 0 || navScroll.after > 0, navScroll);
      ok("mobile-dock-midpage-and-hidden-at-footer", dock.on && !dockFoot, { dock, dockAtFooter: dockFoot });
    }
    ok(`no-console-errors-${w}`, p.errs.length === 0, p.errs);
    await ctx.close(); }
}
fs.writeFileSync(path.join(DIR, `interact-${which}.json`), JSON.stringify(R, null, 1));
console.log(`${R.filter(r => r.pass).length}/${R.length} passed`);
await b.close();
