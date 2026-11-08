// TASK 18 harness (read-only). Återanvänder TASK 15-harnessens mönster:
// Theme 8-preview, dev-loadern utbytt mot lokal build. Kassan laddar inte
// temats JS -- dess CSS-fält simuleras genom att injicera lokal
// dist/theme8/hazey-theme8-checkout.css (opts.checkoutCss: "local" | "base" | null).
// Ingen order läggs, inget fält i Kustom-ramen fylls eller skickas.
export * from "../minicart-task15-2026-10/lib.mjs";
import fs from "node:fs"; import path from "node:path";
export const DIR18 = path.dirname(new URL(import.meta.url).pathname);
export async function injectCheckoutCss(p, file) {
  if (!file) return;
  const css = fs.readFileSync(file, "utf8").replace(/https:\/\/vilmerwahlberg-netizen\.github\.io\/hazey-storefront\/theme8\/assets\//g, "https://vilmerwahlberg-netizen.github.io/hazey-storefront/theme8/assets/");
  await p.evaluate(css => { let s = document.getElementById("t18-css"); if (!s) { s = document.createElement("style"); s.id = "t18-css"; document.head.appendChild(s); } s.textContent = css; }, css);
  await p.waitForTimeout(800);
}
