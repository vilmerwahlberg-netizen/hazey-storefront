# Portningsspecifikation: Mobil hero (+ direkt anslutande qfind-chips)

**Status: LÄSSKYDDAD RESEARCH — inte implementerad.** Ingen produktionsfil
(`css/22-homepage-v2.css`, `js/18b-homepage-v2.js`, eller någon
headerfil) är ändrad för att ta fram den här blueprinten. Alla siffror
nedan är LIVE uppmätta (Playwright + `getComputedStyle`/CDP
`getMatchedStylesForNode`), inte lästa/gissade ur källkod, och
verifierade vid samtliga tre breddpunkter Vilmer begärde: **390/430/
600px**. Facit: `http://localhost:8765/index.html#/`. Implementation:
`https://hazeyse.nyehandel.se/` + injicerad `hazey.css`/`hazey.min.js`
(skrivskyddat, samma metod som `preview.mjs`/`tests/parity-sections.mjs`).

**Viktig skillnad mot header-blueprinten:** mobil hero är INTE
oimplementerad. `.nh-hero-v2`/`.nh-qfind-hero` finns redan i
`css/22-homepage-v2.css` (rad 1–66, 468–542) och
`js/18b-homepage-v2.js` (`nhHeroQfindHtml`, rad 30–100), byggd i en
tidigare omgång (`initHomepageV2`, 2026-08-31). DOM-strukturen är i
grunden RÄTT (samma nästling som facit: sektion → bild → inner →
eyebrow/h1/p/cta). Det som saknas är nästan uteslutande samma
**mönster som header-kalibreringen redan löste en gång**: skrivna men
inte `!important`-skyddade CSS-regler som tyst förlorar mot Nyehandels
nativa tag-nivå-resets, plus några strukturella luckor (maxbredd,
bild-filter, CTA-sekundärknappens formspråk). Se §F för fullständig
rotorsaksgenomgång.

---

## A. DOM-mappning

| Facit (prototyp) | Implementation (repo) | Kommentar |
|---|---|---|
| `#mVp .hero` | `.nh-hero-v2` (även `.nh-qfind-hero`, samma element) | Sektionsroten. Facit: `<section class="hero">`. Impl: `<section class="nh-hero-v2 nh-qfind-hero" style="background-image:url(...)">`. |
| `#mVp .hero .hero-bg` (`<img>`) | Ingen egen nod — `background-image` på `.nh-hero-v2` självt | **Teknikval, inte en bugg.** Facit lägger bilden som ett absolut-positionerat `<img object-fit:cover>`; impl målar den som CSS `background-image` på sektionen. Visuellt likvärdigt resultat är möjligt med båda teknikerna (även `filter` går att sätta på ett element med `background-image`) — föreslår ATT BEHÅLLA `background-image`-tekniken, inte byta till `<img>`, se §D. |
| `#mVp .hero:after` (scrim/gradient) | `.nh-qfind-hero::before` | Finns, men annan gradient-form — se §B/§F punkt 4. |
| `#mVp .hero .hero-inner` | `.nh-hero-v2__inner` | Finns, men `display:block` + fast `max-width:520px` i stället för facits `display:flex;flex-direction:column;justify-content:flex-end;width:76%` — se §F punkt 3. |
| `#mVp .hero .eyebrow` | `.nh-hero-v2__eyebrow.nh-hero-v2__eyebrow--mobile` | Finns (och en separat `--desktop`-variant, korrekt dold på mobil, se rad 491–495). |
| `#mVp .hero h1` | `.nh-hero-v2 h1` (ren `<h1>`, ingen egen klass) | Samma text ("Hitta rätt utan att kunna allt."). Saknar `max-width` → radbryter fel, se §F punkt 2. |
| `#mVp .hero p` | `.nh-hero-v2__p--mobile` (+ separat `--desktop`-variant med annan text) | Mobiltexten är IDENTISK med facit ("Sök direkt eller jämför på innehåll, format och framställning."). Desktop-varianten har en annan, redan tidigare godkänd text — utanför denna blueprints scope (mobil). |
| `#mVp .hero .hero-cta .btn-solid` (`<a href="#m-populara-vagar">`) | `.nh-hero-v2__cta .btn-solid` (`<a href="#populara-vagar">`) | **Länken är FUNKTIONELL på båda sidor** — pekar på respektive sidas riktiga "Populära vägar"-sektion (olika id, samma verkliga mål). Se §C för stylingskillnader. |
| `#mVp .hero .hero-cta .hero-link` (`<button data-open-hr="1">`) | `.nh-hero-v2__cta .hero-link` (`<button type="button" data-open-hr="1">`) | **Funktionell på båda sidor.** Impl:s knapp fångas redan av den globala `[data-open-hr]`-delegaten i `js/18a-header-v2.js:219-222` (`nhInitHittaRatt`) som öppnar en riktig "Hitta rätt"-låda (`#hrDrawer`/`#hrScrim`) — verifierat i kod, inte en stubb. `type="button"` (impl) vs inget `type`-attribut (facit) är funktionellt likvärdigt, inte en bugg. |
| — (finns inte i facits mVp-flöde) | `.nh-qfind` (chipsraden "Vad söker du?") | **Bekräftat INTE ett mobilt gap.** `css/22-homepage-v2.css` rad 549 (`.nh-qfind{display:none}`, bara `@media(min-width:861px)` visas den) — koden har redan en kommentar (rad 547-548) som dokumenterar att detta uppmättes 2026-09-01: `#mVp` har ingen qfind-rad i facit, döljs därför helt under 861px. Tar noll layoututrymme vid 390/430/600px — bekräftat via denna omgångs egen geometrimätning (se §B, gapet hero→"Populära serier" stämmer nästan exakt). Inget att åtgärda i den här blueprinten. |
| `#m-populara-serier` (nästa sektion) | `#populara-serier` (nästa sektion) | Kommer direkt efter hero på båda sidor vid mobila bredder (se ovan). |

