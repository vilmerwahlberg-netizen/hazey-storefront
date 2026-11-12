#!/usr/bin/env python3
"""TASK 17B: 301-lista WordPress -> verkliga Nyehandel-URL:er (efter migreringen).
Källa: data/MIGRATION-RESULTS.json (verifierade, HTTP 200). Format som Nyehandels
url_redirects: from = sökväg utan domän, gemener, utan avslutande snedstreck
(Nyehandel lagrar så), to = sökväg i butiken. Skapas INTE i Nyehandel förrän
domänbytet (kräver url-redirect:create). Användning: redirects.py"""
import json, csv, os, collections, urllib.request
D = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "data")
R = json.load(open(os.path.join(D, "MIGRATION-RESULTS.json")))
rows = []
for r in R:
    frm = urllib.request.urlparse(r["old_url"]).path.rstrip("/").lower()
    to = urllib.request.urlparse(r["new_url"]).path
    rows.append({"from": frm, "to": to, "type": "blog-post", "status_to": r["status"], "nh_id": r["nh_id"], "note": "artikel"})
HUBS = [("/artiklar-cannabis-laglig-alternativ-vad-ar-thch-thcjd", "WP-sida som var blogghubb"), ("/nyheter", "WP-sida (blogg)"),
        ("/category/fordjupning", "WP-kategoriarkiv"), ("/author/hazey", "WP-författararkiv")]
for frm, note in HUBS: rows.append({"from": frm, "to": "/sv/posts", "type": "any", "status_to": 200, "nh_id": "", "note": note})
froms = collections.Counter(r["from"] for r in rows); tos = collections.Counter(r["to"] for r in rows if r["type"] == "blog-post")
assert all(v == 1 for v in froms.values()), "dubbla from"
assert all(v == 1 for v in tos.values()), "två artiklar till samma mål"
assert all(r["status_to"] == 200 for r in rows if r["type"] == "blog-post")
with open(os.path.join(D, "REDIRECTS.csv"), "w", newline="") as f:
    w = csv.writer(f); w.writerow(["from", "to", "type", "code", "nh_id", "note"])
    for r in rows: w.writerow([r["from"], r["to"], r["type"], 301, r["nh_id"], r["note"]])
print(len(rows), "regler:", sum(r["type"] == "blog-post" for r in rows), "artiklar (1:1, mål 200) +", len(HUBS), "hubbar")
