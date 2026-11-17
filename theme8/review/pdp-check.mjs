// Generell funktionskontroll för en författad PDP (lokal build i Theme 8-previewn,
// eller LOCAL=0 = det som ligger på Pages). Köper bara när något finns i lager
// och tar bort EXAKT de rader testet lade till. Klickar aldrig "Bevaka".
// Omdömesfixturen (TESTDATA) körs i egen flik med uppfångat API-svar.
// ROUTE=/sv/products/… PID=254 KEYS="text|text" OUT=<mapp> node pdp-check.mjs
import { chromium, ctxFor, open, URL_ } from "./pdp-pilot-2026-10/lib.mjs";
import fs from "node:fs"; import path from "node:path";
const { ROUTE, PID, OUT } = process.env; const KEYS = (process.env.KEYS || "").split("|").filter(Boolean);
fs.mkdirSync(OUT, { recursive: true });
const api = (p, method, ep, body) => p.evaluate(async ([m, e, b]) => {
  const x = document.cookie.match(/(?:^|;\s*)XSRF-TOKEN=([^;]+)/);
  const h = { Accept: "application/json", "Content-Type": "application/json", "X-Requested-With": "XMLHttpRequest" };
  if (x) h["X-XSRF-TOKEN"] = decodeURIComponent(x[1]);
  const r = await fetch("/frontend-api/" + e, { method: m, credentials: "same-origin", headers: h, body: b ? JSON.stringify(b) : undefined });
  let j = null; try { j = await r.json(); } catch {} return { status: r.status, json: j };
}, [method, ep, body]);
const items = async p => ((await api(p, "GET", "cart")).json?.data?.items || []).map(i => ({ id: i.id, variant: i.variant_id || i.variant?.id, qty: i.quantity, name: i.name }));
const vis = "e => !!e && e.getClientRects().length > 0 && !e.closest('[hidden]') && getComputedStyle(e).visibility !== 'hidden'";
const station = p => p.evaluate(v => { const V = eval(v); const cta = document.querySelector(".hz8-pp__cta"); return {
  ctaVisible: V(cta), ctaText: cta?.textContent.trim(), monitor: [...document.querySelectorAll(".product-detail__information button, .product-detail__information a")].filter(V).map(b => b.textContent.trim()).filter(t => /bevaka/i.test(t)),
  packCards: [...document.querySelectorAll(".hz8-pc")].filter(V).map(c => c.textContent.replace(/\s+/g, " ").trim() + (c.getAttribute("aria-disabled") === "true" ? " [låst]" : "")),
  selected: document.querySelector("#product-variants select")?.selectedOptions[0]?.textContent.trim(), stock: document.querySelector(".hz8-pp__stock, .hz8-pp__status")?.textContent.trim() }; }, vis);
