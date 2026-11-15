// THCA-kunskapssidan: lokal Theme 8-build i preview-instansen.
// /sv/page/thca har i dag en 301 till /sv/categories/thca i Nyehandel (inte
// ändrad). FIXTUR (som THCX/Engångsvapes): en riktig, tom innehållssida
// (/sv/page/kopvillkor) hämtas och dess .store-page fylls med
// theme8/blocks/thca.html, med föreslagen titel/meta/canonical och
// brödsmula. Dokumentbegäran för /sv/page/thca besvaras av fixturen, så
// omdirigeringen påverkas inte. Inget skrivs till Nyehandel.
//
// Kör: node theme8/review/thca-knowledge-2026-11/verify.mjs
//   ONLY=393,1440   bara dessa körningar
// Lägen: noatmo (temabilderna 404), noprod (produktbilderna 404),
//        zero (kategorierna ger inga produkter), reduced (reducerad rörelse).
import fs from "node:fs"; import path from "node:path";
import { chromium, ctxFor, open, ready, url } from "../launch-task-queue-2026-10/01-global-boot-footer/review/lib.mjs";
const DIR = path.dirname(new URL(import.meta.url).pathname);
const OUT = process.env.OUT || path.join(DIR, "shots"); fs.mkdirSync(OUT, { recursive: true });
const BLOCK = fs.readFileSync(path.join(DIR, "../../blocks/thca.html"), "utf8");
const LOADER = fs.readFileSync(path.join(DIR, "../../blocks/loader-theme8-dev.html"), "utf8").trim();
// FÖRSLAG, inte beslutat (KARTLAGGNING.md avsnitt 1).
const TITLE = "THCA i Sverige – vad det är, rättsläge och alternativ | Hazey";
const META = "Vad är THCA? Fakta om tetrahydrocannabinolsyra och rättsläget: delta-9-THCA-A är narkotikaklassat i Sverige sedan 14 juli 2026 (SFS 2026:1109). Se serierna i vårt aktuella sortiment.";
let fixtureHtml = "";

