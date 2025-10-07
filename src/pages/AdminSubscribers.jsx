import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import API from "../api";
import Pagination from "../components/Pagination";
import { authHeader, clearAuth, getAuth } from "../auth";

export default function AdminSubscribers() {
  const navigate = useNavigate();
  const auth = getAuth();
  const [q, setQ] = useState("");
  const [page, setPage] = useState(0);
  const [data, setData] = useState({ content: [], totalPages: 0 });
  const [newEmail, setNewEmail] = useState("");
  const [msg, setMsg] = useState("");

  const load = async () => {
    try {
      const res = await API.adminListSubscribers(auth, { q, page, size: 20 });
      if (Array.isArray(res)) {
        setData({ content: res, totalPages: 1 });
        //console.log(res)
      } else {
        setData(res);
      }
    } catch (e) {
      clearAuth();
      navigate("/admin/login", { replace: true });
    }
  };

  useEffect(() => {
    load();
  }, [q, page]);

  const add = async () => {
    const email = newEmail.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setMsg("Unesite ispravnu e-mail adresu.");
      return;
    }
    try {
      await API.adminAddSubscriber(auth, email);
      setNewEmail("");
      setMsg("Pretplatnik dodat.");
      load();
    } catch (e) {
        setMsg("Greška pri dodavanju.");
    }
  };

  const remove = async (id) => {
    try {
      await API.adminDeactivateSubscriber(auth, id);
      setMsg("Pretplatnik obrisan.");
      load();
    } catch (e) {
      setMsg("Greška pri brisanju.");
    }
  };

  return (
    <div className="container">
      <div className="nav">
        <h2>Pretplatnici</h2>
        <div className="row" style={{ gap: 8 }}>
          <a href="/admin"><button>Nazad na pisma</button></a>
          <button onClick={() => { clearAuth(); navigate("/", { replace: true }); }}>Logout</button>
        </div>
      </div>

      {msg && <div className={msg.includes("Greška") ? "error" : "success"} style={{ marginTop: 12 }}>{msg}</div>}

      <div className="card" style={{ marginTop: 12 }}>
        <div className="row" style={{ gap: 8, flexWrap: "wrap" }}>
          <input
            className="input"
            placeholder="Pretraga (po e-mailu)…"
            value={q}
            onChange={(e) => { setPage(0); setQ(e.target.value); }}
            style={{ flex: 1, minWidth: 240 }}
          />
        </div>
      </div>

      <div className="card" style={{ marginTop: 12 }}>
        <h3>Dodaj pretplatnika</h3>
        <div className="row" style={{ gap: 8, marginTop: 8 }}>
          <input
            className="input"
            type="email"
            placeholder="Email"
            value={newEmail}
            onChange={(e) => setNewEmail(e.target.value)}
            style={{ flex: 1, minWidth: 240 }}
          />
          <button className="primary" onClick={add}>Dodaj</button>
        </div>
      </div>

      <div className="card" style={{ marginTop: 12 }}>
        <table className="table">
          <thead>
            <tr>
              <th style={{ width: 80 }}>ID</th>
              <th>E-mail</th>
              <th style={{ width: 140 }}>Akcije</th>
            </tr>
          </thead>
          <tbody>
            {Array.isArray(data.content) && data.content
              .filter(s => !q || s.email.toLowerCase().includes(q.toLowerCase()))
              .map(s => (
                <tr key={s.id}>
                  <td className="kbd">{s.id}</td>
                  <td>{s.email}</td>
                  <td>
                    {s.active && <button className="danger" onClick={() => remove(s.id)}>Deaktiviraj</button>}
                  </td>
                </tr>
              ))}
            {(!data.content || data.content.length === 0) && (
              <tr><td colSpan="3" style={{ color: "#9ca3af" }}>Nema pretplatnika.</td></tr>
            )}
          </tbody>
        </table>

        <Pagination
          page={page}
          totalPages={data.totalPages}
          onPrev={() => setPage(p => Math.max(0, p - 1))}
          onNext={() => setPage(p => p + 1)}
        />
      </div>

      <div style={{ marginTop: 10 }}>
        <Blokada />
      </div>

    </div>
  );
}
