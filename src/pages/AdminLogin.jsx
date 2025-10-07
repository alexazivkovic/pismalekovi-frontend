// Uvoz React hook-a useState za lokalno stanje (user, pass, greška)
import { useState } from "react";
// Uvoz React Router hook-a za programsku navigaciju
import { useNavigate } from "react-router-dom";
// Uvoz helpera za snimanje Basic auth kredencijala u sessionStorage
import { setAuth } from "../auth";
// Uvoz informativne komponente sa linkovima o blokadama
import Blokada from "../components/Blokada";

// Definicija i izvoz podrazumevane komponente za admin prijavu
export default function AdminLogin() {
  // Stanje za korisničko ime
  const [user, setUser] = useState("");
  // Stanje za lozinku
  const [pass, setPass] = useState("");
  // Stanje za poruku o grešci
  const [err, setErr] = useState("");
  // Inicijalizacija navigacije
  const navigate = useNavigate();

  // Handler za submit forme (asinhrono proverava kredencijale)
  const submit = async (e) => {
    // Sprečava podrazumevano osvežavanje stranice
    e.preventDefault();
    // Resetuje prethodnu grešku
    setErr("");
    try {
      // Pokušaj da pozove zaštićeni endpoint radi provere Basic auth-a
      const r = await fetch("/api/admin/letters?page=0&size=1", {
        // Prosleđuje Authorization header sa base64("user:pass")
        headers: { Authorization: "Basic " + btoa(`${user}:${pass}`) }
      });
      // Ako je status 200, kredencijali su ispravni
      if (r.status === 200) {
        // Snimi auth u sessionStorage
        setAuth(user, pass);
        // Prebaci korisnika na /admin i zameni trenutni unos u istoriji
        navigate("/admin", { replace: true });
      // Ako je 401, prijava je neuspešna zbog pogrešnog korisnika/lozinke
      } else if (r.status === 401) {
        // Postavi poruku o grešci za neispravne kredencijale
        setErr("Pogrešan korisnik ili lozinka.");
      // Bilo koji drugi status tretira kao grešku servera
      } else {
        // Prikaži generičnu poruku sa HTTP status kodom
        setErr(`Greška servera (${r.status}).`);
      }
    // Ako nije moguće uspostaviti vezu sa serverom
    } catch {
      // Postavi poruku o nemogućnosti kontaktiranja servera
      setErr("Nije moguće kontaktirati server.");
    }
  };

  // Renderuje UI za formu prijave
  return (
    // Glavni kontejner sa maksimalnom širinom
    <div className="container" style={{ maxWidth: 420 }}>
      {/* Zaglavlje sa naslovom stranice */}
      <div className="nav"><h2>Admin prijava</h2></div>
      {/* Uslovno prikazivanje poruke o grešci ako postoji */}
      {err && <div className="error" style={{ marginTop: 12 }}>{err}</div>}
      {/* Forma za unos kredencijala, koristi submit handler */}
      <form onSubmit={submit} className="card" style={{ display: "grid", gap: 10, marginTop: 12 }}>
        {/* Grupa za korisničko ime */}
        <div>
          {/* Labela za input korisničkog imena */}
          <label>Korisnik</label>
          {/* Kontrolisani input vezan za state user; auto fokus na učitavanje */}
          <input className="input" value={user} onChange={(e) => setUser(e.target.value)} autoFocus />
        </div>
        {/* Grupa za lozinku */}
        <div>
          {/* Labela za input lozinke */}
          <label>Lozinka</label>
          {/* Kontrolisani input za lozinku (type=password) vezan za state pass */}
          <input className="input" type="password" value={pass} onChange={(e) => setPass(e.target.value)} />
        </div>
        {/* Dugme za slanje forme (triggeruje submit handler) */}
        <button className="primary" type="submit">Uloguj se</button>
      </form>
      {/* Dodatni informativni sadržaj ispod forme */}
      <div style={{ marginTop: 10 }}>
        {/* Komponenta sa korisnim linkovima vezanim za blokade */}
        <Blokada />
      </div>
    </div>
  );
}
