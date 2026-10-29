export function vidlyMovieUrl(id) {
  return `https://vidly.pro/movie/${id}`;
}

export function vidlyTvUrl(id, seasonNumber = 1, episodeNumber = 1) {
  return `https://vidly.pro/tv/${id}/${seasonNumber}/${episodeNumber}`;
}

export function vidlyAnimeUrl(malId, episodeNumber = 1, track = 'sub') {
  return `https://vidly.pro/anime/mal/${malId}/${episodeNumber}/${track === 'dub' ? 'dub' : 'sub'}`;
}

export function absoluteEpisodeNumber(seasons = [], seasonNumber = 1, episodeNumber = 1) {
  const earlier = seasons
    .filter((season) => season.seasonNumber >= 1 && season.seasonNumber < seasonNumber)
    .reduce((total, season) => total + (season.episodeCount || 0), 0);
  return earlier + episodeNumber;
}
