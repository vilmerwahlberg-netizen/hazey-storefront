// TASK 17B: Theme 8 (lokal build) mot RIKTIGA publicerade inlägg i preview-instansen.
// Ingen fixtur. Användning: node verify-live.mjs [slug ...]  ->  runs/live-*.png, runs/verify-live.json
import fs from "node:fs"; import path from "node:path";
import { chromium, ctxFor, open, ready } from "../launch-task-queue-2026-10/01-global-boot-footer/review/lib.mjs";
const DIR = path.dirname(new URL(import.meta.url).pathname); const OUT = path.join(DIR, "runs"); fs.mkdirSync(OUT, { recursive: true });
const slugs = process.argv.slice(2);
const CASES = [{ id: "live-archive", route: "/sv/posts" }, ...slugs.map(s => ({ id: "live-post-" + s.slice(0, 40), route: "/sv/post/" + s }))];
const b = await chromium.launch({ channel: "chrome" }); const res = [];
for (const w of [393, 1440]) for (const c of CASES) {
  const ctx = await ctxFor(b, w, w < 768 ? 852 : 900); const p = await open(ctx, c.route); await ready(p, 3500);
  if (c.id !== "live-archive") { await p.evaluate(() => scrollTo(0, document.body.scrollHeight)); await p.waitForTimeout(2500); await p.evaluate(() => scrollTo(0, 0)); }
  const m = await p.evaluate(() => {
    const q = s => document.querySelectorAll(s).length, vis = e => !!(e && e.offsetParent);
    return { page: document.documentElement.dataset.hz8Page, blog: document.querySelector("[data-hz8-blog]")?.dataset.hz8Blog || null,
      h1: [...document.querySelectorAll("h1")].filter(vis).map(h => h.textContent.trim()), title: document.title,
      meta: document.querySelector(".hz8-post__meta")?.textContent.trim() || null,
      nativeDateVisible: [...document.querySelectorAll(".published-at")].some(vis), updatedVisible: /Senast uppdaterad/.test(document.querySelector(".hz8-post__body, .blog-post__content")?.innerText || ""),
      hero: !!document.querySelector(".hz8-post__hero img"), heroLoaded: document.querySelector(".hz8-post__hero img")?.naturalWidth || 0,
      bodyImgs: [...document.querySelectorAll(".hz8-post__body img")].map(i => i.naturalWidth > 0), toc: q(".hz8-post__toc li"),
      rows: q(".hz8-blog__row") + q(".hz8-blog__lead"), pn: q(".hz8-post__pn a"), rail: q(".hz8-post__rail li"),
      schema: [...document.querySelectorAll('script[type="application/ld+json"]')].map(s => { try { const d = JSON.parse(s.textContent); return d["@type"] + (d.datePublished ? ":" + d.datePublished : "") + (d["@type"] === "BlogPosting" ? ":" + (typeof d.mainEntityOfPage === "string" ? d.mainEntityOfPage : d.mainEntityOfPage?.["@id"]) : ""); } catch (e) { return "?"; } }).filter(t => /Blog|Bread/.test(t)),
      danglingAv: [...document.querySelectorAll(".published-at")].some(e => /\sav\s*$/.test(e.textContent)),
      pnRel: [...document.querySelectorAll(".hz8-post__pn a")].map(a => a.rel + ":" + new URL(a.href).pathname),
      overflowX: document.documentElement.scrollWidth - innerWidth,
      wide: [...document.querySelectorAll(".hz8-post *, .hz8-blog *")].filter(e => e.getBoundingClientRect().right > innerWidth + 1 && !e.closest(".hz8-post__rail, .hz8-blog__chips")).length };
  });
  m.errors = p.errors.filter(e => !/favicon|trustpilot|Failed to load resource/i.test(e));
  await p.screenshot({ path: path.join(OUT, `${c.id}-${w}.png`) });
  await p.screenshot({ path: path.join(OUT, `${c.id}-${w}-full.png`), fullPage: true });
  res.push({ case: c.id, w, ...m }); console.log(c.id, w, JSON.stringify(m)); await ctx.close();
}
fs.writeFileSync(path.join(OUT, "verify-live.json"), JSON.stringify(res, null, 1)); await b.close();
