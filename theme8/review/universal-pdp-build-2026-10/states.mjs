// TASK 10B-4 -- tillstånd, tangentbord och reducerad rörelse (efter).
//   sticky        91 @393: dold i vila, synlig när CTA:n lämnat vyn, borta
//                 när kapiteldockan tar över, nära footern, med meny/varukorg
//                 öppen och när vald strain blir slutsåld
//   variant-out   91 @393/1440: slutsåld strain vald -> Bevaka, ingen CTA
//   keyboard      91 och 17 @1440: Tab från H1 genom köpstationen
//   reduced       91 @393 med prefers-reduced-motion: inga övergångar
// Bilder: runs/shots/after-state-*.jpg. node states.mjs
import { chromium, ctxFor, open, ready, DIR } from "./lib.mjs"; import fs from "node:fs";
import { PRODUCTS } from "./products.mjs";
const b = await chromium.launch(); const R = {};
const shot = (p, name) => p.screenshot({ path: `${DIR}/runs/shots/after-state-${name}.jpg`, type: "jpeg", quality: 74 });
const sticky = p => p.evaluate(() => { const s = document.querySelector(".hz8-pp-sticky"), d = document.querySelector(".hz8-ppnav-dock"); return { sticky: !!s && s.classList.contains("is-on"), dock: !!d && d.classList.contains("is-on"), stickyCta: s && s.querySelector("button").textContent }; });

// ---- sticky
{
  const ctx = await ctxFor(b, 393, 852, { which: "after" }); const p = await open(ctx, PRODUCTS[91].route); await ready(p, 5000);
  const r = {};
  r.rest = await sticky(p); await shot(p, "sticky-rest-393");
  await p.evaluate(() => { const c = document.querySelector(".hz8-pp__cta"); scrollTo({ top: c.getBoundingClientRect().bottom + scrollY + 250, behavior: "instant" }); }); await p.waitForTimeout(900);
  r.pastCta = await sticky(p); await shot(p, "sticky-on-393");
  await p.evaluate(() => { const a = document.getElementById("hz8-acc-produktfakta"); scrollTo({ top: a.getBoundingClientRect().top + scrollY - 200, behavior: "instant" }); }); await p.waitForTimeout(900);
  r.chapters = await sticky(p); await shot(p, "dock-on-393");
  await p.evaluate(() => scrollTo({ top: document.documentElement.scrollHeight, behavior: "instant" })); await p.waitForTimeout(900);
  r.nearFooter = await sticky(p);
  await p.evaluate(() => { const c = document.querySelector(".hz8-pp__cta"); scrollTo({ top: c.getBoundingClientRect().bottom + scrollY + 250, behavior: "instant" }); }); await p.waitForTimeout(900);
  await p.locator("#mobile-nav-menu, #store-header .hamburger").first().click().catch(() => {}); await p.waitForTimeout(900);
  r.menuOpen = await sticky(p);
  await p.keyboard.press("Escape"); await p.waitForTimeout(700);
  // Vald strain blir slutsåld (välj en slutsåld via native select).
  await p.evaluate(() => { const s = document.querySelector("#product-variants select"); const o = [...s.options].find(o => /Gorilla|Crazy|Yoda/.test(o.textContent)); s.value = o.value; s.dispatchEvent(new Event("change", { bubbles: true })); }); await p.waitForTimeout(1500);
  await p.evaluate(() => { const c = document.querySelector(".hz8-pp__strains"); scrollTo({ top: c.getBoundingClientRect().bottom + scrollY + 400, behavior: "instant" }); }); await p.waitForTimeout(900);
  r.variantOut = await sticky(p);
  R.sticky = { ...r, errors: p.errors }; console.log("sticky", JSON.stringify(R.sticky));
  await ctx.close();
}
// ---- variant-out
for (const w of [393, 1440]) {
  const ctx = await ctxFor(b, w, w < 768 ? 852 : 900, { which: "after" }); const p = await open(ctx, PRODUCTS[91].route); await ready(p, 5000);
  await p.evaluate(() => { const t = [...document.querySelectorAll(".hz8-pp__tile")].find(b => b.getAttribute("aria-disabled") === "true"); const s = document.querySelector("#product-variants select"); s.value = t.getAttribute("data-value"); s.dispatchEvent(new Event("change", { bubbles: true })); }); await p.waitForTimeout(1600);
  await p.evaluate(() => { const i = document.querySelector(".product-detail__information"); scrollTo({ top: Math.max(0, i.getBoundingClientRect().top + scrollY - 90), behavior: "instant" }); }); await p.waitForTimeout(600);
  R[`variantOut-${w}`] = await p.evaluate(() => ({ stock: document.querySelector(".hz8-pp__stock").textContent, ctaVisible: !document.querySelector(".hz8-pp__cta").hidden, qty: !document.querySelector(".hz8-pp__buy").hidden, bevaka: !!document.querySelector(".monitor__button") && document.querySelector(".monitor__button").offsetParent !== null, report: (document.querySelector(".hz8-acc__report") || {}).textContent }));
  await shot(p, `variant-out-91-${w}`); console.log(`variantOut-${w}`, JSON.stringify(R[`variantOut-${w}`]));
  await ctx.close();
}
// ---- keyboard
for (const id of [91, 17, 88]) {
  const ctx = await ctxFor(b, 1440, 900, { which: "after" }); const p = await open(ctx, PRODUCTS[id].route); await ready(p, 5000);
  await p.evaluate(() => { const h = document.querySelector(".product-detail__information h1"); h.tabIndex = -1; h.focus(); });
  const seen = [];
  for (let i = 0; i < 14; i++) {
    await p.keyboard.press("Tab");
    const f = await p.evaluate(() => { const a = document.activeElement; return { el: a.tagName.toLowerCase() + "." + String(a.className).split(" ")[0], text: a.textContent.replace(/\s+/g, " ").trim().slice(0, 30), fv: a.matches(":focus-visible"), inStation: !!a.closest(".hz8-pp, .buy-controls") }; });
    seen.push(f); if (!f.inStation && seen.some(x => x.inStation)) break;
  }
  // Piltangent i strainkarusellen.
  let arrow = null;
  if (id === 91) { await p.focus('.hz8-pp__tile[tabindex="0"]'); await p.keyboard.press("ArrowRight"); arrow = await p.evaluate(() => document.activeElement.textContent.trim()); }
  R[`keyboard-${id}`] = { seen, arrow, errors: p.errors }; console.log(`keyboard-${id}`, JSON.stringify(R[`keyboard-${id}`]).slice(0, 900));
  await ctx.close();
}
// ---- reduced motion
{
  const ctx = await ctxFor(b, 393, 852, { which: "after" }); const p = await open(ctx, PRODUCTS[91].route); await p.emulateMedia({ reducedMotion: "reduce" }); await ready(p, 5000);
  R.reduced = await p.evaluate(() => ["hz8-pp__cta", "hz8-pp__tile", "hz8-pp-sticky", "hz8-ppnav-dock", "hz8-totop"].map(c => { const e = document.querySelector("." + c); return c + ":" + (e ? getComputedStyle(e).transitionDuration : "–"); }));
  console.log("reduced", JSON.stringify(R.reduced)); await ctx.close();
}
fs.writeFileSync(`${DIR}/runs/states-after.json`, JSON.stringify(R, null, 1));
await b.close();
