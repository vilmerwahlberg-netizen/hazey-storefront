// Läser Theme 8:s nuvarande CSS-fält (<style id="nyts">) från förhandsvisningen. Läser bara.
import fs from "node:fs"; import { chromium, url } from "./lib.mjs";
const b = await chromium.launch(); const p = await b.newPage();
await p.goto(url("/sv/checkout"), { waitUntil: "domcontentloaded", timeout: 60000 }); await p.waitForTimeout(3000);
const t = await p.evaluate(() => document.getElementById("nyts")?.textContent || "");
fs.writeFileSync(process.argv[2], t); console.log("längd", t.length); await b.close();
