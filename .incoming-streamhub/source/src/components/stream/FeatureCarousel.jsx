import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { BACKDROP_SIZE, POSTER_SIZE, posterUrl } from '@/lib/media';

export default function FeatureCarousel({ items = [], index = 0, onSelect, onNext }) {
  const current = items[index % Math.max(1, items.length)];
  const background = current
    ? `linear-gradient(90deg, rgba(2,10,17,.28), rgba(2,10,17,.04)), url(${posterUrl(
        current.backdropPath || current.posterPath,
        current.backdropPath ? BACKDROP_SIZE : POSTER_SIZE,
      )})`
    : undefined;

  return (
    <div className="feature-carousel">
      {current ? (
        <Link to={`/title/${current.mediaType}/${current.id}`} className="feature-banner" style={{ backgroundImage: background }} aria-label={`Featured: ${current.title}`} />
      ) : (
        <div className="feature-banner feature-loading" />
      )}
      <div className="feature-dots">
        {items.map((item, dotIndex) => (
          <button
            key={`${item.mediaType}-${item.id}`}
            type="button"
            onClick={() => onSelect(dotIndex)}
            className={dotIndex === index ? 'selected' : ''}
            aria-label={`Show featured title ${dotIndex + 1}`}
          />
        ))}
        {items.length > 1 ? (
          <button type="button" className="feature-next" onClick={onNext} aria-label="Next featured title">
            <ChevronRight size={14} />
          </button>
        ) : null}
      </div>
    </div>
  );
}