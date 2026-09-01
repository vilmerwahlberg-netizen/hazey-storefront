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

## KORRIGERING (2026-09-01): mikrotrust låg på fel DOM-nivå i förra utkastet

Granskningen hittade en verklig strukturell motsägelse i förra versionen
av den här specen, verifierad och nu åtgärdad här. Sammanfattning av
felet, utredningen och den korrigerade planen — se detaljerna inne i
respektive sektion (DOM-mappning rad 10, §D, §F) för de fullständiga
konsekvenserna.

**Vad som var fel:** Föregående utkast föreslog `#store-header.nh-
header-v2 { height:auto !important; }` som HELA lösningen på header-
höjdsavvikelsen (122px facit mot 100px implementation). Det var
ofullständigt eftersom det inte tog hänsyn till att `.nh-mobile-trust`
idag monteras SOM BARN till `#store-header` i implementationen —
verifierat i `js/18a-header-v2.js` rad 332–344
(`mobileSearchBar.parentNode.insertBefore(trustRow, ...)`, där
`mobileSearchBar.parentNode` är `sh` = `#store-header` självt). En ren
`height:auto`-fix hade därför låtit mikrotrustens ~52–104px räknas in i
headerns egen autohöjd och gjort HELA headern (inkl. trustraden)
permanent fixed/synlig under scroll — cirka 174px hög, aldrig
bortscrollbar.

**Verifierat i facit-källan** (`prototyp/index.html` rad 4105–4131):
```html
<header class="hz-header" id="mHeader">
  <div class="m-row">...</div>
  <div class="m-searchbar">...</div>
</header>                                 <!-- #mHeader STÄNGS här -->
<div class="mt-mobile">...</div>          <!-- SYSKON till #mHeader, INTE barn -->
```
`.mt-mobile` har ingen egen `position`-regel (defaultar till `static`) —
den ligger i normalt dokumentflöde direkt under den `position:sticky`
headern och scrollar bort med resten av sidan när användaren scrollar
ned. Det är precis det beteendet implementationen måste reproducera.

**Den korrigerade planen** (fullständigt motiverad i den nya sektionen
"E. Strukturell lösning: mikrotrust-monteringspunkt" nedan): flytta
`.nh-mobile-trust` ut ur `#store-header` och montera den som FÖRSTA
riktiga barnet i `#store-main` (verifierat: `#store-header` och
`#store-main` är syskon under `#store-instance` på samtliga tre
sidtyper som testades — startsida, kategori, produkt — och `#store-
main` har redan en nativ `padding-top` som `nhSyncMainOffset` justerar
dynamiskt). `height:auto !important`-regeln på `#store-header` behövs
FORTFARANDE (headern är fortfarande högre än den nativa 100px-taket när
den bara innehåller main-rad + sökrad, se §F), men den räcker inte
ensam — DOM-flytten är den del som faktiskt löser motsägelsen.

---

## KORRIGERING 2 (2026-09-01): manuell visuell granskning underkände det automatiska PASS:et

Det automatiska PASS:et (§F, `header 6,3%`/`sökfält 7,8%`) höll sig under
12%-tröskeln men var INTE 1:1 vid manuell sida-vid-sida-granskning mot en
riktig facit-skärmdump. Fyra separata, oberoende rotorsaker — alla
verifierade LIVE (`getComputedStyle` + CDP `getMatchedStylesForNode`)
INNAN någon kod ändrades, ingen gissad:

**1. Headerns/main-radens bakgrund var native grårosa (`#eee7e1`), inte
varm creme.** CDP visade en NATIV Nyehandel-temaregel:
```css
#store-header, #store-header .main, #store-header .navbar {
  background: #eee7e1 !important;
}
```
— samma tema-injektionsmönster som redan dokumenterat i STATUS.md för
textfärger, nu bekräftat gälla `background` också, och den träffar
`#store-header`/`.main` DIREKT (inte bara ett generellt element). Våra
egna bakgrundsregler saknade `!important` och förlorade. Källa: facit
`#mVp .m-row` (samma "WARM WEST COAST PASS"-block som redan portats för
höjd/padding, index.html rad 1872-1875): `linear-gradient(180deg,
#fffaf0 0%, #fbf1e1 100%)`, `border-bottom-color:#eadbc5`. Header-
elementets egen bakgrund (`#mVp .hz-header`, rad 1960): `#fbf1e1`.

**2. Sökfältsområdets bakgrund var fel TOKEN, inte en specificitets-
fråga.** `.nh-mobile-searchbar` ligger visserligen kvar inuti
`#store-header`, men träffas INTE av ovanstående native regel (den
listar bara `#store-header`/`.main`/`.navbar` specifikt) — vår egen
`background: var(--nh-cream, #fffdf8)` (nästan vit) vann redan, men det
var fel VÄRDE. Facit `#mVp .m-searchbar` (samma block, rad 1876-1878):
`background:#fbf1e1` (samma varma ton som headern — INTE en ljusare
ton), `border-bottom-color:#e5d3b8` (saknades helt hos oss).

**3. Den ~26px höga gråbeige remsan mellan sökfält och mikrotrust.**
Verifierat live, INNAN någon av våra CSS/JS-injektioner körs: `#store-
main` självt (`getBoundingClientRect().top`) börjar vid y≈25,6px, INTE
vid dokumentets y=0. Orsak: `<body>` innehåller en lös, bokstavlig
`&gt;`-textnod direkt före `#store-instance` (synlig i native
`outerHTML`, oberoende av vår kod) — en redan existerande Nyehandel-
mall-artefakt (troligen en läckt `{% if %}`-liknande template-rest).
Den renderar som en textrad vid `<body>`s standard `line-height`
(`16px×1,6=25,6px`, samma multiplikator som redan två gånger tidigare
identifierad som orsak till andra buggar i denna spec). `nhSyncMainOffset`
(`js/18a-header-v2.js`) satte tidigare `#store-main`s `padding-top` till
ENBART headerns egen höjd, utan att känna till att `#store-main` redan
började 25,6px längre ned — nettoresultatet blev att mikrotrusten
hamnade headerns-höjd + 25,6px från toppen istället för bara headerns
höjd. **Detta är INTE något vår kod orsakat och INTE något vi kan/ska ta
bort** (det ligger i Nyehandels egen server-renderade HTML, utanför det
här repots rådighet) — men vi KAN och ska kompensera för det i vår egen
padding-beräkning, vilket är en ren layout-korrigering inom
mikrotrust-komponentens ansvarsområde.

