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
    },

    /* Hero's Core 2 ml (2026-11-17). Egen copy; inget från MS-posten.
       Underlag: theme8/review/herocore-pdp-2026-11/KARTLAGGNING.md.
       Ny copy säger bara det som går att läsa ur Nyehandels data
       (namn, varumärke, typ, volym, strains, lager, paket). Inga halter,
       ingen cannabinoidterminologi ("Core"/"THCX" ej beslutat), inga
       laglighets- eller testpåståenden. */
    255: {
      trust: "terms",
      summary: {
        h: "Vad är Hero's Core?",
        text: "Hero's Core är en {type} på {size} från {brand}. Du kan välja mellan {count} strains, till exempel {some}. Strain och antal väljer du i köpdelen ovan."
      },
      cues: ["type", "size", "brand", "strains"],
      strains: {
        h: "Strains och labbrapport",
        lead: "Hero's Core – 2 ml i alla strains. Tryck på en strain så väljs den i köpdelen."
      },
      /* Ett dokument i produktbeskrivningen ("LABBTEST" -> CoA-THCX.pdf).
         Intyget anger "VAPE DISTILLATE", en batch och inget produkt- eller
         strainnamn (läst 2026-11-17) -- därför inget påstående om att det
         gäller just den här produkten eller alla strains. */
      analysis: {
        h: "Labbrapport",
        text: "Produktbeskrivningen länkar i dag till {docs} analysdokument (PDF). Det är inte namngivet efter någon strain."
      },
      chapter: {
        h: "Om Hero's Core och Hero",
        specsH: "Specifikationer",
        fullH: "Full produktinformation",
        fullNote: "Produktinformation, labbtest, laglighet och ansvar",
        /* Samma illustrativa stämningsbild som MS-piloten (ingen produkt,
           känt ursprung: assets/knowledge-hub/README.md). Egen bild för
           Hero är en öppen fråga i KARTLAGGNING.md. */
        image: { desktop: "knowledge-hub/kustljus-1100.webp", mobile: "knowledge-hub/kustljus-band-932.webp", w: 1100, h: 619 },
        sections: [
          { col: "a", match: [/^hero core vape/i] },
          { col: "b", match: [/^vad är core/i] }
        ]
      },
      factcheck: [
        { re: /nästa generation i HERO:s serie av tekniskt avancerade samlarvapes/i, why: "jämförande påstående" },
        { re: /19,34\s?% Core tillsammans/i, why: "terminologi: intyget säger THCX" },
        { re: /balanserad cannabinoidkomposition av CBD, CBN, CBG och CBC/i, why: "sammansättning" },
        { re: /totalt 95\s?% aktiva cannabinoider/i, why: "halt (en batch i intyget)" },
        { re: /CCELL® keramisk teknologi som säkerställer jämn uppvärmning och stabil funktion/i, why: "hårdvara/varumärke" },
        { re: /Varje batch analyseras av oberoende laboratorium/i, why: "testning per batch (ett intyg)" },
        { re: /avancerad cannabinoidstruktur utvecklad genom moderna laboratorieprocesser/i, why: "process" },
        { re: /noggrant kontrollerade kemiska modifieringar av ämnen från industrihampa/i, why: "process/ursprung, terminologi" },
        { re: /En laglig cannabis/i, why: "laglighet + ordet cannabis" },
        { re: /Denna produkt är laglig i Sverige vid försäljningstillfället/i, why: "laglighet" },
        { re: /baseras på industrihampa enligt EU-regelverk/i, why: "ursprung" },
        { re: /mindre än 0,2\s?% Δ9-THC/i, why: "THC-halt" },
        { re: /Hazey bevakar och efterlever noggrant svensk lagstiftning/i, why: "laglighet" },
        { re: /19,34% Core \| 30 % CBD \| 16% CBG \| 13,6% CBN \| 9,3% CBC/i, why: "halter (en batch), terminologi" },
        { re: /återvinn alltid produkten bland kompost och förpackning i plastförpackningar/i, why: "återvinningsråd" },
        { re: /inte avsedd för direkt konsumtion eller rökning/i, why: "juridisk formulering" },
        { re: /Vår produkt följer lag nr 167\/1998 §5/i, why: "lagreferens" }
      ],
      specs: ["Produkttyp", "Innehållsmängd"],
      faq: {
        h: "Vanliga frågor om Hero's Core – 2 ml",
        items: [
          { q: "Vilka strains finns i Hero's Core?", a: "Hero's Core – 2 ml finns i {count} strains: {all}. {instock} Lagret för varje strain står i köpdelen." },
          { q: "Finns det en labbrapport för Hero's Core?", a: "{analysis}" },
          { q: "Vem tillverkar Hero's Core?", a: "Hero's Core kommer från {brand}. Se {brandlink}." },
          { q: "Fylls en engångsvape på?", a: "Nej. En engångsvape är en färdig enhet som används som den kommer och inte fylls på. Jämför med {allvapes}." },
          { q: "Hur fungerar 3-pack och 5-pack?", a: "{packs}", needs: "packs" },
          { q: "Hur skickas Hero's Core och hur gör jag en retur?", a: "{delivery}" }
        ]
      },
      more: {
        h: "Fler vapes att upptäcka",
        /* Bara Alla vapes: kategorin Hero Vapes innehåller i dag även buds och
           hasch (5 g), Core Vapes bara den här produkten (2026-11-17). */
        sources: ["/sv/categories/alla-vapes"],
        preferBrand: true,
        /* Samma marknadsföringsregel som i MS-posten (TASK 23b). */
        exclude: /\bTHCA-?B\b|\bTHCaB\b/i,
        all: { href: "/sv/categories/alla-vapes", label: "Alla vapes" },
        limit: 10
      },
      reviews: { h: "Kundomdömen" }
    },

    /* D10 2 ml (2026-11-17). Egen copy; inget från MS- eller Hero-posten.
       Underlag: theme8/review/d10-pdp-2026-11/KARTLAGGNING.md. Ny copy
       säger inget om vad D10 är (textens "inte delta-10-THC" mot
       förpackningens "99% DELTA10" är en öppen fråga), inga halter, inga
       laglighets-, test- eller jämförelsepåståenden. Lager läses live --
       hela produkten var slutsåld 2026-11-17. */
    254: {
      trust: "terms",
      summary: {
        h: "Vad är D10 – 2 ml?",
        text: "D10 – 2 ml är en {type} från {brand} i {count} strains, bland dem {some}. {instock}"
      },
      cues: ["type", "size", "brand", "strains"],
      strains: {
        h: "Strains och labbrapporter",
        lead: "Varje strain i D10 – 2 ml med sitt lagerläge. En strain i lager väljs i köpdelen när du trycker på den."
      },
      /* Fem PDF:er i produkttexten, en per strain ("LABBTEST <strain>").
         Läst 2026-11-17: Cherry Sour och Kiwi Sorbet är rapporter för
         "Disposable Vape-pen – <strain> – 99% D10", var sin batch. */
      analysis: {
        h: "Labbrapporter",
        text: "Produkttexten länkar till {docs} rapporter i PDF-format. Varje rapport bär namnet på en strain."
      },
      chapter: {
        h: "Om D10 och Magic Farmers",
        specsH: "Specifikationer",
        fullH: "Full produktinformation",
        fullNote: "D10 eller Magic Sauce, laglighet, produktinformation, labbtest och ansvar",
        image: { desktop: "knowledge-hub/kustljus-1100.webp", mobile: "knowledge-hub/kustljus-band-932.webp", w: 1100, h: 619 },
        sections: [
          /* Egna sektioner: "Vad är D10?" behåller sin rubrik (sammanslagna
             grupper döljer följande rubriker). */
          { col: "a", match: [/^d10 – 2ml vape från/i] },
          { col: "a", match: [/^vad är d10/i] },
          { col: "b", match: [/^om magic farmers/i] }
        ]
      },
      factcheck: [
        { re: /mest genomarbetade cannabinoidformula/i, why: "jämförande påstående" },
        { re: /Inte en uppdatering av Magic Sauce, ett eget kapitel/i, why: "jämförande påstående" },
        { re: /komposition av semisyntetiska och syntetiska cannabinoider/i, why: "sammansättning/terminologi" },
        { re: /Samma specifikation i varje sats, testad i oberoende laboratorier och spårbar från produktion till leverans/i, why: "testning per sats, oberoende, spårbarhet" },
        { re: /99% D10 i en 2ml engångsvape/i, why: "halt" },
        { re: /ska inte förväxlas med cannabinoiden delta-10-THC/i, why: "förpackningen säger 99% DELTA10" },
        { re: /varje sats produceras identiskt, verifieras i oberoende laboratorier/i, why: "testning per sats, oberoende" },
        { re: /baseras på cannabinoider från EU-certifierad industrihampa/i, why: "ursprung" },
        { re: /striktare kvalitetskontroll i varje led/i, why: "jämförande påstående" },
        { re: /etablerat europeiskt varumärke specialiserat på avancerade cannabinoidprodukter inom lagliga ramar/i, why: "ursprung/laglighet" },
        { re: /fullständig spårbarhet, batchkontroll/i, why: "spårbarhet" },
        { re: /En laglig cannabis/i, why: "laglighet + ordet cannabis" },
        { re: /Denna produkt är laglig i Sverige vid försäljningstillfället/i, why: "laglighet" },
        { re: /efterlever noggrant svensk lagstiftning/i, why: "laglighet" },
        { re: /innehåller mindre än 0,3\s?% THC/i, why: "THC-halt" },
        { re: /Tillverkad av industrihampa enligt EU-regelverk \(<0,3 % THC\)\./i, why: "THC-halt/ursprung" },
        { re: /Uppfyller gällande svensk lag vid försäljningstillfället\./i, why: "laglighet" },
        { re: /Ej för konsumtion\./i, why: "juridisk formulering" }
      ],
      specs: ["Produkttyp", "Innehåll"],
      faq: {
        h: "Frågor och svar om D10 – 2 ml",
        items: [
          { q: "Vilka strains finns i D10 – 2 ml?", a: "Det finns {count} strains: {all}. {instock}" },
          { q: "Finns det labbrapporter för D10?", a: "{analysis}" },
          { q: "Kan jag köpa en strain som är slutsåld?", a: "Nej. Köpknappen visas bara när den valda strainen finns i lager, och ett paket går bara att välja när lagret räcker till alla platser. Lagerläget för varje strain står i köpdelen." },
          { q: "Vad kostar 3-pack och 5-pack?", a: "{packs}", needs: "packs" },
          { q: "Vilket märke gör D10?", a: "D10 är från {brand}. Se även {brandlink}." },
          { q: "Hur levereras D10 och hur fungerar retur?", a: "{delivery}" }
        ]
      },
      more: {
        h: "Andra vapes i sortimentet",
        /* D10 Vapes innehåller bara den här produkten (2026-11-17). */
        sources: ["/sv/categories/alla-vapes"],
        preferBrand: true,
        exclude: /\bTHCA-?B\b|\bTHCaB\b/i,
        all: { href: "/sv/categories/alla-vapes", label: "Alla vapes" },
        limit: 10
      },
      reviews: { h: "Kundomdömen" }
    },

    /* THCbA 47 % – Faraoh – 2 ml (2026-11-17). Egen copy; inget från MS-,
       Hero- eller D10-posten. Underlag: theme8/review/thcba-pdp-2026-11/
       KARTLAGGNING.md. Ny copy säger inget om THCbA, halter, rättsläge
       eller THCA; produkttyp och förvaring läses ordagrant ur
       produktinformationen ({typelabel}, {storage}). Ingen labbrapport
       finns i produkttexten (den skickas på begäran). Hela produkten var
       slutsåld 2026-11-17. */
    236: {
      trust: "terms",
      summary: {
        h: "Kort om Faraohs THCbA-vape",
        text: "En vape från {brand} med {size} innehåll, i {count} strains – bland andra {some}. {instock}"
      },
      cues: ["type", "size", "brand", "strains"],
      strains: {
        h: "Strains och lagerläge",
        lead: "Alla strains i THCbA-vapen från Faraoh. Finns en strain i lager väljer du den här, så följer valet med till köpdelen."
      },
      analysis: { h: "Labbrapport", text: "" },
      chapter: {
        h: "Om THCbA-vapen från Faraoh",
        specsH: "Specifikationer",
        fullH: "Full produktinformation",
        fullNote: "Formula, CCELL-enhet, laglighet, produktinformation och ansvar",
        image: { desktop: "knowledge-hub/kustljus-1100.webp", mobile: "knowledge-hub/kustljus-band-932.webp", w: 1100, h: 619 },
        sections: [
          { col: "a", match: [/^faraoh thcba vape 2ml/i] },
          { col: "a", match: [/^vad är thcba/i] },
          { col: "b", match: [/^vad är full spectrum live resin/i] },
          { col: "b", match: [/^viktig förvaringsinformation/i] }
        ]
      },
      factcheck: [
        { re: /THCA klassades som narkotika i Sverige den 14 juli 2026/i, why: "rättsläge" },
        { re: /helt ny generation naturliga cannabinoidvapes/i, why: "naturlig/jämförande" },
        { re: /47% THCbA är grunden i formulan/i, why: "halt (ingen labbrapport i texten)" },
        { re: /resterande 53%, som utgör Faraoh Signature Live Resin Blend™/i, why: "sammansättning" },
        { re: /med inspiration från cannabisplantans naturliga cannabinoidprofil/i, why: "ordet cannabis" },
        { re: /naturligt förekommande cannabinoid i Cannabis sativa/i, why: "ursprung/ordet cannabis" },
        { re: /ett eget rättsläge/i, why: "rättsläge" },
        { re: /vid försäljningstillfället laglig i Sverige/i, why: "laglighet" },
        { re: /skiljer Faraoh från traditionella vapes/i, why: "jämförande påstående" },
        { re: /Live Resin framställs av färskt eller fryst växtmaterial/i, why: "process" },
        { re: /känd för jämn uppvärmning, hög tillförlitlighet och premiumkänsla/i, why: "hårdvara" },
        { re: /THCbA är känsligt för värme/i, why: "stabilitet" },
        { re: /En laglig cannabis/i, why: "laglighet + ordet cannabis" },
        { re: /THCbA är lagligt i Sverige vid försäljningstillfället/i, why: "laglighet" },
        { re: /efterlever kontinuerligt svensk lagstiftning/i, why: "laglighet" },
        { re: /framställd av EU-certifierad industrihampa/i, why: "ursprung" },
        { re: /Tillverkad av industrihampa enligt EU-regelverk \(<0,3 % THC\)\./i, why: "THC-halt/ursprung" },
        { re: /Uppfyller gällande svensk lag vid försäljningstillfället\./i, why: "laglighet" },
        { re: /Ej för konsumtion\./i, why: "juridisk formulering" }
      ],
      specs: ["Produkttyp", "Innehåll", "Förvaring"],
      faq: {
        h: "Frågor om THCbA-vapen från Faraoh",
        items: [
          { q: "Vilka strains finns?", a: "Vapen finns i {count} strains: {all}. {instock}" },
          { q: "Är det en engångsvape?", a: "Nej. I produktinformationen står produkttypen som {typelabel}." },
          { q: "Hur ska vapen förvaras?", a: "Produktinformationen anger: {storage}." },
          { q: "Finns det en labbrapport?", a: "{analysis}" },
          { q: "Vad kostar 3-pack och 5-pack?", a: "{packs}", needs: "packs" },
          { q: "Hur skickas beställningen och hur returnerar jag?", a: "{delivery}" }
        ]
      },
      more: {
        h: "Fler vapes",
        /* THCbA Vapes innehåller bara den här produkten (2026-11-17). */
        sources: ["/sv/categories/alla-vapes"],
        preferBrand: true,
        exclude: /\bTHCA-?B\b|\bTHCaB\b/i,
        all: { href: "/sv/categories/alla-vapes", label: "Alla vapes" },
        limit: 10
      },
      reviews: { h: "Kundomdömen" }
    }
  };
})();
