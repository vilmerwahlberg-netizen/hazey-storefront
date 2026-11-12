# Kassan: slutkontroll med fylld korg (2026-11-12)

Worktree `../hazey-storefront-checkout-header`, gren `feat/theme8-checkout-header`,
bas `origin/dev` 2d5e9d3. Task 18 (`894ba98`) och Task 21:s paketrader är
redan mergade i dev; den här omgången testar dem tillsammans och rättar det
som syntes.

**Ingen adminåtkomst i sessionen** (inga inloggningsuppgifter eller
inloggad webbläsare). Kassans CSS är därför **inte** inklistrad i Theme 8:s
CSS-fält. Testet injicerar `dist/theme8/hazey-theme8-checkout.css` i den
riktiga, opublicerade previewkassan (`/sv/checkout?preview=v9kzdmqz4w60l5n`),
dvs en simulerad inklistring. Ingen order, inget fylls i Kustom, korgen töms.

## Kör

```
node build-theme8.js
node theme8/review/checkout-finish-2026-11/filled.mjs 393,768,1440,1920   # med kassans CSS
node theme8/review/checkout-finish-2026-11/filled.mjs 393,1440 none        # nativ jämförelse
```

Korg per bredd, köpt via PDP:ns riktiga knappar på Magic Sauce 3.0 2 ml:
3‑pack blandat (2 × Gorilla Cookies, 1 × Tinky Winky) + 1 st vanlig vara.
Resultat: `runs/filled-css-*.json`. Skärmbilder (`shots/`, checkas inte in):
`<bredd>-fold.png`, `<bredd>-full.png`, `<bredd>-coupon.png`.

## Resultat (4/4 PASS)

| | 393 | 768 | 1440 | 1920 |
|---|---|---|---|---|
| Paketrad: "Magic Sauce 3.0 2 ml · 3‑pack", ruta "3×", delar | ✓ | ✓ | ✓ | ✓ |
| Vanlig vara: bild laddad och synlig | ✓ | ✓ | ✓ | ✓ |
| Totalsumma = Kustoms Totalbelopp (2 223 kr) | ✓ | ✓ | ✓ | ✓ |
| Delsumma 2 174 kr, Frakt 49 kr synliga | ✓ | ✓ | ✓ | ✓ |
| Rabattkod via tangentbord → "Kod är ogiltigt.", total oförändrad | ✓ | ✓ | ✓ | ✓ |
| Tab uppifrån och ned, inga uppåthopp, fokus scrollas in i bild | ✓ | ✓ | ✓ | ✓ |
| Inget sidledsöverflöd | ✓ | ✓ | ✓ | ✓ |
| Korgen tömd | ✓ | ✓ | ✓ | ✓ |

Tabbordning (alla bredder): Tillbaka → leveransland → kundtyp → nyhetsbrev
→ fraktsätt → Kustom-ramen → paketdelarnas länkar → antal/ta bort per vara
→ rabattkod. Det enda "dolda" fokusmålet är Kustoms egen helskärmsram
(`klarna-fullscreen-iframe`, plattform/leverantör). Enda konsolfelet är
Nyehandels 422 för den ogiltiga koden (förväntat).

Mätnot: Nyehandels sida har mjuk scroll. En fokusmätning direkt efter Tab
ser elementet utanför bild; efter ~700 ms ligger det i bild (nativt likadant).
Det är inte ett fel i kassan.

## Ändrat i den här omgången

- `86-checkout.css` §7: varubilden får en vit ruta med tunn kant. Förut låg
  den vanliga produktbilden direkt på kortets bakgrund och såg liten och
  lös ut bredvid paketets tonade "3×"-ruta.

## Kända, accepterade begränsningar

- Paketdelarna bryts på två rader på desktop ("2 Styck x / Gorilla Cookies")
  eftersom sammanfattningens mittkolumn är ~150 px. Läsbart; inte ändrat.
- Mobil: varorna ligger efter betalningen (DOM-ordning, ingen fokusflytt).
  Toppkortet visar "Din beställning · 2 produkter" + totaler.
- Produktnamn i Kustom/orderbekräftelse är fortfarande adminnamnen
  ("… (blandbart)") — admin.

Adminbeslut: se `ADMIN-DECISIONS.md` i samma mapp.
