// TASK 17 — genererar de datatunga dokumenten ur JSON-underlaget (ingen nätverkstrafik).
// Utdata: CURRENT-CATALOG-MATRIX.md, SERIES-FORMAT-MATRIX.json/.md, NYEHANDEL-VISIBILITY-ACTIONS.md,
// STALE-ID-MAP.md, PACKAGE-MIGRATION-PLAN.md (tabelldelen; resonemanget står överst i filen).
// Kör: node build-docs.mjs
import fs from "node:fs"; import path from "node:path";
const DIR = path.dirname(new URL(import.meta.url).pathname);
const J = f => JSON.parse(fs.readFileSync(path.join(DIR, f), "utf8"));
const MX = J("CURRENT-CATALOG-MATRIX.json"), W = J("runs/analysis.json").woo, NH = J("runs/nh.json");
const REG = J("PACKAGE-REGISTRY.json"), STALE = J("runs/stale-ids.json"), ROUTES = J("runs/routes.json"), DOCS = J("runs/docs.json");
const rows = MX.rows;
const esc = s => String(s == null ? "" : s).replace(/\|/g, "\\|").replace(/\n/g, " ");
const kr = n => n == null ? "–" : String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, " ");
const vol = v => !v ? "–" : v.ml != null ? (v.dual ? `${v.text} (= ${v.ml} ml totalt)` : v.ml + " ml") : v.g != null ? v.g + " g" : v.text;
const today = "2026-11-03";
const hdr = (t, extra = "") => `# ${t}\n\nTASK 17 · ${today} · källor: WooCommerce-livesidan (Store API alla synlighetslägen, kategorisidornas listningar, produktsidornas HZY_PRODUKT/HZY_PAKET/HZY_EXTRA) och Nyehandel (sitemap, ${Object.keys(NH.categories).length} kategorier med alla sidor, produktsidor, product/state). Genererad av \`build-docs.mjs\` ur JSON-filerna i samma mapp.${extra}\n\n`;

