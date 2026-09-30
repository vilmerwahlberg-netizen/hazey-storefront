# Informationssidor och systemtillstånd

Status 2026-09-30, Theme 8-preview (`?preview=v9kzdmqz4w60l5n`). Inget
nedan är gjort i Nyehandel-admin.

## Routes

| Route | Status | Theme 8 | Innehåll |
|---|---|---|---|
| `/sv/page/faq` | 200 | ja | servicesida: butikens 10 frågor i ämnen, sök, djuplänkar |
| `/sv/page/kontakt` | 200 | ja | servicesida: riktigt kontaktformulär (Nyehandels ärendefunktion), ärendeval, kontaktvägar |
| `/sv/page/kop-och-leveransvillkor` | 200 | ja | dokumentmall: innehållsförteckning, läskolumn, hjälpkolumn (juridisk text orörd) |
| `/sv/page/integritetspolicy` | 200 | ja | dokumentmall |
| `/sv/page/kopvillkor` | 200 | ja | **tom sida** i admin -- Theme 8 visar tomläge med länk till villkoren |
| `/sv/page/butik`, `/vara-bastsaljare`, `/kampanjer` | 200 | ja | admin-html |
| `/sv/search?query=` | 200 | ja | servicemasthead med sökfält (riktig sökroute), tomläge med kategoriplattor |
| `/sv/page/om-oss` | **404** | nej | block finns: `om-oss.html` |
| `/sv/page/leverans-och-retur` (ny) | **404** | nej | block finns: `leverans-och-retur.html` |
| okänd URL (404) | 404 | **nej** | Nyehandels 404-mall laddar inte temats JS/CSS |

## Adminsteg (Theme 8, inte Theme 3/6, klicka inte Publicera)

### Om oss
1. Sidor → Ny sida. Titel **Om oss**, slug **`om-oss`** (`/sv/page/om-oss`).
2. Lägg till ett HTML-block och klistra in hela `theme8/blocks/om-oss.html`.
3. Lägg sidan i sidfotens sidlista. Theme 8:s footer byter då
   automatiskt "Butik" mot "Om oss" (letar efter `/page/om-oss`).
4. Verifiera: `/sv/page/om-oss?preview=v9kzdmqz4w60l5n` -- exakt en H1
   ("En svensk butik för lagliga cannabinoider"), Stockholmsbild, inga
   kundantal/årtal/betyg.

### Leverans och retur
Klistra in först när fri frakt från 499 kr gäller i kassan
(`ADMIN-TODO.md` punkt 1–3) och en leveranstid är beslutad.
1. Ny sida **Leverans och retur**, slug **`leverans-och-retur`**.
2. HTML-block med `theme8/blocks/leverans-och-retur.html`.
3. Lägg till i footern (Kundservice) -- länken läggs då in i
   `theme8/js/60-social-footer.js` (finns inte ännu, eftersom routen saknas).

### Kontaktformulär (Theme 8, 2026-09-30)
Kontaktsidans formulär i Theme 8 skickar till Nyehandels egen
ärendefunktion, samma som plattformens komponent Kontaktformulär:
`POST /frontend-api/contact-form` med `name`, `email`, `phone` (tomt),
`message` och `g-recaptcha-response` (reCAPTCHA v2, nyckeln
`window.config.rcsk` är konfigurerad), CSRF via `X-XSRF-TOKEN`.
Ärende och ordernummer läggs först i meddelandet ("Ärende: …",
"Ordernummer: …"). Namn krävs av plattformen och finns därför som fält.
Verifierat: plattformens validering (422 med svenska fältfel) och
kopplingen av felen till fälten. **Inte verifierat:** ett lyckat utskick
-- vart meddelandet levereras styrs av butikens e-postinställning i
Nyehandel-admin.
1. Admin: kontrollera mottagaradressen för kontaktformulär.
2. Skicka ett testmeddelande från `/sv/page/kontakt?preview=…` och
   bekräfta att det kommer fram.
3. Därefter kan de tre dolda mailto:-formulären tas bort ur sidans html.
4. Kontaktsidans admintext nämner "Swish-rutan" (WooCommerce-kassan) --
   Nyehandels kassa använder Kustom.

### Nyhetsbrev
Nyehandel har komponenten Nyhetsbrev (`POST /frontend-api/newsletter-form`,
reCAPTCHA, valfri rabattinsamling). Theme 8 visar inget nyhetsbrev och
inget "10 % på första köp" förrän en riktig registrering och kod finns.
Kontrollera om nyhetsbrevet är kopplat till ActiveCampaign (villkoren
nämner det).

### Tom sida `/sv/page/kopvillkor`
Finns i Nyehandels sidfot som "Köpvillkor" men saknar innehåll. Ta bort
sidan eller låt den peka på `/sv/page/kop-och-leveransvillkor`.

### 404
Nyehandels 404-mall innehåller varken temats CSS eller JavaScript (inga
Theme 8-referenser i HTML:en) -- den visar i stället den gamla
kontraktörsbundlen (ticker "Skickas 1-2 vardagar · Trustpilot 4,7/5",
grön disclaimer) och sidtiteln "Måbroberg AB (NDA)". Ingen JavaScript-
omdirigering byggs.
1. Fråga Nyehandel support om temats JavaScript-fält kan laddas på
   404-sidan (även i preview).
