# THCH: gamla /thch/ mot nya kunskapssidan

Datum: 16 november 2026. Gren `feat/theme8-thch-hhc-knowledge` (från `feat/theme8-thcb-knowledge` `1bb4e7e`). Ny sida: `theme8/blocks/thch.html`.

**Ingenting är publicerat.** Gamla WooCommerce-sidan, artiklarna, kategorierna och admin är orörda.

## 1. Vad som finns i dag

| Var | Status 16 nov 2026 |
|---|---|
| Gamla `https://www.hazey.se/thch/` | 200. Title: `THCH - Köp THC-H Sverige - THCH Vapes, Carts & Buds - FRI FRAKT`. Meta: "THCH är olagligt i Sverige. Köp THC i din favoritsouvenir form, vi har THCH Vapes, Cartridges, Buds och Gummies …" En H1 "THCH". |
| `/sv/page/thch`, `/thch`, `/sv/thch` (Nyehandel) | 301 till `/sv/categories/thch` |
| `/sv/categories/thch` | 200, H1 "THC-H", **tom** (inga produkter, ingen räknare) |
| `thch-vapes`, `thch-carts`, `thch-buds` | 404 |
| Butikens sökning på "thch" och "thc-h" | ingen THCH-produkt |
| Artiklar i Nyehandel | "Vad är THCH?" (`/sv/post/vad-ar-thch`, 2023-12-31) och "Är THCH lagligt?" (`/sv/post/ar-thch-lagligt`, 2023-12-29). Båda inleds med en not om att THCH är olagligt "från och med den 10/12", men brödtexten beskriver THCH som laglig cannabis med effekter. |
| Theme 8-header | Ingen THCH-länk ("Cannabinoider" leder till kategorier) |

## 2. Search Console (11 aug–11 nov 2026, gamla `/thch/`, SEO-BYGGUNDERLAG.md)

| Fråga | Klick / visningar | Besvaras i |
|---|---|---|
| `thch` | 60 / 557 | title, H1, ingress, kapitel 01, FAQ "Vad är THCH?" |
| `thch vape` | 25 / 287 | FAQ "Säljer Hazey THCH-vapes?" ("Nej …") och kapitel 03. Underlaget säger att sidan inte ska konkurrera om breda vape-sökningar, så Engångsvapes länkas bara som annan produkt. |
| `thc h` | 13 / 38 | ingressen ("även skrivet THC-H eller THC H"), "Skrivs också", FAQ "Är THC-H och THCH samma sak?" |

Underlaget: `thc vape sverige` gav 40 klick till gamla THCH men 1 230 till `/engangsvape/`. Den breda vape-avsikten flyttas därför **inte** hit.

## 3. Rad för rad

Markeringar som för THCB:

| Markering | Betyder |
|---|---|
| **behåll** | Sakinnehållet följer med. |
| **förbättra** | Sakinnehållet följer med, omskrivet eller rättat. |
| **faktakontroll** | Får inte användas förrän en källa är kontrollerad. |
| **avstå** | Följer inte med. |

| # | Gamla sidan | Ny sida | Markering |
|---|---|---|---|
| 1 | H1 `THCH` | H1 `THCH` med Ämnesguide och tagline | behåll |
| 2 | "Fri frakt från 499 kr · Skickas från Sverige · Alltid diskreta paket" (i heron) | — | avstå: fraktvillkor verifieras separat |
| 3 | H2 "Vad är THCH?" | H2 "Vad är THCH?" (kapitel 01) med ingress | behåll |
| 4 | "THCH är en cannabinoid, en kemisk förening som återfinns i cannabisväxten." | "en cannabinoid som är nära släkt med THC" | förbättra. "återfinns i cannabisväxten": faktakontroll, ingen källa kontrollerad, står inte på sidan. |
| 5 | "Vad som särskiljer THC-H från vanligt THC är dess unika kemiska struktur och dess påstådda potens." | Sidokedjan: hexyl (6 kol) mot pentyl (5), enligt de kemiska namnen i SFS 2024:985 | förbättra (strukturen). "Påstådd potens": avstå. |
| 6 | "Liksom THC, som är känt för att orsaka de psykoaktiva effekterna i marijuana, är THCH en förening som väcker intresse …" | — | avstå: effekt |
| 7 | Knapp "KÖP THCH" → kategorin | — | avstå: THCH är narkotika och kategorin är tom |
| 8 | Bildlänkar till artiklarna "Vad är THCH?" och "Är THCH lagligt?" | Inte framlyfta (se 5 i `GAMLA-PASTAENDEN.md`) | beslut B7 |
| 9 | "THCH Lagligt? … är inte specifikt nämnd i lagen … bör THCH inte klassas som en olaglig substans" | "Är THCH lagligt i Sverige? Nej …" med SFS 2024:985, datum och tidslinje | **rättas**: motsägs av SFS 2024:985 sedan 10 december 2024 |
| 10 | "… maximalt 0,2 % THC … Produkterna som säljs i vår butik är noggrant testade … 100 % lagliga" | — | avstå: felaktigt och generellt laglighetslöfte |
| 11 | "Andra Kategorier", artikelutdrag, "THCH i Sverige – Visar alla 79 resultat" (orelaterade produkter) | "I sortimentet nu" (3 länkar med saklig etikett) | förbättra |
| — | ny | Tidslinje (15 mars 2024 → 10 dec 2024 → kontroll), I korthet, 3 primärkällor, 6 FAQ, länkar till THCB, HHC och THCA | ny |

## 4. Källor (kontrollerade 16 november 2026)

| Källa | Belägger |
|---|---|
| SFS 2024:985 (PDF, svenskforfattningssamling.se) | Utfärdad 7 november 2024, i kraft 10 december 2024. Bilaga 1 för in delta-8-THCH och delta-9-THCH, med kemiska namn (3-hexyl-…). |
| Folkhälsomyndighetens yttrande dnr 01137-2024, 2024-03-15 | Klassificeringsutredning av delta-9-THCH inledd |
| Förordning (1992:1554), riksdagen.se, t.o.m. SFS 2026:1109 | Båda formerna står kvar |

## 5. Föreslagen sididentitet

| Fält | Förslag |
|---|---|
| Title | `THCH (THC-H) – vad det är och rättsläget i Sverige \| Hazey` |
| Meta | `Vad är THCH, eller THC-H? Fakta om tetrahydrocannabihexol och rättsläget: delta-8- och delta-9-THCH är narkotikaklassade sedan 10 december 2024 (SFS 2024:985).` |
| Slug | `thch`. I dag går `/sv/page/thch` med 301 till den tomma kategorin (beslut B5). |
