# Parity-testworkflow

Läsordning för nästa komponentomgång (blueprint → mät → korrigera →
verifiera → godkänn). Detta är instruktionerna, inte statusen — se
`STATUS.md` i repo-roten för vad som faktiskt är klart och `CLAUDE.md`
för den permanenta projektkontexten.

## Filer

- `parity-sections.mjs` — facit-/implementation-navigering
  (`gotoFacit`/`gotoImpl`), `SECTIONS` (isolerade komponentjämförelser),
  `PACKAGE_GEOMETRY_*` (sammanhängande dokumentgeometri över flera
  komponenter, se nedan), låsta bild-fixtures. `gotoImpl` städar även bort
  ett känt, redan dokumenterat problem — hazeyse.nyehandel.se bär för
  närvarande en gammal, direkt inklistrad hazey.css/js-ögonblicksbild i
  Nyehandels Head-fält (se `STATUS.md` "Viktig sidoupptäckt") som annars
  hinner skapa sin egen `.nh-footer` INNAN testets färska build körs,
  vilket fick `js/08-footer.js`s `initFooter()`-guard att tyst hoppa över
  hela footer-ombygget. Skrivskyddat, bara inuti testflikens egen sida.
- `typography-icon-checks.mjs` — återanvändbara, skrivskyddade
  kontroller för textens fulla typografisignatur och ikoners geometri/
  styling, plus principerna för plattformshanterade regioner och
  avvikelseklassificering. Se docstringen i filen för full API — kort
  sammanfattat:
  - `measureTypography`/`diffTypography` — font-family/size/weight/
    line-height/letter-spacing/text-transform/color/opacity, elementet
    plus namngivna barn (t.ex. en `<b>` i en textrad).
  - `measureIcon`/`diffIcon` — SVG viewBox/bredd/höjd/fill/stroke/
    stroke-width/path-data/baseline-placering.
  - `PLATFORM_MANAGED_SELECTORS`/`isPlatformManaged` — DOM-regioner
    ägda av Nyehandels Vue-app, inte våra att mutera för pixelparitet.
  - `DEVIATION_CLASSES` — de fem obligatoriska klasserna för varje
    kvarvarande avvikelse vid godkännande (se CLAUDE.md för hela regeln).
- `home-parity.spec.mjs` — Playwright-testsviten, tre lägen styrda av
  `PARITY_MODE` (`update` skriver facit-golden, `update-impl` skriver
  implementation-baseline, `compare`/default kör BÅDA jämförelserna mot
  implementationen — se "Två separata baselines" nedan).
- `blueprints/` — en fil per komponent, dokumenterar DOM-mappning,
  geometri, typografi, portningsplan och rotorsaker. Namnge nya
  blueprints `<komponent>-port.md`.
- `golden/` — låsta FACIT-mätvärden (PNG + JSON), skrivs bara i
  `PARITY_MODE=update`. Svarar på "hur nära facit är implementationen".
- `golden-impl/` — låsta IMPLEMENTATION-mätvärden (PNG + JSON), skrivs
  bara i `PARITY_MODE=update-impl`. Svarar på en annan fråga: "har
  implementationen ändrats sen den senast granskades/godkändes",
  oberoende av om den sektionen någonsin var tänkt att matcha facit. Se
  "Två separata baselines" nedan — blanda aldrig ihop de två.

## Arbetsordning för en ny komponent

1. **Blueprint (skrivskyddad research).** Mät facit LIVE
   (`http://localhost:8765/index.html#/` — kräver att den lokala
   facit-servern körs) vid samtliga relevanta breddpunkter. Använd
   `typography-icon-checks.mjs` för varje textnod/ikon, inte bara
   `getBoundingClientRect()`. Läs facits källkod för att förstå VILKEN
   regel som vinner (cascade/specificitet), men lita aldrig på
   källkodsläsning ensamt — verifiera alltid med en riktig
   `getComputedStyle`/CDP-mätning innan du skriver ett värde i
   blueprinten. Dokumentera vilka native Nyehandel-regler som konkurrerar
   (samma mönster som header: breda `!important`-resets på tag-nivå).
