// TASK 17C — kompakt slutregression: startsida, Bästsäljare, Alla Buds, Yoda-PDP vid 393/1440.
//   which = after    lokal build via harness (loader/bundle byts lokalt)
//   which = external ingen interception: Nyehandels preview med loadern som ligger i Theme 8-admin
//                    och bundlen som GitHub Pages serverar (extern verifiering efter push)
// Per vy: överflöd, konsolfel, beskurna bilder, bildtyper (antal unverified bland katalogbilder),
// köpknappar, produktlänkar, manifestets datum/storlek och bundle-källan. Dessutom:
//   - reserv: en tillagd bildyta med en bild som INTE finns i manifestet -> data-hz8-media="unverified",
//     ingen tonzon, ingen mask på bilden (originalet orört);
//   - Alla Buds-serierna via delbar URL (Core 4, D10 4, Magic Sauce 19, Nano-11 21, 5 g 45).
// Kör: node final-regress.mjs after|external  ->  runs/final-regress-<which>.json
import fs from "node:fs"; import path from "node:path";
import { chromium, ctxFor, open, ready, DIR } from "./lib/harness.mjs";
const which = process.argv[2] || "after";
const PAGES = { home: "/", bestsellers: "/sv/page/vara-bastsaljare", buds: "/sv/categories/blommor-buds", "pdp-yoda": "/sv/products/magic-sauce-buds-yoda-ice-cream-5-gram" };
const b = await chromium.launch(); const R = { which, at: new Date().toISOString(), pages: [], filters: [] };
let fail = 0;
for (const [key, route] of Object.entries(PAGES)) for (const [w, h] of [[393, 852], [1440, 900]]) {
  const ctx = await ctxFor(b, w, h, { which }); const p = await open(ctx, route); await ready(p, 5000);
  for (let i = 0; i < 8; i++) { await p.mouse.wheel(0, 1100); await p.waitForTimeout(300); } await p.waitForTimeout(1200);
  const m = await p.evaluate(async () => {
    const boxes = [...document.querySelectorAll(".product-card__image, .hz8-bs-card__media, .hz8-pcard__media, .product-detail__media")].filter(e => e.getBoundingClientRect().width > 30);
    const kinds = {}, cropped = [];
    boxes.forEach(box => {
      const k = box.getAttribute("data-hz8-media") || "–"; kinds[k] = (kinds[k] || 0) + 1;
      const img = box.matches(".product-detail__media") ? box.querySelector("#product-slides .slide img") : box.querySelector("img"); if (!img || !img.naturalWidth) return;
      const r = img.getBoundingClientRect(), c = box.getBoundingClientRect(), cs = getComputedStyle(img), ar = img.naturalWidth / img.naturalHeight;
      let dw = r.width, dh = r.height; if (cs.objectFit === "contain") { if (r.width / r.height > ar) dw = r.height * ar; else dh = r.width / ar; }
      const dx = r.left + (r.width - dw) / 2, dy = r.top + (r.height - dh) / 2;
      if (!box.matches(".product-detail__media") && Math.max(c.left - dx, dx + dw - c.right, c.top - dy, dy + dh - c.bottom) > 1.5) cropped.push(box.className.toString().slice(0, 30));
    });
    // Reserv för en bild som saknas i manifestet.
    const host = document.querySelector("#store-instance") || document.body, probe = document.createElement("div");
    probe.className = "product-card__image"; probe.style.cssText = "position:absolute;left:-9999px;width:120px;height:120px";
    const im = new Image(); im.src = "https://d3dnwnveix5428.cloudfront.net/store_183a511a-0ded-44c9-829d-21099b0158f9/images/ny-produkt-utan-manifest-deadbeef.jpeg"; probe.appendChild(im); host.appendChild(probe);
    await new Promise(r => setTimeout(r, 400));
    const ics = getComputedStyle(im);
    const fallback = { kind: probe.getAttribute("data-hz8-media"), fade: probe.hasAttribute("data-hz8-media-fade"), mask: ics.maskImage || ics.webkitMaskImage || "none", filter: ics.filter, clip: ics.clipPath };
    probe.remove();
    const mf = window.HZ8 && HZ8.mediaManifest;
    const js = [...document.scripts].map(s => s.src).find(s => /hazey-theme8\.min\.js/.test(s)) || null;
    return { overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth, boxes: boxes.length, kinds, cropped, fallback,
      manifest: mf ? { generated: mf.generated, images: Object.keys(mf.images).length, yoda: mf.images.cdcbd2c4 } : null, bundle: js,
      buy: [...document.querySelectorAll(".hz8-card-pill, button.buy, .product-detail__information button.buy")].filter(e => e.getBoundingClientRect().width > 0).length,
      links: document.querySelectorAll(".product-card a[href*='/products/'], .hz8-bs-card a[href*='/products/'], .hz8-pcard a[href*='/products/']").length };
  });
  m.errors = p.errors.filter(e => !/trustpilot|gtm|status of 4/i.test(e)); m.key = key; m.w = w;
  const bad = m.overflow > 0 || m.errors.length || m.cropped.length || m.fallback.kind !== "unverified" || m.fallback.fade || !/none/.test(m.fallback.mask) || !m.manifest || (key === "pdp-yoda" ? !m.buy : !m.links);
  if (bad) fail++;
  R.pages.push(m); console.log(`${bad ? "FAIL" : "OK  "} ${key} ${w}: ovf ${m.overflow} fel ${m.errors.length} beskurna ${m.cropped.length} typer ${JSON.stringify(m.kinds)} köp ${m.buy} länkar ${m.links} reserv ${m.fallback.kind}/${m.fallback.fade ? "tonzon" : "ingen tonzon"}/${m.fallback.mask} manifest ${m.manifest && m.manifest.images + " " + m.manifest.generated + " yoda=" + m.manifest.yoda}`);
  await ctx.close();
}
const EXP = { "magic-sauce": 19, core: 4, d10: 4, "nano-11": 21 };
for (const w of [393, 1440]) {
  const ctx = await ctxFor(b, w, w < 768 ? 852 : 900, { which });
  for (const [q, n] of [...Object.entries(EXP).map(([s, n]) => ["serie=" + s, n]), ["volym=5g", 45]]) {
    const p = await open(ctx, "/sv/categories/blommor-buds?" + q); await ready(p, 6000); await p.waitForTimeout(3500);
    for (let i = 0; i < 6; i++) { const more = p.locator(".hz8-series-results:not([hidden]) button:has-text('Visa fler'), .hz8-pmore button").first(); if (await more.count() && await more.isVisible().catch(() => false)) { await more.click().catch(() => {}); await p.waitForTimeout(1200); } else break; }
    const got = await p.evaluate(() => { const res = document.querySelector(".hz8-series-results:not([hidden])") || document.querySelector("#category-products") || document; return new Set([...res.querySelectorAll(".product-card")].filter(c => { const r = c.getBoundingClientRect(); return r.width > 20 && !c.closest("[hidden]"); }).map(c => (c.querySelector("a[href*='/products/']") || {}).href).filter(Boolean)).size; });
    const ok = got === n; if (!ok) fail++;
    R.filters.push({ w, q, expected: n, shown: got, ok }); console.log(`${ok ? "OK  " : "FAIL"} Alla Buds ${w} ?${q}: ${got}/${n}`);
    await p.close();
  }
  await ctx.close();
}
R.fail = fail; fs.writeFileSync(path.join(DIR, `runs/final-regress-${which}.json`), JSON.stringify(R, null, 1)); await b.close();
console.log(fail ? `${fail} FEL` : "ALLT OK");
