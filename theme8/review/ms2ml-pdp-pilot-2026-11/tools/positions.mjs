import { chromium, ctxFor, open, URL_ } from "../../pdp-pilot-2026-10/lib.mjs";
const b = await chromium.launch({ channel: "chrome", headless: true }); const out = {};
for (const [w, h] of [[393, 852], [1440, 900], [1920, 1080]]) {
  const ctx = await ctxFor(b, w, h, { scale: 1 });
  const p = await open(ctx, URL_("/sv/products/vape-magic-sauce-magic-farmers-2ml/454"));
  await p.waitForSelector(".hz8-pcx-more__card", { timeout: 40000 }); await p.waitForTimeout(3000);
  out[w] = await p.evaluate(() => { const y = s => Math.round(document.querySelector(s).getBoundingClientRect().top + scrollY); return { sum: y("#hz8-pcx-sum"), strains: y("#hz8-pcx-strains"), om: y("#hz8-pcx-om"), faq: y("#hz8-pcx-faq"), more: y("#liknande"), help: y(".hz8-pdp-help"), end: document.documentElement.scrollHeight }; });
  await ctx.close();
}
console.log(JSON.stringify(out)); await b.close();
