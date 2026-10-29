import { UserRound } from 'lucide-react';
import { posterUrl } from '@/lib/media';

export default function CastRow({ cast = [] }) {
  if (!cast.length) return null;

  return (
    <section className="cast-section">
      <div className="section-toolbar">
        <div>
          <span className="eyebrow">The people behind it</span>
          <h2>Cast</h2>
        </div>
      </div>
      <div className="cast-row">
        {cast.map((person) => (
          <div className="cast-card" key={person.id}>
            <div className="cast-avatar">{person.profilePath ? <img src={posterUrl(person.profilePath)} alt="" loading="lazy" /> : <UserRound size={22} />}</div>
            <strong>{person.name}</strong>
            <span>{person.character}</span>
          </div>
        ))}
      </div>
    </section>
  );
}