# TASK 02: Header — Cannabinoider och sök (2026-11-12)

Worktree `../hazey-storefront-header`, gren `feat/theme8-header-cannabinoider` (ren headergren från origin/dev 2d5e9d3, utan kassans CSS; samma ändringar som 5367b1e + af9c825 på `feat/theme8-checkout-header`).
Uppgift: `storefront-task-system/needs-prep/task-02-header-cannabinoider-search/TASK.md`
och briefen `launch-task-queue-2026-10/01c-header-cannabinoids-search/BRIEF.md`
(båda finns bara som ospårade filer i huvudworktreen, inte i origin/dev).
Den saknade förberedelsen är gjord här (nedan) och därefter byggd.
Inget i admin, inget publicerat. Task 25:s produktkort är inte rört.

## 1. Verifierad destinationskarta (`routes.mjs` → `evidence/routes.json`)

Läst live i Theme 8-previewn 2026-11-12. Alla valda = HTTP 200 med produkter.

| Menyrad | Route | Produkter | Not |
|---|---|---|---|
| **Cannabinoider** | | | |
| THCaB | `/sv/categories/thca-b` (H1 THCA-B) | 2 | Kvar synligt (inget beslut att dölja) |
| THCbA | `/sv/categories/thcba` | 1 | |
| **Serier och blandningar** (2026-11-12, tillägg) | | | Inte enskilda cannabinoider |
| Magic Sauce | `/sv/categories/magic-sauce` (H1 Magic Sauce) | 22 | Seriens hubb, samma som 06-catalog-map |
| D10 | `/sv/categories/d10-1` | 9 | Magic Farmers formula, aldrig 10-OH-THC |
| Nano-11 | `/sv/categories/nano-11` | 17 | |
| **CBD-familjen** | | | |
| CBD | `/sv/categories/cbd` | 21 | |
| H4CBD | `/sv/categories/h4cbd` | 5 | |
| CBN | `/sv/categories/cbn` | 8 | |
| **CBD efter format** | ur befintlig CBD-meny, bara länkar med mål | | |
| Buds/Blommor · Hasch · Vapes | `cbd-buds-1` · `h4cbd-hasch` · `cbd-vapes` | 12 · 1 · 6 | |
| CTA Alla produkter | `/sv/categories/alla-produkter` | 104 | Ingen samlad cannabinoidsida finns |

Inte med: CBG (404), `cannabinoider` (404), THCV (pausad, `legacy` i
06-catalog-map trots 4 produkter), HHCPM/THCNM (tomma), Magic Sauce/Core
(serier/varumärken), gamla `thca`/`thcb`/`10-oh-thc` (tomma/legacy).
"Kommer snart"-rader visas inte i headern.

## 2. Vad som byggts

- **`05-header.js`**: toppnivån visar "Cannabinoider" (desktop + mobilmeny)
  som en `<button>` som öppnar panelen (ingen sida motsvarar etiketten).
  Panelen kommer ur `HEADER_PANELS.cbd` — **utanför** `DROPDOWN_CONTENT`, så
  kategorisidornas rälsar och relationskartans cannabinoidvokabulär är
  orörda. `HZ8.navCategories` har kvar etiketten "CBD" för övriga
  konsumenter (tom minicart, sökgenvägar); dess `href` går nu till
  `/cbd` (21 produkter) i stället för `/h4cbd` (5).
- **`05a-mobile-nav.js`**: en gemensam sökmotor (`searchEngine`) för mobil
  dialog och ny **desktop-popover** (≥1180 px): samma API
  (`/frontend-api/{locale}/search/product`), samma markup och tillstånd
  (start, laddar, träffar, inga träffar, nätverksfel). Startläget visar
  riktiga genvägar: huvudkategorier + cannabinoiderna. Nyehandels egna
  förslagsanrop (keyup) stoppas på desktop → ett anrop per sökning.
- **`05-header.css`**: knapptrigger, bred panel (3 kolumner + produktkort,
  förankrad mot navets högerkant), popoverns yta, Nyehandels breda
  `.store-search__dropdown` dold ≥1180 px, sökfältets input låst till
  pillens bredd (var 57 px bredare och ritade fokusringen över
  kontoikonen) och fokusringen runt pillen.

## 3. Interaktionskontrakt (testat)

**Cannabinoider (desktop):** hover öppnar (120 ms), klick efter hover håller
öppet, Enter/Mellanslag växlar, Pil ned från triggern → första länken
(THCaB), Escape stänger och lämnar fokus på triggern, klick utanför
stänger, `aria-expanded` följer. **Mobil/kompakt (<1180):** drawerns
accordion "Cannabinoider" med samma innehåll; drawerns fokusfälla,
Escape och scroll-lås oförändrade.

