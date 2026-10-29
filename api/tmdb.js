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

function respond(res, payload, status = 200) {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.end(JSON.stringify(payload));
}

async function readBody(req) {
  if (req.body && typeof req.body === "object") return req.body;
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  const raw = Buffer.concat(chunks).toString("utf8");
  return raw ? JSON.parse(raw) : {};
}

export default async function (req, res) {
  let payload;
  try {
    payload = await readBody(req);
  } catch {
    return respond(res, { error: "Invalid request body" }, 400);
  }

  const action = toText(payload && payload.action, 40);
  if (!action) return respond(res, { error: "action is required" }, 400);

  if (action === "animeLookup") {
    try {
      return respond(res, await lookupAnime(toText(payload.title, 160)));
    } catch (error) {
      return respond(res, { error: error.message }, 502);
    }
  }

  const apiKey = process.env.TMDB_API_KEY;
  if (!apiKey) return respond(res, { error: "TMDb API key is not configured." }, 503);

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
      return respond(res, mapPage(raw, mediaType));
    }

    if (action === "trending") {
      const type = ["all", "movie", "tv"].includes(payload.mediaType) ? payload.mediaType : "all";
      const window = payload.timeWindow === "day" ? "day" : "week";
      const raw = await getTmdb(apiKey, `/trending/${type}/${window}`, { page });
      return respond(res, mapPage(raw));
    }

    if (action === "today") {
      const date = isoDate(payload.date);
      if (!date) return respond(res, { error: "A valid date is required" }, 400);
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
      return respond(res, { page: 1, totalPages: 1, totalResults: results.length, results });
    }

    if (action === "search") {
      const query = toText(payload.query, 120);
      if (!query) return respond(res, { error: "Enter a title to search." }, 400);
      const raw = await getTmdb(apiKey, "/search/multi", { query, page, include_adult: "false" });
      return respond(res, mapPage(raw));
    }

    if (action === "providers") {
      const region = isoRegion(payload.watchRegion);
      const raw = await getTmdb(apiKey, `/watch/providers/${mediaType}`, {
        language: "en-US",
        watch_region: region || undefined,
      });
      return respond(res, mapProviderList(raw));
    }

    if (action === "providerRegions") {
      return respond(res, mapProviderRegions(await getTmdb(apiKey, "/watch/providers/regions", { language: "en-US" })));
    }

    if (action === "title") {
      if (!titleId) return respond(res, { error: "A valid title id is required" }, 400);
      const raw = await getTmdb(apiKey, `/${mediaType}/${titleId}`, { append_to_response: "credits,videos" });
      return respond(res, mapTitle(raw, mediaType));
    }

    if (action === "season") {
      if (!titleId) return respond(res, { error: "A valid title id is required" }, 400);
      const seasonNumber = toInt(payload.seasonNumber, 0, 100, 0);
      return respond(res, await getTmdb(apiKey, `/tv/${titleId}/season/${seasonNumber}`).then(mapSeason));
    }

    if (action === "recommendations") {
      if (!titleId) return respond(res, { error: "A valid title id is required" }, 400);
      const raw = await getTmdb(apiKey, `/${mediaType}/${titleId}/recommendations`, { page: 1 });
      return respond(res, mapPage(raw, mediaType));
    }

    if (action === "titleProviders") {
      if (!titleId) return respond(res, { error: "A valid title id is required" }, 400);
      return respond(res, mapTitleProviders(await getTmdb(apiKey, `/${mediaType}/${titleId}/watch/providers`)));
    }

    return respond(res, { error: "Unknown action" }, 400);
  } catch (error) {
    const status = error instanceof TmdbError ? (error.status === 404 ? 404 : error.status === 503 ? 503 : 502) : 502;
    return respond(res, { error: error.message }, status);
  }
}
