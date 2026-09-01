# hazey-storefront — permanent kontext

Läses automatiskt av Claude Code vid varje ny session i det här repot. Innehåller
bara sådant som INTE ändras session till session. Löpande status (vad som är
klart, vad som är näst, öppna frågor) står i `STATUS.md` — kolla den också.

## Vad det här är

Hazey.se's butik körs på plattformen **nyehandel** (hazeyse.nyehandel.se), en
Vue/Vuex-app. Plattformen exponerar bara ett globalt CSS-fält, ett globalt
JS-fält och ett `<head>`-custom-code-fält i sin admin — det här repot är
källkoden som byggs ihop och klistras in där. Det är en CSS/JS-reskin ovanpå
plattformens egen HTML/Vue-DOM, INTE plattformens eget mallsystem
(`[#slot]`-variabler finns men används inte just nu — se referens nedan om det
någonsin blir aktuellt).

Repot forkades 2026-08-28 från en tidigare kontraktors (`Oliverforss8`) konto
till Vilmers eget GitHub (`vilmerwahlberg-netizen`), för att sluta bero på hans
konto.

## Struktur

Fullständiga build-instruktioner står i `README.md` — läs den för
`node build.js`, deploy-flöde och loader-detaljer. Kort sammanfattat:

- `css/` — numrerade filer i ORIGINALORDNING. Flytta INTE runt befintliga
  filer (senare filer override:ar tidigare med samma selektor med avsikt —
  ombytt ordning kan ge tysta regressioner). Ny, orelaterad styling → ny fil
  sist i sekvensen (t.ex. `21-header-v2.css`).
- `js/` — `00-core-open.js` (self-repair-patch + delade helpers) måste vara
  först, `19-core-close.js` (de explicita `initX()`-boot-anropen) måste vara
  sist. Allt däremellan är fristående `function initX(){}`-deklarationer (JS
  hissar dem, inbördes ordning spelar ingen roll). Ny funktion → ny fil
  namngiven så den sorterar mellan `00` och `19` (t.ex. `18a-header-v2.js`,
  se `build.js`s egen kommentar) + ett nytt anrop i `19-core-close.js`s
  boot-lista.
- `blocks/` — innehållsblock som klistras in per sida i nyehandel-admin,
  inkl. `loader.html` (produktion, jsDelivr-tagg) och `loader-dev.html`
  (lokal/dev-testning, ej i produktion).
- `build.js` — `node build.js` slår ihop css/js till `hazey.css` /
  `hazey.html` / `hazey.min.js`. Redigera ALDRIG de genererade filerna
  direkt.

## Verifierade tekniska integrationspunkter (från befintlig kod i `js/`)

Riktiga plattformsfakta, inte gissningar — läst ur befintliga fungerande
filer, håll dessa i huvudet för allt header/cart-arbete:

- `#store-header` är den riktiga headerns rot-DOM (redan `position:fixed`,
  se `js/14-header-scroll.js` som redan gör headroom-slide vid scroll —
  återanvänd/bygg vidare på den, skriv inte en ny scroll-hanterare).
- `.topbar` → `.topbar-usp` → `.usp` (USP-listan, `<li>`-element) — verifierat
  2026-08-28 mot skarpa sajten, båda klasserna finns, nästlade i varandra.
- Startsidans hero är nyehandels EGEN native slideshow-komponent
  (`.template-components__slideshow .slideshow`, se `js/01-slideshow.js`),
  INTE `blocks/hero.html` — den senare låg inte live vid kontroll 2026-08-28.
  Reskinna den riktiga karusellen (typografi/färg), rör inte dess rotation/JS.
- Riktiga nav-kategorier (verifierade 2026-08-28, ~40 st) följer mönstret
  `{cannabinoid-eller-serie}-{format}`, t.ex. `thca-vapes`, `m-s-buds`,
  `nano11-blommor`. Se `js/18a-header-v2.js` för klassificeringsreglerna som
  härleder format/cannabinoid/serie ur detta mönster live ur DOM:en —
  uppdatera reglerna där, inte en hårdkodad lista, om nya kategorier tillkommer.
- Cart-state nås via nyehandels egen Vuex-store (`cart/addVariant`-action)
  med ett fetch-fallback (`/frontend-api/cart`, `/frontend-api/cart/item`) om
  store inte är exponerad — se `js/00-core-open.js`. Använd SAMMA mönster
  för en ny cart-räknare i headern, bygg inte en egen parallell
  cart-integration.
