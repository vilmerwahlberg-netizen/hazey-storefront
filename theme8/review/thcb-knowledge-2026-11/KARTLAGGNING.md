# THCB: gamla /thcb/ mot nya kunskapssidan, rad för rad

Datum: 16 november 2026. Gren `feat/theme8-thcb-knowledge` (från `origin/dev` `f7ae8a1`).

- Gammal sida: https://www.hazey.se/thcb/, läst 16 november 2026. Skärmbilder: `shots/gammal-thcb-{393,1440}-full`.
- Ny sida: `theme8/blocks/thcb.html`.
- Underlag: `design/kunskap-rattslage-2026-11-16/SEO-BYGGUNDERLAG.md`, visuell riktning `kunskapsmall-b.png`.

**Ingenting är publicerat.** Inget i admin, inga omdirigeringar, inget tema och inga artiklar eller produkter är ändrade.

Markering per rad, enligt underlaget:

| Markering | Betyder |
|---|---|
| **behåll** | Samma sakinnehåll, ny form. |
| **förbättra** | Samma avsikt, omskrivet eller korrigerat. |
| **faktakontroll** | Står på sidan, men behöver separat innehållsgranskning före publicering. |
| **avstå** | Följer inte med. Skälet anges, och gammal text står som HTML-kommentar i blocket där den hade stått. |

## 1. Sididentitet (förslag, inte beslutat)

| Fält | Gammal | Ny |
|---|---|---|
| Title | `THCB - Hazey.se` | `THCB (THC-B) i Sverige – fakta, rättsläge och källor \| Hazey` (60 tecken; runda 2) |
| Meta description | saknas | `Vad är THCB, eller THC-B? Fakta om tetrahydrocannabutol, rättsläget i Sverige med daterade primärkällor, THCB hos Hazey och vanliga frågor.` (139 tecken; runda 2) |
| H1 | två: `THCB` och `Inga resultat hittades` (dessutom ett andra `Inga resultat hittades` längre ned) | en: `THCB` |
| H2/H3 | `Vad är THCB?`, 22 artikelrubriker, `THCB`, `Meny` m.m. | H2: `Vad är THCB?`, `Är THCB lagligt i Sverige?`, `THCB hos Hazey`, `Källor`, `Vanliga frågor om THCB`. H3: `I sortimentet nu` |
| Canonical | `https://www.hazey.se/thcb/` | sidans egen adress efter beslut om slug (testfixturen använder `/sv/page/thcb`) |
| Slug och 301 | — | `/sv/page/thcb`, `/thcb` och `/sv/thcb` ger i dag en 301 till `/sv/categories/thcb` (kontrollerat 16 november). Att skapa sidan bör göra `/sv/page/thcb` till 200, som för THCA. `/thcb` och `/sv/thcb` kräver ett beslut om omdirigering. Inget är ändrat. |
| Strukturerad data | ingen för sidan | ingen ännu. FAQPage eller Article kräver att Nyehandel släpper igenom `<script type="application/ld+json">` i ett innehållsblock. Det är inte testat. |

## 2. Search Console-frågor och var de besvaras

GSC, organisk sökning, 11 augusti–11 november 2026, gamla `/thcb/`. Frågorna används som rubrik-, FAQ- och länkavsikter. Inget ord upprepas för frekvensens skull: "THCB" står där det naturligt är ämnet, och namnvarianterna förklaras en gång i texten och en gång i FAQ.

| Fråga | Klick/visningar | Besvaras i |
|---|---|---|
| `thcb` | 480 / 3 585 | H1, ingress, kapitel 01, FAQ "Vad är THCB?" |
| `thc b` | 119 / 396 | ingressen ("även skrivet THC-B eller THC B"), faktaraden "Skrivs också", FAQ "Är THC-B och THCB samma sak?" |
| `thc-b` | 59 / 302 | title, meta, ingressen, FAQ "Är THC-B och THCB samma sak?" |
| `thcb vape` | 58 / 586 | kapitel 03 (vad Hazey har sålt och aktuellt lager via kategorin), FAQ "Säljer Hazey THCB-vapes eller THCB-hasch?". Ingen köpväg till THCB. Engångsvapes länkas som annan produkt, inte som ersättare (underlaget: konkurrera inte med `/engangsvape/`). |
| `thcb hash` | 28 / 155 | samma FAQ: "Någon THCB-hasch har vi inte." Hasch-kategorin länkas som annan produkt. |
| `thcb sverige` | 18 / 499 | title ("THCB (THC-B) i Sverige"), meta, H2 "Är THCB lagligt i Sverige?", FAQ |

