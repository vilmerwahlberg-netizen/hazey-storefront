import fs from "node:fs"; import path from "node:path";
import { chromium, filledCheckout, emptyCart } from "./lib.mjs";
const DIR = path.dirname(new URL(import.meta.url).pathname);
const b = await chromium.launch(); const { p } = await filledCheckout(b, 1440);
const t = await p.evaluate(() => document.getElementById("nyts").textContent);
fs.writeFileSync(path.join(DIR, "runs/theme8-css-field.css"), t);
await emptyCart(p); await b.close();
