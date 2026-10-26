// Ögonblicksbild av ovanför-vecket-markup direkt vid boot och efter 4 s.
import { chromium, ctxFor, ROUTES, url } from "./lib.mjs";
const [which = "before", r = "ms-carts", w = "1280"] = process.argv.slice(2);
const b = await chromium.launch(); const ctx = await ctxFor(b, +w, 800, { which }); const p = await ctx.newPage();
await p.goto(url(ROUTES[r]), { waitUntil: "domcontentloaded" });
await p.waitForFunction(() => document.documentElement.classList.contains("hz8"), null, { timeout: 60000 });
const dump = () => p.evaluate(() => { const vh = innerHeight; const out = [];
  document.querySelectorAll("#store-main *").forEach(el => { const r = el.getBoundingClientRect(); if (r.top < vh && r.bottom > 0 && r.width > 30 && el.children.length === 0 && el.tagName !== "svg" && el.closest("svg") == null) out.push(el.tagName + "." + [...el.classList].join(".") + (el.tagName === "IMG" ? "[" + (el.complete && el.naturalWidth ? "ok" : "pending") + "]" : "") + " " + (el.textContent || "").trim().slice(0, 30)); });
  return { cls: document.documentElement.className, busy: [...document.querySelectorAll("[aria-busy=true],.is-loading,.is-pending,.hz8-series-pending")].map(e => e.className.slice(0, 80)), leaves: out.slice(0, 120) }; });
const a = await dump(); await p.waitForTimeout(4000); const z = await dump();
console.log(JSON.stringify(a, null, 0).slice(0, 6000)); console.log("-----"); console.log(JSON.stringify(z, null, 0).slice(0, 6000));
await b.close();
