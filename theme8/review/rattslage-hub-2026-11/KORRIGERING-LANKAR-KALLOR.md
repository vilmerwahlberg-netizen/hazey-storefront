# Korrigering av länkar och källor (16 november 2026)

Underlag: `LANK-OCH-KALLAUDIT-2026-11-16.md`. Gren `feat/theme8-rattslage-hub`. Ingen merge, ingen adminändring och ingen ändring av produkter, kategorier eller omdirigeringar. Inget innehåll är borttaget.

## Rättat

| Plats | Före | Efter |
|---|---|---|
| Hubben, "I sortimentet nu" | Nano11 → `/sv/categories/nano` (inga produktkort) | `/sv/categories/nano-11`: 16 Nano-11-kort, räknaren visar 17 |
| Hubben, källa 7 | "Regeringen narkotikaklassar nitazener" (nämner inga cannabinoider) | SFS 2024:985, ändringsförfattning: utfärdad 7 november 2024, i kraft 10 december 2024, för in THCH, THCJD och HHCPO |
| Hubben och THCB-guiden, förordning 1999:58 | "ändrad t.o.m. SFS 2026:1803 · kontrollerad 16 november 2026" | "kontrollerad 16 november 2026 i den lydelse som gällde då · ändringen SFS 2026:1803 träder i kraft först 25 november 2026" |
| THCA-guiden, källor | "Socialdepartementet" → departementets startsida | "Regeringen narkotikaklassar 18 substanser", pressmeddelande 11 juni 2026, beslutet som för in delta-9-THCA-A, i kraft 14 juli 2026 |
| THCB-guiden, källor | De två FHM-nyheterna stod bland belägget | Belägget först: FHM:s THCB-yttrande och båda förordningarna. Nyheterna står sist, märkta "Bakgrund: … nämner inte THCB och belägger inte ämnets status". Forskningsartikeln är märkt "vetenskaplig bakgrund om ämnet, inte om svensk rättslig status". Ingen post är borttagen. |

**THCA- och THCB-guiderna finns redan i Nyehandel** (id 14 och 15). Ändringarna ligger bara i repo-blocken. De förs ut med `nh-pages.mjs apply thca --update` och `apply thcb --update` efter godkännande.

## Verifierat

**Alla 20 ämnesrader** (`verify-rader.mjs` → `verify-rader.json`): reproducerbart och helt, inte stickprov.
- **Underlag:**
  - Hela ändringskedjan sedan 2023 för båda förordningarna, enligt rkrattsbasers register, plus SFS 2026:1803. PDF:erna hämtas från svenskforfattningssamling.se och texten extraheras med Ghostscript.
  - Riksdagens konsoliderade texter.
  - Folkhälsomyndighetens lista över ämnen som utreds.
- **Kontroll per rad:**
  - Exakt ämnesnamn enligt förordningen finns i rätt förordning. För 1999:58 gäller det lydelsen den 16 november.
  - Namnet finns inte i den andra förordningen.
  - Den första ändringen i kedjan som innehåller namnet är den SFS raden anger, och dess "träder i kraft" är radens datum.
  - Statusen, datumet och SFS-länken i blocket stämmer.
- **Resultat:** 20 av 20 utan avvikelse.
  - 4 rader (THCPO, HHCH, 10-OH-HHC, HHC-C8/C9) står kvar även i 1999:58:s lydelse från 25 november. SFS 2026:1803 påverkar alltså ingen rad.
  - 2024:278 och 2024:279 upphävdes före ikraftträdandet (2024:286/287) och räknas inte.
- **Inte i förteckningarna** (THCB, H4-CBD, CBD, CBG, CBN, THCV, THCNM): varken kortnamn eller kemiskt namn finns i någon förordning. THCB och H4-CBD står på FHM:s lista. CBD, CBG, CBN, THCV och THCNM gör det inte.

**Interna länkar mot rätt innehåll och ankare** (`check-links.mjs` → `check-links.json`, riktiga sidor i Theme 8-preview):

