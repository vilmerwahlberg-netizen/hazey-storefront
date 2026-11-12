// Ny Theme 8-kassa (John Henric-struktur) i den riktiga fyllda kassan i Theme 8-förhandsvisningen.
// Korg: Magic Sauce 3.0 2 ml 3-pack blandat (2 × Gorilla Cookies, 1 × Tinky Winky) + 1 st Gorilla Cookies.
// Gamla kassablocket i CSS-fältet plockas bort i webbläsaren och ersätts med dist/theme8/hazey-theme8-checkout.css
// (samma fil som ska klistras in). Ingenting skrivs till Nyehandel. Ingen order läggs. Korgen töms efteråt.
import fs from "node:fs"; import path from "node:path";
import { chromium, filledCheckout, emptyCart, stripThemeCheckout, css, ROOT } from "./lib.mjs";
const DIR = path.dirname(new URL(import.meta.url).pathname);
const CSS = fs.readFileSync(path.join(ROOT, "dist/theme8/hazey-theme8-checkout.css"), "utf8");
const H = { 393: 852, 768: 1024, 1440: 900, 1920: 1080 };
const WIDTHS = (process.env.WIDTHS || "393,768,1440,1920").split(",").map(Number);
const b = await chromium.launch(); const out = {};
for (const w of WIDTHS) {
  const { ctx, p, cart } = await filledCheckout(b, w); const h = H[w]; await p.setViewportSize({ width: w, height: h });
  const R = out[w] = { cart };
  try {
    R.stripped = await stripThemeCheckout(p); await css(p, CSS); await p.waitForTimeout(1500);
    R.page = await p.evaluate(() => {
      const vis = e => !!e && e.getClientRects().length > 0 && getComputedStyle(e).visibility !== "hidden";
      const y = s => { const e = document.querySelector(s); if (!vis(e)) return null; return Math.round(e.getBoundingClientRect().top + scrollY); };
      const items = [...document.querySelectorAll(".checkout-items-summary article.item")].map(a => ({
        name: (getComputedStyle(a.querySelector(".content a > strong"), "::after").content.replace(/^"|"$/g, "").replace(/^none$/, "") || a.querySelector(".content a > strong").innerText).replace(/\s+/g, " ").trim(),
        parts: [...a.querySelectorAll(".item__package__items > div")].map(d => d.innerText.replace(/\s+/g, " ").trim()),
        option: a.querySelector(".content > div > .option")?.innerText.replace(/\s+/g, " ").trim() || null,
        qty: a.querySelector(".amount-input .input")?.value, total: a.querySelector(".total")?.innerText.trim(),
        qtyVisible: vis(a.querySelector(".amount-input .input")), totalVisible: vis(a.querySelector(".total")) }));
      const rows = [...document.querySelectorAll(".checkout-items-summary .totals .row")].map(r => r.innerText.replace(/\s+/g, " ").trim());
      return { items, rows, total: document.querySelector(".checkout-total")?.innerText.trim(),
        y: { firstItem: y(".checkout-items-summary article.item"), secondItem: y(".checkout-items-summary article.item + article.item"), total: y(".checkout-total"), coupon: y("#coupon_code"), country: y(".country-select select"), kustom: y("#kustom-checkout") },
        couponVisible: vis(document.getElementById("coupon_code")), docH: document.documentElement.scrollHeight, overflowX: document.documentElement.scrollWidth - innerWidth,
        wideEls: [...document.querySelectorAll("body *")].filter(e => { const r = e.getBoundingClientRect(); return r.width && (r.right > innerWidth + 1 || r.left < -1) && getComputedStyle(e).position !== "fixed" && vis(e); }).slice(0, 5).map(e => e.className || e.tagName) };
    });
    R.page.inFold = Object.fromEntries(["secondItem", "total", "coupon"].map(k => [k, R.page.y[k] != null && R.page.y[k] < h]));
    const kf = await (await p.$("#klarna-checkout-iframe")).contentFrame();
    R.kustomText = (await kf.evaluate(() => document.body.innerText)).replace(/\s+/g, " ");
    R.kustomTotal = (R.kustomText.match(/(\d{1,3}(?:[  ]\d{3})*(?:,\d+)?)\s*kr/g) || []).map(s => s.replace(/\s/g, " "));
    R.totalMatches = R.kustomTotal.some(t => t.replace(/\D/g, "") === (R.page.total || "").replace(/\D/g, ""));

    await p.evaluate(() => scrollTo(0, 0)); await p.waitForTimeout(500);
    await p.screenshot({ path: path.join(DIR, `shots/new-${w}-fold.png`) });
    await p.setViewportSize({ width: w, height: Math.min(R.page.docH, 4000) }); await p.waitForTimeout(2500);
    await p.screenshot({ path: path.join(DIR, `shots/new-${w}-full.png`) });
    await p.setViewportSize({ width: w, height: h }); await p.waitForTimeout(800);

    // Fokus: Tab från toppen. Kustoms ram hoppas över (dess innehåll äger Kustom).
    await p.evaluate(() => { scrollTo(0, 0); document.activeElement?.blur(); }); const seq = [];
    for (let i = 0; i < 16; i++) {
      await p.keyboard.press("Tab"); await p.waitForTimeout(700);
      const a = await p.evaluate(() => { const e = document.activeElement; const r = e.getBoundingClientRect(); const cs = getComputedStyle(e);
        return { t: (e.getAttribute("aria-label") || e.innerText || e.id || e.tagName).replace(/\s+/g, " ").trim().slice(0, 26), tag: e.tagName,
          inView: r.bottom > 0 && r.top < innerHeight && r.left >= -1 && r.right <= innerWidth + 1, ring: cs.outlineStyle !== "none" && parseFloat(cs.outlineWidth) > 0 }; });
      seq.push(a);
      if (a.tag === "IFRAME") { await p.evaluate(() => { const f = document.querySelector("#kustom-checkout"); const all = [...document.querySelectorAll("a[href],button:not([disabled]),input,select,[tabindex]:not([tabindex='-1'])")].filter(x => !f.contains(x) && (f.compareDocumentPosition(x) & 4) && x.getClientRects().length && x.tabIndex >= 0); (all[0] || document.body).focus({ focusVisible: true }); }); a.t += " (Kustom, hoppas förbi)"; }
      if (a.tag === "BODY") break;
    }
    R.tab = seq; R.tabProblems = seq.filter(a => a.tag !== "IFRAME" && a.tag !== "BODY" && (!a.inView || !a.ring)).map(a => a.t);

    // Ogiltig rabattkod via tangentbord (påverkar inte korgen).
    await p.locator("#coupon_code").focus(); await p.keyboard.type("HZTEST"); await p.keyboard.press("Tab"); await p.keyboard.press("Enter"); await p.waitForTimeout(3500);
    R.coupon = await p.evaluate(() => document.querySelector(".coupon-code")?.innerText.replace(/\s+/g, " ").trim());
    R.couponTotalAfter = await p.evaluate(() => document.querySelector(".checkout-total")?.innerText.trim());
    const box = await p.locator(".checkout-items-summary").boundingBox();
    await p.screenshot({ path: path.join(DIR, `shots/new-${w}-coupon.png`), fullPage: true, clip: { x: box.x, y: box.y, width: box.width, height: Math.min(1000, box.height + 8) } });
    await p.fill("#coupon_code", ""); await p.waitForTimeout(500);
  } catch (e) { R.error = String(e); console.error(w, e); }
  R.cleaned = await emptyCart(p); await ctx.close();
}
fs.writeFileSync(path.join(DIR, `runs/verify-${WIDTHS.join("-")}.json`), JSON.stringify(out, null, 1));
for (const [w, R] of Object.entries(out)) {
  console.log(`\n== ${w}  korg:`, R.cart, " strippade:", R.stripped, " tömd:", R.cleaned, R.error || "");
  if (!R.page) continue;
  for (const it of R.page.items) console.log("  vara:", it.name, "|", it.parts.join(" / ") || it.option, "| antal", it.qty, it.qtyVisible, "|", it.total);
  console.log("  rader:", R.page.rows.join(" · "));
  console.log("  y:", JSON.stringify(R.page.y), "fold:", JSON.stringify(R.page.inFold), "docH", R.page.docH, "overflowX", R.page.overflowX, R.page.wideEls);
  console.log("  Kustom-belopp:", R.kustomTotal.join(", "), "→ matchar total:", R.totalMatches);
  console.log("  tab:", R.tab.map(a => a.t + (a.inView ? "" : "[UTANFÖR]") + (a.ring || a.tag === "IFRAME" ? "" : "[INGEN RING]")).join(" → "));
  console.log("  rabattkod:", R.coupon, "| total efter:", R.couponTotalAfter);
}
await b.close();
