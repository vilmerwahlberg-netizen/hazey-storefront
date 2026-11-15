# Landningssidorna i Nyehandel: THCX, Engångsvapes, THCA

Skapade 2026-11-15 via Nyehandels API v3 (Content → Sidor) med nyckeln `page:read`, `page:create` och `page:update`. Ingen nyckel, hemlighet eller token finns i repot eller i loggar. Verktyg: `nh-pages.mjs` (probe, plan, apply och show).

## Sidorna

| Slug | Id | Namn (brödsmula) | Preview |
|---|---|---|---|
| `thcx` | 12 | THCX | https://hazeyse.nyehandel.se/sv/page/thcx?preview=v9kzdmqz4w60l5n |
| `engangsvape` | 13 | Engångsvapes | https://hazeyse.nyehandel.se/sv/page/engangsvape?preview=v9kzdmqz4w60l5n |
| `thca` | 14 | THCA | https://hazeyse.nyehandel.se/sv/page/thca?preview=v9kzdmqz4w60l5n |

**Före skapandet:** `GET /pages` gav 9 sidor och ingen med dessa sluggar, så inga dubbletter fanns.

**Efter:** 12 sidor, exakt en per ny slug. Inga andra sidor är ändrade.

### API-verifiering (`api-verify.json`, återläst efter sparning)

| Slug | Aktiv | Titel | Meta | HTML |
|---|---|---|---|---|
| thcx | ja | ok | ok | 11 668 tecken, identiskt med `theme8/blocks/thcx.html` |
| engangsvape | ja | ok | ok | 12 980 tecken, identiskt med `engangsvape.html` |
| thca | ja | ok | ok | 14 781 tecken, identiskt med `thca.html` |

Identiskt betyder här att enda skillnaden är att Nyehandel tar bort filens sista radbrytning. Innehållet ligger i fältet `description`. `url_mapping` är tomt.

### SEO-fält (källa: senaste innehållskartan)

| Slug | Titel | Metabeskrivning | Källa |
|---|---|---|---|
| thcx | THCX i Sverige – vapes, hasch och fakta \| Hazey | Vad är THCX (THC-X)? Se Hazeys THCX-vapes från Hero's Core och hasch från High Life och El Gringo, vad analysintyget visar och vanliga frågor. | `design/thcx-mall-2026-11-13/AGENT-A-THCX-GSC-RADGRANSKNING-2026-11-15.md` 4.1 |
| engangsvape | Engångsvapes med cannabinoider – Magic Sauce, Core och CBD \| Hazey | Engångsvapes hos Hazey: Magic Sauce 3.0, Hero's Core och CBD i 2 och 5 ml. Se vad som finns i lager och pris, med analysintyg på produktsidorna. | `engangsvape-landing-2026-11/KARTLAGGNING.md` avsnitt 2. Där stod "1+1, 2 och 5 ml"; rättat till 2 och 5 ml. |
| thca | THCA i Sverige – vad det är, rättsläge och alternativ \| Hazey | Vad är THCA? Fakta om tetrahydrocannabinolsyra och rättsläget: delta-9-THCA-A är narkotikaklassat i Sverige sedan 14 juli 2026 (SFS 2026:1109). Se serierna i vårt aktuella sortiment. | `thca-knowledge-2026-11/KARTLAGGNING.md` avsnitt 1 |

## Kontroll av de riktiga sidorna (`check-live.mjs` → `check-live.json`)

Headless Chrome mot de riktiga adresserna med `?preview=v9kzdmqz4w60l5n`, vid 393 × 852 och 1440 × 900. Sidan laddar själv Theme 8 från GitHub Pages; ingen fixtur och ingen lokal build används.

