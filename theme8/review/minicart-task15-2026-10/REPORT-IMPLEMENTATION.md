# TASK 15: minicart enligt v4-facit, implementationsrapport

- Datum: 2026-10-30
- Worktree: `../hazey-storefront-task15`, gren `prep/task-15-minicart`
  (bas `origin/dev` 648a551)
- Status: lokalt, inget stagat, committat, pushat, publicerat eller
  ändrat i admin.
- Facit: endast `concepts-codex/` (v4-PNG, WebP-utsnitt och officiella SVG).
- Miljö: Theme 8-preview med lokal build (`node build-theme8.js`),
  testkorgar i egna sessioner, ingen order.

## Granskningsmaterial

| Blad | Innehåll |
|---|---|
| `sheets/01-main-v4-vs-after.png` | Huvudvyn: facit desktop/mobil bredvid riktig rendering |
| `sheets/02-strain-v4-vs-after.png` | Strainvyn: komplett, ofullständig, öppen plats, efter Spara |
| `sheets/03-before-after-393.png` | Före/efter 393 (flera, variant, rea, tom, lagergräns, API-fel, laddning) |
| `sheets/04-before-after-1440.png` | Före/efter 1440 (drawern) |
| `sheets/05-widths.png` | 320, 430, 1920 och 200 % zoom |
| `sheets/06-states-393.png`, `07-states-1440.png` | Alla 30 tillstånd |

Enskilda bilder finns i `after/{bredd}-{tillstånd}-top|bottom|full|during.png`.
`full` visar hela drawern med viewporten förlängd. Mätdata finns i
`runs/after-*.json` och `runs/after-keyboard.json`.

## Ändrade filer

| Fil | Ändring |
|---|---|
| `theme8/js/84-cart.js` | Omskriven för v4 (se nedan) |
| `theme8/css/84-cart.css` | Omskriven för v4 |
| `theme8/js/85-pdp-pilot.js` | **+3 rader, delad fil.** Exponerar `HZ8.packageRegistry` (befintliga `PACKAGE_PRODUCTS`, `PACKAGE_PLAN`, `FAMILIES`, `PKG_REVIEW`). Behövs för att minicarten ska läsa samma paketregister som produktsidan i stället för en kopia. Ingen logikändring. |
| `theme8/assets/minicart-2026-10/` | Ny: officiella `postnord-short-official.svg` och `swish-logo-official.svg`, kopierade oförändrade från `concepts-codex/assets/` |

Inte ändrat: `02a-commerce.js`, header, mobilnav, PDP-logik, produktkort,
footer, kassa, produktdata, loader, andra teman.

## Implementerat

1. **Drawer.** En sandfärgad yta med tunna avdelare och inga kort-i-kort.
   Rubriken "Varukorg (n)" är dialogens namn (`aria-labelledby`, "n varor").
   Bredden är 460 px på desktop och 100 % av den synliga ytan på mobil, aldrig
   `100vw`, så drawern ligger på x = 0 även vid 200 % zoom.
2. **Målmätare.** Tvåstegsmätaren (fri frakt till 150 kr bonus) räknas ur
   Vuex och `HZ8.commerce.rules`. Den visas bara när `rules.backendVerified`
   är sant, se avsnittet om sanning. `?hz8-goals-review=1` visar den märkt som
   förhandsvisning. Fri frakt upprepas aldrig i summeringen.
3. **Rader.** Nyehandels rad, länk, bild, −/+ och Ta bort finns kvar. −/+ ritas
   som riktiga tecken med träffytor på 44 × 44, och ta-bort-ikonen är en
   kontur. Långa namn klipps till 2 rader på desktop och 3 på mobil, och rått
   `&amp;` avkodas för visning. Rea visar jämförpriset bara på raden.
4. **Paket.** Väljaren i raden byggs ur `HZ8.packageRegistry`:
   - **Riktiga paket:** steg kommer bara från verifierade paketprodukter
     (`verified: true`, `is_package`, köpbar, med eget pris). Pris per styck och
     besparing räknas ur paketproduktens pris mot styckpriset; ingen
     procentsats. Steg som 10 eller 15 fungerar.
   - **Utan verifierade paket:** ingen väljare; Nyehandels antal gäller. Den
     gamla uppgraderingsraden, som simulerade paket genom att ändra antal, är
     borttagen.
   - **Granskningsläge (`?hz8-pkg-review=1`):** stegen ur migreringsplanen visas
     med "Paket saknas", utan priser och utan något varukorgsanrop.
