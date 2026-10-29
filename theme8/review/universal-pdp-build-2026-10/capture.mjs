// TASK 10B -- helsida och första vy per produkt/bredd, före (6ab37b5) och
// efter (arbetskopian), på riktiga Theme 8-previewn med lokalt injicerad
// build. Sidan scrollas igenom (lazy-bilder, asynkrona moduler) innan
// helsidesbilden tas. Sticky-lager och fast header ritas i sitt viloläge.
// node capture.mjs <before|after> <id,..> <width,..> [query] [tag]
import { chromium, ctxFor, open, ready, DIR } from "./lib.mjs"; import fs from "node:fs";
import { PRODUCTS } from "./products.mjs";
const [which = "after", ids = "57", ws = "393,1440", query = "", tag = ""] = process.argv.slice(2);
const OUT = `${DIR}/runs/shots`; fs.mkdirSync(OUT, { recursive: true });
const b = await chromium.launch(); const rows = [];
for (const id of ids.split(",")) for (const w of ws.split(",").map(Number)) {
  const z = w === 2880 ? 2 : 0; // 200 % zoom = 1440 css-bredd vid DPR 2 -> 720 css-px
  const cw = z ? 720 : w, ch = cw < 768 ? (cw <= 320 ? 640 : cw === 430 ? 932 : 852) : cw === 768 ? 1024 : cw === 1512 ? 982 : cw === 1920 ? 1080 : cw === 1280 ? 800 : 900;
  const ctx = await ctxFor(b, cw, z ? 450 : ch, { which, zoom: z });
  const path = PRODUCTS[id].route + (query ? (PRODUCTS[id].route.includes("?") ? "&" : "?") + query : "");
  const p = await open(ctx, path); await ready(p, 4500);
  const name = `${which}${tag ? "-" + tag : ""}-${id}-${z ? "1440-z200" : w}`;
  await p.screenshot({ path: `${OUT}/${name}-first.jpg`, type: "jpeg", quality: 78 });
  await p.evaluate(async () => { for (let y = 0; y < document.documentElement.scrollHeight; y += 500) { scrollTo({ top: y, behavior: "instant" }); await new Promise(r => setTimeout(r, 110)); } scrollTo({ top: 0, behavior: "instant" }); });
  await p.waitForTimeout(2500);
  const m = await p.evaluate(() => ({ h1: document.querySelectorAll("h1:not([role=heading])").length, adapter: document.documentElement.classList.contains("hz8-pdp-pilot"), overflowX: document.documentElement.scrollWidth > innerWidth + 1, docH: document.documentElement.scrollHeight }));
  if (ws.split(",").length && ["393", "1440"].includes(String(w)) || process.env.FULL) await p.screenshot({ path: `${OUT}/${name}-full.jpg`, fullPage: true, type: "jpeg", quality: 70 });
  rows.push({ which, id, w, query, ...m, errors: p.errors }); console.log(JSON.stringify(rows.at(-1)));
  await ctx.close();
}
fs.writeFileSync(`${DIR}/runs/capture-${which}${tag ? "-" + tag : ""}-${ids.replace(/,/g, "_")}-${ws.replace(/,/g, "_")}.json`, JSON.stringify(rows, null, 1));
await b.close();
