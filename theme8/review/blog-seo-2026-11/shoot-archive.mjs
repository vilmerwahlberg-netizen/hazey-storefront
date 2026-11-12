// Helsidesbilder av arkivet /sv/posts (riktiga inlägg, lokal Theme 8-build i preview).
// Användning: node shoot-archive.mjs <etikett>   ->  runs/library-<etikett>-<bredd>.png
import path from "node:path";
import { chromium, ctxFor, open, ready } from "../launch-task-queue-2026-10/01-global-boot-footer/review/lib.mjs";
const DIR = path.dirname(new URL(import.meta.url).pathname); const label = process.argv[2] || "now";
const b = await chromium.launch({ channel: "chrome" });
for (const w of [393, 1440, 1920]) {
  const ctx = await ctxFor(b, w, w < 768 ? 852 : w > 1600 ? 1080 : 900); const p = await open(ctx, "/sv/posts"); await ready(p, 2500);
  await p.waitForFunction(() => /^\d+ (artiklar|resultat)/.test(document.querySelector(".hz8-blog__status, .hz8-lib__count")?.textContent.trim() || ""), null, { timeout: 60000 }).catch(() => {});
  await p.mouse.move(1, 1); await p.waitForTimeout(800);
  await p.screenshot({ path: path.join(DIR, "runs", `library-${label}-${w}.png`) });
  await p.screenshot({ path: path.join(DIR, "runs", `library-${label}-${w}-full.png`), fullPage: true });
  console.log(label, w, await p.evaluate(() => document.documentElement.scrollWidth - innerWidth)); await ctx.close();
}
await b.close();