**Ingen ikon-geometri att kontrollera i hero** (till skillnad från
header/mikrotrust) — hero innehåller inga SVG-ikoner på mobil, bara
text + två knappar. `tests/typography-icon-checks.mjs`s ikonverktyg
blir alltså inte relevant för hero specifikt, bara typografidelen.

---

## B. Geometri (390 / 430 / 600px, LIVE uppmätt)

Alla värden dokument-absoluta (`getBoundingClientRect().top + scrollY`),
mätta direkt efter en färsk sidnavigering (samma metodik som
header-paketgeometrin, se `tests/parity-sections.mjs`).

### Sektionens box (hela hero-kortet)

| | 390px | 430px | 600px |
|---|---|---|---|
| **Facit top/bottom** | 192 / 430 | 192 / 430 | 192 / 430 |
| **Impl top/bottom** | 191.6 / 429.6 | 191.6 / 429.6 | 191.6 / 429.6 |
| **Facit höjd/bredd** | 238 / 342 | 238 / 382 | 238 / 552 |
| **Impl höjd/bredd** | 238 / 370 | 238 / 410 | 238 / 580 |
| **Facit margin** | `10px 10px 18px` | samma | samma |
| **Impl margin** | `10px 10px 18px` | samma | samma |

**Höjd, position och yttermarginal är REDAN EXAKT porterade** (samma
`!important`-skyddade `margin`/`min-height:238px` från
`css/22-homepage-v2.css` rad 58-64) — ingen åtgärd behövs här. Bredden
skiljer sig med exakt 28px vid varje breddpunkt (impl bredare) — det är
`margin:10px 10px 18px` (impl) mot facits `margin:10px 10px 18px` PLUS
en extra 14px vänster/högermarginal på `#mVp`s egen `.body-wrap`
(facits container har egen sidopadding utöver hero:ns egen marginal;
impl:s `#store-main` har mindre sidopadding vid dessa bredder) — samma
kända, redan dokumenterade `#store-main`-offset-mekanik som header-
rundorna redan hanterar via `nhSyncMainOffset`, inte en ny bugg. Inte
undersökt djupare här eftersom det INTE är i scope för denna blueprint
(det är en `#store-main`/body-wrap-fråga, inte en hero-specifik regel)
— flaggas ändå så nästa implementationsomgång inte blir förvånad.

### `border-radius` / `overflow` / `box-shadow` / bakgrund

