# Adminärenden före lansering av Theme 8

Sådant som inte kan lösas i repot. Inget här är gjort. Facit för regler:
`COMMERCE-RULES.md`. Kontrollerat 2026-09-29 i Theme 8-preview
(`?preview=v9kzdmqz4w60l5n`) med testkorg, inget köp.

**Lanseringsspärr:** `backendVerified: false` i `theme8/js/02a-commerce.js`.
Frakt- och bonusmålen syns bara i previewn. Ändra till `true` först när
punkt 1–3 är verifierade i kassan.

## 1–3. Frakt: 79 kr under 499 kr, fri från exakt 499 kr, endast Sverige

**Nuläge (kassans egna data, `checkout.calculations.shipping_methods`):**
ett enda fraktsätt, id 1 "Fraktkostnad", pris 39,20 kr exkl. moms
(**49 kr** inkl.), `free_freight_active: 0`, `free_freight_over: 0`,
`country_limited: false`. Därför blir frakten 49 kr vid alla belopp.

**Var:** Nyehandel-admin → Inställningar → Frakt/Fraktsätt → "Fraktkostnad"
(sannolik plats; fälten ovan är fraktsättets egna).

| Fält | Nu | Ska vara |
|---|---|---|
| Namn | Fraktkostnad | Garanterad Leverans |
| Pris | 39,20 kr exkl. moms (49 kr) | 63,20 kr exkl. moms (**79 kr** inkl. 25 % moms) |
| Fri frakt aktiv | av | på |
| Fri frakt över | 0 | **499** (kontrollera om fältet räknas inkl. moms och efter rabatt) |
| Länder | alla | endast Sverige |

**Verifiera** (testkorg, gå till kassan, betala inte). Läs `Frakt` i
ordersammanfattningen eller `checkout.calculations.shipping` i konsolen:

| Korg | Förväntat |
|---|---|
| 1 × Cart THC-A 45 % Faraoh 1 ml (495 kr) | 79 kr |
| 1 × en produkt för exakt 499 kr | 0 kr |
| 2 × samma cart (990 kr) | 0 kr |
| 538 kr med 10 % kod → 484 kr | 79 kr (Woo räknar efter rabatt) |
| Leveransland annat än Sverige | inte valbart |

Om Nyehandel räknar gränsen före rabatt eller exkl. moms går det inte
att matcha WooCommerce exakt. Då behöver det beslutas vilken regel som
gäller, och `COMMERCE-RULES.md` samt `02a-commerce.js` ska följa beslutet.

## 4. 150 kr bonus: hur delas den ut?

WooCommerce visar "150 kr bonus uppnått" från 2 700 kr, men drar inget
från ordern (ingen rabatt, avgift eller kupong i varukorg eller kassa).
Mekanismen syns inte utifrån.

**Var:** WP-admin → Hazeys minicart-plugin (`hazey_cart_summary`, tier
`type: bonus`) samt WooCommerce → Marknadsföring/Kuponger och eventuella
belönings- eller presentkortsplugin.

**Beslut behövs:** vad kunden får och när (presentkort, kod i mejl,
manuellt?). Innan dess säger Theme 8 bara "150 kr bonus uppnått", aldrig
hur eller när bonusen kommer. En motsvarighet i Nyehandel
(kampanj/presentkort) ska byggas där. Går det inte, stäng av bonusen i
Theme 8 (ta bort bonussteget i `02a-commerce.js`).

## 5. En enda leveranstid

Dagens motstridiga texter (Theme 8 visar ingen av dem):

| Sida/fält | Gammal text | Rekommenderad |
|---|---|---|
| Topbar-USP (admin, sannolikt tema → Header/USP) | "Skickas 1-2 vardagar" | den beslutade tiden, eller ta bort |
| Produkt-USP (`.product-usp`, admin) | "Skickas 1-2 vardagar" | samma |
| `/sv/page/faq` "Hur snabbt …" | "Vi skickar från Sverige inom 1–2 vardagar." | samma |
| Startsidans FAQ-block (admin) | "oftast inom 1–3 arbetsdagar" | samma |
| `/sv/page/kop-och-leveransvillkor` §3 (juridiskt) | "Normal leveranstid: 1–4 arbetsdagar." | Vilmer beslutar, juridisk text |
| hazey.se (Woo) FAQ/produkt/USP | 1–3 dagar | samma |

## 6. Ska fraktbolag nämnas?

Woo-FAQ säger DHL, men Woo-produktsidor och minicart säger PostNord.
Nyehandel nämner inget bolag. Beslut: ett bolag eller inget alls.
Theme 8 nämner inget. Villkoren nämner "ej spårbar frakt", men WooCommerce
har bara "Garanterad Leverans". Kontrollera att texten stämmer.

## 7. Backendmodell för blandade strainpaket

Se `MIXED-PACKS.md`. Kräver en dold paketprodukt per produkt och
paketstorlek i Nyehandel, verifierad för pris, lagerdragning per barn-
variant och orderrad. Därefter läggs mappningen in i `PACKAGE_PRODUCTS`
(`83-pdp-purchase.js`) och `HZ8.flags.mixedPacks` slås på.

## 8. Nyhetsbrev förvalt i kassan

Kassans ruta "Prenumerera på nyhetsbrev" är **ikryssad från start**
(kontrollerat 2026-09-29). Samtycke ska vara aktivt. **Var:**
Kassainställningar/Nyhetsbrev i Nyehandel-admin. **Verifiera:** öppna
kassan med en vara och kontrollera att rutan är tom.

## 9. Kassan kör inte Theme 8-JS

Se `CHECKOUT.md`. Kassan kan inte visa frakt- eller bonusstatus utan att
ett skript läggs i ett kassafält (om det finns). Kassan laddar
fortfarande den gamla `Oliverforss8/hazey-storefront@v1.0.3/hazey.min.js`
via Theme 8:s Head-fält. Ta bort den när Theme 8 aktiveras.

## 10. Informationssidor, formulär, 404 och juridik

Se `INFO-PAGES.md`: Om oss och Leverans och retur (sidor saknas, block
finns), Nyehandels kontakt- och nyhetsbrevskomponenter, den tomma sidan
`/sv/page/kopvillkor`, 404-mallen som inte laddar temat, FAQ-texter som
ska ändras och juridiska motsägelser i villkor och integritetspolicy.
