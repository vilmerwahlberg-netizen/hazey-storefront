# Hazey Design System

> **Status 2026-09-08:** Den här filen dokumenterar huvudsakligen verifierade
> implementationstokens och plattformsregler från tidigare facit/parity-rundor.
> Den nuvarande samlade cream/serif/terrakotta- och kortestetiken är uttryckligen
> avvisad som slutlig premiumriktning. Vid ny design eller redesign ska
> `agent-skills/hazey-commerce-design/SKILL.md` och dess beslutsregister styra
> processen. Behåll denna fil som teknisk faktabas; behandla den inte som ett
> krav att bevara dagens visuella helhet.

Kanonisk, verktygsoberoende designkälla för Hazey.se:s reskin (både för
Claude och Codex). Beskriver PRINCIPER, inte hundratals exakta CSS-värden
— exakta tal lever i `css/`-filerna själva och facitets `index.html`
(se `CLAUDE.md` för sökväg). Om ett värde i denna fil och i koden
skiljer sig: koden (efter senaste verifierade facit-kalibrering) vinner,
uppdatera denna fil.

## 1. Varumärkesriktning

Hazey ska uppfattas som **marknadsledande, genomtänkt, dyrt, tryggt och
seriöst** — visuellt distinkt med en **West Coast / hippie / rap-
inspirerad** ton som är **varm och mänsklig**, aldrig klinisk.

**Är:** premium editorial commerce, varm, jordnära, hantverksmässig,
trygg, transparent.

**Är inte:**
- Klinisk apoteks-/labbestetik.
- Aggressiv "stoner"-kliché (bladmönster, neon, graffiti-typsnitt).
- Generisk Shopify/Tailwind/AI-mall-känsla (blå-vita gradienter,
  Inter/system-font utan karaktär, symmetriska ikonrutor utan
  hierarki).
- Överlastad eller desperat säljig (blinkande rabatter, countdown-
  timers, popup-spam).

Varumärkesröst (hård gräns, se `CLAUDE.md`): aldrig påståenden om rus
eller medicinska effekter, inte ens indirekt via segmentnamn.

## 2. Färgroller

Hazey har EN varm, jordnära palett. Roller (inte bara hex-värden):

| Roll | Värde | Användning |
|---|---|---|
| Brand-grön (mörk, text/yta) | `#2c3620` | Rubriktext på ljus botten, mörk sektionsbakgrund, primär CTA-yta |
| Grön, dov (ikoner) | `#6f7a52` (olive) / `#4d7042` (leaf) | Ikoner, sekundära accenter |
| Terra/kopparbrun | `#96683f` (deep) / `#b8865a` (ljus) | Länkar, sekundär CTA-text, stjärnor |
| CTA-orange | `#d9782f` | Primär, säljande CTA (nyhetsbrev, hero) — använd sparsamt, en till två per vy |
| Beige (yta) | `#e4d1bf` | Native/äldre plattformsyta — ANVÄND INTE för nya komponenter, se §9 |
| Sand (kortyta, ljus) | `#faf3e9` → `#fffdf8` (gradient) | Standard ljust kort på sidbakgrund |
| Sidbakgrund | `#efe9df` | `.store-startpage`, aldrig vit |
| Linje/kant (ljus) | `#ebe1d1` | Kort-kant på ljus botten |
| Linje/kant (mörk botten) | `rgba(228,209,191,.16–.55)` | Kort-kant på mörkgrön botten |
| Off-white (text på mörk botten) | `#fffdf8` / `#f4e9dc` | Rubrik/text på mörkgrön botten — ALDRIG `#2c3620` på mörk botten (se §9, vanligaste kontrastbuggen i hela projektet) |
| Ink (brödtext) | `#26261f` / `#38381f` | Brödtext på ljus botten |
| Ink, dov (sekundär text) | `#5f5c50` / `#9a9280` | Metadata, tidsstämplar, sekundär text |

**Regel:** en yta har ANTINGEN mörkgrön botten + ljus text ELLER ljus/
sand botten + mörkgrön text. Aldrig mörk text på mörk botten (den
vanligaste, mest återkommande buggen i det här projektet — se
"Parity-workflow" i `CLAUDE.md`).

