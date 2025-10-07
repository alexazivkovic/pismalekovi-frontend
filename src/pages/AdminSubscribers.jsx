// Uvozi React hook-ove za rad sa stanjem i efektima
import { useEffect, useState } from "react";
// Uvozi navigaciju i Link komponentu iz React Router-a (Link nije korišćen u ovom fajlu)
import { useNavigate, Link } from "react-router-dom";
// Uvozi API helper za komunikaciju sa backend-om
import API from "../api";
// Uvozi komponentu za paginaciju
import Pagination from "../components/Pagination";
// Uvozi pomoćne funkcije za autentikaciju (header), odjavu i čitanje auth-a
import { authHeader, clearAuth, getAuth } from "../auth";
// Uvoz informativne komponente sa linkovima o blokadama
import Blokada from "../components/Blokada";

// Izvoz podrazumevane React komponente za administraciju pretplatnika
export default function AdminSubscribers() {
  // Inicijalizuje hook za programsku navigaciju između ruta
  const navigate = useNavigate();
  // Učitava trenutno sačuvani Basic auth token (base64 "user:pass") iz storage-a
  const auth = getAuth();
  // Stanje: tekstualni upit za pretragu pretplatnika po e-mailu
  const [q, setQ] = useState("");
  // Stanje: trenutna stranica u listi pretplatnika
  const [page, setPage] = useState(0);
  // Stanje: podaci o pretplatnicima i ukupan broj strana
  const [data, setData] = useState({ content: [], totalPages: 0 });
  // Stanje: vrednost email-a u inputu za dodavanje novog pretplatnika
  const [newEmail, setNewEmail] = useState("");
  // Stanje: poruka korisniku (uspeh/greška)
  const [msg, setMsg] = useState("");

  // Definiše async funkciju za učitavanje liste pretplatnika sa servera
  const load = async () => {
    try {
      // Poziva admin endpoint za listanje pretplatnika sa filterom i paginacijom
      const res = await API.adminListSubscribers(auth, { q, page, size: 20 });
      // Ako backend vrati običan niz, adaptira ga u objekt sa content/totalPages
      if (Array.isArray(res)) {
        setData({ content: res, totalPages: 1 });
        //console.log(res)
      } else {
        // Inače preuzima strukturu kakvu je backend vratio
        setData(res);
      }
    } catch (e) {
      // U slučaju greške (npr. 401), briše auth i šalje korisnika na login
      clearAuth();
      navigate("/admin/login", { replace: true });
    }
  };

  // Efekat: pri promeni q ili page ponovo učitava listu pretplatnika
  useEffect(() => {
    load();
  }, [q, page]);

  // Dodaje novog pretplatnika koristeći email iz inputa
  const add = async () => {
    // Trimuje unos da ukloni suvišne razmake
    const email = newEmail.trim();
    // Jednostavna regex validacija e-mail formata
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      // Postavlja poruku o grešci i prekida dalje
      setMsg("Unesite ispravnu e-mail adresu.");
      return;
    }
    try {
      // Poziva API da doda pretplatnika
      await API.adminAddSubscriber(auth, email);
      // Briše input polje nakon uspeha
      setNewEmail("");
      // Postavlja poruku o uspehu
      setMsg("Pretplatnik dodat.");
      // Osvježava listu pretplatnika
      load();
    } catch (e) {
      // Postavlja poruku o grešci ako dodavanje nije uspelo
      setMsg("Greška pri dodavanju.");
    }
  };

  // Deaktivira (uklanja) pretplatnika po ID-u
  const remove = async (id) => {
    //if (!confirm("Obrisati pretplatnika?")) return;
    try {
      // Poziva API za deaktivaciju pretplatnika
      await API.adminDeactivateSubscriber(auth, id);
      // Poruka o uspešnom uklanjanju
      setMsg("Pretplatnik obrisan.");
      // Ponovo učitava listu pretplatnika
      load();
    } catch (e) {
      // Poruka o grešci ako brisanje nije uspelo
      setMsg("Greška pri brisanju.");
    }
  };

  // Renderuje UI komponente
  return (
    // Glavni kontejner stranice
    <div className="container">
      {/* Gornja navigaciona traka sa naslovom i akcijama */}
      <div className="nav">
        {/* Naslov sekcije pretplatnika */}
        <h2>Pretplatnici</h2>
        {/* Desni deo navigacije sa dugmadima */}
        <div className="row" style={{ gap: 8 }}>
          {/* Link ka admin stranici sa pismima (koristi <a>, iako je uvezen i Link) */}
          <a href="/admin"><button>Nazad na pisma</button></a>
          {/* Dugme za odjavu: čisti auth i vodi na početnu stranu */}
          <button onClick={() => { clearAuth(); navigate("/", { replace: true }); }}>Logout</button>
        </div>
      </div>

      {/* Uslovna poruka o uspehu/grešci iznad sadržaja */}
      {msg && <div className={msg.includes("Greška") ? "error" : "success"} style={{ marginTop: 12 }}>{msg}</div>}

      {/* Kartica sa poljem za pretragu pretplatnika */}
      <div className="card" style={{ marginTop: 12 }}>
        {/* Red sa inputom; prilagodljiv za male ekrane */}
        <div className="row" style={{ gap: 8, flexWrap: "wrap" }}>
          {/* Kontrolisani input za tekst pretrage; resetuje paginaciju na 0 pri promeni */}
          <input
            className="input"
            placeholder="Pretraga (po e-mailu)…"
            value={q}
            onChange={(e) => { setPage(0); setQ(e.target.value); }}
            style={{ flex: 1, minWidth: 240 }}
          />
        </div>
      </div>

      {/* Kartica sa formom za ručno dodavanje novog pretplatnika */}
      <div className="card" style={{ marginTop: 12 }}>
        {/* Naslov sekcije za dodavanje */}
        <h3>Dodaj pretplatnika</h3>
        {/* Red sa inputom i dugmetom za dodavanje */}
        <div className="row" style={{ gap: 8, marginTop: 8 }}>
          {/* Kontrolisani email input vezan za newEmail stanje */}
          <input
            className="input"
            type="email"
            placeholder="Email"
            value={newEmail}
            onChange={(e) => setNewEmail(e.target.value)}
            style={{ flex: 1, minWidth: 240 }}
          />
          {/* Dugme koje poziva add() da pošalje zahtev backend-u */}
          <button className="primary" onClick={add}>Dodaj</button>
        </div>
      </div>

      {/* Kartica sa tabelom pretplatnika i paginacijom */}
      <div className="card" style={{ marginTop: 12 }}>
        {/* Tabela za prikaz liste pretplatnika */}
        <table className="table">
          {/* Zaglavlje tabele sa kolonama ID / e-mail / akcije */}
          <thead>
            <tr>
              <th style={{ width: 80 }}>ID</th>
              <th>E-mail</th>
              <th style={{ width: 140 }}>Akcije</th>
            </tr>
          </thead>
          {/* Telo tabele sa mapiranjem pretplatnika u redove */}
          <tbody>
            {Array.isArray(data.content) && data.content
              // Filtrira po lokalnom upitu q (case-insensitive) nad email poljem
              .filter(s => !q || s.email.toLowerCase().includes(q.toLowerCase()))
              // Renderuje svaki entitet kao red u tabeli
              .map(s => (
                // Jedinstveni ključ po ID-u pretplatnika
                <tr key={s.id}>
                  {/* Prikazuje ID pretplatnika u "kbd" stilu */}
                  <td className="kbd">{s.id}</td>
                  {/* Prikazuje e-mail pretplatnika */}
                  <td>{s.email}</td>
                  {/* Kolona sa akcijama: omogućava deaktivaciju ako je pretplatnik aktivan */}
                  <td>
                    {s.active && <button className="danger" onClick={() => remove(s.id)}>Deaktiviraj</button>}
                  </td>
                </tr>
              ))}
            {/* Ako nema sadržaja, prikazuje informativni red u sivkastoj boji */}
            {(!data.content || data.content.length === 0) && (
              <tr><td colSpan="3" style={{ color: "#9ca3af" }}>Nema pretplatnika.</td></tr>
            )}
          </tbody>
        </table>

        {/* Paginacija: prikazuje trenutnu stranicu i omogućava kretanje napred/nazad */}
        <Pagination
          page={page}
          totalPages={data.totalPages}
          onPrev={() => setPage(p => Math.max(0, p - 1))}
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
