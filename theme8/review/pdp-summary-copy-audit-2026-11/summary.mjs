// TASK 24 -- "Kort om produkten" (.hz8-ppsum__lead) före/efter decimalfixen.
// before = external (Theme 8-previewns nuvarande loader, = origin/dev),
// after = lokal build (dist/theme8). Läser bara; inget skrivs till Nyehandel.
// node summary.mjs
import { chromium, ctxFor, open, ready, DIR } from "../universal-pdp-build-2026-10/lib.mjs"; import fs from "node:fs";
const PDPS = {
  175: "/sv/products/buds-magic-sauce-50-crazy-dog-5-gram", 260: "/sv/products/magic-sauce-vape-5ml",
  262: "/sv/products/cart-magic-sauce-magic-farmers-1ml", 152: "/sv/products/magic-sauce-hash-marrakesh-dream-5-gram",
  168: "/sv/products/magic-sauce-buds-magic-farmers-sverige-khalifa-kush-5-gram", 123: "/sv/products/merch-nyckelring-hazey",
  133: "/sv/products/cbd-cookies-adios-m-f", 215: "/sv/products/cookies-dual-chamber-cbd-vape-cereal-milk-london-pound-cake"
};
const VP = { mobile: [390, 844], desktop: [1440, 900] };
const b = await chromium.launch(); const R = [];
/* Facit: samma ingress som 85-pdp-pilot väljer, men ur serverns HTML utan JS. */
const raw = await b.newContext({ javaScriptEnabled: false }); const SRC = {};
for (const [id, route] of Object.entries(PDPS)) { const p = await raw.newPage(); await p.goto("https://hazeyse.nyehandel.se" + route, { waitUntil: "domcontentloaded" });
  SRC[id] = await p.evaluate(() => { const f = r => r ? [...r.querySelectorAll("p")].filter(p => p.textContent.trim().length > 40)[0] : null;
    const l = f(document.querySelector(".product-detail__information .short-description")) || f(document.querySelector("#product-information article.product-description"));
    return l ? l.textContent.replace(/\s+/g, " ").trim() : null; }); await p.close(); }
await raw.close();
for (const [id, route] of Object.entries(PDPS)) for (const [vp, [w, h]] of Object.entries(VP)) for (const which of ["external", "after"]) {
  const c = await ctxFor(b, w, h, { which }); const p = await open(c, route); await ready(p, 5000);
  const r = await p.evaluate(() => {
    const l = document.querySelector(".hz8-ppsum__lead"); const t = s => (s || "").replace(/\s+/g, " ").trim();
    return { h1: t((document.querySelector("h1") || {}).textContent), lead: l ? t(l.textContent) : null, sum: !!document.querySelector("#hz8-ppsum") };
  });
  r.prefixOk = r.lead == null ? SRC[id] == null : !!SRC[id] && SRC[id].startsWith(r.lead);
  if (which === "after") { const el = await p.$("#hz8-ppsum"); if (el) { await el.scrollIntoViewIfNeeded(); await el.screenshot({ path: new URL(`./proof/${id}-${vp}.png`, import.meta.url).pathname }); } }
  R.push({ id, vp, which, h1: r.h1, sum: r.sum, lead: r.lead, prefixOk: r.prefixOk });
  console.log(id, vp.padEnd(7), which.padEnd(8), r.prefixOk ? "OK " : "BAD", JSON.stringify((r.lead || "–").slice(0, 70)));
  await c.close();
}
fs.writeFileSync(new URL("./proof/summary.json", import.meta.url), JSON.stringify(R, null, 1));
await b.close();
