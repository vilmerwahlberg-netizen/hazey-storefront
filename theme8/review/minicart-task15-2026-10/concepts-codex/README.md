# TASK 15 — godkänt visuellt facit

Vilmer godkände denna riktning 2026-10-30. Det här är den enda visuella
auktoriteten för Task 15. Äldre Codex-koncept är borttagna för att de inte ska
kunna blandas ihop med facit.

## Primära referenser

- `concept-a-v4-calm-cart.png` — hela referensarket för huvudvyn på desktop
  och mobil.
- `concept-a-v4-strain-editor.png` — hela referensarket för strainredigeraren,
  inklusive komplett och ofullständigt 5-pack.

## WebP-material för implementation och jämförelse

- `webp/minicart-v4-full.webp`
- `webp/minicart-v4-desktop.webp`
- `webp/minicart-v4-mobile.webp`
- `webp/strain-editor-v4-full.webp`
- `webp/strain-editor-v4-desktop.webp`
- `webp/strain-editor-v4-mobile.webp`
- `webp/strain-editor-v4-incomplete-5pack.webp`

WebP-filerna är rena referensutsnitt, inte bilder som ska bäddas in i
butiksgränssnittet. Produktbilder och all produktdata ska fortsatt komma från
Nyehandels riktiga data.

## Officiella varumärkestillgångar

- `assets/swish-logo-official.svg` — kopia av Hazeys befintliga officiella
  Swish-logotyp.
- `assets/postnord-short-official.svg` — PostNords officiella förkortade
  checkout-logotyp från
  `https://www.postnord.se/siteassets/logos-and-badges/pn_16x16px_rgb2.svg`.

Ändra inte logotypernas former, färger eller proportioner. De får skalas men
inte återskapas med text eller genererade symboler.

## Låsta designbeslut

- En sammanhållen tvåstegsmätare överst visar fri frakt och nästa bonusmål.
  Samma fraktstatus upprepas inte i summeringen.
- Verifierade paketsteg visas kompakt inne i rätt produktrad när riktiga
  paketprodukter finns. Facitet demonstrerar 1/3/5, men implementationen ska
  återge varje produkts verkliga steg (exempelvis även 10 eller 15) utan falska
  paketköp eller Theme 8-rabatter.
- Valda strains sammanfattas i raden. `Ändra` öppnar en barnvy i samma drawer,
  aldrig en modal ovanpå drawern.
- Varje numrerad plats i strainvyn är ingången till valbara strains. Ingen
  redundant kontroll som ”Visa alla strains”.
- Ofullständigt paket kan inte sparas. Slutsålda strains får synas men är
  tydligt inaktiva.
- Huvudvyn visar högst ett kontextuellt tillägg: pre-roll normalt, batteri när
  ordern innehåller cart och carts när ordern innehåller batteri. Påstå aldrig
  att andra kunder kombinerar produkterna utan verklig data.
- Rabattkod kan appliceras i minicarten. Summeringen visar varor, frakt,
  total besparing och total utan att dubblera samma rabatt i flera rader.
- Kassaknappen är en stadig mörk olivhandling enligt facit. Orange används
  sparsamt för verklig besparing, inte som ett andra konkurrerande CTA-system.
  Tillfälliga kontroller får använda diskret glas; innehållet ska inte bli en
  samling glaskort.
- PostNord står för ”Skickas från Sverige”, Swish för ”Trygg betalning” och den
  befintliga bocken för ”Diskret paket”.

Vid konflikt med `directions/`, den historiska delen av `RECOMMENDATION.md`
eller äldre audittext vinner denna README, de två v4-PNG-filerna och den
uppdaterade `IMPLEMENTATION-PROMPT.md`.
