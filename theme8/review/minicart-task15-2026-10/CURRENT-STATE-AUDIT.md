# TASK 15 — Minicart: nulägesgranskning

- Datum: 2026-10-30
- Kod: `origin/dev` 648a551 i worktree `hazey-storefront-task15`
  (gren `prep/task-15-minicart`, inget ändrat i storefrontkoden, inget
  committat). Lokal build `node build-theme8.js`.
- Miljö: Theme 8-preview (`?preview=v9kzdmqz4w60l5n`). Dokumentets
  dev-loader byts i testwebbläsaren mot repots loader + lokal build
  (`lib.mjs`). Egna sessionsvarukorgar, ingen kassa, ingen admin.
- Bredder: 320, 393, 430, 1440, 1920 och 200 % zoom.
- Harness: `lib.mjs`, `capture.mjs`, `keyboard.mjs`, `probe.mjs`,
  `scan.mjs`, `realdata*.mjs`, `directions.mjs`, `states.mjs`, `sheet.mjs`.
- Före-bilder: `before/` (97 st) och översikter
  `before/_overview-393.png`, `_overview-1440.png`, `_overview-övriga.png`.

> Obs: mobilkontexter med Playwrights standard-UA ("HeadlessChrome") fick
> ingen bestående Nyehandel-session (POST 200, men `cart/reload` gav 0).
> Harnessen använder därför en Android Chrome-UA. Framtida korgtester på
> mobil behöver samma sak.

## Sammanfattning

Minicarten är redan Theme 8-stylad (`84-cart.css`, flera lager från
2026-09-28 och framåt) och plattformsintegrationen är i grunden sund:
Vuex är enda sanningen, fokusfälla/Escape/fokusretur/scroll-lås fungerar
och Vue-rerender skapar inga dubbletter. Problemen ligger i tre andra
lager:

1. **Sanning:** frakt-, bonus- och trygghetstexter som inte stämmer med
   Nyehandels kassa idag, och en uppgraderingsrad som visar inaktuella
   belopp.
2. **Fel och väntan:** Nyehandel uppdaterar antalet optimistiskt och
   återställer inte vid fel. Kunden ser då ett antal som inte stämmer med
   summan, utan meddelande. Ingen upptagen-markering under väntan.
3. **Komposition:** summeringen tar 314–356 px (≈ 50 % av höjden på 320,
   75 % vid 200 % zoom), vilket bara lämnar 1–2 rader synliga. Varje rad
   bär ett eget beige uppgraderingskort, så korgen läses som en
   kortkatalog snarare än en tydlig varukorg. Den visuella världen
   (vita rundade kort på beige) är den som avvisats på startsidan
   (decisions.md), och kassaknappen är olivgrön medan PDP:ns köpknapp är
   orange.

## Visuella iakttagelser (squint-test)

| Område | Iakttagelse | Bild |
|---|---|---|
| Rubrik | "Varukorg (5)" i stor serif + stor grå rund stängknapp; tar 120 px på mobil | `393-multi-top.png` |
| Rader | Vita kort på beige med ett beige kort inuti (kort-i-kort). Antalsväljaren är en rundad "pill" med bindestreck "-" och siffran något för högt | `393-multi-top.png` |
| Uppgradering | Text "…för 1 154,75 kr till · du sparar 335,25 kr till · ger 150 kr bonus" bryts på 3 rader bredvid en mörk knapp; varje rad har en | `393-multi-top.png`, `393-sale-top.png` |
| Korsförsäljning | "KOMPLETTERA DIN ORDER" med tre rader och outline-knappar – ok i sig, men ligger mellan rader och summering och trycker summeringen nedåt i scroll | `1440-variant-top.png` |
| Summering | Mätare + Frakt + Totalt + Varav moms + Dela varukorg + Du sparar + Kassa + 3 trygghetsrader + Fortsätt handla = 9 element i sticky-ytan | `393-multi-top.png` |
| Kassaknapp | Olive, "Till kassan · 2 395 kr", 54 px. Tydlig men inte samma handlingsfärg som PDP:ns orange | – |
| Rea | Överstruket både per styck och per rad; "Du sparar" centrerad under "Dela varukorg", frikopplad från totalen | `393-sale-top.png` |
| Tomläge | Innehållet vertikalt centrerat med stor tom yta; pillknappar (avvisat mönster: "oversized monotone pill rows") | `393-empty-top.png` |
| Lång titel | 7 rader på 320, rått `&amp;` | `320-long-top.png` |
| 200 % zoom | Vänsterkanten klipps 15 px; en rad syns knappt | `z200-multi-top.png` |
| Desktop | Drawer 460 px med samma proportioner som mobil; mycket luft i rubriken; fungerar | `1440-multi-top.png`, `1920-multi-top.png` |

## Vad som fungerar och ska bevaras

- Vuex som enda sanning; `HZ8.addVariant`, `cart/reload`, `cart/open/close`.
- Idempotent injicering och synk vid både `HZ8.watch` och `store.subscribe`.
- `HZ8.trapFocus`, Escape, fokusretur till utlösaren, scroll-lås via `:has()`.
- Stängd drawer: `visibility:hidden` + `pointer-events:none` (fixade tidigare
  klickfångst över headern).
- Kassaknappens etikett med total via `data-hz8-label` + `aria-label`.
- Besparing räknad ur Nyehandels egna jämförbelopp (rea och mängdtrappa).
- Korsförsäljning med verifierade relationer, bara köpbara, giltigt pris.
- Tomlägets kategorilänkar ur riktig navigation.

## Prioriterade defekter

| Prio | Defekt | Typ (CLAUDE.md-klass) |
|---|---|---|
| P0 | Frakt "Fri frakt / 79 kr" motsäger kassans 49 kr | Korrigerbar implementation (+ beslut) |
| P0 | Bonuslöfte utan mekanism | Korrigerbar implementation (+ beslut) |
| P0 | Antal/summa osynkade efter fel, inget meddelande | Plattformshanterad funktion (nativ bugg) – Theme 8 kan upptäcka och återställa via `cart/reload` |
| P1 | Inaktuell uppgraderingstext efter ± | Korrigerbar implementation |
| P1 | 200 % zoom: klippt kant, nästan ingen rad synlig | Korrigerbar implementation |
| P1 | Summering ≈ 50 % av höjden på små skärmar | Korrigerbar implementation |
| P1 | Ingen upptagen-markering; kassaetikett med gammal total | Korrigerbar implementation |
| P2 | Lagergräns utan förklaring | Plattformshanterad + Theme 8-meddelande |
| P2 | Uppgraderingscopy grammatiskt trasig; ett tips per rad | Korrigerbar implementation |
| P2 | Lång titel 7 rader + `&amp;` | Korrigerbar implementation (+ datafel) |
| P2 | Live-region "1 artiklar"; dialognamn ≠ synlig rubrik | Korrigerbar implementation |
| P3 | Träffytor 40 px; antalsfält ej tangentbordsnåbart | Korrigerbar / plattform |
