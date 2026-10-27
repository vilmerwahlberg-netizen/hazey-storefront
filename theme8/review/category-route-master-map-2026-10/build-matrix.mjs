// TASK 04 — bygger route-matrix.json + tabellen i ROUTE-MATRIX.md ur
// runs/inventory.json, runs/membership.json, shots/shots.json och den
// granskade klassificeringen nedan (CLASS). Faktafält (H1, antal, canonical,
// robots, category-id, källor) kommer alltid ur inventeringen -- aldrig ur
// klassificeringen. Kör: node build-matrix.mjs
import fs from "node:fs";
import path from "node:path";

const DIR = path.dirname(new URL(import.meta.url).pathname);
const inv = JSON.parse(fs.readFileSync(path.join(DIR, "runs/inventory.json"), "utf8"));
const shots = fs.existsSync(path.join(DIR, "shots/shots.json")) ? JSON.parse(fs.readFileSync(path.join(DIR, "shots/shots.json"), "utf8")) : [];
const C = "/sv/categories/";

/* Theme 8-sidfamilj i dev-HEAD 8a7132e, härledd ur 80-category.js/81-series-hub.js:
   portal | vapes-pilot | broad | series-format | hub-pilot | hub-legacy | format-legacy | legacy-shell */
const F = {
  portal: "Alla produkter portal", broad: "broad format", hub: "series hub", sf: "series × format",
  cann: "cannabinoid family", acc: "accessory/battery", mfr: "manufacturer/filter state",
  search: "search result", special: "campaign/special", legacy: "legacy duplicate", legtax: "legacy taxonomy (pending migration)", orphan: "orphan", broken: "broken route"
};
const T = {
  portal: "Alla produkter portal (C07)", broad: "broad format family (Alla Vapes macro, 01G)", sf: "series × format template (C04/80b)",
  hub: "series hub system (Magic Sauce pilot, 04C-B)", carts: "broad format family — Carts adaptation (Task 05)",
  cann: "cannabinoid family (Task 06 decision)", acc: "accessory/battery template (Task 07)", mfr: "manufacturer/filter-state contract (Task 08)",
  search: "search results page (Task 09)", none: "none — not a customer destination"
};
// route -> [family, kind, context, theme8Family, desired, control, batch, dependency, admin, debt]
const CLASS = {
  "alla-produkter": [F.portal, "dedicated", "whole catalog", "portal", T.portal, "self", "control (C07 done)", "—", "Fraktändring is a listed product; 2 THCA products missing from category", "non-product in grid"],
  "alla-vapes": [F.broad, "dedicated", "format: vapes (+carts/refill/batteries filters)", "vapes-pilot", T.broad, "self (pilot)", "control", "—", "—", "—"],
  "alla-vapes?serie=magic-sauce": [F.broad, "Theme 8 client state", "vapes filtered to Magic Sauce (Theme 8 ?serie=)", "vapes-pilot", T.broad, "/alla-vapes", "Task 08 (state contract)", "—", "—", "server ignores ?serie= (count 24); header navHref only"],
  "alla-vapes?filters=Serie_Core": [F.mfr, "filtered/shared", "vapes filtered to Core", "vapes-pilot (rewritten to ?serie=core)", T.broad, "/alla-vapes", "Task 08; header link decision in 04A/04C", "Core hub /core", "decide header Core target: /core hub vs vapes filter", "1 product"],
  "blommor-buds": [F.broad, "dedicated", "format: buds", "broad", T.broad, "self", "Batch A control", "—", "NOW (legacy Nyehandel): 4 legacy pre-rolls, 2 legacy isolates and 1 hash (CBN Yellowstone) listed; the pre-rolls/isolates leave with the WooCommerce migration. TARGET: Buds holds buds + buds-based pre-rolls (secondary)", "off-format legacy products"],
  "hasch": [F.broad, "dedicated", "format: hasch", "broad", T.broad, "/blommor-buds", "Batch A control", "—", "NOW (legacy): 2 legacy isolates listed, leaving with the migration. TARGET: Hasch holds hash + hash-based pre-rolls (secondary)", "—"],
  "hasch?filters=Serie_Magic Sauce": [F.sf, "filtered/shared (NOT dedicated)", "Magic Sauce × hasch", "broad (correct, filter chip)", T.broad + " until dedicated route exists", "/hasch", "Batch C after 04B admin", "04B admin: m-s-hasch", "dedicated category missing; products currently filed in m-s-buds", "—"],
  "alla-cartridges": [F.broad, "dedicated", "format: carts", "format-legacy (nav=format)", T.carts, "/alla-vapes", "Task 05 → Batch D", "Task 05 decision", "—", "not in accepted broad family"],
  "alla-cartridges?filters=Serie_Magic Sauce": [F.sf, "filtered/shared (NOT dedicated)", "Magic Sauce × carts", "format-legacy (filter)", T.carts, "/alla-cartridges", "Batch C (only if 04B approves) else Task 08", "04B decision: 1 product", "Magic Sauce cart also filed in m-s-vapes", "1 product"],
  "pennor": [F.acc, "dedicated", "batteries/accessories", "format-legacy (nav=format)", T.acc, "—", "Task 07 → Batch D", "Task 07", "H1 'Pennor/Batteri' is legacy wording", "—"],
  "merch": [F.acc, "dedicated", "merch", "legacy-shell", T.acc, "—", "Task 07 → Batch D", "Task 07 IA", "1 product; duplicate of merch-ny", "single-item"],
  "m-s-vapes": [F.sf, "dedicated", "Magic Sauce × vapes", "series-format", T.sf, "/thca-vapes", "Batch A (control)", "—", "contains the Magic Sauce cart (off-format)", "2 products, 1 is a cart"],
  "m-s-buds": [F.sf, "dedicated", "Magic Sauce × buds", "series-format", T.sf, "/thca-vapes", "Batch A (after admin fix)", "04B admin", "contains 2 Magic Sauce hash; missing La Chupacabra", "wrong membership"],
  "thca-vapes": [F.sf, "dedicated", "THCaB × vapes", "series-format", T.sf, "self (accepted THCaB control)", "Batch A control", "—", "contains 1 cart (THC-A 45%)", "off-format product"],
  "thca-carts": [F.sf, "dedicated", "THCaB × carts", "series-format", T.sf, "/thca-vapes", "Batch A", "—", "missing THC-A 50% Live Resin cart", "1 product (thin)"],
  "thca-blommor": [F.sf, "dedicated", "THCaB × buds", "series-format", T.sf, "/thca-vapes", "Batch A", "—", "NOW (legacy): legacy pre-roll Bangkok + legacy THCA isolate listed; both leave with the migration (no investigation needed)", "legacy off-format products"],
  "thca-hash": [F.sf, "dedicated", "THCaB × hasch", "series-format", T.sf, "/thca-vapes", "Batch A", "—", "NOW (legacy): legacy THCA isolate listed; leaves with the migration", "legacy off-format product"],
  "thcb-vapes": [F.sf, "dedicated", "THCbA × vapes", "series-format", T.sf, "/thca-vapes", "Batch A", "—", "—", "—"],
  "thcb-carts": [F.sf, "dedicated", "THCbA × carts", "series-format", T.sf, "/thca-vapes", "Batch A", "—", "—", "1 product (thin)"],
  "10-oh-thc-vapes": [F.legtax, "legacy product category", "10-OH-THC × vapes legacy — NOT D10 × vapes", "series-format", T.none + " (not a D10 destination)", "—", "on hold (removed from Batch A)", "migration: real D10 products/category", "must not be used for Delta-10", "header D10 link currently points here (code debt, later task)"],
  "nano11-blommor": [F.sf, "dedicated", "Nano-11 × buds", "series-format", T.sf, "/thca-vapes", "Batch A", "—", "—", "identical assortment to /nano-11 hub (8/8)"],
  "thcv-vape": [F.legtax, "legacy / on hold", "THCV × vapes — THCV not in the planned new assortment", "series-format", T.none + " (on hold until real THCV products exist in the new assortment)", "—", "on hold (removed from Batch A/B)", "new-assortment THCV products", "build/expose no new THCV pages; never auto-generate visible nav from this route; redirect/canonical decided after migration", "currently linked by Theme 8 header/catalog map (code debt, later task)"],
  "thcv-carts": [F.legtax, "legacy / on hold", "THCV × carts — THCV not in the planned new assortment", "series-format", T.none + " (on hold until real THCV products exist in the new assortment)", "—", "on hold (removed from Batch A/B)", "new-assortment THCV products", "build/expose no new THCV pages; never auto-generate visible nav from this route; redirect/canonical decided after migration", "currently linked by Theme 8 header/catalog map (code debt, later task)"],
  "hhcpm-vapes": [F.legtax, "legacy category", "legacy HHCPM × vapes", "series-format", T.none + " (do not mass-produce series × format pages)", "—", "admin cleanup at migration (removed from Batch A)", "migration", "Canntropy HHCPM vape: legacy, not Core family; never auto-generate visible nav from this route; redirect/canonical decided after migration", "currently in Theme 8 header SERIER (code debt, later task)"],
  "hhcpm-blommor": [F.legtax, "legacy category", "legacy HHCPM × buds", "series-format", T.none + " (do not mass-produce series × format pages)", "—", "admin cleanup at migration (removed from Batch A)", "migration", "Wedding Cake → Core family; Amnesia/Durban Poison legacy; never auto-generate visible nav from this route; redirect/canonical decided after migration", "currently in Theme 8 header SERIER (code debt, later task)"],
  "thcnm-blommor": [F.legtax, "legacy category", "legacy THCNM × buds", "series-format", T.none + " (do not mass-produce series × format pages)", "—", "admin cleanup at migration (removed from Batch A)", "migration", "GSC + Black Widow (High Life) → Core family candidates; never auto-generate visible nav from this route; redirect/canonical decided after migration", "currently in Theme 8 header SERIER (code debt, later task)"],
  "thcnm-hash": [F.legtax, "legacy category", "legacy THCNM × hasch", "series-format", T.none + " (do not mass-produce series × format pages)", "—", "admin cleanup at migration (removed from Batch A)", "migration", "Malaga Magic (High Life) + Royal Gorilla (hero-vapes grouping) → Core family candidates; never auto-generate visible nav from this route; redirect/canonical decided after migration", "currently in Theme 8 header SERIER (code debt, later task)"],
  "magic-sauce": [F.hub, "dedicated", "series: Magic Sauce", "hub-pilot", T.hub, "self (pilot)", "Batch B control", "—", "—", "—"],
  "thca": [F.hub, "dedicated", "series: THCaB", "hub-pilot", T.hub, "/magic-sauce", "Batch B (done ceb240a, review)", "—", "—", "—"],
  "thcb": [F.hub, "dedicated", "series: THCbA", "hub-pilot", T.hub, "/magic-sauce", "Batch B (done ce18e40, review)", "—", "—", "—"],
  "nano-11": [F.hub, "dedicated", "series: Nano-11", "hub-pilot", T.hub, "/magic-sauce", "Batch B (done 8a7132e, review)", "—", "—", "—"],
  "core": [F.hub, "dedicated", "series: Core family = Core + High Life + El Gringo (target: single customer destination)", "hub-pilot (committed 9d65a85 on dev)", T.hub, "/magic-sauce", "Batch B (built; review); membership grows at migration", "migration: High Life/El Gringo products assigned to Core family", "NOW: 4 products (Core vape, Wedding Cake, Malaga Magic, Northern Lights); legacy hero-vapes groups 8 family candidates; duplicate /core-1", "—"],
  "10-oh-thc": [F.legtax, "legacy product category", "10-OH-THC legacy product (1 vape) — NOT Delta-10", "hub-legacy", T.none + " (D10 hub waits for real D10 products + migrated category)", "—", "on hold: D10 hub after migration (removed from Batch B)", "migration: real D10 products/category", "must not be the data source or customer destination for D10; keep D10 hub material for the future page", "Theme 8 catalog map currently maps D10 hub → /10-oh-thc and header D10 → 10-oh-thc-vapes (code debt, later task)"],
  "thcv": [F.legtax, "legacy / on hold", "THCV hub — THCV not in the planned new assortment", "hub-legacy", T.none + " (on hold until real THCV products exist in the new assortment)", "—", "on hold (removed from Batch A/B)", "new-assortment THCV products", "build/expose no new THCV pages; never auto-generate visible nav from this route; redirect/canonical decided after migration", "currently linked by Theme 8 header/catalog map (code debt, later task)"],
  "hhcpm": [F.legtax, "legacy category", "legacy HHCPM taxonomy — NOT a future series", "hub-legacy", T.none + " (no hub; Core family relevant products → /core)", "—", "admin cleanup at migration (removed from Batch B)", "migration", "Wedding Cake (El Gringo packaging) → Core family; Amnesia/Durban Poison (Blommor HHCPM 15%) and Canntropy HHCPM vape are not Core-family legacy items; never auto-generate visible nav from this route; redirect/canonical decided after migration", "currently linked by Theme 8 header/catalog map (code debt, later task)"],
  "thcnm": [F.legtax, "legacy category", "legacy THCNM taxonomy — NOT a future series", "hub-legacy", T.none + " (no hub; Core family → /core)", "—", "admin cleanup at migration (removed from Batch B)", "migration", "all 4 are Core-family candidates: GSC (HighLife in name), Black Widow and Malaga Magic (High Life packaging observed), Royal Gorilla (grouped in legacy hero-vapes); final membership from migration data; never auto-generate visible nav from this route; redirect/canonical decided after migration", "currently linked by Theme 8 header/catalog map (code debt, later task)"],
  "h4cbd": [F.cann, "dedicated", "cannabinoid: CBD/H4CBD family (header 'CBD')", "legacy-shell", T.cann, "—", "Task 06 → Batch D", "Task 06", "H1 'H4CBD' vs header label 'CBD'", "legacy description copy"],
  "h4cbd-vape": [F.cann, "dedicated", "cannabinoid × vapes", "legacy-shell", T.cann, "—", "Task 06 → Batch D", "Task 06", "contains 2 CBD carts (off-format); slug singular", "—"],
  "cbd-buds": [F.cann, "dedicated", "cannabinoid × buds", "legacy-shell", T.cann, "—", "Task 06 → Batch D", "Task 06", "NOW (legacy): 3 legacy pre-rolls + 1 legacy isolate (leave with migration); 1 hash (Primero) misfiled", "off-format products"],
  "h4cbd-buds": [F.cann, "dedicated", "cannabinoid × buds (H4CBD)", "legacy-shell", T.cann, "—", "Task 06 → Batch D", "Task 06", "overlaps cbd-buds; 1 product", "single-item"],
  "h4cbd-hasch": [F.cann, "dedicated", "cannabinoid × hasch", "legacy-shell", T.cann, "—", "Task 06 → Batch D", "Task 06", "1 product", "single-item"],
  "cbn": [F.cann, "dedicated", "cannabinoid: CBN", "legacy-shell", T.cann, "—", "Task 06 → Batch D", "Task 06", "also holds CBG9 product (CBG has no route)", "legacy description copy"],
  "cbn-vapes": [F.cann, "dedicated", "cannabinoid × vapes (CBN)", "legacy-shell", T.cann, "—", "Task 06 → Batch D", "Task 06", "not in Theme 8 header", "—"],
  "hero-vapes": [F.mfr, "dedicated", "legacy grouping of the Core family (Hero/High Life/El Gringo + Core vape)", "legacy-shell", T.mfr, "—", "admin cleanup at migration; family → /core", "migration", "H1/slug 'Hero Vapes' but 7 of 8 are High Life/El Gringo buds/hash; all 8 are Core-family candidates (White Widow, GSC, Black Widow, Royal Gorilla, Malaga Magic, Northern Lights, Wedding Cake, Core vape)", "misleading H1; empty bento image"],
  "faraoh": [F.mfr, "dedicated", "manufacturer: Faraoh", "legacy-shell", T.mfr, "—", "Task 08 → Batch D", "Task 08", "—", "—"],
  "tatra-hemp": [F.mfr, "dedicated", "manufacturer: Tatra Hemp", "legacy-shell", T.mfr, "—", "Task 08 → Batch D", "Task 08", "—", "—"],
  "magic-farmers": [F.mfr, "dedicated", "manufacturer: Magic Farmers", "legacy-shell", T.mfr, "—", "Task 08 → Batch D", "Task 08", "—", "—"],
  "cbd-group": [F.mfr, "dedicated", "manufacturer: CBD Group", "legacy-shell", T.mfr, "—", "Task 08 → Batch D", "Task 08", "—", "—"],
  "core-1": [F.legacy, "dedicated (empty)", "duplicate 'Core'", "legacy-shell", T.none, "—", "admin cleanup", "admin", "empty duplicate of /core: hide/delete/redirect", "0 products"],
  "hazey-v2": [F.orphan, "structural (hidden)", "breadcrumb root of every product", "legacy-shell", T.none, "—", "admin decision", "admin", "PDP breadcrumb exposes hidden tree", "0 products"],
  "vapes-ny": [F.orphan, "structural (hidden)", "breadcrumb: Vapes", "legacy-shell", T.none, "—", "admin decision", "admin", "holds 2 THC-H vapes found nowhere else", "—"],
  "buds-ny": [F.orphan, "structural (hidden)", "breadcrumb: Buds", "legacy-shell", T.none, "—", "admin decision", "admin", "PDP breadcrumb link to hidden page", "—"],
  "hash-ny": [F.orphan, "structural (hidden)", "breadcrumb: Hash", "legacy-shell", T.none, "—", "admin decision", "admin", "PDP breadcrumb link to hidden page", "—"],
  "prerolled": [F.broad, "dedicated (activate now)", "PRIMARY FORMAT: Pre-rolls (slug kept, customer name 'Pre-rolls'). NOW: 4 legacy sold-out products leaving with migration. TARGET: migrated pre-rolls", "legacy-shell", T.broad + " — Pre-rolls adaptation (0/1/many/sold-out/new products, data-driven)", "/blommor-buds", "Batch C — activate page + header link now; migration/stock NOT a blocker", "admin: publish + rename; 04C-C code", "hidden today; header shows Pre-rolls as 'kommer snart' (href null)", "must render a truthful empty state (likely 0 products right after migration)"],
  "isolat": [F.legacy, "dormant", "Isolat — no isolate in the new assortment", "legacy-shell", T.none + " (dormant; reactivate only when a real isolate product exists)", "—", "none (dormant)", "—", "NOW (legacy): 2 legacy isolates leave with the migration; their extra memberships in Buds/Hasch/THCA/CBD disappear with them. Never link /isolat", "no visible Theme 8/native nav link (verified)"],
  "merch-ny": [F.legacy, "structural (hidden)", "duplicate merch", "legacy-shell", T.none, "—", "admin cleanup", "admin", "duplicate of /merch", "—"]
};

