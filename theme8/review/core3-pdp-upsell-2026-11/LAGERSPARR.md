# Lagerspärr för paket (TASK 20 v4)

**Viktigt: det här är en klientspärr. Den ersätter inte servervalidering.**

## Fyndet
Nyehandels server godtog Tinky Winky × 5 i paket 267 (MS 2 ml 5‑pack), trots att variantens lager var 3. Detta enligt provet som gjordes när paketen skapades.
- Servern kan alltså inte på egen hand hindra överförsäljning via paketartiklar.
- Task 19 visade att servern nekar när lagret redan är förbrukat i korgen (`406 available: 0`) och kapar antalet paket. Ett enskilt paket som i sig överstiger lagret släpptes ändå igenom.

## Vad Theme 8 gör (85-pdp-pilot.js, `HZ8.packageStock`)

1. **Räkning.** För varje vald variant: antal platser × paketantal, plus det som redan ligger i varukorgen.
   - Korgen räknas från både vanliga rader (`variant_id × quantity`) och paketdelar (`meta.data.packageProductVariants[].quantity × radens antal`).
   - Summan jämförs med variantens `available_stock`.
   - Ospårat lager och `always_orderable` räknas som obegränsat.
   - En slutsåld variant (`variantOrderable` falsk) är alltid ett fel.
2. **I väljaren.** Ett alternativ spärras när andra platser och korgen redan tar hela lagret. Texten blir då "(inga fler i lager)", "(inga fler – N i varukorgen)" eller "(slut i lager)".
3. **Val som inte räcker** töms inte i tysthet. De markeras (orange kant på platsen), och köpknappen visar "Ändra valen – lagret räcker inte". Felet visas i klartext, till exempel:
   - "Tinky Winky: bara 3 kvar i lager – du har valt 5."
   - "Tinky Winky: 3 kvar i lager och 1 ligger redan i din varukorg – du kan välja högst 2 till."
4. **Färsk kontroll före varje varukorgsanrop.** Spärren läser `product/state` på nytt och läser om korgen. Hittar den ett problem skickas inget, och kunden ser "… Varukorgen är oförändrad." Det fångar lager som ändrats mellan sidladdning och köp.
5. **Samma spärr i minicartens "Ändra"** (84-cart.js).
   - Raden som redigeras räknas inte med i korgsumman.
   - Väljaren, slumpningen och sparandet följer spärren.
   - Vid problem sparas inget, och paketet är oförändrat.

## Vad spärren inte skyddar mot
- **Andra kunders samtidiga köp:** lagret kan ta slut mellan vår kontroll och serverns svar.
- **Direkta API-anrop och manipulerade klienter:** spärren sitter i webbläsaren.
- **Nyehandels egen paketsida** (`/sv/products/…-blandbart`):
  - Sidorna svarar 200 på direktlänk även på den skarpa sajten (`noindex, nofollow`, inte i kategorierna).
  - Där körs Nyehandels egen köpkomponent utan Theme 8:s spärr.
- **Lagerdrag vid order:** att delarnas lager faktiskt minskar vid en genomförd order är fortfarande inte bevisat.

**Slutsats:** innan paketen får synas publikt behövs något av följande:
- att Nyehandel validerar paketdelarnas lager i servern (varukorg och order);
- ett eget skydd vid ordern;
- ett uttryckligt beslut att acceptera risken.
