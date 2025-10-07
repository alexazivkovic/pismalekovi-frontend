// Uvozi React hook useState za lokalno stanje komponente
import { useState } from "react";
// Uvozi API helper za poziv backend endpointa
import API from "../api";

// Izvozi podrazumevanu komponentu za prijavu na obaveštenja
export default function SubscribeBox() {
  // Stanje za unetu email adresu
  const [email, setEmail] = useState("");
  // Stanje za korisničku poruku (uspeh/greška)
  const [msg, setMsg] = useState("");
  // Stanje koje označava da je zahtev u toku (disable UI)
  const [busy, setBusy] = useState(false);

  // Handler za submit forme (asinhrono, validira i poziva API)
  const submit = async (e) => {
    // Sprečava default refresh forme ako postoji event
    e?.preventDefault?.();
    // Resetuje poruku pre nove validacije/poziva
    setMsg("");
    // Trimuje email radi validacije i slanja
    const trimmed = email.trim();
    // Prosta regex validacija email formata
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      // Postavlja poruku o neispravnoj adresi i prekida dalji tok
      setMsg("Unesite ispravnu e-mail adresu.");
      return;
    }
    try {
      // Postavlja busy da onemogući ponovni submit
      setBusy(true);
      // Poziva javni subscribe endpoint sa validiranim email-om
      await API.publicSubscribe(trimmed);
      // Na uspeh obaveštava korisnika
      setMsg("Uspešno ste se prijavili na obaveštenja.");
      // Briše sadržaj inputa
      setEmail("");
    } catch (err) {
      // Loguje grešku radi dijagnostike
      console.error("Subscribe error:", err);
      // Prikazuje poruku o grešci korisniku
      setMsg("Greška pri prijavi. Pokušajte ponovo.");
    } finally {
      // Uvek skida busy zastavicu po završetku
      setBusy(false);
    }
  };

  // Render JSX sadržaja komponente
  return (
    // Kartica/kontejner sa gornjim razmakom
    <div className="card" style={{ marginTop: 16 }}>
      {/* Naslov sekcije za prijavu */}
      <h3>Prijava na obaveštenja</h3>
      {/* Objašnjenje šta korisnik dobija prijavom */}
      <p style={{ color: "#9ca3af", marginTop: 6 }}>
        Unesite vašu e-mail adresu kako biste dobijali obaveštenja o novim ili izmenjenim pismima.
      </p>
      {/* Uslovno prikazuje success/error poruku na osnovu sadržaja msg */}
      {msg && <div className={msg.startsWith("Uspe") ? "success" : "error"} style={{ marginTop: 8 }}>{msg}</div>}
      {/* Forma sa submit handlerom, rasporedom i razmacima */}
      <form onSubmit={submit} className="row" style={{ gap: 8, marginTop: 10, flexWrap: "wrap" }}>
        {/* Email input povezan sa state-om; minimalna širina za male ekrane */}
        <input
          className="input"
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{ flex: 1, minWidth: 240 }}
        />
        {/* Primarno dugme; onemogućeno dok je busy; klik i submit rade isto */}
        <button className="primary" disabled={busy} onClick={submit}>
          {busy ? "Slanje..." : "Pretplati se"}
        </button>
      </form>
    </div>
  );
}