| Egenskap | Facit | Impl | Match? |
|---|---|---|---|
| `border-radius` | `22px` | `22px` | ✅ Exakt |
| `overflow` | `hidden` | `hidden` | ✅ Exakt |
| `box-shadow` | `rgba(92,57,24,.72) 0 17px 34px -24px` | samma | ✅ Exakt |
| `background-color` (fallback bakom bilden) | `rgb(74,74,37)` (`#4a4a25`) | `rgb(44,54,32)` (`var(--nh-green)`) | ❌ Fel fallback-färg (se §F punkt 6) |
| `border` | `1px solid rgba(183,129,69,.18)` | `0 none` (ingen) | ❌ Saknas helt (se §F punkt 6) |

### Bildasset

| | Facit | Impl |
|---|---|---|
| Fil | `hero-westcoast-v4.jpg` (1607×979) | **SAMMA fil** — men served från `http://localhost:8767/` (`NH_PROTO_ASSETS`), med en dokumenterad `data-hero-fallback` till nyehandels egen, redan konfigurerade hero-bild om localhost-hämtningen misslyckas |
| `object-fit`/motsvarighet | `cover` | `background-size:cover` (samma visuella effekt, annan teknik — se §A) |
| `object-position` | `50% 50%` (center center) | `50% 50%` | ✅ Exakt |
| `filter` | `saturate(1.06) brightness(1.12) sepia(.045)` | **`none` — saknas helt** | ❌ (se §F punkt 5) |

**Öppen fråga, inte att gissa på:** `http://localhost:8767/` är
uttryckligen flaggad i kodkommentaren (`js/18b-homepage-v2.js` rad
23-28) som "ALDRIG i produktionskod... måste bytas mot riktiga,
produktionshostade foton innan lansering". Det är INTE löst av denna
blueprint — bara omdokumenterat att det fortfarande gäller. Se §G.

### Avstånd till nästa sektion ("Populära serier")

| | 390px | 430px | 600px |
|---|---|---|---|
| Facit: hero-bottom → `#m-populara-serier`-top | 430 → 448 (**18px**) | samma | samma |
| Impl: hero-bottom → `#populara-serier`-top | 429.6 → 447.6 (**18px**) | samma | samma |

**Redan i princip exakt porterat.** Ingen åtgärd behövs för själva
gapet.

### Skillnader mellan 390/430/600px

- **Facit hero-boxen (yttre kort) är IDENTISK vid alla tre
  breddpunkter** — ingen egen CSS-brytpunkt mellan 381px och 860px
  träffar `.hero`/`.hero-inner`/`.eyebrow`/`h1`/`p` (källan har en
  brytpunkt vid `max-width:380px`, under alla tre testbredderna, och en
  vid `min-width:620px` som bara träffar `.mt-mobile`/mikrotrust, inte
  hero). Verifierat live, inte bara läst ur källan.
- **Ett enda mätbart undantag hittat:** facits `.hero-cta .btn-solid`
  är 50px hög vid 390/430px men **42px vid 600px** (samma nedre kant,
  412px, vid alla tre — det är alltså top:et som flyttar sig 8px, inte
  en enkel padding-ändring på knappen själv). CDP-matchningen visar
  IDENTISKA vinnande regler vid 430 och 600px för knappens egna
  padding/font-size — orsaken ligger alltså sannolikt i hur `.hero-cta`
  (flex-raden) fördelar korshöjd mellan `.btn-solid` och `.hero-link`
  vid olika bredder, inte i en enskild breddpunkts-specifik regel för
  knappen själv. **Inte fullständigt rotorsakad denna omgång** — flaggas
  som ett öppet spår att slutföra med en riktig CDP-spårning av HELA
  `.hero-cta`-raden (inte bara knappen) när implementationen påbörjas,
  inte gissat här.
- **Impl:s `h1`-storlek skiftar mellan 430 och 600px** (24px → 28.8px)
  — men det beror INTE på vår egen kod. Rotorsakat via CDP till
  Nyehandels egen nativa, `!important`-märkta responsiva
  rubrikstorlek: `h1{font-size:2.25rem!important}` (bred),
  `h1{font-size:1.8rem!important}` (~600px, 28.8px),
  `h1{font-size:1.5rem!important}` (~390-430px, 24px) — native
  brytpunkter, inte våra. Facit har INGEN motsvarande variation (fast
  26px vid alla tre bredder, egen font, egen storlek). Det här försvinner
  automatiskt när `h1`-regeln nedan får `!important` + rätt egen
  `font-size`, se §F punkt 1.

