# Rättslägeshubben: källkontroll rad för rad

16 november 2026. Varje status, datum och källa i `theme8/blocks/rattslage.html` är kontrollerad för sig mot primärkällor. Raderna byggs av `rows.mjs` ur samma lista som står här.

## Metod

1. **Konsoliderad text** (riksdagen, `data.riksdagen.se/dokument/sfs-….text`):
   - Förordning (1992:1554) om kontroll av narkotika, ändrad t.o.m. SFS 2026:1109.
   - Förordning (1999:58) om förbud mot vissa hälsofarliga varor, ändrad t.o.m. SFS 2026:1803.
   - I båda söktes varje ämnesnamn och skrivsätt.
2. **Ändringsförfattningen** (svenskforfattningssamling.se, PDF):
   - "Utfärdad den …" och "träder i kraft den …" lästa ur PDF:en.
   - Ämnet hittat i bilagan.
   - Kontrollerat att ämnet saknas i närmast föregående ändring av samma förordning, så att det är rätt SFS som förde in det.
3. **Folkhälsomyndighetens lista över ämnen som utreds** ("Yttranden enligt förstörandelagen"), läst 16 november, för ämnen som inte står i förteckningarna.
4. **Övrigt:** Högsta domstolens avgörande och Livsmedelsverkets sida för CBD. Lag (1999:42) 3 § för vad "hälsofarlig vara" innebär.

En underagent gjorde grovsökningen. Jag stickprovade själv datum och ämnen i PDF:erna för 2023:901, 2024:985, 2024:986, 2025:663 och 2026:1803, FHM-yttrandena för H4-CBD och delta-8-THCB, HD-sidan och Livsmedelsverkets sida. Kopior ligger i sessionens scratchpad (`hub/research/`), inte i repot.

## Raderna

| Ämne | Status | Sedan | Källa | Belägg |
|---|---|---|---|---|
| THCA | Narkotika | 14 juli 2026 | SFS 2026:1109 | Bilaga 1: "delta-9-THC-syra A, delta-9-THCA-A". Utfärdad 11 juni 2026, i kraft 14 juli 2026. |
| THCB | Inte i förteckningarna | – | FHM yttrande 00862-2024 | Saknas i båda förteckningarna. FHM utreder delta-9-THCB sedan 5 mars 2024 (00862-2024) och delta-8-THCB sedan 15 augusti 2024 (03028-2024). |
| THCH | Narkotika | 10 december 2024 | SFS 2024:985 | delta-8-THCH och delta-9-THCH. Utfärdad 7 november 2024. |
| HHC | Narkotika | 11 juli 2023 | SFS 2023:379 | "hexahydrocannabinol, HHC". Utfärdad 8 juni 2023. |
| HHCP | Narkotika | 11 juli 2023 | SFS 2023:379 | "hexahydrocannabiforol, HHCP" |
| THCP | Narkotika | 16 januari 2024 | SFS 2023:901 | delta-8-THCP och delta-9-THCP. Utfärdad 14 december 2023. |
| THC-acetat | Narkotika | 16 januari 2024 | SFS 2023:901 | "delta-8-THC-acetat" och "delta-9-THC-acetat" |
| HHC-acetat | Narkotika | 16 januari 2024 | SFS 2023:901 | "hexahydrocannabinolacetat, HHC-acetat, HHCO" |
| HHCPO | Narkotika | 10 december 2024 | SFS 2024:985 | "HHCP-acetat, HHCPO". Finns inte i 2023:901 eller 2024:481. |
| THCJD | Narkotika | 10 december 2024 | SFS 2024:985 | "delta-8-THC-C8, delta-8-THCJD" och "delta-9-THC-C8, delta-9-THCJD" |
| THCPO | Hälsofarlig vara | 10 december 2024 | SFS 2024:986 | "delta-9-THCP-acetat, delta-9-THCPO", bara i 1999:58. Finns inte i 1992:1554. |
| HHCH | Hälsofarlig vara | 10 december 2024 | SFS 2024:986 | "hexahydrocannabihexol, HHCH" |
| 10-OH-HHC | Hälsofarlig vara | 15 juli 2025 | SFS 2025:663 | 10-OH-HHC och 10-OH-HHCP. Utfärdad 12 juni 2025. |
| HHC-C8 och HHC-C9 | Hälsofarlig vara | 15 juli 2025 | SFS 2025:663 | "hexahydrocannabinol-C8, HHC-C8", "-C9, HHC-C9" |
| H4-CBD | Inte i förteckningarna | – | FHM yttrande 00726-2023 | FHM 11 april 2023: "En sådan utredning har dock initierats". Står på FHM:s lista. |
| CBD | Inte i förteckningarna | – | NJA 2019 s. 531 | Saknas i båda förteckningarna. HD B 177-19 (18 juni 2019): "CBD-olja som innehåller THC utgör en beredning enligt psykotropkonventionen och är därmed att anse som narkotika", även när THC kommer från laglig industrihampa. Livsmedelsverket (sidan granskad 24 juni 2025): CBD får inte användas som livsmedel. |
| CBG | Inte i förteckningarna | – | Förordning 1992:1554 | Saknas i båda förteckningarna. Inte på FHM:s lista. |
| CBN | Inte i förteckningarna | – | Förordning 1992:1554 | som CBG |
| THCV | Inte i förteckningarna | – | Förordning 1992:1554 | som CBG. Namnet täcks inte av "hydroxitetrahydrocannabinoler" i bilaga 1, som avser 3-pentyl-formen (THC); THCV har en propylkedja. |
| THCNM | Öppen fråga | – | Ingen | Namnet finns inte i någon svensk primärkälla och har inget fastställt kemiskt namn. Hazeys egen artikel (`/sv/post/vad-ar-thcnm`, 2024-11-27) beskriver en "metylgrupp bunden till kväveatomen i THC", men THC innehåller ingen kväveatom. Därför anges ingen status. |

