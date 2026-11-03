// TASK 17B — verifiering av bildsystemet (lokal build i Theme 8-previewen, inget skrivs till Nyehandel).
// 1) Bredder 320/393/430/1440/1920 + 200 % zoom på start, Alla Buds, Yoda-PDP: överflöd, konsolfel,
//    beskurna bilder (bildens ritade yta utanför sin bildyta), layoutskift (CLS) och bildtyper.
// 2) PDP-galleri/strainbyte: varje strain- eller miniatyrklick -> den aktiva bilden finns bland produktens
//    egna bilder (product/state) och scenens klassning följer den aktiva bilden.
// 3) Köpknappar och produktlänkar: finns och pekar på /products/.
// Kör: node verify.mjs [which]  ->  runs/verify-<which>.json
import fs from "node:fs"; import path from "node:path";
import { chromium, ctxFor, open, ready, DIR } from "./lib/harness.mjs";
const which = process.argv[2] || "after";
const b = await chromium.launch(); const R = { which, pages: [], gallery: [] };
const PAGES = { home: "/", buds: "/sv/categories/blommor-buds", "pdp-yoda": "/sv/products/magic-sauce-buds-yoda-ice-cream-5-gram", bestsellers: "/sv/page/vara-bastsaljare" };
const SIZES = [[320, 700], [393, 852], [430, 932], [1440, 900], [1920, 1080], [1440, 900, 2]];
const CLS = () => { window.__cls = 0; new PerformanceObserver(l => { for (const e of l.getEntries()) if (!e.hadRecentInput) window.__cls += e.value; }).observe({ type: "layout-shift", buffered: true }); };
for (const [key, route] of Object.entries(PAGES)) for (const [w, h, zoom] of SIZES) {
  if (key === "bestsellers" && (w === 320 || w === 430)) continue;
  const ctx = await ctxFor(b, w, h, { which, zoom }); const p = await open(ctx, route, { before: pg => pg.addInitScript(CLS) }); await ready(p, 6000);
  for (let i = 0; i < 8; i++) { await p.mouse.wheel(0, 1100); await p.waitForTimeout(350); } await p.waitForTimeout(1500);
  const m = await p.evaluate(() => {
    const boxes = [...document.querySelectorAll(".product-card__image, .hz8-bs-card__media, .hz8-pcard__media, .product-detail__media #product-slides .slide.active, .product-detail__media #product-slides .slide.is-active")].filter(e => e.getBoundingClientRect().width > 30);
    const cropped = [], kinds = {};
    boxes.forEach(box => {
      const img = box.querySelector("img"); if (!img || !img.naturalWidth) return;
      const k = (box.closest("[data-hz8-media]") || box).getAttribute("data-hz8-media") || "–"; kinds[k] = (kinds[k] || 0) + 1;
      const r = img.getBoundingClientRect(), c = box.getBoundingClientRect(), cs = getComputedStyle(img);
      // Ritad bildyta (contain) inom img-boxen.
      const ar = img.naturalWidth / img.naturalHeight; let dw = r.width, dh = r.height;
      if (cs.objectFit === "contain") { if (r.width / r.height > ar) dw = r.height * ar; else dh = r.width / ar; }
      const dx = r.left + (r.width - dw) / 2, dy = r.top + (r.height - dh) / 2;
      const out = Math.max(c.left - dx, dx + dw - c.right, c.top - dy, dy + dh - c.bottom);
      if (out > 1.5 || cs.clipPath !== "none" || (cs.objectFit === "cover" && Math.abs(r.width / r.height - ar) > .02)) cropped.push((box.closest(".product-card") && box.closest(".product-card").querySelector(".name") || {}).textContent?.trim().slice(0, 40) || box.className.toString().slice(0, 30));
    });
    return { overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth, images: boxes.length, kinds, cropped, cls: Math.round((window.__cls || 0) * 1000) / 1000,
      buy: [...document.querySelectorAll(".hz8-card-pill, .product-detail__information button.buy, button.buy")].filter(e => e.getBoundingClientRect().width > 0).length,
      links: [...document.querySelectorAll(".product-card a[href*='/products/'], .hz8-bs-card a[href*='/products/'], .hz8-pcard a[href*='/products/']")].length };
  });
  m.errors = p.errors.filter(e => !/trustpilot|gtm|status of 4/i.test(e)); m.key = key; m.w = w; m.zoom = zoom || 1;
  R.pages.push(m); console.log(`${key} ${w}${zoom ? "@" + zoom : ""}: ovf=${m.overflow} img=${m.images} cropped=${m.cropped.length} cls=${m.cls} err=${m.errors.length} kinds=${JSON.stringify(m.kinds)} buy=${m.buy} links=${m.links}`);
  await ctx.close();
}
// Galleri och strainbyte: rätt bild på rätt produkt.
for (const slug of ["magic-sauce-pre-rolls-1g", "magic-sauce-buds-yoda-ice-cream-5-gram", "cbd-prerolled-cookies-1g", "hash-cbn-yellowstone-5-gram"]) for (const w of [393, 1440]) {
  const ctx = await ctxFor(b, w, 900, { which }); const p = await open(ctx, "/sv/products/" + slug); await ready(p, 6000);
  const own = await p.evaluate(async () => { const id = +((document.documentElement.innerHTML.match(/viewProduct\(.(\d+)/) || [])[1]); const r = await fetch("/frontend-api/product/state", { method: "POST", credentials: "same-origin", headers: HZ8.apiHeaders(), body: JSON.stringify({ product_id: id, variant_ids: [null] }) }); const d = await r.json(); return (d.product.images || []).map(i => i.id); });
  const steps = [];
  const read = () => p.evaluate(() => { const m = document.querySelector(".product-detail__media"); const img = m.querySelector("#product-slides .slide.is-active img, #product-slides .slide.active img") || m.querySelector("#product-slides .slide img"); const sl = img && img.closest(".slide"); return { src: img && (img.currentSrc || img.src), imageId: sl && (sl.getAttribute("data-image-id") || (sl.querySelector("[data-image-id]") || {}).getAttribute?.("data-image-id")), media: m.getAttribute("data-hz8-media"), mediaSrc: m.getAttribute("data-hz8-media-src") }; });
  steps.push({ step: "start", ...(await read()) });
  const tiles = await p.locator(".hz8-pp__tile:not(.is-out)").count();
  for (let i = 0; i < Math.min(tiles, 4); i++) { await p.locator(".hz8-pp__tile:not(.is-out)").nth(i).click().catch(() => {}); await p.waitForTimeout(1200); steps.push({ step: "strain " + i, ...(await read()) }); }
  const thumbs = await p.locator("#product-thumbnails .thumb").count();
  for (let i = 0; i < Math.min(thumbs, 3); i++) { await p.locator("#product-thumbnails .thumb").nth(i).click().catch(() => {}); await p.waitForTimeout(1000); steps.push({ step: "miniatyr " + i, ...(await read()) }); }
  const zoom = p.locator(".hz8-pp-zoom"); let zoomOk = null;
  if (await zoom.count()) { await zoom.click().catch(() => {}); await p.waitForTimeout(1500); zoomOk = await p.evaluate(() => { const lb = document.querySelector(".lightbox, .glightbox-container, .modal.is-active, [class*=lightbox]"); return !!lb && lb.getBoundingClientRect().width > 0; }); await p.keyboard.press("Escape"); }
  const bad = steps.filter(s => s.imageId && own.length && !own.includes(+s.imageId));
  const stale = steps.filter(s => s.src && s.mediaSrc && s.src !== s.mediaSrc);
  R.gallery.push({ slug, w, ownImages: own.length, steps, wrongProductImage: bad.length, mediaLagging: stale.length, zoomOpened: zoomOk });
  console.log(`galleri ${slug} ${w}: egna bilder ${own.length}, steg ${steps.length}, främmande bild ${bad.length}, scen ej följt ${stale.length}, zoom ${zoomOk}`);
  await ctx.close();
}
fs.writeFileSync(path.join(DIR, `runs/verify-${which}.json`), JSON.stringify(R, null, 1)); await b.close();