---

## C. Typografi (390px, samma mönster gäller 430/600 — se §B för var det skiljer)

Mätt med `tests/typography-icon-checks.mjs`s `measureTypography`.

| Nod | Egenskap | Facit | Impl | Rotorsak |
|---|---|---|---|---|
| `.eyebrow` | font-family | `-apple-system, system-ui, ...` | `Nunito, Helvetica, Arial, Lucida, sans-serif` | §F.1 (ärvd från `body`, ingen egen regel) |
| | font-size | `9px` | `10.5px` | Vår egen (redan skriven) regel, bara fel värde — inte en native-konflikt |
| | letter-spacing | `1.17px` (`.13em` @ 9px) | `0.945px` (`.09em` @ 10.5px) | Vårt eget värde är fel (skrevs mot en äldre, felaktig mätning) |
| | font-weight | `700` | `700` | ✅ Redan rätt |
| `h1` | font-family | `"Iowan Old Style", ...` serif | `Roboto, Helvetica, Arial, Lucida, sans-serif` | §F.1 — native `h1,h2,...{font-family:Roboto!important}` |
| | font-size | `26px` (fast, alla 3 bredder) | `24px`/`24px`/`28.8px` | §F.1 — native responsiv `h1{font-size:...!important}` |
| | font-weight | `600` | `600` | ✅ Råkar redan matcha (native råkar också sätta 600) |
| | line-height | `26.26px` (~1.01) | `28.8px` (native `1.2!important`) | §F.1 |
| | letter-spacing | `-0.312px` | `0.32px` | §F.1 — native `,a{letter-spacing:.02em!important}` träffar INTE h1 direkt, men vår egen regel saknar `!important` mot en annan native h1-regel |
| | max-width | `247px` (`9.5em`) | `none` | Saknas helt i vår CSS — se §F.2 |
| | text-shadow | `0 2px 16px rgba(0,0,0,.28)` | `none` | Saknas helt i vår CSS |
| `p` (mobil) | font-family | system-ui | `Nunito, Helvetica, ...` | §F.1 |
| | font-size | `12px` | `16px` | §F.1 — native `...,a{font-size:16px!important}` |
| | font-weight | `400` | `500` | §F.1 |
| | letter-spacing | `normal` | `0.32px` | §F.1 |
| `.btn-solid` | font-family | system-ui | `Nunito, ...` | §F.1 |
| | font-size | `12.5px` | `16px` | §F.1 |
| | font-weight | `650` | `500` | §F.1 |
| `.hero-link` | font-family | system-ui | `Nunito, ...` | §F.1 |
| | font-size | `13px` | `16px` | §F.1 |
| | font-weight | `650` | `500` | §F.1 |

**Alla dessa (utom eyebrowens egna två felskrivna värden) spårar till
EXAKT samma felklass som header-kalibreringens KORRIGERING 3** — se
§F.1 för den fullständiga, en gång för alla-förklaringen i stället för
att upprepa den per rad.

---

## D. CTA-knapparnas fullständiga geometri/styling

### "Utforska sortimentet" (`.btn-solid`, `<a>`)

| Egenskap | Facit | Impl |
|---|---|---|
| `border-radius` | `22px` | `999px` (visuellt ~identiskt vid denna höjd, ingen åtgärd nödvändig) |
| `border` | `1px solid rgb(44,54,32)` (mörkgrön, synlig accentlinje) | `1px solid rgb(217,120,47)` (samma som bakgrunden — osynlig) |
| `background` | `rgb(217,120,47)` | `rgb(217,120,47)` | ✅ Exakt |
| `box-shadow` | `0 8px 20px -12px rgba(77,35,10,.8)` | `none` |
| `padding` | `9px 14px` | `12px 20px` |
| `min-height` | `42px` | `auto` (ingen egen min-height satt) |
| `color` (text) | `rgb(255,250,242)` | `rgb(255,255,255)` (nästan samma, litet men verkligt avvikande värde) |
| `href` | `#m-populara-vagar` | `#populara-vagar` | ✅ Funktionellt likvärdigt (se §A) |

