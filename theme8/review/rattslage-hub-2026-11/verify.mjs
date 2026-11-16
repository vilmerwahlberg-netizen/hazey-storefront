// Rättslägeshubben: lokal Theme 8-build i preview-instansen. Sidan finns inte i
// Nyehandel. FIXTUR: en riktig, tom innehållssida (/sv/page/kopvillkor) hämtas
// och dess .store-page fylls med blocket, med föreslagen titel/meta/canonical och
// brödsmula (KARTLAGGNING.md avsnitt 5). Inget skrivs till Nyehandel.
//
// Kör: node theme8/review/rattslage-hub-2026-11/verify.mjs   (ONLY=hub-393,hub-1440)
// Lägen: noatmo (bilden 404), reduced (reducerad rörelse), nojs (Theme 8-JS 404).
import fs from "node:fs"; import path from "node:path";
import { chromium, ctxFor, open, ready, url } from "../launch-task-queue-2026-10/01-global-boot-footer/review/lib.mjs";
const DIR = path.dirname(new URL(import.meta.url).pathname);
const OUT = process.env.OUT || path.join(DIR, "shots"); fs.mkdirSync(OUT, { recursive: true });
const LOADER = fs.readFileSync(path.join(DIR, "../../blocks/loader-theme8-dev.html"), "utf8").trim();
export const SLUG = "lagliga-cannabinoider-sverige";
export const TITLE = "Cannabinoider i Sverige – rättsläge ämne för ämne, med källor | Hazey";
export const META = "Vilka cannabinoider är narkotika eller hälsofarliga varor i Sverige? Ämnesindex med status, datum och primärkälla för THCA, THCB, THCH, HHC, CBD med flera, kontrollerat 16 november 2026.";
const BLOCK = () => fs.readFileSync(path.join(DIR, "../../blocks/rattslage.html"), "utf8");
let fixtureHtml = "";

