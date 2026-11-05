// TASK 17C — CUTOUT-CANDIDATES.md ur runs/cutout-match.json: vilka befintliga frilagda original som kan
// ersätta en inbakad bakgrund på samma sätt som Yoda, och varför övriga inte kan det.
import fs from "node:fs"; import path from "node:path";
const DIR = path.dirname(new URL(import.meta.url).pathname);
const M = JSON.parse(fs.readFileSync(path.join(DIR, "runs/cutout-match.json"), "utf8"));
const base = f => path.basename(f);
const ok = M.filter(m => m.verdict === "godkänd kandidat"), near = M.filter(m => m.alpha.ok && m.verdict === "ingen säker matchning" && m.ratio > 3 && m.best.err < 20);
const noAlpha = M.filter(m => !m.alpha.ok), none = M.filter(m => m.alpha.ok && !ok.includes(m) && !near.includes(m));
const t = m => `| ${base(m.file)} | ${m.size.join("×")} | ${m.best.nhId} \`${m.best.slug}\` bild ${m.best.imageId} | ${m.best.err} | ×${m.ratio} | ${m.coverage ? (m.coverage.t30d * 100).toFixed(2) + " %" : "–"} | ${(m.samePhoto || []).filter(s => s.slug !== m.best.slug).map(s => s.slug).join(", ") || "–"} |`;
const H = "| Fil | Storlek | Matchad bild | Fel (0-255) | Avstånd till nästa foto | Täckning (2 px tol.) | Samma foto även på |\n|---|---|---|---:|---:|---:|---|";
let md = `# Frilagda original: kandidater efter Yoda (TASK 17C, ${new Date().toISOString().slice(0, 10)})\n\n`;
md += `Genererad av \`cutout-candidates.mjs\` ur \`runs/cutout-match.json\` (\`cutout-match.mjs\`). Källor: Yoda-mastern (\`cutouts/masters/\`) och de 12 Canva-exporterna som redan låg i huvudrepot (\`theme8/review/storefront-task-system/needs-prep/task-04c-category-template-rollout/series-hub-rollout/assets/products/\`, ursprung export-download.canva.com enligt filernas metadata). Fler Canva-filer kan inte sökas härifrån utan Canva-inloggning (\`/mcp\`) eller en lokal export.\n\n`;
md += `Godkänt kräver: alfakanal med helt genomskinlig kant och ingen produkt som rör dukens kant; bildmatchning med fel < 14 och minst 1,6× avstånd till närmaste andra foto; minst 99 % av katalogbildens produkt täckt (2 px registreringstolerans). **Inget här är använt eller uppladdat** — nästa steg efter ditt godkännande av Yoda är \`cutout-prep.mjs <png>\` + \`cutout-review.mjs <slug>\` per fil.\n\n`;
md += `## Godkända (${ok.length})\n\n${H}\n${ok.map(t).join("\n")}\n\n`;
md += `## Troliga, kräver din bekräftelse (${near.length})\n\nEntydig närmaste bild men felet ligger strax över gränsen (annan export/komprimering). Bekräfta visuellt innan de används.\n\n${H}\n${near.map(t).join("\n")}\n\n`;
md += `## Ingen säker matchning (${none.length})\n\nFilen har alfa men motsvarar ingen nuvarande katalogbild (annan strain/produkt eller produkten finns inte i katalogen).\n\n${H}\n${none.map(t).join("\n")}\n\n`;
md += `## Saknar alfakanal (${noAlpha.length}) — inte frilagda original\n\nHelbildskompositioner (bakgrunden är målad, kanten inte genomskinlig). Kan inte ersätta en inbakad bakgrund.\n\n| Fil | Storlek | Kant genomskinlig | Pixlar mot dukens kant |\n|---|---|---:|---:|\n${noAlpha.map(m => `| ${base(m.file)} | ${m.size.join("×")} | ${(m.alpha.ringClear * 100).toFixed(0)} % | ${m.alpha.touchesEdge} |`).join("\n")}\n`;
fs.writeFileSync(path.join(DIR, "CUTOUT-CANDIDATES.md"), md); console.log(ok.length, near.length, none.length, noAlpha.length);