### "Hjälp mig →" (`.hero-link`, `<button>`)

**Detta är den STÖRSTA rent visuella avvikelsen i hela hero-komponenten** —
inte bara en typografidetalj. Facit stylar `.hero-link` som en fylld
piller-KNAPP (samma familj som `.btn-solid`, sekundär variant); impl
stylar den fortfarande enligt en ÄLDRE textlänk-behandling
(troligen kvar från det första, sedan övergivna reskin-försöket mot
`.slideshow__slides__slide`, se §F.3):

| Egenskap | Facit | Impl |
|---|---|---|
| `border-radius` | `22px` (piller) | `0px` (ingen) |
| `border` | `1px solid rgba(255,242,221,.7)` (hel kant, alla sidor) | `none` (bara `border-bottom` i äldre regel) |
| `background` | `rgba(45,49,24,.14)` (svagt mörk fyllning) | transparent |
| `padding` | `0 11px` | `1px 6px` |
| `min-height` | `42px` | `auto` (renderad höjd 28.6px — 13px lägre än facit) |
| `text-decoration` | `none` | `none` (redan rätt, `border-bottom` simulerar understrykning i äldre regel) |

---

## E. Overlay/gradient och bild-behandling

Facits `.hero:after` (två lager, på PSEUDO-elementet, ovanpå bilden,
under texten):
```css
background:
  linear-gradient(0deg, rgba(119,68,26,.11), rgba(119,68,26,0) 46%),
  linear-gradient(90deg,
    rgba(34,41,19,.52) 0%, rgba(39,43,21,.31) 42%,
    rgba(69,51,26,.09) 61%, rgba(112,70,31,0) 76%);
```
Effekt: en svag varm vertikal ton över HELA kortet, plus en STARK
horisontell mörk→transparent gradient som bara täcker vänstra ~76%
(textsidan) — högra ~24% av fotot förblir ljust synligt, orört.

Impl:s `.nh-qfind-hero::before` (ett lager, enklare):
```css
background: linear-gradient(180deg, rgba(44,54,32,.55) 0%, rgba(30,39,22,.88) 100%);
```
Effekt: EN enhetlig, kraftig vertikal mörkläggning över hela bredden —
mörkare upptill/nedtill men lika mörk vänster som höger. Detta är
**inte "saknas helt"** (en tidigare grov läsning av mätdatan i denna
research antog fel pseudo-element, `::after` i stället för `::before`
— rättat här efter att ha läst källkoden direkt) — men det är en
verklig, synlig strukturell skillnad: fotots högra sida mörkläggs i
impl på ett sätt facit aldrig gör, vilket är en del av varför skärm-
dumparna (se `tests/results/_hero-blueprint/*.png`) visar mindre synligt
bildinnehåll (bil/växt/förpackning) på höger sida i impl än i facit.

Bild-filter: facit `saturate(1.06) brightness(1.12) sepia(.045)` på
bilden — en subtil varm färggradering. Impl har `filter:none` — helt
frånvarande, ingen motsvarande regel finns någonstans i
`css/22-homepage-v2.css`. `filter` fungerar likvärdigt på ett element
som målas med `background-image` som på en `<img>` — kräver alltså
INTE en strukturell DOM-ändring att lägga till, bara en ny
deklaration.

---

## F. Grundorsaker (inte bara symptom)

### F.1 — Samma native-override-mönster som header, nu bekräftat i hero

