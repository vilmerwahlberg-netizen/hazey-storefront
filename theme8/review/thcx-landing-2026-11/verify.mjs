// THCX-landning, visuell ombyggnad (koncept B): lokal Theme 8-build i
// preview-instansen. /sv/page/thcx finns inte i Nyehandel (404). FIXTUR: en
// riktig Nyehandel-innehållssida (/sv/page/kopvillkor, tom) hämtas och dess
// .store-page fylls med theme8/blocks/thcx.html i ett HTML-block, så som
// admin renderar det, med föreslagen titel/meta/canonical och brödsmula.
// Inget skrivs till Nyehandel.
//
// Kör: node theme8/review/thcx-landing-2026-11/verify.mjs
//   ONLY=393,1440      bara dessa körningar (taggar)
//   FOLD=1             bara första vyn (snabb designloop)
// Lägen: noatmo = atmosfärsbilderna (landing-thcx/) svarar 404;
//        noprod = Nyehandels produktbilder svarar 404;
//        zero   = källorna ger inga produkter (tomma kategorisidor).
import fs from "node:fs"; import path from "node:path";
import { chromium, ctxFor, open, ready, url } from "../launch-task-queue-2026-10/01-global-boot-footer/review/lib.mjs";
const DIR = path.dirname(new URL(import.meta.url).pathname);
const OUT = path.join(DIR, "shots"); fs.mkdirSync(OUT, { recursive: true });
const BLOCK = fs.readFileSync(path.join(DIR, "../../blocks/thcx.html"), "utf8");
const LOADER = fs.readFileSync(path.join(DIR, "../../blocks/loader-theme8-dev.html"), "utf8").trim();
const TITLE = "THCX i Sverige – vapes, hasch och fakta | Hazey";
const META = "Vad är THCX? Se Hazeys THCX-sortiment med Hero's Core-vapes och hasch från High Life och El Gringo, analysintyg och svar på vanliga frågor.";
const FOLD = !!process.env.FOLD;

