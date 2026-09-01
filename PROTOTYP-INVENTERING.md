# Prototyp-inventering (mobil, 390px) — uppmätt 2026-09-01

Källa: `/Users/wahlberg/HZY/chatgpt-claude-handover/CLAUDE-HANDOFF-2026-08-17/prototyp/index.html`,
renderad via lokal server (`http://localhost:8765/index.html`), mätt med
`getComputedStyle`/`getBoundingClientRect` i Chrome (inte läst ur källkod
blint — flera tidigare fel berodde på att källkodsläsning inte matchade
faktiskt renderat resultat, t.ex. `.qfind` som INTE finns i `#mVp` alls
trots att den finns i källkoden för `#dVp`).

## Sektionsordning, faktiskt renderad (mobil, `.page-home`-element sorterade efter `top`)

1. Header (`#mHeader`)
2. Sökrad (`.m-searchbar`)
3. Mikrotrust (`.mt-mobile`)
4. Hero (`#mVp .hero`)
5. Populära serier (`#m-populara-serier`)
6. Populära vägar (`#m-populara-vagar`, inkl. framställningssegment `.seg`)
7. (Aura-guiden — dold, `pre-reveal`/flaggad)
8. Bästsäljare i lager (`#featuredProductsSection`)
9. Så arbetar Hazey med innehåll och ursprung (trust-block/transparens)
10. Snabb koll: vad är vad? (kunskap, mörk)
11. Verifierade omdömen
12. Håll dig uppdaterad (nyhetsbrev)
13. (nedre trust-rad + footer, ej uppmätt i denna pass — se footer nedan)

**Viktigt uppmätt faktum:** `.qfind` ("Vad söker du?"-chipsraden) finns
ENDAST i `#dVp` (`document.querySelector("#dVp .qfind")` → sant,
`#mVp .qfind` → hittas inte alls). Föregående bygge visade den på BÅDA
brytpunkter, mitt emellan hero och Populära serier — det var fel på båda
sätt: fel plats OCH fel att den syns på mobil överhuvudtaget.

`continueSection` ("Fortsätt där du slutade") och dess `#dVp`-motsvarighet
är `display:none`/`pre-reveal` vid sidladdning (matchar `hidden`-attributet
i källan) — korrekt, ska förbli dold tills riktig besökardata finns.

## Header

| Egenskap | Värde |
|---|---|
| `#mHeader` height | 122px |
| `#mHeader` background | `rgb(251,241,225)` |
| `.m-row` height | 69px |
| `.m-row` padding | 12px |
| `.m-row` display | flex, `align-items:center`, `justify-content:space-between` |
| `.m-logo` font | Iowan Old Style/Palatino/Georgia serif, 23px, *italic*, 600, `rgb(44,54,32)` |
| `.m-logo` text | `hazey` (gemener, ingen ".se") |
| Hamburgare-ikon | 22×22px |
| `#mCartCount` (varukorgsbadge) | 15×15px cirkel, `background:rgb(201,106,38)`, `color:#fff`, `font-size:9px`, `border-radius:20px` |

## Sökfält

| Egenskap | Värde |
|---|---|
| `.m-searchbar` padding | `0 12px 11px` |
| Knapp-höjd | 41px |
| `border-radius` | 26px |
| `border` | `1px solid rgb(223,201,170)` |
| `background` | `rgba(255,252,246,.88)` |
| `font-size` | 14px |

## Mikrotrust (övre trust-rad)

| Egenskap | Värde |
|---|---|
| `.mt-mobile` background | `linear-gradient(100deg, #f3dfbd 0%, #f8ead2 48%, #f1ddbc 100%)` |
| `.mt-mobile-inner` display | `grid`, `grid-template-columns:172px 172px`, `gap:6px 14px`, `padding:9px 16px` |
| Total höjd | ~52px (KOMPAKT — inga kort/borders per punkt) |
| Innehåll (4 synliga av 5, 5:e döljs på denna bredd) | "★ 4,7/5 på Trustpilot" (länk) / "8 000+ kunder · sedan 2020" / "Normalt 1–2 vardagar" / "Diskret & spårbart" |
| Text-stil per punkt | ingen bakgrund/kant/padding — ren ikon+text, `font-size:9.7px`, `color:rgb(101,89,70)` (uppmätt tidigare pass, kvarstår) |

**OBS datafråga:** "8 000+ kunder · sedan 2020" i EN rad i facit. Vilmer har
tidigare bekräftat 2020 (bolagsregistrering) och att talet 8000+ syftar på
ORDRAR, inte kunder — vår version använder därför "8 000+ ordrar" (redan
beslutat i tidigare pass, avsiktlig avvikelse från exakt facit-text).

