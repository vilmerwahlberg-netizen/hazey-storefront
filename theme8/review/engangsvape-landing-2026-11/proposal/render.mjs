// Förslag /engangsvape/ (design före kod): lokal Theme 8-build i preview-
// instansen. /sv/page/engangsvape finns inte (404). FIXTUR som THCX:
// /sv/page/kopvillkor (tom innehållssida) fylls med proposal/engangsvape-
// utkast.html; proposal.css/js läggs på efteråt. Inget skrivs till Nyehandel.
// Kör: node theme8/review/engangsvape-landing-2026-11/proposal/render.mjs
import fs from "node:fs"; import path from "node:path";
import { chromium, ctxFor, open, ready, url } from "../../launch-task-queue-2026-10/01-global-boot-footer/review/lib.mjs";
const DIR = path.dirname(new URL(import.meta.url).pathname);
const OUT = process.env.OUT || path.join(DIR, "../shots"); fs.mkdirSync(OUT, { recursive: true });
const BLOCK = fs.readFileSync(path.join(DIR, "engangsvape-utkast.html"), "utf8");
const CSS = fs.readFileSync(path.join(DIR, "proposal.css"), "utf8");
const JS = fs.readFileSync(path.join(DIR, "proposal.js"), "utf8");
const LOADER = fs.readFileSync(path.join(DIR, "../../../blocks/loader-theme8-dev.html"), "utf8").trim();
const TITLE = "Engångsvapes med cannabinoider – Magic Sauce, Core och CBD | Hazey";
const META = "Engångsvapes hos Hazey: Magic Sauce 3.0, Hero's Core och CBD i 1+1, 2 och 5 ml. Se vad som finns i lager och pris, med analysintyg på produktsidorna.";

const b = await chromium.launch(); const report = [];
for (const [w, h] of [[393, 852], [1440, 900]]) {
  const ctx = await ctxFor(b, w, h, { which: "after" });
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
    return r.fulfill({ status: 200, body: html, headers: { "content-type": "text/html; charset=utf-8" } });
  });
  const p = await open(ctx, "/sv/page/engangsvape"); await ready(p, 3000);
  await p.addStyleTag({ content: CSS }); await p.addScriptTag({ content: JS });
  await p.waitForFunction(() => document.querySelectorAll(".hz8-lp__pack").length >= 1 && !!document.querySelector(".hz8-lp__rail"), null, { timeout: 30000 }).catch(() => {});
  await p.waitForTimeout(3500); await p.mouse.move(0, 0);
  const s = await p.evaluate(() => ({
    h1: [...document.querySelectorAll("h1")].map(x => x.textContent.trim()),
    h2: [...document.querySelectorAll(".hz8-lp h2")].map(x => x.textContent.trim()),
    paths: [...document.querySelectorAll(".hz8-lp__path")].map(l => ({ t: l.querySelector("h3").textContent.trim(), hidden: l.hidden, live: l.querySelector("[data-hz8-live]").textContent.replace(/\s+/g, " ").trim(), img: !!l.querySelector(".hz8-lp__pack") })),
    sizes: [...document.querySelectorAll("[data-hz8-size]")].map(l => l.hidden ? l.dataset.hz8Size + ": dold" : l.textContent.replace(/\s+/g, " ").trim()),
    summary: document.querySelector("[data-hz8-format-summary]")?.textContent,
    rail: document.querySelectorAll(".hz8-lp__rail .product-card").length,
    ov: document.documentElement.scrollWidth - innerWidth, errors: 0
  }));
  s.errors = p.errors.length; s.w = w; report.push(s); console.log(JSON.stringify(s));
  await p.screenshot({ path: `${OUT}/forslag-${w}-fold.png` });
  await p.screenshot({ path: `${OUT}/forslag-${w}-full.png`, fullPage: true });
  await ctx.close();
}
fs.writeFileSync(path.join(OUT, "forslag-render.json"), JSON.stringify(report, null, 1));
await b.close();
