// TASK 01D -- läser de verkliga formatroutes för Buds och Hasch ur den
// levande kategorikartan (HZ8.catalog) och sidans egna länkar.
import { chromium, ctxFor, open, ready, DIR, ROUTES } from "./lib.mjs"; import fs from "node:fs";
const b = await chromium.launch(); const ctx = await ctxFor(b, 393, 852, { which: "after" });
const p = await open(ctx, ROUTES["alla-vapes"]); await ready(p, 4000);
const r = await p.evaluate(async () => {
  const links = [...document.querySelectorAll("a[href*='/categories/']")].map(a => a.href.split("?")[0].replace(/^https?:\/\/[^/]+/, "")).filter((v, i, a) => a.indexOf(v) === i);
  const ctxs = {}; for (const l of links) { try { const c = HZ8.catalog.contextFor(l); if (c && c.type === "format") ctxs[l] = { key: c.format && c.format.key, href: c.format && c.format.href }; } catch (e) {} }
  const fmt = {}; for (const k of ["buds", "hasch", "vapes"]) { try { const f = HZ8.catalog.formatByKey(k); fmt[k] = f && (f.href || f); } catch (e) { fmt[k] = String(e); } }
  return { fmt, ctxs };
});
console.log(JSON.stringify(r, null, 1)); fs.writeFileSync(`${DIR}/runs/routes-probe.json`, JSON.stringify(r, null, 1)); await b.close();
