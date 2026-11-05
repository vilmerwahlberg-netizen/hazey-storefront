# Bildsystemets kostnad — före/efter (TASK 17C, 2026-11-05)

Mätt med `perf.mjs` mot Theme 8-previewen: 4 sidor × 393/1440 × kall, varm och Fast 3G (1,6 Mbit/s, 562 ms RTT, 4× CPU). Loadern och bundlen byts lokalt via CDP Fetch (HTTP-cachen förblir på, så varm laddning är verklig). Kall och varm laddning: en ren, varvad körning (sida för sida: före → runtime → manifest, inget annat jobb igång). Fast 3G: likadant varvat, en körning per bygge och cell. räknarna (anrop, klassificeringar, omskanningar, stilbyten) är deterministiska, medan tiderna (TBT, script, LCP) brusar ±30–50 % mellan körningar och bara bör läsas som storleksordning.

## Sammanfattning, kall laddning (summa 8 sidvyer)

| | före bildsystemet (f0ac3be) | runtime-klassning (6f31f3e) | statiskt manifest (17C) |
|---|---:|---:|---:|
| CDN-bildanrop | 185 | 322 | 179 |
| varav CORS-sonder (extra hämtning för pixelläsning) | 2 | 122 | 0 |
| dubbla nätverkshämtningar (samma URL) | 0 | 34 | 0 |
| klassificeringar (canvas getImageData) | 2 | 120 | 0 |
| dokumentvida omskanningar under laddning | 0 | 246 | 0 |
| omskanningar av 10 klick per sida | 0 | 80 | 0 |
| bilder målade obehandlade och sedan omstylade | – (inget bildsystem) | 4 | 0 |
| long tasks | 28 | 31 | 29 |
| TBT ms | 1515 | 1733 | 1978 |
| CLS (max) | 0.000 | 0.001 | 0.001 |

PDP, 3 miniatyrklick: omskanningar 0/0 · 39/39 · 0/0 (före/runtime/manifest, 393/1440), klassificeringar 0/0 · 2/2 · 0/0. Scenen följer aktiv bild: true/true (manifest).

## Kall laddning

| Sida | Bredd | Bildanrop (nät) b/r/m | CORS-sonder r/m | Klass. r/m | Skan r/m | Long tasks b/r/m | TBT ms b/r/m | LCP ms b/r/m | CLS b/r/m |
|---|---:|---|---|---|---|---|---|---|---|
| Startsida | 393 | 14 (14) / 24 (20) / 14 (14) | 7 / 0 | 7 / 0 | 29 / 0 | 4 / 3 / 3 | 200 / 166 / 202 | 1316 / 1192 / 1168 | 0.000 / 0.000 / 0.000 |
| Startsida | 1440 | 14 (14) / 22 (20) / 14 (14) | 7 / 0 | 7 / 0 | 34 / 0 | 3 / 3 / 3 | 141 / 153 / 194 | 1108 / 680 / 832 | 0.000 / 0.000 / 0.000 |
| Bästsäljare | 393 | 15 (15) / 27 (25) / 15 (15) | 12 / 0 | 12 / 0 | 41 / 0 | 3 / 4 / 3 | 114 / 248 / 328 | ej mätt / ej mätt / ej mätt | 0.000 / 0.000 / 0.000 |
| Bästsäljare | 1440 | 15 (15) / 27 (25) / 15 (15) | 12 / 0 | 12 / 0 | 31 / 0 | 3 / 4 / 3 | 169 / 429 / 425 | 1724 / ej mätt / ej mätt | 0.000 / 0.000 / 0.000 |
| Alla Buds | 393 | 27 (27) / 51 (27) / 27 (27) | 23 / 0 | 24 / 0 | 17 / 0 | 4 / 4 / 4 | 248 / 162 / 211 | ej mätt / ej mätt / ej mätt | 0.000 / 0.000 / 0.000 |
| Alla Buds | 1440 | 27 (27) / 52 (27) / 27 (27) | 23 / 0 | 24 / 0 | 21 / 0 | 4 / 5 / 5 | 182 / 201 / 230 | ej mätt / ej mätt / ej mätt | 0.000 / 0.001 / 0.001 |
| PDP Yoda | 393 | 35 (33) / 58 (39) / 32 (32) | 19 / 0 | 17 / 0 | 31 / 0 | 3 / 4 / 3 | 191 / 145 / 184 | 920 / 1032 / 1056 | 0.000 / 0.000 / 0.000 |
| PDP Yoda | 1440 | 38 (36) / 61 (41) / 35 (35) | 19 / 0 | 17 / 0 | 42 / 0 | 4 / 4 / 5 | 270 / 229 / 204 | 1404 / 1276 / 1180 | 0.000 / 0.000 / 0.000 |

