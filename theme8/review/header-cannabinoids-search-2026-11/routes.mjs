// TASK 02 förberedelse: verifierad destinationskarta för Cannabinoider-menyn.
// Läser varje kandidat-route i Theme 8-previewn via Nyehandels egen HTML
// (status, slutlig URL, H1, #products_count, första produktnamnen). Inget skrivs.
import fs from "node:fs"; import path from "node:path";
import { chromium, ctxFor, open, ready } from "../catalog-reconciliation-2026-11/lib/harness.mjs";
const DIR = path.dirname(new URL(import.meta.url).pathname);
const CANDIDATES = ["thca-b", "thcab-vapes", "thcba", "thcba-vapes", "d10-1", "d10-vapes", "d10-buds", "d10-hash", "nano-11", "nano11-blommor",
  "cbd", "cbd-vapes", "cbd-buds-1", "h4cbd", "h4cbd-hasch", "h4cbd-vape", "cbn", "cbg", "thcv", "thcv-vape", "hhcpm", "hhcpm-vapes", "thcnm", "thcnm-blommor", "thcnm-hash",
  "magic-sauce", "hero-vapes", "thca", "thcb", "10-oh-thc", "cannabinoider", "alla-produkter"];
const b = await chromium.launch(); const ctx = await ctxFor(b, 1440, 900, { which: "after" });
const p = await open(ctx, "/sv/categories/alla-produkter"); await ready(p, 2000);
const out = await p.evaluate(async (list) => {
  const res = {};
  for (const slug of list) {
    try {
      const r = await fetch("/sv/categories/" + slug, { credentials: "same-origin", redirect: "follow" });
      const html = await r.text(); const d = new DOMParser().parseFromString(html, "text/html");
      const cnt = d.querySelector("#products_count"); const names = [...d.querySelectorAll(".product-card .title, .product-item .title, [class*=product] h3, [class*=product] .name")].map(x => x.textContent.trim()).filter(Boolean);
      res[slug] = { status: r.status, final: new URL(r.url).pathname, h1: (d.querySelector("h1") || {}).textContent?.trim() || null, count: cnt ? (cnt.getAttribute("value") || cnt.textContent).trim() : null, names: [...new Set(names)].slice(0, 6) };
    } catch (e) { res[slug] = { error: String(e) }; }
  }
  return res;
}, CANDIDATES);
fs.writeFileSync(path.join(DIR, "evidence/routes.json"), JSON.stringify(out, null, 1));
for (const [k, v] of Object.entries(out)) console.log(k.padEnd(16), v.status, v.final === "/sv/categories/" + k ? "" : "→" + v.final, "|", v.h1, "|", v.count, "|", (v.names || []).slice(0, 3).join(" ; "));
await b.close();
