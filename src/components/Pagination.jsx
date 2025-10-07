// Izvozi podrazumevanu funkcionalnu komponentu Pagination sa props-ima: page, totalPages, onPrev, onNext
export default function Pagination({ page, totalPages, onPrev, onNext }) {
  // Vraća JSX sadržaj komponente
  return (
    // Red (horizontalni raspored) sa gornjom marginom
    <div className="row" style={{ marginTop: 10 }}>
      {/* Dugme za prethodnu stranicu; onemogućeno kada je trenutna strana 0 */}
      <button disabled={page === 0} onClick={onPrev}>◀</button>
      {/* Tekstualni prikaz: trenutna strana (1-bazirano) / ukupan broj strana (najmanje 1) */}
      <span className="kbd">strana {page + 1} / {Math.max(1, totalPages || 1)}</span>
      {/* Dugme za sledeću stranicu; onemogućeno kada je poslednja strana dostignuta */}
      <button disabled={page + 1 >= (totalPages || 1)} onClick={onNext}>▶</button>
    </div>
  );
}
