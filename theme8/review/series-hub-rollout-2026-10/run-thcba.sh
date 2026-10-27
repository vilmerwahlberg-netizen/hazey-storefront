#!/bin/sh
# TASK 04C-B2 THCbA -- sekventiellt. SH_BASE = git archive ceb240a (THCaB) + build.
cd "$(dirname "$0")"
node hub.mjs after thcba 320,393,430
node hub.mjs after thcba 1440,1920
node hub.mjs after thcba 1440 zoom
node hub.mjs after thcba 393 "" fail
node hub.mjs after thcba 1440 "" slow
node interact.mjs after thcba 1440
node interact.mjs after thcba 393
node hub.mjs before thcba 393,1440
node regress.mjs before magic-sauce,thcab,alla-vapes,m-s-vapes,home,pdp 393,1440
node regress.mjs after magic-sauce,thcab,alla-vapes,m-s-vapes,home,pdp 393,1440
node regress.mjs diff
