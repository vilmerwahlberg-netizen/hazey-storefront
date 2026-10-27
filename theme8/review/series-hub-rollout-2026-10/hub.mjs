// TASK 04C-B -- seriehubbens anatomi per rutt/bredd: hero (H1, ingress,
// antal, guide), formatrad, hyllor (format, antal, dubbletter), nedre
// serierad, kundservice/footer, överflöd, konsolfel + helsida.
// node hub.mjs before|after <route,..> <width,..> [zoom] [mode]
//   mode: "" | "probe" (relationskartan för serien) | "fail" (en serie x
//   format-källa avbryts) | "slow" (alla kategori-fetchar +2,5 s)
import { chromium, ctxFor, open, ready, DIR, ROUTES } from "./lib.mjs"; import fs from "node:fs";
const [which = "after", rs = "thcab", ws = "393", zoom = "", mode = ""] = process.argv.slice(2);
const OUT = `${DIR}/runs/shots`; fs.mkdirSync(OUT, { recursive: true });
const b = await chromium.launch(); const rows = [];
for (const route of rs.split(",")) for (const w of ws.split(",").map(Number)) {
  const z = zoom ? 2 : 0, cw = z ? w / 2 : w;
  const ctx = await ctxFor(b, cw, z ? 450 : (cw < 768 ? 852 : 900), { which, zoom: z });
  let failed = null;
  if (mode === "fail" || mode === "slow") {
    await ctx.route(/hazeyse\.nyehandel\.se\/sv\/categories\/[^?#]+/, async r => {
      const req = r.request();
      if (req.resourceType() === "document") return r.fallback();
      const u = new URL(req.url());
      // fail: första serie x format-routen (inte hubben själv) avbryts.
      if (mode === "fail" && u.pathname !== new URL("https://x" + ROUTES[route]).pathname && !failed) failed = u.pathname;
      if (mode === "fail" && u.pathname === failed) return r.abort("failed");
      if (mode === "slow") await new Promise(res => setTimeout(res, 2500));
      return r.fallback();
    });
  }
  const p = await open(ctx, ROUTES[route]); await ready(p, 3000);
  // Hyllornas data (många källsidor) kan dröja: vänta på formatraden eller ett tillstånd.
  const t0 = Date.now(); await p.waitForSelector("#hz8-sh-nav .hz8-sh-chip, .hz8-sh-shelves .hz8-state", { timeout: mode === "slow" ? 90000 : 45000 }).catch(() => {}); const dataMs = Date.now() - t0; await p.waitForTimeout(1500);
  if (mode === "probe") {
    const pr = await p.evaluate(() => { const m = window.HZ8 && HZ8.catalog && HZ8.catalog.build(); const ctx = HZ8.catalog.contextFor(location.href); return { ctx: ctx && { type: ctx.type, series: ctx.series && ctx.series.name }, series: m && m.series.map(s => ({ name: s.name, hub: s.hub, routes: s.routes })) }; }).catch(e => ({ err: String(e) }));
    rows.push({ route, ...pr }); console.log(JSON.stringify(pr).slice(0, 3000)); await ctx.close(); continue;
  }
  await p.evaluate(async () => { for (let y = 0; y < document.documentElement.scrollHeight; y += 700) { scrollTo({ top: y, behavior: "instant" }); await new Promise(r => setTimeout(r, 140)); } scrollTo({ top: 0, behavior: "instant" }); });
  await p.waitForTimeout(1200);
  const g = await p.evaluate(() => {
    const R = s => { const e = typeof s === "string" ? document.querySelector(s) : s; if (!e || !e.getClientRects().length) return null; const r = e.getBoundingClientRect(); return { top: Math.round(r.top + scrollY), bottom: Math.round(r.bottom + scrollY), height: Math.round(r.height) }; };
    const txt = s => { const e = document.querySelector(s); return e ? e.textContent.replace(/\s+/g, " ").trim() : null; };
    const shelves = [...document.querySelectorAll(".hz8-sh-shelves > .hz8-sh-shelf")].map(s => {
      const cards = [...s.querySelectorAll(".product-card")];
      const paths = cards.map(c => { const a = c.querySelector("a[href*='/products/']"); return a ? new URL(a.href).pathname.replace(/\/\d+$/, "") : ""; });
      return { key: s.getAttribute("data-sh"), id: s.id, title: (s.querySelector(".hz8-prail__title") || {}).textContent, cards: cards.length, dupes: paths.length - new Set(paths).size, viewAll: (s.querySelector("a.hz8-prail__all, .hz8-prail__head a[href]") || {}).href || null, names: cards.slice(0, 3).map(c => (c.querySelector(".name") || {}).textContent) };
    });
    const allPaths = [...document.querySelectorAll(".hz8-sh-shelves > .hz8-sh-shelf .product-card")].map(c => { const a = c.querySelector("a[href*='/products/']"); return a ? new URL(a.href).pathname.replace(/\/\d+$/, "") : ""; });
    const art = document.querySelector(".hz8-sh-hero__art img");
    return {
      pilot: document.documentElement.classList.contains("hz8-sh-pilot"), h1s: document.querySelectorAll("h1").length, h1: txt(".hz8-sh-hero h1"), lead: txt(".hz8-sh-hero__lead"), count: txt(".hz8-sh-hero__count"),
      guide: txt(".hz8-sh-guide__title"), guideText: txt(".hz8-sh-guide__text"), cta: txt(".hz8-sh-cta"), seal: !!document.querySelector(".hz8-sh-decor__seal"), script: txt(".hz8-sh-decor__script"),
      heroImg: art && art.currentSrc.split("/").pop(), heroImgOk: !!(art && art.complete && art.naturalWidth), hero: R(".hz8-sh-hero"),
      chips: [...document.querySelectorAll("#hz8-sh-nav .hz8-sh-chip")].map(a => a.textContent.replace(/\s+/g, " ").trim() + (a.getAttribute("aria-current") ? "*" : "")),
      shelves, uniqueProducts: new Set(allPaths).size, crossDupes: allPaths.length - new Set(allPaths).size,
      more: [...document.querySelectorAll(".hz8-sh-more__t")].map(e => e.textContent), lower: [...document.querySelectorAll(".hz8-sh-after .hz8-rail__item")].map(a => a.textContent.replace(/\s+/g, " ").trim().slice(0, 30) + (a.getAttribute("aria-current") ? "*" : "")),
      state: txt(".hz8-sh-shelves .hz8-state"), footer: !!document.querySelector(".hz8-footer, footer.page-footer"), service: !!document.querySelector(".hz8-service, .hz8-cs, [class*='service']"),
      overflowX: document.documentElement.scrollWidth > innerWidth + 1, docH: document.documentElement.scrollHeight
    };
  });
  const tag = `${which}-${route}-${w}${z ? "-z200" : ""}${mode ? "-" + mode : ""}`;
  await p.screenshot({ path: `${OUT}/${tag}-top.png` });
  if (!mode) await p.screenshot({ path: `${OUT}/${tag}-full.jpg`, fullPage: true, type: "jpeg", quality: 62, scale: "css" });
  const row = { which, route, w, zoom: !!z, mode, failed, dataMs, ...g, errors: p.errors }; rows.push(row); console.log(JSON.stringify(row).slice(0, 1500));
  await ctx.close();
}
fs.writeFileSync(`${DIR}/runs/hub-${which}-${rs.replace(/,/g, "_")}-${ws.replace(/,/g, "_")}${zoom ? "-z200" : ""}${mode ? "-" + mode : ""}.json`, JSON.stringify(rows, null, 1));
await b.close();
