# TASK 17: blogginnehåll, Theme 8-blogg och teknisk SEO

2026-11-12 · gren `feat/task-17-blogg-seo` (från `origin/dev` 2d5e9d3) · **ingen livepublicering, inget skrivet till Nyehandel eller WordPress.**

## 1. Inventering

| Källa | Hämtat | Resultat |
|---|---|---|
| WordPress hazey.se (REST `wp/v2/posts`, Yoast-fält, media, kategorier, sitemap) | 75 publicerade inlägg, 2023-01-24 → 2026-07-22 | alla `index, follow`, kategori *Fördjupning*, canonical = gammal URL |
| Nyehandel hazeyse.nyehandel.se (sitemap: 258 URL:er) | `/sv/posts` | **0 inlägg**, ingen canonical, titel "Måbroberg AB (NDA)" |

Per artikel (`data/wp-inventory.csv` / `.json`): id, gammal och ny URL, titel, SEO-titel, metabeskrivning, publicerad/ändrad, utvald bild och alt-text, ord, rubrikstruktur, bilder (alt saknas), interna och externa länkar, substans- och hälsoflaggor.

- URL-mönster i WP: `/ÅÅÅÅ/MM/DD/{slug}/` (2023: 23, 2024: 44, 2025: 4, 2026: 4). Bloggnav: `/artiklar-cannabis-laglig-alternativ-vad-ar-thch-thcjd/`, `/nyheter/`, `/category/fordjupning/`.
- SEO-titlar: 75/75 unika och utan Yoast-variabler. 2 saknar metabeskrivning.
- Bilder: 38 saknar utvald bild, 10 har utvald bild utan alt. Brödtexten har 77 bilder, varav 1 utan alt: 51 ligger på `hazey.se/wp-content` och 26 på extern CDN (`assets.usestyle.ai`, `assets.conversion.ai`).
- Rubriker: 13 artiklar har H1 i brödtexten och 7 har rubrikhopp.
- Länkar: 143 interna (43 unika mål) och 90 externa.

## 2. Mappning och omdirigeringar

- `data/ARTICLE-MAPPING.csv`: en rad per artikel med gammal URL → `/sv/posts/{samma slug}`, metadata, status, flaggor och vilka strukturella ingrepp som gjorts i importpaketet.
- `data/REDIRECTS.csv`: 156 regler (301). Varje artikel har en regel med och en utan avslutande snedstreck, och blogghubbar, kategori-, författar- och feedarkiv går till `/sv/posts`. Reglerna används vid domänbytet hazey.se → Nyehandel.
- `data/INTERNAL-LINKS.csv`: alla 143 interna länkar med nytt mål:
  - 121 till verifierade Nyehandel-routes (sitemap 2026-11-12, HTTP 200)
  - 8 artikel → artikel
  - 3 till pausade kategorier (THCH ×2, THCNM). De behålls men kräver beslut.
  - 11 döda (THC-P, HHC-O, HHCPO, THCPO, THC-JD, HHC-kategorierna och en WP-artikel som redan gav 404). Länken packas upp och ankartexten behålls.

## 3. Importpaket (beslut: alla 75 ordagrant)

`data/import/{slug}.html` innehåller brödtexten **ordagrant**. Bara struktur har ändrats, och varje ingrepp loggas i mappningen:
- interna länkar pekar om till Nyehandel-routes, och döda länkar packas upp
- H1 i brödtext blir H2 (mallens H1 är titeln)
- Divi-shortcodes tas bort, men texten behålls (1 artikel)
- externa `target=_blank` får `rel=noopener`.

Fakta, juridiska formuleringar och hälsopåståenden är orörda.

**Arbetsyta för inklistring:** `import-workbench.html`. Kör `python3 -m http.server 8787` i den här mappen och öppna `http://127.0.0.1:8787/import-workbench.html`. Där finns kopieringsknappar per fält (titel, slug, datum, SEO-titel, metabeskrivning, bild och alt, HTML) och avbockning.

**Ordning i admin per inlägg:**
1. Titel.
2. Slug exakt som i WP. Om Nyehandel genererar egen slug ska den nya slugen föras in i `REDIRECTS.csv`.
3. Publiceringsdatum (WP-datum).
4. SEO-titel och metabeskrivning.
5. Ladda ner den utvalda bilden från WP och ladda upp den i Nyehandel med alt-text.
6. Brödtexten i HTML-läge.

