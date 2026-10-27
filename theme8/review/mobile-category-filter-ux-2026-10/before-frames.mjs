// TASK 01E -- motsvarande före-ramar (393) utan mobildocka: den gamla fasta
// raden under headern, arken öppnade från raden och nära sidans slut.
// node before-frames.mjs <route,..>
import { chromium, ctxFor, open, ready, DIR, ROUTES } from "./lib.mjs";
const rs = (process.argv[2] || "alla-vapes").split(","); const b = await chromium.launch(); const S = `${DIR}/runs/frames`;
for (const route of rs) {
  const ctx = await ctxFor(b, 393, 852, { which: "before" }); const p = await open(ctx, ROUTES[route]); await ready(p, 5000);
  const go = async y => { await p.evaluate(y => scrollTo({ top: y, behavior: "instant" }), y); await p.waitForTimeout(800); };
  await go(1300); await p.screenshot({ path: `${S}/before-${route}-393-03-dock-entry.png` });
  await p.click(".hz8-ptool__mob .hz8-ptool__filter"); await p.waitForTimeout(900); await p.screenshot({ path: `${S}/before-${route}-393-05-dock-filter-sheet.png` });
  await p.keyboard.press("Escape"); await p.waitForTimeout(600);
  const sort = await p.$('.hz8-ptool__mob [data-pt="sort-sheet"]');
  if (sort) { await sort.click(); } else { await p.click(".hz8-ptool__mob .hz8-ptool__filter"); await p.waitForTimeout(500); await p.evaluate(() => { const b = document.querySelector('#hz8-pfilter [data-acc="sort"] .hz8-pacc__btn'); if (b) b.click(); }); }
  await p.waitForTimeout(900); await p.screenshot({ path: `${S}/before-${route}-393-06-dock-sort-sheet.png` });
  await p.keyboard.press("Escape"); await p.waitForTimeout(600);
  const end = await p.evaluate(() => { const a = document.querySelector(".designer-category"); return Math.round(a.getBoundingClientRect().bottom + scrollY - innerHeight + 280); });
  await go(end); await p.screenshot({ path: `${S}/before-${route}-393-07-page-end.png` });
  await ctx.close();
}
await b.close(); console.log("ok");
