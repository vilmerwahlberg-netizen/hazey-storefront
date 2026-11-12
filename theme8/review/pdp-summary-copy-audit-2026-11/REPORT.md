# Task 24 – "Kort om produkten"-fix + inventering av produkttexter (2026-11-12)

Gren `fix/task-24-pdp-summary-decimal` från `origin/dev` (`eb5bb5c`). Inget är
pushat, mergat eller publicerat. Ingen produkttext i Nyehandel är ändrad.
Task 23:s filer (`03c-package-table.js`, `04-variant-cards.js`, `80-category.js`,
kategori-CSS) är orörda.

## 1. Kodfix – `theme8/js/85-pdp-pilot.js` `excerpt()`

**Rotorsak:** `match(/[^.!?]+[.!?]+(?=\s|$)/g)` kräver blanksteg efter punkt.
Vid "3.0" misslyckas matchningen, regexmotorn börjar om efter punkten och
allt före den tappas tyst: "Magic Sauce 3.0 Buds är…" → "0 Buds är…". Samma
fel slog till vid alla punkter inne i ord: "Hazey.se" → "se är…", "t.ex." → "ex.…".

**Fix:** ny `sentences()` som delar från textens början och bara vid `.!?`
följt av blanksteg + versal/siffra (eller textslut). Vanliga svenska
förkortningar (`t.ex.`, `ca.`, `bl.a.`, `inkl.` …) är inga gränser.
Utdraget är alltid ett exakt prefix av källtexten. Gränsen på ca 200 tecken
och regeln "aldrig klippt mitt i en mening" är oförändrade.

**Offline mot alla 92 publika produkters riktiga ingress:** 19 utdrag
ändras (alla från trasigt till korrekt prefix), 0 blir något annat än ett
prefix och 26 saknar ingress (ingen sektion, som tidigare). Produktnamn med
punkt (`Adios M.F.`, `London P.C.`, `Hazey.se`, `Magic Sauce 3.0`, `3,5g`)
är kontrollerade.

**Live (Theme 8-preview, `summary.mjs`):** 8 PDP:er × mobil 390 / desktop 1440 ×
före (extern loader = `origin/dev`) / efter (lokal build).
Facit = samma ingress ur serverns HTML utan JS.

| ID | Produkt | Före | Efter |
|---|---|---|---|
| 175 | MS 50% Crazy Dog (buds) | "0 Buds är…" | "Magic Sauce 3.0 Buds är…" ✅ |
| 260 | Magic Sauce 3.0 – 5ml | "0 är den senaste…" | "Magic Sauce 3.0 är…" ✅ |
| 262 | Magic Sauce 3.0 – 1ml cart | "0 Cartridge är…" | ✅ |
| 168 | MS 50% Khalifa Kush | "0 är nästa steg…" | "Magic Sauce 2.0 är…" ✅ |
| 152 | Hash MS 50% Marrakesh Dream | "0 – nästa generations…" | ✅ |
| 123 | Hazey.se Merch – Nyckelring | "se är inte bara…" | "Hazey.se är…" ✅ |
| 133 | CBD 30% Adios M.F. | ingen ingress | oförändrat ✅ |
| 215 | CBD 56% Cereal Milk + London P.C. | korrekt | oförändrat ✅ |

16/16 OK efter fixen (12/16 fel före). Skärmbilder: `proof/<id>-<vp>.png`,
data: `proof/summary.json`.

Observerat, ej åtgärdat (utanför scope): `30-bestsellers.js:192` har ett
liknande meningsutdrag. Det är förankrat i början och klipper därför aldrig
början, men kan sluta efter "t.ex.".

## 2. Inventering – metod

92 produkter med `visibilityClass` PUBLIC (77 listade + 15 direktlänkade) ur
`catalog-reconciliation-2026-11/CURRENT-CATALOG-MATRIX.json`. Beskrivningarna
hämtades live 2026-11-12 med JS avstängt (bara GET). Översikt per produkt:
`inventory.json`. **Verifierat** = står ordagrant i dagens text.
**Förslag** = min bedömning som kräver ditt beslut. Inga nya produktpåståenden
är formulerade.

