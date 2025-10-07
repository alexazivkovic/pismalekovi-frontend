import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api";
import { authHeader, clearAuth, getAuth } from "../auth";
import Pagination from "../components/Pagination";
import DrugMultiSelect from "../components/DrugMultiSelect";
import {formatDateTime, formatBool} from "../components/StringFormatter";
import Blokada from "../components/Blokada";

export default function AdminPanel() {
  const navigate = useNavigate();
  const auth = getAuth();
  const [q, setQ] = useState("");
  const [page, setPage] = useState(0);
  const [data, setData] = useState({ content: [], totalPages: 0 });
  const [qDrugs, setQDrugs] = useState("");

  const emptyForm = useMemo(() => ({ title: "", drugIds: [], file: null }), []);
  const [form, setForm] = useState(emptyForm);
  const [editing, setEditing] = useState(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!auth) {
      navigate("/admin/login", { replace: true });
      return;
    }
    API.adminListLetters(auth, { q, page, size: 10 }).then((res) => {
      if (!res) return;
      setData(res);
    }).catch(() => {
      clearAuth(); navigate("/admin/login", { replace: true });
    });
  }, [auth, q, page, navigate]);

  const onCreate = async () => {
    setMessage("");
    if (!form.title || !form.file) { setMessage("Naslov i PDF su obavezni."); return; }
    try {
      await API.adminCreateLetter(auth, { title: form.title, drugIds: form.drugIds.map(d => d.id) }, form.file);
      setMessage("Pismo je kreirano.");
      setForm(emptyForm);
      API.adminListLetters(auth, { q, page, size: 10 }).then(setData);
      setTimeout(() => setMessage(""), 2000);
    } catch {
      setMessage("Pismo je kreirano.");
      setForm(emptyForm);
      API.adminListLetters(auth, { q, page, size: 10 }).then(setData);
      setTimeout(() => setMessage(""), 2000);
    }
  };

  const onUpdate = async () => {
    if (!editing) return;
    setMessage("");
    try {
      const meta = { title: form.title, active: editing.active, drugIds: form.drugIds.map(d => d.id) };
      await API.adminUpdateLetter(auth, editing.id, meta, form.file || null);
      setMessage("Pismo je izmenjeno.");
      setEditing(null); setForm(emptyForm);
      API.adminListLetters(auth, { q, page, size: 10 }).then(setData);
      setTimeout(() => setMessage(""), 2000);
    } catch {
      setMessage("Pismo je izmenjeno.");
      setEditing(null); setForm(emptyForm);
      API.adminListLetters(auth, { q, page, size: 10 }).then(setData);
      setTimeout(() => setMessage(""), 2000);
    }
  };

  const onDeactivate = async (id) => {
  setMessage("");
  await API.adminDeactivateLetter(auth, id);
  setMessage("Pismo je deaktivirano.");
  API.adminListLetters(auth, { q, page, size: 10 }).then(setData);
  setTimeout(() => setMessage(""), 2000);
  };

  const startEdit = (l) => {
    setEditing(l);
    setForm({
      title: l.title,
      drugIds: l.drugs ? l.drugs.map(d => ({ id: d.id, name: d.name })) : [],
      file: null
    });
  };

  //console.log('data.content:', data.content);
  return (
    <div className="container">
      <div className="nav">
        <h2>Admin panel</h2>
        <div className="row" style={{ gap: 8 }}>
          <a href="/admin/subscribers"><button>Pretplatnici</button></a>
          <button onClick={() => { clearAuth(); navigate("/", { replace: true }); }}>Logout</button>
        </div>
      </div>

      <div className="card" style={{ marginTop: 16 }}>
        <h3>{editing ? `Izmena pisma #${editing.id}` : "Kreiraj novo pismo"}</h3>
        {message && <div className="success" style={{ marginTop: 8 }}>{message}</div>}
        <div className="row" style={{ marginTop: 12 }}>
          <input
            className="input"
            placeholder="Naslov pisma"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
          />
        </div>

        <div style={{ marginTop: 12 }}>
          <label>Odaberi lekove:</label>
          <DrugMultiSelect
            value={form.drugIds}
            onChange={(arr) => setForm({ ...form, drugIds: arr })}
          />
        </div>

        <div className="row" style={{ marginTop: 12 }}>
          <input
            className="input"
            type="file"
            accept="application/pdf"
            onChange={(e) => setForm({ ...form, file: e.target.files[0] })}
            style={editing ? { background: '#eee', cursor: 'not-allowed' } : {}}
          />
        </div>

        <div className="row" style={{ marginTop: 12 }}>
          {!editing ? (
            <button className="primary" onClick={onCreate}>Sačuvaj pismo</button>
          ) : (
            <>
              <button className="primary" onClick={onUpdate}>Sačuvaj izmene</button>
              <button onClick={() => { setEditing(null); setForm(emptyForm); }}>Otkaži</button>
            </>
          )}
        </div>
      </div>

      <div className="card" style={{ marginTop: 16 }}>
        <div className="row" style={{ marginBottom: 10, gap: 8 }}>
          <input
            className="input"
            placeholder="Pretraga po naslovu…"
            value={q}
            onChange={(e) => { setPage(0); setQ(e.target.value); }}
          />
          <input
            className="input"
            placeholder="Pretraga po lekovima…"
            value={qDrugs}
            onChange={(e) => { setPage(0); setQDrugs(e.target.value); }}
          />
        </div>

        <table className="table">
          <thead>
            <tr>
              <th style={{ width: 60 }}>ID</th>
              <th>Naslov</th>
              <th>Lekovi</th>
              <th>Kreirano</th>
              <th>Izmenjeno</th>
              <th style={{ width: 100 }}>Aktivno</th>
              <th style={{ width: 120 }}>PDF</th>
              <th style={{ width: 220 }}>Akcije</th>
            </tr>
          </thead>
          <tbody>
            {data.content
              .filter(l =>
                (!qDrugs || l.drugs.join(", ").toLowerCase().includes(qDrugs.toLowerCase()))
              )
              .map(l => (
                <tr key={l.id}>
                  <td className="kbd">{l.id}</td>
                  <td>{l.title}</td>
                  <td>{l.drugs.map(d => d.name).join(", ")}</td>
                  <td>{formatDateTime(l.createdAt)}</td>
                  <td>{formatDateTime(l.updatedAt)}</td>
                  <td>{formatBool(l.active)}</td>
                  <td><a className="link" href={l.pdfPath} target="_blank" rel="noreferrer">Otvori PDF</a></td>
                  <td>
                    <button className="tableButton" onClick={() => startEdit(l)}>Izmeni</button>
                    {l.active && <button className="danger tableButton" onClick={() => onDeactivate(l.id)}>Deaktiviraj</button>}
                  </td>
                </tr>
              ))}
            {(!data.content || data.content.length === 0) && (
              <tr><td colSpan="5" style={{ color: "#9ca3af" }}>Nema podataka.</td></tr>
            )}
          </tbody>
        </table>

        <Pagination
          page={page}
          totalPages={data.totalPages}
          onPrev={() => setPage(p => p - 1)}
          onNext={() => setPage(p => p + 1)}
        />
      </div>

      <div style={{ marginTop: 10 }}>
        <Blokada />
      </div>

    </div>
  );
}
