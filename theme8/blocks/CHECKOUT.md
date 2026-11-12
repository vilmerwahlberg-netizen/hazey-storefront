# Theme 8 — kassan: vad som är gjort och vad som kräver admin

## Task 21 (2026-11-11): paketrader i kassan — följer med kassans CSS

Kassan kör inte temats JavaScript. Paketartiklarnas rader (Core 3/5-pack,
Magic Sauce 2 ml och 5 ml 3/5-pack) får därför kundnamn och bildruta via CSS:
`build-theme8.js` genererar reglerna sist i
`dist/theme8/hazey-theme8-checkout.css` ur `theme8/js/03c-package-table.js`
(nyckel = paketets länk). Namnet blir "<label> · N-pack", den tomma
bildrutan blir en tonad ruta "N×" och paketdelarna visar bara antal och
strain. Inga produktbild-URL:er i CSS. Syns först när kassans CSS är
inklistrad i Theme 8:s CSS-fält (steg 2 nedan / ADMIN-TODO 9b). En riktig
produktbild i kassan kräver en egen bild på paketartikeln i admin.
Granskning: `theme8/review/package-cart-identity-2026-11/`.

## Task 18 (2026-11-06): snabbhet och förtroende — lokalt, inte aktiverat

Kontrollerad mot den riktiga fyllda Theme 8-kassan (PDP → riktig köpknapp →
minicart → "Till Kassan", Magic Sauce 3.0 - 2ml / Gorilla Cookies). Ingen
order. R4 (`checkout-task16-concepts-r2-2026-10/concept-e-*`) är visuell
referens; dess formulär, paketboxväljare och Swish-flikar finns inte i den
riktiga kassan och är inte byggda. Bilder, skript och mätdata:
`theme8/review/checkout-task18-2026-11/` (`compare.html`, verklig storlek).

**Leverans (lokal, 2026-11-08).** Källa: `theme8/css/86-checkout.css`
(Task 18-blocket sist i filen; äldre regler kvar). Byggfil:
`dist/theme8/hazey-theme8-checkout.css` (genereras, checkas inte in).
Kontroll: `node theme8/review/checkout-task18-2026-11/tests.mjs` (ingen
order; lägger en vara i en sessionskorg). Skärmbilderna i granskningsmappen
checkas inte in — de genereras om med `shoot.mjs`/`final-shot.mjs`.

*Förhandsvisning i Nyehandel (manuellt, inte gjort):*
1. `node build-theme8.js` (kör även bildmanifestets generator; kontrollera
   `git status` efteråt).
2. Admin → **Theme 8** → CSS-fältet: klistra in hela
   `dist/theme8/hazey-theme8-checkout.css` **sist**. Finns ett tidigare
   inklistrat kassablock (ADMIN-TODO 9b), ersätt det i stället för att
   lägga till ett andra.
3. Spara — **Publicera inte**.
4. Kontrollera `/sv/checkout?preview=v9kzdmqz4w60l5n` med en vara i korgen
   på 393 och 1440 px. Ångra = ta bort blocket och spara.

*Kvarvarande lanseringshinder (admin/leverantör, inte CSS):*
- **Fri frakt:** fraktsättet "Fraktkostnad" (id 1) har
  `free_freight_active: 0` → 49 kr vid alla belopp, medan produktsidan i
  previewn lovar fri frakt från 499 kr. ADMIN-TODO 1–3 (där beslutet
  också anger 79 kr under 499 kr — fastställ beloppet).
- **Nyhetsbrevsförval:** `newsletter_subscription_default_checked: true`
  → stäng av; ny etikett via översättning. ADMIN-TODO 8.
- **Kustom Test Mode:** ramen kör testläge med handlarnamn "Test Shop".
  Produktionsnycklar, handlarnamn, villkorslänk och aktiva betalsätt måste
  sättas i Kustom/Nyehandel före lansering. ADMIN-TODO 9c.

