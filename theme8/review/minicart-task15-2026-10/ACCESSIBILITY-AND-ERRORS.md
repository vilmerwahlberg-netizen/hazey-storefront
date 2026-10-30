# TASK 15 — Minicart: tillgänglighet, fel och sanning

Underlag: `STATE-MATRIX.md`, `runs/keyboard.json`. "Måste" gäller
implementationen; "Beslut" kräver Vilmer.

## A. Sanning i siffror och löften (högst prioritet)

| # | Fynd | Bevis | Regel |
|---|---|---|---|
| A1 | **Frakt motsäger kassan.** Previewn visar "Frakt: Fri frakt" över 499 kr och "79 kr tillkommer" under. Nyehandels kassa tar idag **49 kr vid alla belopp**, utan fri frakt-gräns (ADMIN-TODO 1–3). | `before/393-simple-top.png`, `before/*-variant-top.png`, ADMIN-TODO.md | Måste: minicarten visar "Frakt: Beräknas i kassan" tills `backendVerified` är sant. Ingen mätare, ingen "Fri frakt"-text, inget "ger fri frakt" i uppgraderingstipset. **Beslut 1** |
| A2 | **Bonusen lovas utan känd mekanism.** "150 kr bonus uppnått/kvar" och "ger 150 kr bonus". Ingen motsvarighet finns i Nyehandel (ADMIN-TODO 4). | `before/393-multi-top.png` | Måste: ingen bonustext i minicarten innan mekanismen finns. **Beslut 2** |
| A3 | **"Trygg betalning"** saknar belägg i COMMERCE-RULES; "Diskret paket" och "Skickas från Sverige" finns i `HZ8.commerce.deliveryLines`. | `84-cart.js` `syncTrust` | Måste: bara verifierade rader ("Skickas från Sverige · Diskret förpackning"). **Beslut 3** om "Trygg betalning" ska vara kvar |
| A4 | **Inaktuell uppgraderingstext.** Efter + eller − visar raden beloppet för föregående antal. Rotorsak: `syncUpgrades` räknar på Vuex-radens `formatted_total` medan Nyehandel redan satt det optimistiska antalet, och `data-sig` (`id:antal:nivå:mål`) blir sedan identisk när rätt summa kommer, så texten skrivs aldrig om. | `runs/keyboard.json` rerender 1 och 3 | Måste: signaturen innehåller `formatted_total`, och tipset döljs medan raden väntar på svar |
| A5 | **Osynkat läge vid fel.** Vid 422/500/nätfel visar fältet det nya antalet och Vuex-raden har `quantity: 2` (tal), men summan är kvar. Ingen återställning, inget meddelande. Vid nätfel kastar Nyehandels egen kod `TypeError`. | #10–12 | Måste: Theme 8 upptäcker en misslyckad PUT/DELETE (lyssna på `fetch`-svar för `/frontend-api/cart/item/*`, eller jämför optimistiskt antal mot `totals` efter timeout), kör `cart/reload` för att återställa Nyehandels sanning och visar ett radmeddelande. Theme 8 skriver aldrig ett eget antal |
| A6 | **Lagergräns utan förklaring.** 406 → Nyehandel återställer tyst. | #9 | Måste: efter en 406 på raden visas "Du har valt allt som finns i lager just nu." (inget lagersaldo som siffra, enligt Theme 8:s praxis). + får `aria-disabled` tills antalet sänks |
| A7 | **Kassaetikett under laddning** visar gammal total ("Till kassan · 745 kr" medan antal är 2). | #13 | Måste: under väntande skrivning visar knappen "Uppdaterar…" med `aria-disabled="true"`, och klick blockeras tills Vuex `totals` uppdaterats. Nyehandels knapp behålls |
| A8 | Rått `&amp;` i produktnamn. | #20 | Måste: avkoda bara för visning (textnod i Theme 8), länktexten behålls. Datafel anmäls i ADMIN-TODO |

## B. Tangentbord och fokus

