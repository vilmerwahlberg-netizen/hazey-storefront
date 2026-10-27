#!/bin/sh
# TASK 01G -- verifiering, sekventiellt (ett Playwright-jobb åt gången).
cd "$(dirname "$0")"
node empty.mjs   # (vapes-läget kompletteras manuellt med volym, se REPORT)
node family.mjs before 393,1440,1920 normal
node family.mjs after 393,1440,1920 normal,filtered,sorted,empty
node tabs.mjs after
AUDIT_BASE="$T01G_BASE/dist/theme8" node functional.mjs base
node functional.mjs after
node portal.mjs before
node portal.mjs after
node diff.mjs
