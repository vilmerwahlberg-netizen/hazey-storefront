// TASK 04C-B -- interaktion på seriehubben: djuplänk (#<slug>-<format>),
// formatchip-klick (hash + fokus), bakåt/framåt, tangentbord (CTA ->
// formatraden), mobil dock (aldrig samtidigt med raden), "Visa alla"-länkar.
// node interact.mjs before|after <route> <width>
import { chromium, ctxFor, open, ready, DIR, ROUTES, url } from "./lib.mjs"; import fs from "node:fs";
const [which = "after", route = "thcab", w0 = "1440"] = process.argv.slice(2); const w = +w0;
const b = await chromium.launch(); const out = { which, route, w };
const ctx = await ctxFor(b, w, w < 768 ? 852 : 900, { which });
let p = await open(ctx, ROUTES[route]); await ready(p, 3000);
// Hyllornas data kan dröja (många källsidor): vänta på formatraden.
const t0 = Date.now(); await p.waitForSelector("#hz8-sh-nav .hz8-sh-chip", { timeout: 45000 }).catch(() => {}); out.dataMs = Date.now() - t0;
const chips = await p.$$eval("#hz8-sh-nav .hz8-sh-chip", as => as.map(a => ({ href: a.getAttribute("href"), key: a.getAttribute("data-sh") })));
out.chips = chips;
const fmt = chips.filter(c => c.key !== "all");
const pos = async () => p.evaluate(() => { const h = location.hash.slice(1); const t = h && document.getElementById(h); const hd = document.querySelector("#store-header .main"); return { hash: location.hash, top: t ? Math.round(t.getBoundingClientRect().top) : null, headerBottom: hd ? Math.round(hd.getBoundingClientRect().bottom) : null, focus: document.activeElement && (document.activeElement.className || document.activeElement.tagName), current: (document.querySelector("#hz8-sh-nav [aria-current]") || {}).getAttribute ? document.querySelector("#hz8-sh-nav [aria-current]").getAttribute("data-sh") : null }; });
// Klick på sista formatchippet.
if (fmt.length) {
  const last = fmt.at(-1);
  await p.click(`#hz8-sh-nav .hz8-sh-chip[data-sh="${last.key}"]`); await p.waitForTimeout(1600);
  out.click = await pos();
  await p.goBack(); await p.waitForTimeout(1200); out.back = await pos();
  await p.goForward(); await p.waitForTimeout(1200); out.forward = await pos();
}
// Tangentbord: fokus på hero-CTA, Enter -> formatraden.
await p.evaluate(() => scrollTo({ top: 0, behavior: "instant" })); await p.waitForTimeout(300);
await p.focus(".hz8-sh-cta"); await p.keyboard.press("Enter"); await p.waitForTimeout(1400);
out.keyboard = await p.evaluate(() => ({ hash: location.hash, focus: document.activeElement && document.activeElement.className, navTop: Math.round(document.getElementById("hz8-sh-nav").getBoundingClientRect().top) }));
out.viewAll = await p.$$eval(".hz8-sh-shelves > .hz8-sh-shelf", ss => ss.map(s => { const a = s.querySelector(".hz8-prail__all, .hz8-prail__head a[href]"); return a ? new URL(a.href).pathname + new URL(a.href).search.replace(/[?&]preview=[^&]+/, "") : null; }));
// Mobil dock: skanna nedåt, raden och dockan aldrig samtidigt.
if (w < 768) {
  out.dock = await p.evaluate(async () => { let both = 0, on = 0, n = 0; const nav = document.getElementById("hz8-sh-nav"), dock = document.querySelector(".hz8-sh-dock"); for (let y = 0; y < document.documentElement.scrollHeight; y += 160) { scrollTo({ top: y, behavior: "instant" }); await new Promise(r => setTimeout(r, 90)); const r = nav.getBoundingClientRect(); const vis = r.bottom > 0 && r.top < innerHeight; const d = dock.classList.contains("is-on"); n++; if (d) on++; if (d && vis) both++; } return { samples: n, dockOn: on, both }; });
}
out.errors = p.errors; await p.close();
// Djuplänk: ny sida direkt på sista formatet.
if (fmt.length) {
  p = await open(ctx, ROUTES[route] + fmt.at(-1).href); await ready(p, 3000); await p.waitForSelector("#hz8-sh-nav .hz8-sh-chip", { timeout: 45000 }).catch(() => {}); await p.waitForTimeout(3500);
  out.deep = await pos(); out.deepErrors = p.errors;
}
console.log(JSON.stringify(out));
fs.writeFileSync(`${DIR}/runs/interact-${which}-${route}-${w}.json`, JSON.stringify(out, null, 1));
await b.close();
