// TASK 17 — analysdokument efter migreringen (ingen nätverkstrafik). Samma regel som Task 10A:
// en PDF räknas som verifierad analys bara om länktexten är en labbrapport/COA OCH filnamnets strain
// (COA_<Strain>-<halt>-<serie>_...) är produktens egen strain (enkel produkt: namnets strainled;
// variabel produkt: länktextens strain = ett av produktens variantval). Batch-/destillatfiler
// ("Labbtestat destillat", filnamn utan strain), myndighetsrapporter och bloggar räknas aldrig.
// Kör: node docs-verify.mjs -> runs/docs.json
import fs from "node:fs"; import path from "node:path";
const DIR = path.dirname(new URL(import.meta.url).pathname);
const NH = JSON.parse(fs.readFileSync(path.join(DIR, "runs/nh.json"), "utf8")).products;
const key = s => String(s || "").toLowerCase().replace(/samourai/g, "samurai").normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]/g, "");
const LAB = /labb|analys|\bcoa\b|certifikat|certificate/i;
const out = [];
for (const p of NH) {
  const name = (p.state && p.state.name) || p.h1 || "";
  const segs = name.split(/\s+[–-]\s+/).map(s => s.trim());
  const variants = ((p.state && p.state.options) || []).flatMap(o => o.values);
  const docs = [...new Map(p.pdfs.map(d => [d.href, d])).values()].map(d => {
    const file = decodeURIComponent(d.href.split("?")[0].split("/").pop());
    const host = d.href.replace(/^https?:\/\//, "").split("/")[0];
    const subj = (/^COA_(.+?)-\d+/.exec(file) || [])[1] || null; // t.ex. "Tinky-Winky", "Disposable-Vape-pen-Crazy-Dog"
    let relation = "inte analys";
    let variant = null;
    if (LAB.test(d.text) && !/folkhalsomyndigheten|effekter-cannabisbruk/i.test(d.href)) {
      if (/destillat/i.test(d.text) || !subj) relation = "batch/destillat (ingen strain i filnamnet)";
      else {
        variant = variants.find(v => key(d.text).includes(key(String(v).replace(/\s*\(.*\)$/, "")))) || null;
        const own = variant || segs.find(s => !/\d|^(buds|blommor|hash|vape|cart|magic sauce|nano11|d10|cbd|cbn)$/i.test(s) && key(subj).includes(key(s)));
        const textStrain = (/(?:labbtest|labbrapport)\s+(.+)$/i.exec(d.text) || [])[1];
        if (!variant && variants.length && textStrain) { relation = "variant saknas i NH (" + textStrain + ")"; return { file, host, text: d.text, subject: subj, variant: textStrain, relation }; }
        relation = own && key(subj).endsWith(key(own).slice(0, Math.max(4, key(own).length - 1))) || (own && key(subj).includes(key(own))) ? (variant ? "variant-verifierad" : "egen-verifierad") : "annan strain";
      }
    }
    return { file, host, text: d.text, subject: subj, variant, relation };
  });
  if (docs.length) out.push({ id: p.id, slug: p.slug, name, variants, docs });
}
fs.writeFileSync(path.join(DIR, "runs/docs.json"), JSON.stringify(out, null, 1));
const t = {}; out.forEach(p => p.docs.forEach(d => t[d.relation] = (t[d.relation] || 0) + 1)); console.log(t);
out.filter(p => p.docs.some(d => d.relation === "annan strain")).forEach(p => console.log("ANNAN", p.id, p.slug, p.docs.filter(d => d.relation === "annan strain").map(d => d.file).join(",")));
