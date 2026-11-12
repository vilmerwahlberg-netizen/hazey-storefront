// TASK 17B: arkivet /sv/posts med RIKTIGA Nyehandel-inlägg (lokal Theme 8-build i preview).
// Kontrollerar: alla 75 laddas, "Visa fler" + fokus, sökträff från sida 10 (titel och
// ingress), tom sökning, Escape, tangentbord till ämneschipp, ämnesfilter, vanliga länkar.
import fs from "node:fs"; import path from "node:path";
import { chromium, ctxFor, open, ready } from "../launch-task-queue-2026-10/01-global-boot-footer/review/lib.mjs";
const DIR = path.dirname(new URL(import.meta.url).pathname); const OUT = path.join(DIR, "runs");
const b = await chromium.launch({ channel: "chrome" }); const res = [];
const rows = p => p.evaluate(() => [...document.querySelectorAll("#hz8-blog-results a.hz8-lib__link")].map(a => new URL(a.href).pathname));
const status = p => p.evaluate(() => document.querySelector(".hz8-lib__count")?.textContent.trim());
async function type(p, q) { await p.fill(".hz8-lib__search input", q); await p.waitForTimeout(400); await p.mouse.move(1, 1); await p.evaluate(() => document.querySelector(".hz8-lib__search").scrollIntoView({ block: "start" })); await p.evaluate(() => scrollBy(0, -110)); }
for (const w of [393, 1440, 1920]) {
  const ctx = await ctxFor(b, w, w < 768 ? 852 : w > 1600 ? 1080 : 900); const p = await open(ctx, "/sv/posts"); await ready(p, 2000);
  await p.waitForFunction(() => /^\d+ resultat · Senaste först$/.test(document.querySelector(".hz8-lib__count")?.textContent.trim() || ""), null, { timeout: 60000 });
  const r = { w };
  await p.mouse.move(1, 1);
  r.statusAll = await status(p); r.initialLinks = (await rows(p)).length;
  r.h1 = await p.evaluate(() => [...document.querySelectorAll("h1")].filter(h => h.offsetParent).map(h => h.textContent.trim()));
  r.chips = await p.evaluate(() => [...document.querySelectorAll(".hz8-lib__tlist button")].map(b => b.textContent.replace(/\s+/g, " ").trim()));
  r.datesShown = await p.evaluate(() => document.querySelectorAll("#hz8-blog-results time").length);
  r.dangingAv = await p.evaluate(() => /\sav\s*$/m.test([...document.querySelectorAll(".published-at")].map(e => e.textContent).join("\n")));
  await p.screenshot({ path: path.join(OUT, `archive-${w}.png`) });
  // Visa fler (tangentbord): fokus på knappen + Enter, fokus ska hamna på första nya raden
  await p.focus("[data-more]"); await p.keyboard.press("Enter"); await p.waitForTimeout(300);
  r.afterMore = (await rows(p)).length;
  r.focusAfterMore = await p.evaluate(() => document.activeElement?.classList.contains("hz8-lib__link"));
  // Sökträff på titel, artikel som ligger på Nyehandels sida 10
  await type(p, "terpener"); r.qTitle = { status: await status(p), hits: await rows(p) };
  await p.screenshot({ path: path.join(OUT, `archive-search-${w}.png`) });
  // Sökträff bara i ingressen ("apotek" står inte i någon titel)
  await type(p, "apotek"); r.qExcerpt = { status: await status(p), hits: await rows(p) };
  // Bindestreck/skiftläge: "thc-p" ska hitta THCP-artiklar
  await type(p, "thc-p lagligt"); r.qFold = { status: await status(p), n: (await rows(p)).length };
  // Tom träff
  await type(p, "xyzqvw"); r.qNone = { status: await status(p), msg: await p.evaluate(() => document.querySelector(".hz8-lib__nohits")?.textContent.trim()) };
  await p.screenshot({ path: path.join(OUT, `archive-nohits-${w}.png`) });
  await p.click("[data-clear]"); await p.waitForTimeout(200); r.afterClear = await status(p);
  r.focusAfterClear = await p.evaluate(() => document.activeElement?.matches(".hz8-lib__search input"));
  // Escape rensar
  await type(p, "cbd"); await p.press(".hz8-lib__search input", "Escape"); await p.waitForTimeout(200); r.afterEscape = await status(p);
  // Tangentbord: Tab från sökfältet till första ämneschippet, sedan Tab + Enter på nästa
  // Tangentbord: Tab från första ämnesknappen till nästa, Enter aktiverar. Sedan Enter i sökfältet = sök-knappen.
  await p.focus(".hz8-lib__tlist button"); await p.keyboard.press("Tab"); r.tabTarget = await p.evaluate(() => document.activeElement?.textContent.replace(/\s+/g, " ").trim());
  await p.keyboard.press("Tab"); await p.keyboard.press("Tab"); await p.keyboard.press("Tab"); await p.keyboard.press("Enter"); await p.waitForTimeout(300);
  r.chipByKeyboard = { pressed: await p.evaluate(() => document.querySelector(".hz8-lib__tlist button[aria-pressed='true']")?.textContent.replace(/\s+/g, " ").trim()), status: await status(p) };
  await p.screenshot({ path: path.join(OUT, `archive-topic-${w}.png`) });
  await p.click("[data-topic='']"); await p.focus(".hz8-lib__search input"); await p.keyboard.type("eu-certifierad"); await p.keyboard.press("Enter"); await p.waitForTimeout(500);
  r.enterSearch = { status: await status(p), hits: await rows(p) };
  r.featured = await p.evaluate(() => { const f = document.querySelector(".hz8-lib__feature"); return f ? { title: f.querySelector("h3").textContent, img: !!f.querySelector("img")?.naturalWidth } : null; });
  r.overflowX = await p.evaluate(() => document.documentElement.scrollWidth - innerWidth);
  r.allHrefsPlain = await p.evaluate(() => [...document.querySelectorAll("#hz8-blog-results a")].every(a => /^\/sv\/post\/[a-z0-9-]+(\?preview=[^&]+)?$/.test(new URL(a.href).pathname + new URL(a.href).search) || a.matches(".pagination a")));
  r.errors = p.errors.filter(e => !/favicon|trustpilot|Failed to load resource/i.test(e));
  res.push(r); console.log(JSON.stringify(r)); await ctx.close();
}
fs.writeFileSync(path.join(OUT, "verify-archive.json"), JSON.stringify(res, null, 1)); await b.close();
