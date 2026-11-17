// Omdömeskomponenten, två lägen av samma PDP (lokalt, bara i testfliken):
//  A) utan omdömen (som i dag)
//  B) TESTDATA: 40 omdömen med betygsfördelning som ger snitt ~4,7 (Woo: 4,69/40).
//     Inga kundcitat: texten är en tydlig testetikett. API-svaret fångas upp i
//     testfliken -- inget skrivs till Nyehandel, JSON-LD eller admin.
import { chromium, ctxFor, open, URL_ } from "../pdp-pilot-2026-10/lib.mjs";
import fs from "node:fs"; import path from "node:path";
const DIR = path.dirname(new URL(import.meta.url).pathname), OUT = path.join(DIR, "shots", "r5-omdomen"); fs.mkdirSync(OUT, { recursive: true });
const dist = [[5, 32], [4, 5], [3, 2], [2, 1]];
const FAKE = []; let n = 0;
for (const [s, c] of dist) for (let i = 0; i < c; i++) { n++; FAKE.push({ id: 90000 + n, rating: s, review: `TESTDATA – testomdöme nr ${n} (inget kundcitat)`, name: `Testdata ${n}`, anonymous: false, created_at: `2026-${String(1 + (n % 10)).padStart(2, "0")}-${String(1 + (n % 27)).padStart(2, "0")}T10:00:00Z` }); }
const avg = FAKE.reduce((a, r) => a + r.rating, 0) / FAKE.length;
const b = await chromium.launch({ channel: "chrome", headless: true }); const R = { avg };
for (const mode of ["utan", "testdata"]) for (const [w, h] of [[393, 852], [1440, 900]]) {
  const ctx = await ctxFor(b, w, h, { scale: w < 768 ? 2 : 1 });
  if (mode === "testdata") { let calls = 0; await ctx.route(/frontend-api\/product-reviews\/261/, r => r.fulfill({ contentType: "application/json", body: JSON.stringify(calls++ ? [] : FAKE) })); }
  const p = await open(ctx, URL_("/sv/products/vape-magic-sauce-magic-farmers-2ml/454"));
  await p.waitForSelector(".hz8-pcx-sa__item", { timeout: 30000 }); await p.waitForTimeout(5500);
  const info = await p.evaluate(() => {
    const y = s => { const e = document.querySelector(s); if (!e) return null; const r = e.getBoundingClientRect(); return [Math.round(r.top + scrollY), Math.round(r.bottom + scrollY)]; };
    return { meta: document.querySelector(".hz8-pp__meta")?.textContent.trim() || "", metaHidden: document.querySelector(".hz8-pp__meta")?.hidden, link: document.querySelector(".hz8-pp__revlink")?.getAttribute("href") || null,
      section: y("#omdomen"), carousel: y("#liknande"), related: y(".hz8-ppc--authored > .related-categories"), ld: [...document.querySelectorAll('script[type="application/ld+json"]')].some(s => /aggregateRating|reviewCount/.test(s.textContent)) };
  });
  const key = `${mode}-${w}`; R[key] = info;
  // köpdelen (betygsraden nära H1)
  const top = await p.evaluate(() => { const r = document.querySelector(".product-detail__information").getBoundingClientRect(); return [r.left, r.top + scrollY, r.width]; });
  const vh = Math.round(top[1] + 300);
  await p.setViewportSize({ width: w, height: Math.max(h, vh + 40) }); await p.waitForTimeout(500);
  await p.screenshot({ path: path.join(OUT, `r5-${key}-kopdel.jpg`), clip: { x: Math.max(0, top[0] - 12), y: Math.max(0, top[1] - 12), width: Math.min(w, top[2] + 24), height: 300 }, type: "jpeg", quality: 86 });
  // karusell -> (omdömen) -> kategorier
  const c = info.carousel, rel = info.related;
  const H = await p.evaluate(() => document.documentElement.scrollHeight);
  await p.setViewportSize({ width: w, height: H }); await p.waitForTimeout(900);
  await p.screenshot({ path: path.join(OUT, `r5-${key}-omdomesyta.jpg`), clip: { x: 0, y: c[0] - 20, width: w, height: Math.min(rel[1] - c[0] + 40, 2400) }, type: "jpeg", quality: 84 });
  await p.setViewportSize({ width: w, height: h }); await p.waitForTimeout(400);
  if (info.link) {
    await p.evaluate(() => scrollTo(0, 0)); await p.locator(".hz8-pp__revlink").click(); await p.waitForTimeout(1500);
    R[key].afterClick = await p.evaluate(() => ({ hash: location.hash, sectionTop: Math.round(document.getElementById("omdomen").getBoundingClientRect().top), headerBottom: Math.round((document.querySelector("#store-header, header") || document.body).getBoundingClientRect().bottom) }));
  }
  await ctx.close();
}
fs.writeFileSync(path.join(OUT, "omdomen.json"), JSON.stringify(R, null, 1)); console.log(JSON.stringify(R, null, 1)); await b.close();
