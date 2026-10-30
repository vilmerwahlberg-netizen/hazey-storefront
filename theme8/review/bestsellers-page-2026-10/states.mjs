// TASK 11 -- tillstånd via fetch-interception (efter), 393 + 1440:
//   empty        källan svarar med 0 produkter -> "Inga bästsäljare just nu." + Alla produkter, ingen guide
//   empty-format ?typ=hasch + I lager där lagerfiltret svarar tomt -> format-tomruta + "Visa alla bästsäljare"
//   error        källan avbryts -> felruta + Försök igen (återhämtar när nätet är tillbaka)
//   short        källan = liten riktig kategori (1-4 resp. 5-12) -> ingen knapp, ingen räknerad
//   skeleton     källan fördröjd 4 s -> 12 skeletonceller, CLS i listan
//   cold         kall laddning + Fast 3G (CDP) -> adminytan målas aldrig
// node states.mjs [state]
import { chromium, ctxFor, open, ready, DIR } from "./lib.mjs"; import fs from "node:fs";
const only = process.argv[2]; const R = {};
const ROUTE = "/sv/page/vara-bastsaljare";
const SRC = /\/sv\/categories\/alla-produkter\?sort=popular/;
const b = await chromium.launch();
const shot = (p, n, full) => p.screenshot({ path: `${DIR}/runs/shots/after-state-${n}.jpg`, type: "jpeg", quality: 74, fullPage: !!full });
const ST = () => ({
  cells: document.querySelectorAll("#hz8-bs-grid > [data-hz8-path]").length, skel: document.querySelectorAll("#hz8-bs-grid .hz8-bs-skel").length,
  busy: document.getElementById("hz8-bs-grid").getAttribute("aria-busy"),
  state: [...document.querySelectorAll(".hz8-bs-state p")].map(e => e.textContent.replace(/\s+/g, " ").trim()).join(" | ") || null,
  action: [...document.querySelectorAll(".hz8-bs-state .hz8-pcta")].map(e => e.textContent.trim() + (e.href ? " -> " + new URL(e.href).pathname : "")),
  more: document.querySelector(".hz8-bs-more").hidden ? null : document.querySelector(".hz8-bs-more__text").textContent,
  guide: !document.querySelector(".hz8-bs-guide").hidden, tabs: [...document.querySelectorAll(".hz8-pfam__tab")].map(t => t.textContent),
  lower: [...document.querySelectorAll(".hz8-lmod")].filter(e => !e.hidden).length, h1: document.querySelectorAll("h1").length
});
const swap = (body, n) => {
  // Behåll de n första korten i #category-products och sätt räknaren till n.
  let i = 0; body = body.replace(/(<[a-z]+[^>]*class="[^"]*\bproduct-card\b)/g, m => (i++ < n ? m : m.replace(/product-card$/, "hz8x-card")));
  return body.replace(/(id="products_count"[^>]*>[^<\d]*)\d+/, `$1${n}`);
};
async function run(name, w, setup, route = ROUTE, extra = 6000) {
  const ctx = await ctxFor(b, w, w < 768 ? 852 : 900, { which: "after" }); await setup(ctx);
  const p = await open(ctx, route); await ready(p, 2000); await p.waitForTimeout(extra);
  return { p, ctx };
}
for (const w of [393, 1440]) {
  if (!only || only === "empty") {
    const { p, ctx } = await run("empty", w, ctx => ctx.route(SRC, async r => { const res = await r.fetch(); return r.fulfill({ response: res, body: swap(await res.text(), 0) }); }));
    const r = { ...(await p.evaluate(ST)), errors: p.errors }; await shot(p, `empty-${w}`, true);
    r.ok = /Inga bästsäljare just nu/.test(r.state) && r.action.some(a => /Alla produkter -> \/sv\/categories\/alla-produkter/.test(a)) && !r.guide && !r.more && r.cells === 0;
    R[`empty-${w}`] = r; console.log("empty", w, JSON.stringify(r)); await ctx.close();
  }
  if (!only || only === "empty-format") {
    const { p, ctx } = await run("empty-format", w, ctx => ctx.route(/alla-produkter\?sort=popular.*smart-filter_in-stock/, async r => { const res = await r.fetch(); return r.fulfill({ response: res, body: swap(await res.text(), 0) }); }), ROUTE + "?typ=hasch&filters=smart-filter_in-stock", 9000);
    const r = { ...(await p.evaluate(ST)) };
    await p.evaluate(() => { const g = document.getElementById("hz8-bs-list"); scrollTo({ top: g.getBoundingClientRect().top + scrollY - 260, behavior: "instant" }); }); await p.waitForTimeout(400); await shot(p, `empty-format-${w}`);
    await p.locator('.hz8-bs-state [data-bs="reset"]').click(); await p.waitForTimeout(1200);
    r.afterReset = await p.evaluate(() => ({ url: location.search.replace(/[?&]preview=[^&]+/, ""), cells: document.querySelectorAll("#hz8-bs-grid > [data-hz8-path]").length, tab: document.querySelector('.hz8-pfam__tab[aria-pressed="true"]').textContent, stock: document.querySelector('[data-bs="stock"]').getAttribute("aria-checked") }));
    r.errors = p.errors;
    r.ok = /Inga bästsäljare i det här formatet just nu/.test(r.state) && r.action.includes("Visa alla bästsäljare") && r.afterReset.cells === 12 && r.afterReset.tab === "Alla" && r.afterReset.stock === "false";
    R[`empty-format-${w}`] = r; console.log("empty-format", w, JSON.stringify(r)); await ctx.close();
  }
  if (!only || only === "error") {
    let fail = true;
    const { p, ctx } = await run("error", w, ctx => ctx.route(SRC, r => (fail ? r.abort("failed") : r.continue())), ROUTE, 5000);
    const r = { ...(await p.evaluate(ST)) };
    await p.evaluate(() => { const g = document.getElementById("hz8-bs-list"); scrollTo({ top: g.getBoundingClientRect().top + scrollY - 260, behavior: "instant" }); }); await p.waitForTimeout(400); await shot(p, `error-${w}`);
    fail = false; await p.locator('.hz8-bs-state [data-bs="retry"]').click(); await p.waitForTimeout(7000);
    r.retry = await p.evaluate(ST); r.errors = p.errors.filter(e => !/Failed to load resource|net::ERR_FAILED/.test(e));
    r.ok = /Bästsäljarna kunde inte laddas\. Försök igen om en stund\./.test(r.state) && r.action.includes("Försök igen") && r.lower >= 2 && r.h1 >= 1 && r.retry.cells === 12 && /av \d+/.test(r.retry.more || "");
    R[`error-${w}`] = r; console.log("error", w, JSON.stringify(r)); await ctx.close();
  }
  if (!only || only === "short") {
    for (const n of [3, 7]) {
      const { p, ctx } = await run("short", w, ctx => ctx.route(SRC, async r => { const res = await r.fetch(); return r.fulfill({ response: res, body: swap(await res.text(), n) }); }), ROUTE, 9000);
      const r = { ...(await p.evaluate(ST)), errors: p.errors };
      r.expected = await p.evaluate(async n => { const pv = location.search.match(/preview=[^&]+/)[0]; const d = new DOMParser().parseFromString(await (await fetch("/sv/categories/alla-produkter?sort=popular&" + pv)).text(), "text/html"); const seen = {}; return [...d.querySelectorAll("#category-products .product-card")].slice(0, n).filter(c => { const b = (c.querySelector(".brand") || {}).textContent?.trim(); const h = new URL(c.querySelector("a[href*='/products/']").href).pathname.replace(/\/\d+$/, ""); if (!b || seen[h]) return false; return (seen[h] = 1); }).length; }, n);
      await p.evaluate(() => { const g = document.getElementById("hz8-bs-list"); scrollTo({ top: g.getBoundingClientRect().top + scrollY - 200, behavior: "instant" }); }); await p.waitForTimeout(400); await shot(p, `short${n}-${w}`);
      r.ok = r.cells === r.expected && !r.more;
      R[`short${n}-${w}`] = r; console.log("short", n, w, JSON.stringify(r)); await ctx.close();
    }
  }
  if (!only || only === "skeleton") {
    const ctx = await ctxFor(b, w, w < 768 ? 852 : 900, { which: "after" });
    await ctx.route(SRC, async r => { await new Promise(x => setTimeout(x, 4000)); return r.continue(); });
    await ctx.addInitScript(() => { window.__cls = []; new PerformanceObserver(l => l.getEntries().forEach(e => { if (!e.hadRecentInput) window.__cls.push({ v: e.value, t: Math.round(e.startTime), src: (e.sources || []).map(s => s.node ? (s.node.id || s.node.className || s.node.nodeName).toString().slice(0, 40) : "?") }); })).observe({ type: "layout-shift", buffered: true }); });
    const p = await open(ctx, ROUTE); await ready(p, 0);
    await p.waitForSelector("#hz8-bs-grid .hz8-bs-skel", { timeout: 15000 }).catch(() => {});
    const r = { during: await p.evaluate(ST) };
    const geo = () => p.evaluate(() => { const g = document.getElementById("hz8-bs-grid"), c = g.firstElementChild; return { gridTop: Math.round(g.getBoundingClientRect().top + scrollY), cellW: c ? Math.round(c.getBoundingClientRect().width) : 0, cellH: c ? Math.round(c.getBoundingClientRect().height) : 0, guideTop: Math.round(document.querySelector(".hz8-bs-guide").getBoundingClientRect().top + scrollY) }; });
    r.geoDuring = await geo(); r.lowerDuring = await p.evaluate(() => Math.round(document.querySelector(".hz8-lmods").getBoundingClientRect().top + scrollY)); await shot(p, `skeleton-${w}`);
    await p.waitForFunction(() => document.querySelectorAll("#hz8-bs-grid > [data-hz8-path]").length > 0, null, { timeout: 30000 }).catch(() => {}); await p.waitForTimeout(3000);
    r.after = await p.evaluate(ST); r.geoAfter = await geo(); r.lowerAfter = await p.evaluate(() => Math.round(document.querySelector(".hz8-lmods").getBoundingClientRect().top + scrollY));
    r.shifts = await p.evaluate(() => window.__cls); r.cls = +r.shifts.reduce((a, s) => a + s.v, 0).toFixed(4);
    r.listShift = +r.shifts.filter(s => s.src.some(x => /hz8-bs|hz8-series|hz8-pgrid|product|hz8-proutes|hz8-lmod/.test(x))).reduce((a, s) => a + s.v, 0).toFixed(4);
    r.errors = p.errors; r.ok = r.during.skel === 12 && r.during.busy === "true" && r.after.cells === 12 && r.listShift < 0.05 && r.geoDuring.gridTop === r.geoAfter.gridTop;
    R[`skeleton-${w}`] = r; console.log("skeleton", w, JSON.stringify(r)); await ctx.close();
  }
  if (!only || only === "cold") {
    const ctx = await ctxFor(b, w, w < 768 ? 852 : 900, { which: "after" });
    await ctx.addInitScript(() => {
      const log = []; window.__cold = log; const t0 = performance.now();
      const tick = () => {
        const b = document.body, h = document.documentElement;
        if (b) {
          const cs = getComputedStyle(b); const painted = cs.visibility !== "hidden" && parseFloat(cs.opacity) > 0;
          const vis = sel => { const e = document.querySelector(sel); if (!e) return false; const r = e.getBoundingClientRect(); return r.height > 0 && r.bottom > 0 && r.top < innerHeight && getComputedStyle(e).visibility !== "hidden"; };
          log.push({ t: Math.round(performance.now() - t0), painted, boot: h.classList.contains("hz8-boot"), admin: painted && (vis(".nh-bs-hero") || vis(".nh-bs-filters") || vis(".store-page h2")), page: !!document.querySelector(".hz8-bs-hero"), skel: !!document.querySelector(".hz8-bs-skel"), cards: document.querySelectorAll("#hz8-bs-grid > [data-hz8-path]").length });
        }
        if (performance.now() - t0 < 25000) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    });
    const p = await ctx.newPage(); p.errors = []; p.on("pageerror", e => p.errors.push(String(e)));
    const cdp = await ctx.newCDPSession(p); await cdp.send("Network.enable");
    await cdp.send("Network.emulateNetworkConditions", { offline: false, latency: 562.5, downloadThroughput: 1.6 * 1024 * 1024 / 8 * .9, uploadThroughput: 750 * 1024 / 8 * .9 });
    await cdp.send("Network.setCacheDisabled", { cacheDisabled: true });
    await p.goto(`https://hazeyse.nyehandel.se${ROUTE}?preview=v9kzdmqz4w60l5n`, { waitUntil: "domcontentloaded", timeout: 120000 });
    await p.waitForTimeout(22000); await shot(p, `cold-${w}`);
    const log = await p.evaluate(() => window.__cold);
    const firstPaint = log.find(x => x.painted), firstPage = log.find(x => x.painted && x.page), firstCards = log.find(x => x.cards > 0);
    const r = { frames: log.length, adminFrames: log.filter(x => x.admin).length, firstPaint: firstPaint && firstPaint.t, firstPaintHasPage: firstPaint && firstPaint.page, firstPage: firstPage && firstPage.t, firstCards: firstCards && firstCards.t, paintedWithoutPage: log.filter(x => x.painted && !x.page).length, errors: p.errors };
    r.ok = r.adminFrames === 0 && r.paintedWithoutPage === 0;
    R[`cold-${w}`] = r; console.log("cold", w, JSON.stringify(r)); await ctx.close();
  }
}
fs.writeFileSync(`${DIR}/runs/states-after${only ? "-" + only : ""}.json`, JSON.stringify(R, null, 1));
await b.close();