**Plattformens egna, separata, likaledes etablerade färger** (`#323d25`
+ Roboto, ~271 träffar över 19 CSS-filer i checkout/PDP/kategorisidor)
är en ANNAN, äldre, sajtomfattande konvention — rör den inte för att
"matcha" reskinnet, den hör till plattformens eget, redan fungerande
lager. Se §9.

## 3. Typografi

- **Rubriker:** "Iowan Old Style", "Palatino Linotype", Palatino,
  Georgia, serif — 600 vikt. Standardstorlek för sektionsrubriker:
  **19–20px mobil**. Endast hero-H1 och sidans enda H1 får vara
  markant större. Aldrig 22px+ för en vanlig sektionsrubrik (recall:
  27–28px-rubriker har upprepade gånger identifierats som "känns som
  ett gammalt separat tema").
- **Brödtext/UI:** -apple-system, "system-ui", "Segoe UI", "Helvetica
  Neue", Arial, sans-serif. Storlek 11–15px beroende på roll (kort-
  metadata minst, ingress/lede störst).
- **Native tag-reset-bugg (upprepad, dokumenterad):** Nyehandels egna
  `!important`-märkta tag-nivå-resets på `body,p,li,span,input,button,
  label,td,a,h1,h2,h3` slår tyst ut icke-`!important`-typografi. Varje
  ny text-/ikonelement MÅSTE mätas mot facit och få `!important` NÄR
  och bara när en bevisad konkurrerande native-regel finns — se
  `tests/typography-icon-checks.mjs`.

## 4. Spacing och rytm

- Mobil sido-inset: **14px** för startsidans reskinnade sektioner
  (uppmätt facit-värde, skiljer sig medvetet från plattformens äldre
  24px på andra ställen).
- Sektion-till-sektion-marginal: **22px** mobil (delad `.section-gap`-
  regel) — vissa övergångar har ett EGET uppmätt facit-värde (t.ex.
  Populära serier → Populära vägar: 15px, inte 22px). Gissa aldrig ett
  delat tal utan att mäta just den övergången.
- Kortpadding: 16–20px mobil beroende på komponent.
- Vertikal rytm mäts ALLTID med `getBoundingClientRect`, aldrig
  uppskattat ur en skärmdump.

## 5. Radier, kantlinjer, skuggor

- Kort-radiefamilj: **12–18px** för innehållskort (trustblock/kunskap/
  signup/reviews/artikel = 18px; produkt-/seriekort = 12–14px).
- Knapp-/chip-radiefamilj: **999px (pill)** för primära/sekundära CTA-
  knappar och filterchips (etablerat, brett använt). Enstaka native-
  knappar med 3px radie (t.ex. `.nh-test-btn`, `.nh-btn-bar__btn`) hör
  till plattformens ÄLDRE knappspråk (se §9) — mjuka upp radien om en
  enskild instans behöver harmoniseras, ändra inte hela klassen om den
  delas brett.
- Skugga: mycket subtil (`0 2–10px` blur, låg opacitet, `rgba(40,50,30,
  .12–.18)`-familjen) — dekorativt djup, aldrig en tung drop-shadow.

## 6. Bildspråk

- **Serieavatarer (cirkulära):** kvadratisk källcrop, produkten/
  förpackningen stor och centrerad, minimal negativ yta innan
  `background-size:cover` appliceras — förlita dig inte på blind
  `object-fit`/`cover` ensamt för bilder med mycket bakgrund.
- **Route-/lifestylekort (liggande):** samma varma studio-/utomhus-
  känsla över alla fyra kort i en rad — konsekvent färggradering,
  kontrollerad mörk gradient bakom text för kontrast.
- **Produktbilder (kort):** varm, ojämn "stage"-bakgrund (etablerat:
  `#d9c3ae`-ton, `object-fit:contain` ~68–82%) — ALDRIG en hård vit
  studio-bakgrund, ALDRIG en slumpmässig bild vald bara för att den
  råkar vara produktens FÖRSTA foto på en kategorisida, om en avsiktligt
  utvald bild finns.
