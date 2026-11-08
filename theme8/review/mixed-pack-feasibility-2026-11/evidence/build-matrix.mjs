// TASK 19 — gruppmatris: PACKAGE-REGISTRY.json + CURRENT-CATALOG-MATRIX.json (Task 17) + live nh-groups-<datum>.json.
// Medlemskap tas ALDRIG ur namn/varumärke: bara WooCommerce-familj (HZY_EXTRA.familj via registret),
// WooCommerce-paketens tillåtna produkter, eller Nyehandels kategorilistning (live). Källan anges per grupp.
// Styckpris = Nyehandels formaterade pris inkl. moms. Prisgrupp = (ägargrupp, styckpris).
// Kör: node build-matrix.mjs nh-groups-2026-11-06.json  ->  ../GROUP-MATRIX.json + ../GROUP-MATRIX.md
import fs from "node:fs"; import path from "node:path";
const DIR = path.dirname(new URL(import.meta.url).pathname);
const REC = path.resolve(DIR, "../../catalog-reconciliation-2026-11");
const reg = JSON.parse(fs.readFileSync(path.join(REC, "PACKAGE-REGISTRY.json"), "utf8"));
const cat = JSON.parse(fs.readFileSync(path.join(REC, "CURRENT-CATALOG-MATRIX.json"), "utf8"));
const live = JSON.parse(fs.readFileSync(path.join(DIR, process.argv[2] || "nh-groups-2026-11-06.json"), "utf8"));
const byId = Object.fromEntries(Object.values(live.products).filter(p => p.id).map(p => [p.id, p]));
const row = id => cat.rows.find(r => r.nhId === id) || {};
const kr = s => s == null ? null : +String(s).replace(/\s|kr/g, "").replace(",", ".");
const inCats = (...cs) => Object.values(live.products).filter(p => p.id && !p.is_package && !/–\s*\d+-pack|Kollektion|kollektionen|Startpaket/i.test(p.name) && cs.some(c => p.categories.includes(c))).map(p => p.id);
const fam = k => Object.keys(reg.families[k].members).map(Number);

// Ägarens grupper (2026-11-06). Källan per grupp är medlemskapsbeviset.
const OWNER = [
  { key: "ms-bh", name: "Magic Sauce buds + hasch", members: fam("ms50"), source: "WooCommerce-familj ms50 (HZY_EXTRA.familj) = tillåtna produkter i Woo-paketen ms50-5g-3/5/10-pack; korskontroll: NH-kategorierna ms-buds/ms-hash", mix: "separata produkter" },
  { key: "d10-bh", name: "D10 buds + hasch", members: inCats("d10-buds", "d10-hash"), source: "ENDAST Nyehandels kategorier d10-buds + d10-hash (live). Ingen Woo-familj och inget Woo-paket finns", mix: "separata produkter" },
  { key: "core-bh", name: "Core buds + hasch", members: fam("highlife"), source: "WooCommerce-familj highlife (\"High Life / El Gringo 5g\") = tillåtna produkter i Woo-paketen high-life-5g-3/5-pack; korskontroll: NH-kategorierna high-life-buds/high-life-hash (under hero-vapes)", mix: "separata produkter" },
  { key: "faraoh-vapes", name: "Faraoh vapes", members: [236, 242, 256, 251], source: "NH-kategori faraoh (236, 251) + Woo-paketens basprodukter 236/242/256 i registret. 242/256 ligger i thca-b, inte i faraoh: att de hör till \"Faraoh vapes\" bygger på Woo-paketet och produktnamnet → ägaren bekräftar", mix: "varianter av en produkt" },
  { key: "core-vapes", name: "Core vapes", members: inCats("core-vapes"), source: "NH-kategori core-vapes (live) + registrets basprodukt 255", mix: "varianter av en produkt" },
  { key: "ms-2ml", name: "Magic Sauce 2 ml", members: [261], source: "Registrets basprodukt 261 (Woo-paket ms-30-2ml-*)", mix: "varianter av en produkt" },
  { key: "ms-5ml", name: "Magic Sauce 5 ml", members: [260], source: "Registrets basprodukt 260 (Woo-paket ms-3-0-5ml-*)", mix: "varianter av en produkt" }
];

