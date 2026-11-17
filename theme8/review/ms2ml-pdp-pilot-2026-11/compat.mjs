// Kompatibilitetskontroll, bara läsande: Hero's Core (255) och fixtures.
// Ingen ändring i repo-innehåll eller Nyehandel. Testposten för 255/260 läggs
// till ENDAST i testflikens kopia av bundeln (route) och finns inte i koden.
import { chromium, ctxFor, open, URL_, ROOT } from "../pdp-pilot-2026-10/lib.mjs";
import fs from "node:fs"; import path from "node:path";
const DIR = path.dirname(new URL(import.meta.url).pathname), OUT = path.join(DIR, "shots", "r5-compat"); fs.mkdirSync(OUT, { recursive: true });
const BUNDLE = fs.readFileSync(path.join(ROOT, "dist/theme8/hazey-theme8.min.js"), "utf8");
const entry = (id, h, secs) => `;(function(){var H=window.HZ8;if(!H||!H.pdpContent)return;var b=H.pdpContent[261];H.pdpContent[${id}]=Object.assign({},b,{
  summary:{h:${JSON.stringify(h)},text:"FIXTUR: {name} är en {type} från {brand}. Den finns i {count} varianter, bland annat {some}."},
  strains:{h:"Varianter och analys",lead:"FIXTUR: alla varianter, tre åt gången."},
  analysis:{h:"Labbrapporter",text:"FIXTUR: {docs} PDF-dokument i produktbeskrivningen."},
  chapter:Object.assign({},b.chapter,{h:"FIXTUR: Om produkten",image:null,sections:${secs}}),
  compare:null,factcheck:[]});})();`;
