export default function LoadingGrid({ count = 8 }) {
  return (
    <div className="poster-grid" aria-label="Loading catalogue">
      {Array.from({ length: count }, (_, index) => (
        <div className="poster-skeleton" key={index}>
          <div />
          <span />
        </div>
      ))}
    </div>
  );
}