// TASK 01C: headerns semi-sticky dölj/visa vid scroll, före vs efter.
// node header-scroll.mjs <before|after> <route> <width[,..]>
import { chromium, ctxFor, ROUTES, url, acceptCookies } from "./lib.mjs";
const [which = "after", r = "ms-carts", ws = "393,1440"] = process.argv.slice(2);
const b = await chromium.launch(); const out = [];
for (const w of ws.split(",").map(Number)) {
  const ctx = await ctxFor(b, w, w < 768 ? 852 : 900, { which }); const p = await ctx.newPage();
  await p.goto(url(ROUTES[r]), { waitUntil: "domcontentloaded" });
  await p.waitForFunction(() => document.documentElement.classList.contains("hz8") && !document.documentElement.classList.contains("hz8-settling") && !document.documentElement.classList.contains("hz8-boot"), null, { timeout: 60000 });
  await acceptCookies(p); await p.waitForTimeout(1500);
  const st = () => p.evaluate(() => { const h = document.querySelector("#store-header"); const r = h.getBoundingClientRect(); const m = h.querySelector(".main").getBoundingClientRect(); return { y: Math.round(scrollY), headerBottom: Math.round(r.bottom), mainBottom: Math.round(m.bottom), tf: getComputedStyle(h).transform.slice(0, 40) }; });
  const s = { rest: await st() };
  for (let i = 0; i < 8; i++) { await p.mouse.wheel(0, 150); await p.waitForTimeout(60); } await p.waitForTimeout(700); s.down = await st();
  for (let i = 0; i < 3; i++) { await p.mouse.wheel(0, -120); await p.waitForTimeout(60); } await p.waitForTimeout(700); s.up = await st();
  await p.evaluate(() => scrollTo(0, 0)); await p.waitForTimeout(700); s.top = await st();
  out.push({ which, r, w, ...s }); console.log(JSON.stringify(out.at(-1))); await ctx.close();
}
await b.close();
