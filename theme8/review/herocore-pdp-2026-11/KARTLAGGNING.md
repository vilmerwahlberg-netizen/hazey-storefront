# Hero's Core 2 ml (produkt 255): kartläggning och första innehållspost (2026-11-17)

Gren: `feat/theme8-herocore-pdp` (från `dev` 953d902). Lokalt, inte committad, inte mergad. Ingen adminändring.

## Kartläggning (riktig Nyehandel-data, `map.mjs` → `map.json`)

| Område | Läst värde |
|---|---|
| Produkt | id 255, "Hero's Core - 2ml", varumärke Hero (`/sv/brand/hero`). URL `/sv/products/thc-x-vape-hero-core-2ml`, `viewProduct('255')` |
| Varianter | 6 strains, alla 675 kr och i lager: Gelato - Indica (425), Strawberry Kush - Sativa (429), Melon Haze (431), Pineapple Express -Sativa (433), Super Lemon Haze (435), Coconut Cake - Indica (438) |
| Bilder | 12 galleribilder, en förpackningsbild per strain (`p156-core-vape-gelato…` osv.). Strainmodulen får rätt bild per strain |
| Paket | 3-pack: produkt 263, 1 920 kr (640 kr/st). 5-pack: produkt 265, 3 135 kr (627 kr/st). Båda `is_package` |
| Omdömen | 0 i Nyehandel. Woo har 7 (4,71), matchade SÄKER till 255, men de är inte importerade, så inga betyg visas |
| Intyg | En PDF i produkttexten, länktext "LABBTEST", `www.hazey.se/wp-content/uploads/2025/07/CoA-THCX.pdf` (svarar 200) |
| Kategorier | Alla Vapes, Alla produkter, Hero Vapes, Core Vapes |
| Titel | `THCX Vape 2ml %%sep%% High Life CORE CCELL \| HERO` |
| Meta | "High Life CORE Vape med 19,34% Core och 95% aktiva cannabinoider. CCELL-teknik, labbtestad kvalitet och baserad på industrihampa. Laglig i Sverige." |
| Rubriker (serverns HTML) | H3 "Beskrivning av Hero's Core - 2ml", **H1 "Hero CORE Vape 2ml"** (i produkttexten), H2 "Vad är Core?", H4 "En laglig cannabis:" |
| JSON-LD | Product: namn, SKU HZY-WC-347476, Brand Hero, Offer 675 kr InStock. Ingen aggregateRating |
| Canonical / robots | nyehandel-domänen / `noindex, nofollow` (globalt, känt) |

### Vad intyget faktiskt visar

Certificate of Analysis från CBM-Labs Europe B.V.:
- Product name "VAPE DISTILLATE", batch PA 45570394.
- Kund PLO Supplies B.V.
- Utfärdat 2025-10-17, analyserat 2025-10-16, giltigt till 2027-10-16.
- THCX 19,34 %, CBD 30,05 %, CBG 16,26 %, CBN 13,60 %, CBC 9,34 %, totalt 95,195 %. D9-THC ND.

Halterna stämmer med produkttexten, men:
- Intyget kallar ämnet **THCX**, medan produkttexten säger **"Core"**.
- Intyget nämner varken Hero, Hero's Core eller någon strain.
- Ett intyg, en batch. Texten säger "Varje batch analyseras".
- Mappen i URL:en är 2025/07, men utfärdandedatum är 2025-10. Filen kan ha bytts ut; det är inte utrett.

## Före (dagens Theme 8-preview)

Standardflödet visar:
- "Kort om produkten"
- dragspelen Produktfakta, Innehåll och analys, Leverans och Vanliga frågor
- "Liknande produkter" och "Bästsäljare"

Under "Innehåll och analys" står **"Labbrapport skickas på begäran"**, trots att produkttexten länkar till en PDF. Det är ett fel i standardflödet, utanför den här posten.

## Efter (lokal build)

Posten `255` i `theme8/js/85c-pdp-content.js` har egen copy. Inget är kopierat från MS-posten, och ny copy säger bara sådant som Nyehandels data visar:
- **Vad är Hero's Core?** Typ, volym, varumärke och antal strains (läses live).
- **Strains och labbrapport.** Grupper om tre (1–3, 4–6) och panelen "Labbrapport" med den enda PDF:en. Panelen säger att dokumentet inte är namngivet efter någon strain. Inget påstås om vad det gäller.
- **Om Hero's Core och Hero.** "Hero CORE Vape 2ml" står vänster, "Vad är Core?" höger. Därunder bild och Specifikationer (Produkttyp, Tillverkare, Volym, Strains). "En laglig cannabis", Produktinformation, LABBTEST och ansvarstexten ligger ordagrant i Full produktinformation.
- **Sex FAQ, egna frågor:**
  - strains
  - labbrapport
  - tillverkare
  - om en engångsvape fylls på
  - 3-/5-pack
  - leverans och retur
