// SEO-jämförelse för MS 2 ml: (A) serverns HTML utan JavaScript, (B) Nyehandels
// Vue körs men Theme 8-skriptet är blockerat, (C) renderad pilot (lokal build).
import { chromium, ctxFor, open, URL_ } from "../pdp-pilot-2026-10/lib.mjs";
import fs from "node:fs"; import path from "node:path";
const DIR = path.dirname(new URL(import.meta.url).pathname);
const PDP = "/sv/products/vape-magic-sauce-magic-farmers-2ml/454";
const PHRASES = ["Magic Sauce 3.0 - 2ml Vape från Magic Farmers", "senaste generationen av Magic Farmers", "Vad är Magic Sauce 3.0?", "Om Magic Farmers", "En laglig cannabis", "Produkttyp", "LABBTEST Gorilla Cookies", "Laglighet och ansvar", "Rapporten om cannabisbruks effekter", "Specifikationer", "Vanliga frågor om Magic Sauce 3.0", "Labbrapporter", "Upptäck fler vapes", "Gorilla Cookies", "Tinky Winky"];
const LINKS = ["/sv/categories/ms-vapes", "/sv/categories/magic-sauce", "/sv/brand/magic-farmers", "/sv/categories/magic-farmers", "/sv/categories/alla-vapes", "/sv/products/magic-sauce-vape-5ml", "/sv/page/kontakt", "/sv/page/faq", "/sv/page/kop-och-leveransvillkor", "COA_Disposable-Vape-pen-Gorilla-Cookies"];
const measure = ([PHRASES, LINKS]) => {
  const vis = e => e && e.checkVisibility ? e.checkVisibility({ visibilityProperty: true, opacityProperty: true }) : !!(e && e.offsetParent);
  const txt = e => e.textContent.replace(/\s+/g, " ").trim();
  const heads = [...document.querySelectorAll("h1,h2,h3,h4")].filter(h => !h.closest("header,footer,#store-header,.hz8-footer,nav,.hz8-mnav,[class*='minicart'],#cartAside")).map(h => ({ tag: h.tagName, level: h.getAttribute("aria-level") || "", text: txt(h).slice(0, 70), visible: vis(h), hidden: h.hidden }));
  const main = document.querySelector("#store-main, main") || document.body;
  const allText = main.textContent.replace(/\s+/g, " ");
  const findVis = p => { const w = document.createTreeWalker(main, NodeFilter.SHOW_TEXT); let n; while ((n = w.nextNode())) if (n.textContent.replace(/\s+/g, " ").includes(p.slice(0, 30))) return vis(n.parentElement) ? "synlig" : "i DOM, dold"; return allText.includes(p) ? "i DOM (delad nod)" : "saknas"; };
  const anchors = [...main.querySelectorAll("a[href]")];
  return {
    title: document.title, canonical: document.querySelector('link[rel=canonical]')?.getAttribute("href"), robots: document.querySelector('meta[name=robots]')?.content || "(saknas)",
    metaDesc: document.querySelector('meta[name=description]')?.content,
    ld: [...document.querySelectorAll('script[type="application/ld+json"]')].map(s => { try { const j = JSON.parse(s.textContent); return j["@type"] + (j.aggregateRating ? "+aggregateRating" : "") + (j.offers ? "+offers" : ""); } catch { return "?"; } }),
    h1: heads.filter(h => h.tag === "H1"), heads,
    phrases: PHRASES.map(p => [p, findVis(p)]),
    links: LINKS.map(l => { const a = anchors.filter(x => x.getAttribute("href").includes(l)); return [l, a.length ? (a.some(vis) ? "synlig länk" : "länk i DOM, dold") : "saknas"]; }),
    linkCount: anchors.length, words: allText.split(" ").length
  };
};
const browser = await chromium.launch({ channel: "chrome", headless: true });
const out = {};
// A: ingen JavaScript alls
{ const ctx = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 1440, height: 900 } });
  const p = await ctx.newPage(); await p.goto(URL_(PDP), { waitUntil: "domcontentloaded" }); await p.waitForTimeout(1500);
  out.A_utanJS = await p.evaluate(measure, [PHRASES, LINKS]); await p.screenshot({ path: path.join(DIR, "shots", "seo-A-utan-js-1440.jpg"), fullPage: true, type: "jpeg", quality: 60 }); await ctx.close(); }
// B: Theme 8-skriptet blockerat, Nyehandel/Vue körs
{ const ctx = await ctxFor(browser, 1440, 900, { scale: 1 });
  await ctx.route(/theme8\/hazey-theme8\.min\.js/, r => r.abort());
  const p = await open(ctx, URL_(PDP)); await p.waitForTimeout(6000);
  out.B_utanTheme8JS = await p.evaluate(measure, [PHRASES, LINKS]); await p.screenshot({ path: path.join(DIR, "shots", "seo-B-utan-theme8-js-1440.jpg"), fullPage: true, type: "jpeg", quality: 60 }); await ctx.close(); }
// C: renderad pilot
{ const ctx = await ctxFor(browser, 1440, 900, { scale: 1 });
  const p = await open(ctx, URL_(PDP)); await p.waitForSelector(".hz8-pcx-sa__item", { timeout: 30000 }); await p.waitForTimeout(5000);
  out.C_pilot = await p.evaluate(measure, [PHRASES, LINKS]); await ctx.close(); }
// Rå HTML (utan cookies/preview): vad en crawler hämtar på den kanoniska adressen
const raw = await (await fetch("https://hazeyse.nyehandel.se" + PDP.replace(/\/454$/, ""), { headers: { "User-Agent": "Mozilla/5.0 (compatible; seo-check)" } })).text();
out.raw = { bytes: raw.length, hasDescription: raw.includes("senaste generationen av Magic Farmers"), h1: (raw.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i) || [])[1]?.replace(/<[^>]+>/g, "").trim(), robots: (raw.match(/<meta name="robots" content="([^"]+)"/i) || [])[1] || "(saknas)", canonical: (raw.match(/<link rel="canonical" href="([^"]+)"/i) || [])[1], xRobots: null };
fs.writeFileSync(path.join(DIR, "seo.json"), JSON.stringify(out, null, 1));
for (const k of ["A_utanJS", "B_utanTheme8JS", "C_pilot"]) {
  const r = out[k]; console.log("\n=== " + k, "| canonical", r.canonical, "| robots", r.robots, "| ld", r.ld.join(","), "| länkar", r.linkCount, "| ord", r.words);
  console.log("H1:", JSON.stringify(r.h1));
  console.log("Rubriker:", r.heads.filter(h => h.tag !== "H1").map(h => `${h.tag}${h.level ? "/" + h.level : ""}${h.visible ? "" : "(dold)"} ${h.text}`).join(" | "));
  console.log("Fraser:", r.phrases.map(p => p[0].slice(0, 28) + "=" + p[1]).join(" ; "));
  console.log("Länkar:", r.links.map(l => l[0].split("/").pop() + "=" + l[1]).join(" ; "));
}
console.log("\nRÅ:", JSON.stringify(out.raw));
await browser.close();
