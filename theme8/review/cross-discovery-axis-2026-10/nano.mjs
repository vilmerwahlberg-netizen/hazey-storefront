// TASK 04A Nano-11-korrigering -- kortnivå: Nano-11-kortet mot raden.
// Per hubb/bredd: varje kort i "Utforska andra serier": has-art, bakgrundsbild,
// mått, ram/radie/skugga (material), inre produktbildsruta synlig?, samt
// luminans bakom texten (texten dold, bilden + tonningen kvar) -> kontrast
// mot den vita namnfärgen. Kortutsnitt sparas i runs/nano/.
// node nano.mjs <which> [route,..] [width,..] [zoom]
import { chromium, ctxFor, open, ready, DIR, ROUTES } from "./lib.mjs"; import fs from "node:fs";
import { PNG } from "pngjs";
const [which = "after", rs = "magic-sauce,core", ws = "320,393,1440,1920", zoom = ""] = process.argv.slice(2);
const OUT = `${DIR}/runs/nano`; fs.mkdirSync(OUT, { recursive: true });
const lum = (r, g, b) => { const f = c => { c /= 255; return c <= .03928 ? c / 12.92 : ((c + .055) / 1.055) ** 2.4; }; return .2126 * f(r) + .7152 * f(g) + .0722 * f(b); };
const b = await chromium.launch(); const rows = [];
for (const route of rs.split(",")) for (const w of ws.split(",").map(Number)) {
  const z = zoom ? 2 : 0, cw = z ? w / 2 : w;
  const ctx = await ctxFor(b, cw, cw < 768 ? 852 : 900, { which, zoom: z });
  const p = await open(ctx, ROUTES[route]); await ready(p, 3000);
  await p.evaluate(() => document.querySelector(".hz8-xd")?.scrollIntoView({ block: "center", behavior: "instant" }));
  await p.waitForTimeout(2500);
  const cards = await p.evaluate(() => [...document.querySelectorAll(".hz8-xd a.hz8-sf-serie")].map(a => {
    const cs = getComputedStyle(a), r = a.getBoundingClientRect(), media = a.querySelector(".hz8-sf-serie__media"), t = a.querySelector(".hz8-sf-serie__text").getBoundingClientRect();
    return { name: a.querySelector(".hz8-sf-serie__name").textContent, art: a.getAttribute("data-hz8-series-art"), hasArt: a.classList.contains("has-art"),
      bg: (cs.backgroundImage.match(/[^/]+\.webp/) || [cs.backgroundImage.slice(0, 40)])[0], w: Math.round(r.width), h: Math.round(r.height),
      material: [cs.borderTopWidth, cs.borderTopColor, cs.borderTopLeftRadius, cs.boxShadow, cs.backgroundSize].join(" | "),
      innerMediaVisible: !!media && media.getClientRects().length > 0 && getComputedStyle(media).display !== "none",
      nameColor: getComputedStyle(a.querySelector(".hz8-sf-serie__name")).color, textFits: t.right <= r.right + 1 && t.bottom <= r.bottom + 1 };
  }));
  // Bilden laddad?
  const loaded = await p.evaluate(async () => { const a = document.querySelector('.hz8-xd [data-hz8-series-art="nano11"]'); if (!a) return null; const u = getComputedStyle(a).backgroundImage.match(/url\("?([^")]+)/); if (!u) return false; const im = new Image(); im.src = u[1]; try { await im.decode(); return [im.naturalWidth, im.naturalHeight]; } catch (e) { return false; } });
  // Luminans bakom texten: dölj texten, fota kortet, mät textrutans område.
  await p.addStyleTag({ content: ".hz8-xd .hz8-sf-serie__text *{color:transparent!important;text-shadow:none!important}" });
  await p.waitForTimeout(200);
  const els = await p.$$(".hz8-xd a.hz8-sf-serie");
  for (let i = 0; i < els.length; i++) {
    const c = cards[i]; await els[i].scrollIntoViewIfNeeded().catch(() => {});
    const box = await els[i].evaluate(a => { const r = a.getBoundingClientRect(), t = a.querySelector(".hz8-sf-serie__text").getBoundingClientRect(); return { tx: t.left - r.left, ty: t.top - r.top, tw: t.width, th: t.height, w: r.width }; });
    const buf = await els[i].screenshot(); const img = PNG.sync.read(buf); const k = img.width / box.w;
    let L = 0, Lmax = 0, n = 0;
    for (let y = Math.round(box.ty * k); y < Math.round((box.ty + box.th) * k); y++) for (let x = Math.round(box.tx * k); x < Math.round((box.tx + box.tw) * k); x++) { const o = (y * img.width + x) * 4; const l = lum(img.data[o], img.data[o + 1], img.data[o + 2]); L += l; Lmax = Math.max(Lmax, l); n++; }
    c.bgLumMean = +(L / n).toFixed(3); c.contrastMean = +((1.05) / (L / n + .05)).toFixed(1); c.contrastWorst = +((1.05) / (Lmax + .05)).toFixed(1);
  }
  await p.evaluate(() => document.querySelectorAll("style").forEach(s => { if (s.textContent.includes("color:transparent!important")) s.remove(); }));
  await p.waitForTimeout(150);
  const mod = await p.$(".hz8-xd"); await mod.scrollIntoViewIfNeeded();
  await mod.screenshot({ path: `${OUT}/${which}-${route}-${w}${z ? "-z200" : ""}.png` });
  const row = { which, route, w, zoom: !!z, nanoLoaded: loaded, overflowX: await p.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1), errors: p.errors.length, cards };
  rows.push(row); console.log(JSON.stringify(row));
  await ctx.close();
}
fs.writeFileSync(`${DIR}/runs/nano-${which}-${rs.replace(/,/g, "_")}-${ws.replace(/,/g, "_")}${zoom ? "-z200" : ""}.json`, JSON.stringify(rows, null, 1));
await b.close();
