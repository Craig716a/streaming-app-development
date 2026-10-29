import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import LoadingGrid from '@/components/stream/LoadingGrid';
import QueryError from '@/components/stream/QueryError';
import EmptyState from '@/components/stream/EmptyState';
import PosterCard from '@/components/stream/PosterCard';
import PageHeading from '@/components/stream/PageHeading';
import PillRow from '@/components/stream/PillRow';
import ProviderService from '@/components/stream/ProviderService';
import { useCatalog, useProviders, useTrending } from '@/hooks/useTmdb';
import useSaved from '@/hooks/useSaved';
import { initialProviderRegion, localToday, posterUrl } from '@/lib/media';

const charts = [
  { value: 'hot', label: 'Hot Chart' },
  { value: 'soaring', label: 'Soaring List' },
  { value: 'new', label: 'New List' },
  { value: 'search', label: 'Hot Search' },
];

export default function Streaming() {
  const { providerId } = useParams();
  const [chart, setChart] = useState('hot');
  const [media, setMedia] = useState('all');
  const [providerRegion] = useSaved('stream-world-provider-region', initialProviderRegion());

  const activeProviderId = Number(providerId);
  const hasActiveProvider = Number.isInteger(activeProviderId) && activeProviderId > 0;

  const movieProviders = useProviders({ mediaType: 'movie', watchRegion: providerRegion });
  const tvProviders = useProviders({ mediaType: 'tv', watchRegion: providerRegion });

  const providers = [...(movieProviders.data || []), ...(tvProviders.data || [])]
    .filter((provider, index, list) => list.findIndex((item) => item.providerId === provider.providerId) === index)
    .sort((a, b) => a.displayPriority - b.displayPriority);

  const today = localToday();
  const isTrendChart = chart === 'hot' || chart === 'search';

  const trending = useTrending(
    { mediaType: media, timeWindow: chart === 'search' ? 'day' : 'week', page: 1 },
    { enabled: !hasActiveProvider && isTrendChart },
  );

  const catalog = useCatalog(
    {
      mediaType: media === 'all' ? 'movie' : media,
      sortBy: chart === 'new' ? 'release_date.desc' : 'vote_average.desc',
      releaseDateLte: chart === 'new' ? today : undefined,
      page: 1,
    },
    { enabled: !hasActiveProvider && !isTrendChart },
  );

  if (hasActiveProvider) {
    return (
      <ProviderService
        providerId={activeProviderId}
        providerName={providers.find((provider) => provider.providerId === activeProviderId)?.name}
        region={providerRegion}
      />
    );
  }

  const items = (isTrendChart ? trending.data?.results || [] : catalog.data?.results || []).filter(
    (item) => chart !== 'new' || (item.posterPath && item.releaseDate && item.releaseDate <= today),
  );
  const loading = isTrendChart ? trending.isLoading : catalog.isLoading;
  const failed = isTrendChart ? trending.isError : catalog.isError;
  const retry = () => (isTrendChart ? trending.refetch() : catalog.refetch());

  return (
    <div className="page-wrap streaming-page">
      <PageHeading title="Streaming" />

      <section className="provider-strip">
        <div className="provider-strip-heading">
          <h2>Streaming services</h2>
        </div>
        {movieProviders.isLoading || tvProviders.isLoading ? (
          <div className="provider-skeletons">
            {[0, 1, 2, 3, 4].map((key) => (
              <i key={key} />
            ))}
          </div>
        ) : movieProviders.isError || tvProviders.isError ? (
          <QueryError
            retry={() => {
              movieProviders.refetch();
              tvProviders.refetch();
            }}
          />
        ) : providers.length ? (
          <div className="provider-row">
            {providers.map((provider) => (
              <Link to={`/streaming/${provider.providerId}`} className="provider-tile" key={provider.providerId}>
                {provider.logoPath ? <img src={posterUrl(provider.logoPath)} alt="" loading="lazy" /> : <span className="provider-initial">{provider.name.slice(0, 1)}</span>}
                <span>{provider.name}</span>
              </Link>
            ))}
          </div>
        ) : (
          <EmptyState title="No services found" copy="TMDb doesn’t list any streaming services right now. Try again later." />
        )}
      </section>

      <div className="chart-tabs">
        {charts.map((entry) => (
          <button key={entry.value} type="button" className={chart === entry.value ? 'chart-tab active' : 'chart-tab'} onClick={() => setChart(entry.value)}>
            {entry.label}
          </button>
        ))}
      </div>

      <div className="streaming-filters">
        <PillRow
          options={[
            { label: 'All', value: 'all' },
            { label: 'Movies', value: 'movie' },
            { label: 'Series', value: 'tv' },
          ]}
          value={media}
          onChange={setMedia}
        />
      </div>

      {loading ? (
        <LoadingGrid />
      ) : failed ? (
        <QueryError retry={retry} />
      ) : items.length ? (
        <div className="ranked-grid streaming-grid">
          {items.map((item, index) => (
            <PosterCard key={`${item.mediaType}-${item.id}`} item={item} rank={isTrendChart ? undefined : index + 1} />
          ))}
        </div>
      ) : (
        <EmptyState title="No titles in this chart" copy="Try a different category or chart." />
      )}
    </div>
  );
}