async function fixture(ctx, mode) {
  await ctx.route(/\/sv\/page\/thcx(\?|$)/, async r => {
    if (r.request().resourceType() !== "document") return r.continue();
    const res = await r.fetch({ url: url("/sv/page/kopvillkor") });
    let html = await res.text();
    html = html.replace(/<!-- Theme 8 development loader[\s\S]*?<\/script>/, () => LOADER)
      .replace(/<div class="store-page">\s*<\/div>/, () => `<div class="store-page"><div class="template-components__html-editor">${BLOCK}</div></div>`)
      .replace(/<title>[^<]*<\/title>/, `<title>${TITLE}</title>`)
      .replace(/<meta name="description" content="[^"]*">/, `<meta name="description" content="${META.replace(/"/g, "&quot;")}">`)
      .replace(/(<link rel="canonical" href=")[^"]*/, "$1https://hazeyse.nyehandel.se/sv/page/thcx")
      .replace(/page\/kopvillkor/g, "page/thcx").replace(/>\s*Köpvillkor\s*</g, ">THCX<");
    return r.fulfill({ status: 200, body: html, headers: { "content-type": "text/html; charset=utf-8" } });
  });
  if (mode === "noatmo") await ctx.route(/assets\/landing-thcx\//, r => r.fulfill({ status: 404, body: "" }));
  if (mode === "noprod") await ctx.route(/d3dnwnveix5428\.cloudfront\.net\/eyJ/, r => r.fulfill({ status: 404, body: "" }));
  if (mode === "zero") await ctx.route(/\/sv\/categories\/(hero-vapes|thcx)\?/, async r => {
    if (r.request().resourceType() === "document") return r.continue();
    const res = await r.fetch(); const t = (await res.text()).replace(/<div[^>]*class="product-card[\s\S]*?(?=<div[^>]*class="product-card|<\/main>)/g, "");
    return r.fulfill({ response: res, body: t });
  });
}

const b = await chromium.launch({ channel: "chrome" }); const results = [];
const ALL = [["320", 320, 700], ["393", 393, 852], ["430", 430, 932], ["768", 768, 1024], ["1440", 1440, 900], ["1920", 1920, 1080],
  ["393-noatmo", 393, 852, "noatmo"], ["1440-noatmo", 1440, 900, "noatmo"], ["1440-noprod", 1440, 900, "noprod"], ["393-zero", 393, 852, "zero"]];
const RUNS = ALL.filter(([t]) => !process.env.ONLY || process.env.ONLY.split(",").includes(t));
for (const [tag, w, h, mode] of RUNS) {
  const ctx = await ctxFor(b, w, h); await fixture(ctx, mode);
  const p = await open(ctx, "/sv/page/thcx"); await ready(p, 4500);
  await p.evaluate(async () => { for (let y = 0; y < document.body.scrollHeight; y += 500) { window.scrollTo(0, y); await new Promise(r => setTimeout(r, 110)); } window.scrollTo(0, 0); });
  await p.mouse.move(2, h - 2); await p.waitForTimeout(1500);
  if (FOLD) { await p.screenshot({ path: path.join(OUT, `thcx-${tag}-fold.png`) }); results.push({ tag }); await ctx.close(); continue; }
  const m = await p.evaluate(() => {
    const vis = e => !!(e.offsetWidth || e.offsetHeight);
    const rail = [...document.querySelectorAll(".hz8-lp__rail .product-card")];
    const r = e => { if (!e) return null; const q = e.getBoundingClientRect(); return [Math.round(q.left), Math.round(q.top + scrollY), Math.round(q.width), Math.round(q.height)]; };
    return {
      lpClass: document.documentElement.classList.contains("hz8-lp-page"),
      title: document.title, h1: [...document.querySelectorAll("h1")].filter(vis).map(x => x.textContent.trim()),
      h2: [...document.querySelectorAll("#store-main h2")].filter(vis).map(x => x.textContent.trim()),
      overflowX: document.documentElement.scrollWidth - innerWidth,
      wide: [...document.querySelectorAll("#store-main *")].filter(e => { const q = e.getBoundingClientRect(); return q.width && q.right > innerWidth + 1 && !e.closest(".hz8-prail__list, .hz8-lp__paths, .hz8-lp__nav") && !e.matches(".hz8-lp__photo"); }).slice(0, 5).map(e => e.tagName + "." + [...e.classList].join(".")),
      leads: [...document.querySelectorAll(".hz8-lp__path")].map(l => { const i = l.querySelector(".hz8-lp__pack"); return { title: l.querySelector("h3").textContent.trim(), hidden: l.hidden, href: l.querySelector(".hz8-lp__path-link").getAttribute("href").replace(/\?.*/, ""), live: l.querySelector("[data-hz8-live]").textContent.replace(/\s+/g, " ").trim(), img: i ? { loaded: i.complete && i.naturalWidth > 0, nat: [i.naturalWidth, i.naturalHeight], box: r(i), webp: /eyJ/.test(i.currentSrc) } : null, box: r(l) }; }),
      cards: rail.map(c => ({ name: c.querySelector(".name")?.textContent.trim(), price: c.querySelector(".price")?.textContent.replace(/\s+/g, " ").trim(), href: c.querySelector("a")?.getAttribute("href")?.replace(/^https?:\/\/[^/]+/, "").replace(/\?.*/, ""), fit: getComputedStyle(c.querySelector(".product-card__image img")).objectFit })),
      indicaSativa: [...document.querySelectorAll(".hz8-lp__rail .name, .hz8-lp__path-live")].filter(e => /indica|sativa|hybrid/i.test(e.textContent)).length,
      boxes: { h1: r(document.querySelector(".hz8-lp h1")), leads: r(document.querySelector(".hz8-lp__paths")), range: r(document.querySelector(".hz8-lp__range")), story: r(document.querySelector(".hz8-lp__story")), photo: r(document.querySelector(".hz8-lp__photo")), faq: r(document.querySelector(".hz8-lp__faq")) },
      bodyBg: getComputedStyle(document.body).backgroundImage.slice(0, 60),
      text: { banned: (document.querySelector(".hz8-lp").textContent.match(/fri frakt|samma ämne med|är lagligt|lagligt att|efterlikna|garanterad|smidigt/gi) || []) },
      links: [...document.querySelectorAll(".hz8-lp a[href]")].map(a => a.getAttribute("href").replace(/\?preview=.*/, "")).filter((v, i, a) => a.indexOf(v) === i && !/\/products\/.*\/\d+$/.test(v)),
      railLabel: document.querySelector(".hz8-lp__rail")?.getAttribute("aria-labelledby"),
      fallbackShown: !!document.querySelector(".hz8-lp__fallback"),
      oldContentPagesRan: !!document.querySelector(".hz8-page-head, .hz8-page-empty, .hz8-doc")
    };
  });
  // Tangentbord: Tab genom första produktvägen -> fokusram synlig; ankare -> rubrik får fokus.
  await p.locator('.hz8-lp__nav a[href="#fragor"]').focus(); await p.keyboard.press("Tab");
  m.leadFocus = await p.evaluate(() => { const l = document.activeElement.closest(".hz8-lp__path"); return l ? getComputedStyle(l).outlineStyle + " " + document.activeElement.textContent.trim() : "fokus på " + document.activeElement.tagName; });
  await p.locator('.hz8-lp__nav a[href="#analysintyg"]').focus(); await p.keyboard.press("Enter"); await p.waitForTimeout(1200);
  m.anchor = await p.evaluate(() => ({ focused: document.activeElement?.textContent.trim(), top: Math.round(document.activeElement?.getBoundingClientRect().top), header: Math.round(document.getElementById("store-header")?.getBoundingClientRect().bottom || 0), hash: location.hash }));
  await p.locator(".hz8-lp__qa summary").first().focus(); await p.keyboard.press("Enter"); await p.waitForTimeout(400);
  m.faqOpen = await p.evaluate(() => document.querySelector(".hz8-lp__qa details").open);
  await p.keyboard.press("Enter"); await p.evaluate(() => { document.activeElement?.blur(); history.replaceState(null, "", location.pathname + location.search); window.scrollTo(0, 0); }); await p.waitForTimeout(800);
  await p.screenshot({ path: path.join(OUT, `thcx-${tag}-fold.png`) });
  await p.screenshot({ path: path.join(OUT, `thcx-${tag}-full.png`), fullPage: true });
  if (!mode) {
    const lp = await p.$(".hz8-lp__paths"); if (lp) await lp.screenshot({ path: path.join(OUT, `thcx-${tag}-stage.png`) });
    const st = await p.$(".hz8-lp__story"); if (st) { await st.scrollIntoViewIfNeeded(); await p.waitForTimeout(300); await p.screenshot({ path: path.join(OUT, `thcx-${tag}-uppslag.png`), clip: await p.evaluate(() => { const q = document.querySelector(".hz8-lp__story").getBoundingClientRect(); return { x: 0, y: Math.max(0, q.top + scrollY - 40), width: innerWidth, height: Math.min(q.height + 80, 1400) }; }), fullPage: true }); }
  }
  m.errors = p.errors.filter(e => !/favicon|trustpilot|Failed to load resource|recaptcha/i.test(e));
  if (tag === "1440") {
    m.linkStatus = {};
    for (const href of m.links.filter(x => x.startsWith("/") || x.includes("hazeyse.nyehandel.se"))) {
      const u = new URL(href, "https://hazeyse.nyehandel.se"); u.searchParams.set("preview", "v9kzdmqz4w60l5n");
      const res = await ctx.request.get(u.toString(), { maxRedirects: 0 }).catch(e => ({ status: () => String(e).slice(0, 40) }));
      m.linkStatus[href.replace(/^https?:\/\/[^/]+/, "")] = res.status();
    }
    m.assetBytes = Object.fromEntries(fs.readdirSync(path.join(DIR, "../../assets/landing-thcx")).map(f => [f, fs.statSync(path.join(DIR, "../../assets/landing-thcx", f)).size]));
  }
  results.push({ tag, w, mode: mode || "", ...m }); console.log(tag, JSON.stringify(m, null, 1));
  await ctx.close();
}
const noJs = { h1: (BLOCK.match(/<h1/g) || []).length, h2: (BLOCK.match(/<h2/g) || []).length, h3: (BLOCK.match(/<h3/g) || []).length, links: (BLOCK.match(/<a /g) || []).length, faq: (BLOCK.match(/<details/g) || []).length };
console.log("initial-html", JSON.stringify(noJs));
if (!FOLD) fs.writeFileSync(path.join(DIR, "verify.json"), JSON.stringify({ noJs, results }, null, 1));
await b.close();
