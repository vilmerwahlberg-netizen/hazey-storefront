# Portningsspecifikation: Mobilheader + Sökfält + Övre mikrotrust

Status: **spec, ingen implementation.** Skapad 2026-09-01 enligt den
uppdaterade portningsprincipen i `CLAUDE.md` ("Portningsprincip"). Rör
`css/21-header-v2.css`/`js/18a-header-v2.js`. **Hero ingår INTE i denna
omgång** — se `tests/parity-sections.mjs` sektion `hero`, orörd.

Alla värden nedan är hämtade LIVE (Playwright `getComputedStyle` +
Chrome DevTools Protocol `CSS.getMatchedStylesForNode`, som visar den
faktiska cascade-vinnande regeln inklusive filradnummer) mot:

- **Facit**: `http://localhost:8765/index.html#/` (den lokala servern som
  redan pekar på `/Users/wahlberg/HZY/chatgpt-claude-handover/CLAUDE-HANDOFF-2026-08-17/prototyp/index.html`), 390×844, dSF 1.
- **Implementation**: `https://hazeyse.nyehandel.se/` med lokalt byggd
  `hazey.css`+`hazey.min.js` injicerad klient-sidan (skrivskyddat, samma
  metod som `preview.mjs`/`tests/parity-sections.mjs`), 390×844, dSF 1.

Inget gissat ur skärmdumpar. Där ett värde nedan skiljer sig från vad
källkoden vid första anblick antyder (flera överlappande `@media`-block
för samma selektor förekommer på facit-sidan) är det alltid det
**CDP-bekräftade vinnande värdet** som anges, med filradnummer.

---

## A. DOM-mappning

| # | Element | Facitselektor | Implementationselektor | Markup portabel? | Riktig nyehandel-funktion som måste bevaras |
|---|---|---|---|---|---|
| 1 | Header-rot | `#mHeader` (`.hz-header`) | `#store-header` (`.nh-header-v2`) | Nej — native element, CSS-endast | `position:fixed`, headroom-slide vid scroll (`js/14-header-scroll.js`), nativ `var(--header-height*)` som andra teman-regler kan referera |
| 2 | Main-rad | `.m-row` | `.main` | Nej — CSS-endast (grid `1fr auto 1fr` redan portad) | native `.left`/`.center`/`.right`-containrar, Vue-bindningar däri |
| 3 | Hamburgare | `#mMenuBtn` (`.m-icon`) | `.nh-burger` | Ja — ikon-`<svg>`-mönstret är identiskt (3 linjer, `stroke-width:2`), kan återanvändas rakt av | `#mobile-nav-menu` (nativ Vue-hamburgare) hålls dold, vår egen mobilmeny-öppna/stäng-JS |
| 4 | Ordmärke | `.m-logo` (textlänk) | `.main .brand a::after` | **Redan korrekt portad** (se §E) | `href="/"`, `<img alt>` kvar i DOM (dold, tillgänglighet) |
| 5 | Kontoikon | `a.m-icon[aria-label="Konto"]` | `.main .right .account-button` | Ja — samma ikonmönster (cirkel+axlar-SVG), CSS redan nästan identisk | riktig `/sv/account`-länk |
| 6 | Varukorgsikon | `#mCartBtn` | `.main .right .cart-button` | Ja — samma ikonmönster | riktig `#cart-button`, Vue `aria-controls="cart-side-wrap"`, `cart/addVariant` (CLAUDE.md) |
| 7 | Varukorgsbadge | `#mCartCount` (`.m-cart-count`) | **Finns inte än** | Ja, som NY komponent — markup+CSS från facit är säker att kopiera rakt av | måste bindas mot riktigt cart-count (samma mönster som `js/00-core-open.js` cart-state), se öppen fråga i §D |
| 8 | Sökrad | `.m-searchbar` | `.nh-mobile-searchbar` | Nej — knappen finns redan, CSS-endast | riktig `#mobile-search-trigger`-klick-genom (redan kopplat) |
| 9 | Sökknapp | `#mSearchBtn` | `.nh-mobile-searchbar button` | Nej — CSS-endast | samma som ovan |
| 10 | Mikrotrust-rad | `.mt-mobile` → `.mt-mobile-inner` | `.nh-mobile-trust` | Delvis — grid/gap/padding för containern är REDAN portad nästan exakt (se §E), item-nivån saknar en `!important` | statiskt innehåll, ingen live-integration |
| 11 | Trust-item 1 (Trustpilot) | `a.mt-item:nth-child(1)` | `a.nh-mt-item:nth-child(1)` | CSS-endast, kräver `!important`-fix (§E) | riktig `trustpilot.com/review/hazey.se`-länk |
| 12 | Trust-item 2–4 | `.mt-item` (`<div>`) | `.nh-mt-item` (`<div>`) | CSS-endast | statisk copy |

