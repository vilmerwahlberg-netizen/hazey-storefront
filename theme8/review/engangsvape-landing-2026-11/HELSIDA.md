# Engångsvapes – hela sidan byggd (för Vilmers granskning)

Gren `feat/theme8-engangsvape-landing`, 2026-11-15, enligt
`HZY/design/engangsvape-seo-2026-11-15/TASK-ENGANGSVAPE-HELSIDA.md`.
**Inte mergad. Ingen sida i admin, ingen omdirigering, ingen kategoriändring,
gamla WooCommerce-sidan orörd, inget publicerat.** Sidan visas med en
fixtur: en riktig tom Nyehandel-innehållssida fylls med blocket
(`verify.mjs`), med riktig livedata ur preview.

## Bilder

| Vad | Fil (`shots/`) |
|---|---|
| Hela sidan (WebP) | `eng-393-full`, `eng-1440-full`, `eng-1920-full` (+ `eng-320-full`, `eng-768-full`) |
| Första vyn | `eng-{393,1440,1920}-fold` |
| Närbild nedre halvan (sortiment → sidfot) | `eng-{393,1440,1920}-nedre` |
| Närbild faktauppslag + serier + analysintyg | `eng-{393,1440,1920}-uppslag` |
| Närbild FAQ | `eng-{393,1440,1920}-faq` |
| Serievägar + storlek + sortiment | `eng-{393,1440,1920}-produkter` |
| Jämförelse mot designreferenserna | `jamfor-1440-topp`, `jamfor-1440-nedre`, `jamfor-393-topp`, `jamfor-393-nedre` |
| Felfall | `eng-393-noatmo-*` (atmosfärsbilder 404), `eng-1440-noprod-*` (produktbilder 404), `eng-393-zero-*` (inga produkter), `eng-393-reduced-*` |

## Sidordning som byggd (TASK-tabellen 1–9)

1. **Hero:** brödsmula, H1 `Engångsvapes`, ingressen ordagrant ur utkastet, levande lagerrad ("8 produkter i lager med 21 smakvarianter · 2 och 5 ml", räknad ur livekatalogen, dold utan data), kapitelrad Produkter · Storlek · Om formatet · Frågor. Kustljus uppe till höger som tonar in i putsen.
2. **Tre serievägar:** Magic Sauce 3.0, Hero’s Core, Cookies CBD med riktig frilagd Nyehandel-bild på stenstagen, livepris, storlekar/smaker som länkar till riktiga produktsidor. Väg utan lager döljs. Mobil: ett kort + nästa syns.
3. **Välj storlek:** 1+1 ml, 2 ml, 5 ml med antal och frånpris ur livekatalogen; 1 ml dold (0 i lager). 2 och 5 ml öppnar katalogens volymfilter; 1+1 ml (inget filter än) öppnar en riktig 1+1 ml-produkt i lager.
4. **Alla engångsvapes i lager:** varje köpbar smak som Theme 8:s eget kort (bild, namn, pris, Lägg till) på varm stage. Källa `alla-vapes` i lager; carts, refill, batterier och paket räknas bort. Länk "Filtrera alla vapes".
5. **Vad är en engångsvape?** öppet uppslag, två stycken ur utkastet, eget produktfritt kustfoto.
6. **Serier i sortimentet:** öppen text + länkar till Magic Sauce, Hero’s Core, CBD, THCbA, D10, THCV. Lagerstatus ("I lager: 2 och 5 ml") bara när seriens engångsvapes faktiskt finns i lager; slutsålda får ingen status.
7. **Analysintyg och produktfakta:** öppen text ur utkastet.
8. **FAQ:** fem frågor ur utkastet, `<details>` med svaren i DOM, tangentbord.
9. **Avslut:** "Hitta rätt vape" → `alla-vapes?typ=vapes`, länkar till Vanliga frågor och artiklar; sedan Theme 8:s globala sidfot.

## Faktatexten är riktig sidtext

Alla rubriker (1 H1, 5 H2, 5 H3) och alla faktastycken står i blockets
HTML och finns i sidans initiala HTML före JavaScript (kontrollerat mot
den levererade HTML:en, `verify.json` → `initialHtml`). I renderingen är
alla faktastycken synliga (inte i stängda dragspel, inte dolda, 16 px).
FAQ-svaren ligger i DOM i `<details>`.

