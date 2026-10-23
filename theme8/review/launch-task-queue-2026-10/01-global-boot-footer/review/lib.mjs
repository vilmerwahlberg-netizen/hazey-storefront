// TASK 01 harness: extern Theme 8-preview, men dokumentets inklistrade
// dev-loader byts mot en lokal loaderfil och CSS/JS levereras från en
// lokal build. Gör det möjligt att jämföra före (HEAD) och efter
// (arbetskopia) med identiska förutsättningar, inklusive fördröjning
// och fel i CSS/JS. Inget skrivs till Nyehandel.
import { chromium } from "playwright"; import fs from "node:fs"; import path from "node:path";
export const DIR = path.dirname(new URL(import.meta.url).pathname);
export const ROOT = path.resolve(DIR, "../../../../..");
export const PREVIEW = "v9kzdmqz4w60l5n";
export const SCRATCH = process.env.T01_BASE || "";
export const BUILDS = {
  before: { build: path.join(SCRATCH, "dist/theme8"), loader: path.join(SCRATCH, "theme8/blocks/loader-theme8-dev.html") },
  after: { build: path.join(ROOT, "dist/theme8"), loader: path.join(ROOT, "theme8/blocks/loader-theme8-dev.html") }
};
export const ROUTES = {
  home: "/",
  "alla-vapes": "/sv/categories/alla-vapes",
  "magic-sauce": "/sv/categories/magic-sauce",
  "m-s-vapes": "/sv/categories/m-s-vapes",
  "pdp-core": "/sv/products/vape-thcx-19-core-2ml",
  "pdp-faraoh": "/sv/products/vape-thc-a-45-faraoh-2ml/133",
  checkout: "/sv/checkout"
};
// Extra kontrollvägar (ingår inte i standardmatrisen).
export const EXTRA = { hasch: "/sv/categories/hasch", buds: "/sv/categories/blommor-buds" };
export const url = p => `https://hazeyse.nyehandel.se${p}${p.includes("?") ? "&" : "?"}preview=${PREVIEW}`;
const UA = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36";
const LOADER_RE = /<!-- Theme 8 development loader[\s\S]*?<\/script>/;
const sleep = ms => new Promise(r => setTimeout(r, ms));

/* opts: which = before|after, cssDelay/jsDelay (ms), cssFail/jsFail
   ("abort" = nätverksfel, "syntax" = JS som kastar vid parse,
   "hang" = svarar aldrig). */
export async function ctxFor(browser, w, h, opts = {}) {
  const { which = "after", cssDelay = 0, jsDelay = 0, cssFail, jsFail } = opts;
  const B = BUILDS[which];
  const m = w < 768;
  const ctx = await browser.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: m ? 2 : 1, isMobile: m, hasTouch: m, userAgent: m ? undefined : UA });
  const loader = fs.readFileSync(B.loader, "utf8").trim();
  ctx.stats = { docRewritten: 0 };
  await ctx.route(/hazeyse\.nyehandel\.se\/.*preview=/, async r => {
    if (r.request().resourceType() !== "document") return r.continue();
    let res; for (let i = 0; ; i++) { try { res = await r.fetch(); break; } catch (e) { if (i > 3) throw e; await sleep(4000); } }
    const body = await res.text();
    if (!LOADER_RE.test(body)) return r.fulfill({ response: res, body });
    ctx.stats.docRewritten++;
    return r.fulfill({ response: res, body: body.replace(LOADER_RE, () => loader) });
  });
  await ctx.route(/theme8\/hazey-theme8\.css/, async r => {
    if (cssFail === "hang") return; if (cssDelay) await sleep(cssDelay);
    if (cssFail === "abort") return r.abort("failed");
    return r.fulfill({ path: path.join(B.build, "hazey-theme8.css"), contentType: "text/css" });
  });
  await ctx.route(/theme8\/hazey-theme8\.min\.js/, async r => {
    if (jsFail === "hang") return; if (jsDelay) await sleep(jsDelay);
    if (jsFail === "abort") return r.abort("failed");
    if (jsFail === "syntax") return r.fulfill({ body: "this is not javascript (", contentType: "application/javascript" });
    return r.fulfill({ path: path.join(B.build, "hazey-theme8.min.js"), contentType: "application/javascript" });
  });
  await ctx.route(/github\.io\/hazey-storefront\/theme8\/assets\/([^?]+)/, r => {
    const f = path.join(ROOT, "theme8/assets", decodeURIComponent(new URL(r.request().url()).pathname.split("/assets/")[1]));
    return fs.existsSync(f) ? r.fulfill({ path: f }) : r.continue();
  });
  return ctx;
}

