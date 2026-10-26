// TASK 01C diagnos: childList-mutationer under 1 s efter att sidan borde vara stilla (WAIT ms). En evig HZ8.watch-loop syns som samma rad var 140:e ms.
// node mutation-loop.mjs <route> <width> [before|after]   (WAIT=4000)
import { chromium, ctxFor, ROUTES, url } from "./lib.mjs";
const r = process.argv[2] || "ms-carts", w = +(process.argv[3] || 1280);
const b = await chromium.launch(); const ctx = await ctxFor(b, w, 800, { which: process.argv[4] || "after" }); const p = await ctx.newPage();
await p.goto(url(ROUTES[r]), { waitUntil: "domcontentloaded" }); await p.waitForTimeout(+(process.env.WAIT || 4000));
const out = await p.evaluate(() => new Promise(res => { const rec = []; const id = n => n.nodeType === 1 ? n.tagName + (n.id ? "#" + n.id : "") + "." + [...n.classList].slice(0, 3).join(".") : "#" + n.nodeName + ":" + (n.textContent || "").slice(0, 20);
  const mo = new MutationObserver(ms => { for (const m of ms) rec.push(id(m.target) + " <" + (m.target.parentElement ? id(m.target.parentElement) : "") + "> +" + [...m.addedNodes].map(id).join(",") + " -" + [...m.removedNodes].map(id).join(",")); });
  mo.observe(document, { childList: true, subtree: true }); setTimeout(() => { mo.disconnect(); res(rec); }, 1000); }));
const c = {}; out.forEach(x => c[x] = (c[x] || 0) + 1); console.log(Object.entries(c).sort((a, b) => b[1] - a[1]).slice(0, 60).map(([k, v]) => v + "  " + k).join("\n"));
await b.close();
