// Tabbordning i koncept A/B (393 + 1440). DOM-ordningen är orörd; mäter faktisk ordning och om fokus syns.
import fs from "node:fs"; import path from "node:path";
import { chromium, filledCheckout, emptyCart, stripThemeCheckout, css, ROOT } from "./lib.mjs";
const DIR = path.dirname(new URL(import.meta.url).pathname); const rd = f => fs.readFileSync(f, "utf8");
const dist = rd(path.join(ROOT, "dist/theme8/hazey-theme8-checkout.css"));
const BASE = rd(path.join(ROOT, "theme8/css/00-foundation.css")) + dist.slice(dist.indexOf("/* GENERERAD av build-theme8.js"));
const b = await chromium.launch(); const out = {};
for (const w of [393, 1440]) {
  const { ctx, p, h } = await filledCheckout(b, w); await stripThemeCheckout(p);
  for (const k of ["A-kvittot.css", "B-olivramen.css"]) {
    await css(p, BASE + rd(path.join(DIR, "concepts/shared.css")) + rd(path.join(DIR, "concepts", k)));
    await p.evaluate(() => { scrollTo(0, 0); document.querySelector(".checkout-back a").focus(); });
    const seq = ["Gå tillbaka"]; let hidden = 0;
    for (let i = 0; i < 20; i++) {
      await p.keyboard.press("Tab"); await p.waitForTimeout(700);
      const a = await p.evaluate(() => { const e = document.activeElement; const r = e.getBoundingClientRect(); return { t: (e.getAttribute("aria-label") || e.textContent || e.id || e.tagName).replace(/\s+/g, " ").trim().slice(0, 22), tag: e.tagName, id: e.id, vis: r.bottom > 0 && r.top < innerHeight }; });
      if (!a.vis && a.id !== "klarna-fullscreen-iframe") hidden++;
      seq.push(a.t + (a.vis ? "" : "(utanför bild)"));
      if (a.id === "klarna-checkout-iframe") { await p.evaluate(() => { const f = document.querySelector("#kustom-checkout"); const all = [...document.querySelectorAll("a[href],button,input,select,[tabindex]:not([tabindex='-1'])")].filter(x => !f.contains(x) && (f.compareDocumentPosition(x) & 4) && x.getClientRects().length); (all[0] || document.body).focus(); }); seq.push("(Kustoms fält)"); }
      if (a.id === "coupon_code") break;
    }
    out[w + " " + k] = { order: seq.join(" → "), hidden };
  }
  await emptyCart(p); await ctx.close();
}
fs.writeFileSync(path.join(DIR, "runs/tab-concepts.json"), JSON.stringify(out, null, 1));
console.log(JSON.stringify(out, null, 1)); await b.close();