- **Fler vapes att upptäcka.** Bara från Alla vapes, Hero först, THCaB borttaget som i MS-posten.

Två generella ändringar i `85d-pdp-chapters.js`, där MS 2 ml är oförändrad (`check.mjs` gav identiskt resultat utom varukorgsradens id):
1. FAQ-svaret om analys sa alltid "namngivna efter strain" och "Strains och analys". Nu sägs det bara när dokumentnamnen faktiskt är strains, och länken använder postens egen rubrik.
2. En H1 i adminens produkttext blir H2 i den renderade sidan, så sidan har en H1. Serverns HTML är oförändrad.

## Kontroller (lokal build i Theme 8-previewn)

| Kontroll | Resultat |
|---|---|
| H1 | 1 (393/1440/1920) |
| Sidledsscroll | Ingen |
| Innehåll | Alla nyckelrader i DOM, inklusive "En laglig cannabis" och lagreferensen. 0 trasiga länkar |
| FAQ | 6 frågor, ingen dold. Enter öppnar |
| Köp 1 st | Melon Haze tillagd och borttagen |
| Paket | 3-pack valbart med tre platser och köpbart. Raden tillagd och borttagen |
| Strains | 3 + 3, 0 px hopp, val synkas till köpdelen, piltangent och svep byter grupp |
| Blad | Inom fönstret och ingen text täckt vid 393/430/1440/1920 |
| Omdömen | Inga betyg eller sektion. Fixturen med testomdömen fungerar och syns inte i bilderna |
| Labblänk | PDF 200 `application/pdf` |
| Karusell | 10 vapes, inte den egna produkten, inga paket |

## Bilder (`shots/`)

- Före → efter → godkänd MS 2 ml: `jamforelse/fore-efter-{393,1440,1920}.jpg`
- Helsidor: `fore-*.jpg`, `efter-*.jpg`
- Sektionsutsnitt: `sections/efter-{393,1440,1920}-0{1..7}-*.jpg`
- Strain-grupper: `strains/hc-{1440,393}-grupp-{1,2}.jpg`
- Paketbyggaren: `paket/paket-3-{393,1440}.jpg`
- Blad: `blad/`

## Kvar att besluta (inget ändrat)

**Admin:**
1. **3-paketet heter "PILOT T19 – Hero's Core 2ml – 3-pack"** (produkt 263), och det namnet syns i varukorgen. Det bör döpas om som 5-packet ("… – 3-pack (blandbart)"). Routen `/pilot-t19-…` påverkas också.
2. **Titeln innehåller `%%sep%%`**, en kvarglömd Yoast-variabel, och säger "THCX" medan texten säger "Core".
3. **Extra H1** "Hero CORE Vape 2ml" i produkttexten. Den bör bli H2. Rubriknivåerna är H3 → H1 → H2 → H4.
4. **Meta och text** innehåller obelagda påståenden (`?hz8-factcheck=1` markerar 17):
   - "Laglig i Sverige", "En laglig cannabis" (även ordet cannabis)
   - "Varje batch analyseras"
   - CCELL, "nästa generation"
   - halter som bara gäller en batch
   - lagreferensen 167/1998
5. **Terminologi:** "Core" eller "THCX".
6. **Intyget:** gäller det den här produkten och alla strains? Ska PDF:en flyttas från `hazey.se/wp-content` före domänbytet?
7. **Omdömen:** import av de 7 Woo-omdömena.

**Katalog:** kategorin Hero Vapes innehåller buds och hasch (5 g). Därför hämtar karusellen bara från Alla vapes.

**Design:**
- Om-bilden är samma illustrativa kustbild som i MS-piloten. En egen bild för Hero saknas.
- Bladfotot har fortfarande obekräftade rättigheter.
- Standardflödets "Labbrapport skickas på begäran" trots PDF berör alla icke-författade PDP:er och är inte rättat här.

Mallen är fortfarande inte universell. Den är prövad på två vapes med strains och paket.
