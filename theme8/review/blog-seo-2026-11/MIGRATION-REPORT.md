# TASK 17B: WordPress → Nyehandel-bloggen (2026-11-12)

**Resultat: 75 av 75 inlägg publicerade** som vanliga, redigerbara Nyehandel-inlägg (Content → Blogg). Inga dubbletter: API:t rapporterar `total: 75`, med 75 unika id och sluggar. Varken butikens globala `noindex` eller hazey.se har ändrats, och inga omdirigeringar har skapats.

Underlag:
- logg per artikel: `data/migration-log.json`
- kontroll per artikel: `data/MIGRATION-RESULTS.csv` / `.json` (gammal URL, ny URL, inläggs-id, HTTP, titel, H1, datum, canonical, robots, metabeskrivning, bilder, länkar, textlikhet och ingrepp)
- verktyg: `tools/nh-blog-migrate.mjs` (API v3, idempotent, nycklar läses från `~/.config/hazey/nyehandel-api.env`, aldrig i repot) och `tools/verify-migration.py`.

## Vad som överfördes

| Fält | Hur |
|---|---|
| Titel, slug | ordagrant. Sluggen är identisk, URL: `/sv/post/{slug}` |
| Publiceringsdatum | WordPress-datumet (GMT → `published_at`). 75/75 visar rätt datum |
| Brödtext | ordagrant. Tekniska ingrepp, loggade per artikel: interna länkar till Nyehandel-routes; H1 i brödtext → H2; i de 17 artiklar som gick H1 → H3 är H3 → H2 (beslut); Divi-shortcodes borttagna (syns inte heller live i WordPress) |
| Bilder | 54 brödtextbilder och 37 omslagsbilder uppladdade till Nyehandels CDN. **91/91 laddar.** Inga bilder pekar längre på `hazey.se/wp-content` eller conversion.ai |
| SEO-titel / metabeskrivning | Yoast-värdena ordagrant. De 2 utan beskrivning i WordPress har Nyehandels automatiska text (beslut). Båda är läsbara och utan trasiga tecken |
| Författare | ej satt: nyckeln saknar `staff-user:read` (beslut). Theme 8 döljer "av" |

## Kontroller (alla 75, publika sidor)

| Kontroll | Resultat |
|---|---|
| HTTP 200 på `/sv/post/{slug}` | 75/75 |
| `<title>` = WordPress SEO-titel | 75/75 |
| H1 = WordPress-titel | 75/75 |
| Datum | 75/75 |
| Canonical = egen URL | 75/75 |
| robots | `noindex, nofollow` på alla, butikens förlanseringsläge, oförändrat |
| Sitemap (`/channel/1/sitemap.xml`) | alla 75 `/sv/post/`-URL:er finns, en gång vardera |
| Bilder | 91/91 laddar |
| Interna länkar | 132/132 ger 200, inklusive pilotens fyra (`vad-ar-nano10-laglig-cannabis-i-sverige`, `nano10-ar-det-lagligt`, `forsta-fordelarna-med-laglig-cannabis-i-sverige`, `den-vaxande-trenden-av-laglig-cannabis-i-svenska-hem`) |
| Textparitet mot WordPress | 74 ≥ 0,97. *Vad är Nano11?* 0,83 beror enbart på Divi-shortcodes som är råtext i REST-exporten men inte syns på den publika WordPress-sidan. Verifierat: Nyehandel = det besökaren ser i WordPress |

## Inte komplett (publicerade ändå, enligt beslut)

**23 bilder i 16 artiklar saknades redan i WordPress** (404 både som storleksvariant och original; de är trasiga för besökare i dag). Bildtaggen är borttagen och loggad, all text är kvar:

| Artikel | Bilder |
|---|---|
| `eu-certifierad-hampa` | 1 |
| `vad-ar-terpener` | 1 |
| `ar-thcp-lagligt-i-sverige` | 1 |
| `thcp-guide-till-lagliga-cannabinoider-i-sverige` | 1 |
| `industricertifierad-hampa-och-thcp-i-sverige-…` | 2 |
| `hhc-o-vs-thc-p-skillnader-och-likheter` | 2 |
| `thcp-en-nyupptackt-cannabinoid-…` | 3 |
| `lagliga-cannabinoider-thcp-h5-och-h4cbd-…` | 1 |
| `thc-vs-hhc-vs-thcp-…` | 2 |
| `h4cbd-en-laglig-cannabinoid-med-potential` | 1 |
| `thcp-blommor-naturlig-skonhet-i-cannabinoidvarlden` | 1 |
| `thcp-ar-det-verkligen-33-ganger-mer-effekt` | 2 |
| `folkhalsomyndighetens-framstallan-om-thcp-och-hhco-…` | 1 |
| `vad-ar-hhcpo-och-ar-det-lagligt-i-sverige` | 2 |
| `vad-ar-thcpo` | 1 |
| `folkhalsomyndigheten-begar-nya-regler-for-flera-cannabinoider` | 1 |

Övriga kvarvarande avvikelser:
- Nyehandel visar raden "Senast uppdaterad: 2026-11-12 …" på varje inlägg (plattformens egen rad, migreringsdatumet).
- 38 artiklar saknade omslagsbild redan i WordPress.
- Juridiska och innehållsmässiga flaggor står oförändrade i `CONTENT-DECISIONS.md` för senare granskning.

## Theme 8: arkiv och artikel (verifierat med riktiga inlägg, 393 + 1440 px)

`verify-archive.mjs` → `runs/verify-archive.json` och `verify-live.mjs` → `runs/verify-live.json`.

- **Arkivet `/sv/posts`:**
  - Hämtar alla 10 indexsidor (8 per sida, ~85 KB komprimerat per sida). Status: "75 artiklar".
  - "Visa fler" 25 → 49 rader, och fokus flyttas till första nya raden.
  - Ämneschipp ur butikens kategorikarta: Nano-11 2, Vapes 13, Carts 2, Batterier 1, CBD 10, CBN 5. Tangentbord fungerar.
  - **Sökning på titel och ingress:**
    - "terpener" (titel) och "apotek" (bara i ingressen) hittar båda artikeln på Nyehandels sida 10.
    - "thc-p lagligt" ger 24 träffar; bindestreck och skiftläge spelar ingen roll.
    - Tom träff ger ett tydligt tomläge med "Visa alla artiklar", och Escape rensar.
  - Alla resultat är vanliga `<a href="/sv/post/…">`. Nyehandels serverrenderade paginering (`?page=1–10`) ligger kvar i HTML:en, så alla 75 kan crawlas utan JS.
  - Datum utan årtal ("06 Mar") visas inte.
- **Artikeln:**
  - en H1, datum och lästid, inget kvarhängande "av"
  - omslag och brödtextbilder laddar
  - innehållsförteckning vid minst tre H2
  - föregående/nästa med `rel`, och 8 i "Läs vidare"
  - Nyehandels BlogPosting (icke-ISO-datum, `mainEntityOfPage` = `/sv/posts`) ersätts med en korrekt version (ISO-datum, egen URL).
- **Regression:** startsida, Alla Vapes, FAQ och produktsida har en H1, ingen horisontell scroll och inga fel.

## Förslag: lättare fulltextsökning (inte byggt)

Att hämta alla 75 artikelsidor kostar ~6 MB. Förslaget är i stället ett **sökindex som en enda liten fil**:
- `tools/nh-blog-migrate.mjs` får kommandot `search-index`, som med `blog-post:read` läser alla inlägg via API och skriver ren text per slug (titel + brödtext utan HTML, ~350 KB rått, **~100 KB komprimerat**).
- Filen publiceras med Theme 8:s assets, alltså samma deploy som CSS/JS.
- Arkivet hämtar den först när man börjar söka och slår ihop den med det levande indexet. Ett inlägg som saknas i filen söks på titel och ingress som i dag, så sökningen blir aldrig fel, bara mindre fullständig tills filen byggs om.
- Filen behöver köras om när inlägg läggs till eller ändras. Det kan bli ett steg i `build-theme8.js` om API-nyckeln finns lokalt.

