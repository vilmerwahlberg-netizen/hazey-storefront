# HHC: gamla /hhc/ mot nya kunskapssidan

Datum: 16 november 2026. Gren `feat/theme8-thch-hhc-knowledge`. Ny sida: `theme8/blocks/hhc.html`.

**Ingenting är publicerat.** Gamla WooCommerce-sidan, artiklarna och admin är orörda.

## 1. Vad som finns i dag

| Var | Status 16 nov 2026 |
|---|---|
| Gamla `https://www.hazey.se/hhc/` | 200. Title: `HHC - Hazey.se`, ingen meta. En H1 "HHC". |
| `/sv/page/hhc`, `/hhc`, `/sv/hhc` (Nyehandel) | **404** |
| `/sv/categories/hhc` | 404. Det finns ingen HHC-kategori. |
| Butikens sökning på "hhc" | ingen HHC-produkt |
| Artiklar i Nyehandel | "HHC (Hexahydrocannabinol): Från Legalitet till Olaglighet" (2023-07-18, nämner 11 juli 2023) och "Vad är 10-OH-HHC?" (2024-01-10). Båda innehåller effektpåståenden. |
| Theme 8-header | Ingen HHC-länk |

Underlaget nämnde rå WooCommerce-shortcode på gamla HHC-sidan. I serverns HTML 16 november syns ingen shortcode-text. Däremot finns produktlistan i stället (Magic Sauce, Nano11, CCELL m.fl.).

## 2. Search Console (11 aug–11 nov 2026, gamla `/hhc/`, SEO-BYGGUNDERLAG.md)

| Fråga | Klick / visningar | Besvaras i |
|---|---|---|
| `hhc` | 134 / 3 699 | title, H1, ingress, kapitel 01, FAQ "Vad är HHC?" |
| `hhc vape` | 8 / 348 | FAQ "Säljer Hazey HHC-vapes?" ("Nej …") och kapitel 03. Ingen generell vape-text. |
| `hhc sverige` | 5 / 168 | title ("… rättsläget i Sverige"), H2 "Är HHC lagligt i Sverige?", FAQ med datum |

## 3. Rad för rad

| # | Gamla sidan | Ny sida | Markering |
|---|---|---|---|
| 1 | H1 `HHC` | H1 `HHC` | behåll |
| 2 | H2 "Vad är HHC?" | H2 "Vad är HHC?" | behåll |
| 3 | "HHC, eller Hexahydrocannabinol, är en halvsyntetisk cannabinoid som är en hydrerad form av THC." | "kortnamnet för hexahydrocannabinol … en hydrerad form av THC" | behåll ("hydrerad", stöds av de kemiska namnen i SFS 2023:379). "Halvsyntetisk": faktakontroll, och terminologin är ett öppet beslut enligt CLAUDE.md. |
| 4 | "Genom en process som kallas hydrogenering tillsätts väteatomer till THC-molekylen" | "den dubbelbindningen ersatt med väte … hexahydro i stället för tetrahydro" | förbättra |
| 5 | "… vilket gör HHC stabilare och mer motståndskraftigt mot nedbrytning" | — | faktakontroll |
| 6 | "HHC har liknande effekter som THC, men rapporteras ofta ge en mildare och jämnare upplevelse utan den intensiva 'high' som THC kan orsaka." | — | avstå: effekt |
| 7 | "HHC finns naturligt i små mängder i cannabisplantan, men de flesta produkter är framställda i laboratorier." | — | faktakontroll |
| 8 | "… har HHC snabbt blivit ett populärt alternativ till THC i många länder." | — | avstå |
| 9 | "I Sverige så är HHC olagligt sen över ett år tillbaka." | "Nej. Sedan 11 juli 2023 står hexahydrocannabinol (HHC) i förteckningen över narkotika …" | förbättra: samma sak, med exakt datum och SFS |
| 10 | "HHC Lagligt? … är för närvarande olagligt i Sverige … klassas det som en olaglig substans i Sverige och får inte säljas, köpas eller användas." | Rättsläge med SFS 2023:379, regeringens beslut och tidslinje | förbättra. "får inte säljas, köpas eller användas" ersätts av den exakta klassningen. |
| 11 | "Se alltid till att följa lokala lagar och riktlinjer innan du överväger att använda HHC …" | — | avstå: användningsråd |
| 12 | "Alla kategorier:", fraktrad, artikelutdrag, produktlista | "I sortimentet nu" (3 länkar med saklig etikett) | förbättra |
| — | ny | Tidslinje, I korthet, HHCP i FAQ (samma beslut), 3 primärkällor, länkar till THCB, THCH och THCA | ny |

## 4. Källor (kontrollerade 16 november 2026)

| Källa | Belägger |
|---|---|
| SFS 2023:379 (PDF) | Utfärdad 8 juni 2023, i kraft 11 juli 2023. För in "hexahydrocannabinol, HHC" och "hexahydrocannabiforol, HHCP" i bilaga 1, med kemiska namn. |
| Regeringen, "Nio nya substanser blir narkotikaklassade", 9 juni 2023 | Beslutet, hemställan från Folkhälsomyndigheten, HHC och HHCP bland de nio, i kraft 11 juli 2023 |
| Förordning (1992:1554), riksdagen.se, t.o.m. SFS 2026:1109 | HHC står kvar |

## 5. Föreslagen sididentitet

| Fält | Förslag |
|---|---|
| Title | `HHC – vad det är och rättsläget i Sverige \| Hazey` |
| Meta | `Vad är HHC? Fakta om hexahydrocannabinol och rättsläget: HHC är narkotikaklassat i Sverige sedan 11 juli 2023 (SFS 2023:379). Källor, historik och vanliga frågor.` |
| Slug | `hhc`. I dag ger `/sv/page/hhc`, `/hhc` och `/sv/hhc` 404, så en 301 behövs för den gamla adressen (beslut B5). |
