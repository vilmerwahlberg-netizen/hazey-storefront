// Funktionstest utan order: minicart->kassa, variant, totalsumma mot Kustom,
// antal +/- (bara sessionskorgen), ogiltig rabattkod, tangentbord, överflöd.
import { chromium, injectCheckoutCss } from "./lib.mjs"; import { toCheckout } from "./flow.mjs"; import fs from "node:fs";
const css = process.argv[2] === "none" ? null : (process.argv[2] || "dist/theme8/hazey-theme8-checkout.css");
const b = await chromium.launch(); const R = {};
const kTotal = async p => (await p.frameLocator("#klarna-checkout-iframe").locator("body").innerText()).match(/Totalbelopp\s*([\d\s ]+kr)/)?.[1].replace(/\s+/g, " ");
const nTotal = p => p.evaluate(() => document.querySelector(".checkout-total")?.textContent.trim());
for (const [w, h] of [[1440, 900], [768, 1024], [393, 852]]) {
  const { ctx, p, mini } = await toCheckout(b, w, h); await injectCheckoutCss(p, css);
  const r = R[w] = {};
  r.miniVariant = /Strain: Gorilla Cookies/.test(mini); r.checkoutVariant = await p.evaluate(() => document.querySelector(".checkout-items-summary .option")?.textContent.replace(/\s+/g, " ").trim());
  r.total = await nTotal(p); r.kustomTotal = await kTotal(p); r.shipping = await p.evaluate(() => [...document.querySelectorAll(".totals .row")].map(x => x.textContent.replace(/\s+/g, " ").trim()));
  r.overflowX = await p.evaluate(() => document.documentElement.scrollWidth - innerWidth);
  // Tangentbord: Tab från toppen
  await p.evaluate(() => { scrollTo(0, 0); document.activeElement?.blur(); }); await p.mouse.click(5, h - 5).catch(() => {});
  await p.evaluate(() => document.body.focus());
  const seq = [];
  for (let i = 0; i < 22; i++) {
    await p.keyboard.press("Tab");
    const a = await p.evaluate(() => { const e = document.activeElement; const b = e.getBoundingClientRect(); return { t: (e.getAttribute("aria-label") || e.textContent || e.id || e.tagName).replace(/\s+/g, " ").trim().slice(0, 32), tag: e.tagName, y: Math.round(b.top + scrollY), vis: b.bottom > 0 && b.top < innerHeight }; });
    seq.push(a); if (a.tag === "IFRAME") { /* inne i Kustom: hoppa ur med fokus efter ramen */ await p.evaluate(() => { const items = document.querySelector(".checkout-items-summary a"); items && items.focus(); }); seq.push({ t: "(hoppar förbi Kustoms egna fält)" }); }
  }
  r.tab = seq.map(s => s.t + (s.y != null ? "@" + s.y + (s.vis ? "" : "!") : "")).join(" → ");
  // Antal +1 och tillbaka
  await p.getByRole("button", { name: "Öka antalet" }).first().click(); await p.waitForTimeout(5000);
  r.afterPlus = { total: await nTotal(p), kustom: await kTotal(p) };
  await p.getByRole("button", { name: "Minska antalet" }).first().click(); await p.waitForTimeout(5000);
  r.afterMinus = { total: await nTotal(p), kustom: await kTotal(p) };
  // Ogiltig rabattkod via tangentbord
  const inp = p.locator("#coupon_code"); r.couponVisible = await inp.isVisible();
  if (r.couponVisible) { await inp.focus(); await p.keyboard.type("HZTEST18"); await p.keyboard.press("Tab"); r.couponBtnFocused = await p.evaluate(() => document.activeElement.getAttribute("aria-label")); await p.keyboard.press("Enter"); await p.waitForTimeout(3500);
    r.couponMsg = await p.evaluate(() => document.querySelector(".coupon-code")?.innerText.replace(/\s+/g, " ").trim()); r.totalAfterCoupon = await nTotal(p);
    await p.screenshot({ path: `theme8/review/checkout-task18-2026-11/after/${w}-coupon-invalid.png`, clip: await p.locator(".coupon-code").boundingBox().then(bb => ({ x: 0, y: Math.max(0, bb.y - 260), width: w, height: Math.min(h, bb.height + 320) })) }).catch(() => {}); }
  r.errors = p.errors.slice(0, 5);
  console.log(w, JSON.stringify(r, null, 1)); await ctx.close();
}
fs.writeFileSync(`theme8/review/checkout-task18-2026-11/runs/tests-${css ? "after" : "native"}.json`, JSON.stringify(R, null, 1)); await b.close();