**Nuläge i previewn:** kassans CSS är *inte* inklistrad i Theme 8:s CSS-fält.
Kassan visas nativ. Nyehandel lägger sammanfattningen först på mobil med
`column-reverse` (visuellt först, sist i fokusordning).

**Kassans egna data (Vuex `checkout.checkout`, bara läst):**
`countries` = endast Sverige (landvalet är redan i praktiken låst);
`customer_types` = Privatperson + Företag (båda aktiva, ingen dokumenterad
inställning för att stänga av Företag hittad på support.nyehandel.se);
`newsletter_subscription_default_checked: true`; fraktsättets
`description: null`; `checkout_message: false`; `pickup_location: null`.

**Fungerar i Theme 8 (bara `86-checkout.css`, kräver inklistring i CSS-fältet):**
- Header 64/56 px: "← Tillbaka" (Nyehandels länk, 44 px, synlig fokusram),
  logga i mitten, "Säker betalning"/lås höger. "Kassa" kvar för skärmläsare.
- Stockholmsremsan 88 px på desktop, borta på mobil.
- Trygghetsrad som lugn textrad: Skickas från Sverige · Diskret paket ·
  Spårning via e-post (produktsidans USP-rad och leverans-/retursidan).
- Mobil/surfplatta: Nyehandels totaler (Delsumma, Frakt 49 kr, Totalsumma
  624 kr, moms) i ett kort direkt under trygghetsraden (totalsumman på
  y≈190 px vid 393 efter friktionspasset; se nedan). Inga fokuserbara element flyttas; varor och rabattkod
  ligger kvar efter betalningen. Kustom-ramen börjar inom första vyn.
- Ett sammanhängande formulärkort: land + kundtyp sida vid sida (kompakta,
  landet utan pil eftersom det är enda alternativet), nyhetsbrev som liten
  rad, "1 Fraktsätt", "2 Betalning".
- Ett enda fraktsätt visas som bekräftad rad (bock) i stället för radioval;
  radioknappen finns kvar för tangentbord/skärmläsare. Fler fraktsätt ger
  vanliga radioknappar. Tom beskrivning → "Skickas från Sverige i diskret
  paket" tills admin fyller i en egen.
