# Task 23: D10/Faraoh-paket och variantkort i Theme 8-listor

2026-11-12 · worktree `../hazey-storefront-task23`, gren `feat/task-23-variant-cards-d10-faraoh`.
- **Bas:** Task 21-commit `368f077`, som är ovanpå `origin/dev` = eb5bb5c (PR #4).
- **Beroende:** grenen bygger på Task 21:s paketkälla `03c-package-table.js`. **Task 21 behöver granskas eller mergas först** eller tillsammans med den här grenen.
- Ingen adminändring, inget lager ändrat, ingen order och ingen publicering. Testkorgar är tömda.

## 1. D10/Faraoh i köpmodulen

Kontrollerat live 2026-11-12 (`evidence/probe-d10-faraoh.json`):

| Bas | Paket 3 / 5 | Pris | Pivots (olåsta, antal 1, rätt bas) | Varianter |
|---|---|---|---|---|
| 254 D10 2 ml | 270 / 271 | 1 655 / 2 618 kr | 28–30 / 31–35 | 5, alla lager 0 |
| 236 THCbA 47 % 2 ml | 272 / 273 | 2 076 / 3 319 kr | 36–38 / 39–43 | 8, alla lager 0 |
| 242 THCA-B 50 % 2 ml | 274 / 275 | 2 216 / 3 542 kr | 44–46 / 47–51 | 4, alla lager 0 |
| 256 THCA-B 50 % 1 ml | 276 / 277 | 1 101 / 1 835 kr | 52–54 / 55–59 | 5, alla lager 0 |

- **Ändring:** en post per bas i `03c-package-table.js`, med samma mekanism som Core och Magic Sauce: 1/3/5-val, en byggare, lagerspärr, paketrad, minicartnamn och omdirigering av direktlänken.
- **Inget för THC-B 251.**
- **Med lager 0** visar PDP:n slutsåld med Nyehandels "Bevaka". Det finns inget paketval och ingen köpknapp, men paketstrukturen 3:270 / 5:271 osv. är inläst (`HZ8.packageUpsells`).
- **Inte provat:** köp, minicart med paketrad och Kustom för de åtta paketen. Det kräver lager.

## 2. Variantkort i listor (`theme8/js/04-variant-cards.js`, ny)

Alla listor använder samma regler innan de räknar, sorterar och delar upp i sidor:
- **Paketkort hålls borta.** Ett kort tas bort om dess länk är en paketartikel i tabellen, eller om namnet slutar på "– N-pack" där N är en paketstorlek i tabellen (Woo-skal före eller efter adminstädningen). 10-pack och kollektioner visas som förut. Paketartiklarna inaktiveras inte, och köpmodulen hämtar dem som vanligt.
- **Variantprodukter blir ett kort per variant.**
  - Bara kort som Nyehandel märker "Finns i flera varianter" och som har ett strain- eller smakval läses (`HZ8.productState`, köat och cachat).
  - **Kortet:** smaknamn som titel, produktnamnet som överrad, variantens egen bild och lager enligt köpregeln.
  - **Länk:** `/products/<slug>/<variant-id>`, som öppnar PDP:n med varianten vald.
  - **Köp:** varianter i lager får en vanlig köpknapp för just den varianten. Slutsålda får en inaktiv "Slutsåld" och ingen köpknapp.
  - **Inga nya PDP:er eller SEO-URL:er.**
  - Kan variantdatan inte läsas ligger produktkortet kvar.
- **Var reglerna gäller:**
  - **Kategoriunionen** (Alla vapes, Alla produkter, formatsidor): expanderar efter deduplicering och medlemskap men före typ-, volym- och sökfilter. "I lager" gäller per variant. Slutsålda varianter av en delvis köpbar produkt hamnar sist vid serverordning. Räknare, serieantal, typ- och volymantal och "Visa fler" räknar kort. Sökningen matchar även smaknamnet.
  - **Serie × format** (`ms-vapes`, `core-vapes`, `d10-vapes`, `thcab-vapes`, `thcba-vapes`): ett eget grid tar över bara när källan har variant- eller paketkort. Det använder hela källan med sidans filter och sortering, och antal = kort.
  - **Seriehubbar** (pilot och äldre mall): radernas kort och antal räknar kort.
  - **Startsidans och PDP:ns rälsar** visar fortfarande en produkt per kort. Paketkort döljs där, liksom i alla andra listor.
- **Cart + batteri** ("Startpaket – M3b Pro Batteri + 2× …") ligger under Carts som en egen produkt.

## Före och efter

| Lista (1440) | Före (`origin/dev`) | Efter |
|---|---|---|
| Alla vapes | 48 kort, varav **16 paketkort** | 97 kort, 0 paketkort, alla varianter som egna kort |
| MS vapes | 15 kort, varav **8 paketkort** | 22 kort, varav 19 varianter, 0 paketkort |

Bilder i `evidence/shots/`:
- `fore-*` / `efter-*` för Alla vapes (393, 1440) och MS vapes (393, 1440);
- scenariobilder `L*`, `P*` och `D*` för 393, 768, 1440 och 1920.

## Test (`evidence/ui-variants.mjs`, 9 scenarier × 393/768/1440/1920 = 36/36 PASS)

| # | Scenario | 393 | 768 | 1440 | 1920 |
|---|---|---|---|---|---|
| L1 | Alla vapes (se nedan) | PASS | PASS | PASS | PASS |
| L2 | "I lager": bara köpbara varianter (MS 2 ml = Gorilla Cookies, Tinky Winky), ingen D10, räknare 22 = kort | PASS | PASS | PASS | PASS |
| L3 | Sök "gelato" i Alla produkter: Core Gelato-varianten, High Life Gelato och THC-V Berry Gelato, räknare = kort | PASS | PASS | PASS | PASS |
| L4 | MS vapes (serie × format): 22 kort = räknare, 19 varianter, 0 paket | PASS | PASS | PASS | PASS |
| L5 | Hubbar Magic Sauce, Core, D10, THCaB och THCbA: varianter, 0 paket, inga köpbara slutsålda | PASS | PASS | PASS | PASS |
| P1 | Core Melon Haze-kort: PDP `/431` med Melon Haze vald, paketvalet synligt, 3-pack förvalt med Melon Haze | PASS | PASS | PASS | PASS |
| P2 | Vanligt köp från MS 5 ml Kowa Bunga-kortet: korgen får variant 451 × 1 för 1 195 kr och minicarten visar den. Korgen töms | PASS | PASS | PASS | PASS |
| D1 | D10 Lemon Cheese-kort (se nedan) | PASS | PASS | PASS | PASS |
| D2 | Direktlänkar 270, 273, 274 och 277 landar på basens PDP. Byggarens hämtning ger 200, ingen omdirigering och 3 eller 5 rader | PASS | PASS | PASS | PASS |

Detaljer för de längre scenarierna:
- **L1:** räknaren är lika med antalet kort (97). Där finns 6 Core, 9 MS 2 ml, 5 MS 5 ml, 5 D10 och 12 Faraoh 2 ml, inga paketkort, inga köpbara slutsålda kort, inga dubbla länkar och ingen horisontell scroll.
- **D1:** listan har 5 slutsålda kort utan köpknapp. PDP:n `/424` har Lemon Cheese vald, "Slutsåld" och "Bevaka", inget paketval och ingen köpknapp, men paketen 3:270 och 5:271 är inlästa.

Omkörningar:
- L1 och L2 vid 393 kördes om efter att testet lärt sig mobilens räknare (`.hz8-pcount`, som visade 97 respektive 22).
- L4 kördes om vid alla bredder efter CSS-justeringen av variantgridets kolumner.

## Testat respektive blockerat av lager 0

| | Core / MS 2 ml / MS 5 ml | D10 / Faraoh (254, 236, 242, 256) |
|---|---|---|
| Variantkort (namn, bild, länk, lager) | Testat | Testat (alla slutsålda) |
| Kort → PDP med förvald variant | Testat | Testat (slutsåld PDP) |
| Vanligt köp från kort → korg och minicart | Testat (MS 5 ml) | **Blockerat av lager 0** |
| Paketval på PDP (1/3/5) | Testat (Task 20/21 + P1) | Slutsålt läge och struktur testade. **Val och köp blockerade av lager 0** |
| Paketrad i korg, minicart och Kustom | Testat i Task 20/21 | **Ej provat, blockerat av lager 0** |
| Direktlänk → bas, pivot-läsning | Testat (Task 20 v5) | Testat (D2) |

## Kvar
- **Task 21 måste följa med** (paketkällan, minicartnamnen och kassans CSS).
- **Den skarpa sajten (tema 3) kör inte Theme 8.** Där syns paketsidorna fortfarande på direktlänk, med serverns lagerluckor (se Task 20 `LAGERSPARR.md` / `OMDIRIGERING.md`).
- **Fler kort per sida.** Slutsålda varianter av gamla vapes (THCV, CBN m.fl.) blir nu ett kort per variant. Det är korrekt, men listorna blir längre. Det kan avgöras senare om slutsålda varianter ska döljas eller samlas.
- **Portalens sökförslag** (listrutan) föreslår produkter, inte varianter. Själva sökresultatet visar varianterna.
