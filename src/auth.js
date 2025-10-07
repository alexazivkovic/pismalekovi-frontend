// Eksporuje funkciju koja postavlja Basic auth zapis u sessionStorage kao base64("user:pass")
export const setAuth = (user, pass) => sessionStorage.setItem("auth", btoa(`${user}:${pass}`));

// Eksporuje funkciju koja čita auth vrednost iz sessionStorage ili vraća null ako je nema
export const getAuth = () => sessionStorage.getItem("auth") || null;

// Eksporuje funkciju koja uklanja auth zapis iz sessionStorage (odjava)
export const clearAuth = () => sessionStorage.removeItem("auth");

// Eksporuje funkciju koja vraća HTTP Authorization header ili prazan objekat ako nema auth-a
export const authHeader = () => {
  // Učitava trenutno sačuvanu auth vrednost (base64 kredencijala)
  const a = getAuth();
  // Ako postoji, formira Basic Authorization header; inače vraća prazan objekat
  return a ? { Authorization: `Basic ${a}` } : {};
};
