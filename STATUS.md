Klart:
- HANDOFF-CLAUDE-CODE.md uppdelad i CLAUDE.md (permanent kontext) + STATUS.md (denna fil), originalfilen raderad.
- Header v2 och startsida v2 BYGGDA och verifierade visuellt (skärmdumpar i `preview/`, se nedan) — inte bara planerade.
  Nya filer: `css/21-header-v2.css`, `css/22-homepage-v2.css`, `js/18a-header-v2.js`, `js/18b-homepage-v2.js`,
  + boot-anrop tillagt i `js/19-core-close.js`. `node build.js` kört, inga fel.
- Ny devDependency: `playwright` (för `hdr_inspect2.mjs` och `preview.mjs`, se nedan) — kräver riktig Chrome installerad, laddar inga egna browser-binärer.

## Hur headern faktiskt fungerar (viktigt att förstå innan ni ändrar den)

Nyehandel renderar redan en RIKTIG nav-meny (en enda platt "Alla produkter"-megameny,
`.navbar-item.has-dropdown.is-mega` under `nav.navbar .navbar-menu`, med alla ~40
kategorier nästlade). `js/18a-header-v2.js` läser den listan LIVE ur DOM:en varje
sidladdning (inget hårdkodat kategori-facit), klassificerar varje länk med reglerna
nedan, och bygger om presentationen till separata dropdowns (`.nh-cat-row`) som
döljer (inte tar bort) den nativa menyn. Samma sak för mobil — EN datakälla
(`nhBuildNavData`) renderar både desktop-dropdowns och mobilmenyn.

**Klassificeringsregler** (i `js/18a-header-v2.js`, konstanter högst upp i filen):
- Format härleds ur sluggens suffix (`-vapes/-vape/-carts` → vape, `-blommor/-buds` → blomma, `-hasch/-hash` → hash).
- Cannabinoid härleds ur sluggens prefix, bara för de sex Vilmer godkänt 2026-08-28: THCA, THCB, THCV, CBN, H4CBD, CBD.
- **Pausade cannabinoider (HHCPM, THCNM, 10-OH-THC) filtreras bort helt** — syns ingenstans i den nya navigationen. Juridik ej klar (cannabinoidlagstiftning ändrades 2025-12-10), Vilmer beslut 2026-08-28. Ligger kvar som riktiga kategorisidor på sajten, bara inte länkade från den nya headern.
- Serier (Magic Sauce, Nano-11, Faraoh, Tatra Hemp, Magic Farmers, Hero) är explicit listade i `NH_SERIE_OVERRIDES` eftersom namnen inte går att gissa ur sluggen.
- **CBD Group** (cannabinoid utan formatuppdelning) hamnar varken i toppnav eller dropdowns per Vilmers beslut 2026-08-28 (egen landningssida, inte topnav) — och behöver INGEN ny footer-länk: `js/08-footer.js` rad ~168 länkar redan till `/sv/categories/cbd-group` som "CBD". Upptäckt under arbetet, inget nytt att göra där.

## Beslut jag tog själv under bygget (ny arbetsmodell, se memory: feedback-ux-autonomy)

- **Ingen fjärde topnav-flik för cannabinoid.** Eftersom oljor/kapslar inte finns i sortimentet (bekräftat av Vilmer) är cannabinoid inte ett eget format hos er — det blev ett filter INNE i Vapes/Blommor/Hash-dropdownarna istället för en egen kolumn. Bekräftat med Vilmer i chatten innan bygge.
- **"Fler i vapes/blommor/hash"-listan i varje dropdown är begränsad till 6 länkar** (först-i-DOM-ordning, inte prioriterat). Vissa cannabinoid-varianter (t.ex. THCV Vapes, CBN Vapes, H4CBD Vape) kan hamna utanför de 6 om ett format har många undersidor. **Öppen fråga:** vill du att listan ska vara längre, eller grupperad per cannabinoid istället för en platt lista?
- **Faraoh och Hero Vapes klassade som vape-serier** (ingen synlig formatuppdelning i nativ-menyn, så gissat utifrån namnen/tidigare kontext). **Verifiera gärna** att det stämmer.
- **Tatra Hemp och Magic Farmers har inget känt format** — visas just nu i ALLA tre dropdowns (Vape/Blomma/Hash) hellre än att gissa fel. **Öppen fråga:** vilket/vilka format hör de till?
- **Hero-sektionen reskinnas i nyehandels EGEN native slideshow-komponent** (`.template-components__slideshow .slideshow`), inte `blocks/hero.html` — den senare visade sig INTE ligga live vid kontroll 2026-08-28 (troligen en äldre/oanvänd variant). Vi rör bara typografi/färg på den riktiga karusellen, inte dess rotation/JS.
- **Aura byggs som dold platshållare** (`#aura-guiden[hidden]`), helt tom — ingen text skriven, per Vilmers beslut (juridik + terminologi olöst).
- **"Hitta rätt"-guidens steg 2 är cannabinoid (inte känsla/aura)** — matchar varumärkesröst-regeln (aldrig fråga om effekt).
- La till en "18+"-badge i topbaren (ren UI-text, juridiskt krav) — fanns inte i dagens USP-lista.

## Fel som hittades och fixades under visuell testning

- CSS-quirk: `overflow-x: auto` på nav-raden tvingade `overflow-y` att också klippa, vilket gömde alla dropdown-paneler. Fixat (bytte till `flex-wrap`).
- "Hitta rätt"-panelen visades öppen redan vid sidladdning — `hidden`-attributet sattes bara i HTML-strängen, inte explicit i JS. Fixat + en CSS-failsafe (`[hidden]{display:none!important}`) tillagd.
- Mobilmenyn och "Hitta rätt" var monterade inuti `#store-header`, som (får) en `transform` vid scroll (`js/14-header-scroll.js`) — det skapar ett nytt containing block för `position:fixed`-barn, så panelerna klämdes ihop till headerns egen låga höjd istället för att täcka hela skärmen. Fixat genom att montera dem på `<body>` istället.
- Upptäckt (INTE åtgärdat, hör inte till detta jobb): en av de 4 slidesen i den riktiga hero-karusellen har rubriktexten **"Text nmr 2"** — ser ut som en glömd platshållartext i nyehandel-admin, inte skapad av mig. Värt att byta ut i admin när ni ändå är inne där.

## Hur jag testade (säkert, skrivskyddat)

`preview.mjs` (kräver `playwright`, redan installerat): besöker hazeyse.nyehandel.se
som en vanlig besökare (ingen inloggning, rör aldrig Kodläge/admin) och injicerar vår
lokalt byggda `hazey.css`+`hazey.min.js` klient-sidan i en Playwright-styrd
Chrome-flik — motsvarar att klistra in samma kod i webbläsarens devtools-konsol.
Inget sparas till nyehandel. Kör med `node preview.mjs` → skärmdumpar hamnar i
`preview/*.png` (6 st: desktop header+hero, populära vägar, nav-dropdown öppen,
Hitta rätt öppen, mobil header+hero, mobilmeny öppen). Sätt `NH_KEEP_OPEN=1` för att
lämna Chrome-fönstret öppet efter körning (annars stängs det automatiskt — vi har
bara 8 GB RAM att jobba med, se till att inte hopa upp flera körningar utan att stänga).

`hdr_inspect2.mjs` — samma skrivskyddade metod, används för att slå upp riktig DOM/CSS-struktur på sajten (skriver ingenting, bara `console.log`).

**🚩 Nav/mega-meny: för många val, otydlig presentation, kräver omdesign — Vilmer återkommer med riktning.**
(Beslutat 2026-08-28. RÖR INTE `.nh-cat-row`/`.ddrop`/dropdown-innehållet eller mobilmenyns
struktur förrän Vilmer gett ny riktning — `js/18a-header-v2.js`s klassificeringslogik och
`nhBuildNavData`/`nhFormatDropdownHtml`/`nhBuildMobileMenuHtml` ligger orörda som de är.)

## Visuell polish-omgång (2026-08-28, efter nav-flaggan ovan)

Läste prototypens `<style>`-block noggrant (färgtoken, radier, skuggor, spacing,
knappstilar, hero-layout, kortstilar) för att matcha KÄNSLAN, inte bara IA:t.
Rörde INTE `.nh-cat-row`/`.ddrop`/`.mm-*` (nav/mobilmeny) — se flaggan ovan.

