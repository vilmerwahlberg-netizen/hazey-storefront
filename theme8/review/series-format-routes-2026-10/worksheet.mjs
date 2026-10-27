// TASK 04B — serie x format-arbetsblad. Läser Task 04:s runs/combos.json och
// route-matrix.json (preflight: båda måste finnas) och slår ihop dem med den
// granskade rekommendationen per kombination (REC). Produktmedlemskap, antal och
// nuvarande destination kommer alltid ur Task 04-datat.
// Kör: node worksheet.mjs -> series-format-worksheet.json + runs/worksheet-table.md
import fs from "node:fs";
import path from "node:path";

const DIR = path.dirname(new URL(import.meta.url).pathname);
const T04 = path.resolve(DIR, "../category-route-master-map-2026-10");
for (const f of ["route-matrix.json", "runs/combos.json", "ROUTE-MATRIX.md", "ADMIN-GAPS.md", "ROLLOUT-BATCHES.md", "REPORT.md"]) {
  if (!fs.existsSync(path.join(T04, f))) { console.error("PREFLIGHT FAIL: Task 04 output missing:", f); process.exit(2); }
}
const combos = JSON.parse(fs.readFileSync(path.join(T04, "runs/combos.json"), "utf8"));
fs.mkdirSync(path.join(DIR, "runs"), { recursive: true });

const FMT = { vapes: "Vapes", carts: "Carts", buds: "Buds", hasch: "Hasch", prerolls: "Pre-rolls", isolat: "Isolat" };
const PARENT = { vapes: "/sv/categories/alla-vapes", carts: "/sv/categories/alla-cartridges", buds: "/sv/categories/blommor-buds", hasch: "/sv/categories/hasch", prerolls: "/sv/categories/prerolled", isolat: null };
const HUB = { "Magic Sauce": "/sv/categories/magic-sauce", THCaB: "/sv/categories/thca", THCbA: "/sv/categories/thcb", Core: "/sv/categories/core", "10-OH-THC": "/sv/categories/10-oh-thc" /* legacy; NOT the D10 hub */, "Nano-11": "/sv/categories/nano-11", THCV: "/sv/categories/thcv", HHCPM: "/sv/categories/hhcpm", THCNM: "/sv/categories/thcnm" };

/* decision: keep-dedicated | propose-dedicated | optional-dedicated | keep-filter | keep-hub-shelf
   admin: exact action for the user ("—" = none) */
