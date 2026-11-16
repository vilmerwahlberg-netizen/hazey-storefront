# Rättslägeshubben: gamla /lagliga-cannabinoider-sverige/ mot nya sidan

16 november 2026. Gren `feat/theme8-rattslage-hub`, från `dev` `904844e`. Ny sida: `theme8/blocks/rattslage.html`. CSS i `88f-landing-hub.css`, JS i `88f-landing-hub.js`.

**Ingenting är publicerat.** Gamla WooCommerce-sidan, artiklar, kategorier, produkter och Nyehandel-admin är orörda. Varje status och datum är kontrollerad för sig i `KALLKONTROLL.md`.

## 1. Vad som finns i dag

| Var | Status 16 nov 2026 |
|---|---|
| Gamla `https://www.hazey.se/lagliga-cannabinoider-sverige/` | 200. Title: `Lagliga Cannabinoider i Sverige 2026 - Komplett Lista \| Hazey`. Meta: "Vilka cannabinoider är lagliga i Sverige just nu? Uppdaterad efter lagändringen 14 juli 2026 - THCA, CBD och andra. Källor: FoHM & Regeringen". En H1. Sidan har schema för FAQPage och BreadcrumbList och är senast ändrad 2026-07-20. |
| `/lagliga-cannabinoider-sverige`, `/sv/page/lagliga-cannabinoider-sverige`, `/sv/page/rattslage` (Nyehandel) | 404 |
| Nyehandels kortadresser | `/hhc/` ger i dag 301 till `/sv/page/hhc`, även med avslutande snedstreck, utan att någon regel är skapad (se `../knowledge-pages-admin-2026-11/RAPPORT.md`). |

## 2. Search Console (11 aug–11 nov 2026, gamla adressen, SEO-BYGGUNDERLAG.md)

| Fråga | Klick / visningar | Besvaras i |
|---|---|---|
| `laglig cannabis` | 29 / 172 | FAQ "Finns det laglig cannabis i Sverige?" med lagens hampundantag, "Öppna frågor" om THC-halt och industrihampa |
| `lagliga droger 2026` | 28 / 165 | Title, meta och H2 "Ämnesindex" med kontrolldatum. Tidslinjen "Klassningarna sedan 2023" visar besluten 2026. Ordet "droger" används inte; frågan besvaras med vad som är narkotika och hälsofarlig vara. |
| `cannabinoider sverige` | 14 / 81 | H1 "Cannabinoider i Sverige", title |
| `lagliga cannabinoider` | 11 / 113 | FAQ "Vilka cannabinoider är lagliga i Sverige?", ingressen och indexet |

**Sökavsikten bevaras utan att klassade ämnen kallas lagliga.** Frågan "vilka är lagliga" besvaras med vad förteckningarna säger, med datum och källa. Där sidan inte kan svara står det en neutral status, och frågan finns under Öppna frågor. Att text och struktur täcker frågorna är inget löfte om ranking.

## 3. Rad för rad

Markeringar som för THCB, THCH och HHC:

| Markering | Betyder |
|---|---|
| **behåll** | Sakinnehållet följer med. |
| **förbättra** | Sakinnehållet följer med, omskrivet eller rättat. |
| **faktakontroll** | Får inte användas förrän en källa är kontrollerad. |
| **avstå** | Följer inte med. |

