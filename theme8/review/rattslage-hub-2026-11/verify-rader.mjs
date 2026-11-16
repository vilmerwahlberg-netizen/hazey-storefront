// Kontroll av hubbens 20 ämnesrader mot officiella källor (2026-11-16).
//
// För varje rad:
//  1. Ämnesnamnet exakt som i förordningen (regex nedan) finns i riksdagens
//     konsoliderade text av rätt förordning – för 1999:58 i den lydelse som
//     gäller 16 november (bilagan "Upphör att gälla U:2026-11-25").
//  2. Ämnet står INTE i den andra förordningen (narkotika ≠ hälsofarlig vara).
//  3. Den första ändringsförfattningen i kedjan sedan 2023 (registret hos
//     rkrattsbaser, PDF från svenskforfattningssamling.se, text via Ghostscript)
//     vars text innehåller namnet är den SFS som raden anger, och dess
//     "träder i kraft den …" är radens datum.
//  4. Rader "Inte i förteckningarna": varken kortnamn eller kemiskt namn finns i
//     någon av förordningarna; utredning enligt Folkhälsomyndighetens lista.
//  5. Raden i blocket (theme8/blocks/rattslage.html) har just denna status,
//     detta datum och denna SFS-länk.
// Kräver: node, gs (Ghostscript), nät. Cache: $CACHE (standard: os.tmpdir()/hz8-sfs).
// Kör: node theme8/review/rattslage-hub-2026-11/verify-rader.mjs
import fs from "node:fs"; import os from "node:os"; import path from "node:path"; import { execFileSync } from "node:child_process";
const DIR = path.dirname(new URL(import.meta.url).pathname);
const CACHE = process.env.CACHE || path.join(os.tmpdir(), "hz8-sfs"); fs.mkdirSync(CACHE, { recursive: true });
const UA = { "user-agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)" };
const norm = t => t.replace(/-\s*\n\s*/g, "-").replace(/\s+/g, " ");

async function cached(name, url, bin = false) {
  const f = path.join(CACHE, name);
  if (!fs.existsSync(f)) { const r = await fetch(url, { headers: UA }); if (!r.ok) throw new Error(url + " " + r.status); fs.writeFileSync(f, bin ? Buffer.from(await r.arrayBuffer()) : await r.text()); }
  return f;
}
// Ändringskedjan sedan 2023 enligt rkrattsbaser (registret 16 nov 2026) + SFS 2026:1803 (utfärdad 22 okt 2026,
// ännu inte i 1999:58-registret). 2024:278/279 upphävdes före ikraftträdandet av 2024:286/287 och räknas inte.
const CHAIN = {
  "1992:1554": ["2023:5", "2023:379", "2023:901", "2024:288", "2024:481", "2024:985", "2025:77", "2025:264", "2025:662", "2025:1314", "2026:340", "2026:1109"],
  "1999:58": ["2023:6", "2023:380", "2023:902", "2024:289", "2024:959", "2024:986", "2025:265", "2025:663", "2026:341", "2026:1110", "2026:1803"]
};
const MON = { januari: 1, februari: 2, mars: 3, april: 4, maj: 5, juni: 6, juli: 7, augusti: 8, september: 9, oktober: 10, november: 11, december: 12 };
async function sfsText(nr) {
  const [y, n] = nr.split(":"); const txt = path.join(CACHE, `SFS${y}-${n}.txt`);
  if (!fs.existsSync(txt)) {
    const page = fs.readFileSync(await cached(`doc-${y}${n}.html`, `https://svenskforfattningssamling.se/doc/${y}${n}.html`), "utf8");
    const rel = (page.match(/sites\/default\/files\/sfs\/[0-9-]+\/SFS[0-9]+-[0-9]+\.pdf/) || [])[0]; if (!rel) throw new Error("ingen PDF för " + nr);
    const pdf = await cached(`SFS${y}-${n}.pdf`, "https://svenskforfattningssamling.se/" + rel, true);
    execFileSync("gs", ["-q", "-sDEVICE=txtwrite", "-o", txt, pdf]);
    fs.writeFileSync(txt + ".url", "https://svenskforfattningssamling.se/" + rel);
  }
  const t = fs.readFileSync(txt, "utf8");
  const m = t.match(/träder i kraft den (\d+) ([a-zé]+) (\d{4})/);
  return { nr, url: fs.readFileSync(txt + ".url", "utf8"), text: norm(t), inForce: m ? `${m[3]}-${String(MON[m[2]]).padStart(2, "0")}-${m[1].padStart(2, "0")}` : null, amends: (norm(t).match(/förordningen \((1992:1554|1999:58)\)/) || [])[1] };
}
const cons1554 = norm(fs.readFileSync(await cached("sfs-1992-1554.text", "https://data.riksdagen.se/dokument/sfs-1992-1554.text"), "utf8"));
const cons58raw = fs.readFileSync(await cached("sfs-1999-58.text", "https://data.riksdagen.se/dokument/sfs-1999-58.text"), "utf8");
const i0 = cons58raw.indexOf("Bilaga /Upphör att gälla U:2026-11-25/"), i1 = cons58raw.indexOf("Bilaga /Träder i kraft I:2026-11-25/");
const cons58now = norm(i0 >= 0 && i1 > i0 ? cons58raw.slice(i0, i1) : cons58raw), cons58after = norm(i1 >= 0 ? cons58raw.slice(i1) : "");
const cons = { "1992:1554": cons1554, "1999:58": cons58now };
const fhmList = norm(fs.readFileSync(await cached("fhm-yttranden.html", "https://www.folkhalsomyndigheten.se/regler-och-tillsyn/yttanden-enligt-forstorandelagen/"), "utf8").replace(/<[^>]+>/g, " "));

