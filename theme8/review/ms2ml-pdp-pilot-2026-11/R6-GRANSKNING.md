# R6: sista visuella runda mot hela referenssidan (2026-11-17)

Allt är lokalt: ingen commit, push, merge, adminändring, ändring av andra PDP:er eller av global header/footer.

Ny fil: `theme8/css/85g-pdp-authored-r6.css` (bara `html.hz8-pdp-authored`). Små JS-ändringar i `85d`:
- ett tredje blad i bandets markup
- specifikationerna i högerspalten när den har innehåll

## Bilder (under `shots/`)

| Vad | Fil |
|---|---|
| R5 → R6 → referens, **topp / mitt / nederdel**, mobil | `r6-jamforelse/mobil-1-topp.jpg`, `mobil-2-mitt.jpg`, `mobil-3-nederdel.jpg` |
| Samma, desktop 1440 | `r6-jamforelse/desktop-1-topp.jpg`, `desktop-2-mitt.jpg`, `desktop-3-nederdel.jpg` |
| R5 → R6 vid 1920 | `r6-jamforelse/1920-r5-r6.jpg` |
| Helsidor | `r6-393.jpg`, `r6-1440.jpg`, `r6-1920.jpg` |
| Läsbara mobilutsnitt | `sections/r6-393-01-kop.jpg`, `-02-vad-ar` (faktablad), `-03-strains-labb`, `-04-om`, `-05-faq`, `-06-karusell`, `-07-avslut` (även `r6-1440-*`, `r6-1920-*`) |
| Bladkanter vid 393/430/1440/1920 | `r5-leaves/r5-*-papper-hornen.jpg` (omtagna med R6) |

## Sektion för sektion: referens, vad R5 saknade och ändring i R6

| Sektion | Referensen gör | R5 saknade | Ändring i R6 |
|---|---|---|---|
| **Hela sidan** | Mättad persika med mörkare aprikoskanter och ljusa solfält; ljusa cream-ytor lyfta med skugga | Jämnt blekbeige från topp till footer; beige mot beige | Ny bas `#f4d9bc`, mörkare kanter `#e9c39b`, solfält uppe till vänster i varje kapitel genom hela sidan. Alla ytor (ark, strainplattor, specifikationer, FAQ, kort, kundservice) i ljus cream med varm kontakt- och omgivningsskugga |
| **Köpdel** | Varm scen, glasval | Redan nära | Bara via nya basen och ljuset. Glasval, köpknapp och flöde oförändrade |
| **Faktablad** | Tunt, ljust ark, blad runt arket | Arket smälte in i bakgrunden | Ljusare ark (`#fffdf8` → `#fcf3e5`) mot mörkare bas. Två skuggor: kontakt + omgivning. Ett tredje skarpt blad uppe till vänster (desktop, bara palmspetsar i marginalen). Större hörnblad på desktop. Inga blad över text och alla inom fönstret |
| **Strains/analys** | Kort med cream-platta och djup; mörk analyspanel i samma rad | Genomskinliga kort utan djup; panelen såg pålimmad ut | Strainkorten har en ljus platta med toppljus och skugga; vald strain har orange kant, ring och orange namn. Analyspanelen har varmt sidoljus, mörkare hörn, svag lövskugga i ytan (`soft-light`) och djupare skugga. Den är centrerad mot kortraden |
| **Om-uppslag** | Två balanserade spalter, delare, bild till höger | Lång vänsterspalt, tom högerspalt under bilden | Linje ovanför kapitlet. Kapitelrubriken är en liten etikett (fortfarande H2), avsnittsrubrikerna större (26–34 px). Specifikationerna flyttade under bilden i högerspalten, i ett cream-kort. All text står kvar i HTML |
| **FAQ** | Ljusa cream-rader med tunn kant | Beige linjer på beige | Cream-rader: varm 1 px kant, lyft och skugga, tydlig hover, orange fokusring och orange plus/minus. 8 px mellan raderna. 46 px höga |
| **Karusell** | Ljusa kort med mjuk skugga | Glaskort som smälte in | Cream-kort med lyft och hover, ljus platta bakom produktbilden, orange fokusring. Riktiga produkter och priser |
| **Avslut** | Värmen går ned till footern, blad vid skarven | Hård övergång | Djupare varm ton och solfält ned mot footern. Kundservice i cream. Ett skarpt blad vid footerskarven nere till höger, under knapparna. Footern är orörd |

## Kontroller (R6-build)

