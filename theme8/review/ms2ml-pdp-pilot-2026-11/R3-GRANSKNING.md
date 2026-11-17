# R3: korrigering av etapp 1 och granskning av hela sidan mot facit (2026-11-17)

Allt är lokalt: ingen commit, push, merge eller adminändring.

- **Facit:** `ms-2ml-seo-first-{desktop,mobile}-v2.png`.
- **Bilder:**
  - `shots/r3-{393,1440,1920}.jpg`: helsidor.
  - `shots/r3-jamforelse/{mobil,desktop}-facit-r2-r3.jpg`: facit → R2 → R3, hela sidan.
  - `shots/etapp1/e2-*`: första delen sida vid sida och närbilder av köpkontroller och pappersskarv.
  - `shots/sections/r3-*`: närbild per sektion.

## 1. Korrigeringen av första delen

| Fel i etapp 1 | Rättning i R3 |
|---|---|
| Stora grå, suddiga bladskuggor på sidan, i köpdelen och på papperet | Alla borttagna (`leaf-shadow-*` används inte längre). Produktscenens accepterade desktopkomposit är tillbaka på sin ursprungliga opacitet. Mobilscenen har bara ljus |
| Inga riktiga växtinslag | Två skarpa, frilagda bambukvistar (inga cannabisblad) vid arkets hörn, var och en med en **separat** varm kastskugga. Skuggan är samma geometri med samma ljusriktning: ljus uppe till vänster, skugga ned/höger, även på den spegelvända kvisten. Bladen ligger utanför läsbar text (desktop: arkets nedre hörn; mobil: arkets övre hörn, rubriken börjar under dem) |
| Pappersbandet såg ut som ett grovt filter | Ny SVG-kontur: fin deckel i överkant, nästan raka sidor och något rivare nederkant. Ljus fiberkant 1,5 px, ljusare mitt och diskret fiber. Skuggan ligger **under** arket: samma kontur, smalare, nedflyttad och mjuk |
| Ljuset var jämnt och utsmetat | Desktop: ljuskägla över produktscenen och en varm glöd i övergången scen → papper. Ytan bakom köpinformationen är jämn och lugn |
| Mobilens första del var för lång | Se mått nedan |

**Assets** ligger i `theme8/assets/pdp-ms2ml-2026-11/`, med källfiler i `asset-src/`:
- `ms2ml-sprig-{leaves,shadow}-{l,r}-{1400,700}.webp`: genererade med `tools/leaf-gen.mjs`, deterministiskt, canvas.
- `ms2ml-paper-{desktop,mobile}{,-rim,-shadow}.svg`: genererade med `tools/paper-gen.mjs`.

Kvistarna är **renderade i kod (måleriskt/vektorlikt), inte fotografier**. De är skarpa i alla storlekar och har alfa. Det lågupplösta Canva-utkastet används inte. Ska bladen vara fotorealistiska som i facit behövs ett riktigt frilagt foto, minst 1400 px brett, med alfa.

### Mått, mobil 393 × 852 och desktop 1440 × 900

Pixlar från sidans topp (`metrics.mjs`, build-ögonblicksbilder i `snapshots/`).

| Läge | Bredd | Bildscen | Köpknappen börjar | "Vad är Magic Sauce 3.0?" börjar |
|---|---|---|---|---|
| R2 | 393 | 113–489 (376 px) | 945 | 1056 |
| Etapp 1 | 393 | 113–423 (310 px) | 871 | 964 |
| **R3** | **393** | **113–372 (259 px)** | **755** | **848** |
| R2 | 1440 | 139–679 | 572 | 687 |
| R3 | 1440 | 139–679 | 586 | 713 |

- **Mobil:** −190 px till köpknappen och −208 px till "Vad är …" jämfört med R2. Alla funktioner finns kvar:
  - Miniatyrerna ligger som kolumn i scenen.
  - Paket, strains och antal har tryckytor ≥ 44 px.
  - "Vald strain 1 av 9" finns kvar för skärmläsare; valet syns på kortet.
- **Desktop:** samma geometri. Köpdelen är 14 px längre eftersom strainkorten är högre (tre i bredd, som facit).

## 2. Hela sidan mot facit, sektion för sektion

**D** = avsiktlig skillnad på grund av riktig data eller regel. **F** = designfel att rätta.

