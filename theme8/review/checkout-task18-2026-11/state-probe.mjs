// Läser Nyehandels kassadata (Vuex), inget skrivs.
import { chromium } from "./lib.mjs"; import { toCheckout } from "./flow.mjs"; import fs from "node:fs";
const b = await chromium.launch(); const { p } = await toCheckout(b, 1440, 900);
const out = await p.evaluate(() => {
  const vm = document.querySelector("#app")?.__vue__ || [...document.querySelectorAll("*")].find(e => e.__vue__)?.__vue__;
  const st = vm && vm.$store && vm.$store.state; if (!st) return { err: "no store" };
  const keys = Object.keys(st); const co = st.checkout || {};
  const pick = o => JSON.parse(JSON.stringify(o, (k, v) => typeof v === "string" && v.length > 300 ? v.slice(0, 300) : v));
  return { keys, checkoutKeys: Object.keys(co), checkout: pick(co) };
});
fs.writeFileSync(`${"theme8/review/checkout-task18-2026-11"}/runs/checkout-state.json`, JSON.stringify(out, null, 1));
console.log(out.keys, out.checkoutKeys);
await b.close();
