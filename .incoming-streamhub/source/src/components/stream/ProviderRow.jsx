import { Link } from 'react-router-dom';
import { posterUrl } from '@/lib/media';

export default function ProviderRow({ providers = [] }) {
  return (
    <div className="provider-row">
      {providers.map((provider) => (
        <Link to={`/streaming/${provider.providerId}`} className="provider-tile" key={provider.providerId} aria-label={`Browse ${provider.name}`}>
          {provider.logoPath ? <img src={posterUrl(provider.logoPath)} alt="" loading="lazy" /> : <span className="provider-initial">{provider.name.slice(0, 1)}</span>}
          <span>{provider.name}</span>
        </Link>
      ))}
    </div>
  );
}