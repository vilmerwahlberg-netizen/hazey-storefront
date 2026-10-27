// TASK 04C-R -- uppmätt textkontrast i seriehubbens hero (mobil).
// Per textnod (brödsmula, H1, ingress, antal): texten görs genomskinlig
// (även text-shadow), bakgrunden fotas och den mörkaste 10:e percentilen
// av bakgrunden bakom textens rad-rektanglar jämförs med textens färg
// (WCAG-relativ luminans). Konservativt: text-shadowens stöd räknas inte.
// SHADOW=1: text-shadowen (glyfhalon) behålls -- det besökaren faktiskt ser.
// node contrast.mjs before|after <route,..> <width,..>
import { chromium, ctxFor, open, ready, DIR, ROUTES } from "./lib.mjs"; import fs from "node:fs"; import { PNG } from "pngjs";
const [which = "after", rs = "core", ws = "393"] = process.argv.slice(2);
const SHADOW = !!process.env.SHADOW;
const L = c => { c /= 255; return c <= .03928 ? c / 12.92 : Math.pow((c + .055) / 1.055, 2.4); };
const lum = (r, g, b) => .2126 * L(r) + .7152 * L(g) + .0722 * L(b);
const b = await chromium.launch(); const rows = [];
for (const route of rs.split(",")) for (const w of ws.split(",").map(Number)) {
  const ctx = await ctxFor(b, w, 852, { which }); const p = await open(ctx, ROUTES[route]); await ready(p, 3000);
  await p.waitForSelector("#hz8-sh-nav .hz8-sh-chip", { timeout: 45000 }).catch(() => {}); await p.waitForTimeout(1500);
  const nodes = await p.evaluate(SHADOW => {
    const sel = { crumb: ".hz8-sh-hero .breadcrumb", h1: ".hz8-sh-hero h1", lead: ".hz8-sh-hero__lead", count: ".hz8-sh-hero__count" };
    const out = {};
    for (const [k, s] of Object.entries(sel)) {
      const e = document.querySelector(s); if (!e) continue;
      const rg = document.createRange(); rg.selectNodeContents(e);
      const rects = [...rg.getClientRects()].filter(r => r.width > 2 && r.height > 2).map(r => [r.left, r.top, r.right, r.bottom].map(Math.round));
      const t = e.querySelector("a") && k === "crumb" ? e.querySelector("a") : e;
      out[k] = { rects, color: getComputedStyle(t).color };
    }
    const st = document.createElement("style"); st.id = "hz8-ct"; st.textContent = ".hz8-sh-hero__copy, .hz8-sh-hero__copy * { color: transparent !important; -webkit-text-fill-color: transparent !important; " + (SHADOW ? "" : "text-shadow: none !important; ") + "}"; document.head.appendChild(st);
    return out;
  }, SHADOW);
  await p.waitForTimeout(200);
  const buf = await p.screenshot(); const P = PNG.sync.read(buf); const dpr = P.width / w;
  const res = {};
  for (const [k, n] of Object.entries(nodes)) {
    const m = n.color.match(/[\d.]+/g).map(Number); const tl = lum(m[0], m[1], m[2]);
    const ls = [];
    for (const [x0, y0, x1, y1] of n.rects) for (let y = Math.round(y0 * dpr); y < y1 * dpr; y += 2) for (let x = Math.round(x0 * dpr); x < x1 * dpr; x += 2) { if (x < 0 || y < 0 || x >= P.width || y >= P.height) continue; const i = (y * P.width + x) * 4; ls.push(lum(P.data[i], P.data[i + 1], P.data[i + 2])); }
    ls.sort((a, c) => a - c);
    const p10 = ls[Math.floor(ls.length * .1)], med = ls[Math.floor(ls.length / 2)];
    res[k] = { p10: +((Math.max(p10, tl) + .05) / (Math.min(p10, tl) + .05)).toFixed(2), median: +((Math.max(med, tl) + .05) / (Math.min(med, tl) + .05)).toFixed(2) };
  }
  const row = { which, route, w, ...res, errors: p.errors }; rows.push(row); console.log(JSON.stringify(row));
  await ctx.close();
}
fs.writeFileSync(`${DIR}/runs/contrast-${which}${SHADOW ? "-shadow" : ""}-${rs.replace(/,/g, "_")}-${ws.replace(/,/g, "_")}.json`, JSON.stringify(rows, null, 1));
await b.close();
