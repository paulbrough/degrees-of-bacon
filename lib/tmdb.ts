import type {
  TMDBSearchMultiResponse,
  TMDBMovieDetail,
  TMDBTvDetail,
  TMDBPersonDetail,
  TMDBTrendingResponse,
  TMDBSeasonDetail,
  TMDBEpisodeDetail,
} from "@/lib/types/tmdb";

const TMDB_BASE = "https://api.themoviedb.org/3";

async function tmdbFetch<T>(path: string, params?: Record<string, string>): Promise<T> {
  const url = new URL(`${TMDB_BASE}${path}`);
  if (params) {
    for (const [key, value] of Object.entries(params)) {
      url.searchParams.set(key, value);
    }
  }

  const res = await fetch(url.toString(), {
    headers: {
      Authorization: `Bearer ${process.env.TMDB_API_READ_TOKEN}`,
      "Content-Type": "application/json;charset=utf-8",
    },
    next: { revalidate: 0 }, // We handle caching ourselves via Prisma
  });

  if (!res.ok) {
    throw new Error(`TMDB API error: ${res.status} ${res.statusText} for ${path}`);
  }

  return res.json() as Promise<T>;
}

export async function searchMulti(query: string, page = 1): Promise<TMDBSearchMultiResponse> {
  return tmdbFetch<TMDBSearchMultiResponse>("/search/multi", {
    query,
    page: String(page),
    include_adult: "false",
  });
}

export async function getMovie(id: number): Promise<TMDBMovieDetail> {
  return tmdbFetch<TMDBMovieDetail>(`/movie/${id}`, {
    append_to_response: "credits,images,recommendations,similar",
  });
}

export async function getTv(id: number): Promise<TMDBTvDetail> {
  return tmdbFetch<TMDBTvDetail>(`/tv/${id}`, {
    append_to_response: "credits,aggregate_credits,images,recommendations,similar,external_ids",
  });
}

export async function getPerson(id: number): Promise<TMDBPersonDetail> {
  return tmdbFetch<TMDBPersonDetail>(`/person/${id}`, {
    append_to_response: "combined_credits,images,tagged_images",
  });
}

export async function getTrending(
  timeWindow: "day" | "week" = "week"
): Promise<TMDBTrendingResponse> {
  return tmdbFetch<TMDBTrendingResponse>(`/trending/all/${timeWindow}`);
}

export async function getPopular(
  mediaType: "movie" | "tv"
): Promise<TMDBTrendingResponse> {
  return tmdbFetch<TMDBTrendingResponse>(`/${mediaType}/popular`);
}

export async function getTvSeason(tvId: number, seasonNumber: number): Promise<TMDBSeasonDetail> {
  return tmdbFetch<TMDBSeasonDetail>(`/tv/${tvId}/season/${seasonNumber}`);
}

export async function getTvEpisode(
  tvId: number,
  seasonNumber: number,
  episodeNumber: number
): Promise<TMDBEpisodeDetail> {
  return tmdbFetch<TMDBEpisodeDetail>(
    `/tv/${tvId}/season/${seasonNumber}/episode/${episodeNumber}`,
    { append_to_response: "credits,images" }
  );
}

export async function getRecommendationsFor(
  tmdbId: number,
  mediaType: "movie" | "tv"
): Promise<TMDBTrendingResponse> {
  return tmdbFetch<TMDBTrendingResponse>(`/${mediaType}/${tmdbId}/recommendations`);
}
