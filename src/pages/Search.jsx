import { Link, useParams } from 'react-router-dom';
import { useMemo } from 'react';
import { ArrowLeft } from 'lucide-react';
import LoadingGrid from '@/components/stream/LoadingGrid';
import QueryError from '@/components/stream/QueryError';
import PosterGrid from '@/components/stream/PosterGrid';
import PageHeading from '@/components/stream/PageHeading';
import { useSearch } from '@/hooks/useTmdb';

export default function Search() {
  const { query: rawQuery } = useParams();
  const query = decodeURIComponent(rawQuery || '').trim();
  const fallbackQuery = useMemo(() => {
    const words = query.split(/\s+/).filter(Boolean);
    const longestWord = words.sort((a, b) => b.length - a.length)[0] || query;
    return longestWord.length > 4 ? longestWord.slice(0, Math.max(3, longestWord.length - 2)) : longestWord;
  }, [query]);
  const result = useSearch({ query, page: 1 }, { enabled: query.length > 0 });
  const fallback = useSearch(
    { query: fallbackQuery, page: 1 },
    { enabled: query.length > 0 && fallbackQuery !== query && !result.isLoading && !result.data?.results?.length },
  );
  const displayedResults = result.data?.results?.length ? result.data.results : fallback.data?.results || [];
  const showingRelated = !result.data?.results?.length && displayedResults.length > 0;

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
        <span>{showingRelated ? `${displayedResults.length} related results` : result.data?.totalResults ? `${result.data.totalResults} results` : 'Movies and series'}</span>
        <span>Worldwide catalogue</span>
      </div>
      {result.isLoading || fallback.isLoading ? (
        <LoadingGrid />
      ) : result.isError && fallback.isError ? (
        <QueryError retry={result.refetch} />
      ) : (
        <PosterGrid
          items={displayedResults}
          emptyTitle="No titles found"
          emptyCopy="Try another title, actor, or keyword."
        />
      )}
    </div>
  );
}
