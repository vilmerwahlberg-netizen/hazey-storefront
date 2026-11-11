# Task 20 v3: resultat (ett paketval, en köpmodul)

Körd 2026-11-11 i Theme 8-previewn (`?preview=v9kzdmqz4w60l5n`) med slutbygget lokalt via `catalog-reconciliation-2026-11/lib/harness.mjs`.
- Skript: `evidence/ui-paketval.mjs`.
- Mobil (393): Android-Chrome-UA, touch, DPR 2.
- Rådata: `evidence/runs/paketval-*.json` och `v3-log-*.txt`.
- Varje scenario körs i en egen session med en egen korg, och korgen töms efteråt. Ingen order och ingen betalning.

| # | Scenario | 393 | 768 | 1440 | 1920 |
|---|---|---|---|---|---|
| S1 | 3‑pack: Gelato, Melon Haze, Coconut Cake → `[{425,1},{431,2},{438,3}]`. En rad 1 920 kr, minicart, kassa med strains och 1 920 kr | PASS | PASS | PASS | PASS |
| S2 | 3‑pack: Gelato × 3 | PASS | – | PASS | – |
| S3 | 3‑pack: Strawberry Kush × 2 + Pineapple Express | PASS | – | PASS | – |
| X1 | Växling 3 → 5 → 3 → 1 st → 3 (se nedan) | PASS | PASS | PASS | PASS |
| X2 | 5‑pack som förhandsvisning (se nedan) | PASS | PASS | PASS | – |
| F1 | Tom plats 3: inget anrop, "Välj strain för plats 3.", knappen visar "Välj strains för alla platser" | PASS | PASS | PASS | – |
| F2 | Otillåtet val (variant 243 på plats 3, manipulerat): 406 och "Paketvalet godkändes inte …" | PASS | – | PASS | – |
| F3 | Lagret slut i servern (23 paket redan i korgen): 406 `available`, korgen oförändrad | PASS | – | PASS | – |
| F4 | Lagerbegränsning i valet (simulerat lager: Melon Haze 0, Coconut Cake 2) | PASS | – | PASS | – |
| R1 | Vanligt köp efter 3‑pack → 1 st (se nedan) | PASS | PASS | PASS | PASS |
| R0 | Utan flagga: inget paketval, inget anrop till pilotsidan, registret `{}` | PASS | – | PASS | – |
| E1 | Minicart "Ändra", plats 3 → Pineapple Express: ny rad 425/431/433 för 1 920 kr, den gamla raden borttagen | PASS | – | PASS | – |

Detaljer för de längre scenarierna:
- **X1:** platserna Strawberry/Melon/Coconut ligger kvar. I 5‑pack är plats 4–5 tomma, knappen är avstängd och anmärkningen visas. Tillbaka i 3‑pack är valen oförändrade. Köpet ger 429/431/438 för 1 920 kr.
- **X2:** knappen visar "5‑pack kan inte köpas än" och är `disabled`. Ett klick ger inget anrop och korgen förblir tom. Fem platser och anmärkningen "Designförhandsvisning …" visas.
- **F4:** Melon Haze visas "(slut i lager)" och kan inte väljas. Efter två Coconut Cake står den som "(inga fler i lager)" på plats 3. Inget anrop.
- **R1:** strainvalet och antalet kommer tillbaka och byggaren döljs. Nyehandels egen köpknapp lägger 425 × 1 för 675 kr, och inget paketanrop görs.

**Totalt 32/32 PASS.** I varje körning:
- exakt en synlig köpknapp på PDP:n;
- inga konsolfel;
- inget horisontellt överflöd på PDP, i minicart och i kassan (`scrollWidth` ≤ bredden; 1905/1920 med öppen minicart beror på scrollspärr).

## Vad är vad

| | Vad det är | Status |
|---|---|---|
| **1 st** | Fungerande köp | Nyehandels vanliga köpflöde, oförändrat |
| **Core 3‑pack** (paket 263, 1 920 kr, spara 105 kr) | **Fungerande köp i förhandsvisning** | Verifierat i PDP, korg, minicart, "Ändra" och kassa vid 393, 768, 1440 och 1920 |
| **Core 5‑pack** (3 135 kr ur importerade produkten 162 `HZ-CORE-5PK`) | **Endast designförhandsvisning** (`hz8-pkg-review=1`) | Kan inte köpas. Knappen är avstängd, inget varukorgsanrop görs. Priset och besparingen är inte verifierade, och därför visas ingen besparing |
| Magic Sauce 3.0 – 5 ml / 2 ml | Endast designförhandsvisning (registrerad, inte avbildad i v3) | Inga paketartiklar |
| Separata buds- och haschprodukter | Visas inte | Plattformen stöder det inte (Task 19) |

## Kvar innan försäljning

**Core 3‑pack:**
- Lagerdrag vid genomförd order är inte bevisat, eftersom ingen order fick läggas.
- Paketets namn i admin är "PILOT T19 – …" och det saknar bild i minicart och kassa.
- Kustom står i testläge.
- Det krävs merge till `dev` och ett beslut om att ta bort flaggan.

**Core 5‑pack:** det behövs en riktig Nyehandel-paketartikel med fem olåsta rader av 255 och ett verifierat pris. Därefter läggs en post i `PACKAGE_PRODUCTS` och samma tester körs.
