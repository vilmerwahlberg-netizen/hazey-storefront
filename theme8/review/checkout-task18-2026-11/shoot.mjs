// node shoot.mjs <state> -- state: native | base | after. Fullpage-bilder 1440 + 393.
import { chromium, injectCheckoutCss, DIR18 } from "./lib.mjs"; import { toCheckout } from "./flow.mjs";
import path from "node:path"; import fs from "node:fs";
const state = process.argv[2] || "native"; const out = process.argv[3] || (state === "after" ? "after" : "before");
const css = { native: null, base: path.join(DIR18, "runs/base-origin-dev-checkout.css"), after: path.resolve(DIR18, "../../../dist/theme8/hazey-theme8-checkout.css") }[state];
const b = await chromium.launch(); const R = {};
for (const [w, h] of [[1440, 900], [393, 852]]) {
  const { ctx, p, mini } = await toCheckout(b, w, h, { miniShot: path.join(DIR18, out, `${w}-minicart-${state}.png`) });
  await injectCheckoutCss(p, css); await p.waitForTimeout(1500);
  await p.locator("#kustom-checkout").scrollIntoViewIfNeeded(); await p.waitForTimeout(2500); await p.evaluate(() => scrollTo(0, 0)); await p.waitForTimeout(800);
  await p.screenshot({ path: path.join(DIR18, out, `${w}-checkout-${state}-fold.png`) });
  { const H = await p.evaluate(() => document.documentElement.scrollHeight); await p.setViewportSize({ width: w, height: H }); await p.waitForTimeout(3000);
    await p.screenshot({ path: path.join(DIR18, out, `${w}-checkout-${state}-full.png`) }); await p.setViewportSize({ width: w, height: h }); }
  R[w] = await p.evaluate(() => {
    const r = s => { const e = document.querySelector(s); if (!e) return null; const b = e.getBoundingClientRect(); return { y: Math.round(b.top + scrollY), h: Math.round(b.height), x: Math.round(b.left), w: Math.round(b.width) }; };
    return { total: document.querySelector(".checkout-total")?.textContent.trim(), sw: document.documentElement.scrollWidth, docH: document.documentElement.scrollHeight,
      summary: r(".checkout-items-summary"), totalBox: r(".checkout-total"), kustom: r("#kustom-checkout"), shipping: r(".checkout-information > .shipping"), variant: document.querySelector(".checkout-items-summary .option")?.textContent.replace(/\s+/g, " ").trim() };
  });
  R[w].mini = mini; R[w].errors = p.errors.slice(0, 8);
  console.log(w, JSON.stringify(R[w])); await ctx.close();
}
fs.writeFileSync(path.join(DIR18, "runs", `shoot-${state}.json`), JSON.stringify(R, null, 1)); await b.close();
