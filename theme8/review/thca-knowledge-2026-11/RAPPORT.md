# THCA-kunskapssidan: byggd för granskning

Gren `feat/theme8-thca-knowledge`, skapad från `origin/dev` (`1b2f188`) i en egen worktree. Den är inte mergad. Ingen sida är skapad i Nyehandel, och omdirigeringar, kategorier, produkter och WooCommerce är orörda.

Designfacit: `koncept-c-iphone16-393x852.png` (mobilens första skärm) och `koncept-c-hybrid-desktop.png`.

## Filer

| Fil | Vad |
|---|---|
| `theme8/blocks/thca.html` | Hela sidans innehåll i initial HTML. Gammal text som väntar på beslut står som kommentarer. |
| `theme8/css/88d-landing-guide.css` | Kunskapslandningens layout (kräver `html.hz8-guide-page`) |
| `theme8/js/88d-landing-guide.js` | Serievägarna: live antal i lager, lägsta pris och riktig produktbild |
| `theme8/js/88b-landing.js` | Ett tillägg: valfri varvning av källor (`data-hz8-interleave`). THCX använder den inte. |
| `KARTLAGGNING.md` | Före/efter: titel, meta, H1/H2, varje stycke, rättsläge, FAQ, länkar, 28 produkter, 27 artiklar och sökavsikter |
| `verify.mjs`, `compare.mjs`, `verify.json` | Test och jämförelseblad |

## Bilder (`shots/`)

- **Första skärmen:**
  - `thca-393-fold.webp`, tagen i 393 × 852 i riktig webbläsare
  - `thca-1440-fold.webp`
  - samt `-320`, `-768` och `-1920`
- **Helsida:** `thca-{320,393,768,1440,1920}-full.webp`
- **Närbilder:** `thca-{393,1440,1920}-alternativ.webp`, `-rattslage.webp` och `-nedre.webp` (sortiment, artiklar, FAQ och sidfot)
- **Sida vid sida med referenserna:**
  - `jamfor-393-fold.webp` (referensen 393 × 852 mot riktig vy)
  - `jamfor-1440-fold.webp`
  - `jamfor-1440-topp.webp`
  - `jamfor-393-helsida.webp` (rytmreferensen v2)
- **Felfall:** `thca-393-noatmo-*`, `thca-1440-noprod-*`, `thca-393-zero-*` och `thca-393-reduced-*`

## Sidordning

1. **Hero**
   - Brödsmula (Hem / THCA), etiketten "Fakta & sortiment" (desktop), H1 "THCA" och taglinen "Fakta, rättsläge och alternativ" (mobil).
   - Rättslägesnotisen "Delta-9-THCA-A är narkotikaklassat i Sverige sedan 14 juli 2026." med "Källa: SFS 2026:1109" (PDF).
   - Knapparna "Läs om THCA" och "Se alternativ".
   - Kustfotot står till höger på desktop och som ett band med vågkant på mobil och surfplatta.
2. **Ledrad**
   - Kapitelrail på desktop.
   - "Vad är THCA?" med kort svar.
   - "Rättsläget i korthet": datum, ämne, klassning och källa.
3. **Alternativ till THCA:** tre serievägar, var och en med seriens riktiga produkt på sten:

   | Serie | Produktbild | Live |
   |---|---|---|
   | Magic Sauce | Gorilla-vapen | 17 produkter i lager, från 175 kr |
   | THCbA | Faraoh-asken | Tillfälligt slut i lager |
   | Nano11 | Tatra Hemp-påsen | 6 produkter i lager, från 195 kr |

4. **Är THCA lagligt i Sverige?** Exakt ämne, förordning, SFS och datum, källor (SFS-PDF och Socialdepartementet) och inget om andra ämnen eller produkter.
5. **Faktakapitel:** "THCA och THC" och "Hazey och THCA".
6. **"I lager från serierna":** 32 riktiga kort, varvade per serie, bara i lager.
7. **"Läs mer om THCA":** två THCA-artiklar ur Nyehandels bibliotek i två spalter och "Alla artiklar". Nano11-artikeln lyfts inte fram (korrigering 2026-11-15, se KARTLAGGNING.md).
8. **FAQ:** sex frågor, de fyra gamla plus två nya, med "Hitta i sortimentet" (Bästsäljare). Sedan den globala sidfoten.

## Tester (`verify.json`, 2026-11-15)