**4. Mikrotrustens ikoner matchade inte facit — läst fel källa
tidigare, inte en textlängdsfråga.** Facitens riktiga `ICON`-objekt
(index.html rad 6705-6710) och `trustpilotHtml()` (rad 6714) användes
INTE korrekt i tidigare omgångar — tre av fyra ikoner (Trustpilot-
stjärnan, "ordrar"-ikonen, "Diskret & spårbart"-ikonen) var egna
approximationer med fel path-data, och alla tre ikonerna med
`stroke`-attribut hade `stroke-width:1,8` istället för facitens
`stroke-width:2`. Exakta facit-paths:
```js
ICON.shield: '<path d="M12 3l8 3v6c0 5-3.4 8-8 9-4.6-1-8-4-8-9V6z"/><path d="M9 12l2 2 4-4"/>'
ICON.truck:  '<path d="M3 7h11v10H3zM14 10h4l3 3v4h-7z"/><circle cx="7" cy="18" r="1.6"/><circle cx="17.5" cy="18" r="1.6"/>'
ICON.box:    '<path d="M21 8l-9-5-9 5 9 5 9-5zM3 8v8l9 5 9-5V8"/>'
tpMark:      '<path d="M12 2l2.9 6.3 6.6.7-4.9 4.5 1.3 6.5L12 16.8 6.1 20l1.3-6.5L2.5 9l6.6-.7z"/>' (fill, ingen stroke)
```
`ICON.shield` hör till "kunder/ordrar"-raden (var av misstag en
krona-liknande path), `ICON.truck` till leveransraden (rätt IKON sedan
tidigare men fel path-koordinater — rundad rect istället för skarp
path), `ICON.box` till "Diskret & spårbart" (var av misstag en
shield-path, inte en box).

**Fem, INTE ändrad — dokumenterad, inte gissad:** konto-/varukorgs-
ikonernas nativa `fill`-stil (redan flaggat §D/öppna frågor) och
varukorgsbadgens `0`-visning vid tom kundvagn (redan §A rad 7 — riktigt
Vue-state, `.badge` renderas bara villkorligt, ingen hårdkodad nolla)
kvarstår MEDVETET oförändrade. Att mutera SVG-innehåll eller badge-
villkor inuti samma Vue-hanterade `.icon`-span som badgens egna
conditional render riskerar att Vue tyst skriver över ändringen vid
nästa re-render (t.ex. varje varukorgsuppdatering) — risken är
dokumenterad här och i STATUS.md, inte otestad eller obeaktad.

**Ny testinfrastruktur som föranleddes av detta:** de tre isolerade
komponenttesterna (header/sökfält/mikrotrust, §F) kunde alla PASSA
samtidigt som gap-buggen i punkt 3 ovan förblev osynlig, eftersom de
bara jämför BESKURNA elementbilder, inte hela paketets sammanhängande
dokumentgeometri. Ny testsvit `tests/parity-sections.mjs`
(`PACKAGE_GEOMETRY_*`) + nya test i `tests/home-parity.spec.mjs` mäter
nu header/sökfält/mikrotrust/hero-position i EN sammanhängande batch,
vid 390/430/600px, och jämför IMPLEMENTATIONENS mellanrum
(sökfält→mikrotrust, mikrotrust→hero) mot FACITS egna, låsta
motsvarande mellanrum — ett tomt mellanrum som inte finns i facit gör nu
detta test rött oavsett vad de separata komponenttesterna visar.

---

## KORRIGERING 3 (2026-09-01): sista strikta kalibreringsomgången — "betydligt bättre men ännu inte manuellt godkänt"

Efter KORRIGERING 2 passerade alla tre isolerade komponenttester (header/
sökfält/mikrotrust) samt det nya paket-geometritestet, men manuell
granskning fann fortfarande fem konkreta, mätbara avvikelser. Alla fem
root-orsakades via live `getComputedStyle`/CDP `getMatchedStylesForNode`-
inspektion av facit (`localhost:8765`) mot implementationen
(`hazeyse.nyehandel.se` + injicerad `hazey.css`/`hazey.min.js`) — inga
värden gissades ur skärmdumpar.

1. **Mikrotrust "1–2 vardagar" saknade `<b>`.** `js/18a-header-v2.js`s
   `trustRow.innerHTML`-mall byggde `<span>Normalt 1–2 vardagar</span>`
   utan bold-taggning. Facits källkod (index.html, `deliveryText`) bygger
   `'Normalt <b>' + TRUST.delivery.normal + '</b>'`. Fixat genom att lägga
   till `<b>`-taggen i mallsträngen. Punkterna "4,7/5" och "8 000+" hade
   redan `<b>` sedan tidigare rundor.

2. **Mikrotrust + sökfältsknappen ärvde fel font-family/vikt/spårning
   från nyehandels nativa temareset.** Samma mönster som tidigare rundors
   font-size/line-height-buggar (se §F): den globala
   `body,p,li,span,input,button,label,td{font-family:"Nunito",...
   !important;font-weight:500!important}` + `...,a{letter-spacing:
   0.02em!important}`-regeln vann över våra icke-`!important`-märkta
   textregler i `.nh-mt-item` och `.nh-mobile-searchbar button`. Detta var
   den verkliga orsaken till att sökfältet "kändes vitare/mindre skarpt"
   — inte en färgfråga. Fixat med explicita `!important`
   `font-family: -apple-system, "system-ui", "Segoe UI", "Helvetica Neue",
   Arial, sans-serif`, `font-weight: 400`, `letter-spacing: normal` på
   båda selektorerna (uppmätta facit-värden, inte gissade), plus
   utökning av `span, b { ... inherit !important }`-blocket i mikrotrust
   till att även täcka font-family/letter-spacing. Sökfältsknappens höjd
   (43px→41px) rättade sig SJÄLV av samma fix, utan någon separat
   höjdregel — bekräftar att font-metrik-skillnaden var hela orsaken.

3. **Mikrotrust→hero-gappet var fortfarande 10px, inte 18px, trots ett
   tidigare `margin-bottom:8px`-försök.** Grundorsak: CSS-marginalkollaps
   — angränsande syskonmarginaler i normalt flöde kollapsar till MAX-
   värdet, inte summan. `.nh-mobile-trust{margin-bottom:8px}` +
   `.nh-hero-v2{margin-top:10px}` gav `max(8,10)=10`, oförändrat. Rättat
   till `margin-bottom:18px` så `max(18,10)=18`, verifierat live mot
   facits uppmätta 18px.

