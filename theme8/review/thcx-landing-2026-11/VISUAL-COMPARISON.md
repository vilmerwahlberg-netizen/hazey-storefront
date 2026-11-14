# THCX-landning: visuell jämförelse mot koncept B

Gren `feat/theme8-thcx-landing`, ombyggnad 2026-11-14 efter att `eb477bb`
underkändes. Ingen merge, ingen adminändring, inget publicerat.
Skärmbilder: lokal Theme 8-build i preview-instansen, `/sv/page/thcx`
simulerad med blocket i en riktig tom innehållssida (`verify.mjs`).

Bilderna är incheckade som WebP q85 (PNG gav 40 MB). Ny körning:
`node verify.mjs && node compare.mjs`, därefter
`for f in shots/*.png; do cwebp -quiet -q 85 "$f" -o "${f%.png}.webp" && rm "$f"; done`.

**Jämförelseblad (koncept B | före | efter), runda 2:**
`shots/compare-1440-hero.webp`, `shots/compare-393-hero.webp` (hero + produktkort),
`shots/compare-1440-faq.webp`, `shots/compare-393-faq.webp` (uppslag + FAQ).
Före = `2235591` renderad med samma harness (`before-2235591/`); första
versionen `eb477bb` finns kvar i `before-eb477bb/`.
Före-bilder: `before-eb477bb/`. Efter: `shots/thcx-{320,393,430,768,1440,1920}-{fold,full}.webp`,
`shots/thcx-{393,1440,1920}-{stage,uppslag}.webp`, felfall `shots/thcx-{393,1440}-noatmo-*`,
`thcx-1440-noprod-*`, `thcx-393-zero-*`.

## Referensdetalj → implementation

| Konceptdetalj | Faktiskt resultat | Bevis | Kvarvarande avvikelse |
|---|---|---|---|
| Solbelyst puts med lövskuggor bakom header, H1 och ingress | `plaster-leaf-1672/900.webp` som body-bakgrund, tonas ut i en varm canvas härledd ur `--hz8-beige` och putsens egen ton. En svag persikoton och en ljusare fläck bakom texten ger lugn läsyta. Samma riktiga glasheader. | `thcx-1440-fold`, `thcx-393-fold` | Konceptets ljus är mer orange/kvällsrött; vår puts är gulare (bildens egen ton). Lövskuggan i konceptet är skarpare och större. |
| Enkel stor rubrik `THCX`, kort ingress, tunn kapitelrad med orange markering | H1 är nu bara `THCX` (en H1). Ingressen behåller hela den granskade texten; "vapes", "hasch" och "fakta" står i den. Kapitelrad: Produkter, Om THCX, Analysintyg, Frågor. | `thcx-1440-fold` | Ingressen är fyra rader mot konceptets tre, eftersom faktatexten inte fick kortas i denna runda. Konceptet har tre ankare, vi har fyra (Analysintyg finns som kapitel). |
| Tre produktvägar på varm stenstage: Hero’s Core, High Life, El Gringo | Tre redaktionella kort med `product-stage-960.webp`. **Verklig** frilagd förpackning ur Nyehandels bildtjänst (samma original, 720 px WebP). Varje kort visar livepris och livenamn och leder till riktig produktsida. Kontaktskugga plus mjuk fallskugga åt höger, i ljusets riktning. Varmt ljus från vänster läggs bara på stagen; förpackningen är orörd. | `thcx-1440-stage`, `thcx-1920-fold` | Konceptets påhittade enheter står bredvid en sten. Våra verkliga förpackningar är askar och påsar med starka färger, så kortet blir mer kommersiellt än konceptets monokroma stillbild. Olivgrenen i stagebilden upprepas i alla tre korten, som i konceptet. |
| Kortets nedre del: namn, kort undertext, olivgrön "Visa produkt →" | Display-serif-namn, saklig undertext ("Vape 2 ml i flera strains", "Hasch 5 g"), olivgrön knapp. Hela kortet är en länk; sortnamnen är egna länkar. Pris från Nyehandel, inklusive rea. | `thcx-1440-fold` | Konceptets undertexter ("Brett sortiment av THCX" m.fl.) användes inte, eftersom de är påhittade. Vi har en extra prisrad, vilket gör korten ca 40 px högre. |
| Mobil: en tydlig huvudruta, nästa kort syns i kanten | Svepbar rad, 82 % breda kort, nästa kort syns. Fullbred knapp. | `thcx-393-fold`, `thcx-320-fold` | Inga prickar under raden; svepet visas av kortet i kanten. Vid 393 px syns rubrik, ingress, kapitelrad och stagens överdel i första vyn, inte hela kortet. Ingressen är längre än i konceptet. |
| Inga nio likadana katalogkort under ingressen | Nio köpbara varianter finns kvar i ett **sekundärt** led ("Alla sorter i lager") under de tre vägarna: kompakta Nyehandel-kort, 6,4 per vy på desktop. | `thcx-1440-full` | Ledet finns inte i konceptet; det krävs för att alla varianter ska nås. |
| Faktauppslag: text vänster, kustbild med person i kvällsljus till höger, mjuk övergång | `coast-editorial-1672/900.webp`. Bilden fyller högra ~60 % ut till fönsterkanten och maskas mjukt åt vänster, uppåt och nedåt in i sanden. Ingen citattext. Den granskade faktatexten står kvar ordagrant. Mobil: bilden kommer efter första faktastycket. | `thcx-1440-uppslag`, `thcx-1920-uppslag`, `thcx-393-full` | Konceptets kursiva citat finns inte, eftersom det var ett påhittat effektpåstående. Uppslaget blir därför textlättare till höger. Bilden når ända till fönsterkanten, vilket konceptets inramade sida inte gör. |
| Varm, luftig FAQ med tydlig CTA till höger | Tre spalter: rubrik, frågor (tonade rader, inga vita kort), CTA-ruta med olivgrön knapp. Ytan ljusnar mjukt uppifrån. Olivgren i nedre vänstra kanten (desktop ≥ 1024). Samtliga befintliga frågor står kvar; laglighetsfrågan är fortfarande blockerad. | `thcx-1440-full` | Konceptet visar tre frågor, vi har sex. Olivgrenen kan uppfattas som påklistrad. Den är lätt att ta bort (en regel) om Vilmer tycker så. |
| Sammanhängande varm canvas hero → produkter → uppslag → FAQ | En canvas genom hela sidan. Inga hårda sektionsklipp eller grå ytor. | `thcx-1440-full`, `thcx-393-full` | Faktakapitlen (Hero’s Core i THCX-familjen, Analysintyg) mellan uppslaget och FAQ har ingen motsvarighet i konceptet och är en lugnare, ren textyta. |

