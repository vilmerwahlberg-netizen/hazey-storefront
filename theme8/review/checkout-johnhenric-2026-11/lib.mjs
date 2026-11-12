// Kassa-redesign 2026-11: gemensam korg + kassa i Theme 8-previewn. Ingen order.
// Korg: Magic Sauce 3.0 2 ml 3-pack blandat (2 × Gorilla Cookies, 1 × Tinky Winky) + 1 st vanlig.
import { chromium, ctxFor, open, ready, url, ROOT } from "../catalog-reconciliation-2026-11/lib/harness.mjs";
export { chromium, url, ROOT };
const MUA = "Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Mobile Safari/537.36";
export const HOME = "/sv/products/vape-magic-sauce-magic-farmers-2ml";
export const H = { 393: 852, 1440: 900 };
export const api = (p, method, u, body) => p.evaluate(async ({ method, u, body }) => {
  const x = decodeURIComponent((document.cookie.match(/XSRF-TOKEN=([^;]+)/) || [])[1] || "");
  const r = await fetch("/frontend-api/" + u, { method, credentials: "same-origin", headers: { Accept: "application/json", "Content-Type": "application/json", "X-Requested-With": "XMLHttpRequest", "X-XSRF-TOKEN": x }, body: body ? JSON.stringify(body) : undefined });
  let j = null; try { j = await r.json(); } catch { } return { status: r.status, json: j };
}, { method, u, body });
const go = async (p, u) => { for (let i = 0; ; i++) { try { return await p.goto(u, { waitUntil: "domcontentloaded", timeout: 60000 }); } catch (e) { if (i >= 3) throw e; await p.waitForTimeout(6000 * (i + 1)); } } };
const closeCart = async p => { await p.keyboard.press("Escape").catch(() => { }); await p.evaluate(() => { const b = document.querySelector("#cartAside .close-cart"); if (b && document.querySelector("#cart-side-wrap.is-active")) b.click(); }); await p.waitForTimeout(600); };
export async function filledCheckout(b, w) {
  const h = H[w] || 900;
  const ctx = await ctxFor(w < 768 ? { newContext: o => b.newContext({ ...o, userAgent: MUA }) } : b, w, h, { which: "after" });
  const p = await open(ctx, HOME); await ready(p, 3000);
  try { await p.getByRole("button", { name: "Godkänn alla" }).click({ timeout: 2000 }); } catch { }
  await p.locator(".hz8-pp__choice:not([hidden])").waitFor({ timeout: 30000 });
  await p.locator('.hz8-pc[data-qty="3"]').click(); await p.waitForTimeout(400);
  for (const [i, n] of ["Gorilla Cookies", "Gorilla Cookies", "Tinky Winky"].entries()) { await p.locator(`.hz8-up select[data-upslot="${i}"]`).selectOption({ label: n }); await p.waitForTimeout(150); }
  await p.locator(".hz8-pp__cta").click(); await p.waitForTimeout(4500); await closeCart(p);
  await p.locator('.hz8-pc[data-qty="0"]').click(); await p.waitForTimeout(400); await p.locator(".hz8-pp__cta").click(); await p.waitForTimeout(4500); await closeCart(p);
  const cart = ((await api(p, "GET", "cart")).json?.data?.items || []).map(i => i.name + " " + i.formatted_total);
  await go(p, url("/sv/checkout")); await p.waitForSelector("main.checkout", { timeout: 40000 });
  await p.frameLocator("#klarna-checkout-iframe").getByText("Betala köp").first().waitFor({ state: "visible", timeout: 60000 }).catch(() => console.error("Kustom ej redo"));
  await p.waitForTimeout(3000);
  return { ctx, p, cart, h };
}
export async function emptyCart(p) {
  await go(p, url(HOME)); await p.waitForTimeout(1500);
  for (const it of ((await api(p, "GET", "cart")).json?.data?.items || [])) await api(p, "DELETE", "cart/item/" + it.id);
  return ((await api(p, "GET", "cart")).json?.data?.items || []).length === 0;
}
export async function css(p, text) {
  await p.evaluate(t => { let s = document.getElementById("hz8-concept"); if (!s) { s = document.createElement("style"); s.id = "hz8-concept"; document.head.appendChild(s); } s.textContent = t; }, text);
  await p.waitForTimeout(900);
}
/* Ren nativ kassa: plockar bort alla kassaregler ur Theme 8:s CSS-fält (<style id="nyts">)
   i webbläsaren, behåller temats :root-variabler. Simulerar att det gamla kassablocket
   tas bort ur CSS-fältet. Inget ändras i admin. */
export async function stripThemeCheckout(p) {
  return p.evaluate(() => {
    const s = document.getElementById("nyts"); if (!s || !s.sheet) return 0; let n = 0;
    const strip = list => { for (let i = list.cssRules.length - 1; i >= 0; i--) { const r = list.cssRules[i];
      if (r.cssRules && !r.selectorText) { strip(r); if (!r.cssRules.length) { list.deleteRule(i); } continue; }
      if (/checkout/.test(r.cssText) && !/^:root/.test(r.cssText)) { list.deleteRule(i); n++; } } };
    strip(s.sheet); return n;
  });
}
