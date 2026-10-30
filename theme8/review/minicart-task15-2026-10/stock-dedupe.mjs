// TASK 15 runda 2: lagergräns -- ett synligt meddelande åt gången.
// Äkta 406 (Tequila Sunrise, 7 i lager). Under Nyehandels toast ligger
// Theme 8:s rad bara i tillgänglighetsträdet; när toasten är borta syns den.
import { chromium, ctxFor, open, add, openCart, DIR } from "./lib.mjs"; import fs from "node:fs";
const b = await chromium.launch(); const R = {};
const state = () => { const t = [...document.querySelectorAll(".toaster-container")].find(x => x.getBoundingClientRect().height > 0); const m = document.querySelector("#cartAside .hz8-row-msg"); const r = m && m.getBoundingClientRect(); return { toastVisible: !!t, inline: m ? { cls: m.className, role: m.getAttribute("role"), text: m.textContent, visibleBox: r.width > 2 && r.height > 2 } : null, plusDisabled: document.querySelector('#cartAside .button[aria-label^="Öka antalet"]')?.getAttribute("aria-disabled"), qty: document.querySelector("#cartAside input[name=quantity]")?.value }; };
for (const [w, h] of [[393, 852], [1440, 900]]) {
  const ctx = await ctxFor(b, w, h); const p = await open(ctx, "/sv/products/vape-thc-a-45-faraoh-2ml");
  await add(p, 183, 7); await openCart(p); await p.waitForTimeout(2500);
  await p.locator('#cartAside .button[aria-label^="Öka antalet"]').first().click();
  await p.waitForTimeout(1500); R[w + "-withToast"] = await p.evaluate(state); await p.screenshot({ path: `${DIR}/after/${w}-stock-with-toast.png` });
  await p.waitForFunction(() => !document.querySelector(".toaster-container"), null, { timeout: 20000 }).catch(() => {});
  await p.waitForTimeout(900); R[w + "-afterToast"] = await p.evaluate(state); await p.screenshot({ path: `${DIR}/after/${w}-stock-after-toast.png` });
  // Ingen toast alls (simulerad 422 utan Nyehandels toast): raden måste synas.
  console.log(w, JSON.stringify(R[w + "-withToast"]), JSON.stringify(R[w + "-afterToast"]));
  await ctx.close();
}
{
  const ctx = await ctxFor(b, 393, 852); const p = await open(ctx, "/sv/products/vape-thc-a-45-faraoh-2ml");
  await add(p, 130, 1); await openCart(p); await p.waitForTimeout(2500);
  ctx.failMode = "422";
  await p.locator('#cartAside .button[aria-label^="Öka antalet"]').first().click(); await p.waitForTimeout(3500); ctx.failMode = null;
  R["393-noToast"] = await p.evaluate(state); await p.screenshot({ path: `${DIR}/after/393-stock-no-toast.png` });
  console.log("noToast", JSON.stringify(R["393-noToast"])); await ctx.close();
}
fs.writeFileSync(`${DIR}/runs/stock-dedupe.json`, JSON.stringify(R, null, 1)); await b.close();
