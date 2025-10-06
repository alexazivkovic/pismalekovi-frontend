import { useEffect, useRef, useState } from "react";
import API from "../api";

export default function DrugMultiSelect({ value = [], onChange }) {
  const [q, setQ] = useState("");
  const [opts, setOpts] = useState([]);
  const [page, setPage] = useState(0);
  const boxRef = useRef(null);

  useEffect(() => {
    let cancel = false;
    const load = async () => {
      const res = await API.searchDrugs(q, page, 10);
      if (!cancel) setOpts(res?.content || []);
    };
    load();
    return () => { cancel = true; };
  }, [q, page]);

  const add = (d) => {
    if (!value.find(v => v.id === d.id)) onChange([...value, d]);
    setQ("");
  };
  const remove = (id) => onChange(value.filter(v => v.id !== id));

  return (
    <div className="card" ref={boxRef}>
      <div className="row">
        <input
          placeholder="Pretraži lekove…"
          className="input"
          value={q}
          onChange={(e) => { setPage(0); setQ(e.target.value); }}
        />
        <button onClick={() => setQ(q)}>Traži</button>
      </div>

      {!!q && (
        <div style={{ marginTop: 8, background: "#0b1220", border: "1px solid #1f2937", borderRadius: 10, maxHeight: 200, overflow: "auto" }}>
          {opts.map(o => (
            <div key={o.id} style={{ padding: 8, cursor: "pointer" }} onClick={() => add(o)}>
              <b>{o.name}</b> {o.atc && <span className="badge">{o.atc}</span>} {o.manufacturer && <span style={{ color: "#9ca3af" }}>— {o.manufacturer}</span>}
            </div>
          ))}
          {opts.length === 0 && <div style={{ padding: 8, color: "#9ca3af" }}>Nema rezultata.</div>}
        </div>
      )}

      {value.length > 0 && (
        <>
          <hr />
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {value.map(v => (
              <span key={v.id} className="badge" style={{ display: "inline-flex", gap: 6, alignItems: "center" }}>
                {v.name}
                <button className="danger" onClick={() => remove(v.id)} style={{ padding: "2px 6px" }}>x</button>
              </span>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