const b = await chromium.launch({ channel: "chrome", headless: true }); const R = {};
for (const [w, h] of [[393, 852], [1440, 900], [1920, 1080]]) {
  const r = R[w] = {};
  const ctx = await ctxFor(b, w, h, { scale: 1 });
  const p = await open(ctx, URL_(ROUTE));
  await p.waitForSelector(".hz8-pcx-sa__item", { timeout: 30000 }); await p.waitForTimeout(4500);
  r.h1 = await p.evaluate(() => [...document.querySelectorAll("h1")].map(h => h.textContent.trim()));
  r.overflow = await p.evaluate(() => document.documentElement.scrollWidth - innerWidth);
  r.keysMissing = await p.evaluate(K => { const t = document.querySelector(".hz8-ppc").textContent; return K.filter(s => !t.includes(s)); }, KEYS);
  r.faq = await p.evaluate(() => [...document.querySelectorAll(".hz8-pcx-faq__item")].map(d => [d.querySelector("h3").textContent, d.hidden ? "DOLD" : d.querySelector("p").textContent]));
  r.carousel = await p.evaluate(() => [...document.querySelectorAll("#liknande .hz8-pcx-more__card")].map(c => [c.querySelector(".hz8-pcx-more__name")?.textContent.trim(), c.getAttribute("href")]));
  r.carouselSelf = r.carousel.some(c => (c[1] || "").split("?")[0].endsWith(ROUTE));
  r.carouselPack = r.carousel.some(c => /pack|paket/i.test(c.join(" ")));
  r.rating = await p.locator(".hz8-pp__rating, .hz8-pp__revlink").count(); r.reviewSection = await p.locator("#omdomen").count();
  r.docs = await p.evaluate(() => [...document.querySelectorAll(".hz8-pcx-ana__docs a")].map(a => [a.textContent.trim(), a.href]));
  r.anaNote = await p.evaluate(() => [document.querySelector(".hz8-pcx-ana__lead")?.textContent, document.querySelector(".hz8-pcx-ana__note")?.textContent]);
  r.links = await p.evaluate(async () => {
    const as = [...document.querySelectorAll(".hz8-ppc a[href], .hz8-pp a[href]")].filter(a => a.offsetParent);
    const out = [];
    for (const u of [...new Set(as.map(a => a.href))]) {
      if (u.includes("#")) { out.push([u, document.getElementById(u.split("#")[1]) ? "ankare ok" : "SAKNAS"]); continue; }
      if (!/^https?:/.test(u)) { out.push([u, "mailto/övrigt"]); continue; }
      if (new URL(u).origin !== location.origin) { out.push([u, "extern"]); continue; }
      try { const x = await fetch(u, { credentials: "same-origin", redirect: "manual" }); out.push([u, x.status || x.type]); } catch (e) { out.push([u, "fel"]); }
    }
    return out;
  });
  r.badLinks = r.links.filter(l => !["ankare ok", "extern", "mailto/övrigt", 200, "opaqueredirect"].includes(l[1]));
  // Strainmodulen
  r.strains = await p.evaluate(() => [...document.querySelectorAll(".hz8-pcx-sa__item")].map(b => b.querySelector(".hz8-pcx-sa__name").textContent + (b.getAttribute("aria-disabled") === "true" ? " (slut)" : "")));
  r.groups = [];
  const sec = p.locator("#hz8-pcx-strains"); await sec.scrollIntoViewIfNeeded(); await p.waitForTimeout(400);
  for (let g = 0; g < 4; g++) {
    r.groups.push(await p.evaluate(() => { const L = document.querySelector(".hz8-pcx-sa__list"), lr = L.getBoundingClientRect(); return { pos: document.querySelector(".hz8-pcx-sa__pos")?.textContent, visible: [...L.querySelectorAll(".hz8-pcx-sa__item")].filter(x => { const q = x.getBoundingClientRect(); return (Math.min(q.right, lr.right) - Math.max(q.left, lr.left)) / q.width > .95; }).length }; }));
    const nx = p.locator(".hz8-pcx-sa__arrow[data-dir='1']"); if (!(await nx.isVisible()) || await nx.isDisabled()) break;
    await nx.click(); await p.waitForTimeout(700);
  }
  await p.locator(".hz8-pcx-sa__arrow[data-dir='-1']").click({ trial: true }).catch(() => {});
  r.stationBefore = await station(p);
  // Klick på en slutsåld strain: valet ska inte ändras, ingen köpknapp
  const sold = p.locator(".hz8-pcx-sa__item[aria-disabled='true']").first();
  if (await sold.count()) {
    await p.evaluate(() => { const L = document.querySelector(".hz8-pcx-sa__list"), s = document.querySelector(".hz8-pcx-sa__item[aria-disabled='true']"); L.scrollLeft = s.offsetLeft - L.offsetLeft; }); await p.waitForTimeout(500);
    const y0 = await p.evaluate(() => scrollY);
    await sold.click({ force: true }); await p.waitForTimeout(800);
    r.soldClick = { ...(await station(p)), jump: (await p.evaluate(() => scrollY)) - y0 };
  }
  // Klick på en strain i lager: synkas till köpdelen
  const inStock = p.locator(".hz8-pcx-sa__item:not([aria-disabled='true'])");
  if (await inStock.count()) {
    const it = inStock.last(); const nm = await it.locator(".hz8-pcx-sa__name").textContent();
    await p.evaluate(n => { const L = document.querySelector(".hz8-pcx-sa__list"); const s = [...L.querySelectorAll(".hz8-pcx-sa__item")].find(x => x.querySelector(".hz8-pcx-sa__name").textContent === n); L.scrollLeft = s.offsetLeft - L.offsetLeft; }, nm); await p.waitForTimeout(500);
    const y0 = await p.evaluate(() => scrollY);
    await it.click(); await p.waitForTimeout(1200);
    r.stockClick = { name: nm, ...(await station(p)), jump: (await p.evaluate(() => scrollY)) - y0 };
  }
  // Tangentbord: FAQ
  await p.locator(".hz8-pcx-faq__item summary").first().focus(); await p.keyboard.press("Enter"); await p.waitForTimeout(200);
  r.kbFaq = await p.evaluate(() => document.querySelector(".hz8-pcx-faq__item").open);
  // Köp (bara 1440 och bara om något finns i lager)
  if (w === 1440 && r.stockClick && r.stockClick.ctaVisible) {
    const before = await items(p);
    await p.locator(".hz8-pp__cta").click(); await p.waitForTimeout(4500);
    const added = (await items(p)).filter(a => !before.some(x => x.id === a.id && x.qty === a.qty));
    r.buy = { added }; for (const a of added) await api(p, "DELETE", "cart/item/" + a.id);
    r.buy.cleaned = (await items(p)).filter(a => added.some(x => x.id === a.id)).length === 0;
  }
  await p.evaluate(() => scrollTo(0, 0)); await p.waitForTimeout(400);
  await p.screenshot({ path: path.join(OUT, `kop-${w}.jpg`), type: "jpeg", quality: 78 });
  await ctx.close();
}
// Fixtur: tre TESTomdömen i API-svaret -> betygsrad + sektion (syns aldrig i bilderna)
{
  const ctx = await ctxFor(b, 393, 852, { scale: 1 });
  const fake = [5, 4, 5].map((s, i) => ({ id: 9000 + i, rating: s, review: "TESTDATA – fixtur " + (i + 1), name: "Test " + (i + 1), anonymous: false, created_at: "2026-11-1" + i + "T10:00:00Z" }));
  let calls = 0;
  await ctx.route(new RegExp("frontend-api/product-reviews/" + PID), r => r.fulfill({ contentType: "application/json", body: JSON.stringify(calls++ ? [] : fake) }));
  const p = await open(ctx, URL_(ROUTE));
  await p.waitForSelector(".hz8-pcx-sa__item", { timeout: 30000 }); await p.waitForTimeout(5000);
  R.fixture = await p.evaluate(() => ({ rating: document.querySelector(".hz8-pp__meta")?.textContent.trim(), link: document.querySelector(".hz8-pp__revlink")?.getAttribute("href"), section: document.querySelector("#omdomen h2")?.textContent.trim() }));
  await ctx.close();
}
fs.writeFileSync(path.join(OUT, "check.json"), JSON.stringify(R, null, 1));
for (const w of ["393", "1440", "1920"]) { const r = R[w]; console.log(w, JSON.stringify({ h1: r.h1, overflow: r.overflow, keysMissing: r.keysMissing, faqHidden: r.faq.filter(f => f[1] === "DOLD").map(f => f[0]), faqN: r.faq.length, car: r.carousel.length, self: r.carouselSelf, pack: r.carouselPack, rating: r.rating, rev: r.reviewSection, docs: r.docs.length, bad: r.badLinks, groups: r.groups, before: r.stationBefore, sold: r.soldClick, stock: r.stockClick, kbFaq: r.kbFaq, buy: r.buy })); }
console.log("fixture", JSON.stringify(R.fixture));
await b.close();
