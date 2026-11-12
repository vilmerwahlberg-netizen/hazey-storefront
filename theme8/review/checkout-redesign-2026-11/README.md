# Kassan: redesign, två förslag (2026-11-12) — VÄNTAR PÅ VAL

Gren `design/theme8-checkout-redesign` (från origin/dev 2d5e9d3, **utan** den
underkända 2e7004b). Ingen produktionskod är ändrad: koncepten är CSS-filer i
`concepts/` som injiceras i den riktiga Theme 8-previewkassan. Ingen order,
inget i admin, inget i Kustoms ram.

Korg i alla bilder: Magic Sauce 3.0 2 ml **3‑pack blandat** (2 × Gorilla
Cookies, 1 × Tinky Winky) 1 599 kr + **Magic Sauce 3.0 – 2 ml** Gorilla
Cookies 575 kr. Frakt 49 kr. Totalt **2 223 kr** (= Kustoms totalbelopp).

**Tavlor:** `compare-393.jpg` (nativ · previewn idag · 2e7004b · A · B, första
vyn), `compare-393-full.jpg`, `compare-1440.jpg`, `compare-1440-full.jpg`.
Enskilda bilder genereras med `node …/shoot.mjs` + `node …/board.mjs`.

## 1. Vad den "nativa" kassan faktiskt är

| Läge | Hur |
|---|---|
| **Nyehandel nativ** | Theme 8:s kassaregler bortplockade i webbläsaren, temats färger kvar (`stripThemeCheckout`) |
| **Previewn idag** | Theme 8:s CSS-fält (`<style id="nyts">`, 56 kB) innehåller **redan** ett äldre kassablock ("Trygg kassa", "Svenskt lager", Stockholmsremsa) = Theme 8-kassan från ca 2026-10-01 (`6525906`). CHECKOUT.md säger "inte inklistrad" — det stämmer inte längre. Kopia: `runs/theme8-css-field.css` |
| **2e7004b** | Task 18 + bildruta, underkänd — aktiveras inte |

## 2. DOM och tangentbord (uppmätt, `probe-dom.mjs`, `runs/pure-native.json`)

```
.checkout-layout            flex: row (desktop) · column-reverse (mobil, Nyehandels egen)
  .checkout-information     land, kundtyp, nyhetsbrev, Fraktsätt, Betalning → #kustom-checkout (iframe)
  .checkout-items-summary   varor (länkar, −/+/ta bort) → totaler (inget fokuserbart) → rabattkod
```

- **Mobil, Nyehandel nativ:** varorna visas *först* (column-reverse), men
  tabbordningen följer DOM: Tillbaka → land → kundtyp → nyhetsbrev → frakt →
  **Kustom (alla fält)** → varor → (rabattkod). Fokus hoppar alltså upp till
  toppen efter betalningen — redan idag, i Nyehandels egen kassa.
- **Rabattkoden på mobil:** Nyehandels växlare är en `<div>` utan tabindex/roll
  → **går inte att nå med tangentbord** nativt. CSS kan visa formuläret öppet
  (gjort i båda förslagen) → fältet nås.
- **Desktop:** två kolumner, information vänster, sammanfattning höger.
  Tabbordning vänster → höger = läsordning. Inga problem.

### Begränsning: varor och rabattkod *före* Kustom i fokusordningen

CSS kan flytta varor/rabattkod visuellt (båda förslagen gör det på mobil, som
Nyehandel själv), men **inte fokus-/skärmläsarordningen**: den följer DOM, där
sammanfattningen ligger efter betalningen.

- Testat: `reading-flow: flex-visual` (låter fokus följa visuell ordning,
  Chromium 137+). I den riktiga kassan (Chromium 151) **hoppas hela
  informationsdelen över** efter rabattkoden och fokus fastnar mellan Kustoms
  helskärmsram och sidan → leverans/betalning nås inte med tangentbord.
  **Underkänt** (`probe-reading-flow.mjs`, `runs/reading-flow.json`). Stöds
  dessutom inte i Safari/Firefox.