Verifierat via CDP `getMatchedStylesForNode` mot den riktiga
implementationen: Nyehandels bastema har (minst) dessa breda,
`!important`-märkta tag-nivå-regler som tyst vinner över hero:ns egna,
icke-`!important`-märkta deklarationer:
```css
h1,h2,h3,h4,h5,h6{ font-family:"Roboto",Helvetica,Arial,Lucida,sans-serif !important; font-weight:600 !important; line-height:1.2 !important; }
h1{ font-size:2.25rem !important; }   /* bred */
h1{ font-size:1.8rem !important; }    /* ~600px */
h1{ font-size:1.5rem !important; }    /* ~390-430px */
body,p,li,span,input,button,label,td{ font-family:"Nunito",Helvetica,Arial,Lucida,sans-serif !important; font-weight:500 !important; font-size:.9rem !important; line-height:1.6 !important; }
body,p,li,span,input,button,label,td,a{ font-size:16px !important; letter-spacing:.02em !important; }
a{ font-family:"Nunito",...!important; font-weight:500 !important; font-size:.9rem !important; }
```
Detta är EXAKT samma felklass som `tests/blueprints/mobile-header-port.md`
"KORRIGERING 3" redan dokumenterat och löst för header/sökfält/
mikrotrust — se CLAUDE.md "Parity-workflow" för den nu permanenta
regeln. Lösningen är identisk i karaktär: varje text-CSS-regel i hero
(`.nh-hero-v2__eyebrow`, `.nh-qfind-hero h1`, `.nh-qfind-hero p`,
`.nh-qfind-hero .btn-solid`, `.nh-qfind-hero .hero-link`) behöver
`!important` på font-family/font-size/font-weight/line-height/
letter-spacing, PLUS att eyebrow-regeln (som idag saknar en egen
`font-family` helt) behöver en explicit `font-family` tillagd — den
ärver annars tyst `body`s nativa Nunito.

### F.2 — `h1{max-width}` saknas helt (inte en prioritetsfråga, en riktig lucka)

Ingen regel i `css/22-homepage-v2.css` sätter `max-width` på hero:ns
`h1` vid mobila bredder (bara en `font-size:44px`-override vid
`min-width:861px`, rad 540). Facits `max-width:9.5em` (≈247px vid
26px) är en AVSIKTLIG designdetalj — den tvingar fram exakt den
tvåradiga radbrytningen ("Hitta rätt utan att / kunna allt.") som är
en del av hero-kortets komposition. Utan den flyter H1:an ut över hela
`.nh-hero-v2__inner`s bredd och blir enradig — bekräftat i alla tre
breddpunkternas skärmdumpar.

### F.3 — `.nh-hero-v2__inner` är strukturellt fel bredd/layout

Facit: `display:flex; flex-direction:column; justify-content:flex-end;
width:76%` (av hero-kortet, alltså relativ, inte fast) — texten är ett
BOTTEN-förankrat block som bara upptar vänstra ~3/4 av kortet, så att
högra ~1/4 av fotot alltid syns fritt.

Impl: `display:block` (standard); `max-width:520px` (fast pixelvärde,
inte relativt) — vid mobila bredder (390-600px) är hero:n själv aldrig
bredare än ~580px, så `max-width:520px` blir i praktiken verkningslös
(inner-elementet tar nästan HELA kortets bredd, inte 76%). Detta
förklarar samtidigt:
- Varför eyebrow INTE radbryter i impl (för gott om plats) fast den gör
  det i facit (bekräftat en direkt följdeffekt, inte en egen bugg att
  fixa separat).
- Varför fotots högra sida inte syns lika tydligt i impl (texten/scrimet
  ligger över hela bredden i stället för bara vänster 76%).

`justify-content:flex-end` saknas också — impl:s textblock växer
uppifrån (`block`-flöde) i stället för att vara förankrat mot kortets
nederkant, vilket är varför absoluta y-positioner för eyebrow/h1/p
skiljer sig mellan sidorna trots att kortets TOTALA höjd redan är
identisk (238px, se §B).

### F.4 — Bildfilter och asymmetrisk scrim: se §E, inte upprepat här

### F.5 — `.hero-link`s knappformspråk kommer från en övergiven kodväg

`css/22-homepage-v2.css` rad 1-53 innehåller CSS skriven för ETT annat
markup-mönster (`.nh-hero-v2 .slideshow__slides__slide h2`/
`.button.is-primary`/`.slideshow__slides__slide__content`) — alltså ett
tidigare försök att reskinna nyehandels NATIVA slideshow-DOM direkt.
Den koden matchar ingenting i den nuvarande, faktiskt renderade
markupen (`nhHeroQfindHtml` bygger sin EGEN `<section>` och döljer
slideshowen helt, se `initHomepageV2` rad 486). Den är alltså i
praktiken DÖD CSS idag (matchar ingen nod), och samtidigt en möjlig
förklaring till varför `.hero-link` (rad 532-536, en SENARE, korrekt
riktad regel för den nya markupen) ändå bara ger en enkel
understruken-text-behandling — den blev troligen skriven som en
återhållsam sekundärlänk innan Vilmers riktiga facit (piller-knapp)
lästes noggrant för just den här komponenten. Inte en cascade-bugg,
bara en regel som behöver skrivas om till piller-knapp-formspråket i
§D.

