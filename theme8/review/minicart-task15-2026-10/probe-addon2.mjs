// TASK 15 (read-only): alla sidor av alla-produkter + pennor, letar pre-roll/batteri.
import { chromium, ctxFor, open, DIR } from "./lib.mjs"; import fs from "node:fs";
const b = await chromium.launch(); const ctx = await ctxFor(b, 1440, 900);
const p = await open(ctx, "/sv/categories/alla-produkter");
const R = await p.evaluate(async () => {
  const names = (cards) => cards.map(c => { const t = document.createElement("div"); t.innerHTML = c.html; const a = t.querySelector("a[href*='/products/']"); return ((t.querySelector(".name")||{}).textContent||"").trim() + " | " + (a && HZ8.path(a.getAttribute("href"))); });
  const out = { all: [] };
  for (let i = 1; i <= 8; i++) { try { const c = await HZ8.fetchPage("/sv/categories/alla-produkter?page=" + i, HZ8.categoryCards); if (!c.length) break; out.all.push(...names(c)); } catch (e) { break; } }
  out.pennor = names(await HZ8.fetchPage("/sv/categories/pennor", HZ8.categoryCards));
  const t = await (await fetch("/sv/search?q=pre")).text(); out.pre = [...new Set(t.match(/\/sv\/products\/[a-z0-9\-]*(pre|roll|joint)[a-z0-9\-]*/g) || [])];
  return out;
});
R.all = [...new Set(R.all)];
fs.writeFileSync(`${DIR}/runs/probe-addon2.json`, JSON.stringify(R, null, 1));
console.log(R.all.length); console.log(R.all.filter(n => /pre|roll|joint|batter|pen|510/i.test(n)).join("\n")); console.log("PENNOR\n" + R.pennor.join("\n")); console.log("PRE", R.pre);
await b.close();
