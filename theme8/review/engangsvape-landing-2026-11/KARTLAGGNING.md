# /engangsvape/ → Theme 8: kartläggning

Gren `feat/theme8-engangsvape-landing` (från `dev` 1b2f188), 2026-11-15.
Läsande arbete: **ingen kod i produktion, inget i Nyehandel-admin, ingen
omdirigering, ingen kategoriändring, gamla WooCommerce-sidan orörd.**

Underlag:
- gamla sidan `https://www.hazey.se/engangsvape/` läst 2026-11-15 (HTML i `data/gammal-engangsvape-2026-11-15.json`, bilder `shots/gammal-*`);
- SEO-underlaget `HZY/design/engangsvape-seo-2026-11-15/SEO-HANDOFF.md` (GSC 2026-08-11–11-11, OpenSEO-volymer);
- Nyehandel preview: `alla-vapes`, med och utan I lager-filter, samt Theme 8:s rendering (`shots/t8-alla-vapes-*`).

Status per rad: **behåll** · **förbättra** · **faktakontroll** · **beslut** (Vilmer). Inget gammalt innehåll är struket; det som inte står på förslagssidan finns kvar här med skäl.

## 1. Läge i Nyehandel

| Kontroll | Resultat |
|---|---|
| `/engangsvape`, `/engangsvape/`, `/sv/engangsvape`, `/sv/page/engangsvape`, `/sv/categories/engangsvape(s)` | **404** överallt. Ingen omdirigering och inget slug-uppslag (till skillnad från `/thcx`, som hittar kategorin `thcx`). Sluggen `engangsvape` ser ledig ut. |
| Katalog för formatet | `alla-vapes` (20 produkter, 8 i lager). Theme 8 visar den som katalog med serieflikar, filter, "Hitta rätt vape" och volymfilter `?typ=vapes&volym=1ml/2ml/5ml`. |
| Konflikt i katalogen | `alla-vapes` har kvar en gammal kategoritext med rubriken "THCH Vape: En Resa mot Psykoaktivitet" (effektpåstående). Gäller kategorin, inte landningen. **beslut**: rätta i katalogarbetet. |

## 2. Head och SEO

| Gammalt | Förslag | Status |
|---|---|---|
| Titel `Vapes med Lagliga Cannabinoider - THCA Vape Sverige \| Hazey` | `Engångsvapes med cannabinoider – Magic Sauce, Core och CBD \| Hazey` | **beslut**. "Lagliga" är ett juridiskt påstående. "THCA Vape" säljs inte som engångsvape i lager i dag (THCA-B och THCbA är slut i Nyehandel). Titeln bär `engångsvape`, sidans svagaste sökord (position 26) med störst volym (880/mån). |
| Meta `Sveriges bredaste utbud av lagliga cannabis vapes – Magic Sauce, CBD, THCV, H4CBD och CBN. Garanterad och snabb leverans.` | `Engångsvapes hos Hazey: Magic Sauce 3.0, Hero's Core och CBD i 1+1, 2 och 5 ml. Se vad som finns i lager och pris, med analysintyg på produktsidorna.` | **beslut**. "Bredaste", "lagliga" och "garanterad leverans" är obelagda. THCV, H4CBD och CBN är slut i lager. |
| Canonical `/engangsvape/`, robots `index, follow` | Egen canonical `/sv/page/engangsvape`; `index, follow` vid lansering | behåll (hela Nyehandel är `noindex` i dag, ett lanseringshinder som för THCX) |
| URL `/engangsvape/` | `/sv/page/engangsvape` + 301 från `www.hazey.se/engangsvape/` vid domänbytet | **beslut**, inte gjort. Får **inte** peka på `alla-vapes` (SEO-underlaget: två sidor, två avsikter). |
| Schema `WebPage, BreadcrumbList, WebSite, Organization` | Nyehandels egna + BreadcrumbList. Ingen FAQPage förrän FAQ:n är godkänd. | behåll |
| og:image = profilbild | Nyehandels standard | behåll |
| **Två H1** ("Engångsvapes" och "Engångsvapes med lagliga cannabinoider – Upptäck framtidens vape hos Hazey") | En H1 `Engångsvapes`. Den andra blir inte H2 i sin gamla form ("lagliga", "framtidens") och ersätts av H2 "Vad är en engångsvape?" | förbättra |