| Kontroll | Resultat |
|---|---|
| Sidledsscroll vid 393 / 1440 / 1920 | Ingen (sidbredd = fönsterbredd) |
| Bladkanter (`leaves-check.mjs`) vid 393 / 430 / 1440 / 1920 | Helt inom fönstret, ingen överlappning med text, nedre kanten tonad, inga raka klipp |
| Köp (`check.mjs`) | 1 st i varukorgen och borttagen |
| Strains (`strains-test.mjs`) | 3 kort per grupp i 3 grupper, 0 px scrollhopp, slutsåld strain kan inte väljas, piltangent byter grupp |
| Tangentbord | FAQ öppnas med Enter; karusellpilen flyttar listan |
| Innehåll | 1 renderad H1, 0 saknade rader/länkar (`coverage.mjs`), sex FAQ-frågor, fem PDF-länkar |
| Recensioner | Inga stjärnor och ingen sektion (0 i Nyehandel) |
| Kontrast (WCAG) | FAQ-fråga 14,1:1, brödtext på persika 10,2:1, dämpad text 6,3:1 (5,3:1 vid mörkaste kanten), kapiteletikett 5,6:1, vald strain 5,1:1, analystext 7,8:1, lagerstatus 7,2:1 |

## Kvarvarande skillnader mot referensen

**Designfel:**
1. Referensen har **oskarpa blad i förgrunden** längs sidkanterna (djupskärpa). De är medvetet inte byggda, eftersom bladen skulle vara skarpa och aldrig utsmetade. Därför är R6:s kanter lugnare än referensens.
2. Referensens strainkort är större i förhållande till sektionen (tre stora på desktop). R6 har tre kort i den vänstra delen bredvid analysen, och på mobil är korten ~95 px.
3. Referensens ark har tydligare rivna kortsidor och palmskuggor över ytan. R6 har fin kant och raka kortsidor.
4. Om-uppslaget har fortfarande längre text än referensen. Vänsterspalten är tung, eftersom texten är ordagrann.
5. Mobilens faktablad är ~246 px mot referensens ~165 px (läsbar textstorlek).
6. Mobilens produktkort är stående. Referensen har liggande kort med bilden till vänster.

**Avsiktligt på grund av verklig data eller regler:**
- inga omdömen
- fem PDF:er i stället för ett gemensamt intyg
- H1 "Magic Sauce 3.0 - 2ml"
- ordagrann Om-text
- sex frågor
- riktiga produkter
- kustbild utan palmer
- ingen trygghetsrad före footern (redan under köpknappen)
- Theme 8:s globala footer, utan nyhetsbrev som i referensen

## Inte universell

Mallen är testad på MS 2 ml och med fixtur på Hero's Core och MS 5 ml (R5). Den är inte visuellt godkänd och inte prövad på andra produktfamiljer (buds, hasch, tillbehör). Ingen commit eller push förrän R6-bilderna är granskade.

## Sista puts: bara "Vad är Magic Sauce 3.0?" (2026-11-17)

Ny fil: `theme8/css/85h-pdp-paper-polish.css`, som bara gäller `#hz8-pcx-sum`. Arkets nya kontur `ms2ml-paper-{desktop,mobile}-v2*.svg` kommer från `tools/paper-gen-v2.mjs`.

Ändrat:
- något mindre padding
- lätt sliten kant runt om: låg vågighet, fina fibrer och enstaka små hack
- varmare skiftningar och fläckighet i papperet, med varm åldrad ton mot kanten
- ljus från övre vänster och skuggan förskjuten ned/höger
- desktopens nedre hörnblad 10 px lägre, så att bladmassan håller avstånd till ingressen

Text, SEO, köpdel, strainval och övriga kapitel är orörda.

| Mått | 393 före → efter | 1440 före → efter | 1920 före → efter |
|---|---|---|---|
| Modulens höjd | 246 → **238** | 297 → **279** | 312 → **292** |
| Strains börjar | 1120 → 1112 | 1076 → 1058 | 1129 → 1109 |

**Bilder:**
- `shots/r6-papper/jamforelse-{393,1440,1920}.jpg` (före → efter → referens)
- `shots/r6-papper/{fore,efter}-*.jpg` (närbilder)
- `shots/final-{393,1440,1920}.jpg` och `shots/sections/final-*` (helsidor och utsnitt)

**Kontroller efter putsen:**
- Bladen är inom fönstret och överlappar ingen text vid 393, 430, 1440 och 1920.
- Ingen sidledsscroll.
- En H1, 0 saknade rader och länkar.
- Köp, strainval (3/3/3, 0 px hopp), tangentbord, FAQ och fem PDF-länkar fungerar.
- Inga betyg visas.

**Kvar mot referensen:** referensens ark är mörkare och mer texturerat i kanten och har palmskuggor över ytan. Putsen är medvetet återhållsam för läsbarhetens skull, och för att inte se målad ut.
