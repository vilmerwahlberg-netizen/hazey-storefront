# TASK 15 — Minicart: interaktionskontrakt

> **V4-TILLÄGG 2026-10-30:** Grundkraven här för native ägande, fokus,
> rerender, fel, laddning och scroll-lås gäller fortfarande. Visuell struktur,
> målmätare, paketväljare, strainredigerare, tillägg, rabattkod och summering
> styrs däremot av `concepts-codex/README.md`, de två godkända v4-bilderna och
> `IMPLEMENTATION-PROMPT.md`. De källorna vinner vid konflikt med äldre text
> nedan.

Det här är kontraktet implementationen ska uppfylla, oavsett vald visuell
riktning. "Idag" = uppmätt 2026-10-30 på `origin/dev` 648a551
(`runs/keyboard.json`, `runs/capture-*.json`). Ägarskap: se
`NATIVE-OWNERSHIP.md`.

## 1. Öppna

| Utlösare | Idag | Kontrakt |
|---|---|---|
| Headerns `#cart-button` "Öppna varukorgen" (desktop och mobil) | Öppnar, fokus → "Stäng varukorgen" | Oförändrat. Fokus till stängknappen (eller rubriken med `tabindex=-1`), aldrig till första produktlänken |
| PDP-köp (`.hz8-pp__cta`, sticky köpzon, paket) | Nyehandel öppnar drawern; PDP-meddelande "Platinum OG har lagts i varukorgen."; upselling-panelen öppnas **inte** | Oförändrat. Den nyss tillagda raden får en kort markering (≤ 1,2 s, ingen vid reduced motion) och är synlig utan scroll |
| Kortens köpknapp, korsförsäljning i drawern | `cart/addVariant` / POST + `cart/reload` | Oförändrat. Drawern hoppar inte; ny rad markeras |
| Mobilmeny/sök öppen | `05a-mobile-nav.js` stänger dem när drawern öppnas | Oförändrat |

## 2. Inne i drawern

**Fokusordning (mål):** Stäng → (per rad: produktlänk → − → antal → + → Ta
bort → [uppgraderingsknapp om visad]) → korsförsäljning → Till kassan →
Fortsätt handla → Dela varukorg.

Idag ligger korsförsäljningen och "Dela varukorg" **före** "Till kassan"
(kassaknappen är tabbstopp 18 med två rader). Kontraktet flyttar kassan
före "Dela varukorg" i DOM-ordning endast om det kan göras utan att flytta
Nyehandels noder; annars accepteras dagens ordning och dokumenteras.

| Kontroll | Idag | Kontrakt |
|---|---|---|
| − / + | Nyehandels knappar, 40 × 45 px, tecknet är bindestreck "-" | ≥ 44 × 44 px träffyta, visuellt "−"/"+" (ikon eller `::before`), `aria-label` behålls. **Ingen egen PUT** |
| Antalsfält | `input[name=quantity]` med `tabindex=-1` (ej nåbart med tangentbord, nativt) | Restylas. Om Nyehandel godtar `tabindex` ändrat utan rerender-reset: gör fältet nåbart, annars dokumentera som nativ begränsning |
| − vid antal 1 | Nyehandel tar bort raden eller blockerar (se STATE-MATRIX) | Följ Nyehandel. Ingen bekräftelsedialog |
| Ta bort | Papperskorgsikon, `aria-label="Ta bort varan"` | Synlig text "Ta bort" (eller ikon + text på desktop), samma knapp, samma DELETE |
| Uppgraderingsknapp (Theme 8) | Egen PUT + `cart/reload`, text kan vara inaktuell | Max ett tips per korg. Signatur måste inkludera radens `formatted_total` och antal så text aldrig visar ett gammalt belopp. Knappen disablas medan Vuex-raden har ett ospart antal (optimistiskt läge) |
| Korsförsäljning "Lägg till" | POST via `HZ8.addVariant` | Oförändrad logik. Placeras efter raderna, före sammanfattning i scrollytan. Får aldrig trycka ned kassaknappen utanför första viewport (se 4) |
| Till kassan | Nyehandels knapp; Theme 8 etikett "Till kassan · {total}" via `::after` | Behåll Nyehandels knapp. Total i etiketten ska alltid vara Vuex `formatted_total`, aldrig ett eget belopp |
| Fortsätt handla | Stänger | Oförändrat |
| Dela varukorg | Native | Behålls, nedtonad sekundär länk under kassaknappen |

## 3. Stänga

| Väg | Idag | Kontrakt |
|---|---|---|
| Escape | Stänger (`HZ8.trapFocus`) | Oförändrat |
| Stängknapp, "Fortsätt handla", overlay-klick | Stänger | Oförändrat |
| Fokus efter stängning | Tillbaka till utlösaren (`lastTrigger`) | Oförändrat; om utlösaren försvunnit → `#cart-button` |
| Scroll-lås | `html:has(#cart-side-wrap.is-active){overflow:hidden}`; sidan rör sig inte vid hjul | Oförändrat |
| Stängd drawer | `visibility:hidden`, ej fokuserbar | Oförändrat |

## 4. Layoutkontrakt (alla bredder)

- Sammanfattning + kassaknapp sticky längst ned, **max 34 % av viewporthöjden
  på mobil** och max 300 px på desktop. Idag: 333–356 px av 700 vid 320
  (≈ 50 %), 337 av 450 vid 200 % zoom (75 %).
- Minst en hel produktrad (bild, namn, antal) synlig ovanför sammanfattningen
  vid 320 × 640, 393 × 852 och 200 % zoom (720 × 450 CSS-px).
- Drawern får aldrig hamna utanför vänsterkanten: under 768 px används
  `width:100%` av den synliga ytan (inte `100vw` + `scrollbar-gutter`).
  Idag `x:-15` vid 200 % zoom.
- Ingen horisontell scroll (idag: ingen).
- Långa produktnamn: max 3 rader på mobil, 2 på desktop, full titel i
  länkens tillgängliga namn. Plattformens råa `&amp;` avkodas för visning
  (textContent-korrigering i Theme 8, inte i produktdata).
- Rader: inga kort-i-kort. Uppgraderingstips en rad text + en knapp.

## 5. Vue-rerender

- Varje injicerat element har markörklass och skapas bara om det saknas
  (idag verifierat: 1 av varje efter +, +, −, 3 × stäng/öppna, på 393 och 1440).
- Synk sker på `HZ8.watch` och `store.subscribe(/^cart\//)`; innehållssignatur
  inkluderar alla visade värden.
- Inga Theme 8-element i `.item-amount` (Nyehandels kontrollrad).

## 6. Rörelse

- Drawern: Nyehandels `right .2s`. Inga nya glid-/fjädereffekter.
- Ny rad: bakgrundston tonar ut på 1,2 s. Summaändring: siffran byts utan
  animation (räkneanimationer kan visa mellanbelopp som aldrig gällde).
- `prefers-reduced-motion`: inga övergångar utöver drawerns egen.
