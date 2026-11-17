/* Författat produktinnehåll per produkt-id (MS 2 ml-piloten, 2026-11-16).
   Bara produkter som står här får kapitlen i 85d-pdp-chapters.js; alla
   andra behåller standardflödet i 85-pdp-pilot.js. Ingen text här kopieras
   mellan produkter -- en ny produkt får en egen post med egen, granskad
   copy. Siffror, strains, lager, priser och omdömen skrivs ALDRIG här: de
   läses live (token i {klamrar} fylls av 85d ur Nyehandels data).

   Källa och granskningsunderlag:
   HZY/design/top30-paritet-2026-11-16/nasta-batch/MS-2ML-SEO-FIRST-DESIGN.md
   och theme8/review/ms2ml-pdp-pilot-2026-11/TEXT-DIFF.md (radvis före/efter).

   Tokens: {name} produktnamn (H1), {brand} varumärke, {size} volym ur
   namnet, {type} produkttyp, {count} antal strains, {some} tre strains,
   {all} alla strains, {instock} strains i lager, {unit} styckpris,
   {packs} paketraderna, {compare} länk till jämförd produkt,
   {analysis} analysläget (dokumentlänk eller "på begäran").

   Fält:
   - trust: "terms" = köpytans fraktgräns ersätts med länk till villkoren.
   - specs: whitelista över produkttextens egna specifikationsrader som
     lyfts till Specifikationer (övriga rader står kvar i produkttexten).
   - analysis: ytan listar produkttextens egna PDF-länkar (läses live).
     Ett gemensamt intyg läggs in först när det är identifierat.
   - chapter.sections: vilka delar av produkttexten som visas öppet
     (matchas mot textens egna rubriker); resten ligger i Full
     produktinformation, i originalordning.
   - factcheck: befintliga formuleringar som markeras i granskningsläget.
   - more.sources: vapekategorier i prioritetsordning för karusellen;
     preferBrand = samma tillverkare först inom varje källa. */
