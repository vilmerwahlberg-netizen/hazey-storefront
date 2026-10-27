// TASK 01D-R3: kopia ur mobile-plaster-reference-2026-10.
// TASK 01D-R -- laddningsordning foto vs putsasset (cold/warm/Fast 3G).
// Asseten är en CSS-bakgrund: syns fotot innan putsen finns blir herons
// nederkant ett rakt snitt en stund. Loggar resursernas responseEnd,
// första målade ram och en bildserie över herons nederkant var 250 ms.
// Tider i ms från navigeringens start (nätverkshändelser + Date.now i sidan).
// node loadorder.mjs <after|before> <route> <cold,warm,throttled>
import { chromium, ctxFor, url, ROUTES, DIR } from "./lib.mjs"; import fs from "node:fs";
const [which = "after", route = "alla-vapes", ss = "cold,warm,throttled"] = process.argv.slice(2);
const OUT = `${DIR}/runs/frames`; fs.mkdirSync(OUT, { recursive: true });
const b = await chromium.launch(); const rows = [];
for (const sc of ss.split(",")) {
  const ctx = await ctxFor(b, 393, 852, { which });
  if (sc === "warm") { const p0 = await ctx.newPage(); await p0.goto(url(ROUTES[route]), { waitUntil: "load", timeout: 90000 }).catch(() => {}); await p0.waitForTimeout(3000); await p0.close(); }
  const p = await ctx.newPage(); const errors = []; p.on("pageerror", e => errors.push(String(e)));
  if (sc === "throttled") { const c = await ctx.newCDPSession(p); await c.send("Network.enable"); await c.send("Network.emulateNetworkConditions", { offline: false, latency: 562, downloadThroughput: 1.6e6 / 8 * .9, uploadThroughput: 750e3 / 8 * .9 }); await c.send("Emulation.setCPUThrottlingRate", { rate: 4 }); }
  await p.addInitScript(() => { window.__paint = null; const t0 = performance.now(); const tick = () => { const h = document.documentElement, bd = document.body; if (bd && !window.__paint) { const cs = getComputedStyle(bd); if (cs.visibility !== "hidden" && +cs.opacity > 0 && h.classList.contains("hz8") && !h.classList.contains("hz8-settling") && !h.classList.contains("hz8-boot")) window.__paint = Date.now(); } if (!window.__paint) requestAnimationFrame(tick); }; requestAnimationFrame(tick); });
  const done = {}; p.on("requestfinished", r => { const u = r.url(); if (u.includes("sunset-v4-mobile")) done.photo ??= Date.now(); if (u.includes("plaster-edge-v3")) done.plaster ??= Date.now(); });
  const t0 = Date.now();
  await p.goto(url(ROUTES[route]), { waitUntil: "commit", timeout: 90000 });
  const frames = [];
  for (let i = 0; i < (sc === "throttled" ? 100 : 28); i++) {
    await p.waitForTimeout(250);
    const st = await p.evaluate(() => { const hero = document.querySelector(".hz8-cat-hero"); const r = hero && hero.getBoundingClientRect(); return { paint: window.__paint, heroBottom: r ? Math.round(r.bottom) : null, pilot: document.documentElement.classList.contains("hz8-cat-pilot") }; }).catch(() => null);
    if (!st) continue; st.paint = st.paint && st.paint - t0; st.photo = done.photo && done.photo - t0; st.plaster = done.plaster && done.plaster - t0; frames.push({ t: Date.now() - t0, ...st });
    if (st.heroBottom && st.paint && i % 2 === 0) await p.screenshot({ path: `${OUT}/${which}-${route}-${sc}-${String(i).padStart(2, "0")}.png`, clip: { x: 0, y: Math.max(0, st.heroBottom - 260), width: 393, height: 300 } }).catch(() => {});
    if (st.photo && st.plaster && st.paint && i > 10) break;
  }
  const last = frames.at(-1) || {};
  const row = { which, route, sc, firstPaint: last.paint, photoEnd: last.photo, plasterEnd: last.plaster, photoBeforePlasterMs: last.photo != null && last.plaster != null ? last.plaster - last.photo : null, frames: frames.length, errors };
  rows.push(row); console.log(JSON.stringify(row)); await ctx.close();
}
fs.writeFileSync(`${DIR}/runs/loadorder-${which}-${route}-${ss.replace(/,/g, "_")}.json`, JSON.stringify(rows, null, 1)); await b.close();