## 3. Innehåll rad för rad (sidordning)

| # | Gammalt innehåll | På förslagssidan | Status |
|---|---|---|---|
| 1 | H1 "Engångsvapes" | H1 "Engångsvapes" | behåll |
| 2 | Underrubrik "Lagliga Cannabis Vapes i Sverige" (dragspel) | – | **beslut** (laglighet blockerad som F1 på THCX). Bär sökorden `cannabis vape` (95 klick) och `thc vape sverige`; se avsnitt 6. |
| 3 | "Den perfekta lösningen för smidig och diskret förvaring av dina favoritcannabinoider." | – | förbättra: "förvaring" stämmer inte för formatet. Ersatt av ingressens "Färdigfyllda vapes med cannabinoider, klara att använda direkt ur förpackningen." |
| 4 | "noggrant utvalda för att säkerställa hög kvalitet och enastående upplevelser" | – | faktakontroll ("upplevelser" läses som effekt) |
| 5 | "Utforska olika smaker, koncentrationer och märken …" | Ingressen: serier, smaker och storlekar i lager | förbättra |
| 6 | "bekväm och effektiv dosering", "fördelar som cannabinoider har att erbjuda" | – | **stryks inte, men används inte**: effekt-/doseringspåstående (varumärkesregeln) |
| 7 | "Hazey.se är din pålitliga destination för Engångsvapes …" | – | beslut (marknadsfras, ingen information) |
| 8 | Länk "Artiklar" → `/artiklar` | "våra artiklar" → `/sv/posts` (75 migrerade artiklar) | behåll |
| 9 | Länk FAQ → `/faq/` | "Vanliga frågor" → `/sv/page/faq` (200) | behåll |
| 10 | USP-band: "Fri frakt från 499 kr", "Skickas från Sverige", "Alltid diskreta paket" (två gånger) | Theme 8:s globala trygghetsrad och sidfot ("Diskret frakt", "Skickas från Sverige") | förbättra. **Fraktlöftet tas inte med**: kassan har tagit 49 kr över 499 kr (FAKTAKOLL THCX). |
| 11 | Produktlista, 13 kort (avsnitt 4) | Tre serievägar på sten + "Välj storlek" + sortimentsled med varje smak som kort, bara i lager, live | förbättra |
| 12 | "Tillbaka till butiken", "Betala Tryggt:" + Swish-logga | Global header/sidfot och kassa | behåll (globalt) |
| 13 | H1 #2 + stycket "Sveriges bredaste utbud … från THCB och CBD till H4CBD, 10-OH-HHC och Nano11. Alltid 100 % lagligt …" | – | **beslut/faktakontroll**: "bredaste" obelagt; THCB, H4CBD, 10-OH-HHC och Nano11 finns inte som engångsvape i lager; "100 % lagligt" blockerat |
| 14 | H2 "Vad är engångsvapes med cannabinoider?" | H2 "Vad är en engångsvape?" | förbättra |
| 15 | "Engångsvapes, även kallade disposable vapes, är färdigfyllda vaporizers som är klara att användas direkt ur förpackningen." | Ordagrant | **behåll** |
| 16 | "De innehåller cannabinoider från lagliga växter" | – | faktakontroll (framställning; "semisyntetisk/naturidentisk" är obeslutat) |
| 17 | "perfekta för dig som vill uppleva nya doftupplevelser utan att behöva ladda eller fylla på" | "De kan inte fyllas på; när en är tom lämnas den till elektronikåtervinning." | **faktakontroll**: om modellerna kan laddas eller inte är inte kontrollerat; inget påstående förrän det är gjort per serie |
| 18 | "Alla våra produkter är THC-fria enligt svensk lagstiftning och varje batch analyseras noggrant" | Kapitel "Analysintyg" med den godkända THCX-formuleringen | **faktakontroll** ("varje batch", "THC-fria") + **beslut** (laglighet) |
| 19 | H2 "Populära cannabinoider i våra vapes nu och genom tiderna" + THCB, THCA, H4CBD, Nano 11, Magic Sauce (med beskrivningar) | H2 "Serier i sortimentet": Magic Sauce, Hero's Core, CBD, THCbA/D10/THCV, med länk till varje serie | förbättra + **beslut**: THCB, THCA, H4CBD och Nano 11 som engångsvape i lager saknas. "Magic Sauce – en extremt välutvecklad syntetisk cannabinoid" krockar med den obeslutade terminologin och skrivs inte om. |
| 20 | H2 "Varför välja engångsvapes från Hazey?" + 4 bockar (Alltid lagligt, Snabb leverans, Stort utbud, Trygg shopping) | Globala trygghetsraden | förbättra; "Alltid lagligt" **beslut** |
| 21 | H2 "Vanliga frågor om våra vapes" + "Vi uppdaterar våra texter löpande …" | FAQ-sektionen | förbättra |
| 22 | H3 "Hazey.se – Din trygga partner för cannabinoider, dofter och känsla" + "Vi sköter juridiken – du fokuserar på vibben. 💚" | – | **beslut** ("känsla", "vibben" och juridiklöftet) |
| 23 | FAQ "Är engångsvapes från Hazey lagliga i Sverige?" – "Ja! …" | Blockerad (kommentar i utkastet) | **beslut**, som THCX F1 |
| 24 | FAQ "Behöver jag ladda eller fylla på engångsvapes?" – "Nej! … bara öppna och njut. När de är slut, återvinn dem." | Ja, omskriven | faktakontroll (laddning) |
| 25 | FAQ "Vilka cannabinoider innehåller era vapes?" – "THCB, H4CBD, Nano10, THCH och fler …" | Ja, svaret hänvisar till lagret och produktsidan | förbättra (de nämnda ämnena finns inte som engångsvape i lager; serien i katalogen heter Nano 11, inte Nano10) |
| 26 | FAQ "Är era produkter testade?" – "certifierade labb … Labbrapporter finns tillgängliga." | Ja, med THCX-formuleringen | faktakontroll ("certifierade") |
| – | Ny: "Vad skiljer 1, 2 och 5 ml?" | Ja | **beslut** (ny text) |
| – | Ny: "Hur snabbt skickas min beställning?" (samma som THCX) | Ja | behåll (redan granskad) |

