# Teknisk SEO-runda, Nyehandel (2026-11-12)

Källa: alla 258 URL:er i Nyehandels sitemap, crawlade utan tema-JS (`data/nh-meta-2026-11-12.json`, verktyg `tools/crawl-meta.py`). Per-URL-lista: `data/TECH-SEO-URLS.csv` (247 rader med minst ett fynd). Ingenting är ändrat i admin.

## Åtgärdat i Theme 8 (`theme8/js/91-seo-hygiene.js`, verifierat 393 + 1440)

| Fynd | Omfattning | Åtgärd i Theme 8 | Kvar i admin |
|---|---|---|---|
| Bokstavlig `%%sep%%` (och `%%sitename%%`, `%%title%%`) i metatitel/-beskrivning | 97 titlar, 27 beskrivningar (alla produkter; inga pausade 5 g-paket) | ersätts vid körning exakt som WordPress renderade dem (`-`, `Hazey.se`, sidans H1). Verifierat: "NANO 11 Buds 7% - Abacous \| Tatra Hemp - Laglig Cannabis" | **Rätta datan:** `data/META-FIXES.csv` har nuvarande och ny text per route. JS-rättningen är bara ett skyddsnät. |
| Flera H1 på produktsidor (H1 i importerad beskrivning) | 100 sidor har 2–3 H1 i native HTML | beskrivningens H1 blir H2 (`.short-description`, `.product-description`), samma utseende. Verifierat: 1 H1 | Byt `<h1>` mot `<h2>` i produktbeskrivningarna vid nästa redigering |
| Blogg utan canonical | `/sv/posts` | självrefererande canonical läggs till för blogg och artikel om den saknas | – |
| Blogg-/artikelschema saknas | – | BlogPosting + BreadcrumbList (90-blog.js) | – |

Kategorisidornas beskrivnings-H1 är Theme 8:s avsiktliga sidrubrik och rörs inte.

## Kräver admin- eller ägarbeslut (inte ändrat)

1. **Hela butiken är `noindex, nofollow`** (gäller nu även de 75 blogginläggen, se domänbyteschecklistan i `MIGRATION-REPORT.md`) (258/258). Det är troligen avsiktligt före lansering, men det är en **lanseringsblockerare**: det måste stängas av samtidigt som domänen pekas om. Annars försvinner hazey.se ur Google när de gamla URL:erna 301:as hit.
2. **Canonical och sitemap pekar på `hazeyse.nyehandel.se`.** Vid domänbyte måste butikens primära domän vara `www.hazey.se` (eller `hazey.se`), så att canonical, sitemap och robots.txt följer med. Verifiera i admin.
3. **Butikstiteln "Måbroberg AB (NDA)"** är startsidans och bloggens `<title>`/og:title. Byt till varumärkesnamnet i butiksinställningarna.
4. **137 sidor saknar metabeskrivning** (främst kategorier och varumärkessidor), se `TECH-SEO-URLS.csv`. Nya texter är ett innehållsbeslut, så inga har skrivits.
5. **Sitemap innehåller dolda och legacy-kategorier:** `test-root-radera` (testkategori!), dubbletter (`core-1`, `cookies-1`, `cbd-buds-1`, `merch-ny`), dolda importkategorier (`buds-ny`, `hash-ny`, `vapes-ny`, `kampanjer-ny`, `cbd-cbg-cbn-ny`) och pausade (`thcnm*`, `hhcpm*`, `10-oh-thc*`). Rekommendation: avpublicera eller dölj dem så att de lämnar sitemapen, och 301-styr dubbletterna till originalet om Nyehandel stöder det (samma rekommendation som TASK 04 C1).
6. **Dolda paket:** alla 36 dolda WooCommerce-paket ligger i produktsitemapen och är indexerbara när noindex lyfts. De är tunna sidor utan lager. Rekommendation för de 28 ej pausade: dölj i listningar och sitemap (`catalog-reconciliation-2026-11/NYEHANDEL-VISIBILITY-ACTIONS.md` A). **De 8 pausade 5 g-paketen (`ms50-5g-*`, `nano11-buds-*-pack`, `high-life-5g-*`) är inte ändrade och ska inte ändras.** De är bara listade.
7. **Dubbla titlar:** CBD Buds, Core, Cookies, Merch, Kampanjer, Magic Farmers, Tatra Hemp, Faraoh och CBD Group finns två gånger var (kategori + varumärke eller kategoridubblett).
8. **Interna länkar:** startsidans "Guider & aktuellt" pekar på `/sv/page/vad-ar-thcab` m.fl., som ger 404. De är redan dolda av `62-guides-newsletter.js` tills sidorna finns. När bloggen har inlägg bör `GUIDES_INDEX` sättas till `/sv/posts`.
9. **Bilder vid domänbyte:** löst 2026-11-12. Alla bloggbilder är uppladdade till Nyehandels CDN (91/91 laddar). 23 bilder saknades redan i WordPress, se `MIGRATION-REPORT.md`.

robots.txt är korrekt (blockerar admin, API, filter- och sorteringsparametrar).
