# Rättslägeshubben "Cannabinoider i Sverige": granskningsrapport

16 november 2026. Gren `feat/theme8-rattslage-hub`, från `dev` `904844e`. **Inte mergad.** Ingenting är ändrat i Nyehandel-admin, omdirigeringar eller aktivt tema.

## Vad som är byggt

- **`theme8/blocks/rattslage.html`**: en hel sida till footern i fältatlasfamiljen (samma papper, typografi och kapitel som THCB, THCH och HHC). Sidan består av:
  1. **Hero:** H1 "Cannabinoider i Sverige" och kontrolldatum. Stämningsbild med hav i kvällsljus.
  2. **01 Ämnesindex:** en riktig `<table>` med 20 ämnen, status i ord, datum, SFS- eller myndighetskälla och länk till THCA-, THCB-, THCH- och HHC-guiden. Till höger står "Källor och metod".
  3. **02 Så kontrollerar vi**, med "Vad statusen betyder".
  4. **03 Klassningarna sedan 2023**, med tidslinje.
  5. **04 Ämnen, blandningar och handelsnamn.**
  6. **05 Öppna frågor.**
  7. **06 Källor**, tio stycken.
  8. **FAQ** med sex frågor och länkar till ämnesguiderna.
- **`88f-landing-hub.css`** och **`88f-landing-hub.js`**:
  - Sök (tillägg): sökfält ovanför tabellen, antal träffar via `aria-live`, Escape tömmer fältet, och "inga träffar" länkar till metoden.
  - Öppningsbara rader på mobil (tillägg): knapp med `aria-expanded` per rad.
  - Utan JS står hela tabellen i HTML. På mobil staplas raderna även utan JS (fallback-CSS).
- **`theme8/assets/knowledge-hub/`**: utsnitt ur befintlig tema-bild (README).

**Från skissen** togs komposition, ljus, sökfält, tabell på desktop, öppningsbara rader på mobil och spalten "Källor och metod". **Inte** med kom skissens navigation (Guider/Rättslägeshubb/Artiklar/Om Hazey), "Kontroll pågår", "Senast granskad: —", "Granskad"-kolumnen och "Om uppdateringar". Den riktiga Theme 8-headern och -footern används.

## Faktakontroll

Se `KALLKONTROLL.md`. Varje rad är kontrollerad för sig mot ändringsförfattningens PDF och den konsoliderade texten.

**Gamla tabellens 15 rader:**
- 4 stämmer: THCA, THCP, HHC och THCB:s utredning.
- 7 motsägs eller rättas:
  - THCH har fel datum (jan 2024 i stället för 10 dec 2024).
  - THCJD och 10-OH-HHC är klassade, inte "ej klassade".
  - THCPO är hälsofarlig vara, inte narkotika.
  - THCV, CBN/CBG och THCNM står inte på FHM:s lista över utredningar.
  - CBD:s generella "laglig".
  - Hälsofarlig vara "inte att inneha" (lagen säger "innehas").
- 3 handelsnamn avstås: Magic Sauce, Nano 11 och Nano 9/10.

**Ingen granskare och ingen uppdateringstakt** anges, och inget ämne kallas lagligt. THCNM är en öppen fråga.

## Tester (`verify.mjs` → `verify.json`, lokal build i preview-instansen via fixtur)

| Körning | H1 | H2 | Sidledsscroll | Fel | Rader synliga | Lägsta kontrast | Ankare | FAQ med tangentbord | Footer |
|---|---|---|---|---|---|---|---|---|---|
| 393 × 852 | 1 | 7 | 0 | 0 | 20/20 (hopfällda) | 4,63 | #metod | ja | ja |
| 1440 × 900 | 1 | 7 | 0 | 0 | 20/20 | 4,53 | #amnesindex | ja | ja |
| 768, 320, 1920 | 1 | 7 | 0 | 0 | 20/20 | ≥ 4,56 | ja | ja | ja |
| 393 utan bild, 393 reducerad rörelse | 1 | 7 | 0 | 0 | 20/20 | 4,63 | ja | ja | ja |
| 393 och 1440 utan JS | 1 | 7 | 0 | bara väntat laddmeddelande | 20/20, alla 24 länkar synliga | – | – | – | ja |

**Sök** (alla JS-körningar):

| Sökord | Resultat |
|---|---|
| "hhc" | 7 ämnen |
| "THC-H" | THCH |
| "cbd" | H4-CBD och CBD (en tidigare bugg gav THCB; rättad) |
| "xyz" | 0 träffar, "inga träffar"-raden visas |
| Escape | fältet töms, alla 20 rader visas |

**Öppningsbar rad** på mobil: Enter på knappen ger `aria-expanded="true"` och visar raden med 2 länkar. Tab går vidare till SFS-länken. Knappen heter "Visa datum och källa för THCA".

**Länkar:** 33 unika. 28 svarar 200 och 5 är ankare som finns. Guiderna `/sv/page/thca`, `thcb`, `thch` och `hhc` finns i Nyehandel.

**Initial HTML:** 1 H1, 7 H2, 20 rader, 51 länkar och 6 FAQ. Sökfältet finns inte i HTML; det läggs till av JS.

## Skärmbilder (`shots/`)

