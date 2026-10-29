// TASK 04A -- före/efter per rutt och bredd: helsida (jpeg), utsnitt från
// nedre upptäcktsmodulen genom footern, mått (modul, kort, overlap mot
// grannar, synlig scrollbar, overflow, H1).
// node shots.mjs before|after <route,..> <width,..> [zoom]
import { chromium, ctxFor, open, ready, DIR, ROUTES } from "./lib.mjs"; import fs from "node:fs";
const [which = "after", rs = "thcab-vapes", ws = "393,1440,1920", zoom = ""] = process.argv.slice(2);
const OUT = `${DIR}/runs/shots`; fs.mkdirSync(OUT, { recursive: true });
const b = await chromium.launch(); const rows = [];
const MOD = ".hz8-xd:not([hidden]), .hz8-sf-others:not([hidden]), .hz8-proutes, .hz8-sh-after";
for (const route of rs.split(",")) for (const w of ws.split(",").map(Number)) {
  const z = zoom ? 2 : 0, cw = z ? w / 2 : w;
  const ctx = await ctxFor(b, cw, z ? 450 : (cw < 768 ? 852 : 900), { which, zoom: z });
  const p = await open(ctx, ROUTES[route]); await ready(p, 3000);
  await p.evaluate(async () => { for (let y = 0; y < document.documentElement.scrollHeight; y += 600) { scrollTo({ top: y, behavior: "instant" }); await new Promise(r => setTimeout(r, 150)); } });
  await p.waitForTimeout(3500);
  const g = await p.evaluate(MOD => {
    const m = document.querySelector(MOD);
    const R = e => { const r = e.getBoundingClientRect(); return { x: Math.round(r.left), y: Math.round(r.top + scrollY), w: Math.round(r.width), h: Math.round(r.height) }; };
    const out = { h1s: document.querySelectorAll("h1").length, overflowX: document.documentElement.scrollWidth > innerWidth + 1, docH: document.documentElement.scrollHeight };
    if (!m) return out;
    out.module = { cls: m.className, axis: (m.querySelector("[data-hz8-xd]") || m).getAttribute("data-hz8-xd"), n: (m.querySelector("[data-hz8-xd-n]") || m).getAttribute("data-hz8-xd-n"), title: (m.querySelector("h2, .hz8-rail__heading") || {}).textContent, ...R(m) };
    const ul = m.querySelector(".hz8-sf-series");
    if (ul) out.rail = { scrollW: ul.scrollWidth, clientW: ul.clientWidth, scrollbarH: ul.offsetHeight - ul.clientHeight, more: (ul.closest(".hz8-xd") || {}).classList?.contains("is-more") };
    out.cards = [...m.querySelectorAll(".hz8-sf-serie, .hz8-rail__item, .hz8-proutes__card")].map(a => ({ t: a.textContent.replace(/\s+/g, " ").trim(), href: a.getAttribute("href"), art: a.getAttribute("data-hz8-series-art"), img: !!a.querySelector("img"), ...R(a) }));
    // Överlapp: modulens ruta mot föregående/nästa synliga syskon och footern.
    const box = m.getBoundingClientRect(); const hits = [];
    const sibs = [m.previousElementSibling, m.nextElementSibling, document.querySelector("footer, .hz8-footer"), document.querySelector(".hz8-service, .hz8-cat-guide")].filter(Boolean);
    sibs.forEach(s => { if (!s.getClientRects().length) return; const r = s.getBoundingClientRect(); if (s.contains(m) || m.contains(s)) return; const ov = Math.min(box.bottom, r.bottom) - Math.max(box.top, r.top); const ox = Math.min(box.right, r.right) - Math.max(box.left, r.left); if (ov > 1 && ox > 1) hits.push({ cls: s.className.toString().slice(0, 60), ov: Math.round(ov) }); });
    out.overlap = hits;
    return out;
  }, MOD);
  const tag = `${which}-${route}-${w}${z ? "-z200" : ""}`;
  await p.screenshot({ path: `${OUT}/${tag}-full.jpg`, fullPage: true, type: "jpeg", quality: 60, scale: "css" });
  // Utsnitt: vyn med modulen ~160 px under vyns topp (riktig fast header,
  // ingen fullPage-artefakt), sedan vyer nedåt genom footern.
  if (g.module) {
    const vh = await p.evaluate(() => innerHeight);
    let y = Math.max(0, g.module.y - 160), i = 0;
    while (i < 4) {
      await p.evaluate(t => scrollTo({ top: t, behavior: "instant" }), y); await p.waitForTimeout(700);
      await p.screenshot({ path: `${OUT}/${tag}-lower${i}.jpg`, type: "jpeg", quality: 70 });
      const end = await p.evaluate(() => scrollY + innerHeight >= document.documentElement.scrollHeight - 2);
      if (end) break; y += vh - 80; i++;
    }
  }
  const row = { which, route, w, zoom: !!z, ...g, errors: p.errors }; rows.push(row);
  console.log(JSON.stringify({ route, w, z: !!z, h1s: g.h1s, ox: g.overflowX, mod: g.module && [g.module.title, g.module.n, g.module.w, g.module.h], rail: g.rail, cards: (g.cards || []).map(c => c.w + "x" + c.h + (c.art ? ":" + c.art : c.img ? ":img" : "")), ov: g.overlap, err: p.errors.length }));
  await ctx.close();
}
fs.writeFileSync(`${DIR}/runs/shots-${which}-${rs.replace(/,/g, "_").slice(0, 80)}-${ws.replace(/,/g, "_")}${zoom ? "-z200" : ""}.json`, JSON.stringify(rows, null, 1));
await b.close();
