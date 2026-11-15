# THCA: gamla /thca/ mot nya kunskapssidan (före/efter)

Gren `feat/theme8-thca-knowledge` från `origin/dev` (`1b2f188`), 2026-11-15.

Gamla sidan lästes i sin helhet 2026-11-15 via `https://www.hazey.se/thca/`, med HTML hämtad läsande och inga klick. Nya sidan är `theme8/blocks/thca.html`. Ingen sida är skapad i Nyehandel, och omdirigeringar, kategorier och WooCommerce är orörda.

**Markering:** **Behåll** = samma sakuppgift. **Förbättra** = samma avsikt, bättre eller exaktare text. **Faktakontroll** = kräver källa. **Beslut** = Vilmer avgör. Inget gammalt innehåll är borttaget tyst. Allt som inte står på sidan ligger som HTML-kommentar i blocket eller i tabellerna nedan.

## 1. Titel, meta, URL

| Gammalt | Nytt | Markering |
|---|---|---|
| Titel: "THCA är förbjudet - Lagliga alternativ i Sverige hos Hazey.se" | Förslag: "THCA i Sverige – vad det är, rättsläge och alternativ \| Hazey" | **Beslut.** "Lagliga alternativ" är en generell laglighetsstämpel utan separat produkt- och ämneskontroll. Förslaget täcker `thca`, `vad är thca`, rättsläge och alternativ. |
| Meta: "THCA narkotikaklassades i Sverige 14 juli 2026. Vi har Sveriges lagliga alternativ, THCB, Magic Sauce, Nano, CBD, CBN & CBG - Sedan 2023." | Förslag: "Vad är THCA? Fakta om tetrahydrocannabinolsyra och rättsläget: delta-9-THCA-A är narkotikaklassat i Sverige sedan 14 juli 2026 (SFS 2026:1109). Se serierna i vårt aktuella sortiment." | **Beslut** av samma skäl. "Sedan 2023" och listan med cannabinoider är inte kontrollerade. |
| Canonical `https://www.hazey.se/thca/` | `/sv/page/thca` (förslag) | **Beslut.** `/sv/page/thca` och `/thca` har i dag en 301 till `/sv/categories/thca` i Nyehandel. Kategorin "THC-A" har 0 produkter. Slug, 301 och den gamla `/produkt-kategori/thca/` hanteras separat i admin, och inget är ändrat. |
| H1: "THCA i Sverige – Vad det är, hur det funkar." | H1: "THCA", tagline "Fakta, rättsläge och alternativ". Taglinen visas på mobil, är dold på desktop som i referensen och står i titeln. | **Förbättra.** Samma avsikt, kortare H1 enligt den valda designen. "i Sverige" täcks av titel, rättslägesnotis och H2. |

## 2. Rubriker och faktastycken

