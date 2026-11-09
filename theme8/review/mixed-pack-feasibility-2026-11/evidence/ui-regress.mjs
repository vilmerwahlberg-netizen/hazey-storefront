// TASK 19 — regression: (1) utan ?hz8-pkg-pilot=1 inget paketsteg och ingen hämtning av pilotsidan;
// (2) med flaggan men pilotsidan otillgänglig (404, som efter avpublicering) inget köpbart paketsteg. Inga korganrop.
import fs from "node:fs"; import path from "node:path";
import { chromium, ctxFor, open, ready } from "../../catalog-reconciliation-2026-11/lib/harness.mjs";
const DIR = path.dirname(new URL(import.meta.url).pathname);
const b = await chromium.launch(); const R = {};
for (const [name, route, block] of [["utan-flagga", "/sv/products/thc-x-vape-hero-core-2ml", false], ["flagga-pilot-404", "/sv/products/thc-x-vape-hero-core-2ml?hz8-pkg-pilot=1", true]]) {
  const ctx = await ctxFor(b, 1440, 1000, { which: "after" });
  const seen = [];
  if (block) await ctx.route(/pilot-t19-heros-core-2ml-3-pack/, r => r.fulfill({ status: 404, body: "not found" }));
  const p = await open(ctx, route, { before: pg => pg.on("request", rq => { if (/pilot-t19|frontend-api\/cart\/item/.test(rq.url())) seen.push(rq.method() + " " + rq.url().replace(/\?.*/, "")); }) });
  await ready(p, 6000);
  R[name] = await p.evaluate(() => ({ packsHidden: (document.querySelector(".hz8-pp__packs") || {}).hidden, packKeys: Array.from(document.querySelectorAll(".hz8-pp__pack")).map(e => e.getAttribute("data-key")), cta: (document.querySelector(".hz8-pp__cta") || {}).textContent, registry: JSON.stringify(window.HZ8.packageRegistry.products) }));
  R[name].requests = seen; R[name].errors = p.errors.filter(e => !/trustpilot|gtm|google|Failed to load resource/i.test(e));
  await p.screenshot({ path: path.join(DIR, "shots", "UI-R-" + name + ".png") });
  await ctx.close();
}
R.pass = R["utan-flagga"].packsHidden === true && R["utan-flagga"].registry === "{}" && !R["utan-flagga"].requests.length && R["flagga-pilot-404"].packKeys.indexOf("strain:3") === -1 && !R["flagga-pilot-404"].requests.some(x => /cart\/item/.test(x));
fs.writeFileSync(path.join(DIR, "cart-runs", "ui-regress.json"), JSON.stringify(R, null, 1));
console.log(R.pass ? "PASS" : "FAIL", JSON.stringify(R, null, 1)); await b.close();
