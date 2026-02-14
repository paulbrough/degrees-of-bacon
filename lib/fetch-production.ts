import { getMovie, getTv, getPerson, getTvSeason } from "@/lib/tmdb";
import { getCachedProduction, cacheProduction, getCachedPerson, cachePerson, getCachedSeasons, cacheSeasons } from "@/lib/cache";
import type { TMDBMovieDetail, TMDBTvDetail, TMDBPersonDetail, TMDBSeasonDetail } from "@/lib/types/tmdb";

export async function fetchMovie(tmdbId: number): Promise<TMDBMovieDetail> {
  const cached = await getCachedProduction(tmdbId, "movie");
  if (cached && !cached.isStale) {
    return cached.data as TMDBMovieDetail;
  }

  if (cached?.isStale) {
    // Return stale, refresh in background
    getMovie(tmdbId).then((fresh) => cacheProduction(tmdbId, "movie", fresh)).catch(() => {});
    return cached.data as TMDBMovieDetail;
  }

  const data = await getMovie(tmdbId);
  await cacheProduction(tmdbId, "movie", data);
  return data;
}

export async function fetchTv(tmdbId: number): Promise<TMDBTvDetail> {
  const cached = await getCachedProduction(tmdbId, "tv");
  if (cached && !cached.isStale) {
    return cached.data as TMDBTvDetail;
  }

  if (cached?.isStale) {
    getTv(tmdbId).then((fresh) => cacheProduction(tmdbId, "tv", fresh)).catch(() => {});
    return cached.data as TMDBTvDetail;
  }

  const data = await getTv(tmdbId);
  await cacheProduction(tmdbId, "tv", data);
  return data;
}

export async function fetchPerson(tmdbId: number): Promise<TMDBPersonDetail> {
  const cached = await getCachedPerson(tmdbId);
  if (cached && !cached.isStale) {
    return cached.data;
  }

  if (cached?.isStale) {
    getPerson(tmdbId).then((fresh) => cachePerson(tmdbId, fresh)).catch(() => {});
    return cached.data;
  }

  const data = await getPerson(tmdbId);
  await cachePerson(tmdbId, data);
  return data;
}

export async function fetchTvSeasons(
  tvId: number,
  seasonNumbers: number[]
): Promise<TMDBSeasonDetail[]> {
  const cached = await getCachedSeasons(tvId);
  if (cached && !cached.isStale) {
    return cached.data;
  }

  if (cached?.isStale) {
    // Return stale, refresh in background
    fetchSeasonsFromTmdb(tvId, seasonNumbers)
      .then((fresh) => cacheSeasons(tvId, fresh))
      .catch(() => {});
    return cached.data;
  }

  const data = await fetchSeasonsFromTmdb(tvId, seasonNumbers);
  await cacheSeasons(tvId, data);
  return data;
}

async function fetchSeasonsFromTmdb(
  tvId: number,
  seasonNumbers: number[]
): Promise<TMDBSeasonDetail[]> {
  const results: TMDBSeasonDetail[] = [];
  const batchSize = 10;

  for (let i = 0; i < seasonNumbers.length; i += batchSize) {
    const batch = seasonNumbers.slice(i, i + batchSize);
    const fetched = await Promise.all(
      batch.map((num) => getTvSeason(tvId, num))
    );
    results.push(...fetched);
  }

  return results;
}
