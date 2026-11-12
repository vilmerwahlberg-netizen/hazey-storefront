# Ny Theme 8-kassa: John Henric-struktur i Hazeys uttryck (2026-11-12)

Godkänd skiss: `/Users/wahlberg/HZY/checkout-johnhenric-hazey-2026-11-12/`
(README + bilder 393/1440). Implementerad i `theme8/css/86-checkout.css` mot
Nyehandels riktiga kassa-DOM, inte prototypens HTML. Paketradernas kundnamn
och bildruta genereras som förut av `build-theme8.js` (Task 21); typsnittet
följer nu radens och bildrutan visar "3×" + serienamnet.

## Test (`verify.mjs`)

Riktig fylld korg i Theme 8-förhandsvisningen: Magic Sauce 3.0 2 ml 3-pack
blandat (2 × Gorilla Cookies, 1 × Tinky Winky) 1 599 kr + 1 st Gorilla Cookies
575 kr, frakt 49 kr, total 2 223 kr. Det gamla kassablocket i CSS-fältet tas
bort i webbläsaren och ersätts med `dist/theme8/hazey-theme8-checkout.css`.
Ingen order. Ingenting skrivs till Nyehandel. Korgen töms efter varje bredd.

| | 393 | 768 | 1440 | 1920 |
|---|---|---|---|---|
| Varor, strains, antal, radsumma synliga | ja | ja | ja | ja |
| Andra varan / total / rabattkod i första vyn | 271 / 475 / 540 | 261 / 455 / 520 | 283 / 509 / 583 | 283 / 509 / 583 |
| Total = Kustoms Totalbelopp (2 223 kr) | ja | ja | ja | ja |
| Ogiltig kod (tangentbord) → "Kod är ogiltigt.", total oförändrad | ja | ja | ja | ja |
| Fokus: alla stopp synliga i vyn och med fokusring | ja | ja | ja | ja |
| Sidledsscroll | 0 | 0 | 0 | 0 |
| Korgen tömd efteråt | ja | ja | ja | ja |

Bilder i `shots/`: `new-<bredd>-fold.png` (första vyn), `-full.png`
(helsida, fönstret sträckt så att Kustoms ram målas), `-coupon.png`
(ordersumman efter ogiltig kod). Rådata: `runs/verify-*.json`.

## Avvikelser från skissen (medvetna)

- **Nyehandels egna texter behålls:** "Frakt", "Totalsumma", "Inkl.moms: 444,6 kr",
  "Lägg till Rabattkod/presentkort", "Prenumerera på nyhetsbrev", paketdelarna
  "2 Styck x Gorilla Cookies". CSS kan inte byta ut textnoder utan att
  skada tillgängliga namn.
- **"Betalning" i stället för "Dina uppgifter"** ovanför Kustom: Nyehandels
  egen rubrik, och Kustoms ram har redan rubriken "Dina uppgifter".
- **Ingen "Fortsätt handla"-länk:** finns inte i DOM:en; "Tillbaka" (Nyehandels
  history.back) finns kvar.
- Styckpriset ("1 599 kr / Styck") är visuellt dolt men läses av skärmläsare.
- Nyhetsbrevet visas efter frakten som i skissen (DOM: före). Tabbordningen
  byter bara plats på kryssrutan och den förvalda fraktradion.

## Begränsning (oförändrad)

På mobil visas ordersumman först, men tangentbords- och skärmläsarordningen
följer Nyehandels DOM: leverans → Kustom → varor → rabattkod. Det kan bara
Nyehandel ändra (rendera sammanfattningen före informationen och göra
rabattkodens växlare till en knapp). Rabattkoden hålls alltid öppen så att den
nås med tangentbord.

## Kräver admin (inget är gjort)

1. **Gamla kassablocket i Theme 8:s CSS-fält** — ersätt det med
   `dist/theme8/hazey-theme8-checkout.css` (se `theme8/blocks/CHECKOUT.md`,
   "Aktivera"). Spara, publicera inte.
2. **Förvalt nyhetsbrev** — kryssrutan är förbockad i Nyehandel. Samtycke till
   marknadsföring bör vara aktivt val; avbocka som standard i admin. CSS kan
   inte ändra det.
3. **Kustom Test Mode** — den gula "Test Mode"-bandet och "Test Data" kommer
   från Kustom. Stäng av i Nyehandel/Kustom före publicering.
4. **Fraktregeln** — kassan visar "Fraktkostnad 49 kr" (adminbeskrivningen är
   tom; CSS visar "Leverans inom Sverige"). Beslut kvar: 49 vs 79 kr och om fri
   frakt från 499 kr ska gälla. Inget fraktlöfte är tillagt i CSS.
5. **Paketets saknade bild** — Magic Sauce 3.0 2 ml 3-pack har ingen
   produktbild i Nyehandel (`/images/no-image.png`); CSS visar en typografisk
   ruta "3× Magic Sauce 3.0". Ladda upp en riktig paketbild i admin.
