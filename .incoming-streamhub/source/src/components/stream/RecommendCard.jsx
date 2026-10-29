import { Link } from 'react-router-dom';
import { yearOf } from '@/lib/media';

export default function RecommendCard({ item, episodeBadge, badge }) {
  return (
    <Link to={`/title/${item.mediaType}/${item.id}`} className="recommend-card">
      <div className="recommend-image">
        {item.posterPath ? <img src={`https://image.tmdb.org/t/p/w500${item.posterPath}`} alt={`${item.title} poster`} loading="lazy" /> : null}
        {episodeBadge || badge ? <span className="episode-badge">{badge || 'New episode'}</span> : null}
        <span className="recommend-title-overlay">{item.title}</span>
        <span className="recommend-rating">{item.voteAverage ? item.voteAverage.toFixed(1) : '—'}</span>
      </div>
      <div className="recommend-caption">
        <strong>{item.title}</strong>
        <small>
          {item.mediaType === 'tv' ? 'TV series' : 'Movie'} · {yearOf(item.releaseDate)}
        </small>
      </div>
    </Link>
  );
}