// ---------- CURRENT-CATALOG-MATRIX.md
{
  const cnt = {}; rows.forEach(r => cnt[r.visibilityClass] = (cnt[r.visibilityClass] || 0) + 1);
  const kinds = {}; rows.forEach(r => kinds[r.kind] = (kinds[r.kind] || 0) + 1);
  let md = hdr("Aktuell katalogmatris (WooCommerce ↔ Nyehandel)");
  md += `## Sammanfattning\n\n| | Antal |\n|---|---:|\n| WooCommerce-produkter (alla synlighetslägen) | ${rows.length} |\n| Nyehandel-produkter (sitemap = Alla produkter) | ${NH.products.length} |\n| Matchade (slug, alla 140; SKU \`HZY-WC-<Woo-id>\` bekräftar) | ${rows.filter(r => r.match === "slug").length} |\n| Bara i Nyehandel / bara i Woo | ${MX.nhOnly.length} / ${rows.filter(r => !r.nhId).length} |\n`;
  md += Object.entries(kinds).map(([k, v]) => `| Typ: ${k} | ${v} |`).join("\n") + "\n";
  md += Object.entries(cnt).map(([k, v]) => `| **${k}** | ${v} |`).join("\n") + "\n\n";
  const iss = {}; rows.forEach(r => r.issues.forEach(x => { const k = x.replace(/\d+(\.\d+)?/g, "#"); iss[k] = (iss[k] || 0) + 1; }));
  md += "## Avvikelser (antal produkter)\n\n| Avvikelse | Antal |\n|---|---:|\n" + Object.entries(iss).sort((a, b) => b[1] - a[1]).map(([k, v]) => `| ${esc(k)} | ${v} |`).join("\n") + "\n\n";
  const sale = rows.filter(r => r.price.wooSale != null);
  md += `Priser: alla 140 stämmer (Nyehandels product/state är exkl. moms; ×1,25 = JSON-LD-priset = WooCommerce). Rea i WooCommerce: ${sale.length} (${sale.map(r => r.wooSlug + " " + r.price.wooRegular + " → " + r.price.wooSale + " kr").join(", ")}); Nyehandel har samma jämförelsepris på ${sale.filter(r => r.price.nhCompare === r.price.wooRegular).length} av dem.\n\n`;
  md += "## Produkter\n\nKolumner: synlighetsklass · Woo (id, slug, synlighet, listad i) · NH (id) · typ · format · serie · cannabinoid · volym/vikt · pris Woo/NH · lager Woo/NH · bilder Woo/NH · avvikelse → åtgärd. Full data (URL:er, varianter, paketsteg, kategorier) i `CURRENT-CATALOG-MATRIX.json`.\n\n";
  md += "| Klass | Woo-id | Slug (= NH-slug) | Woo-namn | Woo-synlighet | Listad i Woo | NH-id | Typ | Format | Serie | Cannabinoid | Volym/vikt | Pris Woo / NH | Lager Woo / NH | Bilder W/N | Avvikelse | Åtgärd |\n|---|---:|---|---|---|---|---:|---|---|---|---|---|---|---|---|---|---|\n";
  const order = ["PUBLIC + LISTED", "PUBLIC BUT DIRECT-ONLY", "PACKAGE/CHILD PRODUCT", "HIDDEN/LEGACY", "UNCERTAIN – OWNER DECISION REQUIRED"];
  for (const r of [...rows].sort((a, b) => order.indexOf(a.visibilityClass) - order.indexOf(b.visibilityClass) || (a.series || "~").localeCompare(b.series || "~") || a.format.localeCompare(b.format) || a.wooSlug.localeCompare(b.wooSlug))) {
    const listed = r.wooListedIn.filter(x => x !== "butik" && x !== "alla-produkter").join(", ") || (r.wooListedIn.length ? "alla-produkter" : "–");
    md += `| ${r.visibilityClass} | ${r.wooId} | ${r.wooSlug} | ${esc(r.wooName)} | ${r.wooVisibility} | ${esc(listed)} | ${r.nhId} | ${r.kind}${r.nhIsPackage ? "" : r.kind === "paket" ? " (NH: vanlig)" : ""} | ${r.format} | ${r.series || "–"} | ${r.cannabinoids.join(" + ") || "–"} | ${esc(vol(r.volume))} | ${kr(r.price.woo)} / ${kr(r.price.nh)} | ${r.stock.woo} / ${r.stock.nh} | ${r.images.woo}/${r.images.nh} | ${esc(r.issues.join("; ") || "–")} | ${esc(r.action)} |\n`;
  }
  fs.writeFileSync(path.join(DIR, "CURRENT-CATALOG-MATRIX.md"), md);
}

