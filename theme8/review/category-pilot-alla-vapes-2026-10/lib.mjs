// Delad Playwright-hjälp: extern Theme 8-preview med lokal build injicerad.
import { chromium } from "playwright"; import fs from "node:fs"; import path from "node:path";
export const DIR = path.dirname(new URL(import.meta.url).pathname);
export const ROOT = path.resolve(DIR, "../../..");
export const PREVIEW = "v9kzdmqz4w60l5n";
export const URL_ = (p = "/sv/categories/alla-vapes", q = "") => `https://hazeyse.nyehandel.se${p}?preview=${PREVIEW}${q ? "&" + q : ""}`;
const UA = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36";
export async function ctxFor(browser, w, h, { local = true, build = path.join(ROOT, "dist/theme8"), reduced = false, scale } = {}) {
  const m = w < 768;
  const ctx = await browser.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: scale || (m ? 2 : 1), isMobile: m, hasTouch: m, userAgent: m ? undefined : UA, reducedMotion: reduced ? "reduce" : "no-preference" });
  if (local) {
    await ctx.route(/theme8\/hazey-theme8\.css/, r => r.fulfill({ path: path.join(build, "hazey-theme8.css"), contentType: "text/css" }));
    await ctx.route(/theme8\/hazey-theme8\.min\.js/, r => r.fulfill({ path: path.join(build, "hazey-theme8.min.js"), contentType: "application/javascript" }));
    await ctx.route(/github\.io\/hazey-storefront\/theme8\/assets\/([^?]+)/, r => { const f = path.join(ROOT, "theme8/assets", decodeURIComponent(new URL(r.request().url()).pathname.split("/assets/")[1])); return fs.existsSync(f) ? r.fulfill({ path: f }) : r.continue(); });
  }
  return ctx;
}
export async function open(ctx, url) {
  const p = await ctx.newPage(); const errors = [];
  p.on("pageerror", e => errors.push(String(e))); p.on("console", m => { if (m.type() === "error") errors.push(m.text()); });
  for (let i = 0; ; i++) {
    try { await p.goto(url, { waitUntil: "domcontentloaded", timeout: 60000 }); break; }
    catch (e) { if (i >= 3) throw e; await p.waitForTimeout(8000 * (i + 1)); }
  }
  try { await p.getByRole("button", { name: "Godkänn alla" }).click({ timeout: 5000 }); } catch {}
  p.errors = errors; return p;
}
export { chromium };
