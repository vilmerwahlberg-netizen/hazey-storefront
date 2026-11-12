// TASK 17B: migrera de 75 WordPress-inläggen till Nyehandels blogg via API v3.
//
// Nycklar läses ALDRIG från repot: NH_CLIENT_ID / NH_CLIENT_SECRET tas från
// miljön eller från filen i NH_ENV_FILE (standard ~/.config/hazey/nyehandel-api.env,
// rader "NH_CLIENT_ID=..." / "NH_CLIENT_SECRET=..."). Token hålls bara i minnet.
//
// Användning (från repo-roten):
//   node theme8/review/blog-seo-2026-11/tools/nh-blog-migrate.mjs plan            # torrkörning, ingen API
//   node .../nh-blog-migrate.mjs probe                                            # läs: token, inlägg, personal
//   node .../nh-blog-migrate.mjs publish --only <slug>                            # pilot
//   node .../nh-blog-migrate.mjs publish --all                                    # resten (återupptagbar)
//   node .../nh-blog-migrate.mjs relink                                           # uppdatera blogg->blogg-länkar efter faktiska URL:er
//
// Idempotens: före varje skapande slås sluggen upp (GET /blog_posts?slug=); finns
// den återanvänds id:t och inlägget PATCH:as i stället. Uppladdade bilder cachas
// per källadress i loggen. Loggen: data/migration-log.json (inga hemligheter).
// Innehållet ändras inte i sak: endast bildadresser (till Nyehandel), trasiga
// bilder som redan är 404 i WordPress tas bort, blogglänkar pekas om till
// inläggens verkliga Nyehandel-URL. Allt loggas per artikel.
import fs from "node:fs"; import path from "node:path"; import os from "node:os";

const DIR = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const DATA = path.join(DIR, "data");
const LOG = path.join(DATA, "migration-log.json");
const API = "https://api.nyehandel.se/api/v3";
const SHOP = "https://hazeyse.nyehandel.se";
const UA = "Mozilla/5.0 (Macintosh) hazey-blog-migration";
/* Integrationen har bara bloggbehörigheter (beslut 2026-11-12): ingen personal-
   eller redirect-läsning. Författare kan därför inte slås upp via API. */
const SCOPES = "blog-post:create blog-post:read blog-post:update";
const sleep = ms => new Promise(r => setTimeout(r, ms));
const args = process.argv.slice(2); const cmd = args[0] || "plan";
const opt = k => { const i = args.indexOf(k); return i > -1 ? args[i + 1] : null; };

const inv = JSON.parse(fs.readFileSync(path.join(DATA, "wp-inventory.json"))).sort((a, b) => a.date.localeCompare(b.date));
const log = fs.existsSync(LOG) ? JSON.parse(fs.readFileSync(LOG)) : { media: {}, posts: {}, urlPattern: null, authorId: null };
const save = () => fs.writeFileSync(LOG, JSON.stringify(log, null, 1));

