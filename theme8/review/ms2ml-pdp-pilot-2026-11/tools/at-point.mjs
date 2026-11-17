import { chromium, ctxFor, open, URL_ } from "../../pdp-pilot-2026-10/lib.mjs";
const b = await chromium.launch({ channel: "chrome", headless: true });
const ctx = await ctxFor(b, 1440, 900, { scale: 1 });
const p = await open(ctx, URL_("/sv/products/vape-magic-sauce-magic-farmers-2ml/454"));
await p.waitForSelector(".hz8-pcx-sum", { timeout: 30000 }); await p.waitForTimeout(4000);
console.log(await p.evaluate(() => {
  const sy = document.querySelector("#hz8-pcx-sum").getBoundingClientRect().top + scrollY;
  const out = [];
  for (const [x, dy] of [[900, -30], [600, -30], [900, -60]]) {
    window.scrollTo(0, sy - 300); const y = 300 + dy;
    out.push(`(${x},${dy}): ` + document.elementsFromPoint(x, y).slice(0, 7).map(e => { const cs = getComputedStyle(e); const r = e.getBoundingClientRect(); return e.tagName + "." + String(e.className).split(" ")[0] + "[" + Math.round(r.left) + "-" + Math.round(r.right) + " bg=" + (cs.backgroundColor !== "rgba(0, 0, 0, 0)" || cs.backgroundImage !== "none" ? "Y" : "-") + "]"; }).join(" > "));
  }
  return out.join("\n");
}));
await b.close();
