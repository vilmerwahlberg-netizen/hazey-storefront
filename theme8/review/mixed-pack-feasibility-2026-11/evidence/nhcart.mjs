// TASK 19 — isolerad testkorg från terminalen (egen anonym session, ingen order, ingen inloggning).
// Exporterar en liten klient: GET/POST/PUT/DELETE mot /frontend-api med samma headers som butiken.
export function client(origin = "https://hazeyse.nyehandel.se") {
  const UA = "Mozilla/5.0 (Macintosh) task19-cart-probe"; let ck = {};
  const keep = r => { for (const c of r.headers.getSetCookie?.() || []) { const kv = c.split(";")[0]; const i = kv.indexOf("="); ck[kv.slice(0, i)] = kv.slice(i + 1); } };
  const cookie = () => Object.entries(ck).map(([k, v]) => k + "=" + v).join("; ");
  async function page(p) { const r = await fetch(origin + p, { headers: { "User-Agent": UA, Cookie: cookie() } }); keep(r); return { status: r.status, body: await r.text() }; }
  async function api(method, p, body) {
    const r = await fetch(origin + "/frontend-api/" + p, { method, headers: { "User-Agent": UA, Cookie: cookie(), Accept: "application/json", "Content-Type": "application/json", "X-Requested-With": "XMLHttpRequest", "X-XSRF-TOKEN": decodeURIComponent(ck["XSRF-TOKEN"] || "") }, body: body ? JSON.stringify(body) : undefined });
    keep(r); const t = await r.text(); let j = null; try { j = JSON.parse(t); } catch { }
    return { status: r.status, json: j, text: j ? null : t.slice(0, 400) };
  }
  return { page, api, cookies: () => ck };
}
