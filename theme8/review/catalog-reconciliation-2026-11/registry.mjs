// TASK 17 — maskinläsbart paket-/familjeregister + analysregister ur dagens data (ingen nätverkstrafik).
// Källor: runs/analysis.json (WooCommerce: HZY_PAKET, HZY_EXTRA.familj, bundled_items), CURRENT-CATALOG-MATRIX.json
// (Woo-id -> nytt Nyehandel-id), runs/docs.json (verifierade analys-PDF:er).
// Utdata: PACKAGE-REGISTRY.json och runs/registry-snippet.js (FAMILIES, PACKAGE_PLAN, VERIFIED_DOCS för 85-pdp-pilot.js).
// Inga priser används i Theme 8-koden; de finns bara i registret som WooCommerce-facit för adminarbetet.
// Kör: node registry.mjs
import fs from "node:fs"; import path from "node:path";
const DIR = path.dirname(new URL(import.meta.url).pathname);
const W = JSON.parse(fs.readFileSync(path.join(DIR, "runs/analysis.json"), "utf8")).woo;
const M = JSON.parse(fs.readFileSync(path.join(DIR, "CURRENT-CATALOG-MATRIX.json"), "utf8")).rows;
const DOCS = JSON.parse(fs.readFileSync(path.join(DIR, "runs/docs.json"), "utf8"));
const row = id => M.find(r => r.wooId === id);
const wById = Object.fromEntries(W.map(w => [w.id, w]));

// ---- familjer (WooCommerce "familjebyggare": blandade strains över separata produkter)
const famKey = name => /magic sauce/i.test(name) ? "ms50" : /nano/i.test(name) ? "nano11" : /high life|gringo/i.test(name) ? "highlife" : name.toLowerCase().replace(/[^a-z0-9]+/g, "");
const families = {};
for (const w of W.filter(x => x.family)) {
  const k = famKey(w.family.name);
  const f = families[k] = families[k] || { key: k, name: w.family.name, members: {} };
  for (const m of w.family.members) { const r = row(m.id); if (r) f.members[r.nhId] = { nhId: r.nhId, route: "/sv/products/" + r.nhSlug, wooId: m.id, name: r.nhName, visibilityClass: r.visibilityClass }; }
}

// ---- paketsteg per basprodukt
const packages = [];
const plan = {};
for (const w of W.filter(x => x.packageSteps.length)) {
  const base = row(w.id);
  const famK = w.family ? famKey(w.family.name) : null;
  const model = famK ? "family" : w.type === "variable" ? "strain" : "same";
  const steps = w.packageSteps.filter(s => s.qty > 1).map(s => {
    const b = wById[s.bundleId], br = b && row(b.id);
    const name = b ? b.name : s.name || "";
    const kind = /kollektion/i.test(name) ? "collection" : s.regular && s.price && Math.abs(s.price - s.regular * 2 / 3) < 1 && s.qty === 3 ? "threeForTwo" : model;
    return {
      qty: s.qty, kind, code: s.qty + (kind === "collection" ? "K" : kind === "threeForTwo" ? "F2" : ""),
      wooBundleId: s.bundleId, wooBundleSlug: b && b.slug, wooBundleName: name,
      nhProductId: br ? br.nhId : null, nhRoute: br ? "/sv/products/" + br.nhSlug : null,
      nhIsPackage: br ? !!br.nhIsPackage : null,
      wooPrice: s.price, wooRegularTotal: s.regular, wooInStock: s.inStock,
      wooBundleStock: b && b.bundle ? b.bundle.stockStatus : null,
      slots: b && b.bundle ? b.bundle.slots.length : null,
      allowedProducts: b && b.bundle ? [...new Set(b.bundle.slots.map(sl => sl.productId))].map(id => { const r = row(id); return r ? { nhId: r.nhId, wooId: id, name: r.nhName } : { wooId: id }; }) : [],
      allowedVariations: b && b.bundle ? [...new Set(b.bundle.slots.flatMap(sl => sl.allowedVariations || []))] : [],
      status: "BLOCKED"
    };
  });
  if (!steps.length) continue;
  packages.push({ baseWooId: w.id, baseNhId: base.nhId, baseRoute: "/sv/products/" + base.nhSlug, baseName: base.nhName, model, family: famK, strains: w.packageStrains, mixingAllowed: model !== "same", steps,
    stockRule: model === "same" ? "en variant × N: basproduktens lager ≥ N" : "varje plats väljer en strain; slutsålda strains syns men kan inte väljas (WooCommerce-byggaren); paketets lager = WooCommerce bundle_stock_status" });
  plan[base.nhId] = { model, family: famK || undefined, steps: steps.map(s => s.code) };
}
// Paket som inte nås från någon basprodukts HZY_PAKET (kit, fristående paket).
const reached = new Set(packages.flatMap(p => p.steps.map(s => s.wooBundleId)));
const orphans = W.filter(w => w.bundle && !reached.has(w.id)).map(w => { const r = row(w.id); return { wooId: w.id, wooSlug: w.slug, name: w.name, nhId: r && r.nhId, nhIsPackage: r ? !!r.nhIsPackage : null, wooPrice: w.bundle.price, wooStock: w.bundle.stockStatus, parts: (w.bundle.parts || []).map(p => p.slug), visibility: w.visibility, status: "BLOCKED" }; });

// ---- verifierade analysdokument (nytt NH-id -> fil)
const docs = {};
for (const p of DOCS) {
  const own = p.docs.filter(d => d.relation === "egen-verifierad").map(d => d.file);
  const vars = p.docs.filter(d => d.relation === "variant-verifierad");
  if (vars.length) docs[p.id] = { variants: Object.fromEntries(vars.map(d => [String(d.variant), d.file])) };
  else if (own.length) docs[p.id] = { doc: own.length === 1 ? own[0] : [...new Set(own)] };
}

const reg = { schema: "hazey-package-registry/1", generated: new Date().toISOString(), note: "Alla paket BLOCKED: inga is_package-produkter i Nyehandel; inget steg är provköpt i varukorg/kassa. Priser = WooCommerce-facit, används inte av Theme 8.", families, packages, orphanPackages: orphans, verifiedDocs: docs };
fs.writeFileSync(path.join(DIR, "PACKAGE-REGISTRY.json"), JSON.stringify(reg, null, 1));

// ---- JS-block för 85-pdp-pilot.js
const famJs = Object.values(families).map(f => `    ${f.key}: { name: ${JSON.stringify(f.name)}, members: {\n` + Object.values(f.members).map(m => `      ${m.nhId}: ${JSON.stringify(m.route)}`).join(",\n") + " } }").join(",\n");
const planJs = Object.entries(plan).map(([id, p]) => `      ${id}: { model: "${p.model}"${p.family ? `, family: "${p.family}"` : ""}, steps: ${JSON.stringify(p.steps)} }`).join(",\n");
const docJs = Object.entries(docs).map(([id, d]) => `    ${id}: ${JSON.stringify(d).replace(/":/g, '": ').replace(/,"/g, ', "')}`).join(",\n");
fs.writeFileSync(path.join(DIR, "runs/registry-snippet.js"), `// FAMILIES\n${famJs}\n// PACKAGE_PLAN\n${planJs}\n// VERIFIED_DOCS\n${docJs}\n`);
console.log("families", Object.keys(families).map(k => k + ":" + Object.keys(families[k].members).length).join(" "), "packages(base)", packages.length, "steps", packages.reduce((a, p) => a + p.steps.length, 0), "orphans", orphans.length, "docs", Object.keys(docs).length);