| Fil | Innehåll |
|---|---|
| `jamfor-1440-fold.webp`, `jamfor-393-fold.webp` | Skiss, gamla sidan och ny sida, första vyn |
| `jamfor-1440-helsida.webp`, `jamfor-393-helsida.webp` | Gamla och nya sidan till footern. 393-bladet visar också en öppnad rad. |
| `hub-{393,1440,768,320,1920}-{fold,full}.webp`, `hub-393-rad-oppen.webp`, `hub-*-nojs-*` | Enskilda körningar |
| `gamla-{393,1440}-{fold,full}.webp` | Gamla WooCommerce-sidan (bara läst) |

Helsidan vid 393 är cirka 10 600 px hög. Bilden är ihopsatt av delar i 1× upplösning, eftersom Chrome annars upprepar innehåll över 16 384 enhetspixlar.

## Kvar

1. **Visuellt:**
   - Vid 393 hamnar första tabellraden vid vikningen. Skissens telefon visar fyra rader, men den har ingen riktig header och kortare text.
   - Sidan är lång på mobil, eftersom alla 20 ämnen, metoden och tio källor står i HTML.
   - Skuggan längs mobilens högerkant är global.
2. **Innehåll:** beslut R1–R10 i `BESLUT.md`. De viktigaste:
   - R1: faktagranskning.
   - R3: slug.
   - R5: länkar tillbaka från guiderna.
   - R8: den gamla THCNM-artikeln.
3. **Publicering:** merge till `dev`, Pages-bygge och skapande via `nh-pages.mjs`. Görs först efter godkännande.

## Mobilkorrigering (16 november 2026, före merge)

**Uppdraget:** vid 393 × 852 ska sökfältet och minst två ämnesrader synas i första vyn. Desktop är godkänd och ska inte ändras.

**Ändrat, bara CSS vid ≤ 767 px** (`88f-landing-hub.css`):
1. **Kustbilden ligger bakom rubriken** i stället för som eget band under den, som i skissens telefon. Papperet tonar ned över bildens överdel, så rubriken står på ljus botten, och havet syns nedtill. Bandets höjd (cirka 170 px) sparas. Bilden börjar under brödsmulan.
2. **Ingressen** ("Vilka cannabinoider är narkotika eller hälsofarliga varor …") visas efter tabellen på mobil. Den står kvar på samma plats i HTML och på desktop; bara den visuella ordningen ändras (flex-`order`). Ingressen är ren text, så tabbordningen påverkas inte.
3. Tätare radavstånd i tabellen på mobil (11 px i stället för 13 px).

**Oförändrat:**
- Blockets HTML är byte för byte identisk med `7913ef1`.
- Alla 20 rader, statusar, datum, källor, länkar och FAQ-svar är kvar.
- JS är oförändrad.

| Vy | Före | Efter |
|---|---|---|
| 393 × 852 | Sökfältet slutar vid 1063 px. Första raden börjar vid 1082 px, alltså under vikningen. | Sökfältet slutar vid 592 px. THCA och THCB syns hela (2 rader). |
| 430 × 932 | – | Sökfältet och 2 hela rader syns, och tredje raden börjar |
| 320 × 700 | – | Sökfältet syns (slutar vid 592 px). Första raden börjar vid 609 px men slutar vid 724 px, alltså under vikningen. |
| 320 × 568 | – | Sökfältet syns, raderna under vikningen |
| 1440 × 900 och 1920 × 1080 | – | **Pixelidentiska** med före (0 % ändrade pixlar vid samma WebP-kodning, `pixeldiff.mjs`) |

**Kontroller efter korrigeringen** (`verify.json`, alla 11 körningar):
- Ingen sidledsscroll i någon körning och inga konsolfel utom laddmeddelandet utan JS.
- Lägsta kontrast 4,53 (desktop, oförändrad) och 4,64 på mobil. Kontrollraden ovanpå bilden har minst 7,59.
- Sök ("hhc" ger 7 träffar), Escape, öppningsbar rad med Enter, ankare och FAQ med tangentbordet fungerar i alla JS-körningar.

**SEO-regression** (`seo-regression.mjs` → `seo-regression.json`, mot `KARTLAGGNING.md`):
- Samma H1 "Cannabinoider i Sverige". Titel- och metaförslaget står kvar i kartläggningen.
- Synliga svar på `laglig cannabis`, `lagliga droger 2026`, `cannabinoider sverige` och `lagliga cannabinoider` finns kvar.
- 20 rader och 51 länkar, samma som före. Guidelänkar: THCA 3, THCB, THCH och HHC 2 vardera.
- Textlängden är 9 772 tecken, samma som före.

**Bilder** (`shots/`):

| Fil | Innehåll |
|---|---|
| `korr-393-fold.webp` | Före, efter, efter med öppnad rad, 430 och 320 |
| `korr-1920-fold.webp` | Före och efter, pixelidentiska |
| `korr-393-helsida.webp` | Före och efter, hela sidan |
| `fore-mobil/` | Före-bilderna (`7913ef1`) |

**Fel i testbilderna (inte i sidan):** Före-helsidan vid 393 visar headern mitt på sidan. Det var testskriptet, som tog helsidesbilden medan en mjuk rullning tillbaka till toppen pågick. `verify.mjs` rullar nu direkt till toppen och döljer fasta element i bildens senare delar.
