// TASK 17C — synligt stilbyte: första ögonblicket en produktbild är målad i viewporten (kall laddning).
// Skärmbild i just det ögonblicket + om bildytan redan har sin slutliga typ (data-hz8-media) eller
// fortfarande är obehandlad (runtime-klassningen väntar på sin CORS-hämtning).
// Kör: node early.mjs runtime,after  ->  shots/early/<which>-<w>-<key>.png + runs/early.json
import fs from "node:fs"; import path from "node:path";
import { chromium, ctxFor, open, DIR } from "./lib/harness.mjs";
const WHICH = (process.argv[2] || "runtime,after").split(",");
const PAGES = { home: "/", buds: "/sv/categories/blommor-buds", "pdp-yoda": "/sv/products/magic-sauce-buds-yoda-ice-cream-5-gram" };
const OUT = path.join(DIR, "shots/early"); fs.mkdirSync(OUT, { recursive: true });
const b = await chromium.launch(); const R = [];
for (const which of WHICH) for (const [w, h] of [[393, 852], [1440, 900]]) for (const [key, route] of Object.entries(PAGES)) {
  const ctx = await ctxFor(b, w, h, { which }); const p = await open(ctx, route);
  let st = null; const t0 = Date.now();
  while (Date.now() - t0 < 30000) {
    st = await p.evaluate(() => {
      if (!document.documentElement.classList.contains("hz8") || document.documentElement.classList.contains("hz8-boot")) return null;
      const boxes = [...document.querySelectorAll(".product-detail__media, .product-card__image, .hz8-bs-card__media, .hz8-pcard__media")].filter(e => { const r = e.getBoundingClientRect(); return r.width > 60 && r.bottom > 0 && r.top < innerHeight; });
      const painted = boxes.filter(e => { const i = e.matches(".product-detail__media") ? e.querySelector("#product-slides img") : e.querySelector("img"); return i && i.complete && i.naturalWidth; });
      if (!painted.length) return null;
      return { painted: painted.length, untreated: painted.filter(e => !["transparent", "white", "embedded", "environment", "unverified"].includes(e.getAttribute("data-hz8-media"))).length, t: Math.round(performance.now()) };
    }).catch(() => null);
    if (st) break; await p.waitForTimeout(40);
  }
  if (st) await p.screenshot({ path: path.join(OUT, `${which}-${w}-${key}.png`) });
  R.push({ which, w, key, ...st }); console.log(which, w, key, JSON.stringify(st));
  await ctx.close();
}
fs.writeFileSync(path.join(DIR, "runs/early.json"), JSON.stringify(R, null, 1)); await b.close();
