// TASK 17B — upprepad CLS-mätning på startsidan (före/efter), med de element som flyttar sig mest.
import { chromium, ctxFor, open, ready } from "./lib/harness.mjs";
const which = process.argv[2], w = +process.argv[3];
const b = await chromium.launch();
for (let n = 0; n < 3; n++) {
  const ctx = await ctxFor(b, w, w < 768 ? 700 : 900, { which });
  const p = await open(ctx, "/", { before: pg => pg.addInitScript(() => { window.__cls = 0; window.__src = {}; new PerformanceObserver(l => { for (const e of l.getEntries()) { if (e.hadRecentInput) continue; window.__cls += e.value; (e.sources || []).forEach(s => { const k = s.node ? (s.node.className || s.node.nodeName).toString().slice(0, 40) : "?"; window.__src[k] = (window.__src[k] || 0) + e.value; }); } }).observe({ type: "layout-shift", buffered: true }); }) });
  await ready(p, 6000); for (let i = 0; i < 8; i++) { await p.mouse.wheel(0, 1100); await p.waitForTimeout(350); } await p.waitForTimeout(1500);
  const r = await p.evaluate(() => ({ cls: Math.round(window.__cls * 1000) / 1000, top: Object.entries(window.__src).sort((a, b) => b[1] - a[1]).slice(0, 3).map(([k, v]) => k + ":" + v.toFixed(3)) }));
  console.log(which, w, JSON.stringify(r)); await ctx.close();
}
await b.close();
