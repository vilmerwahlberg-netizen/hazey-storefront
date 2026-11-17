import { chromium, ctxFor, open, URL_ } from "../../pdp-pilot-2026-10/lib.mjs";
const b = await chromium.launch({ channel: "chrome", headless: true });
const ctx = await ctxFor(b, 1440, 900, { scale: 1 });
const p = await open(ctx, URL_("/sv/products/vape-magic-sauce-magic-farmers-2ml/454"));
await p.waitForSelector(".hz8-pcx-faq__item", { timeout: 30000 }); await p.waitForTimeout(3000);
console.log(await p.evaluate(() => { const s = document.querySelector(".hz8-pcx-faq__item > summary"), h = s.querySelector("h3"), cs = getComputedStyle(s), hs = getComputedStyle(h); const ps = ["::before","::after"].map(x => { const c = getComputedStyle(s, x); return x + ":" + c.content + "/" + c.display + "/" + c.height + "/" + c.position; }); const kids = [...s.children].map(k => k.className + ":" + k.getBoundingClientRect().height); return JSON.stringify({ ps, kids, disp: cs.display, box: cs.boxSizing, sumH: s.getBoundingClientRect().height, pad: cs.padding, minH: cs.minHeight, h3H: h.getBoundingClientRect().height, h3m: hs.margin, h3p: hs.padding, lh: hs.lineHeight, fs: hs.fontSize, item: document.querySelector(".hz8-pcx-faq__item").getBoundingClientRect().height, itemPad: getComputedStyle(document.querySelector(".hz8-pcx-faq__item")).padding }); }));
await b.close();