const shotBy = Object.fromEntries(shots.map(s => [s.route.replace(/\+/g, " "), s]));
const rows = inv.routes.map(r => {
  const slug = r.route.replace(C, "");
  const c = CLASS[slug];
  const nativeNav = r.sources.filter(s => s.startsWith("native:")).length;
  const src = [];
  if (r.sources.some(s => s === "theme8:05-header.js")) src.push("Theme 8 header");
  if (r.sources.some(s => /catalog-map/.test(s))) src.push("Theme 8 catalog map (hub/extra)");
  if (r.sources.some(s => s === "native:/" || s === "native:/sv/categories/alla-produkter")) src.push("native navbar DOM (visually replaced by Theme 8 header)");
  else if (nativeNav) src.push("self-link only");
  if (r.sources.includes("pdp-breadcrumb")) src.push("PDP breadcrumb");
  if (r.sources.includes("seed:human-verified")) src.push("human-verified seed");
  const sh = shotBy[r.route];
  return {
    route: r.route,
    path: r.route.split("?")[0],
    query: r.route.includes("?") ? r.route.split("?")[1] : null,
    family: c ? c[0] : "UNCLASSIFIED",
    kind: c ? c[1] : null,
    context: c ? c[2] : null,
    status: r.status,
    categoryId: r.categoryId ? +r.categoryId : null,
    h1Native: r.h1,
    h1Theme8: sh ? sh.h1 : null,
    count: r.count ?? (r.products ? r.products.length : null),
    pages: r.pages,
    canonical: r.canonical ? r.canonical.replace("https://hazeyse.nyehandel.se", "") : null,
    canonicalSelf: r.canonical ? r.canonical.replace("https://hazeyse.nyehandel.se", "") === r.route : null,
    robots: r.robots,
    titleTag: r.title,
    metaDescription: r.description ? "present (legacy copy)" : "missing",
    seoProductionDomain: "unknown — verify in Nyehandel admin",
    facets: (r.facets || []).filter(f => f.title !== "Lagerstatus").map(f => ({ [f.title]: f.values })),
    theme8Family: c ? c[3] : null,
    theme8Shell: sh ? sh.shell : null,
    desiredTemplate: c ? c[4] : null,
    controlRoute: c ? c[5] : null,
    rolloutBatch: c ? c[6] : null,
    dependency: c ? c[7] : null,
    adminGap: c ? c[8] : null,
    visualFunctionalDebt: c ? c[9] : null,
    linkSources: src,
    products: (r.products || []).map(p => p.slug)
  };
});
const missing = rows.filter(r => r.family === "UNCLASSIFIED");
if (missing.length) { console.error("UNCLASSIFIED:", missing.map(m => m.route)); process.exit(1); }
const out = {
  schema: "hazey.task04.route-matrix/1",
  generated: new Date().toISOString(),
  sourceCommit: "8a7132e (dev) + live Nyehandel 2026-10-27",
  extraRoutes: [
    { route: "/sv/search?query={q}", family: F.search, kind: "native search", h1Native: null, canonical: "/sv/search", robots: "noindex, nofollow", desiredTemplate: T.search, rolloutBatch: "Task 09 → Batch D", note: "no H1, no server count; 'core' → 2 products, 'magic sauce' → 13" },
    { route: "/sv/categories/alla-produkter?typ={format}&q={q}", family: F.portal, kind: "Theme 8 client state", desiredTemplate: T.portal, rolloutBatch: "control (C07)", note: "portal tabs/search state, not a route" },
    { route: "/sv/page/kampanjer", family: F.special, kind: "native page", desiredTemplate: "campaign page (outside category scope)", rolloutBatch: "outside Task 04C", note: "header + footer link" },
    { route: "/sv/page/vara-bastsaljare", family: F.special, kind: "native page", desiredTemplate: "bestsellers landing (Task 11)", rolloutBatch: "Task 11", note: "header + footer link" }
  ],
  routes: rows
};
fs.writeFileSync(path.join(DIR, "route-matrix.json"), JSON.stringify(out, null, 1));

