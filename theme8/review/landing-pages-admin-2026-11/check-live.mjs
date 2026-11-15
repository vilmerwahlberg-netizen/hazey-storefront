// Riktiga Content-sidorna i Theme 8-preview (ingen fixtur, ingen lokal build:
// sidans egen dev-loader hämtar Theme 8 från GitHub Pages). Läser bara;
// klickar inte på något som ändrar data (cookiebannern godkänns i preview).
// Kör: node theme8/review/landing-pages-admin-2026-11/check-live.mjs
import { chromium } from "playwright"; import fs from "node:fs"; import path from "node:path";
// LOCAL=1: samma riktiga sidor, men sidans dev-loader byts mot lokal build (dist/theme8)
// via testharnessen -- för att pröva en CSS-rättelse innan den driftsätts.
const LOCAL = !!process.env.LOCAL;
const H = LOCAL ? await import("../launch-task-queue-2026-10/01-global-boot-footer/review/lib.mjs") : null;
const DIR = path.dirname(new URL(import.meta.url).pathname);
const OUT = path.join(DIR, LOCAL ? "shots-local" : "shots"); fs.mkdirSync(OUT, { recursive: true });
const PREVIEW = "v9kzdmqz4w60l5n"; const BASE = "https://hazeyse.nyehandel.se";
const SLUGS = (process.env.ONLY || "thcx,engangsvape,thca").split(",");
const VIEWS = [["393", 393, 852], ["1440", 1440, 900]];
const UA = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36";
const b = await chromium.launch({ channel: "chrome" }); const results = [];
for (const slug of SLUGS) for (const [tag, w, h] of VIEWS) {
  const m = w < 768;
  const ctx = LOCAL ? await H.ctxFor(b, w, h, { which: "after" }) : await b.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: m ? 2 : 1, isMobile: m, hasTouch: m, userAgent: m ? undefined : UA });
  const p = await ctx.newPage(); const errors = []; const failed = [];
  p.on("pageerror", e => errors.push(String(e))); p.on("console", x => { if (x.type() === "error") errors.push(x.text()); });
  p.on("response", r => { if (r.status() >= 400 && /\.(webp|png|jpe?g|svg|css|js)(\?|$)|cloudfront|github\.io/.test(r.url())) failed.push(r.status() + " " + r.url().slice(0, 140)); });
  const url = `${BASE}/sv/page/${slug}?preview=${PREVIEW}`;
  const resp = await p.goto(url, { waitUntil: "domcontentloaded", timeout: 60000 });
  await p.waitForFunction(() => document.documentElement.classList.contains("hz8") && !document.documentElement.classList.contains("hz8-boot"), null, { timeout: 60000 }).catch(() => {});
  try { await p.getByRole("button", { name: "Godkänn alla" }).click({ timeout: 4000 }); } catch {}
  await p.waitForTimeout(6000);
  await p.screenshot({ path: path.join(OUT, `${slug}-${tag}-fold.png`) });
  await p.evaluate(async () => { for (let y = 0; y < document.body.scrollHeight; y += 400) { window.scrollTo(0, y); await new Promise(r => setTimeout(r, 150)); } window.scrollTo(0, 0); });
  await p.waitForTimeout(3000);
  const d = await p.evaluate(() => {
    const vis = e => !!(e && (e.offsetWidth || e.offsetHeight)); const txt = e => e ? e.textContent.replace(/\s+/g, " ").trim() : "";
    const lp = document.querySelector(".hz8-lp");
    const imgs = [...document.querySelectorAll("#store-main img")].filter(vis);
    return {
      themeLoaded: document.documentElement.classList.contains("hz8"), lpPage: document.documentElement.classList.contains("hz8-lp-page"),
      wrapper: lp ? [...lp.parentElement.classList].join(".") : null,
      title: document.title, h1: [...document.querySelectorAll("h1")].filter(vis).map(txt),
      overflowX: document.documentElement.scrollWidth - innerWidth,
      brokenImgs: imgs.filter(i => i.complete && i.naturalWidth === 0).map(i => (i.currentSrc || i.src).slice(0, 120)),
      imgs: imgs.length,
      packs: [...document.querySelectorAll(".hz8-lp__pack, .hz8-guide__pack")].map(i => i.complete && i.naturalWidth > 0),
      railCards: document.querySelectorAll(".hz8-lp__rail .product-card").length,
      fallbackShown: vis(document.querySelector(".hz8-lp__fallback")),
      summary: txt(document.querySelector("[data-hz8-format-summary]:not([hidden])")) || null,
      sizes: [...document.querySelectorAll("[data-hz8-size]:not([hidden])")].map(txt),
      paths: [...document.querySelectorAll(".hz8-lp__path:not([hidden]) h3, .hz8-guide__path h3")].map(txt),
      pathLive: [...document.querySelectorAll(".hz8-guide__path-live:not([hidden]), .hz8-lp__path-live")].map(txt).filter(Boolean).slice(0, 3),
      faq: document.querySelectorAll(".hz8-lp__qa details").length,
      footer: (() => { const f = document.querySelector("#store-footer, footer"); return f ? Math.round(f.getBoundingClientRect().bottom + scrollY) : null; })(),
      docH: document.documentElement.scrollHeight,
      links: [...new Set([...document.querySelectorAll(".hz8-lp a[href]")].map(a => a.getAttribute("href")))].filter(h => !/\/products\/.*\/\d+$/.test(h))
    };
  });
  await p.screenshot({ path: path.join(OUT, `${slug}-${tag}-full.png`), fullPage: true });
  if (tag === "1440") {
    d.linkStatus = {};
    for (const href of d.links) {
      if (href.startsWith("#")) { d.linkStatus[href] = (await p.evaluate(id => !!document.getElementById(id), href.slice(1))) ? "ankare ok" : "ankare saknas"; continue; }
      const u = new URL(href, BASE); if (u.host === "hazeyse.nyehandel.se") u.searchParams.set("preview", PREVIEW);
      const r = await ctx.request.get(u.toString(), { maxRedirects: 0, timeout: 30000 }).catch(e => ({ status: () => String(e).slice(0, 60) }));
      d.linkStatus[href] = r.status();
    }
  }
  d.status = resp.status(); d.url = url;
  d.errors = errors.filter(e => !/favicon|trustpilot|recaptcha/i.test(e)); d.failedRequests = failed;
  results.push({ slug, tag, ...d }); console.log(slug, tag, JSON.stringify({ ...d, links: d.links.length }).slice(0, 1500));
  await ctx.close();
}
fs.writeFileSync(path.join(DIR, LOCAL ? "check-local.json" : "check-live.json"), JSON.stringify(results, null, 1));
await b.close();
