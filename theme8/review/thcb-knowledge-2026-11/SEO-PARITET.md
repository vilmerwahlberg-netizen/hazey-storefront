# SEO-paritet: gamla /thcb/ mot nya THCB-sidan

Kontrollerad 16 november 2026 (andra granskningsrundan).

- Mätskript: `seo-parity.mjs`, resultat i `seo-parity.json`.
- **Gamla sidan:** serverns HTML för https://www.hazey.se/thcb/, hämtad läsande. Bara innehållsdelen räknas, utan meny och sidfot. De 22 artikelutdragen räknas separat.
- **Nya sidan:** `theme8/blocks/thcb.html` med föreslagen title och meta.

Tabellen visar **var** en sökavsikt finns i levererad HTML. Den förklarar inte varför den gamla sidan rankar. Ranking beror också på länkar, domänens historik, konkurrens och mycket annat, så ingen enskild text kan pekas ut som orsak.

## Sökfrågor (GSC, 11 augusti–11 november 2026, gamla `/thcb/`)

| Fråga | Klick / visningar | Gamla sidan | Nya sidan | Bedömning |
|---|---|---|---|---|
| `thcb` | 480 / 3 585 | title, H1, 2 H2, 1 H3, 5 stycken | title, meta, H1, 4 H2, 6 FAQ, löptext | **bevarad**: samma primära ämne och samma H1 |
| `thc b` | 119 / 396 | står inte i sidans egen text | ingress, faktaraden "Skrivs också", FAQ-svaret om skrivsätt | **förbättring**: skrivsättet förklaras en gång |
| `thc-b` | 59 / 302 | 4 stycken (används som synonym), kategoriknappens text | title, meta, FAQ-frågan "Är THC-B och THCB samma sak?", 4 stycken | **bevarad och förtydligad** |
| `thcb vape` | 58 / 586 | inget i sidans egen text: vape fanns bara i meny, kategoribilder och produktkort | FAQ "Säljer Hazey THCB-vapes …?", kapitel 03 (har sålts i vapes och patroner) och länk till THCB-kategorin med aktuellt lager | **förbättring av svaret**: inget THCB säljs nu, så sidan säger det i stället för att visa en köpknapp. Ingen generell vape-text (underlaget: konkurrera inte med `/engangsvape/`). |
| `thcb hash` | 28 / 155 | inget | FAQ-svaret och kapitel 03: "Någon THCB-hasch har vi inte", plus länk till Hasch som annan produkt | **förbättring**: frågan får ett sakligt svar |
| `thcb sverige` | 18 / 499 | 3 stycken ("Intresset … i Sverige", laglighetsresonemanget) | title ("THCB (THC-B) i Sverige"), meta, H2 "Är THCB lagligt i Sverige?", FAQ | **förbättring**: daterat, källbelagt svar i stället för obelagt resonemang |

**Upprepning:** "THCB" står 41 gånger på 791 ord, de flesta i rubriker, innehållslistan och FAQ-frågor. I tidslinjen och några brödtexter står "ämnet" i stället, där sammanhanget redan är klart. Inget sökord är inlagt för frekvensens skull.

## Sididentitet

| Fält | Gamla | Nya (förslag) | Bedömning |
|---|---|---|---|
| Title | `THCB - Hazey.se` | `THCB (THC-B) i Sverige – fakta, rättsläge och källor \| Hazey` (60 tecken) | Ämnet står först i båda (**bevarat**). Skrivsättet, Sverige och sidtypen läggs till (**förbättring**). |
| Meta description | saknas | `Vad är THCB, eller THC-B? Fakta om tetrahydrocannabutol, rättsläget i Sverige med daterade primärkällor, THCB hos Hazey och vanliga frågor.` (139 tecken) | **ny** |
| H1 | 3: `THCB` och två `Inga resultat hittades` | 1: `THCB` | **förbättring**: en H1 |
| H2/H3 | H2 `Vad är THCB?`, `THCB`. H3 `Andra Kategorier:`, `Är THCB säkert?`. Utdragen ger 27 H2 till. | H2 `Vad är THCB?`, `Är THCB lagligt i Sverige?`, `THCB hos Hazey`, `Källor`, `Vanliga frågor om THCB`. H3 `I sortimentet nu`. | `Vad är THCB?` är **bevarad**. "Är THCB säkert?" är **bevarad som FAQ**. Rubrikstrukturen följer innehållet (**förbättring**). |
| Ord i sidans egen text | 394 (1 650 med de 22 utdragen) | 791 | Mer ämnesspecifik text. Utdragen om andra ämnen följer inte med. |
| Innehåll i levererad HTML | ja (WordPress-serverrenderat) | ja: alla rubriker, stycken, faktarader, källor och FAQ-svar (36 av 36 kontrollerade i `verify.json`). Bara lagerraden fylls av JS. | **bevarat** |
| FAQ | en fråga ("Är THCB säkert?") som H3 | sex frågor som `<details>`, med svaren i HTML | **förbättring** |
| Strukturerad data | ingen för sidan | ingen ännu (beslut B6) | oförändrat |
| Canonical | `https://www.hazey.se/thcb/` | sidans egen adress efter slugbeslut | beror på 301-beslutet (B5) |

## Interna länkar

| | Gamla (14 i sidans egen del, 42 med utdragen) | Nya (8 interna och 8 externa) |
|---|---|---|
| Ämnets kategori | `/produkt-kategori/alla-produkter/thcb/` (2 gånger: "KÖP THCB" och "THC-B KATEGORISIDA") | `/sv/categories/thcb` (2 gånger, textlänkar, ingen köpknapp) |
| Relaterade ämnen | kategoribilder: THCH, THCV, THC-JD, THCPO, muscimol, H4CBD, CBD, buds, gummies, carts, engångsvape, kampanjer, bästsäljare | THCA-guiden, THCX-sidan, Engångsvapes och Hasch |
| Artiklar | 22 automatiska utdrag, bland dem "Är THCB lagligt?" och "Vad är THCB?" | 1 relaterad artikel (FHM:s förslag 2024) och länk till alla artiklar |
| Hjälp | — | Vanliga frågor |
| Källor | inga | 6 primärkällor och bildkreditens 2 länkar |

**Bevarat:** länken till ämnets egen kategori och vägen till artiklarna.

**Inte bevarat, med skäl:**
- Kategorier för ämnen som numera står i förordningarnas förteckningar (THCH, THC-JD). Muscimol föreslogs för klassning 13 november 2025. Övriga kategorilänkar saknar ämnessamband.
- De två THCB-artiklarna, eftersom de motsäger FHM:s yttrande (se `GAMLA-PASTAENDEN.md`).
- Underkategorierna `/sv/categories/thcb-vapes` (1 produkt, slut i lager) och `/sv/categories/thcb-carts` (tom) länkas inte (beslut B3).

**Nytt:** länk tillbaka till THCA-guiden. Länken till rättslägeshubben läggs till när hubben finns.
