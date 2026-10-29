import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { posterUrl, yearOf } from '@/lib/media';

export default function MiniTitle({ item }) {
  return (
    <Link to={`/title/${item.mediaType}/${item.id}`} className="mini-title">
      <div className="mini-poster">{item.posterPath ? <img src={posterUrl(item.posterPath)} alt="" /> : null}</div>
      <span>
        <strong>{item.title}</strong>
        <small>
          {item.mediaType === 'tv' ? 'Series' : 'Movie'} · {yearOf(item.releaseDate)}
        </small>
      </span>
      <ChevronRight size={16} />
    </Link>
  );
}