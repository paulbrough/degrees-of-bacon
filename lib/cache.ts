import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";
import type { TMDBMovieDetail, TMDBTvDetail, TMDBPersonDetail, TMDBSeasonDetail, TMDBEpisodeDetail } from "@/lib/types/tmdb";

const PRODUCTION_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days
const PERSON_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days
const RATING_TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

interface CacheResult<T> {
  data: T;
  isStale: boolean;
}

function isStale(cachedAt: Date, ttlMs: number): boolean {
  return Date.now() - cachedAt.getTime() > ttlMs;
}

// --- Production Cache ---

export async function getCachedProduction(
  tmdbId: number,
  mediaType: "movie" | "tv"
): Promise<CacheResult<TMDBMovieDetail | TMDBTvDetail> | null> {
  const cached = await prisma.cachedProduction.findUnique({
    where: { tmdbId_mediaType: { tmdbId, mediaType } },
  });

  if (!cached) return null;

  return {
    data: cached.data as unknown as TMDBMovieDetail | TMDBTvDetail,
    isStale: isStale(cached.cachedAt, PRODUCTION_TTL_MS),
  };
}

export async function cacheProduction(
  tmdbId: number,
  mediaType: "movie" | "tv",
  data: TMDBMovieDetail | TMDBTvDetail
): Promise<void> {
  await prisma.cachedProduction.upsert({
    where: { tmdbId_mediaType: { tmdbId, mediaType } },
    update: { data: data as unknown as Prisma.InputJsonValue, cachedAt: new Date() },
    create: {
      tmdbId,
      mediaType,
      data: data as unknown as Prisma.InputJsonValue,
      cachedAt: new Date(),
    },
  });
}

export async function getCachedImdbRating(
  tmdbId: number,
  mediaType: "movie" | "tv"
): Promise<{ rating: number | null; isStale: boolean } | null> {
  const cached = await prisma.cachedProduction.findUnique({
    where: { tmdbId_mediaType: { tmdbId, mediaType } },
    select: { imdbRating: true, cachedAt: true },
  });

  if (!cached || cached.imdbRating === null) return null;

  return {
    rating: cached.imdbRating,
    isStale: isStale(cached.cachedAt, RATING_TTL_MS),
  };
}

export async function updateCachedRating(
  tmdbId: number,
  mediaType: "movie" | "tv",
  imdbRating: number | null
): Promise<void> {
  await prisma.cachedProduction.updateMany({
    where: { tmdbId, mediaType },
    data: { imdbRating },
  });
}

// --- Seasons Cache ---

export async function getCachedSeasons(
  tvId: number
): Promise<CacheResult<TMDBSeasonDetail[]> | null> {
  const cached = await prisma.cachedProduction.findUnique({
    where: { tmdbId_mediaType: { tmdbId: tvId, mediaType: "tv-seasons" } },
  });

  if (!cached) return null;

  return {
    data: cached.data as unknown as TMDBSeasonDetail[],
    isStale: isStale(cached.cachedAt, PRODUCTION_TTL_MS),
  };
}

export async function cacheSeasons(
  tvId: number,
  data: TMDBSeasonDetail[]
): Promise<void> {
  await prisma.cachedProduction.upsert({
    where: { tmdbId_mediaType: { tmdbId: tvId, mediaType: "tv-seasons" } },
    update: { data: data as unknown as Prisma.InputJsonValue, cachedAt: new Date() },
    create: {
      tmdbId: tvId,
      mediaType: "tv-seasons",
      data: data as unknown as Prisma.InputJsonValue,
      cachedAt: new Date(),
    },
  });
}

// --- Episode Cache ---

export async function getCachedEpisode(
  tvId: number,
  seasonNumber: number,
  episodeNumber: number
): Promise<CacheResult<TMDBEpisodeDetail> | null> {
  const mediaType = `tv-episode-S${seasonNumber}E${episodeNumber}`;
  const cached = await prisma.cachedProduction.findUnique({
    where: { tmdbId_mediaType: { tmdbId: tvId, mediaType } },
  });

  if (!cached) return null;

  return {
    data: cached.data as unknown as TMDBEpisodeDetail,
    isStale: isStale(cached.cachedAt, PRODUCTION_TTL_MS),
  };
}

export async function cacheEpisode(
  tvId: number,
  seasonNumber: number,
  episodeNumber: number,
  data: TMDBEpisodeDetail
): Promise<void> {
  const mediaType = `tv-episode-S${seasonNumber}E${episodeNumber}`;
  await prisma.cachedProduction.upsert({
    where: { tmdbId_mediaType: { tmdbId: tvId, mediaType } },
    update: { data: data as unknown as Prisma.InputJsonValue, cachedAt: new Date() },
    create: {
      tmdbId: tvId,
      mediaType,
      data: data as unknown as Prisma.InputJsonValue,
      cachedAt: new Date(),
    },
  });
}

// --- Person Cache ---

export async function getCachedPerson(
  tmdbId: number
): Promise<CacheResult<TMDBPersonDetail> | null> {
  const cached = await prisma.cachedPerson.findUnique({
    where: { tmdbId },
  });

  if (!cached) return null;

  return {
    data: cached.data as unknown as TMDBPersonDetail,
    isStale: isStale(cached.cachedAt, PERSON_TTL_MS),
  };
}

export async function cachePerson(
  tmdbId: number,
  data: TMDBPersonDetail
): Promise<void> {
  await prisma.cachedPerson.upsert({
    where: { tmdbId },
    update: { data: data as unknown as Prisma.InputJsonValue, cachedAt: new Date() },
    create: {
      tmdbId,
      data: data as unknown as Prisma.InputJsonValue,
      cachedAt: new Date(),
    },
  });
}