4. **Remsan mellan mikrotrust och hero hade fel färgton.** Identifierat
   via `document.elementFromPoint(x,y)` att `#store-main` SJÄLVT (inte
   någon wrapper eller ett negativt-margin-hack) ritar den ytan — elementet
   är genomskinligt (`background-color:rgba(0,0,0,0)`) så sajtens
   generella bakgrund (`rgb(228,209,191)`) syntes igenom istället för
   facits varma ton. Facits exakta rendrade färg pixel-uppmätt (4
   samplingspunkter, ej gissad ur gradientstoppen i källkoden) till
   `rgb(254,246,233)`. Satt direkt på `#store-main` som `background`,
   scopat till `@media(max-width:880px)`.

5. **Mikrotrustboxen var 3px för hög (55px mot facits 52px), vilket gav
   ett falskt förhöjt pixel-diff (14,8%) trots att alla ovanstående var
   fixade.** Rotorsakat genom att jämföra fullständig box-modell för
   `.mt-mobile-inner` i facitkällkoden (rad 1887–1891:
   `padding:9px 16px; gap:6px 14px;` — symmetrisk padding, INTE
   `9px 16px 12px`) mot implementationens `.nh-mobile-trust{padding:9px
   16px 12px}` (asymmetrisk, 12px nederkant istället för 9px — en kvarleva
   från en tidigare, ej korrekt uppmätt gissning). `12−9=3px`, exakt
   avvikelsen. Rättat till `padding:9px 16px` (symmetrisk, matchar facit
   exakt). Efter fix: `wrapHeight` mätt live till EXAKT 52px på båda
   sidor.

6. **Headern var 2px för hög (124px mot facits 122px) trots att
   sökfältets egen höjd redan var en exakt 53px=53px-matchning.**
   Root-orsakat via CDP `getMatchedStylesForNode`: `#store-header` ärver
   en NATIV Nyehandel-plattformsregel, `header{border-bottom:var(
   --header-border-bottom-touch)}` (inte satt av oss någonstans i repot),
   som renderar en 2px grå linje (`rgb(223,223,223)`) under headern.
   Facits `#mHeader` har ingen sådan kantlinje (0px). Detta är en synlig,
   mätbar avvikelse mot facit — inte en "Vue-relaterad" eller dynamisk
   platshållare — så den nollställdes med `border-bottom:0 !important`,
   scopat till `#store-header.nh-header-v2` inom mobil-media-queryn.

**Kvarvarande, medvetet ej korrigerade avvikelser efter denna omgång**
(alla verifierade som antingen explicit instruerade undantag eller
verklig text-rendering, inte layoutfel):

- **Tom varukorgs `0`-badge** (header, punkt 5 i föregående granskning,
  återbekräftat denna omgång): facit visar en hårdkodad `0`, den riktiga
  implementationen har INGEN badge vid tom kundvagn eftersom Vue-statets
  villkorliga render korrekt döljer den. Detta är rätt beteende, inte en
  bugg — en hårdkodad nolla skulle vara precis den typen av fejkad
  trust-/kunddata som CLAUDE.md förbjuder.
- **"8 000+ ordrar · sedan 2020" vs facits "8 000+ kunder · sedan
  2020"**: explicit instruerat att behålla "ordrar", inte porta facits
  "kunder"-ord. Orsakar en stor del av mikrotrustens kvarvarande
  pixel-diff (9,68% efter alla ovanstående fixar) eftersom ordbytet
  förskjuter resten av textraden — detta är en AVSIKTLIG textskillnad,
  inte ett layout- eller typografifel.
- **Logotypens kursiva serif-rendering ("hazey")** och mindre kant-
  antialiasing kring konto-/varukorgsikonerna i header-diffen: verifierat
  att font-family, storlek, vikt och färg matchar exakt (`getComputedStyle`
  identisk på båda sidor) — kvarvarande pixelskillnad är webbläsarens
  egen sub-pixel-antialiasing av kursiv text vid rendering, inte en
  CSS-egenskap som skiljer. Ingen `filter`/`opacity`/`text-shadow` har
  lagts på för att maskera detta, i linje med instruktionen.

**Resultat efter denna omgång** (se STATUS.md för fullständig
testkörningslogg): Header PASS (122px=122px exakt, diffRatio 1,21%),
Sökfält PASS (53px=53px exakt, diffRatio 0% — pixelperfekt), Mikrotrust
PASS (52px=52px exakt, diffRatio 9,68% — förklarad ovan), paket-
geometritestet (390/430/600px, inget dolt gap) PASS.

---

## A. DOM-mappning

