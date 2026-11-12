#!/usr/bin/env python3
"""Admin-CSV: Nyehandel-sidor med bokstavliga Yoast-variabler i metatitel/-beskrivning
och föreslagen rättning (exakt WordPress-rendering: %%sep%% -> "-",
%%sitename%% -> "Hazey.se", %%title%% -> sidans H1). Pausade 5 g-paket listas
men markeras ÄNDRA EJ.  Användning: meta-fixes.py nh-meta.json out.csv"""
import sys, json, csv, re
PAUSED = re.compile(r"/(ms50-5g|nano11-buds-\d+-pack|high-life-5g)")
def fix(v, h1):
    if not v or "%%" not in v: return v
    v = v.replace("%%sep%%", "-").replace("%%sitename%%", "Hazey.se").replace("%%title%%", h1 or "")
    v = re.sub(r"%%[a-z_]+%%", "", v); v = re.sub(r"\s{2,}", " ", v)
    return v.strip(" -|")
rows = []
for x in json.load(open(sys.argv[1])):
    t, d = x["title"] or "", x["description"] or ""
    if "%%" not in t and "%%" not in d: continue
    h1 = x["h1"][0] if x["h1"] else ""
    paused = bool(PAUSED.search(x["url"]))
    rows.append([x["url"].replace("https://hazeyse.nyehandel.se", ""), "ÄNDRA EJ (pausat 5 g-paket)" if paused else "rätta i admin",
                 t, fix(t, h1) if "%%" in t else "", d, fix(d, h1) if "%%" in d else ""])
with open(sys.argv[2], "w", newline="") as f:
    w = csv.writer(f); w.writerow(["route", "åtgärd", "titel_nu", "titel_ny", "beskrivning_nu", "beskrivning_ny"]); w.writerows(rows)
print(len(rows), "sidor;", sum(1 for r in rows if r[1].startswith("ÄNDRA EJ")), "pausade")
