#!/bin/sh
# TASK 04C-B4 Nano-11 -- sekventiellt. SH_BASE = git archive ce18e40 (THCbA) + build.
cd "$(dirname "$0")"
node hub.mjs after nano11 320,393,430
node hub.mjs after nano11 1440,1920
node hub.mjs after nano11 1440 zoom
node hub.mjs after nano11 393 "" fail
node hub.mjs after nano11 1440 "" slow
node interact.mjs after nano11 1440
node interact.mjs after nano11 393
node hub.mjs before nano11 393,1440
node regress.mjs before magic-sauce,thcab,thcba,alla-vapes,m-s-vapes,home,pdp 393,1440
node regress.mjs after magic-sauce,thcab,thcba,alla-vapes,m-s-vapes,home,pdp 393,1440
node regress.mjs diff
