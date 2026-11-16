// FÖRBEREDD, INTE KÖRD: länkar tillbaka till rättslägeshubben från THCA-, THCB-,
// THCH- och HHC-guiderna (beslut R5). Skriptet ändrar bara repo-blocken
// (theme8/blocks/*.html); att föra ut dem till Nyehandel görs separat med
// ../landing-pages-admin-2026-11/nh-pages.mjs apply <slug> --update, efter godkännande.
//
// Spärr: inget skrivs förrän hubbens slutliga adress fungerar, dvs. svarar 200 i
// preview, inte omdirigeras och visar H1 "Cannabinoider i Sverige".
//
//   node lankar-tillbaka.mjs                       torrkörning: visar ändringarna
//   node lankar-tillbaka.mjs --apply               skriver (bara om spärren går igenom)
//   HUB=/sv/page/cannabinoider-sverige node …      om en annan slug väljs (beslut R3)
import fs from "node:fs"; import path from "node:path";
const DIR = path.dirname(new URL(import.meta.url).pathname);
const BLOCKS = path.join(DIR, "../../blocks");
const HUB = process.env.HUB || "/sv/page/lagliga-cannabinoider-sverige";
const APPLY = process.argv.includes("--apply");
const MARK = `href="${HUB}"`;

// Insättningspunkter: sista posten i respektive lista, så att befintliga länkar står kvar orörda.
const EDITS = {
  // Fältatlasguiderna: listan "Relaterat" i högerspalten.
  "thcb.html": { after: /(<ul class="hz8-atlas__related" role="list" aria-labelledby="hz8-atlas-related">[\s\S]*?)(\n\s*<\/ul>)/, li: `\n        <li><a href="${HUB}">Alla ämnen och källor: rättsläget</a></li>` },
  "thch.html": { after: /(<ul class="hz8-atlas__related" role="list" aria-labelledby="hz8-atlas-related">[\s\S]*?)(\n\s*<\/ul>)/, li: `\n        <li><a href="${HUB}">Alla ämnen och källor: rättsläget</a></li>` },
  "hhc.html": { after: /(<ul class="hz8-atlas__related" role="list" aria-labelledby="hz8-atlas-related">[\s\S]*?)(\n\s*<\/ul>)/, li: `\n        <li><a href="${HUB}">Alla ämnen och källor: rättsläget</a></li>` },
  // THCA-guiden (annan mall): listan "Läs mer om THCA".
  "thca.html": { after: /(<ul class="hz8-guide__articles" role="list">[\s\S]*?)(\n\s*<\/ul>)/, li: `\n      <li><a href="${HUB}"><strong>Cannabinoider i Sverige</strong><span>Alla ämnen med status, datum och källa.</span></a></li>` }
};

async function hubWorks() {
  const r = await fetch(`https://hazeyse.nyehandel.se${HUB}?preview=v9kzdmqz4w60l5n`, { redirect: "manual" });
  const html = r.status === 200 ? await r.text() : "";
  const ok = r.status === 200 && /<h1>\s*Cannabinoider i Sverige\s*<\/h1>/.test(html);
  return { ok, status: r.status, location: r.headers.get("location") };
}

const check = await hubWorks();
console.log(`Hubben ${HUB}: HTTP ${check.status}${check.location ? " → " + check.location : ""}, ${check.ok ? "fungerar" : "fungerar INTE ännu"}`);
for (const [file, e] of Object.entries(EDITS)) {
  const f = path.join(BLOCKS, file); const c = fs.readFileSync(f, "utf8");
  if (c.includes(MARK)) { console.log(file, "har redan länken"); continue; }
  if (!e.after.test(c)) { console.log(file, "INSÄTTNINGSPUNKT SAKNAS"); process.exitCode = 1; continue; }
  const next = c.replace(e.after, (m, a, z) => a + e.li + z);
  console.log(`${file}: +${e.li.trim()}`);
  if (APPLY) {
    if (!check.ok) { console.log("  inte skrivet: hubbens slutliga adress fungerar inte ännu"); continue; }
    fs.writeFileSync(f, next); console.log("  skrivet");
  }
}
