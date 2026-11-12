// Nativ kassa (ingen Theme 8-kassa-CSS) med samma korg: DOM-ordning, tabbordning, positioner. 393 + 1440.
import fs from "node:fs"; import path from "node:path";
import { chromium, filledCheckout, emptyCart } from "./lib.mjs";
const DIR = path.dirname(new URL(import.meta.url).pathname);
const b = await chromium.launch(); const out = {};
for (const w of [393, 1440]) {
  const { ctx, p, cart, h } = await filledCheckout(b, w);
  const R = out[w] = { cart };
  R.readingFlow = await p.evaluate(() => CSS.supports("reading-flow", "grid-order"));
  R.ua = await p.evaluate(() => navigator.userAgent.match(/Chrome\/[\d.]+/)?.[0]);
  R.outline = await p.evaluate(() => {
    const keep = e => /checkout|summary|item|coupon|shipping|payment|columns|newsletter|totals|klarna|kustom|section|layout|information|message/.test((e.className || "") + " " + e.id);
    const walk = (e, d) => [...e.children].flatMap(c => { if (["SCRIPT", "STYLE", "svg", "SVG"].includes(c.tagName)) return []; const r = c.getBoundingClientRect(); const me = keep(c) && d < 9 ? ["  ".repeat(d) + c.tagName.toLowerCase() + (c.id ? "#" + c.id : "") + (c.className && typeof c.className === "string" ? "." + c.className.trim().split(/\s+/).slice(0, 3).join(".") : "") + ` [y${Math.round(r.top + scrollY)} h${Math.round(r.height)} x${Math.round(r.left)} w${Math.round(r.width)}] ` + getComputedStyle(c).display + (getComputedStyle(c).flexDirection !== "row" ? " " + getComputedStyle(c).flexDirection : "")] : []; return d < 9 ? me.concat(walk(c, d + 1)) : me; });
    return walk(document.querySelector("main.checkout"), 0).join("\n");
  });
  R.rects = await p.evaluate(() => { const q = s => { const e = document.querySelector(s); if (!e) return null; const r = e.getBoundingClientRect(); return { y: Math.round(r.top + scrollY), h: Math.round(r.height), x: Math.round(r.left), w: Math.round(r.width) }; };
    return { firstItem: q(".checkout-items-summary article.item"), items: q(".checkout-items-summary .section.items"), total: q(".checkout-total"), coupon: q(".coupon-code"), couponInput: q("#coupon_code"), couponToggle: q(".coupon-code__toggle"), kustom: q("#kustom-checkout"), shipping: q(".shipping"), columns: q(".checkout-information > .columns"), docH: document.documentElement.scrollHeight };
  });
  R.couponToggle = await p.evaluate(() => { const t = document.querySelector(".coupon-code__toggle"); return t ? { tag: t.tagName, tabindex: t.getAttribute("tabindex"), role: t.getAttribute("role"), visible: !!t.getClientRects().length, text: t.textContent.trim() } : null; });
  // Tabbordning från toppen (hoppar förbi Kustom)
  await p.evaluate(() => { scrollTo(0, 0); document.activeElement?.blur(); });
  const seq = [];
  for (let i = 0; i < 24; i++) {
    await p.keyboard.press("Tab"); await p.waitForTimeout(250);
    const a = await p.evaluate(() => { const e = document.activeElement; const r = e.getBoundingClientRect(); return { t: (e.getAttribute("aria-label") || e.textContent || e.id || e.tagName).replace(/\s+/g, " ").trim().slice(0, 26), tag: e.tagName, y: Math.round(r.top + scrollY) }; });
    seq.push(a.t + "@" + a.y);
    if (a.tag === "IFRAME" && /checkout/.test(a.t)) { await p.evaluate(() => { const f = document.querySelector("#kustom-checkout"); const all = [...document.querySelectorAll("a[href],button,input,select,[tabindex]:not([tabindex='-1'])")].filter(x => !f.contains(x) && (f.compareDocumentPosition(x) & 4) && x.getClientRects().length); (all[0] || document.body).focus(); }); seq.push("(förbi Kustom)"); }
  }
  R.tab = seq.join(" → ");
  await p.evaluate(() => scrollTo(0, 0));
  await p.screenshot({ path: path.join(DIR, `shots/native-${w}-fold.png`) });
  await p.screenshot({ path: path.join(DIR, `shots/native-${w}-full.png`), fullPage: true });
  R.cleaned = await emptyCart(p);
  await ctx.close();
}
fs.writeFileSync(path.join(DIR, "runs/native.json"), JSON.stringify(out, null, 1));
for (const [w, R] of Object.entries(out)) console.log("\n=====", w, R.ua, "reading-flow:", R.readingFlow, "\n", R.cart, "\n", JSON.stringify(R.rects), "\n", JSON.stringify(R.couponToggle), "\nTAB:", R.tab, "\n", R.outline);
await b.close();
