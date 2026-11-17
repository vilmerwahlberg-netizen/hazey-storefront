// Radvis täckning: varje textrad och länk i serverns produktbeskrivning (rå
// HTML) -> var den hamnar i piloten (öppen yta / Full produktinformation /
// dold) och om den är synlig. Skriver coverage.md.
import { chromium, ctxFor, open, URL_ } from "./pdp-pilot-2026-10/lib.mjs";
import fs from "node:fs"; import path from "node:path";
const DIR = process.env.OUT;
const PDP = process.env.ROUTE;
const browser = await chromium.launch({ channel: "chrome", headless: true });
// 1) Original: serverns HTML, tolkad utan JavaScript
const c0 = await browser.newContext({ javaScriptEnabled: false });
const p0 = await c0.newPage(); await p0.goto(URL_(PDP), { waitUntil: "domcontentloaded" });
const orig = await p0.evaluate(() => {
  const lines = [], links = [];
  const roots = [["Kort beskrivning", document.querySelector(".product-detail__information .short-description")], ["Produktbeskrivning", document.querySelector("#product-information")]];
  for (const [src, r] of roots) {
    if (!r) continue;
    const t = r.innerText || ""; // utan layout: dela på blockgränser själv
    const html = r.innerHTML.replace(/<(br|\/p|\/li|\/h\d|\/div|\/ul)[^>]*>/gi, "\n").replace(/<[^>]+>/g, "").replace(/&nbsp;/g, " ").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&amp;/g, "&");
    html.split("\n").map(s => s.replace(/\s+/g, " ").trim()).filter(s => s.length > 1).forEach(s => lines.push({ src, text: s }));
    r.querySelectorAll("a[href]").forEach(a => links.push({ src, text: a.textContent.replace(/\s+/g, " ").trim(), href: a.getAttribute("href") }));
  }
  const nav = [...document.querySelectorAll(".related-categories a[href], .designer-breadcrumbs a[href], .breadcrumbs a[href], .product-detail__information .brand a[href]")].map(a => ({ src: "Sidans länkar", text: a.textContent.replace(/\s+/g, " ").trim(), href: a.getAttribute("href") }));
  return { lines, links: links.concat(nav) };
});
await c0.close();
// 2) Piloten
const ctx = await ctxFor(browser, 1440, 900, { scale: 1 });
const p = await open(ctx, URL_(PDP));
await p.waitForSelector(".hz8-pcx-sa__item", { timeout: 30000 }); await p.waitForTimeout(5000);
const res = await p.evaluate(({ lines, links }) => {
  const vis = e => e.checkVisibility({ visibilityProperty: true });
  const where = el => {
    if (!el) return "saknas";
    if (el.closest("#hz8-pcx-full")) return "Full produktinformation (stängd)";
    if (el.closest(".hz8-pcx-ch__col--a")) return "Om-kapitlet, vänster (öppen)";
    if (el.closest(".hz8-pcx-ch__col--b")) return "Om-kapitlet, höger (öppen)";
    if (el.closest("#hz8-pcx-strains")) return "Strains och analys";
    if (el.closest(".related-categories")) return "Relaterade kategorier";
    if (el.closest(".designer-breadcrumbs, .breadcrumbs")) return "Brödsmulor";
    if (el.closest(".product-detail__information")) return "Köpdelen";
    return el.closest("[class]")?.className.split(" ")[0] || "?";
  };
  const norm = s => s.replace(/\s+/g, " ").trim();
  const texts = [];
  const w = document.createTreeWalker(document.querySelector("#store-main"), NodeFilter.SHOW_ELEMENT);
  let n; while ((n = w.nextNode())) if (n.children.length === 0 || /^(P|LI|H\d|DIV|STRONG|B|A)$/.test(n.tagName)) texts.push(n);
  const findEl = (t, src) => {
    const key = norm(t).slice(0, 48);
    let best = null;
    /* Produktbeskrivningens rader söks först i kapitlen (samma lista finns
       också i den dolda korta beskrivningen i köpdelen). */
    const pool = src === "Produktbeskrivning" && texts.some(el => el.closest("#hz8-pcx-om, #hz8-pcx-strains") && norm(el.textContent).includes(key)) ? texts.filter(el => el.closest("#hz8-pcx-om, #hz8-pcx-strains")) : texts;
    for (const el of pool) { const tx = norm(el.textContent); if (tx.includes(key) && (!best || tx.length < norm(best.textContent).length)) best = el; }
    return best;
  };
  const L = lines.map(l => { const el = findEl(l.text, l.src); const head = el && el.closest("[data-hz8-merged-heading]"); return { ...l, where: where(el), state: !el ? "SAKNAS" : head ? "dold rubrik (dubblett)" : el.closest("#hz8-pcx-full") ? (el.closest("[hidden]") ? "dold" : "i DOM, bakom klick") : vis(el) ? "synlig" : (el.closest("[hidden]") ? "dold" : "i DOM, ej synlig") }; });
  const A = links.map(l => { const a = [...document.querySelectorAll("#store-main a[href]")].filter(x => x.getAttribute("href").split("?")[0] === l.href.split("?")[0] || x.href.split("?")[0] === new URL(l.href, location.href).href.split("?")[0]); const v = a.filter(x => vis(x) || x.closest("#hz8-pcx-full")); return { ...l, count: a.length, where: [...new Set(a.map(where))].join(" + ") || "saknas", state: !a.length ? "SAKNAS" : a.some(vis) ? "synlig" : v.length ? "bakom klick" : "dold" }; });
  return { L, A };
}, orig);
await ctx.close(); await browser.close();
const esc = s => String(s).replace(/\|/g, "\\|");
let md = "# Täckning: serverns produkttext → piloten (genererad av coverage.mjs)\n\n" + new Date().toISOString().slice(0, 16) + " · 1440 px · lokal build\n\n## Textrader\n\n| # | Källa | Rad (förkortad) | Var i piloten | Läge |\n|---|---|---|---|---|\n";
res.L.forEach((l, i) => { md += `| ${i + 1} | ${l.src} | ${esc(l.text.slice(0, 90))}${l.text.length > 90 ? "…" : ""} | ${l.where} | ${l.state} |\n`; });
md += "\n## Länkar\n\n| # | Källa | Länktext | Mål | Antal i piloten | Var | Läge |\n|---|---|---|---|---|---|---|\n";
res.A.forEach((l, i) => { md += `| ${i + 1} | ${l.src} | ${esc(l.text)} | ${esc(l.href.replace(/^https:\/\/[^/]+/, "").slice(0, 70))} | ${l.count} | ${l.where} | ${l.state} |\n`; });
fs.writeFileSync(path.join(DIR, "COVERAGE.md"), md);
console.log(md);
console.log("SAKNAS:", res.L.filter(l => l.state === "SAKNAS").length + res.A.filter(l => l.state === "SAKNAS").length);
