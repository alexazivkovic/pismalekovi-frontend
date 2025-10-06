import { useState } from "react";
import API from "../api";

export default function SubscribeBox() {
  const [email, setEmail] = useState("");
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e?.preventDefault?.();
    setMsg("");
    const trimmed = email.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      setMsg("Unesite ispravnu e-mail adresu.");
      return;
    }
    try {
      setBusy(true);
      await API.publicSubscribe(trimmed);
      setMsg("Uspešno ste se prijavili na obaveštenja.");
      setEmail("");
    } catch (err) {
      console.error("Subscribe error:", err);
      setMsg("Greška pri prijavi. Pokušajte ponovo.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="card" style={{ marginTop: 16 }}>
      <h3>Prijava na obaveštenja</h3>
      <p style={{ color: "#9ca3af", marginTop: 6 }}>
        Unesite vašu e-mail adresu kako biste dobijali obaveštenja o novim ili izmenjenim pismima.
      </p>
      {msg && <div className={msg.startsWith("Uspe") ? "success" : "error"} style={{ marginTop: 8 }}>{msg}</div>}
      <form onSubmit={submit} className="row" style={{ gap: 8, marginTop: 10, flexWrap: "wrap" }}>
        <input
          className="input"
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{ flex: 1, minWidth: 240 }}
        />
        <button className="primary" disabled={busy} onClick={submit}>
          {busy ? "Slanje..." : "Pretplati se"}
        </button>
      </form>
    </div>
  );
}
