# THCB, första kunskapssidan i Theme 8: byggd för granskning

**Gren och läge**
- Gren `feat/theme8-thcb-knowledge`, från `origin/dev` (`f7ae8a1`), i en egen worktree.
- Inte mergad.

**Orört**
- Ingen sida är skapad i Nyehandel.
- Admin, omdirigeringar, aktivt tema, artiklar, kategorier och produkter är orörda.

**Underlag**
- `design/kunskap-rattslage-2026-11-16/SEO-BYGGUNDERLAG.md`.
- Visuell riktning: `kunskapsmall-b.png` (fältatlas).

## Filer

| Fil | Vad |
|---|---|
| `theme8/blocks/thcb.html` | Hela sidan i initial HTML: 1 H1, 5 H2, 1 H3, 24 länkar, 6 FAQ. Gammal text som inte följer med står som kommentarer med markering. |
| `theme8/css/88e-landing-atlas.css` | Mallen "fältatlas". Alla 102 selektorer kräver `html.hz8-atlas-page`. |
| `theme8/js/88e-landing-atlas.js` | Sätter sidklassen och fyller lagerraden med Nyehandels räknare. Ingen text skapas i JS, utom lagerraden. |
| `theme8/assets/knowledge-thcb/umbel-stone-620.webp` | Produktfri stämningsbild, beskuren ur skiss B. |
| `KARTLAGGNING.md` | Rad för rad mot gamla /thcb/, GSC-frågor, länkar, artiklar, källor och öppna beslut. |
| `verify.mjs`, `compare.mjs`, `verify.json`, `shots/` | Test och jämförelser. |
| `theme8/blocks/LANDING-PAGES.md` | Mallen dokumenterad. |

Inga befintliga filer i `theme8/css` eller `theme8/js` är ändrade. THCX, Engångsvapes, THCA och övriga sidor påverkas därför inte.

## Sidordning

1. **Hero**
   - Text: brödsmula (Hem / THCB), "Ämnesguide", H1 "THCB", tagline "Fakta, källor och rättsläge", ingress och pilvägarna "Vad är THCB?" och "Rättsläge".
   - Bild: fotot står till höger upp under glasheadern på desktop, och som band under texten på mobil och surfplatta.
2. **Index**
   - Kapitlen 01–04 som ankarlänkar.
   - Till höger: "Rättsläget granskas · Senast kontrollerad 16 nov 2026" och "Relaterat" (THCA-sidan och FHM-artikeln från 2024).
3. **01 Vad är THCB?** Definition, namnvarianter och sidokedja. Faktaspalt med namn, skrivsätt, sidokedja och kemiskt namn enligt FHM.
4. **02 Är THCB lagligt i Sverige?** Neutral status, belagd text och en tidslinje med fyra datum. Ingen slutsats om laglighet.
5. **03 THCB hos Hazey**
   - Historik: Tatra Hemp och Faraoh.
   - "Ingen THCB-hasch".
   - Länk till kategorin och live lagerrad: "I kategorin nu: 1 produkt, ingen i lager."
   - "I sortimentet nu": Engångsvapes, THCX och Hasch, uttryckligen inte som ersättare.
6. **04 Källor** Sex källor med titel, utgivare och datum.
7. **FAQ** Sex frågor och "Fler ämnesguider" (THCA). Sedan den globala sidfoten.

## Rättsläget, belagt 16 november 2026

- **Folkhälsomyndigheten, 5 mars 2024 (dnr 00862-2024):**
  - En klassificeringsutredning av delta-9-THCB är inledd.
  - Ämnet "kan antas komma av regeringen förklaras som narkotika eller hälsofarlig vara".
  - **Den gamla sidan och de två THCB-artiklarna säger motsatsen** ("inte på FHM:s lista", "Ja, lagligt").
- **FHM:s förslag 13 november 2025 och 26 maj 2026:** inget nämner THCB.
- **Förordningarna** (1992:1554) t.o.m. SFS 2026:1109 och (1999:58) t.o.m. SFS 2026:1803: THCB förekommer inte, vare sig som namn eller som kemiskt namn.
- **Formulering på sidan:** "under granskning", aldrig "lagligt" eller "olagligt". Underlaget kräver en separat faktagranskning före publicering.

## Tester (`verify.json`)

