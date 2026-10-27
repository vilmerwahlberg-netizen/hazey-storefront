// TASK 04 — read-only route inventory (Node 18+, inga beroenden).
//
// Källor, i ordning (inga gissade URL-varianter):
//   1. Nyehandels native DOM: kategorilänkar på startsida, Alla produkter,
//      native sidor och varje upptäckt kategorisida (BFS, bara /sv/categories/).
//   2. Theme 8:s navigations-/katalogkarta (05-header.js, 06-catalog-map.js,
//      övriga theme8/js-filer) -- strängar som redan pekar på routes.
//   3. Produktsidornas BreadcrumbList (JSON-LD) -- avslöjar dolda kategorier.
//   4. Extra seeds via argv (verifierade av människa, t.ex. /core).
// Per route: status, slutlig URL, H1, antal, category-id, canonical, robots,
// title, meta description, produktlista över alla sidor, facetter (GET
// /frontend-api/products/filters). Bara GET. Inget skrivs till Nyehandel.
//
// Kör: node inventory.mjs [extra-route ...]  -> runs/inventory.json
import fs from "node:fs";
import path from "node:path";

const DIR = path.dirname(new URL(import.meta.url).pathname);
const ROOT = path.resolve(DIR, "../../..");
const ORIGIN = "https://hazeyse.nyehandel.se";
const UA = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36";
const OUT = path.join(DIR, "runs");
fs.mkdirSync(OUT, { recursive: true });
const sleep = ms => new Promise(r => setTimeout(r, ms));
const log = [];

async function get(url, json = false) {
  for (let attempt = 0; attempt < 2; attempt++) {
    const ctl = new AbortController();
    const t = setTimeout(() => ctl.abort(), 25000);
    try {
      const res = await fetch(url, { headers: { "User-Agent": UA, Accept: json ? "application/json" : "text/html" }, redirect: "follow", signal: ctl.signal });
      const body = await res.text();
      clearTimeout(t);
      await sleep(250);
      return { status: res.status, url: res.url, body, redirected: res.redirected, attempt };
    } catch (e) {
      clearTimeout(t);
      log.push({ url, attempt, error: String(e && e.message || e) });
      if (attempt === 1) return { status: 0, url, body: "", error: String(e), attempt };
      await sleep(3000);
    }
  }
}

