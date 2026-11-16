// THCB-kunskapssidan (fältatlas): lokal Theme 8-build i preview-instansen.
// /sv/page/thcb har i dag en 301 till /sv/categories/thcb i Nyehandel (inte
// ändrad). FIXTUR (som THCA): en riktig, tom innehållssida (/sv/page/kopvillkor)
// hämtas och dess .store-page fylls med theme8/blocks/thcb.html, med föreslagen
// titel/meta/canonical och brödsmula. Dokumentbegäran för /sv/page/thcb besvaras
// av fixturen, så omdirigeringen påverkas inte. Inget skrivs till Nyehandel.
//
// Kör: node theme8/review/thcb-knowledge-2026-11/verify.mjs
//   ONLY=393,1440   bara dessa körningar
// Lägen: noatmo (fotot 404), zero (kategorin ger inga produkter/räknare),
//        reduced (reducerad rörelse), nojs (Theme 8-JS laddas inte).
import fs from "node:fs"; import path from "node:path";
import { chromium, ctxFor, open, ready, url } from "../launch-task-queue-2026-10/01-global-boot-footer/review/lib.mjs";
const DIR = path.dirname(new URL(import.meta.url).pathname);
const OUT = process.env.OUT || path.join(DIR, "shots"); fs.mkdirSync(OUT, { recursive: true });
const BLOCK = fs.readFileSync(path.join(DIR, "../../blocks/thcb.html"), "utf8");
const LOADER = fs.readFileSync(path.join(DIR, "../../blocks/loader-theme8-dev.html"), "utf8").trim();
// FÖRSLAG, inte beslutat (KARTLAGGNING.md avsnitt 1).
export const TITLE = "THCB (THC-B) i Sverige – fakta, rättsläge och källor | Hazey";
export const META = "Vad är THCB, eller THC-B? Fakta om tetrahydrocannabutol, rättsläget i Sverige med daterade primärkällor, THCB hos Hazey och vanliga frågor.";
let fixtureHtml = "";

