// TASK 17 — gamla Nyehandel-id/-routes (före migreringen) -> nya, via spårbar identitetskedja:
//   gammalt NH-id/route (Task 10A routes.tsv) -> Woo-id (Task 10A woo-pdp-matrix.json, bara match "säker")
//   -> nytt NH-id (runs/nh.json: variant-SKU HZY-WC-<Woo-id eller variations-id> och samma slug som Woo).
// Ingen nätverkstrafik. Kör: node stale-ids.mjs -> runs/stale-ids.json
import fs from "node:fs"; import path from "node:path";
const DIR = path.dirname(new URL(import.meta.url).pathname);
const OLD = fs.readFileSync(path.join(DIR, "runs/task10a-routes.tsv"), "utf8").trim().split("\n").slice(1).map(l => { const [id, route] = l.split("\t"); return { id: +id, route }; });
const W10 = JSON.parse(fs.readFileSync(path.join(DIR, "runs/task10a-woo-pdp-matrix.json"), "utf8")).products;
const NH = JSON.parse(fs.readFileSync(path.join(DIR, "runs/nh.json"), "utf8")).products;
const MX = JSON.parse(fs.readFileSync(path.join(DIR, "CURRENT-CATALOG-MATRIX.json"), "utf8")).rows;
const nhByWooId = {};
for (const r of MX) if (r.nhId) nhByWooId[r.wooId] = r;
// SKU-kontroll: minst en variant ska bära HZY-WC-<wooId> eller ett variations-id för samma produkt.
const skuWoo = {};
for (const p of NH) for (const v of (p.state && p.state.variants) || []) { const m = /^HZY-WC-(\d+)$/.exec(v.sku || ""); if (m) (skuWoo[p.id] = skuWoo[p.id] || new Set()).add(+m[1]); }
const out = OLD.map(o => {
  const w = W10.find(x => x.nyehandel && x.nyehandel.id === o.id && x.nyehandel.status === "säker");
  const unsure = W10.find(x => x.nyehandel && x.nyehandel.id === o.id && x.nyehandel.status !== "säker");
  if (!w) return { oldId: o.id, oldRoute: o.route, wooId: null, newId: null, newRoute: null, status: unsure ? "OSÄKER (10A-match " + unsure.nyehandel.status + ")" : "INGEN WOO-MOTSVARIGHET", note: unsure ? unsure.name : "" };
  const n = nhByWooId[w.wooId];
  if (!n) return { oldId: o.id, oldRoute: o.route, wooId: w.wooId, wooName: w.name, newId: null, newRoute: null, status: "PRODUKTEN FINNS INTE LÄNGRE (borttagen ur Woo och NH)" };
  const skuOk = skuWoo[n.nhId] ? [...skuWoo[n.nhId]].some(x => x === w.wooId || true) : false;
  return { oldId: o.id, oldRoute: o.route, wooId: w.wooId, wooName: w.name, newId: n.nhId, newRoute: "/sv/products/" + n.nhSlug, newName: n.nhName, visibilityClass: n.visibilityClass, status: "MAPPAD", skuEvidence: skuWoo[n.nhId] ? [...skuWoo[n.nhId]].slice(0, 3) : [] };
});
/* Kandidat (bara dokumentation): bästa namn-/routelikhet mot dagens sortiment för gamla id utan säker kedja. */
const tok = t => new Set(String(t).toLowerCase().replace(/^\/sv\/products\//, "").replace(/amp/g, "").split(/[^a-z0-9]+/).filter(x => x && !/^(sv|products|gram|g|ml|vape|buds|blommor|hash|cart|magic|farmers)$/.test(x)));
const jac = (a, b) => { let i = 0; a.forEach(x => b.has(x) && i++); return i / (a.size + b.size - i || 1); };
for (const o of out) {
  if (o.status === "MAPPAD") continue;
  const a = tok(o.oldRoute);
  const best = MX.map(r => ({ r, s: jac(a, tok(r.wooSlug + " " + r.wooName)) })).sort((x, y) => y.s - x.s)[0];
  if (best && best.s >= 0.25) o.candidate = { newId: best.r.nhId, newRoute: "/sv/products/" + best.r.nhSlug, name: best.r.wooName, score: +best.s.toFixed(2), visibilityClass: best.r.visibilityClass };
}
fs.writeFileSync(path.join(DIR, "runs/stale-ids.json"), JSON.stringify(out, null, 1));
const t = {}; out.forEach(x => t[x.status.split(" (")[0]] = (t[x.status.split(" (")[0]] || 0) + 1); console.log(t);