| Gammalt stycke | Nytt | Markering |
|---|---|---|
| Hero: "Fri frakt från 499 kr / Skickas från Sverige / Alltid diskreta paket" | Står inte på sidan | **Faktakontroll/beslut.** Fraktgränsen i Nyehandel är inte kontrollerad. Den globala sidfoten har "Diskret frakt" och "Skickas från Sverige". |
| H2 "Vad är THCA?" | H2 "Vad är THCA?" (ledraden) | **Behåll** |
| "THCA, eller tetrahydrocannabinolsyra, är en naturligt förekommande cannabinoid som finns i rå hampa och cannabisplantor." | Samma uppgift: kort svar, FAQ 1 och kapitlet "THCA och THC" | **Behåll** |
| "Det är den ursprungliga formen av den mer kända föreningen THC" | "Den är förstadiet till THC." | **Behåll** |
| "– men THCA är inte klassad som psykoaktivt i sitt naturliga tillstånd." | Står inte på sidan (kommentar i blocket) | **Faktakontroll.** Ett effektpåstående som kräver källa. |
| "Men har blivit narkotikaklassat i Sverige." | Notisen i heron, "Rättsläget i korthet" och kapitlet "Är THCA lagligt i Sverige?" med exakt ämne och källa | **Förbättra** |
| "Intresset för THCA har ökat snabbt … särskilt populärt inom forskning, odling och som samlarobjekt." | Står inte på sidan (kommentar) | **Beslut.** Saknar källa. |
| Punkt: "THCA finns naturligt i rå industrihampa" | Kapitlet "THCA och THC" | **Behåll** |
| Punkt: "nära besläktad med THC – men har en helt annan profil i sitt naturliga tillstånd" | Släktskapen är kvar: förstadium, och kan omvandlas till THC vid nedbrytning eller upphettning. "Annan profil" står inte på sidan. | **Förbättra/faktakontroll.** Omvandlingen står i gamla FAQ:n. |
| Punkt: "Används ofta inom studier, kvalitetsanalys och växtbevarande syften" | Står inte på sidan (kommentar) | **Beslut.** Saknar källa. |
| Punkt: "Var laglig i Sverige fram tills 14 juli 2026" | Rättsläget med datum, ämne och källa | **Förbättra** |
| "Handla tryggt hos Hazey.se … Du handlar alltid produkter som är lagliga i Sverige, noggrant kontrollerade …" | Står inte på sidan (kommentar) | **Beslut.** En generell laglighetsstämpel. |
| H2 "Varför handla från Hazey.se?" med fem punkter: lagliga produkter med labbanalys, garanterad leverans, kundtjänst i världsklass, "100 % tryggt", "50000+ nöjda kunder" | Står inte på sidan (kommentar) | **Beslut.** Kräver verifierade värden. CLAUDE.md förbjuder ogrundade trust-siffror. |
| — | Nytt: kapitlet "Hazey och THCA". Hazey sålde THCA som teknisk och dekorativ produkt och slutade efter 14 juli 2026. | Hämtat från gamla FAQ 2 och 4 |

## 3. Rättsläge (eget avsnitt högt upp)

| Gammalt | Nytt |
|---|---|
| H2 "Är THCA lagligt i Sverige?" med två stycken och "från och med 14 Juli 2026 så narkotikaklassades ämnet THCA i Sverige" | **Hero:** notisen "Delta-9-THCA-A är narkotikaklassat i Sverige sedan 14 juli 2026." med länken "Källa: SFS 2026:1109". |
| | **Ledraden:** panelen "Rättsläget i korthet" med ämne, klassning och källa. |
| | **Kapitlet** H2 "Är THCA lagligt i Sverige?": "Nej, inte delta-9-THCA-A …", förordning (1992:1554), SFS 2026:1109, utfärdad 11 juni 2026. Ingen bedömning av andra ämnen eller produkter. "Hazey säljer därför inte THCA." |
| "📘 För juridiska uppdateringar, se: 🔗 Regeringens Socialdepartements Uttalanden" (regeringen.se/…/socialdepartementet/) | Kvar som källrad "Socialdepartementet" med samma länk, plus SFS-PDF:en. |

Källan är kontrollerad i PDF:en 2026-11-15:

- **Dokument:** "Förordning om ändring i förordningen (1992:1554) om kontroll av narkotika".
- **Utfärdad:** 11 juni 2026.
- **I kraft:** "Denna förordning träder i kraft den 14 juli 2026."
- **Ämnet i bilagan:** "6a,7,8,10a-tetrahydro-1-hydroxi-6,6,9-trimetyl-3-pentyl-6H-dibenso[b,d]pyran-2-karboxylsyra (delta-9-THC-syra A, delta-9-THCA-A)".

Sidan påstår inte att Magic Sauce, THCbA eller Nano11 är lagliga.

## 4. FAQ