## Testresultat (`verify.json`, körd 2026-11-15)

Körningar: 393, 1440, 1920, 320, 768 samt atmosfärsbilder 404 (393), produktbilder 404 (1440), inga produkter (393) och reducerad rörelse (393).

| Kontroll | Resultat |
|---|---|
| H1 | exakt en, `Engångsvapes`, får plats på en rad vid alla bredder |
| Sidledsscroll | 0 px, inga breda element, alla körningar |
| Konsolfel | 0 |
| Serievägar | 3 av 3 med riktig frilagd bild, livepris, länkar till riktiga produktsidor |
| Storlek | 1+1 ml (3 produkter, från 495 kr), 2 ml (4, från 395 kr), 5 ml (1, från 1 195 kr); 1 ml dold (0 i lager) |
| Sortimentsled | 21 smakkort, alla engångsvapes i lager; 0 carts, batterier, refill eller paket; inga Indica/Sativa i namn |
| Serier | Magic Sauce "I lager: 2 och 5 ml", Hero’s Core "I lager: 2 ml", CBD "I lager: 1+1 och 2 ml"; THCbA, D10, THCV utan status (slut) |
| Faktatext | 7 av 7 rubriker/stycken i initial HTML och synliga; FAQ-svaren i DOM |
| Länkar | 19 unika interna länkar, alla 200 |
| Tangentbord | Tab från kapitelraden ger synlig fokusram på första vägen och på storleksvalen; ankarlänk fokuserar rätt H2; FAQ öppnas med Enter |
| Kontrast (värsta 5 % av bakgrunden bakom varje textrad) | H1 6,0 (393), 6,2 (320), 4,8 (768), 7,2 (1440), 7,8 (1920); ingress 8,5–11,9; lägst totalt 4,78 (H1 vid 768) och 4,95 (sortimentets undertext) |
| Atmosfär 404 | Varm canvas och stenfärgad avsats står kvar, inga grå ytor, inget layoutskifte |
| Produktbilder 404 | Vägar och kort står kvar med namn, pris och länkar, inga trasiga bildikoner |
| Inga produkter | Vägarna står kvar med text och länkar, storleksraden och lagerraden döljs, sortimentet visar blockets reservlänk |
| Reducerad rörelse | Inga övergångar på vägar, storlek och FAQ |
| THCX och befintliga sidor | THCX pixelidentisk före/efter (393 och 1440, 10 bilder). Startsida, Alla Vapes, THCX-kategori, Hasch, Hero’s Core-PDP, Köpvillkor och Bästsäljare identiska mot `dev`-bygget |

Sortimentsledets bilder laddas lat när raden sveps; 16–21 av 21 hade laddats vid skärmbilden beroende på bredd.

Mätfel som hittades och rättades under arbetet: kontrastmätningen läste först fel yta under sidans mjuka scrollning (gav falska 4,2–4,6 för ingressen) och räknade med lagerradens gröna punkt. Mätningen scrollar nu omedelbart och hoppar över element utanför vyn.

## Kvarvarande visuella avvikelser mot referenserna

- Sortimentskorten är Theme 8:s egna, kompakta kort med seriens etikett och "Nyhet"-märke; referensens kort är luftigare och visar storlek under namnet.
- Förpackningarna på stagen är fortfarande något mindre än AI-bildens (riktiga förpackningar, ingen beskärning).
- En halv enhetspixel ljus kant längst till höger på mobil finns redan i THCX-mallen (globalt, inte nytt).

## Faktakontroll mot produktsidorna (2026-11-15, Nyehandels produkttexter)