| # | Element | Facitselektor | Implementationselektor | Markup portabel? | Riktig nyehandel-funktion som måste bevaras |
|---|---|---|---|---|---|
| 1 | Header-rot | `#mHeader` (`.hz-header`) | `#store-header` (`.nh-header-v2`) | Nej — native element, CSS-endast | `position:fixed`, headroom-slide vid scroll (`js/14-header-scroll.js`), nativ `var(--header-height*)` som andra teman-regler kan referera |
| 2 | Main-rad | `.m-row` | `.main` | Nej — CSS-endast (grid `1fr auto 1fr` redan portad) | native `.left`/`.center`/`.right`-containrar, Vue-bindningar däri |
| 3 | Hamburgare | `#mMenuBtn` (`.m-icon`) | `.nh-burger` | **Delvis** — samma stil (3 raka linjer, `stroke-width:2`, `viewBox="0 0 24 24"`) men INTE identisk path: facit `M4 7h16M4 12h16M4 17h16` mot vår `M4 6h16M4 12h16M4 18h16` (linje 1/3 ligger 1px närmare mitten hos oss). Vår path kommer från `js/18a-header-v2.js` rad 296 (egen, inte kopierad). Byt till facits exakta `d`-attribut för sann 1:1 | `#mobile-nav-menu` (nativ Vue-hamburgare) hålls dold, vår egen mobilmeny-öppna/stäng-JS |
| 4 | Ordmärke | `.m-logo` (textlänk) | `.main .brand a::after` | **Redan korrekt portad** (se §F) | `href="/"`, `<img alt>` kvar i DOM (dold, tillgänglighet) |
| 5 | Kontoikon | `a.m-icon[aria-label="Konto"]` | `.main .right .account-button` | **Nej, HELT olika SVG-stil** — facit: enkel stroke-ikon (`stroke-width:1.7`, `fill:none`, cirkel r=3.6 + öppen axel-path). Implementation: nativ nyehandel-ikon, `fill`-baserad (solid path-former, ingen `stroke`) — inte vår markup, ligger i plattformens egen Vue-render. Att göra identisk kräver att ERSÄTTA den nativa `<svg>`-innehållet med facits (markup-swap, inte bara CSS) — se §D, öppen fråga | riktig `/sv/account`-länk (native `<a>`, rörs inte) |
| 6 | Varukorgsikon | `#mCartBtn` | `.main .right .cart-button` | **Nej, samma sak som konto** — nativ `fill`-baserad ikon (kundvagn+2 cirklar som solida path-former), inte facits stroke-baserade linje-ikon. Samma markup-swap-fråga som rad 5 | riktig `#cart-button`, Vue `aria-controls="cart-side-wrap"`, `cart/addVariant` (CLAUDE.md) |
| 7 | Varukorgsbadge | `#mCartCount` (`.m-cart-count`) | **Finns redan nativt, bara ostylad för mobilheadern** — verifierat: `#store-header .cart-button .badge` (Vue-villkorlig, renderas som `<!---->`-platshållare tills korgen har ≥1 vara) har redan EN CSS-regel sen tidigare kontraktörspass (`css/05-info-section-info-html-ersatter-test.css` rad 641–647: `background:#cdfc9f!important;color:#23231d!important;border:none!important` — bara färg, ingen position/storlek). CSS-endast: lägg till position/mått i `css/21`, INGEN ny markup, INGEN hårdkodad nolla | Vue-drivet native `.badge`-element, `cart/addVariant`-reaktivt (CLAUDE.md) — rör aldrig dess rendering-logik, bara dess CSS-position/mått |
| 8 | Sökrad | `.m-searchbar` | `.nh-mobile-searchbar` | Nej — knappen finns redan, CSS-endast | riktig `#mobile-search-trigger`-klick-genom (redan kopplat) |
| 9 | Sökknapp | `#mSearchBtn` | `.nh-mobile-searchbar button` | Nej — CSS-endast | samma som ovan |
| 10 | Mikrotrust-rad | `.mt-mobile` → `.mt-mobile-inner` (SYSKON till `#mHeader`, se korrigeringen ovan) | `.nh-mobile-trust` (idag BARN till `#store-header` — måste flyttas, se §E) | Containerns grid/gap/padding är REDAN portad nästan exakt (se §F); item-nivån saknar en `!important`. **Kräver också en DOM-monteringsändring i JS, inte bara CSS** — se §E | statiskt innehåll, ingen live-integration; monteringspunkten måste dock respektera `#store-main`s nativa `padding-top`/`nhSyncMainOffset` (se §E) |
| 11 | Trust-item 1 (Trustpilot) | `a.mt-item:nth-child(1)` | `a.nh-mt-item:nth-child(1)` | CSS-endast, kräver `!important`-fix (§F) | riktig `trustpilot.com/review/hazey.se`-länk |
| 12 | Trust-item 2–4 | `.mt-item` (`<div>`) | `.nh-mt-item` (`<div>`) | CSS-endast | statisk copy |

---

## B. Geometri

Alla mått `getBoundingClientRect()` vid 390px viewport, dSF 1.

### Header-rot

| Egenskap | Facit (`#mHeader`) | Implementation (`#store-header`) |
|---|---|---|
| Total höjd | **122px** (auto, `.m-row` 69px + `.m-searchbar` 53px, inget mer i headern) | **100px** — men detta är en **CSS-höjdcap**, inte innehållets faktiska höjd (se §F) |
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
| Padding | `12px` runt om | `4px 0` (native, se §F) |
| Gap | 6px | n/a (grid, ej flex-gap) |
| Grid | n/a (flex) | `110px auto 110px` (dvs `1fr auto 1fr`, redan portad korrekt) |

### Ikonknappar (hamburgare/konto/varukorg)

| Element | Facit mått | Implementation mått | Diff |
|---|---|---|---|
| `#mMenuBtn` (hamburgare) | **44×44px** (`@media max-width:860px { .m-icon{width:44px;height:44px} }`, rad 1681 — tillgänglighetsfix, kommentar: "Meny, konto och varukorg är primära interaktioner och ska vara minst 44×44") | `.nh-burger` **40×40px** (`css/21-header-v2.css` rad 111–115: `width:40px;height:40px`) | **−4px i varje led** — enda ikonknappen som INTE matchar 44×44-regeln |
| Konto (`a.m-icon[aria-label="Konto"]`) | 44×44px | `.account-button` 44×44px | ✅ matchar |
| Varukorg (`#mCartBtn`) | 44×44px | `.cart-button` 44×44px | ✅ matchar |
| Ikon-`<svg>` | 22×22px | konto/varukorg: nativ SVG storlek (`.account-button svg`/`.cart-button svg`, ej explicit satt i css/21 — native default) | ej jämfört, lägre prioritet |

### Varukorgsbadge (facit `.m-cart-count` mot impl `.cart-button .badge`, native — se DOM-mappning rad 7)

| Egenskap | Facit `.m-cart-count` | Implementation `.badge` idag |
|---|---|---|
| Position | `absolute; top:2px; right:2px` (relativt `.m-icon`, som är `position:relative`) | ej satt (bara färg, se `css/05` rad 641–647) — ska bli `absolute; top/right` relativt `.cart-button` |
| Mått | `min-width:15px; height:15px; padding:0 3px` | ej satt |
| `border-radius` | 20px (pillform) | ej satt |
| Bakgrund | `var(--status-campaign)` = `#c96a26` | `#cdfc9f` (ljusgrön, äldre kontraktörsval) |
| Text | `#fff`, `9px`, `700` | `#23231d` (mörk text, äldre kontraktörsval) |

Facits orange (`#c96a26`) mot den redan satta ljusgröna (`#cdfc9f`) är en
FÄRGSKILLNAD som kräver ett medvetet beslut, inte bara en saknad regel —
se öppen fråga i §D punkt 8/öppna frågor.

### Sökrad