- Topbar: gradient (green-deep → green → #3b4728), inte flat färg — matchar prototypens `.trust-bar`.
- Main-row: gradient sand→cream bakgrund, sök-fält pill-form med terra-fokusring, konto/varukorg-ikoner fått rätt radie/hover (sand-bg + terra-deep vid hover).
- "Hitta rätt" byggd om till ett FLYTANDE KORT förankrat nedre högra hörnet (`right:24px;bottom:24px`, rundade hörn runt om) istället för en kant-till-kant-drawer — matchar prototypens `.hr-drawer` exakt. Bakgrundsscrimet tonar nu in/ut mjukt.
- "Populära vägar": kort fick ikon-cirklar (sand-bg, olivgrön ikon, en enkel linje-SVG per format/serie), mindre sec-head-rubrik (19px serif, matchar prototypens mått), hover lyfter kortet -4px med mjuk grön-tonad skugga.
- Ny reveal-on-scroll-animation (`.nh-reveal`, i `css/22-homepage-v2.css`): translateY(24px)→0, cubic-bezier(.25,.46,.45,.94), 0.62s, 90ms stegring (max 4 steg) — de uppmätta värdena i CLAUDE.md, som INTE fanns i prototypfilen själv (de kom från extern benchmark mot tershine.com/dadgrass.com) så byggda från grunden här. Respekterar `prefers-reduced-motion`. Kör via en enkel `IntersectionObserver` i `js/18b-homepage-v2.js` (`nhInitReveal`).
- Nya CSS-tokens tillagda i `css/21-header-v2.css` (radier r-sm/r/r-lg, skuggor shadow-soft/shadow-lift med grön ton `rgba(44,54,32,...)` istället för svart, `--nh-t` transition-timing) — hämtade rakt av från prototypens `:root`, inte gissade.
- **Bugg hittad och fixad:** nyehandels egen temafärg-inställning injicerar en bred `#store-header ... span/a/li { color: ... }`-regel som vann mot flera av mina textfärger (osynligt för konto/varukorg-ikonerna eftersom deras nativa mörkgröna råkar vara nästan identisk med min — men gjorde 18+-badgen helt osynlig, ljus text på ljus text). Löst med riktade `!important` på de element vi medvetet färgsätter. Värt att komma ihåg: ALLA nya textfärger på element inuti `#store-header` behöver troligen samma `!important`-behandling.

## Helsides-omgång (2026-08-29) — "det gick inte att bedöma delar för sig"

Vilmer påpekade rätt: header+hero+populära vägar isolerat, ovanpå en i övrigt
oförändrad startsida, gick inte att bedöma — det ser splittrat ut oavsett hur
bra delarna är var för sig. Utökade därför reskinnet till HELA startsidans
flöde nedanför "Populära vägar", inte bara toppen. Full-sides skärmdumpar:
`preview/FULLPAGE-desktop.png` och `preview/FULLPAGE-mobile.png`.

Det som reskinnades (alla är EGNA, tidigare byggda komponenter — `nh-trust`,
`nh-tabs`/`nh-tab`, `nh-faq` — inte rå nyehandel-native markup, så säkra att
byta färg/typsnitt/radie på utan att röra funktionalitet):
- **Trust-ikonraden** (100% lagligt osv.): sand-bakgrund, systemfont istället för Nunito.
- **Bästsäljare/Nyheter/Kampanjer-tabsen**: pill-knappar utan versaler, grön aktiv-state — matchar nya knappstilen istället för gamla Roboto-versal-stilen.
- **FAQ-sektionen**: sand-bakgrund, seriftitel (matchar "Populära vägar"), vita rundade kort istället för platta.

**Medvetet INTE rört** (flaggar detta öppet, inte bara tyst hoppat över):
- **Produktkorten** (`.product-card`/`.pl-list`) i Bästsäljare/Nyheter/Kampanjer-gridden — dessa återanvänds sitewide på kategori-/produktsidor, utanför uppdragets scope ("header + startsida"), och är redan rätt vitt/rent i grunden. Rör man dem händer det på ALLA sidor, inte bara startsidan — vill du att jag utökar scopet dit?
- **"THCA med flera"-textblocket, kampanjbannern (bilden) och "Hazey"-talespersonsektionen** — dessa ser ut att vara råa innehållsblock (generiska klassnamn, ingen egen `nh-`-komponent att haka i säkert utan risk att träffa andra sidor). Typografin där (rubriker/brödtext) matchar fortfarande INTE det nya designspråket. **Öppen fråga:** vill du att jag identifierar och stylar dessa specifikt, eller ska de bytas ut/skrivas om senare som eget jobb?

**Bugg #2 hittad och fixad (allvarligare än badge-buggen):** nyehandels tema-CSS
återinjicerar sin egen `<style>`-tagg (samma `!important`-regler) EN GÅNG TILL
efter att vår kod körts — så vanlig `!important` + normal specificitet räckte
inte, eftersom bägge sidor har `!important` och då avgör DOM-ordning, och
temats tagg dyker upp sist. Löst med dubblerade klass-selektorer (`.x.x`) för
garanterat högre specificitet oavsett ordning. **Kom ihåg det här mönstret
för allt framtida override-CSS mot befintliga `nh-*`-komponenter.**

## Responsivitetstest (2026-08-29) — 10 bredder, 360–1920px

Vilmer frågade om vi bygger för mobil OCH alla mellanlägen, inte bara de två
breddar vi råkat skärmdumpa (1400/390). Ärligt svar: nej, det hade vi inte
testat. Körde nu en sweep (`preview/responsive/w*.png`): 360, 414, 640, 768,
834, 1024, 1180, 1280, 1440, 1920px.

**Hittade och fixade en lucka:** mellan 601–880px (surfplattbredd) radbröts
den statiska topbar-USP-listan till klumpiga 2 rader — den befintliga
scroll-marquee-lösningen (`css/15-...`) aktiverades bara under 600px. Vår
egen nya brytpunkt för nav-raden ligger vid 880px (dropdown→hamburger), så
vi drog samma linje för marquee-växlingen istället för att lämna en 280px
bred lucka mitt i. Fixat i `css/21-header-v2.css` (ny `@media` som återskapar
marquee-reglerna upp till 880px — glömde `__item`-paddningen/checkmark-ikonen
första försöket, texten flöt ihop utan mellanrum, fixat i samma veva).

Övriga 9 bredder (inkl. mycket liten 360px och mycket stor 1920px) höll utan
problem — ingen text kapad, inga överlappande element, nav-brytpunkten (880px)
fungerar rent åt båda hållen.

**Obs, viktigt att komma ihåg:** hero-BILDEN/rotationen är fortfarande helt
orörd i alla dessa test — vi har bara stylat text/knappar ovanpå, inte bytt
bilder eller byggt om själva karusellogiken (se tidigare anteckning om
`.template-components__slideshow`).

## Uppdrags-scope UTÖKAT (2026-08-29/31) — läs detta innan ni undrar varför nav-flaggan känns inaktuell

Vilmer: migreringen har urartat till att i praktiken skriva om nästan hela
frontend (design + navigation) mot nyehandel, inte bara "header + startsida"
som HANDOFF ursprungligen sa. **Enda uttalade undantagen: produktsidan (PDP)
och blogginlägg** — de rörs inte. Allt annat (nav/mega-meny, kategorisidor,
minicart) är nu i scope.

Vilmer har också bekräftat att nav-flaggan från 2026-08-28 inte längre betyder
"vänta på mig" — han hinner inte tänka igenom den själv, så **jag löser
mega-menyns struktur själv näst**, enligt hans egen stående regel (se memory
`feedback-ux-autonomy`: ta struktur-/UX-beslut utan att vänta på hans ja).

**Ordning Vilmer bad om (2026-08-31): startsidan färdig FÖRST**, innan nav
görs om eller kategorisidor byggs. Det är alltså vad omgången nedan gör.

## Startsidan KLAR-omgång (2026-08-31) — de sista två luckorna städade

Tog tag i de två öppna frågorna från förra omgången (ovan) direkt, eftersom
scopet ändå är utökat nu — inget att vänta på:

- **Produktkorten** (`.pl-list .product-card`): rundade hörn (14px), subtil
  border, lyft-hover med grön skugga — matchar nu "Populära vägar"/resten.
  Systemfont på produktnamn istället för gamla Nunito.
- **De råa innehållsblocken** ("THCA med flera"-texten, "Vad är THCA/THCNM/
  Magic Sauce"-Q&A:n): hittade deras riktiga nyehandel-komponentnamn via
  DOM-inspektion — `.store-startpage .template-components__text-editor` och
  `.store-startpage .template-components__columns`. Scopat till
  `.store-startpage` (nyehandels egen klass för just startsidan) så det
  ALDRIG kan läcka till andra sidor. Bara rubriker/text/länkar fått ny
  typografi (serif-rubriker, rätt färger) — bilderna (kampanjbannern,
  Hazey-talespersonbilden) är helt orörda, inget innehåll borttaget.

Helsidesskärmdumpar uppdaterade (`preview/FULLPAGE-desktop.png` +
`-mobile.png`) — hela startsidan hänger nu ihop visuellt topp till botten,
inklusive de bitar som tidigare stack ut.

**Startsidan bedöms som funktionellt klar** för den här omgången (väntar på
Vilmers slutgranskning innan den stämplas helt godkänd).

## Mobil-fidelitetskoll (2026-08-31) — "prototypen såg helt annorlunda ut i mobil"

Vilmer misstänkte att jag missat/glömt mobilversionen av prototypen (som har
en egen `mVp`-DOM/CSS-gren, ganska olik `dVp`). Verifierade: samma fil
(`ny-header-child.html`, oförändrad sen 2026-08-11 — inte en gammal kopia),
och jag hade läst `mVp` från början. Men jag hade byggt en FÖRENKLAD mobil-
upplevelse (samma innehåll omflutet till smalt läge) snarare än att aktivt
spegla `mVp`:s egna, mer genomtänkta layoutval — vilket är precis vad
CLAUDE.md sa att INTE göra (porta två-träds-uppdelningen), men jag hade nog
tolkat det för bokstavligt och missat att ändå MATCHA känslan i det enskilda
mobilflödet, inte bara strukturen.

Konkret åtgärdat: **"Populära vägar" på mobil** använde tidigare exakt samma
enkolumns-liknande flytande rutnät som desktop. Prototypens `mVp` har ett
tydligt 2-kolumners rutnät med större kort (`.m-routes-grid`). Vårt rutnät
gav redan 2 kolumner på normal telefonbredd (auto-fit räknar ut det), men
låste det nu explicit under 480px så det aldrig glider till 1 kolumn.

**Sidospår, hittat och åtgärdat under tiden:** provade att återanvända
hazey.se:s riktiga kategorifoton (`Kop-cannabis-Vapes-sverige.jpg` m.fl.,
redan i bruk i `blocks/butik-grid.html`) som kortbakgrund för att matcha
prototypens fotokort. Upptäckte att de bilderna har TEXT INBAKAD I BILDEN
("Vapes" osv) — med vår egen rubrik ovanpå blev det dubbel/krockande text.
Rullade tillbaka till ikon-korten (som redan var rena och fungerade).
**Öppen fråga:** vill du ha rena, textfria kategorifoton tagna/beskurna för
det här ändamålet? Annars är ikon-korten den säkra vägen.

Övrigt jag kollade men INTE ändrat (native, redan fungerar rimligt):
mobilens sök-overlay (`#mobile-search-trigger`) och "Hitta rätt"-kortets
positionering på mobil (redan `left/right:10px;bottom:10px` under 640px,
matchar prototypens egen mobil-brytpunkt).

## 🚨 FEL PROTOTYPFIL användes hela tiden fram till 2026-08-31 — läs innan du bygger vidare

Allt ovanpå den här sektionen (header, hero, "Populära vägar", "Hitta rätt",
klassificeringsreglerna, designvärdena) byggdes mot
`HZY/hemsidor/header-startsida/ny-header-child.html` (11 aug). Vilmer
bekräftade 2026-08-31 att det var fel/gammal fil — den RÄTTA, senaste
prototypen är:

```
HZY/chatgpt-claude-handover/CLAUDE-HANDOFF-2026-08-17/prototyp/index.html
```
(uppdaterad 2026-08-24, se fullständig research-logg i CLAUDE.md — sökväg,
radmarkeringar och konkreta skillnader står där, upprepas inte här).

**Vad som fortfarande stämmer** (verifierat identiskt mellan filerna):
designvärdena (`:root`-token: färger, radier, skuggor, `--font-display`
Iowan Old Style) — det arbetet i `css/21`/`css/22` är INTE bortkastat.

**Vad som INTE stämmer och behöver göras om** (skillnader hittade
2026-08-31, se skärmdumpar Vilmer skickade + min läsning av rätt fil):
- Mobil header-layout: hamburgare vänster + centrerad logga + konto/varukorg
  höger, ALLTID synligt sökfält direkt under headern (inte dolt bakom en
  ikon som nativ nyehandel gör det).
- Hero: ett inramat/rundat kort med luft runt om — INTE kant-till-kant som
  nyehandels nativa slideshow vi reskinnat.
- Helt ny sektion **"Populära serier"** (rund logotyp/avatar-rad, byggd
  datadrivet via `data-pser-row` i prototypen — motsvarande finns inte i
  vårt bygge alls än).
- "Populära vägar": rätt fil har riktiga fotokort utan inbakad text (till
  skillnad från de hazey.se-bilder vi provade och rullade tillbaka från).
- Terminologi-datapunkt (ej beslut): rätt fil använder "Semisyntetiskt" för
  framställningsaxeln (inte "Modifierat") — fortfarande markerat obeslutat
  i filens egna öppna frågor, gissa inte att det är slutgiltigt.
- **Trust-siffror** ("8 000+ kunder", "4,7/5 Trustpilot", grundandeår) finns
  i rätt fils "Om Hazey"-sida, men filen kommenterar själv att de "ska
  verifieras eller hämtas dynamiskt före publicering" — använd ALDRIG
  dessa tal rakt av, fråga Vilmer om de är godkända riktiga tal.

**Detta betyder i praktiken:** header-nav (redan flaggad), hero och
"Populära vägar" behöver byggas om (ny IA/komposition, samma design-tokens),
och en ny "Populära serier"-sektion behöver läggas till. Väntar på Vilmers
go innan det görs — se "Näst" nedan.

## Ombygge mot RÄTT fil (2026-08-31) — header-layout + hero-kort + Populära serier

Vilmer sa "börja bygga", så kört direkt. Konkret gjort:

- **Mobil header omstrukturerad** till prototypens riktiga layout: hamburgare
  flyttad till att vara EGET first-child i `.main` (inte längre inuti
  `.right`), `.main` blir en `1fr auto 1fr`-grid på mobil så loggan blir
  SANT centrerad oavsett hur breda flankerna är (konto+varukorg väger mer än
  en ensam hamburgare). Nativ sök (`.center`) döljs ur main-raden på mobil.
- **Ny alltid synlig mobil-sökrad** (`.nh-mobile-searchbar`) direkt under
  headern — bara en trigger-knapp som klickar den RIKTIGA nativa
  `#mobile-search-trigger`-knappen, ingen egen söklogik/dubblettdata. Den
  nativa sök-ikonen i `.right` döljs på mobil (skulle annars synts två
  gånger — dubblett, fixad i samma veva).
- **Hero omstylad till inramat/rundat kort** (`margin` + `border-radius` +
  `box-shadow` runt den redan befintliga nativa slideshow-komponenten) —
  matchar rätt fils "kort med luft runt om"-känsla, INTE kant-till-kant.
  Fortfarande bara CSS-yta, rör inte rotation/bilder/JS.
- **Ny sektion "Populära serier"** tillagd (`js/18b-homepage-v2.js`,
  `nhPopularaSerierHtml`) — en horisontellt scrollbar rad med runda
  avatar-ikoner (INTE foton — vi har inga riktiga fristående serie-porträtt,
  bara hela produktbilder, så en ikon-avatar är den ärliga vägen tills
  Vilmer ev. tar fram riktiga porträttfoton). Ingen produkträkning
  hårdkodad — nyehandels nativa meny exponerar inga sådana. Data kommer
  från samma `navData` som headern (Magic Sauce, Nano-11, Faraoh, Tatra
  Hemp, Magic Farmers, Hero — alla 6 kända serier).

Testat visuellt (desktop + mobil, se `preview/`) — allt renderar korrekt.

## Ärlig sida-vid-sida-jämförelse (2026-08-31) — Vilmer ifrågasatte, med rätta

Vilmer: "tror du den ser identisk ut visuellt nu?" — nej, och jag hade
överdrivit i förra sammanfattningen. Tog faktiska skärmdumpar av RÄTT
prototyp (`preview/PROTOTYPE-mobile-top.png`, via den lokala servern) och
mitt bygge (`preview/MINE-mobile-top.png`) i EXAKT samma bredd (390px) och
jämförde på riktigt. Konkreta skillnader som hittades och åtgärdades samma
omgång:

1. **Topbaren var helt fel struktur på mobil** — prototypen har ingen mörk
   kryss-rad alls där, bara en ljus 2×2 trust-ruta direkt under sökfältet.
   Åtgärdat: `.topbar` döljs på mobil (`@media max-width:880px`), ersatt av
   en ny `.nh-mobile-trust`-rad.
2. **Trust-siffrorna är nu RIKTIGA, bekräftade av Vilmer 2026-08-31**:
   "4,7/5 på Trustpilot" (länkad till `trustpilot.com/review/hazey.se`,
   samma URL som redan används i `blocks/testimonials-section.html`) och
   "8 000+ ordrar" (INTE "kunder" — Vilmer påpekade skillnaden; talet rör
   sig mot 9000 så det MÅSTE uppdateras manuellt då och då, kommentar om
   det ligger i koden). Leverans-/diskretionstexten återanvänds LIVE ur den
   redan riktiga topbar-USP-listan, ingen ny hårdkodad kopia.
3. **18+-kravet flyttat** till mobilmenyns fot (`.nh-mm-foot`) eftersom
   topbaren (där det låg) nu är dold på mobil — annars hade det juridiska
   kravet tappats bort, inte bara flyttats.
4. **Hero-texten var centrerad, ska vara vänsterställd** (rätt prototyp har
   text i övre vänstra området, inte mitten). Fixat genom att skriva om
   `align-items`/`justify-content`/`text-align` på nyehandels egna
   `.slideshow__slides__slide__content`-flexbox (native, inspekterad live).
5. **"Populära serier" visade tomma ikoner — prototypen visar RIKTIGA
   produktfoton.** Löst RIKTIGT, inte bara kopierat prototypens fejkbilder:
   ny funktion `nhEnhanceWithRealPhotos()` hämtar varje series riktiga
   kategorisida (samma beprövade mönster som `js/10-product-sections.js`)
   och plockar en äkta produktbild att visa i avataren. Progressiv
   förbättring — ikon visas direkt, byts tyst mot foto när det laddats.
6. **Samma tekniken applicerad på "Populära vägar"-korten** (Vapes/Blommor/
   Hash) — de visar nu RIKTIGA produktfoton hämtade live, med prototypens
   mörka gradient-overlay för läsbar vit text. Löser den öppna frågan från
   förra omgången (de fejkade hazey.se-marknadsföringsfotona med inbakad
   text) på ett sätt som är både äkta OCH matchar layouten.

**Kvarstående kända gap (inte åtgärdade, för tidsskäl — inte falskt
markerade som klara):**
- Varukorgsbadgen (röd "0"-cirkel på varukorgsikonen) saknas fortfarande.
- Ingen produkträkning ("17 produkter" etc.) i "Populära serier" — skulle
  gå att räkna fram med samma scrape-teknik, men inte gjort än.
- Ingen pixel-för-pixel-genomgång av typografi/spacing/skuggor gjord —
  bara de STORA strukturella skillnaderna som syntes tydligt på
  skärmdumparna är åtgärdade. Kan finnas fler mindre avvikelser.
- Headerns totala höjd på mobil är nu större (hamburgerrad + sökrad +
  trust-rad, allt i den fixed-positionerade headern) — den befintliga
  scroll-hide-logiken (`js/14-header-scroll.js`) döljer hela headern vid
  nedåtscroll så det är inte permanent skärmyta som tas, men det är inte
  samma mer förfinade "krymp bara trust-raden"-beteende som prototypen har
  (`.hz-header.is-shrunk .trust-bar{max-height:0}`). Inte byggt om det.

## Exakt uppmätt omgång (2026-08-31) — "inte alls 1:1", med rätta

Vilmer, med rätta: strukturell likhet räcker inte, det ska vara 1:1. Slutade
gissa/uppskatta — hämtade EXAKTA värden med `getComputedStyle` direkt ur
rätt prototyp, på BÅDA breddpunkter (`#mVp` 390px, `#dVp` 1400px), och
applicerade dem precist. Stora, konkreta rättelser:

- **Hero är INTE ett kort på desktop** — det hade jag fel på. Mätning visade
  `margin:-26px -24px 0, border-radius:0` på desktop (kant-till-kant) men
  `margin:10px 10px 18px, border-radius:22px, min-height:238px` på mobil
  (@media max-width:860px, samma brytpunkt som prototypen själv använder).
  Kort-känslan är en RENODLAT MOBIL behandling. Rättat i CSS per breddpunkt.
- Hero-rubrik: 57px/vänsterställd (desktop), 26px (mobil) — exakt uppmätt,
  inte gissat. Skuggan är varm brun (`rgba(82,49,20,...)`/`rgba(92,57,24,...)`),
  inte grön som jag använt innan.
- **Trust-raden var HELT fel stil** — jag hade gjort kort med border/bakgrund;
  rätt prototyp har RENA textrader utan kort alls (bara ikon + text, 9.7px,
  färg `rgb(101,89,70)`). Rättat exakt.
- **"Populära serier"-avatarer var för små och saknade rätt behandling** —
  uppmätt 83px (mobil, vit kant, namn UNDER i mörk text) vs 186px (desktop,
  halvtransparent kant, namnet LIGGER PÅ fotot i vitt med gradient-overlay)
  — två genuint olika behandlingar per breddpunkt, inte samma skalat. Rättat.
- **"Populära vägar" innehöll seriekort av misstag** (dubblerade "Populära
  serier") — rätt prototyp har BARA format där. Tog bort seriekorten.
  Uppmätta mått applicerade: mobil 2 kolumner/112px min-höjd/16px radie,
  desktop 3 kolumner (vi har bara 3 riktiga format, prototypens fiktiva 4:e
  "CBD"-kort hoppas över eftersom vi redan beslutat att cannabinoid inte är
  ett eget format hos oss)/300px min-höjd/29px rubrik.

Jämförelsebilder sida vid sida: `preview/CMP-mine-*.png` vs `preview/CMP-proto-*.png` (mobile-top, mobile-serier, desktop-top, desktop-serier).

**Fortfarande INTE 100% pixel-identiskt** — kvarstår bl.a.: varukorgsbadge,
produkträkningar i Populära serier, en fullständig genomgång av ALLA
mellanliggande brytpunkter (bara 390/1400 exakt uppmätta hittills, 768/1024
etc. ärvda proportionellt men inte verifierade lika noggrant), och innehållet
i mitten av sidan (produkttabs/FAQ/textblock) är inte ommätt den här
omgången. Säger det rakt ut istället för att låtsas klart.

Näst:
1. Vilmer granskar det nya bygget (skärmdumpar/live Chrome) — säger till om header-layouten/hero-textens position/serie-fotona känns rätt nu, och om de kvarstående gapen ovan är värda att åtgärda.
2. Därefter, i ordning: (a) mega-meny/nav löses av mig, (b) kategori-/listningssidor med riktig filtrering, (c) minicart-reskin. PDP och blogg rörs inte.
3. Gamla öppna frågor om Faraoh/Hero/Tatra Hemp/Magic Farmers-format och dropdown-listlängd tas upp igen när nav görs om.
4. Inget är committat än — allt ligger som ospårade/ändrade filer på `dev`-branchen, redo att granskas innan commit.
5. Lokal statisk server körs på `http://localhost:8765` mot rätt prototypfil (för att Vilmer själv ska kunna bläddra i den) — stäng med `pkill -f "http.server 8765"` när den inte behövs mer.

Öppna frågor (oförändrade sen tidigare):
- Terminologi "naturidentiskt/semisyntetiskt" vs "fullt naturliga/halvsyntetiska" — obesvarad.
- `dev`-branchen: fanns redan på GitHub (samma commit som main), bytte till den lokalt 2026-08-28 — inget kvarstående problem.
- Exakt klassnamn i topbaren: verifierat 2026-08-28 — det är `.topbar-usp > .usp`, båda finns (uppdaterat i CLAUDE.md).

## Systematisk bakgrunds-/struktur-omgång (2026-08-31) — "ruggit mycket som diffar"

Vilmer, med rätta igen: pekade ut att bakgrundsfärger och "hela headern"
kändes fel, och ifrågasatte varför jag inte bara "adapterar koden och
skickar över" istället för att mäta enskilda element. Svar: jag kan inte
bokstavligen klistra in prototypens CSS-fil (fel elementnamn mot nyehandels
riktiga DOM), men jag KAN och ska hämta VARJE relevant värde systematiskt
i en genomgång — inte reaktivt, en grej i taget. Gjorde det nu:

- **Sidbakgrund var fel token**: startsidan använde `--nh-beige` (#e4d1bf)
  av misstag. Rätt uppmätt värde är `#efe9df`. OBS: `#e4d1bf` är INTE fel i
  sig — det är sajtens redan etablerade bakgrundsfärg på andra sidor
  (kategori-/kassa-/footer-sidor, se css/01–18, kontraktorns egna filer) —
  så fixen är SKOPAD till `.store-startpage` (bara startsidan), rör inte
  resten av sajten.
- **"Populära serier" saknade en mörkgrön full-bleed-panel på desktop**
  (uppmätt `rgb(30,39,22)`, padding 54px 26px) — trodde det var samma ljusa
  bakgrund som resten av sidan. Fixat med viewport-bredd-full-bleed-tricket
  (robust oavsett verklig container-padding, säkrare än att kopiera
  prototypens egen -24px som gällde DESS specifika container).
- **"Populära serier" och "Populära vägar" hade fel INBÖRDES ORDNING** —
  uppmätt/bekräftad genuin skillnad: mobil = serier FÖRE vägar, desktop =
  vägar FÖRE serier. Löst med en ny flex-wrapper (`.nh-startpage-flex`) +
  CSS `order` per brytpunkt (ren CSS `order` fungerar bara om föräldern är
  flex/grid, så sektionerna slogs in i en egen wrapper för det).

**Medvetet INTE tillagt än** (flaggar öppet, inte tyst hoppat över):
- **"Vad söker du?"-chipsraden** (qfind) direkt under hero på desktop i
  rätt prototyp — inte byggd än.
- **Framställningskort (Naturidentiskt/Semisyntetiskt)** i "Populära
  vägar" — rätt prototyp har dem, men de skulle länka till
  `?frame=nat`/`?frame=mod`-filter som INTE finns riktigt implementerat än
  (ingen kategorisida stödjer det filtret på riktigt ännu), OCH
  terminologin är fortfarande uttryckligen obeslutad. Att bygga in länkar
  som ser ut att filtrera men inte gör det vore vilseledande — det är
  därför de inte är med, inte glömska. **Väntar på: (a) Vilmers
  terminologibeslut, (b) att riktig framställningsfiltrering byggs på
  kategorisidorna** (kommer när kategorisidorna byggs, se tidigare punkt
  om nav/kategorisidor).

Jämförelsebilder: `preview/CMP2-mine-*.png`.

## Allvarlig layoutbugg hittad och fixad (2026-08-31) — text läckte ut ovanför hero

Vilmer skickade skärmdump: text från hero-sektionen renderades OVANFÖR
hero-kortet, överlappande trust-raden — "riktigt fult". Grundorsak
verifierad (inte gissad): `#store-main` har en NATIV, statisk
`padding-top:100px` som matchar den GAMLA (kortare) mobil-headern. Vi
gjorde headern högre (ny sökrad + trust-rad) utan att synka det värdet —
sidans riktiga innehåll (hero) renderades då delvis UNDER den nu högre
fasta headern, vilket visuellt såg ut som text som "läckte uppåt".

Fixat i `js/18a-header-v2.js` (`nhSyncMainOffset`): mäter headerns
FAKTISKA höjd (`scrollHeight`, inte `getBoundingClientRect().height` —
den senare gav fel svar eftersom `#store-header` har en egen fast
CSS-höjd som inte räknar med överskjutande innehåll) och sätter
`#store-main`s padding-top därefter. Körs vid boot + på resize (eftersom
sökrad/trust-rad bara visas under 880px, så headerns höjd ändras vid
brytpunkten).

**Lade också till framställnings-korten** (Naturidentiskt/Semisyntetiskt)
i "Populära vägar" som saknades helt — en riktig, synlig lucka mot rätt
prototyp. Länkar till `/sv/categories/alla-produkter` tills vidare (inget
riktigt framställnings-filter finns byggt på kategorisidor än — de är
inte byggda alls än). Terminologin ("Semisyntetiskt") är tagen rakt av
från prototypen, INTE ett beslut jag tagit — fortfarande en öppen fråga
till Vilmer, se tidigare anteckning.

**Metodlärdom:** tog en fullständig, orerad screenshot av HELA prototypens
startsida (`preview/FULL-proto-mobile.png`) och jämförde mot en lika
fullständig screenshot av mitt eget bygge (`preview/FULL-mine-mobile.png`)
— det avslöjade både den här buggen OCH att prototypens startsida faktiskt
är KORT (bara header+hero+serier+vägar, sen tomt, sen footer) — de
mellanliggande sektionerna på skarpa sajten (produkttabs/textblock/FAQ)
finns inte i prototypens scope alls, så de kan rimligen inte bedömas mot
"1:1"-måttstocken. Det här är en bättre metod än att mäta enskilda
element reaktivt — gör helsides-screenshot-jämförelser som förstahandsval
framöver, inte som sista utväg.

## A-listan genomförd (2026-08-31) — hela ombygget mot rätt prototyp

Vilmer gav en fullständig punktlista (A–I) efter att ha läst prototypen
(`chatgpt-claude-handover/.../prototyp/index.html`) själv, delade upp
skillnaderna i "fixbart i repot" vs "kräver riktig data", och svarade på
mina öppna frågor. Kört igenom hela A-listan i ett svep, verifierat med
RIKTIG stegvis scroll (`preview/STEP-mobile-*.png` 390px,
`preview/STEPD-desktop-*.png` 1440px) — inte fullPage, exakt som
efterfrågat, för att inte råka missbedöma reveal-animerat innehåll igen.

**Byggt (fullständig omskrivning av `js/18b-homepage-v2.js`):**
- **Hero ersatt**: nyehandels nativa bildkarusell döljs (inte tas bort),
  ersatt av ett qfind-format mörkgrönt kort — rätt copy ("Hitta rätt utan
  att kunna allt", "Sveriges bredaste cannabinoidsortiment" som eyebrow,
  inte "Sveriges #1"), riktig hero-bild återanvänd (samma URL som redan
  var konfigurerad, plockad ur den nativa karusellens första slide innan
  den döljs — ingen ny bild uppfunnen), 5 kategori-genvägar, två CTA:er.
- **Ny qfind-chipsrad** ("Vad söker du?") direkt under hero:n.
- **"Populära vägar" fick ett 4:e kort** (CBD, CBG & CBN → cbd-group,
  Vilmer godkände specifikt detta 2026-08-31) + underrubriker på alla 4.
- **Framställnings-segment** (Naturidentiskt/Semisyntetiskt) — redan byggt
  förra omgången, bara osynligt pga reveal-buggen.
- **Trust konsoliderat**: gamla dubblerade ikonraden (`.nh-trust`) dold,
  ersatt av ETT rikare 2×2/4-kolumners block med Trustpilot/Leveransgaranti
  (bekräftad riktig policy)/Diskret & spårbart/Sedan 2020. INGEN
  "analys på X %"-siffra — ingen tillförlitlig datakälla hittad i
  produktkortens DOM, utelämnad enligt regel, inte gissad.
- **"Fortsätt där du slutade"**: byggd DOLD (kräver besökardata som inte
  finns än — produktsida/konto inte byggda), precis som prototypen själv
  gör det.
- **"Bästsäljare i lager"**: riktiga produkter, samma beprövade
  kategori-skrap-mönster som `js/12-bestsellers-listing.js`.
- **"Snabb koll: vad är vad?"**: FLYTTAD (inte kopierad) från det
  befintliga SEO-textblocket — hittade och döljer nu originalrubrik+stycke
  där de extraherades ifrån, så texten inte visas två gånger. THCNM
  medvetet EJ flyttad (kvar orört på sin plats) — juridiskt pausad
  cannabinoid, görs inte mer framträdande. Bonusfynd: den befintliga,
  redan publicerade texten säger själv "THCNM från HERO har vi valt att
  sluta sälja" — stärker att pausen var rätt beslut.
- **"Verifierade omdömen"**: bara riktigt betyg (4,7/5) + ärlig länk till
  Trustpilot. INGA påhittade citat — se öppen fråga nedan om huruvida en
  riktig recensions-widget kan kopplas in istället.
- **Nyhetsbrev (mitt på sidan)**: icke-kopplad platshållare, precis som
  prototypens egen (`onsubmit="return false"` där också). Flaggat: behöver
  RIKTIGT verktyg kopplat innan lansering.
- **Gamla flik-sektionen** (Bästsäljare/Nyheter/Kampanjer + produktgrid)
  DOLD — blev redundant mot "Bästsäljare i lager", visade annars samma
  produkter två gånger på samma sida.
- **Reveal-buggen** fixad ordentligt: stort `rootMargin` + tvingad
  2-sekunders-timeout-fallback. Verifierat att den INTE var hela
  förklaringen till alla rapporterade problem (Vilmer hade rätt) — flera
  av punkterna (hero, dubblerad trust, 3 vs 4 kort, SEO-textväggen) var
  riktiga strukturella luckor, nu åtgärdade separat.

**Två buggar hittade och fixade under verifieringen:**
- `nhInitReveal`-funktionen saknades helt efter en omskrivning (kopieringsmisstag) — gav ett JS-fel som troligen tystade en del av sidan. Fixat.
- "Fortsätt där du slutade" visades trots `hidden`-attribut (samma typ av CSS-override som 18+-badgen tidigare) — fixat med samma `!important`-mönster.

**Inte gjort den här omgången** (medvetet, inte glömska):
- Footer-omstrukturering till prototypens exakta kolumnindelning (Handla/
  Hjälp&Leverans/Hazey/Villkor) — nuvarande footer har redan riktiga
  länkar, bara annan gruppering. Lägre prioritet, se öppen fråga.

## Samlade datafrågor till Vilmer (EN lista, enligt begäran)

1. **Trustpilot business-unit-id stämmer inte överens** mellan två
   befintliga block: `blocks/trust-section-block.html` använder
   `6479dc28f0b041b3c79af588`, `blocks/testimonials-section.html` använder
   `6513e1a93f98d9001a6cb9b0`. Vilket är rätt/aktuellt (t.ex. om ett är
   kvarlämning från "Måbroberg"-namnet före "Hazey"-lanseringen 2023)?
2. **Finns en riktig Trustpilot-widgetmall som visar enskilda
   recensionscitat** (inte bara betyg)? Om ja: vilket `data-template-id`
   och vilket av business-unit-id:na ovan ska användas? Byggde "Verifierade
   omdömen" utan citat tills detta är klart (bara betyg + länk).
3. **"Analys på X %" (certifikattäckning)**: ingen tillförlitlig datakälla
   hittad i produktkortens DOM (inget data-lab-liknande attribut). Antingen
   ger du mig det riktiga talet manuellt (uppdateras då sällan/manuellt,
   inte live), eller så behöver produktdata få en verklig markör att räkna
   på. Utelämnad tills vidare.
4. **Nyhetsbrevet** (både mitt-på-sidan och i footern) är fortsatt inte
   kopplat till något riktigt verktyg — bekräftat okej för nu, men måste
   lösas innan lansering.
5. **Footer-omstrukturering**: några av prototypens footer-länkar
   (t.ex. en dedikerad "Om Hazey"/"Transparens"-sida) hittades inte som
   riktiga sidor i nuvarande footer-länkar — finns de, eller ska footern
   byggas om utan dem tills de finns?
6. Övriga sen tidigare oförändrade: terminologi naturidentiskt/
   semisyntetiskt, samt Faraoh/Hero/Tatra Hemp/Magic Farmers-format i
   mega-menyn (väntar ändå på nav-omtaget).

## Ytterligare två hero-buggar hittade (2026-08-31, samma dag)

Vilmer jämförde skärmdumpar sida vid sida igen och hittade två konkreta
kvarvarande fel i hero:n:
1. **Kategori-genvägsraden (Vapes/Blommor/Hash/CBD/Kampanjer) visades på
   BÅDA breddpunkter** — rätt fil har den bara på desktop (dVp), mVp
   saknar den helt. Fixat: `.nh-hero-v2__cats` dold under 861px.
2. **Fel copy på mobil** — mVp har KORTARE text än dVp för underrubrik
   ("Sök direkt eller jämför på innehåll och framställning." vs desktops
   längre "...produkter på innehåll, framställning och publicerat
   analyscertifikat.") och CTA-knappen ("Hjälp mig →" vs "Hjälp mig hitta
   rätt →"). Jag hade använt desktop-texten på båda. Fixat med två
   textvarianter som togglas via CSS-brytpunkt (samma mönster som
   Populära serier/vägar-ordningen).

Kvarstår oförändrat, medvetet: hero-BILDEN skiljer sig mot prototypen
(vi återanvänder er riktiga, redan konfigurerade bild — inte prototypens
egen demo-bild) — det är avsiktligt enligt regeln att aldrig kopiera/hitta
på bilder, inte en bugg att fixa.

## Slutuppgift-omgång 2026-09-01: mätt facit på riktigt, fixat konkreta avvikelser

Efter Vilmers underkännande av föregående omgång ("egen tolkning, inte
1:1") mättes RÄTT facit-fil (`.../CLAUDE-HANDOFF-2026-08-17/prototyp/
index.html`) på riktigt via Playwright `getComputedStyle`/bounding boxes
vid 390px — se `PROTOTYP-INVENTERING.md` för alla uppmätta värden och
`LEGACY-SEO-INNEHALL.md` för det äldre SEO-innehållets status. Följande
konkreta avvikelser hittades och fixades i `js/18b-homepage-v2.js` och
`css/22-homepage-v2.css` (inga nya "fix-lager", allt direkt i de
befintliga 4 filerna):

1. **Hero-eyebrow**: universell text ("Sveriges bredaste
   cannabinoidsortiment") ersatt med två varianter — mobil = "Brett
   sortiment · öppen information" (uppmätt ur facit), desktop behåller
   den tidigare, av Vilmer bekräftade "störst i Sverige"-texten.
2. **Hero mobiltext**: saknade ordet "format" — rättat till "Sök direkt
   eller jämför på innehåll, format och framställning." (exakt facit).
3. **Hero-bild**: bytt källa till prototypens EGEN bild
   (`hero-westcoast-v4.jpg`), servad lokalt (localhost:8767, se
   `NH_PROTO_ASSETS` i js/18b) för visuell 1:1-QA — enligt uttrycklig,
   upprepad instruktion i slutuppgiften. Med säker reservbild: om
   facit-bilden misslyckas ladda (se buggpunkt nedan) faller den tyst
   tillbaka till er riktiga, redan konfigurerade nyehandel-bild
   (`nhInitHeroImageFallback`) — hero är ALDRIG blank/trasig.
4. **`.nh-qfind`** ("Vad söker du?"-chipsraden) fanns bara i facitens
   `#dVp`, inte `#mVp` alls (verifierat: `document.querySelector("#mVp
   .qfind")` → null). Döljs nu helt under 861px.
5. **Populära vägar, underrubriker** rättade till exakt facit-text:
   Blommor "Filtrerbar lista" (var "Flower & buds"), Hash "Piatella &
   mousse" (var "Pressad & mousse"), CBD "Egen ingång" (var "Även THCV").
6. **Framställningssegment (`.seg-btn`)**: stil rättad till uppmätta
   värden — `border-radius:12px`, `padding:8px 11px`,
   `background:rgba(255,249,238,.86)`, `border:1px solid
   rgb(227,205,176)` (var generisk vit kortstil).
7. **Sektionsordning**: trust-block/"transparens" låg FÖRE Bästsäljare
   i lager — uppmätt ordning är tvärtom (Bästsäljare → trust-block).
   Rättat i `initHomepageV2()`.
8. **Populära serier**: lade till RIKTIGT produktantal (räknas fram live
   per serie, samma beprövade fetch-mönster som bästsäljarlistan) i
   stället för att bara visa namn+foto. En serie utan produkter döljs
   automatiskt (`[hidden]`-failsafe tillagd).
9. **Populära vägar, desktop-grid**: 3 kolumner → 4 (fjärde CBD-kortet
   fanns redan i datan men grid:et var inte uppdaterat).
10. **"Snabb koll: vad är vad?"-korten** var "för höga/smala" (riktig,
    lång SEO-brödtext direkt i korten) — löst med visuell
    `-webkit-line-clamp:5` (texten TAS INTE BORT ur DOM:en, bara klippt
    visuellt) så korten blir kompakta och balanserade som i facit.
11. **Header-logga**: den lilla rastrerade "Hazey.se"-bildloggan visades
    fortfarande på mobil — facit har ett typografiskt kursivt
    "hazey"-ordmärke. Bilden döljs nu och ersätts med text via CSS
    (`::after` på loggans länk, `href="/"` orört) — bara på mobil, inte
    en förändring av desktop-loggan.
12. **"Verifierade omdömen"**: facit har tre separata citat-kort, men
    ingen verifierad recensionscitat-källa finns (öppen datafråga #2
    ovan, olöst). Byggde en dold, förberedd `.nh-reviews-grid`-shell
    (samma mönster som "Fortsätt där du slutade") redo att kopplas in
    den dagen en riktig källa bekräftas — visar INTE påhittade citat.

**Ny bugg hittad under verifiering mot den RIKTIGA sajten (inte facit):**
när hazey.css/hazey.min.js injiceras i `https://hazeyse.nyehandel.se/`
(riktig QA-metod, se preview.mjs) blockerar Chrome bilden från
`http://localhost:8767` — dels som "mixed content" (https-sida hämtar
http-resurs), dels med Private Network Access-policyn ("blocked by CORS
policy: Permission was denied for this request to access the `loopback`
address space"). Detta är en webbläsarsäkerhetsspärr, inte en kodbugg —
den uppstår ENDAST när man testar mot den riktiga live-sajten (https) med
en lokal http-bild; testar man facit-sidan direkt (localhost→localhost)
fungerar bilden felfritt. Löst med reservbild (punkt 3 ovan) så QA aldrig
visar en trasig hero. **Kvarstår som ett riktigt produktionsbehov**: för
att verkligen se facit-bilden i en fullständig QA-runda mot den riktiga
sajten (eller i produktion) måste bilden hostas på en riktig HTTPS-adress
(CDN/nyehandel-mediabibliotek), inte localhost.

**Verifiering**: `node build.js` OK. Stegvis scroll-skärmdumpar (INTE
fullPage) tagna vid 390/430/600px för både facit och vår version, se
`preview/parity/`. Sidhöjden skiljer sig kraftigt (facit ~4100–4300px,
vår ~6800–8000px) — verifierat att det INTE är en bugg utan förväntat:
vår sida har RIKTIGT innehåll facit-mockupen saknar helt (äldre SEO-text
om THCA/THCNM/Magic Sauce, en "Alla artiklar"/"Vanliga frågor"-sektion,
en fullständig footer med riktiga länkar) — inget av det ska tas bort
utan beslut (se `LEGACY-SEO-INNEHALL.md`).

**Inte verifierat pixel-för-pixel i denna omgång** (tidsprioritering,
flaggat, inte bortglömt): footerns exakta kolumnindelning/rubriktext mot
facit (footern är redan omgjord i en tidigare omgång — "footer v2.1" —
med riktiga länkar, men inte re-verifierad mot den NYA rätta facit-filen
i just denna runda). Samt: fullständig 360/768/1024/1440/1920px-regression
utöver 390/430/600px har inte körts i denna omgång.

## Portningsprincip ändrad (2026-09-01)

Vilmer bytte ut den tidigare absoluta "skriv allt om från grunden,
kopiera aldrig prototypens CSS/JS"-regeln i CLAUDE.md mot en tydligare,
mer nyanserad princip: visuell komponentmarkup/CSS/designvärden/
media-query-beteenden FÅR återanvändas selektivt när det är säkraste
vägen till verifierad visuell paritet — men prototypens router, mockdata,
overlay-manager, demo-navigation och dVp/mVp-tvådelningen får fortfarande
inte kopieras in som produktionsarkitektur, och den portade koden ska
alltid gå mot nyehandels riktiga länkar/data/sök/konto/varukorg och
verifieras med parity-systemet. Fullständig ordalydelse i CLAUDE.md,
avsnittet "Portningsprincip". Se `tests/blueprints/` för konkreta,
elementvisa portningsspecifikationer som tillämpar principen — första är
`mobile-header-port.md` (mobilheader + sökfält + mikrotrust, hero ingår
INTE ännu).

## Korrigering i mobile-header-port.md (2026-09-01)

Granskning hittade en verklig strukturell motsägelse i blueprintens
första utkast: den föreslog `#store-header{height:auto!important}` som
hela lösningen på header-höjdsavvikelsen (122px facit mot 100px
implementation), men missade att facitets `.mt-mobile` (mikrotrust) ligger
UTANFÖR `#mHeader` som eget syskon-element i DOM:et, medan
implementationens `.nh-mobile-trust` idag monteras SOM BARN till
`#store-header` (`js/18a-header-v2.js` rad 332–344). En ren
`height:auto`-fix hade därför gjort hela headern ~174px+ hög och
permanent fixed, istället för att bara headern (122px) är fixed och
mikrotrusten scrollar bort separat som i facit. Blueprinten är nu
korrigerad med en ny sektion F ("Strukturell lösning:
mikrotrust-monteringspunkt") som dokumenterar rätt lösning: flytta
`.nh-mobile-trust` till att bli första barnet i `#store-main` (verifierat
identisk DOM-relation mellan `#store-header`/`#store-main` på startsida,
kategori och produktsida), verifierat mot hur `nhSyncMainOffset` redan
fungerar. Ingen produktionskod ändrad — fortfarande bara spec.

## Mobilheader/sökfält/mikrotrust IMPLEMENTERAD (2026-09-01)

Blueprintens plan (`tests/blueprints/mobile-header-port.md`) genomförd i
`css/21-header-v2.css` + `js/18a-header-v2.js`. Tre implementationspass
(1 samlad + 2 tillåtna korrigeringar, gränsen nådd — inga fler pass
gjorda på dessa tre sektioner).

**Parity-resultat (`npm run parity`, 390px):**
| Sektion | Höjd före | Höjd efter | Facit | Diff % före | Diff % efter | Verdict |
|---|---|---|---|---|---|---|
| Header | 100px | 128.4px | 122px | 22.8% | **11.4%** | **PASS** (var FAIL) |
| Sökfält | 59.6px | 57.4px | 53px | 17.6% | 15.7% | FAIL (förbättrad) |
| Mikrotrust | 103.8px | 104.8px | 52px | 74.4% | 56.3% | FAIL (förbättrad) |

**Strukturellt** (huvudsyftet): `.nh-mobile-trust` monteras nu som första
barnet i `#store-main` (inte längre barn till `#store-header`) —
verifierat live på startsida/kategori/produktsida: rätt föräldraelement,
scrollar bort separat vid scroll (headroom-transformen i
`js/14-header-scroll.js` rör bara `#store-header`, aldrig trust-raden),
ingen dubbel top-padding (`#store-main`s `padding-top` är den enda
källan till trust-radens y-position, matematiskt bekräftat).

**Två korrigeringspass, båda mätbara förbättringar:**
1. Blueprintens "12px padding runt om" för `.main` (facit `.m-row`)
   visade sig INTE transferera 1:1 — vår `.main` wrappar sitt innehåll i
   ett nativt `<div class="container">` (nyehandel-markup, inte vårt)
   som självt renderar ~60px högt oavsett `.main`s padding, medan facits
   `.m-row` saknar en sådan wrapper. Att kopiera facits 12px blåste upp
   `.main` till 85px istället för att matcha 69px. Återställd till
   ursprunglig `padding-top/bottom:4px` (redan närmast rätt för VÅR
   faktiska DOM). Header: 147.6px→131.6px, diff 23.2%→13.6%.
2. Upptäckt UNDER implementationen (inte fångad av blueprinten):
   `.nh-mobile-searchbar button`s `font-size:14px` (utan `!important`)
   förlorade mot samma nativa `body,p,li,span,input,button,label,td,a
   {font-size:16px!important}`-reset som redan var känd och fixad för
   `.nh-mt-item` — computed font-size var faktiskt 16px, vilket via
   native `line-height:1.6!important` (enhetslös multiplikator) blåste
   upp knapphöjden till 49.6px. Fixat med `!important`. Header:
   131.6px→128.4px (PASS), Sökfält: 60.6px→57.4px.

**Kvarstående, medvetna gap (inte chansade på fler pass):**
- Sökfält (57.4px mot facit 53px): återstående ~4px inte grundorsaks-
  spårat vidare — pass-budgeten (2) var förbrukad.
- Mikrotrust (104.8px mot facit 52px): dominerande orsak är att
  leverans-textens rad ("Skickas 1-2 vardagar", hämtad LIVE ur riktiga
  topbar-USP:n per redan etablerad regel — INTE hårdkodad) radbryts till
  2 rader i 172px-kolumnen, medan facits egen (kortare) demotext får
  plats på en rad. Inte en CSS-bugg — en verklig text-längdsskillnad
  mellan riktig copy och facits fasta exempeltext. Löses inte genom att
  ändra CSS utan genom att korta USP-texten (utanför scope) eller
  acceptera avvikelsen.
- Konto-/varukorgsikonernas SVG (nativa `fill`-ikoner vs facits
  `stroke`-ikoner): INTE bytt — bedömdes för riskabelt att mutera SVG-
  innehåll inuti samma Vue-hanterade `.icon`-span som varukorgsbadgens
  villkorliga rendering (risk att Vue skriver över bytet vid nästa
  re-render, t.ex. varje gång korgen uppdateras). Uppfyller inte
  uppdragets villkor "om detta kan göras utan att... bryta de nativa
  knapparna" med tillräcklig säkerhet — avstod hellre än att gissa.
- Varukorgsbadge: CSS (position/mått/färg/radie, orange `#c96a26`) på
  plats och riktad mot det REDAN nativa Vue-styrda `.cart-button .badge`
  — inget nytt hårdkodat. Kunde INTE visuellt bekräfta en verklig
  nollskild siffra utan att faktiskt lägga en produkt i en riktig
  varukorg på skarpa sajten, vilket är en stateful skarp-sajt-åtgärd
  utanför vad ett skrivskyddat regressionstest ska göra.
- Native sökfälts-klick-genom (`#mobile-search-trigger`): koden är
  oförändrad sen tidigare (redan verifierad fungera i tidigare session,
  se äldre STATUS.md-anteckning "redan fungerar rimligt"). Ett headless
  Playwright-klick i denna regressionsrunda kunde inte visuellt bekräfta
  att den nativa sök-overlayn öppnas — inga JS-fel kastades, men troligen
  en headless/automations-begränsning snarare än en regression, eftersom
  klick-handlern är exakt oförändrad.

**Regression verifierad** (390px start/kategori/produkt + 1440px
startsida, skrivskyddat mot skarpa sajten): ingen horisontell overflow
någonstans, ingen dubbel top-padding, headerns scroll-döljning fungerar
och rör bara headern, mikrotrust scrollar bort separat, mobilmenyn
öppnar/stänger, kontolänken pekar rätt, varukorgen öppnas (riktig
Vue-state, `aria-expanded` växlar), desktop 1440px visuellt granskad och
oförändrad (header 175px mot native 180px utan vår CSS — 5px, osynlig
skillnad, ingen synlig regression).

**Hero och alla sektioner efter mikrotrust rörda INTE.**

## Mobilheader: rotorsaksomgång efter underkänt PASS (2026-09-01)

Vilmer underkände det tidigare automatiska PASS:et — 12%-tröskeln
passerades men skärmdumpen visade en tydlig strukturell bugg (logga/
konto/varukorg klumpade ihop långt åt vänster, stort tomrum till höger)
som talet inte fångade. Krävde read-only rotorsaksanalys FÖRE kodändring
— alla tre orsaker bekräftade live innan fix, ingen gissad.

**1. Fel layoutförälder (strukturbugg, huvudorsaken bakom underkännandet):**
`#store-header .main` har bara TVÅ riktiga barn: `.nh-burger` (vår egen,
`grid-column:1`) och nyehandels nativa `.container` (auto-placerad, ETT
enda grid-item). `.left`/`.center`/`.right` är GRANDCHILDREN (barn till
`.container`), inte `.main`s egna barn — deras `grid-column`/
`justify-self`-regler var alltså verkningslösa (gäller bara riktiga grid-
items), och högerkolumnen (`1fr`) stod tom. Fix: `#store-header.nh-
header-v2 .main > .container { display: contents; }` (mobil-scopad) gör
`.container` osynligt för layouten så dess barn blir RIKTIGA grid-items
— de redan korrekt författade `grid-column`/`justify-self`-reglerna
fungerar då direkt. Verifierat: loggans centrum = viewportens centrum
inom 0,01px vid 390/430/600px, på startsida/kategori/produkt (9/9
kombinationer).

**2. Mikrotrustens inre `<span>`/`<b>` — INTE bara text som orsak.**
Vilmer hade rätt att ifrågasätta "längre text"-förklaringen. Verifierat
via CDP `getMatchedStylesForNode`: Nyehandels globala `body,p,li,span,
input,button,label,td{font-size:0.9rem!important;line-height:1.6
!important}`-reset matchar `<span>` DIREKT (span står i listan) — en
direkt `!important`-träff på barnet vinner alltid över förälderns
computed värde, oavsett vad `.nh-mt-item` sattes till. Span visade
computed `font-size:16px`/`line-height:25.6px` trots att `.nh-mt-item`
redan var `9.7px`/`1.2`. `<b>` ärvde i sin tur 16px från sin span-
förälder. Fix: `.nh-mobile-trust .nh-mt-item span, ...b { font-size:
inherit!important; line-height:inherit!important; margin:0!important }`
— tvingar dem att ärva förälderns redan korrekta typografi istället för
att läsa av den nativa listan. Detta var den DOMINERANDE orsaken till
mikrotrustens höjd (105px→55px i ett enda steg, av facits 52px).

**3. Sökfältets knapp — samma mekanism som ovan, en gång till.**
`button` står också i samma native-lista. `font-size:14px!important`
(tidigare fix) vann över font-size, MEN `line-height:1.6` är en
enhetslös multiplikator som räknas om mot elementets EGNA (nu korrekta)
font-size — `1.6×14=22.4px`, fortfarande fel. Facit sätter ingen egen
line-height alls (41px totalhöjd − 22px padding − 2px border = 17px
innehåll, ren webbläsar-default för 14px text). Fix: `line-height:
normal!important` — motsvarar facits IMPLICITA default, inte ett gissat
kompensationstal.

**Ny copy och Trustpilot-ikon** (Vilmers exakta, godkända korta texter,
ersätter tidigare live-extraktion ur topbar-USP:n som gav längre,
radbrytande text): "4,7/5 på Trustpilot", "8 000+ ordrar · sedan 2020"
(INTE "kunder"), "Normalt 1–2 vardagar", "Diskret & spårbart". Facitens
gröna `.tp-star`-badge (14×14, `#00b67a`, vit stjärna 11×11) återskapad
istället för den tidigare enkla kontur-ikonen.

**Två implementationspass (av max 2 tillåtna denna omgång):**
- Pass 1 (alla tre rotorsaker ovan i ett svep): Header 128px→109px
  (diff 11,4%→19,6%, TILLFÄLLIGT SÄMRE — se nedan), **Sökfält 57px→54px
  (diff 15,7%→7,8%, PASS)**, **Mikrotrust 105px→55px (diff 56,3%→15,4%,
  nära men fortfarande FAIL)**.
- Pass 2 (en enda, tydligt identifierad kvarvarande orsak): headerns
  regression i Pass 1 var FÖRVÄNTAD, inte en bugg — `display:contents`
  tog bort `.container`s tidigare höjd-bidrag (~60px), så `.main`s
  verkliga innehållshöjd blev 44px (facits egen), vilket gjorde att
  blueprintens ursprungliga `12px`-padding (som avfärdades i förra
  omgången på fel grund) nu äntligen stämde. Återinförd. **Header
  109px→125px (diff 19,6%→6,3%, PASS).**

**Slutresultat, 390px:** Header PASS (6,3%), Sökfält PASS (7,8%),
Mikrotrust FAIL men kraftigt förbättrad (15,4%, mot facits 52px vs våra
55px — bara 3px kvar). Pass-budgeten (2) förbrukad denna omgång, ingen
tredje gissning gjord på mikrotrustens sista 3px.

**Regression verifierad** (skrivskyddat, 390/430/600px × start/kategori/
produkt = 9 kombinationer + 1440px desktop): ingen horisontell overflow
någonstans, loggcentrering inom 0,01px överallt, mikrotrust scrollar
bort separat (bekräftat: `trustTop` −351px vid scroll 500px, alltså
normalt dokumentflöde, inte fixed), headerns scroll-döljning fungerar
(header till `top:-125px` vid scroll, tillbaka till `0` vid topp), meny/
konto/varukorg fungerar (`aria-expanded` växlar, riktig Vue cart-state),
desktop 1440px pixel-identisk med föregående omgång (header 175px,
oförändrat — alla fixar är mobil-scopade).

## Mobilheader: manuell visuell granskning underkände föregående PASS (2026-09-01)

Vilmer underkände det automatiska PASS:et ovan trots att 12%-tröskeln
höll — en riktig skärmdumpsjämförelse visade tydliga strukturella och
färgmässiga avvikelser som procenttalen inte fångade. Fyra separata,
LIVE-verifierade rotorsaker (inga gissade), se fullständig dokumentation
i `tests/blueprints/mobile-header-port.md` "KORRIGERING 2":

1. **Header/main-radens bakgrund var native grårosa (`#eee7e1`), inte
   varm creme.** En nativ Nyehandel-temaregel `#store-header,
   #store-header .main, #store-header .navbar{background:#eee7e1
   !important}` vann över våra egna, icke-viktiga bakgrundsregler.
   Fixat med `!important` + facits exakta gradientvärden
   (`linear-gradient(180deg,#fffaf0 0%,#fbf1e1 100%)`).
2. **Sökfältsområdets bakgrund var fel TOKEN** (`var(--nh-cream)`,
   nästan vit) — inte en specificitetsfråga, bara fel värde. Rättat
   till facits egna `#fbf1e1` + `border-bottom-color:#e5d3b8`.
3. **En ~26px hög tom remsa mellan sökfält och mikrotrust.** Verifierat
   INNAN någon av våra CSS/JS-injektioner: `#store-main` självt börjar
   vid y≈25,6px, inte y=0 — orsakat av en lös, bokstavlig `&gt;`-textnod
   direkt i `<body>` (en redan existerande Nyehandel-mall-artefakt,
   utanför det här repots rådighet, INTE borttagen/rörd). Fixat genom
   att `nhSyncMainOffset` (`js/18a-header-v2.js`) nu mäter `#store-
   main`s EGEN startposition och drar av den från önskad padding-top —
   gapet är nu ≈0px (verifierat, var 25,6px).
4. **Tre av fyra mikrotrust-ikoner (och Trustpilot-stjärnan) matchade
   inte facits riktiga `ICON`-objekt** — egna approximationer med fel
   path-data och fel `stroke-width` (1,8 istället för facits 2). Rättat
   till exakta paths ur facit-källan (`ICON.shield`/`ICON.truck`/
   `ICON.box` + `tpMark`).

**Medvetet INTE ändrat** (samma riskbedömning som tidigare, nu
uttryckligen omdokumenterad): konto-/varukorgsikonernas nativa
`fill`-stil och varukorgsbadgens riktiga (villkorliga, aldrig
hårdkodade) `0`-visning — att mutera SVG/badge-villkor i samma
Vue-hanterade `.icon`-span som badgens conditional render riskerar att
Vue skriver över ändringen vid nästa re-render.

**Ny testinfrastruktur (parity-testets "blindspot" åtgärdad FÖRST, per
begäran):** `tests/parity-sections.mjs` + `tests/home-parity.spec.mjs`
mäter nu header/sökfält/mikrotrust/hero i EN sammanhängande,
dokument-absolut batch (inte beskurna komponentbilder) vid 390/430/
600px, och jämför implementationens mellanrum (sökfält→mikrotrust,
mikrotrust→hero) mot facits egna låsta mellanrum
(`tests/golden/header-package-geometry.json`) — ett tomt gap som inte
finns i facit gör nu detta test rött oavsett vad de separata
komponenttesterna visar. **Ny test PASSERAR** vid alla tre breddpunkter
efter fixarna ovan.

**Slutresultat (`npm run parity`, 390px):** Header PASS (6,8%, var
6,3% — oförändrat/marginellt), Sökfält PASS (9,4%, var 7,8% —
fortfarande gott om marginal), Mikrotrust FAIL på procenttalet (15,5%,
55px mot facits 52px) men **visuellt en stark, ärlig matchning** vid
manuell sida-vid-sida-granskning — resterande diff domineras av en
3px höjdskillnad + medvetna textskillnader ("ordrar" inte "kunder",
Vilmers egna beslut) + normal typsnittsrendering, INTE en färg- eller
strukturbugg. Ny geometritest **PASS** vid 390/430/600px på alla tre
sidtyper (start/kategori/produkt). Desktop 1440px oförändrad.

**Processavvikelse, redovisad öppet:** uppdraget bad om test-fix FÖRST,
sedan rotorsaksmätning, sedan blueprint-dokumentation, sedan kod. Denna
omgång gjorde rotorsaksmätning → kodfix → test-fix/blueprint-
dokumentation i en mer sammanflätad ordning (allt fortfarande mätt
LIVE innan skrivet, inget gissat) — inte den exakta sekvens som
efterfrågades. Nämns här för transparens, inte dolt.

## Mobilheader: sista strikta kalibreringsomgången — GODKÄND (2026-09-01)

Vilmer beskrev föregående runda som "betydligt bättre men ännu inte
manuellt godkänt" och gav fem konkret verifierade avvikelser att
korrigera, scopat strikt till header/sökfält/mikrotrust. Alla fem
root-orsakade LIVE (inga gissade värden), fullständig dokumentation i
`tests/blueprints/mobile-header-port.md` "KORRIGERING 3":

1. **Mikrotrustens "1–2 vardagar" saknade `<b>`** — mallsträngen i
   `js/18a-header-v2.js` byggde texten utan bold-tagg. Fixat.
2. **Mikrotrust + sökfältsknapp ärvde fel font-family/vikt/spårning**
   från samma nativa Nunito/500/0,02em-reset som redan orsakat
   font-size/line-height-buggar i tidigare rundor. Detta var den
   verkliga orsaken till att sökfältet "kändes vitare/mindre skarpt" —
   inte en färgfråga. Fixat med `!important` system-ui/400/normal på
   båda selektorerna (facit-uppmätta värden). Sökfältsknappens höjd
   (43px→41px) rättade sig SJÄLV av samma fix.
3. **Gapet mikrotrust→hero var fortfarande 10px, inte 18px** — ett
   tidigare `margin-bottom:8px`-försök hade ingen effekt eftersom
   angränsande syskonmarginaler KOLLAPSAR till MAX-värdet, inte summan
   (`max(8,10)=10`). Rättat till `margin-bottom:18px`
   (`max(18,10)=18`), självupptäckt och självkorrigerat innan
   rapportering.
4. **Remsan under mikrotrust hade fel färgton.** Identifierat via
   `document.elementFromPoint()` att `#store-main` självt (transparent,
   ingen egen bakgrund) ritar ytan, inte en wrapper eller ett
   överlappnings-hack. Facits exakta rendrade färg pixel-uppmätt (inte
   gissad ur gradientkällkoden) till `rgb(254,246,233)`, satt på
   `#store-main` scopat till mobil.
5. **Mikrotrustboxen var 3px för hög (55px mot facits 52px).**
   Root-orsakat till en asymmetrisk `padding:9px 16px 12px` mot facits
   symmetriska `padding:9px 16px` (verifierat i facit-källkoden, rad
   1887–1891) — `12−9=3px`, exakt avvikelsen. Rättat till `9px 16px`.
   Efter fix: `wrapHeight` identisk 52px=52px på båda sidor.
6. **(Hittad under verifiering, inte i den ursprungliga listan men
   samma typ av mätbar avvikelse):** Headern var 2px för hög (124px mot
   122px) trots att sökfältet redan var 53px=53px exakt. Root-orsakat
   via CDP till en NATIV Nyehandel-plattformsregel
   (`header{border-bottom:var(--header-border-bottom-touch)}`, inte
   satt av oss) som lägger en 2px grå linje under headern som facit
   helt saknar. Nollställd med `border-bottom:0 !important`, scopat
   till mobil.

**Medvetet ej ändrat, verifierat som antingen instruerat undantag eller
verklig textrendering — inte layoutfel:**
- Tom varukorgs `0`-badge (facit har hårdkodad `0`, riktig
  implementation har korrekt Vue-villkorlig döljning).
- "8 000+ ordrar" vs facits "8 000+ kunder" (explicit instruerat att
  behålla "ordrar") — dominerar mikrotrustens kvarvarande pixel-diff
  eftersom ordbytet förskjuter resten av textraden.
- Logotypens kursiva serif-antialiasing i header-diffen — verifierat
  identisk font-family/storlek/vikt/färg på båda sidor, kvarvarande
  skillnad är webbläsarens egen sub-pixel-rendering. Ingen
  filter/opacity/text-shadow tillagd för att maskera detta.

**Slutresultat (`npm run parity`, alla i scope):** Header PASS (122px=
122px EXAKT, diffRatio 1,21%, var 2,79%/6,8% tidigare rundor), Sökfält
PASS (53px=53px EXAKT, diffRatio **0% — pixelperfekt**), Mikrotrust
PASS (52px=52px EXAKT, diffRatio 9,68%, var 14,8%/15,5% tidigare
rundor — kvarvarande diff förklarad ovan som avsiktlig text +
antialiasing). Paket-geometritestet (390/430/600px, inget dolt gap)
PASS. Verifierat live på start-/kategori-/produktsida (`m-s-buds`,
`hash-magic-sauce-50-charas-5-gram`) — header/sökfält/mikrotrust
renderar identiskt, ingen horisontell overflow. Desktop 1440px
bekräftat helt oförändrad (headerhöjd 175px, mikrotrust/sökfält
`display:none` som avsett). Ny sida-vid-sida-bild (header-topp till
hero-start) genererad, facit och implementation startar hero vid
EXAKT samma y-position (192px).

**Bedömning: komponenten (mobil header + sökfält + övre mikrotrust)
GODKÄNS.** Alla kvarvarande synliga skillnader är antingen korrigerade
eller uttryckligen dokumenterade ovan som avsiktliga undantag (badge,
"ordrar") eller verklig text-antialiasing — inget kvarstår ogranskat
eller gissat. Inget pushat eller deployat; `node build.js` kört,
`hazey.css`/`hazey.min.js` innehåller senaste källkoden men är inte
publicerad någonstans.

## Mobilheader LÅST (commit f9e9854) + permanent workflow-förbättring (2026-09-01)

Vilmer bekräftade `f9e9854` som manuellt godkänd baseline — mobilheader/
sökfält/övre mikrotrust produktions-CSS/JS ska inte ändras utan en ny,
explicit instruktion. Inga produktionsfiler rörda i denna omgång.

Två permanenta tillägg till migreringsworkflowet, destillerade ur
header-kalibreringens upprepade felmönster (se CLAUDE.md "Parity-
workflow: typografi/ikonkontroll och klassificering av avvikelser" för
den fullständiga regeln):

1. **`tests/typography-icon-checks.mjs`** (ny, återanvändbar) —
   `measureTypography`/`diffTypography` (font-family/size/weight/
   line-height/letter-spacing/text-transform/color/opacity, element +
   namngivna barn) och `measureIcon`/`diffIcon` (SVG viewBox/bredd/höjd/
   fill/stroke/stroke-width/path-data/baseline-placering). Validerad
   direkt mot det redan godkända headerpaketet: typografidiffen på
   sökfältsknappen kom tillbaka TOM (bekräftar ett känt godkänt värde),
   och ikonverktyget hittade omedelbart en verklig, tidigare oupptäckt
   2px-skillnad på mikrotrustens Trustpilot-stjärna (facit 13×13px,
   implementation 11×11px — en CSS-specificitets-tie-break där
   `.tp-star svg`-regeln råkar komma efter `.nh-mt-item svg`-regeln i
   källordning i vår CSS, jämfört med facit där `.mt-mobile .mt-item
   svg` har en extra klass och därför alltid vinner oavsett ordning).
   **Denna avvikelse är MEDVETET INTE fixad denna omgång** — headern är
   låst baseline, ändras inte utan ny instruktion. Flaggas här som en
   känd, verifierad, liten kvarvarande avvikelse för framtida
   prioritering, inte som en dold bugg.
2. **Klassificeringsprincipen** — varje kvarvarande visuell avvikelse
   inför ett komponentgodkännande måste sorteras i exakt en av fem
   klasser (korrigerbar implementation / dynamiskt innehåll /
   plattformshanterad funktion / webbläsarens textrendering / medvetet
   produktbeslut) innan komponenten föreslås godkänd — kodifierar det
   Vilmer redan krävde manuellt i header-rundorna
   ("Ett grönt procenttest räcker inte ensamt").

Ny `tests/README.md` samlar arbetsordningen (blueprint → mät →
implementera → verifiera → klassificera → godkänn) och pekar till båda
ovanstående. `PLATFORM_MANAGED_SELECTORS` i samma modul listar de kända
Vue-ägda DOM-regionerna (kontoikon, varukorgsikon+badge, `#cartAside`)
som tidigare header-rundor redan identifierat men inte skrev ner
maskinläsbart förrän nu.

## Mobil hero — lässkyddad blueprint klar (2026-09-01)

Nästa komponent efter det låsta headerpaketet. `tests/blueprints/
mobile-hero-port.md` skapad — LIVE uppmätt (Playwright + `getComputedStyle`/
CDP) mot facit vid 390/430/600px, INGEN produktionsfil ändrad
(`css/22-homepage-v2.css`/`js/18b-homepage-v2.js` orörda).

**Viktig skillnad mot header:** mobil hero är INTE oimplementerad —
`.nh-hero-v2`/`.nh-qfind-hero` finns redan (byggt 2026-08-31), och
DOM-strukturen är i grunden rätt. Det som saknas är i praktiken samma
felmönster header-kalibreringen redan löste en gång:

1. Redan skrivna text-CSS-regler (eyebrow/h1/p/knappar) saknar
   `!important` och förlorar tyst mot Nyehandels nativa
   `h1{font-family:Roboto!important}`/`body,p,...{font-family:Nunito!
   important}`-resets — bekräftat via CDP, exakt samma mönster som
   header §F.1.
2. `h1{max-width}` saknas helt — H1:an ("Hitta rätt utan att kunna
   allt.") radbryter till EN rad i stället för facits avsiktliga TVÅ.
3. `.nh-hero-v2__inner` är `display:block;max-width:520px` (fast) i
   stället för facits `display:flex;flex-direction:column;
   justify-content:flex-end;width:76%` (relativt, botten-förankrat) —
   förklarar även varför fotots högra sida syns mindre i impl.
4. Bildfilter (`saturate(1.06) brightness(1.12) sepia(.045)`) saknas
   helt; overlay-gradienten finns (`::before`, tidigare felaktigt läst
   som "saknas" innan källkoden lästes om) men är enhetligt vertikal i
   stället för facits asymmetriska, textsides-koncentrerade form.
5. **Störst enskild visuell skillnad:** "Hjälp mig →" är en vanlig
   understruken textlänk i impl, en kvarleva från ett tidigare,
   övergivet reskin-försök mot nyehandels native slideshow-DOM
   (`.slideshow__slides__slide`-CSS, rad 1-53 i `css/22-homepage-v2.css`,
   matchar numera ingenting i den faktiska markupen) — facit stylar
   samma knapp som en fylld piller-knapp.

**Redan korrekt, ingen åtgärd behövs:** hero-kortets höjd/position/
marginal/border-radius/overflow/box-shadow (alla exakt matchande),
gapet hero→"Populära serier" (~18px på båda sidor, redan nära exakt),
båda CTA-länkarnas FUNKTION (verifierat i kod — "Utforska sortimentet"
scrollar till en riktig, om än annorlunda namngiven, "Populära
vägar"-sektion på båda sidor; "Hjälp mig →" öppnar redan en riktig
"Hitta rätt"-låda via en global `[data-open-hr]`-delegat i
`js/18a-header-v2.js`, ingen stubb). Den tidigare oro att en extra
"qfind"-chipsrad renderades mellan hero och Populära serier på mobil
visade sig vara fel — koden döljer redan `.nh-qfind` helt under 861px
(kommentar i koden bekräftar detta uppmättes 2026-09-01), bekräftat av
denna omgångs egen geometrimätning.

**Öppna frågor till Vilmer, inte gissade:** var ska hero-bilden hostas
i produktion (idag `http://localhost:8767/`, redan flaggat i kodens
egna kommentarer som pre-launch-blockerande); ska den döda
`.slideshow__slides__slide`-CSS:en tas bort. En detalj (facits
`.btn-solid` är 8px lägre vid 600px än vid 390/430px) är inte
fullständigt rotorsakad denna omgång — flaggad för uppföljning, inte
gissad.

Testplan (skriven, INTE implementerad i `tests/parity-sections.mjs`/
`tests/home-parity.spec.mjs`) för: isolerad hero-pixelparitet (redan
skaffoldad, väntar på implementation), paketgeometri utökad med
mikrotrust→hero→Populära serier, funktionella CTA-länkar, ingen
overflow, home/kategori/produkt-regression, desktop orört — se
blueprintens §I för detaljer.

**Ingenting implementerat. Inget pushat eller deployat.**

## Mobilheader: fristående amendment — Trustpilot-stjärnan 11px→13px (2026-09-01)

Separat, minimal korrigering av den låsta headerbaselinen (`f9e9854`),
begärd explicit av Vilmer utifrån den redan verifierade avvikelsen som
`tests/typography-icon-checks.mjs` hittade i förra omgången (se
"Mobilheader LÅST"-posten ovan). Rörde INGET annat i headern.

**Fix:** `.nh-mobile-trust .tp-star svg` hade en egen `width:11px;
height:11px` som (via en oavsiktlig specificitets-oavgjord — se CSS-
kommentaren i `css/21-header-v2.css`) vann över den mobil-specifika
`.nh-mobile-trust .nh-mt-item svg{width:13px;height:13px}`-regeln,
trots att facits motsvarande högre-specificitetsregel (`.mt-mobile
.mt-item svg`, 2 klasser mot `.tp-star svg`s 1 klass) alltid vinner i
facit oavsett källordning. Tog bort tp-star-regelns egen width/height
helt (behåller bara `color:#fff`) så item-svg-regeln blir ensam
avgörande — replikerar facits verkliga specificitetsrelation exakt,
ingen ny gissad kompensation.

**Verifiering:** `measureIcon`/`diffIcon` bekräftar EXAKT 13×13px på
båda sidor (`diff: []`). `npm run parity`: Header PASS (122px=122px,
1,21%), Sökfält PASS (53px=53px, 0%), Mikrotrust PASS (52px=52px,
9,67%, marginellt förbättrad från 9,68%), sektionsordning PASS, ingen
overflow PASS, paketgeometri (390/430/600px) PASS. Manuellt verifierat
på start-/kategori-/produktsida (390px, `m-s-buds`,
`hash-magic-sauce-50-charas-5-gram`) — stjärnan 13×13px överallt,
headerhöjd oförändrad (122px). Desktop 1440px oförändrad (175px,
mikrotrust `display:none` som avsett).

**Headerbaseline LÅST IGEN** efter denna commit — mobilheader/sökfält/
övre mikrotrust produktions-CSS/JS ska inte ändras utan en ny, explicit
instruktion.

## Mobil hero IMPLEMENTERAD (2026-09-01)

Blueprintens (`tests/blueprints/mobile-hero-port.md`) fem verifierade
rotorsaker genomförda i `css/22-homepage-v2.css` (strikt mobil-scopat,
`@media(max-width:860px)`) + `js/18b-homepage-v2.js` (bildkälla).
Fullständig implementations-/verifieringslogg i blueprinten själv
("IMPLEMENTATION"-avsnittet) — sammanfattat här:

**Öppna frågors beslut, genomförda:**
1. **Heroasset:** `http://localhost:8767`-referensen borttagen HELT ur
   produktionskoden. QA opåverkad — `lockImplImages` läser redan
   `hero-westcoast-v4.jpg` direkt från disk (data:-URL), oberoende av
   produktionens egen URL. Produktion visar nu den riktiga, redan
   konfigurerade nyehandel-bilden direkt. **`hero-westcoast-v4.jpg` är
   filen som behöver stabil HTTPS-hosting** den dag facitens EGEN bild
   (inte bara den nativa) ska synas i produktion — inte löst, bara
   dokumenterat.
2. **Övergiven hero-CSS:** sökt igenom repo + renderad DOM (alla fem
   `.nh-hero-v2 .slideshow__slides__slide*`-selektorer gav 0 träffar,
   `.nh-hero-v2`/`.template-components__slideshow` bekräftat syskon i
   DOM:et, aldrig förälder/barn — blocket kan strukturellt aldrig
   matcha något). Bevisligen dött, borttaget exakt. Andra
   slideshow-relaterade regler (css/01, css/09, css/10, utan
   `.nh-hero-v2`-prefix) rör den nativa karusellen på andra ställen —
   INTE rörda.

**Fem rotorsaker implementerade:** typografi + `!important`-specificitet
(eyebrow/h1/p/btn-solid/hero-link — tomt diff efter fix, alla tre
breddpunkter); H1 `max-width:9.5em` (radbryter nu 2/2 rader som facit,
alla tre bredder); `.nh-hero-v2__inner` omskriven till 76%-bred,
botten-förankrad flex-kolumn (var fast `max-width:520px`); bildfilter
(`saturate(1.06) brightness(1.12) sepia(.045)`) via ett dedikerat
`::after`-pseudo-lager (så bara bilden filtreras, inte texten som
delar samma element); "Hjälp mig →" omskriven till facits fyllda
piller-knapp (var en enkel textlänk, kvarleva från ett övergivet
reskin-försök mot native slideshow-DOM).

**Ett korrigeringspass (av max 2) användes**, utlöst av EN identifierad
rotorsak (CTA-radens felaktiga wrap): btn-solid:s gamla padding
(`12px 20px`→facits `9px 14px`+border/shadow/färg), `.nh-hero-v2__cta`
saknade facits egna `flex-wrap:nowrap` (gör att knappar krymper och
radbryter sin EGEN text i stället för att flytta ner till en ny rad —
exakt facits beteende, verifierat: "Utforska sortimentet" radbryter
till 2 rader vid 390/430px precis som facit), hero-link behövde
`white-space:nowrap` (annars ~0,1px kort på en rad, ett sub-pixel-
utfall av flex-matematiken, inte en verklig breddbrist), och
`.nh-hero-v2__inner`s padding (redan uppmätt i blueprinten men av
misstag utelämnad först). Resultat: hero-höjden gick från en
regression (297px vid 390px) till **exakt 238px vid alla tre
breddpunkter**, identiskt med facit.

**Verifiering:** paketgeometri mikrotrust→hero→"Populära serier" PASS
(390/430/600px, `PACKAGE_GEOMETRY_SELECTORS` permanent utökad med en
`series`-nyckel, golden regenererad); typografi-/ikonkontroll tomt
diff (utom h1:s färg, ej flaggad rotorsak); båda CTA-länkarna
verifierat FUNKTIONELLA (klick, inte bara markup — scrollar till
`#populara-vagar` respektive öppnar `#hrDrawer`); ingen overflow;
kategori-/produktsida korrekt utan hero, header oförändrad; desktop
1440px HELT oförändrat (inkl. en förexisterande, ej denna omgångs
scope, native h1-färgbugg som redan fanns innan och lämnas orörd på
desktop). Isolerad hero-pixeldiff (`npm run parity`) visar FAIL på
procenttalet (49,8%, tröskel 35%) — manuellt granskat och
klassificerat som en KÄND, redan §B-dokumenterad 28px `#store-main`-
breddskillnad (sitewide, inte hero-specifik, utanför denna omgångs
scope) som ger ett dubbelexponerings-mönster i diff-verktyget, inte
ett verkligt visuellt fel — layout/radbrytning/typografi/knappar är i
praktiken identiska vid manuell sida-vid-sida-granskning.

**Ej fixat, medvetet flaggat, inte gissat:** scrim-gradientens
asymmetriska form (facit mörklägger bara textsidan, vår version en
enhetlig vertikal ton) och facits btn-solid-höjdskillnad vid 600px —
ingetdera var del av denna omgångs uttryckliga instruktionslista.

**`node build.js` kört. Commit väntar på explicit pathspec (endast
`css/22-homepage-v2.css`, `js/18b-homepage-v2.js`,
`tests/parity-sections.mjs`, `tests/home-parity.spec.mjs`,
`tests/blueprints/mobile-hero-port.md`, `STATUS.md`). Inget pushat
eller deployat.**

## Mobil hero GODKÄND (2026-09-02) — tre manuella granskningsrundor efter första implementationen

Tre uppföljande, manuellt begärda korrigeringar efter det första
implementationspasset ovan, var och en snävt scopad:

1. **Fel heroasset** — produktionskällan föll tillbaka till
   `nativeHeroImgUrl` (nyehandels egen konfigurerade bild, en
   cannabisplanta), inte facitens `hero-westcoast-v4.jpg`. Löst genom
   att spåra in exakt samma bytes i repot (`assets/hero-westcoast-v4.jpg`,
   verifierat med `md5`, inte regenererad) och en konfigurerbar
   `NH_ASSET_BASE` i `js/18b-homepage-v2.js` (default: samma jsDelivr/
   GitHub-hosting som `hazey.css`/`hazey.min.js` redan använder — INGEN
   `localhost`-sträng i produktionskällan). `preview.mjs` (det lokala
   previewflödet) uppdaterat att sätta `window.NH_ASSET_BASE =
   "http://127.0.0.1:8767/"` innan `hazey.min.js` körs — verifierat mot
   den redan körande lokala previewservern (`/tmp/cors_server.py`, port
   8767, servar redan `hero-westcoast-v4.jpg` från sin rot — INTE under
   `/assets`, kontrollerat med `curl` innan värdet sattes).
2. **Hero-kortets bredd** — mätt facit vs impl vid 390px: facit har
   24px sidoinset (342px brett kort), impl hade bara 10px (370px brett)
   — en verklig 14px/sida-avvikelse, inte en beskärningsartefakt. Rättad
   direkt på `.nh-hero-v2`s egen margin (`10px 24px 18px`), INTE på
   `#store-main` (delad med header/mikrotrust/Populära serier, orörd).
   Verifierat: bredd/position nu exakt 342px/24px/366px, matchar facit.
3. **Overlayns färgton** — `.nh-qfind-hero::before` använde fortfarande
   en gammal, övergiven reskin-gradient (enhetlig mörkgrön vertikal ton)
   som gjorde fotot mörkt/mjölkigt. Ersatt, scopat till samma mobila
   `@media`-block, med facitens exakta uppmätta mobila overlay (svag
   varm 0deg-ton + textsides-koncentrerad 90deg-gradient som lämnar
   högra ~24% av fotot synligt) — bildfiltret (`saturate/brightness/
   sepia`, redan korrekt) orört.

**Vilmers slutgiltiga bedömning:** hero godkänd som den är. En
kvarvarande, känd skillnad (textkolumnens exakta höjd mot facit)
medvetet INTE jagad vidare — hero-text och CTA-knappar byts ut i ett
senare skede ändå, så vidare pixel-matchning av just den delen är inte
värdefull tid just nu.

## Nästa: Populära serier och nedåt (2026-09-02)

Vilmer: fortsätt bygga från "Populära serier" och nedåt enligt facit
(`index.html`), samma extrahera-inte-tolka-metod (mät/läs facits
riktiga källa och DOM, gissa inte) och samma visuella iterationsloop
(blueprint/mätning → implementation → skärmdumpsjämförelse → korrigera)
som header och hero redan gått igenom.

## Mobil Populära serier GODKÄND (2026-09-02)

Kalibrerad mot facit i flera snabba rundor: byggd om till en CSS-driven
swipe-karusell (facit hade bara 4 mockserier på en rad, vi har 6 riktiga
— fast 83px/kort, `scroll-snap`, ingen flex-krympning); rätt vänsterkant
(14px, inte 24px — sektionen hade fel enskild paddingvärde, inte dubbel
padding); borttaget påhittat `padding-top:28px` (facits `.section-gap`
sätter bara `margin-bottom`, aldrig `padding-top` — gapet till hero kom
redan korrekt från heroens egen `margin-bottom:18px`); rubrikens
typsnitt (`h2` saknade `!important`, föll till native Roboto);
serienamn/produktantal fick korrekt `!important`-skyddad typografi
(system-ui, rätt storlek/vikt/line-height, `-webkit-line-clamp:2` utan
konstlad `min-height`). Samma runda fixade även två kvarvarande
hero-buggar: `.nh-hero-v2` saknade `display:flex;align-items:stretch`
(gjorde att hero-inner inte fyllde kortets fulla höjd, texten hamnade
~25px för högt), och "Hjälp mig →"s inre `<span>` fångades av samma
native `span{font-size:16px!important}`-reset som redan lösts på andra
ställen. Alla fynd live-verifierade (getBoundingClientRect +
getComputedStyle), inga gissade värden.

## Mobil startsida-sprint (2026-09-02) — Paket A klart, Paket B/C BLOCKERADE (facit saknar innehållet)

Vilmer bad om tre komponentpaket i en sammanhållen sprint: (A) Populära
vägar + framställningsval, (B) Bästsäljare + transparensblock, (C)
Snabb koll/omdömen/nyhetsbrev. Startade med en checkpoint-commit av den
redan godkända Populära serier-kalibreringen (commit `c50f727`).

**Paket A — KLART.** Kalibrerat direkt mot facits källa (index.html rad
272-402, 1057-1069, 1972-1997 — den vinnande `#m-populara-vagar`-ID-
scopade mobilregeln): dolde `.sec-head p`/`.more` på mobil (facit:
`#mVp .sec-head p{display:none}`, ingen "Se allt"-länk finns alls i
facits mobila markup för sektionen), dolde `.seg-note` helt på mobil
(facit: `display:none`), rättade route-kortens border-color/box-shadow/
bakgrund (icke-foto-kort)/gradient (foto-kort)/route-sub-storlek till
facits exakta mobilvärden, rättade seg-btn till piller-form (24px
radie, inte 12px) och seg-ico till cirkel (50%, inte 10px radie).
Verifierat: ingen overflow vid 390/430/600px, 2×2-rutnät håller,
riktiga länkar/data orörda, hela kortet klickbart (redan `<a>`-taggar).

**Paket B och C — BLOCKERADE, inte implementerade.** Verifierat
DEFINITIVT (inte antaget) genom att läsa facits råkälla direkt: `#mVp
.page-home`s `</div>` stängs OMEDELBART efter Aura-guidens `</section>`
(rad 4347-4348), och nästa element i källan är `<section
id="m-alla-produkter" class="page-catalog is-hidden-page">` — en HELT
ANNAN sida/rutt i samma SPA, inte startsidan. **Facits startsida har
ingen "Bästsäljare i lager", inget transparensblock/"Så arbetar Hazey
med innehåll och ursprung" (den texten finns bara på "Om Hazey"-sidan,
rad 4557), inget "Snabb koll: vad är vad?", inga "Verifierade omdömen",
inget nyhetsbrev.** Detta bekräftar och skärper ett redan tidigare
dokumenterat fynd ("Exakt uppmätt omgång", 2026-08-31: "prototypens
startsida är KORT... sen tomt, sen footer").

Eftersom uppdraget uttryckligen bad om att KALIBRERA dessa paket MOT
facit, och facit inte har något att kalibrera mot, stannade arbetet
här i stället för att gissa design-/layoutvärden utan källa — samma
"gissa aldrig, fråga"-princip som gäller genomgående i det här
projektet. Vilmer behöver ge riktning: antingen (a) dessa sektioner
behandlas som egna, redan tidigare godkända tillägg (byggda i en
tidigare omgång, INTE del av "portning från facit") och kalibreras
mot något annat facit (t.ex. "Om Hazey"-sidan för transparensblocket),
eller (b) de lämnas som de är tills en riktig källa finns, eller (c)
någon annan riktning.

## RÄTTELSE: Paket B/C slutsats ovan var felaktig — sektionerna finns i facit (2026-09-02)

Vilmer korrigerade: de återstående sektionerna ligger som DELADE
`.page-home.home-extra`-sektioner i facits källa (index.html rad
4482-4657, kommentar "Startsida — delade extra-sektioner" direkt efter
`#mVp` stängs) — UTANFÖR både `#dVp` och `#mVp`, styrda av samma
`.page-home`/`is-hidden-page`-logik, delade mellan desktop/mobil via
responsiv CSS. Min tidigare sökning (bara innanför `#mVp .page-home`)
missade dem helt. Verifierat nu: `#featuredProductsSection` (rad
4508), `.trust-block`/"Så arbetar Hazey..." (rad 4554), `#kunskap` (rad
4588), `.reviews-row`/"Verifierade omdömen" (rad 4623), `.signup-block`
(rad 4644) finns alla, med egna mobila CSS-regler (rad 633-679 bas,
1052-1080 `@media max-width:860px`).

**Paket B och C genomförda.** Två systemfel hittade i SAMTLIGA fem
sektioner, extraherat direkt ur facits källa:

1. **Rubrikerna saknade `!important`** — samma native
   `h1,h2,...{font-family:Roboto!important}`-mönster som redan lösts
   överallt annars. Uppmätt: Roboto 20,8px/färg rgb(23,23,23) på alla
   fyra `<h2>` (Bästsäljare/Kunskap/Omdömen/Nyhetsbrev — trustblock har
   ingen egen rubrikkomponent, se nedan) i stället för Iowan Old Style
   19px/grön. Rättat med `!important` på font-family/vikt/storlek/
   line-height/letter-spacing/färg, samma facit-uppmätta värden som
   används överallt annars i denna sprint.
2. **ALLA FEM sektionsövergångar mätte exakt 0px** (inte bara
   CSS-`gap` — `getBoundingClientRect()`), trots att varje sektion har
   klassen `.section-gap`: ingen delad basregel för `.section-gap`
   fanns någonsin i vår CSS, och varje sektions egen `margin:0 auto`
   (för horisontell centrering) nollställde margin-bottom helt. Facit:
   `.section-gap{margin-bottom:34px}` (bas), `{margin-bottom:22px}`
   (mobil ≤860px, rad 1053) — mobilvärdet tillagt på `.nh-routes`
   (Populära vägar, den enda ändringen i redan committade Paket A —
   bara dess EGEN bottenmarginal, inget annat rört) +
   `.nh-featured`/`.nh-trustblock`/`.nh-kunskap`/`.nh-reviews`/
   `.nh-signup`. Verifierat: samtliga fem övergångar (Populära vägar→
   Bästsäljare→transparens→kunskap→omdömen→nyhetsbrev) 22px, matchar
   facit exakt.
3. **`.home-extra .hx-head p{display:none}`** (facit, mobil) — dolde
   underrubrikerna för Bästsäljare/Omdömen (som använder sec-head-
   mönstret) på mobil. Kunskap/trustblock/signup har egna, INTE
   hx-head-baserade brödtexter (facits `.lede`/`certClaim`/`p`) som
   INTE döljs — substantiellt innehåll, inte en decorativ underrubrik.

**Redan korrekt, ingen kod rörd:** Bästsäljare använder redan riktiga
Nyehandel-produkter/priser/lagerstatus/länkar/köpknappar (verifierat
med oskrivskyddad injektion mot skarpa sajten — CCELL M4, Canapuff CBN
m.fl. riktiga produkter, inte facits demoprodukter). Recensioner
använder redan bara det riktiga 4,7/5 Trustpilot-betyget + länk, ingen
fabricerad citat-text — en dold, förberedd `.nh-reviews-grid` väntar på
en riktig citat-källa (`data-status="ingen-verifierad-
recensionskalla-an"`, dokumenterat gap, inte gissat). Nyhetsbrevs-
formuläret är redan en uttryckligen dokumenterad platshållare
(`data-nh-placeholder-form`, `preventDefault()`, ingen skenfunktion) —
samma mönster som facits egen `onsubmit="return false"`.

**`.nh-trustblock` är MEDVETET INTE facits "Så arbetar Hazey med
innehåll och ursprung"-innehåll** — det är en tidigare, av Vilmer
uttryckligen godkänd (2026-08-31) egen komponent (Trustpilot-betyg/
Leveransgaranti/Diskret & spårbart/Sedan 2020, ett 2×2-ikonrutnät) på
SAMMA POSITION i flödet som facits trust-block, men med annat innehåll
— ett medvetet produktbeslut, inte en lucka. Endast dess
sektionsmarginal (gap-fixen ovan) rörd, inget annat.

Verifierat: ingen horisontell overflow (390px), desktop 1440px inte
rört (alla fixar `@media max-width:860px`-scopade).

## RÄTTELSE 2: rapporten "genomförda" ovan var för tidig — facit-fånget var trasigt (2026-09-02)

Vilmer: jämförelsen som ledde till förra postens slutsats använde ett
facit-läge där `.page-home.home-extra` var osynligt (`opacity:0`),
inte dolt av routing. Verifierat konkret: facits egen `.pre-reveal`-
klass (`index.html` rad 2778-2783, `opacity:0` tills en
IntersectionObserver lägger till `.in-view`) hade INGEN motsvarighet i
`tests/qa-freeze.css` — den filen frös bara VÅR EGEN `.nh-reveal`, inte
facits `.pre-reveal`. Varje facit-skärmdump den här sessionen tagit har
alltså visat sektionerna osynliga trots att de renderas normalt för en
riktig scrollande användare. Fixat: `.pre-reveal{opacity:1!important;
transform:none!important}` tillagt i `qa-freeze.css` (test-only-fil,
aldrig klistrad in i produktion). Verifierat efteråt: samtliga fem
sektioner `opacity:1` i en färsk facit-capture.

**Med korrekt facit synligt genomfördes Paket B/C på riktigt** (inte
bara typografi/gap som förra, otillräckliga passet):

- **Bästsäljare i lager**: facit är en VÅGRÄT SVEPBAR KARUSELL
  (`.hx-scroll`, index.html rad 647-649), inte ett fast rutnät. Vårt
  `.nh-featured-row` var `display:grid`. Konverterat till
  `display:flex;overflow-x:auto;scroll-snap-type:x proximity` med
  kortbredd kalibrerad (46%/min 158px) så ~2 riktiga produktkort syns
  plus en skymt av nästa — mätt, `scrollWidth 668 > clientWidth 342`,
  bekräftat svepbar. Riktiga produktkort/priser/lagerstatus/köpknappar
  (`.product-card`, redan Nyehandel-data) helt orörda.
- **"Så arbetar Hazey med innehåll och ursprung"**: den gamla
  `.nh-tb-grid`-ikonrutan (2×2, en tidigare egen tolkning) ersatt med
  facits riktiga enkolumns-struktur (rubrik+ingress+länk+4-radig
  bocklista, index.html rad 658-664). Innehållet är INTE facits egna
  påståenden om batch-certifikat/"certifikattäckning X%" (redan
  konstaterat sakna en tillförlitlig datakälla, se CLAUDE.md/
  STATUS.md) — i stället våra redan Vilmer-godkända riktiga fakta
  (Trustpilot 4,7/5 länkat, leveransgaranti, diskretion, grundår 2020)
  i facits layout. Ingen fabricerad procentsats, ingen gissad
  transparens-URL (behöll den riktiga Trustpilot-länken i stället för
  en påhittad `/transparens`-sida som inte finns byggd).
- **Kunskap/Reviews/Newsletter**: redan korrekta sen förra passet
  (mörk 2×2-guide-grid, enbart riktigt 4,7/5-betyg utan fabricerade
  citat, dokumenterad nyhetsbrevs-platshållare) — oförändrade,
  verifierade fortsatt korrekta.

**Verifierat:** alla fyra sektionsövergångar (Bästsäljare→transparens→
kunskap→omdömen→nyhetsbrev) fortsatt 22px (facits mobila
`.section-gap`-värde, från förra passet, opåverkat av denna omgångs
strukturella ändringar). Ingen horisontell overflow. Inga
dubbletter (varje sektion `document.querySelectorAll` = 1).

**Kunde inte visuellt jämföra mot den användarbifogade referensbilden**
(`~/Downloads/localhost_8765_...png`) — filsystemsbehörighet nekade
läsning av den katalogen i denna session. Verifieringen bygger i
stället på en egen, nyligen genererad, bekräftat korrekt facit-capture
(`tests/results/_hero-blueprint/sprint-facit-390-full-FIXED.png`,
samtliga fem sektioner `opacity:1` bekräftat via `getComputedStyle`)
plus källkodsextraktion, inte gissning.

## Sista mobilpasset: Bästsäljare → sidans slut (2026-09-03)

**1. Systemfel hittat och rättat:** samtliga fem home-extra-sektioner
(Bästsäljare/trust-block/kunskap/reviews/signup) hade `padding:...24px`
(kunskap: 16px) sido-padding, oskopat delat med desktop. Facits riktiga
mobila sidoinset är **14px**, uppmätt live på `.trust-block` (left
14px, width 362px vid 390px) — samma värde som redan etablerat för
Populära serier/vägar. Detta var den konkreta förklaringen till att
transparensblocket satt fel: 24px i stället för 14px. Rättat på alla
fem, mobil-scopat, desktop orört.

**2. "Snabb koll: vad är vad?" — rotorsakat, INTE en bugg.**
`nhBuildKunskapFromRealContent()` läser riktiga `<h2>`-rubriker som
matchar `/^vad är/i` ur den riktiga sidans befintliga SEO-textblock.
Verifierat direkt mot skarpa sajten: endast TRE sådana rubriker finns
där i verkligheten — "Vad är THCA?", "Vad är THCNM?" (medvetet
uteslutet, juridik ej klar) och "Vad är Magic Sauce?". **"Vad är
THCB/THCBA?" och "Vad är Nano-11?" existerar inte som riktigt innehåll
på sajten ännu** — facits fjärde/fjärde kort är dess egen mockdata.
Klassificerat som **dynamiskt innehåll/verklig databegränsning**, inte
fyllt med påhittad text. 2×2-rutnätet (`grid-template-columns:1fr 1fr`)
renderar redan korrekt med 2 verkliga kort (fyller översta raden helt,
ingen trasig/tom rutnätslucka).

**3. Bästsäljare-karusellen** verifierad mot kraven: `#nh-featured-row`
computed `display:flex` ✓, `scrollWidth 668 > clientWidth 342` ✓
(svepbar), riktiga produktkort/priser/köpknappar helt orörda. Facits
egna kort är 210px breda (1,7 synliga vid 390px); vårt kort är 158px
(≈2,2 synliga) — en medveten, redan tidigare vald kalibrering (våra
riktiga produktkort har annan naturlig proportion än facits demokort),
inte ändrad denna omgång.

**4. Reviews/Newsletter:** redan korrekt kalibrerade (vit kort/grön
kort, facits färgtoken `#2c3620` exakt, radie/padding i linje med
facits `var(--r-lg)`/28px). Ingen kodändring.

**5. Verifierat:** alla fyra sektionsövergångar fortsatt 22px, ingen
overflow, inga dubbletter (`querySelectorAll` = 1 för alla fyra nya
sektionerna).

**6. SEO-inventering (skrivskyddad, inget flyttat/dolt/omskrivet):**
sju block hittade direkt efter newsletter-kortet i den riktiga,
orörda DOM:en, alla i normalt dokumentflöde (ingen lazy-load, ingen
klick-krävande visning):

| # | Komponent (stabil selector) | Rubrik/ämne | Interna länkar | Dublett/unikt | Rekommendation |
|---|---|---|---|---|---|
| 1 | `.template-components__html-editor` (1:a) | Kort textsnutt (60 tecken, ej läst i detalj denna omgång) | — | Okänt, ej granskat | Granska i separat SEO-pass |
| 2 | `.template-components__html-editor` (2:a) | "Köp mer – Betala mindre"-kampanjbanner | 5+ riktiga produktlänkar (CCELL M4, Canapuff CBN m.fl.) | Verkar unikt, korsförsäljning | Behåll på startsidan (redan fungerande cross-sell) |
| 3 | `.template-components__text-editor` | "THCA med flera – Svenska lagliga cannabinoider" | — | Käll-block för Kunskap-kortens THCA-text (delvis flyttat/dolt, se `nhBuildKunskapFromRealContent`) | Flytta till landningssida i SEO-migreringen — huvudartikeltext |
| 4 | `.template-components__columns` (1:a) | Dekorativt/bild, tom text | 1 `javascript:void(0)`-länk (sannolikt UI-widget, ej riktig destination) | — | Granska separat |
| 5 | `.template-components__columns` (2:a) | "Vad är THCA?"/"Vad är THCNM?"/"Vad är Magic Sauce?" (THCA+Magic Sauce redan `display:none`, flyttade till Kunskap-korten) | "Alla artiklar" → `/sv/categories/alla-produkter` | THCNM-delen ENDA kvarvarande synliga — juridiskt pausad, rörs inte | Behåll tills SEO-migrering; THCNM-delen kräver särskild juridisk hantering |
| 6 | `.template-components__html-editor` (3:e) | "Till Butiken"-knapp | → `/bestsellers` | — | Behåll |
| 7 | `.template-components__html-editor` (4:e) | "Vanliga frågor" (1177 tecken, FAQ-liknande innehåll) | Ej granskat om strukturerad FAQ-data (schema.org) finns | Sannolikt unikt | Kandidat för tillgängligt accordion i SEO-migreringen — inte gjort nu |

**Ej hunnet inom tidsbudgeten:** fullständig footer-kalibrering (visuell
finjustering mot facits mobila footersystem) — footerns POSITION är
korrekt (efter allt SEO-innehåll, oförändrad ordning, inget flyttat),
men dess DETALJERADE visuella kalibrering (rubriker/länkar/kolumner/
mellanrum mot facits exakta mått) är INTE gjord denna omgång, flaggas
för en separat, kommande runda. Block #1/#4 i SEO-inventeringen ovan
är bara ytligt granskade (komponentnamn/textlängd), inte djupanalyserade
(sökintention/strukturerad data) — flaggat, inte gissat.

## Footer mobil-CSS — arkitektur-/cleanup-runda (2026-09-03, ren refaktor)

Rent arkitektur-/städarbete på `css/20-footer-v2-2026-07-06-mmsports-layout-5-kolumner-bo.css`,
ingen ny design. Utgångspunkt: commit `2957073` (mobilfootern klar,
se rapporten strax nedan). Mål: ta bort beroendet av två sent
tillagda, till filens slut tillhängda override-block (181+24 rader)
genom att integrera deras regler i komponentens befintliga struktur,
utan att ändra något renderat resultat.

**Metod:** en getComputedStyle-baserad före/efter-diff (temporärt
skript, ej committat) mätte ~28 selektorer × upp till 10 egenskaper
vardera vid 390/430/600/1440px, både före och efter refaktorn, mot den
riktiga skarpa sajten (med den redan kända gamla inklistrade
Head-fält-koden borttagen ur testfliken innan varje mätning — se
föregående rapport). Alla avvikelser undersöktes tills 0 kvarstod,
förutom två som visade sig vara ren mätbrus (samma exakta två
egenskaper skilde sig även mellan två körningar av EXAKT samma,
orörda kod — sannolikt en font-swap-timingrace på den skarpa sidan,
inte en regression).

**Kartläggning fann tre redan existerande, tidigare odokumenterade
döda/motstridiga deklarationer** (fanns redan i den skeppade koden i
`2957073`, inte introducerade denna runda — upptäckta för att
mobilblockets getComputedStyle-facit avslöjade att flera av mina egna
"kalibrerade" värden aldrig faktiskt vann):
1. `.nh-footer__col h3`/`.nh-footer__nl-col h3` mobil font-size/
   letter-spacing har ALDRIG vunnit — den äldre "neutralisera 4-kolumns-
   footern"-regeln `.nh-footer__grid .nh-footer__col h3{font-size:14px
   !important}` (rad 26-30, specificitet 0,2,1) är starkare än
   mobilregelns 0,1,1, oavsett källordning. Rubrikerna renderas alltså
   14px (inte 10.5px) på mobil — och har gjort det sedan `2957073`.
   Döda deklarationer borttagna (färg/margin, som FAKTISKT vinner,
   ligger kvar).
2. `.nh-footer__proof-row span span` (trust-radens brödtext) fick
   ALDRIG font-size:9.5px/line-height:1.4 — Nyehandels egna
   span-taggnivå-reset (`font-size:16px!important` osv, samma
   mönster som redan dokumenterat i "Parity-workflow" i `CLAUDE.md`)
   vinner eftersom mina deklarationer saknade `!important`. Text visas
   alltså 16px, inte 9.5px, sedan `2957073`. Döda rader borttagna.
3. `.nh-footer__copy` (copyright-raden) har ALDRIG kunnat styras av
   NÅGON av css/20:s regler för den — varken den gamla basregeln, det
   gamla ≤560px-blocket eller mitt nya ≤860px-block. En kvarlevande
   selektor i `css/05` (`.nh-footer__bottom p{text-align:center
   !important;font-size:18px!important}`, specificitet 0,1,1) från
   den ÄLDRE 4-kolumns-footern matchar fortfarande vårt `<p
   class="nh-footer__copy">` och vinner på ren specificitet. Detta
   gäller BÅDE mobil och desktop — inte en mobil-specifik bugg. `css/05`
   rördes inte (utanför denna omgångs filomfång, skulle även ändra
   desktop) — `.nh-footer__copy` behöver en mer specifik selektor (eller
   att css/05:s legacy-regel äntligen tas bort) i en framtida, egen
   omgång om den ska gå att styra. Dokumenterat i en kodkommentar på
   plats i `css/20...` samt här.

**Genomfört:**
- De två sent tillagda ≤860px-blocken (från förra rapporten) och det
  gamla ≤560px-blocket slogs samman till EN plats direkt efter
  tablet-blocket (≤1080px), i komponentens naturliga ordning
  (yttre ram → disclaimer → trust/proof-rad → inner/grid → varumärke →
  länkkolumner → nyhetsbrev → kontakt → botten-rad) — inte längre
  utspritt efter orelaterat PDP-innehåll i filens slut.
- Två äkta ≤560px-specifika egenskaper (`.nh-footer__contact{align-
  items:flex-start}` och `.nh-footer__bottom .nh-footer__pay
  {justify-content:center}` — verifierat att de skiljer sig mellan
  430px och 600px i den redan skeppade koden) fick ett eget litet
  ≤560px-block i stället för att felaktigt breddas till 860px, vilket
  hade ändrat det renderade resultatet vid 600px.
- Under arbetet upptäcktes och rättades två egna nya buggar innan
  commit: en glömd oskopad `.nh-footer__proof-row{display:none}`-
  grundregel (utan den läckte trust-raden igenom som ett trasigt
  fullbredds-block på DESKTOP) och en av misstag borttagen `!important`
  på nyhetsbrevfältets `border-radius` (kolliderade med en
  `!important`-märkt legacy-regel i `css/05`). Båda fångades av
  före/efter-diffen innan commit, inga syns i slutresultatet.

**Rader i filen:** 751 → 729 (netto -22 rader; borttaget var betydligt
mer än så, men konsolideringen lade till förklarande kommentarer om de
tre nyupptäckta döda/motstridiga fallen ovan).

**`!important` i mobilfooterblocket:** 90 → 59 (-31, -34%). Kvarvarande
59 är samtliga verifierade via getComputedStyle/CSSOM-regelträff mot
konkreta, konkurrerande `!important`-regler som annars vinner:
- css/20:s EGNA oskopade basregler (padding/grid-template-columns/
  font-size/color m.fl. på `.nh-footer__inner`, `.nh-footer__grid`,
  `.nh-footer__brand-col .nh-footer__tagline`, `.nh-footer__col h3`,
  `.nh-footer__col a(:hover)`, `.nh-footer__nl-col > p`, `.nh-footer__
  nl-form(+input+button)`, `.nh-footer__contact a(:hover)`, `.nh-footer
  __bottom`, `.nh-footer__bottom .nh-footer__pay-label`) — alla dessa
  satte samma egenskap med `!important` redan innan denna omgång.
- css/20:s tablet-block (`@media max-width:1080px`, `!important` på
  `.nh-footer__grid`/`.nh-footer__brand-col,.nh-footer__nl-col{grid-
  column}`/`.nh-footer__nl-form{max-width}`).
- `css/05`:s kvarlevande 4-kolumns-footer-selektorer (`!important` på
  `.nh-footer__disclaimer p`, `.nh-footer__nl-form input{border-radius}`
  — den senare upptäcktes just genom att jag av misstag tog bort dess
  `!important` och diff-verktyget slog larm).
- Nyehandels egna tagg-nivå-resets (span/p font-family/weight, se
  `CLAUDE.md`s "Parity-workflow").

Borttaget `!important` (31 st) satt på egenskaper utan NÅGON
konkurrerande deklaration vid någon specificitet i css/05, css/16
eller css/20 (verifierat, inte gissat) — bl.a. `.nh-footer__grid`:s nu
borttagna `text-align:left` (redundant, ärvs redan oskopat från rad
21-25), `.nh-footer__nl-form{margin}`, flera nya `.nh-footer__nl-form
input/button`-egenskaper (`min-height` m.fl.), `.nh-footer__bottom
{flex-direction/text-align}`, `.nh-footer__bottom .nh-footer__pay-
label{text-align}`, samt de två ≤560px-egenskaperna.

**Filer ändrade:** endast `css/20-footer-v2-2026-07-06-mmsports-
layout-5-kolumner-bo.css` (och detta STATUS.md-avsnitt). `js/08-
footer.js` rördes inte (redan korrekt separerad komponent). `css/05`/
`css/16` lästes fullständigt men rördes inte (skulle påverkat desktop
och/eller andra sidor utanför omfång).

**Verifiering:** getComputedStyle-diff (~28 selektorer) vid 390/430/
600/1440px = 0 verkliga skillnader (2 kvarvarande är bevisad mätbrus,
se metod ovan). 0px horisontell overflow vid alla fyra bredder. 18
footer-länkar oförändrade. Nyhetsbrevsformulärets DOM/id/submit-
handler orörd. Desktop 1440px visuellt identisk (skärmdump jämförd).
Kategori-/produktsidornas footer opåverkade (ingen ändring utanför
css/20). Facitens 2×2-länkkolumnpar är fortsatt en dokumenterad,
INTE dold eller självständigt godkänd, kvarvarande avvikelse — footern
kallas alltså fortfarande inte 1:1 mot facit.

---

## Footer mobilpass — GENOMFÖRT och verifierat (2026-09-03, uppföljningsomgång)

Färdigställde det som lämnades öppet i föregående runda (nedan), utan ny
research — samma facit-underlag återanvändes direkt.

**Klart denna omgång** (`js/08-footer.js` + `css/20-footer-v2...`, allt
mobil-scopat `@media max-width:860px`, desktop helt orört):
- Trust-/leveransraden: ny `.nh-footer__proof-row` (2×2 ikon-kort, samma
  SVG-path-data som header-mikrotrusten) infogad direkt efter disclaimern,
  ANVÄNDER footerns egna redan befintliga 5 riktiga påståenden (Säker
  betalning/Diskret frakt/Skickas från Sverige/Labbtestade produkter,
  18+ utelämnad — redan täckt av disclaimern ovanför) i stället för att
  duplicera transparensblockets Trustpilot-/leveransgaranti-fakta. Den
  gamla platta `.nh-footer__trust`-raden döljs på mobil men behålls
  oförändrad och synlig på desktop (samma DOM-nod, ingen borttagning).
- Huvudfooterns bakgrund: facits uppmätta `radial-gradient(...) +
  linear-gradient(145deg,#27331e,#1e2716,#303b24)` i stället för den
  gamla platta `rgb(35,35,29)`.
- Kolumnrubriker `#f1bf87`/10.5px versal, länkar `rgba(255,255,255,.88)`/
  11.5px, tagline `rgba(248,237,223,.72)`/12.5px — facits mobila värden.
- Nyhetsbrevsfältet omstylat till facits tvådelade rundade rektangel
  (ljus input + orange "Skriv upp mig"-knapp) i stället för den runda
  pill+ikon-knappen. **Formulärets funktion (`preventDefault`,
  testahazey10-meddelandet) helt orörd** — bara utseende.
- Botten-raden: facits `rgba(244,233,220,.12)` border / `.55` text,
  kolumn-stack på mobil.
- 600px-lucka rättad: grid-mallen tvingas till en enda kolumn för HELA
  390-860px-spannet (den gamla `@media max-width:560px`-brytpunkten
  lämnade 600px i en tvåkolumns tablet-layout mitt i mobilspannet).
- Länkkolumnernas 2×2-parning (facit) implementerades INTE — vår
  3-kolumns-stack (Kundservice/Utforska/Populära kategorier) behölls,
  samma redan godkända princip som tidigare ("annat men funktionellt
  innehållsupplägg, inga länkar tas bort").
- `#cdfc9f` (nyhetsbrevets "10%"-badge) lämnades **oförändrad** — det är
  ett genuint sitewide brand-token (se `css/14`s kommentar "Brand
  tokens: #323d25 #4faa25 #cdfc9f..."), inte en MMSports-krock som
  disclaimer-/kontaktlänksfärgerna i förra omgången.

**Viktig sidoupptäckt under felsökning (inte en kodbugg i det här
repot):** `hazeyse.nyehandel.se`s Kodläge-Head-fält innehåller redan en
STOR, direkt inklistrad, INAKTUELL kopia av hazey.css+js (en `<style>`
på ~265 KB, ingen `proof-row` i den) — separat från `blocks/loader.html`s
jsDelivr-pekare (`Oliverforss8/hazey-storefront@v1.0.3`). Den skapar en
egen gammal `.nh-footer` INNAN någon testinjicerad kod hinner köra, vilket
gjorde tidiga skärmdumpar i den här omgången missvisande (verktygets
`initFooter()`-guard `if (document.querySelector(".nh-footer")) return`
såg den gamla noden och avbröt). Alla slutgiltiga skärmdumpar i den här
omgången tar bort den gamla inklistrade `<style>`+`.nh-footer` INNANFÖR
testfliken innan ny kod injiceras (rör ingenting på skarpa sajten). Värt
att Vilmer känner till att Head-fältet har gammalt inklistrat innehåll
liggande — se `CLAUDE.md`s säkerhetsavsnitt om Kodläge.

**Verifierat:** 390/430/600/1440px, 0px horisontell overflow på alla,
18 footer-länkar oförändrade (ingen borttagen), newsletter-formulärets
DOM/handler orörd, desktop 1440px pixelidentisk med före ändringen,
footerns position (efter SEO-innehållet) och kategori-/produktsidornas
footer opåverkade.

---

### (Föregående, nu inaktuell delrapport, bevarad som historik)

## Footer mobilpass — DELVIS genomfört, tidsbudget nådd (2026-09-03)

**Konkret bugg hittat och fixat:** den övre disclaimer-remsan
(`.nh-footer__disclaimer`, "Du måste vara minst 18 år...") hade
`background:#bce691` — en ljus limegrön MMSports-arvsfärg (`css/05`)
som krockade rakt av mot facits varma mörkolivgröna footerpalett.
Facit har INGEN separat ljus disclaimer-remsa alls — motsvarande
18+-text sitter i botten-radens redan mörka ton (`.footer-bottom`,
index.html rad 5291-5294). Rättat mobil-scopat (`css/20-footer-v2...`,
nytt `@media max-width:860px`-block längst ner i filen): mörk
bakgrund + ljus text i stället för limegrönt. Kontaktlänkarnas
(Hej@/Butik@hazey.se) matchande limegröna färg (`#4faa25`) rättad till
facits varma terrakotta (`#f2a459`, redan använd i kolumnlänkarnas
hover-ton). Desktop-reglerna i `css/05` orörda (ny override bara i
mobil-media-queryn).

**INTE hunnet inom 25-minutersbudgeten** (huvuddelen av tiden gick åt
att extrahera facits fullständiga footer-CSS/markup — 5 kolumn-
grupper, trust-rad, botten-rad, uppmätta mobila värden vid rad
685-760/5222-5296 i index.html — samt diagnosticera den nuvarande
footerns struktur, byggd av en ÄLDRE fil `js/08-footer.js` +
`css/20-footer-v2...` med ett annat kolumnupplägg än facit, redan
tidigare konstaterat okej att behålla strukturellt annorlunda):
- Trust-/leveransraden (facit: 4 länkade proof-cards överst, ikon+
  rubrik+text) — vår nuvarande `.nh-footer__trust` (enkla textlabels,
  placerad i BOTTEN i stället för TOPPEN) är INTE omkalibrerad denna
  omgång.
- Huvudfooterns exakta bakgrundsgradient (facit: `radial-gradient(...)
  ,linear-gradient(145deg,#27331e,#1e2716,#303b24)`) — vår
  `rgb(35,35,29)` är en nära men INTE identisk mörk ton, inte bytt.
  Verifierat "nära nog" via skärmdump, inte pixel-mätt mot facit.
  Newsletter-input/knapp, kolumnrubrikers exakta typsnitt/spacing,
  botten-radens layout — INGET av detta mätt eller kalibrerat denna
  omgång.

**Ingen länk togs bort, ingen ny destination hittades på, newsletter-
formulärets nuvarande (icke-riktigt-kopplade) status orörd, footerns
position (efter SEO-innehållet) och kategori-/produktsidornas footer
opåverkade.** Rekommenderar en egen, fullständig footer-runda med hela
tidsbudgeten dedikerad dit — denna omgångs research (facits fullständiga
mobila CSS/markup, redan extraherad och citerad ovan) återanvänds direkt
utan att behöva göras om.