export async function fixture(ctx, mode) {
  await ctx.route(new RegExp(`/sv/page/${SLUG}(\\?|$)`), async r => {
    if (r.request().resourceType() !== "document") return r.continue();
    const res = await r.fetch({ url: url("/sv/page/kopvillkor") });
    let html = await res.text();
    html = html.replace(/<!-- Theme 8 development loader[\s\S]*?<\/script>/, () => LOADER)
      .replace(/<div class="store-page">\s*<\/div>/, () => `<div class="store-page"><div class="template-components__html-editor">${BLOCK()}</div></div>`)
      .replace(/<title>[^<]*<\/title>/, `<title>${TITLE}</title>`)
      .replace(/<meta name="description" content="[^"]*">/, `<meta name="description" content="${META}">`)
      .replace(/(<link rel="canonical" href=")[^"]*/, `$1https://hazeyse.nyehandel.se/sv/page/${SLUG}`)
      .replace(/page\/kopvillkor/g, `page/${SLUG}`).replace(/>\s*Köpvillkor\s*</g, ">Rättsläge<");
    fixtureHtml = html;
    return r.fulfill({ status: 200, body: html, headers: { "content-type": "text/html; charset=utf-8" } });
  });
  if (mode === "noatmo") await ctx.route(/assets\/knowledge-hub\//, r => r.fulfill({ status: 404, body: "" }));
  if (mode === "nojs") await ctx.route(/hazey-theme8\.min\.js/, r => r.fulfill({ status: 404, body: "" }));
}

async function contrast(p, sels, h) {
  const out = [];
  for (const s of sels) {
    const ok = await p.evaluate(s => { const e = document.querySelector(s); if (!e || !(e.offsetWidth || e.offsetHeight)) return false; e.scrollIntoView({ block: "center", behavior: "instant" }); return true; }, s);
    if (!ok) { out.push({ s, skipped: "saknas/dold" }); continue; }
    await p.waitForTimeout(200);
    const box = await p.evaluate(s => { const e = document.querySelector(s); const q = e.getBoundingClientRect(); return { r: [q.left, q.top, q.width, q.height], c: getComputedStyle(e).color }; }, s);
    if (box.r[1] < 0 || box.r[1] + box.r[3] > h) { out.push({ s, skipped: "utanför vyn" }); continue; }
    const tag = await p.addStyleTag({ content: "#store-main#store-main .hz8-lp *{color:transparent!important;text-decoration-color:transparent!important;border-color:transparent!important;caret-color:transparent!important;transition:none!important} #store-main#store-main .hz8-lp :is(a,li,div,p,span,td,th,.hz8-lp__eyebrow,.hz8-atlas__kicker)::after,#store-main#store-main .hz8-lp :is(a,li,p,span,td,th)::before{visibility:hidden!important} #store-main#store-main .hz8-lp input::placeholder{color:transparent!important}" });
    await p.waitForTimeout(200);
    const shot = (await p.screenshot()).toString("base64");
    await p.evaluate(t => t.remove(), tag);
    out.push(await p.evaluate(async ({ shot, box, s }) => {
      const i = new Image(); i.src = "data:image/png;base64," + shot; await i.decode();
      const k = i.width / innerWidth; const c = document.createElement("canvas"); c.width = i.width; c.height = i.height; const x = c.getContext("2d"); x.drawImage(i, 0, 0);
      const lin = v => { v /= 255; return v <= .03928 ? v / 12.92 : ((v + .055) / 1.055) ** 2.4; };
      const L = (r, g, b) => .2126 * lin(r) + .7152 * lin(g) + .0722 * lin(b);
      const cc = document.createElement("canvas").getContext("2d"); cc.fillStyle = box.c; cc.fillRect(0, 0, 1, 1); const [tr, tg, tb] = cc.getImageData(0, 0, 1, 1).data; const lt = L(tr, tg, tb);
      const r = box.r; const d = x.getImageData(Math.max(0, r[0] * k), Math.max(0, r[1] * k), Math.max(1, Math.min(r[2], innerWidth - r[0]) * k), Math.max(1, r[3] * k)).data; const ls = [];
      for (let j = 0; j < d.length; j += 16) ls.push(L(d[j], d[j + 1], d[j + 2]));
      ls.sort((a, b) => a - b);
      const cr = lb => +((Math.max(lb, lt) + .05) / (Math.min(lb, lt) + .05)).toFixed(2);
      const light = lt > .4; const worst = light ? ls[Math.floor(ls.length * .88)] : ls[Math.floor(ls.length * .05)];
      return { s, worst: cr(worst) };
    }, { shot, box, s }));
  }
  await p.evaluate(() => window.scrollTo(0, 0));
  return out;
}


// Hel sida: Chrome klipper skärmbilder över ca 16 384 enhetspixlar (hubben är ca 10 600 px
// hög vid 393 och DPR 2) och upprepar då innehåll. Högre sidor tas i delar och sätts ihop
// i halv upplösning (1 enhetspixel per CSS-pixel).
async function fullShot(p, file) {
  const { H, dpr } = await p.evaluate(() => ({ H: document.documentElement.scrollHeight, dpr: devicePixelRatio }));
  if (H * dpr <= 16000) return p.screenshot({ path: file, fullPage: true });
  const W = await p.evaluate(() => document.documentElement.clientWidth); const step = Math.floor(15000 / dpr); const parts = [];
  let hide = null;
  for (let y = 0; y < H; y += step) {
    // Den fasta headern hör bara hemma överst; i senare delar skulle den ritas mitt i sidan.
    if (y > 0 && !hide) { hide = true; await p.evaluate(() => { for (const e of document.querySelectorAll("body *")) { const s = getComputedStyle(e); if ((s.position === "fixed" || s.position === "sticky") && s.visibility !== "hidden") { e.dataset.hz8ShotHidden = "1"; e.style.setProperty("visibility", "hidden", "important"); } } }); }
    parts.push((await p.screenshot({ fullPage: true, clip: { x: 0, y, width: W, height: Math.min(step, H - y) } })).toString("base64"));
  }
  if (hide) await p.evaluate(() => { for (const e of document.querySelectorAll("[data-hz8-shot-hidden]")) { e.style.removeProperty("visibility"); delete e.dataset.hz8ShotHidden; } });
  const page2 = await p.context().newPage();
  const png = await page2.evaluate(async ({ parts, W, H, step }) => {
    const c = document.createElement("canvas"); c.width = W; c.height = H; const g = c.getContext("2d");
    for (let k = 0; k < parts.length; k++) { const i = new Image(); i.src = "data:image/png;base64," + parts[k]; await i.decode(); g.drawImage(i, 0, k * step, W, i.height * W / i.width); }
    return c.toDataURL("image/png").split(",")[1];
  }, { parts, W, H, step });
  await page2.close(); fs.writeFileSync(file, Buffer.from(png, "base64"));
}

if (process.argv[1] === new URL(import.meta.url).pathname) {
const b = await chromium.launch({ channel: "chrome" }); const results = [];
const ALL = [["hub-393", 393, 852], ["hub-1440", 1440, 900], ["hub-768", 768, 1024], ["hub-320", 320, 700], ["hub-430", 430, 932], ["hub-320-568", 320, 568], ["hub-1920", 1920, 1080],
  ["hub-393-noatmo", 393, 852, "noatmo"], ["hub-393-reduced", 393, 852, "reduced"], ["hub-393-nojs", 393, 852, "nojs"], ["hub-1440-nojs", 1440, 900, "nojs"]];
const RUNS = ALL.filter(([t]) => !process.env.ONLY || process.env.ONLY.split(",").includes(t));
for (const [tag, w, h, mode] of RUNS) {
  const ctx = await ctxFor(b, w, h, { which: "after" }); await fixture(ctx, mode);
  const p = await open(ctx, `/sv/page/${SLUG}`, { before: mode === "reduced" ? pg => pg.emulateMedia({ reducedMotion: "reduce" }) : null });
  if (mode === "nojs") await p.waitForTimeout(4000); else await ready(p, 4500);
  await p.waitForTimeout(1500);
  await p.screenshot({ path: path.join(OUT, `${tag}-fold.png`) });
  const fold = await p.evaluate(() => {
    const r = s => { const e = document.querySelector(s); if (!e) return null; const q = e.getBoundingClientRect(); return { top: Math.round(q.top), bottom: Math.round(q.bottom) }; };
    return { h1: r(".hz8-lp h1"), photo: r(".hz8-atlas__photo"), indexH2: r("#hz8-hub-index"), search: r(".hz8-hub__search"), firstRow: r(".hz8-hub__table tbody tr"), vh: innerHeight,
      rowsInFold: [...document.querySelectorAll(".hz8-hub__table tbody tr")].filter(t => { const q = t.getBoundingClientRect(); return q.height && q.bottom <= innerHeight; }).length,
      searchInFold: (() => { const e = document.querySelector(".hz8-hub__search input"); return !!e && e.getBoundingClientRect().bottom <= innerHeight; })() };
  });
  await p.evaluate(async () => { for (let y = 0; y < document.body.scrollHeight; y += 450) { window.scrollTo(0, y); await new Promise(r => setTimeout(r, 90)); } window.scrollTo(0, 0); });
  await p.waitForTimeout(800);
  const m = await p.evaluate(() => {
    const vis = e => !!(e && (e.offsetWidth || e.offsetHeight));
    const txt = e => e ? e.textContent.replace(/\s+/g, " ").trim() : "";
    const photo = document.querySelector(".hz8-atlas__photo");
    const rows = [...document.querySelectorAll(".hz8-hub__table tbody tr")];
    return {
      classes: ["hz8-lp-page", "hz8-atlas-page"].filter(c => document.documentElement.classList.contains(c)), scene: document.documentElement.getAttribute("data-hz8-lp-scene"),
      enhanced: !!document.querySelector(".hz8-atlas--hub.is-enhanced"), collapsible: !!document.querySelector(".hz8-hub__table.is-collapsible"),
      title: document.title, meta: document.querySelector('meta[name="description"]')?.content,
      h1: [...document.querySelectorAll("h1")].filter(vis).map(txt), h2: [...document.querySelectorAll("#store-main h2")].filter(vis).map(txt),
      overflowX: document.documentElement.scrollWidth - innerWidth,
      wide: [...document.querySelectorAll("#store-main *")].filter(e => { const q = e.getBoundingClientRect(); return q.width && q.right > innerWidth + 1 && !e.matches(".hz8-atlas__photo, .hz8-atlas__law, .hz8-atlas__opening, .hz8-hub__toggle"); }).slice(0, 5).map(e => e.tagName + "." + [...e.classList].join(".")),
      photo: photo ? { bg: getComputedStyle(photo).backgroundImage.match(/knowledge-[a-z]+\/[a-z0-9-]+\.webp/g), h: Math.round(photo.getBoundingClientRect().height) } : null,
      lead: (() => { const l = document.querySelector("#amnesindex .hz8-atlas__lead"), t = document.querySelector(".hz8-hub__table"); if (!l) return null; const a = l.getBoundingClientRect(), z = t.getBoundingClientRect(); return { visible: vis(l), belowTable: a.top >= z.bottom - 1 }; })(),
      rows: rows.length, rowsVisible: rows.filter(vis).length,
      rowLinksVisible: rows.map(r => [...r.querySelectorAll("a")].filter(vis).length).reduce((a, b) => a + b, 0),
      rowLinksInDom: rows.map(r => r.querySelectorAll("a").length).reduce((a, b) => a + b, 0),
      faq: [...document.querySelectorAll(".hz8-lp__qa details")].map(d => txt(d.querySelector("summary"))),
      banned: (document.querySelector(".hz8-lp").textContent.match(/psykoaktiv|\brus\b|berus|medicin|effekt|upplevelse|lagliga alternativ|100 ?%|garanter|fri frakt|\bdos|inom 24 timmar|granskad av|laglig att köpa/gi) || []),
      buyButtons: [...document.querySelectorAll(".hz8-lp a, .hz8-lp button")].filter(a => /köp|lägg i varukorg|handla/i.test(a.textContent)).map(txt),
      links: [...document.querySelectorAll(".hz8-lp a[href]")].map(a => a.getAttribute("href").replace(/\?preview=.*/, "")).filter((v, i, a) => a.indexOf(v) === i),
      footer: vis(document.querySelector("#store-footer, footer"))
    };
  });
  m.fold = fold;
  if (mode !== "nojs") {
    // Sök: skriv, räkna, töm med Escape
    const q = p.locator(".hz8-hub__search input");
    m.search = {};
    if (await q.count()) {
      for (const term of ["hhc", "THC-H", "cbd", "xyz"]) {
        await q.fill(term); await p.waitForTimeout(150);
        m.search[term] = await p.evaluate(() => ({ shown: [...document.querySelectorAll(".hz8-hub__table tbody tr:not(.is-filtered)")].map(r => r.querySelector(".hz8-hub__name").textContent), count: document.querySelector(".hz8-hub__count").textContent, empty: !document.querySelector(".hz8-hub__empty").hidden }));
      }
      await q.focus(); await p.keyboard.press("Escape"); await p.waitForTimeout(150);
      m.search.afterEscape = await p.evaluate(() => ({ value: document.querySelector(".hz8-hub__search input").value, shown: document.querySelectorAll(".hz8-hub__table tbody tr:not(.is-filtered)").length }));
    }
    // Öppningsbar rad med tangentbord (bara mobil)
    if (w < 768) {
      const t = p.locator(".hz8-hub__toggle").first();
      await t.focus(); await p.keyboard.press("Enter"); await p.waitForTimeout(250);
      m.rowToggle = await p.evaluate(() => { const tr = document.querySelector(".hz8-hub__table tbody tr"); const b = tr.querySelector(".hz8-hub__toggle"); return { expanded: b.getAttribute("aria-expanded"), linksVisible: [...tr.querySelectorAll("a")].filter(a => a.offsetWidth).length, label: b.textContent.trim() }; });
      await p.screenshot({ path: path.join(OUT, `${tag}-rad-oppen.png`) });
      await p.keyboard.press("Tab"); m.rowToggle.tabTo = await p.evaluate(() => document.activeElement?.textContent.trim().slice(0, 40));
      await p.locator(".hz8-hub__toggle").first().click(); await p.waitForTimeout(150);
    }
    m.contrast = await contrast(p, [".hz8-lp h1", ".hz8-lp__eyebrow", ".hz8-atlas__tagline", ".hz8-hub__checked", ".hz8-atlas__jump a", ".hz8-atlas__lead", ".hz8-hub__search input", ".hz8-hub__count", ".hz8-hub__table thead th", ".hz8-hub__name", ".hz8-hub__alias", ".hz8-hub__status", ".hz8-hub__note", ".hz8-hub__table td.hz8-hub__more", ".hz8-hub__table td a", ".hz8-hub__method-title", ".hz8-atlas__aside > p:not([class])", ".hz8-atlas__related a", "#metod .hz8-atlas__text p", ".hz8-hub__terms dt", ".hz8-hub__terms dd", ".hz8-atlas__timeline time", ".hz8-atlas__timeline span", ".hz8-hub__open li", ".hz8-atlas__source-list strong", ".hz8-atlas__source-list a > span", ".hz8-atlas__credit", ".hz8-lp__qa summary"], h);
    // Första synliga ankarlänken: heron på desktop, metodspalten på mobil (heronlänkarna döljs där).
    await p.locator(".hz8-atlas__jump a:visible, .hz8-atlas__aside .hz8-atlas__related a:visible").first().focus(); await p.keyboard.press("Enter"); await p.waitForTimeout(1100);
    m.anchor = await p.evaluate(() => ({ hash: location.hash, top: location.hash ? Math.round(document.getElementById(location.hash.slice(1)).getBoundingClientRect().top) : null }));
    await p.locator(".hz8-lp__qa summary").first().focus(); await p.keyboard.press("Enter"); await p.waitForTimeout(350);
    m.faqOpen = await p.evaluate(() => document.querySelector(".hz8-lp__qa details").open);
    await p.keyboard.press("Enter");
  }
  await p.evaluate(() => { document.activeElement?.blur(); history.replaceState(null, "", location.pathname + location.search); window.scrollTo({ top: 0, behavior: "instant" }); }); await p.waitForTimeout(700);
  await fullShot(p, path.join(OUT, `${tag}-full.png`));
  m.errors = p.errors.filter(e => !/favicon|trustpilot|Failed to load resource|recaptcha/i.test(e));
  if (w === 1440 && !mode) {
    m.linkStatus = {};
    for (const href of m.links) {
      if (href.startsWith("#")) { m.linkStatus[href] = (await p.evaluate(id => !!document.getElementById(id), href.slice(1))) ? "anchor-ok" : "anchor-missing"; continue; }
      const u = href.startsWith("/") ? new URL(url(href.split("#")[0])) : new URL(href);
      const res = await ctx.request.get(u.toString(), { maxRedirects: 0, headers: { "user-agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36" } }).catch(e => ({ status: () => String(e).slice(0, 40) }));
      m.linkStatus[href] = res.status();
    }
  }
  results.push({ tag, w, mode: mode || "", ...m }); console.log(tag, "ovf", m.overflowX, "err", m.errors.length, "h1", m.h1.length, "rows", m.rowsVisible + "/" + m.rows, "links", m.rowLinksVisible + "/" + m.rowLinksInDom);
  await ctx.close();
}
const B = BLOCK(); const noComments = B.replace(/<!--[\s\S]*?-->/g, "");
const initial = { h1: (B.match(/<h1/g) || []).length, h2: (B.match(/<h2/g) || []).length, rows: (B.match(/<tr data-hz8-terms/g) || []).length, links: (noComments.match(/<a /g) || []).length, faq: (B.match(/<details/g) || []).length, searchInHtml: /<input/.test(B) };
if (!process.env.OUT) {
  const f = path.join(DIR, "verify.json");
  const prev = process.env.ONLY && fs.existsSync(f) ? JSON.parse(fs.readFileSync(f, "utf8")).results : [];
  const merged = ALL.map(([t]) => results.find(r => r.tag === t) || prev.find(r => r.tag === t)).filter(Boolean);
  fs.writeFileSync(f, JSON.stringify({ initial, results: merged }, null, 1));
}
console.log("initial-html", JSON.stringify(initial));
await b.close();
}
