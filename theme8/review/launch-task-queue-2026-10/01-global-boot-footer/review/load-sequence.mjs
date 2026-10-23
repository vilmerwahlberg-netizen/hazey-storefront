// Laddningssekvens: CDP-screencast + tidslinje per animationsram.
// node load-sequence.mjs <before|after> <scenario[,..]> <route[,..]> <width[,..]>
// Scenarier: cold, warm, throttled, css-fail, js-fail, js-throw, css-hang
import { chromium, ctxFor, open, acceptCookies, ROUTES, DIR, sleep } from "./lib.mjs"; import fs from "node:fs"; import { PNG } from "pngjs";
const which = process.argv[2] || "after";
const scenarios = (process.argv[3] || "cold").split(",");
const routes = (process.argv[4] || "home").split(",");
const widths = (process.argv[5] || "393,1440").split(",").map(Number);
const H = { 393: 852, 1440: 900, 1920: 1080 };
const OUT = `${DIR}/loading`; fs.mkdirSync(OUT, { recursive: true });
const SC = {
  cold: {}, warm: {}, throttled: { cssDelay: 1800, jsDelay: 1400, net: true },
  "css-fail": { cssFail: "abort" }, "js-fail": { jsFail: "abort" }, "js-throw": { jsFail: "syntax" }, "css-hang": { cssFail: "hang" }
};
// Fast 3G-liknande begränsning för allt som går över nätet (dokument,
// Nyehandels egna filer, Oliverforss-bundlen). Theme 8-filerna levereras
// lokalt och får i stället fasta fördröjningar ovan.
const FAST3G = { offline: false, latency: 150, downloadThroughput: 1.6 * 1024 * 1024 / 8, uploadThroughput: 750 * 1024 / 8 };
const b = await chromium.launch(); const rows = [];
// Varje ram märks med sidans tillstånd vid ramens tidpunkt (samma
// epok-klocka): NATIVE = body målas utan Theme 8, MASK = boot-yta,
// READY = Theme 8 klar. Urval: alla tillståndsövergångar + jämnt
// fördelade ramar, max 12.
// Pixelbaserad klassning (oberoende av kompositorns tidsfördröjning):
// en ram är BLANK om >= 99 % av pixlarna har samma färg som ett hörn.
function blank(data) {
  const png = PNG.sync.read(Buffer.from(data, "base64")); const d = png.data; const c = [d[0], d[1], d[2]];
  let same = 0, n = 0; for (let i = 0; i < d.length; i += 16) { n++; if (Math.abs(d[i] - c[0]) < 8 && Math.abs(d[i + 1] - c[1]) < 8 && Math.abs(d[i + 2] - c[2]) < 8) same++; }
  return { blank: same / n >= 0.99, color: `rgb(${c.join(",")})` };
}
function label(tl, f) {
  const e = tl.filter(x => x.ep <= f.ep).at(-1); const bk = blank(f.data); f.color = bk.color;
  if (bk.blank) return bk.color === "rgb(237,233,232)" ? "MASK" : "BLANK";
  if (e && e.hz8 && !e.boot) return "READY";
  return "NATIVE";
}
async function sheet(name, frames, tl, w) {
  const t0 = tl[0]?.ep || frames[0].ep; frames.forEach(f => { f.st = label(tl, f); f.rt = Math.round(f.ep - t0); });
  const keep = new Set([frames[0]]);
  frames.forEach((f, i) => { if (i && frames[i - 1].st !== f.st) { keep.add(frames[i - 1]); keep.add(f); } });
  const nat = frames.filter(f => f.st === "NATIVE"); if (nat.length) keep.add(nat[Math.floor(nat.length / 2)]);
  const rd = frames.find(f => f.st === "READY"); if (rd) { const later = frames.find(f => f.ep > rd.ep + 1500); if (later) keep.add(later); }
  const end = frames.at(-1); keep.add(end);
  for (let i = 1; keep.size < 12 && i < 6; i++) keep.add(frames[Math.floor(frames.length * i / 6)]);
  const pick = [...keep].sort((a, b) => a.ep - b.ep).slice(0, 14);
  const col = { READY: "#4d7042", NATIVE: "#c0392b", MASK: "#8a7a5a", BLANK: "#555" };
  const html = `<html><body style="margin:0;background:#222;font:13px Arial;color:#fff;display:flex;flex-wrap:wrap;gap:8px;padding:8px">${pick.map(f => `<figure style="margin:0;width:${w < 768 ? 180 : 340}px"><img src="data:image/png;base64,${f.data}" style="width:100%;display:block;outline:1px solid #555"><figcaption style="padding:3px 0"><b style="background:${col[f.st]};padding:1px 5px">${f.st}</b> ${f.rt} ms ${f.st === "BLANK" ? f.color : ""}</figcaption></figure>`).join("")}</body></html>`;
  const p = await b.newPage({ viewport: { width: w < 768 ? 1180 : 1780, height: 400 } });
  await p.setContent(html); await p.waitForTimeout(300);
  await p.screenshot({ path: `${OUT}/${name}.png`, fullPage: true }); await p.close();
  const counts = {}; frames.forEach((f, i) => { const d = Math.round((frames[i + 1]?.ep ?? f.ep) - f.ep); counts[f.st] = (counts[f.st] || 0) + 1; counts[f.st + "_ms"] = (counts[f.st + "_ms"] || 0) + d; }); return counts;
}
for (const sc of scenarios) for (const r of routes) for (const w of widths) {
  const o = SC[sc]; const ctx = await ctxFor(b, w, H[w], { which, ...o });
  if (sc === "warm") { const p0 = await open(ctx, ROUTES[r]); await p0.waitForTimeout(9000); await acceptCookies(p0); await p0.close(); }
  const before = o.net ? async pg => { const c = await ctx.newCDPSession(pg); await c.send("Network.enable"); await c.send("Network.emulateNetworkConditions", FAST3G); } : null;
  const p = await open(ctx, ROUTES[r], { timeline: true, frames: true, before });
  await p.waitForTimeout(sc === "css-hang" ? 9000 : o.net ? 9000 : 6500);
  p.stopFrames();
  const tl = await p.evaluate(() => window.__t01 || []);
  const st = await p.evaluate(() => { const h = document.documentElement; const b = document.body; const cs = getComputedStyle(b); return { cls: h.className, bodyVisible: cs.visibility !== "hidden" && parseFloat(cs.opacity) > 0, hz8: h.classList.contains("hz8"), boot: h.classList.contains("hz8-boot"), links: b.querySelectorAll("a[href]").length, nativeHeader: !!document.querySelector("#store-header"), text: b.innerText.length, hz8Header: !!document.querySelector(".hz8-header, [class^='hz8-hdr'], .hz8-hd") }; });
  let oldMs = 0, firstOld = null, readyAt = null, maskMs = 0;
  for (let i = 0; i < tl.length; i++) { const e = tl[i], d = (tl[i + 1]?.t ?? e.t) - e.t;
    if (e.painted && !e.hz8) { oldMs += d; if (firstOld == null) firstOld = e.t; }
    if (e.boot) maskMs += d;
    if (readyAt == null && e.hz8 && !e.boot) readyAt = e.t; }
  const frames = p.shots; frames.w = w;
  // Ramtider från screencast är i Node-ms sedan start; tidslinjen i sidans ms. Används separat.
  const name = `${which}-${sc}-${r}-${w}`;
  const frameStates = frames.length ? await sheet(name, frames, tl, w) : {};
  // Sista läget: skärmdump av slutresultatet.
  await acceptCookies(p); await p.waitForTimeout(500);
  await p.screenshot({ path: `${OUT}/${name}-final.png` });
  const row = { which, sc, route: r, w, frames: frames.length, frameStates, readyAt, oldVisibleMs: oldMs, firstOldAt: firstOld, maskMs, final: st, errors: p.errors.filter(e => !/recaptcha|trustpilot|favicon|ERR_|net::|integrity|status of 4/i.test(e)).slice(0, 4), docRewritten: ctx.stats.docRewritten };
  rows.push(row); console.log(JSON.stringify(row));
  await ctx.close();
}
fs.writeFileSync(`${OUT}/${which}-${scenarios.join("_")}-${routes.join("_")}-${widths.join("_")}.json`, JSON.stringify(rows, null, 1));
await b.close();
