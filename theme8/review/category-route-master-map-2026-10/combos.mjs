// TASK 04/04B — serie x format-matris ur verklig produktmedlemskap.
// Serie = medlemskap i seriens egen hubbkategori (Nyehandels sanning) eller
// det native Serie-attributet. Format = produktnamnets inledande produkttyp
// (Nyehandels egna namnkonvention "Vape - ...", "Cart - ...", "Buds – ...").
// Dedikerade routes = serie x format-kategorier i inventory.json.
// Kör: node combos.mjs -> runs/combos.json
import fs from "node:fs";
import path from "node:path";

const DIR = path.dirname(new URL(import.meta.url).pathname);
const mem = JSON.parse(fs.readFileSync(path.join(DIR, "runs/membership.json"), "utf8"));
const inv = JSON.parse(fs.readFileSync(path.join(DIR, "runs/inventory.json"), "utf8"));
const C = "/sv/categories/";

export const SERIES = [
  { name: "Magic Sauce", hub: "magic-sauce", attr: "Magic Sauce" },
  { name: "THCaB", hub: "thca" },
  { name: "THCbA", hub: "thcb" },
  { name: "Core", hub: "core", attr: "Core" },
  // 10-OH-THC legacy product -- NOT Delta-10 (Theme 8 catalog map labels this hub "D10"; decided 2026-10-27).
  { name: "10-OH-THC", hub: "10-oh-thc" },
  { name: "Nano-11", hub: "nano-11", attr: "Nano11" },
  { name: "THCV", hub: "thcv" },
  { name: "HHCPM", hub: "hhcpm" },
  { name: "THCNM", hub: "thcnm" }
];
export function formatOf(name) {
  const n = name.replace(/&amp;/g, "&");
  if (/^Vape\b/i.test(n)) return "vapes";
  if (/^Cart\b/i.test(n)) return "carts";
  if (/^(Buds|Blommor)\b/i.test(n)) return "buds";
  if (/^Hash\b/i.test(n)) return "hasch";
  if (/^PreRolled\b/i.test(n)) return "prerolls";
  if (/^Isolat\b/i.test(n)) return "isolat";
  if (/Batteri/i.test(n)) return "batterier";
  if (/Merch/i.test(n)) return "merch";
  return "other";
}
// Dedikerade/filtrerade serie x format-routes (route -> {series, format, kind})
const ROUTES = {
  "m-s-vapes": ["Magic Sauce", "vapes"], "m-s-buds": ["Magic Sauce", "buds"],
  "alla-cartridges?filters=Serie_Magic Sauce": ["Magic Sauce", "carts", "filter"],
  "hasch?filters=Serie_Magic Sauce": ["Magic Sauce", "hasch", "filter"],
  "thca-vapes": ["THCaB", "vapes"], "thca-carts": ["THCaB", "carts"], "thca-blommor": ["THCaB", "buds"], "thca-hash": ["THCaB", "hasch"],
  "thcb-vapes": ["THCbA", "vapes"], "thcb-carts": ["THCbA", "carts"],
  "alla-vapes?filters=Serie_Core": ["Core", "vapes", "filter"],
  "10-oh-thc-vapes": ["10-OH-THC", "vapes"],
  "nano11-blommor": ["Nano-11", "buds"],
  "thcv-vape": ["THCV", "vapes"], "thcv-carts": ["THCV", "carts"],
  "hhcpm-vapes": ["HHCPM", "vapes"], "hhcpm-blommor": ["HHCPM", "buds"],
  "thcnm-blommor": ["THCNM", "buds"], "thcnm-hash": ["THCNM", "hasch"]
};
const byRoute = Object.fromEntries(inv.routes.map(r => [r.route, r]));

const combos = {};
for (const p of mem.products) {
  const f = formatOf(p.name);
  for (const s of SERIES) {
    const inHub = p.categories.includes(C + s.hub);
    const inAttr = s.attr && p.serieAttr.includes(s.attr);
    if (!inHub && !inAttr) continue;
    const k = s.name + "|" + f;
    combos[k] = combos[k] || { series: s.name, format: f, products: [] };
    combos[k].products.push({ slug: p.slug, name: p.name.replace(/&amp;/g, "&"), via: [inHub && "hub", inAttr && "attr"].filter(Boolean) });
  }
}
for (const [route, [series, format, kind]] of Object.entries(ROUTES)) {
  const k = series + "|" + format;
  combos[k] = combos[k] || { series, format, products: [] };
  const r = byRoute[C + route];
  const members = (r && r.products || []).map(p => ({ slug: p.slug, name: p.name.replace(/&amp;/g, "&"), format: formatOf(p.name) }));
  (combos[k].routes = combos[k].routes || []).push({
    route: C + route, kind: kind || "dedicated", h1: r && r.h1, count: r && r.count,
    members, offFormat: members.filter(m => m.format !== format)
  });
}
for (const c of Object.values(combos)) {
  const want = new Set(c.products.map(p => p.slug));
  for (const r of c.routes || []) {
    const got = new Set(r.members.map(m => m.slug));
    r.missing = [...want].filter(s => !got.has(s));
  }
}
const out = Object.values(combos).sort((a, b) => a.series.localeCompare(b.series) || a.format.localeCompare(b.format));
fs.writeFileSync(path.join(DIR, "runs/combos.json"), JSON.stringify(out, null, 1));
for (const c of out) {
  console.log(`${c.series.padEnd(12)} ${c.format.padEnd(10)} real=${c.products.length} ` +
    (c.routes || []).map(r => `${r.route.replace(C, "")}[${r.kind} n=${r.count} off=${r.offFormat.length} miss=${r.missing.length}]`).join(" "));
}