---

## B. Geometri

Alla mått `getBoundingClientRect()` vid 390px viewport, dSF 1.

### Header-rot

| Egenskap | Facit (`#mHeader`) | Implementation (`#store-header`) |
|---|---|---|
| Total höjd | **122px** (auto, `.m-row` 69px + `.m-searchbar` 53px, inget mer i headern) | **100px** — men detta är en **CSS-höjdcap**, inte innehållets faktiska höjd (se §E) |
| `position` | `sticky` | `fixed` (redan medvetet val i befintlig kod, se CLAUDE.md) |
| `display` | `block` | `flex; flex-direction:column` |
| Bredd | 390px | 390px |
| `z-index` | 40 | 30 |
| Bakgrund | `rgb(251,241,225)` = `#fbf1e1` (facit `#mVp .hz-header{background:#fbf1e1}`, rad 1960) | `rgb(238,231,225)` = `#eee7e1` — native temafärg, INTE porterad |

### Main-rad / `.m-row`

| Egenskap | Facit | Implementation |
|---|---|---|
| Höjd | 69px | 69px ✅ redan identisk |
| `min-height` | 60px (`#mVp .m-row{min-height:60px}`, rad 2082) | ej satt explicit, resulterar ändå i 69px |
| Padding | `12px` runt om | `4px 0` (native, se §E) |
| Gap | 6px | n/a (grid, ej flex-gap) |
| Grid | n/a (flex) | `110px auto 110px` (dvs `1fr auto 1fr`, redan portad korrekt) |

### Ikonknappar (hamburgare/konto/varukorg)

| Element | Facit mått | Implementation mått | Diff |
|---|---|---|---|
| `#mMenuBtn` (hamburgare) | **44×44px** (`@media max-width:860px { .m-icon{width:44px;height:44px} }`, rad 1681 — tillgänglighetsfix, kommentar: "Meny, konto och varukorg är primära interaktioner och ska vara minst 44×44") | `.nh-burger` **40×40px** (`css/21-header-v2.css` rad 111–115: `width:40px;height:40px`) | **−4px i varje led** — enda ikonknappen som INTE matchar 44×44-regeln |
| Konto (`a.m-icon[aria-label="Konto"]`) | 44×44px | `.account-button` 44×44px | ✅ matchar |
| Varukorg (`#mCartBtn`) | 44×44px | `.cart-button` 44×44px | ✅ matchar |
| Ikon-`<svg>` | 22×22px | konto/varukorg: nativ SVG storlek (`.account-button svg`/`.cart-button svg`, ej explicit satt i css/21 — native default) | ej jämfört, lägre prioritet |

### Varukorgsbadge (facit facit, finns ej i impl än)

| Egenskap | Facit `.m-cart-count` |
|---|---|
| Position | `absolute; top:2px; right:2px` (relativt `.m-icon`, som är `position:relative`) |
| Mått | `min-width:15px; height:15px; padding:0 3px` |
| `border-radius` | 20px (pillform) |
| Bakgrund | `var(--status-campaign)` = `#c96a26` |
| Text | `#fff`, `9px`, `700` |

### Sökrad

| Egenskap | Facit (`.m-searchbar`) | Implementation (`.nh-mobile-searchbar`) |
|---|---|---|
| Total höjd | 53px | 59.59px (**+6.6px**) |
| Padding | `0 12px 11px` | `0 16px 10px` (**4px mer i sidled**) |
| Knapphöjd (`#mSearchBtn` / `button`) | **41px** | **49.59px** (**+8.6px**) |
| Knapp-padding | `11px 16px` | `11px 16px` ✅ identisk |
| `border-radius` | **26px** | **999px** (helt annan avrundning — pill istället för mjukt rundade hörn) |
| `border` | `1px solid #dfc9aa` (facit-övre override, se §E) | `1px solid rgb(235,225,209)` = `#ebe1d1` (bas-token, INTE facits override, se §E) |
| Bakgrund | `rgba(255,252,246,.88)` (halvtransparent varm cream) | `rgb(255,255,255)` (helt opak vit) |
| Ikon-`<svg>` | 16×16px | ospårat, lägre prioritet |
| Gap (ikon→text) | 9px | 10px |