Brödtextbilderna på `hazey.se/wp-content` måste också laddas upp i Nyehandel och få ny `src` **före** domänbytet, annars går de sönder.

`CONTENT-DECISIONS.md` listar flaggorna per artikel:
- 3 KLAR
- 21 GRANSKA (hälsoord)
- 51 BESLUT (substanser som är pausade eller inte säljs).

Se särskilt punkt 1 där om THCA.

## 4. Theme 8: bloggindex och artikelmall (riktning "A Tidskrift", vald 2026-11-12)

Koncept A, B och C med riktiga artiklar finns i `concepts/` och `concepts/shots/`. Implementation: `theme8/js/90-blog.js` och `theme8/css/90-blog.css`. I bootstrap har sidtyperna `blog` och `post` lagts till.

- **Index:** Nyehandels egen H1 flyttas in i tidskriftshuvudet, så sidan har en H1. Under den kommer ämneschipp, en huvudartikel med bild och en numrerad tvåkolumnslista med miniatyr. Ett ärligt tomläge visas så länge bloggen är tom. Native-listan ligger kvar i DOM:en för crawlbara länkar och paginering.
- **Artikel:** centrerat huvud med brödsmula, ämne, H1, datum och lästid. Därefter en bred bild och en läskolumn på 680 px, med innehållsförteckning (minst tre H2) och "I butiken"-länk i sidled. Längst ned föregående/nästa och en vågrät "Läs vidare"-rad med relaterade artiklar först. BlogPosting- och BreadcrumbList-JSON-LD läggs till om sidan saknar egen.
- **Datadrivet:** ämnen = serier i headerns kategorikarta (`HZ8.catalog`, pausade exkluderade) som förekommer i titlarna, och ämnen med 0 artiklar döljs. Föregående/nästa och "Läs vidare" läses ur bloggindexet och följer paginering. Datum visas bara när sidan själv anger det. Ingen fejkad data.

## 5. Verifiering (`verify-blog.mjs` → `runs/verify.json`, skärmdumpar i `runs/`)

Lokal build injiceras i preview-instansen (samma harness som TASK 01). Kontrollerat på 393 och 1440 px:

| Fall | Resultat |
|---|---|
| `/sv/posts`, riktig, tom | tomläge, 1 H1, canonical tillagd, 0 px horisontell scroll, inga JS-fel |
| `/sv/posts` med fixtur (14 riktiga artiklar) | huvudartikel + 13 rader, ämnesfilter fungerar (Nano-11 → 2), 1 H1, 0 px |
| `/sv/posts/{slug}` med fixtur | 1 H1, 7 avsnitt i innehållsförteckningen, föregående-länk, 8 i "Läs vidare", BlogPosting + BreadcrumbList, 0 px |
| Regression: startsida, Alla Vapes, FAQ | 1 H1 var, canonical oförändrad, 0 px, inga fel |

**Begränsning:** Nyehandels kort- och detaljmarkup för inlägg kunde inte mätas, eftersom det inte finns några inlägg. Fixturen använder antagen markup och tolkningen är markup-agnostisk, med fail-safe där native lämnas orörd. **Efter första riktiga inlägget i admin ska `verify-blog.mjs` köras utan fixtur.**

## 6. Teknisk SEO-runda

Se `TECH-SEO.md`. I Theme 8 (`91-seo-hygiene.js`):
- `%%sep%%`, `%%sitename%%` och `%%title%%` rättas vid körning exakt som WordPress renderade dem (97 titlar, 27 beskrivningar)
- produktbeskrivningarnas H1 blir H2, så sidan har en H1
- canonical läggs till på bloggen.

Verifierat på `product-sep` och i regressionen ovan. Admindatan för metarättningen finns i `data/META-FIXES.csv`.

Blockerare utanför koden, alla dokumenterade i `TECH-SEO.md`:
- global `noindex, nofollow`
- primär domän / canonical-host
- butikstiteln "Måbroberg AB (NDA)"
- legacy- och testkategorier i sitemapen
- 28 dolda paket i sitemapen (de 8 pausade 5 g-paketen rörs inte)
- 137 saknade metabeskrivningar
- WP-bilder som måste flyttas före domänbytet.