- `#cartAside` (Vue-varukorgens drawer) skrivs över av Vue:s eget
  re-render — injicerad HTML måste guardas mot att den egna raden redan
  finns (kolla for en egen marker-klass) och köras om vid varje re-render,
  se mönstret i `js/05-cart-checkout.js`.
- Nyehandels dokumenterade `[#slot]`-headervariabler (om slot-systemet någon
  gång aktiveras): `[#logo]`, `[#search]`, `[#navbar]`, `[#account-icon]`,
  `[#basket-icon]`, `[#hamburger]`, `[#usp]` m.fl. — se
  support.nyehandel.se/sv/articles/8679707-design-med-egen-html.

Nyehandels riktiga header-DOM (kartlagt via JS-inspektion av den skarpa
sajten, verifiera detaljer mot dagens live-DOM innan större CSS-arbete):
```
#store-header
  .topbar (.usp, .channel-controls)
  .main (.left, .center, .right)
  nav.navbar (.navbar-menu)
```
CSS/JS ska re-skinna DESSA element, inte ersätta hela DOM-strukturen.

## Uppdraget: header + startsida — mot nyehandels riktiga DOM (selektiv kodportering tillåten, se princip nedan)

Vilmer är inte nöjd med nuvarande header/startsida (byggd av
kontraktorn/Oliver). Han har en egen prototyp som visar hur det ska se ut och
kännas.

**⚠️ RÄTT FIL (verifierad med Vilmer 2026-08-31), använd INGEN annan:**
```
../../chatgpt-claude-handover/CLAUDE-HANDOFF-2026-08-17/prototyp/index.html
```
(dvs `HZY/chatgpt-claude-handover/CLAUDE-HANDOFF-2026-08-17/prototyp/index.html`
relativt hemmappen — OBS: en katalognivå ovanför `HZY/hemsidor/`, inte inuti den.
Senast ändrad 2026-08-24, ~7740 rader, egen `assets/`-mapp bredvid.)

**En äldre fil, `HZY/hemsidor/header-startsida/ny-header-child.html`
(senast ändrad 2026-08-11, ~3870 rader), användes av misstag för HELA det
första bygget av header+hero+"Populära vägar"+"Hitta rätt" (2026-08-28/29).
Vilmer flaggade 2026-08-31 att den filen redan då var väldigt olik hans
faktiska design, och att den rätta filen ovan skiljer sig ÄNNU mer — bl.a.
helt annan mobil-header-layout (hamburgare vänster + centrerad logga, alltid
synligt sökfält direkt under headern), en ny "Populära serier"-sektion
(rund logotyp-rad, datadriven via `data-pser-row`, INTE hårdkodad), och
hero som ett inramat/rundat kort snarare än kant-till-kant. Design-tokens
(färger/radier/skuggor/typsnitt, se nedan) var identiska mellan filerna, så
det arbetet var inte bortkastat — men IA/layout/komposition måste läsas om
från den RÄTTA filen innan nåt mer byggs. Se STATUS.md för vad som konkret
behöver göras om.**

**Portningsprincip (uppdaterad 2026-09-01 — ersätter den tidigare absoluta
"skriv allt om från grunden"-regeln):**

> Visuell komponentmarkup, komponentstruktur, relevanta CSS-regler,
> designvärden och media-query-beteenden från den godkända prototypen får
> återanvändas selektivt när det är det säkraste sättet att uppnå
> verifierad visuell paritet.
>
> Prototypens router, mockdata, falska räknare, appövergripande JavaScript,
> overlay-manager, demo-navigation och två fullständiga parallella
> desktop-/mobilträd får inte kopieras in som ny produktionsarkitektur.
>
> Den portade visuella implementationen ska använda Nyehandels riktiga
> länkar, data, sökfunktion, konto, varukorg och DOM-integrationspunkter.
> Ett responsivt produktionsträd ska användas där det är praktiskt.
> Resultatet ska verifieras med parity-systemet.

Konkret: prototypfilen är fortfarande INTE ett bibliotek att klippa rakt ur
rakt av (rätt selektorer/CSS-variabler måste översättas mot nyehandels
riktiga DOM, inte klistras in oöversatta) — men till skillnad från den
tidigare regeln är det numera uttryckligen okej att låta portad CSS/markup
vara identisk eller nästan identisk med prototypens egen, när det är vad
som krävs för att `npm run parity` faktiskt ska bli grönt. Se
`tests/blueprints/` för konkreta, elementvisa portningsspecifikationer som
tillämpar principen (varje blueprint dokumenterar facitselektor →
implementationselektor, vad som är markup-portabelt kontra CSS-endast, och
vilken riktig nyehandel-funktionalitet som måste bevaras).

