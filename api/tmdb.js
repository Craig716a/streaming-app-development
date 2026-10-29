import {
  getTmdb,
  TmdbError,
  mapPage,
  mapTitle,
  mapSeason,
  mapProviderList,
  mapProviderRegions,
  mapTitleProviders,
} from "./shared/tmdb.js";

const MEDIA_SORTS = ["popularity.desc", "release_date.desc", "vote_average.desc"];

const toInt = (value, min, max, fallback) => {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed >= min && parsed <= max ? parsed : fallback;
};

const toText = (value, max = 120) => (typeof value === "string" ? value.trim().slice(0, max) : "");
const isoDate = (value) => (typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value) ? value : undefined);
const isoRegion = (value) => (typeof value === "string" && /^[A-Z]{2}$/.test(value) ? value : "");
const isoLanguage = (value) => (typeof value === "string" && /^[a-z]{2}$/.test(value) ? value : "");

async function lookupAnime(title) {
  if (!title) return { malId: null };
  const url = new URL("https://api.jikan.moe/v4/anime");
  url.searchParams.set("q", title);
  url.searchParams.set("limit", "5");
  url.searchParams.set("sfw", "true");

  const response = await fetch(url, {
    headers: { Accept: "application/json" },
    signal: AbortSignal.timeout(10_000),
  });
  if (!response.ok) return { malId: null };

  const body = await response.json();
  const entries = Array.isArray(body && body.data) ? body.data : [];
  const normalise = (value) => String(value || "").toLowerCase().replace(/[^a-z0-9]/g, "");
  const target = normalise(title);
  const best =
    entries.find((entry) => normalise(entry.title) === target) ||
    entries.find((entry) => normalise(entry.title_english) === target) ||
    entries.find((entry) => normalise(entry.title).includes(target) || target.includes(normalise(entry.title))) ||
    entries[0];

  if (!best) return { malId: null };
  return {
    malId: Number(best.mal_id) || null,
    title: best.title_english || best.title || null,
    episodes: Number(best.episodes) || null,
  };
}

