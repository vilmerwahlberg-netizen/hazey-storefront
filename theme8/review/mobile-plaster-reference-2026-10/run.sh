#!/bin/sh
# TASK 01D-R -- verifiering, sekventiellt (ett Playwright-jobb åt gången).
# T01DR_BASE = git archive 73fd9c1 + build (före), arbetskopian = efter.
cd "$(dirname "$0")"
F=alla-vapes,buds,hasch,alla-produkter
node shoot.mjs before $F 393
node shoot.mjs after $F 320,393,430
node shoot.mjs after $F 1440 "" zoom
node shoot.mjs after $F 393 full
node shoot.mjs before $F 1440,1920
node shoot.mjs after $F 1440,1920
node shoot.mjs before magic-sauce,m-s-vapes,thcab-vapes,pdp 393,1440
node shoot.mjs after magic-sauce,m-s-vapes,thcab-vapes,pdp 393,1440
node diff.mjs
node ready.mjs after alla-vapes,alla-produkter cold,warm,throttled
node ready.mjs after buds,hasch cold
node dock-verify.mjs after alla-vapes,buds 393
node functional.mjs base
node functional.mjs after
for r in alla-vapes buds hasch alla-produkter; do node sheet.mjs cmp proof/compare-393-reference-before-after-$r.jpg $r; done
node sheet.mjs grid proof/after-320-393-430-zoom200.jpg $F after-320,after-393,after-430,after-1440-z200
node taps.mjs after
