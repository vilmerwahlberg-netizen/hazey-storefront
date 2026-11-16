// Hubbens interna länkar mot RÄTT innehåll och ankare i Theme 8-preview (riktiga
// sidor i Nyehandel, ingen fixtur). Läser bara. 200 räcker inte: varje mål ska
// visa förväntad H1, ankaret ska finnas och kategorier ska ha produkter av rätt serie.
// Kör: node theme8/review/rattslage-hub-2026-11/check-links.mjs
import { chromium } from "playwright"; import fs from "node:fs"; import path from "node:path";
const DIR = path.dirname(new URL(import.meta.url).pathname);
const BASE = "https://hazeyse.nyehandel.se", PREVIEW = "v9kzdmqz4w60l5n";
const block = fs.readFileSync(path.join(DIR, "../../blocks/rattslage.html"), "utf8").replace(/<!--[\s\S]*?-->/g, "");
const hrefs = [...new Set([...block.matchAll(/href="(\/[^"]*)"/g)].map(m => m[1]))];
// Förväntat innehåll per mål
const EXPECT = {
  "/sv/page/thca": { h1: /^THCA$/ }, "/sv/page/thca#alternativ": { h1: /^THCA$/, anchor: /Alternativ till THCA/ },
  "/sv/page/thcb": { h1: /^THCB$/ }, "/sv/page/thch": { h1: /^THCH$/ }, "/sv/page/hhc": { h1: /^HHC$/ },
  "/sv/page/hhc#fragor": { h1: /^HHC$/, anchor: /Vad är HHCP\?/ },
  "/sv/categories/magic-sauce": { h1: /magic sauce/i, products: /magic sauce/i },
  "/sv/categories/nano-11": { h1: /nano/i, products: /nano ?11/i },
  "/sv/page/faq": { h1: /faq|vanliga frågor/i }, "/sv/posts": { h1: /.+/, posts: true }
};
const extra = ["/sv/categories/nano"]; // den tidigare, felaktiga länken – som jämförelse
const b = await chromium.launch({ channel: "chrome" }); const ctx = await b.newContext({ viewport: { width: 1440, height: 900 } });
const out = [];
for (const href of [...hrefs, ...extra]) {
  const [p0, hash] = href.split("#"); const p = await ctx.newPage();
  const resp = await p.goto(`${BASE}${p0}?preview=${PREVIEW}${hash ? "#" + hash : ""}`, { waitUntil: "domcontentloaded", timeout: 60000 });
  await p.waitForFunction(() => document.documentElement.classList.contains("hz8") && !document.documentElement.classList.contains("hz8-boot"), null, { timeout: 45000 }).catch(() => {});
  await p.waitForTimeout(3500);
  const d = await p.evaluate(hash => {
    const vis = e => !!(e && (e.offsetWidth || e.offsetHeight)); const txt = e => e ? e.textContent.replace(/\s+/g, " ").trim() : "";
    const a = hash ? document.getElementById(hash) : null;
    const cards = [...document.querySelectorAll(".product-card, [class*=product-card]")].filter(vis);
    const cardRoots = [...document.querySelectorAll(".product-card")].filter(vis);
    const names = [...new Set(cardRoots.map(c => txt(c).slice(0, 90)))].filter(Boolean);
    return { finalPath: location.pathname, h1: [...document.querySelectorAll("h1")].filter(vis).map(txt), title: document.title,
      anchor: hash ? (a ? txt(a) : null) : undefined, count: txt(document.querySelector("#products_count")) || null,
      cards: cardRoots.length, names, posts: document.querySelectorAll("a[href*='/sv/post/']").length };
  }, hash);
  const e = EXPECT[href]; const prob = [];
  if (resp.status() !== 200) prob.push("HTTP " + resp.status());
  if (d.finalPath !== p0) prob.push("hamnar på " + d.finalPath);
  if (e) {
    if (e.h1 && !d.h1.some(h => e.h1.test(h))) prob.push("H1 " + JSON.stringify(d.h1));
    if (e.anchor && !(d.anchor && e.anchor.test(d.anchor))) prob.push("ankaret saknas eller fel innehåll");
    if (e.products) { if (!d.cards) prob.push("inga produkter"); else { const bad = d.names.filter(n => !e.products.test(n)); if (bad.length) prob.push(bad.length + " av " + d.names.length + " kort utan serienamnet: " + bad.slice(0, 3).join(" | ")); } }
    if (e.posts && !d.posts) prob.push("inga artiklar");
  }
  const r = { href, status: resp.status(), ...d, ok: e ? !prob.length : null, problem: prob };
  out.push(r); console.log(href.padEnd(30), e ? (prob.length ? "FEL: " + prob.join("; ") : "ok") : "(jämförelse)", "|", d.h1.join("/"), d.anchor ? "| #" + d.anchor.slice(0, 40) : "", d.cards ? `| ${d.cards} kort, ${d.names.length} unika, ${d.count || ""}` : "", d.posts ? `| ${d.posts} artikellänkar` : "");
  await p.close();
}
fs.writeFileSync(path.join(DIR, "check-links.json"), JSON.stringify({ checkedAt: new Date().toISOString(), results: out }, null, 1));
await b.close();