## Saknade bilder och dataextremer

| Fall | Resultat |
|---|---|
| Atmosfärsbilder 404 (`noatmo`) | Canvasens varma ton står kvar. Stagen blir en tonad vägg med stenfärgad avsats, och produkterna står kvar med kontaktskugga. Kustbilden ersätts av en mjuk varm toning. Inget grått, ingen layoutförskjutning. |
| Produktbilder 404 (`noprod`) | Tom stenstage med namn, pris och länkar. Inga trasiga bildikoner. |
| Inga produkter i källorna (`zero`) | Vägarna står kvar som i initial HTML, med text och riktiga länkar. Sortimentsledet visar blockets reservlänkar. |
| En väg utan lager | Vägen döljs; övriga står kvar (logik i `initLeads`). |

## Funktion (verify.json)

Alla körningar 320/393/430/768/1440/1920 och felfallen:
- en H1;
- 0 px sidledsscroll;
- inga Indica/Sativa i synliga namn;
- inga förbjudna ord;
- inga konsolfel;
- Tab från kapitelraden ger synlig fokusram på första produktvägen;
- ankarlänk ger fokus på rätt rubrik;
- FAQ öppnas med Enter.

Alla 9 unika interna länkar svarar 200.

Bildvikt i repo (`theme8/assets/landing-thcx/`):

| Fil | Storlek |
|---|---|
| puts 1672 | 194 kB |
| puts 900 | 21 kB |
| stage | 64 kB |
| kust 1672 | 111 kB |
| kust 900 | 36 kB |
| olivgren | 71 kB |
| stenplan | 44 kB, ingår men används inte |

Produktbilderna hämtas som 720 px WebP, ca 45 kB styck.

## Runda 2 (efter Vilmers granskning av 2235591)

| Punkt | Ändring | Kvar mot koncept B |
|---|---|---|
| 1. Hero ljusare, persikovarm, lugnare bakom text | Canvasen och putsens ljuslager drar nu mot persika (Theme 8-yta + CTA-orange). En mjuk radial ljuspöl utan kant dämpar lövskuggorna bakom H1, ingress och kapitelrad. Kontrast mätt mot bakgrunden bakom varje textrad, i värsta 5 %-percentilen: H1 ≥ 6,6:1, ingress ≥ 11:1, kapitelrad ≥ 11:1 (393 och 1440). | Konceptet är ännu något ljusare i övre vänstra hörnet och har skarpare lövskuggor till höger. |
| 2. Varmare, integrerade kort | Textytan är varm sand-persika (ingen nästan-vit). Kanten är varm i stället för vit, och skuggan ligger lägre och bredare i ljusets riktning. Stenens framkant tonar kort in i textytan. Stagen har ljusats och värmts med skikt som bara ligger på bakgrunden. | Konceptets stagebild har en orange solfläck; vår stagebild är jämnare. |
| 3. Mobilkort | 74 % bredd (nästa kort syns ca 70 px), bild 16:10, förpackningen ca 40 % av kortbredden. Kompakt text: namn + pris på en rad, typ, sorter, knapp. | Inga prickar under raden. |
| 4. Sortiment → uppslag | En kapitelzon i persikoton glider in under sortimentet och ut efter uppslaget. Desktop: uppslaget är lägre och fotots övre toning kortare, så himlen inte bleks. Mobil: fotot fyller bredden och andra faktastycket börjar i bildens uttonade nederkant. | Konceptets citat finns fortfarande inte (påhittat effektpåstående). |
| 5. FAQ och olivgren | Grenen är borttagen. Frågorna har samma material som korttexten: varm kant, ljust överljus och mjuk skugga; öppen fråga ljusnar. Ytans ljuspöl klipps inte längre i överkanten. | Konceptet visar tre frågor, vi har sex (innehållet är låst). |

## Ärlig sammanfattning

Kompositionen matchar nu koncept B: kort THCX-hero på solbelyst puts, tre produktvägar på sten, öppet kustuppslag och en varm FAQ. Den största skillnaden finns i produkterna. Konceptets lugna, påhittade enheter är ersatta av Hazeys verkliga, färgstarka förpackningar, vilket gör stagerna mer kommersiella och mindre "stilleben". Den näst största skillnaden är ljusets färg: konceptet är persikoorange, vi är gyllengula. Därefter följer att citatet saknas och att textmängden är större, eftersom faktatexten är låst.
