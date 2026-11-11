// TASK 20: skärmbild av köpzonen på PDP 255 (Theme 8-preview, lokal build). Ingen korg.
// node shot.mjs <before|after> <vp> <namn> [flag 0/1] [action]
import path from "node:path";
import { chromium, ctxFor, open, ready } from "../../catalog-reconciliation-2026-11/lib/harness.mjs";
const DIR = path.dirname(new URL(import.meta.url).pathname);
const [which, vp, name, flag = "1", action = "", route = "/sv/products/thc-x-vape-hero-core-2ml"] = process.argv.slice(2);
const W = +vp, M = W < 768;
const UA = "Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Mobile Safari/537.36";
const b = await chromium.launch();
const ctx = await ctxFor(M ? { newContext: o => b.newContext({ ...o, userAgent: UA }) } : b, W, M ? 852 : W === 768 ? 1024 : W >= 1920 ? 1080 : 1000, { which });
const q = flag === "1" ? "?hz8-pkg-pilot=1" : flag === "review" ? "?hz8-pkg-pilot=1&hz8-pkg-review=1" : "";
const p = await open(ctx, route + q); await ready(p, 3000);
await p.waitForSelector(".hz8-pp__choice:not([hidden]), .hz8-pp__pack[data-key='strain:3']", { timeout: flag !== "0" ? 25000 : 3000 }).catch(() => {});
for (const a of action.split("+").filter(Boolean)) {
  const m = a.match(/^pack(\d+)$/); if (m) { await p.click(`.hz8-pc[data-qty="${m[1]}"]`); await p.waitForTimeout(400); }
  const e = a.match(/^empty(\d+)$/); if (e) { await p.selectOption(`.hz8-up select[data-upslot="${e[1]}"]`, ""); await p.waitForTimeout(300); }
  const t = a.match(/^try$/); if (t) { await p.click(".hz8-pp__cta", { force: true }); await p.waitForTimeout(500); }
}
const box = await p.evaluate(() => { const st = document.querySelector(".hz8-pp"); const r = st.getBoundingClientRect(); return { x: r.left + scrollX, y: r.top + scrollY, w: r.width, h: r.height, sw: document.documentElement.scrollWidth, errors: null }; });
console.log(JSON.stringify({ box, errors: p.errors }));
if (action.includes("viewport")) { await p.evaluate(() => window.scrollTo(0, 0)); await p.waitForTimeout(500); await p.screenshot({ path: path.join(DIR, "shots", name + ".png") }); await b.close(); process.exit(0); }
await p.screenshot({ path: path.join(DIR, "shots", name + ".png"), fullPage: true, clip: { x: Math.max(0, box.x - (M ? 0 : 24)), y: Math.max(0, box.y - 140), width: M ? W : Math.min(W, box.w + 48), height: box.h + 180 } });
await b.close();
