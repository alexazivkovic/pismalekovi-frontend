// Uvozi komponentu sa informativnim linkovima
import Blokada from "../components/Blokada";
// Uvozi React Router Link komponentu (koristi se za interno linkovanje, ali nije korišćen dole)
import { Link } from "react-router-dom";
// Uvozi React hook-ove za stanje i efekte
import { useEffect, useState } from "react";
// Uvozi API helper za pozive prema backend-u
import API from "../api";
// Uvozi komponentu za paginaciju
import Pagination from "../components/Pagination";
// Uvozi pomoćni formatter za prikaz datuma/vremena
import {formatDateTime} from "../components/StringFormatter";
// Uvozi komponentu sa formom za prijavu na obaveštenja
import SubscribeBox from "../components/SubscribeBox";

// Izvozi podrazumevanu javnu početnu stranicu
export default function PublicHome() {
  // Stanje: tekstualni upit za pretragu po naslovu
  const [q, setQ] = useState("");
  // Stanje: tekstualni upit za pretragu po lekovima
  const [qDrugs, setQDrugs] = useState("");
  // Stanje: trenutni indeks stranice (0-bazirano)
  const [page, setPage] = useState(0);
  // Stanje: rezultat listanja (sadržaj i ukupan broj strana)
  const [data, setData] = useState({ content: [], totalPages: 0 });

  // Efekat: pri promeni q ili page učitava listu pisama sa servera
  useEffect(() => {
    // Poziva javni endpoint za listanje pisama sa filterom i paginacijom
    API.listLetters({ q, page, size: 10 }).then(setData);
  }, [q, page]); // Zavisnosti efekta: ponovni poziv pri izmeni q ili page

  // Render funkcije komponente
  return (
    // Glavni kontejner stranice
    <div className="container">
      {/* Gornja navigaciona traka sa naslovom */}
      <div className="nav">
        {/* Naslov aplikacije/sekcije */}
        <h2>Pisma zdravstvenim radnicima</h2>
      </div>

      {/* Kartica sa filtrima pretrage */}
      <div className="card" style={{ marginTop: 16 }}>
        {/* Red sa razmakom između polja za unos */}
        <div className="row" style={{ marginBottom: 10, gap: 8 }}>
          {/* Input za pretragu po naslovu; resetuje stranicu na 0 pri promeni */}
          <input
            className="input"
            placeholder="Pretraga po naslovu…"
            value={q}
            onChange={(e) => { setPage(0); setQ(e.target.value); }}
          />
          {/* Input za pretragu po lekovima; lokalni tekstualni filter nad rezultatima */}
          <input
            className="input"
            placeholder="Pretraga po lekovima…"
            value={qDrugs}
            onChange={(e) => { setPage(0); setQDrugs(e.target.value); }}
          />
        </div>
      </div>

      {/* Kartica sa tabelarnim prikazom rezultata */}
      <div className="card" style={{ marginTop: 12 }}>
        {/* Tabela sa kolonama ID/Naslov/Lekovi/Datumi/PDF */}
        <table className="table">
          {/* Zaglavlje tabele */}
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
          {/* Telo tabele sa mapiranjem kroz dobijeni sadržaj */}
          <tbody>
            {data.content
            // Lokalni filter po lekovima (pretvara niz u string i poredi; case-insensitive)
            .filter(l =>
                (!qDrugs || l.drugs.join(", ").toLowerCase().includes(qDrugs.toLowerCase()))
              )
            // Mapira svako pismo u red tabele
            .map(l => (
              // Jedinstveni ključ reda postavljen na ID pisma
              <tr key={l.id}>
                {/* Prikaz ID vrednosti u "kbd" stilu */}
                <td className="kbd">{l.id}</td>
                {/* Prikaz naslova pisma */}
                <td>{l.title}</td>
                {/* Prikaz liste lekova kao spojenog stringa imena */}
                <td>{l.drugs.map(d => d.name).join(", ")}</td>
                {/* Formatiran prikaz datuma kreiranja */}
                <td>{formatDateTime(l.createdAt)}</td>
                {/* Formatiran prikaz datuma poslednje izmene */}
                <td>{formatDateTime(l.updatedAt)}</td>
                {/* Link ka PDF dokumentu (otvara se u novom tabu) */}
                <td><a className="link" href={l.pdfPath} target="_blank" rel="noreferrer">Otvori PDF</a></td>
              </tr>
            ))}
            {/* Fallback red ako nema rezultata za prikaz */}
            {(!data.content || data.content.length === 0) && (
              <tr><td colSpan="3" style={{ color: "#9ca3af" }}>Nema rezultata.</td></tr>
            )}
          </tbody>
        </table>

        {/* Kontrole paginacije sa trenutnom stranicom i brojem strana */}
        <Pagination
          page={page}
          totalPages={data.totalPages}
          onPrev={() => setPage(p => p - 1)}
          onNext={() => setPage(p => p + 1)}
        />
      </div>

      {/* Komponenta za prijavu na obaveštenja (newsletter/obaveštenja) */}
      <SubscribeBox />
      {/* Dodatni informativni sadržaj ispod forme */}
      <div style={{ marginTop: 10 }}>
        {/* Komponenta sa korisnim linkovima vezanim za blokade */}
        <Blokada />
      </div>

    </div>
  );
}