// ---------- SERIES-FORMAT-MATRIX
{
  const SERIES = ["Magic Sauce", "THCaB", "THCbA", "D10", "Nano-11", "Core", "THCB (legacy)", "THCV", "(ingen serie: CBD/H4CBD/CBN/CBG m.fl.)"];
  const FORMATS = ["vape", "cart", "refill", "buds", "hasch", "pre-roll", "kit", "batteri", "merch", "isolat"];
  const ser = r => r.series || "(ingen serie: CBD/H4CBD/CBN/CBG m.fl.)";
  const cell = (s, f) => rows.filter(r => ser(r) === s && r.format === f);
  // Kanonisk NH-kategori per kombination: den med högst F1 mot kombinationens alla produkter.
  const cats = Object.values(NH.categories).filter(c => c.status === 200 && c.count > 0 && c.route !== "/sv/categories/alla-produkter");
  function bestCat(list) {
    const set = new Set(list.map(r => r.nhSlug)); let best = null;
    for (const c of cats) { const inter = c.slugs.filter(x => set.has(x)).length; if (!inter) continue; const pr = inter / c.slugs.length, rc = inter / set.size, f1 = 2 * pr * rc / (pr + rc); if (!best || f1 > best.f1) best = { route: c.route, h1: c.h1, f1: +f1.toFixed(2), precision: +pr.toFixed(2), recall: +rc.toFixed(2), count: c.count }; }
    return best;
  }
  const T8 = { // Theme 8-route efter TASK 17 (05-header.js / 06-catalog-map.js)
    "Magic Sauce|vape": "ms-vapes", "Magic Sauce|cart": "ms-carts", "Magic Sauce|buds": "ms-buds", "Magic Sauce|hasch": "ms-hash", "Magic Sauce|refill": "alla-liquids (format)",
    "THCaB|vape": "thcab-vapes", "THCaB|cart": "thcab-vapes (carten ligger där)", "THCbA|vape": "thcba-vapes", "D10|vape": "d10-vapes", "D10|buds": "d10-buds", "D10|hasch": "d10-hash",
    "Nano-11|buds": "nano11-blommor", "Nano-11|hasch": "– (nano11-hash finns, ingen headerlänk)", "Core|vape": "core-vapes", "Core|hasch": "high-life-hash", "Core|buds": "– (bara sökbara i Woo)",
    "Magic Sauce|pre-roll": "magic-sauce (hubbens Pre-rolls-format)", "Nano-11|pre-roll": "nano-11 (hubbens Pre-rolls-format)", "THCV|vape": "thcv-vape (legacy-länk i headern)",
    "(ingen serie: CBD/H4CBD/CBN/CBG m.fl.)|vape": "cbd-vapes, h4cbd-vape, cbn (CBD-menyn)", "(ingen serie: CBD/H4CBD/CBN/CBG m.fl.)|buds": "cbd-buds-1 (CBD-menyn)",
    "(ingen serie: CBD/H4CBD/CBN/CBG m.fl.)|hasch": "h4cbd-hasch (CBD-menyn)", "(ingen serie: CBD/H4CBD/CBN/CBG m.fl.)|batteri": "pennor", "(ingen serie: CBD/H4CBD/CBN/CBG m.fl.)|cart": "– (ingen CBD-carts-kategori)",
    "(ingen serie: CBD/H4CBD/CBN/CBG m.fl.)|pre-roll": "– (ingen pre-roll-kategori)", "(ingen serie: CBD/H4CBD/CBN/CBG m.fl.)|merch": "merch (ingen headerlänk)"
  };
  const matrix = [];
  for (const s of SERIES) for (const f of FORMATS) {
    const list = cell(s, f); if (!list.length) continue;
    const by = k => list.filter(r => r.visibilityClass === k).length;
    const vols = [...new Set(list.map(r => r.volume && (r.volume.ml != null ? r.volume.ml + " ml" + (r.volume.dual ? " (1+1)" : "") : r.volume.g != null ? r.volume.g + " g" : null)).filter(Boolean))];
    const listed = list.filter(r => r.visibilityClass === "PUBLIC + LISTED");
    const wooCats = [...new Set(listed.flatMap(r => r.wooListedIn))].filter(x => !["butik", "alla-produkter"].includes(x));
    matrix.push({ series: s, format: f, total: list.length, listed: by("PUBLIC + LISTED"), directOnly: by("PUBLIC BUT DIRECT-ONLY"), packageOrChild: by("PACKAGE/CHILD PRODUCT"), hidden: by("HIDDEN/LEGACY"), uncertain: by("UNCERTAIN – OWNER DECISION REQUIRED"),
      inStockListed: listed.filter(r => r.stock.woo !== "slut").length, volumes: vols, wooListedIn: wooCats, nhBestCategory: bestCat(list), nhBestCategoryListedOnly: listed.length ? bestCat(listed) : null, theme8Route: T8[s + "|" + f] || null,
      products: list.map(r => ({ nhId: r.nhId, slug: r.nhSlug, cls: r.visibilityClass, stock: r.stock.woo })) });
  }
  fs.writeFileSync(path.join(DIR, "SERIES-FORMAT-MATRIX.json"), JSON.stringify({ schema: "task17-series-format/1", generated: new Date().toISOString(), rules: { volume: "1+1 ml räknas som totalt 2 ml i volymfiltret; namnet behåller 1+1 ml", d10: "D10 ≠ 10-OH-THC", preroll: "pre-roll = eget format; tillhör även Buds eller Hasch efter innehåll (variantens (Buds)/(Hash))" }, cells: matrix }, null, 1));
  let md = hdr("Serie × format-matris");
  md += "Antal per kombination: **listade** (kundsynligt listade i WooCommerce) / direkt-only / paket eller paketbarn / dolda. \"I lager\" gäller de listade. NH-kategori = den Nyehandel-kategori som bäst täcker kombinationens listade produkter (F1, precision = andel av kategorin som hör hit). Theme 8-route = vad headern/relationskartan pekar på efter TASK 17.\n\n";
  md += "| Serie | Format | Listade | I lager | Direkt | Paket/barn | Dolda | Volym/vikt | Woo-kategori (listade) | Bästa NH-kategori (listade) | Theme 8-route | Lucka |\n|---|---|---:|---:|---:|---:|---:|---|---|---|---|---|\n";
  for (const c of matrix) {
    const best = c.nhBestCategoryListedOnly || c.nhBestCategory;
    const gap = !c.listed ? "inga listade produkter i Woo" : !c.theme8Route || /^–/.test(c.theme8Route) ? "ingen egen Theme 8-route" : best && best.precision < 1 ? `NH-kategorin innehåller ${Math.round((1 - best.precision) * 100)} % olistade/andra (dölj i admin)` : "–";
    md += `| ${c.series} | ${c.format} | ${c.listed} | ${c.inStockListed} | ${c.directOnly} | ${c.packageOrChild} | ${c.hidden} | ${c.volumes.join(", ") || "–"} | ${c.wooListedIn.join(", ") || "–"} | ${best ? `${best.route.replace("/sv/categories/", "")} (${best.count} st, prec ${best.precision})` : "–"} | ${c.theme8Route || "–"} | ${gap} |\n`;
  }
  md += "\n## Särskilt kontrollerade sortimentsdelar\n\n" + fs.readFileSync(path.join(DIR, "runs/special-checks.md"), "utf8");
  fs.writeFileSync(path.join(DIR, "SERIES-FORMAT-MATRIX.md"), md);
}

