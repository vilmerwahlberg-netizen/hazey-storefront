// TASK 17B — fullsides- och närbilder före/efter (lokal build i Theme 8-previewen; inget skrivs till Nyehandel).
// Kör: node capture.mjs before|after [393,1440]  ->  shots/<which>/<w>-<key>.png (+ närbilder av första kortens bildytor)
import fs from "node:fs"; import path from "node:path";
import { chromium, ctxFor, open, ready, DIR } from "./lib/harness.mjs";
const which = process.argv[2] || "after";
const widths = (process.argv[3] || "393,1440").split(",").map(Number);
export const PAGES = {
  home: "/", buds: "/sv/categories/blommor-buds", vapes: "/sv/categories/alla-vapes", hasch: "/sv/categories/hasch",
  bestsellers: "/sv/page/vara-bastsaljare",
  "pdp-yoda": "/sv/products/magic-sauce-buds-yoda-ice-cream-5-gram", "pdp-h4cbd-white": "/sv/products/h4cbd-vape-cbd-group-2ml",
  "pdp-battery-env": "/sv/products/ccell-m3-plus-vape-batteri-510", "pdp-transparent": "/sv/products/hash-cbn-yellowstone-5-gram",
  "pdp-faraoh": "/sv/products/thcba-vape-faraoh-2ml", "pdp-ms2ml": "/sv/products/vape-magic-sauce-magic-farmers-2ml"
};
const only = process.argv[4] ? process.argv[4].split(",") : Object.keys(PAGES);
const OUT = path.join(DIR, "shots", which); fs.mkdirSync(OUT, { recursive: true });
const b = await chromium.launch(); const res = {};
for (const w of widths) for (const key of only) {
  const ctx = await ctxFor(b, w, w < 768 ? 852 : 900, { which }); const p = await open(ctx, PAGES[key]); await ready(p, 5000);
  for (let i = 0; i < 10; i++) { await p.mouse.wheel(0, 1300); await p.waitForTimeout(300); } await p.evaluate(() => scrollTo(0, 0)); await p.waitForTimeout(1500);
  await p.screenshot({ path: path.join(OUT, `${w}-${key}-top.png`) });
  await p.screenshot({ path: path.join(OUT, `${w}-${key}-full.png`), fullPage: true });
  // Närbild: de tre första synliga bildytorna (kort eller PDP-media).
  const boxes = await p.evaluate(() => [...document.querySelectorAll(".product-detail__media, .product-card__image, .hz8-bs-card__media, .hz8-pcard__media, .hz8-spot__art")].filter(e => { const r = e.getBoundingClientRect(); return r.width > 60 && r.height > 60 && getComputedStyle(e).visibility !== "hidden"; }).slice(0, 3).map(e => { e.scrollIntoView({ block: "center" }); const r = e.getBoundingClientRect(); return { x: r.x + scrollX, y: r.y + scrollY, w: r.width, h: r.height, cls: e.className.toString().slice(0, 40), media: e.getAttribute("data-hz8-media") }; }));
  res[`${w}-${key}`] = { boxes, errors: p.errors.length, overflow: await p.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth) };
  for (let i = 0; i < boxes.length; i++) { const bx = boxes[i]; await p.screenshot({ path: path.join(OUT, `${w}-${key}-media${i + 1}.png`), fullPage: true, clip: { x: Math.max(0, bx.x - 8), y: Math.max(0, bx.y - 8), width: Math.min(bx.w + 16, w), height: bx.h + 16 } }).catch(() => {}); }
  process.stdout.write(`${which} ${w} ${key} media=${boxes.map(x => x.media).join("/")} ovf=${res[`${w}-${key}`].overflow} err=${p.errors.length}\n`);
  await ctx.close();
}
fs.writeFileSync(path.join(DIR, `runs/capture-${which}.json`), JSON.stringify(res, null, 1)); await b.close();