| # | Gamla sidan | Ny sida | Markering |
|---|---|---|---|
| 1 | H1 "Lagliga cannabinoider i Sverige – det kompletta rättsläget" | H1 "Cannabinoider i Sverige" (skissen). Eyebrow "Rättsläge", tagline "Ämne för ämne, med källa och datum". | förbättra: samma ämne och "Sverige". "Lagliga" i H1 avstås eftersom de flesta raderna är klassade. |
| 2 | "Senast uppdaterad: 17 juli 2026. Denna sida uppdateras inom 24 timmar vid varje nytt besked … Bokmärk den." | "Kontrollerad mot förordningarna 16 november 2026" | förbättra datumet. **Avstå** från 24-timmarslöftet, som ingen äger (underlaget). |
| 3 | "Den 14 juli 2026 narkotikaklassades THCA tillsammans med flera andra substanser" | Kapitel 03: regeringens beslut 11 juni 2026, 18 narkotika och 2 hälsofarliga varor, i kraft 14 juli 2026 | behåll, nu med beslutsdatum och källa |
| 4 | "– bara ett år efter att Nano 9 och Nano 10 klassades som hälsoskadliga varor" | – | faktakontroll: handelsnamn, ingen källa säger vilka ämnen produkterna innehöll |
| 5 | "Vi på Hazey har sålt lagliga cannabinoider sedan 2023 och följer varje beslut …", "Inga gissningar, inga gråzoner" | – | avstå: generellt laglighetslöfte och obelagt årtal |
| 6 | H2 "Snabböversikt – vad är lagligt just nu?" + tabell med 15 rader och 🟢🟡🔴 | H2 "Ämnesindex": tabell med 20 ämnen. Status i ord, datum, källa och guidelänk. Sökbar. | förbättra. Varje rad är kontrollerad för sig (`KALLKONTROLL.md`): 4 stämmer, 7 motsägs eller rättas, 3 handelsnamn avstås, 6 ämnen tillkommer från förteckningarna. |
| 7 | Teckenförklaring "🟢 Laglig att köpa, sälja och inneha · 🟡 Laglig men under utredning · 🔴 Förbjuden" | "Vad statusen betyder": narkotika, hälsofarlig vara, inte i förteckningarna, öppen fråga, med lagrum | förbättra. Ingen färgsignal. "Laglig att köpa …" används inte. |
| 8 | "Tabellen uppdaterad: 17 juli 2026. Källor: Regeringen, Folkhälsomyndigheten, Läkemedelsverkets narkotikaförteckning." | Kontrolldatum i heron och i metoden. 10 namngivna källor med datum, plus en SFS-länk per rad. | förbättra |
| 9 | H2 "Vad hände 14 juli 2026?" + "Den 11 juni 2026 meddelade Regeringen att 18 substanser narkotikaklassas och två klassas som hälsofarlig vara … trädde i kraft den 14 juli 2026" | Kapitel 03 "Klassningarna sedan 2023", samma uppgifter. Pressmeddelandet bland källorna. | behåll (stämmer med regeringen.se 11 juni 2026) |
| 10 | "THCA … var Sveriges mest sålda lagliga cannabinoid", "omvandlas till THC vid upphettning, vilket gjorde att myndigheterna bedömde ämnet som narkotika i praktiken" | – | faktakontroll: försäljningspåstående och myndighetsmotiv utan källa. Kemin finns i THCA-guiden. |
| 11 | "THCA är inte längre lagligt att köpa, sälja eller inneha … alla former – buds, vapes, hash och isolat" | FAQ "Är THCA lagligt i Sverige?": "Nej … narkotika sedan 14 juli 2026" | förbättra: klassningen anges exakt, utan egen tolkning av handlingarna |
| 12 | H2 "Vad betyder 'under utredning'?" + "fullt laglig att köpa, sälja och inneha" + "sex månader och två år" | FAQ "Vad betyder det att ett ämne utreds?", Öppna frågor om THCB och H4-CBD | förbättra. "Fullt laglig" och tidsintervallet avstås (obelagt). |
| 13 | "Det är också därför vi aldrig bygger vårt sortiment på en enda cannabinoid." | – | avstå: säljtext |
| 14 | H2 "Vad köper man istället för THCA?" + Magic Sauce ("framtagen för att ge en liknande upplevelse") och Nano 11, "Båda är verifierat lagliga" | Kapitel 04 "Ämnen, blandningar och handelsnamn" med länkar till Magic Sauce, Nano11 och THCA-guidens serier | förbättra länkarna. **Avstå** från "liknande upplevelse" (effekt) och "verifierat lagliga" (generellt löfte). |
| 15 | H2 "Hur vet man att en cannabinoid är laglig?": 1. Narkotikaförteckningen ("Läkemedelsverket för listan") | "Så kontrollerar vi": förordningen 1992:1554 | förbättra |
| 16 | 2. "Lagen om hälsofarliga varor … olagliga att sälja och importera, men inte att inneha" | Lag (1999:42) 3 §: får inte utan tillstånd "innehas" | **rättas**: motsägs av lagtexten |
| 17 | 3. "THC-halten. Produkter från industrihampa är lagliga om de kommer från EU-certifierade sorter och THC-halten ligger under gränsvärdet" | Öppna frågor: hampundantaget gäller växten och vissa sorter, inte en generell procentgräns. HD 2019. | **rättas**: förenkling som HD-avgörandet motsäger för CBD-olja med THC |
| 18 | "Allt vi säljer på Hazey prövas mot dessa tre kriterier … Vi säljer hellre färre produkter än produkter i gråzon." | – | avstå: obelagd rutin |
| 19 | FAQ "Är THCA lagligt i Sverige?" | Samma fråga | behåll frågan. Svaret rättat: "närmaste lagliga valet" är borttaget. |
| 20 | FAQ "Är Magic Sauce lagligt i Sverige?" "Ja …" | – | avstå: handelsnamn, ingen ämnesbedömning (kapitel 04) |
| 21 | FAQ "Vad är straffet för att inneha THCA?" + "rekommenderar vi att du gör dig av med dem" | – | avstå: juridisk rådgivning. Påföljd beror på omständigheter som sidan inte kan bedöma. |
| 22 | FAQ "Är CBD lagligt i Sverige?" "Ja, under förutsättning …" | Samma fråga, neutralt svar med HD och Livsmedelsverket | förbättra (rättat) |
| 23 | FAQ "Kan fler cannabinoider bli olagliga?" + "vi uppdaterar den inom 24 timmar" | Tidslinjen och FAQ "Vad betyder det att ett ämne utreds?" | förbättra. Löftet avstås. |
| 24 | FAQ "Vad betyder det att en cannabinoid är 'under utredning'?" | FAQ "Vad betyder det att ett ämne utreds?" | förbättra |
| 25 | FAQ "Var kan jag köpa lagliga cannabinoider i Sverige?" "Hos oss … varje produkt … prövad" | – | avstå: säljpåstående med generellt laglighetslöfte |
| 26 | "Handla tryggt – alltid lagligt … juridiskt verifierad … Labbtestad, spårbar och laglig" + "Se hela sortimentet" | – | avstå: generellt laglighetslöfte. Sortimentet nås via headern. |
| 27 | Länkar: THCA-kategorin ("Se lagliga ersättare"), regeringens pressmeddelande, Magic Sauce, Nano 11, butiken | THCA-guiden, pressmeddelandet, Magic Sauce, Nano11, THCA-guidens serier. Dessutom THCB-, THCH- och HHC-guiderna, 10 källor och 10 SFS-länkar per rad. | förbättra. Butikslänken avstås (headern). |
| – | ny | Sök, öppningsbara mobilrader, statusförklaringar, tidslinje 2023–2026, öppna frågor, källor, FAQ "Finns det laglig cannabis i Sverige?" och "Vad är skillnaden mellan narkotika och hälsofarlig vara?" | ny |