**Ingen granskare och ingen uppdateringsrutin anges.** Underlaget kräver granskare per rad, annars ingen grön/röd status. Det finns ingen namngiven granskare, så sidan visar status i ord utan färgsignal och anger bara kontrolldatum (beslut R2).

## Ändringar som inte syns i tabellen

- **SFS 2026:1803**: utfärdad 22 oktober 2026, i kraft 25 november 2026. Tar bort MDMB-FUBINACA ur 1999:58. Det är en syntetisk cannabinoid som inte hör till indexets ämnen. Ingen av hubbens rader påverkas, och bilagans båda versioner har samma cannabinoider.
- **Inga andra beslutade ändringar** av 1992:1554 eller 1999:58 efter 2026:1109/1110 hittades, varken i rkrattsbaser eller i regeringens pressmeddelanden till och med 16 november.
- **Narkotika i Läkemedelsverkets föreskrifter.** THC och cannabis står inte i 1992:1554:s bilaga under egna namn. Cannabis definieras i förordningens sista del, med undantag för vissa EU-godkända hampsorter. Indexet tar därför inte upp THC eller cannabis som rader. Undantaget nämns under Öppna frågor och i FAQ.

## Gamla sidans tabell mot primärkällorna

| Gamla raden | Gamla sidan | Primärkälla | Resultat |
|---|---|---|---|
| CBD | 🟢 Laglig, "THC-halt under gränsvärdet, EU-certifierad industrihampa" | Saknas i förteckningarna. HD 2019: CBD-olja med THC är narkotika. | **Motsägs i sin generella form.** Neutral rad med HD-källa. |
| Magic Sauce | 🟢 Laglig | Handelsnamn, finns inte i någon förteckning | **Avstå** från status. Förklaras under "Ämnen, blandningar och handelsnamn". |
| Nano 11 | 🟢 Laglig, "säljs fritt, ej klassad" | Handelsnamn | **Avstå**, som ovan |
| H4CBD | 🟡 "Laglig – under utredning" | Saknas i förteckningarna. FHM utreder sedan 11 april 2023. | **Förbättra:** "Inte i förteckningarna" plus utredningsdatum. Ordet "laglig" används inte. |
| THCV | 🟡 "Laglig – under utredning", "står på FHM:s lista" | Saknas i förteckningarna och **finns inte** på FHM:s lista | **Motsägs** (utredningen) |
| CBN / CBG | 🟡 "under utredning", "står på FHM:s lista" | Saknas i förteckningarna och på FHM:s lista | **Motsägs** (utredningen) |
| THCNM | 🟡 "under utredning", "står på FHM:s lista" | Namnet finns i ingen primärkälla | **Motsägs**. Öppen fråga. |
| THCB | 🟡 "under utredning" | FHM utreder sedan 5 mars 2024 | **Behåll** sakuppgiften, utan "laglig" |
| THCJD / 10-OH-HHC | 🟡 "Ej klassade, bevakas löpande" | THCJD: narkotika sedan 10 december 2024. 10-OH-HHC: hälsofarlig vara sedan 15 juli 2025. | **Motsägs**, båda |
| THCA | 🔴 Narkotikaklassad 14 juli 2026 | SFS 2026:1109 | **Stämmer** |
| Nano 9 / Nano 10 | 🔴 Hälsoskadlig vara 15 juli 2025 | Handelsnamn. 15 juli 2025 stämmer som datum för SFS 2025:663, men ingen källa säger vilka ämnen produkterna innehöll. | **Faktakontroll**, står inte på sidan |
| THCP | 🔴 jan 2024 | 16 januari 2024, SFS 2023:901 | **Stämmer**, nu med exakt datum |
| THCH | 🔴 jan 2024 | 10 december 2024, SFS 2024:985 | **Motsägs** (fel datum) |
| HHC | 🔴 2023 | 11 juli 2023, SFS 2023:379 | **Stämmer**, nu med exakt datum |
| HHC-O / HHCPO / THCPO | 🔴 Narkotikaklassad 2024 | HHCO: narkotika 16 januari 2024. HHCPO: narkotika 10 december 2024. THCPO: **hälsofarlig vara**, inte narkotika, 10 december 2024. | **Delvis motsägs** |
| Text "Lagen om hälsofarliga varor … olagliga att sälja och importera, men inte att inneha" | – | Lag (1999:42) 3 § 7: får inte utan tillstånd "innehas" | **Motsägs** |
| "Läkemedelsverket för listan över narkotikaklassade substanser" | – | Delvis riktigt: förordningen 1992:1554 och Läkemedelsverkets föreskrifter | **Förbättra:** sidan namnger förordningarna |
