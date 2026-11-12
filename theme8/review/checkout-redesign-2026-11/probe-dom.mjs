// Ren nativ kassa (393 + 1440): DOM-utdrag, positioner, tabbordning, reading-flow-stöd.
import fs from "node:fs"; import path from "node:path";
import { chromium, filledCheckout, emptyCart, stripThemeCheckout } from "./lib.mjs";
const DIR = path.dirname(new URL(import.meta.url).pathname);
const b = await chromium.launch(); const out = {};
for (const w of [393, 1440]) {
  const { ctx, p } = await filledCheckout(b, w); const R = out[w] = {};
  R.stripped = await stripThemeCheckout(p); await p.waitForTimeout(800);
  if (w === 393) R.html = await p.evaluate(() => (document.querySelector("header.checkout")?.outerHTML || "") + "\n" + document.querySelector("main.checkout").outerHTML.replace(/<script[\s\S]*?<\/script>/g, "").replace(/<iframe[\s\S]*?<\/iframe>/g, "<iframe/>").replace(/<svg[\s\S]*?<\/svg>/g, "<svg/>").replace(/ data-v-[a-z0-9]+=""/g, "").replace(/<!---->/g, "").replace(/src="[^"]{60,}"/g, 'src="…"'));
  R.layout = await p.evaluate(() => { const l = document.querySelector(".checkout-layout"); const cs = getComputedStyle(l); return { display: cs.display, dir: cs.flexDirection, wrap: cs.flexWrap }; });
  R.rects = await p.evaluate(() => { const q = s => { const e = document.querySelector(s); if (!e) return null; const r = e.getBoundingClientRect(); return { y: Math.round(r.top + scrollY), h: Math.round(r.height) }; };
    return { header: q("header.checkout"), items: q(".checkout-items-summary .section.items"), total: q(".checkout-total"), coupon: q(".coupon-code"), kustom: q("#kustom-checkout"), columns: q(".checkout-information > .columns"), shipping: q(".shipping"), docH: document.documentElement.scrollHeight }; });
  await p.evaluate(() => { scrollTo(0, 0); document.activeElement?.blur(); });
  const seq = [];
  for (let i = 0; i < 18; i++) {
    await p.keyboard.press("Tab"); await p.waitForTimeout(250);
    const a = await p.evaluate(() => { const e = document.activeElement; const r = e.getBoundingClientRect(); return { t: (e.getAttribute("aria-label") || e.textContent || e.id || e.tagName).replace(/\s+/g, " ").trim().slice(0, 24), tag: e.tagName, y: Math.round(r.top + scrollY) }; });
    seq.push(a.t + "@" + a.y);
    if (a.tag === "IFRAME" && /checkout/.test(a.t)) { await p.evaluate(() => { const f = document.querySelector("#kustom-checkout"); const all = [...document.querySelectorAll("a[href],button,input,select,[tabindex]:not([tabindex='-1'])")].filter(x => !f.contains(x) && (f.compareDocumentPosition(x) & 4) && x.getClientRects().length); (all[0] || document.body).focus(); }); seq.push("(förbi Kustom)"); }
  }
  R.tab = seq.join(" → ");
  await p.evaluate(() => scrollTo(0, 0));
  await p.screenshot({ path: path.join(DIR, `shots/pure-native-${w}-fold.png`) });
  await p.screenshot({ path: path.join(DIR, `shots/pure-native-${w}-full.png`), fullPage: true });
  await emptyCart(p); await ctx.close();
}
fs.writeFileSync(path.join(DIR, "runs/pure-native.json"), JSON.stringify(out, null, 1));
for (const [w, R] of Object.entries(out)) console.log("\n=====", w, "strippade regler", R.stripped, JSON.stringify(R.layout), "\n", JSON.stringify(R.rects), "\nTAB:", R.tab);
await b.close();