(function () {
  "use strict";
  var HZ8 = window.HZ8;
  HZ8.pdpContent = {
    261: {
      trust: "terms",
      summary: {
        h: "Vad är Magic Sauce 3.0?",
        text: "Magic Sauce 3.0 – 2 ml är en {type} från {brand}. Den finns i {count} strains, bland annat {some}. Du väljer strain och paket i köpdelen ovan."
      },
      cues: ["type", "size", "brand", "strains"],
      strains: {
        h: "Strains och analys",
        lead: "Alla strains i Magic Sauce 3.0 – 2 ml. Välj en för att gå till köpdelen."
      },
      /* Inget gemensamt intyg är identifierat (2026-11-16). Ytan listar
         exakt de PDF:er som står i produktbeskrivningen, med sina egna
         länktexter -- inget kopplas till vald strain eller till hela
         produkten. */
      analysis: {
        h: "Labbrapporter",
        text: "Det här är de {docs} PDF-dokument som finns i produktbeskrivningen i dag. De är namngivna efter strain."
      },
      chapter: {
        h: "Om Magic Sauce 3.0 och Magic Farmers",
        specsH: "Specifikationer",
        fullH: "Full produktinformation",
        fullNote: "Produktinformation, labbrapporter, laglighet och ansvar, källa",
        /* Illustrativ stämningsbild (Vilmer 2026-11-16), ursprung och
           bearbetning: assets/knowledge-hub/README.md. Visar ingen produkt. */
        image: { desktop: "knowledge-hub/kustljus-1100.webp", mobile: "knowledge-hub/kustljus-band-932.webp", w: 1100, h: 619 },
        /* Grupper ur produkttexten (matchas mot deras EGNA rubriker). */
        sections: [
          { col: "a", match: [/vape från magic farmers/i, /^vad är magic sauce/i] },
          { col: "b", match: [/^om magic farmers/i] }
        ]
      },
      /* Befintliga formuleringar som ska faktagranskas (markeras bara i
         granskningsläget ?hz8-factcheck=1). */
      factcheck: [
        { re: /semisyntetisk[a]? cannabinoidblend/i, why: "sammansättning/terminologi ej beslutad" },
        { re: /Baserad på EU-certifierad industrihampa/i, why: "ursprung" },
        { re: /EU-certifierad industrihampa/i, why: "ursprung" },
        { re: /utvecklad genom avancerade laboratorieprocesser/i, why: "process" },
        { re: /noggrant utvalda naturliga och syntetiska cannabinoider/i, why: "sammansättning" },
        { re: /naturliga och syntetiska cannabinoider/i, why: "sammansättning" },
        { re: /Varje sats testas i oberoende laboratorier för renhet, kvalitet och spårbarhet\./i, why: "testning per sats" },
        { re: /utan behov av påfyllning eller uppladdning/i, why: "laddning ej bekräftad" },
        { re: /noggrant kontrollerad för konsekvent kvalitet i varje sats/i, why: "testning per sats" },
        { re: /uppdaterad formula och förbättrad stabilitet/i, why: "jämförande påstående" },
        { re: /europeiskt varumärke specialiserat på högkvalitativa cannabinoidprodukter inom lagliga ramar/i, why: "ursprung/laglighet" },
        { re: /forskning, laboratorietestning och produktutveckling/i, why: "forskning/testning" },
        { re: /i framkant av den europeiska legala cannabinoidmarknaden/i, why: "laglighet/jämförande" },
        { re: /Avsedd för industriella, tekniska samt prydnads- och samlarändamål\. Ej för konsumtion\./i, why: "juridisk formulering" },
        { re: /följer gällande svensk lag vid försäljningstillfället/i, why: "laglighet" },
        { re: /innehåller mindre än 0,3\s?% THC/i, why: "THC-halt" },
        { re: /efterlever noggrant svenska lagar för att erbjuda en laglig och ansvarsfull cannabinoidupplevelse/i, why: "laglighet" },
        { re: /99% Magic Sauce 3\.0/i, why: "99 %" },
        { re: /Semisyntetisk cannabinoidblend/i, why: "sammansättning" },
        { re: /Svalt, mörkt och helst stående/i, why: "förvaring" },
        { re: /Tillverkad av industrihampa enligt EU-regelverk \(<0,3 % THC\)\./i, why: "THC-halt/ursprung" },
        { re: /Uppfyller gällande svensk lag vid försäljningstillfället\./i, why: "laglighet" }
      ],
      specs: ["Produkttyp", "Innehållsmängd"],
      compare: { href: "/sv/products/magic-sauce-vape-5ml", label: "Magic Sauce 3.0 – 5 ml" },
      faq: {
        h: "Vanliga frågor om Magic Sauce 3.0 – 2 ml",
        items: [
          { q: "Vilka strains finns i Magic Sauce 3.0 – 2 ml?", a: "Produkten finns i {count} strains: {all}. {instock} Lagerstatus för varje strain visas i köpdelen." },
          { q: "Vad är skillnaden mellan 2 ml och 5 ml?", a: "Skillnaden är innehållsmängden: 2 ml eller 5 ml. Pris, strains och lager visas på respektive produktsida – se {compare}." },
          { q: "Finns det labbrapporter för Magic Sauce 3.0 – 2 ml?", a: "{analysis}" },
          { q: "Vad är en engångsvape?", a: "En engångsvape är en färdig enhet som används som den levereras och inte fylls på. Fler finns bland {allvapes}." },
          { q: "Vilket paket ska jag välja – 1 st, 3-pack eller 5-pack?", a: "{packs}", needs: "packs" },
          { q: "Hur skickas och returneras min beställning?", a: "{delivery}" }
        ]
      },
      more: {
        h: "Upptäck fler vapes",
        sources: ["/sv/categories/ms-vapes", "/sv/categories/alla-vapes"],
        preferBrand: true,
        /* THCaB/THCA-B marknadsförs inte just nu (TASK 23b) -- visas inte i
           just den här karusellen. Katalogen ändras inte. */
        exclude: /\bTHCA-?B\b|\bTHCaB\b/i,
        all: { href: "/sv/categories/alla-vapes", label: "Alla vapes" },
        limit: 10
      },
      reviews: { h: "Kundomdömen" }
    }
  };
})();
