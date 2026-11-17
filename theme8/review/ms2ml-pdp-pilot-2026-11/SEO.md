# SEO-kontroll MS 2 ml-PDP (runda 2, 2026-11-16)

Underlaget togs fram med `seo.mjs` (data i `seo.json`) och `coverage.mjs` (data i `COVERAGE.md`). Sidan kontrollerades i tre lägen:

- **A:** serverns HTML utan JavaScript.
- **B:** Nyehandel/Vue körs men Theme 8-skriptet är blockerat.
- **C:** renderad pilot.

Bilder: `shots/seo-A-utan-js-1440.jpg` och `shots/seo-B-utan-theme8-js-1440.jpg`.

| | A: rå HTML | B: utan Theme 8-JS | C: pilot |
|---|---|---|---|
| Canonical | `…/products/vape-magic-sauce-magic-farmers-2ml` (utan `/454`, utan preview) | samma | samma |
| Robots | `noindex, nofollow` | samma | samma |
| JSON-LD | WebSite, OnlineStore, Product + offers, BreadcrumbList. Ingen aggregateRating | samma | samma (piloten lägger inte till schema) |
| H1 | **2 st:** produktnamnet + `Magic Sauce 3.0 - Nästa generation…` ur den korta beskrivningen | 2 st, båda synliga | **1** (den andra visas som dold H2) |
| Produkttext (alla stycken) | I HTML | Synlig | Synlig eller bakom klick, se TEXT-DIFF |
| Rubriker i texten | H2/H3/H4 i blandad ordning, emoji | samma | Kapitel-H2 + textens rubriker som nivå 3–4 (aria-level) |
| Interna länkar (kategorier, varumärke, 5 ml, brödsmulor) | I HTML | Synliga | Synliga |
| Nya moduler (Vad är, Labbrapporter, Specifikationer, FAQ, Upptäck fler) | **Finns inte** | Finns inte | Synliga |
| Strainnamn | Bara i labblänkarnas text | I Vue:s select (dold) | Synliga |
| Synligt utan JavaScript | **Ingenting:** `<body style="visibility:hidden">` | Allt, med Nyehandels grundlayout | – |

## Risker

1. **`<body style="visibility: hidden">` i serverns HTML.** Det kommer från Nyehandel och finns även på live (tema 3). Utan JavaScript ser besökaren en tom sida. Google renderar JavaScript, men crawlers och förhandsvisningar som inte gör det ser inget. Det beror inte på piloten men är en plattformsrisk att ta upp med Nyehandel.
2. **Två H1 i serverns HTML.** Den korta beskrivningen i admin innehåller ett `<h1>`, inklistrat med klassen `font-claude-response-body`. Theme 8 rättar det bara i renderad DOM. **Åtgärd i admin:** gör om det till stycke eller H2. Det är inte gjort, eftersom admin inte fick röras.
3. **Ny SEO-text finns bara efter JavaScript.** Det gäller H2 "Vad är Magic Sauce 3.0?", FAQ-svaren, Specifikationer och Labbrapporter. Google indexerar normalt renderat innehåll, men det sker i en senare kö och utan garanti. Ska de bära frågan `vad är magic sauce 3.0` säkert behöver svaret också in i produktbeskrivningen i Nyehandel.
4. **Innehåll bakom klick.** Laglighetstexterna, produktinformationslistan och Folkhälsomyndigheten ligger i stängd `<details>`. Texten finns i DOM och indexeras, men kan vägas lägre. Ingen sökfråga i GSC-underlaget riktar sig mot just den texten.
5. **Rå rubrikstruktur.** Den börjar med H3 "Beskrivning av …", följt av H2 → H3 → H4 och emoji. Piloten rättar nivåerna med `aria-level`, men den råa HTML:en ändras inte. Långsiktigt: rätta i admin.
6. **Metabeskrivningen innehåller obelagda påståenden:** "Semisyntetisk cannabinoidblend baserad på EU-certifierad industrihampa. Testad i oberoende laboratorier." JSON-LD-beskrivningen innehåller hela produkttexten, med laglighets- och THC-påståendena. Båda styrs av admin och påverkas inte av piloten. **De behöver samma faktagranskning som texten.**
7. **`noindex, nofollow` gäller globalt.** Det är känt sedan tidigare och ska tas bort vid domänbytet. Indexeringen kan inte prövas förrän dess.
8. **Labbrapportlänkarna går till `www.hazey.se/wp-content/…`** (WooCommerce). De dör om filerna inte flyttas vid domänbytet.
9. **Canonical ligger på nyehandel-domänen.** Den ska bli hazey.se vid domänbytet. Den gamla Woo-adressens 301 till PDP:n är inte kontrollerad här, se briefen §6.

Ingen risk har tillkommit genom piloten utöver nr 3 och 4, som båda är medvetna avvägningar.