export default async function (req) {
  let payload;
  try {
    payload = await req.json();
  } catch {
    return Response.json({ error: "Invalid request body" }, { status: 400 });
  }

  const action = toText(payload && payload.action, 40);
  if (!action) return Response.json({ error: "action is required" }, { status: 400 });

  if (action === "animeLookup") {
    try {
      return Response.json(await lookupAnime(toText(payload.title, 160)));
    } catch (error) {
      return Response.json({ error: error.message }, { status: 502 });
    }
  }

  const apiKey = process.env.TMDB_API_KEY;
  if (!apiKey) return Response.json({ error: "TMDb API key is not configured." }, { status: 503 });

  const mediaType = payload.mediaType === "tv" ? "tv" : "movie";
  const page = toInt(payload.page, 1, 500, 1);
  const titleId = toInt(payload.id, 1, 100_000_000, 0);

  try {
    if (action === "catalog") {
      const sortBy = MEDIA_SORTS.includes(payload.sortBy) ? payload.sortBy : "popularity.desc";
      const releaseDateLte = isoDate(payload.releaseDateLte);
      const genreId = toInt(payload.genreId, 1, 100_000, 0);
      const year = toInt(payload.year, 1900, 2100, 0);
      const providerId = toInt(payload.watchProviderId, 1, 100_000, 0);
      const watchRegion = isoRegion(payload.watchRegion);
      const originalLanguage = isoLanguage(payload.originalLanguage);
      const raw = await getTmdb(apiKey, `/discover/${mediaType}`, {
        sort_by: mediaType === "tv" && sortBy === "release_date.desc" ? "first_air_date.desc" : sortBy,
        page,
        with_genres: genreId || undefined,
        with_original_language: originalLanguage || undefined,
        primary_release_year: mediaType === "movie" && year ? year : undefined,
        first_air_date_year: mediaType === "tv" && year ? year : undefined,
        "primary_release_date.lte": mediaType === "movie" ? releaseDateLte : undefined,
        "first_air_date.lte": mediaType === "tv" ? releaseDateLte : undefined,
        with_watch_providers: providerId || undefined,
        watch_region: providerId ? watchRegion || undefined : undefined,
        include_adult: "false",
      });
      return Response.json(mapPage(raw, mediaType));
    }

    if (action === "trending") {
      const type = ["all", "movie", "tv"].includes(payload.mediaType) ? payload.mediaType : "all";
      const window = payload.timeWindow === "day" ? "day" : "week";
      const raw = await getTmdb(apiKey, `/trending/${type}/${window}`, { page });
      return Response.json(mapPage(raw));
    }

    if (action === "today") {
      const date = isoDate(payload.date);
      if (!date) return Response.json({ error: "A valid date is required" }, { status: 400 });
      const shared = { page: 1, include_adult: "false", sort_by: "popularity.desc" };
      const requests = [];
      const types = [];
      const wanted = ["all", "movie", "tv"].includes(payload.mediaType) ? payload.mediaType : "all";
      if (wanted !== "tv") {
        requests.push(
          getTmdb(apiKey, "/discover/movie", {
            ...shared,
            "primary_release_date.gte": date,
            "primary_release_date.lte": date,
          }),
        );
        types.push("movie");
      }
      if (wanted !== "movie") {
        requests.push(
          getTmdb(apiKey, "/discover/tv", {
            ...shared,
            "air_date.gte": date,
            "air_date.lte": date,
          }),
        );
        types.push("tv");
      }
      const pages = await Promise.all(requests);
      const results = pages
        .flatMap((value, index) => mapPage(value, types[index]).results)
        .sort((a, b) => b.voteAverage - a.voteAverage);
      return Response.json({ page: 1, totalPages: 1, totalResults: results.length, results });
    }

    if (action === "search") {
      const query = toText(payload.query, 120);
      if (!query) return Response.json({ error: "Enter a title to search." }, { status: 400 });
      const raw = await getTmdb(apiKey, "/search/multi", { query, page, include_adult: "false" });
      return Response.json(mapPage(raw));
    }

    if (action === "providers") {
      const region = isoRegion(payload.watchRegion);
      const raw = await getTmdb(apiKey, `/watch/providers/${mediaType}`, {
        language: "en-US",
        watch_region: region || undefined,
      });
      return Response.json(mapProviderList(raw));
    }

    if (action === "providerRegions") {
      return Response.json(mapProviderRegions(await getTmdb(apiKey, "/watch/providers/regions", { language: "en-US" })));
    }

    if (action === "title") {
      if (!titleId) return Response.json({ error: "A valid title id is required" }, { status: 400 });
      const raw = await getTmdb(apiKey, `/${mediaType}/${titleId}`, { append_to_response: "credits,videos" });
      return Response.json(mapTitle(raw, mediaType));
    }

    if (action === "season") {
      if (!titleId) return Response.json({ error: "A valid title id is required" }, { status: 400 });
      const seasonNumber = toInt(payload.seasonNumber, 0, 100, 0);
      return Response.json(await getTmdb(apiKey, `/tv/${titleId}/season/${seasonNumber}`).then(mapSeason));
    }

    if (action === "recommendations") {
      if (!titleId) return Response.json({ error: "A valid title id is required" }, { status: 400 });
      const raw = await getTmdb(apiKey, `/${mediaType}/${titleId}/recommendations`, { page: 1 });
      return Response.json(mapPage(raw, mediaType));
    }

    if (action === "titleProviders") {
      if (!titleId) return Response.json({ error: "A valid title id is required" }, { status: 400 });
      return Response.json(mapTitleProviders(await getTmdb(apiKey, `/${mediaType}/${titleId}/watch/providers`)));
    }

    return Response.json({ error: "Unknown action" }, { status: 400 });
  } catch (error) {
    const status = error instanceof TmdbError ? (error.status === 404 ? 404 : error.status === 503 ? 503 : 502) : 502;
    return Response.json({ error: error.message }, { status });
  }
}