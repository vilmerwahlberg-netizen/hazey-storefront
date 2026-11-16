# THCH och HHC i kunskapsmallen (fältatlas R3): byggda för granskning

Gren `feat/theme8-thch-hhc-knowledge`, från `feat/theme8-thcb-knowledge` (`1bb4e7e`, THCB R3 godkänd som visuell grund).

**Inte gjort:**
- Grenen är inte mergad.
- Inga sidor är skapade i Nyehandel.
- Omdirigeringar, aktivt tema, gamla sidor, artiklar och produkter är orörda.

## Filer

| Fil | Vad |
|---|---|
| `theme8/blocks/thch.html`, `theme8/blocks/hhc.html` | Nya sidor. Samma struktur som THCB, men egen text, egna källor, egen tidslinje och egna FAQ. Allt står i initial HTML. |
| `theme8/blocks/thcb.html` | Länkar till THCH och HHC under Relaterat. "Fler ämnesguider" är nu en lista. |
| `theme8/css/88e-landing-atlas.css` | Egen stämningsbild per ämne via `data-hz8-lp-scene`. Allt annat delas. |
| `theme8/assets/knowledge-thch/`, `knowledge-hhc/` | Bilder och README om ursprung och bearbetning |
| `KARTLAGGNING-THCH.md`, `KARTLAGGNING-HHC.md` | Gamla sidan rad för rad, Search Console-frågor, källor och föreslagen titel och meta |
| `GAMLA-PASTAENDEN.md` | Gamla påståenden som saknar säker källa (T1–T8, H1–H7) |
| `NAVIGATION-OCH-INNEHALL.md` | Navigations- och innehållskarta, och vad som återstår (A visuellt, B innehåll, C faktagranskning) |
| `BESLUT.md` | F1–F10 |
| `verify.mjs`, `compare.mjs`, `verify.json`, `shots/` | Tester och jämförelser |

## Rättsläget, belagt med primärkällor 16 november 2026

- **THCH:** SFS 2024:985 (utfärdad 7 november 2024, i kraft 10 december 2024) för in delta-8-THCH och delta-9-THCH i förteckningen över narkotika. Folkhälsomyndigheten inledde utredningen 15 mars 2024 (dnr 01137-2024). **Gamla sidans "inte specifikt nämnd i lagen" är fel sedan dess.**
- **HHC:** SFS 2023:379 (utfärdad 8 juni 2023, i kraft 11 juli 2023) för in HHC och HHCP. Regeringens pressmeddelande kom 9 juni 2023.
- **Båda:** står kvar i riksdagens konsoliderade text (t.o.m. SFS 2026:1109).
- **Butiken:** inga THCH- eller HHC-produkter. THCH-kategorin är tom och HHC har ingen kategori.

## Tester (`verify.json`, 18 körningar)

Körningarna:
- **THCB, THCH och HHC:** 393 × 852 och 1440 × 900
- **THCH och HHC:** dessutom 320, 768 och 1920, samt utan bild, med reducerad rörelse och utan JS

| Kontroll | Resultat |
|---|---|
| H1 | En per sida i alla körningar |
| Sidledsscroll | 0 px, inga element utanför |
| Konsolfel | 0. Körningen utan JS visar bara laddarens väntade meddelande. |
| Initial HTML | THCH 32/32 och HHC 29/29. THCB 36/37, där den saknade raden är den live-fyllda lagerraden. Utan JS syns all text. |
| Länkar | THCH 16 och HHC 15. Alla 200, ankarna finns och `/sv/page/{thcb,thch,hhc}` är planerade (fungerar i fixturen). THCB: 20 länkar, där DOI svarar 302 som tidigare. |
| Bilder | Rätt bild per ämne och bredd: desktopbild över 1024 px, mobilband under |
| Kontrast | Lägst 4,6 (pilvägar). Statuschipet "Narkotikaklassat" ligger på 4,97 eller mer. |
| Tangentbord | "Rättsläge" hamnar under headern (104/120 px). FAQ öppnas med Enter. |
| Köpknappar och förbjudna ord | Inga |
| Mobil 393 × 852 | Rubriken på kapitel 01 vid 661 px på alla tre sidor |

## Bilder (`shots/`)

- `familj-393-fold.webp` och `familj-1440-fold.webp`: THCB, THCH och HHC, första vyn
- `familj-393-helsida.webp` och `familj-1440-helsida.webp`: hela sidorna (393 i halv upplösning om bilden blir för hög)
- Per sida: `{thcb,thch,hhc}-{393,1440}-{fold,full}.webp` och felfallen för THCH och HHC
