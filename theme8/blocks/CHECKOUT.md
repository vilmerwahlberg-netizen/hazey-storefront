# Theme 8 — kassan: vad som är gjort och vad som kräver admin

## Redesign 2026-09-30 (facit: `checkout-hybrid-approved-mobile-393x852-v1.png`, `…-desktop-1920x1080-v2.png`)

Endast `css/86-checkout.css` (ren CSS på Nyehandels befintliga DOM,
scopad till `body.checkout-page`). Verifierad genom att injicera den byggda
`dist/theme8/hazey-theme8-checkout.css` lokalt i den riktiga fyllda
previewkassan -- **inte** via admin. Skärmbilder och jämförelser:
`theme8/review/checkout/`.

**Implementerat:** mörkoliv header (70 px desktop / 62 px mobil) med
tillbaka, logga, "Trygg kassa" och lås + "Säker betalning" (mobil: bara
lås); Stockholmsremsa 124/58 px utan text; trygghetsrad; desktop två
kolumner (max 1340 px, sammanfattning ~30 %, sticky); under 1024 px en
kolumn i DOM-ordning (se korrigering nedan); kort per
steg; 44 px antalsknappar; totalsumman störst; nyhetsbrevet som liten
valfri rad; "Betalning"-kort runt `#kustom-checkout` (inget inuti ramen
rört); stylat tomläge.

**Korrigering 2026-10-01 -- fokusordning och skärmläsare**

*Ordning under 1024 px* (390–1023, även 768): sammanfattningen visas
sist, efter betalningen, eftersom den ligger där i Nyehandels DOM. Den
tidigare visuella flytten (sammanfattning först, som i facit) gav
fokushopp nedåt till Kustom och sedan uppåt igen. Visuellt: header →
remsa → trygghetsrad → land/kundtyp → nyhetsbrev → fraktsätt → betalning
(Kustom) → Din beställning. Tangentbord (uppmätt 390/393/430/768):
Gå tillbaka → leveransland → kundtyp → nyhetsbrev → fraktsätt → Kustom-
ramen (Kustoms egna fält) → produktlänk → minska/öka/ta bort per vara →
Kustoms dolda helskärmsram. Inga uppåthopp. Rabattkodens växlare på
mobil är Nyehandels `div` och går inte att nå med tangentbord (nativ
begränsning, inte ändrad). Desktop (från 1024 px): vänsterkolumnen
uppifrån och ned, därefter den sticky sammanfattningen till höger, som
är synlig i fönstret när fokus når den, och sist rabattkodsfältet.

*Vad en skärmläsare får* (Chromium-tillgänglighetsträd, uppmätt):
- Header: "Kassa" (Nyehandels text, kvar) och knappen "Gå tillbaka"
  (bild med alt "Måbroberg AB (NDA)", admin). "Trygg kassa" och
  headerns "Säker betalning" har tom alt-text (`content: "…" / ""`) och
  läses inte upp.
- Trygghetsraden: dekorativ, tom alt-text, läses inte upp. Den ersätter
  ingen native information.
- Ordersammanfattning: Nyehandel har ingen egen rubrik eller region för
  den (inga `h*`, `aside` eller `aria-label`). "Din beställning" läses som
  vanlig text före varorna (ingen rubrik, ingen ARIA). Därefter per vara:
  produktbild och länk, "595 kr / Styck", variant, "Minska antalet",
  "Valt antal", "Öka antalet", "Ta bort varan", radsumma; sedan
  delsumma, frakt, totalsumma, moms och rabattkod.
- Rubrikerna Fraktsätt (h2), Fraktkostnad (h4) och Betalning (h2) finns
  kvar. Kassan saknar H1 (Nyehandels DOM).
- Styckpriset ("595 kr / Styck") var dolt i `29edf0d` och därmed borta ur
  tillgänglighetsträdet. Det visas nu igen.
- Äldre webbläsare utan alt-syntaxen använder en fallback-rad med samma
  text. Där läses de dekorativa texterna upp, men inget försvinner.
- Nyehandel-ärende: en rubrik eller `aria-label` för sammanfattningen
  och en H1 i kassan.

**Går inte med ren CSS / plattformen -- inte byggt:**
- *Hjälprad "Behöver du hjälp? Kontakta oss"*: CSS kan inte skapa länkar.
  Admin: lägg texten med länk till `/sv/page/kontakt` i kassatexten
  (`.checkout-message`, redan stylad) om fältet tillåter länk.
- *Fri frakt-status*: ingen Nyehandel-DOM idag (se nedan). Ingen egen
  mätare.
- *Antal varor i rubriken* ("· 1 vara") och *"Garanterad leverans"* under
  fraktsättet: finns inte i DOM (fraktsättets `<p>` är tom -- admin kan
  fylla i fraktsättets beskrivning).
- *Rabattkoden hopfälld på desktop*: Nyehandels växlare är en `div` utan
  tangentbordsfokus och visas bara under 1024 px. Desktop visar därför
  fältet öppet (kompakt). Mobil/surfplatta: nativ hopfällning; den är
  inte nåbar med tangentbord (Nyehandels komponent).
- *Kustoms rubrikrad* ("Kustom · Säker betalning med Kustom") ligger i
  ramen. Kustom kör **Test Mode** (limegul rad, "Test Data") i previewn.
- *Tabbordning på mobil*: sammanfattningen flyttas visuellt först (grid),
  men i DOM ligger den efter betalningen -- tangentbordsordningen följer
  DOM (tillbaka → land → kundtyp → nyhetsbrev → frakt → Kustom → antal).
- *Loggans alt-text* är "Måbroberg AB (NDA)" -- ändras i admin (logotyp
  för kassan).

**Aktivering:** se "Aktivera" nedan. Utan inklistring i Theme 8:s
CSS-fält syns inget av detta i previewn -- kassan laddar inte loadern.


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

## Frakt- och bonusstatus i kassan (2026-09-29)

**Inte byggd, och det är avsiktligt.** Kassan laddar inte Theme 8:s JS
(kontrollerat igen: `window.HZ8` saknas, bara `foundation.js`, den gamla
Oliverforss8-bundlen från Head-fältet och `pulse-tracker.js`). En status
kräver beräkning och kan inte göras i ren CSS. Ett skript i Head-fältet är
inte tillåtet (CLAUDE.md), och Kustoms iframe får inte röras.

Nyehandels kassa räknar redan själv
`checkout.calculations.free_shipping = { remaining,
free_shipping_progress_percentage, has_alternative }` och
`shipping.free_freight_activated`. När fri frakt över 499 kr är
aktiverad i fraktsättet (ADMIN-TODO.md punkt 1–3) visar Nyehandels egen
kassa sin fri frakt-status. Den kan då stylas med CSS i
`86-checkout.css` utan egen logik. Bonusstatus finns inte i kassan och
ska inte läggas dit förrän bonusmekanismen är beslutad.

Om Nyehandel har ett separat skriptfält för kassan kan
`hazey-theme8.min.js` läggas där. Då visar `HZ8.commerce` samma status.
Det är inte verifierat att ett sådant fält finns.

Kassans frakt är idag **49 kr vid alla belopp** (fraktsätt
"Fraktkostnad", ingen fri frakt-gräns), se ADMIN-TODO.md.
