#!/bin/sh
# TASK 01F -- full verifiering, sekventiellt (ett Playwright-jobb åt gången).
cd "$(dirname "$0")"
R=home,alla-vapes,alla-produkter,magic-sauce,pdp
node verify.mjs before $R 393,1440
node verify.mjs after $R 393,1440
