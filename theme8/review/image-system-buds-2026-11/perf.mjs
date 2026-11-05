// TASK 17C — bildsystemets verkliga kostnad. Samma sida, samma nät, tre byggen:
//   base     = f0ac3be (före bildsystemet, XD_BASE)
//   runtime  = 6f31f3e (pixelklassning i webbläsaren, XD_RUNTIME)
//   after    = arbetskopian (statiskt bildmanifest)
// Per sida x bredd x läge (kall / varm / Fast 3G + 4x CPU) mäts:
//   bildanrop mot Nyehandels CDN (CDP Network), dubbla hämtningar (samma URL över nätet mer än en gång),
//   klassificeringar (getImageData-anrop), dokumentvida omskanningar (querySelectorAll med bildytornas
//   selektor), long tasks + TBT, Script/TaskDuration, LCP, CLS och synligt stilbyte (bildytans
//   data-hz8-media byts EFTER att bilden redan målats i viewporten). Därefter en interaktionsfas:
//   rullning + 10 klick på neutral yta (+ miniatyr-/strainklick på PDP) -> omskanningar/klassificeringar.
// Kör: XD_BASE=... XD_RUNTIME=... node perf.mjs base,runtime,after  ->  runs/perf-<which>.json
import fs from "node:fs"; import path from "node:path";
import { chromium, ready, url, DIR, BUILDS, ROOT } from "./lib/harness.mjs";
// Playwrights ctx.route stänger av HTTP-cachen -> varm laddning går inte att mäta med harness.ctxFor.
// Här byts loadern/bundlen i stället via CDP Fetch (endast dokument + Theme 8-filer), så CDN-bilderna
// cachas som hos en riktig besökare.
const UA = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36";
const LOADER_RE = /<!-- Theme 8 development loader[\s\S]*?<\/script>/;
async function ctxFor(browser, w, h, { which }) {
  const m = w < 768; return browser.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: m ? 2 : 1, isMobile: m, hasTouch: m, userAgent: m ? undefined : UA, __which: which });
}
async function intercept(cdp, which) {
  const B = BUILDS[which === "base" ? "before" : which], loader = fs.readFileSync(B.loader, "utf8").trim();
  await cdp.send("Fetch.enable", { patterns: [
    { urlPattern: "*hazeyse.nyehandel.se/*preview=*", resourceType: "Document", requestStage: "Response" },
    { urlPattern: "*theme8/hazey-theme8.css*", requestStage: "Request" }, { urlPattern: "*theme8/hazey-theme8.min.js*", requestStage: "Request" },
    { urlPattern: "*github.io/hazey-storefront/theme8/assets/*", requestStage: "Request" }] });
  cdp.on("Fetch.requestPaused", async e => {
    const u = e.request.url, ok = (body, type) => cdp.send("Fetch.fulfillRequest", { requestId: e.requestId, responseCode: 200, responseHeaders: [{ name: "Content-Type", value: type }, { name: "Access-Control-Allow-Origin", value: "*" }], body: Buffer.from(body).toString("base64") }).catch(() => {});
    try {
      if (e.responseStatusCode) {
        const r = await cdp.send("Fetch.getResponseBody", { requestId: e.requestId });
        const html = r.base64Encoded ? Buffer.from(r.body, "base64").toString("utf8") : r.body;
        return ok(html.replace(LOADER_RE, () => loader), "text/html; charset=utf-8");
      }
      if (/hazey-theme8\.css/.test(u)) return ok(fs.readFileSync(path.join(B.build, "hazey-theme8.css")), "text/css");
      if (/hazey-theme8\.min\.js/.test(u)) return ok(fs.readFileSync(path.join(B.build, "hazey-theme8.min.js")), "application/javascript");
      const f = path.join(ROOT, "theme8/assets", decodeURIComponent(new URL(u).pathname.split("/assets/")[1]));
      if (fs.existsSync(f)) return ok(fs.readFileSync(f), /\.webp$/.test(f) ? "image/webp" : /\.png$/.test(f) ? "image/png" : /\.svg$/.test(f) ? "image/svg+xml" : "image/jpeg");
      return cdp.send("Fetch.continueRequest", { requestId: e.requestId }).catch(() => {});
    } catch (err) { return cdp.send("Fetch.continueRequest", { requestId: e.requestId }).catch(() => {}); }
  });
}
const WHICH = (process.argv[2] || "after").split(",");
const ONLY = process.argv[3] ? process.argv[3].split(",") : null;
const PAGES = { home: "/", bestsellers: "/sv/page/vara-bastsaljare", buds: "/sv/categories/blommor-buds", "pdp-yoda": "/sv/products/magic-sauce-buds-yoda-ice-cream-5-gram" };
const SIZES = [[393, 852], [1440, 900]];
const MODES = ["cold", "warm", "fast3g"];
const SEL = "hz8-bs-card__media";
const INIT = () => {
  const P = window.__perf = { cls: 0, lcp: 0, longtasks: 0, tbt: 0, classify: 0, scans: 0, flips: [], t0: performance.now() };
  const gid = CanvasRenderingContext2D.prototype.getImageData;
  CanvasRenderingContext2D.prototype.getImageData = function () { P.classify++; return gid.apply(this, arguments); };
  const dq = Document.prototype.querySelectorAll;
  Document.prototype.querySelectorAll = function (s) { if (typeof s === "string" && s.indexOf("hz8-bs-card__media") > -1) P.scans++; return dq.apply(this, arguments); };
  new PerformanceObserver(l => { for (const e of l.getEntries()) if (!e.hadRecentInput) P.cls += e.value; }).observe({ type: "layout-shift", buffered: true });
  new PerformanceObserver(l => { for (const e of l.getEntries()) P.lcp = e.startTime; }).observe({ type: "largest-contentful-paint", buffered: true });
  try { new PerformanceObserver(l => { for (const e of l.getEntries()) { P.longtasks++; P.tbt += Math.max(0, e.duration - 50); } }).observe({ type: "longtask", buffered: true }); } catch (e) {}
  new MutationObserver(ms => {
    for (const m of ms) {
      const box = m.target, to = box.getAttribute("data-hz8-media");
      if (!to || to === "pending" || to === m.oldValue) continue;
      const r = box.getBoundingClientRect(), img = box.querySelector("img") || (box.matches(".product-detail__media") ? box.querySelector("#product-slides img") : null);
      const inView = r.width > 30 && r.bottom > 0 && r.top < innerHeight && r.right > 0 && r.left < innerWidth;
      const painted = !!(img && img.complete && img.naturalWidth);
      P.flips.push({ t: Math.round(performance.now()), from: m.oldValue, to, visible: inView && painted && !!(m.oldValue === null || m.oldValue === "pending") });
    }
  }).observe(document, { subtree: true, attributes: true, attributeFilter: ["data-hz8-media"], attributeOldValue: true });
  // Målad obehandlad: efter varje ram (rAF -> setTimeout = efter målningen) -- en bildyta i viewporten med
  // färdig bild men utan slutlig typ har visats obehandlad minst en ram. Räknas en gång per bildyta.
  const FINAL = ["transparent", "white", "embedded", "environment", "unverified"], seen = new WeakSet(); P.seenUntreated = 0;
  const frame = () => setTimeout(() => {
    if (document.documentElement.classList.contains("hz8") && !document.documentElement.classList.contains("hz8-boot")) {
      dq.call(document, ".product-detail__media, .product-card__image, .hz8-bs-card__media, .hz8-pcard__media, .hz8-spot__art, #product-thumbnails .thumb").forEach(e => {
        if (seen.has(e) || FINAL.includes(e.getAttribute("data-hz8-media"))) return;
        const r = e.getBoundingClientRect(); if (r.width < 30 || r.bottom < 0 || r.top > innerHeight) return;
        const i = e.matches(".product-detail__media") ? e.querySelector("#product-slides img") : e.querySelector("img");
        if (i && i.complete && i.naturalWidth && getComputedStyle(e).visibility !== "hidden") { seen.add(e); P.seenUntreated++; }
      });
    }
    if (performance.now() < 30000) requestAnimationFrame(frame);
  }, 0);
  requestAnimationFrame(frame);
};
const b = await chromium.launch();
async function measure(ctx, p, cdp, route, key) {
  const reqs = new Map(), net = []; let bytes = 0;
  const onReq = e => { if (/cloudfront\.net/.test(e.request.url) && (e.type === "Image" || /\.(jpe?g|png|webp)|eyJ/.test(e.request.url))) reqs.set(e.requestId, { url: e.request.url, cache: false, mode: e.request.headers.Origin ? "cors" : "no-cors" }); };
  const onCache = e => { const r = reqs.get(e.requestId); if (r) r.cache = true; };
  const onResp = e => { const r = reqs.get(e.requestId); if (r && (e.response.fromDiskCache || e.response.fromMemoryCache)) r.cache = true; };
  const onFin = e => { const r = reqs.get(e.requestId); if (r) { r.bytes = e.encodedDataLength; if (!r.cache) bytes += e.encodedDataLength; } };
  cdp.on("Network.requestWillBeSent", onReq); cdp.on("Network.requestServedFromCache", onCache); cdp.on("Network.responseReceived", onResp); cdp.on("Network.loadingFinished", onFin);
  const m0 = Object.fromEntries((await cdp.send("Performance.getMetrics")).metrics.map(m => [m.name, m.value]));
  const t0 = Date.now();
  for (let i = 0; ; i++) { try { await p.goto(url(route), { waitUntil: "domcontentloaded", timeout: 120000 }); break; } catch (e) { if (i >= 2) throw e; await p.waitForTimeout(8000); } }
  await ready(p, 3000);
  await p.waitForLoadState("load", { timeout: 60000 }).catch(() => {});
  const load = await p.evaluate(() => { const P = window.__perf; return { cls: P.cls, lcp: Math.round(P.lcp), longtasks: P.longtasks, tbt: Math.round(P.tbt), classify: P.classify, scans: P.scans, flips: P.flips.length, visibleFlips: P.flips.filter(f => f.visible).length, seenUntreated: P.seenUntreated }; });
  const m1 = Object.fromEntries((await cdp.send("Performance.getMetrics")).metrics.map(m => [m.name, m.value]));
  // Interaktionsfas
  for (let i = 0; i < 8; i++) { await p.mouse.wheel(0, 900); await p.waitForTimeout(250); }
  await p.waitForTimeout(1500);
  const pre = await p.evaluate(() => ({ c: window.__perf.classify, s: window.__perf.scans, f: window.__perf.flips.length }));
  for (let i = 0; i < 10; i++) { await p.mouse.click(4, 300 + i * 20); await p.waitForTimeout(120); }
  await p.waitForTimeout(800);
  const clicks = await p.evaluate(pre => ({ classify: window.__perf.classify - pre.c, scans: window.__perf.scans - pre.s }), pre);
  let pdp = null;
  if (key.startsWith("pdp")) {
    await p.evaluate(() => scrollTo(0, 0)); await p.waitForTimeout(600);
    const pre2 = await p.evaluate(() => ({ c: window.__perf.classify, s: window.__perf.scans }));
    const th = p.locator("#product-thumbnails .thumb"); const n = Math.min(await th.count(), 3);
    for (let i = n - 1; i >= 0; i--) { await th.nth(i).click({ timeout: 3000 }).catch(() => {}); await p.waitForTimeout(700); }
    pdp = await p.evaluate(pre => { const m = document.querySelector(".product-detail__media"); const img = m && (m.querySelector("#product-slides .slide.is-active img, #product-slides .slide.active img")); return { classify: window.__perf.classify - pre.c, scans: window.__perf.scans - pre.s, follows: !!(img && m.getAttribute("data-hz8-media-src") === (img.currentSrc || img.src)), media: m && m.getAttribute("data-hz8-media") }; }, pre2);
  }
  cdp.off("Network.requestWillBeSent", onReq); cdp.off("Network.requestServedFromCache", onCache); cdp.off("Network.responseReceived", onResp); cdp.off("Network.loadingFinished", onFin);
  const all = [...reqs.values()], netReqs = all.filter(r => !r.cache);
  const byUrl = {}; netReqs.forEach(r => { byUrl[r.url] = (byUrl[r.url] || 0) + 1; });
  const corsProbes = all.filter(r => r.mode === "cors").length;
  return { wall: Date.now() - t0, ...load, scriptMs: Math.round((m1.ScriptDuration - (m1.ScriptDuration >= m0.ScriptDuration ? m0.ScriptDuration : 0)) * 1000), taskMs: Math.round((m1.TaskDuration - (m1.TaskDuration >= m0.TaskDuration ? m0.TaskDuration : 0)) * 1000),
    imgRequests: all.length, imgNetwork: netReqs.length, imgCached: all.length - netReqs.length, imgKB: Math.round(bytes / 1024), dupNetwork: Object.values(byUrl).filter(n => n > 1).reduce((a, n) => a + n - 1, 0), corsProbes,
    clicks, pdp };
}
for (const which of WHICH) {
  const R = { which, rows: [] };
  for (const [key, route] of Object.entries(PAGES)) for (const [w, h] of SIZES) {
    if (ONLY && !ONLY.includes(key)) continue;
    for (const mode of process.env.ONLY3G ? ["fast3g"] : process.env.NO3G ? ["cold+warm"] : ["cold+warm", "fast3g"]) {
      const ctx = await ctxFor(b, w, h, { which }); await ctx.addInitScript(INIT);
      const p = await ctx.newPage(); const cdp = await ctx.newCDPSession(p);
      await cdp.send("Network.enable"); await cdp.send("Performance.enable"); await intercept(cdp, which);
      if (mode === "fast3g") {
        await cdp.send("Network.emulateNetworkConditions", { offline: false, latency: 562.5, downloadThroughput: 1.6 * 1024 * 1024 / 8 * 0.9, uploadThroughput: 750 * 1024 / 8 * 0.9 });
        await cdp.send("Emulation.setCPUThrottlingRate", { rate: 4 });
      }
      const modes = mode === "fast3g" ? ["fast3g"] : ["cold", "warm"];
      for (const md of modes) {
        try { const r = await measure(ctx, p, cdp, route, key); r.key = key; r.w = w; r.mode = md; R.rows.push(r);
          console.log(`${which} ${key} ${w} ${md}: img ${r.imgRequests} (nät ${r.imgNetwork}, ${r.imgKB} kB, dubbla ${r.dupNetwork}, cors ${r.corsProbes}) klass ${r.classify} skan ${r.scans} LT ${r.longtasks}/${r.tbt}ms script ${r.scriptMs}ms LCP ${r.lcp} CLS ${r.cls.toFixed(3)} byten ${r.flips}/${r.visibleFlips} obehandlad-målad ${r.seenUntreated} klick→skan ${r.clicks.scans} klass ${r.clicks.classify}${r.pdp ? ` pdp skan ${r.pdp.scans} klass ${r.pdp.classify} följer ${r.pdp.follows}` : ""}`);
        } catch (e) { console.log(`${which} ${key} ${w} ${md}: FEL ${e.message.slice(0, 120)}`); }
      }
      await ctx.close();
    }
  }
  fs.writeFileSync(path.join(DIR, `runs/perf-${which}${process.env.TAG ? "-" + process.env.TAG : process.env.NO3G ? "-paint" : ""}.json`), JSON.stringify(R, null, 1));
}
await b.close();
