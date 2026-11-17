# R5: sista visuella korrigering av MS 2 ml och kompatibilitetskontroll mot Hero's Core (2026-11-17)

Allt är lokalt: ingen commit, push, merge, adminändring eller utrullning.

## Bilder

| Vad | Fil (under `shots/`) |
|---|---|
| R4 → R5 → facit, hela sidan | `r5-jamforelse/mobil-r4-r5-facit.jpg`, `r5-jamforelse/desktop-r4-r5-facit.jpg` |
| R4 → R5 → facit, första vyn (393 × 852 / 1440 × 900) | `r5-jamforelse/mobil-forsta-vyn-r4-r5-facit.jpg`, `r5-jamforelse/desktop-forsta-vyn-r4-r5-facit.jpg` |
| Helsidor | `r5-393.jpg`, `r5-1440.jpg`, `r5-1920.jpg` |
| Läsbara mobilutsnitt per sektion (393, 2x) | `sections/r5-393-01-kop.jpg` (köpdel), `-02-vad-ar` (papperskapitel), `-03-strains-labb`, `-04-om`, `-05-faq`, `-06-karusell`, `-07-avslut` (kategorier + kundservice + footer) |
| Växterna vid 393/430/1440/1920 | `r5-leaves/r5-{393,430,1440,1920}-papper-hornen.jpg` |
| Recensionsfixtur | `r5-omdomen/r5-{utan,testdata}-{393,1440}-{kopdel,omdomesyta}.jpg` |
| Kompatibilitet | `r5-compat/*.jpg` |

## A. Magic Sauce: rättningar

1. **Klippta växter.**
   - Rutan läggs mot fönstrets kant, så att assetets egen beskurna kant sammanfaller med kanten, och tonas ut nedtill (mask). Ingen rak klippkant mitt på sidan.
   - `leaves-check.mjs` vid 393, 430, 1440 och 1920: båda hörnen helt inom fönstret, sidbredd = fönsterbredd och ingen överlappning med text. Se bilderna ovan.
   - `overflow` är inte ändrad på sidnivå; `#store-main` har kvar `overflow-x: clip`.
2. **"Vad är Magic Sauce 3.0?"**
   - Mobilen är lägre, med tätare rubrik, ingress och faktarad.
   - Faktaraden ligger under en tunn tryckt linje med hårfina avdelare i arket, i stället för fyra lösa ikoner.
   - En varm glöd binder produktscenen till arkets överkant.
   - Kortare avstånd till Strains.

| Mått (px från sidans topp) | R4 393 | **R5 393** | R4 1440 | **R5 1440** |
|---|---|---|---|---|
| "Vad är …" höjd | 321 | **246** | 330 | **297** |
| "Vad är …" börjar–slutar | 848–1169 | 842–1088 | 713–1043 | 713–1010 |
| Strains börjar | 1207 | **1120** | 1109 | **1076** |
| Köpknappen börjar | 755 | 755 | 586 | 586 |

   Mobilfacit: bandet är ungefär 165 px vid 393, men med 13–14 px text. R5 behåller 14,5 px ingress, 23 px rubrik och läsbar faktarad.
3. **Ljuset nedåt.**
   - Ett mjukt varmt fält per kapitel (Om, FAQ, karusell), alltid med ljuset uppe till vänster och en djupare ton nere till höger.
   - En varm övergång ned mot footern.
   - **Ett** avsiktligt överlapp: en liten kvist över Om-bildens nedre högra hörn.
   - Inga blad eller skuggor bakom text.
4. **Omdömen** (`review-fixture.mjs`). Den riktiga sidan visar ingenting (0 i Nyehandel).
   - **Utan data:** ingen betygsrad. Karusell → kategorier har samma avstånd (32 px vid 393) som när sektionen inte finns, alltså ingen tom yta.
   - **TESTDATA** (bara i testfliken via uppfångat API-svar): 40 testomdömen, fördelning 32×5, 5×4, 2×3 och 1×2, snitt 4,70 (visas "4,7 (40)", Woo: 4,69/40).
     - Betygslänken "Visa 40 omdömen" går till `#omdomen`, och sektionen hamnar 88–96 px från fönstrets topp efter klick.
     - Inga kundcitat. Texten är "TESTDATA – testomdöme nr N (inget kundcitat)".
     - Ingen aggregateRating i JSON-LD i något läge.
   - Sektionen har fått samma glasmaterial som resten.
