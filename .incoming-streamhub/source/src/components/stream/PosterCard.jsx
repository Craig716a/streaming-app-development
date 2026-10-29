import { Link } from 'react-router-dom';
import { Heart, Star } from 'lucide-react';
import { posterUrl, yearOf } from '@/lib/media';

export default function PosterCard({ item, large = false, rank, favorite, onFavorite }) {
  return (
    <article className={`poster-card ${large ? 'poster-card-large' : ''}`}>
      <Link to={`/title/${item.mediaType}/${item.id}`} className="poster-link">
        <div className="poster-frame">
          {item.posterPath ? (
            <img src={posterUrl(item.posterPath)} alt={`${item.title} poster`} loading="lazy" />
          ) : (
            <div className="poster-fallback">
              <span>{item.title}</span>
            </div>
          )}
          {rank ? <span className="rank-label">{String(rank).padStart(2, '0')}</span> : null}
          <span className="poster-rating">
            <Star size={12} fill="currentColor" /> {item.voteAverage ? item.voteAverage.toFixed(1) : '—'}
          </span>
        </div>
        <div className="poster-copy">
          <strong>{item.title}</strong>
          <span>
            {item.mediaType === 'tv' ? 'Series' : 'Movie'} · {yearOf(item.releaseDate)}
          </span>
        </div>
      </Link>
      {onFavorite ? (
        <button
          type="button"
          className={`favorite-button ${favorite ? 'is-favorite' : ''}`}
          onClick={onFavorite}
          aria-label={favorite ? 'Remove from favorites' : 'Add to favorites'}
        >
          <Heart size={17} fill={favorite ? 'currentColor' : 'none'} />
        </button>
      ) : null}
    </article>
  );
}