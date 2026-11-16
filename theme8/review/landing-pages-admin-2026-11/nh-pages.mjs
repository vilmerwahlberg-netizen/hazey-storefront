// Content-sidor i Nyehandel via API v3 (page:read, page:create, page:update).
// Nycklar läses ur NH_ENV_FILE (standard ~/.config/hazey/nyehandel-pages-api.env).
// Token, id och hemlighet skrivs aldrig ut. Kommandon:
//   node nh-pages.mjs probe              lista sidor (utan brödtext), visa fälten
//   node nh-pages.mjs show <slug>        en sida, fält + längd på innehållet
//   node nh-pages.mjs plan               jämför de tre sidorna med repo-filerna (inget skrivs)
//   node nh-pages.mjs apply <slug>       skapa eller uppdatera EN sida, läs tillbaka och verifiera
import fs from "node:fs"; import os from "node:os"; import path from "node:path";
const API = "https://api.nyehandel.se/api/v3";
const SCOPES = "page:read page:create page:update";
const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), "../../..");
function creds() {
  const f = process.env.NH_ENV_FILE || path.join(os.homedir(), ".config/hazey/nyehandel-pages-api.env");
  const kv = Object.fromEntries(fs.readFileSync(f, "utf8").split(/\r?\n/).filter(l => /^\s*NH_/.test(l)).map(l => { const i = l.indexOf("="); return [l.slice(0, i).trim(), l.slice(i + 1).trim().replace(/^["']|["']$/g, "")]; }));
  if (!kv.NH_CLIENT_ID || !kv.NH_CLIENT_SECRET) throw new Error("NH_CLIENT_ID/NH_CLIENT_SECRET saknas i env-filen");
  return { id: kv.NH_CLIENT_ID, secret: kv.NH_CLIENT_SECRET };
}
let token = null;
async function auth() {
  if (token) return token;
  const c = creds();
  const r = await fetch("https://api.nyehandel.se/oauth/token", { method: "POST", headers: { Accept: "application/json", "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ grant_type: "client_credentials", client_id: c.id, client_secret: c.secret, scope: SCOPES }) });
  const j = await r.json().catch(() => ({}));
  if (!r.ok || !j.access_token) throw new Error(`Token: HTTP ${r.status} ${j.error || ""} ${j.error_description || j.message || ""}`.trim());
  token = j.access_token; return token;
}
export async function api(method, p, body) {
  const r = await fetch(API + p, { method, headers: { Authorization: `Bearer ${await auth()}`, Accept: "application/json", "X-Language": "sv", ...(body ? { "Content-Type": "application/json" } : {}) }, body: body ? JSON.stringify(body) : undefined });
  const text = await r.text(); let json = null; try { json = JSON.parse(text); } catch {}
  return { status: r.status, json, text: json ? "" : text.slice(0, 400) };
}
const strip = o => JSON.parse(JSON.stringify(o, (k, v) => (typeof v === "string" && v.length > 160) ? `<${v.length} tecken>` : v));
const cmd = process.argv[2];
if (cmd === "probe") {
  await auth(); console.log("token: ok (visas inte)");
  for (const q of ["/pages?per_page=100", "/pages"]) {
    const r = await api("GET", q); console.log(q, r.status, r.text);
    if (r.json) { console.log("meta:", JSON.stringify(r.json.meta || r.json.links || {}).slice(0, 300)); const d = r.json.data || r.json; console.log("antal:", Array.isArray(d) ? d.length : "-"); if (Array.isArray(d) && d[0]) console.log("fält:", JSON.stringify(strip(d[0]), null, 1).slice(0, 3000)); if (Array.isArray(d)) for (const x of d) console.log("  ", x.id, JSON.stringify(x.slug), JSON.stringify(x.title || x.name), x.status ?? x.active ?? x.is_active ?? ""); break; }
  }
}
if (cmd === "show") {
  const id = process.argv[3];
  const r = await api("GET", `/pages/${id}`); const d = r.json?.data || r.json;
  console.log(r.status, r.text); if (d) { console.log(JSON.stringify(strip(d), null, 1)); for (const [k, v] of Object.entries(d)) if (typeof v === "string" && v.length > 160) console.log(k, "börjar:", JSON.stringify(v.slice(0, 220))); }
}
/* De tre sidorna. SEO-fälten ur respektive senaste innehållskarta:
   THCX: design/thcx-mall-2026-11-13/AGENT-A-THCX-GSC-RADGRANSKNING-2026-11-15.md 4.1
   Engångsvapes: theme8/review/engangsvape-landing-2026-11/KARTLAGGNING.md avsnitt 2 (2 och 5 ml)
   THCA: theme8/review/thca-knowledge-2026-11/KARTLAGGNING.md avsnitt 1 */
export const PAGES = {
  thcx: { name: "THCX", file: "theme8/blocks/thcx.html",
    meta_title: "THCX i Sverige – vapes, hasch och fakta | Hazey",
    meta_description: "Vad är THCX (THC-X)? Se Hazeys THCX-vapes från Hero's Core och hasch från High Life och El Gringo, vad analysintyget visar och vanliga frågor." },
  engangsvape: { name: "Engångsvapes", file: "theme8/blocks/engangsvape.html",
    meta_title: "Engångsvapes med cannabinoider – Magic Sauce, Core och CBD | Hazey",
    meta_description: "Engångsvapes hos Hazey: Magic Sauce 3.0, Hero's Core och CBD i 2 och 5 ml. Se vad som finns i lager och pris, med analysintyg på produktsidorna." },
  thca: { name: "THCA", file: "theme8/blocks/thca.html",
    meta_title: "THCA i Sverige – vad det är, rättsläge och alternativ | Hazey",
    meta_description: "Vad är THCA? Fakta om tetrahydrocannabinolsyra och rättsläget: delta-9-THCA-A är narkotikaklassat i Sverige sedan 14 juli 2026 (SFS 2026:1109). Se serierna i vårt aktuella sortiment." },
  /* Ämnesguiderna (fältatlas), 2026-11-16. SEO-fälten:
     THCB: theme8/review/thcb-knowledge-2026-11/KARTLAGGNING.md (runda 2) och SEO-PARITET.md
     THCH: theme8/review/thch-hhc-knowledge-2026-11/KARTLAGGNING-THCH.md avsnitt 5
     HHC:  theme8/review/thch-hhc-knowledge-2026-11/KARTLAGGNING-HHC.md avsnitt 5 */
  thcb: { name: "THCB", file: "theme8/blocks/thcb.html",
    meta_title: "THCB (THC-B) i Sverige – fakta, rättsläge och källor | Hazey",
    meta_description: "Vad är THCB, eller THC-B? Fakta om tetrahydrocannabutol, rättsläget i Sverige med daterade primärkällor, THCB hos Hazey och vanliga frågor." },
  thch: { name: "THCH", file: "theme8/blocks/thch.html",
    meta_title: "THCH (THC-H) – vad det är och rättsläget i Sverige | Hazey",
    meta_description: "Vad är THCH, eller THC-H? Fakta om tetrahydrocannabihexol och rättsläget: delta-8- och delta-9-THCH är narkotikaklassade sedan 10 december 2024 (SFS 2024:985)." },
  hhc: { name: "HHC", file: "theme8/blocks/hhc.html",
    meta_title: "HHC – vad det är och rättsläget i Sverige | Hazey",
    meta_description: "Vad är HHC? Fakta om hexahydrocannabinol och rättsläget: HHC är narkotikaklassat i Sverige sedan 11 juli 2023 (SFS 2023:379). Källor, historik och vanliga frågor." },
  /* Rättslägeshubben: theme8/review/rattslage-hub-2026-11/KARTLAGGNING.md avsnitt 5 (namn = brödsmula) */
  "lagliga-cannabinoider-sverige": { name: "Rättsläge", file: "theme8/blocks/rattslage.html",
    meta_title: "Cannabinoider i Sverige – rättsläge ämne för ämne, med källor | Hazey",
    meta_description: "Vilka cannabinoider är narkotika eller hälsofarliga varor i Sverige? Ämnesindex med status, datum och primärkälla för THCA, THCB, THCH, HHC, CBD med flera." }
};
async function readPage(id) {
  for (let i = 0; i < 5; i++) { const r = await api("GET", `/pages/${id}`); const d = r.json?.data || (r.json?.id ? r.json : null); if (d) return d; await new Promise(res => setTimeout(res, 1500)); }
  throw new Error("kunde inte läsa tillbaka sida " + id);
}
async function allPages() { const r = await api("GET", "/pages?per_page=100"); if (r.status !== 200) throw new Error("GET /pages " + r.status); return r.json.data; }
function payloadFor(slug) { const p = PAGES[slug]; return { name: p.name, slug, description: fs.readFileSync(path.join(ROOT, p.file), "utf8"), meta_title: p.meta_title, meta_description: p.meta_description, active: true }; }
function compare(want, got) {
  const out = {};
  for (const k of ["name", "slug", "meta_title", "meta_description", "active"]) out[k] = want[k] === got[k] ? "ok" : { want: want[k], got: got[k] };
  const a = want.description, b = got.description || "";
  if (a === b) out.description = `ok (${a.length} tecken, identiskt)`;
  else if (a.trimEnd() === b.trimEnd()) out.description = `ok (${b.length} tecken, identiskt utom avslutande radbrytning som Nyehandel tar bort)`;
  else { let i = 0; while (i < a.length && a[i] === b[i]) i++; out.description = { wantLen: a.length, gotLen: b.length, firstDiffAt: i, want: a.slice(i, i + 120), got: b.slice(i, i + 120) }; }
  return out;
}
if (cmd === "plan") {
  const list = await allPages();
  for (const slug of Object.keys(PAGES)) {
    const ex = list.find(x => x.slug === slug); const w = payloadFor(slug);
    console.log(slug, ex ? `FINNS (id ${ex.id})` : "finns inte -> skapas", "| html", w.description.length, "tecken | titel", w.meta_title.length, "| meta", w.meta_description.length);
  }
}
if (cmd === "apply") {
  const slug = process.argv[3]; if (!PAGES[slug]) throw new Error("okänd slug");
  const want = payloadFor(slug);
  const ex = (await allPages()).find(x => x.slug === slug);
  let r;
  if (ex) {
    const cur = await readPage(ex.id);
    const diff = compare(want, cur);
    if (Object.values(diff).every(v => typeof v === "string")) { console.log(slug, "finns redan och är identisk, inget skrivs", diff); process.exit(0); }
    console.log(slug, "finns (id", ex.id, ") och skiljer sig:", JSON.stringify(diff).slice(0, 600));
    if (process.argv[4] !== "--update") { console.log("kör med --update för att skriva"); process.exit(0); }
    r = await api("PATCH", `/pages/${ex.id}`, want);
  } else r = await api("POST", "/pages", want);
  const d = r.json?.data || r.json;
  console.log(slug, ex ? "PATCH" : "POST", r.status, r.text || "", d?.id ? `id ${d.id}` : JSON.stringify(r.json).slice(0, 800));
  if (!d?.id) { const again = (await allPages()).find(x => x.slug === slug); if (!again) process.exit(1); d.id = again.id; }
  const back = await readPage(d.id);
  const v = compare(want, back);
  console.log("återläst:", JSON.stringify({ id: back.id, slug: back.slug, active: back.active, url_mapping: back.url_mapping, updated_at: back.updated_at }), "\nverifiering:", JSON.stringify(v, null, 1));
  const log = path.join(path.dirname(new URL(import.meta.url).pathname), "api-log.json");
  const L = fs.existsSync(log) ? JSON.parse(fs.readFileSync(log)) : {};
  L[slug] = { id: back.id, action: ex ? "updated" : "created", at: new Date().toISOString(), slug: back.slug, name: back.name, active: back.active, meta_title: back.meta_title, meta_description: back.meta_description, html_length: (back.description || "").length, html_identical: typeof v.description === "string", verify: v };
  fs.writeFileSync(log, JSON.stringify(L, null, 1));
}
