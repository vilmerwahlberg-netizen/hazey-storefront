// TASK 17 — statisk route-/ID-kontroll av Theme 8-källkoden mot dagens Nyehandel (runs/nh.json).
// Varje kategori-route, produkt-route och numeriskt produkt-id i theme8/js listas med fil:rad,
// dagens status (antal produkter, tom, saknas) och om filter-routen fungerar (Serie/Varumärke finns inte längre).
// Kör: node routes.mjs [JS-katalog]  ->  runs/routes.json
import fs from "node:fs";
import path from "node:path";
const DIR = path.dirname(new URL(import.meta.url).pathname);
const JS = process.argv[2] || path.resolve(DIR, "../../js");
const NH = JSON.parse(fs.readFileSync(path.join(DIR, "runs/nh.json"), "utf8"));
const slugs = new Set(NH.products.map(p => p.slug));
const ids = new Map(NH.products.map(p => [p.id, p.slug]));
const out = { categories: [], products: [], ids: [] };
for (const f of fs.readdirSync(JS).filter(f => f.endsWith(".js")).sort()) {
  fs.readFileSync(path.join(JS, f), "utf8").split("\n").forEach((line, i) => {
    const at = `${f}:${i + 1}`;
    for (const m of line.matchAll(/\/sv\/categories\/([a-z0-9-]+)((?:\?|%3F)[^"' ,)]*)?|hub:\s*"([a-z0-9-]+)"/g)) {
      const slug = m[1] || m[3], q = m[2] || "";
      const c = NH.categories["/sv/categories/" + slug];
      const filtered = /filters=/.test(q);
      out.categories.push({ at, route: "/sv/categories/" + slug + q, exists: !!c, count: c ? c.count : null, h1: c ? c.h1 : null,
        status: !c ? "SAKNAS" : filtered ? "DÖD (filtret finns inte längre)" : c.count === 0 ? "TOM" : "OK" });
    }
    for (const m of line.matchAll(/\/sv\/products\/([a-z0-9-]+)/g)) out.products.push({ at, slug: m[1], status: slugs.has(m[1]) ? "OK" : "SAKNAS (gammal slug)" });
    for (const m of line.matchAll(/(?:[{,]\s*|\[)(\d{1,3})\s*:\s*["{]/g)) if (/FAMILIES|members|VERIFIED_DOCS|plan|doc:|variants:|\/sv\/products/.test(line)) out.ids.push({ at, id: +m[1], today: ids.get(+m[1]) || null });
    if (/forEach/.test(line) && /\[\s*\d+(?:\s*,\s*\d+)+\s*\]/.test(line)) for (const m of line.match(/\[\s*\d+(?:\s*,\s*\d+)+\s*\]/)[0].match(/\d+/g)) out.ids.push({ at, id: +m, today: ids.get(+m) || null });
  });
}
fs.writeFileSync(path.join(DIR, "runs/routes.json"), JSON.stringify(out, null, 1));
const tally = a => a.reduce((o, x) => (o[x.status] = (o[x.status] || 0) + 1, o), {});
console.log("categories", tally(out.categories), "products", tally(out.products), "ids", out.ids.length, "ids that exist today", out.ids.filter(x => x.today).length);
