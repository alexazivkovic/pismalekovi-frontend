// Uvoz React biblioteke za rad sa komponentama
import React from "react";
// Uvoz createRoot za inicijalizaciju React aplikacije (React 18 root API)
import { createRoot } from "react-dom/client";
// Uvoz komponenti za rutiranje: BrowserRouter kontejner, Routes/Route definicije i Navigate za preusmeravanje
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
// Uvoz javne početne stranice
import PublicHome from "./pages/PublicHome.jsx";
// Uvoz stranice za prijavu administratora
import AdminLogin from "./pages/AdminLogin.jsx";
// Uvoz administratorskog panela (zaštićena ruta)
import AdminPanel from "./pages/AdminPanel.jsx";
// Uvoz stranice sa listom pretplatnika (zaštićena ruta)
import AdminSubscribers from "./pages/AdminSubscribers.jsx";
// Uvoz stranice za 404/nenađene rute
import NotFound from "./pages/NotFound.jsx";
// Uvoz helper funkcije za čitanje autentikacije (npr. token/credencijali iz storage-a)
import { getAuth } from "./auth";

// Uvoz globalnih stilova aplikacije
import "./index.css";


// Definicija wrapper komponente koja štiti decu od pristupa bez autentikacije
function Protected({ children }) {
  // Provera da li postoji autentikacija (konvertuje u boolean)
  const authed = !!getAuth();
  // Ako je autentikovan, prikaži decu; inače preusmeri na /admin/login uz replace da ne ostane u istoriji
  return authed ? children : <Navigate to="/admin/login" replace />;
}

// Pronalazi root DOM element i montira React aplikaciju u njega
createRoot(document.getElementById("root")).render(
  // Omota aplikaciju router-om koji koristi HTML5 history API
  <BrowserRouter>
    {/* Kontejner za deklarativno definisanje svih ruta */}
    <Routes>
      {/* Javno dostupna početna ruta */}
      <Route path="/" element={<PublicHome />} />
      {/* Ruta za login administratora */}
      <Route path="/admin/login" element={<AdminLogin />} />
      {/* Zaštićena ruta za admin panel — prikazuje se samo ako je korisnik prijavljen */}
      <Route path="/admin" element={<Protected><AdminPanel /></Protected>} />
      {/* Zaštićena ruta za listu pretplatnika — samo za prijavljene */}
      <Route path="/admin/subscribers" element={<Protected><AdminSubscribers /></Protected>} />
      {/* Fallback ruta za sve nepostojeće putanje (404) */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  </BrowserRouter>
);
