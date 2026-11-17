// Funktionskontroll för MS 2 ml-piloten (lokal build i Theme 8-previewn).
// Köper 1 st Tinky Winky via stationens knapp och tar sedan bort EXAKT de
// rader testet lade till. Omdömesfixturen (falska testomdömen) körs i en egen
// flik med uppfångat API-svar och syns aldrig i bilderna.
import { chromium, ctxFor, open, URL_ } from "../pdp-pilot-2026-10/lib.mjs";
import fs from "node:fs"; import path from "node:path";
const DIR = path.dirname(new URL(import.meta.url).pathname);
const PDP = "/sv/products/thc-x-vape-hero-core-2ml";
const SIZES = [[393, 852], [1440, 900], [1920, 1080]];
const api = (p, method, ep, body) => p.evaluate(async ([m, e, b]) => {
  const x = document.cookie.match(/(?:^|;\s*)XSRF-TOKEN=([^;]+)/);
  const h = { Accept: "application/json", "Content-Type": "application/json", "X-Requested-With": "XMLHttpRequest" };
  if (x) h["X-XSRF-TOKEN"] = decodeURIComponent(x[1]);
  const r = await fetch("/frontend-api/" + e, { method: m, credentials: "same-origin", headers: h, body: b ? JSON.stringify(b) : undefined });
  let j = null; try { j = await r.json(); } catch {} return { status: r.status, json: j };
}, [method, ep, body]);
const items = async p => ((await api(p, "GET", "cart")).json?.data?.items || []).map(i => ({ id: i.id, variant: i.variant_id || i.variant?.id, qty: i.quantity, name: i.name }));
const browser = await chromium.launch({ channel: "chrome", headless: true });
const R = {};
for (const [w, h] of SIZES) {
  const r = R[w] = {};
  const ctx = await ctxFor(browser, w, h, { scale: 1 });
  const p = await open(ctx, URL_(PDP));
  await p.waitForSelector(".hz8-pcx-sa__item", { timeout: 30000 }); await p.waitForTimeout(4500);
  r.h1 = await p.locator("h1").count();
  r.overflow = await p.evaluate(() => document.documentElement.scrollWidth - innerWidth);
  r.textInHtml = await p.evaluate(() => {
    const t = document.querySelector(".hz8-ppc").textContent;
    return ["Vad är Hero's Core?", "Labbrapport", "LABBTEST", "Specifikationer", "Vad är Core?", "En laglig cannabis", "Full produktinformation", "Vilka strains finns", "Vem tillverkar", "kostar", "167/1998"].map(s => [s, t.includes(s)]);
  });
  r.faqAnswers = await p.evaluate(() => [...document.querySelectorAll(".hz8-pcx-faq__item")].map(d => [d.querySelector("h3").textContent, d.hidden ? "DOLD" : d.querySelector("p").textContent.slice(0, 160)]));
  r.carousel = await p.evaluate(() => [...document.querySelectorAll("#liknande .hz8-pcx-more__card")].map(c => [c.querySelector(".hz8-pcx-more__name")?.textContent.trim(), c.getAttribute("href"), c.querySelector(".hz8-pcx-more__price")?.textContent.trim()]));
  r.carouselHasSelf = r.carousel.some(c => /thc-x-vape-hero-core-2ml(\/|$|\?)/.test(c[1] || ""));
  r.carouselHasPack = r.carousel.some(c => /pack|paket/i.test((c[0] || "") + (c[1] || "")));
  r.ratingRow = await p.locator(".hz8-pp__rating").count();
  r.reviewSection = await p.locator("#omdomen").count();
  r.trust = await p.evaluate(() => [...document.querySelectorAll(".hz8-pp__trust li")].map(l => l.textContent.trim() + (l.querySelector("a") ? " → " + l.querySelector("a").getAttribute("href") : "")));
  // Länkar i kapitlen (interna: statuskod)
  r.links = await p.evaluate(async () => {
    const as = [...document.querySelectorAll(".hz8-ppc a[href], .hz8-pp a[href]")].filter(a => a.offsetParent);
    const uniq = [...new Set(as.map(a => a.href))];
    const out = [];
    for (const u of uniq) {
      if (u.includes("#")) { out.push([u, document.getElementById(u.split("#")[1]) ? "ankare ok" : "SAKNAS"]); continue; }
      if (new URL(u).origin !== location.origin) { out.push([u, "extern"]); continue; }
      try { const x = await fetch(u, { credentials: "same-origin", redirect: "manual" }); out.push([u, x.status || x.type]); } catch (e) { out.push([u, "fel"]); }
    }
    return out;
  });
  // Tangentbord: FAQ öppnas med Enter, strainknapp väljer strain, karusellpil flyttar
  await p.locator(".hz8-pcx-faq__item summary").first().focus();
  await p.keyboard.press("Enter"); await p.waitForTimeout(200);
  r.kbFaqOpen = await p.evaluate(() => document.querySelector(".hz8-pcx-faq__item").open);
  const nextBtn = p.locator("#liknande .hz8-pcx-nav__btn[data-dir='1']");
  if (await nextBtn.isVisible().catch(() => false)) {
    const before = await p.evaluate(() => document.querySelector("#liknande .hz8-pcx-more__list").scrollLeft);
    await nextBtn.focus(); await p.keyboard.press("Enter"); await p.waitForTimeout(900);
    r.kbCarousel = [before, await p.evaluate(() => document.querySelector("#liknande .hz8-pcx-more__list").scrollLeft)];
  } else {
    await p.evaluate(() => document.querySelector("#liknande .hz8-pcx-more__list").scrollBy({ left: 300 })); await p.waitForTimeout(400);
    r.kbCarousel = ["pilar dolda (svep)", await p.evaluate(() => document.querySelector("#liknande .hz8-pcx-more__list").scrollLeft)];
  }
  const tw = p.locator(".hz8-pcx-sa__item", { hasText: "Melon Haze" });
  await tw.focus(); await p.keyboard.press("Enter"); await p.waitForTimeout(1500);
  r.kbStrain = await p.evaluate(() => ({ native: document.querySelector("#product-variants select")?.selectedOptions[0]?.textContent.trim(), station: document.querySelector('.hz8-pp__tile[aria-pressed="true"] .hz8-pp__tile-name')?.textContent, focusInStation: !!document.activeElement.closest(".hz8-pp"), pressed: document.querySelector('.hz8-pcx-sa__item[aria-pressed="true"] .hz8-pcx-sa__name')?.textContent }));
  // Köp: 1 st Tinky Winky via stationens knapp (bara på 1440 -- samma kod på alla bredder)
  if (w === 1440) {
    const before = await items(p);
    await p.locator(".hz8-pp__cta").click(); await p.waitForTimeout(4500);
    const after = await items(p);
    const added = after.filter(a => !before.some(b => b.id === a.id && b.qty === a.qty));
    r.buy = { before: before.length, added };
    for (const a of added) await api(p, "DELETE", "cart/item/" + a.id);
    r.buy.cleaned = (await items(p)).filter(a => added.some(x => x.id === a.id)).length === 0;
  }
  await ctx.close();
}
// Fixtur: samma sida med tre TESTomdömen i API-svaret -> betygsrad + sektion
{
  const ctx = await ctxFor(browser, 393, 852, { scale: 1 });
  const fake = [5, 4, 5].map((s, i) => ({ id: 9000 + i, rating: s, review: "TESTDATA – fixtur " + (i + 1) + " för betygslänken.", name: "Test " + (i + 1), anonymous: false, created_at: "2026-11-1" + i + "T10:00:00Z" }));
  let calls = 0;
  await ctx.route(/frontend-api\/product-reviews\/255/, r => r.fulfill({ contentType: "application/json", body: JSON.stringify(calls++ ? [] : fake) }));
  const p = await open(ctx, URL_(PDP));
  await p.waitForSelector(".hz8-pcx-sa__item", { timeout: 30000 }); await p.waitForTimeout(5000);
  R.fixture = await p.evaluate(() => ({
    rating: document.querySelector(".hz8-pp__meta")?.textContent.trim(),
    link: document.querySelector(".hz8-pp__revlink")?.getAttribute("href"),
    section: document.querySelector("#omdomen h2")?.textContent.trim(),
    afterCarousel: !!document.querySelector("#liknande ~ #omdomen"),
    allInDom: document.querySelectorAll("#hz8-pr-full li").length
  }));
  await p.locator(".hz8-pp__revlink").click(); await p.waitForTimeout(1200);
  R.fixture.scrolledTo = await p.evaluate(() => Math.round(document.getElementById("omdomen").getBoundingClientRect().top));
  await ctx.close();
}
fs.writeFileSync(path.join(DIR, "check.json"), JSON.stringify(R, null, 1));
console.log(JSON.stringify(R, null, 1));
await browser.close();