## 4. Interna länkar

| Från hubben till | Status |
|---|---|
| `/sv/page/thca`, `/sv/page/thcb`, `/sv/page/thch`, `/sv/page/hhc` | 200 (finns i Nyehandel), vanliga `<a href>` i tabellen och i "Ämnesguider" |
| `/sv/page/hhc#fragor` (HHCP), `/sv/page/thca#alternativ` | 200 + ankare finns |
| `/sv/categories/magic-sauce`, `/sv/categories/nano` | 200 |
| `/sv/page/faq`, `/sv/posts` | 200 |

**Tillbaka till hubben:** THCB, THCH och HHC säger i en kommentar att hubben länkas när den finns. Att lägga till länken ändrar de tre sidor som redan finns i Nyehandel, så det är ett eget steg (beslut R5).

## 5. Förslag: slug, titel, meta och gamla adressen

| Fält | Förslag |
|---|---|
| Namn (brödsmula) | `Rättsläge` |
| Slug | **`lagliga-cannabinoider-sverige`** (rekommenderas). Alternativ: `cannabinoider-sverige`. |
| Title | `Cannabinoider i Sverige – rättsläge ämne för ämne, med källor \| Hazey` (67 tecken) |
| Meta | `Vilka cannabinoider är narkotika eller hälsofarliga varor i Sverige? Ämnesindex med status, datum och primärkälla för THCA, THCB, THCH, HHC, CBD med flera, kontrollerat 16 november 2026.` (186 tecken; kan kortas till ca 155 i admin) |

**Varför den gamla slugen?**
- Samma sökväg som gamla sidan, så adressen kan mappas 1:1 vid domänbytet.
- Nyehandel skickar redan kortadresser som `/hhc/` med 301 till `/sv/page/hhc`. Med samma slug bör `/lagliga-cannabinoider-sverige/` gå till sidan utan någon egen regel. Det är en slutsats av hur `/hhc` och `/hhc/` beter sig, inte prövat för den här slugen.
- Ordet "lagliga" står då i adressen, men inte i H1 eller title.
- Väljs `cannabinoider-sverige` behövs en uttrycklig 301 från `/lagliga-cannabinoider-sverige/` till `/sv/page/cannabinoider-sverige`. Det kräver behörighet för omdirigeringar.

**Så når den gamla adressen sidan:**
1. Före domänbytet: inget. Gamla `www.hazey.se/lagliga-cannabinoider-sverige/` ligger kvar på WooCommerce.
2. Efter att sidan skapats: kontrollera att `https://hazeyse.nyehandel.se/lagliga-cannabinoider-sverige/` ger 301 till `/sv/page/lagliga-cannabinoider-sverige` och att den sidan ger 200.
3. Vid domänbytet: `https://www.hazey.se/lagliga-cannabinoider-sverige/` ska ge 301 till `/sv/page/lagliga-cannabinoider-sverige`, i ett hopp, utan att gå via en tom kategori.
