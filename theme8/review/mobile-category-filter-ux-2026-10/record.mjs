// TASK 01E -- kort inspelning i normal hastighet av mobildockan:
// raden i flödet -> dockan glider in -> Filter-arket -> stäng -> Sortera ->
// stäng -> mot sidans slut (dockan viker undan) -> tillbaka upp (raden).
// node record.mjs before|after <route>   (393 px)
import { chromium, ctxFor, url, ROUTES, DIR, acceptCookies } from "./lib.mjs"; import fs from "node:fs"; import path from "node:path"; import os from "node:os"; import { execFileSync } from "node:child_process";
const [which = "after", route = "alla-vapes"] = process.argv.slice(2);
const size = { width: 393, height: 852 }; const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "t01e-"));
const b = await chromium.launch(); const orig = b.newContext.bind(b);
b.newContext = o => orig({ ...o, recordVideo: { dir: tmp, size } }); const ctx = await ctxFor(b, 393, 852, { which }); b.newContext = orig;
const t0 = Date.now(); const p = await ctx.newPage();
await p.goto(url(ROUTES[route]), { waitUntil: "domcontentloaded", timeout: 60000 });
await p.waitForFunction(() => document.documentElement.classList.contains("hz8") && !document.documentElement.classList.contains("hz8-settling"), null, { timeout: 60000 }).catch(() => {});
await acceptCookies(p); await p.waitForTimeout(2500);
await p.evaluate(([l]) => { window.__to = y => scrollTo({ top: y, behavior: "instant" }); const d = document.createElement("div"); d.style.cssText = "position:fixed;left:8px;top:96px;z-index:2147483647;pointer-events:none;font:600 12px/1.3 Arial;color:#fff;background:rgba(20,20,18,.78);padding:4px 7px;border-radius:6px"; d.textContent = l; document.documentElement.appendChild(d); window.__lbl = s => d.textContent = l + " · " + s; }, [`${which === "before" ? "FÖRE" : "EFTER"} 393px`]);
const tStart = (Date.now() - t0) / 1000;
const glide = (lbl, to, ms) => p.evaluate(([lbl, to, ms]) => new Promise(res => { window.__lbl(lbl); const from = scrollY, t0 = performance.now(); const step = () => { const k = Math.min(1, (performance.now() - t0) / ms); const e = k < .5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2; __to(from + (to - from) * e); k < 1 ? requestAnimationFrame(step) : res(); }; requestAnimationFrame(step); }), [lbl, to, ms]);
await glide("raden i flödet", 0, 300); await p.waitForTimeout(900);
await glide("scroll ned: dockan tar över", 1300, 1400); await p.waitForTimeout(900);
const dockBtn = which === "after" ? '.hz8-mdock [data-md="filter"]' : ".hz8-ptool__mob .hz8-ptool__filter";
await p.evaluate(() => window.__lbl("Filter")); await p.click(dockBtn).catch(() => {}); await p.waitForTimeout(1600);
await p.keyboard.press("Escape"); await p.waitForTimeout(900);
const sortBtn = which === "after" ? '.hz8-mdock [data-md="sort"]' : '.hz8-ptool__mob [data-pt="sort-sheet"], .hz8-ptool__mob .hz8-ptool__filter';
await p.evaluate(() => window.__lbl("Sortera")); await p.click(sortBtn).catch(() => {}); await p.waitForTimeout(1500);
await p.keyboard.press("Escape"); await p.waitForTimeout(900);
const end = await p.evaluate(() => { const a = document.querySelector(".designer-category"); return Math.round(a.getBoundingClientRect().bottom + scrollY - innerHeight + 300); });
await glide("mot sidans slut: dockan viker undan", end, 2200); await p.waitForTimeout(1100);
await glide("tillbaka upp: raden tar över", 0, 1800); await p.waitForTimeout(900);
const tEnd = (Date.now() - t0) / 1000; const v = await p.video().path(); await ctx.close(); await b.close();
const out = `${DIR}/proof/video-${which}-${route}-393.webm`;
const ff = fs.readdirSync(path.join(os.homedir(), "Library/Caches/ms-playwright")).filter(d => d.startsWith("ffmpeg")).map(d => path.join(os.homedir(), "Library/Caches/ms-playwright", d, "ffmpeg-mac"))[0];
execFileSync(ff, ["-y", "-loglevel", "error", "-ss", String(Math.max(0, tStart - .2)), "-t", String(tEnd - tStart + .4), "-i", v, "-c:v", "libvpx", "-b:v", "450k", "-an", out]);
console.log(out, (fs.statSync(out).size / 1024).toFixed(0) + " KB", (tEnd - tStart).toFixed(1) + " s");