5. **Strainvy.** "Ändra" byter till en barnvy i samma drawer, utan modal.
   - **Platser och strains:** varje numrerad plats öppnar listan med
     produktens verkliga strains. Slutsålda visas men går inte att välja, och
     lagret begränsar hur många av samma strain som kan väljas.
   - **Spara och Slumpa:** "Spara val" är spärrad ("Välj N strains till") tills
     alla platser är valda. Slumpa strains väljer bara köpbara strains.
   - **Tangentbord och fokus:** Escape stänger först listan och sedan vyn.
     Fokus och scroll återställs till "Ändra".
   - **Kassan:** kassaknappen är spärrad medan vyn är öppen.
   - **Spara i granskning:** sparar bara lokalt; varukorgen ändras inte.
6. **Tillägg.** Högst ett: pre-roll som standard, batteri om korgen har cart och
   cart om korgen har batteri. Bara verklig, köpbar produkt med pris som inte
   redan ligger i korgen, annars ingen modul. Rubriken är "Komplettera ordern".
7. **Rabattkod.** Utfällbar och skickas via Nyehandels eget flöde
   (`POST /frontend-api/coupon-codes`, `DELETE /coupon-codes/{id}`, därefter
   `cart/reload`). Fältet visar väntan ("Kontrollerar…"), Nyehandels felmeddelande
   och applicerad kod med belopp i grönt.
8. **Summering.**
   - **Rader:** Varor (ordinarie värde), Frakt och Du sparar totalt (orange,
     rad-/rea-/paket- plus kod- plus fraktbesparing, en gång vardera) samt
     Nyehandels Totalt. Moms och Nyehandels separata rabattrad finns kvar för
     skärmläsare men visas inte.
   - **Kassaknapp:** mörk oliv med "Till kassan · {total}" och Nyehandels
     navigering. Under pågående ändring visar den "Uppdaterar…" och klick
     blockeras.
9. **Trygghet.** PostNord-logotypen står vid "Skickas från Sverige", Swish vid
   "Trygg betalning" och bocken vid "Diskret paket". Logotyperna är
   oförändrade SVG-filer.
10. **Fel och väntan.** Varukorgens skrivanrop observeras: XHR-öppning, -sändning
    och `loadend` läses, inget ändras.
    - **Nät- eller API-fel:** `cart/reload` återställer Nyehandels sparade läge,
      och raden visar `role=alert` med "Försök igen".
    - **Lagergräns (406/422):** raden visar `role=status` "Du har valt allt som
      finns i lager just nu.", och + spärras tills antalet sänks.
    - **Övrigt:** ny rad markeras kort (ingen markering vid reduced motion).
      Efter Ta bort flyttas fokus till nästa rad. Live-regionen använder rätt
      numerus.
11. **Låg höjd (≤ 720 px, bland annat 200 % zoom).** Bara kassaknappen, med
    total i etiketten, ligger fast; resten följer scrollen.

## Sanning: vad som döljs och varför

| Del | Läge idag | Beteende |
|---|---|---|
| Fri frakt, bonusmätare, "Fri" i fraktraden, fraktbesparing | Kassan tar **49 kr frakt även för en korg på 745 kr** (uppmätt: drawer 745 kr, kassan 794 kr, `runs/after-checkout.json`). `rules.backendVerified` är `false`. | Döljs. Fraktraden visar "Beräknas i kassan". Med `?hz8-goals-review=1` visas utformningen med texten "Förhandsvisning · reglerna är inte aktiva i kassan ännu." **Beslut:** `02a-commerce.js` visar fortfarande målen i hela previewn för andra komponenter (PDP m.fl.). Minicarten är nu striktare. |
| Paketpris och paketbesparing | Inga paketprodukter är migrerade (`PACKAGE_PRODUCTS` är tomt) | Ingen väljare. Granskningsläget visar strukturen spärrad och utan priser. |
| Pre-roll-tillägg | Alla fyra pre-rolls i Nyehandel är **slutsålda** | Modulen döljs i standardfallet. Batteri- och cart-grenarna fungerar (se bladen). |
| Kodrabatt i totalen | Ingen riktig kod finns. Det är overifierat om `totals.incVat` redan innehåller koden. | Avgörs ur Nyehandels egna tal: om totalen = radsumma − rabatt används totalen; om totalen = radsumma dras rabatten av en gång; annars rörs totalen inte och rabatten räknas inte in i "Du sparar". Måste verifieras med en riktig kod. |

## Avvikelser från facit (klassade)

