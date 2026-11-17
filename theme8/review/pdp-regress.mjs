// Andra PDP:er oförändrade: samma sida med en tidigare build (PREV=<dist/theme8>)
// mot NEXT (en annan lokal build, eller "preview" = det som ligger på Pages).
// Cookie-rutan stängs, alla bilder laddas, sedan pixeljämförelse (pixelmatch).
// PREV=… NEXT=preview OUT=<mapp> node pdp-regress.mjs <route> [route …]
import { chromium, ctxFor, open, URL_ } from "./pdp-pilot-2026-10/lib.mjs";
import fs from "node:fs"; import path from "node:path"; import { createRequire } from "node:module";
const req = createRequire(import.meta.url);
const { PNG } = req("pngjs"); let pm = req("pixelmatch"); pm = pm.default || pm;
const OUT = process.env.OUT; fs.mkdirSync(OUT, { recursive: true });
const modes = { prev: { local: true, build: process.env.PREV }, next: process.env.NEXT === "preview" ? { local: false } : { local: true, build: process.env.NEXT } };
const b = await chromium.launch({ channel: "chrome", headless: true }); const R = {};
for (const [w, h] of [[393, 852], [1440, 900]]) for (const route of process.argv.slice(2)) {
  const shot = {};
  for (const [mode, o] of Object.entries(modes)) {
    const ctx = await ctxFor(b, w, h, { ...o, scale: 1 });
    const p = await open(ctx, URL_(route));
    await p.waitForSelector(".hz8-pp", { timeout: 30000 }).catch(() => {}); await p.waitForTimeout(3000);
    await p.getByRole("button", { name: "Godkänn alla" }).click({ timeout: 3000 }).catch(() => {});
    const H = Math.min(await p.evaluate(() => document.documentElement.scrollHeight), 2600);
    for (let y = 0; y < H; y += 400) { await p.evaluate(v => scrollTo(0, v), y); await p.waitForTimeout(150); }
    await p.evaluate(() => scrollTo(0, 0)); await p.setViewportSize({ width: w, height: H });
    await p.waitForFunction(() => [...document.images].filter(i => i.getBoundingClientRect().top < 2600 && i.loading !== "lazy").every(i => i.complete), null, { timeout: 15000 }).catch(() => {});
    await p.waitForTimeout(3000);
    const info = await p.evaluate(() => ({ authored: document.documentElement.classList.contains("hz8-pdp-authored"), h1: document.querySelectorAll("h1").length, overflow: document.documentElement.scrollWidth - innerWidth }));
    shot[mode] = { png: PNG.sync.read(await p.screenshot({ clip: { x: 0, y: 0, width: w, height: H } })), info };
    await ctx.close();
  }
  const a = shot.prev.png, c = shot.next.png, hh = Math.min(a.height, c.height);
  const crop = x => { const o = new PNG({ width: w, height: hh }); PNG.bitblt(x, o, 0, 0, w, hh, 0, 0); return o; };
  const diff = pm(crop(a).data, crop(c).data, null, w, hh, { threshold: 0.1 });
  const key = `${route.split("/").pop()}-${w}`;
  R[key] = { diffPx: diff, diffPct: +(100 * diff / (w * hh)).toFixed(3), heights: [a.height, c.height], prev: shot.prev.info, next: shot.next.info };
  if (diff) for (const m of ["prev", "next"]) fs.writeFileSync(path.join(OUT, `${key}-${m}.png`), PNG.sync.write(shot[m].png));
  console.log(key, R[key].diffPct + "%", JSON.stringify(shot.next.info));
}
fs.writeFileSync(path.join(OUT, "regress.json"), JSON.stringify(R, null, 1)); await b.close();
