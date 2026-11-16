# Länkar och källor: rättslägeshubben

Kontroll 16 november 2026. Läsande granskning av `theme8/blocks/rattslage.html`; ingen kod, admin, omdirigering eller produkt ändrad. Hubben är fortfarande en granskningsgren.

## Verifierat

- HTML-blocket innehåller 51 länkar, 33 unika mål och 19 id-attribut. Alla lokala `#`-ankare i hubben har ett motsvarande id.
- De fyra guidemålen finns som block: `/sv/page/thca`, `/sv/page/thcb`, `/sv/page/thch` och `/sv/page/hhc`. Ankarmålen `thca#alternativ` och `hhc#fragor` finns också i respektive block. Guidernas länkar tillbaka till hubben saknas.
- Samtliga 18 unika externa källmål öppnas. De sex SFS-PDF:erna som hubbens tabell länkar till anger de ikraftträdandedatum som används i tabellen: 2023:379, 2023:901, 2024:985, 2024:986, 2025:663 och 2026:1109. Kontrollera fortsatt varje substans mot själva bilagan vid innehållsgranskningen.
- Regeringens pressmeddelanden från december 2023, juni 2025 och juni 2026 nämner relevanta cannabinoider. Pressmeddelandet från november 2024 gäller nitazener och nämner inte cannabinoiderna i tabellen.
- Riksdagens konsoliderade förordningar visar `1992:1554` ändrad till och med 2026:1109 och `1999:58` ändrad till och med 2026:1803. Den senare sidan innehåller även en bilageversion som **träder i kraft 25 november 2026**; för ett kontrolldatum 16 november ska man läsa den då gällande versionen.
- Högsta domstolens sida för B 177-19 stöder formuleringen om **CBD-olja som innehåller THC**. Livsmedelsverkets hampasida stöder att CBD-olja inte får säljas som livsmedel. Dessa källor ger inte stöd för att alla CBD-produkter har samma rättsliga status.
- Lag (1999:42) 3 § räknar även upp **innehav** bland sådant som kräver tillstånd för hälsofarliga varor.
- De fyra guidernas HTML-block har 28, 27, 21 respektive 21 länkar (THCA, THCB, THCH, HHC). Alla deras interna `#`-ankare finns i respektive block.

## Rättas före merge