export async function fixture(ctx, mode) {
  await ctx.route(/\/sv\/page\/thcb(\?|$)/, async r => {
    if (r.request().resourceType() !== "document") return r.continue();
    const res = await r.fetch({ url: url("/sv/page/kopvillkor") });
    let html = await res.text();
    html = html.replace(/<!-- Theme 8 development loader[\s\S]*?<\/script>/, () => LOADER)
      .replace(/<div class="store-page">\s*<\/div>/, () => `<div class="store-page"><div class="template-components__html-editor">${BLOCK}</div></div>`)
      .replace(/<title>[^<]*<\/title>/, `<title>${TITLE}</title>`)
      .replace(/<meta name="description" content="[^"]*">/, `<meta name="description" content="${META.replace(/"/g, "&quot;")}">`)
      .replace(/(<link rel="canonical" href=")[^"]*/, "$1https://hazeyse.nyehandel.se/sv/page/thcb")
      .replace(/page\/kopvillkor/g, "page/thcb").replace(/>\s*Köpvillkor\s*</g, ">THCB<");
    fixtureHtml = html;
    return r.fulfill({ status: 200, body: html, headers: { "content-type": "text/html; charset=utf-8" } });
  });
  if (mode === "noatmo") await ctx.route(/assets\/knowledge-thcb\//, r => r.fulfill({ status: 404, body: "" }));
  if (mode === "nojs") await ctx.route(/hazey-theme8\.min\.js/, r => r.fulfill({ status: 404, body: "" }));
  if (mode === "zero") await ctx.route(/\/sv\/categories\/thcb/, async r => {
    if (r.request().resourceType() === "document") return r.continue();
    const res = await r.fetch(); const t = (await res.text()).replace(/id="products_count"/g, 'id="x-products-count"');
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
    const tag = await p.addStyleTag({ content: "#store-main#store-main .hz8-lp *{color:transparent!important;text-decoration-color:transparent!important;border-color:transparent!important;caret-color:transparent!important;transition:none!important} #store-main#store-main .hz8-lp :is(a,li,div,p,span,.hz8-lp__eyebrow,.hz8-atlas__kicker)::after,#store-main#store-main .hz8-lp :is(a,li,p,span)::before{visibility:hidden!important}" });
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
      const light = lt > .4; const worst = light ? ls[Math.floor(ls.length * .88)] : ls[Math.floor(ls.length * .05)];
      return { s, worst: cr(worst), median: cr(ls[Math.floor(ls.length / 2)]) };
    }, { shot, box, s }));
  }
  await p.evaluate(() => window.scrollTo(0, 0));
  return out;
}

if (process.argv[1] === new URL(import.meta.url).pathname) {
const b = await chromium.launch({ channel: "chrome" }); const results = [];
const ALL = [["393", 393, 852], ["1440", 1440, 900], ["1920", 1920, 1080], ["320", 320, 700], ["768", 768, 1024],
  ["393-noatmo", 393, 852, "noatmo"], ["1440-zero", 1440, 900, "zero"], ["393-reduced", 393, 852, "reduced"], ["393-nojs", 393, 852, "nojs"]];
const RUNS = ALL.filter(([t]) => !process.env.ONLY || process.env.ONLY.split(",").includes(t));
for (const [tag, w, h, mode] of RUNS) {
  const ctx = await ctxFor(b, w, h, { which: process.env.WHICH || "after" }); await fixture(ctx, mode);
  const p = await open(ctx, "/sv/page/thcb", { before: mode === "reduced" ? pg => pg.emulateMedia({ reducedMotion: "reduce" }) : null });
  if (mode === "nojs") await p.waitForTimeout(4000); else await ready(p, 4500);
  await p.waitForFunction(() => { const s = document.querySelector("[data-hz8-atlas-stock]"); return s && s.getAttribute("data-hz8-filled") && !s.hidden; }, null, { timeout: 15000 }).catch(() => {});
  await p.waitForTimeout(1200);
  await p.screenshot({ path: path.join(OUT, `thcb-${tag}-fold.png`) });
  const fold = await p.evaluate(() => {
    const r = s => { const e = document.querySelector(s); if (!e) return null; const q = e.getBoundingClientRect(); return { top: Math.round(q.top), bottom: Math.round(q.bottom), left: Math.round(q.left), right: Math.round(q.right) }; };
    return { header: r("#store-header"), h1: r(".hz8-lp h1"), tagline: r(".hz8-atlas__tagline"), lead: r(".hz8-atlas__lead"), jump: r(".hz8-atlas__jump"), photo: r(".hz8-atlas__photo"), index: r(".hz8-atlas__chapters"), ch1: r(".hz8-atlas__chapters a"), aside: r(".hz8-atlas__aside"), vh: innerHeight };
  });
  await p.evaluate(async () => { for (let y = 0; y < document.body.scrollHeight; y += 450) { window.scrollTo(0, y); await new Promise(r => setTimeout(r, 100)); } window.scrollTo(0, 0); });
  await p.mouse.move(2, h - 2); await p.waitForTimeout(1500);
  const m = await p.evaluate(() => {
    const vis = e => !!(e && (e.offsetWidth || e.offsetHeight));
    const txt = e => e ? e.textContent.replace(/\s+/g, " ").trim() : "";
    const facts = [...document.querySelectorAll(".hz8-lp h2, .hz8-atlas__lead, .hz8-atlas__text p, .hz8-atlas__facts dd, .hz8-atlas__timeline span, .hz8-atlas__source-list strong, .hz8-lp__qa details > p")].filter(e => !e.hasAttribute("data-hz8-atlas-stock")).map(e => {
      const cs = getComputedStyle(e);
      return { t: txt(e).slice(0, 60), visible: e.closest("details") ? true : vis(e) && cs.visibility === "visible" && +cs.opacity > .9, px: parseFloat(cs.fontSize) };
    });
    const photo = document.querySelector(".hz8-atlas__photo");
    return {
      classes: ["hz8-lp-page", "hz8-atlas-page"].filter(c => document.documentElement.classList.contains(c)),
      title: document.title, meta: document.querySelector('meta[name="description"]')?.content, canonical: document.querySelector('link[rel="canonical"]')?.href,
      h1: [...document.querySelectorAll("h1")].filter(vis).map(txt),
      h2: [...document.querySelectorAll("#store-main h2")].filter(vis).map(txt),
      h3: [...document.querySelectorAll("#store-main .hz8-lp h3")].filter(vis).map(txt),
      overflowX: document.documentElement.scrollWidth - innerWidth,
      wide: [...document.querySelectorAll("#store-main *")].filter(e => { const q = e.getBoundingClientRect(); return q.width && q.right > innerWidth + 1 && !e.matches(".hz8-atlas__photo, .hz8-atlas__law"); }).slice(0, 5).map(e => e.tagName + "." + [...e.classList].join(".")),
      photoBg: photo ? getComputedStyle(photo).backgroundImage.includes("umbel-stone") : null,
      photoImg: performance.getEntriesByType("resource").filter(e => /umbel-stone/.test(e.name)).map(e => ({ status: e.responseStatus, size: e.transferSize })),
      stock: (() => { const s = document.querySelector("[data-hz8-atlas-stock]"); return s ? { hidden: s.hidden, text: txt(s), out: s.classList.contains("is-out") } : null; })(),
      buyButtons: [...document.querySelectorAll(".hz8-lp a, .hz8-lp button")].filter(a => /köp|lägg i varukorg|handla/i.test(a.textContent)).map(txt),
      facts,
      faq: [...document.querySelectorAll(".hz8-lp__qa details")].map(d => ({ q: txt(d.querySelector("summary")), a: txt(d.querySelector("p")).length })),
      banned: (document.querySelector(".hz8-lp").textContent.match(/psykoaktiv|\brus\b|berus|medicin|effekt|upplevelse|lagliga alternativ|är lagligt|är olagligt|100 ?%|garanter|fri frakt|dos/gi) || []),
      links: [...document.querySelectorAll(".hz8-lp a[href]")].map(a => a.getAttribute("href").replace(/\?preview=.*/, "")).filter((v, i, a) => a.indexOf(v) === i),
      footer: vis(document.querySelector("#store-footer, footer")),
      reduced: matchMedia("(prefers-reduced-motion: reduce)").matches
    };
  });
  m.fold = fold;
  if (mode !== "nojs") {
    m.contrast = await contrast(p, [".hz8-lp h1", ".hz8-lp__eyebrow", ".hz8-atlas__tagline", ".hz8-atlas__lead", ".hz8-atlas__jump a", ".hz8-atlas__no", ".hz8-atlas__chapters strong", ".hz8-atlas__chapters a > span:last-child", ".hz8-atlas__chip", ".hz8-atlas__status > span:last-child", ".hz8-atlas__related a", ".hz8-atlas__kicker", "#rattslage .hz8-atlas__text p", ".hz8-atlas__facts dd", ".hz8-atlas__timeline time", ".hz8-atlas__timeline span", ".hz8-atlas__stock", ".hz8-atlas__also p", ".hz8-atlas__source-list strong", ".hz8-atlas__source-list a > span", ".hz8-lp__qa summary", ".hz8-lp__more", ".hz8-atlas__credit"], w, h);
    // Tangentbord: tabba från ingressens sista länk bakåt -> fokusring; ankare -> rubrik under headern; FAQ med Enter.
    await p.locator(".hz8-atlas__jump a").first().focus();
    m.jumpFocus = await p.evaluate(() => getComputedStyle(document.activeElement).outlineStyle + " " + document.activeElement.textContent.trim());
    await p.keyboard.press("Tab"); await p.keyboard.press("Enter"); await p.waitForTimeout(1200);
    m.anchor = await p.evaluate(() => ({ hash: location.hash, top: Math.round(document.getElementById("rattslage").getBoundingClientRect().top), header: Math.round(document.getElementById("store-header")?.getBoundingClientRect().bottom || 0) }));
    await p.locator(".hz8-lp__qa summary").first().focus(); await p.keyboard.press("Enter"); await p.waitForTimeout(400);
    m.faqOpen = await p.evaluate(() => document.querySelector(".hz8-lp__qa details").open);
    await p.keyboard.press("Enter");
  }
  await p.evaluate(() => { document.activeElement?.blur(); history.replaceState(null, "", location.pathname + location.search); window.scrollTo(0, 0); }); await p.waitForTimeout(900);
  await p.screenshot({ path: path.join(OUT, `thcb-${tag}-full.png`), fullPage: true });
  m.errors = p.errors.filter(e => !/favicon|trustpilot|Failed to load resource|recaptcha/i.test(e));
  if (tag === "1440") {
    m.linkStatus = {};
    for (const href of m.links) {
      if (href.startsWith("#")) { m.linkStatus[href] = (await p.evaluate(id => !!document.getElementById(id), href.slice(1))) ? "anchor-ok" : "anchor-missing"; continue; }
      const u = href.startsWith("/") ? new URL(url(href)) : new URL(href);
      const res = await ctx.request.get(u.toString(), { maxRedirects: 0, headers: { "user-agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36" } }).catch(e => ({ status: () => String(e).slice(0, 40) }));
      m.linkStatus[href] = res.status();
    }
    const plain = fixtureHtml.replace(/<!--[\s\S]*?-->/g, "").replace(/<\/?span[^>]*>/g, "").replace(/<[^>]+>/g, " ").replace(/&amp;/g, "&").replace(/\s+/g, " ");
    m.initialHtml = m.facts.map(f => ({ t: f.t, inHtml: plain.includes(f.t.slice(0, 40)) }));
  }
  results.push({ tag, w, mode: mode || "", ...m }); console.log(tag, JSON.stringify(m).slice(0, 3000));
  await ctx.close();
}
const noJs = { h1: (BLOCK.match(/<h1/g) || []).length, h2: (BLOCK.match(/<h2/g) || []).length, h3: (BLOCK.match(/<h3/g) || []).length, links: (BLOCK.replace(/<!--[\s\S]*?-->/g, "").match(/<a /g) || []).length, faq: (BLOCK.match(/<details/g) || []).length };
console.log("initial-html", JSON.stringify(noJs));
// ONLY=... slår ihop med tidigare körningar (samma tagg ersätts).
if (!process.env.OUT) {
  const f = path.join(DIR, "verify.json");
  const prev = process.env.ONLY && fs.existsSync(f) ? JSON.parse(fs.readFileSync(f, "utf8")).results : [];
  const merged = ALL.map(([t]) => results.find(r => r.tag === t) || prev.find(r => r.tag === t)).filter(Boolean);
  fs.writeFileSync(f, JSON.stringify({ noJs, results: merged }, null, 1));
}
await b.close();
}