| Sida | HTTP | H1 | Sidledsscroll | Konsolfel | Trasiga bilder eller resurser | Produktvägar | Kort i ledet | FAQ | Länkar |
|---|---|---|---|---|---|---|---|---|---|
| thcx | 200 | THCX | 0 | 0 | 0 | 3/3 bilder | 9 | 6 | 17/17 ok |
| engangsvape | 200 | Engångsvapes | 0 | 0 | 0 | 3/3 bilder | 21 | 5 | 26/26 ok |
| thca | 200 | THCA | 0 | 0 | 0 | 3/3 bilder | 32 | 6 | 34/34 ok |

Alla sidor räcker till footern. Livevärdena är desamma som i de lokala testerna:
- **Engångsvapes:** "8 produkter i lager med 21 smakvarianter · 2 och 5 ml". 2 ml har 7 produkter från 395 kr, 5 ml har 1 produkt från 1 195 kr.
- **THCA:** Magic Sauce 17 i lager (från 175 kr), THCbA tillfälligt slut, Nano11 6 i lager (från 195 kr).

Skärmbilder i `shots/`:
- `{thcx,engangsvape,thca}-{393,1440}-fold.webp` och `-full.webp`
- `jamfor-lokal-{slug}-{393,1440}.webp`: lokalt test mot riktig sida

### Skillnad mot de lokala testerna, hittad och rättad

Den första kontrollen visade att alla tre sidorna var för smala på desktop. Mallen blev cirka 690 px bred, korten trycktes ihop och helbreddsbilderna klipptes.

Orsaken är att en riktig Content-sida lägger HTML:en i `.store-page > section.section > .container.page-content.editor-content`. Theme 8:s regel för brödtextsidor (`88-pages.css`, 78ch) begränsar den sektionen. Den lokala fixturen saknade den behållaren.

Rättelsen ligger i `88b-landing.css` (commit `7296531` på `dev`): landningar undantas från läsbredden och sektionens padding. Den gäller bara sidor som innehåller `.hz8-lp`. Efter driftsättningen på GitHub Pages stämmer de riktiga sidorna med de lokala testerna; se jämförelsebilderna.

## THCA-adressen och omdirigeringen

| Adress | Före sidan | Efter sidan |
|---|---|---|
| `/sv/page/thca` | 301 → `/sv/categories/thca` | **200, THCA-sidan** |
| `/thca` | 301 → `/sv/categories/thca` | 301 → `/sv/categories/thca` (oförändrat) |
| `/sv/thca` | 301 → `/sv/categories/thca` | 301 → `/sv/categories/thca` (oförändrat) |

Omdirigeringen slog till på `/sv/page/thca` bara så länge sidan saknades. När sidan finns vinner den. Ingen omdirigering behövde ändras, och ingen är ändrad.

Den exakta regeln kunde inte läsas: `GET /url_redirects` svarar 403, eftersom nyckeln saknar `url-redirect:read`. Den korta adressen `/thca` går fortfarande till den tomma kategorin `/sv/categories/thca` (THC-A, 0 produkter). Att peka om den kräver behörigheten `url-redirect:update` eller admin, och ett beslut om målet.

## Kvarvarande hinder och beslut

1. **`/thca` och `/sv/thca` → tom kategori:** se ovan. Gamla WooCommerce-`/thca/` är orörd.
2. **Global noindex:** butiken har `noindex, nofollow` och sidorna ärver det. Det är oförändrat och ett lanseringsbeslut.
3. **Synlighet utan preview:** sidorna är aktiva och därmed åtkomliga även utan `?preview=`, i det aktiva temat utan Theme 8-stil. Theme 8 är inte publicerat.
4. **THCX:** `/sv/categories/thcx` innehåller bara en produkt, och tre länkar på sidan pekar dit (sedan tidigare).
5. **THCX-texterna:** granskningen 2026-11-15 föreslår även ändrad ingress, H2 och FAQ 1. Bara metan är använd här; blockets text är oförändrad.
6. **Titlar och meta:** står fortfarande som förslag i innehållskartorna. De går att ändra i admin eller med `nh-pages.mjs apply <slug> --update`.
