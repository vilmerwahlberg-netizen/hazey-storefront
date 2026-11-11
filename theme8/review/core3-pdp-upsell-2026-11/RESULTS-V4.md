# Task 20 v4: 1/3/5-paketval för Core, MS 2 ml och MS 5 ml

Körd 2026-11-11 i Theme 8-previewn (`?preview=v9kzdmqz4w60l5n`) med lokal build.
- Varje scenario körs i en egen session med en egen korg, och korgen töms efteråt.
- Ingen order och ingen betalning. Ingen adminändring.
- Skript: `evidence/ui-familjer.mjs`.
- Rådata: `evidence/runs/v4-*.json` och `v4-log-*.txt`. Loggfilerna `-b`, `-c` och `-d` är omkörningar efter två testfel, se nedan.
- Bilder: `evidence/shots/v4-*.jpg`.

## Paketen, lästa och kontrollerade live

Källor: `evidence/probe-packages.json`, `probe-pivots.json`.

| Paket | Produkt / variant | SKU | Pris | Bas | Rader ur paketsidans HTML |
|---|---|---|---|---|---|
| Core 3‑pack | 263 / 467 | HZ-T19-CORE-3PK | 1 920 kr | 255 | 3 × olåst, antal 1, pivot 1–3 |
| Core 5‑pack | 265 / 469 | HZ-MIX-CORE-5PK | 3 135 kr | 255 | 5 × olåst, pivot 7–11 |
| MS 2 ml 3‑pack | 266 / 470 | HZ-MIX-MS2ML-3PK | 1 599 kr | 261 | 3 × olåst, pivot 12–14 |
| MS 2 ml 5‑pack | 267 / 471 | HZ-MIX-MS2ML-5PK | 2 530 kr | 261 | 5 × olåst, pivot 15–19 |
| MS 5 ml 3‑pack | 268 / 472 | HZ-MIX-MS5ML-3PK | 2 950 kr | 260 | 3 × olåst, pivot 20–22 |
| MS 5 ml 5‑pack | 269 / 473 | HZ-MIX-MS5ML-5PK | 4 450 kr | 260 | 5 × olåst, pivot 23–27 |

Alla har `is_package=true` och `parts_buyable=true`, och paketvarianten spårar inget eget lager. Varje rad pekar på sin basprodukt. Basvarianterna och lagret läses live: Core har 6 strains i lager, MS 5 ml 5 (Yoda Ice Cream 4 st) och MS 2 ml 2 av 9 (Gorilla Cookies 39 st, Tinky Winky 3 st). `pivot_id` läses alltid live ur paketsidan när sidan laddas.

## Scenarier

| Scenario | 393 | 768 | 1440 | 1920 |
|---|---|---|---|---|
| Core 3‑pack, blandat: korg, minicart, kassa (1 920 kr) | PASS | – | PASS | – |
| Core 5‑pack, blandat och upprepat (Gelato × 2 + 3 olika): korg, minicart, kassa (3 135 kr) | PASS | PASS | PASS | PASS |
| MS 2 ml 3‑pack, Gorilla × 2 + Tinky: korg, minicart, kassa (1 599 kr) | PASS | PASS | PASS | – |
| MS 2 ml 5‑pack, gränsfall Tinky × 3 (= lagret) + Gorilla × 2: köps (2 530 kr) | PASS | – | PASS | PASS |
| MS 2 ml 5‑pack, Tinky × 5 (lager 3): spärras (se nedan) | PASS | PASS | PASS | PASS |
| MS 2 ml 3‑pack, Tinky × 3 när 1 redan ligger i korgen: spärras (se nedan) | PASS | – | PASS | – |
| Lagret ändras före köp (Tinky 3 → 1, valt × 2): ingen POST, fel visas | PASS | PASS | PASS | – |
| Slutsåld före köp (Tinky 3 → 0): ingen POST, "Tinky Winky är slut i lager." | PASS | – | PASS | PASS |
| Slutsålda strains (Crazy Dog m.fl.) visas "(slut i lager)" och kan inte väljas | PASS | – | PASS | – |
| MS 5 ml 5‑pack, gränsfall Yoda × 4 (= lagret) + Sparta: köps (4 450 kr) | PASS | – | PASS | – |
| MS 5 ml 3‑pack, blandat: korg, minicart, kassa (2 950 kr) | PASS | – | PASS | – |
| Tom plats 5: ingen POST, "Välj strain för plats 5." | PASS | PASS | PASS | – |
| Växling 3 → 5 → 3 → 1 st → 5 (se nedan) | PASS | PASS | PASS | PASS |
| Vanligt köp 1 st efter paketval (MS 2 ml) | PASS | PASS | PASS | PASS |
| Minicart "Ändra" på MS 2 ml 5‑pack (se nedan) | PASS | – | PASS | – |
| Utan flagga: inget paketval, inga paketanrop, registret `{}` | PASS | – | PASS | – |

Detaljer för de längre scenarierna:
- **Tinky × 5 (lager 3):**
  - plats 4–5 markeras;
  - felet lyder "Tinky Winky: bara 3 kvar i lager – du har valt 5.";
  - knappen visar "Ändra valen – lagret räcker inte";
  - ingen POST görs.
- **Tinky × 3 med 1 i korgen:**
  - alternativet visas som "(inga fler – 1 i varukorgen)";
  - när plats 3 tvingas spärras köpet med "… 1 ligger redan i din varukorg …";
  - korgen har fortfarande bara den ursprungliga raden.
- **Växling:** plats 1–3 behålls (Kowa, Chupacabra, Bruce). Plats 4–5 är tomma och spärrar köpet. Vid 1 st visas strainvalet igen.
- **Minicart "Ändra":** plats 1–3 sätts till Tinky, och Tinky är spärrad på plats 4. Sparandet ger 3 × Tinky + 2 × Gorilla för 2 530 kr, och den gamla raden tas bort.

**45/45 PASS på slutbygget.** I varje körning: exakt en synlig köpknapp, inga konsolfel och inget horisontellt överflöd.

Två testfel rättades och kördes om:
- Ett alternativ som spärrats av korgen kunde inte väljas av testet. Det var spärren som fungerade.
- "Ändra"-anropet räknades som en andra PDP-POST.

Ingen produktkod ändrades efter matrisen.

## Synlighet (läsande kontroll, skarpa sajten utan preview)
- **Kategorier:** inget av paketen finns i den serverrenderade HTML:en för alla-vapes, magic-sauce, m-s-vapes, core, alla-produkter eller alla-vapes?filters=Serie_Core.
- **Direktlänkar:** paketsidorna (`/sv/products/…-blandbart`, `pilot-t19-…`) svarar 200 med `noindex, nofollow`. Där körs Nyehandels egen paketköpare, utan Theme 8:s lagerspärr.
- **Theme 8:** paketvalet visas bara med `?hz8-pkg-pilot=1`. Ingen publik PDP får det.

## Kvar
- **Lagerfrågan:** se `LAGERSPARR.md`. Klientspärren ersätter inte servervalidering, och Nyehandels egen paketsida är fortfarande öppen på direktlänk.
- **Lagerdrag vid genomförd order** är inte bevisat.
- **Namn och bild:**
  - 263 heter fortfarande "PILOT T19 – …".
  - Paketen saknar egen bild i minicart och kassa.
  - "(blandbart)" står i namnen som syns i korg och kassa.
- **Ingen spärr mot korgen för 1 st:** singelköpets antalsväljare tar inte hänsyn till det som redan ligger i varukorgen. Det är befintligt beteende och inte ändrat här.
