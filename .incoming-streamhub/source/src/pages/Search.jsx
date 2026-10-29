import { Link, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import LoadingGrid from '@/components/stream/LoadingGrid';
import QueryError from '@/components/stream/QueryError';
import PosterGrid from '@/components/stream/PosterGrid';
import PageHeading from '@/components/stream/PageHeading';
import { useSearch } from '@/hooks/useTmdb';

export default function Search() {
  const { query: rawQuery } = useParams();
  const query = decodeURIComponent(rawQuery || '').trim();
  const result = useSearch({ query, page: 1 }, { enabled: query.length > 0 });

  return (
    <div className="page-wrap">
      <PageHeading
        eyebrow="Search the collection"
        title={<>{'Results for '}<em>“{query}”</em></>}
        action={
          <Link to="/" className="icon-button" aria-label="Back home">
            <ArrowLeft size={19} />
          </Link>
        }
      />
      <div className="results-meta">
        <span>{result.data?.totalResults ? `${result.data.totalResults} results` : 'Movies and series'}</span>
        <span>Worldwide catalogue</span>
      </div>
      {result.isLoading ? (
        <LoadingGrid />
      ) : result.isError ? (
        <QueryError retry={result.refetch} />
      ) : (
        <PosterGrid items={result.data?.results || []} emptyTitle="No titles found" emptyCopy="Try another title, actor, or keyword." />
      )}
    </div>
  );
}