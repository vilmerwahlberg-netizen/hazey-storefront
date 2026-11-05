// TASK 17C — exakt adminlista. Läser Task 17:s katalogmatris (WooCommerce = facit) och kontrollerar varje
// rad LIVE mot Nyehandel i samma körning (produktsida -> product/state + kategorilistningar). Inget skrivs.
// Kör: node admin-list.mjs  ->  ADMIN-LIST.md + runs/admin-list.json
import fs from "node:fs"; import path from "node:path"; import crypto from "node:crypto";
const DIR = path.dirname(new URL(import.meta.url).pathname);
const MX = JSON.parse(fs.readFileSync(path.join(DIR, "../catalog-reconciliation-2026-11/CURRENT-CATALOG-MATRIX.json"), "utf8")).rows;
const O = "https://hazeyse.nyehandel.se", UA = "Mozilla/5.0 (Macintosh) Chrome/128";
const sleep = ms => new Promise(r => setTimeout(r, ms));
let ck = {};
async function req(u, opt = {}) {
  for (let a = 0; ; a++) {
    try {
      const r = await fetch(O + u, { ...opt, headers: { "User-Agent": UA, Cookie: Object.entries(ck).map(([k, v]) => `${k}=${v}`).join("; "), ...(opt.headers || {}) } });
      for (const c of r.headers.getSetCookie()) { const [kv] = c.split(";"); const i = kv.indexOf("="); ck[kv.slice(0, i)] = kv.slice(i + 1); }
      await sleep(150); return { status: r.status, text: await r.text() };
    } catch (e) { if (a >= 2) return { status: 0, text: "" }; await sleep(2500); }
  }
}
async function listed(cat) {
  const out = new Set();
  for (let pg = 1; pg < 12; pg++) {
    const h = (await req(`/sv/categories/${cat}?page=${pg}`)).text; const i = h.indexOf('id="category-products"'); if (i < 0) break;
    const n = out.size; for (const m of h.slice(i).matchAll(/class="product-card"[\s\S]*?href="(?:https:\/\/hazeyse\.nyehandel\.se)?\/sv\/products\/([^"]+)"/g)) out.add(decodeURIComponent(m[1]).replace(/\/$/, ""));
    if (out.size === n) break;
  }
  return out;
}
const CATS = ["alla-produkter", "blommor-buds", "hasch", "alla-vapes", "alla-cartridges", "cbd-buds-1", "high-life-buds", "hero-vapes"];
const L = {}; for (const c of CATS) { L[c] = await listed(c); console.log(c, L[c].size); }
const live = {};
for (const r of MX) {
  const h = (await req("/sv/products/" + r.nhSlug)).text; const id = +((h.match(/viewProduct\(.(\d+)/) || [])[1] || 0);
  if (!id) { live[r.nhSlug] = { status: "saknas" }; continue; }
  const st = await req("/frontend-api/product/state", { method: "POST", body: JSON.stringify({ product_id: id, variant_ids: [null] }), headers: { Accept: "application/json", "Content-Type": "application/json", "X-Requested-With": "XMLHttpRequest", "X-XSRF-TOKEN": decodeURIComponent(ck["XSRF-TOKEN"] || "") } });
  let P = null; try { P = JSON.parse(st.text).product; } catch { /* */ }
  // Varumärket finns inte i product/state -- det läses ur produktsidans JSON-LD (samma källa som Task 17).
  let ld = null; for (const m of h.matchAll(/<script type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)) { try { const j = JSON.parse(m[1]); if (j["@type"] === "Product") ld = j; } catch { /* */ } }
  const brand = ld && ld.brand ? (ld.brand.name || (typeof ld.brand === "string" ? ld.brand : null)) : null;
  // Byte-identiska bilder på samma produkt (samma foto uppladdat flera gånger -> likadana miniatyrer).
  let dupes = [];
  if ((P && P.images || []).length > 1) {
    const seen = {};
    for (const im of P.images) { const hsh = crypto.createHash("md5").update(Buffer.from(await (await fetch(im.image_url)).arrayBuffer())).digest("hex"); (seen[hsh] = seen[hsh] || []).push(im.id); }
    dupes = Object.values(seen).filter(g => g.length > 1);
  }
  live[r.nhSlug] = P ? { id, name: P.name, brand, dupes, imageIds: (P.images || []).map(i => i.id), images: (P.images || []).length, sku: ((P.variants || [])[0] || {}).sku || null,
    cats: CATS.filter(c => L[c].has(r.nhSlug)) } : { status: "state " + st.status };
  process.stdout.write(".");
}
console.log();
const lv = r => live[r.nhSlug] || {};
const listedAnywhere = r => (lv(r).cats || []).length > 0;
const sku = r => lv(r).sku || `HZY-WC-${r.wooId}`;
const row = (r, ...cells) => `| ${r.nhId} | \`${r.nhSlug}\` | ${r.nhName} | ${sku(r)} | ${cells.join(" | ")} |`;
const H = (...c) => `| NH-id | Slug | Namn | SKU | ${c.join(" | ")} |\n|---|---|---|---|${c.map(() => "---").join("|")}|`;

// 1. Pre-rolls: format pre-roll (enkel/variabel, ej paket), synlig i Woo.
const preroll = MX.filter(r => r.format === "pre-roll" && r.kind !== "paket" && r.visibilityClass === "PUBLIC + LISTED");
// 2a. Paket listade i Nyehandel men dolda i Woo (facit: hidden).
const pkgs = MX.filter(r => r.kind === "paket" && listedAnywhere(r));
// 2b. High Life-produkter som Woo inte listar (hidden/search) men som Nyehandel listar.
const hl = MX.filter(r => /high.?life/i.test(r.nhName + r.nhSlug) && r.kind !== "paket" && r.wooVisibility !== "visible" && listedAnywhere(r));
const hlKeep = MX.filter(r => /high.?life/i.test(r.nhName + r.nhSlug) && r.wooVisibility === "visible");
// 3. CBD-isolat i Buds.
const iso = MX.filter(r => /isolat|isolate/i.test(r.nhSlug + r.nhName) && (lv(r).cats || []).includes("blommor-buds"));
// 4. Utan bild (live).
const noimg = MX.filter(r => lv(r).images === 0).sort((a, b) => (a.visibilityClass === "PUBLIC + LISTED" ? 0 : 1) - (b.visibilityClass === "PUBLIC + LISTED" ? 0 : 1));
// 5. Varumärke: belägg ur namnet och ur Woos tillverkarkategorier.
const MAKERS = { "Magic Farmers": /magic.?farmers/i, "Tatra Hemp": /tatra/i, Cookies: /cookies/i, Faraoh: /faraoh/i, "CBD Group": /cbd.?group/i, Canapuff: /canapuff/i, Canntropy: /canntropy/i, CCELL: /ccell/i, "Hero Vapes": /hero.?vapes?/i };
const WOO_MAKER = { "magic-farmers": "Magic Farmers", "tatra-hemp": "Tatra Hemp", cookies: "Cookies", faraoh: "Faraoh", "cbd-group": "CBD Group" };
const brandRows = [];
for (const r of MX) {
  const now = lv(r).brand ?? null;
  const fromName = Object.entries(MAKERS).filter(([, re]) => re.test(r.nhName + " " + r.nhSlug)).map(([k]) => k);
  const fromWoo = r.wooCategories.map(c => WOO_MAKER[c]).filter(Boolean);
  const ev = [...new Set([...fromWoo, ...fromName])];
  const status = !now ? "saknas" : ev.includes(now) ? "rätt" : "fel";
  if (status === "rätt") continue;
  const proposal = ev.length === 1 ? ev[0] : ev.length ? `oklart: ${ev.join(" / ")}` : "okänt – ägaren anger";
  brandRows.push({ r, now, status, proposal, ev: [...fromWoo.map(x => "Woo-kategori " + x), ...fromName.filter(x => !fromWoo.includes(x)).map(x => "namn " + x)].join(", ") || "inget belägg" });
}
const md = [];
md.push(`# Adminlista — TASK 17C (${new Date().toISOString().slice(0, 10)})`, "",
  "Exakt underlag för ändringar i Nyehandel-admin. **Inget av detta är gjort** — Theme 8 läser ändringarna automatiskt när de görs.",
  "Varje rad är kontrollerad live mot Nyehandel i samma körning som listan skrevs (`node admin-list.mjs`). Facit = WooCommerce (Task 17:s katalogmatris).",
  "SKU = varianternas SKU i Nyehandel (`HZY-WC-<Woo-id>`).", "");
md.push(`## 1. Skapa kategorin Pre-rolls (${preroll.length} produkter)`, "",
  "Föreslagen slug `pre-rolls`, under Alla produkter. Behåll produkternas nuvarande Buds-/Hasch-kategorier. När kategorin finns visar Alla Buds den under Produkttyp utan kodändring (filter-hooken läser kategorin). Pre-roll-paketen ska inte in här — de döljs i punkt 2.", "",
  H("Live i kategorier nu"), ...preroll.map(r => row(r, (lv(r).cats || []).join(", ") || "–")), "");
md.push(`## 2. Dölj paket och High Life-buds`, "",
  `### 2a. Paket (${pkgs.length}) — dolda i WooCommerce, listade i Nyehandel`, "",
  "Sätt synlighet till dold (eller ta bort ur kategorierna). Paketens sidor och paketköp ska inte aktiveras — se Task 17:s PACKAGE-MIGRATION-PLAN.md.", "",
  H("Woo", "Listad live i"), ...pkgs.map(r => row(r, r.wooVisibility, (lv(r).cats || []).join(", "))), "",
  `### 2b. High Life-produkter (${hl.length}) — inte listade i WooCommerce, listade i Nyehandel`, "",
  "När de är dolda försvinner Core automatiskt ur seriefiltret på Alla Buds (Core har då 0 buds-träffar).", "",
  H("Woo", "Listad live i"), ...hl.map(r => row(r, r.wooVisibility, (lv(r).cats || []).join(", "))), "",
  `Behåll (listade i Woo): ${hlKeep.map(r => `${r.nhId} \`${r.nhSlug}\``).join(", ")}.`, "");
md.push(`## 3. Ta bort CBD-isolatet ur Buds (${iso.length})`, "",
  "Ta bort kategorin Alla Buds (`blommor-buds`) från produkten. Isolatet aktiveras inte (Task 17-regel). I dag ger det viktvalet \"15 g\" på Alla Buds.", "",
  H("Woo", "Listad live i"), ...iso.map(r => row(r, r.wooVisibility, (lv(r).cats || []).join(", "))), "");
