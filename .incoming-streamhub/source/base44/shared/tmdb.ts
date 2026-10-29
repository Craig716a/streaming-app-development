const TMDB_BASE = "https://api.themoviedb.org/3";
const CACHE_TTL_MS = 5 * 60 * 1000;
const CACHE_LIMIT = 400;

const cache = new Map();

export class TmdbError extends Error {
  constructor(message, status) {
    super(message);
    this.name = "TmdbError";
    this.status = status;
  }
}

export async function getTmdb(apiKey, path, params = {}) {
  if (!apiKey) throw new TmdbError("TMDb API key is not configured.", 503);

  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== "") query.set(key, String(value));
  }

  const cacheKey = `${path}?${query.toString()}`;
  const cached = cache.get(cacheKey);
  if (cached && cached.expiresAt > Date.now()) return cached.value;

  const url = new URL(`${TMDB_BASE}${path}`);
  url.searchParams.set("api_key", apiKey);
  query.forEach((value, key) => url.searchParams.set(key, value));

  const response = await fetch(url, {
    headers: { Accept: "application/json" },
    signal: AbortSignal.timeout(12_000),
  });

  if (!response.ok) throw new TmdbError("TMDb request failed.", response.status);

  const value = await response.json();
  if (cache.size > CACHE_LIMIT) cache.clear();
  cache.set(cacheKey, { value, expiresAt: Date.now() + CACHE_TTL_MS });
  return value;
}

const record = (value) => (value !== null && typeof value === "object" ? value : {});
const array = (value) => (Array.isArray(value) ? value : []);
const text = (value, fallback = "") => (typeof value === "string" ? value : fallback);
const nullableText = (value) => (typeof value === "string" && value.length > 0 ? value : null);
const num = (value, fallback = 0) => (typeof value === "number" && Number.isFinite(value) ? value : fallback);
const nullableNum = (value) => (typeof value === "number" && Number.isFinite(value) ? value : null);

const mediaTypeOf = (value, fallback) => (value === "tv" || fallback === "tv" ? "tv" : "movie");

export function mapMedia(value, fallbackType) {
  const item = record(value);
  return {
    id: num(item.id),
    mediaType: mediaTypeOf(item.media_type, fallbackType),
    title: text(item.title ?? item.name, "Untitled"),
    overview: text(item.overview),
    posterPath: nullableText(item.poster_path),
    backdropPath: nullableText(item.backdrop_path),
    voteAverage: num(item.vote_average),
    releaseDate: nullableText(item.release_date ?? item.first_air_date),
    genreIds: array(item.genre_ids).filter((id) => typeof id === "number"),
    originalLanguage: text(item.original_language, "en"),
  };
}

export function mapPage(value, fallbackType) {
  const page = record(value);
  return {
    page: num(page.page, 1),
    totalPages: num(page.total_pages, 1),
    totalResults: num(page.total_results),
    results: array(page.results)
      .filter((item) => record(item).media_type !== "person")
      .map((item) => mapMedia(item, fallbackType)),
  };
}

const mapGenre = (value) => ({ id: num(record(value).id), name: text(record(value).name, "Other") });

const mapSeasonSummary = (value) => {
  const season = record(value);
  return {
    id: num(season.id),
    seasonNumber: num(season.season_number),
    name: text(season.name, "Season"),
    episodeCount: num(season.episode_count),
    posterPath: nullableText(season.poster_path),
    airDate: nullableText(season.air_date),
  };
};

const mapCast = (value) => {
  const member = record(value);
  return {
    id: num(member.id),
    name: text(member.name, "Cast member"),
    character: text(member.character),
    profilePath: nullableText(member.profile_path),
  };
};

export function mapTitle(value, type) {
  const title = record(value);
  const videos = array(record(title.videos).results).map(record);
  const trailer = videos
    .filter((video) => video.site === "YouTube" && typeof video.key === "string")
    .sort((a, b) => {
      const score = (video) => (video.type === "Trailer" ? 2 : 0) + (video.official === true ? 1 : 0);
      return score(b) - score(a);
    })[0];
  const credits = record(title.credits);
  const lastEpisode = record(title.last_episode_to_air);
  const runtimeValue = title.runtime ?? array(title.episode_run_time)[0];

  return {
    id: num(title.id),
    mediaType: type,
    title: text(title.title ?? title.name, "Untitled"),
    overview: text(title.overview),
    posterPath: nullableText(title.poster_path),
    backdropPath: nullableText(title.backdrop_path),
    voteAverage: num(title.vote_average),
    releaseDate: nullableText(title.release_date ?? title.first_air_date),
    originalLanguage: text(title.original_language, ""),
    trailerKey: nullableText(trailer && trailer.key),
    trailerName: nullableText(trailer && trailer.name),
    genres: array(title.genres).map(mapGenre),
    runtime: nullableNum(runtimeValue),
    numberOfSeasons: nullableNum(title.number_of_seasons),
    numberOfEpisodes: nullableNum(title.number_of_episodes),
    lastEpisodeNumber: nullableNum(lastEpisode.episode_number),
    lastEpisodeName: nullableText(lastEpisode.name),
    status: nullableText(title.status),
    seasons: array(title.seasons).map(mapSeasonSummary),
    cast: array(credits.cast).slice(0, 12).map(mapCast),
  };
}

export function mapSeason(value) {
  const season = record(value);
  const episodes = array(season.episodes)
    .map((value) => {
      const episode = record(value);
      return {
        id: num(episode.id),
        episodeNumber: num(episode.episode_number),
        name: text(episode.name, "Episode"),
        overview: text(episode.overview),
        stillPath: nullableText(episode.still_path),
        airDate: nullableText(episode.air_date),
        runtime: nullableNum(episode.runtime),
        voteAverage: num(episode.vote_average),
      };
    })
    .sort((a, b) => a.episodeNumber - b.episodeNumber);

  return {
    id: num(season.id),
    seasonNumber: num(season.season_number),
    name: text(season.name, "Season"),
    overview: text(season.overview),
    posterPath: nullableText(season.poster_path),
    airDate: nullableText(season.air_date),
    episodeCount: episodes.length || num(season.episode_count),
    episodes,
  };
}

const mapProvider = (value) => {
  const provider = record(value);
  return {
    providerId: num(provider.provider_id),
    name: text(provider.provider_name, "Streaming service"),
    logoPath: nullableText(provider.logo_path),
    displayPriority: num(provider.display_priority, 999),
  };
};

export function mapProviderList(value) {
  return array(record(value).results)
    .map(mapProvider)
    .sort((a, b) => a.displayPriority - b.displayPriority);
}

export function mapProviderRegions(value) {
  return array(record(value).results)
    .map((value) => {
      const region = record(value);
      return {
        iso3166_1: text(region.iso_3166_1),
        englishName: text(region.english_name),
      };
    })
    .filter((region) => region.iso3166_1.length === 2)
    .sort((a, b) => a.englishName.localeCompare(b.englishName));
}

export function mapTitleProviders(value) {
  return Object.entries(record(record(value).results))
    .map(([iso, value]) => {
      const region = record(value);
      return {
        iso3166_1: iso,
        link: nullableText(region.link),
        flatrate: array(region.flatrate).map(mapProvider),
        rent: array(region.rent).map(mapProvider),
        buy: array(region.buy).map(mapProvider),
      };
    })
    .filter((region) => region.flatrate.length || region.rent.length || region.buy.length);
}