| Mål | Kontroll | Resultat |
|---|---|---|
| `/sv/page/thca` | H1 THCA | ok |
| `/sv/page/thca#alternativ` | Ankaret visar "Alternativ till THCA" | ok |
| `/sv/page/thcb`, `/sv/page/thch`, `/sv/page/hhc` | H1 THCB, THCH respektive HHC | ok |
| `/sv/page/hhc#fragor` | Ankaret innehåller "Vad är HHCP?" | ok |
| `/sv/categories/magic-sauce` | 38 kort, alla Magic Sauce | ok |
| `/sv/categories/nano-11` | 16 kort, alla Nano 11 | ok |
| `/sv/page/faq` | H1 "Vanliga frågor" | ok |
| `/sv/posts` | 41 artikellänkar | ok |

Hubbens egna ankare (`#amnesindex`, `#metod`, `#statusord`, `#oppna-fragor`, `#kallor`) finns (`verify.json`).

**Hubben vid 393, 1440 och 1920** (lokal build, fixtur):
- 1 H1, ingen sidledsscroll, 0 fel och 20/20 rader.
- Lägsta kontrast 4,53. Sök, ankare, FAQ och öppningsbara rader fungerar med tangentbordet.
- 32 unika länkar: 200 eller ankare.
- THCB-guiden vid 393: 1 H1, ingen sidledsscroll, 0 fel.

**SEO** (`seo-regression.json`):
- Samma H1, titel- och metaförslag.
- Synliga svar på alla fyra sökfrågorna.
- 20 rader och 51 länkar.
- Texten växer från 9 772 till 9 919 tecken (de nya källbeskrivningarna).

## Förberett, inte infört

`lankar-tillbaka.mjs` lägger in länken till hubben:
- i "Relaterat" på THCB, THCH och HHC ("Alla ämnen och källor: rättsläget")
- i "Läs mer om THCA" på THCA ("Cannabinoider i Sverige")

En spärr hindrar skrivning tills hubbens slutliga adress svarar 200 utan omdirigering och visar rätt H1. I dag svarar `/sv/page/lagliga-cannabinoider-sverige` 404, så skriptet vägrar. Skriptet ändrar bara repo-blocken. Att föra ut dem till Nyehandel är ett eget steg. Byts slugen (beslut R3), körs det med `HUB=/sv/page/<slug>`.

## Kvar för innehållsansvarig

1. **Metodtexten är för absolut** (auditen, prioritet 2). Kapitel 02 skriver i dag "Ett ämne är narkotika eller hälsofarlig vara i Sverige när det står i en av två förteckningar …", trots att även Läkemedelsverkets föreskrifter och cannabisdefinitionen kan avgöra.
   - Förslag: "Det här indexet kontrollerar ämnen mot två förteckningar som regeringen beslutar om: …"
   - Inte ändrat, eftersom formuleringen ska godkännas av innehållsansvarig.
2. **Ingen utsedd granskare.** Kontrolldatumet 16 november avser min källkontroll, inte en ansvarig persons granskning (beslut R2). Ett nytt "senast kontrollerad" ska inte sättas förrän en granskare har gått igenom raderna.
3. **THCB-raden** anger yttrandet om delta-9-THCB (5 mars 2024). Delta-8-THCB utreds sedan 15 augusti 2024 (FHM 03028-2024). Raden är korrekt men kan kompletteras med det andra yttrandet.
4. **CBD- och cannabissvaren** återger Högsta domstolen och lagens hampundantag. De ska granskas juridiskt; ingen generell status anges.
5. **THCNM-artikeln och kategorin** säger att THCNM är lagligt (beslut R8). De är orörda.
6. **Nano-11:** 16 kort mot räknarens 17. Troligen ett kort som inte visas (till exempel slut i lager). Det rör kategorin, inte hubben.
7. **Utföra i Nyehandel, efter godkännande:**
   - THCA- och THCB-guidernas källändringar
   - hubben
   - länkarna tillbaka från guiderna
   - kontroll av gamla adressen (beslut R6)
