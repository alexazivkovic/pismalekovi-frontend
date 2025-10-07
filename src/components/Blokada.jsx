// Izvozi podrazumevanu React funkcionalnu komponentu Blokada
export default function Blokada(){
    // Vraća paragraf sa tekstom i tri linka (ka Blokade.org i dve Instagram stranice)
    return <p>Za sve informacije o blokadama možete posetiti 
        {/* Link ka Blokade.org sa prilagođenim stilom (narandžasta boja, bez podvlačenja) */}
        <a style={{color: '#D84B16', textDecoration: 'none'}} href="https://blokade.org/sr/"> Blokade.org </a> 
        {/* Tekstualni konektor "ili zvanične Instagram stranice" */}
        ili zvanične Instagram stranice 
        {/* Link ka Instagram profilu "Studenti u blokadi" sa istim stilom */}
        <a style={{color: '#D84B16', textDecoration: 'none'}} href="https://www.instagram.com/studenti_u_blokadi/"> Studenti u blokadi </a> 
        {/* Tekstualni konektor "i" */}
        i 
        {/* Link ka Instagram profilu "Blokada FON" sa istim stilom */}
        <a style={{color: '#D84B16', textDecoration: 'none'}} href="https://www.instagram.com/blokada.fon/"> Blokada FON</a>.
    </p>
}
// Zatvara deklaraciju komponente
