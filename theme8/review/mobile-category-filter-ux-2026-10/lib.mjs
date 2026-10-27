// TASK 01E harness (kopia av TASK 01D:s lib.mjs; T01E_BASE = HEAD-build). TASK 01C harness (kopia av TASK 01:s lib.mjs, utökad med rutter och
// T01C_BASE). TASK 01 harness: extern Theme 8-preview, men dokumentets inklistrade
// dev-loader byts mot en lokal loaderfil och CSS/JS levereras från en
// lokal build. Gör det möjligt att jämföra före (HEAD) och efter
// (arbetskopia) med identiska förutsättningar, inklusive fördröjning
// och fel i CSS/JS. Inget skrivs till Nyehandel.
import { chromium } from "playwright"; import fs from "node:fs"; import path from "node:path";
export const DIR = path.dirname(new URL(import.meta.url).pathname);
export const ROOT = path.resolve(DIR, "../../..");
export const PREVIEW = "v9kzdmqz4w60l5n";
export const SCRATCH = process.env.T01E_BASE || "";
export const BUILDS = {
  before: { build: path.join(SCRATCH, "dist/theme8"), loader: path.join(SCRATCH, "theme8/blocks/loader-theme8-dev.html") },
  after: { build: path.join(ROOT, "dist/theme8"), loader: path.join(ROOT, "theme8/blocks/loader-theme8-dev.html") }
};
export const ROUTES = {
  home: "/",
  "alla-produkter": "/sv/categories/alla-produkter",
  "alla-vapes": "/sv/categories/alla-vapes",
  hasch: "/sv/categories/hasch",
  "magic-sauce": "/sv/categories/magic-sauce",
  "m-s-vapes": "/sv/categories/m-s-vapes",
  "ms-carts": "/sv/categories/alla-cartridges?filters=Serie_Magic+Sauce",
  pdp: "/sv/products/vape-thcx-19-core-2ml",
  // TASK 01D: de fyra hz8-cat-pilot-familjerna (live-routes ur HZ8.catalog,
  // runs/routes-probe.json), deras filtrerade lägen och regressionssidor.
  "alla-vapes-f": "/sv/categories/alla-vapes?filters=Serie_Core",
  buds: "/sv/categories/blommor-buds",
  "buds-f": "/sv/categories/blommor-buds?filters=Serie_Magic+Sauce",
  "hasch-f": "/sv/categories/hasch?filters=Serie_Magic+Sauce",
  "alla-produkter-sq": "/sv/categories/alla-produkter?typ=vapes&q=core",
  "thcab-vapes": "/sv/categories/thca-vapes"
};
export const url = p => `https://hazeyse.nyehandel.se${p}${p.includes("?") ? "&" : "?"}preview=${PREVIEW}`;
const UA = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36";
const LOADER_RE = /<!-- Theme 8 development loader[\s\S]*?<\/script>/;
const sleep = ms => new Promise(r => setTimeout(r, ms));

/* opts: which = before|after, cssDelay/jsDelay (ms), cssFail/jsFail
   ("abort" = nätverksfel, "syntax" = JS som kastar vid parse,
   "hang" = svarar aldrig). */
export async function ctxFor(browser, w, h, opts = {}) {
  const { which = "after", cssDelay = 0, jsDelay = 0, cssFail, jsFail } = opts;
  // TASK 01C: zoom (200 % = halverad CSS-viewport, DPR 2, desktop-UA).
  const m = opts.zoom ? false : w < 768;
  const ctx = await browser.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: opts.zoom || (m ? 2 : 1), isMobile: m, hasTouch: m, userAgent: m ? undefined : UA });
  // "external": ingen interception alls -- Nyehandels riktiga HTML med
  // loadern som just nu ligger i admin + publicerade GitHub Pages-filer.
  if (which === "external") { ctx.stats = { docRewritten: 0 }; return ctx; }
  const B = BUILDS[which];
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
    // TASK 01C: giltig JS som aldrig bootar Theme 8 (loaderns 100 ms-kontroll).
    if (jsFail === "never-boots") return r.fulfill({ body: "window.__hz8NeverBoots = 1;", contentType: "application/javascript" });
    // TASK 01C: bundlen bootar men beredskapen blir aldrig uppfylld (en
    // permanent synlig väntemarkör) -- bootstrapens tak måste släppa masken.
    if (jsFail === "never-ready") return r.fulfill({ body: fs.readFileSync(path.join(B.build, "hazey-theme8.min.js"), "utf8") + ';(function(){var d=document.createElement("div");d.className="is-loading";d.setAttribute("data-t01c-fixture","");d.style.cssText="position:fixed;top:40%;left:40%;width:40px;height:40px;";document.body.appendChild(d);})();', contentType: "application/javascript" });
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
