// PDP -> riktig köpknapp -> minicart -> "Till kassan" -> kassa. Ingen order.
import { chromium, ctxFor, open, openCart } from "./lib.mjs";
export const PDP = "/sv/products/vape-magic-sauce-magic-farmers-2ml";
export async function toCheckout(b, w, h, opts = {}) {
  const ctx = await ctxFor(b, w, h, opts); const p = await open(ctx, PDP);
  await p.locator(".hz8-pp__cta").first().click(); await p.waitForTimeout(3500);
  const auto = await p.evaluate(() => !!document.querySelector("#cart-side-wrap.is-active"));
  if (!auto) await openCart(p);
  const mini = await p.evaluate(() => { const a = document.querySelector("#cartAside"); return a && a.innerText.replace(/\s+/g, " ").slice(0, 600); });
  if (opts.miniShot) await p.screenshot({ path: opts.miniShot });
  await Promise.all([p.waitForURL(/checkout/, { timeout: 60000, waitUntil: "domcontentloaded" }), p.locator("#cartAside .button.buy").click()]);
  await p.waitForSelector("main.checkout", { timeout: 40000 });
  await p.frameLocator("#klarna-checkout-iframe").getByText("Betala köp").first().waitFor({ state: "visible", timeout: 60000 }).catch(e => console.error("kustom not ready", e.message)); await p.waitForTimeout(4000);
  return { ctx, p, mini, auto };
}
if (import.meta.url === `file://${process.argv[1]}`) {
  const b = await chromium.launch();
  const { p, mini, auto } = await toCheckout(b, 1440, 900);
  console.log("autoOpen", auto, "\nMINI", mini);
  const info = await p.evaluate(() => ({
    url: location.href, body: document.body.className,
    styles: [...document.querySelectorAll("link[rel=stylesheet],style")].map(s => s.href || ("<style> " + s.textContent.length + " " + s.textContent.slice(0, 80).replace(/\s+/g, " "))),
    scripts: [...document.scripts].map(s => s.src || "inline:" + s.textContent.slice(0, 60).replace(/\s+/g, " ")),
    hz8Rule: [...document.styleSheets].some(ss => { try { return [...ss.cssRules].some(r => r.cssText.includes("Trygg kassa")); } catch { return false; } }),
    HZ8: typeof window.HZ8, frames: [...document.querySelectorAll("iframe")].map(f => f.id + " " + f.src.slice(0, 90)),
  }));
  console.log(JSON.stringify(info, null, 1));
  console.log((await p.evaluate(() => document.body.outerHTML.replace(/<script[\s\S]*?<\/script>/g, "").replace(/<iframe[\s\S]*?<\/iframe>/g, "<iframe/>").replace(/<svg[\s\S]*?<\/svg>/g, "<svg/>").replace(/ data-v-[a-z0-9]+=""/g, ""))));
  await p.screenshot({ path: "theme8/review/checkout-task18-2026-11/runs/probe-1440-native.png", fullPage: true });
  await b.close();
}
