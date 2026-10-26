// TASK 01F -- korta videor i normal hastighet av headerns rörelse.
// node record.mjs before|after <route> <width> [reduce]
// Sekvens: vila i toppen, lugn scroll ned (dölj), uppåt (visa), snabb
// växling, snabb scroll, sök öppen + scroll (låst), toppzon. En liten
// etikett nere till vänster visar build och steg. Boot-delen klipps bort
// med Playwrights egen ffmpeg (VP8/webm).
import { chromium, ctxFor, url, ROUTES, DIR, acceptCookies } from "./lib.mjs"; import fs from "node:fs"; import path from "node:path"; import os from "node:os"; import { execFileSync } from "node:child_process";
const [which = "after", route = "home", ws = "393", mode = ""] = process.argv.slice(2);
const w = +ws, mobile = w < 768, reduce = mode === "reduce";
const size = mobile ? { width: 393, height: 852 } : { width: 960, height: 600 };
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "t01f-"));
const b = await chromium.launch();
// ctxFor saknar recordVideo -- samma routing via en tillfällig wrapper.
const ctx2 = await ctxForVideo();
async function ctxForVideo() {
  const orig = b.newContext.bind(b);
  b.newContext = o => orig({ ...o, recordVideo: { dir: tmp, size } });
  const c = await ctxFor(b, w, mobile ? 852 : 900, { which }); b.newContext = orig; return c;
}
const t0 = Date.now(); const p = await ctx2.newPage();
if (reduce) await p.emulateMedia({ reducedMotion: "reduce" });
await p.goto(url(ROUTES[route]), { waitUntil: "domcontentloaded", timeout: 60000 });
await p.waitForFunction(() => document.documentElement.classList.contains("hz8") && !document.documentElement.classList.contains("hz8-settling") && !document.documentElement.classList.contains("hz8-boot"), null, { timeout: 60000 }).catch(() => {});
await acceptCookies(p); await p.waitForTimeout(2500);
await p.evaluate(([label]) => {
  window.__to = y => window.scrollTo({ top: y, left: 0, behavior: "instant" });
  const d = document.createElement("div"); d.id = "__t01f_lbl";
  d.style.cssText = "position:fixed;left:8px;bottom:8px;z-index:2147483647;pointer-events:none;font:600 12px/1.3 Arial,sans-serif;color:#fff;background:rgba(20,20,18,.78);padding:4px 7px;border-radius:6px";
  d.textContent = label; document.documentElement.appendChild(d);
  window.__lbl = s => { d.textContent = label + " · " + s; };
}, [`${which === "before" ? "FÖRE" : "EFTER"} ${w}px${reduce ? " · reducerad rörelse" : ""}`]);
const tStart = (Date.now() - t0) / 1000;
const run = (lbl, fn, ms) => p.evaluate(([lbl, fn, ms]) => new Promise(res => { window.__lbl(lbl); const f = new Function("t", "s", fn); const s = { y: scrollY }; const t0 = performance.now(); const step = () => { const t = performance.now() - t0; f(t, s); t < ms ? requestAnimationFrame(step) : res(); }; requestAnimationFrame(step); }), [lbl, fn, ms]);
await run("vila i toppen", "", 900);
await run("lugn scroll ned", "if (t < 1300) __to(s.y += 5);", 1800);
await run("scroll upp", "if (t < 500) __to(s.y -= 5);", 1300);
await run("ned och snabbt upp igen", "if (t < 420) __to(s.y += 7); else if (t < 760) __to(s.y -= 7);", 1500);
await run("snabb scroll", "if (t < 500) __to(s.y += 45);", 1300);
await run("upp", "if (t < 400) __to(s.y -= 6);", 1000);
// Sök öppen: headern ska ligga kvar vid scroll.
await p.evaluate(() => window.__lbl("sök öppen + scroll ned (låst)"));
if (mobile) await p.click("#store-header #mobile-search-trigger").catch(() => {}); else await p.click("#store-header #search-container input").catch(() => {});
await p.waitForTimeout(700);
for (let i = 0; i < 8; i++) { await p.mouse.wheel(0, 60); await p.waitForTimeout(40); }
await p.waitForTimeout(700);
await p.keyboard.press("Escape"); await p.evaluate(() => document.activeElement && document.activeElement.blur && document.activeElement.blur());
await p.mouse.move(5, size.height - 80); await p.waitForTimeout(500);
await run("toppzon (0-170 px), förblir synlig", "if (t < 10) { s.y = 0; __to(0); } else if (s.y < 170) __to(s.y += 2);", 1900);
const tEnd = (Date.now() - t0) / 1000;
const vpath = await p.video().path(); await ctx2.close(); await b.close();
const out = `${DIR}/proof/video-${which}-${route}-${w}${reduce ? "-reduce" : ""}.webm`;
const ff = fs.readdirSync(path.join(os.homedir(), "Library/Caches/ms-playwright")).filter(d => d.startsWith("ffmpeg")).map(d => path.join(os.homedir(), "Library/Caches/ms-playwright", d, "ffmpeg-mac"))[0];
execFileSync(ff, ["-y", "-loglevel", "error", "-ss", String(Math.max(0, tStart - 0.2)), "-t", String(tEnd - tStart + 0.4), "-i", vpath, "-c:v", "libvpx", "-b:v", mobile ? "450k" : "600k", "-an", out]);
console.log(out, (fs.statSync(out).size / 1024).toFixed(0) + " KB", (tEnd - tStart).toFixed(1) + " s");