- Bildkälla-prioritet: (1) riktig, avsiktligt utvald kategoribild om
  Vilmer bekräftat att en sådan finns och matchar kortets riktiga
  identitet, (2) riktig live-hämtad produktbild, (3) aldrig fabricerat/
  AI-genererat utan uttrycklig beställning.

## 7. Korttyper

| Korttyp | Bakgrund | Radie | Innehåll |
|---|---|---|---|
| Seriekort (cirkulär) | Sand/foto | 50% | Avatar + namn + dynamiskt antal |
| Route-/lifestylekort | Foto + mörk gradient | 12–16px | Bild, eyebrow, rubrik, underrubrik |
| Produktkort | Vit + varm stage-bakgrund för bilden | 12–14px | Bild, badge(ar), namn, betyg, pris, CTA, leveransrad |
| Trust-/kunskapskort | Vit på mörk/sand sektion | 12–14px | Ikon/rubrik + kort text |
| Artikel-/guidekort | Vit | 12–16px | Bild, ämnestagg, rubrik, kort ingress, länk |

## 8. CTA-hierarki

1. **Primär:** fylld, CTA-orange (`#d9782f`) ELLER mörkgrön
   (`#2c3620`)-yta med off-white text — en per vy/sektion.
2. **Sekundär:** outline eller ren länk i terra (`#96683f`), 650 vikt.
3. **Tertiär/informativ:** ren textlänk, ingen knappyta, används för
   "läs mer om X"-rader under ett primärt grid.

CTA-text får ALDRIG bli en lågkontrast-kombination (t.ex. dov terra på
mörkgrön) — kontrollera kontrast matematiskt (WCAG AA, ≥4.5:1 normal
text, ≥3:1 stor text/UI-komponenter) innan en färgkombination godkänns.

## 9. Vanliga fallgropar (läs innan nästa runda)

1. **Mörk text på mörk botten** — den enskilt vanligaste buggen i hela
   projektets historia. Uppstår när en DELAD regel (skriven för en ljus
   sektion) råkar träffa en mörk sektion också. Bryt alltid ut `color`
   separat per bakgrundsfärg, dela aldrig den egenskapen blint.
2. **Native tag-reset utan `!important`** — se §3.
3. **Flex/grid-item krymper i stället för att sträcka** — ett barn med
   `margin:0 auto` i en flex-förälder utan `align-items:stretch`, eller
   ett flex-barn vars EGET barn saknar `min-width:0`, konsumerar fritt
   utrymme via auto-marginal i stället för att fylla ut. Kedja
   `display:flex`/`min-width:0` hela vägen ner om ett syskon-kort ska
   ha samma höjd.
4. **Att blindt "fixa" en bred, delad plattformskonvention** — innan du
   ändrar en färg/knapp-radie, `grep` hur många andra filer/sidor som
   delar samma klass/hex-värde. >5–10 träffar över flera obesläktade
   sidtyper (checkout/PDP/kategori) = trolig etablerad, medveten
   konvention, INTE en avvikelse att harmonisera bort.
5. **Att anta att en skärmdumps-artefakt är en riktig bugg** — en
   `position:fixed`-header som "dubbleras" i en full-sides-skärmdump av
   ett element högre än viewporten är ett känt Playwright/webbläsar-
   capture-fenomen, inte ett fel i sidan. Verifiera alltid med en
   vanlig scroll-interaktion innan du "fixar" något du bara sett i en
   helsidesbild.
6. **Att fabricera data** — produktantal, kundomdömen, certifikat,
   kampanjer, artiklar: allt måste vara verifierbart i Nyehandels
   riktiga DOM/data. Ingen data = dölj fältet eller hela komponenten,
   visa aldrig ett gissat eller påhittat värde.

## 10. Trusthierarki (progressiv, se uppdragets egen lista för exakta
budskap)

Trust byggs upp i lager, inte som en enda upprepad lista:

1. **Mikrotrust (ovanför hero):** kortast möjliga signaler — Trustpilot-
   betyg, leveranstid, "från Sverige", leveransgaranti.
