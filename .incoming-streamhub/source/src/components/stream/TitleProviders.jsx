import { posterUrl } from '@/lib/media';

export default function TitleProviders({ regions, loading, regionCode, onRegionChange }) {
  const selected = (regions || []).find((region) => region.iso3166_1 === regionCode);
  const combined = selected ? [...selected.flatrate, ...selected.rent, ...selected.buy].slice(0, 8) : [];

  return (
    <section className="title-providers">
      <div className="title-provider-heading">
        <h2>Watch availability</h2>
        <label className="title-region-select">
          <span>Region</span>
          <select value={regionCode} onChange={(event) => onRegionChange(event.target.value)} aria-label="Select availability region">
            <option value="WW">Worldwide</option>
            {(regions || [])
              .filter((region) => region.iso3166_1 !== 'WW')
              .map((region) => (
                <option key={region.iso3166_1} value={region.iso3166_1}>
                  {region.iso3166_1}
                </option>
              ))}
          </select>
        </label>
      </div>
      <div className="provider-row">
        {combined.length ? (
          combined.map((provider) => (
            <div className="provider-tile" key={provider.providerId}>
              {provider.logoPath ? <img src={posterUrl(provider.logoPath)} alt="" loading="lazy" /> : <span className="provider-initial">{provider.name.slice(0, 1)}</span>}
              <span>{provider.name}</span>
            </div>
          ))
        ) : (
          <p className="muted">
            {loading ? 'Loading availability…' : `No provider listings for ${regionCode === 'WW' ? 'Worldwide' : regionCode}.`}
          </p>
        )}
      </div>
    </section>
  );
}