md.push(`## 4. Produkter utan bild (${noimg.length})`, "",
  "De listade produkterna (PUBLIC + LISTED) först — de syns för kunder i dag. Övriga är paket/delprodukter som ändå döljs enligt punkt 2. Ladda upp produktbild. Är bilden frilagd (PNG med alfa) visas den automatiskt som R2B efter att bildmanifestet genererats om.", "",
  H("Synlighet (Woo)", "Woo har bild"), ...noimg.map(r => row(r, r.visibilityClass, r.images && r.images.woo ? "ja (" + r.images.woo + ")" : "nej")), "");
const fel = brandRows.filter(b => b.status === "fel"), saknas = brandRows.filter(b => b.status === "saknas");
md.push(`## 5. Varumärke saknas eller är fel (${brandRows.length}: ${fel.length} fel, ${saknas.length} saknas)`, "",
  "Utan varumärke får produkten ingen universell PDP (och därmed ingen R2A/R2B-scen). \"Fel\" = Nyehandel säger Canapuff men varken namnet eller Woos tillverkarkategori stödjer det.",
  "Förslaget kommer bara ur belägg (Woos tillverkarkategorier `magic-farmers`, `tatra-hemp`, `cookies`, `faraoh`, `cbd-group` och tillverkarnamn i produktnamnet). WooCommerce har inga varumärken satta, så rader utan belägg måste ägaren ange.", "",
  H("Nu", "Status", "Förslag", "Belägg"), ...brandRows.sort((a, b) => a.status.localeCompare(b.status) || a.proposal.localeCompare(b.proposal)).map(b => row(b.r, b.now || "–", b.status, b.proposal, b.ev)), "");
const dup = MX.filter(r => (lv(r).dupes || []).length);
md.push(`## 6. Samma bild uppladdad flera gånger (${dup.length})`, "",
  "Bilderna är byte-identiska på CDN:en, så PDP-galleriet visar likadana miniatyrer. Behåll en (den som varianterna pekar på) och ta bort övriga — eller ersätt dem med riktiga sekundära bilder.", "",
  H("Synlighet (Woo)", "Identiska bild-id"), ...dup.map(r => row(r, r.visibilityClass, lv(r).dupes.map(g => g.join(" = ")).join("; "))), "");
fs.writeFileSync(path.join(DIR, "ADMIN-LIST.md"), md.join("\n"));
fs.writeFileSync(path.join(DIR, "runs/admin-list.json"), JSON.stringify({ generated: new Date().toISOString(), live, counts: { preroll: preroll.length, pkgs: pkgs.length, hl: hl.length, iso: iso.length, noimg: noimg.length, brandFel: fel.length, brandSaknas: saknas.length, dupes: dup.length } }, null, 1));
console.log({ dupes: dup.length, preroll: preroll.length, pkgs: pkgs.length, hl: hl.length, iso: iso.length, noimg: noimg.length, brandFel: fel.length, brandSaknas: saknas.length });