Körningarna:
- 320, 393 × 852, 768, 1440 × 900 och 1920
- utan foto
- kategorin utan räknare
- reducerad rörelse
- utan Theme 8-JS

| Kontroll | Resultat |
|---|---|
| H1 | En ("THCB") i alla nio körningar |
| Sidledsscroll | 0 px i alla körningar |
| Konsolfel | 0. Körningen utan JS visar bara laddarens förväntade meddelande. |
| Initial HTML | 36 av 36 rubriker, stycken, faktarader, källtitlar och FAQ-svar finns i levererad HTML. Utan JS syns all text, och lagerraden är dold. |
| Länkar | 18 unika. Interna mål och ankare: 200 eller ok. FHM och riksdagen: 200. `doi.org`: 302 till ACS, som spärrar automatiska klienter. |
| Köpknappar | Inga |
| Förbjudna ord | Inga (psykoaktiv, rus, berus, medicin, effekt, upplevelse, "är lagligt", "är olagligt", 100 %, garanti, fri frakt, dos) |
| Kontrast | Lägst 4,84 (statuschipet). Pilvägar och relaterat ligger på 5,2 eller mer, brödtext på 11 eller mer. |
| Tangentbord | Tab och Enter på "Rättsläge" hoppar till kapitlet under headern (104 px vid 393, 120 px vid 1440). FAQ öppnas med Enter. |
| Felfall | Utan foto står papperets ljus kvar. Utan räknare döljs lagerraden. Reducerad rörelse ger inga övergångar. |

**Mobil 393 × 852:** H1 slutar vid 210 px, ingressen vid 377, pilvägarna vid 477 och fotobandet vid 491–659. Index 01 börjar vid 675 och syns i första skärmen.

**Desktop 1440 × 900:** fotot fyller höger 58 % upp under headern. Index 01 och 02 och status/relaterat syns i första skärmen.

**Om testerna:**
- En körning vid 393 fick ingen av Nyehandels egna stilmallar (ostylad header, synlig skip-länk). Det var ett nätverksfel hos plattformen. Den kördes om och blev grön.
- Den svaga skuggan längs mobilens högerkant finns identiskt på den godkända THCA-sidan. Den kommer från en global plattformskomponent.

## Bilder (`shots/`)

- **Första skärmen:** `thcb-{320,393,768,1440,1920}-fold.webp`
- **Hela sidan:** `thcb-{320,393,768,1440,1920}-full.webp`
- **Felfall:** `thcb-393-noatmo-*`, `thcb-1440-zero-*`, `thcb-393-reduced-*` och `thcb-393-nojs-*`
- **Jämförelser:**
  - `jamfor-393-fold.webp` och `jamfor-1440-fold.webp`: skiss B, gamla /thcb/ och ny sida
  - `jamfor-393-helsida.webp` (halv upplösning) och `jamfor-1440-helsida.webp`: gamla och nya sidan i sin helhet
- **Gamla sidan:** `gammal-thcb-{393,1440}-full.webp`, hämtad 16 november (393 i halv upplösning)

## Avvikelser mot skissen

- **Header:** Theme 8:s riktiga glasheader och brödsmula, inte skissens påhittade navigation.
- **Ingress:** står under taglinen, eftersom underlaget kräver den. Skissen har ingen.
- **Status:** "Rättsläget granskas · Senast kontrollerad 16 nov 2026" i stället för skissens "Källor granskas · Senast uppdaterad 23 jan 2025".
- **Index:** fyra kapitel i stället för tre. "THCB hos Hazey" är tillagt, eftersom historiken krävs.
- **Relaterat:** skissens två artiklar finns inte. De ersätts av THCA-sidan och FHM-artikeln. De gamla THCB-artiklarna lyfts inte fram, se `KARTLAGGNING.md` avsnitt 5.
- **Fotot:** samma motiv som skissen, men bara 619 px brett. Det är mjukt på stora skärmar och bör ersättas av ett riktigt foto före publicering.

## Öppna beslut

Se `KARTLAGGNING.md` avsnitt 7:
- title och meta
- slug och 301 för `/thcb`
- länken till THCB-kategorin (produkttexten anger även THCHO)
- de två gamla THCB-artiklarna
- fotot
- länkar till och från rättslägeshubben

Före publicering krävs också en separat faktagranskning av kapitel 01–02.
