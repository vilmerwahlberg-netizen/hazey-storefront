// TASK 01F -- verifiering av headerglas och semi-sticky-rörelse.
// node verify.mjs before|after <route,..> <width,..> [tag]
// Per rutt/bredd: glaskontrast på fyra scrollpositioner, rörelseprogression
// (ut/in), snabb riktningsväxling, toppzon, snabb scroll, hopp, lås (sök,
// meny, varukorg), tangentbordsfokus, reducerad rörelse, CLS, överflöd och
// konsolfel. Sparar headerutsnitt för före/efter-stillbilder.
import { chromium, ctxFor, open, ready, DIR, ROUTES } from "./lib.mjs"; import fs from "node:fs"; import { PNG } from "pngjs";
const which = process.argv[2] || "after";
const routes = (process.argv[3] || "alla-vapes").split(",");
const widths = (process.argv[4] || "393,1440").split(",").map(Number);
const tag = process.argv[5] || "";
const STILLS = `${DIR}/runs/stills`; fs.mkdirSync(STILLS, { recursive: true });
const lum = (r, g, b) => { const f = c => { c /= 255; return c <= .03928 ? c / 12.92 : ((c + .055) / 1.055) ** 2.4; }; return .2126 * f(r) + .7152 * f(g) + .0722 * f(b); };
const ratio = (a, b) => (Math.max(a, b) + .05) / (Math.min(a, b) + .05);
const pct = (arr, q) => arr[Math.min(arr.length - 1, Math.floor(arr.length * q))];
const sleep = ms => new Promise(r => setTimeout(r, ms));