| # | Avvikelse | Klass |
|---|---|---|
| 1 | Facit visar Faraoh THCbA 47 % 2 ml med 1/3/5 (2 076 kr / −159 kr). Det paketet finns bara i WooCommerce ("THCbA 47% – Faraoh – 2ml") och har ingen säker Nyehandel-matchning i `PACKAGE_PLAN`. Nyehandel id 57 heter "THC-A 45%". Implementationen demonstreras på Magic Sauce 99 % 2 ml (id 91, plan 3/5/kollektion). | Dynamiskt innehåll + **väntar på paketmigrering** |
| 2 | Mätare, "49 kr Fri" och fraktbesparing syns inte i standardläget | Medvetet produktbeslut (sanningsregeln), se ovan |
| 3 | Inget pre-roll-tillägg i standardfallet | Dynamiskt innehåll (slutsålt) |
| 4 | Rubriken för tillägget är "Komplettera ordern", inte facits "Passar bra med" | Medvetet produktbeslut (prompten: neutral copy, inget påstående om kombination) |
| 5 | Fraktens ordinarie belopp i granskningsläget är 79 kr (`rules.shippingFee`); facit visar 49 kr | Dynamiskt innehåll (regelkällan). Kassan tar 49 kr idag. **Beslut:** vilket belopp gäller? |
| 6 | Strainbilder saknas för de flesta varianter (Nyehandel har `image_id` bara på enstaka) | Dynamiskt innehåll. Bildkolumnen döljs för valda strains utan bild. |
| 7 | Mobilens drawer glider in från höger i full höjd (Nyehandels egen rörelse), utan bottenark eller handtag | Plattformshanterad funktion (kontraktet: inga nya glideffekter, inget dragbart handtag utan funktion) |
| 8 | Unit-raden "745 kr / Styck" och "Strain: X" visas för vanliga rader | Plattformshanterad text, behållen för rader utan paket |
| 9 | "Dela varukorg" och "Fortsätt handla" finns kvar som tysta länkar under trygghetsraden | Medvetet: prompten kräver att de behålls |
| 10 | Nyehandels kodfel lyder "Kod är ogiltigt." (grammatiken kommer från plattformen) | Plattformshanterad text |
| 11 | Antalsfältet är inte nåbart med tangentbord (`tabindex=-1` kvar) | Plattformshanterad. Prövat: görs det nåbart uppdaterar Nyehandel vid blur, Vue ritar om och fokus tappas. −/+ är nåbara. |
| 12 | Desktopens drawer har luft ovanför rabattkoden när korgen är kort (summeringen förankras nedtill) | Korrigerbar vid önskemål |

## Väntar på paketmigrering (inte kodfel)

- Riktiga paketsteg, priser och besparing i raden.
- Spara i strainvyn mot riktig paketrad: koden finns (`replaceRow`: POST
  paketvariant med `packageProductVariants`, sedan DELETE av gammal rad och
  `cart/reload`) men körs bara när registret har `verified: true`.
  **Otestad mot Nyehandel** eftersom ingen paketprodukt finns.
- Paketrad som redan ligger i korgen läses via `meta.data.packageProductVariants`.
  Formatet är kontrollerat mot `85-pdp-pilot.js`, men en riktig rad är otestad.
- Faraoh 2 ml (id 57) behöver en plan eller mappning i `PACKAGE_PLAN` om
  facitets produkt ska få paket.

## Verifiering

**Build:** `node build-theme8.js` ger `dist/theme8/hazey-theme8.{css,js,min.js}`, och
JS parsas utan fel. Genererade filer har inte redigerats för hand.

**Tillståndsmatris** (`after.mjs`, 30 tillstånd; alla på 393 och 1440 plus
urval på 320, 430, 1920 och 200 %, totalt 104 körningar):

- **Överflöd och placering:** ingen horisontell scroll. Drawern ligger på
  x = 0 på mobil och vid 200 %. Före låg den på x = −15 vid 200 %.
- **Kassaytans höjd:** den fasta kassaytan tar 28 % av höjden på 393, 24 % på
  430, 25 % på 1440 och 21 % på 1920. Under 720 px höjd (320 × 700 och 200 %)
  är bara kassaknappen fast: 9 % respektive 13 %. Före tog den 50 % respektive
  75 %.
- **Första raden:** synlig ovanför kassan i alla fall utom `z200-pkg3`.
  Paketraden med fyra steg och mätare är högre än 450 px; namn, bild och
  "Ändra" syns men stegrutorna kräver scroll.