- Ett skript som flyttar DOM:en går inte: kassan kör inte Theme 8:s JS, Head-
  fältet är reserverat (CLAUDE.md) och Vue ritar om sammanfattningen.

**Bästa fungerande väg:** visuell ordning varor → rabattkod → totaler →
leverans → betalning (som Nyehandels egen mobilkassa), fokusordning oförändrad
från nativ (ingen försämring), rabattkoden nu nåbar. Korrekt även för
tangentbord/skärmläsare kräver Nyehandel: **(1)** rendera
sammanfattningen före informationen i DOM på mobil (eller en inställning för
det), **(2)** gör rabattkodens växlare till en `<button>`.

## 3. Förslagen

Båda: samma DOM, Kustoms ram orörd, inga betalsätt eller leveranslöften
tillagda. Trygghet = en dämpad rad med de redan verifierade påståendena
"Skickas från Sverige · Diskret paket · Spårning via e-post". Varje varurad:
bild, namn, variant/paketinnehåll, antal, radsumma. Paketraden får kundnamnet
"Magic Sauce 3.0 2 ml · 3‑pack" och delarna på en rad ("2 Styck x Gorilla
Cookies"). Breadcrumb "Hem / Kassa" och den enda förvalda betalsätts-
radioknappen (Kustom) döljs; "Kassa" finns kvar för skärmläsare.

**A · Kvittot** (`concepts/A-kvittot.css`) — ljust. Ordern är ett
kvittoblad med perforerad underkant: först på mobil, smal sticky kolumn
till höger på desktop (max 1080 px). Rabattkoden sitter direkt under
varorna, före totalsumman. Leverans och betalning ligger öppet på sandytan
med små versalrubriker, ingen kortstapel. Header ljus med olivgrön logga,
desktop "Betalning via Kustom".

**B · Olivramen** (`concepts/B-olivramen.css`) — mörkt varumärkesfält.
Ordern ligger i ett olivfält som går ihop med den mörka headern: överst på
mobil, helhög panel till höger på desktop (split screen). Totalsumman stor
i krämvit serif; rabattkoden sist i fältet. Leverans och betalning är två
numrerade steg ("1 Leverans", "2 Betalning") på ljus yta; Fraktsätt ingår i
steg 1.

| Mätt (y = px från toppen) | Nativ 393 | A 393 | B 393 | Nativ 1440 | A 1440 | B 1440 |
|---|---|---|---|---|---|---|
| Andra varan | 416 | 312 | 254 | 407 | 320 | 276 |
| Rabattkodsfält | ej nåbart | 502 | 575 | 718 | 490 | 576 |
| Totalsumma | 607 | 644 | 473 | 598 | 632 | 491 |
| Kustoms ram börjar | 1168 | 971 | 965 | 517 | 341 | 384 |
| Sidans höjd | 2067 | 1842 | 1836 | 1437 | 1196 | 1239 |

Varor, totalsumma och rabattkod i första vyn (852 / 900 px): båda förslagen,
båda bredderna. Ogiltig kod via tangentbord → "Kod är ogiltigt." i båda.
Inget sidledsöverflöd. Tabbordning (`runs/tab-concepts.json`) = nativ, inga
fokusmål utanför bild.

## 4. Vid val (inte gjort)

Implementeras som ny `theme8/css/86-checkout.css` (ersätter Task 18-blocket),
paketreglerna från `build-theme8.js` behålls. I admin ska det gamla
kassablocket i Theme 8:s CSS-fält **ersättas** av den nya byggfilen.
Adminfrågorna (fri frakt 499 kr mot 49 kr, förkryssat nyhetsbrev, Kustom Test
Mode) gäller oförändrat — se `../checkout-finish-2026-11/ADMIN-DECISIONS.md`
på grenen `feat/theme8-checkout-header`.