/* Tidslinje i sidan: varje animationsram loggas med maskens tillstånd,
   html.hz8, body-synlighet och om Theme 8-CSS:en är tillämpad. "Gammal
   sida synlig" = body målas (synlig + opacitet > 0) utan att Theme 8 är
   redo (html.hz8 saknas). */
export const TIMELINE = () => {
  const t0 = performance.now(); const log = []; window.__t01 = log;
  const tick = () => {
    const h = document.documentElement, b = document.body;
    if (b) {
      const cs = getComputedStyle(b);
      const css = !!document.querySelector("link[data-hz8-dev-css]") && getComputedStyle(h).getPropertyValue("--hz8-olive").trim() !== "";
      const painted = cs.visibility !== "hidden" && parseFloat(cs.opacity) > 0;
      log.push({ ep: performance.timeOrigin + performance.now(), t: Math.round(performance.now() - t0), boot: h.classList.contains("hz8-boot"), hz8: h.classList.contains("hz8"), painted, css, legacy: !!document.querySelector("footer.nh-footer, .nh-card-buy") });
    }
    if (performance.now() - t0 < 20000) requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
};

export async function open(ctx, route, { timeline = false, frames = false, before = null } = {}) {
  const p = await ctx.newPage(); const errors = [];
  if (before) await before(p);
  p.on("pageerror", e => errors.push(String(e))); p.on("console", m => { if (m.type() === "error") errors.push(m.text()); });
  if (timeline) await p.addInitScript(TIMELINE);
  let shots = null;
  if (frames) {
    shots = []; const cdp = await ctx.newCDPSession(p); const t0 = Date.now();
    cdp.on("Page.screencastFrame", f => { shots.push({ t: Date.now() - t0, ep: f.metadata.timestamp * 1000, data: f.data }); cdp.send("Page.screencastFrameAck", { sessionId: f.sessionId }).catch(() => {}); });
    await cdp.send("Page.startScreencast", { format: "png", maxWidth: 520, maxHeight: 1200, everyNthFrame: 1 });
    p.stopFrames = () => cdp.send("Page.stopScreencast").catch(() => {});
  }
  for (let i = 0; ; i++) {
    try { await p.goto(url(route), { waitUntil: "domcontentloaded", timeout: 60000 }); break; }
    catch (e) { if (i >= 3) throw e; await p.waitForTimeout(8000 * (i + 1)); }
  }
  p.errors = errors; p.shots = shots; return p;
}
export async function acceptCookies(p) { try { await p.getByRole("button", { name: "Godkänn alla" }).click({ timeout: 4000 }); } catch {} }
export async function ready(p, extra = 4000) {
  // Kassan kör inte Theme 8-loadern (se build-theme8.js) -- inget att vänta på.
  const hasLoader = await p.evaluate(() => !!document.querySelector("link[data-hz8-dev-css]")).catch(() => false);
  if (!hasLoader) { await p.waitForTimeout(3000); await acceptCookies(p); await p.waitForTimeout(extra); return; }
  await p.waitForFunction(() => document.documentElement.classList.contains("hz8") && !document.documentElement.classList.contains("hz8-boot"), null, { timeout: 60000 }).catch(() => {});
  await acceptCookies(p); await p.waitForTimeout(extra);
}
export { chromium, sleep };