Mätt per fält i `SEO-PARITET.md` / `seo-parity.json` (runda 2).

## 3. Rad för rad

| # | Gamla sidan (ordagrant eller sammanfattat) | Ny sida | Markering |
|---|---|---|---|
| 1 | H1 `THCB` | H1 `THCB` med etikett "Ämnesguide" och tagline "Fakta, källor och rättsläge" | behåll |
| 2 | H2 `Vad är THCB?` | H2 `Vad är THCB?` (kapitel 01) | behåll |
| 3 | "THCB, eller Tetrahydrocannabutol, är en av de nyare föreningarna som hittats i cannabisväxten." | "THCB är en förkortning av tetrahydrocannabutol …" och "THCB hör till de cannabinoider som har beskrivits i cannabisväxten först på senare år. År 2020 publicerade en italiensk forskargrupp …" med källa 06 | förbättra (belagt med källa) |
| 4 | "Liksom THC är THCB en psykoaktiv komponent, men med en twist." | — | avstå: effektpåstående, varumärkesgräns |
| 5 | "Den bindar sig till kroppens cannabinoidreceptorer med högre affinitet." | — | avstå: studien (källa 06) anger affinitet *jämförbar* med THC, inte högre. Effektnära. |
| 6 | "Detta betyder att THC-B kan ge en starkare och mer intensiv upplevelse än … THC." | — | avstå: effektpåstående utan stöd |
| 7 | "Intresset för THCB har vuxit i Sverige då entusiaster söker nya och unika upplevelser …" | — | avstå: saknar källa, upplevelsefokus |
| 8 | "… forskningen kring THC-B [är] fortfarande i ett tidigt skede, så det är viktigt att närma sig med försiktighet och kunskap." | FAQ "Är THCB säkert?": "Det finns lite forskning om THCB, och Hazey ger inga råd om användning." | förbättra |
| 9 | Knapp "KÖP THCB" → `/produkt-kategori/alla-produkter/thcb/` | Ingen köpknapp. Textlänk "butikens THCB-kategori" + live lagerrad ("I kategorin nu: 1 produkt, ingen i lager.") | förbättra: inget THCB i lager 16 november. Faktakontroll av produkten, se 6.3. |
| 10 | H1 "Inga resultat hittades" + "Sidan du begärde kunde inte hittas …" (två gånger) | — | avstå: trasig WooCommerce-sektion |
| 11 | "THCB Lagligt?" + "THC-B … är inte specifikt nämnd i lagen som en olaglig substans. Med stöd av EU-lagstiftning kring industricertifierad hampa bör THCB inte klassas som en olaglig substans." | H2 "Är THCB lagligt i Sverige?" + neutral, daterad genomgång och tidslinje med fyra datum. Ingen slutsats om laglighet. | förbättra (frågan) + avstå (resonemanget: obelagt, och FHM:s utredning sedan 5 mars 2024 nämns inte) |
| 12 | "Reglering och Gränser: … THC-innehåll den avgörande faktorn … maximalt 0,2% THC …" | — | avstå: 0,2 %-gränsen gäller odling av industrihampa, inte ett ämnes klassning. Underlaget: "Visa inte … att en viss THC-procent automatiskt avgör status." |
| 13 | "… produkter som marknadsförs som THC-B kan variera i innehåll och kvalitet" | Indirekt: "varje produktsida visar innehåll och lager" | förbättra |
| 14 | Två produktkort: Tatra Hemp THC-B disposable 1 ml (449 kr) och cartridge 1 ml (399 kr) | "Hazey har sålt THCB i vapes och patroner, bland annat från Tatra Hemp och Faraoh." Inga kort och inga priser. | förbättra: historisk produktkontext, inte köpbar |
| 15 | H3 "Andra Kategorier:" (bildlänkar till bästsäljare, THCH, THCV, THCB, THC-JD, THCPO, muscimol, H4CBD, CBD, buds, gummies, carts, engångsvape, kampanjer) | H3 "I sortimentet nu": Engångsvapes, THCX, Hasch, med etiketten "Andra ämnen och produkter än THCB. De ersätter inte THCB …" | förbättra: THCH, THC-JD (delta-9-THC-C8) och HHCPO-släkten står numera i förordningarnas förteckningar (kontrollerat i riksdagen.se:s text). Muscimol föreslogs för klassning 13 november 2025. Länkas inte. |
| 16 | "Fri frakt från 499 kr · Skickas inom Sverige · Alltid diskreta paket" (två gånger) | — | avstå: fraktvillkor verifieras separat (underlaget) |
| 17 | H3 "Här nedan är korta utdrag från alla Hazeys artiklar." + 22 automatiska utdrag + "Alla artiklar" | "Relaterat" (2 länkar) + "Fler texter i våra artiklar" (`/sv/posts`) | förbättra: underlaget säger "inga automatiska 'alla artiklar'-block". Se avsnitt 5. |
| 18 | H3 "Är THCB säkert?" + "Även om användarrapporter indikerar positiva effekter … börja med små doser och övervaka sina reaktioner …" | FAQ "Är THCB säkert?" utan dosråd eller effekt, med hänvisning till FHM:s yttrande | förbättra (dosråd och effekt: avstå) |
| 19 | H2 "THCB" + knapp "THC-B KATEGORISIDA" | FAQ-svaret och kapitel 03 länkar kategorin (`/sv/categories/thcb`) | förbättra |
| 20 | Åldersgräns och "samlings- och prydnadsändamål" (sidfot) | Global Theme 8-sidfot (orörd) | behåll (global komponent) |
| — | ny | Index 01–04, status "Rättsläget granskas · Senast kontrollerad 16 nov 2026" | ny (underlaget punkt 1 och 3) |
| — | ny | Faktaspalt: namn, skrivsätt, sidokedja, kemiskt namn (enligt FHM:s yttrande) | ny |
| — | ny | Kapitel 04: sex källor med titel, utgivare och datum | ny (underlaget punkt 7) |
| — | ny | FAQ med sex frågor, svar i initial HTML | ny (avsnitt 2) |