const SCEN = [
  { key: "hero-standard", path: "/sv/products/thc-x-vape-hero-core-2ml", inject: "" },
  { key: "hero-fixtur", path: "/sv/products/thc-x-vape-hero-core-2ml", inject: entry(255, "FIXTUR: Vad är Hero's Core?", "[{col:'a',match:[/^hero core vape/i,/^vad är core/i]}]") },
  { key: "hero-fixtur-utan-pdf", path: "/sv/products/thc-x-vape-hero-core-2ml", inject: entry(255, "FIXTUR: Vad är Hero's Core?", "[{col:'a',match:[/^hero core vape/i,/^vad är core/i]}]"), stripPdf: true },
  { key: "ms5ml-fixtur", path: "/sv/products/magic-sauce-vape-5ml", inject: entry(260, "FIXTUR: Vad är Magic Sauce 3.0 – 5 ml?", "[{col:'a',match:[/vape från magic farmers/i,/^vad är magic sauce/i]},{col:'b',match:[/^om magic farmers/i]}]") },
  { key: "ms2ml-langa-namn", path: "/sv/products/vape-magic-sauce-magic-farmers-2ml/454", inject: "", longNames: true }
];
const b = await chromium.launch({ channel: "chrome", headless: true }); const R = {};
for (const sc of SCEN) for (const [w, h] of [[393, 852], [1440, 900]]) {
  const ctx = await ctxFor(b, w, h, { scale: w < 768 ? 2 : 1 });
  if (sc.inject) await ctx.route(/theme8\/hazey-theme8\.min\.js/, r => r.fulfill({ body: BUNDLE + sc.inject, contentType: "application/javascript" }));
  if (sc.stripPdf) await ctx.route(u => /\/products\/thc-x-vape-hero-core-2ml/.test(u.pathname), async r => { if (r.request().resourceType() !== "document") return r.continue(); const res = await r.fetch(); let t = await res.text(); t = t.replace(/<a[^>]+\.pdf[^>]*>[\s\S]*?<\/a>/gi, ""); r.fulfill({ response: res, body: t }); });
  const p = await open(ctx, URL_(sc.path));
  await p.waitForSelector(".hz8-pp", { timeout: 30000 }).catch(() => {}); await p.waitForTimeout(6000);
  if (sc.longNames) await p.evaluate(() => { const L = ["Jordgubbs- och rabarberkräm med vaniljsås", "Blåbärspaj från farmors trädgård – Indica", "Citronmarängsmördegskaka – Sativa"]; document.querySelectorAll(".hz8-pcx-sa__name").forEach((n, i) => { if (i < 3) n.textContent = L[i]; }); });
  const info = await p.evaluate(() => {
    const t = s => [...document.querySelectorAll(s)].map(e => e.textContent.replace(/\s+/g, " ").trim());
    return { authored: document.documentElement.classList.contains("hz8-pdp-authored"), h1: t("h1"), strains: t(".hz8-pcx-sa__name").length, pos: t(".hz8-pcx-sa__pos")[0] || "", tiles: t(".hz8-pp__tile-name").length,
      docs: t(".hz8-pcx-ana__t"), anaLead: t(".hz8-pcx-ana__lead")[0] || "", anaNote: t(".hz8-pcx-ana__note")[0] || "",
      sumLead: t(".hz8-pcx-sum__lead")[0] || "", colA: t(".hz8-pcx-ch__col--a h2, .hz8-pcx-ch__col--a h3, .hz8-pcx-ch__col--a h4"), colB: t(".hz8-pcx-ch__col--b h2, .hz8-pcx-ch__col--b h3, .hz8-pcx-ch__col--b h4"),
      fullHeads: t(".hz8-pcx-full__text h2, .hz8-pcx-full__text h3, .hz8-pcx-full__text h4"),
      faqShown: [...document.querySelectorAll(".hz8-pcx-faq__item")].filter(d => !d.hidden).length, faqHidden: [...document.querySelectorAll(".hz8-pcx-faq__item")].filter(d => d.hidden).map(d => d.querySelector("h3").textContent),
      packs: t(".hz8-pc .hz8-pc__q"), carousel: t(".hz8-pcx-more__name").length, rating: !!document.querySelector(".hz8-pp__rating"), reviews: !!document.querySelector("#omdomen .hz8-pr"),
      docW: document.documentElement.scrollWidth, vw: innerWidth };
  });
  info.errors = p.errors.slice(0, 5); R[`${sc.key}-${w}`] = info;
  if (info.authored) {
    const vis = () => p.evaluate(() => { const L = document.querySelector(".hz8-pcx-sa__list"), lr = L.getBoundingClientRect(); return [...L.children].filter(li => { const r = li.getBoundingClientRect(); return (Math.min(r.right, lr.right) - Math.max(r.left, lr.left)) / r.width > .95; }).map(li => li.classList.contains("hz8-pcx-sa__filler") ? "(tom cell)" : li.textContent.replace(/\s+/g, " ").trim()); });
    await p.locator("#hz8-pcx-strains").scrollIntoViewIfNeeded();
    if (await p.locator(".hz8-pcx-sa__arrow[data-dir='1']").isEnabled()) { await p.locator(".hz8-pcx-sa__arrow[data-dir='1']").click(); await p.waitForTimeout(900); info.group2 = await vis(); info.group2next = await p.locator(".hz8-pcx-sa__arrow[data-dir='1']").isEnabled();
      await p.locator("#hz8-pcx-strains").screenshot({ path: path.join(OUT, `${sc.key}-${w}-grupp2.jpg`), type: "jpeg", quality: 82 }); await p.locator(".hz8-pcx-sa__arrow[data-dir='-1']").click(); await p.waitForTimeout(700); }
  }
  const sel = info.authored ? "#hz8-pcx-strains" : ".hz8-ppc";
  const box = await p.evaluate(s => { const e = document.querySelector(s); if (!e) return null; const r = e.getBoundingClientRect(); return [r.top + scrollY, r.height]; }, sel);
  if (box) { const H = await p.evaluate(() => document.documentElement.scrollHeight); await p.setViewportSize({ width: w, height: H }); await p.waitForTimeout(700); await p.screenshot({ path: path.join(OUT, `${sc.key}-${w}.jpg`), clip: { x: 0, y: Math.max(0, box[0] - 20), width: w, height: Math.min(box[1] + 40, 1600) }, type: "jpeg", quality: 82 }); }
  await ctx.close();
}
fs.writeFileSync(path.join(OUT, "compat.json"), JSON.stringify(R, null, 1)); console.log(JSON.stringify(R, null, 1)); await b.close();
