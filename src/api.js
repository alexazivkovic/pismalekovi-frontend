// Definiše pomoćnu async funkciju koja iz Response čita telo kao JSON (ili null za 204)
const json = async (r) => {
  // Ako je HTTP 204 No Content, nema tela → vrati null
  if (r.status === 204) return null;
  // Čita sirovi tekst odgovora (možda prazan string)
  const t = await r.text();
  // Pokušava da parsira JSON; ako je prazan string vrati null; u suprotnom baci grešku
  try { return t ? JSON.parse(t) : null; } catch { throw new Error("Neispravan JSON odgovor"); }
};

// Objekat koji enkapsulira sve pozive prema backend API-ju
const API = {
  // Lista javnih pisama sa paginacijom i opcionalnim upitom
  listLetters: async ({ q = "", page = 0, size = 10 } = {}) =>
    // GET /api/public/letters sa query parametrima; rezultat parsira kroz json()
    json(await fetch(`/api/public/letters?q=${encodeURIComponent(q)}&page=${page}&size=${size}`)
),

  // Dohvata jedno javno pismo po ID-u
  getLetter: async (id) => json(await fetch(`/api/public/letters/${id}`)
),

  // Pretraga lekova (javna), sa paginacijom
  searchDrugs: async (q = "", page = 0, size = 10) =>
    // GET /api/public/drugs sa upitom i stranicom
    json(await fetch(`/api/public/drugs?q=${encodeURIComponent(q)}&page=${page}&size=${size}`)
  ),

  // Admin: lista pisama uz Basic auth zaglavlje
  adminListLetters: async (auth, { q = "", page = 0, size = 10 } = {}) =>
    // GET /api/admin/letters sa Authorization header-om
    json(await fetch(`/api/admin/letters?q=${encodeURIComponent(q)}&page=${page}&size=${size}`, {
      headers: { Authorization: `Basic ${auth}` }
    })
  ),

  // Admin: kreira novo pismo (multipart: meta JSON + PDF fajl)
  adminCreateLetter: async (auth, meta, file) => {
    // Priprema FormData kontejnera
    const fd = new FormData();
    // Dodaje "meta" kao Blob application/json
    fd.append("meta", new Blob([JSON.stringify(meta)], { type: "application/json" }));
    // Dodaje PDF fajl pod ključem "file"
    fd.append("file", file);
    // POST /api/admin/letters sa Basic auth i multipart telom
    return json(await fetch(`/api/admin/letters`, {
      method: "POST",
      headers: { Authorization: `Basic ${auth}` },
      body: fd
    }));
  },

  // Admin: izmena postojećeg pisma (multipart; fajl opciono)
  adminUpdateLetter: async (auth, id, meta, maybeFile) => {
    // Kreira FormData
    const fd = new FormData();
    // Uvek šalje "meta" JSON kao Blob
    fd.append("meta", new Blob([JSON.stringify(meta)], { type: "application/json" }));
    // Ako je prosleđen fajl, dodaje i "file"
    if (maybeFile) fd.append("file", maybeFile);
    // PUT /api/admin/letters/{id} sa Basic auth i multipart telom
    return json(await fetch(`/api/admin/letters/${id}`, {
      method: "PUT",
      headers: { Authorization: `Basic ${auth}` },
      body: fd
    }));
  },

  // Admin: deaktivira pismo (bez tela; vraća sirovi Response, ne prolazi kroz json())
  adminDeactivateLetter: async (auth, id) =>
    // POST /api/admin/letters/{id}/deactivate sa Basic auth
    fetch(`/api/admin/letters/${id}/deactivate`, {
      method: "POST",
      headers: { Authorization: `Basic ${auth}` }
    }
  ),

  // Javno: upis e-mail adrese na listu pretplatnika
  publicSubscribe: async (email) => {
    // Priprema URLSearchParams sa jednim poljem email
    const params = new URLSearchParams();
    // Dodaje email=...
    params.append("email", email);
    // POST /api/public/subscribe sa form-url-encoded telom (podrazumevani header)
    const r = await fetch(`/api/public/subscribe`, {
      method: "POST",
      body: params
    });
    // Ako HTTP status nije 2xx, baca grešku
    if (!r.ok) throw new Error(`HTTP ${r.status}`);
    // Inače parsira odgovor preko json() helpera
    return json(r);
  },

  // Admin: lista pretplatnika sa paginacijom
  adminListSubscribers: async (auth, { q = "", page = 0, size = 10 } = {}) =>
    // GET /api/admin/subscribers sa Authorization header-om
    json(await fetch(`/api/admin/subscribers?q=${encodeURIComponent(q)}&page=${page}&size=${size}`, {
      headers: { Authorization: `Basic ${auth}` }
    })
  ),

  // Admin: ručno dodaje novog pretplatnika (email)
  adminAddSubscriber: async (auth, email) => {
    // Priprema URLSearchParams tela
    const params = new URLSearchParams();
    // Dodaje email=...
    params.append("email", email);
    // POST /api/admin/subscribers sa Basic auth i form telom
    const r = await fetch(`/api/admin/subscribers`, {
      method: "POST",
      headers: { Authorization: `Basic ${auth}` },
      body: params
    });
    // Proverava status i baca grešku ako nije 2xx
    if (!r.ok) throw new Error(`HTTP ${r.status}`);
    // Vraća JSON (ili null) iz odgovora
    return json(r);
  },

  // Admin: deaktivira pretplatnika (bez parsiranja tela)
  adminDeactivateSubscriber: async (auth, id) =>
    // POST /api/admin/subscribers/{id}/deactivate sa Basic auth
    fetch(`/api/admin/subscribers/${id}/deactivate`, {
      method: "POST",
      headers: { Authorization: `Basic ${auth}` }
    }
  ),

};

// Izvozi API objekat kao podrazumevani export
export default API;