5. **Bevarat och kontrollerat** (`check.mjs`, `strains-test.mjs`, `coverage.mjs`, `seo.mjs`):
   - Tre strainkort per grupp med pilar på var sida (1–3/4–6/7–9). 0 px scrollhopp. Klick på slutsåld strain ändrar inte valet.
   - Alla fem PDF-länkar, riktiga priser och lager.
   - Köp av 1 st lagt i varukorgen och borttaget.
   - En H1 renderat. Ingen sidledsscroll vid 393, 1440 och 1920. 0 saknade rader och länkar.
   - Produkttext, juridiska påståenden och meta är inte ändrade.
6. **Två buggfixar på vägen.**
   - FAQ-raderna var 64 px, inte 46, eftersom `content-box` räknade in utfyllnaden.
   - Långa variantnamn sprängde kortet (se B).

## B. Kompatibilitet: Magic Sauce 2 ml mot Hero's Core 2 ml (läsande)

Hero's Core är **inte ändrad**. Den har ingen innehållspost och visar standardmallen precis som förut (`hero-standard-*`).

Fixturerna lägger till en testpost **bara i testflikens kopia av bundeln** (`compat.mjs`, route). Ingen post finns i koden.

| | Magic Sauce 3.0 – 2 ml (261) | Hero's Core – 2 ml (255) | Gemensamt eller produktspecifikt |
|---|---|---|---|
| Varianter | 9 strains, 2 i lager | 6, alla i lager | Gemensamt: strainmodulen läser antal, namn, bild och lager. 6 → 2 grupper, 9 → 3 grupper |
| Variantnamn | Rena namn ("Tinky Winky") | "Gelato - Indica", "Pineapple Express -Sativa" (ojämnt) | Gemensamt: Indica/Sativa skalas bort i korten. **Produktspecifikt:** om typen ska visas (Hero) eller inte |
| Bilder | En bild per variant | En bild per variant | Gemensamt |
| Paketval | 1/3/5, verifierade | 1/3/5, verifierade (`packageTable` 255) | Gemensamt (befintlig köpstation) |
| Lager | Delvis | Allt i lager | Gemensamt |
| Rapporter | 5 PDF:er namngivna efter strain | **1 produktgemensam PDF** ("LABBTEST", CoA-THCX.pdf) | Listan är gemensam. Texten om rapporterna är **produktspecifik**. Bugg hittad och rättad: en produktgemensam PDF gav "ingen egen rapport för alla 6"; nu listas saknade strains bara när dokumenten är namngivna efter strains |
| Recensioner | 0 i Nyehandel (40 i Woo) | 0 i Nyehandel (7 i Woo, 4,71) | Gemensamt: inget visas utan data |
| Textlängd | ~560 ord | ~290 ord | – |
| Textrubriker | "… Vape från Magic Farmers", "Vad är Magic Sauce 3.0?", "Om Magic Farmers", "En laglig cannabis:" | "Hero CORE Vape 2ml", "Vad är Core?", "En laglig cannabis:", inget tillverkarkapitel | **Produktspecifikt:** vilka avsnitt som visas öppet (regexar per produkt). Fixturens regex fångade inte "Hero CORE Vape 2ml" på första försöket, alltså skört. Bugg rättad: tom högerspalt ger nu en spalt i stället för en tom halva |
| Produkttyp i fakta | "Engångsvape" | "Engångsvape / Disposable Vape" | Bugg rättad: bara första ledet ("engångsvape") används |
| Namn och H1 | "Magic Sauce 3.0 - 2ml" | "Hero's Core - 2ml" (titel: "THCX Vape 2ml - High Life CORE CCELL \| HERO") | Gemensamt: H1 läses ur Nyehandel. **Produktspecifikt:** kapitelrubriker och "Vad är …?" |
| FAQ | 6 frågor | 5 (2 ml/5 ml-frågan döljs utan jämförelseprodukt) | Mekaniken är gemensam (en fråga utan data döljs). Frågorna är **produktspecifika** |
| Karusell | MS Vapes → Alla vapes | (fixtur: samma källor) | Källor och undantag (THCaB) är **produktspecifika** |
| Stämningsbild | kustljus (känt ursprung) | Ingen | Produktspecifikt, valfritt |
| Obelagda påståenden | Lista i R3 | "19,34 % Core", "95 % aktiva", "Varje batch analyseras", "laglig i Sverige", "<0,2 % Δ9-THC", "Laglig i Sverige" i meta | **Produktspecifik faktagranskning före författad sida** |

