// TASK 25b — sond: Magic Sauce/D10 buds- och haschkatalog + vad PDP:erna renderar idag. Läser bara.
import fs from "node:fs"; import path from "node:path";
import { chromium, ctxFor, open, ready, url } from "../../catalog-reconciliation-2026-11/lib/harness.mjs";
const DIR = path.dirname(new URL(import.meta.url).pathname);
const b = await chromium.launch(); const ctx = await ctxFor(b, 1440, 1000, { which: "after" });
const p = await open(ctx, "/sv/categories/m-s-buds"); await ready(p, 8000);
const cats = ["m-s-buds", "ms-buds", "m-s-hash", "ms-hash", "d10-buds", "d10-hash", "d10-1", "d10-vapes", "ms-vapes", "magic-sauce"];
const out = await p.evaluate(async cats => {
  const res = {};
  for (const c of cats) {
    const list = [];
    for (let pg = 1; pg < 8; pg++) {
      const r = await fetch("/sv/categories/" + c + (pg > 1 ? "?page=" + pg : ""));
      if (!r.ok) { res[c] = { status: r.status }; break; }
      const d = new DOMParser().parseFromString(await r.text(), "text/html");
      const cs = [...d.querySelectorAll("#category-products .product-card")];
      cs.forEach(x => list.push({ path: new URL(x.querySelector("a[href*='/products/']").href).pathname, name: x.querySelector(".name")?.textContent.trim(), brand: x.querySelector(".brand")?.textContent.trim(), price: x.querySelector(".price")?.textContent.replace(/\s+/g, " ").trim(), img: x.querySelector("img")?.getAttribute("src"), variants: !!x.querySelector(".has-variants") }));
      if (cs.length < 25) { res[c] = { status: 200, h1: d.querySelector("h1")?.textContent.trim(), cards: list }; break; }
    }
  }
  res.catalog = window.HZ8 && HZ8.catalog ? HZ8.catalog.build().series.filter(s => /magic|d10/i.test(s.name)).map(s => ({ name: s.name, hub: s.hub, routes: s.routes })) : null;
  return res;
}, cats);
fs.writeFileSync(path.join(DIR, "probe-catalog.json"), JSON.stringify(out, null, 1));
for (const k of Object.keys(out)) { const v = out[k]; if (k === "catalog") { console.log(JSON.stringify(v)); continue; } console.log("\n##", k, v.status, v.h1 || "", (v.cards || []).length); (v.cards || []).forEach(c => console.log("  ", c.brand, "|", c.name, "|", c.price, "|", c.path, c.variants ? "[var]" : "", c.img ? "" : "[NOIMG]")); }
await b.close();
