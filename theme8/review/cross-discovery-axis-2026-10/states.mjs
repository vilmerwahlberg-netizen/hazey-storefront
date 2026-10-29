// TASK 04A -- destinationstillstånd och interaktion.
// A) Riktiga sidor, destinationer stryps via nätet (kategorisidan svarar med
//    "0 produkter"): 0, 1, 2 och 3 kvar på THCaB Vapes (3 riktiga) och 0 på
//    Alla Buds. Ingen kod i sidan ändras.
// B) Fixtur via den publika renderaren HZ8.crossDiscovery.module på en riktig
//    sida: 4, 6 och långa svenska namn (riktiga routes, renderade i en
//    testcontainer) -- bara layoutbevis, inga antal hittas på i sidan.
// C) Tangentbord (Tab genom korten, railen scrollar, dokumentet aldrig i
//    sidled) och prefers-reduced-motion (inga transitions på korten).
// node states.mjs [width,..]
import { chromium, ctxFor, open, ready, DIR, ROUTES } from "./lib.mjs"; import fs from "node:fs";
const [ws = "393,1440"] = process.argv.slice(2);
const OUT = `${DIR}/runs/states`; fs.mkdirSync(OUT, { recursive: true });
const b = await chromium.launch(); const rows = [];
const ZERO = n => `<html><body><span id="products_count">${n} produkter</span></body></html>`;

async function page(w, route, zeroPaths = [], opts = {}) {
  const ctx = await ctxFor(b, w, w < 768 ? 852 : 900, { which: "after" });
  if (zeroPaths.length) await ctx.route(/hazeyse\.nyehandel\.se\/sv\/categories\/[^#]+/, async r => {
    const req = r.request(); if (req.resourceType() === "document") return r.fallback();
    const u = new URL(req.url()); const key = u.pathname + (u.searchParams.get("filters") ? "?filters=" + u.searchParams.get("filters") : "");
    if (zeroPaths.some(z => key === z)) return r.fulfill({ status: 200, contentType: "text/html", body: ZERO(0) });
    return r.fallback();
  });
  const p = await open(ctx, ROUTES[route], { before: async pg => { if (opts.reduce) await pg.emulateMedia({ reducedMotion: "reduce" }); } });
  await ready(p, 2500);
  await p.evaluate(async () => { for (let y = 0; y < document.documentElement.scrollHeight; y += 700) { scrollTo({ top: y, behavior: "instant" }); await new Promise(r => setTimeout(r, 140)); } });
  await p.waitForTimeout(3500);
  return { ctx, p };
}
const measure = sel => (s => {
  const m = document.querySelector(s); const H = document.documentElement;
  const base = { overflowX: H.scrollWidth > innerWidth + 1 };
  if (!m) return { ...base, present: false };
  const ul = m.querySelector(".hz8-sf-series");
  return { ...base, present: true, hidden: m.hidden, visible: !!m.getClientRects().length, n: m.getAttribute("data-hz8-xd-n"), more: m.classList.contains("is-more"),
    title: m.querySelector("h2").textContent, all: (m.querySelector(".hz8-sf-row__all") || {}).textContent || null,
    cards: [...m.querySelectorAll(".hz8-sf-serie")].map(a => { const r = a.getBoundingClientRect(), n = a.querySelector(".hz8-sf-serie__name"), nr = n.getBoundingClientRect(); return { t: n.textContent, c: a.querySelector(".hz8-sf-serie__count").textContent, w: Math.round(r.width), h: Math.round(r.height), nameLines: Math.round(nr.height / parseFloat(getComputedStyle(n).lineHeight)), nameFits: nr.right <= r.right - 8 }; }),
    railW: ul && ul.clientWidth, scrollbarH: ul ? ul.offsetHeight - ul.clientHeight : null };
})(sel);