| Sektion | Facit visar | Riktiga sidan visar | Största visuella avvikelse | Största innehålls-/SEO-avvikelse | Föreslagen rättelse |
|---|---|---|---|---|---|
| Köpyta | "Magic Sauce 3.0 – 2 ml", stjärnor + "[antal omdömen]" + "Visa omdömen", mobil "Kundomdömen"-rad, glasval, 3 strains, trygghetsrad | "Magic Sauce 3.0 - 2ml" (Nyehandels namn), ingen betygsrad, glasval, 3 strains (desktop), 4 strains (mobil), trygghetsrad | **F:** mobilen är fortfarande något längre än facit (läsbar text, 26 px pris). Bocken på vald strain ligger nära namnet. **D:** ingen betygsrad | **D:** 40 riktiga Woo-omdömen (snitt 4,69) är matchade SÄKER till 261 men inte importerade (reviews-recovery). Därför visas inga stjärnor och ingen aggregateRating. Woo-sidan har `aggregateRating` 4.69/40 i JSON-LD; den förlorar Nyehandel vid domänbytet om importen inte görs | Importbeslut för omdömena (separat uppdrag). Produktnamnet "– 2 ml" kräver ett beslut i admin. Bockens placering är en liten CSS-fix |
| Papperskapitel | Ljust papper med riven kant, gröna blad i hörnen, lövskugga, rubrik + 2 meningar + 4 fakta | Nytt SVG-ark, två genererade bambukvistar, rubrik + 3 meningar + 4 fakta (live) | **F:** facits blad är större, fotografiska och går in över arket. Våra är mindre och måleriska. Arket är bredare än facits | Svaret "Vad är …" och faktaraden finns **bara efter JavaScript** | Riktigt frilagt bladfoto. Svaret in i Nyehandels produktbeskrivning efter beslut |
| Strains | 3 stora bildkort med pilar, vald = orange ram | 9 kort (5 i bild desktop, 3 mobil) med lager, pilar, vald = orange ram | **F:** desktop har en stor tom yta under strainraden, eftersom labbrapportpanelen är dubbelt så hög | **D:** strainnamnen finns i rå HTML bara via labblänkarnas text och Vue:s select. I renderad DOM är de synliga | Gör panelen kompaktare (två kolumner eller lägre rader) eller låt strainytan växa till två rader |
| Labbrapporter | "Gemensam analys" + ett "Analysdokument" | "Labbrapporter": exakt de fem PDF:erna med egna länktexter, "PDF · hazey.se", not om de fyra strains som saknar rapport | **F:** panelen är högre och tyngre än facits | **D, avsiktlig:** inget påhittat gemensamt intyg. PDF:erna ligger på www.hazey.se (Woo) och dör vid domänbytet om de inte flyttas | Kompakt lista. Filflytt vid domänbytet |
| Om-kapitlen | Kort "Om Magic Sauce 3.0" + specifikationer till vänster; "Om Magic Farmers" + solnedgångsbild till höger | Produkttexten ordagrann: två stycken om Magic Sauce + specifikationer till vänster, "Om Magic Farmers" + riktig produktbild till höger, "Full produktinformation" stängd | **F:** mycket mer text och ingen miljöbild. Ser ut som en artikel, inte facits luftiga uppslag | **D:** texten är ordagrann och innehåller obelagda påståenden (lista nedan). Laglighetsdelarna ligger bakom klick men finns i DOM | Kort, faktagranskad copy först efter ditt beslut. Inget ersätts på egen hand |
| FAQ | "Vanliga frågor", 4 låga rader | "Vanliga frågor om Magic Sauce 3.0 – 2 ml", 6 rader ~50 px | **F:** raderna är högre och tyngre, sektionen ungefär dubbelt så hög | Svaren finns **bara efter JavaScript**. Inget FAQ-schema (avsiktligt) | Låga rader (~40 px) på desktop. Överväg att frågorna in i produktbeskrivningen |
| Produktkarusell | "Upptäck fler vapes", 4 små kort med orange pil, påhittade namn | 10 riktiga kort (temats standardkort, "Välj variant") | **F:** korten är större och tyngre än facits | **F:** "THCA-B 50% - Faraoh - 2ml" och "THC-B 35% - Faraoh - 1ml" visas, men THCaB marknadsförs inte just nu (TASK 23b). **F:** "Apples &amp;amp; Bananas" visas med kodat tecken (befintligt datafel). **D:** bara riktiga produkter, varken denna PDP eller paket | Filtrera bort serier som inte marknadsförs. Avkoda &amp;amp;. Kompaktare kort för PDP-karusellen |
| Kundomdömen | Sektion med platshållare | Ingen sektion | – | **D:** 0 omdömen i Nyehandel | Visas automatiskt när omdömen finns (fixturtestad) |
| Avslut | Trygghetsrad med ikoner + footer med nyhetsbrev | Relaterade kategorier + kundservicekort (orange "Vanliga frågor") + Theme 8:s footer | **F:** ingen trygghetsrad i ikonband. Footern är global och låst (rörs inte) | Relaterade kategorier ger interna länkar (Magic Sauce, MS Vapes, Magic Farmers) som facit saknar | Valfri trygghetsrad före footern |

## 3. SEO och innehåll

Underlag: `seo.mjs`/`seo.json`, `coverage.mjs`/`COVERAGE.md`, briefen och gamla Woo-sidan (hämtad 2026-11-17).