// ---------- NYEHANDEL-VISIBILITY-ACTIONS.md
{
  let md = hdr("Synlighetsåtgärder i Nyehandel (ingen ändring gjord)", "\n\n**Inga adminändringar är gjorda i denna körning.** Listan är exakt: varje rad är en Nyehandel-produkt (id och slug) och vad WooCommerce visar en kund i dag. \"Dölj i listningar\" = ska inte synas i Alla produkter, kategorisidor, Bästsäljare-källan, sök och rekommendationer; produktsidan behövs fortfarande (paket/strainbarn/direktlänk) och ska inte raderas. Bekräfta Nyehandels exakta synlighetsinställning (t.ex. dold i listning kontra avpublicerad) innan massändring");
  const groups = [
    ["A. Dölj i listningar – Woo-paket importerade som vanliga produkter (36)", r => r.kind === "paket" || r.format === "kit", "Dölj tills paketprodukten är ombyggd och provköpt (PACKAGE-MIGRATION-PLAN.md). Säljs i dag som vanlig produkt med eget pris men lager 0."],
    ["B. Dölj i listningar – strainbarn som bara säljs via paket/familjebyggare", r => r.kind !== "paket" && r.format !== "kit" && r.visibilityClass === "PACKAGE/CHILD PRODUCT", "Dolda i WooCommerce (catalog_visibility=hidden), ingår i Nano11-paketen. Behövs som paketdelar."],
    ["C. Dölj i listningar, behåll direktlänk/sök – sökbara men olistade i WooCommerce", r => r.visibilityClass === "PUBLIC BUT DIRECT-ONLY", "catalog_visibility=search i WooCommerce: nås via sök och direktlänk men listas aldrig i kategorier."],
    ["D. Dölj helt – tjänst/legacy", r => r.visibilityClass === "HIDDEN/LEGACY", "Fraktändring är en tjänstepost, aldrig sortiment."],
    ["E. Granska – ägarbeslut", r => r.visibilityClass === "UNCERTAIN – OWNER DECISION REQUIRED", ""],
    ["F. Visa (redan listade i båda, ingen åtgärd)", r => r.visibilityClass === "PUBLIC + LISTED", "Listade i WooCommerce och i motsvarande Nyehandel-kategorier (medlemskapen stämmer: 0 Woo-listade produkter saknas i NH-kategorin)."]
  ];
  for (const [title, f, note] of groups) {
    const list = rows.filter(f); if (!list.length && !/^E/.test(title)) continue;
    md += `## ${title.replace(/\(\d+\)/, `(${list.length})`)}\n\n${note}\n\n`;
    if (!list.length) { md += "Inga.\n\n"; continue; }
    if (/^F/.test(title)) { md += list.map(r => `${r.nhId} \`${r.nhSlug}\``).join(" · ") + "\n\n"; continue; }
    md += "| NH-id | Slug | Namn | Woo-synlighet | Lager Woo / NH | Listad i NH i dag | Varför |\n|---:|---|---|---|---|---|---|\n";
    md += list.map(r => `| ${r.nhId} | ${r.nhSlug} | ${esc(r.nhName)} | ${r.wooVisibility} | ${r.stock.woo} / ${r.stock.nh} | ${r.nhListedIn.map(x => x.replace("/sv/categories/", "")).join(", ")} | ${esc(r.visibilityWhy)} |`).join("\n") + "\n\n";
  }
  md += "## Lageravvikelser att rätta samtidigt\n\n| NH-id | Slug | Woo | NH | Not |\n|---:|---|---|---|---|\n";
  md += rows.filter(r => r.issues.some(x => /^lager/.test(x))).map(r => `| ${r.nhId} | ${r.nhSlug} | ${r.stock.woo} | ${r.stock.nh} | ${r.kind === "paket" ? "paket: NH-lager 0, Woo räknar paketlager ur delarna" : r.format === "tjänst" ? "tjänst, ingen åtgärd" : "**säljbar i NH men slut i Woo** – rätta lagret före launch"} |`).join("\n") + "\n";
  fs.writeFileSync(path.join(DIR, "NYEHANDEL-VISIBILITY-ACTIONS.md"), md);
}

