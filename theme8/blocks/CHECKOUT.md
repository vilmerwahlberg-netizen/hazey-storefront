# Theme 8 — kassan: vad som är gjort och vad som kräver admin

Verifierat 2026-09-28 mot Nyehandels RIKTIGA, fyllda kassa (en vara i
korgen via UI → minicart → "Till Kassan" i samma webbläsarsession).
Ingen order skickades.

## Vad kassan består av

| Del | Ägare | Theme 8 kan styla? |
|---|---|---|
| Sidhuvud (`header.checkout`, tillbaka + "Kassa") | Nyehandel | Ja |
| Leveransland, kundtyp (privat/företag) | Nyehandel | Ja |
| Nyhetsbrevsval | Nyehandel | Ja (utseende) |
| Fraktsätt (`.shipping .options`) | Nyehandel | Ja |
| Betalning (`.payment`) — rubrik + ram | Nyehandel | Ja (ramens yta) |
| **Kontakt, adress, leverans, betalsätt, "Betala köp"** | **Betalleverantören (Kustom/Klarna, `#kustom-checkout` iframe)** | **Nej** — tredjepartsram |
| Ordersammanfattning: rader, bild, variant, antal, delsumma, frakt, totalsumma, moms | Nyehandel | Ja |
| Rabattkod/presentkort (validering) | Nyehandel | Ja (utseende) |
| Kassatext (`.checkout-message`) | Nyehandel (admin) | Ja — stylad som trygghetsrad |

Prototypens adressökning, ombud/paketbox-sök, Swish-QR, betalningsstatus
och sticky betalknapp finns INTE som Nyehandel-DOM — de ligger (om alls)
i betalleverantörens ram och återskapas inte.

## Plattformsgräns

Kassan kör **inte** temats JavaScript-fält (Theme 8:s loader). Den laddar
temats **CSS-fält** och Head-fältet. Därför är kassans stil ren CSS,
scopad till `body.checkout-page`.

## Aktivera (manuellt — inte gjort)

1. Kör `node build-theme8.js`.
2. Öppna `dist/theme8/hazey-theme8-checkout.css` (tokens + kassaregler,
   bild-URL:er absoluta mot GitHub Pages `theme8/assets/`).
3. Nyehandel-admin → **Theme 8** (INTE Theme 3/5/6) → **CSS-fältet** →
   klistra in filens innehåll **sist** i fältet. Befintligt innehåll i
   fältet (ett äldre `.hz-header`-block) kan ligga kvar.
4. Spara Theme 8 — klicka **inte** Publicera.
5. Kontrollera `/sv/checkout?preview=v9kzdmqz4w60l5n` med en vara i korgen.

Utan steg 3 fungerar kassan exakt som idag (native utseende).
Filens regler för övriga sidor är identiska med dem loadern redan
laddar, så dubbelladdningen påverkar inget.

## Rekommenderade admininställningar (inte gjorda)

- **Nyhetsbrev förkryssat som standard** — i kassan är rutan
  "Prenumerera på nyhetsbrev" ikryssad från början. Prototypen och god
  praxis: avmarkerad. Ändras i Nyehandels kassainställningar (om
  inställningen finns); CSS kan inte ändra ett förval.
- **Kassatext** (`checkout_message`, visas som trygghetsrad överst):
  förslag med bara verifierade uppgifter (footer, FAQ, produktsidornas
  USP-rad): *"Skickas från Sverige · Diskret förpackning ·
  Spårningsnummer via e-post"*. Prototypens "Leveransgaranti" och
  "Kommer paketet inte fram skickar vi ett nytt" används inte —
  overifierat.
- **Kassabakgrund** i temainställningen är `#6c4b4b`; Theme 8-CSS:en
  skriver över den, men värdet kan med fördel sättas till `#ede9e8`.

## Medvetet inte gjort

- **Sticky mobil betalknapp:** den enda slutknappen ("Betala köp") finns
  i betalleverantörens ram. Att klona den vore en knapp med separat
  state — förbjudet. Utan JS i kassan går inte heller en scroll-genväg
  att lägga in.
- **Head-block:** CLAUDE.md reserverar Head-fältet för typsnitt och
  Trustpilot; inget Theme 8-skript föreslås där.
- Kassans "Till Kassan"-navigering (Vue) tappar `?preview=`; det spelar
  ingen roll eftersom kassan ändå inte kör temat.
