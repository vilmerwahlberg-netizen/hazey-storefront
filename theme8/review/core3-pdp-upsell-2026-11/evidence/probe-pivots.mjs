// TASK 20 v4: paketsidornas adress (slug enligt Nyehandels mönster) + serverrenderade paketrader. Läsande.
import fs from "node:fs"; import path from "node:path";
import { chromium, ctxFor, open, ready } from "../../catalog-reconciliation-2026-11/lib/harness.mjs";
const DIR = path.dirname(new URL(import.meta.url).pathname);
const NAMES = JSON.parse(fs.readFileSync(path.join(DIR, "probe-packages.json"), "utf8")).packages;
const slugs = n => { const base = n.toLowerCase().replace(/['’]/g, "").replace(/[åä]/g, "a").replace(/ö/g, "o");
  return [...new Set([base.replace(/[^a-z0-9]+/g, "-"), base.replace(/\./g, "").replace(/[^a-z0-9]+/g, "-")].map(s => s.replace(/^-+|-+$/g, "")))]; };
const b = await chromium.launch(); const ctx = await ctxFor(b, 1440, 1000, { which: "external" });
const p = await open(ctx, "/sv/products/thc-x-vape-hero-core-2ml"); await ready(p, 1500);
const out = {};
for (const [id, P] of Object.entries(NAMES)) {
  out[id] = await p.evaluate(async ({ id, cands }) => {
    for (const s of cands) {
      const r = await fetch("/sv/products/" + s, { credentials: "same-origin", headers: { Accept: "text/html" } });
      if (!r.ok) continue;
      const html = await r.text(); const doc = new DOMParser().parseFromString(html, "text/html");
      const pid = (html.match(/viewProduct\(.(\d+)/) || [])[1];
      const at = (e, n) => e.getAttribute(n) != null ? e.getAttribute(n) : e.getAttribute(":" + n);
      const rows = [...doc.querySelectorAll("package-product-variants, package-product")].map(e => ({ tag: e.tagName.toLowerCase(), product: +at(e, "product-id"), pivot: +at(e, "pivot-id"), locked: at(e, "locked-variant"), qty: +(at(e, "quantity") || 1), selected: +at(e, "selected-variant-id") }));
      return { route: "/sv/products/" + s, status: r.status, viewProductId: pid, rows };
    }
    return { route: null, tried: cands };
  }, { id, cands: slugs(P.name) });
}
fs.writeFileSync(path.join(DIR, "probe-pivots.json"), JSON.stringify(out, null, 2));
for (const [id, r] of Object.entries(out)) console.log(id, r.route, r.viewProductId, r.rows ? r.rows.map(x => `${x.tag === "package-product-variants" ? "V" : "L"}:${x.product}/p${x.pivot}/${x.locked}/q${x.qty}`).join(" ") : JSON.stringify(r.tried));
await b.close();
