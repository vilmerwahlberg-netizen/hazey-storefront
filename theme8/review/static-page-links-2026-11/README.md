# Theme 8: länkar till statiska sidor (2026-11-13)

Gren `fix/theme8-static-page-links` från origin/dev f78328b. Endast
`theme8/js/45-series-education.js` och `theme8/js/62-guides-newsletter.js`
ändrade. Nyehandel-admin, kassan/CSS-fältet och katalogen är orörda.

## Inventering (alla `/sv/page/`-mål i theme8/js + blocks, kontroll 2026-11-13)

| Mål | Status | Åtgärd |
|---|---|---|
| faq, kontakt, vara-bastsaljare, kop-och-leveransvillkor, kampanjer, integritetspolicy, butik | 200, riktigt innehåll | ingen |
| kopvillkor | 200, tom sida (bara i 88-pages tomläge-logik, ingen länk) | ingen |
| om-oss | 404, ingen länk i JS (footern byter bara om sidan finns) | ingen -- adminagenten skapar sidan |
| leverans-och-retur | 404, ingen länk i JS | ingen -- hålls separat tills frakten är beslutad |
| thcab, thcba, nano11 ("Läs om serien") | 404 | knappen borttagen |
| magic-sauce ("Läs om serien") | 301 → /sv/categories/magic-sauce (samma som "Se produkter") | knappen borttagen |
| vad-ar-thcab, vapes-carts-eller-buds, sa-arbetar-vi-med-analyser ("Läs guiden") | 404 | kort dolda även i preview |

Inga av bloggens 75 poster motsvarar THCaB, THCbA, formatguiden eller analysguiden. Nano11-posterna
handlar om laglighet och Magic Farmers-posten är ett partnerskapsmeddelande. De är därför inte
använda som ersättningsmål.

## Test (`check.mjs`, Theme 8-preview, före = origin/dev, efter = grenen)

| | Läs om serien | Guider | /page/-länkar | ej 200 | overflow-x |
|---|---|---|---|---|---|
| före 393 / 1440 | 4 | 3 kort | 25 | 7 | 0 |
| efter 393 / 1440 | 0 (no-info, "Se produkter" 44 px hög) | sektionen dold | 18 | 0 | 0 |

Kvarvarande konsolfel efter: 3 × 404 från guide-kontrollens egna fetch (samma
som redan sker utanför preview). Skärmdumpar i `evidence/`.
