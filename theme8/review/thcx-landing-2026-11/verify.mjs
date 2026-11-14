// THCX-landning (Agent B): lokal Theme 8-build i preview-instansen.
// /sv/page/thcx finns inte i Nyehandel (404). FIXTUR: en riktig
// Nyehandel-innehållssida (/sv/page/kopvillkor, tom) hämtas och dess
// .store-page fylls med theme8/blocks/thcx.html i ett HTML-block, så som
// admin renderar det, med föreslagen titel/meta/canonical och brödsmula.
// Inget skrivs till Nyehandel. Kör: node theme8/review/thcx-landing-2026-11/verify.mjs
import fs from "node:fs"; import path from "node:path";
import { chromium, ctxFor, open, ready, url } from "../launch-task-queue-2026-10/01-global-boot-footer/review/lib.mjs";
const DIR = path.dirname(new URL(import.meta.url).pathname);
const OUT = path.join(DIR, "shots"); fs.mkdirSync(OUT, { recursive: true });
const BLOCK = fs.readFileSync(path.join(DIR, "../../blocks/thcx.html"), "utf8");
const LOADER = fs.readFileSync(path.join(DIR, "../../blocks/loader-theme8-dev.html"), "utf8").trim();
const TITLE = "THCX i Sverige – vapes, hasch och fakta | Hazey";
const META = "Vad är THCX? Se Hazeys THCX-sortiment med Hero's Core-vapes och hasch från High Life och El Gringo, analysintyg och svar på vanliga frågor.";

