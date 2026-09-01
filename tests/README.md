# Parity-testworkflow

Läsordning för nästa komponentomgång (blueprint → mät → korrigera →
verifiera → godkänn). Detta är instruktionerna, inte statusen — se
`STATUS.md` i repo-roten för vad som faktiskt är klart och `CLAUDE.md`
för den permanenta projektkontexten.

## Filer

- `parity-sections.mjs` — facit-/implementation-navigering
  (`gotoFacit`/`gotoImpl`), `SECTIONS` (isolerade komponentjämförelser),
  `PACKAGE_GEOMETRY_*` (sammanhängande dokumentgeometri över flera
  komponenter, se nedan), låsta bild-fixtures.
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
- `home-parity.spec.mjs` — Playwright-testsviten, två lägen styrda av
  `PARITY_MODE` (`update` skriver facit-golden, `compare`/default
  jämför implementationen mot det låsta facit).
- `blueprints/` — en fil per komponent, dokumenterar DOM-mappning,
  geometri, typografi, portningsplan och rotorsaker. Namnge nya
  blueprints `<komponent>-port.md`.
- `golden/` — låsta facit-mätvärden (PNG + JSON), skrivs bara i
  `PARITY_MODE=update`.

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
npm run parity           # compare-läge mot senast låsta facit
npm run parity:update    # update-läge, kräver lokal facit-server (localhost:8765)
```

## Låst baseline

Mobilheader + sökfält + övre mikrotrust (commit `f9e9854`, 2026-09-01)
är manuellt godkänd och låst — ändra inte dess produktions-CSS/JS utan
en ny, explicit instruktion från Vilmer. Nästa komponent i arbetet:
mobil hero (se `blueprints/mobile-hero-port.md`).