Övergripande (verifierat):
- Median 2 549 tecken, max 3 826 (#125). Specifikationslistan
  ("Produktinformation:") börjar efter 70 % av texten på 53 av 91.
  **Theme 8 löser placeringen**: alla 85 listor är `<li><strong>`-listor som
  `specRows()` lyfter upp till faktarader. Problemet kvarstår i live-temat.
- 18 beskrivningar innehåller inklistrad HTML från en AI-chatt
  (`font-claude-response-body`, `text-text-100` m.fl.): 135, 137, 139, 141,
  144, 148, 172, 202, 204, 215, 217, 230, 232, 248, 250, 260, 261, 262.
- Stora textblock är identiska mellan produkter, t.ex. 6 stycken på 13
  Magic Sauce-buds och "Observera: … industriella, tekniska och
  prydnadsändamål" på 11 vapes.

## 3. Prioriterad lista

### P1 – juridik/varumärkesröst (bör beslutas först)

| # | Produkt (ID) | Verifierat problem | Förslag |
|---|---|---|---|
| 1 | MS 50% Charas (196), Hash MS 50% Marrakesh Dream (152) | "nyutvecklad syntetisk cannabinoid/molekyl som är **praktiskt taget omöjlig att spåra i labbrapporter**", "kraftfull aura". Beskriver dessutom **Magic Sauce 2.0**, medan serien i övrigt är 3.0. | Ta bort meningen om spårbarhet helt. Skriv om utifrån verifierad MS-version och labbrapport. |
| 2 | High Life Malaga Magic (137) | "THCNM … **mer kraft än traditionellt THC** … interagerar med kroppens CB1- och CB2-receptorer … intensivitet i auran" | Stryk jämförelsen med THC och receptorpåståendet. |
| 3 | Vape CBD 60% Cookies (253), Vape CBD 46% Hazey (225) | "CBD-olja används ofta inom alternativmedicin för att **lindra ångest, smärta och inflammation**", "rådfråga läkare", (253) "närvaro och avslappning", "kraftfull stämningsväxling" | Stryk effekt- och medicinstycken. |
| 4 | CBD ≈15% Russian Roulette (127) | Kliniska studier om "smärta, ångest, epilepsi", medicinsk cannabis i Colorado, "ger en ruseffekt"-jämförelser | Stryk medicinavsnitt och historik. |
| 5 | Vape H4CBD 96% Canapuff (189) | "kan vara ett **effektivt behandlingsalternativ** för en rad olika sjukdomstillstånd", "resa av lycklig aura" | Stryk. |
| 6 | Hash H4CBD+CBN H-Bomb (125) | "antiinflammatoriska, smärtstillande", "terapeutiska effekter", "ger inte samma 'hög'" | Stryk. |
| 7 | Vape THCV Euphoria (233) | "antipsykotisk effekt", "antiepileptiska, smärtstillande och aptitstimulerande", "psykoaktiva effekter" | Stryk. |
| 8 | **72 av 92** produkter (lista: `grep "laglig cannabis"` i källan; alla Magic Sauce, D10, THCA-B, Nano11, CBD, High Life m.fl.) | Underrubriken "**En laglig cannabis**" (en variant: "Magic Farmers en ledande leverantör inom laglig cannabis") och "upplevelse av laglig cannabis" (124, 125, 129, 158, 229). | Ersätt med en gemensam, godkänd laglighetsrad. Formuleringen kräver ditt beslut. |
| 9 | 17 produkter: 124, 125, 129, 152, 155, 158, 168, 171, 182, 196, 207, 229, 233, 251, 260, 261, 262 | Stycke som länkar till Folkhälsomyndighetens rapport om "cannabisbrukets effekter". Det står även på batteriet CCELL M4 (171). | Beslut: behåll det som ansvarstext eller flytta till en FAQ- eller ansvarssida. |

### P2 – sakfel och motsägelser

| # | Produkt (ID) | Verifierat problem | Förslag |
|---|---|---|---|
| 10 | MS 50% Khalifa Kush (168) | Kortbeskrivningen säger "Magic Sauce **2.0**", medan produkttexten och 12 syskon säger "Magic Sauce **3.0**". | Verifiera mot labbrapport eller leverantör och rätta. |
| 11 | Familjer med olika THC-gräns | Magic Sauce/D10/THCA-B-familjen skriver "EU-regelverk (**<0,3 %** THC)", CBD/Nano11/CBN/Hero's Core skriver "**<0,2 %**" och "0,2 % … helt laglig i Sverige". Ingen produkt motsäger sig själv. | Beslut om en enhetlig, juridiskt granskad formulering. Jag avgör inte vilken som stämmer. |
| 12 | High Life Gelato (204) | Rubrik "**Gealto**". Texten är ordagrant White Widows (#135), inklusive "framtagen av Green House Seeds … brasiliansk sativa och sydindisk indica" och "Producent: Green House Seeds". | Rätta stavningen. Ursprung och förädlare för Gelato behöver verifieras och har sannolikt kopierats fel. |
| 13 | Nano11 (191, 194, 197, 200, 208, 165) | "Nano 9 och Nano 10 satte ribban. **Nano X nådde inte upp till standarden.**" | Stryk jämförelsen med tidigare generationer. Den är föråldrad och nedvärderande. |
| 14 | Hero's Core – 2ml (255) | Titeln säger "Hero CORE", texten "**High Life CORE Vape** är nästa generation i HERO:s serie". | Beslut om korrekt namn. |
| 15 | CCELL M3b Pro (237) | "en kraftfullare **rök**" (vapebatteri) | Formulera om (förslag). |
| 16 | D10 50% buds (209, 211, 214, 223) | Ett jämförelsestycke "D10 eller Magic Sauce – vad väljer du?" står i D10-produkternas text. | Förslag: flytta till serie- eller guidesidan. |

### P3 – duplicering, längd, struktur

| # | Produkt (ID) | Verifierat problem | Förslag |
|---|---|---|---|
| 17 | Vape CBD 60% Cookies (253) | Doftlistan (4 rader) står **två gånger**. | Ta bort dubbletten. |
| 18 | CCELL Sandwave (247) | Två instruktionssteg står två gånger. | Ta bort dubbletten. |
| 19 | 18 produkter med AI-chattmarkup (se §2) | Inklistrade klassattribut och extra `<br>`. Det syns inte i Theme 8 men ökar DOM:en och ger ojämn formatering i live-temat. | Rensa HTML:en i admin vid omskrivningen. |
| 20 | 13 MS-buds (132, 134, 146, 155, 172, 175, 198, 201, 203, 221, 226, 231 + 168) | 6 identiska stycken (~70 % av texten). Bara namn, doft och spec skiljer. | Kort unik text per strain plus en gemensam seriesektion (seriehubb/FAQ). |
| 21 | Längst: 125 (3 826), 242 (3 823), 220 (3 796), 189 (3 568), 236 (3 538), 256 (3 499), 229 (3 398) | Specifikationen hamnar först efter ~75 % i live-temat. | Spec först, ingress högst ~2 meningar, resten som disclosure. Gäller främst om live-temat ska ligga kvar länge. |
| 22 | Hazey.se Merch (123), CCELL-batterier (171, 178, 212, 237, 244, 247) | Saknar "Produktinformation"-block (123) eller har annan struktur. 123: "friheten och avslappningen". | Lägg till en strukturerad spec (mått och material) när den finns verifierad. |

## 4. Kräver ditt innehållsbeslut

1. Rad 1–7: godkänn att stycken med effekt-, medicin- och spårbarhetspåståenden tas bort (borttagning av innehåll kräver ditt ja).
2. En enhetlig laglighets- och THC-formulering (rad 8 + rad 11) – juridiskt underlag behövs.
3. Folkhälsomyndighet-stycket: behåll, flytta eller stryk.
4. Magic Sauce-version på 168, 196 och 152 – verifiera mot labbrapport.
5. Gelato (204): korrekt ursprung och förädlare.
6. Namn på Hero's Core-vapen (255).
7. Mall för omskrivning efter paketarbetet: spec först, kort unik ingress, gemensam serietext utbruten.