### Övre mikrotrust

| Egenskap | Facit (`.mt-mobile`) | Implementation (`.nh-mobile-trust`) |
|---|---|---|
| Total höjd | **52px** | **103.78px** (**+51.78px, ~2×**) |
| Grid-kolumner | `172px 172px` | `172px 172px` ✅ identisk |
| `gap` | `6px 14px` | `6px 14px` ✅ identisk |
| Padding | `9px 16px` (symmetrisk, inget extra i botten) | `9px 16px 12px` (**+3px padding-bottom** utöver containern, försumbart mot huvudorsaken) |
| Item 1 höjd (Trustpilot, `<a>`) | ~13px | **25.59px** |
| Item 2 höjd (`<div>`) | ~13px | **25.59px** (stretchad av item 1, se §E) |
| Item 3–4 höjd (`<div>`) | ~13px | **51.19px** |
| Item font-size | **9.7px** (vinnande facit-regel, rad 1896–1899) | Item 2–4: `9.7px` ✅. **Item 1 (`<a>`): tvingas till nativt basvärde** (se §E) — inte 9.7px trots samma `.nh-mt-item`-klass |
| Item `line-height` | 1.2 (facit-override) resp. 1.25 (bas) | 1.25 |
| Item textfärg | `#655946` = `rgb(101,89,70)` | `rgb(101,89,70)` ✅ identisk |
| Ikon-`<svg>` (item) | 13×13px (facit slutlig override, rad 1655) | 14×14px |

---

## C. Typografi och styling

| Element | Egenskap | Facit | Implementation | Matchar? |
|---|---|---|---|---|
| `.m-logo` / `::after`-ordmärke | `font-family` | `"Iowan Old Style","Palatino Linotype",Palatino,Georgia,serif` | samma | ✅ |
| | `font-size` | 23px | 23px | ✅ |
| | `font-weight` | 600 | 600 | ✅ |
| | `font-style` | italic | italic | ✅ |
| | `color` | `var(--green)` = `#2c3620` | `var(--nh-green)` = `#2c3620` | ✅ |
| Sökknapp-text | `font-size` | 14px | 14px | ✅ |
| | `color` (placeholder) | `rgb(154,146,128)` = `#9a9280` | `rgb(154,146,128)` | ✅ |
| | `border-radius` | 26px | 999px | ❌ (se B/E) |
| | `background` | `rgba(255,252,246,.88)` | `rgb(255,255,255)` | ❌ (se B/E) |
| | `border-color` | `#dfc9aa` | `#ebe1d1` | ❌ (se B/E) |
| Mikrotrust-item | `font-size` | 9.7px | 9.7px (div) / native-tvingat (`<a>`) | ❌ för `<a>`-varianten (se E) |
| | `color` | `rgb(101,89,70)` | `rgb(101,89,70)` | ✅ |
| | `font-family` | system-sans (arv) | `Nunito, Helvetica, Arial, Lucida, sans-serif` (native) | ⚠️ ej verifierat om avsiktligt — item-textens font ärvs från `body` i båda fallen, olika bas-fontstack per sajt, inte en portningsfråga |
| Header bakgrund | `background` | `#fbf1e1` | `#eee7e1` (native) | ❌ headerns EGEN bakgrund är inte porterad (main-radens gradient är dock redan porterad separat, se CLAUDE.md) |
| Ikonrad box-shadow | `.mt-mobile` | `inset 0 1px 0 rgba(255,255,255,.5)` | inget böjt fram i denna körning, ej highp prioritet | — |

---

## D. Kodportningsplan

**Kan flyttas/efterliknas direkt (markup+CSS, ingen översättning behövs):**
- Hamburgar-, konto- och varukorgs-SVG:erna — identiska ikonmönster
  (linjer/cirklar/koordinater), bara CSS-storlek skiljer.
