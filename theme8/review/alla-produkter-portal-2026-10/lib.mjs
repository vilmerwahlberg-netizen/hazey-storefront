// Gemensamt för Task 03-skripten: öppna en route med lokal build (eller BASE) mot Theme 8-previewn.
import { chromium } from "playwright"; import fs from "node:fs"; import path from "node:path";
export const DIR = path.dirname(new URL(import.meta.url).pathname);
export const ROOT = path.resolve(DIR, "../../..");
export const H = { 320: 720, 393: 852, 430: 932, 1280: 800, 1440: 900, 1512: 945, 1920: 1080 };
const UA = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36";
export async function launch() { return chromium.launch(); }
// build: katalog med hazey-theme8.css/min.js, eller null = extern (ingen injektion)
export async function open(b, w, route, { build = path.join(ROOT, "dist/theme8"), reduced = true, query = "" } = {}) {
  const m = w < 768;
  const ctx = await b.newContext({ viewport: { width: w, height: H[w] || 900 }, deviceScaleFactor: m ? 2 : 1, isMobile: m, hasTouch: m, userAgent: m ? undefined : UA, reducedMotion: reduced ? "reduce" : "no-preference" });
  if (build) {
    await ctx.route(/theme8\/hazey-theme8\.css/, r => r.fulfill({ path: path.join(build, "hazey-theme8.css"), contentType: "text/css" }));
    await ctx.route(/theme8\/hazey-theme8\.min\.js/, r => r.fulfill({ path: path.join(build, "hazey-theme8.min.js"), contentType: "application/javascript" }));
    await ctx.route(/github\.io\/hazey-storefront\/theme8\/assets\/([^?]+)/, r => { const f = path.join(ROOT, "theme8/assets", decodeURIComponent(new URL(r.request().url()).pathname.split("/theme8/assets/")[1])); return fs.existsSync(f) ? r.fulfill({ path: f }) : r.fulfill({ status: 404 }); });
  }
  const p = await ctx.newPage(); p.errs = [];
  p.on("pageerror", e => p.errs.push(String(e).slice(0, 160)));
  p.on("console", mm => { if (mm.type() === "error" && !/recaptcha|trustpilot|favicon|Failed to load|requestStorageAccess/i.test(mm.text())) p.errs.push(mm.text().slice(0, 160)); });
  const sep = route.includes("?") ? "&" : "?";
  await p.goto(`https://hazeyse.nyehandel.se${route}${sep}preview=v9kzdmqz4w60l5n${query}`, { waitUntil: "domcontentloaded", timeout: 120000 });
  await p.waitForFunction(() => document.documentElement.classList.contains("hz8"), null, { timeout: 90000 });
  try { await p.getByRole("button", { name: "Godkänn alla" }).click({ timeout: 4000 }); } catch {}
  return { p, ctx };
}
// Vänta tills portalens union-grid är klar (eller timeout).
export async function settle(p, ms = 3000) {
  try { await p.waitForFunction(() => !document.querySelector("#store-main [aria-busy='true']") && (document.querySelector(".hz8-series-results .product-card") || !document.documentElement.classList.contains("hz8-cat-portal")), null, { timeout: 60000 }); } catch {}
  await p.waitForTimeout(ms);
}
export async function scrollAll(p) {
  await p.evaluate(async () => { for (let y = 0; y < document.documentElement.scrollHeight; y += 500) { scrollTo({ top: y, behavior: "instant" }); await new Promise(r => setTimeout(r, 90)); } scrollTo({ top: 0, behavior: "instant" }); });
}
