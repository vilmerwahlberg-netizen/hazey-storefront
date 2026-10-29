// TASK 10B-3 -- paketarkitekturen.
// Normalläge: inga paketprodukter i Nyehandel -> ingen paketväljare, bara
// antal; profilen säger BLOCKED för produkter med migreringsplan.
// Granskningsläge (?hz8-pkg-review=1): varje planerat steg väljs i tur och
// ordning -> byggaren (en plats per enhet, slutsålda synliga men låsta),
// "Paketpris saknas", avstängd CTA, ingen sticky, inget varukorgsanrop,
// galleriets höjd oförändrad. node pkg.mjs <after> [width,..]
import { chromium, ctxFor, open, ready, DIR } from "./lib.mjs"; import fs from "node:fs";
import { PRODUCTS } from "./products.mjs";
const [which = "after", ws = "393,1440"] = process.argv.slice(2);
const b = await chromium.launch(); const R = {};
const snap = p => p.evaluate(() => {
  const vis = e => !!e && e.getClientRects().length > 0 && !e.closest("[hidden]");
  const gal = document.querySelector(".product-detail__media");
  const cta = document.querySelector(".hz8-pp__cta");
  return {
    profile: window.HZ8 && HZ8.pdpProfile ? HZ8.pdpProfile().packages : null,
    packs: [...document.querySelectorAll(".hz8-pp__pack")].filter(vis).map(x => x.textContent.replace(/\s+/g, " ").trim() + (x.getAttribute("aria-checked") === "true" ? " [vald]" : "")),
    note: vis(document.querySelector(".hz8-pp__pknote")) ? document.querySelector(".hz8-pp__pknote").textContent : null,
    builder: vis(document.querySelector(".hz8-pp__builder")) ? { title: document.querySelector(".hz8-pp__btitle").textContent, slots: document.querySelectorAll(".hz8-pp__slot").length, options: [...(document.querySelector(".hz8-pp__slot select") || { options: [] }).options].map(o => o.textContent + (o.disabled ? " [låst]" : "")), fixed: [...document.querySelectorAll(".hz8-pp__slot.is-fixed .hz8-pp__slotname")].map(e => e.textContent).slice(0, 10), mixnote: (document.querySelector(".hz8-pp__mixnote") || {}).textContent } : null,
    price: (document.querySelector(".hz8-pp__price") || {}).textContent, qtyVisible: vis(document.querySelector(".hz8-pp__qty")),
    cta: cta && { text: cta.textContent, disabled: cta.disabled, ariaDisabled: cta.getAttribute("aria-disabled"), state: cta.getAttribute("data-state"), focusable: !cta.disabled && cta.tabIndex >= 0 && vis(cta) },
    galleryH: gal ? Math.round(gal.getBoundingClientRect().height) : null, overflowX: document.documentElement.scrollWidth > innerWidth + 1
  };
});
for (const w of ws.split(",").map(Number)) {
  // Normalläge
  for (const id of [91, 84, 88]) {
    const ctx = await ctxFor(b, w, w < 768 ? 852 : 900, { which });
    const p = await open(ctx, PRODUCTS[id].route); await ready(p, 6000);
    R[`normal-${id}-${w}`] = { ...(await snap(p)), errors: p.errors }; console.log(`normal-${id}-${w}`, JSON.stringify(R[`normal-${id}-${w}`]).slice(0, 600));
    await ctx.close();
  }
  // Granskningsläge
  for (const id of [91, 84]) {
    const ctx = await ctxFor(b, w, w < 768 ? 852 : 900, { which });
    const posts = []; ctx.on("request", r => { if (r.method() === "POST" && /frontend-api\/cart/.test(r.url())) posts.push(r.url()); });
    const p = await open(ctx, PRODUCTS[id].route + "?hz8-pkg-review=1"); await ready(p, 7000);
    await p.waitForFunction(() => document.querySelectorAll(".hz8-pp__pack").length > 1, null, { timeout: 15000 }).catch(() => {});
    const base = await snap(p); const steps = [];
    const n = await p.evaluate(() => document.querySelectorAll(".hz8-pp__pack").length);
    for (let i = 1; i < n; i++) {
      await p.evaluate(i => document.querySelectorAll(".hz8-pp__pack")[i].click(), i); await p.waitForTimeout(900);
      const s = await snap(p);
      // Försök köpa ändå: klick på CTA (avstängd) och tangentbord.
      await p.evaluate(() => { const c = document.querySelector(".hz8-pp__cta"); c.click(); c.focus(); });
      await p.keyboard.press("Enter"); await p.waitForTimeout(800);
      s.stickyOn = await p.evaluate(() => { scrollTo({ top: document.querySelector(".hz8-pp__cta").getBoundingClientRect().bottom + scrollY + 300, behavior: "instant" }); return new Promise(r => setTimeout(() => r(document.querySelector(".hz8-pp-sticky").classList.contains("is-on")), 700)); });
      await p.evaluate(() => scrollTo({ top: 0, behavior: "instant" })); await p.waitForTimeout(300);
      await p.screenshot({ path: `${DIR}/runs/shots/${which}-pkgreview-${id}-${w}-step${i}.jpg`, type: "jpeg", quality: 74, clip: await p.evaluate(() => { const r = document.querySelector(".product-detail").getBoundingClientRect(); return { x: 0, y: Math.max(0, r.top + scrollY - 10), width: innerWidth, height: Math.min(r.height + 20, 2400) }; }) });
      steps.push(s);
    }
    R[`review-${id}-${w}`] = { base, steps, cartPosts: posts, errors: p.errors };
    console.log(`review-${id}-${w}`, JSON.stringify(R[`review-${id}-${w}`]).slice(0, 1500));
    await ctx.close();
  }
}
fs.writeFileSync(`${DIR}/runs/pkg-${which}.json`, JSON.stringify(R, null, 1));
await b.close();
