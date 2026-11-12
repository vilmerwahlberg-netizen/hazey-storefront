import { chromium, ctxFor, open, ready } from "../../catalog-reconciliation-2026-11/lib/harness.mjs";
const b = await chromium.launch(); const ctx = await ctxFor(b, 1440, 1000, { which: "after" });
const p = await open(ctx, "/sv/categories/ms-vapes"); await ready(p, 8000);
console.log(JSON.stringify(await p.evaluate(() => { const b = document.querySelector('.hz8-sf-size[data-vol="2ml"]'); b.scrollIntoView({ block: "center" }); const r = b.getBoundingClientRect(); const top = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2); let path = [], e = b; while (e && path.length < 6) { path.push(e.tagName + "." + String(e.className).split(" ")[0]); e = e.parentElement; } return { rect: [r.left, r.top, r.width, r.height], top: top && (top.tagName + "." + top.className), parents: path, sizesParentDisplay: getComputedStyle(b.parentElement.parentElement).display, vis: getComputedStyle(b).visibility, pe: getComputedStyle(b).pointerEvents }; })));
await p.screenshot({ path: "shots/_dbg-size.png" });
await b.close();