const REC = {
  "Magic Sauce|vapes": ["keep-dedicated", "Remove 'Cart – Magic Sauce 99% – 1ml' from M.S Vapes (move to M.S Carts if created). Optional: rename the category display name 'M.S Vapes' → 'Magic Sauce Vapes' (verify the slug stays m-s-vapes)."],
  "Magic Sauce|buds": ["keep-dedicated", "Add 'Buds – Magic Sauce 50% – La Chupacabra – 5 gram'. Remove both Magic Sauce hash products (move them to M.S Hasch). Optional rename 'M.S Buds' → 'Magic Sauce Buds' (verify the slug is unchanged)."],
  "Magic Sauce|hasch": ["propose-dedicated", "Create the category (FIRST-ADMIN-BATCH item 1)."],
  "Magic Sauce|carts": ["optional-dedicated", "Your decision: 1 product. Recommended: keep as filter now; create only if you want full Magic Sauce format parity (FIRST-ADMIN-BATCH item 2, optional)."],
  "THCaB|vapes": ["keep-dedicated", "Decide the carts-in-vapes rule; 'Cart – THC-A 45% – Faraoh – 1ml' is listed in THCA Vapes."],
  "THCaB|carts": ["keep-dedicated", "Add 'Cart – THC-A 50% Live Resin – Faraoh – 1ml' to THCA Carts."],
  "THCaB|buds": ["keep-dedicated", "Legacy THCA pre-roll + THCA isolate are listed here; both leave with the WooCommerce migration (not a blocker). After migration: pre-rolls only if flower-based."],
  "THCaB|hasch": ["keep-dedicated", "Legacy THCA isolate is listed here; leaves with the migration (not a blocker)."],
  "THCaB|prerolls": ["legacy", "None. The 1 legacy pre-roll leaves with the migration; the Bangkok contents question is resolved by the migration. The Pre-rolls format page itself: FIRST-ADMIN-BATCH item 4."],
  "THCaB|isolat": ["dormant", "None. Legacy isolate leaves with the migration; Isolat stays dormant and unlinked."],
  "THCbA|vapes": ["keep-dedicated", "—"],
  "THCbA|carts": ["keep-dedicated", "— (1 product; see ADMIN-GAPS C9)"],
  "Core|vapes": ["keep-filter", "—"],
  "Core|buds": ["keep-hub-shelf", "— (Core family grows with High Life/El Gringo at migration)"],
  "Core|hasch": ["keep-hub-shelf", "— (Core family grows with High Life/El Gringo at migration)"],
  "10-OH-THC|vapes": ["legacy", "None. The product is 10-OH-THC (legacy), NOT Delta-10. 10-oh-thc-vapes is not a D10 route; D10 waits for real products + the migrated category."],
  "Nano-11|buds": ["keep-dedicated", "— (identical to /nano-11 hub)"],
  "THCV|vapes": ["legacy", "None. THCV is on hold (not in the planned new assortment). No new THCV pages until real products exist."],
  "THCV|carts": ["legacy", "None. THCV on hold."],
  "HHCPM|vapes": ["legacy", "None. HHCPM is legacy taxonomy; the Canntropy vape is a legacy item. Admin cleanup at migration."],
  "HHCPM|buds": ["legacy", "None. HHCPM is legacy taxonomy; Wedding Cake (El Gringo) → Core family at /core; Amnesia/Durban Poison legacy. Cleanup at migration."],
  "THCNM|buds": ["legacy", "None. THCNM is legacy taxonomy; GSC + Black Widow (High Life) → Core family at /core. Cleanup at migration."],
  "THCNM|hasch": ["legacy", "None. THCNM is legacy taxonomy; Malaga Magic + Royal Gorilla → Core family at /core. Cleanup at migration."]
};
const REASON = {
  "keep-dedicated": "Dedicated category exists with real products; the series × format template applies.",
  "propose-dedicated": "Real, distinct assortment; header already lists it under the format's SERIER; current products are misfiled in another category; filter URL canonicalizes to the parent and can never be a landing.",
  "optional-dedicated": "Real but single-product assortment. A page is thin, though precedent exists (thca/thcb/thcv-carts each have 1).",
  "keep-filter": "Too small, overlapping or not a defined format route; reachable via the parent filter and the hub.",
  "keep-hub-shelf": "Products are also THCaB/HHCPM/THCNM members (duplicate risk); the Core hub already groups them by format.",
  "dormant": "Final decision 2026-10-27: Isolat is dormant. No isolate in the new assortment; no page and no visible links until a real isolate product exists.",
  "legacy": "Legacy Nyehandel data or legacy taxonomy (pre-rolls, HHCPM/THCNM → Core family, THCV on hold, 10-OH-THC ≠ D10). Leaves or is cleaned up at the WooCommerce migration; no pages are mass-produced from it. Redirect/canonical for old routes is decided after the migration."
};
/* Föreslagen copy (sv). Faktabaserad, inga effekt-/medicinska påståenden,
   inga antal (antal läses live). */
const COPY = {
  "Magic Sauce|hasch": { slug: "m-s-hasch", name: "Magic Sauce Hasch", h1: "Magic Sauce Hasch", intro: "Hasch i Magic Sauce-serien från Magic Farmers, samlad på en sida. Jämför sorter, förpackningar och pris.", seoTitle: "Magic Sauce Hasch – Magic Farmers | Hazey.se", seoDesc: "Hasch i Magic Sauce-serien från Magic Farmers. Se alla sorter, förpackningsstorlekar och priser i Hazeys sortiment." },
  "Magic Sauce|carts": { slug: "m-s-carts", name: "Magic Sauce Carts", h1: "Magic Sauce Carts", intro: "Carts i Magic Sauce-serien från Magic Farmers, samlade på en sida.", seoTitle: "Magic Sauce Carts – Magic Farmers | Hazey.se", seoDesc: "Carts i Magic Sauce-serien från Magic Farmers. Se volym och pris i Hazeys sortiment." }
};
const genericCopy = (s, f) => ({
  slug: null, name: null, h1: `${s} ${FMT[f]}`,
  intro: `${FMT[f]} i ${s}-serien, samlade på en sida.`,
  seoTitle: `${s} ${FMT[f]} | Hazey.se`,
  seoDesc: `Alla ${FMT[f].toLowerCase()} i ${s}-serien hos Hazey.se. Jämför produkter, storlekar och pris.`
});