2. 404-texten är en admin-redigerbar textkomponent. Rekommenderad text:
   **Rubrik (H1):** "Sidan finns inte"
   **Text:** "Länken kan vara gammal eller felstavad. Sök efter det du
   letar efter, eller fortsätt till Alla produkter, Bästsäljare eller
   Vanliga frågor. Behöver du hjälp? Kontakta oss."
   Länkar: `/sv/search`, `/sv/categories/alla-produkter`,
   `/sv/page/vara-bastsaljare`, `/sv/page/faq`, `/sv/page/kontakt`.
3. När Theme 8 laddas där: lägg till en liten 404-modul i
   88-pages.js (H1, sök, länkarna ovan) -- byggs först då, eftersom
   sidan idag inte går att köra eller testa med temat och 404 inte kan
   kännas igen på något robust sätt (ingen sidtyp i DOM/`window.config`).

## FAQ -- text som ska ändras i admin (`/sv/page/faq`)

| Fråga | Nu | Problem | Förslag |
|---|---|---|---|
| Hur snabbt får jag min beställning? | "Vi skickar från Sverige inom 1–2 vardagar." | Motsäger villkoren (1–4 arbetsdagar) och hazey.se (1–3) | "Vi skickar från Sverige. Du får ett spårningsnummer via mejl så snart paketet har lämnat oss. Fri frakt från 499 kr." (lägg till den beslutade tiden) |
| Är produkterna labbtestade? | "Hela vårt sortiment är … labbtestat" | Overifierat; produktsidorna säger "Labbrapport skickas på begäran" | "Labbrapport skickas på begäran – mejla hej@hazey.se." |
| Vilka cannabinoider säljer ni? | "…bland annat THCA, THCB, …" | THCA narkotikaklassades 14 juli 2026 (hazey.se) | Ta bort THCA ur listan; juridisk granskning |
| Hur betalar jag? | "Swish direkt i kassan" | Nyehandels kassa är Kustom; vilka betalsätt som visas är ej verifierat | "Du betalar tryggt i kassan." + beslutade betalsätt |
| Är Hazeys produkter lagliga i Sverige? | "Ja. Vi säljer endast cannabinoider som är lagliga…" | Generellt laglighetslöfte; gäller inte THCA längre | Juridisk granskning |
| Hur vet jag att THC-halten är under gränsen? | "Alla produkter är … testade" | Overifierat | Juridisk granskning |

## Juridik -- kräver mänskligt beslut (ingen text ändrad)

**Köp- och leveransvillkor** (`/sv/page/kop-och-leveransvillkor`):
- "Uppdaterad: Juni 2025" -- inaktuellt efter byte till Nyehandel.
- 1.1: "Ålderskontroll sker via personnummer i kassan" -- Nyehandels
  Kustom-kassa ber om e-post och postnummer; ingen personnummerkontroll
  verifierad (hazey.se-kassan saknar den också).
- 2.1: "Hazey.se samarbetar med Bjorntech för SWISH-betalning" -- gamla
  WooCommerce-leverantören; Nyehandel använder Kustom.
- "Genom att klicka på ”Slutför köp”" -- knappen heter annat i Kustom.
- 3: "Normal leveranstid: 1–4 arbetsdagar" -- motsäger FAQ (1–2) och
  hazey.se (1–3).
- 3: "Vid ej spårbar frakt" -- Nyehandel/WooCommerce har bara "Garanterad
  Leverans".
- 7: "Genom att genomföra ett köp samtycker du till att vi får skicka
  e-post … erbjudanden" -- samtycke via köp + förkryssad
  nyhetsbrevsruta i kassan (ADMIN-TODO punkt 8) bör granskas.
- Rubrikordning: "Uppdaterad: Juni 2025" är en H3 direkt efter H1.

**Integritetspolicy** (`/sv/page/integritetspolicy`, "Uppdaterad: Juni 2025"):
- 2: "Personnummer (vid verifiering av ålder)" -- se ovan.
- 5: "Betaltjänster (t.ex. Swish via Bjorntech)", "Fraktjakt & Postnord"
  -- WooCommerce-erans leverantörer; Nyehandel, Kustom och faktisk
  transportör saknas.
- 5/7: ActiveCampaign -- kontrollera om det fortfarande används.
- 6: cookies -- listar inte Nyehandels egna cookies/samtyckesverktyg,
  Trustpilot, reCAPTCHA eller analysverktyg.

## Övrigt (utanför denna batch, ej åtgärdat)
- Footerns "THCA-B" leder till THC-A-kategorin (`/sv/categories/thca`)
  -- se gap-analysens P0 om THCA/THCaB.
- Footerns "Trygg betalning" visar en Swish-logga som hämtas från
  hazey.se (`wp-content/uploads/…`) -- försvinner när WooCommerce stängs,
  och Swish i Nyehandels kassa är inte verifierat.
- Butik-sidan (admin) visar "1–3 dagar leveranstid".
- Kampanjer-sidans ingress lovar "alltid labbtestat".