// Woo-paket per basprodukt ur registret.
const stepsFor = id => {
  const base = (reg.packages.find(p => p.baseNhId === id) || { steps: [] }).steps;
  // Fristående Woo-paket (orphanPackages) med exakt en del = denna produkt (Woo-slug), t.ex. THCA-B 1ml 3-pack (240).
  const orphans = reg.orphanPackages.filter(o => o.parts.length === 1 && o.parts[0] === row(id).wooSlug).map(o => ({ qty: +(/(\d+)-pack/.exec(o.name) || [])[1], kind: "strain", nhProductId: o.nhId, nhIsPackage: o.nhIsPackage, wooPrice: o.wooPrice, allowedProducts: [{ nhId: id }], orphan: o.visibility }));
  return base.concat(orphans);
};
const out = { generated: new Date().toISOString(), liveFrom: live.generated, rules: "Prisgrupp = ägargrupp × styckpris inkl. moms (format delar inte). Valbar = active && buyable && (lager > 0 || always_orderable).", groups: [] };
for (const g of OWNER) {
  const items = [];
  for (const id of g.members) {
    const p = byId[id]; const r = row(id);
    if (!p) { items.push({ productId: id, missingLive: true }); continue; }
    for (const v of p.variants) items.push({
      productId: id, product: p.name, variantId: v.id, sku: v.sku, strain: v.option || null,
      format: r.format || null, unit: kr(v.formatted), stock: v.stock, selectable: !!(v.active && v.buyable && (v.stock > 0 || v.always_orderable)),
      visibility: r.visibilityClass || null, nhCategories: p.categories
    });
  }
  // Dela i prisgrupper.
  const split = {};
  for (const it of items.filter(i => !i.missingLive)) { const k = String(it.unit); /* ägarregel: dela bara på styckpris */ (split[k] = split[k] || []).push(it); }
  const allUnits = [...new Set(items.map(i => i.unit))];
  const priceGroups = Object.entries(split).map(([k, its]) => {
    const prods = [...new Set(its.map(i => i.productId))];
    const unit = its[0].unit, fmt = [...new Set(its.map(i => i.format))].join("+");
    // Woo-paket: för variantgrupper basproduktens steg; för familjegrupper stegen på valfri medlem (samma paket).
    const steps = [...new Map(prods.flatMap(stepsFor).filter(s => s.qty === 3 || s.qty === 5).filter(s => s.kind !== "collection").map(s => [s.nhProductId, s])).values()];
    const packs = steps.sort((a, b) => a.qty - b.qty).map(s => {
      const allowed = (s.allowedProducts || []).map(a => a.nhId);
      const allowedUnits = [...new Set(allowed.map(a => byId[a] && kr(byId[a].variants[0]?.formatted)).filter(Boolean))];
      const mixedPrices = allowedUnits.length > 1;
      return { qty: s.qty, nhProductId: s.nhProductId, nhIsPackage: byId[s.nhProductId]?.is_package ?? s.nhIsPackage, sku: (byId[s.nhProductId]?.variants[0] || {}).sku || null, packageVariantId: (byId[s.nhProductId]?.variants[0] || {}).id || null,
        wooPrice: s.wooPrice, regular: s.qty * unit, orphan: s.orphan || null, priceStatus: mixedPrices ? `EJ GILTIGT: Woo-paketet blandade styckpris ${allowedUnits.join(" / ")} kr – nytt fast pris kräver ägarbeslut` : "Woo-facit, samma styckpris i hela paketet" + (s.orphan ? " (fristående Woo-paket, synlighet " + s.orphan + ")" : "") };
    });
    const sel = its.filter(i => i.selectable);
    return { id: `${g.key}:${fmt}:${unit}`, format: fmt, unit, products: prods, mixes: prods.length > 1 ? "separata produkter" : "varianter av en produkt",
      items: its, selectableCount: sel.length, selectableProducts: [...new Set(sel.map(i => i.productId))].length, packs,
      missingPacks: [3, 5].filter(q => !packs.some(p => p.qty === q)) };
  });
  out.groups.push({ ...g, unitPrices: allUnits, priceGroups });
}
fs.writeFileSync(path.join(DIR, "../GROUP-MATRIX.json"), JSON.stringify(out, null, 1));

