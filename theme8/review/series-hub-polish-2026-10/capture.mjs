// TASK 01B: före/efter-bilder och geometri för seriehubben.
// node capture.mjs <before|after> [route] [widths]   (route: magic-sauce | thca)
// before = HEAD-build (29b0881) i scratch, after = lokal dist. Sekventiellt.
import { chromium } from "playwright"; import fs from "node:fs"; import path from "node:path";
const DIR = path.dirname(new URL(import.meta.url).pathname);
const ROOT = path.resolve(DIR, "../../..");
const [which = "after", route = "magic-sauce", widthsArg = "393,1440,1920"] = process.argv.slice(2);
const B = which === "before" ? process.env.HUB_BASE : path.join(ROOT, "dist/theme8");
const H = { 393: 852, 1440: 900, 1920: 1080 };
const UA = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36";
const OUT = path.join(DIR, "shots"); fs.mkdirSync(OUT, { recursive: true });
const b = await chromium.launch(); const rows = [];
for (const w of widthsArg.split(",").map(Number)) {
  const m = w < 768;
  const ctx = await b.newContext({ viewport: { width: w, height: H[w] || 900 }, deviceScaleFactor: m ? 2 : 1, isMobile: m, hasTouch: m, userAgent: m ? undefined : UA, reducedMotion: "reduce" });
  await ctx.route(/theme8\/hazey-theme8\.css/, r => r.fulfill({ path: path.join(B, "hazey-theme8.css"), contentType: "text/css" }));
  await ctx.route(/theme8\/hazey-theme8\.min\.js/, r => r.fulfill({ path: path.join(B, "hazey-theme8.min.js"), contentType: "application/javascript" }));
  await ctx.route(/github\.io\/hazey-storefront\/theme8\/assets\/([^?]+)/, r => { const f = path.join(ROOT, "theme8/assets", decodeURIComponent(new URL(r.request().url()).pathname.split("/theme8/assets/")[1])); return fs.existsSync(f) ? r.fulfill({ path: f }) : r.fulfill({ status: 404 }); });
  const p = await ctx.newPage(); const errs = [];
  p.on("pageerror", e => errs.push(String(e).slice(0, 140))); p.on("console", mm => { if (mm.type() === "error" && !/recaptcha|trustpilot|favicon|Failed to load/i.test(mm.text())) errs.push(mm.text().slice(0, 140)); });
  await p.goto(`https://hazeyse.nyehandel.se/sv/categories/${route}?preview=v9kzdmqz4w60l5n`, { waitUntil: "domcontentloaded", timeout: 120000 });
  await p.waitForFunction(() => document.documentElement.classList.contains("hz8"), null, { timeout: 90000 });
  try { await p.getByRole("button", { name: "Godkänn alla" }).click({ timeout: 4000 }); } catch {}
  await p.waitForTimeout(3000);
  await p.evaluate(async () => { for (let y = 0; y < document.documentElement.scrollHeight; y += 500) { scrollTo(0, y); await new Promise(r => setTimeout(r, 120)); } scrollTo(0, 0); });
  await p.waitForTimeout(5000);
  const g = await p.evaluate(() => {
    const R = e => { if (!e) return null; const r = e.getBoundingClientRect(); return [r.x, r.y + scrollY, r.width, r.height].map(v => Math.round(v)); };
    const nav = document.querySelector("#hz8-sh-nav") || document.querySelector(".hz8-hub-nav, [data-hz8-local]")?.closest("nav");
    const navCs = nav && getComputedStyle(nav);
    const hero = document.querySelector(".hz8-sh-hero") || document.querySelector(".hz8-cat-hero");
    const copy = document.querySelector(".hz8-sh-hero__copy");
    const lastCopy = copy ? [...copy.children].filter(e => e.offsetParent).map(e => e.getBoundingClientRect().bottom + scrollY).reduce((a, x) => Math.max(a, x), 0) : null;
    const rails = [...document.querySelectorAll(".hz8-sh-shelf .hz8-prail__list, .hz8-hub__rail .hz8-prail__list, .hz8-prail__list")].filter(e => e.offsetParent);
    const railInfo = rails.map(l => { const sec = l.closest("section, .hz8-prail"); return { title: (sec && sec.querySelector(".hz8-prail__title") || {}).textContent?.trim().slice(0, 30), cards: l.children.length, scrollbarPx: l.offsetHeight - l.clientHeight, overflow: l.scrollWidth - l.clientWidth, sbWidth: getComputedStyle(l).scrollbarWidth, snap: getComputedStyle(l).scrollSnapType, cardW: Math.round((l.children[0] || l).getBoundingClientRect().width) }; });
    const toggle = [...document.querySelectorAll(".hz8-hub__grid-toggle button, .hz8-sh-allbtn")].map(b => ({ text: b.textContent.trim().slice(0, 60), visible: !!b.offsetParent }));
    const grid = document.querySelector(".designer-category"); const gridVisible = !!(grid && grid.offsetParent && grid.getBoundingClientRect().height > 50);
    const seriesRail = document.querySelector(".hz8-sh-after .hz8-rail--series, .hz8-rail--series");
    const here = location.pathname.replace(/\/$/, "");
    const seriesLinks = seriesRail ? [...seriesRail.querySelectorAll("a[href]")].map(a => ({ t: a.textContent.replace(/\s+/g, " ").trim().slice(0, 30), self: new URL(a.href).pathname.replace(/\/$/, "") === here, current: a.getAttribute("aria-current") })) : [];
    const hdr = document.querySelector("#store-header .main") || document.querySelector("#store-header");
    const B = sel => { const e = document.querySelector(sel); if (!e || !e.offsetParent) return null; return Math.round(e.getBoundingClientRect().bottom + scrollY); };
    const heroParts = { copy: lastCopy && Math.round(lastCopy), guide: B(".hz8-sh-guide"), script: B(".hz8-sh-decor__script"), seal: B(".hz8-sh-seal, .hz8-sh-decor__seal") };
    const navTop = nav ? Math.round(nav.getBoundingClientRect().top + scrollY) : null;
    const clearance = navTop == null ? null : navTop - Math.max(0, ...Object.values(heroParts).filter(v => v != null));
    const navHits = nav ? [...nav.querySelectorAll("a")].map(a => { const cs = getComputedStyle(a, "::after"); return Math.max(Math.round(a.getBoundingClientRect().height), cs.position === "absolute" ? Math.round(parseFloat(cs.height) || 0) : 0); }) : [];
    return { url: location.pathname, heroParts, navTop, clearance, navHits, railSb: [...document.querySelectorAll(".hz8-sh-shelf .hz8-prail__list")].map(l => getComputedStyle(l).scrollbarWidth + "/" + getComputedStyle(l, "::-webkit-scrollbar").display), page: document.documentElement.className.split(" ").filter(c => /hz8-(sh|series|hub)/.test(c)).join(" "),
      hero: R(hero), heroCopyBottom: lastCopy && Math.round(lastCopy), nav: R(nav), navBg: navCs && navCs.backgroundColor, navRadius: navCs && navCs.borderTopLeftRadius, navBlur: navCs && navCs.backdropFilter, navWidthVsViewport: nav ? Math.round(nav.getBoundingClientRect().width / innerWidth * 100) : null,
      navItems: nav ? [...nav.querySelectorAll("a")].map(a => { const r = a.getBoundingClientRect(); return { t: a.textContent.replace(/\s+/g, " ").trim(), h: Math.round(r.height), w: Math.round(r.width), cur: a.getAttribute("aria-current") }; }) : [],
      navScrollbarPx: nav ? (nav.querySelector("ul") || nav).offsetHeight - (nav.querySelector("ul") || nav).clientHeight : null,
      headerBottom: hdr && Math.round(hdr.getBoundingClientRect().bottom), rails: railInfo, toggle, gridVisible, seriesLinks, ov: document.documentElement.scrollWidth - innerWidth, docH: document.documentElement.scrollHeight };
  });
  const tag = `${which}-${route}-${w}`;
  // 1) hero -> formatnavigation
  if (g.nav) await p.evaluate(y => scrollTo(0, Math.max(0, y)), g.nav[1] - Math.round((H[w] || 900) * 0.55)); else await p.evaluate(() => scrollTo(0, 0));
  await p.waitForTimeout(700); await p.screenshot({ path: `${OUT}/${tag}-1-hero-nav.png` });
  // 2) längsta hyllan
  const longest = g.rails.reduce((a, r, i) => (r.cards > (g.rails[a] || { cards: -1 }).cards ? i : a), 0);
  await p.evaluate(i => { const l = [...document.querySelectorAll(".hz8-sh-shelf .hz8-prail__list, .hz8-hub__rail .hz8-prail__list, .hz8-prail__list")].filter(e => e.offsetParent)[i]; if (l) { const s = l.closest("section, .hz8-prail") || l; scrollTo(0, s.getBoundingClientRect().top + scrollY - 90); } }, longest);
  await p.waitForTimeout(700); await p.screenshot({ path: `${OUT}/${tag}-2-long-rail.png` });
  // 3) serienavigering -> service/footer
  await p.evaluate(() => { const s = document.querySelector(".hz8-sh-after, .hz8-hub__grid-toggle, .hz8-rail--series") || document.querySelector(".hz8-footer"); scrollTo(0, s.getBoundingClientRect().top + scrollY - 120); });
  await p.waitForTimeout(700); await p.screenshot({ path: `${OUT}/${tag}-3-bottom.png` });
  // 4) helsida (JPEG, för överblick)
  await p.evaluate(() => scrollTo(0, 0)); await p.waitForTimeout(500);
  await p.screenshot({ path: `${OUT}/${tag}-4-full.jpg`, fullPage: true, type: "jpeg", quality: 62 });
  rows.push({ which, route, w, ...g, errs }); console.log(JSON.stringify({ which, route, w, ...g, rails: g.rails, errs }));
  await ctx.close();
}
fs.writeFileSync(path.join(OUT, `${which}-${route}-geometry.json`), JSON.stringify(rows, null, 1));
await b.close();
