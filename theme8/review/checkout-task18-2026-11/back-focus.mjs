// Tillbaka-länken: nås med Shift+Tab från första fältet, synlig fokusram, mål 44 px.
import { chromium, injectCheckoutCss } from "./lib.mjs"; import { toCheckout } from "./flow.mjs";
const b = await chromium.launch();
for (const [w, h] of [[393, 852], [1440, 900]]) {
  const { p } = await toCheckout(b, w, h); await injectCheckoutCss(p, "dist/theme8/hazey-theme8-checkout.css");
  await p.locator('select[aria-label="Jag önskar leverans till"]').focus(); await p.keyboard.press("Shift+Tab");
  const r = await p.evaluate(() => { const e = document.activeElement; const b = e.getBoundingClientRect(); return { label: e.getAttribute("aria-label"), w: Math.round(b.width), h: Math.round(b.height), x: Math.round(b.x) }; });
  await p.evaluate(() => scrollTo(0, 0)); await p.screenshot({ path: `theme8/review/checkout-task18-2026-11/after/${w}-header-back-focus.png`, clip: { x: 0, y: 0, width: w, height: 90 } });
  console.log(w, JSON.stringify(r));
}
await b.close();