| Egenskap | Facit (`.m-searchbar`) | Implementation (`.nh-mobile-searchbar`) |
|---|---|---|
| Total höjd | 53px | 59.59px (**+6.6px**) |
| Padding | `0 12px 11px` | `0 16px 10px` (**4px mer i sidled**) |
| Knapphöjd (`#mSearchBtn` / `button`) | **41px** | **49.59px** (**+8.6px**) |
| Knapp-padding | `11px 16px` | `11px 16px` ✅ identisk |
| `border-radius` | **26px** | **999px** (helt annan avrundning — pill istället för mjukt rundade hörn) |
| `border-width` | **`1px` (renderat/computed)** — käll-CSS säger `1.5px` (`.m-searchbar button{border:1.5px solid var(--line)}`, rad 367), men `getComputedStyle` mäter `1px` konsekvent vid dSF:1 (Chrome "snappar" icke-heltaliga border-width till hela enhetspixlar vid rendering/beräknat värde — bekräftat, ingen ytterligare override-regel hittad för bredden). **Portera `1px`, inte `1.5px`** — det är det som faktiskt renderas. | `1px solid rgb(235,225,209)` |
| `border-color` | `#dfc9aa` (facit-övre override, se §F) | `#ebe1d1` (bas-token, INTE facits override, se §F) |
| Bakgrund | `rgba(255,252,246,.88)` (halvtransparent varm cream) | `rgb(255,255,255)` (helt opak vit) |
| `box-shadow` | `inset 0 1px 0 rgba(255,255,255,.9)` (facit-övre override, rad 1883) | `none` |
| Ikon-`<svg>` | **16×16px** (`.m-searchbar svg{width:16px;height:16px}`, rad 370) | ospårat i denna körning, lägre prioritet men bör verifieras vid implementation |
| Gap (ikon→text) | 9px | 10px |

### Övre mikrotrust

| Egenskap | Facit (`.mt-mobile`) | Implementation (`.nh-mobile-trust`) |
|---|---|---|
| Total höjd | **52px** | **103.78px** (**+51.78px, ~2×**) |
| Grid-kolumner | `172px 172px` | `172px 172px` ✅ identisk |
| `gap` | `6px 14px` | `6px 14px` ✅ identisk |
| Padding | `9px 16px` (symmetrisk, inget extra i botten) | `9px 16px 12px` (**+3px padding-bottom** utöver containern, försumbart mot huvudorsaken) |
| Item 1 höjd (Trustpilot, `<a>`) | ~13px | **25.59px** |
| Item 2 höjd (`<div>`) | ~13px | **25.59px** (stretchad av item 1, se §F) |
| Item 3–4 höjd (`<div>`) | ~13px | **51.19px** |
| Item font-size | **9.7px** (vinnande facit-regel, rad 1896–1899) | Item 2–4: `9.7px` ✅. **Item 1 (`<a>`): tvingas till nativt basvärde** (se §F) — inte 9.7px trots samma `.nh-mt-item`-klass |
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
| | `border-radius` | 26px | 999px | ❌ (se B/F) |
| | `background` | `rgba(255,252,246,.88)` | `rgb(255,255,255)` | ❌ (se B/F) |
| | `border-color` | `#dfc9aa` | `#ebe1d1` | ❌ (se B/F) |
| | `border-width` (renderat) | `1px` (se B — käll-CSS säger 1.5px, renderat värde är 1px) | `1px` | ✅ redan rätt (bara färgen skiljer) |
| | `box-shadow` | `inset 0 1px 0 rgba(255,255,255,.9)` | `none` | ❌ saknas helt |
| Mikrotrust-item | `font-size` | 9.7px | 9.7px (div) / native-tvingat (`<a>`) | ❌ för `<a>`-varianten (se F) |
| | `color` | `rgb(101,89,70)` | `rgb(101,89,70)` | ✅ |
| | `font-family` | system-sans (arv) | `Nunito, Helvetica, Arial, Lucida, sans-serif` (native) | ⚠️ ej verifierat om avsiktligt — item-textens font ärvs från `body` i båda fallen, olika bas-fontstack per sajt, inte en portningsfråga |
| Header bakgrund | `background` | `#fbf1e1` | `#eee7e1` (native) | ❌ headerns EGEN bakgrund är inte porterad (main-radens gradient är dock redan porterad separat, se CLAUDE.md) |
| Ikonrad box-shadow | `.mt-mobile` | `inset 0 1px 0 rgba(255,255,255,.5)` | inget böjt fram i denna körning, ej highp prioritet | — |

---

## D. Kodportningsplan

**Kan flyttas/efterliknas direkt (markup+CSS, ingen översättning behövs):**
- Hamburgarens `<svg>` — samma stil, bara `d`-attributet behöver bytas
  till facits exakta path (`M4 7h16M4 12h16M4 17h16`, se DOM-mappning
  rad 3). Vår egen `d="M4 6h16M4 12h16M4 18h16"` (`js/18a-header-v2.js`
  rad 296) är INTE facits, bara stilmässigt lik.
- **Konto-/varukorgsikonerna är INTE portabla rakt av** — de är nativa
  nyehandel-`fill`-ikoner, en helt annan SVG-stil än facits
  `stroke`-ikoner (se DOM-mappning rad 5–6). Att göra dem identiska
  kräver att BYTA UT den nativa `<svg>`-markupen mot facits — en
  markup-swap på ett nativt element, större risk än en CSS-ändring.
  **Öppen fråga, inte beslutad av denna spec**: är ikonbytet värt att
  göra (påverkar bara utseende, inte funktion), eller accepteras den
  stilistiska skillnaden på just dessa två ikoner tills vidare?

**CSS-regler som kan porteras (värden, inte hela regelblocket rakt av —
selektorer måste översättas):**
1. **Header-höjd**: `#mHeader{}` har ingen egen höjd-regel i facit
   (auto) — det är `#store-header`s NATIVA `height:var(--header-height-
   touch)` som begränsar (se §F). Lägg till `height:auto !important;
   min-height:0` på `#store-header.nh-header-v2`. **Förutsätter att
   mikrotrust redan flyttats ut ur headern (§E) — annars blir autohöjden
   ~174px+ istället för ~122px.**
2. **Header-bakgrund**: `#fbf1e1` (facit `#mVp .hz-header{background:
   #fbf1e1}`, rad 1960) → ny deklaration på `#store-header.nh-header-v2`
   (idag `#eee7e1`, native, oporterad).
3. **`.m-row`-padding**: `12px` runt om (facit rad 344–347, bas-regel,
   ingen override hittad som ändrar den vid 390px) → `.main` har idag
   `4px 0` (native `#store-header.nh-header-v2 .main{padding-top:4px;
   padding-bottom:4px}`, se `css/21` rad ~65–70). Byt till `12px` runt om
   — **verifiera** att detta inte krockar med den redan portade
   `grid-template-columns:1fr auto 1fr` (padding och grid-kolumner är
   oberoende, bör vara säkert, men kolla synligt resultat).
