// TASK 01C diagnos: #product-variants / .buy-form per bildruta på en varm PDP-laddning (mask -> ready).
import { chromium, ctxFor, ROUTES, url } from "./lib.mjs";
const b = await chromium.launch(); const ctx = await ctxFor(b, 393, 852, { which: "after" });
const p0 = await ctx.newPage(); await p0.goto(url(ROUTES.pdp), { waitUntil: "domcontentloaded" }); await p0.waitForTimeout(7000); await p0.close();
const p = await ctx.newPage();
await p.addInitScript(() => { const t0 = performance.now(); window.__pv = []; let last = "";
  const tick = () => { const h = document.documentElement; const v = document.getElementById("product-variants"); const bf = document.querySelector(".buy-form");
    const s = [h.classList.contains("hz8-settling") ? "MASK" : h.classList.contains("hz8") ? "READY" : "-", v ? "pv h" + Math.round(v.getBoundingClientRect().height) + " busy=" + v.getAttribute("aria-busy") + " sel" + v.querySelectorAll("select").length + " opt" + v.querySelectorAll("option").length + " html" + v.innerHTML.length : "no-pv", bf ? "bf@" + Math.round(bf.getBoundingClientRect().top) : "no-bf", "busyAll" + document.querySelectorAll("[aria-busy=true]").length, "vue" + !!(document.getElementById("store-instance") || {}).__vue__].join(" ");
    if (s !== last) { window.__pv.push(Math.round(performance.now() - t0) + " " + s); last = s; } if (performance.now() - t0 < 5000) requestAnimationFrame(tick); }; requestAnimationFrame(tick); });
await p.goto(url(ROUTES.pdp), { waitUntil: "domcontentloaded" }); await p.waitForTimeout(5000);
console.log((await p.evaluate(() => window.__pv)).join("\n")); await b.close();