| Fråga | Vad produktsidorna säger | Följd på sidan |
|---|---|---|
| Laddning | Magic Sauce 3.0 2 ml och 5 ml: "utan behov av påfyllning eller uppladdning". Cookies Dual Chamber: "uppladdningsbar", "Laddning: USB-C". CBD 25 % + CBN 35 % (Magic Farmers): "den laddbara premiumvapen". Hero’s Core, H4CBD 97 %: inget om laddning. | Gamla sidans generella "Nej" stämmer inte. FAQ-svaret "Det beror på modellen …" (utkastet) står kvar oförändrat. |
| 1+1 ml | Cookies Dual Chamber: "två separata 1ml kammare och varsin atomizer". | Uppslagets mening om två separata behållare används (villkoret i utkastet uppfyllt för de tre Cookies-produkterna). |
| Analysintyg | Länk till intyg (PDF) finns på Magic Sauce 3.0 2 ml (per strain) och Hero’s Core 2 ml. Saknas på Magic Sauce 5 ml, Cookies (3), CBD + CBN, H4CBD 97 %. PDF:erna ligger på `www.hazey.se/wp-content`. | Texten lovar bara länk "när ett analysintyg finns". PDF:erna måste flyttas före domänbytet. |
| Produkttexterna själva | Flera produktsidor innehåller egna påståenden ("Laglighet & Ansvar", "trygg, laglig", "Varje batch analyseras av oberoende laboratorium", "Fri frakt från 499 kr"). | Inte ändrat (utanför uppdraget). Landningen återger dem inte. |

## Jämfört med designreferenserna

| Referens | Byggt | Skillnad och skäl |
|---|---|---|
| Kustsolnedgång bakom headern, tonar in i putsen | Theme 8:s befintliga produktfria kustbild (samma som Alla Vapes-heron), maskad uppe till höger med persikoljus | Samma motiv som Alla Vapes; en egen herobild kan ersätta den (en CSS-rad). Lövskuggorna är svagare än i referensen för att ingressen ska vara läsbar. |
| H1 avstavad "Engångs-/vapes" på mobil | En rad, skalad efter bredden | Ingen avstavning i H1 (utkastet: behövs inte). |
| Kort ingress | Utkastets två meningar + lagerrad | Texten är låst till utkastet. |
| Stenar på stage, AI-förpackningar | Godkänd stenstage från THCX, riktiga Nyehandel-bilder | Riktiga förpackningar är mindre och mer färgstarka än AI-bildens. |
| Kort med bara namn + knapp | Namn, knapp, format-/storleksrad, smaker, pris | Utkastet kräver verifierbar format-/storleksrad; priset är live. |
| Storlek: bara 2 ml och 5 ml, "8 produkter" | 1+1 ml, 2 ml, 5 ml med riktiga antal | AI-bildens siffror och storlekar är inte data; 1+1 ml får inte försvinna. |
| Sortiment: 6 kort med AI-namn ("Cookies CBD 2 g") | 21 riktiga smakkort i en svepbar rad | Riktig data. |
| Uppslag med person på klippa (THCX-bilden) | Eget produktfritt foto: strandpromenad i solnedgång | Uppdraget: egen formatbild, inte THCX-bilden. |
| Serier som lista med beskrivningar / länkchips | Lista med länk + levande lagerstatus | Inga påhittade beskrivningar; status bara när data finns. |
| Analysintyg med andra stycket om "vilken cannabinoid … halt" | Utkastets text | Utkastet gäller. |
| FAQ-frågor "Är era produkter testade?" | "Finns analysintyg för produkterna?" | Utkastet gäller. |
| Mobil: "Filtrera alla vapes" direkt under FAQ | CTA-rubrik + knapp + länkar | Samma komponent som desktop. |

## Kvar att besluta före admin (oförändrat från uppdraget)

1. Titel och meta. Verifieringen använder förslaget i `KARTLAGGNING.md` avsnitt 2 som platshållare. Hur, om alls, `THC`, `THCA` och `cannabis vape` får användas.
2. Laglighetsfrågan och gamla juridiska påståenden: inte med på sidan (kommentarer i blocket).
3. Produktspecifika fakta: laddning per modell (se tabellen ovan, Core och H4CBD saknar uppgift), vilka batcher intygen avser, intygs-PDF:erna på gamla domänen.
4. Lageravvikelser WooCommerce/Nyehandel: THCbA 47 % 2 ml, Magic Sauce 5 ml, H4CBD 97 % 2 ml.
5. 1+1 ml-filter i Alla Vapes (tills dess länkar 1+1 ml till en produkt).
6. Herobild: delad med Alla Vapes. Uppslagsbilden är en befintlig, tidigare oanvänd bild ur Theme 8-repot (`theme8/assets/hero-beach-desktop-v2.png`, incheckad i e861f3b); ursprung och rättigheter bekräftas som för övriga Theme 8-bilder.
7. "Nyhet"-märket på sortimentskorten är Nyehandels eget kortmärke (`.ribbon.news`), inte satt av landningen.
8. 301 `/engangsvape/` → `/sv/page/engangsvape`, canonical, `index`, sitemap: lanseringssekvens, inte gjort.

