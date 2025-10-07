// Eksporuje funkciju koja formatira ISO datetime string u oblik "dd/MM/yyyy HH:mm"
export function formatDateTime(dateString) {
  // Ako nema vrednosti, vrati "/" kao placeholder
  if (!dateString) return "/";
  // Regularni izraz koji hvata delove ISO formata: YYYY-MM-DDTHH:mm:ssZ
  const regex = /(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})Z/;
  // Poredi ulazni string sa regex-om i dobija grupe ako se poklapaju
  const matches = dateString.match(regex);
  // Po difoltu, čitljiv datum je isti kao ulaz (ako parsiranje ne uspe)
  var readableDate = dateString;

  // Ako je regex pronašao poklapanje
  if (matches) {
    // Godina iz grupe 1
    const year = matches[1];
    // Mesec iz grupe 2
    const month = matches[2];
    // Dan iz grupe 3
    const day = matches[3];
    // Sat iz grupe 4
    const hour = matches[4];
    // Minut iz grupe 5
    const minute = matches[5];
    // Sekund iz grupe 6 (ovde se ne koristi u prikazu)
    const second = matches[6];

    // Sastavlja formatirani string "dd/MM/yyyy HH:mm"
    readableDate = `${day}/${month}/${year} ${hour}:${minute}`;
  } else {
    // Ako format nije validan, loguje poruku u konzolu
    console.log("Invalid date format");
  }
  // Vraća formatirani ili originalni datum
  return readableDate;
} 

// Eksporuje funkciju koja "truthy" vrednost prikazuje kao "Da", a "falsy" kao "Ne"
export function formatBool(value) {
  // Ternarni operator: true -> "Da", false -> "Ne"
  return value ? "Da" : "Ne";
}
