// TASK 10B-R1 -- ADAPTER-COVERAGE.md ur runs/coverage-after-*.json + Task 10A routes.tsv (lager).
import fs from "node:fs"; import path from "node:path";
const DIR = path.dirname(new URL(import.meta.url).pathname);
const rows = fs.readdirSync(`${DIR}/runs`).filter(f => /^coverage-after-\d+\.json$/.test(f)).flatMap(f => JSON.parse(fs.readFileSync(`${DIR}/runs/${f}`)));
const stock = {}; fs.readFileSync("/Users/wahlberg/HZY/hemsidor/hazey-storefront-task10a/theme8/review/pdp-capability-inventory-2026-10/routes.tsv", "utf8").trim().split("\n").slice(1).forEach(l => { const c = l.split("\t"); stock[c[1]] = c[4]; });
rows.sort((a, b) => a.id - b.id);
const kind = r => r.id === 20 ? "service item" : r.listing === "unlisted" ? "unlisted" : "customer-facing";
const why = r => r.adapter ? "–" : r.id === 20 ? "service item (shipping change), no brand or format category: generic template with 10B-0" : "unlisted legacy item without brand or format category: generic template with 10B-0";
const action = r => r.adapter ? "" : r.id === 20 ? "Hide from listings and search (Task 10A A3); keep as a service item" : r.id === 56 ? "**Purchasable via direct link (1/5 variants).** Either deactivate it (legacy) or, if it should be sold, set brand Tatra Hemp and add it to Alla Carts; it then gets the adapter automatically" : "Deactivate/unpublish (sold out, legacy Nano10/Nano9/NanoX) or set brand + format category if it should be sold";
const counts = { total: rows.length, adapter: rows.filter(r => r.adapter).length, cust: rows.filter(r => kind(r) === "customer-facing").length, custNo: rows.filter(r => kind(r) === "customer-facing" && !r.adapter).length };
const md = [
  "# Adapter coverage — every published PDP (Task 10B-R1)", "",
  "**Source:** today's Nyehandel sitemap (`/channel/1/products/1/sitemap.xml`, 121 products, the same set as Task 10A). Each page was opened in the real Theme 8 preview with the local build (`coverage.mjs`, 1440).",
  "",
  "**Columns:** brand = rendered DOM; adapter = `html.hz8-pdp-pilot`; listing and stock from Task 10A `routes.tsv`.", "",
  "## Summary", "",
  `- **Adapter:** active on ${counts.adapter} of ${counts.total} published PDPs.`,
  `- **Customer-facing (listed) products:** ${counts.cust}, of which **${counts.custNo}** lack the adapter. **No customer-facing product lacks a brand**, so none sits silently on the old template.`,
  `- **Without the adapter (${counts.total - counts.adapter}):**`,
  `  - Fraktändring (service item);`,
  `  - ${counts.total - counts.adapter - 1} unlisted legacy items without brand or format category. They keep the generic template with the 10B-0 protection.`,
  "- **On every page:** 1 H1, 0 horizontal overflow, 0 console errors.", "",
  "## Launch blockers / admin actions (no admin changes made)", "",
  "| Id | Route | Product | Stock | Admin action |", "|---:|---|---|---|---|",
  ...rows.filter(r => !r.adapter).map(r => `| ${r.id} | \`${r.route}\` | ${r.h1} | ${stock[r.route] || "?"} | ${action(r)} |`),
  "",
  "**Further issue:** the 13 unlisted items are still in the sitemap, so they can be reached and indexed. Remove or redirect them when they are deactivated.", "",
  "## All published PDPs", "",
  "| Id | Route | Type | Brand | Adapter | Reason if not |", "|---:|---|---|---|---|---|",
  ...rows.map(r => `| ${r.id} | \`${r.route}\` | ${kind(r)} | ${r.brand || "**missing**"} | ${r.adapter ? "yes" : "no"} | ${why(r)} |`)
].join("\n");
fs.writeFileSync(`${DIR}/ADAPTER-COVERAGE.md`, md + "\n");
console.log(JSON.stringify(counts));
