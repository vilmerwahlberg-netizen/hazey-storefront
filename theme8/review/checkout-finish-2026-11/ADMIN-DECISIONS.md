# Kassan: kräver adminbeslut (2026-11-12)

Inget av detta går att lösa i CSS och inget är ändrat. Uppmätt i den riktiga
Theme 8-previewkassan med en korg på 2 174 kr (ingen order).

## 1. Fraktgränsen 499 kr kontra faktisk frakt — LANSERINGSSPÄRR

- **Vad sajten lovar (bara i previewn):** `02a-commerce.js` har
  `freeShippingFrom: 499`, `shippingFee: 79`. Produktsidan visar "Fri frakt
  från 499 kr" eftersom `goalsEnabled()` är sant i preview. Live är
  löftet avstängt (`backendVerified: false`).
- **Vad kassan tar:** 49 kr vid alla belopp, även 2 174 kr. Fraktsättet
  "Fraktkostnad" (id 1) har `free_freight_active: 0`, `free_freight_over: 0`.
- **Beslut som behövs:**
  1. Fraktpris under gränsen: **49 kr** (dagens kassa) eller **79 kr**
     (ADMIN-TODO 1–3 / `COMMERCE-RULES.md`)?
  2. Fri frakt från 499 kr — ja/nej? Räknas gränsen inkl. moms och efter
     rabatt?
- **Därefter (admin):** Nyehandel → Fraktsätt → "Fraktkostnad": pris,
  "Fri frakt aktiv" = på, "Fri frakt över" = 499, land = Sverige.
  Verifieringstabellen står i `theme8/blocks/ADMIN-TODO.md` punkt 1–3.
  Sätt `backendVerified: true` först när kassan räknar rätt.
- Tills dess får produktsidans fri frakt-löfte inte gå live. Kassans
  design visar alltid den verkliga frakten (49 kr) i toppkortet och
  sammanfattningen; den döljs inte.

## 2. Nyhetsbrevet är förkryssat

- Kassans data: `newsletter_subscription_default_checked: true`. En
  förkryssad ruta är inte giltigt samtycke (GDPR).
- **Admin:** stäng av förvalet (Kassan → Inställningar / Nyhetsbrev).
- Valfri ny etikett via Nyehandels översättning: "Ja, mejla mig nyheter och
  erbjudanden från Hazey.se. Jag kan avsluta när som helst." CSS lägger
  bara till "(valfritt)" och ändrar inte samtycket. (ADMIN-TODO 8.)

## 3. Kustom kör testläge

- Ramen visar "Test Mode" / "Test Data", och villkorstexten säger "Test
  Shops allmänna villkor". Totalbeloppet stämmer med Nyehandels totalsumma.
- **Admin/Kustom:** produktionskonto och nycklar, handlarnamn "Hazey.se",
  villkorslänk, kontroll av aktiva betalsätt (testläget visar Klarna,
  kort, Swish, faktura, delbetalning). (ADMIN-TODO 9c.)

## 4. Aktivera kassans CSS i Theme 8 (ingen adminåtkomst i denna session)

1. `node build-theme8.js` på den här grenen (eller dev efter merge).
2. Admin → **Theme 8** → CSS-fältet: ersätt ett ev. tidigare kassablock med
   hela `dist/theme8/hazey-theme8-checkout.css`, sist i fältet.
3. Spara — **publicera inte**.
4. Kontrollera `/sv/checkout?preview=v9kzdmqz4w60l5n` med vara + paket.

## Övrigt (mindre, redan dokumenterat i CHECKOUT.md)

- Fraktsättets namn/beskrivning ("Fraktkostnad", tom beskrivning).
- Paketartiklarnas adminnamn ("PILOT T19 – …", "(blandbart)") syns i
  Kustom och orderbekräftelse; egna bilder på paketartiklarna.
- Kundtyp Företag: behövs den?
- Cookiebannern saknar "Neka alla" på första lagret.