## Varm laddning (samma flik, HTTP-cache + sessionStorage)

| Sida | Bredd | Bildanrop (nät) b/r/m | CORS-sonder r/m | Klass. r/m | Skan r/m | Long tasks b/r/m | TBT ms b/r/m | LCP ms b/r/m | CLS b/r/m |
|---|---:|---|---|---|---|---|---|---|---|
| Startsida | 393 | 14 (0) / 14 (0) / 14 (0) | 0 / 0 | 0 / 0 | 31 / 0 | 0 / 0 / 0 | 0 / 0 / 0 | 696 / 600 / 588 | 0.000 / 0.000 / 0.000 |
| Startsida | 1440 | 14 (0) / 14 (0) / 14 (0) | 0 / 0 | 0 / 0 | 32 / 0 | 2 / 2 / 1 | 99 / 139 / 28 | 572 / 704 / 496 | 0.000 / 0.000 / 0.000 |
| Bästsäljare | 393 | 15 (0) / 15 (0) / 15 (0) | 0 / 0 | 0 / 0 | 25 / 0 | 2 / 2 / 2 | 52 / 162 / 56 | 1032 / 1184 / 984 | 0.000 / 0.000 / 0.000 |
| Bästsäljare | 1440 | 15 (0) / 15 (0) / 15 (0) | 0 / 0 | 0 / 0 | 27 / 0 | 2 / 6 / 1 | 222 / 637 / 29 | 1260 / 2880 / 892 | 0.000 / 0.000 / 0.000 |
| Alla Buds | 393 | 27 (0) / 27 (0) / 27 (0) | 0 / 0 | 0 / 0 | 16 / 0 | 2 / 2 / 2 | 31 / 63 / 52 | 988 / 904 / 916 | 0.000 / 0.000 / 0.000 |
| Alla Buds | 1440 | 27 (0) / 27 (0) / 27 (0) | 0 / 0 | 0 / 0 | 16 / 0 | 2 / 2 / 2 | 71 / 55 / 30 | 1092 / 1092 / 900 | 0.000 / 0.000 / 0.000 |
| PDP Yoda | 393 | 40 (5) / 32 (0) / 38 (6) | 0 / 0 | 0 / 0 | 37 / 0 | 2 / 2 / 2 | 69 / 73 / 65 | 472 / 456 / 496 | 0.000 / 0.000 / 0.000 |
| PDP Yoda | 1440 | 40 (2) / 35 (0) / 38 (3) | 0 / 0 | 0 / 0 | 42 / 0 | 1 / 2 / 2 | 9 / 62 / 199 | 1108 / 1204 / 1264 | 0.000 / 0.000 / 0.000 |

## Fast 3G + 4× CPU (kall)