- `.m-cart-count`-badgen som HELT NY komponent: mått, `border-radius`,
  bakgrund (`var(--status-campaign)`→`#c96a26`), textfärg/storlek kan
  kopieras rakt av till en ny `.nh-cart-count`-regel i `css/21`. Ren CSS,
  ingen prototyp-JS.

**CSS-regler som kan porteras (värden, inte hela regelblocket rakt av —
selektorer måste översättas):**
1. `#mHeader{}` har INGEN egen höjd-regel i facit (auto) — det är
   `#store-header`'s NATIVA `height:var(--header-height-touch)` som
   begränsar. Motsvarande fix: lägg till `height:auto !important;
   min-height:0` på `#store-header.nh-header-v2` (se §E för varför).
2. `.m-searchbar button` (facit rad 1880–1884, "WARM WEST COAST PASS"):
   `background:rgba(255,252,246,.88); border-color:#dfc9aa;
   border-radius:26px; box-shadow:inset 0 1px 0 rgba(255,255,255,.9)` →
   ersätt motsvarande fyra deklarationer i `.nh-mobile-searchbar button`
   (`css/21-header-v2.css` rad ~372–385).
3. `.mt-mobile .mt-item{font-size:9.7px; line-height:1.2}` (facit rad
   1896–1899) — värdena är REDAN portade, men behöver `!important` i
   implementationen specifikt för `<a>`-varianten (se punkt nedan).
4. `.nh-burger{width:44px;height:44px}` (upp från 40px) för att matcha
   facits egen 44×44-tillgänglighetsregel (rad 1681) och de andra två
   ikonknapparna som redan är 44×44.

**Selektorer som måste översättas (inte kopieras rakt av):**
- `#mHeader` → `#store-header.nh-header-v2` (specificitet krävs för att
  vinna över native temaregler, redan etablerat mönster i filen).
- `.m-searchbar button` → `.nh-mobile-searchbar button`.
- `.mt-mobile .mt-item` → `.nh-mobile-trust .nh-mt-item` (redan gjort,
  bara `!important`-nivån saknas).
- `var(--line)`/`var(--green)` etc. → motsvarande `var(--nh-line)`/
  `var(--nh-green)` (redan definierade i `css/21`s egen `:root`-liknande
  block på `#store-header.nh-header-v2`) — **eller** hårdkoda facits
  exakta override-hex (`#dfc9aa`) om den INTE redan finns som en egen
  CSS-variabel (den gör inte det idag — `--nh-line` pekar på bas-tonen
  `#ebe1d1`, inte facits breakpoint-specifika `#dfc9aa`). Ny variabel
  rekommenderas, se öppen fråga nedan.

**Gammal implementation som bör ersättas:**
- `.nh-mobile-searchbar button`s nuvarande `border-radius:999px` +
  opak vit bakgrund + bas-`--nh-line`-border (`css/21` rad 372–385)
  ersätts av punkt 2 ovan.
- `.nh-burger`s `40px`-mått (`css/21` rad ~111–115) ersätts av `44px`.

**Regler som INTE längre behövs efter portningen:**
- Inga regler identifierade som blir överflödiga — allt som ändras är
  värde-justeringar på befintliga, redan nödvändiga selektorer. Inget att
  ta bort.

**Hur Nyehandels riktiga funktionalitet bevaras:**
- Header förblir `position:fixed` med `js/14-header-scroll.js`s
  headroom-slide orörd — endast `height`/bakgrund justeras, ingen
  scroll-logik ändras (matchar CLAUDE.md-regeln: aldrig en ny
  scroll-hanterare).
- `#mobile-nav-menu` (nativ Vue-hamburgare), `#mobile-search-trigger`
  (nativ sök-trigger) och `.topbar` förblir dolda men OBORTTAGNA i DOM:en
  — samma "dölj, radera aldrig nativt"-mönster som redan används
  (bekräftat i befintlig `css/21`, rad 320–324).
- Varukorgsbadgen (ny) måste bindas mot RIKTIG cart-state — se CLAUDE.md
  "Cart-state nås via nyehandels egen Vuex-store" — inte hårdkodas till
  `0`. **Öppen fråga, inte löst av denna spec**: exakt vilken
  DOM-observationspunkt (`js/00-core-open.js`s cart-helpers) som ska
  driva badgens siffra live — nästa implementationsomgång behöver besluta
  det, denna blueprint dokumenterar bara VAR badgen ska sitta visuellt.
