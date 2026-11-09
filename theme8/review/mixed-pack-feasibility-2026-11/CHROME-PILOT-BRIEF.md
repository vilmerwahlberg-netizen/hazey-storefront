# Task 19: adminbrief för Chrome-agenten (två temporära paketpiloter)

Syfte: skapa **två dolda, temporära paketartiklar** så att Task 19 kan prova Nyehandels verkliga paketvalidering, varukorg och Kustom-kassa från terminalen. Inget annat ska ändras.

**Får inte göras:** lägga en order, ändra en befintlig produkt, pris eller lagersaldo, skapa en kampanj, röra tema 3 eller något temafält.

Gemensamt för båda piloterna:
- **Artikeltyp:** Paketartikel (i API:t `type: package`, "has no stock of its own").
- **Synlighet:** ingen kategori, ingen produktsamling. *Inaktivera för sökindex* = på. Inte "Nyhet". Inget i menyer.
- **Pris:** exakt det angivna, inkl. moms (det korrekta paketpriset).
- **Obs:** även en dold produkt kan nås via sin direktlänk på den skarpa sajten så länge den är aktiv. Därför avpubliceras den direkt efter testet (se sist).

## P1. Variantblandning: Core vapes 3-pack

1. Produkter → **Ny produkt**
   - Namn: `PILOT T19 – Hero's Core 2ml – 3-pack`
   - Artikelnummer: `HZ-T19-CORE-3PK`
   - Pris: **1 920 kr** inkl. moms
   - Artikeltyp: **Paketartikel**
   - Spara.
2. **Lägg till produkter** → bocka *Hero's Core - 2ml* (produkt-id **255**) → Välj.
3. Försök få **tre separata rader**, var och en med 255 och antal **1**: lägg till 255 igen via "Lägg till produkter", två gånger till.
   - Om admin slår ihop dem till en rad, eller bara erbjuder antal 3: lämna **en** rad med antal 1 och spara inte fler. Rapportera exakt vad som hände (skärmbild), eftersom det är huvudfrågan.
4. Använd **inte** "Lägg till variant". Varianten ska vara olåst, alltså "kunden väljer".
5. Lager: rapportera vilka lagerfält som finns på paketet. Sätt inget saldo.
6. Spara. Rapportera **produkt-id**, **slug/URL**, skärmbild på paketraderna och skärmbild på synlighets- och sökinställningarna.

## P2. Separata produkter (valideringsprov): MS buds/hasch 3-pack

Detta bygger inte en lösning. Det är ett prov på om servern godtar strains från andra produkter på en paketrad.

1. Ny produkt:
   - Namn: `PILOT T19 – Magic Sauce 50% 5g – 3-pack`
   - Artikelnummer: `HZ-T19-MS50-3PK`
   - Pris: **1 380 kr** inkl. moms
   - Artikeltyp: **Paketartikel**
   - Spara.
2. Lägg till *Magic Sauce 50% – Yoda Ice Cream – 5g* (produkt-id **132**) på tre rader med antal 1, på samma sätt som P1 steg 3.
3. Finns det i UI:t något sätt att ge en rad **flera tillåtna produkter** (alternativ, grupp, "valbara")? Skärmbild och beskrivning. Spara inget sådant utan att rapportera först.
4. Spara. Rapportera **produkt-id** och slug.

## Efter att Task 19 meddelat "klart"

För båda piloterna: sätt produkten som **inaktiv** eller utkast (det som gör att direktlänken slutar fungera) och rapportera vad som valdes. Ta bort produkterna helt om Vilmer vill det. Ingen order har lagts, så det finns inget att återställa i lager.

## Rapportera tillbaka till Task 19

För P1 och P2: produkt-id, slug, antal rader och hur de ser ut, synlighet och sök, samt skärmbilder.