### Fixturer

| Fixtur | Resultat |
|---|---|
| Inga recensioner | Båda produkterna: ingen betygsrad, ingen sektion, ingen tom yta |
| Inget analysdokument (Hero, PDF-länken bortplockad i testflikens HTML) | Panelen säger "Det finns inga labbrapporter i produktbeskrivningen just nu. Kontakta kundservice …". Inget påhittat dokument |
| Få varianter: Magic Sauce 5 ml, 5 strains | Grupp 1: 3 kort. Grupp 2: Yoda Ice Cream, Bruce Banner OG och en tom cell; nästa-pilen är avstängd. **Färre än tre i sista gruppen fungerar med riktiga data** |
| Många varianter: 9 (MS 2 ml) | 3 grupper |
| Långa svenska namn ("Jordgubbs- och rabarberkräm med vaniljsås", "Citronmarängsmördegskaka – Sativa") | Bugg hittad: ett odelbart ord gjorde kortet bredare och bilden större. Rättat med avstavning, `overflow-wrap: anywhere` och tre rader + "…". Hela namnet finns kvar i `aria-label` och köpdelen |
| Sidledsscroll / JS-fel | Inga i någon fixtur |

### Slutsats

Strukturen är **inte bevisad som universell**. Det som har klarat två verkliga PDP:er (plus 5 ml) är:
- köpdelen
- strainmodulen (grupper om tre)
- labbrapportlistan
- omdömesvillkoret
- FAQ-mekaniken
- karusellens kortkomponent
- pappersarket och ljuset

Det som måste vara **produktspecifikt** per sida:
- "Vad är …?"-texten
- vilka textavsnitt som visas öppet
- analystexten
- frågorna och jämförelseprodukten
- karusellkällor och undantag
- eventuell stämningsbild
- faktagranskningslistan

Innan en andra produkt får en författad sida behövs en faktagranskad innehållspost för just den produkten, och en ny visuell granskning.

## Kvarvarande skillnader mot facit

**Designfel:**
1. Mobilens "Vad är …" är 246 px mot facits ~165 px. Skillnaden beror på större, läsbar text.
2. Växterna är bara vid arkets nedre hörn och vid Om-bilden. Facit har fler och större blad, bland annat uppe till vänster vid arket och vid footern.
3. Arket har fina kanter men raka kortsidor. Facit har tydligare rivna kortsidor.
4. Ljuset är lugnare och mindre aprikosmättat än i facit.
5. Strainkorten på mobil är små (~95 px), eftersom tre ska rymmas.
6. Mobilens miniatyrer ligger som scrollbar kolumn med 36 px-bilder, inte facits mindre och fler.

**Avsiktligt (verklig data eller regel):**
- Inga omdömen (0 importerade). Testbilderna visar hur det blir när de finns.
- Fem PDF:er i stället för ett gemensamt intyg.
- H1 "Magic Sauce 3.0 - 2ml".
- Ordagrann Om-text.
- Sex frågor.
- Riktiga produkter i karusellen.
- Kustbild utan palmer.
- "Full produktinformation".
- Theme 8:s globala footer.

## Öppna SEO- och adminfrågor (oförändrade, inget gjort)

Se `R4-SLUTKONTROLL.md`. Kort:
- extra H1 i den korta beskrivningen
- rubrikordningen i produkttexten
- "Vad är …", frågesvaren och fyra strainnamn finns bara efter JavaScript
- obelagda påståenden i text, meta och JSON-LD
- produktnamnet "– 2 ml"
- import av 40 omdömen
- vilket labbdokument som gäller hela produkten, och flytt av PDF:er från www.hazey.se
- 301, canonical och noindex vid domänbytet
- rättigheter till bladfotot (din bekräftelse)
- om THCbA/THC-B ska bort ur karusellen