const N = "Narkotika", HF = "Hälsofarlig vara", NOT = "Inte i förteckningarna";
// [rad, status, förordning, SFS, i kraft, exakta namn (regex), FHM-utredning (regex på listan) eller null]
const ROWS = [
  ["THCA", N, "1992:1554", "2026:1109", "2026-07-14", [/delta-9-THCA-A\b/]],
  ["THCB", NOT, null, null, null, [/\bTHCB\b/i, /tetrahydrocannabutol/i], /delta-9-THCB/],
  ["THCH", N, "1992:1554", "2024:985", "2024-12-10", [/delta-8-THCH\b/, /delta-9-THCH\b/]],
  ["HHC", N, "1992:1554", "2023:379", "2023-07-11", [/hexahydrocannabinol, HHC\)/]],
  ["HHCP", N, "1992:1554", "2023:379", "2023-07-11", [/hexahydrocannabiforol, HHCP\)/]],
  ["THCP", N, "1992:1554", "2023:901", "2024-01-16", [/delta-8-THCP(?![-A-Za-z])/, /delta-9-THCP(?![-A-Za-z])/]],
  ["THC-acetat", N, "1992:1554", "2023:901", "2024-01-16", [/delta-8-THC-acetat/, /delta-9-THC-acetat/]],
  ["HHC-acetat", N, "1992:1554", "2023:901", "2024-01-16", [/HHC-acetat, HHCO\)/]],
  ["HHCPO", N, "1992:1554", "2024:985", "2024-12-10", [/HHCP-acetat, HHCPO\)/]],
  ["THCJD", N, "1992:1554", "2024:985", "2024-12-10", [/delta-8-THCJD\b/, /delta-9-THCJD\b/]],
  ["THCPO", HF, "1999:58", "2024:986", "2024-12-10", [/delta-9-THCPO\b/]],
  ["HHCH", HF, "1999:58", "2024:986", "2024-12-10", [/hexahydrocannabihexol, HHCH\)/]],
  ["10-OH-HHC", HF, "1999:58", "2025:663", "2025-07-15", [/10-OH-HHC(?!P)/, /10-OH-HHCP/]],
  ["HHC-C8 och HHC-C9", HF, "1999:58", "2025:663", "2025-07-15", [/HHC-C8\b/, /HHC-C9\b/]],
  ["H4-CBD", NOT, null, null, null, [/H4-?CBD/i, /hexahydrocannabidiol/i], /H4-CBD/],
  ["CBD", NOT, null, null, null, [/\bCBD\b/, /\bcannabidiol\b/i], null],
  ["CBG", NOT, null, null, null, [/\bCBG\b/, /cannabigerol/i], null],
  ["CBN", NOT, null, null, null, [/\bCBN\b/, /(?<![a-z])cannabinol\b/i], null],
  ["THCV", NOT, null, null, null, [/\bTHCV\b/, /tetrahydrocannabivarin/i], null],
  ["THCNM", "Öppen fråga", null, null, null, [/THC-?NM/i], null]
];
// Ämnen utan utredning ska inte heller stå på FHM:s lista
const FHM_ABSENT = { CBD: /(?<![-A-Za-z0-9])CBD\b|(?<![a-z])cannabidiol/i, CBG: /\bCBG\b|cannabigerol/i, CBN: /\bCBN\b/i, THCV: /\bTHCV\b|cannabivarin/i, THCNM: /THC-?NM/i };