Körningar: 320, 393 (852 hög), 768, 1440, 1920, plus utan temabilder, utan produktbilder, inga produkter och reducerad rörelse.

| Kontroll | Resultat |
|---|---|
| H1 | En ("THCA") i alla körningar |
| Sidledsscroll | 0 px överallt |
| Konsolfel | 0 |
| Faktatext | 16 av 16 rubriker och faktastycken synliga, alla i initial HTML |
| Initial HTML | 1 H1, 8 H2, 3 H3, 29 länkar och 6 FAQ |
| Länkar | 34 unika efter korrigeringen. Alla externa och interna svarar 200 (inklusive SFS-PDF:en och regeringen.se), och ankarna finns på sidan. |
| Kontrast | Lägst 5,31 ("Fler svar under …", mobil) och 5,51 (H1 över kustfotot vid 1440). Knapparna ligger på 5,7 eller mer. |
| Tangentbord | Fokusringen är solid på knappar, serievägar (hela kortet) och FAQ. FAQ öppnas med Enter. "Läs om THCA" hoppar till `#vad-ar-thca` under headern. |
| Riktiga bilder | Tre av tre serievägar har Nyehandels egen frilagda produktbild, ingen beskuren (alla bredder) |
| Andra sidor mot `origin/dev` | THCX-landningen pixelidentisk (10 av 10 bilder, 393 och 1440). Startsidan, Alla Vapes, THCX-kategorin, Hasch, Core-produktsidan och Köpvillkor är identiska. Bästsäljare vid 393 skiljer på 0,001 % live-innehåll, med samma DOM och höjd. |
| Förbjudna ord | Inga (psykoaktiv, rus, medicin, effekt, "lagliga alternativ", 100 %, garanti, fri frakt och så vidare) |

**Felfallen:**
- **Utan temabilder:** den varma canvasen står kvar.
- **Utan produktbilder:** stenen, texten, länkar och livetal står kvar.
- **Inga produkter:** vägarna står kvar med text och länk, och sortimentet visar blockets reservlänkar.
- **Reducerad rörelse:** inga övergångar.

**Mobil 393 × 852:** samma ordning som referensen. H1 slutar vid 190 px, notisen vid 298, knapparna vid 385, kustbandet vid 473, "Vad är THCA?" vid 479–593, "Alternativ till THCA" vid 626 och ingressen vid 668–740. Första seriekortet börjar vid 754 och syns med rubrik i första skärmen.

**Desktop 1440 × 900:** serievägarna börjar vid 802 px och syns i första skärmen.

## Avvikelser mot referenserna

- **Header:** Theme 8:s riktiga glasheader (låst global komponent). Referensen har en mörkgrön mobilheader.
- **Bilder:**
  - Ingen växtbild bredvid "Vad är THCA?" på desktop. Där står rättslägespanelen, eftersom vi inte har någon produktfri, godkänd växtbild.
  - Kustfotot är THCX-sidans produktfria bild. Referensens kvinna, växter och färgmättnad är AI-genererade.
- **Produkter:** de riktiga förpackningarna (vape, buds-påse och ask) ger varje väg egen identitet. Referensens förpackningar är påhittade.
- **Brödsmula:** "Hem / THCA" från plattformen står där referensen har "Guide / THCA" på mobil.
- **Texter:** H2 "Alternativ till THCA" visas som etikettrad på desktop, som i referensen. Desktop har ingen tagline, som referensen. AI-texterna i referensen ("En populär serie med cannabinoider…") används inte. Serietexterna anger bara format som finns i seriens kategori.

## Öppna beslut

Se `KARTLAGGNING.md` avsnitt 7: titel och meta, slug och 301, psykoaktivitet, "forskning/samlarobjekt", trust-punkter och frakt, THCbA utan lager, Nano11-laglighetsartikeln och kustbilden.

## Korrigering 2026-11-15: Nano11-artikeln

"Läs mer om THCA" visar nu bara de två THCA-artiklarna, i två lika breda spalter på desktop (631 + 631 px vid 1440) och staplade på mobil.

"Vad är Nano11?" lyfts inte fram, eftersom den importerade artikeln anger fel datum för THCA-klassningen och gör breda laglighetspåståenden. Artikeln är inte ändrad eller raderad. Nano11-serievägen och allt annat innehåll är oförändrat.

Bilder: `shots/thca-{393,1440}-artiklar.webp` och `shots/fore-efter-artiklar-{393,1440}.webp`. Hela sviten (nio körningar) är omkörd: grön.