- Kontolänken (`/sv/account`) och varukorgsknappens `aria-controls`/Vue-
  bindning rörs inte — endast omkringliggande CSS (redan fallet idag).

---

## E. Grundorsaker (inte bara symptom)

### Header: 122px facit mot 100px implementation

**Grundorsak: en NATIV nyehandel-regel, inte något i `css/21`.**

CDP-bekräftat (`CSS.getMatchedStylesForNode` på `#store-header`):
```
header { height: var(--header-height); width: 100%; }                 [regular, ingen media]
header { height: var(--header-height-touch); }                         [regular, @media screen and (max-width:1023px)]
```
Detta är plattformens EGEN, icke-scopade `header`-tag-regel (native
origin, från nyehandels tema-CSS, kommer FÖRE vår `#store-header.nh-
header-v2`-scopade CSS i cascade-ordning men vinner ändå eftersom den
sätter en FAST höjd som vår kod aldrig explicit motsäger). `#store-
header`s `getBoundingClientRect().height` blir därför alltid exakt vad
temats `--header-height-touch`-variabel säger (100px i denna mätning),
**oavsett hur mycket riktigt innehåll (`.main` + `.nh-mobile-searchbar`
+ `.nh-mobile-trust`, alla riktiga barn till `#store-header`) som
faktiskt ligger däri.** Innehållet renderas ändå synligt (headern har
ingen `overflow:hidden`) — det är alltså inte buggigt för besökaren, bara
missvisande för `getBoundingClientRect()`-baserad mätning (exakt samma
missvisning som redan dokumenterad och kringgången i STATUS.md,
"Allvarlig layoutbugg... `nhSyncMainOffset` mäter `scrollHeight`, inte
`getBoundingClientRect().height`").

Facits `.hz-header` har DÄREMOT ingen höjd-regel alls (`height:auto`,
växer fritt med sitt innehåll — därför exakt `122px = 69+53`).

**Källregel att ändra:** ingen befintlig `css/21`-regel orsakar detta —
regeln som "vinner" är plattformens egen `header{height:var(...)}`. Fixen
är att LÄGGA TILL en ny, mer specifik regel i `css/21-header-v2.css`:
`#store-header.nh-header-v2 { height: auto !important; min-height: 0; }`
— samma `!important`-mönster som redan används överallt annars i filen
för att slå ut nativa temaregler (dokumenterat i STATUS.md: "ALLA nya
textfärger på element inuti `#store-header` behöver troligen samma
`!important`-behandling", nu bekräftat gälla `height` också).
**Riskflagga:** `var(--header-height)`/`--header-height-touch` kan
användas av ANDRA temaregler (t.ex. `scroll-padding-top`, andra sidors
sticky-offsets) — en `height:auto`-override på just detta element bör
vara säker (påverkar bara detta elements egen box), men bör verifieras
mot en icke-startsida (kategori/produkt) innan release, eftersom
`#store-header` är delad DOM över hela sajten.

### Sökfält: 17,6 % pixelavvikelse

**Grundorsak: fel CSS-token portad — bas-värden användes istället för
facits egna breakpoint-specifika override-värden.**

Facits sökknapp får sitt UTSEENDE inte från sin bas-regel (`.m-searchbar
button` rad 365–369, som bara sätter layout/padding/font) utan från en
SEPARAT, senare "WARM WEST COAST PASS"-regel (rad 1880–1884, inuti
`@media (max-width:860px)`):
```css
#mVp .m-searchbar button{
  background:rgba(255,252,246,.88);
  border-color:#dfc9aa;
  box-shadow:inset 0 1px 0 rgba(255,255,255,.9);
}
```
`border-radius:26px` kommer separat från basregeln (rad 367), som ALDRIG
skrivs över — dvs facit blandar bas-radie (26px) med override-färger
(`#dfc9aa`/`rgba(255,252,246,.88)`).

Implementationens `.nh-mobile-searchbar button` (`css/21` rad 372–385)
portade LAYOUTEN (padding, gap, font-size — dessa matchar redan) men
råkade skriva egna, GENERISKA visuella värden istället för att läsa av
facits faktiska override-block: opak vit (`#fff`) istället för
`rgba(255,252,246,.88)`, bas-tonen `var(--nh-line)`=`#ebe1d1` istället
för `#dfc9aa`, och `border-radius:999px` (pill) istället för facits
`26px`. Ingen av dessa tre värden fanns förut som en tillgänglig CSS-
variabel att "råka missa" — de är unika för just denna breakpoint-
override i facit, vilket är precis varför de behöver läsas ur koden
specifikt (detta är exakt fallet den nya portningsprincipen finns till
för).

**Källregel att ändra:** `css/21-header-v2.css`, `.nh-mobile-searchbar
button`-blocket (rad ~372–385) — tre deklarationer (`background`,
`border-color`, `border-radius`) pekar just nu på fel/generiska värden
och bör sättas till facits exakta override-hex.

### Mikrotrust: 52px facit mot 104px implementation

**Grundorsak: två samverkande mekanismer, båda källbekräftade.**

1. **Saknad `!important` på en enda regel träffar en enda tagg-typ.**
   Nyehandels eget bas-tema har en global, `!important`-märkt
   textstorlek-reset som EXPLICIT listar taggnamn: `body, p, li, span,
   input, button, label, td, a { font-size:16px !important }` (och en
   `0.85rem !important`-variant under 480px). Facits förstsa mikrotrust-
   item (`a.nh-mt-item`, Trustpilot-länken) ÄR en `<a>`-tagg och matchar
   den listan. Implementationens egen regel,
   `.nh-mobile-trust .nh-mt-item{font-size:9.7px}` (`css/21` rad 344–352)
   saknar `!important` — och `!important` slår alltid icke-`!important`
   oavsett specificitet eller källordning. Resultat, CDP-bekräftat: item
   2–4 (`<div class="nh-mt-item">`, träffas INTE av tag-listan ovan) får
   korrekt `9.7px`, medan item 1 (`<a>`) tvingas till plattformens
   basstorlek och blir väsentligt högre.
2. **CSS Grid `align-items` (default `stretch`) sprider den ena
   radgrannens höjd till den andra.** `.nh-mobile-trust` är
   `display:grid; grid-template-columns:1fr 1fr` utan egen
   `align-items`-regel → default `stretch`. Item 1:s uppblåsta höjd
   (native `font-size`) STRÄCKER därför även item 2 (samma rad) till
   samma höjd, trots att item 2:s EGEN text/font är korrekt 9,7px —
   mätningen bekräftar detta exakt (item 1 och item 2: båda 25,59px,
   trots att bara item 1 har fel fontstorlek). Rad två (item 3–4, 51,19px
   vardera) blir ännu högre eftersom de dessutom bär den faktiska
   flerradiga texten ("Skickas 1-2 vardagar"/"Diskreta paket") vid en
   redan förstörd rad-höjdberäkning.

Containerns EGNA mått (`grid-template-columns:172px 172px`, `gap:6px
14px`, `padding:9px 16px`) är redan portade korrekt och identiska med
facit — hela avvikelsen kommer från item-nivån, inte från
`.nh-mobile-trust` själv.

**Källregel att ändra:** `css/21-header-v2.css`, `.nh-mobile-trust
.nh-mt-item`-blocket (rad 344–352) — lägg till `!important` på
`font-size` (och rimligen `line-height`, som riskerar samma
tag-name-kollision för `<a>`). Ingen ändring behövs i
`.nh-mobile-trust`s egen grid-regel.

---

## Öppna frågor (inte beslutade av denna spec)

1. Ny CSS-variabel för facits breakpoint-specifika sökfälts-ton
   (`#dfc9aa`) — lägg till som `--nh-line-warm` (eller liknande) i
   `css/21`s egen root-block, eller hårdkoda direkt i
   `.nh-mobile-searchbar button`? Påverkar bara detta ställe idag, men om
   fler element senare ska matcha samma "WARM WEST COAST"-ton är en
   variabel bättre. Nästa implementationsomgång avgör.
2. Varukorgsbadgens riktiga datakälla (vilken exakt cart-state-hook i
   `js/00-core-open.js` som ska driva siffran) — dokumenterat som ett
   VAR, inte ett HUR, i denna spec.
3. `#store-header{height:auto!important}`-fixen bör testas mot minst en
   kategori-/produktsida (inte bara startsidan) innan release, eftersom
   `--header-height-touch` är en delad, sajtomfattande native-variabel.
