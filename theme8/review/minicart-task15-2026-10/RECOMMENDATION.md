# TASK 15 — Minicart: riktningar och rekommendation

> **ERSATT 2026-10-30:** Dokumentet nedan bevaras som historiskt audit- och
> beslutsunderlag. Det får inte användas som visuellt implementationsfacit.
> Vilmer har godkänt v4 i `concepts-codex/`; den mappen och den uppdaterade
> `IMPLEMENTATION-PROMPT.md` vinner vid varje konflikt, inklusive fri frakt,
> bonusmål, paketsteg, strainredigering, rabattkod, summering och trust.

Båda riktningarna är renderade från **samma riktiga korg** ur Nyehandels
Vuex (Faraoh Forbidden Fruit ×1, Cart Magic Sauce Samurai Jack ×2, Buds
Samurai Jack ×1, Hash Charas ×1 på rea 425/495 kr, Vape Dual CBD 56 % ×1 →
6 varor, 2 990 kr, varav moms 598 kr, besparing 70 kr), riktiga pristrappor
(`product/state`) och Theme 8:s riktiga korsförsäljningsval. Frakt visas i
båda som "Beräknas i kassan" och ingen bonus/fri frakt nämns (se
ACCESSIBILITY-AND-ERRORS A1–A3). Trygghetsraden är bara "Skickas från
Sverige · Diskret förpackning".

Filer i `directions/` (statiska mockups, inte produktionskod):

| | A — Öppen kvittolista | B — Paketstation |
|---|---|---|
| Mobil 393 | `A-393x852.png`, helhöjd `A-393xfull.png` | `B-393x852.png`, `B-393xfull.png` |
| Mobil 320 / 430 | `A-320x640.png`, `A-430x932.png` | `B-320x640.png`, `B-430x932.png` |
| Desktop 1440 / 1920 | `A-1440x900.png`, `A-1920x1080.png` | `B-1440x900.png`, `B-1920x1080.png` |
| Tillstånd (tom, laddar, fel, lagergräns) | `A-states-393.png` | `B-states-393.png` |

## A — Öppen kvittolista

- **Komposition:** raderna ligger öppet på varm sand, åtskilda av hårlinjer;
  inga kort, inget kort-i-kort. Serif för produktnamn (som PDP), sans för
  siffror. Bild 64/72 px på beige platta.
- **Rad:** namn (max 2–3 rader), "Strain · Forbidden Fruit", styckpris; radsumma
  till höger med överstruket jämförpris endast på raden. Under: rektangulär
  antalsväljare 44 × 40 (Nyehandels knappar restylade) och textlänken
  "Ta bort".
- **Mängdpris:** högst **ett** tips per korg, på raden närmast nästa nivå:
  "Ta 3 st: 310,25 kr/st · du sparar 164,25 kr" + "Ändra till 3 st".
- **Korsförsäljning:** kompakt lista "Passar till din order" efter raderna.
- **Summering (sticky):** Frakt "Beräknas i kassan", Totalt + "Du sparar 70 kr"
  som liten olivtagg, "inkl. moms 598 kr", **orange** kassaknapp
  "Till kassan →" (samma handlingsfärg som PDP:ns "Lägg i varukorgen"),
  sedan trygghetsrad + "Fortsätt handla" på en rad. ~215 px på mobil (idag
  314–356).
- **Rörelse:** ingen ny. Ny rad tonar ut från ljus beige på 1,2 s.

## B — Paketstation

- **Komposition:** varje rad är ett vitt kort med PDP:ns paketväljare
  inbyggd: tre segment 1 st / 3 st / 5 st med pris och kr/st; valt segment
  orange ram. "Annat antal? Ändra" för fria antal. Rubrik "Din varukorg" +
  räknarpiller.
- **Summering:** mörkt olivfält med vit text, orange kassaknapp med total.
- **Korsförsäljning:** horisontell swipe-rad "Passar bra med".
- **Styrka:** gör mängdrabatten omöjlig att missa och knyter an direkt till
  den godkända PDP-paketväljaren.

## Jämförelse

