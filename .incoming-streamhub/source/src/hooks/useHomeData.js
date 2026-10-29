import { useCatalog, useProviders, useToday, useTrending } from '@/hooks/useTmdb';
import { localToday } from '@/lib/media';

export default function useHomeData({ homeTab, media, genreId, originalLanguage, catalogPage, providerRegion }) {
  const trending = useTrending({
    mediaType: homeTab === 'Recommend' ? 'all' : media,
    timeWindow: 'week',
    page: 1,
  });

  const catalog = useCatalog({
    mediaType: media,
    genreId,
    originalLanguage,
    sortBy: 'popularity.desc',
    page: catalogPage,
  });

  const korean = useCatalog(
    { mediaType: 'tv', genreId: 18, originalLanguage: 'ko', sortBy: 'popularity.desc', page: 1 },
    { enabled: homeTab === 'Recommend' || homeTab === 'TV Shows' },
  );

  const today = useToday({ mediaType: 'all', date: localToday() });

  const movieProviders = useProviders({ mediaType: 'movie', watchRegion: providerRegion });
  const tvProviders = useProviders({ mediaType: 'tv', watchRegion: providerRegion });

  const providers = [...(movieProviders.data || []), ...(tvProviders.data || [])]
    .filter((provider, index, list) => list.findIndex((item) => item.providerId === provider.providerId) === index)
    .sort((a, b) => a.displayPriority - b.displayPriority)
    .slice(0, 12);

  return { trending, catalog, korean, today, providers };
}