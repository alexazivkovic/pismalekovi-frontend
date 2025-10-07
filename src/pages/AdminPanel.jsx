// Uvoz React hook-ova za stanje, memoizaciju i efekte
import { useEffect, useMemo, useState } from "react";
// Uvoz hook-a za navigaciju kroz rute
import { useNavigate } from "react-router-dom";
// Uvoz API helper objekta za backend pozive
import API from "../api";
// Uvoz auth pomoćnih funkcija (header, čišćenje i čitanje auth-a)
import { authHeader, clearAuth, getAuth } from "../auth";
// Uvoz komponente za paginaciju
import Pagination from "../components/Pagination";
// Uvoz komponentе za izbor više lekova
import DrugMultiSelect from "../components/DrugMultiSelect";
// Uvoz pomoćnih formatter-a za datum/vreme i booleane
import {formatDateTime, formatBool} from "../components/StringFormatter";
// Uvoz informativne komponente sa linkovima o blokadama
import Blokada from "../components/Blokada";

// Definicija i podrazumevani izvoz AdminPanel komponente
export default function AdminPanel() {
  // Inicijalizuje navigaciju
  const navigate = useNavigate();
  // Učitava trenutno sačuvani Basic auth (base64) iz storage-a
  const auth = getAuth();
  // Stanje: tekstualni upit za pretragu naslova
  const [q, setQ] = useState("");
  // Stanje: trenutna strana paginacije
  const [page, setPage] = useState(0);
  // Stanje: rezultat liste pisama (sadržaj + ukupan broj strana)
  const [data, setData] = useState({ content: [], totalPages: 0 });
  // Stanje: dodatni filter po lekovima (tekst)
  const [qDrugs, setQDrugs] = useState("");

  // Kompaktni “prazan” objekat forme (memoizovan da bi referenca bila stabilna)
  const emptyForm = useMemo(() => ({ title: "", drugIds: [], file: null }), []);
  // Stanje: podaci forme za kreiranje/izmenu pisma
  const [form, setForm] = useState(emptyForm);
  // Stanje: trenutno pismo koje se menja (ili null ako se kreira novo)
  const [editing, setEditing] = useState(null);
  // Stanje: poruka korisniku (success/error info)
  const [message, setMessage] = useState("");

  // Efekat: proverava auth i učitava listu pisama pri promeni auth, q ili page
  useEffect(() => {
    // Ako nema auth-a, preusmeri na login
    if (!auth) {
      navigate("/admin/login", { replace: true });
      return;
    }
    // Poziva admin endpoint za listanje pisama sa trenutnim filterom i stranicom
    API.adminListLetters(auth, { q, page, size: 10 }).then((res) => {
      // Ako nema odgovora, ne radi ništa
      if (!res) return;
      // Snima rezultat u stanje (sadržaj, broj strana, itd.)
      setData(res);
    // Ako poziv padne (npr. 401), očisti auth i pošalji korisnika na login
    }).catch(() => {
      clearAuth(); navigate("/admin/login", { replace: true });
    });
  // Zavisnosti: kada se promene auth, q, page ili navigate referenca
  }, [auth, q, page, navigate]);

  // Handler: kreiranje novog pisma
  const onCreate = async () => {
    // Resetuje poruku
    setMessage("");
    // Validacija: naslov i PDF moraju biti postavljeni
    if (!form.title || !form.file) { setMessage("Naslov i PDF su obavezni."); return; }
    try {
      // Poziva API da kreira pismo sa naslovom i ID-jevima lekova
      await API.adminCreateLetter(auth, { title: form.title, drugIds: form.drugIds.map(d => d.id) }, form.file);
      // Postavlja poruku o uspehu
      setMessage("Pismo je kreirano.");
      // Resetuje formu
      setForm(emptyForm);
      // Osvježava listu pisama
      API.adminListLetters(auth, { q, page, size: 10 }).then(setData);
      // Uklanja poruku posle kratkog vremena
      setTimeout(() => setMessage(""), 2000);
    } catch {
      // U slučaju greške, i dalje prikazuje poruku (trenutno isti tekst)
      setMessage("Pismo je kreirano.");
      // Resetuje formu
      setForm(emptyForm);
      // Osvježava listu
      API.adminListLetters(auth, { q, page, size: 10 }).then(setData);
      // Briše poruku nakon 2s
      setTimeout(() => setMessage(""), 2000);
    }
  };

  // Handler: čuvanje izmena postojećeg pisma
  const onUpdate = async () => {
    // Ako nema entiteta za izmenu, prekid
    if (!editing) return;
    // Resetuje poruku
    setMessage("");
    try {
      // Priprema meta polja (naslov, aktivno, lekovi)
      const meta = { title: form.title, active: editing.active, drugIds: form.drugIds.map(d => d.id) };
      // Poziva API za izmenu, uz opcioni fajl
      await API.adminUpdateLetter(auth, editing.id, meta, form.file || null);
      // Poruka o uspehu
      setMessage("Pismo je izmenjeno.");
      // Izlazi iz moda izmene i resetuje formu
      setEditing(null); setForm(emptyForm);
      // Osvježava listu
      API.adminListLetters(auth, { q, page, size: 10 }).then(setData);
      // Briše poruku nakon 2s
      setTimeout(() => setMessage(""), 2000);
    } catch {
      // I u catch grani setuje istu poruku i resetuje
      setMessage("Pismo je izmenjeno.");
      setEditing(null); setForm(emptyForm);
      API.adminListLetters(auth, { q, page, size: 10 }).then(setData);
      setTimeout(() => setMessage(""), 2000);
    }
  };

  // Handler: deaktivacija pisma
  const onDeactivate = async (id) => {
  // Čisti prethodnu poruku
  setMessage("");
  // Poziva API za deaktivaciju konkretnog pisma
  await API.adminDeactivateLetter(auth, id);
  // Postavlja poruku o uspehu
  setMessage("Pismo je deaktivirano.");
  // Osvježava listu
  API.adminListLetters(auth, { q, page, size: 10 }).then(setData);
  // Uklanja poruku nakon 2s
  setTimeout(() => setMessage(""), 2000);
  };

  // Priprema formu za izmenu postojećeg pisma
  const startEdit = (l) => {
    // Setuje trenutno uređivano pismo
    setEditing(l);
    // Popunjava formu vrednostima iz pisma (lekovi mapirani na {id, name})
    setForm({
      title: l.title,
      drugIds: l.drugs ? l.drugs.map(d => ({ id: d.id, name: d.name })) : [],
      file: null
    });
  };

  // Render izlaza komponente (UI)
  return (
    // Glavni kontejner admin panela
    <div className="container">
      {/* Zaglavlje sa naslovom i brzim akcijama */}
      <div className="nav">
        {/* Naslov sekcije */}
        <h2>Admin panel</h2>
        {/* Desni deo zaglavlja sa dugmadima */}
        <div className="row" style={{ gap: 8 }}>
          {/* Link ka ruti sa pretplatnicima */}
          <a href="/admin/subscribers"><button>Pretplatnici</button></a>
          {/* Dugme za odjavu: čisti auth i vodi na početnu stranu */}
          <button onClick={() => { clearAuth(); navigate("/", { replace: true }); }}>Logout</button>
        </div>
      </div>

      {/* Kartica za kreiranje/izmenu pisma */}
      <div className="card" style={{ marginTop: 16 }}>
        {/* Dinamički naslov u zavisnosti od moda (kreiranje/izmena) */}
        <h3>{editing ? `Izmena pisma #${editing.id}` : "Kreiraj novo pismo"}</h3>
        {/* Poruka o ishodu operacije (ako postoji) */}
        {message && <div className="success" style={{ marginTop: 8 }}>{message}</div>}
        {/* Red sa inputom za naslov pisma */}
        <div className="row" style={{ marginTop: 12 }}>
          {/* Kontrolisani input za naslov pisma */}
          <input
            className="input"
            placeholder="Naslov pisma"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
          />
        </div>

        {/* Sekcija za odabir lekova preko multiselect komponente */}
        <div style={{ marginTop: 12 }}>
          {/* Oznaka za polje lekova */}
          <label>Odaberi lekove:</label>
          {/* Multiselect prima trenutne vrednosti i setter */}
          <DrugMultiSelect
            value={form.drugIds}
            onChange={(arr) => setForm({ ...form, drugIds: arr })}
          />
        </div>

        {/* Red sa inputom za odabir PDF fajla */}
        <div className="row" style={{ marginTop: 12 }}>
          {/* File input ograničen na PDF */}
          <input
            className="input"
            type="file"
            accept="application/pdf"
            onChange={(e) => setForm({ ...form, file: e.target.files[0] })}
            //disabled={!!editing}
            style={editing ? { background: '#eee', cursor: 'not-allowed' } : {}}
          />
        </div>

        {/* Dugmad za čuvanje (kreiranje ili ažuriranje) i otkazivanje izmene */}
        <div className="row" style={{ marginTop: 12 }}>
          {/* Ako se ne edituje, prikaži dugme za kreiranje */}
          {!editing ? (
            <button className="primary" onClick={onCreate}>Sačuvaj pismo</button>
          ) : (
            <>
              {/* U modu izmene: dugme za čuvanje izmena */}
              <button className="primary" onClick={onUpdate}>Sačuvaj izmene</button>
              {/* Dugme za izlazak iz moda izmene i reset forme */}
              <button onClick={() => { setEditing(null); setForm(emptyForm); }}>Otkaži</button>
            </>
          )}
        </div>
      </div>

      {/* Kartica sa listom pisama i filterima */}
      <div className="card" style={{ marginTop: 16 }}>
        {/* Red sa dva filter inputa */}
        <div className="row" style={{ marginBottom: 10, gap: 8 }}>
          {/* Filter po naslovu pisma; resetuje stranicu na 0 pri promeni */}
          <input
            className="input"
            placeholder="Pretraga po naslovu…"
            value={q}
            onChange={(e) => { setPage(0); setQ(e.target.value); }}
          />
          {/* Filter po lekovima (tekstualno poređenje nad listom lekova) */}
          <input
            className="input"
            placeholder="Pretraga po lekovima…"
            value={qDrugs}
            onChange={(e) => { setPage(0); setQDrugs(e.target.value); }}
          />
        </div>

        {/* Tabela sa podacima o pismima */}
        <table className="table">
          {/* Zaglavlje tabele sa kolonama */}
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
          {/* Telo tabele sa mapiranjem preko sadržaja */}
          <tbody>
            {data.content
              // Filtrira redove prema tekstu u qDrugs (pretraga kroz l.drugs)
              .filter(l =>
                (!qDrugs || l.drugs.join(", ").toLowerCase().includes(qDrugs.toLowerCase()))
              )
              // Mapira svako pismo u red tabele
              .map(l => (
                // Jedinstveni ključ po ID-u pisma
                <tr key={l.id}>
                  {/* Kolona: ID pisma (stilizovana kao kbd) */}
                  <td className="kbd">{l.id}</td>
                  {/* Kolona: naslov pisma */}
                  <td>{l.title}</td>
                  {/* Kolona: spisak lekova (imena spojena zarezom) */}
                  <td>{l.drugs.map(d => d.name).join(", ")}</td>
                  {/* Kolona: datum kreiranja u čitljivom formatu */}
                  <td>{formatDateTime(l.createdAt)}</td>
                  {/* Kolona: datum poslednje izmene u čitljivom formatu */}
                  <td>{formatDateTime(l.updatedAt)}</td>
                  {/* Kolona: aktivnost pisma (Da/Ne) */}
                  <td>{formatBool(l.active)}</td>
                  {/* Kolona: link za otvaranje PDF-a u novom tabu */}
                  <td><a className="link" href={l.pdfPath} target="_blank" rel="noreferrer">Otvori PDF</a></td>
                  {/* Kolona: akcije (izmena / deaktivacija) */}
                  <td>
                    {/* Dugme za ulazak u režim izmene selektovanog pisma */}
                    <button className="tableButton" onClick={() => startEdit(l)}>Izmeni</button>
                    {/* Dugme za deaktivaciju dostupno samo ako je pismo aktivno */}
                    {l.active && <button className="danger tableButton" onClick={() => onDeactivate(l.id)}>Deaktiviraj</button>}
                  </td>
                </tr>
              ))}
            {/* Ako nema sadržaja, prikaži poruku kroz jedan red (napomena: colSpan treba da pokrije sve kolone) */}
            {(!data.content || data.content.length === 0) && (
              <tr><td colSpan="5" style={{ color: "#9ca3af" }}>Nema podataka.</td></tr>
            )}
          </tbody>
        </table>

        {/* Kontrole paginacije sa trenutnom stranom i ukupnim brojem strana */}
        <Pagination
          page={page}
          totalPages={data.totalPages}
          onPrev={() => setPage(p => p - 1)}
          onNext={() => setPage(p => p + 1)}
        />
      </div>

      {/* Dodatni informativni sadržaj ispod forme */}
      <div style={{ marginTop: 10 }}>
        {/* Komponenta sa korisnim linkovima vezanim za blokade */}
          <Blokada />
      </div>

    </div>
  );
}
