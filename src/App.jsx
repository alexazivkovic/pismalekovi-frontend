// Uvozi globalne stilove aplikacije
import "./index.css";
// Uvozi komponentu javne početne stranice
import PublicHome from "./pages/PublicHome.jsx";

// Definiše i izvezi podrazumevanu App komponentu
export default function App() {
  // Renderuje PublicHome kao jedini sadržaj aplikacije
  return <PublicHome />;
}
