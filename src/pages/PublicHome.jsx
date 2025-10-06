import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import API from "../api";
import Pagination from "../components/Pagination";
import {formatDateTime} from "../components/StringFormatter";
import Blokada from "../components/Blokada";
import SubscribeBox from "../components/SubscribeBox";

export default function PublicHome() {
  const [q, setQ] = useState("");
  const [qDrugs, setQDrugs] = useState("");
  const [page, setPage] = useState(0);
  const [data, setData] = useState({ content: [], totalPages: 0 });

  useEffect(() => {
    API.listLetters({ q, page, size: 10 }).then(setData);
  }, [q, page]);

  return (
    <div className="container">
      <div className="nav">
        <h2>Pisma zdravstvenim radnicima</h2>
        {/* svesno NE prikazujemo link ka /admin */}
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
      </div>

      <div className="card" style={{ marginTop: 12 }}>
        <table className="table">
          <thead>
            <tr>
              <th style={{ width: 70 }}>ID</th>
              <th>Naslov</th>
              <th>Lekovi</th>
              <th>Kreirano</th>
              <th>Izmenjeno</th>
              <th style={{ width: 120 }}>PDF</th>
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
                <td><a className="link" href={l.pdfPath} target="_blank" rel="noreferrer">Otvori PDF</a></td>
              </tr>
            ))}
            {(!data.content || data.content.length === 0) && (
              <tr><td colSpan="3" style={{ color: "#9ca3af" }}>Nema rezultata.</td></tr>
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

      <SubscribeBox />
      <Blokada />

    </div>
  );
}
