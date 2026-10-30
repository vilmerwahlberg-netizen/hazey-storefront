// Tangentbord, Escape, fokusåterställning, scroll-lock, rerender-stabilitet,
// riktig köpväg från PDP (vad öppnas: drawer eller Nyehandels upselling-panel).
import { chromium, ctxFor, open, add, DIR } from "./lib.mjs"; import fs from "node:fs";
const b = await chromium.launch(); const R = {};
const desc = () => { const e = document.activeElement; if (!e || e === document.body) return "body"; const inCart = !!e.closest("#cartAside"); return (inCart ? "[cart] " : "[page] ") + e.tagName.toLowerCase() + (e.getAttribute("aria-label") ? ' "' + e.getAttribute("aria-label") + '"' : e.textContent ? ' "' + e.textContent.replace(/\s+/g, " ").trim().slice(0, 40) + '"' : "") + (e.className ? "." + String(e.className).split(" ")[0] : ""); };
const counts = () => { const a = document.getElementById("cartAside"); const q = s => a.querySelectorAll(s).length; return { goal: q(".hz8-goal"), count: q(".hz8-cart-count"), upgrade: q(".hz8-upgrade"), upgradeSig: [...a.querySelectorAll(".hz8-upgrade")].map(x => x.getAttribute("data-sig")), trust: q(".hz8-cart-trust"), xsell: q(".hz8-xsell"), ship: q(".hz8-cart-shipline"), items: q("article.item"), live: document.querySelectorAll("#hz8-cart-live").length, upText: [...a.querySelectorAll(".hz8-upgrade__text")].map(x => x.textContent) }; };
for (const [w, h] of [[1440, 900], [393, 852]]) {
  const ctx = await ctxFor(b, w, h); const res = {};
  const p = await open(ctx, "/sv/products/vape-thc-a-45-faraoh-2ml");
  await add(p, 130, 1); await add(p, 197, 1);
  await p.evaluate(() => scrollTo(0, 600)); await p.waitForTimeout(500);
  res.scrollBefore = await p.evaluate(() => scrollY);
  // Öppna via headerns riktiga knapp med tangentbord.
  const trig = w < 768 ? "#store-header .basket-icon button, #store-header .cart-button" : "#cart-button";
  await p.focus(trig).catch(() => {});
  res.triggerFocused = await p.evaluate(desc);
  await p.keyboard.press("Enter"); await p.waitForTimeout(1500);
  res.openAfterEnter = await p.evaluate(() => document.querySelector("#cart-side-wrap.is-active") != null);
  res.focusOnOpen = await p.evaluate(desc);
  if (!res.openAfterEnter) { res.triggerHTML = await p.evaluate(() => [...document.querySelectorAll("#store-header button")].filter(b => /varukorg/i.test(b.getAttribute("aria-label") || "")).map(b => b.outerHTML.slice(0, 200) + " vis=" + !!b.offsetParent)); await p.evaluate(() => HZ8.store().dispatch("cart/open")); await p.waitForTimeout(1500); res.focusOnOpenFallback = await p.evaluate(desc); }
  res.tab = [];
  for (let i = 0; i < 24; i++) { await p.keyboard.press("Tab"); await p.waitForTimeout(80); res.tab.push(await p.evaluate(desc)); }
  res.shiftTab = [];
  for (let i = 0; i < 3; i++) { await p.keyboard.press("Shift+Tab"); await p.waitForTimeout(80); res.shiftTab.push(await p.evaluate(desc)); }
  // Scroll-lock: hjul över overlay/sida.
  await p.mouse.move(Math.round(w * 0.2), 400); await p.mouse.wheel(0, 900); await p.waitForTimeout(500);
  res.scrollAfterWheel = await p.evaluate(() => scrollY);
  res.htmlOverflow = await p.evaluate(() => getComputedStyle(document.documentElement).overflow);
  res.inertOrHidden = await p.evaluate(() => ({ mainInert: !!document.querySelector("main[inert], #app[inert]"), headerAriaHidden: (document.getElementById("store-header") || {}).getAttribute?.("aria-hidden"), dialogLabel: document.getElementById("cartAside").getAttribute("aria-label"), dialogLabelledby: document.getElementById("cartAside").getAttribute("aria-labelledby"), closeLabel: (document.querySelector("#cartAside .close-cart") || {}).getAttribute?.("aria-label") }));
  // Rerender: +, -, + och läs injicerade noder.
  res.rerender = [await p.evaluate(counts)];
  for (const lbl of ["Öka antalet", "Öka antalet", "Minska antalet"]) { await p.locator(`#cartAside article.item .button[aria-label="${lbl}"]`).first().click(); await p.waitForTimeout(2600); res.rerender.push(await p.evaluate(counts)); }
  // Stäng och öppna igen 3 gånger.
  for (let i = 0; i < 3; i++) { await p.evaluate(() => HZ8.store().dispatch("cart/close")); await p.waitForTimeout(500); await p.evaluate(() => HZ8.store().dispatch("cart/open")); await p.waitForTimeout(1200); }
  res.reopen = await p.evaluate(counts);
  // Escape + fokusretur.
  await p.keyboard.press("Escape"); await p.waitForTimeout(800);
  res.closedAfterEsc = await p.evaluate(() => document.querySelector("#cart-side-wrap.is-active") == null);
  res.focusAfterEsc = await p.evaluate(desc);
  res.scrollAfterClose = await p.evaluate(() => scrollY);
  // Stängd drawer får inte vara fokuserbar.
  await p.keyboard.press("Tab"); res.tabAfterClose = await p.evaluate(desc);
  res.closedAsideVisibility = await p.evaluate(() => getComputedStyle(document.getElementById("cartAside")).visibility);
  res.errors = p.errors; R[w] = res; console.log(w, JSON.stringify(res).slice(0, 1500));
  await ctx.close();
}
// Riktig köpväg från Faraoh-PDP:n.
for (const [w, h] of [[1440, 900], [393, 852]]) {
  const ctx = await ctxFor(b, w, h); const p = await open(ctx, "/sv/products/vape-thc-a-45-faraoh-2ml");
  await p.locator(".hz8-pp__cta").first().click(); await p.waitForTimeout(3500);
  R["pdp-add-" + w] = await p.evaluate(() => ({ drawer: !!document.querySelector("#cart-side-wrap.is-active"), upsell: !!document.querySelector(".upselling-sidebar__container.is-active"), focus: document.activeElement && (document.activeElement.className || document.activeElement.tagName), live: (document.getElementById("hz8-cart-live") || {}).textContent, msg: (document.querySelector(".hz8-pp__msg") || {}).textContent }));
  await p.screenshot({ path: `${DIR}/before/${w}-pdp-add-real.png` });
  console.log("pdp-add", w, JSON.stringify(R["pdp-add-" + w]));
  await ctx.close();
}
fs.writeFileSync(`${DIR}/runs/keyboard.json`, JSON.stringify(R, null, 1));
await b.close();
