#!/usr/bin/env python3
"""TASK 17B: verifierar alla migrerade inlägg på den publika Nyehandel-sidan.
Läser data/migration-log.json + data/wp-inventory.json + WordPress-exporten
(artikel-HTML, för textparitet). Skriver data/MIGRATION-RESULTS.csv/.json.
Användning: verify-migration.py <wp_articles_dir>   (bara GET mot publika sidor)"""
import sys, json, re, html, csv, difflib, urllib.request, urllib.error, concurrent.futures as cf, os
D = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "data")
SHOP = "https://hazeyse.nyehandel.se"; UA = "Mozilla/5.0 (Macintosh) seo-audit"
log = json.load(open(os.path.join(D, "migration-log.json")))
inv = {x["slug"]: x for x in json.load(open(os.path.join(D, "wp-inventory.json")))}
wpdir = sys.argv[1]
cache = {}
def get(u, body=False):
    if u in cache and not body: return cache[u]
    try:
        r = urllib.request.urlopen(urllib.request.Request(u, headers={"User-Agent": UA}), timeout=40)
        data = r.read(); res = (r.status, r.geturl(), data.decode("utf-8", "replace") if body else "")
    except urllib.error.HTTPError as e: res = (e.code, u, "")
    except Exception as e: res = (0, u, str(e))
    if not body: cache[u] = res
    return res
def txt(s): return re.sub(r"\s+", " ", html.unescape(re.sub(r"<[^>]+>", " ", re.sub(r"<!--.*?-->", "", s, flags=re.S)))).strip()
BAD = re.compile(r"Ã.|Â|�|&#\d+;|&[a-z]+;")
def check(slug):
    p = log["posts"][slug]; x = inv[slug]; url = f"{SHOP}/sv/post/{slug}"
    st, final, h = get(url, body=True)
    head = h.split("</head>")[0]
    m = lambda pat: (re.search(pat, head, re.S) or [None, None])[1]
    title = html.unescape(m(r"<title>(.*?)</title>") or "").strip()
    desc = html.unescape(m(r'<meta name="description" content="([^"]*)"') or "")
    canon = m(r'<link rel="canonical" href="([^"]*)"'); robots = m(r'<meta name="robots" content="([^"]*)"')
    h1 = txt((re.search(r"<h1[^>]*>(.*?)</h1>", h, re.S) or [None, ""])[1])
    pub = txt((re.search(r'class="published-at"[^>]*>(.*?)<', h, re.S) or [None, ""])[1])
    i = h.find('class="blog-post"'); art = h[i:h.find("</section>", i)]
    c = art.find("blog-post__content"); body = art[c:]; body = body[body.find(">") + 1:body.rfind("blog-post__footer")]
    imgs = re.findall(r'<img[^>]+src="([^"]+)"', art)
    img_res = [(u, get(u)[0]) for u in imgs]
    links = [h_ for h_ in re.findall(r'<a[^>]+href="([^"]+)"', body)]
    internal = [l for l in links if l.startswith("/") or l.startswith(SHOP)]
    link_res = [(l, get(l if l.startswith("http") else SHOP + l)[0]) for l in internal]
    wp = txt(open(os.path.join(wpdir, slug + ".html")).read()); nh = txt(body)
    ratio = round(difflib.SequenceMatcher(None, wp, nh, autojunk=False).ratio(), 4)
    date_ok = x["date"][:10] in pub or x["date"][:10] == (p.get("published_at") or "")[:10]
    res = {"slug": slug, "wp_id": x["id"], "old_url": x["old_url"], "new_url": url, "nh_id": p.get("nh_id"),
           "status": st, "title_ok": title == (x["seo_title"] or "").strip(), "title": title,
           "meta_description": desc, "desc_ok": bool(desc) and not BAD.search(desc), "desc_from_wp": bool(x["meta_description"]),
           "canonical_ok": canon == url, "robots": robots, "h1_ok": h1 == x["title"], "date_ok": date_ok, "published": pub,
           "images": len(imgs), "images_ok": sum(1 for _, s in img_res if s == 200), "images_bad": [u for u, s in img_res if s != 200],
           "cover": bool(p.get("cover")), "missing_in_wp": [i["src"] for i in p.get("images", []) if i.get("status") == "missing-in-wp"],
           "internal_links": len(internal), "links_ok": sum(1 for _, s in link_res if s == 200), "links_bad": [f"{l} ({s})" for l, s in link_res if s != 200],
           "text_ratio": ratio, "notes": p.get("notes", [])}
    res["ok"] = all([st == 200, res["title_ok"], res["canonical_ok"], res["h1_ok"], res["date_ok"], not res["images_bad"], not res["links_bad"], ratio >= 0.97, res["desc_ok"] or not res["desc_from_wp"]])
    return res
slugs = [s for s in log["posts"] if log["posts"][s].get("nh_id")]
with cf.ThreadPoolExecutor(6) as ex: out = list(ex.map(check, slugs))
out.sort(key=lambda r: inv[r["slug"]]["date"])
json.dump(out, open(os.path.join(D, "MIGRATION-RESULTS.json"), "w"), ensure_ascii=False, indent=1)
with open(os.path.join(D, "MIGRATION-RESULTS.csv"), "w", newline="") as f:
    w = csv.writer(f)
    w.writerow(["wp_id", "gammal_url", "ny_url", "nh_id", "http", "titel_ok", "h1_ok", "datum_ok", "canonical_ok", "robots", "metabeskrivning", "bilder_ok", "bilder_saknas_redan_i_wp", "interna_länkar_ok", "trasiga_länkar", "textlikhet", "ok", "ingrepp"])
    for r in out:
        w.writerow([r["wp_id"], r["old_url"], r["new_url"], r["nh_id"], r["status"], r["title_ok"], r["h1_ok"], r["date_ok"], r["canonical_ok"], r["robots"], r["meta_description"][:160],
                    f'{r["images_ok"]}/{r["images"]}', len(r["missing_in_wp"]), f'{r["links_ok"]}/{r["internal_links"]}', " ".join(r["links_bad"]), r["text_ratio"], r["ok"], " | ".join(r["notes"])])
print(len(out), "inlägg;", sum(r["ok"] for r in out), "ok")
for k in ("status", "title_ok", "h1_ok", "date_ok", "canonical_ok", "desc_ok"):
    bad = [r["slug"] for r in out if (r[k] != 200 if k == "status" else not r[k])]
    if bad: print(" ", k, "avviker:", len(bad), bad[:6])
print("  bilder:", sum(r["images_ok"] for r in out), "/", sum(r["images"] for r in out), "laddar; saknas redan i WP (borttagna):", sum(len(r["missing_in_wp"]) for r in out))
print("  interna länkar:", sum(r["links_ok"] for r in out), "/", sum(r["internal_links"] for r in out), "ok")
for r in out:
    if r["links_bad"] or r["images_bad"]: print("   ", r["slug"], r["links_bad"], r["images_bad"])
print("  textlikhet min:", min(r["text_ratio"] for r in out), [(r["slug"], r["text_ratio"]) for r in out if r["text_ratio"] < 0.97])
print("  robots:", set(r["robots"] for r in out))
