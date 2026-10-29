import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, ListFilter, Search } from 'lucide-react';
import LoadingGrid from '@/components/stream/LoadingGrid';
import QueryError from '@/components/stream/QueryError';
import PosterGrid from '@/components/stream/PosterGrid';
import PageHeading from '@/components/stream/PageHeading';
import PillRow from '@/components/stream/PillRow';
import { useCatalog } from '@/hooks/useTmdb';

const genres = [
  { id: 0, name: 'All' },
  { id: 28, name: 'Action' },
  { id: 12, name: 'Adventure' },
  { id: 16, name: 'Animation' },
  { id: 878, name: 'Science Fiction' },
  { id: 35, name: 'Comedy' },
  { id: 10402, name: 'Music & Musical' },
  { id: 10749, name: 'Romance' },
  { id: 10764, name: 'Reality-TV' },
  { id: 99, name: 'Documentary' },
  { id: 10759, name: 'Action & Adventure' },
  { id: 10768, name: 'War' },
  { id: 18, name: 'Drama' },
  { id: 27, name: 'Horror' },
  { id: 80, name: 'Crime' },
];

const years = Array.from({ length: 10 }, (_, index) => new Date().getFullYear() - index);

export default function Categories() {
  const [media, setMedia] = useState('movie');
  const [genre, setGenre] = useState(0);
  const [year, setYear] = useState(0);
  const [sort, setSort] = useState('popularity.desc');
  const [page, setPage] = useState(1);

  const result = useCatalog({
    mediaType: media,
    genreId: genre || undefined,
    year: year || undefined,
    sortBy: sort,
    page,
  });

  const update = (apply) => {
    apply();
    setPage(1);
  };

  return (
    <div className="page-wrap categories-page">
      <PageHeading
        title="Categories"
        action={
          <Link to="/" className="icon-button" aria-label="Search catalogue">
            <Search size={20} />
          </Link>
        }
      />

      <div className="filter-panel">
        <div className="filter-line">
          <span className="filter-label">Format</span>
          <PillRow
            options={[
              { label: 'Movies', value: 'movie' },
              { label: 'TV Shows', value: 'tv' },
            ]}
            value={media}
            onChange={(value) => update(() => setMedia(value))}
          />
        </div>
        <div className="filter-line">
          <span className="filter-label">Genre</span>
          <div className="filter-scroll">
            <PillRow options={genres.map((entry) => ({ label: entry.name, value: entry.id }))} value={genre} onChange={(value) => update(() => setGenre(Number(value)))} />
          </div>
        </div>
        <div className="filter-line">
          <span className="filter-label">Year</span>
          <div className="filter-scroll">
            <PillRow
              options={[{ label: 'All years', value: 0 }, ...years.map((value) => ({ label: String(value), value }))]}
              value={year}
              onChange={(value) => update(() => setYear(Number(value)))}
            />
          </div>
        </div>
        <div className="filter-line">
          <span className="filter-label">Sort by</span>
          <PillRow
            options={[
              { label: 'Popularity', value: 'popularity.desc' },
              { label: 'Latest', value: 'release_date.desc' },
              { label: 'Top today', value: 'vote_average.desc' },
            ]}
            value={sort}
            onChange={(value) => update(() => setSort(value))}
          />
        </div>
      </div>

      <div className="results-meta">
        <span>{result.data?.totalResults ? `${result.data.totalResults.toLocaleString()} titles` : 'Explore titles'}</span>
        <span>
          <ListFilter size={14} /> Sorted for you
        </span>
      </div>

      {result.isLoading ? <LoadingGrid /> : result.isError ? <QueryError retry={result.refetch} /> : <PosterGrid items={result.data?.results || []} className="category-grid" />}

      {result.data && result.data.totalPages > 1 ? (
        <div className="pagination">
          <button type="button" className="button-secondary" disabled={page <= 1} onClick={() => setPage((current) => current - 1)}>
            <ChevronLeft size={16} /> Previous
          </button>
          <span>
            Page {page} of {Math.min(result.data.totalPages, 500)}
          </span>
          <button type="button" className="button-secondary" disabled={page >= result.data.totalPages} onClick={() => setPage((current) => current + 1)}>
            Next <ChevronRight size={16} />
          </button>
        </div>
      ) : null}
    </div>
  );
}