| Kriterium | A | B |
|---|---|---|
| Rader synliga ovanför summeringen, 393 × 852 | ≈ 2 | ≈ 1,5 |
| Summeringens höjd mobil | ≈ 215 px | ≈ 230 px |
| Tydlig totalsumma | Stor siffra, ljus yta | Stor siffra, mörk yta (starkast kontrast) |
| Antalsändring | En kontroll per rad (Nyehandels egen) | Två mekanismer (segment + "Ändra"), otydligt när antalet är 2, 4, 7 … |
| Mängdrabatt | Ett diskret tips | Alltid synlig per rad |
| Nya skrivvägar för Theme 8 | Ingen ny (tipset återanvänder dagens PUT) | Segment = egen PUT per rad; fler osynkade lägen att hantera |
| Vue-rerender-risk | Låg: ren CSS på native rad + ett injicerat tips | Hög: injicerad kontroll i varje rad som måste speglas mot Nyehandels antal |
| Lager | Lagergräns som statusrad, + spärras | Segment över lagret måste beräknas och spärras per variant |
| Systemkänsla | Delar PDP:ns sand, serif och orange köpaction; bryter med avvisade kortmönstret | Delar PDP:ns paketväljare; men vita kort på beige + mörkt fält är närmare den avvisade kortvärlden |
| Desktop | 440 px, samma tempo som mobil | 500 px för att segmenten ska få plats |

## Rekommendation: **A — Öppen kvittolista**

**CRO.** Korgens uppgift är att bekräfta och skicka vidare. A ger den högsta
andelen synliga rader, en ensam stark handling (orange, samma färg som köpet
på PDP:n) och en kort, lugn summering. Mängdrabatten finns kvar som ett
riktat tips där den ligger närmast att löna sig, vilket ger uppsäljning utan
att varje rad blir ett nytt beslut. B maximerar paketexponeringen, men
gör korgen till en andra produktsida och lägger beslutstyngd mellan kunden
och kassan. Det är en hypotes som bör A/B-testas senare, inte startläget.

**Tydlighet.** A har en antalskontroll per rad och ett tydligt "Ta bort" i
text. B:s segment kan inte visa godtyckliga antal (2, 4, 7) utan en andra
kontroll, och "inget segment valt" är ett förvirrande läge (se
`B-393x852.png`, Cart ×2).

**Genomförande.** A är i huvudsak CSS över Nyehandels egen DOM plus
korrigering av befintliga injiceringar (`syncUpgrades`, `syncSummary`,
`syncTrust`, `syncGoals`) och ett nytt fel-/väntelager. Inga nya
skrivvägar. B kräver en ny injicerad kontroll i varje Vue-renderad rad
med egen PUT, lagerberäkning per segment och spegling mot Nyehandels
optimistiska antal – exakt den zon där dagens defekter (A4, A5) uppstår.

## Beslut som krävs före implementation

> Punkterna nedan är historiska och inte längre öppna designfrågor. Se det
> godkända v4-kontraktet i `concepts-codex/README.md`.

1. **Riktning:** A (rekommenderad) eller B.
2. **Frakt i minicarten:** ska minicarten visa "Frakt: Beräknas i kassan"
   och ingen fri frakt-mätare tills Nyehandels fraktsätt är ändrat och
   verifierat (ADMIN-TODO 1–3)? Rekommenderat: ja, även i previewn.
3. **Bonus 150 kr:** ta bort all bonustext ur minicarten tills mekanismen
   finns i Nyehandel (ADMIN-TODO 4)? Rekommenderat: ja.
4. **Trygghetsrad:** bara "Skickas från Sverige · Diskret förpackning", eller
   finns belägg för "Trygg betalning"?
5. **Kassaknappens färg:** orange (samma som PDP:ns köp, rekommenderat) eller
   behålla oliv?
6. **Mängdpristips:** högst ett per korg (rekommenderat), ett per rad, eller
   inget?
7. **Korsförsäljning:** behålla "Komplettera din order" (max 3, efter raderna)
   eller ta bort ur minicarten för att hålla den kort? Rekommenderat: behålla,
   men i kompakt form efter raderna.
8. **"Dela varukorg":** behålla som liten länk, eller dölja visuellt? (Native
   funktion, fungerar.) Rekommenderat: behålla, nedtonad, efter kassaknappen.
9. **Datafix i admin:** produktnamnet "Vape Dual … Blueberry Banana &amp;
   Tequila Sunrise" innehåller en kodad entitet. Ska Theme 8 avkoda vid
   visning, eller rättas namnet i admin (eller båda)?
