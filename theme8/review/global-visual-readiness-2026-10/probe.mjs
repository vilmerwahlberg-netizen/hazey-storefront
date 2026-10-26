// Diagnos: vad händer mellan "bundle booted" (hz8-boot borttagen) och
// visuellt klar sida? Loggar per animationsram: maskens tillstånd,
// #sidebar-geometri, headerns slots, kortdekoration och html-klasser,
// plus en MutationObserver-logg över html-klasser och hz8-tillägg.
// node probe.mjs <before|after> <route[,..]> <width[,..]> [throttled]
import { chromium, ctxFor, open, ROUTES, DIR } from "./lib.mjs"; import fs from "node:fs";
const which = process.argv[2] || "before";
const routes = (process.argv[3] || "ms-carts").split(",");
const widths = (process.argv[4] || "1280").split(",").map(Number);
const throttled = process.argv[5] === "throttled";
const H = { 393: 852, 1280: 800, 1440: 900, 1920: 1080 };
const OUT = `${DIR}/runs/probe`; fs.mkdirSync(OUT, { recursive: true });
const FAST3G = { offline: false, latency: 150, downloadThroughput: 1.6 * 1024 * 1024 / 8, uploadThroughput: 750 * 1024 / 8 };

const PROBE = () => {
  const t0 = performance.now(); const log = []; const ev = []; window.__probe = { log, ev };
  const vis = el => { if (!el) return null; const r = el.getBoundingClientRect(); const cs = getComputedStyle(el);
    const vw = innerWidth, vh = innerHeight; const ix = Math.max(0, Math.min(r.right, vw) - Math.max(r.left, 0)), iy = Math.max(0, Math.min(r.bottom, vh) - Math.max(r.top, 0));
    return { x: Math.round(r.left), w: Math.round(r.width), vis: cs.visibility, disp: cs.display, op: cs.opacity, tf: cs.transform === "none" ? "" : cs.transform.slice(0, 40), tr: cs.transitionDuration, inViewPx: Math.round(ix * iy) }; };
  const tick = () => {
    const h = document.documentElement, b = document.body;
    if (b) {
      const cs = getComputedStyle(b);
      const hdr = document.querySelector("#store-header");
      const cards = [...document.querySelectorAll(".product-card")].filter(c => c.getBoundingClientRect().top < innerHeight);
      log.push({ t: Math.round(performance.now() - t0), boot: h.classList.contains("hz8-boot"), hz8: h.classList.contains("hz8"),
        painted: cs.visibility !== "hidden" && parseFloat(cs.opacity) > 0, htmlCls: h.className,
        sidebar: vis(document.querySelector("#sidebar")),
        hdr: hdr ? { nav: !!hdr.querySelector(".hz8-header-nav"), logoOk: !!(hdr.querySelector(".brand.header-logo img")?.complete), logoSrc: (hdr.querySelector(".brand.header-logo img")?.currentSrc || "").split("/").pop(), h: Math.round(hdr.getBoundingClientRect().height), kids: hdr.querySelectorAll("*").length, text: (hdr.innerText || "").length } : null,
        cards: cards.length, cardsDecor: cards.filter(c => c.querySelector("[class*='hz8']")).length, cardsImg: cards.filter(c => { const i = c.querySelector("img"); return i && i.complete && i.naturalWidth > 0; }).length,
        hz8nodes: document.querySelectorAll("[class*='hz8-']").length });
    }
    if (performance.now() - t0 < 12000) requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
  new MutationObserver(ms => { for (const m of ms) { if (m.target === document.documentElement && m.attributeName === "class") ev.push({ t: Math.round(performance.now() - t0), html: document.documentElement.className }); } })
    .observe(document.documentElement, { attributes: true });
  document.addEventListener("DOMContentLoaded", () => ev.push({ t: Math.round(performance.now() - t0), dcl: 1 }));
  addEventListener("load", () => ev.push({ t: Math.round(performance.now() - t0), load: 1 }));
};

const b = await chromium.launch();
for (const r of routes) for (const w of widths) {
  const ctx = await ctxFor(b, w, H[w], { which, ...(throttled ? { cssDelay: 1800, jsDelay: 1400 } : {}) });
  const before = throttled ? async pg => { const c = await ctx.newCDPSession(pg); await c.send("Network.enable"); await c.send("Network.emulateNetworkConditions", FAST3G); await c.send("Emulation.setCPUThrottlingRate", { rate: 4 }); } : null;
  const p = await ctx.newPage(); if (before) await before(p); await p.addInitScript(PROBE);
  const errors = []; p.on("pageerror", e => errors.push(String(e)));
  const shots = []; const cdp = await ctx.newCDPSession(p);
  cdp.on("Page.screencastFrame", f => { shots.push({ ep: f.metadata.timestamp * 1000, data: f.data }); cdp.send("Page.screencastFrameAck", { sessionId: f.sessionId }).catch(() => {}); });
  await cdp.send("Page.startScreencast", { format: "jpeg", quality: 60, maxWidth: +(process.env.MAXW || 640), maxHeight: 1200 });
  const { url } = await import("./lib.mjs");
  await p.goto(url(ROUTES[r]), { waitUntil: "domcontentloaded", timeout: 90000 });
  await p.waitForTimeout(throttled ? 14000 : 10000);
  await cdp.send("Page.stopScreencast").catch(() => {});
  const pr = await p.evaluate(() => ({ ...window.__probe, origin: performance.timeOrigin }));
  // Kompakt: logga bara rader där något ändras.
  const keyOf = e => JSON.stringify({ ...e, t: 0 });
  const changes = pr.log.filter((e, i) => i === 0 || keyOf(e) !== keyOf(pr.log[i - 1]));
  // Visuell stabilitet: sista ram som skiljer sig från slutramen (byte-jämförelse av jpeg är för grov -- använd längd+hash).
  const name = `${which}-${r}-${w}${throttled ? "-thr" : ""}`;
  fs.rmSync(`${OUT}/${name}`, { recursive: true, force: true }); fs.mkdirSync(`${OUT}/${name}`, { recursive: true });
  shots.forEach((s, i) => { s.t = Math.round(s.ep - pr.origin); });
  const sel = shots.filter((s, i) => i === 0 || i === shots.length - 1 || s.t - (shots.filter((x, j) => j < i).at(-1)?.t ?? 0) >= 0);
  sel.forEach(s => fs.writeFileSync(`${OUT}/${name}/${String(s.t).padStart(5, "0")}.jpg`, Buffer.from(s.data, "base64")));
  fs.writeFileSync(`${OUT}/${name}.json`, JSON.stringify({ ev: pr.ev, changes, errors }, null, 1));
  console.log(name, "events", JSON.stringify(pr.ev), "changes", changes.length, "frames", shots.length);
  await ctx.close();
}
await b.close();