| Kontroll | Woo (gammal) | Nyehandel rå HTML | Renderad pilot | Kommentar |
|---|---|---|---|---|
| Titel | "Magic Sauce 3.0 Vape 2ml - Magic Farmers Cannabinoidblend" | samma | samma | Innehåller Magic Sauce 3.0, vape, 2 ml och Magic Farmers |
| Meta | "…engångsvape 2ml… Semisyntetisk… EU-certifierad industrihampa. Testad i oberoende laboratorier." | samma | samma | Obelagda påståenden, styrs av admin |
| H1 | "Magic Sauce 3.0 - 2ml" (1 st) | **2 st** (+ "Magic Sauce 3.0 - Nästa generation…" i kort beskrivning) | 1 st | Den extra H1:an ska rättas i admin |
| Canonical | hazey.se/produkt/… | hazeyse.nyehandel.se/sv/products/vape-magic-sauce-magic-farmers-2ml | samma | Domänbytet + 301 avgör |
| Robots | – | noindex, nofollow | samma | Globalt, känt |
| Produkttext | Bara ett felaktigt Faraoh/THCA-B-stycke | Hela Magic Sauce-texten | Hela, öppen eller bakom klick | Inget tappat (`COVERAGE.md`: 0 saknas) |
| "engångsvape" | I meta och text | I meta + text | Även i "Vad är …" och Specifikationer (efter JS) | – |
| Strainnamn | I variantväljaren | Endast LABBTEST-länkarna i HTML; övriga via Vue | Synliga | Strainnamnen syns först när JavaScript körts |
| Interna länkar | Kategorier | Kategorier, varumärke, 5 ml, brödsmulor | + Kontakt, FAQ, villkor | Inga tappade |
| Produktfrågor | – | – | 6 frågor (efter JS) | Finns bara efter JavaScript |
| Omdömen/schema | aggregateRating 4.69/40 | ingen | ingen | Kräver import av de riktiga omdömena |

Ingen designändring påstås höja rankingen. Det som avgör är det som finns i HTML, interna länkar, titel och meta, omdömesdata och flytten.

### Befintliga obelagda produkt- och laglighetspåståenden

Ingen ersättningstext föreslås. Alla markeras med `&hz8-factcheck=1`.

- **Produktbeskrivningen:**
  - Sammansättning och terminologi: "semisyntetisk(a) cannabinoidblend" (×3), "naturliga och syntetiska cannabinoider" (×2), "noggrant utvalda".
  - Ursprung och process: "Baserad på EU-certifierad industrihampa", "avancerade laboratorieprocesser".
  - Testning per sats: "Varje sats testas i oberoende laboratorier…", "noggrant kontrollerad för konsekvent kvalitet i varje sats".
  - Laddning: "utan behov av påfyllning eller uppladdning".
  - Jämförande: "förbättrad stabilitet", "i framkant av den europeiska legala cannabinoidmarknaden", "europeiskt varumärke… inom lagliga ramar", "forskning, laboratorietestning".
  - Laglighet: "följer gällande svensk lag", "mindre än 0,3 % THC", "efterlever noggrant svenska lagar… laglig och ansvarsfull cannabinoidupplevelse", "Tillverkad av industrihampa enligt EU-regelverk (<0,3 % THC)", "Uppfyller gällande svensk lag", "Avsedd för industriella… Ej för konsumtion".
  - Specifikationer: "99% Magic Sauce 3.0", "Svalt, mörkt och helst stående".
- **Kort beskrivning (dold):** "Nästa generation av Magic Farmers semisyntetiska cannabinoidblend", "mest uppskattade formula".
- **Meta och JSON-LD Product-beskrivningen:** samma påståenden.

## 4. Allt som fortfarande skiljer sig från facit

1. **Bladen är genererade bambukvistar, inte fotografiska tropiska blad.** De är mindre och placerade utanför texten i stället för över arket.
2. **Arket:** inga palmskuggor över papperet och lite bredare än facit. Kanten är finare och renare än facits mer fibriga deckel.
3. **Rubriken** är "- 2ml", inte "– 2 ml". Ingen betygsrad, ingen "Visa omdömen" och ingen "Kundomdömen"-rad på mobil (inga importerade omdömen).
4. **Mobilens första del** är ungefär 1,2× facits höjd: läsbar typografi, raden "I lager" och strainkort 114 px breda. Bocken på vald strain ligger tätt mot namnet.
5. **Miniatyrerna på mobil** är 36 px och scrollar. I facit är de fler och mindre.
6. **Strains:** 9 riktiga kort i stället för 3, och en tom yta under raden på desktop.
7. **Labbrapporter:** fem dokument i en mörk, hög panel i stället för ett dokument.
8. **Om-kapitlen:** lång ordagrann text, produktbild i stället för solnedgång, och "Full produktinformation" som extra rad.
9. **FAQ:** sex högre rader i stället för fyra låga, med längre rubrik.
10. **Karusellen:** temats stora standardkort med "Välj variant" i stället för små kort med pil. Den innehåller THCaB-produkter som inte marknadsförs, och &amp;amp; i ett namn.
11. **Ingen omdömessektion** (riktig data).
12. **Ingen ikonbaserad trygghetsrad före footern.** Footern är Theme 8:s globala, inte facits.
13. **Ljuset:** facit har en mer mättad aprikos över hela sidan och starkare lövskuggor i produktscenen. R3 är medvetet lugnare bakom köpinformationen.

**Nästa steg är inte påbörjat:** ingen utrullning till andra produkter.