const esc = s => String(s ?? "—").replace(/\|/g, "\\|");
const order = Object.values(F);
const md = [];
for (const fam of order) {
  const rs = rows.filter(r => r.family === fam);
  if (!rs.length) continue;
  md.push(`\n### ${fam} (${rs.length})\n`);
  md.push("| Route | Kind | Native H1 → Theme 8 H1 | Count | Canonical | Theme 8 family now | Desired template | Control | Sources | Admin gap | Debt | Batch |");
  md.push("|---|---|---|---:|---|---|---|---|---|---|---|---|");
  for (const r of rs) md.push(`| \`${esc(r.route.replace(C, ""))}\` | ${esc(r.kind)} | ${esc(r.h1Native)}${r.h1Theme8 && r.h1Theme8 !== r.h1Native ? " → " + esc(r.h1Theme8) : ""} | ${esc(r.count)} | ${r.canonicalSelf ? "self" : "`" + esc(r.canonical) + "`"} | ${esc(r.theme8Family)} | ${esc(r.desiredTemplate)} | ${esc(r.controlRoute)} | ${esc(r.linkSources.join("; "))} | ${esc(r.adminGap)} | ${esc(r.visualFunctionalDebt)} | ${esc(r.rolloutBatch)} |`);
}
fs.writeFileSync(path.join(DIR, "runs/route-matrix-table.md"), md.join("\n") + "\n");
const tally = {};
rows.forEach(r => tally[r.family] = (tally[r.family] || 0) + 1);
console.log("routes", rows.length, tally);