4. **Sökfältsknapp** (facit rad 1880–1884, "WARM WEST COAST PASS" +
   bas-regel rad 365–370): `background:rgba(255,252,246,.88);
   border:1px solid #dfc9aa; border-radius:26px; box-shadow:inset 0 1px
   0 rgba(255,255,255,.9); gap:9px` (ikon-`<svg>` 16×16px) → ersätt
   motsvarande deklarationer i `.nh-mobile-searchbar button`
   (`css/21-header-v2.css` rad ~372–385). Bredd: portera `1px`
   (renderat/computed värde), inte källkodens bokstavliga `1.5px` — se
   §B för varför de skiljer.
5. **Sökfälts-container**: padding `0 12px 11px` (facit rad 358) →
   ersätt `.nh-mobile-searchbar`s nuvarande `0 16px 10px`.
6. **Mikrotrust-item**: `font-size:9.7px !important; line-height:1.2
   !important` (facit rad 1896–1899, värdena redan portade men saknar
   `!important` — se §F för varför `!important` krävs). Ikon-`<svg>`
   13×13px (facit slutlig override rad 1655, idag 14×14px hos oss).
7. **`.nh-burger{width:44px;height:44px}`** (upp från 40px) för att
   matcha facits egen 44×44-tillgänglighetsregel (rad 1681) och de andra
   två ikonknapparna som redan är 44×44.
8. **Varukorgsbadge, positionering** (facit `.m-cart-count`, rad 356):
   `position:absolute; top:2px; right:2px; min-width:15px; height:15px;
   padding:0 3px; border-radius:20px; background:#c96a26; color:#fff;
   font-size:9px; font-weight:700` → NY regel `#store-header.nh-header-
   v2 .cart-button .badge{...}` i `css/21`, som KOMPLETTERAR (inte
   ersätter) den befintliga färgregeln i `css/05-info-section-info-html-
   ersatter-test.css` rad 641–647 (den sätter redan `background`/`color`/
   `border` med `!important` — antingen låt `css/21` vinna på
   specificitet+ordning för position/mått, eller uppdatera `css/05`s
   regel direkt; avgörs vid implementation, inte här). **Ingen ny
   markup, ingen hårdkodad siffra** — `.badge` är redan Vue-drivet.

**Selektorer som måste översättas (inte kopieras rakt av):**
- `#mHeader` → `#store-header.nh-header-v2` (specificitet krävs för att
  vinna över native temaregler, redan etablerat mönster i filen).
- `.m-searchbar` / `.m-searchbar button` → `.nh-mobile-searchbar` /
  `.nh-mobile-searchbar button`.
- `.mt-mobile .mt-item` → `.nh-mobile-trust .nh-mt-item` (värdena redan
  portade, bara `!important`-nivån saknas).
- `.m-cart-count` → `.cart-button .badge` (se punkt 8 ovan — INTE samma
  klassnamn, native Vue-markup styr namnet).
- `var(--line)`/`var(--green)` etc. → motsvarande `var(--nh-line)`/
  `var(--nh-green)` (redan definierade i `css/21`s egen `:root`-liknande
  block på `#store-header.nh-header-v2`) — **eller** hårdkoda facits
  exakta override-hex (`#dfc9aa`) om den INTE redan finns som en egen
  CSS-variabel (den gör inte det idag — `--nh-line` pekar på bas-tonen
  `#ebe1d1`, inte facits breakpoint-specifika `#dfc9aa`). Ny variabel
  rekommenderas, se öppna frågor.

**Gammal implementation som bör ersättas:**
- `.nh-mobile-searchbar button`s nuvarande `border-radius:999px` +
  opak vit bakgrund + bas-`--nh-line`-border (`css/21` rad 372–385)
  ersätts av punkt 4 ovan.
- `.nh-burger`s `40px`-mått (`css/21` rad ~111–115) ersätts av `44px`.
- `#store-header.nh-header-v2 .main{padding-top:4px;padding-bottom:4px}`
  ersätts av symmetrisk `12px`.
- **DOM-monteringen av `.nh-mobile-trust`** i `js/18a-header-v2.js`
  rad 332–344 (`mobileSearchBar.parentNode.insertBefore(trustRow,
  mobileSearchBar.nextSibling)`, som monterar den INUTI `#store-header`)
  ersätts av monteringen i §E (`#store-main`, första barnet).

**Regler som INTE längre behövs efter portningen:**
- Inga CSS-regler blir överflödiga — allt är värde-/target-justeringar
  på redan nödvändiga selektorer.