| Prioritet | Plats | Fynd | Exakt åtgärd |
|---|---|---|---|
| 1 | `rattslage.html`, avsnittet om alternativ | `Nano11` pekar på `/sv/categories/nano`. I den riktiga Theme 8-previewn är det en tom kategori. `/sv/categories/nano-11` visar 16 produkter. | Ändra href till `/sv/categories/nano-11`; behåll länktexten. |
| 1 | Källförteckningen | Pressmeddelandet “Regeringen narkotikaklassar nitazener” nämner inte THCH, HHCPO eller andra cannabinoider och är därför ingen direkt källa för raderna. | Ersätt just den posten med direktlänk till SFS 2024:985 och beskriv den som ändringsförfattning. Ta inte bort någon sakuppgift ur tabellen. |
| 2 | Källförteckningen, `1999:58` | Texten “ändrad t.o.m. 2026:1803” kan tolkas som att alla ändringar redan gäller 16 november. | Lägg till att 2026:1803 träder i kraft 25 november och att tabellen avser 16 november. |
| 2 | Fyra guider | Hubben länkar till guiderna, men ingen av guiderna länkar tillbaka till hubben. | När hubbens slutliga slug är fastställd och sidan finns i admin: lägg en relevant “Se alla ämnen och källor”-länk under Relaterat på THCA, THCB, THCH och HHC. Kontrollera att inga gamla felaktiga omdirigeringar fångar länken. |
| 2 | Metodtexten | “Ett ämne är narkotika eller hälsofarlig vara ... när det står i en av två förteckningar” är för absolut. Underlaget nämner själv att narkotikaföreskrifter och andra regler kan vara relevanta. | Skriv snävare: “Den här tabellen kontrollerar ämnen mot de två angivna förordningarna ...”, och behåll tydlig förklaring att “inte i förteckningarna” inte betyder laglig produkt. Låt innehållsansvarig granska formuleringen. |
| 2 | THCA-guidens källista | Länken “Socialdepartementet” går till departementets allmänna startsida, som inte belägger det specifika THCA-påståendet. | Länka direkt till regeringens [beslut om 18 substanser](https://www.regeringen.se/pressmeddelanden/2026/06/regeringen-narkotikaklassar-18-substanser/) eller nöj dig med SFS 2026:1109 som redan finns. Ändra källans synliga namn efter målet. |
| 3 | THCB-guidens källista | Två FHM-nyheter från 2025 och 2026 öppnas, men de är generella klassificeringsförslag; de belägger inte direkt THCB:s aktuella status. | Håll isär bakgrundsnyheter och radens bevis: FHM:s THCB-yttrande samt båda aktuella förordningarna. Granska om nyheterna behövs som bakgrund och märk dem i så fall så. |
| 3 | THCB-guidens forskningslänk | DOI-målet gick inte att öppna med webbverktyget, men artikeln finns hos [förlaget ACS](https://pubs.acs.org/doi/10.1021/acs.jnatprod.9b00876). | Kontrollera länken i vanlig webbläsare. Vid behov använd förlagets direkta DOI-sida. Den är vetenskapligt underlag för ämnesbeskrivning, inte för svensk rättslig status. |

## Kontroller som återstår

1. Alla 18 externa mål öppnas, men granska varje källas koppling till sitt specifika påstående. Den felkopplade 2024-posten är redan identifierad ovan.
2. Stäm av **alla 20 ämnesrader** mot konsoliderad lagtext, historisk SFS och FHM:s aktuella lista. Den tidigare rapporten `KALLKONTROLL.md` är ett användbart underlag men anger själv bara stickprov i PDF:erna. Lås inte ett nytt “senast kontrollerad”-datum innan varje rad är verifierad av en utsedd granskare.
3. Verifiera i riktig preview att alla interna länkar får rätt sida och rätt ankare. Enbart 200 räcker inte: `/sv/categories/nano` gav en giltig men tom sida.
4. När hubben finns i Nyehandel: kontrollera både `/sv/page/lagliga-cannabinoider-sverige` och gamla WooCommerce-adressen `/lagliga-cannabinoider-sverige/`. Skapa eller ändra 301 bara om den gamla adressen inte går till hubben.
5. Den befintliga artikeln och kategorin om THCNM har enligt `BESLUT.md` påståenden som motsäger hubbens försiktigare status. Granska innan hubben länkas brett; ändra inget tyst.

## Officiella källor som användes i denna kontroll

- [Narkotikaförordningen 1992:1554](https://www.riksdagen.se/sv/dokument-och-lagar/dokument/svensk-forfattningssamling/forordning-19921554-om-kontroll-av-narkotika_sfs-1992-1554/)
- [Hälsofarliga varor 1999:58](https://www.riksdagen.se/sv/dokument-och-lagar/dokument/svensk-forfattningssamling/forordning-199958-om-forbud-mot-vissa_sfs-1999-58/)
- [Lag 1999:42, 3 §](https://www.riksdagen.se/sv/dokument-och-lagar/dokument/svensk-forfattningssamling/lag-199942-om-forbud-mot-vissa-halsofarliga_sfs-1999-42/)
- [Högsta domstolen, CBD-oljan](https://www.domstol.se/hogsta-domstolen/avgoranden2/2019/21081/)
- [Livsmedelsverket, Hampa](https://www.livsmedelsverket.se/foretagande-regler-kontroll/regler-for-livsmedelsforetag/hampa-cannabis-sativa/)
- [Folkhälsomyndighetens yttranden](https://www.folkhalsomyndigheten.se/regler-och-tillsyn/yttanden-enligt-forstorandelagen/)
- [SFS 2024:985](https://svenskforfattningssamling.se/sites/default/files/sfs/2024-11/SFS2024-985.pdf)
