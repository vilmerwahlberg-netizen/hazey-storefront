// Series-campaign fix: captures + checks against the Theme 8 preview.
// node verify.mjs <label> <buildRoot|external> [sizes]
//   buildRoot = a folder holding dist/theme8 + theme8/assets (repo root, or
//   an exported old commit); "external" = no injection, GitHub Pages as is.
import { chromium } from "playwright"; import fs from "node:fs"; import path from "node:path";
const DIR = path.dirname(new URL(import.meta.url).pathname);
const label = process.argv[2], root = process.argv[3];
const sizes = (process.argv[4] || "393x852,430x932,768x1024,1024x768,1440x900,1920x1080,720x450@zoom").split(",");
const OUT = path.join(DIR, label); fs.mkdirSync(OUT, { recursive: true });
const UA = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36";
const URL0 = "https://hazeyse.nyehandel.se/?preview=v9kzdmqz4w60l5n";
const b = await chromium.launch(); const R = {};
for (const spec of sizes) {
  const zoom = spec.endsWith("@zoom"); const [w, h] = spec.replace("@zoom", "").split("x").map(Number);
  const m = w < 768 && !zoom; const key = zoom ? "1440@200%" : String(w);
  const ctx = await b.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: zoom || m ? 2 : 1, isMobile: m, hasTouch: m, userAgent: m ? undefined : UA, reducedMotion: "reduce" });
  if (root !== "external") {
    await ctx.route(/theme8\/hazey-theme8\.css/, r => r.fulfill({ path: path.join(root, "dist/theme8/hazey-theme8.css"), contentType: "text/css" }));
    await ctx.route(/theme8\/hazey-theme8\.min\.js/, r => r.fulfill({ path: path.join(root, "dist/theme8/hazey-theme8.min.js"), contentType: "application/javascript" }));
    await ctx.route(/github\.io\/hazey-storefront\/theme8\/assets\/([^?]+)/, r => { const f = path.join(root, "theme8/assets", decodeURIComponent(new URL(r.request().url()).pathname.split("/assets/")[1])); return fs.existsSync(f) ? r.fulfill({ path: f }) : r.continue(); });
  }
  const p = await ctx.newPage(); const errors = [];
  p.on("pageerror", e => errors.push(e.message)); p.on("console", c => { if (c.type() === "error" && !/429|Failed to load resource|trustpilot/i.test(c.text())) errors.push(c.text()); });
  for (let t = 0; t < 3; t++) { try { await p.goto(URL0, { waitUntil: "load", timeout: 60000 }); break; } catch (e) { if (t === 2) throw e; } }
  await p.waitForLoadState("networkidle", { timeout: 20000 }).catch(() => {}); try { await p.getByRole("button", { name: "Godkänn alla" }).click({ timeout: 2500 }); } catch {}
  await p.waitForTimeout(2500);
  // Scroll the page through so lazy images and reveals settle, then back.
  await p.evaluate(async () => { document.documentElement.style.scrollBehavior = "auto"; document.querySelectorAll(".hz8-home img").forEach(i => { i.loading = "eager"; }); for (let y = 0; y < document.body.scrollHeight; y += 500) { scrollTo(0, y); await new Promise(r => setTimeout(r, 60)); } scrollTo(0, 0); });
  await p.waitForFunction(() => [...document.querySelectorAll(".hz8-series img, .hz8-series-campaigns img")].every(i => i.complete && i.naturalWidth), null, { timeout: 20000 }).catch(() => {});
  await p.waitForTimeout(2500);
  R[key] = await p.evaluate(() => {
    const rect = el => { if (!el) return null; const r = el.getBoundingClientRect(); return { x: Math.round(r.left), y: Math.round(r.top + scrollY), w: Math.round(r.width), h: Math.round(r.height) }; };
    const home = document.querySelector(".hz8-home");
    const order = home ? [...home.children].filter(e => e.offsetParent || getComputedStyle(e).display !== "none").map(e => (e.className.baseVal ?? e.className).split(" ").filter(c => /^hz8-(?!home__section|reveal)/.test(c))[0] + (e.querySelector("h2") ? ":" + e.querySelector("h2").textContent.trim() : "")) : [];
    const ser = document.querySelector(".hz8-series");
    const st = el => { const c = getComputedStyle(el); return [c.fontFamily, c.fontSize, c.fontWeight, c.color, c.height, c.width, c.borderRadius, c.backgroundColor].join("|"); };
    const camp = document.querySelector(".hz8-series-campaigns");
    const cards = camp ? [...camp.querySelectorAll(".hz8-series-campaign")].map(c => {
      const img = c.querySelector(".hz8-series-campaign__img"), ir = img.getBoundingClientRect(), cr = c.getBoundingClientRect();
      const body = c.querySelector(".hz8-series-campaign__heading").getBoundingClientRect();
      return { name: c.querySelector("h3").textContent, rect: rect(c), img: rect(img), imgFullyInside: ir.top >= cr.top - 1 && ir.bottom <= cr.bottom + 1 && ir.left >= cr.left - 1 && ir.right <= cr.right + 1, headingRight: Math.round(body.right - cr.left),
        imgOk: img.naturalWidth > 0, alt: img.alt, backdropAlt: c.querySelector(".hz8-series-campaign__backdrop").getAttribute("alt"),
        links: [...c.querySelectorAll("a")].map(a => { const r = a.getBoundingClientRect(); return { text: a.textContent.trim(), href: a.getAttribute("href"), w: Math.round(r.width), h: Math.round(r.height), transition: getComputedStyle(a).transitionDuration }; }),
        text: c.querySelector(".hz8-series-campaign__text")?.textContent, imgTransition: getComputedStyle(img).transitionDuration };
    }) : null;
    return { order, h1: [...document.querySelectorAll("h1")].filter(x => x.offsetParent).length, overflow: document.documentElement.scrollWidth - innerWidth,
      series: ser && { rect: rect(ser), html: ser.outerHTML.replace(/\?preview=[^"&]+/g, ""), cards: [...ser.querySelectorAll(".hz8-series-card")].map(c => ({ r: rect(c), s: st(c), b: st(c.querySelector("b")), href: c.getAttribute("href") })) },
      products: rect(document.querySelector(".hz8-products")), campaigns: rect(camp), cards, oldCampaigns: !!document.querySelector(".hz8-campaigns"), wrongLayout: !!document.querySelector(".hz8-series2, .hz8-serie-block"),
      hrefHash: document.querySelectorAll('.hz8-home a[href="#"]').length,
      topSig: ["#store-header", ".hz8-hero", ".hz8-bestsellers"].map(s => { const e = document.querySelector(s); return e ? s + " " + JSON.stringify(rect(e)) : s + " -"; }) };
  });
  R[key].errors = errors;
  const v = R[key]; const full = async (name, y0, y1) => { await p.screenshot({ path: path.join(OUT, name), fullPage: true, clip: { x: 0, y: Math.max(0, y0), width: w, height: Math.min(y1 - y0, 6000) } }); };
  if (v.series) await full(`popular-series-${key.replace(/[@%]/g, "")}.png`, v.series.rect.y - 16, v.series.rect.y + v.series.rect.h + 8);
  if (v.series && v.products) await full(`flow-${key.replace(/[@%]/g, "")}.png`, v.series.rect.y - 16, (v.campaigns ? v.campaigns.y + v.campaigns.h : v.products.y + v.products.h) + 24);
  if (v.campaigns) await full(`campaigns-${key.replace(/[@%]/g, "")}.png`, v.campaigns.y - 16, v.campaigns.y + v.campaigns.h + 8);
  const top = v.series ? v.series.rect.y : 1500; await full(`top-${key.replace(/[@%]/g, "")}.png`, 0, top);
  // Keyboard focus: tab to the first campaign CTA and capture it.
  if (v.campaigns) {
    const ok = await p.evaluate(() => { const a = document.querySelector(".hz8-series-campaign__cta"); a.scrollIntoView({ block: "center" }); return true; });
    await p.focus(".hz8-series-campaign__cta"); await p.keyboard.press("Shift+Tab"); await p.keyboard.press("Tab");
    v.focus = await p.evaluate(() => { const a = document.activeElement; const c = getComputedStyle(a); return { cls: a.className, matches: a.matches(":focus-visible"), outline: c.outlineStyle + " " + c.outlineWidth + " " + c.outlineColor }; });
    if (key === "1440" || key === "393") await p.screenshot({ path: path.join(OUT, `focus-${key}.png`) });
  }
  await ctx.close();
}
fs.writeFileSync(path.join(OUT, "report.json"), JSON.stringify(R, null, 1));
for (const [k, v] of Object.entries(R)) console.log(k, "| order:", v.order.join(" > "), "| h1", v.h1, "ov", v.overflow, "#", v.hrefHash, "old", v.oldCampaigns, "wrong", v.wrongLayout, "err", v.errors.length, v.errors.slice(0, 2).join(";"),
  "\n   cards:", (v.cards || []).map(c => `${c.name} ${c.rect.w}x${c.rect.h} inside=${c.imgFullyInside} head→${c.headingRight} [${c.links.map(l => l.text + "→" + l.href.replace("https://hazeyse.nyehandel.se", "") + " " + l.w + "x" + l.h).join(", ")}]`).join(" ; "), "\n   focus:", JSON.stringify(v.focus || null));
await b.close();
