# Task 19: Chrome-agenten (version 2)

Del A och C är **läsande**. Där får du inte trycka Spara, skapa något, ändra tema 3, lägga en order eller använda Vilmers Chrome-session om en annan agent arbetar i den. Del D är **adminsteg för senare** och får bara köras efter ett uttryckligt godkännande från Vilmer.

Svara per id: Ja / Nej / Oklart / "Kräver adminpilot", plus en skärmdump eller det exakta fältnamnet.

## A. Admin, läsande

**A1. Samma produkt på flera paketrader?** Enligt supportartikeln öppnas produktvalet först efter Spara på en ny paketartikel. Kontrollera ändå: finns det en befintlig produkt med artikeltyp *Paketartikel* (filtrera på artikeltyp i produktlistan)? Om ja: öppna den och beskriv raderna (produkt, antal, variant, låst) utan att spara. Om nej: svara "Kräver adminpilot".

**A2. Fält per paketrad.** Samma vy: exakta etiketter för antal, variant, låst/valfri, och om det finns något fält som *Valbara produkter*, *Alternativ* eller *Grupp*. Det är ett tecken på val mellan produkter.

**A3. Paketets lager.** Finns *Köpbar baserat på delar* eller liknande (API-fältet heter `parts_buyable`)? Har paketvarianten ett eget lagersaldo, och kan lagerspårning stängas av för den?

**A4. Dölja en pilotprodukt.** Läs vilka val som finns på en produkt: utkast (*Utkast av en produkt*), *Inaktivera för sökindex*, synlighet och kategorier. Kan en produkt i utkast öppnas eller köpas med preview-parameter? Svara bara om det står i admin, testa inte.

**A5. Omdirigeringar.** Finns en vy för URL-omdirigeringar (301)? Ange var. Det behövs för alternativ 1.

**A6. Artikeltyp på befintlig produkt.** Öppna produkt 167 (MS50 3-pack, bara visa). Kan artikeltypen ändras, eller är den låst?

## B. Frågor till Nyehandels support

**B1.** "Kan en rad i en paketartikel låta kunden välja mellan flera *olika produkter*, till exempel 'välj 3 av dessa 17 produkter'? Eller är varje rad alltid knuten till en produkt där kunden bara väljer variant? Om det går: hur ställs det in, och tar paketet då paketartikelns fasta pris?"

**B2.** "När en paketartikel säljs: dras lagret från de valda barnvarianterna, från paketvarianten eller från båda? Validerar servern att `packageProductVariants[].id` hör till radens produkt och att lagret räcker summerat över raderna och över antal paket? Hur visas de valda varianterna på ordern i admin, i orderbekräftelsen och i Klarna/Walley-orderraderna?"

**B3.** (Om B1 = nej.) "Kan ni bygga en paketrad med en lista av tillåtna produkter, med samma prissättning och lagerdrag som dagens paketrader? Tidsplan och kostnad?"

## C. Theme 8-previewn, läsande (`?preview=v9kzdmqz4w60l5n`)

**C1.** Öppna `/sv/products/thc-x-vape-hero-core-2ml?preview=v9kzdmqz4w60l5n` (produkt 255). Kör i konsolen: `HZ8.store().state.product.packageVariants`. Förväntat: `[]`. Det bekräftar att Vuex-modulen finns i previewn.

**C2.** (Efter D1.) På pilotens PDP i previewn: `HZ8.store().state.product.packageVariants.map(v => ({id: v.id, pivot_id: v.pivot_id, product: v.product_id}))`. Notera de tre `pivot_id`-värdena. Notera också om `POST /frontend-api/product/state` för pilot-id:t innehåller nycklar som `package_products`, `pivot` eller `parts`.

## D. Adminsteg för senare (bara med Vilmers godkännande, aldrig i tema 3:s fält)

### D1. Variantpilot: Core vapes 3-pack
1. Produkter → **Ny produkt**. Namn `PILOT – Hero's Core 2ml – 3-pack`, artikelnummer `HZ-CORE-3PK-PILOT`, försäljningspris **1 920 kr** inkl. moms, artikeltyp **Paketartikel**. Ingen kategori. **Spara.**
2. **Lägg till produkter** → bocka *Hero's Core - 2ml* (id 255) → **Välj**. Upprepa så att 255 ligger som **tre separata rader med antal 1**.
   - **STOPP** om admin bara ger en rad med antal 3. Rapportera "A1 = nej". Ingen blandning är då möjlig, och inget mer ska sparas.
3. Lämna **Lägg till variant** orört, så att ingen variant blir låst.
4. Lager: om *Köpbar baserat på delar* finns, slå på den. Om inte: **STOPP** och rapportera fälten (A3). Hitta inte på ett lagersaldo.
5. Dölj: ingen kategori, *Inaktivera för sökindex*, utkast om A4 visar att previewn ändå fungerar.
6. **Spara.** Rapportera produkt-id, paketvariantens id och SKU. Kör C2.

### D2. Separat-produkt-pilot: MS buds + hasch 3-pack (bara om B1 = ja)
Som D1, men namn `PILOT – Magic Sauce 50% 5g – 3-pack`, artikelnummer `HZ-MS50-3PK-PILOT`, pris **1 380 kr**. Tre rader som var och en tillåter de 17 produkterna i `GROUP-MATRIX.md` (`ms-bh:buds+hasch:495`) på det sätt Nyehandel anger i svaret på B1. Inga andra produkter.

### Rör inte
Befintliga 145/147/159/162/166/167/169/170 och de andra importerade paketprodukterna, priserna på basprodukterna och lagersaldon.
