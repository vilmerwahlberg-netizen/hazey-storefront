# Ämnesguiderna i Nyehandel: THCB, THCH, HHC

16 november 2026. Skapade via Nyehandels API v3 (Content → Sidor) med `../landing-pages-admin-2026-11/nh-pages.mjs` (samma nyckel och verktyg som för THCX, Engångsvapes och THCA). Ingen nyckel, hemlighet eller token finns i repot eller i loggar. Innehållet är ett utkast inför genomgången av topp 30-sidorna; ingen text är ändrad i detta steg.

## Före och efter

- **Före:** `GET /pages` gav 12 sidor. Ingen hade sluggarna `thcb`, `thch` eller `hhc`, så alla tre skapades. Inga befintliga sidor uppdaterades.
- **Efter:** 15 sidor, exakt en per ny slug.

| Slug | Id | Namn | Titel | Meta | HTML (återläst) |
|---|---|---|---|---|---|
| thcb | 15 | THCB | `THCB (THC-B) i Sverige – fakta, rättsläge och källor \| Hazey` | KARTLAGGNING.md (runda 2) | 16 701 tecken, identiskt med `theme8/blocks/thcb.html` |
| thch | 16 | THCH | `THCH (THC-H) – vad det är och rättsläget i Sverige \| Hazey` | KARTLAGGNING-THCH.md avsnitt 5 | 13 941 tecken, identiskt med `thch.html` |
| hhc | 17 | HHC | `HHC – vad det är och rättsläget i Sverige \| Hazey` | KARTLAGGNING-HHC.md avsnitt 5 | 13 140 tecken, identiskt med `hhc.html` |

"Identiskt" betyder att enda skillnaden är filens sista radbrytning, som Nyehandel tar bort. Återläsningen ligger i `../landing-pages-admin-2026-11/api-log.json`.

Blocken kommer från `dev` `bce5593` (merge av `feat/theme8-thch-hhc-knowledge`). GitHub Pages-bygget för `bce5593` var grönt innan sidorna skapades.

## Kontroll av de riktiga sidorna (`check-live.mjs` → `check-live.json`)

Headless Chrome mot `/sv/page/{slug}?preview=v9kzdmqz4w60l5n` vid 393 × 852 och 1440 × 900. Sidan laddar själv Theme 8 från GitHub Pages; ingen fixtur och ingen lokal build används.

| Sida | HTTP | H1 | H2 | Sidledsscroll | Konsolfel | Bild (rätt motiv per bredd, 200) | Kapitel | FAQ (+ tangentbord) | Källor | Guidelänkar | Länkar |
|---|---|---|---|---|---|---|---|---|---|---|---|
| THCB | 200 | THCB | 5 | 0 | 0 | umbel-coast 1100/1774, band 1014 | 4 ankare ok | 6, Enter öppnar | 6 | THCH, HHC, THCA | 20, alla 200/ankare (DOI 302 → pubs.acs.org, väntat) |
| THCH | 200 | THCH | 5 | 0 | 0 | olive-plaster 960, band 960 | 4 ankare ok | 6, Enter öppnar | 3 | THCB, HHC, THCA | 16, alla 200/ankare |
| HHC | 200 | HHC | 5 | 0 | 0 | coast-slope 932, band 1072 | 4 ankare ok | 6, Enter öppnar | 3 | THCB, THCH, THCA | 15, alla 200/ankare |

Alla sidor räcker till footern i båda bredderna. Titel och metabeskrivning syns i sidans `<head>`. `robots` är `noindex, nofollow` (global inställning, oförändrad). THCB:s live lagerrad visar "I kategorin nu: 1 produkt, ingen i lager".

Skärmbilder i `shots/`:
- `familj-{393,1440}-fold.webp`, `familj-{393,1440}-helsida.webp`: alla tre sida vid sida
- `{thcb,thch,hhc}-{393,1440}-{fold,full}.webp`

Resultatet stämmer med fixturtesterna i `../thch-hhc-knowledge-2026-11/`. Ingen skillnad hittades.

## Omdirigeringarna (lästa, inte ändrade)

| Adress | Före sidorna | Efter sidorna |
|---|---|---|
| `/sv/page/thcb` | 301 → `/sv/categories/thcb` | **200, THCB-guiden** |
| `/sv/page/thch` | 301 → `/sv/categories/thch` (tom) | **200, THCH-guiden** |
| `/sv/page/hhc` | 404 | **200, HHC-guiden** |
| `/thcb`, `/sv/thcb` | 301 → `/sv/categories/thcb` | oförändrat |
| `/thch`, `/sv/thch` | 301 → `/sv/categories/thch` (tom) | **oförändrat: går fortfarande till den tomma kategorin** |
| `/hhc`, `/sv/hhc` | 404 | 301 → `/sv/page/hhc` (Nyehandels egen kortadress för sidan; ingen regel är skapad) |

Samma mönster som för THCA: en regel på `/sv/page/{slug}` gäller bara så länge sidan saknas. De korta adresserna `/thch` och `/thcb` har egna regler mot kategorierna och vinner över sidan. Regeln kan inte läsas eftersom nyckeln saknar `url-redirect:read`.
