export default function Pagination({ page, totalPages, onPrev, onNext }) {
  return (
    <div className="row" style={{ marginTop: 10 }}>
      <button disabled={page === 0} onClick={onPrev}>◀</button>
      <span className="kbd">strana {page + 1} / {Math.max(1, totalPages || 1)}</span>
      <button disabled={page + 1 >= (totalPages || 1)} onClick={onNext}>▶</button>
    </div>
  );
}
