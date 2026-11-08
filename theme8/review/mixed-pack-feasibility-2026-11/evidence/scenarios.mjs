// TASK 19 — scenarier mot pilotpaketen 263 (Core, pivot 1-3, produkt 255) och 264 (MS50, pivot 4-6, produkt 132 låst 243).
// Kör: node scenarios.mjs [filter]  -> en isolerad session per scenario via probe-checkout.mjs (korg + kassa, töms efteråt).
import { execFileSync } from "node:child_process"; import fs from "node:fs"; import os from "node:os"; import path from "node:path";
const pkg = (variant, picks, qty = 1) => ({ product_variant_id: variant, quantity: qty, meta: { data: { packageProductVariants: picks.map(([id, pivot_id]) => ({ id, pivot_id })) } } });
const P1 = "/sv/products/pilot-t19-heros-core-2ml-3-pack", P2 = "/sv/products/pilot-t19-magic-sauce-50-5g-3-pack";
// Core 255: 425 Gelato(69) 429 Strawberry Kush(34) 431 Melon Haze(31) 433 Pineapple Express(80) 435 Super Lemon Haze(71) 438 Coconut Cake(65)
// MS50: 243 Yoda(132) 324 John Lemon(203) 303 KitKat(188, hasch) 257 Tinky Winky(146, lager 0)
const S = {
  "P1-S1-tre-olika": [P1, [pkg(467, [[425, 1], [431, 2], [438, 3]])]],
  "P1-S2-samma-x3": [P1, [pkg(467, [[425, 1], [425, 2], [425, 3]])]],
  "P1-S3-2plus1": [P1, [pkg(467, [[429, 1], [429, 2], [433, 3]])]],
  "P1-S4-tva-paket-olika": [P1, [pkg(467, [[425, 1], [431, 2], [438, 3]]), pkg(467, [[435, 1], [435, 2], [429, 3]])]],
  "P1-V1-fremmande-variant-MS50": [P1, [pkg(467, [[425, 1], [431, 2], [243, 3]])]],
  "P1-V2-lager-over-gelato-x3-antal24": [P1, [pkg(467, [[425, 1], [425, 2], [425, 3]], 24)]],
  "P1-V3-pivot-fran-annat-paket": [P1, [pkg(467, [[425, 4], [431, 5], [438, 6]])]],
  "P1-V4-bara-tva-platser": [P1, [pkg(467, [[425, 1], [431, 2]])]],
  "P1-V5-ingen-meta": [P1, [{ product_variant_id: 467, quantity: 1 }]],
  "P1-V6-dubbel-pivot": [P1, [pkg(467, [[425, 1], [431, 1], [438, 1]])]],
  "P2-S0-last-yoda-x3": [P2, [pkg(468, [[243, 4], [243, 5], [243, 6]])]],
  "P2-V1-andra-ms50-produkter": [P2, [pkg(468, [[243, 4], [324, 5], [303, 6]])]],
  "P2-V2-slutsald-ms50": [P2, [pkg(468, [[243, 4], [324, 5], [257, 6]])]],
  "P2-V3-core-variant": [P2, [pkg(468, [[243, 4], [243, 5], [425, 6]])]]
};
const only = process.argv[2] ? new RegExp(process.argv[2]) : null;
for (const [name, [start, payloads]] of Object.entries(S)) {
  if (only && !only.test(name)) continue;
  const f = path.join(fs.mkdtempSync(path.join(os.tmpdir(), "t19-")), name + ".json");
  fs.writeFileSync(f, JSON.stringify(payloads));
  console.log("\n######## " + name);
  try { console.log(execFileSync("node", ["probe-checkout.mjs", name, "@" + f, start], { encoding: "utf8", timeout: 240000 }).slice(0, 2600)); }
  catch (e) { console.log("FEL", String(e.stdout || e).slice(0, 800)); }
}
