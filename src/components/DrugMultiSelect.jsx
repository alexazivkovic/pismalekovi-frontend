// Uvozi React hook-ove useEffect, useRef i useState
import { useEffect, useRef, useState } from "react";
// Uvozi API helper sa funkcijama za backend pozive
import API from "../api";

// Izvozi podrazumevanu komponentu DrugMultiSelect sa props-ima value i onChange
export default function DrugMultiSelect({ value = [], onChange }) {
  // Stanje za tekst pretrage (query)
  const [q, setQ] = useState("");
  // Stanje za opcije (rezultati pretrage lekova)
  const [opts, setOpts] = useState([]);
  // Stanje za broj stranice u paginaciji
  const [page, setPage] = useState(0);
  // Ref na glavni kontejner (može poslužiti za klik-van kontrole i sl.)
  const boxRef = useRef(null);

  // Efekat koji učitava listu lekova kad se promene q ili page
  useEffect(() => {
    // Flag za otkazivanje kako bismo izbegli setState posle unmount-a
    let cancel = false;
    // Async funkcija koja poziva API i ažurira opcije
    const load = async () => {
      // Poziva pretragu lekova sa upitom, stranicom i veličinom strane 10
      const res = await API.searchDrugs(q, page, 10);
      // Ako efekat nije otkazan, upisuje dobijeni sadržaj u stanje opcija
      if (!cancel) setOpts(res?.content || []);
    };
    // Odmah pokreće učitavanje
    load();
    // Cleanup funkcija koja postavlja cancel na true pri demontaži/ponovnom pokretanju efekta
    return () => { cancel = true; };
  }, [q, page]); // Zavisnosti: pokreće se kad se promene q ili page

  // Dodaje izabrani lek u value ako već ne postoji
  const add = (d) => {
    // Proverava da li lek sa istim id već postoji u selekciji, ako ne — dodaje
    if (!value.find(v => v.id === d.id)) onChange([...value, d]);
    // Resetuje polje pretrage posle dodavanja
    setQ("");
  };
  // Uklanja lek iz selekcije po id-u
  const remove = (id) => onChange(value.filter(v => v.id !== id));

  // Render funkcija komponente
  return (
    // Kartica/kontejner za multiselect, sa ref za potencijalne spoljne interakcije
    <div className="card" ref={boxRef}>
      {/* Red sa inputom za pretragu i dugmetom za pokretanje */}
      <div className="row">
        {/* Tekstualni input za pretragu lekova */}
        <input
          // Placeholder tekst u polju za unos
          placeholder="Pretraži lekove…"
          // CSS klasa za stilizaciju inputa
          className="input"
          // Vrednost inputa vezana za stanje q
          value={q}
          // On change: resetuje paginaciju na 0 i ažurira q iz događaja
          onChange={(e) => { setPage(0); setQ(e.target.value); }}
        />
        {/* Dugme koje “trigeruje” isti query (korisno nakon promene paginacije ili za eksplicitnu pretragu) */}
        <button onClick={() => setQ(q)}>Traži</button>
      </div>

      {/* Ako postoji neki tekst u q, prikazuje dropdown sa rezultatima */}
      {!!q && (
        // Kontejner za listu opcija sa tamnom pozadinom, okvirom i max visinom (scroll)
        <div style={{ marginTop: 8, background: "#0b1220", border: "1px solid #1f2937", borderRadius: 10, maxHeight: 200, overflow: "auto" }}>
          {/* Mapira opcije u klikabilne redove; klik dodaje lek u selekciju */}
          {opts.map(o => (
            // Svaki red ima ključ po id-u i klik dodaje odabranu opciju
            <div key={o.id} style={{ padding: 8, cursor: "pointer" }} onClick={() => add(o)}>
              {/* Naziv leka u bold stilu */}
              <b>{o.name}</b> {/* Ako postoji ATC kod, prikaži ga kao bedž */}
              {o.atc && <span className="badge">{o.atc}</span>} {/* Ako postoji proizvođač, prikaži uz sivkast tekst */}
              {o.manufacturer && <span style={{ color: "#9ca3af" }}>— {o.manufacturer}</span>}
            </div>
          ))}
          {/* Ako nema rezultata, prikaži poruku u dropdown-u */}
          {opts.length === 0 && <div style={{ padding: 8, color: "#9ca3af" }}>Nema rezultata.</div>}
        </div>
      )}

      {/* Ako je izabrano bar jedno, prikaži listu izabranih lekova kao bedževe */}
      {value.length > 0 && (
        <>
          {/* Horizontalna linija koja vizuelno razdvaja pretragu od selekcije */}
          <hr />
          {/* Fleks kontejner koji raspoređuje bedževe u više redova sa razmakom */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {/* Mapira selektovane vrednosti u bedževe sa imenom i X dugmetom za uklanjanje */}
            {value.map(v => (
              // Bedž sa poravnanjem sadržaja i malim razmakom
              <span key={v.id} className="badge" style={{ display: "inline-flex", gap: 6, alignItems: "center" }}>
                {/* Ime leka na bedžu */}
                {v.name}
                {/* Dugme “x” koje uklanja konkretan lek iz selekcije */}
                <button className="danger" onClick={() => remove(v.id)} style={{ padding: "2px 6px" }}>x</button>
              </span>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