**Öppen fråga att ta ställning till vid implementation:** ska den döda
`.slideshow__slides__slide`-CSS:en (rad 1-53) tas bort som en del av
hero-arbetet (den matchar inget, är ofarlig men förvirrande att läsa),
eller lämnas orörd tills vidare? Föreslår borttagning eftersom den inte
längre beskriver verklig markup, men detta är en scope-fråga Vilmer bör
godkänna explicit (CLAUDE.md: "Ta aldrig bort befintligt innehåll utan
explicit lov" — gäller här kod, inte kundinnehåll, men samma
försiktighetsprincip).

### F.6 — Fallback-bakgrundsfärg och kantlinje

`background-color` (synlig i bråkdelen av en sekund innan bilden
target, eller om bilden av någon anledning inte laddar) är
`var(--nh-green)` (`#2c3620`) i impl mot facits egna, specifikt
uppmätta `#4a4a25`. `border:1px solid rgba(183,129,69,.18)` saknas
helt i impl. Båda är enkla, fristående tillägg — inga cascade-konflikter
inblandade, bara värden som aldrig skrevs.

---

## G. Öppna frågor (inte beslutade av denna blueprint)

1. **Bildkälla `http://localhost:8767/`** — redan flaggad i kodens
   egna kommentarer som ett pre-launch-blockerande problem. Måste
   ersättas med en riktig, produktionshostad bild-URL innan lansering.
   Var ska den hostas (Nyehandels egna mediabibliotek? Samma CDN som
   `hazey.css`?) är en fråga till Vilmer, inte något att gissa på här.
2. **Döda CSS-regler för `.slideshow__slides__slide`** (§F.5) —
   föreslår borttagning, men inte beslutat.
3. **`.hero-cta .btn-solid`s 8px höjdskillnad vid 600px** (§B) — inte
   fullständigt rotorsakad, kräver en dedikerad CDP-spårning av hela
   `.hero-cta`-radens flex-fördelning innan implementation, inte en
   gissad fix.
4. **`#store-main`/body-wrap-sidopaddingen** som förklarar breddskillnaden
   i §B — utanför denna blueprints scope (påverkar alla sektioner, inte
   bara hero), flaggas men löses inte här.

---

## H. Föreslagen filavgränsning för godkännande

Om/när denna blueprint godkänns för implementation, samma
pathspec-disciplin som header-rundorna (aldrig `git add -A`):

- `css/22-homepage-v2.css` — lägg till `!important` på befintliga
  text-regler (§F.1), lägg till `h1{max-width}` (§F.2), skriv om
  `.nh-hero-v2__inner` till flex/column/flex-end/76%-bredd (§F.3),
  lägg till bildfilter (§F.4/§E), skriv om `.hero-link` till
  piller-knapp (§D/§F.5), lägg till fallback-bakgrund+border (§F.6).
  Eventuellt ta bort de döda `.slideshow__slides__slide`-reglerna
  (§F.5, kräver Vilmers OK först).
- `js/18b-homepage-v2.js` — sannolikt INGEN ändring behövs (markupen
  är redan strukturellt rätt) — bekräfta detta under implementation
  snarare än att anta det.
- `tests/blueprints/mobile-hero-port.md` — denna fil, uppdateras med
  eventuella KORRIGERING-avsnitt om en visuell granskningsrunda hittar
  fler avvikelser (samma mönster som header).
- `STATUS.md` — ny daterad post.
- **Rör INTE:** `css/21-header-v2.css`, `js/18a-header-v2.js` (låst
  baseline, commit `f9e9854`), Populära serier/vägar-CSS/JS, desktop-
  specifika regler (`min-width:861px`-block i samma filer — dessa är
  redan godkända i en tidigare omgång och utanför denna blueprints
  mobila scope).

---

## I. Testplan (plan, inte implementerad — ingen ändring gjord i `tests/parity-sections.mjs` eller `tests/home-parity.spec.mjs` för detta)