## 4. Produktutbud: gamla 13 kort mot Nyehandel i dag

| Gammalt kort (Woo-lager) | Nyehandel-route | NH i lager | På förslaget |
|---|---|---|---|
| THCbA 47 % – Faraoh – 2 ml (4 av 8) | `thcba-vape-faraoh-2ml` | **nej** | Ingen väg. **Lageravvikelse Woo/NH**, ska stämmas av före lansering. Kommer automatiskt med i ledet när den är i lager. |
| CBD 56 % Cereal Milk + London P.C. 1+1 ml | `cookies-dual-chamber-…` | ja | Väg "Cookies CBD" + led |
| Magic Sauce 3.0 – 2 ml (7 av 9) | `vape-magic-sauce-magic-farmers-2ml` | ja | Väg "Magic Sauce 3.0" + led |
| Hero's Core – 2 ml | `thc-x-vape-hero-core-2ml` | ja | Väg "Hero's Core" + led |
| CBD 25 % + CBN 35 % – 2 ml | `cbd-vape-cbn-vape-magic-farmers` | ja | Led |
| CBD 56 % Triple Scoop + Apples & Bananas | `cookies-cbd-vape-dual-chamber-…` | ja | Väg "Cookies CBD" + led |
| CBD 57 % Adios M.F. + Miami Mint | `cookies-cbd-vape-adios-mother-f-miami-mint` | ja | Väg "Cookies CBD" + led |
| Magic Sauce 3.0 – 5 ml (slut i Woo) | `magic-sauce-vape-5ml` | **ja** | Led. **Lageravvikelse** åt andra hållet. |
| D10 – 2 ml | `d10-vape-magic-farmers` | nej | Seriens sida |
| THC-V 20 % – CBD Group – 2 ml | `thcv-vape-cbd-group-2ml` | nej | Seriens sida |
| H4CBD 95 % – Canntropy – 1 ml | `h4cbd-vape-canntropy-1ml` | nej | – |
| CBN 89 % – Canapuff – 1 ml | `cbn-vape-canapuff-1ml` | nej | – |
| H4CBD 97 % – 2 ml (slut i Woo) | `h4cbd-vape-cbd-group-2ml` | **ja** | Led. **Lageravvikelse.** |