## Korrigering före merge (2026-11-15, efter granskning)

Avgränsad visuell korrigering. Innehåll, produkter, länkar och köplogik är oförändrade.

| Del | Före | Nu |
|---|---|---|
| Nedre halvans ljus | Slät yta, ljusare platta bakom FAQ | Ett sammanhängande persikoljus genom sortiment, uppslag, serier/analysintyg och FAQ. Varje del har en kantlös zon som tonar över i nästa, inga block. Lövskuggor över sortimentet och i FAQ:s nedre vänstra hörn, aldrig bakom brödtexten. Skuggorna är tagna ur den godkända putsbilden (`leaf-shadow-*`, 237 + 80 kB). |
| Förpackningar på stagen | Scen 9:5, förpackning 38cqw | Scen 3:2, förpackning 46cqw (+21 % på 1440). Stenen står kvar på samma ställe, och ingen förpackning klipps (`packs.clipped = false` i alla körningar). |
| Mobilens seriekort | 74 % brett, scen 16:10, förpackning 40cqw | 82 % brett, scen 4:3, förpackning 54cqw (107 → 160 px hög vid 393). Kortets fallskugga klipps inte längre av rullraden. |
| Storleksval, mobil | Två knappar plus en fullbreddsknapp | En sammanhållen rad med tre fack (1+1, 2, 5 ml), antal och frånpris staplade. 4 storlekar ger 2×2 och 1 eller 2 storlekar ger 1 eller 2 fack, styrt av `data-hz8-n`. |
| Lagerrad | "8 produkter i lager · 1+1, 2 och 5 ml" | "**8 produkter** i lager med **21 smakvarianter** · 1+1, 2 och 5 ml". Sortimentsledet säger "21 smakvarianter från 8 produkter." |
| Hjälptexter | Grå (4,95) | Bläck över det varmare ljuset (≥ 6,4) |

**Lagernivåerna verifierade:** båda talen räknas live och hårdkodas inte. Testet räknar dem också oberoende ur de renderade korten.

- **Produkter (8):** produktsidor i lager efter att carts, refill, batterier och paket räknats bort.
- **Smakvarianter (21):** köpbara varianter, ett kort var i ledet. Alla 21 är beställningsbara (`notOrderable = 0`).

Fördelning 2026-11-15:

| Produkt | Smakvarianter |
|---|---|
| Magic Sauce 3.0 2 ml | 2 |
| CBD 25 % + CBN 35 % (Magic Farmers) | 3 |
| Magic Sauce 3.0 5 ml | 5 |
| Hero's Core 2 ml | 6 |
| H4CBD 2 ml | 2 |
| Cookies Dual Chamber (tre produkter) | 1 var |

Ett Cookies-kort innehåller två smaker i två kammare men räknas som en köpbar variant. Därför står det "smakvarianter" och inte "smaker". Om varianttalet saknas eller är lika med produkttalet visas bara produktantalet.

**Kontroller:**
- **Körningar:** 393, 1440, 1920, 320 och 768, plus felfallen utan atmosfärsbilder, utan produktbilder, med noll produkter och med reducerad rörelse.
- **Sidan:** en H1, ingen sidledsscroll och inga konsolfel. Faktatexten är synlig och finns i initial HTML (7 av 7).
- **Innehåll och länkar:** 21 kort, varav 0 är fel format. Alla 19 länkar svarar 200, och tangentbord, ankare och FAQ fungerar.
- **Kontrast:** lägsta värdet är 4,77 (H1 vid 768, oförändrat). Sortimentets underrad gick från 3,44 till 6,99.
- **THCX:** 10 av 10 bilder är pixelidentiska mot `d6a72d1`.
- **Befintliga sidor:** startsidan, Alla Vapes, THCX-kategorin, Hasch, Core-PDP och Köpvillkor är identiska. Bästsäljare vid 393 skiljer på 0,003 %, ungefär 10 px live-innehåll, med samma DOM och höjd.

## Storleksrättelse (2026-11-15, Vilmers beslut: 1+1 ml = 2 ml)