for (const w of ws.split(",").map(Number)) {
  // A) THCaB Vapes: 3 riktiga destinationer -> strypta till 2, 1, 0.
  const sibs = ["/sv/categories/m-s-vapes", "/sv/categories/thcb-vapes", "/sv/categories/alla-vapes?filters=Serie_Core"];
  for (const k of [0, 1, 2, 3]) {
    const { ctx, p } = await page(w, "thcab-vapes", sibs.slice(0, k));
    const r = await p.evaluate(measure, ".hz8-xd");
    const m = await p.$(".hz8-xd:not([hidden])");
    if (m) { await m.scrollIntoViewIfNeeded(); await p.evaluate(() => scrollBy(0, -160)); await p.waitForTimeout(500); }
    else await p.evaluate(() => { const a = document.querySelector(".hz8-sf-after"); if (a) { a.scrollIntoView(); scrollBy(0, -200); } });
    await p.screenshot({ path: `${OUT}/thcab-vapes-${3 - k}dest-${w}.jpg`, type: "jpeg", quality: 72 });
    rows.push({ test: `real-${3 - k}`, route: "thcab-vapes", w, ...r, errors: p.errors }); console.log(JSON.stringify(rows.at(-1)).slice(0, 700));
    await ctx.close();
  }
  // A) Alla Buds: båda formatdestinationerna 0 -> ingen modul.
  {
    const { ctx, p } = await page(w, "buds", ["/sv/categories/alla-vapes", "/sv/categories/hasch"]);
    const r = await p.evaluate(measure, ".hz8-xd");
    rows.push({ test: "real-0-format", route: "buds", w, ...r, errors: p.errors }); console.log(JSON.stringify(rows.at(-1)).slice(0, 500));
    await ctx.close();
  }
  // B) Fixturer: 4, 6 och långa namn.
  {
    const { ctx, p } = await page(w, "thcab-vapes");
    const fx = [["4", 4, false], ["6", 6, false], ["long", 3, true]];
    for (const [name, n, long] of fx) {
      const r = await p.evaluate(({ n, long, name }) => {
        const routes = ["/sv/categories/m-s-vapes", "/sv/categories/thcb-vapes", "/sv/categories/thca-vapes", "/sv/categories/m-s-buds", "/sv/categories/thca-blommor", "/sv/categories/nano11-blommor"];
        const names = long ? ["Magic Sauce Hasch och Charas från Marrakech", "Nano-11 Buds i storpack – utvalda sorter", "THCbA Vapes engångs 2 ml"] : ["Fixtur A", "Fixtur B", "Fixtur C", "Fixtur D", "Fixtur E", "Fixtur F"];
        const host = document.querySelector(".hz8-sf-after");
        const sec = HZ8.crossDiscovery.module({ axis: "fixture-" + name, title: long ? "Andra serier i Hasch och Charas" : "Fixtur: " + n + " destinationer", all: { href: "/sv/categories/alla-vapes", label: "Visa alla vapes" }, items: routes.slice(0, n).map((h, i) => ({ name: names[i], href: h, art: i % 2 ? "thcab" : null })) });
        sec.setAttribute("data-fixture", name); host.appendChild(sec);
        return new Promise(res => sec.ready.then(() => res(true)));
      }, { n, long, name });
      await p.waitForTimeout(600);
      const m = await p.evaluate(measure, `[data-fixture="${name}"]`);
      const el = await p.$(`[data-fixture="${name}"]`); await el.scrollIntoViewIfNeeded(); await p.evaluate(() => scrollBy(0, -140)); await p.waitForTimeout(400);
      await el.screenshot({ path: `${OUT}/fixture-${name}-${w}.png` });
      rows.push({ test: `fixture-${name}`, w, ...m }); console.log(JSON.stringify(rows.at(-1)).slice(0, 900));
    }
    // C) Tangentbord genom den riktiga modulen + 6-fixturen.
    const kb = await p.evaluate(async () => {
      const out = []; const sec = document.querySelector('[data-fixture="6"]'); const links = [...sec.querySelectorAll("a")];
      for (const a of links) { a.focus(); await new Promise(r => setTimeout(r, 450)); const ul = sec.querySelector("ul"), lr = ul.getBoundingClientRect(), ar = a.getBoundingClientRect();
        out.push({ t: a.textContent.trim().slice(0, 24), inRail: a.classList.contains("hz8-sf-row__all") || (ar.left >= lr.left - 3 && ar.right <= lr.right + 3), focusVisible: getComputedStyle(a).outlineStyle !== "none", docScrollX: scrollX }); }
      return out;
    });
    // Riktig Tab-ordning: från sista produktkortet in i modulen.
    const tabs = [];
    await p.evaluate(() => { const h = document.querySelector('.hz8-xd[data-hz8-xd="series-format"] h2'); h.tabIndex = -1; h.focus(); });
    for (let i = 0; i < 5; i++) { await p.keyboard.press("Tab"); tabs.push(await p.evaluate(() => ({ t: document.activeElement.textContent.replace(/\s+/g, " ").trim().slice(0, 30), href: document.activeElement.getAttribute("href"), fv: document.activeElement.matches(":focus-visible") }))); }
    rows.push({ test: "keyboard", w, fixture6: kb, tabOrder: tabs }); console.log(JSON.stringify(rows.at(-1)).slice(0, 1200));
    await ctx.close();
  }
  // C) Reducerad rörelse: korten har ingen transition och ingen hover-lyft.
  {
    const { ctx, p } = await page(w, "magic-sauce", [], { reduce: true });
    const r = await p.evaluate(() => [...document.querySelectorAll(".hz8-xd .hz8-sf-serie")].map(a => ({ tr: getComputedStyle(a).transitionDuration, rm: matchMedia("(prefers-reduced-motion: reduce)").matches })));
    rows.push({ test: "reduced-motion", route: "magic-sauce", w, cards: r }); console.log(JSON.stringify(rows.at(-1)));
    await ctx.close();
  }
}
fs.writeFileSync(`${DIR}/runs/states-${ws.replace(/,/g, "_")}.json`, JSON.stringify(rows, null, 1));
await b.close();
