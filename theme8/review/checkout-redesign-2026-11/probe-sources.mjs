// Varifrån kommer kassans nuvarande styling i Theme 8-previewn? Läser stilark/skript, ingen ändring.
import fs from "node:fs"; import path from "node:path";
import { chromium, filledCheckout, emptyCart } from "./lib.mjs";
const DIR = path.dirname(new URL(import.meta.url).pathname);
const b = await chromium.launch(); const { ctx, p } = await filledCheckout(b, 1440);
const info = await p.evaluate(() => {
  const sheets = [...document.styleSheets].map(ss => { let rules = []; try { rules = [...ss.cssRules]; } catch { }
    const owner = ss.ownerNode; const src = ss.href || (owner && ("<" + owner.tagName.toLowerCase() + (owner.id ? "#" + owner.id : "") + "> " + (owner.textContent || "").length + " tecken"));
    const hits = rules.map(r => r.cssText).filter(t => /checkout/.test(t));
    return { src, n: rules.length, checkoutRules: hits.length, trygg: hits.some(t => /Trygg kassa/.test(t)), svensk: rules.some(r => /Svenskt lager/.test(r.cssText)), sample: hits.slice(0, 3).map(t => t.slice(0, 140)) }; });
  const scripts = [...document.scripts].map(s => s.src || ("inline " + s.textContent.trim().slice(0, 80).replace(/\s+/g, " ")));
  return { sheets: sheets.filter(s => s.checkoutRules), allSheets: sheets.map(s => s.src + " (" + s.n + ")"), scripts, html: document.documentElement.className, body: document.body.className, HZ8: typeof window.HZ8 };
});
fs.writeFileSync(path.join(DIR, "runs/sources.json"), JSON.stringify(info, null, 1));
console.log(JSON.stringify(info, null, 1).slice(0, 6000));
await emptyCart(p); await b.close();