En dubbelkammare märkt 1+1 ml räknas nu som 2 ml och har ingen egen storlek. Sidan visar bara 2 ml och 5 ml.

**Före/efter:** `shots/fore-efter-storlek-393.webp` och `shots/fore-efter-storlek-1440.webp`. Jämförelsebladen mot referenserna är omgjorda.

| Del | Före (`7b0e1f9`) | Nu |
|---|---|---|
| Storleksval | 1+1 ml (3 produkter, från 495 kr), 2 ml (4 produkter, från 395 kr), 5 ml (1 produkt, från 1 195 kr) | 2 ml (7 produkter, från 395 kr) och 5 ml (1 produkt, från 1 195 kr). Antalen räknas live. 1+1 grupperas på total volym, samma regel som katalogens volymfilter. |
| Mobil | Fack i en gemensam rad | Två separata glaskort med 12 px mellanrum. Varmt halvtransparent glas med ljus kant, persikoljus uppifrån vänster och mjukt skuggdjup. Glaset suddar lövskuggorna bakom. Samma glas på desktop, där korten är högst 290 px breda. |
| Lagerrad | "… · 1+1, 2 och 5 ml" | "… · 2 och 5 ml" |
| Serien CBD | "I lager: 1+1 och 2 ml" | "I lager: 2 ml" |
| Uppslaget, andra stycket | "En modell märkt 1+1 ml har två separata behållare, och 2 ml och 5 ml är andra volymval." | "Storlekarna på den här sidan anges i milliliter: 2 ml och 5 ml. En modell märkt 1+1 ml rymmer 2 ml totalt, fördelat på två separata kammare, och räknas därför som 2 ml." |
| FAQ | "Vad skiljer 1+1, 2 och 5 ml?" | "Vad skiljer 2 och 5 ml?" Svaret förklarar att 1+1 ml är 2 ml i två kammare om 1 ml. |

**Det här är oförändrat:**
- Cookies-vägens text "Dubbelkammare 1+1 ml, två smaker".
- Sortimentskorten med "… - 1+1ml".
- Produktsidans H1 "CBD 56% - Cereal Milk + London P.C. - 1+1ml", med 11 omnämnanden av 1+1 ml både före och efter.
- 1 ml-platsen finns kvar och döljs vid 0 i lager, som förut. Katalogen har ett godkänt 1 ml-filter.

**Länkar, kontrollerade i preview:**
- `alla-vapes?typ=vapes&volym=2ml` visar 47 kort, varav 16 i lager och först. Där finns alla tre Cookies 1+1 ml (i lager) bredvid Magic Sauce 2 ml, CBD + CBN, Hero's Core och H4CBD.
- `volym=5ml` visar de fem Magic Sauce 5 ml.
- I katalogen visar Cookies-korten volymchipet "2 ml" och namnet utan storlek. Det är katalogens befintliga beteende (TASK 01E), och jag har inte ändrat det.

**Tester:** `verify.json`.
- **Storlekarna:** de räknas också oberoende ur sortimentets kort. Total volym ger 2 ml = 7 produkter från 395 kr och 5 ml = 1 produkt från 1 195 kr. Det stämmer med korten på sidan.
- **Mobilen:** två kort på samma rad, 175 + 175 px breda vid 393 och 138 + 138 px vid 320. Varje kort har egen skugga och backdrop-blur, och listan har ingen gemensam bakgrund.
- **Sidan:** ingen sidledsscroll, inga konsolfel och 7 av 7 faktatexter synliga. Alla länkar svarar 200. Lägsta kontrasten är 4,77 (H1 vid 768, oförändrat), och storlekskortens text ligger på 5,6 eller mer.
- **Inget annat har ändrats:** innehållsdiffen mot `7b0e1f9` visar bara storlekarna, lagerraden, CBD-seriens status, faktameningen och FAQ:n. Rubriker, länkar (−1, den borttagna 1+1-länken), sortimentskort, vägar och övriga texter är identiska.
- **THCX och befintliga sidor:** THCX är pixelidentisk (10 av 10). Startsidan, Alla Vapes, THCX-kategorin, Hasch, Core-PDP och Köpvillkor är identiska. Bästsäljare vid 393 skiljer på 0,001 % live-innehåll.