`alla-vapes` har dessutom 7 produkter som inte fanns på gamla sidan (bl.a. THCA-B 50 % Faraoh, THC-B 35 % Faraoh 1 ml, THCV Euphoria, CBD 46 % Hazey 1 ml); alla är slut. Woo-betygen (4,71 o.s.v.) tas inte med i förslaget; om de finns i Nyehandel är inte kontrollerat.

## 5. Länkar

| Gammal | Ny | Status |
|---|---|---|
| `/artiklar` | `/sv/posts` | behåll (route 200 via bloggmigreringen) |
| `/faq/` | `/sv/page/faq` | behåll (200) |
| `/butik/` ("Tillbaka till butiken") | `/sv/categories/alla-vapes?typ=vapes` ("Filtrera alla vapes") | förbättra |
| (inga serielänkar) | `ms-vapes`, `hero-vapes`, `cbd-vapes`, `thcba-vapes`, `d10-vapes`, `thcv-vape` (alla 200) | ny intern länkning |
| (ingen volymlänk) | `alla-vapes?typ=vapes&volym=2ml/5ml` (200). 1+1 ml har inget volymfilter och länkar därför till Cookies-produkten. | **beslut**: eget filtervärde för 1+1 ml i katalogen? |

## 6. Sökfrågor → rätt sida

| Fråga (GSC till `/engangsvape/`) | Ska landa på | Hur landningen stödjer den utan felaktigt påstående |
|---|---|---|
| `thc vape` 1 559 klick, `thc vape sverige` 1 230, `thc vapes` 261 | denna landning | Skyddas av URL-mappningen (301) och sidans ämne. Ordet "THC" används **inte** som produktspecifikation. **beslut**: om och hur "THC" får stå i titel/brödtext. |
| `thca vape` 483 | i dag denna landning; på sikt THCA-B/THCbA-hubbarna | Serielänken till THCbA. Ingen THCA-text förrän sortimentet finns i lager. |
| `cannabis vape` 95 (pos. 2,4) | denna landning | Bevaras genom URL och ämne. Gamla underrubriken (rad 2) bar ordet; **beslut** om formuleringen. |
| `engångsvape` 880/mån (pos. 26), `engångs vape` 1 900/mån (pos. 31), `engångsvapes` 110 | denna landning | H1, titel, H2 "Vad är en engångsvape?" och FAQ. Sökresultatet domineras av nikotinbutiker; sidan förklarar formatet sakligt utan att låtsas vara något annat. |
| `cbd vape sverige` 37 / `cbd vape engångs` 2 | `cbd-vapes` | Serielänken CBD + Cookies-vägen |
| `vapes` 3 klick (712 visningar), `hhc vape` (alla-vapes) | `alla-vapes` | Länken "Filtrera alla vapes"; ingen konkurrerande text |
| `vape penna` | egen pennsida (inte byggd) | Ej här |
| `thcx vape` | Hero's Core-PDP + `/sv/page/thcx` | Ej generisk THCX-text här; bara serievägen |

## 7. Öppna beslut och avvikelser (sammanfattning)

1. Titel och meta (avsnitt 2), och om "THC"/"cannabis" får stå i titel eller underrubrik.
2. Laglighet: rad 2, 13, 18, 20, 22, 23. Blockerad som på THCX tills granskad text finns.
3. Faktakontroll: laddning per serie (rad 17, 24), "certifierade labb"/"varje batch" (18, 26), framställning (16).
4. Lageravvikelser Woo/NH: THCbA 47 % 2 ml, Magic Sauce 5 ml, H4CBD 97 % 2 ml.
5. Ny text: ingress, H2-texterna, FAQ "Vad skiljer 1, 2 och 5 ml?".
6. 1+1 ml som filtervärde i katalogen.
7. `alla-vapes` gamla kategoritext ("THCH … Psykoaktivitet").
8. Egen produktfri formatbild till uppslaget (skissen lånar THCX-kustfotot).
