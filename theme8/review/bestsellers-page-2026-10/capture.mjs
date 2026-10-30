// TASK 11 -- fullsidor i referensernas lägen (efter): expanderad 1440
// (?visa=24), Carts 1440, Hasch 393, tomt format 393 (lagerfiltret svarar
// tomt). node capture.mjs
import { chromium, ctxFor, open, ready, DIR } from "./lib.mjs";
const b = await chromium.launch();
const swap0 = body => body.replace(/(<[a-z]+[^>]*class="[^"]*\bproduct-card\b)/g, m => m.replace(/product-card$/, "hz8x-card")).replace(/(id="products_count"[^>]*>[^<\d]*)\d+/, "$10");
const JOBS = [
  ["expanded-1440", 1440, "?visa=24"], ["filter-carts-1440", 1440, "?typ=carts"], ["filter-hasch-393", 393, "?typ=hasch"],
  ["empty-format-393", 393, "?typ=hasch&filters=smart-filter_in-stock", ctx => ctx.route(/alla-produkter\?sort=popular.*smart-filter_in-stock/, async r => { const res = await r.fetch(); return r.fulfill({ response: res, body: swap0(await res.text()) }); })]
];
for (const [name, w, q, setup] of JOBS) {
  const ctx = await ctxFor(b, w, w < 768 ? 852 : 900, { which: "after" }); if (setup) await setup(ctx);
  const p = await open(ctx, "/sv/page/vara-bastsaljare" + q); await ready(p, 9000);
  await p.evaluate(async () => { for (let y = 0; y < document.documentElement.scrollHeight; y += 500) { scrollTo({ top: y, behavior: "instant" }); await new Promise(r => setTimeout(r, 110)); } scrollTo({ top: 0, behavior: "instant" }); }); await p.waitForTimeout(2000);
  await p.screenshot({ path: `${DIR}/runs/shots/after-ref-${name}.jpg`, fullPage: true, type: "jpeg", quality: 74 });
  console.log(name, await p.evaluate(() => document.querySelectorAll("#hz8-bs-grid > [data-hz8-path]").length), p.errors.length);
  await ctx.close();
}
await b.close();