Fortfarande gäller oförändrat: `dVp`/`mVp`-uppdelningen (två separata
DOM-träd, växlade med media queries) är en demo-lösning — den riktiga
implementationen ska vara ETT responsivt träd. Sök-autocomplete,
varukorgsräknare OCH trust-siffror (kundantal, Trustpilot-betyg) i
prototypen är antingen hårdkodad mock-data eller uttryckligen markerade i
filens egna kommentarer som "ska verifieras/hämtas dynamiskt före
publicering" (sök t.ex. "8 000+", "KRÄVER RIKTIG KÄLLA" i filen) — i riktig
kod kopplas allt mot nyehandels egen data eller lämnas tomt, ALDRIG fejkat.

**Vad som fortfarande alltid är portabelt** (oförändrat sen tidigare):
1. De uppmätta designvärdena (se nedan).
2. Informationsarkitekturen — vilka element headern innehåller, hur
   navigationen är strukturerad, vilka sektioner startsidan har.
3. Copy/text — rubriker, mikrotexter, CTA-formuleringar (med reservation för
   varumärkesröst-regeln nedan).

Prototypfilen (~7740 rader) — grova landmärken, verifiera radnummer på nytt
om filen uppdateras igen:
- rad 9–36: `:root` — designvärdena (samma som i förra filen, se nedan).
- rad 2618: `<div id="dVp">` — DESKTOP-markup.
- rad 3774: `<div id="mVp">` — MOBIL-markup (separat träd, egen header-layout).
- rad 3957–4020 (mobil) / motsvarande i dVp: hero + "Populära serier"
  (`#m-populara-serier`, datadriven, INTE hårdkodad markup) + "Populära
  vägar" (`#m-populara-vagar`, 2×2-rutnät + separat framställnings-segment
  under, terminologin där är just nu **"Semisyntetiskt"** — inte beslutat,
  se öppna frågor) + `#m-aura-guiden` (fortfarande `AVSTÄNGD`, oförändrat).
- rad 4409–4413: "Om Hazey"-sidans fakta-rutor — **INNEHÅLLER
  "8 000+ kunder"/"4,7/5 Trustpilot"/grundandeår, men filen kommenterar
  UTTRYCKLIGEN att de "ska verifieras eller hämtas dynamiskt före
  publicering"** (rad 4448) — gissa/anta ALDRIG att de är godkända riktiga
  tal utan att fråga Vilmer.
- rad 6219–6275: JS-mönster för Trustpilot-data — `TRUST`-objekt som är
  `null` tills en riktig widget/API kopplas in, renderar bara om verkligt
  värde finns. **Använd samma mönster för all trust-/räkningsdata vi bygger
  — no-data ska alltid rendera "inget", aldrig ett gissat tal.**
- Sista `<details class="notes">`-blocket: intern utvecklardokumentation
  (ej kunddesign) med samma typ av ändringslogg/öppna-frågor-struktur som
  förra filen — läs den för senaste resonemanget innan du bygger vidare.
  Bekräftar bl.a. att **Aura-systemet fortfarande är AVSTÄNGT/oöverenskommet**.

## Uppmätta designvärden (facit, inte att gissa på)

**Färger:**
`--green:#2c3620` `--beige:#e4d1bf` `--sand:#faf3e9` `--beige-light:#f4e9dc`
`--cream:#fffdf8` `--line:#ebe1d1` `--terra:#b8865a` `--terra-deep:#96683f`
`--olive:#6f7a52` `--leaf:#4d7042` sidbakgrund `#efe9df` CTA-orange `#d9782f`

**Typsnitt:** rubriker Iowan Old Style, 19px.

**Reveal/scroll-animation** (benchmarkat mot tershine.com/dadgrass.com):
`translateY(24px)`, easing `cubic-bezier(.25,.46,.45,.94)` (ease-out-quad),
duration 0.62s, stagger 90ms (max 4 steg).

**Regel:** animera ALDRIG collapsing properties (max-height/padding) på
headern vid scroll — använd fast höjd + `transform`-slide (se befintlig
`js/14-header-scroll.js`), annars tvingas layout-omflöde fram (jank). Animera
heller aldrig barn i en vågrät scroll-snap-container.

## Fyraxel-taxonomin (navigations-/filterprincip)

