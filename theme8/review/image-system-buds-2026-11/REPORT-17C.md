# TASK 17C — korrigerings- och prestandarunda (2026-11-05)

Ovanpå `d2cf40e` (bildsystem/PDP) och `6f31f3e` (Alla Buds). Lokalt; ingen push, publicering, adminändring eller bilduppladdning. Design, header, hero, köpflöde, minicart, checkout och produktdata är orörda.

## 1. Vad som ändrades

**Runtime-klassningen är ersatt av ett genererat, statiskt bildmanifest.** Det visuella resultatet är detsamma.

- `theme8/tools/media-manifest.mjs` (ny) hämtar alla produktbilder ur Nyehandel (sitemap + Alla produkter → product/state, 140 produkter, 198 bilder). Varje bild körs genom **samma pixelanalys som 17B** (flyttad hit ur webbläsaren). Resultatet skrivs till `theme8/js/03b-media-manifest.js` (6,4 kB, nyckel = bildfilens 8-tecken hash). Ingen bildtyp är satt för hand.
- `theme8/js/03a-product-media.js` läser manifestet. Det gör **ingen extra bildhämtning, ingen canvas och ingen klassning i besökarens webbläsare**. Typen sätts ur bildens URL (alla CDN-storlekar ger samma hash, även `data-src`/`srcset` före laddning) och därmed innan bilden målas.
- Omskanning sker bara när något ändrats: tillagda noder, bytt `src`/`srcset`/`data-src` och byte av aktiv PDP-slide. Lyssnarna för globalt klick, `load` och `transitionend` är borttagna, så klick och övriga DOM-ändringar startar ingen omskanning.
- En bild som saknas i manifestet (en ny produkt innan manifestet genererats om) visas orörd (`unverified`), utan tonzon. Kör `node theme8/tools/media-manifest.mjs` och bygg om.
- Bundlen växer med +1,8 kB gzip.
- `96-product-media.css`: bara kommentaren ändrad.
- **Likvärdighet:** 127 av 127 första-bilder ger exakt samma post som 17B:s webbläsarklassning: typ, kantton och tonzon per sida (`runs/media-audit.json` mot manifestet). Granskningsbladet `review/14-fore-efter-forsta-vy.jpg` visar identisk rendering av startsida, Alla Buds och PDP vid 393 och 1440.
- **Alla Buds-härledningen** (`80-category.js`, `seriesMemberRoutes`) hämtar nu bara seriens hubb plus sidans egen formatroute, inte alla seriens vape-, cart- och hasch-routes. Antalet hämtade sidor går från 29 till 20 med samma mängder (se 2 och 3). Det upptäcktes i Fast 3G-mätningen.
- Inbakade bakgrunder friläggs eller maskeras inte. De står som **"Kräver frilagt original"** i `MEDIA-LISTS.md`, avsnitt A, med en kolumn för verifierad Canva-kandidat.

## 2. Prestanda före/efter

Fullständiga tabeller finns i `PERF.md` (`perf.mjs`, `perf-summary.mjs`). Mätningen gäller startsida, Bästsäljare, Alla Buds och Yoda-PDP vid 393 och 1440, med kall laddning, varm laddning och Fast 3G med 4× CPU. Byggena körs varvat sida för sida, med HTTP-cachen påslagen via CDP-interception.

Kall laddning, summa över 8 sidvyer:

| | före bildsystemet | runtime (17B) | manifest (17C) |
|---|---:|---:|---:|
| CDN-bildanrop | 185 | 322 | 179 |
| CORS-sonder (extra hämtning för pixelläsning) | 2 | 122 | **0** |
| dubbla nätverkshämtningar | 0 | 34 | **0** |
| klassificeringar | 2 | 120 | **0** |
| omskanningar av hela dokumentet under laddning | 0 | 246 | **0** |
| omskanningar av 10 klick per sida | 0 | 80 | **0** |
| bilder målade obehandlade, sedan omstylade | – | 4 | **0** |
| CLS (max, produktytor) | 0,000 | 0,001 | 0,001 |

Övriga mätpunkter:

- **PDP, 3 miniatyrklick:** runtime gör 39 omskanningar och 2 nya klassningar, manifestet 0 och 0. Scenen följer ändå den aktiva bilden.
- **Varm laddning:** runtime gör fortfarande 16–42 omskanningar per sida, manifestet 0.
- **CPU:** bildsystemets egen tid är 0,3–1,8 ms för observern och 0,3–1,7 ms för flushen per sida (mätt i sidan).
- **Long tasks, TBT och LCP** ligger inom bruset från den levande sajten i alla tre byggen (±några hundra ms). Bildsystemet påverkar dem inte mätbart.
- **Alla Buds med Fast 3G och 4× CPU:** 17B hade 3,7–5,2 s TBT mot 1,3–2,3 s före, eftersom 29 kategorisidor hämtades och tolkades. Efter hämtningsfixen ligger manifestbygget på 2,2–2,9 s, inom före-byggets brusintervall på 2,1–6,3 s.
- **Fast 3G:** LCP styrs av nätet (10–17 s i alla byggen). Runtime-varianten skickar 12–24 extra bildanrop per sida över den långsamma länken, manifestet inga.
- **CLS på startsidan** (feedbacksektionen) fanns redan och är oförändrad: 0,55 vid 393 både före och efter.

## 3. Alla Buds-filtren efter kodändringen

`buds-filter.mjs` jämför mot Nyehandels kategoridata, live, vid 1440 och 393, efter båda kodändringarna. Alla steg ger **PASS**, utan dubbletter:

- Magic Sauce 19, Core 4, D10 4, Nano-11 21.
- 3,5 g 8 och 5 g 45.
- Magic Sauce + Nano-11 + 5 g ger 34, också efter omladdning och bakåt från PDP.

0 konsolfel och 0 överflöd. Allt Hasch och Alla Vapes har identiska serieval, dimensioner och antal som 17B (`regress-filters.mjs`). `verify.mjs` på 22 sidvyer (320/393/430/1440/1920 och 200 % zoom) gav 0 beskurna bilder, 0 fel och 0 överflöd. Galleri, strainbyte och zoom visar bara produktens egna bilder, och scenen följer aktiv bild (`runs/verify-17c.json`).

## 4. Yoda Ice Cream som R2B (lokal granskningskoppling)