- I JS: när `.nh-mobile-trust` flyttas till `#store-main` (§E) blir
  `nhSyncMainOffset`s nuvarande kommentar-motivering ("scrollHeight,
  INTE getBoundingClientRect... eftersom vår sökrad/trust-rad
  överskrider den") delvis inaktuell — trust-raden bidrar inte längre
  till `#store-header`s scrollHeight. Själva `scrollHeight`-mätningen
  ska ANDÅ behållas (sökraden ensam kan fortfarande göra att headerns
  riktiga höjd skiljer sig från `--header-height-touch`), men
  kommentaren bör uppdateras vid implementation så den inte pekar på
  trust-raden som en orsak längre.

**Hur Nyehandels riktiga funktionalitet bevaras:**
- Header förblir `position:fixed` med `js/14-header-scroll.js`s
  headroom-slide orörd — den scriptet läser bara `#store-header` (rad 7),
  och `.nh-mobile-trust` lämnar det elementet helt vid flytten till
  `#store-main` (§E), så headroom-transformen kan aldrig påverka
  trust-raden efter ändringen.
- `#mobile-nav-menu` (nativ Vue-hamburgare), `#mobile-search-trigger`
  (nativ sök-trigger) och `.topbar` förblir dolda men OBORTTAGNA i DOM:en
  — samma "dölj, radera aldrig nativt"-mönster som redan används
  (bekräftat i befintlig `css/21`, rad 320–324).
- Varukorgsbadgen är redan Vue-drivet nativt (`.cart-button .badge`) —
  denna spec ändrar bara position/mått via CSS, rör aldrig dess
  rendering-villkor eller data.
- Kontolänken (`/sv/account`) och varukorgsknappens `aria-controls`/Vue-
  bindning rörs inte — endast SVG-innehåll (öppen fråga) och
  omkringliggande CSS.
- `#store-main`s nativa `padding-top` och `nhSyncMainOffset`s
  resize-lyssnare rörs inte i sin mekanik — bara VAD som mäts (headerns
  scrollHeight, nu utan trust-raden) och VAR trust-raden monteras
  relativt den (§E).

---

## E. Strukturell lösning: mikrotrust-monteringspunkt

Detta avsnitt löser motsägelsen från korrigeringsnoten högst upp i
dokumentet. Verifierat live (Playwright, skrivskyddat) mot samtliga tre
sidtyper: startsida (`https://hazeyse.nyehandel.se/`), kategori
(`/sv/categories/alla-produkter`), produkt
(`/sv/products/ccell-m4-vape-batteri-510`).

### Var trustfältet ska monteras

**Verifierad, identisk DOM-struktur på alla tre sidtyper:**
```
<div id="store-instance">
  <header id="store-header" class="nh-header-v2">...</header>
  <main id="store-main" class="store-main">...</main>
</div>
```
`#store-header` och `#store-main` är SYSKON, direkta barn av
`#store-instance` — bekräftat identiskt på startsida, kategori och
produkt (samma `shNextSibling`/`smPrevSibling`-relation uppmätt på alla
tre). `#store-main` har en nativ `padding-top:100px` på alla tre
sidtyper (identiskt tal, oavsett sidtyp), och dess första barn idag är
en generisk, sidtyp-specifik wrapper-`<div>` (startsidans
`.store-startpage`, kategorins produktgrid-wrapper, produktsidans
PDP-wrapper — olika INNEHÅLL men samma STRUKTURELLA position).

**Lösning:** montera `.nh-mobile-trust` som FÖRSTA barnet i `#store-
main`, FÖRE den befintliga sidtyp-specifika wrappern — inte inuti
`#store-header`. I `js/18a-header-v2.js` betyder det att rad 344
(`mobileSearchBar.parentNode.insertBefore(trustRow,
mobileSearchBar.nextSibling)`, som idag monterar `trustRow` som syskon
till `mobileSearchBar` INUTI `sh`/`#store-header`) ska bytas mot att
montera `trustRow` som `storeMain.insertBefore(trustRow,
storeMain.firstChild)` istället — samma mönster som redan används för
`nh-hr-root`/mobilmenyn (`document.body.appendChild(...)`, fast här
`#store-main` istället för `<body>`, eftersom trustraden SKA vara en del
av det normala, scrollande sidflödet, till skillnad från overlays som
medvetet monteras på `<body>` för att undvika `#store-header`s
transform-containing-block-problem, se befintlig kommentar rad 278–282).

Eftersom detta är en JS-DOM-ändring, inte bara CSS, ligger den KVAR som
en dokumenterad, obeslutad ändring i `js/18a-header-v2.js` för nästa
implementationsomgång — inte gjord av denna spec.

### Hur `nhSyncMainOffset` påverkas

`nhSyncMainOffset` (rad 377–386) mäter idag `sh.scrollHeight` (hela
`#store-header`, som just nu INKLUDERAR trust-raden) och sätter
`#store-main`s `padding-top` till det värdet. Två saker förändras när
trust-raden flyttas ut:

1. **`sh.scrollHeight` blir automatiskt mindre** — utan ändring av
   funktionens egen kod — eftersom trust-radens ~52–104px inte längre
   är ett barn till `sh`. Headerns uppmätta höjd blir då `.main` (69px)
   + `.nh-mobile-searchbar` (efter §D:s fixar, ~53px) ≈ **122px**,
   matchande facit nästan exakt. Ingen kodändring behövs i själva
   mät-/sättlogiken.
2. **Ingen "dubbel luft"**: eftersom `padding-top` sätts till exakt
   `sh.scrollHeight` (den NYA, mindre headerhöjden) och trustraden
   monteras som `#store-main`s FÖRSTA barn (dvs. direkt vid den nya,
   mindre `padding-top`-kanten), uppstår inget extra mellanrum — trust-
   raden hamnar visuellt precis där headern slutar, exakt som i facit.
   Detta gäller AUTOMATISKT så länge (a) trustraden flyttas till att
   vara `#store-main`s första barn och (b) `nhSyncMainOffset` fortsätter
   köras efter DOM-ändringen (ingen ändring behövs där, den körs redan
   vid `initHeaderV2()` och vid `resize`).
3. **Kommentaren i koden bör uppdateras** (redan noterat i §D) — den
   pekar idag på "vår sökrad/trust-rad" som orsak till att `scrollHeight`
   behövs; efter flytten är det bara sökraden som kan göra det.

### Vilket slutmått headern får

Med BÅDA fixarna (§D punkt 1: `height:auto!important` + denna
DOM-flytt): `#store-header`s totala höjd = `.main` (69px, oförändrad) +
`.nh-mobile-searchbar` (53px efter §D:s sökfälts-fixar) = **≈122px**,
i linje med facits uppmätta `122px`. Utan DOM-flytten hade
`height:auto` ensam gett ~174–230px (main + sökrad + trustrad) — det
felaktiga scenariot korrigeringsnoten flaggar.

### Vilket y-läge trustfältet får

Facit: `.mt-mobile` renderas vid `y=122px` (uppmätt direkt under sitt
`122px` höga `#mHeader`, se §B). Med denna lösning: `.nh-mobile-trust`
blir `#store-main`s första barn, och `#store-main`s `padding-top`
synkas (via `nhSyncMainOffset`) till exakt headerns nya `~122px`-höjd —
trustraden hamnar därför också vid **`y≈122px`**, dvs. samma relativa
position som facit, fast uppnått strukturellt (normal dokumentplacering
efter en offset) snarare än genom att vara ett fysiskt barn till
headern.

### Hur det fungerar på startsida, kategori och produktsida

Eftersom `#store-header`/`#store-main`-relationen och den nativa
`padding-top:100px` är IDENTISKA på alla tre uppmätta sidtyper, och
`initHeaderV2()` (som bygger sökrad/trustrad) körs oavsett sidtyp
(bekräftat: sökrad+trustrad syns redan idag på alla tre sidtyper i
implementationen, det är just DÄR de monteras som är fel, inte NÄR),
gäller lösningen enhetligt utan sidtyp-specifik kod. Trustraden hamnar
före `.store-startpage`/kategorigridet/PDP-wrappern i respektive fall —
exakt samma strukturella position (`#store-main`s första barn) oavsett
sidans eget innehåll.

### Hur desktop förblir orörd

`.nh-mobile-searchbar`/`.nh-mobile-trust` skapas idag oavsett
viewport-bredd (koden är inte breddvillkorad) men GÖMS på desktop via
`@media (min-width:881px){.nh-mobile-searchbar{display:none!important}
.nh-mobile-trust{display:none!important}}` (`css/21` rad 326–330). Ett
`display:none`-element upptar ingen plats oavsett VAR i DOM:et det
sitter — att flytta `.nh-mobile-trust` till `#store-main` ändrar därför
INGET visuellt på desktop, samma dölj-regel gäller oförändrad. Desktop-
headerns egen höjd påverkas inte heller av `height:auto!important` på
`#store-header`, eftersom `--header-height`-varianten (utan `-touch`,
gäller `min-width` över `1023px`-brytpunkten) redan idag styr en annan,
troligen redan tillräcklig höjd för desktop-headerns FAKTISKA innehåll
(desktop har ingen sökrad/trustrad synlig i headern att svälla av) —
detta bör ändå verifieras visuellt vid implementation, inte bara antas.

### Kvarstående öppen fråga från denna sektion

Bekräfta vid implementation att `.nh-mobile-trust` INTE av misstag
hamnar ovanför något nativt Vue-styrt "loading skeleton" eller liknande
som `#store-main`s riktiga första barn ibland kan vara innan sidans
huvuddata laddat klart — den här specen har bara verifierat DOM:et efter
`networkidle`, inte under den allra första renderingen.

---

## F. Grundorsaker (inte bara symptom)

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
växer fritt med sitt innehåll — därför exakt `122px = 69+53`, dvs.
`.m-row`+`.m-searchbar` — `.mt-mobile` räknas INTE in, den är ett syskon
till `#mHeader`, inte ett barn, se korrigeringsnoten högst upp och §E).

