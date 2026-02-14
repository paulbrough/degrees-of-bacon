import { getMovie, getTv, getPerson } from "@/lib/tmdb";
import { getCachedProduction, cacheProduction, getCachedPerson, cachePerson } from "@/lib/cache";
import type { TMDBMovieDetail, TMDBTvDetail, TMDBPersonDetail } from "@/lib/types/tmdb";

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
