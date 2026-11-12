// TASK 17 verifiering: Theme 8 (lokal build) i preview-instansen, 393 + 1440.
// /sv/posts är tom i Nyehandel -> (1) riktig tom sida, (2) FIXTUR: indexet och
// en artikelsida fylls med riktiga WP-artiklar ur importpaketet i en
// ANTAGEN Nyehandel-kortmarkup (bloggen har inga inlägg att mäta mot).
// (3) en riktig produktsida med %%sep%% i titeln. Inget skrivs till Nyehandel.
import fs from "node:fs"; import path from "node:path";
import { chromium, ctxFor, open, ready, url } from "../launch-task-queue-2026-10/01-global-boot-footer/review/lib.mjs";
const DIR = path.dirname(new URL(import.meta.url).pathname);
const OUT = path.join(DIR, "runs"); fs.mkdirSync(OUT, { recursive: true });
const inv = JSON.parse(fs.readFileSync(path.join(DIR, "data/wp-inventory.json"))).sort((a, b) => b.date.localeCompare(a.date));
const FIX = inv.slice(0, 14);
const ART = FIX[0];
const body = fs.readFileSync(path.join(DIR, "data/import", ART.slug + ".html"), "utf8").replace(/^<!--[^]*?-->\s*/, "");
const card = x => `<article class="blog-post">${x.featured_image ? `<a href="/sv/posts/${x.slug}"><img src="${x.featured_image}" alt="${(x.featured_alt || "").replace(/"/g, "&quot;")}"></a>` : ""}<div class="blog-post__content"><span class="date">${x.date.slice(0, 10)}</span><h2><a href="/sv/posts/${x.slug}">${x.title}</a></h2><p>${x.excerpt.replace(x.title, "").trim().slice(0, 200)}</p><a href="/sv/posts/${x.slug}">Läs mer</a></div></article>`;
async function withFixtures(ctx) {
  await ctx.route(/\/sv\/posts(\/[^?]*)?\?/, async r => {
    if (r.request().resourceType() !== "document" && r.request().resourceType() !== "fetch") return r.continue();
    const res = await r.fetch({ url: url("/sv/posts") }); let html = await res.text();
    if (r.request().resourceType() === "document") html = html.replace(/<!-- Theme 8 development loader[\s\S]*?<\/script>/, () => LOADER);
    if (/\/sv\/posts\/[^/?]+/.test(r.request().url())) {
      html = html.replace(/<div class="store-posts">[\s\S]*?<\/section>\s*<\/div>/, `<div class="store-posts"><section class="section"><div class="container"><h1>${ART.title}</h1><span class="date">${ART.date.slice(0, 10)}</span><img src="${ART.featured_image}" alt="${ART.featured_alt}"><div class="post-content">${body}</div></div></section></div>`)
        .replace(/<title>[^<]*/, `<title>${ART.seo_title}`).replace(/<meta name="description" content="">/, `<meta name="description" content="${ART.meta_description}">`);
    } else html = html.replace('<div class="blog-posts">', '<div class="blog-posts">' + FIX.map(card).join(""));
    return r.fulfill({ response: res, body: html, headers: { ...res.headers(), "content-type": "text/html; charset=utf-8" } });
  });
}
const LOADER = fs.readFileSync(path.join(DIR, "../../blocks/loader-theme8-dev.html"), "utf8").trim();
const CASES = [
  { id: "index-empty-live", route: "/sv/posts" },
  { id: "index-fixture", route: "/sv/posts", fixture: true },
  { id: "article-fixture", route: "/sv/posts/" + ART.slug, fixture: true },
  { id: "product-sep", route: "/sv/products/buds-nano11-abacous-5-gram" },
  ...(process.env.REGRESSION ? [{ id: "reg-home", route: "/" }, { id: "reg-category", route: "/sv/categories/alla-vapes" }, { id: "reg-faq", route: "/sv/page/faq" }] : [])
].filter(c => (!c.fixture && c.id !== "index-empty-live") || process.env.FIXTURE) /* bloggen har riktiga inlägg sedan 2026-11-12: fixturfallen körs bara med FIXTURE=1, se verify-live.mjs / verify-archive.mjs */
 .filter(c => !process.env.ONLY || c.id.startsWith(process.env.ONLY));
