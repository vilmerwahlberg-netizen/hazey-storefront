// Kunskapsfamiljen THCB, THCH och HHC (fältatlas R3): lokal Theme 8-build i
// preview-instansen. Ingen av sidorna finns i Nyehandel ännu (/sv/page/thcb och
// /sv/page/thch ger 301 till kategorin, /sv/page/hhc 404). FIXTUR: en riktig, tom
// innehållssida (/sv/page/kopvillkor) hämtas och dess .store-page fylls med
// blocket, med föreslagen titel/meta/canonical och brödsmula. Alla tre slugar
// besvaras av fixturen, så länkarna mellan guiderna går att följa. Inget skrivs
// till Nyehandel.
//
// Kör: node theme8/review/thch-hhc-knowledge-2026-11/verify.mjs
//   ONLY=thch-393,hhc-1440   bara dessa körningar
// Lägen: noatmo (stämningsbilden 404), reduced (reducerad rörelse), nojs.
import fs from "node:fs"; import path from "node:path";
import { chromium, ctxFor, open, ready, url } from "../launch-task-queue-2026-10/01-global-boot-footer/review/lib.mjs";
const DIR = path.dirname(new URL(import.meta.url).pathname);
const OUT = process.env.OUT || path.join(DIR, "shots"); fs.mkdirSync(OUT, { recursive: true });
const LOADER = fs.readFileSync(path.join(DIR, "../../blocks/loader-theme8-dev.html"), "utf8").trim();
// FÖRSLAG, inte beslutade (KARTLAGGNING-*.md avsnitt 1 / BESLUT.md).
export const PAGES = {
  thcb: { name: "THCB", title: "THCB (THC-B) i Sverige – fakta, rättsläge och källor | Hazey", meta: "Vad är THCB, eller THC-B? Fakta om tetrahydrocannabutol, rättsläget i Sverige med daterade primärkällor, THCB hos Hazey och vanliga frågor.", assets: /assets\/knowledge-thcb\// },
  thch: { name: "THCH", title: "THCH (THC-H) – vad det är och rättsläget i Sverige | Hazey", meta: "Vad är THCH, eller THC-H? Fakta om tetrahydrocannabihexol och rättsläget: delta-8- och delta-9-THCH är narkotikaklassade sedan 10 december 2024 (SFS 2024:985).", assets: /assets\/knowledge-thch\// },
  hhc: { name: "HHC", title: "HHC – vad det är och rättsläget i Sverige | Hazey", meta: "Vad är HHC? Fakta om hexahydrocannabinol och rättsläget: HHC är narkotikaklassat i Sverige sedan 11 juli 2023 (SFS 2023:379). Källor, historik och vanliga frågor.", assets: /assets\/knowledge-hhc\// }
};
const block = slug => fs.readFileSync(path.join(DIR, `../../blocks/${slug}.html`), "utf8");
const fixtureHtml = {};

export async function fixture(ctx, mode, onlySlug) {
  for (const [slug, P] of Object.entries(PAGES)) {
    await ctx.route(new RegExp(`/sv/page/${slug}(\\?|$)`), async r => {
      if (r.request().resourceType() !== "document") return r.continue();
      const res = await r.fetch({ url: url("/sv/page/kopvillkor") });
      let html = await res.text();
      html = html.replace(/<!-- Theme 8 development loader[\s\S]*?<\/script>/, () => LOADER)
        .replace(/<div class="store-page">\s*<\/div>/, () => `<div class="store-page"><div class="template-components__html-editor">${block(slug)}</div></div>`)
        .replace(/<title>[^<]*<\/title>/, `<title>${P.title}</title>`)
        .replace(/<meta name="description" content="[^"]*">/, `<meta name="description" content="${P.meta.replace(/"/g, "&quot;")}">`)
        .replace(/(<link rel="canonical" href=")[^"]*/, `$1https://hazeyse.nyehandel.se/sv/page/${slug}`)
        .replace(/page\/kopvillkor/g, `page/${slug}`).replace(/>\s*Köpvillkor\s*</g, `>${P.name}<`);
      fixtureHtml[slug] = html;
      return r.fulfill({ status: 200, body: html, headers: { "content-type": "text/html; charset=utf-8" } });
    });
  }
  if (mode === "noatmo") await ctx.route(PAGES[onlySlug].assets, r => r.fulfill({ status: 404, body: "" }));
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
    const tag = await p.addStyleTag({ content: "#store-main#store-main .hz8-lp *{color:transparent!important;text-decoration-color:transparent!important;border-color:transparent!important;caret-color:transparent!important;transition:none!important} #store-main#store-main .hz8-lp :is(a,li,div,p,span,.hz8-lp__eyebrow,.hz8-atlas__kicker)::after,#store-main#store-main .hz8-lp :is(a,li,p,span)::before{visibility:hidden!important}" });
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

if (process.argv[1] === new URL(import.meta.url).pathname) {
const b = await chromium.launch({ channel: "chrome" }); const results = [];
const ALL = [];
for (const slug of ["thcb", "thch", "hhc"]) for (const [w, h] of [[393, 852], [1440, 900]]) ALL.push([`${slug}-${w}`, slug, w, h]);
for (const slug of ["thch", "hhc"]) { ALL.push([`${slug}-768`, slug, 768, 1024]); ALL.push([`${slug}-320`, slug, 320, 700]); ALL.push([`${slug}-1920`, slug, 1920, 1080]); ALL.push([`${slug}-393-noatmo`, slug, 393, 852, "noatmo"]); ALL.push([`${slug}-393-reduced`, slug, 393, 852, "reduced"]); ALL.push([`${slug}-393-nojs`, slug, 393, 852, "nojs"]); }
const RUNS = ALL.filter(([t]) => !process.env.ONLY || process.env.ONLY.split(",").includes(t));
for (const [tag, slug, w, h, mode] of RUNS) {
  const ctx = await ctxFor(b, w, h, { which: "after" }); await fixture(ctx, mode, slug);
  const p = await open(ctx, `/sv/page/${slug}`, { before: mode === "reduced" ? pg => pg.emulateMedia({ reducedMotion: "reduce" }) : null });
  if (mode === "nojs") await p.waitForTimeout(4000); else await ready(p, 4500);
  await p.waitForTimeout(1500);
  await p.screenshot({ path: path.join(OUT, `${tag}-fold.png`) });
  const fold = await p.evaluate(() => {
    const r = s => { const e = document.querySelector(s); if (!e) return null; const q = e.getBoundingClientRect(); return { top: Math.round(q.top), bottom: Math.round(q.bottom) }; };
    return { header: r("#store-header"), h1: r(".hz8-lp h1"), photo: r(".hz8-atlas__photo"), ch1H2: r("#hz8-atlas-what"), index: r(".hz8-atlas__chapters"), vh: innerHeight };
  });
  await p.evaluate(async () => { for (let y = 0; y < document.body.scrollHeight; y += 450) { window.scrollTo(0, y); await new Promise(r => setTimeout(r, 90)); } window.scrollTo(0, 0); });
  await p.waitForTimeout(800);
  const m = await p.evaluate(() => {
    const vis = e => !!(e && (e.offsetWidth || e.offsetHeight));
    const txt = e => e ? e.textContent.replace(/\s+/g, " ").trim() : "";
    const photo = document.querySelector(".hz8-atlas__photo");
    const facts = [...document.querySelectorAll(".hz8-lp h2, .hz8-atlas__lead, .hz8-atlas__text p, .hz8-atlas__facts dd, .hz8-atlas__timeline span, .hz8-atlas__source-list strong, .hz8-lp__qa details > p")].map(e => {
      const cs = getComputedStyle(e); return { t: txt(e).slice(0, 60), visible: e.closest("details") ? true : vis(e) && cs.visibility === "visible" && +cs.opacity > .9 };
    });
    return {
      classes: ["hz8-lp-page", "hz8-atlas-page"].filter(c => document.documentElement.classList.contains(c)), scene: document.documentElement.getAttribute("data-hz8-lp-scene"),
      title: document.title, meta: document.querySelector('meta[name="description"]')?.content,
      h1: [...document.querySelectorAll("h1")].filter(vis).map(txt), h2: [...document.querySelectorAll("#store-main h2")].filter(vis).map(txt),
      overflowX: document.documentElement.scrollWidth - innerWidth,
      wide: [...document.querySelectorAll("#store-main *")].filter(e => { const q = e.getBoundingClientRect(); return q.width && q.right > innerWidth + 1 && !e.matches(".hz8-atlas__photo, .hz8-atlas__law, .hz8-atlas__opening"); }).slice(0, 5).map(e => e.tagName + "." + [...e.classList].join(".")),
      photo: photo ? { bg: getComputedStyle(photo).backgroundImage.match(/knowledge-[a-z]+\/[a-z0-9-]+\.webp/g), h: Math.round(photo.getBoundingClientRect().height) } : null,
      imgs: performance.getEntriesByType("resource").filter(e => /knowledge-/.test(e.name)).map(e => e.name.split("/").slice(-2).join("/")),
      buyButtons: [...document.querySelectorAll(".hz8-lp a, .hz8-lp button")].filter(a => /köp|lägg i varukorg|handla/i.test(a.textContent)).map(txt),
      facts, faq: [...document.querySelectorAll(".hz8-lp__qa details")].map(d => txt(d.querySelector("summary"))),
      banned: (document.querySelector(".hz8-lp").textContent.match(/psykoaktiv|\brus\b|berus|medicin|effekt|upplevelse|lagliga alternativ|100 ?%|garanter|fri frakt|\bdos/gi) || []),
      links: [...document.querySelectorAll(".hz8-lp a[href]")].map(a => a.getAttribute("href").replace(/\?preview=.*/, "")).filter((v, i, a) => a.indexOf(v) === i),
      footer: vis(document.querySelector("#store-footer, footer"))
    };
  });
  m.fold = fold;
  if (mode !== "nojs") {
    m.contrast = await contrast(p, [".hz8-lp h1", ".hz8-lp__eyebrow", ".hz8-atlas__tagline", ".hz8-atlas__jump a", ".hz8-atlas__lead", ".hz8-atlas__no", ".hz8-atlas__chapters strong", ".hz8-atlas__chip", ".hz8-atlas__status > span:last-child", ".hz8-atlas__facts dd", ".hz8-atlas__related a", "#rattslage .hz8-atlas__text p", ".hz8-atlas__timeline time", ".hz8-atlas__timeline span", ".hz8-atlas__also p", ".hz8-atlas__source-list strong", ".hz8-atlas__source-list a > span", ".hz8-atlas__credit", ".hz8-lp__qa summary", ".hz8-lp__more"], h);
    await p.locator(".hz8-atlas__jump a").first().focus(); await p.keyboard.press("Tab"); await p.keyboard.press("Enter"); await p.waitForTimeout(1100);
    m.anchor = await p.evaluate(() => ({ hash: location.hash, top: Math.round(document.getElementById("rattslage").getBoundingClientRect().top) }));
    await p.locator(".hz8-lp__qa summary").first().focus(); await p.keyboard.press("Enter"); await p.waitForTimeout(350);
    m.faqOpen = await p.evaluate(() => document.querySelector(".hz8-lp__qa details").open);
    await p.keyboard.press("Enter");
  }
  await p.evaluate(() => { document.activeElement?.blur(); history.replaceState(null, "", location.pathname + location.search); window.scrollTo(0, 0); }); await p.waitForTimeout(700);
  await p.screenshot({ path: path.join(OUT, `${tag}-full.png`), fullPage: true });
  m.errors = p.errors.filter(e => !/favicon|trustpilot|Failed to load resource|recaptcha/i.test(e));
  if (w === 1440 && !mode) {
    m.linkStatus = {};
    for (const href of m.links) {
      if (href.startsWith("#")) { m.linkStatus[href] = (await p.evaluate(id => !!document.getElementById(id), href.slice(1))) ? "anchor-ok" : "anchor-missing"; continue; }
      if (/^\/sv\/page\/(thcb|thch|hhc)$/.test(href)) { m.linkStatus[href] = "planerad (fixtur)"; continue; }
      const u = href.startsWith("/") ? new URL(url(href)) : new URL(href);
      const res = await ctx.request.get(u.toString(), { maxRedirects: 0, headers: { "user-agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36" } }).catch(e => ({ status: () => String(e).slice(0, 40) }));
      m.linkStatus[href] = res.status();
    }
    const plain = (fixtureHtml[slug] || "").replace(/<!--[\s\S]*?-->/g, "").replace(/<\/?span[^>]*>/g, "").replace(/<[^>]+>/g, " ").replace(/&amp;/g, "&").replace(/\s+/g, " ");
    m.initialHtml = m.facts.map(f => ({ t: f.t, inHtml: plain.includes(f.t.slice(0, 40)) }));
  }
  results.push({ tag, slug, w, mode: mode || "", ...m }); console.log(tag, "ovf", m.overflowX, "err", m.errors.length, "h1", m.h1.length);
  await ctx.close();
}
const noJs = Object.fromEntries(["thcb", "thch", "hhc"].map(s => { const B = block(s); return [s, { h1: (B.match(/<h1/g) || []).length, h2: (B.match(/<h2/g) || []).length, h3: (B.match(/<h3/g) || []).length, links: (B.replace(/<!--[\s\S]*?-->/g, "").match(/<a /g) || []).length, faq: (B.match(/<details/g) || []).length }]; }));
if (!process.env.OUT) {
  const f = path.join(DIR, "verify.json");
  const prev = process.env.ONLY && fs.existsSync(f) ? JSON.parse(fs.readFileSync(f, "utf8")).results : [];
  const merged = ALL.map(([t]) => results.find(r => r.tag === t) || prev.find(r => r.tag === t)).filter(Boolean);
  fs.writeFileSync(f, JSON.stringify({ noJs, results: merged }, null, 1));
}
console.log("initial-html", JSON.stringify(noJs));
await b.close();
}
