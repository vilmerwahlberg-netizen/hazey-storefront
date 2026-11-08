// Läser alla kryssrutor/samtycken i Nyehandel-delen och i Kustom-ramen (Test Mode),
// avmarkerar nyhetsbrevet och kontrollerar att Kustom ändå går vidare till betalsätt.
// Fiktiva testuppgifter, klickar ALDRIG "Betala köp".
import { chromium, injectCheckoutCss } from "./lib.mjs"; import { toCheckout } from "./flow.mjs"; import fs from "node:fs";
const b = await chromium.launch(); const { p } = await toCheckout(b, 393, 852);
await injectCheckoutCss(p, "dist/theme8/hazey-theme8-checkout.css");
const R = {};
const nyBoxes = () => p.evaluate(() => [...document.querySelectorAll("main.checkout input[type=checkbox], main.checkout input[type=radio]")].map(i => ({ type: i.type, checked: i.checked, label: (i.closest("label")?.innerText || i.getAttribute("aria-label") || "").trim().replace(/\s+/g, " "), required: i.required })));
const f = p.frameLocator("#klarna-checkout-iframe");
const kBoxes = async () => f.locator("input[type=checkbox], [role=checkbox], [role=switch]").evaluateAll(els => els.map(e => ({ checked: e.checked ?? e.getAttribute("aria-checked"), label: (e.closest("label")?.innerText || e.getAttribute("aria-label") || e.parentElement?.innerText || "").trim().replace(/\s+/g, " ").slice(0, 160), visible: !!(e.offsetWidth || e.offsetHeight) })));
const kText = async () => (await f.locator("body").innerText()).replace(/\n+/g, " | ");
R.nyStart = await nyBoxes(); R.kustomStart = await kBoxes();
// Avmarkera nyhetsbrevet (Nyehandels egen ruta)
await p.locator(".newsletter-subscription input[type=checkbox]").uncheck(); await p.waitForTimeout(4000);
R.nyAfterUncheck = await nyBoxes();
R.errorsAfterUncheck = await p.evaluate(() => ({ sys: document.querySelector(".checkout-system-error")?.innerText || null, help: [...document.querySelectorAll(".help.is-danger")].map(e => e.innerText) }));
R.totalAfterUncheck = await p.evaluate(() => document.querySelector(".checkout-total")?.textContent.trim());
// Kustom steg 1 + 2 med fiktiva uppgifter
await f.locator("input").first().fill("test@example.com");
await f.locator('input[name*="postal" i], input[autocomplete*="postal" i]').first().fill("11646");
await f.getByRole("button", { name: /^Fortsätt$/ }).click(); await p.waitForTimeout(6000);
const fill = async (label, v) => { const l = f.getByLabel(label, { exact: true }).first(); if (await l.count()) await l.fill(v); };
await fill("Förnamn", "Test"); await fill("Efternamn", "Testsson"); await fill("Adress", "Götgatan 1"); await fill("Ort", "Stockholm"); await fill("Mobilnummer", "0701234567");
R.kustomForm = await kBoxes();
await f.getByRole("button", { name: /^Fortsätt$/ }).click().catch(() => {}); await p.waitForTimeout(8000);
R.kustomPayment = await kBoxes();
const t = await kText();
R.kustomReachedPayment = /Betalsätt/.test(t) && /Betala köp/.test(t);
R.kustomConsentText = (t.match(/Genom att klicka[^|]*/) || [""])[0];
R.kustomTail = t.slice(t.indexOf("Betalsätt"), t.indexOf("Betalsätt") + 900);
R.nyEnd = await nyBoxes();
await p.locator("#kustom-checkout").scrollIntoViewIfNeeded(); await p.waitForTimeout(1500);
await p.screenshot({ path: "theme8/review/checkout-task18-2026-11/runs/consent-unchecked-payment.png", fullPage: false });
fs.writeFileSync("theme8/review/checkout-task18-2026-11/runs/consent.json", JSON.stringify(R, null, 1));
console.log(JSON.stringify(R, null, 1)); await b.close();