| Gammal fråga och svar | Nytt svar | Markering |
|---|---|---|
| Vad är THCA? "tetrahydrocannabinolic acid … naturligt förekommande i rå hampa och cannabis. I sitt naturliga tillstånd är THCA inte psykoaktiv." | Definition plus "förstadiet till THC" | **Behåll/faktakontroll.** Psykoaktivitet står inte på sidan. |
| Är THCA lagligt i Sverige? "Nej, THCA narkotikaklassades … 14 juli 2026. Vi har därför slutat sälja THCA." | "Nej, inte delta-9-THCA-A. Ämnet är narkotikaklassat … sedan 14 juli 2026 enligt SFS 2026:1109. Hazey säljer därför inte THCA." | **Förbättra** |
| Vad är skillnaden mellan THCA och THC? "förstadiet till THC och är inte psykoaktivt. Först vid nedbrytning kan det hända att THCA omvandlas till THC." | "förstadiet till THC. Vid nedbrytning, till exempel genom upphettning, kan THCA omvandlas till THC." | **Behåll/faktakontroll** (psykoaktivitet) |
| Vad används THCA till? "främst i forskning eller som samlarobjekt. På Hazey sålde vi det som en teknisk och dekorativ produkt." | "Hazey sålde tidigare THCA som en teknisk och dekorativ produkt. Sedan … 14 juli 2026 säljer vi inte THCA." | **Beslut.** "forskning eller samlarobjekt" saknar källa. |
| — | Ny: Vilka alternativ till THCA finns hos Hazey? (Magic Sauce, THCbA, Nano11, inga laglighetspåståenden) | Ny |
| — | Ny: Vad ändrades 14 juli 2026? (SFS 2026:1109) | Ny |

## 5. Länkar, produkter och artiklar

### Interna länkar

| Gammal länk | Ny |
|---|---|
| Hero-CTA "Se ersättare till THCA" (visas inte längre i gamla HTML:en) | "Se alternativ" går till `#alternativ` |
| "Hitta alternativ" → `/bastsaljare-vapes-laglig-cannabis-i-sverige/` | "Se bästsäljare" → `/sv/page/vara-bastsaljare` (200) |
| Produktlänkar `/produkt/…` (28 st) | Se tabellen nedan |
| Menylänkar i WooCommerce-headern | Theme 8:s globala header och sidfot |
| — | Nya länkar: seriernas kategorier, `/sv/page/faq`, `/sv/posts` och två THCA-artiklar |

### "Alternativ till THCA": 28 dynamiska produktträffar

Gamla listan var en WooCommerce-fråga: 21 Magic Sauce, 6 Nano11 och 1 startpaket, med lagersaldo som "6 av 9 i lager" och "Endast 42 kvar". Den klistras inte in statiskt. I stället:

- Tre serievägar till de verifierade kategorierna:
  - `/sv/categories/magic-sauce` (22 produkter, 17 i lager)
  - `/sv/categories/thcba` (1 produkt, 0 i lager)
  - `/sv/categories/nano-11` (17 produkter, 6 i lager)
  - Värdena gäller 2026-11-15. Antal och lägsta pris hämtas live. 0 i lager visas som "Tillfälligt slut i lager".
- Sortimentsledet "I lager från serierna": Nyehandels egna kort ur samma tre kategorier, bara i lager och varvade per serie. 32 kort 2026-11-15.
- Alla gamla produkter som finns i Nyehandel nås via sin serie. Startpaketet "M3b Pro Batteri + 2× Magic Sauce" ingår inte i någon av de tre serierna och visas inte.
- THCX-varianter är inga huvudvägar, enligt uppdraget.

### Artikelutdrag: 27 artiklar

Alla 27 slugs finns i Nyehandel under `/sv/post/{slug}` (kontrollerat 2026-11-15). Sidan visar två THCA-artiklar plus "Alla artiklar" (`/sv/posts`):

