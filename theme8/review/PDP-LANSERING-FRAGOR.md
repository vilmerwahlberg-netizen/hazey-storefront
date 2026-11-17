# Författade PDP:er: gemensam lista inför lansering

Frågor som inte stoppar designarbetet men ska tas i en gemensam genomgång före lansering. Inget här är ändrat i Nyehandel-admin, i produktdata eller i aktivt tema. Underlag finns i respektive granskningsmapp.

## Gäller alla författade PDP:er

- **Globalt `noindex, nofollow`, canonical och 301:or.** Canonical pekar på nyehandel-domänen och 301:orna från Woo saknas. Allt hör till domänbytet.
- **Labb-PDF:er på `www.hazey.se/wp-content/…`.** De behöver flyttas före domänbytet.
- **Innehåll som kräver JavaScript.** Kort svar, FAQ och strainnamn finns inte i serverns HTML. Lösningen är text i admin efter godkänd copy.
- **Woo-omdömen är inte importerade**, så inga betyg visas (importväg: `reviews-recovery-2026-11/IMPORT-PATH.md`).
- **Fel i standardflödet:** "Labbrapport skickas på begäran" visas trots att produkttexten har en PDF. Det berör alla PDP:er utan egen post.
- **Rättigheter till bladfotot** (`assets/pdp-ms2ml-2026-11/README.md`) är inte bekräftade.
- **Terminologi:** semisyntetisk/naturidentisk och cannabinoidnamn är inte beslutade.

## Magic Sauce 3.0 2 ml (261), i dev

Underlag: `ms2ml-pdp-pilot-2026-11/R4-SLUTKONTROLL.md`.

**Admin och SEO:**
- extra H1 i den korta beskrivningen
- ordningen på rubrikerna
- produktnamnet "– 2 ml"
- obelagda påståenden i meta, text och JSON-LD

**Innehåll:**
- inget gemensamt labbintyg är identifierat (5 PDF:er per strain)
- 40 Woo-omdömen

**Fråga:** ska THCbA/THC-B ligga i karusellen?

## Hero's Core 2 ml (255)

Underlag: `herocore-pdp-2026-11/KARTLAGGNING.md`.

1. **Kundnamnet "PILOT T19".** 3-paketet (produkt 263) heter "PILOT T19 – Hero's Core 2ml – 3-pack" och det namnet syns i varukorgen. Paketfunktionen behålls; bara namnet (och routen `/pilot-t19-…`) ska ses över.
2. **Platshållare i SEO-titeln.** Titeln innehåller `%%sep%%` och säger "THCX" medan texten säger "Core".
3. **Labbintyget.** CoA-THCX.pdf gäller "VAPE DISTILLATE", en batch, och nämner varken Hero eller någon strain. Gäller det produkten och alla strains?
4. Extra H1 "Hero CORE Vape 2ml" i produkttexten.
5. Ska ämnet heta "Core" eller "THCX"?
6. Obelagda påståenden: "Laglig i Sverige", "En laglig cannabis", "Varje batch analyseras", CCELL, lagreferensen 167/1998, halter från en batch.
7. 7 Woo-omdömen ska importeras.
8. Katalog: kategorin Hero Vapes innehåller buds och hasch.
9. Egen Om-bild saknas (kustbilden är delad med MS).

## D10 2 ml (254)

Underlag: `d10-pdp-2026-11/KARTLAGGNING.md`.

1. **Hela produkten är slutsåld.** Ska sidan lanseras som slutsåld med "Bevaka", eller vänta på lager?
2. **SEO-titeln** innehåller `%%sep%%`. Metan har "Laglig i sverige" och "ett steg upp från Magic Sauce".
3. **D10 eller delta-10?** Texten säger att D10 "inte ska förväxlas med delta-10-THC", men förpackningsbilden säger "99% DELTA10" och rapporten "99% D10".
4. **Labbrapporterna:** labbets adress är densamma som kundens (GB Czech s.r.o., Ostrava), medan texten säger "oberoende laboratorier". Läst för Cherry Sour; de fyra andra svarar men är inte lästa i detalj.
5. **Obelagda påståenden** (18 markeras med `?hz8-factcheck=1`):
   - "Samma specifikation i varje sats", "spårbar från produktion till leverans"
   - "En laglig cannabis", "<0,3 % THC"
   - jämförelser med Magic Sauce
6. **Webbhotellet** svarade 429 (för många anrop) på snabba PDF-hämtningar i följd. Det bör kontrolleras inför flytten av PDF:erna.
