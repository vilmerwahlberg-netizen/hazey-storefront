// TASK 15 (read-only): sortimentets namn för tilläggslogik (pre-roll / batteri / cart).
import { chromium, ctxFor, open, DIR } from "./lib.mjs"; import fs from "node:fs";
const b = await chromium.launch(); const ctx = await ctxFor(b, 1440, 900);
const p = await open(ctx, "/sv/categories/alla-produkter");
const R = await p.evaluate(async () => {
  const out = {};
  const cards = await HZ8.fetchPage("/sv/categories/alla-produkter", HZ8.categoryCards);
  out.all = cards.map(c => { const t = document.createElement("div"); t.innerHTML = c.html; const a = t.querySelector("a[href*='/products/']"); return ((t.querySelector(".name")||{}).textContent||"").trim() + " | " + (a && a.getAttribute("href")) + " | " + (((t.querySelector(".price ins")||t.querySelector(".price"))||{}).textContent||"").trim() + " | var=" + !!t.querySelector(".has-variants") + " | sold=" + !!t.querySelector(".is-sold-out, .sold-out"); });
  out.fmt = HZ8.catalog.build().formats ? HZ8.catalog.build().formats.map(f => f.key + " " + f.href) : Object.keys(HZ8.catalog.build());
  out.helpers = Object.keys(HZ8).sort();
  return out;
});
fs.writeFileSync(`${DIR}/runs/probe-addon.json`, JSON.stringify(R, null, 1));
console.log(R.all.length, "\n" + R.all.join("\n") + "\n" + R.fmt.join("\n") + "\n" + R.helpers.join(" "));
await b.close();
