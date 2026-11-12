# Task 21: paketradernas namn och bild i minicart och kassa

2026-11-11 · worktree `../hazey-storefront-task21`, gren `feat/task-21-package-cart-identity`, bas `origin/dev` = eb5bb5c (PR #4 mergad).
Ingen order och ingen adminändring. Produktnamn, SKU och bilder i Nyehandel är orörda. Alla testkorgar är tömda.

## Var namn och bild kommer ifrån (`evidence/probe-sources.json`)

| Var | Namn | Bild | Länk | Theme 8 körs? |
|---|---|---|---|---|
| Korg-API (`cart.items[]`) | `name` = paketartikelns adminnamn ("PILOT T19 – …", "… (blandbart)") | `image: null`, `image_url: /images/no-image.png`. Paketdelarna har var sin `image_url` | `href` = paketets egen sida | – |
| Minicart (`#cartAside`, Vue) | `<strong>{{name}}</strong>` | `<img src=image_url>` | `href` | **Ja (JS + CSS)** |
| Kassan (`/sv/checkout`) | samma markup | samma | samma | **Nej.** Varken temats JS eller dess CSS. Bara Head-fältet (typsnitt, Trustpilot) körs |

## Vad som ändrades

- **`theme8/js/03c-package-table.js` (ny): den enda paketkällan.** Basprodukt → PDP (`home`), kort kundnamn (`label`) och de verifierade paketen.
  - `85-pdp-pilot.js` läser den, med paketval och omdirigering oförändrade.
  - `84-cart.js` och `build-theme8.js` läser samma tabell.
- **Minicarten (`84-cart.js` `syncPackageIdentity`, `84-cart.css`).** Gäller oavsett pilotflagga. Läggs på igen efter varje Vue-omritning, med samma mönster som paketsteget.
  - **Namn:** "<label> · N‑pack", till exempel "Magic Sauce 3.0 2 ml · 5‑pack", med icke-brytande mellanrum och bindestreck. Adminnamnet i `<strong>` döljs. Skärmläsartexter (`aria-label`) får samma kundnamn.
  - **Bild:** basproduktens riktiga bild (primärvariantens bild ur basens `product/state`, samma 400 px-tumnagel som vanliga rader använder). Används **bara** när paketet saknar egen bild.
  - **Länk:** basens PDP med storleken förvald (`?hz8-pack=N`), utan omvägen via paketsidan.
  - **Orört:** pris, antal och PR #4:s sammanfattning ("3 × Gorilla Cookies · 2 × Tinky Winky"). Sammanfattningen har nu icke-brytande "N × strain".
- **Kassan (genererad CSS sist i `dist/theme8/hazey-theme8-checkout.css`, `build-theme8.js`).** Reglerna gäller per paketlänk och genereras ur samma tabell.
  - **Namn:** samma kundnamn via `::after`. Adminnamnet döljs även för skärmläsare.
  - **Bildrutan:** en tonad ruta "3×" / "5×" i stället för den tomma no-image-bilden. Inga produktbild-URL:er ligger i CSS.
  - **Paketdelarna:** visar bara antal och strain ("2 Styck x Gorilla Cookies"), utan det upprepade produktnamnet.
  - Dokumenterat i `theme8/blocks/CHECKOUT.md`.

## Test

Skript:
- `evidence/ui-identity.mjs`: köp via PDP:ns knapp, minicart, kassa.
- `evidence/checkout-393.mjs`: kassans varulista vid 393.

Per familj (Core, MS 2 ml, MS 5 ml) kördes två sessioner:
- **A:** 3‑pack blandat, 5‑pack upprepat och en vanlig produkt.
- **B:** 3‑pack upprepat och 5‑pack blandat.

| | 393 | 1440 |
|---|---|---|
| Core A / B | PASS / PASS | PASS / PASS |
| MS 2 ml A / B | PASS / PASS | PASS / PASS |
| MS 5 ml A / B | PASS / PASS | PASS / PASS |

**12/12.** Varje session kontrollerar:
- korgens pris och delar;
- minicartens namn, synliga bild, länk, `aria-label` och sammanfattning, och att adminnamnet inte syns någonstans;
- kassans `::after`-namn, ruta, pris och delar;
- att den vanliga produkten är orörd i minicart och kassa;
- inget överflöd, inga konsolfel och tömd korg.

Efter de sista radbrytningsändringarna kördes Core A/B, MS 2 ml B och MS 5 ml A/B om på slutbygget, alla PASS.

**Bildhämtningar:** när minicarten öppnades hämtades **inga** nya bilder i någon session. Basbilden låg redan i cachen från PDP:n. Från en annan sida blir det högst ett `product/state`-anrop och en tumnagel per basprodukt. Nyehandels egen `no-image.png` laddas fortfarande av Vue, men den döljs.

Kassan vid 393: varulistan ligger i en behållare som är 0 px hög på mobil, men raderna är synliga. Bilder: `shots/*-393-kassa.jpg`.

Kassan är testad med kassans CSS **injicerad i sidan**, som en simulerad inklistring, eftersom den inte är inklistrad i admin.

Avbruten körning: en tidig körning avbröts av en tidsgräns mot Nyehandels server. Den sessionens korg (MS 2 ml-paket) tömdes aldrig. Ingen order lades, och korgen är övergiven.

## Kräver fortfarande admin
1. **Kassans namn och ruta syns först när** `dist/theme8/hazey-theme8-checkout.css` är inklistrad i Theme 8:s CSS-fält (ADMIN-TODO 9b). Kassan kör inte temats JS.
2. **En riktig produktbild i kassan** kräver en egen bild på paketartiklarna i Nyehandel.
3. **Namnen på kvitto, i orderbekräftelse och i Kustom:s orderrader** kommer från Nyehandel. Där syns fortfarande "PILOT T19 – …" och "(blandbart)" tills produktnamnen ändras i admin, vilket inte är gjort.