2. **Implementation** (endast efter godkänd blueprint) — portar
   selektivt enligt principen i CLAUDE.md, scopat strikt till den
   godkända komponenten.
3. **Verifiera:** `npm run parity` (isolerade komponenttester +
   sektionsordning + ingen horisontell overflow + paket-geometri).
   Verifiera dessutom manuellt på start-/kategori-/produktsida och att
   desktop är helt orörd (samma checklista som header-rundorna, se
   STATUS.md för konkreta URL:er som redan använts).
4. **Klassificera varje kvarvarande avvikelse** i en av de fem klasserna
   i `DEVIATION_CLASSES` innan komponenten föreslås godkänd — ett grönt
   procenttest räcker aldrig ensamt.
5. **Godkännande** är manuellt (Vilmer), inte automatiskt vid PASS — se
   STATUS.mds header-kalibreringsrundor för hur en till synes godkänd
   automatisk körning ändå kan underkännas vid en riktig
   sida-vid-sida-granskning.

## Kommandon

```
npm run parity              # compare-läge: facit-parity + implementation-regression, båda
npm run parity:update       # skriver tests/golden/ (facit), kräver lokal facit-server (localhost:8765)
npm run parity:update-impl  # skriver tests/golden-impl/ (implementation), kräver INTE facit-servern
```

## Två separata baselines — blanda aldrig ihop dem

Tillagt 2026-09-04 efter att en genomgång av parity-sviten inför en
release candidate visade att 8 av 12 sektioner "failade" mot facit av
goda, redan godkända skäl (se `STATUS.md` "Release candidate-
förberedelse") — utan en separat baseline fanns inget sätt att skilja
"det här är ett känt, avsiktligt val" från "något gick sönder" utan att
läsa hela historiken manuellt varje gång.

- **`tests/golden/` (facit-parity)** svarar: *hur nära facit är
  implementationen just nu?* Många sektioner har ett dokumenterat,
  Vilmer-godkänt beslut att medvetet AVVIKA från facit (riktig data i
  stället för facits mockat innehåll, en helt egen komponent på samma
  plats i flödet, en strukturellt annorlunda men funktionellt likvärdig
  layout). Ett FAIL här, ensamt, är alltså INTE per automatik en bugg —
  det kan lika gärna vara en redan godkänd redesign som aldrig var
  tänkt att bli pixelidentisk med facit. Facit-filen själv ändras
  praktiskt taget aldrig, så denna baseline behöver sällan uppdateras.
- **`tests/golden-impl/` (implementation-regression)** svarar en helt
  annan fråga: *har implementationen ändrats sen den senast lästes av
  och godkändes, oavsett hur nära facit den är?* Snäv tolerans (6px
  bredd/10px höjd, max 3% pixelavvikelse) — SKA alltid vara grönt. Ett
  FAIL här ÄR en riktig regression: någon efterföljande ändring rörde
  en redan godkänd sektion utan avsikt. Uppdateras bara MANUELLT
  (`npm run parity:update-impl`), aldrig automatiskt, och bara efter att
  en människa (eller en session med en tydlig, dokumenterad
  granskningsrunda — se STATUS.md-mönstret för "GODKÄND"/"verifierad"-
  poster) faktiskt har bedömt det aktuella läget som korrekt. Att köra
  `update-impl` reflexmässigt för att "få testet grönt" urholkar hela
  poängen med baselinen — gör det bara efter en genuin granskning.

**I praktiken:** ett facit-parity-FAIL + implementation-regression-PASS
betyder "känt, redan godkänt avstånd från facit, ingenting nytt har
gått sönder" — det normala, förväntade tillståndet för de 8 sektioner
som listas i `STATUS.md`. Ett implementation-regression-FAIL (oavsett
vad facit-parity säger) betyder att något faktiskt förändrats sen
senaste granskning och förtjänar en riktig utredning innan det godkänns
på nytt.

## Låst baseline

Mobilheader + sökfält + övre mikrotrust (commit `f9e9854`, 2026-09-01)
är manuellt godkänd och låst — ändra inte dess produktions-CSS/JS utan
en ny, explicit instruktion från Vilmer. Nästa komponent i arbetet:
mobil hero (se `blueprints/mobile-hero-port.md`).
