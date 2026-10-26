#!/bin/sh
# TASK 01D -- verifiering, sekventiellt (ett Playwright-jobb åt gången).
cd "$(dirname "$0")"
F=alla-vapes,buds,hasch,alla-produkter
node shoot.mjs before $F 393
node shoot.mjs after $F 320,393,430
node shoot.mjs after $F 393 full
node shoot.mjs after alla-vapes-f,buds-f,hasch-f,alla-produkter-sq 393
node shoot.mjs before alla-vapes-f,buds-f,hasch-f,alla-produkter-sq 393
node shoot.mjs after $F 1440 "" zoom
node shoot.mjs before $F 1440,1920
node shoot.mjs after $F 1440,1920
node shoot.mjs before magic-sauce,m-s-vapes,thcab-vapes 393,1440
node shoot.mjs after magic-sauce,m-s-vapes,thcab-vapes 393,1440
node diff.mjs
node ready.mjs after alla-vapes,alla-produkter cold,warm,throttled
node ready.mjs after buds,hasch cold
