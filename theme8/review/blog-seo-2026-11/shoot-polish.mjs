// TASK 17C-puts: första vyn + närbild av hero (rubrik + ingress) och uppmätt rytm.
// Användning: node shoot-polish.mjs <etikett>  ->  runs/polish-<etikett>-<w>.png, -<w>-hero.png, runs/polish-<etikett>.json
import fs from "node:fs"; import path from "node:path";
import { chromium, ctxFor, open, ready } from "../launch-task-queue-2026-10/01-global-boot-footer/review/lib.mjs";
const DIR = path.dirname(new URL(import.meta.url).pathname); const label = process.argv[2] || "now"; const out = {};
const b = await chromium.launch({ channel: "chrome" });
for (const w of [320, 393, 430, 1440, 1920]) {
  const ctx = await ctxFor(b, w, w < 768 ? (w === 320 ? 640 : 852) : w > 1600 ? 1080 : 900); const p = await open(ctx, "/sv/posts"); await ready(p, 2500);
  await p.waitForFunction(() => /^\d+ resultat/.test(document.querySelector(".hz8-lib__count")?.textContent.trim() || ""), null, { timeout: 60000 });
  await p.mouse.move(1, 1); await p.waitForTimeout(600);
  const m = await p.evaluate(() => {
    const r = s => { const e = document.querySelector(s); if (!e) return null; const b = e.getBoundingClientRect(); return { top: Math.round(b.top), bottom: Math.round(b.bottom), h: Math.round(b.height) }; };
    const h1 = document.querySelector(".hz8-lib__title"), cs = getComputedStyle(h1);
    const lede = r(".hz8-lib__lede"), t = r(".hz8-lib__title"), hero = r(".hz8-lib__hero"), eb = r(".hz8-lib__eyebrow");
    const topics = r(".hz8-lib__topics"), search = r(".hz8-lib__search"), head = r(".hz8-lib__head"), first = r(".hz8-lib__item");
    return { h1: { size: cs.fontSize, lineHeight: cs.lineHeight, lines: Math.round(t.h / parseFloat(cs.lineHeight)) },
      gaps: { heroTopToEyebrow: eb.top - hero.top, h1ToLede: lede.top - t.bottom, ledeToHeroBottom: hero.bottom - lede.bottom, heroH: hero.h,
        heroToTopics: topics.top - hero.bottom, topicsToSearch: search.top - topics.bottom, searchToHead: head.top - search.bottom, headToFirst: first.top - head.bottom },
      firstItemTop: first.top, firstItemTitleVisible: document.querySelector(".hz8-lib__item h3").getBoundingClientRect().bottom <= innerHeight,
      overflowX: document.documentElement.scrollWidth - innerWidth };
  });
  out[w] = m; console.log(w, JSON.stringify(m));
  await p.screenshot({ path: path.join(DIR, "runs", `polish-${label}-${w}.png`) });
  if (w < 768) { const hero = await p.$(".hz8-lib__hero"); await hero.screenshot({ path: path.join(DIR, "runs", `polish-${label}-${w}-hero.png`) }); }
  await ctx.close();
}
fs.writeFileSync(path.join(DIR, "runs", `polish-${label}.json`), JSON.stringify(out, null, 1)); await b.close();
