# Verified lab documents in the universal PDP

Source: Task 10A `woocommerce-pdp-inventory-2026-10/ANALYSIS-DOCUMENT-MAP.md`, the table "Nyehandel: varje PDF-länk".

A Nyehandel PDF counts as **verified** only when:
- it is byte-identical to a WooCommerce file, and
- the strain in that file's name matches the product, or the variant for per-variant documents (assessment "rätt strain").

This is the decision of 2026-10-29: WooCommerce restores the mapping, and the strain in the file name is the verification.

The adapter (`theme8/js/85-pdp-pilot.js`, `VERIFIED_DOCS`) shows "Visa labbrapport (PDF)" only for these files. It also requires that the link still exists in the product's own text.

All other lab PDFs are hidden in the product text, and the analysis chapter shows "Labbrapport skickas på begäran" instead. That covers:
- wrong strain;
- batch or distillate files (copy decision missing);
- files without a WooCommerce counterpart.

| Nyehandel id | Product | Mode | Verified file(s) → strain |
|---:|---|---|---|
| 37 | Isolat – THCA 99% – Isolate – 5 gram | product | `19rrcW2L5Gf6AXf1779352050.pdf` → Isolate (the batch file `TtvYzP2…` on the same page is hidden) |
| 59 | Buds – Magic Sauce 50% – Yoda Ice Cream | product | `ojo0zzScCBGu6gy1779352051.pdf` (the Tinky Winky COA on the same page is hidden) |
| 60 | Buds – Magic Sauce 50% – Gorilla Cookies | product | `NmUchonZgUwJb4P1779352051.pdf` (the Tinky Winky COA is hidden) |
| 65 | Buds – THCA 20% + THCNM 10% – Black Widow | product | `p4vCO2OvP0y3dEE1779352051.pdf` |
| 74 | Buds – Magic Sauce 50% – Tinky Winky | product | `zg59nv2Auft0UWR1779352050.pdf` |
| 84 | Buds – Magic Sauce 50% – Samurai Jack | product | `lY1pJXgHfxFM8b01779352053.pdf` |
| 93 | Buds – Magic Sauce 50% – Khalifa Kush | product | `wNRiFbSXRo9DRuj1779352055.pdf`, `LBfA221dWjqNjmj1779352424.pdf` (same COA) |
| 96 | Buds – Magic Sauce 50% – Donny Burger | product | `zTOE7RpoyYkKHa61779352055.pdf`, `eKNuDapPT4zdWjE1779352424.pdf` |
| 100 | Buds – Magic Sauce 50% – Crazy Dog | product | `PYwtgHnnWw3vv4d1779352055.pdf`, `KrCA5frGLYWCSqT1779352424.pdf` |
| 91 | Vape – Magic Sauce 99% – 2ml | per strain | Crazy Dog `l0NgRCtAD74iTGE1779352423.pdf`, Gorilla Cookies `NXar8ZZ3wR5QrOP1779352054.pdf`, High Pepito `BtF0HZ3iAmGEopJ1779352054.pdf`, Samurai Jack `GgJNCiH47aEpW8P1779352423.pdf`, Yoda Ice Cream `V1funsKGwRGyh8N1779352054.pdf` |
| 92 | Cart – Magic Sauce 99% – 1ml | per strain | as 91, except Samurai Jack `1tlHW9YYyoLxZJd1779352054.pdf` |

**Known wrong files that are hidden:**
- **120 La Chupacabra:** the Samurai Jack COA.
- **119 Charas and 77 Marrakesh Dream:** the Gorilla Cookies COA.
- **82 Wedding Cake:** the Black Widow COA.

The 91 ↔ Magic Sauce 3.0 match is "osäker" in the migration table. The PDFs, however, are byte-identical and the strain is in the file name, so the per-strain mapping is verified.

**Batch and distillate reports** (Nano10 `C9400028`, Nano11 `DEST1`, HHCPM buds) are hidden until the copy decision for batch/raw-material labels has been made (Task 10A, open decision).
