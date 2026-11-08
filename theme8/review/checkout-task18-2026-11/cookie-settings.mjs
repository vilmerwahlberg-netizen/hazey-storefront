// Endast läsande: öppnar "Inställningar" i cookiebannern och läser kategoriernas förval.
import { chromium, ctxFor, url } from "./lib.mjs";
const b = await chromium.launch(); const ctx = await ctxFor(b, 393, 852); const p = await ctx.newPage();
await p.goto(url("/sv"), { waitUntil: "domcontentloaded", timeout: 60000 }); await p.waitForTimeout(6000);
await p.screenshot({ path: "theme8/review/checkout-task18-2026-11/runs/cookie-393-banner.png" });
await p.getByRole("button", { name: "Inställningar" }).first().click(); await p.waitForTimeout(1500);
console.log(await p.evaluate(() => { const root = document.querySelector(".show--consent") || document.body;
  const m = [...document.querySelectorAll("input[type=checkbox]")].filter(i => i.closest("[class*=cookie],[class*=consent],[id*=cookie],[id*=consent],[class*=cc-]") || /cookie|consent|nödvändig|statistik|marknad/i.test(i.closest("label,div")?.innerText || "")).map(i => ({ checked: i.checked, disabled: i.disabled, label: (i.closest("label,div")?.innerText || "").trim().replace(/\s+/g, " ").slice(0, 90) }));
  const btns = [...document.querySelectorAll("button")].filter(e => e.offsetParent && /godkänn|neka|avvisa|spara|nödvändiga/i.test(e.textContent)).map(e => e.textContent.trim());
  const panel = [...document.querySelectorAll("div")].find(d => /Spara/.test(d.innerText) && /nödvändig|statistik|marknadsf/i.test(d.innerText) && d.innerText.length < 2500);
  return { boxes: m, btns, panel: panel?.innerText.replace(/\s+/g, " ").slice(0, 900) }; }));
await p.screenshot({ path: "theme8/review/checkout-task18-2026-11/runs/cookie-393-settings.png" });
await b.close();
