// TASK 04A -- sanningstabell per rutt: contextFor(), isBroad() (skalet),
// sfMode, nuvarande nedre upptäcktsmodul (rubrik + destinationer med antal)
// och en skärmbild av modulen.
// node truth.mjs before|after <route,..> [width]
import { chromium, ctxFor, open, ready, DIR, ROUTES } from "./lib.mjs"; import fs from "node:fs";
const [which = "before", rs = Object.keys(ROUTES).join(","), ws = "1440"] = process.argv.slice(2);
const OUT = `${DIR}/runs/shots`; fs.mkdirSync(OUT, { recursive: true });
const b = await chromium.launch(); const rows = [];
for (const route of rs.split(",")) for (const w of ws.split(",").map(Number)) {
  const ctx = await ctxFor(b, w, w < 768 ? 852 : 900, { which });
  const p = await open(ctx, ROUTES[route]); await ready(p, 3000);
  await p.evaluate(async () => { for (let y = 0; y < document.documentElement.scrollHeight; y += 700) { scrollTo({ top: y, behavior: "instant" }); await new Promise(r => setTimeout(r, 160)); } });
  await p.waitForTimeout(3500);
  const g = await p.evaluate(() => {
    const H = document.documentElement;
    let ctx = null; try { const c = HZ8.catalog.contextFor(location.href); ctx = c && { type: c.type, series: c.series && c.series.name, format: c.format && c.format.key, query: !!c.query }; } catch (e) { ctx = String(e); }
    const lbl = a => a.textContent.replace(/\s+/g, " ").trim();
    const mods = [];
    const pick = (sel, name) => document.querySelectorAll(sel).forEach(m => {
      if (!m.getClientRects().length || m.hidden) return;
      const r = m.getBoundingClientRect();
      const t = m.querySelector("h2, .hz8-rail__heading, .hz8-xd__title");
      mods.push({ name, title: t ? lbl(t) : null, top: Math.round(r.top + scrollY), h: Math.round(r.height),
        links: [...m.querySelectorAll("a[href], .hz8-rail__item")].filter(a => a.getClientRects().length).map(a => ({ t: lbl(a).slice(0, 60), href: a.getAttribute("href") ? new URL(a.href).pathname + new URL(a.href).search.replace(/[?&]preview=[^&]+/, "") : null, cur: a.getAttribute("aria-current") || null })) });
    });
    pick(".hz8-sf-others", "sf-others"); pick(".hz8-sf-cont", "sf-cont"); pick(".hz8-proutes", "proutes");
    pick(".hz8-sh-after", "hub-after"); pick(".hz8-cat-rails", "cat-rails"); pick(".hz8-xd", "xd");
    return { url: location.pathname + location.search.replace(/[?&]preview=[^&]+/, ""), h1: (document.querySelector("h1") || {}).textContent?.trim(), shell: H.getAttribute("data-hz8-shell"), pilot: H.classList.contains("hz8-cat-pilot"), sf: H.classList.contains("hz8-sf"), hub: H.classList.contains("hz8-sh-pilot"), nav: document.getElementById("skip-to-main-content")?.getAttribute("data-hz8-nav"), ctx, mods, overflowX: H.scrollWidth > innerWidth + 1 };
  });
  const tag = `${which}-${route}-${w}`;
  const m = await p.$(".hz8-xd, .hz8-sf-others:not([hidden]), .hz8-proutes, .hz8-sh-after");
  if (m) { await m.scrollIntoViewIfNeeded(); await p.waitForTimeout(500); await m.screenshot({ path: `${OUT}/${tag}-module.png` }).catch(() => {}); }
  rows.push({ which, route, w, ...g, errors: p.errors }); console.log(JSON.stringify(rows.at(-1)).slice(0, 2500));
  await ctx.close();
}
fs.writeFileSync(`${DIR}/runs/truth-${which}-${ws}.json`, JSON.stringify(rows, null, 1));
await b.close();