const rows = combos.map(c => {
  const k = c.series + "|" + c.format;
  const [decision, admin] = REC[k] || ["UNREVIEWED", "?"];
  const routes = c.routes || [];
  const ded = routes.find(r => r.kind === "dedicated");
  const fil = routes.find(r => r.kind === "filter");
  const state = ded ? "dedicated" : fil ? "filtered/shared" : "missing";
  const proposal = decision === "propose-dedicated" || decision === "optional-dedicated";
  const copy = COPY[k] || genericCopy(c.series, c.format);
  return {
    series: c.series, format: c.format,
    products: c.products.map(p => p.name), count: c.products.length,
    currentDestination: ded ? ded.route : fil ? fil.route : (HUB[c.series] || "none") + " (hub shelf)",
    state,
    currentRouteCount: ded ? ded.count : fil ? fil.count : null,
    membershipIssues: ded ? { offFormat: ded.offFormat.map(m => m.name), missing: ded.missing.map(s => c.products.find(p => p.slug === s)?.name || s) } : null,
    decision, reason: REASON[decision],
    proposedSlug: proposal ? copy.slug : null,
    proposedCategoryName: proposal ? copy.name : null,
    proposedH1: ["keep-filter", "keep-hub-shelf", "dormant", "legacy"].includes(decision) ? null : copy.h1,
    proposedIntro: ["keep-filter", "keep-hub-shelf", "dormant", "legacy"].includes(decision) ? null : copy.intro,
    proposedSeoTitle: ["keep-filter", "keep-hub-shelf", "dormant", "legacy"].includes(decision) ? null : copy.seoTitle,
    proposedSeoDescription: ["keep-filter", "keep-hub-shelf", "dormant", "legacy"].includes(decision) ? null : copy.seoDesc,
    canonicalIndex: proposal ? "self-canonical (Nyehandel default, confirmed on siblings); index status = UNKNOWN: production-domain robots must be verified in admin" : decision === "dormant" || decision === "legacy" ? "n/a (" + decision + ")" : state === "dedicated" ? "self-canonical (confirmed); index = UNKNOWN (host shows noindex)" : "canonical → parent (confirmed); not an SEO landing",
    parentRoute: PARENT[c.format], hubRoute: HUB[c.series],
    internalLinks: proposal ? [`header ${FMT[c.format]} → SERIER → ${c.series}`, `${HUB[c.series]} format shelf`, `${PARENT[c.format]} series tab`, "same-format sibling discovery on other series × format pages (04A)"] : null,
    template: decision === "dormant" || decision === "legacy" ? "none (" + decision + ")" : decision === "keep-filter" ? "parent broad format family (query never selects series × format)" : decision === "keep-hub-shelf" ? "series hub format shelf" : "series × format template (C04/80b)",
    controlRoute: decision === "dormant" || decision === "legacy" ? null : decision === "keep-filter" ? PARENT[c.format] : decision === "keep-hub-shelf" ? "/sv/categories/magic-sauce" : "/sv/categories/thca-vapes",
    adminAction: admin
  };
});
const unrev = rows.filter(r => r.decision === "UNREVIEWED");
if (unrev.length) { console.error("UNREVIEWED combos:", unrev.map(r => r.series + "|" + r.format)); process.exit(1); }
fs.writeFileSync(path.join(DIR, "series-format-worksheet.json"), JSON.stringify({ schema: "hazey.task04b.worksheet/1", generated: new Date().toISOString(), source: "Task 04 runs/combos.json (live 2026-10-27)", rows }, null, 1));

const e = s => String(s ?? "—").replace(/\|/g, "\\|");
const md = ["| Series × format | Real | Current destination | State | Membership issues | Decision | Proposed slug | Admin action |", "|---|---:|---|---|---|---|---|---|"];
for (const r of rows) {
  const iss = r.membershipIssues ? [r.membershipIssues.offFormat.length ? "off-format: " + r.membershipIssues.offFormat.join("; ") : "", r.membershipIssues.missing.length ? "missing: " + r.membershipIssues.missing.join("; ") : ""].filter(Boolean).join(" / ") || "—" : "—";
  md.push(`| ${r.series} × ${FMT[r.format]} | ${r.count} | \`${e(r.currentDestination.replace("/sv/categories/", ""))}\` (${e(r.currentRouteCount)}) | ${r.state} | ${e(iss)} | **${r.decision}** | ${r.proposedSlug ? "`" + r.proposedSlug + "`" : "—"} | ${e(r.adminAction)} |`);
}
fs.writeFileSync(path.join(DIR, "runs/worksheet-table.md"), md.join("\n") + "\n");
const t = {}; rows.forEach(r => t[r.decision] = (t[r.decision] || 0) + 1);
const s = {}; rows.forEach(r => s[r.state] = (s[r.state] || 0) + 1);
console.log("combinations", rows.length, t, s);
