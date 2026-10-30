# TASK 15 — bygg den godkända minicarten

Implementera Task 15 lokalt i Theme 8 enligt det godkända v4-facitet. Stanna
för mänsklig visuell granskning innan commit eller push.

## Läs först

1. `CLAUDE.md`, `STATUS.md` (sök `minicart`) och eventuella `AGENTS.md`.
2. Hazey commerce design-skillen i läge **Refine**, inklusive
   `component-language.md`, `commerce-cro.md`, `visual-quality.md` och
   `decisions.md`.
3. Hela `theme8/review/minicart-task15-2026-10/`, särskilt
   `CURRENT-STATE-AUDIT.md`, `STATE-MATRIX.md`, `NATIVE-OWNERSHIP.md`,
   `ACCESSIBILITY-AND-ERRORS.md` och `INTERACTION-CONTRACT.md`.
4. Den enda visuella auktoriteten:
   - `concepts-codex/concept-a-v4-calm-cart.png`
   - `concepts-codex/concept-a-v4-strain-editor.png`
   - de fokuserade WebP-utsnitten i `concepts-codex/webp/`
   - tillgångarna i `concepts-codex/assets/`

`directions/` och den äldre jämförelsen i `RECOMMENDATION.md` är historiskt
auditmaterial, inte implementationsfacit.

## Scope

- Primärt: `theme8/js/84-cart.js` och `theme8/css/84-cart.css`.
- Ändra bara en delad commercefil om en verifierad integration kräver det och
  dokumentera varför.
- Återanvänd testverktygen i Task 15-mappen.
- Frysta: header, mobilnav, PDP, produktkort, footer, checkout, admin,
  produktdata, produktionsloader och andra teman.

Ingen adminändring, paketprodukt, rabattregel eller produktdata får skapas i
denna task. Inget får publiceras.

## Plattformsägande

- Vuex `cart` är enda sanningen. Använd Nyehandels befintliga varukorgsrader,
  antalskontroller, köpknapp, fortsätt-handla och dela-varukorg.
- Klona inte native kontroller och skapa inte en parallell cart-state.
- Alla injicerade delar ska vara idempotenta, återställas efter Vue-rerender och
  härledas från verklig data.
- Produktbilder, namn, variant, antal, pris, lager, frakt, rabatt och total får
  aldrig bakas in från mockupen.
- Paketsteg får bli köpbara först när motsvarande riktiga paketprodukt är
  migrerad, verifierad i varukorg och verifierad i kassa. Fram till dess ska
  strukturen vara sanningsenligt spärrad eller helt döljas; den får aldrig
  simulera ett billigare paket genom att bara ändra antal.

## Bygg huvudvyn 1:1 mot v4

### 1. Drawer och hierarki

- En lugn öppen sandfärgad yta med tunna avdelare, inte kort-i-kort.
- Desktop följer den fokuserade desktop-referensen; mobil använder hela den
  synliga bredden utan horisontell scroll eller negativt x-läge.
- Rubrik, antal varor och stängning ska vara tydliga och semantiska.

### 2. En enda målindikator överst

- Återskapa v4:s sammanhållna mätare för två verkliga mål: fri frakt och
  bonusen vid 2 700 kr.
- Belopp, nått/återstår och progress härleds ur den verkliga korgen och den
  befintliga commercekonfigurationen. Hårdkoda inte referensens totalsumma.
- Om ett mål inte är aktivt eller verifierat ska den delen döljas utan tom yta.
- Visa inte ”Fri frakt” en andra gång längre ned när mätaren redan bekräftar det.

### 3. Produktrader och paket

- Behåll native rad, länk, bild, antalskontroll och ta-bort-funktion.
- Visa namn, variant/strain, styckpris och radsumma med referensens täthet.
- För en produkt med verifierade paket visas den kompakta väljaren inne i
  raden. Facitet visar 1/3/5, men kontrollen ska återge produktens verkliga
  paketsteg, även exempelvis 10 eller 15. Visa riktiga fasta
  WooCommerce/migrerade paketpriser och verklig besparing; använd aldrig en
  generell procentsats.
