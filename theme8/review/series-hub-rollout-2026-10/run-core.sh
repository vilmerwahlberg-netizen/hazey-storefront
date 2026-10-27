#!/bin/sh
# TASK 04C-B5 Core -- sekventiellt. SH_BASE = git archive 8a7132e (Nano-11) + build.
cd "$(dirname "$0")"
node hub.mjs after core 320,393,430
node hub.mjs after core 1440,1920
node hub.mjs after core 1440 zoom
FAIL_PATH=/sv/categories/alla-vapes node hub.mjs after core 393 "" fail
node hub.mjs after core 1440 "" slow
node interact.mjs after core 1440
node interact.mjs after core 393
node hub.mjs before core 393,1440
node regress.mjs before magic-sauce,thcab,thcba,nano11,alla-vapes,core-vapes,alla-buds,m-s-vapes,home,pdp,butik 393,1440
node regress.mjs after magic-sauce,thcab,thcba,nano11,alla-vapes,core-vapes,alla-buds,m-s-vapes,home,pdp,butik 393,1440
node regress.mjs diff