// NOIMG=1: uppslaget utan uppställning (figuren borttagen ur blocket) --
// visar mallens läge utan bild.
async function fixture(ctx, { noImg = false } = {}) {
  const block = noImg ? BLOCK.replace(/<figure class="hz8-lp__lineup"[\s\S]*?<\/figure>/, "") : BLOCK;
  await ctx.route(/\/sv\/page\/thcx(\?|$)/, async r => {
    if (r.request().resourceType() !== "document") return r.continue();
    const res = await r.fetch({ url: url("/sv/page/kopvillkor") });
    let html = await res.text();
    html = html.replace(/<!-- Theme 8 development loader[\s\S]*?<\/script>/, () => LOADER)
      .replace(/<div class="store-page">\s*<\/div>/, () => `<div class="store-page"><div class="template-components__html-editor">${block}</div></div>`)
      .replace(/<title>[^<]*<\/title>/, `<title>${TITLE}</title>`)
      .replace(/<meta name="description" content="[^"]*">/, `<meta name="description" content="${META.replace(/"/g, "&quot;")}">`)
      .replace(/(<link rel="canonical" href=")[^"]*/, "$1https://hazeyse.nyehandel.se/sv/page/thcx")
      .replace(/page\/kopvillkor/g, "page/thcx").replace(/>\s*Köpvillkor\s*</g, ">THCX<");
    return r.fulfill({ status: 200, body: html, headers: { "content-type": "text/html; charset=utf-8" } });
  });
}

const b = await chromium.launch({ channel: "chrome" }); const results = [];
const RUNS = [[393, 852], [1440, 900], [1920, 1080], [393, 852, "noimg"], [1440, 900, "noimg"]]
  .filter(([w]) => !process.env.ONLY_W || String(w) === process.env.ONLY_W);
for (const [w, h, mode] of RUNS) {
  const tag = mode ? `${w}-${mode}` : String(w);
  const ctx = await ctxFor(b, w, h); await fixture(ctx, { noImg: mode === "noimg" });
  const p = await open(ctx, "/sv/page/thcx"); await ready(p, 4500);
  await p.evaluate(async () => { for (let y = 0; y < document.body.scrollHeight; y += 500) { window.scrollTo(0, y); await new Promise(r => setTimeout(r, 120)); } window.scrollTo(0, 0); });
  await p.waitForTimeout(1500);
  const m = await p.evaluate(() => {
    const vis = e => !!(e.offsetWidth || e.offsetHeight);
    const rail = [...document.querySelectorAll(".hz8-lp__rail .product-card")];
    return {
      page: document.documentElement.getAttribute("data-hz8-page"), lpClass: document.documentElement.classList.contains("hz8-lp-page"),
      title: document.title, h1: [...document.querySelectorAll("h1")].filter(vis).map(x => x.textContent.trim()),
      h2: [...document.querySelectorAll("#store-main h2")].filter(vis).map(x => x.textContent.trim()),
      overflowX: document.documentElement.scrollWidth - innerWidth,
      wide: [...document.querySelectorAll("#store-main *")].filter(e => { const r = e.getBoundingClientRect(); return r.width && r.right > innerWidth + 1 && !e.closest(".hz8-prail__list"); }).slice(0, 5).map(e => e.tagName + "." + [...e.classList].join(".")),
      cards: rail.map(c => ({ name: c.querySelector(".name")?.textContent.trim(), brand: c.querySelector(".brand")?.textContent.trim(), price: c.querySelector(".price")?.textContent.replace(/\s+/g, " ").trim(), href: c.querySelector("a")?.getAttribute("href")?.replace(/^https?:\/\/[^/]+/, ""), soldout: c.classList.contains("hz8-is-soldout"), fit: getComputedStyle(c.querySelector(".product-card__image img")).objectFit, alt: c.querySelector("img")?.alt })),
      indicaSativa: rail.filter(c => /indica|sativa|hybrid/i.test(c.querySelector(".name")?.textContent || "")).length,
      lineup: [...document.querySelectorAll(".hz8-lp__piece")].map(a => { const i = a.querySelector("img"); const r = i.getBoundingClientRect(); return { alt: i.alt, href: a.getAttribute("href").replace(/\?.*/, ""), w: Math.round(r.width), h: Math.round(r.height), loaded: i.complete && i.naturalWidth > 0, inside: r.left >= a.closest(".hz8-lp__stage").getBoundingClientRect().left - 1 && r.right <= a.closest(".hz8-lp__stage").getBoundingClientRect().right + 1 }; }),
      storyCols: getComputedStyle(document.querySelector(".hz8-lp__story")).gridTemplateColumns, textCols: getComputedStyle(document.querySelector(".hz8-lp__text")).gridTemplateColumns,
      themeAsset: !!document.querySelector('.hz8-lp img[src*="core-family-hero"]'),
      text: { banned: (document.querySelector(".hz8-lp").textContent.match(/fri frakt|samma ämne med|är lagligt|lagligt att|efterlikna|garanterad/gi) || []) },
      railGeom: (() => { const L = document.querySelector(".hz8-lp__rail .hz8-prail__list"); if (!L) return null; const g = e => { const r = e.getBoundingClientRect(); return [Math.round(r.left), Math.round(r.width)]; }; return { list: g(L), li: g(L.querySelector("li")), card: g(L.querySelector(".product-card")), pad: getComputedStyle(L).padding, nav: g(document.querySelector(".hz8-lp__nav")), navH: Math.round(document.querySelector(".hz8-lp__nav").getBoundingClientRect().height) }; })(),
      firstCardTop: rail[0] ? Math.round(rail[0].getBoundingClientRect().top + scrollY) : null,
      links: [...document.querySelectorAll(".hz8-lp a[href]")].map(a => a.getAttribute("href")).filter((v, i, a) => a.indexOf(v) === i && !/\/products\/.*\/\d+$/.test(v)),
      railLabel: document.querySelector(".hz8-lp__rail")?.getAttribute("aria-labelledby"),
      oldContentPagesRan: !!document.querySelector(".hz8-page-head, .hz8-page-empty, .hz8-doc")
    };
  });
  // Tangentbord: ankarlänk "Analysintyg" -> rubriken får fokus och ligger under headern.
  await p.locator('.hz8-lp__nav a[href="#analysintyg"]').focus(); await p.keyboard.press("Enter"); await p.waitForTimeout(1200);
  m.anchor = await p.evaluate(() => ({ focused: document.activeElement?.textContent.trim(), top: Math.round(document.activeElement?.getBoundingClientRect().top), header: Math.round(document.getElementById("store-header")?.getBoundingClientRect().bottom || 0), hash: location.hash }));
  // FAQ: öppnas med tangentbord.
  await p.locator(".hz8-lp__qa summary").first().focus(); await p.keyboard.press("Enter"); await p.waitForTimeout(400);
  m.faqOpen = await p.evaluate(() => document.querySelector(".hz8-lp__qa details").open);
  await p.keyboard.press("Enter"); await p.evaluate(() => { document.activeElement?.blur(); window.scrollTo(0, 0); }); await p.waitForTimeout(800);
  await p.screenshot({ path: path.join(OUT, `thcx-${tag}-fold.png`) });
  await p.screenshot({ path: path.join(OUT, `thcx-${tag}-full.png`), fullPage: true });
  const story = await p.$(".hz8-lp__story"); if (story) await story.screenshot({ path: path.join(OUT, `thcx-${tag}-uppslag.png`) });
  m.errors = p.errors.filter(e => !/favicon|trustpilot|Failed to load resource|recaptcha/i.test(e));
  // Länkkontroll: varje unik intern länk på sidan svarar 200 (preview).
  if (!mode) {
    m.linkStatus = {};
    for (const href of m.links.filter(h => h.startsWith("/") || h.includes("hazeyse.nyehandel.se"))) {
      const u = new URL(href, "https://hazeyse.nyehandel.se"); u.searchParams.set("preview", "v9kzdmqz4w60l5n");
      const r = await ctx.request.get(u.toString(), { maxRedirects: 0 }).catch(e => ({ status: () => String(e).slice(0, 40) }));
      m.linkStatus[href.replace(/^https?:\/\/[^/]+/, "")] = r.status();
    }
  }
  results.push({ w, mode: mode || "", ...m }); console.log(tag, JSON.stringify(m, null, 1));
  await ctx.close();
}
// Initial HTML utan JS: rubriker, text och länkar ska finnas i blocket.
const noJs = { h1: (BLOCK.match(/<h1/g) || []).length, h2: (BLOCK.match(/<h2/g) || []).length, links: (BLOCK.match(/<a /g) || []).length, faq: (BLOCK.match(/<details/g) || []).length };
console.log("initial-html", JSON.stringify(noJs));
fs.writeFileSync(path.join(DIR, "verify.json"), JSON.stringify({ noJs, results }, null, 1));
await b.close();
