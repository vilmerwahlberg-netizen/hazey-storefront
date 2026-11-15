# /engangsvape/: förslag på produktnära mall (design före kod)

> **Ersatt 2026-11-15** av den byggda helsidan: `HELSIDA.md`, `theme8/blocks/engangsvape.html`. Skissen i `proposal/` och `forslag-*`-bilderna ligger kvar som historik.

Gren `feat/theme8-engangsvape-landing`, 2026-11-15. **Ingen produktionskod
ändrad.** Skissen renderas med den godkända THCX-mallen (`88b-landing`) i
preview, med ett utkastblock och en prototypmodul som bara läggs på i
renderingen (`proposal/`). Kartläggning rad för rad: `KARTLAGGNING.md`.

**Bilder:** `shots/forslag-{393,1440}-{fold,full}.webp` (förslaget),
`shots/gammal-{393,1440}-{fold,full}.webp` (gamla WooCommerce-sidan),
`shots/t8-alla-vapes-{393,1440}-fold.webp` (Theme 8-katalogen i dag).
Kör om: `node theme8/review/engangsvape-landing-2026-11/proposal/render.mjs`.

## Sidtypen

THCX är en **ämneslandning**: ett namn som behöver förklaras, få produkter.
Engångsvape är en **formatlandning**: kunden vet vad formatet är och väljer
mellan serie, smak och storlek. Den ska inte konkurrera med `alla-vapes`
(katalogen med filter). Landningen ska skydda den gamla sidans trafik
(7 246 klick per kvartal) med sann text och leda snabbt in i rätt produkt.

## Struktur

```
Hero på solbelyst puts (samma som THCX)
  Brödsmula · H1 "Engångsvapes" · ingress (kortad, sann)
  Live-rad: "8 produkter i lager · 1+1, 2 och 5 ml"        ← NY, ur lagret
  Kapitelrad: Produkter · Storlek · Om formatet · Frågor
Engångsvapes i lager
  3 serievägar på stenstage: Magic Sauce 3.0 · Hero's Core · Cookies CBD
    (riktig förpackning, livepris, smaker som länkar; slut → vägen döljs)
  Välj storlek: 1 ml · 1+1 ml · 2 ml · 5 ml                ← NY sidtypsmodul
    (antal och "från"-pris räknat ur lagret; 0 i lager → dold; länkar
     till katalogens volymfilter)
  Alla engångsvapes i lager: varje smak som kort (Nyehandels egna kort)
    + "Filtrera alla vapes" → alla-vapes?typ=vapes
Uppslag "Vad är en engångsvape?" (öppet, foto till höger / i flödet på mobil)
Faktaspalter: Serier i sortimentet (länk per serie) · Analysintyg
FAQ (5 frågor; laglighet blockerad) + "Hitta rätt vape"-ruta
Global sidfot
```

## Vad som återanvänds och vad som är nytt

| Del | Källa |
|---|---|
| Puts, glasheader, stenstage, kontaktskugga, kortmaterial, uppslag, FAQ-material | Godkänd THCX-mall, oförändrad |
| Serievägar och sortimentsled | Samma JS (`initLeads`, `initProducts`), nya källor: `alla-vapes`, bara i lager |
| **Storleksrad + live-rad** | Ny modul för formatlandningar. Prototyp i `proposal/proposal.{css,js}`. Data ur samma lagerkort som ledet, ingen siffra utan data. |

## Malländringar som produktionskoden behöver (hittade i skissen)

1. **H1-storlek efter rubrikens längd.** 88b är satt för "THCX". "Engångsvapes" klipptes vid 393 px och skalas därför i skissen med `min(…, 13.4vw)`.
2. **Namnkortning i vägarna** (`shortName`). Katalognamnen innehåller halt ("CBD 56%"), volym ("1+1ml") och ett dubbelkodat `&amp;`. Skissen städar det i efterhand; produktionen ska göra det i `shortName`.
3. **Atmosfär per scen.** Puts, stage och kustfoto är i dag hårdkodade till `landing-thcx/`. `data-hz8-scene` ska välja bilderna, så att varje landning kan få en egen uppslagsbild utan ny CSS.
4. **Storleksmodulen** (`[data-hz8-sizes]`) flyttas in i 88b, gemensam för alla formatlandningar.

## Kvar att bestämma innan kod

- Titel och meta (förslag i `KARTLAGGNING.md` avsnitt 2), och om "THC"/"cannabis" får stå där. Det är sidans tyngsta sökord men inte en produktspecifikation.
- Laglighetstexten (blockerad, som på THCX).
- Faktakontroll: laddning per serie, "certifierade labb", framställning.
- Ny text: ingress, H2-texterna och FAQ "Vad skiljer 1, 2 och 5 ml?".
- Egen produktfri formatbild till uppslaget. Skissen lånar THCX-kustfotot och är märkt "Platshållare".
- Lageravvikelser Woo/NH: THCbA 47 %, Magic Sauce 5 ml, H4CBD 97 %.
- Om 1+1 ml ska bli ett filtervärde i katalogen.

## Funktion i skissen (render 2026-11-15)

393 och 1440: en H1, 3 av 3 vägar med riktig förpackning, storleksrad
1+1 ml (3 produkter, från 495 kr), 2 ml (4, från 395 kr), 5 ml (1, från
1 195 kr), 1 ml dold (0 i lager), 16 kort i ledet, 0 px sidledsscroll,
0 konsolfel (`shots/forslag-render.json`).