// Markdown
const L = [];
L.push("# Gruppmatris: blandbara flerpack", "", `Genererad ${out.generated.slice(0, 10)} av \`evidence/build-matrix.mjs\` ur \`PACKAGE-REGISTRY.json\`, \`CURRENT-CATALOG-MATRIX.json\` (Task 17) och live Nyehandel (\`evidence/${process.argv[2] || "nh-groups-2026-11-06.json"}\`, ${live.generated.slice(0, 16).replace("T", " ")} UTC). Pris = Nyehandels styckpris inkl. moms. **Valbar** = aktiv, köpbar och lager > 0. Lager är en ögonblicksbild. Paketproduktens SKU och variant-id gäller den importerade vanliga produkten (alla har \`is_package=false\`).`, "");
for (const g of out.groups) {
  L.push(`## ${g.name}`, "", `**Medlemskap:** ${g.source}.`, `**Blandning:** ${g.mix}. **Styckpriser i gruppen:** ${g.unitPrices.join(" / ")} kr → ${g.priceGroups.length} prisgrupp${g.priceGroups.length > 1 ? "er" : ""}.`, "");
  for (const pg of g.priceGroups) {
    L.push(`### \`${pg.id}\`: ${pg.format}, ${pg.unit} kr/st · ${pg.mixes} · ${pg.selectableCount} valbara (${pg.selectableProducts} produkt${pg.selectableProducts === 1 ? "" : "er"})`, "");
    L.push("| Produkt-id | Variant-id | SKU | Produkt / strain | Format | Styckpris | Lager | Valbar | Synlighet |", "|---:|---:|---|---|---|---:|---:|---|---|");
    for (const i of pg.items) L.push(`| ${i.productId} | ${i.variantId} | ${i.sku} | ${i.strain ? i.strain : i.product} | ${i.format} | ${i.unit} | ${i.stock} | ${i.selectable ? "**ja**" : "nej"} | ${i.visibility === "PUBLIC + LISTED" ? "listad" : i.visibility === "PUBLIC BUT DIRECT-ONLY" ? "direktlänk" : i.visibility} |`);
    L.push("");
    if (pg.packs.length) {
      L.push("| Paket | NH-produkt | Paketvariant | SKU | is_package | Fast pris (Woo) | Ord. (antal × styck) | Prisstatus |", "|---|---:|---:|---|---|---:|---:|---|");
      for (const p of pg.packs) L.push(`| ${p.qty}-pack | ${p.nhProductId} | ${p.packageVariantId} | ${p.sku} | ${p.nhIsPackage} | ${p.wooPrice} | ${p.regular} | ${p.priceStatus} |`);
    }
    if (pg.missingPacks.length) L.push(`Saknas: ${pg.missingPacks.map(q => q + "-pack").join(", ")}. Det finns inget paket i Woo eller Nyehandel och inget fast pris. **Priset kräver ägarbeslut.**`);
    L.push("");
  }
}
fs.writeFileSync(path.join(DIR, "../GROUP-MATRIX.md"), L.join("\n"));
console.log(out.groups.map(g => g.name + ": " + g.priceGroups.map(p => `${p.id} sel=${p.selectableCount}/${p.items.length} prods=${p.products.join(",")} packs=${p.packs.map(x => x.qty + ":" + x.wooPrice + ":" + x.priceStatus.slice(0, 12)).join("|")} missing=${p.missingPacks}`).join("\n   ")).join("\n"));