| Sida | Bredd | Bildanrop (nät) b/r/m | CORS-sonder r/m | Klass. r/m | Skan r/m | Long tasks b/r/m | TBT ms b/r/m | LCP ms b/r/m | CLS b/r/m |
|---|---:|---|---|---|---|---|---|---|---|
| Startsida | 393 | 9 (9) / 15 (15) / 10 (10) | 6 / 0 | 0 / 0 | 19 / 0 | 7 / 9 / 6 | 2091 / 1873 / 1229 | 14716 / 14500 / 13904 | 0.000 / 0.000 / 0.000 |
| Startsida | 1440 | 9 (9) / 15 (14) / 9 (9) | 6 / 0 | 0 / 0 | 23 / 0 | 9 / 7 / 8 | 1759 / 1597 / 1707 | 13976 / 13956 / 14040 | 0.000 / 0.000 / 0.000 |
| Bästsäljare | 393 | 15 (15) / 27 (16) / 15 (15) | 12 / 0 | 12 / 0 | 25 / 0 | 6 / 6 / 6 | 1327 / 1851 / 1235 | ej mätt / ej mätt / ej mätt | 0.000 / 0.000 / 0.000 |
| Bästsäljare | 1440 | 15 (15) / 27 (15) / 15 (15) | 12 / 0 | 12 / 0 | 30 / 0 | 7 / 5 / 6 | 1549 / 1103 / 1918 | ej mätt / ej mätt / ej mätt | 0.000 / 0.000 / 0.000 |
| Alla Buds | 393 | 27 (27) / 51 (27) / 27 (27) | 23 / 0 | 24 / 0 | 10 / 0 | 5 / 18 / 16 | 1328 / 4132 / 3691 | ej mätt / ej mätt / ej mätt | 0.000 / 0.000 / 0.000 |
| Alla Buds | 1440 | 27 (27) / 52 (28) / 27 (27) | 23 / 0 | 24 / 0 | 14 / 0 | 10 / 16 / 19 | 2279 / 4842 / 5181 | ej mätt / ej mätt / ej mätt | 0.000 / 0.000 / 0.000 |
| PDP Yoda | 393 | 35 (33) / 58 (38) / 32 (32) | 19 / 0 | 12 / 0 | 28 / 0 | 9 / 5 / 5 | 2198 / 1527 / 1768 | 10860 / 10576 / 10372 | 0.000 / 0.000 / 0.000 |
| PDP Yoda | 1440 | 38 (36) / 61 (38) / 35 (35) | 19 / 0 | 17 / 0 | 36 / 0 | 7 / 5 / 5 | 3271 / 1270 / 1936 | 11904 / 10628 / 11044 | 0.000 / 0.000 / 0.000 |

## Bildsystemets egen CPU-tid (manifest)

Uppmätt i sidan (instrumenterad MutationObserver-callback + rAF-flush i 03a-product-media.js, kall laddning + rullning): **0,3–1,8 ms** observer och **0,3–1,7 ms** flush per sida (Bästsäljare, Alla Buds, startsida, PDP vid 393/1440). En forcerad omsynk av alla bildytor (11–25 st) tar 1–15 ms inklusive stilomräkning. TBT-skillnaderna mellan byggena ovan (några hundra ms över 8 sidvyer) är alltså inte bildsystemet utan brus från den levande sajten (Trustpilot, GTM, Nyehandels egen Vue-rendering).

## Alla Buds: seriehärledningens hämtningar (fynd i Fast 3G-mätningen)

Med 4× CPU hade båda 17B-byggena 3,7–5,2 s TBT på Alla Buds mot 1,3–2,3 s före (tabellen ovan, mätt före fixen). Orsaken var inte bildsystemet (0 klassningar i manifestbygget), utan att 17B:s seriehärledning hämtade och tolkade seriernas hubb **och alla** deras serie×format-routes, alltså också vapes, carts och hasch: 29 kategorisidor. 17C hämtar bara hubben och sidans egen formatroute, vilket ger 20 sidor (före-bygget hämtade 16 men härledde serierna ur headerlänkar och missade Core). Mängderna är oförändrade: buds-filter PASS vid 1440/393, och Allt Hasch och Alla Vapes är identiska med 17B.

| Fast 3G + 4× CPU, Alla Buds | TBT ms (körning 1 / 2) | Long tasks |
|---|---|---|
| före bildsystemet (f0ac3be) 393 | 2856 / 2132 | 13 / 9 |
| före bildsystemet (f0ac3be) 1440 | 3357 / 6290 | 14 / 20 |
| runtime-klassning (6f31f3e) 393 | 3946 / 3733 | 16 / 15 |
| runtime-klassning (6f31f3e) 1440 | 3349 / 2655 | 13 / 9 |
| statiskt manifest (17C) 393 | 2234 / 2309 | 8 / 9 |
| statiskt manifest (17C) 1440 | 2916 / 2195 | 13 / 8 |

Bruset är stort (före-bygget 2,1–6,3 s), men manifestbygget med fixen ligger nu inom före-byggets intervall, och runtime-bygget ligger över det.

LCP "ej mätt": Chromium rapporterade ingen LCP-post före mätpunkten på kategorisidorna vid kall laddning (likadant i alla tre byggen). Varm laddning ger värden där.
