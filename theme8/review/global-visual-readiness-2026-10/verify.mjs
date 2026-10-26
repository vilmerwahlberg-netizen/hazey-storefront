// TASK 01C -- laddningsmatris. Ett Playwright-jobb i taget mot previewn.
// node verify.mjs <before|after> <scenario[,..]> <route[,..]> <width[,..]> [tag]
// Scenarier: cold, warm, throttled, zoom200, css-fail, js-fail, js-throw,
//            never-boots, never-ready, css-hang
// Per körning (per animationsram i sidan):
//   firstPaint  -- första ram där <body> målas (visibility/opacity)
//   readyAt     -- första målade ram med html.hz8 utan mask
//   sidebarPx   -- max synliga px av stängd #sidebar (rect ∩ viewport,
//                  plus skuggans ~36 px), bara när den faktiskt målas
//   pendingPaintedMs -- tid då sidan målas med synliga väntemarkörer /
//                  ej laddade bilder i viewporten (oavslutat läge)
//   ctrlChanged -- synliga kontroller (knappar/länkknappar/chips) i första
//                  målade ramen vars färg, text eller läge skiljer sig från
//                  slutläget = mellanläge (t.ex. grön native-knapp, flyttad
//                  verktygsrad). Headern (entré-animation), samtyckesrutan
//                  och #sidebar räknas inte.
//   overflowX, errors, final (slutläge)
// SHEET=1 sparar ramar (jpeg) för kontaktark i runs/frames/<namn>/.
import { chromium, ctxFor, url, ROUTES, DIR, acceptCookies } from "./lib.mjs"; import fs from "node:fs";
const which = process.argv[2] || "after";
const scenarios = (process.argv[3] || "cold").split(",");
const routes = (process.argv[4] || "ms-carts").split(",");
const widths = (process.argv[5] || "1440").split(",").map(Number);
const tag = process.argv[6] || "";
const H = { 393: 852, 1280: 800, 1440: 900, 1920: 1080 };
const OUT = `${DIR}/runs`; fs.mkdirSync(OUT, { recursive: true });
const FAST3G = { offline: false, latency: 150, downloadThroughput: 1.6 * 1024 * 1024 / 8, uploadThroughput: 750 * 1024 / 8 };
const SC = {
  cold: {}, warm: { warm: true }, zoom200: { zoom: 2 },
  throttled: { cssDelay: 1800, jsDelay: 1400, net: true, cpu: 4 },
  "css-fail": { cssFail: "abort" }, "js-fail": { jsFail: "abort" }, "js-throw": { jsFail: "syntax" },
  "never-boots": { jsFail: "never-boots" }, "never-ready": { jsFail: "never-ready" }, "css-hang": { cssFail: "hang" }
};

