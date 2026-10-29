import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import LoadingGrid from '@/components/stream/LoadingGrid';
import QueryError from '@/components/stream/QueryError';
import EmptyState from '@/components/stream/EmptyState';
import PosterCard from '@/components/stream/PosterCard';
import PageHeading from '@/components/stream/PageHeading';
import PillRow from '@/components/stream/PillRow';
import { useCatalog } from '@/hooks/useTmdb';

export default function ProviderService({ providerId, providerName, region }) {
  const [mediaType, setMediaType] = useState('movie');
  const [page, setPage] = useState(1);

  const titles = useCatalog({
    mediaType,
    watchProviderId: providerId,
    watchRegion: region,
    sortBy: 'popularity.desc',
    page,
  });

  return (
    <div className="page-wrap streaming-page provider-page">
      <PageHeading
        title={providerName || 'Streaming service'}
        action={
          <Link to="/streaming" className="text-link">
            <ArrowLeft size={14} /> All services
          </Link>
        }
      />
      <div className="provider-page-controls">
        <p>
          {mediaType === 'movie' ? 'Movies' : 'Series'} available on {providerName || 'this service'}.
        </p>
      </div>
      <div className="provider-media-tabs">
        <PillRow
          options={[
            { label: 'Movies', value: 'movie' },
            { label: 'Series', value: 'tv' },
          ]}
          value={mediaType}
          onChange={(value) => {
            setMediaType(value);
            setPage(1);
          }}
        />
      </div>
      {titles.isLoading ? (
        <LoadingGrid />
      ) : titles.isError ? (
        <QueryError retry={titles.refetch} />
      ) : (
        <>
          <div className="provider-result-count">
            {(titles.data?.totalResults || 0).toLocaleString()} titles
          </div>
          {titles.data?.results.length ? (
            <div className="ranked-grid streaming-grid">
              {titles.data.results.map((item) => (
                <PosterCard key={`${item.mediaType}-${item.id}`} item={item} />
              ))}
            </div>
          ) : (
            <EmptyState
              title="No titles for this service"
              copy={`TMDb has no ${mediaType === 'movie' ? 'movies' : 'series'} listed for ${providerName || 'this service'}.`}
            />
          )}
          {titles.data?.totalPages > 1 ? (
            <div className="provider-pagination">
              <button type="button" className="button-secondary" disabled={page <= 1} onClick={() => setPage((current) => Math.max(1, current - 1))}>
                Previous
              </button>
              <span>
                Page {page} of {titles.data.totalPages}
              </span>
              <button
                type="button"
                className="button-secondary"
                disabled={page >= titles.data.totalPages}
                onClick={() => setPage((current) => Math.min(titles.data.totalPages, current + 1))}
              >
                Next
              </button>
            </div>
          ) : null}
        </>
      )}
    </div>
  );
}