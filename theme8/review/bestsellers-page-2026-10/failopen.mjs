// Fail-open-jämförelse: Theme 8-JS (och ev. CSS) avbruten, före (a9081ee) | efter. node failopen.mjs
import { chromium, ctxFor, open, DIR } from "./lib.mjs";
const b = await chromium.launch();
for (const which of ["before", "after"]) for (const cssFail of [undefined, "abort"]) {
  const ctx = await ctxFor(b, 1440, 900, { which, jsFail: "abort", cssFail }); const p = await open(ctx, "/sv/page/vara-bastsaljare");
  await p.waitForTimeout(15000);
  await p.evaluate(async () => { for (let y = 0; y < document.documentElement.scrollHeight; y += 600) { scrollTo({ top: y, behavior: "instant" }); await new Promise(r => setTimeout(r, 150)); } }); await p.waitForTimeout(3000);
  console.log(which, cssFail || "css-ok", JSON.stringify(await p.evaluate(() => ({ h1: [...document.querySelectorAll("h1")].map(h => h.className), cards: document.querySelectorAll(".product-card").length, named: [...document.querySelectorAll(".product-card .name")].filter(n => n.textContent.trim()).length, sections: document.querySelectorAll(".template-components__product-list").length, html: document.documentElement.className }))), p.errors.slice(0, 2));
  await ctx.close();
}
await b.close();
