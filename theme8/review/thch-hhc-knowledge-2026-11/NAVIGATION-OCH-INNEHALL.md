# Ämnesguiderna: navigations- och innehållskarta

16 november 2026. Gäller THCB, THCH och HHC (fältatlas R3) samt THCA (kunskapssida, koncept C, finns i Nyehandel).

## 1. Hur man når guiderna

| Ingång | I dag (kontrollerat 16 nov) | Efter lansering (förslag, inget ändrat) |
|---|---|---|
| **Theme 8-header** ("Cannabinoider") | Länkar bara till kategorier (`theme8/js/05-header.js`). Ingen guide nås från headern. THCB-kategorin `/sv/categories/thcb` finns i den inbyggda menyn. | En rad "Ämnesguider" i dropdownen: THCA, THCB, THCH, HHC (och rättslägeshubben). Kräver ändring i den låsta headern, så det är ett separat beslut. |
| **Nyehandels inbyggda sidlista** (`ul.page-links`) | Visar THCX, Engångsvapes och THCA, alltså de Content-sidor som finns | THCB, THCH och HHC syns där automatiskt när sidorna skapas, om sidlistan används |
| **Startsidan** ("Guider & aktuellt", `62-guides-newsletter.js`) | Tre kort mot sidor som inte finns (`vad-ar-thcab` m.fl., 404). Visas bara i preview. | Peka korten mot de riktiga guiderna när de är publicerade (beslut) |
| **Katalog**, kategorisidor | `/thcb`, `/thch` och `/sv/page/thch` går med 301 till kategorierna. THCH-kategorin är **tom**. `/hhc` ger 404. | 301 från gamla adresser till guiderna (B5). En textlänk "Läs om THCB" i THCB-kategorins beskrivning (adminfält). |
| **Artiklar** (`/sv/posts`) | De gamla THCB-, THCH- och HHC-artiklarna länkar inte till några guider och innehåller inaktuella påståenden | Uppdatera eller märk artiklarna, och länka sedan till respektive guide (B7) |
| **Mellan guiderna** | THCA-guiden länkar inte till de nya | **Byggt nu:** varje ny guide länkar till de andra under "Relaterat" och "Fler ämnesguider". THCB → THCH, HHC, THCA. THCH → HHC, THCB, THCA. HHC → THCH, THCB, THCA. THCA → de nya kräver en liten ändring i `thca.html` (beslut). |
| **Rättslägeshubben** | Finns inte (`/lagliga-cannabinoider-sverige/` → 404 i Nyehandel) | Hubben länkar till alla guider och guiderna tillbaka (kommentar i varje block) |

Planerade sluggar: `/sv/page/thcb`, `/sv/page/thch`, `/sv/page/hhc`. Länkarna mellan dem fungerar i testfixturen. I butiken fungerar de först när sidorna skapas, och då samtidigt.

## 2. Vad varje sida innehåller

Alla tre följer samma struktur. Allt står i initial HTML.

1. **Hero:** Ämnesguide, H1, tagline, två ankarlänkar och en egen stämningsbild.
2. **Kapitel 01 Definition:** ingress, namn och kemi. Högerkolumn med status, I korthet och Relaterat.
3. **Kapitelindex** 01–04.
4. **Kapitel 02 Rättsläge:** text och tidslinje.
5. **Kapitel 03 Historik:** Hazey och ämnet, plus "I sortimentet nu".
6. **Kapitel 04 Källor:** primärkällor och en rad om bilden.
7. **FAQ:** sex frågor och "Fler ämnesguider".

| | THCB | THCH | HHC |
|---|---|---|---|
| Status | **Rättsläget granskas** (utredning sedan 5 mars 2024, inte i förteckningarna 16 nov 2026) | **Narkotikaklassat** sedan 10 dec 2024 (SFS 2024:985) | **Narkotikaklassat** sedan 11 juli 2023 (SFS 2023:379) |
| Kemi | butyl (4 C) | hexyl (6 C). Delta-8- och delta-9-THCH. | hydrerad THC, pentyl (5 C). HHCP i FAQ. |
| Källor | 6 (FHM ×3, riksdagen ×2, Linciano 2020) | 3 (SFS 2024:985, FHM-yttrande, riksdagen) | 3 (SFS 2023:379, regeringen, riksdagen) |
| Butiken | THCB-kategori: 1 produkt, slut, live lagerrad | Ingen produkt. Kategorin är tom och länkas inte. | Ingen produkt och ingen kategori |
| Bild | Flockblomma på kustklippa (syntetisk, R3-underlag) | Olivgren på solbelyst puts (befintlig asset, speglad) | Kustsluttning i kvällsljus (befintlig asset, beskuren) |
| GSC-frågor | thcb, thc b, thc-b, thcb vape, thcb hash, thcb sverige | thch, thch vape, thc h | hhc, hhc vape, hhc sverige |

## 3. Vad som återstår före lansering

### A. Visuell slutputs (mallen är godkänd i R3; det här är detaljer)

- Mobil: den svaga skuggan längs högerkanten är global och syns på alla sidor, även THCA. Den rättas i den globala komponenten, inte här.
- THCH-bilden är bara 960 px bred, så den blir något mjuk på 2x-skärmar. HHC-bilden är 932 px bred, så samma sak gäller.
- Bekräfta att motiven känns som en familj: THCB flockblomma, THCH olivgren, HHC kust (B8).

### B. Saknat innehåll

- **Ursprung för THCH- och HHC-bilderna:** de är befintliga tema-assets, troligen syntetiska. Det behöver bekräftas (B8).
- **Rättslägeshubben:** finns inte.
- **Header:** ingen länk till guiderna (beslut i den låsta headern).
- **Startsidans guidekort:** pekar på sidor som inte finns.
- **THCA-guiden:** länkar inte till THCB, THCH eller HHC.
- **Titel och metabeskrivning:** finns bara som förslag i `verify.mjs`. De sätts i admin.
- **Strukturerad data (FAQPage):** inte testad.

### C. Faktagranskning (separat innehållsgranskning före publicering)

- **THCB:** kapitel 01 och 02, tidslinjen och FAQ. Se `../thcb-knowledge-2026-11/BESLUT.md` B1.
- **THCH:**
  - kapitel 01, särskilt meningen om dubbelbindningens läge (delta-8 och delta-9)
  - "Hazey sålde THCH" (orderhistorik)
- **HHC:**
  - kapitel 01, särskilt den kemiska förklaringen "dubbelbindningen ersatt med väte"
  - HHCP i FAQ
  - "Hazey sålde HHC" (orderhistorik)
- **Alla tre:** gamla påståenden i `GAMLA-PASTAENDEN.md` får inte föras över utan källa.
