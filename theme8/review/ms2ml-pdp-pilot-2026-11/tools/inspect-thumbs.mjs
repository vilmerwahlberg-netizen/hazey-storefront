import { chromium, ctxFor, open, URL_ } from "../../pdp-pilot-2026-10/lib.mjs";
const b = await chromium.launch({ channel: "chrome", headless: true });
const ctx = await ctxFor(b, 393, 852, { scale: 1 });
const p = await open(ctx, URL_("/sv/products/vape-magic-sauce-magic-farmers-2ml/454"));
await p.waitForSelector(".hz8-pcx-sum", { timeout: 30000 }); await p.waitForTimeout(4000);
console.log(JSON.stringify(await p.evaluate(() => {
  const r = e => { const q = e.getBoundingClientRect(); return [Math.round(q.left), Math.round(q.top + scrollY), Math.round(q.width), Math.round(q.height)]; };
  const t = document.querySelector("#product-thumbnails"), m = document.querySelector(".product-detail__media");
  const chain = []; for (let e = t; e && e !== m.parentNode; e = e.parentElement) { const cs = getComputedStyle(e); chain.push(e.tagName + "." + String(e.className).slice(0, 40) + " pos=" + cs.position + " ov=" + cs.overflow + " " + r(e).join(",")); }
  const wide = [...document.querySelectorAll(".product-detail__information *")].filter(e => e.getBoundingClientRect().right > innerWidth + 1).slice(0, 6).map(e => e.className + " r=" + Math.round(e.getBoundingClientRect().right));
  return { media: r(m), thumbs: [...t.querySelectorAll(".thumb")].slice(0, 3).map(r), n: t.querySelectorAll(".thumb").length, tcs: (() => { const c = getComputedStyle(t); return [c.display, c.gridAutoFlow, c.top, c.bottom, c.height, c.gridTemplateRows, c.gridTemplateColumns]; })(), chain, wide, info: r(document.querySelector(".product-detail__information")) };
}), null, 1));
await b.close();
