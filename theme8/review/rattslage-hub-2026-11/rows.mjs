// Bygger tabellraderna för theme8/blocks/rattslage.html ur en kontrollerad lista (KALLKONTROLL.md).
import fs from "node:fs";
const S = {
  r1554: ["https://www.riksdagen.se/sv/dokument-och-lagar/dokument/svensk-forfattningssamling/forordning-19921554-om-kontroll-av-narkotika_sfs-1992-1554/", "Förordning 1992:1554"],
  r58: ["https://www.riksdagen.se/sv/dokument-och-lagar/dokument/svensk-forfattningssamling/forordning-199958-om-forbud-mot-vissa_sfs-1999-58/", "Förordning 1999:58"],
  s2023_379: ["https://svenskforfattningssamling.se/sites/default/files/sfs/2023-06/SFS2023-379.pdf", "SFS 2023:379", true],
  s2023_901: ["https://svenskforfattningssamling.se/sites/default/files/sfs/2023-12/SFS2023-901.pdf", "SFS 2023:901", true],
  s2024_985: ["https://svenskforfattningssamling.se/sites/default/files/sfs/2024-11/SFS2024-985.pdf", "SFS 2024:985", true],
  s2024_986: ["https://svenskforfattningssamling.se/sites/default/files/sfs/2024-11/SFS2024-986.pdf", "SFS 2024:986", true],
  s2025_663: ["https://svenskforfattningssamling.se/sites/default/files/sfs/2025-06/SFS2025-663.pdf", "SFS 2025:663", true],
  s2026_1109: ["https://svenskforfattningssamling.se/sites/default/files/sfs/2026-06/SFS2026-1109.pdf", "SFS 2026:1109", true],
  fhm_thcb: ["https://www.folkhalsomyndigheten.se/contentassets/23593f19f3e84792bc4a823f8240894c/delta-9-thcb_00862-2024.pdf", "Yttrande 00862-2024", true],
  fhm_h4: ["https://www.folkhalsomyndigheten.se/contentassets/23593f19f3e84792bc4a823f8240894c/00726-2023-h4-cbd.pdf", "Yttrande 00726-2023", true],
  hd: ["https://www.domstol.se/hogsta-domstolen/avgoranden2/2019/21081/", "NJA 2019 s. 531"],
};
const N = "Narkotika", HF = "Hälsofarlig vara", NOT = "Inte i förteckningarna";
const MON = ["januari","februari","mars","april","maj","juni","juli","augusti","september","oktober","november","december"];
const d = iso => { const [y, m, dd] = iso.split("-"); return `<time datetime="${iso}">${+dd} ${MON[+m - 1]} ${y}</time>`; };
// [namn, skrivsätt/fullt namn, söktermer, status, not, datum, källa, guide]
const ROWS = [
  ["THCA", "delta-9-THCA-A, tetrahydrocannabinolsyra", "thc-a thc a", N, "", "2026-07-14", "s2026_1109", ["/sv/page/thca", "THCA-guiden"]],
  ["THCB", "delta-9- och delta-8-THCB, tetrahydrocannabutol", "thc-b thc b", NOT, "Folkhälsomyndigheten utreder ämnet sedan 5 mars 2024.", "", "fhm_thcb", ["/sv/page/thcb", "THCB-guiden"]],
  ["THCH", "delta-9- och delta-8-THCH, tetrahydrocannabihexol", "thc-h thc h", N, "", "2024-12-10", "s2024_985", ["/sv/page/thch", "THCH-guiden"]],
  ["HHC", "hexahydrocannabinol", "", N, "", "2023-07-11", "s2023_379", ["/sv/page/hhc", "HHC-guiden"]],
  ["HHCP", "hexahydrocannabiforol", "", N, "", "2023-07-11", "s2023_379", ["/sv/page/hhc#fragor", "Om HHCP"]],
  ["THCP", "delta-9- och delta-8-THCP, tetrahydrocannabiforol", "thc-p thc p", N, "", "2024-01-16", "s2023_901"],
  ["THC-acetat", "delta-9- och delta-8-THC-acetat", "thc-o thco thc o", N, "", "2024-01-16", "s2023_901"],
  ["HHC-acetat", "HHCO, hexahydrocannabinolacetat", "hhc-o hhco hhc o", N, "", "2024-01-16", "s2023_901"],
  ["HHCPO", "HHCP-acetat", "hhcp-o", N, "", "2024-12-10", "s2024_985"],
  ["THCJD", "delta-9- och delta-8-THCJD, även kallat THC-C8", "thc-jd thc-c8", N, "", "2024-12-10", "s2024_985"],
  ["THCPO", "delta-9-THCPO, THCP-acetat", "thcp-o", HF, "", "2024-12-10", "s2024_986"],
  ["HHCH", "hexahydrocannabihexol", "hhc-h", HF, "", "2024-12-10", "s2024_986"],
  ["10-OH-HHC", "10-hydroxihexahydrocannabinol, samt 10-OH-HHCP", "10ohhhc 10-oh-hhcp", HF, "", "2025-07-15", "s2025_663"],
  ["HHC-C8 och HHC-C9", "hexahydrocannabinol-C8 och -C9", "hhcc8 hhcc9", HF, "", "2025-07-15", "s2025_663"],
  ["H4-CBD", "även skrivet H4CBD", "h4cbd", NOT, "Folkhälsomyndigheten utreder ämnet sedan 11 april 2023.", "", "fhm_h4"],
  ["CBD", "cannabidiol", "", NOT, "En CBD-produkt som innehåller THC kan ändå vara narkotika, enligt Högsta domstolen 2019.", "", "hd"],
  ["CBG", "cannabigerol", "", NOT, "", "", "r1554"],
  ["CBN", "cannabinol", "", NOT, "", "", "r1554"],
  ["THCV", "tetrahydrocannabivarin", "thc-v", NOT, "", "", "r1554"],
  ["THCNM", "även skrivet THC-NM", "thc-nm", "Öppen fråga", "Ingen officiell källa anger vilket ämne namnet avser.", "", null],
];
const esc = s => s.replace(/&/g, "&amp;");
const out = ROWS.map(([name, alias, terms, status, note, date, src, guide]) => {
  const s = src && S[src];
  const srcCell = s ? `<a href="${s[0]}" rel="noopener" target="_blank">${s[1]}<span class="hz8-visually-hidden">${s[2] ? " (PDF" : " ("}, öppnas i ny flik)</span></a>` : `<span class="hz8-hub__none">Ingen</span>`;
  const dateCell = date ? d(date) : `<span class="hz8-hub__none" aria-label="Inget datum">–</span>`;
  const guideCell = guide ? `<a href="${guide[0]}">${guide[1]}</a>` : "";
  return `            <tr data-hz8-terms="${esc(terms)}">
              <th scope="row"><span class="hz8-hub__name">${esc(name)}</span><span class="hz8-hub__alias">${esc(alias)}</span></th>
              <td><span class="hz8-hub__status">${status}</span>${note ? `<span class="hz8-hub__note">${note}</span>` : ""}</td>
              <td class="hz8-hub__more" data-label="Sedan:">${dateCell}</td>
              <td class="hz8-hub__more" data-label="Källa:">${srcCell}</td>
              <td class="hz8-hub__more hz8-hub__guide">${guideCell}</td>
            </tr>`;
}).join("\n");
const f = process.argv[2]; let html = fs.readFileSync(f, "utf8");
html = html.replace(/            <!--HZ8-HUB-ROWS-->|<!--ROWS-START-->[\s\S]*<!--ROWS-END-->/, `<!--ROWS-START-->\n${out}\n            <!--ROWS-END-->`);
fs.writeFileSync(f, html); console.log(ROWS.length, "rader");