const browser = await chromium.launch(); const rows = [];
for (const route of routes) for (const w of widths) {
  const mobile = w < 768;
  const ctx = await ctxFor(browser, w, mobile ? 852 : 900, { which });
  const p = await open(ctx, ROUTES[route]);
  await p.addInitScript(() => {});
  await ready(p, 3000);
  // Sidan har scroll-behavior:smooth -- alla skriptade scrollningar är omedelbara.
  await p.evaluate(() => { window.__to = y => window.scrollTo({ top: y, left: 0, behavior: "instant" }); });
  await p.evaluate(() => { window.__cls = 0; new PerformanceObserver(l => { for (const e of l.getEntries()) if (!e.hadRecentInput) window.__cls += e.value; }).observe({ type: "layout-shift", buffered: false }); });
  const row = { which, route, w, contrast: [], locks: {} };
  const st = () => p.evaluate(() => ({ y: Math.round(scrollY), hidden: document.documentElement.classList.contains("hz8-header-hidden"), tone: document.getElementById("store-header").getAttribute("data-hz8-tone") }));
  const jumpTo = async y => { await p.evaluate(y => __to(y), y); await sleep(650); };
  // Glas: innehållet döljs tillfälligt så att bara glaset + bakgrunden mäts.
  const docH = await p.evaluate(() => document.documentElement.scrollHeight - innerHeight);
  for (const y of [0, 520, 1150, Math.min(1900, docH - 10)]) {
    await jumpTo(0); await jumpTo(y);
    const s = await st();
    const rect = await p.evaluate(() => { const r = document.querySelector("#store-header .main").getBoundingClientRect(); return { x: Math.max(0, r.x), y: Math.max(0, r.y), width: r.width, height: r.height }; });
    const full = await p.screenshot({ clip: rect });
    const pos = y === 0 ? "top" : "y" + y;
    fs.writeFileSync(`${STILLS}/${which}-${route}-${w}-${pos}.png`, full);
    await p.addStyleTag({ content: "#store-header .main .container{visibility:hidden!important}" }).then(h => h.evaluate(n => n.id = "__t01f_hide"));
    await sleep(80);
    const png = PNG.sync.read(await p.screenshot({ clip: { x: rect.x + 14, y: rect.y + 8, width: rect.width - 28, height: rect.height - 16 } }));
    await p.evaluate(() => document.getElementById("__t01f_hide").remove());
    const L = []; for (let i = 0; i < png.data.length; i += 4) L.push(lum(png.data[i], png.data[i + 1], png.data[i + 2])); L.sort((a, b) => a - b);
    const fg = s.tone === "light" ? lum(0x2c, 0x36, 0x20) : lum(0xff, 0xfa, 0xf0);
    // Ljust läge: sämsta = mörkaste glaspixlarna (p05); mörkt: ljusaste (p95).
    const worst = s.tone === "light" ? pct(L, .05) : pct(L, .95);
    row.contrast.push({ pos, tone: s.tone, hidden: s.hidden, p05: +pct(L, .05).toFixed(3), p50: +pct(L, .5).toFixed(3), p95: +pct(L, .95).toFixed(3), worstRatio: +ratio(fg, worst).toFixed(2), medianRatio: +ratio(fg, pct(L, .5)).toFixed(2) });
  }
  // Rörelse: ram-för-ram translateY under ett skriptat förlopp.
  await jumpTo(0); await jumpTo(420);
  row.motion = await p.evaluate(async () => {
    const h = document.getElementById("store-header"), html = document.documentElement;
    const ty = () => { const m = getComputedStyle(h).transform; if (m === "none") return 0; const v = m.match(/matrix(3d)?\(([^)]+)\)/)[2].split(",").map(Number); return v.length === 16 ? v[13] : v[5]; };
    const run = (fn, ms) => new Promise(res => { const t0 = performance.now(), log = []; const step = () => { const t = performance.now() - t0; fn(t); log.push({ t: Math.round(t), y: Math.round(scrollY), hidden: html.classList.contains("hz8-header-hidden"), ty: Math.round(ty() * 10) / 10 }); t < ms ? requestAnimationFrame(step) : res(log); }; requestAnimationFrame(step); });
    const prog = (log, from, to) => { const i = log.findIndex(l => l.hidden === (to !== 0)); if (i < 0) return null; const span = to - from; const at = q => { const k = log.findIndex((l, j) => j >= i && (l.ty - from) / span >= q); return k < 0 ? null : log[k].t - log[i].t; }; return { toggleAtY: log[i].y, p25: at(.25), p50: at(.5), p90: at(.9), p100: at(.995), maxStep: Math.max(...log.slice(i).map((l, j, a) => j ? Math.abs(l.ty - a[j - 1].ty) : 0)) }; };
    let y = scrollY; const out = {};
    // ner 6 px/ram
    const down = await run(t => { if (t < 700) __to(y += 6); }, 1100);
    const H = Math.min(...down.map(l => l.ty)); out.hiddenTy = H;
    out.hide = prog(down, 0, H);
    // upp 6 px/ram
    const up = await run(t => { if (t < 500) __to(y -= 6); }, 900);
    out.show = prog(up, H, 0);
    // snabb riktningsväxling: ned tills dold, efter 90 ms upp igen
    let tHide = null;
    const rev = await run(t => { const hid = html.classList.contains("hz8-header-hidden"); if (hid && tHide === null) tHide = t; if (tHide === null || t - tHide < 90) __to(y += 7); else if (t - tHide < 400) __to(y -= 7); }, 1700);
    const iH = rev.findIndex(l => l.hidden), iS = rev.findIndex((l, j) => j > iH && !l.hidden);
    out.reversal = { hideFrame: iH, showFrame: iS, tyAtReverse: iS > 0 ? rev[iS - 1].ty : null, maxStep: Math.max(...rev.map((l, j) => j ? Math.abs(l.ty - rev[j - 1].ty) : 0)), endTy: rev.at(-1).ty, toggles: rev.filter((l, j) => j && l.hidden !== rev[j - 1].hidden).length };
    // snabb scroll 70 px/ram (fling), en enda växling
    const fast = await run(t => { if (t < 400) __to(y += 70); }, 800);
    out.fast = { toggles: fast.filter((l, j) => j && l.hidden !== fast[j - 1].hidden).length, endHidden: fast.at(-1).hidden, maxStep: Math.max(...fast.map((l, j) => j ? Math.abs(l.ty - fast[j - 1].ty) : 0)) };
    // hopp > 320 px/ram (ankare) visar
    __to(y += 600); await new Promise(r => setTimeout(r, 500)); out.jumpShows = !html.classList.contains("hz8-header-hidden");
    // toppzon: 0 -> 170 px långsamt, aldrig dold
    __to(0); await new Promise(r => setTimeout(r, 500)); y = 0;
    const top = await run(t => { if (y < 170) __to(y += 3); }, 1200);
    out.topZoneNeverHidden = !top.some(l => l.hidden);
    return out;
  });
  // Lås: öppna, scrolla ned, headern ska vara kvar.
  const scrollDown = async () => { for (let i = 0; i < 10; i++) { await p.mouse.wheel(0, 60); await sleep(30); } await sleep(450); };
  const lockTest = async (name, openFn, isOpenSel) => {
    await jumpTo(0); await jumpTo(700);
    try { await openFn(); await sleep(500); } catch (e) { row.locks[name] = { error: String(e).slice(0, 120) }; return; }
    const opened = await p.evaluate(s => !!document.querySelector(s), isOpenSel).catch(() => false);
    await scrollDown(); const s = await st();
    row.locks[name] = { opened, hiddenWhileOpen: s.hidden };
    await p.keyboard.press("Escape"); await sleep(400);
    await p.evaluate(() => { document.activeElement && document.activeElement.blur && document.activeElement.blur(); }); await p.mouse.move(5, 500); await sleep(300);
    const closed = !(await p.evaluate(s => !!document.querySelector(s), isOpenSel));
    if (!closed) { await p.mouse.click(5, mobile ? 700 : 800).catch(() => {}); await sleep(400); }
    row.locks[name].closedAfter = !(await p.evaluate(s => !!document.querySelector(s), isOpenSel));
  };
  if (mobile) {
    await lockTest("search", () => p.click("#store-header #mobile-search-trigger"), ".hz8-msearch.is-open");
    await lockTest("menu", () => p.click("#store-header .hamburger"), "#hz8MobileDrawer.is-open");
  } else {
    await lockTest("search", () => p.click("#store-header #search-container input"), "#store-header #search-container input:focus");
    await lockTest("menu", async () => { const a = p.locator("#store-header .hz8-header-nav a.hz8-cat").first(); await a.hover(); }, "#store-header .hz8-header-nav .is-open, #store-header .hz8-header-nav :hover");
  }
  await lockTest("cart", () => p.click("#store-header .basket-icon .cart-button"), "#cart-side-wrap.is-active, .upselling-sidebar__container.is-active, #cartAside.is-active, .cart-side.is-active");
  // Tangentbord: dölj, sedan Tab -> fokus i headern ska visa den.
  await jumpTo(0); await jumpTo(700); await scrollDown();
  const hiddenBeforeTab = (await st()).hidden;
  // Sekventiell fokusstart före headern (utan att scrolla), som när en
  // besökare tabbar in från adressfältet.
  await p.evaluate(() => { const a = document.createElement("a"); a.href = "#"; a.id = "__t01f_start"; a.textContent = "."; a.style.cssText = "position:absolute;top:0;left:0;width:1px;height:1px;overflow:hidden"; document.body.prepend(a); a.focus({ preventScroll: true }); });
  let tabs = 0, inHeader = false;
  for (; tabs < 16 && !inHeader; tabs++) { await p.keyboard.press("Tab"); await sleep(60); inHeader = await p.evaluate(() => document.getElementById("store-header").contains(document.activeElement)); }
  await sleep(400);
  await p.evaluate(() => document.getElementById("__t01f_start").remove());
  row.keyboard = { hiddenBeforeTab, tabsToHeader: inHeader ? tabs : null, hiddenAfterFocus: (await st()).hidden, focused: await p.evaluate(() => { const a = document.activeElement; return a ? a.tagName + '.' + String(a.className).slice(0, 40) : null; }), focusVisible: await p.evaluate(() => { const a = document.activeElement; return a ? getComputedStyle(a).outlineStyle + " " + getComputedStyle(a).outlineWidth : null; }) };
  // Reducerad rörelse: övergången ska vara i praktiken omedelbar.
  await p.emulateMedia({ reducedMotion: "reduce" }); await jumpTo(0); await jumpTo(500);
  row.reduced = await p.evaluate(async () => {
    const h = document.getElementById("store-header"); const cs = getComputedStyle(h);
    let y = scrollY; const tys = [];
    await new Promise(res => { const t0 = performance.now(); const step = () => { const t = performance.now() - t0; if (t < 500) __to(y += 6); const m = getComputedStyle(h).transform; tys.push(m === "none" ? 0 : +m.split(",")[5]); t < 800 ? requestAnimationFrame(step) : res(); }; requestAnimationFrame(step); });
    return { duration: cs.transitionDuration, intermediateFrames: tys.filter(v => v < -1 && v > Math.min(...tys) + 1).length, hidOnce: tys.some(v => v < -1) };
  });
  await p.emulateMedia({ reducedMotion: "no-preference" });
  row.cls = +(await p.evaluate(() => window.__cls)).toFixed(4);
  row.overflowX = await p.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1);
  row.css = await p.evaluate(() => { const h = document.getElementById("store-header"), m = getComputedStyle(h.querySelector(".main"), "::before"); return { transition: getComputedStyle(h).transition, glassBg: m.backgroundColor, backdrop: m.backdropFilter, border: m.borderColor, shadow: m.boxShadow.slice(0, 90) }; });
  row.errors = p.errors.filter(e => !/favicon|ERR_BLOCKED|Failed to load resource.*(facebook|google|tiktok|doubleclick|hotjar)/i.test(e));
  rows.push(row); console.log(JSON.stringify(row));
  await ctx.close();
}
fs.writeFileSync(`${DIR}/runs/verify-${which}-${routes.join("_")}-${widths.join("_")}${tag ? "-" + tag : ""}.json`, JSON.stringify(rows, null, 1));
await browser.close();