| Krav | Idag | Måste |
|---|---|---|
| Öppna med Enter/Space på "Öppna varukorgen" | OK | Behåll |
| Fokus vid öppning | "Stäng varukorgen" | Behåll |
| Fokusfälla, Tab/Shift+Tab | OK (`HZ8.trapFocus`) | Behåll; uppdatera fokuslistan efter rerender (görs redan per tangenttryck) |
| Escape stänger | OK | Behåll |
| Fokusretur | Till utlösaren | Behåll; reserv `#cart-button` |
| Fokus efter "Ta bort" | Ej mätt (raden försvinner) | Måste: fokus till nästa rads produktlänk, annars föregående, annars rubriken/tomläget. Aldrig `body` |
| Fokus efter fel | – | Felmeddelandet är `role="alert"`; fokus stannar på knappen som användes |
| Antalsfält | `tabindex=-1` (nativt) | Försök `tabindex=0` om Vue inte återställer det; annars dokumentera |
| Synlig fokusring | Theme 8 global `--hz8-focus` | Kontrollera på olive och orange yta (≥ 3:1) |
| Kassaknappens position i tabbordning | Stopp 18 med 2 rader (efter korsförsäljning och "Dela varukorg") | Kassa före "Dela varukorg"; korsförsäljningen kan ligga före kassan om den ligger före i DOM, men får inte mer än 3 objekt |

## C. Skärmläsare

| Krav | Idag | Måste |
|---|---|---|
| Dialognamn | `aria-label="Din varukorg"`, synlig rubrik "Varukorg" | `aria-labelledby` till rubriken, så namnet följer den synliga texten |
| Antal i rubrik | "(5)" ensamt | Text: "5 varor" (singular "1 vara") |
| Live-region | "Varukorgen uppdaterad: 1 artiklar" | Korrekt numerus: "1 vara"/"2 varor". Fel och lagergräns via radens `role=alert`/`role=status`, inte dubblerat i den globala regionen |
| Kassaknapp | `aria-label="Till kassan · 745 kr"` | Behåll, men total måste vara aktuell (A7) |
| Rea | Två `del` (styck + rad) utan text | Endast radens jämförpris visas; visuellt dold text "Ordinarie pris" före `del` |
| − / + | "Minska antalet"/"Öka antalet" | Utöka gärna med produktnamn via `aria-describedby` till namnet |
| Ta bort | "Ta bort varan" | Synlig text "Ta bort"; tillgängligt namn med produktnamn |

## D. Pekare, storlek och zoom

| Krav | Idag | Måste |
|---|---|---|
| Träffytor | − / + 40 × 45, papperskorg 42 × 45 | ≥ 44 × 44 |
| 200 % zoom | Drawer på x −15, summering 75 % av höjden | Drawern ryms i synlig bredd; summering ≤ 34 % av höjden. Under 500 px höjd: summering kompakt (en rad total + knapp), övriga rader i scrollytan |
| 320 px | Summering 51 % | ≤ 34 % |
| Lång titel | 7 rader | ≤ 3 rader mobil / 2 desktop |
| Kontrast | Muted text på sand ≈ OK; orange "Du sparar" på vit yta | Verifiera `--hz8-cta-fill`-text på `--hz8-surface` ≥ 4,5:1 eller använd olive för besparing |
| Reducerad rörelse | Mätarens transition avstängd | Ny-rad-markering och knappens laddningsindikator utan animation |

## E. Felmeddelanden (svensk copy, förslag)

| Situation | Text | Roll |
|---|---|---|
| Ändring misslyckades (nät/500) | "Antalet kunde inte ändras. Varukorgen visar det som är sparat." + knapp "Försök igen" | `role="alert"` |
| Lagergräns (406/422 lager) | "Du har valt allt som finns i lager just nu." | `role="status"` |
| Ta bort misslyckades | "Varan kunde inte tas bort. Försök igen." | `role="alert"` |
| Uppgradering misslyckades | "Det gick inte att byta till 3 st. Du har fortfarande 1 st." | `role="alert"` |
| Korgen kunde inte laddas (`cart/reload` fel) | "Varukorgen kunde inte uppdateras. Ladda om sidan." | `role="alert"` |

Inga meddelanden lovar leveranstid, fri frakt, bonus eller lager i siffror.
