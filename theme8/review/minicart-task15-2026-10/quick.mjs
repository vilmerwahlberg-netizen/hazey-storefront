// TASK 15 snabbkontroll under implementation: node quick.mjs <w> <h> <route> <items json> [actions]
import { chromium, ctxFor, open, add, openCart, DIR } from "./lib.mjs";
const [w, h, route, itemsJ, acts = ""] = process.argv.slice(2);
const b = await chromium.launch(); const ctx = await ctxFor(b, +w, +h);
const writes = []; ctx.on("request", r => { if (/frontend-api\/(cart|coupon)/.test(r.url()) && r.method() !== "GET") writes.push(r.method() + " " + r.url().replace(/^.*frontend-api/, "")); });
const p = await open(ctx, route);
for (const [v, q] of JSON.parse(itemsJ)) await add(p, v, q);
await openCart(p); await p.waitForTimeout(3500);
writes.length = 0;
for (const a of acts.split(",").filter(Boolean)) {
  if (a.startsWith("click:")) { await p.locator(a.slice(6)).first().click(); await p.waitForTimeout(900); }
  if (a.startsWith("wait:")) await p.waitForTimeout(+a.slice(5));
}
await p.screenshot({ path: `${DIR}/after/_quick-${w}.png` });
console.log("writes after setup:", writes, "errors:", p.errors.filter(e => !/trustpilot|gtm|favicon|recaptcha/i.test(e)).slice(0, 5));
console.log(await p.evaluate(() => { const a = document.getElementById("cartAside"); return { sh: a.scrollHeight, ch: a.clientHeight, x: a.getBoundingClientRect().x, w: a.getBoundingClientRect().width, foot: a.querySelector(".section.footer")?.getBoundingClientRect().height, label: a.querySelector(".button.buy")?.getAttribute("data-hz8-label"), pkg: !!HZ8.packageRegistry, hscroll: a.scrollWidth > a.clientWidth }; }));
await b.close();
