// Engångsvapes (formatlandning): lokal Theme 8-build i preview-instansen.
// /sv/page/engangsvape finns inte i Nyehandel (404). FIXTUR (som THCX): en
// riktig, tom innehållssida (/sv/page/kopvillkor) hämtas och dess
// .store-page fylls med theme8/blocks/engangsvape.html i ett HTML-block,
// med föreslagen titel/meta/canonical och brödsmula. Inget skrivs till
// Nyehandel.
//
// Kör: node theme8/review/engangsvape-landing-2026-11/verify.mjs
//   ONLY=393,1440   bara dessa körningar (taggar)
//   FOLD=1          bara första vyn
// Lägen: noatmo  = atmosfärsbilderna svarar 404 (hero, stage, uppslag);
//        noprod  = Nyehandels produktbilder svarar 404;
//        zero    = källorna ger inga produkter;
//        reduced = prefers-reduced-motion: reduce.
import fs from "node:fs"; import path from "node:path";
import { chromium, ctxFor, open, ready, url } from "../launch-task-queue-2026-10/01-global-boot-footer/review/lib.mjs";
const DIR = path.dirname(new URL(import.meta.url).pathname);
const OUT = process.env.OUT || path.join(DIR, "shots"); fs.mkdirSync(OUT, { recursive: true });
const BLOCK = fs.readFileSync(path.join(DIR, "../../blocks/engangsvape.html"), "utf8");
const LOADER = fs.readFileSync(path.join(DIR, "../../blocks/loader-theme8-dev.html"), "utf8").trim();
// FÖRSLAG, inte beslutat (KARTLAGGNING.md avsnitt 2).
const TITLE = "Engångsvapes med cannabinoider – Magic Sauce, Core och CBD | Hazey";
const META = "Engångsvapes hos Hazey: Magic Sauce 3.0, Hero's Core och CBD i 1+1, 2 och 5 ml. Se vad som finns i lager och pris, med analysintyg på produktsidorna.";
const FOLD = !!process.env.FOLD;
let fixtureHtml = "";