const decode = s => s.replace(/&amp;/g, "&").replace(/&quot;/g, '"').replace(/&#039;/g, "'").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/\s+/g, " ").trim();
const pick = (re, h) => { const m = re.exec(h); return m ? decode(m[1]) : null; };

/* Normaliserad route-nyckel: pathname + query utan preview/page. */
function key(href) {
  const u = new URL(href, ORIGIN);
  u.searchParams.delete("preview");
  u.searchParams.delete("page");
  const q = [...u.searchParams.entries()].map(([k, v]) => `${k}=${v}`).join("&");
  return u.pathname.replace(/\/+$/, "") + (q ? "?" + q : "");
}

function catLinks(html) {
  const out = new Set();
  for (const m of html.matchAll(/href="((?:https:\/\/hazeyse\.nyehandel\.se)?\/sv\/categories\/[^"#]+)"/g)) out.add(key(decode(m[1])));
  return [...out];
}
function productLinks(html) {
  const i = html.indexOf('id="category-products"');
  if (i < 0) return [];
  const seg = html.slice(i);
  const seen = new Map();
  for (const m of seg.matchAll(/<a href="https:\/\/hazeyse\.nyehandel\.se\/sv\/products\/([^"]+)">\s*<span class="name">([^<]*)<\/span>/g)) seen.set(m[1], decode(m[2]));
  return [...seen].map(([slug, name]) => ({ slug, name }));
}
function maxPage(html, k) {
  let max = 1;
  for (const m of html.matchAll(/[?&]page=(\d+)/g)) max = Math.max(max, +m[1]);
  return max;
}

const sources = new Map(); // key -> Set(source)
function addSource(k, s) { if (!sources.has(k)) sources.set(k, new Set()); sources.get(k).add(s); }

/* 2. Theme 8-källor (statisk läsning av repo). */
function theme8Routes() {
  const files = fs.readdirSync(path.join(ROOT, "theme8/js")).filter(f => f.endsWith(".js"));
  for (const f of files) {
    const txt = fs.readFileSync(path.join(ROOT, "theme8/js", f), "utf8");
    for (const m of txt.matchAll(/https:\/\/hazeyse\.nyehandel\.se(\/sv\/categories\/[^"'`\s)]+)/g)) addSource(key(m[1].replace(/%20/g, " ")), "theme8:" + f);
    if (f === "06-catalog-map.js") {
      for (const m of txt.matchAll(/hub:\s*"([^"]+)"/g)) addSource(key("/sv/categories/" + m[1]), "theme8:catalog-map:hub");
      for (const m of txt.matchAll(/(?:carts):\s*"([^"]+)"/g)) addSource(key("/sv/categories/" + m[1].replace(/%20/g, " ")), "theme8:catalog-map:extra");
    }
  }
}

const routes = new Map(); // key -> record
const products = new Map(); // slug -> {name, breadcrumb:[...], foundIn:Set}

async function auditRoute(k) {
  if (routes.has(k)) return routes.get(k);
  const rec = { route: k, sources: [] };
  routes.set(k, rec);
  const r = await get(ORIGIN + k);
  rec.status = r.status;
  rec.finalUrl = r.url ? key(r.url) : null;
  rec.redirected = !!r.redirected;
  rec.retried = r.attempt > 0;
  if (r.status !== 200) { rec.error = r.error || null; return rec; }
  const h = r.body;
  rec.h1 = pick(/<h1 class="title">([^<]*)/, h);
  rec.count = (c => c === null ? null : +c)(pick(/id="products_count">\s*(\d+)/, h));
  rec.categoryId = pick(/<product-filter category-id="(\d+)"/, h);
  rec.canonical = pick(/<link rel="canonical" href="([^"]*)"/, h);
  rec.robots = pick(/<meta name="robots" content="([^"]*)"/, h);
  rec.title = pick(/<title>([^<]*)<\/title>/, h);
  rec.description = pick(/<meta name="description" content="([^"]*)"/, h);
  rec.hasDescription = /class="category-description/.test(h);
  rec.pages = maxPage(h, k);
  let prods = productLinks(h);
  for (let p = 2; p <= rec.pages; p++) {
    const sep = k.includes("?") ? "&" : "?";
    const rp = await get(ORIGIN + k + sep + "page=" + p);
    if (rp.status === 200) prods = prods.concat(productLinks(rp.body)); else rec.pageError = (rec.pageError || []).concat(p);
  }
  const uniq = new Map(prods.map(p => [p.slug, p.name]));
  rec.products = [...uniq].map(([slug, name]) => ({ slug, name }));
  for (const p of rec.products) {
    if (!products.has(p.slug)) products.set(p.slug, { name: p.name, foundIn: new Set() });
    products.get(p.slug).foundIn.add(k);
  }
  // facetter (samma GET som Nyehandels product-filter-komponent)
  if (rec.categoryId) {
    const u = new URL(ORIGIN + k);
    const active = u.searchParams.get("filters") || "";
    const f = await get(`${ORIGIN}/frontend-api/products/filters?filters=${encodeURIComponent(active)}&categoryId=${rec.categoryId}`, true);
    try {
      rec.facets = JSON.parse(f.body).map(g => ({ title: g.title, values: (g.tags || []).map(t => t.attribute_title) }));
    } catch (e) { rec.facets = null; }
  }
  rec.links = catLinks(h);
  return rec;
}

async function main() {
  theme8Routes();
  const extra = process.argv.slice(2);
  extra.forEach(e => addSource(key(e), "seed:human-verified"));

  // 1. Native seeds
  const seeds = ["/", "/sv/categories/alla-produkter", "/sv/page/kampanjer", "/sv/page/vara-bastsaljare"];
  for (const s of seeds) {
    const r = await get(ORIGIN + s);
    for (const l of catLinks(r.body || "")) addSource(l, "native:" + s);
  }
  // BFS över native kategorilänkar + Theme 8 + seeds
  const queue = [...sources.keys()];
  while (queue.length) {
    const k = queue.shift();
    if (routes.has(k)) continue;
    const rec = await auditRoute(k);
    process.stdout.write(`${rec.status} ${k} ${rec.count ?? "-"} ${rec.h1 ?? ""}\n`);
    for (const l of rec.links || []) {
      addSource(l, "native:" + k);
      if (!routes.has(l) && !queue.includes(l)) queue.push(l);
    }
  }
  // 3. Produktsidornas breadcrumbs
  for (const [slug, p] of products) {
    const r = await get(`${ORIGIN}/sv/products/${slug}`);
    p.status = r.status;
    const m = /"@type":"BreadcrumbList","itemListElement":(\[.*?\])\}<\/script>/.exec(r.body || "");
    p.breadcrumb = [];
    if (m) try { p.breadcrumb = JSON.parse(m[1]).map(x => ({ id: x.item["@id"], name: x.item.name })); } catch (e) { /* tom */ }
    for (const b of p.breadcrumb) if (/\/categories\//.test(b.id)) addSource(key(b.id), "pdp-breadcrumb");
  }
  // nya routes från breadcrumbs
  for (const k of [...sources.keys()]) if (!routes.has(k)) {
    const rec = await auditRoute(k);
    process.stdout.write(`${rec.status} ${k} ${rec.count ?? "-"} ${rec.h1 ?? ""} (breadcrumb)\n`);
  }
  for (const [k, rec] of routes) rec.sources = [...(sources.get(k) || [])];
  const out = {
    generated: new Date().toISOString(),
    origin: ORIGIN,
    routes: [...routes.values()],
    products: [...products].map(([slug, p]) => ({ slug, name: p.name, status: p.status, breadcrumb: p.breadcrumb, foundIn: [...p.foundIn] })),
    errors: log
  };
  fs.writeFileSync(path.join(OUT, "inventory.json"), JSON.stringify(out, null, 1));
  console.log(`routes ${out.routes.length}, products ${out.products.length}, errors ${log.length}`);
}
main().catch(e => { console.error(e); process.exit(1); });