## 4. Länkar

| Mål | Ny sida | Status 16 nov |
|---|---|---|
| `/sv/categories/thcb` | kapitel 03, FAQ | 200, 1 produkt, 0 i lager |
| `/sv/page/thca` | Relaterat, FAQ-sidans knapp | 200 |
| `/sv/post/folkhalsomyndigheten-begar-nya-regler-for-flera-cannabinoider` | Relaterat ("Förslaget om sju cannabinoider 2024") | 200 |
| `/sv/page/engangsvape`, `/sv/page/thcx`, `/sv/categories/hasch` | "I sortimentet nu" | 200 |
| `/sv/page/faq`, `/sv/posts` | FAQ-sidans hänvisning | 200 |
| `#vad-ar-thcb`, `#rattslage`, `#hazey-och-thcb`, `#kallor` | hero, index, FAQ | ankarna finns |
| Rättslägeshubben | — | finns inte ännu (`/lagliga-cannabinoider-sverige/` byggs efter THCB). Kommentar i blocket var länken ska stå. |
| Gamla länkar som inte följer med | THCH-, THC-JD-, THCPO-, muscimol-, THCV-, H4CBD-kategorierna m.fl. och 22 artikelutdrag | se rad 15 och 17 |

Externa källor: FHM:s PDF och nyheter samt riksdagen.se ger 200. `doi.org` svarar 302 till ACS, som spärrar automatiska klienter (403). I webbläsare öppnas artikeln.

## 5. Artiklar

