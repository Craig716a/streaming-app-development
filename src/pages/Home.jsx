import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ChevronRight, Clock3, ListFilter, Search, SlidersHorizontal, X } from 'lucide-react';
import LoadingGrid from '@/components/stream/LoadingGrid';
import QueryError from '@/components/stream/QueryError';
import EmptyState from '@/components/stream/EmptyState';
import PosterCard from '@/components/stream/PosterCard';
import RecommendCard from '@/components/stream/RecommendCard';
import ProviderRow from '@/components/stream/ProviderRow';
import FeatureCarousel from '@/components/stream/FeatureCarousel';
import useHomeData from '@/hooks/useHomeData';
import useSaved from '@/hooks/useSaved';
import { initialProviderRegion, uniqueTitles } from '@/lib/media';

const homeCategories = ['Recommend', 'Reality-TV', 'Movies', 'TV Shows', 'Anime', 'Korean Dramas'];

export default function Home() {
  const navigate = useNavigate();
  const [searchText, setSearchText] = useState('');
  const [homeTab, setHomeTab] = useState('Recommend');
  const [featureIndex, setFeatureIndex] = useState(0);
  const [catalogPage, setCatalogPage] = useState(1);
  const [relatedPage, setRelatedPage] = useState(1);
  const [providerRegion] = useSaved('stream-world-provider-region', initialProviderRegion());

  const media = homeTab === 'Movies' ? 'movie' : 'tv';
  const genreId = homeTab === 'Reality-TV' ? 10764 : homeTab === 'Anime' ? 16 : homeTab === 'Korean Dramas' ? 18 : undefined;
  const originalLanguage = homeTab === 'Korean Dramas' ? 'ko' : undefined;

  const { trending, catalog, korean, today, providers } = useHomeData({
    homeTab,
    media,
    genreId,
    originalLanguage,
    catalogPage,
    providerRegion,
  });

  const recommended = uniqueTitles([
    ...(trending.data?.results || []),
    ...(catalog.data?.results || []),
  ]);
  const featuredItems = recommended.slice(0, 10);
  const loading = homeTab === 'Recommend' ? trending.isLoading : catalog.isLoading;
  const failed = homeTab === 'Recommend' ? trending.isError : catalog.isError;
  const retry = homeTab === 'Recommend' ? trending.refetch : catalog.refetch;
  const showKoreanShelf = homeTab === 'Recommend' || homeTab === 'TV Shows';

  useEffect(() => {
    if (featuredItems.length < 2) return undefined;
    const timer = window.setInterval(() => {
      setFeatureIndex((index) => (index + 1) % featuredItems.length);
    }, 7000);
    return () => window.clearInterval(timer);
  }, [homeTab, featuredItems.length]);

  const changePicks = () => {
    setRelatedPage((page) => page + 1);
    setCatalogPage((page) => page + 1);
  };

  const selectTab = (label) => {
    setHomeTab(label);
    setFeatureIndex(0);
    setCatalogPage(1);
  };

  return (
    <div className="home-page">
      <div className="home-search-row">
        <form
          className="top-search"
          onSubmit={(event) => {
            event.preventDefault();
            if (searchText.trim()) navigate(`/search/${encodeURIComponent(searchText.trim())}`);
          }}
        >
          <Search size={17} />
          <input
            aria-label="Search movies and series"
            placeholder="Search movies, series…"
            value={searchText}
            onChange={(event) => setSearchText(event.target.value)}
          />
          {searchText ? (
            <button type="button" onClick={() => setSearchText('')} aria-label="Clear search">
              <X size={15} />
            </button>
          ) : null}
        </form>
        <button type="button" className="history-shortcut" onClick={() => navigate('/me?panel=history')} aria-label="Open watch history">
          <Clock3 size={22} />
        </button>
      </div>

      <div className="home-category-tabs" role="tablist">
        {homeCategories.map((label) => (
          <button
            key={label}
            type="button"
            role="tab"
            aria-selected={homeTab === label}
            className={homeTab === label ? 'active' : ''}
            onClick={() => selectTab(label)}
          >
            {label}
          </button>
        ))}
      </div>

      <FeatureCarousel
        items={featuredItems}
        index={featureIndex}
        onSelect={setFeatureIndex}
        onNext={() => setFeatureIndex((index) => (index + 1) % Math.max(1, featuredItems.length))}
      />

      <div className="section-toolbar home-section-toolbar">
        <h2>{homeTab === 'Korean Dramas' ? 'Korean Dramas' : homeTab === 'Recommend' ? 'Trending Now' : homeTab}</h2>
        <Link to="/streaming" className="text-link">
          See all <ChevronRight size={15} />
        </Link>
      </div>

      {loading && recommended.length === 0 ? (
        <LoadingGrid />
      ) : failed && recommended.length === 0 ? (
        <QueryError retry={retry} />
      ) : (
        <div className="home-trending-grid">
          {recommended.slice(0, 9).map((item) => (
            <PosterCard key={`${item.mediaType}-${item.id}`} item={item} />
          ))}
        </div>
      )}

      {showKoreanShelf ? (
        <div className="home-korean-section">
          <div className="section-toolbar">
            <h2>New Korean drama series</h2>
            <button type="button" className="text-link-button" onClick={() => selectTab('Korean Dramas')}>
              See all <ChevronRight size={14} />
            </button>
          </div>
          {korean.isLoading ? (
            <LoadingGrid />
          ) : korean.isError ? (
            <QueryError retry={korean.refetch} />
          ) : (
            <div className="home-korean-grid">
              {(korean.data?.results || []).slice(0, 9).map((item) => (
                <PosterCard key={`${item.mediaType}-${item.id}`} item={item} />
              ))}
            </div>
          )}
        </div>
      ) : null}

      <div className="home-compact-section">
        <div className="section-toolbar">
          <h2>New today</h2>
        </div>
        {today.isLoading ? (
          <div className="home-today-loading">
            <LoadingGrid />
          </div>
        ) : today.isError ? (
          <QueryError retry={today.refetch} />
        ) : today.data?.results?.length ? (
          <div className="home-today-grid">
            {today.data.results.slice(0, 9).map((item) => (
              <RecommendCard key={`${item.mediaType}-${item.id}`} item={item} badge={item.mediaType === 'tv' ? 'New episode' : 'New movie'} />
            ))}
          </div>
        ) : (
          <EmptyState title="Nothing new today" copy="New releases and episodes will appear here when they air." />
        )}
      </div>

      <div className="home-related-section">
        <div className="section-toolbar">
          <h2>You may also like</h2>
        </div>
        <div className="you-may-like-grid">
          {recommended.slice(2 + (relatedPage % 2), 6 + (relatedPage % 2)).map((item, index) => (
            <RecommendCard key={`${item.mediaType}-${item.id}`} item={item} episodeBadge={item.mediaType === 'tv' && index % 2 === 0} />
          ))}
        </div>
        <div className="home-action-pair">
          <button type="button" onClick={changePicks}>
            <ListFilter size={16} /> More Wonderful
          </button>
          <button type="button" onClick={changePicks}>
            <SlidersHorizontal size={16} /> Change
          </button>
        </div>
      </div>

      <section className="home-streaming">
        <div className="section-toolbar">
          <h2>Streaming services</h2>
          <Link to="/streaming" className="text-link">
            Explore <ChevronRight size={15} />
          </Link>
        </div>
        <ProviderRow providers={providers} />
      </section>
    </div>
  );
}
