// Kontroll av den RIKTIGA Theme 8-förhandsvisningen (ingen lokal build, ingen injektion). Läser bara.
import { chromium } from "playwright";
const PV = "?preview=v9kzdmqz4w60l5n"; const b = await chromium.launch();
for (const w of [393, 1440]) {
  const p = await b.newPage({ viewport: { width: w, height: 900 } });
  await p.goto("https://hazeyse.nyehandel.se/" + PV, { waitUntil: "domcontentloaded", timeout: 60000 }); await p.waitForTimeout(7000);
  console.log(w, JSON.stringify(await p.evaluate(() => ({ js: [...document.scripts].map(s => s.src).filter(s => /hazey-theme8/.test(s)),
    cannab: (window.HZ8?.headerCannabinoids || []).map(g => g.title || g.heading || g.label).join(" | "), magicSauce: JSON.stringify(window.HZ8?.headerCannabinoids || []).includes("magic-sauce"),
    navLabel: [...document.querySelectorAll("#store-header *")].some(e => e.childElementCount === 0 && /^Cannabinoider$/i.test(e.textContent.trim())) }))));
  await p.close();
}
await b.close();