**Desktop-sök:** fokus i fältet öppnar popovern (`aria-expanded`,
`aria-controls`), skrivning debounce 250 ms, Pil ned → första förslaget,
Pil upp/ned mellan förslag (upp från första → fältet), Escape stänger och
behåller fokus i fältet (öppnar inte igen), Tab ut eller klick utanför
stänger, Enter → `/sv/search?query=` (preview behålls), skärmläsarstatus
"N träffar"/"Inga träffar"/"Söker"/"Förslagen kunde inte laddas".
Headern döljs inte medan popovern är öppen. "Visa alla 50 träffar" =
resultatsidans "50 produkter" (kontrollerat för "magic").

## 4. Passform 1180–1920 (`runs/header.json`)

| Bredd | Nav (x) | Sök (x) | Glapp nav→sök | Sök vertikalt mot bubblan |
|---|---|---|---|---|
| 1180 | 158–751 | 783–1021 | 32 | 0 px |
| 1280 | 166–804 | 836–1121 | 32 | 0 |
| 1328 | 170–829 | 873–1169 | 44 | 0 |
| 1440 | 226–885 | 929–1225 | 44 | 0 |
| 1512 | 262–921 | 965–1261 | 44 | 0 |
| 1920 | 466–1125 | 1169–1465 | 44 | 0 |

Hela ordet "Cannabinoider" ryms vid alla bredder (inte klippt, ingen
förkortning), inga överlapp, inget sidledsöverflöd. Panelen (720 px)
ligger inom fönstret vid 1180 (x 55–775) och 1440 (189–909).

## 5. Test

`node theme8/review/header-cannabinoids-search-2026-11/header.mjs` → ALL PASS
(1180/1280/1328/1440/1512/1920 + 393 + 768). Skärmbilder i `shots/`
(checkas inte in): `d1440-closed`, `d1180-closed`, `d1920-closed`,
`d1440-cannabinoider`, `d1180-cannabinoider`, `d1440-search-empty`,
`d1440-search-results`, `d1440-search-none`, `d1440-search-error`,
`m393-drawer-cannabinoider`, `m393-search-empty|results|error`, samma för 768.
Före-läget: `evidence/native-1440-typed.png`.

Testsida är startsidan: kategorisidan laddar om sig själv en gång direkt
efter start (befintligt beteende i 80-category), vilket avbröt testet.

## 6. Öppna punkter för Vilmer

1. **D10 och Nano-11 under "Cannabinoider"** — båda säljs med
   cannabinoidhalt i namnet ("D10 60 %", "7 % Nano11"), men D10 beskrivs i
   koden som Magic Farmers formula. Behåll eller flytta?
2. **CBD-länken i tom minicart/sökgenvägar** pekar nu på `/cbd` (21) i
   stället för `/h4cbd` (5).
3. CLAUDE.md vill ha 2–3 visuella riktningar före en redesign. Här byggdes
   direkt på uppdrag, inom headerns befintliga glas-/panelspråk; ingen ny
   visuell riktning är införd.
4. THCV (4 produkter) är utelämnad enligt beslutet att den är pausad.

## 7. Tillägg 2026-11-12: Magic Sauce under "Serier och blandningar"

På begäran: panelen har nu fyra grupper i två kolumner (desktop) och i
samma ordning i mobilmenyn: Cannabinoider (THCaB, THCbA) · Serier och
blandningar (Magic Sauce, D10, Nano-11) · CBD-familjen · CBD efter format.
Sökytornas genvägar visar samma grupprubriker, så Magic Sauce står aldrig
under "Cannabinoider". Punkt 6.1 ovan (D10/Nano-11) är därmed löst.

Kontroll (`WIDTHS=393,1180,1440 node …/header.mjs` → ALL PASS):
- **Höjd:** desktoppanelen 356 px (nederkant 439 px av 900), ingen intern
  scroll, inom fönstret vid 1180 (x 55–775) och 1440 (189–909). Mobilens
  öppna accordion 795 px i den scrollbara menyn; alla länkar ≥ 44 px höga.
- **Fokus:** Tab genom hela panelen: THCaB → THCbA → Magic Sauce → D10 →
  Nano-11 → CBD → H4CBD → CBN → Buds/Blommor → Hasch → Vapes → Alla
  produkter → produktkortet, alla synliga i panelen; panelen stänger när
  fokus lämnar den. Pil ned från triggern → THCaB, Escape → triggern.
  Mobil: Tab från accordionknappen når Magic Sauce, synligt.
- **Länkar:** alla panelens länkar HTTP 200; Magic Sauce 22 produkter.