- **Varukorgsanrop:** inga i något granskningsläge. Pakettillstånd och
  strainvy gav 0 POST, PUT eller DELETE.
- **Konsolfel:** bara förväntade (simulerade 406/422/500/nätfel). Vid nätfel
  kommer `TypeError` från Nyehandels egen kod, som i auditen.
- **Träffytor:** under 44 px finns bara inline-produktnamn (textlänkar) och
  Nyehandels antalsfält.

**Interaktion** (`after-keyboard.mjs`, 1440 och 393):

- **Öppna:** Enter på "Öppna varukorgen" öppnar och fokus hamnar på "Stäng
  varukorgen". Dialogen har namnet "Varukorg, 2 varor".
- **Tabbordning:** rader (länk, −, +, Ta bort), tillägg, rabattkod, Dela
  varukorg, Till kassan (stopp 13) och Fortsätt handla, sedan runt till början.
- **Scroll-lås och Escape:** scrollY står still (600 → 600 → 600). Escape
  stänger och fokus går tillbaka till "Öppna varukorgen". Stängd drawer är
  `hidden`.
- **Rerender:** efter +, +, − och tre gånger stäng/öppna finns exakt ett av
  varje injicerat element. Etiketten följer totalen (1 110, 1 855,
  2 264,75 och 1 855 kr).
- **Ta bort med tangentbord:** fokus flyttas till nästa rads produktlänk.
  Live-regionen säger "Varukorgen uppdaterad: 1 vara".
- **Strainvy:**
  - **Fokus och tangentbord:** stegknappen får `aria-pressed`, och "Ändra"
    flyttar fokus till rubriken. Platsknapparna läses som "Plats n av 3: …".
  - **Slutsålda:** slutsålda strains har `aria-disabled`, och klick på dem
    ignoreras.
  - **Escape:** första tryckningen stänger listan, andra går tillbaka till
    "Ändra".
  - **Spara:** ofullständigt paket ("Välj 3 strains till") kan inte sparas, och
    Slumpa ger 5 av 5. Kassan är spärrad medan vyn är öppen.
  - **Anrop:** inga varukorgsanrop.
- **Väntan:** långsam PUT ger "Uppdaterar…" och `aria-disabled`, och klick på
  kassan navigerar inte. Efteråt blir etiketten "Till kassan · 1 490 kr".
- **Lagergräns (äkta 406):** raden visar `role=status`. Nästa + skickar inget
  anrop. Efter − släpps spärren och meddelandet försvinner.
- **Reduced motion:** radmarkeringen har ingen övergång.
- **Riktig PDP-köpväg:** drawern öppnas, fokus hamnar på Stäng och etiketten
  är "Till kassan · 745 kr".

**Kassa** (`after-checkout.mjs`): Nyehandels egen navigering till
`/sv/checkout` fungerar på båda bredderna. Ingen order lades.

**Regressioner:**

- **PDP-köp** (`regress-pdp/buy.mjs`, kopia av TASK 10B:s test): 5/5 klara
  (antal 2, strainbyte, mobilens sticky köpzon, Faraoh, färgvariant).
  POST 200 och rätt rad i drawern.
- **Funktionell regression** (`regress-functional/functional.mjs`):
  - **Klara:** header-nav, mobilmeny, mobilsök, desktopsök, snabbköp från
    startsidan, varukorg till kassa, Faraoh-variantköp, Magic Sauce-hubben,
    Buds-flikar och Hasch-flikar.
  - **`allavapes-filter-history-sort` och `hasch-family-tabs`:** timeout vid
    goBack när de körde parallellt med bildmatrisen. Körda ensamma passerar
    båda.
  - **`allavapes-mobile-sort` och `pdp-core-buy`:** fallerar likadant på
    oförändrad bas (HEAD-build), alltså inaktuella selektorer i testet och
    ingen regression.
- **Header och produktkort:** ingen kod ändrad. De ingår i den funktionella
  regressionen ovan.

## Rester och notiser

- Kopior av regressionsskripten ligger i Task 15-mappen; andra uppgifters `runs/` är orörda.
- Kör om skripten: `node_modules` behöver finnas i worktreen (en tillfällig
  symlänk till huvudrepots `node_modules` användes och är borttagen).

---

# Runda 2 (2026-10-30): värme, PostNord, lagerfeedback

Begränsad visuell korrigering. Funktion, struktur, datakoppling,
paketarkitektur, strainflöde, rabattkod, summeringens matematik, fokus och
sanningsregler är oförändrade.

## Ändrade filer

