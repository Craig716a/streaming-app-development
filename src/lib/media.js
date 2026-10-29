export const POSTER_SIZE = 'https://image.tmdb.org/t/p/w500';
export const BACKDROP_SIZE = 'https://image.tmdb.org/t/p/w1280';

export const posterUrl = (path, size = POSTER_SIZE) => (path ? `${size}${path}` : '');

export const yearOf = (date) => (date ? String(date).slice(0, 4) : '—');

export const localToday = () => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
};

export const uniqueTitles = (items) =>
  items.filter(
    (item, index) =>
      items.findIndex((candidate) => candidate.mediaType === item.mediaType && candidate.id === item.id) === index,
  );

export const initialProviderRegion = () => {
  const locale = typeof navigator === 'undefined' ? 'en-US' : navigator.language;
  return locale.match(/-([a-z]{2})(?:-|$)/i)?.[1]?.toUpperCase() || 'US';
};

export const isAnimeTitle = (title) => {
  if (!title) return false;
  const isAnimation = (title.genres || []).some((genre) => genre.id === 16);
  const japanese = (title.originalLanguage || title.languages?.[0] || '').startsWith('ja');
  return isAnimation && japanese;
};