// ---------- STALE-ID-MAP.md
{
  let md = hdr("Gamla id:n och routes efter migreringen");
  md += "## 1. Produkt-id i Theme 8-koden (före → efter TASK 17)\n\nAlla 121 gamla Nyehandel-produkt-id (1–121) är borta: de nya produkterna har id 124–262. Identitetskedja: gammalt id/route (Task 10A `routes.tsv`) → Woo-id (Task 10A, bara match \"säker\") → nytt id (samma slug som Woo, variant-SKU `HZY-WC-<Woo-id>`).\n\n";
  md += "| Register (fil) | Före | Efter |\n|---|---|---|\n";
  md += "| `FAMILIES` (85-pdp-pilot.js) | ms50: 10 gamla id, nano11: 2 gamla id (alla borta) | ms50 17, nano11 16, highlife 5 – nya id ur WooCommerce HZY_EXTRA.familj |\n";
  md += "| `PACKAGE_PLAN` (85-pdp-pilot.js, läses även av 84-cart.js) | 14 gamla id | 49 nya id ur WooCommerce HZY_PAKET (modell + steg, inga priser) |\n";
  md += "| `PACKAGE_PRODUCTS` | {} | {} (oförändrat: inget paket verifierat) |\n";
  md += "| `VERIFIED_DOCS` (85-pdp-pilot.js) | 11 gamla id med Nyehandel-S3-filer som inte längre är länkade | 18 nya id med de filer produkterna länkar i dag, strain-verifierade ur filnamnet |\n";
  md += "| Headerns utvalda produkter (05-header.js) | 4 gamla slugs (301 → tom kategori) | 4 befintliga produkter, badge UTVALD PRODUKT |\n";
  md += "| Startsidans produktomdömen (55-reviews.js) | 9 poster mot gamla slugs | 3 bytta (säker kedja), 6 kvar; inga omdömen finns i NH efter importen |\n\n";
  md += "## 2. Gamla → nya produkt-id (alla 121)\n\nStatus: MAPPAD (säker kedja) · OSÄKER (10A-matchningen var osäker; kandidat anges men används inte i koden) · INGEN WOO-MOTSVARIGHET · PRODUKTEN FINNS INTE LÄNGRE (Woo-produkten är borttagen). Gamla routes svarar i dag 301 till tomma, olänkade kategorier (`vapes-ny`, `buds-ny`, `hash-ny`) – se ADMIN-CATEGORY-ACTIONS.md för redirects.\n\n";
  md += "| Gammalt id | Gammal route | Woo-id | Nytt id | Ny route | Status | Kandidat (bara dokumentation) |\n|---:|---|---:|---:|---|---|---|\n";
  md += STALE.map(x => `| ${x.oldId} | ${x.oldRoute.replace("/sv/products/", "")} | ${x.wooId || "–"} | ${x.newId || "–"} | ${x.newRoute ? x.newRoute.replace("/sv/products/", "") : "–"} | ${x.status} | ${x.candidate ? `${x.candidate.newId} ${esc(x.candidate.name)} (${x.candidate.score})` : ""} |`).join("\n") + "\n\n";
  md += "## 3. Kategori-routes i Theme 8-koden (efter TASK 17)\n\nStatisk genomgång av `theme8/js` mot dagens Nyehandel (`routes.mjs`). Kvarvarande TOM/DÖD är medvetna: legacy (HHCPM/THCNM), ägarbeslut (THCa-kortet) eller adminberoende.\n\n";
  const after = fs.existsSync(path.join(DIR, "runs/routes-after.json")) ? J("runs/routes-after.json") : ROUTES;
  md += "| Fil:rad | Route | Status | NH H1 | Antal |\n|---|---|---|---|---:|\n" + after.categories.filter(c => c.status !== "OK").map(c => `| ${c.at} | ${c.route} | ${c.status} | ${c.h1 || "–"} | ${c.count ?? "–"} |`).join("\n") + "\n\n";
  md += "Produkt-routes i koden som inte finns: " + (after.products.filter(p => p.status !== "OK").map(p => "`" + p.slug + "` (" + p.at + ")").join(", ") || "inga") + ".\n";
  fs.writeFileSync(path.join(DIR, "STALE-ID-MAP.md"), md);
}

