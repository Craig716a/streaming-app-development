import { useQuery } from '@tanstack/react-query';
import { tmdbRequest } from '@/api/tmdb';

const STALE = 5 * 60 * 1000;

const query = (action, params, extra) => ({
  queryKey: ['tmdb', action, params],
  queryFn: () => tmdbRequest(action, params || {}),
  staleTime: STALE,
  ...extra,
});

export const useCatalog = (params, extra) => useQuery(query('catalog', params, extra));
export const useTrending = (params, extra) => useQuery(query('trending', params, extra));
export const useToday = (params, extra) => useQuery(query('today', params, extra));
export const useSearch = (params, extra) => useQuery(query('search', params, extra));
export const useProviders = (params, extra) => useQuery(query('providers', params, extra));
export const useRecommendations = (mediaType, id, extra) => useQuery(query('recommendations', { mediaType, id }, extra));
export const useTitleProviders = (mediaType, id, extra) => useQuery(query('titleProviders', { mediaType, id }, extra));

export const useTitle = (mediaType, id, extra) =>
  useQuery(query('title', { mediaType, id }, { enabled: Boolean(mediaType && id), ...extra }));

export const useSeason = (mediaType, id, seasonNumber, extra) =>
  useQuery(query('season', { mediaType, id, seasonNumber }, { enabled: Boolean(mediaType && id), ...extra }));

export const useProviderRegions = (extra) =>
  useQuery({
    queryKey: ['tmdb', 'providerRegions'],
    queryFn: () => tmdbRequest('providerRegions'),
    staleTime: 60 * 60 * 1000,
    ...extra,
  });

export const useAnimeLookup = (title, enabled = true) =>
  useQuery({
    queryKey: ['tmdb', 'anime', title],
    queryFn: () => tmdbRequest('animeLookup', { title }),
    enabled: Boolean(title) && enabled,
    staleTime: 24 * 60 * 60 * 1000,
  });