| Fil | Ändring |
|---|---|
| `theme8/css/84-cart.css` | Glöd och brus på drawern, samma nedre glöd i de fasta fötterna (kassa och strainvy). Ljusare krämbas. Mörkare besparings- och kodfärg för kontrast. Ny trygghetsrad (lastbil, Swish som rad, två rader vid ≤ 340 px). `.is-deferred` för lagerraden. Tog bort Nyehandels kantlinje på `.section.items`, som syntes mot glöden, och den platta haloen runt kassaknappen i lågt läge. |
| `theme8/js/84-cart.js` | Ny trygghetsmarkup och lagerdedupe (se nedan). Lagergränsen sätts nu efter `cart/reload` (bugfix: den sattes från Vuex optimistiska antal och släpptes direkt vid simulerad 422). |
| `theme8/assets/minicart-2026-10/postnord-short-official.svg` | Borttagen (oanvänd) |

## PostNord

Ingen godkänd PostNord-bil- eller leveransbilsasset finns. Sökt har jag i:
- alla Hazey-worktrees och `assets/`;
- Task 15-referenserna;
- de äldre prototyperna och den äldre React-demon;
- hazey.se.

WooCommerce-kassan på hazey.se skriver PostNord som blå text. Därför används
Theme 8:s befintliga outline-lastbil ur den gemensamma ikonuppsättningen,
`HZ8.icon("truck")` i `theme8/js/02-shared.js` (PDP:ns fraktrad använder en
motsvarande outline-lastbil), bredvid texten **PostNord** / Skickas från Sverige.
PostNords logotyp är inte ritad eller återskapad.

## Glöden

Allt bygger på Theme 8-tokens via `color-mix()`:
- **Solljus:** `--hz8-cart-sun` = 62 % `--hz8-beige` + 38 % `--hz8-cta`.
- **Krämbas:** `--hz8-cart-bg` = 16 % beige i en ljus neutral.

Lagren ligger på `#cartAside`, i ordning:
1. Brus: en 180 px inline-SVG med `feTurbulence`, 5,5 % opacitet. Ingen
   bildfil; den bryter banding.
2. Övre hörn: en radial-gradient uppe till höger (sol, 44 %) och en uppe till
   vänster (beige, 58 %).
3. Nedre hörn: en radial-gradient nere till höger (sol, 46 %) och en nere till
   vänster (beige, 62 %).
4. Kanter: en 16 px beigekant vänster och höger, som slutar innan textens
   padding.
5. Krämbasen.

Lagren är förankrade i drawerns ruta och scrollar inte med innehållet. De
fasta fötterna målar exakt samma nedre lager, så det blir ingen skarv. Ingen
animation.

**Kontrast** (beräknad, sRGB):

| Text | Krämbas | Starkaste glöd (hörn) |
|---|---|---|
| Ink | 14,2:1 | 10,7:1 |
| Muted | 6,6:1 | 4,95:1 |
| Besparing | 5,3:1 | 4,6:1 vid 25 % glöd |
| Kodrabatt (grön) | 5,7:1 | 4,9:1 vid 25 % glöd |
| Vitt på oliv-CTA | 11,5:1 | – |

Besparing och kodrabatt ligger aldrig i hörnens toppglöd.

## Dubbel lagerfeedback

Nyehandel visar vid 406 en egen toast (`.toaster-container.is-warning`,
ca 5–7 s, `position:fixed`, saknar `role`/`aria-live`). Den döljs inte och
ändras inte.

- **Medan toasten syns** (och 0,9 s innan den hunnit visas) ligger Theme 8:s
  radmeddelande kvar som `role=status`, men bara i tillgänglighetsträdet
  (`.is-deferred`). Kunden ser ett meddelande, och skärmläsare får ändå
  besked.
- **När toasten försvinner**, eller om den aldrig kommer (simulerad 422),
  blir radmeddelandet synligt. Kontrollen pollar var 400 ms, bara medan ett
  meddelande väntar.
- **Spärr och återställning:** + är spärrad och `cart/reload` återställer
  sparad data som förut.

Verifierat i `runs/stock-dedupe.json` och `after/*-stock-*.png`.

## Kvar / plattformsstyrt

- Nyehandels toast ligger nederst i fönstret och kan täcka trygghetsraden
  medan den syns (plattformens placering).
- `z200-pkg3`: paketradens stegrutor kräver scroll vid 450 px höjd (som i
  runda 1).
- Facitets pre-roll-tillägg, Faraoh-paketpriser och "49 kr Fri" visas
  fortfarande inte. Det är sanningsregler och data, se runda 1.
