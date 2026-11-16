// Ämnesguiderna THCB, THCH och HHC som riktiga Content-sidor i Theme 8-preview.
// Ingen fixtur och ingen lokal build: sidans egen dev-loader hämtar Theme 8 från
// GitHub Pages. Läser bara; godkänner cookiebannern i preview, klickar inget annat.
// Kör: node theme8/review/knowledge-pages-admin-2026-11/check-live.mjs   (ONLY=thch för en sida)
import { chromium } from "playwright"; import fs from "node:fs"; import path from "node:path";
const DIR = path.dirname(new URL(import.meta.url).pathname);
const OUT = path.join(DIR, "shots"); fs.mkdirSync(OUT, { recursive: true });
const PREVIEW = "v9kzdmqz4w60l5n"; const BASE = "https://hazeyse.nyehandel.se";
const SLUGS = (process.env.ONLY || "thcb,thch,hhc").split(",");
const GUIDES = ["/sv/page/thcb", "/sv/page/thch", "/sv/page/hhc", "/sv/page/thca"];
const VIEWS = [["393", 393, 852], ["1440", 1440, 900]];
const UA = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36";
const b = await chromium.launch({ channel: "chrome" }); const results = [];
for (const slug of SLUGS) for (const [tag, w, h] of VIEWS) {
  const m = w < 768;
  const ctx = await b.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: m ? 2 : 1, isMobile: m, hasTouch: m, userAgent: m ? undefined : UA });
  const p = await ctx.newPage(); const errors = []; const failed = []; const assets = [];
  p.on("pageerror", e => errors.push(String(e))); p.on("console", x => { if (x.type() === "error") errors.push(x.text()); });
  p.on("response", r => { const u = r.url(); if (/assets\/knowledge-/.test(u)) assets.push(r.status() + " " + u.replace(/^.*assets\//, "")); if (r.status() >= 400 && /\.(webp|png|jpe?g|svg|css|js)(\?|$)|cloudfront|github\.io/.test(u)) failed.push(r.status() + " " + u.slice(0, 140)); });
  const url = `${BASE}/sv/page/${slug}?preview=${PREVIEW}`;
  const resp = await p.goto(url, { waitUntil: "domcontentloaded", timeout: 60000 });
  await p.waitForFunction(() => document.documentElement.classList.contains("hz8") && !document.documentElement.classList.contains("hz8-boot"), null, { timeout: 60000 }).catch(() => {});
  try { await p.getByRole("button", { name: "Godkänn alla" }).click({ timeout: 4000 }); } catch {}
  await p.waitForTimeout(6000);
  await p.screenshot({ path: path.join(OUT, `${slug}-${tag}-fold.png`) });
  await p.evaluate(async () => { for (let y = 0; y < document.body.scrollHeight; y += 400) { window.scrollTo(0, y); await new Promise(r => setTimeout(r, 150)); } window.scrollTo(0, 0); });
  await p.waitForTimeout(3000);
  const d = await p.evaluate((GUIDES) => {
    const vis = e => !!(e && (e.offsetWidth || e.offsetHeight)); const txt = e => e ? e.textContent.replace(/\s+/g, " ").trim() : "";
    const lp = document.querySelector(".hz8-lp"); const H = document.documentElement;
    const photo = document.querySelector(".hz8-atlas__photo");
    const bg = photo ? getComputedStyle(photo).backgroundImage : "";
    const hrefs = [...document.querySelectorAll(".hz8-lp a[href]")].map(a => a.getAttribute("href"));
    const foot = document.querySelector("#store-footer, footer");
    return {
      finalUrl: location.pathname, themeLoaded: H.classList.contains("hz8"), atlas: H.classList.contains("hz8-atlas-page"), scene: H.dataset.hz8LpScene || null,
      title: document.title, metaDesc: document.querySelector('meta[name="description"]')?.content || null,
      robots: document.querySelector('meta[name="robots"]')?.content || null,
      h1: [...document.querySelectorAll("h1")].filter(vis).map(txt),
      h2: [...document.querySelectorAll(".hz8-lp h2")].filter(vis).map(txt),
      overflowX: document.documentElement.scrollWidth - innerWidth,
      photo: photo ? { visible: vis(photo), w: Math.round(photo.getBoundingClientRect().width), h: Math.round(photo.getBoundingClientRect().height), images: (bg.match(/knowledge-[a-z]+\/[\w-]+\.webp/g) || []) } : null,
      brokenImgs: [...document.querySelectorAll("#store-main img")].filter(vis).filter(i => i.complete && i.naturalWidth === 0).map(i => (i.currentSrc || i.src).slice(0, 120)),
      chapters: [...document.querySelectorAll(".hz8-atlas__chapters a")].map(a => a.getAttribute("href")),
      status: txt(document.querySelector(".hz8-atlas__status, .hz8-atlas__chip")) || null,
      faq: document.querySelectorAll(".hz8-lp__faq details, .hz8-lp__qa details").length,
      sources: [...document.querySelectorAll("#kallor a[href^='http']")].map(a => a.href),
      guideLinks: GUIDES.filter(g => hrefs.some(x => x && x.split("#")[0] === g)),
      lpWidth: lp ? Math.round(lp.getBoundingClientRect().width) : null,
      footerBottom: foot ? Math.round(foot.getBoundingClientRect().bottom + scrollY) : null,
      docH: document.documentElement.scrollHeight,
      links: [...new Set(hrefs)].filter(Boolean)
    };
  }, GUIDES);
  // FAQ med tangentbord: fokusera första summary, Enter, kontrollera open
  d.faqKeyboard = await p.evaluate(() => { const s = document.querySelector(".hz8-lp details summary"); if (!s) return null; s.focus(); return document.activeElement === s; })
    && await p.keyboard.press("Enter").then(() => p.evaluate(() => document.querySelector(".hz8-lp details").open));
  await p.evaluate(() => document.querySelector(".hz8-lp details") && (document.querySelector(".hz8-lp details").open = false));
  await p.screenshot({ path: path.join(OUT, `${slug}-${tag}-full.png`), fullPage: true });
  if (tag === "1440") {
    d.linkStatus = {};
    for (const href of d.links) {
      if (href.startsWith("#")) { d.linkStatus[href] = (await p.evaluate(id => !!document.getElementById(id), href.slice(1))) ? "ankare ok" : "ankare saknas"; continue; }
      const u = new URL(href, BASE); if (u.host === "hazeyse.nyehandel.se") u.searchParams.set("preview", PREVIEW);
      const r = await ctx.request.get(u.toString(), { maxRedirects: 0, timeout: 30000 }).catch(e => ({ status: () => String(e).slice(0, 60), headers: () => ({}) }));
      const s = r.status(); d.linkStatus[href] = s >= 300 && s < 400 ? `${s} → ${r.headers().location}` : s;
    }
  }
  d.status = resp.status(); d.url = url; d.assets = [...new Set(assets)];
  d.errors = errors.filter(e => !/favicon|trustpilot|recaptcha/i.test(e)); d.failedRequests = failed;
  results.push({ slug, tag, ...d }); console.log(slug, tag, JSON.stringify({ ...d, links: d.links.length, linkStatus: undefined }).slice(0, 1800));
  await ctx.close();
}
// Omdirigeringarna efter att sidorna skapats (läses, ändras inte)
const redirects = {};
const ctx = await b.newContext();
for (const pth of ["/sv/page/thcb", "/sv/page/thch", "/sv/page/hhc", "/thcb", "/sv/thcb", "/thch", "/sv/thch", "/hhc", "/sv/hhc"]) {
  const r = await ctx.request.get(BASE + pth, { maxRedirects: 0 }); redirects[pth] = r.status() + (r.headers().location ? " → " + r.headers().location.replace(BASE, "") : "");
}
console.log("redirects", JSON.stringify(redirects, null, 1));
fs.writeFileSync(path.join(DIR, "check-live.json"), JSON.stringify({ checkedAt: new Date().toISOString(), redirects, results }, null, 1));
await b.close();