- Visa vald strainfördelning kompakt och en tydlig `Ändra`-handling.
- Vanliga produkter utan paketerbjudande behåller native antal utan en påhittad
  pakettrappa.

### 4. Strainredigeraren

- `Ändra` växlar drawern till en fokuserad barnvy i samma yta. Ingen ny modal,
  overlay eller drawer ovanpå drawern.
- Varje numrerad paketplats är klickbar och öppnar listan med verkliga strains.
  Ingen separat ”Visa alla strains”-kontroll.
- Vald strain markeras; slutsålda strains visas men är inaktiva; fokus och
  tangentbord fungerar.
- `Spara paket` är spärrad tills alla platser är valda. Spara återgår till
  huvudvyn och bevarar scroll/fokus på ett begripligt sätt.
- Om paketprodukten ännu saknas ska reviewläget kunna visa utformningen utan att
  något varukorgsanrop sker.

### 5. Ett kontextuellt tillägg

- Visa högst ett kompakt tillägg i huvudvyn.
- Standard: relevant pre-roll. Om korgen innehåller cart: batteri. Om korgen
  innehåller batteri: relevant cart.
- Produkten ska vara verklig, publicerad, i lager och inte redan finnas i
  korgen. Dölj hela modulen när ingen sann kandidat finns.
- Använd neutral copy som `Komplettera ordern`; påstå inte faktisk
  sambeställningsdata utan underlag.

### 6. Rabattkod och summering

- Rabattkod ska kunna fällas ut och appliceras i minicarten via plattformens
  verkliga rabattflöde. Visa väntan, fel och applicerad kod.
- Summeringen visar endast: Varor, Frakt, Du sparar totalt och Total.
- Fraktraden visar verkligt utfall: ordinarie frakt överstruken + `Fri` när det
  är sant, annars verklig/beräknad frakt. Dubblera inte fraktstatus i en extra
  bekräftelserad.
- `Du sparar totalt` ska samla verkliga paket-, kampanj-, kupong- och
  fraktbesparingar en gång vardera. Ingen dubbelräkning.
- Kassaknappen följer facitets mörka olivfyllning och använder native
  checkoutflöde. Orange reserveras för sann besparing och får inte konkurrera
  med huvudhandlingen.

### 7. Trust

- Använd de officiella SVG-filerna i `concepts-codex/assets/`:
  PostNord för `Skickas från Sverige`, Swish för `Trygg betalning` och den
  befintliga diskreta bocken för `Diskret paket`.
- Återskapa inte logotyperna med text, emoji eller genererade symboler.

## Tillstånd och tillgänglighet

- Verifiera tom, en rad, flera rader, lång titel, variant, rea, rabattkod,
  fri-frakt nådd/inte nådd, bonus nådd/inte nådd, tillägg saknas, komplett och
  ofullständigt paket, slutsåld strain, laddning, nätfel, API-fel och lagergräns.
- Behåll Escape, overlay-stängning, scroll-lås och fokusretur.
- Fokusordning, synlig fokusring, live-regioner och träffytor minst 44 × 44.
- Under pågående antal-/paket-/kupongändring får kassan inte använda en gammal
  summa.
- Reduced motion: inga dekorativa övergångar; funktion och fokus består.

## Visuell verifiering

1. Bygg Theme 8 och kontrollera att genererade filer är konsekventa.
2. Rendera före/efter vid 320, 393, 430, 1440, 1920 och 200 % zoom.
3. Gör sida-vid-sida-blad mot v4-PNG/WebP för huvudvyn och strainvyn.
4. Kontrollera hela drawern, inte bara första viewporten.
5. Kör Task 15:s interaktions-, rerender-, fel- och tangentbordstester samt
   repots relevanta regressioner för PDP-köp, produktkort, header och checkout.
6. Rapportera alla avvikelser från facit och alla delar som väntar på
   paketmigrering separat från verkliga kodfel.

## Stopp

Stanna lokalt med källändringar, rapport och granskningsbilder. Inget staging,
ingen commit, ingen push, ingen admin och ingen publicering innan Vilmer har
sett och godkänt före/efter-materialet.
