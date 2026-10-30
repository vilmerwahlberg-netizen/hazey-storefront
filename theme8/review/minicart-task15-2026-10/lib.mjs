// TASK 15 harness (read-only). Theme 8-preview med dokumentets dev-loader
// utbytt mot repots loader och CSS/JS från worktreens lokala build
// (origin/dev 648a551, ingen ändring). Egen sessionsvarukorg per kontext;
// ingen kassa slutförs, inget skrivs till Nyehandel-admin.
import { chromium } from "playwright"; import fs from "node:fs"; import path from "node:path";
export const DIR = path.dirname(new URL(import.meta.url).pathname);
export const ROOT = path.resolve(DIR, "../../..");
export const PREVIEW = "v9kzdmqz4w60l5n";
export const url = p => `https://hazeyse.nyehandel.se${p}${p.includes("?") ? "&" : "?"}preview=${PREVIEW}`;
const MUA = "Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Mobile Safari/537.36";
const UA = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36";
const LOADER_RE = /<!-- Theme 8 development loader[\s\S]*?<\/script>/;
const BUILD = path.join(ROOT, "dist/theme8");
const LOADER = path.join(ROOT, "theme8/blocks/loader-theme8-dev.html");
export const sleep = ms => new Promise(r => setTimeout(r, ms));

/* opts.cartFail: "abort" | "500" | "slow" -- fångar korgens skrivanrop
   (PUT/DELETE/POST /frontend-api/cart*) i webbläsaren, inget når servern. */
export async function ctxFor(browser, w, h, opts = {}) {
  const m = opts.zoom ? false : w < 768;
  const ctx = await browser.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: opts.zoom || (m ? 2 : 1), isMobile: m, hasTouch: m, userAgent: m ? MUA : UA, reducedMotion: opts.reducedMotion || "no-preference" });
  const loader = fs.readFileSync(LOADER, "utf8").trim();
  await ctx.route(/hazeyse\.nyehandel\.se\/.*preview=/, async r => {
    if (r.request().resourceType() !== "document") return r.continue();
    let res; for (let i = 0; ; i++) { try { res = await r.fetch(); break; } catch (e) { if (i > 3) throw e; await sleep(4000); } }
    const body = await res.text();
    return r.fulfill({ response: res, body: LOADER_RE.test(body) ? body.replace(LOADER_RE, () => loader) : body });
  });
  await ctx.route(/theme8\/hazey-theme8\.css/, r => r.fulfill({ path: path.join(BUILD, "hazey-theme8.css"), contentType: "text/css" }));
  await ctx.route(/theme8\/hazey-theme8\.min\.js/, r => r.fulfill({ path: path.join(BUILD, "hazey-theme8.min.js"), contentType: "application/javascript" }));
  await ctx.route(/github\.io\/hazey-storefront\/theme8\/assets\/([^?]+)/, r => {
    const f = path.join(ROOT, "theme8/assets", decodeURIComponent(new URL(r.request().url()).pathname.split("/assets/")[1]));
    return fs.existsSync(f) ? r.fulfill({ path: f }) : r.continue();
  });
  ctx.failMode = null;
  await ctx.route(/frontend-api\/cart/, async r => {
    const meth = r.request().method();
    const f = ctx.failMode;
    if (!f || meth === "GET") return r.continue();
    if (f === "abort") return r.abort("failed");
    if (f === "500") return r.fulfill({ status: 500, contentType: "application/json", body: JSON.stringify({ message: "Server Error" }) });
    if (f === "422") return r.fulfill({ status: 422, contentType: "application/json", body: JSON.stringify({ message: "The given data was invalid.", errors: { quantity: ["Otillräckligt lager"] } }) });
    if (f === "slow") { await sleep(6000); return r.continue(); }
    return r.continue();
  });
  return ctx;
}
export async function acceptCookies(p) { try { await p.getByRole("button", { name: "Godkänn alla" }).click({ timeout: 4000 }); } catch {} }
export async function open(ctx, route) {
  const p = await ctx.newPage(); const errors = [];
  p.on("pageerror", e => errors.push(String(e))); p.on("console", m => { if (m.type() === "error") errors.push(m.text().slice(0, 200)); });
  for (let i = 0; ; i++) {
    try { await p.goto(url(route), { waitUntil: "domcontentloaded", timeout: 60000 }); break; }
    catch (e) { if (i >= 3) throw e; await p.waitForTimeout(8000 * (i + 1)); }
  }
  await p.waitForFunction(() => document.documentElement.classList.contains("hz8") && !document.documentElement.classList.contains("hz8-boot"), null, { timeout: 60000 }).catch(() => {});
  await acceptCookies(p); await p.waitForTimeout(2500);
  p.errors = errors; return p;
}
/* Lägg till via Nyehandels eget frontend-API i sidans session, sedan cart/reload. */
export async function add(p, variantId, quantity = 1) {
  return p.evaluate(async ({ variantId, quantity }) => {
    const r = await fetch("/frontend-api/cart/item", { method: "POST", credentials: "same-origin", headers: HZ8.apiHeaders(), body: JSON.stringify({ product_variant_id: variantId, quantity, meta: null }) });
    const st = HZ8.store(); if (st) await st.dispatch("cart/reload");
    return r.status;
  }, { variantId, quantity });
}
export async function productState(p, productId) {
  return p.evaluate(async id => {
    const r = await fetch("/frontend-api/product/state", { method: "POST", credentials: "same-origin", headers: HZ8.apiHeaders(), body: JSON.stringify({ product_id: id, variant_ids: [null] }) });
    return r.json();
  }, productId);
}
export async function openCart(p) {
  await p.evaluate(() => { const st = HZ8.store(); if (st && st._mutations && st._mutations["cart/setOpen"]) st.commit("cart/setOpen", true); });
  const ok = await p.evaluate(() => document.querySelector("#cart-side-wrap.is-active") != null);
  if (!ok) {
    const sel = await p.evaluate(() => { const c = [...document.querySelectorAll("button,a")].find(b => /varukorg|cart/i.test((b.getAttribute("aria-label") || "") + b.className) && b.offsetParent && !b.closest("#cartAside")); if (c) { c.setAttribute("data-t15-trigger", ""); return true; } return false; });
    if (sel) await p.click("[data-t15-trigger]");
  }
  await p.waitForSelector("#cart-side-wrap.is-active", { timeout: 10000 }).catch(() => {});
  await p.waitForTimeout(1800);
}
export { chromium };