| Gammal artikel | På sidan? | Varför |
|---|---|---|
| THCA – Är det lagligt? (2026-06-21) | **Ja** | THCA-rättsläge, aktuell |
| Vad är THCA? – Uppdaterad juridisk status i Sverige (2026-02-19) | **Ja** | THCA, aktuell |
| Vad är Nano11? (2026-07-22) | Nej (korrigerat 2026-11-15) | **Beslut (Vilmer).** Den importerade artikeln anger fel datum för THCA-klassningen och gör breda laglighetspåståenden, så den lyfts inte fram från THCA-sidan just nu. Artikeln är inte ändrad eller raderad i Nyehandel eller någon annanstans. Den nås fortfarande via "Alla artiklar". Nano11 som serieväg står kvar. |
| Är Nano 11 lagligt? (2026-07-17) | Nej | **Beslut.** Laglighetspåstående om en alternativserie. |
| Vad är Nano10? / Nano10 – Är det lagligt? / 7 anledningar … Nano9 och Nano10 / Är Nano9 lagligt? / Vad är Nano 9? | Nej | Äldre Nano-generationer, inte THCA. Laglighetspåståenden. |
| Vad är THCNM? / THCNM – Allt du behöver veta | Nej | Annat ämne. Innehåller effektpåståenden ("psykoaktiva effekter"). |
| Folkhälsomyndigheten begär nya regler (2024) | Nej | Äldre regleringsförslag, inte om THCA |
| Hazey x Tatra Hemp | Nej | Inaktuell rättsinformation enligt artikelns egen notis |
| Är THCB lagligt? / Vad är THCB? / Vad är 10-OH-HHC? / Är CBN lagligt …? / Vad är THC-V …? / Vad är CBG …? / H4CBD … / Industricertifierad hampa och THCP / Är THCP lagligt? / HHC … | Nej | Andra ämnen. Flera har daterade laglighetsbesked eller "olagligt sedan"-notiser. |
| 15 fakta om THC-alternativ | Nej | Utdraget nämner "potential inom medicin" |
| Vad är Terpener? / EU-Certifierad Hampa / Infästning och standardgänga | Nej | Inte THCA |

Alla finns kvar i biblioteket. Inga artiklar ändras.

## 6. Sökavsikter (GSC 12 aug–12 nov 2026, `/thca/`)

| Fråga (klick) | Besvaras av |
|---|---|
| thca (1 161), thc a (173), thc-a (68) | H1 "THCA", titeln, H2 "Vad är THCA?" och FAQ. Stavningen THC-A finns i artikeln som länkas. |
| vad är thca (15) | H2 "Vad är THCA?", FAQ 1, kapitlet "THCA och THC" |
| thca sverige lagligt (27), är thca lagligt (26), är thca lagligt i sverige (22), thc-a lagligt (20), thca lagligt (14), thca olagligt (10) | Notisen i heron, "Rättsläget i korthet", H2 "Är THCA lagligt i Sverige?", FAQ 2 och 6. Svaret är tydligt: "Nej, inte delta-9-THCA-A" med källa. |
| Alternativ (köpavsikt, gamla kategorin) | H2 "Alternativ till THCA", tre serievägar, sortimentsledet, FAQ 5 |

Shoppingfrågorna för `/produkt-kategori/thca/` (thca sverige 293, thca vape sverige 63, thca köpa 30 …) behandlas separat. Den kategorins 301-mål är ett eget beslut.

## 7. Öppna beslut och faktapunkter

1. Titel och meta. Får "lagliga alternativ" stå med? Förslaget ovan undviker det.
2. Slug och omdirigering: `/sv/page/thca` och `/thca` → `/sv/categories/thca` (301 i dag), samt 301-mål för `/thca/` och `/produkt-kategori/thca/` på den gamla domänen.
3. Psykoaktivitet ("inte psykoaktivt i naturligt tillstånd") kräver källa. Annars står det inte på sidan.
4. "forskning, odling, samlarobjekt" och "studier, kvalitetsanalys" kräver källa eller stryks.
5. "Varför handla från Hazey.se?": labbanalys, garanterad leverans, "100 % tryggt", "50000+ nöjda kunder", fri frakt från 499 kr. Varje värde behöver verifieras.
6. THCbA har 0 produkter i lager just nu. Vägen visar det ärligt, men vill du ha THCbA som en av tre huvudvägar tills lagret är påfyllt?
7. Nano11-artiklarna ("Vad är Nano11?" och "Är Nano 11 lagligt?") länkas inte från THCA-sidan. "Vad är Nano11?" har fel datum för THCA-klassningen och breda laglighetspåståenden. Artiklarna behöver redigeras innan de kan länkas härifrån (inte gjort).
8. Kustbilden i heron är THCX-sidans produktfria bild (`landing-thcx/coast-editorial-*`). Den delas med THCX-uppslaget.
