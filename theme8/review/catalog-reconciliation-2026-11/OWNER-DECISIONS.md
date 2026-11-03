# Ägarbeslut som krävs (Vilmer)

TASK 17 · 2026-11-03. Varje punkt har ett rekommenderat svar. Inget av detta är beslutat i koden, utom där det uttryckligen står "gjort i TASK 17 – bekräfta".

## Gjort i TASK 17 – bekräfta

1. **D10 är inte pausad.** Beslutet 2026-08-28 pausade HHCPM, THCNM och 10-OH-THC. D10 hamnade i pausregexen (`PILOT_PAUSED`, 80-category.js) bara för att D10 då antogs vara 10-OH-THC. Produkttexten säger nu uttryckligen "ska inte förväxlas med delta-10-THC", och WooCommerce listar 9 D10-produkter. → D10 är borttagen ur pausen och är upptäckbar i relationskartan. *Rekommendation: bekräfta.*
2. **Headerns utvalda produkter** (en per meny) är bytta, eftersom de gamla produkterna inte finns: Magic Sauce 3.0 – 2ml, Magic Sauce 50% – Yoda Ice Cream – 5g, Magic Sauce 50% – KitKat – 5g, CBD 30% – Tequila Sunrise – 3,5g. Badgen är nu "UTVALD PRODUKT" i stället för "POPULÄRAST", eftersom bästsäljarsidan inte kan belägga popularitet efter importen. Namn, pris och bild är fortfarande hårdkodade (befintligt mönster). *Rekommendation: godkänn valet och låt nästa task läsa dem live.*
3. **"1/2/5 ml engångsvapes"** länkar nu till Alla Vapes med typ- och volymval (`?typ=vapes&volym=5ml`), där 1+1 ml räknas som 2 ml. *Rekommendation: bekräfta.*

## Synlighet och sortiment

4. **Paket, strainbarn och sökbara produkter i Nyehandels listningar (63 st).** De ska döljas i listningarna men finnas kvar som sidor (NYEHANDEL-VISIBILITY-ACTIONS.md A–C). *Rekommendation: ja, följ WooCommerce exakt.*
5. **THCaB har ingen kundlistad produkt.** I WooCommerce är THCaB-vapen och -carten bara sökbara och slutsålda, och THCA-B-sidan visar inga produkter. Theme 8 har THCaB som serie (hubb `thca-b`, headerlänk `thcab-vapes`, startsidans seriekort). *Alternativ: (a) behåll som slutsåld serie med informationsläge, (b) dölj serien tills lager finns. Rekommendation: (a), samma slutsåldsregel som PDP:n.*
6. **Core-familjens buds** (High Life Gelato, High Life White Widow) är bara sökbara i WooCommerce och har ingen headerlänk. *Ska de listas? Rekommendation: ja, om de ska säljas; annars behåll som direktlänk.*
7. **Hubbnamn för Core:** Nyehandels kategori heter "Hero Vapes" (H1, brödsmulor), Theme 8 kallar familjen "Core". *Rekommendation: döp om kategorin till "Core" i admin.*
8. **Legacy-länkar i headern:** HHCPM (Vapes, Buds), THCNM (Buds, Hasch) och THCV (Vapes) pekar på tomma eller olistade kategorier. De är inte borttagna eftersom innehåll inte tas bort utan lov. *Rekommendation: ta bort HHCPM- och THCNM-länkarna; THCV beror på om serien ska säljas igen.*
9. **Startsidans "THCa – Premium flower"-kort** pekar på `/thca`, som är tom (inga THCA-produkter efter migreringen). *Rekommendation: ta bort kortet eller byt till en serie med produkter (D10 har buds och hasch).*
10. **Fraktändring** ligger listad i Nyehandel (i Alla produkter). *Rekommendation: dölj helt.*
11. **Isolat** (CBD 99 %, slut, bara sökbart) återaktiveras inte. *Rekommendation: behåll dold.*
12. **Nano11 under Hasch:** det finns nu ett Nano11-hasch (Zkittlez Mousse, `nano11-hash`). Headern utelämnar Nano11 under Hasch enligt tidigare uppdrag. *Rekommendation: lägg till länken.*

## Data som måste bekräftas

13. **THCA-B-paket i THCbA-kategorin:** fyra paket med namnet "THCA-B 50% Faraoh …" ligger i WooCommerce-kategorin THCbA. Theme 8-dokumentationen klassar dem som THCaB, efter namnet och de ingående produkterna. *Bekräfta att namnet stämmer och att kategorin är fel.*
14. **D10 2ml 3-/5-pack** ligger under Magic Sauce i WooCommerce. *Bekräfta att de hör till D10.*
15. **Osäkra gamla matchningar** (STALE-ID-MAP.md): "Magic Sauce 99% 2ml/1ml" (gamla id 91/92) mot "Magic Sauce 3.0 2ml/1ml" (261/262). Används inte för omdömen eller analys förrän det är bekräftat.
16. **Magic Sauce 10 ml:** analysfilerna är COA:er för engångsvapes av samma strains. *Gäller de refillvätskan? Tills dess: "Labbrapport skickas på begäran".*
17. **Produktomdömen:** Nyehandel har 0 omdömen efter importen. *Importera Woo-omdömena (med namn och datum oförändrade, så att startsidans granskade urval fungerar igen) eller avstå?*

## Terminologi (oförändrat öppen sedan tidigare)

18. "Naturidentiskt/semisyntetiskt" kontra "fullt naturliga/halvsyntetiska": D10-texten i WooCommerce kallar formulan "semisyntetiska och syntetiska cannabinoider". Ingen ny copy är skriven i TASK 17.
19. Startsidans Magic Sauce-kort har texten "Smak. Effekt. Balans." Ordet "Effekt" kan läsas som ett effektpåstående (varumärkesrösten). Den är inte ändrad, eftersom det är copy och inte katalogdata.