Format, produkttyp, serie och cannabinoid ska hållas som FYRA OBEROENDE
dimensioner/attribut, inte plattas till en enda kategorilista. Nuvarande
mega-meny i nyehandel bryter mot detta. Ha detta i huvudet när
navigationen/mega-menyn byggs om — sortimentet är brett, sök/navigation är
kärnan i erbjudandet, och det är en av huvudanledningarna till att headern
görs om överhuvudtaget.

## Arbetsregler (gäller allt arbete i detta repo, inte bara header/startsida)

- **Inget hårdkodat, allt datadrivet** — det här är ett återkommande, redan bevisat mönster i befintlig prototypkod (se `kategorisidor-dynamiska-snabbval` i projektdokumentationen): kategorichips, bildval, produkträkning och filteralternativ ska genereras/räknas live från riktiga produktkort varje gång, ALDRIG från en statisk lista eller hårdkodad mediakarta. Ett filteralternativ med 0 träffar ska döljas, inte visas tomt. Om du skriver en lista, en räknare eller ett kort med fasta värden i ny kod — stanna och fråga dig om det borde härledas ur nyehandels riktiga data istället.
- **Hitta aldrig på trust-data eller produktdata** (antal kunder, recensioner,
  lagerstatus, "X sålda", falska produkter) — om verkligt värde saknas, fråga
  Vilmer eller lämna platshållare tydligt markerad, gissa/fejka inte.
- **Ta aldrig bort befintligt innehåll utan explicit lov** — generellt
  godkännande finns att LÄGGA TILL och ändra layout, men innehåll ska inte
  försvinna utan att Vilmer sagt ja.
- **Stäm av mot BÅDA desktop och mobil** innan en sektion anses klar —
  prototypens `dVp`/`mVp` är separata träd med separata detaljer, det räcker
  inte att kolla en av dem.
- **Varumärkesröst (hård gräns):** hazey.se profilerar sig som tryggt,
  lagligt, transparent. ALDRIG påståenden om rus eller medicinska effekter i
  ny copy — och inte heller indirekt via gruppnamn som antyder att andra
  produkter ger rus (t.ex. "rusfritt" som segmentnamn är redan konstaterat
  fel), oavsett vad som står i äldre texter eller konkurrenters copy.
- **Terminologi ännu INTE bestämd:** "naturidentiskt/semisyntetiskt" vs
  "fullt naturliga/halvsyntetiska", samt aura-namngivning/aura som koncept
  överhuvudtaget — öppna frågor Vilmer behöver ta ställning till, gissa inte
  och lås inte fast ett val i ny kod/copy utan att fråga.
- **Korta, konkreta avstämningar** — Vilmer vill ha handfasta förslag och
  korta pitchar, inte långa textväggar. Visa hellre en konkret diff/skiss och
  fråga "blev det så här?" än att beskriva planen i löpande text.

## KRITISKT — säkerhet mot skarpa sajten

nyehandels Kodläge (Layout → Hantera → `</>`-ikonen i admin) har **ingen
säker draft/sandbox-status**. Verifierat konkret: en testrad sparad i
Head-fältet låg LIVE på skarpa sajten (hazeyse.nyehandel.se, utan
preview-parameter) omedelbart efter klick på Spara i Kodläge-modalen.
`?preview=`-länken är INTE en isolerad förhandsvisning — den visar bara samma
aktiva tema som redan är publicerat.

Konsekvens: gör ALDRIG experimentella ändringar direkt i nyehandel-admin. All
utveckling sker lokalt i det här repot. Om något någonsin behöver verifieras
mot den riktiga sajten: fråga Vilmer först, gör det så kort som möjligt och
återställ omedelbart.

Produktionsloadern (`blocks/loader.html`) pekar på en pinnad jsDelivr-tagg —
INGET härifrån är live förrän någon medvetet klistrar in nytt innehåll i
nyehandel-admin och sparar. Det är alltså säkert att jobba fritt i det här
repot.

## Git

- `main` — den senaste committade strukturen.
- Arbete sker normalt på en `dev`-branch (raw.githack.com-loadern i
  `blocks/loader-dev.html` pekar dit) — kolla `STATUS.md` för branchens
  faktiska nuläge, den har varit inkonsekvent skapad mellan sessioner.
- Push kräver en GitHub Personal Access Token (ingen sparad i miljön —
  be Vilmer skapa en ny vid behov, samma modell som andra API-nycklar i det
  här projektet: skapa vid behov, spara inte).
