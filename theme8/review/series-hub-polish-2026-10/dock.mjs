// TASK 01B: mobil formatdocka på Magic Sauce-hubben (lokal build, extern preview).
// node dock.mjs test [widths]           -> tester, efter-build (dist/theme8)
// node dock.mjs shots <before|after>    -> 4 bilder vid 393 (before = DOCK_BASE)
// Sekventiellt, en webbläsare.
import { chromium } from "playwright"; import fs from "node:fs"; import path from "node:path";
const DIR = path.dirname(new URL(import.meta.url).pathname);
const ROOT = path.resolve(DIR, "../../..");
const [mode = "test", arg = ""] = process.argv.slice(2);
const b = await chromium.launch(); const R = [];
const ok = (n, c, info) => { R.push({ n, pass: !!c, info }); console.log((c ? "PASS " : "FAIL ") + n, JSON.stringify(info ?? "").slice(0, 400)); };

async function open(w, base, reduced) {
  const ctx = await b.newContext({ viewport: { width: w, height: 852 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true, reducedMotion: reduced ? "reduce" : "no-preference" });
  await ctx.route(/theme8\/hazey-theme8\.css/, r => r.fulfill({ path: path.join(base, "hazey-theme8.css"), contentType: "text/css" }));
  await ctx.route(/theme8\/hazey-theme8\.min\.js/, r => r.fulfill({ path: path.join(base, "hazey-theme8.min.js"), contentType: "application/javascript" }));
  await ctx.route(/github\.io\/hazey-storefront\/theme8\/assets\/([^?]+)/, r => { const f = path.join(ROOT, "theme8/assets", decodeURIComponent(new URL(r.request().url()).pathname.split("/theme8/assets/")[1])); return fs.existsSync(f) ? r.fulfill({ path: f }) : r.fulfill({ status: 404 }); });
  const p = await ctx.newPage(); p.errs = [];
  p.on("pageerror", e => p.errs.push(String(e).slice(0, 140))); p.on("console", mm => { if (mm.type() === "error" && !/recaptcha|trustpilot|favicon|Failed to load|requestStorageAccess/i.test(mm.text())) p.errs.push(mm.text().slice(0, 140)); });
  await p.goto("https://hazeyse.nyehandel.se/sv/categories/magic-sauce?preview=v9kzdmqz4w60l5n", { waitUntil: "domcontentloaded", timeout: 120000 });
  await p.waitForFunction(() => document.documentElement.classList.contains("hz8"), null, { timeout: 90000 });
  try { await p.getByRole("button", { name: "Godkänn alla" }).click({ timeout: 4000 }); } catch {}
  await p.waitForSelector(".hz8-sh-shelf .product-card", { timeout: 60000 });
  await p.waitForTimeout(3000);
  return { p, ctx };
}
// Tillstånd: docka, header, aktiv, kollisioner (bara synliga rektanglar i vyn).
const state = p => p.evaluate(() => {
  const d = document.querySelector(".hz8-sh-dock"), dr = d.getBoundingClientRect(), on = d.classList.contains("is-on");
  const hdrEl = document.querySelector("#store-header"), hr = hdrEl.getBoundingClientRect();
  const hdrHidden = document.documentElement.classList.contains("hz8-header-hidden") || hr.bottom <= 0;
  const hit = (el) => { if (!el) return false; const r = el.getBoundingClientRect(); return r.bottom > dr.top + 0.5 && r.top < dr.bottom - 0.5 && r.right > dr.left && r.left < dr.right && r.bottom > 0 && r.top < innerHeight; };
  const buys = [...document.querySelectorAll(".hz8-sh-shelf .product-card button, .hz8-sh-shelf .product-card a.btn, .hz8-sh-shelf .product-card [class*='buy']")].filter(e => e.offsetParent);
  const cur = (sel) => (document.querySelector(sel + ' a[aria-current="true"]') || {}).getAttribute?.("data-sh") || null;
  return { on, dock: [dr.top, dr.bottom, dr.height].map(Math.round), hdrBottom: hdrHidden ? 0 : Math.round(hr.bottom), hdrHidden, dockCur: cur("#hz8-sh-dock"), navCur: cur("#hz8-sh-nav"),
    hitsHeader: on && !hdrHidden && hr.bottom > dr.top, hitsService: on && hit(document.querySelector(".hz8-cat-guide")), hitsFooter: on && hit(document.querySelector(".hz8-footer, footer.page-footer")),
    hitsBuy: on ? buys.filter(hit).length : 0, endVisible: (document.querySelector(".hz8-sh-end") || document.querySelector(".hz8-sh-after") || document.body).getBoundingClientRect().top < innerHeight, navVisible: (() => { const r = document.querySelector("#hz8-sh-nav").getBoundingClientRect(); return r.bottom > 0 && r.top < innerHeight; })(), ariaHidden: d.getAttribute("aria-hidden"), inert: d.inert, y: Math.round(scrollY), ov: document.documentElement.scrollWidth - innerWidth };
});
const shelfTop = (p, k, off) => p.evaluate(([k, off]) => { const s = document.querySelector(`.hz8-sh-shelf[data-sh="${k}"]`); scrollTo({ top: s.getBoundingClientRect().top + scrollY - off, behavior: "instant" }); }, [k, off]);
const pastNav = p => p.evaluate(() => { const n = document.querySelector("#hz8-sh-nav"); scrollTo({ top: n.getBoundingClientRect().bottom + scrollY + 40, behavior: "instant" }); });

if (mode === "shots") {
  const which = arg || "after";
  const base = which === "before" ? process.env.DOCK_BASE : path.join(ROOT, "dist/theme8");
  const OUT = path.join(DIR, "shots/dock"); fs.mkdirSync(OUT, { recursive: true });
  const { p, ctx } = await open(393, base, true);
  // 1) normalt läge: strax efter att sidans formatrad lämnat vyn (Vapes-hyllan i vy)
  await pastNav(p); await p.waitForTimeout(900);
  await p.screenshot({ path: `${OUT}/${which}-1-normal.png` });
  // 2) aktivt format: tryck Buds i dockan
  await p.locator('#hz8-sh-dock a[data-sh="buds"]').click(); await p.waitForTimeout(1200);
  await p.evaluate(() => document.activeElement && document.activeElement.blur());
  await p.screenshot({ path: `${OUT}/${which}-2-active.png` });
  // 3) synlig header: liten scroll uppåt
  for (let i = 0; i < 4; i++) { await p.evaluate(() => scrollBy(0, -40)); await p.waitForTimeout(120); }
  await p.waitForTimeout(700);
  await p.screenshot({ path: `${OUT}/${which}-3-header.png` });
  // 4) nära sidans nederkant: sista läget där dockan fortfarande visas
  await p.evaluate(() => scrollTo({ top: document.documentElement.scrollHeight, behavior: "instant" })); await p.waitForTimeout(600);
  const y = await p.evaluate(async () => { let y = scrollY, last = null; const d = document.querySelector(".hz8-sh-dock");
    for (; y > 0; y -= 20) { scrollTo({ top: y, behavior: "instant" }); await new Promise(r => setTimeout(r, 60)); if (d.classList.contains("is-on")) { last = y; break; } } return last; });
  await p.waitForTimeout(700);
  await p.screenshot({ path: `${OUT}/${which}-4-bottom.png` });
  console.log(which, "bottom y", y, JSON.stringify(await state(p)));
  await ctx.close(); await b.close(); process.exit(0);
}

const widths = (arg || "320,393,430").split(",").map(Number);
const base = path.join(ROOT, "dist/theme8");
for (const w of widths) for (const reduced of [false, true]) {
  const tag = `${w}-${reduced ? "reduce" : "motion"}`, settle = reduced ? 500 : 1500;
  const { p, ctx } = await open(w, base, reduced);
  const s0 = await state(p);
  ok(`dock-hidden-at-top-${tag}`, !s0.on && s0.ariaHidden === "true" && s0.inert, s0);
  await pastNav(p); await p.waitForTimeout(settle);
  const look = await p.evaluate(() => { const d = document.querySelector(".hz8-sh-dock"), l = d.querySelector("ul"), cs = getComputedStyle(d);
    return { segs: [...l.querySelectorAll("a")].map(a => { const r = a.getBoundingClientRect(); return { k: a.dataset.sh, w: Math.round(r.width), h: Math.round(r.height), clip: a.scrollWidth > a.clientWidth + 1 }; }),
      listOv: l.scrollWidth - l.clientWidth, sbw: getComputedStyle(l).scrollbarWidth, sbH: l.offsetHeight - l.clientHeight, label: d.querySelector("nav").getAttribute("aria-label"),
      blur: cs.backdropFilter, dur: cs.transitionDuration, chipDur: getComputedStyle(l.querySelector("a")).transitionDuration }; });
  const s1 = await state(p);
  ok(`dock-shows-after-nav-${tag}`, s1.on && s1.ariaHidden === "false" && !s1.inert, s1);
  ok(`dock-four-format-segments-${tag}`, look.segs.map(s => s.k).join() === "vapes,carts,buds,hasch" && look.segs.every(s => s.h >= 44 && !s.clip), look.segs);
  ok(`dock-compact-${tag}`, s1.dock[2] <= 52, s1.dock);
  ok(`dock-no-scrollbar-${tag}`, look.sbw === "none" && look.sbH === 0 && look.listOv <= 0, { sbw: look.sbw, sbH: look.sbH, listOv: look.listOv });
  ok(`dock-reduced-motion-${tag}`, reduced ? Math.max(...(look.dur + "," + look.chipDur).split(",").map(parseFloat)) < 0.01 : parseFloat(look.dur) >= 0.2, { dur: look.dur, chipDur: look.chipDur });
  ok(`dock-sr-label-${tag}`, /Snabbval/.test(look.label || ""), look.label);
  // Varje ankare via dockan, från både dold och synlig header
  for (const k of ["vapes", "carts", "buds", "hasch", "carts", "vapes"]) {
    { const s = await state(p); if (!s.on) { if (s.endVisible) await shelfTop(p, "buds", 150); else await p.evaluate(() => scrollBy(0, 220)); await p.waitForTimeout(settle); } }
    const before = await state(p);
    await p.locator(`#hz8-sh-dock a[data-sh="${k}"]`).click(); await p.waitForTimeout(settle);
    const r = await p.evaluate(k => { const t = document.querySelector(`.hz8-sh-shelf[data-sh="${k}"]`); return { hash: location.hash, top: Math.round(t.getBoundingClientRect().top), want: Math.round(parseFloat(getComputedStyle(t).scrollMarginTop)), focus: !!(document.activeElement && t.contains(document.activeElement)) }; }, k);
    const s = await state(p);
    ok(`dock-anchor-${k}-${before.hdrHidden ? "hdr-hidden" : "hdr-visible"}-${tag}`, r.hash.endsWith("-" + k) && Math.abs(r.top - r.want) <= 2 && r.top >= s.hdrBottom && s.dockCur === k && s.navCur === k && (s.on ? !s.navVisible && !s.endVisible : (s.navVisible || s.endVisible)) && r.focus && !s.hitsBuy && !s.hitsHeader, { ...r, hdrBefore: before.hdrHidden, hdrBottom: s.hdrBottom, dockCur: s.dockCur, hitsBuy: s.hitsBuy, on: s.on, navVisible: s.navVisible, endVisible: s.endVisible });
    // visa headern före nästa klick varannan gång (liten scroll uppåt)
    if (k === "buds" || k === "carts") { for (let i = 0; i < 4; i++) { await p.evaluate(() => scrollBy(0, -40)); await p.waitForTimeout(120); } await p.waitForTimeout(500); }
  }
  // Header synlig: dockan och headern samtidigt utan överlapp
  { await shelfTop(p, "buds", 100); await p.waitForTimeout(400); for (let i = 0; i < 4; i++) { await p.evaluate(() => scrollBy(0, -40)); await p.waitForTimeout(120); } await p.waitForTimeout(600);
    const s = await state(p); ok(`dock-with-visible-header-${tag}`, !s.hdrHidden && s.on && !s.hitsHeader && s.dock[0] > s.hdrBottom, s); }
  // Scrollspy: aktiv följer scroll
  { const got = []; for (const k of ["vapes", "carts", "buds", "hasch"]) { await shelfTop(p, k, 150); await p.waitForTimeout(500); got.push((await state(p)).dockCur); }
    ok(`dock-scrollspy-${tag}`, got.join() === "vapes,carts,buds,hasch", got); }
  // Snabb upp/ned
  { await p.evaluate(async () => { const H = document.documentElement.scrollHeight; for (let i = 0; i < 24; i++) { scrollTo({ top: i % 2 ? H : 0, behavior: "instant" }); await new Promise(r => setTimeout(r, 25)); } });
    await shelfTop(p, "buds", 150); await p.waitForTimeout(settle);
    const a = await state(p);
    await p.evaluate(async () => { for (let i = 0; i < 24; i++) { scrollTo({ top: i % 2 ? 2000 : 300, behavior: "instant" }); await new Promise(r => setTimeout(r, 25)); } scrollTo({ top: 0, behavior: "instant" }); });
    await p.waitForTimeout(settle); const c = await state(p);
    ok(`dock-rapid-scroll-${tag}`, a.on && a.dockCur === "buds" && a.dock[1] <= 852 && !c.on && c.ariaHidden === "true", { mid: a, top: c }); }
  // Tangentbord: fokus i dockan, Tab, synlig ring, Enter navigerar
  { await shelfTop(p, "carts", 150); await p.waitForTimeout(settle);
    await p.locator('#hz8-sh-dock a[data-sh="carts"]').focus(); await p.keyboard.press("Tab");
    const f = await p.evaluate(() => { const a = document.activeElement, cs = getComputedStyle(a); return { k: a.dataset && a.dataset.sh, outline: cs.outlineStyle + " " + cs.outlineWidth, fv: a.matches(":focus-visible") }; });
    await p.keyboard.press("Enter"); await p.waitForTimeout(settle);
    const s = await state(p);
    ok(`dock-keyboard-${tag}`, f.k === "buds" && f.fv && /solid 2px/.test(f.outline) && s.dockCur === "buds", { f, cur: s.dockCur }); }
  // Hela vägen ned: ingen överlapp med köpknappar vid vila? (info) / service / footer / header; döljs före kundservice
  { await pastNav(p); await p.waitForTimeout(300);
    const H = await p.evaluate(() => document.documentElement.scrollHeight - innerHeight); const bad = []; let maxBuy = 0;
    for (let y = await p.evaluate(() => scrollY); y <= H; y += 90) { await p.evaluate(y => scrollTo({ top: y, behavior: "instant" }), y); await p.waitForTimeout(140); const s = await state(p); maxBuy = Math.max(maxBuy, s.hitsBuy); if (s.hitsService || s.hitsFooter || s.hitsHeader || s.ov) bad.push(s); }
    await p.waitForTimeout(400); const end = await state(p);
    ok(`dock-no-overlap-service-footer-header-${tag}`, !bad.length && !end.on, { bad: bad.slice(0, 3), endOn: end.on });
    ok(`no-overflow-${tag}`, end.ov === 0, end.ov);
    R.push({ n: `info-buy-buttons-passing-under-dock-${tag}`, pass: true, info: maxBuy }); }
  ok(`no-console-errors-${tag}`, p.errs.length === 0, p.errs);
  await ctx.close();
}
fs.writeFileSync(path.join(DIR, "dock-after.json"), JSON.stringify(R, null, 1));
const T = R.filter(r => !r.n.startsWith("info-"));
console.log(`${T.filter(r => r.pass).length}/${T.length} passed`);
await b.close();