## Domänbyte: checklista (gör i den här ordningen, samma dag)

1. **Kontrollera** att `REDIRECTS.csv` fortfarande stämmer: kör `tools/verify-migration.py` och sedan `tools/redirects.py`. Det ger 79 regler (75 artiklar 1:1 + 4 blogghubbar).
2. **Skapa omdirigeringarna i Nyehandel.** De finns INTE i Nyehandel i dag. Antingen Kontrollcenter → Redirects, typ "Any", eller via API (`POST /v3/url_redirects`). API-vägen kräver en nyckel med `url-redirect:create`, som den nuvarande inte har.
   - Alla 75 `/ÅÅÅÅ/MM/DD/{slug}` → `/sv/post/{slug}`
   - `/artiklar-cannabis-laglig-alternativ-vad-ar-thch-thcjd`, `/nyheter`, `/category/fordjupning` och `/author/hazey` → `/sv/posts`
   - Produkt- och kategoriomdirigeringar från WooCommerce hanteras i katalogmigreringen (TASK 04 / catalog-reconciliation), inte här.
3. **Koppla domänen** www.hazey.se (och hazey.se) till Nyehandel som primär domän (support: "Koppla domänen"). Kontrollera att canonical, sitemap och `robots.txt` därefter använder www.hazey.se.
4. **Stäng av butikens `noindex, nofollow`.** Obligatoriskt i samma steg, annars faller hazey.se ur Google när de gamla URL:erna börjar omdirigeras.
5. **Stickprov direkt efter:**
   - 5 gamla artikel-URL:er ger 301 → 200
   - `/sv/posts` och 3 artiklar har `index, follow` och canonical på www.hazey.se
   - sitemapen listar `/sv/post/`.
6. **Skicka in** den nya sitemapen i Google Search Console och följ 404:or där i 2–4 veckor.
7. **Footerns Swish-logga** (`60-social-footer.js`) hämtas från `www.hazey.se/wp-content/...` och slutar fungera när domänen flyttas. Ladda upp loggan till Theme 8:s assets före bytet.
8. **Behåll** WordPress-exporten och `data/migration-log.json` tills omdirigeringarna är verifierade i Search Console.

## Biblioteket, riktning B (2026-11-12)

Arkivvyn är ombyggd efter `HZY/design/blog-library-2026-11-12/concept-b-*`:
- grön hero, ca 290 px på 1440, lägre än skissen
- ämnesspalt, som är en vågrät rad på mobil
- sökfält med knapp
- numrerad textlista med ämnen och pil
- "Ur arkivet": äldsta artikeln med riktig omslagsbild och ett aktivt ämne.

Riktiga data och samma sökning, ämnen och länkar som tidigare.

**Avvikelser från skissen:**
- **Datum:** skissens datumkolumn visar löpnummer och ämne, eftersom Nyehandels arkivkort saknar årtal.
- **Typetiketter:** "Guide/Fakta" är platshållare och visas inte.
- **Slogan:** skissens "Good products / Higher horizons" är ersatt av butikens egen "Good Plants. Brighter Days." ur footern.
- **H1:** texten är "Kunskap som går att hitta." enligt riktning B, i Nyehandels eget H1-element.

**Bilder:** före och efter, både viewport och helsida, i `runs/library-before-*` och `runs/library-after-*` för 393, 1440 och 1920 px.

**Tester** (`verify-archive.mjs` → `runs/verify-archive.json`, 393/1440/1920):
- **Laddning:** 75 resultat.
- **Visa fler:** 25 → 49 rader, fokus på första nya raden.
- **Sökning:** "terpener" och "apotek" hittar artikeln på sida 10 (titel respektive ingress). Enter med "eu-certifierad" i sökfältet ger 1 träff.
- **Tom sökning och rensning:** tomläget visas, "Visa alla artiklar" fungerar och Escape rensar.
- **Tangentbord:** Tab mellan ämnesknapparna, Enter aktiverar.
- **Övrigt:** alla länkar är vanliga `/sv/post/…`, en H1, ingen horisontell scroll, inga fel. Artikelsidor och regressionssidor är oförändrade.