const b = await chromium.launch({ channel: "chrome" }); const results = [];
for (const w of [393, 1440]) for (const c of CASES) {
  const ctx = await ctxFor(b, w, w < 768 ? 852 : 900);
  if (c.fixture) await withFixtures(ctx);
  const p = await open(ctx, c.route); await ready(p, 3500);
  if (c.id === "article-fixture") { await p.evaluate(() => window.scrollTo(0, document.body.scrollHeight)); await p.waitForTimeout(2500); await p.evaluate(() => window.scrollTo(0, 0)); }
  const m = await p.evaluate(() => {
    const q = s => document.querySelectorAll(s).length;
    return {
      page: document.documentElement.getAttribute("data-hz8-page"), blog: document.querySelector("[data-hz8-blog]")?.getAttribute("data-hz8-blog") || null,
      title: document.title, h1: [...document.querySelectorAll("h1")].filter(h => h.offsetParent).map(h => h.textContent.trim()),
      canonical: document.querySelector('link[rel="canonical"]')?.href || null, overflowX: document.documentElement.scrollWidth - innerWidth,
      rows: q(".hz8-blog__row"), lead: q(".hz8-blog__lead"), chips: [...document.querySelectorAll(".hz8-blog__chips button")].map(b => b.textContent.trim()),
      toc: q(".hz8-post__toc li"), prevnext: [...document.querySelectorAll(".hz8-post__pn a")].map(a => a.rel), rail: q(".hz8-post__rail li"),
      schema: [...document.querySelectorAll('script[type="application/ld+json"][data-hz8]')].map(s => JSON.parse(s.textContent)["@type"]),
      bodyH1: q(".hz8-post__body h1"), metaDesc: document.querySelector('meta[name="description"]')?.content?.slice(0, 80) || "",
      wide: [...document.querySelectorAll("#store-main *")].filter(e => e.getBoundingClientRect().right > innerWidth + 1 && !e.closest(".hz8-post__rail, .hz8-blog__chips")).slice(0, 6).map(e => e.tagName + "." + [...e.classList].join(".") + ":" + Math.round(e.getBoundingClientRect().width)),
      cs: [".hz8-post__head", ".hz8-post__h1slot", ".hz8-post__title", ".hz8-post__hero", ".hz8-post__hero img", ".hz8-post__grid"].map(q => { const e = document.querySelector(q); if (!e) return q + ":none"; const c = getComputedStyle(e); return q + " d=" + c.display + " ws=" + c.whiteSpace + " w=" + c.width + " minw=" + c.minWidth + " maxw=" + c.maxWidth + " pos=" + c.position + " ji=" + c.justifyItems + " ar=" + c.aspectRatio + " h=" + c.height; }),
      chain: (() => { const o = []; let e = document.querySelector(".hz8-post"); while (e && e !== document.body) { const cs = getComputedStyle(e); o.push(e.tagName + "." + [...e.classList].slice(0, 2).join(".") + " " + cs.display + " w" + Math.round(e.getBoundingClientRect().width) + " x" + Math.round(e.getBoundingClientRect().left)); e = e.parentElement; } return o; })(),
      imgNoAlt: [...document.querySelectorAll(".hz8-blog img, .hz8-post img")].filter(i => !i.hasAttribute("alt")).length
    };
  });
  await p.screenshot({ path: path.join(OUT, `${c.id}-${w}.png`) });
  if (c.id !== "product-sep") await p.screenshot({ path: path.join(OUT, `${c.id}-${w}-full.png`), fullPage: true });
  if (c.id === "index-fixture") { // ämnesfilter
    const btn = p.locator(".hz8-blog__chips button").nth(1);
    if (await btn.count()) { await btn.click({ force: true }); await p.mouse.move(0, 0); m.filterVisible = await p.evaluate(() => [...document.querySelectorAll(".hz8-blog [data-topics]")].filter(e => !e.hidden).length); }
  }
  m.errors = p.errors.filter(e => !/favicon|trustpilot|Failed to load resource/i.test(e));
  results.push({ case: c.id, w, ...m }); console.log(c.id, w, JSON.stringify(m));
  await ctx.close();
}
fs.writeFileSync(path.join(OUT, "verify.json"), JSON.stringify(results, null, 1));
await b.close();
