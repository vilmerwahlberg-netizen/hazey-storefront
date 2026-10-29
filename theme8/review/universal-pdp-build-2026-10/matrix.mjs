// TASK 10B-4 -- kontrollmatris: förväntat (handoff + Task 10A/Woo-data)
// mot uppmätt (runs/profile-after-*.json, pkg, buy, stale, states).
// Skriver CONTROL-MATRIX.md och runs/control-matrix.json.
// node matrix.mjs
import fs from "node:fs"; import path from "node:path";
import { PRODUCTS } from "./products.mjs";
const DIR = path.dirname(new URL(import.meta.url).pathname);
const J = f => { try { return JSON.parse(fs.readFileSync(`${DIR}/runs/${f}`)); } catch (e) { return null; } };
const prof = { 1440: J("profile-after-1440.json") || [], 393: J("profile-after-393.json") || [] };
const pkg = J("pkg-after.json") || {}, buy = J("buy-after.json") || {}, stale = J("stale-after.json") || {}, states = J("states-after.json") || {};
// Förväntat: klass, modell/etikett, lager, analys, paketregel (null = ingen plan)
const EXP = {
  57: { cls: "strain", model: "strain", label: "strain", stock: "in-stock", analysis: "request", pkg: null },
  88: { cls: "R1 enkel", model: "simple", stock: "in-stock", analysis: "request", pkg: null },
  91: { cls: "R2 strain", model: "strain", label: "strain", stock: "partial", analysis: "variant", pkg: "strain 3/5/9K" },
  84: { cls: "R3 familj", model: "simple", stock: "in-stock", analysis: "product", pkg: "family 3/5/10" },
  17: { cls: "R4 slutsåld", model: "size", label: "vikt", stock: "sold-out", analysis: "request", pkg: null },
  2: { cls: "färg", model: "color", label: "färg", stock: "partial", analysis: "request", pkg: null },
  87: { cls: "doft = Strain", model: "strain", label: "strain", stock: "in-stock", analysis: "request", pkg: null },
  78: { cls: "delvis slut, rea", model: "strain", label: "strain", stock: "partial", analysis: "request", pkg: null },
  92: { cls: "cart, PDF per strain", model: "strain", label: "strain", stock: "in-stock", analysis: "variant", pkg: "strain 3/5/9K" },
  72: { cls: "lång titel", model: "simple", stock: "in-stock", analysis: "request", pkg: null },
  3: { cls: "saknad bild, slutsåld", model: "strain", label: "strain", stock: "sold-out", analysis: "request", pkg: null },
  119: { cls: "rea, fel PDF dold", model: "simple", stock: "in-stock", analysis: "request", pkg: "family 3/5/10" },
  27: { cls: "slutsåld cart", model: "strain", label: "strain", stock: "sold-out", analysis: "request", pkg: null },
  20: { cls: "tjänstepost", adapter: false }
};
const rows = [];
for (const id of Object.keys(EXP)) {
  const e = EXP[id], checks = [], blockers = [];
  for (const w of [1440, 393]) {
    const r = prof[w].find(x => String(x.id) === String(id));
    if (!r) { checks.push([`profil ${w}`, false, "saknas"]); continue; }
    if (e.adapter === false) { checks.push([`ingen adapter ${w}`, !r.adapter, String(r.adapter)]); continue; }
    const P = r.profile || {};
    checks.push([`adapter ${w}`, r.adapter, String(r.adapter)]);
    checks.push([`modell ${w}`, P.variantModel === e.model, P.variantModel]);
    if (e.label) checks.push([`etikett ${w}`, P.optionLabel === e.label && (!r.legend || r.legend.toLowerCase() === "välj " + e.label), r.legend]);
    checks.push([`lager ${w}`, P.stock === e.stock, P.stock]);
    checks.push([`analys ${w}`, P.analysis === e.analysis, P.analysis + (r.report ? " · " + r.report : "")]);
    checks.push([`1 H1 ${w}`, r.h1s === 1, String(r.h1s)]);
    checks.push([`overflow ${w}`, !r.overflowX, String(r.overflowX)]);
    checks.push([`dubbletter ${w}`, !r.duplicates.length, r.duplicates.join(",") || "-"]);
    checks.push([`konsolfel ${w}`, !r.errors.length, String(r.errors.length)]);
    checks.push([`legacy-trappa ${w}`, !r.legacyPackages && !r.packs.length, String(r.packs.length)]);
    if (e.stock === "sold-out") checks.push([`slutsåld: ingen köp-CTA, Bevaka ${w}`, !r.cta && r.bevaka, `${r.cta}/${r.bevaka}`]);
    else checks.push([`köp-CTA ${w}`, /Lägg i varukorgen/.test(r.cta || ""), r.cta]);
    if (e.pkg) { checks.push([`paketprofil ${w}`, (P.packages || {}).status === "BLOCKED", (P.packages || {}).status]); }
  }
  if (e.pkg) blockers.push(`paketprodukter saknas i Nyehandel (${e.pkg}); granskningsläge spärrat`);
  const failed = checks.filter(c => !c[1]);
  const prof1440 = (prof[1440].find(x => String(x.id) === String(id)) || {});
  rows.push({ id: +id, route: PRODUCTS[id].route, cls: e.cls, model: (prof1440.profile || {}).variantModel || "–", label: (prof1440.profile || {}).optionLabel || "–", stock: (prof1440.profile || {}).stock || "–",
    pkgRule: e.pkg || "inga paket (antal)", analysis: (prof1440.profile || {}).analysis || "–", modules: (prof1440.accordions || []).join(" / "),
    status: failed.length ? "FAIL" : e.pkg ? "PASS (paket BLOCKED)" : "PASS", failed: failed.map(c => `${c[0]}: ${c[2]}`), blockers,
    evidence: e.adapter === false ? `proof/control-${id}.jpg` : [88, 91, 84, 17].includes(+id) ? `proof/full-R-${id}-1440.jpg, proof/full-R-${id}-393.jpg` : `proof/control-${id}.jpg` });
}
fs.writeFileSync(`${DIR}/runs/control-matrix.json`, JSON.stringify(rows, null, 1));
const md = ["# Control matrix — universal PDP (Task 10B-4)", "",
  "Measured in the real Theme 8 preview with the local build injected (`profile.mjs`, 1440 and 393). The expected values come from the 10B prompt and the Task 10A/WooCommerce data. **PASS** means every check passed at both widths. **BLOCKED** applies only to package purchases, which wait for real package products in Nyehandel.", "",
  "| Id | Class | Variant model / label | Stock | Package rule | Analysis | Modules (disclosures) | Status | Blocker | Evidence |", "|---:|---|---|---|---|---|---|---|---|---|",
  ...rows.map(r => `| ${r.id} | ${r.cls} | ${r.model} / ${r.label} | ${r.stock} | ${r.pkgRule} | ${r.analysis} | ${r.modules || "–"} | **${r.status}**${r.failed.length ? "<br>" + r.failed.join("<br>") : ""} | ${r.blockers.join("; ") || "–"} | ${r.evidence} |`),
  "", "## Cross-cutting tests", "",
  `- **Purchase to cart** (\`buy.mjs\`): ${Object.values(buy).map(x => `${x.key}: ${x.posts && x.posts.map(p => p.status).join(",")} → ${x.cart ? x.cart.count + " in cart" : "?"}`).join("; ")}`,
  `- **Sold out after page load** (\`stale.mjs\`): ${Object.entries(stale).map(([k, x]) => `${k}: in cart ${x.cartCount}, CTA ${x.ctaVisible ? "visible" : "hidden"}, "${x.stock}"`).join("; ")}`,
  `- **Packages** (\`pkg.mjs\`): ${Object.entries(pkg).map(([k, x]) => k.startsWith("review") ? `${k}: ${x.steps.length} steps locked, cart calls ${x.cartPosts.length}, gallery height ${[...new Set(x.steps.map(s => s.galleryH))].join("/")}` : `${k}: ${x.profile && x.profile.status}, package cards ${x.packs.length}`).join("; ")}`,
  `- **Sticky** (\`states.mjs\`, 91 @393): ${states.sticky ? Object.entries(states.sticky).filter(([k]) => k !== "errors").map(([k, v]) => `${k}: sticky ${v.sticky ? "on" : "off"} / dock ${v.dock ? "on" : "off"}`).join("; ") : "–"}`,
  `- **Reduced motion**: ${(states.reduced || []).join(", ")}`
].join("\n");
fs.writeFileSync(`${DIR}/CONTROL-MATRIX.md`, md + "\n");
console.log(rows.map(r => `${r.id} ${r.status} ${r.failed.join(" | ")}`).join("\n"));
