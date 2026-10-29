// TASK 10B-R1 -- slutkontroll (före efb5336 | efter arbetskopian).
//   similar   91, 92, 57, 84, 88, 17 @393/1440: källa (serie/format), rubrik,
//             kicker, "Alla"-länk, aktuell produkt aldrig med, inga dubbletter
//             mot Bästsäljare, legacy-serier aldrig som källa
//   facts     Produktfakta innehåller hela produktbeskrivningen i initial DOM
//             (jämfört med samma sida med ?hz8-pdp=0)
//   fixture   92: katalogkartans filtrerade seriedestination (Alla Carts
//             filtrerad på Magic Sauce) svarar med ≥ 2 andra produkter ->
//             "Fler i serien" med den filtrerade routen (bevisar att filtrerade
//             destinationer godtas; testdata, inte sidans riktiga innehåll)
// node final.mjs <before|after>
import { chromium, ctxFor, open, ready, DIR } from "./lib.mjs"; import fs from "node:fs";
import { PRODUCTS } from "./products.mjs";
const [which = "after"] = process.argv.slice(2);
const b = await chromium.launch(); const R = {};
const SIM = () => {
  const here = location.pathname.replace(/\/\d+$/, "");
  const rail = document.getElementById("liknande");
  const pathOf = h => new URL(h, location.origin).pathname.replace(/\/\d+$/, "");
  const cards = rail ? [...rail.querySelectorAll(".product-card a[href*='/products/']")].map(a => pathOf(a.href)) : [];
  const best = [...document.querySelectorAll(".hz8-ppbest a[href*='/products/']")].map(a => pathOf(a.href));
  return { present: !!rail, kind: rail && rail.getAttribute("data-hz8-similar"), title: rail && (rail.querySelector(".hz8-prail__title") || {}).textContent, kicker: rail && (rail.querySelector(".hz8-pp-similar__kicker") || {}).textContent || null,
    all: rail && (rail.querySelector(".hz8-prail__all") || {}).getAttribute?.("href")?.replace(/[?&]preview=[^&]+/, ""), allLabel: rail && (rail.querySelector(".hz8-prail__all") || {}).textContent,
    cards: [...new Set(cards)].length, self: cards.includes(here), dupBest: best.filter(x => cards.includes(x)).length, bestRows: best.length,
    h1s: document.querySelectorAll("h1:not([role=heading])").length, overflowX: document.documentElement.scrollWidth > innerWidth + 1 };
};
for (const id of [91, 92, 57, 84, 88, 17]) for (const w of [393, 1440]) {
  const ctx = await ctxFor(b, w, w < 768 ? 852 : 900, { which }); const p = await open(ctx, PRODUCTS[id].route); await ready(p, 6000);
  await p.evaluate(async () => { for (let y = 0; y < document.documentElement.scrollHeight; y += 600) { scrollTo({ top: y, behavior: "instant" }); await new Promise(r => setTimeout(r, 90)); } }); await p.waitForTimeout(2500);
  const sim = await p.evaluate(SIM);
  const facts = await p.evaluate(() => { const t = document.querySelector(".hz8-acc--produktfakta .hz8-acc__text") || document.querySelector("#product-information article"); const d = document.querySelector(".hz8-acc--produktfakta"); return { len: t ? t.textContent.replace(/\s+/g, " ").trim().length : 0, inDisclosure: !!d && !!t && d.contains(t), closed: d ? !d.open : null }; });
  const el = await p.$("#liknande"); if (el) { await el.scrollIntoViewIfNeeded(); await p.waitForTimeout(400); await el.screenshot({ path: `${DIR}/runs/shots/${which}-similar-${id}-${w}.jpg`, type: "jpeg", quality: 74 }); }
  R[`${id}-${w}`] = { sim, facts, errors: p.errors }; console.log(`${id}-${w}`, JSON.stringify(R[`${id}-${w}`]));
  await ctx.close();
}
// Referens: produktbeskrivningens längd utan adapter.
for (const id of [91, 92, 57, 84, 88, 17]) {
  const ctx = await ctxFor(b, 1440, 900, { which }); const p = await open(ctx, PRODUCTS[id].route + "?hz8-pdp=0"); await ready(p, 4000);
  R[`ref-${id}`] = await p.evaluate(() => { const t = document.querySelector("#product-information article"); return { len: t ? t.textContent.replace(/\s+/g, " ").trim().length : 0 }; });
  await ctx.close();
}
// Fixtur: filtrerad seriedestination med ≥ 2 andra.
if (which === "after") {
  const ctx = await ctxFor(b, 1440, 900, { which });
  await ctx.route(/alla-cartridges\?filters=Serie_Magic/, async route => { try { const res = await route.fetch({ url: "https://hazeyse.nyehandel.se/sv/categories/m-s-buds?preview=v9kzdmqz4w60l5n" }); return await route.fulfill({ response: res }); } catch (e) {} });
  const p = await open(ctx, PRODUCTS[92].route); await ready(p, 6000);
  await p.evaluate(() => document.getElementById("liknande") ? 0 : scrollTo({ top: document.documentElement.scrollHeight * .6, behavior: "instant" })); await p.waitForTimeout(3000);
  R.fixture = await p.evaluate(SIM); console.log("fixture", JSON.stringify(R.fixture));
  await ctx.close();
}
fs.writeFileSync(`${DIR}/runs/final-${which}.json`, JSON.stringify(R, null, 1));
await b.close();
