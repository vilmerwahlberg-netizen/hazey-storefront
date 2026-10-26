// Vad håller beredskapen? Loggar var 50:e ms vilka synliga element som är "pending".
import { chromium, ctxFor, ROUTES, url } from "./lib.mjs";
const [which = "after", r = "ms-carts", w = "1280"] = process.argv.slice(2);
const H = { 393: 852, 1280: 800, 1440: 900, 1920: 1080 };
const b = await chromium.launch(); const ctx = await ctxFor(b, +w, H[w], { which }); const p = await ctx.newPage();
await p.addInitScript(() => { const t0 = performance.now(); window.__why = []; const PENDING = "[aria-busy='true'], .is-loading, .is-pending, .hz8-series-pending";
  const iv = el => { const r = el.getBoundingClientRect(); return r.width > 0 && r.height > 0 && r.top < innerHeight && r.bottom > 0 && r.left < innerWidth && r.right > 0; };
  const id = el => el.tagName + "." + [...el.classList].slice(0, 3).join(".") + (el.src ? " " + el.src.split("/").pop().slice(0, 50) : "");
  const tick = () => { if (!document.documentElement.classList.contains("hz8-settling")) { if (window.__why.length) window.__why.push({ t: Math.round(performance.now() - t0), done: 1 }); if (performance.now() - t0 > 20000) return; setTimeout(tick, 50); return; }
    const m = [...document.querySelectorAll(PENDING)].filter(e => !e.closest("#sidebar, #cartAside, [hidden]") && iv(e)).map(id);
    const im = [...document.querySelectorAll("#store-header img, #store-main img")].filter(e => !e.complete && iv(e)).map(id);
    window.__why.push({ t: Math.round(performance.now() - t0), watch: !!(window.HZ8 && HZ8.watchBusy && HZ8.watchBusy()), m, im }); setTimeout(tick, 50); };
  setTimeout(tick, 50); });
await p.goto(url(ROUTES[r]), { waitUntil: "domcontentloaded" }); await p.waitForTimeout(7000);
const why = await p.evaluate(() => window.__why); let prev = "";
for (const x of why) { const k = JSON.stringify({ ...x, t: 0 }); if (k !== prev) console.log(x.t, k.slice(0, 400)); prev = k; }
console.log("readyMs", await p.evaluate(() => window.__HZ8_DIAGNOSTICS__ && __HZ8_DIAGNOSTICS__.readyMs));
await b.close();