1. **Isolerad hero-pixelparitet** — redan skaffoldad
   (`tests/parity-sections.mjs` `SECTIONS`, `key:"hero"`,
   `facitSelector:"#mVp .hero"`, `implSelector:".nh-hero-v2"`,
   `maxDiffRatio:0.35` — högre tolerans redan medvetet satt pga.
   bildinnehåll). Körs redan varje `npm run parity`, väntas gå från
   dagens grova FAIL till en verklig, meningsfull jämförelse efter
   implementation.
2. **Paketgeometri mikrotrust → hero → Populära serier** — utöka
   `PACKAGE_GEOMETRY_SELECTORS`/`measurePackageGeometry` (i dag
   stannar vid `hero`) med en femte nyckel `series`:
   `facit:"#m-populara-serier"`, `impl:"#populara-serier"`, samma
   `gap`-mönster som redan finns för `gapSearchTrust`/`gapTrustHero`
   (`gapHeroSeries = series.top - hero.bottom`), samma tolerans
   (`PACKAGE_GEOMETRY_GAP_TOLERANCE_PX`). Facit-golden
   (`header-package-geometry.json`) behöver regenereras
   (`npm run parity:update`) med det nya fältet.
3. **Funktionella CTA-länkar** — ett nytt, litet Playwright-test:
   klicka `.nh-hero-v2 .btn-solid`, vänta på scroll/`:target`, assert:a
   att `#populara-vagar` blir synlig i viewport; klicka
   `.nh-hero-v2 .hero-link`, assert:a att `#hrDrawer` blir `hidden:false`
   (samma mönster som `nhInitHittaRatt` redan exponerar).
4. **Ingen overflow** — redan täckt av befintligt
   `hasHorizontalOverflow`-test, ingen ny kod behövs, bara verifiera
   att det fortsatt passerar efter hero-ändringarna.
5. **Home/kategori/produkt-regression** — samma manuella
   injektionskontroll som header-rundorna använde
   (`hazey.css`/`hazey.min.js` injicerat på en riktig kategori- och
   produktsida) — hero syns bara på startsidan, så detta steg blir i
   praktiken en bekräftelse av att INGET annat på kategori-/
   produktsidor påverkas (CSS-selektorerna är redan `.nh-hero-v2`/
   `.nh-qfind-hero`-scopade, ingen global selector-läcka förväntad,
   men ska verifieras live, inte antas).
6. **Desktop helt orörd** — hero:ns desktop-regler
   (`@media(min-width:861px)`, rad 492-542 i `css/22-homepage-v2.css`)
   rörs inte av något i denna blueprint (allt scope är
   `@media(max-width:860px)`/bas-reglerna som bara syns mobilt) —
   verifiera efteråt med samma 1440px-kontroll som header-rundorna
   (headerhöjd, ingen overflow, hero:ns egen `min-height:420px`-layout
   oförändrad).

---

## Sammanfattning för snabb avstämning

Hero-DOM:en är redan i grunden rätt byggd — det här är INTE ett nytt
bygge, det är samma typ av kalibreringsrunda som header redan gått
igenom. Fem konkreta, live-rotorsakade luckor innan komponenten kan
godkännas:
1. `!important` saknas på redan skrivna text-regler (samma mönster som
   header, nu bekräftat i hero också).
2. `h1{max-width}` saknas — H1:an radbryter fel utan den.
3. `.nh-hero-v2__inner` behöver bli en 76%-bred, botten-förankrad
   flex-kolumn i stället för ett fast-breddat blockelement.
4. Bildfilter (varm färggradering) och scrim-gradientens form
   (asymmetrisk, textsides-koncentrerad — inte en enhetlig mörkläggning)
   saknas/skiljer sig.
5. "Hjälp mig →" behöver bli en piller-knapp, inte en textlänk — den
   STÖRSTA enskilda visuella skillnaden i komponenten.

Plus två öppna frågor till Vilmer (bildhosting, döda CSS-regler) och en
ej fullständigt rotorsakad detalj (knapphöjd vid 600px) som inte
gissas här utan flaggas för uppföljning.

**Ingenting implementerat. Inget pushat eller deployat.**
