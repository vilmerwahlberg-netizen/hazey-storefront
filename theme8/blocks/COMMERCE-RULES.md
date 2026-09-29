# Handelsregler — WooCommerce live (facit för Nyehandel)

Uppmätt 2026-09-29 på www.hazey.se med anonyma gästkorgar (Store API
`/wp-json/wc/store/v1/cart` + Hazeys egen minicart-endpoint
`admin-ajax.php?action=hazey_cart_summary`). Ingen kassa slutförd, ingen
betalning, inga inställningar ändrade. WP-admin inte läst (ingen åtkomst i
den här miljön).

## Regler

| Regel | WooCommerce live | Källa |
|---|---|---|
| Fri frakt, gräns | **499 kr inkl. moms**, `>=` (499 kr = fri) | Store API-test H, minicart-tier `threshold:499` |
| Frakt under gränsen | **79 kr inkl. moms** (63 kr + 25 % moms), metod `flat_rate:22` "Garanterad Leverans" | Test A/B/D |
| Mäts före eller efter rabatt | **Efter rabattkod** — 538 kr − 10 % = 484 kr ger 79 kr frakt igen | Test D |
| Fraktmetoder | En enda: "Garanterad Leverans" | Store API `shipping_rates` |
| Område | Endast Sverige — norsk adress ger inga fraktalternativ | Test G |
| Undantag | Inga produkter hittade som bryter gränsen (ej verifierat i admin) | — |
| 150 kr bonus, gräns | **2 700 kr inkl. moms**, `>=` (2 699 = ej, 2 700 = uppnådd) | Minicart-tier `threshold:2700, amount:150`, test I/J |
| Bonus mäts | **Efter rabattkod** — 2 715 kr − 10 % = 2 444 kr → "256 kr kvar" | Test F |
| Bonus i ordersumman | **Dras inte av** i varukorg, kassa eller Store API-totaler vid 2 700/2 715 kr (ingen rabatt, avgift eller kupong) | Test E/J + `/varukorg/`, `/kassan/` |
| Bonus, typ | Okänt — delas uppenbarligen ut utanför ordern (efter köp?). **Kräver WP-admin/Vilmer** | — |
| Kombinerbarhet | Rabattkod + bonus går, men bonusgränsen räknas på beloppet efter rabatt | Test F |
| Kundtext, minicart | "X kr kvar till fri frakt / 150 kr bonus", etiketter "499 kr - fri frakt", "2 700 kr - 150 kr bonus", klart: "✓ Fri frakt + 150 kr bonus uppnått" | `renderProgress` i minicart-JS |
| Kundtext, sajt | "Fri frakt från 499 kr"; bonusen nämns inte publikt utanför minicarten | Sidfot, FAQ |

## Leveranstid och fraktbolag — motsägelser på live

| Ställe | Text |
|---|---|
| FAQ | "normalt 1–3 arbetsdagar", "spårbar frakt till ombud med DHL samt ett ej spårbart alternativ" |
| Produktsidor | "PostNord, levereras 1-3 dagar" |
| USP | "Snabb & garanterad leverans 1–3 dagar" |
| Köpvillkor | "Normal leveranstid: 1–4 arbetsdagar" |
| Minicart | "Swish • PostNord" |
| Nyehandel (Theme 8-preview) | "1–2 dagar" |

Vanligaste formuleringen: **1–3 arbetsdagar**. Fraktbolaget (DHL eller
PostNord) och om ett ej spårbart alternativ finns måste Vilmer bekräfta.

## Testfall

| Fall | Varor | Rabatt | Frakt | Att betala | Bonus |
|---|---|---|---|---|---|
| A | 489 kr | – | 79 | 568 | 2 211 kvar |
| B | 495 kr | – | 79 | 574 | – |
| H | 499 kr (exakt) | – | 0 | 499 | – |
| C | 590 kr | – | 0 | 590 | – |
| D | 538 kr | −54 (10 %) | 79 | 563 | – |
| I | 2 699 kr | – | 0 | 2 699 | 1 kvar |
| J | 2 700 kr (exakt) | – | 0 | 2 700 | uppnådd, inget avdrag |
| E | 2 715 kr | – | 0 | 2 715 | uppnådd, inget avdrag |
| F | 2 715 kr | −271 (10 %) | 0 | 2 444 | 256 kvar |
| G | 489 kr, Norge | – | inga alternativ | – | – |

Rådata: `theme8/review/store-build/commerce/` (lokalt, ej committat).
