const json = async (r) => {
  if (r.status === 204) return null;
  const t = await r.text();
  try { return t ? JSON.parse(t) : null; } catch { throw new Error("Neispravan JSON odgovor"); }
};

const API = {
  listLetters: async ({ q = "", page = 0, size = 10 } = {}) =>
    json(await fetch(`/api/public/letters?q=${encodeURIComponent(q)}&page=${page}&size=${size}`)
),

  getLetter: async (id) => json(await fetch(`/api/public/letters/${id}`)
),

  searchDrugs: async (q = "", page = 0, size = 10) =>
    json(await fetch(`/api/public/drugs?q=${encodeURIComponent(q)}&page=${page}&size=${size}`)
  ),

  adminListLetters: async (auth, { q = "", page = 0, size = 10 } = {}) =>
    json(await fetch(`/api/admin/letters?q=${encodeURIComponent(q)}&page=${page}&size=${size}`, {
      headers: { Authorization: `Basic ${auth}` }
    })
  ),

  adminCreateLetter: async (auth, meta, file) => {
    const fd = new FormData();
    fd.append("meta", new Blob([JSON.stringify(meta)], { type: "application/json" }));
    fd.append("file", file);
    return json(await fetch(`/api/admin/letters`, {
      method: "POST",
      headers: { Authorization: `Basic ${auth}` },
      body: fd
    }));
  },

  adminUpdateLetter: async (auth, id, meta, maybeFile) => {
    const fd = new FormData();
    fd.append("meta", new Blob([JSON.stringify(meta)], { type: "application/json" }));
    if (maybeFile) fd.append("file", maybeFile);
    return json(await fetch(`/api/admin/letters/${id}`, {
      method: "PUT",
      headers: { Authorization: `Basic ${auth}` },
      body: fd
    }));
  },

  adminDeactivateLetter: async (auth, id) =>
    fetch(`/api/admin/letters/${id}/deactivate`, {
      method: "POST",
      headers: { Authorization: `Basic ${auth}` }
    }
  ),

  publicSubscribe: async (email) => {
    const params = new URLSearchParams();
    params.append("email", email);
    const r = await fetch(`/api/public/subscribe`, {
      method: "POST",
      body: params
    });
    if (!r.ok) throw new Error(`HTTP ${r.status}`);
    return json(r);
  },

  adminListSubscribers: async (auth, { q = "", page = 0, size = 10 } = {}) =>
    json(await fetch(`/api/admin/subscribers?q=${encodeURIComponent(q)}&page=${page}&size=${size}`, {
      headers: { Authorization: `Basic ${auth}` }
    })
  ),

  adminAddSubscriber: async (auth, email) => {
    const params = new URLSearchParams();
    params.append("email", email);
    const r = await fetch(`/api/admin/subscribers`, {
      method: "POST",
      headers: { Authorization: `Basic ${auth}` },
      body: params
    });
    if (!r.ok) throw new Error(`HTTP ${r.status}`);
    return json(r);
  },

  adminDeactivateSubscriber: async (auth, id) =>
    fetch(`/api/admin/subscribers/${id}/deactivate`, {
      method: "POST",
      headers: { Authorization: `Basic ${auth}` }
    }
  ),

};

export default API;
