export function vidlyMovieUrl(id) {
  return `https://embedmaster.link/movie/${id}`;
}

export function vidlyTvUrl(id, seasonNumber = 1, episodeNumber = 1) {
  return `https://embedmaster.link/tv/${id}/${seasonNumber}/${episodeNumber}`;
}

export function vidlyAnimeUrl(malId, episodeNumber = 1, track = 'sub') {
  return `https://embedmaster.link/tv/${malId}/1/${episodeNumber}`;
}

export function absoluteEpisodeNumber(seasons = [], seasonNumber = 1, episodeNumber = 1) {
  const earlier = seasons
    .filter((season) => season.seasonNumber >= 1 && season.seasonNumber < seasonNumber)
    .reduce((total, season) => total + (season.episodeCount || 0), 0);
  return earlier + episodeNumber;
}