**⚠️ Korrigerat 2026-09-01 (se korrigeringsnoten högst upp): `height:
auto!important` är NÖDVÄNDIGT men INTE TILLRÄCKLIGT ensamt.** Så länge
`.nh-mobile-trust` fortfarande monteras som barn till `#store-header`
(dagens faktiska DOM, se §E) skulle en ren `height:auto`-fix låta
trust-radens ~52–104px räknas in i headerns autohöjd och göra HELA
headern (inkl. trustraden) permanent fixed — cirka 174px+, aldrig
bortscrollbar, olikt facit där bara `122px` är fixed/sticky och
mikrotrusten scrollar bort separat. **Rätt ordning: flytta först
`.nh-mobile-trust` ut ur `#store-header` till `#store-main` (§E), lägg
sedan till `height:auto!important` på den nu mindre headern** (main-rad
+ sökrad ≈122px, se §E "Vilket slutmått headern får").

**Källregel att ändra:** ingen befintlig `css/21`-regel orsakar
100px-taket — regeln som "vinner" är plattformens egen
`header{height:var(...)}`. Fixen är att LÄGGA TILL en ny, mer specifik
regel i `css/21-header-v2.css`: `#store-header.nh-header-v2 { height:
auto !important; min-height: 0; }` — samma `!important`-mönster som
redan används överallt annars i filen för att slå ut nativa temaregler
(dokumenterat i STATUS.md: "ALLA nya textfärger på element inuti
`#store-header` behöver troligen samma `!important`-behandling", nu
bekräftat gälla `height` också) — **men bara EFTER §E:s DOM-flytt är
gjord, inte före eller istället för den.**
**Riskflagga:** `var(--header-height)`/`--header-height-touch` kan
användas av ANDRA temaregler (t.ex. `scroll-padding-top`, andra sidors
sticky-offsets) — en `height:auto`-override på just detta element bör
vara säker (påverkar bara detta elements egen box), men bör verifieras
mot en icke-startsida (kategori/produkt) innan release, eftersom
`#store-header` är delad DOM över hela sajten (se §E, redan verifierat
att `#store-header`/`#store-main`-relationen är identisk på alla tre
sidtyper — bara den visuella `height:auto`-effekten återstår att
verifiera visuellt vid implementation).

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
2. **Ny, efter granskningen**: ska konto-/varukorgsikonernas nativa
   `fill`-baserade SVG:er BYTAS UT mot facits `stroke`-baserade
   linjeikoner för sann 1:1 (se DOM-mappning rad 5–6, §D)? Det är en
   markup-swap på ett nativt element (fortfarande bara ikoninnehållet,
   inte länken/knappens funktion), inte en ren CSS-fix — större
   avvägning än övriga punkter i denna spec. Inte beslutad här.
3. **Ny, efter granskningen**: varukorgsbadgens position/mått-regel
   (§D punkt 8) måste samexistera med `css/05-info-section-info-html-
   ersatter-test.css`s befintliga färg-regel (rad 641–647, `!important`)
   för samma `.badge`-element. Vinner den nya regeln på specificitet
   (`#store-header.nh-header-v2 .cart-button .badge` mot `#store-header
   .cart-button .badge`) utan att själv behöva `!important`, eller
   behöver den det också? Verifiera vid implementation, inte antaget här.
3b. **Ny, efter granskningen**: badgens FÄRG är redan medvetet satt en
   gång tidigare (`css/05`, ljusgrön `#cdfc9f`/mörk text — kommentaren
   säger "light green (Figma), dark text — no black/red", dvs ett
   tidigare, dokumenterat designval). Facit använder orange `#c96a26`.
   Ska den äldre gröna färgen behållas (kan vara ett fortfarande giltigt
   Figma-beslut) eller bytas mot facits orange för 1:1? Inte avgjort av
   denna spec — fråga Vilmer innan implementation.
4. `#store-header{height:auto!important}`-fixen (§F, förutsätter §E:s
   DOM-flytt gjord FÖRST) bör testas mot minst en kategori-/produktsida
   (inte bara startsidan) innan release, eftersom `--header-height-touch`
   är en delad, sajtomfattande native-variabel.
5. §E:s öppna fråga om ett eventuellt nativt loading-skeleton som
   `#store-main`s riktiga första barn innan sidans data laddat klart —
   inte verifierat i denna omgång.
6. `.m-row`→`.main`-paddingändringen (`4px 0` → `12px` runt om, §D
   punkt 3) bör stämmas av visuellt mot den redan portade
   `grid-template-columns:1fr auto 1fr` innan den låses — ingen känd
   konflikt, men inte visuellt verifierad i denna spec.
