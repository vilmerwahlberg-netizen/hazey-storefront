// TASK 01D-R3: kopia ur mobile-plaster-reference-2026-10.
// TASK 01D -- beredskap: syns den gamla faden eller ett rakt snitt innan
// putskanten finns? Loggar per animationsram från första målade ram:
// finns .hz8-cat-hero__plaster, artens mask, ::before-innehåll.
// node ready.mjs before|after <route,..> <cold,warm,throttled> [w=393]
import { chromium, ctxFor, url, ROUTES, DIR, acceptCookies } from "./lib.mjs"; import fs from "node:fs";
const [which = "after", rs = "alla-vapes", ss = "cold", ws = "393"] = process.argv.slice(2);
const b = await chromium.launch(); const rows = [];
for (const route of rs.split(",")) for (const sc of ss.split(",")) {
  const w = +ws; const ctx = await ctxFor(b, w, 852, { which });
  if (sc === "warm") { const p0 = await ctx.newPage(); await p0.goto(url(ROUTES[route]), { waitUntil: "load", timeout: 90000 }).catch(() => {}); await p0.waitForTimeout(3000); await p0.close(); }
  const p = await ctx.newPage(); const errors = []; p.on("pageerror", e => errors.push(String(e)));
  if (sc === "throttled") { const c = await ctx.newCDPSession(p); await c.send("Network.enable"); await c.send("Network.emulateNetworkConditions", { offline: false, latency: 562, downloadThroughput: 1.6e6 / 8 * .9, uploadThroughput: 750e3 / 8 * .9 }); await c.send("Emulation.setCPUThrottlingRate", { rate: 4 }); }
  await p.addInitScript(() => { const log = []; window.__r = log; const t0 = performance.now(); const tick = () => { const h = document.documentElement, bd = document.body; if (bd) { const cs = getComputedStyle(bd); const painted = cs.visibility !== "hidden" && +cs.opacity > 0 && !h.classList.contains("hz8-boot") && !h.classList.contains("hz8-settling"); const art = document.querySelector(".hz8-cat-hero__art"), pl = document.querySelector(".hz8-cat-hero__plaster"); if (painted) log.push({ t: Math.round(performance.now() - t0), pilot: h.classList.contains("hz8-cat-pilot"), art: !!art, artMask: art ? getComputedStyle(art).maskImage.slice(0, 16) : null, plaster: !!pl, edge: pl ? getComputedStyle(pl, "::before").content !== "none" : false }); } if (performance.now() - t0 < 25000 && log.length < 400) requestAnimationFrame(tick); }; requestAnimationFrame(tick); });
  await p.goto(url(ROUTES[route]), { waitUntil: "domcontentloaded", timeout: 90000 });
  await p.waitForTimeout(sc === "throttled" ? 16000 : 8000);
  const log = await p.evaluate(() => window.__r);
  const first = log[0] || null;
  const fadeFrames = log.filter(l => l.artMask && l.artMask !== "none").length;
  const cutFrames = log.filter(l => l.pilot && l.art && !l.edge).length;
  const row = { which, route, sc, w, firstPainted: first, paintedFrames: log.length, retiredFadeFrames: fadeFrames, artWithoutEdgeFrames: cutFrames, errors };
  rows.push(row); console.log(JSON.stringify(row)); await ctx.close();
}
fs.writeFileSync(`${DIR}/runs/ready-${which}-${rs.replace(/,/g, "_")}-${ss.replace(/,/g, "_")}.json`, JSON.stringify(rows, null, 1)); await b.close();
