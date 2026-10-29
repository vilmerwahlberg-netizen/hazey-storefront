// TASK 10B-R1 -- Produktfakta innehåller hela produktbeskrivningen i initial DOM:
// varje stycke/listpunkt/rubrik i Nyehandels egen beskrivning (samma sida med
// ?hz8-pdp=0) måste finnas i Produktfakta-disclosuren (även stängd).
// node desc.mjs <which> [id,..]
import { chromium, ctxFor, open, ready, DIR } from "./lib.mjs"; import fs from "node:fs";
import { PRODUCTS } from "./products.mjs";
const [which = "after", ids = "91,92,57,84,88,17,72,119"] = process.argv.slice(2);
const b = await chromium.launch(); const R = {};
for (const id of ids.split(",")) {
  const c1 = await ctxFor(b, 1440, 900, { which }); const p1 = await open(c1, PRODUCTS[id].route + "?hz8-pdp=0"); await ready(p1, 4000);
  const parts = await p1.evaluate(() => [...document.querySelectorAll("#product-information article p, #product-information article li, #product-information article h1, #product-information article h2, #product-information article h3, .product-detail__information .short-description p")].map(e => e.textContent.replace(/\s+/g, " ").trim()).filter(t => t.length > 3));
  await c1.close();
  const c2 = await ctxFor(b, 1440, 900, { which }); const p2 = await open(c2, PRODUCTS[id].route); await ready(p2, 5000);
  const got = await p2.evaluate(parts => { const d = document.querySelector(".hz8-acc--produktfakta"); const t = d ? d.textContent.replace(/\s+/g, " ") : ""; return { closed: d ? !d.open : null, missing: parts.filter(x => t.indexOf(x) === -1) }; }, parts);
  R[id] = { parts: parts.length, ...got }; console.log(id, "parts", parts.length, "missing", got.missing.length, JSON.stringify(got.missing.map(x => x.slice(0, 70))));
  await c2.close();
}
fs.writeFileSync(`${DIR}/runs/desc-${which}.json`, JSON.stringify(R, null, 1));
await b.close();