- **Master:** Canva-exporten `cutouts/masters/yoda-ice-cream-canva-768.png` (692×871, RGBA, kopierad ur Downloads, så sökvägen är inget beroende).
- **Alfa:** kanten är helt genomskinlig och inga produktpixlar rör dukens kant.
- **Match (`cutout-match.mjs`, mot alla 198 katalogbilder):** bild #194 `magic-sauce-buds-yoda-ice-cream-5-gram`. Felet är 13,2, mot 42,9 för närmaste andra produkt (×3,2).
- **Täckning:** 99,98 % av katalogbildens produkt med 2 px registreringstolerans, och 99,5 % även med mjuka skuggor. Diagnosbilden `review/10-yoda-cutout-coverage-diag.png` visar att det som inte täcks är en kantlinje runt hela siluetten. Inga buds, ingen stjälk och ingen del av påsen saknas.
- **Samma foto tre gånger:** Yodas tre Nyehandel-bilder (#194, #204, #205) är byte-identiska. Friläggningen ersätter alla tre.
- **WebP** (`cutout-prep.mjs`): `cutouts/magic-sauce-buds-yoda-ice-cream-5-gram-194.webp`, 103 kB (q 90, förlustfri alfa). Mastern är 938 kB. Samma analys som manifestet ger `transparent`.
- **Koppling** (`lib/review-images.mjs`): bara i Playwright. CDN-hämtningarna av Yodas bilder (alla storlekar) får den lokala WebP:n, och den lokala bundlens manifestpost byts mot den uppmätta. Produktionskoden innehåller ingen granskningskod.
- **Resultat (`review/11–13`):** R2B på PDP desktop (direkt i Faraoh-scenen, utan beige ruta) och mobil, på startsidan, i Bästsäljare, i Alla Buds och i seriehubbens räls "Magic Sauce Buds". Alla ytor ger `data-hz8-media="transparent"`, 0 fel och 0 överflöd.
  - Yoda finns i dag inte i någon PDP:s relaterat-räls ("Mer från serien" visar de första 8 i `ms-buds`). Därför testades samma kompakta räls-komponent på seriehubben.
- **Att granska:** i korten blir påsen något mindre än före. Canva-duken har 4–11 % genomskinlig marginal, och den läggs till bildytans egen inset. Om du vill kan WebP:n beskäras till alfakanten, vilket bara tar bort helt genomskinliga pixlar och lämnar produkten orörd. Det har jag inte gjort.

**Efter ditt godkännande** (inget av detta är gjort):

1. Ladda upp PNG:n eller WebP:n som Yodas produktbild i Nyehandel i stället för #194/#204/#205. Behåll en bild, eftersom de tre är dubbletter.
2. Kör `node theme8/tools/media-manifest.mjs` och bygg om. Yoda blir då R2B överallt utan granskningskoppling.

**Övriga Canva-filer** (`CUTOUT-CANDIDATES.md`): av de 12 exporterna som redan låg i huvudrepot saknar 7 alfakanal. De är helbildskompositioner och kan inte ersätta en inbakad bakgrund.

| Status | Antal | Filer |
|---|---:|---|
| Godkänd kandidat | 1 | `nano11-buds.png` (motsvarar Nano-11 Zkittlez Mousse, bild #271) |
| Trolig, kräver din bekräftelse | 1 | `nano11-preroll.png` (motsvarar 7 % Nano11 Pre-roll, #236, fel 14,1 strax över gränsen) |
| Matchar ingen nuvarande katalogbild | 3 | THCaB cart/vape, THCbA vape |

Fler Canva-filer kräver Canva-inloggning (`/mcp`) eller fler exporter.

## 5. Kräver admin eller nya frilagda bilder

Den exakta listan finns i `ADMIN-LIST.md`. Varje rad är kontrollerad live mot Nyehandel i dag och har NH-id, slug, SKU och åtgärd.

1. **Pre-rolls:** skapa kategorin (`pre-rolls`) för 257 `magic-sauce-pre-rolls-1g`, 165 `7-nano11-prerolled-1-gram` och 258 `cbd-prerolled-cookies-1g`.
2. **Dölj:** 36 paket som är dolda i Woo men listade i NH. Dölj också High Life-buds 204 och 135, som inte är listade i Woo. Deras paket 176 och 174 ingår bland de 36. Core försvinner då ur Alla Buds.
3. **CBD-isolatet** 185 `isolat-cbd-isolate-15-gram`: ta bort det ur `blommor-buds`.
4. **Utan bild: 13.** 5 av dem är kundlistade: 234, 197, 191, 196 och 220. 8 är paket eller delprodukter.
5. **Varumärke: alla 140.** 69 har fel varumärke (Canapuff utan belägg) och 71 saknar det. Förslag ur belägg finns per rad (Woo-tillverkarkategori och tillverkarnamn), och 15 rader måste du ange själv.
6. **Dubblettbilder:** 6 produkter har samma foto uppladdat flera gånger, bland dem Yoda.
7. **Nya frilagda original** behövs för alla produkter i `MEDIA-LISTS.md` avsnitt A, utom Yoda och kandidaterna ovan.

## Filer

- Produktionskod: `theme8/js/03a-product-media.js`, `theme8/js/03b-media-manifest.js` (genererad), `theme8/tools/media-manifest.mjs`, `seriesMemberRoutes` i `theme8/js/80-category.js` och en kommentar i `theme8/css/96-product-media.css`.
- Granskning (denna mapp):
  - Rapporter: `REPORT-17C.md`, `PERF.md`, `ADMIN-LIST.md`, `CUTOUT-CANDIDATES.md`, `MEDIA-LISTS.md`.
  - Skript: `perf.mjs`, `perf-summary.mjs`, `early.mjs`, `admin-list.mjs`, `cutout-match.mjs`, `cutout-prep.mjs`, `cutout-review.mjs`, `cutout-candidates.mjs`, `lib/review-images.mjs`.
  - Bilder: `cutouts/` (master, WebP, register) och `review/10–14`.
  - Data: `runs/*`. 17B:s `runs/verify-after.json` och `capture-after.json` är bevarade; 17C:s finns i `verify-17c.json` och `capture-17c-after.json`.
