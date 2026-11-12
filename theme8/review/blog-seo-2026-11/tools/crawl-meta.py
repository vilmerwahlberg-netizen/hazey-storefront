#!/usr/bin/env python3
"""Hämtar SEO-metadata (title, description, robots, canonical, h1, og:image)
för en lista URL:er. Read-only GET, generisk User-Agent.
Användning: crawl-meta.py urls.txt out.json"""
import sys, json, re, html, urllib.request, concurrent.futures as cf
UA = "Mozilla/5.0 (Macintosh) seo-audit"
def get(u):
    try:
        req = urllib.request.Request(u, headers={"User-Agent": UA})
        with urllib.request.urlopen(req, timeout=40) as r:
            return r.status, r.geturl(), r.read().decode("utf-8", "replace")
    except urllib.error.HTTPError as e:
        return e.code, u, ""
    except Exception as e:
        return 0, u, str(e)
def one(u):
    st, final, h = get(u)
    head = h.split("</head>")[0]
    def meta(attr, name):
        m = re.search(r'<meta[^>]+%s=["\']%s["\'][^>]*>' % (attr, re.escape(name)), head, re.I)
        if not m: return None
        c = re.search(r'content=["\']([^"\']*)', m.group(0))
        return html.unescape(c.group(1)) if c else ""
    t = re.search(r"<title[^>]*>(.*?)</title>", head, re.S | re.I)
    can = re.search(r'<link[^>]+rel=["\']canonical["\'][^>]*>', head, re.I)
    canh = re.search(r'href=["\']([^"\']*)', can.group(0)).group(1) if can else None
    body = re.sub(r"<script.*?</script>", "", h, flags=re.S)
    h1 = [re.sub(r"\s+", " ", html.unescape(re.sub(r"<[^>]+>", "", x))).strip() for x in re.findall(r"<h1[^>]*>(.*?)</h1>", body, re.S | re.I)]
    return {"url": u, "status": st, "final": final, "title": html.unescape(t.group(1).strip()) if t else None,
            "description": meta("name", "description"), "robots": meta("name", "robots"), "canonical": canh,
            "og_title": meta("property", "og:title"), "og_image": meta("property", "og:image"), "h1": h1}
urls = [l.strip() for l in open(sys.argv[1]) if l.strip()]
with cf.ThreadPoolExecutor(6) as ex:
    res = list(ex.map(one, urls))
json.dump(res, open(sys.argv[2], "w"), ensure_ascii=False, indent=1)
print(len(res), "urls")
