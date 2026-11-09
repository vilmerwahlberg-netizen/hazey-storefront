// Läser Kustom-ramen i Test Mode: e-post + postnummer med Kustoms testvärden,
// "Fortsätt", sedan läs leverans-/betalval. Klickar ALDRIG "Betala köp".
import { chromium } from "./lib.mjs"; import { toCheckout } from "./flow.mjs";
const b = await chromium.launch(); const { p } = await toCheckout(b, 1440, 900);
const f = p.frameLocator("#klarna-checkout-iframe");
const txt = async () => (await f.locator("body").innerText()).replace(/\n+/g, " | ").slice(0, 2500);
console.log("START", await txt());
await f.locator("input").first().fill("test@example.com");
const inputs = await f.locator("input").count(); console.log("inputs", inputs);
await f.locator('input[name*="postal" i], input[autocomplete*="postal" i]').first().fill("11646").catch(e => console.log("no postal", e.message));
await f.getByRole("button", { name: /^Fortsätt$/ }).click(); await p.waitForTimeout(6000);
console.log("STEP2", await txt());
await p.screenshot({ path: "theme8/review/checkout-task18-2026-11/runs/kustom-step2.png", fullPage: true });
const fill = async (label, v) => { const l = f.getByLabel(label, { exact: true }).first(); if (await l.count()) await l.fill(v); };
await fill("Förnamn", "Test"); await fill("Efternamn", "Testsson"); await fill("Adress", "Götgatan 1"); await fill("Ort", "Stockholm"); await fill("Mobilnummer", "0701234567");
await f.getByRole("button", { name: /^Fortsätt$/ }).click().catch(e => console.log("no fortsatt", e.message)); await p.waitForTimeout(8000);
console.log("STEP3", await txt());
await p.screenshot({ path: "theme8/review/checkout-task18-2026-11/runs/kustom-step3-filled.png", fullPage: true });
// Fyll eventuella personfält med Kustoms egna testdata om knappen finns
const td = f.getByText("Test Data"); if (await td.count()) { await td.first().click().catch(() => {}); await p.waitForTimeout(2000); console.log("TESTDATA MENU", await txt()); }
await p.screenshot({ path: "theme8/review/checkout-task18-2026-11/runs/kustom-step3.png", fullPage: true });
console.log("NY shipping", await p.evaluate(() => document.querySelector(".checkout-information .shipping")?.innerText.replace(/\s+/g, " ")), "total", await p.evaluate(() => document.querySelector(".checkout-total")?.textContent.trim()));
await b.close();
