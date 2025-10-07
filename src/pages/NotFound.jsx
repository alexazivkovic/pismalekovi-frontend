// Uvozi komponentu sa informativnim linkovima
import Blokada from "../components/Blokada";

// Izvozi podrazumevanu React komponentu za 404 stranicu
export default function NotFound() {
  // Vraća JSX sadržaj komponente
  return (
    // Glavni kontejner stranice
    <div className="container">
      {/* Kartica sa porukom o grešci 404 */}
      <div className="card">
        {/* Naslov sa HTTP kodom greške */}
        <h1>404</h1>
        {/* Podnaslov sa opisom greške */}
        <h3>Stranica nije pronađena</h3>
        {/* Paragraf sa linkom za povratak na početnu stranu */}
        <p>Vratite se na <a style={{textDecoration: 'none', color: '#D84B16'}} href="http://localhost:5173/">početnu</a>.</p>
      </div>
      {/* Dodatni informativni sadržaj ispod forme */}
      <div style={{ marginTop: 10 }}>
        {/* Komponenta sa korisnim linkovima vezanim za blokade */}
        <Blokada />
      </div>
    </div>
  );
}