## Hero

| Egenskap | Värde |
|---|---|
| Bild | `assets/hero-westcoast-v4.jpg`, prototypens originalstorlek 1607×979 |
| `border-radius` | 22px |
| `margin` | `10px 10px 18px` |
| `min-height` | 238px |
| `box-shadow` | `0 17px 34px -24px rgba(92,57,24,.72)` (varmt brun ton, INTE grön) |
| Eyebrow, exakt text | "Brett sortiment · öppen information" (versaler via CSS text-transform, inte i källtexten) |
| H1, exakt text | "Hitta rätt utan att kunna allt." |
| Ingress, exakt text (MOBIL, skiljer sig från desktop) | "Sök direkt eller jämför på innehåll, format och framställning." |
| CTA 1 | `<a class="btn-solid">Utforska sortimentet</a>` |
| CTA 2 | `<button class="hero-link">Hjälp mig →</button>` |
| Kategorichips i hero | **Finns INTE på mobil** (`heroHasHeroCats:false`) — bara på desktop (`#dVp .hero-cats`) |

## Populära serier

Datadrivet i källan via `data-pser-row` (fylls av JS från mockdata i
prototypen). Facitens EXAKTA mock-innehåll (för lokal visuell referens):

| Serie | Bild | Antal (mock) |
|---|---|---|
| Magic Sauce | `assets/kat-magicsauce.jpg` | 17 produkter |
| Nano-11 | `assets/kat-nano11.jpg` | 11 produkter |
| THC-X | `assets/kat-thcx.jpg` | 7 produkter |
| THCbA | `assets/vape-blueberry.jpg` | 1 produkt |

Markup: `.pser-item > .pser-th (bakgrundsbild) + .pser-name + .pser-n`.

**Vår implementation:** namn/länkar från RIKTIG nyehandel-data (Magic
Sauce/Nano-11/Faraoh/Tatra Hemp/Magic Farmers/Hero — inte samma serier som
mockdatan, riktiga serier existerar inte 1:1 mot facitens fyra). Bilder:
prototypens originalassets används LOKALT för visuell paritet (se avsnitt
"Assets" i uppdraget) via en dedikerad lokal server, INTE i produktionskod.
Antal: räknas fram live genom att räkna riktiga `.product-card`-element på
resp. kategorisida — INTE mockdatans hårdkodade 17/11/7/1.

## Populära vägar

| Kort | Bild | H3 | Underrubrik |
|---|---|---|---|
| 1 | `assets/category-vapes-v3.jpg` | Vapes & carts | Engångsvapes & carts |
| 2 | `assets/category-buds-v3.jpg` | Blommor | Filtrerbar lista |
| 3 | `assets/category-hash-v3.jpg` | Hash | Piatella & mousse |
| 4 | `assets/category-cbd-v3.jpg` | CBD, CBG & CBN | Egen ingång |

| Egenskap | Värde |
|---|---|
| Grid | `176.5px 176.5px` (2 kol), `gap:9px` |
| Kort | `border-radius:16px`, `min-height:112px`, `padding:12px` |

## Framställningssegment

| Egenskap | Värde |
|---|---|
| Rubrik (`.seg-note`) | "Vill du hellre utgå från hur produkten är framställd?" |
| Grid | `177px 177px` (2 kol), `gap:8px` |
| Kort | `border-radius:12px`, `padding:8px 11px`, `background:rgba(255,249,238,.86)`, `border:1px solid rgb(227,205,176)` |
| Kort 1 | "Naturidentiskt" / "Finns i plantan" |
| Kort 2 | "Semisyntetiskt" / "Vidarebearbetad" |

## Bästsäljare i lager, trust-block, kunskap, omdömen, nyhetsbrev

Exakt copy och struktur redan dokumenterad i `STATUS.md` (läst direkt ur
källkoden, rad 4159–4328) — upprepas inte här. Nytt uppmätt i denna
omgång: **ordningen** (trust-block/"transparens" kommer EFTER Bästsäljare
i lager, inte före som i föregående bygge).

## Footer

Läst ur källkod (rad 4893–4967), se STATUS.md för fullständig struktur:
`.footer-trust` (4 punkter) → `.footer-main` (brand+nyhetsbrev + 4
länkkolumner: Handla/Hjälp & leverans/Hazey/Villkor) → `.footer-bottom`
(18+-text + copyright).