- Ovanför (utanför) Kustom-ramen: "Fyll i dina uppgifter och välj betalsätt
  i rutan nedan. Köpet slutförs först när du trycker på Betala köp."
  (under 768 px kortare: "Fyll i uppgifter och välj betalsätt nedan.
  Köpet slutförs med Betala köp.")
- Rabattkoden: liten etikett + fält. På mobil öppen, eftersom Nyehandels
  växlare inte kan nås med tangentbord.
- Äldre tema-CSS (inset-skugga, vit bakgrund med `!important`) skrivs över.
- Testat 393/768/1440: variant, totalsumma = Kustoms Totalbelopp (624 kr,
  1 199 kr vid 2 st), ogiltig rabattkod via tangentbord, tabbordning
  uppifrån och ned, inget sidledsöverflöd.

**Kräver Nyehandel-inställning:**
- Fraktsättets namn ("Fraktkostnad") och beskrivning: Kassan → Hantera
  fraktsätt (fälten "namn och beskrivning").
- Fri frakt ("Fraktfritt över") — se lanseringshindret nedan.
- Nyhetsbrev förkryssat: `newsletter_subscription_default_checked` ska vara
  av (förvald ruta är inte giltigt samtycke enligt GDPR).
- Kundtyp: om Företag inte behövs, fråga Nyehandel om den kan stängas av.
  Valet visas tills dess.
- Produktnamn/bild högt upp på mobil utan fokushopp kräver att Nyehandel
  lägger sammanfattningen före informationen i DOM.
- Rubrik/`aria-label` för sammanfattningen och en H1 (sedan tidigare).

**Kräver Kustom/fraktintegration:**
- Ombud/paketbox-val (R4 steg 2): finns inte — Kustoms leveransval
  (shipping assistant / PostNord) eller ett Nyehandel-fraktsätt med
  utlämningsställen.
- Kontaktfält, adress, "Hämta adress", Swish-nummer/QR, villkor och "Betala
  köp": Kustoms ram. I Test Mode visas Klarna Direkt (kort, Swish, bank),
  Faktura, Delbetalning, Kort, Swish; handlarnamn "Test Shop". Produktions-
  kontot och aktiva betalsätt måste kontrolleras — vi visar inga egna
  betalsättsloggor.

**Friktionsgranskning (slutpass, 2026-11-08).** Slutbild:
`theme8/review/checkout-task18-2026-11/FINAL-mobile-393-fore-efter.png`.

*Samtycken som faktiskt finns* (uppmätt, `runs/consent.json`):
- Nyehandel: exakt en kryssruta, "Prenumerera på nyhetsbrev",
  förkryssad, inte `required`. Övriga inmatningar är två förvalda
  radioknappar (fraktsätt, betalsätt Kustom).
- Kustom (Test Mode, alla steg fram till betalsätt): inga kryssrutor.
  Villkoren godkänns med text vid knappen: "Genom att klicka på 'Betala
  köp' godkänner jag Kustoms villkor och dataskyddsinformation samt
  godkänner Test Shops allmänna villkor." Ingen extra villkorsruta har
  lagts till.
- Avmarkerat nyhetsbrev blockerar inte: inga fel, totalen oförändrad
  (624 kr), Kustom går vidare till betalsätt. "Betala köp" är inte testat
  (ingen order).

*Admin: nyhetsbrevet avmarkerat från start.* Kassans data har
`newsletter_subscription_default_checked: true` (inställningen finns i
Nyehandel, sannolikt under Kassan → Inställningar). Sätt den till av. Ny
etikett, föreslagen (Nyehandels översättning av "Prenumerera på
nyhetsbrev", inte CSS — ett samtyckes text ska inte bytas visuellt):
*"Ja, mejla mig nyheter och erbjudanden från Hazey.se. Jag kan avsluta
när som helst."* Tills dess lägger CSS bara till "(valfritt)", vilket
stämmer (rutan är inte obligatorisk).

*Placering av nyhetsbrevet:* ligger i DOM mellan kundtyp och Fraktsätt och
står kvar där (liten, dämpad rad). Att visa det efter betalningen bara
visuellt ger fel tabbordning; det kräver att Nyehandel flyttar fältet.

*Mobilens första vy (393 × 852):* totalsumma 190 px (nativ 374), Kustoms
första fält 704–742 px (nativ 1 091, förra Task 18-versionen 837).
Delsumma och Frakt delar rad; den enda fraktraden är en rad med namn + 49 kr
(fallbacktexten visas bara på desktop; admins egen beskrivning visas alltid).

*Rabattkod:* oförändrad placering (efter totalen på desktop, sist på
mobil), liten dämpad etikett, ljus knapp i stället för fylld. Fältet nås
med tangentbord; ogiltig kod ger Nyehandels "Kod är ogiltigt."

*Cookies (bara läst, ingen ändring; `runs/cookies.json`):*
- Första lagret: "Godkänn alla" (svart, fylld) och "Inställningar" (vit,
  kantad), lika stora. Ingen "Neka"-knapp — att neka kräver Inställningar
  → Spara (två klick). Acceptera och neka är alltså **inte** lika lätta.
- I inställningarna är Analys, Personalisering och Marknadsföring
  avmarkerade från start; Nödvändiga låst.
- Före samtycke: Google Consent Mode `default` med `ad_storage`,
  `analytics_storage`, `ad_user_data`, `ad_personalization` = denied;
  inga analys-/annonsanrop och bara Nyehandels egna cookies (session,
  XSRF, locale). Trustpilot-widgetar (inkl. `stats/TrustboxImpression`)
  och Google reCAPTCHA laddas före samtycke.
- Kassan visar ingen cookiebanner för en ny besökare.
- Åtgärd (utanför Task 18): en "Neka alla"/"Endast nödvändiga"-knapp på
  första lagret med samma vikt som "Godkänn alla"; bedöm Trustpilot och
  reCAPTCHA före samtycke.

**Lanseringshinder (separat, inte designfråga): fri frakt.** I Theme 8-
previewn säger produktsidan "Fri frakt från 499 kr" (`HZ8.commerce`,
`goalsEnabled()` = preview), men kassan tar 49 kr för en order på 575 kr
(fraktsätt utan "Fraktfritt över"). Minicarten säger "Frakt: Beräknas i
kassan". Kassans design döljer inte detta: frakten 49 kr visas i både
toppkortet och sammanfattningen. Åtgärd: ADMIN-TODO.md punkt 1–3, och
`backendVerified` ska vara `false` tills kassan räknar fri frakt.

## Redesign 2026-09-30 (facit: `checkout-hybrid-approved-mobile-393x852-v1.png`, `…-desktop-1920x1080-v2.png`)

Endast `css/86-checkout.css` (ren CSS på Nyehandels befintliga DOM,
scopad till `body.checkout-page`). Verifierad genom att injicera den byggda
`dist/theme8/hazey-theme8-checkout.css` lokalt i den riktiga fyllda
previewkassan -- **inte** via admin. Skärmbilder och jämförelser:
`theme8/review/checkout/`.

**Implementerat:** mörkoliv header (70 px desktop / 62 px mobil) med
tillbaka, logga, "Trygg kassa" och lås + "Säker betalning" (mobil: bara
lås); Stockholmsremsa 124/58 px utan text; trygghetsrad; desktop två
kolumner (max 1340 px, sammanfattning ~30 %, sticky); under 1024 px en
kolumn i DOM-ordning (se korrigering nedan); kort per
steg; 44 px antalsknappar; totalsumman störst; nyhetsbrevet som liten
valfri rad; "Betalning"-kort runt `#kustom-checkout` (inget inuti ramen
rört); stylat tomläge.

**Korrigering 2026-10-01 -- fokusordning och skärmläsare**

*Ordning under 1024 px* (390–1023, även 768): sammanfattningen visas
sist, efter betalningen, eftersom den ligger där i Nyehandels DOM. Den
tidigare visuella flytten (sammanfattning först, som i facit) gav
fokushopp nedåt till Kustom och sedan uppåt igen. Visuellt: header →
remsa → trygghetsrad → land/kundtyp → nyhetsbrev → fraktsätt → betalning
(Kustom) → Din beställning. Tangentbord (uppmätt 390/393/430/768):
Gå tillbaka → leveransland → kundtyp → nyhetsbrev → fraktsätt → Kustom-
ramen (Kustoms egna fält) → produktlänk → minska/öka/ta bort per vara →
Kustoms dolda helskärmsram. Inga uppåthopp. Rabattkodens växlare på
mobil är Nyehandels `div` och går inte att nå med tangentbord (nativ
begränsning, inte ändrad). Desktop (från 1024 px): vänsterkolumnen
uppifrån och ned, därefter den sticky sammanfattningen till höger, som
är synlig i fönstret när fokus når den, och sist rabattkodsfältet.

*Vad en skärmläsare får* (Chromium-tillgänglighetsträd, uppmätt):
- Header: "Kassa" (Nyehandels text, kvar) och knappen "Gå tillbaka"
  (bild med alt "Måbroberg AB (NDA)", admin). "Trygg kassa" och
  headerns "Säker betalning" har tom alt-text (`content: "…" / ""`) och
  läses inte upp.
- Trygghetsraden: dekorativ, tom alt-text, läses inte upp. Den ersätter
  ingen native information.
- Ordersammanfattning: Nyehandel har ingen egen rubrik eller region för
  den (inga `h*`, `aside` eller `aria-label`). "Din beställning" läses som
  vanlig text före varorna (ingen rubrik, ingen ARIA). Därefter per vara:
  produktbild och länk, "595 kr / Styck", variant, "Minska antalet",
  "Valt antal", "Öka antalet", "Ta bort varan", radsumma; sedan
  delsumma, frakt, totalsumma, moms och rabattkod.
- Rubrikerna Fraktsätt (h2), Fraktkostnad (h4) och Betalning (h2) finns
  kvar. Kassan saknar H1 (Nyehandels DOM).
- Styckpriset ("595 kr / Styck") var dolt i `29edf0d` och därmed borta ur
  tillgänglighetsträdet. Det visas nu igen.
- Äldre webbläsare utan alt-syntaxen använder en fallback-rad med samma
  text. Där läses de dekorativa texterna upp, men inget försvinner.
- Nyehandel-ärende: en rubrik eller `aria-label` för sammanfattningen
  och en H1 i kassan.

**Går inte med ren CSS / plattformen -- inte byggt:**
- *Hjälprad "Behöver du hjälp? Kontakta oss"*: CSS kan inte skapa länkar.
  Admin: lägg texten med länk till `/sv/page/kontakt` i kassatexten
  (`.checkout-message`, redan stylad) om fältet tillåter länk.
- *Fri frakt-status*: ingen Nyehandel-DOM idag (se nedan). Ingen egen
  mätare.
- *Antal varor i rubriken* ("· 1 vara") och *"Garanterad leverans"* under
  fraktsättet: finns inte i DOM (fraktsättets `<p>` är tom -- admin kan
  fylla i fraktsättets beskrivning).
- *Rabattkoden hopfälld på desktop*: Nyehandels växlare är en `div` utan
  tangentbordsfokus och visas bara under 1024 px. Desktop visar därför
  fältet öppet (kompakt). Mobil/surfplatta: nativ hopfällning; den är
  inte nåbar med tangentbord (Nyehandels komponent).
- *Kustoms rubrikrad* ("Kustom · Säker betalning med Kustom") ligger i
  ramen. Kustom kör **Test Mode** (limegul rad, "Test Data") i previewn.
- *Tabbordning på mobil*: sammanfattningen flyttas visuellt först (grid),
  men i DOM ligger den efter betalningen -- tangentbordsordningen följer
  DOM (tillbaka → land → kundtyp → nyhetsbrev → frakt → Kustom → antal).
- *Loggans alt-text* är "Måbroberg AB (NDA)" -- ändras i admin (logotyp
  för kassan).

**Aktivering:** se "Aktivera" nedan. Utan inklistring i Theme 8:s
CSS-fält syns inget av detta i previewn -- kassan laddar inte loadern.


Verifierat 2026-09-28 mot Nyehandels RIKTIGA, fyllda kassa (en vara i
korgen via UI → minicart → "Till Kassan" i samma webbläsarsession).
Ingen order skickades.

## Vad kassan består av

| Del | Ägare | Theme 8 kan styla? |
|---|---|---|
| Sidhuvud (`header.checkout`, tillbaka + "Kassa") | Nyehandel | Ja |
| Leveransland, kundtyp (privat/företag) | Nyehandel | Ja |
| Nyhetsbrevsval | Nyehandel | Ja (utseende) |
| Fraktsätt (`.shipping .options`) | Nyehandel | Ja |
| Betalning (`.payment`) — rubrik + ram | Nyehandel | Ja (ramens yta) |
| **Kontakt, adress, leverans, betalsätt, "Betala köp"** | **Betalleverantören (Kustom/Klarna, `#kustom-checkout` iframe)** | **Nej** — tredjepartsram |
| Ordersammanfattning: rader, bild, variant, antal, delsumma, frakt, totalsumma, moms | Nyehandel | Ja |
| Rabattkod/presentkort (validering) | Nyehandel | Ja (utseende) |
| Kassatext (`.checkout-message`) | Nyehandel (admin) | Ja — stylad som trygghetsrad |

Prototypens adressökning, ombud/paketbox-sök, Swish-QR, betalningsstatus
och sticky betalknapp finns INTE som Nyehandel-DOM — de ligger (om alls)
i betalleverantörens ram och återskapas inte.

## Plattformsgräns

Kassan kör **inte** temats JavaScript-fält (Theme 8:s loader). Den laddar
temats **CSS-fält** och Head-fältet. Därför är kassans stil ren CSS,
scopad till `body.checkout-page`.

## Aktivera (manuellt — inte gjort)

1. Kör `node build-theme8.js`.
2. Öppna `dist/theme8/hazey-theme8-checkout.css` (tokens + kassaregler,
   bild-URL:er absoluta mot GitHub Pages `theme8/assets/`).
3. Nyehandel-admin → **Theme 8** (INTE Theme 3/5/6) → **CSS-fältet** →
   klistra in filens innehåll **sist** i fältet. Befintligt innehåll i
   fältet (ett äldre `.hz-header`-block) kan ligga kvar.
4. Spara Theme 8 — klicka **inte** Publicera.
5. Kontrollera `/sv/checkout?preview=v9kzdmqz4w60l5n` med en vara i korgen.

Utan steg 3 fungerar kassan exakt som idag (native utseende).
Filens regler för övriga sidor är identiska med dem loadern redan
laddar, så dubbelladdningen påverkar inget.

## Rekommenderade admininställningar (inte gjorda)

- **Nyhetsbrev förkryssat som standard** — i kassan är rutan
  "Prenumerera på nyhetsbrev" ikryssad från början. Prototypen och god
  praxis: avmarkerad. Ändras i Nyehandels kassainställningar (om
  inställningen finns); CSS kan inte ändra ett förval.
- **Kassatext** (`checkout_message`, visas som trygghetsrad överst):
  förslag med bara verifierade uppgifter (footer, FAQ, produktsidornas
  USP-rad): *"Skickas från Sverige · Diskret förpackning ·
  Spårningsnummer via e-post"*. Prototypens "Leveransgaranti" och
  "Kommer paketet inte fram skickar vi ett nytt" används inte —
  overifierat.
- **Kassabakgrund** i temainställningen är `#6c4b4b`; Theme 8-CSS:en
  skriver över den, men värdet kan med fördel sättas till `#ede9e8`.

## Medvetet inte gjort

- **Sticky mobil betalknapp:** den enda slutknappen ("Betala köp") finns
  i betalleverantörens ram. Att klona den vore en knapp med separat
  state — förbjudet. Utan JS i kassan går inte heller en scroll-genväg
  att lägga in.
- **Head-block:** CLAUDE.md reserverar Head-fältet för typsnitt och
  Trustpilot; inget Theme 8-skript föreslås där.
- Kassans "Till Kassan"-navigering (Vue) tappar `?preview=`; det spelar
  ingen roll eftersom kassan ändå inte kör temat.

## Frakt- och bonusstatus i kassan (2026-09-29)

**Inte byggd, och det är avsiktligt.** Kassan laddar inte Theme 8:s JS
(kontrollerat igen: `window.HZ8` saknas, bara `foundation.js`, den gamla
Oliverforss8-bundlen från Head-fältet och `pulse-tracker.js`). En status
kräver beräkning och kan inte göras i ren CSS. Ett skript i Head-fältet är
inte tillåtet (CLAUDE.md), och Kustoms iframe får inte röras.

Nyehandels kassa räknar redan själv
`checkout.calculations.free_shipping = { remaining,
free_shipping_progress_percentage, has_alternative }` och
`shipping.free_freight_activated`. När fri frakt över 499 kr är
aktiverad i fraktsättet (ADMIN-TODO.md punkt 1–3) visar Nyehandels egen
kassa sin fri frakt-status. Den kan då stylas med CSS i
`86-checkout.css` utan egen logik. Bonusstatus finns inte i kassan och
ska inte läggas dit förrän bonusmekanismen är beslutad.

Om Nyehandel har ett separat skriptfält för kassan kan
`hazey-theme8.min.js` läggas där. Då visar `HZ8.commerce` samma status.
Det är inte verifierat att ett sådant fält finns.

Kassans frakt är idag **49 kr vid alla belopp** (fraktsätt
"Fraktkostnad", ingen fri frakt-gräns), se ADMIN-TODO.md.