async function fixture(ctx, mode) {
  await ctx.route(/\/sv\/page\/engangsvape(\?|$)/, async r => {
    if (r.request().resourceType() !== "document") return r.continue();
    const res = await r.fetch({ url: url("/sv/page/kopvillkor") });
    let html = await res.text();
    html = html.replace(/<!-- Theme 8 development loader[\s\S]*?<\/script>/, () => LOADER)
      .replace(/<div class="store-page">\s*<\/div>/, () => `<div class="store-page"><div class="template-components__html-editor">${BLOCK}</div></div>`)
      .replace(/<title>[^<]*<\/title>/, `<title>${TITLE}</title>`)
      .replace(/<meta name="description" content="[^"]*">/, `<meta name="description" content="${META.replace(/"/g, "&quot;")}">`)
      .replace(/(<link rel="canonical" href=")[^"]*/, "$1https://hazeyse.nyehandel.se/sv/page/engangsvape")
      .replace(/page\/kopvillkor/g, "page/engangsvape").replace(/>\s*Köpvillkor\s*</g, ">Engångsvapes<");
    fixtureHtml = html;
    return r.fulfill({ status: 200, body: html, headers: { "content-type": "text/html; charset=utf-8" } });
  });
  if (mode === "noatmo") await ctx.route(/assets\/(landing-engangsvape|landing-thcx|category-vapes-hero-2026-10)\//, r => r.fulfill({ status: 404, body: "" }));
  if (mode === "noprod") await ctx.route(/d3dnwnveix5428\.cloudfront\.net\/eyJ/, r => r.fulfill({ status: 404, body: "" }));
  if (mode === "zero") await ctx.route(/\/sv\/categories\/[a-z0-9-]+\?/, async r => {
    if (r.request().resourceType() === "document") return r.continue();
    const res = await r.fetch(); const t = (await res.text()).replace(/<div[^>]*class="product-card[\s\S]*?(?=<div[^>]*class="product-card|<\/main>)/g, "");
    return r.fulfill({ response: res, body: t });
  });
}

async function contrast(p, sels, w, h) {
  const boxes = await p.evaluate(sels => sels.map(s => { const e = document.querySelector(s); if (!e) return null; e.scrollIntoView({ block: "center", behavior: "instant" }); return s; }).filter(Boolean), sels);
  const out = [];
  for (const s of boxes) {
    await p.evaluate(s => document.querySelector(s).scrollIntoView({ block: "center", behavior: "instant" }), s); await p.waitForTimeout(250);
    const box = await p.evaluate(s => { const e = document.querySelector(s); const q = e.getBoundingClientRect(); return { r: [q.left, q.top, q.width, q.height], c: getComputedStyle(e).color }; }, s);
    if (box.r[1] < 0 || box.r[1] + box.r[3] > (w < 768 ? 852 : h)) { out.push({ s, skipped: "utanför vyn" }); continue; }
    const tag = await p.addStyleTag({ content: "#store-main#store-main .hz8-lp *{color:transparent!important;text-decoration-color:transparent!important;border-color:transparent!important;caret-color:transparent!important;transition:none!important} #store-main#store-main .hz8-lp__live-line::before{visibility:hidden!important} #store-main#store-main .hz8-lp :is(.hz8-lp__path-btn,.hz8-lp__pack,.hz8-lp__sizes a)::after,#store-main#store-main .hz8-lp :is(.hz8-lp__kicker,.hz8-lp__eyebrow)::after,#store-main#store-main .hz8-lp__sizes a::before,#store-main#store-main .hz8-lp__qa summary::after{visibility:hidden!important} #store-main#store-main :is(.hz8-lp__path-btn,.hz8-lp__pack){visibility:hidden!important}" });
    await p.waitForTimeout(250);
    const shotBuf = await p.screenshot(); const shot = shotBuf.toString("base64");
    if (process.env.DEBUGC && s === process.env.DEBUGC) { fs.writeFileSync(path.join(OUT, "debug-contrast.png"), shotBuf); console.log("DEBUGBOX", JSON.stringify(box)); }
    await p.evaluate(t => t.remove(), tag);
    out.push(await p.evaluate(async ({ shot, box, s }) => {
      const i = new Image(); i.src = "data:image/png;base64," + shot; await i.decode();
      const k = i.width / innerWidth; const c = document.createElement("canvas"); c.width = i.width; c.height = i.height; const x = c.getContext("2d"); x.drawImage(i, 0, 0);
      const lin = v => { v /= 255; return v <= .03928 ? v / 12.92 : ((v + .055) / 1.055) ** 2.4; };
      const L = (r, g, b) => .2126 * lin(r) + .7152 * lin(g) + .0722 * lin(b);
      const cc = document.createElement("canvas").getContext("2d"); cc.fillStyle = box.c; cc.fillRect(0, 0, 1, 1); const [tr, tg, tb] = cc.getImageData(0, 0, 1, 1).data; const lt = L(tr, tg, tb);
      const r = box.r; const d = x.getImageData(Math.max(0, r[0] * k), Math.max(0, r[1] * k), Math.max(1, Math.min(r[2], innerWidth - r[0]) * k), Math.max(1, r[3] * k)).data; const ls = [];
      for (let j = 0; j < d.length; j += 16) ls.push(L(d[j], d[j + 1], d[j + 2]));
      ls.sort((a, b) => a - b); const worst = ls[Math.floor(ls.length * .05)], med = ls[Math.floor(ls.length / 2)];
      const cr = lb => ((Math.max(lb, lt) + .05) / (Math.min(lb, lt) + .05)).toFixed(2);
      // Mörk text: värsta = den mörkaste bakgrunden.
      return { s, worst: +cr(worst), median: +cr(med) };
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
  const p = await open(ctx, "/sv/page/engangsvape", { before: mode === "reduced" ? pg => pg.emulateMedia({ reducedMotion: "reduce" }) : null });
  await ready(p, 4500);
  await p.evaluate(async () => { for (let y = 0; y < document.body.scrollHeight; y += 450) { window.scrollTo(0, y); await new Promise(r => setTimeout(r, 140)); } window.scrollTo(0, 0); });
  await p.waitForFunction(() => document.querySelector(".hz8-lp__rail, .hz8-lp--no-data") && [...document.querySelectorAll("[data-hz8-series]")].every(l => l.getAttribute("data-hz8-filled")), null, { timeout: 25000 }).catch(() => {});
  await p.mouse.move(2, h - 2); await p.waitForTimeout(2500);
  if (FOLD) { await p.screenshot({ path: path.join(OUT, `eng-${tag}-fold.png`) }); results.push({ tag }); await ctx.close(); continue; }
  const m = await p.evaluate(() => {
    const vis = e => !!(e && (e.offsetWidth || e.offsetHeight));
    const r = e => { if (!e) return null; const q = e.getBoundingClientRect(); return [Math.round(q.left), Math.round(q.top + scrollY), Math.round(q.width), Math.round(q.height)]; };
    const rail = [...document.querySelectorAll(".hz8-lp__rail .product-card")];
    const txt = e => e.textContent.replace(/\s+/g, " ").trim();
    // Faktatexten: synlig, i flödet, inte i stängt dragspel, verklig storlek.
    const facts = [...document.querySelectorAll(".hz8-lp__story > p:not(.hz8-lp__eyebrow), .hz8-lp__chapters p, .hz8-lp__chapters h2, .hz8-lp__story h2")].map(e => {
      const cs = getComputedStyle(e);
      return { t: txt(e).slice(0, 48), visible: vis(e) && cs.visibility === "visible" && +cs.opacity > .9 && !e.closest("details:not([open])"), px: parseFloat(cs.fontSize), color: cs.color };
    });
    return {
      lpClass: document.documentElement.classList.contains("hz8-lp-page"), scene: document.documentElement.getAttribute("data-hz8-lp-scene"),
      title: document.title, h1: [...document.querySelectorAll("h1")].filter(vis).map(txt),
      h2: [...document.querySelectorAll("#store-main h2")].filter(vis).map(txt), h3: [...document.querySelectorAll("#store-main .hz8-lp h3")].filter(vis).map(txt),
      overflowX: document.documentElement.scrollWidth - innerWidth,
      wide: [...document.querySelectorAll("#store-main *")].filter(e => { const q = e.getBoundingClientRect(); return q.width && q.right > innerWidth + 1 && !e.closest(".hz8-prail__list, .hz8-lp__paths, .hz8-lp__nav") && !e.matches(".hz8-lp__photo"); }).slice(0, 5).map(e => e.tagName + "." + [...e.classList].join(".")),
      h1Fits: (() => { const h = document.querySelector(".hz8-lp h1"); return h.scrollWidth <= h.clientWidth + 1 && h.getBoundingClientRect().right <= innerWidth; })(),
      summary: (() => { const e = document.querySelector("[data-hz8-format-summary]"); return e && !e.hidden ? txt(e) : null; })(),
      leads: [...document.querySelectorAll(".hz8-lp__path")].map(l => { const i = l.querySelector(".hz8-lp__pack"); return { title: txt(l.querySelector("h3")), hidden: l.hidden, href: l.querySelector(".hz8-lp__path-link").getAttribute("href").replace(/\?.*/, ""), kind: txt(l.querySelector(".hz8-lp__path-kind")), live: txt(l.querySelector("[data-hz8-live]")), img: i ? { loaded: i.complete && i.naturalWidth > 0, webp: /eyJ/.test(i.currentSrc) } : null, box: r(l) }; }),
      sizes: [...document.querySelectorAll("[data-hz8-size]")].map(l => ({ size: l.dataset.hz8Size, hidden: l.hidden, live: txt(l), href: l.querySelector("a").getAttribute("href").replace(/\?preview=.*/, "") })),
      series: [...document.querySelectorAll("[data-hz8-series]")].map(l => ({ name: txt(l.querySelector("a")), status: txt(l.querySelector("[data-hz8-series-live]")) || "–", href: l.querySelector("a").getAttribute("href") })),
      cards: rail.map(c => ({ name: txt(c.querySelector(".name") || c), price: txt(c.querySelector(".price") || c), href: (c.querySelector("a")?.getAttribute("href") || "").replace(/^https?:\/\/[^/]+/, "").replace(/\?.*/, ""), img: (() => { const i = c.querySelector("img"); return !!(i && i.complete && i.naturalWidth); })(), btn: !!c.querySelector("button, .hz8-card-btn, [class*=add]") })),
      railNotDisposable: rail.filter(c => /batteri|510|cartridge|\bcart\b|refill|liquid|paket|\bpack\b|kit/i.test(c.textContent)).map(c => txt(c.querySelector(".name") || c)),
      indicaSativa: [...document.querySelectorAll(".hz8-lp__rail .name, .hz8-lp__path-live")].filter(e => /indica|sativa|hybrid/i.test(e.textContent)).length,
      facts,
      faq: [...document.querySelectorAll(".hz8-lp__qa details")].map(d => ({ q: txt(d.querySelector("summary")), answerInDom: txt(d.querySelector("p")).length })),
      boxes: { h1: r(document.querySelector(".hz8-lp h1")), paths: r(document.querySelector(".hz8-lp__paths")), sizes: r(document.querySelector(".hz8-lp__sizes")), range: r(document.querySelector(".hz8-lp__range")), story: r(document.querySelector(".hz8-lp__story")), chapters: r(document.querySelector(".hz8-lp__chapters")), faq: r(document.querySelector(".hz8-lp__faq")), footer: r(document.querySelector("footer, #store-footer, .hz8-footer")) },
      heroBg: getComputedStyle(document.querySelector(".hz8-lp--format"), "::before").backgroundImage.slice(0, 70),
      text: { banned: (document.querySelector(".hz8-lp").textContent.match(/fri frakt|lagligt|lagliga|THC-fri|100 ?%|bredaste|garanterad|effekt|dosering|rus\b|njut|vibben|varje batch/gi) || []) },
      links: [...document.querySelectorAll(".hz8-lp a[href]")].map(a => a.getAttribute("href").replace(/\?preview=.*/, "")).filter((v, i, a) => a.indexOf(v) === i && !/\/products\/.*\/\d+$/.test(v)),
      fallbackShown: vis(document.querySelector(".hz8-lp__fallback")),
      noData: document.querySelector(".hz8-lp").classList.contains("hz8-lp--no-data"),
      reduced: matchMedia("(prefers-reduced-motion: reduce)").matches
    };
  });
  m.contrast = await contrast(p, [".hz8-lp h1", ".hz8-lp__lead", ".hz8-lp__live-line", ".hz8-lp__nav a", ".hz8-lp__path h3", ".hz8-lp__path-kind", ".hz8-lp__sizes-head p", ".hz8-lp__sizes [data-hz8-size-live]", ".hz8-lp__sub", ".hz8-lp__story > p:not(.hz8-lp__eyebrow)", ".hz8-lp__story > p:last-of-type", ".hz8-lp__chapters p", ".hz8-lp__series [data-hz8-series-live]", ".hz8-lp__qa summary", ".hz8-lp__more"], w, h);
  // Tangentbord: Tab från kapitelraden -> första serievägen; ankare -> rubrik; FAQ med Enter.
  await p.locator('.hz8-lp__nav a[href="#fragor"]').focus(); await p.keyboard.press("Tab");
  m.leadFocus = await p.evaluate(() => { const l = document.activeElement.closest(".hz8-lp__path"); return l ? getComputedStyle(l).outlineStyle + " " + document.activeElement.textContent.trim() : "fokus på " + document.activeElement.tagName; });
  const sz = p.locator(".hz8-lp__sizes li:not([hidden]) a").first();
  if (await sz.count()) { await sz.focus(); m.sizeFocus = await p.evaluate(() => getComputedStyle(document.activeElement).outlineStyle + " " + document.activeElement.textContent.replace(/\s+/g, " ").trim()); }
  await p.locator('.hz8-lp__nav a[href="#vad-ar-en-engangsvape"]').focus(); await p.keyboard.press("Enter"); await p.waitForTimeout(1200);
  m.anchor = await p.evaluate(() => ({ focused: document.activeElement?.textContent.trim(), top: Math.round(document.activeElement?.getBoundingClientRect().top), header: Math.round(document.getElementById("store-header")?.getBoundingClientRect().bottom || 0), hash: location.hash }));
  await p.locator(".hz8-lp__qa summary").first().focus(); await p.keyboard.press("Enter"); await p.waitForTimeout(400);
  m.faqOpen = await p.evaluate(() => document.querySelector(".hz8-lp__qa details").open);
  await p.keyboard.press("Enter"); await p.evaluate(() => { document.activeElement?.blur(); history.replaceState(null, "", location.pathname + location.search); window.scrollTo(0, 0); }); await p.waitForTimeout(900);
  await p.screenshot({ path: path.join(OUT, `eng-${tag}-fold.png`) });
  await p.screenshot({ path: path.join(OUT, `eng-${tag}-full.png`), fullPage: true });
  if (CLOSE.includes(tag)) {
    const clip = (a, z, pad = 40) => p.evaluate(({ a, z, pad }) => { const A = document.querySelector(a).getBoundingClientRect(), Z = document.querySelector(z).getBoundingClientRect(); return { x: 0, y: Math.max(0, A.top + scrollY - pad), width: innerWidth, height: Z.bottom - A.top + 2 * pad }; }, { a, z, pad });
    // Nedre halvan: från sortimentsledet till och med sidfoten.
    await p.screenshot({ path: path.join(OUT, `eng-${tag}-nedre.png`), clip: await clip(".hz8-lp__range", "#store-footer, footer", 30), fullPage: true });
    await p.screenshot({ path: path.join(OUT, `eng-${tag}-uppslag.png`), clip: await clip(".hz8-lp__story", ".hz8-lp__chapters"), fullPage: true });
    await p.screenshot({ path: path.join(OUT, `eng-${tag}-faq.png`), clip: await clip(".hz8-lp__faq", ".hz8-lp__faq", 30), fullPage: true });
    await p.screenshot({ path: path.join(OUT, `eng-${tag}-produkter.png`), clip: await clip(".hz8-lp__paths", ".hz8-lp__range", 30), fullPage: true });
  }
  m.errors = p.errors.filter(e => !/favicon|trustpilot|Failed to load resource|recaptcha/i.test(e));
  if (tag === "1440") {
    m.linkStatus = {};
    for (const href of m.links.filter(x => x.startsWith("/") || x.includes("hazeyse.nyehandel.se"))) {
      const u = new URL(href, "https://hazeyse.nyehandel.se"); u.searchParams.set("preview", "v9kzdmqz4w60l5n");
      const res = await ctx.request.get(u.toString(), { maxRedirects: 0 }).catch(e => ({ status: () => String(e).slice(0, 40) }));
      m.linkStatus[href.replace(/^https?:\/\/[^/]+/, "")] = res.status();
    }
    // Texten i initial HTML (före all JS): varje rubrik och faktastycke.
    const plain = fixtureHtml.replace(/<!--[\s\S]*?-->/g, "").replace(/<[^>]+>/g, " ").replace(/&amp;/g, "&").replace(/\s+/g, " ");
    m.initialHtml = m.facts.map(f => ({ t: f.t, inHtml: plain.includes(f.t.replace(/[…]$/, "").slice(0, 40)) }));
    m.assetBytes = Object.fromEntries(fs.readdirSync(path.join(DIR, "../../assets/landing-engangsvape")).map(f => [f, fs.statSync(path.join(DIR, "../../assets/landing-engangsvape", f)).size]));
  }
  results.push({ tag, w, mode: mode || "", ...m }); console.log(tag, JSON.stringify(m));
  await ctx.close();
}
const noJs = { h1: (BLOCK.match(/<h1/g) || []).length, h2: (BLOCK.match(/<h2/g) || []).length, h3: (BLOCK.match(/<h3/g) || []).length, links: (BLOCK.match(/<a /g) || []).length, faq: (BLOCK.match(/<details/g) || []).length };
console.log("initial-html", JSON.stringify(noJs));
if (!FOLD && !process.env.OUT) fs.writeFileSync(path.join(DIR, "verify.json"), JSON.stringify({ noJs, results }, null, 1));
await b.close();