async function fixture(ctx, mode) {
  await ctx.route(/\/sv\/page\/thca(\?|$)/, async r => {
    if (r.request().resourceType() !== "document") return r.continue();
    const res = await r.fetch({ url: url("/sv/page/kopvillkor") });
    let html = await res.text();
    html = html.replace(/<!-- Theme 8 development loader[\s\S]*?<\/script>/, () => LOADER)
      .replace(/<div class="store-page">\s*<\/div>/, () => `<div class="store-page"><div class="template-components__html-editor">${BLOCK}</div></div>`)
      .replace(/<title>[^<]*<\/title>/, `<title>${TITLE}</title>`)
      .replace(/<meta name="description" content="[^"]*">/, `<meta name="description" content="${META.replace(/"/g, "&quot;")}">`)
      .replace(/(<link rel="canonical" href=")[^"]*/, "$1https://hazeyse.nyehandel.se/sv/page/thca")
      .replace(/page\/kopvillkor/g, "page/thca").replace(/>\s*Köpvillkor\s*</g, ">THCA<");
    fixtureHtml = html;
    return r.fulfill({ status: 200, body: html, headers: { "content-type": "text/html; charset=utf-8" } });
  });
  if (mode === "noatmo") await ctx.route(/assets\/landing-thcx\//, r => r.fulfill({ status: 404, body: "" }));
  if (mode === "noprod") await ctx.route(/d3dnwnveix5428\.cloudfront\.net\/eyJ/, r => r.fulfill({ status: 404, body: "" }));
  if (mode === "zero") await ctx.route(/\/sv\/categories\/[a-z0-9-]+\?/, async r => {
    if (r.request().resourceType() === "document") return r.continue();
    const res = await r.fetch(); const t = (await res.text()).replace(/<div[^>]*class="product-card[\s\S]*?(?=<div[^>]*class="product-card|<\/main>)/g, "").replace(/(id="products_count"[^>]*>)\s*\d+/, "$10");
    return r.fulfill({ response: res, body: t });
  });
}

async function contrast(p, sels, w, h) {
  const out = [];
  for (const s of sels) {
    const ok = await p.evaluate(s => { const e = document.querySelector(s); if (!e || !(e.offsetWidth || e.offsetHeight)) return false; e.scrollIntoView({ block: "center", behavior: "instant" }); return true; }, s);
    if (!ok) { out.push({ s, skipped: "saknas/dold" }); continue; }
    await p.waitForTimeout(250);
    const box = await p.evaluate(s => { const e = document.querySelector(s); const q = e.getBoundingClientRect(); return { r: [q.left, q.top, q.width, q.height], c: getComputedStyle(e).color }; }, s);
    if (box.r[1] < 0 || box.r[1] + box.r[3] > h) { out.push({ s, skipped: "utanför vyn" }); continue; }
    const tag = await p.addStyleTag({ content: "#store-main#store-main .hz8-lp *{color:transparent!important;text-decoration-color:transparent!important;border-color:transparent!important;caret-color:transparent!important;transition:none!important} #store-main#store-main .hz8-lp :is(.hz8-guide__path-live,.hz8-guide__leaf)::before{visibility:hidden!important} #store-main#store-main .hz8-lp :is(.hz8-guide__btn,.hz8-guide__path-btn,.hz8-guide__pack,.hz8-guide__leaf,a)::after{visibility:hidden!important} #store-main#store-main .hz8-guide__leaf{visibility:hidden!important} #store-main#store-main .hz8-lp :is(.hz8-guide__notice p,.hz8-guide__toc a){border-color:transparent!important}" });
    await p.waitForTimeout(250);
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
      // Ljus text (knappar) -> värsta = ljusaste bakgrunden; mörk text -> mörkaste.
      // Rundade knappar: hörnen utanför pillret är sidans bakgrund -> 88:e percentilen.
      const light = lt > .4; const worst = light ? ls[Math.floor(ls.length * .88)] : ls[Math.floor(ls.length * .05)];
      return { s, worst: cr(worst), median: cr(ls[Math.floor(ls.length / 2)]) };
    }, { shot, box, s }));
  }
  await p.evaluate(() => window.scrollTo(0, 0));
  return out;
}

const b = await chromium.launch({ channel: "chrome" }); const results = [];
const ALL = [["393", 393, 852], ["1440", 1440, 900], ["1920", 1920, 1080], ["320", 320, 700], ["768", 768, 1024],
  ["393-noatmo", 393, 852, "noatmo"], ["1440-noprod", 1440, 900, "noprod"], ["393-zero", 393, 852, "zero"], ["393-reduced", 393, 852, "reduced"]];
const RUNS = ALL.filter(([t]) => !process.env.ONLY || process.env.ONLY.split(",").includes(t));
const CLOSE = ["393", "1440", "1920"];
for (const [tag, w, h, mode] of RUNS) {
  const ctx = await ctxFor(b, w, h, { which: process.env.WHICH || "after" }); await fixture(ctx, mode);
  const p = await open(ctx, "/sv/page/thca", { before: mode === "reduced" ? pg => pg.emulateMedia({ reducedMotion: "reduce" }) : null });
  await ready(p, 4500);
  await p.waitForFunction(() => [...document.querySelectorAll(".hz8-guide__path")].every(l => !l.querySelector("[data-hz8-series-live]").hidden || l.classList.contains("is-out")), null, { timeout: 20000 }).catch(() => {});
  await p.waitForTimeout(1500);
  // Första skärmen exakt som den laddas (ingen scroll).
  await p.screenshot({ path: path.join(OUT, `thca-${tag}-fold.png`) });
  const fold = await p.evaluate(() => {
    const r = s => { const e = document.querySelector(s); if (!e) return null; const q = e.getBoundingClientRect(); return { top: Math.round(q.top), bottom: Math.round(q.bottom) }; };
    return { h1: r(".hz8-lp h1"), notice: r(".hz8-guide__notice"), actions: r(".hz8-guide__actions"), coast: r(".hz8-guide__coast"), what: r("#hz8-guide-what"), whatP: r(".hz8-guide__answer p"), alts: r("#hz8-guide-alts"), altsLead: r(".hz8-guide__alts-lead"), firstPath: r(".hz8-guide__path"), vh: innerHeight };
  });
  await p.evaluate(async () => { for (let y = 0; y < document.body.scrollHeight; y += 450) { window.scrollTo(0, y); await new Promise(r => setTimeout(r, 120)); } window.scrollTo(0, 0); });
  await p.waitForFunction(() => document.querySelector(".hz8-lp__rail, .hz8-lp__fallback"), null, { timeout: 20000 }).catch(() => {});
  await p.mouse.move(2, h - 2); await p.waitForTimeout(2500);
  const m = await p.evaluate(() => {
    const vis = e => !!(e && (e.offsetWidth || e.offsetHeight));
    const txt = e => e ? e.textContent.replace(/\s+/g, " ").trim() : "";
    const rail = [...document.querySelectorAll(".hz8-lp__rail .product-card")];
    const facts = [...document.querySelectorAll(".hz8-lp h2, .hz8-guide__answer p, .hz8-guide__law-text p, .hz8-guide__chapters p, .hz8-guide__notice p, .hz8-guide__alts-lead")].map(e => {
      const cs = getComputedStyle(e);
      return { t: txt(e).slice(0, 60), visible: vis(e) && cs.visibility === "visible" && +cs.opacity > .9, px: parseFloat(cs.fontSize) };
    });
    return {
      lpClass: document.documentElement.classList.contains("hz8-lp-page") && document.documentElement.classList.contains("hz8-guide-page"),
      title: document.title, h1: [...document.querySelectorAll("h1")].filter(vis).map(txt),
      h2: [...document.querySelectorAll("#store-main h2")].filter(vis).map(txt),
      overflowX: document.documentElement.scrollWidth - innerWidth,
      wide: [...document.querySelectorAll("#store-main *")].filter(e => { const q = e.getBoundingClientRect(); return q.width && q.right > innerWidth + 1 && !e.closest(".hz8-prail__list") && !e.matches(".hz8-guide__coast"); }).slice(0, 5).map(e => e.tagName + "." + [...e.classList].join(".")),
      paths: [...document.querySelectorAll(".hz8-guide__path")].map(l => { const i = l.querySelector(".hz8-guide__pack"); const sc = l.querySelector(".hz8-guide__path-scene").getBoundingClientRect(); const q = i && i.getBoundingClientRect(); return { title: txt(l.querySelector("h3")), href: l.querySelector("a").getAttribute("href"), kind: txt(l.querySelector(".hz8-guide__path-kind")), live: l.querySelector("[data-hz8-series-live]").hidden ? null : txt(l.querySelector("[data-hz8-series-live]")), out: l.classList.contains("is-out"), img: i ? { loaded: i.complete && i.naturalWidth > 0, src: (() => { try { return JSON.parse(atob(i.currentSrc.split("/").pop())).key.split("/").pop(); } catch (e) { return i.currentSrc.slice(0, 80); } })(), h: Math.round(q.height), clipped: q.top < l.getBoundingClientRect().top || q.bottom > l.getBoundingClientRect().bottom || q.right > l.getBoundingClientRect().right } : null, sceneH: Math.round(sc.height) }; }),
      rail: rail.map(c => ({ name: txt(c.querySelector(".name")), brand: txt(c.querySelector(".brand")), price: txt(c.querySelector(".price")), instock: c.getAttribute("data-hz8-instock") })),
      facts,
      legal: { notice: txt(document.querySelector(".hz8-guide__notice")), law: txt(document.querySelector(".hz8-guide__law-text")), sfsLinks: document.querySelectorAll('.hz8-lp a[href*="SFS2026-1109.pdf"]').length },
      articles: [...document.querySelectorAll(".hz8-guide__articles a")].map(a => { const q = a.getBoundingClientRect(); return { href: a.getAttribute("href"), title: txt(a.querySelector("strong")), x: Math.round(q.left), y: Math.round(q.top + scrollY), w: Math.round(q.width), h: Math.round(q.height) }; }),
      faq: [...document.querySelectorAll(".hz8-lp__qa details")].map(d => ({ q: txt(d.querySelector("summary")), a: txt(d.querySelector("p")).length })),
      banned: (document.querySelector(".hz8-lp").textContent.match(/psykoaktiv|rus\b|medicin|effekt|lagliga alternativ|lagliga i sverige|100 ?%|garanter|50000|fri frakt|världsklass/gi) || []),
      links: [...document.querySelectorAll(".hz8-lp a[href]")].map(a => a.getAttribute("href").replace(/\?preview=.*/, "")).filter((v, i, a) => a.indexOf(v) === i && !/\/products\/.*\/\d+$/.test(v)),
      fallbackShown: vis(document.querySelector(".hz8-lp__fallback")),
      reduced: matchMedia("(prefers-reduced-motion: reduce)").matches
    };
  });
  m.fold = fold;
  m.contrast = await contrast(p, [".hz8-lp h1", ".hz8-guide__tagline", ".hz8-guide__notice p", ".hz8-guide__source a", ".hz8-guide__btn", ".hz8-guide__btn--quiet", ".hz8-guide__toc a", ".hz8-guide__answer p", ".hz8-guide__law-date", ".hz8-guide__law-facts dd", ".hz8-guide__alts-lead", ".hz8-guide__path h3", ".hz8-guide__path-kind", ".hz8-guide__path-live", ".hz8-guide__path-btn", ".hz8-guide__law-text p", ".hz8-guide__sources span", ".hz8-guide__chapters p", ".hz8-lp__sub", ".hz8-guide__articles span", ".hz8-lp__qa summary", ".hz8-lp__more"], w, h);
  // Tangentbord: notisens källa -> knappar; ankare -> rubrik; serieväg i fokus; FAQ med Enter.
  await p.locator(".hz8-guide__source a").focus(); await p.keyboard.press("Tab");
  m.btnFocus = await p.evaluate(() => getComputedStyle(document.activeElement).outlineStyle + " " + document.activeElement.textContent.trim());
  await p.keyboard.press("Enter"); await p.waitForTimeout(1200);
  m.anchor = await p.evaluate(() => ({ hash: location.hash, top: Math.round(document.getElementById("vad-ar-thca").getBoundingClientRect().top), header: Math.round(document.getElementById("store-header")?.getBoundingClientRect().bottom || 0) }));
  await p.locator(".hz8-guide__path-link").first().focus();
  m.pathFocus = await p.evaluate(() => getComputedStyle(document.activeElement.closest(".hz8-guide__path")).outlineStyle + " " + document.activeElement.textContent.trim());
  await p.locator(".hz8-lp__qa summary").first().focus(); await p.keyboard.press("Enter"); await p.waitForTimeout(400);
  m.faqOpen = await p.evaluate(() => document.querySelector(".hz8-lp__qa details").open);
  await p.keyboard.press("Enter"); await p.evaluate(() => { document.activeElement?.blur(); history.replaceState(null, "", location.pathname + location.search); window.scrollTo(0, 0); }); await p.waitForTimeout(900);
  await p.screenshot({ path: path.join(OUT, `thca-${tag}-full.png`), fullPage: true });
  if (CLOSE.includes(tag)) {
    const clip = (a, z, pad = 30) => p.evaluate(({ a, z, pad }) => { const A = document.querySelector(a).getBoundingClientRect(), Z = document.querySelector(z).getBoundingClientRect(); return { x: 0, y: Math.max(0, A.top + scrollY - pad), width: innerWidth, height: Z.bottom - A.top + 2 * pad }; }, { a, z, pad });
    await p.screenshot({ path: path.join(OUT, `thca-${tag}-alternativ.png`), clip: await clip(".hz8-guide__alts", ".hz8-guide__alts"), fullPage: true });
    await p.screenshot({ path: path.join(OUT, `thca-${tag}-rattslage.png`), clip: await clip(".hz8-guide__law", ".hz8-guide__chapters"), fullPage: true });
    await p.screenshot({ path: path.join(OUT, `thca-${tag}-nedre.png`), clip: await clip(".hz8-guide__stock", "#store-footer, footer"), fullPage: true });
    await p.screenshot({ path: path.join(OUT, `thca-${tag}-artiklar.png`), clip: await clip(".hz8-guide__reading", ".hz8-guide__reading", 40), fullPage: true });
  }
  m.errors = p.errors.filter(e => !/favicon|trustpilot|Failed to load resource|recaptcha/i.test(e));
  if (tag === "1440") {
    m.linkStatus = {};
    for (const href of m.links) {
      if (href.startsWith("#")) { m.linkStatus[href] = (await p.evaluate(id => !!document.getElementById(id), href.slice(1))) ? "anchor-ok" : "anchor-missing"; continue; }
      const u = href.startsWith("/") ? new URL(url(href)) : new URL(href);
      const res = await ctx.request.get(u.toString(), { maxRedirects: 0 }).catch(e => ({ status: () => String(e).slice(0, 40) }));
      m.linkStatus[href] = res.status();
    }
    const plain = fixtureHtml.replace(/<!--[\s\S]*?-->/g, "").replace(/<[^>]+>/g, " ").replace(/&amp;/g, "&").replace(/\s+/g, " ");
    m.initialHtml = m.facts.map(f => ({ t: f.t, inHtml: plain.includes(f.t.slice(0, 40)) }));
  }
  results.push({ tag, w, mode: mode || "", ...m }); console.log(tag, JSON.stringify(m).slice(0, 4000));
  await ctx.close();
}
const noJs = { h1: (BLOCK.match(/<h1/g) || []).length, h2: (BLOCK.match(/<h2/g) || []).length, h3: (BLOCK.match(/<h3/g) || []).length, links: (BLOCK.match(/<a /g) || []).length, faq: (BLOCK.match(/<details/g) || []).length };
console.log("initial-html", JSON.stringify(noJs));
if (!process.env.OUT) fs.writeFileSync(path.join(DIR, "verify.json"), JSON.stringify({ noJs, results }, null, 1));
await b.close();