// ---------- PACKAGE-MIGRATION-PLAN.md (tabelldel)
{
  const head = fs.readFileSync(path.join(DIR, "runs/package-plan-head.md"), "utf8");
  let md = hdr("Paketmigrering – plan och register") + head + "\n\n## Paketsteg per basprodukt\n\nPris = WooCommerce fast paketpris; ord. = ordinarie totalpris (antal × styckpris). Alla steg: **BLOCKED**.\n\n";
  md += "| Bas (NH-id) | Basprodukt | Modell | Blandning | Steg | Woo-paket (NH-id) | Fast pris | Ord. totalt | Spar | Woo-lager | NH is_package |\n|---:|---|---|---|---|---|---:|---:|---:|---|---|\n";
  for (const p of REG.packages) for (const s of p.steps) md += `| ${p.baseNhId} | ${esc(p.baseName)} | ${p.model}${p.family ? " (" + p.family + ")" : ""} | ${p.mixingAllowed ? "ja" : "nej (samma variant × N)"} | ${s.code} | ${esc(s.wooBundleName)} (${s.nhProductId}) | ${kr(s.wooPrice)} | ${kr(s.wooRegularTotal)} | ${s.wooRegularTotal && s.wooPrice ? Math.round((1 - s.wooPrice / s.wooRegularTotal) * 1000) / 10 + " %" : "–"} | ${s.wooInStock ? "i lager" : "slut"} | ${s.nhIsPackage ? "ja" : "nej (vanlig produkt)"} |\n`;
  md += "\n## Paket som ingen basprodukt säljer\n\n| NH-id | Woo-paket | Delar | Pris | Woo-lager | Woo-synlighet |\n|---:|---|---|---:|---|---|\n" + REG.orphanPackages.map(o => `| ${o.nhId} | ${esc(o.name)} | ${o.parts.join(", ")} | ${kr(o.wooPrice)} | ${o.wooStock} | ${o.visibility} |`).join("\n") + "\n\n";
  md += "## Familjer (tillåtna produkter i familjebyggaren)\n\n" + Object.values(REG.families).map(f => `**${f.key} – ${f.name}** (${Object.keys(f.members).length}): ` + Object.values(f.members).map(m => `${m.nhId} ${esc(m.name)}${m.visibilityClass !== "PUBLIC + LISTED" ? " *(" + m.visibilityClass.toLowerCase() + ")*" : ""}`).join(" · ")).join("\n\n") + "\n";
  fs.writeFileSync(path.join(DIR, "PACKAGE-MIGRATION-PLAN.md"), md);
}
// ---------- PRODUCT-IMAGE-AUDIT.md (tabelldel; bedömningen står i runs/image-audit-head.md)
{
  const IA = J("runs/image-audit.json");
  const head = fs.readFileSync(path.join(DIR, "runs/image-audit-head.md"), "utf8");
  const bgOf = r => !r.bg ? "–" : r.bg.transparent ? "transparent" : r.bg.white ? "vit" : r.bg.spread >= 40 ? "ojämn/miljö" : `enhetlig (${r.bg.rgb.join(",")})`;
  let md = hdr("Produktbilder efter migreringen – inventering") + head + "\n\n## Alla produkter (första bilden)\n\nMätt på Nyehandels original (`image_url`), nedskalad till 400 px för analys. Fyllnad = produktens bounding box som andel av bildytan (bakgrund = hörnens färg). Kant = andel av kanten där motivet går ut i bildkanten.\n\n";
  md += "| NH-id | Slug | Klass | Format | Bilder NH/Woo | Storlek | Bakgrund | Fyllnad | Kant | Flaggor |\n|---:|---|---|---|---|---|---|---:|---:|---|\n";
  const order = ["PUBLIC + LISTED", "PUBLIC BUT DIRECT-ONLY", "PACKAGE/CHILD PRODUCT", "HIDDEN/LEGACY"];
  for (const r of [...IA].sort((a, b) => order.indexOf(a.visibilityClass) - order.indexOf(b.visibilityClass) || a.format.localeCompare(b.format) || a.slug.localeCompare(b.slug)))
    md += `| ${r.nhId} | ${r.slug} | ${r.visibilityClass} | ${r.format} | ${r.count}/${r.wooCount} | ${r.w ? r.w + "×" + r.h : "–"} | ${bgOf(r)} | ${r.bboxArea ? Math.round(r.bboxArea * 100) + " %" : "–"} | ${r.edgeTouch != null ? Math.round(r.edgeTouch * 100) + " %" : "–"} | ${esc(r.flags.join("; ") || "–")} |\n`;
  fs.writeFileSync(path.join(DIR, "PRODUCT-IMAGE-AUDIT.md"), md);
}
console.log("docs written");
