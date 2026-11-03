// TASK 17 — matchning och klassificering (ingen nätverkstrafik).
// Indata: cache/ (woo.mjs), runs/woo-raw.json, runs/nh.json
// Utdata: CURRENT-CATALOG-MATRIX.json, SERIES-FORMAT-MATRIX.json, PACKAGE-REGISTRY.json, runs/analysis.json
// Kör: node analyze.mjs
import fs from "node:fs";
import path from "node:path";
import { CACHE, cached } from "./lib/fetch-cache.mjs";

const DIR = path.dirname(new URL(import.meta.url).pathname);
const RAW = JSON.parse(fs.readFileSync(path.join(DIR, "runs/woo-raw.json"), "utf8"));
const NH = JSON.parse(fs.readFileSync(path.join(DIR, "runs/nh.json"), "utf8"));
const dec = s => String(s == null ? "" : s).replace(/&#8211;/g, "–").replace(/&#8217;/g, "’").replace(/&#8220;|&#8221;/g, '"').replace(/&#215;/g, "×").replace(/&#43;/g, "+").replace(/&nbsp;|&#160;/g, " ").replace(/&amp;/g, "&").replace(/&quot;/g, '"').replace(/&#0?39;/g, "'").trim();
const strip = s => dec(String(s || "").replace(/<[^>]+>/g, " ")).replace(/\s+/g, " ").trim();
const O = "https://www.hazey.se";

// ---------- WooCommerce ----------
function apiList(vis) {
  const out = [];
  for (let page = 1; page < 10; page++) {
    const r = cached(`${O}/wp-json/wc/store/v1/products?per_page=100&page=${page}&catalog_visibility=${vis}`);
    if (!r) break; const l = JSON.parse(r.body); out.push(...l); if (l.length < 100) break;
  }
  return out;
}
const API = apiList("any");
const VIS = Object.fromEntries(["visible", "catalog", "search", "hidden"].map(v => [v, new Set(apiList(v).map(p => p.id))]));
const byWooId = Object.fromEntries(API.map(p => [p.id, p]));
const CATS = RAW.categories;
const catById = Object.fromEntries(CATS.map(c => [c.id, c]));

/* Kategorisidornas faktiska listning. Sidan har flera <ul class="products">-listor (rälsar,
   megameny), så bara listposter (li.post-<id>) vars egna product_cat-klasser innehåller sidans
   kategori eller någon av dess underkategorier räknas. Kontrolleras mot Store API:s antal. */
const childrenOf = id => CATS.filter(c => c.parent === id).flatMap(c => [c.slug, ...childrenOf(c.id)]);
function listingIds(html, slug) {
  const cat = CATS.find(c => c.slug === slug);
  const ok = cat ? [slug, ...childrenOf(cat.id)] : null;
  const ids = [];
  for (const m of html.matchAll(/<li[^>]*class="([^"]*\bpost-(\d+)\b[^"]*)"/g)) {
    const cls = m[1].split(/\s+/);
    if (!cls.includes("product")) continue;
    if (ok && !ok.some(s2 => cls.includes("product_cat-" + s2))) continue;
    if (!ids.includes(+m[2])) ids.push(+m[2]);
  }
  return ids;
}
const LISTINGS = {};
for (const c of [{ slug: "butik", permalink: O + "/butik/", name: "Butik" }].concat(CATS)) {
  const ids = [];
  for (let p = 1; p < 20; p++) {
    const r = cached(p === 1 ? c.permalink : c.permalink + "page/" + p + "/");
    if (!r || r.status !== 200) break;
    listingIds(r.body, c.slug === "butik" ? null : c.slug).filter(x => !ids.includes(x)).forEach(x => ids.push(x));
    if (!/class="next page-numbers"/.test(r.body)) break;
  }
  LISTINGS[c.slug] = { name: dec(c.name), permalink: c.permalink, ids, storeApiCount: c.count };
}
const listedInWoo = id => Object.entries(LISTINGS).filter(([s, l]) => l.ids.includes(id)).map(([s]) => s);

function grab(h, name) {
  const m = h.match(new RegExp("window\\." + name + "\\s*=\\s*"));
  if (!m) return null;
  const s = h.slice(m.index + m[0].length);
  let d = 0, i = 0, inS = false, esc = false;
  for (; i < s.length; i++) {
    const c = s[i];
    if (inS) { if (esc) esc = false; else if (c === "\\") esc = true; else if (c === '"') inS = false; continue; }
    if (c === '"') inS = true; else if (c === "{" || c === "[") d++; else if (c === "}" || c === "]") { d--; if (!d) { i++; break; } }
  }
  try { return JSON.parse(s.slice(0, i)); } catch { return null; }
}

// ---------- klassning ur produktdata (namn, slug, kategorier) ----------
const SERIES_BY_CAT = {
  "magic-sauce": "Magic Sauce", "m-s-buds": "Magic Sauce", "m-s-vapes": "Magic Sauce", "ms-carts": "Magic Sauce", "ms-hash": "Magic Sauce",
  "thca-b": "THCaB", "thcab-vapes": "THCaB",
  "thcba": "THCbA", "thcba-vapes": "THCbA",
  "thcb": "THCB (legacy)", "thcb-vapes": "THCB (legacy)",
  "d10": "D10", "d10-buds": "D10", "d10-hash": "D10", "d10-vapes": "D10",
  "nano-11": "Nano-11", "nano11-blommor": "Nano-11", "nano11-hash": "Nano-11",
  "hero-vapes": "Core", "core-vapes": "Core", "high-life-buds": "Core", "high-life-hash": "Core",
  "thcv": "THCV", "thcv-vape": "THCV", "thcx": "THCX", "thcx-hash": "THCX"
};
/* Format: produktens eget namn först (Woo-kategorierna blandar ibland format, t.ex. ligger
   High Life buds/hasch under "hero-vapes"), kategorier bara som reserv. */
function formatOf(name, slug, catSlugs) {
  const n = dec(name).toLowerCase(), t = n + " " + slug;
  if (/fraktandring|frakt/.test(slug)) return "tjänst";
  if (/startpaket/.test(t)) return "kit";
  if (/pre-?rol/.test(t)) return "pre-roll";
  if (/isolat/.test(t)) return "isolat";
  if (catSlugs.includes("merch") || /beanie|snapback|tray|nyckelring|stackables/.test(t)) return "merch";
  if (/batteri|penna|ccell/.test(t) || catSlugs.includes("pennor")) return "batteri";
  if (/\bcarts?\b|cartridge|510-cart/.test(n)) return "cart";
  if (/\b10\s?ml\b|liquid/.test(n) || catSlugs.includes("liquids")) return "refill";
  if (/\bhash\b|hasch/.test(n)) return "hasch";
  if (/\bbuds\b|blommor/.test(n)) return "buds";
  if (/\bvape\b|\b\d+(\+\d+)?\s?ml\b/.test(n)) return catSlugs.includes("alla-cartridges") && !catSlugs.includes("alla-vapes") ? "cart" : "vape";
  if (catSlugs.includes("alla-cartridges") || catSlugs.includes("ms-carts")) return "cart";
  if (catSlugs.some(c => /hash|hasch/.test(c))) return "hasch";
  if (catSlugs.some(c => /buds|blommor/.test(c))) return "buds";
  if (catSlugs.some(c => /vape/.test(c) && c !== "hero-vapes")) return "vape";
  return "okänt";
}
function volumeOf(name, slug) {
  const t = dec(name).replace(/,/g, ".");
  const dual = t.match(/(\d+(?:\.\d+)?)\s*\+\s*(\d+(?:\.\d+)?)\s*ml/i);
  if (dual) return { text: dual[0], ml: +dual[1] + +dual[2], dual: true };
  const ml = t.match(/(\d+(?:\.\d+)?)\s*ml\b/i) || slug.match(/(?:^|-)(\d+)ml(?:-|$)/);
  if (ml) return { text: ml[0].trim(), ml: +ml[1] };
  const g = t.match(/(\d+(?:\.\d+)?)\s*(?:g|gram)\b/i);
  if (g) return { text: g[0].trim(), g: +g[1] };
  return null;
}
/* Cannabinoider ur produktnamnet (slugen bara om namnet inte anger någon: flera slugs är
   äldre än namnet, t.ex. faraoh-thca-b-3-pack = "Faraoh THCbA Vape"). D10 och 10-OH-THC hålls isär. */
function cannabinoidsOf(name, slug) {
  const scan = text => {
    const t = " " + text + " ", out = [];
    const add = c => { if (!out.includes(c)) out.push(c); };
    if (/thca[\s-]?b\b|thcab/i.test(t)) add("THCaB");
    if (/thcba\b|thcb[\s-]a\b/i.test(t)) add("THCbA");
    if (/\bthc[\s-]?b\b(?![\s-]?a\b)/i.test(t) && !/thca[\s-]?b/i.test(t)) add("THCB");
    if (/\bd10\b|delta[\s-]?10/i.test(t)) add("D10");
    if (/10[\s-]?oh[\s-]?thc/i.test(t)) add("10-OH-THC");
    if (/\bh4cbd\b/i.test(t)) add("H4CBD");
    if (/\bcbd\b/i.test(t) && !/\bh4cbd\b/i.test(t)) add("CBD");
    if (/\bcbn\b/i.test(t)) add("CBN");
    if (/\bcbg\d*\b/i.test(t)) add("CBG");
    if (/\bthc[\s-]?x\b/i.test(t)) add("THCX");
    if (/\bthcv\b/i.test(t)) add("THCV");
    if (/\bhhcpm\b/i.test(t)) add("HHCPM");
    if (/\bthcnm\b/i.test(t)) add("THCNM");
    return out;
  };
  const fromName = scan(dec(name));
  return fromName.length ? fromName : scan(slug.replace(/-/g, " "));
}
/* Serie: namnet avgör när det anger en serie/cannabinoid (D10, THCA-B, THCbA), kategorin annars.
   Avvikelse mellan namn och kategori sparas som konflikt -- rättas i admin, inte i Theme 8. */
function seriesOf(name, slug, catSlugs, cannabinoids) {
  const fromCat = [...new Set(catSlugs.map(c => SERIES_BY_CAT[c]).filter(Boolean))];
  const t = dec(name).toLowerCase() + " " + slug;
  const fromName = [];
  if (cannabinoids.includes("D10")) fromName.push("D10");
  if (cannabinoids.includes("THCaB")) fromName.push("THCaB");
  if (cannabinoids.includes("THCbA")) fromName.push("THCbA");
  if (cannabinoids.includes("THCB")) fromName.push("THCB (legacy)");
  if (cannabinoids.includes("THCV")) fromName.push("THCV");
  if (/magic sauce|\bms[\s-]?\d|ms50|ms 3/.test(t)) fromName.push("Magic Sauce");
  if (/nano[\s-]?11|nano11|nanno|\bnano\b/.test(t)) fromName.push("Nano-11");
  if (/\bcore\b|high[\s-]life|el[\s-]gringo|hero/.test(t)) fromName.push("Core");
  const series = fromName[0] || fromCat[0] || null;
  const conflict = fromName[0] && fromCat.length && !fromCat.includes(fromName[0]) ? `namnet säger ${fromName[0]}, Woo-kategorierna säger ${fromCat.join("/")}` : null;
  return { fromCat, fromName, series, conflict };
}
const woo = API.map(a => {
  const pg = cached(a.permalink);
  const h = pg && pg.status === 200 ? pg.body : "";
  const P = h ? grab(h, "HZY_PRODUKT") : null, K = h ? grab(h, "HZY_PAKET") : null, E = h ? grab(h, "HZY_EXTRA") : null;
  const catSlugs = a.categories.map(c => c.slug);
  const vis = VIS.visible.has(a.id) ? "visible" : VIS.catalog.has(a.id) ? "catalog" : VIS.search.has(a.id) ? "search" : VIS.hidden.has(a.id) ? "hidden" : "unknown";
  const b = a.type === "bundle" && a.extensions && a.extensions.bundles;
  const name = dec(a.name);
  return {
    id: a.id, slug: a.slug, name, url: a.permalink, type: a.type, sku: a.sku || null,
    visibility: vis, inSitemap: RAW.sitemap.some(u => u.replace(/\/?$/, "/") === a.permalink.replace(/\/?$/, "/")),
    pageStatus: pg ? pg.status : null,
    categories: catSlugs, listedIn: listedInWoo(a.id),
    brands: (a.brands || []).map(x => dec(x.name)), tags: (a.tags || []).map(t => dec(t.name)),
    attributes: (a.attributes || []).map(x => ({ name: dec(x.name).replace(/:$/, ""), variations: x.has_variations, terms: x.terms.map(t => dec(t.name)) })),
    price: +a.prices.price, regular: +a.prices.regular_price, sale: a.on_sale ? +a.prices.sale_price : null, onSale: a.on_sale,
    priceRange: a.prices.price_range ? { min: +a.prices.price_range.min_amount, max: +a.prices.price_range.max_amount } : null,
    inStock: a.is_in_stock, purchasable: a.is_purchasable, stockText: strip(a.stock_availability && a.stock_availability.text),
    variants: P ? (P.dofter || []).map(d => ({ name: dec(d.namn), inStock: !!d.ilager })) : [],
    images: (a.images || []).map(i => ({ src: i.src, w: null, alt: i.alt })),
    format: formatOf(name, a.slug, catSlugs),
    volume: volumeOf(name, a.slug) || (() => { const at = (a.attributes || []).find(x => /vikt|volym/i.test(x.name)); return at ? { text: at.terms.map(t => dec(t.name)).join(" / "), variants: at.terms.map(t => dec(t.name)) } : null; })(),
    cannabinoids: cannabinoidsOf(name, a.slug),
    series: seriesOf(name, a.slug, catSlugs, cannabinoidsOf(name, a.slug)),
    family: E && E.familj ? { name: dec(E.familj.namn), members: (E.familj.medlemmar || []).map(m => ({ id: m.id, name: dec(m.namn), url: m.url, inStock: !!m.ilager, active: !!m.aktiv })) } : null,
    packageSteps: K ? (K.nivaer || []).map(n => ({ qty: +n.antal, bundleId: n.bundle || null, price: n.pris != null ? +n.pris : null, regular: n.ordinarie != null ? +n.ordinarie : null, perUnit: n.per != null ? Math.round(+n.per * 100) / 100 : null, save: n.spara != null ? +n.spara : null, discount: n.rabatt != null ? Math.round(+n.rabatt * 10) / 10 : null, inStock: !!n.ilager, name: n.namn ? dec(n.namn) : null })) : [],
    packageStrains: K && K.strains ? K.strains : null,
    bundle: b ? {
      price: +a.prices.price, regular: +a.prices.regular_price, stockStatus: b.bundle_stock_status, stockQty: b.bundle_stock_quantity,
      slots: (b.bundled_items || []).map(i => ({ productId: i.product_id, product: byWooId[i.product_id] ? dec(byWooId[i.product_id].name) : null, productType: byWooId[i.product_id] ? byWooId[i.product_id].type : null, title: i.title, min: i.quantity_min, max: i.quantity_max, def: i.quantity_default, optional: i.optional, pricedIndividually: i.priced_individually, discount: i.discount, allowedVariations: i.allowed_variations, visibility: i.single_product_visibility }))
    } : null,
    shortDescription: strip(a.short_description).slice(0, 400),
    descriptionHasDual: /1\s*\+\s*1\s*ml|dual/i.test(strip(a.description) + " " + name)
  };
});
const wooBySlug = Object.fromEntries(woo.map(w => [w.slug, w]));
const wooById = Object.fromEntries(woo.map(w => [w.id, w]));
/* Paket: format, serie och cannabinoid ur de ingående produkterna (bundled_items), inte ur
   paketets egen kategori -- t.ex. "THCA-B 50% Faraoh 1ml – 3-pack" ligger i thcba-vapes. */
for (const w of woo) {
  if (!w.bundle) continue;
  const parts = [...new Set(w.bundle.slots.map(sl => sl.productId))].map(id => wooById[id]).filter(Boolean);
  w.bundle.parts = parts.map(p2 => ({ id: p2.id, slug: p2.slug, name: p2.name, format: p2.format, series: p2.series.series, visibility: p2.visibility }));
  const one = k => { const v = [...new Set(parts.map(k))]; return v.length === 1 ? v[0] : null; };
  const pf = one(p2 => p2.format), ps = one(p2 => p2.series.series);
  if (pf && w.format !== "kit" && pf !== w.format) { w.formatFromParts = pf; w.format = pf; }
  if (ps && ps !== w.series.series) { w.series.conflict = (w.series.conflict ? w.series.conflict + "; " : "") + `ingående produkter är ${ps}`; w.series.series = ps; }
  if (parts.length && !w.cannabinoids.length) w.cannabinoids = [...new Set(parts.flatMap(p2 => p2.cannabinoids))];
}
// Omvänt: vilka paket innehåller produkten, vilka listade produkter länkar till den (familj)?
for (const w of woo) {
  w.inBundles = woo.filter(b => b.bundle && b.bundle.slots.some(s => s.productId === w.id)).map(b => b.slug);
  w.linkedFrom = woo.filter(o => o !== w && o.family && o.family.members.some(m => m.id === w.id || (m.url && m.url.replace(/\/?$/, "/") === w.url.replace(/\/?$/, "/")))).map(o => o.slug);
  w.soldFrom = woo.filter(o => o.packageSteps.some(st => st.bundleId === w.id)).map(o => o.slug);
}

// ---------- synlighetsklass (vad en kund möter på WooCommerce) ----------
const LEGACY_SERIES = ["THCV", "THCB (legacy)"];
function visibilityClass(w) {
  const listed = w.listedIn.length > 0;
  if (w.type === "bundle" || w.format === "kit") return { cls: "PACKAGE/CHILD PRODUCT", why: w.type === "bundle" ? `WooCommerce-paket (${w.visibility}${listed ? ", listad i " + w.listedIn.join(", ") : ", olistad"})` : "kit/startpaket" };
  if (w.format === "tjänst") return { cls: "HIDDEN/LEGACY", why: "tjänstepost (fraktändring), aldrig en produkt i sortimentet" };
  if (listed && (w.visibility === "visible" || w.visibility === "catalog")) return { cls: "PUBLIC + LISTED", why: "katalogsynlig och listad i " + w.listedIn.join(", ") };
  if (w.visibility === "search" && !listed) return { cls: "PUBLIC BUT DIRECT-ONLY", why: "synlig bara i sök/direktlänk (catalog_visibility=search)" + (w.inBundles.length ? ", ingår även i paket " + w.inBundles.join(", ") : "") + (w.inStock ? ", i lager" : ", slut") };
  if (w.inBundles.length && !listed) return { cls: "PACKAGE/CHILD PRODUCT", why: "olistad, ingår i paket " + w.inBundles.join(", ") + (w.inStock ? "" : "; slut") };
  if (!listed && (w.visibility === "visible" || w.visibility === "catalog")) return { cls: "UNCERTAIN – OWNER DECISION REQUIRED", why: "katalogsynlig enligt Store API men finns inte i någon kategorilistning" };
  if (w.visibility === "search") return { cls: "PUBLIC BUT DIRECT-ONLY", why: "synlig bara i sök/direktlänk (catalog_visibility=search)" + (w.inStock ? ", i lager" : ", slut") };
  if (w.visibility === "hidden") {
    if (w.linkedFrom.length) return { cls: "PUBLIC BUT DIRECT-ONLY", why: "dold i katalog/sök men länkad från " + w.linkedFrom.slice(0, 3).join(", ") + (w.inStock ? ", i lager" : ", slut") };
    if (!w.inStock) return { cls: "HIDDEN/LEGACY", why: "dold i katalog och sök, slut i lager, inte i något paket och ingen länk från listade produkter" };
    return { cls: "UNCERTAIN – OWNER DECISION REQUIRED", why: "dold i katalog och sök men i lager och inte i något paket" };
  }
  return { cls: "UNCERTAIN – OWNER DECISION REQUIRED", why: "okänd synlighet" };
}
woo.forEach(w => { const v = visibilityClass(w); w.visibilityClass = v.cls; w.visibilityWhy = v.why; });

// ---------- Nyehandel + matchning ----------
const nh = NH.products.filter(p => p.status === 200);
const nhBySlug = Object.fromEntries(nh.map(p => [p.slug, p]));
const normName = s => dec(s).toLowerCase().replace(/[–—]/g, "-").replace(/[^a-z0-9åäö%+.]/g, " ").replace(/\s+/g, " ").trim();
const tok = s => new Set(normName(s).split(" ").filter(Boolean));
const jacc = (a, b) => { let i = 0; a.forEach(x => b.has(x) && i++); return i / (a.size + b.size - i || 1); };
const usedNh = new Set();
const rows = [];
for (const w of woo) {
  let n = nhBySlug[w.slug], how = n ? "slug" : null;
  if (!n) {
    const cand = nh.filter(p => !usedNh.has(p.slug) && !wooBySlug[p.slug]).map(p => ({ p, s: jacc(tok(w.name), tok(p.state ? p.state.name : p.h1)) })).sort((a, b) => b.s - a.s)[0];
    if (cand && cand.s >= 0.6) { n = cand.p; how = "namn (" + cand.s.toFixed(2) + ")"; }
  }
  if (n) usedNh.add(n.slug);
  rows.push({ woo: w, nh: n || null, match: how });
}
const nhOnly = nh.filter(p => !usedNh.has(p.slug));

function nhSummary(n) {
  if (!n) return null;
  const s = n.state || {};
  const vs = s.variants || [];
  /* product/state anger pris exkl. moms (25 %); kunden ser inkl. moms (= JSON-LD offers.price). */
  const inc = x => x == null ? null : Math.round(x * 1.25 * 100) / 100;
  const price = vs.length ? inc(Math.min(...vs.map(v => (v.prices[0] || {}).unit).filter(x => x != null))) : null;
  const compare = vs.map(v => inc((v.prices[0] || {}).compare)).filter(x => x != null);
  const ldPrice = n.ld && n.ld.offers && n.ld.offers.length ? Math.min(...n.ld.offers.map(o => +o.price).filter(x => !isNaN(x))) : null;
  const sellable = vs.filter(v => v.active !== false && v.buyable !== false && (!v.trackInventory || v.available > 0));
  return {
    id: n.id, slug: n.slug, name: s.name || n.h1, url: "https://hazeyse.nyehandel.se" + n.route,
    listedIn: n.listedIn, inSitemap: n.inSitemap, brand: s.brand || (n.ld && n.ld.brand) || null,
    isPackage: !!s.isPackage, hasVariants: !!s.hasVariants, options: s.options || [],
    price, compare: compare.length ? Math.max(...compare) : null,
    ldPrice, variants: vs.map(v => ({ id: v.id, sku: v.sku, options: v.options, track: v.trackInventory, available: v.available, buyable: v.buyable, active: v.active, price: inc((v.prices[0] || {}).unit), compare: inc((v.prices[0] || {}).compare), tiers: v.prices.length })),
    stock: !vs.length ? "okänt" : sellable.length === vs.length ? "i lager" : sellable.length ? "delvis" : "slut",
    images: (s.images || []).length, imageUrls: (s.images || []).map(i => i.url),
    breadcrumb: (n.breadcrumb || []).map(b => b.name), related: n.relatedCategories || [], pdfs: n.pdfs || [], tierRows: Math.max(0, ...vs.map(v => v.prices.length))
  };
}
const wooStockOf = w => {
  if (w.type === "variable" && w.variants.length) { const ok = w.variants.filter(v => v.inStock).length; return ok === w.variants.length ? "i lager" : ok ? "delvis" : "slut"; }
  return w.inStock ? "i lager" : "slut";
};
const NH_EXPECTED = { "PUBLIC + LISTED": "listad", "PUBLIC BUT DIRECT-ONLY": "olistad (direktlänk)", "HIDDEN/LEGACY": "dold", "PACKAGE/CHILD PRODUCT": "dold tills paketprodukt verifierad", "UNCERTAIN – OWNER DECISION REQUIRED": "ägarbeslut" };

const matrix = rows.map(({ woo: w, nh: n0, match }) => {
  const n = nhSummary(n0);
  const issues = [], actions = [];
  const ws = wooStockOf(w);
  if (!n) { issues.push("saknas i Nyehandel"); actions.push(w.visibilityClass === "PUBLIC + LISTED" ? "importera" : "ingen (inte kundsynlig)"); }
  else {
    if (w.price && n.price != null && Math.abs(n.price - w.price) > 0.5 && w.type !== "variable") issues.push(`pris Woo ${w.price} / NH ${n.price}`);
    if (w.type === "variable" && w.priceRange && n.price != null && Math.abs(n.price - w.priceRange.min) > 0.5) issues.push(`lägsta pris Woo ${w.priceRange.min} / NH ${n.price}`);
    if (w.onSale && !n.compare) issues.push(`rea i Woo (ord. ${w.regular}) saknar jämförelsepris i NH`);
    if (!w.onSale && n.compare) issues.push(`jämförelsepris ${n.compare} i NH men ingen rea i Woo`);
    if (ws !== n.stock) issues.push(`lager Woo ${ws} / NH ${n.stock}`);
    const nhListed = n.listedIn.length > 0;
    if (w.visibilityClass !== "PUBLIC + LISTED" && nhListed) { issues.push("synlig i NH-listning men inte kundlistad i Woo"); actions.push(w.visibilityClass === "UNCERTAIN – OWNER DECISION REQUIRED" ? "granska" : "dölj i NH-listningar"); }
    if (w.visibilityClass === "PUBLIC + LISTED" && !nhListed) { issues.push("listad i Woo men inte i någon NH-kategori"); actions.push("visa/lägg i kategori"); }
    if (w.type === "bundle" && !n.isPackage) { issues.push("Woo-paket importerat som vanlig produkt (is_package=0)"); actions.push("bygg om som NH-paketprodukt eller dölj"); }
    if (w.type === "variable" && w.variants.length && n.variants.length && w.variants.length !== n.variants.length) issues.push(`varianter Woo ${w.variants.length} / NH ${n.variants.length}`);
    if (w.images.length && !n.images) issues.push("bild saknas i NH");
    if (n.tierRows > 1) issues.push(`NH-pristrappa (${n.tierRows} steg) som inte finns i Woo`);
  }
  if (!actions.length) actions.push(issues.length ? "rätta data enligt avvikelse" : "ingen");
  return {
    wooId: w.id, wooSlug: w.slug, wooName: w.name, wooUrl: w.url, wooType: w.type,
    nhId: n && n.id, nhSlug: n && n.slug, nhName: n && n.name, nhUrl: n && n.url, match,
    visibilityClass: w.visibilityClass, visibilityWhy: w.visibilityWhy, wooVisibility: w.visibility, wooInSitemap: w.inSitemap,
    wooListedIn: w.listedIn, wooCategories: w.categories, nhListedIn: n ? n.listedIn : [], nhExpected: NH_EXPECTED[w.visibilityClass],
    directOnly: w.visibilityClass === "PUBLIC BUT DIRECT-ONLY",
    price: { woo: w.price, wooRegular: w.regular, wooSale: w.sale, wooRange: w.priceRange, nh: n && n.price, nhLd: n && n.ldPrice, nhCompare: n && n.compare },
    stock: { woo: ws, wooVariants: w.variants, nh: n && n.stock, nhVariants: n && n.variants },
    kind: w.type === "bundle" ? "paket" : w.type === "variable" ? "variabel" : "enkel",
    nhIsPackage: n ? n.isPackage : null,
    brand: { woo: w.brands, nh: n && n.brand }, series: w.series.series, seriesEvidence: w.series, cannabinoids: w.cannabinoids, format: w.format, volume: w.volume,
    images: { woo: w.images.length, nh: n ? n.images : null, wooFirst: w.images[0] && w.images[0].src, nhFirst: n && n.imageUrls[0] },
    family: w.family && { name: w.family.name, members: w.family.members.length }, inBundles: w.inBundles, linkedFrom: w.linkedFrom, soldFrom: w.soldFrom,
    packageSteps: w.packageSteps,
    nhBreadcrumb: n && n.breadcrumb, nhRelated: n && n.related,
    issues, action: [...new Set(actions)].join("; ")
  };
});

fs.writeFileSync(path.join(DIR, "CURRENT-CATALOG-MATRIX.json"), JSON.stringify({ schema: "task17-catalog/1", generated: new Date().toISOString(), sources: { woo: RAW.generated, nh: NH.generated }, counts: { woo: woo.length, nh: nh.length, matched: rows.filter(r => r.nh).length, nhOnly: nhOnly.length }, rows: matrix, nhOnly: nhOnly.map(p => ({ id: p.id, slug: p.slug, name: p.state && p.state.name, listedIn: p.listedIn })), wooListings: LISTINGS }, null, 1));
fs.writeFileSync(path.join(DIR, "runs/analysis.json"), JSON.stringify({ woo, nhCategories: NH.categories }, null, 1));
const cnt = {}; matrix.forEach(r => cnt[r.visibilityClass] = (cnt[r.visibilityClass] || 0) + 1);
console.log("woo", woo.length, "nh", nh.length, "matched", rows.filter(r => r.nh).length, "by slug", rows.filter(r => r.match === "slug").length, "nhOnly", nhOnly.length);
console.log(cnt);
