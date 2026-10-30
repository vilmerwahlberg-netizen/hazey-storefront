# TASK 15 — Minicart: tillståndsmatris

Uppmätt 2026-10-30, `origin/dev` 648a551, Theme 8-preview med lokal build.
Varje fall = ny webbläsarkontext = ny sessionsvarukorg, fylld via
Nyehandels `POST /frontend-api/cart/item`. Ingen order lades. Rådata:
`runs/capture-393_1440.json`, `runs/capture-320_430_1920_z200-*.json`,
`runs/keyboard.json`. Bilder: `before/{bredd}-{fall}-top|bottom|during.png`.

Bredder: **393 och 1440 alla fall**; 320, 430, 1920 och 200 % zoom
(720 × 450 CSS-px, DPR 2) för tom, variant, flera, lång titel, mängdpris och
lagergräns.

Fel och laddning simuleras genom att avlyssna korgens skrivanrop i
testwebbläsaren (`lib.mjs` `failMode`) – inget når Nyehandel. Lagergränsen
är **äkta**: Tequila Sunrise har 7 i lager, + ger Nyehandels egen 406.

| # | Tillstånd | Riktig data | Vad kunden ser idag | Vuex / nätverk | Bedömning |
|---|---|---|---|---|---|
| 1 | Tom | – | "Varukorg", "Din varukorg är tom", 5 kategorilänkar (Theme 8, ur `HZ8.navCategories`), "Börja handla" | – | OK. Innehållet ligger lågt med mycket tom yta ovanför |
| 2 | En enkel produkt | Blommor CBD 30 % Tequila Sunrise 3,5 g, 435 kr | Rad + uppgradering "…3 st för 674,25 kr till · du sparar 195,75 kr till · ger fri frakt"; mål "64 kr kvar till fri frakt"; Frakt "79 kr tillkommer" | POST 200 | **Fraktuppgiften stämmer inte med kassan (49 kr)**, se A&E |
| 3 | Variant/strain | Faraoh 2 ml, strain Forbidden Fruit, 745 kr | "Strain: Forbidden Fruit"; mål "Fri frakt ✓ 1 955 kr kvar till 150 kr bonus"; korsförsäljning 3 st | POST 200 | Variant tydlig. Alternativnamnet kommer gement ur data (`strain`, `doft`), CSS gör versal |
| 4 | Flera produkter | Faraoh ×1, Cart MS Samurai Jack ×2, Buds Samurai Jack ×1, Hash Charas ×1 → 5 artiklar, 2 395 kr | 4 uppgraderingsrutor, "Du sparar 70 kr", korsförsäljning; 393: bara 1,7 rad synlig ovanför en 337 px hög summering | 4 × POST 200 | Brus: ett tips per rad. Summeringen äter halva skärmen |
| 5 | Antal + | Faraoh 1 → 2 | Antal 2, summa 1 490 kr, **uppgraderingstexten står kvar på "1 154,75 kr till" (rätt: 409,75)** | PUT 200 | Defekt i `syncUpgrades` (signatur saknar radsumma) |
| 6 | Antal − | Faraoh 2 → 1 | Summa 745 kr, **texten står kvar på "409,75 kr till" (rätt: 1 154,75)** | PUT 200 | Samma defekt |
| 7 | Ta bort (en av två) | Faraoh + Cart Samurai Jack | Raden försvinner direkt, summa 365 kr, mål tillbaka till "134 kr kvar till fri frakt" | DELETE 200 | Ingen ångra. Live-region "Varukorgen uppdaterad: 1 artiklar" |
| 8 | Ta bort sista | Tequila Sunrise | Tomläge direkt | DELETE 200 | OK; live "Varukorgen är tom" |
| 9 | Slutsåld/lagergräns (äkta) | Tequila Sunrise 7 st (allt i lager), + | Inget händer synligt; antal står 7 | PUT **406** → Nyehandel gör själv ny PUT 200 (återställer) | Sanningen hålls, men **ingen förklaring** |
| 10 | Inaktuell lagerstatus (simulerad 422) | Faraoh 1, + | Antal visar **2**, summa 745 kr, inget meddelande | PUT 422, Vuex `quantity: 2` (tal), totals oförändrade | **Osynkat läge** – antal och summa motsäger varandra |
| 11 | Nätfel (simulerat) | Faraoh 1, + | Samma som 10 | PUT `net::ERR_FAILED`; **Nyehandels egen JS kastar `TypeError: Cannot read properties of undefined (reading 'status')`** | Nativ bugg; osynkat läge |
| 12 | API-fel 500 (simulerat) | Faraoh 1, + | Samma som 10 | PUT 500 | Osynkat läge |
| 13 | Laddning (6 s fördröjning, simulerad) | Faraoh 1, + | Under väntan: antal 2, summa 745 kr, kassaknapp "Till kassan · 745 kr" klickbar, ingen indikator. Efter: 1 490 kr | PUT 200 efter 6 s | Ingen upptagen-markering; kunden kan gå till kassan med fel belopp i etiketten |
| 14 | Rabatt – rea | Core THCX Coconut Cake 495 (jmf 695), Hash Charas 425 (jmf 495) | Överstruket både per styck och per rad; "Du sparar 270 kr" under "Dela varukorg" | `has_compare: true` | Riktig besparing. Dubbel överstrykning och fel placering |
| 15 | Rabatt – mängdpris | Faraoh ×3 → 633,25 kr/st, rad 1 899,75 (jmf 2 235) | "Du sparar 335,25 kr", uppgradering till 5 st | Nyehandel sätter `has_compare` för trappan | Fungerar – Nyehandel äger trappan |
| 16 | Rabattkod | – | Inget kodfält i drawern; `cart_coupon` null | – | Kod hör till kassan. Ingen kod finns att testa (COMMERCE-RULES) |
| 17 | Totalsumma/moms | alla | "Totalt X", "Varav moms: Y" | `formatted_total`, `formatted_total_vat` | Korrekt. "Varav moms:" har kolon + högerjusterat belopp på egen rad |
| 18 | Mängd-/uppgraderingsmeddelanden | alla med trappa | "Uppgradera till 3 st för X kr till · du sparar Y kr till · ger 150 kr bonus" | `product/state` | Grammatiskt trasigt ("kr till … kr till"), lovar bonus/fri frakt på overifierad regel |
| 19 | Fraktinformation | alla | Mål-mätare + "Frakt: Fri frakt / 79 kr tillkommer" | `HZ8.commerce` (preview-gated) | **Motsäger kassan** (49 kr, ingen fri frakt-gräns) |
| 20 | Lång titel | Vape Dual CBD 56 % "Blueberry Banana &amp; Tequila Sunrise" 1+1 ml | 320: namnet bryts på **7 rader**, rått `&amp;` syns; raden blir 358 px hög | Data innehåller `&amp;` | Klipp till 3 rader, avkoda entiteten |
| 21 | Tangentbord | 2 rader | Enter öppnar, fokus → Stäng; Tab cyklar inom drawern; Shift+Tab bakåt; kassaknapp = tabbstopp 18 | – | Fungerar. Antalsfältet har `tabindex=-1` (nativt) |
| 22 | Escape + fokusretur | – | Stänger, fokus tillbaka på "Öppna varukorgen" | – | OK |
| 23 | Scroll-lock | – | `html{overflow:hidden}`, scrollY 600 → 600 efter hjul, oförändrad efter stängning | – | OK |
| 24 | Vue-rerender | +, +, −, 3 × stäng/öppna | Exakt 1 av varje Theme 8-element; inga dubbletter | – | OK (men text kan vara inaktuell, se 5–6) |
| 25 | Riktig köpväg PDP | Faraoh → "Lägg i varukorgen" | Drawer öppnas, fokus → Stäng, PDP visar "Platinum OG har lagts i varukorgen."; upselling-panelen öppnas inte | – | Nya raden markeras inte |
| 26 | 200 % zoom | flera | Drawern på `x:-15` (vänsterkanten klipps), summering 337 av 450 px, **en knappt synlig rad** | – | Blockerande för zoomanvändare |
| 27 | 320 px | flera | Summering 356 av 700 px; första raden 302 px | – | För tätt |
| 28 | 1920 px | flera | Drawer 460 px, summering 347 px | – | OK, men samma proportioner som 1440 |

## Ej testat (och varför)

- **− vid antal 1**: inte exekverat; "Ta bort" testades separat. Implementationen ska mäta det.
- **Riktig rabattkod**: ingen kod finns i Nyehandel.
- **Produkt som blir slutsåld medan den ligger i korgen**: kan inte framkallas utan att ändra lager i admin. Närmaste äkta fall är 406 i #9; 422 i #10 är simulerat.
- **Upselling-panelen** (`isUpsellingOpen`, `accessories`): öppnades aldrig i någon köpväg, troligen inaktiverad i admin.
- **Skärmläsare** (VoiceOver/NVDA): bara Chromiums tillgänglighetsträd och fokus är mätta, ingen riktig uppläsning.