// ---------- hemligheter ----------
function creds() {
  let id = process.env.NH_CLIENT_ID, secret = process.env.NH_CLIENT_SECRET;
  const f = process.env.NH_ENV_FILE || path.join(os.homedir(), ".config/hazey/nyehandel-api.env");
  if ((!id || !secret) && fs.existsSync(f)) {
    for (const line of fs.readFileSync(f, "utf8").split("\n")) {
      const m = line.match(/^\s*(?:export\s+)?(NH_CLIENT_ID|NH_CLIENT_SECRET)\s*=\s*"?([^"\s]+)"?/);
      if (m && m[1] === "NH_CLIENT_ID") id = id || m[2];
      if (m && m[1] === "NH_CLIENT_SECRET") secret = secret || m[2];
    }
  }
  if (!id || !secret) throw new Error(`Saknar NH_CLIENT_ID/NH_CLIENT_SECRET (miljö eller ${f})`);
  return { id, secret };
}
let token = null, tokenAt = 0;
async function auth() {
  if (token && Date.now() - tokenAt < 50 * 60e3) return token;
  const c = creds();
  const r = await fetch("https://api.nyehandel.se/oauth/token", { method: "POST", headers: { Accept: "application/json", "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ grant_type: "client_credentials", client_id: c.id, client_secret: c.secret, scope: SCOPES }) });
  const j = await r.json().catch(() => ({}));
  if (!r.ok || !j.access_token) throw new Error(`Token: HTTP ${r.status} ${j.error || ""} ${j.error_description || j.message || ""}`.trim());
  token = j.access_token; tokenAt = Date.now(); return token;
}
async function api(method, p, body, { retry = true } = {}) {
  for (let a = 0; a < 4; a++) {
    const r = await fetch(API + p, { method, headers: { Authorization: `Bearer ${await auth()}`, Accept: "application/json", "X-Language": "sv", ...(body ? { "Content-Type": "application/json" } : {}) }, body: body ? JSON.stringify(body) : undefined });
    if (r.status === 429 && retry) { await sleep(15000); continue; }
    const j = await r.json().catch(() => null);
    await sleep(160); // ~375/min, under 500/min
    return { status: r.status, json: j };
  }
}

/* Uppladdning via källadress; om Nyehandel inte kan hämta den (t.ex. timeout
   mot WordPress) laddas filen ner här och skickas som multipart. */
async function uploadMedia(source, usage) {
  let r = await api("POST", "/media", { type: "image", usage, source_url: source });
  if (r.status === 422 && /could be downloaded/i.test(JSON.stringify(r.json))) {
    const f = await fetch(source, { headers: { "User-Agent": UA } });
    if (!f.ok) throw new Error(`hämtning ${source}: ${f.status}`);
    const buf = Buffer.from(await f.arrayBuffer());
    const fd = new FormData(); fd.append("type", "image"); fd.append("usage", usage);
    fd.append("file", new Blob([buf], { type: f.headers.get("content-type") || "image/jpeg" }), decodeURIComponent(new URL(source).pathname.split("/").pop()));
    const res = await fetch(API + "/media", { method: "POST", headers: { Authorization: `Bearer ${await auth()}`, Accept: "application/json" }, body: fd });
    r = { status: res.status, json: await res.json().catch(() => null) }; await sleep(160);
  }
  const d = r.json?.data || r.json;
  if (r.status >= 300 || !d?.id) throw new Error(`media ${source}: ${r.status} ${JSON.stringify(r.json).slice(0, 300)}`);
  return d;
}

// ---------- innehåll ----------
const WP_HOST = /^https?:\/\/(www\.)?hazey\.se/i;
const imgCheck = new Map();
async function head(u) {
  if (imgCheck.has(u)) return imgCheck.get(u);
  let res = { status: 0, final: u, type: "" };
  try { const r = await fetch(u, { headers: { "User-Agent": UA }, redirect: "follow" }); res = { status: r.status, final: r.url, type: r.headers.get("content-type") || "" }; await r.arrayBuffer(); } catch (e) { res.error = String(e); }
  imgCheck.set(u, res); return res;
}
function rawBody(slug) { return fs.readFileSync(path.join(DATA, "import", slug + ".html"), "utf8").replace(/^<!--[^]*?-->\s*/, ""); }
const postUrl = slug => (log.urlPattern || "/sv/posts/{slug}").replace("{slug}", slug);
function relinkPosts(html) {
  // Importpaketet pekar blogg->blogg på /sv/posts/{slug}; byt till verklig mall.
  return html.replace(/href="\/sv\/posts\/([a-z0-9-]+)"/g, (m, s) => `href="${postUrl(s)}"`);
}

/* Bilder: varje <img> laddas upp (usage: content) via källadressen och får
   Nyehandels permanenta URL. srcset/sizes pekar på WordPress och tas bort.
   En bild som redan är 404 i WordPress tas bort (loggas). */
async function prepareBody(x, { upload }) {
  let html = relinkPosts(rawBody(x.slug)); const notes = [], images = [];
  /* Beslut 2026-11-12: artiklar som går direkt från H1 till H3 (inga H2)
     får sina H3 som H2. Rubriktext och brödtext oförändrade. */
  if (!/<h2\b/i.test(html) && /<h3\b/i.test(html)) {
    const n = (html.match(/<h3\b/gi) || []).length;
    html = html.replace(/<h3\b/gi, "<h2").replace(/<\/h3>/gi, "</h2>");
    notes.push(`${n} st H3 -> H2 (artikeln saknade H2)`);
  }
  const tags = html.match(/<img\b[^>]*>/g) || [];
  for (const tag of tags) {
    const src = (tag.match(/\ssrc="([^"]+)"/) || [])[1];
    if (!src) continue;
    const h = await head(src);
    if (h.status !== 200 || !/^image\//.test(h.type)) {
      html = html.replace(tag, `<!-- hz8: bild saknas redan i WordPress (${h.status}) ${src} -->`);
      notes.push(`bild borttagen, ${h.status} i WordPress: ${src}`); images.push({ src, status: "missing-in-wp" }); continue;
    }
    let url = log.media[h.final]?.url || null;
    if (!url && upload) {
      const d = await uploadMedia(h.final, "content"); url = d.url; log.media[h.final] = { url, id: d.id, usage: "content" }; save();
    }
    const nt = tag.replace(/\s(srcset|sizes)="[^"]*"/g, "").replace(/\ssrc="[^"]+"/, ` src="${url || h.final}"`);
    html = html.replace(tag, nt); images.push({ src, final: h.final, nh: url, status: url ? "uploaded" : "planned" });
  }
  return { html, notes, images };
}
async function cover(x, { upload }) {
  if (!x.featured_image) return { images: [], note: "ingen utvald bild i WordPress" };
  const h = await head(x.featured_image);
  if (h.status !== 200) return { images: [], note: `utvald bild ${h.status} i WordPress` };
  if (!upload) return { images: [{ planned: h.final }] };
  /* En uppladdad omslagsbild kan bara höra till ett inlägg: nyckla per artikel. */
  const key = "cover:" + x.slug + ":" + h.final;
  let id = log.media[key]?.id;
  if (!id) {
    const d = await uploadMedia(h.final, "attachment"); id = d.id; log.media[key] = { id, url: d.url, usage: "attachment" }; save();
  }
  return { images: [{ image_id: id, alt_text: x.featured_alt || null, title: x.title.slice(0, 255) }] };
}
const gmt = x => (x.date_gmt || x.date).replace(/(\.\d+)?$/, "") + (x.date_gmt ? "Z" : "");

async function findBySlug(slug) {
  const r = await api("GET", `/blog_posts?slug=${encodeURIComponent(slug)}&per_page=5`);
  const list = r.json?.data || [];
  return list.find(p => p.slug === slug) || null;
}

async function publishOne(x) {
  const prev = log.posts[x.slug] || {};
  const body = await prepareBody(x, { upload: true });
  const cov = await cover(x, { upload: true });
  const payload = {
    title: x.title, slug: x.slug, body: body.html, meta_title: x.seo_title || null,
    meta_description: x.meta_description || null, published_at: gmt(x),
    author_id: log.authorId || null, images: cov.images
  };
  let existing = prev.nh_id ? (await api("GET", `/blog_posts/${prev.nh_id}`)).json?.data : null;
  if (!existing) existing = await findBySlug(x.slug);
  let r;
  if (existing) r = await api("PATCH", `/blog_posts/${existing.id}`, payload);
  else r = await api("POST", "/blog_posts", payload, { retry: false });
  const d = r.json?.data || r.json;
  if (r.status >= 300 || !d?.id) {
    // Timeout/okänt fel vid skapande: slå upp sluggen innan något görs om.
    const again = await findBySlug(x.slug);
    if (!again) throw new Error(`${x.slug}: ${r.status} ${JSON.stringify(r.json).slice(0, 500)}`);
    Object.assign(d || {}, again);
  }
  log.posts[x.slug] = { ...prev, wp_id: x.id, old_url: x.old_url, nh_id: d.id, slug: d.slug, title: x.title,
    published_at: d.published_at, author_id: d.author_id ?? null, cover: cov.images[0]?.image_id || null, cover_note: cov.note || null,
    images: body.images, notes: body.notes, action: existing ? "updated" : "created", at: new Date().toISOString() };
  save();
  return log.posts[x.slug];
}

// ---------- kommandon ----------
if (cmd === "plan") {
  let n = 0, miss = 0, up = 0, nocov = 0; const out = [];
  for (const x of inv) {
    const b = await prepareBody(x, { upload: false }); const c = await cover(x, { upload: false });
    n++; miss += b.images.filter(i => i.status === "missing-in-wp").length; up += b.images.filter(i => i.status === "planned").length; if (!c.images.length) nocov++;
    out.push({ slug: x.slug, imgs: b.images.length, missing: b.images.filter(i => i.status === "missing-in-wp").length, cover: c.images.length ? "ja" : c.note });
  }
  fs.writeFileSync(path.join(DATA, "migration-plan.json"), JSON.stringify(out, null, 1));
  console.log(`plan: ${n} inlägg, ${up} brödtextbilder att ladda upp, ${miss} redan 404 i WP, ${nocov} utan omslagsbild`);
  console.log("artiklar med saknad bild:", out.filter(o => o.missing).map(o => `${o.slug} (${o.missing})`).join(", "));
} else if (cmd === "probe") {
  await auth(); console.log("token: ok");
  const p = await api("GET", "/blog_posts?per_page=100"); console.log("blog_posts:", p.status, (p.json?.data || []).length, JSON.stringify(p.json?.meta || p.json?.pagination || {}).slice(0, 200));
  for (const b of (p.json?.data || []).slice(0, 5)) console.log("  ", b.id, b.slug, b.published_at);
  const authors = [...new Set((p.json?.data || []).map(b => b.author_id))]; console.log("author_id på befintliga inlägg:", JSON.stringify(authors));
} else if (cmd === "set-author") {
  log.authorId = opt("--id") ? +opt("--id") : null; save(); console.log("authorId =", log.authorId);
} else if (cmd === "set-pattern") {
  log.urlPattern = opt("--pattern"); save(); console.log("urlPattern =", log.urlPattern);
} else if (cmd === "publish") {
  const only = opt("--only"); const list = only ? inv.filter(x => x.slug === only) : args.includes("--all") ? inv : [];
  if (!list.length) throw new Error("Ange --only <slug> eller --all");
  let ok = 0;
  for (const x of list) {
    if (args.includes("--skip-done") && log.posts[x.slug]?.nh_id) { ok++; continue; }
    try { const r = await publishOne(x); ok++; console.log(`${r.action} ${r.nh_id} ${x.slug}`); }
    catch (e) { log.posts[x.slug] = { ...(log.posts[x.slug] || {}), error: String(e.message || e), at: new Date().toISOString() }; save(); console.log(`FEL ${x.slug}: ${e.message}`); }
  }
  console.log(`klart: ${ok}/${list.length}`);
} else if (cmd === "relink") {
  let n = 0;
  for (const x of inv) {
    const p = log.posts[x.slug]; if (!p?.nh_id || !/href="\/sv\/posts\//.test(rawBody(x.slug))) continue;
    const b = await prepareBody(x, { upload: true });
    const r = await api("PATCH", `/blog_posts/${p.nh_id}`, { body: b.html });
    console.log(r.status, x.slug); n++;
  }
  console.log("relänkade", n);
}
