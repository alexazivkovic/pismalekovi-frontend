import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { setAuth } from "../auth";
import Blokada from "../components/Blokada";

export default function AdminLogin() {
  const [user, setUser] = useState("");
  const [pass, setPass] = useState("");
  const [err, setErr] = useState("");
  const navigate = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    setErr("");
    try {
      const r = await fetch("/api/admin/letters?page=0&size=1", {
        headers: { Authorization: "Basic " + btoa(`${user}:${pass}`) }
      });
      if (r.status === 200) {
        setAuth(user, pass);
        navigate("/admin", { replace: true });
      } else if (r.status === 401) {
        setErr("Pogrešan korisnik ili lozinka.");
      } else {
        setErr(`Greška servera (${r.status}).`);
      }
    } catch {
      setErr("Nije moguće kontaktirati server.");
    }
  };

  return (
    <div className="container" style={{ maxWidth: 420 }}>
      <div className="nav"><h2>Admin prijava</h2></div>
      {err && <div className="error" style={{ marginTop: 12 }}>{err}</div>}
      <form onSubmit={submit} className="card" style={{ display: "grid", gap: 10, marginTop: 12 }}>
        <div>
          <label>Korisnik</label>
          <input className="input" value={user} onChange={(e) => setUser(e.target.value)} autoFocus />
        </div>
        <div>
          <label>Lozinka</label>
          <input className="input" type="password" value={pass} onChange={(e) => setPass(e.target.value)} />
        </div>
        <button className="primary" type="submit">Uloguj se</button>
      </form>
      <div style={{ marginTop: 10 }}>
        <Blokada />
      </div>
    </div>
  );
}