export const TL = () => {
  const t0 = performance.now(); const log = []; window.__tl = { log, sig0: null, sigT: null, clsAfter: 0, clsAll: 0 };
  /* Layoutskift (CLS-bidrag utan nylig input), totalt och efter visning. */
  try { new PerformanceObserver(l => { for (const e of l.getEntries()) { if (e.hadRecentInput) continue; window.__tl.clsAll += e.value;
    const h = document.documentElement; if (h.classList.contains("hz8") && !h.classList.contains("hz8-settling") && !h.classList.contains("hz8-boot")) window.__tl.clsAfter += e.value; } })
    .observe({ type: "layout-shift", buffered: true }); } catch {}
  const CTRL = "#store-main :is(button, a.button, .button, [role=button], .hz8-btn, .hz8-rail__item, .hz8-chip, .selected-filters-item, select, input[type=checkbox]), .hz8-sf-fs, .hz8-pswitch";
  const PENDING = "[aria-busy='true'], .is-loading, .is-pending, .hz8-series-pending";
  const iv = (r, pad = 0) => r.width > 0 && r.height > 0 && r.top < innerHeight && r.bottom > 0 && r.left - pad < innerWidth && r.right + pad > 0;
  window.__sig = () => { const out = {}, seen = {};
    document.querySelectorAll(CTRL).forEach(el => { if (el.closest("#store-header, #sidebar, #cartAside, :not(html):not(body)[class*='consent'], [data-t01c-fixture]")) return;
      const r = el.getBoundingClientRect(); if (!iv(r)) return; const cs = getComputedStyle(el); if (cs.visibility === "hidden" || cs.display === "none" || +cs.opacity === 0) return;
      const key = el.tagName + "." + [...el.classList].slice(0, 2).join(".") + ":" + (el.textContent || "").trim().slice(0, 24);
      seen[key] = (seen[key] || 0) + 1; out[key + "#" + seen[key]] = [cs.backgroundColor, cs.color, Math.round(r.left), Math.round(r.top), Math.round(r.width), Math.round(r.height)].join(","); });
    return out; };
  const tick = () => {
    const h = document.documentElement, b = document.body;
    if (b) {
      const cs = getComputedStyle(b); const painted = cs.visibility !== "hidden" && parseFloat(cs.opacity) > 0;
      const masked = h.classList.contains("hz8-boot") || h.classList.contains("hz8-settling");
      const sb = document.querySelector("#sidebar"); let sbPx = 0, sbShadow = 0;
      if (sb && painted && !sb.classList.contains("is-active")) { const s = getComputedStyle(sb);
        if (s.visibility !== "hidden" && s.display !== "none" && +s.opacity > 0) { const r = sb.getBoundingClientRect();
          const vis = (L, R) => Math.max(0, Math.min(R, innerWidth) - Math.max(L, 0)) * Math.max(0, Math.min(r.bottom, innerHeight) - Math.max(r.top, 0));
          sbPx = Math.round(vis(r.left, r.right)); sbShadow = s.boxShadow !== "none" ? Math.round(vis(r.left, r.right + 36)) : sbPx; } }
      let pend = 0, pendDef = 0; const isDef = e => !!(e.parentElement && e.parentElement.closest("[data-hz8-defer]"));
      if (painted) { document.querySelectorAll(PENDING).forEach(e => { if (!e.closest("#sidebar, #cartAside, [hidden]") && iv(e.getBoundingClientRect())) isDef(e) ? pendDef++ : pend++; });
        document.querySelectorAll("#store-header img, #store-main img").forEach(e => { if (!e.complete && iv(e.getBoundingClientRect())) isDef(e) ? pendDef++ : pend++; }); }
      const ready = h.classList.contains("hz8") && !masked;
      const hdrAnim = h.classList.contains("hz8-header-priming") || h.classList.contains("hz8-header-entering");
      log.push({ ep: performance.timeOrigin + performance.now(), t: Math.round(performance.now() - t0), painted, masked, hdrAnim, hz8: h.classList.contains("hz8"), ready, sbPx, sbShadow, pend, pendDef,
        ox: document.documentElement.scrollWidth > innerWidth + 1 });
      if (painted && !window.__tl.sig0 && h.classList.contains("hz8")) { window.__tl.sig0 = window.__sig(); window.__tl.sigT = Math.round(performance.now() - t0); }
    }
    if (performance.now() - t0 < 25000) requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
};

export async function measure(p, { settleMs = 7000 } = {}) {
  await p.waitForTimeout(settleMs);
  return p.evaluate(() => {
    const log = window.__tl ? window.__tl.log : []; const h = document.documentElement; const b = document.body; const cs = getComputedStyle(b);
    let firstPaint = null, readyAt = null, headerAnimMs = 0, deferredPaintedMs = 0, pendingPaintedMs = 0, sidebarPx = 0, sidebarShadowPx = 0, nativePaintedMs = 0, ox = false;
    for (let i = 0; i < log.length; i++) { const e = log[i], d = (log[i + 1]?.t ?? e.t) - e.t;
      if (e.painted && firstPaint == null) firstPaint = e.t;
      if (e.ready && readyAt == null) readyAt = e.t;
      if (e.painted && e.pend) pendingPaintedMs += d;
      if (e.painted && !e.hz8) nativePaintedMs += d;
      if (e.painted && e.hdrAnim) headerAnimMs += d;
      if (e.painted && e.pendDef) deferredPaintedMs += d;
      sidebarPx = Math.max(sidebarPx, e.sbPx); sidebarShadowPx = Math.max(sidebarShadowPx, e.sbShadow); ox = ox || (e.ready && e.ox); }
    const fin = window.__sig ? window.__sig() : {}; const s0 = window.__tl ? window.__tl.sig0 || {} : {};
    const changed = Object.keys(s0).filter(k => fin[k] !== s0[k]).map(k => k + " : " + s0[k] + " -> " + (fin[k] || "gone"));
    /* Väsentlig ändring: färg eller text ändrad, borttagen, eller flyttad/
       omdimensionerad mer än 2 px (subpixel-avrundning räknas inte). */
    const sig = (a, b) => { if (!b) return true; const A = a.split(/,(?![^(]*\))/), B = b.split(/,(?![^(]*\))/); if (A[0] !== B[0] || A[1] !== B[1]) return true; return A.slice(2).some((v, i) => Math.abs(+v - +B[i + 2]) > 2); };
    const changedSig = Object.keys(s0).filter(k => fin[k] !== s0[k] && sig(s0[k], fin[k])).length;
    const added = Object.keys(fin).filter(k => !(k in s0)).length;
    return { firstPaint, readyAt, headerAnimMs, deferredPaintedMs, clsAfter: Math.round((window.__tl ? window.__tl.clsAfter : 0) * 1000) / 1000, sigT: window.__tl && window.__tl.sigT, pendingPaintedMs, nativePaintedMs, sidebarPx, sidebarShadowPx, overflowX: ox,
      ctrlAtPaint: Object.keys(s0).length, ctrlChanged: changed.length, ctrlChangedSig: changedSig, ctrlAdded: added, ctrlChangedList: changed.slice(0, 6),
      readyMs: window.__HZ8_DIAGNOSTICS__ && window.__HZ8_DIAGNOSTICS__.readyMs, readyReason: window.__HZ8_DIAGNOSTICS__ && window.__HZ8_DIAGNOSTICS__.readyReason,
      bootMs: window.__HZ8_DIAGNOSTICS__ && window.__HZ8_DIAGNOSTICS__.bootMs,
      final: { cls: h.className.split(" ").filter(c => /^hz8(-boot|-settling)?$/.test(c)).join(" "), bodyVisible: cs.visibility !== "hidden" && +cs.opacity > 0,
        links: b.querySelectorAll("a[href]").length, text: b.innerText.length, scrollY: Math.round(scrollY), hz8Header: !!document.querySelector("[data-hz8-header]"),
        sidebarInert: (() => { const sb = document.querySelector("#sidebar"); if (!sb) return null; const s = getComputedStyle(sb); return s.visibility === "hidden" || sb.getBoundingClientRect().right <= 0; })() } };
  });
}

export async function newPage(ctx, o, frames) {
  const p = await ctx.newPage(); const errors = [];
  if (o.net || o.cpu) { const c = await ctx.newCDPSession(p); await c.send("Network.enable"); if (o.net) await c.send("Network.emulateNetworkConditions", FAST3G); if (o.cpu) await c.send("Emulation.setCPUThrottlingRate", { rate: o.cpu }); }
  p.on("pageerror", e => errors.push(String(e))); p.on("console", m => { if (m.type() === "error") errors.push(m.text()); });
  await p.addInitScript(TL);
  p.shots = [];
  if (frames) { const cdp = await ctx.newCDPSession(p);
    cdp.on("Page.screencastFrame", f => { p.shots.push({ ep: f.metadata.timestamp * 1000, data: f.data }); cdp.send("Page.screencastFrameAck", { sessionId: f.sessionId }).catch(() => {}); });
    await cdp.send("Page.startScreencast", { format: "jpeg", quality: 70, maxWidth: 720, maxHeight: 1400 }); p.stopFrames = () => cdp.send("Page.stopScreencast").catch(() => {}); }
  p.errors = errors; return p;
}
export const cleanErrors = errs => errs.filter(e => !/recaptcha|trustpilot|favicon|ERR_|net::|integrity|status of 4|status of 5|Failed to load resource/i.test(e));

export function saveFrames(name, p, log) {
  const dir = `${OUT}/frames/${name}`; fs.rmSync(dir, { recursive: true, force: true }); fs.mkdirSync(dir, { recursive: true });
  const t0 = log[0]?.ep || p.shots[0]?.ep || 0; const labels = {};
  p.shots.forEach(s => { const e = log.filter(x => x.ep <= s.ep).at(-1); const t = Math.max(0, Math.round(s.ep - t0)); const f = `${String(t).padStart(5, "0")}.jpg`;
    fs.writeFileSync(`${dir}/${f}`, Buffer.from(s.data, "base64"));
    labels[f] = !e || !e.painted ? (e && e.masked ? "MASK" : "BLANK") : !e.hz8 ? "NATIVE" : e.sbPx ? "SIDEBAR" : e.pend ? "PARTIAL" : e.ready ? "READY" : "MASK"; });
  fs.writeFileSync(`${dir}/labels.json`, JSON.stringify(labels));
}

const isMain = import.meta.url === `file://${process.argv[1]}`;
if (isMain) {
  const b = await chromium.launch(); const rows = [];
  for (const sc of scenarios) for (const r of routes) for (const w of widths) {
    const o = SC[sc]; const zoom = o.zoom || 1;
    const vw = Math.round(w / zoom), vh = Math.round(H[w] / zoom);
    const ctx = await ctxFor(b, vw, vh, { which, ...o });
    if (o.warm) { const p0 = await newPage(ctx, o, false); await p0.goto(url(ROUTES[r]), { waitUntil: "domcontentloaded", timeout: 90000 }); await p0.waitForTimeout(7000); await acceptCookies(p0); await p0.close(); }
    const sheet = process.env.SHEET === "1"; const p = await newPage(ctx, o, sheet);
    let navErr = null; try { await p.goto(url(ROUTES[r]), { waitUntil: "domcontentloaded", timeout: 90000 }); } catch (e) { navErr = String(e).slice(0, 120); }
    const m = await measure(p, { settleMs: sc === "css-hang" ? 9000 : o.net ? 14000 : 7000 });
    const name = `${which}-${sc}-${r}-${w}${tag ? "-" + tag : ""}`;
    if (sheet) { p.stopFrames(); const log = await p.evaluate(() => window.__tl.log); saveFrames(name, p, log); }
    const row = { which, sc, route: r, w, vw, ...m, navErr, errors: cleanErrors(p.errors).slice(0, 4), docRewritten: ctx.stats.docRewritten };
    rows.push(row); console.log(JSON.stringify({ ...row, ctrlChangedList: row.ctrlChangedList.slice(0, 2) }).slice(0, 700));
    await ctx.close();
  }
  fs.writeFileSync(`${OUT}/verify-${which}-${scenarios.join("_")}-${routes.length > 3 ? routes.length + "routes" : routes.join("_")}-${widths.join("_")}${tag ? "-" + tag : ""}.json`, JSON.stringify(rows, null, 1));
  await b.close();
}