const chain = {}; for (const [ord, list] of Object.entries(CHAIN)) chain[ord] = await Promise.all(list.map(sfsText));
const block = fs.readFileSync(path.join(DIR, "../../blocks/rattslage.html"), "utf8");
const rowsHtml = [...block.matchAll(/<tr data-hz8-terms="[^"]*">([\s\S]*?)<\/tr>/g)].map(m => m[1]);
const out = [];
for (const [name, status, ord, sfs, date, res, fhm] of ROWS) {
  const r = { rad: name, status, problem: [] };
  const html = rowsHtml.find(h => (h.match(/hz8-hub__name">([^<]*)</) || [])[1] === name.replace("och", "och"));
  if (!html) r.problem.push("raden saknas i blocket");
  else {
    if ((html.match(/hz8-hub__status">([^<]*)</) || [])[1] !== status) r.problem.push("annan status i blocket");
    const t = (html.match(/<time datetime="([^"]+)"/) || [])[1] || null; if (t !== date) r.problem.push(`datum i blocket ${t} ≠ ${date}`);
    if (sfs && !html.includes(`SFS${sfs.replace(":", "-")}.pdf`)) r.problem.push("SFS-länken i blocket pekar inte på " + sfs);
  }
  if (ord) {
    const other = ord === "1992:1554" ? "1999:58" : "1992:1554";
    r.konsoliderad = res.map(x => x.test(cons[ord])); if (r.konsoliderad.includes(false)) r.problem.push("namnet saknas i konsoliderad " + ord);
    if (res.some(x => x.test(cons[other]))) r.problem.push("namnet står också i " + other);
    if (ord === "1999:58") r.efter25nov = res.map(x => x.test(cons58after));
    const first = chain[ord].find(s => s.amends === ord && res.every(x => x.test(s.text)));
    r.forstaSFS = first ? first.nr : null; r.iKraft = first ? first.inForce : null; r.pdf = first ? first.url : null;
    if (r.forstaSFS !== sfs) r.problem.push(`första SFS med namnet är ${r.forstaSFS}, raden anger ${sfs}`);
    if (r.iKraft !== date) r.problem.push(`ikraftträdande ${r.iKraft} ≠ ${date}`);
  } else {
    r.iNagonForordning = res.some(x => x.test(cons1554) || x.test(cons58now) || x.test(cons58after));
    if (r.iNagonForordning) r.problem.push("namnet finns i en förordning");
    if (fhm) { r.fhmUtredning = fhm.test(fhmList); if (!r.fhmUtredning) r.problem.push("saknas på FHM:s lista"); }
    if (FHM_ABSENT[name]) { r.fhmLista = FHM_ABSENT[name].test(fhmList); if (r.fhmLista) r.problem.push("står på FHM:s lista"); }
  }
  out.push(r); console.log(name.padEnd(18), r.problem.length ? "AVVIKELSE: " + r.problem.join("; ") : "ok", ord ? `${r.forstaSFS} ${r.iKraft}` : "");
}
const chainInfo = Object.fromEntries(Object.entries(chain).map(([o, l]) => [o, l.map(s => ({ sfs: s.nr, amends: s.amends, inForce: s.inForce }))]));
fs.writeFileSync(path.join(DIR, "verify-rader.json"), JSON.stringify({ checkedAt: new Date().toISOString(), consolidated: { "1992:1554": (cons1554.match(/Ändrad: t\.o\.m\. SFS [0-9:]+/) || [])[0], "1999:58": (norm(cons58raw).match(/Ändrad: t\.o\.m\. SFS [0-9:]+/) || [])[0] }, chain: chainInfo, rows: out }, null, 1));
