import Blokada from "../components/Blokada";

export default function NotFound() {
  return (
    <div className="container">
      <div className="card">
        <h1>404</h1>
        <h3>Stranica nije pronađena</h3>
        <p>Vratite se na <a style={{textDecoration: 'none', color: '#D84B16'}} href="http://localhost:5173/">početnu</a>.</p>
      </div>
      <Blokada />
    </div>
  );
}