2. **Produktkort:** lagerstatus, relevant leveranstid, analysbadge
   ENDAST när riktig analys finns, riktiga omdömen, naturidentisk/
   semisyntetisk ENDAST när klassificeringen är bekräftad korrekt.
3. **Transparens-/processområde:** utvecklar HUR (vad analyseras, hur
   redovisas innehåll, hur kontrolleras/packas/skickas order, ingen
   crossborder, vad leveransgarantin konkret innebär).
4. **Footer/policysidor:** fullständiga villkor och länkar.

Upprepa aldrig exakt samma fyra rader ordagrant i flera sektioner —
variera formulering och detaljnivå per lager.

## 11. Responsiva principer

- Mobil är IN TE en nedskalad desktop, och desktop är INTE en
  uppskalad mobil — varje brytpunkt får en avsiktlig komposition.
- Primära brytpunkter: 390/393/430/600 (mobil), 1024/1180/1280/1440/
  1920 (desktop). Mät alltid mot facit vid den brytpunkt som är
  relevant — gissa aldrig ett mellanliggande värde.
- Alla sektioner på samma breddklass delar samma max-width och
  vänster-/högerkant-alignment.
- 0px horisontell overflow är ett absolut krav vid varje testad bredd.

## 12. Motionprinciper

- Motion ska tjäna kvalitet, feedback och orientering — aldrig
  blockera kundresan.
- Föredra `transform`/`opacity` (GPU-vänligt), undvik layout-
  animationer som ger CLS.
- Typiska varaktigheter: knappar 120–180ms, dropdown/accordion
  160–220ms, produktkort hover-lyft 150–200ms (subtil `translateY` +
  `scale` ~1.015–1.03), heroövergång 250–400ms.
- Respektera alltid `prefers-reduced-motion` — innehåll måste vara
  synligt och fungerande UTAN animation.
- Autoplay (om det någonsin används) ska vara långsamt, diskret, pausa
  vid interaktion och när fliken inte är aktiv.
- Förbjudet: scroll-jacking, custom cursor, kontinuerlig helsides-
  rörelse, animation som måste avslutas innan en CTA går att använda,
  text osynlig tills scroll, tunga 3D-bibliotek utan konkret
  affärsvärde.

## 13. Förbjudna designklichéer

- Bladmönster/neon/graffiti-typsnitt ("stoner"-kliché).
- Blå-vit gradient-hjälte-sektion (generisk SaaS-mall).
- Symmetriska ikonrutor utan hierarki (Tailwind-startmall-känsla).
- Countdown-timers, blinkande rabattbadges, popup-spam.
- Stockfoto-leende-modeller som inte är verkliga produkter/miljöer.
- Full-bredd, ostylad, plattformsnativ textvägg (den gamla "THCA med
  flera"-väggen var exakt detta — ersätts av kompakta guide-/kort-
  presentationer, se STATUS.md).

## 14. Definition of done för visuell implementation

En komponent/sektion är klar när:

1. Den är mätt mot facitets riktiga DOM/computed styles vid relevant
   brytpunkt — inte gissad ur en nedskalad bild.
2. Rotorsaken är fixad i komponentens ÄGANDE källfil (CSS/JS), inte i
   ett nytt "final fixes"-block.
3. `!important` (om det förekommer) är motiverat av en bevisad,
   namngiven konkurrerande regel.
4. Ingen fabricerad data förekommer (produktantal, omdömen, certifikat,
   kampanjer, artiklar).
5. 0px horisontell overflow vid alla testade bredder.
6. Kontrast är verifierad (räknad, inte antagen) för all text/CTA.
7. Tangentbord + skärmläsare fungerar (fokusläge synligt, ARIA korrekt,
   länkar är riktiga `<a href>`, inte bara klickbara `<div>`).
8. Desktop (om sektionen finns där) är en avsiktlig komposition, inte
   samma mobilmarkup bara bredare.
9. En människa som tittar på resultatet skulle beskriva det som en
   sammanhängande del av SAMMA produkt — inte ett gammalt tema som
   klistrats in bredvid ett nytt.