| Artikel (Nyehandel) | Beslut |
|---|---|
| "Är THCB lagligt?" (`/sv/post/ar-thcb-lagligt`, 2024-01-17) | **Lyfts inte fram.** Säger "Ja, I svergie är THCB lagligt i dagsläget (17/1 2024)", resonerar om 0,2 % THC och säger att THC-B inte finns på FHM:s lista. Det sista motsägs av FHM:s yttrande 5 mars 2024. Artikeln är orörd. **Beslut för Vilmer:** uppdatera eller märk som historisk. |
| "Vad är THCB?" (`/sv/post/vad-ar-thcb`, 2024-01-16) | **Lyfts inte fram.** Skriver "tetrahydrocannabibutol", har effektjämförelser och påstår "Självklart kvalar alla produkter i vår butik in under denna magiska gräns". Orörd. Samma beslut. |
| "Folkhälsomyndigheten begär nya regler för flera cannabinoider" (2024-10-24) | Länkas under Relaterat: saklig beskrivning av FHM:s förslag, nämner inte THCB. **Faktakontroll:** några formuleringar ("förstärker effekten") är effektnära. |
| Övriga 19 utdrag (Nano9/10/11, THCNM, CBN, THCV, CBG, H4CBD, THCP, HHC, terpener, EU-hampa m.fl.) | Lyfts inte fram: handlar inte om THCB. Flera har äldre laglighetspåståenden. |

## 6. Källor och faktakontroll

Alla kontrollerade 16 november 2026.

| # | Källa | Vad den belägger |
|---|---|---|
| 01 | Folkhälsomyndigheten, yttrande till Tullverket, dnr 00862-2024, 2024-03-05 (PDF) | Klassificeringsutredning av delta-9-THCB inledd. Ämnet "kan antas komma av regeringen förklaras som narkotika eller hälsofarlig vara". Kemiskt namn. |
| 02 | FHM, "Förslag att 20 substanser klassificeras …", 26 maj 2026 | Nämner inte THCB (alla 20 ämnen genomlästa). |
| 03 | FHM, "Förslag om att klassificera tio substanser som narkotika", 13 november 2025 | Nämner inte THCB. |
| 04 | Förordning (1992:1554), riksdagen.se, ändrad t.o.m. SFS 2026:1109 | THCB, THC-B och "3-butyl…" förekommer inte i förteckningen. THCH, THC-C8 och THCA-A finns där. |
| 05 | Förordning (1999:58), riksdagen.se, ändrad t.o.m. SFS 2026:1803 | THCB förekommer inte. |
| 06 | Linciano m.fl., J. Nat. Prod. 83(1), 2020, doi:10.1021/acs.jnatprod.9b00876 | Isolering av delta-9-THCB ur en cannabissort, butylhomolog till THC. |

**6.1 Ej kontrollerat:** Läkemedelsverkets föreskrifter (LVFS 2011:10) och eventuella beslut efter 16 november. Sidan säger därför "under granskning" och drar ingen slutsats om laglighet.

**6.2 Faktakontroll före publicering:** en separat innehållsgranskning (underlaget punkt 4) ska godkänna:
- kapitel 01 och 02 i sin helhet
- tidslinjen
- formuleringen "THCB hör till de cannabinoider som har beskrivits … först på senare år"

**6.3 Produkten i THCB-kategorin:** "Vape – THC-B 35% – Faraoh – 1ml", slut i lager. Produkttexten anger även 25 % THCHO och 35 % CBG. Ämnesidentiteten för "THCHO" är inte kontrollerad. Kontrollera produkten innan kategorin länkas från en publicerad faktasida.

## 7. Öppna beslut

1. Title och meta (avsnitt 1).
2. Slug, och 301 för `/thcb` och `/sv/thcb`.
3. Länk till kategorin (6.3).
4. De två gamla THCB-artiklarna (avsnitt 5).
5. Stämningsbilden: R3 använder den syntetiska atmosfärsbilden ur `thcb-redesign-r3/` som illustrativ bild, med en rad om det under Källor. R2:s licensierade strandrågsfoto är borttaget. Se `theme8/assets/knowledge-thcb/README.md` och `BESLUT.md` B8.

Alla beslut är samlade i `BESLUT.md`, och gamla påståenden som kräver faktakontroll i `GAMLA-PASTAENDEN.md`.
6. Rättslägeshubben: länkar i båda riktningar när den byggs.
