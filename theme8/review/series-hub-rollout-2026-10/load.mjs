// TASK 04C-R -- laddningsramar för seriehubbens mobilhero: varje målad
// ram (rAF) loggar om kroppen är synlig, om heron/fotot är målat och om
// textens kontrastlager syns innan fotot (vit/beige yta utan foto).
// node load.mjs <route,..> cold|throttled
import { chromium, ctxFor, url, ROUTES, DIR } from "./lib.mjs"; import fs from "node:fs";
const [rs = "core", ss = "cold,throttled"] = process.argv.slice(2);
const b = await chromium.launch(); const rows = [];
for (const route of rs.split(",")) for (const sc of ss.split(",")) {
  const ctx = await ctxFor(b, 393, 852, { which: "after" }); const p = await ctx.newPage(); const errors = [];
  p.on("pageerror", e => errors.push(String(e))); p.on("console", m => { if (m.type() === "error") errors.push(m.text()); });
  if (sc === "throttled") { const cdp = await ctx.newCDPSession(p); await cdp.send("Network.emulateNetworkConditions", { offline: false, latency: 562.5, downloadThroughput: 180000, uploadThroughput: 84375 }); }
  await p.addInitScript(() => { const log = []; window.__ld = log; const t0 = performance.now(); const tick = () => { const bd = document.body; if (bd) { const cs = getComputedStyle(bd); const painted = cs.visibility !== "hidden" && parseFloat(cs.opacity) > 0 && !document.documentElement.classList.contains("hz8-boot"); const img = document.querySelector(".hz8-sh-hero__art img"); const copy = document.querySelector(".hz8-sh-hero__copy"); log.push({ t: Math.round(performance.now() - t0), painted, hero: !!document.querySelector(".hz8-sh-hero"), imgReady: !!(img && img.complete && img.naturalWidth), scrim: !!(copy && getComputedStyle(copy, "::before").content !== "none") }); } if (performance.now() - t0 < 30000) requestAnimationFrame(tick); }; requestAnimationFrame(tick); });
  await p.goto(url(ROUTES[route]), { waitUntil: "domcontentloaded", timeout: 120000 });
  await p.waitForTimeout(sc === "throttled" ? 30000 : 12000);
  const log = await p.evaluate(() => window.__ld || []);
  const painted = log.filter(f => f.painted);
  const row = { route, sc, frames: log.length, firstPaint: painted[0] && painted[0].t, imgReadyAtFirstPaint: painted[0] && painted[0].imgReady,
    scrimWithoutPhotoFrames: painted.filter(f => f.hero && f.scrim && !f.imgReady).length, heroWithoutPhotoFrames: painted.filter(f => f.hero && !f.imgReady).length, errors };
  rows.push(row); console.log(JSON.stringify(row)); await ctx.close();
}
fs.writeFileSync(`${DIR}/runs/load-${rs.replace(/,/g, "_")}-${ss.replace(/,/g, "_")}.json`, JSON.stringify(rows, null, 1));
await b.close();
